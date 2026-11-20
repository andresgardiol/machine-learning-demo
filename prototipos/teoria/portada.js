// Portada de los prototipos de teoría (teoria-prototipos D1): enlaza las tres formas del capítulo y el
// tramo de historia.
import { montarPagina } from './comun/pagina.js';
import { h } from './comun/dom.js';

const c = montarPagina({ forma: 'portada', raiz: './', titulo: (t) => t.portada.titulo });
const p = c.portada;

document.getElementById('pagina').append(
  h('div', { class: 'portada' },
    h('h1', { text: p.titulo }),
    h('p', { class: 'bajada', text: p.bajada }),
    h('section', { class: 'portada-capitulo' },
      h('h2', { text: p.capitulo }),
      h('p', { class: 'portada-nota', text: p.capituloBajada }),
      h('ul', { class: 'portada-formas' },
        ['libro', 'pasos', 'pelicula'].map((f) => h('li', null,
          h('a', { href: `./${f}/`, class: 'portada-forma' },
            h('span', { class: 'portada-forma-nombre', text: p.formas[f].nombre }),
            h('span', { class: 'portada-forma-bajada', text: p.formas[f].bajada })))))),
    h('section', { class: 'portada-capitulo' },
      h('h2', null, h('a', { href: './historia/', text: p.historia.nombre })),
      h('p', { class: 'portada-nota', text: p.historia.bajada })),
    h('p', { class: 'portada-pie', text: p.nota })));
