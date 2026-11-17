// Dos alturas de botón (tarjeta-de-consigna D8): la acción principal mide lo mismo que los botones de su
// renglón; se distingue por el relleno y la negrita, no por el tamaño.
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
const px = (v) => (v && /^\d+(\.\d+)?px$/.test(v) ? parseFloat(v) : null);

test('la acción principal no fija un alto ni una letra mayores que .tool', () => {
  const tool = declarations('.tool');
  const primary = declarations('.tool.primary');
  assert.equal(px(tool['min-height']), 36, '.tool mide 36 px como mínimo');
  assert.equal(px(tool['font-size']), 14);
  if (primary['min-height']) assert.ok(px(primary['min-height']) <= px(tool['min-height']), `alto ${primary['min-height']}`);
  if (primary['font-size']) assert.ok(px(primary['font-size']) <= px(tool['font-size']), `letra ${primary['font-size']}`);
  assert.equal(primary['white-space'], 'nowrap', 'no se parte en dos renglones');
});

test('la compacta: 24 px, y la principal compacta no es más grande que .tool.small', () => {
  const small = declarations('.tool.small');
  const smallPrimary = declarations('.tool.small.primary');
  assert.equal(px(small['min-height']), 24);
  assert.ok(px(smallPrimary['min-height']) <= px(small['min-height']));
  assert.ok(px(smallPrimary['font-size']) <= px(small['font-size']));
});
