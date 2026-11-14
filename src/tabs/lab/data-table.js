// Tabla de datos del Laboratorio (pestana-laboratorio D14): una fila por ejemplo con sus entradas, la
// respuesta correcta, lo que la red contesta ahora, si acierta y su grupo; arriba, el resumen y dos
// filtros. Es una tabla de verdad (<table>, encabezados con scope) con solo las filas a la vista en el
// DOM: filas de alto fijo y un relleno arriba y abajo, con aria-rowcount y aria-rowindex.
//
// La cuenta (qué acierta cada ejemplo) es del núcleo: evaluatedRows y filterRows (datasets.js).
import { el, setData } from '../../ui/dom.js';
import { formatValue } from '../../ui/i18n.js';

/** Alto de una fila (px) y filas de más que se dibujan arriba y abajo de lo visible. */
export const ROW_HEIGHT = 24;
export const ROW_BUFFER = 6;
/** Orden de los controles en las flechas (como en "Ejemplo en curso"). */
const CONTROL_ORDER = ['forward', 'left', 'right', 'reverse'];
const ARROW = { forward: '↑', left: '←', right: '→', reverse: '↓' };

/** Qué filas dibujar para un desplazamiento: { from, to } (to sin incluir). Pura, para las pruebas. */
export function visibleWindow({ scrollTop, height, count, rowHeight = ROW_HEIGHT, buffer = ROW_BUFFER }) {
  const from = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const to = Math.min(count, Math.ceil((scrollTop + height) / rowHeight) + buffer);
  return { from, to: Math.max(from, to) };
}

/**
 * @param {{container:HTMLElement, i18n:object, onSelect:(index:number|null)=>void, onFilter:(f:object)=>void}} spec
 */
