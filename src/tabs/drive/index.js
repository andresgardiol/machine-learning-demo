// Pestaña 1, "El problema": la persona maneja el auto con el teclado entre el tráfico y ve lo
// que perciben los sensores y qué controles se accionan.
//
// Composición: mundo del núcleo + controlador de teclado + vista + bucle; el tablero con los
// indicadores del intento, lo que perciben los sensores y lo que se acciona (design.md D10); y el
// panel con guía, marcha, vista y misiones; y la barra de escenario, común a las tres pestañas
// (panel-de-entrenar-por-vistas D11), con la pista, el tráfico y la velocidad (sin sensores). La lógica que se puede probar
// sin DOM vive en session.js (indicadores, misiones y lecturas), settings.js y shortcuts.js. Las
// barras de percepción, los cuatro controles y la barra de escenario son piezas compartidas con la
// pestaña Reglas a mano (tabs/shared/, design.md D5).
import { createWorld } from '../../core/world.js';
import { createKeyboardController } from '../../input/keyboard.js';
import { createStageView } from '../../render/view.js';
import { createLoop } from '../../ui/loop.js';
import { el } from '../../ui/dom.js';
import { returnsFocusToStage } from '../../ui/shortcuts.js';
import { button, switchButton, createTextSetter } from '../../ui/controls.js';
import { statStrip, boardCard } from '../../ui/board.js';
import { perceptionBlock, actionBlock } from '../shared/driving-cards.js';
import { setUnavailable } from '../shared/street-advanced.js';
import { scenarioBar } from '../shared/scenario-bar.js';
import { formatFixed } from '../../ui/i18n.js';
import { stageDescription } from '../../ui/stage-description.js';
import { drivingDescription } from '../shared/stage-text.js';
import { createDriveSession } from './session.js';
import {
  DEFAULT_SETTINGS, needsRestart, normalizeSettings, worldSpec, onCircuit, lapsShown,
} from './settings.js';
import { shortcutFor } from './shortcuts.js';

export const DEFAULT_SEED = 1;

// Misiones cumplidas: siguen marcadas hasta cerrar la aplicación, aunque la pestaña se vuelva a montar.
const completedMissions = new Set();
// Ajustes de la barra de escenario de esta pestaña: se conservan al salir y volver, hasta cerrar la
// aplicación (barra-escenario, "Valores de cada pestaña"). La velocidad es la de toda la app.
let keptSettings = null;
// Tarjetas del tablero desplegadas: se conservan al salir de la pestaña y volver.
const cards = { perception: true, action: true };

