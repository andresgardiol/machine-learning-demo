// Pestaña 5, "Inspeccionar" (pestana-inspeccionar): la red de un cerebro en grande, en vivo mientras
// maneja, para ver qué tiene adentro lo que se entrenó.
//
// Disposición (D1): la zona izquierda es de la red (los controles de la vista arriba, la red, la
// operación en curso y la barra de reproducción abajo); el tablero lleva la escena chica, la decisión
// y la leyenda; el panel, la guía, el cerebro, la tarjeta de la neurona elegida y las misiones.
//
// Lo que se ve y lo que maneja son la misma cuenta (D5): el auto maneja con createTraceController y
// la vista dibuja traceNetwork con los mismos cambios de prueba. La lógica sin DOM vive en
// brains.js, playback.js, step-animation.js, describe.js, missions.js y shortcuts.js, y en el núcleo
// (network-trace.js, pass-cursor.js y network-changes.js).
//
// El estado vive en el módulo: el cerebro, la vista, las capas resumidas, el filtro, la neurona
// elegida, el ritmo y los cambios de prueba (por cerebro) se conservan hasta cerrar la aplicación; la
// reproducción queda en pausa mientras la pestaña no está a la vista.
import { createWorld } from '../../core/world.js';
import { traceNetwork, createTraceController, inputsOf } from '../../core/network-trace.js';
import { createChanges, topConnections } from '../../core/network-changes.js';
import { createPassCursor, STEP_SIZES } from '../../core/pass-cursor.js';
import { TRACK_IDS, isCircuit } from '../../core/circuits.js';
import { MAX_SPEED } from '../../core/constants.js';
import { createStageView } from '../../render/view.js';
import { createNetworkInspector } from '../../render/network-inspector.js';
import { neighborOf } from '../../render/inspector-layout.js';
import { createWeightTable } from '../../render/weight-table.js';
import { weightStyle } from '../../render/network-view.js';
import { createLoop } from '../../ui/loop.js';
import { el, setData } from '../../ui/dom.js';
import { returnsFocusToStage } from '../../ui/shortcuts.js';
import { createTextSetter } from '../../ui/controls.js';
import { formatValue } from '../../ui/i18n.js';
import { createPicker } from '../../ui/picker.js';
import { stageDescription } from '../../ui/stage-description.js';
import { scenarioBar } from '../shared/scenario-bar.js';
import { normalizeSettings as normalizeStreet } from '../shared/street-settings.js';
import { actionBlock, ACTIONS } from '../shared/driving-cards.js';
import { EXAMPLE_BRAINS } from '../../data/example-brains.js';
import { listBrains, resolveChoice, trainedScenario, trainedTracks, workingCopy, PICKER_GROUPS } from './brains.js';
import { createPlayback, FRAME_PACES, STEP_PACES } from './playback.js';
import { createStepAnimation, displayCursor, stepDuration } from './step-animation.js';
import { describeStep, whereText, layerName, neuronLabel, placeName } from './describe.js';
import { createInspectMissions } from './missions.js';
import { shortcutFor } from './shortcuts.js';
import { createNeuronCard } from './card.js';
import { OUTPUT_KEYS } from '../../render/network-view.js';

/** Semilla del tráfico: la misma para todos (misma semilla, misma escena). */
export const SEED = 1;
/** Cuadros (a 60 por segundo, mientras se reproduce) que se ve el choque antes de volver a salir. */
export const RETRY_TICKS = 60;
/** Filtros de conexiones (D6b). */
export const FILTERS = Object.freeze(['all', 5, 3, 1]);
/** Vistas de la red. */
export const VIEWS = Object.freeze(['diagram', 'table']);

// --- Estado conservado entre montajes ------------------------------------------------------------
let state = null;
const completedMissions = new Set();

/** Olvida el estado conservado (para pruebas). */
export function resetState() { state = null; }

