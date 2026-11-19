// Tráfico por carril (trafico-vivo): un ritmo por carril, tipos de vehículo, zigzag dentro del
// carril, reproducibilidad, "nunca te encierran" y el cambio de configuración en marcha.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStraightStreet } from '../src/core/track.js';
import {
  createTraffic, changeTraffic, MIN_LANE_GAP, MAX_VEHICLE_LENGTH, zigzagAmplitude, laneSpeedsFor,
} from '../src/core/traffic.js';
import { findWalls, pairWindow } from '../src/core/walls.js';
import { createCar, stepCar } from '../src/core/car.js';
import { contoursTouch, rectCorners } from '../src/core/geometry.js';
import {
  CAR_LENGTH, CAR_WIDTH, LANE_WIDTH, STEP, MAX_SPEED, SPEED_LIMITS, TRAFFIC_SPEEDS, VEHICLE_TYPES,
  ZIGZAG_MAX_TURN, MIN_LANE_GAP_CAR_LENGTHS,
} from '../src/core/constants.js';

const street = createStraightStreet();
const streets = { 2: createStraightStreet({ lanes: 2 }), 3: street, 4: createStraightStreet({ lanes: 4 }) };
const seeds = (n, from = 1) => Array.from({ length: n }, (_, i) => i + from);
const round2 = (x) => Math.round(x * 100) / 100;
/** Huecos de paragolpes a paragolpes entre vehículos consecutivos de un carril (bases en el instante 0). */
const gapsOf = (list) => list.slice(1).map((v, i) => (v.base - v.length / 2) - (list[i].base + list[i].length / 2));
/** Borde izquierdo y derecho (y) del carril `lane` de una calle recta. */
const laneEdges = (track, lane) => { const c = track.laneCenter(lane, 0).position.y; return [c - track.laneWidth / 2, c + track.laneWidth / 2]; };

// --- Constantes y tipos (tarea 2.1) ------------------------------------------------------------

test('tipos de vehículo: las proporciones suman 1, ninguno es más ancho que un carril ni mide más de 10 m', () => {
  assert.equal(round2(VEHICLE_TYPES.reduce((a, t) => a + t.share, 0)), 1);
  assert.deepEqual(VEHICLE_TYPES.map((t) => t.type), ['motorcycle', 'car', 'van', 'truck']);
  for (const t of VEHICLE_TYPES) {
    assert.ok(t.width < LANE_WIDTH, t.type);
    assert.ok(t.length <= 10, t.type);
  }
  assert.ok(Object.isFrozen(VEHICLE_TYPES) && VEHICLE_TYPES.every(Object.isFrozen));
  assert.equal(MAX_VEHICLE_LENGTH, 10);
  assert.deepEqual({ ...TRAFFIC_SPEEDS }, { min: 6, max: 10 });
  assert.ok(TRAFFIC_SPEEDS.max < SPEED_LIMITS.min, 'el carril más rápido es alcanzable con la menor velocidad máxima');
  assert.equal(MIN_LANE_GAP, MIN_LANE_GAP_CAR_LENGTHS * CAR_LENGTH);
  assert.equal(MIN_LANE_GAP, 16);
});

// --- Un ritmo por carril (tarea 3.1) -----------------------------------------------------------

test('Tres carriles por defecto: los carriles van a 6, 8 y 10 m/s, uno a cada velocidad', () => {
  const t = createTraffic({ seed: 1, track: street });
  assert.deepEqual([...t.laneSpeeds].sort((a, b) => a - b), [6, 8, 10]);
  assert.equal(t.fastestSpeed, 10);
  assert.equal(t.slowestSpeed, 6);
  for (const v of t.vehicles(0, 0, 2000)) assert.equal(v.speed, t.laneSpeeds[v.lane]);
});

