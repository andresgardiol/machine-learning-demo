// Ayudas mínimas de DOM para la teoría (seccion-teoria; vienen de teoria-prototipos): crear elementos, prosa con marcas y números.

const SVG_NS = 'http://www.w3.org/2000/svg';

function poner(el, attrs, hijos) {
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === false || v == null) continue;
    if (k === 'text') el.textContent = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (const hijo of hijos.flat(Infinity)) if (hijo != null && hijo !== false) el.append(hijo);
  return el;
}

/** Elemento HTML: h('p', { class: 'x' }, 'texto', otroElemento). */
export const h = (tag, attrs, ...hijos) => poner(document.createElement(tag), attrs, hijos);

/** Elemento SVG. */
export const s = (tag, attrs, ...hijos) => poner(document.createElementNS(SVG_NS, tag), attrs, hijos);

/** Reemplaza {clave} por su valor. */
export const rellenar = (texto, valores = {}) => texto.replace(/\{(\w+)\}/g, (m, k) => (k in valores ? String(valores[k]) : m));

const CLASES = { entra: 'c-entra', pos: 'c-pos', neg: 'c-neg', decide: 'c-decide' };

/**
 * Prosa con marcas: **término** y {entra|texto}, {pos|texto}, {neg|texto}, {decide|texto}. Devuelve un
 * fragmento; el texto entra siempre como texto, nunca como HTML.
 */
export function prosa(texto) {
  const frag = document.createDocumentFragment();
  const marca = /\*\*(.+?)\*\*|\{(\w+)\|(.+?)\}/g;
  let desde = 0;
  for (const m of texto.matchAll(marca)) {
    if (m.index > desde) frag.append(texto.slice(desde, m.index));
    if (m[1] != null) frag.append(h('strong', { class: 'termino', text: m[1] }));
    else frag.append(h('span', { class: CLASES[m[2]] || '', text: m[3] }));
    desde = m.index + m[0].length;
  }
  if (desde < texto.length) frag.append(texto.slice(desde));
  return frag;
}

/** Párrafos de prosa. */
export const parrafos = (lista, clase) => lista.map((t) => h('p', { class: clase }, prosa(t)));

/** Número para mostrar: hasta dos decimales, con coma en español y el signo menos tipográfico. */
export function formato(idioma) {
  return (n) => {
    let r = Math.round(n * 100) / 100;
    if (Object.is(r, -0)) r = 0;
    const txt = String(Math.abs(r));
    return (r < 0 ? '−' : '') + (idioma === 'es' ? txt.replace('.', ',') : txt);
  };
}

export const movimientoReducido = () => globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * Ayuda de un control (constitución, artículo 5; revisión 1 del dueño): una sola línea corta, en letra
 * chica, que nunca tapa la figura (el CSS la pone debajo del control). Devuelve el elemento, con un id
 * para aria-describedby.
 */
let cuentaAyudas = 0;
export function crearAyuda(texto) {
  return h('span', { class: 'ayuda', role: 'tooltip', id: `ayuda-${++cuentaAyudas}`, text: texto });
}

/**
 * Envuelve un control con su ayuda. Con el mouse aparece después de una espera (la pone el CSS); se
 * cierra al apretar o arrastrar y no vuelve mientras dura el gesto; con el foco del teclado aparece
 * enseguida y Escape la oculta.
 */
export function conAyuda(control, ayuda, clase = '') {
  control.setAttribute('aria-describedby', ayuda.id);
  const caja = h('span', { class: `con-ayuda ${clase}`.trim() }, control, ayuda);
  let gesto = false;
  const ocultar = () => { caja.dataset.oculta = '1'; };
  const mostrar = () => { delete caja.dataset.oculta; };
  caja.addEventListener('pointerdown', () => {
    gesto = true;
    ocultar();
    const fin = () => { gesto = false; removeEventListener('pointerup', fin); removeEventListener('pointercancel', fin); };
    addEventListener('pointerup', fin);
    addEventListener('pointercancel', fin);
  });
  // Vuelve a estar disponible al entrar de nuevo con el mouse (sin botón apretado) o al llegar con Tab.
  caja.addEventListener('pointerenter', (e) => { if (!gesto && e.buttons === 0) mostrar(); });
  caja.addEventListener('focusin', () => { if (!gesto) mostrar(); });
  caja.addEventListener('keydown', (e) => { if (e.key === 'Escape') ocultar(); });
  return caja;
}

/** Texto solo para lectores de pantalla, con un id para aria-describedby. */
export function descripcionOculta(texto) {
  return h('span', { class: 'solo-lector', id: `descripcion-${++cuentaAyudas}`, text: texto });
}
