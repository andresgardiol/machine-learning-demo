// "Una neurona" por pasos (teoria-prototipos, grupo 6): una pantalla por tramo, con Anterior, Siguiente
// y el avance. La figura es una sola y conserva su estado al pasar de tramo; la predicción pide elegir
// antes de seguir.
import { montarPagina } from '../comun/pagina.js';
import { crearTramo } from '../comun/capitulo.js';
import { crearFigura } from '../figuras/figura.js';
import { h, rellenar } from '../comun/dom.js';

const c = montarPagina({ forma: 'pasos', titulo: (t) => `${t.capitulo.titulo}: ${t.comun.formas.pasos}` });
const pagina = document.getElementById('pagina');
const total = c.capitulo.tramos.length;
let actual = 0;
let figura = null;

const vistas = c.capitulo.tramos.map((tramo, i) => crearTramo(tramo, i, { c, figura: () => figura, alResolver: () => pintar() }));
const lamina = h('div', { class: 'pasos-figura' });
figura = crearFigura(lamina, { c, alCambiar: (l) => vistas[actual]?.leer(l) });

const anterior = h('button', { type: 'button', class: 'boton', text: `← ${c.pasos.anterior}`, onclick: () => ir(actual - 1) });
const siguiente = h('button', { type: 'button', class: 'boton boton-principal', onclick: () => ir(actual + 1) });
const bloqueo = h('p', { class: 'pasos-bloqueo', 'aria-live': 'polite' });
const cuenta = h('span', { class: 'pasos-cuenta' });
const marcas = vistas.map((v, i) => h('button', {
  type: 'button', class: 'pasos-marca',
  'aria-label': rellenar(c.pasos.irA, { n: i + 1, titulo: v.tramo.corto }),
  title: v.tramo.corto,
  onclick: () => ir(i),
}));

pagina.append(
  h('div', { class: 'pasos' },
    lamina,
    h('div', { class: 'pasos-texto' }, vistas.map((v) => v.el)),
    h('footer', { class: 'pasos-pie' },
      anterior,
      h('div', { class: 'pasos-avance' }, h('div', { class: 'pasos-marcas' }, marcas), cuenta),
      h('div', { class: 'pasos-seguir' }, bloqueo, siguiente))));

/** El primer tramo con una predicción sin resolver: no se pasa de ahí. */
const tope = () => {
  const i = vistas.findIndex((v) => v.pendiente());
  return i === -1 ? total - 1 : i;
};

function pintar() {
  vistas.forEach((v, i) => { v.el.hidden = i !== actual; });
  anterior.disabled = actual === 0;
  const ultimo = actual === total - 1;
  const trabado = vistas[actual].pendiente();
  siguiente.textContent = ultimo ? c.pasos.fin : `${c.pasos.siguiente} →`;
  siguiente.disabled = ultimo;
  // Trabado no es deshabilitado: el botón se puede enfocar y dice por qué no avanza.
  siguiente.setAttribute('aria-disabled', trabado ? 'true' : 'false');
  if (!trabado) bloqueo.textContent = '';
  cuenta.textContent = rellenar(c.pasos.avance, { n: actual + 1, total });
  marcas.forEach((m, i) => {
    m.classList.toggle('hecha', i < actual);
    if (i === actual) m.setAttribute('aria-current', 'step'); else m.removeAttribute('aria-current');
    m.disabled = i > tope();
  });
}

function ir(i, { enfocar = true, animar = true } = {}) {
  if (i < 0 || i >= total) return;
  if (i > tope()) {
    bloqueo.textContent = c.pasos.bloqueo;
    return;
  }
  actual = i;
  pintar();
  figura.irA(vistas[actual].estado(), { animar });
  vistas[actual].leer(figura.leer());
  if (enfocar) vistas[actual].titulo.focus({ preventScroll: true });
  history.replaceState(null, '', `#${vistas[actual].tramo.id}`);
}

// Flechas izquierda y derecha pasan de tramo, salvo dentro de la figura, donde mueven las perillas.
document.addEventListener('keydown', (e) => {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.target.closest?.('.figura, input, select, textarea')) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); ir(actual + 1); }
  if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); ir(actual - 1); }
});

const inicial = Math.max(0, vistas.findIndex((v) => `#${v.tramo.id}` === location.hash));
ir(Math.min(inicial, tope()), { enfocar: false, animar: false });
