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
import { createKeyboardController, KEY_BINDINGS, keyAllowed, isTypingTarget } from '../../input/keyboard.js';
import { createStageView } from '../../render/view.js';
import { createLoop } from '../../ui/loop.js';
import { el } from '../../ui/dom.js';
import { returnsFocusToStage } from '../../ui/shortcuts.js';
import { button, switchButton, createTextSetter } from '../../ui/controls.js';
import { currentMission } from '../../ui/current-mission.js';
import { mainAction, applyMainAction } from '../../ui/main-action.js';
import { statStrip, boardCard } from '../../ui/board.js';
import { perceptionBlock, actionBlock } from '../shared/driving-cards.js';
import { setUnavailable } from '../shared/street-advanced.js';
import { scenarioBar } from '../shared/scenario-bar.js';
import { createConsignaCard, writeMissionRow } from '../shared/consigna-card.js';
import { createMissionReveal } from '../shared/mission-reveal.js';
import { createGuideMore } from '../shared/guide-more.js';
import { formatFixed } from '../../ui/i18n.js';
import { stageDescription } from '../../ui/stage-description.js';
import { drivingDescription } from '../shared/stage-text.js';
import { createDriveSession } from './session.js';
import {
  DEFAULT_SETTINGS, needsRestart, normalizeSettings, worldSpec, onCircuit, lapsShown,
} from './settings.js';
import { shortcutFor } from './shortcuts.js';
import { createTape, tapeColumns, tapeRows, TAPE_ACTIONS } from './tape.js';

export const DEFAULT_SEED = 1;

