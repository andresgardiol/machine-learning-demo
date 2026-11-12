// Comprobación de aprendizaje (fitness-que-premia-superar D6): ¿la población aprende a superar al
// tráfico con los valores por defecto? Usa solo el núcleo. No forma parte de `npm test` porque tarda
// unos minutos.
//
//   npm run test:learning
//
// Protocolo:
//   1. Para cada semilla de entrenamiento (1 a 8): un entrenamiento con los valores por defecto,
//      hasta completar 60 generaciones.
//   2. Al terminar cada generación de la 51 a la 60, su campeón maneja solo 60 s en cada uno de los
//      tráficos de semillas 5000 a 5009, con los carriles, la densidad y la irregularidad del
//      entrenamiento y velocidad máxima 20.
//   3. En cada manejo se cuentan los vehículos que empezaron en d0 < ventaja − CAR_LENGTH, con la
//      mayor ventaja del manejo (el mismo criterio que training.passedOf).
//   4. Se promedian los 800 manejos. Todo se repite con la función distancia.
//
// Termina con error si el promedio con los valores por defecto es menor que 8, si el de alguna
// semilla es menor que 5 o si el promedio con la función distancia es mayor que 2.
import { pathToFileURL } from 'node:url';
import { createTraining } from '../src/core/training.js';
import { createWorld } from '../src/core/world.js';
import { createNetworkController } from '../src/core/brain.js';
import { CAR_LENGTH, STEP, TRAFFIC_SPEED } from '../src/core/constants.js';

export const LEARNING_PROTOCOL = Object.freeze({
  seeds: Object.freeze([1, 2, 3, 4, 5, 6, 7, 8]),
  generations: 60, // generaciones de entrenamiento
  measured: 10, // se miden los campeones de las últimas `measured` generaciones
  testSeeds: Object.freeze([5000, 5001, 5002, 5003, 5004, 5005, 5006, 5007, 5008, 5009]),
  seconds: 60,
  maxSpeed: 20,
});

export const LEARNING_THRESHOLDS = Object.freeze({ minAverage: 8, minPerSeed: 5, maxDistance: 2 });

/**
 * Un manejo de prueba: la red maneja sola `seconds` s (o hasta chocar) en el tráfico de `seed`.
 * @returns {{passed:number, crashed:boolean, lead:number}}
 */
export function testDrive(network, { seed, lanes, density, irregularity, sensors, maxSpeed, seconds }) {
  const world = createWorld({
    seed, lanes, density, irregularity,
    cars: [{ controller: createNetworkController(network, sensors.count), sensors, maxSpeed }],
  });
  const reach = (maxSpeed - TRAFFIC_SPEED) * seconds + 2 * CAR_LENGTH;
  const starts = world.vehiclesIn(0, reach).map((v) => v.distance);
  const agent = world.agents[0];
  const steps = Math.round(seconds / STEP);
  let lead = 0;
  for (let s = 0; s < steps && !agent.crashed; s++) {
    world.step();
    const l = agent.progress - TRAFFIC_SPEED * world.time;
    if (l > lead) lead = l;
  }
  const line = lead - CAR_LENGTH;
  return { passed: starts.filter((d) => d < line).length, crashed: agent.crashed, lead };
}

/**
 * Medida de aprendizaje con una configuración de entrenamiento.
 * @param {{config?:object, seeds?:number[], generations?:number, measured?:number, testSeeds?:number[],
 *   seconds?:number, maxSpeed?:number, onProgress?:(info:object)=>void}} options
 * @returns {{average:number, crashRate:number, perSeed:{seed:number, average:number, crashRate:number}[]}}
 */
