// Dibujos de los vehículos ilustrados (vehiculos-ilustrados D1, D2 y D4; estilo elegido: «A · Brillo»).
//
// Cada vehículo se dibuja en metros y en ejes locales (x hacia adelante, y hacia la izquierda), centrado en su
// rectángulo de choque de L × W. Son funciones que trazan sobre un contexto de canvas; no tocan el DOM, no
// guardan estado ni importan nada fuera de core. El caché (D3) las usa para armar cada imagen una vez:
//   1. carrocería (drawBody): una máscara de un solo color, el de ctx.fillStyle, que se pinta con el del papel
//      (verde propio, ámbar del tráfico, competidores o choque) con `source-in`;
//   2. detalle (drawDetail), encima: neutro (negros y blancos con transparencia) más vidrios, luces, ruedas y
//      piloto de color fijo, así sirve con cualquier carrocería;
//   3. sombra (drawShadow), debajo con `destination-over`: lo único que sale del rectángulo, hasta
//      SHADOW_REACH, y tenue. Sigue la silueta del vehículo.
// Con menos de SIMPLE_BELOW píxeles físicos por metro van las versiones simplificadas (drawBodySimple y
// drawDetailSimple): la silueta, el parabrisas y los faros, que siguen marcando el frente, y lo que distingue
// al tipo (la caja de la camioneta, el enganche del camión, el casco de la moto).
//
// Cómo está hecho el volumen: casi todo el detalle se dibuja recortado (clip) a la carrocería. El borde se
// oscurece con trazos anchos superpuestos que siguen la silueta («almohadón»), y encima van la luz de costado
// (LIGHT), los brillos nítidos del capó y del techo y el contorno oscuro.
//
// Honestidad (spec "Lo que se ve es lo que choca"): todos los puntos de control de la carrocería quedan
// dentro del rectángulo, a MARGIN o más del borde, y lo que no va recortado a ella (ruedas, manubrio y casco
// de la moto) tampoco sale. Las curvas de Bézier no salen de la envolvente de sus puntos de control, así que
// si los puntos están adentro, el dibujo también. Lo comprueba tests/vehicles.test.js.

import { CAR_LENGTH, CAR_WIDTH, VEHICLE_TYPES } from '../core/constants.js';

export const MARGIN = 0.02; // m entre el dibujo y el contorno de choque
export const SHADOW_REACH = 0.12; // m que la sombra sale del contorno (el tope de la spec es 0,15)
export const SIMPLE_BELOW = 8; // px físicos por metro: por debajo, la versión simplificada

/** Medidas de cada dibujo: el auto del conductor ('player') y los tipos del tráfico (trafico-vivo D3). */
export const VEHICLE_SIZES = Object.freeze({
  player: Object.freeze({ L: CAR_LENGTH, W: CAR_WIDTH }),
  ...Object.fromEntries(VEHICLE_TYPES.map((t) => [t.type, Object.freeze({ L: t.length, W: t.width })])),
});
export const VEHICLE_KINDS = Object.freeze(Object.keys(VEHICLE_SIZES));

/** Colores fijos del detalle. glass, headlight y taillight son los tokens de styles/tokens.css. */
export const DEFAULT_PALETTE = Object.freeze({
  glass: '#1d2b3a', headlight: '#fff3c4', taillight: '#8f1d22',
  tire: '#14171c', helmet: '#f2f4f7', visor: '#1d2b3a', bar: '#c9ced6',
  rider: '#232933', // pantalón, guantes y botas del piloto
});

const LIGHT = -1; // lado del que viene la luz (signo de y): los brillos van de ese lado
const TAIL_GLOW = 'rgba(255,104,104,0.7)';

const ink = (a) => `rgba(6,10,18,${a})`;
const lit = (a) => `rgba(255,255,255,${a})`;
const lerp = (a, b, t) => a + (b - a) * t;

// ---------------------------------------------------------------------------------------------------
// Trazos auxiliares. Las formas son funciones (ctx) => void que agregan subtrazos al camino actual.

/**
 * Contorno simétrico: `segs` son cúbicas del lado izquierdo (y ≥ 0), de la cola (start, en y = 0) a la
 * trompa (último punto, en y = 0). El lado derecho sale de reflejarlas.
 */
function mirrored(ctx, start, segs) {
  ctx.moveTo(start[0], start[1]);
  for (const s of segs) ctx.bezierCurveTo(s[0], s[1], s[2], s[3], s[4], s[5]);
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i];
    const prev = i > 0 ? segs[i - 1] : [0, 0, 0, 0, start[0], start[1]];
    ctx.bezierCurveTo(s[2], -s[3], s[0], -s[1], prev[4], -prev[5]);
  }
  ctx.closePath();
}

/**
 * Paño simétrico entre dos bordes transversales: uno en xa (medio ancho ha) y otro en xb (medio ancho hb),
 * cada uno combado `bow` metros en el centro (positivo: hacia adelante). Sirve para parabrisas, luneta y techo.
 */
function shield(ctx, xa, ha, xb, hb, bowA = 0, bowB = 0) {
  ctx.moveTo(xa, ha);
  ctx.lineTo(xb, hb);
  ctx.quadraticCurveTo(xb + 2 * bowB, 0, xb, -hb);
  ctx.lineTo(xa, -ha);
  ctx.quadraticCurveTo(xa + 2 * bowA, 0, xa, ha);
  ctx.closePath();
}

/** Polígono; `s` refleja el lado (1 izquierda, −1 derecha). */
function poly(ctx, pts, s = 1) {
  ctx.moveTo(pts[0][0], s * pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], s * pts[i][1]);
  ctx.closePath();
}

function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry = rx) {
  ctx.moveTo(x + rx, y);
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
}

function fill(ctx, style, shape) {
  ctx.beginPath();
  shape(ctx);
  ctx.fillStyle = style;
  ctx.fill();
}

function line(ctx, style, width, shape) {
  ctx.beginPath();
  shape(ctx);
  ctx.strokeStyle = style;
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke();
}

