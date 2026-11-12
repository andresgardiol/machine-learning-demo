// Sección avanzada de calle y sensores, compartida por las pestañas 1 y 2 (design.md D5): velocidad
// máxima, carriles, densidad e irregularidad del tráfico, y cantidad, alcance y apertura de los
// sensores, con un botón que los restablece. Plegada al abrir.
//
// La sección no decide qué hacer con un ajuste: llama a `apply(next, { countAttempt })` y la pestaña
// lo aplica en marcha o reinicia el intento. Un arrastre de deslizador cuenta como un solo reinicio.
import { el } from '../../ui/dom.js';
import { button, sliderRow, optionGroup, createTextSetter } from '../../ui/controls.js';
import { DEFAULT_SETTINGS, LANE_OPTIONS, SLIDERS } from './street-settings.js';

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
    onSelect: (n) => { if (n !== current.lanes) apply({ ...current, lanes: n }, { countAttempt: true }); },
  });

  const sliders = SLIDERS.map((s) => {
    const { row, input, value } = sliderRow({
      id: `${idPrefix}-${s.key}`, labelKey: `drive.${s.key}`, help: `drive.${s.key}`,
      min: s.min, max: s.max, step: s.step, value: current[s.key],
      onInput: (v) => {
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

  /** Muestra los valores de `next` en los controles. */
  function sync(next) {
    current = next;
    lanes.select(current.lanes);
    for (const s of sliders) {
      if (Number(s.input.value) !== current[s.key]) s.input.value = String(current[s.key]);
      setText(s.value, s.format, { value: current[s.key], kmh: Math.round(current[s.key] * 3.6) });
    }
  }

  return { node, sync };
}
