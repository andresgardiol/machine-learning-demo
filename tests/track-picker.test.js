// Selector de pista sobre el escenario (panel-de-entrenar-por-vistas D5 y D10): la lógica sin DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createI18n } from '../src/ui/i18n.js';
import { TRACK_IDS } from '../src/core/circuits.js';
import {
  nextSelection, buttonText, buttonName, itemRole, thumbnail, THUMB_SIZE,
} from '../src/render/track-picker.js';

const t = (lang) => createI18n({ dictionaries: { es, en }, language: lang }).t;

test('modo simple: elegir una pista deja solo esa', () => {
  assert.deepEqual(nextSelection('single', ['straight'], 'oval'), ['oval']);
  assert.deepEqual(nextSelection('single', ['oval'], 'oval'), ['oval']);
  assert.deepEqual(nextSelection('single', ['oval'], 'monza'), ['oval']);
  assert.equal(itemRole('single'), 'menuitemradio');
});

test('modo múltiple: marcar y desmarcar en el orden del catálogo', () => {
  assert.deepEqual(nextSelection('multi', ['straight'], 'oval'), ['straight', 'oval']);
  assert.deepEqual(nextSelection('multi', ['grandPrix'], 'straight'), ['straight', 'grandPrix']);
  assert.deepEqual(nextSelection('multi', ['straight', 'oval', 'kidney'], 'oval'), ['straight', 'kidney']);
  assert.equal(itemRole('multi'), 'menuitemcheckbox');
});

test('modo múltiple: la última pista marcada no se puede desmarcar', () => {
  assert.deepEqual(nextSelection('multi', ['straight'], 'straight'), ['straight']);
  assert.deepEqual(nextSelection('multi', ['kidney'], 'kidney'), ['kidney']);
});

test('texto del botón cerrado: la pista a la vista y, con varias marcadas, cuántas se alternan', () => {
  assert.equal(buttonText({ mode: 'single', selected: ['straight'], current: 'straight', t: t('es') }), 'Calle recta');
  assert.equal(buttonText({ mode: 'multi', selected: ['straight'], current: 'straight', t: t('es') }), 'Calle recta');
  assert.equal(buttonText({ mode: 'multi', selected: ['straight', 'oval', 'grandPrix'], current: 'oval', t: t('es') }),
    'Óvalo · se alternan 3');
  assert.equal(buttonText({ mode: 'multi', selected: ['straight', 'oval'], current: 'oval', t: t('en') }), 'Oval · 2 alternate');
});

test('nombre accesible del botón: dice que es la pista y, con un cambio esperando, lo avisa', () => {
  assert.equal(buttonName({ mode: 'single', selected: ['oval'], current: 'oval', t: t('es') }), 'Pista: Óvalo');
  assert.equal(buttonName({ mode: 'multi', selected: ['straight', 'oval'], current: 'straight', pending: true, t: t('es') }),
    'Pista: Calle recta · se alternan 2, cambio de pistas esperando a la próxima generación');
  assert.equal(buttonName({ mode: 'single', selected: ['straight'], current: 'straight', t: t('en') }), 'Track: Straight street');
});

test('miniaturas: una por pista, dentro del recuadro de 40×28; la calle recta es un segmento vertical', () => {
  for (const id of TRACK_IDS) {
    const { points, closed } = thumbnail(id);
    assert.equal(closed, id !== 'straight', id);
    for (const p of points) {
      assert.ok(p.x >= 0 && p.x <= THUMB_SIZE.width && p.y >= 0 && p.y <= THUMB_SIZE.height, `${id}: ${p.x},${p.y}`);
    }
    if (closed) assert.deepEqual(points[0], points[points.length - 1]);
  }
  const straight = thumbnail('straight').points;
  assert.equal(straight.length, 2);
  assert.equal(straight[0].x, straight[1].x);
  // Hacia arriba, como en el escenario: el segundo punto queda más arriba que el primero.
  assert.ok(straight[1].y < straight[0].y);
});

test('miniaturas: los circuitos salen con la recta de salida vertical y hacia arriba, como en el escenario', () => {
  for (const id of ['oval', 'kidney', 'grandPrix']) {
    const [a, b] = thumbnail(id).points;
    assert.ok(Math.abs(a.x - b.x) < 0.2, `${id}: la salida no es vertical (${a.x} → ${b.x})`);
    assert.ok(b.y < a.y, `${id}: la salida no va hacia arriba`);
  }
  assert.strictEqual(thumbnail('oval'), thumbnail('oval')); // se calcula una sola vez
});
