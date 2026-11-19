// Etapa 5 de la V2, "Entender" (tareas 14.1 a 14.3; #entender de la maqueta D). Copia para la V2 de la pestaña
// Inspeccionar de la V1 (src/tabs/inspect/index.js), con la misma conducta y otro lugar para cada pieza: la red
// es la protagonista de la zona de la escena; el auto, con la decisión y el caso del choque, va en una viñeta al
// costado; la reproducción, el paso y su ritmo, en la banda; y el panel se reparte en las hojas Neurona (lo
// elegido, con la línea de guía que sigue a la mano), Etapa (misión y cambiar cerebro) y Escenario.
// La lógica es la de la V1 sin cambios (core/, render/ y tabs/inspect/); las piezas de pantalla compartidas son
// copias para la V2 (src/v2/legacy/).
import { createWorld } from '../../../core/world.js';
import { createObservedController } from '../../../core/controller.js';
import { createKeyboardController } from '../../../input/keyboard.js';
import { traceNetwork, createTraceController, inputsOf } from '../../../core/network-trace.js';
import { createChanges, topConnections } from '../../../core/network-changes.js';
import { createPassCursor, STEP_SIZES } from '../../../core/pass-cursor.js';
import { TRACK_IDS } from '../../../core/circuits.js';
import { createStageView } from '../../../render/view.js';
import { createNetworkInspector, sameTarget } from '../../../render/network-inspector.js';
import { maxWeightOfTrace } from '../../../render/link-look.js';
import { neighborOf } from '../../../render/inspector-layout.js';
import { createWeightTable } from '../../../render/weight-table.js';
import { weightStyle, OUTPUT_KEYS } from '../../../render/network-view.js';
import { createLoop } from '../../../ui/loop.js';
import { formatValue, formatFixed } from '../../../ui/i18n.js';
import { currentMission } from '../../../ui/current-mission.js';
import { EXAMPLE_BRAINS } from '../../../data/example-brains.js';
import { listBrains, resolveChoice, trainedScenario, trainedTracks, workingCopy, PICKER_GROUPS } from '../../../tabs/inspect/brains.js';
import { createPlayback, FRAME_PACES, STEP_PACES } from '../../../tabs/inspect/playback.js';
import { createStepAnimation, displayCursor, stepDuration } from '../../../tabs/inspect/step-animation.js';
import { describeStep, describeOperation, whereText, layerName, neuronLabel, placeName } from '../../../tabs/inspect/describe.js';
import { createInspectMissions } from '../../../tabs/inspect/missions.js';
import { shortcutFor } from '../../../tabs/inspect/shortcuts.js';
import { takesWheel, isDrivingKey } from '../../../tabs/inspect/driver.js';
import { caseOf, CASE_FRAMES, CASE_START } from '../../../tabs/inspect/crash-case.js';
import { ACTIONS, createMatchWindow, createCompareAnnouncer, sameControls } from '../../../tabs/shared/driving-logic.js';
import { createReplayBuffer } from '../../../tabs/shared/replay-buffer.js';
import { el, setData, tr } from '../../dom.js';
import { createTextSetter } from '../../components/legacy.js';
import { createPicker } from '../../components/picker.js';
import { missionNote } from '../../components/controls.js';
import { mountScenarioSheet } from '../../components/scenario-sheet.js';
import { actionBlock, actionCompare } from '../../legacy/driving-cards.js';
import { createNeuronCard, weightRange } from '../../legacy/neuron-card.js';
import { createConnectionDetail, linkShare } from '../../legacy/connection-detail.js';
import { createResponseCurve } from '../../legacy/response-curve.js';
import { roleTag } from '../../legacy/role-tag.js';
import { netBar } from '../../legacy/net-bar.js';
import { createChangesStrip } from '../../legacy/changes-strip.js';

const STAGE = 'entender';
/** Qué muestra "Mostrame" en cada misión (la tabla de la V1, ui/mission-targets.js). */
const REVEAL = { follow: { targets: ['step', 'sizeOperation'] }, decision: { targets: ['manualInput'], select: 'firstInput' }, off: { targets: ['turnOff'], select: 'firstHidden' } };

export const SEED = 1;
/** Filtros de conexiones (D6b). */
export const FILTERS = Object.freeze(['all', 5, 3, 1]);
/** Vistas de la red. */
export const VIEWS = Object.freeze(['diagram', 'table']);
/** Anchos propios (red-al-centro D2): la escena a la izquierda en 400 px, la red al centro con el resto y el panel. */

// --- Estado conservado entre montajes ------------------------------------------------------------
let state = null;
const completedMissions = new Set();
/** Interruptor "Flujo" (vista-de-la-red D10): encendido por defecto, recordado hasta cerrar la aplicación. */
let flowOn = true;

/** Olvida el estado conservado (para pruebas). */
export function resetState() { state = null; }

const reducedMotion = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

