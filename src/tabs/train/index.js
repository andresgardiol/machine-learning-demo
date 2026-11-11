// Pestaña 3, "Entrenar": una población de autos manejados por redes neuronales aprende a esquivar
// el tráfico generación tras generación, a la vista de la persona.
//
// Composición (design.md D14): entrenamiento del núcleo + vista + bucle, y el panel con guía,
// controles, indicadores, misiones, configuración, curva de fitness y red del líder. El
// entrenamiento, los ajustes y las misiones cumplidas viven en variables del módulo: al salir de la
// pestaña se detienen el bucle y la vista, y al volver se retoma el mismo entrenamiento. La lógica
// que se puede probar sin DOM vive en settings.js, session.js y shortcuts.js.
//
// Cuándo se aplica cada ajuste (settings.js): al instante; desde la próxima generación (queda
// pendiente y el panel lo indica); o con un entrenamiento nuevo, de inmediato si todavía no terminó
// ninguna generación y con una confirmación en línea si ya terminó alguna.
import { createTraining, NEW_TRAINING_KEYS } from '../../core/training.js';
import { FITNESS_KINDS } from '../../core/evolution.js';
import { ACTIVATIONS } from '../../core/network.js';
import { TRAFFIC_MODES } from '../../core/brain.js';
import { ALLOWED_LANES } from '../../core/constants.js';
import { createStageView } from '../../render/view.js';
import { createNetworkView } from '../../render/network-view.js';
import { createFitnessChart } from '../../ui/chart.js';
import { createLoop, SPEEDS } from '../../ui/loop.js';
import { el } from '../../ui/dom.js';
import {
  button, switchButton, sliderRow, optionGroup, createTextSetter, inlineConfirm,
} from '../../ui/controls.js';
import {
  DEFAULT_SETTINGS, SETTINGS, normalizeSettings, trainingConfig, classifyChanges,
} from './settings.js';
import { createTrainSession, indicators } from './session.js';
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

let sessionCounter = 0;
/** Identificador del entrenamiento para el autoguardado (cambia con cada entrenamiento nuevo). */
const newSession = () => `training-${Date.now().toString(36)}-${++sessionCounter}`;

/** Olvida el estado conservado (para reiniciar la aplicación). */
export function resetState() { state = null; }

/** Configuración del entrenamiento sin los ajustes que piden un entrenamiento nuevo. */
function nextGenerationConfig(settings) {
  const config = trainingConfig(settings);
  for (const k of NEW_TRAINING_KEYS) delete config[k];
  return config;
}

