// Semilla del tráfico de la pestaña 5 (trafico-al-azar-en-inspeccionar, design.md D1), sin DOM.
// La comparten Inspeccionar (V1) y Entender (V2).
//
//   al armar el intento   fresh(): una semilla nueva, al azar y distinta de la actual
//   al reiniciar          forRestart(): con 'new', otra nueva; con 'repeat', la misma
//   repeticiones          (Atrás, deslizador, Reintentar desde acá) no tocan la semilla
//
// El azar vive acá, en la capa de pestaña: el núcleo recibe la semilla y sigue siendo determinista.
// `random` se inyecta en las pruebas.

/** Mayor semilla posible: 2³¹ − 1. */
export const MAX_TRAFFIC_SEED = 2 ** 31 - 1;
/** Valores de la opción "Tráfico". */
export const TRAFFIC_MODES = Object.freeze(['new', 'repeat']);

/** ¿La pista tiene tráfico, y por eso se ofrece la opción "Tráfico"? Solo la calle recta. */
export const showsTrafficOption = (trackId) => trackId === 'straight';

/**
 * @param {{random?: () => number}} [options] fuente de azar en [0, 1)
 */
export function createTrafficSeed({ random = Math.random } = {}) {
  const pick = () => 1 + Math.min(MAX_TRAFFIC_SEED - 1, Math.floor(random() * MAX_TRAFFIC_SEED));
  let current = null;
  let mode = 'new';
  /** Una semilla nueva, distinta de la actual; pasa a ser la actual. */
  function fresh() {
    let s = pick();
    for (let tries = 0; s === current && tries < 8; tries++) s = pick();
    if (s === current) s = current === MAX_TRAFFIC_SEED ? 1 : current + 1; // un `random` que se repite
    current = s;
    return current;
  }
  return {
    get current() { return current; },
    get mode() { return mode; },
    /** Cambia la opción; rige desde el próximo reinicio. */
    setMode(m) {
      if (!TRAFFIC_MODES.includes(m)) throw new RangeError(`modo de tráfico desconocido: ${m}`);
      mode = m;
    },
    fresh,
    /** Semilla para reiniciar: otra con 'new', la actual con 'repeat' (o una nueva si todavía no hay). */
    forRestart() { return mode === 'repeat' && current !== null ? current : fresh(); },
  };
}
