// Controlador de teclado: adapta los eventos del navegador al contrato de controlador
// del núcleo (control(perception) -> { forward, reverse, left, right }).
//
// Flechas y W A S D (por posición física de la tecla), varias a la vez. Ignora las teclas
// mientras se escribe en un campo de texto o se ajusta un deslizador con el teclado, evita
// que las flechas desplacen la página y suelta todo cuando la ventana pierde el foco o la
// página se oculta.

export const KEY_BINDINGS = Object.freeze({
  ArrowUp: 'forward', KeyW: 'forward',
  ArrowDown: 'reverse', KeyS: 'reverse',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
});

const NON_TEXT_INPUTS = new Set(['button', 'checkbox', 'radio', 'range', 'reset', 'submit', 'color', 'file', 'image']);

/** ¿El evento ocurre mientras la persona escribe en un campo de texto? */
export function isTypingTarget(target) {
  if (!target) return false;
  if (target.isContentEditable) return true;
  const tag = String(target.tagName ?? '').toUpperCase();
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (tag === 'INPUT') return !NON_TEXT_INPUTS.has(String(target.type ?? 'text').toLowerCase());
  return false;
}

/**
 * ¿El objetivo usa las flechas por su cuenta? Un deslizador o un separador (el borde del panel)
 * enfocado con el teclado se ajusta con ellas; mientras tanto el teclado no maneja el auto
 * (tras un clic con el mouse, la pestaña devuelve el foco al escenario).
 */
export function ownsArrowKeys(target) {
  if (!target) return false;
  if (typeof target.getAttribute === 'function' && ['separator', 'slider'].includes(target.getAttribute('role'))) return true;
  return String(target.tagName ?? '').toUpperCase() === 'INPUT' && String(target.type ?? '').toLowerCase() === 'range';
}

/**
 * @param {{target?: EventTarget, doc?: EventTarget & {hidden?: boolean}}} [spec]
 *   target: donde se escuchan las teclas y la pérdida de foco (la ventana)
 */
export function createKeyboardController({ target = globalThis.window, doc = globalThis.document } = {}) {
  const pressed = new Set(); // códigos de tecla presionados

  function onKeyDown(e) {
    const action = KEY_BINDINGS[e.code];
    if (!action || e.ctrlKey || e.metaKey || e.altKey) return;
    if (isTypingTarget(e.target) || ownsArrowKeys(e.target)) return;
    pressed.add(e.code);
    if (e.code.startsWith('Arrow')) e.preventDefault(); // que las flechas no desplacen la página
  }

  function onKeyUp(e) {
    if (pressed.delete(e.code) && e.code.startsWith('Arrow')) e.preventDefault();
  }

  function releaseAll() {
    pressed.clear();
  }

  function onVisibility() {
    if (doc?.hidden) releaseAll();
  }

  target.addEventListener('keydown', onKeyDown);
  target.addEventListener('keyup', onKeyUp);
  target.addEventListener('blur', releaseAll);
  doc?.addEventListener?.('visibilitychange', onVisibility);

  const isOn = (action) => [...pressed].some((code) => KEY_BINDINGS[code] === action);

  return {
    /** Contrato de controlador: el teclado ignora la percepción y devuelve lo que está presionado. */
    control() {
      return { forward: isOn('forward'), reverse: isOn('reverse'), left: isOn('left'), right: isOn('right') };
    },
    releaseAll,
    dispose() {
      releaseAll();
      target.removeEventListener('keydown', onKeyDown);
      target.removeEventListener('keyup', onKeyUp);
      target.removeEventListener('blur', releaseAll);
      doc?.removeEventListener?.('visibilitychange', onVisibility);
    },
  };
}
