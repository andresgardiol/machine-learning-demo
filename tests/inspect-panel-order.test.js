// Lo elegido, primero en el panel (controles-de-la-red-primero, tarea 4.1). El repositorio no monta pantallas en
// las pruebas, así que se comprueba en el código: el orden de los bloques con algo elegido y sin nada elegido, que
// se mueven los nodos (no `order` de CSS) y que la tarjeta no se desplaza por dentro.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
/** Los nombres de una lista de nodos escrita como `name: [a, b.node, c]`. */
function listOf(src, name) {
  const m = src.match(new RegExp(`\\b${name}: \\[([^\\]]*)\\]`));
  assert.ok(m, `falta la lista ${name}`);
  return m[1].split(',').map((s) => s.trim().replace(/\.(node|row)$/, ''));
}

test('Inspeccionar (V1): sin nada elegido, el orden de siempre; con algo elegido, cerebro, detalle, tráfico, frase, leyenda y misiones', () => {
  const src = read('src/tabs/inspect/index.js');
  assert.deepEqual(listOf(src, 'none'),
    ['consigna', 'introMore', 'brainSection', 'trafficChoice', 'guideLine', 'emptyBlock', 'card', 'linkDetail', 'legend', 'missions']);
  const picked = listOf(src, 'picked');
  assert.deepEqual(picked.slice(0, 5), ['brainSection', 'card', 'linkDetail', 'trafficChoice', 'guideLine']);
  assert.ok(picked.indexOf('legend') < picked.indexOf('missions'));
  assert.ok(picked.indexOf('guideLine') < picked.indexOf('legend'));
  assert.equal(new Set(picked).size, listOf(src, 'none').length, 'los mismos bloques en los dos órdenes');
  // Se mueven los nodos y, al elegir algo, el panel vuelve arriba.
  assert.match(src, /panelBody\.append\(\.\.\.panelOrder\[/);
  assert.match(src, /panel\.scrollTop = 0/);
});

test('Entender (V2): en la hoja Neurona, con algo elegido, el detalle va antes de la línea de guía', () => {
  const src = read('src/v2/stages/entender/index.js');
  assert.deepEqual(listOf(src, 'none'), ['guideLine', 'emptyBlock', 'card', 'linkDetail']);
  assert.deepEqual(listOf(src, 'picked'), ['card', 'linkDetail', 'guideLine', 'emptyBlock']);
  assert.match(src, /sheetNeuron\.append\(\.\.\.neuronOrder\[/);
  assert.match(src, /sheetNeuron\.scrollTop = 0/);
});

test('un solo desplazamiento: la tarjeta y sus filas no se desplazan por dentro y el pie queda pegado abajo', () => {
  const v1 = read('styles/app.css');
  assert.match(v1, /\.panel:has\(> \.inspect-panel:not\(\.lab-panel\)\) \{[^}]*overflow-y: auto/);
  assert.match(v1, /\.inspect-panel:not\(\.lab-panel\) \.inspect-card \{[^}]*overflow: visible/);
  assert.match(v1, /\.inspect-panel:not\(\.lab-panel\) \.inspect-rows-scroll \{[^}]*overflow: visible/);
  assert.match(v1, /\.inspect-panel:not\(\.lab-panel\) \.inspect-foot-block \{[^}]*position: sticky; bottom: 0/);
  const v2 = read('styles/v2/entender.css');
  assert.match(v2, /\.v2-sheet-neuron \.inspect-card \{[^}]*overflow: visible/);
  assert.match(v2, /\.v2-sheet-neuron \.inspect-rows-scroll \{[^}]*overflow: visible/);
  assert.match(v2, /\.v2-sheet-neuron \.inspect-foot-block \{[^}]*position: sticky; bottom: 0/);
});
