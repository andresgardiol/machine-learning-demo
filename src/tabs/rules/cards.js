// Fichas de Reglas a mano (reglas-como-fichas D1 y D2), sin DOM: la proyección del texto a fichas y los
// parches que escribe cada edición de una ficha en el texto. El texto es la única fuente de verdad: las
// fichas se vuelven a proyectar después de cada cambio, y cada parche toca solo el rango de su token o las
// líneas de su regla, sin reformatear el resto. Se prueba con node --test.
//
//   projectCards(text) -> [ficha]             agrupa las líneas en fichas, en orden, sin perder ninguna
//   movableUnits(cards) -> [unidad]           fichas que se reordenan, con sus notas pegadas arriba
//   patch(text, edit, language) -> { text, from, to, insert, cursor }
//
// Fichas (las líneas se cuentan desde 1; `lines` es [desde, hasta]):
//   { kind: 'constant', name, value, line, lines, number }       `cerca = 0,2`, con un valor de 0 a 1
//   { kind: 'order', actions, line, lines }                       `avanzar`
//   { kind: 'rule', conditions, actions, line, lines }            `si sensor3 > cerca entonces` y sus acciones
//   { kind: 'note', text, line, lines, blank }                    un comentario suelto o una línea vacía
//   { kind: 'manual', text, line, lines }                         lo demás: se edita en la vista de texto
// Cada condición es { left, op, right }. `left` es un dato; `right`, un número, una constante o un dato.
// Cada operando y cada acción lleva su lugar en el texto: { line, start, end } (columnas de la línea).
import { tokenize, VOCABULARY } from '../../core/rules.js';

const COMPARISONS = new Set(['>', '<', '>=', '<=']);
const ACTION_ROLES = new Set(['forward', 'reverse', 'turn']);
/** Separador decimal de cada idioma, el mismo del lenguaje de reglas. */
const DECIMAL = Object.freeze({ es: ',', en: '.' });

/** Las líneas de un texto, como las numera el editor (separadas por `\n`). */
const linesOf = (text) => String(text ?? '').split('\n');
const isIndented = (line) => /^[ \t]/.test(line);
const word = (role, language) => (VOCABULARY[role] ?? {})[language === 'en' ? 'en' : 'es'];

/** Palabras de una acción en el idioma pedido: `avanzar`, `girar izquierda`… */
export function actionWords(control, language) {
  if (control === 'left' || control === 'right') return `${word('turn', language)} ${word(control, language)}`;
  return word(control, language);
}

/** Nombre de un dato en el idioma pedido: `sensor3` o `velocidad`. */
export function datumWord(datum, language) {
  if (datum === 'speed' || datum?.kind === 'speed') return word('speed', language);
  const n = typeof datum === 'object' ? (datum.index ?? datum.sensor) : Number(datum);
  return `sensor${n}`;
}

/**
 * Número con el separador del idioma: dos decimales (`0,35`), o, con `trim`, sin los ceros del final
 * (`0,4`), como se escriben las constantes. Recortado de 0 a 1 y sin "-0".
 */
export function formatNumber(value, language, { trim = false } = {}) {
  const v = Math.min(1, Math.max(0, Math.round((Number(value) || 0) * 100) / 100)) || 0;
  let s = v.toFixed(2);
  if (trim) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s.replace('.', DECIMAL[language] ?? ',');
}

// --- Proyección ---------------------------------------------------------------------------------------

/** Una lista de acciones (`girar izquierda y retroceder`) desde `from`; null si no es solo eso. */
function readActions(tokens, from, lineNo) {
  const actions = [];
  let i = from;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.type !== 'word' || !ACTION_ROLES.has(t.role)) return null;
    let control = t.role;
    let end = t.end;
    const tok = i;
    i += 1;
    if (control === 'turn') {
      const dir = tokens[i];
      if (!dir || dir.type !== 'word' || (dir.role !== 'left' && dir.role !== 'right')) return null;
      control = dir.role;
      end = dir.end;
      i += 1;
    }
    actions.push({ control, line: lineNo, start: t.start, end, tok, tokEnd: i - 1, expect: 'action' });
    if (i >= tokens.length) break;
    const sep = tokens[i];
    const isSeparator = (sep.type === 'op' && sep.op === ',') || (sep.type === 'word' && sep.role === 'and');
    if (!isSeparator || i + 1 >= tokens.length) return null;
    i += 1;
  }
  return actions;
}

