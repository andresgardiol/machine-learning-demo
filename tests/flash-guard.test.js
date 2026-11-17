import test from 'node:test';
import assert from 'node:assert/strict';
import { createFlashGuard, FLASH_GUARD, FILL } from '../src/render/flash-guard.js';

/** Pasa una secuencia [[ms, nivel], …] por la guarda y devuelve lo que muestra en cada paso. */
function run(guard, key, seq) {
  return seq.map(([t, v]) => guard.show(key, v, t));
}

/**
 * Cuántos cambios grandes hay en lo mostrado, en el peor segundo (la misma cuenta que la medida): el
 * recorrido del brillo desde el último cambio contado, más lo que pesa el rayado si aparece o se va.
 */
function worstPerSecond(out, times, swing = 0.5, B = (x) => x) {
  const flips = [];
  let lo = B(out[0].level);
  let hi = lo;
  let refFlicker = out[0].flicker;
  out.forEach((o, k) => {
    const b = B(o.level);
    lo = Math.min(lo, b);
    hi = Math.max(hi, b);
    if (hi - lo + (o.flicker !== refFlicker ? FLASH_GUARD.mark : 0) >= swing) { flips.push(times[k]); lo = b; hi = b; refFlicker = o.flicker; }
  });
  let worst = 0;
  // Con un cuadro de margen: lo que pasa a 1 s y un poco cuenta en el mismo segundo.
  for (let i = 0, j = 0; i < flips.length; i++) { while (flips[i] - flips[j] > 1050) j++; worst = Math.max(worst, i - j + 1); }
  return worst;
}

/** Escalón que cambia cada cuadro (60 por segundo) durante `ms`. */
const everyFrame = (ms, from = 0) => Array.from({ length: Math.round(ms / (1000 / 60)) }, (_, k) => [from + k * (1000 / 60), k % 2]);

test('valores de partida de D2', () => {
  assert.deepEqual({ ...FLASH_GUARD }, { maxFlips: 3, windowMs: 1000, swing: 0.5, averageMs: 500, calmMs: 1000, mark: 0.15, slackMs: 100 });
});

test('tres cambios en un segundo se ven exactos', () => {
  const g = createFlashGuard();
  const out = run(g, 'n:1:0', [[0, 0], [100, 1], [200, 0], [300, 1]]);
  assert.deepEqual(out.map((o) => o.level), [0, 1, 0, 1]);
  assert.ok(out.every((o) => !o.flicker));
});

test('el cuarto da flicker y el promedio (pesado por tiempo), sin un cuarto cambio grande', () => {
  const g = createFlashGuard();
  const out = run(g, 'n:1:0', [[0, 0], [100, 1], [200, 0], [300, 1], [400, 0]]);
  const fourth = out[4];
  assert.equal(fourth.flicker, true);
  // De 0 a 400 ms: 0, 1, 0, 1 cien ms cada uno.
  assert.equal(fourth.average, 0.5);
  // Lo último contado fue 1 sin rayado: el promedio (0,5) más el rayado (0,15) sería un cambio grande; se
  // muestra lo más cerca que no lo es: a 0,34 de 1.
  assert.ok(Math.abs(fourth.level - 0.66) < 1e-9, `muestra ${fourth.level}`);
});

test('titubeando, se ve el promedio de los últimos 500 ms', () => {
  const g = createFlashGuard();
  const out = run(g, 'k', everyFrame(1500));
  const last = out[out.length - 1];
  assert.equal(last.flicker, true);
  assert.ok(Math.abs(last.average - 0.5) < 0.05, `promedio ${last.average}`);
  assert.ok(Math.abs(last.level - last.average) < 1e-9);
});

test('un escalón que cambia cada cuadro un minuto nunca pasa de tres cambios grandes en un segundo', () => {
  const g = createFlashGuard();
  const seq = everyFrame(60000);
  const out = run(g, 'k', seq);
  assert.ok(worstPerSecond(out, seq.map(([t]) => t)) <= 3);
  // Y casi todo el tiempo se ve rayado.
  assert.ok(out.filter((o) => o.flicker).length > seq.length * 0.95);
});

test('ráfagas irregulares (cambia y se queda, a ritmos distintos) tampoco pasan de tres', () => {
  const g = createFlashGuard();
  const seq = [];
  let t = 0;
  let v = 0;
  // Determinista: periodos que van y vuelven entre 1 cuadro y medio segundo.
  for (let k = 0; k < 3000; k++) {
    const gap = [16, 16, 33, 50, 120, 300, 16, 16, 500, 80][k % 10];
    t += gap;
    if (k % 3 !== 2) v = 1 - v;
    seq.push([t, v]);
  }
  const out = run(g, 'k', seq);
  assert.ok(worstPerSecond(out, seq.map(([x]) => x)) <= 3);
});

test('sale de flicker tras 1 s sin cambios grandes y vuelve a lo exacto', () => {
  const g = createFlashGuard();
  const seq = everyFrame(1000);
  run(g, 'k', seq);
  assert.equal(g.flickering('k'), true);
  const lastT = seq[seq.length - 1][0];
  // Quieto en 1 desde ahí.
  let o;
  for (let t = lastT + 16; t < lastT + 990; t += 16) o = g.show('k', 1, t);
  assert.equal(o.flicker, true, 'antes del segundo, sigue');
  for (let t = lastT + 1000; t < lastT + 1100; t += 16) o = g.show('k', 1, t);
  assert.equal(o.flicker, false);
  assert.equal(o.level, 1);
});

