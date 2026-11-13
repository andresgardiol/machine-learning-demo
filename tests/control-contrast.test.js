// Límites de los controles con contraste (panel-de-entrenar-por-vistas D9, WCAG 1.4.11): lee los
// colores de styles/tokens.css y afirma que el borde de los controles se distingue con 3:1 o más
// sobre el fondo, el panel y las tarjetas, para que un cambio de paleta no lo pierda.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tokens = readFileSync(resolve(root, 'styles/tokens.css'), 'utf8');
const app = readFileSync(resolve(root, 'styles/app.css'), 'utf8');

/** Color de una variable de tokens.css (#rrggbb). */
function token(name) {
  const m = tokens.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})\\b`));
  assert.ok(m, `falta --${name} en styles/tokens.css`);
  return m[1];
}

/** Luminancia relativa de WCAG 2. */
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

test('contraste: la fórmula de WCAG da 21:1 entre blanco y negro y 1:1 entre iguales', () => {
  assert.equal(Math.round(contrast('#ffffff', '#000000') * 10) / 10, 21);
  assert.equal(contrast('#1b212a', '#1b212a'), 1);
});

test('borde de los controles: 3:1 o más sobre el panel, el fondo y las tarjetas', () => {
  const border = token('color-control-border');
  for (const surface of ['color-surface', 'color-bg', 'color-surface-2']) {
    const c = contrast(border, token(surface));
    assert.ok(c >= 3, `--color-control-border sobre --${surface}: ${c.toFixed(2)}:1`);
  }
  // Los valores calculados en design.md D9.
  assert.equal(contrast(border, token('color-surface')).toFixed(2), '4.03');
  assert.equal(contrast(border, token('color-bg')).toFixed(2), '4.52');
  assert.equal(contrast(border, token('color-surface-2')).toFixed(2), '3.51');
});

test('lo usan los campos de texto, los grupos de opciones, los interruptores y los botones con contorno', () => {
  for (const selector of ['.tool {', '.switch {', '.switch-track {', '.lang {', '.segments {', '.segment + .segment {',
    '.camera-button {', '.bar-track {', '.library-name-input, .library-rename {', '.code-editor {', '.palette-word {']) {
    const start = app.indexOf(`\n${selector}`);
    assert.ok(start >= 0, `falta la regla ${selector}`);
    const rule = app.slice(start, app.indexOf('}', start));
    assert.match(rule, /var\(--color-control-border\)/, `${selector} no usa --color-control-border`);
  }
});