export function mount({ stage, panel, i18n, store, library, reportError }) {
  if (!state) {
    const settings = normalizeSettings({ ...DEFAULT_SETTINGS, maxSpeed: store?.get().carSpeed ?? DEFAULT_SETTINGS.maxSpeed });
    state = {
      settings, seed: DEFAULT_SEED, brain: null, paused: false,
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
  const view = createStageView({ container: stage });
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
  function setSpeed(speed) { setSetting('speed', speed); }
  function restart() { withProgressCheck(toolbarConfirm, 'train.confirm.restart', () => startTraining({ seed: state.seed })); }
  function newPopulation() { withProgressCheck(toolbarConfirm, 'train.confirm.newPopulation', () => startTraining({ seed: state.seed + 1 })); }
  function resetSettings() {
    const keep = { speed: state.settings.speed, showSensors: state.settings.showSensors, showNetwork: state.settings.showNetwork, showChart: state.settings.showChart };
    applySettings({ ...DEFAULT_SETTINGS, ...keep }, resetConfirm);
  }

  // --- Panel: guía y controles ------------------------------------------------------------------
  const intro = el('section', { class: 'guide train-intro' },
    el('p', { i18n: 'train.guide.what' }),
    el('p', { i18n: 'train.guide.generation' }),
    el('p', { i18n: 'train.guide.try' }));

  const pauseButton = button('train.pause', 'train.pause', togglePause);
  pauseButton.setAttribute('aria-pressed', 'false');
  const nextButton = button('train.next', 'train.next', nextGeneration);
  const restartButton = button('train.restart', 'train.restart', restart);
  const newPopulationButton = button('train.newPopulation', 'train.newPopulation', newPopulation);
  const toolbarConfirm = inlineConfirm({ i18n });
  const toolbar = el('div', { class: 'drive-toolbar train-toolbar' }, pauseButton, nextButton, restartButton, newPopulationButton);

  const speeds = optionGroup({
    labelKey: 'train.speed',
    selected: state.settings.speed,
    options: SPEEDS.map((s) => (s === 'max'
      ? { value: s, i18n: 'train.speed.max', help: 'train.speed.max', labelKey: 'train.speed.maxLabel' }
      : { value: s, i18n: 'train.speed.option', params: { n: s }, help: 'train.speed', labelKey: 'train.speed.optionLabel' })),
    onSelect: setSpeed,
  });
  const factor = el('p', { class: 'train-factor muted', attrs: { 'aria-live': 'off' } });

  // Indicadores
  const stat = (labelKey) => {
    const value = el('dd', { class: 'stat-value' });
    return { node: el('div', { class: 'stat' }, el('dt', { i18n: labelKey }), value), value };
  };
  const stats = {
    generation: stat('train.stats.generation'),
    alive: stat('train.stats.alive'),
    leader: stat('train.stats.leader'),
    lastBest: stat('train.stats.lastBest'),
    reason: stat('train.stats.reason'),
  };
  const statsList = el('dl', { class: 'drive-stats train-stats', attrs: { 'aria-live': 'off' } }, Object.values(stats).map((s) => s.node));

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
  const networkConfirm = inlineConfirm({ i18n });
  const resetConfirm = inlineConfirm({ i18n });

  /** Fila con deslizador para un ajuste. Los que piden un entrenamiento nuevo se aplican al soltar. */
  function slider(key, confirm) {
    const spec = SPEC.get(key);
    const deferred = spec.group === 'newTraining';
    const r = sliderRow({
      id: `train-${key}`, labelKey: `train.setting.${key}`, help: `train.setting.${key}`,
      min: spec.min, max: spec.max, step: spec.step, value: state.settings[key],
      onInput: (v) => {
        if (deferred) setText(r.value, FORMATS[key], { value: v, kmh: Math.round(v * 3.6) });
        else setSetting(key, v, confirm);
      },
      onChange: (v) => { if (deferred) setSetting(key, v, confirm); },
    });
    return { key, deferred, ...r };
  }
  const toggle = (key) => ({
    key,
    sw: switchButton(`train.setting.${key}`, `train.setting.${key}`, state.settings[key], () => setSetting(key, !state.settings[key])),
  });
  const choice = (key, values, optionKey, confirm) => optionGroup({
    labelKey: `train.setting.${key}`,
    selected: state.settings[key],
    options: values.map((v) => ({ value: v, i18n: `${optionKey}.${v}`, help: `${optionKey}.${v}` })),
    onSelect: (v) => { if (v !== state.settings[key]) setSetting(key, v, confirm); },
  });

  const sliders = [
    slider('population'), slider('mutationStrength'),
    slider('elite'), slider('selection'), slider('mutationRate'), slider('maxDuration'),
    slider('density'), slider('irregularity'), slider('maxSpeed'),
    slider('hiddenLayers', networkConfirm), slider('neurons1', networkConfirm), slider('neurons2', networkConfirm), slider('neurons3', networkConfirm),
    slider('sensorCount', networkConfirm), slider('sensorRange', networkConfirm), slider('sensorSpread', networkConfirm),
  ];
  const row = (key) => sliders.find((s) => s.key === key).row;
  const switches = [toggle('crossover'), toggle('slowRule')];
  const sw = (key) => switches.find((s) => s.key === key).sw;
  const choices = {
    fitness: choice('fitness', FITNESS_KINDS, 'train.fitness'),
    trafficMode: choice('trafficMode', TRAFFIC_MODES, 'train.trafficMode'),
    lanes: optionGroup({
      labelKey: 'train.setting.lanes',
      selected: state.settings.lanes,
      options: ALLOWED_LANES.map((n) => ({ value: n, i18n: 'drive.lanes.option', params: { n }, help: 'train.setting.lanes', labelKey: 'drive.lanes.optionLabel' })),
      onSelect: (v) => { if (v !== state.settings.lanes) setSetting('lanes', v); },
    }),
    activation: choice('activation', ACTIVATIONS, 'train.activation', networkConfirm),
  };

  const pendingNote = () => el('p', { class: 'train-pending', attrs: { role: 'status' }, i18n: 'train.pending' });
  const basicPending = pendingNote();
  const advancedPending = pendingNote();

  const basic = el('section', { class: 'train-basic' },
    el('h2', { class: 'panel-heading', i18n: 'train.basic.title' }),
    row('population'), row('mutationStrength'), basicPending);

  const sensorsSwitch = switchButton('train.sensors', 'train.sensors', state.settings.showSensors, () => setSetting('showSensors', !state.settings.showSensors));

  const resetButton = button('train.resetSettings', 'train.resetSettings', resetSettings);
  const advanced = el('details', { class: 'drive-advanced train-advanced' },
    el('summary', { i18n: 'train.advanced', help: 'train.advanced' }),
    el('div', { class: 'advanced-body' },
      advancedPending,
      el('h3', { class: 'panel-subheading', i18n: 'train.advanced.evolution' }),
      row('elite'), row('selection'), row('mutationRate'), el('div', { class: 'switch-row' }, sw('crossover')),
      choices.fitness.row, row('maxDuration'), el('div', { class: 'switch-row' }, sw('slowRule')), choices.trafficMode.row,
      el('h3', { class: 'panel-subheading', i18n: 'train.advanced.scenario' }),
      choices.lanes.row, row('density'), row('irregularity'), row('maxSpeed'),
      el('h3', { class: 'panel-subheading', i18n: 'train.advanced.network' }),
      el('p', { class: 'caption', i18n: 'train.advanced.networkNote' }),
      row('hiddenLayers'), row('neurons1'), row('neurons2'), row('neurons3'), choices.activation.row,
      el('h3', { class: 'panel-subheading', i18n: 'train.advanced.sensors' }),
      row('sensorCount'), row('sensorRange'), row('sensorSpread'),
      networkConfirm.node,
      resetButton, resetConfirm.node));

  // --- Panel: curva y red --------------------------------------------------------------------------
  const chartZone = el('div', { class: 'chart-zone' });
  const chartSection = el('details', { class: 'train-section train-chart', attrs: { open: state.settings.showChart } },
    el('summary', { i18n: 'train.chart.title', help: 'train.chart' }), chartZone);

  const networkZone = el('div', { class: 'network-zone' });
  const legend = el('ul', { class: 'network-legend' },
    el('li', {}, el('span', { class: 'legend-line', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: 'train.network.legend.positive' })),
    el('li', {}, el('span', { class: 'legend-line negative', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: 'train.network.legend.negative' })),
    el('li', {}, el('span', { class: 'legend-node', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: 'train.network.legend.active' })));
  const networkSection = el('details', { class: 'train-section train-network', attrs: { open: state.settings.showNetwork } },
    el('summary', { i18n: 'train.network.title', help: 'train.network' }),
    networkZone, legend,
    el('p', { class: 'network-note muted', i18n: 'train.network.legend.note' }));
  // Plegar o desplegar una sección se recuerda al volver a la pestaña.
  chartSection.addEventListener('toggle', () => { state.settings = { ...state.settings, showChart: chartSection.open }; });
  networkSection.addEventListener('toggle', () => { state.settings = { ...state.settings, showNetwork: networkSection.open }; });

  panel.append(
    el('h1', { class: 'panel-title', i18n: 'train.title' }),
    intro, toolbar, toolbarConfirm.node, speeds.row, factor, statsList, missions,
    basic, el('div', { class: 'switch-row' }, sensorsSwitch),
    chartSection, networkSection, advanced);

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
    setText(stats.generation.value, 'train.value.count', { value: ind.generation });
    setText(stats.alive.value, 'train.value.alive', { value: ind.alive, total: ind.total });
    setText(stats.leader.value, ind.leader.key, ind.leader.params);
    if (ind.lastBest) setText(stats.lastBest.value, ind.lastBest.key, ind.lastBest.params);
    else setText(stats.lastBest.value, 'train.value.none');
    setText(stats.reason.value, ind.lastReason ? `train.reason.${ind.lastReason}` : 'train.value.none');
    setText(generationBadge, 'train.badge.generation', { value: ind.generation });

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

    // Configuración
    const pending = t.pending !== null;
    basicPending.hidden = !pending;
    advancedPending.hidden = !pending;
    const dragging = document.activeElement;
    for (const sl of sliders) {
      const v = s[sl.key];
      if (dragging === sl.input && sl.deferred) continue; // mientras se arrastra, muestra el valor del deslizador
      if (Number(sl.input.value) !== v) sl.input.value = String(v);
      setText(sl.value, FORMATS[sl.key], { value: v, kmh: Math.round(v * 3.6) });
    }
    // Solo se muestran las neuronas de las capas que existen.
    [1, 2, 3].forEach((n) => { row(`neurons${n}`).hidden = n > s.hiddenLayers; });
    for (const { key, sw: b } of switches) b.setAttribute('aria-checked', String(s[key]));
    sensorsSwitch.setAttribute('aria-checked', String(s.showSensors));
    choices.fitness.select(s.fitness);
    choices.trafficMode.select(s.trafficMode);
    choices.lanes.select(s.lanes);
    choices.activation.select(s.activation);
  }

  /** Diagrama de la red del líder con lo que percibe ahora; no se dibuja con la sección plegada. */
  function drawNetwork() {
    if (!networkSection.open) return;
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
    e.preventDefault();
    if (action === 'pause') handledSpace = true;
    if (e.target !== stage && typeof e.target?.matches === 'function' && e.target.matches('button, input, summary, a')) focusStage();
    if (e.repeat) return;
    try {
      if (action === 'pause') togglePause();
      else if (action === 'turbo') setSpeed(toggleTurbo(state.settings.speed));
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
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  panel.addEventListener('click', onClick);
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
    togglePause, nextGeneration, restart, newPopulation, setSpeed, applySettings, resetSettings,
    unmount() {
      library?.flush();
      loop.dispose();
      offLanguage();
      offGeneration();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      panel.removeEventListener('click', onClick);
      stage.removeEventListener('click', onClick);
      toolbarConfirm.dispose();
      networkConfirm.dispose();
      resetConfirm.dispose();
      chart.dispose();
      networkView.dispose();
      view.dispose();
    },
  };
}