/** Un operando de una comparación; null si el token no puede serlo. */
function readOperand(t, tok, lineNo, constants) {
  if (!t) return null;
  const place = { line: lineNo, start: t.start, end: t.end, tok };
  if (t.type === 'sensor') return { kind: 'sensor', index: t.index, ...place, expect: 'datum' };
  if (t.type === 'word' && t.role === 'speed') return { kind: 'speed', ...place, expect: 'datum' };
  if (t.type === 'number') return { kind: 'number', value: t.value, ...place, expect: 'number' };
  if (t.type === 'word' && t.role === null && constants.has(t.lower)) {
    const c = constants.get(t.lower);
    return { kind: 'constant', name: t.text, value: c.value, definition: c.line, ...place };
  }
  return null;
}

/** La condición `dato op valor (y dato op valor)*` entre `from` y `to`; null si tiene otra forma. */
function readConditions(tokens, from, to, lineNo, constants) {
  const conditions = [];
  let i = from;
  while (i < to) {
    const left = readOperand(tokens[i], i, lineNo, constants);
    const op = tokens[i + 1];
    const right = i + 2 < to ? readOperand(tokens[i + 2], i + 2, lineNo, constants) : null;
    if (!left || (left.kind !== 'sensor' && left.kind !== 'speed')) return null;
    if (!op || op.type !== 'op' || !COMPARISONS.has(op.op) || !right) return null;
    conditions.push({ left, op: { op: op.op, line: lineNo, start: op.start, end: op.end, tok: i + 1, expect: 'op' }, right });
    i += 3;
    if (i === to) break;
    const and = tokens[i];
    if (!and || and.type !== 'word' || and.role !== 'and' || i + 1 >= to) return null;
    i += 1;
  }
  return conditions.length > 0 ? conditions : null;
}

/** Definición `nombre = número` sin sangría ni comentario; null si la línea es otra cosa. */
function readDefinition(raw) {
  if (isIndented(raw)) return null;
  const all = tokenize(raw);
  if (all.length !== 3) return null;
  const [name, eq, num] = all;
  if (name.type !== 'word' || name.role !== null || eq.type !== 'op' || eq.op !== '=' || num.type !== 'number') return null;
  return { name: name.text, lower: name.lower, value: num.value, number: { start: num.start, end: num.end } };
}

/**
 * Proyecta el texto en fichas. Las líneas se agrupan en orden y cada una cae en una sola ficha: lo que no
 * entra en una ficha (una regla con `o`, `no`, paréntesis o un comentario, una constante fuera de 0 a 1, una
 * línea con errores) queda como ficha `manual`, con su texto tal cual. Así nunca se pierde una línea.
 * @param {string} text
 * @returns {object[]}
 */
