// Cerebros de ejemplo (spec `cerebros-de-ejemplo`, pestana-competir D6): válidos, con datos de
// entrenamiento verdaderos y con los contrastes que tienen que mostrar. Se regeneran con
// `npm run examples` (tools/train-examples.mjs), que comprueba lo mismo antes de escribirlos.
import test from 'node:test';
import assert from 'node:assert/strict';
import { EXAMPLE_BRAINS, EXAMPLE_IDS } from '../src/data/example-brains.js';
import { validateBrain, carForBrain, scenarioTracks, totalGenerations } from '../src/core/brain.js';
import { TRACK_IDS } from '../src/core/circuits.js';
import { measureBrain, EXAMPLE_CHECKS, EXAMPLE_SPECS, generalizes, renderExamples } from '../tools/train-examples.mjs';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';

const byId = Object.fromEntries(EXAMPLE_BRAINS.map((b) => [b.id, b]));

test('cuatro cerebros de ejemplo, en orden, con nombre en los dos idiomas', () => {
  assert.deepEqual([...EXAMPLE_IDS], ['street-new', 'street-same', 'oval', 'all-tracks']);
  assert.deepEqual(EXAMPLE_SPECS.map((s) => s.id), [...EXAMPLE_IDS]);
  for (const id of EXAMPLE_IDS) {
    for (const dict of [es, en]) assert.equal(typeof dict[`compete.example.${id}`], 'string', id);
  }
  assert.equal(es['compete.example.oval'], 'Solo óvalo');
  assert.equal(en['compete.example.street-same'], 'Street, same traffic');
});

test('los cuatro son válidos y cada uno maneja un auto con sus propios sensores', () => {
  for (const b of EXAMPLE_BRAINS) {
    assert.equal(validateBrain(b), null, b.id);
    const car = carForBrain(b);
    assert.deepEqual(car.sensors, { ...b.sensors });
    assert.equal(typeof car.controller.control, 'function');
    assert.ok(Object.isFrozen(b), 'son datos de la aplicación: no se cambian');
  }
});

test('datos verdaderos: dónde y cuántas generaciones entrenó cada uno', () => {
  const tracksOf = (b) => [...new Set(b.training.scenarios.flatMap((s) => scenarioTracks(s.track)))];
  assert.deepEqual(tracksOf(byId.oval), ['oval']);
  assert.ok(byId.oval.training.generations >= 51 && byId.oval.training.generations <= 60);
  assert.equal(totalGenerations(byId.oval.training.scenarios), byId.oval.training.generations);
  assert.deepEqual(tracksOf(byId['all-tracks']).sort(), [...TRACK_IDS].sort());
  assert.ok(byId['street-same'].training.scenarios.every((s) => s.trafficMode === 'same'));
  assert.ok(byId['street-new'].training.scenarios.every((s) => s.trafficMode === 'new'));
  assert.deepEqual(tracksOf(byId['street-new']), ['straight']);
});

test('lo que muestran los ejemplos, medido en carreras con la penalización por defecto', () => {
  const m = Object.fromEntries(EXAMPLE_BRAINS.map((b) => [b.id, measureBrain(b)]));
  for (const id of EXAMPLE_IDS) assert.equal(EXAMPLE_CHECKS[id](m[id]).ok, true, id);
  // Generaliza frente a memoriza: en diez tráficos nuevos, el de tráfico nuevo choca menos en promedio.
  assert.ok(generalizes(m['street-new'], m['street-same']), `${m['street-new'].newCrashes} < ${m['street-same'].newCrashes}`);
  // El que memorizó, en su tráfico: llega sin chocar.
  assert.equal(m['street-same'].practice.arrived, true);
  assert.equal(m['street-same'].practice.crashes, 0);
  // El del óvalo, en el óvalo, y el de las cuatro pistas en el óvalo y la calle con tráfico nuevo.
  assert.equal(m.oval.circuits.oval.arrived, true);
  assert.equal(m['all-tracks'].circuits.oval.arrived, true);
  assert.equal(m['all-tracks'].newArrivals, 10);
});

test('el archivo generado sale del texto de la herramienta (mismo formato)', () => {
  const fake = Object.fromEntries(EXAMPLE_BRAINS.map((b) => [b.id, {
    brain: b, seed: 1, generation: b.training.generations,
    check: { ok: true }, measure: measureBrain(b),
  }]));
  const text = renderExamples(fake);
  assert.match(text, /ARCHIVO GENERADO por tools\/train-examples\.mjs/);
  assert.match(text, /export const EXAMPLE_BRAINS = Object\.freeze\(\[/);
});
