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
