// Cerebros de ejemplo (pestana-competir, design.md D6): los entrena con el núcleo, comprueba lo que
// tienen que mostrar (spec `cerebros-de-ejemplo`) y escribe src/data/example-brains.js solo si todo se
// cumple. Usa solo el núcleo y semillas fijas: dos corridas dan el mismo archivo.
//
//   npm run examples
//
// Protocolo:
//   1. Cada ejemplo se entrena con los valores por defecto de Entrenar (población 400, calle de 3
//      carriles, densidad 50 %, irregularidad 0, 20 m/s) y su pista o pistas y su modo de tráfico,
//      con las semillas de EXAMPLE_PROTOCOL.seeds, en orden, hasta EXAMPLE_PROTOCOL.generations.
//   2. Los campeones de las últimas `candidates` generaciones se miden en carreras (createRace, con
//      la penalización por defecto, cada uno solo): en la calle con los diez tráficos nuevos de
//      `newTraffics`, en la calle con el tráfico de práctica y en los tres circuitos.
//   3. De cada semilla se queda con el campeón que mejor cumple la comprobación de su ejemplo
//      (EXAMPLE_CHECKS). Con la primera semilla en que los cuatro se cumplen y el contraste entre
//      los dos de la calle también, escribe el archivo. Si ninguna sirve, termina con error, informa
//      lo medido de cada intento y no escribe nada.
import { writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createTraining, SCENARIO_TRAFFIC_SEED } from '../src/core/training.js';
import { createRace } from '../src/core/race.js';
import { carForBrain, validateBrain } from '../src/core/brain.js';
import { TRACK_IDS } from '../src/core/circuits.js';

/** Ejemplos, en orden: id y lo que cambia respecto de los valores por defecto de Entrenar. */
export const EXAMPLE_SPECS = Object.freeze([
  Object.freeze({ id: 'street-new', config: Object.freeze({ tracks: ['straight'], trafficMode: 'new' }) }),
  Object.freeze({ id: 'street-same', config: Object.freeze({ tracks: ['straight'], trafficMode: 'same' }) }),
  Object.freeze({ id: 'oval', config: Object.freeze({ tracks: ['oval'], trafficMode: 'new' }) }),
  Object.freeze({ id: 'all-tracks', config: Object.freeze({ tracks: [...TRACK_IDS], trafficMode: 'new' }) }),
]);

export const EXAMPLE_PROTOCOL = Object.freeze({
  seeds: Object.freeze([1, 2, 3, 4, 5]),
  generations: 60,
  candidates: 10,
  newTraffics: Object.freeze([1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 1010]),
  // La calle de las carreras de comprobación: los valores por defecto de la pestaña (D3).
  street: Object.freeze({ lanes: 3, density: 50, irregularity: 0, maxSpeed: 20 }),
});

/** Fecha que llevan los ejemplos: son datos de la aplicación, no tienen una fecha propia. */
export const EXAMPLE_DATE = '2026-11-13T00:00:00.000Z';

/** Carrera de un solo competidor (un cerebro), con la penalización por defecto, hasta el final. */
export function raceAlone(brain, { track = 'straight', seed = 1, street = EXAMPLE_PROTOCOL.street } = {}) {
  const car = carForBrain(brain);
  const race = createRace({
    track, seed, lanes: street.lanes, density: street.density, irregularity: street.irregularity, maxSpeed: street.maxSpeed,
    competitors: [{ id: brain.id, controller: car.controller, sensors: car.sensors }],
  });
  while (!race.finished) race.step();
  const r = race.results[0];
  return { arrived: r.state === 'arrived', time: r.time, share: r.share, crashes: r.crashes };
}

/** Lo que se mide de un cerebro: los diez tráficos nuevos, el de práctica y los circuitos. */
export function measureBrain(brain, protocol = EXAMPLE_PROTOCOL) {
  const newTraffic = protocol.newTraffics.map((seed) => raceAlone(brain, { seed, street: protocol.street }));
  const sum = (f) => newTraffic.reduce((n, r) => n + f(r), 0);
  return {
    newTraffic,
    newCrashes: sum((r) => r.crashes) / newTraffic.length, // choques en promedio
    newArrivals: sum((r) => (r.arrived ? 1 : 0)),
    practice: raceAlone(brain, { seed: SCENARIO_TRAFFIC_SEED, street: protocol.street }),
    circuits: Object.fromEntries(TRACK_IDS.filter((id) => id !== 'straight').map((id) => [id, raceAlone(brain, { track: id })])),
  };
}

const byTime = (r) => (r.arrived ? r.time : Infinity);

/**
 * Comprobación propia de cada ejemplo (spec `cerebros-de-ejemplo`, "Lo que muestran los ejemplos"):
 * `ok` dice si cumple y `score` ordena a los que cumplen (menor es mejor).
 *   street-new   sin condición propia (su contraste es con street-same); menos choques en los tráficos nuevos
 *   street-same  llega sin chocar en el tráfico de práctica; antes
 *   oval         llega en el óvalo; antes
 *   all-tracks   llega en el óvalo y en los diez tráficos nuevos; menos choques
 */
export const EXAMPLE_CHECKS = Object.freeze({
  'street-new': (m) => ({ ok: true, score: [m.newCrashes, -m.newArrivals] }),
  'street-same': (m) => ({ ok: m.practice.arrived && m.practice.crashes === 0, score: [byTime(m.practice)] }),
  oval: (m) => ({ ok: m.circuits.oval.arrived, score: [byTime(m.circuits.oval)] }),
  'all-tracks': (m) => ({
    ok: m.circuits.oval.arrived && m.newArrivals === m.newTraffic.length,
    score: [m.newCrashes, byTime(m.circuits.oval)],
  }),
});

