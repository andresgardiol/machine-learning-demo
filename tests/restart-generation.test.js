// Volver a empezar la generación en curso (panel-de-entrenar-por-vistas D12, spec neuroevolucion).
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTraining, SCENARIO_KEYS } from '../src/core/training.js';

const small = (config = {}) => ({ population: 6, elite: 1, maxDuration: 10, ...config });
const nets = (t) => JSON.stringify(t.networks);
const traffic = (t) => JSON.stringify(t.world.vehiclesIn(0, 400).map((v) => [v.lane, v.distance]));

/** Corre `n` pasos sin dejar que la generación termine sola. */
function run(t, n) {
  const g = t.generation;
  for (let i = 0; i < n && t.generation === g; i++) t.step();
}

test('Cambio de escenario: la generación 7 vuelve a empezar en otra pista, con las mismas redes y 6 registros', () => {
  const t = createTraining({ seed: 3, config: small() });
  for (let i = 0; i < 6; i++) t.finishGeneration();
  assert.equal(t.generation, 7);
  run(t, 60);
  const before = nets(t);
  const champion = t.champion;
  t.configure({ tracks: ['oval'] });
  assert.deepEqual(t.pending, { tracks: ['oval'] });
  t.restartGeneration();
  assert.equal(t.generation, 7);
  assert.equal(t.trackId, 'oval');
  assert.equal(nets(t), before);
  assert.equal(t.history.length, 6);
  assert.equal(t.champion, champion);
  assert.equal(t.pending, null);
  assert.equal(t.world.steps, 0);
  assert.equal(t.aliveCount, t.population);
  for (const a of t.world.agents) assert.equal(a.crashed, false);
});

test('Sin cambios pendientes: la generación vuelve a empezar igual que la primera vez, con el mismo tráfico', () => {
  const t = createTraining({ seed: 5, config: small({ density: 70 }) });
  t.finishGeneration();
  const startTraffic = traffic(t);
  run(t, 80);
  const firstRun = t.fitnesses();
  t.restartGeneration();
  assert.equal(traffic(t), startTraffic);
  run(t, 80);
  assert.deepEqual(t.fitnesses(), firstRun);
});

test('Los cambios que no son del escenario siguen esperando a la generación siguiente', () => {
  const t = createTraining({ seed: 2, config: small() });
  t.configure({ elite: 2, density: 80 });
  t.restartGeneration();
  assert.equal(t.config.density, 80);
  assert.equal(t.config.elite, 1);
  assert.deepEqual(t.pending, { elite: 2 });
  t.finishGeneration();
  assert.equal(t.config.elite, 2);
  assert.deepEqual(SCENARIO_KEYS, ['tracks', 'lanes', 'density', 'irregularity', 'maxSpeed']);
});

test('Selección manual: el padre elegido y sus elecciones anteriores no cambian', () => {
  const t = createTraining({ seed: 4, config: small({ selectionMode: 'manual' }) });
  run(t, 40);
  t.chooseLeader();
  t.finishGeneration();
  run(t, 60);
  t.chooseLeader();
  const parent = t.parent;
  const count = t.choiceCount;
  t.configure({ lanes: 4 });
  t.restartGeneration();
  assert.deepEqual(t.parent, parent);
  assert.equal(t.choiceCount, count);
  assert.equal(t.config.lanes, 4);
});

test('Reinicio reproducible: misma semilla, mismos cambios y mismos reinicios dan la misma población', () => {
  const play = () => {
    const t = createTraining({ seed: 9, config: small() });
    const out = [];
    for (let g = 0; g < 5; g++) {
      run(t, 50);
      if (g === 1) { t.configure({ density: 20 }); t.restartGeneration(); }
      if (g === 3) { t.configure({ tracks: ['kidney'] }); t.restartGeneration(); }
      run(t, 120);
      t.finishGeneration();
      out.push(nets(t));
    }
    return out;
  };
  assert.deepEqual(play(), play());
});
