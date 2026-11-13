// Barra de escenario (panel-de-entrenar-por-vistas D11): debajo del encabezado, a todo el ancho e
// igual en las tres pestañas, con los ajustes de dónde y con qué maneja el auto, en este orden:
//
//   pista       cuatro opciones a la vista, con miniatura y nombre corto (un grupo de radio)
//   tráfico     carriles, densidad, irregularidad (deshabilitados en un circuito)
//   sensores    cantidad, alcance, apertura
//   auto        velocidad máxima
//   restablecer
//
// La barra no decide qué hacer con un cambio: avisa `onChange(key, value, { final, first })`. `final`
// es falso mientras se arrastra un deslizador y verdadero al soltarlo (o al elegir una opción);
// `first` es verdadero en el primer aviso de un gesto. Cada pestaña aplica el cambio en marcha,
// reinicia el intento, vuelve a empezar la generación o pide un entrenamiento nuevo (barEffect).
//
// Los ajustes usan las claves de street-settings.js: track, lanes, density, irregularity, maxSpeed,
// sensorCount, sensorRange y sensorSpread. La lógica sin DOM (barEffect, createSliderGesture,
// trackAfterKey) se prueba en Node.
import { el } from '../../ui/dom.js';
import { createTextSetter } from '../../ui/controls.js';
import { TRACK_IDS, isCircuit } from '../../core/circuits.js';
import { thumbnailSvg } from '../../render/track-thumbnail.js';
import { LANE_OPTIONS, SLIDERS, TRAFFIC_KEYS } from './street-settings.js';
import { setUnavailable } from './street-advanced.js';

/** Grupos de la barra, en orden, con sus ajustes. */
export const BAR_GROUPS = Object.freeze([
  Object.freeze({ id: 'track', keys: Object.freeze(['track']) }),
  Object.freeze({ id: 'traffic', keys: Object.freeze(['lanes', 'density', 'irregularity']) }),
  Object.freeze({ id: 'sensors', keys: Object.freeze(['sensorCount', 'sensorRange', 'sensorSpread']) }),
  Object.freeze({ id: 'car', keys: Object.freeze(['maxSpeed']) }),
]);

/** Ajustes de la barra, en el orden en que se ven. */
export const BAR_KEYS = Object.freeze(BAR_GROUPS.flatMap((g) => g.keys));

const SENSOR_KEYS = Object.freeze(['sensorCount', 'sensorRange', 'sensorSpread']);
const LIVE_KEYS = Object.freeze(['maxSpeed', 'density', 'irregularity']);

/**
 * Qué provoca un cambio de la barra en cada pestaña (D11 y D12):
 *   'live'              se aplica en marcha (El problema y Reglas a mano)
 *   'restartAttempt'    reinicia el intento (El problema y Reglas a mano)
 *   'restartGeneration' vuelve a empezar la generación en curso con la misma población (Entrenar)
 *   'newTraining'       empieza un entrenamiento nuevo, con confirmación si hay progreso (Entrenar)
 *   'newRace'           empieza otra carrera con los mismos competidores (Competir, pestana-competir D12)
 * Competir no usa los sensores: para ellos, null.
 * @param {'drive'|'rules'|'train'|'compete'} tab
 * @returns {string|null} null si la clave no es de la barra
 */
export function barEffect(tab, key) {
  // La meta es un grupo propio de Competir (pestana-competir D12): ninguna otra pestaña lo tiene.
  if (key === 'goal') return tab === 'compete' ? 'newRace' : null;
  if (!BAR_KEYS.includes(key)) return null;
  if (tab === 'compete') return SENSOR_KEYS.includes(key) ? null : 'newRace';
  if (tab === 'train') return SENSOR_KEYS.includes(key) ? 'newTraining' : 'restartGeneration';
  return LIVE_KEYS.includes(key) ? 'live' : 'restartAttempt';
}

