// auditSistema() (sistema-de-diseno-base D4) sobre un DOM falso: elementos con clases y un estilo y una
// altura inyectados, sin navegador.
import test from 'node:test';
import assert from 'node:assert/strict';
import { auditSistema } from '../src/ui/audit.js';

/** Selector mínimo: listas separadas por comas de `.clase`, `etiqueta`, `.a.b`, `[atributo="valor"]` y descendencia. */
function matchesSimple(el, sel) {
  const s = sel.trim();
  if (s.includes(' ')) {
    const parts = s.split(/\s+/); const last = parts.pop();
    if (!matchesSimple(el, last)) return false;
    let p = el.parentElement;
    while (p) { if (matchesSimple(p, parts.join(' '))) return true; p = p.parentElement; }
    return false;
  }
  if (s.includes(':not(')) return matchesSimple(el, s.slice(0, s.indexOf(':not(')) || '*') && !matchesSimple(el, s.slice(s.indexOf(':not(') + 5, -1));
  const tag = s.match(/^[a-z]+/)?.[0];
  if (tag && tag !== el.tag) return false;
  for (const c of s.match(/\.[\w-]+/g) ?? []) if (!el.classes.includes(c.slice(1))) return false;
  for (const [, k, v] of s.matchAll(/\[([\w-]+)(?:\*?="([^"]*)")?\]/g)) {
    if (!(k in el.attrs)) return false;
    if (v !== undefined && (s.includes(`[${k}*=`) ? !String(el.attrs[k]).includes(v) : el.attrs[k] !== v)) return false;
  }
  return true;
}

class FakeEl {
  constructor(tag, { classes = [], attrs = {}, text = '', style = {}, height = 0, children = [] } = {}) {
    Object.assign(this, { tag, classes, attrs: { ...attrs, ...(classes.length ? { class: classes.join(' ') } : {}) }, style, height, parentElement: null });
    this.childNodes = [...(text ? [{ nodeType: 3, textContent: text }] : []), ...children];
    for (const c of children) c.parentElement = this;
  }
  get children() { return this.childNodes.filter((n) => n instanceof FakeEl); }
  getClientRects() { return this.style.hidden ? [] : [{}]; }
  matches(sel) { return sel.split(',').some((s) => matchesSimple(this, s)); }
  closest(sel) { let e = this; while (e) { if (e.matches(sel)) return e; e = e.parentElement; } return null; }
  all() { return this.children.flatMap((c) => [c, ...c.all()]); }
}

const TOKENS = {
  '--text-label': '12px', '--text-body': '14px', '--text-heading': '16px', '--text-figure': '20px', '--text-figure-lg': '28px',
  '--text-code': '13px', '--weight-regular': '400', '--weight-bold': '700',
  '--control-h-lg': '44px', '--control-h': '32px', '--control-h-sm': '24px',
  '--color-action': '#4ea1ff', '--color-car': '#3ddc84', '--color-sensor': '#a5e4ff',
};
const BASE = { fontSize: '14px', fontWeight: '400', fontFamily: 'system-ui', backgroundColor: 'rgba(0, 0, 0, 0)', color: 'rgb(238, 241, 245)', borderTopStyle: 'none', borderTopWidth: '0px', visibility: 'visible' };

function audit(children) {
  const html = new FakeEl('html', { children: [new FakeEl('body', { children })] });
  const doc = { documentElement: html, querySelectorAll: () => html.all() };
  const style = (el) => (el === html ? { getPropertyValue: (n) => TOKENS[n] ?? '' } : { ...BASE, ...el.style });
  return auditSistema({ root: doc, style, rect: (el) => ({ height: el.height }) });
}
const reasons = (r) => r.problems.map((p) => `${p.reason}${p.detail ? ' ' + p.detail : ''}`);

test('sin problemas cuando todo está en la escala', () => {
  const r = audit([
    new FakeEl('p', { text: 'Hola', style: { fontSize: '14px' } }),
    new FakeEl('h2', { text: 'Título', style: { fontSize: '16px', fontWeight: '700' } }),
    new FakeEl('button', { classes: ['tool'], text: 'Reiniciar', height: 32 }),
    new FakeEl('button', { classes: ['tool', 'primary'], text: 'Pausar', height: 44, style: { backgroundColor: 'rgb(78, 161, 255)', fontWeight: '700' } }),
  ]);
  assert.deepEqual(reasons(r), []);
  assert.deepEqual(r.sizes, [14, 16]);
  assert.deepEqual(r.heights, [32, 44]);
});

test('tamaños y pesos fuera de la escala; el código admite su tamaño propio', () => {
  const r = audit([
    new FakeEl('span', { text: 'chico', style: { fontSize: '11px' } }),
    new FakeEl('span', { text: 'semi', style: { fontWeight: '600' } }),
    new FakeEl('code', { text: 'avanzar', style: { fontSize: '13px', fontFamily: 'ui-monospace, monospace' } }),
    new FakeEl('span', { text: '13 sin ser código', style: { fontSize: '13px' } }),
  ]);
  assert.deepEqual(reasons(r), ['font-size 11px', 'font-weight 600', 'font-size 13px']);
});

test('alturas: una que no es de las tres, y la compacta fuera de una barra densa', () => {
  const r = audit([
    new FakeEl('button', { classes: ['tool'], text: 'A', height: 36 }),
    new FakeEl('button', { classes: ['tool', 'small'], text: 'B', height: 24 }),
    new FakeEl('div', { classes: ['topbar'], children: [new FakeEl('button', { classes: ['switch'], text: 'Guía', height: 24 })] }),
    new FakeEl('button', { classes: ['inspect-neuron'], text: '0,48', height: 80 }),
  ]);
  assert.deepEqual(reasons(r), ['height 36px', 'compact 24px']);
});

test('el relleno de la acción fuera de la acción principal', () => {
  const r = audit([new FakeEl('span', { classes: ['mission-fill'], style: { backgroundColor: 'rgb(78, 161, 255)' } })]);
  assert.deepEqual(reasons(r), ['action-fill']);
});

test('colores del dibujo en la interfaz, salvo donde significan lo mismo', () => {
  const r = audit([
    new FakeEl('span', { classes: ['mission-fill'], style: { backgroundColor: 'rgb(61, 220, 132)' } }),
    new FakeEl('span', { classes: ['sensor-fill'], style: { backgroundColor: 'rgb(165, 228, 255)' } }),
    new FakeEl('div', { classes: ['inspect-legend'], children: [new FakeEl('span', { text: 'auto', style: { color: 'rgb(61, 220, 132)' } })] }),
  ]);
  assert.deepEqual(reasons(r), ['drawing-color background --color-car']);
});

test('lo oculto y lo que está dentro de un dibujo no cuenta', () => {
  const r = audit([
    new FakeEl('span', { text: 'oculto', style: { fontSize: '9px', hidden: true } }),
    new FakeEl('svg', { children: [new FakeEl('text', { text: 'eje', style: { fontSize: '10px' } })] }),
  ]);
  assert.deepEqual(reasons(r), []);
});
