// Estructura común de la app: barra de pestañas, selector de idioma, interruptor de guía,
// créditos, disposición en tres zonas (escenario, tablero y panel, con dos bordes ajustables),
// aviso de ventana angosta y manejo de fallas.
//
// Cada pestaña es un módulo con mount(ctx) que devuelve { unmount() }.
//   ctx = { stage, board, panel, bar, i18n, store, library, preferences, reportError }
// `bar` es la zona de la barra de escenario, debajo del encabezado y a todo el ancho
// (panel-de-entrenar-por-vistas D11); una pestaña que no la usa la deja vacía y no ocupa lugar.
// Una pestaña que no pone nada en `board` conserva la disposición de dos zonas (design.md D1).
// La biblioteca de cerebros es una sola para toda la app: se crea al arrancar (design.md D8).
// La lista de pestañas (incluidas las aún no disponibles) la entrega quien arranca la app.
import { el } from './dom.js';
import { createStore } from './store.js';
import { LANGUAGES } from './i18n.js';
import {
  PANEL_WIDTH, clampPanelWidth, maxPanelWidth, ZONES, layoutMode, fitZones, stageLimits, panelLimits,
} from './layout.js';
import { MAX_SPEED } from '../core/constants.js';
import { createLibrary } from './library.js';
import { setCharacterShortcuts } from './shortcuts.js';

/** Almacenamiento del navegador, o null si no está disponible (el acceso mismo puede fallar). */
function browserStorage() {
  try { return window.localStorage ?? null; } catch { return null; }
}

let idCounter = 0;
/** Identificador único para un cerebro nuevo. */
function newId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  idCounter += 1;
  return `brain-${Date.now().toString(36)}-${idCounter}`;
}

/** Por debajo de este ancho (px) se muestra el aviso de uso en escritorio; coincide con styles/app.css. */
export const NARROW_WIDTH = 600;

export const COURSE_URL = 'https://www.youtube.com/watch?v=Rs_rAxEsAvI';

/**
 * @param {{root: HTMLElement, tabs: {id:string, module?:{mount:Function}}[], i18n: object, preferences: object, library?: object}} spec
 */
