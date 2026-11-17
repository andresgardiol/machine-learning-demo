import test from 'node:test';
import assert from 'node:assert/strict';
import { createMatchWindow, createCompareAnnouncer, sameControls, MATCH_FRAMES, COMPARE_ANNOUNCE_MS } from '../src/tabs/shared/driving-cards.js';

const F = { forward: true, reverse: false, left: false, right: false };

test('la cola guarda los últimos 600 cuadros (10 s a 60 por segundo)', () => {
  assert.equal(MATCH_FRAMES, 600);
  const w = createMatchWindow();
  assert.equal(w.percent(), null);
  for (let i = 0; i < 1000; i++) w.push(true);
  assert.equal(w.count, 600);
  assert.equal(w.percent(), 100);
});

test('450 de 600 cuadros coincidieron: 75 %', () => {
  const w = createMatchWindow();
  for (let i = 0; i < 600; i++) w.push(i % 4 !== 0);
  assert.equal(w.matches, 450);
  assert.equal(w.percent(), 75);
});

test('lo de hace más de 600 cuadros no cuenta', () => {
  const w = createMatchWindow();
  for (let i = 0; i < 600; i++) w.push(false);
  for (let i = 0; i < 450; i++) w.push(true);
  assert.equal(w.percent(), 75); // 450 que coinciden y los 150 últimos que no
  for (let i = 0; i < 150; i++) w.push(true);
  assert.equal(w.percent(), 100);
});

test('porcentaje redondeado; con menos de 600 cuadros, sobre los que hay; reset vuelve a vacío', () => {
  const w = createMatchWindow();
  w.push(true); w.push(true); w.push(false);
  assert.equal(w.percent(), 67);
  w.reset();
  assert.equal(w.count, 0);
  assert.equal(w.percent(), null);
  const small = createMatchWindow(3);
  for (const m of [true, true, true, false]) small.push(m);
  assert.equal(small.percent(), 67);
});

test('coinciden: las cuatro acciones iguales', () => {
  assert.equal(sameControls(F, { ...F }), true);
  assert.equal(sameControls(F, { ...F, right: true }), false);
  assert.equal(sameControls({ forward: true }, F), true);
});

test('anuncios: por cambio, como mucho cada 2 s', () => {
  assert.equal(COMPARE_ANNOUNCE_MS, 2000);
  const a = createCompareAnnouncer();
  assert.equal(a.offer('A', 0), true);
  assert.equal(a.offer('A', 5000), false, 'sin cambio, no');
  assert.equal(a.offer('B', 5100), true);
  assert.equal(a.offer('C', 5200), false, 'antes de 2 s, no');
  assert.equal(a.offer('C', 7099), false);
  assert.equal(a.offer('C', 7100), true, 'a los 2 s, el cambio pendiente');
  assert.equal(a.offer('B', 7200), false);
  assert.equal(a.offer('C', 9500), false, 'volvió a lo último anunciado: no');
  // En un cuadro por cada 1/60 s durante 10 s, cambiando cada cuadro: como mucho 5 anuncios.
  const b = createCompareAnnouncer();
  let n = 0;
  for (let f = 0; f < 600; f++) if (b.offer(String(f % 2), (f * 1000) / 60)) n += 1;
  assert.ok(n <= 5, `${n} anuncios`);
  b.reset();
  assert.equal(b.offer('1', 0), true);
});
