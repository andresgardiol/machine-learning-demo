// Etapa 3 de la V2, "Aprender · Por evolución" (tareas 12.1 a 12.3; #entrenar de la maqueta D). Una
// población de autos manejados por redes aprende generación tras generación. La escena lleva debajo la
// franja con la red del líder y la curva de fitness con sus marcas de ajuste (KD6); la banda, las cifras,
// la velocidad y la selección manual; el cuaderno, las hojas Entrenamiento, Evolución, Red y pista y
// Cerebros (el reparto aprobado por el dueño).
//
// La conducta sale de la lógica pura de la V1: el entrenamiento del núcleo, tabs/train/ (settings, session,
// cut, preview, shortcuts) y la biblioteca compartida. La curva y la vista de la biblioteca son copias para
// la V2 (components/chart.js y components/library-view.js). Cambios de la V2: Reiniciar y Población nueva
// empiezan de inmediato y ofrecen "Deshacer" (12.3); lo que no aplica (élite, selección, cruce y enfriar con
// selección manual; el modo de tráfico en un circuito; las neuronas de capas que no hay) se oculta.
import { createTraining, NEW_TRAINING_KEYS, SELECTION_MODES } from '../../../core/training.js';
import { FITNESS_KINDS, mutationDiff } from '../../../core/evolution.js';
import { ACTIVATIONS } from '../../../core/network.js';
import { TRAFFIC_MODES, copyBrain } from '../../../core/brain.js';
import { createStageView } from '../../../render/view.js';
import { createNetworkView } from '../../../render/network-view.js';
import { createLoop, SPEEDS } from '../../../ui/loop.js';
import { formatFixed } from '../../../ui/i18n.js';
import { currentMission } from '../../../ui/current-mission.js';
import { trainingDescription } from '../../../tabs/shared/stage-text.js';
import {
  DEFAULT_SETTINGS, SETTINGS, normalizeSettings, trainingConfig, classifyChanges, adoptBrain,
  onlyCircuits, settingsWaiting, resetPanelSettings, followingAfter, RESTART_GENERATION_KEYS,
} from '../../../tabs/train/settings.js';
import { createTrainSession, indicators, lastGeneration, parentStatus } from '../../../tabs/train/session.js';
import { shortcutFor, toggleTurbo } from '../../../tabs/train/shortcuts.js';
import { createCut } from '../../../tabs/train/cut.js';
import { mutationPreview, networkCardMode, PREVIEW_MS, PREVIEW_ANNOUNCE_MS } from '../../../tabs/train/preview.js';
import { missionsSummary } from '../../../tabs/train/layout.js';
import { el, tr, setAttr } from '../../dom.js';
import { button, toggle, slider, segments, group, grid, missionNote, undoNotice, term } from '../../components/controls.js';
import { inlineConfirm } from '../../components/legacy.js';
import { mountScenarioSheet } from '../../components/scenario-sheet.js';
import { createFitnessChart } from '../../components/chart.js';
import { createLibraryView } from '../../components/library-view.js';

export const DEFAULT_SEED = 1;
const STAGE = 'evolucion';
const SPEC = new Map(SETTINGS.map((s) => [s.key, s]));
const FORMATS = Object.freeze({
  population: 'train.value.cars', mutationStrength: 'drive.value.percent', elite: 'train.value.count', selection: 'drive.value.percent',
  mutationRate: 'drive.value.percent', maxDuration: 'train.value.seconds', hiddenLayers: 'train.value.layers',
  neurons1: 'train.value.neurons', neurons2: 'train.value.neurons', neurons3: 'train.value.neurons',
  sensorCount: 'train.v2.value.number', sensorRange: 'train.v2.value.range', sensorSpread: 'drive.value.degrees',
});
const NOT_IN_MANUAL = Object.freeze(['elite', 'selection', 'crossover', 'mutationCooling']);
/** Qué muestra "Mostrame" en cada misión (la tabla de la V1, ui/mission-targets.js). */
const REVEAL = { save: 'save', fitness: 'fitness' };

let sessionCounter = 0;
const newSession = () => `training-${Date.now().toString(36)}-${++sessionCounter}`;
const completedMissions = new Set();

function nextGenerationConfig(settings) {
  const config = trainingConfig(settings);
  for (const k of NEW_TRAINING_KEYS) delete config[k];
  return config;
}
/** Los ajustes de la etapa con el escenario compartido encima (la pista del escenario es la única pista). */
const withScenario = (settings, sc) => normalizeSettings({ ...settings, tracks: [sc.track], lanes: sc.lanes, density: sc.density, irregularity: sc.irregularity, maxSpeed: sc.maxSpeed });