export function mount({ zones, notebook, i18n, scenario, scenery = null, library = null }) {
  const { plate, band, zone } = zones;
  const doc = zones.scene.ownerDocument;
  const win = doc.defaultView;
  const document = doc; // la copia de la V1 usa `document` y `window`: los de la página de la etapa
  const window = win;
  const reportError = (err) => console.error(err);
  let visible = false;
  if (!state) {
    state = {
      choice: { key: null, signature: null },
      view: 'diagram',
      filter: 'all',
      collapsed: [],
      shapeKey: '',
      selected: null, // nada elegido al abrir (vista-de-la-red D5); con una conexión, su neurona de destino
      connection: null, // la conexión elegida: índice de su entrada en `selected`
      cardView: 'count', // vista de la tarjeta de la neurona: 'count' o 'response' (D17), recordada
      playback: createPlayback(),
      settings: null,
      changesBy: new Map(), // firma del cerebro → lista de cambios
      manual: null, // entradas a mano (D9), no quién maneja
      driver: 'network', // quién maneja: 'network' o 'you' (manejar-vos D2)
      missions: createInspectMissions({ completed: completedMissions }),
    };
  }
  const t = (k, p) => i18n.t(k, p);
  const setText = createTextSetter(i18n);
  const fmt = (v) => formatValue(v, i18n.language);
  const playback = state.playback;
  playback.pause(); // se reanuda abajo: al volver, la pestaña sigue en pausa (D13 de Competir, igual acá)
  state.driver = 'network'; // al volver a la pestaña maneja la red (manejar-vos D2)
  // El teclado registra lo apretado siempre (también en pausa, para N de a cuadros); maneja solo con
  // "Manejar vos". Con el foco en un control que usa las flechas, no maneja (D3).
  const keyboard = createKeyboardController({ accepts: (e) => takesWheel(e.target) });

  // --- Cerebro ---------------------------------------------------------------------------------
  let candidates = [];
  let brain = null; // copia de trabajo
  let net = null;
  let changes = null;
  let world = null;
  let cursor = null;
  let controller = null; // controlador con observador: la red observa; maneja la red o el teclado
  let animation = null;
  let lastStep = null;
  // Memoria de cuadros (red-al-centro D5 y D6): los últimos 3 s, cada uno con el estado del mundo y la red con que
  // se calculó (su «época»: se reemplaza en cada cambio de prueba). La usan el caso del choque y "Atrás".
  let memory = null;
  let epoch = null;
  // Caso del choque a la vista: { offset (cuadros desde el del choque, ≤ 0), wasPlaying, meters, cause, circuit }.
  let crash = null; // { size, last } del último paso, para la operación en curso
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
      state.selected = null;
    } else if (state.selected && (state.selected.layer >= net.sizes.length || state.selected.neuron >= net.sizes[state.selected.layer])) {
      state.selected = null;
    }
    state.connection = null;
    state.manual = null;
    state.settings = settings ?? barDefaults();
    displayed.trace = null; // la cuenta mostrada era de la red anterior
    buildWorld();
  }

  /** Escenario donde entrenó el cerebro, con la velocidad de toda la app. */
  /** El escenario de la etapa: el del cerebro (fijado en el escenario compartido, "de esta etapa") con la velocidad común. */
  const settingsOf = () => { const s = scenario.forStage(STAGE); return { track: s.track, lanes: s.lanes, density: s.density, irregularity: s.irregularity, maxSpeed: s.maxSpeed }; };
  let fixing = false;
  function barDefaults() {
    const b = trainedScenario(brain);
    fixing = true;
    scenario.fix(STAGE, { track: b.track, lanes: b.lanes, density: b.density, irregularity: b.irregularity });
    fixing = false;
    return settingsOf();
  }

  function buildWorld() {
    const s = state.settings;
    // El controlador lee los cambios vigentes del estado conservado: sigue valiendo al volver a la pestaña.
    const traced = createTraceController(net, brain.sensors.count, () => state.live?.changes ?? null);
    controller = createObservedController({ driver: state.driver === 'you' ? keyboard : traced, observer: traced });
    world = createWorld({
      seed: SEED, track: s.track, lanes: s.lanes, density: s.density, irregularity: s.irregularity,
      cars: [{ controller, sensors: { ...brain.sensors }, maxSpeed: s.maxSpeed }],
    });
    cursor = createPassCursor(net);
    cursor.complete();
    animation = null;
    lastStep = null;
    crash = null;
    epoch = { list: changes.list() };
    memory = createReplayBuffer({ capacity: CASE_FRAMES });
    remember();
    state.missions.newFrame();
    resetCompare();
    keepLive();
  }

  /** Lo que se conserva al salir: el mundo en el cuadro en que quedó, el cursor, los cambios y la memoria (D13). */
  function keepLive() {
    state.live = { signature: state.choice.signature, brain, net, changes, world, cursor, controller, memory, epoch, crash };
  }
  /** Al volver con el mismo cerebro y los mismos ajustes: todo como quedó. */
  function restoreLive() {
    ({ brain, net, changes, world, cursor, controller, memory, epoch, crash } = state.live);
  }

  // --- Memoria de cuadros y caso del choque (red-al-centro D5 y D6) -----------------------------------
  /** Guarda el cuadro actual: el estado del mundo y la red con que se calcula. */
  function remember() { memory.push({ state: world.capture(), epoch }); }
  /** Los cambios de una época: los vigentes, o los de entonces (se arman una vez). */
  const changesOf = (e) => (e === epoch ? changes : (e.changes ??= createChanges(net, e.list)));
  /** Cuadro de la memoria que se ve en el caso. */
  const caseFrame = () => (crash ? memory.at(crash.offset) : null);
  /** Con el caso a la vista, ¿la red cambió después del cuadro que se ve? (la repetición muestra la de entonces) */
  const caseChanged = () => Boolean(crash) && caseFrame().epoch !== epoch;
  /** Al chocar: la reproducción se congela y se ve el caso, 1 s antes del choque (o el principio, si duró menos). */
  function openCase() {
    crash = {
      offset: -Math.min(CASE_START, memory.length - 1), wasPlaying: playback.playing,
      meters: world.progress, cause: world.crashCause, circuit: Boolean(world.track.closed),
    };
    keepLive();
    playback.pause();
    animation = null;
    lastStep = null;
    showCaseFrame();
    announce(t('inspect.announce.crash', { value: Math.round(crash.meters), seconds: secondsText(crash.offset) }));
    sync();
  }
  const secondsText = (offset) => formatFixed(-offset / 60, 1, i18n.language);
  /** Vuelve el mundo al cuadro que muestra el deslizador, con la cuenta completa. */
  function showCaseFrame() {
    world.restore(caseFrame().state);
    if (state.manual) releaseManual({ announceIt: false });
    cursor.complete();
    displayed.trace = null;
    relabel();
  }
  function setCaseOffset(offset) {
    if (!crash) return;
    const next = Math.max(-(memory.length - 1), Math.min(0, Math.round(offset)));
    if (next === crash.offset) { sync(); return; }
    crash.offset = next;
    showCaseFrame();
    sync();
  }
  /** Deja el caso desde el cuadro que se ve: los cuadros de después se descartan (la memoria es una línea). */
  function leaveCase() {
    if (!crash) return null;
    for (let k = crash.offset; k < 0; k++) memory.pop();
    const was = crash;
    crash = null;
    keepLive();
    if (driving()) resetCompare(); // manejando la persona, la coincidencia vuelve a cero
    return was;
  }
  /** "Reintentar desde acá": sigue desde el cuadro del deslizador con la red de ahora (D5). */
  function retry() {
    const was = leaveCase();
    if (!was) return;
    announce(t('inspect.announce.retry', { seconds: secondsText(was.offset) }));
    play();
  }
  /** "Elegir esta neurona": elige la que más aportó a la decisión del cuadro que se ve. */
  function pickContributor() {
    const c = crash ? caseOf(traceNow()).contributor : null;
    if (!c) return;
    const target = { layer: c.layer, neuron: c.neuron };
    if (!sameTarget(target, picked())) select(target);
  }

  // --- Cuenta ------------------------------------------------------------------------------------
  /** Lo que recibe la red: lo que ve el auto, o lo puesto a mano en pausa (D9). */
  function currentInputs() {
    const real = inputsOf(world.perception);
    if (!state.manual) return real;
    return real.map((v, i) => (state.manual[i] ?? v));
  }
  // Con el caso a la vista, la cuenta es la de la red con que se calculó ese cuadro (red-al-centro D5).
  const traceNow = () => traceNetwork(net, currentInputs(), originalHeld ? null : crash ? changesOf(caseFrame().epoch) : changes);
  /** "Ver original" (D13): mientras se mantiene apretado, la vista muestra la red sin los cambios. */
  let originalHeld = false;
  const NO_CHANGES = Object.freeze({ has: () => false, count: 0, list: () => [] });

  /**
   * Un paso del mundo; manejando la persona, guarda si las cuatro acciones coincidieron con las de la red (D4).
   * Avanzar desde un cuadro del caso es reintentar desde ahí. Guarda el cuadro y, si choca, abre el caso.
   */
  function worldStep() {
    if (crash) leaveCase();
    world.step();
    remember();
    if (driving() && controller.driven) matchWindow.push(sameControls(controller.driven, controller.observed));
    if (world.crashed) openCase();
  }

  /** Un cuadro del mundo: percibir, calcular la red y mover el auto. Suelta las entradas a mano. Chocado, no avanza. */
  function stepWorld() {
    if (state.manual) releaseManual({ announceIt: true });
    if (world.crashed) { if (!crash) openCase(); return; }
    worldStep();
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
    state.missions.stepped(size, ops, net.sizes);
    const last = ops[ops.length - 1];
    lastStep = { size, last };
    // La tarjeta sigue a la cuenta (de a neuronas o de a operaciones).
    if (size === 'neuron' || size === 'operation') { state.selected = { layer: last.layer, neuron: last.neuron }; state.connection = null; }
    if (!reducedMotion()) {
      const duration = stepDuration(size, auto ? { intervalMs: playback.intervalMs } : {});
      animation = createStepAnimation(r, cursor.at, { start: performance.now(), duration, sizes: net.sizes, fine: size === 'operation' });
    }
    if (!auto) announce(describeStep({ t, fmt, size, last, trace: traceNow(), sizes: net.sizes, cursor, manual: state.manual }));
  }

  // --- Reproducción --------------------------------------------------------------------------------
  function play() {
    if (crash) { retry(); return; } // con el caso a la vista, reproducir es reintentar desde el cuadro que se ve
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
  /** Nombres de reproducir, paso y atrás: con su atajo, o sin él con la red angosta (consulta 5.1). */
  function barLabels() {
    const plain = narrowBar ? '.plain' : '';
    setText(playButton, `${playback.playing ? 'inspect.pause' : 'inspect.play'}${plain}`);
    setText(stepButton, `inspect.step${plain}`);
    setText(backButton, `inspect.back${plain}`);
  }

  /**
   * Vuelve un paso del tamaño elegido dentro del cuadro, sin animación; reproduciendo, pausa primero (D7). Al
   * principio de un cuadro vuelve al cuadro anterior de la memoria, con el auto donde estaba (red-al-centro D6);
   * con el caso a la vista, la repetición retrocede un cuadro.
   */
  function stepBack() {
    if (playback.playing) pause();
    animation = null;
    // De a cuadros, un paso mueve el auto un cuadro con su cuenta completa: "Atrás" vuelve un cuadro entero, igual.
    const wholeFrame = playback.size === 'frame' && cursor.done && (crash ? crash.offset > -(memory.length - 1) : memory.length > 1);
    const r = wholeFrame ? { moved: false } : cursor.back(playback.size);
    if (!r.moved) {
      if (crash) { setCaseOffset(crash.offset - 1); return; }
      if (memory.length > 1) {
        memory.pop();
        world.restore(memory.at(0).state);
        if (state.manual) releaseManual({ announceIt: false });
        cursor.complete();
        lastStep = null;
        state.missions.newFrame();
        displayed.trace = null;
        relabel();
        announce(t('inspect.announce.backFrame', { frame: world.steps }));
      }
      sync();
      return;
    }
    const last = cursor.position;
    lastStep = last ? { size: playback.size, last } : null;
    if (last && (playback.size === 'neuron' || playback.size === 'operation')) { state.selected = { layer: last.layer, neuron: last.neuron }; state.connection = null; }
    announce(last
      ? t('inspect.announce.back', { step: describeStep({ t, fmt, size: playback.size, last, trace: traceNow(), sizes: net.sizes, cursor, manual: state.manual }) })
      : t('inspect.announce.backStart'));
    sync();
  }

  function restart() {
    const was = crash;
    crash = null;
    world.reset();
    memory.clear();
    remember();
    keepLive();
    cursor.complete();
    animation = null;
    lastStep = null;
    if (state.manual) releaseManual({ announceIt: false });
    if (driving()) resetCompare();
    // Con el caso a la vista, la reproducción sigue como estaba antes del choque.
    if (was?.wasPlaying) playback.play();
    sync();
  }
  function setSize(size) {
    if (!playback.setSize(size)) return;
    if (size === 'frame' && playback.playing) cursor.complete();
    sync();
  }

  // --- Quién maneja (manejar-vos-en-inspeccionar) ---------------------------------------------------
  const driving = () => state.driver === 'you';
  const focusScene = () => scene.focus({ preventScroll: true });
  /** "Manejar vos": desde el cuadro siguiente el auto sigue al teclado; la reproducción pasa a tiempo real de a cuadros (D3). */
  function takeWheel({ focus = true } = {}) {
    if (focus) focusScene();
    if (driving()) return;
    state.driver = 'you';
    controller.setDriver(keyboard);
    if (playback.setSize('frame')) cursor.complete();
    playback.setPace(FRAME_PACES.length - 1);
    if (!playback.playing) play();
    onDriverChange();
    announce(t('inspect.drive.announce.taken'));
    sync();
  }
  /** "Devolver el volante": la red maneja desde donde está el auto, sin volver a empezar el intento. */
  function giveBack({ announceIt = true } = {}) {
    if (!driving()) return;
    const hadFocus = driveBadge.contains(document.activeElement);
    state.driver = 'network';
    controller.setDriver(controller.observer);
    onDriverChange();
    if (announceIt) announce(t('inspect.drive.announce.back'));
    sync();
    if (hadFocus) driveButton.focus({ preventScroll: true }); // el aviso se oculta: el foco no se pierde
  }
  const toggleDriver = () => (driving() ? giveBack() : takeWheel());
  function onDriverChange() { resetCompare(); }

  // --- Cambios de prueba ------------------------------------------------------------------------
  function changed() {
    epoch = { list: changes.list() }; // los cuadros que vengan se calculan con esta red
    keepLive();
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
    // Con el caso a la vista la cuenta es la de entonces: el estado se lee de los cambios vigentes.
    const off = !changes.valueOf({ kind: 'neuronOff', layer, neuron });
    setChange({ kind: 'neuronOff', layer, neuron, value: off });
    announce(t(off ? 'inspect.announce.off' : 'inspect.announce.on', { name: placeName(t, net.sizes, layer, neuron) }));
  }
  function toggleConnection(input) {
    const { layer, neuron } = state.selected;
    const off = changes.valueOf({ kind: 'connectionOff', layer, neuron, input });
    setChange({ kind: 'connectionOff', layer, neuron, input, value: !off });
  }
  // Cambiar un peso no cambia lo elegido: la tarjeta sigue siendo la de la neurona (D7).
  const setWeight = (input, value) => setChange({ kind: 'weight', layer: state.selected.layer, neuron: state.selected.neuron, input, value });
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
  /** Lo elegido como lo entiende el inspector: null, una neurona o una conexión ({ layer, neuron, input }). */
  const picked = () => (!state.selected ? null : state.connection === null ? state.selected : { ...state.selected, input: state.connection });
  /** Elige una neurona o una conexión; null, o elegir otra vez lo mismo, suelta (D5). */
  function select(target) {
    const same = target && sameTarget(target, picked());
    if (!target || same) {
      state.selected = null;
      state.connection = null;
    } else {
      state.selected = { layer: target.layer, neuron: target.neuron };
      state.connection = target.input ?? null;
    }
    if (state.selected && !neuronLayer.contains(document.activeElement)) focusNeuron(state.selected, { focus: false });
    relabel(); // «elegida» al instante
    announceSelection(picked());
    sync();
  }
  const capitalize = (text) => text.replace(/^./, (c) => c.toUpperCase());
  /** Avisa qué quedó elegido (inspector-de-red, "el inspector avisa cuál es"). */
  function announceSelection(p) {
    const name = (l, j) => capitalize(neuronLabel(t, net.sizes, l, j));
    if (!p) announce(t('inspect.announce.cleared'));
    else if (p.input === undefined) announce(t('inspect.announce.selected', { name: name(p.layer, p.neuron) }));
    else announce(t('inspect.announce.selectedLink', { from: name(p.layer - 1, p.input), to: name(p.layer, p.neuron) }));
  }

  // ==================================================================================================
  // Zona izquierda: la red
  // ==================================================================================================
  const netTitle = el('h2', { class: 'inspect-net-title', attrs: { id: 'inspect-net-title' } });
  const viewButtons = VIEWS.map((v) => el('button', {
    class: 'v2-segment', i18n: `inspect.view.${v}`, help: `inspect.view.${v}`,
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { view: v },
    on: { click: () => { state.view = v; sync(); } },
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
  const changesCount = el('span', { class: 'inspect-changes net-changes-count', attrs: { role: 'status' } });
  const undoButton = el('button', { class: 'v2-btn v2-small inspect-undo', i18n: 'inspect.undo', attrs: { type: 'button' }, on: { click: () => undo() } });
  const resetButton = el('button', { class: 'v2-btn v2-small inspect-reset', i18n: 'inspect.resetNetwork', attrs: { type: 'button' }, on: { click: () => resetNetwork() } });
  // "Ver original": un botón de resorte (D13). Vale mientras se mantiene apretado, con el mouse o con la
  // barra espaciadora; no toca la lista de cambios.
  function holdOriginal(on) {
    const next = Boolean(on) && changes.count > 0;
    if (next === originalHeld) return;
    originalHeld = next;
    setAttr(originalButton, 'aria-pressed', String(next));
    displayed.trace = null;
    if (next) announce(t('inspect.original.banner'));
    relabel();
    draw();
  }
  const originalButton = el('button', {
    class: 'v2-btn v2-small inspect-original-view', i18n: 'inspect.original.view', dataset: { focus: 'keep' },
    attrs: { type: 'button', 'aria-pressed': 'false' },
    on: {
      pointerdown: (e) => { if (e.button === 0) holdOriginal(true); },
      pointerup: () => holdOriginal(false),
      pointerleave: () => holdOriginal(false),
      pointercancel: () => holdOriginal(false),
      blur: () => holdOriginal(false),
      keydown: (e) => { if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) holdOriginal(true); } },
      keyup: (e) => { if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); e.stopPropagation(); holdOriginal(false); } },
    },
  });
  const zoomOut = el('button', { class: 'v2-btn v2-small inspect-zoom', i18n: 'camera.zoomOut', help: 'inspect.zoomOut', i18nAttr: 'aria-label:camera.zoomOut.label', attrs: { type: 'button' }, on: { click: () => inspector.zoomOut() } });
  const zoomIn = el('button', { class: 'v2-btn v2-small inspect-zoom', i18n: 'camera.zoomIn', help: 'inspect.zoomIn', i18nAttr: 'aria-label:camera.zoomIn.label', attrs: { type: 'button' }, on: { click: () => inspector.zoomIn() } });
  const zoomReset = el('button', { class: 'v2-btn v2-small inspect-zoom-reset', i18n: 'inspect.zoomReset', help: 'inspect.zoomReset', attrs: { type: 'button' }, on: { click: () => inspector.resetView() } });
  const zoomGroup = el('div', { class: 'inspect-zoom-group', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.zoom.label' }, zoomOut, zoomIn, zoomReset);
  // "Flujo": marcas que viajan por las conexiones con señal mientras la red maneja (D10).
  const flowSwitch = el('button', {
    class: 'v2-switch inspect-flow', help: 'inspect.flow', dataset: { focus: 'keep' },
    attrs: { type: 'button', role: 'switch', 'aria-checked': String(flowOn) },
    on: { click: () => { flowOn = !flowOn; setAttr(flowSwitch, 'aria-checked', String(flowOn)); draw(); } },
  }, el('span', { class: 'v2-switch-track', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: 'inspect.flow' }));
  // La barra de arriba de la red en tres grupos rotulados (red-al-centro D3): Vista, Conexiones y Acercar.
  const netBarParts = netBar({
    title: netTitle, idPrefix: 'inspect',
    groups: [
      { id: 'view', labelKey: 'net.bar.view', children: [viewGroup, flowSwitch] },
      { id: 'links', labelKey: 'net.bar.links', help: 'inspect.filter', children: [filterGroup, collapseAll] },
      { id: 'zoom', labelKey: 'net.bar.zoom', children: [zoomGroup] },
    ],
  });
  const controls = netBarParts.node;
  // Los cambios de prueba, en una franja aparte que aparece solo con cambios (red-al-centro D3).
  const changesStrip = createChangesStrip({ text: changesCount, buttons: [undoButton, resetButton, originalButton], label: 'inspect.changes.label' });
  let pillDragging = false; // un arrastre de la pastilla sobre la red: la franja no aparece hasta soltar
  // Con la red por debajo de 600 px, la barra de reproducción usa los nombres sin atajo (consulta 5.1).
  const NARROW_BAR = 600;
  let narrowBar = false;
  const placeZoom = () => {
    const narrow = controls.clientWidth > 0 && controls.getBoundingClientRect().width < NARROW_BAR;
    setData(controls, 'narrow', String(narrow));
    // Con la red angosta, la barra de reproducción usa los nombres sin atajo (operacion-por-operacion
    // D7, consulta 5.1); el atajo sigue en el tooltip.
    if (narrow !== narrowBar) { narrowBar = narrow; barLabels(); }
  };
  const barObserver = new ResizeObserver(() => placeZoom());
  barObserver.observe(controls);

  // Red: diagrama y tabla, en la misma zona.
  const area = el('div', {
    class: 'inspect-area', attrs: { role: 'group', 'aria-labelledby': 'inspect-net-title' },
    // Escape con el foco en la red (diagrama o tabla) suelta lo elegido.
    on: { keydown: (e) => { if (e.key === 'Escape' && state.selected) { e.preventDefault(); e.stopPropagation(); select(null); } } },
  });
  const diagram = el('div', { class: 'inspect-diagram' });
  const tableZone = el('div', { class: 'inspect-table-zone' });
  area.append(diagram, tableZone);
  const inspector = createNetworkInspector({
    container: diagram, i18n,
    onSelect: (target) => select(target),
    onViewChange: () => { layoutKey = ''; },
    // Pastilla sobre la conexión elegida (D8): el mismo cambio que el deslizador del detalle.
    onPill: {
      change: (value) => { pillDragging = true; if (state.selected && state.connection !== null && !originalHeld) setWeight(state.connection, value); },
      end: () => { pillDragging = false; sync(); },
    },
  });
  // Encabezados de capa sobre el diagrama (D6): botones de verdad que siguen a su columna.
  const headerLayer = el('div', { class: 'inspect-headers' });
  const neuronLayer = el('div', { class: 'inspect-neurons', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.neurons.label', on: { keydown: (e) => onNeuronKey(e) } });
  inspector.overlay.append(headerLayer, neuronLayer);
  let headerButtons = [];
  // Rótulo "Entra" de las entradas del diagrama (sistema-de-diseno-base 5.2): debajo de la cabecera de la capa 0.
  // "Decide", debajo de la cabecera de la primera capa que calcula (la oculta, o la de salida si no hay).
  const inputTag = roleTag('in');
  const decideTag = roleTag('decide', { which: 'network' });
  i18n.translateTree(inputTag);
  i18n.translateTree(decideTag);
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
    headerLayer.append(inputTag, decideTag);
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
    focusNeuron(state.selected ?? focusTarget, { focus: false }); // la elegida es la entrada a la red con Tab
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
    // La cuenta del último cuadro, si es de esta red (después de cambiar de cerebro, todavía no).
    const last = displayed.trace;
    const trace = last && last.layers.length === net.sizes.length && last.layers.every((L, k) => L.neurons.length === net.sizes[k]) ? last : traceNow();
    const n = trace.layers[l].neurons[j];
    const c = displayed.cursor;
    const value = !c || c.opsDone(l, j) === 4 ? fmt(n.output) : t(l === 0 ? 'inspect.aria.unread' : 'inspect.aria.pending');
    const flags = [];
    const isSel = Boolean(state.selected) && state.connection === null && state.selected.layer === l && state.selected.neuron === j;
    if (isSel) flags.push(t('inspect.aria.selected'));
    if (n.off) flags.push(t('inspect.aria.off'));
    if (inspector.flickering({ layer: l, neuron: j })) flags.push(t('inspect.aria.flicker'));
    if (l > 0 && (changes.has({ kind: 'bias', layer: l, neuron: j }) || n.weights.some((_, i) => changes.has({ kind: 'weight', layer: l, neuron: j, input: i })))) flags.push(t('inspect.aria.changed'));
    if (l === 0 && state.manual?.[j] !== null && state.manual?.[j] !== undefined) flags.push(t('inspect.aria.manual'));
    const label = t('inspect.aria.neuron', { layer: layerName(t, l, net.sizes.length), name: neuronLabel(t, net.sizes, l, j), value })
      + (flags.length ? `. ${flags.join(', ').replace(/^./, (c) => c.toUpperCase())}` : '');
    if (b.getAttribute('aria-label') !== label) b.setAttribute('aria-label', label);
    b.setAttribute('aria-pressed', String(isSel));
  }

  // Operación en curso y reproducción (D7 y D7c)
  // La franja (operacion-por-operacion D4): de a operaciones, cuatro renglones de alto fijo (lugar y
  // paso; la cuenta con el nombre de cada número; una frase; el recorrido de la neurona). Con los otros
  // tamaños, el resumen de dos renglones. Fuera del árbol de accesibilidad: el anuncio lleva la cuenta.
  const opPlace = el('span', { class: 'op-place' });
  const opStepText = el('span', { class: 'op-step' });
  const opMath = el('div', { class: 'op-math num' });
  const opSay = el('p', { class: 'op-say' });
  const opTrack = el('ol', { class: 'op-track' });
  const opFine = el('div', { class: 'op-fine' }, el('div', { class: 'op-head' }, opPlace, opStepText), opMath, opSay, opTrack);
  const opSummary = el('p', { class: 'op-summary' });
  const opStrip = el('div', { class: 'inspect-op', attrs: { 'aria-hidden': 'true' }, dataset: { mode: 'summary' } }, opFine, opSummary);
  let opKey = '';
  /** Escribe la franja; rehace la cuenta y el recorrido solo si cambiaron. */
  function writeStrip(trace) {
    const fine = playback.size === 'operation';
    setData(opStrip, 'mode', fine ? 'fine' : 'summary');
    if (!fine) {
      write(opSummary, lastStep ? describeStep({ t, fmt, size: lastStep.size, last: lastStep.last, trace, sizes: net.sizes }) : t('inspect.op.idle'));
      opKey = '';
      return;
    }
    // De a operaciones: la última hecha, si fue de a una; si no, la que se acaba de completar.
    const last = cursor.position;
    if (!last) {
      write(opPlace, t('inspect.op.idleFine'));
      write(opStepText, '');
      if (opKey !== 'idle') { opKey = 'idle'; opMath.replaceChildren(); opTrack.replaceChildren(); write(opSay, t('inspect.op.idle')); }
      return;
    }
    const d = describeOperation({ t, fmt, last, trace, sizes: net.sizes, cursor, manual: state.manual });
    write(opPlace, d.place);
    write(opStepText, d.step);
    write(opSay, d.say);
    setAttr(opSay, 'title', d.say);
    const key = `${i18n.language}|${JSON.stringify(d.tokens)}|${JSON.stringify(d.track)}`;
    if (key === opKey) return;
    opKey = key;
    opMath.replaceChildren(...d.tokens.map((k) => {
      if (k.kind === 'sym') return el('span', { class: 'op-sym' }, k.text);
      return el('span', { class: k.kind === 'fn' ? 'op-term op-fn' : 'op-term', dataset: { result: String(Boolean(k.result)) } },
        el('span', { class: 'op-num' }, k.text), el('span', { class: 'op-name', help: k.help }, k.name));
    }));
    opTrack.replaceChildren(...d.track.marks.map((m) => el('li', { class: 'op-mark', dataset: { state: m.state, wide: String(Boolean(m.wide)) } },
      m.state === 'done' ? el('span', { class: 'op-tick' }, '✓') : null, el('span', {}, m.label))));
  }
  const playButton = el('button', { class: 'v2-btn v2-small inspect-play', attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: () => togglePlay() } });
  // Acción principal (jerarquia-de-botones D3): la marcha; con el caso del choque, "Reintentar desde acá" (sync).
  const stepButton = el('button', { class: 'v2-btn v2-small inspect-step', i18n: 'inspect.step', help: 'inspect.step', attrs: { type: 'button' }, on: { click: () => stepOnce() } });
  // Paso atrás (operacion-por-operacion D7): deshace dentro del cuadro; al principio no tiene efecto.
  const backButton = el('button', { class: 'v2-btn v2-small inspect-back', i18n: 'inspect.back', help: 'inspect.back', attrs: { type: 'button', 'aria-disabled': 'false' }, on: { click: () => stepBack() } });
  const sizeButtons = STEP_SIZES.map((s) => el('button', {
    class: 'v2-segment', i18n: `inspect.size.${s}`, help: `inspect.size.${s}`,
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { size: s, focus: 'keep' },
    on: { click: () => setSize(s) },
  }));
  const sizeGroup = el('div', { class: 'inspect-size', attrs: { role: 'group', 'aria-labelledby': 'inspect-size-label' } },
    el('span', { class: 'inspect-label', i18n: 'inspect.size.label', help: 'inspect.size', attrs: { id: 'inspect-size-label' } }),
    el('div', { class: 'v2-segments' }, sizeButtons));
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
    el('div', { class: 'inspect-playbar-main' }, playButton, stepButton, backButton, sizeGroup),
    el('div', { class: 'inspect-playbar-pace' }, paceGroup, where));
  const netZone = el('div', { class: 'inspect-net' }, controls, area, opStrip);
  controls.append(changesStrip.node); // la franja va dentro de la barra de arriba de la red, debajo de los grupos
  zone.classList.add('v2-zone-net');
  zones.scene.append(netZone);
  band.append(playbar);
  // La copia de la V1 escribe estos textos con el diccionario al dibujar (encabezados de capa, cuadro, ritmo y la
  // operación en curso): son datos para la auditoría de textos de la V2.
  for (const n of [headerLayer, tableZone, opStrip, where, paceValue]) n.dataset.freeText = '';
  queueMicrotask(() => { for (const n of [replayValue, announcer, compareAnnouncer, linkDetail.node, card.node]) n.dataset.freeText = ''; });

  // ==================================================================================================
  // Zona izquierda: la escena con su cámara y la decisión (red-al-centro D2)
  // ==================================================================================================
  // La escena se enfoca con un clic o con "Manejar vos" (no con Tab, como el escenario: un tooltip sobre toda
  // la escena estorbaría); con el foco en ella, las flechas toman el volante (manejar-vos D3). Usa la cámara del
  // escenario grande con el encuadre de los rayos; la tecla V sigue siendo de la red.
  const scene = el('div', { class: 'inspect-scene', attrs: { tabindex: '-1', role: 'group' }, i18nAttr: 'aria-label:inspect.scene.label' });
  const sceneView = createStageView({ container: scene, store: scenery, doc, framing: 'rays', resetKey: false });
  const manualText = el('span', { i18n: 'inspect.manual.badge' });
  const releaseButton = el('button', { class: 'v2-btn v2-small inspect-release', i18n: 'inspect.manual.release', help: 'inspect.manual.release', attrs: { type: 'button' }, on: { click: () => { releaseManual({ announceIt: true }); sync(); } } });
  const manualBadge = el('div', { class: 'v2-badge inspect-manual-badge', attrs: { role: 'status' } }, manualText, releaseButton);
  const crashBadge = el('div', { class: 'v2-badge crash-badge', attrs: { role: 'status' }, i18n: 'inspect.crash' });
  const pausedBadge = el('div', { class: 'v2-badge pause-badge', i18n: 'inspect.paused' });
  // La entrada que se lee (operacion-por-operacion, "La entrada que se lee, en la escena"): un sensor se ve
  // en su rayo; la velocidad, en este aviso.
  const speedBadge = el('div', { class: 'v2-badge inspect-speed-badge' });
  // Manejar vos (D5): el aviso arriba, con "Devolver el volante"; se apila con el de entradas a mano.
  const giveBackButton = el('button', {
    class: 'v2-btn v2-small inspect-give-back', i18n: 'inspect.drive.giveBack', help: 'inspect.drive.giveBack', dataset: { focus: 'keep' },
    attrs: { type: 'button' }, on: { click: () => giveBack() },
  });
  const driveBadge = el('div', { class: 'v2-badge inspect-drive-badge', attrs: { role: 'status' } },
    el('span', { i18n: 'inspect.drive.badge' }), giveBackButton);
  const driveButton = el('button', {
    class: 'v2-btn inspect-drive', i18n: 'inspect.drive.take', help: 'inspect.drive.take', dataset: { focus: 'keep' },
    attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: () => toggleDriver() },
  });
  // "Manejar vos" va en el renglón de la cámara, con la altura normal; los avisos, en la esquina de la escena.
  sceneView.controls.append(driveButton);
  sceneView.corner.append(driveBadge, manualBadge, crashBadge, pausedBadge, speedBadge);
  sceneView.corner.classList.add('inspect-scene-badges');
  const descriptionText = el('p', { class: 'v2-sr-only', attrs: { id: 'v2-entender-description', 'data-free-text': '' } });
  scene.append(descriptionText);
  scene.setAttribute('aria-describedby', descriptionText.id);
  const description = { set: (text) => { if (descriptionText.textContent !== text) descriptionText.textContent = text; } };
  const decision = actionBlock({ i18n, role: true });
  // Manejando la persona (manejar-vos D4): "Vos" y "La red" lado a lado, y cuánto coincidieron.
  const compare = actionCompare({ i18n });
  const matchWindow = createMatchWindow();
  const compareAnnounce = createCompareAnnouncer();
  const compareAnnouncer = el('p', { class: 'v2-sr-only inspect-compare-announcer', attrs: { role: 'status', 'aria-live': 'polite' } });
  let shareAt = -Infinity;
  function resetCompare() { matchWindow.reset(); compareAnnounce.reset(); shareAt = -Infinity; compareAnnouncer.textContent = ''; }
  const decisionNote = el('p', { class: 'v2-muted inspect-decision-note' });
  const decisionTitle = el('h2', { class: 'panel-heading', i18n: 'inspect.decision.title', help: 'inspect.decision', attrs: { id: 'inspect-decision-title', tabindex: '0' } });
  const decisionBlock = el('section', { class: 'inspect-decision', attrs: { 'aria-labelledby': 'inspect-decision-title' } },
    decisionTitle, decision.node, compare.node, decisionNote, compareAnnouncer);
  // Caso del choque (red-al-centro D5): la tarjeta debajo de la decisión y la repetición sobre la escena.
  const caseTitle = el('h2', { class: 'inspect-case-title', attrs: { id: 'inspect-case-title' } });
  const caseWhen = el('p', { class: 'inspect-case-when' });
  const caseDecision = el('p', { class: 'inspect-case-line' });
  const caseNeuron = el('p', { class: 'inspect-case-line inspect-case-neuron' });
  const pickButton = el('button', { class: 'v2-btn inspect-case-pick', i18n: 'inspect.case.pick', help: 'inspect.case.pick', dataset: { focus: 'keep' }, attrs: { type: 'button' }, on: { click: () => pickContributor() } });
  const caseNote = el('p', { class: 'v2-muted inspect-case-note' });
  const retryButton = el('button', { class: 'v2-btn inspect-case-retry', i18n: 'inspect.case.retry', help: 'inspect.case.retry', attrs: { type: 'button' }, on: { click: () => retry() } });
  const caseRestart = el('button', { class: 'v2-btn inspect-case-restart', i18n: 'inspect.case.restart', help: 'inspect.case.restart', attrs: { type: 'button' }, on: { click: () => restart() } });
  const caseCard = el('section', { class: 'inspect-case', attrs: { 'aria-labelledby': 'inspect-case-title' }, dataset: { state: 'crash' } },
    caseTitle, caseWhen, caseDecision, el('div', { class: 'inspect-case-row' }, caseNeuron, pickButton), caseNote,
    el('div', { class: 'inspect-case-actions' }, retryButton, caseRestart));
  caseCard.hidden = true;
  const replayInput = el('input', {
    class: 'inspect-replay-input', help: 'inspect.replay', i18nAttr: 'aria-label:inspect.replay.label', dataset: { focus: 'keep' },
    attrs: { type: 'range', min: String(-(CASE_FRAMES - 1)), max: '0', step: '1', value: String(-CASE_START) },
    on: { input: () => setCaseOffset(Number(replayInput.value)) },
  });
  replayInput.dataset.keepsFocus = 'true';
  // Las flechas mueven la repetición y no llegan a ningún atajo de la ventana: no toman el volante.
  replayInput.addEventListener('keydown', (e) => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key)) e.stopPropagation(); });
  const replayValue = el('span', { class: 'inspect-replay-value', attrs: { 'aria-hidden': 'true' } });
  const replay = el('div', { class: 'inspect-replay' },
    el('span', { class: 'inspect-replay-label', i18n: 'inspect.replay.label', attrs: { 'aria-hidden': 'true' } }), replayInput, replayValue);
  replay.hidden = true;
  scene.append(replay);
  // Leyenda de cinco renglones (D11): signo; grosor; brillo y relleno; sesgo; y las marcas.
  const swatches = (...classes) => el('span', { class: 'inspect-legend-swatches', attrs: { 'aria-hidden': 'true' } }, classes.map((c) => el('span', { class: c })));
  const legendItem = (sw, key) => el('li', { class: 'inspect-legend-item' }, sw, el('span', { i18n: key }));
  const mark = (cls, key, help) => el('span', { class: `lg-mark ${cls}`, ...(help ? { help, attrs: { tabindex: '0' } } : {}) }, el('i', { attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: key }));
  const legend = el('section', { class: 'v2-guide-only inspect-legend', attrs: { 'aria-labelledby': 'inspect-legend-title' } },
    el('h2', { class: 'panel-heading', i18n: 'inspect.legend.title', attrs: { id: 'inspect-legend-title' } }),
    el('ul', { class: 'inspect-legend-list' },
      legendItem(swatches('lg-pos', 'lg-neg'), 'inspect.legend.sign'),
      legendItem(swatches('lg-thick'), 'inspect.legend.width'),
      legendItem(swatches('lg-dim', 'lg-bright', 'lg-fill'), 'inspect.legend.signal'),
      legendItem(swatches('lg-bias'), 'inspect.legend.bias'),
      el('li', { class: 'inspect-legend-item inspect-legend-marks' },
        mark('lg-selected', 'inspect.legend.mark.selected'), mark('lg-current', 'inspect.legend.mark.current'),
        mark('lg-off', 'inspect.legend.mark.off'), mark('lg-changed', 'inspect.legend.mark.changed'),
        // Lo que titubea (sin-destellos-en-la-red D4): en el renglón de las marcas, para seguir en cinco.
        mark('lg-flicker', 'inspect.legend.mark.flicker', 'flicker'))));
  const announcer = el('p', { class: 'v2-sr-only', attrs: { role: 'status', 'aria-live': 'polite' } });
  function announce(text) { announcer.textContent = ''; announcer.textContent = text ?? ''; }
  // La viñeta (maqueta D): la placa con la pregunta, el auto, la decisión y el caso del choque, al costado de la red.
  const consignaText = el('p', { class: 'v2-consigna', i18n: 'consigna.inspect' });
  plate.append(consignaText);
  const leftZone = el('div', { class: 'inspect-left v2-net-vignette' }, plate, scene, decisionBlock, caseCard, announcer);
  zones.scene.parentElement.append(leftZone);

  // ==================================================================================================
  // Panel: guía, cerebro, tarjeta y misiones
  // ==================================================================================================
  const intro = el('p', { class: 'v2-guide-only inspect-intro', i18n: 'inspect.guide' });
  // Plegado bajo "Más sobre esta pestaña" (tarjeta-de-consigna D10); con algo elegido cede su lugar.
  const introBody = el('div', { class: 'v2-more-body', attrs: { hidden: true, id: 'v2-entender-more' } }, intro);
  const introButton = el('button', { class: 'v2-more', help: 'stage.more', attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': introBody.id, 'data-v1': 'guide.more' },
    on: { click: () => { const open = introBody.hidden; introBody.hidden = !open; introButton.setAttribute('aria-expanded', String(open)); } } }, el('span', { i18n: 'stage.more' }));
  const introMore = el('div', { class: 'v2-guide-only' }, introButton, introBody);
  const brainName = el('span', { class: 'inspect-brain-name' });
  const changeBrain = el('button', {
    class: 'v2-btn v2-small inspect-change-brain', i18n: 'inspect.brain.change', help: 'inspect.brain.change',
    attrs: { type: 'button', 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'inspect-picker' },
    on: { click: () => picker.toggle({ focus: 'current' }) },
  });
  const brainMeta = el('p', { class: 'inspect-brain-meta muted' });
  const brainNotice = el('p', { class: 'v2-muted inspect-brain-notice', attrs: { role: 'status' } });
  const brainSection = el('section', { class: 'inspect-brain', dataset: { freeText: '' }, attrs: { 'aria-labelledby': 'inspect-brain-title' } },
    el('h2', { class: 'v2-sr-only', i18n: 'inspect.brain.title', attrs: { id: 'inspect-brain-title' } }),
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
  // Curva de respuesta (D17), debajo de la cuenta de la tarjeta.
  const curve = createResponseCurve({
    i18n, idPrefix: 'inspect',
    names: (i) => neuronLabel(t, net.sizes, 0, i),
    shortNames: (i) => (i === net.sizes[0] - 1 ? t('inspect.curve.chip.speed') : t('inspect.curve.chip.sensor', { n: i + 1 })),
    onDrag: (i, v) => setManual(i, v),
  });
  card.node.append(curve.node);
  // Dos vistas de la tarjeta (D17): "Cuenta | Respuesta". Arranca en "Cuenta" y se recuerda.
  const viewTabs = ['count', 'response'].map((v) => el('button', {
    class: 'v2-segment', i18n: `inspect.cardView.${v}`, help: `inspect.cardView.${v}`, dataset: { view: v, focus: 'keep' },
    attrs: { type: 'button', 'aria-pressed': 'false' },
    on: { click: () => { state.cardView = v; draw(); } },
  }));
  const viewSwitch = el('div', { class: 'v2-segments inspect-card-views', attrs: { role: 'group' }, i18nAttr: 'aria-label:inspect.cardView.label' }, viewTabs);
  card.node.insertBefore(viewSwitch, card.node.children[1]);
  // Detalle de una conexión (D7).
  const linkDetail = createConnectionDetail({
    i18n, idPrefix: 'inspect', names: (l, j) => neuronLabel(t, net.sizes, l, j),
    onSelectNeuron: (target) => select(target),
    onWeight: (v) => { if (state.selected && state.connection !== null) setWeight(state.connection, v); },
    onToggle: () => { if (state.selected && state.connection !== null) toggleConnection(state.connection); },
  });
  // Sin nada elegido (D7): una frase y atajos a lo que más pasa ahora.
  const shortcutButtons = Array.from({ length: 4 }, () => el('button', {
    class: 'inspect-shortcut', dataset: { focus: 'keep' }, attrs: { type: 'button' },
    on: { click: (e) => { const b = e.currentTarget; if (b.dataset.target) select(JSON.parse(b.dataset.target)); } },
  }));
  const emptyBlock = el('section', { class: 'inspect-empty', dataset: { freeText: '' }, attrs: { 'aria-labelledby': 'inspect-empty-title' } },
    el('p', { class: 'inspect-empty-text', i18n: 'inspect.empty.text', attrs: { id: 'inspect-empty-title' } }),
    el('h3', { class: 'inspect-label inspect-empty-head', i18n: 'inspect.empty.shortcuts' }),
    el('ul', { class: 'inspect-shortcuts' }, shortcutButtons.map((b) => el('li', {}, b))));
  let shortcutsAt = -Infinity;
  /** Atajos: las tres conexiones con más señal ahora y la salida que decide. Como mucho dos veces por segundo. */
  function syncShortcuts(trace, now) {
    if (now - shortcutsAt < 500) return;
    shortcutsAt = now;
    const name = (l, j) => neuronLabel(t, net.sizes, l, j);
    const links = [];
    for (let l = 1; l < trace.layers.length; l++) {
      trace.layers[l].neurons.forEach((n, j) => {
        if (n.off) return;
        n.products.forEach((p, i) => { if (p !== 0 && !n.offConnections?.[i]) links.push({ l, j, i, p }); });
      });
    }
    links.sort((a, b) => (Math.abs(b.p) - Math.abs(a.p)) || (a.l - b.l) || (a.j - b.j) || (a.i - b.i));
    const out = trace.layers.length - 1;
    const outs = trace.layers[out].neurons.map((n, j) => ({ j, on: n.output === 1, total: n.total }));
    outs.sort((a, b) => (Number(b.on) - Number(a.on)) || (b.total - a.total) || (a.j - b.j));
    const items = links.slice(0, 3).map((k) => ({
      target: { layer: k.l, neuron: k.j, input: k.i },
      text: t('inspect.empty.link', { from: name(k.l - 1, k.i), to: name(k.l, k.j), product: fmt(k.p) }), help: 'inspect.empty.link',
    }));
    if (outs.length) items.push({ target: { layer: out, neuron: outs[0].j }, text: t('inspect.empty.output', { name: name(out, outs[0].j) }), help: 'inspect.empty.output' });
    shortcutButtons.forEach((b, k) => {
      const it = items[k];
      b.parentElement.hidden = !it;
      if (!it) return;
      write(b, it.text);
      setData(b, 'target', JSON.stringify(it.target));
      setData(b, 'help', it.help);
    });
  }
  // Cada fila y la tarjeta escriben la misión con la misma vista (tarjeta-de-consigna D2); sin barra.
  const describeMission = (m) => ({
    done: m.done, nameKey: `inspect.mission.${m.id}`,
    statusKey: m.done ? 'train.mission.done' : 'train.mission.pending', fraction: null,
  });
  // Tarjeta de consigna (tarjeta-de-consigna D4): sin marcha, que sigue en la barra de abajo de la red.
  // Al elegir una neurona sigue a la vista; el texto largo cede su lugar (D17 de pestana-inspeccionar).
  // "Mostrame" (misiones-que-muestran-el-control): Paso y «De a: Operación»; o, eligiendo antes con la
  // misma función que el clic, el valor a mano de la primera entrada o Apagar de la primera neurona
  // oculta. El valor a mano solo existe en pausa: para mostrarlo, pausa (decisión a confirmar, design D2).
  // Nunca apaga nada ni cambia un valor.
  // Misión en la hoja Etapa, con "Mostrame" (misiones-que-muestran-el-control): Paso y «De a: Operación»; o,
  // eligiendo antes con la misma función que el clic, el valor a mano de la primera entrada o Apagar de la
  // primera neurona oculta. Nunca apaga nada ni cambia un valor.
  const revealNodes = {
    step: () => stepButton, sizeOperation: () => sizeButtons.find((b) => b.dataset.size === 'operation'),
    manualInput: () => card.node.querySelector('.inspect-input-slider'), turnOff: () => card.node.querySelector('.inspect-off'),
  };
  function revealMission() {
    const current = net ? currentMission(state.missions.missions) : null;
    const target = current && REVEAL[current.id];
    if (!target) return;
    if (target.select) {
      const want = target.select === 'firstInput' ? { layer: 0, neuron: 0 } : { layer: Math.min(1, net.sizes.length - 1), neuron: 0 };
      if (target.select === 'firstInput' && playback.playing) pause();
      if (!sameTarget(want, picked())) select(want);
      draw();
    }
    const nodes = target.targets.map((k) => revealNodes[k]()).filter(Boolean);
    if (nodes[0]?.closest('.v2-sheet')) notebook.reveal(nodes[0]);
    for (const n of nodes) { n.classList.remove('v2-revealed'); void n.offsetWidth; n.classList.add('v2-revealed'); setTimeout(() => n.classList.remove('v2-revealed'), 2400); }
    nodes[0]?.focus?.({ preventScroll: false });
  }
  const consigna = missionNote({ i18n, onReveal: () => revealMission() });
  consigna.node = consigna.element;
  consigna.element.dataset.v1 = 'mission.reveal';
  const missionRevealButton = consigna.element.querySelector('.v2-tertiary');
  const missionRows = state.missions.missions.map((m) => {
    const status = el('span', { class: 'mission-status' });
    const row = el('li', { class: 'mission inspect-mission' }, el('span', { class: 'mission-name', i18n: `inspect.mission.${m.id}` }), status);
    return { id: m.id, row, status };
  });
  // Línea de guía (red-al-centro D4): siempre arriba del detalle, cambia según lo que se mira.
  const guideLine = el('p', { class: 'v2-guide-only inspect-guide-line' });
  // "Soltar" junto al nombre de la neurona o de la conexión elegida: vuelve al panel sin nada elegido.
  const releaseButtons = [card.node, linkDetail.node].map((n) => {
    const b = el('button', {
      class: 'v2-btn v2-small inspect-release-selection', i18n: 'inspect.release', help: 'inspect.release', dataset: { focus: 'keep' },
      attrs: { type: 'button' }, on: { click: () => releaseSelection() },
    });
    n.querySelector('.inspect-card-head')?.append(b);
    return b;
  });
  function releaseSelection() {
    const hadFocus = releaseButtons.some((b) => b.contains(document.activeElement));
    select(null);
    draw(); // los atajos se muestran en el dibujo: tienen que estar a la vista para recibir el foco
    if (hadFocus) (shortcutButtons.find((b) => !b.parentElement.hidden) ?? changeBrain).focus({ preventScroll: true });
  }
  const missions = el('section', { class: 'v2-guide-only inspect-missions' },
    el('h2', { class: 'v2-sr-only', i18n: 'inspect.missions.title' }),
    el('ol', { class: 'mission-list inspect-mission-list' }, missionRows.map((r) => r.row)));
  // Hojas del cuaderno: Neurona (lo elegido, con la línea de guía que sigue a la mano), Etapa (misión y cerebro) y Escenario.
  const sheetNeuron = notebook.sheet('neurona', 'entender.sheet.neuron');
  sheetNeuron.classList.add('inspect-panel', 'v2-sheet-neuron');
  sheetNeuron.append(guideLine, emptyBlock, card.node, linkDetail.node);
  const sheetStage = notebook.sheet('etapa', 'entender.sheet.stage');
  sheetStage.classList.add('inspect-panel');
  sheetStage.append(consigna.node, introMore, brainSection, missions, legend);

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
  // Hoja Escenario: el escenario compartido, con los valores del cerebro "de esta etapa" (como la V1).
  const scenarioSheet = mountScenarioSheet({
    i18n, scenario, stage: STAGE, panel: notebook.sheet('escenario', 'scenario.sheet'),
    v1: { track: 'inspect.bar.track', lanes: 'inspect.bar.lanes', maxSpeed: 'inspect.bar.maxSpeed', density: 'inspect.bar.density', irregularity: 'inspect.bar.irregularity', reset: 'inspect.bar.reset' },
  });
  /** Un cambio del escenario vuelve a empezar el intento, con la misma red y los mismos cambios. */
  const offScenario = scenario.subscribe(() => {
    if (fixing || !brain) return;
    const target = settingsOf();
    if (JSON.stringify(target) === JSON.stringify(state.settings)) return;
    state.settings = target;
    buildWorld();
    sync();
  });

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

  let lastSelected = false;
  /** Controles que no dependen del cuadro: se reescriben al cambiar algo. */
  function sync() {
    const c = candidateOf(state.choice.key);
    const name = nameOf(c);
    setText(netTitle, 'inspect.net.title', { name });
    setAttr(netTitle, 'title', t('inspect.net.title', { name })); // si se corta, se lee entero con el cursor
    write(brainName, name);
    write(brainMeta, `${t('inspect.brain.where', { where: whereOf(brain) })} · ${shapeOf(net)}`);
    brainNotice.hidden = !notice;
    if (notice) setText(brainNotice, notice);
    for (const b of viewButtons) setAttr(b, 'aria-pressed', String(b.dataset.view === state.view));
    for (const b of filterButtons) setAttr(b, 'aria-pressed', String(b.dataset.filter === String(state.filter)));
    const all = state.collapsed.every(Boolean);
    setText(collapseAll, all ? 'inspect.openAll' : 'inspect.collapseAll');
    setData(collapseAll, 'help', all ? 'inspect.openAll' : 'inspect.collapseAll');
    // Deshacer, restablecer y "Ver original": en la franja, que se ve solo con cambios (red-al-centro D3).
    const count = changes.count;
    setText(changesCount, count === 1 ? 'inspect.changes.strip.one' : 'inspect.changes.strip', { value: count });
    setData(changesCount, 'changed', String(count > 0));
    const inSession = count > 0 || [...state.changesBy.values()].some((list) => list.length > 0);
    if (changesStrip.sync({ count, dragging: pillDragging, reserve: inSession })) layoutKey = '';
    for (const [b, key] of [[undoButton, 'inspect.undo'], [resetButton, 'inspect.resetNetwork'], [originalButton, 'inspect.original.view']]) {
      setAttr(b, 'aria-disabled', String(count === 0));
      setData(b, 'help', count === 0 ? `${key}.none` : key);
    }
    if (count === 0 && originalHeld) holdOriginal(false);
    netBarParts.groups.zoom.hidden = state.view !== 'diagram'; // con la tabla de pesos, acercar no tiene efecto
    diagram.hidden = state.view !== 'diagram';
    tableZone.hidden = state.view !== 'table';
    // Reproducción
    barLabels();
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
    const missionList = state.missions.missions;
    const current = currentMission(missionList);
    for (const m of missionList) {
      const r = missionRows.find((x) => x.id === m.id);
      setText(r.status, m.done ? 'train.mission.done' : 'train.mission.pending');
      r.row.dataset.current = String(m.id === current?.id);
    }
    show(consigna.node, Boolean(current));
    if (current?.allDone) consigna.set({ nameKey: 'mission.allDone', done: 1, goal: 1, complete: true });
    else if (current) consigna.set({ nameKey: `inspect.mission.${current.id}`, countKey: 'train.mission.pending', countParams: {}, done: 0, goal: 1 });
    if (missionRevealButton) missionRevealButton.hidden = !(current && REVEAL[current.id]);
    // Elegir algo abre la hoja Neurona (la tarjeta de lo elegido).
    if (state.selected && !lastSelected) notebook.select('neurona');
    lastSelected = Boolean(state.selected);
    // Caso del choque (red-al-centro D5): la tarjeta, la repetición y la acción principal.
    syncCase();
    // Acción principal: la marcha, o "Reintentar desde acá" con el caso del choque a la vista.
    playButton.classList.toggle('v2-primary', !crash);
    retryButton.classList.toggle('v2-primary', Boolean(crash));
    // Línea de guía: el choque, la persona manejando, una conexión, una neurona o nada elegido (D4).
    setText(guideLine, crash ? 'inspect.guideLine.crash' : driving() ? 'inspect.guideLine.driving'
      : state.selected && state.connection !== null ? 'inspect.guideLine.link' : state.selected ? 'inspect.guideLine.neuron' : 'inspect.guideLine.none');
    // Quién maneja
    setAttr(driveButton, 'aria-pressed', String(driving()));
    show(driveBadge, driving());
    setData(scene, 'driver', state.driver);
  }

  /** La tarjeta del caso y el deslizador de la repetición: el título y el lugar del cuadro (el resto, en draw). */
  function syncCase() {
    show(caseCard, Boolean(crash));
    show(replay, Boolean(crash) && memory.length > 1);
    if (!crash) return;
    const titleKey = crash.cause === 'vehicle' ? 'inspect.case.title.vehicle' : crash.circuit ? 'inspect.case.title.edge.circuit' : 'inspect.case.title.edge';
    setText(caseTitle, titleKey, { value: Math.round(crash.meters) });
    const min = String(-(memory.length - 1));
    if (replayInput.min !== min) replayInput.min = min;
    if (Number(replayInput.value) !== crash.offset) replayInput.value = String(crash.offset);
    const at = crash.offset === 0 ? t('inspect.replay.now') : t('inspect.replay.at', { value: secondsText(crash.offset) });
    write(replayValue, at);
    setAttr(replayInput, 'aria-valuetext', at);
    // Desde el cuadro del choque (o muy cerca), reintentar vuelve a chocar enseguida: la tarjeta lo dice.
    setText(caseWhen, crash.offset === 0 ? 'inspect.case.when.crash' : crash.offset > -20 ? 'inspect.case.when.near' : 'inspect.case.when.at', { value: secondsText(crash.offset) });
    show(caseNote, caseChanged());
    if (caseChanged()) setText(caseNote, 'inspect.case.changed');
  }
  /** Decisión y neurona que más aportó en el cuadro que se ve (la cuenta de ese cuadro). */
  function drawCase(trace) {
    if (!crash) return null;
    const c = caseOf(trace);
    const action = (j) => t(`network.output.${OUTPUT_KEYS[j] ?? 'forward'}`);
    if (!c.decision) {
      setText(caseDecision, 'inspect.case.decision.none');
      show(caseNeuron.parentElement, false);
      return null;
    }
    setText(caseDecision, 'inspect.case.decision', { action: action(c.decision.index) });
    show(caseNeuron.parentElement, true);
    if (c.contributor) {
      setText(caseNeuron, 'inspect.case.neuron', { name: capitalize(placeName(t, net.sizes, c.contributor.layer, c.contributor.neuron)), value: `+${fmt(c.contributor.product)}`, action: action(c.decision.index) });
    } else {
      setText(caseNeuron, 'inspect.case.neuron.none', { action: action(c.decision.index) });
    }
    show(pickButton, Boolean(c.contributor));
    return c.contributor;
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
    const marks = originalHeld ? { changedWeights: new Set(), changedBiases: new Set() } : marksOf();
    const culprit = drawCase(trace);
    const common = {
      sizes: net.sizes, trace, cursor: shownCursor, selected: picked(), collapsed: state.collapsed, top, marks, filter: state.filter,
      manual: state.manual ? state.manual.map((v) => v !== null) : null,
    };
    const pillLink = !originalHeld && state.selected && state.connection !== null ? state.selected : null;
    const pill = pillLink ? {
      ...weightRange(net.layers[pillLink.layer - 1].weights[pillLink.neuron][state.connection]),
      name: t('inspect.pill.label', { from: neuronLabel(t, net.sizes, pillLink.layer - 1, state.connection), to: neuronLabel(t, net.sizes, pillLink.layer, pillLink.neuron) }),
      help: 'inspect.pill',
    } : null;
    // Flujo: corre mientras la reproducción avanza sola de a cuadros; quieto en pausa; no se ve en el paso a
    // paso, durante la animación de un paso ni con menos movimiento.
    const flow = !flowOn || reducedMotion() || playback.size !== 'frame' || anim ? 'off' : playback.playing ? 'run' : 'frozen';
    // La red corre de corrido (sin-destellos-en-la-red D3): lo que titubea se ve quieto; en pausa o paso a
    // paso, todo exacto.
    const live = playback.playing && playback.size === 'frame';
    inspector.render({ ...common, pill, flow, live, animation: anim, stepSize: playback.size, visible: state.view === 'diagram', headerRows, culprit, banner: originalHeld ? t('inspect.original.banner') : null });
    table.render({ ...common, live, visible: state.view === 'table', changesVersion: changes.version, filter: state.filter, stepSize: playback.size });
    placeOverlay();
    // Nombres accesibles de las neuronas (capa, nombre, valor y estado): dos veces por segundo.
    if (++labelTick % 30 === 0 || labelTick === 1) neuronButtons.forEach((row, l) => row.forEach((b, j) => labelNeuron(b, l, j)));

    // Operación en curso: en pausa y al reproducir de a capas, neuronas u operaciones (D7c).
    show(opStrip, !realTime);
    if (!realTime) writeStrip(trace);
    write(where, whereText({ t, frame: world.steps, sizes: net.sizes, cursor: shownCursor ?? cursor, realTimePlaying: realTime }));
    // "Atrás" sin efecto al principio del primer cuadro guardado (o reproduciendo en tiempo real, que no tiene pasos).
    const canBack = !realTime && (cursor.started || (crash ? crash.offset > -(memory.length - 1) : memory.length > 1));
    setAttr(backButton, 'aria-disabled', String(!canBack));
    setData(backButton, 'help', canBack ? 'inspect.back' : 'inspect.back.none');

    // Escena: rayos con el peso de la neurona elegida si recibe los sensores (D9).
    const sel = state.selected;
    const sensors = brain.sensors.count;
    let rayLooks = null;
    if (sel && sel.layer === 1) {
      const n = trace.layers[1].neurons[sel.neuron];
      const maxW = maxWeightOfTrace(trace);
      rayLooks = Array.from({ length: sensors }, (_, i) => ({ ...weightStyle(n.weights[i], maxW), off: Boolean(n.offConnections?.[i]) }));
    }
    const raysOff = Array.from({ length: sensors }, (_, i) => trace.layers[0].neurons[i].off);
    const paused = !playback.playing;
    // La entrada que se acaba de leer, de a operaciones o de a neuronas, hasta el paso siguiente.
    const lastOp = !realTime && (playback.size === 'operation' || playback.size === 'neuron') ? cursor.position : null;
    const reading = lastOp && lastOp.op === 'read' ? lastOp.neuron : null;
    const highlight = reading === null && sel && sel.layer === 0 && sel.neuron < sensors ? sel.neuron : null;
    show(speedBadge, reading !== null && reading >= sensors);
    if (reading !== null && reading >= sensors) write(speedBadge, t('inspect.scene.speed', { value: fmt(trace.inputs[reading]) }));
    sceneView.render(world, {
      showSensors: true,
      rays: {
        looks: rayLooks, off: raysOff, highlight, reading: reading !== null && reading < sensors ? reading : null,
        handles: paused ? { readings: trace.inputs.slice(0, sensors), onDrag: (i, v) => setManual(i, v) } : null,
      },
    });
    show(manualBadge, Boolean(state.manual));
    show(crashBadge, Boolean(crash));
    show(pausedBadge, !playback.playing && !crash);

    // Decisión: las cuatro acciones; sin decidir mientras la cuenta no llegó a las salidas.
    const outLayer = net.sizes.length - 1;
    const decided = !shownCursor || net.sizes[outLayer] === 0 || Array.from({ length: net.sizes[outLayer] }, (_, j) => shownCursor.opsDone(outLayer, j)).every((x) => x === 4);
    // De corrido, la tecla que titubea se ve quieta y rayada (sin-destellos-en-la-red D4); en pausa, exacta.
    const theirs = Object.fromEntries(ACTIONS.map((a) => [a, decided && trace.outputs[OUTPUT_KEYS.indexOf(a)] === 1]));
    const liveKeys = playback.playing && playback.size === 'frame';
    const you = driving();
    show(decision.node, !you);
    show(compare.node, you);
    setText(decisionTitle, you ? 'inspect.decision.title.compare' : 'inspect.decision.title');
    if (!you) {
      decision.update(theirs, { live: liveKeys, now });
      setData(decision.node, 'undecided', String(!decided));
      setText(decisionNote, decided ? (state.manual ? 'inspect.decision.manual' : 'inspect.decision.live') : 'inspect.decision.undecided');
    } else {
      // La fila "La red" pasa por la misma guarda de destellos que la decisión de una fila (D4).
      const mine = keyboard.control();
      compare.update(mine, theirs, { live: liveKeys, now, decided });
      // Cuánto coincidieron: se reescribe como mucho cuatro veces por segundo, para poder leerlo.
      if (now - shareAt >= 250) { shareAt = now; const p = matchWindow.percent(); setText(decisionNote, p === null ? 'inspect.compare.empty' : 'inspect.compare.share', p === null ? undefined : { value: p }); }
      const key = `${ACTIONS.map((a) => Number(Boolean(mine[a]))).join('')}|${decided ? ACTIONS.map((a) => Number(theirs[a])).join('') : '?'}`;
      if (compareAnnounce.offer(key, now)) {
        compareAnnouncer.textContent = t('inspect.compare.announce', { you: actionsText(mine), network: decided ? actionsText(theirs) : t('inspect.decision.undecided'), share: shareText() });
      }
    }

    // Panel (D7): nada elegido, la tarjeta de la neurona o el detalle de la conexión.
    const isLink = Boolean(sel) && state.connection !== null;
    show(emptyBlock, !sel);
    setData(introMore, 'selection', String(Boolean(sel))); // con algo elegido, el texto cede su lugar (D17)
    show(card.node, Boolean(sel) && !isLink);
    show(linkDetail.node, isLink);
    const shownChanges = originalHeld ? NO_CHANGES : changes;
    if (!sel) syncShortcuts(trace, now);
    else shortcutsAt = -Infinity; // al soltar, los atajos se escriben enseguida
    if (sel && !isLink) {
      card.sync({
        target: sel, sizes: net.sizes, trace, changes: shownChanges, original: net, cursor: shownCursor,
        top: top && sel.layer > 0 ? top[sel.layer][sel.neuron] : null,
        paused, manual: state.manual, connection: state.connection, stepSize: playback.size,
        flicker: inspector.sides(sel),
      });
      const hasViews = sel.layer > 0;
      show(viewSwitch, hasViews);
      const view = hasViews ? state.cardView : 'count';
      setData(card.node, 'view', view);
      for (const b of viewTabs) setAttr(b, 'aria-pressed', String(b.dataset.view === view));
      show(curve.node, view === 'response');
      if (view === 'response') {
        curve.sync({
          net, inputs: trace.inputs, trace, target: sel, changes: originalHeld ? null : changes,
          range: (i) => (i === net.sizes[0] - 1 ? [-1, 1] : [0, 1]), draggable: paused && !originalHeld,
        });
      }
    }
    if (isLink) {
      const n = trace.layers[sel.layer].neurons[sel.neuron];
      const i = state.connection;
      const orig = net.layers[sel.layer - 1].weights[sel.neuron][i];
      linkDetail.sync({
        target: { layer: sel.layer, neuron: sel.neuron, input: i },
        weight: n.weights[i], original: shownChanges.has({ kind: 'weight', layer: sel.layer, neuron: sel.neuron, input: i }) ? orig : null,
        rangeFrom: orig, input: n.from[i], product: n.products[i], share: linkShare(n, i),
        off: Boolean(n.offConnections?.[i]), computed: !shownCursor || shownCursor.opsDone(sel.layer, sel.neuron) > 0,
      });
    }
    const sceneState = t(paused ? 'inspect.paused' : 'inspect.playing') + (driving() ? t('inspect.drive.describe') : '');
    description.set(t('inspect.scene.description', { track: t(`track.${state.settings.track}`), state: sceneState }));
  }

  /** Coincidencia de los últimos 10 s, en una frase. */
  function shareText() {
    const p = matchWindow.percent();
    return p === null ? t('inspect.compare.empty') : t('inspect.compare.share', { value: p });
  }
  /** Las acciones encendidas, en palabras ("avanzar, izquierda"), o "nada". */
  function actionsText(c) {
    const on = ACTIONS.filter((a) => c[a]).map((a) => t(`drive.action.${a}`).toLocaleLowerCase(i18n.language));
    return on.length ? on.join(', ') : t('inspect.compare.nothing');
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
    const n = playback.tick();
    for (let k = 0; k < n; k++) {
      if (!playback.playing) break; // el choque congela la reproducción (red-al-centro D5)
      if (playback.size === 'frame') {
        if (world.crashed) { if (!crash) openCase(); break; }
        worldStep();
        cursor.complete();
        state.missions.newFrame();
      } else {
        stepCursor(playback.size, { auto: true });
      }
    }
    if (playback.playing) {
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
    if (!visible) return;
    // Una flecha (o W A S D con atajos) con el foco en la escena o en ningún control toma el volante (D3).
    if (!driving() && isDrivingKey(e) && takesWheel(e.target)) {
      try { takeWheel({ focus: false }); } catch (err) { reportError(err); }
      return;
    }
    const action = shortcutFor(e);
    if (!action) return;
    e.preventDefault();
    if (action === 'play') handledSpace = true;
    if (e.repeat && action !== 'step' && action !== 'back') return;
    try {
      if (action === 'play') togglePlay();
      else if (action === 'step') stepOnce();
      else if (action === 'back') stepBack();
      else if (action === 'restart') restart();
      else if (action === 'view') inspector.resetView();
    } catch (err) {
      reportError(err);
    }
  }
  function onKeyUp(e) {
    if (e.code === 'Space' && handledSpace) { handledSpace = false; e.preventDefault(); }
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  const offLanguage = i18n.onChange(() => { layoutKey = ''; sync(); });
  const offLibrary = library ? library.subscribe(() => { refreshCandidates(); if (picker.isOpen) picker.render(); }) : () => {};


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
  const keptSettings = sameBrain ? settingsOf() : null;
  if (sameBrain && state.live && state.live.signature === state.choice.signature) restoreLive();
  else load(resolved.key, { settings: keptSettings });
  // La primera vez arranca reproduciendo; al volver, como se dejó (sin avanzar mientras no estaba a la vista).
  if (firstTime || state.wasPlaying) playback.play();
  buildOverlay();
  focusNeuron(state.selected ?? focusTarget, { focus: false });
  sync();
  draw();
  loop.start();
  if (resolved.updated) announce(t(notice));

  return {
    loop, inspector, table, sceneView, card, placeOverlay,
    draw, sync,
    /** Avanza `frames` cuadros como lo haría el bucle reproduciendo (verificación desde la consola). */
    advance(frames) { for (let k = 0; k < frames; k++) tick(); draw(); },
    /** Memoria de cuadros y caso del choque (verificación desde la consola). */
    get memory() { return memory; },
    get crash() { return crash ? { ...crash } : null; },
    setCaseOffset, retry, pickContributor,
    get world() { return world; },
    get cursor() { return cursor; },
    /** Animación del paso en curso, o null (verificación desde la consola). */
    get animation() { return animation; },
    get changes() { return changes; },
    get brain() { return brain; },
    get state() { return state; },
    get playback() { return playback; },
    show() { visible = true; if (state.wasPlaying) playback.play(); loop.start(); sync(); },
    hide() { visible = false; giveBack({ announceIt: false }); state.wasPlaying = playback.playing; playback.pause(); if (playback.size === 'frame') cursor.complete(); loop.stop(); },
    takeWheel, giveBack, get controller() { return controller; }, get keyboard() { return keyboard; },
    play, pause, stepOnce, stepBack, restart, setSize, select, choose, undo, resetNetwork, toggleNeuron, setWeight, setBias, setManual, toggleLayer, toggleAll,
    unmount() {
      giveBack({ announceIt: false }); // al ocultarse la pestaña, vuelve a manejar la red (D2)
      keyboard.dispose();
      keepChanges();
      state.wasPlaying = playback.playing;
      playback.pause();
      if (playback.size === 'frame') cursor.complete();
      loop.dispose();
      offLanguage();
      offLibrary();
      offScenario();
      scenarioSheet.dispose();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      picker.dispose();
      barObserver.disconnect();
      inspector.dispose();
      table.dispose();
      sceneView.dispose();
    },
  };
}
