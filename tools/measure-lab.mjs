// Mediciones del Laboratorio (pestana-laboratorio, tareas 2.1 a 2.6). Usa solo el núcleo. No forma
// parte de `npm test` porque tarda.
//
//   node tools/measure-lab.mjs shapes      2.1 y 2.2: épocas hasta el 90 % de aciertos en los apartados
//   node tools/measure-lab.mjs overfit     2.3: sobreajuste con la receta de D9 y dos variantes
//   node tools/measure-lab.mjs imitation   2.5: aprender a manejar imitando a street-new en la calle recta
//   node tools/measure-lab.mjs oval        2.6: lo mismo con el maestro del óvalo en el óvalo
//   node tools/measure-lab.mjs oval-wide   2.6 ampliada: redes 8, 8+8 y 8+8+8, tasas 0,03 y 0,1, 500 y 1000 épocas
//
// Protocolo común: los puntos se generan con la semilla 1 y se apartan con la semilla 1; cada
// "semilla de pesos" s da la red inicial (createNetwork con createRandom(s)) y el orden de las
// épocas (createLearningRun con seed s).
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { createLearningRun } from '../src/core/learning-cursor.js';
import { pointsDataset, splitDataset, drivingExamples } from '../src/core/datasets.js';
import { overfitting } from '../src/core/overfitting.js';
import { evaluate, softOutputs } from '../src/core/backprop.js';
import { carForBrain, createNetworkController } from '../src/core/brain.js';
import { createRace } from '../src/core/race.js';
import { EXAMPLE_BRAINS } from '../src/data/example-brains.js';
import { STEP } from '../src/core/constants.js';

const SEEDS = [1, 2, 3, 4, 5];
const mode = process.argv[2] ?? 'shapes';

function learner({ data, hidden, activation = 'tanh', rate, seed, holdout = 30 }) {
  const split = splitDataset(data, { holdout, seed: 1 });
  const network = createNetwork({ inputs: data.inputs, hidden, outputs: data.outputs, activation, random: createRandom(seed) });
  return { split, run: createLearningRun({ network, practice: split.practice, heldOut: split.heldOut, rate, seed }) };
}

/** Épocas hasta que los apartados llegan a `target` de aciertos (null si no llega en `max`). */
function epochsTo({ data, hidden, rate, seed, target = 0.9, max = 1000 }) {
  const { run } = learner({ data, hidden, rate, seed });
  for (let e = 1; e <= max; e++) {
    run.advance('epoch');
    if (run.history[e - 1].heldOut.accuracy >= target) return e;
  }
  return null;
}

const fmtCell = (xs) => xs.map((x) => (x === null ? '—' : String(x))).join(' ');

if (mode === 'shapes') {
  const rates = [0.03, 0.1, 0.3, 1];
  console.log('## 2.1 Épocas hasta 90 % de aciertos en los apartados (200 puntos, ruido 10 %, 30 % apartados, una capa de 4 con tanh)');
  console.log('Cada celda: las cinco semillas de pesos (1 a 5); "—" = no llegó en 1000 épocas.\n');
  console.log(`| forma | ${rates.join(' | ')} |`);
  console.log(`|---|${rates.map(() => '---').join('|')}|`);
  for (const shape of ['blobs', 'circle', 'xor', 'spiral']) {
    const data = pointsDataset({ shape, count: 200, noise: 10, seed: 1 });
    const cells = rates.map((rate) => fmtCell(SEEDS.map((seed) => epochsTo({ data, hidden: [4], rate, seed }))));
    console.log(`| ${shape} | ${cells.join(' | ')} |`);
  }
  console.log('\n## 2.2 Espiral con redes más grandes (tanh), épocas hasta 90 % en los apartados');
  const data = pointsDataset({ shape: 'spiral', count: 200, noise: 10, seed: 1 });
  console.log(`| red | ${rates.join(' | ')} |`);
  console.log(`|---|${rates.map(() => '---').join('|')}|`);
  for (const hidden of [[8], [8, 8], [8, 8, 8]]) {
    const cells = rates.map((rate) => fmtCell(SEEDS.map((seed) => epochsTo({ data, hidden, rate, seed, max: 2000 }))));
    console.log(`| ${hidden.join('+')} | ${cells.join(' | ')} |`);
  }
}

if (mode === 'overfit') {
  const rate = Number(process.argv[3] ?? 0.1);
  const recipes = [
    { name: 'D9: 40 puntos, ruido 30 %, 8+8+8', count: 40, noise: 30, hidden: [8, 8, 8], shape: 'circle' },
    { name: 'variante A: 40 puntos, ruido 50 %, 8+8+8', count: 40, noise: 50, hidden: [8, 8, 8], shape: 'circle' },
    { name: 'variante B: 20 puntos, ruido 30 %, 8+8+8', count: 20, noise: 30, hidden: [8, 8, 8], shape: 'circle' },
    { name: 'variante C: 40 puntos, ruido 30 %, 8+8+8, cruzado', count: 40, noise: 30, hidden: [8, 8, 8], shape: 'xor' },
  ];
  const EPOCHS = 600;
  console.log(`## 2.3 Sobreajuste (tasa ${rate}, ${EPOCHS} épocas, 30 % apartados, tanh, cinco semillas de pesos)\n`);
  for (const r of recipes) {
    const data = pointsDataset({ shape: r.shape, count: r.count, noise: r.noise, seed: 1 });
    console.log(`### ${r.name} (${r.shape})`);
    console.log('| semilla | época del aviso | época del mínimo | error mínimo apartados | error apartados al final | subida | error práctica en el mínimo → final | aciertos práctica / apartados al final |');
    console.log('|---|---|---|---|---|---|---|---|');
    let fired = 0;
    for (const seed of SEEDS) {
      const { run } = learner({ data, hidden: r.hidden, rate, seed });
      let warnAt = null;
      for (let e = 1; e <= EPOCHS; e++) { run.advance('epoch'); if (!warnAt && run.warning) warnAt = run.warning.epoch; }
      const o = overfitting(run.history);
      const h = run.history;
      const last = h[h.length - 1];
      const m = h[o.bestEpoch - 1];
      if (warnAt) fired += 1;
      const pct = (x) => `${Math.round(x * 100)} %`;
      console.log(`| ${seed} | ${warnAt ?? '—'} | ${o.bestEpoch} | ${o.best.toFixed(3)} | ${last.heldOut.loss.toFixed(3)} | ${pct(last.heldOut.loss / o.best - 1)} | ${m.practice.loss.toFixed(3)} → ${last.practice.loss.toFixed(3)} | ${pct(last.practice.accuracy)} / ${pct(last.heldOut.accuracy)} |`);
    }
    console.log(`\nAviso en ${fired} de 5 semillas.\n`);
  }
}

