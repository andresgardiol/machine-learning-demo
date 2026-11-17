// Acción principal de cada pestaña (jerarquia-de-botones D3): qué control lleva el estilo de acción
// principal según la pestaña y lo mínimo de su estado. Es la tabla del requisito "La marcha es la
// acción principal", escrita una sola vez. No usa el DOM: se prueba en Node.

/** Las seis pestañas que tienen un control de marcha. */
export const TABS_WITH_RUN = Object.freeze(['drive', 'rules', 'train', 'compete', 'inspect', 'lab']);

/**
 * @param {string} tab Pestaña: 'drive', 'rules', 'train', 'compete', 'inspect' o 'lab'.
 * @param {{crashed?: boolean, manualPending?: boolean, raceFinished?: boolean,
 *   startCardVisible?: boolean, panelView?: string, dialogOpen?: boolean}} [state]
 * @returns {'run'|'restart'|'chooseLeader'|'another'|'startCard'|'saveAsNew'|'dialog'|null}
 */
export function mainAction(tab, state = {}) {
  const { crashed = false, manualPending = false, raceFinished = false, startCardVisible = false,
    panelView = null, dialogOpen = false } = state;
  // Un diálogo abierto tiene su propia acción principal, por encima de la pestaña.
  if (dialogOpen) return 'dialog';
  switch (tab) {
    case 'drive':
    case 'rules':
      return crashed ? 'restart' : 'run';
    case 'train':
      if (panelView === 'brains') return 'saveAsNew';
      if (panelView === 'settings') return null;
      return manualPending ? 'chooseLeader' : 'run';
    case 'compete':
      if (raceFinished) return 'another';
      if (startCardVisible) return 'startCard';
      return 'run';
    case 'inspect':
    case 'lab':
      return 'run';
    default:
      return null;
  }
}

/**
 * Pone la clase `primary` en el botón de `key` y la saca de los demás.
 * @param {Record<string, {classList: {toggle(name: string, force: boolean): unknown}} | null | undefined>} buttons
 * @param {string|null} key
 */
export function applyMainAction(buttons, key) {
  for (const [name, button] of Object.entries(buttons)) {
    if (button) button.classList.toggle('primary', name === key);
  }
}
