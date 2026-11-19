// Destellos en la V2 (interfaz-v2, tarea 14.2): la prueba de la V1 (tests/flash-guard.test.js) aplicada a lo que
// la V2 dibuja de corrido. La V2 no tiene una guarda propia: usa la de la V1 (src/render/flash-guard.js) por el
// inspector de la red (render/network-inspector.js, con `live`) y por las teclas de la decisión (la copia
// src/v2/legacy/driving-cards.js). Esta prueba comprueba que esos caminos siguen pasando por la guarda y que la
// guarda, en el peor caso, no pasa de tres cambios grandes por segundo.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createFlashGuard, FLASH_GUARD } from '../../src/render/flash-guard.js';

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), 'utf8');

test('v2/destellos: las teclas de la decisión de la V2 pasan por la guarda de la V1', () => {
  const src = read('src/v2/legacy/driving-cards.js');
  assert.match(src, /import \{ createFlashGuard \} from '\.\.\/\.\.\/render\/flash-guard\.js'/);
  assert.match(src, /createFlashGuard\(/);
});

test('v2/destellos: Entender y Aprender por evolución dibujan la red de corrido con la guarda (live)', () => {
  const entender = read('src/v2/stages/entender/index.js');
  assert.match(entender, /inspector\.render\(\{[^}]*live/);
  assert.match(entender, /decision\.update\(theirs, \{ live: liveKeys/);
  const evolucion = read('src/v2/stages/evolucion/index.js');
  assert.match(evolucion, /networkView\.render\([^)]*\{ live: !state\.paused \}/);
  // El inspector de la red usa la misma guarda de la V1.
  assert.match(read('src/render/network-inspector.js'), /flash-guard\.js/);
});

test('v2/destellos: un escalón que cambia cada cuadro un minuto no pasa de tres cambios grandes por segundo', () => {
  const g = createFlashGuard();
  const flips = [];
  let lo = null;
  let hi = null;
  let ref = false;
  for (let k = 0; k < 3600; k++) {
    const t = k * (1000 / 60);
    const o = g.show('k', k % 2, t);
    if (lo === null) { lo = o.level; hi = o.level; ref = o.flicker; }
    lo = Math.min(lo, o.level);
    hi = Math.max(hi, o.level);
    if (hi - lo + (o.flicker !== ref ? FLASH_GUARD.mark : 0) >= 0.5) { flips.push(t); lo = o.level; hi = o.level; ref = o.flicker; }
  }
  let worst = 0;
  for (let i = 0, j = 0; i < flips.length; i++) { while (flips[i] - flips[j] > 1050) j++; worst = Math.max(worst, i - j + 1); }
  assert.ok(worst <= 3, `peor segundo: ${worst} cambios grandes`);
});
