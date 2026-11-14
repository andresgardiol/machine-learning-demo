import test from 'node:test';
import assert from 'node:assert/strict';
import { fitZones, stageLimits } from '../src/ui/layout.js';
import { ZONES as INSPECT } from '../src/tabs/inspect/index.js';

test('Inspeccionar, anchos por defecto en 1440: tablero y panel de 360 y la red con todo lo demás (708)', () => {
  assert.deepEqual(fitZones({ stage: null, panel: null }, 1440, INSPECT), { stage: 708, board: 360, panel: 360 });
});

test('Inspeccionar: la red no baja de 600 px; el tablero cede primero', () => {
  assert.equal(stageLimits(360, 1440, INSPECT).min, 600);
  assert.deepEqual(fitZones({ stage: 300, panel: 360 }, 1440, INSPECT), { stage: 600, board: 468, panel: 360 });
  // Ventana más chica: la red sigue en 600 y el tablero se achica.
  const z = fitZones({ stage: null, panel: 360 }, 1280, INSPECT);
  assert.equal(z.stage, 600);
  assert.equal(z.board, 1280 - 12 - 600 - 360);
});

test('las demás pestañas siguen con sus anchos de siempre', () => {
  assert.deepEqual(fitZones({}, 1440), { stage: 400, board: 668, panel: 360 });
  assert.equal(stageLimits(360, 1440).min, 260);
});
