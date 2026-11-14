// Misiones del Laboratorio (pestana-laboratorio, design.md D12), sin DOM. No bloquean nada.
//
//   follow    seguir una corrección entera: avanzar paso a paso (de a fase, capa o neurona) las cuatro
//             fases de un mismo ejemplo
//   memorize  hacer que la red memorice: que aparezca el aviso de sobreajuste (queda cumplida aunque
//             después el aviso se retire)
//   save      guardar un cerebro que aprendió a manejar imitando
export const MISSION_IDS = Object.freeze(['follow', 'memorize', 'save']);
const SMALL = new Set(['phase', 'layer', 'neuron']);

/** @param {{completed?: Set<string>}} [spec] misiones ya cumplidas (se conservan hasta cerrar la app) */
export function createLabMissions({ completed = new Set() } = {}) {
  let exampleKey = null;
  let phases = new Set();
  const done = (id) => { completed.add(id); };
  return {
    get missions() { return MISSION_IDS.map((id) => ({ id, done: completed.has(id) })); },
    isDone: (id) => completed.has(id),
    /**
     * Se dio un paso de tamaño `size` sobre el ejemplo `key` (época:orden) que hizo las unidades `units`.
     * Solo cuentan los pasos chicos: de a un ejemplo o una época, las fases pasan de corrido.
     */
    stepped(size, key, units) {
      if (key !== exampleKey) { exampleKey = key; phases = new Set(); }
      if (!SMALL.has(size)) { phases = new Set(); return; }
      for (const u of units) phases.add(u.phase);
      if (phases.size === 4) done('follow');
    },
    warned() { done('memorize'); },
    saved() { done('save'); },
  };
}
