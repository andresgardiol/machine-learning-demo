// Pestaña 1, "El problema". Composición de mundo, controlador de teclado y vista.
// (El panel, los indicadores y los controles de la pestaña se completan en el grupo 10 de tasks.md.)
import { createWorld } from '../../core/world.js';
import { createKeyboardController } from '../../input/keyboard.js';
import { createStageView } from '../../render/view.js';
import { createLoop } from '../../ui/loop.js';
import { el } from '../../ui/dom.js';

export const DEFAULT_SEED = 1;

export function mount({ stage, panel, reportError }) {
  panel.append(el('h1', { class: 'panel-title', i18n: 'drive.title' }));

  const keyboard = createKeyboardController();
  const world = createWorld({ seed: DEFAULT_SEED, controller: keyboard });
  const view = createStageView({ container: stage });
  const options = { showSensors: true, machineView: false };
  const loop = createLoop({
    step: () => world.step(),
    render: () => view.render(world, options),
    onError: reportError,
  });
  loop.start();

  return {
    world, view, options, loop,
    unmount() {
      loop.dispose();
      keyboard.dispose();
      view.dispose();
    },
  };
}
