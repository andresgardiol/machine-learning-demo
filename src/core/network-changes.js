// Cambios de prueba sobre una red (pestana-inspeccionar, design.md D5). Sin DOM.
//
// Un cambio es { kind, layer, neuron, input?, value }:
//   weight         otro valor para el peso de la conexión input → neuron de la capa `layer` (≥ 1)
//   bias           otro valor para el sesgo de la neurona `neuron` de la capa `layer` (≥ 1)
//   connectionOff  la conexión input → neuron de la capa `layer` apagada (value: true)
//   neuronOff      la neurona apagada (value: true); en la capa 0, la entrada
// Las capas se cuentan como columnas del diagrama: 0 son las entradas.
//
// La lista lleva el orden en que se hicieron los cambios. Cambiar dos veces lo mismo cuenta como uno
// solo, con el último valor, y pasa a ser el último; volver al valor original lo quita. La red
// original nunca se modifica: `apply` devuelve otra, con las marcas de lo apagado.
import { copyNetwork } from './network.js';

export const CHANGE_KINDS = Object.freeze(['weight', 'bias', 'connectionOff', 'neuronOff']);

/** Clave de lo que cambia un cambio (sin su valor). */
export function changeKey({ kind, layer, neuron, input }) {
  return kind === 'weight' || kind === 'connectionOff' ? `${kind}:${layer}:${neuron}:${input}` : `${kind}:${layer}:${neuron}`;
}

/** Valor original, en la red, de lo que toca un cambio. */
export function originalValue(net, { kind, layer, neuron, input }) {
  if (kind === 'weight') return net.layers[layer - 1].weights[neuron][input];
  if (kind === 'bias') return net.layers[layer - 1].biases[neuron];
  return false;
}

function checkTarget(net, c) {
  const { kind, layer, neuron, input } = c;
  if (!CHANGE_KINDS.includes(kind)) throw new Error(`unknownChange: ${kind}`);
  const L = net.sizes.length;
  const okLayer = Number.isInteger(layer) && layer >= (kind === 'neuronOff' ? 0 : 1) && layer < L;
  if (!okLayer || !Number.isInteger(neuron) || neuron < 0 || neuron >= net.sizes[layer]) throw new Error(`invalidChange: ${changeKey(c)}`);
  if ((kind === 'weight' || kind === 'connectionOff') && (!Number.isInteger(input) || input < 0 || input >= net.sizes[layer - 1])) {
    throw new Error(`invalidChange: ${changeKey(c)}`);
  }
  if ((kind === 'weight' || kind === 'bias') && (typeof c.value !== 'number' || !Number.isFinite(c.value))) throw new Error(`invalidChange: ${changeKey(c)}`);
}

/**
 * Red con los cambios aplicados: { network, offNeurons, offConnections }. `network` es otra red (la
 * original no cambia); offNeurons[col][j] y offConnections[l][j][i] (l ≥ 1) marcan lo apagado.
 */
export function applyChanges(net, list = []) {
  const network = copyNetwork(net);
  const offNeurons = net.sizes.map((n) => new Array(n).fill(false));
  const offConnections = net.sizes.map((n, l) => (l === 0 ? [] : Array.from({ length: n }, () => new Array(net.sizes[l - 1]).fill(false))));
  for (const c of list) {
    if (c.kind === 'weight') network.layers[c.layer - 1].weights[c.neuron][c.input] = c.value;
    else if (c.kind === 'bias') network.layers[c.layer - 1].biases[c.neuron] = c.value;
    else if (c.kind === 'connectionOff') offConnections[c.layer][c.neuron][c.input] = Boolean(c.value);
    else if (c.kind === 'neuronOff') offNeurons[c.layer][c.neuron] = Boolean(c.value);
  }
  const any = list.some((c) => c.kind === 'connectionOff' || c.kind === 'neuronOff');
  return { network, offNeurons, offConnections, anyOff: any, count: list.length };
}

/**
 * Conjunto de cambios de prueba para la red `net`.
 * @param {object} net la red original (no se modifica nunca)
 * @param {object[]} [initial] cambios con que empieza (por ejemplo, los conservados de un cerebro)
 */
export function createChanges(net, initial = []) {
  let list = [];
  let applied = null;
  let version = 0;
  const touch = () => { applied = null; version += 1; };

  const changes = {
    /** Hace un cambio; devuelve si la lista cambió. */
    set(change) {
      const c = { kind: change.kind, layer: change.layer, neuron: change.neuron, ...(change.input !== undefined ? { input: change.input } : {}) };
      c.value = change.kind === 'weight' || change.kind === 'bias' ? change.value : change.value !== false;
      checkTarget(net, c);
      const key = changeKey(c);
      const at = list.findIndex((x) => changeKey(x) === key);
      const original = originalValue(net, c);
      const same = c.value === original;
      if (same && at < 0) return false;
      if (at >= 0 && !same && list[at].value === c.value && at === list.length - 1) return false;
      if (at >= 0) list = list.filter((_, i) => i !== at);
      if (!same) list = [...list, c];
      touch();
      return true;
    },
    /** Deshace el último cambio; devuelve el cambio deshecho o null. */
    undo() {
      if (list.length === 0) return null;
      const last = list[list.length - 1];
      list = list.slice(0, -1);
      touch();
      return { ...last };
    },
    /** Vacía la lista: la red vuelve a ser la original. */
    clear() {
      if (list.length === 0) return false;
      list = [];
      touch();
      return true;
    },
    /** Valor actual de lo que toca un cambio (el cambiado o el original). */
    valueOf(target) {
      const found = list.find((x) => changeKey(x) === changeKey(target));
      return found ? found.value : originalValue(net, target);
    },
    /** ¿Está cambiado lo que toca `target`? */
    has(target) { return list.some((x) => changeKey(x) === changeKey(target)); },
    /** Cambios, en el orden en que se hicieron (copias). */
    list() { return list.map((c) => ({ ...c })); },
    get count() { return list.length; },
    get version() { return version; },
    get network() { return net; },
    /** Red con los cambios aplicados (se calcula una vez por versión). */
    applied() {
      if (!applied) applied = applyChanges(net, list);
      return applied;
    },
  };
  for (const c of initial) changes.set(c);
  version = 0;
  return changes;
}
