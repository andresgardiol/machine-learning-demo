import test from 'node:test';
import assert from 'node:assert/strict';
import { createStraightStreet } from '../src/core/track.js';
import { createTraffic, MIN_GROUP_SPACING } from '../src/core/traffic.js';
import { createCar, stepCar } from '../src/core/car.js';
import { contoursTouch } from '../src/core/geometry.js';
import { CAR_LENGTH, STEP, TRAFFIC_SPEED, MAX_SPEED } from '../src/core/constants.js';

const street = createStraightStreet();
const groups = (traffic, n) => Array.from({ length: n }, (_, k) => traffic.groupAt(k));
const seeds = Array.from({ length: 1000 }, (_, i) => i + 1);

test('misma semilla y configuración: mismos carriles y distancias', () => {
  const a = createTraffic({ seed: 42, track: street, density: 70, irregularity: 60 });
  const b = createTraffic({ seed: 42, track: street, density: 70, irregularity: 60 });
  assert.deepEqual(groups(a, 100), groups(b, 100));
  assert.deepEqual(a.vehicles(12.5, 0, 3000).map((v) => v.position), b.vehicles(12.5, 0, 3000).map((v) => v.position));
});

test('semilla nueva: la disposición cambia', () => {
  const a = createTraffic({ seed: 1, track: street });
  const b = createTraffic({ seed: 2, track: street });
  assert.notDeepEqual(groups(a, 30), groups(b, 30));
});

test('con densidad máxima, cada grupo deja al menos un carril libre (1000 semillas, 2, 3 y 4 carriles)', () => {
  for (const lanes of [2, 3, 4]) {
    const track = createStraightStreet({ lanes });
    for (const seed of seeds) {
      const t = createTraffic({ seed, track, density: 100, irregularity: 100 });
      for (const g of groups(t, 20)) {
        assert.ok(g.vehicles.length >= 1 && g.vehicles.length <= lanes - 1, `semilla ${seed}, ${lanes} carriles: ${g.vehicles.length} vehículos`);
        assert.equal(new Set(g.vehicles.map((v) => v.lane)).size, g.vehicles.length, 'sin carriles repetidos');
      }
    }
  }
});

// Distancias de los vehículos de un grupo (centro del grupo más el adelanto de cada uno).
const vehicleDistances = (g) => g.vehicles.map((v) => g.distance + v.offset);

test('con irregularidad máxima, entre los vehículos más cercanos de grupos consecutivos hay al menos cuatro largos de hueco (1000 semillas)', () => {
  for (const density of [100, 50, 1]) {
    for (const seed of seeds) {
      const t = createTraffic({ seed, track: street, density, irregularity: 100 });
      const gs = groups(t, 40); // cruza el borde entre dos bloques
      for (let k = 1; k < gs.length; k++) {
        const gap = Math.min(...vehicleDistances(gs[k])) - Math.max(...vehicleDistances(gs[k - 1])) - CAR_LENGTH;
        assert.ok(gap >= 4 * CAR_LENGTH - 1e-9, `semilla ${seed}, densidad ${density}: hueco ${gap}`);
      }
    }
  }
  assert.ok(MIN_GROUP_SPACING >= 5 * CAR_LENGTH);
});

test('separaciones variadas: con irregularidad máxima hay huecos que duplican a otros, todos por encima del mínimo', () => {
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const t = createTraffic({ seed, track: street, irregularity: 100 });
    const gs = groups(t, 48);
    const gaps = gs.slice(1).map((g, i) => g.distance - gs[i].distance);
    assert.ok(Math.min(...gaps) >= t.minGap - 1e-9);
    assert.ok(Math.max(...gaps) >= 2 * Math.min(...gaps), `semilla ${seed}: ${Math.min(...gaps)} a ${Math.max(...gaps)}`);
  }
});

