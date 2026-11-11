import test from 'node:test';
import assert from 'node:assert/strict';
import { createCar, stepCar } from '../src/core/car.js';
import { createWorld } from '../src/core/world.js';
import { MAX_SPEED, STEP, TRAFFIC_SPEED } from '../src/core/constants.js';
import { DEFAULT_SETTINGS } from '../src/tabs/drive/settings.js';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';

test('velocidad por defecto: un auto sin velocidad máxima indicada se estabiliza en 20 m/s', () => {
  assert.equal(MAX_SPEED, 20);
  const car = createCar();
  assert.equal(car.maxSpeed, 20);
  for (let i = 0; i < 120; i++) stepCar(car, { forward: true }, STEP);
  assert.equal(car.speed, 20);
  const w = createWorld({ seed: 1, density: 0, controller: { control: () => ({ forward: true }) } });
  for (let i = 0; i < 120; i++) w.step();
  assert.equal(w.car.speed, 20);
  assert.equal(w.perception.speed, 1);
  assert.equal(TRAFFIC_SPEED * 2, MAX_SPEED, 'un auto que esquiva va al doble que el tráfico');
});

test('velocidad por defecto: restablecer en la pestaña 1 vuelve a 20 m/s y el tooltip lo dice', () => {
  assert.equal(DEFAULT_SETTINGS.maxSpeed, 20);
  assert.match(es['help.drive.resetSettings.what'], /20 m\/s/);
  assert.match(en['help.drive.resetSettings.what'], /20 m\/s/);
});
