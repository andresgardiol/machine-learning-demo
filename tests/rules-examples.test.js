// Programa inicial y programas de ejemplo (design.md D10, spec `pestana-reglas`): válidos en los dos
// idiomas, con sus reglas y constantes, iguales en español y en inglés, y con la semilla de la
// pestaña cumplen sus escenarios con el intérprete real.
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { parseProgram, runProgram, createRulesController } from '../src/core/rules.js';
import { createWorld } from '../src/core/world.js';
import { createRandom } from '../src/core/random.js';
import { DEFAULT_SETTINGS, worldSpec } from '../src/tabs/shared/street-settings.js';
import { createDriveSession } from '../src/tabs/drive/session.js';
import { DEFAULT_SEED, INITIAL_PROGRAM, EXAMPLES, PROGRAMS, sensorSettings } from '../src/tabs/rules/examples.js';

const byId = Object.fromEntries(PROGRAMS.map((p) => [p.id, p]));
const TWO_MINUTES = 120 * 60; // pasos de 1/60 s

/** Reglas y constantes de cada programa (tabla de design.md D10). */
const TABLE = {
  initial: { count: 5, range: 3, spread: 90, rules: 1, constants: 1 },
  three: { count: 3, range: 2, spread: 60, rules: 1, constants: 1 },
  seven: { count: 7, range: 3, spread: 90, rules: 5, constants: 4 },
  twenty: { count: 20, range: 3, spread: 120, rules: 9, constants: 5 },
};

function parsed(dict, p) {
  const r = parseProgram(dict[p.textKey], { sensors: p.sensors.count });
  assert.equal(r.ok, true, `${p.id}: ${JSON.stringify(r.errors)}`);
  return r;
}

/** Corre un programa sin navegador con sus sensores, la configuración por defecto y una semilla. */
function drive(p, seed, { dict = es, maxSteps = TWO_MINUTES } = {}) {
  const { program } = parsed(dict, p);
  const world = createWorld({ ...worldSpec({ ...DEFAULT_SETTINGS, ...sensorSettings(p) }, seed), controller: createRulesController({ program }) });
  const session = createDriveSession();
  for (let i = 0; i < maxSteps && !world.crashed; i += 1) {
    world.step();
    session.observe(world);
  }
  return { distance: session.distance, passed: session.passed, crashed: world.crashed, cause: world.crashCause, seconds: world.time };
}

test('la pestaña usa la semilla de tráfico 2 y el orden de los ejemplos es 3, 7 y 20 sensores', () => {
  assert.equal(DEFAULT_SEED, 2);
  assert.deepEqual(EXAMPLES.map((e) => e.id), ['three', 'seven', 'twenty']);
  assert.equal(INITIAL_PROGRAM.id, 'initial');
});

test('los ocho textos son válidos con los sensores de su ejemplo y tienen las reglas y constantes de la tabla', () => {
  for (const p of PROGRAMS) {
    const t = TABLE[p.id];
    assert.deepEqual({ ...p.sensors }, { count: t.count, range: t.range, spread: t.spread }, p.id);
    for (const dict of [es, en]) {
      const r = parsed(dict, p);
      assert.equal(r.rules, t.rules, `${p.id}: reglas`);
      assert.equal(r.constants.length, t.constants, `${p.id}: constantes`);
    }
  }
});

test('los ejemplos usan constantes: ningún número aparece en una regla, todos están arriba con nombre', () => {
  for (const p of PROGRAMS) {
    for (const dict of [es, en]) {
      const lines = dict[p.textKey].split('\n');
      const numberLines = lines.filter((l) => /\d[.,]\d/.test(l.replace(/sensor\d+/g, '')));
      assert.ok(numberLines.length > 0);
      for (const l of numberLines) assert.match(l, /^\p{L}[\p{L}_]*\s=\s-?\d+[.,]\d+$/u, `${p.id}: número fuera de una constante: ${l}`);
    }
  }
});

