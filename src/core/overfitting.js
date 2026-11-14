// Aviso de sobreajuste (pestana-laboratorio, design.md D9), sin DOM.
//
// La red está memorizando cuando, después de la época 20, el error de los apartados lleva 10 épocas
// seguidas más de un 10 % por encima de su mínimo y el de práctica está por debajo del que tenía en
// ese mínimo.

export const OVERFIT_RULE = Object.freeze({ after: 20, run: 10, margin: 0.1 });

/**
 * @param {{epoch:number, practice:{loss:number|null}, heldOut:{loss:number|null}}[]} history una entrada por época
 * @param {{after:number, run:number, margin:number}} [rule]
 * @returns {{warning:boolean, bestEpoch:number|null, best:number|null}} bestEpoch: la época del menor error de los apartados
 */
export function overfitting(history, rule = OVERFIT_RULE) {
  const n = history.length;
  if (n === 0 || history[0].heldOut.loss === null) return { warning: false, bestEpoch: null, best: null };
  let m = 0;
  for (let k = 1; k < n; k++) if (history[k].heldOut.loss < history[m].heldOut.loss) m = k;
  const best = history[m].heldOut.loss;
  const result = { warning: false, bestEpoch: history[m].epoch, best };
  if (history[n - 1].epoch <= rule.after || n - 1 - m < rule.run) return result;
  for (let k = n - rule.run; k < n; k++) if (!(history[k].heldOut.loss > best * (1 + rule.margin))) return result;
  if (!(history[n - 1].practice.loss < history[m].practice.loss)) return result;
  return { ...result, warning: true };
}
