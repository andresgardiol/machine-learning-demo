// Misiones de Competir (pestana-competir, design.md D15), sin DOM. Se evalúan al terminar cada
// carrera; una misión cumplida sigue marcada hasta cerrar la aplicación. No bloquean nada.
import { TRACK_IDS } from '../../core/circuits.js';
import { trainedOn } from './marks.js';

export const MISSIONS = Object.freeze([
  Object.freeze({ id: 'tracks', goal: TRACK_IDS.length, unit: 'tracks' }),
  Object.freeze({ id: 'unseen', goal: 1, unit: 'none' }),
  Object.freeze({ id: 'beatBrain', goal: 1, unit: 'none' }),
]);

/**
 * @param {{completed?: Set<string>, tracks?: Set<string>}} [memory] lo que dura hasta cerrar la aplicación
 */
export function createCompeteMissions({ completed = new Set(), tracks = new Set() } = {}) {
  return {
    /**
     * Una carrera terminó.
     * @param {object} race
     * @param {string} race.track
     * @param {{key:string, kind:string, brain?:object, result:{state?:string, arrived:boolean, crashes:number}}[]} race.entries
     * @param {number[]} race.standings índices de `entries` en orden de carrera
     */
    raceEnded({ track, entries, standings }) {
      tracks.add(track);
      if (tracks.size >= TRACK_IDS.length) completed.add('tracks');
      const brains = (e) => e.kind === 'brain' || e.kind === 'example';
      if (entries.some((e) => brains(e) && e.result.crashes > 0 && !trainedOn(e.brain, track))) completed.add('unseen');
      const human = entries.findIndex((e) => e.kind === 'human');
      if (human >= 0 && entries[human].result.arrived) {
        const at = standings.indexOf(human);
        if (standings.slice(at + 1).some((i) => brains(entries[i]))) completed.add('beatBrain');
      }
    },
    get missions() {
      return MISSIONS.map((m) => ({
        ...m,
        done: completed.has(m.id),
        progress: m.id === 'tracks' ? Math.min(tracks.size, m.goal) : (completed.has(m.id) ? 1 : 0),
      }));
    },
  };
}
