// Etapa 1 de la V2, "El problema" (tareas 10.1 y 10.2; #problema de la maqueta D). La persona maneja
// con el teclado (el volante de la V1, volante-directo) y ve lo que perciben los sensores y lo que se
// acciona. La escena lleva la placa con la pregunta y las teclas destacadas (sin botón principal); la
// banda, la percepción, la acción como estado, las cifras y la marcha; el cuaderno, las hojas
// "Manejar" y "Escenario".
//
// La conducta sale de la lógica pura de la V1: el mundo del núcleo, el controlador de teclado, la
// sesión del intento con sus misiones (tabs/drive/session.js), los atajos (tabs/drive/shortcuts.js), los
// ajustes (tabs/drive/settings.js) y la cinta (tabs/drive/tape.js). La escena es la vista de la V1, con
// el brillo de la V2 encima.
import { createWorld } from '../../../core/world.js';
import { createKeyboardController, KEY_BINDINGS, keyAllowed, isTypingTarget } from '../../../input/keyboard.js';
import { createStageView } from '../../../render/view.js';
import { createLoop } from '../../../ui/loop.js';
import { formatFixed } from '../../../ui/i18n.js';
import { currentMission } from '../../../ui/current-mission.js';
import { drivingDescription } from '../../../tabs/shared/stage-text.js';
import { createDriveSession } from '../../../tabs/drive/session.js';
import { normalizeSettings, needsRestart, worldSpec, onCircuit, lapsShown } from '../../../tabs/drive/settings.js';
import { shortcutFor } from '../../../tabs/drive/shortcuts.js';
import { createTape, tapeColumns, tapeRows, TAPE_ACTIONS } from '../../../tabs/drive/tape.js';
import { readings } from '../../../tabs/shared/driving-logic.js';
import { el, tr } from '../../dom.js';
import { button, toggle, group, grid, missionNote, term, contractBand } from '../../components/controls.js';
import { mountScenarioSheet } from '../../components/scenario-sheet.js';
import { createGlow } from '../../render/glow.js';

export const DEFAULT_SEED = 1;
const STAGE = 'problema';

// Misiones cumplidas: siguen marcadas hasta cerrar la página (como en la V1).
const completedMissions = new Set();