test('Dos y cuatro carriles: 6 y 10 m/s; 6, 7,33, 8,67 y 10 m/s', () => {
  const two = createTraffic({ seed: 1, track: streets[2] });
  assert.deepEqual([...two.laneSpeeds].sort((a, b) => a - b), [6, 10]);
  const four = createTraffic({ seed: 1, track: streets[4] });
  assert.deepEqual([...four.laneSpeeds].sort((a, b) => a - b).map(round2), [6, 7.33, 8.67, 10]);
});

test('La semilla reparte los ritmos: con cien semillas el carril más rápido no es siempre el mismo', () => {
  const fastest = new Set(seeds(100).map((seed) => { const s = laneSpeedsFor(seed, 3); return s.indexOf(Math.max(...s)); }));
  assert.equal(fastest.size, 3);
});

test('Las velocidades no dependen de la densidad ni de la irregularidad', () => {
  for (const seed of seeds(20)) {
    const a = createTraffic({ seed, track: street, density: 10, irregularity: 0 });
    const b = createTraffic({ seed, track: street, density: 100, irregularity: 100 });
    assert.deepEqual(a.laneSpeeds, b.laneSpeeds);
  }
});

test('Hueco dentro del carril: con densidad e irregularidad máximas, mil semillas, 2, 3 y 4 carriles, al menos cuatro largos de auto', () => {
  for (const lanes of [2, 3, 4]) {
    for (const seed of seeds(1000)) {
      const t = createTraffic({ seed, track: streets[lanes], density: 100, irregularity: 100 });
      for (let lane = 0; lane < lanes; lane++) {
        const list = t.laneBases(lane, 0, 1500); // cruza varios bordes de bloque
        for (const g of gapsOf(list)) assert.ok(g >= MIN_LANE_GAP - 1e-9, `semilla ${seed}, ${lanes} carriles: hueco ${g}`);
      }
    }
  }
});

test('Sin filas: en un kilómetro con los valores por defecto, los vehículos de carriles distintos no aparecen a distancias que se repiten', () => {
  for (const seed of seeds(10)) {
    const t = createTraffic({ seed, track: street });
    const byLane = [0, 1, 2].map((lane) => t.vehicles(0, 0, 1000).filter((v) => v.lane === lane).map((v) => v.distance));
    // Distancias de cada vehículo al más cercano de otro carril: no son todas iguales (no hay filas).
    const offsets = [];
    for (let a = 0; a < 3; a++) for (const d of byLane[a]) {
      const others = byLane.filter((_, b) => b !== a).flat();
      if (others.length) offsets.push(Math.min(...others.map((o) => Math.abs(o - d))));
    }
    const aligned = offsets.filter((o) => o < 1).length;
    assert.ok(aligned < offsets.length / 4, `semilla ${seed}: ${aligned} de ${offsets.length} a la par`);
  }
});

// --- Tipos de vehículo (tarea 3.1) -------------------------------------------------------------

test('Todos los tipos aparecen en cinco kilómetros con los valores por defecto', () => {
  for (const seed of seeds(10)) {
    const types = new Set(createTraffic({ seed, track: street }).vehicles(0, 0, 5000).map((v) => v.type));
    assert.deepEqual([...types].sort(), ['car', 'motorcycle', 'truck', 'van'], `semilla ${seed}`);
  }
});

test('Medidas por tipo: el camión es más largo y más ancho que el auto, y la moto más corta y más angosta', () => {
  const list = createTraffic({ seed: 3, track: street }).vehicles(0, 0, 5000);
  const of = (type) => list.find((v) => v.type === type);
  const [truck, car, moto] = [of('truck'), of('car'), of('motorcycle')];
  assert.ok(truck.length > car.length && truck.width > car.width);
  assert.ok(moto.length < car.length && moto.width < car.width);
  assert.equal(car.length, CAR_LENGTH);
  for (const v of [truck, car, moto]) {
    const t = VEHICLE_TYPES.find((x) => x.type === v.type);
    assert.deepEqual([v.length, v.width], [t.length, t.width]);
  }
});

