import test from 'node:test';
import assert from 'node:assert/strict';
import { PANEL_WIDTH, clampPanelWidth, maxPanelWidth } from '../src/ui/layout.js';

test('panel: 360 px por defecto, mínimo 300 y como mucho la mitad de la ventana', () => {
  assert.equal(PANEL_WIDTH.default, 360);
  assert.equal(clampPanelWidth(200, 1600), 300);
  assert.equal(clampPanelWidth(1200, 1600), 800);
  assert.equal(clampPanelWidth(512.4, 1600), 512);
});

test('panel: en una ventana chica el máximo nunca baja del mínimo', () => {
  assert.equal(maxPanelWidth(600), 300);
  assert.equal(maxPanelWidth(500), 300);
  assert.equal(clampPanelWidth(360, 600), 300);
});

test('panel: un valor inválido usa el ancho por defecto', () => {
  assert.equal(clampPanelWidth(undefined, 1600), 360);
  assert.equal(clampPanelWidth('ancho', 1600), 360);
});
