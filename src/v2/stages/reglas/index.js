// Etapa 2 de la V2, "Reglas a mano" (tareas 11.1 a 11.3; #reglas de la maqueta D). La persona programa
// el auto con reglas y lo ve manejar con ellas. En la zona de la escena van la escena, la percepción
// compacta y el editor, al lado (KD1); en la banda, el cuaderno de casos, las cifras y la marcha (o el
// caso del choque); en el cuaderno, las hojas "Programar" y "Escenario".
//
// La conducta sale de la lógica pura de la V1 (tabs/rules/: program, session, examples, compare, case,
// workbench y cards) y del núcleo. El editor y la vista de fichas son copias para la V2 de los de la V1
// (editor.js y cards-view.js de esta carpeta). Cambios de la V2: "Restablecer programa" e "Importar"
// reemplazan sin preguntar y ofrecen "Deshacer" (KD3); Tab sale del editor; el reintento automático
// empieza apagado (maqueta D, informe R6).
import es from '../../i18n/es.js';
import en from '../../i18n/en.js';
import { createWorld } from '../../../core/world.js';
import { createRulesController, classifyLine, countLines, RULES_LIMITS } from '../../../core/rules.js';
import { createStageView } from '../../../render/view.js';
import { createLoop } from '../../../ui/loop.js';
import { formatFixed } from '../../../ui/i18n.js';
import { currentMission } from '../../../ui/current-mission.js';
import { drivingDescription } from '../../../tabs/shared/stage-text.js';
import { readings, READINGS_MAX } from '../../../tabs/shared/driving-logic.js';
import { normalizeSettings, needsRestart, worldSpec, onCircuit, lapsShown, SLIDERS, DEFAULT_SETTINGS } from '../../../tabs/shared/street-settings.js';
import { createProgramState } from '../../../tabs/rules/program.js';
import { createRulesSession, viewOptions } from '../../../tabs/rules/session.js';
import { DEFAULT_SEED, INITIAL_PROGRAM, EXAMPLES, knownTexts, rememberedSensors, programIdOf, normalizeText } from '../../../tabs/rules/examples.js';
import { compareRuns, compareNotes, compareResult } from '../../../tabs/rules/compare.js';
import { caseCondition, frameOf, raysOf, createReplayBuffer } from '../../../tabs/rules/case.js';
import { shortcutFor } from '../../../tabs/rules/shortcuts.js';
import { comparisonFor, insertAt } from '../../../tabs/rules/workbench.js';
import { patch } from '../../../tabs/rules/cards.js';
import { RULES_PROGRAM_MAX } from '../../../ui/preferences.js';
import { el, tr, setAttr } from '../../dom.js';
import { button, toggle, slider, group, grid, missionNote, undoNotice, term } from '../../components/controls.js';
import { mountScenarioSheet } from '../../components/scenario-sheet.js';
import { createGlow } from '../../render/glow.js';
import { createCodeEditor } from './editor.js';
import { createCardsView } from './cards-view.js';

const STAGE = 'reglas';
export const COMMIT_DELAY_MS = 250;
const SENSOR_KEYS = ['sensorCount', 'sensorRange', 'sensorSpread'];
const KNOWN = knownTexts({ es, en });
const PALETTE_WORDS = Object.freeze([
  ['if', 'keyword'], ['then', 'keyword'], ['and', 'keyword'], ['or', 'keyword'], ['not', 'keyword'],
  ['forward', 'action'], ['reverse', 'action'], ['left', 'action'], ['right', 'action'],
]);
/** Qué muestra "Mostrame" en cada misión (la tabla de la V1, ui/mission-targets.js). */
const REVEAL = { pass: 'editor', passMany: 'editor', traffics: 'newTraffic' };

// Misiones cumplidas y tráficos recorridos: siguen hasta cerrar la página (como en la V1).
const completedMissions = new Set();
const trafficSeeds = new Set();

