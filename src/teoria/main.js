// Arranque de la teoría (seccion-teoria D1, D2 y D6): una sola página que muestra la portada, la
// historia o un capítulo según la dirección (rutas.js). El contenido de la historia y de cada capítulo
// se pide con import() al abrirlo, en el idioma activo: la portada no descarga los textos de ningún
// capítulo (cargar.js). Cambiar de idioma vuelve a pedir el contenido y lo pinta en el mismo tramo, con la figura
// como estaba (la sesión del capítulo no se pierde).
import es from './contenido/es/comun.js';
import en from './contenido/en/comun.js';
import { h } from './dom.js';
import { IDIOMAS, idiomaInicial, guardarIdioma } from './idioma.js';
import { leerRuta, mismaVista, direccionDe, PORTADA } from './rutas.js';
import { DESTINO_APP } from './capitulos/indice.js';
import { montarPortada } from './portada.js';
import { crearSesion } from './pelicula.js';
import { cargarContenido, cargarCapitulo } from './cargar.js';

const COMUN = { es, en };

const pagina = document.getElementById('pagina');
let idioma = idiomaInicial();
let ruta = PORTADA;
let control = null;
let sesion = null; // { id, sesion }: lo que la persona hizo en el capítulo abierto
let pedido = 0;
// Lo último que se leyó ('historia' o el id de un capítulo): al volver a la portada, el temario se muestra a
// esa altura. Vive lo que vive la página: una visita nueva abre la portada desde el título.
let vieneDe = null;

// ---- La barra (tarea 3.2): volver a la portada, el idioma e "Ir a la app", siempre a la vista ------
const volver = h('a', { class: 'barra-volver', href: './' },
  h('span', { class: 'barra-flecha', 'aria-hidden': 'true', text: '←' }), h('span', { class: 'barra-volver-texto' }));
const marca = h('span', { class: 'barra-marca', 'aria-current': 'page' });
const botonesIdioma = IDIOMAS.map((i) => h('button', {
  type: 'button', class: 'barra-idioma', lang: i, text: i.toUpperCase(), onclick: () => cambiarIdioma(i),
}));
const grupoIdioma = h('div', { class: 'barra-idiomas', role: 'group' }, botonesIdioma);
const irApp = h('a', { class: 'barra-app', href: DESTINO_APP },
  h('span', { class: 'barra-app-texto' }), h('span', { 'aria-hidden': 'true', text: ' →' }));
document.getElementById('barra').replaceChildren(volver, marca, grupoIdioma, irApp);
// Volver a la portada sin recargar la página (con Ctrl o Cmd, el enlace hace lo de siempre).
volver.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  history.pushState(null, '', location.pathname);
  abrir(PORTADA);
});

function pintarBarra() {
  const c = COMUN[idioma].comun;
  const enPortada = ruta.vista === 'portada';
  volver.hidden = enPortada;
  marca.hidden = !enPortada;
  volver.setAttribute('aria-label', c.volverRotulo);
  volver.querySelector('.barra-volver-texto').textContent = c.volver;
  marca.textContent = c.seccion;
  irApp.querySelector('.barra-app-texto').textContent = c.irApp;
  document.getElementById('barra').setAttribute('aria-label', c.barra);
  grupoIdioma.setAttribute('aria-label', c.idiomaRotulo);
  for (const b of botonesIdioma) {
    b.setAttribute('aria-pressed', b.lang === idioma ? 'true' : 'false');
    b.setAttribute('aria-label', c.idiomas[b.lang]);
  }
}

/**
 * Muestra una ruta. `conservar`: es la misma vista en otro idioma; el capítulo sigue con su sesión.
 */
async function abrir(nueva, { conservar = false } = {}) {
  const n = ++pedido;
  const comun = COMUN[idioma];
  let montar;
  let titulo = `${comun.comun.seccion} · ${comun.portada.sobre}`;
  try {
    if (nueva.vista === 'historia') {
      const textos = await cargarContenido('historia', idioma);
      titulo = `${textos.titulo} · ${comun.comun.seccion}`;
      const { montarHistoria } = await import('./historia.js');
      montar = () => montarHistoria(pagina, { comun, textos, tramo: nueva.tramo - 1 });
    } else if (nueva.vista === 'capitulo') {
      const [textos, { guion, crearFigura }, { montarPelicula }] = await Promise.all([
        cargarContenido(nueva.id, idioma), cargarCapitulo(nueva.id), import('./pelicula.js')]);
      if (!conservar || sesion?.id !== nueva.id) sesion = { id: nueva.id, sesion: crearSesion(guion) };
      titulo = `${textos.titulo} · ${comun.comun.seccion}`;
      const propia = sesion.sesion;
      montar = () => montarPelicula(pagina, {
        id: nueva.id, comun, textos, guion, crearFigura, sesion: propia, tramo: nueva.tramo - 1, ir: conservar,
      });
    } else {
      montar = () => montarPortada(pagina, { comun, vieneDe });
    }
  } catch (error) {
    // Sin el contenido no hay capítulo que mostrar: queda la portada (artículo 8).
    console.error('No se pudo cargar el contenido de la teoría', error);
    if (n !== pedido) return;
    nueva = PORTADA;
    montar = () => montarPortada(pagina, { comun, vieneDe });
  }
  if (n !== pedido) return; // llegó otro pedido mientras se cargaba este
  control?.desmontar();
  if (nueva.vista !== 'capitulo') sesion = null;
  if (ruta.vista !== 'portada') vieneDe = ruta.vista === 'historia' ? 'historia' : ruta.id;
  ruta = nueva;
  document.documentElement.lang = idioma;
  document.title = titulo;
  document.body.dataset.vista = nueva.vista;
  pintarBarra();
  if (!conservar) scrollTo({ top: 0, behavior: 'instant' });
  control = montar();
}

function cambiarIdioma(nuevo) {
  if (nuevo === idioma) return;
  guardarIdioma(nuevo);
  idioma = nuevo;
  const tramo = (control?.actual() ?? 0) + 1;
  abrir(ruta.vista === 'portada' ? ruta : { ...ruta, tramo }, { conservar: true });
}

// "Volver al temario" (seguir.js): un enlace a la portada que vuelve sin recargar, como el de la barra.
pagina.addEventListener('click', (e) => {
  const enlace = e.target.closest?.('a[data-temario]');
  if (!enlace || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  history.pushState(null, '', location.pathname);
  abrir(PORTADA);
});

addEventListener('popstate', () => { if (!location.hash && ruta.vista !== 'portada') abrir(PORTADA); });
addEventListener('hashchange', () => {
  const nueva = leerRuta(location.hash);
  if (mismaVista(nueva, ruta) && nueva.vista !== 'portada') { control.irA(nueva.tramo - 1); return; }
  // Una dirección desconocida muestra la portada y queda escrita como tal.
  if (nueva.vista === 'portada' && location.hash) history.replaceState(null, '', location.pathname);
  abrir(nueva);
});

const inicial = leerRuta(location.hash);
if (inicial.vista === 'portada' && location.hash) history.replaceState(null, '', location.pathname);
else if (location.hash !== direccionDe(inicial)) history.replaceState(null, '', direccionDe(inicial) || location.pathname);
pintarBarra();
abrir(inicial);
