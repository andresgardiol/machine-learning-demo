// Dibujos de los vehículos ilustrados (vehiculos-ilustrados D1, D2 y D4; estilo elegido: «A · Brillo»).
//
// Cada vehículo se dibuja en metros y en ejes locales (x hacia adelante, y hacia la izquierda), centrado en su
// rectángulo de choque de L × W. Son funciones que trazan sobre un contexto de canvas; no tocan el DOM, no
// guardan estado ni importan nada fuera de core. El caché (D3) las usa para armar cada imagen una vez:
//   1. sombra (drawShadow): lo único que sale del rectángulo, hasta SHADOW_REACH y tenue;
//   2. carrocería (drawBody): una máscara de un solo color, el de ctx.fillStyle, que se pinta con el del papel
//      (verde propio, ámbar del tráfico, competidores o choque);
//   3. detalle (drawDetail): neutro (negros y blancos con transparencia) más vidrios, luces y piloto de color
//      fijo, así sirve con cualquier carrocería.
// Con menos de SIMPLE_BELOW píxeles físicos por metro van las versiones simplificadas (drawBodySimple y
// drawDetailSimple): la forma, el parabrisas y los faros, que siguen marcando el frente.
//
// Honestidad (spec "Lo que se ve es lo que choca"): todos los puntos de control de la carrocería, del detalle y
// de la versión simplificada quedan dentro del rectángulo, a MARGIN o más del borde. Las curvas de Bézier no
// salen de la envolvente de sus puntos de control, así que si los puntos están adentro, el dibujo también. Lo
// comprueba tests/vehicles.test.js.

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
});

const RIM = 0.07; // ancho del borde oscuro, recortado por dentro de la carrocería (m)
const RIM_ALPHA = 0.45;
const SHADOW_ALPHA = 0.22;

// ---------------------------------------------------------------------------------------------------
// Trazos auxiliares (agregan subtrazos al camino actual)

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
 * Casco: entre x0 y x1, medio ancho b, esquinas de radio rr (cola) y rf (trompa), cola y trompa algo más
 * angostas (tail y nose, fracción de b) y una cintura opcional de `waist` en xw.
 */
function hull(ctx, x0, x1, b, { rr = 0.4, rf = 0.5, nose = 0.8, tail = 0.9, waist = 0, xw = (x0 + x1) / 2 } = {}) {
  const r0 = x0 + rr, f0 = x1 - rf;
  const segs = [[x0, b * tail, x0 + rr * 0.2, b, r0, b]];
  if (waist > 0) {
    segs.push([r0 + (xw - r0) * 0.5, b, xw - (xw - r0) * 0.35, b - waist, xw, b - waist]);
    segs.push([xw + (f0 - xw) * 0.35, b - waist, f0 - (f0 - xw) * 0.5, b, f0, b]);
  } else {
    segs.push([r0 + (f0 - r0) / 3, b, f0 - (f0 - r0) / 3, b, f0, b]);
  }
  segs.push([x1 - rf * 0.2, b, x1, b * nose, x1, 0]);
  mirrored(ctx, [x0, 0], segs);
}

/** Vidrio: trapecio con medio ancho h0 en x0 y h1 en x1, con los bordes de adelante y de atrás algo curvos. */
function pane(ctx, x0, h0, x1, h1, bow0 = 0.06, bow1 = 0.08) {
  ctx.moveTo(x0, -h0);
  ctx.bezierCurveTo(x0 + (x1 - x0) * 0.4, -h0 - (h1 - h0) * 0.4, x1 - (x1 - x0) * 0.2, -h1, x1, -h1);
  ctx.quadraticCurveTo(x1 + bow1, 0, x1, h1);
  ctx.bezierCurveTo(x1 - (x1 - x0) * 0.2, h1, x0 + (x1 - x0) * 0.4, h0 + (h1 - h0) * 0.4, x0, h0);
  ctx.quadraticCurveTo(x0 - bow0, 0, x0, -h0);
  ctx.closePath();
}

