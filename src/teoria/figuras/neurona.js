// Dibujo de la neurona (teoria-prototipos D3 y D4): el auto con sus dos sensores a la izquierda y, al
// lado, las dos entradas, los pesos, el sesgo, la suma, el escalón y la salida. Solo dibuja lo que
// recibe en `lectura`, que sale de figuras/cuenta.js: lo que se ve es lo que se calculó.
//
// Color y forma (D4): entra = celeste; peso positivo = verde agua, línea continua; peso negativo =
// rosa, línea punteada; decide = blanco. El grosor de cada línea es el tamaño del peso.

import { s } from '../dom.js';
import { SENSORES, escenaDeSensores } from './sensores.js';

export const ANCHO = 760;
export const ALTO = 330;

const ENT = [{ x: 372, y: 95 }, { x: 372, y: 235 }];
const NEU = { x: 560, y: 165, r: 46 };
const R_ENT = 26;
const SES = { x: 560, y: 46 };
const CALLE = 40; // borde izquierdo de la calle
const FRENTE = 222; // altura del frente del auto, de donde salen los rayos
const OBSTACULO = { medio: 15, largo: 50 }; // el vehículo donde termina un rayo
let cuentaFiguras = 0; // para que cada figura tenga sus propios degradados

const signo = (v) => (v > 0 ? 'pos' : v < 0 ? 'neg' : 'cero');
const grosor = (v) => (v === 0 ? 1.5 : 2 + Math.min(2, Math.abs(v)) * 3.5);

function tramoEntre(a, ra, b, rb) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy);
  return { x1: a.x + (dx / d) * ra, y1: a.y + (dy / d) * ra, x2: b.x - (dx / d) * rb, y2: b.y - (dy / d) * rb };
}

/**
 * Escena del auto: calle, auto y dos rayos simétricos. Dónde va el auto y dónde termina cada rayo lo
 * dice sensores.js: en el borde de la calle, en otro vehículo o, con lectura 0, entero sin tocar nada.
 * El obstáculo es un vehículo del tráfico visto de arriba, como el auto: se reconoce sin leyenda. El rayo
 * lo toca en la cola. Un rayo que no toca nada se desvanece hacia la punta: sigue de largo.
 */
