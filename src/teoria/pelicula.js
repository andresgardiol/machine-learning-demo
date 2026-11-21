// El formato de capítulo, la película (seccion-teoria D4 y D5; viene de teoria-prototipos, grupo 7 y
// revisiones 1 y 2): la figura queda fija y los tramos de texto pasan; la figura va al estado del tramo
// que está en escena. La predicción pide elegir (sin respuesta, la figura no pasa de ese tramo y los
// siguientes lo dicen) y el índice lleva el título de cada tramo.
//
//   <div class="peli">
//     <nav class="indice">        el tramo de ahora y la lista de tramos (tira plegada o columna)
//     <div class="peli-fija">     la figura, que queda fija
//     <article class="peli-texto"> los tramos, que pasan
//
// La disposición la decide el CSS según el ancho: figura a la izquierda y texto a la derecha, o, en
// ventanas angostas, figura arriba y texto debajo. Lo dice con --apilada (1 arriba, 0 al costado): de
// eso depende por dónde pasa la línea que decide qué tramo está en escena.
//
// Lo que la persona hizo (lo cambiado en la figura por tramo y las respuestas) vive en una `sesion`, fuera
// del DOM: al cambiar de idioma la película se rearma con los textos nuevos y la misma sesión, en el
// mismo tramo y con la figura como estaba (D6).
import { crearTramo } from './tramo.js';
import { seguir } from './escena.js';
import { h, rellenar } from './dom.js';
import { crearEstadoPorTramo } from './estado-figura.js';
import { direccionDe } from './rutas.js';
import { armarTramos } from './cargar.js';
import { crearFuentes } from './fuentes.js';
import { crearProfundizar } from './profundizar.js';
import { crearSeguir } from './seguir.js';

/** Lo que la persona hizo en un capítulo: dura mientras la página siga abierta en ese capítulo. */
export function crearSesion(guion) {
  return { estados: crearEstadoPorTramo(guion.map((t) => t.estado)), respuestas: new Map() };
}

/**
 * @param {HTMLElement} contenedor
 * @param {{id: string, comun: object, textos: object, guion: object[], crearFigura: Function,
 *   sesion: ReturnType<typeof crearSesion>, tramo?: number, ir?: boolean}} opciones
 *   comun: contenido/<idioma>/comun.js; textos: contenido/<idioma>/<id>.js; guion: TRAMOS del capítulo;
 *   crearFigura: la de capitulos/<id>/figura.js; tramo: el tramo inicial, desde 0; ir: llevar a ese tramo
 *   aunque sea el primero (al rearmar en otro idioma).
 * @returns {{irA: (i: number, opciones?: {enfocar?: boolean}) => void, actual: () => number, desmontar: () => void}}
 */
