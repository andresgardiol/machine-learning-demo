// Carrera de varios competidores (spec `carrera`, pestana-competir D1 a D1d).
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createRace, raceGoal, respawnProgress, RESPAWN_GRACE, crashPenaltyOf, RaceError, MAX_COMPETITORS, RACE_GOALS,
  RESPAWN_BACK, RACE_STALL_SECONDS, RACE_WAIT_SECONDS, RACE_MAX_SECONDS, RACE_CRASH_PENALTY,
} from '../src/core/race.js';
import { constantController } from '../src/core/controller.js';
import { createNetwork } from '../src/core/network.js';
import { createNetworkController } from '../src/core/brain.js';
import { createRulesController, parseProgram } from '../src/core/rules.js';
import { createRandom } from '../src/core/random.js';
import { createTrackById } from '../src/core/circuits.js';
import { STEP, CAR_LENGTH } from '../src/core/constants.js';

const idle = constantController({});
const forward = constantController({ forward: true });
const forwardLeft = constantController({ forward: true, left: true });
const near = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

/**
 * Piloto de prueba: sigue la línea central mirando el estado del auto (no sus sensores). `plan(r, a)`
 * puede pedir otra cosa según el resultado y el agente: 'left' para ir a chocar, 'stop', o una
 * velocidad de crucero (m/s).
 */
function pilot(getRace, index, plan = () => null) {
  return {
    control() {
      const race = getRace();
      const a = race.world.agents[index];
      const r = race.results[index];
      const order = plan(r, a);
      if (order === 'left') return { forward: true, left: true };
      if (order === 'right') return { forward: true, right: true };
      if (order === 'stop') return {};
      if (order === 'reverse') return { reverse: true };
      const { track } = race.world;
      const at = track.pointAt(a.progress + 10);
      const lateral = typeof order === 'object' && order ? order.lateral : 0;
      const target = { x: at.position.x - Math.sin(at.angle) * lateral, y: at.position.y + Math.cos(at.angle) * lateral };
      const desired = Math.atan2(target.y - a.car.position.y, target.x - a.car.position.x);
      let diff = desired - a.car.angle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      const cruise = typeof order === 'number' ? order : 14;
      return { forward: a.car.speed < cruise, left: diff > 0.02, right: diff < -0.02 };
    },
  };
}

/** Carrera con competidores armados a partir de la carrera misma (para los pilotos). */
function raceWith(spec, makers) {
  let race;
  const get = () => race;
  race = createRace({ ...spec, competitors: makers.map((m, i) => ({ id: `c${i}`, controller: typeof m === 'function' ? m(get, i) : m })) });
  return race;
}

const runToEnd = (race, maxSteps = Math.round(200 / STEP)) => { let n = 0; while (!race.finished && n++ < maxSteps) race.step(); return race; };
const stepSeconds = (race, s) => { for (let i = 0; i < Math.round(s / STEP); i++) race.step(); };

function randomBrainController(seed, sensors = 5) {
  const net = createNetwork({ inputs: sensors + 1, hidden: [6], outputs: 4, random: createRandom(seed) });
  return createNetworkController(net, sensors);
}

// --- Carrera de varios competidores ------------------------------------------------------------

test('salida: cuatro autos detenidos en la misma posición, superpuestos', () => {
  const race = createRace({ competitors: [0, 1, 2, 3].map((i) => ({ id: `c${i}`, controller: forward })) });
  const cars = race.world.agents.map((a) => a.car);
  assert.equal(cars.length, 4);
  for (const c of cars) {
    assert.equal(c.speed, 0);
    assert.deepEqual(c.position, cars[0].position);
    assert.equal(c.angle, cars[0].angle);
  }
});

test('fantasmas: dos autos en el mismo lugar no chocan ni cambian su manejo', () => {
  const race = createRace({ seed: 4, competitors: [{ id: 'a', controller: forward }, { id: 'b', controller: forward }] });
  stepSeconds(race, 2);
  const [a, b] = race.world.agents;
  assert.deepEqual(a.car.position, b.car.position);
  assert.equal(race.results[0].crashes, race.results[1].crashes);
});