export function createDataTable({ container, i18n, onSelect, onFilter }) {
  const t = (k, p) => i18n.t(k, p);
  const fmt = (v) => formatValue(v, i18n.language);
  const summary = el('p', { class: 'lab-dt-summary', attrs: { role: 'status' } });
  const seg = (key, values, help) => values.map((v) => el('button', {
    class: 'segment', i18n: `lab.dt.${key}.${v}`, help: `${help}.${v}`,
    attrs: { type: 'button', 'aria-pressed': 'false' }, dataset: { [key]: v },
    on: { click: () => onFilter(key === 'failing' ? { failing: v === 'failing' } : { group: v }) },
  }));
  const failingButtons = seg('failing', ['all', 'failing'], 'lab.dt.failing');
  const groupButtons = seg('group', ['all', 'practice', 'heldOut'], 'lab.dt.group');
  const filters = el('div', { class: 'lab-dt-filters' },
    el('div', { class: 'segments', attrs: { role: 'group' }, i18nAttr: 'aria-label:lab.dt.failing.label' }, failingButtons),
    el('div', { class: 'segments', attrs: { role: 'group' }, i18nAttr: 'aria-label:lab.dt.group.label' }, groupButtons));
  const head = el('div', { class: 'lab-dt-head' }, summary, filters);
  const thead = el('thead');
  const tbody = el('tbody');
  const table = el('table', { class: 'lab-dt-table', attrs: { 'aria-labelledby': 'lab-dt-caption' } },
    el('caption', { class: 'sr-only', i18n: 'lab.dt.caption', attrs: { id: 'lab-dt-caption' } }), thead, tbody);
  const empty = el('p', { class: 'lab-dt-empty muted' });
  const scroll = el('div', {
    class: 'lab-dt-scroll', help: 'lab.dt.table', dataset: { shortcuts: 'pass' },
    attrs: { tabindex: '0', role: 'group' }, i18nAttr: 'aria-label:lab.dt.caption',
    on: { scroll: () => paint(), keydown: (e) => onKey(e) },
  }, table, empty);
  const root = el('div', { class: 'lab-dt' }, head, scroll);
  container.append(root);

  let model = null; // { rows (filtradas), kind, names, columns, summary, current, selected, filter }
  let colsKey = '';
  let focusRow = 0; // fila (en la lista filtrada) con el foco del teclado
  let lastFrame = '';

  function columnsFor(kind, inputNames) {
    if (kind === 'points') return ['n', 'x', 'y', 'target', 'answer', 'result', 'group'];
    return ['n', ...inputNames.map((_, i) => `in${i}`), 'target', 'answer', 'result', 'group'];
  }
  function header(kind, inputNames) {
    const cols = columnsFor(kind, inputNames);
    const label = (c) => {
      if (c.startsWith('in')) return inputNames[Number(c.slice(2))];
      if (kind === 'points' && (c === 'x' || c === 'y')) return c;
      return t(`lab.dt.col.${kind === 'driving' && (c === 'target' || c === 'answer') ? `${c}.driving` : c}`);
    };
    thead.replaceChildren(el('tr', { attrs: { 'aria-rowindex': '1' } }, cols.map((c) => el('th', { class: `lab-dt-${c.startsWith('in') ? 'in' : c}`, attrs: { scope: 'col' } }, label(c)))));
  }
  const pressed = (values) => CONTROL_ORDER.filter((_, k) => values[k] > 0.5);
  const arrows = (values) => { const on = pressed(values); return on.length === 0 ? '·' : on.map((k) => ARROW[k]).join(' '); };
  const classOf = (v) => (v > 0.5 ? 'a' : 'b');

  function cells(r) {
    const m = model;
    const out = [el('th', { class: 'lab-dt-n', attrs: { scope: 'row' } }, String(r.index + 1))];
    if (m.kind === 'points') {
      out.push(el('td', { class: 'num' }, fmt(r.inputs[0])), el('td', { class: 'num' }, fmt(r.inputs[1])));
      const tc = classOf(r.targets[0]);
      const ac = classOf(r.outputs[0]);
      out.push(el('td', {}, el('span', { class: `lab-dt-mark mark-${tc}`, attrs: { 'aria-hidden': 'true' } }), ' ', t(`lab.dt.class.${tc}`)));
      out.push(el('td', {}, el('span', { class: `lab-dt-mark mark-${ac}`, attrs: { 'aria-hidden': 'true' } }), ' ', fmt(r.outputs[0])));
    } else {
      r.inputs.forEach((v) => out.push(el('td', { class: 'num' }, fmt(v))));
      const target = pressed(r.targets);
      const answer = pressed(r.outputs);
      out.push(el('td', { class: 'lab-dt-arrows', attrs: { 'aria-label': target.map((k) => t(`drive.action.${k}`)).join(', ') || t('lab.dt.none') } }, arrows(r.targets)));
      const ans = el('td', { class: 'lab-dt-arrows', attrs: { 'aria-label': (answer.map((k) => t(`drive.action.${k}`)).join(', ') || t('lab.dt.none')) + (r.mismatched.length ? `. ${t('lab.dt.mismatch', { list: r.mismatched.map((k) => t(`drive.action.${CONTROL_ORDER[k]}`)).join(', ') })}` : '') } });
      CONTROL_ORDER.forEach((k, idx) => {
        if (!(r.outputs[idx] > 0.5) && !r.mismatched.includes(idx)) return;
        ans.append(el('span', { class: r.mismatched.includes(idx) ? 'lab-dt-miss' : '' }, r.outputs[idx] > 0.5 ? ARROW[k] : `(${ARROW[k]})`), ' ');
      });
      if (!ans.childNodes.length) ans.textContent = '·';
      out.push(ans);
    }
    out.push(el('td', { class: 'lab-dt-result', attrs: { 'aria-label': t(r.correct ? 'lab.dt.right' : 'lab.dt.wrong') } }, r.correct ? '✓' : '✗'));
    out.push(el('td', { class: 'lab-dt-group' }, t(`lab.dt.groupName.${r.group}`)));
    return out;
  }

  function paint() {
    if (!model) return;
    const rows = model.rows;
    const { from, to } = visibleWindow({ scrollTop: scroll.scrollTop, height: scroll.clientHeight || 300, count: rows.length });
    const frame = `${from}:${to}:${model.version}:${model.current}:${model.selected}:${focusRow}:${i18n.language}`;
    if (frame === lastFrame) return;
    lastFrame = frame;
    const cols = model.columns.length;
    const pad = (h) => el('tr', { class: 'lab-dt-pad', attrs: { 'aria-hidden': 'true' } }, el('td', { attrs: { colspan: String(cols) }, dataset: {} }));
    const top = pad();
    top.firstChild.style.height = `${from * ROW_HEIGHT}px`;
    const bottom = pad();
    bottom.firstChild.style.height = `${(rows.length - to) * ROW_HEIGHT}px`;
    const list = [top];
    for (let k = from; k < to; k++) {
      const r = rows[k];
      const tr = el('tr', {
        class: 'lab-dt-row',
        attrs: { 'aria-rowindex': String(k + 2), 'aria-selected': String(r.index === model.selected), id: `lab-dt-row-${k}` },
        dataset: { correct: String(r.correct), current: String(r.index === model.current), focus: String(k === focusRow), index: String(r.index) },
        on: { click: () => { focusRow = k; onSelect(r.index === model.selected ? null : r.index); } },
      }, cells(r));
      list.push(tr);
    }
    list.push(bottom);
    tbody.replaceChildren(...list);
  }

  function onKey(e) {
    if (!model || model.rows.length === 0) return;
    const n = model.rows.length;
    const page = Math.max(1, Math.floor(scroll.clientHeight / ROW_HEIGHT) - 1);
    const to = { ArrowDown: focusRow + 1, ArrowUp: focusRow - 1, PageDown: focusRow + page, PageUp: focusRow - page, Home: 0, End: n - 1 }[e.key];
    if (to !== undefined) {
      e.preventDefault();
      e.stopPropagation();
      focusRow = Math.max(0, Math.min(n - 1, to));
      reveal(focusRow);
      lastFrame = '';
      paint();
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      const r = model.rows[focusRow];
      onSelect(r.index === model.selected ? null : r.index);
    }
  }
  /** Deja la fila k a la vista. */
  function reveal(k) {
    const y = k * ROW_HEIGHT;
    const h = scroll.clientHeight - (thead.offsetHeight || ROW_HEIGHT);
    if (y < scroll.scrollTop) scroll.scrollTop = y;
    else if (y + ROW_HEIGHT > scroll.scrollTop + h) scroll.scrollTop = y + ROW_HEIGHT - h;
  }

  /**
   * @param {object} spec
   * @param {object[]} spec.rows las filas ya filtradas (filterRows)
   * @param {object} spec.summary el resumen de todas (evaluatedRows)
   * @param {'points'|'driving'} spec.kind
   * @param {string[]} spec.inputNames
   * @param {number|null} spec.current índice del ejemplo en curso
   * @param {number|null} spec.selected índice de la fila elegida
   * @param {{failing:boolean, group:string}} spec.filter
   * @param {string|number} spec.version cambia cuando cambian las filas
   */
  function render(spec) {
    const key = `${spec.kind}|${spec.inputNames.join(',')}|${i18n.language}`;
    if (key !== colsKey) { colsKey = key; header(spec.kind, spec.inputNames); }
    const prevCurrent = model?.current;
    model = { ...spec, columns: columnsFor(spec.kind, spec.inputNames) };
    table.setAttribute('aria-rowcount', String(spec.rows.length + 1));
    const s = spec.summary;
    const text = t('lab.dt.summary', { correct: s.correct, count: s.count, pc: s.practice.correct, pn: s.practice.count, hc: s.heldOut.correct, hn: s.heldOut.count });
    if (summary.textContent !== text) summary.textContent = text;
    for (const b of failingButtons) { const v = String((b.dataset.failing === 'failing') === spec.filter.failing); if (b.getAttribute('aria-pressed') !== v) b.setAttribute('aria-pressed', v); }
    for (const b of groupButtons) { const v = String(b.dataset.group === spec.filter.group); if (b.getAttribute('aria-pressed') !== v) b.setAttribute('aria-pressed', v); }
    const none = spec.rows.length === 0;
    empty.hidden = !none;
    table.hidden = none;
    if (none) {
      const why = spec.filter.failing ? (spec.filter.group === 'all' ? 'lab.dt.empty.allRight' : `lab.dt.empty.allRight.${spec.filter.group}`) : 'lab.dt.empty.none';
      if (empty.textContent !== t(why)) empty.textContent = t(why);
    }
    if (focusRow >= spec.rows.length) focusRow = Math.max(0, spec.rows.length - 1);
    // El ejemplo en curso queda a la vista si el filtro lo incluye.
    if (spec.current !== null && spec.current !== prevCurrent) {
      const k = spec.rows.findIndex((r) => r.index === spec.current);
      if (k >= 0) reveal(k);
    }
    lastFrame = '';
    paint();
  }

  return {
    node: root,
    render,
    /** Vuelve arriba y quita el foco de fila (datos nuevos). */
    resetScroll() { scroll.scrollTop = 0; focusRow = 0; lastFrame = ''; },
    get scroller() { return scroll; },
    dispose() { root.remove(); },
  };
}
