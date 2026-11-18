// Comparación con los ejemplos de Reglas a mano (reglas-el-choque-ensena D4, tarea 2.1): corrida sin
// navegador, por tramos, con la misma semilla, la calle recta y los sensores de cada programa.
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import { compareRuns, compareNow, compareNotes, compareResult, COMPARE_CHUNK_STEPS, EXAMPLES_SPEED } from '../src/tabs/rules/compare.js';
import en from '../src/i18n/en.js';
import { DEFAULT_SETTINGS } from '../src/tabs/shared/street-settings.js';
import { DEFAULT_SEED, INITIAL_PROGRAM, EXAMPLES } from '../src/tabs/rules/examples.js';

const programs = (dict = es) => [INITIAL_PROGRAM, ...EXAMPLES].map((p) => ({ id: p.id, text: dict[p.textKey], sensors: { ...p.sensors } }));
const spec = (extra = {}) => ({ seed: DEFAULT_SEED, settings: DEFAULT_SETTINGS, programs: programs(), ...extra });
const byId = (rows) => Object.fromEntries(rows.map((r) => [r.id, r]));

let defaults = null;
const measured = () => (defaults ??= compareNow(spec()));

test('Estado por defecto: con la semilla 2 devuelve cuatro filas, con sus sensores, reglas y cifras', (t) => {
  const rows = measured();
  t.diagnostic(rows.map((r) => `${r.id}: ${r.sensors.count} sensores, ${r.rules} reglas, ${r.distance.toFixed(1)} m, ${r.passed} superados, ${r.crashed ? `choca (${r.cause}) a los ${r.seconds.toFixed(1)} s` : 'no choca en 2 min'}`).join(' · '));
  assert.deepEqual(rows.map((r) => r.id), ['initial', 'three', 'seven', 'twenty']);
  assert.deepEqual(rows.map((r) => r.sensors.count), [5, 3, 7, 20]);
  assert.deepEqual(rows.map((r) => r.rules), [1, 1, 5, 9]);
  for (const r of rows) {
    assert.equal(r.ok, true);
    assert.ok(Number.isFinite(r.distance) && r.distance >= 0);
    assert.ok(Number.isInteger(r.passed));
    assert.equal(typeof r.crashed, 'boolean');
  }
  const m = byId(rows);
  assert.equal(m.initial.crashed, true);
  assert.equal(Math.floor(m.initial.distance), 82); // el mismo choque que se ve en la pestaña
});

test('Determinismo: dos corridas dan las mismas cifras', () => {
  assert.deepEqual(compareNow(spec()), measured());
});

test('Más reglas no es mejor: el de 20 sensores tiene casi el doble de reglas que el de 7 y no recorre más que él', () => {
  const m = byId(measured());
  assert.ok(m.twenty.rules >= m.seven.rules * 1.6 && m.twenty.rules <= m.seven.rules * 2, `${m.twenty.rules} contra ${m.seven.rules}`);
  assert.ok(m.twenty.distance <= m.seven.distance, `${m.twenty.distance} m contra ${m.seven.distance} m`);
});

test('El tope de 2 minutos se respeta: el de tres sensores no choca y corre exactamente 120 s', () => {
  const m = byId(measured());
  assert.equal(m.three.crashed, false);
  assert.ok(Math.abs(m.three.seconds - 120) < 1e-9, `${m.three.seconds} s`);
  const short = byId(compareNow(spec({ limitSeconds: 5 })));
  for (const r of Object.values(short)) assert.ok(r.seconds <= 5 + 1e-9, `${r.id}: ${r.seconds} s`);
});

test('Partirlo en tramos de distinto tamaño da el mismo resultado, y cede entre tramos', () => {
  for (const chunkSteps of [1, 97, 600, 5000]) {
    assert.deepEqual(compareNow(spec({ chunkSteps })), measured(), `tramos de ${chunkSteps}`);
  }
  const it = compareRuns(spec());
  let yields = 0;
  let last = null;
  for (let r = it.next(); !r.done; r = it.next()) { yields += 1; last = r.value; }
  assert.ok(yields >= 4, `${yields} tramos`);
  assert.ok(last.done <= last.total && last.total === 4);
  assert.equal(COMPARE_CHUNK_STEPS, 600);
});

test('Un programa con errores sale como fila sin cifras, y los demás se corren igual', () => {
  const rows = compareNow(spec({ programs: [{ id: 'own', text: 'volar', sensors: { count: 5, range: 3, spread: 90 } }, ...programs().slice(1)] }));
  assert.equal(rows[0].ok, false);
  assert.equal(rows[0].distance, null);
  assert.deepEqual(rows.slice(1), measured().slice(1));
});

test('Corre en la calle recta aunque la pestaña esté en un circuito, y avisa la velocidad que no es la de los ejemplos', () => {
  assert.deepEqual(compareNow(spec({ settings: { ...DEFAULT_SETTINGS, track: 'oval' } })), measured());
  assert.equal(EXAMPLES_SPEED, 20);
  assert.deepEqual(compareNotes(DEFAULT_SETTINGS, false), { circuit: false, speed: false });
  assert.deepEqual(compareNotes({ ...DEFAULT_SETTINGS, maxSpeed: 25 }, true), { circuit: true, speed: true });
});

test('Frenar no alcanza: sin chocar y sin superar a nadie, el resultado dice que frena detrás del primero', () => {
  const m = byId(measured());
  assert.deepEqual(compareResult(m.three), { key: 'rules.compare.brakes' });
  assert.equal(es['rules.compare.brakes'], 'frena detrás del primero');
  assert.equal(typeof en['rules.compare.brakes'], 'string');
  assert.deepEqual(compareResult(m.seven), { key: 'rules.compare.crashed', params: { value: 1040 } });
  assert.deepEqual(compareResult({ ok: true, crashed: false, passed: 3, distance: 900 }), { key: 'rules.compare.notCrashed' });
  assert.deepEqual(compareResult({ ok: false }), { key: 'rules.compare.invalid' });
});
