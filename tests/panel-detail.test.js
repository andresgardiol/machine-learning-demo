// vista-de-la-red D7 y D17: funciones puras del detalle del panel (sin DOM).
import test from 'node:test';
import assert from 'node:assert/strict';
import { linkShare } from '../src/tabs/shared/connection-detail.js';
import { strongestInput, curveScale } from '../src/tabs/shared/response-curve.js';
import { traceNetwork } from '../src/core/network-trace.js';
import { EXAMPLE_BRAINS } from '../src/data/example-brains.js';

test('parte de una conexión: |producto| sobre la suma de los |productos| encendidos', () => {
  const n = { products: [0.6, -0.3, 0.1], offConnections: null };
  assert.ok(Math.abs(linkShare(n, 0) - 0.6) < 1e-12);
  assert.ok(Math.abs(linkShare(n, 1) - 0.3) < 1e-12);
  assert.equal(linkShare({ products: [0, 0], offConnections: null }, 0), null);
  const off = { products: [0.6, -0.3, 0.1], offConnections: [false, true, false] };
  assert.equal(linkShare(off, 1), 0);
  assert.ok(Math.abs(linkShare(off, 0) - 0.6 / 0.7) < 1e-12);
});

test('la curva arranca en la entrada que más aporta: primera capa por |producto|, más atrás por el camino', () => {
  const net = EXAMPLE_BRAINS[0].network;
  const trace = traceNetwork(net, [0.47, 0.02, 0, 0, 0.12, 1]);
  const products = trace.layers[1].neurons[1].products.map(Math.abs);
  assert.equal(strongestInput(trace, { layer: 1, neuron: 1 }), products.indexOf(Math.max(...products)));
  const deep = strongestInput(trace, { layer: 2, neuron: 1 });
  assert.ok(Number.isInteger(deep) && deep >= 0 && deep < 6);
  assert.equal(strongestInput(trace, { layer: 2, neuron: 1 }), deep, 'misma cuenta, misma entrada');
  assert.equal(strongestInput(trace, { layer: 0, neuron: 3 }), 0);
});

test('escala de la curva: simétrica, con el cero adentro y lugar para el punto de ahora', () => {
  assert.ok(Math.abs(curveScale([0.1, 0.4], 0.2) - 0.44) < 1e-12);
  assert.ok(Math.abs(curveScale([0.1, 0.2], -0.5) - 0.55) < 1e-12);
  assert.equal(curveScale([0, 0], 0), 1);
});
