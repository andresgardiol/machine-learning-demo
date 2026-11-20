// Lo común a todas las páginas de los prototipos: el idioma, los textos y la barra de arriba (volver a
// la portada, pasar de una forma del capítulo a otra y cambiar de idioma).
import es from '../contenido/es.js';
import en from '../contenido/en.js';
import { elegirIdioma, CLAVE_IDIOMA, IDIOMAS } from '../contenido/idioma.js';
import { h } from './dom.js';

const TEXTOS = { es, en };

/**
 * @param {{forma?: 'libro'|'pasos'|'pelicula'|'historia'|'portada', raiz?: string, titulo: (c: object) => string}} opciones
 *   raiz: camino a prototipos/teoria/ desde la página.
 * @returns {object} los textos del idioma elegido
 */
export function montarPagina({ forma = 'portada', raiz = '../', titulo }) {
  const idioma = elegirIdioma();
  const c = TEXTOS[idioma];
  document.documentElement.lang = idioma;
  document.title = titulo(c);

  const barra = document.getElementById('barra');
  if (barra) {
    const formas = ['libro', 'pasos', 'pelicula'].includes(forma)
      ? h('nav', { class: 'barra-formas', 'aria-label': c.comun.formasRotulo },
        ['libro', 'pasos', 'pelicula'].map((f) => h('a', {
          href: `${raiz}${f}/`, class: 'barra-forma', 'aria-current': f === forma ? 'page' : null, text: c.comun.formas[f],
        })))
      : null;
    // El idioma es el mismo valor que guarda la app (D7): cambiarlo acá lo cambia también allá.
    const idiomas = h('div', { class: 'barra-idiomas', role: 'group', 'aria-label': c.comun.idiomaRotulo },
      IDIOMAS.map((i) => h('button', {
        type: 'button', class: 'barra-idioma', lang: i, 'aria-pressed': i === idioma ? 'true' : 'false', title: c.comun.idiomas[i],
        text: i.toUpperCase(),
        onclick: () => {
          if (i === idioma) return;
          try { localStorage.setItem(CLAVE_IDIOMA, i); } catch { /* sin almacenamiento: no cambia */ }
          location.reload();
        },
      })));
    barra.replaceChildren(...[
      forma === 'portada'
        ? h('span', { class: 'barra-volver', text: c.comun.volver })
        : h('a', { class: 'barra-volver', href: raiz, 'aria-label': c.comun.volver }, '← ', h('span', { class: 'barra-volver-texto', text: c.comun.volver })),
      formas, idiomas].filter(Boolean));
  }
  return c;
}
