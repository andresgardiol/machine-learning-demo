// Equivalentes en la V2 de piezas de pantalla de la V1 (ui/controls.js y ui/files.js), con la misma firma,
// para las vistas que la V2 copia de la V1 (la biblioteca de cerebros). La V2 no importa la pantalla de la
// V1 (design.md D5): estas versiones arman sus nodos con las clases de la V2.
import { el } from '../dom.js';

const CLASSES = { tool: 'v2-btn', small: 'v2-small', tertiary: 'v2-tertiary', primary: 'v2-primary' };
/** Clases de la V1 ("tool small") traducidas a las de la V2 ("v2-btn v2-small"). */
export const v2Classes = (cls = 'tool') => cls.split(/\s+/).map((c) => CLASSES[c] ?? c).join(' ');

/** Botón con su texto y su tooltip (firma de ui/controls.js). */
export function button(i18n, help, onClick, cls = 'tool') {
  return el('button', { class: v2Classes(cls), i18n, help, attrs: { type: 'button' }, on: { click: onClick } });
}

/** Escribe un texto traducido solo si cambió (firma de ui/controls.js). */
export function createTextSetter(i18n) {
  return function setText(node, key, params) {
    const raw = params ? JSON.stringify(params) : null;
    if (node.getAttribute('data-i18n') === key && node.getAttribute('data-i18n-params') === raw && node.textContent !== '') return;
    node.setAttribute('data-i18n', key);
    if (raw) node.setAttribute('data-i18n-params', raw); else node.removeAttribute('data-i18n-params');
    node.textContent = i18n.t(key, params);
  };
}

/** Lógica de una confirmación, sin DOM (la de la V1): a lo sumo un pedido abierto. */
export function createConfirmation({ onChange } = {}) {
  let current = null;
  const notify = () => onChange?.(current);
  function close(answer) {
    if (!current) return false;
    const req = current;
    current = null;
    notify();
    if (answer) req.onConfirm?.(); else req.onCancel?.();
    return true;
  }
  return {
    open(request) { if (current) close(false); current = { confirmKey: 'confirm.ok', cancelKey: 'confirm.cancel', ...request }; notify(); },
    confirm: () => close(true),
    cancel: () => close(false),
    get isOpen() { return current !== null; },
  };
}

/** Confirmación en línea junto al control que la pidió; Escape cancela y el foco va a cancelar. */
export function inlineConfirm({ i18n }) {
  const setText = createTextSetter(i18n);
  const message = el('p', { class: 'v2-confirm-message' });
  const okButton = el('button', { class: 'v2-btn v2-primary', help: 'confirm.ok', attrs: { type: 'button' }, on: { click: () => logic.confirm() } });
  const cancelButton = el('button', { class: 'v2-btn', help: 'confirm.cancel', attrs: { type: 'button' }, on: { click: () => logic.cancel() } });
  const node = el('div', { class: 'v2-confirm', attrs: { role: 'alertdialog', hidden: true } }, message, el('div', { class: 'v2-row v2-row-start' }, okButton, cancelButton));
  const logic = createConfirmation({
    onChange(req) {
      node.hidden = !req;
      if (!req) return;
      setText(message, req.message, req.params);
      setText(okButton, req.confirmKey);
      setText(cancelButton, req.cancelKey);
      cancelButton.focus({ preventScroll: true });
    },
  });
  const onKeyDown = (e) => { if (e.key === 'Escape' && logic.isOpen) { e.preventDefault(); e.stopPropagation(); logic.cancel(); } };
  node.addEventListener('keydown', onKeyDown);
  return {
    node,
    open: (request) => logic.open(request),
    confirm: () => logic.confirm(),
    cancel: () => logic.cancel(),
    get isOpen() { return logic.isOpen; },
    dispose() { node.removeEventListener('keydown', onKeyDown); node.remove(); },
  };
}

/** Descarga un texto como archivo (firma de ui/files.js). */
export function downloadText({ fileName, text, doc = globalThis.document, type = 'application/json' }) {
  const win = doc.defaultView;
  const url = win.URL.createObjectURL(new win.Blob([text], { type }));
  const a = el('a', { attrs: { href: url, download: fileName } });
  a.style.display = 'none';
  doc.body.append(a);
  a.click();
  a.remove();
  win.setTimeout(() => win.URL.revokeObjectURL(url), 0);
}

/** Lee el texto de un archivo elegido. */
export const readText = (file) => file.text();
