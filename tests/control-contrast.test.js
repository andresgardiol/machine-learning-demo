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

test('tarjeta de consigna (tarjeta-de-consigna D9): el contorno de los controles da 3:1 o más sobre su fondo', () => {
  const c = contrast(token('color-control-border'), token('color-card-bg'));
  assert.ok(c >= 3, `--color-control-border sobre --color-card-bg: ${c.toFixed(2)}:1`);
  // El texto atenuado de la misión y el de la consigna siguen legibles sobre ese fondo.
  assert.ok(contrast(token('color-text-muted'), token('color-card-bg')) >= 4.5);
  assert.ok(contrast(token('color-text'), token('color-card-bg')) >= 4.5);
  // La barra lateral no es del color de la acción principal.
  assert.notEqual(token('color-card-bar').toLowerCase(), token('color-action').toLowerCase());
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

test('anillo de "Mostrame" (misiones-que-muestran-el-control D3; sistema-de-diseno-base 4.7): 3:1 o más, color de "vos" y más grueso que el foco', () => {
  const reveal = token('color-reveal');
  for (const surface of ['color-bg', 'color-surface', 'color-surface-2', 'color-card-bg']) {
    const c = contrast(reveal, token(surface));
    assert.ok(c >= 3, `--color-reveal sobre --${surface}: ${c.toFixed(2)}:1`);
  }
  // Es el color de "vos" (decisión del dueño, 18 de noviembre de 2026): se distingue del foco por la forma.
  assert.equal(reveal.toLowerCase(), token('color-role-you').toLowerCase());
  const ring = app.match(/\[data-revealed="true"\][^{]*\{[^}]*box-shadow:\s*0 0 0 (\d+)px var\(--color-bg\), 0 0 0 (\d+)px var\(--color-reveal\)/);
  assert.ok(ring, 'anillo doble con un hueco');
  const focus = app.match(/button:focus-visible[^{]*\{[^}]*outline:\s*(\d+)px solid var\(--color-accent\)/);
  assert.ok(Number(ring[2]) - Number(ring[1]) > Number(focus[1]), `anillo de ${ring[2] - ring[1]} px contra foco de ${focus[1]} px`);
  // El anillo usa el token en styles/app.css.
  assert.match(app, /\[data-revealed="true"\][^{]*\{[^}]*var\(--color-reveal\)/);
});