/** Dibuja `draw` recortado a `shape`. Con rule = 'evenodd', a la parte de `shape` cubierta un número impar de veces. */
function within(ctx, shape, draw, rule) {
  ctx.save();
  ctx.beginPath();
  shape(ctx);
  if (rule) ctx.clip(rule); else ctx.clip();
  draw();
  ctx.restore();
}

const both = (fn) => { fn(1); fn(-1); };

/** Mancha suave (brillo o sombra difusa): elipses concéntricas de poca opacidad. */
function soft(ctx, x, y, rx, ry, a, rgb = '255,255,255', n = 7) {
  const style = `rgba(${rgb},${(a / n).toFixed(4)})`;
  for (let i = n; i >= 1; i--) fill(ctx, style, (c) => ellipse(c, x, y, (rx * i) / n, (ry * i) / n));
}

/** «Almohadón»: oscurece hacia el borde de `shape`, hasta `depth` metros hacia adentro. Va recortado a ella. */
function pillow(ctx, shape, depth, strength, n = 8) {
  const style = ink((strength / n).toFixed(4));
  for (let i = 0; i < n; i++) line(ctx, style, 2 * depth * (1 - i / n) ** 1.4, shape);
}

/** Brillo nítido, de caricatura: una pincelada blanca de puntas redondas. */
function gloss(ctx, a, width, x0, y0, cx, cy, x1, y1) {
  line(ctx, lit(a), width, (c) => { c.moveTo(x0, y0); c.quadraticCurveTo(cx, cy, x1, y1); });
}

/** Vidrio: burlete oscuro, fondo, más celeste hacia `xLight` (cuánto: `sky`), reflejos en diagonal y un borde fino claro. */
function glass(ctx, palette, shape, xDark, xLight, reflections = true, sky = 0.34) {
  line(ctx, ink(0.55), 0.08, shape);
  line(ctx, palette.glass, 0.03, shape); // redondea las esquinas
  fill(ctx, palette.glass, shape);
  within(ctx, shape, () => {
    const tint = ctx.createLinearGradient(xDark, 0, xLight, 0);
    tint.addColorStop(0, 'rgba(140,196,250,0)');
    tint.addColorStop(1, `rgba(140,196,250,${sky})`);
    fill(ctx, tint, shape);
    if (reflections) {
      const d = xLight - xDark;
      const band = (y, w, a) => fill(ctx, lit(a), (c) => poly(c, [
        [xDark - d, y - 0.55], [xDark - d, y - 0.55 + w], [xLight + d, y + 0.55 + w], [xLight + d, y + 0.55],
      ], LIGHT * Math.sign(d)));
      band(0.22, 0.17, 0.2);
      band(0.47, 0.05, 0.14);
    }
    line(ctx, lit(0.3), 0.04, shape);
  });
}

/** Faro o luz de cola: `shape` va recortada a la carrocería, así sigue la curva de la trompa o de la cola. */
function lamp(ctx, color, shape) {
  line(ctx, ink(0.55), 0.07, shape);
  line(ctx, color, 0.025, shape);
  fill(ctx, color, shape);
}

/** Espejos pegados al costado: un lóbulo tirado hacia atrás a cada lado, de `root` (dentro del casco) a `tip`. */
function mirrorLobes(ctx, { x, root, tip, len = 0.26 }) {
  both((s) => {
    ctx.moveTo(x + len * 0.5, s * root);
    ctx.bezierCurveTo(x + len * 0.45, s * tip, x - len * 0.1, s * tip, x - len * 0.5, s * lerp(root, tip, 0.8));
    ctx.lineTo(x - len * 0.36, s * root);
    ctx.closePath();
  });
}

// ---------------------------------------------------------------------------------------------------
// Cabina (autos y camioneta): parabrisas, ventanillas, luneta y techo del color de la carrocería.
//
//   wr   rr                rf    wf        x →
//   |luneta|     techo      |parab.|       wrh, rrh, rfh, wfh: medio ancho en cada borde
//
// Las ventanillas van entre el borde del techo y la línea de cintura (gwR atrás, gwF adelante). Los huecos
// entre los vidrios son los parantes, que quedan del color de la carrocería.

function cabinShapes(c) {
  const xoF = lerp(c.rf, c.wf, c.aPillar ?? 0.62);
  const xoR = lerp(c.rr, c.wr, c.cPillar ?? 0.62);
  const inner = (x) => lerp(c.rrh, c.rfh, (x - c.rr) / (c.rf - c.rr)) + 0.05;
  const outer = (x) => lerp(c.gwR, c.gwF, (x - xoR) / (xoF - xoR));
  const pane = (xi0, xi1, xo0, xo1) => (s) => (ctx) => poly(ctx, [[xi0, inner(xi0)], [xi1, inner(xi1)], [xo1, outer(xo1)], [xo0, outer(xo0)]], s);
  const sides = c.bPillar == null
    ? [pane(c.rr + 0.05, c.rf - 0.05, xoR, xoF)]
    : [pane(c.rr + 0.05, c.bPillar - 0.04, xoR, c.bPillar - 0.04), pane(c.bPillar + 0.04, c.rf - 0.05, c.bPillar + 0.04, xoF)];
  return {
    windshield: (ctx) => shield(ctx, c.rf, c.rfh, c.wf, c.wfh, c.bowR, c.bowF),
    rear: (ctx) => shield(ctx, c.wr, c.wrh, c.rr, c.rrh, c.bowB, c.bowRr ?? c.bowB * 0.6),
    roof: (ctx) => shield(ctx, c.rr + 0.03, c.rrh - 0.02, c.rf - 0.03, c.rfh - 0.02, c.bowRr ?? c.bowB * 0.6, c.bowR),
    house: (ctx) => {
      ctx.moveTo(c.wr, c.wrh); ctx.lineTo(xoR, c.gwR); ctx.lineTo(xoF, c.gwF); ctx.lineTo(c.wf, c.wfh);
      ctx.quadraticCurveTo(c.wf + 2 * c.bowF, 0, c.wf, -c.wfh);
      ctx.lineTo(xoF, -c.gwF); ctx.lineTo(xoR, -c.gwR); ctx.lineTo(c.wr, -c.wrh);
      ctx.quadraticCurveTo(c.wr + 2 * c.bowB, 0, c.wr, c.wrh);
      ctx.closePath();
    },
    sides,
  };
}