test('controladores distintos: cada uno con su controlador y sus propios sensores', () => {
  const rules = createRulesController({ program: parseProgram('si sensor 1 < 0.5 entonces avanzar', { sensors: 7 }).program ?? null });
  const keyboard = constantController({ forward: true }); // el teclado cumple el mismo contrato
  const race = createRace({
    competitors: [
      { id: 'brain', controller: randomBrainController(1, 5), sensors: { count: 5, range: 3, spread: 90 } },
      { id: 'program', controller: rules, sensors: { count: 7, range: 3, spread: 90 } },
      { id: 'human', controller: keyboard },
    ],
  });
  stepSeconds(race, 1);
  const counts = race.world.agents.map((a) => a.perception.sensors.length);
  assert.deepEqual(counts, [5, 7, 5]);
});

test('demasiados competidores o ninguno: error con código', () => {
  const seven = Array.from({ length: 7 }, (_, i) => ({ id: `c${i}`, controller: idle }));
  assert.equal(MAX_COMPETITORS, 6);
  assert.throws(() => createRace({ competitors: seven }), (e) => e instanceof RaceError && e.code === 'tooManyCompetitors' && e.details.max === 6);
  assert.throws(() => createRace({ competitors: [] }), (e) => e instanceof RaceError && e.code === 'noCompetitors');
});

test('igual solo que acompañado: el mismo cerebro recorre el mismo camino', () => {
  const spec = { seed: 7, density: 80, irregularity: 30 };
  const alone = createRace({ ...spec, competitors: [{ id: 'x', controller: randomBrainController(11) }] });
  const crowd = createRace({
    ...spec,
    competitors: [
      { id: 'x', controller: randomBrainController(11) },
      ...[1, 2, 3, 4, 5].map((k) => ({ id: `o${k}`, controller: k % 2 ? forward : randomBrainController(20 + k, 3), sensors: { count: k % 2 ? 5 : 3, range: 3, spread: 90 } })),
    ],
  });
  for (let i = 0; i < Math.round(30 / STEP); i++) {
    alone.step();
    crowd.step();
    assert.deepEqual(crowd.world.agents[0].car.position, alone.world.agents[0].car.position);
  }
  assert.deepEqual(crowd.results[0], alone.results[0]);
});

// --- Meta ----------------------------------------------------------------------------------

test('metas de cada pista: 1000 m, 2 vueltas, 2 vueltas y 1 vuelta', () => {
  assert.deepEqual(RACE_GOALS.straight, { kind: 'meters', value: 1000 });
  assert.deepEqual(RACE_GOALS.oval, { kind: 'laps', value: 2 });
  assert.deepEqual(RACE_GOALS.kidney, { kind: 'laps', value: 1 });
  assert.deepEqual(RACE_GOALS.grandPrix, { kind: 'laps', value: 1 });
  const oval = createTrackById('oval');
  assert.ok(near(raceGoal('oval').meters, 2 * oval.length));
  assert.equal(raceGoal('straight').meters, 1000);
});

test('meta de la calle recta: llega al alcanzar los 1000 m, con su tiempo', () => {
  const race = createRace({ density: 0, competitors: [{ id: 'a', controller: forward }] });
  let crossed = null;
  while (!race.finished) {
    race.step();
    if (crossed === null && race.world.agents[0].progress >= 1000 - 1e-9) crossed = race.time;
  }
  const r = race.results[0];
  assert.equal(r.state, 'arrived');
  assert.ok(near(r.time, crossed));
  assert.equal(r.progress, 1000);
  assert.equal(r.share, 1);
  assert.ok(r.time > 50 && r.time < 52, `a fondo tarda algo más de 50 s (${r.time})`);
});

test('meta de un circuito: llega al cruzar la línea por segunda vez en el óvalo', () => {
  const race = raceWith({ track: 'oval' }, [pilot]);
  runToEnd(race);
  const r = race.results[0];
  assert.equal(r.state, 'arrived');
  assert.equal(r.laps, 2);
  assert.equal(r.lapTimes.length, 2);
  assert.ok(near(r.time, r.lapTimes[0] + r.lapTimes[1], 1e-9));
});

