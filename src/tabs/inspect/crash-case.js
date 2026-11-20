// El caso del choque de Inspeccionar (red-al-centro D5), sin DOM: qué decidió la red en un cuadro y qué neurona
// aportó más a esa decisión. Es la misma cuenta que muestra la tarjeta de la neurona (valor por peso); no hay un
// criterio nuevo. Se prueba con node --test.

import { changeKey } from '../../core/network-changes.js';

/** Segundos que guarda la memoria de cuadros (y cubre la repetición): 3 s a 60 cuadros por segundo. */
export const CASE_FRAMES = 180;
/** Cuadros antes del choque en que empieza el deslizador: 1 s (desde el cuadro del choque se vuelve a chocar enseguida). */
export const CASE_START = 60;

/**
 * La decisión de la red en un cuadro: la acción encendida de mayor valor (el total antes de la activación); a
 * igual valor, la de menor índice. Sin ninguna encendida, null.
 * @param {{layers: {neurons: {output:number, total:number}[]}[]}} trace cuenta del cuadro (network-trace.js)
 * @returns {{index:number, total:number}|null}
 */
export function decisionOf(trace) {
  const outs = trace.layers[trace.layers.length - 1].neurons;
  let best = null;
  outs.forEach((n, j) => {
    if (n.off || n.output !== 1) return;
    if (!best || n.total > best.total) best = { index: j, total: n.total };
  });
  return best;
}

/**
 * La neurona que más aportó a la salida `output`: la de la última capa oculta con el mayor aporte positivo (valor
 * por peso, el producto de la cuenta; una conexión apagada aporta 0); sin capas ocultas, la entrada con el mayor
 * aporte. A igual aporte, la de menor índice. Sin ningún aporte positivo, null.
 * @returns {{layer:number, neuron:number, product:number}|null}
 */
export function topContributor(trace, output) {
  const last = trace.layers.length - 1;
  const n = trace.layers[last].neurons[output];
  if (!n) return null;
  let best = null;
  n.products.forEach((p, i) => {
    if (n.offConnections?.[i]) return;
    if (p > 0 && (!best || p > best.product)) best = { layer: last - 1, neuron: i, product: p };
  });
  return best;
}

/**
 * Lo que dice la tarjeta del caso para un cuadro: la decisión y la neurona que más aportó a ella.
 * @returns {{decision: {index:number, total:number}|null, contributor: {layer:number, neuron:number, product:number}|null}}
 */
export function caseOf(trace) {
  const decision = decisionOf(trace);
  return { decision, contributor: decision ? topContributor(trace, decision.index) : null };
}

/**
 * ¿Dos listas de cambios de prueba arman la misma red? (cambios-visibles-en-el-choque D4) Se comparan por
 * contenido, no por referencia: cambiar algo y deshacerlo del todo deja una lista nueva pero igual a la de antes.
 * Cada lista tiene a lo sumo un cambio por lugar, así que el orden no importa.
 */
export function sameChangeList(a, b) {
  if (a.length !== b.length) return false;
  return a.every((c) => b.some((d) => changeKey(d) === changeKey(c) && d.value === c.value));
}

/**
 * La línea "con tus cambios" de la tarjeta del caso (cambios-visibles-en-el-choque D2): qué decidiría la red de
 * ahora en el cuadro que se ve, comparado con la decisión real.
 * @param {{index:number}|null} real decisión real del cuadro (la de la red de entonces)
 * @param {object} nowTrace cuenta del mismo cuadro con la red de ahora
 * @returns {{key:string, index?:number}} 'inspect.case.now.same', 'inspect.case.now' (con la acción) o 'inspect.case.now.none'
 */
export function nowLineOf(real, nowTrace) {
  const now = decisionOf(nowTrace);
  if ((real?.index ?? null) === (now?.index ?? null)) return { key: 'inspect.case.now.same' };
  if (!now) return { key: 'inspect.case.now.none' };
  return { key: 'inspect.case.now', index: now.index };
}
