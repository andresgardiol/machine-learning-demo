import test from 'node:test';
import assert from 'node:assert/strict';
import { placeTooltip, helpKeys, opensTooltip, WRITING_AREA_SELECTOR, pointerLeaveAction, HIDE_DELAY_MS } from '../src/ui/tooltips.js';

const viewport = { width: 1280, height: 800 };
const size = { width: 260, height: 120 };
const rect = (left, top, w, h) => ({ left, top, right: left + w, bottom: top + h });
const overlaps = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
const box = (p) => ({ left: p.left, top: p.top, right: p.left + size.width, bottom: p.top + size.height });
const inside = (b) => b.left >= 0 && b.top >= 0 && b.right <= viewport.width && b.bottom <= viewport.height;

test('control junto al borde derecho: el tooltip se ve completo y no tapa el control', () => {
  const control = rect(1240, 20, 32, 32);
  const p = placeTooltip(control, size, viewport);
  assert.equal(p.placement, 'below');
  assert.equal(p.left, viewport.width - 8 - size.width);
  assert.equal(p.top, 60);
  assert.ok(inside(box(p)));
  assert.ok(!overlaps(box(p), control));
});

test('control junto al borde inferior: el tooltip va arriba, completo y sin tapar el control', () => {
  const control = rect(600, 760, 80, 32);
  const p = placeTooltip(control, size, viewport);
  assert.equal(p.placement, 'above');
  assert.equal(p.top, 760 - 8 - size.height);
  assert.ok(inside(box(p)));
  assert.ok(!overlaps(box(p), control));
});

test('control junto al borde izquierdo: el tooltip no se sale por la izquierda', () => {
  const control = rect(0, 100, 40, 30);
  const p = placeTooltip(control, size, viewport);
  assert.equal(p.left, 8);
  assert.ok(inside(box(p)));
  assert.ok(!overlaps(box(p), control));
});

test('control alto que no deja lugar arriba ni abajo: el tooltip va al costado', () => {
  const control = rect(1000, 10, 60, 780);
  const p = placeTooltip(control, size, viewport);
  assert.equal(p.placement, 'left');
  assert.ok(inside(box(p)));
  assert.ok(!overlaps(box(p), control));
});

test('claves de ayuda en dos partes', () => {
  assert.deepEqual(helpKeys('guide'), { what: 'help.guide.what', why: 'help.guide.why' });
});

test('área de escritura: su tooltip no aparece con el cursor ni con un clic, solo al llegar con Tab', () => {
  assert.equal(WRITING_AREA_SELECTOR, 'textarea');
  assert.equal(opensTooltip({ cause: 'hover', writingArea: true, keyboard: false }), false);
  // Tras un clic, un área de escritura muestra el anillo de foco igual: no alcanza para abrirlo.
  assert.equal(opensTooltip({ cause: 'focus', writingArea: true, keyboard: false, focusVisible: true }), false);
  assert.equal(opensTooltip({ cause: 'focus', writingArea: true, keyboard: true, focusVisible: true }), true);
});

test('los demás controles: el tooltip aparece con el cursor y con el foco de teclado, no tras un clic', () => {
  assert.equal(opensTooltip({ cause: 'hover', writingArea: false, keyboard: false }), true);
  assert.equal(opensTooltip({ cause: 'focus', writingArea: false, keyboard: true, focusVisible: true }), true);
  assert.equal(opensTooltip({ cause: 'focus', writingArea: false, keyboard: false, focusVisible: false }), false);
});

// --- panel-de-entrenar-por-vistas D9: tooltip alcanzable con el cursor (WCAG 1.4.13) -------------

test('Llevar el cursor al tooltip: al salir del control se espera un momento corto; sobre el tooltip, sigue abierto', () => {
  assert.equal(pointerLeaveAction({ from: 'control', toControl: false, toTooltip: false }), 'delay');
  assert.equal(pointerLeaveAction({ from: 'control', toControl: false, toTooltip: true }), 'keep');
  assert.ok(HIDE_DELAY_MS > 0 && HIDE_DELAY_MS <= 500, `${HIDE_DELAY_MS} ms`);
});

test('Salir del tooltip: sin volver al control, se cierra ya; volviendo al control, sigue abierto', () => {
  assert.equal(pointerLeaveAction({ from: 'tooltip', toControl: false, toTooltip: false }), 'now');
  assert.equal(pointerLeaveAction({ from: 'tooltip', toControl: true, toTooltip: false }), 'keep');
});