/** Contraste entre los dos de la calle: el de tráfico nuevo choca, en promedio, menos que el del mismo tráfico. */
export const generalizes = (streetNew, streetSame) => streetNew.newCrashes < streetSame.newCrashes;

const better = (a, b) => {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i];
  return false;
};

/**
 * Entrena un ejemplo con una semilla y devuelve el mejor campeón de las últimas generaciones según
 * su comprobación: { brain, measure, check, generation }, o el mejor aunque no cumpla.
 */
export function trainExample(spec, seed, protocol = EXAMPLE_PROTOCOL) {
  const training = createTraining({ seed, config: { ...spec.config } });
  const first = protocol.generations - protocol.candidates + 1;
  let best = null;
  training.onGeneration((record) => {
    if (record.generation < first) return;
    const brain = training.brain({ id: spec.id, name: spec.id, now: EXAMPLE_DATE });
    const measure = measureBrain(brain, protocol);
    const check = EXAMPLE_CHECKS[spec.id](measure);
    const candidate = { brain, measure, check, generation: record.generation, seed };
    if (!best || (check.ok && !best.check.ok) || (check.ok === best.check.ok && better(check.score, best.check.score))) best = candidate;
  });
  while (training.completed < protocol.generations) training.step();
  return best;
}

/**
 * Entrena y comprueba los cuatro ejemplos (D6). Devuelve { ok, chosen, attempts }: `chosen`, el
 * ejemplo elegido de cada id (si ok); `attempts`, lo medido de cada semilla probada.
 */
export function buildExamples(protocol = EXAMPLE_PROTOCOL, { log = () => {} } = {}) {
  const attempts = [];
  for (const seed of protocol.seeds) {
    const got = {};
    for (const spec of EXAMPLE_SPECS) {
      got[spec.id] = trainExample(spec, seed, protocol);
      log(`semilla ${seed} · ${spec.id}: ${summary(got[spec.id])}`);
    }
    const contrast = generalizes(got['street-new'].measure, got['street-same'].measure);
    const ok = contrast && EXAMPLE_SPECS.every((s) => got[s.id].check.ok);
    attempts.push({ seed, ok, contrast, got });
    log(`semilla ${seed}: contraste tráfico nuevo < mismo tráfico ${contrast ? 'sí' : 'no'} (${got['street-new'].measure.newCrashes} contra ${got['street-same'].measure.newCrashes} choques en promedio) → ${ok ? 'sirve' : 'no sirve'}`);
    if (ok) return { ok: true, chosen: got, attempts };
  }
  return { ok: false, chosen: null, attempts };
}

const fmt1 = (v) => (v === null || v === undefined ? '–' : v.toFixed(1));
const resultText = (r) => (r.arrived ? `llegó en ${fmt1(r.time)} s` : `no terminó, ${Math.round(r.share * 100)} %`) + `, ${r.crashes} choques`;

/** Resumen de lo medido de un candidato, en un renglón. */
export function summary(c) {
  const m = c.measure;
  return `generación ${c.generation}, cumple ${c.check.ok ? 'sí' : 'no'}; tráficos nuevos: llegó ${m.newArrivals} de ${m.newTraffic.length}, `
    + `${fmt1(m.newCrashes)} choques en promedio; práctica: ${resultText(m.practice)}; `
    + Object.entries(m.circuits).map(([id, r]) => `${id}: ${resultText(r)}`).join('; ');
}

/** Texto del archivo src/data/example-brains.js. */
export function renderExamples(chosen) {
  const header = EXAMPLE_SPECS.map((s) => `//   ${s.id} (semilla ${chosen[s.id].seed}): ${summary(chosen[s.id])}`).join('\n');
  const brains = EXAMPLE_SPECS.map((s) => JSON.stringify(chosen[s.id].brain)).join(',\n  ');
  return `// Cerebros de ejemplo (pestana-competir, design.md D6). ARCHIVO GENERADO por tools/train-examples.mjs
// (npm run examples): no se edita a mano. Lo medido al generarlo, con carreras de un solo competidor
// y la penalización por defecto (tráficos nuevos: semillas ${EXAMPLE_PROTOCOL.newTraffics[0]} a ${EXAMPLE_PROTOCOL.newTraffics[EXAMPLE_PROTOCOL.newTraffics.length - 1]}):
${header}
//
// El nombre visible de cada uno sale de los textos de la aplicación (compete.example.<id>), no del dato.

/** Los cuatro cerebros de ejemplo, en el orden de la lista de competidores. */
export const EXAMPLE_BRAINS = Object.freeze([
  ${brains},
].map(Object.freeze));

/** Ids de los ejemplos, en orden. */
export const EXAMPLE_IDS = Object.freeze(EXAMPLE_BRAINS.map((b) => b.id));
`;
}

export const OUTPUT = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data', 'example-brains.js');

function main() {
  const t0 = Date.now();
  const result = buildExamples(EXAMPLE_PROTOCOL, { log: (line) => console.log(line) });
  if (!result.ok) {
    console.error('Ningún intento cumple lo que tienen que mostrar los ejemplos: no se escribe nada.');
    process.exit(1);
  }
  for (const s of EXAMPLE_SPECS) {
    const problem = validateBrain(result.chosen[s.id].brain);
    if (problem) { console.error(`${s.id}: cerebro inválido (${problem.code})`); process.exit(1); }
  }
  writeFileSync(OUTPUT, renderExamples(result.chosen));
  console.log(`Escrito ${OUTPUT} en ${Math.round((Date.now() - t0) / 1000)} s.`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