export function crearAuto(c) {
  const seno = Math.sin(SENSORES.angulo);
  const coseno = Math.cos(SENSORES.angulo);
  const serie = `rayo-${++cuentaFiguras}`;
  const rayos = [-1, 1].map((lado, i) => ({
    lado,
    rayo: s('line', { class: 'rayo', y1: FRENTE }),
    // Para el rayo que no toca nada: el color del sensor que se apaga hacia la punta.
    idDesvanecer: `${serie}-${i}`,
    desvanecer: s('linearGradient', { id: `${serie}-${i}`, gradientUnits: 'userSpaceOnUse' },
      s('stop', { offset: 0, class: 'rayo-color' }), s('stop', { offset: 0.45, class: 'rayo-color' }), s('stop', { offset: 1, class: 'rayo-color rayo-fin' })),
    // Origen del grupo: el medio de la cola del vehículo, que es donde lo toca el rayo.
    obstaculo: s('g', { class: 'obstaculo' },
      s('rect', { class: 'obstaculo-cuerpo', x: -OBSTACULO.medio, y: -OBSTACULO.largo, width: OBSTACULO.medio * 2, height: OBSTACULO.largo, rx: 8 }),
      s('rect', { class: 'coche-vidrio', x: -10, y: -OBSTACULO.largo + 13, width: 20, height: 11, rx: 3 }),
      s('rect', { class: 'coche-vidrio', x: -9, y: -17, width: 18, height: 7, rx: 3 }),
      s('rect', { class: 'obstaculo-luz', x: -12, y: -4, width: 7, height: 4, rx: 2 }),
      s('rect', { class: 'obstaculo-luz', x: 5, y: -4, width: 7, height: 4, rx: 2 })),
    toque: s('circle', { class: 'toque', r: 4.5 }),
    // La lectura va arriba de lo que el sensor encontró y se abre hacia su lado: las dos no se pisan.
    valor: s('text', { class: 'lectura' }),
  }));
  // El auto va siempre derecho, con los rayos simétricos a la vista (revisión 2). La decisión se muestra
  // con las ruedas delanteras y una flecha corta delante de la trompa, entre los dos rayos.
  const ruedas = [-1, 1].map((lado) => s('rect', { class: 'coche-rueda', x: lado * 17 - 3.5, y: -25, width: 7, height: 15, rx: 3 }));
  const flechaRecta = s('g', { class: 'decision-flecha' }, s('path', { d: 'M0 -39 V-58' }), s('path', { class: 'decision-punta', d: 'M0 -67 L-6.5 -56 L6.5 -56 Z' }));
  const flechaGiro = s('g', { class: 'decision-flecha' }, s('path', { d: 'M0 -39 C0 -50 3 -56 10 -61' }), s('path', { class: 'decision-punta', d: 'M0 -11 L-6.5 0 L6.5 0 Z', transform: 'translate(15.5 -64.5) rotate(56) translate(0 5.5)' }));
  const coche = s('g', { class: 'coche' },
    ruedas,
    s('rect', { class: 'coche-cuerpo', x: -17, y: -30, width: 34, height: 60, rx: 9 }),
    s('rect', { class: 'coche-vidrio', x: -12, y: -16, width: 24, height: 13, rx: 4 }),
    s('rect', { class: 'coche-vidrio', x: -11, y: 12, width: 22, height: 8, rx: 3 }),
    s('rect', { class: 'coche-luz', x: -14, y: -30, width: 8, height: 4, rx: 2 }),
    s('rect', { class: 'coche-luz', x: 6, y: -30, width: 8, height: 4, rx: 2 }));
  const lugar = s('g', null, coche, flechaRecta, flechaGiro);
  const decision = s('text', { class: 'decision', x: CALLE + SENSORES.ancho / 2, y: 312, 'text-anchor': 'middle' });
  const g = s('g', { class: 'esc-auto' },
    s('rect', { class: 'calle', x: CALLE, y: 10, width: SENSORES.ancho, height: 310, rx: 6 }),
    s('line', { class: 'calle-carril', x1: CALLE + SENSORES.ancho / 2, y1: 14, x2: CALLE + SENSORES.ancho / 2, y2: 290 }),
    s('line', { class: 'calle-borde', x1: CALLE, y1: 10, x2: CALLE, y2: 320 }),
    s('line', { class: 'calle-borde', x1: CALLE + SENSORES.ancho, y1: 10, x2: CALLE + SENSORES.ancho, y2: 320 }),
    s('defs', null, rayos.map((r) => r.desvanecer)),
    rayos.map((r) => [r.rayo, r.obstaculo, r.toque, r.valor]),
    lugar, decision);

  return {
    g,
    /** `giro`: hacia dónde dobla cuando dobla (1 a la derecha, −1 a la izquierda). */
    actualizar({ entradas, salida, giro = 1 }, fmt) {
      const escena = escenaDeSensores(entradas);
      const x0 = CALLE + escena.posicion;
      lugar.setAttribute('transform', `translate(${x0} ${FRENTE + 30})`);
      rayos.forEach((r, i) => {
        const { distancia, toca } = escena.rayos[i];
        const px = x0 + r.lado * seno * distancia;
        const py = FRENTE - coseno * distancia;
        r.rayo.setAttribute('x1', x0);
        r.rayo.setAttribute('x2', px);
        r.rayo.setAttribute('y2', py);
        // Lectura 0: el rayo llega entero y se desvanece, no termina seco.
        r.rayo.style.stroke = toca === 'nada' ? `url(#${r.idDesvanecer})` : '';
        for (const [k, v] of [['x1', x0], ['y1', FRENTE], ['x2', px], ['y2', py]]) r.desvanecer.setAttribute(k, v);
        // El vehículo apoya la cola en la punta del rayo, sin salirse de la calle.
        const vx = Math.max(CALLE + OBSTACULO.medio + 3, Math.min(CALLE + SENSORES.ancho - OBSTACULO.medio - 3, px + r.lado * 5));
        r.obstaculo.style.display = toca === 'obstaculo' ? '' : 'none';
        r.obstaculo.setAttribute('transform', `translate(${vx} ${py})`);
        r.toque.style.display = toca === 'nada' ? 'none' : '';
        r.toque.setAttribute('cx', px);
        r.toque.setAttribute('cy', py);
        if (toca === 'obstaculo') {
          // El número va arriba del vehículo, centrado: no lo tapa.
          r.valor.setAttribute('text-anchor', 'middle');
          r.valor.setAttribute('x', vx);
          r.valor.setAttribute('y', py - OBSTACULO.largo - 15);
        } else {
          // Se abre hacia su lado; cerca del borde no hay lugar hacia afuera y queda justo adentro.
          r.valor.setAttribute('text-anchor', r.lado < 0 ? 'end' : 'start');
          r.valor.setAttribute('x', r.lado < 0 ? Math.max(CALLE + 52, px + 6) : Math.min(CALLE + SENSORES.ancho - 52, px - 6));
          r.valor.setAttribute('y', Math.max(34, py - 14));
        }
        r.valor.textContent = fmt(entradas[i]);
      });
      coche.classList.toggle('dobla', salida === 1);
      coche.classList.toggle('izquierda', giro < 0);
      flechaGiro.style.display = salida === 1 ? '' : 'none';
      flechaGiro.setAttribute('transform', giro < 0 ? 'scale(-1 1)' : '');
      flechaRecta.style.display = salida === 1 ? 'none' : '';
      decision.textContent = salida !== 1 ? `↑ ${c.figura.sigue}` : giro < 0 ? `← ${c.figura.dobla}` : `→ ${c.figura.dobla}`;
    },
  };
}