// Misiones cumplidas: siguen marcadas hasta cerrar la aplicación, aunque la pestaña se vuelva a montar.
const completedMissions = new Set();
// Ajustes de la barra de escenario de esta pestaña: se conservan al salir y volver, hasta cerrar la
// aplicación (barra-escenario, "Valores de cada pestaña"). La velocidad es la de toda la app.
let keptSettings = null;
// Tarjetas del tablero desplegadas: se conservan al salir de la pestaña y volver.
const cards = { perception: true, action: true, tape: true };

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
    tape.clear(); // reiniciar vacía la cinta (manejo-amable D2)
    tapeStarted = false;
    tapeVersion += 1;
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

  // --- Panel: tarjeta de consigna, guía y vista ------------------------------------------
  // Guía de inicio: un párrafo que nombra los carriles. El renglón con las teclas es la consigna de la
  // tarjeta (tarjeta-de-consigna D3).
  const introWhat = el('p', { i18n: 'drive.guide.what', params: { lanes: settings.lanes } });
  const intro = el('section', { class: 'guide drive-intro' }, introWhat);

  // Marcha: pausar y reiniciar en un renglón. Tráfico nuevo va fuera de la tarjeta, junto a los
  // interruptores de vista (tarjeta-de-consigna D11).
  const restartButton = button('drive.restart', 'drive.restart', restart);
  const newTrafficButton = button('drive.newTraffic', 'drive.newTraffic', newTraffic);
  const pauseButton = button('drive.pause', 'drive.pause', togglePause);
  pauseButton.setAttribute('aria-pressed', 'false');
  const run = el('section', { class: 'drive-run' },
    el('div', { class: 'run-main' }, pauseButton, restartButton));
  // Tarjeta de consigna (tarjeta-de-consigna D4): la consigna, la marcha y la misión en curso.
  // "Mostrame" (misiones-que-muestran-el-control): lleva a "Ver como la máquina".
  const missionReveal = createMissionReveal({
    tab: 'drive', i18n,
    mission: () => currentMission(session.missions, { available: !world.track.closed }),
    nodes: { machineView: () => machineSwitch },
  });
  const card = createConsignaCard({ i18n, run, onReveal: missionReveal.reveal });

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
  const viewRow = el('div', { class: 'view-row' }, viewSwitches, newTrafficButton);

  // Misiones. Cada fila y la tarjeta escriben la misión con la misma vista (tarjeta-de-consigna D2).
  const describeMission = (m) => ({
    done: m.done,
    nameKey: `drive.mission.${m.id}`, nameParams: { goal: m.goal },
    statusKey: m.done ? 'drive.mission.done' : `drive.mission.progress.${m.unit}`,
    statusParams: m.done ? undefined : { value: Math.floor(m.progress), goal: m.goal },
    fraction: m.done ? 1 : m.progress / m.goal,
  });
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
  const action = actionBlock({ role: true });
  const actionCard = boardCard({
    id: 'drive-action', titleKey: 'drive.action.title', help: 'drive.action', hintKey: 'drive.action.hint',
    open: cards.action, grow: 0, onToggle: (open) => { cards.action = open; },
  });
  actionCard.append(action.node);

  // La cinta del manejo (manejo-amable D2): los últimos 10 s de lo que percibía el auto y de lo que se accionó, un
  // cuadro por columna. Se queda con el alto que deja la acción. La línea que dice qué es, con la guía.
  const tape = createTape();
  let tapeVersion = 0;
  let tapeStarted = false; // la cinta empieza con la primera tecla de manejo del intento: antes, el auto espera quieto
  const tapeCanvas = el('canvas', { class: 'drive-tape-canvas', attrs: { role: 'img' }, i18nAttr: 'aria-label:drive.tape.label' });
  const tapeBox = el('div', { class: 'drive-tape' }, tapeCanvas);
  const tapeCard = boardCard({
    id: 'drive-tape', titleKey: 'drive.tape.title', help: 'drive.tape', hintKey: 'drive.tape.guide',
    open: cards.tape, grow: 4, onToggle: (open) => { cards.tape = open; tapeDrawn = ''; },
  });
  tapeCard.append(tapeBox);
  const tapeCtx = tapeCanvas.getContext('2d');
  let tapeDrawn = '';
  const tapeObserver = new ResizeObserver(() => { tapeDrawn = ''; });
  tapeObserver.observe(tapeBox);
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  /** Dibuja la cinta si cambió (un cuadro nuevo, otro tamaño u otro idioma). */
  function drawTape() {
    if (!tapeCard.open) return;
    const w = tapeBox.clientWidth;
    const h = tapeBox.clientHeight;
    if (w < 2 || h < 2) return;
    const key = `${tapeVersion}|${w}x${h}|${i18n.language}`;
    if (key === tapeDrawn) return;
    tapeDrawn = key;
    const dpr = window.devicePixelRatio || 1;
    if (tapeCanvas.width !== Math.round(w * dpr) || tapeCanvas.height !== Math.round(h * dpr)) {
      tapeCanvas.width = Math.round(w * dpr);
      tapeCanvas.height = Math.round(h * dpr);
      tapeCanvas.style.width = `${w}px`;
      tapeCanvas.style.height = `${h}px`;
    }
    const ctx = tapeCtx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const sensorsCount = world.perception.sensors.length;
    const { rows, named } = tapeRows(sensorsCount, h);
    const labelW = 36;
    const plotW = w - labelW;
    const { columns } = tapeColumns(tape.frames, plotW, tape.capacity);
    const slots = Math.min(tape.capacity, Math.floor(plotW));
    const colW = plotW / slots;
    const inColor = cssVar('--color-role-in');
    const outColor = cssVar('--color-role-out');
    const bg = cssVar('--color-surface-2');
    const muted = cssVar('--color-text-muted');
    // Fondo de cada fila y nombres.
    ctx.font = `12px ${cssVar('--font') || 'sans-serif'}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    for (const r of rows) {
      if (r.kind === 'gap') continue;
      ctx.fillStyle = bg;
      ctx.fillRect(labelW, r.y + 0.5, plotW, Math.max(1, r.h - 1));
      const label = r.kind === 'sensor' ? (named ? i18n.t('drive.tape.sensor', { n: r.index + 1 }) : '')
        : r.kind === 'speed' ? i18n.t('drive.tape.speed') : i18n.t(`drive.action.${r.action}.key`);
      if (label && r.h >= 9) { ctx.fillStyle = muted; ctx.fillText(label, labelW - 6, r.y + r.h / 2); }
    }
    // Columnas: la percepción con la intensidad de la lectura; las acciones, llenas en los cuadros en "sí".
    const n = columns.length;
    columns.forEach((c, i) => {
      const x = labelW + plotW - (n - i) * colW;
      for (const r of rows) {
        if (r.kind === 'sensor' || r.kind === 'speed') {
          const v = r.kind === 'speed' ? Math.abs(c.speed) : c.sensors[r.index];
          if (v <= 0.01) continue;
          ctx.globalAlpha = Math.min(1, v);
          ctx.fillStyle = inColor;
          ctx.fillRect(x, r.y + 0.5, colW + 0.5, Math.max(1, r.h - 1));
        } else if (r.kind === 'action' && c.controls[TAPE_ACTIONS[r.index]]) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = outColor;
          ctx.fillRect(x, r.y + 1, colW + 0.5, Math.max(1, r.h - 2));
        }
      }
    });
    ctx.globalAlpha = 1;
    // Choque: una marca en la última columna.
    if (tape.frozen && n > 0) {
      const x = labelW + plotW - colW;
      ctx.fillStyle = cssVar('--color-state-crash');
      ctx.fillRect(x - 1, 0, Math.max(2, colW + 1), h);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.font = `bold 12px ${cssVar('--font') || 'sans-serif'}`;
      ctx.fillText(i18n.t('drive.tape.crash'), x - 4, 2);
    }
  }

  board.append(strip.node, perceptionCard.node, actionCard.node, tapeCard.node);

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
    onReset: () => {
      applySettings({ ...DEFAULT_SETTINGS }, { countAttempt: true });
      // Si el tráfico había cambiado en marcha, vuelve el de la semilla: el mismo que al abrir (trafico-vivo).
      if (world.traffic.layers) restartAttempt({ countAttempt: true });
    },
  });
  bar?.append(scenario.node);

  panel.append(
    el('h1', { class: 'sr-only', i18n: 'drive.title' }),
    card.node, createGuideMore(intro), viewRow, missions);

  // --- Mensajes sobre el escenario ---------------------------------------------------
  const pauseBadge = el('div', { class: 'stage-badge pause-badge', i18n: 'drive.paused', attrs: { role: 'status' } });
  const machineBadge = el('div', { class: 'stage-badge machine-badge', i18n: 'drive.machine.badge' });
  const crashBody = el('p', {});
  const crashRestart = button('drive.restart', 'drive.restart', restart);
  const crashHowto = el('p', { i18n: 'drive.crash.howto' });
  const crashBox = el('div', { class: 'crash-box', attrs: { role: 'alert', 'data-state': 'crash' } },
    el('h2', { i18n: 'drive.crash.title' }),
    crashBody,
    crashHowto,
    crashRestart);
  const badges = el('div', { class: 'stage-badges' }, pauseBadge, machineBadge);
  // Cartel de primer manejo (manejo-amable D3): con la guía, al entrar a la pestaña, hasta la primera tecla de manejo.
  // Sin botón y sin tomar el foco; con el estilo del cartel de largada de Competir.
  const howto = el('div', { class: 'guide start-layer drive-howto-layer' },
    el('div', { class: 'start-card drive-howto', attrs: { role: 'note' } }, el('p', { class: 'start-card-text', i18n: 'drive.howto' })));
  stage.append(howto);
  function onDrivingKey(e) {
    if (howto.hidden || !KEY_BINDINGS[e.code] || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!keyAllowed(e.code) || isTypingTarget(e.target)) return;
    howto.hidden = true;
  }
  window.addEventListener('keydown', onDrivingKey);
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

    // Misiones: la lista y, en la tarjeta, la primera sin cumplir (en un circuito no hay misiones).
    const current = currentMission(session.missions, { available: !circuit });
    for (const m of session.missions) {
      writeMissionRow(missionRows.find((x) => x.id === m.id), describeMission(m), m.id === current?.id, setText);
    }
    card.setConsigna(circuit ? 'consigna.drive.circuit' : 'consigna.drive');
    card.setMission(current && !current.allDone ? { ...describeMission(current), reveal: missionReveal.has(current.id) } : current);

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
    // Acción principal (jerarquia-de-botones D3): la marcha, o Reiniciar del aviso con un choque a la vista.
    applyMainAction({ run: pauseButton, restart: crashRestart }, mainAction('drive', { crashed }));
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
      // La cinta guarda lo que se percibía antes del paso y lo que el controlador devolvió en él (manejo-amable D2).
      const before = world.steps;
      const perception = world.perception;
      world.step();
      if (world.steps !== before) {
        const c = keyboard.control(); // lo que devolvió el controlador en este paso (lo apretado)
        if (!tapeStarted && (c.forward || c.reverse || c.left || c.right || world.car.speed !== 0)) tapeStarted = true;
      }
      if (world.steps !== before && tapeStarted) {
        tape.push({ sensors: perception.sensors, speed: perception.speed, controls: keyboard.control() });
        if (world.crashed) tape.freeze();
        tapeVersion += 1;
      }
      session.observe(world, { machineView: options.machineView && !world.crashed, missions: !world.track.closed });
    },
    render: () => {
      view.render(world, {
        showSensors: options.showSensors || options.machineView,
        machineView: options.machineView && !world.crashed,
      });
      sync();
      drawTape();
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
    view, options, loop, session, tape,
    get world() { return world; },
    get settings() { return { ...settings }; },
    get seed() { return seed; },
    restart, newTraffic, togglePause,
    unmount() {
      loop.dispose();
      offLanguage();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('keydown', onDrivingKey);
      tapeObserver.disconnect();
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