/**
 * Gesto de un deslizador: cada `input` avisa con `final` falso y cada `change` (soltar, o una tecla)
 * con `final` verdadero; `first` marca el primer aviso del gesto.
 * @param {(value:number, info:{final:boolean, first:boolean}) => void} notify
 */
export function createSliderGesture(notify) {
  let active = false;
  return {
    input(value) { notify(value, { final: false, first: !active }); active = true; },
    change(value) { notify(value, { final: true, first: !active }); active = false; },
    get active() { return active; },
  };
}

/** Pista a la que lleva una tecla en el grupo de pistas (flechas, Inicio y Fin); null si la tecla no mueve. */
export function trackAfterKey(current, key) {
  const i = Math.max(0, TRACK_IDS.indexOf(current));
  const n = TRACK_IDS.length;
  const to = {
    ArrowRight: (i + 1) % n, ArrowDown: (i + 1) % n,
    ArrowLeft: (i - 1 + n) % n, ArrowUp: (i - 1 + n) % n,
    Home: 0, End: n - 1,
  }[key];
  return to === undefined ? null : TRACK_IDS[to];
}

/**
 * Grupo de la barra con el mismo aspecto, rótulo y roles que los demás, para un grupo propio de una
 * pestaña (barra-escenario, "Grupo propio de una pestaña").
 * @param {{id:string, labelKey:string, labelId:string, help?:string}} spec
 */
export function barGroupNode({ id, labelKey, labelId, help }, ...children) {
  return el('div', { class: `bar-group bar-group-${id}`, attrs: { role: 'group', 'aria-labelledby': labelId } },
    el('span', { class: 'bar-group-label', i18n: labelKey, help, attrs: { id: labelId } }),
    el('div', { class: 'bar-group-body' }, ...children));
}

/** Formato corto del valor de cada deslizador en la barra, y el completo para lectores de pantalla. */
const FORMATS = Object.freeze({
  density: { short: 'drive.value.percent', full: 'drive.value.percent' },
  irregularity: { short: 'drive.value.percent', full: 'drive.value.percent' },
  sensorCount: { short: 'drive.value.count', full: 'drive.value.rays' },
  sensorRange: { short: 'bar.value.carLengths', full: 'drive.value.carLengths' },
  sensorSpread: { short: 'drive.value.degrees', full: 'drive.value.degrees' },
  maxSpeed: { short: 'bar.value.speed', full: 'drive.value.speed' },
});

/**
 * @param {object} spec
 * @param {object} spec.i18n
 * @param {object} spec.settings ajustes con las claves de la barra
 * @param {(key:string, value:any, info:{final:boolean, first:boolean}) => void} spec.onChange
 * @param {() => void} spec.onReset
 * @param {string} [spec.idPrefix]
 * @param {(key:string) => string} [spec.help] clave de ayuda de cada ajuste en la pestaña
 * @param {string} [spec.trackHelp] ayuda del rótulo de las pistas
 * @param {string} [spec.noTrafficHelp] ayuda de los ajustes de tráfico en un circuito
 * @param {string} [spec.resetHelp]
 * @param {string[]} [spec.omit] grupos que la pestaña no usa (pestana-competir D12): no se crean, ni
 *   ocultos ni en el orden del foco; los demás conservan su orden
 * @param {{after:string, node:HTMLElement}[]} [spec.extra] grupos propios de la pestaña (barra-escenario,
 *   "Grupo propio de una pestaña"), armados con `barGroupNode`, que van después del grupo `after`
 * @returns {{node:HTMLElement, sync:(settings:object)=>void, slot:(group:string)=>HTMLElement, dispose:()=>void}}
 */
