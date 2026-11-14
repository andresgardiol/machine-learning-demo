// Tabla de pesos del inspector (pestana-inspeccionar, design.md D6): la misma red que el diagrama,
// como una tabla HTML de verdad por capa (la "matriz de pesos"), una al lado de la otra. Cada fila es
// una neurona, cada columna una entrada, y al final el sesgo y el valor de la neurona. Cada celda
// muestra el peso con dos decimales y lleva de fondo el color de su signo con la intensidad de su
// tamaño, con la convención del diagrama. Arriba de cada tabla, una tira con la actividad de sus
// entradas; al final de cada fila, la actividad de la neurona.
//
// Los pesos solo se reescriben cuando cambia la red o un cambio de prueba; en cada cuadro se
// actualizan las tiras de actividad, la columna de valores y el estado del paso a paso.
import { el, setData } from '../ui/dom.js';
import { formatValue } from '../ui/i18n.js';
import { activity } from './network-view.js';

/** Fondo de una celda: el color del signo con una opacidad según el tamaño del peso (0,08 a 0,6). */
export function cellLook(weight) {
  const a = Math.min(1, Math.abs(weight));
  return { sign: weight < 0 ? 'negative' : 'positive', alpha: a === 0 ? 0 : 0.08 + 0.52 * a };
}

/**
 * @param {{container:HTMLElement, i18n:object, onSelect:(t:{layer:number, neuron:number, input?:number})=>void,
 *   headerFor:(layer:number)=>HTMLElement, names:{layer:(l:number)=>string, neuron:(l:number, j:number)=>string}}} spec
 */
