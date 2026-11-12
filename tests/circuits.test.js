// Catálogo de circuitos (circuitos-y-paisaje, grupo 2): las cuatro pistas, circuitos que cierran,
// largos, radios, separaciones, salida en recta y una vuelta por el centro sin tocar los bordes.
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TRACK_IDS, CIRCUITS, CIRCUIT_WIDTH, buildCenterline, createTrackById, isCircuit,
} from '../src/core/circuits.js';
import { TrackError } from '../src/core/track.js';
import { createCar, stepCar, carContour } from '../src/core/car.js';
import { outline, segmentIntersection, distance } from '../src/core/geometry.js';
import { STEP, MAX_SPEED } from '../src/core/constants.js';

const CIRCUIT_IDS = ['oval', 'kidney', 'grandPrix'];
const LENGTHS = { oval: [500, 700], kidney: [800, 1000], grandPrix: [1400, 1800] };

test('Cuatro pistas: la calle recta, el óvalo, el riñón y el gran premio, en ese orden', () => {
  assert.deepEqual(TRACK_IDS, ['straight', 'oval', 'kidney', 'grandPrix']);
  assert.equal(isCircuit('straight'), false);
  for (const id of CIRCUIT_IDS) assert.equal(isCircuit(id), true);
  assert.equal(createTrackById('straight').closed, false);
  assert.equal(createTrackById('straight', { lanes: 4 }).lanes, 4);
});

test('Circuito repetible: dos veces el mismo circuito da exactamente los mismos puntos', () => {
  for (const id of CIRCUIT_IDS) {
    const a = createTrackById(id);
    const b = createTrackById(id);
    assert.deepEqual(a.centerline, b.centerline);
    assert.deepEqual(a.leftBorder, b.leftBorder);
    assert.deepEqual(a.rightBorder, b.rightBorder);
  }
});

test('Pista desconocida: se rechaza con un error que nombra las pistas disponibles', () => {
  assert.throws(() => createTrackById('monza'), (err) => err instanceof TrackError && err.code === 'UNKNOWN_TRACK'
    && err.details.id === 'monza' && err.details.available.join() === TRACK_IDS.join());
});

test('cada circuito cierra: vuelve al punto y a la dirección de partida', () => {
  for (const id of CIRCUIT_IDS) {
    const { gap, heading } = buildCenterline(CIRCUITS[id]);
    assert.ok(gap < 0.01, `${id}: le faltan ${gap} m para cerrar`);
    assert.equal(Math.abs(heading), 360, `${id}: gira ${heading} grados`);
  }
});

test('largo de cada circuito dentro del rango de la spec, 12 m de ancho y un carril', () => {
  for (const id of CIRCUIT_IDS) {
    const t = createTrackById(id);
    const [min, max] = LENGTHS[id];
    assert.ok(t.length >= min && t.length <= max, `${id}: ${t.length} m`);
    assert.equal(t.width, CIRCUIT_WIDTH);
    assert.equal(t.width, 12);
    assert.equal(t.lanes, 1);
    assert.equal(t.closed, true);
  }
  assert.equal(createTrackById('oval', { lanes: 4 }).lanes, 1);
  // Óvalo: dos rectas de 150 m y dos medias vueltas de radio 50 m (614 m).
  assert.ok(Math.abs(createTrackById('oval').length - 614) < 1);
});

test('radio mínimo de 25 m sobre la línea central', () => {
  for (const id of CIRCUIT_IDS) {
    for (const p of CIRCUITS[id]) if (p.radius !== undefined) assert.ok(p.radius >= 25, `${id}: radio ${p.radius}`);
    // También en los puntos: el círculo que pasa por tres vértices consecutivos.
    const pts = createTrackById(id).centerline;
    for (let i = 0; i < pts.length; i++) {
      const a = pts[(i + pts.length - 1) % pts.length];
      const b = pts[i];
      const c = pts[(i + 1) % pts.length];
      const area2 = Math.abs((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x));
      if (area2 < 1e-9) continue;
      const r = (distance(a, b) * distance(b, c) * distance(c, a)) / (2 * area2);
      assert.ok(r >= 25 - 0.01, `${id}: radio ${r} en el punto ${i}`);
    }
  }
});

/** Distancia mínima entre puntos de la línea central separados al menos `apart` metros a lo largo de la pista. */
function minSeparation(track, apart, sample = 2) {
  const pts = [];
  for (let d = 0; d < track.length; d += sample) pts.push({ d, p: track.pointAt(d).position });
  let min = Infinity;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const along = Math.min(pts[j].d - pts[i].d, track.length - (pts[j].d - pts[i].d));
      if (along < apart) continue;
      const dd = distance(pts[i].p, pts[j].p);
      if (dd < min) min = dd;
    }
  }
  return min;
}

