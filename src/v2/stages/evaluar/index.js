// Etapa 4 de la V2, "Evaluar" (tareas 13.1 y 13.2; #mentor de la maqueta D). Una carrera entre cerebros,
// el programa de Reglas a mano, los ejemplos y la persona, en pistas que vieron o no. La escena lleva la
// placa con la marcha; la banda, el marcador y la tabla por pista con "practicó" y "no la vio"; el cuaderno,
// las hojas Carrera, Competidores y Escenario.
//
// La conducta sale de la lógica pura de la V1: core/race.js y tabs/compete/ (competitors, marks, results,
// missions, seeds, countdown y shortcuts). El selector para agregar es una copia para la V2
// (components/picker.js). Cambio de la V2 (KD11): "Largar" es un solo botón, en la placa, y solo antes de
// la carrera; la escena no repite un cartel con otro botón para largar.
import { createRace, RACE_GOALS, GOAL_LIMITS, goalValueOf, CRASH_PENALTY_LIMITS, RACE_CRASH_PENALTY, crashPenaltyOf, RACE_WAIT_SECONDS } from '../../../core/race.js';
import { TRACK_IDS, isCircuit } from '../../../core/circuits.js';
import { practicedTracks } from '../../../core/brain.js';
import { createKeyboardController } from '../../../input/keyboard.js';
import { createStageView } from '../../../render/view.js';
import { createLoop, SPEEDS } from '../../../ui/loop.js';
import { formatFixed } from '../../../ui/i18n.js';
import { currentMission } from '../../../ui/current-mission.js';
import { lapsShown } from '../../../tabs/shared/street-settings.js';
import { raceDescription, goalText } from '../../../tabs/shared/stage-text.js';
import { EXAMPLE_BRAINS } from '../../../data/example-brains.js';
import { listCandidates, buildCompetitor, createSelection, pickerGroups, MAX_COMPETITORS } from '../../../tabs/compete/competitors.js';
import { markFor, practicedTraffic } from '../../../tabs/compete/marks.js';
import { createResults, STREET_TRAFFICS } from '../../../tabs/compete/results.js';
import { createCompeteMissions } from '../../../tabs/compete/missions.js';
import { createSeedSeries, seedFor } from '../../../tabs/compete/seeds.js';
import { shortcutFor, mainAction } from '../../../tabs/compete/shortcuts.js';
import { createCountdown, COUNTDOWN_FROM } from '../../../tabs/compete/countdown.js';
import { el, tr, setAttr } from '../../dom.js';
import { button, toggle, slider, segments, group, missionNote } from '../../components/controls.js';
import { mountScenarioSheet } from '../../components/scenario-sheet.js';
import { createPicker } from '../../components/picker.js';

const STAGE = 'evaluar';
const REORDER_MS = 500;
/** Qué muestra "Mostrame" en cada misión (la tabla de la V1, ui/mission-targets.js). */
const REVEAL = { tracks: 'track', unseen: 'track', beatBrain: 'run' };
const defaultGoals = () => Object.fromEntries(Object.entries(RACE_GOALS).map(([id, g]) => [id, g.value]));
const colorKey = (key, slot) => (key === 'human' ? 'car' : `competitor${slot}`);

const results = createResults();
const seeds = createSeedSeries();
const completedMissions = new Set();
const missionTracks = new Set();

