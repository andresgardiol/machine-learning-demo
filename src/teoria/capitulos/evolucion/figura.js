// La figura viva de "Aprender por evolución" (seccion-teoria D12, capítulo 7): doce neuronas, cada una un
// punto sobre el mapa del error del capítulo 5, y al lado la lista de las doce ordenadas de mejor a peor.
// Es una sola figura: primero los puntos sin el relieve (la evolución no lo ve: solo sabe el puntaje de
// cada una), después el relieve, las que pasan y las generaciones. El mapa lo dibuja figuras/paisaje.js;
// toda la cuenta sale de cuenta.js (nextGeneration y mutate de la pestaña Entrenar).
//
// Forma además de color: una neurona es un círculo; la que pasa lleva un anillo; la élite es una estrella
// violeta; la que no pasa queda hueca; la que eligió la persona lleva el anillo azul de "vos". Los padres
// de la generación anterior quedan como círculos a rayas donde estaban.
//
// Igual que las otras figuras, no decide qué valores muestra: `poner` la lleva al estado que le dan y
// `alTocar` avisa cada cambio de la persona con el estado completo (D4).

import { h, s, rellenar, formato, crearAyuda, conAyuda, descripcionOculta } from '../../dom.js';
import { puntuar, pesosDe, DESAFIO } from './cuenta.js';
import { mapaDelError } from '../corregir/cuenta.js';
import { DE_LA_VISTA, RANGOS, TOPE_TANDAS, POBLACION, poblacionDe, avanceDelDesafio } from './guion.js';
import { crearMapa } from '../../figuras/paisaje.js';

const ANCHO = 580;
const ALTO = 330;
const FILA = { x: 372, ancho: 200, y: 34, alto: 22 };
const MAX_ELEGIDOS = 6;
const ESTRELLA = 'M0 -10 L2.9 -3.1 L9.5 -3.1 L4.3 1.6 L5.9 8.1 L0 4.6 L-5.9 8.1 L-4.3 1.6 L-9.5 -3.1 L-2.9 -3.1 Z';

/** La marca de una neurona: el círculo, la estrella de la élite y el anillo de las que pasan. */
const crearMarca = () => [
  s('circle', { class: 'evo-anillo', r: 11 }),
  s('circle', { class: 'evo-punto', r: 6.5 }),
  s('path', { class: 'evo-estrella', d: ESTRELLA }),
];

/**
 * @param {HTMLElement} contenedor
 * @param {{c: {idioma: string, figura: object}, alCambiar?: (lectura: object) => void,
 *   alTocar?: (estado: object) => void, alRestablecer?: () => void}} opciones
 */
