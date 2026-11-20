// Tráfico al azar en la pestaña 5 (trafico-al-azar-en-inspeccionar, tareas 1.2 y 4.1).
//
// Las pestañas no se montan en estas pruebas (no hay DOM): se prueba el módulo de semillas que comparten
// Inspeccionar y Entender, y la regla de reinicio de las dos con mundos del núcleo armados como ellas
// (`makeWorld` + `forRestart`), más una lectura del código de las dos pestañas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createTrafficSeed, showsTrafficOption, MAX_TRAFFIC_SEED, TRAFFIC_MODES } from '../src/tabs/inspect/traffic-seed.js';
import { createWorld } from '../src/core/world.js';
import { TRACK_IDS } from '../src/core/circuits.js';

/** Azar fijo para las pruebas: una sucesión de valores en [0, 1). */
const sequence = (...values) => { let i = 0; return () => values[i++ % values.length]; };
/** Azar determinista con muchos valores distintos (un generador lineal congruencial chico). */
const lcg = (seed = 7) => { let s = seed; return () => { s = (s * 1103515245 + 12345) % 2 ** 31; return s / 2 ** 31; }; };

test('fresh() da una semilla entera dentro de 1..2³¹−1 y distinta de la actual', () => {
  const traffic = createTrafficSeed({ random: lcg() });
  let previous = traffic.current;
  assert.equal(previous, null);
  for (let k = 0; k < 200; k++) {
    const s = traffic.fresh();
    assert.ok(Number.isInteger(s) && s >= 1 && s <= MAX_TRAFFIC_SEED, `fuera de rango: ${s}`);
    assert.notEqual(s, previous);
    assert.equal(traffic.current, s);
    previous = s;
  }
});

test('los extremos del azar quedan dentro del rango', () => {
  assert.equal(createTrafficSeed({ random: () => 0 }).fresh(), 1);
  assert.equal(createTrafficSeed({ random: () => 0.9999999999999999 }).fresh(), MAX_TRAFFIC_SEED);
});

test('fresh() no repite la actual aunque el azar devuelva siempre lo mismo', () => {
  const traffic = createTrafficSeed({ random: () => 0.5 });
  const a = traffic.fresh();
  const b = traffic.fresh();
  assert.notEqual(a, b);
  assert.notEqual(traffic.fresh(), b);
});

test('forRestart(): otra semilla con "Nuevo", la misma con "Repetir"', () => {
  const traffic = createTrafficSeed({ random: lcg(3) });
  assert.deepEqual(TRAFFIC_MODES, ['new', 'repeat']);
  assert.equal(traffic.mode, 'new'); // por defecto
  const first = traffic.fresh();
  const second = traffic.forRestart();
  assert.notEqual(second, first);
  traffic.setMode('repeat');
  assert.equal(traffic.forRestart(), second);
  assert.equal(traffic.forRestart(), second);
  traffic.setMode('new'); // volver a "Nuevo": otro tráfico en cada reinicio
  const third = traffic.forRestart();
  assert.notEqual(third, second);
  assert.notEqual(traffic.forRestart(), third);
});

test('cambiar la opción no elige semilla (no reinicia nada)', () => {
  const traffic = createTrafficSeed({ random: lcg(5) });
  const s = traffic.fresh();
  traffic.setMode('repeat');
  traffic.setMode('new');
  assert.equal(traffic.current, s);
  assert.throws(() => traffic.setMode('otro'), RangeError);
});

test('con el mismo random inyectado, la sucesión de semillas es la misma', () => {
  const run = () => {
    const traffic = createTrafficSeed({ random: sequence(0.1, 0.42, 0.42, 0.9, 0.3) });
    const seeds = [traffic.fresh(), traffic.forRestart()];
    traffic.setMode('repeat');
    seeds.push(traffic.forRestart());
    traffic.setMode('new');
    seeds.push(traffic.forRestart(), traffic.fresh());
    return seeds;
  };
  assert.deepEqual(run(), run());
});

