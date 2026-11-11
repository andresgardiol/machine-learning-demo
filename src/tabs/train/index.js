// Pestaña 3, "Entrenar": una población de autos manejados por redes neuronales aprende a esquivar
// el tráfico generación tras generación, a la vista de la persona.
//
// Composición (design.md D14): entrenamiento del núcleo + vista + bucle, y el panel. El
// entrenamiento y los ajustes viven en variables del módulo: al salir de la pestaña se detienen el
// bucle y la vista, y al volver se retoma el mismo entrenamiento. La lógica que se puede probar sin
// DOM vive en settings.js (y, más adelante, en session.js).
import { createTraining } from '../../core/training.js';
import { createStageView } from '../../render/view.js';
import { createLoop } from '../../ui/loop.js';
import { el } from '../../ui/dom.js';
import { createTextSetter } from '../../ui/controls.js';
import { DEFAULT_SETTINGS, normalizeSettings, trainingConfig } from './settings.js';

export const DEFAULT_SEED = 1;

// Estado conservado entre montajes: el entrenamiento sigue donde estaba al volver a la pestaña.
let state = null;

function initialState(store) {
  const settings = normalizeSettings({ ...DEFAULT_SETTINGS, maxSpeed: store?.get().carSpeed ?? DEFAULT_SETTINGS.maxSpeed });
  const seed = DEFAULT_SEED;
  return { settings, seed, training: createTraining({ seed, config: trainingConfig(settings) }) };
}

/** Olvida el entrenamiento conservado (para las pruebas y para reiniciar la aplicación). */
export function resetState() { state = null; }

export function mount({ stage, panel, i18n, store, reportError }) {
  if (!state) state = initialState(store);

  // La velocidad máxima es una sola para toda la app: si cambió en otra pestaña, rige desde la
  // próxima generación, como cualquier cambio de escenario.
  const carSpeed = store?.get().carSpeed;
  if (carSpeed !== undefined && carSpeed !== state.settings.maxSpeed) {
    state.settings = normalizeSettings({ ...state.settings, maxSpeed: carSpeed });
    state.training.configure({ maxSpeed: state.settings.maxSpeed });
  }

  const setText = createTextSetter(i18n);
  const view = createStageView({ container: stage });

  // --- Panel --------------------------------------------------------------------------
  const generation = el('p', { class: 'train-generation' });
  panel.append(
    el('h1', { class: 'panel-title', i18n: 'train.title' }),
    generation);

  function sync() {
    setText(generation, 'train.generation', { value: state.training.generation });
  }

  // --- Bucle ----------------------------------------------------------------------------
  const loop = createLoop({
    step: () => state.training.step(),
    render: () => {
      view.render(state.training.world, { showSensors: state.settings.showSensors });
      sync();
    },
    onError: reportError,
    speed: state.settings.speed,
  });

  const offLanguage = i18n.onChange(() => sync());
  sync();
  loop.start();

  return {
    view, loop,
    get training() { return state.training; },
    get settings() { return { ...state.settings }; },
    unmount() {
      loop.dispose();
      offLanguage();
      view.dispose();
    },
  };
}
