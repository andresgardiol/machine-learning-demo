// Aviso de sobreajuste (pestana-laboratorio, design.md D9), sin DOM.
//
// La red está memorizando cuando, después de la época 20, el error de los apartados lleva 10 épocas
// seguidas más de un 10 % y más de 0,1 por encima de su mínimo, y el de práctica está por debajo del
// que tenía en ese mínimo. El margen absoluto (consulta 2.3) evita que el vaivén normal de un error
// ya chico (≈ 0,05 con los valores por defecto) dispare el aviso.
//
// El aviso no es fijo (consulta 2.3): sigue mientras el error de los apartados esté por encima de su
// mínimo; si marca un mínimo nuevo, se retira, y puede volver contra el mínimo nuevo (trackWarning).

export const OVERFIT_RULE = Object.freeze({ after: 20, run: 10, margin: 0.1, absolute: 0.1 });

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
  for (let k = n - rule.run; k < n; k++) {
    const h = history[k].heldOut.loss;
    if (!(h > best * (1 + rule.margin) && h - best > (rule.absolute ?? 0))) return result;
  }
  if (!(history[n - 1].practice.loss < history[m].practice.loss)) return result;
  return { ...result, warning: true };
}

/**
 * Sigue el aviso época a época. `previous` es el estado anterior ({ active, since, appearances }).
 * Devuelve el estado nuevo y si el aviso apareció (`appeared`) o se retiró (`retired`) en esta época.
 */
export function trackWarning(previous, history, rule = OVERFIT_RULE) {
  const prev = previous ?? { active: false, since: null, appearances: 0 };
  const o = overfitting(history, rule);
  const last = history[history.length - 1];
  if (prev.active) {
    // Un mínimo nuevo de los apartados (esta época) retira el aviso.
    if (o.bestEpoch === last.epoch) return { state: { active: false, since: null, appearances: prev.appearances }, appeared: false, retired: true, bestEpoch: o.bestEpoch };
    return { state: prev, appeared: false, retired: false, bestEpoch: o.bestEpoch };
  }
  if (o.warning) return { state: { active: true, since: last.epoch, appearances: prev.appearances + 1 }, appeared: true, retired: false, bestEpoch: o.bestEpoch };
  return { state: prev, appeared: false, retired: false, bestEpoch: o.bestEpoch };
}
