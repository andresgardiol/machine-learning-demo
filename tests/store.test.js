import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore } from '../src/ui/store.js';

test('el almacén notifica solo cuando algo cambia y permite desuscribirse', () => {
  const store = createStore({ guide: true, n: 0 });
  const seen = [];
  const off = store.subscribe((s, prev) => seen.push([prev.n, s.n, s.guide]));
  store.set({ n: 1 });
  store.set({ n: 1 }); // sin cambio
  store.set({ guide: false });
  off();
  store.set({ n: 5 });
  assert.deepEqual(seen, [[0, 1, true], [1, 1, false]]);
  assert.deepEqual(store.get(), { guide: false, n: 5 });
});
