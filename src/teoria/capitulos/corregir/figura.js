// La figura viva de "Corregir un poco cada vez" (seccion-teoria D12, capítulo 5): la curva del error contra
// un peso, con una bolita que da pasos, y después el mapa del error contra los dos pesos. Es una sola
// figura: la curva deja paso al mapa, y en el mapa una raya marca dónde estaba la curva. La curva y el
// mapa los dibuja figuras/paisaje.js; toda la cuenta sale de cuenta.js (backward y corrections de la app).
//
// La bolita no rueda: da pasos. Cada paso se dibuja como un trazo a rayas con un punto hueco donde
// estuvo. La pendiente es la recta naranja que toca la curva, con una punta hacia donde el error baja.
//
// Igual que las otras figuras, no decide qué valores muestra: `poner` la lleva al estado que le dan y
// `alTocar` avisa cada cambio de la persona con el estado completo (D4).

import { h, s, rellenar, formato, crearAyuda, conAyuda, movimientoReducido } from '../../dom.js';
import { ESCENAS, pendiente, unPaso, mapaDelError } from './cuenta.js';
import { curvaDelError } from '../error/cuenta.js';
import { DE_LA_VISTA, RANGO_CURVA, RANGO_TASA, errorEn, avanceDelDesafio } from './guion.js';
import { crearCurva, crearMapa } from '../../figuras/paisaje.js';

const ANCHO = 580;
const ALTO = 330;
const LAPSO = 700; // entre un paso y el siguiente, cuando se ven solos
const DURACION = 320; // lo que tarda la bolita en llegar a su lugar
const W2 = ESCENAS.curva.inicio.pesos[1];
const SESGO = ESCENAS.curva.inicio.sesgo;
const TOPE_CURVA = 3;

const decima = (v) => Math.round(v * 10) / 10;

/**
 * @param {HTMLElement} contenedor
 * @param {{c: {idioma: string, figura: object}, alCambiar?: (lectura: object) => void,
 *   alTocar?: (estado: object) => void, alRestablecer?: () => void}} opciones
 */
