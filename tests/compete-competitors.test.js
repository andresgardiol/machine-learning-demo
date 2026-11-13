// Quién puede correr en Competir (pestana-competir D4).
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import {
  listCandidates, buildCompetitor, createSelection, ownProgram, pickerGroups, DEFAULT_SELECTION, MAX_COMPETITORS, SEVEN,
} from '../src/tabs/compete/competitors.js';
import { createBrain } from '../src/core/brain.js';
import { createNetwork } from '../src/core/network.js';
import { createRandom } from '../src/core/random.js';
import { createRace } from '../src/core/race.js';

const tEs = (k) => es[k] ?? k;
const tEn = (k) => en[k] ?? k;

function brain(id, { sensors = 5, updatedAt = '2026-11-01T00:00:00.000Z' } = {}) {
  const b = createBrain({
    id, name: id, now: updatedAt,
    network: createNetwork({ inputs: sensors + 1, hidden: [4], outputs: 4, random: createRandom(id.length) }),
    sensors: { count: sensors, range: 3, spread: 90 },
    training: { generations: 3, seed: 1, maxSpeed: 20, fitness: { kind: 'lead', best: 1 }, evolution: {}, scenarios: [] },
  });
  return b;
}
const examples = [brain('street-new'), brain('street-same'), brain('oval'), brain('all-tracks')];

test('selección por defecto: vos, el programa de 7 sensores y el ejemplo de la calle con tráfico nuevo, en ese orden', () => {
  assert.deepEqual([...DEFAULT_SELECTION], ['human', 'program:seven', 'example:street-new']);
  const s = createSelection();
  assert.deepEqual(s.keys, ['human', 'program:seven', 'example:street-new']);
  assert.deepEqual(s.keys.map(s.slotOf), [1, 2, 3]);
});

test('la selección por defecto no depende de la biblioteca ni del programa propio (aunque tenga errores)', () => {
  const empty = listCandidates({ examples, t: tEs });
  const full = listCandidates({ examples, library: [{ origin: 'saved', brain: brain('mine') }], remembered: { program: 'si si si', sensors: null }, t: tEs });
  for (const list of [empty, full]) {
    const s = createSelection();
    s.prune(list.filter((c) => c.available).map((c) => c.key));
    assert.deepEqual(s.keys, [...DEFAULT_SELECTION]);
  }
  assert.equal(full.find((c) => c.key === 'program').available, false);
});

test('candidatos en orden: vos, los tres programas de ejemplo, tu programa, la biblioteca y los ejemplos', () => {
  const list = listCandidates({ examples, library: [{ origin: 'saved', brain: brain('a') }, { origin: 'autosave', slot: 'current', brain: brain('b') }], t: tEs });
  assert.deepEqual(list.map((c) => c.key), [
    'human', 'program:three', 'program:seven', 'program:twenty', 'program', 'brain:a', 'brain:b',
    'example:street-new', 'example:street-same', 'example:oval', 'example:all-tracks',
  ]);
  assert.equal(list.find((c) => c.key === 'brain:b').origin, 'autosave');
});

test('máximo seis: el séptimo no se puede marcar', () => {
  const s = createSelection();
  for (const k of ['a', 'b', 'c']) assert.equal(s.toggle(k), true);
  assert.equal(s.size, MAX_COMPETITORS);
  assert.equal(s.whyNotSelect('d'), 'max');
  assert.equal(s.toggle('d'), false);
  assert.equal(s.has('d'), false);
});

test('al menos uno: el último no se puede desmarcar', () => {
  const s = createSelection(['human']);
  assert.equal(s.whyNotUnselect('human'), 'min');
  assert.equal(s.toggle('human'), false);
  assert.deepEqual(s.keys, ['human']);
});

test('la casilla se conserva al desmarcar a otro, y el siguiente toma la más baja libre', () => {
  const s = createSelection();
  s.toggle('x');
  assert.equal(s.slotOf('x'), 4);
  s.toggle('program:seven');
  assert.equal(s.slotOf('x'), 4, 'conserva su número');
  assert.equal(s.slotOf('example:street-new'), 3);
  assert.deepEqual(s.keys, ['human', 'example:street-new', 'x']);
  s.toggle('y');
  assert.equal(s.slotOf('y'), 2, 'toma el hueco');
});

test('el programa de ejemplo de 7 sensores: el mismo programa en los dos idiomas', () => {
  const [cEs] = listCandidates({ t: tEs }).filter((c) => c.key === 'program:seven');
  assert.deepEqual(cEs.sensors, { count: 7, range: 3, spread: 90 });
  assert.equal(SEVEN.nameKey, 'rules.example.seven.name');
  const run = (t) => {
    const comp = buildCompetitor(cEs, { t });
    const race = createRace({ seed: 3, competitors: [comp] });
    for (let i = 0; i < 1200; i++) race.step();
    return JSON.stringify(race.results);
  };
  assert.equal(run(tEs), run(tEn));
});

test('el programa de ejemplo no depende de lo escrito en Reglas a mano', () => {
  const a = listCandidates({ remembered: { program: '', sensors: { count: 3, range: 2, spread: 60 } }, t: tEs });
  const b = listCandidates({ t: tEs });
  const seven = (l) => l.find((c) => c.key === 'program:seven');
  assert.deepEqual(seven(a), seven(b));
});