export function crearFigura(contenedor, { c, alCambiar = () => {}, alTocar = () => {}, alRestablecer = () => {} }) {
  const fmt = formato(c.idioma);
  const f = c.figura;
  let vista = 'puntaje';
  let tanda = 0;
  let pasan = DESAFIO.solucion.padres;
  let fuerza = DESAFIO.solucion.fuerza;
  let historia = [];
  let elegidos = [];
  let cambiada = false;
  let avisoPendiente = 0;

  // ---- El mapa y las doce neuronas ---------------------------------------------------------------------
  const mapa = crearMapa({ caja: { x: 56, y: 12, lado: 270 }, clase: 'evo-mapa' });
  mapa.fijar(mapaDelError({ n: 49 }), { rotulos: { x: f.ejes.izquierdo, y: f.ejes.derecho, fondo: f.fondo }, fmt });
  mapa.dibujar({});
  const descripcion = descripcionOculta(f.neurona.descripcion);
  const fantasmas = Array.from({ length: MAX_ELEGIDOS }, () => s('circle', { class: 'evo-fantasma', r: 9 }));
  const puntos = Array.from({ length: POBLACION }, (_, i) => {
    const g = s('g', { class: 'evo-neurona', 'aria-describedby': descripcion.id }, s('circle', { class: 'plano-punto-zona', r: 15 }), crearMarca());
    g.addEventListener('click', () => elegir(i));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(i); } });
    return g;
  });
  mapa.extra.append(...fantasmas, ...puntos);

  // ---- La lista, de mejor a peor ------------------------------------------------------------------------
  const cabeza = [
    s('text', { class: 'rotulo', x: FILA.x + 4, y: 22, text: f.lista.titulo }),
    s('text', { class: 'rotulo', x: FILA.x + 122, y: 22, 'text-anchor': 'end', text: f.lista.error }),
  ];
  const filas = Array.from({ length: POBLACION }, (_, k) => {
    const y = FILA.y + k * FILA.alto + FILA.alto / 2;
    const orden = s('text', { class: 'rotulo evo-orden', x: FILA.x + 16, y: y + 5, 'text-anchor': 'end', text: String(k + 1) });
    const marca = s('g', { class: 'evo-marca-fila', transform: `translate(${FILA.x + 38} ${y}) scale(0.8)` }, crearMarca());
    const error = s('text', { class: 'evo-error', x: FILA.x + 122, y: y + 5, 'text-anchor': 'end' });
    const rol = s('text', { class: 'rotulo evo-rol', x: FILA.x + FILA.ancho - 2, y: y + 5, 'text-anchor': 'end' });
    const g = s('g', { class: 'evo-fila' },
      s('rect', { class: 'error-fila-fondo', x: FILA.x, y: y - FILA.alto / 2 + 1, width: FILA.ancho, height: FILA.alto - 2, rx: 4 }), orden, marca, error, rol);
    g.addEventListener('click', () => elegir(g.dataset.indice === undefined ? -1 : Number(g.dataset.indice)));
    return { g, error, rol };
  });

  const vivo = h('p', { class: 'solo-lector', 'aria-live': 'polite', id: `figura-evolucion-${Math.random().toString(36).slice(2, 8)}` });
  const svg = s('svg', { class: 'escenario', viewBox: `0 0 ${ANCHO} ${ALTO}`, role: 'group', 'aria-label': f.titulo, 'aria-describedby': vivo.id },
    mapa.g, cabeza, filas.map((x) => x.g));

  // ---- La cuenta escrita y los mandos -----------------------------------------------------------------
  const cuenta = h('p', { class: 'figura-cuenta', 'aria-hidden': 'true' });
  const idCampo = `perilla-evolucion-${Math.random().toString(36).slice(2, 8)}`;
  const campo = h('input', { type: 'range', id: idCampo, class: 'perilla-campo' });
  const rotuloPerilla = h('span', { class: 'perilla-rotulo' });
  const valorPerilla = h('output', { class: 'perilla-valor', for: idCampo });
  const ayudaPerilla = crearAyuda('');
  const perilla = h('div', { class: 'perilla perilla-tasa' }, h('label', { for: idCampo, class: 'perilla-cabeza' }, rotuloPerilla, valorPerilla), conAyuda(campo, ayudaPerilla, 'perilla-riel'));
  campo.addEventListener('input', () => {
    const cual = DE_LA_VISTA[vista].perilla;
    if (cual === 'pasan') pasan = Math.round(Number(campo.value)); else if (cual === 'fuerza') fuerza = Math.round(Number(campo.value));
    dibujar();
    alTocar(estado());
  });
  const ayudaBoton = crearAyuda('');
  const boton = h('button', { type: 'button', class: 'boton boton-figura', onclick: () => apretar() });
  const cajaBoton = conAyuda(boton, ayudaBoton, 'ayuda-derecha');
  const mandos = h('div', { class: 'figura-mandos' }, h('div', { class: 'figura-mandos-mixtos' }, perilla, cajaBoton));

  const marcador = h('p', { class: 'figura-marcador' });
  const restablecer = h('button', { type: 'button', class: 'boton', text: f.restablecer.rotulo, onclick: () => alRestablecer() });
  const aviso = h('span', { class: 'figura-aviso', text: f.tocada });
  const pieAccion = h('div', { class: 'figura-accion' }, aviso, conAyuda(restablecer, crearAyuda(f.restablecer.ayuda), 'ayuda-derecha'));
  const pie = h('div', { class: 'figura-pie' }, marcador, pieAccion);

  const figura = h('figure', { class: 'figura figura-red figura-evolucion' }, h('div', { class: 'figura-lamina' }, svg), cuenta, mandos, pie, vivo, descripcion);
  contenedor.append(figura);

  // ---- Estado ----------------------------------------------------------------------------------------
  const estado = () => ({ vista, tanda, pasan, fuerza, historia: historia.map((g) => ({ ...g, elegidos: g.elegidos ? [...g.elegidos] : null })), elegidos: [...elegidos] });

  function leer() {
    const p = poblacionDe(estado());
    const { puntajes, orden } = puntuar(p.poblacion);
    return {
      vista, ...p, puntajes, orden, mejor: puntajes[orden[0]].error, cambiada,
      desafio: vista === 'desafio' ? avanceDelDesafio(estado()) : null,
    };
  }

  /** En el desafío, marca o desmarca una neurona como padre de la generación que sigue (hasta seis). */
  function elegir(i) {
    const d = DE_LA_VISTA[vista];
    if (!d.elegir || i < 0 || historia.length >= d.tope) return;
    if (elegidos.includes(i)) elegidos = elegidos.filter((x) => x !== i);
    else if (elegidos.length < MAX_ELEGIDOS) elegidos = [...elegidos, i];
    else return;
    dibujar();
    alTocar(estado());
  }

  function apretar() {
    const d = DE_LA_VISTA[vista];
    if (d.boton === 'tanda') {
      if (tanda >= TOPE_TANDAS) return;
      tanda += 1;
    } else if (d.boton === 'generacion') {
      if (historia.length >= d.tope || (d.elegir && elegidos.length === 0)) return;
      historia = [...historia, d.elegir ? { pasan: elegidos.length, fuerza, elegidos: [...elegidos] } : { pasan, fuerza, elegidos: null }];
      elegidos = [];
    } else return;
    dibujar();
    alTocar(estado());
  }

  const termino = (clase, texto) => h('span', { class: clase, text: texto });

  function dibujar() {
    const d = DE_LA_VISTA[vista];
    const l = leer();
    const quedan = d.tope === 0 || historia.length < d.tope;
    // Las que pasan: las que eligió la persona o las mejores. La primera es la élite: pasa sin cambios.
    const padres = !d.marcas ? [] : d.elegir ? elegidos : l.orden.slice(0, pasan);
    figura.dataset.vista = vista;
    mapa.g.classList.toggle('sin-relieve', !d.relieve);

    l.poblacion.forEach((ind, i) => {
      const [w1, w2] = pesosDe(ind);
      const p = mapa.aPantalla(w1, w2);
      const g = puntos[i];
      const puesto = l.orden.indexOf(i) + 1;
      g.style.transform = `translate(${p.x}px, ${p.y}px)`;
      g.classList.toggle('pasa', padres.includes(i));
      g.classList.toggle('elite', d.marcas && padres[0] === i);
      g.classList.toggle('elegida', d.elegir && elegidos.includes(i));
      g.classList.toggle('tenue', d.marcas && !padres.includes(i) && (!d.elegir || elegidos.length > 0));
      if (d.elegir && quedan) { g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button'); g.setAttribute('aria-pressed', elegidos.includes(i) ? 'true' : 'false'); }
      else { g.removeAttribute('tabindex'); g.setAttribute('role', 'img'); g.removeAttribute('aria-pressed'); }
      g.setAttribute('aria-label', rellenar(f.neurona.rotulo, { puesto, error: fmt(l.puntajes[i].error), w1: fmt(w1), w2: fmt(w2) }));
    });
    // Donde estaban los padres de la generación anterior.
    fantasmas.forEach((fantasma, k) => {
      const i = l.padres[k];
      fantasma.style.display = l.anterior && i !== undefined ? '' : 'none';
      if (l.anterior && i !== undefined) {
        const p = mapa.aPantalla(...pesosDe(l.anterior[i]));
        fantasma.setAttribute('cx', p.x);
        fantasma.setAttribute('cy', p.y);
      }
    });
    // La lista: de mejor a peor, con el error de cada una y si pasa.
    filas.forEach((fila, k) => {
      const i = l.orden[k];
      fila.g.dataset.indice = String(i);
      fila.error.textContent = fmt(l.puntajes[i].error);
      fila.rol.textContent = !padres.includes(i) ? '' : padres[0] === i ? f.rol.elite : f.rol.pasa;
      fila.g.classList.toggle('pasa', padres.includes(i));
      fila.g.classList.toggle('elite', d.marcas && padres[0] === i);
      fila.g.classList.toggle('elegida', d.elegir && elegidos.includes(i));
      fila.g.classList.toggle('tenue', d.marcas && !padres.includes(i) && (!d.elegir || elegidos.length > 0));
      fila.g.classList.toggle('se-elige', d.elegir && quedan);
    });

    // La cuenta escrita.
    const mejor = [termino('cuenta-palabra', f.cuenta.mejor), termino('c-culpa', fmt(l.mejor))];
    if (!d.marcas) cuenta.replaceChildren(...mejor);
    else if (d.elegir) cuenta.replaceChildren(termino('cuenta-palabra', rellenar(f.cuenta.generacionDe, { n: l.generacion, total: d.tope })), termino('op', ' '), ...mejor);
    else if (d.perilla === 'pasan') cuenta.replaceChildren(termino('cuenta-palabra', rellenar(f.cuenta.pasan, { n: pasan, total: POBLACION })), termino('op', ' '), ...mejor);
    else cuenta.replaceChildren(...mejor);

    // Los mandos: una perilla (cuántas pasan o la fuerza) y un botón. Lo que no hace nada no se ve.
    const cual = d.perilla;
    perilla.classList.toggle('oculta', !cual);
    campo.disabled = !cual;
    if (cual) {
      const r = RANGOS[cual];
      const v = cual === 'pasan' ? pasan : fuerza;
      campo.min = String(r.desde);
      campo.max = String(r.hasta);
      campo.step = String(r.paso);
      campo.value = String(v);
      perilla.style.setProperty('--pos', `${((v - r.desde) / (r.hasta - r.desde)) * 100}%`);
      rotuloPerilla.textContent = f.controles[cual].nombre;
      ayudaPerilla.textContent = f.controles[cual].ayuda;
      valorPerilla.textContent = cual === 'fuerza' ? `${fmt(v)} %` : fmt(v);
      campo.setAttribute('aria-valuetext', valorPerilla.textContent);
    }
    const conBoton = d.boton === 'tanda' ? tanda < TOPE_TANDAS : d.boton === 'generacion' && quedan;
    const faltaElegir = d.elegir && elegidos.length === 0;
    cajaBoton.classList.toggle('oculta', !conBoton);
    boton.disabled = !conBoton || faltaElegir;
    if (d.boton) {
      boton.textContent = f.controles[d.boton].rotulo;
      ayudaBoton.textContent = f.controles[d.boton].ayuda;
    }
    marcador.textContent = d.elegir && !quedan ? f.sinGeneraciones
      : d.elegir ? rellenar(faltaElegir ? f.elegi : f.elegidas, { n: elegidos.length })
        : d.boton === 'tanda' || vista === 'puntaje' || vista === 'seleccion' ? rellenar(f.tanda, { n: tanda + 1 })
          : rellenar(f.generacion, { n: l.generacion });
    pieAccion.classList.toggle('oculta', !d.boton && !d.perilla && !cambiada);
    aviso.classList.toggle('oculta', !cambiada);

    clearTimeout(avisoPendiente);
    avisoPendiente = setTimeout(() => { vivo.textContent = rellenar(f.resumen, { generacion: l.generacion, error: fmt(l.mejor), pasan: padres.length }); }, 500);
    alCambiar(l);
  }

  /** Lleva la figura a un estado ({ vista, tanda, pasan, fuerza, historia, elegidos }). Los puntos se mueven con el CSS. */
  function poner(destino) {
    vista = destino.vista;
    tanda = destino.tanda;
    pasan = destino.pasan;
    fuerza = destino.fuerza;
    historia = destino.historia.map((g) => ({ ...g, elegidos: g.elegidos ? [...g.elegidos] : null }));
    elegidos = [...destino.elegidos];
    dibujar();
  }

  /** Prende o apaga el aviso de que la figura tiene cambios de la persona en este tramo. */
  function mostrarCambios(si) {
    if (cambiada === Boolean(si)) return;
    cambiada = Boolean(si);
    dibujar();
  }

  dibujar();
  return { elemento: figura, poner, mostrarCambios, leer, estado };
}
