// Tooltips "qué hace / por qué importa".
//
// Cada control declara su ayuda con data-help="id" (y, si el texto los usa, sus parámetros con
// data-help-params, en JSON). El contenido sale de los diccionarios:
//   help.<id>.what  -> qué hace
//   help.<id>.why   -> por qué importa
// Un único elemento flotante y escuchas delegadas en el documento (no una por control).
// Los controles no disponibles usan aria-disabled (no disabled), para seguir recibiendo
// eventos y poder explicar por qué no se pueden usar.
//
// Un área de escritura (textarea) es la excepción: el cursor descansa encima mientras se escribe, así
// que su tooltip no aparece al posar el cursor ni al hacer clic; solo al llegar con Tab, y se cierra
// apenas se escribe o se hace clic en ella.

export const SHOW_DELAY_MS = 400;
const GAP = 8;
const MARGIN = 8;

/** Controles donde se escribe texto largo: explican solo al llegar con el teclado. */
export const WRITING_AREA_SELECTOR = 'textarea';

/**
 * ¿Corresponde abrir el tooltip de un control?
 * @param {{cause: 'hover'|'focus', writingArea: boolean, keyboard: boolean, focusVisible?: boolean}} spec
 *   keyboard: el foco llegó con Tab; focusVisible: el navegador muestra el anillo de foco
 */
export function opensTooltip({ cause, writingArea, keyboard, focusVisible = keyboard }) {
  if (cause === 'hover') return !writingArea;
  // Con el foco, un área de escritura siempre muestra el anillo (también tras un clic): cuenta solo Tab.
  return writingArea ? keyboard : focusVisible;
}

export const helpKeys = (id) => ({ what: `help.${id}.what`, why: `help.${id}.why` });

/**
 * Ubica el tooltip completo dentro de la ventana sin tapar el control.
 * Prueba debajo, arriba, a la derecha y a la izquierda, en ese orden.
 * @param {{left:number, top:number, right:number, bottom:number}} anchor rectángulo del control
 * @param {{width:number, height:number}} size tamaño del tooltip
 * @param {{width:number, height:number}} viewport tamaño de la ventana
 * @returns {{left:number, top:number, placement:'below'|'above'|'right'|'left'}}
 */
export function placeTooltip(anchor, size, viewport, gap = GAP, margin = MARGIN) {
  const clamp = (v, min, max) => Math.min(Math.max(v, min), Math.max(min, max));
  const centerX = (anchor.left + anchor.right) / 2;
  const centerY = (anchor.top + anchor.bottom) / 2;
  const horizontal = clamp(centerX - size.width / 2, margin, viewport.width - margin - size.width);
  const vertical = clamp(centerY - size.height / 2, margin, viewport.height - margin - size.height);

  const below = anchor.bottom + gap;
  if (below + size.height <= viewport.height - margin) return { left: horizontal, top: below, placement: 'below' };
  const above = anchor.top - gap - size.height;
  if (above >= margin) return { left: horizontal, top: above, placement: 'above' };
  const right = anchor.right + gap;
  if (right + size.width <= viewport.width - margin) return { left: right, top: vertical, placement: 'right' };
  const left = anchor.left - gap - size.width;
  if (left >= margin) return { left, top: vertical, placement: 'left' };
  return { left: horizontal, top: clamp(below, margin, viewport.height - margin - size.height), placement: 'below' };
}

/**
 * Instala el sistema de tooltips en el documento.
 * @param {{doc?: Document, i18n: object, delay?: number}} spec
 * @returns {{hide: Function, dispose: Function, element: HTMLElement}}
 */