test('el tipo de cada vehículo sale de la semilla, no de la densidad ni de la irregularidad', () => {
  const a = createTraffic({ seed: 8, track: street, density: 20, irregularity: 0 });
  const b = createTraffic({ seed: 8, track: street, density: 90, irregularity: 100 });
  for (const lane of [0, 1, 2]) {
    const ta = a.laneBases(lane, 0, 20000).map((v) => v.type);
    const tb = b.laneBases(lane, 0, 20000).map((v) => v.type);
    const n = Math.min(ta.length, tb.length);
    assert.ok(n >= 40);
    assert.deepEqual(ta.slice(0, n), tb.slice(0, n));
  }
});

// --- Densidad (tarea 3.2) ----------------------------------------------------------------------

test('Calle vacía: con densidad 0 % no hay ningún vehículo', () => {
  const t = createTraffic({ seed: 1, track: street, density: 0 });
  assert.deepEqual(t.vehicles(0, -1000, 100000), []);
  assert.deepEqual(t.laneBases(0, -Infinity, Infinity), []);
});

test('Más densidad, más vehículos en el mismo tramo y con la misma semilla', () => {
  for (const seed of seeds(10)) {
    const counts = [10, 25, 50, 75, 100].map((density) => createTraffic({ seed, track: street, density }).vehicles(0, 0, 5000).length);
    for (let i = 1; i < counts.length; i++) assert.ok(counts[i] > counts[i - 1], `semilla ${seed}: ${counts}`);
  }
});

test('con 3 carriles al 50 %, entre 80 % y 120 % de los vehículos por kilómetro del tráfico en filas (34,02 medido en 1.1)', () => {
  let total = 0;
  for (const seed of seeds(10)) total += createTraffic({ seed, track: street, density: 50, irregularity: 50 }).vehicles(0, 0, 10000).length;
  const perKm = total / 10 / 10;
  assert.ok(perKm >= 0.8 * 34.02 && perKm <= 1.2 * 34.02, `${perKm} vehículos/km`);
});

test('valores por defecto: densidad 50 % e irregularidad 50 %', () => {
  const t = createTraffic({ seed: 1, track: street });
  assert.equal(t.density, 50);
  assert.equal(t.irregularity, 50);
});

test('Tráfico regular: con irregularidad 0 %, cada vehículo va centrado y los huecos de cada carril son iguales', () => {
  for (const seed of seeds(10)) {
    const t = createTraffic({ seed, track: street, irregularity: 0 });
    for (let lane = 0; lane < 3; lane++) {
      const gaps = gapsOf(t.laneBases(lane, 0, 5000));
      for (const g of gaps) assert.ok(Math.abs(g - gaps[0]) < 1e-9, `semilla ${seed}: ${g} contra ${gaps[0]}`);
    }
    for (const time of [0, 3.3, 17]) {
      for (const v of t.vehicles(time, 0, 2000)) {
        assert.equal(v.lateral, 0);
        assert.equal(v.turn, 0);
        assert.equal(v.position.y, street.laneCenter(v.lane, 0).position.y);
      }
    }
  }
});

test('Separaciones variadas: con irregularidad 100 %, dentro de un carril hay huecos que duplican a otros, ninguno bajo el mínimo', () => {
  for (const seed of seeds(8)) {
    const t = createTraffic({ seed, track: street, irregularity: 100 });
    for (let lane = 0; lane < 3; lane++) {
      const gaps = gapsOf(t.laneBases(lane, 0, 5000));
      assert.ok(Math.max(...gaps) >= 2 * Math.min(...gaps), `semilla ${seed}, carril ${lane}`);
      assert.ok(Math.min(...gaps) >= MIN_LANE_GAP - 1e-9);
    }
  }
});

// --- Zigzag (tarea 3.3) ------------------------------------------------------------------------