/** Ventanilla lateral entre xa y xb, con el borde de adentro en y = sy·y0 y el de afuera t más allá. */
function sideWindow(ctx, xa, xb, y0, t, sy) {
  ctx.moveTo(xa, sy * y0);
  ctx.lineTo(xb, sy * y0);
  ctx.lineTo(xb - 0.1, sy * (y0 + t));
  ctx.lineTo(xa + 0.06, sy * (y0 + t));
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

function ellipse(ctx, x, y, rx, ry, rot = 0) {
  ctx.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot));
  ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
}

function fillPath(ctx, style, draw) {
  ctx.beginPath();
  draw();
  ctx.fillStyle = style;
  ctx.fill();
}

/** Espejos pegados al costado, dentro del rectángulo: un lóbulo a cada lado, de `inner` hasta `outer`. */
function mirrors(ctx, x, inner, outer) {
  for (const s of [1, -1]) {
    ctx.moveTo(x + 0.1, s * (inner - 0.04));
    ctx.bezierCurveTo(x + 0.08, s * outer, x - 0.12, s * outer, x - 0.14, s * (inner - 0.04));
    ctx.closePath();
  }
}

// ---------------------------------------------------------------------------------------------------
// Geometría por tipo

const geometries = new Map();

function geometry(kind) {
  if (geometries.has(kind)) return geometries.get(kind);
  const size = VEHICLE_SIZES[kind];
  if (!size) throw new Error(`Tipo de vehículo desconocido: ${kind}`);
  const { L, W } = size;
  const a = L / 2 - MARGIN;
  const b = W / 2 - MARGIN;
  const g = { L, W, a, b };
  switch (kind) {
    case 'player':
      // Deportivo: trompa larga con dos franjas, cabina corta y atrasada, cintura marcada.
      g.body = (ctx) => {
        hull(ctx, -a, a, b, { rr: 0.45, rf: 0.65, nose: 0.66, tail: 0.86, waist: 0.1, xw: -0.2 });
        mirrors(ctx, 0.5, b - 0.1, b);
      };
      g.windshield = [-0.02, b - 0.26, 0.62, b - 0.38];
      g.roof = [-0.82, -0.02, b - 0.3];
      g.rear = [-1.3, b - 0.38, -0.82, b - 0.3];
      g.hood = [0.8, 1.7, b * 0.5];
      g.head = { x: a - 0.17, y: b * 0.62, len: 0.26, wid: 0.13, tilt: 0.45 };
      g.tail = { x: -a + 0.09, y: b * 0.66, len: 0.13, wid: 0.32 };
      g.stripes = true;
      g.simple = { nose: 0.7, rf: 0.6, rr: 0.4 };
      break;
    case 'car':
      // Compacto: cabina alta y larga hasta casi la cola, frente más chato, sin cintura.
      g.body = (ctx) => {
        hull(ctx, -a, a, b, { rr: 0.38, rf: 0.42, nose: 0.86, tail: 0.92 });
        mirrors(ctx, 0.84, b - 0.06, b);
      };
      g.windshield = [0.22, b - 0.2, 0.78, b - 0.27];
      g.roof = [-1.3, 0.22, b - 0.22];
      g.rear = [-1.74, b - 0.26, -1.3, b - 0.22];
      g.hood = [0.95, 1.7, b * 0.6];
      g.head = { x: a - 0.13, y: b * 0.66, len: 0.2, wid: 0.22, tilt: 0.2 };
      g.tail = { x: -a + 0.08, y: b * 0.7, len: 0.12, wid: 0.3 };
      g.simple = { nose: 0.86, rf: 0.42, rr: 0.38 };
      break;
    case 'van':
      // Camioneta: cabina adelante y caja de carga abierta atrás.
      g.body = (ctx) => {
        hull(ctx, -a, a, b, { rr: 0.22, rf: 0.45, nose: 0.86, tail: 0.98 });
        mirrors(ctx, 1.18, b - 0.06, b);
      };
      g.windshield = [0.62, b - 0.2, 1.22, b - 0.28];
      g.roof = [-0.15, 0.62, b - 0.22];
      g.rear = [-0.32, b - 0.24, -0.15, b - 0.22];
      g.hood = [1.45, 2.3, b * 0.6];
      g.bed = [-a + 0.14, -0.48, b - 0.13];
      g.head = { x: a - 0.13, y: b * 0.68, len: 0.2, wid: 0.24, tilt: 0.15 };
      g.tail = { x: -a + 0.07, y: b * 0.76, len: 0.1, wid: 0.3 };
      g.simple = { nose: 0.86, rf: 0.45, rr: 0.22 };
      break;
    case 'truck': {
      // Camión: cabina adelante (más angosta, para que entren los espejos), el enganche y el acoplado.
      const cabB = b - 0.1;
      const cab0 = 2.42;
      g.body = (ctx) => {
        hull(ctx, cab0, a, cabB, { rr: 0.1, rf: 0.38, nose: 0.92, tail: 1 });
        mirrors(ctx, 4.15, cabB - 0.04, b);
        rrect(ctx, -a, -b, cab0 - 0.28 + a, 2 * b, 0.14);
        rrect(ctx, cab0 - 0.36, -0.22, 0.4, 0.44, 0.06); // enganche
      };
      g.windshield = [3.95, cabB - 0.16, 4.52, cabB - 0.24];
      g.roof = [cab0 + 0.12, 3.95, cabB - 0.18];
      g.sideFrom = 3.3;
      g.cab0 = cab0;
      g.cabB = cabB;
      g.trailer = [-a, cab0 - 0.28, b];
      g.head = { x: a - 0.12, y: cabB * 0.72, len: 0.18, wid: 0.26, tilt: 0.1 };
      g.tail = { x: -a + 0.07, y: b * 0.78, len: 0.1, wid: 0.34 };
      break;
    }
    case 'motorcycle':
      // Moto: la carrocería es la moto (guardabarros, carenado, tanque y cola) y los hombros del piloto, con
      // su ropa del mismo color: así la silueta tiene forma de cruz y se distingue de un punto. El manubrio
      // claro y el casco blanco van en el detalle.
      g.body = (ctx) => {
        hull(ctx, 0.6, a, 0.09, { rr: 0.08, rf: 0.18, nose: 0.6, tail: 1 }); // guardabarros delantero
        hull(ctx, 0.1, 0.86, 0.22, { rr: 0.1, rf: 0.28, nose: 0.5, tail: 0.9 }); // carenado
        hull(ctx, -0.5, 0.2, 0.36, { rr: 0.3, rf: 0.22, nose: 0.55, tail: 0.5 }); // hombros y espalda
        hull(ctx, -a, -0.3, 0.14, { rr: 0.12, rf: 0.1, nose: 1, tail: 0.6 }); // cola
      };
      g.head = { x: a - 0.36, y: 0 };
      g.tail = { x: -a + 0.06, y: 0 };
      break;
    default:
      throw new Error(`Tipo de vehículo sin dibujo: ${kind}`);
  }
  geometries.set(kind, g);
  return g;
}

