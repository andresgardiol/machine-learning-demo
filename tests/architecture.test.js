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
