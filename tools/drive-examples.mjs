// Maneja los programas de ejemplo de Reglas y los cuatro cerebros de ejemplo en diez tráficos
// nuevos de la calle (semillas 1 a 10, valores por defecto, 60 s), y cuenta choques y vehículos
// superados (trafico-vivo, tareas 1.3 y 9.1). Es solo inferencia: no entrena nada.
//
//   node tools/drive-examples.mjs [--root <carpeta de otra copia del repositorio>]
//
// Con --root, importa el núcleo de esa copia (por ejemplo, la del commit de partida) para medir el
// "antes" con el mismo procedimiento. Cada corrida termina en el primer choque o a los 60 s, como un
// intento de la pestaña: "choques" es cuántos de los diez tráficos terminan en choque.
import { pathToFileURL } from 'node:url';
import path from 'node:path';

export const SEEDS = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
export const SECONDS = 60;

/** Módulos de una copia del repositorio. */
export async function loadRoot(root) {
  const at = (p) => import(pathToFileURL(path.resolve(root, p)).href);
  const [world, rules, settings, examples, brains, brain, session, es, constants] = await Promise.all([
    at('src/core/world.js'), at('src/core/rules.js'), at('src/tabs/shared/street-settings.js'),
    at('src/tabs/rules/examples.js'), at('src/data/example-brains.js'), at('src/core/brain.js'),
    at('src/tabs/drive/session.js'), at('src/i18n/es.js'), at('src/core/constants.js'),
  ]);
  return { world, rules, settings, examples, brains, brain, session, es: es.default, constants };
}

/** Competidores: los programas de Reglas (con sus sensores) y los cerebros de ejemplo (con los suyos). */
export function competitors(m) {
  const { DEFAULT_SETTINGS } = m.settings;
  const programs = m.examples.PROGRAMS.map((p) => ({
    id: `reglas:${p.id}`,
    make: () => {
      const r = m.rules.parseProgram(m.es[p.textKey], { sensors: p.sensors.count });
      return {
        controller: m.rules.createRulesController({ program: r.program }),
        settings: { ...DEFAULT_SETTINGS, ...m.examples.sensorSettings(p) },
      };
    },
  }));
  const brains = m.brains.EXAMPLE_BRAINS.map((b) => ({
    id: `cerebro:${b.id}`,
    make: () => {
      const car = m.brain.carForBrain(b);
      return {
        controller: car.controller,
        settings: {
          ...DEFAULT_SETTINGS, maxSpeed: car.maxSpeed,
          sensorCount: car.sensors.count, sensorRange: car.sensors.range, sensorSpread: car.sensors.spread,
        },
      };
    },
  }));
  return [...programs, ...brains];
}

/**
 * Una corrida: hasta el primer choque o SECONDS. `onStep(world)` se llama después de cada paso (por
 * ejemplo, para saber si el choque fue dentro de un muro).
 */
export function driveOne(m, competitor, seed, { onCrash } = {}) {
  const { controller, settings } = competitor.make();
  const world = m.world.createWorld({ ...m.settings.worldSpec(settings, seed), controller });
  const session = m.session.createDriveSession();
  const steps = Math.round(SECONDS / m.constants.STEP);
  for (let i = 0; i < steps && !world.crashed; i += 1) {
    world.step();
    session.observe(world);
  }
  const out = {
    crashed: world.crashed, cause: world.crashCause, seconds: world.time,
    distance: session.distance, passed: session.passed,
  };
  if (world.crashed && onCrash) out.crash = onCrash(world);
  return out;
}

/** Las diez corridas de cada competidor. */
export function driveExamples(m, options) {
  return competitors(m).map((c) => ({ id: c.id, runs: SEEDS.map((seed) => driveOne(m, c, seed, options)) }));
}

/** Resumen de las diez corridas de un competidor. */
export function summarize(runs) {
  const crashes = runs.filter((r) => r.crashed).length;
  const passed = runs.map((r) => r.passed);
  const mean = (xs) => xs.reduce((a, x) => a + x, 0) / xs.length;
  return {
    crashes,
    byCause: runs.reduce((acc, r) => (r.crashed ? { ...acc, [r.cause]: (acc[r.cause] ?? 0) + 1 } : acc), {}),
    passedMean: mean(passed), passedMin: Math.min(...passed), passedMax: Math.max(...passed),
    distanceMean: mean(runs.map((r) => r.distance)),
  };
}

/** Vehículos por kilómetro en el instante 0 (los primeros diez kilómetros), promedio de semillas. */
export function vehiclesPerKm(m, { lanes = 3, density = 50, irregularity = 50, seeds = SEEDS } = {}) {
  let total = 0;
  for (const seed of seeds) {
    const world = m.world.createWorld({ seed, lanes, density, irregularity });
    total += world.vehiclesIn(0, 10000).length;
  }
  return total / seeds.length / 10;
}

export function table(results) {
  const lines = [
    '| Competidor | Choques (de 10) | Causas | Superados (media, mín–máx) | Distancia media (m) |',
    '|---|---|---|---|---|',
  ];
  for (const { id, runs } of results) {
    const s = summarize(runs);
    const causes = Object.entries(s.byCause).map(([k, v]) => `${k} ${v}`).join(', ') || '—';
    lines.push(`| ${id} | ${s.crashes} | ${causes} | ${s.passedMean.toFixed(1)} (${s.passedMin}–${s.passedMax}) | ${s.distanceMean.toFixed(0)} |`);
  }
  return lines.join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const i = process.argv.indexOf('--root');
  const root = i > 0 ? process.argv[i + 1] : path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
  const m = await loadRoot(root);
  console.log(`Raíz: ${root}`);
  console.log(table(driveExamples(m)));
  for (const d of [25, 50, 75, 100]) console.log(`Vehículos por km, 3 carriles, densidad ${d} %: ${vehiclesPerKm(m, { density: d }).toFixed(2)}`);
}
