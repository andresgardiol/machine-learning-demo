// Dibujo del plano (teoria-prototipos D3 y D4): la misma neurona vista como una recta. Eje horizontal:
// la entrada izquierda; eje vertical: la derecha. La zona clara es donde la suma pasa de cero; su borde
// es la recta w1·x + w2·y + sesgo = 0, que sale de cuenta.js con los mismos pesos y el mismo sesgo.
//
// SVG propio y no src/render/plane-view.js: ese módulo pinta en un lienzo una grilla de respuestas de 0
// a 1 pensada para el Laboratorio; acá hace falta una recta exacta y puntos que se enfocan con Tab.
//
// Dos modos: 'plano' (un punto que se arrastra: lo que ven los sensores) y 'and' (los cuatro casos del
// AND, cada uno con su forma: círculo si tiene que dar 1, cuadrado si tiene que dar 0, y ✓ o ✕).

import { s, rellenar } from '../comun/dom.js';
import { rectaDelPlano, tramoEnCaja } from './cuenta.js';
import { zonaEncendida } from './zona.js';

const CAJA = { xMin: -0.25, xMax: 1.25, yMin: -0.25, yMax: 1.25 };
const X0 = 52;
const Y0 = 22;
const LADO = 236;
const PASO = 0.05;

const px = (x) => X0 + ((x - CAJA.xMin) / (CAJA.xMax - CAJA.xMin)) * LADO;
const py = (y) => Y0 + LADO - ((y - CAJA.yMin) / (CAJA.yMax - CAJA.yMin)) * LADO;
const acotar = (v) => Math.max(0, Math.min(1, Math.round(v / PASO) * PASO));

/**
 * @param {SVGGElement} g grupo donde se dibuja (el hueco del escenario)
 * @param {{c: object, alMover: (entradas: number[]) => void, alElegir: (indice: number) => void,
 *   descripciones: {punto: string, and: string}}} opciones
 *   descripciones: ids de los textos (ocultos) que describen el punto y los casos
 */