export function mount({ stage, board, panel, bar, i18n, store, reportError }) {
  // La velocidad máxima del auto es una sola para toda la app: vive en el almacén de la app.
  let settings = normalizeSettings({ ...(keptSettings ?? DEFAULT_SETTINGS), maxSpeed: store?.get().carSpeed ?? DEFAULT_SETTINGS.maxSpeed });
  let seed = DEFAULT_SEED;
  const keyboard = createKeyboardController();
  const makeWorld = () => createWorld({ ...worldSpec(settings, seed), controller: keyboard });
  let world = makeWorld();
  const session = createDriveSession({ completed: completedMissions });
  const view = createStageView({ container: stage, store });
  const options = { showSensors: true, machineView: false };
  // Descripción en texto del escenario, para lectores de pantalla (panel-de-entrenar-por-vistas D9).
  const description = stageDescription({ stage });

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
    if (onCircuit(settings)) return; // en un circuito no hay tráfico
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
  const missionList = el('ol', { class: 'mission-list' }, missionRows.map((r) => r.row));
  // En un circuito las misiones (de la calle recta) se ocultan y queda una línea que lo dice.
  const missionsCircuit = el('p', { class: 'caption', i18n: 'drive.missions.circuit' });
  const missions = el('section', { class: 'guide drive-missions' },
    el('h2', { class: 'panel-heading', i18n: 'drive.missions.title' }),
    missionList, missionsCircuit);

  // --- Tablero: indicadores, percepción y acción (design.md D10) ---------------------------
  const strip = statStrip([
    { id: 'distance', labelKey: 'drive.stats.distance' },
    { id: 'passed', labelKey: 'drive.stats.passed' },
    { id: 'attempts', labelKey: 'drive.stats.attempts' },
    { id: 'best', labelKey: 'drive.stats.best' },
  ]);

  // Percepción: una barra por rayo, de izquierda a derecha, con su lectura debajo (hasta 12
  // sensores), y la velocidad aparte, rotulada y siempre con su número.
  const perception = perceptionBlock({ i18n, count: world.perception.sensors.length });
  const perceptionCard = boardCard({
    id: 'drive-perception', titleKey: 'drive.perception.title', help: 'drive.perception', hintKey: 'drive.perception.hint',
    open: cards.perception, grow: 1.4, onToggle: (open) => { cards.perception = open; },
  });
  perceptionCard.append(perception.node);

  // Acción: los cuatro controles accionados
  const action = actionBlock();
  const actionCard = boardCard({
    id: 'drive-action', titleKey: 'drive.action.title', help: 'drive.action', hintKey: 'drive.action.hint',
    open: cards.action, grow: 1, onToggle: (open) => { cards.action = open; },
  });
  actionCard.append(action.node);

  board.append(strip.node, perceptionCard.node, actionCard.node);

  // Barra de escenario (D11): velocidad, densidad e irregularidad se aplican en marcha; la pista y los
  // carriles reinician el intento. Un arrastre de deslizador cuenta un solo intento.
  function applySettings(next, { countAttempt = true } = {}) {
    const before = settings;
    settings = normalizeSettings(next);
    keptSettings = settings;
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
  // Sin el grupo de sensores (conducir-sin-ajustes-de-sensores D1): acá maneja una persona.
  const scenario = scenarioBar({
    i18n, settings, idPrefix: 'drive', omit: ['sensors'], resetHelp: 'drive.resetScenario',
    onChange: (key, value, { first }) => {
      if (settings[key] !== value) applySettings({ ...settings, [key]: value }, { countAttempt: first });
    },
    onReset: () => applySettings({ ...DEFAULT_SETTINGS }, { countAttempt: true }),
  });
  bar?.append(scenario.node);

  panel.append(
    el('h1', { class: 'sr-only', i18n: 'drive.title' }),
    intro, run, viewSwitches, missions);

  // --- Mensajes sobre el escenario ---------------------------------------------------
  const pauseBadge = el('div', { class: 'stage-badge pause-badge', i18n: 'drive.paused', attrs: { role: 'status' } });
  const machineBadge = el('div', { class: 'stage-badge machine-badge', i18n: 'drive.machine.badge' });
  const crashBody = el('p', {});
  const crashRestart = button('drive.restart', 'drive.restart', restart, 'tool primary');
  const crashHowto = el('p', { i18n: 'drive.crash.howto' });
  const crashBox = el('div', { class: 'crash-box', attrs: { role: 'alert' } },
    el('h2', { i18n: 'drive.crash.title' }),
    crashBody,
    crashHowto,
    crashRestart);
  const badges = el('div', { class: 'stage-badges' }, pauseBadge, machineBadge);
  const crashLayer = el('div', { class: 'crash-layer' }, crashBox);
  view.corner.append(badges);
  stage.append(crashLayer);

  // --- Sincronizar el panel y el tablero con el estado ---------------------------------
  const meters = (v) => ({ value: Math.floor(v) });

  function sync() {
    const crashed = world.crashed;

    setText(strip.values.distance, 'drive.value.meters', meters(session.distance));
    // En un circuito el segundo indicador muestra las vueltas, con un decimal.
    const circuit = world.track.closed;
    setText(strip.labels.passed, circuit ? 'drive.stats.laps' : 'drive.stats.passed');
    if (circuit) setText(strip.values.passed, 'drive.value.laps', { value: formatFixed(lapsShown(session.distance, world.track.length), 1, i18n.language) });
    else setText(strip.values.passed, 'drive.value.count', { value: session.passed });
    missionList.hidden = circuit;
    missionsCircuit.hidden = !circuit;
    setUnavailable(newTrafficButton, circuit, 'drive.newTraffic');
    description.set(drivingDescription({
      t: i18n.t, track: settings.track, lanes: settings.lanes, paused: world.paused, crashed,
      meters: session.distance, machineView: options.machineView && !crashed,
    }));
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
    perception.update(world.perception);
    action.update(keyboard.control());
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
      const edgeKey = circuit ? 'drive.crash.edge.circuit' : 'drive.crash.edge';
      setText(crashBody, world.crashCause === 'vehicle' ? 'drive.crash.vehicle' : edgeKey, meters(session.distance));
      setText(crashHowto, circuit ? 'drive.crash.howto.circuit' : 'drive.crash.howto');
    }

    // Guía: nombra la cantidad de carriles elegida o, en un circuito, la pista
    if (circuit) setText(introWhat, 'drive.guide.what.circuit', { track: i18n.t(`track.${settings.track}`) });
    else setText(introWhat, 'drive.guide.what', { lanes: settings.lanes });

    // Barra de escenario
    scenario.sync(settings);
  }

  // --- Bucle ----------------------------------------------------------------------
  const loop = createLoop({
    step: () => {
      world.step();
      session.observe(world, { machineView: options.machineView && !world.crashed, missions: !world.track.closed });
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
    if (e.detail > 0 && returnsFocusToStage(e.target)) focusStage();
  }
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  panel.addEventListener('click', onClick);
  board.addEventListener('click', onClick);
  stage.addEventListener('click', onClick);
  bar?.addEventListener('click', onClick);
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
      bar?.removeEventListener('click', onClick);
      keyboard.dispose();
      description.dispose();
      scenario.dispose();
      view.dispose();
    },
  };
}
