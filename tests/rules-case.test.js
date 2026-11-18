// El caso del choque de Reglas a mano (reglas-el-choque-ensena D3 y D6, tareas 2.2 y 2.3): la
// condición de la regla para el caso y el búfer circular de la repetición.
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import { caseCondition, createReplayBuffer, frameOf, raysOf, REPLAY_FRAMES } from '../src/tabs/rules/case.js';
import { parseProgram, createRulesController } from '../src/core/rules.js';
import { createWorld } from '../src/core/world.js';
import { DEFAULT_SETTINGS, worldSpec } from '../src/tabs/shared/street-settings.js';
import { DEFAULT_SEED, INITIAL_PROGRAM } from '../src/tabs/rules/examples.js';

// --- caseCondition (2.2) ----------------------------------------------------------------------

test('Agregar la condición: los dos sensores más altos por encima de 0,3, redondeados hacia abajo a la décima', () => {
  assert.equal(caseCondition([0.87, 0.81, 0.49, 0, 0], 'es'), 'si sensor1 > 0,80 y sensor2 > 0,80 entonces ');
  // El orden de la condición es el de los sensores, no el de las lecturas.
  assert.equal(caseCondition([0, 0.45, 0.2, 0.99, 0.31], 'es'), 'si sensor2 > 0,40 y sensor4 > 0,90 entonces ');
});

test('El redondeo es hacia abajo, sin errores de coma flotante', () => {
  assert.equal(caseCondition([0.7, 0.59999, 0], 'es'), 'si sensor1 > 0,70 y sensor2 > 0,50 entonces ');
  assert.equal(caseCondition([1, 0.3000001], 'es'), 'si sensor1 > 1,00 y sensor2 > 0,30 entonces ');
});

test('En inglés: if, and, then y punto decimal', () => {
  assert.equal(caseCondition([0.87, 0.81, 0.49, 0, 0], 'en'), 'if sensor1 > 0.80 and sensor2 > 0.80 then ');
});

test('Un solo sensor por encima de 0,3: la condición lleva solo ese', () => {
  assert.equal(caseCondition([0.1, 0.65, 0.2], 'es'), 'si sensor2 > 0,60 entonces ');
});

test('Ningún sensor por encima de 0,3: usa los dos laterales más altos (el tercio de cada costado)', () => {
  // Siete sensores: laterales 1, 2, 6 y 7; el del medio (0,29) no cuenta.
  assert.equal(caseCondition([0.1, 0.25, 0.1, 0.29, 0.1, 0.05, 0.2], 'es'), 'si sensor2 > 0,20 y sensor7 > 0,20 entonces ');
  // Cinco sensores: laterales 1 y 5.
  assert.equal(caseCondition([0, 0.2, 0.29, 0.2, 0.12], 'es'), 'si sensor1 > 0,00 y sensor5 > 0,10 entonces ');
});

test('La condición con una acción forma una regla válida del lenguaje', () => {
  const text = `avanzar\n${caseCondition([0.87, 0.81, 0.49, 0, 0], 'es')}girar derecha`;
  const r = parseProgram(text, { sensors: 5 });
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  assert.equal(r.rules, 1);
  // Sin acción, el lenguaje la marca con un error (el programa anterior sigue manejando).
  const bare = parseProgram(`avanzar\n${caseCondition([0.87, 0.81, 0.49, 0, 0], 'es')}`, { sensors: 5 });
  assert.equal(bare.ok, false);
});

// --- Búfer de la repetición (2.3) ------------------------------------------------------------

/** El programa inicial con los valores por defecto, grabando un cuadro por paso como la pestaña. */
function run({ maxSteps = 60 * 30, buffer = createReplayBuffer() } = {}) {
  const { program } = parseProgram(es[INITIAL_PROGRAM.textKey], { sensors: 5 });
  const controller = createRulesController({ program });
  const world = createWorld({ ...worldSpec(DEFAULT_SETTINGS, DEFAULT_SEED), controller });
  const history = [];
  for (let i = 0; i < maxSteps && !world.crashed; i += 1) {
    world.step();
    const f = frameOf(world, controller);
    buffer.push(f);
    history.push({ f, vehicles: world.vehiclesIn(world.progress - 60, world.progress + 60) });
  }
  return { world, buffer, history };
}

