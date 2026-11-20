// La figura viva de "Una neurona" (teoria-prototipos D3 y D4): un solo objeto que se transforma. Junta
// el escenario (neurona.js), el plano (plano.js), la cuenta escrita, las perillas y "Restablecer". Toda
// la cuenta sale de cuenta.js, que usa el núcleo de la app: lo que se ve es lo que se calcula.
//
// La figura tiene una `vista` (qué deja ver y tocar, ver contenido/guion.js) y unos valores. `irA` cambia
// siempre la vista, pero solo cambia los valores si la persona no tocó nada: lo que cambió a mano no se
// pisa (tareas 6.3 y 7.2). "Restablecer" la lleva a los valores del tramo en que está.

import { h, rellenar, formato, crearAyuda, conAyuda, descripcionOculta, movimientoReducido } from '../comun/dom.js';
import { VISTAS } from '../contenido/guion.js';
import { TABLA_AND, crearNeurona, fijarPesos, fijarSesgo, leerNeurona, calcular } from './cuenta.js';
import { crearEscenario } from './neurona.js';
import { crearPlano } from './plano.js';

const MIN = -2;
const MAX = 2;
const PASO = 0.1;
const DURACION = 450;
const decima = (v) => Math.round(v * 10) / 10;
const signo = (v) => (v > 0 ? 'pos' : v < 0 ? 'neg' : 'cero');
const nivel = (vista) => VISTAS.indexOf(vista);

/** Qué perillas muestra cada vista. */
const PERILLAS = { mirar: [], pesos: ['w1', 'w2'], sesgo: ['w1', 'w2', 'b'], prediccion: [], probar: ['w1', 'w2', 'b'], plano: ['w1', 'w2', 'b'], and: ['w1', 'w2', 'b'] };

/**
 * @param {HTMLElement} contenedor
 * @param {{c: object, compacta?: boolean, alCambiar?: (lectura: object) => void}} opciones
 *   c: los textos del idioma; compacta: lo oculto no ocupa lugar (para el libro, donde hay una figura
 *   por tramo); alCambiar: recibe la lectura cada vez que la figura se redibuja.
 */
