import test from 'node:test';
import assert from 'node:assert/strict';
import { createCar, configureSensors, resetSensors } from '../src/core/car.js';
import { rayOffsets, readSensors, sensorConfig, DEFAULT_SENSORS } from '../src/core/sensors.js';
import { createStraightStreet } from '../src/core/track.js';
import { rectCorners, outline } from '../src/core/geometry.js';
import { CAR_LENGTH } from '../src/core/constants.js';

const near = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} no es ${b}`);
const deg = (r) => (r * 180) / Math.PI;
const wall = (x, y1, y2) => [[{ x, y: y1 }, { x, y: y2 }]]; // pared vertical

test('abanico simétrico: 5 rayos, 90 grados, extremos a 45 a cada lado y el del medio al frente', () => {
  const offsets = rayOffsets(5, 90).map(deg);
  [45, 22.5, 0, -22.5, -45].forEach((e, i) => near(offsets[i], e, 1e-9));
});

test('un solo rayo apunta exactamente hacia adelante sea cual sea la apertura', () => {
  for (const spread of [10, 90, 360]) assert.deepEqual(rayOffsets(1, spread), [0]);
});

test('los rayos acompañan al auto cuando gira', () => {
  const car = createCar({ sensors: { count: 3, spread: 90, range: 3 } });
  const dirOf = (r) => Math.atan2(r.end.y - r.origin.y, r.end.x - r.origin.x);
  const before = readSensors(car, car.sensors, []).map(dirOf);
  car.angle = Math.PI / 2;
  const after = readSensors(car, car.sensors, []).map(dirOf);
  before.forEach((b, i) => near(after[i] - b, Math.PI / 2, 1e-9));
});

test('sin obstáculo la lectura es 0', () => {
  const car = createCar();
  assert.deepEqual(readSensors(car, car.sensors, wall(1000, -50, 50)).map((r) => r.reading), [0, 0, 0, 0, 0]);
});

test('obstáculo a media distancia: lectura 0,5', () => {
  const car = createCar({ sensors: { count: 1, range: 3 } });
  const range = 3 * CAR_LENGTH;
  const [r] = readSensors(car, car.sensors, wall(range / 2, -5, 5));
  near(r.reading, 0.5);
  near(r.distance, range / 2);
});

test('un obstáculo que toca el origen da 1, uno justo en el alcance da 0', () => {
  const car = createCar({ sensors: { count: 1, range: 3 } });
  assert.equal(readSensors(car, car.sensors, wall(0, -5, 5))[0].reading, 1);
  assert.equal(readSensors(car, car.sensors, wall(12, -5, 5))[0].reading, 0);
});

test('varios obstáculos sobre el mismo rayo: gana el más cercano', () => {
  const car = createCar({ sensors: { count: 1, range: 3 } });
  const obstacles = [...wall(9, -5, 5), ...wall(3, -5, 5), ...wall(6, -5, 5)];
  near(readSensors(car, car.sensors, obstacles)[0].reading, 1 - 3 / 12);
});

test('borde de la pista: lectura mayor que 0', () => {
  const street = createStraightStreet();
  const car = createCar({ position: { x: 100, y: 5 }, sensors: { count: 1, range: 3 } });
  car.angle = Math.PI / 2; // mirando al borde izquierdo (y = 6)
  const [r] = readSensors(car, car.sensors, street.bordersNear(car.position, 20));
  assert.ok(r.reading > 0);
  near(r.distance, 1);
});

test('vehículo del tráfico: lectura mayor que 0', () => {
  const car = createCar({ sensors: { count: 1, range: 3 } });
  const vehicle = outline(rectCorners({ x: 8, y: 0 }, 0, 4, 2));
  const [r] = readSensors(car, car.sensors, vehicle);
  assert.ok(r.reading > 0);
  near(r.distance, 6); // cara trasera del vehículo en x = 6
});

test('orden estable: un obstáculo solo a la izquierda activa primero las lecturas del principio', () => {
  const car = createCar({ sensors: { count: 5, range: 3, spread: 90 } });
  // pared pegada hacia la izquierda (y positivo) cerca del auto
  const reads = readSensors(car, car.sensors, [[{ x: -10, y: 4 }, { x: 30, y: 4 }]]).map((r) => r.reading);
  assert.ok(reads[0] > 0 && reads[1] > 0, JSON.stringify(reads));
  assert.equal(reads[3], 0);
  assert.equal(reads[4], 0);
  const firstActive = reads.findIndex((v) => v > 0);
  assert.equal(firstActive, 0);
});

test('valores por defecto: 5 rayos, 3 largos de auto, 90 grados', () => {
  const car = createCar();
  assert.deepEqual(car.sensors, { count: 5, range: 3, spread: 90 });
  assert.deepEqual(DEFAULT_SENSORS, { count: 5, range: 3, spread: 90 });
});

test('valor fuera de rango se ajusta al límite más cercano', () => {
  assert.equal(sensorConfig({ count: 150 }).count, 100);
  assert.equal(sensorConfig({ count: 50 }).count, 50, '50 rayos ya están dentro del rango');
  assert.equal(sensorConfig({ count: 0 }).count, 1);
  assert.equal(sensorConfig({ range: 99 }).range, 25);
  assert.equal(sensorConfig({ range: 0 }).range, 1);
  assert.equal(sensorConfig({ spread: 720 }).spread, 360);
  assert.equal(sensorConfig({ spread: 1 }).spread, 10);
  assert.equal(sensorConfig({ count: 'abc' }).count, 5);
  const car = createCar({ sensors: { count: 150 } });
  assert.equal(car.sensors.count, 100);
  assert.equal(configureSensors(createCar(), { count: 150 }).sensors.count, 100);
});

test('restablecer devuelve 5 rayos, 3 largos y 90 grados', () => {
  const car = createCar({ sensors: { count: 9, range: 7, spread: 200 } });
  assert.deepEqual(car.sensors, { count: 9, range: 7, spread: 200 });
  resetSensors(car);
  assert.deepEqual(car.sensors, { count: 5, range: 3, spread: 90 });
});
