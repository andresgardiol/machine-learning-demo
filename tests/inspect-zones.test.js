// Anchos de Inspeccionar y del Laboratorio con la red al centro (red-al-centro D2 y tarea 2.5).
import test from 'node:test';
import assert from 'node:assert/strict';
import { fitZones, stageLimits, panelLimits } from '../src/ui/layout.js';
import { ZONES as INSPECT } from '../src/tabs/inspect/index.js';
import { ZONES as LAB } from '../src/tabs/lab/index.js';
import { createPreferences } from '../src/ui/preferences.js';

test('Inspeccionar, anchos por defecto en 1440: la escena en 400, el panel en 360 y la red con el resto (668)', () => {
  assert.deepEqual(fitZones({ stage: null, panel: null }, 1440, INSPECT), { stage: 400, board: 668, panel: 360 });
});

test('el Laboratorio usa los mismos anchos y la misma preferencia que Inspeccionar', () => {
  assert.equal(LAB, INSPECT);
  assert.deepEqual(fitZones({ stage: null, panel: null }, 1440, LAB), fitZones({ stage: null, panel: null }, 1440, INSPECT));
});

test('a 1366 la zona izquierda cede para que la red conserve 600', () => {
  assert.deepEqual(fitZones({ stage: null, panel: null }, 1366, INSPECT), { stage: 394, board: 600, panel: 360 });
});

test('la red no baja de 600 mientras la ventana deje 280 a la izquierda', () => {
  // Agrandar la zona izquierda arrastrando: la red se detiene en 600.
  assert.equal(stageLimits(360, 1440, INSPECT).max, 468);
  assert.deepEqual(fitZones({ stage: 900, panel: 360 }, 1440, INSPECT), { stage: 468, board: 600, panel: 360 });
  // Achicarla: no baja de 280.
  assert.equal(stageLimits(360, 1440, INSPECT).min, 280);
  assert.deepEqual(fitZones({ stage: 100, panel: 360 }, 1440, INSPECT), { stage: 280, board: 788, panel: 360 });
  // 1240: el panel cede un poco y la zona izquierda queda en 280 con la red en 600.
  assert.deepEqual(fitZones({ stage: null, panel: null }, 1240, INSPECT), { stage: 280, board: 600, panel: 348 });
});

test('ventana angosta (1032 a 1240): la izquierda en 280 y la red cede sin bajar de 440', () => {
  for (const w of [1032, 1100, 1180, 1239]) {
    const z = fitZones({ stage: null, panel: null }, w, INSPECT);
    assert.equal(z.stage, 280, `${w}`);
    assert.ok(z.board >= 440 && z.board <= 600, `${w}: red ${z.board}`);
  }
  assert.deepEqual(fitZones({ stage: null, panel: null }, 1100, INSPECT), { stage: 280, board: 508, panel: 300 });
});

test('ventana en su mínimo (960 a 1032): la red en 440 y la izquierda con lo que sobra, no menos de 200', () => {
  assert.deepEqual(fitZones({ stage: null, panel: null }, 1032, INSPECT), { stage: 280, board: 440, panel: 300 });
  assert.deepEqual(fitZones({ stage: null, panel: null }, 960, INSPECT), { stage: 208, board: 440, panel: 300 });
  assert.equal(stageLimits(300, 960, INSPECT).min, 208);
});

test('el orden de las zonas es izquierda, red y panel: los tres anchos suman el ancho útil', () => {
  for (const w of [960, 1100, 1366, 1440, 1920]) {
    const z = fitZones({ stage: null, panel: null }, w, INSPECT);
    assert.equal(z.stage + z.board + z.panel, w - 12, `${w}`);
    assert.ok(z.board > z.stage && z.board >= z.panel, `${w}: la red es la zona más ancha`);
  }
});

test('el panel no se agranda a costa de los 600 de la red', () => {
  assert.equal(panelLimits(400, 1440, INSPECT).max, 428);
});

test('las demás pestañas siguen con sus anchos de siempre', () => {
  assert.deepEqual(fitZones({}, 1440), { stage: 400, board: 668, panel: 360 });
  assert.equal(stageLimits(360, 1440).min, 260);
});

test('el ancho guardado con la forma vieja se descarta (Migration Plan)', () => {
  const data = new Map([['mlLab.inspect.stageWidth', '708']]);
  const storage = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, String(v)), removeItem: (k) => data.delete(k) };
  const prefs = createPreferences(() => storage);
  assert.equal(prefs.netLeftWidth, null);
  assert.equal(data.has('mlLab.inspect.stageWidth'), false);
  prefs.netLeftWidth = 420;
  assert.equal(prefs.netLeftWidth, 420);
});
