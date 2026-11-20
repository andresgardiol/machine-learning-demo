// Una imagen en SVG por hito de la historia (teoria-prototipos D6, tarea 4.2). Dibujos esquemáticos, con
// los mismos colores con significado que la figura del capítulo: entra = celeste, peso positivo = verde
// agua y continuo, peso negativo = rosa y punteado, decide = blanco, culpa = naranja con rombos. Ninguna
// muestra datos: son dibujos de la idea, y el texto alternativo lo dice.
import { s } from '../comun/dom.js';

const ANCHO = 520;
const ALTO = 360;
const lienzo = (alt, ...hijos) => s('svg', { class: 'hito-imagen', viewBox: `0 0 ${ANCHO} ${ALTO}`, role: 'img', 'aria-label': alt }, hijos);
const texto = (x, y, t, extra = {}) => s('text', { class: 'rotulo', x, y, 'text-anchor': 'middle', text: t, ...extra });
const flecha = (x, y, giro = 0, clase = 'i-decide-relleno') => s('path', { class: clase, d: 'M0 0 L-11 -6 L-11 6 Z', transform: `translate(${x} ${y}) rotate(${giro})` });

/** 1943: la neurona de verdad arriba y, debajo, lo que queda al dejar solo la cuenta. */
function h1943(alt, r) {
  return lienzo(alt,
    // la neurona biológica, apenas insinuada
    s('g', { class: 'i-tenue' },
      s('path', { d: 'M40 48 C80 52 110 70 176 88 M34 96 C70 96 120 98 172 100 M44 150 C90 140 130 124 178 112 M60 30 C76 40 84 50 96 58 M52 128 C70 124 86 122 100 120' }),
      s('path', { d: 'M178 100 C176 70 214 62 236 76 C262 92 256 126 226 130 C198 134 180 124 178 100 Z' }),
      s('path', { d: 'M254 102 C300 96 330 112 372 102 S440 96 470 100 M470 100 l22 -14 M470 100 l24 2 M470 100 l20 16' })),
    // conectores punteados entre cada parte y su abstracción
    [[60, 150, 212], [214, 136, 222], [440, 110, 240]].map(([x, y1, y2]) => s('line', { class: 'i-guia', x1: x, y1, x2: x, y2 })),
    // la abstracción: dos entradas que valen 0 o 1, un umbral y una salida
    [[236, '1'], [304, '1']].map(([y, v]) => [
      s('line', { class: 'i-senal', x1: 84, y1: y, x2: 176, y2: 270 + (y - 270) * 0.3 }), // señales, no pesos: en 1943 todas valen lo mismo
      s('circle', { class: 'i-entra', cx: 60, cy: y, r: 22 }),
      s('text', { class: 'i-numero', x: 60, y: y + 7, 'text-anchor': 'middle', text: v }),
    ]),
    s('circle', { class: 'i-neurona-encendida', cx: 214, cy: 270, r: 40 }),
    s('text', { class: 'i-numero i-sobre-claro', x: 214, y: 278, 'text-anchor': 'middle', text: '≥ 2' }),
    texto(214, 334, r.umbral),
    s('line', { class: 'i-decide', x1: 258, y1: 270, x2: 404, y2: 270 }), flecha(416, 270),
    s('rect', { class: 'i-tecla', x: 420, y: 246, width: 48, height: 48, rx: 8 }),
    s('text', { class: 'i-numero', x: 444, y: 278, 'text-anchor': 'middle', text: '1' }),
    texto(444, 318, r.dispara));
}

/** 1958: el Mark I. Una grilla de fotoceldas, cables y pesos en perillas que mueve un motor. */
function h1958(alt, r) {
  const letra = ['01111100', '01000000', '01000000', '01111000', '01000000', '01000000', '01111100', '00000000'];
  const celdas = letra.flatMap((fila, j) => [...fila].map((v, i) => s('rect', {
    class: v === '1' ? 'i-celda i-celda-luz' : 'i-celda', x: 30 + i * 19, y: 90 + j * 19, width: 15, height: 15, rx: 2,
  })));
  const perillas = [[300, 104, 40, 'pos'], [300, 182, -110, 'neg'], [300, 260, 80, 'pos']].map(([x, y, giro, signo]) => [
    s('path', { class: 'i-cable', d: `M186 ${166 + (y - 182) * 0.5} C230 ${166 + (y - 182) * 0.5} 240 ${y} 272 ${y}` }),
    s('line', { class: `i-${signo}`, x1: 326, y1: y, x2: 388, y2: 182 + (y - 182) * 0.25 }),
    s('circle', { class: 'i-perilla', cx: x, cy: y, r: 24 }),
    s('line', { class: 'i-aguja', x1: x, y1: y, x2: x, y2: y - 17, transform: `rotate(${giro} ${x} ${y})` }),
    s('rect', { class: 'i-motor', x: x - 9, y: y + 26, width: 18, height: 10, rx: 2 }),
  ]);
  return lienzo(alt, celdas, perillas,
    s('circle', { class: 'i-neurona-encendida', cx: 416, cy: 182, r: 28 }),
    s('line', { class: 'i-decide', x1: 446, y1: 182, x2: 478, y2: 182 }), flecha(490, 182),
    texto(104, 268, r.fotoceldas), texto(300, 326, r.perillas));
}