export function mount({ zones, notebook, i18n, scenario, scenery = null, library = null, prefs }) {
  const { scene, plate, band, zone } = zones;
  const doc = scene.ownerDocument;
  const win = doc.defaultView;
  const t = (k, p) => i18n.t(k, p);
  let visible = false;
  const sc = () => scenario.forStage(STAGE);
  const state = {
    settings: { ...sc() }, traffic: 'new', newSeed: seeds.first, crashPenalty: RACE_CRASH_PENALTY, goals: defaultGoals(),
    selection: createSelection(), speed: 1, machineView: false, follow: null, race: null, phase: 'waiting', raceKeys: [],
    sensorsOn: new Set(), missions: createCompeteMissions({ completed: completedMissions, tracks: missionTracks }),
  };
  const keyboard = createKeyboardController({ accepts: () => visible });

  // --- Candidatos y competidores -------------------------------------------------------------------
  let candidates = [];
  const candidateOf = (key) => candidates.find((c) => c.key === key) ?? null;
  function refreshCandidates() {
    candidates = listCandidates({ library: library ? library.list() : [], examples: EXAMPLE_BRAINS, remembered: { program: prefs.rulesProgram ?? null, sensors: prefs.rulesSensors ?? null }, t });
    results.prune(candidates.map((c) => ({ key: c.key, signature: c.signature })));
    return state.selection.prune(candidates.filter((c) => c.available).map((c) => c.key));
  }
  function nameOf(c) {
    if (!c) return '';
    if (c.kind === 'human') return t('compete.human');
    if (c.key === 'program') return t('compete.program.own');
    return c.nameKey ? t(c.nameKey) : c.name;
  }
  const kindText = (c) => t(`compete.kind.${c.kind === 'example' ? 'brain' : c.kind}`);
  function whereText(c) {
    if (!c.brain) return '';
    const ids = practicedTracks(c.brain);
    const ordered = TRACK_IDS.filter((id) => ids.includes(id));
    if (ordered.length === 0) return t('compete.where.none');
    if (ordered.length === TRACK_IDS.length) return t('compete.where.all');
    return ordered.map((id) => t(`track.short.${id}`)).join(' + ');
  }
  const onCircuit = () => isCircuit(state.settings.track);
  const humanIn = () => state.raceKeys.includes('human');

  // --- Escena y placa -----------------------------------------------------------------------------
  zone.classList.add('v2-zone-race');
  const view = createStageView({ container: scene, store: scenery, doc });
  scene.setAttribute('tabindex', '-1');
  const description = el('p', { class: 'v2-sr-only', attrs: { id: 'v2-evaluar-description', 'data-free-text': '' } });
  const announcer = el('p', { class: 'v2-sr-only', attrs: { role: 'status', 'aria-live': 'polite', 'data-free-text': '' } });
  scene.setAttribute('aria-describedby', description.id);
  scene.append(description, announcer);
  const announce = (text) => { announcer.textContent = text ?? ''; };
  const consigna = el('p', { class: 'v2-consigna', i18n: 'consigna.compete' });
  const startNote = el('p', { class: 'v2-muted v2-race-start-note' });
  const mainButton = button({ level: 'primary', labelKey: 'evaluar.main.start', help: 'compete.main.start', keyKey: 'key.space', onClick: () => main(), attrs: { 'data-v1': 'compete.main.start compete.start.button' } });
  const restartButton = button({ labelKey: 'compete.restart', help: 'compete.restart', key: 'R', onClick: () => newRace(), attrs: { 'data-v1': 'compete.restart' } });
  const anotherButton = button({ labelKey: 'compete.another', help: 'compete.another', key: 'N', onClick: () => anotherRace(), attrs: { 'data-v1': 'compete.another' } });
  plate.append(consigna, startNote, el('div', { class: 'v2-actions' }, mainButton, restartButton, anotherButton));
  const waitBadge = el('div', { class: 'v2-badge v2-badge-quiet', attrs: { hidden: true } });
  const pauseBadge = el('div', { class: 'v2-badge', i18n: 'train.paused', attrs: { role: 'status' } });
  const machineBadge = el('div', { class: 'v2-badge v2-badge-machine', i18n: 'drive.machine.badge' });
  view.corner.append(waitBadge, pauseBadge, machineBadge);
  const countNumber = el('div', { class: 'v2-countdown-number', attrs: { 'data-free-text': '' } });
  const countLayer = el('div', { class: 'v2-countdown', attrs: { 'aria-hidden': 'true', hidden: true } }, countNumber);
  scene.append(countLayer);

  // --- Banda: indicadores, marcador y tabla por pista ---------------------------------------------------
  const figTime = el('b', { attrs: { 'data-free-text': '' } });
  const figGoal = el('b', { attrs: { 'data-free-text': '' } });
  const figLeader = el('b', { attrs: { 'data-free-text': '' } });
  const figLeaderLabel = el('span', { i18n: 'compete.stats.leader' });
  const figures = el('div', { class: 'v2-figures v2-race-figures' },
    el('div', {}, figTime, el('span', { i18n: 'compete.stats.time' })), el('div', {}, figGoal, el('span', { i18n: 'compete.stats.goal' })), el('div', {}, figLeader, figLeaderLabel));
  const scoreHead = el('tr');
  const scoreBody = el('tbody');
  const scoreTable = el('table', { class: 'v2-score' }, el('caption', { class: 'v2-sr-only', i18n: 'compete.score.title' }), el('thead', {}, scoreHead), scoreBody);
  const scoreBox = el('section', { class: 'v2-race-score', help: 'compete.score', attrs: { 'data-v1': 'compete.score' } },
    el('div', { class: 'v2-race-head' }, el('p', { class: 'v2-role', i18n: 'compete.score.title' }), figures), scoreTable);
  const trackTable = el('table', { class: 'v2-tracks' });
  const clearButton = button({ level: 'tertiary', labelKey: 'compete.clear', help: 'compete.clear', onClick: () => { results.clear(); renderTable(); }, attrs: { 'data-v1': 'compete.clear' } });
  const tableBox = el('section', { class: 'v2-race-table', help: 'compete.table', attrs: { 'data-v1': 'compete.table' } },
    el('div', { class: 'v2-race-head' }, el('p', { class: 'v2-role', i18n: 'compete.table.title' }), clearButton), trackTable,
    el('p', { class: 'v2-muted v2-guide-only v2-race-hint', i18n: 'compete.table.hint' }));
  band.append(scoreBox, tableBox);

  // --- Carrera ------------------------------------------------------------------------------------------
  const countdown = createCountdown();
  const clock = () => win.performance.now() / 1000;
  let lastOrder = 0;
  let scoreRows = [];
  function newRace({ seed = 'same' } = {}) {
    if (seed === 'next' && !onCircuit() && state.traffic === 'new') state.newSeed = seeds.next();
    const keys = state.selection.keys;
    const competitors = keys.map((k) => buildCompetitor(candidateOf(k), { t, keyboard: () => keyboard }));
    const s = state.settings;
    const kind = RACE_GOALS[s.track].kind;
    state.race = createRace({
      goal: { [kind]: state.goals[s.track] }, track: s.track, seed: seedFor(onCircuit() ? 'new' : state.traffic, state.newSeed),
      lanes: s.lanes, density: s.density, irregularity: s.irregularity, maxSpeed: s.maxSpeed, crashPenalty: state.crashPenalty, competitors,
    });
    state.raceKeys = keys;
    state.raceSignatures = keys.map((k) => candidateOf(k).signature);
    state.raceTraffic = state.traffic;
    state.raceSettings = { lanes: s.lanes, density: s.density, irregularity: s.irregularity, maxSpeed: s.maxSpeed, crashPenalty: state.crashPenalty, goal: state.goals[s.track] };
    state.phase = keys.includes('human') ? 'waiting' : 'running';
    state.follow = null;
    state.firstAnnounced = false;
    countdown.cancel();
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
    scene.focus({ preventScroll: true });
    if (humanIn()) { state.phase = 'counting'; countdown.start(clock()); announce(t('compete.countdown.announce', { value: COUNTDOWN_FROM })); } else state.phase = 'running';
    sync();
  }
  function tickCountdown() { if (state.phase === 'counting' && countdown.at(clock()).state !== 'counting') state.phase = 'running'; }
  function togglePause() {
    if (state.phase === 'running') state.phase = 'paused'; else if (state.phase === 'paused') state.phase = 'running';
    sync();
  }
  function main() {
    const action = mainAction(state.phase);
    if (action === 'counting') return;
    if (action === 'start') start(); else if (action === 'another') anotherRace(); else togglePause();
  }
  const anotherRace = () => newRace({ seed: 'next' });
  function finishRace() {
    const race = state.race;
    state.phase = 'finished';
    const entries = race.results.map((r, i) => ({ key: state.raceKeys[i], signature: state.raceSignatures[i], result: { arrived: r.state === 'arrived', time: r.time, share: r.share, crashes: r.crashes } }));
    results.record({ track: race.trackId, traffic: state.raceTraffic, settings: state.raceSettings, entries });
    state.missions.raceEnded({
      track: race.trackId,
      entries: entries.map((e, i) => { const c = candidateOf(e.key); return { key: e.key, kind: c?.kind ?? 'brain', brain: c?.brain ?? null, result: { ...e.result, state: race.results[i].state } }; }),
      standings: race.standings,
    });
    const w = winnerName();
    announce(w ? t('compete.announce.won', { name: w }) : t('compete.announce.nobody'));
    renderTable();
  }
  function winnerName() {
    const first = state.race.standings[0];
    return state.race.results[first]?.state === 'arrived' ? nameOf(candidateOf(state.raceKeys[first])) : null;
  }
  // Un cambio del escenario compartido empieza otra carrera: la misma semilla con tráfico de práctica.
  const offScenario = scenario.subscribe(() => {
    const n = sc();
    if (JSON.stringify(n) === JSON.stringify(state.settings)) return;
    state.settings = { ...n };
    newRace({ seed: state.traffic === 'practice' ? 'same' : 'next' });
  });

  // --- Hoja Carrera: misión, meta, tráfico, penalización, velocidad y ver como la máquina ------------------
  const s1 = notebook.sheet('etapa', 'evaluar.sheet.race');
  const mission = missionNote({ i18n, onReveal: () => revealMission() });
  mission.element.dataset.v1 = 'mission.reveal';
  const missionReveal = mission.element.querySelector('.v2-tertiary');
  const moreBody = el('div', { class: 'v2-more-body', attrs: { hidden: true, id: 'v2-evaluar-more' } }, el('p', { i18n: 'compete.guide' }));
  const moreButton = el('button', { class: 'v2-more', help: 'stage.more', attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': moreBody.id, 'data-v1': 'guide.more' },
    on: { click: () => { const open = moreBody.hidden; moreBody.hidden = !open; moreButton.setAttribute('aria-expanded', String(open)); } } }, el('span', { i18n: 'stage.more' }));
  const goalKind = () => RACE_GOALS[state.settings.track].kind;
  const goal = slider({ labelKey: 'bar.goal.meters', help: 'compete.bar.goal', min: 100, max: 1000, step: 100, value: 100, format: (v) => t(`compete.goal.short.${goalKind()}`, { value: v }), onInput: () => {} });
  goal.element.dataset.v1 = 'compete.bar.goal';
  goal.input.addEventListener('change', () => setGoal(Number(goal.input.value)));
  function setGoal(v) {
    const value = goalValueOf(goalKind(), v);
    if (value === state.goals[state.settings.track]) return;
    state.goals = { ...state.goals, [state.settings.track]: value };
    newRace();
  }
  const traffic = segments({
    labelKey: 'compete.traffic', help: 'compete.traffic', value: state.traffic, wide: true,
    options: STREET_TRAFFICS.map((v) => ({ value: v, labelKey: `compete.traffic.${v}`, dataset: { v1: `compete.traffic.${v}` } })),
    onChange: (v) => { if (v === state.traffic) return; state.traffic = v; newRace({ seed: v === 'new' ? 'next' : 'same' }); },
  });
  traffic.element.dataset.v1 = 'compete.traffic';
  const nobodyPracticed = el('p', { class: 'v2-notice', attrs: { role: 'status', hidden: true }, i18n: 'compete.traffic.nobody' });
  const penalty = slider({ labelKey: 'compete.penalty', help: 'compete.penalty', min: CRASH_PENALTY_LIMITS.min, max: CRASH_PENALTY_LIMITS.max, step: CRASH_PENALTY_LIMITS.step, value: state.crashPenalty,
    format: (v) => t('compete.penalty.value', { value: formatFixed(v, 1, i18n.language) }), onInput: () => {} });
  penalty.element.dataset.v1 = 'compete.penalty';
  penalty.input.addEventListener('change', () => { const next = crashPenaltyOf(Number(penalty.input.value)); if (next !== state.crashPenalty) { state.crashPenalty = next; newRace(); } });
  const speeds = segments({
    labelKey: 'train.speed', help: 'compete.speed', value: state.speed,
    options: SPEEDS.map((s) => (s === 'max' ? { value: s, labelKey: 'compete.speed.maxShort', dataset: { v1: 'compete.speed.max' } } : { value: s, text: `${s}×` })),
    onChange: (v) => { state.speed = v; loop.setSpeed(v); sync(); },
  });
  speeds.element.dataset.v1 = 'compete.speed';
  const machineSwitch = toggle({ labelKey: 'drive.machine', help: 'compete.machine', value: false, dataset: { v1: 'compete.machine' }, onChange: (v) => { state.machineView = v; sync(); } });
  const runGroup = group({ titleKey: 'train.v2.runGroup' }, speeds.element, el('div', { class: 'v2-row v2-row-start' }, machineSwitch.element));
  s1.append(mission.element, el('div', { class: 'v2-guide-only' }, moreButton, moreBody),
    group({ titleKey: 'level.try' }, goal.element, traffic.element, nobodyPracticed, penalty.element),
    runGroup);

  // --- Hoja Competidores: la lista de los que corren y "Agregar" ----------------------------------------
  const s2 = notebook.sheet('competidores', 'evaluar.sheet.competitors');
  const listCount = el('span', { class: 'v2-muted', attrs: { 'data-free-text': '' } });
  const addButton = button({ level: 'small', labelKey: 'compete.add', help: 'compete.add', onClick: () => picker.toggle(), attrs: { 'aria-haspopup': 'dialog', 'aria-expanded': 'false', 'aria-controls': 'v2-compete-picker', 'data-v1': 'compete.add' } });
  const list = el('ul', { class: 'v2-race-list', attrs: { 'aria-labelledby': 'v2-race-list-title' } });
  const listRows = new Map();
  s2.append(group({},
    el('div', { class: 'v2-row' }, el('h3', { attrs: { id: 'v2-race-list-title' } }, el('span', { i18n: 'compete.list.title' }), ' ', listCount), addButton), list));
  function toggleCompetitor(key) {
    const c = candidateOf(key);
    if (!c || !c.available) return;
    if (!state.selection.toggle(key)) return;
    newRace();
  }
  function toggleSensorsOf(key) {
    if (key === 'human') return;
    if (state.sensorsOn.has(key)) state.sensorsOn.delete(key); else state.sensorsOn.add(key);
    renderList();
    sync();
  }
  function renderList() {
    const keys = state.selection.keys;
    for (const [key, r] of listRows) if (!keys.includes(key)) { r.row.remove(); listRows.delete(key); }
    const only = keys.length <= 1;
    keys.forEach((key, idx) => {
      const c = candidateOf(key);
      if (!c) return;
      let r = listRows.get(key);
      if (!r) {
        const badge = el('span', { class: 'v2-race-badge', attrs: { 'aria-hidden': 'true', 'data-free-text': '' } });
        const name = el('span', { class: 'v2-race-name', attrs: { 'data-free-text': '' } });
        const meta = el('span', { class: 'v2-muted v2-race-meta', attrs: { 'data-free-text': '' } });
        const eye = el('button', { class: 'v2-btn v2-small v2-race-icon', help: 'compete.sensorsOf', attrs: { type: 'button', 'aria-pressed': 'false', 'data-v1': 'compete.sensorsOf' }, on: { click: () => toggleSensorsOf(key) } }, el('span', { attrs: { 'aria-hidden': 'true' }, text: '👁' }));
        const remove = el('button', { class: 'v2-btn v2-small v2-race-icon', help: 'compete.remove', attrs: { type: 'button', 'data-v1': 'compete.remove' }, on: { click: () => toggleCompetitor(key) } }, el('span', { attrs: { 'aria-hidden': 'true' }, text: '✕' }));
        const row = el('li', { class: 'v2-race-item', dataset: { key } }, badge, el('span', { class: 'v2-race-who' }, name, meta), eye, remove);
        r = { row, badge, name, meta, eye, remove };
        listRows.set(key, r);
      }
      const slot = state.selection.slotOf(key);
      const nm = nameOf(c);
      if (r.name.textContent !== nm) r.name.textContent = nm;
      r.name.title = nm;
      const meta = [kindText(c), whereText(c)].filter(Boolean).join(' · ');
      if (r.meta.textContent !== meta) r.meta.textContent = meta;
      r.badge.textContent = String(slot);
      r.badge.dataset.color = colorKey(key, slot);
      r.eye.hidden = key === 'human';
      const on = state.sensorsOn.has(key);
      setAttr(r.eye, 'aria-pressed', String(on));
      setAttr(r.eye, 'aria-label', t(on ? 'compete.sensorsOf.on' : 'compete.sensorsOf.off', { name: nm }));
      r.remove.hidden = only;
      setAttr(r.remove, 'aria-label', t('compete.remove.label', { name: nm }));
      if (list.children[idx] !== r.row) list.insertBefore(r.row, list.children[idx] ?? null);
    });
    listCount.textContent = t('compete.list.count', { value: state.selection.size, max: MAX_COMPETITORS });
    const full = state.selection.size >= MAX_COMPETITORS;
    addButton.disabled = full;
    addButton.dataset.help = full ? 'compete.add.max' : 'compete.add';
    if (full && picker.isOpen) picker.close();
    if (picker.isOpen) picker.render();
  }
  const picker = createPicker({
    id: 'v2-compete-picker', anchor: addButton, t, doc,
    titleKey: 'compete.picker.title', doneKey: 'compete.picker.done', doneHelp: 'compete.picker.done', emptyKey: 'compete.picker.empty',
    canOpen: () => !addButton.disabled,
    groups: () => pickerGroups(candidates, state.selection).map((g) => ({
      id: g.id, title: t(`compete.picker.group.${g.id}`),
      items: g.items.map((c) => {
        const why = c.available ? null : (c.reason === 'programErrors' ? 'compete.check.programErrors' : 'compete.check.invalidBrain');
        return { key: c.key, name: nameOf(c), meta: [kindText(c), whereText(c)].filter(Boolean).join(' · '), help: why ?? (c.kind === 'example' ? 'compete.check.example' : `compete.check.${c.kind}`), disabled: Boolean(why) };
      }),
    })),
    onPick: (key) => { toggleCompetitor(key); if (state.selection.size >= MAX_COMPETITORS) picker.close(); },
  });

  // --- Hoja Escenario ------------------------------------------------------------------------------------------
  mountScenarioSheet({
    i18n, scenario, stage: STAGE, panel: notebook.sheet('escenario', 'scenario.sheet'),
    v1: { track: 'compete.bar.track', lanes: 'compete.bar.lanes', maxSpeed: 'compete.bar.maxSpeed', density: 'compete.bar.density', irregularity: 'compete.bar.irregularity', reset: 'compete.bar.reset' },
  });

  function revealMission() {
    const current = currentMission(state.missions.missions);
    const target = current && REVEAL[current.id];
    if (target === 'run') { mainButton.focus(); mainButton.classList.remove('v2-revealed'); void mainButton.offsetWidth; mainButton.classList.add('v2-revealed'); }
    else if (target === 'track') { notebook.select('escenario'); notebook.reveal(notebook.ids.includes('escenario') ? doc.querySelector('[data-stage=evaluar] .v2-sheet[data-sheet=escenario] [data-key="track"]') : mainButton); }
  }

  // --- Marcador y tabla ---------------------------------------------------------------------------------------
  const th = (key) => el('th', { attrs: { scope: 'col' } }, el('span', { i18n: key }));
  const followLocked = () => humanIn() && state.race.results[state.raceKeys.indexOf('human')].state === 'racing';
  function rebuildScoreboard() {
    const circuit = state.race.world.track.closed;
    scoreHead.replaceChildren(th('compete.score.pos'), th('compete.score.name'), th('compete.score.done'), th('compete.score.crashes'), ...(circuit ? [th('compete.score.bestLap')] : []), th('compete.score.state'));
    i18n.translateTree(scoreHead);
    scoreBody.replaceChildren();
    scoreRows = state.raceKeys.map((key, i) => {
      const c = candidateOf(key);
      const slot = state.selection.slotOf(key) ?? i + 1;
      const pos = el('td', { class: 'num', attrs: { 'data-free-text': '' } });
      const badge = el('span', { class: 'v2-race-badge', dataset: { color: colorKey(key, slot) }, attrs: { 'aria-hidden': 'true', 'data-free-text': '' } }, String(slot));
      const follow = el('button', { class: 'v2-race-follow', help: 'compete.follow', attrs: { type: 'button', 'aria-pressed': 'false', 'data-free-text': '', 'data-v1': 'compete.follow' }, on: { click: () => { if (!followLocked()) { state.follow = key; sync(); } } } });
      const plain = el('span', { attrs: { 'data-free-text': '' } });
      const nameCell = el('th', { class: 'v2-race-who', attrs: { scope: 'row' } }, badge, follow, plain);
      const done = el('td', { class: 'num', attrs: { 'data-free-text': '' } });
      const crashes = el('td', { class: 'num', attrs: { 'data-free-text': '' } });
      const best = circuit ? el('td', { class: 'num', attrs: { 'data-free-text': '' } }) : null;
      const status = el('td', {});
      const row = el('tr', { dataset: { key } }, pos, nameCell, done, crashes, best, status);
      scoreBody.append(row);
      return { key, row, pos, follow, plain, done, crashes, best, status, c };
    });
    renderTable();
  }
  function renderScoreboard(now) {
    const race = state.race;
    const circuit = race.world.track.closed;
    const locked = followLocked();
    const followed = focusIndex();
    scoreRows.forEach((r, i) => {
      const res = race.results[i];
      const nm = nameOf(candidateOf(r.key) ?? r.c);
      r.follow.hidden = locked;
      r.plain.hidden = !locked;
      if (r.follow.textContent !== nm) r.follow.textContent = nm;
      if (r.plain.textContent !== nm) r.plain.textContent = nm;
      setAttr(r.follow, 'aria-pressed', String(followed === i));
      r.row.dataset.followed = String(followed === i);
      const done = res.state === 'arrived' ? t('compete.value.time', { value: formatFixed(res.time, 1, i18n.language) })
        : circuit ? t('drive.value.laps', { value: formatFixed(lapsShown(res.progress, race.world.track.length), 1, i18n.language) }) : t('compete.value.meters', { value: Math.floor(res.progress) });
      if (r.done.textContent !== done) r.done.textContent = done;
      if (r.crashes.textContent !== String(res.crashes)) r.crashes.textContent = String(res.crashes);
      if (r.best) { const b = res.bestLap === null ? t('compete.value.none') : t('compete.value.time', { value: formatFixed(res.bestLap, 1, i18n.language) }); if (r.best.textContent !== b) r.best.textContent = b; }
      tr(r.status, i18n, `compete.state.${res.state}`);
      r.row.dataset.state = res.state;
    });
    if (now - lastOrder < REORDER_MS && lastOrder !== 0) return;
    lastOrder = now;
    race.standings.forEach((i, p) => { if (scoreRows[i].pos.textContent !== String(p + 1)) scoreRows[i].pos.textContent = String(p + 1); });
    const desired = race.standings.map((i) => scoreRows[i].row);
    if (desired.some((row) => row.contains(doc.activeElement))) return;
    desired.forEach((row, p) => { if (scoreBody.children[p] !== row) scoreBody.insertBefore(row, scoreBody.children[p] ?? null); });
  }
  function renderTable() {
    const current = { ...state.settings, crashPenalty: state.crashPenalty, goal: state.goals[state.settings.track] };
    const goalOf = (track) => ({ ...current, goal: state.goals[track] });
    const head = el('tr', {}, el('th', { attrs: { scope: 'col' } }, el('span', { i18n: 'compete.table.who' })),
      ...TRACK_IDS.map((id) => el('th', { attrs: { scope: 'col' }, dataset: { track: id } }, el('span', { i18n: `track.short.${id}`, attrs: { 'aria-hidden': 'true' } }), el('span', { class: 'v2-sr-only', i18n: `track.${id}` }))));
    const rows = state.selection.keys.map((key) => {
      const c = candidateOf(key);
      if (!c) return null;
      const slot = state.selection.slotOf(key);
      const cells = TRACK_IDS.map((track) => {
        const got = results.cell(key, c.signature, track, goalOf(track));
        const td = el('td', { class: 'v2-tracks-cell', dataset: { track } });
        if (got.length === 0) td.append(el('span', { attrs: { 'aria-hidden': 'true' }, text: '–' }), el('span', { class: 'v2-sr-only', i18n: 'compete.cell.none' }));
        for (const g of got) {
          const res = g.result;
          const line = el('div', { class: 'v2-tracks-result', attrs: { 'data-free-text': '' }, dataset: { other: String(g.other) } });
          if (g.traffic) line.append(el('span', { class: 'v2-muted', text: t(`compete.cell.traffic.${g.traffic}`) }), ' ');
          line.append(el('b', { text: res.arrived ? t('compete.value.time', { value: formatFixed(res.time, 1, i18n.language) }) : t('compete.cell.unfinished', { value: Math.round(res.share * 100) }) }), ' ',
            el('span', { class: 'v2-muted', text: res.crashes === 0 ? t('compete.cell.crashes.zero') : t('compete.cell.crashes', { value: res.crashes }) }));
          if (g.other) line.append(' ', el('span', { class: 'v2-muted', i18n: 'compete.cell.other' }));
          td.append(line);
        }
        const markKind = markFor(c.brain ?? null, track);
        if (markKind) td.append(el('span', { class: 'v2-tracks-mark', help: `compete.mark.${markKind}`, dataset: { mark: markKind, v1: `compete.mark.${markKind}` }, attrs: { tabindex: '0' } },
          el('span', { i18n: `compete.mark.${markKind}`, attrs: { 'aria-hidden': 'true' } }), el('span', { class: 'v2-sr-only', i18n: `compete.mark.${markKind}.full` })));
        return td;
      });
      return el('tr', {}, el('th', { attrs: { scope: 'row' }, class: 'v2-race-who' },
        el('span', { class: 'v2-race-badge', dataset: { color: colorKey(key, slot) }, attrs: { 'aria-hidden': 'true', 'data-free-text': '' } }, String(slot)),
        el('span', { class: 'v2-tracks-name', attrs: { title: nameOf(c), 'data-free-text': '' } }, nameOf(c))), ...cells);
    }).filter(Boolean);
    clearButton.hidden = results.size === 0;
    trackTable.replaceChildren(el('caption', { class: 'v2-sr-only', i18n: 'compete.table.title' }), el('thead', {}, head), el('tbody', {}, rows));
    i18n.translateTree(trackTable);
  }
  function focusIndex() {
    const race = state.race;
    const human = state.raceKeys.indexOf('human');
    if (state.follow !== null) { const i = state.raceKeys.indexOf(state.follow); if (i >= 0 && !followLocked()) return i; }
    if (human >= 0) return human;
    const racing = race.standings.filter((i) => race.results[i].state === 'racing');
    return racing.length > 0 ? racing[0] : race.standings[0];
  }
  const machineOn = () => state.machineView && state.raceKeys[focusIndex()] !== 'human';
  function looks() {
    const race = state.race;
    return state.raceKeys.map((key, i) => {
      const r = race.results[i];
      const slot = state.selection.slotOf(key) ?? i + 1;
      let s = 'racing';
      if (r.state !== 'racing') s = 'done'; else if (r.penalized) s = 'penalized'; else if (race.isProtected(i)) s = 'protected';
      return { color: colorKey(key, slot), number: slot, state: s, sensors: key !== 'human' && state.sensorsOn.has(key) };
    });
  }

  // --- Sincronizar ---------------------------------------------------------------------------------------------
  const write = (node, text) => { if (node.textContent !== text) node.textContent = text; };
  let lastDescription = '';
  function syncCountdown() {
    const c = countdown.at(clock());
    const show = c.state === 'counting' || c.state === 'go';
    countLayer.hidden = !show;
    if (show) write(countNumber, c.state === 'go' ? t('compete.countdown.go') : String(c.number));
  }
  function sync(now = win.performance.now()) {
    const race = state.race;
    const phase = state.phase;
    const action = mainAction(phase);
    tr(mainButton.querySelector('span'), i18n, `evaluar.main.${action}`);
    mainButton.dataset.help = `compete.main.${action}`;
    mainButton.disabled = action === 'counting';
    setAttr(mainButton, 'aria-pressed', String(phase === 'paused'));
    // Otra carrera ya es la acción principal al terminar: no se repite al lado.
    anotherButton.hidden = phase === 'finished';
    const g = race.goal;
    startNote.hidden = phase !== 'waiting';
    if (phase === 'waiting') tr(startNote, i18n, 'compete.start.text', { goal: goalText(t, { kind: g.kind, value: g.value }) });
    speeds.element.hidden = humanIn();
    speeds.set(state.speed);
    loop.setSpeed(humanIn() ? 1 : state.speed);
    traffic.element.hidden = onCircuit();
    traffic.set(state.traffic);
    const street = { lanes: state.settings.lanes, density: state.settings.density, irregularity: state.settings.irregularity };
    const anyPracticed = state.selection.keys.some((k) => { const c = candidateOf(k); return c?.brain && practicedTraffic(c.brain, street); });
    nobodyPracticed.hidden = onCircuit() || state.traffic !== 'practice' || anyPracticed;
    if (doc.activeElement !== penalty.input) penalty.set(state.crashPenalty);
    const kind = goalKind();
    const lim = GOAL_LIMITS[kind];
    for (const [k, v] of [['min', lim.min], ['max', lim.max], ['step', lim.step]]) if (goal.input.getAttribute(k) !== String(v)) goal.input.setAttribute(k, String(v));
    tr(goal.element.querySelector('.v2-setting-name > span'), i18n, `bar.goal.${kind}`);
    if (doc.activeElement !== goal.input) goal.set(state.goals[state.settings.track]);
    machineSwitch.set(state.machineView);
    machineSwitch.element.hidden = state.raceKeys[focusIndex()] === 'human';
    machineBadge.hidden = !machineOn();
    pauseBadge.hidden = phase !== 'paused';
    // Con "Vos" en la carrera no hay velocidades ni ver como la máquina (siguiendo a Vos): el grupo vacío se oculta.
    runGroup.hidden = speeds.element.hidden && machineSwitch.element.hidden;

    const list = state.missions.missions;
    const current = currentMission(list);
    mission.element.hidden = !current;
    if (current?.allDone) mission.set({ nameKey: 'mission.allDone', done: 1, goal: 1, complete: true });
    else if (current) mission.set({ nameKey: `compete.mission.${current.id}`, params: { goal: current.goal }, countKey: current.unit === 'none' ? 'train.mission.pending' : 'compete.mission.progress', countParams: current.unit === 'none' ? null : { value: current.progress, goal: current.goal }, done: current.progress, goal: current.goal });
    if (missionReveal) missionReveal.hidden = !(current && REVEAL[current.id]);

    write(figTime, race.waitLeft !== null && !race.finished
      ? t('compete.stats.timeWait', { value: formatFixed(Math.floor(race.time), 0, i18n.language), left: Math.ceil(race.waitLeft) })
      : t('compete.value.seconds', { value: formatFixed(Math.floor(race.time), 0, i18n.language) }));
    const arrived = race.results.filter((r) => r.state === 'arrived').length;
    write(figGoal, t(g.kind === 'laps' ? (g.value === 1 ? 'compete.stats.goalLap' : 'compete.stats.goalLaps') : 'compete.stats.goalMeters', { value: g.value, arrived, total: race.results.length }));
    let leaderName = null;
    if (phase === 'finished') { const w = winnerName(); write(figLeader, w ? t('compete.stats.won', { name: w }) : t('compete.stats.nobody')); }
    else { leaderName = nameOf(candidateOf(state.raceKeys[race.standings[0]])); write(figLeader, t('compete.value.name', { name: leaderName })); }
    figLeader.title = figLeader.textContent;
    if (race.waitLeft !== null && !state.firstAnnounced && !race.finished) {
      state.firstAnnounced = true;
      announce(t('compete.announce.first', { name: nameOf(candidateOf(state.raceKeys[race.standings[0]])), value: RACE_WAIT_SECONDS }));
    }
    const waiting = race.waitLeft !== null && !race.finished;
    waitBadge.hidden = !waiting;
    if (waiting) tr(waitBadge, i18n, 'compete.wait', { value: Math.ceil(race.waitLeft) });
    syncCountdown();
    const text = raceDescription({ t, track: race.trackId, lanes: state.settings.lanes, goal: g, count: race.results.length, phase: phase === 'counting' ? 'waiting' : phase, leader: leaderName, winner: phase === 'finished' ? winnerName() : null, followed: nameOf(candidateOf(state.raceKeys[focusIndex()])), machineView: state.machineView });
    if (text !== lastDescription) { description.textContent = text; lastDescription = text; }
    renderScoreboard(now);
  }

  // --- Bucle ---------------------------------------------------------------------------------------------------
  function stepRace() { if (state.phase !== 'running') return; state.race.step(); if (state.race.finished) finishRace(); }
  function draw() {
    tickCountdown();
    view.render(state.race.world, { showSensors: machineOn(), machineView: machineOn(), focus: focusIndex(), competitors: looks(), goal: state.race.goal });
    sync();
  }
  const loop = createLoop({ step: stepRace, render: draw, onError: (err) => console.error(err), speed: 1 });

  let handledSpace = false;
  function onKeyDown(e) {
    if (!visible) return;
    const action = shortcutFor(e);
    if (!action) return;
    e.preventDefault();
    if (action === 'main') handledSpace = true;
    if (e.repeat) return;
    if (action === 'main') main(); else if (action === 'restart') newRace(); else if (action === 'another') anotherRace();
  }
  function onKeyUp(e) { if (e.code === 'Space' && handledSpace) { handledSpace = false; e.preventDefault(); } }
  win.addEventListener('keydown', onKeyDown);
  win.addEventListener('keyup', onKeyUp);
  const offLanguage = i18n.onChange(() => { renderList(); renderTable(); lastDescription = ''; sync(); });
  const offLibrary = library ? library.subscribe(() => { refreshCandidates(); renderList(); renderTable(); sync(); }) : () => {};

  refreshCandidates();
  renderList();
  newRace();

  return {
    view, loop, state, draw,
    get race() { return state.race; },
    get phase() { return state.phase; },
    start, togglePause, restart: () => newRace(), anotherRace, main, toggleCompetitor,
    /** Avanza `seconds` de carrera y dibuja (verificación desde la consola). */
    advance(seconds) { for (let k = 0; k < Math.round(seconds * 60); k++) stepRace(); draw(); },
    show() {
      visible = true;
      // Al volver, si cambió lo que corre (otro programa o un cerebro nuevo en la biblioteca), carrera nueva.
      const removed = refreshCandidates();
      const changed = state.raceKeys.some((k, i) => candidateOf(k)?.signature !== state.raceSignatures[i]);
      renderList();
      if (removed.length > 0 || changed) newRace();
      loop.start();
    },
    hide() {
      visible = false;
      if (state.phase === 'running') state.phase = 'paused';
      if (state.phase === 'counting') { state.phase = 'waiting'; countdown.cancel(); }
      keyboard.releaseAll();
      loop.stop();
      sync();
    },
    unmount() {
      loop.dispose();
      keyboard.dispose();
      offLanguage?.();
      offLibrary();
      offScenario();
      picker.dispose();
      win.removeEventListener('keydown', onKeyDown);
      win.removeEventListener('keyup', onKeyUp);
      view.dispose();
    },
  };
}
