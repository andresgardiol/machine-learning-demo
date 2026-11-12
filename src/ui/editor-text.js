// Operaciones de teclado del editor de programas (design.md D4), sin DOM: reciben el texto y la
// selección `{ text, start, end }` y devuelven el estado nuevo más la edición mínima que lo produce
// (`edit: { from, to, insert }`), para que el editor la aplique sin perder el deshacer del navegador.
import { VOCABULARY } from '../core/rules.js';

/** Un nivel de sangría. */
export const INDENT = '    ';

const THEN_WORDS = [VOCABULARY.then.es, VOCABULARY.then.en];
const LEADING = /^[ \t]*/;

/** ¿La línea termina en ENTONCES (sin contar espacios ni un comentario al final)? */
export function opensBlock(line) {
  const code = line.replace(/#.*$/, '').trimEnd().toLowerCase();
  return THEN_WORDS.some((w) => code === w || code.endsWith(` ${w}`) || code.endsWith(`\t${w}`));
}

/** Inicio de la línea que contiene la posición `pos`. */
const lineStart = (text, pos) => text.lastIndexOf('\n', pos - 1) + 1;
/** Fin (sin el salto) de la línea que contiene la posición `pos`. */
function lineEnd(text, pos) {
  const i = text.indexOf('\n', pos);
  return i === -1 ? text.length : i;
}

/** Reemplaza [from, to) por `insert` y deja la selección en [start, end]. */
function apply(text, from, to, insert, start, end) {
  return { text: text.slice(0, from) + insert + text.slice(to), start, end, edit: { from, to, insert } };
}

/** Inserta `insert` en lugar de la selección y deja el cursor al final de lo insertado. */
export function insertText({ text, start, end }, insert) {
  const at = start + insert.length;
  return apply(text, start, end, insert, at, at);
}

/** Enter: conserva la sangría de la línea y agrega un nivel si la línea termina en ENTONCES. */
export function newLine(state) {
  const { text, start } = state;
  const from = lineStart(text, start);
  const before = text.slice(from, start);
  let indent = LEADING.exec(before)[0];
  if (opensBlock(before)) indent += INDENT;
  return insertText(state, `\n${indent}`);
}

/** Primera y última línea tocadas por la selección: [inicio de la primera, fin de la última). */
function touchedLines(text, start, end) {
  const from = lineStart(text, start);
  // Una selección que termina justo al principio de una línea no la toca.
  const last = end > start && text[end - 1] === '\n' ? end - 1 : end;
  return { from, to: lineEnd(text, last) };
}

/** Tab: sin selección de varias líneas, inserta un nivel; con varias líneas, agrega un nivel a cada una. */
export function indent(state) {
  const { text, start, end } = state;
  if (!text.slice(start, end).includes('\n')) return insertText(state, INDENT);
  const { from, to } = touchedLines(text, start, end);
  const lines = text.slice(from, to).split('\n');
  const block = lines.map((l) => INDENT + l).join('\n');
  return apply(text, from, to, block, start + INDENT.length, end + INDENT.length * lines.length);
}

/** Cuánto se le quita a una línea al sacarle un nivel: hasta 4 espacios, o una tabulación. */
function outdentWidth(line) {
  if (line.startsWith('\t')) return 1;
  let n = 0;
  while (n < INDENT.length && line[n] === ' ') n += 1;
  return n;
}

/** Mayús+Tab: quita un nivel de sangría a cada línea tocada por la selección (o a la del cursor). */
export function outdent(state) {
  const { text, start, end } = state;
  const { from, to } = touchedLines(text, start, end);
  const lines = text.slice(from, to).split('\n');
  const widths = lines.map(outdentWidth);
  if (widths.every((w) => w === 0)) return { text, start, end, edit: null };
  const block = lines.map((l, i) => l.slice(widths[i])).join('\n');
  // La selección se corre lo que se quitó antes de cada extremo, sin pasar al principio de su línea.
  const shift = (pos) => {
    let removed = 0;
    let offset = from;
    for (let i = 0; i < lines.length; i += 1) {
      if (pos <= offset) break;
      removed += Math.min(widths[i], pos - offset);
      offset += lines[i].length + 1;
    }
    return pos - removed;
  };
  return apply(text, from, to, block, shift(start), shift(end));
}