// ---------------------------------------------------------------------------------------------------
// Capas

/** Sombra suave: tres capas apenas más grandes que el vehículo, de poca opacidad. */
export function drawShadow(ctx, kind) {
  const { L } = VEHICLE_SIZES[kind];
  const W = kind === 'motorcycle' ? 0.72 : VEHICLE_SIZES[kind].W; // la moto: la del cuerpo, no la del manubrio
  for (const [e, f] of [[SHADOW_REACH, 0.25], [SHADOW_REACH * 0.6, 0.35], [SHADOW_REACH * 0.25, 0.45]]) {
    fillPath(ctx, `rgba(0,0,0,${(SHADOW_ALPHA * f).toFixed(3)})`,
      () => rrect(ctx, -L / 2 - e, -W / 2 - e, L + 2 * e, W + 2 * e, Math.min(0.5, W * 0.35) + e));
  }
}

/** Carrocería: una sola forma, del color de ctx.fillStyle (la máscara que se pinta con el color del papel). */
export function drawBody(ctx, kind) {
  ctx.beginPath();
  geometry(kind).body(ctx);
  ctx.fill();
}

/** Carrocería simplificada (zoom lejano): la forma sin espejos, con la trompa más angosta que la cola. */
export function drawBodySimple(ctx, kind) {
  const g = geometry(kind);
  ctx.beginPath();
  if (kind === 'motorcycle') hull(ctx, -g.a, g.a, 0.3, { rr: 0.35, rf: 0.6, nose: 0.4, tail: 0.6, waist: 0.08, xw: 0.35 });
  else if (kind === 'truck') {
    hull(ctx, g.cab0, g.a, g.cabB, { rr: 0.1, rf: 0.38, nose: 0.92, tail: 1 });
    rrect(ctx, -g.a, -g.b, g.cab0 - 0.1 + g.a, 2 * g.b, 0.14);
  } else hull(ctx, -g.a, g.a, g.b, { ...g.simple, tail: 0.95 });
  ctx.fill();
}

