// Ajustes que no aplican: un control deshabilitado que sigue explicando por qué. Lo usan la barra de
// escenario (en un circuito no hay tráfico) y los paneles. La sección avanzada plegable que vivía acá
// pasó a la barra de escenario (panel-de-entrenar-por-vistas D11).

/** Clave de ayuda de los ajustes de tráfico cuando no aplican (en un circuito no hay tráfico). */
export const NO_TRAFFIC_HELP = 'drive.noTraffic';

/**
 * Marca un control como deshabilitado (aria-disabled, para que siga mostrando su tooltip) y cambia
 * su ayuda por `disabledHelp`; al habilitarlo vuelve a la propia.
 */
export function setUnavailable(node, unavailable, ownHelp, disabledHelp = NO_TRAFFIC_HELP) {
  const want = unavailable ? 'true' : null;
  if (node.getAttribute('aria-disabled') !== want) {
    if (want) node.setAttribute('aria-disabled', want);
    else node.removeAttribute('aria-disabled');
  }
  const help = unavailable ? disabledHelp : ownHelp;
  if (node.getAttribute('data-help') !== help) node.setAttribute('data-help', help);
}
