// Pestaña 4, "Competir" (pestana-competir): una carrera de fantasmas con meta entre cerebros,
// programas y la persona, y una tabla por pista que muestra si un cerebro generaliza.
//
// Composición: carrera del núcleo (core/race.js) + vista + bucle; el tablero con los indicadores,
// el marcador de la carrera y la tabla por pista; el panel con la guía, la carrera, el tráfico de la
// carrera, la penalización, la vista, los competidores y las misiones; y la barra de escenario sin el
// grupo de sensores (D12). La lógica que se prueba sin DOM vive en competitors.js, marks.js,
// results.js, missions.js, seeds.js y shortcuts.js.
//
// El estado vive en el módulo (D13): la selección, los ajustes, los resultados, el contador de
// semillas, las misiones y el competidor seguido se conservan al salir y volver; la carrera queda en
// pausa mientras la pestaña no está a la vista.
import { createRace, RACE_GOALS, CRASH_PENALTY_LIMITS, RACE_CRASH_PENALTY, crashPenaltyOf, RACE_WAIT_SECONDS } from '../../core/race.js';
import { TRACK_IDS, isCircuit } from '../../core/circuits.js';
import { MAX_SPEED } from '../../core/constants.js';
import { DEFAULT_TRAFFIC } from '../../core/traffic.js';
import { TRAINING_IRREGULARITY } from '../../core/training.js';
import { scenarioTracks } from '../../core/brain.js';
import { DEFAULT_LANES } from '../../core/constants.js';
import { createKeyboardController } from '../../input/keyboard.js';
import { createStageView } from '../../render/view.js';
import { createLoop, SPEEDS } from '../../ui/loop.js';
import { el } from '../../ui/dom.js';
import { returnsFocusToStage, characterShortcutsOn } from '../../ui/shortcuts.js';
import { button, switchButton, sliderRow, optionGroup, createTextSetter } from '../../ui/controls.js';
import { statStrip, boardCard } from '../../ui/board.js';
import { formatFixed } from '../../ui/i18n.js';
import { stageDescription } from '../../ui/stage-description.js';
import { scenarioBar } from '../shared/scenario-bar.js';
import { normalizeSettings as normalizeStreet, lapsShown } from '../shared/street-settings.js';
import { raceDescription, goalText } from '../shared/stage-text.js';
import { EXAMPLE_BRAINS } from '../../data/example-brains.js';
import { listCandidates, buildCompetitor, createSelection, MAX_COMPETITORS } from './competitors.js';
import { markFor, practicedTraffic } from './marks.js';
import { createResults, STREET_TRAFFICS } from './results.js';
import { createCompeteMissions } from './missions.js';
import { createSeedSeries, seedFor } from './seeds.js';
import { shortcutFor, mainAction } from './shortcuts.js';

/** Valores de la barra al abrir y al restablecer (D3): los del entrenamiento. */
export const BAR_DEFAULTS = Object.freeze({
  track: 'straight', lanes: DEFAULT_LANES, density: DEFAULT_TRAFFIC.density, irregularity: TRAINING_IRREGULARITY, maxSpeed: MAX_SPEED,
});

/** Cada cuánto, como mucho, se reordena el marcador (ms). */
const REORDER_MS = 500;

// --- Estado conservado entre montajes (D13) ------------------------------------------------------
let state = null;
const results = createResults();
const seeds = createSeedSeries();
const completedMissions = new Set();
const missionTracks = new Set();

/** Olvida el estado conservado (para pruebas o para reiniciar la aplicación). */
export function resetState() { state = null; }

/** Clave de color de una casilla: la persona, el verde de siempre; los demás, el de su casilla. */
const colorKey = (key, slot) => (key === 'human' ? 'car' : `competitor${slot}`);

