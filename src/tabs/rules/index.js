// Pestaña 2, "Reglas a mano": la persona programa el auto escribiendo reglas y lo ve manejar con ellas
// en la misma calle con tráfico de la pestaña 1.
//
// Composición (design.md D6): mundo del núcleo + controlador de reglas + vista + bucle. Dos zonas y
// ningún panel (reglas-mesa-de-trabajo D1): el escenario con la escena, la barra de marcha (marcha,
// interruptores de vista y reintento, y las cifras del intento) y la tarjeta de lo que percibe y acciona;
// y el tablero con la tarjeta de consigna, el texto de guía, la tarjeta del programa (cabecera con la
// cifra de reglas, los sensores, los ejemplos, restablecer, exportar e importar; editor, estado, errores
// y paleta) y las misiones. Al chocar (reglas-el-choque-ensena), la tarjeta del caso ocupa el lugar de la
// marcha, un deslizador sobre la escena repite los últimos 3 s grabados, el cuaderno de casos va entre la
// escena y la marcha, y la comparación con los ejemplos se abre en la tarjeta del programa. El programa
// tiene dos vistas del mismo texto (reglas-como-fichas): fichas, por defecto (cards-view.js), y texto (el
// editor); cada edición de una ficha es un parche del texto por el deshacer del editor. Lo que se prueba
// sin DOM vive en program.js, session.js, examples.js, shortcuts.js, workbench.js, case.js, compare.js y
// cards.js.
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
import { mainAction, applyMainAction } from '../../ui/main-action.js';
import { statStrip, boardCard } from '../../ui/board.js';
import { createCodeEditor } from '../../ui/editor.js';
import { downloadText, readText } from '../../ui/files.js';
import { RULES_PROGRAM_MAX } from '../../ui/preferences.js';
import { perceptionRows, actionBlock, READINGS_MAX } from '../shared/driving-cards.js';
import { setUnavailable } from '../shared/street-advanced.js';
import { scenarioBar } from '../shared/scenario-bar.js';
import { currentMission } from '../../ui/current-mission.js';
import { createConsignaCard, writeMissionRow } from '../shared/consigna-card.js';
import { createMissionReveal } from '../shared/mission-reveal.js';
import { createGuideMore } from '../shared/guide-more.js';
import { formatFixed } from '../../ui/i18n.js';
import { stageDescription } from '../../ui/stage-description.js';
import { drivingDescription } from '../shared/stage-text.js';
import {
  DEFAULT_SETTINGS, needsRestart, normalizeSettings, worldSpec, onCircuit, lapsShown,
} from '../shared/street-settings.js';
import { createProgramState } from './program.js';
import { createRulesSession, MISSIONS, viewOptions } from './session.js';
import {
  DEFAULT_SEED, INITIAL_PROGRAM, EXAMPLES, knownTexts, settingsForProgram, rememberedSensors, programIdOf, normalizeText,
} from './examples.js';
import { compareRuns, compareNotes, compareResult } from './compare.js';
import { caseCondition, frameOf, raysOf } from './case.js';
import { createReplayBuffer } from '../shared/replay-buffer.js';
import { shortcutFor } from './shortcuts.js';
import { roleTag } from '../../ui/role-tag.js';
import { RULES_BAR, scenarioReset, comparisonFor, insertAt } from './workbench.js';
import { patch } from './cards.js';
import { createCardsView } from './cards-view.js';

export { DEFAULT_SEED };

/** Alto mínimo del editor: 10 líneas de 20 px, su relleno (4 + 4) y su borde (D3). */
const EDITOR_MIN = 10 * 20 + 2 * 4 + 2;
/** Separación entre el editor, el estado y los errores en la tarjeta (--space-1). */
const EDITOR_GAP = 4;

/** Retardo (ms) desde la última tecla hasta analizar el texto y, si es válido, ponerlo a manejar (D7). */
export const COMMIT_DELAY_MS = 250;

/**
 * Dos zonas y ningún panel (reglas-mesa-de-trabajo D1): el escenario, de 520 px por defecto, con la
 * escena, la columna de lo que percibe el auto al costado y la marcha debajo; y el tablero, que ocupa también el lugar del panel.
 */
export const ZONES = Object.freeze({ panel: false, stageDefault: 520, stageMin: 300, boardMin: 520, preference: 'rulesStageWidth' });

/** Textos conocidos (programa inicial y ejemplos, en los dos idiomas): los demás son propios. */
const KNOWN = knownTexts({ es, en });

/**
 * Palabras de la paleta, en orden: papel del vocabulario y tipo de palabra (para su forma). Sin los sensores
 * ni `velocidad`, que se insertan desde sus barras (reglas-mesa-de-trabajo D6).
 */
const PALETTE_WORDS = Object.freeze([
  ['if', 'keyword'], ['then', 'keyword'], ['and', 'keyword'], ['or', 'keyword'], ['not', 'keyword'],
  ['forward', 'action'], ['reverse', 'action'], ['left', 'action'], ['right', 'action'],
]);

// Misiones cumplidas y tráficos recorridos: siguen hasta cerrar la aplicación.
const completedMissions = new Set();
const trafficSeeds = new Set();
// Estado conservado entre montajes (se crea al abrir la pestaña por primera vez).
let state = null;

/** Olvida el estado conservado (para pruebas o para reiniciar la aplicación). */
export function resetState() { state = null; }

function createState({ i18n, store, preferences }) {
  // El programa recordado abre con los sensores para los que está escrito (D15).
  const remembered = preferences?.rulesProgram ?? null;
  const settings = normalizeSettings({
    ...DEFAULT_SETTINGS,
    ...rememberedSensors({ program: remembered, sensors: remembered === null ? null : preferences?.rulesSensors ?? null }),
    maxSpeed: store?.get().carSpeed ?? DEFAULT_SETTINGS.maxSpeed,
  });
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
    // El caso del choque (reglas-el-choque-ensena): la grabación de los últimos 3 s (D3), los datos del
    // choque a la vista, el cuadro de la repetición, "Tu programa" (D5), el cuaderno (D7) y si la
    // comparación está abierta (D4). Nada de esto se guarda entre visitas.
    replay: createReplayBuffer(),
    caseInfo: null, // { distance, cause, lines, sensors, circuit } mientras el choque está a la vista
    replayOffset: 0, // 0 es el cuadro del choque; -60, un segundo antes
    own: null, // { text, sensors: { count, range, spread } }
    casebook: { cases: [], best: 0 }, // cases: [{ distance, cause }]
    compareOpen: false,
    // Vista del programa (reglas-como-fichas D4): fichas por defecto; la elegida se recuerda.
    programView: preferences?.rulesView ?? 'cards',
  };
}

