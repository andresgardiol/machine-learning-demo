// "Una neurona" como libro (teoria-prototipos, grupo 5): se lee bajando. Cada tramo lleva su propia
// figura entre los párrafos, ya en el estado de ese tramo, y un índice al costado salta a cualquiera.
import { montarPagina } from '../comun/pagina.js';
import { crearTramo } from '../comun/capitulo.js';
import { crearFigura } from '../figuras/figura.js';
import { h } from '../comun/dom.js';

const c = montarPagina({ forma: 'libro', titulo: (t) => `${t.capitulo.titulo}: ${t.comun.formas.libro}` });
const pagina = document.getElementById('pagina');

const enlaces = [];
const vistas = c.capitulo.tramos.map((tramo, i) => {
  let figura = null;
  const vista = crearTramo(tramo, i, { c, figura: () => figura });
  figura = crearFigura(vista.ranura, { c, compacta: true, alCambiar: (l) => vista.leer(l) });
  figura.irA(tramo.estado, { animar: false });
  const enlace = h('a', { href: `#${tramo.id}`, text: tramo.corto });
  enlaces.push(enlace);
  return vista;
});

pagina.append(
  h('div', { class: 'libro' },
    h('nav', { class: 'libro-indice', 'aria-label': c.capitulo.indice },
      h('p', { class: 'libro-indice-titulo', text: c.capitulo.indice }),
      h('ol', null, enlaces.map((a) => h('li', null, a)))),
    h('article', { class: 'libro-texto' },
      h('header', { class: 'capitulo-cabeza' },
        h('h1', { text: c.capitulo.titulo }),
        h('p', { class: 'bajada', text: c.capitulo.bajada })),
      vistas.map((v) => v.el))));

// El índice marca el tramo que se está leyendo.
const observador = new IntersectionObserver((entradas) => {
  for (const e of entradas) {
    if (!e.isIntersecting) continue;
    const i = Number(e.target.dataset.tramo);
    enlaces.forEach((a, k) => (k === i ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }
}, { rootMargin: '-30% 0px -60% 0px' });
vistas.forEach((v) => observador.observe(v.el));

// Si la dirección trae un tramo (#id), se va a él: el navegador no lo hace solo porque la página se arma
// después de cargar.
const destino = location.hash && document.getElementById(location.hash.slice(1));
if (destino) destino.scrollIntoView({ behavior: 'instant', block: 'start' });
