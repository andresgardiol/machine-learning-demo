// La cuenta de una red, desglosada por operaciones (pestana-inspeccionar, design.md D3). Sin DOM.
//
//   traceNetwork(net, inputs, changes?) →
//     { layers: [ { neurons: [...] }, ... ], inputs: [...], outputs: [...] }
//
// layers[0] son las entradas: { input: true, raw, output, off }. Cada capa siguiente tiene, por
// neurona: { from, weights, products, sum, bias, total, activation, output, off, offConnections }.
//   from      los valores que recibe (las salidas de la capa anterior)
//   products  peso × valor de cada conexión (0 si la conexión está apagada)
//   sum       suma de los productos (para mostrar)
//   total     sesgo + productos, en el mismo orden que computeDetailed: el sesgo primero y después
//             cada producto. Así la salida es idéntica bit a bit a la del manejo.
//   output    activación(total); 0 si la neurona está apagada
// La capa de salida usa siempre el escalón ('step').
//
// Con `changes` (network-changes.js) la cuenta usa los pesos y sesgos cambiados y pone en 0 lo
// apagado. La red original no cambia. El controlador del auto de Inspeccionar usa esta misma función
// (createTraceController): lo que se ve y lo que maneja no pueden diferir.
import { activationFunction, NetworkError } from './network.js';

const step = activationFunction('step');

/**
 * @param {object} net red (ver network.js)
 * @param {number[]} inputs una entrada por neurona de la capa 0
 * @param {object} [changes] conjunto de cambios de prueba (createChanges) o null
 */
export function traceNetwork(net, inputs, changes = null) {
  const expected = net.sizes[0];
  if (!Array.isArray(inputs) || inputs.length !== expected) {
    throw new NetworkError('inputCount', { expected, received: Array.isArray(inputs) ? inputs.length : null });
  }
  const applied = changes && changes.count > 0 ? changes.applied() : null;
  const network = applied ? applied.network : net;
  const offN = applied ? applied.offNeurons : null;
  const offC = applied ? applied.offConnections : null;
  const hiddenName = net.activation;
  const hiddenFn = activationFunction(hiddenName);

  const inputNeurons = new Array(expected);
  let current = new Array(expected);
  for (let i = 0; i < expected; i++) {
    const off = offN ? offN[0][i] : false;
    const output = off ? 0 : inputs[i];
    current[i] = output;
    inputNeurons[i] = { input: true, raw: inputs[i], output, off };
  }
  const layers = [{ neurons: inputNeurons }];
  const last = network.layers.length - 1;
  for (let l = 0; l <= last; l++) {
    const { weights, biases } = network.layers[l];
    const isOutput = l === last;
    const fn = isOutput ? step : hiddenFn;
    const activation = isOutput ? 'step' : hiddenName;
    const col = l + 1;
    const neurons = new Array(biases.length);
    const next = new Array(biases.length);
    for (let j = 0; j < biases.length; j++) {
      const row = weights[j];
      const offRow = offC ? offC[col][j] : null;
      const products = new Array(row.length);
      let total = biases[j];
      let sum = 0;
      for (let i = 0; i < row.length; i++) {
        const p = offRow && offRow[i] ? 0 : row[i] * current[i];
        products[i] = p === 0 ? 0 : p; // sin «−0» a la vista; el total usa el producto tal cual
        total += p;
        sum += p;
      }
      const off = offN ? offN[col][j] : false;
      const output = off ? 0 : fn(total);
      next[j] = output;
      neurons[j] = {
        from: current, weights: row, products, sum, bias: biases[j], total, activation, output, off,
        offConnections: offRow,
      };
    }
    layers.push({ neurons });
    current = next;
  }
  return { layers, inputs: inputs.slice(), outputs: current };
}

/**
 * Controlador del auto (contrato de controller.js) que maneja con traceNetwork y los cambios de
 * prueba. Guarda la última cuenta en `lastTrace`.
 * @param {object} net
 * @param {number} sensorCount
 * @param {() => object|null} [getChanges] los cambios vigentes en cada cuadro
 */
export function createTraceController(net, sensorCount, getChanges = () => null) {
  const input = new Array(sensorCount + 1);
  const controller = {
    network: net,
    lastTrace: null,
    control(perception) {
      const { sensors, speed } = perception;
      for (let i = 0; i < sensorCount; i++) input[i] = sensors[i];
      input[sensorCount] = speed;
      const trace = traceNetwork(net, input, getChanges());
      controller.lastTrace = trace;
      const [forward, left, right, reverse] = trace.outputs;
      return { forward: forward === 1, left: left === 1, right: right === 1, reverse: reverse === 1 };
    },
  };
  return controller;
}

/** Entradas de la red para una percepción: los sensores en orden y la velocidad al final. */
export const inputsOf = (perception) => [...perception.sensors, perception.speed];
