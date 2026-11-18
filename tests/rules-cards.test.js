// Fichas de Reglas a mano (reglas-como-fichas, tareas 2.1 y 2.2): la proyección del texto a fichas y los
// parches que escribe cada edición, sin DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { projectCards, movableUnits, patch, formatNumber, defaultRule } from '../src/tabs/rules/cards.js';
import { PROGRAMS, EXAMPLES, DEFAULT_SEED } from '../src/tabs/rules/examples.js';
import { parseProgram } from '../src/core/rules.js';
import { compareRuns } from '../src/tabs/rules/compare.js';
import { DEFAULT_SETTINGS } from '../src/tabs/shared/street-settings.js';

const DICTS = { es, en };

/** Las líneas de cada ficha, una vez cada una y en orden, rearman el texto. */
function assertCovers(text) {
  const cards = projectCards(text);
  const lines = text.split('\n');
  let next = 1;
  for (const c of cards) {
    assert.equal(c.lines[0], next, `la ficha ${c.kind} empieza en ${c.lines[0]}, se esperaba ${next}`);
    assert.ok(c.lines[1] >= c.lines[0]);
    next = c.lines[1] + 1;
  }
  assert.equal(next - 1, lines.length, 'todas las líneas están en alguna ficha');
  const rebuilt = cards.map((c) => lines.slice(c.lines[0] - 1, c.lines[1]).join('\n')).join('\n');
  assert.equal(rebuilt, text);
  return cards;
}

const kinds = (text) => projectCards(text).map((c) => c.kind);
const sensors = (p) => p.sensors.count;

// --- 2.1 Proyección ------------------------------------------------------------------------------------

test('el programa inicial y los tres ejemplos se proyectan sin fichas escritas a mano, en los dos idiomas', () => {
  for (const [lang, dict] of Object.entries(DICTS)) {
    for (const p of PROGRAMS) {
      const cards = assertCovers(dict[p.textKey]);
      const manual = cards.filter((c) => c.kind === 'manual');
      assert.deepEqual(manual, [], `${lang} ${p.id}: ${manual.map((c) => c.text).join(' | ')}`);
      // Tantas fichas de regla como reglas cuenta el lenguaje.
      const rules = parseProgram(dict[p.textKey], { sensors: sensors(p) }).rules;
      assert.equal(cards.filter((c) => c.kind === 'rule').length, rules, `${lang} ${p.id}`);
    }
  }
});

test('Estado por defecto: la constante cerca, la orden avanzar y la regla de sensor3', () => {
  const cards = projectCards(es['rules.program.initial']).filter((c) => c.kind !== 'note');
  assert.deepEqual(cards.map((c) => c.kind), ['constant', 'order', 'rule']);
  assert.equal(cards[0].name, 'cerca');
  assert.equal(cards[0].value, 0.2);
  assert.deepEqual(cards[1].actions.map((a) => a.control), ['forward']);
  const [cond] = cards[2].conditions;
  assert.deepEqual([cond.left.kind, cond.left.index, cond.op.op, cond.right.kind, cond.right.name, cond.right.value], ['sensor', 3, '>', 'constant', 'cerca', 0.2]);
  assert.deepEqual(cards[2].actions.map((a) => a.control), ['left']);
  assert.deepEqual(cards[2].lines, [4, 5]);
  assert.equal(cards[2].incomplete, false);
});

test('una regla con o, otra con paréntesis, otra con no y otra con un comentario dentro dan fichas escritas a mano', () => {
  const text = [
    'avanzar',
    'si sensor1 > 0,5 o sensor5 > 0,5 entonces retroceder',
    'si (sensor1 > 0,5) entonces retroceder',
    'si no sensor1 > 0,5 entonces avanzar',
    'si sensor2 > 0,3 entonces # esquiva',
    '    girar derecha',
    'si sensor3 > 0,2 entonces girar izquierda',
  ].join('\n');
  const cards = assertCovers(text);
  assert.deepEqual(cards.map((c) => c.kind), ['order', 'manual', 'manual', 'manual', 'manual', 'rule']);
  // El comentario está dentro de la regla: la ficha escrita a mano lleva sus dos líneas.
  assert.deepEqual(cards[4].lines, [5, 6]);
  assert.equal(cards[4].text, 'si sensor2 > 0,3 entonces # esquiva\n    girar derecha');
  assert.equal(cards[1].text, 'si sensor1 > 0,5 o sensor5 > 0,5 entonces retroceder');
});

