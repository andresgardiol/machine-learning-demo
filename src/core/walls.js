// Muros del tráfico, medidos sobre el generador solo, sin simular autos (trafico-vivo D6).
//
// Un muro es un instante en que, en algún punto de la calle, cada carril tiene un vehículo cuyo
// contorno queda a menos de medio largo de auto de ese punto. A lo largo de la calle, el vehículo de
// largo L y centro c "tapa" el intervalo (c − L/2 − CAR_LENGTH/2, c + L/2 + CAR_LENGTH/2). Hay muro
// cuando los intervalos de un vehículo por carril se cruzan todos, y en una recta eso pasa si y solo
// si se cruzan de a dos (Helly). Como todo avanza a velocidad constante, cada par se cruza durante un
// intervalo de tiempo exacto: el cálculo es exacto. El zigzag no cambia la ocupación a lo largo.
//
// Dos vehículos del mismo carril nunca tapan a la vez un mismo punto (los separa el hueco mínimo,
// mayor que un largo de auto), así que todo muro tiene exactamente un vehículo del carril más lento
// y uno del más rápido, y dura a lo sumo lo que se cruzan esos dos:
// (L_lento + L_rápido + 2·CAR_LENGTH) / (v_rápido − v_lento), 7 s con dos camiones de 10 m (D2).
import { CAR_LENGTH } from './constants.js';

/** Medio intervalo que tapa un vehículo a lo largo de la calle (m). */
export const reachOf = (v) => v.length / 2 + CAR_LENGTH / 2;

/**
 * Intervalo de tiempo (abierto) en que los vehículos `a` y `b` tapan a la vez algún punto.
 * Cada uno con `base` (centro en el instante 0), `length` y `speed`. Null si nunca.
 */
export function pairWindow(a, b) {
  const H = reachOf(a) + reachOf(b);
  const d0 = b.base - a.base;
  const dv = b.speed - a.speed;
  if (dv === 0) return Math.abs(d0) < H ? [-Infinity, Infinity] : null;
  const t0 = (-H - d0) / dv;
  const t1 = (H - d0) / dv;
  return t0 < t1 ? [t0, t1] : [t1, t0];
}

/** Intervalo de tiempo en que un punto que avanza a `speed` desde `start` queda dentro de lo que tapa `v`. */
function pointWindow(v, speed, start) {
  // Un punto "tapa" medio largo de auto menos que un vehículo de largo 0: queda |c − x| < reachOf(v).
  return pairWindow({ base: start, length: -CAR_LENGTH, speed }, v);
}

const cut = (w, x) => (w && x ? [Math.max(w[0], x[0]), Math.min(w[1], x[1])] : null);
const empty = (w) => !w || !(w[0] < w[1]);

/**
 * Muros del tráfico. Recorre los vehículos del carril más lento con base en [from, to] y, para
 * cada uno, los del carril más rápido que lo cruzan entre el instante 0 y `tMax`; después cruza con
 * los carriles del medio. Los intervalos de un mismo par lento-rápido que se tocan se unen (es una
 * cota por arriba de la duración real).
 * @param {object} traffic tráfico (de createTraffic o changeTraffic)
 * @param {{from:number, to:number, tMax:number, car?:{speed:number, start?:number}}} options `car`: un
 *   auto que va derecho a esa velocidad desde `start`; cada muro dice si lo encuentra en su camino.
 * @returns {{start:number, end:number, duration:number, met:boolean}[]} ordenados por comienzo
 */
export function findWalls(traffic, { from, to, tMax, car = null }) {
  const speeds = traffic.laneSpeeds;
  const lanes = speeds.length;
  const order = speeds.map((v, i) => i).sort((a, b) => speeds[a] - speeds[b]);
  const slow = order[0];
  const fast = order[lanes - 1];
  const middle = order.slice(1, lanes - 1);
  const Hmax = traffic.maxLength + CAR_LENGTH;
  const withSpeed = (v) => ({ ...v, speed: speeds[v.lane] });
  const walls = [];
  for (const s0 of traffic.laneBases(slow, from, to)) {
    const s = withSpeed(s0);
    const dv = speeds[fast] - speeds[slow];
    for (const f0 of traffic.laneBases(fast, s.base - dv * tMax - Hmax, s.base + Hmax)) {
      const f = withSpeed(f0);
      const w = cut(pairWindow(s, f), [0, Infinity]);
      if (empty(w) || w[0] > tMax) continue;
      const pieces = [];
      const explore = (k, chosen, span) => {
        if (empty(span)) return;
        if (k === middle.length) { pieces.push({ span, chosen }); return; }
        const lane = middle[k];
        const v = speeds[lane];
        // Bases de los vehículos del carril que pueden tapar lo mismo que `s` durante `span`.
        const lo = Math.min(s.base + s.speed * span[0] - v * span[0], s.base + s.speed * span[1] - v * span[1]) - Hmax;
        const hi = Math.max(s.base + s.speed * span[0] - v * span[0], s.base + s.speed * span[1] - v * span[1]) + Hmax;
        for (const m0 of traffic.laneBases(lane, lo, hi)) {
          const m = withSpeed(m0);
          let next = span;
          for (const o of [s, f, ...chosen]) next = cut(next, pairWindow(o, m));
          explore(k + 1, [...chosen, m], next);
        }
      };
      explore(0, [], w);
      pieces.sort((a, b) => a.span[0] - b.span[0]);
      let current = null;
      for (const p of pieces) {
        const met = car ? !empty([s, f, ...p.chosen].reduce((acc, v) => cut(acc, pointWindow(v, car.speed, car.start ?? 0)), p.span)) : false;
        if (current && p.span[0] <= current.end) {
          current.end = Math.max(current.end, p.span[1]);
          current.met ||= met;
        } else {
          if (current) walls.push(current);
          current = { start: p.span[0], end: p.span[1], met };
        }
      }
      if (current) walls.push(current);
    }
  }
  for (const w of walls) w.duration = w.end - w.start;
  return walls.sort((a, b) => a.start - b.start);
}

/**
 * ¿Hay un muro en el instante `t` en algún punto de [from, to]? Cruza, carril por carril, lo que
 * tapan sus vehículos en ese tramo.
 */
export function wallAt(traffic, t, from, to) {
  const reach = traffic.maxLength / 2 + CAR_LENGTH / 2;
  const list = traffic.vehicles(t, from - reach, to + reach);
  let region = [[from, to]];
  for (let lane = 0; lane < traffic.laneSpeeds.length; lane++) {
    const covered = list.filter((v) => v.lane === lane).map((v) => [v.distance - reachOf(v), v.distance + reachOf(v)]);
    const next = [];
    for (const [a, b] of region) for (const [c, d] of covered) { const x = Math.max(a, c); const y = Math.min(b, d); if (x < y) next.push([x, y]); }
    region = next;
    if (region.length === 0) return false;
  }
  return true;
}