export function mount({ stage, board, panel, bar, i18n, store, library, preferences, reportError }) {
  if (!state) {
    state = {
      settings: { ...BAR_DEFAULTS, maxSpeed: store?.get().carSpeed ?? BAR_DEFAULTS.maxSpeed },
      traffic: 'new', // tráfico de la carrera en la calle recta: 'new' o 'practice' (D2)
      newSeed: seeds.first,
      crashPenalty: RACE_CRASH_PENALTY,
      selection: createSelection(),
      speed: 1,
      showSensors: true,
      machineView: false,
      follow: null, // clave del competidor que eligió seguir la persona (o null)
      race: null,
      phase: 'waiting',
      raceKeys: [],
      cards: { scoreboard: true, table: true },
      missions: createCompeteMissions({ completed: completedMissions, tracks: missionTracks }),
    };
  }
  // La velocidad máxima es una sola para toda la app: si cambió en otra pestaña, rige acá.
  const carSpeed = store?.get().carSpeed;
  const speedChanged = carSpeed !== undefined && carSpeed !== null && carSpeed !== state.settings.maxSpeed;
  if (speedChanged) state.settings = { ...state.settings, maxSpeed: carSpeed };

  const t = (k, p) => i18n.t(k, p);
  const setText = createTextSetter(i18n);
  const view = createStageView({ container: stage, store });
  const description = stageDescription({ stage });
  const focusStage = () => stage.focus({ preventScroll: true });
  const keyboard = createKeyboardController();

  // --- Candidatos y competidores -------------------------------------------------------------------
  let candidates = [];
  const candidateOf = (key) => candidates.find((c) => c.key === key) ?? null;
  const remembered = () => ({ program: preferences?.rulesProgram ?? null, sensors: preferences?.rulesSensors ?? null });

  /** Vuelve a armar la lista con la biblioteca y el programa actuales y aplica las bajas (D8 y D13). */
  function refreshCandidates() {
    candidates = listCandidates({ library: library ? library.list() : [], examples: EXAMPLE_BRAINS, remembered: remembered(), t });
    results.prune(candidates.map((c) => ({ key: c.key, signature: c.signature })));
    return state.selection.prune(candidates.filter((c) => c.available).map((c) => c.key));
  }

  /** Nombre visible de un candidato. */
  function nameOf(c) {
    if (!c) return '';
    if (c.kind === 'human') return t('compete.human');
    if (c.key === 'program') return t('compete.program.own');
    if (c.nameKey) return t(c.nameKey);
    return c.name;
  }
  const kindText = (c) => t(`compete.kind.${c.kind === 'example' ? 'brain' : c.kind}`);
  /** Dónde entrenó un cerebro, en una palabra (D10). */
  function whereText(c) {
    if (!c.brain) return '';
    const ids = [...new Set((c.brain.training?.scenarios ?? []).filter((s) => s.generations > 0).flatMap((s) => scenarioTracks(s.track)))];
    const ordered = TRACK_IDS.filter((id) => ids.includes(id));
    if (ordered.length === 0) return t('compete.where.none');
    if (ordered.length === TRACK_IDS.length) return t('compete.where.all');
    return ordered.map((id) => t(`track.short.${id}`)).join(' + ');
  }

  const onCircuit = () => isCircuit(state.settings.track);
  const humanIn = () => state.raceKeys.includes('human');

  // --- Carrera ----------------------------------------------------------------------------------
  /** Arma una carrera nueva con los marcados (D5: con "Vos", espera en la salida; sin "Vos", larga sola). */
  function newRace({ seed = 'same' } = {}) {
    if (seed === 'next' && !onCircuit() && state.traffic === 'new') state.newSeed = seeds.next();
    const keys = state.selection.keys;
    const competitors = keys.map((k) => buildCompetitor(candidateOf(k), { t, keyboard: () => keyboard }));
    const s = state.settings;
    state.race = createRace({
      track: s.track, seed: seedFor(onCircuit() ? 'new' : state.traffic, state.newSeed),
      lanes: s.lanes, density: s.density, irregularity: s.irregularity, maxSpeed: s.maxSpeed,
      crashPenalty: state.crashPenalty, competitors,
    });
    state.raceKeys = keys;
    state.raceSignatures = keys.map((k) => candidateOf(k).signature);
    state.raceTraffic = state.traffic;
    state.raceSettings = { lanes: s.lanes, density: s.density, irregularity: s.irregularity, maxSpeed: s.maxSpeed, crashPenalty: state.crashPenalty };
    state.phase = keys.includes('human') ? 'waiting' : 'running';
    state.follow = null;
    state.firstAnnounced = false;
    keyboard.releaseAll();
    view.followCar();
    announce(null);
    lastOrder = 0;
    renderList();
    rebuildScoreboard();
    sync();
  }

  function start() {
    if (state.phase !== 'waiting') return;
    state.phase = 'running';
    keyboard.releaseAll();
    focusStage();
    sync();
  }
  function togglePause() {
    if (state.phase === 'running') state.phase = 'paused';
    else if (state.phase === 'paused') state.phase = 'running';
    sync();
  }
  function main() {
    const action = mainAction(state.phase);
    if (action === 'start') start();
    else if (action === 'another') anotherRace();
    else togglePause();
  }
  const restart = () => newRace();
  const anotherRace = () => newRace({ seed: 'next' });

  /** La carrera terminó: anota resultados y misiones y lo anuncia (D8, D15 y D9). */
  function finishRace() {
    const race = state.race;
    state.phase = 'finished';
    const entries = race.results.map((r, i) => ({
      key: state.raceKeys[i], signature: state.raceSignatures[i],
      result: { arrived: r.state === 'arrived', time: r.time, share: r.share, crashes: r.crashes },
    }));
    results.record({ track: race.trackId, traffic: state.raceTraffic, settings: state.raceSettings, entries });
    state.missions.raceEnded({
      track: race.trackId,
      entries: entries.map((e, i) => {
        const c = candidateOf(e.key);
        return { key: e.key, kind: c?.kind ?? 'brain', brain: c?.brain ?? null, result: { ...e.result, state: race.results[i].state } };
      }),
      standings: race.standings,
    });
    const winner = winnerName();
    announce(winner ? t('compete.announce.won', { name: winner }) : t('compete.announce.nobody'));
    renderTable();
  }

  function winnerName() {
    const race = state.race;
    const first = race.standings[0];
    return race.results[first]?.state === 'arrived' ? nameOf(candidateOf(state.raceKeys[first])) : null;
  }

  // --- Panel: guía -------------------------------------------------------------------------------
  const intro = el('p', { class: 'guide compete-intro', i18n: 'compete.guide' });

  // --- Panel: carrera ---------------------------------------------------------------------------
  const mainButton = el('button', { class: 'tool primary compete-main', attrs: { type: 'button' }, on: { click: () => main() } });
  const restartButton = button('compete.restart', 'compete.restart', restart, 'tool small');
  const anotherButton = button('compete.another', 'compete.another', anotherRace, 'tool small');
  const speeds = optionGroup({
    labelKey: 'train.speed', labelHelp: 'compete.speed',
    selected: state.speed,
    options: SPEEDS.map((s) => (s === 'max'
      ? { value: s, i18n: 'compete.speed.maxShort', help: 'compete.speed.max', labelKey: 'train.speed.maxLabel' }
      : { value: s, i18n: 'train.speed.option', params: { n: s }, help: 'compete.speed', labelKey: 'train.speed.optionLabel' })),
    onSelect: (v) => { state.speed = v; loop.setSpeed(v); sync(); },
  });
  speeds.row.classList.add('compete-speeds');
  const runSection = el('section', { class: 'compete-run', attrs: { 'aria-labelledby': 'compete-run-title' } },
    el('h2', { class: 'sr-only', i18n: 'compete.run.title', attrs: { id: 'compete-run-title' } }),
    // El botón principal solo, en su renglón; reiniciar y otra carrera, más chicos, debajo (D10): así los
    // tres se leen enteros en el ancho mínimo del panel. Sus teclas están en los tooltips.
    el('div', { class: 'run-main' }, mainButton),
    el('div', { class: 'run-secondary' }, restartButton, anotherButton),
    speeds.row);

  // --- Panel: tráfico de la carrera (solo en la calle recta) -------------------------------------
  const trafficChoice = optionGroup({
    labelKey: 'compete.traffic', labelHelp: 'compete.traffic',
    selected: state.traffic,
    options: STREET_TRAFFICS.map((v) => ({ value: v, i18n: `compete.traffic.${v}`, help: `compete.traffic.${v}` })),
    onSelect: (v) => {
      if (v === state.traffic) return;
      state.traffic = v;
      newRace({ seed: v === 'new' ? 'next' : 'same' });
    },
  });
  trafficChoice.row.classList.add('compete-traffic');
  const nobodyPracticed = el('p', { class: 'caption compete-nobody', attrs: { role: 'status' }, i18n: 'compete.traffic.nobody' });
  const trafficSection = el('section', { class: 'compete-traffic-block' }, trafficChoice.row, nobodyPracticed);

  // --- Panel: penalización ------------------------------------------------------------------------
  const penalty = sliderRow({
    id: 'compete-penalty', labelKey: 'compete.penalty', help: 'compete.penalty',
    min: CRASH_PENALTY_LIMITS.min, max: CRASH_PENALTY_LIMITS.max, step: CRASH_PENALTY_LIMITS.step, value: state.crashPenalty,
    onInput: (v) => showPenalty(v),
    onChange: (v) => {
      const next = crashPenaltyOf(v);
      if (next === state.crashPenalty) return;
      state.crashPenalty = next;
      newRace();
    },
  });
  penalty.row.classList.add('compete-penalty');
  function showPenalty(v) {
    const value = formatFixed(v, 1, i18n.language);
    setText(penalty.value, 'compete.penalty.value', { value });
    penalty.input.setAttribute('aria-valuetext', t('compete.penalty.value', { value }));
  }

  // --- Panel: vista ---------------------------------------------------------------------------
  const sensorsSwitch = switchButton('compete.sensors', 'compete.sensors', state.showSensors, () => toggleSensors());
  const machineSwitch = switchButton('drive.machine', 'compete.machine', state.machineView, () => { state.machineView = !state.machineView; sync(); });
  const viewSwitches = el('div', { class: 'switch-row compete-view', attrs: { role: 'group' }, i18nAttr: 'aria-label:train.view.title' }, sensorsSwitch, machineSwitch);
  function toggleSensors() { state.showSensors = !state.showSensors; sync(); }

  // --- Panel: competidores -------------------------------------------------------------------------
  const listTitle = el('h2', { class: 'panel-heading', i18n: 'compete.list.title', attrs: { id: 'compete-list-title' } });
  const listCount = el('span', { class: 'compete-list-count muted' });
  const list = el('ul', { class: 'compete-list', attrs: { 'aria-labelledby': 'compete-list-title' } });
  const listSection = el('section', { class: 'compete-list-block' }, el('div', { class: 'compete-list-head' }, listTitle, listCount), list);
  const listRows = new Map(); // clave -> { row, box, badge, name, meta }

  function toggleCompetitor(key) {
    const c = candidateOf(key);
    if (!c || !c.available) return;
    if (!state.selection.toggle(key)) return;
    newRace();
  }

  function renderList() {
    const seen = new Set();
    for (const c of candidates) {
      seen.add(c.key);
      let r = listRows.get(c.key);
      if (!r) {
        const box = el('button', {
          class: 'compete-check', attrs: { type: 'button', role: 'checkbox', 'aria-checked': 'false' },
          dataset: { key: c.key },
          on: { click: () => toggleCompetitor(c.key) },
        });
        const badge = el('span', { class: 'compete-badge', attrs: { 'aria-hidden': 'true' } });
        const name = el('span', { class: 'compete-name' });
        const meta = el('span', { class: 'compete-meta' });
        box.append(el('span', { class: 'compete-box', attrs: { 'aria-hidden': 'true' } }), badge, name, meta);
        const row = el('li', { class: 'compete-item' }, box);
        r = { row, box, badge, name, meta };
        listRows.set(c.key, r);
      }
      const selected = state.selection.has(c.key);
      const slot = state.selection.slotOf(c.key);
      r.box.setAttribute('aria-checked', String(selected));
      r.row.dataset.selected = String(selected);
      const nm = nameOf(c);
      if (r.name.textContent !== nm) r.name.textContent = nm;
      const meta = [kindText(c), whereText(c)].filter(Boolean).join(' · ');
      if (r.meta.textContent !== meta) r.meta.textContent = meta;
      r.badge.textContent = selected ? String(slot) : '';
      r.badge.dataset.color = selected ? colorKey(c.key, slot) : '';
      // Disponibilidad y su motivo (D4), el máximo y el mínimo: deshabilitado, con su explicación.
      let why = null;
      if (!c.available) why = c.reason === 'programErrors' ? 'compete.check.programErrors' : 'compete.check.invalidBrain';
      else if (state.selection.whyNotSelect(c.key) === 'max') why = 'compete.check.max';
      else if (state.selection.whyNotUnselect(c.key) === 'min') why = 'compete.check.min';
      r.box.setAttribute('aria-disabled', String(Boolean(why)));
      r.box.dataset.help = why ?? (c.kind === 'example' ? 'compete.check.example' : `compete.check.${c.kind}`);
      const label = `${nm}. ${meta}${selected ? `. ${t('compete.check.number', { value: slot })}` : ''}`;
      if (r.box.getAttribute('aria-label') !== label) r.box.setAttribute('aria-label', label);
    }
    // Orden de la lista: el de los candidatos; se quitan los que ya no están.
    for (const [key, r] of listRows) if (!seen.has(key)) { r.row.remove(); listRows.delete(key); }
    candidates.forEach((c, i) => {
      const row = listRows.get(c.key).row;
      if (list.children[i] !== row) list.insertBefore(row, list.children[i] ?? null);
    });
    setText(listCount, 'compete.list.count', { value: state.selection.size, max: MAX_COMPETITORS });
  }

  // --- Panel: misiones y borrar resultados -------------------------------------------------------
  const missionRows = state.missions.missions.map((m) => {
    const status = el('span', { class: 'mission-status' });
    const fill = el('span', { class: 'mission-fill' });
    const row = el('li', { class: 'mission' },
      el('span', { class: 'mission-name', i18n: `compete.mission.${m.id}`, params: { goal: m.goal } }),
      status,
      el('span', { class: 'mission-bar', attrs: { 'aria-hidden': 'true' } }, fill));
    return { id: m.id, row, status, fill };
  });
  const missions = el('section', { class: 'guide compete-missions' },
    el('h2', { class: 'panel-heading', i18n: 'compete.missions.title' }),
    el('ol', { class: 'mission-list' }, missionRows.map((r) => r.row)));
  const clearButton = button('compete.clear', 'compete.clear', () => { results.clear(); renderTable(); }, 'tool small compete-clear');

  panel.append(el('h1', { class: 'sr-only', i18n: 'compete.title' }),
    el('div', { class: 'compete-panel' }, intro, runSection, trafficSection, penalty.row, viewSwitches, listSection, missions,
      el('div', { class: 'compete-foot' }, clearButton)));

  // --- Barra de escenario (D12): pista, tráfico y velocidad; sin sensores ---------------------
  const scenario = scenarioBar({
    i18n, settings: { ...state.settings }, idPrefix: 'compete', omit: ['sensors'],
    help: (key) => `compete.bar.${key}`, trackHelp: 'compete.bar.track', noTrafficHelp: 'drive.noTraffic', resetHelp: 'compete.bar.reset',
    onChange: (key, value, { final }) => {
      if (!final) return;
      applyBar({ ...state.settings, [key]: value });
    },
    onReset: () => applyBar({ ...BAR_DEFAULTS }),
  });
  bar?.append(scenario.node);

  /** Un cambio de la barra empieza otra carrera (D12): la misma semilla con tráfico de práctica; una nueva si no. */
  function applyBar(next) {
    const n = normalizeStreet({ ...next });
    const target = { track: n.track, lanes: n.lanes, density: n.density, irregularity: n.irregularity, maxSpeed: n.maxSpeed };
    if (JSON.stringify(target) === JSON.stringify(state.settings)) { sync(); return; }
    if (target.maxSpeed !== state.settings.maxSpeed) store?.set({ carSpeed: target.maxSpeed });
    state.settings = target;
    newRace({ seed: state.traffic === 'practice' ? 'same' : 'next' });
  }

  // --- Tablero: indicadores, marcador y tabla por pista (D9) --------------------------------------
  const strip = statStrip([
    { id: 'time', labelKey: 'compete.stats.time' },
    { id: 'goal', labelKey: 'compete.stats.goal' },
    { id: 'leader', labelKey: 'compete.stats.leader' },
  ]);
  const announcer = el('p', { class: 'sr-only', attrs: { role: 'status', 'aria-live': 'polite' } });
  function announce(text) { announcer.textContent = text ?? ''; }

  const scoreCard = boardCard({
    id: 'compete-score', titleKey: 'compete.score.title', help: 'compete.score', open: state.cards.scoreboard, grow: 1,
    onToggle: (open) => { state.cards.scoreboard = open; },
  });
  const scoreHead = el('tr');
  const scoreBody = el('tbody');
  const scoreTable = el('table', { class: 'compete-score' },
    el('caption', { class: 'sr-only', i18n: 'compete.score.title' }), el('thead', {}, scoreHead), scoreBody);
  scoreCard.append(scoreTable);
  let scoreRows = []; // por índice de la carrera: { row, cells }

  const tableCard = boardCard({
    id: 'compete-table', titleKey: 'compete.table.title', help: 'compete.table', hintKey: 'compete.table.hint',
    open: state.cards.table, grow: 1,
    onToggle: (open) => { state.cards.table = open; },
  });
  const trackTable = el('table', { class: 'compete-tracks' });
  tableCard.append(trackTable);

  board.append(strip.node, announcer, scoreCard.node, tableCard.node);

  const th = (key, extra = {}) => el('th', { attrs: { scope: 'col' }, ...extra }, el('span', { i18n: key }));

  /** Arma de nuevo el marcador para la carrera nueva (una fila por competidor). */
  function rebuildScoreboard() {
    const circuit = state.race.world.track.closed;
    scoreTable.dataset.circuit = String(circuit);
    scoreHead.replaceChildren(
      th('compete.score.pos'), th('compete.score.name'), th('compete.score.done'), th('compete.score.crashes'),
      ...(circuit ? [th('compete.score.bestLap')] : []), th('compete.score.state'));
    i18n.translateTree(scoreHead);
    scoreBody.replaceChildren();
    scoreRows = state.raceKeys.map((key, i) => {
      const c = candidateOf(key);
      const slot = state.selection.slotOf(key) ?? i + 1;
      const pos = el('td', { class: 'num' });
      const badge = el('span', { class: 'compete-badge', dataset: { color: colorKey(key, slot) }, attrs: { 'aria-hidden': 'true' } }, String(slot));
      const nameText = el('span', { class: 'compete-score-name' });
      const follow = el('button', {
        class: 'link-button compete-follow', help: 'compete.follow', attrs: { type: 'button', 'aria-pressed': 'false' },
        dataset: { shortcuts: 'pass' },
        on: { click: () => { if (!followLocked()) { state.follow = key; sync(); } } },
      });
      const plain = el('span', { class: 'compete-score-plain' });
      const kind = el('span', { class: 'compete-score-kind muted' });
      const nameCell = el('th', { class: 'compete-score-who', attrs: { scope: 'row' } }, badge, follow, plain, kind);
      const done = el('td', { class: 'num' });
      const crashes = el('td', { class: 'num' });
      const best = circuit ? el('td', { class: 'num' }) : null;
      const status = el('td', { class: 'compete-state' });
      const row = el('tr', { dataset: { key } }, pos, nameCell, done, crashes, best, status);
      scoreBody.append(row);
      return { key, row, pos, follow, plain, nameText, kind, done, crashes, best, status, c };
    });
    renderTable();
  }

  /** ¿La cámara está atada a la persona? Mientras maneja (D5). */
  const followLocked = () => humanIn() && state.race.results[state.raceKeys.indexOf('human')].state === 'racing';

  let lastOrder = 0;
  function renderScoreboard(now) {
    const race = state.race;
    const circuit = race.world.track.closed;
    const locked = followLocked();
    const followed = focusIndex();
    scoreRows.forEach((r, i) => {
      const res = race.results[i];
      const nm = nameOf(candidateOf(r.key) ?? r.c);
      // El nombre es un botón para seguir al competidor, salvo mientras la persona maneja.
      r.follow.hidden = locked;
      r.plain.hidden = !locked;
      if (r.follow.textContent !== nm) r.follow.textContent = nm;
      if (r.plain.textContent !== nm) r.plain.textContent = nm;
      r.follow.setAttribute('aria-pressed', String(followed === i));
      r.row.dataset.followed = String(followed === i);
      const kind = ` · ${kindText(candidateOf(r.key) ?? r.c)}`;
      if (r.kind.textContent !== kind) r.kind.textContent = kind;
      if (res.state === 'arrived') setText(r.done, 'compete.value.time', { value: formatFixed(res.time, 1, i18n.language) });
      else if (circuit) setText(r.done, 'drive.value.laps', { value: formatFixed(lapsShown(res.progress, race.world.track.length), 1, i18n.language) });
      else setText(r.done, 'compete.value.meters', { value: Math.floor(res.progress) });
      setText(r.crashes, 'train.value.count', { value: res.crashes });
      if (r.best) {
        if (res.bestLap === null) setText(r.best, 'compete.value.none');
        else setText(r.best, 'compete.value.time', { value: formatFixed(res.bestLap, 1, i18n.language) });
      }
      setText(r.status, `compete.state.${res.state}`);
      r.row.dataset.state = res.state;
    });
    // Orden: como mucho dos veces por segundo, moviendo las filas sin recrearlas y sin mover la que tiene el foco.
    if (now - lastOrder < REORDER_MS && lastOrder !== 0) return;
    lastOrder = now;
    const order = race.standings;
    order.forEach((i, p) => setText(scoreRows[i].pos, 'train.value.count', { value: p + 1 }));
    const desired = order.map((i) => scoreRows[i].row);
    const active = document.activeElement;
    const pinned = desired.find((row) => row.contains(active));
    if (!pinned) {
      desired.forEach((row, p) => { if (scoreBody.children[p] !== row) scoreBody.insertBefore(row, scoreBody.children[p] ?? null); });
      return;
    }
    const at = desired.indexOf(pinned);
    for (let p = 0; p < at; p++) if (desired[p].nextSibling !== (desired[p + 1] ?? null) || desired[p].parentNode !== scoreBody) scoreBody.insertBefore(desired[p], pinned);
    let prev = pinned;
    for (let p = at + 1; p < desired.length; p++) {
      if (prev.nextSibling !== desired[p]) scoreBody.insertBefore(desired[p], prev.nextSibling);
      prev = desired[p];
    }
  }

  /** Tabla por pista (D9): una fila por competidor marcado, una columna por pista. */
  function renderTable() {
    const current = { ...state.settings, crashPenalty: state.crashPenalty };
    const head = el('tr', {}, el('th', { attrs: { scope: 'col' } }, el('span', { i18n: 'compete.table.who' })),
      ...TRACK_IDS.map((id) => el('th', { attrs: { scope: 'col' }, dataset: { track: id } },
        el('span', { i18n: `track.short.${id}`, attrs: { 'aria-hidden': 'true' } }),
        el('span', { class: 'sr-only', i18n: `track.${id}` }))));
    const rows = state.selection.keys.map((key) => {
      const c = candidateOf(key);
      if (!c) return null;
      const slot = state.selection.slotOf(key);
      const cells = TRACK_IDS.map((track) => {
        const got = results.cell(key, c.signature, track, current);
        const td = el('td', { class: 'compete-cell', dataset: { track } });
        const markKind = markFor(c.brain ?? null, track);
        if (got.length === 0) {
          td.append(el('span', { class: 'compete-dash', attrs: { 'aria-hidden': 'true' } }, '–'), el('span', { class: 'sr-only', i18n: 'compete.cell.none' }));
        }
        for (const g of got) {
          const line = el('div', { class: 'compete-result', dataset: { other: String(g.other) } });
          const res = g.result;

          const main = res.arrived
            ? t('compete.value.time', { value: formatFixed(res.time, 1, i18n.language) })
            : t('compete.cell.unfinished', { value: Math.round(res.share * 100) });
          const crashes = res.crashes === 0 ? t('compete.cell.crashes.zero') : t('compete.cell.crashes', { value: res.crashes });
          // En la calle recta, el tráfico con que se corrió va en su propio renglón, adelante (D9).
          if (g.traffic) line.append(el('span', { class: 'compete-result-traffic' }, t(`compete.cell.traffic.${g.traffic}`)));
          line.append(el('span', { class: 'compete-result-main' }, main), el('span', { class: 'compete-result-crashes' }, crashes));
          if (g.other) line.append(el('span', { class: 'compete-other', i18n: 'compete.cell.other' }));
          td.append(line);
        }
        if (markKind) {
          td.append(el('span', {
            class: 'compete-mark', help: `compete.mark.${markKind}`, dataset: { mark: markKind },
            attrs: { tabindex: '0' },
          }, el('span', { i18n: `compete.mark.${markKind}`, attrs: { 'aria-hidden': 'true' } }), el('span', { class: 'sr-only', i18n: `compete.mark.${markKind}.full` })));
        }
        return td;
      });
      return el('tr', {}, el('th', { attrs: { scope: 'row' }, class: 'compete-table-who' },
        el('span', { class: 'compete-badge', dataset: { color: colorKey(key, slot) }, attrs: { 'aria-hidden': 'true' } }, String(slot)),
        el('span', { class: 'compete-table-name' }, nameOf(c))), ...cells);
    }).filter(Boolean);
    trackTable.replaceChildren(el('caption', { class: 'sr-only', i18n: 'compete.table.title' }), el('thead', {}, head), el('tbody', {}, rows));
    i18n.translateTree(trackTable);
  }

  // --- Escenario: cartel para largar y cuenta de la espera (D5 y D11) -----------------------------
  const startText = el('p', { class: 'start-card-text' });
  const startButton = el('button', { class: 'tool primary start-card-button', i18n: 'compete.start.button', help: 'compete.start.button', attrs: { type: 'button' }, on: { click: () => start() } });
  const startKey = el('p', { class: 'start-card-key muted', i18n: 'compete.start.key' });
  const startCard = el('div', { class: 'start-card', attrs: { role: 'group' }, i18nAttr: 'aria-label:compete.start.label' }, startText, startButton, startKey);
  const startLayer = el('div', { class: 'start-layer' }, startCard);
  stage.append(startLayer);
  const waitBadge = el('div', { class: 'stage-badge wait-badge' });
  const pauseBadge = el('div', { class: 'stage-badge pause-badge', i18n: 'train.paused', attrs: { role: 'status' } });
  const machineBadge = el('div', { class: 'stage-badge machine-badge', i18n: 'drive.machine.badge' });
  view.corner.append(el('div', { class: 'stage-badges' }, waitBadge, pauseBadge, machineBadge));

  /** Índice del auto que sigue la cámara (D5 y D11). */
  function focusIndex() {
    const race = state.race;
    const human = state.raceKeys.indexOf('human');
    if (state.follow !== null) {
      const i = state.raceKeys.indexOf(state.follow);
      if (i >= 0 && !followLocked()) return i;
    }
    if (human >= 0) return human; // con "Vos", su auto: manejando siempre; después, hasta que elija a otro
    const racing = race.standings.filter((i) => race.results[i].state === 'racing');
    return racing.length > 0 ? racing[0] : race.standings[0];
  }

  /** Aspecto de cada competidor en el escenario (D11). */
  function looks() {
    const race = state.race;
    return state.raceKeys.map((key, i) => {
      const r = race.results[i];
      const slot = state.selection.slotOf(key) ?? i + 1;
      let s = 'racing';
      if (r.state !== 'racing') s = 'done';
      else if (r.penalized) s = 'penalized';
      else if (race.isProtected(i)) s = 'protected';
      return { color: colorKey(key, slot), number: slot, state: s };
    });
  }

  // --- Sincronizar ----------------------------------------------------------------------------------
  function sync(now = performance.now()) {
    const race = state.race;
    const phase = state.phase;
    const action = mainAction(phase);
    setText(mainButton, `compete.main.${action}`);
    mainButton.dataset.help = `compete.main.${action}`;
    mainButton.setAttribute('aria-pressed', String(phase === 'paused'));
    // Sin "Vos", las velocidades de simulación; con "Vos", se corre en tiempo real y no se muestran.
    speeds.row.hidden = humanIn();
    speeds.select(state.speed);
    loop.setSpeed(humanIn() ? 1 : state.speed);
    // Tráfico de la carrera: solo en la calle recta (D10).
    trafficSection.hidden = onCircuit();
    trafficChoice.select(state.traffic);
    const street = { lanes: state.settings.lanes, density: state.settings.density, irregularity: state.settings.irregularity };
    const anyPracticed = state.selection.keys.some((k) => { const c = candidateOf(k); return c?.brain && practicedTraffic(c.brain, street); });
    nobodyPracticed.hidden = state.traffic !== 'practice' || anyPracticed;
    if (document.activeElement !== penalty.input) {
      if (Number(penalty.input.value) !== state.crashPenalty) penalty.input.value = String(state.crashPenalty);
      showPenalty(state.crashPenalty);
    }
    sensorsSwitch.setAttribute('aria-checked', String(state.showSensors));
    machineSwitch.setAttribute('aria-checked', String(state.machineView));
    machineBadge.hidden = !state.machineView;
    pauseBadge.hidden = phase !== 'paused';

    // Misiones
    for (const m of state.missions.missions) {
      const r = missionRows.find((x) => x.id === m.id);
      r.row.dataset.done = String(m.done);
      if (m.done) setText(r.status, 'train.mission.done');
      else if (m.unit === 'none') setText(r.status, 'train.mission.pending');
      else setText(r.status, 'compete.mission.progress', { value: m.progress, goal: m.goal });
      const width = `${Math.round((m.done ? 1 : m.progress / m.goal) * 100)}%`;
      if (r.fill.style.width !== width) r.fill.style.width = width;
    }

    // Indicadores
    const time = formatFixed(Math.floor(race.time), 0, i18n.language);
    if (race.waitLeft !== null && !race.finished) setText(strip.values.time, 'compete.stats.timeWait', { value: time, left: Math.ceil(race.waitLeft) });
    else setText(strip.values.time, 'compete.value.seconds', { value: time });
    const arrived = race.results.filter((r) => r.state === 'arrived').length;
    const g = RACE_GOALS[race.trackId];
    setText(strip.values.goal, g.kind === 'laps' ? (g.value === 1 ? 'compete.stats.goalLap' : 'compete.stats.goalLaps') : 'compete.stats.goalMeters',
      { value: g.value, arrived, total: race.results.length });
    let leaderName = null;
    if (phase === 'finished') {
      const w = winnerName();
      setText(strip.labels.leader, 'compete.stats.leader');
      if (w) setText(strip.values.leader, 'compete.stats.won', { name: w });
      else setText(strip.values.leader, 'compete.stats.nobody');
    } else {
      setText(strip.labels.leader, 'compete.stats.leader');
      leaderName = nameOf(candidateOf(state.raceKeys[race.standings[0]]));
      setText(strip.values.leader, 'compete.value.name', { name: leaderName });
    }

    // Llegó el primero: se anuncia una vez (D9).
    if (race.waitLeft !== null && !state.firstAnnounced && !race.finished) {
      state.firstAnnounced = true;
      const first = race.standings[0];
      announce(t('compete.announce.first', { name: nameOf(candidateOf(state.raceKeys[first])), value: RACE_WAIT_SECONDS }));
    }

    // Escenario: cartel para largar y cuenta de la espera.
    startLayer.hidden = phase !== 'waiting';
    if (phase === 'waiting') {
      setText(startText, 'compete.start.text', { goal: goalText(t, { kind: g.kind, value: g.value }) });
      startKey.hidden = !characterShortcutsOn();
    }
    const waiting = race.waitLeft !== null && !race.finished;
    waitBadge.hidden = !waiting;
    if (waiting) setText(waitBadge, 'compete.wait', { value: Math.ceil(race.waitLeft) });

    const focus = focusIndex();
    description.set(raceDescription({
      t, track: race.trackId, lanes: state.settings.lanes, goal: g, count: race.results.length,
      phase, leader: leaderName, winner: phase === 'finished' ? winnerName() : null,
      followed: nameOf(candidateOf(state.raceKeys[focus])), machineView: state.machineView,
    }));
    renderScoreboard(now);
    scenario.sync({ ...state.settings });
  }

  // --- Bucle ------------------------------------------------------------------------------------
  /** Un paso de la carrera en marcha; al terminar, anota y anuncia. */
  function stepRace() {
    if (state.phase !== 'running') return;
    state.race.step();
    if (state.race.finished) finishRace();
  }
  const loop = createLoop({
    step: stepRace,
    render: () => draw(),
    onError: reportError,
    speed: 1,
  });
  function draw() {
      const race = state.race;
      view.render(race.world, {
        showSensors: state.showSensors || state.machineView,
        machineView: state.machineView,
        focus: focusIndex(),
        competitors: looks(),
        goal: race.goal,
      });
      sync();
  }

  // --- Atajos y foco (D14) -----------------------------------------------------------------------
  let handledSpace = false;
  function onKeyDown(e) {
    const action = shortcutFor(e);
    if (!action) return;
    e.preventDefault();
    if (action === 'main') handledSpace = true;
    if (e.target !== stage && typeof e.target?.matches === 'function' && e.target.matches('button, input, summary, a')) focusStage();
    if (e.repeat) return;
    try {
      if (action === 'main') main();
      else if (action === 'restart') restart();
      else if (action === 'another') anotherRace();
    } catch (err) {
      reportError(err);
    }
  }
  function onKeyUp(e) {
    if (e.code === 'Space' && handledSpace) { handledSpace = false; e.preventDefault(); }
  }
  function onClick(e) {
    if (e.detail > 0 && returnsFocusToStage(e.target) && !e.target.closest?.('.compete-list, .compete-score')) focusStage();
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  panel.addEventListener('click', onClick);
  stage.addEventListener('click', onClick);
  bar?.addEventListener('click', onClick);
  const offLanguage = i18n.onChange(() => { renderList(); renderTable(); sync(); });
  const offLibrary = library ? library.subscribe(() => { refreshCandidates(); renderList(); renderTable(); sync(); }) : () => {};

  // --- Montaje ---------------------------------------------------------------------------------
  const removed = refreshCandidates();
  // Una carrera nueva al abrir la primera vez, o si cambió algo de lo que corre (un cerebro
  // eliminado o actualizado, el programa cambiado, la velocidad de otra pestaña).
  const changed = state.race && state.raceKeys.some((k, i) => candidateOf(k)?.signature !== state.raceSignatures[i]);
  renderList();
  if (!state.race || removed.length > 0 || changed || speedChanged) newRace();
  else {
    if (state.phase === 'running') state.phase = 'paused'; // la carrera quedó en pausa al salir (D13)
    rebuildScoreboard();
    sync();
  }
  loop.start();
  focusStage();

  return {
    view, loop,
    /** Dibuja un cuadro ya (para la verificación desde la consola, con el navegador en segundo plano). */
    draw,
    /** Avanza `seconds` de carrera como lo haría el bucle y dibuja (verificación desde la consola). */
    advance(seconds) { for (let k = 0; k < Math.round(seconds * 60); k++) stepRace(); draw(); },
    get race() { return state.race; },
    get phase() { return state.phase; },
    get state() { return state; },
    start, togglePause, restart, anotherRace, main, toggleCompetitor,
    unmount() {
      if (state.phase === 'running') state.phase = 'paused';
      loop.dispose();
      keyboard.dispose();
      offLanguage();
      offLibrary();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      panel.removeEventListener('click', onClick);
      stage.removeEventListener('click', onClick);
      bar?.removeEventListener('click', onClick);
      scenario.dispose();
      description.dispose();
      startLayer.remove();
      view.dispose();
    },
  };
}