/** Diagrama: entradas, pesos, sesgo, neurona, escalón y salida. */
function crearDiagrama(c) {
  const entradas = ENT.map((p, i) => {
    const linea = s('line', { class: 'peso', ...tramoEntre(p, R_ENT + 3, NEU, NEU.r + 3) });
    const medio = { x: p.x + (NEU.x - p.x) * 0.42, y: p.y + (NEU.y - p.y) * 0.42 };
    const pastilla = s('rect', { class: 'pastilla', x: medio.x - 27, y: medio.y - 13, width: 54, height: 26, rx: 13 });
    const peso = s('text', { class: 'pastilla-texto', x: medio.x, y: medio.y + 5, 'text-anchor': 'middle' });
    const nodo = s('circle', { class: 'entrada', cx: p.x, cy: p.y, r: R_ENT });
    const valor = s('text', { class: 'entrada-valor', x: p.x, y: p.y + 6, 'text-anchor': 'middle' });
    const rotulo = s('text', { class: 'rotulo', x: p.x, y: i === 0 ? p.y - 38 : p.y + 48, 'text-anchor': 'middle' });
    return { linea, pastilla, peso, nodo, valor, rotulo, g: s('g', null, linea, pastilla, peso, nodo, valor, rotulo) };
  });

  const sesgoLinea = s('line', { class: 'peso', x1: SES.x, y1: SES.y + 17, x2: NEU.x, y2: NEU.y - NEU.r - 3 });
  const sesgoCaja = s('rect', { class: 'sesgo-caja', x: SES.x - 30, y: SES.y - 16, width: 60, height: 32, rx: 6 });
  const sesgoValor = s('text', { class: 'pastilla-texto', x: SES.x, y: SES.y + 5, 'text-anchor': 'middle' });
  const sesgoRotulo = s('text', { class: 'rotulo', x: SES.x + 40, y: SES.y + 4, 'text-anchor': 'start' });
  const sesgo = s('g', { class: 'capa capa-sesgo' }, sesgoLinea, sesgoCaja, sesgoValor, sesgoRotulo);

  const neurona = s('circle', { class: 'neurona', cx: NEU.x, cy: NEU.y, r: NEU.r });
  const sumaRotulo = s('text', { class: 'neurona-rotulo', x: NEU.x, y: NEU.y - 14, 'text-anchor': 'middle', text: c.figura.suma });
  const sumaValor = s('text', { class: 'neurona-valor', x: NEU.x, y: NEU.y + 16, 'text-anchor': 'middle' });

  const salidaLinea = s('line', { class: 'salida-linea', x1: NEU.x + NEU.r + 3, y1: NEU.y, x2: 662, y2: NEU.y });
  const tecla = s('rect', { class: 'tecla', x: 664, y: NEU.y - 26, width: 52, height: 52, rx: 8 });
  const teclaValor = s('text', { class: 'tecla-valor', x: 690, y: NEU.y + 8, 'text-anchor': 'middle' });
  const teclaRotulo = s('text', { class: 'rotulo', x: 690, y: NEU.y + 48, 'text-anchor': 'middle' });

  // El escalón: a la izquierda del 0 la salida es 0; a la derecha, 1. La marca es la suma de ahora.
  const E = { x: 560, y: 300, medio: 60, alto: 30 };
  const marca = s('circle', { class: 'escalon-marca', r: 6 });
  const escalon = s('g', { class: 'capa capa-escalon' },
    s('line', { class: 'escalon-eje', x1: E.x - E.medio, y1: E.y, x2: E.x + E.medio, y2: E.y }),
    s('line', { class: 'escalon-eje', x1: E.x, y1: E.y - E.alto - 6, x2: E.x, y2: E.y + 4 }),
    s('path', { class: 'escalon-linea', d: `M${E.x - E.medio} ${E.y} H${E.x} V${E.y - E.alto} H${E.x + E.medio}` }),
    marca,
    s('text', { class: 'rotulo', x: E.x, y: E.y + 18, 'text-anchor': 'middle', text: '0' }),
    s('text', { class: 'rotulo', x: E.x + E.medio + 10, y: E.y - E.alto + 4, 'text-anchor': 'start', text: '1' }),
    s('text', { class: 'rotulo', x: E.x - E.medio - 10, y: E.y + 4, 'text-anchor': 'end', text: c.figura.pasaDeCero }));

  const g = s('g', { class: 'esc-diagrama' },
    entradas.map((e) => e.g), sesgo, salidaLinea, neurona, sumaRotulo, sumaValor, tecla, teclaValor, teclaRotulo, escalon);

  return {
    g,
    actualizar(l, fmt) {
      entradas.forEach((e, i) => {
        const w = l.pesos[i];
        e.linea.dataset.signo = signo(w);
        e.linea.style.strokeWidth = grosor(w);
        e.pastilla.dataset.signo = signo(w);
        e.peso.textContent = `× ${fmt(w)}`;
        e.valor.textContent = fmt(l.entradas[i]);
      });
      entradas[0].rotulo.textContent = l.vista === 'and' ? c.figura.entradaIzq : c.figura.sensorIzq;
      entradas[1].rotulo.textContent = l.vista === 'and' ? c.figura.entradaDer : c.figura.sensorDer;
      sesgo.classList.toggle('visible', l.conSesgo);
      sesgoLinea.dataset.signo = signo(l.sesgo);
      sesgoLinea.style.strokeWidth = grosor(l.sesgo);
      sesgoCaja.dataset.signo = signo(l.sesgo);
      sesgoValor.textContent = (l.sesgo >= 0 ? '+ ' : '') + fmt(l.sesgo);
      sesgoRotulo.textContent = l.sesgoNombrado ? c.figura.sesgo : c.figura.siempre;
      escalon.classList.toggle('visible', l.conEscalon);
      const sx = Math.max(-2, Math.min(2, l.suma));
      marca.setAttribute('cx', E.x + (sx / 2) * E.medio);
      marca.setAttribute('cy', l.salida === 1 ? E.y - E.alto : E.y);
      const encendida = l.salida === 1;
      neurona.classList.toggle('encendida', encendida);
      sumaRotulo.classList.toggle('sobre-claro', encendida);
      sumaValor.classList.toggle('sobre-claro', encendida);
      sumaValor.textContent = fmt(l.suma);
      salidaLinea.classList.toggle('encendida', encendida);
      tecla.classList.toggle('encendida', encendida);
      teclaValor.classList.toggle('encendida', encendida);
      teclaValor.textContent = String(l.salida);
      teclaRotulo.textContent = l.vista === 'and'
        ? (encendida ? c.figura.encendida : c.figura.apagada)
        : (encendida ? c.figura.dobla : c.figura.sigue);
    },
  };
}

