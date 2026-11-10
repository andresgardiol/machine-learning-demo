// Estructura común de la app: barra de pestañas, selector de idioma, interruptor de guía,
// créditos, disposición escenario/panel, aviso de ventana angosta y manejo de fallas.
//
// Cada pestaña es un módulo con mount(ctx) que devuelve { unmount() }.
//   ctx = { stage, panel, i18n, store, reportError }
// La lista de pestañas (incluidas las aún no disponibles) la entrega quien arranca la app.
import { el } from './dom.js';
import { createStore } from './store.js';
import { LANGUAGES } from './i18n.js';

export const COURSE_URL = 'https://www.youtube.com/watch?v=Rs_rAxEsAvI';

/**
 * @param {{root: HTMLElement, tabs: {id:string, module?:{mount:Function}}[], i18n: object, preferences: object}} spec
 */
export function createApp({ root, tabs, i18n, preferences }) {
  const store = createStore({ guide: preferences.guide, activeTab: tabs.find((t) => t.module)?.id ?? null });

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
  const panel = el('aside', { class: 'panel', i18nAttr: 'aria-label:app.panel' });
  const workspace = el('main', { class: 'workspace' }, stage, panel);

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
    el('p', { i18n: 'narrow.body', params: { width: 1024 } }));

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

  const ctxFor = () => ({ stage, panel, i18n, store, reportError });

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
    store, stage, panel, openTab, reportError, restartTab,
    get activeTab() { return active?.id ?? null; },
    get instance() { return active?.instance ?? null; },
  };
}
