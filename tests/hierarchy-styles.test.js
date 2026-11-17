// Jerarquía de los controles (jerarquia-de-botones D1 y D2): los tokens de la acción principal, la opción
// elegida y la salida encendida tienen contraste suficiente, y el relleno del color de acción queda
// reservado a la acción principal en styles/app.css.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = readFileSync(resolve(root, 'styles/tokens.css'), 'utf8');
const app = readFileSync(resolve(root, 'styles/app.css'), 'utf8');

/** Contraste de WCAG 2, como en control-contrast.test.js (copiado para no volver a correr esas pruebas). */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function token(name) {
  const m = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\b`));
  assert.ok(m, `falta --${name} en styles/tokens.css`);
  return m[1].toLowerCase();
}

test('texto sobre la acción principal, la opción elegida y la salida encendida: 4,5:1 o más', () => {
  const pairs = [['color-on-action', 'color-action'], ['color-text', 'color-selected-bg'], ['color-on-output', 'color-output-on']];
  for (const [text, bg] of pairs) {
    const c = contrast(token(text), token(bg));
    assert.ok(c >= 4.5, `--${text} sobre --${bg}: ${c.toFixed(2)}:1`);
  }
});

test('contorno de una opción elegida: 3:1 o más sobre el fondo, el panel y las tarjetas', () => {
  for (const surface of ['color-bg', 'color-surface', 'color-surface-2']) {
    const c = contrast(token('color-selected-border'), token(surface));
    assert.ok(c >= 3, `--color-selected-border sobre --${surface}: ${c.toFixed(2)}:1`);
  }
});

test('el fondo de una opción elegida se distingue de --color-surface-2, también en luminancia', () => {
  assert.notEqual(token('color-selected-bg'), token('color-surface-2'));
  // En escala de grises solo queda la luminancia: que la diferencia no sea imperceptible.
  const c = contrast(token('color-selected-bg'), token('color-surface-2'));
  assert.ok(c >= 1.3, `--color-selected-bg contra --color-surface-2: ${c.toFixed(2)}:1`);
});

test('una salida encendida se distingue de una apagada sin depender del color', () => {
  // Relleno: más claro que el fondo de una apagada; contorno blanco de 2 px y negrita (en app.css).
  const c = contrast(token('color-output-on'), token('color-surface-2'));
  assert.ok(c >= 2, `--color-output-on contra --color-surface-2: ${c.toFixed(2)}:1`);
  assert.equal(token('color-output-on-border'), token('color-neuron-active'), 'el contorno es el blanco de la neurona activa');
  const rule = app.slice(app.indexOf('.action-key[data-on="true"] {'));
  assert.match(rule.slice(0, rule.indexOf('}')), /font-weight:\s*700/);
});

/** Reglas de app.css como [selectores, cuerpo], sin comentarios. Las reglas de @media quedan aplanadas. */
function rules(css) {
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(clean))) out.push([m[1].trim().replace(/^@media[^{]*\{/, '').trim(), m[2]]);
  return out;
}

test('el relleno del color de acción solo aparece en reglas de .tool.primary', () => {
  const found = rules(app).filter(([, body]) => /background(-color)?\s*:[^;]*var\(--color-action\)/.test(body));
  assert.ok(found.length > 0, 'ninguna regla rellena con --color-action');
  for (const [selectors] of found) {
    for (const sel of selectors.split(',').map((s) => s.trim())) {
      assert.match(sel, /\.tool\.primary/, `"${sel}" rellena con --color-action`);
    }
  }
});

test('ningún control se rellena con --color-accent: queda para el foco, la pestaña elegida y los enlaces', () => {
  const found = rules(app).filter(([, body]) => /background(-color)?\s*:\s*var\(--color-accent\)/.test(body));
  // Lo que queda son marcas que no son controles: el divisor al arrastrar, el punto de pendiente y la barra de misión.
  for (const [selectors] of found) {
    assert.doesNotMatch(selectors, /\.tool|\.segment|\.lang-option|\.camera-button|\.switch|\.action-key|knob-switch|compete-check|curve-chip|bar-track/,
      `"${selectors}" rellena un control con --color-accent`);
  }
});