function drawCabin(ctx, g, palette) {
  const c = g.cab;
  const k = g.cabin;
  // La cabina se apoya sobre la carrocería: una sombra difusa alrededor.
  for (let i = 0; i < 5; i++) line(ctx, ink(0.045), 0.34 - i * 0.06, k.house);
  glass(ctx, palette, k.windshield, c.rf, c.wf + c.bowF);
  if (c.wr < c.rr) glass(ctx, palette, k.rear, c.rr, c.wr + c.bowB, true, 0.1); // la luneta, más oscura: el frente es el vidrio claro
  for (const side of k.sides) both((s) => glass(ctx, palette, side(s), c.rr, c.wf, false));
  // Techo: más claro del lado de la luz, con su brillo nítido.
  within(ctx, k.roof, () => {
    const across = ctx.createLinearGradient(0, LIGHT * c.rfh, 0, -LIGHT * c.rfh);
    across.addColorStop(0, lit(0.3));
    across.addColorStop(0.55, lit(0.03));
    across.addColorStop(1, ink(0.14));
    fill(ctx, across, k.roof);
    pillow(ctx, k.roof, 0.14, 0.16, 4);
    const y = LIGHT * (Math.min(c.rrh, c.rfh) - 0.17);
    gloss(ctx, 0.6, 0.075, lerp(c.rr, c.rf, 0.3), y, lerp(c.rr, c.rf, 0.6), y, c.rf - 0.16, y);
    gloss(ctx, 0.6, 0.075, lerp(c.rr, c.rf, 0.14), y, lerp(c.rr, c.rf, 0.16), y, lerp(c.rr, c.rf, 0.18), y);
  });
}

// ---------------------------------------------------------------------------------------------------
// Geometría por tipo

const geometries = new Map();

function geometry(kind) {
  if (geometries.has(kind)) return geometries.get(kind);
  const size = VEHICLE_SIZES[kind];
  if (!size) throw new Error(`Tipo de vehículo desconocido: ${kind}`);
  const { L, W } = size;
  const build = BUILDERS[kind];
  if (!build) throw new Error(`Tipo de vehículo sin dibujo: ${kind}`);
  const g = build(L / 2 - MARGIN, W / 2 - MARGIN);
  geometries.set(kind, g);
  return g;
}

/** Arma un auto o camioneta a partir de su casco (`segs`), sus espejos y su cabina. */
function carLike(a, b, spec) {
  const outline = (ctx) => mirrored(ctx, [-a, 0], spec.segs);
  const body = (ctx) => { outline(ctx); mirrorLobes(ctx, spec.mirror); };
  const g = { a, b, outline, body, simpleBody: outline, ...spec, cabin: cabinShapes(spec.cab) };
  g.detail = (ctx, palette) => carDetail(ctx, g, palette);
  g.simpleDetail = (ctx, palette) => carSimpleDetail(ctx, g, palette);
  return g;
}