test('Zigzag dentro del carril: con irregularidad, cada vehículo cambia su posición lateral, de un lado al otro de su carril', () => {
  const t = createTraffic({ seed: 6, track: street, irregularity: 50 });
  const ids = t.vehicles(0, 0, 600).map((v) => v.id);
  for (const id of ids) {
    const laterals = seeds(100, 0).map((k) => t.vehicles(k * 0.1, -1000, 5000).find((v) => v.id === id).lateral);
    assert.ok(Math.max(...laterals) > 0 && Math.min(...laterals) < 0, id);
  }
});

test('Más irregularidad, más zigzag: el mismo vehículo se aparta más del centro a 100 % que a 25 %', () => {
  const at = (irregularity) => createTraffic({ seed: 9, track: street, irregularity });
  const a = at(25);
  const b = at(100);
  const maxOff = (t, id) => Math.max(...seeds(120, 0).map((k) => Math.abs(t.vehicles(k * 0.1, -1000, 5000).find((v) => v.id === id).lateral)));
  for (const v of a.vehicles(0, 0, 400)) assert.ok(maxOff(b, v.id) > maxOff(a, v.id), v.id);
});

test('el giro del zigzag queda en ±6° y la amplitud deja el contorno girado dentro del carril', () => {
  for (const tpe of VEHICLE_TYPES) assert.ok(zigzagAmplitude(LANE_WIDTH, tpe.length, tpe.width) >= 0);
  // Con 100 %: una moto se aparta unos 1,3 m, un auto 0,7 m y un camión apenas 0,13 m (design.md D5).
  const amp = (type) => { const x = VEHICLE_TYPES.find((v) => v.type === type); return zigzagAmplitude(LANE_WIDTH, x.length, x.width); };
  assert.ok(Math.abs(amp('motorcycle') - 1.3) < 0.1 && Math.abs(amp('car') - 0.7) < 0.1 && Math.abs(amp('truck') - 0.13) < 0.05);
  const t = createTraffic({ seed: 2, track: street, irregularity: 100 });
  for (const time of seeds(60, 0)) for (const v of t.vehicles(time, 0, 2000)) assert.ok(Math.abs(v.turn) <= ZIGZAG_MAX_TURN + 1e-12);
});

test('Nadie sale de su carril: irregularidad 100 %, un minuto, mil semillas, ningún vértice del contorno fuera del carril', () => {
  for (const lanes of [3]) {
    const track = streets[lanes];
    const edges = Array.from({ length: lanes }, (_, i) => laneEdges(track, i));
    for (const seed of seeds(1000)) {
      const t = createTraffic({ seed, track, density: 100, irregularity: 100 });
      for (let time = 0; time <= 60; time += 1.7) {
        for (const v of t.vehicles(time, 0, 700)) {
          const [lo, hi] = edges[v.lane];
          for (const p of v.contour) assert.ok(p.y > lo && p.y < hi, `semilla ${seed}, ${v.id} (${v.type}) en t=${time}: y=${p.y}`);
        }
      }
    }
  }
});

test('Tráfico irregular sin invadir carriles: con 100 %, los huecos varían y en 2 y 4 carriles ningún vehículo sobresale', () => {
  for (const lanes of [2, 4]) {
    const track = streets[lanes];
    for (const seed of seeds(50)) {
      const t = createTraffic({ seed, track, irregularity: 100 });
      for (let time = 0; time <= 60; time += 0.9) {
        for (const v of t.vehicles(time, 0, 1500)) {
          const [lo, hi] = laneEdges(track, v.lane);
          for (const p of v.contour) assert.ok(p.y > lo && p.y < hi);
        }
      }
      const gaps = gapsOf(t.laneBases(0, 0, 3000));
      assert.ok(new Set(gaps.map(round2)).size > 1);
    }
  }
});

// --- Reproducibilidad (tarea 3.4) --------------------------------------------------------------

