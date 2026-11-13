// Reglas a mano abre sin errores: el programa recordado con sus sensores (panel-de-entrenar-por-vistas D15).
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createPreferences } from '../src/ui/preferences.js';
import { rememberedSensors, highestSensor, EXAMPLES, INITIAL_PROGRAM } from '../src/tabs/rules/examples.js';
import { normalizeSettings, DEFAULT_SETTINGS } from '../src/tabs/shared/street-settings.js';
import { parseProgram } from '../src/core/rules.js';

function memory() {
  const data = new Map();
  return { data, storage: { getItem: (k) => (data.has(k) ? data.get(k) : null), setItem: (k, v) => data.set(k, String(v)) } };
}

/** Lo que hace la pestaña al abrir: ajustes de la calle con los sensores recordados y el texto. */
function open(prefs) {
  const program = prefs.rulesProgram;
  const settings = normalizeSettings({ ...DEFAULT_SETTINGS, ...rememberedSensors({ program, sensors: program === null ? null : prefs.rulesSensors }) });
  const text = program ?? es[INITIAL_PROGRAM.textKey];
  return { settings, parsed: parseProgram(text, { sensors: settings.sensorCount }) };
}

const twenty = EXAMPLES.find((e) => e.id === 'twenty');

test('preferencia rulesSensors: se guarda y se lee; sin dato o dañada, null', () => {
  const { data, storage } = memory();
  const prefs = createPreferences(() => storage);
  assert.equal(prefs.rulesSensors, null);
  prefs.rulesSensors = { count: 20, range: 3, spread: 120 };
  assert.equal(data.get('mlLab.rules.sensors'), '{"count":20,"range":3,"spread":120}');
  assert.deepEqual(createPreferences(() => storage).rulesSensors, { count: 20, range: 3, spread: 120 });
  data.set('mlLab.rules.sensors', '{no es json');
  assert.equal(createPreferences(() => storage).rulesSensors, null);
  data.set('mlLab.rules.sensors', '{"count":"x","range":3,"spread":90}');
  assert.equal(createPreferences(() => storage).rulesSensors, null);
  assert.equal(createPreferences(() => { throw new Error('SecurityError'); }).rulesSensors, null);
});

test('Ejemplo de veinte sensores recordado: abre con 20 sensores de 3 largos y 120 grados, sin errores', () => {
  for (const dict of [es, en]) {
    const { storage } = memory();
    const prefs = createPreferences(() => storage);
    prefs.rulesProgram = dict[twenty.textKey];
    prefs.rulesSensors = twenty.sensors;
    const { settings, parsed } = open(createPreferences(() => storage));
    assert.deepEqual([settings.sensorCount, settings.sensorRange, settings.sensorSpread], [20, 3, 120]);
    assert.equal(parsed.ok, true);
  }
});

test('Programa guardado sin sus sensores: la cantidad que el programa necesita, sin errores', () => {
  const { storage } = memory();
  createPreferences(() => storage).rulesProgram = es[twenty.textKey]; // lo que tenía el dueño
  const { settings, parsed } = open(createPreferences(() => storage));
  assert.equal(settings.sensorCount, 20);
  assert.deepEqual([settings.sensorRange, settings.sensorSpread], [INITIAL_PROGRAM.sensors.range, INITIAL_PROGRAM.sensors.spread]);
  assert.equal(parsed.ok, true);
  // Un programa que usa menos sensores que los de por defecto abre con los de por defecto.
  assert.equal(rememberedSensors({ program: 'si sensor2 < 1 entonces frenar', sensors: null }).sensorCount, 5);
});

test('Sensores cambiados a mano: abre con los que dejó, ajustados a sus rangos', () => {
  const { storage } = memory();
  const prefs = createPreferences(() => storage);
  prefs.rulesProgram = es[INITIAL_PROGRAM.textKey];
  prefs.rulesSensors = { count: 9, range: 5.5, spread: 180 };
  assert.deepEqual(Object.values(open(createPreferences(() => storage)).settings).slice(-3), [9, 5.5, 180]);
  prefs.rulesSensors = { count: 500, range: 3, spread: 90 };
  assert.equal(open(createPreferences(() => storage)).settings.sensorCount, 100);
});

test('Sin programa recordado: el programa inicial con sus sensores', () => {
  const { storage } = memory();
  const { settings, parsed } = open(createPreferences(() => storage));
  assert.equal(settings.sensorCount, INITIAL_PROGRAM.sensors.count);
  assert.equal(parsed.ok, true);
});

test('sensor más alto que nombra el código: los comentarios no cuentan', () => {
  assert.equal(highestSensor('# sensor99\nsi sensor3 < 1 y sensor 12 < 2 entonces frenar'), 12);
  assert.equal(highestSensor('acelerar'), 0);
  assert.equal(highestSensor(es[twenty.textKey]), 20);
});
