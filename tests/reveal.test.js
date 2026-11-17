// Mostrar un control (misiones-que-muestran-el-control D2), sin navegador: la marca, el foco, el
// anuncio, la cuenta de 4 s y quitar la marca con otra interacción. El dibujo del anillo se mide en el
// navegador.
import test from 'node:test';
import assert from 'node:assert/strict';
import { revealControls, REVEAL_MS, REVEAL_OUT_MS, accessibleName, focusTarget } from '../src/ui/reveal.js';

function fakeNode(doc, { focusable = true, label = 'Control', children = [] } = {}) {
  const attrs = new Map([['aria-label', label]]);
  const node = {
    ownerDocument: doc, isConnected: true, children,
    scrolled: null, focused: 0, textContent: '',
    setAttribute: (k, v) => attrs.set(k, String(v)),
    getAttribute: (k) => (attrs.has(k) ? attrs.get(k) : null),
    removeAttribute: (k) => attrs.delete(k),
    matches: () => focusable,
    querySelector: () => children.find((c) => c.matches()) ?? null,
    contains: (t) => t === node,
    scrollIntoView(o) { node.scrolled = o; },
    focus(o) { node.focused++; node.focusOpts = o; doc.activeElement = node; },
  };
  return node;
}

function fakeDoc() {
  const listeners = new Map();
  const doc = {
    activeElement: null,
    body: { append: (n) => { doc.appended.push(n); n.isConnected = true; } },
    appended: [],
    defaultView: null,
    createElement: () => {
      const a = new Map();
      return { textContent: '', className: '', isConnected: false, ownerDocument: doc,
        setAttribute: (k, v) => a.set(k, v), getAttribute: (k) => a.get(k) ?? null };
    },
    addEventListener: (type, fn) => listeners.set(type, [...(listeners.get(type) ?? []), fn]),
    removeEventListener: (type, fn) => listeners.set(type, (listeners.get(type) ?? []).filter((f) => f !== fn)),
    dispatch: (type, target) => { for (const fn of [...(listeners.get(type) ?? [])]) fn({ type, target }); },
    count: (type) => (listeners.get(type) ?? []).length,
  };
  return doc;
}

function fakeTimers() {
  let now = 0, id = 0;
  const q = new Map();
  return {
    setTimeout: (fn, ms) => { q.set(++id, { at: now + ms, fn }); return id; },
    clearTimeout: (i) => q.delete(i),
    advance(ms) {
      const end = now + ms;
      for (;;) {
        const next = [...q.entries()].filter(([, t]) => t.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        q.delete(next[0]); now = next[1].at; next[1].fn();
      }
      now = end;
    },
  };
}

const i18n = { t: (key, p) => (key === 'mission.revealed' ? `Se muestra: ${p.control}` : key) };

test('marca todos los nodos, trae el primero a la vista, le pasa el foco y anuncia su nombre', () => {
  const doc = fakeDoc(), timers = fakeTimers();
  const a = fakeNode(doc, { label: 'Cantidad' }), b = fakeNode(doc, { label: 'Ruido' });
  const h = revealControls([a, b], { i18n, doc, timers, reducedMotion: false });
  assert.equal(a.getAttribute('data-revealed'), 'true');
  assert.equal(b.getAttribute('data-revealed'), 'true');
  assert.deepEqual(a.scrolled, { block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  assert.equal(b.scrolled, null);
  assert.equal(doc.activeElement, a);
  assert.equal(a.focusOpts.preventScroll, true);
  assert.equal(h.label, 'Cantidad');
  assert.equal(doc.appended[0].getAttribute('aria-live'), 'polite');
  assert.equal(doc.appended[0].textContent, 'Se muestra: Cantidad');
  h.clear();
});

test('se va solo a los 4 s: pasa por "false" durante la salida y después se quita; el foco queda', () => {
  const doc = fakeDoc(), timers = fakeTimers();
  const a = fakeNode(doc);
  revealControls([a], { i18n, doc, timers, reducedMotion: false });
  timers.advance(REVEAL_MS - 1);
  assert.equal(a.getAttribute('data-revealed'), 'true');
  timers.advance(1);
  assert.equal(a.getAttribute('data-revealed'), 'false');
  timers.advance(REVEAL_OUT_MS);
  assert.equal(a.getAttribute('data-revealed'), null);
  assert.equal(doc.activeElement, a);
  assert.equal(doc.count('pointerdown'), 0);
  assert.equal(doc.count('keydown'), 0);
});

test('otra interacción saca la marca antes; las del propio botón no', () => {
  const doc = fakeDoc(), timers = fakeTimers();
  const a = fakeNode(doc), trigger = fakeNode(doc), other = fakeNode(doc);
  revealControls([a], { i18n, doc, timers, reducedMotion: true, trigger });
  doc.dispatch('keydown', trigger);
  assert.equal(a.getAttribute('data-revealed'), 'true');
  doc.dispatch('pointerdown', other);
  // Con menos movimiento, sin transición: se quita en el acto.
  assert.equal(a.getAttribute('data-revealed'), null);
  timers.advance(REVEAL_MS * 2);
  assert.equal(a.getAttribute('data-revealed'), null);
});

test('con menos movimiento, el desplazamiento no se anima', () => {
  const doc = fakeDoc(), timers = fakeTimers();
  const a = fakeNode(doc);
  revealControls([a], { i18n, doc, timers, reducedMotion: true }).clear();
  assert.equal(a.scrolled.behavior, 'auto');
});

test('un segundo "Mostrame" saca la marca del anterior', () => {
  const doc = fakeDoc(), timers = fakeTimers();
  const a = fakeNode(doc), b = fakeNode(doc);
  revealControls([a], { i18n, doc, timers, reducedMotion: true });
  revealControls([b], { i18n, doc, timers, reducedMotion: true });
  assert.equal(a.getAttribute('data-revealed'), null);
  assert.equal(b.getAttribute('data-revealed'), 'true');
  assert.equal(doc.count('keydown'), 1);
  timers.advance(REVEAL_MS);
  assert.equal(b.getAttribute('data-revealed'), null);
});

test('sin nodos no hace nada; si el nodo no es enfocable, el foco va al primer control de adentro', () => {
  assert.equal(revealControls([], {}), null);
  const doc = fakeDoc();
  const inner = fakeNode(doc);
  const group = fakeNode(doc, { focusable: false, children: [inner] });
  assert.equal(focusTarget(group), inner);
  assert.equal(accessibleName(group), 'Control');
  const timers = fakeTimers();
  revealControls([group], { i18n, doc, timers, reducedMotion: true }).clear();
  assert.equal(doc.activeElement, inner);
});