test('después de llegar: el auto queda detenido pasando la meta y su resultado no cambia', () => {
  const race = raceWith({ density: 0 }, [forward, (get, i) => pilot(get, i, () => 8)]);
  while (race.results[0].state === 'racing') race.step();
  const before = JSON.stringify(race.results[0]);
  const pos = { ...race.world.agents[0].car.position };
  stepSeconds(race, 3);
  assert.equal(JSON.stringify(race.results[0]), before);
  assert.deepEqual(race.world.agents[0].car.position, pos);
  assert.equal(race.world.agents[0].car.speed, 0);
  assert.ok(race.world.agents[0].progress >= 1000);
  assert.equal(race.results[1].state, 'racing');
});

// --- Chocar no saca de la carrera -------------------------------------------------------------

test('reaparecer: contra el borde a los 300 m, 0,1 s después en el centro, 8 m más atrás, detenido y mirando adelante', () => {
  let crashAt = null;
  const race = raceWith({ density: 0 }, [(get, i) => pilot(get, i, (r, a) => (r.crashes === 0 && a.progress > 300 ? 'left' : null))]);
  while (race.results[0].crashes === 0) {
    race.step();
    if (race.results[0].crashes === 1) crashAt = { time: race.time, progress: race.world.agents[0].progress };
  }
  assert.equal(race.results[0].penalized, true);
  assert.equal(race.results[0].state, 'racing');
  // Detenido donde chocó durante la penalización.
  const pos = { ...race.world.agents[0].car.position };
  stepSeconds(race, RACE_CRASH_PENALTY - STEP / 2);
  assert.deepEqual(race.world.agents[0].car.position, pos);
  race.step(); // reaparece al empezar este paso
  const a = race.world.agents[0];
  assert.ok(near(race.time - crashAt.time, RACE_CRASH_PENALTY + STEP, 1e-9));
  assert.equal(race.results[0].penalized, false);
  assert.equal(a.car.crashed, false);
  assert.ok(Math.abs(a.car.position.y) < 0.5, 'sin tráfico, en el carril del centro');
  assert.ok(Math.abs(a.car.angle) < 0.05, 'mirando hacia adelante');
  assert.ok(a.car.speed <= 40 * STEP + 1e-9, 'arranca de detenido');
  assert.ok(near(a.car.position.x, crashAt.progress - RESPAWN_BACK, 1), `${a.car.position.x} ≈ ${crashAt.progress - 8}`);
  assert.equal(RESPAWN_BACK, 2 * CAR_LENGTH);
});

test('choques contados: choca tres veces y llega', () => {
  const marks = [200, 450, 700];
  const race = raceWith({ density: 0 }, [(get, i) => pilot(get, i, (r, a) => (r.crashes < 3 && a.progress > marks[r.crashes] ? 'left' : 16))]);
  runToEnd(race);
  const r = race.results[0];
  assert.equal(r.state, 'arrived');
  assert.equal(r.crashes, 3);
  assert.ok(r.time > 0);
});

for (const penalty of [0, 0.1, 2]) {
  test(`penalización de ${penalty} s: queda detenido ese tiempo antes de reaparecer`, () => {
    const race = raceWith({ density: 0, crashPenalty: penalty }, [(get, i) => pilot(get, i, (r, a) => (r.crashes === 0 && a.progress > 100 ? 'left' : null))]);
    while (race.results[0].crashes === 0) race.step();
    const crashStep = race.steps;
    while (race.results[0].penalized) race.step();
    // Reaparece al empezar el paso siguiente a cumplir la penalización (con 0, el paso siguiente).
    assert.equal(race.steps - crashStep, Math.round(penalty / STEP) + 1);
    assert.equal(race.results[0].state, 'racing');
  });
}

test('penalización: se ajusta a 0 a 3 s, de a 0,1', () => {
  assert.equal(crashPenaltyOf(undefined), 0.1);
  assert.equal(crashPenaltyOf(-1), 0);
  assert.equal(crashPenaltyOf(5), 3);
  assert.equal(crashPenaltyOf(1.23), 1.2);
  assert.ok(RACE_STALL_SECONDS > 3, 'la penalización sola nunca deja a nadie fuera');
});

