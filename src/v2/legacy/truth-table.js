// Copia para la V2 de src/tabs/lab/truth-table.js (interfaz-v2, grupo 15): la V2 no importa la pantalla de la V1 (design.md D5).
// Cambian las importaciones y las clases de los botones; la conducta es la misma.
// Tabla de verdad de las compuertas (laboratorio-empieza-por-compuertas D6): una fila por caso con
// las dos entradas, la respuesta correcta, lo que contesta la red con su seguridad y una marca de
// acierto que no depende solo del color (✓ y ✗, con texto para el lector de pantalla), más el total.
// Es una <table> con encabezados; el total va en el <caption>, así el lector lo anuncia con la tabla.
//
// Una fila elegida (clic o Enter en su botón) le pide a la pestaña que lleve las entradas a ese caso;
// la fila del caso que muestran las entradas y la del ejemplo que se está corrigiendo se destacan.
//
// La cuenta es pura (truthRows), para probarla.
import { el, setData } from '../dom.js';
import { softOutputs, outputCorrect } from '../../core/backprop.js';

/**
 * Las filas: { inputs, target, output, verdict ('yes' | 'no' | 'undecided'), confidence, correct }, y
 * cuántas acierta. Exactamente 0,5 "no se decide" y no es acierto.
 */
export function truthRows(net, examples, off = null) {
  const rows = examples.map((ex) => {
    const output = softOutputs(net, ex.inputs, off)[0];
    const verdict = output > 0.5 ? 'yes' : output < 0.5 ? 'no' : 'undecided';
    return { inputs: ex.inputs, target: ex.targets[0], output, verdict, confidence: Math.max(output, 1 - output), correct: outputCorrect(output, ex.targets[0]) };
  });
  return { rows, correct: rows.filter((r) => r.correct).length, count: rows.length };
}

/**
 * @param {{i18n:object, onSelect:(index:number)=>void}} spec
 */
export function createTruthTable({ i18n, onSelect }) {
  const t = (k, p) => i18n.t(k, p);
  const caption = el('caption', { class: 'lab-tt-caption' });
  const head = el('tr', {}, ['a', 'b', 'target', 'net', 'mark'].map((k) => el('th', {
    class: `lab-tt-${k}`, attrs: { scope: 'col' }, i18n: `lab.tt.${k}`, help: k === 'net' ? 'lab.tt.net' : k === 'mark' ? 'lab.tt.mark' : undefined,
  })));
  const body = el('tbody');
  const table = el('table', { class: 'lab-tt', help: 'lab.tt' }, caption, el('thead', {}, head), body);
  const note = el('p', { class: 'caption lab-tt-note', attrs: { role: 'status' } });
  const node = el('div', { class: 'lab-truth' }, table, note);
  let rows = [];

  function build(n) {
    body.replaceChildren();
    rows = Array.from({ length: n }, (_, i) => {
      const pick = el('button', { class: 'lab-tt-pick', help: 'lab.tt.pick', attrs: { type: 'button' }, dataset: { focus: 'keep' }, on: { click: (e) => { e.stopPropagation(); onSelect(i); } } });
      const cells = { a: el('td', { class: 'lab-tt-a' }, pick), b: el('td', { class: 'lab-tt-b' }), target: el('td', { class: 'lab-tt-target' }), net: el('td', { class: 'lab-tt-net' }), mark: el('td', { class: 'lab-tt-mark' }) };
      const tr = el('tr', { on: { click: () => onSelect(i) } }, cells.a, cells.b, cells.target, cells.net, cells.mark);
      body.append(tr);
      return { tr, pick, cells };
    });
  }
  const write = (n, text) => { if (n.textContent !== text) n.textContent = text; };

  return {
    node,
    /**
     * @param {object} state
     * @param {ReturnType<typeof truthRows>} state.table
     * @param {number|null} state.shown fila del caso que muestran las entradas (o null)
     * @param {number|null} state.current fila del ejemplo que se está corrigiendo (o null)
     * @param {string} [state.note] texto junto a la tabla (por ejemplo, "esta vez la resolvió el aprendizaje")
     */
    render({ table: tt, shown = null, current = null, note: noteText = '' }) {
      if (rows.length !== tt.rows.length) build(tt.rows.length);
      write(caption, t('lab.tt.caption', { correct: tt.correct, count: tt.count }));
      setData(node, 'solved', String(tt.correct === tt.count));
      tt.rows.forEach((r, i) => {
        const x = rows[i];
        const [a, b] = r.inputs;
        write(x.pick, String(a));
        const label = t('lab.tt.pick', { a, b });
        if (x.pick.getAttribute('aria-label') !== label) x.pick.setAttribute('aria-label', label);
        write(x.cells.b, String(b));
        write(x.cells.target, t(`lab.tt.${r.target >= 0.5 ? 'yes' : 'no'}`));
        write(x.cells.net, r.verdict === 'undecided' ? t('lab.tt.undecided') : t('lab.tt.answer', { answer: t(`lab.tt.${r.verdict}`), pct: Math.round(r.confidence * 100) }));
        // ✓ o ✗ a la vista; para el lector, la palabra.
        const mark = r.correct ? '✓' : '✗';
        if (x.cells.mark.dataset.mark !== mark) {
          x.cells.mark.dataset.mark = mark;
          x.cells.mark.replaceChildren(el('span', { attrs: { 'aria-hidden': 'true' } }, mark), el('span', { class: 'v2-sr-only', i18n: r.correct ? 'lab.tt.right' : 'lab.tt.wrong' }));
          i18n.translateTree(x.cells.mark);
        }
        setData(x.tr, 'correct', String(r.correct));
        setData(x.tr, 'shown', String(i === shown));
        setData(x.tr, 'current', String(i === current));
        if (i === current) x.tr.setAttribute('aria-current', 'true'); else x.tr.removeAttribute('aria-current');
      });
      write(note, noteText);
      note.hidden = noteText === '';
    },
  };
}
