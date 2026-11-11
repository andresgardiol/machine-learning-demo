// Pestaña 1, "El problema": la persona maneja el auto con el teclado entre el tráfico y ve lo
// que perciben los sensores y qué controles se accionan.
//
// Composición: mundo del núcleo + controlador de teclado + vista + bucle; el tablero con los
// indicadores del intento, lo que perciben los sensores y lo que se acciona (design.md D10); y el
// panel con guía, marcha, vista, misiones y configuración avanzada. La lógica que se puede probar
// sin DOM vive en session.js (indicadores, misiones y lecturas), settings.js y shortcuts.js.
import { createWorld } from '../../core/world.js';
import { createKeyboardController } from '../../input/keyboard.js';
import { createStageView } from '../../render/view.js';
import { createLoop } from '../../ui/loop.js';
import { el } from '../../ui/dom.js';
import { button, switchButton, sliderRow, optionGroup, createTextSetter } from '../../ui/controls.js';
import { statStrip, boardCard } from '../../ui/board.js';
import { formatFixed } from '../../ui/i18n.js';
import { createDriveSession, readings } from './session.js';
import { DEFAULT_SETTINGS, LANE_OPTIONS, SLIDERS, needsRestart, normalizeSettings, worldSpec } from './settings.js';
import { shortcutFor } from './shortcuts.js';

export const DEFAULT_SEED = 1;

const ACTIONS = ['forward', 'reverse', 'left', 'right'];

// Misiones cumplidas: siguen marcadas hasta cerrar la aplicación, aunque la pestaña se vuelva a montar.
const completedMissions = new Set();
// Tarjetas del tablero desplegadas: se conservan al salir de la pestaña y volver.
const cards = { perception: true, action: true };

