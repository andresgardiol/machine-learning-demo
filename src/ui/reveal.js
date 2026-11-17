// Mostrar un control (misiones-que-muestran-el-control D2): lo trae a la vista, lo marca con un anillo
// quieto, le pasa el foco y anuncia qué control se mostró. Nunca toca el control: no cambia ningún
// ajuste ni valor. Lo usa "Mostrame" de la tarjeta de consigna; el recorrido guiado lo va a reutilizar.
//
// La marca es `data-revealed="true"` (el anillo lo dibuja styles/app.css). Se va a los 4 s, o antes
// con el primer pointerdown o keydown que no venga del propio botón. Al irse pasa por
// `data-revealed="false"` mientras dura la transición de salida, y después se quita el atributo.

export const REVEAL_MS = 4000;
/** Lo que dura la transición de salida del anillo en styles/app.css (D3). */
export const REVEAL_OUT_MS = 300;

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

let active = null;
let liveRegion = null;

/**
 * @param {Element[]} nodes los controles a marcar; el primero se trae a la vista y recibe el foco
 * @param {{i18n?: {t: (key: string, params?: object) => string}, label?: string, reducedMotion?: boolean,
 *   trigger?: Element|null, doc?: Document, timers?: {setTimeout: Function, clearTimeout: Function}}} [opts]
 *   trigger: el botón que lo pidió (sus pulsaciones no sacan la marca). doc y timers, para las pruebas.
 * @returns {{clear: () => void, label: string} | null} null si no hay nodos
 */
export function revealControls(nodes, opts = {}) {
  const list = (nodes ?? []).filter(Boolean);
  if (list.length === 0) return null;
  const doc = opts.doc ?? list[0].ownerDocument ?? globalThis.document;
  const timers = opts.timers ?? globalThis;
  const reducedMotion = opts.reducedMotion ?? prefersReducedMotion(doc);
  if (active) active.clear();

  const first = list[0];
  first.scrollIntoView?.({ block: 'nearest', inline: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
  for (const n of list) n.setAttribute('data-revealed', 'true');
  const target = focusTarget(first);
  // preventScroll: el desplazamiento ya lo hizo scrollIntoView. Enfocar no mueve el cursor de un texto.
  target?.focus?.({ preventScroll: true });

  const label = opts.label ?? accessibleName(first);
  announce(doc, opts.i18n ? opts.i18n.t('mission.revealed', { control: label }) : label);

  let timer = null;
  const outTimers = [];
  const onInput = (event) => {
    if (opts.trigger && opts.trigger.contains?.(event.target)) return;
    clear();
  };
  function clear() {
    if (handle !== active) return;
    active = null;
    timers.clearTimeout(timer);
    doc.removeEventListener('pointerdown', onInput, true);
    doc.removeEventListener('keydown', onInput, true);
    for (const n of list) {
      if (n.getAttribute('data-revealed') !== 'true') continue;
      if (reducedMotion) { n.removeAttribute('data-revealed'); continue; }
      n.setAttribute('data-revealed', 'false');
      outTimers.push(timers.setTimeout(() => {
        if (n.getAttribute('data-revealed') === 'false') n.removeAttribute('data-revealed');
      }, REVEAL_OUT_MS));
    }
  }
  const handle = { clear, label };
  active = handle;
  timer = timers.setTimeout(clear, REVEAL_MS);
  doc.addEventListener('pointerdown', onInput, true);
  doc.addEventListener('keydown', onInput, true);
  return handle;
}

/**
 * El control que recibe el foco: el nodo, si es enfocable; si no, en un grupo de opciones la elegida, y
 * si no, el primer control que tiene adentro.
 */
export function focusTarget(node) {
  if (!node) return null;
  if (node.matches?.(FOCUSABLE)) return node;
  const chosen = node.querySelector?.('[aria-checked="true"], [aria-pressed="true"], [aria-selected="true"]');
  if (chosen && chosen.matches?.(FOCUSABLE)) return chosen;
  return node.querySelector?.(FOCUSABLE) ?? null;
}

/** Rótulos de un grupo o de una fila de ajuste, en el orden en que se buscan. */
const GROUP_LABEL = ['.bar-name', '.lab-field-name', '.setting-label', '.bar-group-label', 'legend', 'label', '[id$="-label"]'];

/**
 * El nombre del control, corto: aria-label, lo que nombra aria-labelledby o su rótulo. En un grupo
 * (un ajuste con opciones, una fila con deslizador), el rótulo del grupo; si no tiene, el nombre del
 * control que recibe el foco (el editor: "Programa del auto"). Si nada de eso, su texto visible.
 */
export function accessibleName(node) {
  const clean = (s) => (s ?? '').replace(/\s+/g, ' ').trim();
  const aria = clean(node.getAttribute?.('aria-label'));
  if (aria) return aria;
  const ids = node.getAttribute?.('aria-labelledby');
  if (ids) {
    const doc = node.ownerDocument;
    const text = clean(ids.split(/\s+/).map((id) => doc?.getElementById(id)?.textContent ?? '').join(' '));
    if (text) return text;
  }
  if (node.id && node.ownerDocument) {
    const label = node.ownerDocument.querySelector?.(`label[for="${node.id}"]`);
    if (label && clean(label.textContent)) return clean(label.textContent);
  }
  if (!node.matches?.(FOCUSABLE)) {
    for (const selector of GROUP_LABEL) {
      const label = node.querySelector?.(selector);
      if (label && clean(label.textContent)) return clean(label.textContent);
    }
    const inner = focusTarget(node);
    if (inner && inner !== node) return accessibleName(inner);
  }
  return clean(node.textContent ?? node.innerText);
}

function prefersReducedMotion(doc) {
  const w = doc?.defaultView;
  return Boolean(w?.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

/** Región `aria-live="polite"` única; se vacía antes de escribir para que repita el mismo texto. */
function announce(doc, text) {
  if (!doc?.createElement || !doc.body) return;
  if (!liveRegion || !liveRegion.isConnected || liveRegion.ownerDocument !== doc) {
    liveRegion = doc.createElement('p');
    liveRegion.className = 'sr-only reveal-live';
    liveRegion.setAttribute('aria-live', 'polite');
    doc.body.append(liveRegion);
  }
  liveRegion.textContent = '';
  const region = liveRegion;
  // En el cuadro siguiente, para que el lector note el cambio aunque el texto sea el mismo.
  const raf = doc.defaultView?.requestAnimationFrame;
  if (raf) raf(() => { region.textContent = text; });
  else region.textContent = text;
}
