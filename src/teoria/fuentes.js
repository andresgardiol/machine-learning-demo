// El bloque de fuentes con que cierran cada capítulo y la historia (seccion-teoria, "Fuentes a la
// vista"). Recibe lo que trae el contenido del idioma:
//
//   fuentes: { titulo, nota, lista: [{ texto, url, nota }] }
//
// `url` y `nota` pueden ir vacíos. La `nota` de una fuente dice, por ejemplo, que es secundaria o que
// no se leyó el original: una afirmación que descansa solo en fuentes secundarias lo tiene que decir.
import { h } from './dom.js';

/** @returns {HTMLElement | null} */
export function crearFuentes(fuentes) {
  if (!fuentes?.lista?.length) return null;
  const idTitulo = `fuentes-${Math.random().toString(36).slice(2, 8)}`;
  return h('section', { class: 'fuentes', 'aria-labelledby': idTitulo },
    h('h2', { class: 'fuentes-titulo', id: idTitulo, text: fuentes.titulo }),
    fuentes.nota ? h('p', { class: 'fuentes-nota', text: fuentes.nota }) : null,
    h('ul', { class: 'fuentes-lista' }, fuentes.lista.map((f) => h('li', null,
      f.url ? h('a', { href: f.url, target: '_blank', rel: 'noopener noreferrer', text: f.texto }) : h('span', { text: f.texto }),
      f.nota ? h('span', { class: 'fuente-nota', text: ` ${f.nota}` }) : null))));
}
