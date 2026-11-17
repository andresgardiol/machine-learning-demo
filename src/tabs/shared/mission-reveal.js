// "Mostrame" en una pestaña (misiones-que-muestran-el-control D2 y D4): busca en la tabla qué control
// muestra la misión en curso, prepara lo que pide (otra vista del panel, o elegir en Inspeccionar),
// traduce las claves a nodos en el cuadro siguiente y llama a revealControls.
import { missionTarget } from '../../ui/mission-targets.js';
import { revealControls } from '../../ui/reveal.js';

/**
 * @param {{tab: string, i18n: object, mission: () => ({id: string}|null),
 *   state?: () => object, nodes: Record<string, () => (Element|null|undefined)>,
 *   prepare?: (target: {view?: string, select?: string}) => void}} spec
 *   mission: la misión en curso; state: lo que la tabla necesita para decidir (Laboratorio);
 *   nodes: cómo encontrar cada clave en el DOM de la pestaña; prepare: cambiar de vista o elegir.
 * @returns {{has: (missionId: string|undefined) => boolean, reveal: (trigger: HTMLElement) => void}}
 */
export function createMissionReveal({ tab, i18n, mission, state = () => ({}), nodes, prepare = () => {} }) {
  const has = (missionId) => Boolean(missionId && missionTarget(tab, missionId, state()));

  function reveal(trigger) {
    const m = mission();
    const target = m ? missionTarget(tab, m.id, state()) : null;
    if (!target) return;
    if (target.view || target.select) prepare(target);
    // Cambiar de vista o elegir rehace el DOM: los nodos se buscan en el cuadro siguiente.
    const raf = globalThis.requestAnimationFrame ?? ((fn) => setTimeout(fn, 16));
    raf(() => {
      const found = target.targets.map((key) => ({ key, node: nodes[key]?.() ?? null }));
      const missing = found.filter((f) => !f.node || f.node.getClientRects?.().length === 0);
      if (missing.length) console.warn(`Mostrame: ${tab}.${m.id} sin nodo para ${missing.map((f) => f.key).join(', ')}`);
      const list = found.filter((f) => f.node && f.node.getClientRects?.().length !== 0).map((f) => f.node);
      revealControls(list, { i18n, trigger });
    });
  }

  return { has, reveal };
}