export function projectCards(text) {
  const lines = linesOf(text);
  // Constantes definidas en el texto (la primera definición de cada nombre), para leer sus usos.
  const constants = new Map();
  lines.forEach((raw, i) => {
    const d = readDefinition(raw);
    if (d && !constants.has(d.lower)) constants.set(d.lower, { ...d, line: i + 1 });
  });
  const cards = [];
  let open = null; // regla cuyas acciones con sangría pueden seguir debajo

  const manual = (from, to) => ({ kind: 'manual', text: lines.slice(from - 1, to).join('\n'), line: from, lines: [from, to] });

  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    const lineNo = index + 1;
    const all = tokenize(raw);
    const code = all.filter((t) => t.type !== 'comment');
    const hasComment = code.length !== all.length;

    if (code.length === 0) {
      open = null;
      cards.push({ kind: 'note', text: raw, line: lineNo, lines: [lineNo, lineNo], blank: all.length === 0 });
      continue;
    }

    if (isIndented(raw)) {
      const actions = hasComment ? null : readActions(code, 0, lineNo);
      if (open && actions) {
        open.actions.push(...actions);
        open.lines[1] = lineNo;
        continue;
      }
      // Sin una regla justo arriba, o con algo que no son acciones: la regla (si la hay) y las notas o
      // líneas vacías del medio pasan a ser una sola ficha escrita a mano, porque el lenguaje las lee
      // juntas (un comentario o una línea vacía no cortan la regla).
      let from = lineNo;
      let k = cards.length - 1;
      while (k >= 0 && cards[k].kind === 'note') k -= 1;
      const owner = open ?? (k >= 0 && (cards[k].kind === 'rule' || (cards[k].kind === 'manual' && cards[k].rule)) ? cards[k] : null);
      if (owner) {
        from = owner.lines[0];
        cards.splice(cards.indexOf(owner));
      }
      const m = manual(from, lineNo);
      m.rule = Boolean(owner);
      cards.push(m);
      open = null;
      continue;
    }
    open = null;

    const definition = readDefinition(raw);
    if (definition) {
      const first = constants.get(definition.lower)?.line === lineNo;
      if (first && definition.value >= 0 && definition.value <= 1) {
        cards.push({
          kind: 'constant', name: definition.name, value: definition.value, line: lineNo, lines: [lineNo, lineNo],
          number: { line: lineNo, ...definition.number, tok: 2, expect: 'number' },
        });
      } else {
        cards.push(manual(lineNo, lineNo));
      }
      continue;
    }

    if (code[0].type === 'word' && code[0].role === 'if') {
      const thenIndex = code.findIndex((t) => t.type === 'word' && t.role === 'then');
      const conditions = thenIndex > 1 && !hasComment ? readConditions(code, 1, thenIndex, lineNo, constants) : null;
      const actions = conditions ? readActions(code, thenIndex + 1, lineNo) : null;
      if (!conditions || !actions) {
        const m = manual(lineNo, lineNo);
        m.rule = true;
        cards.push(m);
        continue;
      }
      open = { kind: 'rule', conditions, actions, line: lineNo, lines: [lineNo, lineNo] };
      cards.push(open);
      continue;
    }

    const actions = hasComment ? null : readActions(code, 0, lineNo);
    cards.push(actions ? { kind: 'order', actions, line: lineNo, lines: [lineNo, lineNo] } : manual(lineNo, lineNo));
  }
  for (const c of cards) {
    if (c.kind === 'rule') c.incomplete = c.actions.length === 0;
    if (c.kind === 'manual') delete c.rule;
  }
  return cards;
}

/**
 * Fichas que se reordenan (reglas, órdenes y escritas a mano), cada una con los comentarios sueltos que
 * tiene pegados arriba (reglas-como-fichas D6). Las constantes y las líneas vacías no se mueven.
 * @returns {{card:object, lines:[number, number]}[]}
 */
export function movableUnits(cards) {
  const units = [];
  cards.forEach((card, i) => {
    if (card.kind !== 'rule' && card.kind !== 'order' && card.kind !== 'manual') return;
    let from = card.lines[0];
    for (let k = i - 1; k >= 0 && cards[k].kind === 'note' && !cards[k].blank; k -= 1) from = cards[k].lines[0];
    units.push({ card, lines: [from, card.lines[1]] });
  });
  return units;
}

// --- Parches --------------------------------------------------------------------------------------------

/** Posición en el texto del comienzo de cada línea. */
function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i += 1) if (text[i] === '\n') starts.push(i + 1);
  return starts;
}

/** El reemplazo mínimo que lleva de `before` a `after`: lo que cambia entre el prefijo y el sufijo comunes. */
function minimalEdit(before, after) {
  let from = 0;
  const max = Math.min(before.length, after.length);
  while (from < max && before[from] === after[from]) from += 1;
  let tail = 0;
  while (tail < max - from && before[before.length - 1 - tail] === after[after.length - 1 - tail]) tail += 1;
  return { from, to: before.length - tail, insert: after.slice(from, after.length - tail) };
}

/** Resultado de un parche que no escribe nada (un lugar que no corresponde al texto, o un error). */
const unchanged = (text) => ({ text, from: 0, to: 0, insert: '', cursor: 0, skipped: true });

/** ¿El token es del tipo que espera el lugar? */
function matches(t, expect) {
  if (!t) return false;
  switch (expect) {
    case 'number': return t.type === 'number';
    case 'datum': return t.type === 'sensor' || (t.type === 'word' && t.role === 'speed');
    case 'op': return t.type === 'op' && COMPARISONS.has(t.op);
    case 'action': return t.type === 'word' && (ACTION_ROLES.has(t.role) || t.role === 'left' || t.role === 'right');
    default: return true;
  }
}

