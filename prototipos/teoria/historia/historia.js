// Tramo de historia en película (teoria-prototipos D5 y D6, grupo 4): una línea de tiempo fija arriba,
// una imagen fija a la izquierda y los cinco hitos que pasan a la derecha. Un IntersectionObserver dice
// qué hito está en escena; la línea avanza hasta él y la imagen cambia por la suya.
import { montarPagina } from '../comun/pagina.js';
import { h, parrafos } from '../comun/dom.js';
import { seguir } from '../comun/escena.js';
import { imagenDelHito } from './imagenes.js';

const c = montarPagina({ forma: 'historia', titulo: (t) => t.historia.titulo });
const t = c.historia;
const pagina = document.getElementById('pagina');

// La línea va a escala: cada marca está donde cae su año entre 1943 y 1986 (los años 70, en 1974).
const ANIOS = { h1943: 1943, h1958: 1958, h1969: 1969, h1970: 1974, h1986: 1986 };
const lugar = (id) => ((ANIOS[id] - 1943) / (1986 - 1943)) * 100;

const avance = h('div', { class: 'linea-avance' });
const marcas = t.hitos.map((hito) => h('a', {
  class: 'linea-marca', href: `#${hito.id}`, style: `left: ${lugar(hito.id)}%`,
}, h('span', { class: 'linea-punto', 'aria-hidden': 'true' }), h('span', { class: 'linea-anio', text: hito.anio })));
const imagenes = t.hitos.map((hito) => h('div', { class: 'historia-cuadro' }, imagenDelHito(hito.id, c)));

function vinculos(hito) {
  if (!hito.capitulo) return h('p', { class: 'hito-vinculos hito-sin', text: t.sinCapitulo });
  const nombre = t.capitulos[hito.capitulo];
  return h('dl', { class: 'hito-vinculos' },
    h('div', null,
      h('dt', { text: t.capituloRotulo }),
      h('dd', null, hito.disponible
        ? h('a', { href: '../', text: nombre })
        : [h('span', { text: nombre }), h('span', { class: 'proximamente', text: t.proximamente })])),
    h('div', null, h('dt', { text: t.pestanaRotulo }), h('dd', { text: hito.pestana })));
}

const secciones = t.hitos.map((hito, i) => h('section', { class: 'hito', id: hito.id, 'data-hito': i },
  h('p', { class: 'hito-anio', text: hito.anio }),
  h('h2', { class: 'pregunta', text: hito.titulo }),
  hito.quien ? h('p', { class: 'hito-quien', text: hito.quien }) : null,
  parrafos(hito.texto),
  vinculos(hito)));

pagina.append(
  h('nav', { class: 'linea', 'aria-label': t.linea }, h('div', { class: 'linea-riel' }, avance, marcas)),
  h('div', { class: 'historia' },
    h('div', { class: 'historia-fija' }, h('div', { class: 'historia-lamina' }, imagenes)),
    h('article', { class: 'historia-texto' },
      h('header', { class: 'capitulo-cabeza' }, h('h1', { text: t.titulo }), h('p', { class: 'bajada', text: t.bajada })),
      secciones,
      h('p', { class: 'historia-continuara', text: t.continuara }))));

let actual = -1;
function activar(i) {
  if (i === actual) return;
  actual = i;
  avance.style.width = `${lugar(t.hitos[i].id)}%`;
  secciones.forEach((el, k) => el.classList.toggle('activo', k === i));
  imagenes.forEach((el, k) => {
    el.classList.toggle('activo', k === i);
    el.setAttribute('aria-hidden', k === i ? 'false' : 'true');
  });
  marcas.forEach((m, k) => {
    m.classList.toggle('hecha', k <= i);
    if (k === i) m.setAttribute('aria-current', 'true'); else m.removeAttribute('aria-current');
  });
}

// Con la imagen al costado, el hito en escena es el que cruza el medio de la pantalla; en ventanas
// angostas la imagen va arriba y la línea pasa por debajo de ella (el CSS lo dice con --apilada).
const raiz = document.querySelector('.historia');
const fija = document.querySelector('.historia-fija');
function linea() {
  const arriba = document.querySelector('.linea').getBoundingClientRect().bottom;
  if (getComputedStyle(raiz).getPropertyValue('--apilada').trim() === '1') {
    const abajo = fija.getBoundingClientRect().bottom;
    return abajo + (innerHeight - abajo) * 0.4;
  }
  return arriba + (innerHeight - arriba) / 2;
}
// Dónde deja el navegador un #hito cuando lo lleva él: apenas por encima de la línea, igual que irA.
const anclar = () => { document.documentElement.style.scrollPaddingTop = `${Math.max(0, linea() - 24)}px`; };
anclar();
addEventListener('resize', anclar);
const seguimiento = seguir({ secciones, linea, alCambiar: activar });
function irA(i) {
  scrollTo({ top: Math.max(0, secciones[i].getBoundingClientRect().top + scrollY - linea() + 24), behavior: 'instant' });
  history.replaceState(null, '', `#${t.hitos[i].id}`);
  seguimiento.medir();
}
marcas.forEach((m, i) => m.addEventListener('click', (e) => { e.preventDefault(); irA(i); }));

addEventListener('hashchange', () => {
  const i = t.hitos.findIndex((x) => `#${x.id}` === location.hash);
  if (i !== -1) irA(i);
});

// Si la dirección trae un hito (#id), se va a él.
const inicial = t.hitos.findIndex((x) => `#${x.id}` === location.hash);
if (inicial > 0) {
  irA(inicial);
}
