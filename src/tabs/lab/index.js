// Pestaña 6, "Laboratorio" (pestana-laboratorio): una red aprende de ejemplos corrigiendo sus errores.
//
// Disposición (D1): la de Inspeccionar, con sus mismos anchos. La zona izquierda es de la red (los
// controles de la vista arriba, la red, la operación en curso y la barra de reproducción abajo); el
// tablero lleva los datos (el plano de puntos o la escena), el ejemplo en curso y las curvas; el
// panel, la red, el aprendizaje, las acciones y, con tu manejo, de quién son los ejemplos.
//
// Lo que se ve es la cuenta real (D2 y D3): la sesión (session.js) arma los datos y el aprendizaje
// del núcleo (learning-cursor.js), y la vista dibuja la cuenta del ejemplo en curso. La lógica sin DOM
// vive en session.js, playback.js, describe.js, missions.js, step-animation.js y shortcuts.js.
//
// El estado vive en el módulo y se conserva hasta cerrar la aplicación; el aprendizaje queda en pausa
// mientras la pestaña no está a la vista (D12).
import { createWorld } from '../../core/world.js';
import { computeNetwork, copyNetwork } from '../../core/network.js';
import { forwardSoft } from '../../core/backprop.js';
import { overfitting } from '../../core/overfitting.js';
import { createRecorder, DRIVING_OUTPUTS, summary, POINT_SHAPES, POINT_LIMITS, HOLDOUT_LIMITS } from '../../core/datasets.js';
import { createBrain } from '../../core/brain.js';
import { DEFAULT_SENSORS } from '../../core/sensors.js';
import { LEARNING_STEP_SIZES } from '../../core/learning-cursor.js';
import { TRACK_IDS } from '../../core/circuits.js';
import { STEP } from '../../core/constants.js';
import { createStageView } from '../../render/view.js';
import { createNetworkInspector } from '../../render/network-inspector.js';
import { neighborOf } from '../../render/inspector-layout.js';
import { createWeightTable } from '../../render/weight-table.js';
import { createPlaneView } from '../../render/plane-view.js';
import { createLoop } from '../../ui/loop.js';
import { el, setData } from '../../ui/dom.js';
import { returnsFocusToStage } from '../../ui/shortcuts.js';
import { createTextSetter } from '../../ui/controls.js';
import { formatValue } from '../../ui/i18n.js';
import { createPicker } from '../../ui/picker.js';
import { createFitnessChart } from '../../ui/chart.js';
import { stageDescription } from '../../ui/stage-description.js';
import { createKeyboardController } from '../../input/keyboard.js';
import { scenarioBar, barGroupNode, createSliderGesture } from '../shared/scenario-bar.js';
import { actionBlock, ACTIONS } from '../shared/driving-cards.js';
import { EXAMPLE_BRAINS } from '../../data/example-brains.js';
import { listBrains, PICKER_GROUPS, trainedTracks } from '../inspect/brains.js';
import { createLabSession, rateToSlider, sliderToRate, DRIVING_DEFAULTS } from './session.js';
import { createLabPlayback, PACES, isRunning } from './playback.js';
import { createLearningAnimation, stepDuration } from './step-animation.js';
import { describeLearningStep, whereText, layerName, neuronName } from './describe.js';
import { createLabMissions } from './missions.js';
import { shortcutFor } from './shortcuts.js';
import { LAB_NETWORK_LIMITS, LAB_ACTIVATIONS } from './defaults.js';

/** Semilla del tráfico de la escena (con tu manejo). */
export const SEED = 1;
/** Cuadros que se ve el choque antes de volver a salir. */
export const RETRY_TICKS = 60;
export const FILTERS = Object.freeze(['all', 5, 3, 1]);
export const VIEWS = Object.freeze(['diagram', 'table']);
/** Mismos anchos que Inspeccionar (D1): la misma preferencia, así la red mide lo mismo en las dos. */
export const ZONES = Object.freeze({ stageMin: 600, stageDefault: 'rest', preference: 'inspectStageWidth' });
/** El fondo del plano se recalcula como mucho 15 veces por segundo (plane-view.js). */

// --- Estado conservado entre montajes ------------------------------------------------------------
let state = null;
const completedMissions = new Set();

/** Olvida el estado conservado (para pruebas). */
export function resetState() { state = null; }

const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const pct = (x) => (x === null || x === undefined ? '–' : `${Math.round(x * 100)} %`);

