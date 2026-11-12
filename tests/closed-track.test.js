// Pistas cerradas (circuitos-y-paisaje, grupo 1): bordes sin extremos, distancias reducidas a una
// vuelta, progreso y bordes cercanos en el tramo de cierre, y la calle recta sin cambios.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTrack, createStraightStreet } from '../src/core/track.js';
import { segmentIntersection } from '../src/core/geometry.js';

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} no es ${b}`);

/** Óvalo de prueba: rectas de 100 m y medias vueltas de radio 40 m, antihorario, salida en (0, 0). */
function testOval() {
  const pts = [];
  const r = 40;
  for (let x = 0; x < 100; x += 10) pts.push({ x, y: 0 });
  for (let i = 0; i < 40; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 40;
    pts.push({ x: 100 + r * Math.cos(a), y: r + r * Math.sin(a) });
  }
  for (let x = 100; x > 0; x -= 10) pts.push({ x, y: 2 * r });
  for (let i = 0; i < 40; i++) {
    const a = Math.PI / 2 + (Math.PI * i) / 40;
    pts.push({ x: r * Math.cos(a), y: r + r * Math.sin(a) });
  }
  return createTrack({ centerline: pts, width: 12, lanes: 1, closed: true });
}

/** ¿El punto está dentro del polígono (contorno cerrado, último punto = primero)? */
function inside(p, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 2; i < poly.length - 1; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

const segmentsOf = (pts) => pts.slice(0, -1).map((p, i) => [p, pts[i + 1]]);

test('Bordes sin extremos: cada borde es un contorno cerrado y la pista queda entre los dos', () => {
  const t = testOval();
  assert.equal(t.closed, true);
  for (const border of [t.leftBorder, t.rightBorder]) {
    assert.deepEqual(border[0], border[border.length - 1]);
    assert.equal(border.length, t.centerline.length + 1);
  }
  // El tramo de cierre de cada borde está entre los tramos de choque.
  assert.equal(t.borderSegments.length, 2 * t.centerline.length);
  // Los dos bordes no se tocan: un contorno queda entero dentro del otro.
  for (const [a, b] of segmentsOf(t.leftBorder)) {
    for (const [c, d] of segmentsOf(t.rightBorder)) assert.equal(segmentIntersection(a, b, c, d), null);
  }
  // Antihorario: el borde izquierdo es el interior. Todo punto de la pista está dentro del
  // derecho y fuera del izquierdo, así que para salir hay que cruzar uno de los dos.
  for (let d = 0; d < t.length; d += 2.5) {
    for (const lateral of [-5.5, 0, 5.5]) {
      const { position, angle } = t.pointAt(d);
      const p = { x: position.x - Math.sin(angle) * lateral, y: position.y + Math.cos(angle) * lateral };
      assert.ok(inside(p, t.rightBorder), `fuera del borde exterior en ${d}`);
      assert.ok(!inside(p, t.leftBorder), `dentro del borde interior en ${d}`);
    }
  }
});

test('Bordes sin extremos: unión en inglete también en el vértice de la salida', () => {
  const t = testOval();
  // El vértice de la salida une el último tramo con el primero: sus bordes quedan a medio ancho de
  // las rectas de los dos tramos, como en cualquier otro vértice.
  const last = t.segments[t.segments.length - 1];
  const first = t.segments[0];
  const lateral = (p, seg) => (p.x - seg.a.x) * seg.normal.x + (p.y - seg.a.y) * seg.normal.y;
  for (const seg of [last, first]) {
    near(lateral(t.leftBorder[0], seg), 6);
    near(lateral(t.rightBorder[0], seg), -6);
  }
});

test('pista cerrada: el último punto repetido se descarta y el largo es el de una vuelta', () => {
  const sq = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];
  const a = createTrack({ centerline: sq, width: 12, lanes: 1, closed: true });
  const b = createTrack({ centerline: [...sq, { x: 0, y: 0 }], width: 12, lanes: 1, closed: true });
  assert.equal(a.length, 400);
  assert.equal(b.length, 400);
  assert.equal(a.start, 0);
  assert.equal(a.end, 400);
  assert.equal(a.segments.length, 4);
  assert.deepEqual(a.centerline, b.centerline);
});

test('Posición después de una vuelta: la misma que a 10 m de la salida', () => {
  const t = testOval();
  const p = t.pointAt(t.length + 10);
  const q = t.pointAt(10);
  near(p.position.x, q.position.x);
  near(p.position.y, q.position.y);
  near(p.angle, q.angle);
  const l = t.laneCenter(0, t.length + 10);
  near(l.position.x, q.position.x);
  near(l.position.y, q.position.y);
  // También hacia atrás: -10 m es 10 m antes de completar la vuelta.
  const back = t.pointAt(-10);
  const ahead = t.pointAt(t.length - 10);
  near(back.position.x, ahead.position.x);
  near(back.position.y, ahead.position.y);
  near(t.pointAt(3 * t.length + 25).position.x, t.pointAt(25).position.x);
});

test('progressOf en el tramo de cierre: a ambos lados de la línea de salida', () => {
  const t = testOval();
  const last = t.segments.length - 1;
  const after = t.progressOf({ x: 3, y: 1 }, last);
  near(after.progress, 3);
  near(after.lateral, 1);
  assert.equal(after.segmentIndex, 0);
  const before = t.progressOf({ x: -0.5, y: -1 }, 0);
  assert.equal(before.segmentIndex, last);
  assert.ok(before.progress > t.length - 1 && before.progress < t.length, `progreso ${before.progress}`);
  // Siempre dentro de una vuelta.
  for (let d = 0; d < t.length; d += 7) {
    const at = t.pointAt(d);
    const pr = t.progressOf(at.position, at.segmentIndex).progress;
    assert.ok(pr >= 0 && pr < t.length);
    near(pr, d, 1e-6);
  }
});

test('bordersNear en la línea de salida: devuelve los tramos de ambos lados del cierre', () => {
  const t = testOval();
  const near0 = t.bordersNear({ x: 0, y: 0 }, 10);
  const last = t.segments.length - 1;
  assert.ok(near0.includes(t.borderSegments[0]));
  assert.ok(near0.includes(t.borderSegments[last]));
  assert.ok(near0.includes(t.borderSegments[t.segments.length]));
  // Lo mismo que filtrar todos los tramos, en el mismo orden.
  const brute = (p, r) => t.borderSegments.filter(([a, b]) => Math.max(a.x, b.x) >= p.x - r && Math.min(a.x, b.x) <= p.x + r
    && Math.max(a.y, b.y) >= p.y - r && Math.min(a.y, b.y) <= p.y + r);
  for (const p of [{ x: 0, y: 0 }, { x: 120, y: 30 }, { x: 50, y: 80 }, { x: -45, y: 40 }, { x: 500, y: 500 }]) {
    for (const r of [4, 12, 60]) assert.deepEqual(t.bordersNear(p, r), brute(p, r));
  }
});

test('Pista abierta sin cambios: la calle recta tiene principio y fin y no da vueltas', () => {
  const s = createStraightStreet();
  assert.equal(s.closed, false);
  assert.equal(s.start, -100000);
  assert.equal(s.end, 100000);
  assert.equal(s.borderSegments.length, 2);
  assert.deepEqual(s.pointAt(s.end + 50).position, { x: 100000, y: 0 });
  assert.deepEqual(s.pointAt(s.start - 50).position, { x: -100000, y: 0 });
  assert.equal(s.progressOf({ x: 250, y: 1 }).progress, 250);
});
