// Vista previa de la mutación (entrenar-mutacion-a-la-vista D1 y D3): un hijo de ejemplo del líder, mutado con la
// fuerza del deslizador, y qué muestra la tarjeta de la red. Sin DOM, para probarlo en Node.
import { mutate, mutationDiff } from '../../core/evolution.js';
import { randomFor } from '../../core/random.js';

/** Semilla propia de la vista previa: no es la del entrenamiento ni consume su azar (D1). */
export const PREVIEW_SEED = 0x5eed;

/** Cuánto dura la vista previa después del último cambio del deslizador (D2). */
export const PREVIEW_MS = 2000;

/** Espera sin cambios antes de anunciar el renglón a los lectores de pantalla (D4). */
export const PREVIEW_ANNOUNCE_MS = 500;

/**
 * Hijo de ejemplo: `mutate` con un generador nuevo de semilla fija. Mismo pedido, mismo hijo (no parpadea al
 * arrastrar). No modifica `network`.
 * @param {object} network la red del líder
 * @param {{strength:number, rate:number}} spec fuerza y probabilidad de mutación, en %
 * @returns {{network:object, diff:{changedWeights:Set<string>, changedBiases:Set<string>, total:number, meanChange:number}}}
 */
export function mutationPreview(network, { strength, rate }) {
  const child = mutate(network, { strength, rate }, randomFor(PREVIEW_SEED, 0));
  return { network: child, diff: mutationDiff(network, child) };
}

/**
 * Qué muestra la tarjeta de la red (D3), con prioridad: la vista previa, después la muestra del corte, después la
 * red del líder en vivo.
 * @param {{preview:boolean, cut:boolean}} state cut: hay corte y tiene muestra
 * @returns {'preview'|'cut'|'live'}
 */
export function networkCardMode({ preview, cut }) {
  if (preview) return 'preview';
  if (cut) return 'cut';
  return 'live';
}
