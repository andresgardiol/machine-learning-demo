// Medición de encierros (trafico-vivo D10, tarea 9.1), pedida por el dueño para decidir entre
// carriles a velocidades distintas o el plan B (una sola velocidad). Todo es geometría o
// inferencia: no entrena nada.
//
//   node tools/measure-walls.mjs [--antes <copia del commit de partida>] [--semillas 1000] [--salida <archivo.md>]
//
// 1. Muros del generador, para 2, 3 y 4 carriles × densidades 25, 50, 75 y 100 % × irregularidades
//    0, 50 y 100 %, con mil semillas y diez kilómetros (los vehículos del carril más lento con base
//    en los primeros 10 km, durante los 500 s que tarda un auto a 20 m/s en recorrerlos):
//      - muros por km que se cruza un auto que va derecho a 20 m/s (si no frenara, cuántas veces por
//        km encontraría la calle tapada en el lugar por donde pasa);
//      - duración media y máxima de un muro (región conexa: un vehículo del carril lento, uno del
//        rápido y los del medio que tapan con ellos);
//      - cadena máxima: el mayor tiempo seguido en que un mismo vehículo lento forma parte de algún
//        muro, uniendo muros que se tocan. Con camiones y huecos mínimos en el carril rápido dos muros
//        pueden seguirse sin un instante libre (por el hueco de 16 m del carril rápido sí pasa un auto).
// 2. Los programas de Reglas y los cerebros de ejemplo en los 10 tráficos de la tarea 1.3: choques,
//    superados y choques dentro de un muro, antes (con --antes) y después.
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { writeFileSync } from 'node:fs';
import { createStraightStreet } from '../src/core/track.js';
import { createTraffic } from '../src/core/traffic.js';
import { findWalls } from '../src/core/walls.js';
import { CAR_LENGTH } from '../src/core/constants.js';
import { loadRoot, driveExamples, summarize, SEEDS } from './drive-examples.mjs';

export const WALL_GRID = Object.freeze({
  lanes: [2, 3, 4], density: [25, 50, 75, 100], irregularity: [0, 50, 100],
  km: 10, carSpeed: 20,
});

/** Muros de una configuración con `seeds` semillas. */
export function measureConfig({ lanes, density, irregularity, seeds }) {
  const track = createStraightStreet({ lanes });
  const { km, carSpeed } = WALL_GRID;
  const tMax = (km * 1000) / carSpeed;
  let count = 0;
  let met = 0;
  let total = 0;
  let max = 0;
  let chainMax = 0;
  const over7 = [];
  for (let seed = 1; seed <= seeds; seed++) {
    const traffic = createTraffic({ seed, track, density, irregularity });
    const walls = findWalls(traffic, { from: 0, to: km * 1000, tMax, car: { speed: carSpeed } });
    count += walls.length;
    for (const w of walls) {
      total += w.duration;
      if (w.duration > max) max = w.duration;
      if (w.met) met += 1;
      if (w.duration > 7 + 1e-9) over7.push({ seed, ...w });
    }
    // Cadenas: muros de un mismo vehículo lento que se tocan o se pisan en el tiempo.
    const bySlow = new Map();
    for (const w of walls) { if (!bySlow.has(w.slow)) bySlow.set(w.slow, []); bySlow.get(w.slow).push(w); }
    for (const list of bySlow.values()) {
      list.sort((a, b) => a.start - b.start);
      let start = list[0].start;
      let end = list[0].end;
      for (const w of list.slice(1)) {
        if (w.start <= end + 1e-9) end = Math.max(end, w.end);
        else { chainMax = Math.max(chainMax, end - start); start = w.start; end = w.end; }
      }
      chainMax = Math.max(chainMax, end - start);
    }
  }
  return {
    lanes, density, irregularity, seeds,
    metPerKm: met / seeds / km,
    perKm: count / seeds / km,
    mean: count ? total / count : 0,
    max, chainMax, over7: over7.length,
  };
}

/** ¿Hay muro en el instante actual en algún punto de [from, to]? Para cualquier copia del núcleo (los vehículos sin largo miden un auto). */
export function wallNear(world, from, to) {
  const lanes = world.track.lanes;
  const list = world.vehiclesIn(from - 8, to + 8);
  let region = [[from, to]];
  for (let lane = 0; lane < lanes; lane++) {
    const covered = list.filter((v) => v.lane === lane).map((v) => {
      const h = (v.length ?? CAR_LENGTH) / 2 + CAR_LENGTH / 2;
      return [v.distance - h, v.distance + h];
    });
    const next = [];
    for (const [a, b] of region) for (const [c, d] of covered) { const x = Math.max(a, c); const y = Math.min(b, d); if (x < y) next.push([x, y]); }
    region = next;
    if (!region.length) return false;
  }
  return true;
}

/**
 * Muros del tráfico de otra copia (el "antes", en filas) por muestreo: cada 0,1 s, ¿está tapada la calle
 * entera en el lugar por donde pasa un auto derecho a 20 m/s? Sirve para cualquier generador que tenga
 * `vehicles(t, from, to)`.
 */
