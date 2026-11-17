// Misión en curso de una pestaña (tarjeta-de-consigna D2): la primera sin cumplir, en el orden de la
// lista. Sin DOM: la usan la tarjeta de consigna y la marca de la lista, y se prueba en Node.

/**
 * @param {{done:boolean}[]} missions misiones de la pestaña, en el orden de la lista
 * @param {{available?: boolean}} [opts] available: falso si el modo actual no tiene misiones
 *   (por ejemplo, un circuito en El problema)
 * @returns {null | {allDone: true} | object} null sin misiones; la primera sin cumplir; o allDone
 */
export function currentMission(missions, { available = true } = {}) {
  if (!available || !Array.isArray(missions) || missions.length === 0) return null;
  const next = missions.find((m) => !m.done);
  return next ?? { allDone: true };
}