/** Carrera del alumno contra el maestro en un tráfico. */
function raceAgainst({ student, teacherBrain, track, seed, density, lanes = 3 }) {
  const t = carForBrain(teacherBrain);
  const race = createRace({
    track, seed, lanes, density, irregularity: 0, maxSpeed: 20,
    competitors: [
      { id: 'student', controller: createNetworkController(student, teacherBrain.sensors.count), sensors: { ...teacherBrain.sensors } },
      { id: 'teacher', controller: t.controller, sensors: t.sensors },
    ],
  });
  while (!race.finished) race.step();
  return Object.fromEntries(race.results.map((r) => [r.id, r]));
}

function imitation({ teacherId, track, density, shapes = [[8], [8, 8]], checkpoints = [50, 100, 200] }) {
  const teacherBrain = EXAMPLE_BRAINS.find((b) => b.id === teacherId);
  const t = carForBrain(teacherBrain);
  const t0 = process.hrtime.bigint();
  const data = drivingExamples({ controller: t.controller, sensors: t.sensors, track, lanes: 3, density, irregularity: 0, maxSpeed: 20, seconds: 60, seed: 1 });
  const genMs = Number(process.hrtime.bigint() - t0) / 1e6;
  const shares = [0, 1, 2, 3].map((k) => data.examples.filter((e) => e.targets[k] === 1).length / data.examples.length);
  console.log(`Ejemplos: ${data.examples.length} (${data.attempts} intento(s), ${data.crashes} choque(s)), generados en ${genMs.toFixed(0)} ms.`);
  console.log(`Parte con cada control: avanzar ${(shares[0] * 100).toFixed(1)} %, izquierda ${(shares[1] * 100).toFixed(1)} %, derecha ${(shares[2] * 100).toFixed(1)} %, retroceder ${(shares[3] * 100).toFixed(1)} %.\n`);
  const raceSeeds = [2001, 2002, 2003, 2004, 2005];
  const rates = (process.argv[3] ?? '0.1').split(',').map(Number);
  console.log('| red | tasa | épocas | entrenar (s, núcleo) | aciertos apartados | aciertos apartados al doblar | carreras: llegó / tiempo / choques (alumno vs. maestro) |');
  console.log('|---|---|---|---|---|---|---|');
  for (const hidden of shapes) {
    for (const rate of rates) {
      const { split, run } = learner({ data, hidden, rate, seed: 1 });
      const turning = split.heldOut.filter((e) => e.targets[1] === 1 || e.targets[2] === 1);
      let done = 0;
      let trainMs = 0;
      for (const epochs of checkpoints) {
        const t1 = process.hrtime.bigint();
        run.runEpochs(epochs - done);
        trainMs += Number(process.hrtime.bigint() - t1) / 1e6;
        done = epochs;
        const all = evaluate(run.network, split.heldOut);
        const turn = evaluate(run.network, turning);
        const races = raceSeeds.map((seed) => raceAgainst({ student: run.network, teacherBrain, track, seed, density }));
        const arrived = races.filter((r) => r.student.state === 'arrived').length;
        const cell = races.map((r) => `${r.student.state === 'arrived' ? 'sí' : 'no'} ${r.student.time === null ? `(${Math.round(r.student.share * 100)} %)` : `${r.student.time.toFixed(1)} s`} ${r.student.crashes}ch vs ${r.teacher.time === null ? 'no' : `${r.teacher.time.toFixed(1)} s`} ${r.teacher.crashes}ch`).join('; ');
        console.log(`| ${hidden.join('+')} | ${rate} | ${epochs} | ${(trainMs / 1000).toFixed(1)} | ${(all.accuracy * 100).toFixed(1)} % | ${turning.length ? `${(turn.accuracy * 100).toFixed(1)} % de ${turning.length}` : '—'} | llegó ${arrived}/5: ${cell} |`);
      }
    }
  }
}

if (mode === 'imitation') {
  console.log('## 2.5 Imitación: maestro street-new, 60 s en la calle recta (3 carriles, tráfico 50 %, velocidad 20)\n');
  imitation({ teacherId: 'street-new', track: 'straight', density: 50 });
}
if (mode === 'oval') {
  console.log('## 2.6 Imitación: maestro oval, 60 s en el óvalo (sin tráfico, velocidad 20)\n');
  imitation({ teacherId: 'oval', track: 'oval', density: 50 });
}

if (mode === 'oval-wide') {
  console.log('## 2.6 ampliada: maestro oval, 60 s en el óvalo (velocidad 20)\n');
  imitation({ teacherId: 'oval', track: 'oval', density: 50, shapes: [[8], [8, 8], [8, 8, 8]], checkpoints: [500, 1000] });
}

export { STEP, softOutputs };