/**
 * Ubica el lugar de un token en el texto actual (reglas-como-fichas D7): por su línea y su orden en la línea,
 * nunca por columnas guardadas, que pueden ser de otro texto (las de una vista previa). Comprueba que el token
 * sea del tipo esperado. Devuelve las posiciones absolutas, o null si no corresponde.
 */
function locate(text, place, expect) {
  if (!place || !Number.isInteger(place.line) || place.line < 1) return null;
  const starts = lineStarts(text);
  if (place.line > starts.length) return null;
  const line = linesOf(text)[place.line - 1];
  const tokens = tokenize(line);
  let first;
  let last;
  if (Number.isInteger(place.tok)) {
    first = tokens[place.tok];
    last = tokens[Number.isInteger(place.tokEnd) ? place.tokEnd : place.tok];
  } else {
    // Sin orden: solo vale un token que empiece y termine exactamente en esas columnas.
    first = tokens.find((t) => t.start === place.start);
    last = tokens.find((t) => t.end === place.end);
  }
  if (!first || !last || !matches(first, expect ?? place.expect) || last.end < first.start) return null;
  return { from: starts[place.line - 1] + first.start, to: starts[place.line - 1] + last.end };
}

/** Reemplaza el token de `place` por `insert`, si el texto actual tiene ahí el token esperado. */
function replaceToken(text, place, insert, expect) {
  const at = locate(text, place, expect);
  if (!at) return unchanged(text);
  const { from, to } = at;
  return { text: text.slice(0, from) + insert + text.slice(to), from, to, insert, cursor: from + insert.length };
}

/** Rehace el texto con otra lista de líneas, conservando si terminaba con un salto de línea. */
function withLines(text, mutate) {
  const final = text.endsWith('\n');
  const lines = linesOf(text);
  if (final) lines.pop();
  const result = mutate(lines);
  const next = lines.join('\n') + (final && lines.length > 0 ? '\n' : '');
  return { next, result };
}

/**
 * Aplica una edición de una ficha al texto. Las palabras nuevas van en `language`; las que ya estaban no
 * se traducen. Devuelve el texto nuevo, el reemplazo mínimo (`from`, `to`, `insert`, para hacerlo por el
 * camino del editor que conserva el deshacer) y dónde queda el cursor.
 *
 * Ediciones:
 *   { type: 'setNumber', place, value }            umbral de una regla, con dos decimales
 *   { type: 'setConstant', place, value }          valor de una constante, sin ceros al final
 *   { type: 'setOperand', place, datum }           dato: { sensor: n } o 'speed'
 *   { type: 'setOperator', place, op }             > < >= <=
 *   { type: 'setAction', place, control }          forward | reverse | left | right
 *   { type: 'addAction', card, control }           suma una acción a una regla
 *   { type: 'addRule', text? }                     agrega una regla al final (por defecto `si sensor1 > 0,50 entonces`)
 *   { type: 'deleteRule', lines }                  borra esas líneas
 *   { type: 'moveRule', lines, before }            mueve esas líneas antes de la línea `before` (null: al final)
 * @param {string} text
 * @param {object} edit
 * @param {'es'|'en'} [language]
 * @returns {{text:string, from:number, to:number, insert:string, cursor:number}}
 */
export function patch(text, edit, language = 'es') {
  const source = String(text ?? '');
  // Un parche nunca lanza (D7): ante cualquier problema no escribe nada y lo dice con `skipped`.
  try {
    switch (edit?.type) {
      case 'setNumber': return replaceToken(source, edit.place, formatNumber(edit.value, language), 'number');
      case 'setConstant': return replaceToken(source, edit.place, formatNumber(edit.value, language, { trim: true }), 'number');
      case 'setOperand': return replaceToken(source, edit.place, datumWord(edit.datum, language), 'datum');
      case 'setOperator': return COMPARISONS.has(edit.op) ? replaceToken(source, edit.place, edit.op, 'op') : unchanged(source);
      case 'setAction': return CONTROL_WORDS.has(edit.control) ? replaceToken(source, edit.place, actionWords(edit.control, language), 'action') : unchanged(source);
      case 'addAction': return CONTROL_WORDS.has(edit.control) ? addAction(source, edit.card, edit.control, language) : unchanged(source);
      case 'addRule': return addRule(source, edit.text ?? defaultRule(language));
      case 'deleteRule': return validLines(source, edit.lines) ? deleteLines(source, edit.lines) : unchanged(source);
      case 'moveRule': return validLines(source, edit.lines) ? moveLines(source, edit.lines, edit.before) : unchanged(source);
      default: return unchanged(source);
    }
  } catch {
    return unchanged(source);
  }
}