test('guarda los últimos 180 cuadros, del más viejo al más nuevo', () => {
  assert.equal(REPLAY_FRAMES, 180);
  const b = createReplayBuffer();
  for (let i = 1; i <= 500; i += 1) b.push({ steps: i });
  assert.equal(b.length, 180);
  assert.deepEqual(b.frames().map((f) => f.steps), Array.from({ length: 180 }, (_, i) => 321 + i));
  assert.equal(b.at(0).steps, 500);
  assert.equal(b.at(-60).steps, 440);
  assert.equal(b.at(-179).steps, 321);
  assert.equal(b.at(-500).steps, 321, 'más atrás de lo guardado, el más viejo');
});

test('se vacía al reiniciar', () => {
  const b = createReplayBuffer();
  for (let i = 0; i < 10; i += 1) b.push({ steps: i });
  b.clear();
  assert.equal(b.length, 0);
  assert.equal(b.at(0), null);
  b.push({ steps: 99 });
  assert.deepEqual(b.frames().map((f) => f.steps), [99]);
});

test('Intento corto: con un intento de 1 s devuelve 60 cuadros; el del programa inicial (choca a los 4,4 s) guarda los últimos 180', () => {
  const { world, buffer } = run();
  assert.equal(world.crashed, true);
  assert.equal(buffer.length, 180); // el choque es a los 266 pasos: quedan los últimos 180
  const short = run({ maxSteps: 60 });
  assert.equal(short.buffer.length, 60);
  assert.equal(short.buffer.at(-200).steps, 1);
});

test('El último cuadro es el del choque, con las lecturas, los controles y las líneas de ese instante', () => {
  const { world, buffer } = run();
  const last = buffer.at(0);
  assert.equal(last.car.crashed, true);
  assert.equal(last.steps, world.steps);
  assert.deepEqual([...last.sensors].map((v) => Math.round(v * 100) / 100), world.perception.sensors.map((v) => Math.round(v * 100) / 100));
  const rays = raysOf(last);
  assert.equal(rays.length, 5);
  for (let i = 0; i < 5; i += 1) {
    assert.ok(Math.abs(rays[i].origin.x - world.rays[i].origin.x) < 1e-3);
    assert.equal(rays[i].hit === null, world.rays[i].hit === null);
  }
});

test('El tráfico de un cuadro guardado se recalcula igual al del momento', () => {
  const { world, buffer, history } = run();
  for (const back of [0, -1, -60, -179]) {
    const f = buffer.at(back);
    const then = history.find((h) => h.f === f);
    const again = world.traffic.vehicles(f.time, f.progress - 60, f.progress + 60);
    assert.deepEqual(again, then.vehicles, `cuadro ${back}`);
  }
});

test('Determinismo: repetir el intento da los mismos cuadros', () => {
  const a = run().buffer.frames();
  const b = run().buffer.frames();
  assert.deepEqual(a, b);
});

test('pop saca el último cuadro y lo devuelve; vacío, null (red-al-centro D6)', async () => {
  const { createReplayBuffer: shared } = await import('../src/tabs/shared/replay-buffer.js');
  const b = shared({ capacity: 3 });
  assert.equal(b.pop(), null);
  for (const n of [1, 2, 3, 4]) b.push(n);
  assert.equal(b.pop(), 4);
  assert.deepEqual(b.frames(), [2, 3]);
  b.push(5);
  assert.deepEqual(b.frames(), [2, 3, 5]);
  assert.equal(b.at(0), 5);
  b.pop(); b.pop(); b.pop();
  assert.equal(b.length, 0);
  assert.equal(b.at(0), null);
});
