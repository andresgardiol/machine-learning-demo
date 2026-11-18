// Corte de generación (entrenar-la-generacion-ensena D3): el estado, sin DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createCut, cutApplies, CUT_MS } from '../src/tabs/train/cut.js';

test('entra solo con la guía activa y a 1× o 2×', () => {
  assert.equal(CUT_MS, 2000);
  for (const speed of [1, 2]) assert.equal(cutApplies({ guide: true, speed }), true, speed);
  for (const speed of [4, 8, 'max']) assert.equal(cutApplies({ guide: true, speed }), false, speed);
  assert.equal(cutApplies({ guide: false, speed: 1 }), false);
  const c = createCut();
  assert.equal(c.enter(0, { guide: false, speed: 1 }), false);
  assert.equal(c.active, false);
  assert.equal(c.enter(0, { guide: true, speed: 4 }), false);
  assert.equal(c.enter(0, { guide: true, speed: 2 }), true);
  assert.equal(c.active, true);
});

test('termina solo a los 2000 ms', () => {
  const c = createCut();
  c.enter(1000, { guide: true, speed: 1 });
  assert.equal(c.tick(2999), false);
  assert.equal(c.active, true);
  assert.equal(c.remainingAt(2500), 500);
  assert.equal(c.tick(3000), true, 'avisa que acaba de terminar');
  assert.equal(c.active, false);
  assert.equal(c.tick(4000), false);
});

test('la pausa congela el tiempo y al reanudar sigue lo que faltaba', () => {
  const c = createCut();
  c.enter(0, { guide: true, speed: 1 });
  c.pause(500);
  assert.equal(c.tick(10000), false, 'en pausa no termina');
  assert.equal(c.active, true);
  assert.equal(c.remaining, 1500);
  c.resume(10000);
  assert.equal(c.tick(11499), false);
  assert.equal(c.tick(11500), true);
});

test('entrar en pausa deja el corte quieto hasta reanudar', () => {
  const c = createCut();
  c.enter(0, { guide: true, speed: 1, paused: true });
  assert.equal(c.tick(5000), false);
  c.resume(5000);
  assert.equal(c.tick(7000), true);
});

test('Siguiente termina el corte', () => {
  const c = createCut();
  c.enter(0, { guide: true, speed: 1 });
  assert.equal(c.next(), true);
  assert.equal(c.active, false);
  assert.equal(c.next(), false, 'sin corte no hay nada que terminar');
});

test('pasar a 4× o más lo termina; cambiar entre 1× y 2× no', () => {
  const c = createCut();
  c.enter(0, { guide: true, speed: 1 });
  assert.equal(c.speedChanged(2), false);
  assert.equal(c.active, true);
  assert.equal(c.speedChanged(4), true);
  assert.equal(c.active, false);
  c.enter(0, { guide: true, speed: 2 });
  assert.equal(c.speedChanged('max'), true);
});

test('end lo termina por otra razón', () => {
  const c = createCut();
  c.enter(0, { guide: true, speed: 1 });
  assert.equal(c.end(), true);
  assert.equal(c.active, false);
});

// "Mismo entrenamiento" (D3): un bucle con cortes simulados (el reloj avanza 16 ms por cuadro y, en el corte, no se
// llama a step()) da el mismo historial que uno sin cortes.
import { createTraining } from '../src/core/training.js';

function trainWith({ cuts, generations = 5 }) {
  const t = createTraining({ seed: 11, config: { population: 30, maxDuration: 8 } });
  const c = createCut();
  let now = 0;
  let frames = 0;
  let cutFrames = 0;
  t.onGeneration(() => { if (cuts) c.enter(now, { guide: true, speed: 1 }); });
  while (t.completed < generations) {
    now += 16;
    frames += 1;
    c.tick(now);
    if (c.active) { cutFrames += 1; continue; }
    t.step();
  }
  return { history: t.history.map((r) => ({ generation: r.generation, best: r.best, average: r.average })), cutFrames, frames };
}

test('mismo entrenamiento: con cortes y sin cortes, el mismo historial', () => {
  const a = trainWith({ cuts: true });
  const b = trainWith({ cuts: false });
  // Cuatro cortes completos (después de las generaciones 1 a 4; la 5 cierra la prueba), de unos 2000 ms cada uno.
  assert.ok(Math.abs(a.cutFrames - 4 * 2000 / 16) <= 4, `hubo cortes (${a.cutFrames} cuadros)`);
  assert.equal(b.cutFrames, 0);
  assert.deepEqual(a.history, b.history);
});
