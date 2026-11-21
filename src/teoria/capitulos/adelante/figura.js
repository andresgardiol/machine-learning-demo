// La figura viva de "La cuenta hacia adelante" (seccion-teoria D12, capítulo 3): la red del XOR del
// capítulo 2, que se recorre de a una neurona, y al final la red del auto, más ancha, solo para mirar. Es
// una sola figura: las dos redes ocupan el mismo lugar y una deja paso a la otra. Toda la cuenta sale de
// cuenta.js (computeDetailed, la de la app).
//
// Una neurona pasa por tres estados, con forma además de color: sin calcular (contorno a rayas, vacía),
// le toca (anillo amarillo) y calculada (con su suma adentro; rellena de blanco si se enciende). Los
// pesos que llegan a una neurona sin calcular van tenues: la cuenta todavía no pasó por ahí.
//
// Igual que las otras figuras, no decide qué valores muestra: `poner` la lleva al estado que le dan y
// `alTocar` avisa cada cambio de la persona con el estado completo (D4).

import { h, s, rellenar, formato, crearAyuda, conAyuda, descripcionOculta, movimientoReducido } from '../../dom.js';
import { recorrido, redXor, redDelAuto, LECTURAS_AUTO } from './cuenta.js';
import { DE_LA_VISTA, NEURONAS, avanceDelDesafio } from './guion.js';
import { crearRedEnCapas } from '../../figuras/red-capas.js';

const ANCHO = 580;
const ALTO = 330;
const LAPSO = { xor: 650, auto: 200 };
const TECLA = { x: 482, y: 133, lado: 36 };

// Las entradas van de a cuartos: son números exactos para la máquina, así una suma que da justo 0 no
// queda de un lado u otro por redondeo.
const PASO = 0.25;
const cuarto = (v) => Math.round(v / PASO) * PASO;
const signo = (v) => (v > 0 ? 'pos' : v < 0 ? 'neg' : 'cero');

/**
 * @param {HTMLElement} contenedor
 * @param {{c: {idioma: string, figura: object}, alCambiar?: (lectura: object) => void,
 *   alTocar?: (estado: object) => void, alRestablecer?: () => void}} opciones
 */
