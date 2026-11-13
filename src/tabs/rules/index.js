// Pestaña 2, "Reglas a mano": la persona programa el auto escribiendo reglas y lo ve manejar con ellas
// en la misma calle con tráfico de la pestaña 1.
//
// Composición (design.md D6): mundo del núcleo + controlador de reglas + vista + bucle; el tablero con
// los indicadores, la tarjeta del programa (editor, estado, errores y paleta) y la de percepción y
// acción (D11); y el panel con guía, marcha, vista y reintento, programa (ejemplos, restablecer,
// exportar e importar), misiones y configuración avanzada. Lo que se prueba sin DOM vive en
// program.js, session.js, examples.js y shortcuts.js.
//
// El estado vive en variables del módulo, como en Entrenar: el texto, el mundo, los ajustes, la
// semilla, el reintento, las tarjetas y las misiones cumplidas. Al volver a la pestaña se retoma todo.
import es from '../../i18n/es.js';
import en from '../../i18n/en.js';
import { createWorld } from '../../core/world.js';
import { createRulesController, classifyLine, countLines, RULES_LIMITS } from '../../core/rules.js';
import { createStageView } from '../../render/view.js';
import { createLoop } from '../../ui/loop.js';
import { el } from '../../ui/dom.js';
import { returnsFocusToStage } from '../../ui/shortcuts.js';
import { button, switchButton, createTextSetter, inlineConfirm } from '../../ui/controls.js';
import { statStrip, boardCard } from '../../ui/board.js';
import { createCodeEditor } from '../../ui/editor.js';
import { downloadText, readText } from '../../ui/files.js';
import { RULES_PROGRAM_MAX } from '../../ui/preferences.js';
import { perceptionBlock, actionBlock, READINGS_MAX } from '../shared/driving-cards.js';
import { streetAdvanced, setUnavailable } from '../shared/street-advanced.js';
import { trackPicker } from '../shared/track-picker.js';
import { formatFixed } from '../../ui/i18n.js';
import {
  DEFAULT_SETTINGS, needsRestart, normalizeSettings, worldSpec, onCircuit, lapsShown,
} from '../shared/street-settings.js';
import { createProgramState } from './program.js';
import { createRulesSession, MISSIONS, viewOptions } from './session.js';
import {
  DEFAULT_SEED, INITIAL_PROGRAM, EXAMPLES, knownTexts, sensorSettings, settingsForProgram,
} from './examples.js';
import { shortcutFor } from './shortcuts.js';

export { DEFAULT_SEED };

/** Retardo (ms) desde la última tecla hasta analizar el texto y, si es válido, ponerlo a manejar (D7). */
export const COMMIT_DELAY_MS = 250;

/** Textos conocidos (programa inicial y ejemplos, en los dos idiomas): los demás son propios. */
const KNOWN = knownTexts({ es, en });

/** Palabras de la paleta, en orden: papel del vocabulario y tipo de palabra (para su forma). */
const PALETTE_WORDS = Object.freeze([
  ['if', 'keyword'], ['then', 'keyword'], ['and', 'keyword'], ['or', 'keyword'], ['not', 'keyword'],
  ['forward', 'action'], ['reverse', 'action'], ['left', 'action'], ['right', 'action'], ['speed', 'data'],
]);

// Misiones cumplidas y tráficos recorridos: siguen hasta cerrar la aplicación.
const completedMissions = new Set();
const trafficSeeds = new Set();
// Estado conservado entre montajes (se crea al abrir la pestaña por primera vez).
let state = null;

/** Olvida el estado conservado (para pruebas o para reiniciar la aplicación). */
export function resetState() { state = null; }

