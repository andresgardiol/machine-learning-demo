// La zona del plano donde la neurona se enciende (teoria-prototipos D3), sin DOM: el polígono que queda
// al recortar una caja con el semiplano w1·x + w2·y + sesgo > 0. Función pura, probada en tests/.

/**
 * @param {{pesos: [number, number], sesgo: number}} valores
 * @param {{xMin: number, xMax: number, yMin: number, yMax: number}} caja
 * @returns {Array<[number, number]>} vértices en orden; [] si en la caja no se enciende nada
 */
export function zonaEncendida({ pesos: [w1, w2], sesgo }, { xMin, xMax, yMin, yMax }) {
  const suma = ([x, y]) => w1 * x + w2 * y + sesgo;
  const esquinas = [[xMin, yMin], [xMax, yMin], [xMax, yMax], [xMin, yMax]];
  const salida = [];
  for (let i = 0; i < esquinas.length; i++) {
    const a = esquinas[i];
    const b = esquinas[(i + 1) % esquinas.length];
    const sa = suma(a);
    const sb = suma(b);
    if (sa > 0) salida.push(a);
    if ((sa > 0) !== (sb > 0)) {
      const t = sa / (sa - sb);
      salida.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  return salida.length >= 3 ? salida : [];
}

/** Las cuatro esquinas de una caja, en orden: el polígono del que parten los recortes. */
export const cajaComoPoligono = ({ xMin, xMax, yMin, yMax }) => [[xMin, yMin], [xMax, yMin], [xMax, yMax], [xMin, yMax]];

/**
 * Recorta un polígono convexo con un lado de la recta de una neurona: el lado donde se enciende
 * (suma > 0) o el otro (suma ≤ 0). Función pura. Sirve para dibujar la zona que queda entre dos rectas,
 * o la de una red de dos capas, recortando una vez por neurona.
 * @param {Array<[number, number]>} poligono vértices en orden
 * @param {{pesos: [number, number], sesgo: number}} valores
 * @param {boolean} [encendida] true: el lado donde la neurona da 1; false: donde da 0
 * @returns {Array<[number, number]>} vértices en orden; [] si no queda nada
 */
export function recortar(poligono, { pesos: [w1, w2], sesgo }, encendida = true) {
  if (poligono.length < 3) return [];
  const suma = ([x, y]) => w1 * x + w2 * y + sesgo;
  const dentro = (v) => (encendida ? v > 0 : v <= 0);
  const salida = [];
  for (let i = 0; i < poligono.length; i++) {
    const a = poligono[i];
    const b = poligono[(i + 1) % poligono.length];
    const sa = suma(a);
    const sb = suma(b);
    if (dentro(sa)) salida.push(a);
    if (dentro(sa) !== dentro(sb)) {
      const t = sa / (sa - sb);
      salida.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  return salida.length >= 3 ? salida : [];
}
