// Calibración de los valores por defecto del entrenamiento (design.md, riesgos): entrena 20
// generaciones con la configuración por defecto en 10 semillas e informa la mejor distancia de cada
// una. Criterio: al menos 300 metros en 8 de las 10 semillas.
//
//   node tools/calibrate.mjs
import { performance } from 'node:perf_hooks';
import { createTraining, DEFAULT_TRAINING_CONFIG } from '../src/core/training.js';

const SEEDS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const GENERATIONS = 20;
const GOAL_METERS = 300;
const GOAL_SEEDS = 8;

console.log(`Configuración por defecto: población ${DEFAULT_TRAINING_CONFIG.population}, élite ${DEFAULT_TRAINING_CONFIG.elite}, `
  + `selección ${DEFAULT_TRAINING_CONFIG.selection} %, mutación ${DEFAULT_TRAINING_CONFIG.mutationStrength} % `
  + `(probabilidad ${DEFAULT_TRAINING_CONFIG.mutationRate} %), fitness ${DEFAULT_TRAINING_CONFIG.fitness}, `
  + `duración ${DEFAULT_TRAINING_CONFIG.maxDuration} s, tráfico ${DEFAULT_TRAINING_CONFIG.trafficMode}, `
  + `red ${DEFAULT_TRAINING_CONFIG.sensors.count + 1}-${DEFAULT_TRAINING_CONFIG.hidden.join('-')}-4 (${DEFAULT_TRAINING_CONFIG.activation})`);
console.log(`${GENERATIONS} generaciones por semilla\n`);

let reached = 0;
const t0 = performance.now();
for (const seed of SEEDS) {
  const training = createTraining({ seed });
  const start = performance.now();
  while (training.completed < GENERATIONS) training.step();
  const bests = training.history.map((h) => h.best);
  const best = Math.max(...bests);
  const ok = best >= GOAL_METERS;
  if (ok) reached += 1;
  const reasons = training.history.reduce((acc, h) => ({ ...acc, [h.reason]: (acc[h.reason] ?? 0) + 1 }), {});
  console.log(`semilla ${String(seed).padStart(2)}: mejor distancia ${best.toFixed(1).padStart(7)} m ${ok ? '✓' : '✗'}`
    + `  (generación 1: ${bests[0].toFixed(1)} m; motivos: ${Object.entries(reasons).map(([k, v]) => `${k} ${v}`).join(', ')}; `
    + `${((performance.now() - start) / 1000).toFixed(1)} s)`);
}
console.log(`\nSemillas con al menos ${GOAL_METERS} m: ${reached} de ${SEEDS.length} (criterio: ${GOAL_SEEDS})`);
console.log(`Criterio ${reached >= GOAL_SEEDS ? 'cumplido' : 'NO cumplido'}. Tiempo total: ${((performance.now() - t0) / 1000).toFixed(1)} s`);
process.exitCode = reached >= GOAL_SEEDS ? 0 : 1;