/**
 * Crea el escenario (un SVG) con el auto y el diagrama. `hueco` es un grupo vacío en el lugar del auto,
 * donde figura.js pone el plano: el plano ocupa el sitio del auto, porque es otra forma de mirar lo
 * mismo que ven los sensores.
 */
export function crearEscenario(c) {
  const auto = crearAuto(c);
  const diagrama = crearDiagrama(c);
  const hueco = s('g', { class: 'esc-plano' });
  const svg = s('svg', { class: 'escenario', viewBox: `0 0 ${ANCHO} ${ALTO}`, role: 'group', 'aria-label': c.figura.titulo }, auto.g, hueco, diagrama.g);
  return {
    svg,
    hueco,
    /**
     * Disposición del dibujo (D5). En ventanas angostas el dibujo entero quedaría ilegible, así que
     * muestra una parte: el diagrama con el auto en chico a su lado o, cuando toca el plano, el plano solo
     * (la cuenta de la neurona sigue escrita debajo de la lámina).
     */
    ajustar({ compacta, plano }) {
      const caja = !compacta ? `0 0 ${ANCHO} ${ALTO}` : plano ? `-36 0 372 ${ALTO}` : `176 22 568 300`;
      if (svg.getAttribute('viewBox') !== caja) svg.setAttribute('viewBox', caja);
      const lugarAuto = compacta && !plano ? 'translate(166 82) scale(0.5)' : '';
      if ((auto.g.getAttribute('transform') || '') !== lugarAuto) auto.g.setAttribute('transform', lugarAuto);
    },
    actualizar(lectura, fmt) {
      auto.actualizar(lectura, fmt);
      diagrama.actualizar(lectura, fmt);
    },
  };
}