export function createApp({ root, tabs, i18n, preferences, library: givenLibrary }) {
  const library = givenLibrary ?? createLibrary({ storage: browserStorage(), clock: () => Date.now(), newId });
  // carSpeed: velocidad máxima del auto, una sola para toda la app (las pestañas la leen y la cambian acá).
  const store = createStore({
    guide: preferences.guide,
    activeTab: tabs.find((t) => t.module)?.id ?? null,
    carSpeed: preferences.carSpeed ?? MAX_SPEED,
    scenery: preferences.scenery ?? true, // paisaje alrededor de la pista, igual en todas las pestañas
    shortcuts: preferences.shortcuts ?? true, // atajos de una tecla (panel-de-entrenar-por-vistas D9)
  });
  // Atajos de una tecla: los decide shortcutFrom y el teclado; los rótulos muestran o no su tecla.
  const applyShortcuts = (on) => { setCharacterShortcuts(on); i18n.setShortcutLabels?.(on); };
  applyShortcuts(store.get().shortcuts);
  store.subscribe((state, prev) => {
    if (state.shortcuts === prev.shortcuts) return;
    preferences.shortcuts = state.shortcuts;
    applyShortcuts(state.shortcuts);
  });
  store.subscribe((state, prev) => { if (state.carSpeed !== prev.carSpeed) preferences.carSpeed = state.carSpeed; });
  store.subscribe((state, prev) => { if (state.scenery !== prev.scenery) preferences.scenery = state.scenery; });

  // --- Barra de pestañas -------------------------------------------------
  const tabButtons = tabs.map((tab, index) => {
    const available = Boolean(tab.module);
    return el('button', {
      class: 'tab',
      i18n: `tab.${tab.id}`,
      help: available ? `tab.${tab.id}` : `tab.${tab.id}.soon`,
      attrs: {
        type: 'button', role: 'tab', id: `tab-${tab.id}`,
        'aria-disabled': available ? null : 'true',
        'aria-selected': 'false',
        'data-tab': tab.id,
      },
      dataset: { step: String(index + 1) },
      on: { click: () => openTab(tab.id) },
    });
  });
  const tabBar = el('nav', { class: 'tabbar', i18nAttr: 'aria-label:app.tabs', attrs: { role: 'tablist' } }, tabButtons);

  // --- Herramientas: guía, idioma, créditos -------------------------------
  const guideSwitch = el('button', {
    class: 'switch', help: 'guide',
    attrs: { type: 'button', role: 'switch', 'aria-checked': 'true', id: 'guide-switch' },
    on: { click: () => setGuide(!store.get().guide) },
  }, el('span', { class: 'switch-track', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: 'app.guide' }));

  // Interruptor "Atajos", junto al de guía: apaga los atajos de una sola tecla.
  const shortcutsSwitch = el('button', {
    class: 'switch', help: 'shortcuts',
    attrs: { type: 'button', role: 'switch', 'aria-checked': 'true', id: 'shortcuts-switch' },
    on: { click: () => store.set({ shortcuts: !store.get().shortcuts }) },
  }, el('span', { class: 'switch-track', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: 'app.shortcuts' }));

  const languageButtons = LANGUAGES.map((lang) => el('button', {
    class: 'lang-option', i18n: `language.${lang}`, help: 'language',
    i18nAttr: `aria-label:language.${lang}.name`,
    attrs: { type: 'button', 'aria-pressed': 'false', 'data-lang': lang, lang },
    on: { click: () => setLanguage(lang) },
  }));
  const languageGroup = el('div', { class: 'lang', i18nAttr: 'aria-label:app.language', attrs: { role: 'group' } }, languageButtons);

  const creditsButton = el('button', {
    class: 'tool', i18n: 'app.credits', help: 'credits',
    attrs: { type: 'button', 'aria-haspopup': 'dialog' },
    on: { click: () => openCredits() },
  });

  const header = el('header', { class: 'topbar' },
    el('div', { class: 'brand', i18n: 'app.title' }),
    tabBar,
    el('div', { class: 'tools' }, guideSwitch, shortcutsSwitch, languageGroup, creditsButton));

  // --- Disposición común: escenario, tablero y panel (en ese orden de foco) ----
  const stage = el('section', { class: 'stage', i18nAttr: 'aria-label:app.stage', attrs: { tabindex: '-1' } });
  const board = el('section', { class: 'board', i18nAttr: 'aria-label:app.board', attrs: { id: 'board' } });
  const panel = el('aside', { class: 'panel', i18nAttr: 'aria-label:app.panel', attrs: { id: 'panel' } });
  // Bordes: se arrastran (o se mueven con las flechas) para repartir el ancho entre las zonas.
  const stageSplitter = el('div', {
    class: 'splitter', help: 'stage.resize',
    i18nAttr: 'aria-label:app.stage.resize',
    attrs: { role: 'separator', tabindex: '0', 'aria-orientation': 'vertical', 'aria-controls': 'board', 'data-edge': 'stage' },
  });
  const splitter = el('div', {
    class: 'splitter', help: 'panel.resize',
    i18nAttr: 'aria-label:app.panel.resize',
    attrs: { role: 'separator', tabindex: '0', 'aria-orientation': 'vertical', 'aria-controls': 'panel', 'data-edge': 'panel' },
  });
  const workspace = el('main', { class: 'workspace' }, stage, stageSplitter, board, splitter, panel);
  const barZone = el('div', { class: 'scenario-zone' });

  // --- Créditos ------------------------------------------------------------
  const creditsTitle = el('h2', { i18n: 'credits.title', attrs: { id: 'credits-title' } });
  const credits = el('dialog', { class: 'credits', attrs: { 'aria-labelledby': 'credits-title' } },
    creditsTitle,
    el('p', { i18n: 'credits.body', params: { course: 'Self-driving Car', author: 'Radu Mariescu-Istodor' } }),
    el('p', {}, el('a', {
      i18n: 'credits.link', help: 'credits.link',
      attrs: { href: COURSE_URL, target: '_blank', rel: 'noopener noreferrer' },
    })),
    el('p', { class: 'muted', i18n: 'credits.note' }),
    el('button', { class: 'tool', i18n: 'credits.close', help: 'credits.close', attrs: { type: 'button' }, on: { click: () => credits.close() } }));

  // --- Aviso de ventana angosta ---------------------------------------------
  const narrow = el('div', { class: 'narrow-notice', attrs: { role: 'status' } },
    el('h2', { i18n: 'narrow.title' }),
    el('p', { i18n: 'narrow.body', params: { width: NARROW_WIDTH } }));

  // --- Mensaje de falla -------------------------------------------------------
  const restartButton = el('button', {
    class: 'tool primary', i18n: 'error.restart', help: 'error.restart',
    attrs: { type: 'button' }, on: { click: () => restartTab() },
  });
  const errorBox = el('div', { class: 'error-overlay', attrs: { role: 'alertdialog', 'aria-labelledby': 'error-title' } },
    el('div', { class: 'error-box' },
      el('h2', { i18n: 'error.title', attrs: { id: 'error-title' } }),
      el('p', { i18n: 'error.body' }),
      restartButton));
  errorBox.hidden = true;

  const shell = el('div', { class: 'app' }, header, barZone, workspace, narrow, credits, errorBox);
  root.replaceChildren(shell);

  // --- Anchos de las zonas (design.md D2 y D3) ----------------------------------------
  // `chosen`: lo que la persona eligió (y se recuerda); `shown`: lo que se muestra en esta ventana.
  const chosen = {
    stage: preferences.stageWidth ?? ZONES.stage.default,
    panel: preferences.panelWidth ?? PANEL_WIDTH.default,
  };
  const shown = { stage: chosen.stage, panel: chosen.panel };
  let hasBoard = false; // la pestaña montada puso contenido en el tablero
  // Zona izquierda propia de la pestaña montada (pestana-inspeccionar D1): { stageMin, stageDefault,
  // preference } que la pestaña declara en su módulo como ZONES; null para las que usan los anchos comunes.
  let zoneSpec = null;
  const commonStage = () => preferences.stageWidth ?? ZONES.stage.default;
  // Ancho de la app (el de la ventana): se lee del elemento observado para no depender del orden de los avisos.
  const windowWidth = () => shell.clientWidth || window.innerWidth;
  const mode = () => layoutMode(windowWidth(), hasBoard);

  const setVar = (name, px) => shell.style.setProperty(name, `${px}px`);
  function setAria(node, value, { min, max }) {
    node.setAttribute('aria-valuenow', String(value));
    node.setAttribute('aria-valuemin', String(min));
    node.setAttribute('aria-valuemax', String(max));
  }

  /** Límites del panel según la disposición: con tablero a lo ancho, también cuida al tablero y al escenario. */
  const panelRange = () => (mode() === 'wide'
    ? panelLimits(shown.stage, windowWidth(), zoneSpec ?? {})
    : { min: PANEL_WIDTH.min, max: maxPanelWidth(windowWidth()) });
  const stageRange = () => stageLimits(shown.panel, windowWidth(), zoneSpec ?? {});

  function refreshAria() {
    setAria(splitter, shown.panel, panelRange());
    if (mode() === 'wide') setAria(stageSplitter, shown.stage, stageRange());
  }

  /** Recalcula lo que se muestra a partir de lo elegido (al arrancar, al cambiar la ventana o la pestaña). */
  function layout() {
    hasBoard = board.childElementCount > 0;
    const W = windowWidth();
    const m = mode();
    shell.dataset.board = hasBoard ? 'on' : 'off';
    shell.dataset.layout = layoutMode(W, true);
    if (m === 'wide') {
      const z = fitZones(chosen, W, zoneSpec ?? {});
      shown.stage = z.stage;
      shown.panel = z.panel;
      setVar('--stage-width', shown.stage);
    } else {
      shown.panel = clampPanelWidth(chosen.panel, W);
    }
    setVar('--panel-width', shown.panel);
    refreshAria();
  }

  const clampTo = (width, { min, max }) => {
    const n = Number(width);
    const w = Number.isFinite(n) ? Math.round(n) : min;
    return Math.max(min, Math.min(w, max));
  };

  /**
   * Comportamiento de un borde: arrastre con el mouse, flechas, Home y End (mínimo y máximo), Enter y
   * doble clic (ancho inicial). `grows` es el lado hacia el que la zona crece: 'right' para el
   * escenario y 'left' para el panel. El ancho se guarda solo al soltar o al usar el teclado.
   */
  function makeSplitter({ node, read, limits, apply, save, defaultWidth: givenDefault, grows }) {
    const sign = grows === 'right' ? 1 : -1;
    const defaultWidth = () => (typeof givenDefault === 'function' ? givenDefault() : givenDefault);
    const set = (width, { persist = false } = {}) => {
      apply(clampTo(width, limits()));
      refreshAria();
      if (persist) save(read());
    };
    let drag = null;
    function onDown(e) {
      if (e.button !== 0) return;
      e.preventDefault(); // sin selección de texto ni foco: tras arrastrar, las flechas vuelven a manejar
      drag = { id: e.pointerId, x: e.clientX, width: read() };
      node.setPointerCapture(e.pointerId);
      shell.classList.add('resizing');
    }
    function onMove(e) {
      if (!drag || e.pointerId !== drag.id) return;
      set(drag.width + sign * (e.clientX - drag.x));
    }
    function onUp(e) {
      if (!drag || e.pointerId !== drag.id) return;
      drag = null;
      shell.classList.remove('resizing');
      set(read(), { persist: true });
      stage.focus({ preventScroll: true });
    }
    function onKey(e) {
      const { min, max } = limits();
      const by = {
        ArrowRight: read() + sign * ZONES.step,
        ArrowLeft: read() - sign * ZONES.step,
        Home: min,
        End: max,
        Enter: defaultWidth(),
      };
      if (!(e.key in by)) return;
      e.preventDefault();
      set(by[e.key], { persist: true });
    }
    node.addEventListener('pointerdown', onDown);
    node.addEventListener('pointermove', onMove);
    node.addEventListener('pointerup', onUp);
    node.addEventListener('pointercancel', onUp);
    node.addEventListener('dblclick', () => set(defaultWidth(), { persist: true }));
    node.addEventListener('keydown', onKey);
  }

  makeSplitter({
    node: stageSplitter,
    read: () => shown.stage,
    limits: stageRange,
    apply: (w) => { shown.stage = w; setVar('--stage-width', w); },
    save: (w) => {
      chosen.stage = w;
      if (zoneSpec) preferences[zoneSpec.preference] = w;
      else preferences.stageWidth = w;
    },
    // Enter y doble clic: el ancho inicial de la pestaña (en Inspeccionar, todo lo que sobra).
    defaultWidth: () => (zoneSpec ? fitZones({ stage: null, panel: shown.panel }, windowWidth(), zoneSpec).stage : ZONES.stage.default),
    grows: 'right',
  });
  makeSplitter({
    node: splitter,
    read: () => shown.panel,
    limits: panelRange,
    apply: (w) => { shown.panel = w; setVar('--panel-width', w); },
    save: (w) => { chosen.panel = w; preferences.panelWidth = w; },
    defaultWidth: PANEL_WIDTH.default,
    grows: 'left',
  });
  // Si la ventana se achica, las zonas se ajustan sin perder los anchos elegidos: al agrandarla vuelven.
  // (Se observa el tamaño de la app y además el evento resize, que no llega en todos los casos.)
  new window.ResizeObserver(() => layout()).observe(shell);
  window.addEventListener('resize', () => layout());
  layout();

  // --- Comportamiento ---------------------------------------------------------
  let active = null; // { id, instance }

  function render() {
    const { guide, activeTab } = store.get();
    shell.dataset.guide = guide ? 'on' : 'off';
    guideSwitch.setAttribute('aria-checked', String(guide));
    shortcutsSwitch.setAttribute('aria-checked', String(store.get().shortcuts));
    for (const b of tabButtons) {
      const selected = b.dataset.tab === activeTab;
      b.setAttribute('aria-selected', String(selected));
      b.tabIndex = 0;
    }
    for (const b of languageButtons) b.setAttribute('aria-pressed', String(b.dataset.lang === i18n.language));
  }

  function setGuide(on) {
    store.set({ guide: on });
    preferences.guide = on;
  }

  function setLanguage(lang) {
    i18n.setLanguage(lang);
    preferences.language = i18n.language;
  }

  function openCredits() {
    if (!credits.open) credits.showModal();
  }

  const ctxFor = () => ({ stage, board, panel, bar: barZone, i18n, store, library, preferences, reportError });

  function mount(id) {
    const tab = tabs.find((t) => t.id === id);
    stage.replaceChildren();
    board.replaceChildren();
    panel.replaceChildren();
    barZone.replaceChildren();
    zoneSpec = tab.module.ZONES ?? null;
    chosen.stage = zoneSpec ? (preferences[zoneSpec.preference] ?? null) : commonStage();
    const instance = tab.module.mount(ctxFor());
    active = { id, instance };
    layout();
    i18n.translateTree(workspace);
    i18n.translateTree(barZone);
  }

  function unmount() {
    if (!active) return;
    const { instance } = active;
    active = null;
    try { instance?.unmount?.(); } catch (err) { console.error(err); }
    stage.replaceChildren();
    board.replaceChildren();
    panel.replaceChildren();
    barZone.replaceChildren();
    zoneSpec = null;
    chosen.stage = commonStage();
    layout();
  }

  function openTab(id) {
    const tab = tabs.find((t) => t.id === id);
    if (!tab || !tab.module) return; // no disponible: la pestaña activa no cambia
    if (active?.id === id) return;
    unmount();
    store.set({ activeTab: id });
    safely(() => mount(id));
  }

  // Ante una falla: se detiene la pestaña (para que no siga fallando) y se ofrece reiniciar.
  let failed = false;
  function reportError(err) {
    console.error(err);
    if (failed) return;
    failed = true;
    unmount();
    errorBox.hidden = false;
    i18n.translateTree(errorBox);
    restartButton.focus({ focusVisible: false });
  }

  function safely(fn) {
    try { fn(); } catch (err) { reportError(err); }
  }

  function restartTab() {
    errorBox.hidden = true;
    failed = false;
    unmount();
    safely(() => mount(store.get().activeTab));
    stage.focus({ preventScroll: true });
  }

  const onWindowError = (e) => reportError(e.error ?? e.message);
  const onRejection = (e) => reportError(e.reason);
  window.addEventListener('error', onWindowError);
  window.addEventListener('unhandledrejection', onRejection);

  store.subscribe(render);
  i18n.onChange(render);
  render();
  i18n.translateTree(shell);
  if (store.get().activeTab) safely(() => mount(store.get().activeTab));

  return {
    store, stage, board, panel, bar: barZone, library, openTab, layout, reportError, restartTab,
    get activeTab() { return active?.id ?? null; },
    get instance() { return active?.instance ?? null; },
  };
}