const CONTROL_WORDS = new Set(['forward', 'reverse', 'left', 'right']);

/** ¿`[desde, hasta]` son líneas del texto actual? */
function validLines(text, lines) {
  if (!Array.isArray(lines)) return false;
  const [from, to] = lines;
  const final = text.endsWith('\n');
  const count = linesOf(text).length - (final ? 1 : 0);
  return Number.isInteger(from) && Number.isInteger(to) && from >= 1 && to >= from && to <= count;
}

/** La regla que agrega "Agregar regla": `si sensor1 > 0,50 entonces`. */
export function defaultRule(language) {
  return `${word('if', language)} sensor1 > ${formatNumber(0.5, language)} ${word('then', language)}`;
}

function addRule(text, line) {
  const lead = text.length === 0 || text.endsWith('\n') ? '' : '\n';
  const insert = `${lead}${line}`;
  return { text: text + insert, from: text.length, to: text.length, insert, cursor: text.length + insert.length };
}

function addAction(text, staleCard, control, language) {
  // La regla se vuelve a leer del texto actual, por su línea (D7).
  const card = projectCards(text).find((c) => c.kind === 'rule' && c.line === staleCard?.line);
  if (!card) return unchanged(text);
  const words = actionWords(control, language);
  const lines = linesOf(text);
  const starts = lineStarts(text);
  const last = card.actions[card.actions.length - 1];
  if (!last) {
    // Sin acciones: va al final del renglón de la regla, con un espacio si hace falta.
    const raw = lines[card.line - 1];
    const at = starts[card.line - 1] + raw.length;
    const insert = /[ \t]$/.test(raw) ? words : ` ${words}`;
    return { text: text.slice(0, at) + insert + text.slice(at), from: at, to: at, insert, cursor: at + insert.length };
  }
  if (last.line !== card.line) {
    // Acciones con sangría: un renglón más, con la misma sangría que el último.
    const raw = lines[last.line - 1];
    const indent = /^[ \t]*/.exec(raw)[0];
    const at = starts[last.line - 1] + raw.length;
    const insert = `\n${indent}${words}`;
    return { text: text.slice(0, at) + insert + text.slice(at), from: at, to: at, insert, cursor: at + insert.length };
  }
  const at = starts[last.line - 1] + last.end;
  const insert = ` ${word('and', language)} ${words}`;
  return { text: text.slice(0, at) + insert + text.slice(at), from: at, to: at, insert, cursor: at + insert.length };
}

function deleteLines(text, [from, to]) {
  const { next } = withLines(text, (lines) => lines.splice(from - 1, to - from + 1));
  const edit = minimalEdit(text, next);
  const cursor = Math.min(lineStarts(next)[from - 1] ?? next.length, next.length);
  return { text: next, ...edit, cursor };
}

function moveLines(text, [from, to], before) {
  if (before !== null && before !== undefined && before >= from && before <= to + 1) {
    return { text, from: 0, to: 0, insert: '', cursor: lineStarts(text)[from - 1] ?? 0 };
  }
  let startLine = 0;
  const { next } = withLines(text, (lines) => {
    // Lugar de destino en la numeración original; si cae después del bloque, se corre lo que mide.
    let at = before === null || before === undefined ? lines.length : before - 1;
    const block = lines.splice(from - 1, to - from + 1);
    if (at > from - 1) at -= block.length;
    lines.splice(at, 0, ...block);
    startLine = at + 1;
  });
  const edit = minimalEdit(text, next);
  return { text: next, ...edit, cursor: lineStarts(next)[startLine - 1] ?? 0 };
}