test('choque cerca de la salida: reaparece en la salida, no antes', () => {
  const race = createRace({ density: 0, competitors: [{ id: 'a', controller: forwardLeft }] });
  while (race.results[0].crashes === 0) race.step();
  const crashProgress = race.world.agents[0].progress;
  assert.ok(crashProgress < RESPAWN_BACK, `choca a ${crashProgress} m`);
  while (race.results[0].penalized) race.step();
  assert.ok(Math.abs(race.world.agents[0].car.position.x) < 1, 'reaparece en la salida');
  assert.ok(race.world.agents[0].progress >= -1e-9);
});

test('vuelta que no se pierde: choca apenas cruzó la línea y la vuelta sigue contada una sola vez', () => {
  const race = raceWith({ track: 'oval' }, [(get, i) => pilot(get, i, (r, a) => {
    const L = get().world.track.length;
    if (r.crashes > 0) return null;
    // Llega a la línea pegado al borde derecho y, apenas la cruza, dobla hacia él.
    if (r.laps === 0 && a.progress > L - 60) return { lateral: -4.5 };
    if (r.laps === 1) return 'right';
    return null;
  })]);
  let respawnedBefore = false;
  while (!race.finished) {
    race.step();
    const r = race.results[0];
    const a = race.world.agents[0];
    if (r.crashes === 1 && !r.penalized && !respawnedBefore && a.laps === 0) respawnedBefore = true;
    if (race.steps > 200 / STEP) break;
  }
  const r = race.results[0];
  assert.equal(r.crashes, 1);
  assert.ok(respawnedBefore, 'reapareció antes de la línea');
  assert.equal(r.state, 'arrived');
  assert.equal(r.laps, 2);
  assert.equal(r.lapTimes.length, 2);
});

// --- Reaparecer en un lugar libre -------------------------------------------------------------

test('reaparece 8 m antes del choque, sin pasar de la salida, y nunca más atrás', () => {
  assert.equal(respawnProgress(300), 300 - RESPAWN_BACK);
  assert.equal(respawnProgress(5), 0);
  assert.equal(RESPAWN_GRACE, 2);
});

test('a través del vehículo que chocó: reaparece detrás, lo atraviesa y no vuelve a chocarlo', () => {
  // Va derecho por el carril del centro a fondo: choca contra el primer vehículo de ese carril.
  const race = createRace({ seed: 5, density: 100, irregularity: 0, competitors: [{ id: 'a', controller: forward }] });
  while (race.results[0].crashes === 0) race.step();
  assert.equal(race.world.agents[0].crashCause, 'vehicle');
  while (race.results[0].penalized) race.step();
  assert.equal(race.isProtected(0), true);
  const respawnStep = race.steps;
  while (race.steps - respawnStep < Math.round(RESPAWN_GRACE / STEP)) race.step();
  assert.equal(race.results[0].crashes, 1, 'en los 2 s siguientes no vuelve a chocar');
});

test('encimado al cumplirse el tiempo: sigue protegido hasta dejar de estar encimado', () => {
  const race = createRace({ seed: 5, density: 100, irregularity: 0, competitors: [{ id: 'a', controller: idle }] });
  const w = race.world;
  const v = w.vehiclesIn(0, 400).find((x) => x.lane === 1);
  // Detenido delante del vehículo, que va a 10 m/s: lo alcanza a 1,6 s y lo atraviesa hasta 2,4 s.
  w.respawn(0, { progress: v.distance + 2 * CAR_LENGTH + 12, protect: RESPAWN_GRACE });
  let crashed = false;
  for (let i = 0; i < Math.round(3 / STEP); i++) {
    w.step();
    if (w.agents[0].car.crashed) crashed = true;
    if (Math.abs(w.time - 2.2) < STEP / 2) assert.equal(w.isProtected(0), true, 'a los 2,2 s sigue encimado y protegido');
  }
  assert.equal(crashed, false);
  assert.equal(w.isProtected(0), false, 'al salir del vehículo termina la protección');
});

