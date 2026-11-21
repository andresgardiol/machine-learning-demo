// La historia en película (seccion-teoria D8; viene de teoria-prototipos D5 y D6): una línea de tiempo
// fija arriba, una imagen fija a la izquierda y los hitos que pasan a la derecha. escena.js dice qué hito
// está en escena; la línea avanza hasta él y la imagen cambia por la suya.
//
// La línea va a escala por tramos (hitos.js): dos rieles, cada uno a su escala, con el corte dibujado
// entre los dos y dicho en una nota. En ventanas anchas van en un renglón, con todos los rótulos; en
// angostas, en dos renglones (el corte es el salto de renglón) y solo se rotula el hito que se lee.
import { h, parrafos } from './dom.js';
import { seguir } from './escena.js';
import { imagenDelHito } from './figuras/imagenes-historia.js';
import { HITOS, TRAMOS_DE_LA_LINEA, lugarEnLaLinea } from './hitos.js';
import { capituloDe } from './capitulos/indice.js';
import { direccionDe } from './rutas.js';
import { crearFuentes } from './fuentes.js';
import { crearSeguir } from './seguir.js';

/**
 * @param {HTMLElement} contenedor
 * @param {{comun: object, textos: object, tramo?: number}} opciones
 *   comun: contenido/<idioma>/comun.js; textos: contenido/<idioma>/historia.js; tramo: hito inicial, desde 0
 */
