// Distribución del paisaje (circuitos-y-paisaje, tareas 6.1 y 6.2): reproducible, propia de cada
// semilla y de cada celda, y nunca sobre la calzada.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  streetCell, streetCellsIn, crosswalkAt, circuitScenery, distanceToCenterline,
  STREET_CELL, SIDEWALK_WIDTH, TREE_DISTANCE, TREE_RADIUS, CROSSWALK, KERB_MAX_RADIUS, TREE_CLEARANCE, STAND,
} from '../src/render/scenery-layout.js';
import { createStraightStreet } from '../src/core/track.js';
import { createTrackById } from '../src/core/circuits.js';

const cells = (seed, width, ks) => ks.map((index) => streetCell({ seed, width, index }));

test('calle: la misma semilla da la misma distribución; otra semilla, otra', () => {
  const a = cells(1, 12, [-3, 0, 1, 2, 57]);
  const b = cells(1, 12, [-3, 0, 1, 2, 57]);
  const c = cells(2, 12, [-3, 0, 1, 2, 57]);
  assert.deepEqual(a, b);
  assert.notDeepEqual(a.map((x) => x.trees), c.map((x) => x.trees));
});

test('calle: ningún árbol ni vereda cae sobre la calzada, y los árboles quedan fuera de las veredas', () => {
  for (const lanes of [2, 3, 4]) {
    const street = createStraightStreet({ lanes });
    const half = street.width / 2;
    for (const cell of cells(5, street.width, streetCellsIn(-1000, 3000))) {
      for (const s of cell.sidewalks) {
        assert.ok(s.y0 >= half || s.y1 <= -half, 'vereda sobre la calzada');
        assert.equal(s.y1 - s.y0, SIDEWALK_WIDTH);
      }
      for (const t of cell.trees) {
        const fromEdge = Math.abs(t.y) - half;
        assert.ok(fromEdge - t.r >= SIDEWALK_WIDTH, 'árbol sobre la vereda o la calzada');
        assert.ok(fromEdge >= TREE_DISTANCE.min && fromEdge <= TREE_DISTANCE.max, `árbol a ${fromEdge} m del borde`);
        assert.ok(t.r >= TREE_RADIUS.min && t.r <= TREE_RADIUS.max);
        assert.ok(t.x >= cell.x0 && t.x <= cell.x1);
      }
      for (const w of cell.crosswalks) {
        assert.equal(w.x1 - w.x0, CROSSWALK.length);
        assert.equal(w.y0, -half);
        assert.equal(w.y1, half);
      }
    }
  }
});

test('calle: dos celdas vecinas no repiten la misma distribución', () => {
  const list = cells(3, 12, streetCellsIn(0, 5000));
  const shape = (cell) => cell.trees.map((t) => [Math.round(t.x - cell.x0), Math.round(t.y)]);
  for (let i = 1; i < list.length; i++) assert.notDeepEqual(shape(list[i]), shape(list[i - 1]));
});

test('calle: sendas peatonales cada 150 a 400 m, a lo largo de toda la calle', () => {
  const xs = [];
  for (const cell of cells(4, 12, streetCellsIn(0, 4000))) for (const w of cell.crosswalks) xs.push(w.x0);
  xs.sort((a, b) => a - b);
  assert.ok(xs.length >= 10);
  for (let i = 1; i < xs.length; i++) {
    const gap = xs[i] - xs[i - 1];
    assert.ok(gap >= 150 && gap <= 400, `${gap} m entre sendas`);
  }
  assert.equal(crosswalkAt(4, 7), crosswalkAt(4, 7));
  assert.equal(STREET_CELL, 100);
});

const CIRCUITS = ['oval', 'kidney', 'grandPrix'];

test('circuitos: siempre la misma distribución', () => {
  for (const id of CIRCUITS) {
    const a = circuitScenery(createTrackById(id));
    const b = circuitScenery(createTrackById(id));
    assert.deepEqual(a, b);
    assert.equal(circuitScenery(createTrackById(id), id), circuitScenery(createTrackById(id), id));
  }
});

test('circuitos: nada queda sobre la calzada (árboles, tribunas y pianitos fuera de los bordes)', () => {
  for (const id of CIRCUITS) {
    const track = createTrackById(id);
    const half = track.width / 2;
    const s = circuitScenery(track);
    assert.ok(s.trees.length > 50, `${id}: ${s.trees.length} árboles`);
    for (const t of s.trees) assert.ok(distanceToCenterline(track, t) - t.r >= half + TREE_CLEARANCE - 1e-9);
    assert.ok(s.stands.length >= 1 && s.stands.length <= 3, `${id}: ${s.stands.length} tribunas`);
    for (const st of s.stands) {
      for (const c of st.points) assert.ok(distanceToCenterline(track, c) >= half + STAND.gap - 0.6, `${id}: tribuna sobre la pista`);
      // Ningún árbol sobre una tribuna.
      const cx = st.points.reduce((a, p) => a + p.x, 0) / 4;
      const cy = st.points.reduce((a, p) => a + p.y, 0) / 4;
      for (const t of s.trees) assert.ok(Math.hypot(t.x - cx, t.y - cy) > STAND.depth / 2, `${id}: árbol sobre una tribuna`);
    }
    for (const k of s.kerbs) {
      for (const p of k.points) assert.ok(distanceToCenterline(track, p) >= half - 1e-6, `${id}: pianito sobre la calzada`);
    }
    // La línea de largada va pintada sobre la calzada, de borde a borde.
    assert.equal(s.checkers.length, 2 * track.width);
  }
});

test('circuitos: pianitos solo donde el radio es menor que 80 m, de dos colores alternados', () => {
  for (const id of CIRCUITS) {
    const s = circuitScenery(createTrackById(id));
    assert.ok(s.kerbs.length > 0, id);
    for (const k of s.kerbs) assert.ok(k.radius < KERB_MAX_RADIUS);
    assert.ok(s.kerbs.some((k) => k.tone === 0) && s.kerbs.some((k) => k.tone === 1));
  }
  // El óvalo tiene pianitos en las dos curvas (radio 50 m) y no en las rectas.
  const oval = createTrackById('oval');
  const s = circuitScenery(oval);
  const onStraight = s.kerbs.filter((k) => Math.abs(oval.segments[k.segment].dir.y) < 1e-9 && oval.segments[k.segment].len > 10);
  assert.equal(onStraight.length, 0);
});

test('Recta de salida: el óvalo tiene una tribuna junto a la recta de salida, fuera de la pista', () => {
  const oval = createTrackById('oval');
  const [main] = circuitScenery(oval).stands;
  // El óvalo va antihorario: la recta de salida está abajo (y = 0) y la tribuna, debajo de ella.
  for (const c of main.points) assert.ok(c.y < -oval.width / 2);
  const xs = main.points.map((p) => p.x);
  assert.ok(Math.min(...xs) >= -75 - 1 && Math.max(...xs) <= 75 + 1);
});
