// Azar con semilla. Nada en el núcleo usa Math.random.

const toUint32 = (n) => n >>> 0;

/** Generador mulberry32: devuelve una función que entrega números en [0, 1). */
export function createRandom(seed) {
  let state = toUint32(seed);
  return function next() {
    state = toUint32(state + 0x6d2b79f5);
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return toUint32(t ^ (t >>> 14)) / 4294967296;
  };
}

/** Semilla derivada de una semilla y un índice: misma entrada, misma salida. */
export function deriveSeed(seed, index) {
  let h = toUint32(seed) ^ Math.imul(toUint32(index) + 1, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return toUint32(h ^ (h >>> 16));
}

/** Generador propio del índice `index` bajo `seed`. */
export const randomFor = (seed, index) => createRandom(deriveSeed(seed, index));
