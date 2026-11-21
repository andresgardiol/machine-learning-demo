// La figura viva de "Una recta no alcanza" (seccion-teoria D9, capítulo 2): el plano con los cuatro
// puntos del XOR y, al lado, una red que crece de una neurona a tres. Es una sola figura que se
// transforma: la neurona A sube para hacerle lugar a B, y después aparece C, que recibe lo que responden
// las otras dos. Toda la cuenta sale de cuenta.js, que usa el núcleo de la app (createNetwork, escalón).
//
// En el plano, cada neurona de la primera capa es una recta (A continua, B a rayas, cada una con su
// letra y una flechita hacia el lado donde se enciende). La zona clara es donde la salida da 1. Los
// puntos llevan forma además de color: círculo si tienen que dar 1, cuadrado si tienen que dar 0.
//
// Igual que las otras figuras, no decide qué valores muestra: `poner` la lleva al estado que le dan y
// `alTocar` avisa cada cambio de la persona con el estado completo (D4).

import { h, s, rellenar, formato, crearAyuda, conAyuda, descripcionOculta, movimientoReducido } from '../../dom.js';
import {
  TABLA_XOR, crearRed, fijarRed, calcularRed, aciertosXor, crearNeurona, fijarPesos, fijarSesgo, calcular,
  zonasDeLaRed, zonaEntre,
} from './cuenta.js';
import { DE_LA_VISTA, redDe } from './guion.js';
import { rectaDelPlano, tramoEnCaja } from '../../figuras/recta.js';
import { zonaEncendida } from '../../figuras/zona.js';

const ANCHO = 580;
const ALTO = 330;
const MIN = -2;
const MAX = 2;
const PASO = 0.1;
const DURACION = 450;
const CAJA = { xMin: -0.25, xMax: 1.25, yMin: -0.25, yMax: 1.25 };
const P = { x0: 44, y0: 20, lado: 204 };
const px = (x) => P.x0 + ((x - CAJA.xMin) / (CAJA.xMax - CAJA.xMin)) * P.lado;
const py = (y) => P.y0 + P.lado - ((y - CAJA.yMin) / (CAJA.yMax - CAJA.yMin)) * P.lado;
const ENT = [{ x: 312, y: 92 }, { x: 312, y: 200 }];
const R_ENT = 17;
const R = 24;
const lugarA = (crece) => ({ x: 402, y: 146 - 54 * crece }); // sola, va al medio; con B, sube
const LUGAR_B = { x: 402, y: 200 };
const LUGAR_C = { x: 490, y: 146 };
const TECLA = { x: 532, y: 128, lado: 36 };
const LETRAS = { a: 'A', b: 'B', c: 'C' };

const decima = (v) => Math.round(v * 10) / 10;
const signo = (v) => (v > 0 ? 'pos' : v < 0 ? 'neg' : 'cero');
const grosor = (v) => (v === 0 ? 1.2 : 1.5 + Math.min(2, Math.abs(v)) * 2.2);
const copiar = ({ pesos, sesgo }) => ({ pesos: [...pesos], sesgo });
const mezclar = (a, b, t) => ({ pesos: a.pesos.map((v, i) => v + (b.pesos[i] - v) * t), sesgo: a.sesgo + (b.sesgo - a.sesgo) * t });

function entre(a, ra, b, rb) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  return { x1: a.x + (dx / d) * ra, y1: a.y + (dy / d) * ra, x2: b.x - (dx / d) * rb, y2: b.y - (dy / d) * rb };
}
const ponerLinea = (linea, t) => { for (const [k, v] of Object.entries(t)) linea.setAttribute(k, v); };

/**
 * @param {HTMLElement} contenedor
 * @param {{c: {idioma: string, figura: object}, alCambiar?: (lectura: object) => void,
 *   alTocar?: (estado: object) => void, alRestablecer?: () => void}} opciones
 */