export function crearPlano(g, { c, alMover, alElegir, descripciones }) {
  const svg = () => g.ownerSVGElement;
  const zona = s('polygon', { class: 'plano-zona' });
  const recta = s('line', { class: 'plano-recta' });
  const lado1 = s('text', { class: 'plano-lado', 'text-anchor': 'middle', text: '1' });
  const lado0 = s('text', { class: 'plano-lado plano-lado-0', 'text-anchor': 'middle', text: '0' });
  const ejeX = s('text', { class: 'rotulo', x: X0 + LADO / 2, y: Y0 + LADO + 44, 'text-anchor': 'middle' });
  const ejeY = s('text', { class: 'rotulo', transform: `translate(14 ${Y0 + LADO / 2}) rotate(-90)`, 'text-anchor': 'middle' });

  const guias = [0, 1].flatMap((v) => [
    s('line', { class: 'plano-guia', x1: px(v), y1: Y0, x2: px(v), y2: Y0 + LADO }),
    s('line', { class: 'plano-guia', x1: X0, y1: py(v), x2: X0 + LADO, y2: py(v) }),
    s('text', { class: 'rotulo', x: px(v), y: Y0 + LADO + 18, 'text-anchor': 'middle', text: String(v) }),
    s('text', { class: 'rotulo', x: X0 - 10, y: py(v) + 4, 'text-anchor': 'end', text: String(v) }),
  ]);

  // El punto de lo que ven los sensores: se arrastra o se mueve con las flechas.
  const punto = s('g', { class: 'plano-punto', tabindex: 0, role: 'slider', 'aria-label': c.figura.punto.rotulo, 'aria-describedby': descripciones.punto },
    s('circle', { class: 'plano-punto-zona', r: 20 }),
    s('circle', { class: 'plano-punto-foco', r: 15 }),
    s('circle', { class: 'plano-punto-marca', r: 9 }));
  let arrastrando = false;
  const aPlano = (e) => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg().getScreenCTM().inverse());
    const x = CAJA.xMin + ((p.x - X0) / LADO) * (CAJA.xMax - CAJA.xMin);
    const y = CAJA.yMin + ((Y0 + LADO - p.y) / LADO) * (CAJA.yMax - CAJA.yMin);
    return [acotar(x), acotar(y)];
  };
  punto.addEventListener('pointerdown', (e) => {
    arrastrando = true;
    punto.setPointerCapture(e.pointerId);
    e.preventDefault();
    punto.focus({ preventScroll: true });
  });
  punto.addEventListener('pointermove', (e) => { if (arrastrando) alMover(aPlano(e)); });
  const soltar = () => { arrastrando = false; };
  punto.addEventListener('pointerup', soltar);
  punto.addEventListener('pointercancel', soltar);
  let actual = [0, 0];
  punto.addEventListener('keydown', (e) => {
    const d = { ArrowLeft: [-PASO, 0], ArrowRight: [PASO, 0], ArrowUp: [0, PASO], ArrowDown: [0, -PASO] }[e.key];
    if (!d) return;
    e.preventDefault();
    alMover([acotar(actual[0] + d[0]), acotar(actual[1] + d[1])]);
  });

  // Los cuatro casos del AND.
  const casos = [[0, 0], [0, 1], [1, 0], [1, 1]].map(([x, y], i) => {
    const esperada = x === 1 && y === 1 ? 1 : 0;
    const forma = esperada === 1
      ? s('circle', { class: 'caso-forma caso-1', r: 11 })
      : s('rect', { class: 'caso-forma caso-0', x: -10, y: -10, width: 20, height: 20, rx: 2 });
    const veredicto = s('text', { class: 'caso-veredicto', x: 17, y: -11 });
    const caso = s('g', { class: 'caso', tabindex: 0, role: 'button', 'aria-describedby': descripciones.and, transform: `translate(${px(x)} ${py(y)})` },
      s('circle', { class: 'plano-punto-zona', r: 22 }),
      s('circle', { class: 'caso-elegido', r: 19 }),
      forma, veredicto);
    caso.addEventListener('click', () => alElegir(i));
    caso.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); alElegir(i); }
    });
    return { caso, veredicto, esperada, x, y };
  });
  const grupoCasos = s('g', { class: 'plano-casos' }, casos.map((k) => k.caso));

  g.append(
    s('rect', { class: 'plano-fondo', x: X0, y: Y0, width: LADO, height: LADO, rx: 4 }),
    zona, ...guias, recta, lado1, lado0, ejeX, ejeY, grupoCasos, punto);

  return {
    /** Dibuja el plano con la lectura de ahora. Devuelve una nota para mostrar debajo, o ''. */
    actualizar(l, fmt) {
      const valores = { pesos: l.pesos, sesgo: l.sesgo };
      const visible = l.vista === 'plano' || l.vista === 'and';
      // Lo que no se ve tampoco se enfoca.
      punto.setAttribute('tabindex', l.vista === 'plano' ? 0 : -1);
      casos.forEach((k) => k.caso.setAttribute('tabindex', l.vista === 'and' ? 0 : -1));
      g.setAttribute('aria-hidden', visible ? 'false' : 'true');

      zona.setAttribute('points', zonaEncendida(valores, CAJA).map(([x, y]) => `${px(x)},${py(y)}`).join(' '));
      const r = rectaDelPlano(valores);
      const tramo = tramoEnCaja(r, CAJA);
      recta.style.display = tramo ? '' : 'none';
      lado1.style.display = lado0.style.display = tramo ? '' : 'none';
      let nota = '';
      if (tramo) {
        const [[ax, ay], [bx, by]] = tramo;
        recta.setAttribute('x1', px(ax)); recta.setAttribute('y1', py(ay));
        recta.setAttribute('x2', px(bx)); recta.setAttribute('y2', py(by));
        // "1" y "0" a cada lado de la recta, según la normal (que apunta al lado que se enciende).
        const mx = px(ax) + (px(bx) - px(ax)) * 0.22;
        const my = py(ay) + (py(by) - py(ay)) * 0.22;
        const n = Math.hypot(r.normal[0], r.normal[1]);
        const nx = (r.normal[0] / n) * 16;
        const ny = (-r.normal[1] / n) * 16;
        lado1.setAttribute('x', mx + nx); lado1.setAttribute('y', my + ny + 5);
        lado0.setAttribute('x', mx - nx); lado0.setAttribute('y', my - ny + 5);
      } else {
        const salida = l.pesos[0] * 0.5 + l.pesos[1] * 0.5 + l.sesgo > 0 ? 1 : 0;
        nota = rellenar(r.tipo === 'ninguna' ? c.figura.sinRecta : c.figura.rectaFuera, { salida: r.tipo === 'ninguna' ? r.salida : salida });
      }

      const esAnd = l.vista === 'and';
      ejeX.textContent = esAnd ? c.figura.entradaIzq : c.figura.sensorIzq;
      ejeY.textContent = esAnd ? c.figura.entradaDer : c.figura.sensorDer;
      punto.style.display = l.vista === 'and' ? 'none' : '';
      grupoCasos.style.display = esAnd ? '' : 'none';
      actual = l.entradas.slice();
      punto.setAttribute('transform', `translate(${px(l.entradas[0])} ${py(l.entradas[1])})`);
      punto.setAttribute('aria-valuetext', rellenar(c.figura.punto.valor, { x1: fmt(l.entradas[0]), x2: fmt(l.entradas[1]) }));
      casos.forEach((k, i) => {
        const caso = l.and[i];
        k.caso.classList.toggle('bien', caso.bien);
        k.caso.classList.toggle('elegido', i === l.elegido);
        k.caso.setAttribute('aria-pressed', i === l.elegido ? 'true' : 'false');
        k.veredicto.textContent = caso.bien ? '✓' : '✕';
        k.caso.setAttribute('aria-label', rellenar(c.figura.and.punto, {
          x1: k.x, x2: k.y, esperada: k.esperada, salida: caso.salida, veredicto: caso.bien ? c.figura.and.bien : c.figura.and.mal,
        }));
      });
      return visible ? nota : '';
    },
  };
}