export function installTooltips({ doc = document, i18n, delay = SHOW_DELAY_MS }) {
  const win = doc.defaultView;
  const tip = doc.createElement('div');
  tip.className = 'tooltip';
  tip.id = 'tooltip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  const whatLabel = doc.createElement('span');
  whatLabel.className = 'tooltip-label';
  const what = doc.createElement('p');
  what.className = 'tooltip-what';
  const whyLabel = doc.createElement('span');
  whyLabel.className = 'tooltip-label';
  const why = doc.createElement('p');
  why.className = 'tooltip-why';
  tip.append(whatLabel, what, whyLabel, why);
  doc.body.append(tip);

  let current = null; // control con el tooltip visible o pendiente
  let timer = null;
  let tabbing = false; // la última interacción fue la tecla Tab (y no un clic)

  const isWritingArea = (control) => control.matches(WRITING_AREA_SELECTOR);
  const controlOf = (node) => (node && node.closest ? node.closest('[data-help]') : null);

  /** Parámetros del texto de ayuda (data-help-params, JSON), por ejemplo el número de un sensor. */
  function paramsOf(control) {
    const raw = control.getAttribute('data-help-params');
    if (!raw) return undefined;
    try { return JSON.parse(raw); } catch { return undefined; }
  }

  function fill(control) {
    const keys = helpKeys(control.getAttribute('data-help'));
    const params = paramsOf(control);
    whatLabel.textContent = i18n.t('tooltip.what');
    what.textContent = i18n.t(keys.what, params);
    whyLabel.textContent = i18n.t('tooltip.why');
    why.textContent = i18n.t(keys.why, params);
  }

  function position(control) {
    const r = control.getBoundingClientRect();
    const size = { width: tip.offsetWidth, height: tip.offsetHeight };
    const p = placeTooltip(r, size, { width: win.innerWidth, height: win.innerHeight });
    tip.style.left = `${Math.round(p.left)}px`;
    tip.style.top = `${Math.round(p.top)}px`;
    tip.dataset.placement = p.placement;
  }

  function show(control) {
    clearTimeout(timer);
    timer = null;
    current = control;
    fill(control);
    tip.hidden = false;
    position(control);
    control.setAttribute('aria-describedby', tip.id);
  }

  function hide() {
    clearTimeout(timer);
    timer = null;
    if (current) current.removeAttribute('aria-describedby');
    current = null;
    tip.hidden = true;
  }

  function onPointerOver(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    const control = controlOf(e.target);
    if (!control || control === current) return;
    if (!opensTooltip({ cause: 'hover', writingArea: isWritingArea(control), keyboard: false })) return;
    hide();
    current = control;
    timer = setTimeout(() => show(control), delay);
  }

  function onPointerOut(e) {
    if (!current) return;
    const to = e.relatedTarget;
    if (to && current.contains(to)) return;
    if (controlOf(e.target) !== current) return;
    if (doc.activeElement === current && current.matches(':focus-visible')) return;
    hide();
  }

  function onFocusIn(e) {
    const control = controlOf(e.target);
    if (!control) return;
    // Solo con foco de teclado (Tab); un clic con el mouse no lo muestra.
    const focusVisible = control.matches(':focus-visible');
    if (opensTooltip({ cause: 'focus', writingArea: isWritingArea(control), keyboard: tabbing, focusVisible })) show(control);
  }

  function onFocusOut(e) {
    if (current && controlOf(e.target) === current) hide();
  }

  function onKeyDown(e) {
    tabbing = e.key === 'Tab';
    if (e.key === 'Escape' && current) hide();
  }

  function onPointerDown(e) {
    tabbing = false;
    if (current && isWritingArea(current) && controlOf(e.target) === current) hide();
  }

  /** Al empezar a escribir, el tooltip del área de escritura deja de tapar lo que la rodea. */
  function onInput(e) {
    if (current && isWritingArea(current) && controlOf(e.target) === current) hide();
  }

  const listeners = [
    ['pointerover', onPointerOver], ['pointerout', onPointerOut],
    ['focusin', onFocusIn], ['focusout', onFocusOut], ['keydown', onKeyDown],
    ['pointerdown', onPointerDown], ['input', onInput],
  ];
  for (const [type, fn] of listeners) doc.addEventListener(type, fn);
  win.addEventListener('blur', hide);
  win.addEventListener('scroll', hide, true);
  win.addEventListener('resize', hide);

  // Idioma en vivo: si hay un tooltip visible, se reescribe en el idioma nuevo.
  const offLanguage = i18n.onChange(() => {
    if (current && !tip.hidden) { fill(current); position(current); }
  });

  return {
    element: tip,
    hide,
    get current() { return tip.hidden ? null : current; },
    dispose() {
      hide();
      for (const [type, fn] of listeners) doc.removeEventListener(type, fn);
      win.removeEventListener('blur', hide);
      win.removeEventListener('scroll', hide, true);
      win.removeEventListener('resize', hide);
      offLanguage();
      tip.remove();
    },
  };
}
