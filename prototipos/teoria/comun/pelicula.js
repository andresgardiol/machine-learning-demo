// La película (teoria-prototipos, grupo 7, D5 y revisiones 1 y 2): la figura queda fija y los seis
// tramos de texto pasan; la figura va al estado del tramo que está en escena. La predicción pide elegir
// (sin respuesta, la figura no pasa de ese tramo y los siguientes lo dicen) y el índice lleva el título
// de cada tramo.
//
//   <div class="peli">
//     <nav class="indice">        el tramo de ahora y la lista de tramos (tira plegada o columna)
//     <div class="peli-fija">     la figura, que queda fija
//     <article class="peli-texto"> los seis tramos, que pasan
//
// La disposición la decide el CSS según el ancho: figura a la izquierda y texto a la derecha, o, en
// ventanas angostas, figura arriba y texto debajo. Lo dice con --apilada (1 arriba, 0 al costado): de
// eso depende por dónde pasa la línea que decide qué tramo está en escena.
import { montarPagina } from './pagina.js';
import { crearTramo } from './capitulo.js';
import { seguir } from './escena.js';
import { h, rellenar } from './dom.js';
import { crearFigura } from '../figuras/figura.js';

export function montarPelicula() {
  const c = montarPagina({ forma: 'pelicula', titulo: (t) => `${t.capitulo.titulo}: ${t.comun.formas.pelicula}` });
  const total = c.capitulo.tramos.length;
  let actual = -1;
  let figura = null;

  const vistas = c.capitulo.tramos.map((tramo, i) => crearTramo(tramo, i, { c, figura: () => figura, alResolver: () => avisar() }));

  // La predicción pide elegir: sin respuesta, la figura no pasa de ese tramo y los siguientes lo dicen.
  const iPrediccion = vistas.findIndex((x) => x.tramo.prediccion);
  const espera = () => iPrediccion !== -1 && vistas[iPrediccion].pendiente();
  const tramoDeLaFigura = (i) => (espera() ? Math.min(i, iPrediccion) : i);
  const avisos = vistas.map((x, i) => {
    if (i <= iPrediccion) return null;
    const enlace = h('a', { href: `#${vistas[iPrediccion].tramo.id}`, text: c.pelicula.volver });
    enlace.addEventListener('click', (e) => { e.preventDefault(); irA(iPrediccion); });
    const aviso = h('p', { class: 'pelicula-espera' }, c.pelicula.espera, enlace);
    x.titulo.after(aviso);
    return aviso;
  });
  function avisar() {
    avisos.forEach((a) => { if (a) a.hidden = !espera(); });
    // Recién contestada: si ya se estaba más adelante, la figura alcanza a ese tramo.
    if (!espera() && actual > iPrediccion) figura.irA(vistas[actual].estado());
  }

  // El índice: un botón con el tramo de ahora (cuando va plegado) y la lista con el título de cada uno.
  const actualTitulo = h('span', { class: 'indice-titulo' });
  const actualCuenta = h('span', { class: 'indice-cuenta' });
  const boton = h('button', { type: 'button', class: 'indice-actual', 'aria-expanded': 'false', 'aria-label': c.pelicula.indice }, actualTitulo, actualCuenta);
  const marcas = vistas.map((x, i) => {
    const a = h('a', { href: `#${x.tramo.id}`, class: 'indice-marca', text: x.tramo.corto });
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
  document.addEventListener('pointerdown', (e) => { if (!indice.contains(e.target)) plegar(); });

  const fija = h('div', { class: 'peli-fija' });
  figura = crearFigura(fija, { c, alCambiar: (l) => vistas[tramoDeLaFigura(Math.max(0, actual))]?.leer(l) });
  const texto = h('article', { class: 'peli-texto' },
    h('header', { class: 'capitulo-cabeza' }, h('h1', { text: c.capitulo.titulo }), h('p', { class: 'bajada', text: c.capitulo.bajada })),
    vistas.map((x) => x.el));
  const raiz = h('div', { class: 'peli' }, indice, fija, texto);
  document.getElementById('pagina').append(raiz);
  avisar();

  const apilada = () => getComputedStyle(raiz).getPropertyValue('--apilada').trim() === '1';
  const barra = () => document.getElementById('barra').getBoundingClientRect().bottom;
  /** La línea que decide el tramo en escena: debajo de la figura si va arriba; si no, el medio. */
  function linea() {
    if (apilada()) {
      const abajo = fija.getBoundingClientRect().bottom;
      return abajo + (innerHeight - abajo) * 0.4;
    }
    return barra() + (innerHeight - barra()) / 2;
  }

  function activar(i) {
    const primera = actual === -1;
    actual = i;
    vistas.forEach((x, k) => x.el.classList.toggle('activo', k === i));
    marcas.forEach((m, k) => { if (k === i) m.setAttribute('aria-current', 'true'); else m.removeAttribute('aria-current'); });
    actualTitulo.textContent = `${i + 1}. ${vistas[i].tramo.corto}`;
    actualCuenta.textContent = rellenar(c.pelicula.cuenta, { n: i + 1, total });
    const k = tramoDeLaFigura(i);
    // Al abrir la página la figura aparece ya en su estado: la transición es para los cambios de tramo.
    figura.irA(vistas[k].estado(), { animar: !primera });
    vistas[k].leer(figura.leer());
  }

  /** Lleva un tramo a escena: su comienzo queda apenas por encima de la línea. */
  function irA(i, { enfocar = true } = {}) {
    const arriba = vistas[i].el.getBoundingClientRect().top + scrollY;
    scrollTo({ top: Math.max(0, arriba - linea() + 24), behavior: 'instant' });
    history.replaceState(null, '', `#${vistas[i].tramo.id}`);
    seguimiento.medir();
    if (enfocar) vistas[i].titulo.focus({ preventScroll: true });
  }

  // Dónde deja el navegador un #tramo cuando lo lleva él (al cargar, o con un enlace): apenas por encima
  // de la línea, igual que irA. Sin esto lo dejaría arriba de todo, tapado por la figura cuando va arriba.
  const anclar = () => { document.documentElement.style.scrollPaddingTop = `${Math.max(0, linea() - 24)}px`; };
  anclar();
  addEventListener('resize', anclar);
  const seguimiento = seguir({ secciones: vistas.map((x) => x.el), linea, alCambiar: activar });
  const inicial = vistas.findIndex((x) => `#${x.tramo.id}` === location.hash);
  if (inicial > 0) irA(inicial, { enfocar: false });
  addEventListener('hashchange', () => {
    const i = vistas.findIndex((x) => `#${x.tramo.id}` === location.hash);
    if (i !== -1) irA(i, { enfocar: false });
  });
}