test('la separación promedio sigue siendo la que pide la densidad', () => {
  for (const [density, irregularity] of [[50, 50], [100, 100], [20, 80]]) {
    const t = createTraffic({ seed: 3, track: street, density, irregularity });
    const n = 4 * 16; // bloques completos
    const mean = (t.groupAt(n).distance - t.groupAt(0).distance) / n;
    assert.ok(Math.abs(mean - t.spacing) < 1e-6, `densidad ${density}: ${mean} vs ${t.spacing}`);
  }
});

test('semilla nueva: también cambian las distancias de los grupos, no solo sus carriles', () => {
  const a = createTraffic({ seed: 1, track: street });
  const b = createTraffic({ seed: 2, track: street });
  const diffs = Array.from({ length: 30 }, (_, k) => Math.abs(a.groupAt(k + 1).distance - b.groupAt(k + 1).distance));
  const mean = diffs.reduce((x, y) => x + y, 0) / diffs.length;
  assert.ok(mean > CAR_LENGTH, `diferencia media ${mean} m`);
});

test('grupos escalonados: con irregularidad, los vehículos de un grupo no van todos a la par', () => {
  const t = createTraffic({ seed: 6, track: street, density: 100, irregularity: 50 });
  const multi = groups(t, 30).filter((g) => g.vehicles.length > 1);
  assert.ok(multi.length > 0);
  for (const g of multi) assert.ok(new Set(g.vehicles.map((v) => v.offset)).size > 1, `grupo ${g.index} a la par`);
});

test('la ventana de vehículos coincide con recorrer todos los grupos, también en los bordes de bloque', () => {
  for (const [density, irregularity] of [[50, 50], [100, 100], [5, 100]]) {
    const t = createTraffic({ seed: 8, track: street, density, irregularity });
    const time = 7.3;
    const all = [];
    for (let k = 0; k < 200; k++) {
      const g = t.groupAt(k);
      for (const v of g.vehicles) all.push({ id: `${k}:${v.lane}`, distance: g.distance + v.offset + TRAFFIC_SPEED * time });
    }
    for (const [from, to] of [[0, 300], [500, 760], [1000, 1100], [1700, 2400]]) {
      const expected = all.filter((v) => v.distance >= from && v.distance <= to).map((v) => v.id).sort();
      const got = t.vehicles(time, from, to).map((v) => v.id).sort();
      assert.deepEqual(got, expected, `densidad ${density}, tramo ${from}-${to}`);
    }
  }
});

test('densidad 0 %: no hay ningún vehículo', () => {
  const t = createTraffic({ seed: 3, track: street, density: 0 });
  assert.deepEqual(t.vehicles(0, 0, 100000), []);
  assert.deepEqual(t.vehicles(50, 0, 100000), []);
  assert.ok(groups(t, 10).every((g) => g.vehicles.length === 0));
});

test('más densidad, más vehículos en el mismo tramo y con la misma semilla', () => {
  for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
    const low = createTraffic({ seed, track: street, density: 25 }).vehicles(0, 0, 3000).length;
    const high = createTraffic({ seed, track: street, density: 100 }).vehicles(0, 0, 3000).length;
    assert.ok(low > 0);
    assert.ok(high > low, `semilla ${seed}: ${low} vs ${high}`);
  }
});

test('valores por defecto: densidad 50 % e irregularidad 50 %', () => {
  const t = createTraffic({ seed: 1, track: street });
  assert.equal(t.density, 50);
  assert.equal(t.irregularity, 50);
  assert.equal(createTraffic({ seed: 1, track: street, density: 500, irregularity: -5 }).density, 100);
  assert.equal(createTraffic({ seed: 1, track: street, density: 500, irregularity: -5 }).irregularity, 0);
});

