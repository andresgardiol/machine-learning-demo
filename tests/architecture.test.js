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