test('tu programa con errores: deshabilitado, con su motivo', () => {
  const list = listCandidates({ remembered: { program: 'si sensor1 > entonces avanzar', sensors: null }, t: tEs });
  const own = list.find((c) => c.key === 'program');
  assert.equal(own.available, false);
  assert.equal(own.reason, 'programErrors');
  assert.throws(() => buildCompetitor(own, { t: tEs }));
});

test('tu programa válido: corre con los sensores para los que está escrito', () => {
  const list = listCandidates({ remembered: { program: 'avanzar\nsi sensor3 > 0,5 entonces girar izquierda', sensors: { count: 3, range: 2, spread: 60 } }, t: tEs });
  const own = list.find((c) => c.key === 'program');
  assert.equal(own.available, true);
  const comp = buildCompetitor(own, { t: tEs });
  assert.deepEqual(comp.sensors, { count: 3, range: 2, spread: 60 });
  assert.equal(comp.controller.control({ sensors: [0, 0, 0.9], speed: 0 }).left, true);
});

test('sin programa recordado: el inicial de Reglas a mano', () => {
  const own = ownProgram({}, tEs);
  assert.equal(own.text, es['rules.program.initial']);
  assert.equal(own.ok, true);
  assert.equal(own.sensors.count, 5);
});

test('un cerebro inválido queda deshabilitado, con su motivo', () => {
  const bad = { ...brain('roto'), network: { sizes: [6, 4], activation: 'step', layers: [] } };
  const c = listCandidates({ library: [{ origin: 'saved', brain: bad }], t: tEs }).find((x) => x.key === 'brain:roto');
  assert.equal(c.available, false);
  assert.equal(c.reason, 'invalidBrain');
});

test('un cerebro eliminado sale de la selección; si no queda nadie, vuelve la de por defecto', () => {
  const s = createSelection(['brain:a', 'human']);
  assert.deepEqual(s.prune(['human', 'program:seven', 'example:street-new']), ['brain:a']);
  assert.deepEqual(s.keys, ['human']);
  const only = createSelection(['brain:a']);
  only.prune(['human', 'program:seven', 'example:street-new']);
  assert.deepEqual(only.keys, [...DEFAULT_SELECTION]);
});

test('la firma cambia si el cerebro se actualiza o el programa cambia', () => {
  const a = listCandidates({ library: [{ origin: 'saved', brain: brain('p') }], remembered: { program: 'avanzar', sensors: null }, t: tEs });
  const b = listCandidates({ library: [{ origin: 'saved', brain: brain('p', { updatedAt: '2026-11-02T00:00:00.000Z' }) }], remembered: { program: 'retroceder', sensors: null }, t: tEs });
  const sig = (l, k) => l.find((c) => c.key === k).signature;
  assert.notEqual(sig(a, 'brain:p'), sig(b, 'brain:p'));
  assert.notEqual(sig(a, 'program'), sig(b, 'program'));
  assert.equal(sig(a, 'program:seven'), sig(b, 'program:seven'));
});

// --- Selector para agregar (D10b) -------------------------------------------------------------------

test('selector: los que no están en la carrera, en grupos y en orden; tu programa primero entre los programas', () => {
  const list = listCandidates({ examples, library: [{ origin: 'saved', brain: brain('a') }], t: tEs });
  const groups = pickerGroups(list, createSelection());
  assert.deepEqual(groups.map((g) => g.id), ['programs', 'brains', 'examples'], 'vos ya está: su grupo no aparece');
  assert.deepEqual(groups[0].items.map((c) => c.key), ['program', 'program:three', 'program:twenty']);
  assert.deepEqual(groups[1].items.map((c) => c.key), ['brain:a']);
  assert.deepEqual(groups[2].items.map((c) => c.key), ['example:street-same', 'example:oval', 'example:all-tracks']);
  const withoutHuman = createSelection(['program:seven']);
  assert.equal(pickerGroups(list, withoutHuman)[0].id, 'human');
});

test('selector: el candidato que no puede correr va deshabilitado con su motivo', () => {
  const list = listCandidates({ remembered: { program: 'si si', sensors: null }, t: tEs });
  const own = pickerGroups(list, createSelection()).find((g) => g.id === 'programs').items.find((c) => c.key === 'program');
  assert.equal(own.available, false);
  assert.equal(own.reason, 'programErrors');
});

test('selector: sin candidatos, ningún grupo', () => {
  const list = listCandidates({ t: tEs }).filter((c) => ['human', 'program:seven', 'program'].includes(c.key));
  assert.deepEqual(pickerGroups(list, createSelection(['human', 'program:seven', 'program'])), []);
});

test('los programas de 3 y de 20 sensores corren con sus sensores, en los dos idiomas igual', () => {
  const list = listCandidates({ t: tEs });
  for (const [key, count] of [['program:three', 3], ['program:twenty', 20]]) {
    const c = list.find((x) => x.key === key);
    assert.equal(c.sensors.count, count);
    const run = (t) => { const race = createRace({ seed: 3, competitors: [buildCompetitor(c, { t })] }); for (let i = 0; i < 900; i++) race.step(); return JSON.stringify(race.results); };
    assert.equal(run(tEs), run(tEn), key);
  }
});

test('máximo de seis y mínimo de uno, también agregando desde el selector', () => {
  const s = createSelection();
  for (const k of ['program:three', 'program:twenty', 'program']) s.toggle(k);
  assert.equal(s.size, 6);
  assert.equal(s.whyNotSelect('example:oval'), 'max');
  const one = createSelection(['human']);
  assert.equal(one.whyNotUnselect('human'), 'min');
});