const BUILDERS = {
  // Auto propio: cupé deportiva. Capó largo con nervaduras, cabina corta y atrasada, cintura
  // marcada entre los guardabarros y alerón en la cola.
  player: (a, b) => carLike(a, b, {
    segs: [
      [-a, 0.56, -1.93, 0.9, -1.6, 0.94],
      [-1.42, 0.965, -1.3, b, -1.1, b],
      [-0.8, b, -0.55, 0.88, -0.1, 0.88],
      [0.3, 0.88, 0.62, 0.975, 1.05, 0.975],
      [1.52, 0.975, a, 0.78, a, 0],
    ],
    mirror: { x: 0.44, root: 0.86, tip: b, len: 0.3 },
    cab: { wf: 0.7, wfh: 0.73, bowF: 0.12, rf: 0.06, rfh: 0.56, bowR: 0.07, rr: -0.68, rrh: 0.53, wr: -1.2, wrh: 0.6, bowB: -0.1, gwF: 0.77, gwR: 0.74, aPillar: 0.45, cPillar: 0.4 },
    depth: 0.42,
    head: [[1.46, 1], [2, 1], [2, 0.3], [1.87, 0.38], [1.71, 0.6], [1.46, 0.83]],
    headCore: [1.82, 0.62, 0.055, 0.085],
    tailLamp: [[-2, 1], [-1.7, 1], [-1.76, 0.74], [-1.86, 0.4], [-2, 0.4]],
    tailCore: [[-2, 1], [-1.8, 1], [-1.85, 0.7], [-1.91, 0.5], [-2, 0.5]],
    under(ctx) {
      // Capó: nervaduras que bajan del parabrisas a la trompa.
      both((s) => {
        line(ctx, ink(0.26), 0.03, (c) => { c.moveTo(0.9, s * 0.56); c.bezierCurveTo(1.2, s * 0.54, 1.6, s * 0.4, 1.94, s * 0.2); });
        line(ctx, lit(0.2), 0.025, (c) => { c.moveTo(0.92, s * 0.525); c.bezierCurveTo(1.2, s * 0.505, 1.6, s * 0.37, 1.92, s * 0.17); });
      });
      soft(ctx, 1.34, LIGHT * 0.14, 0.52, 0.34, 0.34);
      gloss(ctx, 0.5, 0.07, 1.0, LIGHT * 0.76, 1.4, LIGHT * 0.78, 1.66, LIGHT * 0.62);
      gloss(ctx, 0.5, 0.07, 0.84, LIGHT * 0.75, 0.86, LIGHT * 0.755, 0.88, LIGHT * 0.76);
      // Guardabarros traseros: un brillo suave sobre cada hombro.
      soft(ctx, -1.15, LIGHT * 0.8, 0.4, 0.12, 0.3);
      // Alerón: su sombra sobre el baúl y el canto claro.
      fill(ctx, ink(0.2), (c) => rrect(c, -1.9, -0.84, 0.3, 1.68, 0.1));
      fill(ctx, ink(0.26), (c) => rrect(c, -1.84, -0.8, 0.17, 1.6, 0.07));
      line(ctx, lit(0.34), 0.03, (c) => { c.moveTo(-1.68, -0.74); c.lineTo(-1.68, 0.74); });
    },
    over(ctx) {
      // Toma de aire del paragolpes y la franja de luz que une las luces de cola.
      fill(ctx, ink(0.5), (c) => poly(c, [[2, 0.3], [1.9, 0.3], [1.94, 0], [1.9, -0.3], [2, -0.3]]));
      line(ctx, 'rgba(255,96,96,0.5)', 0.035, (c) => { c.moveTo(-1.93, -0.34); c.lineTo(-1.93, 0.34); });
    },
  }),

  // Auto del tráfico: compacto con portón trasero. Capó corto, techo largo con barras, cuatro puertas y
  // frente redondeado.
  car: (a, b) => carLike(a, b, {
    segs: [
      [-a, 0.7, -1.94, 0.93, -1.62, 0.95],
      [-1.4, 0.975, -1.0, 0.975, -0.6, 0.92],
      [-0.2, 0.87, 0.5, 0.87, 0.95, 0.94],
      [1.25, b, 1.5, 0.97, 1.62, 0.93],
      [1.86, 0.86, a, 0.74, a, 0],
    ],
    mirror: { x: 0.7, root: 0.86, tip: b, len: 0.28 },
    cab: { wf: 0.9, wfh: 0.75, bowF: 0.1, rf: 0.38, rfh: 0.61, bowR: 0.06, rr: -1.16, rrh: 0.6, wr: -1.6, wrh: 0.7, bowB: -0.07, gwF: 0.8, gwR: 0.8, bPillar: -0.36, aPillar: 0.7, cPillar: 0.5 },
    depth: 0.4,
    head: [[1.56, 1], [2, 1], [2, 0.44], [1.9, 0.46], [1.76, 0.6], [1.62, 0.84]],
    headCore: [1.83, 0.66, 0.06, 0.09],
    tailLamp: [[-2, 1], [-1.7, 1], [-1.78, 0.58], [-2, 0.52]],
    tailCore: [[-2, 1], [-1.82, 1], [-1.87, 0.66], [-2, 0.62]],
    under(ctx) {
      // Capó corto con dos pliegues y su brillo.
      both((s) => {
        line(ctx, ink(0.22), 0.03, (c) => { c.moveTo(1.04, s * 0.6); c.bezierCurveTo(1.4, s * 0.6, 1.7, s * 0.52, 1.94, s * 0.36); });
        line(ctx, lit(0.18), 0.025, (c) => { c.moveTo(1.06, s * 0.565); c.bezierCurveTo(1.4, s * 0.565, 1.7, s * 0.49, 1.92, s * 0.33); });
      });
      soft(ctx, 1.46, LIGHT * 0.14, 0.42, 0.4, 0.34);
      gloss(ctx, 0.5, 0.07, 1.16, LIGHT * 0.78, 1.5, LIGHT * 0.79, 1.7, LIGHT * 0.7);
      soft(ctx, -1.2, LIGHT * 0.84, 0.4, 0.1, 0.26);
    },
    over(ctx) {
      // Barras del techo, parrilla y paragolpes trasero.
      both((s) => {
        line(ctx, ink(0.5), 0.05, (c) => { c.moveTo(-1.0, s * 0.44); c.lineTo(0.2, s * 0.45); });
        line(ctx, lit(0.3), 0.02, (c) => { c.moveTo(-1.0, s * 0.44 + LIGHT * 0.02); c.lineTo(0.2, s * 0.45 + LIGHT * 0.02); });
      });
      fill(ctx, ink(0.5), (c) => poly(c, [[2, 0.38], [1.9, 0.38], [1.93, 0], [1.9, -0.38], [2, -0.38]]));
      line(ctx, ink(0.3), 0.03, (c) => { c.moveTo(-1.84, 0.5); c.quadraticCurveTo(-1.88, 0, -1.84, -0.5); });
    },
  }),

  // Camioneta: capó grande y cuadrado, cabina doble y caja de carga abierta, con pasarruedas y portón.
  van: (a, b) => carLike(a, b, {
    segs: [
      [-a, 0.92, -2.56, 1.04, -2.3, 1.05],
      [-1.9, 1.07, -1.5, 1.07, -1.0, 1.02],
      [-0.5, 0.97, 0.6, 0.97, 1.1, 1.01],
      [1.5, 1.05, 1.9, 1.07, 2.15, 1.04],
      [2.45, 1.0, a, 0.88, a, 0],
    ],
    mirror: { x: 1.0, root: 0.94, tip: b, len: 0.3 },
    cab: { wf: 1.26, wfh: 0.84, bowF: 0.08, rf: 0.74, rfh: 0.7, bowR: 0.05, rr: -0.3, rrh: 0.7, wr: -0.54, wrh: 0.78, bowB: -0.03, gwF: 0.9, gwR: 0.9, bPillar: 0.2, aPillar: 0.7, cPillar: 0.5 },
    depth: 0.46,
    head: [[2.2, 1.1], [2.6, 1.1], [2.6, 0.56], [2.44, 0.56], [2.36, 0.7], [2.2, 0.86]],
    headCore: [2.44, 0.76, 0.07, 0.11],
    tailLamp: [[-2.6, 1.1], [-2.42, 1.1], [-2.44, 0.7], [-2.6, 0.7]],
    tailCore: [[-2.6, 1.1], [-2.5, 1.1], [-2.51, 0.78], [-2.6, 0.78]],
    under(ctx) {
      // Capó con el centro levantado y su brillo.
      both((s) => {
        line(ctx, ink(0.24), 0.035, (c) => { c.moveTo(1.44, s * 0.58); c.bezierCurveTo(1.9, s * 0.58, 2.3, s * 0.54, 2.5, s * 0.46); });
        line(ctx, lit(0.18), 0.03, (c) => { c.moveTo(1.46, s * 0.54); c.bezierCurveTo(1.9, s * 0.54, 2.3, s * 0.5, 2.48, s * 0.42); });
      });
      soft(ctx, 1.95, LIGHT * 0.12, 0.5, 0.42, 0.32);
      gloss(ctx, 0.5, 0.08, 1.6, LIGHT * 0.84, 2.0, LIGHT * 0.86, 2.24, LIGHT * 0.8);
      gloss(ctx, 0.5, 0.08, 1.42, LIGHT * 0.83, 1.44, LIGHT * 0.835, 1.46, LIGHT * 0.84);
      bedDetail(ctx, this.bed);
    },
    bed: { x0: -2.4, x1: -0.7, hb: 0.86, well0: -1.98, well1: -1.22, wellH: 0.66 },
    over(ctx) {
      // Parrilla ancha.
      fill(ctx, ink(0.55), (c) => poly(c, [[2.6, 0.54], [2.49, 0.54], [2.51, 0], [2.49, -0.54], [2.6, -0.54]]));
    },
    simpleExtra(ctx) { fill(ctx, ink(0.5), (c) => rrect(c, -2.4, -0.86, 1.7, 1.72, 0.08)); },
  }),

  truck: buildTruck,
  motorcycle: buildMotorcycle,
};