export function mount({ stage, board, panel, bar, i18n, store, library, reportError }) {
  const t = (k, p) => i18n.t(k, p);
  const setText = createTextSetter(i18n);
  const fmt = (v) => formatValue(v, i18n.language);

  // --- Cerebros (maestros) -------------------------------------------------------------------------
  let candidates = [];
  const refreshCandidates = () => { candidates = listBrains({ library: library ? library.list() : [], examples: EXAMPLE_BRAINS }); };
  refreshCandidates();
  const brainFor = (key) => candidates.find((c) => c.key === key && c.available)?.brain ?? null;
  const candidateName = (c) => (c ? (c.nameKey ? t(c.nameKey) : c.name) : '');

  if (!state) {
    state = {
      session: createLabSession({ brainFor: (key) => brainFor(key) }),
      playback: createLabPlayback(),
      view: 'diagram',
      filter: 'all',
      collapsed: [],
      shapeKey: '',
      selected: { layer: 1, neuron: 0 },
      missions: createLabMissions({ completed: completedMissions }),
      recorder: createRecorder({ sensors: DEFAULT_SENSORS }),
      wasPlaying: true,
      firstTime: true,
      saveNotice: null,
      lastPoints: null,
    };
  }
  const session = state.session;
  const playback = state.playback;
  playback.pause();

  // --- Estado de la vista (no se conserva) ---------------------------------------------------------
  let animation = null;
  let lastStep = null; // { units, detail, size }
  let announcedAppearances = 0;
  let version = -1;
  let changesVersion = 0;
  let recording = false;
  let world = null;
  let worldKey = '';
  let crashTicks = 0;
  let recordStarted = false;
  const keyboard = createKeyboardController();
  const run = () => session.run;
  const ctx = () => ({ kind: session.kind, sizes: run().network.sizes });
  const isPoints = () => session.kind === 'points';

  // ==================================================================================================
  // Zona izquierda: la red
  // ==================================================================================================
  const netTitle = el('h2', { class: 'inspect-net-title', attrs: { id: 'lab-net-title' } });
  const viewButtons = VIEWS.map((v) => el('button', {
    class: 'segment', i18n: `inspect.view.${v}`, help: `inspect.view.${v}`,
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { view: v },
    on: { click: () => { state.view = v; layoutKey = ''; sync(); } },
  }));
  const viewGroup = el('div', { class: 'segments inspect-views', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.view.label' }, viewButtons);
  const filterButtons = FILTERS.map((f) => el('button', {
    class: 'segment', i18n: f === 'all' ? 'inspect.filter.all' : 'inspect.filter.n', params: f === 'all' ? undefined : { value: f },
    help: f === 'all' ? 'inspect.filter.all' : `inspect.filter.${f}`,
    i18nAttr: f === 'all' ? undefined : 'aria-label:inspect.filter.nLabel',
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { filter: String(f) },
    on: { click: () => { state.filter = f; sync(); } },
  }));
  const filterGroup = el('div', { class: 'inspect-filter', attrs: { role: 'group', 'aria-labelledby': 'lab-filter-label' } },
    el('span', { class: 'inspect-label', i18n: 'inspect.filter.label', help: 'inspect.filter', attrs: { id: 'lab-filter-label' } }),
    el('div', { class: 'segments' }, filterButtons));
  const collapseAll = el('button', { class: 'tool small inspect-collapse-all', attrs: { type: 'button' }, on: { click: () => toggleAll() } });
  const zoomOut = el('button', { class: 'tool small inspect-zoom', i18n: 'camera.zoomOut', help: 'inspect.zoomOut', i18nAttr: 'aria-label:camera.zoomOut.label', attrs: { type: 'button' }, on: { click: () => inspector.zoomOut() } });
  const zoomIn = el('button', { class: 'tool small inspect-zoom', i18n: 'camera.zoomIn', help: 'inspect.zoomIn', i18nAttr: 'aria-label:camera.zoomIn.label', attrs: { type: 'button' }, on: { click: () => inspector.zoomIn() } });
  const zoomReset = el('button', { class: 'tool small inspect-zoom-reset', i18n: 'inspect.zoomReset', help: 'inspect.zoomReset', attrs: { type: 'button' }, on: { click: () => inspector.resetView() } });
  const zoomGroup = el('div', { class: 'inspect-zoom-group', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.zoom.label' }, zoomOut, zoomIn, zoomReset);
  const controls = el('div', { class: 'inspect-controls' },
    el('div', { class: 'inspect-row' }, netTitle, viewGroup, filterGroup),
    el('div', { class: 'inspect-row' }, collapseAll, el('span', { class: 'inspect-edits' }), zoomGroup));

  const area = el('div', { class: 'inspect-area', attrs: { role: 'group', 'aria-labelledby': 'lab-net-title' } });
  const diagram = el('div', { class: 'inspect-diagram' });
  const tableZone = el('div', { class: 'inspect-table-zone' });
  area.append(diagram, tableZone);
  const inspector = createNetworkInspector({
    container: diagram, i18n,
    onSelect: (target) => { select(target); focusNeuron(target, { focus: false }); },
    onViewChange: () => { layoutKey = ''; },
  });
  const headerLayer = el('div', { class: 'inspect-headers' });
  const neuronLayer = el('div', { class: 'inspect-neurons', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.neurons.label', on: { keydown: (e) => onNeuronKey(e) } });
  inspector.overlay.append(headerLayer, neuronLayer);
  let headerButtons = [];
  let tableHeaders = [];
  let neuronButtons = [];
  const nameOf = (l, j) => neuronName(t, ctx(), l, j);
  const labels = {
    input: (i) => nameOf(0, i),
    output: (j) => nameOf(run().network.sizes.length - 1, j),
    neuron: ({ layer, neuron }) => nameOf(layer, neuron),
  };
  function makeHeader(l, { inTable }) {
    return el('button', {
      class: inTable ? 'inspect-layer-head inspect-layer-head-table' : 'inspect-layer-head', help: 'inspect.layer.head',
      attrs: { type: 'button', 'aria-expanded': 'true' }, dataset: { layer: String(l), focus: 'keep' },
      on: { click: () => toggleLayer(l) },
    }, el('span', { class: 'inspect-layer-mark', attrs: { 'aria-hidden': 'true' } }), el('span', { class: 'inspect-layer-name' }));
  }
  const table = createWeightTable({
    container: tableZone, i18n,
    onSelect: (target) => select(target),
    headerFor: (l) => { const h = makeHeader(l, { inTable: true }); tableHeaders[l] = h; return h; },
    names: { layer: (l) => layerName(t, l, run().network.sizes.length), neuron: (l, j) => nameOf(l, j) },
  });

  function buildOverlay() {
    const sizes = run().network.sizes;
    headerLayer.replaceChildren();
    neuronLayer.replaceChildren();
    tableHeaders = [];
    headerButtons = sizes.map((_, l) => { const h = makeHeader(l, { inTable: false }); headerLayer.append(h); return h; });
    neuronButtons = sizes.map((count, l) => Array.from({ length: count }, (_, j) => {
      const b = el('button', {
        class: 'inspect-neuron', help: 'lab.neuron', dataset: { layer: String(l), neuron: String(j), focus: 'keep', shortcuts: 'pass' },
        attrs: { type: 'button', tabindex: '-1' },
        on: { click: () => select({ layer: l, neuron: j }), focus: () => labelNeuron(b, l, j) },
      });
      neuronLayer.append(b);
      return b;
    }));
    layoutKey = '';
    focusNeuron(state.selected, { focus: false });
  }
  function toggleLayer(l) { state.collapsed = state.collapsed.map((v, i) => (i === l ? !v : v)); layoutKey = ''; sync(); }
  function toggleAll() { const all = state.collapsed.every(Boolean); state.collapsed = state.collapsed.map(() => !all); layoutKey = ''; sync(); }
  function focusNeuron(target, { focus = true } = {}) {
    for (const row of neuronButtons) for (const b of row) b.tabIndex = -1;
    const b = neuronButtons[target.layer]?.[target.neuron];
    if (!b) return;
    b.tabIndex = 0;
    if (!focus) return;
    if (state.view === 'diagram' && inspector.zoomed) {
      const p = inspector.screenOf(target.layer, target.neuron);
      const vp = inspector.viewport;
      if (p && (p.x < 40 || p.x > vp.width - 40 || p.y < 40 || p.y > vp.height - 40)) { inspector.camera.pan(vp.width / 2 - p.x, vp.height / 2 - p.y); layoutKey = ''; }
    }
    b.focus({ preventScroll: true });
  }
  function onNeuronKey(e) {
    const b = e.target.closest?.('.inspect-neuron');
    if (!b) return;
    const to = neighborOf(run().network.sizes, { layer: Number(b.dataset.layer), neuron: Number(b.dataset.neuron) }, e.key);
    if (!to) return;
    e.preventDefault();
    e.stopPropagation();
    focusNeuron(to);
  }
  function select(target) {
    if (!target) return;
    state.selected = { layer: target.layer, neuron: target.neuron };
    focusNeuron(state.selected, { focus: false });
    sync();
  }
  function labelNeuron(b, l, j) {
    const shown = displayed.trace;
    const n = shown?.layers[l]?.neurons[j];
    const c = displayed.cursor;
    const value = !n ? '–' : l === 0 || !c || c.opsDone(l, j) === 4 ? fmt(n.output) : t('inspect.aria.pending');
    const blame = displayed.learning?.blame(l, j);
    const extra = blame === null || blame === undefined ? '' : `. ${t('lab.aria.blame', { value: fmt(blame) })}`;
    const label = t('inspect.aria.neuron', { layer: layerName(t, l, run().network.sizes.length), name: nameOf(l, j), value }) + extra;
    if (b.getAttribute('aria-label') !== label) b.setAttribute('aria-label', label);
    b.setAttribute('aria-pressed', String(state.selected.layer === l && state.selected.neuron === j));
  }

  // Operación en curso y reproducción (D11)
  const opText = el('p', { class: 'lab-op-text' });
  const opNote = el('p', { class: 'lab-op-note muted', i18n: 'inspect.card.rounding' });
  const opStrip = el('div', { class: 'lab-op', attrs: { 'aria-hidden': 'true' } }, opText, opNote);
  const playButton = el('button', { class: 'tool primary inspect-play', attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: () => togglePlay() } });
  const stepButton = el('button', { class: 'tool inspect-step', i18n: 'inspect.step', help: 'lab.step', attrs: { type: 'button' }, on: { click: () => stepOnce() } });
  const sizeButtons = LEARNING_STEP_SIZES.map((s) => el('button', {
    class: 'segment', i18n: `lab.size.${s}`, help: `lab.size.${s}`,
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { size: s, focus: 'keep' },
    on: { click: () => setSize(s) },
  }));
  const sizeGroup = el('div', { class: 'inspect-size', attrs: { role: 'group', 'aria-labelledby': 'lab-size-label' } },
    el('span', { class: 'inspect-label', i18n: 'inspect.size.label', help: 'lab.size', attrs: { id: 'lab-size-label' } }),
    el('div', { class: 'segments' }, sizeButtons));
  const paceValue = el('output', { class: 'inspect-pace-value', attrs: { for: 'lab-pace' } });
  const paceInput = el('input', {
    help: 'lab.pace', dataset: { focus: 'keep' },
    attrs: { type: 'range', id: 'lab-pace', min: 0, step: 1 },
    on: { input: (e) => { playback.setPace(Number(e.target.value)); sync(); } },
  });
  const paceGroup = el('div', { class: 'inspect-pace' },
    el('label', { class: 'inspect-label', attrs: { for: 'lab-pace' }, i18n: 'inspect.pace.label' }), paceInput, paceValue);
  const where = el('p', { class: 'inspect-where' });
  const playbar = el('div', { class: 'inspect-playbar', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.playbar.label' },
    el('div', { class: 'inspect-playbar-main' }, playButton, stepButton, sizeGroup),
    el('div', { class: 'inspect-playbar-pace' }, paceGroup, where));
  const netZone = el('div', { class: 'inspect-net' }, controls, area, opStrip, playbar);
  stage.append(netZone);
  stage.classList.add('inspect-stage', 'lab-stage');

  // ==================================================================================================
  // Tablero: datos, ejemplo en curso y curvas
  // ==================================================================================================
  const planeBox = el('div', { class: 'lab-plane', attrs: { role: 'img' } });
  const plane = createPlaneView({ container: planeBox });
  const scene = el('div', { class: 'inspect-scene lab-scene' });
  const sceneView = createStageView({ container: scene, store, small: true });
  const recordText = el('span', { class: 'lab-record-text' });
  const finishButton = el('button', { class: 'tool small lab-finish', i18n: 'lab.record.finish', help: 'lab.record.finish', attrs: { type: 'button' }, on: { click: () => stopRecording() } });
  const recordBadge = el('div', { class: 'stage-badge lab-record-badge', attrs: { role: 'status' } }, recordText, finishButton);
  const crashBadge = el('div', { class: 'stage-badge crash-badge', attrs: { role: 'status' }, i18n: 'inspect.crash' });
  scene.append(el('div', { class: 'inspect-scene-badges' }, recordBadge, crashBadge));
  const sceneDescription = stageDescription({ stage: scene, id: 'lab-scene-description' });
  const dataSummary = el('p', { class: 'caption lab-summary' });
  const dataBlock = el('section', { class: 'lab-data', attrs: { 'aria-labelledby': 'lab-data-title' } },
    el('h2', { class: 'sr-only', i18n: 'lab.data.title', attrs: { id: 'lab-data-title' } }), planeBox, scene, dataSummary);

  // Ejemplo en curso (D7)
  const exampleText = el('p', { class: 'lab-example-text' });
  const fan = el('div', { class: 'lab-fan', attrs: { 'aria-hidden': 'true' } });
  const actionsExample = actionBlock();
  const actionsNet = actionBlock();
  const actionsRows = el('div', { class: 'lab-actions' },
    el('div', { class: 'lab-actions-row' }, el('span', { class: 'lab-actions-name', i18n: 'lab.example.target' }), actionsExample.node),
    el('div', { class: 'lab-actions-row' }, el('span', { class: 'lab-actions-name', i18n: 'lab.example.net' }), actionsNet.node));
  const exampleBlock = el('section', { class: 'lab-example', attrs: { 'aria-labelledby': 'lab-example-title' } },
    el('h2', { class: 'panel-heading', i18n: 'lab.example.title', help: 'lab.example', attrs: { id: 'lab-example-title', tabindex: '0' } }),
    el('div', { class: 'lab-example-body' }, fan, el('div', { class: 'lab-example-main' }, exampleText, actionsRows)));

  // Curvas (D7)
  const chartZone = el('div', { class: 'lab-chart' });
  const chart = createFitnessChart({
    container: chartZone, i18n, value: (v) => fmt(v), focusable: { help: 'lab.chart' },
    keys: {
      empty: 'lab.chart.empty', restarted: 'lab.chart.empty', aria: 'lab.chart.aria', best: 'lab.chart.practice', average: 'lab.chart.heldOut',
      tick: 'train.chart.tick', xAxis: 'lab.chart.xAxis', yAxis: 'lab.chart.yAxis', readout: 'lab.chart.readout', marker: 'lab.chart.best',
    },
  });
  const stats = el('p', { class: 'lab-stats' });
  const warning = el('p', { class: 'lab-warning', attrs: { role: 'status' } });
  const chartText = el('p', { class: 'sr-only', attrs: { id: 'lab-chart-description' } });
  const curves = el('section', { class: 'lab-curves', attrs: { 'aria-labelledby': 'lab-curves-title' } },
    el('h2', { class: 'panel-heading', i18n: 'lab.chart.title', help: 'lab.chart.title', attrs: { id: 'lab-curves-title', tabindex: '0' } }),
    stats, chartZone, warning, chartText);
  chart.element.setAttribute('aria-describedby', 'lab-chart-description');
  const announcer = el('p', { class: 'sr-only', attrs: { role: 'status', 'aria-live': 'polite' } });
  function announce(text) { announcer.textContent = ''; announcer.textContent = text ?? ''; }
  board.append(el('div', { class: 'lab-board' }, dataBlock, exampleBlock, curves), announcer);

  // ==================================================================================================
  // Panel: guía, red, aprendizaje, acciones, tu manejo y misiones (D6)
  // ==================================================================================================
  const intro = el('p', { class: 'guide inspect-intro lab-intro' });
  // Red
  const layerButtons = [0, 1, 2, 3].map((n) => el('button', {
    class: 'segment', i18n: 'lab.layers.option', params: { n }, help: 'lab.layers', i18nAttr: 'aria-label:lab.layers.optionLabel',
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { layers: String(n) },
    on: { click: () => { if (session.setLayers(n)) restarted(); } },
  }));
  const layersRow = el('div', { class: 'lab-field' },
    el('span', { class: 'lab-field-name', i18n: 'lab.layers', help: 'lab.layers', attrs: { id: 'lab-layers-label' } }),
    el('div', { class: 'segments', attrs: { role: 'group', 'aria-labelledby': 'lab-layers-label' } }, layerButtons));
  const neuronRows = el('div', { class: 'lab-neuron-rows' });
  let neuronSliders = [];
  function buildNeuronSliders() {
    const hidden = session.settings.hidden;
    if (neuronSliders.length === hidden.length) return;
    neuronRows.replaceChildren();
    neuronSliders = hidden.map((_, k) => {
      const id = `lab-neurons-${k}`;
      const value = el('output', { class: 'lab-value', attrs: { for: id, 'aria-hidden': 'true' } });
      const gesture = createSliderGesture((v, { final }) => { value.textContent = String(v); if (final && session.setNeurons(k, v)) restarted(); });
      const input = el('input', {
        help: 'lab.neurons', i18nAttr: 'aria-label:lab.neurons.label', params: { n: k + 1 },
        attrs: { type: 'range', id, min: LAB_NETWORK_LIMITS.neurons.min, max: LAB_NETWORK_LIMITS.neurons.max, step: 1 },
        on: { input: (e) => gesture.input(Number(e.target.value)), change: (e) => gesture.change(Number(e.target.value)) },
      });
      const row = el('div', { class: 'lab-slider' },
        el('label', { class: 'lab-slider-label', attrs: { for: id } }, el('span', { i18n: 'lab.neurons.name', params: { n: k + 1 } }), value), input);
      neuronRows.append(row);
      return { input, value, gesture };
    });
    i18n.translateTree(neuronRows);
  }
  const activationButtons = LAB_ACTIVATIONS.map((a) => el('button', {
    class: 'segment', i18n: `inspect.activation.${a}`, help: 'lab.activation',
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { activation: a },
    on: { click: () => { if (session.setActivation(a)) restarted(); } },
  }));
  const activationRow = el('div', { class: 'lab-field' },
    el('span', { class: 'lab-field-name', i18n: 'lab.activation', help: 'lab.activation', attrs: { id: 'lab-activation-label' } }),
    el('div', { class: 'segments', attrs: { role: 'group', 'aria-labelledby': 'lab-activation-label' } }, activationButtons));
  const netSection = el('section', { class: 'lab-section', attrs: { 'aria-labelledby': 'lab-net-heading' } },
    el('h2', { class: 'panel-heading', i18n: 'lab.panel.network', attrs: { id: 'lab-net-heading' } }), layersRow, neuronRows, activationRow);
  // Aprendizaje
  const rateValue = el('output', { class: 'lab-value', attrs: { for: 'lab-rate', 'aria-hidden': 'true' } });
  const rateInput = el('input', {
    help: 'lab.rate', i18nAttr: 'aria-label:lab.rate', dataset: { focus: 'keep' },
    attrs: { type: 'range', id: 'lab-rate', min: 0, max: 1000, step: 1 },
    on: { input: (e) => { if (session.setRate(sliderToRate(Number(e.target.value) / 1000))) sync(); } },
  });
  const holdoutValue = el('output', { class: 'lab-value', attrs: { for: 'lab-holdout', 'aria-hidden': 'true' } });
  const holdoutGesture = createSliderGesture((v, { final }) => { holdoutValue.textContent = t('drive.value.percent', { value: v }); if (final && session.setHoldout(v)) restarted(); });
  const holdoutInput = el('input', {
    help: 'lab.holdout', i18nAttr: 'aria-label:lab.holdout',
    attrs: { type: 'range', id: 'lab-holdout', min: HOLDOUT_LIMITS.min, max: HOLDOUT_LIMITS.max, step: HOLDOUT_LIMITS.step },
    on: { input: (e) => holdoutGesture.input(Number(e.target.value)), change: (e) => holdoutGesture.change(Number(e.target.value)) },
  });
  const learnSection = el('section', { class: 'lab-section', attrs: { 'aria-labelledby': 'lab-learn-heading' } },
    el('h2', { class: 'panel-heading', i18n: 'lab.panel.learning', attrs: { id: 'lab-learn-heading' } }),
    el('div', { class: 'lab-slider' }, el('label', { class: 'lab-slider-label', attrs: { for: 'lab-rate' } }, el('span', { i18n: 'lab.rate', help: 'lab.term.rate' }), rateValue), rateInput),
    el('div', { class: 'lab-slider' }, el('label', { class: 'lab-slider-label', attrs: { for: 'lab-holdout' } }, el('span', { i18n: 'lab.holdout' }), holdoutValue), holdoutInput));
  // Acciones
  const resetWeightsButton = el('button', { class: 'tool small', i18n: 'lab.resetWeights', help: 'lab.resetWeights', attrs: { type: 'button' }, on: { click: () => resetWeights() } });
  const resetNetworkButton = el('button', { class: 'tool small', i18n: 'lab.resetNetwork', help: 'lab.resetNetwork', attrs: { type: 'button' }, on: { click: () => { session.resetNetwork(); restarted(); } } });
  const saveButton = el('button', { class: 'tool small primary lab-save', i18n: 'lab.save', attrs: { type: 'button' }, on: { click: () => saveBrain() } });
  const saveMessage = el('p', { class: 'caption lab-save-message', attrs: { role: 'status' } });
  const actions = el('div', { class: 'lab-actions-panel' }, resetWeightsButton, resetNetworkButton, saveButton);
  // Tu manejo: de quién son los ejemplos
  const teacherName = el('span', { class: 'lab-teacher-name' });
  const changeTeacher = el('button', {
    class: 'tool small', i18n: 'inspect.brain.change', help: 'lab.teacher.change',
    attrs: { type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'lab-picker' },
    on: { click: () => picker.toggle({ focus: 'current' }) },
  });
  const recordButton = el('button', { class: 'tool small lab-record', i18n: 'lab.record', help: 'lab.record', attrs: { type: 'button' }, on: { click: () => (recording ? stopRecording() : startRecording()) } });
  const useRecordedButton = el('button', { class: 'tool small', i18n: 'lab.record.use', help: 'lab.record.use', attrs: { type: 'button' }, on: { click: () => { if (session.chooseRecorded()) restarted(); } } });
  const clearButton = el('button', { class: 'tool small', i18n: 'lab.record.clear', help: 'lab.record.clear', attrs: { type: 'button' }, on: { click: () => { const had = session.source === 'recorded'; state.recorder.clear(); session.clearRecorded(); if (had) restarted(); else sync(); } } });
  const recordNotice = el('p', { class: 'caption lab-record-notice', attrs: { role: 'status' } });
  const teacherSection = el('section', { class: 'lab-section lab-teacher', attrs: { 'aria-labelledby': 'lab-teacher-heading' } },
    el('h2', { class: 'panel-heading', i18n: 'lab.panel.examples', attrs: { id: 'lab-teacher-heading' } }),
    el('div', { class: 'lab-teacher-row' }, teacherName, changeTeacher),
    el('div', { class: 'lab-actions-panel' }, recordButton, useRecordedButton, clearButton), recordNotice);
  // Misiones
  const missionRows = state.missions.missions.map((m) => {
    const status = el('span', { class: 'mission-status' });
    const row = el('li', { class: 'mission inspect-mission' }, el('span', { class: 'mission-name', i18n: `lab.mission.${m.id}` }), status);
    return { id: m.id, row, status };
  });
  const missions = el('section', { class: 'guide inspect-missions' },
    el('h2', { class: 'sr-only', i18n: 'lab.missions.title' }),
    el('ol', { class: 'mission-list inspect-mission-list' }, missionRows.map((r) => r.row)));
  panel.append(el('h1', { class: 'sr-only', i18n: 'lab.title' }),
    el('div', { class: 'inspect-panel lab-panel' }, intro, netSection, learnSection, actions, saveMessage, teacherSection, missions));

  const picker = createPicker({
    id: 'lab-picker', anchor: changeTeacher, t,
    titleKey: 'lab.picker.title', doneKey: 'compete.picker.done', doneHelp: 'inspect.picker.done', emptyKey: 'compete.picker.empty',
    groups: () => PICKER_GROUPS.map((g) => ({
      id: g,
      title: t(`compete.picker.group.${g}`),
      items: candidates.filter((c) => (g === 'brains' ? c.kind === 'brain' : c.kind === 'example')).map((c) => ({
        key: c.key, name: candidateName(c), meta: c.available ? whereOf(c.brain) : t('inspect.picker.invalid'),
        help: c.available ? 'lab.pick.teacher' : 'compete.check.invalidBrain',
        disabled: !c.available, current: session.source === 'teacher' && c.key === session.teacherKey,
      })),
    })).filter((g) => g.items.length > 0),
    onPick: (key) => { if (session.setTeacher(key)) restarted(); picker.close(); },
  });
  function whereOf(b) {
    if (b?.imitation?.track) return t('lab.where.imitated', { track: t(`track.short.${b.imitation.track}`) });
    const ids = trainedTracks(b);
    if (ids.length === 0) return t('compete.where.none');
    if (ids.length === TRACK_IDS.length) return t('compete.where.all');
    return ids.map((id) => t(`track.short.${id}`)).join(' + ');
  }

  // ==================================================================================================
  // Barra: los datos (D5)
  // ==================================================================================================
  let scenario = null;
  const kindButtons = ['points', 'driving'].map((k) => el('button', {
    class: 'segment', i18n: `lab.kind.${k}`, help: `lab.kind.${k}`,
    attrs: { type: 'button', role: 'radio', 'aria-checked': 'false' }, dataset: { kind: k },
    on: { click: () => setKind(k) },
  }));
  const kindGroup = barGroupNode({ id: 'lab-kind', labelKey: 'lab.bar.data', labelId: 'lab-kind-label', help: 'lab.bar.data' },
    el('div', { class: 'segments', attrs: { role: 'radiogroup', 'aria-labelledby': 'lab-kind-label' } }, kindButtons));
  const shapeOptions = POINT_SHAPES.map((shape) => el('button', {
    class: 'bar-track lab-shape', help: `lab.shape.${shape}`, i18nAttr: `aria-label:lab.shape.${shape}`,
    attrs: { type: 'button', role: 'radio', 'aria-checked': 'false', tabindex: '-1' }, dataset: { shape },
    on: { click: () => setPoints({ shape }) },
  }, shapeThumbnail(shape), el('span', { class: 'bar-track-name', i18n: `lab.shape.${shape}`, attrs: { 'aria-hidden': 'true' } })));
  const shapeGroup = barGroupNode({ id: 'lab-shape', labelKey: 'lab.bar.shape', labelId: 'lab-shape-label', help: 'lab.bar.shape' },
    el('div', { class: 'bar-tracks', attrs: { role: 'radiogroup', 'aria-labelledby': 'lab-shape-label' }, on: { keydown: onShapeKey } }, shapeOptions));
  const pointSlider = (key, limits, format) => {
    const id = `lab-${key}`;
    const value = el('output', { class: 'bar-value', attrs: { for: id, 'aria-hidden': 'true' } });
    const gesture = createSliderGesture((v, { final }) => { setText(value, format, { value: v }); if (final) setPoints({ [key]: v }); });
    const input = el('input', {
      help: `lab.bar.${key}`, i18nAttr: `aria-label:lab.bar.${key}`,
      attrs: { type: 'range', id, min: limits.min, max: limits.max, step: limits.step },
      on: { input: (e) => gesture.input(Number(e.target.value)), change: (e) => gesture.change(Number(e.target.value)) },
    });
    const node = el('div', { class: 'bar-control' }, el('label', { class: 'bar-label', attrs: { for: id } }, el('span', { class: 'bar-name', i18n: `lab.bar.${key}` }), value), input);
    return { node, input, value, gesture, format };
  };
  const noiseSlider = pointSlider('noise', POINT_LIMITS.noise, 'drive.value.percent');
  const countSlider = pointSlider('count', POINT_LIMITS.count, 'drive.value.count');
  const pointsGroup = barGroupNode({ id: 'lab-points', labelKey: 'lab.bar.points', labelId: 'lab-points-label' }, noiseSlider.node, countSlider.node);
  const pointsReset = el('button', { class: 'tool bar-reset', i18n: 'bar.reset', help: 'lab.bar.reset', attrs: { type: 'button' }, on: { click: () => { session.resetPoints(); restarted(); } } });
  const pointsBar = el('div', { class: 'scenario-bar lab-bar', i18nAttr: 'aria-label:bar.title', attrs: { role: 'group' } },
    kindGroup, shapeGroup, pointsGroup, el('div', { class: 'bar-group bar-group-reset' }, pointsReset));

  function buildBar() {
    scenario?.dispose();
    scenario = null;
    bar?.replaceChildren();
    if (isPoints()) {
      pointsBar.prepend(kindGroup); // el grupo de los datos va primero en las dos barras
      bar?.append(pointsBar);
    } else {
      // Con tu manejo: los datos, y la pista, el tráfico y la velocidad de siempre (sin sensores).
      scenario = scenarioBar({
        i18n, settings: { ...session.settings.driving }, idPrefix: 'lab', omit: ['sensors'],
        help: (key) => `inspect.bar.${key}`, trackHelp: 'lab.bar.track', noTrafficHelp: 'drive.noTraffic', resetHelp: 'lab.bar.resetDriving',
        onChange: (key, value, { final }) => { if (final && session.setDriving({ [key]: value })) { if (key === 'maxSpeed') store?.set({ carSpeed: value }); restarted(); } },
        onReset: () => { session.resetDriving(store?.get().carSpeed ?? DRIVING_DEFAULTS.maxSpeed); restarted(); },
      });
      scenario.node.prepend(kindGroup);
      bar?.append(scenario.node);
    }
    i18n.translateTree(bar ?? el('div'));
  }
  function setKind(k) {
    const focused = document.activeElement && kindButtons.includes(document.activeElement);
    if (recording) stopRecording({ use: false });
    if (!session.setKind(k)) return;
    buildBar();
    restarted();
    if (focused) kindButtons.find((b) => b.dataset.kind === k)?.focus();
  }
  function setPoints(partial) { if (session.setPoints(partial)) restarted(); else sync(); }
  function onShapeKey(e) {
    const i = POINT_SHAPES.indexOf(session.settings.points.shape);
    const n = POINT_SHAPES.length;
    const to = { ArrowRight: (i + 1) % n, ArrowDown: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, ArrowUp: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    setPoints({ shape: POINT_SHAPES[to] });
    shapeOptions[to].focus();
  }

  // ==================================================================================================
  // Aprendizaje: pasos, reproducción y lo que empieza de nuevo
  // ==================================================================================================
  /** El aprendizaje empezó de nuevo (datos, red o pesos nuevos): todo lo mostrado se vacía. */
  function restarted() {
    animation = null;
    lastStep = null;
    announcedAppearances = 0;
    state.saveNotice = null;
    checkVersion();
    sync();
  }
  function checkVersion() {
    if (version === session.version) return;
    version = session.version;
    changesVersion += 1;
    const shapeKey = run().network.sizes.join('-');
    if (shapeKey !== state.shapeKey) {
      state.shapeKey = shapeKey;
      state.collapsed = run().network.sizes.map(() => false);
      if (state.selected.layer >= run().network.sizes.length || state.selected.neuron >= run().network.sizes[state.selected.layer]) state.selected = { layer: 1, neuron: 0 };
      buildOverlay();
    }
    buildNeuronSliders();
    if (!isPoints()) ensureWorld(true);
    planeForce = true;
    chartKey = '';
  }
  function resetWeights() { session.resetWeights(); restarted(); announce(t('lab.announce.reset')); }

  /** Un paso del tamaño `size`. */
  function advance(size, { auto }) {
    if (animation) { animation.finish(); animation = null; }
    const r = run().advance(size);
    const a = run().active;
    changesVersion += 1;
    if (a && r.units.length > 0) {
      lastStep = { units: r.units, detail: a.detail, size };
      state.missions.stepped(size, `${a.epoch}:${a.order}`, r.units);
      if (!isRunning(size) && !reducedMotion()) {
        const duration = stepDuration(size, auto ? { intervalMs: playback.intervalMs } : {});
        animation = createLearningAnimation(r.units, { start: performance.now(), duration });
      }
      if (!auto) announce(describeLearningStep({ t, fmt, last: r.units[r.units.length - 1], detail: a.detail, ctx: ctx() }));
    } else {
      lastStep = null;
      state.missions.stepped(size, null, []);
      if (!auto) announce(t('lab.where.epoch', { epoch: run().epoch }));
    }
    afterLearning();
  }
  function afterLearning() {
    const n = run().warningAppearances;
    if (n > announcedAppearances) {
      announcedAppearances = n;
      state.missions.warned();
      announce(t('lab.warning'));
      sync();
    }
  }
  function play() { if (recording) return; playback.play(); if (isRunning(playback.size)) run().clearActive(); sync(); }
  function pause() { playback.pause(); sync(); }
  const togglePlay = () => (playback.playing ? pause() : play());
  function stepOnce() {
    if (recording) return;
    if (playback.playing) pause();
    advance(playback.size, { auto: false });
    sync();
  }
  function setSize(size) {
    if (!playback.setSize(size)) return;
    if (isRunning(size) && playback.playing) run().clearActive();
    sync();
  }

  // ==================================================================================================
  // Tu manejo: la escena con la red manejando, grabar y guardar (D8)
  // ==================================================================================================
  const input = [];
  const liveController = {
    control(perception) {
      const net = run().network;
      const count = perception.sensors.length;
      if (net.sizes[0] !== count + 1) return { forward: false, left: false, right: false, reverse: false };
      for (let i = 0; i < count; i++) input[i] = perception.sensors[i];
      input[count] = perception.speed;
      input.length = count + 1;
      const out = computeNetwork(net, input);
      return { forward: out[0] === 1, left: out[1] === 1, right: out[2] === 1, reverse: out[3] === 1 };
    },
  };
  const recordingController = {
    control(perception) {
      const c = keyboard.control();
      if (!recordStarted && (c.forward || c.left || c.right || c.reverse)) recordStarted = true;
      if (recordStarted) state.recorder.add(perception, c);
      return c;
    },
  };
  function ensureWorld(force = false) {
    const d = session.settings.driving;
    const sensors = recording ? { ...DEFAULT_SENSORS } : session.sensors;
    const key = JSON.stringify({ d, sensors, recording });
    if (!force && key === worldKey && world) return;
    worldKey = key;
    world = createWorld({
      seed: SEED, track: d.track, lanes: d.lanes, density: d.density, irregularity: d.irregularity,
      cars: [{ controller: recording ? recordingController : liveController, sensors, maxSpeed: d.maxSpeed }],
    });
    crashTicks = 0;
  }
  function stepScene() {
    if (isPoints()) return;
    ensureWorld();
    if (world.crashed) {
      crashTicks += 1;
      if (crashTicks >= RETRY_TICKS) {
        if (recording) state.recorder.newAttempt();
        world.reset();
        crashTicks = 0;
        recordStarted = recording ? false : recordStarted;
      }
      return;
    }
    if (recording && !recordStarted) {
      // El auto espera la primera tecla: el mundo no avanza, así no se graba una espera.
      const c = keyboard.control();
      if (!(c.forward || c.left || c.right || c.reverse)) return;
    }
    world.step();
    if (recording && world.crashed) state.recorder.newAttempt();
  }
  function startRecording() {
    if (isPoints() || recording) return;
    state.wasPlayingBeforeRecord = playback.playing;
    playback.pause();
    recording = true;
    recordStarted = false;
    ensureWorld(true);
    announce(t('lab.record.badge'));
    sync();
  }
  function stopRecording({ use = true } = {}) {
    if (!recording) return;
    recording = false;
    keyboard.releaseAll();
    if (use && state.recorder.count > 0) {
      const d = session.settings.driving;
      session.useRecorded(state.recorder.dataset({ track: d.track, lanes: d.lanes, density: d.density, irregularity: d.irregularity, maxSpeed: d.maxSpeed }));
      restarted();
      playback.play();
    } else {
      ensureWorld(true);
      if (state.wasPlayingBeforeRecord) playback.play();
    }
    announce(t('lab.record.done', { value: state.recorder.count }));
    sync();
  }

  function teacherLabel() {
    if (session.source === 'recorded') return t('lab.teacher.you');
    const c = candidates.find((x) => x.key === session.teacherKey);
    return t('lab.teacher.name', { name: candidateName(c) });
  }
  function teacherId() {
    if (session.source === 'recorded') return 'person';
    const c = candidates.find((x) => x.key === session.teacherKey);
    return c?.kind === 'example' ? c.brain.id : (c?.brain.name ?? 'teacher');
  }

  function saveBrain() {
    if (!library || isPoints() || run().epoch === 0) return;
    const d = session.settings.driving;
    let brain;
    try {
      brain = createBrain({
        id: 'lab', name: 'lab', now: new Date().toISOString(),
        network: copyNetwork(run().network), sensors: session.sensors,
        training: { generations: 0, seed: session.settings.weightSeed, maxSpeed: d.maxSpeed, fitness: { kind: 'imitation', best: null }, evolution: {}, scenarios: [] },
        imitation: { examples: session.data.examples.length, epochs: run().epoch, teacher: teacherId(), track: d.track, lanes: d.lanes, density: d.density, irregularity: d.irregularity },
      });
    } catch (err) { reportError(err); return; }
    const r = library.save(brain, { name: '', baseName: t('lab.save.baseName') });
    if (!r.ok) state.saveNotice = { key: 'lab.save.failed' };
    else if (r.warning) state.saveNotice = { key: 'lab.save.unsaved', params: { name: r.brain.name } };
    else state.saveNotice = { key: 'lab.save.done', params: { name: r.brain.name } };
    if (r.ok) state.missions.saved();
    announce(t(state.saveNotice.key, state.saveNotice.params));
    sync();
  }

  // ==================================================================================================
  // Sincronizar y dibujar
  // ==================================================================================================
  const displayed = { cursor: null, trace: null, learning: null };
  let layoutKey = '';
  let headerRows = 1;
  let chartKey = '';
  let planeForce = true;
  let labelTick = 0;
  const write = (n, text) => { if (n.textContent !== text) n.textContent = text; };
  const show = (n, visible) => { if (n.hidden === Boolean(visible)) n.hidden = !visible; };
  const setAttr = (n, k, v) => { if (n.getAttribute(k) !== v) n.setAttribute(k, v); };

  function sync() {
    checkVersion();
    const s = session.settings;
    const sizes = run().network.sizes;
    setText(netTitle, 'lab.net.title', { shape: sizes.join(' → ') });
    for (const b of viewButtons) setAttr(b, 'aria-pressed', String(b.dataset.view === state.view));
    for (const b of filterButtons) setAttr(b, 'aria-pressed', String(b.dataset.filter === String(state.filter)));
    const all = state.collapsed.every(Boolean);
    setText(collapseAll, all ? 'inspect.openAll' : 'inspect.collapseAll');
    setData(collapseAll, 'help', all ? 'inspect.openAll' : 'inspect.collapseAll');
    zoomGroup.hidden = state.view !== 'diagram';
    diagram.hidden = state.view !== 'diagram';
    tableZone.hidden = state.view !== 'table';
    // Reproducción
    setText(playButton, playback.playing ? 'inspect.pause' : 'inspect.play');
    setData(playButton, 'help', playback.playing ? 'lab.pause' : 'lab.play');
    setAttr(playButton, 'aria-pressed', String(!playback.playing));
    for (const b of sizeButtons) setAttr(b, 'aria-pressed', String(b.dataset.size === playback.size));
    setAttr(paceInput, 'max', String(playback.paceCount - 1));
    if (Number(paceInput.value) !== playback.paceIndex) paceInput.value = String(playback.paceIndex);
    const paceText = t(`lab.pace.${playback.kind}`, { value: playback.rate });
    write(paceValue, paceText);
    setAttr(paceInput, 'aria-valuetext', paceText);
    setData(paceInput, 'help', `lab.pace.${playback.kind}`);
    // Barra
    for (const b of kindButtons) { const on = b.dataset.kind === s.kind; setAttr(b, 'aria-checked', String(on)); setAttr(b, 'tabindex', on ? '0' : '-1'); }
    for (const o of shapeOptions) { const on = o.dataset.shape === s.points.shape; setAttr(o, 'aria-checked', String(on)); setAttr(o, 'tabindex', on ? '0' : '-1'); }
    for (const sl of [[noiseSlider, s.points.noise], [countSlider, s.points.count]]) {
      const [x, v] = sl;
      if (x.gesture.active) continue;
      if (Number(x.input.value) !== v) x.input.value = String(v);
      setText(x.value, x.format, { value: v });
      setAttr(x.input, 'aria-valuetext', t(x.format, { value: v }));
    }
    scenario?.sync({ ...s.driving });
    // Panel: guía, red y aprendizaje
    setText(intro, isPoints() ? 'lab.guide' : 'lab.guide.driving');
    for (const b of layerButtons) setAttr(b, 'aria-pressed', String(Number(b.dataset.layers) === s.hidden.length));
    neuronSliders.forEach((x, k) => {
      if (x.gesture.active) return;
      if (Number(x.input.value) !== s.hidden[k]) x.input.value = String(s.hidden[k]);
      write(x.value, String(s.hidden[k]));
      setAttr(x.input, 'aria-valuetext', t('lab.neurons.value', { value: s.hidden[k] }));
    });
    for (const b of activationButtons) setAttr(b, 'aria-pressed', String(b.dataset.activation === s.activation));
    const rp = Math.round(rateToSlider(s.rate) * 1000);
    if (Number(rateInput.value) !== rp && document.activeElement !== rateInput) rateInput.value = String(rp);
    write(rateValue, fmtRate(s.rate));
    setAttr(rateInput, 'aria-valuetext', fmtRate(s.rate));
    if (!holdoutGesture.active) {
      if (Number(holdoutInput.value) !== s.holdout) holdoutInput.value = String(s.holdout);
      setText(holdoutValue, 'drive.value.percent', { value: s.holdout });
      setAttr(holdoutInput, 'aria-valuetext', t('drive.value.percent', { value: s.holdout }));
    }
    // Guardar: solo con tu manejo; sin épocas, sin acción y con su explicación.
    show(saveButton, !isPoints());
    const untrained = run().epoch === 0;
    setAttr(saveButton, 'aria-disabled', String(untrained));
    setData(saveButton, 'help', untrained ? 'lab.save.none' : 'lab.save');
    show(saveMessage, !isPoints() && Boolean(state.saveNotice));
    if (state.saveNotice) setText(saveMessage, state.saveNotice.key, state.saveNotice.params);
    // Tu manejo
    show(teacherSection, !isPoints());
    write(teacherName, teacherLabel());
    setText(recordButton, recording ? 'lab.record.finish' : 'lab.record');
    setData(recordButton, 'help', recording ? 'lab.record.finish' : 'lab.record');
    setAttr(recordButton, 'aria-pressed', String(recording));
    const hasRecorded = Boolean(session.recorded) && session.recorded.examples.length > 0;
    show(useRecordedButton, hasRecorded && session.source !== 'recorded' && !recording);
    show(clearButton, (hasRecorded || state.recorder.count > 0) && !recording);
    show(changeTeacher, !recording);
    const notice = session.source === 'recorded' && session.fewRecorded ? t('lab.record.few') : '';
    show(recordNotice, notice !== '');
    write(recordNotice, notice);
    // Tablero
    show(planeBox, isPoints());
    show(scene, !isPoints());
    // Misiones
    for (const m of state.missions.missions) {
      const r = missionRows.find((x) => x.id === m.id);
      setData(r.row, 'done', String(m.done));
      setText(r.status, m.done ? 'train.mission.done' : 'train.mission.pending');
    }
    // Los controles que no sirven mientras se graba no se muestran.
    for (const n of [stepButton, sizeGroup]) show(n, !recording);
    playButton.hidden = recording;
  }
  const fmtRate = (r) => (r >= 0.1 ? fmt(r) : r.toLocaleString(i18n.language === 'es' ? 'es-AR' : 'en-US', { maximumSignificantDigits: 2 }));

  /** El cursor que ve el inspector durante la ida (opsDone de 0 a 4). */
  function learningCursor(a, anim) {
    const c = a.cursor;
    if (c.phase !== 'forward' && !anim) return null;
    const hidden = anim?.hidden ?? new Set();
    const items = new Map((anim?.items ?? []).filter((x) => x.phase === 'forward').map((x) => [`${x.layer}:${x.neuron}`, x]));
    const ops = ['products', 'sum', 'bias', 'activation'];
    const opsDone = (l, j) => {
      if (l === 0) return 4;
      if (!c.isDone('forward', l, j)) return 0;
      if (!hidden.has(`forward:${l}:${j}`)) return 4;
      const it = items.get(`${l}:${j}`);
      return it ? ops.indexOf(it.op) : 0;
    };
    const next = c.phase === 'forward' ? c.next : null;
    return {
      opsDone,
      stateOf: (l, j) => (opsDone(l, j) === 4 ? 'done' : next && next.layer === l && next.neuron === j ? 'current' : 'pending'),
      isDone: (l, j, op) => opsDone(l, j) > ops.indexOf(op),
      get done() { return !next; },
      get next() { return next ? { layer: next.layer, neuron: next.neuron, op: 'products' } : null; },
      get position() { return null; },
    };
  }

  function draw() {
    checkVersion();
    const now = performance.now();
    const r = run();
    const running = playback.playing && isRunning(playback.size);
    let anim = null;
    if (animation) { const s = animation.state(now); if (s.done) animation = null; else anim = s; }
    const a = !running ? r.active : null;
    const sizes = r.network.sizes;
    const L = sizes.length - 1;
    // La cuenta que se ve: la del ejemplo en curso (con los pesos que ya cambiaron), o la de un
    // ejemplo de referencia con la red de ahora.
    let trace;
    let learning = null;
    let cursor = null;
    if (a) {
      const shownNet = r.shownNetwork();
      const fwd = a.detail.forward.trace;
      const upd = new Map((anim?.items ?? []).filter((x) => x.phase === 'update').map((x) => [`${x.layer}:${x.neuron}`, x.p]));
      trace = {
        ...fwd,
        layers: fwd.layers.map((layer, l) => (l === 0 ? layer : {
          neurons: layer.neurons.map((n, j) => {
            const p = upd.get(`${l}:${j}`);
            const corr = a.detail.corrections;
            if (p !== undefined) {
              return { ...n, weights: corr.weights[l][j].map((w) => w.before + (w.after - w.before) * p), bias: corr.biases[l][j].before + corr.biases[l][j].change * p };
            }
            return { ...n, weights: shownNet.layers[l - 1].weights[j], bias: shownNet.layers[l - 1].biases[j] };
          }),
        })),
      };
      const c = a.cursor;
      const hiddenUnit = (ph, l, j) => anim?.hidden.has(`${ph}:${l}:${j}`) ?? false;
      const doneUnit = (ph, l, j) => c.isDone(ph, l, j) && !hiddenUnit(ph, l, j);
      const animP = (ph, l, j) => anim?.items.find((x) => x.phase === ph && x.layer === l && x.neuron === j)?.p;
      learning = {
        blame: (l, j) => {
          if (l === 0) return null;
          if (doneUnit('backward', l, j)) return a.detail.backward.deltas[l][j];
          const p = animP('backward', l, j);
          return p === undefined ? null : a.detail.backward.deltas[l][j] * p;
        },
        change: (l, j, i) => {
          if (!doneUnit('update', l, j) && animP('update', l, j) === undefined) return null;
          return i === 'bias' ? a.detail.corrections.biases[l][j].change : a.detail.corrections.weights[l][j][i].change;
        },
        errors: c.phase === 'update' || a.done ? [] : Array.from({ length: sizes[L] }, (_, j) => j)
          .filter((j) => doneUnit('error', L, j) || animP('error', L, j) !== undefined)
          .map((j) => ({ neuron: j, output: a.detail.forward.outputs[j], target: a.example.targets[j] })),
        flows: (anim?.items ?? []).filter((x) => x.phase === 'backward' && x.layer < L).flatMap((x) => a.detail.backward.terms[x.layer][x.neuron].parts
          .map((part) => ({ from: { layer: x.layer + 1, neuron: part.to }, to: { layer: x.layer, neuron: x.neuron }, value: part.product, p: x.p }))),
      };
      cursor = learningCursor(a, anim);
    } else {
      const ref = isPoints() ? session.data.examples[0].inputs : (world?.perception ? [...world.perception.sensors, world.perception.speed] : session.data.examples[0].inputs);
      trace = forwardSoft(r.network, ref.length === sizes[0] ? ref : session.data.examples[0].inputs).trace;
    }
    displayed.cursor = cursor;
    displayed.trace = trace;
    displayed.learning = learning;
    const forwardAnim = anim ? { items: anim.items.filter((x) => x.phase === 'forward') } : null;
    const common = { sizes, trace, cursor, selected: state.selected, collapsed: state.collapsed, top: null, labels, learning };
    inspector.render({ ...common, animation: forwardAnim, visible: state.view === 'diagram', headerRows });
    table.render({ ...common, visible: state.view === 'table', changesVersion: `${changesVersion}|${anim ? now : ''}`, filter: state.filter });
    placeOverlay();
    if (++labelTick % 30 === 0 || labelTick === 1) neuronButtons.forEach((row, l) => row.forEach((b, j) => labelNeuron(b, l, j)));

    // Operación en curso: en pausa y de a fases, capas o neuronas (D11).
    const showOp = !(playback.playing && isRunning(playback.size));
    show(opStrip, showOp);
    if (showOp) {
      const text = lastStep && r.active ? describeLearningStep({ t, fmt, last: lastStep.units[lastStep.units.length - 1], detail: lastStep.detail, ctx: ctx() }) : t('lab.op.idle');
      write(opText, text);
    }
    write(where, whereText({ t, run: r, ctx: ctx(), running }));

    // Tablero
    const highlight = a ? a.index : null;
    if (isPoints()) {
      const indexInData = highlight === null ? null : session.data.examples.indexOf(session.split.practice[highlight]);
      plane.render({ network: r.network, version: `${session.version}:${r.epoch}:${r.exampleInEpoch}:${a?.done ?? ''}`, examples: session.data.examples, held: session.split.held, highlight: indexInData, force: planeForce });
      planeForce = false;
    } else {
      const sensorsCount = (recording ? DEFAULT_SENSORS : session.sensors).count;
      if (world) {
        sceneView.render(world, { showSensors: true, rays: { looks: null, off: Array.from({ length: sensorsCount }, () => false), highlight: null, handles: null } });
      }
      show(recordBadge, recording);
      if (recording) write(recordText, t(recordStarted ? 'lab.record.count' : 'lab.record.badge', { value: state.recorder.count }));
      show(crashBadge, Boolean(world?.crashed));
    }
    drawExample(a);
    drawCurves();
    if (++descTick % 30 === 1) describeBoard();
  }
  let descTick = 0;

  function drawExample(a) {
    const visible = playback.size !== 'epoch' && Boolean(a);
    show(exampleBlock, visible);
    if (!visible) return;
    const ex = a.example;
    const fwdDone = a.cursor.phaseDone('forward');
    const out = a.detail.forward.outputs;
    if (isPoints()) {
      show(fan, false);
      show(actionsRows, false);
      const cls = ex.targets[0] >= 0.5 ? 'a' : 'b';
      const answer = fwdDone ? t('lab.example.answer', { color: t(`lab.class.${out[0] > 0.5 ? 'a' : 'b'}`), sure: pct(Math.max(out[0], 1 - out[0])) }) : t('lab.example.pending');
      write(exampleText, t('lab.example.point', { x: fmt(ex.inputs[0]), y: fmt(ex.inputs[1]), color: t(`lab.class.${cls}`), answer }));
    } else {
      show(fan, true);
      show(actionsRows, true);
      drawFan(ex.inputs.slice(0, -1));
      write(exampleText, t('lab.example.driving', { speed: fmt(ex.inputs[ex.inputs.length - 1]) }));
      const target = Object.fromEntries(ACTIONS.map((k) => [k, ex.targets[DRIVING_OUTPUTS.indexOf(k)] === 1]));
      const netOn = Object.fromEntries(ACTIONS.map((k) => [k, fwdDone && out[DRIVING_OUTPUTS.indexOf(k)] > 0.5]));
      actionsExample.update(target);
      actionsNet.update(netOn);
      for (const k of ACTIONS) {
        const node = actionsNet.node.querySelector(`.action-${k}`);
        setData(node, 'mismatch', String(fwdDone && target[k] !== netOn[k]));
      }
      setData(actionsNet.node, 'undecided', String(!fwdDone));
    }
  }
  function drawFan(readings) {
    const key = readings.map((v) => v.toFixed(2)).join();
    if (fan.dataset.key === key) return;
    fan.dataset.key = key;
    const n = readings.length;
    const spread = (session.sensors.spread * Math.PI) / 180;
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 100 60');
    const cx = 50; const cy = 56; const R = 50;
    for (let i = 0; i < n; i++) {
      const ang = n === 1 ? 0 : -spread / 2 + (spread * i) / (n - 1);
      const full = { x: cx + R * Math.sin(ang), y: cy - R * Math.cos(ang) };
      // La lectura es 1 si no ve nada y menos cuanto más cerca está lo que ve.
      const hit = { x: cx + R * readings[i] * Math.sin(ang), y: cy - R * readings[i] * Math.cos(ang) };
      const line = (p, cls) => { const l = document.createElementNS(ns, 'line'); l.setAttribute('x1', cx); l.setAttribute('y1', cy); l.setAttribute('x2', p.x); l.setAttribute('y2', p.y); l.setAttribute('class', cls); svg.append(l); };
      line(full, 'lab-ray-free');
      line(hit, 'lab-ray');
      if (readings[i] < 0.999) { const c = document.createElementNS(ns, 'circle'); c.setAttribute('cx', hit.x); c.setAttribute('cy', hit.y); c.setAttribute('r', 2.5); c.setAttribute('class', 'lab-ray-hit'); svg.append(c); }
    }
    const car = document.createElementNS(ns, 'rect');
    car.setAttribute('x', cx - 3); car.setAttribute('y', cy - 4); car.setAttribute('width', 6); car.setAttribute('height', 8); car.setAttribute('class', 'lab-fan-car');
    svg.append(car);
    fan.replaceChildren(svg);
  }

  function drawCurves() {
    const r = run();
    const h = r.history;
    const warn = r.warning;
    const o = overfitting(h);
    const key = `${session.version}:${h.length}:${Boolean(warn)}:${i18n.language}`;
    if (key !== chartKey) {
      chartKey = key;
      chart.update(h.map((e) => ({ generation: e.epoch, best: e.practice.loss, average: e.heldOut.loss ?? 0, fitness: 'loss' })), { marker: warn ? o.bestEpoch : null });
      const last = h[h.length - 1];
      write(stats, last ? t('lab.stats', { epoch: last.epoch, practice: pct(last.practice.accuracy), heldOut: pct(last.heldOut.accuracy) }) : t('lab.stats.none'));
      show(warning, Boolean(warn));
      if (warn) write(warning, t('lab.warning.best', { text: t('lab.warning'), epoch: o.bestEpoch }));
      const rising = h.length >= 2 && h[h.length - 1].heldOut.loss > h[h.length - 2].heldOut.loss;
      write(chartText, last ? t('lab.chart.description', { epoch: last.epoch, practice: fmt(last.practice.loss), heldOut: fmt(last.heldOut.loss), trend: t(rising ? 'lab.chart.rising' : 'lab.chart.notRising') }) : t('lab.chart.empty'));
    }
  }

  /** Descripciones en texto del plano y de la escena (D9). */
  function describeBoard() {
    const h = run().history;
    const last = h[h.length - 1];
    if (isPoints()) {
      const p = session.settings.points;
      setAttr(planeBox, 'aria-label', t('lab.plane.description', { shape: t(`lab.shape.${p.shape}`), count: session.data.examples.length, heldOut: last ? pct(last.heldOut.accuracy) : '–' }));
    } else {
      sceneDescription.set(t(recording ? 'lab.scene.recording' : 'lab.scene.description', { track: t(`track.${session.settings.driving.track}`) }));
    }
    const sm = summary(session.data, session.split);
    if (isPoints()) write(dataSummary, '');
    else {
      write(dataSummary, t('lab.summary', {
        count: sm.count, who: session.source === 'recorded' ? t('lab.who.you') : candidateName(candidates.find((x) => x.key === session.teacherKey)), practice: sm.practice, heldOut: sm.heldOut,
        forward: pct(sm.controls.forward), left: pct(sm.controls.left), right: pct(sm.controls.right), reverse: pct(sm.controls.reverse),
      }));
    }
    show(dataSummary, !isPoints());
  }

  function placeOverlay() {
    const sizes = run().network.sizes;
    sizes.forEach((count, l) => {
      const collapsed = Boolean(state.collapsed[l]);
      for (const h of [headerButtons[l], tableHeaders[l]]) {
        if (!h) continue;
        write(h.querySelector('.inspect-layer-name'), t('inspect.layer.head', { name: layerName(t, l, sizes.length), value: count }));
        write(h.querySelector('.inspect-layer-mark'), collapsed ? '▸' : '▾');
        setAttr(h, 'aria-expanded', String(!collapsed));
        setAttr(h, 'aria-label', t(collapsed ? 'inspect.layer.head.collapsed' : 'inspect.layer.head.open', { name: layerName(t, l, sizes.length), value: count }));
        setData(h, 'collapsed', collapsed);
      }
    });
    const layout = inspector.layout;
    if (!layout || layout.columns.length !== sizes.length) return;
    const vp = inspector.viewport;
    const cam = inspector.camera;
    const key = `${vp.width}x${vp.height}|${cam.zoom}|${cam.center.x},${cam.center.y}|${state.collapsed.join()}|${state.view}|${i18n.language}|${sizes.join()}`;
    if (key === layoutKey || state.view !== 'diagram') return;
    layoutKey = key;
    const xs = sizes.map((_, l) => inspector.columnScreenX(l));
    const ws = headerButtons.map((h) => h.offsetWidth || 80);
    const lefts = xs.map((x, l) => Math.max(2, Math.min(vp.width - ws[l] - 2, x - ws[l] / 2)));
    const crowded = lefts.some((x, l) => l > 0 && x < lefts[l - 1] + ws[l - 1] + 4);
    const rows = crowded ? 2 : 1;
    if (rows !== headerRows) { headerRows = rows; layoutKey = ''; }
    sizes.forEach((_, l) => { headerButtons[l].style.transform = `translate(${Math.round(lefts[l])}px, ${rows === 2 && l % 2 === 1 ? 32 : 4}px)`; });
    const r = inspector.radius;
    neuronButtons.forEach((row, l) => row.forEach((b, j) => {
      const p = inspector.screenOf(l, j);
      const col = layout.columns[l];
      const size = Math.max(24, col.collapsed ? col.side * cam.zoom : 2 * r + 4);
      const inside = p && p.x >= -size && p.x <= vp.width + size && p.y >= -size && p.y <= vp.height + size;
      b.style.width = `${size}px`;
      b.style.height = `${size}px`;
      b.style.transform = inside ? `translate(${Math.round(p.x - size / 2)}px, ${Math.round(p.y - size / 2)}px)` : 'translate(-9999px, 0)';
    }));
  }

  // --- Bucle ----------------------------------------------------------------------------------------
  function tick() {
    stepScene();
    const n = playback.tick();
    if (n === 0) return;
    // De a épocas, a 60 por segundo, se hacen de a varias por cuadro si hace falta (sin pasar del presupuesto).
    for (let k = 0; k < n; k++) advance(playback.size, { auto: true });
  }
  const loop = createLoop({ step: tick, render: () => draw(), onError: reportError, speed: 1 });

  // --- Atajos y foco ----------------------------------------------------------------------------
  let handledSpace = false;
  function onKeyDown(e) {
    const action = shortcutFor(e, { recording });
    if (!action) return;
    e.preventDefault();
    if (action === 'play') handledSpace = true;
    if (e.repeat && action !== 'step') return;
    try {
      if (action === 'play') togglePlay();
      else if (action === 'step') stepOnce();
      else if (action === 'restart') resetWeights();
      else if (action === 'view') inspector.resetView();
    } catch (err) { reportError(err); }
  }
  function onKeyUp(e) { if (e.code === 'Space' && handledSpace) { handledSpace = false; e.preventDefault(); } }
  const focusStage = () => stage.focus({ preventScroll: true });
  function onClick(e) { if (e.detail > 0 && returnsFocusToStage(e.target)) focusStage(); }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  for (const zone of [stage, board, panel, bar]) zone?.addEventListener('click', onClick);
  const offLanguage = i18n.onChange(() => { layoutKey = ''; chartKey = ''; fan.dataset.key = ''; sync(); });
  const offLibrary = library ? library.subscribe(() => { refreshCandidates(); if (picker.isOpen) picker.render(); }) : () => {};

  // --- Montaje ---------------------------------------------------------------------------------
  buildBar();
  checkVersion();
  buildOverlay();
  if (state.firstTime || state.wasPlaying) playback.play();
  state.firstTime = false;
  sync();
  draw();
  loop.start();

  return {
    loop, inspector, table, plane, chart, sceneView, draw, sync,
    /** Avanza `ticks` pasos fijos como lo haría el bucle (verificación desde la consola). */
    advanceTicks(ticks) { for (let k = 0; k < ticks; k++) tick(); draw(); },
    get session() { return session; },
    get run() { return run(); },
    get playback() { return playback; },
    get state() { return state; },
    get recording() { return recording; },
    get world() { return world; },
    get animation() { return animation; },
    play, pause, stepOnce, setSize, setKind, setPoints, resetWeights, startRecording, stopRecording, saveBrain, select,
    unmount() {
      state.wasPlaying = playback.playing;
      if (recording) stopRecording({ use: true });
      state.wasPlaying = state.wasPlaying || false;
      playback.pause();
      loop.dispose();
      offLanguage();
      offLibrary();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      for (const zone of [stage, board, panel, bar]) zone?.removeEventListener('click', onClick);
      keyboard.dispose();
      picker.dispose();
      scenario?.dispose();
      sceneDescription.dispose();
      inspector.dispose();
      table.dispose();
      plane.dispose();
      chart.dispose();
      sceneView.dispose();
      stage.classList.remove('inspect-stage', 'lab-stage');
    },
  };
}

/** Miniatura de una forma de puntos (para la barra): unos puntos de cada clase. */
function shapeThumbnail(shape) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 30 21');
  svg.setAttribute('width', '30');
  svg.setAttribute('height', '21');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'lab-shape-thumb');
  const pts = {
    blobs: [[-0.5, 0.5, 1], [-0.3, 0.2, 1], [-0.6, 0.1, 1], [0.5, -0.5, 0], [0.3, -0.2, 0], [0.6, -0.1, 0]],
    circle: [[0, 0, 1], [0.2, 0.15, 1], [-0.2, -0.1, 1], [0.8, 0, 0], [-0.8, 0.1, 0], [0, 0.8, 0], [0.1, -0.8, 0], [0.6, 0.6, 0], [-0.6, -0.6, 0]],
    xor: [[0.5, 0.5, 1], [-0.5, -0.5, 1], [0.6, 0.3, 1], [-0.5, 0.5, 0], [0.5, -0.5, 0], [-0.3, 0.6, 0]],
    spiral: Array.from({ length: 10 }, (_, k) => { const tt = k / 9; const r = 0.15 + 0.8 * tt; const a = 1.75 * tt * 2 * Math.PI; return [[r * Math.sin(a), r * Math.cos(a), 1], [-r * Math.sin(a), -r * Math.cos(a), 0]]; }).flat(),
  }[shape];
  for (const [x, y, c] of pts) {
    const px = 15 + x * 13;
    const py = 10.5 - y * 9;
    const n = c === 1 ? document.createElementNS(ns, 'circle') : document.createElementNS(ns, 'rect');
    if (c === 1) { n.setAttribute('cx', px); n.setAttribute('cy', py); n.setAttribute('r', 1.6); n.setAttribute('class', 'lab-dot-a'); }
    else { n.setAttribute('x', px - 1.4); n.setAttribute('y', py - 1.4); n.setAttribute('width', 2.8); n.setAttribute('height', 2.8); n.setAttribute('class', 'lab-dot-b'); }
    svg.append(n);
  }
  return svg;
}
