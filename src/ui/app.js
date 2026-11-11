// Estructura común de la app: barra de pestañas, selector de idioma, interruptor de guía,
// créditos, disposición escenario/panel (con el panel ajustable arrastrando su borde), aviso
// de ventana angosta y manejo de fallas.
//
// Cada pestaña es un módulo con mount(ctx) que devuelve { unmount() }.
//   ctx = { stage, panel, i18n, store, library, reportError }
// La biblioteca de cerebros es una sola para toda la app: se crea al arrancar (design.md D8).
// La lista de pestañas (incluidas las aún no disponibles) la entrega quien arranca la app.
import { el } from './dom.js';
import { createStore } from './store.js';
import { LANGUAGES } from './i18n.js';
import { PANEL_WIDTH, clampPanelWidth, maxPanelWidth } from './layout.js';
import { MAX_SPEED } from '../core/constants.js';
import { createLibrary } from './library.js';

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
  });
  store.subscribe((state, prev) => { if (state.carSpeed !== prev.carSpeed) preferences.carSpeed = state.carSpeed; });

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
    el('div', { class: 'tools' }, guideSwitch, languageGroup, creditsButton));

  // --- Disposición común: escenario a la izquierda, panel a la derecha ----
  const stage = el('section', { class: 'stage', i18nAttr: 'aria-label:app.stage', attrs: { tabindex: '-1' } });
  const panel = el('aside', { class: 'panel', i18nAttr: 'aria-label:app.panel', attrs: { id: 'panel' } });
  // Borde del panel: se arrastra (o se mueve con las flechas) para agrandarlo o achicarlo.
  const splitter = el('div', {
    class: 'splitter', help: 'panel.resize',
    i18nAttr: 'aria-label:app.panel.resize',
    attrs: { role: 'separator', tabindex: '0', 'aria-orientation': 'vertical', 'aria-controls': 'panel' },
  });
  const workspace = el('main', { class: 'workspace' }, stage, splitter, panel);

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

  const shell = el('div', { class: 'app' }, header, workspace, narrow, credits, errorBox);
  root.replaceChildren(shell);

  // --- Ancho del panel -------------------------------------------------------------
  let panelWidth = clampPanelWidth(preferences.panelWidth ?? PANEL_WIDTH.default, window.innerWidth);

  function applyPanelWidth(width, { save = false } = {}) {
    panelWidth = clampPanelWidth(width, window.innerWidth);
    shell.style.setProperty('--panel-width', `${panelWidth}px`);
    splitter.setAttribute('aria-valuenow', String(panelWidth));
    splitter.setAttribute('aria-valuemin', String(PANEL_WIDTH.min));
    splitter.setAttribute('aria-valuemax', String(maxPanelWidth(window.innerWidth)));
    if (save) preferences.panelWidth = panelWidth;
  }

  let resizing = null;
  function onSplitterDown(e) {
    if (e.button !== 0) return;
    e.preventDefault(); // sin selección de texto ni foco: tras arrastrar, las flechas vuelven a manejar
    resizing = { id: e.pointerId };
    splitter.setPointerCapture(e.pointerId);
    shell.classList.add('resizing');
  }
  function onSplitterMove(e) {
    if (!resizing || e.pointerId !== resizing.id) return;
    applyPanelWidth(workspace.getBoundingClientRect().right - e.clientX - splitter.offsetWidth / 2);
  }
  function onSplitterUp(e) {
    if (!resizing || e.pointerId !== resizing.id) return;
    resizing = null;
    shell.classList.remove('resizing');
    applyPanelWidth(panelWidth, { save: true });
    stage.focus({ preventScroll: true });
  }
  function onSplitterKey(e) {
    const by = {
      ArrowLeft: panelWidth + PANEL_WIDTH.step, // el borde se mueve a la izquierda: panel más ancho
      ArrowRight: panelWidth - PANEL_WIDTH.step,
      Home: PANEL_WIDTH.min,
      End: maxPanelWidth(window.innerWidth),
      Enter: PANEL_WIDTH.default,
    };
    if (!(e.key in by)) return;
    e.preventDefault();
    applyPanelWidth(by[e.key], { save: true });
  }
  splitter.addEventListener('pointerdown', onSplitterDown);
  splitter.addEventListener('pointermove', onSplitterMove);
  splitter.addEventListener('pointerup', onSplitterUp);
  splitter.addEventListener('pointercancel', onSplitterUp);
  splitter.addEventListener('dblclick', () => applyPanelWidth(PANEL_WIDTH.default, { save: true }));
  splitter.addEventListener('keydown', onSplitterKey);
  // Si la ventana se achica, el panel se ajusta sin perder el ancho elegido: al agrandarla vuelve a él.
  // (Se observa el tamaño de la app y no el evento resize, que no llega en todos los casos.)
  new window.ResizeObserver(() => applyPanelWidth(preferences.panelWidth ?? PANEL_WIDTH.default)).observe(shell);
  applyPanelWidth(panelWidth);

  // --- Comportamiento ---------------------------------------------------------
  let active = null; // { id, instance }

  function render() {
    const { guide, activeTab } = store.get();
    shell.dataset.guide = guide ? 'on' : 'off';
    guideSwitch.setAttribute('aria-checked', String(guide));
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

  const ctxFor = () => ({ stage, panel, i18n, store, library, reportError });

  function mount(id) {
    const tab = tabs.find((t) => t.id === id);
    stage.replaceChildren();
    panel.replaceChildren();
    const instance = tab.module.mount(ctxFor());
    active = { id, instance };
    i18n.translateTree(workspace);
  }

  function unmount() {
    if (!active) return;
    const { instance } = active;
    active = null;
    try { instance?.unmount?.(); } catch (err) { console.error(err); }
    stage.replaceChildren();
    panel.replaceChildren();
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
    store, stage, panel, library, openTab, reportError, restartTab,
    get activeTab() { return active?.id ?? null; },
    get instance() { return active?.instance ?? null; },
  };
}
