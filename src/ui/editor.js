// Editor de programas (design.md D4): un <textarea> transparente sobre un <pre> que muestra el mismo
// texto coloreado, y una columna con los números de línea.
//
//   createCodeEditor({ container, i18n, value, classify, labelKey, help, onChange })
//     -> { node, value, setValue(text), insert(text), setMarks({ active, errors }), focus(), dispose() }
//
// El <textarea> conserva gratis el deshacer, la selección, el portapapeles, el teclado del sistema y
// la accesibilidad. El <pre> y la columna de números siguen su desplazamiento. Los dos comparten
// una sola regla CSS de tipografía (ver .editor-text en styles/app.css). El editor no sabe nada de
// reglas: colorea con la función `classify(línea) -> [{ start, end, kind }]` que recibe.
import { el } from './dom.js';
import { newLine, indent, outdent, insertText } from './editor-text.js';

let editorCounter = 0;

/**
 * @param {{container?: HTMLElement, i18n: object, value?: string, classify: (line:string) => {start:number,end:number,kind:string}[],
 *          labelKey: string, help?: string, descriptionKey?: string, onChange?: (text:string) => void,
 *          onEscape?: () => void}} spec
 */
export function createCodeEditor({
  container, i18n, value = '', classify, labelKey, help, descriptionKey, onChange, onEscape,
}) {
  editorCounter += 1;
  const descriptionId = `code-editor-${editorCounter}-keys`;
  const description = descriptionKey ? el('p', { class: 'sr-only', i18n: descriptionKey, attrs: { id: descriptionId } }) : null;
  const gutter = el('div', { class: 'editor-gutter editor-text', attrs: { 'aria-hidden': 'true' } });
  const gutterInner = el('div', { class: 'editor-gutter-inner' });
  gutter.append(gutterInner);
  const backdropCode = el('code', { class: 'editor-code' });
  const backdrop = el('pre', { class: 'editor-backdrop editor-text', attrs: { 'aria-hidden': 'true' } }, backdropCode);
  const input = el('textarea', {
    class: 'editor-input editor-text', help,
    i18nAttr: `aria-label:${labelKey}`,
    attrs: {
      spellcheck: 'false', autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', wrap: 'off',
      'aria-describedby': description ? descriptionId : null,
      'aria-multiline': 'true',
    },
  });
  input.value = value;
  const main = el('div', { class: 'editor-main' }, backdrop, input);
  const node = el('div', { class: 'code-editor' }, gutter, main, description);
  container?.append(node);

  let gutterLines = [];
  let codeLines = [];
  const marks = { active: new Set(), errors: new Set() };

  /** Marca de una línea: data-active / data-error en su número y en su renglón coloreado. */
  function paintLine(lineNo) {
    const g = gutterLines[lineNo - 1];
    const c = codeLines[lineNo - 1];
    if (!g || !c) return;
    const error = marks.errors.has(lineNo);
    const active = !error && marks.active.has(lineNo);
    const state = error ? 'error' : active ? 'active' : 'none';
    if (g.dataset.mark !== state) g.dataset.mark = state;
    if (c.dataset.mark !== state) c.dataset.mark = state;
  }

  /** Vuelve a dibujar el texto coloreado y, si cambió la cantidad de líneas, la columna de números. */
  function render() {
    const lines = input.value.split('\n');
    codeLines = lines.map((line) => {
      const row = el('span', { class: 'editor-line' });
      let pos = 0;
      for (const { start, end, kind } of classify(line)) {
        if (start > pos) row.append(line.slice(pos, start));
        row.append(el('span', { class: `tok tok-${kind}`, text: line.slice(start, end) }));
        pos = end;
      }
      if (pos < line.length) row.append(line.slice(pos));
      row.append('\n');
      return row;
    });
    backdropCode.replaceChildren(...codeLines);
    if (gutterLines.length !== lines.length) {
      gutterLines = lines.map((_, i) => el('div', { class: 'editor-line-no', text: String(i + 1) }));
      gutterInner.replaceChildren(...gutterLines);
    }
    for (let i = 1; i <= lines.length; i += 1) paintLine(i);
    syncScroll();
  }

  function syncScroll() {
    const x = input.scrollLeft;
    const y = input.scrollTop;
    backdropCode.style.transform = `translate(${-x}px, ${-y}px)`;
    gutterInner.style.transform = `translateY(${-y}px)`;
  }

  /**
   * Aplica una edición conservando el deshacer del navegador: reemplaza la selección con
   * execCommand y, si no se puede, con setRangeText.
   */
  function applyEdit(result) {
    if (!result.edit) return;
    const { from, to, insert } = result.edit;
    input.setSelectionRange(from, to);
    const doc = input.ownerDocument;
    let done = false;
    try {
      done = insert === '' ? doc.execCommand('delete') : doc.execCommand('insertText', false, insert);
    } catch {
      done = false;
    }
    if (!done || input.value !== result.text) {
      if (input.value !== result.text) input.value = result.text;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    input.setSelectionRange(result.start, result.end);
  }

  const stateOf = () => ({ text: input.value, start: input.selectionStart, end: input.selectionEnd });

  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      applyEdit(newLine(stateOf()));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      applyEdit(e.shiftKey ? outdent(stateOf()) : indent(stateOf()));
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onEscape?.();
    }
  }

  function onInput() {
    render();
    onChange?.(input.value);
  }

  input.addEventListener('keydown', onKeyDown);
  input.addEventListener('input', onInput);
  input.addEventListener('scroll', syncScroll);
  render();

  return {
    node,
    input,
    get value() { return input.value; },
    /** Reemplaza todo el texto (por ejemplo, al cargar un ejemplo). No llama a onChange. */
    setValue(text) {
      if (input.value === text) return;
      input.value = text;
      input.setSelectionRange(0, 0);
      input.scrollTop = 0;
      input.scrollLeft = 0;
      render();
    },
    /** Inserta `text` donde está el cursor (reemplaza la selección) y devuelve el foco al editor. */
    insert(text) {
      input.focus({ preventScroll: true });
      applyEdit(insertText(stateOf(), text));
    },
    /**
     * Marca las líneas que se cumplen (`active`) y las que tienen un error (`errors`), conjuntos de
     * números de línea. Solo toca las líneas que cambiaron de estado.
     */
    setMarks({ active = [], errors = [] } = {}) {
      const next = { active: new Set(active), errors: new Set(errors) };
      const changed = new Set();
      for (const kind of ['active', 'errors']) {
        for (const n of marks[kind]) if (!next[kind].has(n)) changed.add(n);
        for (const n of next[kind]) if (!marks[kind].has(n)) changed.add(n);
      }
      if (changed.size === 0) return;
      marks.active = next.active;
      marks.errors = next.errors;
      for (const n of changed) paintLine(n);
    },
    focus() { input.focus({ preventScroll: true }); },
    dispose() {
      input.removeEventListener('keydown', onKeyDown);
      input.removeEventListener('input', onInput);
      input.removeEventListener('scroll', syncScroll);
      node.remove();
    },
  };
}
