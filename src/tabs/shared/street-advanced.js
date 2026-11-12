// Sección avanzada de calle y sensores, compartida por las pestañas 1 y 2 (design.md D5): velocidad
// máxima, carriles, densidad e irregularidad del tráfico, y cantidad, alcance y apertura de los
// sensores, con un botón que los restablece (también vuelve a la calle recta). Plegada al abrir. En
// un circuito, carriles, densidad e irregularidad se ven deshabilitados y conservan sus valores.
//
// La sección no decide qué hacer con un ajuste: llama a `apply(next, { countAttempt })` y la pestaña
// lo aplica en marcha o reinicia el intento. Un arrastre de deslizador cuenta como un solo reinicio.
import { el } from '../../ui/dom.js';
import { button, sliderRow, optionGroup, createTextSetter } from '../../ui/controls.js';
import { DEFAULT_SETTINGS, LANE_OPTIONS, SLIDERS, TRAFFIC_KEYS, onCircuit } from './street-settings.js';

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

/**
 * @param {{i18n: object, settings: object, apply:(next:object, options:{countAttempt:boolean}) => void,
 *          idPrefix?: string, open?: boolean, onToggle?:(open:boolean) => void}} spec
 * @returns {{node: HTMLDetailsElement, sync:(settings:object) => void}}
 */
export function streetAdvanced({ i18n, settings, apply, idPrefix = 'drive', open = false, onToggle }) {
  const setText = createTextSetter(i18n);
  let current = settings;
  let dragging = false;

  const lanes = optionGroup({
    labelKey: 'drive.lanes',
    selected: current.lanes,
    options: LANE_OPTIONS.map((n) => ({
      value: n, i18n: 'drive.lanes.option', params: { n }, help: 'drive.lanes',
      labelKey: 'drive.lanes.optionLabel', dataset: { lanes: String(n) },
    })),
    onSelect: (n) => {
      if (onCircuit(current)) return; // en un circuito no hay tráfico: el ajuste no aplica
      if (n !== current.lanes) apply({ ...current, lanes: n }, { countAttempt: true });
    },
  });

  const sliders = SLIDERS.map((s) => {
    const { row, input, value } = sliderRow({
      id: `${idPrefix}-${s.key}`, labelKey: `drive.${s.key}`, help: `drive.${s.key}`,
      min: s.min, max: s.max, step: s.step, value: current[s.key],
      onInput: (v, e) => {
        if (TRAFFIC_KEYS.includes(s.key) && onCircuit(current)) {
          e.target.value = String(current[s.key]); // no aplica en un circuito: conserva su valor
          return;
        }
        apply({ ...current, [s.key]: v }, { countAttempt: !dragging });
        dragging = true;
      },
      onChange: () => { dragging = false; },
    });
    return { ...s, input, value, row };
  });

  const resetButton = button('drive.resetSettings', 'drive.resetSettings', () => apply({ ...DEFAULT_SETTINGS }, { countAttempt: true }));

  const row = (key) => sliders.find((s) => s.key === key).row;
  const node = el('details', { class: 'section' },
    el('summary', { i18n: 'drive.advanced', help: 'drive.advanced' }),
    el('div', { class: 'section-body advanced-body' },
      el('h3', { class: 'panel-subheading', i18n: 'drive.advanced.car' }),
      row('maxSpeed'),
      el('h3', { class: 'panel-subheading', i18n: 'drive.advanced.street' }),
      lanes.row, row('density'), row('irregularity'),
      el('h3', { class: 'panel-subheading', i18n: 'drive.advanced.sensors' }),
      row('sensorCount'), row('sensorRange'), row('sensorSpread'),
      resetButton));
  node.open = open;
  if (onToggle) node.addEventListener('toggle', () => onToggle(node.open));

  /** Muestra los valores de `next` en los controles; en un circuito, los de tráfico deshabilitados. */
  function sync(next) {
    current = next;
    lanes.select(current.lanes);
    const circuit = onCircuit(current);
    for (const b of lanes.buttons) setUnavailable(b, circuit, 'drive.lanes');
    for (const s of sliders) if (TRAFFIC_KEYS.includes(s.key)) setUnavailable(s.input, circuit, `drive.${s.key}`);
    for (const s of sliders) {
      if (Number(s.input.value) !== current[s.key]) s.input.value = String(current[s.key]);
      setText(s.value, s.format, { value: current[s.key], kmh: Math.round(current[s.key] * 3.6) });
    }
  }

  return { node, sync };
}
