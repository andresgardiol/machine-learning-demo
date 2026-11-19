// Copia para la V2 de src/tabs/rules/cards-view.js (interfaz-v2, grupo 11): la V2 arma su propia pantalla y
// no importa la de la V1 (design.md D5). Solo cambian las importaciones y las clases de los botones.
// La vista de fichas de Reglas a mano (reglas-como-fichas D3 a D6): dibuja las fichas que proyecta
// cards.js y avisa a la pestaña cada edición, que la pestaña escribe en el texto por el historial del
// editor. La vista no guarda ningún programa: se vuelve a dibujar desde el texto después de cada cambio.
//
//   createCardsView({ i18n, sensorCount, onEdit, onPreview, onEditAsText, onUndo })
//     -> { node, list, render(text), setMarks({ active, crash, errors }), setLive(perception),
//          focusPath(path), activePath(), focusLastAction(), dispose() }
//
// Cada control lleva un camino (data-path, por ejemplo `c4.cond0.op`) que sobrevive a volver a dibujar:
// así el foco vuelve al mismo control después de una edición. Si una edición solo cambia números (mover
// un umbral o una constante), la vista actualiza esos números en su lugar, sin rehacer los controles:
// el deslizador que se está arrastrando sigue siendo el mismo.
import { el } from '../../dom.js';
import { projectCards, movableUnits, formatNumber } from '../../../tabs/rules/cards.js';

/** Ancho del riel del umbral (D3) y de la perilla del deslizador (styles/app.css). */
export const RAIL_WIDTH = 88; // 120 px en D3; 88 en D8, para que las fichas entren en un renglón
const THUMB = 16;
/** Pasos del arrastre de un número que se escriben en vivo: uno cada 100 ms como mucho (D2). */
export const PREVIEW_MS = 100;

const OPERATORS = Object.freeze(['>', '<', '>=', '<=']);
const CONTROLS = Object.freeze(['forward', 'reverse', 'left', 'right']);

/** Firma de la forma de las fichas, sin los números ni las columnas: si no cambia, se actualiza en su lugar. */
function shapeOf(cards) {
  const operand = (o) => (o.kind === 'number' ? 'n' : o.kind === 'constant' ? `k:${o.name}:${o.definition}` : `${o.kind}:${o.index ?? ''}`);
  return JSON.stringify(cards.map((c) => {
    switch (c.kind) {
      case 'rule': return ['r', c.lines, c.conditions.map((x) => [operand(x.left), x.op.op, operand(x.right)]), c.actions.map((a) => a.control)];
      case 'order': return ['o', c.lines, c.actions.map((a) => a.control)];
      case 'constant': return ['k', c.lines, c.name];
      default: return [c.kind, c.lines, c.text];
    }
  }));
}

/** Posición (px) de la marca del valor en vivo sobre el riel: el centro de la perilla para ese valor. */
export const railX = (value) => THUMB / 2 + Math.min(1, Math.max(0, Number(value) || 0)) * (RAIL_WIDTH - THUMB);

/**
 * @param {{i18n: object, sensorCount: () => number,
 *   onEdit: (edit: object, opts: {focus?: string|null}) => void,
 *   onPreview: (edit: object) => void,
 *   onEditAsText: (line: number) => void,
 *   onUndo: (redo: boolean, focus: string|null) => void}} spec
 */