export function measureLearning({ config = {}, onProgress = () => {}, ...overrides } = {}) {
  const p = { ...LEARNING_PROTOCOL, ...overrides };
  const firstMeasured = p.generations - p.measured + 1;
  const perSeed = [];
  let total = 0;
  let crashes = 0;
  let drives = 0;
  for (const seed of p.seeds) {
    const t = createTraining({ seed, config });
    let seedTotal = 0;
    let seedCrashes = 0;
    let seedDrives = 0;
    t.onGeneration((record) => {
      if (record.generation < firstMeasured || record.generation > p.generations) return;
      const { network } = t.champion;
      for (const testSeed of p.testSeeds) {
        const r = testDrive(network, {
          seed: testSeed, lanes: t.config.lanes, density: t.config.density, irregularity: t.config.irregularity,
          sensors: t.config.sensors, maxSpeed: p.maxSpeed, seconds: p.seconds,
        });
        seedTotal += r.passed;
        seedCrashes += r.crashed ? 1 : 0;
        seedDrives += 1;
      }
    });
    while (t.completed < p.generations) t.step();
    perSeed.push({ seed, average: seedTotal / seedDrives, crashRate: seedCrashes / seedDrives });
    total += seedTotal;
    crashes += seedCrashes;
    drives += seedDrives;
    onProgress({ seed, ...perSeed[perSeed.length - 1] });
  }
  return { average: total / drives, crashRate: crashes / drives, perSeed };
}

const fmt = (x) => x.toFixed(1).replace('.', ',');
const pct = (x) => `${Math.round(x * 100)} %`;

function printTable(rows, seeds) {
  const head = ['Configuración', 'Promedio', ...seeds.map((s) => `S${s}`), 'Chocan'];
  const lines = [head, ...rows.map((r) => [r.name, fmt(r.result.average), ...r.result.perSeed.map((x) => fmt(x.average)), pct(r.result.crashRate)])];
  const widths = head.map((_, c) => Math.max(...lines.map((l) => l[c].length)));
  const out = lines.map((l) => `| ${l.map((cell, c) => cell.padEnd(widths[c])).join(' | ')} |`);
  out.splice(1, 0, `|${widths.map((w) => '-'.repeat(w + 2)).join('|')}|`);
  console.log(out.join('\n'));
}

function main() {
  const started = Date.now();
  const log = (name) => ({ seed, average }) => console.error(`  ${name}: semilla ${seed} → ${fmt(average)} (${Math.round((Date.now() - started) / 1000)} s)`);
  console.error('Midiendo con los valores por defecto…');
  const defaults = measureLearning({ onProgress: log('ventaja') });
  console.error('Midiendo con la función distancia…');
  const distance = measureLearning({ config: { fitness: 'distance' }, onProgress: log('distancia') });
  console.log(`\nVehículos superados por los campeones de las generaciones ${LEARNING_PROTOCOL.generations - LEARNING_PROTOCOL.measured + 1} a ${LEARNING_PROTOCOL.generations}, en ${LEARNING_PROTOCOL.testSeeds.length} tráficos que no vieron (${LEARNING_PROTOCOL.seconds} s cada uno):\n`);
  printTable([
    { name: 'Valores por defecto (ventaja)', result: defaults },
    { name: 'Función distancia', result: distance },
  ], LEARNING_PROTOCOL.seeds);
  const { minAverage, minPerSeed, maxDistance } = LEARNING_THRESHOLDS;
  const problems = [];
  if (defaults.average < minAverage) problems.push(`el promedio con los valores por defecto (${fmt(defaults.average)}) es menor que ${minAverage}`);
  for (const s of defaults.perSeed) if (s.average < minPerSeed) problems.push(`la semilla ${s.seed} (${fmt(s.average)}) es menor que ${minPerSeed}`);
  if (distance.average > maxDistance) problems.push(`el promedio con la función distancia (${fmt(distance.average)}) es mayor que ${maxDistance}`);
  console.log(`\nTardó ${Math.round((Date.now() - started) / 1000)} s.`);
  if (problems.length > 0) {
    console.log(`\nNo cumple: ${problems.join('; ')}.`);
    process.exitCode = 1;
  } else {
    console.log(`\nCumple: promedio ≥ ${minAverage}, cada semilla ≥ ${minPerSeed} y distancia ≤ ${maxDistance}.`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) main();
