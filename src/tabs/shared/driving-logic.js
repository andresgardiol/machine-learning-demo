// Lógica sin DOM de las piezas de manejo (lecturas de las barras, acciones, coincidencia con la red).
// Se separó de driving-cards.js para que la V2 la use sin importar la pantalla de la V1 (interfaz-v2,
// design.md D5, excepción justificada); driving-cards.js la vuelve a exportar y la V1 no cambia.

/** Con más sensores que este, las barras se muestran sin su número (ni su nombre) debajo. */
export const READINGS_MAX = 12;

export const ACTIONS = Object.freeze(['forward', 'reverse', 'left', 'right']);

const round2 = (v) => Math.round((Number(v) || 0) * 100) / 100 || 0;

/**
 * Lecturas que se escriben como número debajo de las barras: la de cada sensor (solo con hasta
 * `max` sensores; si no, null) y la de la velocidad (siempre, de −1 a 1), redondeadas a dos decimales.
 * @param {{sensors:number[], speed:number}} perception
 * @returns {{sensors:number[]|null, speed:number}}
 */
export function readings(perception, { max = READINGS_MAX } = {}) {
  const sensors = perception.sensors.length <= max ? perception.sensors.map(round2) : null;
  return { sensors, speed: round2(perception.speed) };
}


// --- Tu decisión y la de la red (manejar-vos-en-inspeccionar D4) ------------------------------------

/** Cuadros de la cola de coincidencia: 10 s a 60 cuadros por segundo (el paso fijo de la simulación). */
export const MATCH_FRAMES = 600;
/** Entre dos anuncios al lector de la comparación, como mínimo (ms). */
export const COMPARE_ANNOUNCE_MS = 2000;

/** ¿Coinciden las cuatro acciones? */
export const sameControls = (a, b) => ACTIONS.every((k) => Boolean(a?.[k]) === Boolean(b?.[k]));

/**
 * Cola circular de los últimos `size` cuadros: en cada uno, si las cuatro acciones coincidieron. Sin DOM.
 * `percent()` es la parte de los cuadros guardados que coincidieron, redondeada a un entero (null sin cuadros).
 */
export function createMatchWindow(size = MATCH_FRAMES) {
  const ring = new Uint8Array(size);
  let count = 0;
  let next = 0;
  let matches = 0;
  return {
    push(match) {
      const v = match ? 1 : 0;
      if (count === size) matches -= ring[next]; else count += 1;
      ring[next] = v;
      matches += v;
      next = (next + 1) % size;
    },
    get count() { return count; },
    get matches() { return matches; },
    percent() { return count === 0 ? null : Math.round((100 * matches) / count); },
    reset() { ring.fill(0); count = 0; next = 0; matches = 0; },
  };
}

/**
 * Cuándo anunciar la comparación al lector: cuando cambia lo apretado o lo que haría la red (`key`), y
 * como mucho una vez cada `interval` ms. Un cambio que llega antes de tiempo se anuncia en la primera
 * consulta después del intervalo, si sigue distinto de lo último anunciado. Sin DOM.
 */
export function createCompareAnnouncer({ interval = COMPARE_ANNOUNCE_MS } = {}) {
  let said = null;
  let at = -Infinity;
  return {
    /** ¿Hay que anunciar ahora? Si devuelve true, `key` queda como lo último anunciado. */
    offer(key, now) {
      if (key === said || now - at < interval) return false;
      said = key;
      at = now;
      return true;
    },
    reset() { said = null; at = -Infinity; },
  };
}
