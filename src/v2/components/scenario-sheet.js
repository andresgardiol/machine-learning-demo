// Hoja "Escenario" del cuaderno (tarea 9.3, design.md D7): la misma en todas las etapas con auto. Los
// valores que la etapa fija llevan el rótulo "de esta etapa"; los demás son del escenario común y un
// cambio se ve en las otras etapas. "Restablecer escenario" ofrece "Deshacer".
import { el } from '../dom.js';
import { formatNumber } from '../../ui/i18n.js';
import { SLIDERS, LANE_OPTIONS } from '../../tabs/shared/street-settings.js';
import { TRACK_IDS } from '../../core/circuits.js';
import { slider, segments, grid, group, button, undoNotice, stageTag } from './controls.js';

const range = (key) => SLIDERS.find((s) => s.key === key);

/**
 * @param {{ i18n, scenario, stage: string, panel: HTMLElement, tracks?: boolean, v1Prefix?: string }} spec
 *   v1Prefix: prefijo de las claves de ayuda de la V1 que cubre cada control (data-v1, para la paridad).
 */
export function mountScenarioSheet({ i18n, scenario, stage, panel, tracks = true, v1 = {} }) {
  const fmt = (key) => (v) => (key === 'maxSpeed' ? i18n.t('value.speed', { v: formatNumber(v, i18n.language) }) : i18n.t('value.percent', { v: formatNumber(v, i18n.language) }));
  const set = (key) => (v) => scenario.set(stage, key, v);
  const s0 = scenario.forStage(stage);
  const controls = {};
  const tagged = (key, element) => { element.dataset.key = key; return element; };

  if (tracks) {
    controls.track = segments({
      labelKey: 'scenario.track', help: 'scenario.track', wide: true, value: s0.track, onChange: set('track'),
      options: TRACK_IDS.map((id) => ({ value: id, labelKey: `track.${id}`, dataset: v1.track ? { v1: `track.option.${id}` } : {} })),
    });
  }
  controls.lanes = segments({ labelKey: 'scenario.lanes', help: 'scenario.lanes', value: s0.lanes, onChange: set('lanes'), options: LANE_OPTIONS.map((n) => ({ value: n, text: String(n) })) });
  for (const key of ['maxSpeed', 'density', 'irregularity']) {
    const r = range(key);
    controls[key] = slider({ labelKey: `scenario.${key}`, help: `scenario.${key}`, min: r.min, max: r.max, step: r.step, value: s0[key], format: fmt(key), onInput: set(key) });
  }
  for (const [key, c] of Object.entries(controls)) {
    tagged(key, c.element);
    if (v1[key]) c.element.dataset.v1 = v1[key];
  }
  const tags = Object.fromEntries(Object.keys(controls).map((k) => [k, stageTag('tag.stage')]));
  for (const [k, t] of Object.entries(tags)) controls[k].element.querySelector('.v2-setting-name')?.append(' ', t);

  const notice = undoNotice({ i18n });
  const reset = button({
    level: 'tertiary', labelKey: 'scenario.reset', help: 'scenario.reset', attrs: v1.reset ? { 'data-v1': v1.reset } : {},
    onClick: () => {
      const before = { common: scenario.common, stage: scenario.forStage(stage) };
      scenario.resetCommon();
      scenario.resetStage(stage);
      notice.show('scenario.resetDone', () => {
        for (const k of Object.keys(before.common)) scenario.set(null, k, before.common[k]);
        for (const k of scenario.fixedKeys(stage)) scenario.set(stage, k, before.stage[k]);
      });
    },
  });
  const allShared = scenario.fixedKeys(stage).length === 0;
  panel.append(group({ titleKey: 'scenario.title', tagKey: allShared ? 'tag.shared' : null },
    grid(2, ...(controls.track ? [controls.track.element] : []), controls.lanes.element, controls.maxSpeed.element, controls.density.element, controls.irregularity.element)),
  reset, notice.element);
  if (allShared) panel.querySelector('.v2-tag')?.classList.add('v2-tag-shared');

  function refresh() {
    const s = scenario.forStage(stage);
    for (const [key, c] of Object.entries(controls)) c.set(s[key]);
    for (const [key, t] of Object.entries(tags)) t.hidden = !scenario.isFixed(stage, key);
  }
  const off = scenario.subscribe(refresh);
  i18n.onChange(refresh);
  refresh();
  return { refresh, dispose: off, controls };
}