export function montarPelicula(contenedor, { id, comun, textos, guion, crearFigura, sesion, tramo = 0, ir = false }) {
  const { estados, respuestas } = sesion;
  const c = {
    idioma: comun.idioma,
    comun: comun.comun,
    pelicula: comun.pelicula,
    capitulo: { titulo: textos.titulo, bajada: textos.bajada, tramos: armarTramos(guion, textos.tramos), cierre: textos.cierre },
    figura: textos.figura,
  };
  const total = c.capitulo.tramos.length;
  let actual = -1;
  let figura = null;
  let desmontada = false;
  const relojes = new Set();
  const despues = (ms, fn) => { const r = setTimeout(() => { relojes.delete(r); if (!desmontada) fn(); }, ms); relojes.add(r); };

  const vistas = c.capitulo.tramos.map((t, i) => crearTramo(t, i, { c, alElegir: (respuesta, o) => resolver(i, respuesta, o) }));

  // La predicción pide elegir: sin respuesta, la figura no pasa de ese tramo y los siguientes lo dicen.
  const iPrediccion = vistas.findIndex((x) => x.tramo.prediccion);
  const espera = () => iPrediccion !== -1 && vistas[iPrediccion].pendiente();
  /** El tramo cuyo estado muestra la figura cuando el que está en escena es i. */
  const tramoDeLaFigura = (i) => (espera() ? Math.min(i, iPrediccion) : i);
  const enFigura = () => tramoDeLaFigura(Math.max(0, actual));
  const avisos = vistas.map((x, i) => {
    if (iPrediccion === -1 || i <= iPrediccion) return null;
    const enlace = h('a', { href: direccionDe({ vista: 'capitulo', id, tramo: iPrediccion + 1 }), text: c.pelicula.volver });
    enlace.addEventListener('click', (e) => { e.preventDefault(); irA(iPrediccion); });
    const aviso = h('p', { class: 'pelicula-espera' }, rellenar(c.pelicula.espera, { n: iPrediccion + 1 }), enlace);
    x.titulo.after(aviso);
    return aviso;
  });

  /** Lleva la figura al estado del tramo k: el del guion o lo que la persona dejó ahí (D4). */
  function mostrar(k, { animar = true } = {}) {
    const { estado, cambiado } = estados.entrar(k);
    figura.mostrarCambios(cambiado);
    figura.poner(estado, { animar });
    vistas[k].leer(figura.leer());
  }

  function resolver(i, respuesta, { restaurar }) {
    avisos.forEach((a) => { if (a) a.hidden = !espera(); });
    if (restaurar) return;
    respuestas.set(i, respuesta);
    // La base del tramo pasa a ser la de "después". Primero la figura como estaba en la pregunta;
    // después, el cambio, para verlo pasar.
    const antes = estados.base(i);
    estados.fijarBase(i, vistas[i].tramo.prediccion.despues);
    figura.mostrarCambios(false);
    figura.poner(antes, { animar: false });
    despues(350, () => mostrar(enFigura()));
  }

  // El índice: un botón con el tramo de ahora (cuando va plegado) y la lista con el título de cada uno.
  const actualTitulo = h('span', { class: 'indice-titulo' });
  const actualCuenta = h('span', { class: 'indice-cuenta' });
  const boton = h('button', { type: 'button', class: 'indice-actual', 'aria-expanded': 'false', 'aria-label': c.pelicula.indice }, actualTitulo, actualCuenta);
  const marcas = vistas.map((x, i) => {
    const a = h('a', { href: direccionDe({ vista: 'capitulo', id, tramo: i + 1 }), class: 'indice-marca', text: x.tramo.corto });
    a.addEventListener('click', (e) => { e.preventDefault(); plegar(); irA(i); });
    return a;
  });
  const indice = h('nav', { class: 'indice', 'aria-label': c.pelicula.avance }, boton, h('ol', null, marcas.map((m) => h('li', null, m))));
  function plegar() {
    delete indice.dataset.abierto;
    boton.setAttribute('aria-expanded', 'false');
  }
  boton.addEventListener('click', () => {
    const abrir = !('abierto' in indice.dataset);
    if (abrir) indice.dataset.abierto = '1'; else plegar();
    boton.setAttribute('aria-expanded', abrir ? 'true' : 'false');
  });
  indice.addEventListener('keydown', (e) => { if (e.key === 'Escape') { plegar(); boton.focus(); } });
  const fuera = (e) => { if (!indice.contains(e.target)) plegar(); };
  document.addEventListener('pointerdown', fuera);

  const fija = h('div', { class: 'peli-fija' });
  figura = crearFigura(fija, {
    c,
    alCambiar: (l) => vistas[enFigura()]?.leer(l),
    // Lo que la persona cambia queda en el tramo que muestra la figura, y solo en ese.
    alTocar: (estado) => figura.mostrarCambios(estados.cambiar(enFigura(), estado).cambiado),
    alRestablecer: () => { estados.restablecer(enFigura()); mostrar(enFigura()); },
  });
  const texto = h('article', { class: 'peli-texto' },
    h('header', { class: 'capitulo-cabeza' }, h('h1', { text: c.capitulo.titulo }), h('p', { class: 'bajada', text: c.capitulo.bajada })),
    vistas.map((x) => x.el),
    crearProfundizar(textos.profundizar),
    // Seguir leyendo va antes de las fuentes: nadie tiene que pasar la lista de referencias para encontrarlo.
    crearSeguir({ desde: id, comun }),
    crearFuentes(textos.fuentes));
  const raiz = h('div', { class: 'peli' }, indice, fija, texto);
  contenedor.append(raiz);
  // Las respuestas que ya se habían dado (la película se rearma al cambiar de idioma).
  for (const [i, respuesta] of respuestas) vistas[i]?.restaurar(respuesta);
  avisos.forEach((a) => { if (a) a.hidden = !espera(); });

  const apilada = () => getComputedStyle(raiz).getPropertyValue('--apilada').trim() === '1';
  const barra = () => document.getElementById('barra').getBoundingClientRect().bottom;
  /** La línea que decide el tramo en escena: debajo de la figura si va arriba; si no, el medio. */
  function linea() {
    if (apilada()) {
      // Si la figura no quedó fija (D5), la línea no depende de por dónde va: queda a una altura fija.
      const abajo = suelta ? indice.getBoundingClientRect().bottom : fija.getBoundingClientRect().bottom;
      return abajo + (innerHeight - abajo) * 0.4;
    }
    return barra() + (innerHeight - barra()) / 2;
  }

  // D5: con la figura arriba, ella y sus controles ocupan como máximo el 60 % del alto de la ventana. Si
  // no entra ni en su tamaño mínimo, deja de quedar fija y se desplaza con el texto.
  let suelta = false;
  function medirFigura() {
    const nueva = apilada() && fija.offsetHeight > innerHeight * 0.6;
    if (nueva === suelta) return;
    suelta = nueva;
    fija.classList.toggle('suelta', suelta);
  }
  medirFigura();

  function activar(i) {
    const primera = actual === -1;
    actual = i;
    vistas.forEach((x, k) => x.el.classList.toggle('activo', k === i));
    marcas.forEach((m, k) => { if (k === i) m.setAttribute('aria-current', 'true'); else m.removeAttribute('aria-current'); });
    actualTitulo.textContent = `${i + 1}. ${vistas[i].tramo.corto}`;
    actualCuenta.textContent = rellenar(c.pelicula.cuenta, { n: i + 1, total });
    // Al abrir la página la figura aparece ya en su estado: la transición es para los cambios de tramo.
    mostrar(tramoDeLaFigura(i), { animar: !primera });
    // Con la figura ya en su estado se sabe cuánto ocupa: si no entra en el 60 % del alto, no queda fija.
    if (primera) medirFigura();
  }

  /** Lleva un tramo a escena: su comienzo queda apenas por encima de la línea. */
  function irA(i, { enfocar = true } = {}) {
    const k = Math.max(0, Math.min(total - 1, i));
    const arriba = vistas[k].el.getBoundingClientRect().top + scrollY;
    scrollTo({ top: Math.max(0, arriba - linea() + 24), behavior: 'instant' });
    history.replaceState(null, '', direccionDe({ vista: 'capitulo', id, tramo: k + 1 }) || location.pathname);
    seguimiento.medir();
    if (enfocar) vistas[k].titulo.focus({ preventScroll: true });
  }

  // Dónde deja el navegador lo que recibe el foco dentro del texto: apenas por encima de la línea, igual
  // que irA. Sin esto lo dejaría arriba de todo, tapado por la figura cuando va arriba. Va como margen
  // de lo que está en el texto (--teo-ancla) y no como relleno de la página: con relleno, llegar con Tab
  // a la barra, al índice o a la figura, que quedan fijos, desplazaba el texto y cambiaba de tramo.
  const anclar = () => { medirFigura(); document.documentElement.style.setProperty('--teo-ancla', `${Math.max(0, linea() - 24)}px`); };
  anclar();
  addEventListener('resize', anclar);
  const seguimiento = seguir({ secciones: vistas.map((x) => x.el), linea, alCambiar: activar });
  if (tramo > 0 || ir) irA(tramo, { enfocar: false });

  return {
    irA,
    /** El tramo en escena, desde 0. */
    actual: () => Math.max(0, actual),
    desmontar() {
      desmontada = true;
      for (const r of relojes) clearTimeout(r);
      seguimiento.parar();
      removeEventListener('resize', anclar);
      document.removeEventListener('pointerdown', fuera);
      document.documentElement.style.removeProperty('--teo-ancla');
      raiz.remove();
    },
  };
}