test('Tramos separados: 30 m entre líneas centrales de tramos no vecinos (18 m entre bordes)', () => {
  // Tramos no vecinos: puntos a más de 50 m uno de otro a lo largo de la pista.
  for (const id of CIRCUIT_IDS) {
    const t = createTrackById(id);
    const sep = minSeparation(t, 50);
    assert.ok(sep >= 30, `${id}: ${sep.toFixed(1)} m`);
    assert.ok(sep - t.width >= 18);
  }
});

test('la salida está en una recta de al menos 80 m', () => {
  for (const id of CIRCUIT_IDS) {
    const pieces = CIRCUITS[id];
    const first = pieces[0].straight ?? 0;
    const last = pieces[pieces.length - 1].straight ?? 0;
    assert.ok(first + last >= 80, `${id}: ${first + last} m`);
    assert.ok(first > 0 && last > 0, `${id}: la salida no está dentro de la recta`);
  }
});

test('gran premio: ocho curvas o más a los dos lados, horquilla, eses y recta de 250 m', () => {
  const pieces = CIRCUITS.grandPrix;
  const arcs = pieces.filter((p) => p.radius !== undefined);
  assert.ok(arcs.length >= 8);
  assert.ok(arcs.some((a) => a.turn > 0) && arcs.some((a) => a.turn < 0));
  assert.ok(arcs.some((a) => Math.abs(a.turn) >= 150 && a.radius <= 30), 'horquilla');
  // Eses: al menos tres curvas seguidas que alternan el lado.
  let run = 1;
  let best = 1;
  for (let i = 1; i < pieces.length; i++) {
    const a = pieces[i - 1];
    const b = pieces[i];
    run = a.radius !== undefined && b.radius !== undefined && Math.sign(a.turn) !== Math.sign(b.turn) ? run + 1 : 1;
    best = Math.max(best, run);
  }
  assert.ok(best >= 3, 'eses');
  // Recta de atrás: una recta de 250 m o más que no es la de salida.
  assert.ok(pieces.slice(1, -1).some((p) => p.straight >= 250));
  const others = CIRCUIT_IDS.filter((id) => id !== 'grandPrix').map((id) => createTrackById(id).length);
  assert.ok(createTrackById('grandPrix').length > Math.max(...others));
});

test('ningún circuito se cruza consigo mismo', () => {
  for (const id of CIRCUIT_IDS) {
    const t = createTrackById(id);
    const segs = t.borderSegments;
    const n = t.segments.length;
    for (let i = 0; i < segs.length; i++) {
      for (let j = i + 1; j < segs.length; j++) {
        // Tramos vecinos del mismo borde comparten un vértice.
        const sameBorder = (i < n) === (j < n);
        if (sameBorder && (j - i <= 1 || (i % n === 0 && j % n === n - 1))) continue;
        assert.equal(segmentIntersection(...segs[i], ...segs[j]), null, `${id}: bordes ${i} y ${j}`);
      }
    }
  }
});

test('Vuelta por el centro: siguiendo la línea central a la velocidad máxima por defecto, una vuelta sin tocar los bordes', () => {
  for (const id of CIRCUIT_IDS) {
    const t = createTrackById(id);
    const start = t.pointAt(0);
    const car = createCar({ position: start.position, angle: start.angle });
    assert.equal(car.maxSpeed, MAX_SPEED);
    let segment = 0;
    let travelled = 0;
    let last = 0;
    let worst = 0;
    for (let s = 0; s < (2 * t.length) / MAX_SPEED / STEP && travelled < t.length; s++) {
      // Sigue un punto de la línea central 8 m por delante.
      const ahead = t.pointAt(last + 8).position;
      const want = Math.atan2(ahead.y - car.position.y, ahead.x - car.position.x);
      let diff = want - car.angle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff));
      stepCar(car, { forward: true, left: diff > 0.01, right: diff < -0.01 }, STEP);
      const pr = t.progressOf(car.position, segment);
      segment = pr.segmentIndex;
      let delta = pr.progress - last;
      if (delta < -t.length / 2) delta += t.length;
      travelled += delta;
      last = pr.progress;
      worst = Math.max(worst, Math.abs(pr.lateral));
      const edges = outline(carContour(car));
      for (const [a, b] of t.bordersNear(car.position, 4)) {
        for (const [c, d] of edges) assert.equal(segmentIntersection(a, b, c, d), null, `${id}: toca el borde a ${travelled.toFixed(0)} m`);
      }
    }
    assert.ok(car.speed > MAX_SPEED - 1e-9, `${id}: no llegó a la velocidad máxima`);
    assert.ok(travelled >= t.length, `${id}: recorrió ${travelled} de ${t.length} m`);
    assert.ok(worst < 2, `${id}: se apartó ${worst} m del centro`);
  }
});