export async function sampledWallsAt(root, { seeds = 50, lanesList = [2, 3, 4], density = 100, irregularity = 100 } = {}) {
  const at = (p) => import(pathToFileURL(path.resolve(root, p)).href);
  const [{ createTraffic: make }, { createStraightStreet: street }] = await Promise.all([at('src/core/traffic.js'), at('src/core/track.js')]);
  const out = [];
  for (const lanes of lanesList) {
    const track = street({ lanes });
    let samples = 0;
    let blocked = 0;
    for (let seed = 1; seed <= seeds; seed++) {
      const traffic = make({ seed, track, density, irregularity });
      for (let k = 0; k <= 5000; k++) {
        const t = k * 0.1;
        const x = WALL_GRID.carSpeed * t;
        samples += 1;
        if (wallNear({ track, vehiclesIn: (from, to) => traffic.vehicles(t, from, to) }, x - 2, x + 2)) blocked += 1;
      }
    }
    out.push({ lanes, seeds, samples, blocked });
  }
  return out;
}

/** Programas y cerebros de ejemplo en una copia del repositorio, con choques dentro de un muro. */
export async function examplesAt(root) {
  const m = await loadRoot(root);
  // Dentro de un muro: al chocar contra un vehículo, la calle está tapada entera en algún punto entre
  // la cola del auto y 8 m por delante de él.
  const onCrash = (world) => ({ inWall: world.crashCause === 'vehicle' && wallNear(world, world.progress - CAR_LENGTH / 2, world.progress + 8) });
  return driveExamples(m, { onCrash });
}

const pct = (x) => `${Math.round(x)} %`;
const f1 = (x) => x.toFixed(1).replace('.', ',');
const f2 = (x) => x.toFixed(2).replace('.', ',');

export function wallsTable(rows) {
  const out = [
    '| Carriles | Densidad | Irregularidad | Muros/km que cruza un auto a 20 m/s | Muros/km en el tramo (500 s) | Duración media (s) | Duración máxima (s) | Cadena máxima (s) |',
    '|---|---|---|---|---|---|---|---|',
  ];
  for (const r of rows) out.push(`| ${r.lanes} | ${pct(r.density)} | ${pct(r.irregularity)} | ${f2(r.metPerKm)} | ${f1(r.perKm)} | ${f2(r.mean)} | ${f2(r.max)} | ${f2(r.chainMax)} |`);
  return out.join('\n');
}

export function examplesTable(before, after) {
  const byId = (list) => Object.fromEntries((list ?? []).map((x) => [x.id, x.runs]));
  const b = byId(before);
  const a = byId(after);
  const ids = [...new Set([...(before ?? []).map((x) => x.id), ...after.map((x) => x.id)])];
  const cell = (runs) => {
    if (!runs) return ['—', '—', '—'];
    const s = summarize(runs);
    const inWall = runs.filter((r) => r.crash?.inWall).length;
    return [`${s.crashes}`, `${f1(s.passedMean)} (${s.passedMin}–${s.passedMax})`, `${inWall}`];
  };
  const out = [
    '| Competidor | Choques antes | Choques después | Superados antes | Superados después | Choques en un muro antes | Choques en un muro después |',
    '|---|---|---|---|---|---|---|',
  ];
  for (const id of ids) {
    const [cb, pb, wb] = cell(b[id]);
    const [ca, pa, wa] = cell(a[id]);
    out.push(`| ${id} | ${cb} | ${ca} | ${pb} | ${pa} | ${wb} | ${wa} |`);
  }
  return out.join('\n');
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const opt = (name, def) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : def; };
  const seeds = Number(opt('--semillas', 1000));
  const antes = opt('--antes', null);
  const salida = opt('--salida', null);
  const here = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
  const t0 = Date.now();
  const rows = [];
  for (const lanes of WALL_GRID.lanes) {
    for (const density of WALL_GRID.density) {
      for (const irregularity of WALL_GRID.irregularity) {
        const r = measureConfig({ lanes, density, irregularity, seeds });
        rows.push(r);
        process.stderr.write(`${lanes} carriles, ${density} %, ${irregularity} %: ${f2(r.metPerKm)}/km, máx ${f2(r.max)} s, cadena ${f2(r.chainMax)} s (${((Date.now() - t0) / 1000).toFixed(0)} s)\n`);
      }
    }
  }
  const after = await examplesAt(here);
  const before = antes ? await examplesAt(antes) : null;
  const sampled = [
    ...(antes ? (await sampledWallsAt(antes)).map((r) => ({ ...r, which: 'antes' })) : []),
    ...(await sampledWallsAt(here)).map((r) => ({ ...r, which: 'después' })),
  ];
  const text = [
    `Semillas: ${seeds} por configuración; ${WALL_GRID.km} km; auto de referencia a ${WALL_GRID.carSpeed} m/s.`,
    `Muros de más de 7 s: ${rows.reduce((a, r) => a + r.over7, 0)}.`,
    '',
    wallsTable(rows),
    '',
    'Muestreo del lugar por donde pasa un auto a 20 m/s (cada 0,1 s durante 500 s, densidad e irregularidad 100 %):',
    '',
    '| Tráfico | Carriles | Semillas | Instantes | Con la calle tapada |',
    '|---|---|---|---|---|',
    ...sampled.map((r) => `| ${r.which} | ${r.lanes} | ${r.seeds} | ${r.samples} | ${r.blocked} |`),
    '',
    `Programas y cerebros de ejemplo, semillas ${SEEDS[0]} a ${SEEDS[SEEDS.length - 1]}, valores por defecto, 60 s o hasta el primer choque:`,
    '',
    examplesTable(before, after),
    '',
    `Tiempo: ${((Date.now() - t0) / 1000).toFixed(0)} s.`,
  ].join('\n');
  if (salida) writeFileSync(salida, `${text}\n`);
  console.log(text);
}
