// Guarda de destellos (sin-destellos-en-la-red, design.md D2), pura y sin DOM: decide qué brillo se
// muestra de cada elemento de la red (neurona, conexión o tecla de la decisión) para que ninguno cambie
// mucho más de tres veces en un segundo (WCAG 2.3.1).
//
//   - Un "cambio grande" es un recorrido de `swing` (0,5) o más: desde el último cambio contado, entre el
//     menor y el mayor brillo mostrado hay 0,5 o más. (Contar contra un solo nivel de referencia, como
//     decía D2, deja pasar una oscilación de 0,34 a 0,88 alrededor de 0,6 sin contar nunca.)
//   - Los tres primeros cambios grandes de un segundo se muestran exactos.
//   - El que sería el cuarto no se muestra: el elemento pasa a "titubea" (`flicker`) y se muestra el
//     promedio de los últimos `averageMs` (500 ms), pesado por tiempo.
//   - Sale de "titubea" cuando el valor de verdad no tuvo ningún cambio grande en `calmMs` (1 s).
//
// La cuenta se lleva sobre lo que se muestra, no sobre el valor: así entrar en "titubea" tampoco es un
// cuarto destello. Lo que se muestra es el nivel y el rayado: que el rayado aparezca o se vaya pesa
// `mark` (0,15) en el recorrido. Si mostrar el promedio sería un cambio grande y ya hubo tres en el
// segundo, se muestra lo más cerca del promedio que no lo es, y el promedio se alcanza en cuanto vence
// el primero de esos tres.
//
// La cuenta tiene `tolerance` (0,03) de margen: desde 0,47 ya es un cambio grande, para que uno que
// mide justo 0,5 en pantalla (con el redondeo de los píxeles) no se escape.
//
// La ventana lleva `slackMs` (100 ms) de margen: un cuarto cambio justo a 1 s del primero, visto con
// un cuadro de diferencia, sería un cuarto en el mismo segundo.
//
// Los cambios se miden en brillo: `brightness(nivel)` (por omisión, el nivel mismo) y su inversa
// `levelOf`. Las neuronas se rellenan con 0,15 + 0,85 × nivel y nada en 0 (`FILL`): de 0 a 0,42 ya es
// medio rango de brillo.
//
// Cada elemento lleva además cuánto del último segundo estuvo de cada lado (para la tarjeta, D5).
// El reloj lo pasa quien llama (`nowMs`): misma secuencia, mismo resultado.

export const FLASH_GUARD = Object.freeze({ maxFlips: 3, windowMs: 1000, swing: 0.5, averageMs: 500, calmMs: 1000, mark: 0.15, slackMs: 100, tolerance: 0.03 });

/** Lo que se acerca, como mucho, al borde de un cambio grande sin contarlo. */
const MARGIN = 0.01;

/**
 * Brillo del relleno de una neurona (network-inspector y network-view): nada en 0; si no, opacidad
 * 0,15 + 0,85 × nivel. `levelOf` es la inversa (lo que cae entre 0 y 0,15 va al menor nivel encendido).
 */
export const FILL = Object.freeze({
  brightness: (level) => (level > 0 ? 0.15 + 0.85 * Math.min(1, level) : 0),
  levelOf: (b) => (b <= 0 ? 0 : b <= 0.15 ? 1e-6 : Math.min(1, (b - 0.15) / 0.85)),
});
const SAME = Object.freeze({ brightness: (x) => x, levelOf: (x) => x });

/**
 * @param {Partial<typeof FLASH_GUARD> & {fill?: {brightness:(l:number)=>number, levelOf:(b:number)=>number}}} [options]
 * @returns {{show:(key:string, level:number, nowMs:number) => {level:number, flicker:boolean, average:number},
 *   sides:(key:string, nowMs:number) => ({low:number, high:number, highShare:number}|null),
 *   flickering:(key:string) => boolean, reset:() => void, size:() => number}}
 */
export function createFlashGuard(options = {}) {
  const { maxFlips, windowMs, averageMs, calmMs, mark, slackMs, tolerance } = { ...FLASH_GUARD, ...options };
  const swing = ({ ...FLASH_GUARD, ...options }).swing - tolerance; // desde acá cuenta
  const { brightness: B, levelOf } = options.fill ?? SAME;
  const keep = Math.max(averageMs, windowMs);
  /**
   * key → { samples:[{t, v}], lo, hi (brillo mostrado desde el último cambio contado), refFlicker (si
   * titubeaba ahí), flips:number[], rawLo, rawHi, lastRawFlip, flicker }
   */
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
      const b = B(v);
      s = { samples: [{ t: nowMs, v }], lo: b, hi: b, refFlicker: false, flips: [], rawLo: b, rawHi: b, lastRawFlip: -Infinity, flicker: false };
      items.set(key, s);
      return { level: v, flicker: false, average: v };
    }
    // Muestras: las que todavía valen dentro de lo que se mira (más una anterior, que cubre el comienzo).
    s.samples.push({ t: nowMs, v });
    while (s.samples.length > 2 && s.samples[1].t <= nowMs - keep) s.samples.shift();
    while (s.flips.length > 0 && s.flips[0] <= nowMs - windowMs - slackMs) s.flips.shift();
    // Cambios grandes del valor de verdad (por recorrido): para saber cuándo se calmó.
    const bv = B(v);
    s.rawLo = Math.min(s.rawLo, bv);
    s.rawHi = Math.max(s.rawHi, bv);
    if (s.rawHi - s.rawLo >= swing) { s.rawLo = bv; s.rawHi = bv; s.lastRawFlip = nowMs; }
    // Recorrido de lo que se ve desde lo último contado, si se mostrara `lv`: el brillo y, si el rayado
    // aparece o se va, lo que pesa.
    const change = (lv, fl) => Math.max(s.hi, B(lv)) - Math.min(s.lo, B(lv)) + (fl !== s.refFlicker ? mark : 0);
    // Calmo: vuelve a lo exacto, si mostrarlo no es un cuarto cambio grande (si lo es, espera a que se pueda).
    if (s.flicker && nowMs - s.lastRawFlip >= calmMs && (change(v, false) < swing || s.flips.length < maxFlips)) s.flicker = false;
    const average = averageOf(s.samples, nowMs - averageMs, nowMs);
    let shown = s.flicker ? average : v;
    if (change(shown, s.flicker) >= swing) {
      if (s.flips.length < maxFlips) {
        s.flips.push(nowMs);
        s.lo = B(shown);
        s.hi = B(shown);
        s.refFlicker = s.flicker;
        return { level: shown, flicker: s.flicker, average };
      }
      // Sería el cuarto: titubea, y se muestra el promedio sin llegar a un cambio grande.
      s.flicker = true;
      const edge = swing - (s.refFlicker ? 0 : mark) - MARGIN;
      shown = levelOf(Math.min(s.lo + edge, Math.max(s.hi - edge, B(average))));
    }
    s.lo = Math.min(s.lo, B(shown));
    s.hi = Math.max(s.hi, B(shown));
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
