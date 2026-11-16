import test from 'node:test';
import assert from 'node:assert/strict';
import { fitZones, stageLimits } from '../src/ui/layout.js';
import { ZONES as INSPECT } from '../src/tabs/inspect/index.js';

test('Inspeccionar, anchos por defecto en 1440: tablero y panel de 360 y la red con todo lo demás (708)', () => {
  assert.deepEqual(fitZones({ stage: null, panel: null }, 1440, INSPECT), { stage: 708, board: 360, panel: 360 });
});

test('Inspeccionar: la red no baja de 600 px; con la ventana angosta rigen los límites de siempre', () => {
  assert.equal(stageLimits(360, 1440, INSPECT).min, 600);
  assert.deepEqual(fitZones({ stage: 300, panel: 360 }, 1440, INSPECT), { stage: 600, board: 468, panel: 360 });
  // 1280: 600 + 360 + 360 no entran; el tablero queda en su mínimo de siempre y cede el panel.
  assert.deepEqual(fitZones({ stage: null, panel: 360 }, 1280, INSPECT), { stage: 600, board: 360, panel: 308 });
});

test('las demás pestañas siguen con sus anchos de siempre', () => {
  assert.deepEqual(fitZones({}, 1440), { stage: 400, board: 668, panel: 360 });
  assert.equal(stageLimits(360, 1440).min, 260);
});

test('ventana angosta (vista-de-la-red D18): la red cede hasta 440 para que el tablero conserve 280', () => {
  assert.deepEqual(fitZones({ stage: null, panel: null }, 1100, INSPECT), { stage: 508, board: 280, panel: 300 });
  assert.equal(stageLimits(300, 1100, INSPECT).min, 508);
  // Mientras la ventana deja 280 para el tablero, la red no baja de 600.
  assert.deepEqual(fitZones({ stage: null, panel: null }, 1240, INSPECT), { stage: 600, board: 328, panel: 300 });
  assert.equal(stageLimits(300, 1240, INSPECT).min, 600);
  // Nunca menos de 440: a 960 no hay lugar para todo y el tablero queda con lo que sobra.
  assert.deepEqual(fitZones({ stage: null, panel: null }, 960, INSPECT), { stage: 440, board: 208, panel: 300 });
  assert.equal(stageLimits(300, 960, INSPECT).min, 440);
});
