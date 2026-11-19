// Etapa 3b de la V2, "Aprender · Por gradiente" (tareas 15.2 y 15.3; maqueta #gradiente de D, aprobada por el dueño
// el 19 de noviembre de 2026). Copia para la V2 de la pestaña Laboratorio de la V1 (src/tabs/lab/index.js), con la
// misma conducta y otro lugar para cada pieza: la red en la zona de la escena; a su costado, la placa con los tres
// experimentos y los datos (el plano con el punto de prueba, la tabla de verdad o la escena de tu manejo); debajo de
// la red, el ejemplo en curso y las curvas; la reproducción en la banda; y el panel y la barra de datos repartidos
// en las hojas Etapa, Datos, Red y Aprendizaje. La lógica es la de la V1 sin cambios (core/, render/ y tabs/lab/).
import { createWorld } from '../../../core/world.js';
import { computeNetwork, copyNetwork } from '../../../core/network.js';
import { forwardSoft, bakeOff, evaluate, neuronGrid } from '../../../core/backprop.js';
import { overfitting } from '../../../core/overfitting.js';
import { createRecorder, DRIVING_OUTPUTS, summary, POINT_SHAPES, GATES, gatesDataset, POINT_LIMITS, HOLDOUT_LIMITS, evaluatedRows, filterRows, SPIRAL_TURNS } from '../../../core/datasets.js';
import { createBrain } from '../../../core/brain.js';
import { DEFAULT_SENSORS } from '../../../core/sensors.js';
import { LEARNING_STEP_SIZES } from '../../../core/learning-cursor.js';
import { TRACK_IDS } from '../../../core/circuits.js';
import { STEP } from '../../../core/constants.js';
import { topConnections } from '../../../core/network-changes.js';
import { createStageView } from '../../../render/view.js';
import { createNetworkInspector, sameTarget } from '../../../render/network-inspector.js';
import { neighborOf } from '../../../render/inspector-layout.js';
import { createWeightTable } from '../../../render/weight-table.js';
import { createPlaneView, PLANE_GRID, PLANE_FPS, mapShade, brightestRegion, PROBE, planeToPx, pxToPlane, nudgeProbe, probeLabelBox, probeAnswer } from '../../../render/plane-view.js';
import { createLoop } from '../../../ui/loop.js';
import { formatValue } from '../../../ui/i18n.js';
import { currentMission } from '../../../ui/current-mission.js';
import { missionTarget } from '../../../ui/mission-targets.js';
import { createKeyboardController } from '../../../input/keyboard.js';
import { ACTIONS } from '../../../tabs/shared/driving-logic.js';
import { normalizeSettings as normalizeStreet, SLIDERS as STREET_SLIDERS, LANE_OPTIONS } from '../../../tabs/shared/street-settings.js';
import { EXAMPLE_BRAINS } from '../../../data/example-brains.js';
import { listBrains, PICKER_GROUPS, trainedTracks } from '../../../tabs/inspect/brains.js';
import { createLabSession, rateToSlider, sliderToRate, DRIVING_DEFAULTS } from '../../../tabs/lab/session.js';
import { createLabPlayback, PACES, isRunning, kindPlayback } from '../../../tabs/lab/playback.js';
import { createLearningAnimation, stepDuration } from '../../../tabs/lab/step-animation.js';
import { describeLearningStep, whereText, layerName, neuronName, errorTrend } from '../../../tabs/lab/describe.js';
import { createLabMissions, MISSION_IDS, GATE_MISSION_IDS } from '../../../tabs/lab/missions.js';
import { gateSolution, solutionShapeOk } from '../../../tabs/lab/gate-solutions.js';
import { shortcutFor } from '../../../tabs/lab/shortcuts.js';
import { LAB_NETWORK_LIMITS, LAB_ACTIVATIONS, DATA_KINDS } from '../../../tabs/lab/defaults.js';
import { createHandFirst, handFirstNow } from '../../../tabs/lab/hand-first.js';
import { el, setData, tr } from '../../dom.js';
import { createTextSetter } from '../../components/legacy.js';
import { createPicker } from '../../components/picker.js';
import { createFitnessChart } from '../../components/chart.js';
import { missionNote, term } from '../../components/controls.js';
import { actionBlock } from '../../legacy/driving-cards.js';
import { createDataTable } from '../../legacy/data-table.js';
import { createTruthTable, truthRows } from '../../legacy/truth-table.js';
import { createCompactNeuronCard, weightRange } from '../../legacy/neuron-card.js';
import { createResponseCurve } from '../../legacy/response-curve.js';
import { createConnectionDetail } from '../../legacy/connection-detail.js';
import { createWeightHistory } from '../../legacy/weight-history.js';
import { roleTag } from '../../legacy/role-tag.js';
import { netBar } from '../../legacy/net-bar.js';
import { createChangesStrip } from '../../legacy/changes-strip.js';

/** Gesto de un deslizador (la regla de scenario-bar.js de la V1): mientras se arrastra solo cambia el valor; al soltar, rige. */
function createSliderGesture(onValue) {
  let active = false;
  return {
    input(v) { active = true; onValue(v, { final: false }); },
    change(v) { active = false; onValue(v, { final: true }); },
    get active() { return active; },
  };
}
/** Un grupo con su nombre (en lugar de los grupos de la barra de escenario de la V1). */
function barGroupNode({ id, labelKey, labelId, help }, ...children) {
  // El tooltip va en el nombre (su marca en la esquina no sale del grupo, que puede ir pegado al borde de la placa).
  return el('div', { class: `v2-setting v2-wide lab-group lab-group-${id}` },
    el('span', { class: 'v2-setting-name', help, attrs: { id: labelId } }, el('span', { i18n: labelKey })), ...children);
}

/** Con tu manejo, el error de ahora (D11) se mide sobre una muestra fija de hasta tantos ejemplos. */
export const ERROR_SAMPLE_MAX = 500;
/** Semilla del tráfico de la escena (con tu manejo). */
export const SEED = 1;
/** Cuadros que se ve el choque antes de volver a salir. */
export const RETRY_TICKS = 60;
export const FILTERS = Object.freeze(['all', 5, 3, 1]);
export const VIEWS = Object.freeze(['diagram', 'table', 'data']);
/** Con la tabla de datos abierta y el aprendizaje corriendo, se recalcula como mucho 5 veces por segundo (D14). */
export const DATA_TABLE_INTERVAL_MS = 200;
/** Mismos anchos que Inspeccionar (red-al-centro D2): la misma preferencia, así la red mide lo mismo en las dos. */
/** Pastillas de peso y de sesgo con compuertas (red-al-centro D8): por lo menos 24 px de alto, con ▲▼ a la izquierda. */
export const GATE_KNOB = Object.freeze({ w: 56, h: 26 });
/** El fondo del plano se recalcula como mucho 15 veces por segundo (plane-view.js). */

// --- Estado conservado entre montajes ------------------------------------------------------------
let state = null;
const completedMissions = new Set();

/** Olvida el estado conservado (para pruebas). */
export function resetState() { state = null; }

const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
const pct = (x) => (x === null || x === undefined ? '–' : `${Math.round(x * 100)} %`);