test('una línea vacía o un comentario entre la regla y su acción con sangría la vuelven escrita a mano, sin perder líneas', () => {
  const text = 'si sensor1 > 0,5 entonces\n# pensar\n\n    retroceder\navanzar';
  const cards = assertCovers(text);
  assert.deepEqual(cards.map((c) => c.kind), ['manual', 'order']);
  assert.deepEqual(cards[0].lines, [1, 4]);
});

test('constantes dentro y fuera de 0 a 1: lejos = 3 es escrita a mano', () => {
  const cards = assertCovers('cerca = 0,2\nlejos = 3\ntodo = 1\nnada = 0\nsi sensor1 > lejos entonces retroceder');
  assert.deepEqual(cards.map((c) => c.kind), ['constant', 'manual', 'constant', 'constant', 'rule']);
  assert.equal(cards[1].text, 'lejos = 3');
  // La regla que usa una constante fuera de rango sigue siendo ficha, con el valor de la constante.
  assert.equal(cards[4].conditions[0].right.value, 3);
});

test('comparar dos sensores: el lado derecho es otro dato', () => {
  const [card] = projectCards('si sensor2 > sensor4 entonces girar derecha');
  assert.equal(card.kind, 'rule');
  assert.deepEqual([card.conditions[0].right.kind, card.conditions[0].right.index], ['sensor', 4]);
});

test('velocidad y varias comparaciones unidas por y, con varias acciones', () => {
  const [card] = projectCards('if speed < 0.3 and sensor1 <= near then forward and turn left\nnear = 0.2'.split('\n').reverse().join('\n'));
  assert.equal(card.kind, 'constant');
  const rule = projectCards('near = 0.2\nif speed < 0.3 and sensor1 <= near then forward and turn left')[1];
  assert.equal(rule.kind, 'rule');
  assert.deepEqual(rule.conditions.map((c) => [c.left.kind, c.op.op, c.right.kind]), [['speed', '<', 'number'], ['sensor', '<=', 'constant']]);
  assert.deepEqual(rule.actions.map((a) => a.control), ['forward', 'left']);
});

test('un texto con errores se proyecta sin perder líneas: lo que no se puede leer queda escrito a mano', () => {
  const text = 'avanzar\nvolar\n    girar izquierda\nsi sensor3 > entonces\nsi sensor1 > 0,5 entonces\ncerca = 0,2\ncerca = 0,3\n  \n# fin';
  const cards = assertCovers(text);
  assert.deepEqual(cards.map((c) => c.kind), ['order', 'manual', 'manual', 'manual', 'rule', 'constant', 'manual', 'note', 'note']);
  // La regla sin acción es una ficha incompleta.
  assert.equal(cards[4].incomplete, true);
  // Una línea con solo espacios es una nota vacía.
  assert.equal(cards[7].blank, true);
});

test('textos con comentarios, vacíos y sin salto de línea final se proyectan sin perder nada', () => {
  for (const text of ['', '\n', '# solo un comentario', 'avanzar\n', '\n\navanzar\n\n', 'si sensor1 > 0,5 entonces\n    retroceder\n    girar izquierda\n', 'avanzar # sigue']) {
    assertCovers(text);
  }
  assert.deepEqual(kinds('avanzar # sigue'), ['manual']);
});

// --- 2.2 Parches -----------------------------------------------------------------------------------------

const INITIAL_ES = es['rules.program.initial'];
const ruleOf = (text, i = 0) => projectCards(text).filter((c) => c.kind === 'rule')[i];

/** Las líneas que cambiaron entre dos textos con la misma cantidad de líneas. */
function changedLines(a, b) {
  const x = a.split('\n');
  const y = b.split('\n');
  assert.equal(x.length, y.length);
  return x.map((l, i) => (l === y[i] ? null : i + 1)).filter((n) => n !== null);
}

test('setNumber cambia solo el número, con dos decimales y el separador del idioma', () => {
  const text = '# umbral\nsi sensor3 > 0,20 entonces girar izquierda # esquiva\navanzar';
  const rule = projectCards(text)[1];
  assert.equal(rule.kind, 'manual'); // con un comentario dentro
  const plain = '# umbral\nsi sensor3 > 0,20 entonces girar izquierda\navanzar\n';
  const r = ruleOf(plain);
  const es1 = patch(plain, { type: 'setNumber', place: r.conditions[0].right, value: 0.35 }, 'es');
  assert.equal(es1.text, '# umbral\nsi sensor3 > 0,35 entonces girar izquierda\navanzar\n');
  assert.deepEqual(changedLines(plain, es1.text), [2]);
  assert.deepEqual([es1.from, es1.to, es1.insert], [22, 26, '0,35']);
  const en1 = patch(plain, { type: 'setNumber', place: r.conditions[0].right, value: 0.35 }, 'en');
  assert.equal(en1.text.split('\n')[1], 'si sensor3 > 0.35 entonces girar izquierda');
  assert.equal(formatNumber(1.4, 'es'), '1,00');
  assert.equal(formatNumber(-0.001, 'es'), '0,00');
});

