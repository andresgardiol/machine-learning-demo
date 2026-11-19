import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const css = readFileSync(resolve(raiz, 'styles/v2/tokens.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const vars = Object.fromEntries([...css.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
function resolveVar(value, seen = new Set()) {
  const m = /^var\((--[\w-]+)\)$/.exec(value);
  if (!m) return value;
  assert.ok(!seen.has(m[1]), `referencia circular en ${m[1]}`);
  seen.add(m[1]);
  assert.ok(m[1] in vars, `variable sin definir: ${m[1]}`);
  return resolveVar(vars[m[1]], seen);
}
const color = (name) => resolveVar(vars[name]);

// Las que leen los pintores de canvas de la V1 (COLOR_VARS de src/render/*.js y plane-view.js).
function paintersVars() {
  const out = new Set();
  for (const f of ['view.js', 'network-view.js', 'network-inspector.js', 'plane-view.js']) {
    const src = readFileSync(resolve(raiz, 'src/render', f), 'utf8');
    for (const m of src.matchAll(/'(--color-[\w-]+)'/g)) out.add(m[1]);
  }
  return [...out];
}
function luminance(hex) {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('v2/tokens: están todas las variables que leen los pintores de canvas', () => {
  const faltan = paintersVars().filter((v) => !(v in vars));
  assert.ok(paintersVars().length >= 41, `se esperaban al menos 41 variables, hay ${paintersVars().length}`);
  assert.deepEqual(faltan, []);
});

test('v2/tokens: los pares de texto y fondo tienen un contraste de 4,5:1 o más', () => {
  const pares = [
    ['--color-text', '--color-bg'], ['--color-text-muted', '--color-bg'], ['--color-text', '--color-surface'], ['--color-text-muted', '--color-surface'],
    ['--color-text', '--color-surface-2'], ['--color-text', '--color-cuaderno'], ['--color-text-muted', '--color-cuaderno'],
    ['--color-accion-texto', '--color-accion'], ['--tip-texto', '--tip-fondo'], ['--color-accent', '--color-bg'], ['--color-sensor', '--color-surface'],
  ];
  for (const [t, f] of pares) {
    const c = contrast(color(t), color(f));
    assert.ok(c >= 4.5, `${t} sobre ${f}: ${c.toFixed(2)}:1`);
  }
});

test('v2/tokens: la élite y la acción no comparten color (KD9)', () => {
  assert.notEqual(color('--color-elite').toLowerCase(), color('--color-accion').toLowerCase());
  assert.notEqual(color('--color-elite').toLowerCase(), color('--color-accent').toLowerCase());
});