export function crearFigura(contenedor, { c, compacta = false, alCambiar = () => {} }) {
  const fmt = formato(c.idioma);
  const red = crearNeurona();
  let entradas = [0, 0];
  let vista = 'mirar';
  let base = { vista, entradas: [0, 0], pesos: [0, 0], sesgo: 0 };
  let tocada = false;
  let elegido = 3;
  let animacion = 0;
  let finAnimacion = 0;

  // ---- Escenario y plano ---------------------------------------------------------------------------
  const escenario = crearEscenario(c);
  // El punto y los casos del plano no llevan ayuda a la vista (taparía el gráfico; la consigna ya dice
  // qué hacer). Su descripción queda para lectores de pantalla.
  const descripciones = { punto: descripcionOculta(c.figura.punto.descripcion), and: descripcionOculta(c.figura.and.descripcion) };
  const plano = crearPlano(escenario.hueco, {
    c,
    descripciones: { punto: descripciones.punto.id, and: descripciones.and.id },
    alMover(nuevas) { tocar(); entradas = nuevas; dibujar(); },
    alElegir(i) { elegido = i; entradas = [...TABLA_AND[i].entradas]; dibujar(); },
  });

  // ---- La cuenta escrita ---------------------------------------------------------------------------
  const cuenta = h('p', { class: 'figura-cuenta', 'aria-hidden': 'true' });
  const nota = h('p', { class: 'figura-nota' });
  const vivo = h('p', { class: 'solo-lector', 'aria-live': 'polite' });
  let avisoPendiente = 0;

  // ---- Perillas ------------------------------------------------------------------------------------
  const perillas = {};
  for (const id of ['w1', 'w2', 'b']) {
    const textos = c.figura.controles[id];
    const idCampo = `perilla-${id}-${Math.random().toString(36).slice(2, 8)}`;
    const campo = h('input', { type: 'range', id: idCampo, min: MIN, max: MAX, step: PASO, class: 'perilla-campo' });
    const rotulo = h('span', { class: 'perilla-rotulo' });
    const valor = h('output', { class: 'perilla-valor', for: idCampo });
    const caja = conAyuda(campo, crearAyuda(textos.ayuda), 'perilla-riel');
    const el = h('div', { class: 'perilla' }, h('label', { for: idCampo, class: 'perilla-cabeza' }, rotulo, valor), caja);
    campo.addEventListener('input', () => {
      tocar();
      const v = decima(Number(campo.value));
      const { pesos, sesgo } = leerNeurona(red);
      if (id === 'w1') fijarPesos(red, [v, pesos[1]]);
      else if (id === 'w2') fijarPesos(red, [pesos[0], v]);
      else fijarSesgo(red, v);
      dibujar();
    });
    perillas[id] = { el, campo, rotulo, valor, textos };
  }
  const cajaPerillas = h('div', { class: 'figura-perillas' }, perillas.w1.el, perillas.w2.el, perillas.b.el);

  // ---- Pie: leyenda y Restablecer ------------------------------------------------------------------
  const boton = h('button', { type: 'button', class: 'boton', text: c.figura.restablecer.rotulo, onclick: () => restablecer() });
  const aviso = h('span', { class: 'figura-aviso', text: c.figura.tocada });
  const leyenda = h('ul', { class: 'figura-leyenda', 'aria-hidden': 'true' },
    h('li', null, h('i', { class: 'muestra muestra-pos' }), c.figura.leyenda.pos),
    h('li', null, h('i', { class: 'muestra muestra-neg' }), c.figura.leyenda.neg),
    h('li', { class: 'leyenda-lado' }, h('i', { class: 'muestra muestra-lado' }), c.figura.leyenda.lado));
  const pieAccion = h('div', { class: 'figura-accion' }, aviso, conAyuda(boton, crearAyuda(c.figura.restablecer.ayuda), 'ayuda-derecha'));
  const pie = h('div', { class: 'figura-pie' }, leyenda, pieAccion);

  const figura = h('figure', { class: `figura${compacta ? ' figura-compacta' : ''}` },
    h('div', { class: 'figura-lamina' }, escenario.svg), cuenta, nota, cajaPerillas, pie, vivo, descripciones.punto, descripciones.and);
  contenedor.append(figura);

  // ---- Estado --------------------------------------------------------------------------------------
  function tocar() {
    cancelAnimationFrame(animacion);
    clearTimeout(finAnimacion);
    animacion = 0;
    tocada = true;
  }

  function leer() {
    const { pesos, sesgo } = leerNeurona(red);
    const cta = calcular(red, entradas);
    const and = TABLA_AND.map(({ entradas: e, salida: esperada }) => {
      const salida = calcular(red, [...e]).salida;
      return { entradas: [...e], esperada, salida, bien: salida === esperada };
    });
    const n = nivel(vista);
    return {
      ...cta, pesos, sesgo, vista, tocada, elegido, and,
      bien: and.filter((p) => p.bien).length,
      // El sesgo se dibuja desde el tramo que lo presenta, y siempre que no sea cero: nada que entre en
      // la cuenta queda escondido (artículo 7).
      conSesgo: n >= nivel('sesgo') || sesgo !== 0,
      conEscalon: n >= nivel('sesgo'),
      sesgoNombrado: n > nivel('sesgo'),
    };
  }

  function termino(clase, texto) {
    return h('span', { class: clase, text: texto });
  }

  function dibujar() {
    const l = leer();
    figura.dataset.vista = vista;
    figura.dataset.plano = vista === 'plano' || vista === 'and' ? 'si' : 'no';
    escenario.actualizar(l, fmt);
    const textoNota = plano.actualizar(l, fmt);
    nota.textContent = textoNota;
    nota.classList.toggle('visible', Boolean(textoNota));

    // La cuenta, con los mismos colores que el dibujo.
    const partes = [];
    l.entradas.forEach((x, i) => {
      if (i > 0) partes.push(termino('op', '+'));
      partes.push(termino('c-entra', fmt(x)), termino('op', '×'), termino(`c-${signo(l.pesos[i])} peso-${signo(l.pesos[i])}`, fmt(l.pesos[i])));
    });
    if (l.conSesgo) partes.push(termino('op', '+'), termino(`c-${signo(l.sesgo)} peso-${signo(l.sesgo)}`, l.sesgo < 0 ? `(${fmt(l.sesgo)})` : fmt(l.sesgo)));
    const palabra = vista === 'and'
      ? (l.salida === 1 ? c.figura.encendida : c.figura.apagada)
      : (l.salida === 1 ? c.figura.dobla : c.figura.sigue);
    partes.push(termino('op', '='), termino('cuenta-suma', fmt(l.suma)), termino('op cuenta-flecha', '→'),
      termino(`cuenta-salida${l.salida === 1 ? ' encendida' : ''}`, `${l.salida}`), termino('cuenta-palabra', palabra));
    cuenta.replaceChildren(...partes);

    // Perillas: solo las de esta vista; las demás no se ven ni se enfocan.
    const visibles = PERILLAS[vista];
    const n = nivel(vista);
    for (const [id, p] of Object.entries(perillas)) {
      const v = id === 'w1' ? l.pesos[0] : id === 'w2' ? l.pesos[1] : l.sesgo;
      const ver = visibles.includes(id);
      p.el.classList.toggle('oculta', !ver);
      p.campo.disabled = !ver;
      p.campo.value = String(v);
      p.el.dataset.signo = signo(v);
      p.el.style.setProperty('--pos', `${((v - MIN) / (MAX - MIN)) * 100}%`);
      p.valor.textContent = fmt(v);
      // Primero el caso, después el nombre: la perilla se llama "peso" o "sesgo" recién en el tramo
      // siguiente al que la presenta.
      const nombrada = id === 'b' ? n > nivel('sesgo') : n > nivel('pesos');
      p.rotulo.textContent = nombrada ? p.textos.nombre : p.textos.antes;
      p.campo.setAttribute('aria-valuetext', fmt(v));
    }
    cajaPerillas.classList.toggle('oculta', visibles.length === 0);
    leyenda.classList.toggle('oculta', n < nivel('pesos'));
    pieAccion.classList.toggle('oculta', visibles.length === 0 && !tocada);
    aviso.classList.toggle('oculta', !tocada);

    clearTimeout(avisoPendiente);
    avisoPendiente = setTimeout(() => {
      vivo.textContent = rellenar(c.figura.resumen, { suma: fmt(l.suma), salida: l.salida, palabra });
    }, 500);
    alCambiar(l);
  }

  function poner({ entradas: e, pesos, sesgo }) {
    entradas = [...e];
    fijarPesos(red, pesos);
    fijarSesgo(red, sesgo);
  }

  function llevar(destino, animar) {
    cancelAnimationFrame(animacion);
    clearTimeout(finAnimacion);
    const origen = { entradas: [...entradas], ...leerNeurona(red) };
    if (!animar || movimientoReducido()) { poner(destino); dibujar(); return; }
    const inicio = performance.now();
    const mezcla = (a, b, t) => a + (b - a) * t;
    const cuadro = (ahora) => {
      const lineal = Math.min(1, (ahora - inicio) / DURACION);
      const t = lineal < 0.5 ? 2 * lineal * lineal : 1 - ((-2 * lineal + 2) ** 2) / 2;
      if (lineal >= 1) { poner(destino); clearTimeout(finAnimacion); }
      else poner({
        entradas: origen.entradas.map((v, i) => mezcla(v, destino.entradas[i], t)),
        pesos: origen.pesos.map((v, i) => mezcla(v, destino.pesos[i], t)),
        sesgo: mezcla(origen.sesgo, destino.sesgo, t),
      });
      dibujar();
      if (lineal < 1) animacion = requestAnimationFrame(cuadro);
    };
    animacion = requestAnimationFrame(cuadro);
    // Si el navegador no da cuadros (pestaña en segundo plano), la figura llega igual a su estado.
    finAnimacion = setTimeout(() => { cancelAnimationFrame(animacion); poner(destino); dibujar(); }, DURACION + 120);
  }

  /**
   * Lleva la figura al estado de un tramo. La vista cambia siempre; los valores, solo si la persona no
   * tocó la figura (o con `forzar`).
   */
  function irA(estado, { forzar = false, animar = true } = {}) {
    base = { vista: estado.vista, entradas: [...estado.entradas], pesos: [...estado.pesos], sesgo: estado.sesgo };
    vista = estado.vista;
    if (forzar) tocada = false;
    if (vista === 'and') {
      // En el desafío las entradas son siempre uno de los cuatro casos.
      const destino = tocada ? leerNeurona(red) : base;
      llevar({ entradas: [...TABLA_AND[elegido].entradas], pesos: destino.pesos, sesgo: destino.sesgo }, animar);
    } else if (!tocada) {
      llevar(base, animar);
    } else {
      dibujar();
    }
  }

  function restablecer() {
    irA(base, { forzar: true });
  }

  dibujar();
  return { elemento: figura, irA, restablecer, leer, fueTocada: () => tocada };
}