test('Misma semilla: mismos carriles, distancias, tipos, velocidades y zigzag', () => {
  const a = createTraffic({ seed: 42, track: street, density: 70, irregularity: 60 });
  const b = createTraffic({ seed: 42, track: street, density: 70, irregularity: 60 });
  for (const time of [0, 12.5, 61]) assert.deepEqual(a.vehicles(time, 0, 3000), b.vehicles(time, 0, 3000));
  // El orden de las consultas no cambia el resultado (las memorias internas son solo memoria).
  const c = createTraffic({ seed: 42, track: street, density: 70, irregularity: 60 });
  c.vehicles(40, 5000, 9000);
  assert.deepEqual(c.vehicles(12.5, 0, 3000), a.vehicles(12.5, 0, 3000));
});

test('Semilla nueva: cambian las distancias a las que aparecen, no solo los carriles', () => {
  const a = createTraffic({ seed: 1, track: street });
  const b = createTraffic({ seed: 2, track: street });
  const da = a.vehicles(0, 0, 2000).map((v) => round2(v.distance));
  const db = b.vehicles(0, 0, 2000).map((v) => round2(v.distance));
  assert.notDeepEqual(da, db);
  assert.ok(da.filter((d) => db.includes(d)).length < da.length / 4);
});

test('la ventana de vehículos coincide con recorrer los carriles enteros, también en los bordes de bloque', () => {
  const t = createTraffic({ seed: 13, track: street, density: 80, irregularity: 70 });
  const time = 23.4;
  const all = t.vehicles(time, -1000, 20000);
  for (const [from, to] of [[0, 300], [431.7, 1290.2], [3000, 3001], [9000, 12000]]) {
    const expected = all.filter((v) => v.distance >= from && v.distance <= to).map((v) => v.id).sort();
    assert.deepEqual(t.vehicles(time, from, to).map((v) => v.id).sort(), expected, `${from}..${to}`);
  }
});

test('Tráfico sin fin: sigue habiendo vehículos por delante tras diez kilómetros, en todos los carriles', () => {
  const t = createTraffic({ seed: 5, track: street });
  const time = 1000;
  const ahead = t.vehicles(time, 10000, 10500);
  assert.deepEqual([...new Set(ahead.map((v) => v.lane))].sort(), [0, 1, 2]);
  assert.ok(t.vehicles(5000, 90000, 90500).length > 0);
});

// --- Movimiento del tráfico --------------------------------------------------------------------

test('Tráfico alcanzable: a la menor velocidad máxima, el auto se acerca a un vehículo del carril más rápido', () => {
  const t = createTraffic({ seed: 4, track: street, density: 50 });
  const lane = t.laneSpeeds.indexOf(t.fastestSpeed);
  const target = t.vehicles(0, 0, 3000).find((v) => v.lane === lane);
  const car = createCar({ position: street.laneCenter(lane, 0).position, maxSpeed: SPEED_LIMITS.min });
  const gapAt = (time) => target.distance + t.fastestSpeed * time - car.position.x;
  const start = gapAt(0);
  let time = 0;
  for (let i = 0; i < 1200; i++) { stepCar(car, { forward: true }, STEP); time += STEP; }
  assert.ok(gapAt(time) < start, `${start} -> ${gapAt(time)}`);
  assert.ok(t.fastestSpeed < MAX_SPEED);
});

test('Tráfico estable: un minuto, cada vehículo en su carril y ninguno toca a otro', () => {
  for (const [density, irregularity] of [[100, 100], [50, 50]]) {
    const t = createTraffic({ seed: 11, track: street, density, irregularity });
    for (let step = 0; step <= 3600; step += 30) {
      const time = step * STEP;
      const now = t.vehicles(time, 0, 1500);
      for (const v of now) assert.ok(Math.abs(v.distance - v.base - t.laneSpeeds[v.lane] * time) < 1e-9);
      for (let i = 0; i < now.length; i++) {
        for (let j = i + 1; j < now.length; j++) {
          if (Math.abs(now[i].distance - now[j].distance) > 12) continue;
          assert.equal(contoursTouch(now[i].contour, now[j].contour), false, `${now[i].id} toca a ${now[j].id} en t=${time}`);
        }
      }
    }
  }
});