export function createCardsView({ i18n, sensorCount, onEdit, onPreview, onEditAsText, onUndo }) {
  const t = (key, params) => i18n.t(key, params);
  const constantsRow = el('div', { class: 'rules-constants', attrs: { role: 'group' }, i18nAttr: 'aria-label:rules.cards.constants' });
  const list = el('ol', { class: 'rules-cards', i18nAttr: 'aria-label:rules.cards.label' });
  const guide = el('div', { class: 'rules-cards-guide', attrs: { 'aria-hidden': 'true' } });
  guide.hidden = true;
  const scroller = el('div', { class: 'rules-cards-scroll' }, constantsRow, list, guide);
  // "Agregar regla" es la última ficha de la pila, con el estilo de una ficha vacía (D8, punto 5).
  const addButton = el('button', {
    class: 'v2-btn rules-cards-add', i18n: 'rules.cards.add', help: 'rules.cards.add',
    attrs: { type: 'button', 'data-path': 'add' }, on: { click: () => onEdit({ type: 'addRule' }, { focus: 'last-action' }) },
  });
  const addItem = el('li', { class: 'rules-card-add' }, addButton);
  const node = el('div', { class: 'rules-cards-view' }, scroller);

  let cards = [];
  let units = [];
  let shape = '';
  let language = i18n.language;
  let count = sensorCount();
  /** Controles que se actualizan en su lugar: deslizadores, números escritos, marcas en vivo y valores. */
  let live = [];
  /** Elemento de cada ficha, por índice de ficha, para las marcas. */
  let cardNodes = new Map();

  // --- Controles -------------------------------------------------------------------------------------

  /** `<select>` nativo con el estilo de la app (D3). Las opciones son [valor, texto]. */
  function select({ path, help, label, options, value, cls = '', onChange: change }) {
    const s = el('select', {
      class: `rules-card-select ${cls}`.trim(), help, attrs: { 'data-path': path, 'aria-label': label },
      on: { change: () => change(s.value) },
    }, options.map(([v, text]) => el('option', { text, attrs: { value: v } })));
    s.value = value;
    // Angosto, al largo de su palabra (D8, punto 3): el ancho lo pone la opción elegida, no la más larga.
    const chosen = options.find(([v]) => v === s.value) ?? options[0];
    s.style.setProperty('--chars', String(Math.max(1, [...String(chosen?.[1] ?? '')].length)));
    return s;
  }

  const datumOptions = (current) => {
    const n = Math.max(count, current?.kind === 'sensor' ? current.index : 0);
    const opts = Array.from({ length: n }, (_, i) => [`s${i + 1}`, t('rules.data.sensor', { n: i + 1 })]);
    opts.push(['speed', t('rules.data.speed')]);
    return opts;
  };
  const datumValue = (o) => (o.kind === 'speed' ? 'speed' : `s${o.index}`);
  const toDatum = (v) => (v === 'speed' ? 'speed' : { sensor: Number(v.slice(1)) });

  /** El selector de un dato (sensor o velocidad), con el color de "entra". */
  function datumSelect(o, path, side) {
    return select({
      path, help: side === 'left' ? 'rules.cards.datum' : 'rules.cards.datumRight', label: t('rules.cards.datum.label'),
      cls: 'tok-data', options: datumOptions(o), value: datumValue(o),
      onChange: (v) => onEdit({ type: 'setOperand', place: placeOf(path), datum: toDatum(v) }, { focus: path }),
    });
  }

  /** Lugar en el texto del token de un camino, leído de las fichas a la vista (las columnas cambian). */
  function placeOf(path) {
    const m = /^c(\d+)\.(?:cond(\d+)\.(left|op|right)|act(\d+)|const)$/.exec(path);
    if (!m) return null;
    const card = cards[Number(m[1])];
    if (!card) return null;
    if (m[4] !== undefined) return card.actions[Number(m[4])];
    if (path.endsWith('.const')) return card.number;
    const cond = card.conditions[Number(m[2])];
    return cond?.[m[3]];
  }

  /**
   * El umbral: un deslizador de 0 a 1 con la marca del valor en vivo y el número escrito al lado. Con una
   * constante, el deslizador mueve la constante (D5) y se ve su nombre.
   */
  function threshold(card, ci, cond, path) {
    const right = cond.right;
    const constant = right.kind === 'constant' ? cards.find((c) => c.kind === 'constant' && c.line === right.definition) : null;
    const editsConstant = Boolean(constant);
    const value = right.value;
    const constantPath = editsConstant ? `c${cards.indexOf(constant)}.const` : null;
    const editOf = (v) => (editsConstant
      ? { type: 'setConstant', place: placeOf(constantPath), value: v }
      : { type: 'setNumber', place: placeOf(`${path}.right`), value: v });
    const range = el('input', {
      class: 'rules-card-range', help: editsConstant ? 'rules.cards.constantThreshold' : 'rules.cards.threshold',
      attrs: {
        type: 'range', min: '0', max: '1', step: '0.01', value: String(Math.min(1, Math.max(0, value))),
        'data-path': `${path}.range`, 'aria-label': editsConstant ? t('rules.cards.constant.label', { name: right.name }) : t('rules.cards.threshold.label'),
        'data-help-params': editsConstant ? JSON.stringify({ name: right.name }) : null,
      },
    });
    // Mientras se arrastra, el auto responde en vivo cada 100 ms como mucho; al soltar se escribe un solo
    // paso en el historial (D2). Con el teclado, cada flecha es un paso.
    let last = 0;
    let timer = null;
    range.addEventListener('input', () => {
      const v = Number(range.value);
      const now = performance.now();
      const run = () => { timer = null; last = performance.now(); onPreview(editOf(Number(range.value))); };
      if (now - last >= PREVIEW_MS) run();
      else if (timer === null) timer = setTimeout(run, PREVIEW_MS - (now - last));
      writeNumber(v);
    });
    range.addEventListener('change', () => {
      if (timer !== null) { clearTimeout(timer); timer = null; }
      onEdit(editOf(Number(range.value)), { focus: `${path}.range` });
    });
    const marker = el('span', { class: 'rules-card-live', attrs: { 'aria-hidden': 'true' } });
    const rail = el('span', { class: 'rules-card-rail' }, range, marker);
    const number = el('input', {
      class: 'rules-card-number', help: editsConstant ? 'rules.cards.constantNumber' : 'rules.cards.number',
      attrs: {
        type: 'text', inputmode: 'decimal', autocomplete: 'off', spellcheck: 'false', size: '4',
        'data-path': `${path}.number`, 'aria-label': editsConstant ? t('rules.cards.constant.label', { name: right.name }) : t('rules.cards.number.label'),
        'data-help-params': editsConstant ? JSON.stringify({ name: right.name }) : null,
      },
    });
    function writeNumber(v) {
      const text = formatNumber(v, language);
      if (document.activeElement !== number && number.value !== text) number.value = text;
    }
    writeNumber(value);
    const commitNumber = () => {
      const v = Number(number.value.replace(',', '.'));
      if (!Number.isFinite(v)) { writeNumber(Number(range.value)); return; }
      onEdit(editOf(v), { focus: `${path}.number` });
    };
    number.addEventListener('change', commitNumber);
    number.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); commitNumber(); }
      if (e.key === 'Escape') { e.preventDefault(); writeNumber(Number(range.value)); number.blur(); }
    });
    const name = editsConstant ? el('span', { class: 'rules-card-constant tok-name', text: right.name }) : null;
    const leftDatum = cond.left;
    live.push({
      update(next) {
        const c = next[Number(path.slice(1, path.indexOf('.')))]?.conditions?.[ci]?.right;
        if (!c) return;
        const v = Math.min(1, Math.max(0, c.value));
        if (document.activeElement !== range && Number(range.value) !== v) range.value = String(v);
        writeNumber(c.value);
      },
      marker, datum: leftDatum, x: null,
    });
    return el('span', { class: 'rules-card-threshold' }, name, rail, number);
  }

  function actionSelect(card, ai, path) {
    const a = card.actions[ai];
    return select({
      path, help: 'rules.cards.action', label: t('rules.cards.action.label'), cls: 'rules-card-action',
      options: CONTROLS.map((c) => [c, t(`rules.word.${c}`)]), value: a.control,
      onChange: (v) => onEdit({ type: 'setAction', place: placeOf(path), control: v }, { focus: path }),
    });
  }

  /**
   * Sin acciones, el selector para elegir la primera (incompleta). Con acciones, "+ acción": un botón
   * terciario "+" que abre el mismo selector en su lugar; elegir suma la acción y salir sin elegir lo cierra.
   */
  function addActionSelect(card, index, first) {
    const path = `c${index}.add`;
    const pick = (onDone) => select({
      path, help: first ? 'rules.cards.pick' : 'rules.cards.addAction',
      label: t(first ? 'rules.cards.pick.label' : 'rules.cards.addAction.label'),
      cls: 'rules-card-action rules-card-pick',
      options: [['', t(first ? 'rules.cards.pick' : 'rules.cards.addAction')], ...CONTROLS.map((c) => [c, t(`rules.word.${c}`)])],
      value: '',
      onChange: (v) => {
        if (!v) return;
        onDone?.();
        // Después de sumar la primera, el foco va a la acción elegida; después de "+ acción", al "+" de nuevo.
        onEdit({ type: 'addAction', card: cards[index], control: v }, { focus: first ? `c${index}.act0` : path });
      },
    });
    if (first) return pick();
    const more = el('button', {
      class: 'v2-btn v2-small rules-card-more', help: 'rules.cards.addAction', text: '+',
      attrs: { type: 'button', 'data-path': path, 'aria-label': t('rules.cards.addAction.label'), 'aria-haspopup': 'listbox' },
    });
    more.addEventListener('click', () => {
      let chosen = false;
      const s = pick(() => { chosen = true; });
      s.removeAttribute('data-path');
      s.addEventListener('blur', () => { if (!chosen && s.isConnected) { s.replaceWith(more); } });
      s.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); s.replaceWith(more); more.focus(); } });
      more.replaceWith(s);
      s.focus();
      try { s.showPicker?.(); } catch { /* sin un gesto de la persona (o en otro navegador) basta con el foco */ }
    });
    return more;
  }

  function handle(index) {
    const unitIndex = units.findIndex((u) => u.card === cards[index]);
    const h = el('button', {
      class: 'rules-card-handle', help: 'rules.cards.handle', text: '⋮⋮',
      attrs: {
        type: 'button', draggable: 'true', 'data-path': `h${unitIndex}`,
        'aria-label': t('rules.cards.handle.label', { n: unitIndex + 1, total: units.length }),
        'data-help-params': JSON.stringify({ n: unitIndex + 1, total: units.length }),
      },
    });
    h.addEventListener('keydown', (e) => {
      if (!e.altKey || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
      e.preventDefault();
      e.stopPropagation();
      move(unitIndex, e.key === 'ArrowUp' ? unitIndex - 1 : unitIndex + 1, `h${e.key === 'ArrowUp' ? unitIndex - 1 : unitIndex + 1}`);
    });
    h.addEventListener('dragstart', (e) => {
      dragging = unitIndex;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(unitIndex));
      const row = h.closest('.rules-card');
      if (row) e.dataTransfer.setDragImage(row, 16, 16);
      node.dataset.dragging = 'true';
    });
    h.addEventListener('dragend', () => { dragging = null; guide.hidden = true; delete node.dataset.dragging; });
    return h;
  }

  /** Lleva la unidad `from` al lugar `to` (índices de unidad) con un solo parche. */
  function move(from, to, focus) {
    if (to < 0 || to >= units.length || to === from) return;
    const unit = units[from];
    const before = to < from ? units[to].lines[0] : (units[to + 1]?.lines[0] ?? null);
    onEdit({ type: 'moveRule', lines: unit.lines, before }, { focus });
  }

  function deleteButton(index) {
    return el('button', {
      class: 'v2-btn v2-small rules-card-delete', help: 'rules.cards.delete', text: '✕',
      attrs: { type: 'button', 'data-path': `c${index}.delete`, 'aria-label': t('rules.cards.delete.label') },
      on: { click: () => onEdit({ type: 'deleteRule', lines: cards[index].lines }, { focus: `c${index}.delete` }) },
    });
  }

  const word = (key) => el('span', { class: 'rules-card-word tok-keyword', i18n: key, text: t(key) });

  // --- Fichas ------------------------------------------------------------------------------------------

  function ruleNode(card, index) {
    const parts = [];
    parts.push(word('rules.word.if'));
    card.conditions.forEach((cond, ci) => {
      const path = `c${index}.cond${ci}`;
      if (ci > 0) parts.push(word('rules.word.and'));
      const op = select({
        path: `${path}.op`, help: 'rules.cards.op', label: t('rules.cards.op.label'), cls: 'rules-card-op',
        options: OPERATORS.map((o) => [o, o]), value: cond.op.op,
        onChange: (v) => onEdit({ type: 'setOperator', place: placeOf(`${path}.op`), op: v }, { focus: `${path}.op` }),
      });
      const right = cond.right.kind === 'sensor' || cond.right.kind === 'speed'
        ? datumSelect(cond.right, `${path}.right`, 'right')
        : threshold(card, ci, cond, path);
      parts.push(el('span', { class: 'rules-card-cond' }, datumSelect(cond.left, `${path}.left`, 'left'), op, right));
    });
    parts.push(word('rules.word.then'));
    const actions = card.actions.map((_, ai) => actionSelect(card, ai, `c${index}.act${ai}`));
    const acts = el('span', { class: 'rules-card-actions' }, ...actions, addActionSelect(card, index, card.actions.length === 0));
    parts.push(acts);
    const incomplete = card.incomplete ? el('span', { class: 'rules-card-incomplete', i18n: 'rules.cards.incomplete', text: t('rules.cards.incomplete') }) : null;
    return el('li', { class: 'rules-card', dataset: { kind: 'rule', card: String(index) } },
      handle(index), el('span', { class: 'rules-card-body' }, ...parts, incomplete), deleteButton(index));
  }

  function orderNode(card, index) {
    const actions = card.actions.map((_, ai) => actionSelect(card, ai, `c${index}.act${ai}`));
    return el('li', { class: 'rules-card', dataset: { kind: 'order', card: String(index) } },
      handle(index), el('span', { class: 'rules-card-body' }, word('rules.cards.always'), ...actions), deleteButton(index));
  }

  function manualNode(card, index) {
    const edit = el('button', {
      class: 'v2-btn v2-small rules-card-edit-text', i18n: 'rules.cards.editAsText', help: 'rules.cards.editAsText', text: t('rules.cards.editAsText'),
      attrs: { type: 'button', 'data-path': `c${index}.text`, 'data-focus': 'keep' }, on: { click: () => onEditAsText(cards[index].line) },
    });
    return el('li', { class: 'rules-card rules-card-manual', dataset: { kind: 'manual', card: String(index) } },
      handle(index),
      el('span', { class: 'rules-card-body' },
        el('span', { class: 'rules-card-manual-label', i18n: 'rules.cards.manual', text: t('rules.cards.manual') }),
        el('pre', { class: 'rules-card-text editor-text', text: card.text }), edit),
      deleteButton(index));
  }

  function constantNode(card, index) {
    const path = `c${index}.const`;
    const range = el('input', {
      class: 'rules-card-range', help: 'rules.cards.constant',
      attrs: {
        type: 'range', min: '0', max: '1', step: '0.01', value: String(card.value), 'data-path': `${path}.range`,
        'aria-label': t('rules.cards.constant.label', { name: card.name }), 'data-help-params': JSON.stringify({ name: card.name }),
      },
    });
    const value = el('output', { class: 'rules-constant-value', text: formatNumber(card.value, language, { trim: true }) });
    let last = 0;
    let timer = null;
    const editOf = (v) => ({ type: 'setConstant', place: placeOf(path), value: v });
    range.addEventListener('input', () => {
      value.textContent = formatNumber(Number(range.value), language, { trim: true });
      const now = performance.now();
      const run = () => { timer = null; last = performance.now(); onPreview(editOf(Number(range.value))); };
      if (now - last >= PREVIEW_MS) run();
      else if (timer === null) timer = setTimeout(run, PREVIEW_MS - (now - last));
    });
    range.addEventListener('change', () => {
      if (timer !== null) { clearTimeout(timer); timer = null; }
      onEdit(editOf(Number(range.value)), { focus: `${path}.range` });
    });
    live.push({
      update(next) {
        const c = next[index];
        if (!c || c.kind !== 'constant') return;
        if (document.activeElement !== range && Number(range.value) !== c.value) range.value = String(c.value);
        const text = formatNumber(c.value, language, { trim: true });
        if (value.textContent !== text) value.textContent = text;
      },
    });
    return el('div', { class: 'rules-constant', dataset: { card: String(index) } },
      el('span', { class: 'rules-constant-name tok-name', text: card.name }), range, value);
  }

  /** Los comentarios seguidos van juntos en una sola nota (D8, punto 5). */
  function noteNode(group) {
    return el('li', { class: 'rules-card-note', dataset: { kind: 'note', card: String(cards.indexOf(group[0])) } },
      el('span', { class: 'editor-text tok-comment', text: group.map((c) => c.text.trim()).join('\n') }));
  }

  // --- Dibujo ------------------------------------------------------------------------------------------

  /** Camino del control con el foco, si está en la vista. */
  function activePath() {
    const a = document.activeElement;
    return a && node.contains(a) ? a.getAttribute('data-path') : null;
  }

  function focusPath(path) {
    if (!path) return false;
    if (path === 'last-action') return focusLastAction();
    const target = node.querySelector(`[data-path="${CSS.escape(path)}"]`)
      ?? (path.startsWith('h') ? node.querySelector('.rules-card-handle:last-of-type') : null)
      ?? (/^c\d+\./.test(path) ? nearestCardControl(Number(path.slice(1, path.indexOf('.')))) : null)
      ?? addButton;
    target.focus({ preventScroll: false });
    target.scrollIntoView?.({ block: 'nearest' });
    return true;
  }
  /** Después de borrar: el borrar de la ficha que quedó en ese lugar, o el de la anterior. */
  function nearestCardControl(index) {
    for (let i = index; i >= 0; i -= 1) {
      const n = node.querySelector(`[data-path="c${i}.delete"]`);
      if (n) return n;
    }
    return null;
  }
  /** El selector de la acción de la última regla (la que agregó "Agregar regla" o una barra). */
  function focusLastAction() {
    const rules = [...list.querySelectorAll('.rules-card[data-kind="rule"]')];
    const last = rules[rules.length - 1];
    const target = last?.querySelector('.rules-card-pick') ?? last?.querySelector('.rules-card-action');
    if (!target) return false;
    target.focus({ preventScroll: true });
    target.scrollIntoView?.({ block: 'nearest' });
    return true;
  }

  /**
   * Proyecta el texto y lo dibuja. Si solo cambiaron números (y el idioma y los sensores son los mismos),
   * los actualiza en su lugar.
   */
  function render(text, { force = false } = {}) {
    const next = projectCards(text);
    const nextShape = shapeOf(next);
    const nextCount = sensorCount();
    if (!force && nextShape === shape && language === i18n.language && nextCount === count) {
      cards = next;
      units = movableUnits(cards);
      for (const l of live) l.update?.(next);
      return;
    }
    const focus = activePath();
    cards = next;
    units = movableUnits(cards);
    shape = nextShape;
    language = i18n.language;
    count = nextCount;
    live = [];
    cardNodes = new Map();
    const constants = [];
    const items = [];
    let notes = null; // comentarios seguidos (las constantes y las líneas vacías no los cortan)
    const flush = () => { if (notes) { items.push(noteNode(notes)); notes = null; } };
    cards.forEach((card, index) => {
      let n = null;
      if (card.kind === 'note') {
        if (!card.blank) (notes ??= []).push(card);
        return;
      }
      if (card.kind === 'constant') { constants.push(constantNode(card, index)); cardNodes.set(index, constants[constants.length - 1]); return; }
      flush();
      if (card.kind === 'rule') n = ruleNode(card, index);
      else if (card.kind === 'order') n = orderNode(card, index);
      else if (card.kind === 'manual') n = manualNode(card, index);
      if (n) { cardNodes.set(index, n); items.push(n); }
    });
    flush();
    constantsRow.replaceChildren(...constants);
    constantsRow.hidden = constants.length === 0;
    list.replaceChildren(...items, addItem);
    marks = { active: new Set(), crash: new Set(), errors: new Set() };
    paintAll();
    if (focus) focusPath(focus);
  }

  // --- Marcas: se cumple, choque y error (D3) ----------------------------------------------------------
  let marks = { active: new Set(), crash: new Set(), errors: new Set() };
  const covers = (card, set) => {
    for (let l = card.lines[0]; l <= card.lines[1]; l += 1) if (set.has(l)) return true;
    return false;
  };
  function paint(index) {
    const n = cardNodes.get(index);
    const card = cards[index];
    if (!n || !card || card.kind === 'note' || card.kind === 'constant') return;
    const error = card.incomplete || covers(card, marks.errors);
    const crash = !error && covers(card, marks.crash);
    // Una regla se cumple si su renglón se cumple; una orden, siempre que el programa maneja.
    const holds = !error && !crash && marks.active.has(card.line);
    const state = error ? 'error' : crash ? 'crash' : holds ? 'holds' : null;
    if (state) { if (n.dataset.state !== state) n.dataset.state = state; } else if (n.dataset.state) delete n.dataset.state;
  }
  function paintAll() { cards.forEach((_, i) => paint(i)); }

  /** Marca las fichas cuyas líneas se cumplen, se cumplían al chocar o tienen un error (números de línea). */
  function setMarks({ active = [], crash = [], errors = [] } = {}) {
    const next = { active: new Set(active), crash: new Set(crash), errors: new Set(errors) };
    const same = (a, b) => a.size === b.size && [...a].every((x) => b.has(x));
    if (same(next.active, marks.active) && same(next.crash, marks.crash) && same(next.errors, marks.errors)) return;
    marks = next;
    paintAll();
  }

  /** El valor en vivo de cada dato sobre su riel (D3): solo mueve la marca, con transform. */
  function setLive(perception) {
    for (const l of live) {
      if (!l.marker) continue;
      const v = l.datum.kind === 'speed' ? perception.speed : perception.sensors?.[l.datum.index - 1];
      const x = Math.round(railX(v ?? 0) * 2) / 2;
      if (x === l.x) continue;
      l.x = x;
      l.marker.style.transform = `translateX(${x}px)`;
    }
  }

  // --- Reordenar arrastrando (D6) ----------------------------------------------------------------------
  let dragging = null;
  let dropBefore = null; // índice de unidad antes de la que cae; units.length = al final
  function dropIndex(clientY) {
    const rows = units.map((u) => cardNodes.get(cards.indexOf(u.card))).filter(Boolean);
    for (let i = 0; i < rows.length; i += 1) {
      const r = rows[i].getBoundingClientRect();
      if (clientY < r.top + r.height / 2) return i;
    }
    return rows.length;
  }
  list.addEventListener('dragover', (e) => {
    if (dragging === null) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    dropBefore = dropIndex(e.clientY);
    // La línea guía, entre dos fichas (no se puede soltar en el medio de una).
    const rows = units.map((u) => cardNodes.get(cards.indexOf(u.card)));
    const box = scroller.getBoundingClientRect();
    const ref = rows[dropBefore] ?? rows[rows.length - 1];
    if (!ref) return;
    const r = ref.getBoundingClientRect();
    const y = (dropBefore < rows.length ? r.top - 2 : r.bottom + 1) - box.top + scroller.scrollTop;
    guide.style.transform = `translateY(${Math.round(y)}px)`;
    guide.hidden = false;
  });
  list.addEventListener('dragleave', (e) => { if (!list.contains(e.relatedTarget)) guide.hidden = true; });
  list.addEventListener('drop', (e) => {
    if (dragging === null) return;
    e.preventDefault();
    guide.hidden = true;
    const from = dragging;
    dragging = null;
    const to = dropBefore ?? from;
    // Soltar antes de la unidad `to`: el lugar final es `to` si sube y `to - 1` si baja.
    const target = to > from ? to - 1 : to;
    move(from, target, `h${target}`);
  });

  // --- Teclado: deshacer en cualquier vista (D2) y flechas que no salen de la vista ---------------------
  function onKeyDown(e) {
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();
    if (mod && !e.altKey && (key === 'z' || key === 'y')) {
      e.preventDefault();
      e.stopPropagation();
      onUndo(key === 'y' || (key === 'z' && e.shiftKey), activePath());
      return;
    }
    // Las flechas mueven el deslizador o el selector con el foco y no llegan a ningún atajo (spec "Con el teclado").
    if (e.key.startsWith('Arrow') && e.target !== node) e.stopPropagation();
  }
  node.addEventListener('keydown', onKeyDown);

  return {
    node, list, render, setMarks, setLive, focusPath, activePath, focusLastAction,
    get cards() { return cards; },
    dispose() { node.removeEventListener('keydown', onKeyDown); node.remove(); },
  };
}