// ---------------------------------------------------------------------------------------------------
// Autos y camioneta

function carDetail(ctx, g, palette) {
  within(ctx, g.body, () => {
    pillow(ctx, g.body, g.depth, 0.4);
    // Luz de costado y la cola apenas en sombra.
    const across = ctx.createLinearGradient(0, LIGHT * g.b, 0, -LIGHT * g.b);
    across.addColorStop(0, lit(0.16));
    across.addColorStop(0.5, lit(0));
    across.addColorStop(1, ink(0.16));
    fill(ctx, across, g.body);
    const along = ctx.createLinearGradient(-g.a, 0, g.a, 0);
    along.addColorStop(0, ink(0.2));
    along.addColorStop(0.3, ink(0));
    along.addColorStop(0.75, lit(0));
    along.addColorStop(1, lit(0.1));
    fill(ctx, along, g.body);
    g.under(ctx);
    drawCabin(ctx, g, palette);
    carLights(ctx, g, palette);
    g.over(ctx);
    // Espejos: un vidrio oscuro en la cara de atrás.
    const m = g.mirror;
    both((s) => line(ctx, ink(0.4), 0.05, (c) => { c.moveTo(m.x - m.len * 0.4, s * lerp(m.root, m.tip, 0.5)); c.lineTo(m.x - m.len * 0.4, s * m.tip); }));
    // Contorno oscuro, por dentro de la carrocería.
    line(ctx, ink(0.66), 0.1, g.body);
  });
}

function carLights(ctx, g, palette) {
  both((s) => {
    const [hx, hy, hrx, hry] = g.headCore;
    soft(ctx, hx - 0.06, s * hy, 0.4, 0.34, 0.34, '255,246,214');
    lamp(ctx, palette.headlight, (c) => poly(c, g.head, s));
    fill(ctx, lit(0.9), (c) => ellipse(c, hx, s * hy, hrx, hry));
    lamp(ctx, palette.taillight, (c) => poly(c, g.tailLamp, s));
    fill(ctx, TAIL_GLOW, (c) => poly(c, g.tailCore, s));
  });
}

function carSimpleDetail(ctx, g, palette) {
  const c = g.cab;
  within(ctx, g.outline, () => {
    line(ctx, ink(0.3), 0.36, g.outline);
    g.simpleExtra?.(ctx);
    fill(ctx, palette.glass, (k) => shield(k, c.rf - 0.1, c.rfh + 0.08, c.wf + 0.04, c.wfh + 0.08, c.bowR, c.bowF));
    both((s) => {
      const lens = (k) => poly(k, g.head, s);
      line(ctx, palette.headlight, 0.14, lens);
      fill(ctx, palette.headlight, lens);
    });
  });
}

/** Caja de carga de la camioneta: piso oscuro con nervaduras, pasarruedas, sombras de la cabina y de la baranda. */
function bedDetail(ctx, { x0, x1, hb, well0, well1, wellH }) {
  const bed = (c) => {
    c.moveTo(x0, -hb);
    for (const s of [-1, 1]) {
      const xs = s < 0 ? [well0, well0 + 0.1, well1 - 0.1, well1, x1] : [well1, well1 - 0.1, well0 + 0.1, well0, x0];
      if (s > 0) { c.lineTo(x1, s * hb); }
      c.lineTo(xs[0], s * hb);
      c.quadraticCurveTo(xs[0], s * wellH, xs[1], s * wellH);
      c.lineTo(xs[2], s * wellH);
      c.quadraticCurveTo(xs[3], s * wellH, xs[3], s * hb);
      c.lineTo(xs[4], s * hb);
    }
    c.closePath();
  };
  line(ctx, lit(0.22), 0.07, bed); // canto de la baranda
  fill(ctx, ink(0.62), bed);
  within(ctx, bed, () => {
    for (let y = -hb + 0.14; y < hb; y += 0.2) line(ctx, lit(0.08), 0.06, (c) => { c.moveTo(x0 + 0.08, y); c.lineTo(x1 - 0.06, y); });
    const cab = ctx.createLinearGradient(x1, 0, x1 - 0.6, 0);
    cab.addColorStop(0, ink(0.6));
    cab.addColorStop(1, ink(0));
    fill(ctx, cab, bed);
    const rail = ctx.createLinearGradient(0, LIGHT * hb, 0, LIGHT * (hb - 0.36));
    rail.addColorStop(0, ink(0.5));
    rail.addColorStop(1, ink(0));
    fill(ctx, rail, bed);
    line(ctx, ink(0.5), 0.05, bed);
  });
  // Portón: su junta.
  line(ctx, ink(0.3), 0.03, (c) => { c.moveTo(x0 - 0.06, -hb - 0.1); c.lineTo(x0 - 0.06, hb + 0.1); });
}

// ---------------------------------------------------------------------------------------------------
// Camión: cabina frontal (más angosta, para que entren los espejos), enganche y acoplado.

