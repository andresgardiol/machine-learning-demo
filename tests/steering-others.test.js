// El volante suave es solo del teclado (manejo-amable-y-competir-sin-cortes D1, tarea 2.2): un cerebro y un programa de
// reglas hacen exactamente lo mismo que antes. Las huellas de 900 pasos se calcularon sobre el código de antes del
// cambio (2f7ffa9), con la misma semilla.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createWorld } from '../src/core/world.js';
import { createTraceController } from '../src/core/network-trace.js';
import { EXAMPLE_BRAINS } from '../src/data/example-brains.js';
import { parseProgram, createRulesController } from '../src/core/rules.js';
import { EXAMPLES } from '../src/tabs/rules/examples.js';
import es from '../src/i18n/es.js';

const STREET = { seed: 1, track: 'straight', lanes: 3, density: 50, irregularity: 50 };
function huella(world) {
  let h = 0;
  for (let k = 0; k < 900; k++) {
    world.step();
    const c = world.car;
    h = (h * 31 + Math.round(c.position.x * 1000) * 7 + Math.round(c.position.y * 1000) * 3 + Math.round(c.angle * 100000)) % 2147483647;
  }
  return { h, steps: world.steps, x: Math.round(world.car.position.x * 1000) / 1000, y: Math.round(world.car.position.y * 1000) / 1000, crashed: world.crashed };
}

test('otros controladores: el cerebro de ejemplo hace lo mismo que antes del volante suave', () => {
  const b = EXAMPLE_BRAINS[0];
  const world = createWorld({ ...STREET, cars: [{ controller: createTraceController(b.network, b.sensors.count, () => null), sensors: { ...b.sensors }, maxSpeed: 20 }] });
  assert.deepEqual(huella(world), { h: 2057855322, steps: 900, x: 294.493, y: 1.502, crashed: false });
});

test('otros controladores: el programa de reglas de 20 sensores hace lo mismo que antes del volante suave', () => {
  const ex = EXAMPLES.find((e) => e.id === 'twenty');
  const prog = parseProgram(es[ex.textKey], { sensors: ex.sensors.count });
  const world = createWorld({ ...STREET, cars: [{ controller: createRulesController({ program: prog.program ?? prog }), sensors: { ...ex.sensors }, maxSpeed: 20 }] });
  assert.deepEqual(huella(world), { h: 1330019139, steps: 900, x: 294.792, y: -0.126, crashed: false });
});