test('en carreras con tráfico denso, nadie sale de la protección encimado con un vehículo', () => {
  for (const seed of [1, 2, 3]) {
    const race = createRace({ seed, density: 100, irregularity: 50, competitors: [0, 1, 2].map((k) => ({ id: `b${k}`, controller: randomBrainController(seed * 10 + k) })) });
    const wasProtected = race.results.map(() => false);
    while (!race.finished) {
      race.step();
      race.results.forEach((r, i) => {
        const now = race.isProtected(i);
        if (wasProtected[i] && !now && r.state === 'racing' && !r.penalized) {
          const a = race.world.agents[i];
          const p = a.progress;
          const close = race.world.vehiclesIn(p - 2 * CAR_LENGTH, p + 2 * CAR_LENGTH)
            .filter((v) => !a.passThrough?.has(v.id) && Math.abs(v.distance - p) < CAR_LENGTH && Math.abs(v.position.y - a.car.position.y) < 2);
          assert.equal(close.length, 0, `seed ${seed}, ${a.car.position.x}`);
        }
        wasProtected[i] = now;
      });
    }
  }
});

// --- Competidor que no avanza y fin de la carrera -----------------------------------------------

test('nunca arranca: a los 5 s queda fuera como que no terminó', () => {
  const race = createRace({ competitors: [{ id: 'a', controller: idle }] });
  stepSeconds(race, RACE_STALL_SECONDS - 0.1);
  assert.equal(race.results[0].state, 'racing');
  stepSeconds(race, 0.2);
  assert.equal(race.results[0].state, 'unfinished');
  assert.equal(race.finished, true, 'no llega nadie: termina cuando queda fuera el último');
  assert.ok(near(race.time, RACE_STALL_SECONDS, STEP));
});

test('choca siempre en el mismo lugar: a los 5 s de su mayor progreso queda fuera', () => {
  const race = createRace({ density: 0, competitors: [{ id: 'a', controller: forwardLeft }, { id: 'b', controller: forward }] });
  let bestTime = 0;
  let best = -Infinity;
  while (race.results[0].state === 'racing') {
    race.step();
    if (race.results[0].progress > best) { best = race.results[0].progress; bestTime = race.time; }
  }
  assert.ok(race.results[0].crashes >= 2);
  assert.ok(near(race.time - bestTime, RACE_STALL_SECONDS, STEP));
  assert.equal(race.results[1].state, 'racing', 'los demás siguen');
});

test('avanza despacio, pero avanza: sigue en carrera', () => {
  const race = raceWith({ density: 0 }, [(get, i) => pilot(get, i, () => 1)]);
  stepSeconds(race, 30);
  assert.equal(race.results[0].state, 'racing');
});

test('llegan todos: la carrera termina en ese momento', () => {
  const race = raceWith({ density: 0 }, [forward, (get, i) => pilot(get, i, () => 18)]);
  runToEnd(race);
  const [a, b] = race.results;
  assert.equal(a.state, 'arrived');
  assert.equal(b.state, 'arrived');
  assert.ok(near(race.time, Math.max(a.time, b.time), 1e-9));
});

test('rezagado: termina a los 20 s del primero y queda como que no terminó, con lo que llevaba', () => {
  const race = raceWith({ density: 0 }, [forward, (get, i) => pilot(get, i, () => 10)]);
  runToEnd(race);
  const [a, b] = race.results;
  assert.equal(a.state, 'arrived');
  assert.equal(b.state, 'unfinished');
  assert.ok(near(race.time, a.time + RACE_WAIT_SECONDS, STEP));
  assert.ok(b.progress > 500 && b.progress < 1000);
  assert.ok(near(b.share, b.progress / 1000));
});

test('rezagado que llega a tiempo: los dos llegan', () => {
  const race = raceWith({ density: 0 }, [forward, (get, i) => pilot(get, i, () => 17)]);
  runToEnd(race);
  const [a, b] = race.results;
  assert.equal(a.state, 'arrived');
  assert.equal(b.state, 'arrived');
  assert.ok(b.time - a.time < RACE_WAIT_SECONDS);
});

test('espera abierta: a los 6 s de llegar el primero quedan 14 s', () => {
  const race = raceWith({ density: 0 }, [forward, (get, i) => pilot(get, i, () => 8)]);
  assert.equal(race.waitLeft, null);
  while (race.results[0].state === 'racing') race.step();
  assert.ok(near(race.waitLeft, RACE_WAIT_SECONDS, 1e-9));
  stepSeconds(race, 6);
  assert.ok(near(race.waitLeft, 14, 1e-9));
});