test('reset vuelve a lo exacto', () => {
  const g = createFlashGuard();
  run(g, 'k', everyFrame(1000));
  assert.equal(g.flickering('k'), true);
  g.reset();
  assert.equal(g.size(), 0);
  const o = g.show('k', 0, 2000);
  assert.deepEqual(o, { level: 0, flicker: false, average: 0 });
  assert.equal(g.show('k', 1, 2016).level, 1);
});

test('un cambio chico nunca cuenta', () => {
  const g = createFlashGuard();
  // Va y viene entre 0,3 y 0,7 cada cuadro: 0,4 de distancia, nunca un cambio grande.
  const seq = Array.from({ length: 600 }, (_, k) => [k * 16, k % 2 ? 0.7 : 0.3]);
  const out = run(g, 'k', seq);
  assert.ok(out.every((o, k) => !o.flicker && o.level === seq[k][1]));
});

test('el promedio es pesado por tiempo, no por cantidad de muestras', () => {
  const g = createFlashGuard({ maxFlips: 0 }); // todo cambio grande titubea: se ve el promedio
  g.show('k', 0, 0);
  g.show('k', 0, 400); // 0 de 0 a 450
  for (let t = 450; t <= 500; t += 5) g.show('k', 1, t); // 1 de 450 a 500, en muchas muestras
  const o = g.show('k', 1, 500);
  assert.equal(o.flicker, true);
  // De 0 a 500 ms: 450 en 0 y 50 en 1 → 0,1 (por muestras daría más de la mitad).
  assert.ok(Math.abs(o.average - 0.1) < 1e-9, `promedio ${o.average}`);
});

test('misma secuencia, mismo resultado', () => {
  const seq = everyFrame(3000).map(([t, v], k) => [t, k % 7 === 0 ? 1 - v : v]);
  const a = run(createFlashGuard(), 'k', seq);
  const b = run(createFlashGuard(), 'k', seq);
  assert.deepEqual(a, b);
});

test('cada clave lleva su cuenta', () => {
  const g = createFlashGuard();
  run(g, 'n:1:0', everyFrame(1000));
  const o = g.show('a:forward', 1, 1000);
  assert.equal(o.flicker, false);
  assert.equal(g.flickering('n:1:0'), true);
});

test('lados del último segundo (D5): el menor, el mayor y la parte en el mayor', () => {
  const g = createFlashGuard();
  // 600 ms en 0 y después 400 ms en 1 (pasos de 100 ms).
  for (let t = 0; t <= 2000; t += 100) g.show('k', t >= 1600 ? 1 : 0, t);
  const s = g.sides('k', 2000);
  assert.equal(s.low, 0);
  assert.equal(s.high, 1);
  assert.ok(Math.abs(s.highShare - 0.4) < 1e-9, `parte ${s.highShare}`);
  assert.equal(g.sides('otra', 2000), null);
});

test('lados con el valor quieto: un solo valor, todo del mismo lado', () => {
  const g = createFlashGuard();
  for (let t = 0; t <= 1500; t += 100) g.show('k', 0.3, t);
  assert.deepEqual(g.sides('k', 1500), { low: 0.3, high: 0.3, highShare: 1 });
});

test('lados: lo de hace más de un segundo no cuenta', () => {
  const g = createFlashGuard();
  g.show('k', 1, 0);
  for (let t = 100; t <= 2000; t += 100) g.show('k', 0, t);
  assert.deepEqual(g.sides('k', 2000), { low: 0, high: 0, highShare: 1 });
});

test('relleno de neurona: los cambios se miden en brillo (de 0 a 0,42 ya es medio rango)', () => {
  assert.equal(FILL.brightness(0), 0);
  assert.ok(Math.abs(FILL.brightness(0.42) - 0.507) < 1e-9);
  assert.equal(FILL.brightness(1), 1);
  for (const b of [0, 0.1, 0.15, 0.4, 1]) assert.ok(Math.abs(FILL.brightness(FILL.levelOf(b)) - Math.max(b, b > 0 ? 0.15 : 0)) < 1e-5);
  // Un sensor que salta entre 0 y 0,42 cada cuadro: sin la cuenta en brillo, nunca titubearía.
  const g = createFlashGuard({ fill: FILL });
  const seq = Array.from({ length: 600 }, (_, k) => [k * (1000 / 60), k % 2 ? 0.42 : 0]);
  const out = seq.map(([t, v]) => g.show('n:0:1', v, t));
  assert.ok(out.some((o) => o.flicker));
  // En brillo, con el rayado, nunca más de tres cambios grandes en un segundo.
  assert.ok(worstPerSecond(out, seq.map(([t]) => t), 0.5, FILL.brightness) <= 3);
});

test('una oscilación que no se aleja 0,5 de ningún nivel fijo pero sí de un cuadro al otro también titubea', () => {
  // De 0,34 a 0,88 y de vuelta cada cuadro: contra 0,6 nunca hay 0,5, pero el recorrido es 0,54.
  const g = createFlashGuard();
  const seq = Array.from({ length: 300 }, (_, k) => [k * (1000 / 60), k === 0 ? 0.6 : k % 2 ? 0.34 : 0.88]);
  const out = run(g, 'k', seq);
  assert.ok(out.some((o) => o.flicker));
  assert.ok(worstPerSecond(out, seq.map(([t]) => t)) <= 3);
});
