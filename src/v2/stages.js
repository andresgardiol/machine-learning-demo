// Catálogo de etapas de la V2 (informe 1.4 y design.md D-elegida), sin DOM. Cinco etapas en el riel;
// Aprender tiene dos sub-pasos, cada uno con su pantalla. `v1Tab` es la pestaña equivalente de la V1.

export const STAGES = Object.freeze([
  { id: 'problema', number: 1, group: 'problema', v1Tab: 'drive' },
  { id: 'reglas', number: 2, group: 'reglas', v1Tab: 'rules' },
  { id: 'evolucion', number: 3, group: 'aprender', sub: 'evolucion', v1Tab: 'train' },
  { id: 'gradiente', number: 3, group: 'aprender', sub: 'gradiente', v1Tab: 'lab' },
  { id: 'evaluar', number: 4, group: 'evaluar', v1Tab: 'compete' },
  { id: 'entender', number: 5, group: 'entender', v1Tab: 'inspect' },
]);

/** Las cinco entradas del riel, en orden, con los sub-pasos de Aprender. */
export const RAIL = Object.freeze([
  { group: 'problema', number: 1, stages: ['problema'] },
  { group: 'reglas', number: 2, stages: ['reglas'] },
  { group: 'aprender', number: 3, stages: ['evolucion', 'gradiente'] },
  { group: 'evaluar', number: 4, stages: ['evaluar'] },
  { group: 'entender', number: 5, stages: ['entender'] },
]);

export const DEFAULT_STAGE = 'problema';
export const stageById = (id) => STAGES.find((s) => s.id === id) ?? null;

/** Etapa pedida en la dirección (#evaluar), o la recordada, o la primera. */
export function pickStage({ hash = '', remembered = null } = {}) {
  const fromHash = hash.replace(/^#/, '');
  if (stageById(fromHash)) return fromHash;
  if (stageById(remembered)) return remembered;
  return DEFAULT_STAGE;
}

/** Clave de la pregunta de una etapa (la de su grupo: los dos sub-pasos de Aprender comparten la pregunta). */
export const questionKey = (id) => `question.${stageById(id)?.group ?? DEFAULT_STAGE}`;