export function mount({ zones, notebook, i18n, scenery = null, library = null }) {
  const { plate, band, zone } = zones;
  const doc = zones.scene.ownerDocument;
  const win = doc.defaultView;
  const document = doc; // la copia de la V1 usa `document` y `window`: los de la página de la etapa
  const window = win;
  const reportError = (err) => console.error(err);
  let visible = false;
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
      playback: null,
      view: 'diagram',
      filter: 'all',
      collapsed: [],
      shapeKey: '',
      selected: null, // el Laboratorio abre sin neurona elegida (D15)
      missions: createLabMissions({ completed: completedMissions }),
      recorder: createRecorder({ sensors: DEFAULT_SENSORS }),
      wasPlaying: false, // abre en pausa: nada aprende sin pedirlo (laboratorio-empieza-por-compuertas D4)
      saveNotice: null,
      lastPoints: null,
      dataFilter: { failing: false, group: 'all' },
      selectedRow: null,
      handFirst: createHandFirst(), // a mano primero en Compuertas (red-al-centro D8)
    };
  }
  state.handFirst ??= createHandFirst();
  const session = state.session;
  if (!state.playback) state.playback = createLabPlayback(kindPlayback(session.kind));
  const playback = state.playback;
  playback.pause();

  // --- Estado de la vista (no se conserva) ---------------------------------------------------------
  let animation = null;
  let lastStep = null; // { units, detail, size }
  let announcedAppearances = 0;
  let version = -1;
  let changesVersion = 0;
  let hovered = null; // neurona o conexión bajo el cursor (vista previa del plano, D12)
  // La persona movió el punto de prueba con un ejemplo a medio corregir: la red muestra el punto hasta
  // el paso siguiente (punto-de-prueba D5). Es solo vista: no toca el aprendizaje.
  let probeView = false;
  // Durante un gesto de perilla, el fondo del plano se repinta en cada cuadro (D11).
  let liveGesture = false;
  // Mapas de las neuronas (D12): la grilla de 50 × 50 que pinta el plano, una vez para todas las
  // neuronas, recalculada como mucho 15 veces por segundo, cuando la red cambia.
  const maps = { key: null, at: -Infinity, grid: null, canvases: [] };
  function refreshMaps() {
    if (!hasPlane()) return null;
    const key = `${session.version}:${changesVersion}:${run().network.sizes.join('-')}`;
    const now = performance.now();
    if (maps.grid && (key === maps.key || (!liveGesture && now - maps.at < 1000 / PLANE_FPS)) && maps.grid.layers.length === run().network.sizes.length) return maps;
    const net = run().network;
    maps.grid = neuronGrid(net, PLANE_GRID, run().off, session.range);
    maps.key = key;
    maps.at = now;
    maps.canvases = maps.grid.layers.map((layer, l) => (!layer || l === net.sizes.length - 1 ? null : layer.map((values, j) => {
      const c = maps.canvases[l]?.[j] ?? Object.assign(document.createElement('canvas'), { width: PLANE_GRID, height: PLANE_GRID });
      plane.paintMap(c, values, mapToY(values));
      return c;
    })));
    return maps;
  }
  /** Escala de un mapa de neurona oculta a la del plano (ReLU, relativa a su mayor valor). */
  function mapToY(values) {
    const act = run().network.activation;
    let max = 0;
    if (act === 'relu') for (const v of values) if (v > max) max = v;
    return (v) => mapShade(v, act, max);
  }
  let recording = false;
  let world = null;
  let worldKey = '';
  let crashTicks = 0;
  let recordStarted = false;
  const keyboard = createKeyboardController();
  const run = () => session.run;
  const ctx = () => ({ kind: session.kind, sizes: run().network.sizes });
  // Con compuertas y con puntos hay plano (y punto de prueba); con tu manejo, la escena.
  const hasPlane = () => session.kind !== 'driving';
  const isGates = () => session.kind === 'gates';

  // ==================================================================================================
  // Zona izquierda: la red
  // ==================================================================================================
  const netTitle = el('h2', { class: 'inspect-net-title', attrs: { id: 'lab-net-title' } });
  const viewButtons = VIEWS.map((v) => el('button', {
    class: 'v2-segment', i18n: v === 'data' ? 'lab.view.data' : `inspect.view.${v}`, help: v === 'data' ? 'lab.view.data' : `inspect.view.${v}`,
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { view: v },
    on: { click: () => { state.view = v; layoutKey = ''; sync(); } },
  }));
  const viewGroup = el('div', { class: 'v2-segments inspect-views', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.view.label' }, viewButtons);
  const filterButtons = FILTERS.map((f) => el('button', {
    class: 'v2-segment', i18n: f === 'all' ? 'inspect.filter.all' : 'inspect.filter.n', params: f === 'all' ? undefined : { value: f },
    help: f === 'all' ? 'inspect.filter.all' : `inspect.filter.${f}`,
    i18nAttr: f === 'all' ? undefined : 'aria-label:inspect.filter.nLabel',
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { filter: String(f) },
    on: { click: () => { state.filter = f; sync(); } },
  }));
  const filterGroup = el('div', { class: 'v2-segments inspect-filter' }, filterButtons);
  const collapseAll = el('button', { class: 'v2-btn v2-small inspect-collapse-all', attrs: { type: 'button' }, on: { click: () => toggleAll() } });
  // Cambios a mano (D15 y D16): el contador, "Deshacer" y "Restablecer la red", en el lugar de Inspeccionar.
  const changesCount = el('span', { class: 'inspect-changes net-changes-count', attrs: { role: 'status' } });
  const undoButton = el('button', { class: 'v2-btn v2-small inspect-undo', i18n: 'inspect.undo', attrs: { type: 'button' }, on: { click: () => undoManual() } });
  const resetChangesButton = el('button', { class: 'v2-btn v2-small inspect-reset', i18n: 'inspect.resetNetwork', attrs: { type: 'button' }, on: { click: () => resetManual() } });
  const zoomOut = el('button', { class: 'v2-btn v2-small inspect-zoom', i18n: 'camera.zoomOut', help: 'inspect.zoomOut', i18nAttr: 'aria-label:camera.zoomOut.label', attrs: { type: 'button' }, on: { click: () => inspector.zoomOut() } });
  const zoomIn = el('button', { class: 'v2-btn v2-small inspect-zoom', i18n: 'camera.zoomIn', help: 'inspect.zoomIn', i18nAttr: 'aria-label:camera.zoomIn.label', attrs: { type: 'button' }, on: { click: () => inspector.zoomIn() } });
  const zoomReset = el('button', { class: 'v2-btn v2-small inspect-zoom-reset', i18n: 'inspect.zoomReset', help: 'inspect.zoomReset', attrs: { type: 'button' }, on: { click: () => inspector.resetView() } });
  const zoomGroup = el('div', { class: 'inspect-zoom-group', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.zoom.label' }, zoomOut, zoomIn, zoomReset);
  // La barra de arriba de la red en tres grupos, como en Inspeccionar (red-al-centro D3); la Vista suma Datos.
  const netBarParts = netBar({
    title: netTitle, idPrefix: 'lab',
    groups: [
      { id: 'view', labelKey: 'net.bar.view', children: [viewGroup] },
      { id: 'links', labelKey: 'net.bar.links', help: 'inspect.filter', children: [filterGroup, collapseAll] },
      { id: 'zoom', labelKey: 'net.bar.zoom', children: [zoomGroup] },
    ],
  });
  const controls = netBarParts.node;
  // Los cambios a mano, en la franja que aparece solo con cambios, en el lugar que tiene en Inspeccionar.
  const changesStrip = createChangesStrip({ text: changesCount, buttons: [undoButton, resetChangesButton], label: 'lab.changes.label' });
  let netDragging = false; // un arrastre de una pastilla sobre la red: la franja no aparece hasta soltar

  const area = el('div', {
    class: 'inspect-area', attrs: { role: 'group', 'aria-labelledby': 'lab-net-title' },
    on: { keydown: (e) => { if (e.key === 'Escape' && state.selected && !dataZone.contains(e.target)) { e.preventDefault(); e.stopPropagation(); deselect(); } } },
  });
  const diagram = el('div', { class: 'inspect-diagram' });
  const tableZone = el('div', { class: 'inspect-table-zone' });
  const dataZone = el('div', { class: 'inspect-table-zone lab-data-zone' });
  area.append(diagram, tableZone, dataZone);
  const dataTable = createDataTable({
    container: dataZone, i18n,
    onSelect: (index) => { state.selectedRow = index; dataKey = ''; },
    onFilter: (f) => { state.dataFilter = { ...state.dataFilter, ...f }; dataKey = ''; dataTable.resetScroll(); sync(); },
  });
  const inspector = createNetworkInspector({
    container: diagram, i18n,
    onSelect: (target) => select(target),
    onViewChange: () => { layoutKey = ''; },
    onHover: (h) => { hovered = h; },
    // Pastilla sobre la conexión elegida (D8): un arrastre es un solo cambio a mano, que se deshace.
    onPill: {
      change: (value, info) => {
        const sel = state.selected;
        if (!sel || sel.input === undefined) return;
        netDragging = Boolean(info.gesture);
        manualChange(() => run().setWeight(sel.layer, sel.neuron, sel.input, value), info.gesture);
      },
      end: () => { session.manual.end(); netDragging = false; sync(); },
    },
    // Perillas sobre la red (laboratorio-empieza-por-compuertas D5): cada peso o sesgo es un cambio a mano
    // (un arrastre, uno solo); las entradas mueven el punto de prueba y no cambian la red.
    onKnob: {
      change: (target, value, info) => {
        liveGesture = Boolean(info.gesture);
        netDragging = liveGesture;
        manualChange(() => (target.bias ? run().setBias(target.layer, target.neuron, value) : run().setWeight(target.layer, target.neuron, target.input, value)), info.gesture, target);
      },
      input: (i, value) => {
        const p = session.probe;
        moveProbe(i === 0 ? { x: value, y: p.y } : { x: p.x, y: value }, { announceIt: false });
      },
      end: () => {
        session.manual.end();
        netDragging = false;
        sync();
        if (liveGesture) { liveGesture = false; planeForce = true; }
        if (errorCompare) announce(errorCompareText());
      },
    },
  });
  // "Arrastrá un peso ↕" (red-al-centro D8): con compuertas y la guía, junto a la primera pastilla de peso, hasta
  // el primer cambio a mano. Es una marca visual: la consigna dice lo mismo para el lector de pantalla.
  const dragHint = el('p', { class: 'v2-guide-only lab-drag-hint', i18n: 'lab.dragHint', attrs: { 'aria-hidden': 'true' } });
  dragHint.hidden = true;
  let dragHintKey = '';
  /** Pone la marca junto a la primera pastilla de peso (en las coordenadas de la capa de la red). */
  function placeDragHint() {
    const knob = isGates() && !state.handFirst.touched && state.view === 'diagram' && !recording
      ? diagram.querySelector('.inspector-knob[data-knob-kind="weight"]:not([hidden])') : null;
    const m = knob ? /translate\((-?[\d.]+)px, (-?[\d.]+)px\)/.exec(knob.style.transform) : null;
    if (dragHint.hidden !== !m) dragHint.hidden = !m;
    if (!m) { dragHintKey = ''; return; }
    if (m[0] === dragHintKey) return;
    dragHintKey = m[0];
    // A la izquierda de la pastilla, sobre su línea: del lado de las entradas hay lugar y no tapa la salida.
    dragHint.style.transform = `translate(${Math.round(Number(m[1]) - GATE_KNOB.w / 2 - 8)}px, ${Math.round(Number(m[2]))}px) translate(-100%, -50%)`;
  }
  const headerLayer = el('div', { class: 'inspect-headers' });
  const neuronLayer = el('div', { class: 'inspect-neurons', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.neurons.label', on: { keydown: (e) => onNeuronKey(e) } });
  inspector.overlay.append(headerLayer, neuronLayer, dragHint);
  let headerButtons = [];
  // Rótulo "Entra" de las entradas del diagrama (sistema-de-diseno-base 5.2): debajo de la cabecera de la capa 0.
  // "Decide", debajo de la cabecera de la primera capa que calcula (la oculta, o la de salida si no hay).
  const inputTag = roleTag('in');
  const decideTag = roleTag('decide', { which: 'network' });
  i18n.translateTree(inputTag);
  i18n.translateTree(decideTag);
  let tableHeaders = [];
  let neuronButtons = [];
  const nameOf = (l, j) => neuronName(t, ctx(), l, j);
  /** "Oculta 1 · neurona 2": la capa y la neurona, para el rótulo del plano. */
  const placeNameOf = (l, j) => `${layerName(t, l, run().network.sizes.length)} · ${nameOf(l, j)}`;
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
    headerLayer.append(inputTag, decideTag);
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
    focusNeuron(state.selected ?? { layer: 1, neuron: 0 }, { focus: false });
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
  /** Elegir una neurona abre su tarjeta; elegir la misma otra vez la cierra (D15). */
  function select(target) {
    if (!target) { if (state.selected) deselect(); return; }
    const same = sameTarget(state.selected, target);
    state.selected = same ? null : { layer: target.layer, neuron: target.neuron, ...(target.input !== undefined ? { input: target.input } : {}) };
    focusNeuron(target, { focus: false });
    neuronButtons.forEach((row, l) => row.forEach((b, j) => labelNeuron(b, l, j)));
    const p = state.selected;
    if (!p) announce(t('inspect.announce.cleared'));
    else if (p.input === undefined) announce(t('inspect.announce.selected', { name: nameOf(p.layer, p.neuron).replace(/^./, (c) => c.toUpperCase()) }));
    else announce(t('inspect.announce.selectedLink', { from: nameOf(p.layer - 1, p.input), to: nameOf(p.layer, p.neuron) }));
    sync();
  }
  function deselect() {
    const was = state.selected;
    state.selected = null;
    announce(t('inspect.announce.cleared'));
    sync();
    if (was) neuronButtons[was.layer]?.[was.neuron]?.focus({ preventScroll: true });
  }
  /** Con puntos, dónde se enciende más una neurona oculta (lo que el mapa dice con color, D12). */
  function mapRegionText(l, j) {
    const values = hasPlane() && l > 0 && l < run().network.sizes.length - 1 ? maps.grid?.layers[l]?.[j] : null;
    return values ? `. ${t('lab.aria.map', { where: t(`lab.region.${brightestRegion(values, PLANE_GRID)}`) }).replace(/^./, (c) => c.toUpperCase())}` : '';
  }
  function labelNeuron(b, l, j) {
    const shown = displayed.trace;
    const n = shown?.layers[l]?.neurons[j];
    const c = displayed.cursor;
    const value = !n ? '–' : l === 0 || !c || c.opsDone(l, j) === 4 ? fmt(n.output) : t('inspect.aria.pending');
    const blame = displayed.learning?.blame(l, j);
    const extra = (blame === null || blame === undefined ? '' : `. ${t('lab.aria.blame', { value: fmt(blame) })}`)
      + (run().isOff(l, j) ? `. ${t('inspect.aria.off').replace(/^./, (c) => c.toUpperCase())}` : '')
      + (inspector.flickering({ layer: l, neuron: j }) ? `. ${t('inspect.aria.flicker').replace(/^./, (c) => c.toUpperCase())}` : '')
      + mapRegionText(l, j);
    const label = t('inspect.aria.neuron', { layer: layerName(t, l, run().network.sizes.length), name: nameOf(l, j), value }) + extra;
    if (b.getAttribute('aria-label') !== label) b.setAttribute('aria-label', label);
    b.setAttribute('aria-pressed', String(Boolean(state.selected) && state.selected.layer === l && state.selected.neuron === j));
  }

  // Operación en curso y reproducción (D11)
  const opText = el('p', { class: 'lab-op-text' });
  const opNote = el('p', { class: 'lab-op-note muted', i18n: 'inspect.card.rounding' });
  // Leyenda de la vuelta (D10): cada marca con su forma, y los términos con su tooltip.
  const legend = el('p', { class: 'lab-legend muted' },
    el('span', { class: 'lab-legend-item lg-blame', i18n: 'lab.legend.blame', help: 'lab.term.blame' }),
    el('span', { class: 'lab-legend-item', i18n: 'lab.legend.slope', help: 'lab.term.slope' }),
    el('span', { class: 'lab-legend-item', i18n: 'lab.legend.change' }),
    el('span', { class: 'lab-legend-item', i18n: 'lab.legend.back' }));
  // Lo que titubea (sin-destellos-en-la-red D4): aprendiendo de corrido es lo único de la leyenda que sirve.
  const flickerLegend = el('span', { class: 'lab-legend-item lab-legend-flicker', i18n: 'lab.legend.flicker', help: 'flicker', attrs: { tabindex: '0' } });
  legend.append(flickerLegend);
  const opBody = el('div', { attrs: { 'aria-hidden': 'true' } }, opText, opNote);
  const opStrip = el('div', { class: 'lab-op' }, opBody, legend);
  const playButton = el('button', { class: 'v2-btn v2-small inspect-play', attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: () => togglePlay() } });
  // Acción principal (jerarquia-de-botones D3): en esta pestaña es siempre la marcha.
  // La acción principal se aplica en sync: en Compuertas, mientras se resuelve a mano, no hay (red-al-centro D8).
  const stepButton = el('button', { class: 'v2-btn v2-small inspect-step', i18n: 'inspect.step', help: 'lab.step', attrs: { type: 'button' }, on: { click: () => stepOnce() } });
  const sizeButtons = LEARNING_STEP_SIZES.map((s) => el('button', {
    class: 'v2-segment', i18n: `lab.size.${s}`, help: `lab.size.${s}`,
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { size: s, focus: 'keep' },
    on: { click: () => setSize(s) },
  }));
  const sizeGroup = el('div', { class: 'inspect-size', attrs: { role: 'group', 'aria-labelledby': 'lab-size-label' } },
    el('span', { class: 'inspect-label', i18n: 'inspect.size.label', help: 'lab.size', attrs: { id: 'lab-size-label' } }),
    el('div', { class: 'v2-segments' }, sizeButtons));
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
  const netZone = el('div', { class: 'inspect-net' }, controls, area, opStrip);
  controls.append(changesStrip.node); // la franja va dentro de la barra de arriba de la red, debajo de los grupos
  zone.classList.add('v2-zone-net', 'v2-zone-lab');
  zones.scene.append(netZone);
  band.append(playbar);

  // ==================================================================================================
  // Tablero: datos, ejemplo en curso y curvas
  // ==================================================================================================
  const planeBox = el('div', { class: 'lab-plane', attrs: { role: 'group' } });
  const plane = createPlaneView({ container: planeBox });
  // Punto de prueba (punto-de-prueba D2 y D3): un marcador HTML sobre el plano, con foco, tooltip y un
  // agarre de 28 px. Se arrastra, se pone con un clic en el plano o se mueve con las flechas. La red no
  // aprende de él. data-focus="keep": el clic no devuelve el foco al escenario.
  const probeMarker = el('button', {
    class: 'plane-probe', help: 'lab.probe', i18nAttr: 'aria-label:lab.probe.name', dataset: { focus: 'keep' },
    attrs: { type: 'button', 'aria-describedby': 'lab-probe-desc' },
  }, el('span', { class: 'plane-probe-mark', attrs: { 'aria-hidden': 'true' } }));
  const probeLabel = el('span', { class: 'plane-probe-label', attrs: { 'aria-hidden': 'true' } });
  const probeDesc = el('span', { class: 'v2-sr-only', attrs: { id: 'lab-probe-desc' } });
  planeBox.append(probeMarker, probeLabel, probeDesc);
  let probeDrag = null; // pointerId mientras se arrastra
  /** La persona movió el punto: la red lo muestra (D5); si estaba en un ejemplo a medio corregir, solo cambia la vista. */
  function moveProbe(p, { announceIt = false } = {}) {
    if (!hasPlane()) return;
    const changed = session.setProbe(p);
    if (!(playback.playing && isRunning(playback.size))) probeView = true;
    if (changed || announceIt) draw();
    if (announceIt) announce(probeText());
  }
  const probeAt = (e) => {
    const box = planeBox.getBoundingClientRect();
    return pxToPlane(plane.geometry, e.clientX - box.left, e.clientY - box.top);
  };
  planeBox.addEventListener('pointerdown', (e) => {
    if (!hasPlane() || e.button !== 0) return;
    // Un clic en el plano lleva el punto ahí (D3, WCAG 2.5.7); sobre el marcador, lo agarra. Las dos cosas
    // siguen como arrastre mientras el botón esté apretado.
    e.preventDefault();
    if (e.target !== probeMarker && !probeMarker.contains(e.target)) moveProbe(probeAt(e));
    probeDrag = e.pointerId;
    planeBox.setPointerCapture?.(e.pointerId);
    probeMarker.focus({ preventScroll: true });
    setData(planeBox, 'dragging', 'true');
  });
  planeBox.addEventListener('pointermove', (e) => { if (probeDrag === e.pointerId) moveProbe(probeAt(e)); });
  const endProbeDrag = (e) => {
    if (probeDrag !== e.pointerId) return;
    probeDrag = null;
    setData(planeBox, 'dragging', 'false');
    announce(probeText()); // al soltar, no en cada píxel del arrastre
  };
  planeBox.addEventListener('pointerup', endProbeDrag);
  planeBox.addEventListener('pointercancel', endProbeDrag);
  probeMarker.addEventListener('keydown', (e) => {
    const next = nudgeProbe(session.probe, e.key, e.shiftKey, session.range);
    if (!next) return;
    e.preventDefault();
    e.stopPropagation();
    moveProbe(next, { announceIt: true });
  });
  /** Lo que contesta la red en el punto, en palabras (para el lector y la franja). */
  function probeText() {
    const p = session.probe;
    const ans = probeAnswer(run().network, p.x, p.y, run().off);
    if (isGates()) return t('lab.probe.say.gates', { x: fmt(p.x), y: fmt(p.y), reply: gateReply(ans.value) });
    return t('lab.probe.say', { x: fmt(p.x), y: fmt(p.y), answer: t(`lab.class.${ans.cls}`), pct: Math.round(ans.confidence * 100) });
  }
  /** Con compuertas, la respuesta se dice sí o no; exactamente 0,5 no se decide (D6). */
  const verdictOf = (v) => (v > 0.5 ? 'yes' : v < 0.5 ? 'no' : 'undecided');
  /** "la red contesta sí (círculo), 97 % segura" o "la red no se decide". */
  function gateReply(v) {
    const k = verdictOf(v);
    return k === 'undecided' ? t('lab.gates.reply.undecided') : t('lab.gates.reply', { answer: t(`lab.gates.${k}`), pct: Math.round(Math.max(v, 1 - v) * 100) });
  }
  /** Rótulo corto: "sí · 97 %", "no · 88 %" o "no se decide". */
  function gateShort(v) {
    const k = verdictOf(v);
    return k === 'undecided' ? t('lab.gates.undecided') : t('lab.probe.label', { answer: t(`lab.gates.${k}`), pct: Math.round(Math.max(v, 1 - v) * 100) });
  }
  let probeLabelKey = '';
  /** Marcador y rótulo en su lugar (D4): el rótulo dice lo que contesta la red, o lo que da la neurona elegida. */
  function placeProbe(r, focus, dim) {
    const on = hasPlane();
    show(probeMarker, on);
    show(probeLabel, on);
    if (!on) return;
    const g = plane.geometry;
    const p = session.probe;
    const at = planeToPx(g, p.x, p.y);
    setData(planeBox, 'gates', String(isGates()));
    const grab = probeMarker.offsetWidth || PROBE.grab;
    probeMarker.style.transform = `translate(${(at.x - grab / 2).toFixed(1)}px, ${(at.y - grab / 2).toFixed(1)}px)`;
    setData(probeMarker, 'dim', String(Boolean(dim)));
    let text;
    if (focus) {
      const n = forwardSoft(r.network, [p.x, p.y], r.off).trace.layers[focus.layer].neurons[focus.neuron];
      text = t('lab.probe.neuron', { name: nameOf(focus.layer, focus.neuron), value: fmt(n.output) });
    } else {
      const ans = probeAnswer(r.network, p.x, p.y, r.off);
      text = isGates() ? gateShort(ans.value) : t('lab.probe.label', { answer: t(`lab.class.${ans.cls}`), pct: Math.round(ans.confidence * 100) });
    }
    write(probeLabel, text);
    const key = `${text}|${at.x.toFixed(1)}|${at.y.toFixed(1)}|${g.side}`;
    if (key !== probeLabelKey) {
      probeLabelKey = key;
      // Con compuertas, el rótulo no tapa ninguno de los cuatro casos (el de abajo del punto ya lo rodea el aro).
      const avoid = isGates() ? session.data.examples.map((ex) => ({ ...planeToPx(g, ex.inputs[0], ex.inputs[1]), r: 14 })).filter((c) => Math.hypot(c.x - at.x, c.y - at.y) > 1) : [];
      const b = probeLabelBox(g, at.x, at.y, probeLabel.offsetWidth, probeLabel.offsetHeight, isGates() ? 18 : PROBE.radius, avoid);
      probeLabel.style.transform = `translate(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px)`;
    }
    write(probeDesc, probeText());
  }
  const scene = el('div', { class: 'inspect-scene lab-scene' });
  // Con tu manejo, la escena con la cámara del escenario grande y el encuadre de los rayos (red-al-centro D2).
  const sceneView = createStageView({ container: scene, store: scenery, doc, framing: 'rays', resetKey: false });
  const recordText = el('span', { class: 'lab-record-text' });
  const finishButton = el('button', { class: 'v2-btn lab-finish', i18n: 'lab.record.finish', help: 'lab.record.finish', attrs: { type: 'button' }, on: { click: () => stopRecording() } });
  const recordBadge = el('div', { class: 'v2-badge lab-record-badge', attrs: { role: 'status' } }, recordText, finishButton);
  const crashBadge = el('div', { class: 'v2-badge crash-badge', attrs: { role: 'status' }, i18n: 'inspect.crash' });
  sceneView.corner.append(recordBadge, crashBadge);
  sceneView.corner.classList.add('inspect-scene-badges');
  const sceneDescText = el('p', { class: 'v2-sr-only', attrs: { id: 'lab-scene-description', 'data-free-text': '' } });
  scene.append(sceneDescText);
  const sceneDescription = { set: (text) => { if (sceneDescText.textContent !== text) sceneDescText.textContent = text; }, dispose() {} };
  const dataSummary = el('p', { class: 'v2-muted lab-summary' });
  // Tabla de verdad (D6): con compuertas, en el lugar del resumen de los datos. Una fila elegida lleva las
  // entradas (el punto de prueba) a ese caso.
  const truth = createTruthTable({ i18n, onSelect: (i) => { const ex = session.data.examples[i]; if (ex) moveProbe({ x: ex.inputs[0], y: ex.inputs[1] }, { announceIt: true }); } });
  const dataBlock = el('section', { class: 'lab-data', attrs: { 'aria-labelledby': 'lab-data-title' } },
    el('h2', { class: 'v2-sr-only', i18n: 'lab.data.title', attrs: { id: 'lab-data-title' } }), planeBox, scene, truth.node, dataSummary);

  // Ejemplo en curso (D7)
  const exampleText = el('p', { class: 'lab-example-text' });
  const fan = el('div', { class: 'lab-fan', attrs: { 'aria-hidden': 'true' } });
  const actionsExample = actionBlock({ i18n });
  const actionsNet = actionBlock({ i18n });
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
      tick: 'train.chart.tick', xAxis: 'lab.chart.xAxis', yAxis: 'lab.chart.yAxis', readout: 'lab.chart.readout', readoutSingle: 'lab.chart.readout.practice', marker: 'lab.chart.best',
    },
  });
  const stats = el('p', { class: 'lab-stats', help: 'lab.term.epoch' });
  // Error de ahora contra el de antes de mover una perilla (D11): flecha y palabra, sin sumar puntos a la curva.
  const liveError = el('p', { class: 'lab-live-error', help: 'lab.liveError' });
  // El aviso se anuncia una vez por aparición con el anunciador (afterLearning), no con un rol propio.
  const warning = el('p', { class: 'lab-warning', help: 'lab.term.overfitting' });
  const chartText = el('p', { class: 'v2-sr-only', attrs: { id: 'lab-chart-description' } });
  const curves = el('section', { class: 'lab-curves', attrs: { 'aria-labelledby': 'lab-curves-title' } },
    el('h2', { class: 'panel-heading', i18n: 'lab.chart.title', help: 'lab.chart.title', attrs: { id: 'lab-curves-title', tabindex: '0' } }),
    stats, liveError, chartZone, warning, chartText);
  chart.element.setAttribute('aria-describedby', 'lab-chart-description');
  const announcer = el('p', { class: 'v2-sr-only', attrs: { role: 'status', 'aria-live': 'polite' } });
  function announce(text) { announcer.textContent = ''; announcer.textContent = text ?? ''; }
  // Con tu manejo, la curva de respuesta de la neurona elegida va en el tablero (vista-de-la-red D20),
  // debajo de la escena: allá donde con puntos el plano muestra lo que detecta. Solo la elegida.
  const curve = createResponseCurve({
    i18n, idPrefix: 'lab',
    names: (i) => nameOf(0, i),
    shortNames: (i) => (i === run().network.sizes[0] - 1 ? t('inspect.curve.chip.speed') : t('inspect.curve.chip.sensor', { n: i + 1 })),
    onDrag: null,
  });
  const curveHint = el('p', { class: 'v2-guide-only caption lab-curve-hint', i18n: 'lab.curve.hint' });
  const curveBlock = el('div', { class: 'lab-curve-block' }, curve.node, curveHint);
  // La columna de los datos (maqueta #gradiente): la placa con los tres experimentos, el plano, la tabla de verdad o la
  // escena, y la curva de respuesta; debajo de la red, el ejemplo en curso y las curvas.
  const consignaText = el('p', { class: 'v2-consigna' });
  plate.append(consignaText);
  const leftZone = el('div', { class: 'inspect-left v2-net-vignette lab-left' }, plate, dataBlock, curveBlock, announcer);
  zones.scene.parentElement.append(leftZone);
  zones.scene.append(el('div', { class: 'lab-under' }, exampleBlock, curves));
  // La copia de la V1 escribe estos textos con el diccionario al dibujar (encabezados, cuenta, curvas, plano y tabla):
  // son datos para la auditoría de textos de la V2.
  for (const n of [netZone, dataBlock, curveBlock, exampleBlock, curves, playbar]) n.dataset.freeText = '';
  queueMicrotask(() => { for (const n of [teacherName, announcer, recordNotice, saveMessage, card.node, linkDetail.node]) n.dataset.freeText = ''; });
  let curveFit = { key: '', full: 0 };
  /** Forma completa o chica según el lugar que deja el tablero entre la escena y las curvas (D20). */
  function fitCurve(key) {
    if (curve.node.hidden) return;
    const avail = curveBlock.clientHeight;
    if (key !== curveFit.key) {
      curveFit = { key, full: 0 };
      curve.setCompact(false);
    }
    if (!curve.compact) {
      const need = curve.node.scrollHeight;
      curveFit.full = need;
      if (need > avail + 1) curve.setCompact(true);
    } else if (curveFit.full && avail >= curveFit.full) curve.setCompact(false);
  }

  // ==================================================================================================
  // Panel: guía, red, aprendizaje, acciones, tu manejo y misiones (D6)
  // ==================================================================================================
  const intro = el('p', { class: 'v2-guide-only inspect-intro lab-intro' });
  // XOR sin capas ocultas, después de intentarlo (D8): el botón que agrega la capa que hace falta.
  const addHiddenButton = el('button', {
    class: 'v2-btn lab-add-hidden', i18n: 'lab.addHidden', help: 'lab.addHidden', attrs: { type: 'button' },
    on: { click: () => { if (session.setLayers(1)) { restarted(); announce(t('lab.guide.gates.xorHidden')); } } },
  });
  // El texto, plegado (tarjeta-de-consigna D10); "Agregar una capa oculta" queda afuera, a la vista.
  const introBody = el('div', { class: 'v2-more-body', attrs: { hidden: true, id: 'v2-gradiente-more' } }, intro);
  const introButton = el('button', { class: 'v2-more', help: 'stage.more', attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': introBody.id, 'data-v1': 'guide.more' },
    on: { click: () => { const open = introBody.hidden; introBody.hidden = !open; introButton.setAttribute('aria-expanded', String(open)); } } }, el('span', { i18n: 'stage.more' }));
  const introBlock = el('div', { class: 'lab-intro-block' }, el('div', { class: 'v2-guide-only' }, introButton, introBody), addHiddenButton);
  // Red
  const layerButtons = [0, 1, 2, 3].map((n) => el('button', {
    class: 'v2-segment', i18n: 'lab.layers.option', params: { n }, help: 'lab.layers', i18nAttr: 'aria-label:lab.layers.optionLabel',
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { layers: String(n) },
    on: { click: () => { if (session.setLayers(n)) restarted(); } },
  }));
  const layersRow = el('div', { class: 'lab-field' },
    el('span', { class: 'lab-field-name', i18n: 'lab.layers', help: 'lab.layers', attrs: { id: 'lab-layers-label' } }),
    el('div', { class: 'v2-segments', attrs: { role: 'group', 'aria-labelledby': 'lab-layers-label' } }, layerButtons));
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
    class: 'v2-segment', i18n: `inspect.activation.${a}`, help: 'lab.activation',
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { activation: a },
    on: { click: () => { if (session.setActivation(a)) restarted(); } },
  }));
  const activationRow = el('div', { class: 'lab-field' },
    el('span', { class: 'lab-field-name', i18n: 'lab.activation', help: 'lab.activation', attrs: { id: 'lab-activation-label' } }),
    el('div', { class: 'v2-segments', attrs: { role: 'group', 'aria-labelledby': 'lab-activation-label' } }, activationButtons));
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
  // Con compuertas no se aparta nada (D1): el ajuste no sirve y no se muestra.
  const holdoutRow = el('div', { class: 'lab-slider' }, el('label', { class: 'lab-slider-label', attrs: { for: 'lab-holdout' } }, el('span', { i18n: 'lab.holdout' }), holdoutValue), holdoutInput);
  const learnSection = el('section', { class: 'lab-section', attrs: { 'aria-labelledby': 'lab-learn-heading' } },
    el('h2', { class: 'panel-heading', i18n: 'lab.panel.learning', attrs: { id: 'lab-learn-heading' } }),
    el('div', { class: 'lab-slider' }, el('label', { class: 'lab-slider-label', attrs: { for: 'lab-rate' } }, el('span', { i18n: 'lab.rate', help: 'lab.term.rate' }), rateValue), rateInput),
    holdoutRow);
  // Acciones
  const resetWeightsButton = el('button', { class: 'v2-btn', i18n: 'lab.resetWeights', help: 'lab.resetWeights', attrs: { type: 'button' }, on: { click: () => resetWeights() } });
  const resetNetworkButton = el('button', { class: 'v2-btn', i18n: 'lab.resetNetwork', help: 'lab.resetNetwork', attrs: { type: 'button' }, on: { click: () => { session.resetNetwork(); restarted(); } } });
  const saveButton = el('button', { class: 'v2-btn lab-save', i18n: 'lab.save', attrs: { type: 'button' }, on: { click: () => saveBrain() } });
  const saveMessage = el('p', { class: 'v2-muted lab-save-message', attrs: { role: 'status' } });
  // Ver una solución (D9): con compuertas, pesos que aciertan los cuatro casos, como un cambio a mano.
  const solutionButton = el('button', { class: 'v2-btn lab-solution', i18n: 'lab.solution', help: 'lab.solution', attrs: { type: 'button' }, on: { click: () => showSolution() } });
  const actions = el('div', { class: 'lab-actions-panel' }, resetWeightsButton, resetNetworkButton, solutionButton, saveButton);
  // Tu manejo: de quién son los ejemplos
  const teacherName = el('span', { class: 'lab-teacher-name' });
  const changeTeacher = el('button', {
    class: 'v2-btn', i18n: 'inspect.brain.change', help: 'lab.teacher.change',
    attrs: { type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'lab-picker' },
    on: { click: () => picker.toggle({ focus: 'current' }) },
  });
  const recordButton = el('button', { class: 'v2-btn lab-record', i18n: 'lab.record', help: 'lab.record', attrs: { type: 'button' }, on: { click: () => (recording ? stopRecording() : startRecording()) } });
  const useRecordedButton = el('button', { class: 'v2-btn', i18n: 'lab.record.use', help: 'lab.record.use', attrs: { type: 'button' }, on: { click: () => { if (session.chooseRecorded()) restarted(); } } });
  const clearButton = el('button', { class: 'v2-btn', i18n: 'lab.record.clear', help: 'lab.record.clear', attrs: { type: 'button' }, on: { click: () => { const had = session.source === 'recorded'; state.recorder.clear(); session.clearRecorded(); if (had) restarted(); else sync(); } } });
  const recordNotice = el('p', { class: 'v2-muted lab-record-notice', attrs: { role: 'status' } });
  const teacherSection = el('section', { class: 'lab-section lab-teacher', attrs: { 'aria-labelledby': 'lab-teacher-heading' } },
    el('h2', { class: 'panel-heading', i18n: 'lab.panel.examples', attrs: { id: 'lab-teacher-heading' } }),
    el('div', { class: 'lab-teacher-row' }, teacherName, changeTeacher, recordButton),
    el('div', { class: 'lab-actions-panel lab-recorded-actions' }, useRecordedButton, clearButton), recordNotice);
  // Cada fila y la tarjeta escriben la misión con la misma vista (tarjeta-de-consigna D2); sin barra.
  const describeMission = (m) => ({
    done: m.done, nameKey: `lab.mission.${m.id}`,
    statusKey: m.done ? 'train.mission.done' : 'train.mission.pending', fraction: null,
  });
  // Tarjeta de consigna (tarjeta-de-consigna D4): sin marcha, que sigue en la barra de abajo de la red.
  // Al elegir una neurona sigue a la vista; la guía y las misiones ceden su lugar como antes.
  // "Mostrame" (misiones-que-muestran-el-control): con compuertas, según la compuerta y la red (el primer
  // peso, la opción OR o XOR de la barra sin elegirla, o Agregar una capa oculta); con puntos, Paso y
  // «De a: Fase», o Cantidad, Ruido y las capas ocultas; con tu manejo, Guardar como cerebro.
  // Misión de la hoja Etapa con "Mostrame" (misiones-que-muestran-el-control), con la tabla pura de la V1.
  const revealNodes = {
    firstWeight: () => area.querySelector('[data-help="lab.knob.weight"]'),
    gateOr: () => gateOptions.find((b) => b.dataset.gate === 'or'),
    gateXor: () => gateOptions.find((b) => b.dataset.gate === 'xor'),
    addHidden: () => addHiddenButton, step: () => stepButton,
    sizePhase: () => sizeButtons.find((b) => b.dataset.size === 'phase'),
    count: () => countSlider.node, noise: () => noiseSlider.node, hiddenLayers: () => layersRow, saveBrain: () => saveButton,
  };
  const revealState = () => (isGates() ? { gate: session.gate, hiddenLayers: session.settings.hidden.length, addHidden: guideKey() === 'lab.guide.gates.xorLine' } : {});
  function revealTarget() { const m = currentMission(state.missions.missionsFor(session.kind)); return m && !m.allDone ? missionTarget('lab', m.id, revealState()) : null; }
  function revealMission() {
    const target = revealTarget();
    if (!target) return;
    const nodes = target.targets.map((k) => revealNodes[k]?.()).filter(Boolean);
    if (nodes[0]?.closest('.v2-sheet')) notebook.reveal(nodes[0]);
    for (const n of nodes) { n.classList.remove('v2-revealed'); void n.offsetWidth; n.classList.add('v2-revealed'); setTimeout(() => n.classList.remove('v2-revealed'), 2400); }
    (nodes[0]?.matches?.('button, input') ? nodes[0] : nodes[0]?.querySelector?.('button, input'))?.focus({ preventScroll: false });
  }
  const consigna = missionNote({ i18n, onReveal: () => revealMission() });
  consigna.node = consigna.element;
  consigna.element.dataset.v1 = 'mission.reveal';
  const missionRevealButton = consigna.element.querySelector('.v2-tertiary');
  // Misiones
  const missionRows = [...MISSION_IDS, ...GATE_MISSION_IDS].map((id) => ({ id })).map((m) => {
    const status = el('span', { class: 'mission-status' });
    const row = el('li', { class: 'mission inspect-mission' }, el('span', { class: 'mission-name', i18n: `lab.mission.${m.id}` }), status);
    return { id: m.id, row, status };
  });
  const missions = el('section', { class: 'v2-guide-only inspect-missions' },
    el('h2', { class: 'v2-sr-only', i18n: 'lab.missions.title' }),
    el('ol', { class: 'mission-list inspect-mission-list' }, missionRows.map((r) => r.row)));
  const card = createCompactNeuronCard({
    i18n,
    names: (l, j) => nameOf(l, j),
    layerNames: (l) => layerName(t, l, run().network.sizes.length),
    onWeight: (i, v, info) => manualChange(() => run().setWeight(state.selected.layer, state.selected.neuron, i, v), info.gesture),
    onBias: (v, info) => manualChange(() => run().setBias(state.selected.layer, state.selected.neuron, v), info.gesture),
    onGestureEnd: () => session.manual.end(),
    // Deslizador de la entrada x o y: mueve el punto de prueba (punto-de-prueba D3).
    onInput: (i, v) => { const p = session.probe; moveProbe(i === 0 ? { x: v, y: p.y } : { x: p.x, y: v }); },
    onToggleNeuron: () => {
      const { layer, neuron } = state.selected;
      const off = !run().isOff(layer, neuron);
      manualChange(() => run().setOff({ kind: 'neuron', layer, neuron }, off), null);
      announce(t(off ? 'inspect.announce.off' : 'inspect.announce.on', { name: nameOf(layer, neuron) }));
    },
    onToggleConnection: (i) => {
      const { layer, neuron } = state.selected;
      manualChange(() => run().setOff({ kind: 'connection', layer, neuron, input: i }, !run().isOff(layer, neuron, i)), null);
    },
    onClose: () => deselect(),
  });
  // Detalle de una conexión (D7 y D12): el cambio va a la red que aprende y cuenta como un cambio a mano.
  const linkDetail = createConnectionDetail({
    i18n, idPrefix: 'lab', base: 3, names: (l, j) => nameOf(l, j),
    onSelectNeuron: (target) => select(target),
    onWeight: (v, info) => {
      const sel = state.selected;
      if (sel && sel.input !== undefined) manualChange(() => run().setWeight(sel.layer, sel.neuron, sel.input, v), info.gesture);
    },
    onGestureEnd: () => session.manual.end(),
    onToggle: () => {
      const sel = state.selected;
      if (sel && sel.input !== undefined) manualChange(() => run().setOff({ kind: 'connection', layer: sel.layer, neuron: sel.neuron, input: sel.input }, !run().isOff(sel.layer, sel.neuron, sel.input)), null);
    },
  });
  const history = createWeightHistory({ i18n, idPrefix: 'lab' });
  linkDetail.extra.append(history.node);
  // Al final del panel, debajo de las misiones: elegir una neurona no mueve ningún ajuste (D15).
  // Las hojas (maqueta #gradiente): Etapa, Datos, Red y Aprendizaje. Lo que en la V1 iba en la barra de datos se
  // reparte en Etapa (la compuerta o la forma de los puntos) y Datos (cantidad, ruido, apartados, tu manejo).
  const sheetStage = notebook.sheet('etapa', 'gradiente.sheet.stage');
  sheetStage.classList.add('inspect-panel', 'lab-panel');
  const tryThis = el('section', { class: 'v2-group lab-try' }, el('h3', {}, el('span', { i18n: 'level.try' })));
  sheetStage.append(consigna.node, introBlock, tryThis, missions);
  const sheetData = notebook.sheet('datos', 'gradiente.sheet.data');
  sheetData.classList.add('inspect-panel', 'lab-panel');
  const dataGroup = el('section', { class: 'v2-group lab-data-group' }, el('h3', {}, el('span', { i18n: 'gradiente.group.data' })));
  sheetData.append(dataGroup, teacherSection);
  const sheetNet = notebook.sheet('red', 'gradiente.sheet.network');
  sheetNet.classList.add('inspect-panel', 'lab-panel', 'v2-sheet-neuron');
  sheetNet.append(netSection, actions, saveMessage, card.node, linkDetail.node);
  const sheetLearn = notebook.sheet('aprendizaje', 'gradiente.sheet.learning');
  sheetLearn.classList.add('inspect-panel', 'lab-panel');
  sheetLearn.append(learnSection,
    term({ termKey: 'term.epoch', defKey: 'term.epoch.def' }), term({ termKey: 'term.rate', defKey: 'term.rate.def' }),
    term({ termKey: 'term.weight', defKey: 'term.weight.def' }), term({ termKey: 'term.bias', defKey: 'term.bias.def' }));
  holdoutRow.remove();
  dataGroup.append(holdoutRow, term({ termKey: 'term.heldOut', defKey: 'term.heldOut.def' }));

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
  // Los tres experimentos (red-al-centro D7): opciones grandes y numeradas, con su nombre y para qué son. Con las
  // flechas el foco pasa de uno a otro; Enter o espacio lo elige.
  const kindButtons = DATA_KINDS.map((k, n) => el('button', {
    class: 'lab-experiment', help: `lab.kind.${k}`,
    attrs: { type: 'button', role: 'radio', 'aria-checked': 'false' }, dataset: { kind: k, step: String(n + 1) },
    on: { click: () => setKind(k) },
  }, el('span', { class: 'lab-experiment-name', i18n: `lab.kind.${k}` }), el('span', { class: 'lab-experiment-line', i18n: `lab.kind.${k}.line` })));
  function onKindKey(e) {
    const i = kindButtons.indexOf(document.activeElement);
    if (i < 0) return;
    const n = kindButtons.length;
    const to = { ArrowRight: (i + 1) % n, ArrowDown: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, ArrowUp: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    kindButtons.forEach((b, k) => b.setAttribute('tabindex', k === to ? '0' : '-1'));
    kindButtons[to].focus();
  }
  const kindGroup = barGroupNode({ id: 'lab-kind', labelKey: 'lab.bar.experiment', labelId: 'lab-kind-label', help: 'lab.bar.data' },
    el('div', { class: 'lab-experiments', attrs: { role: 'radiogroup', 'aria-labelledby': 'lab-kind-label' }, on: { keydown: onKindKey } }, kindButtons));
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
  const pointsReset = el('button', { class: 'v2-btn bar-reset', i18n: 'bar.reset', help: 'lab.bar.reset', attrs: { type: 'button' }, on: { click: () => { session.resetPoints(); restarted(); } } });
  const pointsBar = el('div', { class: 'scenario-bar lab-bar', i18nAttr: 'aria-label:bar.title', attrs: { role: 'group' } },
    kindGroup, shapeGroup, pointsGroup, el('div', { class: 'bar-group bar-group-reset' }, pointsReset));

  // Compuertas (laboratorio-empieza-por-compuertas D1): AND, OR y XOR con su miniatura de cuatro casos.
  // Sin ruido ni cantidad: no sirven con cuatro casos fijos, así que no se muestran.
  const gateOptions = GATES.map((gate) => el('button', {
    class: 'bar-track lab-shape lab-gate', help: `lab.gate.${gate}`, i18nAttr: `aria-label:lab.gate.${gate}.name`,
    attrs: { type: 'button', role: 'radio', 'aria-checked': 'false', tabindex: '-1' }, dataset: { gate },
    on: { click: () => setGate(gate) },
  }, gateThumbnail(gate), el('span', { class: 'bar-track-name', i18n: `lab.gate.${gate}.name`, attrs: { 'aria-hidden': 'true' } })));
  // El rótulo lleva el término (pestana-laboratorio, "Términos con su nombre"): qué es una compuerta.
  const gateGroup = barGroupNode({ id: 'lab-gate', labelKey: 'lab.bar.gate', labelId: 'lab-gate-label', help: 'lab.term.gate' },
    el('div', { class: 'bar-tracks', attrs: { role: 'radiogroup', 'aria-labelledby': 'lab-gate-label' }, on: { keydown: onGateKey } }, gateOptions));
  const gatesReset = el('button', {
    class: 'v2-btn bar-reset', i18n: 'bar.reset', help: 'lab.bar.resetGates', attrs: { type: 'button' },
    // Restablecer los datos vuelve a empezar a mano: AND, Reproducir secundaria y la marca (red-al-centro D8).
    on: { click: () => { state.handFirst.reset(); if (session.resetGates()) restarted(); else sync(); } },
  });
  const gatesBar = el('div', { class: 'scenario-bar lab-bar', i18nAttr: 'aria-label:bar.title', attrs: { role: 'group' } },
    gateGroup, el('div', { class: 'bar-group bar-group-reset' }, gatesReset));

  // Tu manejo: la pista, el tráfico y la velocidad de sus ejemplos (los de la barra de escenario de la V1, sin sensores).
  const drivingBox = el('div', { class: 'lab-driving' });
  function drivingControls() {
    const d = session.settings.driving;
    const seg = (key, values, labelKey, help, text) => el('div', { class: 'v2-setting v2-wide', help, attrs: { 'data-v1': key === 'track' ? 'lab.bar.track' : `inspect.bar.${key}` } },
      el('span', { class: 'v2-setting-name' }, el('span', { i18n: labelKey })),
      el('div', { class: 'v2-segments', attrs: { role: 'group' } }, values.map((v) => el('button', { class: 'v2-segment', attrs: { type: 'button', 'aria-pressed': String(d[key] === v), 'data-v1': key === 'track' ? `track.option.${v}` : null }, i18n: text ? undefined : `track.${v}`, text: text ? String(v) : undefined,
        on: { click: () => { if (session.setDriving({ [key]: v })) restarted(); } } }))));
    const range = (key) => {
      const r = STREET_SLIDERS.find((x) => x.key === key);
      const out = el('output', { class: 'v2-value', attrs: { 'data-free-text': '' } });
      const fmtV = (v) => (key === 'maxSpeed' ? t('value.speed', { v }) : t('value.percent', { v }));
      const g = createSliderGesture((v, { final }) => { out.textContent = fmtV(v); if (final && session.setDriving({ [key]: v })) restarted(); });
      out.textContent = fmtV(d[key]);
      return el('label', { class: 'v2-setting', help: `inspect.bar.${key}`, attrs: { 'data-v1': `inspect.bar.${key}` } }, el('span', { class: 'v2-setting-name' }, el('span', { i18n: `scenario.${key}` })),
        el('input', { attrs: { type: 'range', min: r.min, max: r.max, step: r.step, value: d[key] }, on: { input: (e) => g.input(Number(e.target.value)), change: (e) => g.change(Number(e.target.value)) } }), out);
    };
    const reset = el('button', { class: 'v2-btn v2-tertiary', i18n: 'scenario.reset', help: 'lab.bar.resetDriving', attrs: { type: 'button', 'data-v1': 'lab.bar.resetDriving' }, on: { click: () => { session.resetDriving(DRIVING_DEFAULTS.maxSpeed); restarted(); } } });
    drivingBox.replaceChildren(seg('track', TRACK_IDS, 'scenario.track', 'lab.bar.track'), seg('lanes', LANE_OPTIONS, 'scenario.lanes', 'inspect.bar.lanes', true),
      el('div', { class: 'v2-grid v2-grid-2' }, range('maxSpeed'), range('density'), range('irregularity')), reset);
    i18n.translateTree(drivingBox);
  }
  plate.append(kindGroup);
  let barKey = '';
  function buildBar() {
    const key = `${session.kind}|${JSON.stringify(session.settings.driving)}`;
    if (key === barKey) return;
    barKey = key;
    for (const n of [gateGroup, gatesReset, shapeGroup, pointsGroup, pointsReset, drivingBox]) n.remove();
    if (isGates()) { tryThis.append(gateGroup); dataGroup.insertBefore(gatesReset, dataGroup.children[1] ?? null); }
    else if (hasPlane()) { tryThis.append(shapeGroup); dataGroup.insertBefore(pointsGroup, dataGroup.children[1] ?? null); pointsGroup.after(pointsReset); }
    else { drivingControls(); dataGroup.insertBefore(drivingBox, dataGroup.children[1] ?? null); }
    tryThis.append(solutionButton);
    i18n.translateTree(tryThis);
    i18n.translateTree(dataGroup);
  }
  function setKind(k) {
    const focused = document.activeElement && kindButtons.includes(document.activeElement);
    if (recording) stopRecording({ use: false });
    const config = playback.config;
    if (k === session.kind || !['gates', 'points', 'driving'].includes(k)) return;
    // Cada clase con su paso y su ritmo (D3): se guardan con la que se deja y vuelven con la que se elige;
    // reproducir o pausar sigue como estaba (D4).
    session.playbackConfig = config;
    session.setKind(k);
    playback.apply(session.playbackConfig ?? kindPlayback(k));
    if (isRunning(playback.size)) run().clearActive();
    buildBar();
    restarted();
    if (focused) kindButtons.find((b) => b.dataset.kind === k)?.focus();
  }
  function setPoints(partial) { if (session.setPoints(partial)) restarted(); else sync(); }
  /** Otra compuerta: datos, tabla y curvas nuevos con la misma red y sus pesos (D1). */
  function setGate(gate) { if (session.setGate(gate)) restarted(); else sync(); }
  function onGateKey(e) {
    const i = GATES.indexOf(session.gate);
    const n = GATES.length;
    const to = { ArrowRight: (i + 1) % n, ArrowDown: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, ArrowUp: (i - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    e.stopPropagation();
    setGate(GATES[to]);
    gateOptions[to].focus();
  }
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
    errorCompare = null;
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
      // La neurona elegida que deja de existir cierra la tarjeta.
      if (state.selected && (state.selected.layer >= run().network.sizes.length || state.selected.neuron >= run().network.sizes[state.selected.layer])) state.selected = null;
      buildOverlay();
    }
    buildNeuronSliders();
    // Los cambios a mano viven con la clase de datos (session.manual): la sesión los vacía cuando el
    // aprendizaje empieza de nuevo y los conserva al cambiar de compuerta o de clase.
    // Datos o red nuevos: ninguna fila elegida y la tabla vuelve arriba.
    state.selectedRow = null;
    dataKey = '';
    dataTable.resetScroll();
    if (!hasPlane()) ensureWorld(true);
    planeForce = true;
    chartKey = '';
  }
  /**
   * Un cambio a mano: se guarda la copia de antes (un arrastre entero es un cambio) y se aplica a la red
   * que aprende. Si había un ejemplo a medio recorrer, vuelve a la ida (lo hace el recorrido).
   */
  function manualChange(apply, gesture, target = null) {
    const snap = run().snapshot();
    const before = errorNow();
    const wasMid = Boolean(run().active && !run().active.done && run().active.cursor.started);
    if (!apply()) return;
    session.recordManual(snap, { gesture });
    if (isGates()) state.handFirst.change({ gesture, solved: session.score.correct === session.split.practice.length });
    // Error de antes y de ahora (D11): "antes" es el de antes de empezar a mover la perilla. Un arrastre es
    // una comparación; con las flechas, las teclas seguidas sobre la misma perilla también. Otra perilla,
    // otro arrastre o un paso del aprendizaje empiezan otra.
    const where = target ? `${target.layer}:${target.neuron}:${target.bias ? 'b' : target.input}` : 'otro';
    const targetKey = gesture ? `g:${gesture}` : `k:${where}`;
    if (!errorCompare || errorCompare.key !== targetKey) errorCompare = { key: targetKey, before };
    errorCompare.now = errorNow();
    afterManual(wasMid);
  }
  // Comparación del error mientras se mueve una perilla (D11): { key, before, now } o null.
  let errorCompare = null;
  // Con tu manejo, una muestra fija de hasta 500 ejemplos de práctica (siempre la misma): uno de cada tantos.
  let errorSample = { split: null, examples: [] };
  function errorExamples() {
    const practice = session.split.practice;
    if (errorSample.split === session.split) return errorSample.examples;
    const step = Math.max(1, Math.ceil(practice.length / ERROR_SAMPLE_MAX));
    errorSample = { split: session.split, examples: practice.filter((_, k) => k % step === 0).slice(0, ERROR_SAMPLE_MAX) };
    return errorSample.examples;
  }
  const errorNow = () => evaluate(run().network, errorExamples(), run().off).loss;
  function errorCompareText() {
    const c = errorCompare;
    if (!c) return '';
    const trend = errorTrend(c.before, c.now);
    const sampled = errorExamples().length < session.split.practice.length;
    return t(sampled ? 'lab.liveError.sample' : 'lab.liveError', { before: fmt(c.before), now: fmt(c.now), arrow: t(`lab.liveError.arrow.${trend}`), word: t(`lab.liveError.${trend}`), count: errorExamples().length });
  }
  function afterManual(wasMid = false) {
    if (animation) { animation.finish(); animation = null; }
    changesVersion += 1;
    planeForce = true;
    chartKey = '';
    if (wasMid) { lastStep = null; restartedNote = true; }
    afterGateChange();
    sync();
  }
  let restartedNote = false;
  function undoManual() {
    const snap = session.manual.undo();
    if (!snap) return;
    run().restore(snap);
    errorCompare = null;
    afterManual();
    announce(t('inspect.announce.undone', { count: session.manual.count }));
  }
  function resetManual() {
    const snap = session.manual.reset();
    if (!snap) return;
    run().restore(snap);
    errorCompare = null;
    afterManual();
    announce(t('inspect.announce.reset'));
  }

  /** Pone la solución preparada como un solo cambio a mano: "Deshacer" la saca entera. */
  function showSolution() {
    const s = session.settings;
    const layers = isGates() ? gateSolution(session.gate, { hidden: s.hidden, activation: s.activation }) : null;
    if (!layers) return;
    const gesture = `solution:${performance.now()}`;
    layers.forEach((layer, k) => layer.weights.forEach((row, j) => {
      row.forEach((w, i) => manualChange(() => run().setWeight(k + 1, j, i, w), gesture));
      manualChange(() => run().setBias(k + 1, j, layer.biases[j]), gesture);
    }));
    session.manual.end();
    state.handFirst.showSolution();
    errorCompare = null;
    afterGateChange();
    sync();
    announce(t('lab.solution.done', { correct: session.score.correct }));
  }
  /** Después de un cambio con compuertas: la misión que se cumplió, si alguna (D10). */
  function afterGateChange() {
    if (!isGates()) return;
    const id = state.missions.gates({ gate: session.gate, hidden: session.settings.hidden.length, solved: session.score.correct === session.split.practice.length, handOnly: session.handOnly });
    if (id) { announce(t('lab.mission.done', { name: t(`lab.mission.${id}`) })); sync(); }
  }

  function resetWeights() { session.resetWeights(); restarted(); announce(t('lab.announce.reset')); }

  /** Un paso del tamaño `size`. */
  function advance(size, { auto }) {
    restartedNote = false;
    errorCompare = null; // la comparación queda hasta el próximo paso del aprendizaje (D11)
    probeView = false; // el paso siguiente vuelve a mostrar el ejemplo (punto-de-prueba D5)
    if (animation) { animation.finish(); animation = null; }
    const r = session.advance(size);
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
  let lastGuide = '';
  function afterLearning() {
    afterGateChange();
    // La guía de las compuertas cambia con lo que pasa al aprender (D8): XOR sin capa, red trabada.
    const g = guideKey();
    if (g !== lastGuide) { const was = lastGuide; lastGuide = g; if (was) { sync(); if (g === 'lab.guide.gates.xorLine' || g === 'lab.guide.gates.stuck') announce(t(g)); } }
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
  // La red que maneja en la escena: la de ahora, con lo apagado hecho pesos en cero (decide igual).
  let liveCache = { net: null, off: null, baked: null };
  const liveNetwork = () => {
    const r = run();
    if (liveCache.net !== r.network || liveCache.off !== r.off) liveCache = { net: r.network, off: r.off, baked: r.off ? bakeOff(r.network, r.off) : r.network };
    return liveCache.baked;
  };
  const liveController = {
    control(perception) {
      const net = liveNetwork();
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
    if (hasPlane()) return;
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
    if (hasPlane() || recording) return;
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
    if (!library || hasPlane() || run().epoch === 0) return;
    const d = session.settings.driving;
    let brain;
    try {
      brain = createBrain({
        id: 'lab', name: 'lab', now: new Date().toISOString(),
        network: bakeOff(run().network, run().off), sensors: session.sensors,
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

  let lastSelected = false;
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
    // En la tabla de datos no sirven el filtro de conexiones, acercar ni resumir: no se muestran (D14).
    netBarParts.groups.zoom.hidden = state.view !== 'diagram'; // con la tabla o los datos, acercar no tiene efecto
    filterGroup.hidden = state.view === 'data';
    collapseAll.hidden = state.view === 'data';
    diagram.hidden = state.view !== 'diagram';
    tableZone.hidden = state.view !== 'table';
    dataZone.hidden = state.view !== 'data';
    // Cambios a mano: siempre a la vista; sin cambios, sin acción y con su explicación (D16).
    const count = session.manual.count;
    setText(changesCount, count === 1 ? 'lab.changes.strip.one' : 'lab.changes.strip', { value: count });
    setData(changesCount, 'changed', String(count > 0));
    // La franja de los cambios a mano: solo con cambios; no aparece en medio de un arrastre (red-al-centro D3).
    if (changesStrip.sync({ count, dragging: netDragging, reserve: false })) layoutKey = '';
    setAttr(undoButton, 'aria-disabled', String(!session.manual.canUndo));
    setData(undoButton, 'help', session.manual.canUndo ? 'lab.undo' : 'lab.undo.none');
    setAttr(resetChangesButton, 'aria-disabled', String(count === 0));
    setData(resetChangesButton, 'help', count === 0 ? 'lab.resetChanges.none' : 'lab.resetChanges');
    const isLink = Boolean(state.selected) && state.selected.input !== undefined;
    show(card.node, Boolean(state.selected) && !isLink);
    show(linkDetail.node, isLink);
    // Con la tarjeta abierta, la guía y las misiones no se muestran (consulta 13.6): siempre, en cualquier
    // tamaño. Las misiones siguen contando y vuelven con su progreso al cerrarla.
    show(missions, !state.selected);
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
    for (const o of gateOptions) { const on = o.dataset.gate === session.gate; setAttr(o, 'aria-checked', String(on)); setAttr(o, 'tabindex', on ? '0' : '-1'); }
    for (const o of shapeOptions) { const on = o.dataset.shape === s.points.shape; setAttr(o, 'aria-checked', String(on)); setAttr(o, 'tabindex', on ? '0' : '-1'); }
    for (const sl of [[noiseSlider, s.points.noise], [countSlider, s.points.count]]) {
      const [x, v] = sl;
      if (x.gesture.active) continue;
      if (Number(x.input.value) !== v) x.input.value = String(v);
      setText(x.value, x.format, { value: v });
      setAttr(x.input, 'aria-valuetext', t(x.format, { value: v }));
    }
    // Panel: guía, red y aprendizaje
    const guide = guideKey();
    setText(intro, guide);
    show(addHiddenButton, guide === 'lab.guide.gates.xorLine');
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
    show(holdoutRow, !isGates());
    // Ver una solución: solo con compuertas; sin solución para la red de ahora, sin acción y con el porqué.
    show(solutionButton, isGates());
    const solvable = isGates() && solutionShapeOk(session.gate, s.hidden);
    setAttr(solutionButton, 'aria-disabled', String(!solvable));
    setData(solutionButton, 'help', solvable ? 'lab.solution' : session.gate === 'xor' && s.hidden.length === 0 ? 'lab.solution.noLine' : 'lab.solution.none');
    if (!holdoutGesture.active) {
      if (Number(holdoutInput.value) !== s.holdout) holdoutInput.value = String(s.holdout);
      setText(holdoutValue, 'drive.value.percent', { value: s.holdout });
      setAttr(holdoutInput, 'aria-valuetext', t('drive.value.percent', { value: s.holdout }));
    }
    // Guardar: solo con tu manejo; sin épocas, sin acción y con su explicación.
    show(saveButton, !hasPlane());
    const untrained = run().epoch === 0;
    setAttr(saveButton, 'aria-disabled', String(untrained));
    setData(saveButton, 'help', untrained ? 'lab.save.none' : 'lab.save');
    show(saveMessage, !hasPlane() && Boolean(state.saveNotice));
    if (state.saveNotice) setText(saveMessage, state.saveNotice.key, state.saveNotice.params);
    // Tu manejo
    show(teacherSection, !hasPlane());
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
    show(planeBox, hasPlane());
    show(truth.node, isGates());
    show(scene, !hasPlane());
    // Misiones
    // Las misiones de la clase elegida (D10): las demás no se muestran.
    const shown = state.missions.missionsFor(session.kind);
    for (const r of missionRows) show(r.row, shown.some((m) => m.id === r.id));
    const current = currentMission(shown);
    for (const m of shown) {
      const r = missionRows.find((x) => x.id === m.id);
      setText(r.status, m.done ? 'train.mission.done' : 'train.mission.pending');
      r.row.dataset.current = String(m.id === current?.id);
    }
    // A mano primero (red-al-centro D8): la consigna cambia cuando Reproducir pasa a ser la principal.
    const hand = state.handFirst;
    tr(consignaText, i18n, isGates() && hand.done ? (hand.reason === 'tries' ? 'consigna.lab.gates.tries' : 'consigna.lab.gates.learn') : `consigna.lab.${session.kind}`);
    // Acción principal: la marcha, salvo en Compuertas mientras se resuelve a mano (las perillas son lo destacado).
    playButton.classList.toggle('v2-primary', !handFirstNow(session.kind, hand));
    show(consigna.node, Boolean(current));
    if (current?.allDone) consigna.set({ nameKey: 'mission.allDone', done: 1, goal: 1, complete: true });
    else if (current) consigna.set({ nameKey: `lab.mission.${current.id}`, countKey: 'train.mission.pending', countParams: {}, done: 0, goal: 1 });
    if (missionRevealButton) missionRevealButton.hidden = !revealTarget();
    buildBar();
    if (state.selected && !lastSelected) notebook.select('red');
    lastSelected = Boolean(state.selected);
    // Con algo elegido la tarjeta cede su lugar, como en Inspeccionar (grupo 5).
    // Los controles que no sirven mientras se graba no se muestran.
    for (const n of [stepButton, sizeGroup]) show(n, !recording);
    playButton.hidden = recording;
  }
  /** La guía del panel: con compuertas, según la compuerta y lo que ya pasó (D8); si no, la de siempre. */
  function guideKey() {
    if (!isGates()) return hasPlane() ? 'lab.guide' : 'lab.guide.driving';
    const gate = session.gate;
    const hidden = session.settings.hidden.length;
    if (gate === 'xor' && hidden === 0) return session.xor?.explain ? 'lab.guide.gates.xorLine' : 'lab.guide.gates.xor';
    if (gate === 'xor') return session.stuck ? 'lab.guide.gates.stuck' : 'lab.guide.gates.xorHidden';
    return hidden === 0 ? `lab.guide.gates.${gate}` : 'lab.guide.gates.other';
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
    // De quién es la cuenta que se ve (punto-de-prueba D5): la del ejemplo en curso (con los pesos que ya
    // cambiaron) al avanzar de a fases, capas o neuronas, o reproduciendo de a ejemplos; si no, con puntos,
    // la del punto de prueba, con la red de ahora y los cambios a mano. Mover el punto en pausa la muestra
    // hasta el paso siguiente, sin tocar el ejemplo.
    const followsExamples = playback.playing && playback.size === 'example';
    const a = !running && !probeView ? r.active : null;
    const playedExample = followsExamples && r.active ? r.active : null;
    const sizes = r.network.sizes;
    const L = sizes.length - 1;
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
    } else if (playedExample) {
      trace = forwardSoft(r.network, playedExample.example.inputs, r.off).trace;
    } else if (hasPlane()) {
      const p = session.probe;
      trace = forwardSoft(r.active ? r.shownNetwork() : r.network, [p.x, p.y], r.off).trace;
    } else {
      const ref = world?.perception ? [...world.perception.sensors, world.perception.speed] : session.data.examples[0].inputs;
      trace = forwardSoft(r.network, ref.length === sizes[0] ? ref : session.data.examples[0].inputs, r.off).trace;
    }
    displayed.cursor = cursor;
    displayed.trace = trace;
    displayed.learning = learning;
    const forwardAnim = anim ? { items: anim.items.filter((x) => x.phase === 'forward') } : null;
    // Filtro de conexiones (vista-de-la-red D21): las de mayor peso de cada neurona, con la red de ahora
    // (sigue a los pesos mientras aprende). Antes no llegaba al diagrama.
    const top = topConnections(a ? r.shownNetwork() : r.network, null, state.filter);
    const common = { sizes, trace, cursor, selected: state.selected, collapsed: state.collapsed, top, filter: state.filter, labels, learning };
    const sel = state.selected;
    const pill = sel && sel.input !== undefined ? {
      ...weightRange(r.network.layers[sel.layer - 1].weights[sel.neuron][sel.input], 3),
      name: t('inspect.pill.label', { from: nameOf(sel.layer - 1, sel.input), to: nameOf(sel.layer, sel.neuron) }),
      help: 'inspect.pill',
    } : null;
    const m = refreshMaps();
    const mapsFn = m ? (l, j) => m.canvases[l]?.[j] ?? null : null;
    // Aprendiendo de corrido (de a épocas o ejemplos), la red se ve con la guarda de destellos
    // (sin-destellos-en-la-red D3); de a fases, capas o neuronas, o en pausa, todo exacto.
    const live = running;
    inspector.render({ ...common, live, pill, knobs: knobSpec(), maps: mapsFn, animation: forwardAnim, stepSize: playback.size, visible: state.view === 'diagram', headerRows });
    placeDragHint();
    table.render({ ...common, live, visible: state.view === 'table', changesVersion: `${changesVersion}|${anim ? now : ''}`, filter: state.filter });
    placeOverlay();
    if (++labelTick % 30 === 0 || labelTick === 1) neuronButtons.forEach((row, l) => row.forEach((b, j) => labelNeuron(b, l, j)));

    // Operación en curso: en pausa y de a fases, capas o neuronas (D11).
    // Con puntos, la franja dice siempre de quién es la cuenta (punto-de-prueba D4): el punto de prueba,
    // o el ejemplo, con su operación.
    const showOp = hasPlane() || !(playback.playing && isRunning(playback.size));
    // De corrido con tu manejo no hay operación que mostrar: queda solo la marca de lo que titubea.
    show(opStrip, showOp || live);
    show(opBody, showOp);
    for (const item of legend.children) show(item, item === flickerLegend ? live : showOp);
    if (showOp) {
      const exampleName = (ex) => t('lab.owner.example', { n: ex.order + 1, total: r.size });
      let text;
      if (a && lastStep) text = `${exampleName(a)}: ${describeLearningStep({ t, fmt, last: lastStep.units[lastStep.units.length - 1], detail: lastStep.detail, ctx: ctx() })}`;
      else if (a && restartedNote && !a.done && !a.cursor.started) text = t('lab.op.restarted');
      else if (a && hasPlane()) text = t('lab.owner.exampleOnly', { n: a.order + 1, total: r.size });
      else if (playedExample) text = t('lab.owner.playing', { n: playedExample.order + 1, total: r.size });
      else if (hasPlane()) {
        const p = session.probe;
        const ans = probeAnswer(r.active ? r.shownNetwork() : r.network, p.x, p.y, r.off);
        text = isGates() ? t('lab.op.probe.gates', { x: fmt(p.x), y: fmt(p.y), reply: gateReply(ans.value) })
          : t('lab.op.probe', { x: fmt(p.x), y: fmt(p.y), answer: t(`lab.class.${ans.cls}`), pct: Math.round(ans.confidence * 100) });
      } else text = lastStep && r.active ? describeLearningStep({ t, fmt, last: lastStep.units[lastStep.units.length - 1], detail: lastStep.detail, ctx: ctx() }) : t('lab.op.idle');
      write(opText, text);
    }
    write(where, whereText({ t, run: r, ctx: ctx(), running }));
    const selNow = state.selected;
    if (selNow && selNow.input === undefined) {
      const probeInput = hasPlane() && selNow.layer === 0
        ? { value: selNow.neuron === 0 ? session.probe.x : session.probe.y, label: t('lab.probe.sliderLabel', { name: nameOf(0, selNow.neuron) }) } : null;
      card.sync({ target: selNow, sizes, network: a ? r.shownNetwork() : r.network, isOff: (l, j, i = null) => r.isOff(l, j, i), probe: probeInput, flicker: inspector.sides(selNow) });
    }
    // Tablero, con tu manejo: la curva de la neurona elegida (oculta o de salida), o el renglón que dice
    // que ahí va a aparecer.
    const curveOn = !hasPlane() && Boolean(selNow) && selNow.input === undefined && selNow.layer > 0;
    show(curveBlock, !hasPlane());
    show(curve.node, curveOn);
    show(curveHint, !hasPlane() && !curveOn);
    if (curveOn) {
      const inputs = trace.inputs ?? trace.layers[0].neurons.map((n) => n.raw ?? n.output);
      curve.sync({
        net: a ? r.shownNetwork() : r.network, inputs, trace, target: selNow, off: r.off, soft: true,
        range: (i) => (i === sizes[0] - 1 ? [-1, 1] : [0, 1]), draggable: false,
        title: t('lab.curve.title', { name: placeNameOf(selNow.layer, selNow.neuron) }),
      });
      fitCurve(`${selNow.layer}:${selNow.neuron}|${i18n.language}|${zones.scene.clientWidth}x${zones.scene.clientHeight}`);
    }
    if (selNow && selNow.input !== undefined) {
      const net = a ? r.shownNetwork() : r.network;
      const w = net.layers[selNow.layer - 1].weights[selNow.neuron][selNow.input];
      linkDetail.sync({
        target: selNow, weight: w, original: null, rangeFrom: w, input: null, product: null, share: null,
        off: r.isOff(selNow.layer, selNow.neuron, selNow.input),
      });
      history.sync(r.weightHistory(selNow.layer, selNow.neuron, selNow.input), w);
    }

    // Tablero
    const highlight = a ? a.index : null;
    if (hasPlane()) {
      const indexInData = highlight === null ? null : session.data.examples.indexOf(session.split.practice[highlight]);
      // El plano muestra lo elegido (D12): el mapa de la neurona oculta bajo el cursor o elegida, o lo que
      // contesta la red; el rótulo dice cuál.
      const L = r.network.sizes.length - 1;
      const isHidden = (x) => x && x.input === undefined && x.layer > 0 && x.layer < L;
      const focus = isHidden(hovered) ? hovered : isHidden(state.selected) ? state.selected : null;
      const mg = focus ? refreshMaps() : null;
      const values = mg?.grid.layers[focus.layer]?.[focus.neuron] ?? null;
      const map = values ? { key: `${focus.layer}:${focus.neuron}`, values, toY: mapToY(values) } : null;
      const label = map ? t('lab.plane.neuron', { name: placeNameOf(focus.layer, focus.neuron) }) : t('lab.plane.network');
      plane.render({
        network: r.network, off: r.off, version: `${session.version}:${changesVersion}`, examples: session.data.examples, held: session.split.held,
        highlight: indexInData, selected: state.selectedRow, force: planeForce, map, label,
        // Con compuertas (D2): de −0,5 a 1,5, marcas en 0 y 1 y los cuatro casos grandes.
        range: session.range, ticks: isGates() ? [0, 1] : null, big: isGates(), live: liveGesture,
      });
      planeForce = false;
      placeProbe(r, map ? focus : null, Boolean(a));
      if (isGates()) drawTruth(r, a, playedExample);
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
    const cmp = errorCompareText();
    show(liveError, cmp !== '');
    if (cmp) { write(liveError, cmp); setData(liveError, 'trend', errorTrend(errorCompare.before, errorCompare.now)); }
    drawDataTable(now, a);
    if (++descTick % 30 === 1) describeBoard();
  }
  let descTick = 0;

  const knobPlace = (l, j) => (l === 0 || l === run().network.sizes.length - 1 ? nameOf(l, j) : placeNameOf(l, j));
  /** Perillas que el Laboratorio le pide a la red (D5): pesos y sesgos siempre; entradas con plano. */
  function knobSpec() {
    return {
      range: (v) => weightRange(v, 3),
      inputs: isGates() ? { kind: 'toggle', values: [0, 1] } : hasPlane() ? { kind: 'range', min: -1, max: 1 } : null,
      names: {
        // Con capas ocultas, la capa va en el nombre: "neurona 1" sola no dice de cuál.
        weight: (l, j, i) => t('inspect.pill.label', { from: knobPlace(l - 1, i), to: knobPlace(l, j) }),
        bias: (l, j) => t('lab.knob.bias.label', { name: knobPlace(l, j) }),
        input: (i) => t(isGates() ? 'lab.knob.switch.label' : 'lab.knob.input.label', { name: nameOf(0, i) }),
      },
      help: { weight: 'lab.knob.weight', bias: 'lab.knob.bias', input: isGates() ? 'lab.knob.switch' : 'lab.knob.input' },
      // Con compuertas, las pastillas de peso y sesgo crecen y muestran que se arrastran (red-al-centro D8).
      size: isGates() ? GATE_KNOB : null,
    };
  }

  /** La tabla de verdad (D6): la red que se ve, el caso de las entradas y el ejemplo en curso. */
  function drawTruth(r, a, played) {
    const net = a ? r.shownNetwork() : r.network;
    const examples = session.data.examples;
    const p = session.probe;
    const shown = examples.findIndex((ex) => ex.inputs[0] === p.x && ex.inputs[1] === p.y);
    const ongoing = a && !a.done ? a : played;
    // Si la red muestra un ejemplo, sus entradas son las del ejemplo: se destaca esa fila, no la del punto.
    const showsExample = Boolean(a) || Boolean(played);
    truth.render({ table: truthRows(net, examples, r.off), shown: showsExample || shown < 0 ? null : shown, current: ongoing ? examples.indexOf(ongoing.example) : null, note: truthNote() });
  }
  /** Texto junto a la tabla (D10): resuelta por el aprendizaje, no a mano. Lo completa la tarea 5.4. */
  function truthNote() {
    const solved = session.score.correct === session.split.practice.length;
    return solved && session.gate !== 'xor' && session.settings.hidden.length === 0 && !session.handOnly ? t('lab.tt.byLearning') : '';
  }

  /** La tabla de datos, si está a la vista (D14): corriendo, como mucho 5 veces por segundo; en pausa, ya. */
  function drawDataTable(now, a) {
    if (state.view !== 'data') return;
    const r = run();
    const key = `${session.version}|${changesVersion}|${JSON.stringify(state.dataFilter)}|${state.selectedRow}|${i18n.language}`;
    if (key === dataKey) return;
    if (playback.playing && now - dataAt < DATA_TABLE_INTERVAL_MS) return;
    dataKey = key;
    dataAt = now;
    const { rows, summary: sum } = evaluatedRows(r.network, session.data.examples, session.split.held, r.off);
    const current = a && !a.done ? session.data.examples.indexOf(a.example) : null;
    dataTable.render({
      rows: filterRows(rows, state.dataFilter), summary: sum, kind: session.kind, filter: state.dataFilter,
      inputNames: Array.from({ length: r.network.sizes[0] }, (_, i) => nameOf(0, i)),
      current, selected: state.selectedRow, version: key,
    });
  }
  let dataKey = '';
  let dataAt = -Infinity;

  function drawExample(a) {
    const visible = playback.size !== 'epoch' && Boolean(a);
    show(exampleBlock, visible);
    if (!visible) return;
    const ex = a.example;
    const fwdDone = a.cursor.phaseDone('forward');
    const out = a.detail.forward.outputs;
    if (hasPlane()) {
      show(fan, false);
      show(actionsRows, false);
      const cls = ex.targets[0] >= 0.5 ? 'a' : 'b';
      if (isGates()) {
        const answer = fwdDone ? `${gateReply(out[0]).replace(/^./, (c) => c.toUpperCase())}.` : t('lab.example.pending');
        write(exampleText, t('lab.example.gate', { a: ex.inputs[0], b: ex.inputs[1], answer: t(`lab.gates.${ex.targets[0] >= 0.5 ? 'yes' : 'no'}`), reply: answer }));
        return;
      }
      const answer = fwdDone ? t('lab.example.answer', { color: t(`lab.class.${out[0] > 0.5 ? 'a' : 'b'}`), sure: pct(Math.max(out[0], 1 - out[0])) }) : t('lab.example.pending');
      write(exampleText, t('lab.example.point', { x: fmt(ex.inputs[0]), y: fmt(ex.inputs[1]), color: t(`lab.class.${cls}`), answer }));
    } else {
      show(fan, true);
      show(actionsRows, true);
      drawFan(ex.inputs.slice(0, -1));
      write(exampleText, t('lab.example.driving', { speed: fmt(ex.inputs[ex.inputs.length - 1]) }));
      const target = Object.fromEntries(ACTIONS.map((k) => [k, ex.targets[DRIVING_OUTPUTS.indexOf(k)] === 1]));
      const netOn = Object.fromEntries(ACTIONS.map((k) => [k, fwdDone && out[DRIVING_OUTPUTS.indexOf(k)] > 0.5]));
      // Las teclas solo se ven en pausa o de a pasos (aprendiendo de corrido, el bloque se oculta): exactas.
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
      // Con compuertas no hay apartados (D1): la curva y los aciertos son solo de práctica.
      const gates = isGates();
      chart.update(chartPoints(h, warn ? o.bestEpoch : null).map((e) => ({ generation: e.epoch, best: e.practice.loss, average: e.heldOut.loss ?? 0, fitness: 'loss' })), { marker: warn ? o.bestEpoch : null, single: gates });
      const last = h[h.length - 1];
      if (gates) write(stats, last ? t('lab.stats.gates', { epoch: last.epoch, correct: last.practice.correct, count: last.practice.count }) : t('lab.stats.none'));
      else write(stats, last ? t('lab.stats', { epoch: last.epoch, practice: pct(last.practice.accuracy), heldOut: pct(last.heldOut.accuracy) }) : t('lab.stats.none'));
      show(warning, Boolean(warn));
      if (warn) write(warning, t('lab.warning.best', { text: t('lab.warning'), epoch: o.bestEpoch }));
      const rising = h.length >= 2 && h[h.length - 1].heldOut.loss > h[h.length - 2].heldOut.loss;
      if (gates) write(chartText, last ? t('lab.chart.description.gates', { epoch: last.epoch, practice: fmt(last.practice.loss) }) : t('lab.chart.empty'));
      else write(chartText, last ? t('lab.chart.description', { epoch: last.epoch, practice: fmt(last.practice.loss), heldOut: fmt(last.heldOut.loss), trend: t(rising ? 'lab.chart.rising' : 'lab.chart.notRising') }) : t('lab.chart.empty'));
    }
  }

  /** Descripciones en texto del plano y de la escena (D9). */
  function describeBoard() {
    const h = run().history;
    const last = h[h.length - 1];
    if (hasPlane()) {
      const p = session.settings.points;
      if (isGates()) setAttr(planeBox, 'aria-label', t('lab.plane.description.gates', { gate: t(`lab.gate.${session.gate}.name`), correct: session.score.correct }));
      else setAttr(planeBox, 'aria-label', t('lab.plane.description', { shape: t(`lab.shape.${p.shape}`), count: session.data.examples.length, heldOut: last ? pct(last.heldOut.accuracy) : '–' }));
    } else {
      sceneDescription.set(t(recording ? 'lab.scene.recording' : 'lab.scene.description', { track: t(`track.${session.settings.driving.track}`) }));
    }
    const sm = summary(session.data, session.split);
    if (hasPlane()) write(dataSummary, '');
    else {
      write(dataSummary, t('lab.summary', {
        count: sm.count, who: session.source === 'recorded' ? t('lab.who.you') : candidateName(candidates.find((x) => x.key === session.teacherKey)), practice: sm.practice, heldOut: sm.heldOut,
        forward: pct(sm.controls.forward), left: pct(sm.controls.left), right: pct(sm.controls.right), reverse: pct(sm.controls.reverse),
      }));
    }
    show(dataSummary, !hasPlane());
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
    const tagTop = rows === 2 ? 60 : 32;
    inputTag.style.transform = `translate(${Math.round(lefts[0])}px, ${tagTop}px)`;
    decideTag.style.transform = `translate(${Math.round(lefts[1])}px, ${tagTop}px)`;
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
    if (!visible) return;
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
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  const offLanguage = i18n.onChange(() => { layoutKey = ''; chartKey = ''; fan.dataset.key = ''; sync(); });
  const offLibrary = library ? library.subscribe(() => { refreshCandidates(); if (picker.isOpen) picker.render(); }) : () => {};

  // --- Montaje ---------------------------------------------------------------------------------
  buildBar();
  checkVersion();
  buildOverlay();
  if (state.wasPlaying) playback.play();
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
    /** La cuenta que muestra la red ahora (verificación desde la consola). */
    get displayed() { return displayed; },
    show() { visible = true; if (state.wasPlaying) playback.play(); loop.start(); sync(); },
    hide() { visible = false; state.wasPlaying = playback.playing; if (recording) stopRecording({ use: true }); playback.pause(); keyboard.releaseAll(); loop.stop(); },
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
      keyboard.dispose();
      picker.dispose();
      sceneDescription.dispose();
      inspector.dispose();
      table.dispose();
      dataTable.dispose();
      plane.dispose();
      chart.dispose();
      sceneView.dispose();
    },
  };
}

/** Puntos que dibuja el gráfico de curvas (como mucho). Con más épocas, se toma una de cada tantas. */
export const CHART_MAX_POINTS = 300;

/**
 * Épocas que se dibujan: todas si son pocas; si no, una de cada `ceil(n / CHART_MAX_POINTS)`, más la
 * última y la marcada (la mejor época). Así el gráfico cuesta lo mismo a la época 50 que a la 5000:
 * con miles de épocas, dibujarlas todas bajaba la pestaña a 12 cuadros por segundo (medido).
 */
export function chartPoints(history, marker = null, max = CHART_MAX_POINTS) {
  if (history.length <= max) return history;
  const stride = Math.ceil(history.length / max);
  return history.filter((e, k) => k % stride === 0 || k === history.length - 1 || e.epoch === marker);
}

/** Miniatura de una compuerta (para la barra): los cuatro casos con el color y la forma de su respuesta. */
function gateThumbnail(gate) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 30 21');
  svg.setAttribute('width', '30');
  svg.setAttribute('height', '21');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', 'lab-shape-thumb');
  for (const ex of gatesDataset({ gate }).examples) {
    const [x, y] = ex.inputs;
    const px = 9 + x * 12;
    const py = 16 - y * 11;
    const yes = ex.targets[0] === 1;
    const n = document.createElementNS(ns, yes ? 'circle' : 'rect');
    if (yes) { n.setAttribute('cx', px); n.setAttribute('cy', py); n.setAttribute('r', 2.4); n.setAttribute('class', 'lab-dot-a'); }
    else { n.setAttribute('x', px - 2.1); n.setAttribute('y', py - 2.1); n.setAttribute('width', 4.2); n.setAttribute('height', 4.2); n.setAttribute('class', 'lab-dot-b'); }
    svg.append(n);
  }
  return svg;
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
    spiral: Array.from({ length: 10 }, (_, k) => { const tt = k / 9; const r = 0.15 + 0.8 * tt; const a = SPIRAL_TURNS * tt * 2 * Math.PI; return [[r * Math.sin(a), r * Math.cos(a), 1], [-r * Math.sin(a), -r * Math.cos(a), 0]]; }).flat(),
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
