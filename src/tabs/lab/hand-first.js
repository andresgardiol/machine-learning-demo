// A mano primero en Compuertas (red-al-centro D8), sin DOM: mientras la compuerta no se resolvió a mano, la
// pantalla pide lo mismo que la consigna (mover los pesos) y "Reproducir" no es la acción principal. Pasa a serlo
// cuando la tabla dice 4 de 4 después de un cambio a mano, cuando se usa "Ver una solución" o después de cinco
// cambios a mano sin resolverla. Depende solo de los cambios y de la tabla: el mismo recorrido da lo mismo.

/** Cambios a mano sin resolver después de los que "Reproducir" pasa a ser la principal. */
export const HAND_TRIES = 5;

export function createHandFirst() {
  let changes = 0;
  let solved = false;
  let solution = false;
  let lastGesture = null;
  return {
    /**
     * Un cambio a mano. Un arrastre entero (el mismo `gesture`) es un solo cambio; con el teclado, cada tecla.
     * @param {{gesture?: string|null, solved: boolean}} c solved: la tabla dice 4 de 4 después del cambio
     */
    change({ gesture = null, solved: nowSolved }) {
      if (!gesture || gesture !== lastGesture) changes += 1;
      lastGesture = gesture;
      if (nowSolved) solved = true;
    },
    /** "Ver una solución". */
    showSolution() { solution = true; },
    /** Restablecer los datos desde la barra: vuelve a empezar a mano. */
    reset() { changes = 0; solved = false; solution = false; lastGesture = null; },
    /** ¿Ya hubo algún cambio a mano? (la marca "Arrastrá un peso" se va con el primero) */
    get touched() { return changes > 0 || solution; },
    get changes() { return changes; },
    /** Por qué "Reproducir" pasó a ser la principal: 'solved', 'solution', 'tries' o null (todavía a mano). */
    get reason() { return solved ? 'solved' : solution ? 'solution' : changes >= HAND_TRIES ? 'tries' : null; },
    get done() { return this.reason !== null; },
  };
}

/**
 * ¿Se resuelve a mano todavía? Solo en Compuertas, mientras no pasó ninguna de las tres cosas.
 * @param {string} kind 'gates', 'points' o 'driving'
 */
export const handFirstNow = (kind, handFirst) => kind === 'gates' && !handFirst.done;
