// Soluciones preparadas de las compuertas (laboratorio-empieza-por-compuertas D9), sin DOM: pesos y
// sesgos que aciertan los cuatro casos con la red de ahora. Hay solución sin capas ocultas (AND y OR;
// XOR no se separa con una recta) y con una capa oculta de dos neuronas (las tres compuertas), con
// tanh, sigmoide o ReLU. Todos los números quedan entre −3 y 3, el rango de las pastillas.
//
//   gateSolution(gate, { hidden, activation }) → [{ weights, biases }] por capa, o null
//   solutionShapeOk(gate, hidden)              → ¿hay solución para esa forma?
//
// La salida siempre es una sigmoide del total: contesta sí cuando el total pasa de 0.

/** Sesgo de una neurona con pesos (1, 1) que hace OR (−0,5) o AND (−1,5). */
const LINE = Object.freeze({ or: -0.5, and: -1.5 });

/**
 * Una capa oculta de 2: la neurona 1 es OR (pesos 2 y 2, sesgo −1) y la 2 es AND (pesos 2 y 2, sesgo
 * −3). Con pesos 3, el sesgo de AND tendría que pasar de −3 (el diseño decía −4,5): con 2 entra en el
 * rango. La salida las combina según la compuerta y la activación.
 */
const HIDDEN = Object.freeze({ weights: [[2, 2], [2, 2]], biases: [-1, -3] });
const OUTPUT = Object.freeze({
  // XOR: "OR y no AND".
  xor: { tanh: { w: [1.5, -1.5], b: -1 }, sigmoid: { w: [3, -3], b: -1 }, relu: { w: [1, -3], b: -0.5 } },
  // OR: la neurona OR sola.
  or: { tanh: { w: [3, 0], b: 0 }, sigmoid: { w: [3, 0], b: -1.5 }, relu: { w: [3, 0], b: -1.5 } },
  // AND: la neurona AND sola.
  and: { tanh: { w: [0, 3], b: 0 }, sigmoid: { w: [0, 3], b: -1.5 }, relu: { w: [0, 3], b: -1.5 } },
});

/** ¿Hay solución preparada para esa compuerta con esas capas ocultas? */
export function solutionShapeOk(gate, hidden) {
  if (hidden.length === 0) return gate === 'and' || gate === 'or';
  return hidden.length === 1 && hidden[0] === 2;
}

/**
 * Pesos y sesgos que resuelven la compuerta, capa por capa (como `network.layers`), o null si la forma
 * no tiene solución preparada.
 * @param {'and'|'or'|'xor'} gate
 * @param {{hidden:number[], activation:string}} shape
 */
export function gateSolution(gate, { hidden, activation }) {
  if (!solutionShapeOk(gate, hidden)) return null;
  if (hidden.length === 0) return [{ weights: [[1, 1]], biases: [LINE[gate]] }];
  const out = OUTPUT[gate][activation] ?? OUTPUT[gate].tanh;
  return [
    { weights: HIDDEN.weights.map((r) => r.slice()), biases: HIDDEN.biases.slice() },
    { weights: [out.w.slice()], biases: [out.b] },
  ];
}
