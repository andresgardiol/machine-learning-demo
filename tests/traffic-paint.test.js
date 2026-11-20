import test from 'node:test';
import assert from 'node:assert/strict';
import { createTraffic, paintFor } from '../src/core/traffic.js';
import { createTrackById } from '../src/core/circuits.js';
import { TRAFFIC_PAINTS } from '../src/core/constants.js';

// Pintura del tráfico (vehiculos-ilustrados D8, spec "Mismos colores con la misma semilla").

const vehiclesOf = (seed, lanes = 3, density = 50, t = 12.5) =>
  createTraffic({ seed, track: createTrackById('straight', { lanes }), density }).vehicles(t, -100, 1500);

test('mismos colores con la misma semilla', () => {
  const a = vehiclesOf(7);
  const b = vehiclesOf(7);
  assert.ok(a.length >= 20, `${a.length} vehículos`);
  assert.deepEqual(a.map((v) => [v.id, v.paint]), b.map((v) => [v.id, v.paint]));
});

test('cada vehículo conserva su pintura mientras avanza y aunque cambie la densidad', () => {
  const track = createTrackById('straight', { lanes: 3 });
  const traffic = createTraffic({ seed: 3, track, density: 50 });
  const at0 = new Map(traffic.vehicles(0, -100, 3000).map((v) => [v.id, v.paint]));
  for (const v of traffic.vehicles(30, -100, 3000)) if (at0.has(v.id)) assert.equal(v.paint, at0.get(v.id), v.id);
  // La pintura sale solo de la semilla, el carril y el índice.
  for (const v of vehiclesOf(3, 3, 80)) assert.equal(v.paint, paintFor(3, v.lane, v.index));
});

test('se usan todas las pinturas, en proporciones parecidas', () => {
  const count = new Array(TRAFFIC_PAINTS).fill(0);
  for (const seed of [1, 2, 3, 4, 5]) for (const v of vehiclesOf(seed, 4, 100)) {
    assert.ok(Number.isInteger(v.paint) && v.paint >= 0 && v.paint < TRAFFIC_PAINTS, `pintura ${v.paint}`);
    count[v.paint]++;
  }
  const total = count.reduce((a, b) => a + b, 0);
  for (const c of count) assert.ok(c / total > 0.1, `proporciones ${count}`);
});

test('otra semilla, otros colores', () => {
  const a = vehiclesOf(1).map((v) => v.paint).join('');
  const b = vehiclesOf(2).map((v) => v.paint).join('');
  assert.notEqual(a, b);
});
