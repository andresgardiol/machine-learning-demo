// La figura viva de "Una neurona" (seccion-teoria D4; viene de teoria-prototipos D3 y D4): un solo
// objeto que se transforma. Junta el escenario (figuras/neurona.js), el plano (figuras/plano.js), la
// cuenta escrita, las perillas y "Restablecer". Toda la cuenta sale de cuenta.js, que usa el núcleo de
// la app: lo que se ve es lo que se calcula.
//
// La figura no decide qué valores muestra: `poner` la lleva al estado que le dan (la película lo toma de
// estado-figura.js, por tramo) y `alTocar` avisa cada cambio de la persona con el estado completo. Así lo
// cambiado en un tramo no pasa a otro (D4). "Restablecer" solo avisa: quien la usa decide a qué estado
// volver. `mostrarCambios` prende el aviso junto a "Restablecer".

import { h, rellenar, formato, crearAyuda, conAyuda, descripcionOculta, movimientoReducido } from '../../dom.js';
import { VISTAS } from './guion.js';
import { TABLA_AND, crearNeurona, fijarPesos, fijarSesgo, leerNeurona, calcular } from './cuenta.js';
import { crearEscenario } from '../../figuras/neurona.js';
import { crearPlano } from '../../figuras/plano.js';

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
 * @param {{c: {idioma: string, figura: object}, alCambiar?: (lectura: object) => void,
 *   alTocar?: (estado: object) => void, alRestablecer?: () => void}} opciones
 *   c: los textos del idioma; alCambiar: recibe la lectura cada vez que la figura se redibuja;
 *   alTocar: recibe el estado completo cada vez que la persona cambia algo; alRestablecer: "Restablecer".
 */
