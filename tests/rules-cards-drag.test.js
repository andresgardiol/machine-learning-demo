// El error de las constantes (reglas-como-fichas D7, tarea 6.1): arrastrar un deslizador pasando por valores de
// distinto largo no puede pegar dos líneas. Simula lo que hace la vista: mientras se arrastra, cada paso es una
// vista previa que parte del texto del editor (el de antes del arrastre) y las fichas se vuelven a proyectar
// desde el texto de la vista previa; al soltar, se escribe un solo paso desde el texto del editor.
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { projectCards, patch } from '../src/tabs/rules/cards.js';
import { parseProgram } from '../src/core/rules.js';

/** Generador con semilla (mulberry32), para que la secuencia al azar sea siempre la misma. */
function random(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Los deslizadores que tiene la vista: uno por constante y uno por umbral numérico. */
function sliders(cards) {
  const out = [];
  cards.forEach((c, i) => {
    if (c.kind === 'constant') out.push({ card: i, kind: 'constant' });
    if (c.kind === 'rule') c.conditions.forEach((cond, ci) => { if (cond.right.kind === 'number') out.push({ card: i, cond: ci, kind: 'number' }); });
  });
  return out;
}
/** La edición de un deslizador, con su lugar leído de las fichas a la vista (como `placeOf`). */
function editOf(cards, s, value) {
  const card = cards[s.card];
  return s.kind === 'constant'
    ? { type: 'setConstant', place: card.number, value }
    : { type: 'setNumber', place: card.conditions[s.cond].right, value };
}
/** Un arrastre: varias vistas previas desde el texto del editor y un paso al soltar. Devuelve los textos. */
function drag(editorText, s, values, language) {
  let shown = projectCards(editorText); // lo que la vista tiene dibujado al empezar
  const seen = [];
  for (const v of values) {
    const preview = patch(editorText, editOf(shown, s, v), language).text;
    seen.push(preview);
    shown = projectCards(preview); // la vista vuelve a proyectar desde la vista previa
  }
  const final = patch(editorText, editOf(shown, s, values[values.length - 1]), language).text;
  seen.push(final);
  return { final, seen };
}
/** Las líneas sin sus números: no cambian con ningún arrastre. */
const shape = (text) => text.split('\n').map((l) => l.replace(/-?\d+(?:[.,]\d+)?/g, '#'));

test('el caso del dueño: arrastrar cerca por 0,2, 0,24, 0,3 y 0,05 no pega cerca con costado', () => {
  const text = es['rules.example.seven'];
  const s = sliders(projectCards(text)).find((x) => x.kind === 'constant');
  const { final, seen } = drag(text, s, [0.2, 0.24, 0.3, 0.05, 0.24, 0.2], 'es');
  for (const t of seen) {
    assert.ok(!/cerca = [\d,]+costado/.test(t), t.split('\n').slice(2, 4).join(' | '));
    assert.deepEqual(shape(t), shape(text));
    assert.equal(parseProgram(t, { sensors: 7 }).ok, true);
  }
  assert.equal(final.split('\n')[2], 'cerca = 0,2');
});

test('cientos de arrastres al azar (semilla 7), de constantes y umbrales con valores de distinto largo, dejan el texto válido y con las mismas líneas', () => {
  const rnd = random(7);
  const texts = [
    [es['rules.example.seven'], 7, 'es'], [en['rules.example.twenty'], 20, 'en'],
    ['# a\ncerca = 0,2\nlejos = 0,85\navanzar\nsi sensor3 > 0,20 y sensor1 < 0,5 entonces\n    girar izquierda\nsi velocidad < 1 entonces avanzar # fin\n', 5, 'es'],
  ];
  let drags = 0;
  for (const [start, sensors, language] of texts) {
    let text = start;
    for (let k = 0; k < 120; k += 1) {
      const all = sliders(projectCards(text));
      const s = all[Math.floor(rnd() * all.length)];
      // Valores de 1, 3 y 4 caracteres: 0, 1, 0,3, 0,25, 0,05…
      const values = Array.from({ length: 2 + Math.floor(rnd() * 6) }, () => [0, 1, 0.3, 0.25, 0.05, 0.5, 0.99, rnd()][Math.floor(rnd() * 8)]);
      const { final, seen } = drag(text, s, values, language);
      for (const t of seen) {
        assert.deepEqual(shape(t), shape(start), `arrastre ${drags}`);
        assert.equal(parseProgram(t, { sensors }).ok, true, `arrastre ${drags}`);
      }
      text = final;
      drags += 1;
    }
  }
  assert.equal(drags, 360);
});

test('un parche nunca lanza: con un lugar que no corresponde al texto no escribe nada', () => {
  const text = es['rules.program.initial'];
  const bad = [
    { type: 'setConstant', place: { line: 99, start: 0, end: 3 }, value: 0.4 },
    { type: 'setNumber', place: { line: 3, start: 0, end: 7 }, value: 0.4 }, // `avanzar` no es un número
    { type: 'setOperand', place: null, datum: { sensor: 2 } },
    { type: 'setAction', place: { line: 2, start: 0, end: 5 }, control: 'left' }, // `cerca` no es una acción
    { type: 'deleteRule', lines: [40, 41] },
    { type: 'moveRule', lines: [8, 9], before: 1 },
    { type: 'nada' },
    null,
  ];
  for (const edit of bad) {
    let r;
    assert.doesNotThrow(() => { r = patch(text, edit, 'es'); }, JSON.stringify(edit));
    assert.equal(r.text, text, JSON.stringify(edit));
  }
});
