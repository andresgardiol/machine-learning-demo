import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const coreDir = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'core');

const FORBIDDEN = [
  ['document', /\bdocument\b/],
  ['window', /\bwindow\b/],
  ['Math.random', /\bMath\s*\.\s*random\b/],
  ['Date.now', /\bDate\s*\.\s*now\b/],
  ['performance.now', /\bperformance\s*\.\s*now\b/],
];

function listJs(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? listJs(p) : p.endsWith('.js') ? [p] : [];
  });
}

// Quita comentarios para no marcar menciones en texto explicativo.
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
}

export function findViolations(dir = coreDir) {
  const problems = [];
  for (const file of listJs(dir)) {
    const rel = relative(dir, file);
    const src = stripComments(readFileSync(file, 'utf8'));
    for (const [name, re] of FORBIDDEN) {
      if (re.test(src)) problems.push(`${rel}: usa ${name}`);
    }
    const specifiers = [
      ...src.matchAll(/\bimport\s+(?:[^'"();]*?\sfrom\s*)?['"]([^'"]+)['"]/g),
      ...src.matchAll(/\bexport\s+[^'"();]*?\sfrom\s*['"]([^'"]+)['"]/g),
      ...src.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]/g),
    ].map((m) => m[1]);
    for (const spec of specifiers) {
      const target = spec.startsWith('.') ? resolve(dirname(file), spec) : null;
      if (target === null || !(target === dir || target.startsWith(dir + sep))) {
        problems.push(`${rel}: importa fuera de core (${spec})`);
      }
    }
  }
  return problems;
}

test('src/core no usa APIs del navegador, azar ni reloj, ni importa fuera de core', () => {
  assert.deepEqual(findViolations(), []);
});

// ---------------------------------------------------------------------------------------------
// V2 (interfaz-v2, design.md D5). Tres reglas:
//   1. ningún archivo fuera de src/v2 importa de src/v2;
//   2. src/v2 importa de src/core, src/data, src/render y src/input; de src/ui y src/tabs, solo módulos
//      que (ellos y lo que importan dentro de src/ui y src/tabs) no usan document ni window;
//   3. el núcleo sigue sin DOM (la prueba de arriba).
// Excepción justificada: src/ui/loop.js recibe el documento como parámetro con valor por defecto
// (`doc = globalThis.document`) solo para pausar con la pestaña oculta; no arma pantalla (design.md D8).
const srcDir = resolve(coreDir, '..');
const v2Dir = join(srcDir, 'v2');
const V2_PERMITIDAS = ['core', 'data', 'render', 'input', 'v2'].map((d) => join(srcDir, d));
const V2_PURAS_SI = ['ui', 'tabs'].map((d) => join(srcDir, d));
const V2_EXCEPCIONES = new Set([join(srcDir, 'ui', 'loop.js')]);

function importsOf(file) {
  const src = stripComments(readFileSync(file, 'utf8'));
  return [
    ...src.matchAll(/\bimport\s+(?:[^'"();]*?\sfrom\s*)?['"]([^'"]+)['"]/g),
    ...src.matchAll(/\bexport\s+[^'"();]*?\sfrom\s*['"]([^'"]+)['"]/g),
    ...src.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]/g),
  ].map((m) => m[1]).filter((s) => s.startsWith('.')).map((s) => resolve(dirname(file), s));
}
const dentro = (file, dir) => file === dir || file.startsWith(dir + sep);
const usaDom = (file) => /\b(document|window)\b/.test(stripComments(readFileSync(file, 'utf8')));

/** Archivos de src/ui o src/tabs con DOM alcanzables desde `file` (sin cruzar a otras carpetas). */
function domAlcanzable(file, visto = new Set()) {
  if (visto.has(file)) return [];
  visto.add(file);
  const propios = !V2_EXCEPCIONES.has(file) && usaDom(file) ? [file] : [];
  const hijos = importsOf(file).filter((t) => V2_PURAS_SI.some((d) => dentro(t, d)));
  return [...propios, ...hijos.flatMap((h) => domAlcanzable(h, visto))];
}

export function findV2Violations({ v2 = v2Dir, src = srcDir } = {}) {
  const problems = [];
  // 1. Nada fuera de src/v2 importa de src/v2.
  for (const file of listJs(src)) {
    if (dentro(file, v2)) continue;
    for (const t of importsOf(file)) if (dentro(t, v2)) problems.push(`${relative(src, file)}: importa de src/v2 (${relative(src, t)})`);
  }
  // 2. Lo que importa src/v2.
  let archivosV2 = [];
  try { archivosV2 = listJs(v2); } catch { archivosV2 = []; }
  for (const file of archivosV2) {
    for (const t of importsOf(file)) {
      if (V2_PERMITIDAS.some((d) => dentro(t, d))) continue;
      if (V2_PURAS_SI.some((d) => dentro(t, d))) {
        for (const d of domAlcanzable(t)) problems.push(`${relative(src, file)}: importa ${relative(src, t)}, que usa el DOM (${relative(src, d)})`);
        continue;
      }
      problems.push(`${relative(src, file)}: importa de una carpeta no permitida (${relative(src, t)})`);
    }
  }
  return problems;
}

test('V2: nada fuera de src/v2 importa de src/v2, y src/v2 solo importa módulos sin DOM de src/ui y src/tabs', () => {
  assert.deepEqual(findV2Violations(), []);
});

test('V2: el núcleo sigue sin DOM con la V2 agregada', () => {
  assert.deepEqual(findViolations(), []);
});

// ---------------------------------------------------------------------------------------------
// Fuentes del repositorio para las reglas de la teoría: los .js y .mjs (salvo node_modules, .git, borradores,
// openspec y tests) y los módulos de los .html (<script src> e import dentro de <script>).
const rootDir = resolve(srcDir, '..');
const SALTEAR = new Set(['node_modules', '.git', '.claude', 'borradores', 'openspec', 'tests']);

function listarFuentes(dir) {
  return readdirSync(dir).flatMap((name) => {
    if (SALTEAR.has(name)) return [];
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return listarFuentes(p);
    return /\.(m?js|html)$/.test(name) ? [p] : [];
  });
}

function referenciasDe(file, root) {
  const texto = readFileSync(file, 'utf8');
  if (!file.endsWith('.html')) return importsOf(file);
  const srcs = [...texto.matchAll(/<script\b[^>]*\bsrc\s*=\s*['"]([^'"]+)['"]/gi)].map((m) => m[1]);
  const dentroDeScripts = [...texto.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)].flatMap((m) => {
    const src = stripComments(m[1]);
    return [
      ...src.matchAll(/\bimport\s+(?:[^'"();]*?\sfrom\s*)?['"]([^'"]+)['"]/g),
      ...src.matchAll(/\bimport\s*\(\s*['"]([^'"]+)['"]/g),
    ].map((x) => x[1]);
  });
  return [...srcs, ...dentroDeScripts]
    .filter((s) => !/^[a-z]+:/i.test(s))
    .map((s) => (s.startsWith('/') ? join(root, s) : resolve(dirname(file), s)));
}

// ---------------------------------------------------------------------------------------------
// Teoría (seccion-teoria D2). Tres reglas:
//   1. nada fuera de src/teoria/ (y de su página, teoria/index.html) importa de src/teoria/;
//   2. src/teoria/ importa solo de sí misma, de src/core, de src/render y de módulos de src/ui que (ellos
//      y lo que importan dentro de src/ui) no usan document ni window;
//   3. las cuentas, los guiones, el contenido y los módulos de estado, rutas, idioma y carga no usan DOM.
const teoriaDir = join(srcDir, 'teoria');
const paginaTeoria = join(rootDir, 'teoria');
const TEORIA_PERMITIDAS = ['core', 'render', 'teoria'].map((d) => join(srcDir, d));
const uiDir = join(srcDir, 'ui');
const TEORIA_SIN_DOM = /(^|\/)(cuenta|guion|estado-figura|rutas|idioma|cargar|hitos|indice)\.js$|(^|\/)contenido\//;

/**
 * ¿Usa el DOM el código (sin comentarios ni textos entre comillas)? En la teoría los textos dicen, por
 * ejemplo, "document recognition" en una cita: eso no es usar el DOM.
 */
const sinTextos = (src) => src.replace(/'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"|`(?:[^`\\]|\\.)*`/g, "''");
const usaDomEnCodigo = (file) => /\b(document|window)\b/.test(sinTextos(stripComments(readFileSync(file, 'utf8'))));

/** Archivos de src/ui con DOM alcanzables desde `file` sin salir de src/ui. */
function domEnUi(file, visto = new Set()) {
  if (visto.has(file)) return [];
  visto.add(file);
  const propios = usaDom(file) ? [file] : [];
  return [...propios, ...importsOf(file).filter((t) => dentro(t, uiDir)).flatMap((t) => domEnUi(t, visto))];
}

export function findTeoriaViolations({ root = rootDir, teoria = teoriaDir, pagina = paginaTeoria } = {}) {
  const problems = [];
  // 1. Nada de afuera importa de la teoría.
  for (const file of listarFuentes(root)) {
    if (dentro(file, teoria) || dentro(file, pagina)) continue;
    for (const t of referenciasDe(file, root)) {
      if (dentro(t, teoria)) problems.push(`${relative(root, file)}: importa de src/teoria/ (${relative(root, t)})`);
    }
  }
  let archivos = [];
  try { archivos = listJs(teoria); } catch { archivos = []; }
  for (const file of archivos) {
    const rel = relative(teoria, file).split(sep).join('/');
    // 2. Lo que importa la teoría.
    for (const t of importsOf(file)) {
      if (TEORIA_PERMITIDAS.some((d) => dentro(t, d))) continue;
      if (dentro(t, uiDir)) {
        for (const d of domEnUi(t)) problems.push(`src/teoria/${rel}: importa ${relative(root, t)}, que usa el DOM (${relative(root, d)})`);
        continue;
      }
      problems.push(`src/teoria/${rel}: importa de una carpeta no permitida (${relative(root, t)})`);
    }
    // 3. Lo que no usa DOM, ni directamente ni por lo que importa dentro de la teoría.
    if (TEORIA_SIN_DOM.test(rel)) {
      const pendientes = [file];
      const visto = new Set();
      while (pendientes.length) {
        const f = pendientes.pop();
        if (visto.has(f)) continue;
        visto.add(f);
        if (usaDomEnCodigo(f)) problems.push(`src/teoria/${rel}: usa el DOM (${relative(root, f)})`);
        pendientes.push(...importsOf(f).filter((t) => dentro(t, teoria)));
      }
    }
  }
  return problems;
}

test('Teoría: nada de afuera importa de src/teoria/, y la teoría importa del núcleo, del dibujo y de src/ui sin DOM', () => {
  assert.deepEqual(findTeoriaViolations(), []);
});

test('Teoría: la regla encuentra lo que tiene que encontrar', () => {
  // La página de la teoría es la única de afuera que la carga; las cuentas y el estado no tocan el DOM.
  const fuentes = listarFuentes(rootDir).map((f) => relative(rootDir, f).split(sep).join('/'));
  assert.ok(fuentes.includes('teoria/index.html'));
  assert.ok(referenciasDe(join(paginaTeoria, 'index.html'), rootDir).some((t) => dentro(t, teoriaDir)));
  for (const f of ['capitulos/neurona/cuenta.js', 'capitulos/programar/cuenta.js', 'capitulos/xor/cuenta.js', 'estado-figura.js', 'rutas.js']) {
    assert.ok(TEORIA_SIN_DOM.test(f), f);
    assert.equal(usaDom(join(teoriaDir, f)), false, f);
  }
  // Un texto entre comillas no es código; una llamada al DOM, sí.
  assert.equal(/\bdocument\b/.test(sinTextos("const t = 'document recognition'; const u = `window ${1}`;")), false);
  assert.equal(/\bdocument\b/.test(sinTextos("const e = document.createElement('p');")), true);
});