export function crearFigura(contenedor, { c, alCambiar = () => {}, alTocar = () => {}, alRestablecer = () => {} }) {
  const fmt = formato(c.idioma);
  const red = crearNeurona();
  let entradas = [0, 0];
  let vista = 'mirar';
  let cambiada = false;
  let elegido = 3;
  let animacion = 0;
  let finAnimacion = 0;
  let transicion = false; // la figura va de un estado a otro: lo que se ve en el camino no cuenta para el desafío

  // ---- Escenario y plano ---------------------------------------------------------------------------
  const escenario = crearEscenario(c);
  // El punto y los casos del plano no llevan ayuda a la vista (taparía el gráfico; la consigna ya dice
  // qué hacer). Su descripción queda para lectores de pantalla.
  const descripciones = { punto: descripcionOculta(c.figura.punto.descripcion), and: descripcionOculta(c.figura.and.descripcion) };
  const plano = crearPlano(escenario.hueco, {
    c,
    descripciones: { punto: descripciones.punto.id, and: descripciones.and.id },
    alMover(nuevas) { tocar(); entradas = nuevas; dibujar(); avisarToque(); },
    alElegir(i) { elegido = i; entradas = [...TABLA_AND[i].entradas]; dibujar(); },
  });

  // ---- La cuenta escrita ---------------------------------------------------------------------------
  const cuenta = h('p', { class: 'figura-cuenta', 'aria-hidden': 'true' });
  const nota = h('p', { class: 'figura-nota' });
  const vivo = h('p', { class: 'solo-lector', 'aria-live': 'polite', id: `figura-neurona-${Math.random().toString(36).slice(2, 8)}` });
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
      avisarToque();
    });
    perillas[id] = { el, campo, rotulo, valor, textos };
  }
  const cajaPerillas = h('div', { class: 'figura-perillas' }, perillas.w1.el, perillas.w2.el, perillas.b.el);

  // ---- Pie: leyenda y Restablecer ------------------------------------------------------------------
  const boton = h('button', { type: 'button', class: 'boton', text: c.figura.restablecer.rotulo, onclick: () => alRestablecer() });
  const aviso = h('span', { class: 'figura-aviso', text: c.figura.tocada });
  const leyenda = h('ul', { class: 'figura-leyenda', 'aria-hidden': 'true' },
    h('li', null, h('i', { class: 'muestra muestra-pos' }), c.figura.leyenda.pos),
    h('li', null, h('i', { class: 'muestra muestra-neg' }), c.figura.leyenda.neg),
    h('li', { class: 'leyenda-lado' }, h('i', { class: 'muestra muestra-lado' }), c.figura.leyenda.lado));
  const pieAccion = h('div', { class: 'figura-accion' }, aviso, conAyuda(boton, crearAyuda(c.figura.restablecer.ayuda), 'ayuda-derecha'));
  const pie = h('div', { class: 'figura-pie' }, leyenda, pieAccion);

  const figura = h('figure', { class: 'figura' },
    h('div', { class: 'figura-lamina' }, escenario.svg), cuenta, nota, cajaPerillas, pie, vivo, descripciones.punto, descripciones.and);
  // La descripción en texto de lo que muestra, que cambia con el estado.
  escenario.svg.setAttribute('aria-describedby', vivo.id);
  contenedor.append(figura);

  // ---- Estado --------------------------------------------------------------------------------------
  // En ventanas angostas el dibujo cambia de disposición (D5): se vuelve a dibujar al cruzar el corte.
  const angosta = matchMedia('(max-width: 600px)');
  const alCambiarAncho = () => { if (figura.isConnected) dibujar(); else angosta.removeEventListener('change', alCambiarAncho); };
  angosta.addEventListener('change', alCambiarAncho);

  /** La persona toca la figura: la animación en curso se corta donde está. */
  function tocar() {
    cancelAnimationFrame(animacion);
    clearTimeout(finAnimacion);
    animacion = 0;
    transicion = false;
  }

  /** El estado que se ve: vista, entradas, pesos y sesgo. */
  function estado() {
    const { pesos, sesgo } = leerNeurona(red);
    return { vista, entradas: [...entradas], pesos: [...pesos], sesgo };
  }

  function avisarToque() { alTocar(estado()); }

  function leer() {
    const { pesos, sesgo } = leerNeurona(red);
    const cta = calcular(red, entradas);
    const and = TABLA_AND.map(({ entradas: e, salida: esperada }) => {
      const salida = calcular(red, [...e]).salida;
      return { entradas: [...e], esperada, salida, bien: salida === esperada };
    });
    const n = nivel(vista);
    return {
      ...cta, pesos, sesgo, vista, cambiada, elegido, and,
      bien: and.filter((p) => p.bien).length,
      // Lo que lee el desafío del cierre: cuántos casos del AND da bien.
      desafio: vista === 'and' && !transicion ? { bien: and.filter((p) => p.bien).length, total: TABLA_AND.length } : null,
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
    figura.classList.toggle('figura-compacta', angosta.matches);
    escenario.ajustar({ compacta: angosta.matches, plano: figura.dataset.plano === 'si' });
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
    pieAccion.classList.toggle('oculta', visibles.length === 0 && !cambiada);
    aviso.classList.toggle('oculta', !cambiada);

    clearTimeout(avisoPendiente);
    avisoPendiente = setTimeout(() => {
      vivo.textContent = rellenar(c.figura.resumen, { suma: fmt(l.suma), salida: l.salida, palabra });
    }, 500);
    alCambiar(l);
  }

  function fijarValores({ entradas: e, pesos, sesgo }) {
    entradas = [...e];
    fijarPesos(red, pesos);
    fijarSesgo(red, sesgo);
  }

  function llevar(destino, animar) {
    cancelAnimationFrame(animacion);
    clearTimeout(finAnimacion);
    const origen = { entradas: [...entradas], ...leerNeurona(red) };
    if (!animar || movimientoReducido()) { transicion = false; fijarValores(destino); dibujar(); return; }
    transicion = true;
    const inicio = performance.now();
    const mezcla = (a, b, t) => a + (b - a) * t;
    const cuadro = (ahora) => {
      const lineal = Math.min(1, (ahora - inicio) / DURACION);
      const t = lineal < 0.5 ? 2 * lineal * lineal : 1 - ((-2 * lineal + 2) ** 2) / 2;
      if (lineal >= 1) { transicion = false; fijarValores(destino); clearTimeout(finAnimacion); }
      else fijarValores({
        entradas: origen.entradas.map((v, i) => mezcla(v, destino.entradas[i], t)),
        pesos: origen.pesos.map((v, i) => mezcla(v, destino.pesos[i], t)),
        sesgo: mezcla(origen.sesgo, destino.sesgo, t),
      });
      dibujar();
      if (lineal < 1) animacion = requestAnimationFrame(cuadro);
    };
    animacion = requestAnimationFrame(cuadro);
    // Si el navegador no da cuadros (pestaña en segundo plano), la figura llega igual a su estado.
    finAnimacion = setTimeout(() => { cancelAnimationFrame(animacion); transicion = false; fijarValores(destino); dibujar(); }, DURACION + 120);
  }

  /**
   * Lleva la figura a un estado ({ vista, entradas, pesos, sesgo }), con transición salvo que `animar`
   * sea falso o la persona prefiera menos movimiento. En el desafío las entradas son siempre uno de los
   * cuatro casos del AND: el que la persona eligió.
   */
  function poner(destino, { animar = true } = {}) {
    vista = destino.vista;
    const e = vista === 'and' ? [...TABLA_AND[elegido].entradas] : [...destino.entradas];
    llevar({ entradas: e, pesos: [...destino.pesos], sesgo: destino.sesgo }, animar);
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