export function mount({ zones, notebook, i18n, scenario, scenery = null, prefs }) {
  const { scene, plate, band } = zones;
  const doc = scene.ownerDocument;
  const win = doc.defaultView;
  const t = (k, p) => i18n.t(k, p);
  let visible = false;

  // --- Estado ------------------------------------------------------------------------------------
  const remembered = prefs.rulesProgram ?? null;
  const sensorsOf = (s) => ({ count: s.sensorCount, range: s.sensorRange, spread: s.sensorSpread });
  let sensors = rememberedSensors({ program: remembered, sensors: remembered === null ? null : prefs.rulesSensors });
  const settingsNow = () => normalizeSettings({ ...DEFAULT_SETTINGS, ...scenario.forStage(STAGE), ...sensors });
  let settings = settingsNow();
  const program = createProgramState({ text: remembered ?? t(INITIAL_PROGRAM.textKey), sensors: settings.sensorCount });
  const controller = createRulesController({ program: program.valid });
  let seed = DEFAULT_SEED;
  const makeWorld = () => createWorld({ ...worldSpec(settings, seed), controller });
  let world = makeWorld();
  const session = createRulesSession({ completed: completedMissions, traffics: trafficSeeds });
  const state = {
    autoRetry: false, showSensors: true, machineView: false,
    replay: createReplayBuffer(), caseInfo: null, replayOffset: 0,
    own: null, casebook: { cases: [], best: 0 }, compareOpen: false,
    programView: prefs.rulesView,
  };

  // --- Zona: la escena a un lado, la percepción y el editor al otro (KD1) -------------------------------
  zones.zone.classList.add('v2-zone-rules');
  const sceneZone = scene.parentElement;
  const view = createStageView({ container: scene, store: scenery, doc });
  const sceneCtx = view.canvas.getContext('2d');
  const css = () => getComputedStyle(doc.documentElement);
  const glow = createGlow({ colors: () => ({ sensor: css().getPropertyValue('--color-sensor').trim(), headlight: css().getPropertyValue('--color-headlight').trim() }) });
  scene.setAttribute('tabindex', '-1');
  const description = el('p', { class: 'v2-sr-only', attrs: { id: 'v2-reglas-description', 'data-free-text': '' } });
  scene.setAttribute('aria-describedby', description.id);
  scene.append(description);
  const pauseBadge = el('div', { class: 'v2-badge', i18n: 'drive.paused', attrs: { role: 'status' } });
  const machineBadge = el('div', { class: 'v2-badge v2-badge-machine', i18n: 'drive.machine.badge' });
  view.corner.append(pauseBadge, machineBadge);

  const consigna = el('p', { class: 'v2-consigna', i18n: 'consigna.rules' });
  plate.append(consigna);
  const column = el('div', { class: 'v2-rules-col' });
  sceneZone.append(column);
  column.append(plate);

  // --- La percepción compacta: una fila por dato, que inserta su comparación -----------------------------
  let shown = { sensors: [], speed: 0 };
  const rowsList = el('div', { class: 'v2-rules-rows', attrs: { role: 'group' }, i18nAttr: 'aria-label:rules.io.title' });
  let rows = [];
  function perceptionRow(nameKey, params, datum) {
    const fill = el('i');
    const value = el('b', { attrs: { 'data-free-text': '' } });
    const node = el('button', {
      class: 'v2-rules-row', help: 'rules.barInsert', attrs: { type: 'button', 'data-keeps-focus': 'true', 'data-help-params': JSON.stringify({ name: t(nameKey, params) }) },
      on: { click: () => insertDatum(datum, datum === 'speed' ? shown.speed : shown.sensors[datum.sensor - 1] ?? 0) },
    }, el('code', { i18n: nameKey, params }), el('span', { class: 'v2-rules-track', attrs: { 'aria-hidden': 'true' } }, fill), value, el('span', { class: 'v2-rules-plus', attrs: { 'aria-hidden': 'true' }, text: '+' }));
    return { node, fill, value, nameKey, params };
  }
  function buildRows(n) {
    rows = n <= READINGS_MAX ? Array.from({ length: n }, (_, i) => perceptionRow('rules.data.sensor', { n: i + 1 }, { sensor: i + 1 })) : [];
    rows.push(perceptionRow('rules.data.speed', null, 'speed'));
    rowsList.replaceChildren(...rows.map((r) => r.node));
    rowsList.dataset.count = String(n);
    i18n.translateTree(rowsList);
  }
  const lamps = ['forward', 'reverse', 'left', 'right'].map((o) => el('span', { class: 'v2-lamp', i18n: `output.${o}`, dataset: { output: o } }));
  const io = el('div', { class: 'v2-rules-io', help: 'rules.io', attrs: { 'data-v1': 'rules.io' } },
    el('p', { class: 'v2-role v2-role-in' }, el('span', { i18n: 'role.in' }), ' · ', el('span', { i18n: 'role.perceives' })),
    rowsList,
    el('p', { class: 'v2-role v2-role-out' }, el('span', { i18n: 'role.out' }), ' · ', el('span', { i18n: 'role.acts' })),
    el('div', { class: 'v2-lamps', attrs: { role: 'status' } }, lamps));
  const tooMany = el('p', { class: 'v2-muted v2-rules-many' });
  io.insertBefore(tooMany, rowsList.nextSibling);

  // --- El editor: fichas o texto, el estado, los errores, la paleta y la tabla ----------------------------
  let pending = null;
  let dirty = false;
  const focusStage = () => scene.focus({ preventScroll: true });
  const editor = createCodeEditor({
    i18n, value: program.text, classify: classifyLine,
    labelKey: 'rules.editor.label', help: 'rules.editor', descriptionKey: 'rules.editor.keys',
    onChange: onEditorChange, onEscape: focusStage,
  });
  editor.node.dataset.v1 = 'rules.editor';
  // El texto del programa es un dato de la persona (o de un ejemplo), no un texto fijo de la interfaz.
  editor.node.dataset.freeText = '';
  const cardsView = createCardsView({
    i18n, sensorCount: () => settings.sensorCount,
    onEdit: (edit, { focus = null } = {}) => guardCards(() => applyCardEdit(edit, focus)),
    onPreview: (edit) => guardCards(() => previewCardEdit(edit)),
    onEditAsText: (line) => guardCards(() => editAsText(line)),
    onUndo: (redo, focus) => guardCards(() => undoFromCards(redo, focus)),
  });
  cardsView.node.dataset.freeText = '';
  cardsView.node.dataset.v1 = 'rules.cards';
  const status = el('p', { class: 'rules-status', attrs: { role: 'status' } });
  const errorList = el('ul', { class: 'rules-errors' });
  const palette = el('div', { class: 'rules-palette', attrs: { role: 'group' }, i18nAttr: 'aria-label:rules.palette.label' });
  const rulesValue = el('b', { attrs: { 'data-free-text': '' } });
  const viewButtons = ['cards', 'text'].map((v) => el('button', {
    class: 'v2-segment', i18n: `rules.view.${v}`, help: `rules.view.${v}`,
    attrs: { type: 'button', 'aria-pressed': String(state.programView === v), 'data-view': v, 'data-v1': `rules.view.${v}` },
    on: { click: () => setProgramView(v) },
  }));
  const compare = buildCompare();
  const editorHead = el('div', { class: 'v2-rules-head' },
    el('h2', { i18n: 'rules.program.title' }),
    el('div', { class: 'v2-segments', attrs: { role: 'group' }, i18nAttr: 'aria-label:rules.view.label' }, viewButtons),
    el('p', { class: 'v2-rules-count' }, el('span', { i18n: 'rules.stats.rules' }), ' ', rulesValue));
  const editorBody = el('div', { class: 'v2-rules-body' }, compare.section, cardsView.node, editor.node);
  const editorBox = el('section', { class: 'v2-rules-editor', attrs: { 'data-v1': 'rules.program' } }, editorHead, status, errorList, editorBody, palette);
  column.append(io, editorBox);

  function guardCards(fn) {
    try { return fn(); } catch (err) {
      console.error('Reglas a mano: error en una ficha', err);
      try { cardsView.render(editor.value, { force: true }); } catch (again) { console.error(again); }
      return undefined;
    }
  }
  function applyCardEdit(edit, focus) {
    const r = patch(editor.value, edit, i18n.language);
    if (r.text === editor.value) { if (program.text !== editor.value) commit(); cardsView.focusPath(focus); return; }
    editor.replaceRange(r.from, r.to, r.insert, r.cursor);
    commit();
    cardsView.focusPath(focus);
  }
  function previewCardEdit(edit) {
    const r = patch(editor.value, edit, i18n.language);
    afterProgramChange(program.update(r.text));
    cardsView.render(r.text);
  }
  function undoFromCards(redo, focus) { editor.undo(redo); commit(); cardsView.focusPath(focus); }
  function editAsText(line) {
    setProgramView('text');
    const starts = [0];
    for (let i = 0; i < editor.value.length; i += 1) if (editor.value[i] === '\n') starts.push(i + 1);
    const at = starts[line - 1] ?? 0;
    editor.focus();
    editor.input.setSelectionRange(at, at);
    editor.input.scrollTop = Math.max(0, (line - 3) * 20);
  }
  const addCardRule = (line) => applyCardEdit({ type: 'addRule', text: line }, 'last-action');

  function setProgramView(v) {
    if (dirty) commit();
    state.programView = v === 'text' ? 'text' : 'cards';
    prefs.rulesView = state.programView;
    layoutProgramView();
  }
  function layoutProgramView() {
    const cards = state.programView === 'cards';
    for (const b of viewButtons) setAttr(b, 'aria-pressed', String(b.dataset.view === state.programView));
    editor.node.dataset.offstage = String(cards);
    editor.node.setAttribute('aria-hidden', String(cards));
    editor.input.tabIndex = cards ? -1 : 0;
    cardsView.node.hidden = !cards;
    palette.hidden = cards;
    renderStatus();
    if (cards) guardCards(() => cardsView.render(program.text));
  }

  // --- Programa: el texto rige mientras se escribe ------------------------------------------------------
  function commit() {
    if (pending !== null) { win.clearTimeout(pending); pending = null; }
    dirty = false;
    afterProgramChange(program.update(editor.value));
    if (state.programView === 'cards') guardCards(() => cardsView.render(program.text));
    if (state.own && program.isOwn(KNOWN)) state.own = { text: program.text, sensors: sensorsOf(settings) };
    remember();
  }
  function remember() {
    prefs.rulesProgram = program.text;
    prefs.rulesSensors = sensorsOf(settings);
  }
  function afterProgramChange(result) {
    if (result.validChanged) controller.setProgram(program.valid);
    if (result.behaviorChanged) session.programChanged();
    renderStatus();
    renderPalette();
  }
  function onEditorChange() {
    dirty = true;
    if (pending !== null) win.clearTimeout(pending);
    pending = win.setTimeout(() => { pending = null; commit(); }, COMMIT_DELAY_MS);
  }
  function errorParams(e) {
    const d = e.details;
    switch (e.code) {
      case 'unknownWord':
        return d.suggestion ? ['rules.error.unknownWord.suggestion', { line: e.line, word: d.word, suggestion: d.suggestion }] : ['rules.error.unknownWord', { line: e.line, word: d.word }];
      case 'unknownSensor':
        return ['rules.error.unknownSensor', { line: e.line, value: d.count, last: `sensor${d.count}`, sensor: `sensor${d.sensor}` }];
      default:
        return [`rules.error.${e.code}`, { line: e.line, ...d }];
    }
  }
  function renderStatus() {
    const errors = program.errors;
    if (errors.length === 0) { tr(status, i18n, 'rules.status.ok', { value: program.rules }); status.dataset.state = 'ok'; }
    else { tr(status, i18n, program.valid ? 'rules.status.errors' : 'rules.status.errors.none'); status.dataset.state = 'errors'; }
    errorList.replaceChildren(...errors.map((e) => { const li = el('li', { class: 'rules-error', attrs: { 'data-state': 'error' } }); const [k, p] = errorParams(e); tr(li, i18n, k, p); return li; }));
    errorList.hidden = errors.length === 0;
    status.hidden = state.programView === 'cards' && errors.length === 0;
  }
  function insertWord(word) {
    const input = editor.input;
    const before = input.value.slice(0, input.selectionStart);
    editor.insert(before.length > 0 && !/[\s(]$/.test(before) ? ` ${word}` : word);
  }
  let paletteKey = '';
  function renderPalette() {
    const count = settings.sensorCount;
    const constants = program.constants;
    const key = JSON.stringify([count, constants.map((c) => [c.name, c.value]), i18n.language]);
    if (key === paletteKey) return;
    paletteKey = key;
    const word = ({ textKey, text, params, help, helpParams, kind, insert }) => el('button', {
      class: `palette-word tok-${kind}`, i18n: textKey, params, text: textKey ? t(textKey, params) : text, help,
      attrs: { type: 'button', 'data-keeps-focus': 'true', 'data-help-params': helpParams ? JSON.stringify(helpParams) : null },
      on: { click: () => insertWord(insert()) },
    });
    const words = PALETTE_WORDS.map(([role, kind]) => word({ textKey: `rules.word.${role}`, help: `rules.word.${role}`, kind, insert: () => t(`rules.word.${role}`) }));
    const many = count > READINGS_MAX ? [word({ textKey: 'rules.data.sensor', params: { n: '' }, help: 'rules.word.sensorAny', helpParams: { last: `sensor${count}` }, kind: 'data', insert: () => t('rules.data.sensor', { n: '' }) })] : [];
    const names = constants.map((c) => word({ text: c.name, help: 'rules.word.constant', helpParams: { name: c.name, value: c.value }, kind: 'name', insert: () => c.name }));
    palette.replaceChildren(...words, ...many, ...names);
    for (const n of names) n.dataset.freeText = '';
  }
  /** Una fila de la percepción: en las fichas agrega una ficha con la comparación; en el texto la inserta en el cursor. */
  function insertDatum(datum, value) {
    holdCase();
    if (state.programView === 'cards') { addCardRule(`${t('rules.word.if')} ${comparisonFor(datum, value, i18n.language)} ${t('rules.word.then')}`); return; }
    const input = editor.input;
    const r = insertAt(input.value, input.selectionStart, comparisonFor(datum, value, i18n.language), input.selectionEnd);
    editor.insert(r.insert);
    if (input.selectionStart !== r.cursor) input.setSelectionRange(r.cursor, r.cursor);
  }

  // --- Intento -------------------------------------------------------------------------------------------
  function restartAttempt({ rebuild = false } = {}) {
    if (rebuild) { const paused = world.paused; world = makeWorld(); if (paused) world.pause(); } else world.reset();
    state.casebook.best = Math.max(state.casebook.best, session.distance);
    session.restart();
    state.replay.clear();
    state.caseInfo = null;
    state.replayOffset = 0;
    view.followCar();
    sync();
  }
  const restart = () => restartAttempt();
  function newTraffic() { if (onCircuit(settings)) return; seed += 1; restartAttempt({ rebuild: true }); }
  function togglePause() { if (world.paused) world.resume(); else world.pause(); sync(); }
  function onCrash() {
    const distance = Math.max(0, world.progress);
    state.caseInfo = { distance, cause: world.crashCause, lines: [...controller.activeLines], sensors: [...world.perception.sensors], circuit: world.track.closed };
    state.replayOffset = 0;
    state.casebook.cases.push({ distance, cause: world.crashCause });
    state.casebook.best = Math.max(state.casebook.best, distance);
  }
  const clearCasebook = () => { state.casebook = { cases: [], best: 0 }; };
  function holdCase() { if (state.caseInfo) session.hold(); }

  // Ajustes: el escenario común y los sensores de la etapa (con el programa).
  function applySettings({ reset = false } = {}) {
    const before = settings;
    settings = settingsNow();
    if (settings.sensorCount !== before.sensorCount) afterProgramChange(program.setSensors(settings.sensorCount));
    if (SENSOR_KEYS.some((k) => settings[k] !== before[k])) remember();
    if (settings.track !== before.track) clearCasebook();
    if (needsRestart(before, settings)) { restartAttempt({ rebuild: true }); return; }
    if (settings.maxSpeed !== before.maxSpeed) world.setMaxSpeed(settings.maxSpeed);
    if (settings.density !== before.density || settings.irregularity !== before.irregularity) world.setTraffic({ density: settings.density, irregularity: settings.irregularity });
    // Restablecer después de cambiar el tráfico en marcha: vuelve el tráfico de la semilla (trafico-vivo).
    if (reset && world.traffic.layers) { restartAttempt(); return; }
    sync();
  }
  const offScenario = scenario.subscribe(applySettings);
  function setSensors(next) { sensors = { ...sensors, ...next }; applySettings(); }

  // --- Reemplazar el programa (ejemplo, Tu programa, la tabla, restablecer o importar) --------------------
  const isOwn = () => { if (dirty) commit(); return program.isOwn(KNOWN); };
  const notice = undoNotice({ i18n });
  const message = el('p', { class: 'v2-rules-message', attrs: { role: 'status', hidden: true } });
  function showMessage(key, params, { error = false } = {}) {
    tr(message, i18n, key, params);
    if (error) message.dataset.state = 'error'; else delete message.dataset.state;
    message.hidden = false;
  }
  /**
   * Pone otro texto (y, con `withSensors`, otros sensores y la calle recta). Si se pierde un texto propio o
   * se deja un circuito, ofrece "Deshacer", que devuelve el texto, los sensores y la pista (KD3).
   */
  function replaceProgram(text, withSensors, { undoKey = null, params = {}, after = null } = {}) {
    const leavesCircuit = Boolean(withSensors) && onCircuit(settings);
    const lost = isOwn() || leavesCircuit;
    const before = { text: editor.value, sensors: { ...sensors }, track: settings.track, own: state.own, casebook: state.casebook };
    if (withSensors) {
      if (leavesCircuit) clearCasebook();
      sensors = { sensorCount: withSensors.count, sensorRange: withSensors.range, sensorSpread: withSensors.spread };
      if (settings.track !== 'straight') scenario.set(STAGE, 'track', 'straight');
      applySettings();
      program.setSensors(settings.sensorCount);
    }
    editor.setValue(text);
    commit();
    if (withSensors) restartAttempt({ rebuild: true });
    after?.();
    sync();
    if (undoKey && lost) {
      notice.show(undoKey, () => {
        sensors = before.sensors;
        if (settings.track !== before.track) scenario.set(STAGE, 'track', before.track);
        applySettings();
        editor.setValue(before.text);
        commit();
        state.own = before.own;
        state.casebook = before.casebook;
        restartAttempt({ rebuild: true });
      }, params);
    }
  }
  function tryProgram(text, withSensors) {
    message.hidden = true;
    if (state.compareOpen) closeCompare({ restore: false });
    if (isOwn()) state.own = { text: program.text, sensors: sensorsOf(settings) };
    const changes = withSensors && (withSensors.count !== settings.sensorCount || withSensors.range !== settings.sensorRange || withSensors.spread !== settings.sensorSpread);
    replaceProgram(text, withSensors, { undoKey: onCircuit(settings) ? 'rules.v2.undo.example' : null });
    // Aviso junto al control de sensores (spec *Ejemplo que cambia los sensores*).
    if (changes) {
      tr(sensorsNotice, i18n, 'rules.v2.sensorsNotice', { value: withSensors.count });
      sensorsNotice.hidden = false;
      notebook.reveal(sensorSliders.sensorCount.element);
      scene.focus({ preventScroll: true });
    }
  }

  // --- Hoja "Programar" ------------------------------------------------------------------------------------
  const sheet = notebook.sheet('etapa', 'sheet.program');
  sheet.classList.add('v2-sheet-rules');
  const mission = missionNote({ i18n, onReveal: () => revealMission() });
  mission.element.dataset.v1 = 'mission.reveal';
  const missionReveal = mission.element.querySelector('.v2-tertiary');
  const missionsCircuit = el('p', { class: 'v2-muted v2-guide-only', i18n: 'drive.missions.circuit' });
  const moreBody = el('div', { class: 'v2-more-body', attrs: { hidden: true, id: 'v2-reglas-more' } },
    el('p', { i18n: 'rules.guide' }), term({ termKey: 'term.rule', defKey: 'term.rule.def' }));
  const moreButton = el('button', { class: 'v2-more', help: 'stage.more', attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': moreBody.id, 'data-v1': 'guide.more' },
    on: { click: () => { const open = moreBody.hidden; moreBody.hidden = !open; moreButton.setAttribute('aria-expanded', String(open)); fileGroup.hidden = open; } } },
  el('span', { i18n: 'stage.more' }));

  // Probá esto: los programas (Tu programa y los ejemplos, con su cifra de superados), reintentar y ver como la máquina.
  function stripItem(nameKey, help, onClick, v1) {
    const figure = el('span', { class: 'v2-strip-figure', attrs: { 'aria-hidden': 'true', 'data-free-text': '' } });
    const said = el('span', { class: 'v2-sr-only' });
    const b = el('button', { class: 'v2-segment v2-strip-item', help, attrs: { type: 'button', 'aria-pressed': 'false', 'data-v1': v1 }, on: { click: onClick } },
      el('span', { i18n: nameKey }), figure, said);
    b.figure = figure;
    b.said = said;
    return b;
  }
  const ownInEditor = () => Boolean(state.own) && normalizeText(editor.value) === normalizeText(state.own.text);
  const ownButton = stripItem('rules.own', 'rules.own', () => { if (state.own && !ownInEditor()) tryProgram(state.own.text, state.own.sensors); }, 'rules.own');
  const exampleButtons = EXAMPLES.map((ex) => {
    const b = stripItem(`rules.example.${ex.id}.short`, `rules.example.${ex.id}`, () => tryProgram(t(ex.textKey), ex.sensors), `rules.example.${ex.id}`);
    b.example = ex;
    return b;
  });
  const strip = el('div', { class: 'v2-setting v2-wide', help: 'rules.strip' },
    el('span', { class: 'v2-setting-name', i18n: 'rules.strip.label' }),
    el('div', { class: 'v2-segments v2-strip', attrs: { role: 'group' }, i18nAttr: 'aria-label:rules.strip.label' }, ownButton, exampleButtons));
  const retrySwitch = toggle({ labelKey: 'rules.retry', help: 'rules.retry', value: state.autoRetry, dataset: { v1: 'rules.retry' }, onChange: (v) => { state.autoRetry = v; sync(); } });
  const machineSwitch = toggle({ labelKey: 'drive.machine', help: 'rules.machine', value: state.machineView, dataset: { v1: 'rules.machine' }, onChange: (v) => { state.machineView = v; sync(); } });
  const tryThis = group({ titleKey: 'level.try' }, strip, el('div', { class: 'v2-row v2-row-start' }, retrySwitch.element, machineSwitch.element));

  // Sensores del auto (de esta etapa, con el programa): cantidad, alcance y apertura, y si se dibujan los rayos.
  const sensorsNotice = el('p', { class: 'v2-notice', attrs: { role: 'status', hidden: true } });
  const fmtSensor = { sensorCount: (v) => String(v), sensorRange: (v) => formatFixed(v, v % 1 ? 1 : 0, i18n.language), sensorSpread: (v) => t('drive.value.degrees', { value: v }) };
  const sensorSliders = Object.fromEntries(SENSOR_KEYS.map((key) => {
    const r = SLIDERS.find((s) => s.key === key);
    const c = slider({ labelKey: `drive.${key}`, help: `drive.${key}`, min: r.min, max: r.max, step: r.step, value: settings[key], format: fmtSensor[key], onInput: (v) => { sensorsNotice.hidden = true; setSensors({ [key]: v }); } });
    c.element.dataset.v1 = `drive.${key}`;
    c.element.dataset.key = key;
    return [key, c];
  }));
  const sensorsSwitch = toggle({ labelKey: 'rules.sensors', help: 'rules.sensors', value: state.showSensors, dataset: { v1: 'rules.sensors' }, onChange: (v) => { state.showSensors = v; sync(); } });
  const sensorsGroup = group({ titleKey: 'rules.v2.sensorsGroup', tagKey: 'tag.stage' }, sensorsNotice,
    grid(3, ...SENSOR_KEYS.map((k) => sensorSliders[k].element)), sensorsSwitch.element);

  // Archivo: tráfico nuevo, la tabla, exportar, importar y restablecer (con Deshacer al lado).
  const newTrafficButton = button({ level: 'small', labelKey: 'rules.newTraffic', help: 'rules.newTraffic', onClick: () => newTraffic(), attrs: { 'data-v1': 'rules.newTraffic' } });
  const compareButton = button({ level: 'small', labelKey: 'rules.compare.open', help: 'rules.compare.open', onClick: () => (state.compareOpen ? closeCompare() : openCompare({ focus: true })), attrs: { 'data-v1': 'rules.compare.open', 'data-keeps-focus': 'true', 'aria-expanded': 'false' } });
  const exportButton = button({ level: 'tertiary', labelKey: 'rules.export', help: 'rules.export', attrs: { 'data-v1': 'rules.export' }, onClick: () => download(t('rules.export.fileName'), editor.value) });
  const fileInput = el('input', { class: 'v2-file', attrs: { type: 'file', accept: '.txt,text/plain', tabindex: '-1', 'aria-hidden': 'true' } });
  const importButton = button({ level: 'tertiary', labelKey: 'rules.import', help: 'rules.import', attrs: { 'data-v1': 'rules.import' }, onClick: () => fileInput.click() });
  const resetButton = button({ level: 'tertiary', labelKey: 'rules.reset', help: 'rules.reset', attrs: { 'data-v1': 'rules.reset' }, onClick: () => {
    message.hidden = true;
    replaceProgram(t(INITIAL_PROGRAM.textKey), INITIAL_PROGRAM.sensors, { undoKey: 'rules.v2.undo.reset', after: () => { state.own = null; clearCasebook(); } });
  } });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;
    message.hidden = true;
    try {
      const text = (await file.text()).replace(/\r\n?/g, '\n');
      // eslint-disable-next-line no-control-regex
      if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(text)) { showMessage('rules.import.notText', { file: file.name }, { error: true }); return; }
      if (text.length > RULES_PROGRAM_MAX || countLines(text) > RULES_LIMITS.lines) { showMessage('rules.import.tooLong', { file: file.name }, { error: true }); return; }
      replaceProgram(text, null, { undoKey: 'rules.v2.undo.import', params: { file: file.name }, after: () => showMessage('rules.import.done', { file: file.name }) });
    } catch {
      showMessage('rules.import.notText', { file: file.name }, { error: true });
    }
  });
  function download(name, text) {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    const a = el('a', { attrs: { href: url, download: name } });
    doc.body.append(a);
    a.click();
    a.remove();
    win.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const fileGroup = group({ titleKey: 'rules.v2.fileGroup' },
    el('div', { class: 'v2-row v2-row-start' }, newTrafficButton, compareButton),
    el('div', { class: 'v2-row v2-row-start' }, exportButton, importButton, resetButton, fileInput),
    notice.element, message);
  sheet.append(mission.element, missionsCircuit, el('div', { class: 'v2-guide-only' }, moreButton, moreBody), tryThis, sensorsGroup, fileGroup);

  function revealMission() {
    const current = currentMission(session.missions, { available: !world.track.closed });
    const target = current && REVEAL[current.id];
    if (target === 'newTraffic') notebook.reveal(newTrafficButton);
    else if (target === 'editor') {
      const node = state.programView === 'cards' ? cardsView.list : editor.node;
      node.classList.remove('v2-revealed'); void node.offsetWidth; node.classList.add('v2-revealed');
      (state.programView === 'cards' ? cardsView.node.querySelector('button, select, input') : editor.input)?.focus();
      win.setTimeout(() => node.classList.remove('v2-revealed'), 2400);
    }
  }

  // --- Hoja "Escenario" ---------------------------------------------------------------------------------------
  mountScenarioSheet({
    i18n, scenario, stage: STAGE, panel: notebook.sheet('escenario', 'scenario.sheet'),
    v1: { track: 'track', lanes: 'drive.lanes', maxSpeed: 'drive.maxSpeed', density: 'drive.density', irregularity: 'drive.irregularity', reset: 'drive.resetSettings' },
  });

  // --- Banda: cuaderno de casos, cifras y marcha; con el choque, el caso -------------------------------------
  const casebookSummary = el('p', { class: 'v2-casebook-summary', attrs: { 'data-free-text': '' } });
  const casebookAxis = el('div', { class: 'v2-casebook-axis' });
  const casebook = el('div', { class: 'v2-casebook v2-guide-only', help: 'rules.casebook', attrs: { role: 'group', 'data-v1': 'rules.strip' }, i18nAttr: 'aria-label:rules.casebook.label' }, casebookSummary, casebookAxis);
  const figures = el('div', { class: 'v2-figures' });
  const figure = (labelKey) => { const b = el('b', { attrs: { 'data-free-text': '' } }); const s = el('span', { i18n: labelKey }); figures.append(el('div', {}, b, s)); return { b, s }; };
  const figDistance = figure('drive.stats.distance');
  const figPassed = figure('drive.stats.passed');
  const figBest = figure('drive.stats.best');
  const pauseButton = button({ labelKey: 'drive.pause', help: 'rules.pause', keyKey: 'key.space', onClick: () => togglePause(), attrs: { 'aria-pressed': 'false', 'data-v1': 'rules.pause' } });
  const restartButton = button({ labelKey: 'drive.restart', help: 'rules.restart', key: 'R', onClick: () => restart(), attrs: { 'data-v1': 'rules.restart' } });
  const run = el('div', { class: 'v2-run' }, pauseButton, restartButton);
  // El caso del choque (reglas-el-choque-ensena): título, líneas, cuenta regresiva y acciones.
  const caseTitle = el('h2', { class: 'v2-case-title', attrs: { 'aria-live': 'polite' } });
  const caseLines = el('span');
  const caseCount = el('span', { class: 'v2-muted' });
  const caseCompare = button({ level: 'primary', labelKey: 'rules.case.compare', help: 'rules.case.compare', onClick: () => openCompare({ focus: true }), attrs: { 'data-keeps-focus': 'true', 'data-v1': 'rules.case.compare' } });
  const caseWrite = button({ labelKey: 'rules.case.write', help: 'rules.case.write', onClick: () => writeCaseRule(), attrs: { 'data-keeps-focus': 'true', 'data-v1': 'rules.case.write' } });
  const caseRestart = button({ level: 'tertiary', labelKey: 'drive.restart', help: 'rules.restart', key: 'R', onClick: () => restart() });
  const caseCard = el('section', { class: 'v2-case', attrs: { 'data-state': 'crash', hidden: true }, i18nAttr: 'aria-label:rules.case.label' },
    el('div', { class: 'v2-case-text' }, caseTitle, el('p', {}, caseLines, ' ', caseCount)),
    el('div', { class: 'v2-case-actions' }, caseCompare, caseWrite, caseRestart));
  band.append(casebook, figures, run, caseCard);

  // La repetición de los últimos 3 s, sobre la escena.
  const replayInput = el('input', { class: 'v2-replay-input', help: 'rules.replay', i18nAttr: 'aria-label:rules.replay.label', attrs: { type: 'range', min: '-179', max: '0', step: '1', value: '0', 'data-keeps-focus': 'true', 'data-v1': 'rules.replay' } });
  const replayValue = el('span', { class: 'v2-replay-value', attrs: { 'aria-hidden': 'true', 'data-free-text': '' } });
  const replay = el('div', { class: 'v2-replay', attrs: { hidden: true } }, el('span', { i18n: 'rules.replay.label', attrs: { 'aria-hidden': 'true' } }), replayInput, replayValue);
  scene.append(replay);
  function setReplay(offset) {
    state.replayOffset = Math.max(Number(replayInput.min), Math.min(0, Math.round(offset)));
    if (Number(replayInput.value) !== state.replayOffset) replayInput.value = String(state.replayOffset);
    holdCase();
    sync();
  }
  replayInput.addEventListener('input', () => setReplay(Number(replayInput.value)));
  replayInput.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
    e.stopPropagation();
    if (!e.shiftKey) return;
    e.preventDefault();
    setReplay(state.replayOffset + (e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 1) * 10);
  });

  function writeCaseRule() {
    const info = state.caseInfo;
    if (!info) return;
    holdCase();
    if (state.programView === 'cards') { addCardRule(caseCondition(info.sensors, i18n.language).trimEnd()); return; }
    const input = editor.input;
    const end = input.value.length;
    input.focus({ preventScroll: true });
    input.setSelectionRange(end, end);
    editor.insert(`${end === 0 || input.value.endsWith('\n') ? '' : '\n'}${caseCondition(info.sensors, i18n.language)}`);
    const at = input.value.length;
    input.setSelectionRange(at, at);
    input.scrollTop = input.scrollHeight;
  }

  // --- La tabla: los programas en el mismo tráfico ------------------------------------------------------------
  let compareReturn = null;
  let compareRun = null;
  let compareKey = null;
  let compareRows = null;
  function buildCompare() {
    const statusP = el('p', { class: 'rules-compare-status', attrs: { role: 'status' } });
    const noteCircuit = el('p', { class: 'rules-compare-note', i18n: 'rules.compare.note.circuit' });
    const noteSpeed = el('p', { class: 'rules-compare-note' });
    const body = el('tbody');
    const table = el('table', { class: 'rules-compare-table' },
      el('thead', {}, el('tr', {}, ...['program', 'passed', 'sensors', 'rules', 'distance', 'result'].map((c) => el('th', { attrs: { scope: 'col' }, class: `col-${c}`, i18n: `rules.compare.col.${c}` })), el('th', { attrs: { scope: 'col' } }))),
      body);
    const close = button({ level: 'tertiary', labelKey: 'rules.compare.close', help: 'rules.compare.close', onClick: () => closeCompare() });
    const section = el('section', { class: 'rules-compare', attrs: { tabindex: '-1', 'aria-labelledby': 'v2-rules-compare-title', hidden: true } },
      el('div', { class: 'rules-compare-head' }, el('h3', { i18n: 'rules.compare.title', attrs: { id: 'v2-rules-compare-title' } }), el('span', { class: 'v2-muted', i18n: 'rules.compare.caption' }), close),
      noteCircuit, noteSpeed, statusP, table);
    section.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeCompare(); } });
    return { section, status: statusP, noteCircuit, noteSpeed, body, table };
  }
  function compareEntries() {
    const driving = program.validText;
    const drivingId = driving === null ? null : programIdOf(driving, { es, en });
    const entries = [];
    const cur = sensorsOf(settings);
    if (driving !== null && (drivingId === null || drivingId === 'initial')) entries.push({ id: drivingId ?? 'own', nameKey: drivingId ? 'rules.program.initial.name' : 'rules.own', text: driving, sensors: cur });
    for (const ex of EXAMPLES) entries.push({ id: ex.id, nameKey: ex.nameKey, text: t(ex.textKey), sensors: { ...ex.sensors } });
    if (state.own && drivingId !== null) entries.push({ id: 'saved', nameKey: 'rules.own', text: state.own.text, sensors: { ...state.own.sensors } });
    const same = (a, b) => a.count === b.count && a.range === b.range && a.spread === b.spread;
    for (const e of entries) e.driving = driving !== null && normalizeText(e.text) === normalizeText(driving) && same(e.sensors, cur);
    return entries;
  }
  const keyOf = (entries) => JSON.stringify([seed, settings.maxSpeed, settings.lanes, settings.density, settings.irregularity, entries.map((e) => [e.id, e.text, e.sensors, e.driving])]);
  function openCompare({ focus = false } = {}) {
    holdCase();
    const active = doc.activeElement;
    if (!state.compareOpen) compareReturn = active && !compare.section.contains(active) && active !== doc.body ? active : null;
    state.compareOpen = true;
    sync();
    if (focus) compare.section.focus({ preventScroll: true });
  }
  function closeCompare({ restore = true } = {}) {
    const hadFocus = compare.section.contains(doc.activeElement);
    state.compareOpen = false;
    sync();
    if (restore && hadFocus) (compareReturn?.isConnected ? compareReturn : compareButton).focus({ preventScroll: true });
    compareReturn = null;
  }
  function stopCompare() { if (compareRun?.timer) win.clearTimeout(compareRun.timer); compareRun = null; }
  /** Corre la comparación por tramos, uno por vuelta del bucle de eventos: la escena sigue animándose. */
  function startCompare(entries, key) {
    stopCompare();
    compareRows = null;
    const gen = compareRuns({ seed, settings, programs: entries });
    const runState = { key, timer: 0 };
    const pump = () => {
      if (compareRun !== runState) return;
      try {
        const r = gen.next();
        if (r.done) { compareRun = null; compareKey = key; compareRows = r.value.map((row, i) => ({ ...row, entry: entries[i] })); renderCompare(); renderStrip(); }
        else runState.timer = win.setTimeout(pump, 0);
      } catch (err) { compareRun = null; console.error(err); }
    };
    compareRun = runState;
    runState.timer = win.setTimeout(pump, 0);
  }
  function renderCompare() {
    compare.body.replaceChildren(...(compareRows ?? []).map((r) => {
      const e = r.entry;
      const name = el('th', { attrs: { scope: 'row' } }, el('span', { i18n: e.nameKey }));
      if (e.driving) name.append(' ', el('span', { class: 'rules-compare-driving', i18n: 'rules.compare.driving' }));
      const res = compareResult(r);
      const tryB = button({ level: 'small', labelKey: 'rules.compare.try', help: 'rules.compare.try', onClick: () => tryProgram(e.text, e.sensors) });
      return el('tr', { attrs: { 'aria-current': e.driving ? 'true' : null } }, name,
        el('td', { class: 'num col-passed', text: r.ok ? String(r.passed) : '–' }),
        el('td', { class: 'num', text: String(r.sensors.count) }),
        el('td', { class: 'num', text: r.ok ? String(r.rules) : '–' }),
        el('td', { class: 'num', text: r.ok ? t('drive.value.meters', { value: Math.floor(r.distance) }) : '–' }),
        el('td', { class: 'rules-compare-result', attrs: { 'data-result': res.key.split('.').pop() }, i18n: res.key, params: res.params ?? {} }),
        el('td', {}, tryB));
    }));
    i18n.translateTree(compare.body);
  }
  function renderStrip() {
    const computing = compareRun !== null || compareRows === null;
    const byId = new Map((compareRows ?? []).map((r) => [r.entry.id, r]));
    const drivingId = programIdOf(editor.value, { es, en });
    const same = (a) => a.count === settings.sensorCount && a.range === settings.sensorRange && a.spread === settings.sensorSpread;
    const write = (b, row, pressed) => {
      const fig = computing ? '…' : row?.ok ? String(row.passed) : '–';
      if (b.figure.textContent !== fig) b.figure.textContent = fig;
      if (computing) tr(b.said, i18n, 'rules.strip.computing');
      else if (row?.ok) tr(b.said, i18n, 'rules.strip.passed', { value: row.passed });
      else if (b.said.textContent) { b.said.textContent = ''; b.said.removeAttribute('data-i18n'); }
      setAttr(b, 'aria-pressed', String(pressed));
    };
    for (const b of exampleButtons) write(b, byId.get(b.example.id), drivingId === b.example.id && same(b.example.sensors));
    write(ownButton, byId.get(drivingId === null ? 'own' : 'saved'), ownInEditor());
  }
  function syncCompare() {
    compare.section.hidden = !state.compareOpen;
    setAttr(compareButton, 'aria-expanded', String(state.compareOpen));
    const entries = compareEntries();
    const key = keyOf(entries);
    if (key !== compareKey && compareRun?.key !== key) startCompare(entries, key);
    renderStrip();
    if (!state.compareOpen) return;
    const computing = compareRun !== null;
    compare.status.hidden = !computing;
    if (computing) tr(compare.status, i18n, 'rules.compare.computing');
    compare.table.hidden = computing;
    const notes = compareNotes(settings, onCircuit(settings));
    compare.noteCircuit.hidden = !notes.circuit;
    compare.noteSpeed.hidden = !notes.speed;
    if (notes.speed) tr(compare.noteSpeed, i18n, 'rules.compare.note.speed', { value: settings.maxSpeed });
  }

  // --- Sincronizar con el estado ------------------------------------------------------------------------------
  const meters = (v) => ({ value: Math.floor(v) });
  const describeMission = (m) => ({ nameKey: `rules.mission.${m.id}`, params: { goal: m.goal }, countKey: 'drive.mission.progress.vehicles', countParams: { value: m.progress, goal: m.goal }, done: m.progress, goal: m.goal });
  const write = (node, text) => { if (node.textContent !== text) node.textContent = text; };
  let lastDescription = '';
  let casebookKey = '';

  function sync() {
    const circuit = world.track.closed;
    const crashed = world.crashed;
    const info = state.caseInfo;
    const frame = info && state.replayOffset < 0 ? state.replay.at(state.replayOffset) : null;

    // Percepción y acción (las del cuadro de la repetición, si hay uno a la vista).
    const p = frame ? { sensors: Array.from(frame.sensors), speed: frame.speed } : world.perception;
    const count = p.sensors.length;
    if (Number(rowsList.dataset.count) !== count) buildRows(count);
    const r = readings(p);
    const width = (v) => `${Math.round(Math.max(0, Math.min(1, v)) * 100)}%`;
    if (count <= READINGS_MAX) p.sensors.forEach((v, i) => { const w = width(v); if (rows[i].fill.style.width !== w) rows[i].fill.style.width = w; write(rows[i].value, formatFixed(r.sensors[i], 2, i18n.language)); });
    const sp = rows[rows.length - 1];
    if (sp.fill.style.width !== width(r.speed)) sp.fill.style.width = width(r.speed);
    write(sp.value, formatFixed(r.speed, 2, i18n.language));
    shown = { sensors: r.sensors ?? [], speed: r.speed };
    tooMany.hidden = count <= READINGS_MAX;
    if (count > READINGS_MAX) tr(tooMany, i18n, 'rules.palette.more', { count, last: `sensor${count}` });
    const controls = frame ? frame.controls : controller.controls;
    for (const l of lamps) setAttr(l, 'data-on', String(!!controls[l.dataset.output]));

    // Marcas en el editor y las fichas.
    const marks = {
      active: frame ? frame.lines : info ? [] : program.showsRunning && !dirty ? controller.activeLines : [],
      crash: info && !frame ? info.lines : [],
      errors: dirty ? [] : program.errors.map((e) => e.line),
    };
    editor.setMarks(marks);
    if (state.programView === 'cards') guardCards(() => { cardsView.setMarks(marks); cardsView.setLive(p); });
    write(rulesValue, String(program.rules));

    // Banda.
    write(figDistance.b, t('drive.value.meters', meters(session.distance)));
    tr(figPassed.s, i18n, circuit ? 'drive.stats.laps' : 'drive.stats.passed');
    write(figPassed.b, circuit ? t('drive.value.laps', { value: formatFixed(lapsShown(session.distance, world.track.length), 1, i18n.language) }) : String(session.passed));
    write(figBest.b, t('drive.value.meters', meters(Math.max(session.best, state.casebook.best))));
    setAttr(pauseButton, 'aria-pressed', String(world.paused));
    tr(pauseButton.querySelector('span'), i18n, world.paused ? 'drive.resume' : 'drive.pause');
    pauseBadge.hidden = !world.paused;
    machineBadge.hidden = !(state.machineView && !crashed);
    syncCase();
    syncCasebook();

    // Hoja Programar.
    const current = currentMission(session.missions, { available: !circuit });
    mission.element.hidden = !current;
    missionsCircuit.hidden = !circuit;
    if (current?.allDone) mission.set({ nameKey: 'mission.allDone', done: 1, goal: 1, complete: true });
    else if (current) mission.set(describeMission(current));
    if (missionReveal) missionReveal.hidden = !(current && REVEAL[current.id]);
    newTrafficButton.hidden = circuit;
    ownButton.hidden = !state.own;
    retrySwitch.set(state.autoRetry);
    machineSwitch.set(state.machineView);
    sensorsSwitch.set(state.showSensors);
    for (const k of SENSOR_KEYS) if (Number(sensorSliders[k].input.value) !== settings[k]) sensorSliders[k].set(settings[k]);
    syncCompare();

    const text = drivingDescription({ t, track: settings.track, lanes: settings.lanes, paused: world.paused, crashed, meters: session.distance, machineView: state.machineView && !crashed });
    if (text !== lastDescription) { description.textContent = text; lastDescription = text; }
  }
  function syncCase() {
    const info = state.caseInfo;
    run.hidden = Boolean(info);
    figures.hidden = Boolean(info);
    // Con el caso a la vista, la banda es del caso: el cuaderno de casos vuelve al reiniciar (ya cuenta este choque).
    casebook.classList.toggle('v2-hidden', Boolean(info));
    caseCard.hidden = !info;
    const frames = state.replay.length;
    replay.hidden = !info || frames < 2;
    if (!info) return;
    tr(caseTitle, i18n, info.cause === 'vehicle' ? 'rules.case.title.vehicle' : info.circuit ? 'rules.case.title.edge.circuit' : 'rules.case.title.edge', meters(info.distance));
    if (info.lines.length === 0) tr(caseLines, i18n, 'rules.case.lines.none');
    else tr(caseLines, i18n, info.lines.length === 1 ? 'rules.case.lines.one' : 'rules.case.lines.many', { lines: listOf(info.lines) });
    if (!state.autoRetry) tr(caseCount, i18n, 'rules.case.manual');
    else if (session.held) tr(caseCount, i18n, 'rules.case.held');
    else if (world.paused) tr(caseCount, i18n, 'rules.case.paused');
    else tr(caseCount, i18n, 'rules.case.countdown', { value: Math.max(1, Math.ceil(session.retryIn / 60)) });
    const min = String(-(frames - 1));
    if (replayInput.min !== min) replayInput.min = min;
    if (Number(replayInput.value) !== state.replayOffset) replayInput.value = String(state.replayOffset);
    const at = state.replayOffset === 0 ? t('rules.replay.now') : t('rules.replay.at', { value: formatFixed(-state.replayOffset / 60, 1, i18n.language) });
    write(replayValue, at);
    setAttr(replayInput, 'aria-valuetext', at);
  }
  function listOf(numbers) {
    const items = numbers.map(String);
    try { return new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(items); } catch { return items.join(', '); }
  }
  function syncCasebook() {
    const { cases, best } = state.casebook;
    const key = JSON.stringify([cases.length, Math.floor(best), program.rules, i18n.language, cases.length ? cases[cases.length - 1].distance : 0]);
    if (key === casebookKey) return;
    casebookKey = key;
    casebook.dataset.empty = String(cases.length === 0);
    if (cases.length === 0) { tr(casebookSummary, i18n, 'rules.casebook.empty'); casebookAxis.replaceChildren(); return; }
    const n = (k, value) => t(value === 1 ? `${k}.one` : k, { value });
    casebookSummary.removeAttribute('data-i18n');
    casebookSummary.removeAttribute('data-i18n-params');
    casebookSummary.textContent = [n('rules.casebook.cases', cases.length), n('rules.casebook.rules', program.rules), t('rules.casebook.best', { value: Math.floor(best) })].join(' · ');
    const scale = Math.max(best, 1);
    casebookAxis.replaceChildren(...cases.map((c) => {
      const kind = c.cause === 'vehicle' ? 'vehicle' : 'edge';
      const value = Math.floor(c.distance);
      const dot = el('span', { class: 'v2-casebook-dot', text: '✸', attrs: { 'aria-label': t(`rules.casebook.dot.${kind}`, { value }), role: 'img', 'data-free-text': '' } });
      dot.style.left = `${(100 * c.distance) / scale}%`;
      return dot;
    }));
  }

  // --- Bucle ------------------------------------------------------------------------------------------------
  function frameWorld(frame) {
    return {
      track: world.track, trackId: world.trackId, seed: world.seed,
      car: { ...world.car, position: { x: frame.car.x, y: frame.car.y }, angle: frame.car.angle, speed: frame.car.speed, crashed: frame.car.crashed },
      rays: raysOf(frame), perception: { sensors: Array.from(frame.sensors), speed: frame.speed }, crashed: frame.car.crashed,
      vehiclesIn: (from, to) => world.traffic.vehicles(frame.time, from, to),
    };
  }
  function step() {
    const before = world.steps;
    world.step();
    if (world.steps !== before) {
      state.replay.push(frameOf(world, controller));
      if (world.crashed && !state.caseInfo) onCrash();
    }
    if (session.step(world, { seed, autoRetry: state.autoRetry }) === 'retry') restartAttempt();
  }
  function render() {
    const frame = state.caseInfo && state.replayOffset < 0 ? state.replay.at(state.replayOffset) : null;
    const shownWorld = frame ? frameWorld(frame) : world;
    const opts = viewOptions(state, shownWorld);
    view.render(shownWorld, opts);
    if (opts.showSensors) glow.draw(sceneCtx, { car: shownWorld.car, rays: shownWorld.rays, zoom: view.camera.zoom, dpr: win.devicePixelRatio || 1 });
    sceneCtx.setTransform(1, 0, 0, 1, 0, 0);
    sync();
  }
  const loop = createLoop({ step, render, onError: (err) => console.error(err) });

  // --- Atajos: R reinicia y espacio pausa, salvo escribiendo en el editor ---------------------------------------
  let handledSpace = false;
  function onKeyDown(e) {
    if (!visible) return;
    const action = shortcutFor(e);
    if (!action) return;
    e.preventDefault();
    if (action === 'pause') handledSpace = true;
    if (e.repeat) return;
    if (action === 'restart') restart(); else togglePause();
  }
  function onKeyUp(e) { if (e.code === 'Space' && handledSpace) { handledSpace = false; e.preventDefault(); } }
  win.addEventListener('keydown', onKeyDown);
  win.addEventListener('keyup', onKeyUp);
  const offLanguage = i18n.onChange(() => {
    for (const row of rows) row.node.setAttribute('data-help-params', JSON.stringify({ name: t(row.nameKey, row.params) }));
    paletteKey = '';
    renderPalette();
    if (state.programView === 'cards') guardCards(() => cardsView.render(program.text, { force: true }));
    renderCompare();
    casebookKey = '';
    lastDescription = '';
    renderStatus();
    sync();
  });

  buildRows(world.perception.sensors.length);
  renderStatus();
  renderPalette();
  layoutProgramView();
  sync();

  return {
    view, loop, session, editor, program, controller, cardsView, state,
    get world() { return world; },
    get settings() { return { ...settings }; },
    get seed() { return seed; },
    restart, newTraffic, togglePause, commit, setProgramView,
    /** Avanza `n` pasos y dibuja (verificación desde la consola, aunque el navegador no pida cuadros). */
    advance(n = 1) { for (let i = 0; i < n; i += 1) step(); render(); },
    show() { visible = true; loop.start(); },
    hide() { visible = false; loop.stop(); if (pending !== null) commit(); },
    unmount() {
      if (pending !== null) commit();
      loop.dispose();
      stopCompare();
      offLanguage?.();
      offScenario();
      win.removeEventListener('keydown', onKeyDown);
      win.removeEventListener('keyup', onKeyUp);
      editor.dispose();
      cardsView.dispose();
      view.dispose();
    },
  };
}
