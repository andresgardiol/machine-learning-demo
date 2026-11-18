// Sistema de diseño (sistema-de-diseno-base D1 y D2): lee styles/tokens.css y styles/app.css y afirma la
// base común (escala tipográfica, tres alturas, tres radios, un color con un solo significado, contrastes
// y estados con forma) y los cuatro roles de B (vos, entra, decide, sale).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/** Contraste de WCAG 2, la misma cuenta que tests/control-contrast.test.js (no se importa para no correr sus pruebas dos veces). */
function contrast(a, b) {
  const lum = (h) => { const [r, g, bl] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * bl; };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const tokens = readFileSync(new URL('../styles/tokens.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const app = readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

/** Todas las variables de tokens.css con su valor tal como está escrito. */
const vars = Object.fromEntries([...tokens.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const hex = (name) => {
  assert.match(vars[name] ?? '', /^#[0-9a-fA-F]{6}$/, `--${name} es un #rrggbb`);
  return vars[name].toLowerCase();
};
const px = (name) => {
  assert.match(vars[name] ?? '', /^\d+px$/, `--${name} en px`);
  return parseInt(vars[name], 10);
};

// ΔE en OKLab ×100 con la simulación de Machado (2009) a severidad 1, la misma de vista-de-la-red D11.
const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
const oklab = ([r, g, b]) => {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s];
};
const DEUTAN = [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]];
const simulate = (h, M) => {
  const v = rgb(h).map(lin);
  return M ? M.map((f) => Math.min(1, Math.max(0, f[0] * v[0] + f[1] * v[1] + f[2] * v[2]))) : v;
};
export function deltaE(a, b, M = null) {
  const p = oklab(simulate(a, M)); const q = oklab(simulate(b, M));
  return 100 * Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}

test('ΔE: reproduce el valor de vista-de-la-red D11 (pesos positivo y negativo con deuteranopia: 14,3)', () => {
  assert.equal(deltaE('#36d6c3', '#e0489a', DEUTAN).toFixed(1), '14.3');
});

test('escala tipográfica: a lo sumo cinco tamaños de 12 px o más, más el del código, y dos pesos', () => {
  const sizes = Object.keys(vars).filter((k) => k.startsWith('text-') && k !== 'text-code');
  assert.ok(sizes.length <= 5, `tamaños: ${sizes.join(', ')}`);
  for (const k of sizes) assert.ok(px(k) >= 12, `--${k}: ${vars[k]}`);
  assert.deepEqual(sizes.sort(), ['text-body', 'text-figure', 'text-figure-lg', 'text-heading', 'text-label']);
  assert.ok(px('text-code') >= 12);
  const weights = Object.keys(vars).filter((k) => k.startsWith('weight-'));
  assert.ok(weights.length <= 2, `pesos: ${weights.join(', ')}`);
});

test('tres alturas de control, la compacta de 24 px o más', () => {
  const heights = Object.keys(vars).filter((k) => k.startsWith('control-h'));
  assert.deepEqual(heights.sort(), ['control-h', 'control-h-lg', 'control-h-sm']);
  assert.ok(px('control-h-sm') >= 24);
  assert.ok(px('control-h-lg') > px('control-h') && px('control-h') > px('control-h-sm'));
});

test('a lo sumo tres radios', () => {
  const radii = Object.keys(vars).filter((k) => k.startsWith('radius'));
  assert.ok(radii.length <= 3, `radios: ${radii.join(', ')}`);
});

const DRAWING = ['road', 'road-edge', 'lane-line', 'car', 'car-crashed', 'elite', 'traffic', 'sensor', 'sensor-hit',
  'weight-positive', 'weight-negative', 'neuron-active', 'neuron', 'network-input', 'network-current', 'class-a', 'class-b',
  'network-blame', 'chart-best', 'chart-average', 'car-glass', 'headlight', 'taillight', 'grass', 'sidewalk', 'tree',
  'tree-dark', 'kerb-a', 'kerb-b', 'stand', 'crosswalk',
  ...[1, 2, 3, 4, 5, 6].map((n) => `competitor-${n}`)];

test('el relleno de la acción no se repite en el dibujo, en el sensor ni en las barras de progreso', () => {
  const action = hex('color-action');
  for (const name of [...DRAWING, 'progress']) assert.notEqual(hex(`color-${name}`), action, `--color-${name}`);
});

test('el anillo de "Mostrame" no usa el color de un competidor ni de la red', () => {
  const reveal = hex('color-reveal');
  const others = [...[1, 2, 3, 4, 5, 6].map((n) => `competitor-${n}`), 'weight-positive', 'weight-negative', 'neuron-active',
    'neuron', 'network-input', 'network-current', 'network-blame'];
  for (const name of others) assert.notEqual(hex(`color-${name}`), reveal, `--color-${name}`);
});

test('texto sobre la acción, la opción elegida y la terciaria: 4,5:1 o más', () => {
  assert.ok(contrast(hex('color-on-action'), hex('color-action')) >= 4.5);
  assert.ok(contrast(hex('color-text'), hex('color-selected-bg')) >= 4.5);
  // La terciaria es texto del color del cuerpo, sin fondo propio: se mide sobre las tres superficies.
  for (const s of ['color-bg', 'color-surface', 'color-card-bg']) assert.ok(contrast(hex('color-text'), hex(s)) >= 4.5, s);
});

test('contornos y barras de estado: 3:1 o más sobre el fondo, el panel y la tarjeta', () => {
  for (const mark of ['color-selected-border', 'color-control-border', 'color-state-holds', 'color-state-error',
    'color-state-crash', 'color-progress', 'color-sensor']) {
    for (const s of ['color-bg', 'color-surface', 'color-card-bg']) {
      const c = contrast(hex(mark), hex(s));
      assert.ok(c >= 3, `--${mark} sobre --${s}: ${c.toFixed(2)}:1`);
    }
  }
  // La barra de "se cumple" también sobre su propio fondo, y el texto de la línea encima.
  assert.ok(contrast(hex('color-state-holds'), hex('color-state-holds-bg')) >= 3);
  assert.ok(contrast(hex('color-text'), hex('color-state-holds-bg')) >= 4.5);
});

/** Cuerpo (sin comentarios) de las reglas cuyo selector contiene `fragment`. */
const rulesWith = (fragment) => [...app.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
  .filter((m) => m[1].includes(fragment)).map((m) => m[1] + '{' + m[2] + '}').join('\n');

test('"error" y "choque" se distinguen además por forma, no solo por el color', () => {
  const error = rulesWith('[data-state="error"]');
  const crash = rulesWith('[data-state="crash"]');
  assert.match(error, /content:\s*"✕/, 'el error lleva el ícono ✕');
  assert.match(crash, /repeating-linear-gradient/, 'el choque lleva el rayado');
  assert.match(crash, /content:\s*"✸/, 'el choque lleva el ícono de impacto');
  assert.doesNotMatch(error, /repeating-linear-gradient/, 'el error no tiene rayado');
  assert.match(rulesWith('[data-state="holds"]'), /inset\s+3px\s+0\s+0\s+var\(--color-state-holds\)/, 'se cumple: barra lateral');
});

test('los cuatro roles tienen colores distintos, y "entra" queda a ΔE 8 o más de los pesos positivos con deuteranopia', () => {
  const roles = ['you', 'in', 'decide', 'out'].map((r) => hex(`color-role-${r}`));
  assert.equal(new Set(roles).size, 4, roles.join(', '));
  const d = deltaE(hex('color-role-in'), hex('color-weight-positive'), DEUTAN);
  assert.ok(d >= 8, `ΔE ${d.toFixed(1)}`);
  // El sensor y las entradas de la red son "entra"; la acción y la opción elegida, "vos".
  assert.equal(hex('color-sensor'), hex('color-role-in'));
  assert.equal(hex('color-network-input'), hex('color-role-in'));
  assert.equal(hex('color-action'), hex('color-role-you'));
});

/** Valores de una propiedad en app.css (sin comentarios). */
const valuesOf = (prop) => [...app.matchAll(new RegExp(`(?:^|[;{\\s])${prop}:\\s*([^;}]+)`, 'g'))].map((m) => m[1].trim());

test('app.css: todo font-size sale de la escala, salvo el 96 decorativo de la cuenta regresiva (3.1)', () => {
  const loose = valuesOf('font-size').filter((v) => !/^var\(--text-(label|body|heading|figure|figure-lg|code)\)$/.test(v) && v !== 'inherit');
  assert.deepEqual(loose, ['96px']);
  assert.match(app, /\.countdown-number\s*\{[^}]*font-size:\s*96px/, 'la excepción es la de la cuenta regresiva');
  const fontShorthand = valuesOf('font').filter((v) => v !== 'inherit' && !/^var\(--weight-bold\) var\(--text-label\) var\(--font\)$/.test(v));
  assert.deepEqual(fontShorthand, []);
});

test('app.css: todo font-weight es uno de los dos pesos (3.1)', () => {
  const loose = valuesOf('font-weight').filter((v) => !/^var\(--weight-(regular|bold)\)$/.test(v));
  assert.deepEqual(loose, []);
});

test('app.css: rellenos, márgenes y separaciones sin px sueltos, salvo los 1 y 2 px de los bordes (3.3)', () => {
  const loose = [];
  for (const prop of ['padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'padding-inline', 'padding-block',
    'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'margin-inline', 'margin-block', 'gap', 'row-gap', 'column-gap']) {
    for (const v of valuesOf(prop)) for (const n of v.match(/-?\d+(?:\.\d+)?px/g) ?? []) if (!['1px', '2px', '-1px', '-2px'].includes(n)) loose.push(`${prop}: ${v}`);
  }
  assert.deepEqual(loose, []);
});

test('app.css: cada esquina redondeada usa uno de los tres radios (3.3)', () => {
  const loose = valuesOf('border-radius').filter((v) => !v.split(/\s+/).every((p) => p === '0' || /^var\(--radius-(control|card|round)\)$/.test(p)));
  assert.deepEqual(loose, []);
});

test('las constantes del programa usan el blanco de "decide", en cursiva, y no el color de los pesos (4.7)', () => {
  const rule = app.match(/\.tok-name\s*\{([^}]*)\}/)[1];
  assert.match(rule, /color:\s*var\(--color-role-decide\)/);
  assert.match(rule, /font-style:\s*italic/);
});
