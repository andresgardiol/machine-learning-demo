// Medición del mundo con varios autos (design.md D2): 100 autos durante 3600 pasos (60 segundos
// simulados) en Node. El objetivo es superar 20 veces el tiempo real.
//
//   node tools/bench.mjs
//
// Mide dos casos y repite cada uno varias veces para quedarse con la mejor y la peor corrida:
//   - "redes al azar": 100 autos manejados por redes 6-6-4 al azar, como en la primera generación
//     de un entrenamiento. Cuando chocan todos, empieza otra población (como hace el
//     entrenamiento), así los 3600 pasos son siempre pasos con autos en carrera.
//   - "todos en carrera": el peor caso para el costo por paso. Los 100 autos van rectos por el
//     carril central: aceleran mientras el rayo del medio no ve nada y, cuando ve un vehículo,
//     se quedan detrás de él a su velocidad. Ninguno choca en los 60 segundos y el tráfico queda
//     al alcance de sus sensores, así cada paso calcula rayos contra vehículos para los 100.
import { performance } from 'node:perf_hooks';
import { createWorld } from '../src/core/world.js';
import { createNetwork, computeNetwork } from '../src/core/network.js';
import { randomFor } from '../src/core/random.js';
import { STEP, TRAFFIC_SPEED } from '../src/core/constants.js';

const CARS = 100;
const STEPS = 3600;
const RUNS = 5;
const TARGET = 20;

function networkController(net) {
  return {
    control({ sensors, speed }) {
      const [forward, left, right, reverse] = computeNetwork(net, [...sensors, speed]);
      return { forward: forward === 1, left: left === 1, right: right === 1, reverse: reverse === 1 };
    },
  };
}

function randomCars(generation) {
  return Array.from({ length: CARS }, (_, i) => ({
    controller: networkController(createNetwork({ inputs: 6, hidden: [6], outputs: 4, random: randomFor(1000 + generation, i) })),
  }));
}

/** Va recto: acelera si no ve nada adelante; si ve un vehículo, se queda detrás a su velocidad. */
const follower = {
  control({ sensors, speed }) {
    const ahead = sensors[Math.floor(sensors.length / 2)];
    return { forward: ahead === 0 || speed * 15 < TRAFFIC_SPEED - 1 };
  },
};

function randomNetworks() {
  let generation = 0;
  let world = createWorld({ seed: 1, cars: randomCars(generation) });
  let carSteps = 0;
  const t0 = performance.now();
  for (let i = 0; i < STEPS; i++) {
    if (world.aliveCount === 0) {
      generation += 1;
      world = createWorld({ seed: 1, cars: randomCars(generation) });
    }
    carSteps += world.aliveCount;
    world.step();
  }
  const ms = performance.now() - t0;
  return { ms, carSteps, generations: generation + 1 };
}

function allRacing() {
  const world = createWorld({ seed: 1, density: 50, cars: Array.from({ length: CARS }, () => ({ controller: follower })) });
  let carSteps = 0;
  let sawTraffic = 0;
  const t0 = performance.now();
  for (let i = 0; i < STEPS; i++) {
    carSteps += world.aliveCount;
    world.step();
    if (world.agents[0].nearby.length > 0) sawTraffic += 1;
  }
  const ms = performance.now() - t0;
  return { ms, carSteps, alive: world.aliveCount, sawTraffic };
}

function report(name, runs, extra) {
  const simulated = STEPS * STEP;
  const factors = runs.map((r) => simulated / (r.ms / 1000));
  const worst = Math.min(...factors);
  const best = Math.max(...factors);
  const ms = runs.map((r) => r.ms);
  console.log(`${name}: ${CARS} autos, ${STEPS} pasos (${simulated} s simulados), ${RUNS} corridas`);
  console.log(`  tiempo: ${Math.min(...ms).toFixed(0)} a ${Math.max(...ms).toFixed(0)} ms`);
  console.log(`  factor sobre el tiempo real: ${worst.toFixed(1)}x (peor) a ${best.toFixed(1)}x (mejor)`);
  console.log(`  autos-paso en carrera: ${runs[0].carSteps}${extra ? `; ${extra(runs[0])}` : ''}`);
  console.log(`  objetivo (más de ${TARGET}x): ${worst > TARGET ? 'cumplido' : 'NO cumplido'}`);
  return worst > TARGET;
}

// Calentamiento: la primera corrida incluye la compilación del motor de JavaScript.
randomNetworks();
allRacing();

const a = report('Redes al azar', Array.from({ length: RUNS }, randomNetworks), (r) => `poblaciones: ${r.generations}`);
const b = report('Todos en carrera', Array.from({ length: RUNS }, allRacing), (r) => `en carrera al final: ${r.alive}; pasos con tráfico cerca: ${r.sawTraffic} de ${STEPS}`);
console.log(`Node ${process.version}, ${process.platform} ${process.arch}`);
process.exitCode = a && b ? 0 : 1;