/** 1969: el XOR. Cuatro puntos y ninguna recta que los separe. */
function h1969(alt, r) {
  const x = (v) => 150 + v * 220;
  const y = (v) => 270 - v * 220;
  const cruz = (px, py) => s('text', { class: 'i-error', x: px, y: py, 'text-anchor': 'middle', text: '✕' });
  return lienzo(alt,
    s('rect', { class: 'i-plano', x: 100, y: 20, width: 320, height: 300, rx: 6 }),
    s('line', { class: 'i-intento', x1: 110, y1: 200, x2: 410, y2: 76 }), cruz(412, 66),
    s('line', { class: 'i-intento', x1: 250, y1: 30, x2: 280, y2: 310 }), cruz(292, 312),
    s('line', { class: 'i-intento', x1: 110, y1: 110, x2: 410, y2: 250 }), cruz(412, 272),
    [[0, 0], [1, 1]].map(([a, b]) => s('rect', { class: 'i-clase-0', x: x(a) - 13, y: y(b) - 13, width: 26, height: 26, rx: 3 })),
    [[0, 1], [1, 0]].map(([a, b]) => s('circle', { class: 'i-clase-1', cx: x(a), cy: y(b), r: 14 })),
    texto(260, 348, r.ningunaRecta));
}

/** Años 70: el primer invierno. Una red chica, apagada y desenchufada, bajo la nieve. */
function h1970(alt, r) {
  const copos = [[70, 50], [150, 96], [236, 40], [330, 84], [420, 46], [470, 130], [48, 170], [392, 190], [286, 150], [120, 214]];
  const nodos = [[190, 150], [190, 230], [300, 190]];
  return lienzo(alt,
    copos.map(([cx, cy], i) => s('path', {
      class: 'i-copo', transform: `translate(${cx} ${cy}) scale(${i % 3 === 0 ? 1.3 : 0.9})`,
      d: 'M0 -9 V9 M-8 -4.5 L8 4.5 M-8 4.5 L8 -4.5',
    })),
    s('line', { class: 'i-apagada', x1: 208, y1: 156, x2: 282, y2: 184 }),
    s('line', { class: 'i-apagada', x1: 208, y1: 224, x2: 282, y2: 196 }),
    nodos.map(([cx, cy]) => s('circle', { class: 'i-nodo-apagado', cx, cy, r: 18 })),
    // el cable, con el enchufe suelto
    s('path', { class: 'i-cable', d: 'M318 190 C360 190 356 250 392 252' }),
    s('rect', { class: 'i-enchufe', x: 392, y: 243, width: 22, height: 18, rx: 4 }),
    s('path', { class: 'i-cable', d: 'M414 248 h9 M414 256 h9' }),
    s('rect', { class: 'i-enchufe', x: 446, y: 236, width: 14, height: 32, rx: 3 }),
    texto(420, 292, r.pausa),
    // la nieve acumulada
    s('path', { class: 'i-nieve', d: 'M0 322 C60 300 120 312 180 304 C240 296 280 316 340 306 C400 296 460 312 520 300 V360 H0 Z' }),
    // y un poco sobre cada neurona
    nodos.map(([cx, cy]) => s('path', { class: 'i-nieve', d: `M${cx - 17} ${cy - 8} C${cx - 14} ${cy - 27} ${cx + 14} ${cy - 27} ${cx + 17} ${cy - 8} C${cx + 8} ${cy - 14} ${cx - 8} ${cy - 14} ${cx - 17} ${cy - 8} Z` })));
}

/** 1986: la cuenta va hacia adelante y el error vuelve hacia atrás, capa por capa. */
function h1986(alt, r) {
  const capas = [[[80, 120], [80, 240]], [[250, 80], [250, 180], [250, 280]], [[420, 180]]];
  const lineas = [];
  for (let k = 0; k < capas.length - 1; k++) {
    for (const [ax, ay] of capas[k]) for (const [bx, by] of capas[k + 1]) lineas.push(s('line', { class: 'i-adelante', x1: ax + 20, y1: ay, x2: bx - 20, y2: by }));
  }
  const vuelta = (d) => s('path', { class: 'i-culpa', d });
  return lienzo(alt,
    lineas,
    capas[0].map(([cx, cy]) => s('circle', { class: 'i-entra', cx, cy, r: 18 })),
    capas[1].map(([cx, cy]) => [s('circle', { class: 'i-nodo', cx, cy, r: 18 }), s('rect', { class: 'i-culpa-rombo', x: -6, y: -6, width: 12, height: 12, transform: `translate(${cx} ${cy - 30}) rotate(45)` })]),
    s('circle', { class: 'i-neurona-encendida', cx: 420, cy: 180, r: 20 }),
    s('rect', { class: 'i-culpa-rombo', x: -8, y: -8, width: 16, height: 16, transform: 'translate(420 142) rotate(45)' }),
    // adelante, arriba
    s('line', { class: 'i-decide', x1: 120, y1: 34, x2: 388, y2: 34 }), flecha(400, 34),
    texto(260, 24, r.adelante),
    // atrás, abajo
    vuelta('M420 206 V298 Q420 322 396 322 H106'), flecha(94, 322, 180, 'i-culpa-relleno'),
    texto(260, 348, r.atras));
}

const DIBUJOS = { h1943, h1958, h1969, h1970, h1986 };

/** El SVG del hito `id`, con su texto alternativo y sus rótulos en el idioma de `c`. */
export const imagenDelHito = (id, c) => DIBUJOS[id](c.historia.imagenes[id], c.historia.rotulos);
