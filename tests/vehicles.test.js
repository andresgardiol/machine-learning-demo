import test from 'node:test';
import assert from 'node:assert/strict';
import {
  VEHICLE_SIZES, VEHICLE_KINDS, MARGIN, SHADOW_REACH, DEFAULT_PALETTE,
  drawShadow, drawBody, drawDetail, drawBodySimple, drawDetailSimple,
} from '../src/render/vehicles.js';
import { VEHICLE_TYPES, CAR_LENGTH, CAR_WIDTH } from '../src/core/constants.js';

// Prueba de honestidad (vehiculos-ilustrados D4, spec "Lo que se ve es lo que choca"). En Node no hay canvas:
// se dibuja sobre un contexto que anota cada punto que toca el trazo (extremos y puntos de control de rectas
// y curvas, esquinas de rectángulos, cajas de elipses y arcos). Como una curva de Bézier no sale de la
// envolvente de sus puntos de control, si todos los puntos caen dentro del rectángulo, el dibujo también.
// Un trazo sin recorte suma medio ancho de línea hacia afuera; uno recortado (clip) no sale de su recorte.

function recorder() {
  const points = [];
  let path = [];
  let clipDepth = 0;
  const stack = [];
  const box = (x, y, rx, ry = rx) => { path.push([x - rx, y - ry], [x + rx, y + ry]); };
  const flush = (grow = 0) => {
    for (const [x, y] of path) {
      if (grow === 0) points.push([x, y]);
      else for (const [dx, dy] of [[grow, grow], [-grow, grow], [grow, -grow], [-grow, -grow]]) points.push([x + dx, y + dy]);
    }
  };
  const gradient = () => ({ addColorStop() {} });
  return {
    points,
    fillStyle: '#000', strokeStyle: '#000', lineWidth: 1, lineJoin: 'miter', globalAlpha: 1,
    beginPath() { path = []; },
    closePath() {},
    moveTo(x, y) { path.push([x, y]); },
    lineTo(x, y) { path.push([x, y]); },
    quadraticCurveTo(cx, cy, x, y) { path.push([cx, cy], [x, y]); },
    bezierCurveTo(c1x, c1y, c2x, c2y, x, y) { path.push([c1x, c1y], [c2x, c2y], [x, y]); },
    rect(x, y, w, h) { path.push([x, y], [x + w, y + h]); },
    // Girada, se toma la caja del círculo que la contiene.
    ellipse(x, y, rx, ry, rot = 0) { if (rot === 0) box(x, y, rx, ry); else box(x, y, Math.max(rx, ry)); },
    arc(x, y, r) { box(x, y, r); },
    roundRect(x, y, w, h) { path.push([x, y], [x + w, y + h]); },
    fill() { if (clipDepth === 0) flush(); },
    stroke() { if (clipDepth === 0) flush(this.lineWidth / 2); },
    clip() { flush(); clipDepth++; },
    fillRect(x, y, w, h) { if (clipDepth === 0) points.push([x, y], [x + w, y + h]); },
    save() { stack.push(clipDepth); },
    restore() { clipDepth = stack.pop() ?? 0; },
    createLinearGradient: gradient,
    createRadialGradient: gradient,
    setLineDash() {},
  };
}

/** Cuánto sale del rectángulo de L × W (m) lo que dibuja `draw`; 0 si nada sale. */
function overflow(draw, L, W) {
  const ctx = recorder();
  draw(ctx);
  assert.ok(ctx.points.length > 0, 'el dibujo no trazó nada');
  let worst = -Infinity;
  for (const [x, y] of ctx.points) worst = Math.max(worst, Math.abs(x) - L / 2, Math.abs(y) - W / 2);
  return worst;
}

const EPS = 1e-9;

test('hay un dibujo para el auto del conductor y para cada tipo del tráfico, con sus medidas', () => {
  assert.deepEqual(VEHICLE_SIZES.player, { L: CAR_LENGTH, W: CAR_WIDTH });
  for (const t of VEHICLE_TYPES) assert.deepEqual(VEHICLE_SIZES[t.type], { L: t.length, W: t.width }, t.type);
  assert.deepEqual([...VEHICLE_KINDS].sort(), ['car', 'motorcycle', 'player', 'truck', 'van']);
});

test('la carrocería queda dentro del contorno de choque, con su margen', () => {
  for (const kind of VEHICLE_KINDS) {
    const { L, W } = VEHICLE_SIZES[kind];
    const out = overflow((c) => drawBody(c, kind), L, W);
    assert.ok(out <= -MARGIN + EPS, `${kind}: la carrocería ${out > 0 ? `sale ${out.toFixed(3)} m del contorno` : `queda a ${(-out).toFixed(3)} m del borde`} (tiene que quedar a ${MARGIN} m adentro)`);
  }
});

test('el detalle y las versiones simplificadas tampoco salen del contorno', () => {
  for (const kind of VEHICLE_KINDS) {
    const { L, W } = VEHICLE_SIZES[kind];
    for (const [name, draw] of [
      ['detalle', (c) => drawDetail(c, kind, DEFAULT_PALETTE)],
      ['carrocería simplificada', (c) => drawBodySimple(c, kind)],
      ['detalle simplificado', (c) => drawDetailSimple(c, kind, DEFAULT_PALETTE)],
    ]) {
      const out = overflow(draw, L, W);
      assert.ok(out <= EPS, `${kind}, ${name}: sale ${out.toFixed(3)} m del contorno`);
    }
  }
});

test('la sombra sale como mucho 0,15 m', () => {
  assert.ok(SHADOW_REACH <= 0.15);
  for (const kind of VEHICLE_KINDS) {
    const { L, W } = VEHICLE_SIZES[kind];
    const out = overflow((c) => drawShadow(c, kind), L, W);
    assert.ok(out <= 0.15 + EPS, `${kind}: la sombra sale ${out.toFixed(3)} m`);
    assert.ok(out > 0, `${kind}: la sombra no asoma`);
  }
});

test('la prueba detecta un espejo agrandado', () => {
  // El auto del conductor con un espejo 10 cm más afuera que el contorno: la medida tiene que verlo.
  const { L, W } = VEHICLE_SIZES.player;
  const bigMirror = (c) => {
    drawBody(c, 'player');
    c.beginPath();
    c.moveTo(0.6, W / 2 - 0.1);
    c.bezierCurveTo(0.58, W / 2 + 0.1, 0.38, W / 2 + 0.1, 0.36, W / 2 - 0.1);
    c.closePath();
    c.fill();
  };
  assert.ok(overflow(bigMirror, L, W) > 0.05);
});

test('un tipo desconocido es un error, no un dibujo vacío', () => {
  assert.throws(() => drawBody(recorder(), 'bus'));
});