export function createWeightTable({ container, i18n, onSelect, headerFor, names }) {
  const fmt = (v) => formatValue(v, i18n.language);
  const root = el('div', { class: 'weight-tables' });
  container.append(root);
  let built = null; // { key, tables: [{ layer, wrap, strip:[], rows:[{tr, cells:[], bias, value, name}] }] }

  const write = (n, text) => { if (n.textContent !== text) n.textContent = text; };

  function build(sizes) {
    root.replaceChildren();
    const tables = [];
    // Entradas: no tienen pesos; su bloque es el encabezado y una fila con lo que recibe la red.
    {
      const names0 = el('tr', {}, el('th', { attrs: { scope: 'col' }, class: 'wt-corner' }));
      const values0 = el('tr', { class: 'wt-strip' }, el('th', { attrs: { scope: 'row' }, class: 'wt-strip-name' }, i18n.t('inspect.card.value')));
      const strip = [];
      for (let i = 0; i < sizes[0]; i++) {
        names0.append(el('th', { attrs: { scope: 'col', title: names.neuron(0, i) }, class: 'wt-col' }, names.neuron(0, i)));
        const fill = el('span', { class: 'wt-strip-fill' });
        const text = el('span', { class: 'wt-strip-text num' });
        const cell = el('td', { class: 'wt-strip-cell wt-input-cell', on: { click: () => onSelect({ layer: 0, neuron: i }) } }, fill, text);
        values0.append(cell);
        strip.push({ cell, fill, text });
      }
      const table = el('table', { class: 'weight-table wt-inputs', dataset: { layer: '0' } },
        el('caption', { class: 'sr-only' }, names.layer(0)), el('thead', {}, names0), el('tbody', {}, values0));
      const scroll = el('div', { class: 'wt-scroll' }, table);
      const wrap = el('section', { class: 'wt-layer', dataset: { layer: '0' } }, headerFor(0), scroll);
      root.append(wrap);
      tables.push({ layer: 0, wrap, scroll, strip, rows: [], weightsKey: '' });
    }
    for (let l = 1; l < sizes.length; l++) {
      const head = headerFor(l);
      const inputs = sizes[l - 1];
      const strip = [];
      const theadRow = el('tr', {}, el('th', { attrs: { scope: 'col' }, class: 'wt-corner' }, el('span', { class: 'sr-only' }, i18n.t('inspect.table.neuron'))));
      const stripRow = el('tr', { class: 'wt-strip' }, el('th', { attrs: { scope: 'row' }, class: 'wt-strip-name' }, i18n.t('inspect.table.inputs')));
      for (let i = 0; i < inputs; i++) {
        theadRow.append(el('th', { attrs: { scope: 'col', title: names.neuron(l - 1, i) }, class: 'wt-col' }, names.neuron(l - 1, i)));
        const fill = el('span', { class: 'wt-strip-fill' });
        const cell = el('td', { class: 'wt-strip-cell' }, fill);
        stripRow.append(cell);
        strip.push({ cell, fill });
      }
      theadRow.append(el('th', { attrs: { scope: 'col' }, class: 'wt-col wt-bias-col', help: 'inspect.term.bias' }, i18n.t('inspect.op.bias')),
        el('th', { attrs: { scope: 'col' }, class: 'wt-col wt-value-col' }, i18n.t('inspect.card.value')));
      stripRow.append(el('td', {}), el('td', {}));
      const tbody = el('tbody');
      const rows = [];
      for (let j = 0; j < sizes[l]; j++) {
        const nameButton = el('button', {
          class: 'wt-name', attrs: { type: 'button' }, help: 'inspect.table.row', dataset: { focus: 'keep' },
          on: { click: () => onSelect({ layer: l, neuron: j }) },
        }, names.neuron(l, j));
        const tr = el('tr', { dataset: { neuron: String(j) } }, el('th', { attrs: { scope: 'row' } }, nameButton));
        const cells = [];
        for (let i = 0; i < inputs; i++) {
          const td = el('td', { class: 'wt-cell num', on: { click: () => onSelect({ layer: l, neuron: j, input: i }) } });
          tr.append(td);
          cells.push(td);
        }
        const bias = el('td', { class: 'wt-cell wt-bias num' });
        const valueFill = el('span', { class: 'wt-value-fill' });
        const valueText = el('span', { class: 'wt-value-text' });
        const value = el('td', { class: 'wt-value num' }, valueFill, valueText);
        tr.append(bias, value);
        tbody.append(tr);
        rows.push({ tr, cells, bias, value, valueFill, valueText, nameButton });
      }
      const table = el('table', { class: 'weight-table', dataset: { layer: String(l) } },
        el('caption', { class: 'sr-only' }, i18n.t('inspect.table.caption', { layer: names.layer(l) })),
        el('thead', {}, theadRow, stripRow), tbody);
      const scroll = el('div', { class: 'wt-scroll' }, table);
      const wrap = el('section', { class: 'wt-layer', dataset: { layer: String(l) } }, head, scroll);
      root.append(wrap);
      tables.push({ layer: l, wrap, scroll, strip, rows, weightsKey: '' });
    }
    return tables;
  }

  /**
   * @param {object} state el mismo que recibe el diagrama, más `changesVersion` y `visible`
   */
  function render(state) {
    root.hidden = state.visible === false;
    if (state.visible === false) return;
    const { sizes, trace, cursor, selected, collapsed = [], top, marks } = state;
    const key = `${sizes.join('-')}|${i18n.language}`;
    if (!built || built.key !== key) built = { key, tables: build(sizes) };
    for (const T of built.tables) {
      const l = T.layer;
      const isCollapsed = Boolean(collapsed[l]);
      if (l === 0) {
        setData(T.wrap, 'collapsed', String(isCollapsed));
        const thead = T.wrap.querySelector('thead');
        if (thead.hidden !== isCollapsed) thead.hidden = isCollapsed;
        trace.layers[0].neurons.forEach((n, i) => {
          const s = T.strip[i];
          const h = `${Math.round(activity(n.output) * 100)}%`;
          if (s.fill.style.height !== h) s.fill.style.height = h;
          write(s.text, isCollapsed ? '' : fmt(n.output));
          setData(s.cell, 'off', String(Boolean(n.off)));
          setData(s.cell, 'manual', String(Boolean(state.manual?.[i])));
          setData(s.cell, 'selected', String(Boolean(selected && selected.layer === 0 && selected.neuron === i)));
        });
        continue;
      }
      setData(T.wrap, 'collapsed', String(isCollapsed));
      const tbody = T.rows[0]?.tr.parentElement;
      if (tbody && tbody.hidden !== isCollapsed) tbody.hidden = isCollapsed;
      const headRow = T.wrap.querySelector('thead tr:first-child');
      if (headRow.hidden !== isCollapsed) headRow.hidden = isCollapsed;
      // Tira de actividad de las entradas de esta capa.
      const fromNeurons = trace.layers[l - 1].neurons;
      T.strip.forEach((s, i) => {
        const v = l - 1 === 0 || !cursor || cursor.opsDone(l - 1, i) === 4 ? activity(fromNeurons[i].output) : 0;
        const h = `${Math.round(v * 100)}%`;
        if (s.fill.style.height !== h) s.fill.style.height = h;
        setData(s.cell, 'off', String(Boolean(fromNeurons[i].off)));
      });
      if (isCollapsed) continue;
      // Pesos: solo si cambió la red, un cambio de prueba o el filtro.
      const neurons = trace.layers[l].neurons;
      const wKey = `${state.changesVersion}|${state.filter}`;
      const rewrite = T.weightsKey !== wKey;
      T.weightsKey = wKey;
      T.rows.forEach((r, j) => {
        const n = neurons[j];
        if (rewrite) {
          n.weights.forEach((w, i) => {
            const td = r.cells[i];
            const look = cellLook(w);
            const changed = marks?.changedWeights.has(`${l}:${j}:${i}`) ?? false;
            const off = Boolean(n.offConnections?.[i]);
            write(td, `${fmt(w)}${changed ? ' ◆' : ''}${off ? ' ×' : ''}`);
            td.style.setProperty('--wt-alpha', String(look.alpha));
            setData(td, 'sign', look.sign);
            setData(td, 'changed', String(changed));
            setData(td, 'off', String(off));
            setData(td, 'filtered', String(Boolean(top && top[l] && !top[l][j].has(i))));
          });
          const bl = cellLook(n.bias);
          const bChanged = marks?.changedBiases.has(`${l}:${j}`) ?? false;
          write(r.bias, `${fmt(n.bias)}${bChanged ? ' ◆' : ''}`);
          r.bias.style.setProperty('--wt-alpha', String(bl.alpha));
          setData(r.bias, 'sign', bl.sign);
          setData(r.bias, 'changed', String(bChanged));
        }
        const ops = cursor ? cursor.opsDone(l, j) : 4;
        const computed = ops === 4;
        write(r.valueText, computed ? fmt(n.output) : '–');
        const h = `${Math.round((computed ? activity(n.output) : 0) * 100)}%`;
        if (r.valueFill.style.width !== h) r.valueFill.style.width = h;
        setData(r.tr, 'state', cursor ? cursor.stateOf(l, j) : 'done');
        setData(r.tr, 'off', String(Boolean(n.off)));
        setData(r.tr, 'selected', String(Boolean(selected && selected.layer === l && selected.neuron === j)));
        r.nameButton.setAttribute('aria-pressed', r.tr.dataset.selected);
      });
    }
  }

  return {
    node: root,
    render,
    /** Lugar de la tabla de una capa (para el foco). */
    tableOf(layer) { return built?.tables.find((T) => T.layer === layer)?.wrap ?? null; },
    dispose() { root.remove(); },
  };
}