export function mount({ stage, board, panel, i18n, store, reportError }) {
  // La velocidad máxima del auto es una sola para toda la app: vive en el almacén de la app.
  let settings = normalizeSettings({ ...DEFAULT_SETTINGS, maxSpeed: store?.get().carSpeed ?? DEFAULT_SETTINGS.maxSpeed });
  let seed = DEFAULT_SEED;
  const keyboard = createKeyboardController();
  const makeWorld = () => createWorld({ ...worldSpec(settings, seed), controller: keyboard });
  let world = makeWorld();
  const session = createDriveSession({ completed: completedMissions });
  const view = createStageView({ container: stage });
  const options = { showSensors: true, machineView: false };

  const setText = createTextSetter(i18n);

  const focusStage = () => stage.focus({ preventScroll: true });

  // --- Acciones del intento ------------------------------------------------------
  function restartAttempt({ countAttempt = true, rebuild = false } = {}) {
    if (rebuild) {
      const paused = world.paused;
      world = makeWorld();
      if (paused) world.pause();
    } else {
      world.reset();
    }
    session.restart({ countAttempt });
    view.followCar();
    sync();
  }

  const restart = () => restartAttempt();
  function newTraffic() {
    seed += 1;
    restartAttempt({ rebuild: true });
  }
  function togglePause() {
    if (world.paused) world.resume();
    else world.pause();
    sync();
  }

  // --- Panel: guía, marcha y vista ------------------------------------------------------
  // Guía de inicio: un párrafo que nombra los carriles y un renglón con las teclas.
  const introWhat = el('p', { i18n: 'drive.guide.what', params: { lanes: settings.lanes } });
  const intro = el('section', { class: 'guide drive-intro' },
    introWhat,
    el('p', { class: 'drive-keys', i18n: 'drive.guide.keys' }));

  // Marcha: pausar y reiniciar en un renglón; tráfico nuevo, más chico, debajo.
  const restartButton = button('drive.restart', 'drive.restart', restart);
  const newTrafficButton = button('drive.newTraffic', 'drive.newTraffic', newTraffic, 'tool small');
  const pauseButton = button('drive.pause', 'drive.pause', togglePause);
  pauseButton.setAttribute('aria-pressed', 'false');
  const run = el('section', { class: 'drive-run' },
    el('div', { class: 'run-main' }, pauseButton, restartButton),
    el('div', { class: 'run-secondary' }, newTrafficButton));

  // Vista: el interruptor de sensores solo decide si se dibujan los rayos; las barras siguen.
  const sensorsSwitch = switchButton('drive.sensors', 'drive.sensors', options.showSensors, () => {
    options.showSensors = !options.showSensors;
    sync();
  });
  const machineSwitch = switchButton('drive.machine', 'drive.machine', options.machineView, () => {
    options.machineView = !options.machineView;
    sync();
  });
  const viewSwitches = el('div', { class: 'switch-row drive-view', attrs: { role: 'group' }, i18nAttr: 'aria-label:drive.view.title' },
    sensorsSwitch, machineSwitch);

  // Misiones
  const missionRows = session.missions.map((m) => {
    const status = el('span', { class: 'mission-status' });
    const fill = el('span', { class: 'mission-fill' });
    const row = el('li', { class: 'mission' },
      el('span', { class: 'mission-name', i18n: `drive.mission.${m.id}`, params: { goal: m.goal } }),
      status,
      el('span', { class: 'mission-bar', attrs: { 'aria-hidden': 'true' } }, fill));
    return { id: m.id, row, status, fill };
  });
  const missions = el('section', { class: 'guide drive-missions' },
    el('h2', { class: 'panel-heading', i18n: 'drive.missions.title' }),
    el('ol', { class: 'mission-list' }, missionRows.map((r) => r.row)));

  // --- Tablero: indicadores, percepción y acción (design.md D10) ---------------------------
  const strip = statStrip([
    { id: 'distance', labelKey: 'drive.stats.distance' },
    { id: 'passed', labelKey: 'drive.stats.passed' },
    { id: 'attempts', labelKey: 'drive.stats.attempts' },
    { id: 'best', labelKey: 'drive.stats.best' },
  ]);

  // Percepción: una barra por rayo, de izquierda a derecha, con su lectura debajo (hasta 12
  // sensores), y la velocidad aparte, rotulada y siempre con su número.
  const bars = el('div', { class: 'sensor-bars', attrs: { role: 'img' }, i18nAttr: 'aria-label:drive.perception.bars' });
  const barValues = el('div', { class: 'sensor-values', attrs: { 'aria-hidden': 'true' } });
  let barFills = [];
  let valueNodes = [];
  function buildBars(count) {
    barFills = Array.from({ length: count }, () => el('span', { class: 'sensor-fill' }));
    bars.replaceChildren(...barFills.map((f) => el('span', { class: 'sensor-bar' }, f)));
    valueNodes = Array.from({ length: count }, () => el('span', { class: 'sensor-value' }));
    barValues.replaceChildren(...valueNodes);
    for (const n of [bars, barValues]) {
      n.style.setProperty('--bars', String(count));
      // Con muchos rayos la separación se angosta para que cada barra conserve ancho visible.
      n.style.setProperty('--bar-gap', count > 60 ? '0px' : count > 30 ? '1px' : '2px');
    }
  }
  buildBars(world.perception.sensors.length);
  const speedFill = el('span', { class: 'sensor-fill speed-fill' });
  const speedValue = el('span', { class: 'sensor-value speed-value' });
  const perceptionCard = boardCard({
    id: 'drive-perception', titleKey: 'drive.perception.title', help: 'drive.perception', hintKey: 'drive.perception.hint',
    open: cards.perception, grow: 1.4, onToggle: (open) => { cards.perception = open; },
  });
  perceptionCard.append(el('div', { class: 'perception' },
    el('div', { class: 'perception-sensors' }, bars, barValues),
    el('div', { class: 'perception-speed' },
      el('span', { class: 'sensor-bar speed-bar', attrs: { role: 'img' }, i18nAttr: 'aria-label:network.input.speed' }, speedFill),
      speedValue,
      el('span', { class: 'speed-label', i18n: 'network.input.speed' }))));

  // Acción: los cuatro controles accionados
  const actionKeys = Object.fromEntries(ACTIONS.map((a) => [a, el('span', { class: `action-key action-${a}`, dataset: { on: 'false' } },
    el('span', { class: 'action-glyph', i18n: `drive.action.${a}.key`, attrs: { 'aria-hidden': 'true' } }),
    el('span', { class: 'action-name', i18n: `drive.action.${a}` }))]));
  const actionCard = boardCard({
    id: 'drive-action', titleKey: 'drive.action.title', help: 'drive.action', hintKey: 'drive.action.hint',
    open: cards.action, grow: 1, onToggle: (open) => { cards.action = open; },
  });
  actionCard.append(el('div', { class: 'action-keys' }, ACTIONS.map((a) => actionKeys[a])));

  board.append(strip.node, perceptionCard.node, actionCard.node);

  // Configuración avanzada (colapsada)
  let dragging = false; // un arrastre de deslizador cuenta como un solo reinicio
  // Velocidad, densidad e irregularidad se aplican en marcha; carriles y sensores reinician el intento.
  function applySettings(next, { countAttempt = true } = {}) {
    const before = settings;
    settings = normalizeSettings(next);
    store?.set({ carSpeed: settings.maxSpeed });
    if (needsRestart(before, settings)) {
      restartAttempt({ rebuild: true, countAttempt });
      return;
    }
    if (settings.maxSpeed !== before.maxSpeed) world.setMaxSpeed(settings.maxSpeed);
    if (settings.density !== before.density || settings.irregularity !== before.irregularity) {
      world.setTraffic({ density: settings.density, irregularity: settings.irregularity });
    }
    sync();
  }

  const lanes = optionGroup({
    labelKey: 'drive.lanes',
    selected: settings.lanes,
    options: LANE_OPTIONS.map((n) => ({
      value: n, i18n: 'drive.lanes.option', params: { n }, help: 'drive.lanes',
      labelKey: 'drive.lanes.optionLabel', dataset: { lanes: String(n) },
    })),
    onSelect: (n) => { if (n !== settings.lanes) applySettings({ ...settings, lanes: n }); },
  });
  const lanesRow = lanes.row;

  const sliders = SLIDERS.map((s) => {
    const { row, input, value } = sliderRow({
      id: `drive-${s.key}`, labelKey: `drive.${s.key}`, help: `drive.${s.key}`,
      min: s.min, max: s.max, step: s.step, value: settings[s.key],
      onInput: (v) => {
        applySettings({ ...settings, [s.key]: v }, { countAttempt: !dragging });
        dragging = true;
      },
      onChange: () => { dragging = false; },
    });
    return { ...s, input, value, row };
  });

  const resetSettingsButton = button('drive.resetSettings', 'drive.resetSettings', () => applySettings({ ...DEFAULT_SETTINGS }));

  const row = (key) => sliders.find((s) => s.key === key).row;
  const advanced = el('details', { class: 'section' },
    el('summary', { i18n: 'drive.advanced', help: 'drive.advanced' }),
    el('div', { class: 'section-body advanced-body' },
      el('h3', { class: 'panel-subheading', i18n: 'drive.advanced.car' }),
      row('maxSpeed'),
      el('h3', { class: 'panel-subheading', i18n: 'drive.advanced.street' }),
      lanesRow, row('density'), row('irregularity'),
      el('h3', { class: 'panel-subheading', i18n: 'drive.advanced.sensors' }),
      row('sensorCount'), row('sensorRange'), row('sensorSpread'),
      resetSettingsButton));

  panel.append(
    el('h1', { class: 'sr-only', i18n: 'drive.title' }),
    intro, run, viewSwitches, missions, advanced);

  // --- Mensajes sobre el escenario ---------------------------------------------------
  const pauseBadge = el('div', { class: 'stage-badge pause-badge', i18n: 'drive.paused', attrs: { role: 'status' } });
  const machineBadge = el('div', { class: 'stage-badge machine-badge', i18n: 'drive.machine.badge' });
  const crashBody = el('p', {});
  const crashRestart = button('drive.restart', 'drive.restart', restart, 'tool primary');
  const crashBox = el('div', { class: 'crash-box', attrs: { role: 'alert' } },
    el('h2', { i18n: 'drive.crash.title' }),
    crashBody,
    el('p', { i18n: 'drive.crash.howto' }),
    crashRestart);
  const badges = el('div', { class: 'stage-badges' }, pauseBadge, machineBadge);
  const crashLayer = el('div', { class: 'crash-layer' }, crashBox);
  stage.append(badges, crashLayer);

  // --- Sincronizar el panel y el tablero con el estado ---------------------------------
  const meters = (v) => ({ value: Math.floor(v) });
  /** Escribe un texto ya formado solo si cambió (se reescribe en cada cuadro y sigue al idioma). */
  const writeText = (node, text) => { if (node.textContent !== text) node.textContent = text; };

  function sync() {
    const crashed = world.crashed;

    setText(strip.values.distance, 'drive.value.meters', meters(session.distance));
    setText(strip.values.passed, 'drive.value.count', { value: session.passed });
    setText(strip.values.attempts, 'drive.value.count', { value: session.attempts });
    setText(strip.values.best, 'drive.value.meters', meters(session.best));

    for (const m of session.missions) {
      const r = missionRows.find((x) => x.id === m.id);
      r.row.dataset.done = String(m.done);
      if (m.done) setText(r.status, 'drive.mission.done');
      else setText(r.status, `drive.mission.progress.${m.unit}`, { value: Math.floor(m.progress), goal: m.goal });
      const ratio = m.done ? 1 : m.progress / m.goal;
      const width = `${Math.round(ratio * 100)}%`;
      if (r.fill.style.width !== width) r.fill.style.width = width;
    }

    // Percepción: barras y, con hasta 12 sensores, su lectura con dos decimales en el idioma activo.
    const perception = world.perception;
    if (perception.sensors.length !== barFills.length) buildBars(perception.sensors.length);
    perception.sensors.forEach((v, i) => {
      const h = `${Math.round(v * 100)}%`;
      if (barFills[i].style.height !== h) barFills[i].style.height = h;
    });
    const read = readings(perception);
    barValues.hidden = read.sensors === null;
    if (read.sensors) read.sensors.forEach((v, i) => writeText(valueNodes[i], formatFixed(v, 2, i18n.language)));
    const speedHeight = `${Math.round(Math.max(0, Math.min(1, read.speed)) * 100)}%`;
    if (speedFill.style.height !== speedHeight) speedFill.style.height = speedHeight;
    writeText(speedValue, formatFixed(read.speed, 2, i18n.language));
    const controls = keyboard.control();
    for (const a of ACTIONS) {
      const on = String(Boolean(controls[a]));
      if (actionKeys[a].dataset.on !== on) actionKeys[a].dataset.on = on;
    }
    sensorsSwitch.setAttribute('aria-checked', String(options.showSensors));
    machineSwitch.setAttribute('aria-checked', String(options.machineView));

    // Pausa
    pauseButton.setAttribute('aria-pressed', String(world.paused));
    setText(pauseButton, world.paused ? 'drive.resume' : 'drive.pause');
    pauseBadge.hidden = !world.paused;
    machineBadge.hidden = !(options.machineView && !crashed);

    // Fin del intento
    crashLayer.hidden = !crashed;
    if (crashed) {
      setText(crashBody, world.crashCause === 'vehicle' ? 'drive.crash.vehicle' : 'drive.crash.edge', meters(session.distance));
    }

    // Guía: nombra la cantidad de carriles elegida
    setText(introWhat, 'drive.guide.what', { lanes: settings.lanes });

    // Configuración avanzada
    lanes.select(settings.lanes);
    for (const s of sliders) {
      if (Number(s.input.value) !== settings[s.key]) s.input.value = String(settings[s.key]);
      setText(s.value, s.format, { value: settings[s.key], kmh: Math.round(settings[s.key] * 3.6) });
    }
  }

  // --- Bucle ----------------------------------------------------------------------
  const loop = createLoop({
    step: () => {
      world.step();
      session.observe(world, { machineView: options.machineView && !world.crashed });
    },
    render: () => {
      view.render(world, {
        showSensors: options.showSensors || options.machineView,
        machineView: options.machineView && !world.crashed,
      });
      sync();
    },
    onError: reportError,
  });

  // --- Atajos y foco ------------------------------------------------------------------
  let handledSpace = false;
  function onKeyDown(e) {
    const action = shortcutFor(e);
    if (!action) return;
    e.preventDefault();
    if (action === 'pause') handledSpace = true;
    // El foco estaba en un control tocado con el mouse: vuelve al escenario para que la
    // barra espaciadora no lo active.
    if (e.target !== stage && typeof e.target?.matches === 'function' && e.target.matches('button, input, summary, a')) focusStage();
    if (e.repeat) return;
    try {
      if (action === 'restart') restart();
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
  // Tras un clic con el mouse (detail > 0) en un control de la pestaña, el foco vuelve al escenario.
  function onClick(e) {
    if (e.detail > 0 && e.target?.closest?.('button, input, summary, a, label')) focusStage();
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  panel.addEventListener('click', onClick);
  board.addEventListener('click', onClick);
  stage.addEventListener('click', onClick);
  const offLanguage = i18n.onChange(() => sync());

  sync();
  loop.start();
  focusStage();

  return {
    view, options, loop, session,
    get world() { return world; },
    get settings() { return { ...settings }; },
    get seed() { return seed; },
    restart, newTraffic, togglePause,
    unmount() {
      loop.dispose();
      offLanguage();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      panel.removeEventListener('click', onClick);
      board.removeEventListener('click', onClick);
      stage.removeEventListener('click', onClick);
      keyboard.dispose();
      view.dispose();
    },
  };
}
