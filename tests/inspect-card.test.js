import test from 'node:test';
import assert from 'node:assert/strict';
import { cardRows, weightRange, activationPath } from '../src/tabs/inspect/card.js';
import { formatValue } from '../src/ui/i18n.js';
import { traceNetwork } from '../src/core/network-trace.js';
import { createRandom } from '../src/core/random.js';
import { EXAMPLE_BRAINS } from '../src/data/example-brains.js';
import { createNetwork } from '../src/core/network.js';

/** Lee de vuelta un número escrito con dos decimales en español (−0,21 → -0.21). */
const read = (text) => Number(text.replace('−', '-').replace(',', '.'));

test('cuenta que se puede comprobar: sumar a mano los productos mostrados y el sesgo da el total mostrado, con sus decimales', () => {
  // El total se calcula con los números enteros y se redondea al final (un tooltip lo dice): sumar
  // lo que se ve puede diferir del total mostrado como mucho en el redondeo de cada término.
  const random = createRandom(3);
  let exact = 0;
  let cases = 0;
  for (const brain of [...EXAMPLE_BRAINS, { network: createNetwork({ inputs: 21, hidden: [16], outputs: 4, activation: 'tanh', random: createRandom(9) }) }]) {
    const net = brain.network;
    for (let k = 0; k < 200; k++) {
      const inputs = Array.from({ length: net.sizes[0] }, () => random());
      const trace = traceNetwork(net, inputs);
      for (const n of trace.layers[1].neurons) {
        const shown = n.products.map((p) => read(formatValue(p, 'es')));
        const byHand = shown.reduce((a, b) => a + b, 0) + read(formatValue(n.bias, 'es'));
        const total = read(formatValue(n.total, 'es'));
        const tolerance = 0.005 * (n.products.length + 1) + 0.005 + 1e-9;
        assert.ok(Math.abs(byHand - total) <= tolerance, `${byHand} y ${total}`);
        cases += 1;
        if (Math.abs(byHand - total) < 1e-9) exact += 1;
      }
    }
  }
  // Medido: coincide exacto en 3373 de 8000 casos; en el resto difiere en el último decimal (consultado).
  assert.ok(exact > 0 && cases === 8000);
});

test('neurona de la primera capa oculta de un cerebro de 5 sensores: seis filas, una por sensor y una por la velocidad', () => {
  const net = EXAMPLE_BRAINS[0].network;
  const n = traceNetwork(net, [0, 0.2, 0.4, 0.6, 0.8, 0.5]).layers[1].neurons[0];
  assert.deepEqual(cardRows(n.products, null), { rows: [0, 1, 2, 3, 4, 5], others: null });
});

test('con el filtro en 3 y 21 entradas: las 3 filas destacadas y una más que junta a las otras 18 con la suma de sus productos', () => {
  const products = Array.from({ length: 21 }, (_, i) => (i - 10) / 10);
  const r = cardRows(products, new Set([0, 1, 20]));
  assert.deepEqual(r.rows, [0, 1, 20]);
  assert.equal(r.others.count, 18);
  const all = products.reduce((a, b) => a + b, 0);
  const shown = products[0] + products[1] + products[20];
  assert.ok(Math.abs(shown + r.others.sum - all) < 1e-12, 'la cuenta total es la misma');
});

test('rango de un peso: de −1 a 1, salvo que el original esté más lejos', () => {
  assert.deepEqual(weightRange(0.4), { min: -1, max: 1, step: 0.01 });
  assert.deepEqual(weightRange(-1.734), { min: -1.74, max: 1.74, step: 0.01 });
});

test('gráfico de la activación: el punto cae sobre la curva', () => {
  for (const name of ['step', 'sigmoid', 'tanh', 'relu']) {
    const g = activationPath(name, 64, 28);
    assert.match(g.d, /^M0\.0 /);
    const [x, y] = g.point(0.5, name === 'step' ? 1 : name === 'sigmoid' ? 1 / (1 + Math.exp(-0.5)) : name === 'tanh' ? Math.tanh(0.5) : 0.5);
    assert.ok(x > 32 && x < 64 && y >= 0 && y <= 28, `${name}: ${x}, ${y}`);
  }
});