export function crearFigura(contenedor, { c, alCambiar = () => {}, alTocar = () => {}, alRestablecer = () => {} }) {
  const fmt = formato(c.idioma);
  const f = c.figura;
  let vista = 'ciegas';
  let camino = [[...ESCENAS.curva.inicio.pesos]];
  let tasa = ESCENAS.curva.tasas.chica;
  let visto = [camino[0][0], camino[0][0]];
  let vistos = 0; // cuántos pasos del camino se ven (mientras se ven solos va de 0 al total)
  let lugar = [...camino[0]]; // dónde se dibuja la bolita (en el camino de un paso al otro)
  let cambiada = false;
  let transicion = false;
  let reloj = 0;
  let animacion = 0;
  let avisoPendiente = 0;

  // ---- La curva y el mapa ------------------------------------------------------------------------------
  const puntosCurva = curvaDelError({ pesos: [0, W2], sesgo: SESGO }, { indice: 0, ...RANGO_CURVA, paso: 0.2 }).map((p) => ({ x: p.peso, y: p.error }));
  const curva = crearCurva({ caja: { x: 60, y: 18, ancho: 496, alto: 252 }, clase: 'paisaje-vista' });
  const mapa = crearMapa({ caja: { x: 56, y: 12, lado: 270 }, clase: 'paisaje-vista' });
  const historia = crearCurva({ caja: { x: 400, y: 56, ancho: 160, alto: 150 }, clase: 'paisaje-vista corregir-historia' });
  const lectura = s('text', { class: 'error-resumen', x: 480, y: 270, 'text-anchor': 'middle' });
  const lectura2 = s('text', { class: 'rotulo', x: 480, y: 292, 'text-anchor': 'middle' });
  const gMapa = s('g', { class: 'paisaje-vista' }, mapa.g, historia.g, lectura, lectura2);
  let mapaListo = false;

  const vivo = h('p', { class: 'solo-lector', 'aria-live': 'polite', id: `figura-corregir-${Math.random().toString(36).slice(2, 8)}` });
  const svg = s('svg', { class: 'escenario', viewBox: `0 0 ${ANCHO} ${ALTO}`, role: 'group', 'aria-label': f.titulo, 'aria-describedby': vivo.id }, curva.g, gMapa);

  // ---- La cuenta escrita y los mandos -----------------------------------------------------------------
  const cuenta = h('p', { class: 'figura-cuenta', 'aria-hidden': 'true' });
  function crearPerilla(clase, textos, { min, max, step }, alMover) {
    const id = `perilla-corregir-${Math.random().toString(36).slice(2, 8)}`;
    const campo = h('input', { type: 'range', id, min, max, step, class: 'perilla-campo' });
    const valor = h('output', { class: 'perilla-valor', for: id });
    const el = h('div', { class: `perilla ${clase}`.trim() },
      h('label', { for: id, class: 'perilla-cabeza' }, h('span', { class: 'perilla-rotulo', text: textos.nombre }), valor),
      conAyuda(campo, crearAyuda(textos.ayuda), 'perilla-riel'));
    campo.addEventListener('input', () => alMover(Number(campo.value)));
    return { el, campo, valor };
  }
  const perillaPeso = crearPerilla('perilla-libre', f.controles.peso, { min: RANGO_CURVA.desde, max: RANGO_CURVA.hasta, step: 0.1 }, (v) => {
    parar();
    const w1 = decima(v);
    camino = [[w1, W2]];
    visto = [Math.min(visto[0], w1), Math.max(visto[1], w1)];
    vistos = 0;
    lugar = [...camino[0]];
    dibujar();
    alTocar(estado());
  });
  const perillaTasa = crearPerilla('perilla-tasa', f.controles.tasa, { min: RANGO_TASA.desde, max: RANGO_TASA.hasta, step: 1 }, (v) => {
    parar();
    tasa = Math.round(v);
    dibujar();
    alTocar(estado());
  });
  const cajaPeso = h('div', { class: 'figura-perillas figura-perillas-una' }, perillaPeso.el);
  const ayudaBoton = crearAyuda('');
  const boton = h('button', { type: 'button', class: 'boton boton-figura', onclick: () => apretar() });
  const cajaPaso = h('div', { class: 'figura-mandos-mixtos' }, perillaTasa.el, conAyuda(boton, ayudaBoton, 'ayuda-derecha'));
  const mandos = h('div', { class: 'figura-mandos' }, cajaPeso, cajaPaso);

  const marcador = h('p', { class: 'figura-marcador' });
  const restablecer = h('button', { type: 'button', class: 'boton', text: f.restablecer.rotulo, onclick: () => alRestablecer() });
  const aviso = h('span', { class: 'figura-aviso', text: f.tocada });
  const pieAccion = h('div', { class: 'figura-accion' }, aviso, conAyuda(restablecer, crearAyuda(f.restablecer.ayuda), 'ayuda-derecha'));
  const pie = h('div', { class: 'figura-pie' }, marcador, pieAccion);

  const figura = h('figure', { class: 'figura figura-red figura-corregir' }, h('div', { class: 'figura-lamina' }, svg), cuenta, mandos, pie, vivo);
  contenedor.append(figura);

  // ---- Estado ----------------------------------------------------------------------------------------
  function parar() {
    clearTimeout(reloj);
    cancelAnimationFrame(animacion);
    reloj = 0;
    animacion = 0;
    transicion = false;
    vistos = camino.length - 1;
    lugar = [...camino.at(-1)];
  }

  const estado = () => ({ vista, camino: camino.map((p) => [...p]), tasa, visto: [...visto] });

  function leer() {
    const aca = camino[vistos];
    return {
      vista, tasa, pasos: vistos, lugar: [...aca], error: errorEn(aca), cambiada,
      desafio: vista === 'desafio' && !transicion ? avanceDelDesafio(estado()) : null,
    };
  }

  const termino = (clase, texto) => h('span', { class: clase, text: texto });
  const conSigno = (v) => (v < 0 ? `(${fmt(v)})` : fmt(v));

  function dibujar() {
    const d = DE_LA_VISTA[vista];
    const l = leer();
    const enMapa = d.plano === 'mapa';
    const aca = camino[vistos];
    const paradas = camino.slice(0, vistos + 1);
    const enCamino = transicion || lugar.some((v, i) => v !== aca[i]);
    const p = pendiente({ pesos: aca, sesgo: SESGO });
    figura.dataset.vista = vista;
    figura.dataset.plano = d.plano;

    curva.g.classList.toggle('fuera', enMapa);
    gMapa.classList.toggle('fuera', !enMapa);
    if (!enMapa) {
      curva.dibujar({
        puntos: puntosCurva, xRango: [RANGO_CURVA.desde, RANGO_CURVA.hasta], yRango: [0, TOPE_CURVA],
        visible: d.velada ? visto : null,
        marca: { x: lugar[0], y: errorEn(lugar) },
        pendiente: d.pendiente && !enCamino ? p.pesos[0] : null,
        camino: [...paradas.slice(0, -1), lugar].map((q) => ({ x: q[0], y: errorEn(q) })),
        rotulos: { x: f.ejes.peso, y: f.ejes.error }, fmt,
      });
    } else {
      if (!mapaListo) {
        mapa.fijar(mapaDelError({ n: 49 }), { rotulos: { x: f.ejes.peso, y: f.ejes.pesoDerecho, fondo: f.fondo }, fmt });
        mapaListo = true;
      }
      mapa.dibujar({ marca: lugar, camino: [...paradas.slice(0, -1), lugar], corte: vista === 'mapa' ? W2 : null });
      const errores = paradas.map((q, k) => ({ x: k, y: errorEn(q) }));
      historia.dibujar({
        puntos: errores, xRango: [0, d.tope], yRango: [0.4, 1], marca: errores.at(-1),
        meta: vista === 'desafio' ? { y: ESCENAS.desafio.meta, texto: rellenar(f.meta, { meta: fmt(ESCENAS.desafio.meta) }) } : null,
        rotulos: { x: f.ejes.pasos, y: f.ejes.error }, fmt,
      });
      lectura.textContent = rellenar(f.errorAhora, { error: fmt(l.error) });
      lectura2.textContent = rellenar(f.pasosDados, { n: vistos, total: d.tope });
    }

    // La cuenta escrita: dónde está, o cuánto se mueve en el próximo paso.
    if (d.velada) {
      cuenta.replaceChildren(termino('cuenta-palabra', f.cuenta.peso), termino('cuenta-suma', fmt(aca[0])),
        termino('op cuenta-flecha', '→'), termino('cuenta-palabra', f.cuenta.error), termino('c-culpa', fmt(l.error)));
    } else if (d.peso) {
      const k = p.pesos[0];
      cuenta.replaceChildren(termino('cuenta-palabra', f.cuenta.pendiente), termino('c-culpa', fmt(k)),
        termino('op cuenta-flecha', '→'), termino('cuenta-palabra', Math.abs(k) < 0.005 ? f.cuenta.plano : k < 0 ? f.cuenta.bajaDerecha : f.cuenta.bajaIzquierda));
    } else if (!enMapa) {
      const k = p.pesos[0];
      cuenta.replaceChildren(termino('cuenta-suma', fmt(aca[0])), termino('op', '−'), termino('c-vos', fmt(tasa)), termino('op', '×'),
        termino('c-culpa', conSigno(k)), termino('op', '='), termino('cuenta-suma', fmt(aca[0] - tasa * k)),
        termino('cuenta-palabra cuenta-nota', f.cuenta.formula));
    } else {
      cuenta.replaceChildren(termino('cuenta-palabra', f.cuenta.pendientes), termino('c-culpa', fmt(p.pesos[0])), termino('cuenta-palabra', f.cuenta.y),
        termino('c-culpa', fmt(p.pesos[1])), termino('op', '×'), termino('cuenta-palabra', f.cuenta.tasa), termino('c-vos', fmt(tasa)));
    }

    // Los mandos: el peso, o la tasa y el paso. Lo que no hace nada en esta vista no se ve.
    cajaPeso.classList.toggle('oculta', !d.peso);
    perillaPeso.campo.disabled = !d.peso;
    perillaPeso.campo.value = String(aca[0]);
    perillaPeso.el.style.setProperty('--pos', `${((aca[0] - RANGO_CURVA.desde) / (RANGO_CURVA.hasta - RANGO_CURVA.desde)) * 100}%`);
    perillaPeso.valor.textContent = fmt(aca[0]);
    perillaPeso.campo.setAttribute('aria-valuetext', fmt(aca[0]));
    const quedanPasos = d.paso && camino.length - 1 < d.tope;
    const conOtraVez = d.sola && !movimientoReducido();
    cajaPaso.classList.toggle('oculta', !d.tasa && !d.paso && !d.sola);
    perillaTasa.el.classList.toggle('oculta', !d.tasa);
    perillaTasa.campo.disabled = !d.tasa;
    perillaTasa.campo.value = String(Math.min(RANGO_TASA.hasta, tasa));
    perillaTasa.el.style.setProperty('--pos', `${((Math.min(RANGO_TASA.hasta, tasa) - RANGO_TASA.desde) / (RANGO_TASA.hasta - RANGO_TASA.desde)) * 100}%`);
    perillaTasa.valor.textContent = fmt(tasa);
    perillaTasa.campo.setAttribute('aria-valuetext', fmt(tasa));
    boton.parentElement.classList.toggle('oculta', !quedanPasos && !conOtraVez);
    boton.disabled = !quedanPasos && !conOtraVez;
    boton.textContent = d.sola ? f.controles.otraVez.rotulo : f.controles.paso.rotulo;
    ayudaBoton.textContent = d.sola ? f.controles.otraVez.ayuda : f.controles.paso.ayuda;

    const sinPasos = d.paso && !quedanPasos;
    marcador.textContent = sinPasos ? f.sinPasos
      : enMapa ? rellenar(f.marcadorMapa, { error: fmt(l.error) })
        : d.velada || d.peso ? rellenar(f.marcadorError, { error: fmt(l.error) })
          : rellenar(f.marcadorPasos, { tasa: fmt(tasa), n: vistos, error: fmt(l.error) });
    pieAccion.classList.toggle('oculta', !d.peso && !d.tasa && !d.paso && !cambiada);
    aviso.classList.toggle('oculta', !cambiada);

    clearTimeout(avisoPendiente);
    avisoPendiente = setTimeout(() => {
      vivo.textContent = rellenar(f.resumen, { w1: fmt(aca[0]), w2: fmt(aca[1]), error: fmt(l.error), n: vistos });
    }, 500);
    alCambiar(l);
  }

  /** Lleva la bolita de donde está a la parada `k` del camino; al llegar, avisa. */
  function avanzar(k, alLlegar = () => {}) {
    const desde = [...lugar];
    const hasta = camino[k];
    vistos = k;
    if (movimientoReducido()) { lugar = [...hasta]; dibujar(); alLlegar(); return; }
    const inicio = performance.now();
    const cuadro = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / DURACION);
      const suave = 1 - (1 - t) ** 2;
      lugar = desde.map((v, i) => v + (hasta[i] - v) * suave);
      if (t >= 1) { lugar = [...hasta]; animacion = 0; dibujar(); alLlegar(); return; }
      dibujar();
      animacion = requestAnimationFrame(cuadro);
    };
    cancelAnimationFrame(animacion);
    animacion = requestAnimationFrame(cuadro);
    // Si el navegador no da cuadros (pestaña en segundo plano), la bolita llega igual.
    clearTimeout(reloj);
    reloj = setTimeout(() => { if (animacion) { cancelAnimationFrame(animacion); animacion = 0; lugar = [...hasta]; dibujar(); alLlegar(); } }, DURACION + 150);
  }

  /** Los pasos del estado se ven de a uno: lo que se ve en el camino no cuenta como cambio. */
  function reproducir() {
    clearTimeout(reloj);
    cancelAnimationFrame(animacion);
    vistos = 0;
    lugar = [...camino[0]];
    transicion = true;
    dibujar();
    const sigue = () => {
      if (vistos >= camino.length - 1) { transicion = false; dibujar(); return; }
      avanzar(vistos + 1, () => { reloj = setTimeout(sigue, LAPSO - DURACION); });
    };
    reloj = setTimeout(sigue, LAPSO);
  }

  function apretar() {
    const d = DE_LA_VISTA[vista];
    if (d.sola) { reproducir(); return; }
    if (!d.paso || camino.length - 1 >= d.tope) return;
    parar();
    const paso = unPaso({ pesos: camino.at(-1), sesgo: SESGO }, tasa, { mover: d.mover });
    camino.push([...paso.despues.pesos]);
    alTocar(estado());
    avanzar(camino.length - 1);
  }

  /** Lleva la figura a un estado ({ vista, camino, tasa, visto }); en la vista "sola" los pasos se ven de a uno. */
  function poner(destino, { animar = true } = {}) {
    clearTimeout(reloj);
    cancelAnimationFrame(animacion);
    reloj = 0;
    animacion = 0;
    transicion = false;
    vista = destino.vista;
    camino = destino.camino.map((p) => [...p]);
    tasa = destino.tasa;
    visto = [...destino.visto];
    if (DE_LA_VISTA[vista].sola && animar && !movimientoReducido()) { reproducir(); return; }
    vistos = camino.length - 1;
    lugar = [...camino.at(-1)];
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