test('Carriles a distinto ritmo: en diez segundos, el carril más rápido avanza 40 m más que el más lento', () => {
  const t = createTraffic({ seed: 7, track: street });
  const slow = t.laneSpeeds.indexOf(t.slowestSpeed);
  const fast = t.laneSpeeds.indexOf(t.fastestSpeed);
  const moved = (lane) => { const v = t.vehicles(0, 0, 500).find((x) => x.lane === lane); return t.vehicles(10, 0, 2000).find((x) => x.id === v.id).distance - v.distance; };
  assert.ok(Math.abs(moved(fast) - moved(slow) - 40) < 1e-9);
});

test('Grupos escalonados: dos vehículos de carriles distintos que quedan a la par dejan de estarlo en pocos segundos', () => {
  const t = createTraffic({ seed: 21, track: street, irregularity: 0 });
  const list = t.vehicles(0, 0, 3000);
  let checked = 0;
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i]; const b = list[j];
    if (a.lane === b.lane) continue;
    const w = pairWindow({ ...a, length: a.length - CAR_LENGTH }, { ...b, length: b.length - CAR_LENGTH }); // a la par: se solapan a lo largo
    if (!w) continue;
    // A lo sumo (L_a + L_b) / diferencia de velocidades: 10 s con dos camiones de carriles vecinos (2 m/s).
    assert.ok(w[1] - w[0] <= 10 + 1e-9, `${a.id} y ${b.id}: ${w[1] - w[0]} s a la par`);
    checked += 1;
  }
  assert.ok(checked > 10);
});

// --- Ningún muro encierra (grupo 4) ------------------------------------------------------------

test('medidor de muros: dos camiones de los carriles extremos a la par dan un muro de (10 + 10 + 8) / 4 = 7 s', () => {
  const truck = VEHICLE_TYPES.find((v) => v.type === 'truck');
  const fake = (lanes, middle = []) => ({
    laneSpeeds: lanes, maxLength: 10,
    laneBases: (lane, from, to) => {
      const list = lane === 0 ? [{ lane: 0, base: 100, length: truck.length }]
        : lane === lanes.length - 1 ? [{ lane, base: 100, length: truck.length }]
          : middle.filter((m) => m.lane === lane);
      return list.filter((v) => v.base >= from && v.base <= to);
    },
  });
  // A la par en el instante 0: el muro va de −3,5 s a 3,5 s; se mide desde 0.
  const two = findWalls(fake([6, 10]), { from: 0, to: 1000, tMax: 100 });
  assert.equal(two.length, 1);
  assert.ok(Math.abs(two[0].duration - 3.5) < 1e-9);
  assert.ok(Math.abs(pairWindow({ base: 100, length: 10, speed: 6 }, { base: 100, length: 10, speed: 10 }).reduce((a, b) => b - a) - 7) < 1e-9);
  // El rápido 14 m detrás: el muro entero cae después del instante 0 y dura 7 s.
  const behind = { laneSpeeds: [6, 10], maxLength: 10, laneBases: (lane, from, to) => [{ lane, base: lane === 0 ? 100 : 86, length: 10 }].filter((v) => v.base >= from && v.base <= to) };
  const w = findWalls(behind, { from: 0, to: 1000, tMax: 100 });
  assert.equal(w.length, 1);
  assert.ok(Math.abs(w[0].duration - 7) < 1e-9 && Math.abs(w[0].start) < 1e-9);
  // Con un carril del medio vacío, no hay muro; con un camión del medio que avanza junto al lento, sí.
  assert.equal(findWalls(fake([6, 8, 10]), { from: 0, to: 1000, tMax: 100 }).length, 0);
  const withMiddle = findWalls(fake([6, 8, 10], [{ lane: 1, base: 100, length: 10 }]), { from: 0, to: 1000, tMax: 100 });
  assert.equal(withMiddle.length, 1);
  assert.ok(withMiddle[0].duration <= 3.5 + 1e-9);
});