function buildTruck(a, b) {
  const cab0 = 2.86; // donde empieza la cabina
  const t1 = 2.46; // donde termina el acoplado
  const cb = 1.1; // medio ancho de la cabina
  const cabOutline = (ctx) => mirrored(ctx, [cab0, 0], [
    [cab0, 0.98, cab0 + 0.03, cb, cab0 + 0.22, cb],
    [3.6, cb, 4.2, cb, 4.48, cb],
    [4.82, cb, a, 0.96, a, 0],
  ]);
  const trailer = (ctx) => rrect(ctx, -a, -b, t1 + a, 2 * b, 0.1);
  const hitch = (ctx) => rrect(ctx, t1 - 0.1, -0.46, cab0 - t1 + 0.2, 0.92, 0.04);
  const mirror = { x: 4.42, root: cb - 0.06, tip: b, len: 0.34 };
  const simpleBody = (ctx) => { cabOutline(ctx); hitch(ctx); trailer(ctx); };
  const body = (ctx) => { simpleBody(ctx); mirrorLobes(ctx, mirror); };
  const windshield = (ctx) => shield(ctx, 4.36, 0.98, 4.74, 0.88, 0.05, 0.1);
  const head = [[4.7, 1.2], [5, 1.2], [5, 0.6], [4.9, 0.6], [4.8, 0.84]];
  const tailLamp = [[-5, 1.3], [-4.86, 1.3], [-4.86, 0.72], [-5, 0.72]];
  const g = { a, b, body, simpleBody };

  g.detail = (ctx, palette) => within(ctx, body, () => {
    pillow(ctx, body, 0.5, 0.4);
    const across = ctx.createLinearGradient(0, LIGHT * b, 0, -LIGHT * b);
    across.addColorStop(0, lit(0.14));
    across.addColorStop(0.5, lit(0));
    across.addColorStop(1, ink(0.16));
    fill(ctx, across, body);

    // Enganche: el chasis a la vista entre la cabina y el acoplado.
    fill(ctx, ink(0.78), (c) => c.rect(t1, -0.6, cab0 - t1, 1.2));
    both((s) => line(ctx, lit(0.22), 0.035, (c) => { c.moveTo(t1, s * 0.2); c.lineTo(cab0, s * 0.2); }));

    // Acoplado: la caja un poco más clara, con nervaduras, un brillo a lo largo y el marco.
    within(ctx, trailer, () => {
      fill(ctx, lit(0.07), trailer);
      const shine = ctx.createLinearGradient(0, LIGHT * 1.0, 0, LIGHT * 0.1);
      shine.addColorStop(0, lit(0));
      shine.addColorStop(0.45, lit(0.24));
      shine.addColorStop(1, lit(0));
      fill(ctx, shine, trailer);
      for (let x = -a + 0.36; x < t1 - 0.2; x += 0.33) {
        line(ctx, ink(0.2), 0.035, (c) => { c.moveTo(x, -b); c.lineTo(x, b); });
        line(ctx, lit(0.16), 0.03, (c) => { c.moveTo(x + 0.035, -b); c.lineTo(x + 0.035, b); });
      }
      const front = ctx.createLinearGradient(t1, 0, t1 - 0.5, 0);
      front.addColorStop(0, lit(0.14));
      front.addColorStop(1, lit(0));
      fill(ctx, front, trailer);
      line(ctx, ink(0.3), 0.04, (c) => rrect(c, -a + 0.1, -b + 0.1, t1 + a - 0.2, 2 * b - 0.2, 0.05));
      line(ctx, lit(0.2), 0.03, (c) => rrect(c, -a + 0.135, -b + 0.135, t1 + a - 0.27, 2 * b - 0.27, 0.04));
      both((s) => {
        lamp(ctx, palette.taillight, (c) => poly(c, tailLamp, s));
        fill(ctx, TAIL_GLOW, (c) => poly(c, [[-5, 1.3], [-4.93, 1.3], [-4.93, 0.8], [-5, 0.8]], s));
      });
      fill(ctx, ink(0.45), (c) => c.rect(-a, -0.66, 0.1, 1.32)); // paragolpes trasero
    });

    // Cabina: deflector sobre el techo, visera, parabrisas envolvente y luces de gálibo.
    within(ctx, cabOutline, () => {
      const along = ctx.createLinearGradient(cab0, 0, a, 0);
      along.addColorStop(0, ink(0.22));
      along.addColorStop(0.5, ink(0));
      along.addColorStop(1, lit(0.08));
      fill(ctx, along, cabOutline);
      const deflector = (c) => shield(c, cab0 + 0.1, 0.96, 3.98, 0.7, 0, 0.06);
      for (let i = 0; i < 4; i++) line(ctx, ink(0.05), 0.3 - i * 0.07, deflector);
      const rise = ctx.createLinearGradient(cab0, 0, 4.1, 0);
      rise.addColorStop(0, lit(0.28));
      rise.addColorStop(1, lit(0.04));
      fill(ctx, rise, deflector);
      within(ctx, deflector, () => {
        pillow(ctx, deflector, 0.2, 0.22, 4);
        gloss(ctx, 0.55, 0.08, 3.2, LIGHT * 0.62, 3.5, LIGHT * 0.58, 3.74, LIGHT * 0.52);
        gloss(ctx, 0.55, 0.08, 3.04, LIGHT * 0.65, 3.05, LIGHT * 0.65, 3.06, LIGHT * 0.65);
      });
      line(ctx, ink(0.3), 0.03, deflector);
      line(ctx, ink(0.18), 0.03, (c) => { c.moveTo(cab0 + 0.1, 0); c.lineTo(4.08, 0); });
      for (const y of [-0.6, -0.3, 0, 0.3, 0.6]) {
        fill(ctx, ink(0.5), (c) => ellipse(c, 4.26, y, 0.055));
        fill(ctx, palette.headlight, (c) => ellipse(c, 4.26, y, 0.035));
      }
      glass(ctx, palette, windshield, 4.36, 4.84);
      both((s) => glass(ctx, palette, (c) => poly(c, [[3.84, 0.97], [4.32, 0.99], [4.3, 1.06], [3.88, 1.06]], s), 3.8, 4.4, false));
      fill(ctx, ink(0.34), (c) => shield(c, 4.28, 1.0, 4.4, 0.98, 0.05, 0.05)); // visera
      both((s) => {
        soft(ctx, 4.76, s * 0.8, 0.34, 0.3, 0.24, '255,246,214');
        lamp(ctx, palette.headlight, (c) => poly(c, head, s));
        fill(ctx, lit(0.9), (c) => ellipse(c, 4.87, s * 0.8, 0.045, 0.1));
        // Escapes cromados detrás de la cabina.
        fill(ctx, ink(0.6), (c) => ellipse(c, cab0 + 0.14, s * 0.9, 0.085));
        fill(ctx, palette.bar, (c) => ellipse(c, cab0 + 0.14, s * 0.9, 0.06));
        fill(ctx, ink(0.75), (c) => ellipse(c, cab0 + 0.14, s * 0.9, 0.028));
      });
      fill(ctx, ink(0.5), (c) => poly(c, [[5, 0.58], [4.9, 0.58], [4.92, 0], [4.9, -0.58], [5, -0.58]])); // parrilla
    });
    both((s) => line(ctx, ink(0.4), 0.06, (c) => { c.moveTo(mirror.x - mirror.len * 0.4, s * (cb + 0.03)); c.lineTo(mirror.x - mirror.len * 0.4, s * b); }));
    line(ctx, ink(0.66), 0.1, body);
  });

  g.simpleDetail = (ctx, palette) => within(ctx, simpleBody, () => {
    line(ctx, ink(0.3), 0.4, simpleBody);
    fill(ctx, ink(0.78), (c) => c.rect(t1 - 0.06, -0.6, cab0 - t1 + 0.12, 1.2));
    fill(ctx, lit(0.1), trailer);
    fill(ctx, palette.glass, (c) => shield(c, 4.2, 1.0, 4.76, 0.9, 0.05, 0.1));
    both((s) => {
      const lens = (c) => poly(c, head, s);
      line(ctx, palette.headlight, 0.14, lens);
      fill(ctx, palette.headlight, lens);
    });
  });
  return g;
}

