// Qué control muestra "Mostrame" para cada misión (misiones-que-muestran-el-control D1). Sin DOM: la
// tabla se prueba en Node, y cada pestaña traduce las claves a sus nodos.
//
// Cada entrada es `null` (la misión se cumple manejando o esperando: sin botón) o
// `{ targets: [clave…], view?, select? }`:
//   - targets: nombres estables de control. El primero recibe el foco y es el que se trae a la vista.
//   - view: la vista del panel que hay que abrir antes (Entrenar → 'settings').
//   - select: lo que hay que elegir antes en Inspeccionar ('firstInput' o 'firstHidden').

const fixed = (targets, extra = {}) => () => Object.freeze({ targets: Object.freeze([...targets]), ...extra });
const none = () => null;

const TABLE = Object.freeze({
  drive: {
    pass: none,
    distance: none,
    machine: fixed(['machineView']),
  },
  rules: {
    pass: fixed(['editor']),
    passMany: fixed(['editor']),
    traffics: fixed(['newTraffic']),
  },
  train: {
    generations: none,
    passed: none,
    save: fixed(['save']),
    fitness: fixed(['fitness'], { view: 'settings' }),
  },
  compete: {
    tracks: fixed(['track']),
    unseen: fixed(['track']),
    beatBrain: fixed(['run']),
  },
  inspect: {
    // El foco va a Paso; «De a: Operación» se marca junto con él.
    follow: fixed(['step', 'sizeOperation']),
    decision: fixed(['manualInput'], { select: 'firstInput' }),
    off: fixed(['turnOff'], { select: 'firstHidden' }),
  },
  lab: {
    gateAnd: fixed(['firstWeight']),
    gateOr: (s) => (s.gate !== 'or' ? fixed(['gateOr'])() : fixed(['firstWeight'])()),
    // Con XOR y sin capa oculta, "Agregar una capa oculta" recién aparece cuando la guía explica que
    // una recta no alcanza (`addHidden`); antes, el primer peso, que es lo que hay que probar.
    gateXor: (s) => {
      if (s.gate !== 'xor') return fixed(['gateXor'])();
      if ((s.hiddenLayers ?? 0) === 0 && s.addHidden) return fixed(['addHidden'])();
      return fixed(['firstWeight'])();
    },
    follow: fixed(['step', 'sizePhase']),
    memorize: fixed(['count', 'noise', 'hiddenLayers']),
    save: fixed(['saveBrain']),
  },
});

/** Las misiones de cada pestaña que tienen una entrada en la tabla. */
export const MISSION_TARGET_TABS = Object.freeze(Object.fromEntries(
  Object.entries(TABLE).map(([tab, rows]) => [tab, Object.freeze(Object.keys(rows))])));

/**
 * @param {string} tab 'drive' | 'rules' | 'train' | 'compete' | 'inspect' | 'lab'
 * @param {string} missionId id de la misión en la sesión de la pestaña
 * @param {{gate?: string, hiddenLayers?: number, addHidden?: boolean}} [state] lo mínimo para decidir
 *   (en el Laboratorio: la compuerta elegida, las capas ocultas y si "Agregar una capa oculta" está a la vista)
 * @returns {null | {targets: string[], view?: string, select?: string}}
 */
export function missionTarget(tab, missionId, state = {}) {
  const row = TABLE[tab]?.[missionId];
  if (!row) return null;
  return row(state ?? {});
}