export function mount({ stage, board, bar, i18n, store, preferences, reportError }) {
  state ??= createState({ i18n, store, preferences });
  const { program, controller, session } = state;
  // Zona del escenario (reglas-mesa-de-trabajo D2), de arriba abajo: la escena, la barra de marcha con las
  // cifras del intento, y lo que percibe y acciona el auto. Sin panel: el tablero ocupa su lugar (D1).
  const scene = el('div', { class: 'rules-scene' });
  const stageZone = el('div', { class: 'rules-stage-zone' }, scene);
  stage.append(stageZone);
  stage.classList.add('rules-stage');
  const view = createStageView({ container: scene, store });
  // Descripción en texto del escenario, para lectores de pantalla (panel-de-entrenar-por-vistas D9).
  const description = stageDescription({ stage });
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
    // El intento que termina cuenta para la mejor distancia del cuaderno (D7), choque o no.
    state.casebook.best = Math.max(state.casebook.best, session.distance);
    session.restart({ countAttempt });
    clearCase();
    view.followCar();
    sync();
  }
  /** Saca el caso del choque de todos lados (spec "Vuelta atrás") y vacía la grabación (D3). */
  function clearCase() {
    state.replay.clear();
    state.caseInfo = null;
    state.replayOffset = 0;
  }
  /**
   * El auto acaba de chocar: guarda los datos del caso (D1), lo anota en el cuaderno (D7). Las líneas son
   * las que decidió el programa en el paso del choque; las lecturas, las de la columna congelada.
   */
  function onCrash() {
    const { world } = state;
    const distance = Math.max(0, world.progress);
    state.caseInfo = {
      distance, cause: world.crashCause, lines: [...controller.activeLines],
      sensors: [...world.perception.sensors], circuit: world.track.closed,
    };
    state.replayOffset = 0;
    state.casebook.cases.push({ distance, cause: world.crashCause });
    state.casebook.best = Math.max(state.casebook.best, distance);
  }
  /** Borra el cuaderno de casos (al restablecer el programa o al cambiar de pista, D7). */
  function clearCasebook() { state.casebook = { cases: [], best: 0 }; }
  /** La persona tocó un control del caso: la cuenta regresiva se detiene (D2). */
  function holdCase() { if (state.caseInfo) session.hold(); }
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
    if (state.programView === 'cards') guardCards(() => cardsView.render(program.text));
    // "Tu programa" sigue al texto propio que está en el editor: volver a él no pierde nada (D5).
    if (state.own && program.isOwn(KNOWN)) state.own = { text: program.text, sensors: currentSensors() };
    remember();
  }
  const currentSensors = () => ({ count: state.settings.sensorCount, range: state.settings.sensorRange, spread: state.settings.sensorSpread });

  /** Recuerda el programa junto con los sensores del auto para el que está escrito (D15). */
  function remember() {
    if (!preferences) return;
    preferences.rulesProgram = program.text;
    const s = state.settings;
    preferences.rulesSensors = { count: s.sensorCount, range: s.sensorRange, spread: s.sensorSpread };
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

  // --- Escenario: cifras del intento, en la barra de marcha (D2) ---------------------------
  const strip = statStrip([
    { id: 'distance', labelKey: 'drive.stats.distance' },
    { id: 'passed', labelKey: 'drive.stats.passed' },
    { id: 'best', labelKey: 'drive.stats.best' },
  ]);
  strip.node.classList.add('run-stats');
  // La cifra de reglas va en la cabecera del programa, destacada (D3).
  const rulesValue = el('span', { class: 'rules-count-value' });
  const rulesCount = el('p', { class: 'rules-count', dataset: { stat: 'rules' } },
    el('span', { class: 'rules-count-label', i18n: 'rules.stats.rules' }), rulesValue);

  // --- Tablero: tarjeta del programa ------------------------------------------------
  const programCard = boardCard({
    id: 'rules-program', titleKey: 'rules.program.title', help: 'rules.program', hintKey: 'rules.program.hint',
    open: state.cards.program, grow: 3, onToggle: (open) => { state.cards.program = open; fitEditor(); },
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

  // --- Tablero: la vista de fichas (reglas-como-fichas) ---------------------------------------------
  // El texto es la única fuente de verdad: cada edición de una ficha es un parche del texto (D2) que pasa
  // por el historial del editor, y las fichas se vuelven a proyectar después de cada cambio.
  const cardsView = createCardsView({
    i18n, sensorCount: () => state.settings.sensorCount,
    onEdit: (edit, { focus = null } = {}) => guardCards(() => applyCardEdit(edit, focus)),
    onPreview: (edit) => guardCards(() => previewCardEdit(edit)),
    onEditAsText: (line) => guardCards(() => editAsText(line)),
    onUndo: (redo, focus) => guardCards(() => undoFromCards(redo, focus)),
  });

  /**
   * Un error en una ficha no detiene la pestaña (D7): se registra en la consola y las fichas se vuelven a
   * dibujar desde el texto del editor, que es la fuente de verdad.
   */
  function guardCards(fn) {
    try {
      return fn();
    } catch (err) {
      console.error('Reglas a mano: error en una ficha', err);
      try { cardsView.render(editor.value, { force: true }); } catch (again) { console.error(again); }
      return undefined;
    }
  }
  programCard.append(cardsView.node);

  /** Escribe una edición de una ficha en el texto, como un paso del deshacer, y la pone a manejar. */
  function applyCardEdit(edit, focus) {
    const r = patch(editor.value, edit, i18n.language);
    if (r.text === editor.value) {
      // Nada que escribir (por ejemplo, el mismo número): las fichas vuelven al texto, por si hubo una vista previa.
      if (program.text !== editor.value) commit();
      cardsView.focusPath(focus);
      return;
    }
    editor.replaceRange(r.from, r.to, r.insert, r.cursor);
    commit();
    cardsView.focusPath(focus);
  }

  /**
   * Vista previa de un arrastre (D2): el auto maneja con el número nuevo sin escribirlo en el historial;
   * al soltar se escribe un solo paso. El editor conserva el texto de antes del arrastre.
   */
  function previewCardEdit(edit) {
    const r = patch(editor.value, edit, i18n.language);
    afterProgramChange(program.update(r.text));
    cardsView.render(r.text);
  }

  /** Deshacer o rehacer desde las fichas: el mismo historial que Ctrl+Z en el texto. */
  function undoFromCards(redo, focus) {
    editor.undo(redo);
    commit();
    cardsView.focusPath(focus);
  }

  /** "Editar como texto" de una ficha escrita a mano: a la vista de texto, con el cursor en su línea (D4). */
  function editAsText(line) {
    setProgramView('text');
    const starts = [0];
    for (let i = 0; i < editor.value.length; i += 1) if (editor.value[i] === '\n') starts.push(i + 1);
    const at = starts[line - 1] ?? 0;
    editor.focus();
    editor.input.setSelectionRange(at, at);
    // Lleva la línea a la vista: 20 px por línea (styles/app.css).
    editor.input.scrollTop = Math.max(0, (line - 3) * 20);
  }

  /** Agrega al final una regla sin acción con `line` como texto y enfoca el selector de su acción (D4). */
  function addCardRule(line) {
    applyCardEdit({ type: 'addRule', text: line }, 'last-action');
  }

  // El cambio de vista: un segmento "Fichas | Texto" en la cabecera (D4). La paleta solo en la vista de texto.
  const viewButtons = ['cards', 'text'].map((v) => el('button', {
    class: 'segment', i18n: `rules.view.${v}`, help: `rules.view.${v}`,
    attrs: { type: 'button', 'aria-pressed': String(state.programView === v), 'data-view': v },
    on: { click: () => setProgramView(v) },
  }));
  const viewSwitch = el('div', { class: 'segments rules-view-switch', attrs: { role: 'group' }, i18nAttr: 'aria-label:rules.view.label' }, viewButtons);

  /** Muestra una de las dos vistas del mismo texto y la recuerda. Cambiar de vista no toca el texto. */
  function setProgramView(view, { remember: keep = true } = {}) {
    if (dirty) commit();
    state.programView = view === 'text' ? 'text' : 'cards';
    if (keep && preferences) preferences.rulesView = state.programView;
    layoutProgramView();
    fitEditor();
  }
  function layoutProgramView() {
    const cards = state.programView === 'cards';
    for (const b of viewButtons) b.setAttribute('aria-pressed', String(b.dataset.view === state.programView));
    // En la vista de fichas el editor sigue en la página, fuera de la vista y fuera del orden del tabulador:
    // las ediciones de las fichas pasan por su historial de deshacer (D2).
    editor.node.dataset.offstage = String(cards);
    editor.node.setAttribute('aria-hidden', String(cards));
    editor.input.tabIndex = cards ? -1 : 0;
    cardsView.node.hidden = !cards;
    palette.hidden = cards;
    // El renglón de ayuda de la tarjeta habla de la paleta: solo en la vista de texto. Lo que explica las fichas
    // está en la ayuda del segmento "Fichas" (D8, punto 5).
    if (programCard.hint) programCard.hint.hidden = cards;
    renderStatus();
    // El estado y los errores van arriba de las fichas y debajo del editor (D1).
    if (cards) cardsView.node.before(status, errorList);
    else editor.node.after(status, errorList);
    if (cards) guardCards(() => cardsView.render(program.text));
  }

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
      const li = el('li', { class: 'rules-error', attrs: { 'data-state': 'error' } });
      const [key, params] = errorParams(e);
      setText(li, key, params);
      return li;
    });
    errorList.replaceChildren(...items);
    errorList.hidden = items.length === 0;
    // En la vista de fichas, "Sin errores · N reglas" no ocupa un renglón: la cuenta está en la cabecera y el
    // estado se ve solo cuando hay un error (reglas-como-fichas D8, punto 5).
    status.hidden = state.programView === 'cards' && errors.length === 0;
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
    // Con más de 12 sensores las barras no son botones: la paleta ofrece la palabra `sensor` (D5).
    const sensors = count > READINGS_MAX ? [paletteButton({
      textKey: 'rules.data.sensor', params: { n: '' }, help: 'rules.word.sensorAny', helpParams: { last: `sensor${count}` },
      kind: 'data', insert: () => i18n.t('rules.data.sensor', { n: '' }),
    })] : [];
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

  /**
   * Inserta en el cursor del editor la comparación de una barra (D5), por el mismo camino de la paleta
   * (entra en el deshacer del editor), y devuelve el foco al editor.
   */
  function insertComparison(datum, value) {
    const input = editor.input;
    const r = insertAt(input.value, input.selectionStart, comparisonFor(datum, value, i18n.language), input.selectionEnd);
    editor.insert(r.insert);
    if (input.selectionStart !== r.cursor) input.setSelectionRange(r.cursor, r.cursor);
  }

  // --- Escenario: percepción y acción en una columna al costado de la escena (D2) ----------
  // La misma tarjeta plegable de siempre. La ayuda de la tarjeta dice lo que antes decía su renglón de guía.
  const ioCard = boardCard({
    id: 'rules-io', titleKey: 'rules.io.title', help: 'rules.io',
    open: state.cards.io, grow: 1, onToggle: (open) => { state.cards.io = open; },
  });
  const perception = perceptionRows({
    i18n, count: state.world.perception.sensors.length,
    names: { sensorKey: 'rules.data.sensor', speedKey: 'rules.data.speed' },
    // Con el caso a la vista, tocar una fila también detiene la cuenta regresiva (D2).
    help: 'rules.barInsert', onInsert: (datum, value) => {
      holdCase();
      // En la vista de fichas, agrega una ficha con esa comparación y la acción por elegir (D4).
      if (state.programView === 'cards') addCardRule(`${i18n.t('rules.word.if')} ${comparisonFor(datum, value, i18n.language)} ${i18n.t('rules.word.then')}`);
      else insertComparison(datum, value);
    },
  });
  const action = actionBlock({ role: true });
  ioCard.append(el('div', { class: 'rules-io' }, perception.node, action.node));


  // --- Escenario: barra de marcha (D2) -----------------------------------------------
  const intro = el('section', { class: 'guide rules-intro' }, el('p', { i18n: 'rules.guide' }));

  const pauseButton = button('rules.pause', 'rules.pause', togglePause);
  pauseButton.setAttribute('aria-pressed', 'false');
  const newTrafficButton = button('rules.newTraffic', 'rules.newTraffic', newTraffic);
  const run = el('div', { class: 'run-main' }, pauseButton, button('rules.restart', 'rules.restart', restart));
  // Tarjeta de consigna (tarjeta-de-consigna D4), al principio del tablero y sin la marcha (D3): la
  // consigna y la misión en curso.
  // "Mostrame" (misiones-que-muestran-el-control): lleva al editor del programa o a Tráfico nuevo. Si la
  // tarjeta del programa está plegada, la abre (traerlo a la vista), como si la persona la abriera.
  const missionReveal = createMissionReveal({
    tab: 'rules', i18n,
    mission: () => currentMission(session.missions, { available: !state.world.track.closed }),
    nodes: {
      editor: () => {
        if (!programCard.open) { programCard.setOpen(true); state.cards.program = true; }
        // El programa en la vista que está a la vista: las fichas o el editor (reglas-como-fichas D4).
        return state.programView === 'cards' ? cardsView.list : editor.node;
      },
      newTraffic: () => newTrafficButton,
    },
  });
  const card = createConsignaCard({ i18n, onReveal: missionReveal.reveal });

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
  // La barra de marcha, debajo de la escena y de la columna: Pausar (acción principal), Reiniciar y Tráfico
  // nuevo en un renglón; en otro, compacto, los interruptores de vista y Reintentar solo (el mismo grupo de
  // siempre) y las cifras del intento.
  const runBar = el('div', { class: 'rules-runbar', attrs: { role: 'group' }, i18nAttr: 'aria-label:rules.runbar.label' },
    el('div', { class: 'rules-runbar-main' }, run, newTrafficButton),
    el('div', { class: 'rules-runbar-second' }, viewSwitches, strip.node));

  // --- Escenario: la tarjeta del caso, en el lugar de la marcha (reglas-el-choque-ensena D1) -----------
  // Título y datos, la cuenta regresiva y las acciones: "Compará con los ejemplos" (principal), "Escribir
  // una regla para este caso" y Reiniciar. Con el estado "choque" del sistema de diseño.
  const caseTitle = el('h2', { class: 'rules-case-title', attrs: { 'aria-live': 'polite' } });
  const caseLines = el('span', { class: 'rules-case-lines' });
  const caseCount = el('span', { class: 'rules-case-count' });
  const caseCompare = button('rules.case.compare', 'rules.case.compare', () => openCompare({ focus: true }));
  caseCompare.dataset.keepsFocus = 'true';
  const caseWrite = button('rules.case.write', 'rules.case.write', writeCaseRule);
  caseWrite.dataset.keepsFocus = 'true';
  const caseRestart = button('rules.restart', 'rules.restart', restart);
  // Reiniciar va en el renglón del título: así las dos acciones del caso entran en un renglón y la tarjeta
  // no pasa de 140 px (D1).
  const caseCard = el('section', { class: 'rules-case', attrs: { 'data-state': 'crash' }, i18nAttr: 'aria-label:rules.case.label' },
    el('div', { class: 'rules-case-head' }, caseTitle, caseRestart),
    el('p', { class: 'rules-case-data' }, caseLines, ' ', caseCount),
    el('div', { class: 'rules-case-actions' }, caseCompare, caseWrite));
  caseCard.hidden = true;

  // --- Escenario: el cuaderno de casos, entre la escena y la marcha (D7). Solo con la guía. ----------------
  const casebookSummary = el('p', { class: 'casebook-summary' });
  const casebookAxis = el('div', { class: 'casebook-axis' });
  const casebook = el('div', { class: 'guide rules-casebook', attrs: { role: 'group' }, i18nAttr: 'aria-label:rules.casebook.label' },
    casebookSummary, casebookAxis);
  stageZone.append(ioCard.node, casebook, runBar, caseCard);

  // --- Escenario: el deslizador de la repetición, sobre la escena (D3) ------------------------------------
  const replayInput = el('input', {
    class: 'rules-replay-input', help: 'rules.replay', i18nAttr: 'aria-label:rules.replay.label',
    attrs: { type: 'range', min: '-179', max: '0', step: '1', value: '0' },
  });
  replayInput.dataset.keepsFocus = 'true';
  const replayValue = el('span', { class: 'rules-replay-value', attrs: { 'aria-hidden': 'true' } });
  const replay = el('div', { class: 'rules-replay' },
    el('span', { class: 'rules-replay-label', i18n: 'rules.replay.label', attrs: { 'aria-hidden': 'true' } }), replayInput, replayValue);
  replay.hidden = true;
  scene.append(replay);
  function setReplay(offset) {
    const min = Number(replayInput.min);
    state.replayOffset = Math.max(min, Math.min(0, Math.round(offset)));
    if (Number(replayInput.value) !== state.replayOffset) replayInput.value = String(state.replayOffset);
    holdCase();
    sync();
  }
  replayInput.addEventListener('input', () => setReplay(Number(replayInput.value)));
  replayInput.addEventListener('keydown', (e) => {
    // Las flechas mueven la repetición y no llegan a ningún otro atajo de la ventana (spec "Con el teclado").
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.stopPropagation();
    if (!e.shiftKey) return;
    e.preventDefault();
    const dir = e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 1;
    setReplay(state.replayOffset + dir * 10); // Mayús + flecha: de a 10 cuadros (unos 0,17 s)
  });

  // --- Tablero: cabecera del programa (ejemplos, restablecer, exportar e importar; D3) ------
  const confirm = inlineConfirm({ i18n });
  const message = el('p', { class: 'rules-message', attrs: { role: 'status' } });
  message.hidden = true;
  /** `error`: el aviso usa el estado "error" del sistema de diseño (sistema-de-diseno-base D6). */
  function showMessage(key, params, { error = false } = {}) {
    setText(message, key, params);
    if (error) message.dataset.state = 'error'; else delete message.dataset.state;
    message.hidden = false;
  }

  /** ¿El texto a la vista fue escrito o cambiado por la persona? */
  function isOwn() {
    if (dirty) commit();
    return program.isOwn(KNOWN);
  }

  /**
   * Reemplaza el programa (un ejemplo, "Tu programa", una fila de la comparación, restablecer o
   * importar). Restablecer e importar piden confirmación si el texto es propio; probar un programa no
   * (`ask: false`): el texto propio queda en "Tu programa" (reglas-el-choque-ensena D5). Con `sensors`
   * cambia primero los sensores del auto y después pone el texto, para que se analice ya con su auto; al
   * final reinicia el intento con ese auto y ese programa (así el intento nuevo cuenta entero con el
   * programa nuevo, y sale de la retención del caso).
   */
  function replaceProgram(text, sensors, request, after, { ask = true } = {}) {
    // Los ejemplos y el programa inicial son para la calle recta: desde un circuito se vuelve a ella
    // y la confirmación lo avisa siempre, aunque el texto no sea propio.
    const leavesCircuit = Boolean(sensors) && onCircuit(state.settings);
    const doReplace = () => {
      if (sensors) {
        if (leavesCircuit) clearCasebook(); // vuelve a la calle recta: otra pista, otro cuaderno (D7)
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
    else if (ask && isOwn()) confirm.open({ ...request, confirmKey: 'rules.confirm.replace', onConfirm: doReplace });
    else doReplace();
  }

  /**
   * Prueba un programa (un ejemplo, "Tu programa" o una fila de la comparación) sin confirmación: si el
   * texto a la vista es propio, primero lo guarda como "Tu programa", con sus sensores (D5).
   */
  function tryProgram(text, sensors, name) {
    message.hidden = true;
    // Probar un programa cierra la tabla (reglas-como-fichas D8, punto 2).
    if (state.compareOpen) closeCompare({ restore: false });
    if (isOwn()) state.own = { text: program.text, sensors: currentSensors() };
    replaceProgram(text, sensors, { message: 'rules.confirm.example', params: { name } }, null, { ask: false });
  }

  // La franja de programas (reglas-como-fichas D8, punto 1): el único lugar de los ejemplos. Una ficha chica
  // por programa ("Tu programa" cuando lo hay, y los tres ejemplos), con su cifra de superados en el mismo
  // tráfico cuando la comparación ya la calculó ("…" mientras tanto); el que maneja, con el estilo de opción
  // elegida. Un toque lo prueba.
  function stripItem(nameKey, help, onClick) {
    const figure = el('span', { class: 'rules-strip-figure', attrs: { 'aria-hidden': 'true' } });
    const said = el('span', { class: 'sr-only' });
    const b = el('button', {
      class: 'tool rules-strip-item', help, attrs: { type: 'button', 'aria-pressed': 'false' }, on: { click: onClick },
    }, el('span', { class: 'rules-strip-name', i18n: nameKey }), figure, said);
    b.figure = figure;
    b.said = said;
    return b;
  }
  // "Tu programa" (D5): solo si hay un texto propio guardado.
  const ownButton = stripItem('rules.own', 'rules.own', () => {
    if (!state.own || ownInEditor()) return;
    tryProgram(state.own.text, state.own.sensors, i18n.t('rules.own'));
  });
  ownButton.hidden = true;
  const ownInEditor = () => Boolean(state.own) && normalizeText(editor.value) === normalizeText(state.own.text);
  const exampleButtons = EXAMPLES.map((ex) => {
    const b = stripItem(`rules.example.${ex.id}.short`, `rules.example.${ex.id}`, () => {
      tryProgram(i18n.t(ex.textKey), ex.sensors, i18n.t(ex.nameKey));
    });
    b.example = ex;
    return b;
  });
  /** La cifra de superados y la opción elegida de cada ficha de la franja. Escribe solo lo que cambió. */
  function renderStrip() {
    const computing = compareRun !== null || compareRows === null;
    const byId = new Map((compareRows ?? []).map((r) => [r.entry.id, r]));
    const drivingId = programIdOf(editor.value, { es, en });
    const same = (a) => a.count === state.settings.sensorCount && a.range === state.settings.sensorRange && a.spread === state.settings.sensorSpread;
    const write = (b, row, pressed) => {
      const figure = computing ? '…' : row?.ok ? String(row.passed) : '–';
      if (b.figure.textContent !== figure) b.figure.textContent = figure;
      if (computing) setText(b.said, 'rules.strip.computing');
      else if (row?.ok) setText(b.said, 'rules.strip.passed', { value: row.passed });
      else if (b.said.textContent) { b.said.textContent = ''; b.said.removeAttribute('data-i18n'); }
      const p = String(pressed);
      if (b.getAttribute('aria-pressed') !== p) b.setAttribute('aria-pressed', p);
    };
    for (const b of exampleButtons) write(b, byId.get(b.example.id), drivingId === b.example.id && same(b.example.sensors));
    write(ownButton, byId.get(drivingId === null ? 'own' : 'saved'), ownInEditor());
  }
  const resetButton = button('rules.reset', 'rules.reset', () => {
    message.hidden = true;
    // Restablecer borra también "Tu programa" y el cuaderno de casos (D5 y D7).
    replaceProgram(i18n.t(INITIAL_PROGRAM.textKey), INITIAL_PROGRAM.sensors, { message: 'rules.confirm.reset' }, () => {
      state.own = null;
      clearCasebook();
      sync();
    });
  });
  // Exportar e Importar no cambian la escena: acción terciaria (sistema-de-diseno-base D5).
  const exportButton = button('rules.export', 'rules.export', () => {
    downloadText({ fileName: i18n.t('rules.export.fileName'), text: editor.value, type: 'text/plain' });
  }, 'tool tertiary');
  const fileInput = el('input', {
    class: 'library-file', help: 'rules.import',
    attrs: { type: 'file', accept: '.txt,text/plain', tabindex: '-1', 'aria-hidden': 'true' },
  });
  const importButton = button('rules.import', 'rules.import', () => fileInput.click(), 'tool tertiary');
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
        showMessage('rules.import.notText', { file: file.name }, { error: true });
        return;
      }
      if (text.length > RULES_PROGRAM_MAX || countLines(text) > RULES_LIMITS.lines) {
        showMessage('rules.import.tooLong', { file: file.name }, { error: true });
        return;
      }
      replaceProgram(text, null, { message: 'rules.confirm.import', params: { file: file.name } },
        () => showMessage('rules.import.done', { file: file.name }));
    } catch {
      showMessage('rules.import.notText', { file: file.name }, { error: true });
    }
  });

  // "Tabla" (acción terciaria, en lugar de "Comparar"; reglas-como-fichas D8): abre la tabla completa sobre las
  // fichas. Va en el renglón de arriba de la cabecera, con las otras acciones terciarias.
  const compareButton = button('rules.compare.open', 'rules.compare.open', () => (state.compareOpen ? closeCompare() : openCompare({ focus: true })), 'tool tertiary');
  compareButton.dataset.keepsFocus = 'true';
  const examples = el('div', { class: 'rules-examples rules-strip', attrs: { role: 'group' }, i18nAttr: 'aria-label:rules.strip.label' },
    el('span', { class: 'rules-examples-label', i18n: 'rules.strip.label', help: 'rules.strip' }), ownButton, exampleButtons);

  // --- Tablero: la comparación con los ejemplos, entre la cabecera y el editor (D4) ---------------------
  const compareTitleId = 'rules-compare-title';
  const compareStatus = el('p', { class: 'rules-compare-status', attrs: { role: 'status' } });
  const compareNoteCircuit = el('p', { class: 'rules-compare-note', i18n: 'rules.compare.note.circuit' });
  const compareNoteSpeed = el('p', { class: 'rules-compare-note' });
  const compareBody = el('tbody');
  const compareTable = el('table', { class: 'rules-compare-table' },
    // "Superados" es la primera columna de cifras, destacada: es lo que miden las misiones (D4, "Qué columna
    // manda"). La distancia va después, con el peso del cuerpo.
    el('thead', {}, el('tr', {}, ...['program', 'passed', 'sensors', 'rules', 'distance', 'result'].map((c) => el('th', {
      attrs: { scope: 'col' }, class: `col-${c}`, i18n: `rules.compare.col.${c}`,
    })), el('th', { attrs: { scope: 'col' }, class: 'col-try' }))),
    compareBody);
  const compareClose = button('rules.compare.close', 'rules.compare.close', () => closeCompare(), 'tool tertiary');
  const compareSection = el('section', { class: 'rules-compare', attrs: { tabindex: '-1', 'aria-labelledby': compareTitleId } },
    el('div', { class: 'rules-compare-head' },
      el('h3', { class: 'rules-compare-title', i18n: 'rules.compare.title', attrs: { id: compareTitleId } }),
      el('span', { class: 'rules-compare-caption', i18n: 'rules.compare.caption' }),
      compareClose),
    compareNoteCircuit, compareNoteSpeed, compareStatus, compareTable);
  compareSection.hidden = true;
  // Escape cierra la tabla y el foco vuelve a donde estaba (D8, punto 2).
  compareSection.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    closeCompare();
  });
  let compareReturn = null; // dónde estaba el foco al abrir la tabla
  let compareRun = null; // { key, gen, frame } de la corrida en curso
  let compareKey = null; // clave de la última corrida terminada
  let compareRows = null;

  /** Programas de la comparación: el que maneja (si no es un ejemplo), los tres ejemplos y "Tu programa". */
  function compareEntries() {
    const driving = program.validText;
    const drivingId = driving === null ? null : programIdOf(driving, { es, en });
    const entries = [];
    if (driving !== null && (drivingId === null || drivingId === 'initial')) {
      entries.push({ id: drivingId ?? 'own', nameKey: drivingId ? 'rules.program.initial.name' : 'rules.own', text: driving, sensors: currentSensors() });
    }
    for (const ex of EXAMPLES) entries.push({ id: ex.id, nameKey: ex.nameKey, text: i18n.t(ex.textKey), sensors: { ...ex.sensors } });
    if (state.own && drivingId !== null) entries.push({ id: 'saved', nameKey: 'rules.own', text: state.own.text, sensors: { ...state.own.sensors } });
    const same = (a, b) => a.count === b.count && a.range === b.range && a.spread === b.spread;
    for (const e of entries) e.driving = driving !== null && normalizeText(e.text) === normalizeText(driving) && same(e.sensors, currentSensors());
    return entries;
  }
  const keyOf = (entries) => JSON.stringify([state.seed, state.settings.maxSpeed, state.settings.lanes, state.settings.density,
    state.settings.irregularity, entries.map((e) => [e.id, e.text, e.sensors, e.driving])]);

  /** Abre la comparación (y la tarjeta del programa, si estaba plegada); con el caso a la vista, lo retiene. */
  function openCompare({ focus = false } = {}) {
    holdCase();
    if (!programCard.open) { programCard.setOpen(true); state.cards.program = true; }
    const active = document.activeElement;
    if (!state.compareOpen) compareReturn = active && !compareSection.contains(active) && active !== document.body ? active : null;
    state.compareOpen = true;
    sync();
    if (focus) compareSection.focus({ preventScroll: true });
  }
  /** Cierra la tabla (con "Ocultar", Escape o al probar un programa); el cálculo sigue para la franja. */
  function closeCompare({ restore = true } = {}) {
    const hadFocus = compareSection.contains(document.activeElement);
    state.compareOpen = false;
    sync();
    if (restore && hadFocus) {
      if (compareReturn?.isConnected) compareReturn.focus({ preventScroll: true });
      else compareButton.focus({ preventScroll: true });
    }
    compareReturn = null;
  }
  /**
   * La tabla flota sobre la vista del programa (las fichas o el editor), sin correrla: empieza donde empieza
   * esa vista y llega hasta el final de la tarjeta.
   */
  function placeCompare() {
    const anchor = state.programView === 'cards' ? cardsView.node : editor.node;
    const top = anchor.offsetTop;
    const t = `${top}px`;
    if (compareSection.style.top !== t) compareSection.style.top = t;
    const max = `${Math.max(160, programCard.body.clientHeight - top)}px`;
    if (compareSection.style.maxHeight !== max) compareSection.style.maxHeight = max;
  }
  function stopCompare() {
    if (compareRun?.frame) window.cancelAnimationFrame(compareRun.frame);
    compareRun = null;
  }
  /** Corre la comparación por tramos, uno por cuadro de animación (D4): la escena sigue animándose. */
  function startCompare(entries, key) {
    stopCompare();
    compareRows = null;
    const gen = compareRuns({ seed: state.seed, settings: state.settings, programs: entries });
    const runState = { key, gen, entries, frame: 0 };
    const pump = () => {
      if (compareRun !== runState) return;
      try {
        const r = gen.next();
        if (r.done) {
          compareRun = null;
          compareKey = key;
          compareRows = r.value.map((row, i) => ({ ...row, entry: entries[i] }));
          renderCompare();
          renderStrip();
        } else {
          runState.frame = window.requestAnimationFrame(pump);
        }
      } catch (err) {
        compareRun = null;
        reportError(err);
      }
    };
    compareRun = runState;
    runState.frame = window.requestAnimationFrame(pump);
  }
  /** Rehace la tabla con las cifras de la última corrida. */
  function renderCompare() {
    const rows = (compareRows ?? []).map((r) => {
      const e = r.entry;
      const name = el('th', { attrs: { scope: 'row' } }, el('span', { i18n: e.nameKey }));
      if (e.driving) name.append(el('span', { class: 'rules-compare-driving', i18n: 'rules.compare.driving' }));
      const res = compareResult(r);
      const result = [res.key, res.params ?? {}];
      const tryButton = button('rules.compare.try', 'rules.compare.try', () => tryProgram(e.text, e.sensors, i18n.t(e.nameKey)));
      const tr = el('tr', { attrs: { 'aria-current': e.driving ? 'true' : null } },
        name,
        el('td', { class: 'num col-passed', text: r.ok ? String(r.passed) : '–' }),
        el('td', { class: 'num', text: String(r.sensors.count) }),
        el('td', { class: 'num', text: r.ok ? String(r.rules) : '–' }),
        el('td', { class: 'num col-distance', text: r.ok ? i18n.t('drive.value.meters', { value: Math.floor(r.distance) }) : '–' }),
        el('td', { class: 'rules-compare-result', attrs: { 'data-crashed': r.ok ? String(r.crashed) : null, 'data-result': res.key.split('.').pop() }, i18n: result[0], params: result[1] }),
        el('td', {}, tryButton));
      return tr;
    });
    compareBody.replaceChildren(...rows);
    i18n.translateTree(compareBody);
  }
  /** Estado de la comparación en cada sincronización: abierta o no, calculando o lista, y sus avisos. */
  function syncCompare() {
    compareSection.hidden = !state.compareOpen;
    compareButton.setAttribute('aria-expanded', String(state.compareOpen));
    // La comparación se calcula sola, por tramos, al abrir la pestaña y cada vez que cambian el tráfico, la
    // velocidad o el programa que maneja: la franja de programas muestra sus cifras (D8, punto 1).
    const entries = compareEntries();
    const key = keyOf(entries);
    if (key !== compareKey && compareRun?.key !== key) startCompare(entries, key);
    renderStrip();
    if (!state.compareOpen) return;
    placeCompare();
    const computing = compareRun !== null;
    compareSection.dataset.state = computing ? 'computing' : 'done';
    compareStatus.hidden = !computing;
    if (computing) setText(compareStatus, 'rules.compare.computing');
    compareTable.hidden = computing;
    const notes = compareNotes(state.settings, onCircuit(state.settings));
    compareNoteCircuit.hidden = !notes.circuit;
    compareNoteSpeed.hidden = !notes.speed;
    if (notes.speed) setText(compareNoteSpeed, 'rules.compare.note.speed', { value: state.settings.maxSpeed });
  }

  // --- Escenario: la regla para el caso (D6) ---------------------------------------------------------
  /**
   * Agrega al final del programa la condición con los sensores que más leían al chocar, sin acción, por el
   * camino de inserción del editor (se deshace con Ctrl+Z), y deja el cursor al final, en el editor.
   */
  function writeCaseRule() {
    const info = state.caseInfo;
    if (!info) return;
    holdCase();
    if (!programCard.open) { programCard.setOpen(true); state.cards.program = true; }
    // En la vista de fichas, la condición llega como una ficha con el selector de la acción enfocado (D4).
    if (state.programView === 'cards') {
      addCardRule(caseCondition(info.sensors, i18n.language).trimEnd());
      return;
    }
    const input = editor.input;
    const end = input.value.length;
    input.focus({ preventScroll: true });
    input.setSelectionRange(end, end);
    const lead = end === 0 || input.value.endsWith('\n') ? '' : '\n';
    editor.insert(`${lead}${caseCondition(info.sensors, i18n.language)}`);
    const at = input.value.length;
    input.setSelectionRange(at, at);
    // Lleva el final del programa a la vista.
    input.scrollTop = input.scrollHeight;
  }
  const fileActions = el('div', { class: 'rules-file-actions' }, compareButton, resetButton, exportButton, importButton, fileInput);

  // --- Tablero: misiones -------------------------------------------------------------
  // Cada fila y la tarjeta escriben la misión con la misma vista (tarjeta-de-consigna D2).
  const describeMission = (m) => ({
    done: m.done,
    nameKey: `rules.mission.${m.id}`, nameParams: { goal: m.goal },
    statusKey: m.done ? 'drive.mission.done' : 'drive.mission.progress.vehicles',
    statusParams: m.done ? undefined : { value: m.progress, goal: m.goal },
    fraction: m.done ? 1 : m.progress / m.goal,
  });
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

  // --- Barra de escenario (la misma de la pestaña 1, panel-de-entrenar-por-vistas D11) ------------
  function applySettings(next, { countAttempt = true } = {}) {
    const before = state.settings;
    state.settings = normalizeSettings(next);
    store?.set({ carSpeed: state.settings.maxSpeed });
    if (state.settings.sensorCount !== before.sensorCount) {
      // Cambiar los sensores vuelve a analizar el programa: si deja de valer, el auto no acciona nada.
      afterProgramChange(program.setSensors(state.settings.sensorCount));
    }
    if (['sensorCount', 'sensorRange', 'sensorSpread'].some((k) => state.settings[k] !== before[k])) remember();
    // Cambiar de pista borra el cuaderno de casos (D7): los casos de otra pista no se comparan.
    if (state.settings.track !== before.track) clearCasebook();
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
  // El grupo de sensores se arma con la misma barra y el mismo estado, pero va en la cabecera del
  // programa (D4); el "Restablecer" de la barra no toca los sensores.
  const scenario = scenarioBar({
    i18n, settings: state.settings, idPrefix: 'rules', ...RULES_BAR,
    onChange: (key, value, { first }) => {
      if (state.settings[key] !== value) applySettings({ ...state.settings, [key]: value }, { countAttempt: first });
    },
    onReset: () => applySettings(scenarioReset(state.settings), { countAttempt: true }),
  });
  bar?.append(scenario.node);

  // Cabecera del programa en dos renglones (D3): el título, el rótulo Decide, "Reglas: N", Restablecer,
  // Exportar e Importar; y los sensores con los ejemplos. Fuera del cuerpo plegable: siempre a la vista.
  const programHeading = programCard.node.querySelector('.card-heading');
  const programTop = el('div', { class: 'rules-program-top' });
  programCard.node.insertBefore(programTop, programHeading);
  programTop.append(programHeading, viewSwitch, roleTag('decide', { which: 'program' }), rulesCount, fileActions);
  const programTools = el('div', { class: 'rules-program-tools' }, scenario.group('sensors'), examples);
  programCard.node.insertBefore(programTools, programCard.body);
  programCard.node.insertBefore(el('div', { class: 'rules-program-notes' }, confirm.node, message), programCard.body);
  // La comparación va dentro del cuerpo plegable, antes del editor (D4).
  editor.node.before(compareSection);

  // Tablero, de arriba abajo (D3): la tarjeta de consigna, el texto de guía, el programa y las misiones.
  const guideMore = createGuideMore(intro);
  board.append(
    el('h1', { class: 'sr-only', i18n: 'rules.title' }),
    card.node, guideMore, programCard.node, missions);

  // El editor ocupa el alto que queda hasta el final del tablero visible, con un mínimo de 10 líneas (D3): el
  // estado y los errores quedan a la vista debajo; la paleta y las misiones, desplazando el tablero. Se
  // recalcula cuando cambia el tamaño del tablero o de lo que está arriba del editor, y con los errores.
  function fitEditor() {
    // En la vista de fichas se ajusta la pila de fichas, que se desplaza por dentro (reglas-como-fichas).
    const cards = state.programView === 'cards';
    const node = cards ? cardsView.node : editor.node;
    (cards ? editor.node : cardsView.node).style.removeProperty('height');
    if (!node.isConnected || board.clientHeight === 0 || !programCard.open) { node.style.removeProperty('height'); return; }
    const b = board.getBoundingClientRect();
    const top = node.getBoundingClientRect().top - b.top + board.scrollTop;
    const below = cards ? 0 : [status, errorList].reduce((h, x) => h + (x.hidden ? 0 : x.getBoundingClientRect().height + EDITOR_GAP), 0);
    // Lo que cierra la tarjeta y el tablero: el relleno de abajo del cuerpo, el borde y el relleno del tablero.
    const px = (n, prop) => Number.parseFloat(getComputedStyle(n)[prop]) || 0;
    const closing = px(programCard.body, 'paddingBottom') + px(programCard.node, 'borderBottomWidth') + px(board, 'paddingBottom');
    const height = Math.max(EDITOR_MIN, Math.floor(board.clientHeight - top - below - closing));
    const h = `${height}px`;
    if (node.style.height !== h) node.style.height = h;
  }
  const fitObserver = typeof window.ResizeObserver === 'function' ? new window.ResizeObserver(() => fitEditor()) : null;
  for (const n of [board, card.node, guideMore, programTop, programTools, programCard.node.querySelector('.rules-program-notes'), compareSection, status, errorList]) {
    if (n) fitObserver?.observe(n);
  }

  // --- Mensajes sobre el escenario ----------------------------------------------------
  const pauseBadge = el('div', { class: 'stage-badge pause-badge', i18n: 'drive.paused', attrs: { role: 'status' } });
  const machineBadge = el('div', { class: 'stage-badge machine-badge', i18n: 'drive.machine.badge' });
  // El choque ya no lleva cartel ni aviso sobre la escena: se ve en la tarjeta del caso (D1).
  view.corner.append(el('div', { class: 'stage-badges' }, pauseBadge, machineBadge));

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
    setText(strip.values.best, 'drive.value.meters', meters(session.best));
    setText(rulesValue, 'drive.value.count', { value: program.rules });

    // Misiones: la lista y, en la tarjeta, la primera sin cumplir (en un circuito no hay misiones).
    const current = currentMission(session.missions, { available: !circuit });
    for (const m of session.missions) {
      writeMissionRow(missionRows.find((x) => x.id === m.id), describeMission(m), m.id === current?.id, setText);
    }
    card.setConsigna('consigna.rules');
    card.setMission(current && !current.allDone ? { ...describeMission(current), reveal: missionReveal.has(current.id) } : current);

    // Con un cuadro de la repetición a la vista, la columna y el editor muestran lo de ese cuadro (D3).
    const info = state.caseInfo;
    const frame = replayFrame();
    perception.update(frame ? { sensors: Array.from(frame.sensors), speed: frame.speed } : world.perception);
    action.update(frame ? frame.controls : controller.controls);
    // Líneas que se cumplen: solo si el texto a la vista es el programa que maneja (y ya se analizó). Con
    // el caso a la vista, las del instante del choque llevan el estado "choque" (D1); en la repetición,
    // las de ese cuadro, como "se cumple".
    const running = program.showsRunning && !dirty;
    const marks = {
      active: frame ? frame.lines : info ? [] : running ? controller.activeLines : [],
      crash: info && !frame ? info.lines : [],
      errors: dirty ? [] : program.errors.map((e) => e.line),
    };
    editor.setMarks(marks);
    // Las fichas, con las mismas marcas y el valor en vivo de cada dato sobre su riel (reglas-como-fichas D3).
    if (state.programView === 'cards') {
      guardCards(() => {
        cardsView.setMarks(marks);
        cardsView.setLive(frame ? { sensors: frame.sensors, speed: frame.speed } : world.perception);
      });
    }

    sensorsSwitch.setAttribute('aria-checked', String(state.showSensors));
    machineSwitch.setAttribute('aria-checked', String(state.machineView));
    retrySwitch.setAttribute('aria-checked', String(state.autoRetry));
    pauseButton.setAttribute('aria-pressed', String(world.paused));
    setText(pauseButton, world.paused ? 'rules.resume' : 'rules.pause');
    pauseBadge.hidden = !world.paused;

    const crashed = world.crashed;
    machineBadge.hidden = !(state.machineView && !crashed);
    description.set(drivingDescription({
      t: i18n.t, track: state.settings.track, lanes: state.settings.lanes, paused: world.paused, crashed,
      meters: session.distance, machineView: state.machineView && !crashed,
    }));
    syncCase(world);
    syncCasebook();
    syncCompare();
    // "Tu programa": a la vista si hay uno guardado; elegido si es el que está en el editor (D5).
    ownButton.hidden = !state.own;
    // Acción principal (jerarquia-visual): la marcha, o "Compará con los ejemplos" con el caso a la vista.
    applyMainAction({ run: pauseButton, compare: caseCompare }, mainAction('rules', { crashed: Boolean(info) }));
    scenario.sync(state.settings);
  }

  /** Cuadro de la repetición a la vista, o null si se ve el presente (o el instante del choque). */
  function replayFrame() {
    if (!state.caseInfo || state.replayOffset >= 0) return null;
    return state.replay.at(state.replayOffset);
  }

  /** La tarjeta del caso en el lugar de la marcha, y el deslizador de la repetición (D1, D2 y D3). */
  function syncCase(world) {
    const info = state.caseInfo;
    runBar.hidden = Boolean(info);
    caseCard.hidden = !info;
    const frames = state.replay.length;
    replay.hidden = !info || frames < 2;
    if (!info) return;
    const titleKey = info.cause === 'vehicle' ? 'rules.case.title.vehicle' : info.circuit ? 'rules.case.title.edge.circuit' : 'rules.case.title.edge';
    setText(caseTitle, titleKey, meters(info.distance));
    if (info.lines.length === 0) setText(caseLines, 'rules.case.lines.none');
    else setText(caseLines, info.lines.length === 1 ? 'rules.case.lines.one' : 'rules.case.lines.many', { lines: listOf(info.lines) });
    // La cuenta regresiva (D2): en tiempo de simulación, así la pausa la detiene.
    if (!state.autoRetry) setText(caseCount, 'rules.case.manual');
    else if (session.held) setText(caseCount, 'rules.case.held');
    else if (world.paused) setText(caseCount, 'rules.case.paused');
    else setText(caseCount, 'rules.case.countdown', { value: Math.max(1, Math.ceil(session.retryIn / 60)) });
    // El deslizador cubre lo grabado: 3 s o lo que duró el intento (spec "Intento corto").
    const min = String(-(frames - 1));
    if (replayInput.min !== min) replayInput.min = min;
    if (Number(replayInput.value) !== state.replayOffset) replayInput.value = String(state.replayOffset);
    const seconds = formatFixed(-state.replayOffset / 60, 1, i18n.language);
    const at = state.replayOffset === 0 ? i18n.t('rules.replay.now') : i18n.t('rules.replay.at', { value: seconds });
    if (replayValue.textContent !== at) replayValue.textContent = at;
    if (replayInput.getAttribute('aria-valuetext') !== at) replayInput.setAttribute('aria-valuetext', at);
  }
  /** "3, 4 y 5" en el idioma activo. */
  function listOf(numbers) {
    const items = numbers.map(String);
    try { return new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(items); } catch { return items.join(', '); }
  }

  /** El cuaderno de casos (D7): la cuenta y un punto por choque sobre la distancia. Se rehace si cambió. */
  let casebookKey = '';
  function syncCasebook() {
    const { cases, best } = state.casebook;
    const key = JSON.stringify([cases.length, Math.floor(best), program.rules, i18n.language, cases.length ? cases[cases.length - 1].distance : 0]);
    if (key === casebookKey) return;
    casebookKey = key;
    casebook.dataset.empty = String(cases.length === 0);
    if (cases.length === 0) {
      setText(casebookSummary, 'rules.casebook.empty');
      casebookAxis.replaceChildren();
      return;
    }
    const n = (k, value) => i18n.t(value === 1 ? `${k}.one` : k, { value });
    // Texto armado de tres partes: sin data-i18n, para que la traducción general no lo pise (se rehace al
    // cambiar de idioma, porque el idioma está en la clave).
    casebookSummary.removeAttribute('data-i18n');
    casebookSummary.removeAttribute('data-i18n-params');
    casebookSummary.textContent = [n('rules.casebook.cases', cases.length), n('rules.casebook.rules', program.rules),
      i18n.t('rules.casebook.best', { value: Math.floor(best) })].join(' · ');
    const scale = Math.max(best, 1);
    casebookAxis.replaceChildren(...cases.map((c) => {
      const kind = c.cause === 'vehicle' ? 'vehicle' : 'edge';
      const value = Math.floor(c.distance);
      const dot = el('span', {
        class: 'casebook-dot', help: `rules.casebook.dot.${kind}`, text: '✸',
        attrs: { 'data-help-params': JSON.stringify({ value }), 'aria-label': i18n.t(`rules.casebook.dot.${kind}`, { value }), role: 'img' },
      });
      dot.style.left = `${(100 * c.distance) / scale}%`;
      return dot;
    }));
  }

  // --- Bucle --------------------------------------------------------------------------
  const loop = createLoop({
    step: () => {
      const { world } = state;
      const before = world.steps;
      world.step();
      if (world.steps !== before) {
        // Graba el cuadro que se acaba de calcular (D3); si es el del choque, el caso queda a la vista.
        state.replay.push(frameOf(world, controller));
        if (world.crashed && !state.caseInfo) onCrash();
      }
      if (session.step(world, { seed: state.seed, autoRetry: state.autoRetry }) === 'retry') restartAttempt();
    },
    render: () => {
      // En la repetición se dibuja el cuadro guardado en lugar del mundo (D3), con el tráfico de ese instante.
      const frame = replayFrame();
      const shown = frame ? frameWorld(frame) : state.world;
      view.render(shown, viewOptions(state, shown));
      sync();
    },
    onError: reportError,
  });

  /**
   * Un cuadro de la repetición con la forma de un mundo para el dibujo: la pose y los rayos guardados, y el
   * tráfico recalculado para ese instante (es una función pura del tiempo).
   */
  function frameWorld(frame) {
    const { world } = state;
    return {
      track: world.track, trackId: world.trackId, seed: world.seed,
      car: { ...world.car, position: { x: frame.car.x, y: frame.car.y }, angle: frame.car.angle, speed: frame.car.speed, crashed: frame.car.crashed },
      rays: raysOf(frame),
      perception: { sensors: Array.from(frame.sensors), speed: frame.speed },
      crashed: frame.car.crashed,
      vehiclesIn: (from, to) => world.traffic.vehicles(frame.time, from, to),
    };
  }

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
    if (e.target.closest('.rules-palette, .code-editor, .rules-cards-view, .sensor-row, [data-keeps-focus]')) return;
    if (returnsFocusToStage(e.target)) focusStage();
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  board.addEventListener('click', onClick);
  stage.addEventListener('click', onClick);
  bar?.addEventListener('click', onClick);
  const offLanguage = i18n.onChange(() => {
    perception.relabel();
    renderPalette();
    if (state.programView === 'cards') guardCards(() => cardsView.render(program.text, { force: true }));
    renderCompare();
    sync();
  });

  renderStatus();
  renderPalette();
  layoutProgramView();
  sync();
  fitEditor();
  loop.start();
  focusStage();

  return {
    view, loop, session, editor, program, controller, cardsView,
    get programView() { return state.programView; },
    setProgramView,
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
      stopCompare();
      fitObserver?.disconnect();
      offLanguage();
      confirm.dispose();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      board.removeEventListener('click', onClick);
      stage.removeEventListener('click', onClick);
      bar?.removeEventListener('click', onClick);
      editor.dispose();
      cardsView.dispose();
      description.dispose();
      scenario.dispose();
      view.dispose();
      stage.classList.remove('rules-stage');
    },
  };
}
