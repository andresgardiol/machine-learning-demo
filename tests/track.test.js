import test from 'node:test';
import assert from 'node:assert/strict';
import { createTrack, createStraightStreet, TrackError } from '../src/core/track.js';
import { segmentIntersection, distance } from '../src/core/geometry.js';

const near = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} no es ${b}`);

// Curva suave: recta, arco de 90 grados de radio 50 (muestreado) y recta.
function curvedTrack() {
  const pts = [{ x: 0, y: 0 }, { x: 100, y: 0 }];
  const steps = 30;
  for (let i = 1; i <= steps; i++) {
    const a = (Math.PI / 2) * (i / steps);
    pts.push({ x: 100 + 50 * Math.sin(a), y: 50 - 50 * Math.cos(a) });
  }
  pts.push({ x: 150, y: 150 });
  return createTrack({ centerline: pts, width: 12, lanes: 3 });
}

test('carriles de igual ancho que juntos ocupan el ancho total', () => {
  const t = createTrack({ centerline: [{ x: 0, y: 0 }, { x: 100, y: 0 }], width: 12, lanes: 3 });
  assert.equal(t.lanes, 3);
  assert.equal(t.laneWidth, 4);
  assert.equal(t.laneWidth * t.lanes, t.width);
  const centers = [0, 1, 2].map((l) => t.laneCenter(l, 10).position.y);
  assert.deepEqual(centers, [4, 0, -4]);
  assert.equal(centers[0] - centers[1], centers[1] - centers[2]);
});

test('bordes en la calle recta: paralelos a la línea central a medio ancho', () => {
  const s = createStraightStreet();
  assert.deepEqual(s.leftBorder, [{ x: -100000, y: 6 }, { x: 100000, y: 6 }]);
  assert.deepEqual(s.rightBorder, [{ x: -100000, y: -6 }, { x: 100000, y: -6 }]);
});

test('bordes en una pista con curva: continuos, a medio ancho, sin cruces', () => {
  const t = curvedTrack();
  for (const border of [t.leftBorder, t.rightBorder]) {
    assert.equal(border.length, t.centerline.length);
    const segs = border.slice(0, -1).map((p, i) => [p, border[i + 1]]);
    // sin huecos: cada tramo empieza donde termina el anterior (misma lista de vértices)
    // sin cruces entre tramos no contiguos
    for (let i = 0; i < segs.length; i++) {
      for (let j = i + 2; j < segs.length; j++) {
        assert.equal(segmentIntersection(...segs[i], ...segs[j]), null, `cruce entre tramos ${i} y ${j}`);
      }
    }
  }
  // distancia de cada vértice del borde a la línea central ~ medio ancho (inglete: >= medio ancho, casi igual en curva suave)
  t.leftBorder.forEach((p, i) => {
    const d = distance(p, t.centerline[i]);
    assert.ok(d >= 6 - 1e-9 && d < 6.05, `vértice ${i} a ${d}`);
  });
  // en tramos rectos los bordes son paralelos a la línea central
  near(t.leftBorder[0].y, 6); near(t.leftBorder[1].y, 6);
  near(t.rightBorder[0].y, -6);
});

test('curva más cerrada que medio ancho se rechaza', () => {
  const sharp = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 1 }, { x: 0, y: 1 }]; // vuelta en U de 1 m de radio
  assert.throws(() => createTrack({ centerline: sharp, width: 12, lanes: 3 }), (e) => e instanceof TrackError && e.code === 'CURVE_TOO_TIGHT');
  // un giro de 90 grados con tramos largos es admisible
  assert.doesNotThrow(() => createTrack({ centerline: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 50 }], width: 12, lanes: 3 }));
  // pero con tramos más cortos que el recorte del inglete (6 m) no
  assert.throws(() => createTrack({ centerline: [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 3 }], width: 12, lanes: 3 }), TrackError);
});

test('centro del carril del medio coincide con la línea central', () => {
  const s = createStraightStreet();
  const c = s.laneCenter(1, 250);
  assert.deepEqual(c.position, { x: 250, y: 0 });
  assert.equal(c.angle, 0);
});

test('carril inexistente se rechaza indicando los disponibles', () => {
  const s = createStraightStreet();
  assert.throws(() => s.laneCenter(3, 0), (e) => e instanceof TrackError && e.code === 'INVALID_LANE' && JSON.stringify(e.details.available) === '[0,1,2]');
  assert.throws(() => s.laneCenter(-1, 0), TrackError);
});

test('avanzar diez metros aumenta el progreso diez metros', () => {
  const s = createStraightStreet();
  const a = s.progressOf({ x: 30, y: 0 }).progress;
  const b = s.progressOf({ x: 40, y: 0 }, 0).progress;
  near(b - a, 10);
});

test('cambiar de carril no suma progreso', () => {
  const s = createStraightStreet();
  const a = s.progressOf(s.laneCenter(0, 500).position);
  const b = s.progressOf(s.laneCenter(2, 500).position);
  assert.equal(a.progress, 500);
  assert.equal(b.progress, 500);
  assert.equal(a.lateral, 4);
  assert.equal(b.lateral, -4);
});

test('retroceder cinco metros reduce el progreso cinco metros', () => {
  const s = createStraightStreet();
  const a = s.progressOf({ x: 100, y: 1 }).progress;
  const b = s.progressOf({ x: 95, y: 1 }).progress;
  near(a - b, 5);
});

test('recorrer una curva siguiendo la línea central da el largo total', () => {
  const t = curvedTrack();
  let hint = 0;
  let last = 0;
  for (let d = 0; d <= t.length; d += 0.5) {
    const { position } = t.pointAt(d);
    const r = t.progressOf(position, hint);
    hint = r.segmentIndex;
    assert.ok(r.progress >= last - 1e-6, 'el progreso nunca retrocede al avanzar');
    near(r.progress, d, 1e-6);
    last = r.progress;
  }
  const end = t.progressOf(t.pointAt(t.length).position, hint);
  near(end.progress, t.length);
  const expected = t.centerline.slice(1).reduce((s, p, i) => s + distance(p, t.centerline[i]), 0);
  near(t.length, expected);
});

test('la búsqueda con pista sugerida equivale a la búsqueda completa', () => {
  const t = curvedTrack();
  const p = t.pointAt(t.length / 2).position;
  near(t.progressOf(p, 0).progress, t.progressOf(p, t.segments.length - 1).progress);
});

test('calle recta: 3 carriles por defecto, 2 y 4 admitidos', () => {
  assert.equal(createStraightStreet().lanes, 3);
  assert.equal(createStraightStreet({ lanes: 2 }).lanes, 2);
  assert.equal(createStraightStreet({ lanes: 4 }).lanes, 4);
  const s = createStraightStreet();
  assert.equal(s.end, 100000, '100 km hacia adelante de la línea de salida');
  assert.equal(s.start, -100000, 'y otros 100 km hacia atrás');
  assert.equal(s.length, 200000);
});

test('calle recta: sigue por detrás de la línea de salida, con bordes y progreso negativo', () => {
  const s = createStraightStreet();
  assert.deepEqual(s.laneCenter(1, 0).position, { x: 0, y: 0 }, 'la salida sigue en x = 0');
  assert.equal(s.progressOf({ x: -30, y: 2 }).progress, -30);
  assert.ok(s.bordersNear({ x: -30, y: 0 }, 8).length >= 2, 'hay bordes detrás de la salida');
});

test('una pista que empieza en la línea de salida mide el progreso desde 0', () => {
  const t = createTrack({ centerline: [{ x: 0, y: 0 }, { x: 100, y: 0 }], width: 12, lanes: 3 });
  assert.equal(t.start, 0);
  assert.equal(t.end, 100);
  assert.equal(t.progressOf({ x: 40, y: 1 }).progress, 40);
});

test('cantidad de carriles no admitida: no se crea e informa las admitidas', () => {
  for (const lanes of [1, 5, 0, 3.5]) {
    assert.throws(() => createStraightStreet({ lanes }), (e) => e instanceof TrackError && e.code === 'INVALID_LANE_COUNT' && JSON.stringify(e.details.allowed) === '[2,3,4]');
  }
});
