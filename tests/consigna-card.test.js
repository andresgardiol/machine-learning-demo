// Tarjeta de consigna (tarjeta-de-consigna D1): armado, guía y misión en curso, sin navegador.
import test from 'node:test';
import assert from 'node:assert/strict';
import es from '../src/i18n/es.js';
import en from '../src/i18n/en.js';
import { createI18n } from '../src/ui/i18n.js';
import { createConsignaCard, missionState, writeMissionRow } from '../src/tabs/shared/consigna-card.js';

/** Un documento mínimo, para armar la tarjeta con el() sin navegador. */
function withFakeDocument(fn) {
  const make = (tag) => {
    const attrs = new Map();
    const node = {
      tagName: tag.toUpperCase(), dataset: {}, className: '', children: [], hidden: false, style: {}, textContent: '',
      setAttribute: (k, v) => attrs.set(k, String(v)), getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null),
      removeAttribute: (k) => attrs.delete(k),
      addEventListener() {}, append(...c) { node.children.push(...c); },
    };
    return node;
  };
  const before = globalThis.document;
  globalThis.document = { createElement: make };
  try { return fn(); } finally { if (before === undefined) delete globalThis.document; else globalThis.document = before; }
}

const i18n = createI18n({ dictionaries: { es, en }, language: 'es' });

test('región nombrada por un título oculto, con consigna, marcha y misión en ese orden', () => {
  withFakeDocument(() => {
    const run = document.createElement('section');
    const card = createConsignaCard({ i18n, run });
    const [title, text, runNode, mission] = card.node.children;
    assert.equal(card.node.tagName, 'SECTION');
    assert.equal(card.node.className, 'consigna-card');
    assert.equal(card.node.getAttribute('aria-labelledby'), title.getAttribute('id'));
    assert.equal(title.className, 'sr-only');
    assert.equal(title.getAttribute('data-i18n'), 'consigna.title');
    assert.equal(text.className, 'guide consigna-text');
    assert.equal(runNode, run);
    assert.equal(mission.className, 'guide consigna-mission');
    // La marcha no lleva `guide`: con la guía apagada queda en su lugar.
    assert.ok(!/\bguide\b/.test(runNode.className));
  });
});

test('sin marcha (Inspeccionar y Laboratorio): consigna y misión', () => {
  withFakeDocument(() => {
    const card = createConsignaCard({ i18n });
    assert.deepEqual(card.node.children.map((c) => c.className), ['sr-only', 'guide consigna-text', 'guide consigna-mission']);
    // Con la guía apagada no queda una caja vacía: la tarjeta entera es de la guía.
    assert.equal(card.node.className, 'guide consigna-card');
  });
});

test('dos tarjetas no comparten el id del título', () => {
  withFakeDocument(() => {
    const a = createConsignaCard({ i18n }).node.getAttribute('aria-labelledby');
    const b = createConsignaCard({ i18n }).node.getAttribute('aria-labelledby');
    assert.notEqual(a, b);
  });
});

test('setConsigna escribe el texto en el idioma activo', () => {
  withFakeDocument(() => {
    const card = createConsignaCard({ i18n });
    card.setConsigna('consigna.drive');
    assert.equal(card.node.children[1].textContent, es['consigna.drive']);
  });
});

test('setMission: sin misión se oculta; con una, nombre, estado y barra; con todas, lo dice', () => {
  withFakeDocument(() => {
    const card = createConsignaCard({ i18n });
    const mission = card.node.children[2];
    assert.equal(mission.hidden, true, 'arranca oculta');
    card.setMission({ nameKey: 'drive.mission.pass', nameParams: { goal: 5 }, statusKey: 'drive.mission.progress.vehicles', statusParams: { value: 3, goal: 5 }, fraction: 0.6 });
    const [name, status, bar] = mission.children;
    assert.equal(mission.hidden, false);
    assert.equal(name.textContent, 'Superá 5 vehículos sin chocar');
    assert.equal(status.textContent, '3 de 5');
    assert.equal(bar.children[0].style.width, '60%');
    card.setMission({ allDone: true });
    assert.equal(name.textContent, es['consigna.missions.allDone']);
    assert.equal(status.textContent, '');
    assert.equal(bar.hidden, true);
    card.setMission(null);
    assert.equal(mission.hidden, true);
  });
});

test('missionState: barra solo con una fracción, acotada entre 0 y 100 %', () => {
  assert.deepEqual(missionState(null), { hidden: true, allDone: false, width: null });
  assert.deepEqual(missionState({ allDone: true }), { hidden: false, allDone: true, width: null });
  assert.equal(missionState({ fraction: 0.25 }).width, '25%');
  assert.equal(missionState({ fraction: 1.7 }).width, '100%');
  assert.equal(missionState({ fraction: null }).width, null);
});

test('writeMissionRow: la fila y la tarjeta salen de la misma vista, y marca la misión en curso', () => {
  withFakeDocument(() => {
    const setText = (node, key, params) => { node.textContent = i18n.t(key, params); };
    const r = { row: document.createElement('li'), status: document.createElement('span'), fill: document.createElement('span') };
    writeMissionRow(r, { done: false, statusKey: 'drive.mission.progress.vehicles', statusParams: { value: 3, goal: 5 }, fraction: 0.6 }, true, setText);
    assert.equal(r.status.textContent, '3 de 5');
    assert.equal(r.row.dataset.current, 'true');
    assert.equal(r.row.dataset.done, 'false');
    assert.equal(r.fill.style.width, '60%');
  });
});