export function mount({ zones, notebook, i18n, scenario, scenery = null, library = null }) {
  const { scene, plate, band, zone } = zones;
  const doc = scene.ownerDocument;
  const win = doc.defaultView;
  const t = (k, p) => i18n.t(k, p);
  let visible = false;

  // --- Estado -------------------------------------------------------------------------------------
  const settings0 = withScenario(DEFAULT_SETTINGS, scenario.forStage(STAGE));
  const state = {
    settings: settings0, seed: DEFAULT_SEED, paused: false, brain: null, brainSource: null,
    training: createTraining({ seed: DEFAULT_SEED, config: trainingConfig(settings0) }),
    session: newSession(), missions: createTrainSession({ completed: completedMissions }),
    machineView: false, saveMessage: null, restarted: null, undo: null,
  };
  library?.beginTraining(state.session);

  // --- Zona: la escena y, debajo, la franja de la red del líder y la curva (KD6) ------------------------
  zone.classList.add('v2-zone-evo');
  const view = createStageView({ container: scene, store: scenery, doc });
  scene.setAttribute('tabindex', '-1');
  const description = el('p', { class: 'v2-sr-only', attrs: { id: 'v2-evolucion-description', 'data-free-text': '' } });
  scene.setAttribute('aria-describedby', description.id);
  scene.append(description);
  const consigna = el('p', { class: 'v2-consigna' });
  const pauseButton = button({ level: 'primary', labelKey: 'train.pause.plain', help: 'train.pause', keyKey: 'key.space', onClick: () => togglePause(), attrs: { 'aria-pressed': 'false', 'data-v1': 'train.pause' } });
  const nextButton = button({ labelKey: 'train.next.plain', help: 'train.next', key: 'N', onClick: () => nextGeneration(), attrs: { 'data-v1': 'train.next' } });
  plate.append(consigna, el('div', { class: 'v2-actions' }, pauseButton, nextButton));

  const networkZone = el('div', { class: 'v2-evo-network-canvas' });
  const sampleLine = el('p', { class: 'v2-evo-sample', attrs: { role: 'status', hidden: true } });
  const networkBox = el('section', { class: 'v2-evo-network', help: 'train.network', attrs: { 'data-v1': 'train.network' } },
    el('p', { class: 'v2-role v2-role-decide' }, el('span', { i18n: 'role.decides' }), ' · ', el('span', { i18n: 'train.network.title' })), sampleLine, networkZone);
  // La curva escribe sus textos desde el diccionario al dibujarse (copia de la V1): son datos para la auditoría.
  const chartZone = el('div', { class: 'v2-evo-chart-zone', attrs: { 'data-free-text': '' } });
  const lastBest = el('span');
  const lastReason = el('span', { class: 'v2-muted' });
  const lastLine = el('p', { class: 'v2-evo-last', attrs: { role: 'status' } }, lastBest, ' ', lastReason);
  const chartBox = el('section', { class: 'v2-evo-chart', help: 'train.chart', attrs: { 'data-v1': 'train.chart' } },
    el('p', { class: 'v2-role' }, el('span', { i18n: 'train.chart.title' })), chartZone, lastLine);
  const stripZone = el('div', { class: 'v2-evo-strip' }, networkBox, chartBox);
  zone.insertBefore(stripZone, band);
  const networkView = createNetworkView({ container: networkZone, i18n, doc });
  const chart = createFitnessChart({ container: chartZone, i18n, doc, describeChanges });

  // Mensajes sobre la escena: generación, generación reiniciada, pausa, ver como la máquina y el corte.
  const generationBadge = el('div', { class: 'v2-badge v2-badge-quiet', attrs: { role: 'status' } });
  const restartedBadge = el('p', { class: 'v2-badge v2-badge-quiet', attrs: { role: 'status', hidden: true } });
  const pauseBadge = el('div', { class: 'v2-badge', i18n: 'train.paused', attrs: { role: 'status' } });
  const machineBadge = el('div', { class: 'v2-badge v2-badge-machine', i18n: 'drive.machine.badge' });
  const cutTitle = el('p', { class: 'v2-cut-title' });
  const cutText = el('p');
  const cutElite = el('div', { class: 'v2-cut-elite', attrs: { 'aria-hidden': 'true' } });
  const cutCard = el('div', { class: 'v2-cut v2-guide-only', attrs: { role: 'status', hidden: true } }, cutTitle, cutElite, cutText);
  view.corner.append(generationBadge, restartedBadge, pauseBadge, machineBadge, cutCard);

  // --- Banda: cifras, velocidad y selección manual --------------------------------------------------------
  const figures = el('div', { class: 'v2-figures' });
  const figure = (key) => { const b = el('b', { attrs: { 'data-free-text': '' } }); const s = el('span', { i18n: key }); figures.append(el('div', {}, b, s)); return { b, s }; };
  const fGen = figure('train.stats.generation');
  const fAlive = figure('train.stats.alive');
  const fLeader = figure('train.stats.leader.lead');
  const fPassed = figure('train.stats.passed');
  const speeds = segments({
    labelKey: 'train.speed', help: 'train.speed', value: state.settings.speed, onChange: (v) => setSpeed(v),
    options: SPEEDS.map((s) => (s === 'max' ? { value: s, labelKey: 'train.v2.speedMax', dataset: { v1: 'train.speed.max' } } : { value: s, text: `${s}×` })),
  });
  speeds.element.dataset.v1 = 'train.speed';
  const factor = el('p', { class: 'v2-muted v2-evo-factor', attrs: { 'aria-live': 'off' } });
  const chooseButton = button({ labelKey: 'train.choose.plain', help: 'train.choose', key: 'E', onClick: () => chooseLeader(), attrs: { 'data-v1': 'train.choose' } });
  const undoChoiceButton = button({ labelKey: 'train.undo.plain', help: 'train.undo', key: 'Z', onClick: () => undoChoice(), attrs: { 'data-v1': 'train.undo' } });
  const parentLine = el('p', { class: 'v2-evo-parent', attrs: { role: 'status' } });
  const manualBox = el('div', { class: 'v2-evo-manual' }, el('div', { class: 'v2-row v2-row-start' }, chooseButton, undoChoiceButton), parentLine);
  band.append(figures, el('div', { class: 'v2-evo-speed' }, speeds.element, factor), manualBox);

  // --- Entrenamiento --------------------------------------------------------------------------------------
  let offGeneration = () => {};
  const cut = createCut();
  const clock = () => (globalThis.performance ?? Date).now();
  const guideOn = () => doc.documentElement.dataset.guide !== 'off';
  function attachTraining() {
    offGeneration();
    offGeneration = state.training.onGeneration((record) => {
      chart.update(state.training.history);
      state.missions.generationEnded(record);
      autosave();
      view.followCar();
      if (cut.enter(clock(), { guide: guideOn() && !doc.hidden, speed: state.settings.speed, paused: state.paused })) showCut();
      else hideCut();
    });
  }
  function autosave() {
    if (!library) return;
    const brain = state.training.brain({ id: `autosave-${state.session}`, name: t('library.autosave.name'), now: new Date().toISOString() });
    if (brain) library.autosave(brain, { session: state.session });
  }
  function startTraining({ seed = state.seed } = {}) {
    state.seed = seed;
    state.training = createTraining({ seed, config: trainingConfig(state.settings), brain: state.brain });
    state.session = newSession();
    library?.beginTraining(state.session);
    state.missions.restart();
    state.undo = null;
    setSaveMessage(null);
    cut.end();
    endPreview();
    hideCut();
    attachTraining();
    chart.update(state.training.history);
    view.followCar();
    sync();
  }
  function restartGeneration() {
    state.training.restartGeneration();
    state.restarted = { training: state.training, generation: state.training.generation };
  }
  /** Reiniciar y Población nueva (12.3): empiezan ya y, si había generaciones terminadas, ofrecen Deshacer. */
  function startWithUndo(seed, messageKey) {
    const done = state.training.completed;
    const before = { training: state.training, seed: state.seed, session: state.session, saveMessage: state.saveMessage };
    startTraining({ seed });
    if (done > 0) {
      runNotice.show(messageKey, () => {
        state.training = before.training;
        state.seed = before.seed;
        state.session = before.session;
        library?.beginTraining(state.session);
        attachTraining();
        chart.update(state.training.history);
        setSaveMessage(before.saveMessage);
        view.followCar();
        sync();
      }, { value: done });
    }
  }

  // --- Ajustes -----------------------------------------------------------------------------------------
  function applySettings(next, confirm = networkConfirm) {
    const target = normalizeSettings(next);
    const changes = classifyChanges(state.settings, target);
    if (changes.newTraining.length > 0) {
      const followed = state.brain ? state.brain.name : null;
      const apply = () => {
        state.settings = target;
        const f = followingAfter(state, changes);
        state.brain = f.brain;
        state.brainSource = f.brainSource;
        if (followed !== null) libraryView.showMessage(null);
        startTraining();
      };
      if (state.training.completed === 0) apply();
      else if (followed !== null) confirm.open({ message: 'train.confirm.newTraining.brain', params: { value: state.training.completed, name: followed }, onConfirm: apply, onCancel: () => sync() });
      else confirm.open({ message: 'train.confirm.newTraining', params: { value: state.training.completed }, onConfirm: apply, onCancel: () => sync() });
      sync();
      return;
    }
    state.settings = target;
    if (changes.nextGeneration.length > 0) {
      state.training.configure(nextGenerationConfig(target));
      if (changes.nextGeneration.some((k) => RESTART_GENERATION_KEYS.includes(k))) { restartGeneration(); view.followCar(); }
    }
    if (changes.instant.includes('speed')) { loop.setSpeed(target.speed); if (cut.speedChanged(target.speed)) hideCut(); }
    sync();
  }
  const setSetting = (key, value, confirm) => applySettings({ ...state.settings, [key]: value }, confirm);
  const offScenario = scenario.subscribe(() => applySettings(withScenario(state.settings, scenario.forStage(STAGE))));

  // --- Acciones ----------------------------------------------------------------------------------------
  function togglePause() {
    state.paused = !state.paused;
    if (state.paused) library?.flush();
    if (state.paused) cut.pause(clock());
    else if (cut.active) { cut.next(); hideCut(); }
    sync();
  }
  function nextGeneration() {
    if (cut.active) { cut.next(); hideCut(); sync(); return; }
    state.training.finishGeneration();
    sync();
  }
  const manualWanted = () => state.settings.selectionMode === 'manual';
  function chooseLeader() { if (!manualWanted()) return; state.training.chooseLeader(); sync(); }
  function undoChoice() { if (!manualWanted() || state.training.choiceCount === 0) return; state.training.undoChoice(); sync(); }
  function setSpeed(speed) { setSetting('speed', speed); }
  const restart = () => startWithUndo(state.seed, 'train.v2.undo.restart');
  const newPopulation = () => startWithUndo(state.seed + 1, 'train.v2.undo.newPopulation');

  // --- Biblioteca: guardar el campeón y seguir entrenando ----------------------------------------------
  function sourceEntry() {
    if (!state.brainSource || !library) return null;
    const e = library.get(state.brainSource);
    return e && e.origin === 'saved' ? e : null;
  }
  const canSave = () => (state.training.config.selectionMode === 'manual' ? state.training.parent !== null : state.training.champion !== null);
  function saveChampion({ update = false, name = '' } = {}) {
    const brain = state.training.brain({ id: 'champion', name: 'champion', now: new Date().toISOString() });
    if (!brain || !library) return;
    const source = update ? sourceEntry() : null;
    const before = source ? library.snapshot(source.brain.id) : null;
    const r = source ? library.update(source.brain.id, brain) : library.save(brain, { name, baseName: t('library.defaultName') });
    state.undo = null;
    if (!r.ok) { setSaveMessage({ key: 'train.saveResult.failed.damaged' }); return; }
    if (!source) state.brainSource = r.brain.id;
    state.missions.brainSaved();
    if (r.warning) setSaveMessage({ key: `train.saveResult.failed.${r.warning}`, params: { name: r.brain.name } });
    else if (source) { state.undo = before; setSaveMessage({ key: 'train.saveResult.updated', params: { name: r.brain.name }, action: 'undo' }); }
    else setSaveMessage({ key: 'train.saveResult.saved', params: { name: r.brain.name }, action: 'rename', id: r.brain.id });
    sync();
  }
  function undoUpdate() {
    const before = state.undo;
    if (!before || !library) return;
    state.undo = null;
    const r = library.restore(before);
    setSaveMessage({ key: r.ok ? 'train.saveResult.undone' : 'train.saveResult.undoFailed', params: { name: before.name } });
    sync();
  }
  function continueFrom(entry, confirm) {
    const apply = () => {
      state.brain = copyBrain(entry.brain);
      state.brainSource = entry.origin === 'saved' ? entry.brain.id : null;
      state.settings = adoptBrain(state.settings, entry.brain);
      startTraining();
      libraryView.showMessage('library.continuing', { name: entry.brain.name });
    };
    if (state.training.completed === 0) apply();
    else confirm.open({ message: 'train.confirm.continue', params: { value: state.training.completed }, onConfirm: apply });
  }

  // --- Controles de ajustes ------------------------------------------------------------------------------
  const networkConfirm = inlineConfirm({ i18n });
  const sensorsConfirm = inlineConfirm({ i18n });
  const resetConfirm = inlineConfirm({ i18n });
  const fmt = (key) => (v) => t(FORMATS[key], { value: v, kmh: Math.round(v * 3.6) });
  const sliders = {};
  function settingSlider(key, confirm) {
    const spec = SPEC.get(key);
    const deferred = spec.group === 'newTraining';
    const c = slider({
      labelKey: `train.setting.${key}`, help: `train.setting.${key}`, min: spec.min, max: spec.max, step: spec.step, value: state.settings[key], format: fmt(key),
      onInput: (v) => {
        if (!deferred) setSetting(key, v, confirm);
        if (key === 'mutationStrength') startPreview(v);
      },
    });
    c.element.dataset.v1 = `train.setting.${key}`;
    c.element.dataset.key = key;
    if (deferred) c.input.addEventListener('change', () => setSetting(key, Number(c.input.value), confirm));
    if (key === 'mutationStrength') c.input.addEventListener('change', () => announcePreview());
    sliders[key] = { ...c, deferred };
    return c.element;
  }
  const switches = {};
  function settingToggle(key) {
    const c = toggle({ labelKey: `train.setting.${key}`, help: `train.setting.${key}`, value: state.settings[key], dataset: { v1: `train.setting.${key}` },
      onChange: () => (key === 'mutationCooling' ? toggleCooling() : setSetting(key, !state.settings[key])) });
    switches[key] = c;
    return c.element;
  }
  function toggleCooling() {
    if (state.settings.mutationCooling) applySettings({ ...state.settings, mutationCooling: false, mutationStrength: Math.round(state.training.nextMutationStrength) });
    else setSetting('mutationCooling', true);
  }
  const choices = {};
  function settingChoice(key, values, optionKey, confirm, { wide = true } = {}) {
    const c = segments({
      labelKey: `train.setting.${key}`, help: `train.setting.${key}`, value: state.settings[key], wide,
      options: values.map((v) => ({ value: v, labelKey: `${optionKey}.${v}`, dataset: { v1: `${optionKey}.${v}` } })),
      onChange: (v) => { if (v !== state.settings[key]) setSetting(key, v, confirm); },
    });
    c.element.dataset.v1 = `train.setting.${key}`;
    choices[key] = c;
    return c.element;
  }
  const pendingNote = () => el('p', { class: 'v2-notice', attrs: { role: 'status', hidden: true }, i18n: 'train.pending' });

  // --- Hoja Entrenamiento: misión, fitness, población, fuerza y la marcha extra ----------------------------
  const s1 = notebook.sheet('etapa', 'train.view.training');
  const mission = missionNote({ i18n, onReveal: () => revealMission() });
  mission.element.dataset.v1 = 'mission.reveal';
  const missionReveal = mission.element.querySelector('.v2-tertiary');
  const missionsLabel = el('span');
  const missionRows = el('ol', { class: 'v2-mission-list' });
  const missionsBody = el('div', { attrs: { hidden: true, id: 'v2-evo-missions' } }, missionRows);
  const missionsToggle = el('button', { class: 'v2-more', help: 'train.missions.toggle', attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': missionsBody.id, 'data-v1': 'train.missions.toggle' },
    on: { click: () => { const open = missionsBody.hidden; missionsBody.hidden = !open; missionsToggle.setAttribute('aria-expanded', String(open)); } } }, missionsLabel);
  const moreBody = el('div', { class: 'v2-more-body', attrs: { hidden: true, id: 'v2-evo-more' } }, el('p', { class: 'v2-evo-guide' }));
  const moreButton = el('button', { class: 'v2-more', help: 'stage.more', attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': moreBody.id, 'data-v1': 'guide.more' },
    on: { click: () => { const open = moreBody.hidden; moreBody.hidden = !open; moreButton.setAttribute('aria-expanded', String(open)); } } }, el('span', { i18n: 'stage.more' }));
  const basicPending = pendingNote();
  const fitnessEl = settingChoice('fitness', FITNESS_KINDS, 'train.fitness', undefined);
  const tryThis = group({ titleKey: 'level.try' },
    fitnessEl, term({ termKey: 'term.fitness', defKey: 'term.fitness.def' }),
    grid(2, settingSlider('population'), settingSlider('mutationStrength')),
    term({ termKey: 'term.mutation', defKey: 'term.mutation.def' }), basicPending);
  tryThis.dataset.v1 = 'train.basic';
  const sensorsSwitch = toggle({ labelKey: 'train.sensors', help: 'train.sensors', value: state.settings.showSensors, dataset: { v1: 'train.sensors' }, onChange: () => setSetting('showSensors', !state.settings.showSensors) });
  const machineSwitch = toggle({ labelKey: 'drive.machine', help: 'train.machine', value: state.machineView, dataset: { v1: 'train.machine' }, onChange: (v) => { state.machineView = v; sync(); } });
  const restartButton = button({ level: 'small', labelKey: 'train.restart', help: 'train.restart', onClick: () => restart(), attrs: { 'data-v1': 'train.restart' } });
  const newPopulationButton = button({ level: 'small', labelKey: 'train.newPopulation', help: 'train.newPopulation', onClick: () => newPopulation(), attrs: { 'data-v1': 'train.newPopulation' } });
  const runNotice = undoNotice({ i18n });
  const extra = group({ titleKey: 'train.v2.runGroup' },
    el('div', { class: 'v2-row v2-row-start' }, machineSwitch.element, sensorsSwitch.element),
    el('div', { class: 'v2-row v2-row-start' }, restartButton, newPopulationButton), runNotice.element);
  s1.append(mission.element, el('div', { class: 'v2-guide-only v2-evo-toggles' }, missionsToggle, missionsBody, moreButton, moreBody), tryThis, extra);

  // --- Hoja Evolución: quién pasa, cómo cambian y cada generación ---------------------------------------
  const s2 = notebook.sheet('evolucion', 'train.v2.sheet.evolution');
  const advancedPending = pendingNote();
  const modePending = el('p', { class: 'v2-notice', attrs: { role: 'status', hidden: true }, i18n: 'train.mode.pending' });
  const resetButton = button({ level: 'tertiary', labelKey: 'train.resetSettings', help: 'train.resetSettings', onClick: () => applySettings(resetPanelSettings(state.settings), resetConfirm), attrs: { 'data-v1': 'train.resetSettings' } });
  const eliteRow = grid(2, settingSlider('elite'), settingSlider('selection'));
  s2.append(advancedPending,
    group({ titleKey: 'train.v2.group.who' },
      settingChoice('selectionMode', SELECTION_MODES, 'train.selectionMode'), modePending,
      eliteRow, el('div', { class: 'v2-row v2-row-start' }, settingToggle('crossover')),
      el('div', { class: 'v2-evo-terms' }, term({ termKey: 'term.elite', defKey: 'term.elite.def' }), term({ termKey: 'term.crossover', defKey: 'term.crossover.def' }))),
    group({ titleKey: 'train.v2.group.how' }, grid(2, settingSlider('mutationRate'), el('div', { class: 'v2-row v2-row-start' }, settingToggle('mutationCooling')))),
    group({ titleKey: 'train.v2.group.each' },
      grid(2, settingSlider('maxDuration'), el('div', { class: 'v2-row v2-row-start' }, settingToggle('slowRule'))),
      settingChoice('trafficMode', TRAFFIC_MODES, 'train.trafficMode')),
    resetButton, resetConfirm.node);

  // --- Hoja Red y pista: capas, neuronas, activación, sensores y dónde entrena ------------------------------
  const s3 = notebook.sheet('red', 'train.v2.sheet.network');
  s3.append(
    group({ titleKey: 'train.advanced.network', tagKey: 'tag.stage' },
      grid(2, settingSlider('hiddenLayers', networkConfirm), settingSlider('neurons1', networkConfirm), settingSlider('neurons2', networkConfirm), settingSlider('neurons3', networkConfirm)),
      settingChoice('activation', ACTIVATIONS, 'train.activation', networkConfirm), term({ termKey: 'term.activation', defKey: 'term.activation.def' }), networkConfirm.node),
    group({ titleKey: 'rules.v2.sensorsGroup', tagKey: 'tag.stage' },
      grid(3, settingSlider('sensorCount', sensorsConfirm), settingSlider('sensorRange', sensorsConfirm), settingSlider('sensorSpread', sensorsConfirm)), sensorsConfirm.node));
  const where = el('div', { class: 'v2-evo-where' });
  s3.append(where);
  const scenarioSheet = mountScenarioSheet({
    i18n, scenario, stage: STAGE, panel: where,
    v1: { track: 'train.tracks', lanes: 'train.setting.lanes', maxSpeed: 'train.setting.maxSpeed', density: 'train.setting.density', irregularity: 'train.setting.irregularity', reset: 'train.resetScenario' },
  });

  // --- Hoja Cerebros: guardar, la biblioteca y los autoguardados -----------------------------------------
  const s4 = notebook.sheet('cerebros', 'train.view.brains');
  s4.classList.add('v2-sheet-brains');
  const quickSave = button({ labelKey: 'train.save.champion', help: 'train.save', onClick: () => { if (canSave()) saveChampion({ update: Boolean(sourceEntry()) }); }, attrs: { 'data-v1': 'train.save train.save.update' } });
  const nameInput = el('input', { class: 'v2-input', help: 'train.save.name', attrs: { type: 'text', maxlength: 40, id: 'v2-train-save-name', 'data-v1': 'train.save.name' }, i18nAttr: 'aria-label:train.save.name',
    on: { keydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); saveAsNew(); } } } });
  function saveAsNew() { if (!canSave()) return; saveChampion({ name: nameInput.value }); nameInput.value = ''; }
  const saveAsButton = button({ level: 'small', labelKey: 'train.save.asNew', help: 'train.save', onClick: saveAsNew });
  const saveResultText = el('span');
  const saveResultAction = el('button', { class: 'v2-btn v2-tertiary', help: 'train.saveResult.rename', attrs: { type: 'button', hidden: true, 'data-v1': 'train.saveResult.rename' },
    on: { click: () => { const m = state.saveMessage; if (m?.action === 'undo') undoUpdate(); else if (m?.action === 'rename') libraryView.startRename(m.id); } } });
  const saveResult = el('p', { class: 'v2-evo-save-result', attrs: { role: 'status' } }, saveResultText, ' ', saveResultAction);
  const saveTitle = el('label', { class: 'v2-setting-name', i18n: 'train.save.title', attrs: { for: 'v2-train-save-name' } });
  const libraryZone = el('div', { class: 'v2-library' });
  s4.append(group({ titleKey: null }, saveTitle, el('div', { class: 'v2-row v2-row-start' }, quickSave), el('div', { class: 'v2-row v2-row-start v2-evo-save-row' }, nameInput, saveAsButton), saveResult), libraryZone);
  // Las hojas cubren las vistas del panel de la V1 (data-v1, para la prueba de paridad, tarea 16.1).
  for (const [sheet, v1] of [['etapa', 'train.view.training'], ['evolucion', 'train.view.settings'], ['red', 'train.view.settings'], ['cerebros', 'train.view.brains']]) {
    const tab = doc.getElementById(`v2-t-evolucion-${sheet}`);
    if (tab) tab.dataset.v1 = v1;
  }
  const libraryView = library ? createLibraryView({ container: libraryZone, library, i18n, onContinue: continueFrom, doc })
    : { showMessage() {}, cancelConfirms() {}, startRename() {}, dispose() {} };
  function setSaveMessage(m) {
    state.saveMessage = m;
    if (!m) { saveResultText.textContent = ''; saveResultText.removeAttribute('data-i18n'); saveResultAction.hidden = true; return; }
    tr(saveResultText, i18n, m.key, m.params);
    saveResultAction.hidden = !m.action;
    if (m.action) tr(saveResultAction, i18n, m.action === 'undo' ? 'train.saveResult.undo' : 'library.rename');
  }

  function revealMission() {
    const current = currentMission(state.missions.missions);
    const target = current && REVEAL[current.id];
    if (target === 'save') notebook.reveal(quickSave);
    else if (target === 'fitness') notebook.reveal(fitnessEl);
  }

  // --- Vista previa de la mutación (entrenar-mutacion-a-la-vista) -----------------------------------------
  let preview = null;
  let announceTimer = null;
  let sampleDrawn = false;
  function startPreview(strength) {
    const tt = state.training;
    preview ??= { base: tt.networks[tt.leaderIndex] };
    Object.assign(preview, { strength, rate: state.settings.mutationRate, until: clock() + PREVIEW_MS, dirty: true });
    sampleLine.setAttribute('aria-live', 'off');
    clearTimeout(announceTimer);
    announceTimer = setTimeout(announcePreview, PREVIEW_ANNOUNCE_MS);
  }
  function announcePreview() {
    clearTimeout(announceTimer);
    announceTimer = null;
    if (!preview) return;
    sampleLine.setAttribute('aria-live', 'polite');
    sampleLine.textContent = '';
    queueMicrotask(() => { if (preview?.result) writePreviewLine(); });
  }
  function writePreviewLine() {
    const { diff } = preview.result;
    const changed = diff.changedWeights.size + diff.changedBiases.size;
    if (changed === 0) tr(sampleLine, i18n, 'train.network.preview.zero', { strength: preview.strength });
    else tr(sampleLine, i18n, 'train.network.preview', { strength: preview.strength, changed, total: diff.total, mean: formatFixed(diff.meanChange, 2, i18n.language) });
    sampleLine.hidden = false;
  }
  function endPreview() {
    if (!preview) return;
    preview = null;
    clearTimeout(announceTimer);
    announceTimer = null;
    sampleLine.setAttribute('aria-live', 'polite');
    sampleDrawn = false;
    if (cut.active && state.training.mutationSample) writeCutLine();
    else sampleLine.hidden = true;
  }
  function showCut() {
    const tt = state.training;
    const b = tt.breeding;
    tr(cutTitle, i18n, 'train.cut.title', { generation: tt.generation });
    if (!b || b.mode === 'fresh') tr(cutText, i18n, 'train.cut.fresh', { rest: b ? b.rest : tt.population });
    else if (b.mode === 'manual') tr(cutText, i18n, 'train.cut.manual', { rest: b.rest, strength: Math.round(b.strength) });
    else tr(cutText, i18n, b.elite === 0 ? 'train.cut.auto.none' : b.elite === 1 ? 'train.cut.auto.one' : 'train.cut.auto', { elite: b.elite, rest: b.rest, selection: b.selection, strength: Math.round(b.strength) });
    const elite = b ? b.elite : 0;
    cutElite.replaceChildren(...Array.from({ length: elite }, () => el('span', { class: 'v2-cut-mark' })));
    cutElite.hidden = elite === 0;
    cutCard.hidden = false;
    if (!preview) writeCutLine();
    sampleDrawn = false;
  }
  function writeCutLine() {
    const sample = state.training.mutationSample;
    if (sample) {
      const d = mutationDiff(sample.base, sample.network);
      tr(sampleLine, i18n, 'train.network.sample', { changed: d.changedWeights.size + d.changedBiases.size, total: d.total, mean: formatFixed(d.meanChange, 2, i18n.language) });
    }
    sampleLine.hidden = !sample;
  }
  function hideCut() { cutCard.hidden = true; if (!preview) sampleLine.hidden = true; sampleDrawn = false; }

  function describeChanges(changes) {
    const value = (key, v) => {
      if (typeof v === 'boolean') return t(v ? 'train.chart.on' : 'train.chart.off');
      if (key === 'fitness') return t(`train.fitness.${v}`);
      if (key === 'trafficMode') return t(`train.trafficMode.${v}`);
      if (key === 'selectionMode') return t(`train.selectionMode.${v}`);
      if (typeof v === 'number' && FORMATS[key]) return t(FORMATS[key], { value: Math.round(v) });
      return String(v);
    };
    return changes.map((c) => t('train.chart.change', { name: t(`train.setting.${c.key}`), from: value(c.key, c.from), to: value(c.key, c.to) })).join(t('train.chart.changeSeparator'));
  }

  // --- Sincronizar con el estado ------------------------------------------------------------------------
  const write = (node, text) => { if (node.textContent !== text) node.textContent = text; };
  let lastDescription = '';
  let missionsKey = '';
  function sync() {
    const tt = state.training;
    const s = state.settings;
    const manual = s.selectionMode === 'manual';
    const ind = indicators(tt);
    write(fGen.b, String(ind.generation));
    write(fAlive.b, t('train.value.alive', { value: ind.alive, total: ind.total }));
    tr(fLeader.s, i18n, ind.leaderLabel);
    write(fLeader.b, t(ind.leader.key, ind.leader.params));
    tr(fPassed.s, i18n, ind.laps === null ? 'train.stats.passed' : 'train.stats.laps');
    write(fPassed.b, ind.laps === null ? String(ind.passed) : t('drive.value.laps', { value: formatFixed(ind.laps, 1, i18n.language) }));
    tr(generationBadge, i18n, 'train.badge.generation', { value: ind.generation });
    const restarted = state.restarted?.training === tt && state.restarted.generation === tt.generation;
    restartedBadge.hidden = !restarted;
    if (restarted) tr(restartedBadge, i18n, 'train.badge.restarted');
    machineBadge.hidden = !state.machineView;
    pauseBadge.hidden = !state.paused;
    const last = lastGeneration(tt);
    if (last) { tr(lastBest, i18n, last.best.key, last.best.params); tr(lastReason, i18n, last.reason); } else tr(lastBest, i18n, 'train.last.none');
    lastReason.hidden = !last;
    const text = trainingDescription({ t, track: ind.trackId, lanes: tt.config.lanes, generation: ind.generation, alive: ind.alive, total: ind.total, paused: state.paused, machineView: state.machineView });
    if (text !== lastDescription) { description.textContent = text; lastDescription = text; }

    // Placa y marcha.
    tr(consigna, i18n, manual ? 'consigna.train.manual' : 'consigna.train');
    setAttr(pauseButton, 'aria-pressed', String(state.paused));
    tr(pauseButton.querySelector('span'), i18n, state.paused ? 'train.resume.plain' : 'train.pause.plain');
    // Acción principal: la marcha, o Elegir al líder con la selección manual sin padre elegido.
    const manualPending = manual && !tt.parent;
    pauseButton.classList.toggle('v2-primary', !manualPending);
    chooseButton.classList.toggle('v2-primary', manualPending);
    speeds.set(s.speed);
    factor.hidden = s.speed !== 'max';
    if (s.speed === 'max') {
      const achieved = loop.achievedFactor;
      if (achieved === null || state.paused) tr(factor, i18n, 'train.speed.measuring');
      else tr(factor, i18n, 'train.speed.factor', { value: Math.max(1, Math.round(achieved)) });
    }
    manualBox.hidden = !manual;
    if (manual) {
      const st = parentStatus(tt);
      tr(parentLine, i18n, st.key, st.params);
      undoChoiceButton.hidden = tt.choiceCount === 0;
    }

    // Misión y misiones.
    const list = state.missions.missions;
    const current = currentMission(list);
    mission.element.hidden = !current;
    if (current?.allDone) mission.set({ nameKey: 'mission.allDone', done: 1, goal: 1, complete: true });
    else if (current) mission.set({ nameKey: `train.mission.${current.id}`, params: { goal: current.goal }, countKey: current.unit === 'none' ? 'train.mission.pending' : `train.mission.progress.${current.unit}`, countParams: current.unit === 'none' ? null : { value: Math.floor(current.progress), goal: current.goal }, done: current.progress, goal: current.goal });
    if (missionReveal) missionReveal.hidden = !(current && REVEAL[current.id]);
    tr(missionsLabel, i18n, 'train.missions.summary', missionsSummary(list));
    const mk = JSON.stringify([list.map((m) => [m.done, Math.floor(m.progress)]), i18n.language]);
    if (mk !== missionsKey) {
      missionsKey = mk;
      missionRows.replaceChildren(...list.map((m) => el('li', { attrs: { 'data-done': String(m.done) } },
        el('span', { i18n: `train.mission.${m.id}`, params: { goal: m.goal }, text: t(`train.mission.${m.id}`, { goal: m.goal }) }), ' · ',
        el('span', { class: 'v2-muted', text: m.done ? t('train.mission.done') : m.unit === 'none' ? t('train.mission.pending') : t(`train.mission.progress.${m.unit}`, { value: Math.floor(m.progress), goal: m.goal }) }))));
    }
    tr(moreBody.firstChild, i18n, manual ? 'train.guide.manual' : 'train.guide');

    // Ajustes.
    const waiting = tt.pending ? Object.keys(tt.pending) : [];
    const othersWaiting = settingsWaiting(tt.pending);
    modePending.hidden = !waiting.includes('selectionMode');
    basicPending.hidden = !(othersWaiting || waiting.includes('fitness'));
    advancedPending.hidden = !othersWaiting;
    const cooling = s.mutationCooling && !manual;
    const active = doc.activeElement;
    for (const [key, sl] of Object.entries(sliders)) {
      const v = key === 'mutationStrength' && cooling ? Math.round(tt.nextMutationStrength) : s[key];
      if (active === sl.input && sl.deferred) continue;
      if (Number(sl.input.value) !== v) sl.set(v);
    }
    [1, 2, 3].forEach((n) => { sliders[`neurons${n}`].element.hidden = n > s.hiddenLayers; });
    for (const [key, sw] of Object.entries(switches)) sw.set(s[key]);
    // Lo que no aplica, oculto: con selección manual, élite, selección, cruce y enfriar; en un circuito, el modo de tráfico.
    for (const key of NOT_IN_MANUAL) (sliders[key] ?? switches[key]).element.hidden = manual;
    eliteRow.hidden = manual;
    const strength = sliders.mutationStrength;
    setAttr(strength.input, 'aria-disabled', String(cooling));
    strength.input.disabled = cooling;
    strength.element.dataset.help = cooling ? 'train.setting.strengthCooling' : 'train.setting.mutationStrength';
    choices.trafficMode.element.hidden = onlyCircuits(s.tracks);
    choices.fitness.set(s.fitness);
    choices.selectionMode.set(s.selectionMode);
    choices.trafficMode.set(s.trafficMode);
    choices.activation.set(s.activation);
    sensorsSwitch.set(s.showSensors);
    machineSwitch.set(state.machineView);

    // Guardar.
    const parentMode = tt.config.selectionMode === 'manual';
    const has = canSave();
    const source = sourceEntry();
    tr(saveTitle, i18n, parentMode ? 'train.save.title.parent' : 'train.save.title');
    quickSave.disabled = !has;
    quickSave.dataset.help = !has ? (parentMode ? 'train.save.disabled.parent' : 'train.save.disabled') : source ? 'train.save.update' : parentMode ? 'train.save.parent' : 'train.save';
    tr(quickSave.querySelector('span'), i18n, source ? 'train.save.updateNamed' : parentMode ? 'train.save.parentButton' : 'train.save.champion', source ? { name: source.brain.name } : null);
    saveAsButton.disabled = !has;
    const ph = library ? library.suggestName(t('library.defaultName')) : '';
    if (nameInput.placeholder !== ph) nameInput.placeholder = ph;
  }

  function drawNetwork() {
    const tt = state.training;
    const sample = cut.active ? tt.mutationSample : null;
    const mode = networkCardMode({ preview: Boolean(preview), cut: Boolean(sample) });
    if (mode === 'preview') {
      if (preview.dirty || !sampleDrawn) {
        if (preview.dirty) preview.result = mutationPreview(preview.base, { strength: preview.strength, rate: preview.rate });
        preview.dirty = false;
        writePreviewLine();
        networkView.render(preview.result.network, null, { marks: preview.result.diff });
        sampleDrawn = true;
      }
      return;
    }
    if (mode === 'cut') {
      if (!sampleDrawn) { networkView.render(sample.network, null, { marks: mutationDiff(sample.base, sample.network) }); sampleDrawn = true; }
      return;
    }
    const leader = tt.world.agents[tt.leaderIndex];
    networkView.render(tt.networks[tt.leaderIndex], [...leader.perception.sensors, leader.perception.speed], { live: !state.paused });
  }

  // --- Bucle ----------------------------------------------------------------------------------------------
  function step() {
    if (state.paused || cut.active) return;
    state.training.step();
    state.missions.observe(state.training);
  }
  function render() {
    const tt = state.training;
    if (cut.active) { if (!guideOn()) cut.end(); else cut.tick(clock()); if (!cut.active) hideCut(); }
    if (preview && clock() >= preview.until) endPreview();
    view.render(tt.world, {
      showSensors: state.settings.showSensors || state.machineView, machineView: state.machineView,
      focus: tt.leaderIndex, elite: Array.from({ length: tt.eliteCount }, (_, i) => i), focusElite: cut.active && tt.eliteCount > 0,
    });
    drawNetwork();
    sync();
  }
  const loop = createLoop({ step, render, onError: (err) => console.error(err), speed: state.settings.speed });

  // --- Atajos: espacio pausa, T turbo, N siguiente; E y Z con selección manual --------------------------------
  let handledSpace = false;
  function onKeyDown(e) {
    if (!visible) return;
    const action = shortcutFor(e);
    if (!action) return;
    if ((action === 'choose' || action === 'undo') && !manualWanted()) return;
    e.preventDefault();
    if (action === 'pause') handledSpace = true;
    if (e.repeat) return;
    if (action === 'pause') togglePause();
    else if (action === 'turbo') setSpeed(toggleTurbo(state.settings.speed));
    else if (action === 'choose') chooseLeader();
    else if (action === 'undo') undoChoice();
    else nextGeneration();
  }
  function onKeyUp(e) { if (e.code === 'Space' && handledSpace) { handledSpace = false; e.preventDefault(); } }
  const onVisibility = () => { if (doc.hidden) library?.flush(); };
  const onPageHide = () => library?.flush();
  doc.addEventListener('visibilitychange', onVisibility);
  win.addEventListener('pagehide', onPageHide);
  win.addEventListener('keydown', onKeyDown);
  win.addEventListener('keyup', onKeyUp);
  const offLanguage = i18n.onChange(() => { missionsKey = ''; lastDescription = ''; sync(); chart.refresh(); });

  attachTraining();
  chart.update(state.training.history);
  sync();

  return {
    view, loop, networkView, chart, state,
    get training() { return state.training; },
    get settings() { return { ...state.settings }; },
    togglePause, nextGeneration, chooseLeader, undoChoice, restart, newPopulation, setSpeed, applySettings, saveChampion, continueFrom,
    /** Avanza `n` pasos y dibuja (verificación desde la consola, aunque el navegador no pida cuadros). */
    advance(n = 1) { for (let i = 0; i < n; i += 1) step(); render(); },
    show() { visible = true; loop.start(); },
    hide() { visible = false; loop.stop(); library?.flush(); },
    unmount() {
      library?.flush();
      loop.dispose();
      offLanguage?.();
      offGeneration();
      offScenario();
      scenarioSheet.dispose();
      doc.removeEventListener('visibilitychange', onVisibility);
      win.removeEventListener('pagehide', onPageHide);
      win.removeEventListener('keydown', onKeyDown);
      win.removeEventListener('keyup', onKeyUp);
      libraryView.dispose();
      chart.dispose();
      networkView.dispose();
      view.dispose();
    },
  };
}
