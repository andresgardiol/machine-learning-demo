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

// --- Tres zonas (design.md D2) ----------------------------------------------------------------
import { ZONES, layoutMode, fitZones, stageLimits, panelLimits } from '../src/ui/layout.js';

test('zonas: valores de la disposición común', () => {
  assert.equal(ZONES.stage.default, 400);
  assert.equal(ZONES.stage.min, 260);
  assert.equal(ZONES.board.min, 360);
  assert.equal(ZONES.panel.default, 360);
  assert.equal(ZONES.panel.min, 300);
  assert.equal(ZONES.splitter, 6);
  assert.equal(ZONES.wideFrom, 960);
});

test('modo: tres columnas desde 960 px, tablero debajo hasta 959 y sin tablero "plain"', () => {
  assert.equal(layoutMode(959, true), 'stacked');
  assert.equal(layoutMode(960, true), 'wide');
  assert.equal(layoutMode(800, true), 'stacked');
  assert.equal(layoutMode(1440, true), 'wide');
  assert.equal(layoutMode(1440, false), 'plain');
  assert.equal(layoutMode(800, false), 'plain');
});

test('fitZones: en 1440 con todo por defecto, 400 / 668 / 360', () => {
  assert.deepEqual(fitZones({}, 1440), { stage: 400, board: 668, panel: 360 });
  assert.deepEqual(fitZones({ stage: null, panel: null }, 1440), { stage: 400, board: 668, panel: 360 });
});

test('fitZones: ventana que se achica a 1000 cede primero el tablero y después el escenario (268 / 360 / 360)', () => {
  assert.deepEqual(fitZones({ stage: 400, panel: 360 }, 1000), { stage: 268, board: 360, panel: 360 });
});

test('fitZones: en 960 el escenario queda en su mínimo y cede el panel (260 / 360 / 328)', () => {
  assert.deepEqual(fitZones({ stage: 400, panel: 360 }, 960), { stage: 260, board: 360, panel: 328 });
});

test('fitZones: al volver a 1440 los anchos elegidos vuelven', () => {
  const chosen = { stage: 400, panel: 360 };
  fitZones(chosen, 1000);
  assert.deepEqual(fitZones(chosen, 1440), { stage: 400, board: 668, panel: 360 });
});

test('fitZones: preferencias fuera de rango o inválidas', () => {
  assert.deepEqual(fitZones({ stage: 100, panel: 100 }, 1440), { stage: 260, board: 868, panel: 300 });
  assert.deepEqual(fitZones({ stage: 5000, panel: 360 }, 1440), { stage: 708, board: 360, panel: 360 });
  assert.deepEqual(fitZones({ stage: 400, panel: 5000 }, 1440), { stage: 348, board: 360, panel: 720 });
  assert.deepEqual(fitZones({ stage: 'ancho', panel: Number.NaN }, 1440), { stage: 400, board: 668, panel: 360 });
  assert.deepEqual(fitZones({ stage: 412.6, panel: 359.4 }, 1440), { stage: 413, board: 656, panel: 359 });
});

test('límites del panel: en 1440 con el escenario en 400, de 300 a 668 (tablero en 360)', () => {
  assert.deepEqual(panelLimits(400, 1440), { min: 300, max: 668 });
  assert.equal(1440 - 2 * ZONES.splitter - 400 - 668, 360);
});

test('límite de la mitad de la ventana: en 1440 con el escenario en 260, el panel llega a 720', () => {
  assert.deepEqual(panelLimits(260, 1440), { min: 300, max: 720 });
});

test('límites del escenario: en 1440 con el panel en 360, de 260 a 708 (tablero en 360)', () => {
  assert.deepEqual(stageLimits(360, 1440), { min: 260, max: 708 });
  assert.equal(1440 - 2 * ZONES.splitter - 708 - 360, 360);
});