/** Detalle simplificado: lo que marca el frente. El parabrisas oscuro y los faros; en la moto, casco y faro. */
export function drawDetailSimple(ctx, kind, palette = DEFAULT_PALETTE) {
  const g = geometry(kind);
  if (kind === 'motorcycle') {
    fillPath(ctx, palette.helmet, () => ellipse(ctx, 0.05, 0, 0.2, 0.2));
    fillPath(ctx, palette.headlight, () => ellipse(ctx, g.a - 0.22, 0, 0.16, 0.12));
    return;
  }
  const [x0, h0, x1, h1] = g.windshield;
  fillPath(ctx, palette.glass, () => pane(ctx, x0 - 0.05, h0 + 0.04, x1 + 0.05, h1 + 0.04, 0.02, 0.04));
  const h = g.head;
  fillPath(ctx, palette.headlight, () => { for (const s of [1, -1]) ellipse(ctx, g.a - 0.16, s * h.y, 0.14, 0.2); });
}

/** Detalle: volumen, brillos, vidrios, luces, caja de carga, acoplado y piloto. */
export function drawDetail(ctx, kind, palette = DEFAULT_PALETTE) {
  const g = geometry(kind);
  if (kind === 'motorcycle') { motorcycleDetail(ctx, g, palette); return; }
  const body = () => g.body(ctx);

  // Volumen: los costados más oscuros, el centro libre; la cola apenas en sombra.
  const side = ctx.createLinearGradient(0, -g.b, 0, g.b);
  side.addColorStop(0, 'rgba(0,0,0,0.42)');
  side.addColorStop(0.2, 'rgba(0,0,0,0.1)');
  side.addColorStop(0.5, 'rgba(0,0,0,0)');
  side.addColorStop(0.8, 'rgba(0,0,0,0.1)');
  side.addColorStop(1, 'rgba(0,0,0,0.42)');
  fillPath(ctx, side, body);
  const len = ctx.createLinearGradient(-g.a, 0, g.a, 0);
  len.addColorStop(0, 'rgba(0,0,0,0.22)');
  len.addColorStop(0.12, 'rgba(0,0,0,0)');
  len.addColorStop(0.9, 'rgba(0,0,0,0)');
  len.addColorStop(1, 'rgba(0,0,0,0.12)');
  fillPath(ctx, len, body);

  if (kind === 'truck') truckDetail(ctx, g);
  else if (kind === 'van') bedDetail(ctx, g);

  // Capó: brillo especular.
  if (g.hood) {
    const [h0, h1, hw] = g.hood;
    const cx = (h0 + h1) / 2;
    const hl = ctx.createRadialGradient(cx, hw * 0.25, 0, cx, hw * 0.25, (h1 - h0) * 0.65);
    hl.addColorStop(0, 'rgba(255,255,255,0.36)');
    hl.addColorStop(1, 'rgba(255,255,255,0)');
    fillPath(ctx, hl, () => ellipse(ctx, cx, hw * 0.25, (h1 - h0) / 2, hw * 0.75));
  }
  if (g.stripes) {
    fillPath(ctx, 'rgba(255,255,255,0.3)', () => { for (const y of [-0.15, 0.07]) rrect(ctx, 0.7, y, g.a - 0.88, 0.08, 0.04); });
  }

  // Cabina: ventanillas laterales, techo, parabrisas y luneta.
  const [r0, r1, rw] = g.roof;
  const [w0, wh0] = g.windshield;
  const xa = g.sideFrom ?? g.rear[2] - 0.02;
  const xb = w0 + 0.02;
  const xm = (xa + xb) / 2;
  const t = Math.min(0.13, g.b - rw - 0.04);
  fillPath(ctx, palette.glass, () => {
    for (const sy of [1, -1]) {
      if (g.sideFrom != null) { sideWindow(ctx, xa, xb, rw, t, sy); continue; }
      sideWindow(ctx, xa, xm - 0.04, rw, t, sy);
      sideWindow(ctx, xm + 0.04, xb, rw, t, sy);
    }
  });
  fillPath(ctx, 'rgba(0,0,0,0.14)', () => rrect(ctx, r0 - 0.03, -rw - 0.03, r1 - r0 + 0.06, 2 * rw + 0.06, 0.24));
  fillPath(ctx, 'rgba(255,255,255,0.06)', () => rrect(ctx, r0, -rw, r1 - r0, 2 * rw, 0.22));
  const rg = ctx.createLinearGradient(0, rw, 0, -rw);
  rg.addColorStop(0, 'rgba(255,255,255,0.28)');
  rg.addColorStop(0.45, 'rgba(255,255,255,0.04)');
  rg.addColorStop(1, 'rgba(0,0,0,0.12)');
  fillPath(ctx, rg, () => rrect(ctx, r0 + 0.03, -rw + 0.03, r1 - r0 - 0.06, 2 * rw - 0.06, 0.2));
  glassPane(ctx, g.windshield, palette, true);
  if (g.rear) glassPane(ctx, g.rear, palette, false);

  // Luces
  const h = g.head, tl = g.tail;
  for (const s of [1, -1]) {
    fillPath(ctx, palette.headlight, () => ellipse(ctx, h.x, s * h.y, h.len / 2, h.wid / 2, s * h.tilt));
    fillPath(ctx, 'rgba(255,255,255,0.7)', () => ellipse(ctx, h.x + h.len * 0.12, s * h.y, h.len * 0.18, h.wid * 0.18));
    fillPath(ctx, palette.taillight, () => rrect(ctx, tl.x - tl.len / 2, s * tl.y - tl.wid / 2, tl.len, tl.wid, Math.min(tl.len, tl.wid) / 2));
    fillPath(ctx, 'rgba(255,90,90,0.55)', () => rrect(ctx, tl.x - tl.len * 0.2, s * tl.y - tl.wid * 0.3, tl.len * 0.4, tl.wid * 0.6, tl.len * 0.2));
  }
  rim(ctx, body, RIM);
}

