// Resultados guardados de Competir (pestana-competir, design.md D8), sin DOM. Por cada competidor y
// pista, el último resultado de una carrera terminada; en la calle recta, uno por tráfico (nuevo y
// de práctica). Cada resultado recuerda con qué ajustes se corrió. Vive hasta cerrar la aplicación.

/** Ajustes que se recuerdan con cada resultado. */
export const RESULT_SETTINGS = Object.freeze(['lanes', 'density', 'irregularity', 'maxSpeed', 'crashPenalty']);
/** Los que valen en un circuito (sin tráfico). */
const CIRCUIT_SETTINGS = Object.freeze(['maxSpeed', 'crashPenalty']);
/** Tráficos de la calle recta, en el orden en que se muestran. */
export const STREET_TRAFFICS = Object.freeze(['new', 'practice']);

const cellKey = (track, traffic) => (track === 'straight' ? `straight:${traffic === 'practice' ? 'practice' : 'new'}` : track);
const pick = (settings) => Object.fromEntries(RESULT_SETTINGS.map((k) => [k, settings[k]]));

/** ¿Se corrió con otros ajustes que `current`? En un circuito el tráfico no cuenta. */
export function otherSettings(stored, current, track) {
  const keys = track === 'straight' ? RESULT_SETTINGS : CIRCUIT_SETTINGS;
  return keys.some((k) => stored[k] !== current[k]);
}

export function createResults() {
  const byCompetitor = new Map(); // clave -> { signature, cells: Map }

  const results = {
    /**
     * Anota una carrera terminada.
     * @param {object} race
     * @param {string} race.track
     * @param {'new'|'practice'} [race.traffic] en la calle recta
     * @param {object} race.settings ajustes con que se corrió (RESULT_SETTINGS)
     * @param {{key:string, signature:string, result:{arrived:boolean, time:number|null, share:number, crashes:number}}[]} race.entries
     */
    record({ track, traffic = 'new', settings, entries }) {
      for (const e of entries) {
        let row = byCompetitor.get(e.key);
        if (!row || row.signature !== e.signature) {
          row = { signature: e.signature, cells: new Map() };
          byCompetitor.set(e.key, row);
        }
        const { arrived, time, share, crashes } = e.result;
        row.cells.set(cellKey(track, traffic), {
          track, traffic: track === 'straight' ? traffic : null, settings: pick(settings), result: { arrived, time, share, crashes },
        });
      }
    },
    /**
     * Resultados de un competidor en una pista: en la calle recta, uno por tráfico corrido (nuevo
     * primero); en un circuito, uno o ninguno. Cada uno con `other`: si se corrió con otros ajustes.
     * Si el competidor cambió (otra firma), no tiene resultados.
     */
    cell(key, signature, track, current) {
      const row = byCompetitor.get(key);
      if (!row || row.signature !== signature) return [];
      const keys = track === 'straight' ? STREET_TRAFFICS.map((t) => cellKey(track, t)) : [track];
      return keys.map((k) => row.cells.get(k)).filter(Boolean)
        .map((c) => ({ ...c, other: current ? otherSettings(c.settings, current, track) : false }));
    },
    /** ¿Tiene algún resultado guardado (con esa firma)? */
    has(key, signature) {
      const row = byCompetitor.get(key);
      return Boolean(row) && row.signature === signature && row.cells.size > 0;
    },
    /**
     * Olvida lo que ya no corresponde (D8): los competidores que ya no existen (un cerebro
     * eliminado) y los que cambiaron (un cerebro actualizado, un programa con otro texto).
     * @param {{key:string, signature:string}[]} candidates
     */
    prune(candidates) {
      const current = new Map(candidates.map((c) => [c.key, c.signature]));
      for (const [key, row] of byCompetitor) if (current.get(key) !== row.signature) byCompetitor.delete(key);
    },
    clear() { byCompetitor.clear(); },
    get size() { let n = 0; for (const r of byCompetitor.values()) n += r.cells.size; return n; },
  };
  return results;
}
