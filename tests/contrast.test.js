import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrast, legibleOn, parseHex } from '../src/render/contrast.js';
import { MOTORCYCLE_CONTRAST } from '../src/render/view.js';

const tokens = (file) => readFileSync(new URL(`../styles/${file}`, import.meta.url), 'utf8');
const token = (css, name) => new RegExp(`${name}:\\s*(#[0-9a-fA-F]{3,6})`).exec(css)?.[1];

test('contraste conocido: blanco sobre negro es 21 y un color consigo mismo, 1', () => {
  assert.equal(Math.round(contrast('#ffffff', '#000000')), 21);
  assert.equal(contrast('#4560a8', '#4560a8'), 1);
  assert.equal(contrast('rojo', '#000000'), null);
  assert.deepEqual(parseHex('#abc'), [0xaa, 0xbb, 0xcc]);
});

test('legibleOn no toca un color que ya contrasta', () => {
  assert.equal(legibleOn('#9a958f', '#2b323d', 3), '#9a958f');
});

test('legibleOn aclara lo justo: llega al mínimo y el paso anterior no llegaba', () => {
  const out = legibleOn('#7d2c47', '#2b323d', 3);
  assert.notEqual(out, '#7d2c47');
  assert.ok(contrast(out, '#2b323d') >= 3);
  const [r, g, b] = parseHex(out);
  assert.ok(r > g && r > b, 'conserva el tono rojizo del bordó');
});

for (const [file, road] of [['tokens.css', '#2b323d'], ['v2/tokens.css', '#1d2629']]) {
  test(`toda moto del tráfico de ${file} contrasta al menos ${MOTORCYCLE_CONTRAST}:1 con el asfalto`, () => {
    const css = tokens(file);
    for (let i = 1; i <= 5; i++) {
      const color = token(css, `--color-traffic-${i}`);
      assert.ok(color, `falta --color-traffic-${i}`);
      assert.ok(contrast(legibleOn(color, road, MOTORCYCLE_CONTRAST), road) >= MOTORCYCLE_CONTRAST, color);
    }
  });
}
