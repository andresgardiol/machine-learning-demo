// Disposición de Entrenar que se puede probar sin navegador (entrenar-red-primero).
// D1: el tablero lleva la red del líder antes que la curva de fitness, debajo de los indicadores y del
// renglón de la última generación. D2: la cuenta del renglón plegado de las misiones.

/**
 * Nodos del tablero en orden: indicadores, última generación, red y curva.
 * @template T
 * @param {{strip:T, lastLine:T, chart:T, network:T}} nodes
 * @returns {T[]}
 */
export function boardOrder({ strip, lastLine, chart, network }) {
  return [strip, lastLine, network, chart];
}

/**
 * Cuántas misiones van cumplidas de cuántas, para "Todas las misiones · N de M".
 * @param {{done:boolean}[]} missions
 * @returns {{done:number, total:number}}
 */
export function missionsSummary(missions) {
  return { done: missions.filter((m) => m.done).length, total: missions.length };
}
