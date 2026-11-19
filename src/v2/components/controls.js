// Componentes de la V2 (tarea 8.1, design.md D-elegida): botón en cuatro niveles, deslizador, grupo de
// segmentos, interruptor, hoja en grilla, grupo con título, nota de misión con "Mostrame", término
// definido al margen, rótulo "de esta etapa", aviso con "Deshacer" y la banda del contrato.
// Todos los textos salen de los diccionarios (data-i18n) y todo control lleva su tooltip (data-help).
import { el, setAttr, tr } from '../dom.js';
import { createUndo, UNDO_MS, clampStep } from './logic.js';

/**
 * Botón en cuatro niveles: 'primary' (la acción principal, una por pantalla), 'secondary', 'tertiary'
 * (enlace) y 'small'. `key` muestra la tecla del atajo (se oculta con los atajos apagados).
 */
export function button({ level = 'secondary', labelKey, help, key = null, keyKey = null, onClick, attrs = {}, ariaLabelKey = null }) {
  const cls = { primary: 'v2-btn v2-primary', secondary: 'v2-btn', tertiary: 'v2-btn v2-tertiary', small: 'v2-btn v2-small' }[level];
  return el('button', { class: cls, help, i18nAttr: ariaLabelKey ? `aria-label:${ariaLabelKey}` : undefined, attrs: { type: 'button', ...attrs }, on: { click: onClick } },
    labelKey ? el('span', { i18n: labelKey }) : null,
    keyKey ? el('kbd', { class: 'v2-key', attrs: { 'aria-hidden': 'true' }, i18n: keyKey }) : key ? el('kbd', { class: 'v2-key', attrs: { 'aria-hidden': 'true' }, text: key }) : null);
}

/** Deslizador con su valor a la vista. `format(v)` devuelve el texto del valor (números según el idioma). */
export function slider({ labelKey, help, min, max, step = 1, value, format = String, onInput, dataset = {} }) {
  const out = el('output', { class: 'v2-value' });
  const input = el('input', { attrs: { type: 'range', min, max, step, value }, dataset });
  const label = el('label', { class: 'v2-setting', help }, el('span', { class: 'v2-setting-name', i18n: labelKey }), input, out);
  const set = (v, notify = false) => {
    const c = clampStep(v, { min, max, step });
    if (Number(input.value) !== c) input.value = String(c);
    out.textContent = format(c);
    if (notify) onInput?.(c);
  };
  input.addEventListener('input', () => set(input.value, true));
  set(value);
  return { element: label, input, set, get value() { return Number(input.value); } };
}

/** Grupo de segmentos (una opción elegida). */
export function segments({ labelKey, help, options, value, onChange, wide = false }) {
  const group = el('div', { class: 'v2-segments', attrs: { role: 'group' }, i18nAttr: labelKey ? `aria-label:${labelKey}` : undefined });
  const buttons = options.map((o) => el('button', {
    class: 'v2-segment', i18n: o.labelKey, attrs: { type: 'button', 'aria-pressed': 'false', 'data-value': String(o.value) },
    text: o.labelKey ? undefined : String(o.text ?? o.value),
    dataset: o.dataset ?? {},
    on: { click: () => { set(o.value); onChange?.(o.value); } },
  }));
  group.append(...buttons);
  const wrap = el('div', { class: `v2-setting${wide ? ' v2-wide' : ''}`, help }, labelKey ? el('span', { class: 'v2-setting-name', i18n: labelKey }) : null, group);
  function set(v) { for (const b of buttons) setAttr(b, 'aria-pressed', String(b.dataset.value === String(v))); }
  set(value);
  return { element: wrap, set, buttons };
}

/** Interruptor con nombre. */
export function toggle({ labelKey, help, value, onChange, dataset = {} }) {
  const b = el('button', {
    class: 'v2-switch', help, attrs: { type: 'button', role: 'switch', 'aria-checked': String(!!value) }, dataset,
    on: { click: () => { const v = b.getAttribute('aria-checked') !== 'true'; set(v); onChange?.(v); } },
  }, el('span', { class: 'v2-switch-track', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: labelKey }));
  const set = (v) => setAttr(b, 'aria-checked', String(!!v));
  return { element: b, set };
}

/** Hoja en grilla de dos o tres columnas. */
export const grid = (cols, ...children) => el('div', { class: `v2-grid v2-grid-${cols}` }, ...children);

/** Grupo de una hoja, con su título y, si hace falta, el rótulo "de esta etapa" o "compartido". */
export function group({ titleKey, tagKey = null, guideOnly = false }, ...children) {
  return el('section', { class: `v2-group${guideOnly ? ' v2-guide-only' : ''}` },
    titleKey ? el('h3', {}, el('span', { i18n: titleKey }), tagKey ? ' ' : null, tagKey ? stageTag(tagKey) : null) : null, ...children);
}