test('los programas en inglés usan el vocabulario y los nombres en inglés, con punto decimal', () => {
  for (const p of PROGRAMS) {
    const text = en[p.textKey];
    assert.doesNotMatch(text, /\b(si|entonces|avanzar|retroceder|girar|izquierda|derecha|cerca)\b/, p.id);
    assert.doesNotMatch(text, /\d,\d/, p.id);
    assert.match(text, /\bnear = 0\.\d+/, p.id);
  }
});

test('la versión en inglés de cada programa acciona lo mismo que la española ante mil percepciones', () => {
  for (const p of PROGRAMS) {
    const a = parsed(es, p).program;
    const b = parsed(en, p).program;
    const random = createRandom(17);
    for (let i = 0; i < 1000; i += 1) {
      const perception = {
        sensors: Array.from({ length: p.sensors.count }, () => (random() < 0.3 ? 0 : random())),
        speed: random() * 1.5 - 0.5,
      };
      assert.deepEqual(runProgram(b, perception), runProgram(a, perception), `${p.id}, percepción ${i}`);
    }
  }
});

// --- Medición con el intérprete real (tarea 2.3) -------------------------------------------------

const results = {};
const measured = (id) => {
  results[id] ??= drive(byId[id], DEFAULT_SEED);
  return results[id];
};
const report = (t, id, expected) => {
  const r = measured(id);
  t.diagnostic(`${id}: ${r.distance.toFixed(1)} m, ${r.passed} superados, ${r.crashed ? `choca (${r.cause}) a los ${r.seconds.toFixed(1)} s` : 'sin chocar'}; design.md: ${expected}`);
};

test('El programa inicial hace algo y no alcanza: esquiva al primer vehículo, lo supera y choca contra el borde antes de los 100 m', (t) => {
  const r = measured('initial');
  report(t, 'initial', '82 m y 1, borde');
  assert.equal(r.crashed, true);
  assert.equal(r.cause, 'edge');
  assert.ok(r.distance < 100, `${r.distance} m`);
  assert.ok(r.passed >= 1, `${r.passed} superados`);
});

test('Tres sensores cortos: en dos minutos no choca y no supera ningún vehículo', (t) => {
  const r = measured('three');
  report(t, 'three', '1224 m y 0, sin chocar');
  assert.equal(r.crashed, false);
  assert.equal(r.passed, 0);
  assert.ok(r.distance > 500, `${r.distance} m`); // avanza: frena detrás del primero y lo sigue
});

test('Siete sensores: supera al menos 10 vehículos antes de chocar', (t) => {
  const r = measured('seven');
  report(t, 'seven', '1041 m y 14');
  assert.ok(r.passed >= 10, `${r.passed} superados`);
});

test('Veinte sensores: casi el doble de reglas que el de siete y recorre menos distancia que aquel', (t) => {
  const r = measured('twenty');
  report(t, 'twenty', '290 m y 4');
  const rules20 = parsed(es, byId.twenty).rules;
  const rules7 = parsed(es, byId.seven).rules;
  assert.ok(rules20 >= rules7 * 1.6 && rules20 <= rules7 * 2, `${rules20} reglas contra ${rules7}`);
  assert.ok(r.distance < measured('seven').distance, `${r.distance} m contra ${measured('seven').distance} m`);
});

test('Ningún ejemplo alcanza siempre: los de siete y veinte sensores chocan en al menos uno de cinco tráficos', (t) => {
  for (const id of ['seven', 'twenty']) {
    const runs = [1, 2, 3, 4, 5].map((seed) => drive(byId[id], seed));
    t.diagnostic(`${id}: ${runs.map((r, i) => `semilla ${i + 1}: ${r.distance.toFixed(0)} m, ${r.passed}${r.crashed ? '' : ', sin chocar'}`).join(' · ')}`);
    assert.ok(runs.some((r) => r.crashed), id);
  }
});

test('mismo programa, mismo tráfico: dos corridas recorren lo mismo', () => {
  assert.deepEqual(drive(byId.seven, DEFAULT_SEED, { maxSteps: 1200 }), drive(byId.seven, DEFAULT_SEED, { maxSteps: 1200 }));
});
