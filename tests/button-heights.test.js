// Tres alturas de control (sistema-de-diseno-base, spec "Tres alturas de control"): la grande para la acción
// principal y los botones de su renglón, la normal para todo lo demás y la compacta en las barras densas.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** Las declaraciones de la regla cuyo selector (separado por comas) incluye exactamente `selector`. */
function declarations(selector) {
  const found = {};
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const selectors = m[1].split(',').map((s) => s.trim());
    if (!selectors.includes(selector)) continue;
    for (const d of m[2].split(';')) {
      const i = d.indexOf(':');
      if (i > 0) found[d.slice(0, i).trim()] = d.slice(i + 1).trim();
    }
  }
  return found;
}

test('tres alturas: la normal en .tool, la grande en la principal y la compacta en .tool.small', () => {
  const tool = declarations('.tool');
  const primary = declarations('.tool.primary');
  assert.equal(tool['min-height'], 'var(--control-h)');
  assert.equal(tool['font-size'], 'var(--text-body)');
  assert.equal(primary['min-height'], 'var(--control-h-lg)');
  assert.equal(primary['white-space'], 'nowrap', 'no se parte en dos renglones');
  assert.equal(declarations('.tool.small')['min-height'], 'var(--control-h-sm)');
  assert.equal(declarations('.tool.small.primary')['min-height'], 'var(--control-h-sm)', 'en una barra densa la principal es compacta, como sus vecinos');
});

test('los botones del renglón de la acción principal tienen su misma altura (spec "Misma altura en el renglón")', () => {
  for (const selector of ['.run-main .tool', '.run-manual .tool']) {
    assert.equal(declarations(selector)['min-height'], 'var(--control-h-lg)', selector);
  }
  const anyRow = css.match(/:has\(> \.tool\.primary:not\(\.small\)\) > \.tool:not\(\.small\)[^{]*\{([^}]*)\}/);
  assert.ok(anyRow, 'cualquier renglón con la principal');
  assert.match(anyRow[1], /min-height:\s*var\(--control-h-lg\)/);
});