function createState({ i18n, store, preferences }) {
  const settings = normalizeSettings({
    ...DEFAULT_SETTINGS,
    ...sensorSettings(INITIAL_PROGRAM),
    maxSpeed: store?.get().carSpeed ?? DEFAULT_SETTINGS.maxSpeed,
  });
  const remembered = preferences?.rulesProgram ?? null;
  const text = remembered ?? i18n.t(INITIAL_PROGRAM.textKey);
  const program = createProgramState({ text, sensors: settings.sensorCount });
  const controller = createRulesController({ program: program.valid });
  const seed = DEFAULT_SEED;
  return {
    settings, seed, program, controller,
    world: createWorld({ ...worldSpec(settings, seed), controller }),
    session: createRulesSession({ completed: completedMissions, traffics: trafficSeeds }),
    autoRetry: true,
    showSensors: true,
    machineView: false, // ver como la máquina (circuitos-y-paisaje D13): solo cambia lo que se dibuja
    cards: { program: true, io: true },
    advancedOpen: false,
  };
}

export function mount({ stage, board, panel, i18n, store, preferences, reportError }) {
  state ??= createState({ i18n, store, preferences });
  const { program, controller, session } = state;
  const view = createStageView({ container: stage, store });
  const setText = createTextSetter(i18n);
  const focusStage = () => stage.focus({ preventScroll: true });
  const makeWorld = () => createWorld({ ...worldSpec(state.settings, state.seed), controller });

  // La velocidad máxima es una sola para toda la app: si cambió en otra pestaña, se aplica en marcha.
  const sharedSpeed = store?.get().carSpeed;
  if (sharedSpeed !== undefined && sharedSpeed !== state.settings.maxSpeed) {
    state.settings = normalizeSettings({ ...state.settings, maxSpeed: sharedSpeed });
    state.world.setMaxSpeed(state.settings.maxSpeed);
  }

  // --- Intento -----------------------------------------------------------------------
  function restartAttempt({ countAttempt = true, rebuild = false } = {}) {
    if (rebuild) {
      const paused = state.world.paused;
      state.world = makeWorld();
      if (paused) state.world.pause();
    } else {
      state.world.reset();
    }
    session.restart({ countAttempt });
    view.followCar();
    sync();
  }
  const restart = () => restartAttempt();
  function newTraffic() {
    if (onCircuit(state.settings)) return; // en un circuito no hay tráfico
    state.seed += 1;
    restartAttempt({ rebuild: true });
  }
  function togglePause() {
    if (state.world.paused) state.world.resume();
    else state.world.pause();
    sync();
  }

  // --- Programa: el texto rige mientras se escribe (D7) ------------------------------
  let pending = null; // temporizador del análisis
  let dirty = false; // el texto a la vista todavía no se analizó
  let paletteKey = '';

  /** Analiza el texto del editor y, si es un programa válido distinto, lo pone a manejar. */
  function commit() {
    if (pending !== null) { window.clearTimeout(pending); pending = null; }
    dirty = false;
    const result = program.update(editor.value);
    afterProgramChange(result);
    if (preferences) preferences.rulesProgram = program.text;
  }

  function afterProgramChange(result) {
    if (result.validChanged) controller.setProgram(program.valid);
    if (result.behaviorChanged) session.programChanged();
    renderStatus();
    renderPalette();
  }

  function onEditorChange() {
    dirty = true;
    if (pending !== null) window.clearTimeout(pending);
    pending = window.setTimeout(() => {
      pending = null;
      try { commit(); } catch (err) { reportError(err); }
    }, COMMIT_DELAY_MS);
  }

  // --- Tablero: indicadores ---------------------------------------------------------
  const strip = statStrip([
    { id: 'distance', labelKey: 'drive.stats.distance' },
    { id: 'passed', labelKey: 'drive.stats.passed' },
    { id: 'best', labelKey: 'drive.stats.best' },
    { id: 'rules', labelKey: 'rules.stats.rules' },
  ]);

  // --- Tablero: tarjeta del programa ------------------------------------------------
  const programCard = boardCard({
    id: 'rules-program', titleKey: 'rules.program.title', help: 'rules.program', hintKey: 'rules.program.hint',
    open: state.cards.program, grow: 3, onToggle: (open) => { state.cards.program = open; },
  });
  const editor = createCodeEditor({
    i18n, value: program.text, classify: classifyLine,
    labelKey: 'rules.editor.label', help: 'rules.editor', descriptionKey: 'rules.editor.keys',
    onChange: onEditorChange, onEscape: focusStage,
  });
  const status = el('p', { class: 'rules-status', attrs: { role: 'status' } });
  const errorList = el('ul', { class: 'rules-errors' });
  const palette = el('div', { class: 'guide rules-palette', attrs: { role: 'group' }, i18nAttr: 'aria-label:rules.palette.label' });
  programCard.append(editor.node, status, errorList, palette);

  /** Texto de un error del análisis, con su línea delante. */
  function errorParams(e) {
    const d = e.details;
    switch (e.code) {
      case 'unknownWord':
        return d.suggestion
          ? ['rules.error.unknownWord.suggestion', { line: e.line, word: d.word, suggestion: d.suggestion }]
          : ['rules.error.unknownWord', { line: e.line, word: d.word }];
      case 'unknownSensor':
        return ['rules.error.unknownSensor', { line: e.line, value: d.count, last: `sensor${d.count}`, sensor: `sensor${d.sensor}` }];
      default:
        return [`rules.error.${e.code}`, { line: e.line, ...d }];
    }
  }

  function renderStatus() {
    const errors = program.errors;
    if (errors.length === 0) {
      setText(status, 'rules.status.ok', { value: program.rules });
      status.dataset.state = 'ok';
    } else {
      setText(status, program.valid ? 'rules.status.errors' : 'rules.status.errors.none');
      status.dataset.state = 'errors';
    }
    const items = errors.map((e) => {
      const li = el('li', { class: 'rules-error' });
      const [key, params] = errorParams(e);
      setText(li, key, params);
      return li;
    });
    errorList.replaceChildren(...items);
    errorList.hidden = items.length === 0;
  }

  /** Inserta una palabra donde está el cursor, con un espacio delante si hace falta. */
  function insertWord(word) {
    const input = editor.input;
    const before = input.value.slice(0, input.selectionStart);
    const needsSpace = before.length > 0 && !/[\s(]$/.test(before);
    editor.insert(needsSpace ? ` ${word}` : word);
  }

  function paletteButton({ textKey, text, params, help, helpParams, kind, insert }) {
    const b = el('button', {
      class: `palette-word tok-${kind}`, i18n: textKey, params, text, help,
      attrs: { type: 'button', 'data-help-params': helpParams ? JSON.stringify(helpParams) : null },
      on: { click: () => insertWord(insert()) },
    });
    if (textKey) b.textContent = i18n.t(textKey, params);
    return b;
  }

  /** Rehace la paleta solo si cambió la lista de constantes, la cantidad de sensores o el idioma. */
  function renderPalette() {
    const count = state.settings.sensorCount;
    const constants = program.constants;
    const key = JSON.stringify([count, constants.map((c) => [c.name, c.value]), i18n.language]);
    if (key === paletteKey) return;
    paletteKey = key;
    const words = PALETTE_WORDS.map(([role, kind]) => paletteButton({
      textKey: `rules.word.${role}`, help: `rules.word.${role}`, kind, insert: () => i18n.t(`rules.word.${role}`),
    }));
    const shown = Math.min(count, READINGS_MAX);
    const sensors = Array.from({ length: shown }, (_, i) => paletteButton({
      textKey: 'rules.data.sensor', params: { n: i + 1 }, help: 'rules.word.sensor', helpParams: { n: i + 1 },
      kind: 'data', insert: () => i18n.t('rules.data.sensor', { n: i + 1 }),
    }));
    const more = count > READINGS_MAX
      ? el('span', { class: 'palette-note', i18n: 'rules.palette.more', params: { count, last: `sensor${count}` } })
      : null;
    const names = constants.map((c) => paletteButton({
      text: c.name, help: 'rules.word.constant', helpParams: { name: c.name, value: c.value },
      kind: 'name', insert: () => c.name,
    }));
    palette.replaceChildren(...words, ...sensors, ...(more ? [more] : []), ...names);
    i18n.translateTree(palette);
  }

  // --- Tablero: percepción y acción en una sola tarjeta (D11) ---------------------------
  const ioCard = boardCard({
    id: 'rules-io', titleKey: 'rules.io.title', help: 'rules.io', hintKey: 'rules.io.hint',
    open: state.cards.io, grow: 1, onToggle: (open) => { state.cards.io = open; },
  });
  const perception = perceptionBlock({
    i18n, count: state.world.perception.sensors.length,
    names: { sensorKey: 'rules.data.sensor', speedKey: 'rules.data.speed' },
  });
  const action = actionBlock();
  ioCard.append(el('div', { class: 'rules-io' }, perception.node, action.node));

  board.append(strip.node, programCard.node, ioCard.node);

  // --- Panel: guía, marcha, vista y reintento ---------------------------------------
  const intro = el('section', { class: 'guide rules-intro' }, el('p', { i18n: 'rules.guide' }));

  const pauseButton = button('rules.pause', 'rules.pause', togglePause);
  pauseButton.setAttribute('aria-pressed', 'false');
  const newTrafficButton = button('rules.newTraffic', 'rules.newTraffic', newTraffic, 'tool small');
  const run = el('section', { class: 'drive-run' },
    el('div', { class: 'run-main' }, pauseButton, button('rules.restart', 'rules.restart', restart)),
    el('div', { class: 'run-secondary' }, newTrafficButton));

  // Pista (circuitos-y-paisaje D6): cambiarla reinicia el intento con el mismo programa.
  const picker = trackPicker({ selected: state.settings.track, onSelect: (track) => applySettings({ ...state.settings, track }) });

  const sensorsSwitch = switchButton('rules.sensors', 'rules.sensors', state.showSensors, () => {
    state.showSensors = !state.showSensors;
    sync();
  });
  const retrySwitch = switchButton('rules.retry', 'rules.retry', state.autoRetry, () => {
    state.autoRetry = !state.autoRetry;
    sync();
  });
  // Ver como la máquina (D13): el mismo nombre que en El problema, con una ayuda propia.
  const machineSwitch = switchButton('drive.machine', 'rules.machine', state.machineView, () => {
    state.machineView = !state.machineView;
    sync();
  });
  const viewSwitches = el('div', { class: 'switch-row', attrs: { role: 'group' }, i18nAttr: 'aria-label:rules.view.title' },
    sensorsSwitch, machineSwitch, retrySwitch);

  // --- Panel: programa (ejemplos, restablecer, exportar e importar; D8) ------------------
  const confirm = inlineConfirm({ i18n });
  const message = el('p', { class: 'rules-message', attrs: { role: 'status' } });
  message.hidden = true;
  function showMessage(key, params) {
    setText(message, key, params);
    message.hidden = false;
  }

  /** ¿El texto a la vista fue escrito o cambiado por la persona? */
  function isOwn() {
    if (dirty) commit();
    return program.isOwn(KNOWN);
  }

  /**
   * Reemplaza el programa (un ejemplo, restablecer o importar), con confirmación si el texto es
   * propio. Con `sensors` (un ejemplo o restablecer) cambia primero los sensores del auto y después
   * pone el texto, para que se analice ya con su auto; al final reinicia el intento con ese auto y
   * ese programa (así el intento nuevo cuenta entero con el programa nuevo).
   */
  function replaceProgram(text, sensors, request, after) {
    // Los ejemplos y el programa inicial son para la calle recta: desde un circuito se vuelve a ella
    // y la confirmación lo avisa siempre, aunque el texto no sea propio.
    const leavesCircuit = Boolean(sensors) && onCircuit(state.settings);
    const doReplace = () => {
      if (sensors) {
        state.settings = normalizeSettings(settingsForProgram(state.settings, { sensors }));
        program.setSensors(state.settings.sensorCount);
      }
      editor.setValue(text);
      commit();
      if (sensors) restartAttempt({ rebuild: true });
      sync();
      after?.();
    };
    if (leavesCircuit) confirm.open({ ...request, message: `${request.message}.circuit`, confirmKey: 'rules.confirm.replace', onConfirm: doReplace });
    else if (isOwn()) confirm.open({ ...request, confirmKey: 'rules.confirm.replace', onConfirm: doReplace });
    else doReplace();
  }

  const exampleButtons = EXAMPLES.map((ex) => button(ex.nameKey, `rules.example.${ex.id}`, () => {
    message.hidden = true;
    replaceProgram(i18n.t(ex.textKey), ex.sensors, { message: 'rules.confirm.example', params: { name: i18n.t(ex.nameKey) } });
  }, 'tool small'));
  const resetButton = button('rules.reset', 'rules.reset', () => {
    message.hidden = true;
    replaceProgram(i18n.t(INITIAL_PROGRAM.textKey), INITIAL_PROGRAM.sensors, { message: 'rules.confirm.reset' });
  });
  const exportButton = button('rules.export', 'rules.export', () => {
    downloadText({ fileName: i18n.t('rules.export.fileName'), text: editor.value, type: 'text/plain' });
  });
  const fileInput = el('input', {
    class: 'library-file', help: 'rules.import',
    attrs: { type: 'file', accept: '.txt,text/plain', tabindex: '-1', 'aria-hidden': 'true' },
  });
  const importButton = button('rules.import', 'rules.import', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;
    message.hidden = true;
    try {
      const raw = await readText(file);
      const text = raw.replace(/\r\n?/g, '\n');
      // eslint-disable-next-line no-control-regex
      if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) {
        showMessage('rules.import.notText', { file: file.name });
        return;
      }
      if (text.length > RULES_PROGRAM_MAX || countLines(text) > RULES_LIMITS.lines) {
        showMessage('rules.import.tooLong', { file: file.name });
        return;
      }
      replaceProgram(text, null, { message: 'rules.confirm.import', params: { file: file.name } },
        () => showMessage('rules.import.done', { file: file.name }));
    } catch {
      showMessage('rules.import.notText', { file: file.name });
    }
  });

  const programSection = el('section', { class: 'rules-program-actions' },
    el('h2', { class: 'panel-heading', i18n: 'rules.program.section' }),
    el('div', { class: 'rules-examples', attrs: { role: 'group' }, i18nAttr: 'aria-label:rules.examples' },
      el('span', { class: 'rules-examples-label', i18n: 'rules.examples' }), exampleButtons),
    el('div', { class: 'rules-file-actions' }, resetButton, exportButton, importButton, fileInput),
    confirm.node, message);

  // --- Panel: misiones --------------------------------------------------------------
  const missionRows = MISSIONS.map((m) => {
    const rowStatus = el('span', { class: 'mission-status' });
    const fill = el('span', { class: 'mission-fill' });
    const row = el('li', { class: 'mission' },
      el('span', { class: 'mission-name', i18n: `rules.mission.${m.id}`, params: { goal: m.goal } }),
      rowStatus,
      el('span', { class: 'mission-bar', attrs: { 'aria-hidden': 'true' } }, fill));
    return { id: m.id, row, status: rowStatus, fill };
  });
  const missionList = el('ol', { class: 'mission-list' }, missionRows.map((r) => r.row));
  // En un circuito las misiones (de la calle recta) se ocultan y queda una línea que lo dice.
  const missionsCircuit = el('p', { class: 'caption', i18n: 'drive.missions.circuit' });
  const missions = el('section', { class: 'guide drive-missions' },
    el('h2', { class: 'panel-heading', i18n: 'rules.missions.title' }),
    missionList, missionsCircuit);

  // --- Panel: configuración avanzada (la misma de la pestaña 1) --------------------------
  function applySettings(next, { countAttempt = true } = {}) {
    const before = state.settings;
    state.settings = normalizeSettings(next);
    store?.set({ carSpeed: state.settings.maxSpeed });
    if (state.settings.sensorCount !== before.sensorCount) {
      // Cambiar los sensores vuelve a analizar el programa: si deja de valer, el auto no acciona nada.
      afterProgramChange(program.setSensors(state.settings.sensorCount));
    }
    if (needsRestart(before, state.settings)) {
      restartAttempt({ rebuild: true, countAttempt });
      return;
    }
    if (state.settings.maxSpeed !== before.maxSpeed) state.world.setMaxSpeed(state.settings.maxSpeed);
    if (state.settings.density !== before.density || state.settings.irregularity !== before.irregularity) {
      state.world.setTraffic({ density: state.settings.density, irregularity: state.settings.irregularity });
    }
    sync();
  }
  const advanced = streetAdvanced({
    i18n, settings: state.settings, apply: applySettings, idPrefix: 'rules',
    open: state.advancedOpen, onToggle: (open) => { state.advancedOpen = open; },
  });

  panel.append(
    el('h1', { class: 'sr-only', i18n: 'rules.title' }),
    intro, run, picker.node, viewSwitches, programSection, missions, advanced.node);

  // --- Mensajes sobre el escenario ----------------------------------------------------
  const pauseBadge = el('div', { class: 'stage-badge pause-badge', i18n: 'drive.paused', attrs: { role: 'status' } });
  const machineBadge = el('div', { class: 'stage-badge machine-badge', i18n: 'drive.machine.badge' });
  const crashBadgeText = el('span', {});
  const crashBadge = el('div', { class: 'stage-badge crash-badge', attrs: { role: 'status' } },
    crashBadgeText, el('span', { class: 'crash-badge-retry', i18n: 'rules.crash.retrying' }));
  const crashBody = el('p', {});
  const crashHowto = el('p', { i18n: 'rules.crash.howto' });
  const crashBox = el('div', { class: 'crash-box', attrs: { role: 'alert' } },
    el('h2', { i18n: 'rules.crash.title' }),
    crashBody,
    crashHowto,
    button('rules.restart', 'rules.restart', restart, 'tool primary'));
  const crashLayer = el('div', { class: 'crash-layer' }, crashBox);
  stage.append(el('div', { class: 'stage-badges' }, pauseBadge, machineBadge, crashBadge), crashLayer);

  // --- Sincronizar con el estado ------------------------------------------------------
  const meters = (v) => ({ value: Math.floor(v) });

  function sync() {
    const { world } = state;
    setText(strip.values.distance, 'drive.value.meters', meters(session.distance));
    // En un circuito el segundo indicador muestra las vueltas, con un decimal.
    const circuit = world.track.closed;
    setText(strip.labels.passed, circuit ? 'drive.stats.laps' : 'drive.stats.passed');
    if (circuit) setText(strip.values.passed, 'drive.value.laps', { value: formatFixed(lapsShown(session.distance, world.track.length), 1, i18n.language) });
    else setText(strip.values.passed, 'drive.value.count', { value: session.passed });
    missionList.hidden = circuit;
    missionsCircuit.hidden = !circuit;
    setUnavailable(newTrafficButton, circuit, 'rules.newTraffic');
    picker.select(state.settings.track);
    setText(strip.values.best, 'drive.value.meters', meters(session.best));
    setText(strip.values.rules, 'drive.value.count', { value: program.rules });

    for (const m of session.missions) {
      const r = missionRows.find((x) => x.id === m.id);
      r.row.dataset.done = String(m.done);
      if (m.done) setText(r.status, 'drive.mission.done');
      else setText(r.status, 'drive.mission.progress.vehicles', { value: m.progress, goal: m.goal });
      const width = `${Math.round((m.done ? 1 : m.progress / m.goal) * 100)}%`;
      if (r.fill.style.width !== width) r.fill.style.width = width;
    }

    perception.update(world.perception);
    action.update(controller.controls);
    // Líneas que se cumplen: solo si el texto a la vista es el programa que maneja (y ya se analizó).
    const running = program.showsRunning && !dirty;
    editor.setMarks({
      active: running ? controller.activeLines : [],
      errors: dirty ? [] : program.errors.map((e) => e.line),
    });

    sensorsSwitch.setAttribute('aria-checked', String(state.showSensors));
    machineSwitch.setAttribute('aria-checked', String(state.machineView));
    retrySwitch.setAttribute('aria-checked', String(state.autoRetry));
    pauseButton.setAttribute('aria-pressed', String(world.paused));
    setText(pauseButton, world.paused ? 'rules.resume' : 'rules.pause');
    pauseBadge.hidden = !world.paused;

    const crashed = world.crashed;
    machineBadge.hidden = !(state.machineView && !crashed);
    const crashKey = world.crashCause === 'vehicle' ? 'rules.crash.vehicle' : circuit ? 'rules.crash.edge.circuit' : 'rules.crash.edge';
    setText(crashHowto, circuit ? 'rules.crash.howto.circuit' : 'rules.crash.howto');
    crashBadge.hidden = !(crashed && state.autoRetry);
    crashLayer.hidden = !(crashed && !state.autoRetry);
    if (crashed) {
      setText(state.autoRetry ? crashBadgeText : crashBody, crashKey, meters(session.distance));
    }
    advanced.sync(state.settings);
  }

  // --- Bucle --------------------------------------------------------------------------
  const loop = createLoop({
    step: () => {
      const { world } = state;
      world.step();
      if (session.step(world, { seed: state.seed, autoRetry: state.autoRetry }) === 'retry') restartAttempt();
    },
    render: () => {
      view.render(state.world, viewOptions(state, state.world));
      sync();
    },
    onError: reportError,
  });

  // --- Atajos y foco --------------------------------------------------------------------
  let handledSpace = false;
  function onKeyDown(e) {
    const actionName = shortcutFor(e);
    if (!actionName) return;
    e.preventDefault();
    if (actionName === 'pause') handledSpace = true;
    if (e.target !== stage && typeof e.target?.matches === 'function' && e.target.matches('button, input, summary, a')) focusStage();
    if (e.repeat) return;
    try {
      if (actionName === 'restart') restart();
      else togglePause();
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
  // Tras un clic con el mouse en un control, el foco vuelve al escenario; la paleta lo deja en el editor.
  function onClick(e) {
    if (e.detail === 0 || !e.target?.closest) return;
    if (e.target.closest('.rules-palette, .code-editor')) return;
    if (returnsFocusToStage(e.target)) focusStage();
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  panel.addEventListener('click', onClick);
  board.addEventListener('click', onClick);
  stage.addEventListener('click', onClick);
  const offLanguage = i18n.onChange(() => {
    renderPalette();
    sync();
  });

  renderStatus();
  renderPalette();
  sync();
  loop.start();
  focusStage();

  return {
    view, loop, session, editor, program, controller,
    get world() { return state.world; },
    get settings() { return { ...state.settings }; },
    get seed() { return state.seed; },
    get autoRetry() { return state.autoRetry; },
    restart, newTraffic, togglePause, commit,
    unmount() {
      if (pending !== null) {
        window.clearTimeout(pending);
        pending = null;
        commit(); // lo escrito en el último cuarto de segundo también se recuerda
      }
      loop.dispose();
      offLanguage();
      confirm.dispose();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      panel.removeEventListener('click', onClick);
      board.removeEventListener('click', onClick);
      stage.removeEventListener('click', onClick);
      editor.dispose();
      view.dispose();
    },
  };
}