test('tiempo máximo: a los 180 s termina y los que avanzan despacio no terminaron', () => {
  const race = raceWith({ density: 0 }, [(get, i) => pilot(get, i, () => 2), (get, i) => pilot(get, i, () => 3)]);
  runToEnd(race, Math.round(400 / STEP));
  assert.equal(race.finished, true);
  assert.ok(near(race.time, RACE_MAX_SECONDS, STEP));
  assert.deepEqual(race.results.map((r) => r.state), ['unfinished', 'unfinished']);
});

test('después del final: ningún resultado cambia', () => {
  const race = createRace({ competitors: [{ id: 'a', controller: idle }] });
  runToEnd(race);
  const before = JSON.stringify({ r: race.results, t: race.time });
  for (let i = 0; i < 100; i++) race.step();
  assert.equal(JSON.stringify({ r: race.results, t: race.time }), before);
});

// --- Resultado de cada competidor ---------------------------------------------------------------

test('competidor que no termina: progreso y parte de la carrera (640 m → 64 %)', () => {
  const race = raceWith({ density: 0 }, [(get, i) => pilot(get, i, (r, a) => (a.progress >= 640 - 1.5 ? 'stop' : 18))]);
  runToEnd(race);
  const r = race.results[0];
  assert.equal(r.state, 'unfinished');
  assert.ok(r.progress >= 638 && r.progress < 660, `${r.progress}`);
  assert.ok(near(r.share, r.progress / 1000));
  assert.equal(r.time, null);
  assert.equal(r.crashes, 0);
});

test('en un circuito: vuelta y media de dos es el 75 %', () => {
  const race = raceWith({ track: 'oval' }, [(get, i) => pilot(get, i, (r, a) => (a.progress >= 1.5 * get().world.track.length ? 'stop' : null))]);
  runToEnd(race);
  const r = race.results[0];
  const L = race.world.track.length;
  assert.ok(r.progress >= 1.5 * L && r.progress < 1.5 * L + 20);
  assert.ok(near(r.share, r.progress / (2 * L)));
  assert.ok(r.share >= 0.75 && r.share < 0.77);
  assert.equal(r.laps, 1);
});

// --- Mejor vuelta ------------------------------------------------------------------------------

test('mejor vuelta: la más corta de las vueltas completas, medidas de cruce a cruce', () => {
  const race = raceWith({ track: 'oval' }, [(get, i) => pilot(get, i, (r) => (r.laps === 0 ? 9 : 14))]);
  runToEnd(race);
  const r = race.results[0];
  assert.equal(r.lapTimes.length, 2);
  assert.ok(r.lapTimes[1] < r.lapTimes[0]);
  assert.equal(r.bestLap, r.lapTimes[1]);
});

test('sin vuelta completa: no tiene mejor vuelta', () => {
  const race = raceWith({ track: 'oval' }, [(get, i) => pilot(get, i, (r, a) => (a.progress > 200 ? 'stop' : null))]);
  runToEnd(race);
  assert.equal(race.results[0].state, 'unfinished');
  assert.equal(race.results[0].bestLap, null);
  assert.deepEqual(race.results[0].lapTimes, []);
});

test('volver atrás no cuenta: cruzar la línea hacia atrás y otra vez hacia adelante no es una vuelta', () => {
  const race = raceWith({ track: 'oval' }, [(get, i) => pilot(get, i, (r) => (get().time < 1.5 ? 'reverse' : get().time < 4 ? null : 'stop'))]);
  stepSeconds(race, 1.5);
  assert.ok(race.world.agents[0].laps < 0, 'cruzó la salida hacia atrás');
  stepSeconds(race, 2.5);
  assert.ok(race.world.agents[0].progress > 0, 'volvió a cruzarla hacia adelante');
  assert.equal(race.results[0].laps, 0);
  assert.deepEqual(race.results[0].lapTimes, []);
});

// --- Orden -------------------------------------------------------------------------------------

