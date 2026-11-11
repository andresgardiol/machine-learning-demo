// Componentes de panel compartidos por las pestañas (design.md D15): botón, interruptor, fila con
// deslizador, grupo de opciones, texto variable y confirmación en línea.
//
// Todos declaran sus textos con claves de los diccionarios (data-i18n / data-help); ningún texto
// visible vive acá. La lógica de la confirmación (abrir, confirmar, cancelar) no usa el DOM y se
// prueba en Node; el componente que la muestra sí.
import { el } from './dom.js';

/** Botón con texto y tooltip. */
export const button = (key, help, onClick, cls = 'tool') => el('button', {
  class: cls, i18n: key, help, attrs: { type: 'button' }, on: { click: onClick },
});

/** Interruptor sí/no (role="switch"). */
export const switchButton = (key, help, checked, onToggle) => el('button', {
  class: 'switch', help,
  attrs: { type: 'button', role: 'switch', 'aria-checked': String(checked) },
  on: { click: onToggle },
}, el('span', { class: 'switch-track', attrs: { 'aria-hidden': 'true' } }), el('span', { i18n: key }));

/**
 * Fila con rótulo, valor y deslizador.
 * @param {{id:string, labelKey:string, help:string, min:number, max:number, step:number, value:number,
 *          onInput:(value:number, e:Event)=>void, onChange?:(value:number, e:Event)=>void}} spec
 * @returns {{row: HTMLElement, input: HTMLInputElement, value: HTMLOutputElement}}
 */
export function sliderRow({ id, labelKey, help, min, max, step, value, onInput, onChange }) {
  const output = el('output', { class: 'setting-value', attrs: { for: id } });
  const input = el('input', {
    help,
    attrs: { type: 'range', id, min, max, step, value },
    on: {
      input: (e) => onInput(Number(e.target.value), e),
      change: (e) => onChange?.(Number(e.target.value), e),
    },
  });
  const row = el('div', { class: 'setting' },
    el('label', { class: 'setting-label', i18n: labelKey, attrs: { for: id } }), output, input);
  return { row, input, value: output };
}

/**
 * Grupo de opciones excluyentes (botones con aria-pressed).
 * @param {{labelKey:string, labelHelp?:string, options:{value:any, i18n:string, params?:object, help:string,
 *          labelKey?:string, dataset?:object}[], selected:any, onSelect:(value:any)=>void}} spec
 *   labelHelp: tooltip del ajuste completo, sobre su rótulo (cada opción tiene el suyo).
 * @returns {{row: HTMLElement, buttons: HTMLButtonElement[], select:(value:any)=>void}}
 */
export function optionGroup({ labelKey, labelHelp, options, selected, onSelect }) {
  const buttons = options.map((o) => {
    const b = el('button', {
      class: 'segment', i18n: o.i18n, params: o.params, help: o.help,
      i18nAttr: o.labelKey ? `aria-label:${o.labelKey}` : undefined,
      attrs: { type: 'button', 'aria-pressed': String(o.value === selected) },
      dataset: o.dataset,
      on: { click: () => onSelect(o.value) },
    });
    b.optionValue = o.value;
    return b;
  });
  const row = el('div', { class: 'setting' },
    el('span', { class: 'setting-label', i18n: labelKey, help: labelHelp }),
    el('div', { class: 'segments', attrs: { role: 'group' }, i18nAttr: `aria-label:${labelKey}` }, buttons));
  /** Marca como elegida la opción `value`. */
  const select = (value) => {
    for (const b of buttons) {
      const pressed = String(b.optionValue === value);
      if (b.getAttribute('aria-pressed') !== pressed) b.setAttribute('aria-pressed', pressed);
    }
  };
  return { row, buttons, select };
}

/**
 * Texto variable: declara clave y parámetros (para el cambio de idioma) y lo escribe solo si cambió.
 * @returns {(node: HTMLElement, key: string, params?: object) => void}
 */
export function createTextSetter(i18n) {
  return function setText(node, key, params) {
    const raw = params ? JSON.stringify(params) : null;
    if (node.getAttribute('data-i18n') === key && node.getAttribute('data-i18n-params') === raw && node.textContent !== '') return;
    node.setAttribute('data-i18n', key);
    if (raw) node.setAttribute('data-i18n-params', raw);
    else node.removeAttribute('data-i18n-params');
    node.textContent = i18n.t(key, params);
  };
}

// --- Confirmación en línea -------------------------------------------------------------

/**
 * Lógica de una confirmación, sin DOM. Hay a lo sumo un pedido abierto: abrir otro cancela el
 * anterior. Confirmar o cancelar lo cierra y llama a su respuesta una sola vez.
 *
 *   request = { message: clave, params?, confirmKey?, cancelKey?, onConfirm?, onCancel? }
 */
export function createConfirmation({ onChange } = {}) {
  let current = null;
  const notify = () => onChange?.(current);

  function close(answer) {
    if (!current) return false;
    const req = current;
    current = null;
    notify();
    if (answer) req.onConfirm?.();
    else req.onCancel?.();
    return true;
  }

  return {
    open(request) {
      if (current) close(false);
      current = { confirmKey: 'confirm.ok', cancelKey: 'confirm.cancel', ...request };
      notify();
    },
    confirm: () => close(true),
    cancel: () => close(false),
    get isOpen() { return current !== null; },
    get current() { return current; },
  };
}

/**
 * Confirmación dentro del panel, junto al control que la pidió (no con el diálogo del navegador).
 * Muestra el mensaje y los botones confirmar y cancelar; Escape cancela y, al abrirse, el foco va a
 * cancelar, la opción que no cambia nada.
 * @param {{i18n: object}} spec
 * @returns {{node: HTMLElement, open:(request)=>void, confirm:()=>void, cancel:()=>void, isOpen:boolean, dispose:()=>void}}
 */
export function inlineConfirm({ i18n }) {
  const setText = createTextSetter(i18n);
  const message = el('p', { class: 'confirm-message' });
  const okButton = el('button', { class: 'tool primary', help: 'confirm.ok', attrs: { type: 'button' }, on: { click: () => logic.confirm() } });
  const cancelButton = el('button', { class: 'tool', help: 'confirm.cancel', attrs: { type: 'button' }, on: { click: () => logic.cancel() } });
  const node = el('div', { class: 'inline-confirm', attrs: { role: 'alertdialog' } },
    message, el('div', { class: 'confirm-actions' }, okButton, cancelButton));
  node.hidden = true;

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

  function onKeyDown(e) {
    if (e.key !== 'Escape' || !logic.isOpen) return;
    e.preventDefault();
    e.stopPropagation();
    logic.cancel();
  }
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