export function scenarioBar({
  i18n, settings, onChange, onReset, idPrefix = 'bar',
  help = (key) => `drive.${key}`, trackHelp = 'track', noTrafficHelp = 'drive.noTraffic', resetHelp = 'drive.resetSettings',
  omit = [], extra = [],
}) {
  const shown = (id) => !omit.includes(id);
  const setText = createTextSetter(i18n);
  let current = settings;
  const circuit = () => isCircuit(current.track);

  // --- Pistas: un grupo de radio con tabindex itinerante ----------------------------------------
  const trackLabelId = `${idPrefix}-track-label`;
  const trackOptions = TRACK_IDS.map((id) => {
    const option = el('button', {
      class: 'bar-track', help: `track.option.${id}`,
      i18nAttr: `aria-label:track.${id}`,
      attrs: { type: 'button', role: 'radio', 'aria-checked': 'false', tabindex: '-1' },
      dataset: { track: id },
      on: { click: () => chooseTrack(id) },
    }, thumbnailSvg(document, id, { width: 30, height: 21 }), el('span', { class: 'bar-track-name', i18n: `track.short.${id}`, attrs: { 'aria-hidden': 'true' } }));
    return { id, option };
  });
  const trackGroup = el('div', {
    class: 'bar-tracks', attrs: { role: 'radiogroup', 'aria-labelledby': trackLabelId },
    on: { keydown: onTrackKey },
  }, trackOptions.map((o) => o.option));

  function chooseTrack(id, { focus = false } = {}) {
    if (focus) trackOptions.find((o) => o.id === id)?.option.focus();
    if (id !== current.track) onChange('track', id, { final: true, first: true });
  }
  function onTrackKey(e) {
    const to = trackAfterKey(current.track, e.key);
    if (!to) return;
    // Las flechas mueven la elección y no llegan al manejo del auto ni a los atajos de la pestaña.
    e.preventDefault();
    e.stopPropagation();
    chooseTrack(to, { focus: true });
  }

  // --- Carriles ---------------------------------------------------------------------------------
  const laneLabelId = `${idPrefix}-lanes-label`;
  const laneButtons = LANE_OPTIONS.map((n) => {
    const b = el('button', {
      class: 'segment', i18n: 'drive.lanes.option', params: { n }, help: help('lanes'),
      i18nAttr: 'aria-label:drive.lanes.optionLabel',
      attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { lanes: String(n) },
      on: { click: () => { if (!circuit() && n !== current.lanes) onChange('lanes', n, { final: true, first: true }); } },
    });
    b.optionValue = n;
    return b;
  });
  const lanes = el('div', { class: 'bar-control bar-lanes' },
    el('span', { class: 'bar-name', i18n: 'bar.lanes', attrs: { id: laneLabelId } }),
    el('div', { class: 'segments', attrs: { role: 'group', 'aria-labelledby': laneLabelId } }, laneButtons));

  // --- Deslizadores -----------------------------------------------------------------------------
  const omittedKeys = BAR_GROUPS.filter((g) => !shown(g.id)).flatMap((g) => g.keys);
  const sliders = new Map(SLIDERS.filter((s) => !omittedKeys.includes(s.key)).map((s) => {
    const id = `${idPrefix}-${s.key}`;
    const value = el('output', { class: 'bar-value', attrs: { for: id, 'aria-hidden': 'true' } });
    const gesture = createSliderGesture((v, info) => onChange(s.key, v, info));
    const input = el('input', {
      help: help(s.key), i18nAttr: `aria-label:drive.${s.key}`,
      attrs: { type: 'range', id, min: s.min, max: s.max, step: s.step, value: current[s.key] },
      on: {
        input: (e) => {
          if (TRAFFIC_KEYS.includes(s.key) && circuit()) { e.target.value = String(current[s.key]); return; }
          const v = Number(e.target.value);
          showValue(s.key, v);
          gesture.input(v);
        },
        change: (e) => {
          if (TRAFFIC_KEYS.includes(s.key) && circuit()) return;
          gesture.change(Number(e.target.value));
        },
      },
    });
    const node = el('div', { class: 'bar-control' },
      el('label', { class: 'bar-label', attrs: { for: id } }, el('span', { class: 'bar-name', i18n: `bar.${s.key}` }), value),
      input);
    return [s.key, { ...s, input, value, node, gesture }];
  }));
  const sliderNode = (key) => sliders.get(key).node;

  /** Muestra el valor `v` del deslizador `key` (corto a la vista, completo para lectores de pantalla). */
  function showValue(key, v) {
    const s = sliders.get(key);
    const params = { value: v, kmh: Math.round(v * 3.6) };
    setText(s.value, FORMATS[key].short, params);
    const full = i18n.t(FORMATS[key].full, params);
    if (s.input.getAttribute('aria-valuetext') !== full) s.input.setAttribute('aria-valuetext', full);
  }

  // --- Grupos ----------------------------------------------------------------------------------
  const slots = {};
  const group = (id, labelProps, ...children) => {
    slots[id] = el('div', { class: 'bar-slot' });
    const label = el('span', { class: 'bar-group-label', ...labelProps });
    // Las pistas ya son un grupo de radio con este mismo rótulo: no se anuncian dos veces.
    const role = id === 'track' ? null : 'group';
    return el('div', { class: `bar-group bar-group-${id}`, attrs: { role, 'aria-labelledby': role ? labelProps.attrs.id : null } },
      label, el('div', { class: 'bar-group-body' }, ...children), slots[id]);
  };
  const resetButton = el('button', {
    class: 'tool bar-reset', i18n: 'bar.reset', help: resetHelp, attrs: { type: 'button' },
    on: { click: () => onReset() },
  });
  slots.reset = el('div', { class: 'bar-slot' });

  const node = el('div', { class: 'scenario-bar', i18nAttr: 'aria-label:bar.title', attrs: { role: 'group' } },
    ...[
      () => group('track', { i18n: 'bar.group.track', help: trackHelp, attrs: { id: trackLabelId } }, trackGroup),
      () => group('traffic', { i18n: 'bar.group.traffic', attrs: { id: `${idPrefix}-traffic-label` } },
        lanes, sliderNode('density'), sliderNode('irregularity')),
      () => group('sensors', { i18n: 'bar.group.sensors', attrs: { id: `${idPrefix}-sensors-label` } },
        sliderNode('sensorCount'), sliderNode('sensorRange'), sliderNode('sensorSpread')),
      () => group('car', { i18n: 'bar.group.car', attrs: { id: `${idPrefix}-car-label` } }, sliderNode('maxSpeed')),
    ].flatMap((make, i) => (shown(BAR_GROUPS[i].id) ? [make()] : [])
      .concat(extra.filter((x) => x.after === BAR_GROUPS[i].id).map((x) => x.node))),
    el('div', { class: 'bar-group bar-group-reset' }, resetButton, slots.reset));

  /** Muestra los valores de `next`. Un deslizador que se está arrastrando conserva el suyo. */
  function sync(next) {
    current = next;
    for (const o of trackOptions) {
      const on = o.id === current.track;
      if (o.option.getAttribute('aria-checked') !== String(on)) o.option.setAttribute('aria-checked', String(on));
      const tab = on ? '0' : '-1';
      if (o.option.getAttribute('tabindex') !== tab) o.option.setAttribute('tabindex', tab);
    }
    const onCircuit = circuit();
    for (const b of laneButtons) {
      const pressed = String(b.optionValue === current.lanes);
      if (b.getAttribute('aria-pressed') !== pressed) b.setAttribute('aria-pressed', pressed);
      setUnavailable(b, onCircuit, help('lanes'), noTrafficHelp);
    }
    for (const [key, s] of sliders) {
      if (TRAFFIC_KEYS.includes(key)) setUnavailable(s.input, onCircuit, help(key), noTrafficHelp);
      if (s.gesture.active) continue;
      if (Number(s.input.value) !== current[key]) s.input.value = String(current[key]);
      showValue(key, current[key]);
    }
  }
  sync(current);
  const offLanguage = i18n.onChange(() => sync(current));

  return {
    node,
    sync,
    /** Lugar pegado a la barra, debajo de un grupo ('sensors', 'reset', …), para una confirmación. */
    slot: (id) => slots[id],
    dispose() { offLanguage(); node.remove(); },
  };
}