export function crearFigura(contenedor, { c, alCambiar = () => {}, alTocar = () => {}, alRestablecer = () => {} }) {
  const fmt = formato(c.idioma);
  const f = c.figura;
  const sola = crearNeurona();
  const red = crearRed({ ocultas: [{ pesos: [0, 0], sesgo: 0 }, { pesos: [0, 0], sesgo: 0 }], salida: { pesos: [0, 0], sesgo: 0 } });
  let vista = 'una';
  let valores = { a: { pesos: [0, 0], sesgo: 0 }, b: { pesos: [0, 0], sesgo: 0 }, c: { pesos: [0, 0], sesgo: 0 } };
  let crece = 0; // 0: A sola; 1: A arriba y B debajo
  let junta = 0; // 0: sin C; 1: con C
  let foco = 'a'; // la neurona cuya cuenta se escribe y cuyas perillas se ven
  let elegido = 0;
  let elegidoBase = 0;
  let cambiada = false;
  let animacion = 0;
  let finAnimacion = 0;
  let transicion = false; // la figura va de un estado a otro: lo que se ve en el camino no cuenta para el desafío
  let avisoPendiente = 0;

  // ---- El plano --------------------------------------------------------------------------------------
  const zonas = [0, 1, 2, 3].map(() => s('polygon', { class: 'plano-zona' }));
  const guias = [0, 1].flatMap((v) => [
    s('line', { class: 'plano-guia', x1: px(v), y1: P.y0, x2: px(v), y2: P.y0 + P.lado }),
    s('line', { class: 'plano-guia', x1: P.x0, y1: py(v), x2: P.x0 + P.lado, y2: py(v) }),
    s('text', { class: 'rotulo', x: px(v), y: P.y0 + P.lado + 17, 'text-anchor': 'middle', text: String(v) }),
    s('text', { class: 'rotulo', x: P.x0 - 9, y: py(v) + 5, 'text-anchor': 'end', text: String(v) }),
  ]);
  const rectas = ['a', 'b'].map((id) => {
    const linea = s('line', { class: `plano-recta recta-${id}` });
    const lado = s('path', { class: 'recta-lado', d: 'M0 -5 L9 0 L0 5 Z' });
    const letra = s('g', { class: 'recta-letra' }, s('circle', { r: 10 }), s('text', { y: 5, 'text-anchor': 'middle', text: LETRAS[id] }));
    return { id, linea, lado, letra, g: s('g', { class: 'recta' }, linea, lado, letra) };
  });
  const descripcionPunto = descripcionOculta(f.punto.descripcion);
  const puntos = TABLA_XOR.map(({ entradas: [x, y], salida: esperada }, i) => {
    const forma = esperada === 1
      ? s('circle', { class: 'caso-forma caso-1', r: 10 })
      : s('rect', { class: 'caso-forma caso-0', x: -9, y: -9, width: 18, height: 18, rx: 2 });
    const veredicto = s('text', { class: 'caso-veredicto', x: 14, y: -10 });
    const fichas = [0, 1].map((k) => s('rect', { class: 'caso-ficha', x: 13 + k * 11, y: -22, width: 9, height: 9, rx: 2 }));
    const g = s('g', { class: 'caso', tabindex: 0, role: 'button', 'aria-describedby': descripcionPunto.id, transform: `translate(${px(x)} ${py(y)})` },
      s('circle', { class: 'plano-punto-zona', r: 26 }), s('circle', { class: 'caso-elegido', r: 17 }), forma, veredicto, fichas);
    const elegir = () => { elegido = i; dibujar(); };
    g.addEventListener('click', elegir);
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elegir(); } });
    return { g, veredicto, fichas, esperada, x, y };
  });
  const plano = s('g', { class: 'red-plano' },
    s('rect', { class: 'plano-fondo', x: P.x0, y: P.y0, width: P.lado, height: P.lado, rx: 4 }),
    zonas, guias, rectas.map((r) => r.g), puntos.map((p) => p.g),
    s('text', { class: 'rotulo', x: P.x0 + P.lado / 2, y: P.y0 + P.lado + 42, 'text-anchor': 'middle', text: f.entradaIzq }),
    s('text', { class: 'rotulo', transform: `translate(18 ${P.y0 + P.lado / 2}) rotate(-90)`, 'text-anchor': 'middle', text: f.entradaDer }));

  // ---- La red ----------------------------------------------------------------------------------------
  const entradas = ENT.map((p, i) => ({
    nodo: s('circle', { class: 'entrada', cx: p.x, cy: p.y, r: R_ENT }),
    valor: s('text', { class: 'entrada-valor red-entrada', x: p.x, y: p.y + 6, 'text-anchor': 'middle' }),
    rotulo: s('text', { class: 'rotulo', x: p.x, y: i === 0 ? p.y - 26 : p.y + 36, 'text-anchor': 'middle', text: i === 0 ? f.izquierda : f.derecha }),
  }));
  const crearNodo = (id) => {
    const circulo = s('circle', { class: `neurona red-neurona red-${id}`, r: R });
    const valor = s('text', { class: 'red-valor', 'text-anchor': 'middle', y: 5 });
    const letra = s('text', { class: 'red-letra', x: R - 3, y: -R + 1, text: LETRAS[id] });
    const cable = s('line', { class: 'peso red-sesgo-linea' });
    const caja = s('rect', { class: 'sesgo-caja', x: -22, width: 44, height: 22, rx: 5 });
    const sesgo = s('text', { class: 'pastilla-texto red-sesgo-texto', 'text-anchor': 'middle' });
    const pesos = [0, 1].map(() => s('line', { class: 'peso' }));
    const cuerpo = s('g', null, circulo, valor, letra);
    const etiqueta = s('g', null, cable, caja, sesgo);
    return { id, circulo, valor, cable, caja, sesgo, pesos, cuerpo, etiqueta, g: s('g', { class: 'red-nodo', 'data-neurona': id }, pesos, etiqueta, cuerpo) };
  };
  const nodos = { a: crearNodo('a'), b: crearNodo('b'), c: crearNodo('c') };
  const cableSalida = s('line', { class: 'salida-linea' });
  const tecla = s('rect', { class: 'tecla', x: TECLA.x, y: TECLA.y, width: TECLA.lado, height: TECLA.lado, rx: 7 });
  const teclaValor = s('text', { class: 'tecla-valor red-tecla-valor', x: TECLA.x + TECLA.lado / 2, y: TECLA.y + 25, 'text-anchor': 'middle' });
  const teclaRotulo = s('text', { class: 'rotulo', x: TECLA.x + TECLA.lado + 4, y: TECLA.y + TECLA.lado + 20, 'text-anchor': 'end' });
  const salida = s('g', { class: 'red-salida' }, cableSalida, tecla, teclaValor, teclaRotulo);
  const diagrama = s('g', { class: 'red-diagrama' },
    nodos.a.g, nodos.b.g, nodos.c.g, salida, entradas.map((e) => [e.nodo, e.valor, e.rotulo]));

  const vivo = h('p', { class: 'solo-lector', 'aria-live': 'polite', id: `figura-xor-${Math.random().toString(36).slice(2, 8)}` });
  const svg = s('svg', { class: 'escenario', viewBox: `0 0 ${ANCHO} ${ALTO}`, role: 'group', 'aria-label': f.titulo, 'aria-describedby': vivo.id }, plano, diagrama);

  // ---- La cuenta escrita, la nota y las perillas -----------------------------------------------------
  const cuenta = h('p', { class: 'figura-cuenta', 'aria-hidden': 'true' });
  const nota = h('p', { class: 'figura-nota' });

  const selector = ['a', 'b'].map((id) => h('button', {
    type: 'button', class: 'selector-opcion', text: f.selector[id], onclick: () => { foco = id; dibujar(); },
  }));
  const cajaSelector = h('div', { class: 'selector', role: 'group', 'aria-label': f.selector.rotulo }, selector);

  const perillas = ['w1', 'w2', 'b'].map((id, k) => {
    const idCampo = `perilla-xor-${id}-${Math.random().toString(36).slice(2, 8)}`;
    const campo = h('input', { type: 'range', id: idCampo, min: MIN, max: MAX, step: PASO, class: 'perilla-campo' });
    const rotulo = h('span', { class: 'perilla-rotulo' });
    const valor = h('output', { class: 'perilla-valor', for: idCampo });
    const ayuda = crearAyuda('');
    const el = h('div', { class: 'perilla' }, h('label', { for: idCampo, class: 'perilla-cabeza' }, rotulo, valor), conAyuda(campo, ayuda, 'perilla-riel'));
    campo.addEventListener('input', () => {
      tocar();
      const v = decima(Number(campo.value));
      const n = valores[foco];
      if (k < 2) n.pesos[k] = v; else n.sesgo = v;
      dibujar();
      alTocar(estado());
    });
    return { id, el, campo, rotulo, valor, ayuda };
  });
  const cajaPerillas = h('div', { class: 'figura-perillas' }, perillas.map((p) => p.el));

  // ---- Pie: el marcador y Restablecer ----------------------------------------------------------------
  const puntosMarcador = TABLA_XOR.map(() => h('i', { class: 'desafio-punto' }));
  const marcadorPuntos = h('span', { class: 'desafio-puntos', 'aria-hidden': 'true' }, puntosMarcador);
  const marcadorFichas = h('span', { class: 'marcador-fichas', 'aria-hidden': 'true' }, h('i', { class: 'encendida' }), h('i'));
  const marcadorTexto = h('span');
  const marcador = h('p', { class: 'figura-marcador' }, marcadorPuntos, marcadorFichas, marcadorTexto);
  const restablecer = h('button', { type: 'button', class: 'boton', text: f.restablecer.rotulo, onclick: () => alRestablecer() });
  const aviso = h('span', { class: 'figura-aviso', text: f.tocada });
  const pieAccion = h('div', { class: 'figura-accion' }, aviso, conAyuda(restablecer, crearAyuda(f.restablecer.ayuda), 'ayuda-derecha'));
  const pie = h('div', { class: 'figura-pie' }, marcador, cajaSelector, pieAccion);

  const figura = h('figure', { class: 'figura figura-red' },
    h('div', { class: 'figura-lamina' }, svg), cuenta, nota, cajaPerillas, pie, vivo, descripcionPunto);
  contenedor.append(figura);

  // ---- Estado ----------------------------------------------------------------------------------------
  function tocar() {
    cancelAnimationFrame(animacion);
    clearTimeout(finAnimacion);
    animacion = 0;
    transicion = false;
  }

  /** El estado que se ve. El punto elegido no cuenta como cambio: queda el del tramo. */
  const estado = () => ({ vista, a: copiar(valores.a), b: copiar(valores.b), c: copiar(valores.c), elegido: elegidoBase });

  /** Toda la cuenta de ahora, hecha por el núcleo: punto por punto, y cuántos del XOR quedan bien. */
  function leer() {
    const d = DE_LA_VISTA[vista];
    fijarPesos(sola, valores.a.pesos);
    fijarSesgo(sola, valores.a.sesgo);
    fijarRed(red, redDe(valores));
    const casos = TABLA_XOR.map(({ entradas, salida: esperada }) => {
      const una = calcular(sola, [...entradas]);
      const toda = calcularRed(red, entradas);
      const salidaDeAhora = d.neuronas === 1 ? una.salida : toda.salida;
      return {
        entradas: [...entradas], esperada,
        sumas: { a: una.suma, b: toda.sumasOcultas[1], c: toda.suma },
        respuestas: { a: toda.ocultas[0], b: toda.ocultas[1], c: toda.salida },
        salida: salidaDeAhora, bien: salidaDeAhora === esperada,
      };
    });
    const bien = d.neuronas === 2 ? null : aciertosXor((e) => casos.find((k) => k.entradas[0] === e[0] && k.entradas[1] === e[1]).salida).bien;
    return {
      vista, valores, casos, bien, total: TABLA_XOR.length, cambiada, elegido, foco,
      entre: casos.filter((k) => k.respuestas.a === 1 && k.respuestas.b === 0).length,
      desafio: vista === 'desafio' && !transicion ? { bien, total: TABLA_XOR.length } : null,
    };
  }

  const termino = (clase, texto) => h('span', { class: clase, text: texto });

  function dibujarRecta(r, visible) {
    const n = valores[r.id];
    const recta = rectaDelPlano(n);
    const tramo = visible ? tramoEnCaja(recta, CAJA) : null;
    r.g.style.display = tramo ? '' : 'none';
    if (!tramo) return visible ? recta.tipo : null;
    const [[ax, ay], [bx, by]] = tramo;
    const [x1, y1, x2, y2] = [px(ax), py(ay), px(bx), py(by)];
    ponerLinea(r.linea, { x1, y1, x2, y2 });
    const largo = Math.hypot(x2 - x1, y2 - y1) || 1;
    // La letra va cerca de una punta (cada recta en una distinta, para que no se pisen) y la flechita,
    // un poco más adentro, apunta al lado donde la neurona se enciende.
    const t = r.id === 'a' ? 16 / largo : 1 - 16 / largo;
    const u = r.id === 'a' ? 46 / largo : 1 - 46 / largo;
    r.letra.setAttribute('transform', `translate(${x1 + (x2 - x1) * t} ${y1 + (y2 - y1) * t})`);
    const giro = (Math.atan2(-recta.normal[1], recta.normal[0]) * 180) / Math.PI;
    r.lado.setAttribute('transform', `translate(${x1 + (x2 - x1) * u} ${y1 + (y2 - y1) * u}) rotate(${giro}) translate(3 0)`);
    return null;
  }

  function dibujarNodo(nodo, lugar, origenes, n, suma, encendida) {
    nodo.cuerpo.setAttribute('transform', `translate(${lugar.x} ${lugar.y})`);
    nodo.circulo.classList.toggle('encendida', encendida);
    nodo.valor.classList.toggle('sobre-claro', encendida);
    nodo.valor.textContent = fmt(suma);
    origenes.forEach((o, i) => {
      ponerLinea(nodo.pesos[i], entre(o.punto, o.radio + 2, lugar, R + 2));
      nodo.pesos[i].dataset.signo = signo(n.pesos[i]);
      nodo.pesos[i].style.strokeWidth = grosor(n.pesos[i]);
    });
    // El sesgo, en una etiqueta pegada a la neurona: arriba de A y de C, debajo de B.
    const dy = nodo.id === 'b' ? 46 : -46;
    nodo.etiqueta.setAttribute('transform', `translate(${lugar.x} ${lugar.y + dy})`);
    nodo.caja.setAttribute('y', -11);
    nodo.caja.dataset.signo = signo(n.sesgo);
    nodo.sesgo.setAttribute('y', 5);
    nodo.sesgo.textContent = (n.sesgo >= 0 ? '+ ' : '') + fmt(n.sesgo);
    ponerLinea(nodo.cable, { x1: 0, y1: dy < 0 ? 11 : -11, x2: 0, y2: dy < 0 ? 46 - R - 2 : -(46 - R - 2) });
    nodo.cable.dataset.signo = signo(n.sesgo);
    nodo.cable.style.strokeWidth = grosor(n.sesgo);
  }

  function dibujar() {
    const d = DE_LA_VISTA[vista];
    if (!d.edita.includes(foco)) foco = d.edita[0] ?? (d.neuronas === 3 ? 'c' : d.neuronas === 2 ? 'b' : 'a');
    const l = leer();
    const caso = l.casos[elegido];
    figura.dataset.vista = vista;
    figura.dataset.neuronas = String(d.neuronas);

    // El plano: las rectas, la zona clara y los cuatro puntos.
    const faltas = rectas.map((r) => dibujarRecta(r, r.id === 'a' || d.neuronas >= 2));
    const poligonos = d.neuronas === 1 ? [zonaEncendida(valores.a, CAJA)]
      : d.neuronas === 3 ? zonasDeLaRed(redDe(valores), CAJA).map((z) => z.poligono)
        : d.franja ? [zonaEntre(redDe(valores), CAJA)] : [];
    zonas.forEach((z, i) => z.setAttribute('points', (poligonos[i] ?? []).map(([x, y]) => `${px(x)},${py(y)}`).join(' ')));
    puntos.forEach((p, i) => {
      const k = l.casos[i];
      const conVeredicto = d.neuronas !== 2;
      p.g.classList.toggle('bien', k.bien);
      p.g.classList.toggle('elegido', i === elegido);
      p.g.setAttribute('aria-pressed', i === elegido ? 'true' : 'false');
      p.veredicto.textContent = conVeredicto ? (k.bien ? '✓' : '✕') : '';
      p.fichas.forEach((ficha, j) => {
        ficha.style.display = conVeredicto ? 'none' : '';
        ficha.classList.toggle('encendida', (j === 0 ? k.respuestas.a : k.respuestas.b) === 1);
      });
      p.g.setAttribute('aria-label', conVeredicto
        ? rellenar(f.punto.conSalida, { x1: p.x, x2: p.y, esperada: p.esperada, salida: k.salida, veredicto: k.bien ? f.punto.bien : f.punto.mal })
        : rellenar(f.punto.conDos, { x1: p.x, x2: p.y, a: k.respuestas.a, b: k.respuestas.b }));
    });

    // La red: A sube cuando llega B; C aparece al final.
    const A = lugarA(crece);
    const deEntradas = ENT.map((punto) => ({ punto, radio: R_ENT }));
    entradas.forEach((e, i) => { e.valor.textContent = String(caso.entradas[i]); });
    dibujarNodo(nodos.a, A, deEntradas, valores.a, caso.sumas.a, (d.neuronas === 1 ? caso.salida : caso.respuestas.a) === 1);
    dibujarNodo(nodos.b, LUGAR_B, deEntradas, valores.b, caso.sumas.b, caso.respuestas.b === 1);
    dibujarNodo(nodos.c, LUGAR_C, [{ punto: A, radio: R }, { punto: LUGAR_B, radio: R }], valores.c, caso.sumas.c, caso.respuestas.c === 1);
    nodos.b.g.style.opacity = String(crece);
    nodos.c.g.style.opacity = String(junta);
    for (const [id, nodo] of Object.entries(nodos)) nodo.g.classList.toggle('en-foco', id === foco && d.neuronas > 1);
    const desde = A.x + R + 3 + (LUGAR_C.x - A.x) * junta;
    ponerLinea(cableSalida, { x1: desde, y1: LUGAR_C.y, x2: TECLA.x - 2, y2: LUGAR_C.y });
    salida.style.opacity = String(Math.max(1 - crece, junta));
    const encendida = caso.salida === 1 && d.neuronas !== 2;
    cableSalida.classList.toggle('encendida', encendida);
    tecla.classList.toggle('encendida', encendida);
    teclaValor.classList.toggle('encendida', encendida);
    teclaValor.textContent = String(caso.salida);
    teclaRotulo.textContent = encendida ? f.encendida : f.apagada;

    // La cuenta de la neurona en foco, para el punto elegido, con los colores del dibujo.
    const n = valores[foco];
    const deC = foco === 'c';
    const llegan = deC ? [caso.respuestas.a, caso.respuestas.b] : caso.entradas;
    const partes = [termino('cuenta-quien', LETRAS[foco])];
    llegan.forEach((x, i) => {
      if (i > 0) partes.push(termino('op', '+'));
      partes.push(termino(deC ? 'c-decide' : 'c-entra', String(x)), termino('op', '×'),
        termino(`c-${signo(n.pesos[i])} peso-${signo(n.pesos[i])}`, n.pesos[i] < 0 ? `(${fmt(n.pesos[i])})` : fmt(n.pesos[i])));
    });
    const suma = caso.sumas[foco];
    const da = foco === 'a' && d.neuronas === 1 ? caso.salida : caso.respuestas[foco];
    partes.push(termino('op', '+'), termino(`c-${signo(n.sesgo)} peso-${signo(n.sesgo)}`, n.sesgo < 0 ? `(${fmt(n.sesgo)})` : fmt(n.sesgo)),
      termino('op', '='), termino('cuenta-suma', fmt(suma)), termino('op cuenta-flecha', '→'),
      termino(`cuenta-salida${da === 1 ? ' encendida' : ''}`, String(da)),
      termino('cuenta-palabra', da === 1 ? f.encendida : f.apagada));
    cuenta.replaceChildren(...partes);

    // La nota: cuando la recta de la neurona en foco no se ve.
    const falta = foco === 'c' ? null : faltas[foco === 'a' ? 0 : 1];
    const textoNota = !falta ? '' : rellenar(falta === 'ninguna' ? f.sinRecta : f.rectaFuera, { quien: LETRAS[foco] });
    nota.textContent = textoNota;
    nota.classList.toggle('visible', Boolean(textoNota));

    // Las perillas de la neurona en foco, si esta vista deja moverla.
    const conPerillas = d.edita.length > 0;
    perillas.forEach((p, k) => {
      const v = k < 2 ? n.pesos[k] : n.sesgo;
      const textos = f.controles[p.id];
      p.campo.disabled = !conPerillas;
      p.campo.value = String(v);
      p.el.dataset.signo = signo(v);
      p.el.style.setProperty('--pos', `${((v - MIN) / (MAX - MIN)) * 100}%`);
      p.valor.textContent = fmt(v);
      p.rotulo.textContent = rellenar(deC ? textos.deC : textos.nombre, { quien: LETRAS[foco] });
      p.ayuda.textContent = deC ? textos.ayudaDeC : textos.ayuda;
      p.campo.setAttribute('aria-valuetext', fmt(v));
    });
    cajaPerillas.classList.toggle('oculta', !conPerillas);
    cajaSelector.classList.toggle('oculta', d.edita.length < 2);
    selector.forEach((b, i) => {
      const id = i === 0 ? 'a' : 'b';
      b.disabled = d.edita.length < 2;
      b.setAttribute('aria-pressed', id === foco ? 'true' : 'false');
    });

    // El pie: cuántos puntos da bien, o qué son las dos marcas de cada punto.
    const conDos = d.neuronas === 2;
    marcadorPuntos.hidden = conDos;
    marcadorFichas.hidden = !conDos;
    puntosMarcador.forEach((p, i) => p.classList.toggle('bien', !conDos && i < l.bien));
    marcadorTexto.textContent = conDos ? f.fichas : rellenar(f.aciertos, { bien: l.bien, total: l.total });
    pieAccion.classList.toggle('oculta', !conPerillas && !cambiada);
    aviso.classList.toggle('oculta', !cambiada);

    clearTimeout(avisoPendiente);
    avisoPendiente = setTimeout(() => {
      vivo.textContent = conDos ? rellenar(f.resumenDos, { n: l.entre }) : rellenar(f.resumen, { bien: l.bien, total: l.total, neuronas: d.neuronas });
    }, 500);
    alCambiar(l);
  }

  function fijar(destino) {
    valores = { a: copiar(destino.a), b: copiar(destino.b), c: copiar(destino.c) };
    crece = destino.crece;
    junta = destino.junta;
  }

  function llevar(destino, animar) {
    tocar();
    const origen = { a: copiar(valores.a), b: copiar(valores.b), c: copiar(valores.c), crece, junta };
    if (!animar || movimientoReducido()) { fijar(destino); dibujar(); return; }
    const inicio = performance.now();
    transicion = true;
    const cuadro = (ahora) => {
      const lineal = Math.min(1, (ahora - inicio) / DURACION);
      const t = lineal < 0.5 ? 2 * lineal * lineal : 1 - ((-2 * lineal + 2) ** 2) / 2;
      if (lineal >= 1) { transicion = false; fijar(destino); clearTimeout(finAnimacion); }
      else fijar({
        a: mezclar(origen.a, destino.a, t), b: mezclar(origen.b, destino.b, t), c: mezclar(origen.c, destino.c, t),
        crece: origen.crece + (destino.crece - origen.crece) * t, junta: origen.junta + (destino.junta - origen.junta) * t,
      });
      dibujar();
      if (lineal < 1) animacion = requestAnimationFrame(cuadro);
    };
    animacion = requestAnimationFrame(cuadro);
    // Si el navegador no da cuadros (pestaña en segundo plano), la figura llega igual a su estado.
    finAnimacion = setTimeout(() => { cancelAnimationFrame(animacion); transicion = false; fijar(destino); dibujar(); }, DURACION + 120);
  }

  /** Lleva la figura a un estado ({ vista, a, b, c, elegido }), con transición salvo que `animar` sea falso. */
  function poner(destino, { animar = true } = {}) {
    const antes = DE_LA_VISTA[vista].neuronas;
    vista = destino.vista;
    const d = DE_LA_VISTA[vista];
    elegido = elegidoBase = destino.elegido ?? 0;
    // Al llegar una neurona nueva, el foco pasa a ella: es lo que cambió.
    if (d.neuronas !== antes || !d.edita.includes(foco)) foco = d.neuronas === 3 ? 'c' : d.neuronas === 2 ? 'b' : 'a';
    llevar({ a: destino.a, b: destino.b, c: destino.c, crece: d.neuronas >= 2 ? 1 : 0, junta: d.neuronas === 3 ? 1 : 0 }, animar);
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