// ---------------------------------------------------------------------------------------------------
// Moto: la carrocería es la moto (guardabarros, carenado, tanque y cola) y el piloto con los brazos al
// manubrio, con la campera del mismo color. Vista de arriba hace una flecha ancha en los hombros. Las ruedas,
// el manubrio, las piernas y el casco blanco van en el detalle, de color fijo.

function buildMotorcycle(a, b) {
  const bike = (ctx) => {
    mirrored(ctx, [-0.86, 0], [
      [-0.86, 0.09, -0.82, 0.13, -0.64, 0.13],
      [-0.4, 0.13, -0.2, 0.12, -0.04, 0.15],
      [0.14, 0.19, 0.3, 0.21, 0.44, 0.2],
      [0.6, 0.19, 0.72, 0.12, 0.72, 0],
    ]);
  };
  const fender = (ctx) => rrect(ctx, 0.79, -0.085, 0.19, 0.17, 0.08);
  const rider = (ctx) => mirrored(ctx, [-0.38, 0], [
    [-0.38, 0.2, -0.32, 0.32, -0.15, 0.32],
    [-0.02, 0.32, 0.2, 0.37, 0.35, 0.41],
    [0.37, 0.38, 0.39, 0.35, 0.41, 0.31],
    [0.3, 0.29, 0.17, 0.22, 0.1, 0.15],
    [0.12, 0.1, 0.12, 0.05, 0.12, 0],
  ]);
  const body = (ctx) => { bike(ctx); fender(ctx); rider(ctx); };
  const frame = (ctx) => ctx.rect(-a, -b, 2 * a, 2 * b);
  const helmetX = 0.03;
  const g = { a, b, body, simpleBody: body };

  g.detail = (ctx, palette) => {
    // Ruedas: asoman detrás de la cola y delante del carenado (el guardabarros la tapa en el medio).
    fill(ctx, palette.tire, (c) => { rrect(c, -a, -0.08, 0.34, 0.16, 0.075); rrect(c, 0.66, -0.065, 0.17, 0.13, 0.03); rrect(c, 0.94, -0.065, a - 0.94, 0.13, 0.06); });
    fill(ctx, lit(0.14), (c) => rrect(c, -a + 0.03, LIGHT * 0.05 - 0.015, 0.2, 0.03, 0.015));
    // Escape cromado, de un lado.
    line(ctx, ink(0.8), 0.1, (c) => { c.moveTo(-0.84, -LIGHT * 0.19); c.lineTo(-0.5, -LIGHT * 0.17); });
    line(ctx, '#8d96a3', 0.06, (c) => { c.moveTo(-0.84, -LIGHT * 0.19); c.lineTo(-0.5, -LIGHT * 0.17); });
    line(ctx, lit(0.5), 0.02, (c) => { c.moveTo(-0.82, -LIGHT * 0.19 + LIGHT * 0.012); c.lineTo(-0.54, -LIGHT * 0.17 + LIGHT * 0.012); });

    // La moto, donde no la tapa el piloto.
    within(ctx, (c) => { frame(c); rider(c); }, () => within(ctx, (c) => { bike(c); fender(c); }, () => {
      const shape = (c) => { bike(c); fender(c); };
      pillow(ctx, shape, 0.1, 0.3, 5);
      soft(ctx, 0.3, LIGHT * 0.05, 0.26, 0.1, 0.5); // brillo del tanque
      gloss(ctx, 0.6, 0.035, 0.18, LIGHT * 0.09, 0.3, LIGHT * 0.11, 0.42, LIGHT * 0.1);
      gloss(ctx, 0.5, 0.03, 0.83, LIGHT * 0.03, 0.88, LIGHT * 0.035, 0.93, LIGHT * 0.03);
      // Parabrisas del carenado.
      glass(ctx, palette, (c) => shield(c, 0.5, 0.15, 0.63, 0.09, 0.02, 0.04), 0.5, 0.68, false);
      // Asiento y luz de cola.
      fill(ctx, ink(0.6), (c) => rrect(c, -0.66, -0.09, 0.4, 0.18, 0.07));
      fill(ctx, palette.taillight, (c) => c.rect(-0.9, -0.09, 0.07, 0.18));
      fill(ctx, TAIL_GLOW, (c) => c.rect(-0.9, -0.05, 0.04, 0.1));
      line(ctx, ink(0.6), 0.05, shape);
    }), 'evenodd');
    // Faro, en la punta del carenado.
    fill(ctx, ink(0.6), (c) => ellipse(c, 0.69, 0, 0.055, 0.085));
    fill(ctx, palette.headlight, (c) => ellipse(c, 0.695, 0, 0.04, 0.07));

    // Piernas: las rodillas asoman a los costados del tanque.
    both((s) => {
      line(ctx, palette.rider, 0.12, (c) => { c.moveTo(-0.02, s * 0.2); c.quadraticCurveTo(0.12, s * 0.26, 0.24, s * 0.23); });
      line(ctx, lit(0.1), 0.04, (c) => { c.moveTo(0.04, s * 0.22 + LIGHT * 0.025); c.quadraticCurveTo(0.13, s * 0.25 + LIGHT * 0.025, 0.22, s * 0.23 + LIGHT * 0.025); });
    });
    // Manubrio claro, de lado a lado, con el tablero en el medio.
    line(ctx, ink(0.7), 0.1, (c) => { c.moveTo(0.37, -0.36); c.quadraticCurveTo(0.43, 0, 0.37, 0.36); });
    line(ctx, palette.bar, 0.065, (c) => { c.moveTo(0.37, -0.36); c.quadraticCurveTo(0.43, 0, 0.37, 0.36); });
    fill(ctx, ink(0.8), (c) => ellipse(c, 0.42, 0, 0.06, 0.08));

    // El piloto: la campera un poco más oscura que la moto, con el brillo en el hombro.
    within(ctx, rider, () => {
      fill(ctx, ink(0.1), rider);
      pillow(ctx, rider, 0.12, 0.34, 5);
      soft(ctx, -0.18, LIGHT * 0.2, 0.16, 0.09, 0.4);
      gloss(ctx, 0.4, 0.035, 0.04, LIGHT * 0.29, 0.14, LIGHT * 0.315, 0.24, LIGHT * 0.34);
      line(ctx, ink(0.25), 0.025, (c) => { c.moveTo(-0.36, 0); c.lineTo(-0.1, 0); }); // costura de la espalda
      line(ctx, ink(0.6), 0.05, rider);
    });
    // Guantes sobre los puños.
    both((s) => {
      fill(ctx, palette.rider, (c) => ellipse(c, 0.375, s * 0.355, 0.055, 0.055));
      fill(ctx, lit(0.14), (c) => ellipse(c, 0.385, s * 0.355 + LIGHT * 0.015, 0.025, 0.02));
    });

    // Casco blanco con visera: el punto claro que la distingue a lo lejos.
    const helmet = (c) => ellipse(c, helmetX, 0, 0.18, 0.168);
    fill(ctx, ink(0.75), (c) => ellipse(c, helmetX, 0, 0.205, 0.193));
    fill(ctx, palette.helmet, helmet);
    within(ctx, helmet, () => {
      pillow(ctx, helmet, 0.07, 0.22, 4);
      fill(ctx, palette.visor, (c) => { c.moveTo(helmetX + 0.1, -0.2); c.quadraticCurveTo(helmetX + 0.15, 0, helmetX + 0.1, 0.2); c.lineTo(helmetX + 0.3, 0.2); c.lineTo(helmetX + 0.3, -0.2); c.closePath(); });
      line(ctx, 'rgba(140,196,250,0.5)', 0.02, (c) => { c.moveTo(helmetX + 0.125, LIGHT * 0.1); c.quadraticCurveTo(helmetX + 0.16, LIGHT * 0.05, helmetX + 0.165, 0); });
      line(ctx, ink(0.3), 0.035, (c) => { c.moveTo(helmetX - 0.17, 0); c.lineTo(helmetX + 0.08, 0); }); // franja
      soft(ctx, helmetX - 0.03, LIGHT * 0.07, 0.07, 0.05, 0.9);
    });
  };

  g.simpleDetail = (ctx, palette) => {
    fill(ctx, palette.tire, (c) => { rrect(c, -a, -0.1, 0.34, 0.2, 0.08); rrect(c, 0.7, -0.09, a - 0.7, 0.18, 0.06); });
    fill(ctx, palette.helmet, (c) => ellipse(c, helmetX, 0, 0.2, 0.2));
    fill(ctx, palette.headlight, (c) => ellipse(c, 0.66, 0, 0.1, 0.12));
  };
  return g;
}