/** Borde oscuro por dentro de la carrocería: el trazo va recortado a la forma, así no sale de ella. */
function rim(ctx, body, width) {
  ctx.save();
  ctx.beginPath(); body(); ctx.clip();
  ctx.beginPath(); body();
  ctx.lineWidth = width;
  ctx.lineJoin = 'round';
  ctx.strokeStyle = `rgba(8,10,14,${RIM_ALPHA})`;
  ctx.stroke();
  ctx.restore();
}

function glassPane(ctx, [x0, h0, x1, h1], palette, front) {
  fillPath(ctx, palette.glass, () => pane(ctx, x0, h0, x1, h1));
  ctx.save();
  ctx.beginPath(); pane(ctx, x0, h0, x1, h1); ctx.clip();
  // Reflejo: una banda clara en diagonal, y el vidrio un poco más celeste hacia adelante.
  const d = x1 - x0;
  const y0 = front ? h1 * 0.15 : -h1 * 0.2;
  ctx.beginPath();
  ctx.moveTo(x0 + d * 0.15, y0 + h0 * 0.9);
  ctx.lineTo(x0 + d * 0.45, y0 + h0 * 0.9);
  ctx.lineTo(x0 + d * 0.95, y0 - h1 * 0.3);
  ctx.lineTo(x0 + d * 0.65, y0 - h1 * 0.3);
  ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.17)';
  ctx.fill();
  const gl = ctx.createLinearGradient(x0, 0, x1, 0);
  gl.addColorStop(0, 'rgba(120,170,220,0)');
  gl.addColorStop(1, 'rgba(120,170,220,0.18)');
  ctx.fillStyle = gl;
  ctx.beginPath(); pane(ctx, x0, h0, x1, h1); ctx.fill();
  ctx.restore();
}

