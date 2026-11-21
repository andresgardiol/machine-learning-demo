// La portada (seccion-teoria, "Portada con el temario"; tareas 3.1 y 3.2): primero la historia y después
// el temario del 0 al 9, en orden. Los dos se dibujan como recorridos: la historia es una línea de tiempo
// (horizontal, con sus doce marcas donde van de verdad) y el temario una rampa (vertical, un nodo por
// capítulo). Un capítulo que no está escrito se ve como "próximamente" y no lleva enlace: no se puede
// abrir ni con el teclado.
import { h, rellenar } from './dom.js';
import { CAPITULOS, DESTINO_APP } from './capitulos/indice.js';
import { HITOS, TRAMOS_DE_LA_LINEA, lugarEnLaLinea } from './hitos.js';
import { direccionDe } from './rutas.js';

/** La línea de tiempo en miniatura: las mismas marcas, a la misma escala por tramos, sin rótulos. */
function miniLinea() {
  const rieles = TRAMOS_DE_LA_LINEA.map(() => h('span', { class: 'mini-riel' }));
  for (const hito of HITOS) {
    const { tramo, lugar } = lugarEnLaLinea(hito.marca);
    rieles[tramo].append(h('i', { class: hito.pausa ? 'mini-marca mini-pausa' : 'mini-marca', style: `left: ${lugar * 100}%` }));
  }
  const piezas = rieles.flatMap((r, i) => (i === 0 ? [r] : [h('span', { class: 'mini-corte' }), r]));
  return h('span', { class: 'mini-linea', 'aria-hidden': 'true' }, piezas);
}

/** Dónde se toca en la práctica lo que explica un capítulo: "Laboratorio, Compuertas". */
function pestanasDe(cap, comun) {
  const nombres = cap.pestanas.map((p) => comun.pestanas[p]);
  if (cap.ejercicio) nombres.push(comun.ejercicios[cap.ejercicio]);
  return nombres.join(', ');
}

/**
 * @param {HTMLElement} contenedor
 * @param {{comun: object, vieneDe?: string | null}} opciones comun: contenido/<idioma>/comun.js; vieneDe:
 *   'historia' o el id del capítulo que se acaba de leer (la portada se muestra a esa altura, con su
 *   tarjeta señalada y con el foco); null en la primera visita, que abre desde el título.
 */
export function montarPortada(contenedor, { comun, vieneDe = null }) {
  const p = comun.portada;
  const listos = CAPITULOS.filter((c) => c.disponible).length;

  // La señal de "venís de acá": un rótulo corto sobre la tarjeta de lo que se acaba de leer.
  const senal = (id) => (id === vieneDe ? h('span', { class: 'viene-de-aca', text: p.vieneDeAca }) : null);

  const historia = h('a', { class: `portada-historia${vieneDe === 'historia' ? ' leida' : ''}`, href: direccionDe({ vista: 'historia', tramo: 1 }) },
    senal('historia'),
    h('span', { class: 'portada-historia-titulo', text: p.historia }),
    h('span', { class: 'portada-historia-frase', text: p.historiaFrase }),
    miniLinea(),
    h('span', { class: 'mini-anios', 'aria-hidden': 'true' },
      h('span', { text: String(HITOS[0].marca) }), h('span', { text: String(HITOS.at(-1).marca) })),
    h('span', { class: 'portada-ir' }, p.historiaIr, h('span', { class: 'flecha', 'aria-hidden': 'true', text: '→' })));

  const temas = CAPITULOS.map((cap) => {
    const textos = comun.capitulos[cap.id];
    const cuerpo = [
      h('span', { class: 'tema-nodo', 'aria-hidden': 'true', text: String(cap.numero) }),
      h('span', { class: 'tema-cuerpo' },
        h('span', { class: 'tema-titulo' },
          h('span', { class: 'solo-lector', text: `${rellenar(p.capitulo, { n: cap.numero })}. ` }), textos.titulo, senal(cap.id)),
        h('span', { class: 'tema-frase', text: textos.frase }),
        h('span', { class: 'tema-pestana', text: rellenar(p.enLaPractica, { pestana: pestanasDe(cap, comun) }) })),
      cap.disponible
        ? h('span', { class: 'tema-ir', 'aria-hidden': 'true', text: '→' })
        : h('span', { class: 'proximamente', text: p.proximamente }),
    ];
    return h('li', { class: `${cap.disponible ? 'tema' : 'tema tema-falta'}${cap.id === vieneDe ? ' leida' : ''}`, 'data-capitulo': cap.id },
      cap.disponible
        ? h('a', { class: 'tema-fila', href: direccionDe({ vista: 'capitulo', id: cap.id, tramo: 1 }) }, cuerpo)
        : h('div', { class: 'tema-fila', 'aria-disabled': 'true' }, cuerpo));
  });

  const raiz = h('div', { class: 'portada' },
    h('header', { class: 'portada-cabeza' },
      // De qué proyecto es esta teoría, arriba del título ("La portada dice de qué teoría se trata").
      h('p', { class: 'portada-proyecto', text: p.sobre }),
      h('h1', { text: p.titulo }),
      h('p', { class: 'bajada', text: p.bajada }),
      h('p', { class: 'portada-como', text: p.como })),
    h('section', { class: 'portada-seccion', 'aria-label': p.historiaRotulo }, historia),
    h('section', { class: 'portada-seccion' },
      h('h2', { class: 'portada-subtitulo', text: p.temario }),
      // Con todos los capítulos listos no hay ninguno «en camino» que anunciar.
      h('p', { class: 'portada-estado', text: rellenar(listos === CAPITULOS.length ? p.estadoCompleto : p.estado, { listos, faltan: CAPITULOS.length - listos }) }),
      h('ol', { class: 'portada-temario', start: 0 }, temas)),
    h('footer', { class: 'portada-pie' },
      h('p', null, h('span', { class: 'portada-sobre', text: p.sobre }), h('span', { text: p.pie })),
      h('a', { class: 'boton', href: DESTINO_APP }, comun.comun.irApp, h('span', { 'aria-hidden': 'true', text: ' →' }))));
  contenedor.append(raiz);
  // Al volver de leer algo, la portada queda a la altura de su tarjeta, que recibe el foco (decisión 60).
  const leida = vieneDe === 'historia' ? historia : raiz.querySelector('.tema.leida .tema-fila');
  if (leida) {
    leida.scrollIntoView({ block: 'center', behavior: 'instant' });
    leida.focus({ preventScroll: true });
  }
  return { irA() {}, actual: () => 0, desmontar: () => raiz.remove() };
}