export function montarHistoria(contenedor, { comun, textos: t, tramo = 0 }) {
  const hitos = HITOS.map((hito) => {
    const texto = t.hitos[hito.id];
    if (!texto) throw new Error(`falta el texto del hito "${hito.id}"`);
    return { ...hito, ...texto, ...lugarEnLaLinea(hito.marca) };
  });
  const direccion = (i) => direccionDe({ vista: 'historia', tramo: i + 1 });

  // ---- La línea de tiempo: un riel por tramo, con el corte entre los dos -----------------------------
  const rieles = TRAMOS_DE_LA_LINEA.map(() => {
    const avance = h('div', { class: 'linea-avance' });
    return { avance, el: h('div', { class: 'linea-riel' }, avance) };
  });
  const marcas = hitos.map((hito, i) => {
    // Cerca de un extremo el rótulo se abre hacia adentro, para no salirse de la pantalla.
    const borde = hito.lugar < 0.12 ? ' al-inicio' : hito.lugar > 0.88 ? ' al-final' : '';
    const marca = h('a', {
      class: `linea-marca${hito.arriba ? ' arriba' : ''}${borde}`, href: direccion(i), style: `left: ${hito.lugar * 100}%`,
    }, h('span', { class: 'linea-punto', 'aria-hidden': 'true' }), h('span', { class: 'linea-anio', text: hito.anio }));
    rieles[hito.tramo].el.append(marca);
    return marca;
  });
  const lineaDeTiempo = h('nav', { class: 'linea', 'aria-label': t.linea },
    h('div', { class: 'linea-rieles' },
      rieles.flatMap((r, i) => (i === 0 ? [r.el] : [h('span', { class: 'linea-corte', 'aria-hidden': 'true' }), r.el]))),
    h('p', { class: 'linea-nota', text: t.lineaNota }));

  // ---- La imagen de cada hito y su texto ---------------------------------------------------------------
  const imagenes = hitos.map((hito) => h('div', { class: 'historia-cuadro' }, imagenDelHito(hito.id, { historia: t })));

  /** A qué capítulo y a qué pestaña apunta el hito, o que la práctica todavía no lo tiene. */
  function vinculos(hito) {
    if (hito.pausa) return h('p', { class: 'hito-vinculos hito-sin', text: t.sinCapitulo });
    const capitulo = hito.capitulo ? capituloDe(hito.capitulo) : null;
    const nombre = capitulo ? comun.capitulos[hito.capitulo].titulo : '';
    return h('dl', { class: 'hito-vinculos' },
      h('div', null,
        h('dt', { text: t.capituloRotulo }),
        !capitulo ? h('dd', { class: 'hito-sin', text: t.ningunCapitulo })
          : h('dd', null, capitulo.disponible
            ? h('a', { href: direccionDe({ vista: 'capitulo', id: hito.capitulo, tramo: 1 }), text: nombre })
            : [h('span', { text: nombre }), h('span', { class: 'proximamente', text: t.proximamente })])),
      h('div', null,
        h('dt', { text: t.pestanaRotulo }),
        h('dd', { class: hito.pestana ? null : 'hito-sin', text: hito.pestana || t.sinPractica })));
  }

  const secciones = hitos.map((hito, i) => h('section', { class: 'hito', id: `hito-${hito.id}`, 'data-hito': i },
    h('p', { class: 'hito-anio', text: hito.anio }),
    h('h2', { class: 'pregunta', tabindex: -1, text: hito.titulo }),
    hito.quien ? h('p', { class: 'hito-quien', text: hito.quien }) : null,
    parrafos(hito.texto),
    vinculos(hito)));

  const fija = h('div', { class: 'historia-fija' }, h('div', { class: 'historia-lamina' }, imagenes));
  const raiz = h('div', { class: 'historia' },
    fija,
    h('article', { class: 'historia-texto' },
      h('header', { class: 'capitulo-cabeza' }, h('h1', { text: t.titulo }), h('p', { class: 'bajada', text: t.bajada })),
      secciones,
      h('p', { class: 'historia-continuara', text: t.final }),
      crearSeguir({ desde: 'historia', comun }),
      crearFuentes(t.fuentes)));
  contenedor.append(lineaDeTiempo, raiz);

  let actual = -1;
  function activar(i) {
    if (i === actual) return;
    actual = i;
    rieles.forEach((r, k) => {
      const ancho = k < hitos[i].tramo ? 1 : k > hitos[i].tramo ? 0 : hitos[i].lugar;
      r.avance.style.width = `${ancho * 100}%`;
    });
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
  function linea() {
    const arriba = lineaDeTiempo.getBoundingClientRect().bottom;
    if (getComputedStyle(raiz).getPropertyValue('--apilada').trim() === '1') {
      const abajo = Math.max(arriba, fija.getBoundingClientRect().bottom);
      return abajo + (innerHeight - abajo) * 0.4;
    }
    return arriba + (innerHeight - arriba) / 2;
  }
  // Dónde deja el navegador lo que recibe el foco dentro del texto: apenas por encima de la línea, igual
  // que irA (va como margen de lo que está en el texto; ver pelicula.js).
  const anclar = () => { document.documentElement.style.setProperty('--teo-ancla', `${Math.max(0, linea() - 24)}px`); };
  anclar();
  addEventListener('resize', anclar);
  const seguimiento = seguir({ secciones, linea, alCambiar: activar });
  function irA(i, { enfocar = false } = {}) {
    const k = Math.max(0, Math.min(hitos.length - 1, i));
    scrollTo({ top: Math.max(0, secciones[k].getBoundingClientRect().top + scrollY - linea() + 24), behavior: 'instant' });
    history.replaceState(null, '', direccion(k));
    seguimiento.medir();
    // Quien llegó con el teclado sigue leyendo desde el hito, no desde la línea.
    if (enfocar) secciones[k].querySelector('.pregunta').focus({ preventScroll: true });
  }
  marcas.forEach((m, i) => m.addEventListener('click', (e) => { e.preventDefault(); irA(i, { enfocar: e.detail === 0 }); }));
  if (tramo > 0) irA(tramo);

  return {
    irA,
    actual: () => Math.max(0, actual),
    desmontar() {
      seguimiento.parar();
      removeEventListener('resize', anclar);
      document.documentElement.style.removeProperty('--teo-ancla');
      lineaDeTiempo.remove();
      raiz.remove();
    },
  };
}