export function mount({ zones, notebook, i18n, scenario, scenery = null }) {
  const { scene, plate, band } = zones;
  const doc = scene.ownerDocument;
  const win = doc.defaultView;
  let visible = false;

  // --- Mundo, teclado y sesión --------------------------------------------------------
  let settings = normalizeSettings(scenario.forStage(STAGE));
  let seed = DEFAULT_SEED;
  const keyboard = createKeyboardController({ accepts: () => visible });
  const makeWorld = () => createWorld({ ...worldSpec(settings, seed), controller: keyboard });
  let world = makeWorld();
  const session = createDriveSession({ completed: completedMissions });
  const options = { showSensors: true, machineView: false };

  // --- Escena: la vista de la V1 y el brillo de la V2 ----------------------------------
  const view = createStageView({ container: scene, store: scenery, doc });
  const sceneCtx = view.canvas.getContext('2d');
  const css = () => getComputedStyle(doc.documentElement);
  const glow = createGlow({ colors: () => ({ sensor: css().getPropertyValue('--color-sensor').trim(), headlight: css().getPropertyValue('--color-headlight').trim() }) });
  scene.setAttribute('tabindex', '-1');
  const description = el('p', { class: 'v2-sr-only', attrs: { id: 'v2-problema-description', 'data-free-text': '' } });
  scene.setAttribute('aria-describedby', description.id);
  scene.append(description);

  // Placa: la pregunta (la pone el armazón), la consigna y las teclas destacadas. Sin botón principal.
  const consigna = el('p', { class: 'v2-consigna' });
  const keys = el('p', { class: 'v2-keys', attrs: { 'data-v1': 'drive.action.steer' } },
    el('span', { class: 'v2-keycaps', attrs: { 'aria-hidden': 'true' } }, el('kbd', { text: '←' }), el('kbd', { text: '↑' }), el('kbd', { text: '→' }), el('kbd', { text: '↓' })),
    el('span', { i18n: 'problema.keys' }));
  plate.append(consigna, keys);

  // Mensajes sobre la escena: pausa y "ver como la máquina", en la esquina de la vista.
  const pauseBadge = el('div', { class: 'v2-badge', i18n: 'drive.paused', attrs: { role: 'status' } });
  const machineBadge = el('div', { class: 'v2-badge v2-badge-machine', i18n: 'drive.machine.badge' });
  view.corner.append(pauseBadge, machineBadge);

  // Cartel de primer manejo (con la guía), hasta la primera tecla de manejo.
  const howto = el('div', { class: 'v2-howto v2-guide-only', attrs: { role: 'note' } }, el('p', { i18n: 'drive.howto' }));
  scene.append(howto);
  function onDrivingKey(e) {
    if (!visible || howto.hidden || !KEY_BINDINGS[e.code] || e.ctrlKey || e.metaKey || e.altKey) return;
    if (!keyAllowed(e.code) || isTypingTarget(e.target)) return;
    howto.hidden = true;
  }

  // Choque: el aviso con "Reiniciar", la acción principal mientras se ve.
  const crashBody = el('p');
  const crashHowto = el('p', { class: 'v2-muted' });
  const crashRestart = button({ level: 'primary', labelKey: 'drive.restart', help: 'drive.restart', key: 'R', onClick: () => restart(), attrs: { 'data-v1': 'drive.restart' } });
  const crashBox = el('div', { class: 'v2-crash', attrs: { role: 'alert', 'data-state': 'crash' } },
    el('h2', { i18n: 'drive.crash.title' }), crashBody, crashHowto, crashRestart);
  const crashLayer = el('div', { class: 'v2-crash-layer', attrs: { hidden: true } }, crashBox);
  scene.append(crashLayer);

  // --- Banda: percibe, acciona, cifras y marcha ----------------------------------------
  const contract = contractBand({ i18n });
  contract.perceive.dataset.help = 'drive.perception';
  contract.perceive.dataset.v1 = 'drive.perception';
  // La lectura de cada barra con dos decimales (como la V1, hasta 12 sensores): esos números son todo lo que recibiría una máquina.
  const readingsRow = el('div', { class: 'v2-readings', attrs: { 'data-free-text': '' } });
  contract.perceive.append(readingsRow);
  let lastReadings = '';
  contract.act.dataset.help = 'drive.action';
  contract.act.dataset.v1 = 'drive.action';
  const pauseButton = button({ labelKey: 'drive.pause', help: 'drive.pause', keyKey: 'key.space', onClick: () => togglePause(), attrs: { 'aria-pressed': 'false', 'data-v1': 'drive.pause' } });
  const restartButton = button({ labelKey: 'drive.restart', help: 'drive.restart', key: 'R', onClick: () => restart(), attrs: { 'data-v1': 'drive.restart' } });
  contract.run.append(pauseButton, restartButton);
  band.append(...contract.elements);
  band.dataset.v1 = 'drive.stats';

  // --- Hoja "Manejar": misión, más sobre la etapa, Probá esto, vista y tráfico, la cinta -----------
  const drive = notebook.sheet('etapa', 'sheet.drive');
  drive.classList.add('v2-sheet-drive');
  const machineSwitch = toggle({ labelKey: 'drive.machine', help: 'drive.machine', value: options.machineView, dataset: { v1: 'drive.machine' },
    onChange: (v) => { options.machineView = v; sync(); } });
  const mission = missionNote({ i18n, onReveal: () => notebook.reveal(machineSwitch.element) });
  mission.element.dataset.v1 = 'mission.reveal';
  const missionReveal = mission.element.querySelector('.v2-tertiary');
  const missionsCircuit = el('p', { class: 'v2-muted v2-guide-only', i18n: 'drive.missions.circuit' });

  const moreText = el('p');
  const moreBody = el('div', { class: 'v2-more-body', attrs: { hidden: true, id: 'v2-problema-more' } }, moreText,
    term({ termKey: 'term.sensor', defKey: 'term.sensor.def' }), term({ termKey: 'term.perception', defKey: 'term.perception.def' }));
  const moreButton = el('button', { class: 'v2-more', help: 'stage.more', attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': moreBody.id, 'data-v1': 'guide.more' },
    on: { click: () => { const open = moreBody.hidden; moreBody.hidden = !open; moreButton.setAttribute('aria-expanded', String(open)); tapeSection.hidden = open; tapeDrawn = ''; } } },
  el('span', { i18n: 'stage.more' }));
  // Abierto, el texto ocupa el lugar de la cinta, así la hoja sigue sin desplazar.
  const more = el('div', { class: 'v2-guide-only' }, moreButton, moreBody);

  const tryGrid = grid(2);
  const traffic = mountScenarioSheet({ i18n, scenario, stage: STAGE, panel: tryGrid, keys: ['density', 'irregularity'], bare: true, v1: { density: 'drive.density', irregularity: 'drive.irregularity' } });
  const tryThis = group({ titleKey: 'level.try' }, tryGrid, el('div', { class: 'v2-row' }, machineSwitch.element));

  const sensorsSwitch = toggle({ labelKey: 'drive.sensors', help: 'drive.sensors', value: options.showSensors, dataset: { v1: 'drive.sensors' },
    onChange: (v) => { options.showSensors = v; sync(); } });
  const newTrafficButton = button({ level: 'small', labelKey: 'drive.newTraffic', help: 'drive.newTraffic', onClick: () => newTraffic(), attrs: { 'data-v1': 'drive.newTraffic' } });
  const viewGroup = group({ titleKey: 'problema.viewGroup' }, el('div', { class: 'v2-row' }, sensorsSwitch.element, newTrafficButton));

  // La cinta del manejo: los últimos 10 s de lo que percibía el auto y de lo que se accionó.
  const tape = createTape();
  let tapeVersion = 0;
  let tapeStarted = false;
  let tapeDrawn = '';
  const tapeCanvas = el('canvas', { class: 'v2-tape-canvas', attrs: { role: 'img' }, i18nAttr: 'aria-label:drive.tape.label' });
  const tapeBox = el('div', { class: 'v2-tape-box' }, tapeCanvas);
  const tapeSection = el('section', { class: 'v2-tape', help: 'drive.tape', attrs: { 'data-v1': 'drive.tape' } },
    el('h3', { i18n: 'drive.tape.title' }),
    el('p', { class: 'v2-definition v2-guide-only', i18n: 'drive.tape.guide' }),
    tapeBox);
  const tapeObserver = new win.ResizeObserver(() => { tapeDrawn = ''; });
  tapeObserver.observe(tapeBox);

  drive.append(mission.element, missionsCircuit, more, tryThis, viewGroup, tapeSection);

  // --- Hoja "Escenario": pista, carriles y velocidad, con "Restablecer escenario" --------------
  const scenarioSheet = mountScenarioSheet({
    i18n, scenario, stage: STAGE, panel: notebook.sheet('escenario', 'scenario.sheet'),
    keys: ['track', 'lanes', 'maxSpeed'], v1: { track: 'track', lanes: 'drive.lanes', maxSpeed: 'drive.maxSpeed', reset: 'drive.resetScenario' },
  });

  // --- Acciones del intento -------------------------------------------------------------
  function restartAttempt({ rebuild = false } = {}) {
    if (rebuild) {
      const paused = world.paused;
      world = makeWorld();
      if (paused) world.pause();
    } else {
      world.reset();
    }
    tape.clear();
    tapeStarted = false;
    tapeVersion += 1;
    session.restart();
    view.followCar();
    sync();
  }
  const restart = () => restartAttempt();
  function newTraffic() {
    if (onCircuit(settings)) return;
    seed += 1;
    restartAttempt({ rebuild: true });
  }
  function togglePause() {
    if (world.paused) world.resume();
    else world.pause();
    sync();
  }

  // El escenario compartido: la pista y los carriles reinician el intento; el resto se aplica en marcha.
  const offScenario = scenario.subscribe(() => {
    const before = settings;
    settings = normalizeSettings({ ...settings, ...scenario.forStage(STAGE) });
    if (needsRestart(before, settings)) { restartAttempt({ rebuild: true }); return; }
    if (settings.maxSpeed !== before.maxSpeed) world.setMaxSpeed(settings.maxSpeed);
    if (settings.density !== before.density || settings.irregularity !== before.irregularity) {
      world.setTraffic({ density: settings.density, irregularity: settings.irregularity });
    }
    sync();
  });

  // --- Sincronizar con el estado ----------------------------------------------------------
  const meters = (v) => ({ value: Math.floor(v) });
  const describeMission = (m) => ({
    nameKey: `drive.mission.${m.id}`, params: { goal: m.goal },
    countKey: `drive.mission.progress.${m.unit}`, countParams: { value: Math.floor(m.progress), goal: m.goal },
    done: m.progress, goal: m.goal,
  });
  let lastDescription = '';

  function sync() {
    const crashed = world.crashed;
    const circuit = world.track.closed;
    const t = i18n.t;

    // Placa y escena.
    tr(consigna, i18n, circuit ? 'consigna.drive.circuit' : 'consigna.drive');
    pauseBadge.hidden = !world.paused;
    machineBadge.hidden = !(options.machineView && !crashed);
    crashLayer.hidden = !crashed;
    if (crashed) {
      tr(crashBody, i18n, world.crashCause === 'vehicle' ? 'drive.crash.vehicle' : circuit ? 'drive.crash.edge.circuit' : 'drive.crash.edge', meters(session.distance));
      tr(crashHowto, i18n, circuit ? 'drive.crash.howto.circuit' : 'drive.crash.howto');
    }
    const text = drivingDescription({ t, track: settings.track, lanes: settings.lanes, paused: world.paused, crashed, meters: session.distance, machineView: options.machineView && !crashed });
    if (text !== lastDescription) { description.textContent = text; lastDescription = text; }

    // Banda.
    const p = world.perception;
    contract.setPerception([...p.sensors, Math.abs(p.speed)]);
    const r = readings(p);
    const fmt = (v) => formatFixed(v, 2, i18n.language);
    const texts = r.sensors ? [...r.sensors.map(fmt), fmt(r.speed)] : [];
    const joined = texts.join('|');
    if (joined !== lastReadings) {
      lastReadings = joined;
      if (readingsRow.children.length !== texts.length) readingsRow.replaceChildren(...texts.map(() => el('span')));
      texts.forEach((t, i) => { readingsRow.children[i].textContent = t; });
    }
    contract.setActions(keyboard.control());
    contract.setFigures([
      { labelKey: 'drive.stats.distance', value: t('drive.value.meters', meters(session.distance)) },
      circuit
        ? { labelKey: 'drive.stats.laps', value: t('drive.value.laps', { value: formatFixed(lapsShown(session.distance, world.track.length), 1, i18n.language) }) }
        : { labelKey: 'drive.stats.passed', value: t('drive.value.count', { value: session.passed }) },
      { labelKey: 'drive.stats.attempts', value: t('drive.value.count', { value: session.attempts }) },
      { labelKey: 'drive.stats.best', value: t('drive.value.meters', meters(session.best)) },
    ]);
    pauseButton.setAttribute('aria-pressed', String(world.paused));
    tr(pauseButton.querySelector('span'), i18n, world.paused ? 'drive.resume' : 'drive.pause');
    // Con el choque a la vista, la acción principal es el Reiniciar del aviso: el de la banda se oculta.
    restartButton.hidden = crashed;

    // Hoja "Manejar": la misión en curso; en un circuito no hay misiones ni tráfico (se ocultan).
    const current = currentMission(session.missions, { available: !circuit });
    mission.element.hidden = !current;
    missionsCircuit.hidden = !circuit;
    if (current?.allDone) mission.set({ nameKey: 'mission.allDone', done: 1, goal: 1, complete: true });
    else if (current) mission.set(describeMission(current));
    if (missionReveal) missionReveal.hidden = !(current && current.id === 'machine');
    for (const key of ['density', 'irregularity']) traffic.controls[key].element.hidden = circuit;
    scenarioSheet.controls.lanes.element.hidden = circuit;
    newTrafficButton.hidden = circuit;
    tr(moreText, i18n, circuit ? 'drive.guide.what.circuit' : 'drive.guide.what', circuit ? { track: t(`track.${settings.track}`) } : { lanes: settings.lanes });
    sensorsSwitch.set(options.showSensors);
    machineSwitch.set(options.machineView);
  }

  // --- La cinta ---------------------------------------------------------------------------
  function drawTape() {
    const w = tapeBox.clientWidth;
    const h = tapeBox.clientHeight;
    if (w < 2 || h < 2 || tapeBox.closest('[hidden]')) return;
    const key = `${tapeVersion}|${w}x${h}|${i18n.language}`;
    if (key === tapeDrawn) return;
    tapeDrawn = key;
    const dpr = win.devicePixelRatio || 1;
    if (tapeCanvas.width !== Math.round(w * dpr) || tapeCanvas.height !== Math.round(h * dpr)) {
      tapeCanvas.width = Math.round(w * dpr);
      tapeCanvas.height = Math.round(h * dpr);
      tapeCanvas.style.width = `${w}px`;
      tapeCanvas.style.height = `${h}px`;
    }
    const ctx = tapeCanvas.getContext('2d');
    const style = css();
    const v = (name) => style.getPropertyValue(name).trim();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    const { rows, named } = tapeRows(world.perception.sensors.length, h);
    const labelW = 36;
    const plotW = w - labelW;
    const { columns } = tapeColumns(tape.frames, plotW, tape.capacity);
    const slots = Math.min(tape.capacity, Math.floor(plotW));
    const colW = plotW / slots;
    const font = v('--a-fuente-texto') || 'sans-serif';
    ctx.font = `12px ${font}`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    for (const r of rows) {
      if (r.kind === 'gap') continue;
      ctx.fillStyle = v('--color-surface-2');
      ctx.fillRect(labelW, r.y + 0.5, plotW, Math.max(1, r.h - 1));
      const label = r.kind === 'sensor' ? (named ? i18n.t('drive.tape.sensor', { n: r.index + 1 }) : '')
        : r.kind === 'speed' ? i18n.t('drive.tape.speed') : i18n.t(`drive.action.${r.action}.key`);
      if (label && r.h >= 9) { ctx.fillStyle = v('--color-text-muted'); ctx.fillText(label, labelW - 6, r.y + r.h / 2); }
    }
    const n = columns.length;
    columns.forEach((c, i) => {
      const x = labelW + plotW - (n - i) * colW;
      for (const r of rows) {
        if (r.kind === 'sensor' || r.kind === 'speed') {
          const value = r.kind === 'speed' ? Math.abs(c.speed) : c.sensors[r.index];
          if (value <= 0.01) continue;
          ctx.globalAlpha = Math.min(1, value);
          ctx.fillStyle = v('--color-sensor');
          ctx.fillRect(x, r.y + 0.5, colW + 0.5, Math.max(1, r.h - 1));
        } else if (r.kind === 'action' && c.controls[TAPE_ACTIONS[r.index]]) {
          ctx.globalAlpha = 1;
          ctx.fillStyle = v('--color-text');
          ctx.fillRect(x, r.y + 1, colW + 0.5, Math.max(1, r.h - 2));
        }
      }
    });
    ctx.globalAlpha = 1;
    if (tape.frozen && n > 0) {
      const x = labelW + plotW - colW;
      ctx.fillStyle = v('--color-state-crash');
      ctx.fillRect(x - 1, 0, Math.max(2, colW + 1), h);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.font = `bold 12px ${font}`;
      ctx.fillText(i18n.t('drive.tape.crash'), x - 4, 2);
    }
  }

  // --- Bucle --------------------------------------------------------------------------------
  function step() {
    const before = world.steps;
    const perception = world.perception;
    world.step();
    if (world.steps !== before) {
      const c = keyboard.control();
      if (!tapeStarted && (c.forward || c.reverse || c.left || c.right || world.car.speed !== 0)) tapeStarted = true;
      if (tapeStarted) {
        tape.push({ sensors: perception.sensors, speed: perception.speed, controls: c });
        if (world.crashed) tape.freeze();
        tapeVersion += 1;
      }
    }
    session.observe(world, { machineView: options.machineView && !world.crashed, missions: !world.track.closed });
  }
  function render() {
    const machineView = options.machineView && !world.crashed;
    view.render(world, { showSensors: options.showSensors || options.machineView, machineView });
    if (options.showSensors || options.machineView) {
      glow.draw(sceneCtx, { car: world.car, rays: world.rays, zoom: view.camera.zoom, dpr: win.devicePixelRatio || 1 });
    }
    sceneCtx.setTransform(1, 0, 0, 1, 0, 0);
    sync();
    drawTape();
  }
  const loop = createLoop({ step, render, onError: (err) => { console.error(err); } });

  // --- Atajos: R reinicia, espacio pausa (se apagan con los atajos) ---------------------------
  let handledSpace = false;
  function onKeyDown(e) {
    if (!visible) return;
    const action = shortcutFor(e);
    if (!action) return;
    e.preventDefault();
    if (action === 'pause') handledSpace = true;
    if (e.repeat) return;
    if (action === 'restart') restart();
    else togglePause();
  }
  function onKeyUp(e) {
    if (e.code === 'Space' && handledSpace) { handledSpace = false; e.preventDefault(); }
  }
  win.addEventListener('keydown', onKeyDown);
  win.addEventListener('keyup', onKeyUp);
  win.addEventListener('keydown', onDrivingKey);
  const offLanguage = i18n.onChange(() => { tapeDrawn = ''; lastDescription = ''; sync(); });

  sync();

  return {
    view, options, loop, session, tape,
    get world() { return world; },
    get settings() { return { ...settings }; },
    get seed() { return seed; },
    restart, newTraffic, togglePause,
    /** Avanza `n` pasos y dibuja (verificación desde la consola, aunque el navegador no pida cuadros). */
    advance(n = 1) { for (let i = 0; i < n; i += 1) step(); render(); },
    show() {
      visible = true;
      loop.start();
      scene.focus({ preventScroll: true });
    },
    hide() {
      visible = false;
      keyboard.releaseAll();
      loop.stop();
    },
    unmount() {
      loop.dispose();
      offLanguage?.();
      offScenario();
      traffic.dispose();
      scenarioSheet.dispose();
      win.removeEventListener('keydown', onKeyDown);
      win.removeEventListener('keyup', onKeyUp);
      win.removeEventListener('keydown', onDrivingKey);
      tapeObserver.disconnect();
      keyboard.dispose();
      view.dispose();
    },
  };
}