test('Muros cortos con densidad máxima: 2, 3 y 4 carriles, una muestra de semillas, diez kilómetros, ningún muro de más de 7 s', () => {
  for (const lanes of [2, 3, 4]) {
    let count = 0;
    for (const seed of seeds(15)) {
      const t = createTraffic({ seed, track: streets[lanes], density: 100, irregularity: 100 });
      const walls = findWalls(t, { from: 0, to: 10000, tMax: 500 });
      count += walls.length;
      for (const w of walls) assert.ok(w.duration <= 7 + 1e-9, `semilla ${seed}, ${lanes} carriles: ${w.duration} s`);
    }
    assert.ok(count > 0, `${lanes} carriles: la muestra tiene muros`);
  }
});

/** Auto que sigue, a la velocidad del carril, al primer vehículo de su carril (regla de prueba). */
function followFirst(t, lane, gap = 8) {
  const leader = t.laneBases(lane, 0, 1000)[0];
  const v = t.laneSpeeds[lane];
  const y = street.laneCenter(lane, 0).position.y;
  const startX = leader.base - leader.length / 2 - gap - CAR_LENGTH / 2;
  return { v, at: (time) => rectCorners({ x: startX + v * time, y }, 0, CAR_LENGTH, CAR_WIDTH), x: (time) => startX + v * time };
}

test('Esperar detrás: seguir al vehículo de su carril, a su velocidad, durante un minuto, cien semillas: no choca', () => {
  for (const seed of seeds(100)) {
    const t = createTraffic({ seed, track: street, density: 100, irregularity: 100 });
    for (let lane = 0; lane < 3; lane++) {
      const car = followFirst(t, lane);
      for (let step = 0; step <= 3600; step += 4) {
        const time = step * STEP;
        const x = car.x(time);
        const contour = car.at(time);
        for (const v of t.vehicles(time, x - 10, x + 10)) {
          assert.equal(contoursTouch(contour, v.contour), false, `semilla ${seed}, carril ${lane}: toca ${v.id} (${v.type}) en t=${time.toFixed(2)}`);
        }
      }
    }
  }
});

test('Calle sin muros eternos: el auto que espera detrás de un muro ve que se abre antes de 7 s (cien semillas)', () => {
  let near = 0;
  for (const seed of seeds(100)) {
    const t = createTraffic({ seed, track: street, density: 100, irregularity: 100 });
    const car = followFirst(t, 1);
    // Muros en el primer minuto cerca del auto (en los 60 m delante de él).
    const walls = findWalls(t, { from: 0, to: 2000, tMax: 60, car: { speed: car.v, start: car.x(0) + 30 } });
    for (const w of walls) {
      if (w.met) near += 1;
      assert.ok(w.duration <= 7 + 1e-9, `semilla ${seed}: ${w.duration} s`);
    }
  }
  assert.ok(near > 0, 'la muestra pone muros delante del auto');
});

test('Sin carril seguro por suerte: derecho sobre la línea entre dos carriles a velocidad máxima, irregularidad 50 %, cien semillas: choca antes del kilómetro', () => {
  const y = street.laneCenter(0, 0).position.y - LANE_WIDTH / 2; // línea entre los carriles 0 y 1
  for (const seed of seeds(100)) {
    const t = createTraffic({ seed, track: street, irregularity: 50 });
    let crashedAt = null;
    for (let step = 0; crashedAt === null && step * STEP * MAX_SPEED <= 1000; step += 1) {
      const time = step * STEP;
      const x = MAX_SPEED * time;
      const contour = rectCorners({ x, y }, 0, CAR_LENGTH, CAR_WIDTH);
      for (const v of t.vehicles(time, x - 10, x + 10)) if (contoursTouch(contour, v.contour)) { crashedAt = x; break; }
    }
    assert.notEqual(crashedAt, null, `semilla ${seed}: recorrió un kilómetro sin chocar`);
  }
});

