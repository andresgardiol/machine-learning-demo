// Pestaña 3, "Entrenar": una población de autos manejados por redes neuronales aprende a esquivar
// el tráfico generación tras generación, a la vista de la persona.
//
// Composición: entrenamiento del núcleo + vista + bucle; el tablero con los indicadores, la línea
// de la última generación, la curva de fitness y la red del líder; y el panel con guía, controles,
// configuración, guardar el campeón, misiones, biblioteca y configuración avanzada. El
// entrenamiento, los ajustes y las misiones cumplidas viven en variables del módulo: al salir de la
// pestaña se detienen el bucle y la vista, y al volver se retoma el mismo entrenamiento. La lógica
// que se puede probar sin DOM vive en settings.js, session.js y shortcuts.js.
//
// Cuándo se aplica cada ajuste (settings.js): al instante; desde la próxima generación (queda
// pendiente y el panel lo indica); o con un entrenamiento nuevo, de inmediato si todavía no terminó
// ninguna generación y con una confirmación en línea si ya terminó alguna.
import { createTraining, NEW_TRAINING_KEYS, SELECTION_MODES } from '../../core/training.js';
import { FITNESS_KINDS } from '../../core/evolution.js';
import { ACTIVATIONS } from '../../core/network.js';
import { TRAFFIC_MODES, copyBrain } from '../../core/brain.js';
import { ALLOWED_LANES } from '../../core/constants.js';
import { createStageView } from '../../render/view.js';
import { createNetworkView } from '../../render/network-view.js';
import { createFitnessChart } from '../../ui/chart.js';
import { createLoop, SPEEDS } from '../../ui/loop.js';
import { createLibraryView } from '../../ui/library-view.js';
import { el } from '../../ui/dom.js';
import { statStrip, boardCard } from '../../ui/board.js';
import {
  button, switchButton, sliderRow, optionGroup, createTextSetter, inlineConfirm,
} from '../../ui/controls.js';
import {
  DEFAULT_SETTINGS, SETTINGS, normalizeSettings, trainingConfig, classifyChanges, adoptBrain,
} from './settings.js';
import { createTrainSession, indicators, lastGeneration, parentStatus, leaderLabelKey } from './session.js';
import { shortcutFor, toggleTurbo } from './shortcuts.js';

export const DEFAULT_SEED = 1;

const SPEC = new Map(SETTINGS.map((s) => [s.key, s]));

/** Formato del valor de cada deslizador (clave del texto). */
const FORMATS = Object.freeze({
  population: 'train.value.cars',
  mutationStrength: 'drive.value.percent',
  elite: 'train.value.count',
  selection: 'drive.value.percent',
  mutationRate: 'drive.value.percent',
  maxDuration: 'train.value.seconds',
  density: 'drive.value.percent',
  irregularity: 'drive.value.percent',
  maxSpeed: 'drive.value.speed',
  hiddenLayers: 'train.value.layers',
  neurons1: 'train.value.neurons',
  neurons2: 'train.value.neurons',
  neurons3: 'train.value.neurons',
  sensorCount: 'drive.value.rays',
  sensorRange: 'drive.value.carLengths',
  sensorSpread: 'drive.value.degrees',
});

// Estado conservado entre montajes: el entrenamiento sigue donde estaba al volver a la pestaña.
let state = null;
// Misiones cumplidas: siguen marcadas hasta cerrar la aplicación, aunque se reinicie el entrenamiento.
const completedMissions = new Set();
// Secciones y grupos plegables del panel abiertos: se conservan al salir de la pestaña y volver.
const open = { library: false, advanced: false, evolution: false, scenario: false, network: false, sensors: false };

let sessionCounter = 0;
/** Identificador del entrenamiento para el autoguardado (cambia con cada entrenamiento nuevo). */
const newSession = () => `training-${Date.now().toString(36)}-${++sessionCounter}`;

/** Olvida el estado conservado (para reiniciar la aplicación). */
export function resetState() { state = null; }

/** Ajustes de la sección avanzada que no se usan con selección manual: hay un solo padre. */
const NOT_IN_MANUAL = Object.freeze(['elite', 'selection', 'crossover']);

/** Configuración del entrenamiento sin los ajustes que piden un entrenamiento nuevo. */
function nextGenerationConfig(settings) {
  const config = trainingConfig(settings);
  for (const k of NEW_TRAINING_KEYS) delete config[k];
  return config;
}