test('orden: llegó antes; llegó contra no llegó; más progreso; empate por inscripción', () => {
  const race = raceWith({ density: 0 }, [
    (get, i) => pilot(get, i, () => 18),
    forward,
    (get, i) => pilot(get, i, (r, a) => (a.progress > 300 ? 'stop' : null)),
    (get, i) => pilot(get, i, (r, a) => (a.progress > 300 ? 'stop' : null)),
  ]);
  stepSeconds(race, 20);
  assert.equal(race.standings[0], 1, 'en carrera, el que lleva más metros va adelante');
  runToEnd(race);
  const [a, b, c, d] = race.results;
  assert.ok(b.time < a.time);
  assert.equal(c.progress, d.progress);
  assert.deepEqual(race.standings, [1, 0, 2, 3]);
});

// --- Reproducible ------------------------------------------------------------------------------

test('repetición: tres cerebros, misma pista y semilla, resultados idénticos paso a paso', () => {
  const make = () => createRace({ seed: 9, density: 70, irregularity: 20, competitors: [1, 2, 3].map((k) => ({ id: `b${k}`, controller: randomBrainController(100 + k) })) });
  const a = make();
  const b = make();
  while (!a.finished) {
    a.step();
    b.step();
    assert.equal(JSON.stringify(a.results), JSON.stringify(b.results));
    assert.deepEqual(a.standings, b.standings);
  }
  assert.equal(b.finished, true);
});

test('otra semilla: el tráfico es distinto', () => {
  const a = createRace({ seed: 1, competitors: [{ id: 'x', controller: idle }] });
  const b = createRace({ seed: 2, competitors: [{ id: 'x', controller: idle }] });
  const va = a.world.vehiclesIn(0, 600).map((v) => `${v.lane}:${v.distance.toFixed(2)}`);
  const vb = b.world.vehiclesIn(0, 600).map((v) => `${v.lane}:${v.distance.toFixed(2)}`);
  assert.notDeepEqual(va, vb);
});

test('sin navegador: una carrera entera termina y da sus resultados', () => {
  assert.equal(typeof globalThis.document, 'undefined');
  const race = createRace({ track: 'grandPrix', competitors: [{ id: 'x', controller: randomBrainController(5) }] });
  runToEnd(race);
  assert.equal(race.finished, true);
  assert.ok(['arrived', 'unfinished'].includes(race.results[0].state));
});

// --- Un vehículo choca una sola vez (D1c, punto 5) ----------------------------------------------

test('penalización larga: el vehículo que ya lo chocó no lo vuelve a chocar; otro vehículo, sí', () => {
  const race = createRace({ seed: 5, density: 100, irregularity: 0, crashPenalty: 1, competitors: [{ id: 'a', controller: forward }] });
  const hits = [];
  let prev = 0;
  while (!race.finished && race.time < 60) {
    race.step();
    const r = race.results[0];
    if (r.crashes > prev) {
      prev = r.crashes;
      const a = race.world.agents[0];
      hits.push(a.crashCause === 'vehicle' ? a.crashVehicle : `edge@${Math.round(a.progress)}`);
    }
  }
  assert.ok(hits.length >= 2, `choca más de una vez (${hits.length})`);
  const vehicles = hits.filter((h) => !String(h).startsWith('edge'));
  assert.equal(new Set(vehicles).size, vehicles.length, `cada vehículo, una sola vez: ${vehicles.join(', ')}`);
});

test('otro competidor: el vehículo que chocó al primero también lo choca a él', () => {
  const race = createRace({ seed: 5, density: 100, irregularity: 0, competitors: [{ id: 'a', controller: forward }, { id: 'b', controller: forward }] });
  while (race.results[0].crashes === 0) race.step();
  assert.equal(race.results[1].crashes, 1);
  assert.equal(race.world.agents[0].crashVehicle, race.world.agents[1].crashVehicle);
});

test('los bordes cuentan siempre: dos choques contra el borde en el mismo lugar son dos', () => {
  const race = createRace({ density: 0, competitors: [{ id: 'a', controller: forwardLeft }] });
  while (race.results[0].crashes < 2 && !race.finished) race.step();
  assert.equal(race.results[0].crashes, 2);
});