test('setOperand, setOperator y setAction cambian su token y el programa no tiene errores', () => {
  const text = '# a\navanzar\nsi sensor3 > 0,20 entonces\n    girar izquierda\n# b';
  let r = ruleOf(text);
  let next = patch(text, { type: 'setOperand', place: r.conditions[0].left, datum: { sensor: 4 } }, 'es').text;
  r = ruleOf(next);
  next = patch(next, { type: 'setAction', place: r.actions[0], control: 'right' }, 'es').text;
  r = ruleOf(next);
  next = patch(next, { type: 'setOperator', place: r.conditions[0].op, op: '<=' }, 'es').text;
  assert.equal(next, '# a\navanzar\nsi sensor4 <= 0,20 entonces\n    girar derecha\n# b');
  assert.equal(parseProgram(next, { sensors: 5 }).ok, true);
  // velocidad en el idioma activo
  r = ruleOf(next);
  assert.equal(patch(next, { type: 'setOperand', place: r.conditions[0].left, datum: 'speed' }, 'en').text.split('\n')[2], 'si speed <= 0,20 entonces');
});

test('setConstant cambia solo el número de la definición: cerca = 0,4', () => {
  const c = projectCards(INITIAL_ES).find((x) => x.kind === 'constant');
  const r = patch(INITIAL_ES, { type: 'setConstant', place: c.number, value: 0.4 }, 'es');
  assert.deepEqual(changedLines(INITIAL_ES, r.text), [2]);
  assert.equal(r.text.split('\n')[1], 'cerca = 0,4');
  // Las fichas que usan la constante leen el valor nuevo.
  assert.equal(ruleOf(r.text).conditions[0].right.value, 0.4);
  assert.equal(patch(INITIAL_ES, { type: 'setConstant', place: c.number, value: 0.25 }, 'en').text.split('\n')[1], 'cerca = 0.25');
});

test('Agregar: addRule al final y addAction dan si sensor1 > 0,50 entonces retroceder', () => {
  for (const text of [INITIAL_ES, `${INITIAL_ES}\n`]) {
    const added = patch(text, { type: 'addRule' }, 'es');
    assert.equal(added.text.trimEnd().split('\n').pop(), 'si sensor1 > 0,50 entonces');
    assert.ok(added.text.startsWith(text), 'lo anterior queda igual');
    assert.equal(added.cursor, added.text.length);
    const parsed = parseProgram(added.text, { sensors: 5 });
    assert.equal(parsed.ok, false);
    assert.equal(parsed.errors[0].code, 'noAction');
    const card = ruleOf(added.text, 1);
    assert.equal(card.incomplete, true);
    const done = patch(added.text, { type: 'addAction', card, control: 'reverse' }, 'es');
    assert.equal(done.text.trimEnd().split('\n').pop(), 'si sensor1 > 0,50 entonces retroceder');
    assert.equal(parseProgram(done.text, { sensors: 5 }).rules, 2);
  }
  assert.equal(defaultRule('en'), 'if sensor1 > 0.50 then');
  assert.equal(patch('', { type: 'addRule' }, 'en').text, 'if sensor1 > 0.50 then');
});

test('addAction respeta la sangría de las acciones de abajo y suma con y en la misma línea', () => {
  const below = 'si sensor1 > 0,5 entonces\n\tgirar izquierda\navanzar';
  const r1 = patch(below, { type: 'addAction', card: ruleOf(below), control: 'reverse' }, 'es');
  assert.equal(r1.text, 'si sensor1 > 0,5 entonces\n\tgirar izquierda\n\tretroceder\navanzar');
  const inline = 'if sensor1 > 0.5 then turn left\nforward';
  const r2 = patch(inline, { type: 'addAction', card: ruleOf(inline), control: 'reverse' }, 'en');
  assert.equal(r2.text, 'if sensor1 > 0.5 then turn left and reverse\nforward');
  assert.equal(parseProgram(r2.text, { sensors: 5 }).ok, true);
});

