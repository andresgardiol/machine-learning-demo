// La recta de una neurona de dos entradas en el plano (seccion-teoria; viene de la cuenta de "Una
// neurona" en teoria-prototipos D3), sin DOM. Funciones puras: la usan la figura del plano, la cuenta de
// "Una neurona" y la de "Una recta no alcanza".
//
//   recta del plano: w1·x + w2·y + sesgo = 0 (de un lado la salida es 1, del otro 0)

const sinMenosCero = (v) => (Object.is(v, -0) ? 0 : v);

/**
 * Recta del plano donde la suma vale 0: w1·x + w2·y + sesgo = 0. Función pura.
 * - w2 ≠ 0: { tipo: 'funcion', pendiente, ordenada } con y = pendiente·x + ordenada (horizontal si w1 = 0).
 * - w2 = 0 y w1 ≠ 0: { tipo: 'vertical', x }.
 * - w1 = w2 = 0: no hay recta; { tipo: 'ninguna', salida }: todo el plano da la misma salida.
 * Salvo en 'ninguna', `normal` = [w1, w2] apunta hacia el lado donde la salida es 1.
 */
export function rectaDelPlano({ pesos: [w1, w2], sesgo }) {
  if (w2 !== 0) {
    return { tipo: 'funcion', pendiente: sinMenosCero(-w1 / w2), ordenada: sinMenosCero(-sesgo / w2), normal: [w1, w2] };
  }
  if (w1 !== 0) return { tipo: 'vertical', x: sinMenosCero(-sesgo / w1), normal: [w1, w2] };
  return { tipo: 'ninguna', salida: sesgo > 0 ? 1 : 0 };
}

/**
 * Tramo de la recta que cae dentro de una caja, para dibujarlo: [[x, y], [x, y]], o null si la recta no
 * existe o no pasa por la caja. Función pura.
 * @param {ReturnType<typeof rectaDelPlano>} recta
 * @param {{xMin: number, xMax: number, yMin: number, yMax: number}} caja
 */
export function tramoEnCaja(recta, { xMin, xMax, yMin, yMax }) {
  if (recta.tipo === 'ninguna') return null;
  if (recta.tipo === 'vertical') {
    return recta.x >= xMin && recta.x <= xMax ? [[recta.x, yMin], [recta.x, yMax]] : null;
  }
  const { pendiente: m, ordenada: b } = recta;
  if (m === 0) return b >= yMin && b <= yMax ? [[xMin, b], [xMax, b]] : null;
  // Recorta el intervalo de x para que y quede dentro de [yMin, yMax].
  const xEnY = (y) => (y - b) / m;
  const [xa, xb] = [xEnY(yMin), xEnY(yMax)].sort((p, q) => p - q);
  const desde = Math.max(xMin, xa);
  const hasta = Math.min(xMax, xb);
  if (desde > hasta) return null;
  return [[desde, m * desde + b], [hasta, m * hasta + b]];
}
