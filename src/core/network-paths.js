// De dónde viene lo que recibe una neurona y cómo responde a una entrada (vista-de-la-red, design.md
// D9 y D17). Sin DOM, puro y reproducible. Vecino de network-trace.js: trabaja sobre sus cuentas.
//
//   upstream(trace, target, perNeuron)  → importancia de 0 a 1 de cada conexión de las capas anteriores
//   responseCurve(net, inputs, target, inputIndex, opts) → la suma de la neurona mientras una entrada
//                                         recorre su rango y las demás quedan como están
import { traceNetwork } from './network-trace.js';
import { forwardValues } from './backprop.js';

/**
 * Importancia de cada conexión en el camino hacia atrás de `target` (D9). En cada neurona del camino,
 * su importancia se reparte entre sus conexiones de entrada según |producto|; si todos valen cero, según
 * |peso| (sin contar lo apagado). `perNeuron` (todas, 5, 3 o 1) limita cuántas se siguen desde cada
 * neurona: las de mayor parte; en un empate, la entrada de más arriba. Lo apagado tiene importancia
 * cero y el camino no sigue por ahí.
 * @param {object} trace cuenta con la forma de traceNetwork
 * @param {{layer:number, neuron:number}} target
 * @param {'all'|number} [perNeuron]
 * @returns {{links:Map<string, number>, neurons:Map<string, number>}} claves 'l:j:i' (l: capa de destino) y 'l:j'
 */
export function upstream(trace, target, perNeuron = 'all') {
  const links = new Map();
  const neurons = new Map();
  if (!target || target.layer < 1 || target.layer >= trace.layers.length) return { links, neurons };
  let level = new Map([[target.neuron, 1]]); // neurona de la capa actual → importancia
  neurons.set(`${target.layer}:${target.neuron}`, 1);
  const limit = perNeuron === 'all' || perNeuron === null || perNeuron === undefined ? Infinity : perNeuron;
  for (let l = target.layer; l >= 1; l--) {
    const below = new Map();
    const fromNeurons = trace.layers[l - 1].neurons;
    for (const j of [...level.keys()].sort((a, b) => a - b)) {
      const m = level.get(j);
      const n = trace.layers[l].neurons[j];
      if (!(m > 0) || n.off) continue;
      const usable = (i) => !(n.offConnections?.[i]) && !fromNeurons[i].off;
      let parts = n.products.map((p, i) => (usable(i) ? Math.abs(p) : 0));
      let total = parts.reduce((a, b) => a + b, 0);
      if (total === 0) {
        parts = n.weights.map((w, i) => (usable(i) ? Math.abs(w) : 0));
        total = parts.reduce((a, b) => a + b, 0);
      }
      if (total === 0) continue;
      let order = parts.map((a, i) => ({ i, a })).filter((x) => x.a > 0);
      if (order.length > limit) order = order.sort((x, y) => (y.a - x.a) || (x.i - y.i)).slice(0, limit);
      for (const { i, a } of order) {
        const v = (m * a) / total;
        links.set(`${l}:${j}:${i}`, (links.get(`${l}:${j}:${i}`) ?? 0) + v);
        if (l - 1 >= 1) below.set(i, (below.get(i) ?? 0) + v);
      }
    }
    for (const [i, v] of below) neurons.set(`${l - 1}:${i}`, (neurons.get(`${l - 1}:${i}`) ?? 0) + v);
    level = below;
    if (level.size === 0) break;
  }
  return { links, neurons };
}

/**
 * Respuesta de una neurona a una entrada (D17): su suma total (sesgo + productos) y su salida para
 * `samples` valores de la entrada `inputIndex` a lo largo de `range`, con las demás como en `inputs`.
 * Con `soft` (Laboratorio) usa la cuenta que aprende (forwardValues, con `off`); si no, traceNetwork
 * con `changes` (Inspeccionar). `now` es la cuenta en el valor de ahora, la misma que da la red.
 * @returns {{xs:number[], totals:number[], outputs:number[], now:{x:number, total:number, output:number},
 *   flips:number[], range:[number, number]}}
 */
export function responseCurve(net, inputs, target, inputIndex, { samples = 41, changes = null, off = null, soft = false, range = [0, 1] } = {}) {
  const [lo, hi] = range;
  const work = inputs.slice();
  const at = (x) => {
    work[inputIndex] = x;
    if (soft) {
      const f = forwardValues(net, work.slice(), off);
      return { total: f.totals[target.layer][target.neuron], output: f.values[target.layer][target.neuron] };
    }
    const n = traceNetwork(net, work, changes).layers[target.layer].neurons[target.neuron];
    return { total: n.total, output: n.output };
  };
  const xs = [];
  const totals = [];
  const outputs = [];
  for (let k = 0; k < samples; k++) {
    const x = samples === 1 ? lo : lo + ((hi - lo) * k) / (samples - 1);
    const r = at(x);
    xs.push(x);
    totals.push(r.total);
    outputs.push(r.output);
  }
  const now = { x: inputs[inputIndex], ...at(inputs[inputIndex]) };
  // Dónde la suma cruza el cero (la salida cambia): interpolado entre dos muestras.
  const flips = [];
  for (let k = 1; k < samples; k++) {
    const a = totals[k - 1];
    const b = totals[k];
    if ((a > 0) !== (b > 0)) flips.push(a === b ? xs[k] : xs[k - 1] + ((xs[k] - xs[k - 1]) * (0 - a)) / (b - a));
  }
  return { xs, totals, outputs, now, flips, range: [lo, hi] };
}
