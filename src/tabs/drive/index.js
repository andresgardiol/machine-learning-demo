// Pestaña 1, "El problema": la persona maneja el auto con el teclado entre el tráfico y ve lo
// que perciben los sensores y qué controles se accionan.
//
// Composición: mundo del núcleo + controlador de teclado + vista + bucle, y el panel con guía,
// indicadores, misiones, percepción, acción y configuración avanzada. La lógica que se puede
// probar sin DOM vive en session.js (indicadores y misiones), settings.js y shortcuts.js.
import { createWorld } from '../../core/world.js';
import { createKeyboardController } from '../../input/keyboard.js';
import { createStageView } from '../../render/view.js';
import { createLoop } from '../../ui/loop.js';
import { el } from '../../ui/dom.js';
import { createDriveSession } from './session.js';
import { DEFAULT_SETTINGS, LANE_OPTIONS, SLIDERS, normalizeSettings, worldSpec } from './settings.js';
import { shortcutFor } from './shortcuts.js';

export const DEFAULT_SEED = 1;

const ACTIONS = ['forward', 'reverse', 'left', 'right'];

// Misiones cumplidas: siguen marcadas hasta cerrar la aplicación, aunque la pestaña se vuelva a montar.
const completedMissions = new Set();

export function mount({ stage, panel, i18n, store, reportError }) {
  // La velocidad máxima del auto es una sola para toda la app: vive en el almacén de la app.
  let settings = normalizeSettings({ ...DEFAULT_SETTINGS, maxSpeed: store?.get().carSpeed ?? DEFAULT_SETTINGS.maxSpeed });
  let seed = DEFAULT_SEED;
  const keyboard = createKeyboardController();
  const makeWorld = () => createWorld({ ...worldSpec(settings, seed), controller: keyboard });
  let world = makeWorld();
  const session = createDriveSession({ completed: completedMissions });
  const view = createStageView({ container: stage });
  const options = { showSensors: true, machineView: false };

  /** Texto variable: declara clave y parámetros (para el cambio de idioma) y lo escribe solo si cambió. */
  function setText(node, key, params) {
    const raw = params ? JSON.stringify(params) : null;
    if (node.getAttribute('data-i18n') === key && node.getAttribute('data-i18n-params') === raw && node.textContent !== '') return;
    node.setAttribute('data-i18n', key);
    if (raw) node.setAttribute('data-i18n-params', raw);
    else node.removeAttribute('data-i18n-params');
    node.textContent = i18n.t(key, params);
  }

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

  // --- Componentes -----------------------------------------------------------------
  const button = (key, help, onClick, cls = 'tool') => el('button', {
    class: cls, i18n: key, help, attrs: { type: 'button' }, on: { click: onClick },
  });

  const switchButton = (key, help, checked, onToggle) => el('button', {
    class: 'switch', help,
    attrs: { type: 'button', role: 'switch', 'aria-checked': String(checked) },
    on: { click: onToggle },
  }, el('span', { class: 'switch-track', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: key }));

  // Guía de inicio
  const intro = el('section', { class: 'guide drive-intro' },
    el('p', { i18n: 'drive.guide.what' }),
    el('p', { i18n: 'drive.guide.try' }),
    el('p', { class: 'drive-keys', i18n: 'drive.guide.keys' }));

  // Controles del intento
  const restartButton = button('drive.restart', 'drive.restart', restart);
  const newTrafficButton = button('drive.newTraffic', 'drive.newTraffic', newTraffic);
  const pauseButton = button('drive.pause', 'drive.pause', togglePause);
  pauseButton.setAttribute('aria-pressed', 'false');
  const toolbar = el('div', { class: 'drive-toolbar' }, restartButton, newTrafficButton, pauseButton);

  // Indicadores del intento
  const stat = (labelKey) => {
    const value = el('dd', { class: 'stat-value' });
    return { node: el('div', { class: 'stat' }, el('dt', { i18n: labelKey }), value), value };
  };
  const stats = {
    distance: stat('drive.stats.distance'),
    passed: stat('drive.stats.passed'),
    attempts: stat('drive.stats.attempts'),
    best: stat('drive.stats.best'),
  };
  const statsList = el('dl', { class: 'drive-stats', attrs: { 'aria-live': 'off' } }, Object.values(stats).map((s) => s.node));

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

  // Percepción: una barra por rayo, de izquierda a derecha
  const sensorsSwitch = switchButton('drive.sensors', 'drive.sensors', options.showSensors, () => {
    options.showSensors = !options.showSensors;
    sync();
  });
  const bars = el('div', { class: 'sensor-bars', attrs: { role: 'img' }, i18nAttr: 'aria-label:drive.perception.bars' });
  let barFills = [];
  function buildBars(count) {
    barFills = Array.from({ length: count }, () => el('span', { class: 'sensor-fill' }));
    bars.replaceChildren(...barFills.map((f) => el('span', { class: 'sensor-bar' }, f)));
    bars.style.setProperty('--bars', String(count));
  }
  buildBars(world.perception.sensors.length);
  const perceptionCaption = el('p', { class: 'guide caption', i18n: 'drive.perception.caption' });

  // Acción: los cuatro controles accionados
  const actionKeys = Object.fromEntries(ACTIONS.map((a) => [a, el('span', { class: `action-key action-${a}`, dataset: { on: 'false' } },
    el('span', { class: 'action-glyph', i18n: `drive.action.${a}.key`, attrs: { 'aria-hidden': 'true' } }),
    el('span', { class: 'action-name', i18n: `drive.action.${a}` }))]));
  const actions = el('div', { class: 'action-keys' }, ACTIONS.map((a) => actionKeys[a]));
  const actionCaption = el('p', { class: 'guide caption', i18n: 'drive.action.caption' });

  const perceptionBlock = el('div', { class: 'perception-block' },
    el('h3', { class: 'panel-subheading', i18n: 'drive.perception.title' }), bars, perceptionCaption,
    el('h3', { class: 'panel-subheading', i18n: 'drive.action.title' }), actions, actionCaption);

  const machineSwitch = switchButton('drive.machine', 'drive.machine', options.machineView, () => {
    options.machineView = !options.machineView;
    sync();
  });

  const perception = el('section', { class: 'drive-perception' },
    el('h2', { class: 'panel-heading', i18n: 'drive.perception.heading' }),
    el('div', { class: 'switch-row' }, sensorsSwitch, machineSwitch),
    perceptionBlock);

  // Configuración avanzada (colapsada)
  let dragging = false; // un arrastre de deslizador cuenta como un solo reinicio
  function applySettings(next, { countAttempt = true } = {}) {
    settings = normalizeSettings(next);
    store?.set({ carSpeed: settings.maxSpeed });
    restartAttempt({ rebuild: true, countAttempt });
  }

  const laneButtons = LANE_OPTIONS.map((n) => el('button', {
    class: 'segment', i18n: 'drive.lanes.option', params: { n }, help: 'drive.lanes',
    i18nAttr: 'aria-label:drive.lanes.optionLabel',
    attrs: { type: 'button', 'aria-pressed': String(n === settings.lanes) },
    dataset: { lanes: String(n) },
    on: { click: () => { if (n !== settings.lanes) applySettings({ ...settings, lanes: n }); } },
  }));
  const lanesRow = el('div', { class: 'setting' },
    el('span', { class: 'setting-label', i18n: 'drive.lanes' }),
    el('div', { class: 'segments', attrs: { role: 'group' }, i18nAttr: 'aria-label:drive.lanes' }, laneButtons));

  const sliders = SLIDERS.map((s) => {
    const id = `drive-${s.key}`;
    const value = el('output', { class: 'setting-value', attrs: { for: id } });
    const input = el('input', {
      help: `drive.${s.key}`,
      attrs: { type: 'range', id, min: s.min, max: s.max, step: s.step, value: settings[s.key] },
      on: {
        input: (e) => {
          applySettings({ ...settings, [s.key]: Number(e.target.value) }, { countAttempt: !dragging });
          dragging = true;
        },
        change: () => { dragging = false; },
      },
    });
    const row = el('div', { class: 'setting' },
      el('label', { class: 'setting-label', i18n: `drive.${s.key}`, attrs: { for: id } }), value, input);
    return { ...s, input, value, row };
  });

  const resetSettingsButton = button('drive.resetSettings', 'drive.resetSettings', () => applySettings({ ...DEFAULT_SETTINGS }));

  const row = (key) => sliders.find((s) => s.key === key).row;
  const advanced = el('details', { class: 'drive-advanced' },
    el('summary', { i18n: 'drive.advanced', help: 'drive.advanced' }),
    el('div', { class: 'advanced-body' },
      el('h3', { class: 'panel-subheading', i18n: 'drive.advanced.car' }),
      row('maxSpeed'),
      el('h3', { class: 'panel-subheading', i18n: 'drive.advanced.street' }),
      lanesRow, row('density'), row('irregularity'),
      el('h3', { class: 'panel-subheading', i18n: 'drive.advanced.sensors' }),
      row('sensorCount'), row('sensorRange'), row('sensorSpread'),
      resetSettingsButton));

  panel.append(
    el('h1', { class: 'panel-title', i18n: 'drive.title' }),
    intro, toolbar, statsList, missions, perception, advanced);

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

  // --- Sincronizar el panel con el estado ------------------------------------------
  const meters = (v) => ({ value: Math.floor(v) });

  function sync() {
    const crashed = world.crashed;
    const perceptionVisible = options.showSensors || options.machineView;

    setText(stats.distance.value, 'drive.value.meters', meters(session.distance));
    setText(stats.passed.value, 'drive.value.count', { value: session.passed });
    setText(stats.attempts.value, 'drive.value.count', { value: session.attempts });
    setText(stats.best.value, 'drive.value.meters', meters(session.best));

    for (const m of session.missions) {
      const r = missionRows.find((x) => x.id === m.id);
      r.row.dataset.done = String(m.done);
      if (m.done) setText(r.status, 'drive.mission.done');
      else setText(r.status, `drive.mission.progress.${m.unit}`, { value: Math.floor(m.progress), goal: m.goal });
      const ratio = m.done ? 1 : m.progress / m.goal;
      const width = `${Math.round(ratio * 100)}%`;
      if (r.fill.style.width !== width) r.fill.style.width = width;
    }

    // Percepción y acción
    const readings = world.perception.sensors;
    if (readings.length !== barFills.length) buildBars(readings.length);
    readings.forEach((v, i) => {
      const h = `${Math.round(v * 100)}%`;
      if (barFills[i].style.height !== h) barFills[i].style.height = h;
    });
    perceptionBlock.hidden = !perceptionVisible;
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

    // Configuración avanzada
    for (const b of laneButtons) b.setAttribute('aria-pressed', String(Number(b.dataset.lanes) === settings.lanes));
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
      stage.removeEventListener('click', onClick);
      keyboard.dispose();
      view.dispose();
    },
  };
}
