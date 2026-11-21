// Armazón de la V2 (design.md D-elegida): barra superior, riel de etapas y, por etapa, las cuatro zonas
// fijas (escena con su placa de pregunta y acción, banda, cuaderno con hojas). Maneja la guía, las
// ayudas, los atajos, el idioma, el pliegue del cuaderno, las fallas de una etapa y la ventana angosta.
import { el } from '../dom.js';
import { STAGES, RAIL, stageById, pickStage, questionKey } from '../stages.js';
import { LANGUAGES } from '../../ui/i18n.js';
import { setCharacterShortcuts } from '../../input/keyboard.js';

export const NARROW_WIDTH = 600;

/**
 * @param {object} p
 * @param {HTMLElement} p.root
 * @param {Record<string, () => Promise<object>|object>} p.stageModules  módulo de cada etapa (los que faltan muestran "Por ahora, en la V1")
 */
export function createShell({ root, i18n, prefs, stageModules = {}, services = {}, win = window, doc = document }) {
  const html = doc.documentElement;
  const stages = new Map(); // id → { section, api, mounted, failed }
  let active = null;

  // ---------- barra superior ----------
  const sw = (key, on, onClick, id) => el('button', {
    class: 'v2-switch', help: key, attrs: { type: 'button', role: 'switch', 'aria-checked': String(on), id },
    on: { click: onClick },
  }, el('span', { class: 'v2-switch-track', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: `app.${key}` }));
  const guideSwitch = sw('guide', prefs.guide, () => setGuide(!prefs.guide), 'v2-guide');
  const hintsSwitch = sw('hints', prefs.hints, () => setHints(!prefs.hints), 'v2-hints');
  const shortcutsSwitch = sw('shortcuts', prefs.shortcuts, () => setShortcuts(!prefs.shortcuts), 'v2-shortcuts');
  const langButtons = LANGUAGES.map((lang) => el('button', {
    class: 'v2-lang', i18n: `language.${lang}`, i18nAttr: `aria-label:language.${lang}.name`, help: 'language',
    attrs: { type: 'button', 'aria-pressed': 'false', 'data-lang': lang, lang }, on: { click: () => setLanguage(lang) },
  }));
  const credits = el('dialog', { class: 'v2-dialog', attrs: { 'aria-labelledby': 'v2-credits-title' } },
    el('h2', { i18n: 'credits.title', attrs: { id: 'v2-credits-title' } }),
    el('p', { i18n: 'credits.body', params: { course: 'Self-driving Car', author: 'Radu Mariescu-Istodor' } }),
    el('p', {}, el('a', { i18n: 'credits.link', help: 'credits.link', attrs: { href: 'https://www.youtube.com/watch?v=Rs_rAxEsAvI', target: '_blank', rel: 'noopener' } })),
    el('p', { class: 'v2-muted', i18n: 'credits.note' }),
    el('button', { class: 'v2-btn', i18n: 'credits.close', help: 'credits.close', attrs: { type: 'button' }, on: { click: () => credits.close() } }));
  const header = el('header', { class: 'v2-bar' },
    el('span', { class: 'v2-brand' }, el('span', { i18n: 'app.title' }), el('span', { class: 'v2-version', i18n: 'app.version' })),
    el('div', { class: 'v2-tools' },
      el('span', { class: 'v2-guide-state', i18n: 'app.guideHidden', attrs: { 'aria-live': 'polite' } }),
      guideSwitch, hintsSwitch, shortcutsSwitch,
      el('div', { class: 'v2-langs', i18nAttr: 'aria-label:app.language', attrs: { role: 'group' } }, langButtons),
      el('button', { class: 'v2-link', i18n: 'app.credits', help: 'credits', attrs: { type: 'button', 'aria-haspopup': 'dialog' }, on: { click: () => credits.showModal() } }),
      el('a', { class: 'v2-link', i18n: 'app.backToV1', help: 'v1link', attrs: { href: '../', id: 'v2-back' } })));

  // ---------- recorrido (las cinco preguntas) ----------
  const journey = el('dialog', { class: 'v2-dialog v2-journey', attrs: { 'aria-labelledby': 'v2-journey-title' } },
    el('h2', { i18n: 'journey.title', attrs: { id: 'v2-journey-title' } }),
    el('p', { class: 'v2-muted', i18n: 'journey.body' }),
    el('ol', { class: 'v2-journey-list' }, RAIL.map((r) => el('li', {},
      el('a', { attrs: { href: `#${r.stages[0]}` }, help: 'stage', on: { click: (e) => { e.preventDefault(); journey.close(); open(r.stages[0]); } } },
        el('span', { class: 'v2-rail-num', text: String(r.number) }),
        el('span', {}, el('b', { i18n: `question.${r.group}` }), el('small', { i18n: `summary.${r.group}` })),
        el('em', { i18n: `next.${r.group}` }))))),
    el('button', { class: 'v2-btn', i18n: 'journey.close', help: 'journey.close', attrs: { type: 'button' }, on: { click: () => journey.close() } }));

  // ---------- riel ----------
  // "Teoría" (seccion-teoria D7, decisión 58): la misma sección que enlaza la V1, en otra pestaña para no
  // detener la etapa. A la altura de las etapas, con su nombre, pero no es una: va debajo de la última, separada
  // por una línea, con la marca ↗ de que abre otra página y sin estado "actual".
  function theoryLink() {
    const libro = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    libro.setAttribute('viewBox', '0 0 16 16');
    libro.setAttribute('aria-hidden', 'true');
    libro.setAttribute('class', 'v2-rail-book');
    libro.innerHTML = '<path d="M2 3.5c2-1 4-1 6 .5v9c-2-1.5-4-1.5-6-.5zM14 3.5c-2-1-4-1-6 .5v9c2-1.5 4-1.5 6-.5z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>';
    return el('a', { class: 'v2-rail-item v2-rail-theory', help: 'theorylink', attrs: { href: '../teoria/', target: '_blank', rel: 'noopener', id: 'v2-theory' } },
      libro, el('span', { class: 'v2-rail-name' }, el('span', { i18n: 'app.theory' }), el('span', { class: 'v2-rail-out', attrs: { 'aria-hidden': 'true' }, text: ' ↗' })));
  }
  const railLinks = new Map(); // stage id → elemento
  const rail = el('nav', { class: 'v2-rail', i18nAttr: 'aria-label:app.stages' },
    el('button', { class: 'v2-rail-item v2-rail-journey', help: 'journey', attrs: { type: 'button' }, on: { click: () => journey.showModal() } },
      el('span', { class: 'v2-rail-icon', attrs: { 'aria-hidden': 'true' }, text: '≡' }), el('span', { class: 'v2-rail-name', i18n: 'app.journey' })),
    RAIL.map((r) => {
      const main = el('a', {
        class: 'v2-rail-item', help: 'stage',
        attrs: { href: `#${r.stages[0]}`, 'data-group': r.group },
        on: { click: (e) => { e.preventDefault(); open(r.stages[0]); } },
      }, el('span', { class: 'v2-rail-num', text: String(r.number) }), el('span', { class: 'v2-rail-name', i18n: `stage.${r.group}` }),
      el('span', { class: 'v2-rail-question', i18n: `question.${r.group}`, attrs: { 'aria-hidden': 'true' } }));
      const items = [main];
      if (r.stages.length > 1) {
        for (const id of r.stages) {
          const sub = el('a', {
            class: 'v2-rail-item v2-rail-sub', help: `stage.${id}`,
            attrs: { href: `#${id}`, 'data-stage': id }, on: { click: (e) => { e.preventDefault(); open(id); } },
          }, el('span', { class: 'v2-rail-name', i18n: `stage.${id}` }));
          railLinks.set(id, sub);
          items.push(sub);
        }
      } else railLinks.set(r.stages[0], main);
      main.dataset.mainOf = r.stages.join(' ');
      // La pestaña de la V1 que cubre cada etapa (data-v1, para la prueba de paridad, tarea 16.1).
      for (const [id, link] of railLinks) if (r.stages.includes(id)) link.dataset.v1 = `tab.${stageById(id).v1Tab}`;
      return el('div', { class: 'v2-rail-group' }, items);
    }),
    theoryLink());

  // ---------- mesa, aviso de ventana angosta y de almacenamiento ----------
  const mesa = el('main', { class: 'v2-mesa' });
  const narrow = el('div', { class: 'v2-narrow', attrs: { role: 'alert' } },
    el('h2', { i18n: 'narrow.title' }), el('p', { i18n: 'narrow.body', params: { width: NARROW_WIDTH } }));
  const storageNote = el('p', { class: 'v2-storage', i18n: 'app.storageOff', attrs: { role: 'status' } });
  storageNote.hidden = prefs.storageWorks !== false;
  // Aviso de la primera vez: todo control explica qué hace (spec *Aviso de que hay ayuda*). Se cierra y se recuerda.
  const helpNotice = el('div', { class: 'v2-help-notice', attrs: { role: 'status' } },
    el('p', {}, el('b', { i18n: 'helpNotice.title' }), el('span', { i18n: 'helpNotice.body' })),
    el('button', { class: 'v2-btn', i18n: 'helpNotice.close', help: 'helpNotice.close', attrs: { type: 'button' }, on: { click: () => closeHelpNotice() } }));
  helpNotice.hidden = prefs.helpNoticeSeen;
  function closeHelpNotice() {
    prefs.helpNoticeSeen = true;
    const hadFocus = helpNotice.contains(doc.activeElement);
    helpNotice.hidden = true;
    services.tooltips?.hide();
    if (hadFocus) hintsSwitch.focus({ preventScroll: true });
  }

  root.append(el('div', { class: 'v2-app' }, header, rail, mesa, storageNote, helpNotice, narrow, credits, journey));

  // ---------- una etapa: sus zonas y su cuaderno ----------
  function buildStage(id) {
    const info = stageById(id);
    const scene = el('div', { class: 'v2-scene' });
    const plate = el('div', { class: 'v2-plate' },
      el('p', { class: 'v2-plate-stage' }, el('span', { text: `${info.number} · ` }), el('span', { i18n: `stage.${info.group}` }),
        info.sub ? el('span', { class: 'v2-plate-sub' }, ' · ', el('span', { i18n: `stage.${info.sub}` })) : null),
      el('h1', { class: 'v2-question', i18n: questionKey(id) }));
    const band = el('div', { class: 'v2-band' });
    const zone = el('div', { class: 'v2-zone' }, el('div', { class: 'v2-scene-zone' }, scene, plate), band);
    const tabs = el('div', { class: 'v2-sheets', i18nAttr: 'aria-label:notebook.sheets', attrs: { role: 'tablist' } });
    const sheetsHost = el('div', { class: 'v2-sheets-host' });
    const foldBtn = el('button', { class: 'v2-btn v2-tertiary', i18n: 'notebook.fold', help: 'notebook.fold', attrs: { type: 'button', 'aria-expanded': 'true' }, on: { click: () => setFolded(true) } });
    const notebook = el('aside', { class: 'v2-notebook', i18nAttr: 'aria-label:notebook.title' },
      el('div', { class: 'v2-notebook-head' }, el('h2', { i18n: 'notebook.title' }), foldBtn), tabs, sheetsHost);
    const tab = el('button', { class: 'v2-tab', i18n: 'notebook.open', help: 'notebook.open', attrs: { type: 'button', 'aria-expanded': 'false' }, on: { click: () => setFolded(false) } });
    const section = el('section', { class: 'v2-stage', attrs: { 'data-stage': id, hidden: true } }, zone, notebook, el('div', { class: 'v2-tab-host' }, tab));
    mesa.append(section);

    const sheets = new Map();
    function selectSheet(sheetId, { remember = true, focus = false } = {}) {
      if (!sheets.has(sheetId)) return false;
      for (const [sid, s] of sheets) {
        const on = sid === sheetId;
        s.button.setAttribute('aria-selected', String(on));
        s.button.tabIndex = on ? 0 : -1;
        s.panel.hidden = !on;
      }
      if (remember) prefs.setSheet(id, sheetId);
      if (focus) sheets.get(sheetId).button.focus();
      return true;
    }
    const notebookApi = {
      /** Agrega una hoja; la primera que se agrega es la de la etapa. */
      sheet(sheetId, labelKey) {
        const button = el('button', {
          class: 'v2-sheet-tab', i18n: labelKey, help: 'notebook.sheet',
          attrs: { type: 'button', role: 'tab', id: `v2-t-${id}-${sheetId}`, 'aria-controls': `v2-h-${id}-${sheetId}`, 'aria-selected': 'false', tabindex: '-1', 'data-sheet': sheetId },
          on: { click: () => selectSheet(sheetId), keydown: (e) => arrowKeys(e) },
        });
        const panel = el('div', { class: 'v2-sheet', attrs: { role: 'tabpanel', id: `v2-h-${id}-${sheetId}`, 'aria-labelledby': `v2-t-${id}-${sheetId}`, hidden: true, 'data-sheet': sheetId } });
        tabs.append(button);
        sheetsHost.append(panel);
        sheets.set(sheetId, { button, panel });
        return panel;
      },
      select: selectSheet,
      /** Abre la hoja y el cuaderno donde está el control, lo marca y le pasa el foco (spec *Misión que pide un ajuste de otra hoja*). */
      reveal(control) {
        const panel = control?.closest?.('.v2-sheet');
        if (panel) { setFolded(false); selectSheet(panel.dataset.sheet); }
        control.classList.remove('v2-revealed');
        void control.offsetWidth;
        control.classList.add('v2-revealed');
        (control.matches('button, input, select, textarea, a') ? control : control.querySelector('button, input, select, textarea, a'))?.focus({ preventScroll: false });
        setTimeout(() => control.classList.remove('v2-revealed'), 2400);
      },
      /** Abre la hoja recordada, o la primera. */
      restore() { selectSheet(prefs.sheet(id) && sheets.has(prefs.sheet(id)) ? prefs.sheet(id) : sheets.keys().next().value, { remember: false }); },
      get ids() { return [...sheets.keys()]; },
    };
    function arrowKeys(e) {
      const ids = [...sheets.keys()];
      const i = ids.indexOf(e.currentTarget.dataset.sheet);
      const next = e.key === 'ArrowRight' ? ids[(i + 1) % ids.length] : e.key === 'ArrowLeft' ? ids[(i - 1 + ids.length) % ids.length] : null;
      if (next) { e.preventDefault(); selectSheet(next, { focus: true }); }
    }
    return { section, zones: { scene, plate, band, zone }, notebook: notebookApi };
  }

  async function mountStage(id) {
    const entry = stages.get(id) ?? buildStage(id);
    stages.set(id, entry);
    entry.section.querySelector('.v2-failure')?.remove();
    try {
      const loader = stageModules[id] ?? (() => import('../stages/pending.js'));
      const mod = await loader();
      entry.api = await mod.mount({ id, info: stageById(id), zones: entry.zones, notebook: entry.notebook, i18n, prefs, shell: api, ...services });
      entry.notebook.restore();
      i18n.translateTree(entry.section);
      entry.failed = false;
    } catch (err) {
      console.error(err);
      entry.failed = true;
      entry.zones.scene.replaceChildren();
      const retry = el('button', { class: 'v2-btn', i18n: 'error.retry', help: 'error.retry', attrs: { type: 'button' }, on: { click: () => { failure.remove(); retryStage(id); } } });
      const failure = el('div', { class: 'v2-failure', attrs: { role: 'alert' } },
        el('p', { i18n: 'error.stage' }), el('p', { class: 'v2-muted', i18n: 'error.detail', params: { message: String(err?.message ?? err).slice(0, 140) } }), retry);
      entry.zones.scene.append(failure);
      i18n.translateTree(failure);
    }
    return entry;
  }
  async function retryStage(id) {
    const old = stages.get(id);
    old?.section.remove();
    stages.delete(id);
    const entry = await mountStage(id);
    if (active === id) { entry.section.hidden = false; entry.api?.show?.(); }
  }

  // ---------- abrir una etapa (recorrido libre, sin bloqueos) ----------
  async function open(id) {
    if (!stageById(id)) id = pickStage({});
    if (active && active !== id) {
      const prev = stages.get(active);
      prev?.api?.hide?.();
      if (prev) prev.section.hidden = true;
    }
    active = id;
    prefs.stage = id;
    html.dataset.stage = id;
    if (win.location.hash !== `#${id}`) win.history.replaceState(null, '', `#${id}`);
    for (const [sid, link] of railLinks) link.toggleAttribute('aria-current', sid === id);
    for (const main of rail.querySelectorAll('[data-main-of]')) {
      const inGroup = main.dataset.mainOf.split(' ').includes(id);
      main.classList.toggle('v2-current-group', inGroup);
      if (main.dataset.mainOf.split(' ').length === 1) main.toggleAttribute('aria-current', inGroup);
    }
    const entry = stages.get(id) ?? await mountStage(id);
    if (active !== id) return; // se pidió otra mientras cargaba
    entry.section.hidden = false;
    entry.api?.show?.();
  }

  // ---------- guía, ayudas, atajos, idioma, cuaderno ----------
  function setGuide(on) {
    prefs.guide = on;
    html.dataset.guide = on ? 'on' : 'off';
    guideSwitch.setAttribute('aria-checked', String(on));
  }
  function setHints(on) {
    prefs.hints = on;
    html.dataset.hints = on ? 'on' : 'off';
    hintsSwitch.setAttribute('aria-checked', String(on));
    if (!on) services.tooltips?.hide();
  }
  function setShortcuts(on) {
    prefs.shortcuts = on;
    html.dataset.shortcuts = on ? 'on' : 'off';
    shortcutsSwitch.setAttribute('aria-checked', String(on));
    setCharacterShortcuts(on);
    i18n.setShortcutLabels?.(on);
  }
  function setLanguage(lang) {
    prefs.language = lang;
    i18n.setLanguage(lang);
  }
  function setFolded(folded) {
    prefs.notebookFolded = folded;
    html.dataset.notebook = folded ? 'folded' : 'open';
    for (const b of mesa.querySelectorAll('.v2-notebook-head .v2-btn')) b.setAttribute('aria-expanded', String(!folded));
    for (const b of mesa.querySelectorAll('.v2-tab')) b.setAttribute('aria-expanded', String(!folded));
    // Los lienzos se adaptan solos (ResizeObserver de los pintores); se avisa a la etapa por si dibuja otra cosa.
    stages.get(active)?.api?.resize?.();
    if (!folded) stages.get(active)?.section.querySelector('.v2-sheet-tab[aria-selected="true"]')?.focus({ preventScroll: true });
    else stages.get(active)?.section.querySelector('.v2-tab')?.focus({ preventScroll: true });
  }
  function refreshLanguage() {
    html.lang = i18n.language;
    doc.title = `${i18n.t('app.title')} · ${i18n.t('app.version')}`;
    for (const b of langButtons) b.setAttribute('aria-pressed', String(b.dataset.lang === i18n.language));
    i18n.translateTree(doc.body);
  }
  i18n.onChange(refreshLanguage);

  // ---------- estado inicial ----------
  setGuide(prefs.guide);
  setHints(prefs.hints);
  setShortcuts(prefs.shortcuts);
  html.dataset.notebook = prefs.notebookFolded ? 'folded' : 'open';
  refreshLanguage();
  win.addEventListener('hashchange', () => { const id = win.location.hash.slice(1); if (stageById(id) && id !== active) open(id); });

  const api = {
    open, setFolded, setGuide, setHints, setShortcuts, setLanguage, closeHelpNotice,
    get active() { return active; },
    stage: (id) => stages.get(id),
    reveal: (control) => stages.get(active)?.notebook.reveal(control),
    stagesList: STAGES,
  };
  open(pickStage({ hash: win.location.hash, remembered: prefs.stage }));
  return api;
}
