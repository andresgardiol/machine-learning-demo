// Paisaje solo estético (circuitos-y-paisaje, tarea 6.5): dibujar el paisaje no cambia la simulación.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/core/world.js';
import { createSceneryPainter } from '../src/render/scenery.js';

/** Contexto de canvas que acepta todo y no dibuja nada. */
function fakeContext() {
  return new Proxy({}, {
    get: (target, key) => (key in target ? target[key] : () => {}),
    set: (target, key, value) => { target[key] = value; return true; },
  });
}

const colors = new Proxy({}, { get: () => '#000' });

/** Controlador fijo que acelera y dobla un poco, para que el auto recorra la pista. */
const driver = { control: (p) => ({ forward: true, left: p.sensors[0] < p.sensors[p.sensors.length - 1] }) };

for (const track of ['straight', 'oval', 'grandPrix']) {
  test(`Misma simulación (${track}): el estado del mundo es idéntico paso a paso con el paisaje encendido y apagado`, () => {
    const plain = createWorld({ seed: 3, track, controller: driver });
    const withScenery = createWorld({ seed: 3, track, controller: driver });
    const painter = createSceneryPainter();
    const ctx = fakeContext();
    for (let i = 0; i < 600; i++) {
      plain.step();
      withScenery.step();
      const p = withScenery.car.position;
      const b = { minX: p.x - 80, maxX: p.x + 80, minY: p.y - 60, maxY: p.y + 60 };
      painter.under(ctx, withScenery, b, colors);
      painter.paint(ctx, withScenery, b, colors);
      painter.over(ctx, withScenery, b, colors);
      assert.deepEqual(withScenery.snapshot(), plain.snapshot());
      assert.deepEqual(withScenery.agentsSnapshot(), plain.agentsSnapshot());
    }
  });
}
