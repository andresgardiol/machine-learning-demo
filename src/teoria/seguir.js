// El bloque "seguir leyendo" con que terminan la historia y cada capítulo (seccion-teoria, "Seguir leyendo
// al terminar"; decisión 59): la acción principal es pasar a lo que sigue en el temario, con su número, su
// título y la frase de qué explica; la secundaria, volver al temario. El último capítulo no tiene
// siguiente: lo principal pasa a ser volver al temario, junto al enlace a la práctica.
//
// Qué sigue lo dice capitulos/indice.js (siguienteDe). "Volver al temario" es un enlace a la portada con
// data-temario: main.js lo atiende para volver sin recargar y dejar el temario donde se estaba.
import { h, rellenar } from './dom.js';
import { siguienteDe, DESTINO_APP } from './capitulos/indice.js';
import { direccionDe } from './rutas.js';

/**
 * @param {{desde: string, comun: object}} opciones desde: 'historia' o el id de un capítulo;
 *   comun: contenido/<idioma>/comun.js
 * @returns {HTMLElement}
 */
export function crearSeguir({ desde, comun }) {
  const t = comun.seguir;
  const siguiente = siguienteDe(desde);
  const temario = (clase) => h('a', { class: clase, href: './', 'data-temario': '' },
    h('span', { 'aria-hidden': 'true', text: '← ' }), t.temario);
  if (!siguiente) {
    return h('nav', { class: 'seguir seguir-final', 'aria-label': t.rotulo },
      temario('boton boton-principal seguir-temario'),
      h('a', { class: 'boton seguir-app', href: DESTINO_APP }, comun.comun.irApp, h('span', { 'aria-hidden': 'true', text: ' →' })));
  }
  const textos = comun.capitulos[siguiente.id];
  const rotulo = desde === 'historia' ? t.empezar : t.siguiente;
  return h('nav', { class: 'seguir', 'aria-label': t.rotulo },
    h('a', {
      class: 'seguir-siguiente', href: direccionDe({ vista: 'capitulo', id: siguiente.id, tramo: 1 }),
      // Para lectores de pantalla, una sola frase: "Siguiente: 4. Medir el error. Cómo se le pone…".
      'aria-label': `${rotulo}: ${rellenar(t.capitulo, { n: siguiente.numero, titulo: textos.titulo })}. ${textos.frase}`,
    },
      h('span', { class: 'seguir-rotulo', text: rotulo }),
      h('span', { class: 'seguir-titulo', text: rellenar(t.capitulo, { n: siguiente.numero, titulo: textos.titulo }) }),
      h('span', { class: 'seguir-frase', text: textos.frase }),
      h('span', { class: 'seguir-flecha', 'aria-hidden': 'true', text: '→' })),
    temario('boton seguir-temario'));
}
