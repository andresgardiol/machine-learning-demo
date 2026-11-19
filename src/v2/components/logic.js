// Lógica sin DOM de los componentes de la V2 (tarea 8.1). Tiene pruebas en tests/v2/components-logic.test.js.

/** Al menos 8 s de "Deshacer" (spec *Reinicios con alcance explícito*). */
export const UNDO_MS = 8000;

/**
 * Cuenta de un "Deshacer": se abre con una acción que perdió trabajo, vence a los `ms` y se puede usar
 * una sola vez. El reloj se inyecta para probarla.
 */
export function createUndo({ ms = UNDO_MS, now = () => Date.now() } = {}) {
  let pending = null; // { restore, until }
  return {
    offer(restore) { pending = { restore, until: now() + ms }; return pending.until; },
    get open() { return pending !== null && now() < pending.until; },
    get remainingMs() { return pending ? Math.max(0, pending.until - now()) : 0; },
    use() {
      if (!this.open) { pending = null; return false; }
      const { restore } = pending;
      pending = null;
      restore();
      return true;
    },
    dismiss() { pending = null; },
  };
}

/**
 * Qué ajustes se ven según el estado (spec *Lo que no aplica, oculto*): cada regla es una función del
 * estado que devuelve si el ajuste aplica. Los que no tienen regla se ven siempre.
 */
export function visibleSettings(keys, rules, state) {
  return keys.filter((k) => !rules[k] || rules[k](state));
}

/** Reglas de Aprender: las neuronas de una capa se ven solo si la capa existe. */
export const LEARN_VISIBILITY = Object.freeze({
  neurons1: (s) => s.hiddenLayers >= 1,
  neurons2: (s) => s.hiddenLayers >= 2,
  neurons3: (s) => s.hiddenLayers >= 3,
  activation: (s) => s.hiddenLayers >= 1,
});

/** Hoja con la que abre una etapa: la recordada si existe, o la primera (spec *El mentor vuelve a su hoja*). */
export function sheetToOpen(ids, remembered) {
  return ids.includes(remembered) ? remembered : ids[0] ?? null;
}

/** Valor de un deslizador ajustado a su rango y a su paso. */
export function clampStep(value, { min, max, step = 1 }) {
  const v = Math.min(max, Math.max(min, Number(value)));
  const n = Math.round((v - min) / step);
  return Number((min + n * step).toFixed(10));
}
