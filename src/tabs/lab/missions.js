// Misiones del Laboratorio (pestana-laboratorio, design.md D12), sin DOM. No bloquean nada.
//
//   follow    seguir una corrección entera: avanzar paso a paso (de a fase, capa o neurona) las cuatro
//             fases de un mismo ejemplo
//   memorize  hacer que la red memorice: que aparezca el aviso de sobreajuste (queda cumplida aunque
//             después el aviso se retire)
//   save      guardar un cerebro que aprendió a manejar imitando
//
// Con compuertas, otro juego (laboratorio-empieza-por-compuertas D10):
//   gateAnd   AND con 4 de 4 sin capas ocultas y sin que el aprendizaje haya dado pasos con AND ("a mano")
//   gateOr    lo mismo con OR
//   gateXor   XOR con 4 de 4 y capas ocultas, a mano o aprendiendo
export const MISSION_IDS = Object.freeze(['follow', 'memorize', 'save']);
export const GATE_MISSION_IDS = Object.freeze(['gateAnd', 'gateOr', 'gateXor']);
/** Las misiones de una clase de datos. */
export const missionIdsFor = (kind) => (kind === 'gates' ? GATE_MISSION_IDS : MISSION_IDS);
const SMALL = new Set(['phase', 'layer', 'neuron']);

/** @param {{completed?: Set<string>}} [spec] misiones ya cumplidas (se conservan hasta cerrar la app) */
export function createLabMissions({ completed = new Set() } = {}) {
  let exampleKey = null;
  let phases = new Set();
  const done = (id) => { completed.add(id); };
  return {
    get missions() { return MISSION_IDS.map((id) => ({ id, done: completed.has(id) })); },
    /** Las misiones de una clase de datos, con si están cumplidas. */
    missionsFor: (kind) => missionIdsFor(kind).map((id) => ({ id, done: completed.has(id) })),
    /**
     * Cómo quedó la tabla de verdad: { gate, hidden (capas ocultas), solved (4 de 4), handOnly }.
     * Devuelve la misión que se cumplió ahora, o null.
     */
    gates({ gate, hidden, solved, handOnly }) {
      if (!solved) return null;
      const id = gate === 'xor' ? (hidden > 0 ? 'gateXor' : null) : hidden === 0 && handOnly ? (gate === 'and' ? 'gateAnd' : 'gateOr') : null;
      if (!id || completed.has(id)) return null;
      done(id);
      return id;
    },
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
