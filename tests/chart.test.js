import test from 'node:test';
import assert from 'node:assert/strict';
import { chartModel, niceStep, currentRun, nearestIndex, CHART_LAYOUT } from '../src/ui/chart.js';

const rec = (generation, best, average, fitness = 'distance') => ({ generation, best, average, fitness, reason: 'timeLimit' });
const { x0, x1, y0, y1 } = chartModel([]).plot;

test('curva vacía: sin puntos ni marcas, y avisa que está vacía', () => {
  const m = chartModel([]);
  assert.equal(m.empty, true);
  assert.deepEqual(m.best, []);
  assert.deepEqual(m.average, []);
  assert.deepEqual(m.yTicks, []);
  assert.equal(m.unit, null);
  assert.deepEqual({ x0, x1, y0, y1 }, { x0: CHART_LAYOUT.left, x1: CHART_LAYOUT.width - CHART_LAYOUT.right, y0: CHART_LAYOUT.height - CHART_LAYOUT.bottom, y1: CHART_LAYOUT.top });
});

test('un punto: un punto por serie, centrado, dentro del área y con la unidad de la función', () => {
  const m = chartModel([rec(1, 120, 30)]);
  assert.equal(m.empty, false);
  assert.equal(m.best.length, 1);
  assert.equal(m.average.length, 1);
  assert.equal(m.best[0].x, (x0 + x1) / 2);
  assert.equal(m.unit, 'meters');
  assert.equal(m.yMax, 150); // paso 50: la escala queda por encima de 120
  assert.equal(m.best[0].y, y0 - ((y0 - y1) * 120) / 150);
  assert.equal(m.average[0].y, y0 - ((y0 - y1) * 30) / 150);
  assert.deepEqual(m.xTicks.map((t) => t.generation), [1]);
});

test('cinco generaciones: cinco puntos por serie y la escala se ajusta para que entren todos', () => {
  const h = [rec(1, 100, 10), rec(2, 210, 40), rec(3, 340, 90), rec(4, 520, 150), rec(5, 897.2, 300)];
  const m = chartModel(h);
  assert.equal(m.best.length, 5);
  assert.equal(m.average.length, 5);
  assert.equal(m.yMax, 1000);
  assert.deepEqual(m.yTicks.map((t) => t.value), [0, 200, 400, 600, 800, 1000]);
  assert.equal(m.best[0].x, x0);
  assert.equal(m.best[4].x, x1);
  for (const p of [...m.best, ...m.average]) assert.ok(p.y <= y0 && p.y >= y1, `${p.generation}: ${p.y}`);
  assert.deepEqual(m.best.map((p) => p.generation), [1, 2, 3, 4, 5]);
  assert.equal(m.best[4].value, 897.2);
  // Más alto en pantalla (y menor) cuanto mayor el valor.
  assert.ok(m.best[4].y < m.best[0].y);
});

test('todos los valores iguales: puntos en una misma altura y escala válida; todos en cero, escala de 0 a 1', () => {
  const m = chartModel([rec(1, 60, 60), rec(2, 60, 60), rec(3, 60, 60)]);
  assert.ok(m.yMax > 60);
  assert.equal(new Set(m.best.map((p) => p.y)).size, 1);
  assert.ok(m.best.every((p) => Number.isFinite(p.y) && p.y > y1));
  const zero = chartModel([rec(1, 0, 0), rec(2, 0, 0)]);
  assert.equal(zero.yMax, 1);
  assert.ok(zero.best.every((p) => p.y === y0));
  assert.ok(zero.yTicks.length >= 2);
});

test('cambio de función de fitness: la curva empieza de nuevo con la unidad nueva', () => {
  const h = [rec(1, 100, 10), rec(2, 200, 20), rec(3, 12, 4, 'survival'), rec(4, 20, 6, 'survival')];
  assert.equal(currentRun(h).length, 2);
  const m = chartModel(h);
  assert.equal(m.restarted, true);
  assert.equal(m.fitness, 'survival');
  assert.equal(m.unit, 'seconds');
  assert.deepEqual(m.best.map((p) => p.generation), [3, 4]);
  assert.equal(chartModel(h.slice(0, 2)).restarted, false);
  assert.equal(chartModel([...h, rec(5, 4, 1, 'speed')]).unit, 'metersPerSecond');
});

test('marcas redondas y punto señalado', () => {
  assert.equal(niceStep(897), 200);
  assert.equal(niceStep(120), 50);
  assert.equal(niceStep(5), 1);
  assert.equal(niceStep(0), 1);
  const m = chartModel([rec(1, 1, 1), rec(2, 2, 2), rec(3, 3, 3)]);
  assert.equal(nearestIndex(m.best, m.best[1].x + 3), 1);
  assert.equal(nearestIndex(m.best, -100), 0);
  assert.equal(nearestIndex([], 5), -1);
});

// --- La curva ocupa su tarjeta (design.md D5) ---------------------------------------------------
import { chartLayoutFor } from '../src/ui/chart.js';

test('medidas de la zona: se usan tal cual, con los márgenes de los ejes', () => {
  assert.deepEqual(chartLayoutFor({ width: 640, height: 300 }), { width: 640, height: 300, left: 44, right: 10, top: 10, bottom: 30 });
  assert.deepEqual(chartLayoutFor({ width: 412.7, height: 233.9 }), { width: 412, height: 233, left: 44, right: 10, top: 10, bottom: 30 });
});

test('medidas de la zona: respeta los mínimos de 240 × 120', () => {
  assert.deepEqual(chartLayoutFor({ width: 100, height: 50 }), { width: 240, height: 120, left: 44, right: 10, top: 10, bottom: 30 });
  assert.equal(chartLayoutFor({ width: 0, height: 0 }).width, 240);
  assert.equal(chartLayoutFor({ width: 0, height: 0 }).height, 120);
  assert.equal(chartLayoutFor({ width: 500, height: 80 }).height, 120);
  assert.equal(chartLayoutFor({ width: 200, height: 400 }).width, 240);
});

test('modelo con una zona de 640 × 300: área y puntos dentro de ella', () => {
  const layout = chartLayoutFor({ width: 640, height: 300 });
  const history = [rec(1, 120, 30), rec(2, 300, 80), rec(3, 610, 140), rec(4, 450, 160), rec(5, 640, 200)];
  const m = chartModel(history, layout);
  assert.deepEqual(m.plot, { x0: 44, x1: 630, y0: 270, y1: 10 });
  assert.equal(m.best[0].x, 44);
  assert.equal(m.best[4].x, 630);
  assert.equal(m.yMax, 800);
  assert.equal(m.best[4].y, 270 - (260 * 640) / 800);
  for (const p of [...m.best, ...m.average]) {
    assert.ok(p.x >= 44 && p.x <= 630, `x ${p.x}`);
    assert.ok(p.y >= 10 && p.y <= 270, `y ${p.y}`);
  }
  for (const t of m.yTicks) assert.ok(t.y >= 10 && t.y <= 270);
  for (const t of m.xTicks) assert.ok(t.x >= 44 && t.x <= 630);
});

test('curva con la ventaja sobre el tráfico: el eje dice metros de ventaja', async () => {
  const { chartModel, UNITS } = await import('../src/ui/chart.js');
  assert.equal(UNITS.lead, 'metersAhead');
  const model = chartModel([{ generation: 1, best: 120, average: 40, fitness: 'lead' }]);
  assert.equal(model.unit, 'metersAhead');
});