const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export function mount({ stage, board, panel, bar, i18n, store, library, reportError }) {
  if (!state) {
    state = {
      choice: { key: null, signature: null },
      view: 'diagram',
      filter: 'all',
      collapsed: [],
      shapeKey: '',
      selected: { layer: 1, neuron: 0 },
      connection: null,
      playback: createPlayback(),
      settings: null,
      changesBy: new Map(), // firma del cerebro → lista de cambios
      manual: null,
      missions: createInspectMissions({ completed: completedMissions }),
    };
  }
  const t = (k, p) => i18n.t(k, p);
  const setText = createTextSetter(i18n);
  const fmt = (v) => formatValue(v, i18n.language);
  const playback = state.playback;
  playback.pause(); // se reanuda abajo: al volver, la pestaña sigue en pausa (D13 de Competir, igual acá)

  // --- Cerebro ---------------------------------------------------------------------------------
  let candidates = [];
  let brain = null; // copia de trabajo
  let net = null;
  let changes = null;
  let world = null;
  let cursor = null;
  let controller = null;
  let animation = null;
  let crashTicks = 0;
  let lastStep = null; // { size, last } del último paso, para la operación en curso
  let notice = null; // aviso del panel (cerebro actualizado)

  const candidateOf = (key) => candidates.find((c) => c.key === key) ?? null;
  const refreshCandidates = () => { candidates = listBrains({ library: library ? library.list() : [], examples: EXAMPLE_BRAINS }); };
  const nameOf = (c) => (c ? (c.nameKey ? t(c.nameKey) : c.name) : '');
  function whereOf(b) {
    const ids = trainedTracks(b);
    if (ids.length === 0) return t('compete.where.none');
    if (ids.length === TRACK_IDS.length) return t('compete.where.all');
    return ids.map((id) => t(`track.short.${id}`)).join(' + ');
  }
  const shapeOf = (n) => {
    const hidden = n.sizes.slice(1, -1);
    return hidden.length === 0
      ? t('inspect.shape.none', { inputs: n.sizes[0], outputs: n.sizes.at(-1) })
      : t('inspect.shape', { inputs: n.sizes[0], hidden: hidden.join(' + '), outputs: n.sizes.at(-1) });
  };

  /** Guarda los cambios de prueba del cerebro actual (por su firma) antes de pasar a otro. */
  function keepChanges() {
    const c = candidateOf(state.choice.key);
    if (changes && c) state.changesBy.set(c.signature, changes.list());
  }

  /** Muestra el cerebro `key`: su red, sus cambios y la pista donde más entrenó (D11). */
  function load(key, { settings = null } = {}) {
    const c = candidateOf(key);
    brain = workingCopy(c.brain);
    net = brain.network;
    state.choice = { key, signature: c.signature };
    changes = createChanges(net, state.changesBy.get(c.signature) ?? []);
    const shapeKey = net.sizes.join('-');
    if (shapeKey !== state.shapeKey) {
      state.shapeKey = shapeKey;
      state.collapsed = net.sizes.map(() => false);
      state.selected = { layer: 1, neuron: 0 };
    } else if (!state.selected || state.selected.layer >= net.sizes.length || state.selected.neuron >= net.sizes[state.selected.layer]) {
      state.selected = { layer: 1, neuron: 0 };
    }
    state.connection = null;
    state.manual = null;
    state.settings = settings ?? barDefaults();
    buildWorld();
  }

  /** Escenario donde entrenó el cerebro, con la velocidad de toda la app. */
  const barDefaults = () => ({ ...trainedScenario(brain), maxSpeed: store?.get().carSpeed ?? MAX_SPEED });

  function buildWorld() {
    const s = state.settings;
    // El controlador lee los cambios vigentes del estado conservado: sigue valiendo al volver a la pestaña.
    controller = createTraceController(net, brain.sensors.count, () => state.live?.changes ?? null);
    world = createWorld({
      seed: SEED, track: s.track, lanes: s.lanes, density: s.density, irregularity: s.irregularity,
      cars: [{ controller, sensors: { ...brain.sensors }, maxSpeed: s.maxSpeed }],
    });
    cursor = createPassCursor(net);
    cursor.complete();
    animation = null;
    crashTicks = 0;
    lastStep = null;
    state.missions.newFrame();
    keepLive();
  }

  /** Lo que se conserva al salir: el mundo en el cuadro en que quedó, el cursor y los cambios (D13). */
  function keepLive() {
    state.live = { signature: state.choice.signature, brain, net, changes, world, cursor, controller };
  }
  /** Al volver con el mismo cerebro y los mismos ajustes: todo como quedó. */
  function restoreLive() {
    ({ brain, net, changes, world, cursor, controller } = state.live);
  }

  // --- Cuenta ------------------------------------------------------------------------------------
  /** Lo que recibe la red: lo que ve el auto, o lo puesto a mano en pausa (D9). */
  function currentInputs() {
    const real = inputsOf(world.perception);
    if (!state.manual) return real;
    return real.map((v, i) => (state.manual[i] ?? v));
  }
  const traceNow = () => traceNetwork(net, currentInputs(), changes);

  /** Un cuadro del mundo: percibir, calcular la red y mover el auto. Suelta las entradas a mano. */
  function stepWorld() {
    if (state.manual) releaseManual({ announceIt: true });
    if (world.crashed) {
      crashTicks += 1;
      if (crashTicks >= RETRY_TICKS) { world.reset(); crashTicks = 0; }
    } else {
      world.step();
    }
    state.missions.newFrame();
  }

  /** Un paso del cursor de tamaño `size` (D7): al completar la cuenta, el siguiente mueve el auto. */
  function stepCursor(size, { auto }) {
    if (animation) animation = null; // pedir otro paso completa la animación al instante
    if (size === 'frame') {
      if (cursor.done) { stepWorld(); cursor.reset(); }
      const r = cursor.advance('frame');
      afterAdvance('frame', r, { auto });
      return;
    }
    if (cursor.done) {
      stepWorld();
      cursor.reset();
      lastStep = null;
      if (!auto) announce(t('inspect.announce.moved'));
      return;
    }
    const r = cursor.advance(size);
    afterAdvance(size, r, { auto });
  }

  function afterAdvance(size, r, { auto }) {
    if (r.finished || r.to === r.from) return;
    const ops = [];
    for (let k = r.from; k < r.to; k++) ops.push(cursor.at(k));
    state.missions.stepped(size, ops);
    const last = ops[ops.length - 1];
    lastStep = { size, last };
    // La tarjeta sigue a la cuenta (de a neuronas o de a operaciones).
    if (size === 'neuron' || size === 'operation') { state.selected = { layer: last.layer, neuron: last.neuron }; state.connection = null; }
    if (!reducedMotion()) {
      const duration = stepDuration(size, auto ? { intervalMs: playback.intervalMs } : {});
      animation = createStepAnimation(r, cursor.at, { start: performance.now(), duration });
    }
    if (!auto) announce(describeStep({ t, fmt, size, last, trace: traceNow(), sizes: net.sizes }));
  }

  // --- Reproducción --------------------------------------------------------------------------------
  function play() {
    if (state.manual) releaseManual({ announceIt: true });
    playback.play();
    sync();
  }
  function pause() {
    playback.pause();
    if (playback.size === 'frame') cursor.complete(); // la cuenta del cuadro completa a la vista
    sync();
  }
  const togglePlay = () => (playback.playing ? pause() : play());
  function stepOnce() {
    if (playback.playing) pause();
    stepCursor(playback.size, { auto: false });
    sync();
  }
  function restart() {
    world.reset();
    cursor.complete();
    animation = null;
    crashTicks = 0;
    lastStep = null;
    if (state.manual) releaseManual({ announceIt: false });
    sync();
  }
  function setSize(size) {
    if (!playback.setSize(size)) return;
    if (size === 'frame' && playback.playing) cursor.complete();
    sync();
  }

  // --- Cambios de prueba ------------------------------------------------------------------------
  function changed() {
    keepChanges();
    displayed.trace = null; // la cuenta cambió: los nombres accesibles se recalculan con la nueva
    relabel();
    sync();
  }
  /** Nombres accesibles de todas las neuronas, con su valor y su estado. */
  function relabel() { neuronButtons.forEach((row, l) => row.forEach((b, j) => labelNeuron(b, l, j))); }
  function setChange(c) { if (changes.set(c)) changed(); }
  const selectedNeuron = () => traceNow().layers[state.selected.layer].neurons[state.selected.neuron];
  function toggleNeuron() {
    const { layer, neuron } = state.selected;
    setChange({ kind: 'neuronOff', layer, neuron, value: !selectedNeuron().off });
    announce(t(selectedNeuron().off ? 'inspect.announce.off' : 'inspect.announce.on', { name: placeName(t, net.sizes, layer, neuron) }));
  }
  function toggleConnection(input) {
    const { layer, neuron } = state.selected;
    const off = changes.valueOf({ kind: 'connectionOff', layer, neuron, input });
    setChange({ kind: 'connectionOff', layer, neuron, input, value: !off });
    state.connection = input;
  }
  const setWeight = (input, value) => { state.connection = input; setChange({ kind: 'weight', layer: state.selected.layer, neuron: state.selected.neuron, input, value }); };
  const setBias = (value) => setChange({ kind: 'bias', layer: state.selected.layer, neuron: state.selected.neuron, value });
  function undo() {
    const u = changes.undo();
    if (!u) return;
    changed();
    announce(t('inspect.announce.undone', { count: changes.count }));
  }
  function resetNetwork() {
    if (!changes.clear()) return;
    changed();
    announce(t('inspect.announce.reset'));
  }

  // --- Entradas a mano (D9) --------------------------------------------------------------------
  function setManual(input, value) {
    if (playback.playing) return; // solo en pausa
    const v = Math.max(input === net.sizes[0] - 1 ? -1 : 0, Math.min(1, Math.round(value * 100) / 100));
    if (!state.manual) state.manual = Array.from({ length: net.sizes[0] }, () => null);
    state.manual[input] = v;
    const real = traceNetwork(net, inputsOf(world.perception), changes).outputs;
    state.missions.manualDecision({ manual: true, outputs: traceNow().outputs, real });
    displayed.trace = null;
    relabel();
    sync();
  }
  function releaseManual({ announceIt }) {
    if (!state.manual) return;
    state.manual = null;
    if (announceIt) announce(t('inspect.announce.released'));
  }

  // --- Selección ---------------------------------------------------------------------------------
  function select(target) {
    if (!target) return;
    state.selected = { layer: target.layer, neuron: target.neuron };
    state.connection = target.input ?? null;
    if (!neuronLayer.contains(document.activeElement)) focusNeuron(state.selected, { focus: false });
    relabel(); // «elegida» al instante
    sync();
  }

  // ==================================================================================================
  // Zona izquierda: la red
  // ==================================================================================================
  const netTitle = el('h2', { class: 'inspect-net-title', attrs: { id: 'inspect-net-title' } });
  const viewButtons = VIEWS.map((v) => el('button', {
    class: 'segment', i18n: `inspect.view.${v}`, help: `inspect.view.${v}`,
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { view: v },
    on: { click: () => { state.view = v; sync(); } },
  }));
  const viewGroup = el('div', { class: 'segments inspect-views', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.view.label' }, viewButtons);
  const filterButtons = FILTERS.map((f) => el('button', {
    class: 'segment', i18n: f === 'all' ? 'inspect.filter.all' : 'inspect.filter.n', params: f === 'all' ? undefined : { value: f },
    help: f === 'all' ? 'inspect.filter.all' : `inspect.filter.${f}`,
    i18nAttr: f === 'all' ? undefined : 'aria-label:inspect.filter.nLabel',
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { filter: String(f) },
    on: { click: () => { state.filter = f; sync(); } },
  }));
  const filterGroup = el('div', { class: 'inspect-filter', attrs: { role: 'group', 'aria-labelledby': 'inspect-filter-label' } },
    el('span', { class: 'inspect-label', i18n: 'inspect.filter.label', help: 'inspect.filter', attrs: { id: 'inspect-filter-label' } }),
    el('div', { class: 'segments' }, filterButtons));
  const collapseAll = el('button', { class: 'tool small inspect-collapse-all', attrs: { type: 'button' }, on: { click: () => toggleAll() } });
  const changesCount = el('span', { class: 'inspect-changes', attrs: { role: 'status' } });
  const undoButton = el('button', { class: 'tool small inspect-undo', i18n: 'inspect.undo', attrs: { type: 'button' }, on: { click: () => undo() } });
  const resetButton = el('button', { class: 'tool small inspect-reset', i18n: 'inspect.resetNetwork', attrs: { type: 'button' }, on: { click: () => resetNetwork() } });
  const zoomOut = el('button', { class: 'tool small inspect-zoom', i18n: 'camera.zoomOut', help: 'inspect.zoomOut', i18nAttr: 'aria-label:camera.zoomOut.label', attrs: { type: 'button' }, on: { click: () => inspector.zoomOut() } });
  const zoomIn = el('button', { class: 'tool small inspect-zoom', i18n: 'camera.zoomIn', help: 'inspect.zoomIn', i18nAttr: 'aria-label:camera.zoomIn.label', attrs: { type: 'button' }, on: { click: () => inspector.zoomIn() } });
  const zoomReset = el('button', { class: 'tool small inspect-zoom-reset', i18n: 'inspect.zoomReset', help: 'inspect.zoomReset', attrs: { type: 'button' }, on: { click: () => inspector.resetView() } });
  const zoomGroup = el('div', { class: 'inspect-zoom-group', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.zoom.label' }, zoomOut, zoomIn, zoomReset);
  const controls = el('div', { class: 'inspect-controls' },
    el('div', { class: 'inspect-row' }, netTitle, viewGroup, filterGroup),
    el('div', { class: 'inspect-row' }, collapseAll, el('span', { class: 'inspect-edits' }, changesCount, undoButton, resetButton), zoomGroup));

  // Red: diagrama y tabla, en la misma zona.
  const area = el('div', { class: 'inspect-area', attrs: { role: 'group', 'aria-labelledby': 'inspect-net-title' } });
  const diagram = el('div', { class: 'inspect-diagram' });
  const tableZone = el('div', { class: 'inspect-table-zone' });
  area.append(diagram, tableZone);
  const inspector = createNetworkInspector({
    container: diagram, i18n,
    onSelect: (target) => { select(target); focusNeuron(target, { focus: false }); },
    onViewChange: () => { layoutKey = ''; },
  });
  // Encabezados de capa sobre el diagrama (D6): botones de verdad que siguen a su columna.
  const headerLayer = el('div', { class: 'inspect-headers' });
  const neuronLayer = el('div', { class: 'inspect-neurons', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.neurons.label', on: { keydown: (e) => onNeuronKey(e) } });
  inspector.overlay.append(headerLayer, neuronLayer);
  let headerButtons = [];
  let tableHeaders = [];
  let neuronButtons = []; // [layer][neuron]
  let focusTarget = { layer: 1, neuron: 0 };

  function makeHeader(l, { inTable }) {
    const b = el('button', {
      class: inTable ? 'inspect-layer-head inspect-layer-head-table' : 'inspect-layer-head', help: 'inspect.layer.head',
      attrs: { type: 'button', 'aria-expanded': 'true' }, dataset: { layer: String(l), focus: 'keep' },
      on: { click: () => toggleLayer(l) },
    }, el('span', { class: 'inspect-layer-mark', attrs: { 'aria-hidden': 'true' } }), el('span', { class: 'inspect-layer-name' }));
    return b;
  }
  const table = createWeightTable({
    container: tableZone, i18n,
    onSelect: (target) => select(target),
    headerFor: (l) => { const h = makeHeader(l, { inTable: true }); tableHeaders[l] = h; return h; },
    names: { layer: (l) => layerName(t, l, net.sizes.length), neuron: (l, j) => neuronLabel(t, net.sizes, l, j) },
  });

  function buildOverlay() {
    headerLayer.replaceChildren();
    neuronLayer.replaceChildren();
    headerButtons = net.sizes.map((_, l) => { const h = makeHeader(l, { inTable: false }); headerLayer.append(h); return h; });
    neuronButtons = net.sizes.map((count, l) => Array.from({ length: count }, (_, j) => {
      const b = el('button', {
        class: 'inspect-neuron', help: 'inspect.neuron', dataset: { layer: String(l), neuron: String(j), focus: 'keep', shortcuts: 'pass' },
        attrs: { type: 'button', tabindex: '-1' },
        on: { click: () => select({ layer: l, neuron: j }), focus: () => { focusTarget = { layer: l, neuron: j }; labelNeuron(b, l, j); } },
      });
      neuronLayer.append(b);
      return b;
    }));
    layoutKey = '';
    focusNeuron(state.selected, { focus: false }); // la elegida es la entrada a la red con Tab
  }
  function toggleLayer(l) {
    state.collapsed = state.collapsed.map((v, i) => (i === l ? !v : v));
    layoutKey = '';
    sync();
  }
  function toggleAll() {
    const all = state.collapsed.every(Boolean);
    state.collapsed = state.collapsed.map(() => !all);
    layoutKey = '';
    sync();
  }

  // Teclado en la red (D6): foco itinerante; las flechas mueven el foco, Enter elige.
  function focusNeuron(target, { focus = true } = {}) {
    focusTarget = target;
    for (const row of neuronButtons) for (const b of row) b.tabIndex = -1;
    const b = neuronButtons[target.layer]?.[target.neuron];
    if (!b) return;
    b.tabIndex = 0;
    if (!focus) return;
    // Con la red acercada, la vista se mueve para que la neurona con foco quede a la vista: es la forma
    // de recorrerla sin arrastrar.
    if (state.view === 'diagram' && inspector.zoomed) {
      const p = inspector.screenOf(target.layer, target.neuron);
      const vp = inspector.viewport;
      const margin = 40;
      if (p && (p.x < margin || p.x > vp.width - margin || p.y < margin || p.y > vp.height - margin)) {
        inspector.camera.pan(vp.width / 2 - p.x, vp.height / 2 - p.y);
        layoutKey = '';
        draw();
      }
    }
    b.focus({ preventScroll: true });
  }
  function onNeuronKey(e) {
    const b = e.target.closest?.('.inspect-neuron');
    if (!b) return;
    const from = { layer: Number(b.dataset.layer), neuron: Number(b.dataset.neuron) };
    const to = neighborOf(net.sizes, from, e.key);
    if (!to) return;
    e.preventDefault();
    e.stopPropagation();
    focusNeuron(to);
  }
  function labelNeuron(b, l, j) {
    const trace = displayed.trace ?? traceNow();
    const n = trace.layers[l].neurons[j];
    const c = displayed.cursor;
    const value = l === 0 || !c || c.opsDone(l, j) === 4 ? fmt(n.output) : t('inspect.aria.pending');
    const flags = [];
    if (state.selected.layer === l && state.selected.neuron === j) flags.push(t('inspect.aria.selected'));
    if (n.off) flags.push(t('inspect.aria.off'));
    if (l > 0 && (changes.has({ kind: 'bias', layer: l, neuron: j }) || n.weights.some((_, i) => changes.has({ kind: 'weight', layer: l, neuron: j, input: i })))) flags.push(t('inspect.aria.changed'));
    if (l === 0 && state.manual?.[j] !== null && state.manual?.[j] !== undefined) flags.push(t('inspect.aria.manual'));
    const label = t('inspect.aria.neuron', { layer: layerName(t, l, net.sizes.length), name: neuronLabel(t, net.sizes, l, j), value })
      + (flags.length ? `. ${flags.join(', ').replace(/^./, (c) => c.toUpperCase())}` : '');
    if (b.getAttribute('aria-label') !== label) b.setAttribute('aria-label', label);
    b.setAttribute('aria-pressed', String(state.selected.layer === l && state.selected.neuron === j));
  }

  // Operación en curso y reproducción (D7 y D7c)
  const opStrip = el('p', { class: 'inspect-op', attrs: { 'aria-hidden': 'true' } });
  const playButton = el('button', { class: 'tool primary inspect-play', attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: () => togglePlay() } });
  const stepButton = el('button', { class: 'tool inspect-step', i18n: 'inspect.step', help: 'inspect.step', attrs: { type: 'button' }, on: { click: () => stepOnce() } });
  const sizeButtons = STEP_SIZES.map((s) => el('button', {
    class: 'segment', i18n: `inspect.size.${s}`, help: `inspect.size.${s}`,
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { size: s, focus: 'keep' },
    on: { click: () => setSize(s) },
  }));
  const sizeGroup = el('div', { class: 'inspect-size', attrs: { role: 'group', 'aria-labelledby': 'inspect-size-label' } },
    el('span', { class: 'inspect-label', i18n: 'inspect.size.label', help: 'inspect.size', attrs: { id: 'inspect-size-label' } }),
    el('div', { class: 'segments' }, sizeButtons));
  const paceValue = el('output', { class: 'inspect-pace-value', attrs: { for: 'inspect-pace' } });
  const paceInput = el('input', {
    help: 'inspect.pace', dataset: { focus: 'keep' },
    attrs: { type: 'range', id: 'inspect-pace', min: 0, step: 1 },
    on: { input: (e) => { playback.setPace(Number(e.target.value)); sync(); } },
  });
  const paceGroup = el('div', { class: 'inspect-pace' },
    el('label', { class: 'inspect-label', attrs: { for: 'inspect-pace' }, i18n: 'inspect.pace.label' }), paceInput, paceValue);
  const where = el('p', { class: 'inspect-where' });
  const playbar = el('div', { class: 'inspect-playbar', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.playbar.label' },
    el('div', { class: 'inspect-playbar-main' }, playButton, stepButton, sizeGroup),
    el('div', { class: 'inspect-playbar-pace' }, paceGroup, where));
  const netZone = el('div', { class: 'inspect-net' }, controls, area, opStrip, playbar);
  stage.append(netZone);
  stage.classList.add('inspect-stage');

  // ==================================================================================================
  // Tablero: escena chica, decisión y leyenda
  // ==================================================================================================
  const scene = el('div', { class: 'inspect-scene' });
  const sceneView = createStageView({ container: scene, store, small: true });
  const manualText = el('span', { i18n: 'inspect.manual.badge' });
  const releaseButton = el('button', { class: 'tool small inspect-release', i18n: 'inspect.manual.release', help: 'inspect.manual.release', attrs: { type: 'button' }, on: { click: () => { releaseManual({ announceIt: true }); sync(); } } });
  const manualBadge = el('div', { class: 'stage-badge inspect-manual-badge', attrs: { role: 'status' } }, manualText, releaseButton);
  const crashBadge = el('div', { class: 'stage-badge crash-badge', attrs: { role: 'status' }, i18n: 'inspect.crash' });
  const pausedBadge = el('div', { class: 'stage-badge pause-badge', i18n: 'inspect.paused' });
  scene.append(el('div', { class: 'inspect-scene-badges' }, manualBadge, crashBadge, pausedBadge));
  const description = stageDescription({ stage: scene });
  const decision = actionBlock();
  const decisionNote = el('p', { class: 'caption inspect-decision-note' });
  const decisionBlock = el('section', { class: 'inspect-decision', attrs: { 'aria-labelledby': 'inspect-decision-title' } },
    el('h2', { class: 'panel-heading', i18n: 'inspect.decision.title', help: 'inspect.decision', attrs: { id: 'inspect-decision-title', tabindex: '0' } }),
    decision.node, decisionNote);
  const legendItem = (cls, key) => el('li', { class: `inspect-legend-item ${cls}` }, el('span', { class: 'inspect-legend-swatch', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: key }));
  const legend = el('section', { class: 'guide inspect-legend', attrs: { 'aria-labelledby': 'inspect-legend-title' } },
    el('h2', { class: 'panel-heading', i18n: 'inspect.legend.title', attrs: { id: 'inspect-legend-title' } }),
    el('ul', { class: 'inspect-legend-list' },
      legendItem('lg-positive', 'inspect.legend.positive'), legendItem('lg-negative', 'inspect.legend.negative'),
      legendItem('lg-width', 'inspect.legend.width'), legendItem('lg-fill', 'inspect.legend.fill'),
      legendItem('lg-bias', 'inspect.legend.bias'), legendItem('lg-pending', 'inspect.legend.pending'),
      legendItem('lg-off', 'inspect.legend.off'), legendItem('lg-changed', 'inspect.legend.changed'),
      legendItem('lg-manual', 'inspect.legend.manual')));
  const announcer = el('p', { class: 'sr-only', attrs: { role: 'status', 'aria-live': 'polite' } });
  function announce(text) { announcer.textContent = ''; announcer.textContent = text ?? ''; }
  board.append(scene, decisionBlock, legend, announcer);

  // ==================================================================================================
  // Panel: guía, cerebro, tarjeta y misiones
  // ==================================================================================================
  const intro = el('p', { class: 'guide inspect-intro', i18n: 'inspect.guide' });
  const brainName = el('span', { class: 'inspect-brain-name' });
  const changeBrain = el('button', {
    class: 'tool small inspect-change-brain', i18n: 'inspect.brain.change', help: 'inspect.brain.change',
    attrs: { type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'inspect-picker' },
    on: { click: () => picker.toggle({ focus: 'current' }) },
  });
  const brainMeta = el('p', { class: 'inspect-brain-meta muted' });
  const brainNotice = el('p', { class: 'caption inspect-brain-notice', attrs: { role: 'status' } });
  const brainSection = el('section', { class: 'inspect-brain', attrs: { 'aria-labelledby': 'inspect-brain-title' } },
    el('h2', { class: 'sr-only', i18n: 'inspect.brain.title', attrs: { id: 'inspect-brain-title' } }),
    el('div', { class: 'inspect-brain-head' }, brainName, changeBrain), brainMeta, brainNotice);
  const card = createNeuronCard({
    i18n,
    onToggleNeuron: () => toggleNeuron(),
    onToggleConnection: (i) => toggleConnection(i),
    onWeight: (i, v) => setWeight(i, v),
    onBias: (v) => setBias(v),
    onManualInput: (i, v) => setManual(i, v),
    onSelectConnection: (i) => { if (state.connection !== i) { state.connection = i; sync(); } },
  });
  const missionRows = state.missions.missions.map((m) => {
    const status = el('span', { class: 'mission-status' });
    const row = el('li', { class: 'mission inspect-mission' }, el('span', { class: 'mission-name', i18n: `inspect.mission.${m.id}` }), status);
    return { id: m.id, row, status };
  });
  const missions = el('section', { class: 'guide inspect-missions' },
    el('h2', { class: 'sr-only', i18n: 'inspect.missions.title' }),
    el('ol', { class: 'mission-list inspect-mission-list' }, missionRows.map((r) => r.row)));
  panel.append(el('h1', { class: 'sr-only', i18n: 'inspect.title' }),
    el('div', { class: 'inspect-panel' }, intro, brainSection, card.node, missions));

  const picker = createPicker({
    id: 'inspect-picker', anchor: changeBrain, t,
    titleKey: 'inspect.picker.title', doneKey: 'compete.picker.done', doneHelp: 'inspect.picker.done', emptyKey: 'compete.picker.empty',
    groups: () => PICKER_GROUPS.map((g) => ({
      id: g,
      title: t(`compete.picker.group.${g}`),
      items: candidates.filter((c) => (g === 'brains' ? c.kind === 'brain' : c.kind === 'example')).map((c) => ({
        key: c.key, name: nameOf(c), meta: c.available ? `${whereOf(c.brain)} · ${shapeOf(c.brain.network)}` : t('inspect.picker.invalid'),
        help: c.available ? (c.kind === 'example' ? 'inspect.pick.example' : 'inspect.pick.brain') : 'compete.check.invalidBrain',
        disabled: !c.available, current: c.key === state.choice.key,
      })),
    })).filter((g) => g.items.length > 0),
    onPick: (key) => { choose(key); picker.close(); },
  });

  function choose(key) {
    if (key === state.choice.key) return;
    keepChanges();
    load(key);
    notice = null;
    buildOverlay();
    sync();
  }

  // ==================================================================================================
  // Barra de escenario: pista, tráfico y velocidad; sin sensores (D10)
  // ==================================================================================================
  const scenario = scenarioBar({
    i18n, settings: { lanes: 3, density: 0, irregularity: 0, maxSpeed: MAX_SPEED, track: 'straight' }, idPrefix: 'inspect', omit: ['sensors'],
    help: (key) => `inspect.bar.${key}`, trackHelp: 'inspect.bar.track', noTrafficHelp: 'drive.noTraffic', resetHelp: 'inspect.bar.reset',
    onChange: (key, value, { final }) => { if (final) applyBar({ ...state.settings, [key]: value }); },
    onReset: () => applyBar(barDefaults(), { force: true }),
  });
  bar?.append(scenario.node);
  /** Un cambio de la barra vuelve a empezar el intento, con la misma red y los mismos cambios. */
  function applyBar(next, { force = false } = {}) {
    const n = normalizeStreet({ ...next });
    const target = { track: n.track, lanes: n.lanes, density: n.density, irregularity: n.irregularity, maxSpeed: n.maxSpeed };
    if (!force && JSON.stringify(target) === JSON.stringify(state.settings)) { sync(); return; }
    if (target.maxSpeed !== state.settings.maxSpeed) store?.set({ carSpeed: target.maxSpeed });
    state.settings = target;
    buildWorld();
    sync();
  }

  // ==================================================================================================
  // Sincronizar y dibujar
  // ==================================================================================================
  const displayed = { cursor: null, trace: null };
  let labelTick = 0;
  let headerRows = 1; // encabezados de capa en uno o dos renglones (escalonados si no entran)
  let layoutKey = '';
  const write = (n, text) => { if (n.textContent !== text) n.textContent = text; };
  const show = (n, visible) => { if (n.hidden === Boolean(visible)) n.hidden = !visible; };
  const setAttr = (n, k, v) => { if (n.getAttribute(k) !== v) n.setAttribute(k, v); };

  /** Controles que no dependen del cuadro: se reescriben al cambiar algo. */
  function sync() {
    const c = candidateOf(state.choice.key);
    const name = nameOf(c);
    setText(netTitle, 'inspect.net.title', { name });
    write(brainName, name);
    write(brainMeta, `${t('inspect.brain.where', { where: whereOf(brain) })} · ${shapeOf(net)}`);
    brainNotice.hidden = !notice;
    if (notice) setText(brainNotice, notice);
    for (const b of viewButtons) setAttr(b, 'aria-pressed', String(b.dataset.view === state.view));
    for (const b of filterButtons) setAttr(b, 'aria-pressed', String(b.dataset.filter === String(state.filter)));
    const all = state.collapsed.every(Boolean);
    setText(collapseAll, all ? 'inspect.openAll' : 'inspect.collapseAll');
    setData(collapseAll, 'help', all ? 'inspect.openAll' : 'inspect.collapseAll');
    // Deshacer y restablecer: siempre a la vista; sin cambios, en su tope y con su explicación (D12).
    const count = changes.count;
    setText(changesCount, count === 0 ? 'inspect.changes.none' : 'inspect.changes.count', { value: count });
    setData(changesCount, 'changed', String(count > 0));
    for (const [b, key] of [[undoButton, 'inspect.undo'], [resetButton, 'inspect.resetNetwork']]) {
      setAttr(b, 'aria-disabled', String(count === 0));
      setData(b, 'help', count === 0 ? `${key}.none` : key);
    }
    zoomGroup.hidden = state.view !== 'diagram';
    diagram.hidden = state.view !== 'diagram';
    tableZone.hidden = state.view !== 'table';
    // Reproducción
    setText(playButton, playback.playing ? 'inspect.pause' : 'inspect.play');
    setData(playButton, 'help', playback.playing ? 'inspect.pause' : 'inspect.play');
    setAttr(playButton, 'aria-pressed', String(!playback.playing));
    for (const b of sizeButtons) setAttr(b, 'aria-pressed', String(b.dataset.size === playback.size));
    setAttr(paceInput, 'max', String(playback.paceCount - 1));
    if (Number(paceInput.value) !== playback.paceIndex) paceInput.value = String(playback.paceIndex);
    const paceText = playback.size === 'frame'
      ? t(`inspect.pace.frame.${FRAME_PACES[playback.paceIndex].id}`)
      : t('inspect.pace.steps', { value: STEP_PACES[playback.paceIndex] });
    write(paceValue, paceText);
    setAttr(paceInput, 'aria-valuetext', paceText);
    setData(paceInput, 'help', playback.size === 'frame' ? 'inspect.pace' : 'inspect.pace.steps');
    // Misiones
    for (const m of state.missions.missions) {
      const r = missionRows.find((x) => x.id === m.id);
      setData(r.row, 'done', String(m.done));
      setText(r.status, m.done ? 'train.mission.done' : 'train.mission.pending');
    }
    scenario.sync({ ...state.settings });
  }

  /** Lo que cambia en cada cuadro: la red, la tarjeta, la escena y la decisión. */
  function draw() {
    const now = performance.now();
    const realTime = playback.playing && playback.realTime;
    let anim = null;
    if (animation) {
      const s = animation.state(now);
      if (s.done) animation = null;
      else anim = s;
    }
    const shownCursor = realTime ? null : displayCursor(cursor, anim);
    const trace = traceNow();
    displayed.cursor = shownCursor;
    displayed.trace = trace;
    const top = topConnections(net, changes, state.filter);
    const marks = marksOf();
    const common = {
      sizes: net.sizes, trace, cursor: shownCursor, selected: state.selected, collapsed: state.collapsed, top, marks,
      manual: state.manual ? state.manual.map((v) => v !== null) : null,
    };
    inspector.render({ ...common, animation: anim, visible: state.view === 'diagram', headerRows });
    table.render({ ...common, visible: state.view === 'table', changesVersion: changes.version, filter: state.filter });
    placeOverlay();
    // Nombres accesibles de las neuronas (capa, nombre, valor y estado): dos veces por segundo.
    if (++labelTick % 30 === 0 || labelTick === 1) neuronButtons.forEach((row, l) => row.forEach((b, j) => labelNeuron(b, l, j)));

    // Operación en curso: en pausa y al reproducir de a capas, neuronas u operaciones (D7c).
    show(opStrip, !realTime);
    if (!realTime) write(opStrip, lastStep ? describeStep({ t, fmt, size: lastStep.size, last: lastStep.last, trace, sizes: net.sizes }) : t('inspect.op.idle'));
    write(where, whereText({ t, frame: world.steps, sizes: net.sizes, cursor: shownCursor ?? cursor, realTimePlaying: realTime }));

    // Escena: rayos con el peso de la neurona elegida si recibe los sensores (D9).
    const sel = state.selected;
    const sensors = brain.sensors.count;
    let rayLooks = null;
    if (sel.layer === 1) {
      const n = trace.layers[1].neurons[sel.neuron];
      rayLooks = Array.from({ length: sensors }, (_, i) => ({ ...weightStyle(n.weights[i]), off: Boolean(n.offConnections?.[i]) }));
    }
    const raysOff = Array.from({ length: sensors }, (_, i) => trace.layers[0].neurons[i].off);
    const paused = !playback.playing;
    sceneView.render(world, {
      showSensors: true,
      rays: {
        looks: rayLooks, off: raysOff, highlight: sel.layer === 0 && sel.neuron < sensors ? sel.neuron : null,
        handles: paused ? { readings: trace.inputs.slice(0, sensors), onDrag: (i, v) => setManual(i, v) } : null,
      },
    });
    show(manualBadge, Boolean(state.manual));
    show(crashBadge, world.crashed);
    show(pausedBadge, !playback.playing);

    // Decisión: las cuatro acciones; sin decidir mientras la cuenta no llegó a las salidas.
    const outLayer = net.sizes.length - 1;
    const decided = !shownCursor || net.sizes[outLayer] === 0 || Array.from({ length: net.sizes[outLayer] }, (_, j) => shownCursor.opsDone(outLayer, j)).every((x) => x === 4);
    decision.update(Object.fromEntries(ACTIONS.map((a) => [a, decided && trace.outputs[OUTPUT_KEYS.indexOf(a)] === 1])));
    setData(decision.node, 'undecided', String(!decided));
    setText(decisionNote, decided ? (state.manual ? 'inspect.decision.manual' : 'inspect.decision.live') : 'inspect.decision.undecided');

    // Tarjeta de la neurona elegida.
    card.sync({
      target: sel, sizes: net.sizes, trace, changes, original: net, cursor: shownCursor,
      top: top && sel.layer > 0 ? top[sel.layer][sel.neuron] : null,
      paused, manual: state.manual, connection: state.connection,
    });
    description.set(t('inspect.scene.description', { track: t(`track.${state.settings.track}`), state: t(paused ? 'inspect.paused' : 'inspect.playing') }));
  }

  /** Marcas de lo cambiado, para el diagrama y la tabla. */
  function marksOf() {
    const changedWeights = new Set();
    const changedBiases = new Set();
    for (const c of changes.list()) {
      if (c.kind === 'weight') changedWeights.add(`${c.layer}:${c.neuron}:${c.input}`);
      if (c.kind === 'bias') changedBiases.add(`${c.layer}:${c.neuron}`);
    }
    return { changedWeights, changedBiases };
  }

  /** Encabezados de capa y botones de neuronas sobre el diagrama, en su lugar. */
  function placeOverlay() {
    // Encabezados (también en la tabla): nombre, cuántas neuronas y si está abierta o resumida.
    net.sizes.forEach((count, l) => {
      const collapsed = Boolean(state.collapsed[l]);
      for (const h of [headerButtons[l], tableHeaders[l]]) {
        if (!h) continue;
        const name = t('inspect.layer.head', { name: layerName(t, l, net.sizes.length), value: count });
        write(h.querySelector('.inspect-layer-name'), name);
        write(h.querySelector('.inspect-layer-mark'), collapsed ? '▸' : '▾');
        setAttr(h, 'aria-expanded', String(!collapsed));
        setAttr(h, 'aria-label', t(collapsed ? 'inspect.layer.head.collapsed' : 'inspect.layer.head.open', { name: layerName(t, l, net.sizes.length), value: count }));
        setData(h, 'collapsed', collapsed);
      }
    });
    const layout = inspector.layout;
    if (!layout || layout.columns.length !== net.sizes.length) return; // todavía con la red anterior
    const vp = inspector.viewport;
    const cam = inspector.camera;
    const key = `${vp.width}x${vp.height}|${cam.zoom}|${cam.center.x},${cam.center.y}|${state.collapsed.join()}|${state.view}|${i18n.language}`;
    if (key === layoutKey || state.view !== 'diagram') return;
    layoutKey = key;
    // Sigue a su columna y queda a la vista, pegado al borde de arriba. Si dos vecinos no entran en
    // un renglón, van escalonados en dos (y la red baja un renglón).
    const xs = net.sizes.map((_, l) => inspector.columnScreenX(l));
    const ws = headerButtons.map((h) => h.offsetWidth || 80);
    const lefts = xs.map((x, l) => Math.max(2, Math.min(vp.width - ws[l] - 2, x - ws[l] / 2)));
    const crowded = lefts.some((x, l) => l > 0 && x < lefts[l - 1] + ws[l - 1] + 4);
    const rows = crowded ? 2 : 1;
    if (rows !== headerRows) { headerRows = rows; layoutKey = ''; }
    net.sizes.forEach((_, l) => {
      const left = lefts[l];
      const top = rows === 2 && l % 2 === 1 ? 32 : 4;
      headerButtons[l].style.transform = `translate(${Math.round(left)}px, ${top}px)`;
    });
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
    const n = playback.tick();
    for (let k = 0; k < n; k++) {
      if (playback.size === 'frame') {
        if (world.crashed) { crashTicks += 1; if (crashTicks >= RETRY_TICKS) { world.reset(); crashTicks = 0; } } else world.step();
        cursor.complete();
        state.missions.newFrame();
      } else {
        stepCursor(playback.size, { auto: true });
      }
    }
    if (playback.playing) {
      // Con la reproducción en marcha y un choque, el intento vuelve a empezar solo (aunque el ritmo sea lento).
      if (world.crashed && playback.size !== 'frame' && n === 0) { crashTicks += 1; if (crashTicks >= RETRY_TICKS) { world.reset(); crashTicks = 0; cursor.complete(); } }
      const anyOff = changes.list().some((c) => c.kind === 'neuronOff');
      const was = state.missions.isDone('off');
      state.missions.played(1, anyOff);
      if (!was && state.missions.isDone('off')) sync();
    }
  }
  const loop = createLoop({ step: tick, render: () => draw(), onError: reportError, speed: 1 });

  // --- Atajos y foco ----------------------------------------------------------------------------
  let handledSpace = false;
  function onKeyDown(e) {
    const action = shortcutFor(e);
    if (!action) return;
    e.preventDefault();
    if (action === 'play') handledSpace = true;
    if (e.repeat && action !== 'step') return;
    try {
      if (action === 'play') togglePlay();
      else if (action === 'step') stepOnce();
      else if (action === 'restart') restart();
      else if (action === 'view') inspector.resetView();
    } catch (err) {
      reportError(err);
    }
  }
  function onKeyUp(e) {
    if (e.code === 'Space' && handledSpace) { handledSpace = false; e.preventDefault(); }
  }
  const focusStage = () => stage.focus({ preventScroll: true });
  function onClick(e) {
    if (e.detail > 0 && returnsFocusToStage(e.target)) focusStage();
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  for (const zone of [stage, board, panel, bar]) zone?.addEventListener('click', onClick);
  const offLanguage = i18n.onChange(() => { layoutKey = ''; sync(); });
  const offLibrary = library ? library.subscribe(() => { refreshCandidates(); if (picker.isOpen) picker.render(); }) : () => {};
  const offStore = store ? store.subscribe((s, prev) => {
    if (s.carSpeed !== prev.carSpeed && s.carSpeed !== state.settings.maxSpeed) { state.settings = { ...state.settings, maxSpeed: s.carSpeed }; buildWorld(); sync(); }
  }) : () => {};

  // --- Montaje ---------------------------------------------------------------------------------
  refreshCandidates();
  const resolved = resolveChoice(candidates, state.choice);
  const firstTime = state.settings === null;
  if (resolved.updated) {
    // El cerebro que se miraba siguió entrenando: se toma la versión nueva y se descartan los cambios.
    state.changesBy.delete(state.choice.signature);
    notice = 'inspect.brain.updated';
  }
  const sameBrain = !firstTime && !resolved.updated && !resolved.removed && resolved.key === state.choice.key;
  const carSpeed = store?.get().carSpeed;
  const keptSettings = sameBrain ? { ...state.settings, ...(carSpeed ? { maxSpeed: carSpeed } : {}) } : null;
  const sameSpeed = !carSpeed || carSpeed === state.settings?.maxSpeed;
  if (sameBrain && sameSpeed && state.live && state.live.signature === state.choice.signature) restoreLive();
  else load(resolved.key, { settings: keptSettings });
  // La primera vez arranca reproduciendo; al volver, como se dejó (sin avanzar mientras no estaba a la vista).
  if (firstTime || state.wasPlaying) playback.play();
  buildOverlay();
  focusNeuron(state.selected, { focus: false });
  sync();
  draw();
  loop.start();
  if (resolved.updated) announce(t(notice));

  return {
    loop, inspector, table, sceneView, card, placeOverlay,
    draw, sync,
    /** Avanza `frames` cuadros como lo haría el bucle reproduciendo (verificación desde la consola). */
    advance(frames) { for (let k = 0; k < frames; k++) tick(); draw(); },
    get world() { return world; },
    get cursor() { return cursor; },
    /** Animación del paso en curso, o null (verificación desde la consola). */
    get animation() { return animation; },
    get changes() { return changes; },
    get brain() { return brain; },
    get state() { return state; },
    get playback() { return playback; },
    play, pause, stepOnce, restart, setSize, select, choose, undo, resetNetwork, toggleNeuron, setWeight, setBias, setManual, toggleLayer, toggleAll,
    unmount() {
      keepChanges();
      state.wasPlaying = playback.playing;
      playback.pause();
      if (playback.size === 'frame') cursor.complete();
      loop.dispose();
      offLanguage();
      offLibrary();
      offStore();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      for (const zone of [stage, board, panel, bar]) zone?.removeEventListener('click', onClick);
      picker.dispose();
      scenario.dispose();
      description.dispose();
      inspector.dispose();
      table.dispose();
      sceneView.dispose();
      stage.classList.remove('inspect-stage');
    },
  };
}