function bedDetail(ctx, g) {
  // Caja de carga: el piso oscuro con nervaduras a lo largo, y la sombra de la cabina sobre él.
  const [x0, x1, hb] = g.bed;
  const bed = () => rrect(ctx, x0, -hb, x1 - x0, 2 * hb, 0.06);
  fillPath(ctx, 'rgba(0,0,0,0.5)', bed);
  ctx.save();
  ctx.beginPath(); bed(); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.09)';
  for (let y = -hb + 0.22; y < hb - 0.1; y += 0.32) ctx.fillRect(x0 + 0.06, y, x1 - x0 - 0.12, 0.08);
  const sh = ctx.createLinearGradient(x1, 0, x1 - 0.5, 0);
  sh.addColorStop(0, 'rgba(0,0,0,0.45)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sh;
  ctx.fillRect(x0, -hb, x1 - x0, 2 * hb);
  ctx.restore();
}

function truckDetail(ctx, g) {
  // Techo del acoplado: nervaduras transversales y un brillo a lo largo.
  const [t0, t1, tb] = g.trailer;
  ctx.save();
  ctx.beginPath(); rrect(ctx, t0, -tb, t1 - t0, 2 * tb, 0.14); ctx.clip();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let x = t0 + 0.55; x < t1 - 0.3; x += 0.62) ctx.fillRect(x, -tb + 0.1, 0.07, 2 * tb - 0.2);
  const gl = ctx.createLinearGradient(0, tb, 0, -tb);
  gl.addColorStop(0, 'rgba(255,255,255,0.22)');
  gl.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = gl;
  ctx.fillRect(t0, -tb, t1 - t0, 2 * tb);
  ctx.restore();
  // Deflector sobre el techo de la cabina: un trapecio más claro.
  fillPath(ctx, 'rgba(255,255,255,0.12)', () => pane(ctx, g.cab0 + 0.15, g.cabB - 0.18, g.cab0 + 0.9, g.cabB - 0.3, 0, 0.1));
}

function motorcycleDetail(ctx, g, palette) {
  const body = () => g.body(ctx);
  // Ruedas que asoman adelante y atrás.
  fillPath(ctx, palette.tire, () => { rrect(ctx, 0.84, -0.055, g.a - 0.84, 0.11, 0.05); rrect(ctx, -g.a, -0.065, 0.3, 0.13, 0.06); });
  // Volumen
  const side = ctx.createLinearGradient(0, -0.32, 0, 0.32);
  side.addColorStop(0, 'rgba(0,0,0,0.42)');
  side.addColorStop(0.5, 'rgba(0,0,0,0)');
  side.addColorStop(1, 'rgba(0,0,0,0.42)');
  fillPath(ctx, side, body);
  // El piloto, un poco más oscuro que la moto, para separarlos; un brillo en la espalda.
  fillPath(ctx, 'rgba(0,0,0,0.3)', () => hull(ctx, -0.5, 0.2, 0.36, { rr: 0.3, rf: 0.22, nose: 0.55, tail: 0.5 }));
  fillPath(ctx, 'rgba(255,255,255,0.18)', () => ellipse(ctx, -0.25, 0.12, 0.16, 0.1));
  // Parabrisas del carenado
  fillPath(ctx, palette.glass, () => pane(ctx, 0.52, 0.14, 0.7, 0.09, 0.02, 0.05));
  // Manubrio claro, de lado a lado, con los puños: lo que más la distingue a lo lejos.
  fillPath(ctx, palette.bar, () => {
    rrect(ctx, 0.28, -g.b + 0.02, 0.15, 2 * g.b - 0.04, 0.07);
  });
  fillPath(ctx, palette.tire, () => { rrect(ctx, 0.26, g.b - 0.12, 0.19, 0.1, 0.05); rrect(ctx, 0.26, -g.b + 0.02, 0.19, 0.1, 0.05); });
  // Casco blanco con visera
  fillPath(ctx, palette.helmet, () => ellipse(ctx, 0.02, 0, 0.19, 0.18));
  fillPath(ctx, palette.visor, () => pane(ctx, 0.1, 0.13, 0.19, 0.08, 0, 0.02));
  fillPath(ctx, 'rgba(255,255,255,0.8)', () => ellipse(ctx, -0.04, 0.07, 0.06, 0.04));
  // Luces
  fillPath(ctx, palette.headlight, () => ellipse(ctx, g.head.x, 0, 0.07, 0.08));
  fillPath(ctx, palette.taillight, () => rrect(ctx, g.tail.x - 0.035, -0.06, 0.07, 0.12, 0.03));
  rim(ctx, body, RIM * 0.6);
}