// ---------------------------------------------------------------------------------------------------
// Capas

/** Sombra suave que sigue la silueta: trazos anchos de poca opacidad. Va debajo de la carrocería. */
export function drawShadow(ctx, kind) {
  const g = geometry(kind);
  for (const [f, alpha] of [[1, 0.07], [0.72, 0.08], [0.45, 0.1], [0.2, 0.12]]) {
    line(ctx, `rgba(0,0,0,${alpha})`, 2 * (MARGIN + SHADOW_REACH * f), g.body);
  }
}

/** Carrocería: una sola forma, del color de ctx.fillStyle (la máscara que se pinta con el color del papel). */
export function drawBody(ctx, kind) {
  ctx.beginPath();
  geometry(kind).body(ctx);
  ctx.fill();
}

/** Carrocería simplificada (zoom lejano): la silueta sin espejos. */
export function drawBodySimple(ctx, kind) {
  ctx.beginPath();
  geometry(kind).simpleBody(ctx);
  ctx.fill();
}

/** Detalle: volumen, brillos, vidrios, luces, caja de carga, acoplado y piloto. */
export function drawDetail(ctx, kind, palette = DEFAULT_PALETTE) {
  geometry(kind).detail(ctx, { ...DEFAULT_PALETTE, ...palette });
}

/** Detalle simplificado: lo que marca el frente (parabrisas y faros) y lo que distingue al tipo. */
export function drawDetailSimple(ctx, kind, palette = DEFAULT_PALETTE) {
  geometry(kind).simpleDetail(ctx, { ...DEFAULT_PALETTE, ...palette });
}