test('irregularidad 0 %: grupos a distancias iguales y vehículos centrados en su carril', () => {
  const t = createTraffic({ seed: 9, track: street, irregularity: 0 });
  const gs = groups(t, 50);
  const gaps = new Set(gs.slice(1).map((g, i) => (g.distance - gs[i].distance).toFixed(9)));
  assert.equal(gaps.size, 1);
  assert.ok(gs.every((g) => g.vehicles.every((v) => v.offset === 0)), 'vehículos a la par');
  for (const v of t.vehicles(0, 0, 3000)) {
    assert.equal(v.lateral, 0);
    assert.equal(v.position.y, street.laneCenter(v.lane, 0).position.y);
  }
});

test('irregularidad 100 %: las distancias varían y ningún vehículo sobresale de su carril', () => {
  const t = createTraffic({ seed: 9, track: street, irregularity: 100 });
  const gs = groups(t, 50);
  const gaps = new Set(gs.slice(1).map((g, i) => (g.distance - gs[i].distance).toFixed(6)));
  assert.ok(gaps.size > 10, `solo ${gaps.size} distancias distintas`);
  let sawOffCenter = false;
  for (const seed of [1, 2, 3, 4, 5]) {
    for (const v of createTraffic({ seed, track: street, irregularity: 100, density: 100 }).vehicles(0, 0, 3000)) {
      const center = street.laneCenter(v.lane, 0).position.y;
      const half = street.laneWidth / 2;
      for (const corner of v.contour) assert.ok(Math.abs(corner.y - center) <= half, `sobresale: ${corner.y - center}`);
      if (v.lateral !== 0) sawOffCenter = true;
    }
  }
  assert.ok(sawOffCenter);
});

test('tráfico alcanzable: el auto a velocidad máxima reduce la distancia a un vehículo', () => {
  const t = createTraffic({ seed: 4, track: street, density: 50 });
  const target = t.vehicles(0, 0, 3000).find((v) => v.lane === 1) ?? t.vehicles(0, 0, 3000)[0];
  const lane = target.lane;
  const car = createCar({ position: street.laneCenter(lane, 0).position });
  const gapAt = (time) => target.distance + TRAFFIC_SPEED * time - car.position.x;
  const start = gapAt(0);
  let time = 0;
  for (let i = 0; i < 120; i++) { stepCar(car, { forward: true }, STEP); time += STEP; }
  assert.ok(gapAt(time) < start, `${start} -> ${gapAt(time)}`);
  assert.ok(TRAFFIC_SPEED < MAX_SPEED);
});

test('tráfico estable durante un minuto: cada vehículo sigue en su carril y ninguno toca a otro', () => {
  for (const [density, irregularity] of [[100, 100], [50, 50]]) {
    const t = createTraffic({ seed: 11, track: street, density, irregularity });
    const initial = t.vehicles(0, 0, 3000);
    for (let step = 0; step <= 3600; step += 30) {
      const time = step * STEP;
      const now = t.vehicles(time, 0, 3000 + TRAFFIC_SPEED * time).filter((v) => v.distance < 3000 + TRAFFIC_SPEED * time);
      for (const v of now) {
        const before = initial.find((i) => i.id === v.id);
        if (before) {
          assert.equal(v.lane, before.lane);
          assert.equal(v.position.y, before.position.y, 'no cambia de carril');
          assert.ok(Math.abs(v.distance - before.distance - TRAFFIC_SPEED * time) < 1e-9);
        }
      }
      for (let i = 0; i < now.length; i++) {
        for (let j = i + 1; j < now.length; j++) {
          assert.equal(contoursTouch(now[i].contour, now[j].contour), false, `${now[i].id} toca a ${now[j].id} en t=${time}`);
        }
      }
    }
  }
});

test('tráfico sin fin: sigue habiendo vehículos por delante tras diez kilómetros', () => {
  const t = createTraffic({ seed: 5, track: street });
  const time = 1000; // el conductor llegó a los 10 km a ~10 m/s de promedio
  assert.ok(t.vehicles(time, 10000, 10300).length > 0);
  assert.ok(t.vehicles(0, 9900, 10300).length > 0);
  const far = t.vehicles(5000, 90000, 90500);
  assert.ok(far.length > 0);
});