export function crearFigura(contenedor, { c, alCambiar = () => {}, alTocar = () => {}, alRestablecer = () => {} }) {
  const fmt = formato(c.idioma);
  const f = c.figura;
  const redX = redXor();
  const pasosAuto = recorrido(redDelAuto(), LECTURAS_AUTO);
  let vista = 'pasa';
  let entradas = [0, 0];
  let pasos = 3; // lo que dice el estado
  let vistos = 3; // lo que se ve: mientras la cuenta se hace sola va de 0 a `pasos`
  let foco = 2; // la neurona cuya cuenta se escribe
  let cambiada = false;
  let transicion = false;
  let reloj = 0;
  let avisoPendiente = 0;

  // ---- La red del XOR ---------------------------------------------------------------------------------
  const xor = crearRedEnCapas({ sizes: [2, 2, 1], caja: { x: 96, y: 30, ancho: 316, alto: 232 }, etiquetas: true, sesgos: true, clase: 'adelante-xor' });
  const descripcionNeurona = descripcionOculta(f.neurona.descripcion);
  const neuronas = [xor.nodos[1][0], xor.nodos[1][1], xor.nodos[2][0]];
  neuronas.forEach((nodo, k) => {
    nodo.g.prepend(s('circle', { class: 'plano-punto-zona', r: 30 }));
    // La letra va donde no pasa ningún peso: arriba a la derecha, salvo en B, que la lleva abajo.
    nodo.g.append(s('text', { class: 'red-letra', x: nodo.radio - 2, y: k === 1 ? nodo.radio + 9 : -nodo.radio + 1, text: NEURONAS[k] }));
    nodo.g.setAttribute('tabindex', '0');
    nodo.g.setAttribute('role', 'button');
    nodo.g.setAttribute('aria-describedby', descripcionNeurona.id);
    nodo.g.classList.add('adelante-neurona');
    const elegir = () => { if (k < vistos) { foco = k; dibujar(); } };
    nodo.g.addEventListener('click', elegir);
    nodo.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(); } });
  });
  const rotulosEntrada = xor.nodos[0].map((n, i) => s('text', { class: 'rotulo', x: n.x, y: i === 0 ? n.y - 27 : n.y + 38, 'text-anchor': 'middle', text: i === 0 ? f.izquierda : f.derecha }));
  const C = xor.nodos[2][0];
  const cable = s('line', { class: 'salida-linea', x1: C.x + C.radio + 3, y1: C.y, x2: TECLA.x - 2, y2: C.y });
  const tecla = s('rect', { class: 'tecla', x: TECLA.x, y: TECLA.y, width: TECLA.lado, height: TECLA.lado, rx: 7 });
  const teclaValor = s('text', { class: 'tecla-valor red-tecla-valor', x: TECLA.x + TECLA.lado / 2, y: TECLA.y + 25, 'text-anchor': 'middle' });
  const teclaRotulo = s('text', { class: 'rotulo', x: TECLA.x + TECLA.lado / 2, y: TECLA.y + TECLA.lado + 20, 'text-anchor': 'middle' });
  const capasXor = [f.capas.entradas, f.capas.oculta, f.capas.salida].map((texto, l) => s('text', { class: 'rotulo adelante-capa', x: xor.lugar(l, 0).x, y: 312, 'text-anchor': 'middle', text: texto }));
  const gXor = s('g', { class: 'adelante-red' }, xor.g, rotulosEntrada, cable, tecla, teclaValor, teclaRotulo, capasXor);

  // ---- La red del auto --------------------------------------------------------------------------------
  const auto = crearRedEnCapas({ sizes: [5, 6, 4], caja: { x: 96, y: 8, ancho: 316, alto: 284 }, radio: 14, radioEntrada: 14, clase: 'adelante-auto' });
  const rotulosTecla = auto.nodos[2].map((n, j) => s('text', { class: 'rotulo', x: n.x + n.radio + 8, y: n.y + 5, text: f.teclas[j] }));
  const capasAuto = [f.capas.sensores, f.capas.oculta, f.capas.teclas].map((texto, l) => s('text', { class: 'rotulo adelante-capa', x: auto.lugar(l, 0).x, y: 312, 'text-anchor': 'middle', text: texto }));
  const gAuto = s('g', { class: 'adelante-red' }, auto.g, rotulosTecla, capasAuto);

  const vivo = h('p', { class: 'solo-lector', 'aria-live': 'polite', id: `figura-adelante-${Math.random().toString(36).slice(2, 8)}` });
  const svg = s('svg', { class: 'escenario', viewBox: `0 0 ${ANCHO} ${ALTO}`, role: 'group', 'aria-label': f.titulo, 'aria-describedby': vivo.id }, gXor, gAuto);

  // ---- La cuenta escrita y los mandos -----------------------------------------------------------------
  const cuenta = h('p', { class: 'figura-cuenta', 'aria-hidden': 'true' });
  const perillas = [0, 1].map((i) => {
    const id = `perilla-adelante-${i}-${Math.random().toString(36).slice(2, 8)}`;
    const campo = h('input', { type: 'range', id, min: 0, max: 1, step: PASO, class: 'perilla-campo' });
    const valor = h('output', { class: 'perilla-valor', for: id });
    const el = h('div', { class: 'perilla perilla-entrada' },
      h('label', { for: id, class: 'perilla-cabeza' }, h('span', { class: 'perilla-rotulo', text: f.controles.entradas[i].nombre }), valor),
      conAyuda(campo, crearAyuda(f.controles.entradas[i].ayuda), 'perilla-riel'));
    campo.addEventListener('input', () => {
      parar();
      entradas[i] = cuarto(Number(campo.value));
      dibujar();
      alTocar(estado());
    });
    return { el, campo, valor };
  });
  const cajaPerillas = h('div', { class: 'figura-perillas figura-perillas-dos' }, perillas.map((p) => p.el));
  const ayudaBoton = crearAyuda('');
  const boton = h('button', { type: 'button', class: 'boton boton-figura', onclick: () => apretar() });
  const cajaBoton = h('div', { class: 'figura-boton' }, conAyuda(boton, ayudaBoton));
  const mandos = h('div', { class: 'figura-mandos' }, cajaPerillas, cajaBoton);

  const marcador = h('p', { class: 'figura-marcador' });
  const restablecer = h('button', { type: 'button', class: 'boton', text: f.restablecer.rotulo, onclick: () => alRestablecer() });
  const aviso = h('span', { class: 'figura-aviso', text: f.tocada });
  const pieAccion = h('div', { class: 'figura-accion' }, aviso, conAyuda(restablecer, crearAyuda(f.restablecer.ayuda), 'ayuda-derecha'));
  const pie = h('div', { class: 'figura-pie' }, marcador, pieAccion);

  const figura = h('figure', { class: 'figura figura-red figura-adelante' },
    h('div', { class: 'figura-lamina' }, svg), cuenta, mandos, pie, vivo, descripcionNeurona);
  contenedor.append(figura);

  // ---- Estado ----------------------------------------------------------------------------------------
  function parar() {
    clearTimeout(reloj);
    reloj = 0;
    if (transicion) { transicion = false; vistos = pasos; foco = vistos - 1; }
  }

  const estado = () => ({ vista, entradas: [...entradas], pasos });

  function leer() {
    const hechos = recorrido(redX, entradas);
    return {
      vista, entradas: [...entradas], pasos, cambiada, salida: hechos[2].salida,
      desafio: vista === 'desafio' && !transicion ? avanceDelDesafio(entradas) : null,
    };
  }

  const termino = (clase, texto) => h('span', { class: clase, text: texto });
  const conSigno = (v) => (v < 0 ? `(${fmt(v)})` : fmt(v));

  /** Pinta una red: cada neurona según si ya se calculó, y los pesos que le llegan. */
  function pintarRed(red, hechos, conNumeros) {
    hechos.forEach((p, k) => {
      const nodo = red.nodos[p.capa][p.neurona];
      const hecha = k < vistos;
      const leToca = k === vistos && vistos < pasos + (DE_LA_VISTA[vista].paso ? 1 : 0);
      nodo.g.dataset.estado = hecha ? 'hecha' : leToca ? 'toca' : 'falta';
      const encendida = hecha && p.salida === 1;
      nodo.circulo.classList.toggle('encendida', encendida);
      nodo.valor.classList.toggle('sobre-claro', encendida);
      nodo.valor.textContent = !hecha ? '' : conNumeros ? fmt(p.suma) : String(p.salida);
      p.pesos.forEach((w, i) => {
        const arista = red.aristas[p.capa - 1][p.neurona][i];
        red.pintarPeso(arista, w, fmt(w));
        arista.linea.classList.toggle('en-espera', !hecha && !leToca);
        arista.g?.classList.toggle('en-espera', !hecha && !leToca);
      });
      red.pintarSesgo(nodo, p.sesgo, (p.sesgo >= 0 ? '+ ' : '') + fmt(p.sesgo));
      nodo.g.classList.toggle('en-foco', conNumeros && hecha && k === foco);
    });
  }

  function dibujar() {
    const d = DE_LA_VISTA[vista];
    const hechos = recorrido(redX, entradas);
    const delAuto = d.red === 'auto';
    const total = delAuto ? pasosAuto.length : hechos.length;
    foco = Math.min(foco, vistos - 1);
    if (foco < 0 && vistos > 0) foco = vistos - 1;
    figura.dataset.vista = vista;
    figura.dataset.red = d.red;
    figura.dataset.capas = d.capas ? 'si' : 'no';

    // La red del XOR.
    xor.nodos[0].forEach((n, i) => { n.valor.textContent = fmt(entradas[i]); });
    if (!delAuto) pintarRed(xor, hechos, true);
    const lista = !delAuto && vistos >= hechos.length;
    const salida = hechos[2].salida;
    cable.classList.toggle('encendida', lista && salida === 1);
    tecla.classList.toggle('encendida', lista && salida === 1);
    teclaValor.classList.toggle('encendida', lista && salida === 1);
    teclaValor.textContent = lista ? String(salida) : '';
    teclaRotulo.textContent = !lista ? '' : salida === 1 ? f.encendida : f.apagada;
    neuronas.forEach((nodo, k) => {
      const p = hechos[k];
      nodo.g.setAttribute('aria-pressed', k === foco ? 'true' : 'false');
      nodo.g.setAttribute('aria-label', k < vistos
        ? rellenar(f.neurona.calculada, { quien: NEURONAS[k], suma: fmt(p.suma), salida: p.salida })
        : rellenar(f.neurona.pendiente, { quien: NEURONAS[k] }));
    });

    // La red del auto.
    auto.nodos[0].forEach((n, i) => { n.valor.textContent = fmt(LECTURAS_AUTO[i]); });
    if (delAuto) pintarRed(auto, pasosAuto, false);
    gXor.classList.toggle('fuera', delAuto);
    gAuto.classList.toggle('fuera', !delAuto);

    // La cuenta de la neurona en foco, con los colores del dibujo.
    if (delAuto) {
      cuenta.replaceChildren(termino('cuenta-palabra', rellenar(f.cuentaAuto, {
        neuronas: pasosAuto.length, pesos: pasosAuto.reduce((n, p) => n + p.pesos.length, 0), hechas: Math.min(vistos, total),
      })));
    } else if (foco < 0) {
      cuenta.replaceChildren(termino('cuenta-palabra', f.sinCuenta));
    } else {
      const p = hechos[foco];
      const deSalida = p.salidaDeLaRed;
      const partes = [termino('cuenta-quien', NEURONAS[foco])];
      p.recibe.forEach((x, i) => {
        if (i > 0) partes.push(termino('op', '+'));
        partes.push(termino(deSalida ? 'c-decide' : 'c-entra', fmt(x)), termino('op', '×'),
          termino(`c-${signo(p.pesos[i])} peso-${signo(p.pesos[i])}`, conSigno(p.pesos[i])));
      });
      partes.push(termino('op', '+'), termino(`c-${signo(p.sesgo)}`, conSigno(p.sesgo)),
        termino('op', '='), termino('cuenta-suma', fmt(p.suma)), termino('op cuenta-flecha', '→'),
        termino(`cuenta-salida${p.salida === 1 ? ' encendida' : ''}`, String(p.salida)),
        termino('cuenta-palabra', p.salida === 1 ? f.encendida : f.apagada));
      cuenta.replaceChildren(...partes);
    }

    // Los mandos: las entradas, o el botón de paso. Lo que no hace nada en esta vista no se ve.
    perillas.forEach((p, i) => {
      p.campo.disabled = !d.perillas;
      p.campo.value = String(entradas[i]);
      p.el.style.setProperty('--pos', `${entradas[i] * 100}%`);
      p.valor.textContent = fmt(entradas[i]);
      p.campo.setAttribute('aria-valuetext', fmt(entradas[i]));
    });
    cajaPerillas.classList.toggle('oculta', !d.perillas);
    const conPaso = d.paso && pasos < total;
    const conOtraVez = d.sola && !movimientoReducido();
    cajaBoton.classList.toggle('oculta', !conPaso && !conOtraVez);
    boton.disabled = !conPaso && !conOtraVez;
    boton.textContent = d.paso ? f.controles.paso.rotulo : f.controles.otraVez.rotulo;
    ayudaBoton.textContent = d.paso ? f.controles.paso.ayuda : f.controles.otraVez.ayuda;

    const apretadas = pasosAuto.filter((p) => p.salidaDeLaRed && p.salida === 1).map((p) => f.teclas[p.neurona]).join(', ');
    marcador.textContent = delAuto ? (vistos >= total ? rellenar(f.marcadorAuto, { teclas: apretadas }) : '')
      : !lista ? rellenar(f.calculadas, { n: vistos, total })
        : rellenar(salida === 1 ? f.daUno : f.daCero, {});
    pieAccion.classList.toggle('oculta', !d.perillas && !d.paso && !cambiada);
    aviso.classList.toggle('oculta', !cambiada);

    clearTimeout(avisoPendiente);
    avisoPendiente = setTimeout(() => {
      vivo.textContent = delAuto ? rellenar(f.resumenAuto, { teclas: apretadas })
        : !lista ? rellenar(f.calculadas, { n: vistos, total })
          : rellenar(f.resumen, { x1: fmt(entradas[0]), x2: fmt(entradas[1]), salida });
    }, 500);
    alCambiar(leer());
  }

  /** La cuenta se hace sola, de a una neurona: lo que se ve en el camino no cuenta como cambio. */
  function reproducir() {
    clearTimeout(reloj);
    const lapso = LAPSO[DE_LA_VISTA[vista].red];
    vistos = 0;
    foco = -1;
    transicion = true;
    dibujar();
    const sigue = () => {
      vistos += 1;
      foco = vistos - 1;
      if (vistos >= pasos) { transicion = false; reloj = 0; } else reloj = setTimeout(sigue, lapso);
      dibujar();
    };
    reloj = setTimeout(sigue, lapso);
  }

  function apretar() {
    const d = DE_LA_VISTA[vista];
    if (d.paso) {
      parar();
      pasos = Math.min(3, pasos + 1);
      vistos = pasos;
      foco = vistos - 1;
      dibujar();
      alTocar(estado());
    } else if (d.sola) reproducir();
  }

  /** Lleva la figura a un estado ({ vista, entradas, pasos }); en las vistas "solas", la cuenta se ve pasar. */
  function poner(destino, { animar = true } = {}) {
    clearTimeout(reloj);
    reloj = 0;
    transicion = false;
    vista = destino.vista;
    entradas = [...destino.entradas];
    pasos = destino.pasos;
    if (DE_LA_VISTA[vista].sola && animar && !movimientoReducido()) { reproducir(); return; }
    vistos = pasos;
    foco = vistos - 1;
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