test('la opción "Tráfico" se ofrece solo en la calle recta', () => {
  assert.equal(showsTrafficOption('straight'), true);
  for (const id of TRACK_IDS.filter((id) => id !== 'straight')) assert.equal(showsTrafficOption(id), false, id);
});

// --- La regla de reinicio de la pestaña, con mundos del núcleo ------------------------------------------
const forward = { control: () => ({ forward: true, reverse: false, left: false, right: false }) };
const settings = { track: 'straight', lanes: 3, density: 50, irregularity: 0, maxSpeed: 20 };
const makeWorld = (seed, s = settings) => createWorld({
  seed, track: s.track, lanes: s.lanes, density: s.density, irregularity: s.irregularity,
  cars: [{ controller: forward, sensors: { count: 5 }, maxSpeed: s.maxSpeed }],
});
const run = (world, frames) => { for (let k = 0; k < frames; k++) world.step(); return JSON.stringify(world.capture()); };
/** Como restart() de Inspeccionar y Entender. */
function restart(world, traffic, s = settings) {
  const seed = showsTrafficOption(s.track) ? traffic.forRestart() : world.seed;
  if (seed !== world.seed) return makeWorld(seed, s);
  world.reset();
  return world;
}

test('reiniciar con "Nuevo" cambia la semilla del mundo y el tráfico', () => {
  const traffic = createTrafficSeed({ random: lcg(11) });
  let world = makeWorld(traffic.fresh());
  const before = run(world, 60);
  const seed = world.seed;
  world = restart(world, traffic);
  assert.notEqual(world.seed, seed);
  assert.equal(world.steps, 0);
  assert.notEqual(run(world, 60), before);
});

test('reiniciar con "Repetir" conserva la semilla y repite el intento', () => {
  const traffic = createTrafficSeed({ random: lcg(13) });
  let world = makeWorld(traffic.fresh());
  const first = run(world, 90);
  traffic.setMode('repeat');
  const seed = world.seed;
  world = restart(world, traffic);
  assert.equal(world.seed, seed);
  assert.equal(run(world, 90), first);
  world = restart(world, traffic);
  assert.equal(world.seed, seed);
  assert.equal(run(world, 90), first);
});

test('"Reintentar desde acá" y "Atrás" (restaurar un cuadro) conservan la semilla y el tráfico', () => {
  const traffic = createTrafficSeed({ random: lcg(17) });
  const world = makeWorld(traffic.fresh());
  const seed = world.seed;
  run(world, 30);
  const frame = world.capture();
  const after = run(world, 40);
  world.restore(frame);
  assert.equal(world.seed, seed);
  assert.equal(run(world, 40), after);
  assert.equal(traffic.current, seed); // restaurar no pide semilla
});

test('en un circuito, reiniciar no pide semilla nueva', () => {
  const traffic = createTrafficSeed({ random: lcg(19) });
  const oval = { ...settings, track: 'oval' };
  let world = makeWorld(traffic.fresh(), oval);
  const seed = world.seed;
  world = restart(world, traffic, oval);
  assert.equal(world.seed, seed);
  assert.equal(traffic.current, seed);
});

test('Inspeccionar y Entender usan la semilla de la pestaña, sin semilla fija ni Math.random', () => {
  for (const p of ['src/tabs/inspect/index.js', 'src/v2/stages/entender/index.js']) {
    const src = readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
    assert.doesNotMatch(src, /\bSEED\s*=\s*1\b/, p);
    assert.doesNotMatch(src, /\bMath\s*\.\s*random\b/, p);
    assert.match(src, /createTrafficSeed\(\{ random: trafficRandom \}\)/, p);
    assert.match(src, /makeWorld\(state\.traffic\.fresh\(\)\)/, p);
    assert.match(src, /state\.traffic\.forRestart\(\)/, p);
    assert.match(src, /show\(trafficChoice\.\w+, showsTrafficOption\(state\.settings\.track\)\)/, p);
    assert.doesNotMatch(src, /preferences[^\n]*traffic/, p); // la opción no se guarda
  }
});