// --- Cambio en marcha (tarea 5.1) --------------------------------------------------------------

/** Cambia el tráfico en el instante `time` con el auto en `progress`, como world.setTraffic. */
const changeAt = (current, next, progress, time) => changeTraffic(current, next, next.laneSpeeds.map((v) => progress + 20 - v * time));

test('Cambiar la densidad en marcha: los vehículos cercanos siguen donde estaban y más adelante rige la nueva densidad', () => {
  const a = createTraffic({ seed: 3, track: street, density: 30 });
  const b = createTraffic({ seed: 3, track: street, density: 100 });
  const time = 12;
  const progress = 300;
  const c = changeAt(a, b, progress, time);
  const near = a.vehicles(time, progress - 100, progress + 20).map((v) => v.id).sort();
  assert.deepEqual(c.vehicles(time, progress - 100, progress + 20).map((v) => v.id).sort(), near);
  const far = (t) => t.vehicles(time, progress + 500, progress + 5500).length;
  assert.ok(Math.abs(far(c) - far(b)) <= 3 && far(c) > far(a) * 1.5, `${far(a)} → ${far(c)} (nuevo ${far(b)})`);
  // Ninguno aparece encima del auto: delante del auto, los vehículos más cercanos son los de antes.
  for (const v of c.vehicles(time, progress - 10, progress + 10)) assert.ok(!v.id.includes('~'), v.id);
});

test('Unión entre configuraciones: en cada carril, al menos cuatro largos de auto entre el último viejo y el primero nuevo', () => {
  for (const seed of seeds(200)) {
    const a = createTraffic({ seed, track: street, density: 100, irregularity: 100 });
    const b = createTraffic({ seed, track: street, density: 100, irregularity: 0 });
    const time = (seed % 17) * 1.3;
    const c = changeAt(a, b, 100 + seed, time);
    for (let lane = 0; lane < 3; lane++) {
      const list = c.laneBases(lane, -Infinity, 3000);
      for (const g of gapsOf(list)) assert.ok(g >= MIN_LANE_GAP - 1e-9, `semilla ${seed}, carril ${lane}: ${g}`);
    }
    // También con los vehículos ya ubicados en el instante del cambio y un minuto después.
    for (const t2 of [time, time + 60]) {
      const now = c.vehicles(t2, 0, 3000);
      for (let lane = 0; lane < 3; lane++) {
        const l = now.filter((v) => v.lane === lane).sort((x, y) => x.distance - y.distance);
        for (let i = 1; i < l.length; i++) assert.ok(l[i].distance - l[i].length / 2 - (l[i - 1].distance + l[i - 1].length / 2) >= MIN_LANE_GAP - 1e-9);
      }
    }
  }
});

test('Cada carril conserva su ritmo al cambiar la irregularidad en marcha', () => {
  const a = createTraffic({ seed: 5, track: street, irregularity: 50 });
  const b = createTraffic({ seed: 5, track: street, irregularity: 100 });
  const c = changeAt(a, b, 200, 10);
  assert.deepEqual(c.laneSpeeds, a.laneSpeeds);
  for (const v of c.vehicles(30, 0, 3000)) assert.equal(v.speed, a.laneSpeeds[v.lane]);
  // Dos cambios seguidos: las capas viejas sin tramo propio se descartan y el ritmo sigue igual.
  const d = changeAt(c, createTraffic({ seed: 5, track: street, irregularity: 0 }), 210, 11);
  assert.ok(d.layers.length <= 3);
  assert.deepEqual(d.laneSpeeds, a.laneSpeeds);
});