export function mount({ stage, board, panel, i18n, store, library, reportError }) {
  if (!state) {
    const settings = normalizeSettings({ ...DEFAULT_SETTINGS, maxSpeed: store?.get().carSpeed ?? DEFAULT_SETTINGS.maxSpeed });
    state = {
      settings, seed: DEFAULT_SEED, paused: false,
      brain: null, // cerebro desde el que se continúa (copia; el de la biblioteca no cambia)
      brainSource: null, // identificador del cerebro guardado del que vino, para ofrecer actualizarlo
      training: createTraining({ seed: DEFAULT_SEED, config: trainingConfig(settings) }),
      session: newSession(),
      missions: createTrainSession({ completed: completedMissions }),
    };
    library?.beginTraining(state.session);
  }

  // La velocidad máxima es una sola para toda la app: si cambió en otra pestaña, rige desde la
  // próxima generación, como cualquier cambio de escenario.
  const carSpeed = store?.get().carSpeed;
  if (carSpeed !== undefined && carSpeed !== state.settings.maxSpeed) {
    state.settings = normalizeSettings({ ...state.settings, maxSpeed: carSpeed });
    state.training.configure({ maxSpeed: state.settings.maxSpeed });
  }

  const setText = createTextSetter(i18n);
  const view = createStageView({ container: stage, store });
  const focusStage = () => stage.focus({ preventScroll: true });

  // --- Entrenamiento ------------------------------------------------------------------------
  let offGeneration = () => {};

  /** Se suscribe al entrenamiento en curso: curva, misiones y autoguardado al terminar cada generación. */
  function attachTraining() {
    offGeneration();
    offGeneration = state.training.onGeneration((record) => {
      chart.update(state.training.history);
      state.missions.generationEnded(record);
      autosave();
      view.followCar();
    });
  }

  /** Autoguarda el campeón del entrenamiento en curso (la biblioteca limita las escrituras). */
  function autosave() {
    if (!library) return;
    const brain = state.training.brain({ id: `autosave-${state.session}`, name: i18n.t('library.autosave.name'), now: new Date().toISOString() });
    if (brain) library.autosave(brain, { session: state.session });
  }

  /** Empieza un entrenamiento nuevo con los ajustes actuales (y, si hay, desde el cerebro cargado). */
  function startTraining({ seed = state.seed } = {}) {
    state.seed = seed;
    state.training = createTraining({ seed, config: trainingConfig(state.settings), brain: state.brain });
    state.session = newSession();
    library?.beginTraining(state.session);
    state.missions.restart();
    attachTraining();
    chart.update(state.training.history);
    view.followCar();
    sync();
  }

  /** Pide confirmación si ya terminó alguna generación; si no, aplica de inmediato. */
  function withProgressCheck(confirm, message, apply, { onCancel } = {}) {
    const done = state.training.completed;
    if (done === 0) { apply(); return; }
    confirm.open({ message, params: { value: done }, onConfirm: apply, onCancel });
  }

  // --- Ajustes ------------------------------------------------------------------------------
  /**
   * Aplica ajustes nuevos según su grupo. `confirm` es la confirmación junto al control que pidió
   * el cambio, por si el cambio empieza un entrenamiento nuevo.
   */
  function applySettings(next, confirm = networkConfirm) {
    const target = normalizeSettings(next);
    const changes = classifyChanges(state.settings, target);
    if (changes.newTraining.length > 0) {
      withProgressCheck(confirm, 'train.confirm.newTraining', () => {
        state.settings = target;
        store?.set({ carSpeed: target.maxSpeed });
        startTraining();
      }, { onCancel: () => sync() });
      sync(); // mientras se espera la confirmación, los controles muestran el valor vigente
      return;
    }
    state.settings = target;
    if (changes.nextGeneration.length > 0) {
      state.training.configure(nextGenerationConfig(target));
      store?.set({ carSpeed: target.maxSpeed });
    }
    if (changes.instant.includes('speed')) loop.setSpeed(target.speed);
    sync();
  }
  const setSetting = (key, value, confirm) => applySettings({ ...state.settings, [key]: value }, confirm);

  // --- Acciones ------------------------------------------------------------------------------
  function togglePause() {
    state.paused = !state.paused;
    if (state.paused) library?.flush();
    sync();
  }
  function nextGeneration() { state.training.finishGeneration(); sync(); }
  /** ¿La persona eligió la selección manual? Decide si se ven y se atienden elegir y deshacer (design.md D6). */
  const manualWanted = () => state.settings.selectionMode === 'manual';
  /** Elegir al líder como padre: funciona en marcha y en pausa, sin tocar la generación en curso. */
  function chooseLeader() {
    if (!manualWanted()) return;
    state.training.chooseLeader();
    sync();
  }
  function undoChoice() {
    if (!manualWanted()) return;
    state.training.undoChoice();
    sync();
  }
  function setSpeed(speed) { setSetting('speed', speed); }
  function restart() { withProgressCheck(toolbarConfirm, 'train.confirm.restart', () => startTraining({ seed: state.seed })); }
  function newPopulation() { withProgressCheck(toolbarConfirm, 'train.confirm.newPopulation', () => startTraining({ seed: state.seed + 1 })); }
  function resetSettings() {
    const keep = { speed: state.settings.speed, showSensors: state.settings.showSensors, showNetwork: state.settings.showNetwork, showChart: state.settings.showChart };
    applySettings({ ...DEFAULT_SETTINGS, ...keep }, resetConfirm);
  }

  // --- Biblioteca: guardar el campeón y seguir entrenando ----------------------------------------
  /** Cerebro guardado del que viene el entrenamiento en curso, si sigue en la biblioteca. */
  function sourceEntry() {
    if (!state.brainSource || !library) return null;
    const e = library.get(state.brainSource);
    return e && e.origin === 'saved' ? e : null;
  }

  /** ¿Hay qué guardar? El campeón o, con selección manual vigente, el padre elegido (design.md D4). */
  const canSave = () => (state.training.config.selectionMode === 'manual' ? state.training.parent !== null : state.training.champion !== null);

  function championBrain() {
    return state.training.brain({ id: 'champion', name: 'champion', now: new Date().toISOString() });
  }

  function saveChampion({ update = false } = {}) {
    const brain = championBrain();
    if (!brain || !library) return;
    const source = sourceEntry();
    const r = update && source
      ? library.update(source.brain.id, brain)
      : library.save(brain, { name: nameInput.value, baseName: i18n.t('library.defaultName') });
    if (!r.ok) { showSaveMessage('library.error.damaged'); return; }
    if (!update) state.brainSource = r.brain.id; // lo que se siga entrenando se puede actualizar en este cerebro
    nameInput.value = '';
    state.missions.brainSaved();
    showSaveMessage(r.warning ? `library.status.${r.warning}` : (update ? 'library.updated' : 'library.saved'), { name: r.brain.name });
    sync();
  }

  /** Seguir entrenando un cerebro: adopta su red y sus sensores y empieza un entrenamiento desde él. */
  function continueFrom(entry, confirm) {
    withProgressCheck(confirm, 'train.confirm.continue', () => {
      state.brain = copyBrain(entry.brain);
      state.brainSource = entry.origin === 'saved' ? entry.brain.id : null;
      state.settings = adoptBrain(state.settings, entry.brain);
      startTraining();
      libraryView.showMessage('library.continuing', { name: entry.brain.name });
    });
  }

  // --- Panel (design.md D9): guía, marcha, vista, configuración, guardar, misiones y plegables -------
  const intro = el('p', { class: 'guide train-intro', i18n: 'train.guide' });

  // Marcha: pausar y siguiente en un renglón; las velocidades en otro; reiniciar y población nueva,
  // más chicos, debajo, con su confirmación.
  const pauseButton = button('train.pause', 'train.pause', togglePause);
  pauseButton.setAttribute('aria-pressed', 'false');
  const nextButton = button('train.next', 'train.next', nextGeneration);
  const restartButton = button('train.restart', 'train.restart', restart, 'tool small');
  const newPopulationButton = button('train.newPopulation', 'train.newPopulation', newPopulation, 'tool small');
  const toolbarConfirm = inlineConfirm({ i18n });
  // Selección manual: elegir al líder y deshacer en un renglón, con la línea de estado del padre debajo.
  const chooseButton = button('train.choose', 'train.choose', chooseLeader, 'tool primary');
  const undoButton = button('train.undo', 'train.undo', () => {
    if (undoButton.getAttribute('aria-disabled') === 'true') return;
    undoChoice();
  });
  const parentLine = el('p', { class: 'parent-status', attrs: { role: 'status' } });
  const manualRow = el('div', { class: 'run-manual' }, chooseButton, undoButton);

  // Quién elige al padre: encabeza la marcha (design.md D6). Es un modo, no un parámetro: decide qué
  // botones aparecen debajo, qué se guarda y qué ajustes avanzados valen. El aviso de que rige desde
  // la próxima generación va junto a él.
  const selectionMode = optionGroup({
    labelKey: 'train.setting.selectionMode',
    labelHelp: 'train.setting.selectionMode',
    selected: state.settings.selectionMode,
    options: SELECTION_MODES.map((v) => ({ value: v, i18n: `train.selectionMode.${v}`, help: `train.selectionMode.${v}` })),
    onSelect: (v) => { if (v !== state.settings.selectionMode) setSetting('selectionMode', v); },
  });
  selectionMode.row.classList.add('run-mode');
  const modePending = el('p', { class: 'train-pending mode-pending', attrs: { role: 'status' }, i18n: 'train.mode.pending' });

  const speeds = optionGroup({
    labelKey: 'train.speed',
    labelHelp: 'train.speed',
    selected: state.settings.speed,
    options: SPEEDS.map((s) => (s === 'max'
      ? { value: s, i18n: 'train.speed.max', help: 'train.speed.max', labelKey: 'train.speed.maxLabel' }
      : { value: s, i18n: 'train.speed.option', params: { n: s }, help: 'train.speed', labelKey: 'train.speed.optionLabel' })),
    onSelect: setSpeed,
  });
  const factor = el('p', { class: 'train-factor muted', attrs: { 'aria-live': 'off' } });
  const run = el('section', { class: 'train-run' },
    selectionMode.row, modePending,
    el('div', { class: 'run-main' }, pauseButton, nextButton),
    manualRow, parentLine,
    speeds.row, factor,
    el('div', { class: 'run-secondary' }, restartButton, newPopulationButton),
    toolbarConfirm.node);

  // Misiones
  const missionRows = state.missions.missions.map((m) => {
    const status = el('span', { class: 'mission-status' });
    const fill = el('span', { class: 'mission-fill' });
    const row = el('li', { class: 'mission' },
      el('span', { class: 'mission-name', i18n: `train.mission.${m.id}`, params: { goal: m.goal } }),
      status,
      el('span', { class: 'mission-bar', attrs: { 'aria-hidden': 'true' } }, fill));
    return { id: m.id, row, status, fill };
  });
  const missions = el('section', { class: 'guide train-missions' },
    el('h2', { class: 'panel-heading', i18n: 'train.missions.title' }),
    el('ol', { class: 'mission-list' }, missionRows.map((r) => r.row)));

  // --- Panel: configuración ----------------------------------------------------------------------
  // Una confirmación de entrenamiento nuevo en el grupo de red y otra en el de sensores, junto al
  // ajuste que la pidió.
  const networkConfirm = inlineConfirm({ i18n });
  const sensorsConfirm = inlineConfirm({ i18n });
  const resetConfirm = inlineConfirm({ i18n });

  /** Fila con deslizador para un ajuste. Los que piden un entrenamiento nuevo se aplican al soltar. */
  function slider(key, confirm) {
    const spec = SPEC.get(key);
    const deferred = spec.group === 'newTraining';
    const r = sliderRow({
      id: `train-${key}`, labelKey: `train.setting.${key}`, help: `train.setting.${key}`,
      min: spec.min, max: spec.max, step: spec.step, value: state.settings[key],
      onInput: (v) => {
        // Un ajuste que no aplica (selección manual) ignora el arrastre y conserva su valor.
        if (r.input.getAttribute('aria-disabled') === 'true') { r.input.value = String(state.settings[key]); return; }
        if (deferred) setText(r.value, FORMATS[key], { value: v, kmh: Math.round(v * 3.6) });
        else setSetting(key, v, confirm);
      },
      onChange: (v) => { if (deferred) setSetting(key, v, confirm); },
    });
    return { key, deferred, ...r };
  }
  const toggle = (key) => ({
    key,
    sw: switchButton(`train.setting.${key}`, `train.setting.${key}`, state.settings[key], (e) => {
      if (e.currentTarget.getAttribute('aria-disabled') === 'true') return;
      if (key === 'mutationCooling') { toggleCooling(); return; }
      setSetting(key, !state.settings[key]);
    }),
  });
  /**
   * Enfriar la mutación (fitness-que-premia-superar D9): al apagarlo, la fuerza queda fija en la que
   * mostraba el deslizador (la de la generación siguiente, redondeada), para que no salte.
   */
  function toggleCooling() {
    if (state.settings.mutationCooling) {
      applySettings({ ...state.settings, mutationCooling: false, mutationStrength: Math.round(state.training.nextMutationStrength) });
    } else {
      setSetting('mutationCooling', true);
    }
  }
  const choice = (key, values, optionKey, confirm) => optionGroup({
    labelKey: `train.setting.${key}`,
    labelHelp: `train.setting.${key}`,
    selected: state.settings[key],
    options: values.map((v) => ({ value: v, i18n: `${optionKey}.${v}`, help: `${optionKey}.${v}` })),
    onSelect: (v) => { if (v !== state.settings[key]) setSetting(key, v, confirm); },
  });

  const sliders = [
    slider('population'), slider('mutationStrength'),
    slider('elite'), slider('selection'), slider('mutationRate'), slider('maxDuration'),
    slider('density'), slider('irregularity'), slider('maxSpeed'),
    slider('hiddenLayers', networkConfirm), slider('neurons1', networkConfirm), slider('neurons2', networkConfirm), slider('neurons3', networkConfirm),
    slider('sensorCount', sensorsConfirm), slider('sensorRange', sensorsConfirm), slider('sensorSpread', sensorsConfirm),
  ];
  const row = (key) => sliders.find((s) => s.key === key).row;
  const switches = [toggle('mutationCooling'), toggle('crossover'), toggle('slowRule')];
  const sw = (key) => switches.find((s) => s.key === key).sw;
  const choices = {
    fitness: choice('fitness', FITNESS_KINDS, 'train.fitness'),
    trafficMode: choice('trafficMode', TRAFFIC_MODES, 'train.trafficMode'),
    lanes: optionGroup({
      labelKey: 'train.setting.lanes',
      labelHelp: 'train.setting.lanes',
      selected: state.settings.lanes,
      options: ALLOWED_LANES.map((n) => ({ value: n, i18n: 'drive.lanes.option', params: { n }, help: 'train.setting.lanes', labelKey: 'drive.lanes.optionLabel' })),
      onSelect: (v) => { if (v !== state.settings.lanes) setSetting('lanes', v); },
    }),
    activation: choice('activation', ACTIVATIONS, 'train.activation', networkConfirm),
  };

  // Grupos de opciones con rótulos largos: rótulo arriba y opciones a todo el ancho.
  for (const g of Object.values(choices)) g.row.classList.add('setting-stacked');
  // Las cuatro funciones de fitness van en dos renglones de dos: enteras a cualquier ancho del panel (D5).
  choices.fitness.row.classList.add('fitness-choice');
  const pendingNote = () => el('p', { class: 'train-pending', attrs: { role: 'status' }, i18n: 'train.pending' });
  const basicPending = pendingNote();
  const advancedPending = pendingNote();

  const basic = el('section', { class: 'train-basic' },
    el('h2', { class: 'panel-heading', i18n: 'train.basic.title' }),
    row('population'), row('mutationStrength'), el('div', { class: 'switch-row' }, sw('mutationCooling')), basicPending);

  const sensorsSwitch = switchButton('train.sensors', 'train.sensors', state.settings.showSensors, () => setSetting('showSensors', !state.settings.showSensors));
  const viewSwitches = el('div', { class: 'switch-row train-view', attrs: { role: 'group' }, i18nAttr: 'aria-label:train.view.title' }, sensorsSwitch);

  /** Sección o grupo plegable que recuerda si quedó abierto (variable de módulo `open`). */
  function foldable(key, cls, summaryKey, help, ...children) {
    const d = el('details', { class: cls, attrs: { open: open[key] } },
      el('summary', { i18n: summaryKey, help }), ...children);
    d.addEventListener('toggle', () => { open[key] = d.open; });
    return d;
  }
  const group = (key, ...children) => foldable(key, 'group', `train.advanced.${key}`, `train.advanced.${key}`,
    el('div', { class: 'group-body' }, ...children));

  const resetButton = button('train.resetSettings', 'train.resetSettings', resetSettings);
  const advanced = foldable('advanced', 'section train-advanced', 'train.advanced', 'train.advanced',
    el('div', { class: 'section-body advanced-body' },
      advancedPending,
      el('div', { class: 'groups' },
        group('evolution',
          row('elite'), row('selection'), row('mutationRate'), el('div', { class: 'switch-row' }, sw('crossover')),
          choices.fitness.row, row('maxDuration'), el('div', { class: 'switch-row' }, sw('slowRule')), choices.trafficMode.row),
        group('scenario', choices.lanes.row, row('density'), row('irregularity'), row('maxSpeed')),
        group('network',
          el('p', { class: 'caption', i18n: 'train.advanced.networkNote' }),
          row('hiddenLayers'), row('neurons1'), row('neurons2'), row('neurons3'), choices.activation.row,
          networkConfirm.node),
        group('sensors',
          el('p', { class: 'caption', i18n: 'train.advanced.networkNote' }),
          row('sensorCount'), row('sensorRange'), row('sensorSpread'),
          sensorsConfirm.node)),
      resetButton, resetConfirm.node));

  // Guardar el campeón, siempre a la vista, con su propia línea de resultado.
  const nameInput = el('input', {
    class: 'library-name-input', help: 'train.save.name',
    attrs: { type: 'text', maxlength: 40, id: 'train-save-name' },
    i18nAttr: 'aria-label:train.save.name',
    on: { keydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); if (canSave()) saveChampion(); } } },
  });
  const saveButton = el('button', {
    class: 'tool primary', attrs: { type: 'button' },
    on: { click: () => { if (canSave()) saveChampion(); } },
  });
  const updateButton = el('button', {
    class: 'tool', help: 'train.save.update', attrs: { type: 'button' },
    on: { click: () => { if (canSave()) saveChampion({ update: true }); } },
  });
  const saveRow = el('div', { class: 'save-row' }, nameInput, saveButton);
  const saveActions = el('div', { class: 'save-actions' }, updateButton);
  saveActions.hidden = true;
  const saveStatus = el('p', { class: 'save-status', attrs: { role: 'status' } });
  saveStatus.hidden = true;
  const saveTitle = el('label', { class: 'panel-heading', i18n: 'train.save.title', attrs: { for: 'train-save-name' } });
  const saveBlock = el('section', { class: 'train-save' },
    saveTitle,
    saveRow, saveActions, saveStatus);

  /** Resultado de guardar, junto al botón. */
  function showSaveMessage(key, params) {
    saveStatus.hidden = !key;
    if (key) setText(saveStatus, key, params); else saveStatus.textContent = '';
  }

  // Biblioteca (plegada al abrir); su título muestra cuántos cerebros hay.
  const libraryZone = el('div', { class: 'library-zone' });
  const librarySummary = el('summary', { help: 'library.title' });
  const librarySection = el('details', { class: 'section train-library', attrs: { open: open.library } },
    librarySummary, el('div', { class: 'section-body' }, libraryZone));
  librarySection.addEventListener('toggle', () => { open.library = librarySection.open; });
  const countLibrary = () => setText(librarySummary, 'library.title.count', { value: library ? library.list().length : 0 });
  countLibrary();
  const offLibrary = library ? library.subscribe(countLibrary) : () => {};

  panel.append(
    el('h1', { class: 'sr-only', i18n: 'train.title' }),
    intro, run, viewSwitches, basic, saveBlock, missions, librarySection, advanced);
  const libraryView = library
    ? createLibraryView({ container: libraryZone, library, i18n, onContinue: continueFrom })
    : { showMessage() {}, dispose() {} };

  // --- Tablero: indicadores, última generación, curva y red (design.md D8) ---------------------------
  const strip = statStrip([
    { id: 'generation', labelKey: 'train.stats.generation' },
    { id: 'alive', labelKey: 'train.stats.alive' },
    { id: 'leader', labelKey: leaderLabelKey(state.training.config.fitness) },
    { id: 'passed', labelKey: 'train.stats.passed' },
  ]);
  const lastBest = el('span', { class: 'board-last-best' });
  const lastReason = el('span', { class: 'board-last-reason' });
  const lastLine = el('p', { class: 'board-last', attrs: { role: 'status' } }, lastBest, lastReason);

  // Plegar o desplegar una tarjeta se recuerda al volver a la pestaña (y no cambia el entrenamiento).
  const chartCard = boardCard({
    id: 'train-chart', titleKey: 'train.chart.title', help: 'train.chart', hintKey: 'train.chart.hint.new',
    open: state.settings.showChart, grow: 1,
    onToggle: (open) => { state.settings = { ...state.settings, showChart: open }; if (open) chart.refresh(); },
  });
  const chartZone = el('div', { class: 'chart-zone' });
  chartCard.append(chartZone);

  const networkCard = boardCard({
    id: 'train-network', titleKey: 'train.network.title', help: 'train.network', hintKey: 'train.network.hint',
    open: state.settings.showNetwork, grow: 1.3,
    onToggle: (open) => { state.settings = { ...state.settings, showNetwork: open }; },
  });
  const networkZone = el('div', { class: 'network-zone' });
  const legend = el('ul', { class: 'network-legend' },
    el('li', {}, el('span', { class: 'legend-line', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: 'train.network.legend.positive' })),
    el('li', {}, el('span', { class: 'legend-line negative', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: 'train.network.legend.negative' })),
    el('li', {}, el('span', { class: 'legend-node', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: 'train.network.legend.active' })),
    el('li', { class: 'network-note', i18n: 'train.network.legend.note' }));
  networkCard.append(networkZone, legend);

  board.append(strip.node, lastLine, chartCard.node, networkCard.node);

  const chart = createFitnessChart({ container: chartZone, i18n });
  const networkView = createNetworkView({ container: networkZone, i18n });

  // --- Mensajes sobre el escenario ------------------------------------------------------------------
  const generationBadge = el('div', { class: 'stage-badge generation-badge', attrs: { role: 'status' } });
  const pauseBadge = el('div', { class: 'stage-badge pause-badge', i18n: 'train.paused', attrs: { role: 'status' } });
  stage.append(el('div', { class: 'stage-badges' }, generationBadge, pauseBadge));

  // --- Sincronizar el panel con el estado ------------------------------------------------------------
  function sync() {
    const t = state.training;
    const s = state.settings;
    const ind = indicators(t);
    setText(strip.values.generation, 'train.value.count', { value: ind.generation });
    setText(strip.values.alive, 'train.value.alive', { value: ind.alive, total: ind.total });
    setText(strip.labels.leader, ind.leaderLabel);
    setText(strip.values.leader, ind.leader.key, ind.leader.params);
    setText(strip.values.passed, 'train.value.count', { value: ind.passed });
    setText(generationBadge, 'train.badge.generation', { value: ind.generation });
    // Línea de la última generación: dos tramos con su clave, así el cambio de idioma los reescribe.
    const last = lastGeneration(t);
    if (last) {
      setText(lastBest, last.best.key, last.best.params);
      setText(lastReason, last.reason);
    } else {
      setText(lastBest, 'train.last.none');
    }
    lastReason.hidden = !last;
    // Ayuda de la curva según el modo de tráfico de la generación en curso (no el que espera).
    setText(chartCard.hint, `train.chart.hint.${t.config.trafficMode}`);

    // Pausa y velocidad
    pauseButton.setAttribute('aria-pressed', String(state.paused));
    setText(pauseButton, state.paused ? 'train.resume' : 'train.pause');
    pauseBadge.hidden = !state.paused;
    speeds.select(s.speed);
    factor.hidden = s.speed !== 'max';
    if (s.speed === 'max') {
      const achieved = loop.achievedFactor;
      if (achieved === null || state.paused) setText(factor, 'train.speed.measuring');
      else setText(factor, 'train.speed.factor', { value: Math.max(1, Math.round(achieved)) });
    }

    // Misiones
    for (const m of state.missions.missions) {
      const r = missionRows.find((x) => x.id === m.id);
      r.row.dataset.done = String(m.done);
      if (m.done) setText(r.status, 'train.mission.done');
      else if (m.unit === 'none') setText(r.status, 'train.mission.pending');
      else setText(r.status, `train.mission.progress.${m.unit}`, { value: Math.floor(m.progress), goal: m.goal });
      const width = `${Math.round((m.done ? 1 : m.progress / m.goal) * 100)}%`;
      if (r.fill.style.width !== width) r.fill.style.width = width;
    }

    // Selección manual (según el modo deseado): elegir y deshacer, con la línea de estado del padre.
    const manual = s.selectionMode === 'manual';
    // La guía acompaña al modo: con selección manual, la generación siguiente sale del auto elegido.
    setText(intro, manual ? 'train.guide.manual' : 'train.guide');
    manualRow.hidden = !manual;
    parentLine.hidden = !manual;
    if (manual) {
      const status = parentStatus(t);
      setText(parentLine, status.key, status.params);
      const canUndo = t.choiceCount > 0;
      undoButton.setAttribute('aria-disabled', String(!canUndo));
      undoButton.dataset.help = canUndo ? 'train.undo' : 'train.undo.disabled';
    }

    // Guardar el campeón (o, con selección manual vigente, el padre elegido): deshabilitado sin qué
    // guardar; al continuar un cerebro guardado, actualizar o guardar como nuevo.
    const parentMode = t.config.selectionMode === 'manual';
    const hasChampion = canSave();
    const source = sourceEntry();
    setText(saveTitle, parentMode ? 'train.save.title.parent' : 'train.save.title');
    saveButton.setAttribute('aria-disabled', String(!hasChampion));
    if (parentMode) saveButton.dataset.help = hasChampion ? 'train.save.parent' : 'train.save.disabled.parent';
    else saveButton.dataset.help = hasChampion ? 'train.save' : 'train.save.disabled';
    setText(saveButton, source ? 'train.save.asNew' : 'train.save');
    // Al continuar un cerebro guardado, actualizar y guardar como nuevo van en un segundo renglón.
    const saveParent = source ? saveActions : saveRow;
    if (saveButton.parentNode !== saveParent) saveParent.append(saveButton);
    saveActions.hidden = !source;
    updateButton.hidden = !source;
    updateButton.setAttribute('aria-disabled', String(!hasChampion));
    if (source) setText(updateButton, 'train.save.updateNamed', { name: source.brain.name });
    if (nameInput.placeholder !== (library ? library.suggestName(i18n.t('library.defaultName')) : '')) {
      nameInput.placeholder = library ? library.suggestName(i18n.t('library.defaultName')) : '';
    }

    // Configuración
    // Cambios que esperan a la próxima generación: el del modo se avisa junto a su ajuste; los demás,
    // en la configuración.
    const waiting = t.pending ? Object.keys(t.pending) : [];
    const othersWaiting = waiting.some((k) => k !== 'selectionMode');
    modePending.hidden = !waiting.includes('selectionMode');
    basicPending.hidden = !othersWaiting;
    advancedPending.hidden = !othersWaiting;
    const dragging = document.activeElement;
    // Con el enfriamiento en uso, la fuerza baja sola: el deslizador muestra la de la generación
    // siguiente y no se edita (D9). Con selección manual, la fuerza es la del deslizador.
    const cooling = s.mutationCooling && !manual;
    for (const sl of sliders) {
      const v = sl.key === 'mutationStrength' && cooling ? Math.round(t.nextMutationStrength) : s[sl.key];
      if (dragging === sl.input && sl.deferred) continue; // mientras se arrastra, muestra el valor del deslizador
      if (Number(sl.input.value) !== v) sl.input.value = String(v);
      setText(sl.value, FORMATS[sl.key], { value: v, kmh: Math.round(v * 3.6) });
    }
    // Solo se muestran las neuronas de las capas que existen.
    [1, 2, 3].forEach((n) => { row(`neurons${n}`).hidden = n > s.hiddenLayers; });
    for (const { key, sw: b } of switches) b.setAttribute('aria-checked', String(s[key]));
    // Selección, élite y cruce no se usan con selección manual: deshabilitados, con su explicación.
    for (const key of NOT_IN_MANUAL) {
      const control = key === 'crossover' ? sw(key) : sliders.find((x) => x.key === key).input;
      const host = key === 'crossover' ? control : row(key);
      const disabled = String(manual);
      if (control.getAttribute('aria-disabled') !== disabled) {
        control.setAttribute('aria-disabled', disabled);
        control.dataset.help = manual ? 'train.setting.notInManual' : `train.setting.${key}`;
        host.classList.toggle('not-applicable', manual);
      }
    }
    const strength = sliders.find((x) => x.key === 'mutationStrength').input;
    if (strength.getAttribute('aria-disabled') !== String(cooling)) {
      strength.setAttribute('aria-disabled', String(cooling));
      strength.dataset.help = cooling ? 'train.setting.strengthCooling' : 'train.setting.mutationStrength';
      row('mutationStrength').classList.toggle('auto-value', cooling);
    }
    const coolingSwitch = sw('mutationCooling');
    if (coolingSwitch.getAttribute('aria-disabled') !== String(manual)) {
      coolingSwitch.setAttribute('aria-disabled', String(manual));
      coolingSwitch.dataset.help = manual ? 'train.setting.coolingInManual' : 'train.setting.mutationCooling';
      coolingSwitch.classList.toggle('not-applicable', manual);
    }
    selectionMode.select(s.selectionMode);
    sensorsSwitch.setAttribute('aria-checked', String(s.showSensors));
    choices.fitness.select(s.fitness);
    choices.trafficMode.select(s.trafficMode);
    choices.lanes.select(s.lanes);
    choices.activation.select(s.activation);
  }

  /** Diagrama de la red del líder con lo que percibe ahora; no se dibuja con la sección plegada. */
  function drawNetwork() {
    if (!networkCard.open) return;
    const t = state.training;
    const leader = t.world.agents[t.leaderIndex];
    networkView.render(t.networks[t.leaderIndex], [...leader.perception.sensors, leader.perception.speed]);
  }

  // --- Bucle ----------------------------------------------------------------------------------------
  const loop = createLoop({
    step: () => {
      if (state.paused) return;
      state.training.step();
      state.missions.observe(state.training);
    },
    render: () => {
      const t = state.training;
      view.render(t.world, {
        showSensors: state.settings.showSensors,
        focus: t.leaderIndex,
        elite: Array.from({ length: t.eliteCount }, (_, i) => i),
      });
      drawNetwork();
      sync();
    },
    onError: reportError,
    speed: state.settings.speed,
  });

  // --- Atajos y foco ----------------------------------------------------------------------------------
  let handledSpace = false;
  function onKeyDown(e) {
    const action = shortcutFor(e);
    if (!action) return;
    // E y Z solo existen con selección manual; con automática la tecla no hace nada.
    if ((action === 'choose' || action === 'undo') && !manualWanted()) return;
    e.preventDefault();
    if (action === 'pause') handledSpace = true;
    if (e.target !== stage && typeof e.target?.matches === 'function' && e.target.matches('button, input, summary, a')) focusStage();
    if (e.repeat) return;
    try {
      if (action === 'pause') togglePause();
      else if (action === 'turbo') setSpeed(toggleTurbo(state.settings.speed));
      else if (action === 'choose') chooseLeader();
      else if (action === 'undo') undoChoice();
      else nextGeneration();
    } catch (err) {
      reportError(err);
    }
  }
  function onKeyUp(e) {
    if (e.code === 'Space' && handledSpace) {
      handledSpace = false;
      e.preventDefault();
    }
  }
  // Tras un clic con el mouse (detail > 0) en un control de la pestaña, el foco vuelve al escenario
  // (salvo en una confirmación, que conserva el foco para poder cancelarla con Escape).
  function onClick(e) {
    if (panel.querySelector('.inline-confirm:not([hidden])')) return;
    if (e.detail > 0 && e.target?.closest?.('button, input, summary, a, label')) focusStage();
  }
  // Página oculta o cerrándose (recarga incluida): el autoguardado pendiente se escribe ya.
  const onVisibility = () => { if (document.hidden) library?.flush(); };
  const onPageHide = () => library?.flush();
  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', onPageHide);
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  panel.addEventListener('click', onClick);
  board.addEventListener('click', onClick);
  stage.addEventListener('click', onClick);
  const offLanguage = i18n.onChange(() => { sync(); chart.refresh(); });

  attachTraining();
  chart.update(state.training.history);
  sync();
  loop.start();
  focusStage();

  return {
    view, loop, networkView, chart,
    get training() { return state.training; },
    get settings() { return { ...state.settings }; },
    get paused() { return state.paused; },
    get session() { return state.session; },
    get missions() { return state.missions; },
    togglePause, nextGeneration, chooseLeader, undoChoice, restart, newPopulation, setSpeed, applySettings, resetSettings, saveChampion, continueFrom,
    unmount() {
      library?.flush();
      loop.dispose();
      offLanguage();
      offGeneration();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      panel.removeEventListener('click', onClick);
      board.removeEventListener('click', onClick);
      libraryView.dispose();
      stage.removeEventListener('click', onClick);
      toolbarConfirm.dispose();
      networkConfirm.dispose();
      sensorsConfirm.dispose();
      resetConfirm.dispose();
      offLibrary();
      chart.dispose();
      networkView.dispose();
      view.dispose();
    },
  };
}
