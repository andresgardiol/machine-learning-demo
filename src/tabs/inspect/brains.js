// Qué cerebro se inspecciona (pestana-inspeccionar, design.md D11), sin DOM: los candidatos (tus
// cerebros y los de ejemplo), cuál se muestra al abrir, dónde entrenó cada uno y en qué escenario
// maneja al elegirlo, y la forma de su red.
//
//   clave            qué es
//   brain:<id>       un cerebro guardado o un autoguardado (entrenamiento en curso o anterior)
//   example:<id>     un cerebro de ejemplo
import { validateBrain, scenarioTracks, copyBrain } from '../../core/brain.js';
import { TRACK_IDS } from '../../core/circuits.js';
import { DEFAULT_LANES } from '../../core/constants.js';
import { DEFAULT_TRAFFIC } from '../../core/traffic.js';

/** Ejemplo que se muestra si la persona nunca entrenó ni guardó nada (D11). */
export const DEFAULT_EXAMPLE = 'street-new';

/** Grupos del selector, en orden. */
export const PICKER_GROUPS = Object.freeze(['brains', 'examples']);

/**
 * Candidatos, en el orden del selector: primero los de la biblioteca (como los da library.list()),
 * después los de ejemplo. Cada uno: { key, kind: 'brain'|'example', origin, slot, brain, available,
 * signature, nameKey?, name? }. `signature` cambia si el cerebro cambia (su fecha de actualización).
 */
export function listBrains({ library = [], examples = [] }) {
  const out = [];
  for (const e of library) {
    const ok = validateBrain(e.brain) === null;
    out.push({
      key: `brain:${e.brain.id}`, kind: 'brain', origin: e.origin, slot: e.slot ?? null, brain: e.brain, available: ok,
      signature: `brain:${e.brain.id}:${e.brain.updatedAt}`,
      ...(e.origin === 'autosave' ? { nameKey: e.slot === 'previous' ? 'library.autosave.previous' : 'library.autosave.current' } : { name: e.brain.name }),
    });
  }
  for (const b of examples) {
    out.push({
      key: `example:${b.id}`, kind: 'example', origin: 'example', slot: null, brain: b, available: validateBrain(b) === null,
      signature: `example:${b.id}`, nameKey: `compete.example.${b.id}`,
    });
  }
  return out;
}

/**
 * Cerebro que se muestra al abrir por primera vez (D11): el del entrenamiento en curso; si no hay,
 * el del entrenamiento anterior; si no hay, el ejemplo de la calle con tráfico nuevo.
 */
export function defaultKey(candidates) {
  const ok = candidates.filter((c) => c.available);
  const slot = (s) => ok.find((c) => c.origin === 'autosave' && c.slot === s);
  return (slot('current') ?? slot('previous') ?? ok.find((c) => c.key === `example:${DEFAULT_EXAMPLE}`) ?? ok[0] ?? null)?.key ?? null;
}

/**
 * Qué mostrar al montar la pestaña: el elegido si sigue disponible (con su versión actual), o el de
 * por defecto. Devuelve { key, updated, removed }: `updated` si el mismo cerebro cambió desde la
 * última vez (sus cambios de prueba se descartan), `removed` si el elegido ya no está.
 */
export function resolveChoice(candidates, { key = null, signature = null } = {}) {
  const found = key ? candidates.find((c) => c.key === key && c.available) : null;
  if (found) return { key, updated: signature !== null && found.signature !== signature, removed: false };
  return { key: defaultKey(candidates), updated: false, removed: key !== null };
}

/** Escenario donde más generaciones entrenó un cerebro: { track, lanes, density, irregularity }. */
export function trainedScenario(brain) {
  const scenarios = (brain?.training?.scenarios ?? []).filter((s) => s.generations > 0);
  if (scenarios.length === 0) return { track: 'straight', lanes: DEFAULT_LANES, density: DEFAULT_TRAFFIC.density, irregularity: 0 };
  let best = scenarios[0];
  for (const s of scenarios) if (s.generations > best.generations) best = s;
  const tracks = scenarioTracks(best.track).filter((id) => TRACK_IDS.includes(id));
  return { track: tracks[0] ?? 'straight', lanes: best.lanes, density: best.density, irregularity: best.irregularity };
}

/** Pistas donde entrenó un cerebro, en el orden del catálogo. */
export function trainedTracks(brain) {
  const ids = new Set((brain?.training?.scenarios ?? []).filter((s) => s.generations > 0).flatMap((s) => scenarioTracks(s.track)));
  return TRACK_IDS.filter((id) => ids.has(id));
}

/** Copia de trabajo de un cerebro: la pestaña nunca toca el cerebro guardado. */
export const workingCopy = (brain) => copyBrain(brain);

/** Forma de la red para el panel: { inputs, hidden: [..], outputs }. */
export function shapeText(net) {
  return { inputs: net.sizes[0], hidden: net.sizes.slice(1, -1), outputs: net.sizes[net.sizes.length - 1] };
}
