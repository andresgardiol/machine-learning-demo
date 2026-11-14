// Misiones de Inspeccionar (pestana-inspeccionar, design.md D14), sin DOM. No bloquean nada.
//
//   follow    seguir una cuenta: avanzar de a una operación las cuatro de una misma neurona
//   decision  cambiar una decisión: con una entrada a mano, que cambie alguna de las cuatro acciones
//   off       apagar una neurona y reproducir al menos tres segundos
import { STEP } from '../../core/constants.js';

export const MISSION_IDS = Object.freeze(['follow', 'decision', 'off']);
/** Segundos de reproducción con una neurona apagada para cumplir la tercera misión. */
export const OFF_SECONDS = 3;

/** @param {{completed?: Set<string>}} [spec] misiones ya cumplidas (se conservan hasta cerrar la app) */
export function createInspectMissions({ completed = new Set() } = {}) {
  let frameOps = new Map(); // neurona 'l:j' → operaciones hechas de a una en este cuadro
  let offFrames = 0;
  const done = (id) => { completed.add(id); };

  return {
    get missions() { return MISSION_IDS.map((id) => ({ id, done: completed.has(id) })); },
    isDone: (id) => completed.has(id),
    /** Empezó la cuenta de otro cuadro. */
    newFrame() { frameOps = new Map(); },
    /**
     * Se dio un paso del cursor de tamaño `size` que hizo las operaciones `ops` ({layer, neuron, op}).
     */
    stepped(size, ops) {
      if (size !== 'operation') { for (const o of ops) frameOps.delete(`${o.layer}:${o.neuron}`); return; }
      for (const o of ops) {
        const key = `${o.layer}:${o.neuron}`;
        const set = frameOps.get(key) ?? new Set();
        set.add(o.op);
        frameOps.set(key, set);
        if (set.size === 4) done('follow');
      }
    },
    /** Con entradas a mano: ¿la decisión es otra que con lo que ve el auto? */
    manualDecision({ manual, outputs, real }) {
      if (!manual) return;
      if (outputs.some((v, i) => v !== real[i])) done('decision');
    },
    /** Pasaron `frames` cuadros reproduciendo; `anyOff`: hay alguna neurona apagada. */
    played(frames, anyOff) {
      if (!anyOff) { offFrames = 0; return; }
      offFrames += frames;
      if (offFrames * STEP >= OFF_SECONDS - 1e-9) done('off');
    },
  };
}
