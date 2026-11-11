import test from 'node:test';
import assert from 'node:assert/strict';
import { createCar, stepCar, resolveControls } from '../src/core/car.js';
import { STEP, MAX_SPEED, MAX_REVERSE_SPEED, TRAFFIC_SPEED } from '../src/core/constants.js';

const FORWARD = { forward: true };
const run = (car, controls, seconds) => {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i++) stepCar(car, controls, STEP);
  return car;
};

test('relaciones entre constantes: tráfico más lento que el auto, marcha atrás más lenta que el avance', () => {
  assert.ok(TRAFFIC_SPEED < MAX_SPEED);
  assert.ok(MAX_REVERSE_SPEED < MAX_SPEED);
});

test('acelerar hasta el tope: la velocidad crece de forma progresiva y se estabiliza en el máximo', () => {
  const car = createCar();
  const speeds = [];
  for (let i = 0; i < 600; i++) { stepCar(car, FORWARD, STEP); speeds.push(car.speed); }
  assert.ok(speeds[1] > speeds[0] && speeds[0] > 0, 'crece desde cero');
  assert.ok(speeds[5] < MAX_SPEED, 'no llega de golpe');
  for (let i = 1; i < speeds.length; i++) assert.ok(speeds[i] >= speeds[i - 1], 'nunca disminuye');
  assert.equal(speeds[speeds.length - 1], MAX_SPEED);
  assert.ok(speeds.every((s) => s <= MAX_SPEED), 'nunca supera el máximo');
  assert.ok(car.position.x > 0);
});

test('marcha atrás más lenta: retrocede y se estabiliza en un tope menor', () => {
  const car = run(createCar(), { reverse: true }, 5);
  assert.equal(car.speed, -MAX_REVERSE_SPEED);
  assert.ok(Math.abs(car.speed) < MAX_SPEED);
  assert.ok(car.position.x < 0);
});

test('soltar los controles: la velocidad baja paso a paso hasta quedar exactamente en cero', () => {
  const car = run(createCar(), FORWARD, 5);
  assert.equal(car.speed, MAX_SPEED);
  let prev = car.speed;
  let steps = 0;
  while (car.speed > 0) {
    stepCar(car, {}, STEP);
    assert.ok(car.speed < prev, 'disminuye en cada paso');
    prev = car.speed;
    if (++steps > 10000) assert.fail('no se detuvo');
  }
  assert.equal(car.speed, 0);
  stepCar(car, {}, STEP);
  assert.equal(car.speed, 0);
});

test('la fricción también frena la marcha atrás hasta cero exacto', () => {
  const car = run(createCar(), { reverse: true }, 2);
  run(car, {}, 3);
  assert.equal(car.speed, 0);
});

test('giro detenido: no cambia de orientación', () => {
  const car = createCar();
  run(car, { left: true }, 1);
  run(car, { right: true }, 1);
  assert.equal(car.angle, 0);
  assert.equal(car.speed, 0);
});

test('giro avanzando: izquierda gira hacia la izquierda (el ángulo aumenta, el auto se desvía a +y)', () => {
  const car = run(createCar(), { forward: true, left: true }, 1);
  assert.ok(car.angle > 0);
  assert.ok(car.position.y > 0);
  const right = run(createCar(), { forward: true, right: true }, 1);
  assert.ok(right.angle < 0);
  assert.ok(right.position.y < 0);
});

test('giro en marcha atrás: la cola se desplaza hacia la izquierda, al revés que avanzando', () => {
  const car = run(createCar(), { reverse: true, left: true }, 1);
  assert.ok(car.angle < 0, 'el ángulo disminuye, al revés que avanzando');
  // cola del auto (posición - adelante * 2 m): con rumbo 0 la izquierda es +y
  const tail = { x: car.position.x - Math.cos(car.angle) * 2, y: car.position.y - Math.sin(car.angle) * 2 };
  assert.ok(tail.y > 0, 'la cola quedó hacia la izquierda');
  const fwd = run(createCar(), { forward: true, left: true }, 1);
  assert.ok(Math.sign(fwd.angle) === -Math.sign(car.angle));
});

test('avanzar y retroceder juntos: no acelera en ningún sentido', () => {
  const car = run(createCar(), { forward: true, reverse: true }, 2);
  assert.equal(car.speed, 0);
  assert.deepEqual(car.position, { x: 0, y: 0 });
  assert.deepEqual(resolveControls({ forward: true, reverse: true, left: true }), { forward: false, reverse: false, left: true, right: false });
});

test('izquierda y derecha juntas: no gira', () => {
  const car = run(createCar(), { forward: true, left: true, right: true }, 2);
  assert.equal(car.angle, 0);
  assert.ok(car.speed > 0);
  assert.equal(car.position.y, 0);
});

test('un auto chocado queda detenido y no responde a los controles', () => {
  const car = createCar();
  car.speed = 10;
  car.crashed = true;
  run(car, { forward: true, left: true }, 1);
  assert.equal(car.speed, 0);
  assert.deepEqual(car.position, { x: 0, y: 0 });
  assert.equal(car.angle, 0);
});

test('velocidad máxima configurable: se estabiliza en la configurada y la marcha atrás llega a la mitad', async () => {
  const { createCar, stepCar, normalizedSpeed } = await import('../src/core/car.js');
  const fast = createCar({ maxSpeed: 30 });
  for (let i = 0; i < 600; i++) stepCar(fast, { forward: true }, STEP);
  assert.equal(fast.speed, 30);
  assert.equal(normalizedSpeed(fast), 1);
  const back = createCar({ maxSpeed: 30 });
  for (let i = 0; i < 600; i++) stepCar(back, { reverse: true }, STEP);
  assert.equal(back.speed, -15);
});

test('velocidad máxima fuera de rango: se ajusta a 12 o 40 m/s, siempre por encima del tráfico', async () => {
  const { createCar, maxSpeedOf } = await import('../src/core/car.js');
  const { SPEED_LIMITS } = await import('../src/core/constants.js');
  assert.deepEqual(SPEED_LIMITS, { min: 12, max: 40 });
  assert.equal(createCar({ maxSpeed: 5 }).maxSpeed, 12);
  assert.equal(createCar({ maxSpeed: 90 }).maxSpeed, 40);
  assert.equal(createCar().maxSpeed, MAX_SPEED);
  assert.equal(maxSpeedOf('rápido'), MAX_SPEED);
  assert.ok(TRAFFIC_SPEED < SPEED_LIMITS.min);
});
