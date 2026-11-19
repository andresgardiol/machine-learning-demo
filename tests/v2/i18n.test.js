import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import es from '../../src/v2/i18n/es.js';
import en from '../../src/v2/i18n/en.js';

const v2Dir = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', 'src', 'v2');
const listJs = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? (n === 'i18n' ? [] : listJs(p)) : p.endsWith('.js') ? [p] : [];
});
const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1');
const sources = listJs(v2Dir).map((f) => ({ file: relative(v2Dir, f), src: stripComments(readFileSync(f, 'utf8')) }));
const LETRAS_RE = /[A-Za-zÁÉÍÓÚáéíóúÑñ]{2,}/;
// Solo la parte literal: lo que va dentro de ${…} sale de los diccionarios o de datos.
const LETRAS = { test: (t) => LETRAS_RE.test(t.replace(/\$\{[^}]*\}/g, '')) };

test('v2/i18n: las mismas claves en español y en inglés, sin textos vacíos y con los mismos parámetros', () => {
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
  for (const k of Object.keys(es)) {
    assert.ok(es[k].trim() && en[k].trim(), `texto vacío: ${k}`);
    const params = (t) => [...t.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join();
    assert.equal(params(es[k]), params(en[k]), `parámetros distintos en ${k}`);
  }
});

test('v2/i18n: cada clave fija que usa el código existe, y cada tooltip tiene qué hace y por qué importa', () => {
  const faltan = [];
  for (const { file, src } of sources) {
    for (const m of src.matchAll(/\b(?:i18n|helpTitle|labelKey):\s*'([^'$]+)'/g)) if (!(m[1] in es)) faltan.push(`${file}: ${m[1]}`);
    for (const m of src.matchAll(/\bi18nAttr:\s*'([^']+)'/g)) for (const pair of m[1].split(';')) { const k = pair.split(':')[1]?.trim(); if (k && !k.includes('$') && !(k in es)) faltan.push(`${file}: ${k}`); }
    for (const m of src.matchAll(/\bhelp:\s*'([^'$]+)'/g)) for (const part of ['what', 'why']) if (!(`help.${m[1]}.${part}` in es)) faltan.push(`${file}: help.${m[1]}.${part}`);
    for (const m of src.matchAll(/\bt\(\s*'([^'$]+)'/g)) if (!(m[1] in es)) faltan.push(`${file}: ${m[1]}`);
  }
  assert.deepEqual(faltan, []);
});

test('v2/i18n: ningún texto visible está fijo en el código de src/v2', () => {
  const fijos = [];
  for (const { file, src } of sources) {
    for (const m of src.matchAll(/\btext:\s*(['"`])([^'"`]*)\1/g)) if (LETRAS.test(m[2])) fijos.push(`${file}: text "${m[2]}"`);
    for (const m of src.matchAll(/\.textContent\s*=\s*(['"`])([^'"`]*)\1/g)) if (LETRAS.test(m[2])) fijos.push(`${file}: textContent "${m[2]}"`);
    // Hijos literales de el(...): el('span', {...}, 'Texto').
    for (const m of src.matchAll(/\bel\(\s*'[a-z0-9]+'\s*,\s*\{[^{}]*\}\s*,\s*'([^']*)'/g)) if (LETRAS.test(m[1]) && !/^V\d$/.test(m[1])) fijos.push(`${file}: hijo "${m[1]}"`);
  }
  assert.deepEqual(fijos, []);
});
