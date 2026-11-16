// Aspecto de una conexión (vista-de-la-red, design.md D1 y D2), puro y sin DOM: un solo criterio para
// el inspector y el diagrama de Entrenar.
//
//   signo  → color y trazo (continuo si suma, punteado si resta)
//   peso   → grosor, relativo al mayor peso de la red (sin el signo), con un mínimo que se ve y un
//            máximo que baja con la densidad
//   señal  → brillo: un piso, que baja con la densidad, más lo que pasa ahora por la conexión
//
// Los tres canales no se multiplican entre sí. La elección (papel) no cambia ninguno: atenúa lo que no
// está relacionado.

/** Valores de partida de D2 (ajustados mirando capturas: ver la consulta 2.6). */
export const LINK_LOOK = Object.freeze({
  minWidth: 1.5, // px con el acercamiento en 1
  widthRange: 5.5, // con pocas conexiones entre dos capas, el mayor peso mide minWidth + widthRange (7 px)
  widthRangeDense: 2.5, // con muchas, minWidth + widthRangeDense (4 px): consulta 2.6
  zeroWidth: 1, // peso cero: línea fina y gris
  floorSparse: 0.35, // piso de brillo con pocas conexiones entre dos capas
  floorDense: 0.12, // piso con muchas
  sparseLinks: 48,
  denseLinks: 256,
  relatedMin: 0.8, // con algo elegido o bajo el cursor: lo relacionado no baja de acá
  unrelated: 0.15, // y lo demás queda en esta fracción de su brillo
  filtered: 0.12, // fuera del filtro de conexiones
});

/** De `sparse` (hasta 48 conexiones entre dos capas) a `dense` (256 o más), lineal entre medio. */
function byDensity(links, sparse, dense) {
  const { sparseLinks, denseLinks } = LINK_LOOK;
  if (!(links > sparseLinks)) return sparse;
  if (links >= denseLinks) return dense;
  return sparse + ((dense - sparse) * (links - sparseLinks)) / (denseLinks - sparseLinks);
}

/** Piso de brillo según cuántas conexiones hay entre dos capas: 0,35 hasta 48, 0,12 desde 256, lineal entre medio. */
export function densityFloor(links) {
  return byDensity(links, LINK_LOOK.floorSparse, LINK_LOOK.floorDense);
}

/** Rango de grosor según cuántas conexiones hay entre dos capas: 5,5 hasta 48, 2,5 desde 256 (consulta 2.6). */
export function densityWidthRange(links) {
  return byDensity(links, LINK_LOOK.widthRange, LINK_LOOK.widthRangeDense);
}

/**
 * @param {object} p
 * @param {number} p.weight peso (con los cambios a mano)
 * @param {number} p.maxWeight mayor |peso| de la red (con los cambios)
 * @param {number|null} [p.product] lo que pasa ahora (entrada × peso); null sin cuenta
 * @param {number} [p.maxProduct] mayor |producto| del cuadro
 * @param {'normal'|'related'|'unrelated'|'filtered'} [p.role] normal: nada elegido
 * @param {number} [p.density] conexiones entre las dos capas
 * @param {number} [p.importance] para 'related': de 0 a 1, cuánto aporta a lo elegido (D9); 1 si es directa
 * @returns {{width:number, alpha:number, sign:'positive'|'negative'|'zero', dashed:boolean}}
 */
export function linkLook({ weight, maxWeight, product = null, maxProduct = 0, role = 'normal', density = 0, importance = 1 }) {
  const { minWidth, zeroWidth, relatedMin, unrelated, filtered } = LINK_LOOK;
  const floor = densityFloor(density);
  const signal = product === null || !(maxProduct > 0) ? 0 : Math.min(1, Math.abs(product) / maxProduct);
  let alpha = floor + (1 - floor) * signal;
  if (role === 'related') {
    // Directa (importancia 1): no baja de 0,8. De más atrás (D9): 0,35 + 0,65 × importancia.
    const k = Math.max(0, Math.min(1, importance));
    alpha = k >= 1 ? Math.max(alpha, relatedMin) : 0.35 + 0.65 * k;
  } else if (role === 'unrelated') alpha *= unrelated;
  else if (role === 'filtered') alpha = Math.min(alpha, filtered);
  if (weight === 0) return { width: zeroWidth, alpha: Math.min(alpha, 0.5), sign: 'zero', dashed: false };
  const rel = maxWeight > 0 ? Math.min(1, Math.abs(weight) / maxWeight) : 1;
  const sign = weight < 0 ? 'negative' : 'positive';
  return { width: minWidth + densityWidthRange(density) * rel, alpha: Math.min(1, alpha), sign, dashed: sign === 'negative' };
}

/**
 * Tope de grosor de una línea que llega a un cuadrito o sale de él (conexiones-en-capas-resumidas D2):
 * no más que la mitad de su lado en pantalla. El piso es 1,5 px, o 1 si el tope queda por debajo de 1,5.
 * Sin cuadrito (side infinito), el grosor queda como está.
 */
export function capToSquare(width, side) {
  if (!Number.isFinite(side)) return width;
  const cap = side / 2;
  return Math.max(cap < 1.5 ? 1 : 1.5, Math.min(width, cap));
}

/** Mayor |peso| de una red (sin contar los sesgos); 0 si no tiene pesos. */
export function maxWeightOf(net) {
  let m = 0;
  for (const layer of net.layers) for (const row of layer.weights) for (const w of row) { const a = Math.abs(w); if (a > m) m = a; }
  return m;
}

/** Mayor |producto| de una cuenta (traceNetwork o forwardSoft). */
export function maxProductOf(trace) {
  let m = 0;
  for (let l = 1; l < trace.layers.length; l++) for (const n of trace.layers[l].neurons) for (const p of n.products) { const a = Math.abs(p); if (a > m) m = a; }
  return m;
}

/** Mayor |peso| de una cuenta: los pesos que usó, con los cambios. */
export function maxWeightOfTrace(trace) {
  let m = 0;
  for (let l = 1; l < trace.layers.length; l++) for (const n of trace.layers[l].neurons) for (const w of n.weights) { const a = Math.abs(w); if (a > m) m = a; }
  return m;
}
