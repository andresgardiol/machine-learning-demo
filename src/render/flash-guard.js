// Guarda de destellos (sin-destellos-en-la-red, design.md D2), pura y sin DOM: decide qué brillo se
// muestra de cada elemento de la red (neurona, conexión o tecla de la decisión) para que ninguno cambie
// mucho más de tres veces en un segundo (WCAG 2.3.1).
//
//   - Un "cambio grande" es alejarse `swing` (0,5) o más del último nivel mostrado que se contó.
//   - Los tres primeros cambios grandes de un segundo se muestran exactos.
//   - El que sería el cuarto no se muestra: el elemento pasa a "titubea" (`flicker`) y se muestra el
//     promedio de los últimos `averageMs` (500 ms), pesado por tiempo.
//   - Sale de "titubea" cuando el valor de verdad no tuvo ningún cambio grande en `calmMs` (1 s).
//
// La cuenta se lleva sobre lo que se muestra, no sobre el valor: así entrar en "titubea" tampoco es un
// cuarto destello. Si el promedio queda a `swing` o más de lo último contado y ya hubo tres cambios en
// el segundo, se muestra lo más cerca del promedio que no cuenta como cambio grande, y el promedio
// alcanza al valor en cuanto vence el primero de esos tres.
//
// Cada elemento lleva además cuánto del último segundo estuvo de cada lado (para la tarjeta, D5).
// El reloj lo pasa quien llama (`nowMs`): misma secuencia, mismo resultado.

export const FLASH_GUARD = Object.freeze({ maxFlips: 3, windowMs: 1000, swing: 0.5, averageMs: 500, calmMs: 1000 });

/** Lo que se acerca, como mucho, al borde de un cambio grande sin contarlo. */
const MARGIN = 0.01;

/**
 * @param {Partial<typeof FLASH_GUARD>} [options]
 * @returns {{show:(key:string, level:number, nowMs:number) => {level:number, flicker:boolean, average:number},
 *   sides:(key:string, nowMs:number) => ({low:number, high:number, highShare:number}|null),
 *   flickering:(key:string) => boolean, reset:() => void, size:() => number}}
 */
export function createFlashGuard(options = {}) {
  const { maxFlips, windowMs, swing, averageMs, calmMs } = { ...FLASH_GUARD, ...options };
  const keep = Math.max(averageMs, windowMs);
  /** key → { samples:[{t, v}], shownRef, shown, flips:number[], rawRef, lastRawFlip, flicker } */
  const items = new Map();

  /** Promedio pesado por tiempo entre `from` y `now`: cada muestra vale hasta la siguiente. */
  function averageOf(samples, from, now) {
    let sum = 0;
    let span = 0;
    for (let i = 0; i < samples.length; i++) {
      const a = Math.max(from, samples[i].t);
      const b = i + 1 < samples.length ? samples[i + 1].t : now;
      if (b > a) { sum += samples[i].v * (b - a); span += b - a; }
    }
    return span > 0 ? sum / span : samples[samples.length - 1].v;
  }

  function show(key, level, nowMs) {
    const v = Number(level) || 0;
    let s = items.get(key);
    if (!s) {
      s = { samples: [{ t: nowMs, v }], shownRef: v, shown: v, flips: [], rawRef: v, lastRawFlip: -Infinity, flicker: false };
      items.set(key, s);
      return { level: v, flicker: false, average: v };
    }
    // Muestras: las que todavía valen dentro de lo que se mira (más una anterior, que cubre el comienzo).
    s.samples.push({ t: nowMs, v });
    while (s.samples.length > 2 && s.samples[1].t <= nowMs - keep) s.samples.shift();
    while (s.flips.length > 0 && s.flips[0] <= nowMs - windowMs) s.flips.shift();
    // Cambios grandes del valor de verdad: para saber cuándo se calmó.
    if (Math.abs(v - s.rawRef) >= swing) { s.rawRef = v; s.lastRawFlip = nowMs; }
    // Calmo: vuelve a lo exacto, si mostrarlo no es un cuarto cambio grande (si lo es, espera a que se pueda).
    if (s.flicker && nowMs - s.lastRawFlip >= calmMs && (Math.abs(v - s.shownRef) < swing || s.flips.length < maxFlips)) s.flicker = false;
    const average = averageOf(s.samples, nowMs - averageMs, nowMs);
    let shown = s.flicker ? average : v;
    if (Math.abs(shown - s.shownRef) >= swing) {
      if (s.flips.length < maxFlips) {
        s.flips.push(nowMs);
        s.shownRef = shown;
      } else {
        // Sería el cuarto: titubea, y se muestra el promedio sin llegar a un cambio grande.
        s.flicker = true;
        const edge = swing - MARGIN;
        shown = Math.abs(average - s.shownRef) >= swing ? Math.min(s.shownRef + edge, Math.max(s.shownRef - edge, average)) : average;
      }
    }
    s.shown = shown;
    return { level: shown, flicker: s.flicker, average };
  }

  /**
   * Cuánto del último segundo estuvo el valor de cada lado (D5): el menor y el mayor valor vistos y la
   * parte del tiempo más cerca del mayor. Null si no hay muestras.
   */
  function sides(key, nowMs) {
    const s = items.get(key);
    if (!s) return null;
    const from = nowMs - windowMs;
    let low = Infinity;
    let high = -Infinity;
    for (let i = 0; i < s.samples.length; i++) {
      const b = i + 1 < s.samples.length ? s.samples[i + 1].t : nowMs;
      if (b <= from && i + 1 < s.samples.length) continue;
      low = Math.min(low, s.samples[i].v);
      high = Math.max(high, s.samples[i].v);
    }
    const mid = (low + high) / 2;
    let upper = 0;
    let span = 0;
    for (let i = 0; i < s.samples.length; i++) {
      const a = Math.max(from, s.samples[i].t);
      const b = i + 1 < s.samples.length ? s.samples[i + 1].t : nowMs;
      if (b <= a) continue;
      span += b - a;
      if (high > low && s.samples[i].v > mid) upper += b - a;
    }
    return { low, high, highShare: high > low && span > 0 ? upper / span : 1 };
  }

  return {
    show,
    sides,
    flickering: (key) => Boolean(items.get(key)?.flicker),
    /** Vuelve a lo exacto: en pausa, en el paso a paso o con otra red. */
    reset() { items.clear(); },
    size: () => items.size,
  };
}