test('Borrar y volver atrás: deleteRule saca las líneas de la regla y el reemplazo mínimo la devuelve en su lugar', () => {
  const text = es['rules.example.seven'];
  const rule = ruleOf(text, 2);
  const r = patch(text, { type: 'deleteRule', lines: rule.lines }, 'es');
  assert.equal(r.text.split('\n').length, text.split('\n').length - 2);
  assert.equal(parseProgram(r.text, { sensors: 7 }).rules, parseProgram(text, { sensors: 7 }).rules - 1);
  // Deshacer = volver a poner lo que el reemplazo mínimo sacó.
  assert.equal(r.text.slice(0, r.from) + text.slice(r.from, r.to) + r.text.slice(r.from + r.insert.length), text);
  // La última línea, sin salto final.
  const last = projectCards(INITIAL_ES).filter((c) => c.kind === 'rule')[0];
  assert.equal(patch(INITIAL_ES, { type: 'deleteRule', lines: last.lines }, 'es').text, INITIAL_ES.split('\n').slice(0, 3).join('\n'));
});

test('moveRule mueve el bloque entero con sus sangrías y sus notas pegadas', () => {
  const text = '# uno\nsi sensor1 > 0,5 entonces\n    retroceder\n\n# dos\nsi sensor2 > 0,5 entonces\n\tgirar derecha\navanzar\n';
  const units = movableUnits(projectCards(text));
  assert.deepEqual(units.map((u) => u.lines), [[1, 3], [5, 7], [8, 8]]);
  // La última ficha arriba de la primera regla.
  const up = patch(text, { type: 'moveRule', lines: units[2].lines, before: units[0].lines[0] }, 'es');
  assert.equal(up.text, 'avanzar\n# uno\nsi sensor1 > 0,5 entonces\n    retroceder\n\n# dos\nsi sensor2 > 0,5 entonces\n\tgirar derecha\n');
  // La primera al final.
  const down = patch(text, { type: 'moveRule', lines: units[0].lines, before: null }, 'es');
  assert.equal(down.text, '\n# dos\nsi sensor2 > 0,5 entonces\n\tgirar derecha\navanzar\n# uno\nsi sensor1 > 0,5 entonces\n    retroceder\n');
  // Sin salto final, el texto sigue sin él.
  const noFinal = text.trimEnd();
  assert.ok(!patch(noFinal, { type: 'moveRule', lines: [8, 8], before: 1 }, 'es').text.endsWith('\n'));
  // Moverla a su mismo lugar no cambia nada.
  assert.equal(patch(text, { type: 'moveRule', lines: [5, 7], before: 5 }, 'es').text, text);
  for (const t of [up.text, down.text]) assert.equal(parseProgram(t, { sensors: 5 }).ok, true);
});

test('moveRule no cambia el resultado del programa: misma semilla, misma distancia', () => {
  const ex = EXAMPLES.find((e) => e.id === 'twenty');
  const text = es[ex.textKey];
  const units = movableUnits(projectCards(text));
  const last = units[units.length - 1];
  const moved = patch(text, { type: 'moveRule', lines: last.lines, before: units[0].lines[0] }, 'es').text;
  assert.notEqual(moved, text);
  const run = (t) => {
    const g = compareRuns({ seed: DEFAULT_SEED, settings: DEFAULT_SETTINGS, programs: [{ id: 'x', text: t, sensors: { ...ex.sensors } }], limitSeconds: 60 });
    let r = g.next();
    while (!r.done) r = g.next();
    return r.value[0];
  };
  const a = run(text);
  const b = run(moved);
  assert.equal(a.ok, true);
  assert.deepEqual([b.distance, b.passed, b.crashed, b.rules], [a.distance, a.passed, a.crashed, a.rules]);
});

test('ida y vuelta sin ediciones: el texto queda igual, para los cuatro programas y textos con comentarios', () => {
  const texts = [...PROGRAMS.flatMap((p) => [es[p.textKey], en[p.textKey]]),
    '# a\n\nsi sensor1 > 0,5 entonces   # raro\n  retroceder\n\n\n# fin\n', 'cerca=0,2\nsi  sensor3>cerca  entonces girar   izquierda'];
  for (const text of texts) {
    const cards = assertCovers(text);
    // Volver a escribir cada valor que ya estaba, con su misma forma, no cambia nada.
    let same = text;
    for (const c of cards) {
      if (c.kind !== 'rule') continue;
      for (const cond of c.conditions) same = patch(same, { type: 'setOperator', place: cond.op, op: cond.op.op }, 'es').text;
    }
    assert.equal(same, text);
    assert.deepEqual(projectCards(text), cards);
  }
});
