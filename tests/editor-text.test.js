// Operaciones de teclado del editor (design.md D4, tarea 4.1): Enter, Tab, Mayús+Tab e insertar.
import test from 'node:test';
import assert from 'node:assert/strict';
import { newLine, indent, outdent, insertText, opensBlock, INDENT } from '../src/ui/editor-text.js';

/** Estado con el cursor donde está `|` (o la selección entre `[` y `]`). */
function at(marked) {
  if (marked.includes('|')) {
    const i = marked.indexOf('|');
    return { text: marked.replace('|', ''), start: i, end: i };
  }
  const s = marked.indexOf('[');
  const e = marked.indexOf(']') - 1;
  return { text: marked.replace('[', '').replace(']', ''), start: s, end: e };
}
/** Estado escrito con el mismo formato, para comparar. */
function show({ text, start, end }) {
  if (start === end) return text.slice(0, start) + '|' + text.slice(start);
  return text.slice(0, start) + '[' + text.slice(start, end) + ']' + text.slice(end);
}
/** El estado devuelto coincide con aplicar su propia edición al texto anterior. */
function checkEdit(before, after) {
  if (!after.edit) return;
  const { from, to, insert } = after.edit;
  assert.equal(before.text.slice(0, from) + insert + before.text.slice(to), after.text);
}
const run = (fn, marked, ...args) => {
  const before = at(marked);
  const after = fn(before, ...args);
  checkEdit(before, after);
  return show(after);
};

test('Enter después de una línea que termina en `entonces` agrega un nivel de sangría', () => {
  assert.equal(INDENT, '    ');
  assert.equal(run(newLine, 'si sensor3 > 0,5 entonces|'), 'si sensor3 > 0,5 entonces\n    |');
});

test('Enter después de una línea que termina en `then` (y con mayúsculas o un comentario) agrega un nivel', () => {
  assert.equal(run(newLine, 'if sensor3 > 0.5 then|'), 'if sensor3 > 0.5 then\n    |');
  assert.equal(run(newLine, 'SI sensor3 > 0,5 ENTONCES  # esquiva|'), 'SI sensor3 > 0,5 ENTONCES  # esquiva\n    |');
  assert.equal(opensBlock('si sensor3 > 0,5 entonces girar izquierda'), false);
  assert.equal(opensBlock('# entonces'), false);
  assert.equal(opensBlock('entonces'), true);
});

test('Enter en una línea con sangría la conserva', () => {
  assert.equal(run(newLine, 'si sensor3 > 0,5 entonces\n    girar izquierda|'), 'si sensor3 > 0,5 entonces\n    girar izquierda\n    |');
  assert.equal(run(newLine, '\tretroceder|'), '\tretroceder\n\t|');
});

test('Enter en una línea sin sangría que no abre una regla deja el cursor al principio de la siguiente', () => {
  assert.equal(run(newLine, 'avanzar|'), 'avanzar\n|');
  // en medio de una línea: solo cuenta lo que está antes del cursor
  assert.equal(run(newLine, 'avan|zar'), 'avan\n|zar');
});

test('Enter con una selección la reemplaza', () => {
  assert.equal(run(newLine, 'si sensor1 > 0,1 entonces[ borrar]'), 'si sensor1 > 0,1 entonces\n    |');
});

test('Tab sobre el cursor inserta un nivel', () => {
  assert.equal(run(indent, '|avanzar'), '    |avanzar');
  assert.equal(run(indent, 'si x|'), 'si x    |');
});

test('Tab sobre varias líneas seleccionadas agrega un nivel a cada una', () => {
  assert.equal(run(indent, 'a\n[girar izquierda\nretroceder]\nz'), 'a\n    [girar izquierda\n    retroceder]\nz');
  // una selección que empieza a mitad de línea toca la línea completa
  assert.equal(run(indent, 'gi[rar\nretro]ceder'), '    gi[rar\n    retro]ceder');
});

test('Mayús+Tab sobre el cursor quita un nivel de su línea', () => {
  assert.equal(run(outdent, '    girar| izquierda'), 'girar| izquierda');
  assert.equal(run(outdent, '      |avanzar'), '  |avanzar');
  assert.equal(run(outdent, '\tavanzar|'), 'avanzar|');
  assert.equal(run(outdent, 'avanzar|'), 'avanzar|'); // sin sangría, no cambia nada
});

test('Mayús+Tab sobre varias líneas seleccionadas quita un nivel a cada una', () => {
  assert.equal(run(outdent, '[    girar izquierda\n    retroceder]'), '[girar izquierda\nretroceder]');
  assert.equal(run(outdent, 'si x entonces\n    [girar\n  retroceder]\nfin'), 'si x entonces\n[girar\nretroceder]\nfin');
});

test('Insertar reemplaza la selección y deja el cursor al final de lo insertado', () => {
  assert.equal(run(insertText, 'si |', 'sensor3'), 'si sensor3|');
  assert.equal(run(insertText, 'si [sensor1] > 0', 'sensor3'), 'si sensor3| > 0');
  assert.equal(run(insertText, '|', 'girar izquierda'), 'girar izquierda|');
});