/** Rótulo "de esta etapa" (o "compartido por todas las etapas"). */
export const stageTag = (key = 'tag.stage') => el('em', { class: 'v2-tag', i18n: key });

/** Término definido al margen, con su nombre real (spec *Vocabulario escalonado*). */
export const term = ({ termKey, defKey }) => el('p', { class: 'v2-definition' }, el('dfn', { i18n: termKey }), ': ', el('span', { i18n: defKey }));

/** Nota de misión con su progreso y "Mostrame" (la nota se oculta con la guía; la pregunta no). */
export function missionNote({ i18n, onReveal }) {
  const name = el('b');
  const count = el('span');
  const bar = el('i');
  const reveal = button({ level: 'tertiary', labelKey: 'mission.show', help: 'mission.show', onClick: () => onReveal?.() });
  const note = el('div', { class: 'v2-mission v2-guide-only' },
    el('p', {}, el('span', { i18n: 'mission.label' }), ': ', name),
    el('div', { class: 'v2-progress', attrs: { 'aria-hidden': 'true' } }, bar),
    el('p', { class: 'v2-row' }, count, reveal));
  return {
    element: note,
    set({ nameKey, params = {}, done, goal, countKey = 'mission.count', countParams = null, complete = false }) {
      tr(name, i18n, nameKey, params);
      tr(count, i18n, complete ? 'mission.done' : countKey, complete ? null : (countParams ?? { done, goal }));
      bar.style.width = `${Math.round(Math.min(1, goal ? done / goal : 0) * 100)}%`;
    },
  };
}

/**
 * Aviso con "Deshacer" (al menos 8 s). `show(messageKey, restore)` lo abre; vence solo.
 */
export function undoNotice({ i18n, now = () => Date.now(), schedule = (fn, ms) => setTimeout(fn, ms), clear = (id) => clearTimeout(id) } = {}) {
  const undo = createUndo({ ms: UNDO_MS, now });
  const message = el('span');
  const action = button({ level: 'tertiary', labelKey: 'undo.action', help: 'undo', onClick: () => { undo.use(); hide(); } });
  const box = el('div', { class: 'v2-undo', attrs: { role: 'status', hidden: true } }, message, action);
  let timer = null;
  function hide() { box.hidden = true; undo.dismiss(); if (timer) clear(timer); timer = null; }
  return {
    element: box,
    show(messageKey, restore, params = {}) {
      tr(message, i18n, messageKey, params);
      undo.offer(restore);
      box.hidden = false;
      if (timer) clear(timer);
      timer = schedule(hide, UNDO_MS);
    },
    hide,
    get open() { return undo.open; },
  };
}

/**
 * Banda del contrato (design.md D-elegida): lo que percibe (barras), lo que acciona como estado (no como
 * botón), las cifras y la marcha.
 */
export function contractBand({ i18n, outputs = ['forward', 'reverse', 'left', 'right'] } = {}) {
  const bars = el('div', { class: 'v2-bars', attrs: { 'aria-hidden': 'true' } });
  const perceive = el('div', { class: 'v2-contract' }, el('p', { class: 'v2-role v2-role-in' }, el('span', { i18n: 'role.in' }), ' · ', el('span', { i18n: 'role.perceives' })), bars);
  const lamps = outputs.map((o) => el('span', { class: 'v2-lamp', i18n: `output.${o}`, dataset: { output: o } }));
  const act = el('div', { class: 'v2-contract' }, el('p', { class: 'v2-role v2-role-out' }, el('span', { i18n: 'role.out' }), ' · ', el('span', { i18n: 'role.acts' })), el('div', { class: 'v2-lamps', attrs: { role: 'status' } }, lamps));
  const figures = el('div', { class: 'v2-figures' });
  const run = el('div', { class: 'v2-run' });
  let barEls = [];
  return {
    elements: [perceive, act, figures, run],
    perceive, act, figures, run,
    /** values: lecturas 0..1 de los sensores, más la velocidad 0..1 al final. */
    setPerception(values) {
      if (barEls.length !== values.length) {
        barEls = values.map((_, i) => el('i', { class: i === values.length - 1 ? 'v2-bar-speed' : '' }));
        bars.replaceChildren(...barEls);
      }
      values.forEach((v, i) => { const h = `${Math.round(12 + Math.max(0, Math.min(1, v)) * 88)}%`; if (barEls[i].style.height !== h) barEls[i].style.height = h; });
    },
    /** on: { forward, reverse, left, right } con booleanos. */
    setActions(on) { for (const l of lamps) setAttr(l, 'data-on', String(!!on[l.dataset.output])); },
    /** items: [{ labelKey, value }] ya formateados. */
    setFigures(items) {
      if (figures.children.length !== items.length) figures.replaceChildren(...items.map(() => el('div', {}, el('b'), el('span'))));
      items.forEach((it, i) => {
        const [b, s] = figures.children[i].children;
        if (b.textContent !== it.value) b.textContent = it.value;
        tr(s, i18n, it.labelKey);
      });
    },
  };
}
