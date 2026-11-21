// Una imagen en SVG por hito de la historia (seccion-teoria D8; las cinco primeras vienen de
// teoria-prototipos D6). Dibujos esquemáticos, con
// los mismos colores con significado que la figura del capítulo: entra = celeste, peso positivo = verde
// agua y continuo, peso negativo = rosa y punteado, decide = blanco, culpa = naranja con rombos. Ninguna
// muestra datos: son dibujos de la idea, y el texto alternativo lo dice.
import { s } from '../dom.js';

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

const NEVADA = 'M0 322 C60 300 120 312 180 304 C240 296 280 316 340 306 C400 296 460 312 520 300 V360 H0 Z';
const copo = ([cx, cy], i) => s('path', {
  class: 'i-copo', transform: `translate(${cx} ${cy}) scale(${i % 3 === 0 ? 1.3 : 0.9})`,
  d: 'M0 -9 V9 M-8 -4.5 L8 4.5 M-8 4.5 L8 -4.5',
});

/** Fines de los 80: el segundo invierno. Una pila de reglas escritas a mano que se cae bajo la nieve. */
function h1987(alt, r) {
  const copos = [[60, 44], [150, 70], [262, 36], [330, 70], [436, 48], [478, 160], [36, 150], [300, 214], [474, 262], [44, 236]];
  // Una regla: "si (algo) → (algo)", sin palabras.
  const tarjeta = (x, y, giro = 0) => s('g', { transform: `translate(${x} ${y}) rotate(${giro})` },
    s('rect', { class: 'i-tarjeta', x: -78, y: -11, width: 156, height: 22, rx: 4 }),
    s('rect', { class: 'i-motor', x: -68, y: -4, width: 14, height: 8, rx: 2 }),
    s('line', { class: 'i-renglon', x1: -46, y1: 0, x2: -6, y2: 0 }),
    s('path', { class: 'i-decide-relleno', d: 'M12 0 L3 -5 L3 5 Z' }),
    s('line', { class: 'i-renglon', x1: 22, y1: 0, x2: 64, y2: 0 }));
  return lienzo(alt,
    copos.map(copo),
    Array.from({ length: 7 }, (_, i) => tarjeta(170 + (i % 2 ? 7 : -5), 286 - i * 26)),
    // las que ya no se sostienen
    tarjeta(368, 178, 22), tarjeta(408, 238, -15),
    // nieve sobre la pila y en el piso
    s('path', { class: 'i-nieve', d: 'M90 121 C112 98 228 98 250 121 C220 112 120 112 90 121 Z' }),
    texto(386, 120, r.reglas), texto(404, 286, r.caro),
    s('path', { class: 'i-nieve', d: NEVADA }));
}

/** 1997: Deep Blue. Un tablero y un árbol de jugadas con puntajes: busca y puntúa, no aprende jugando. */
function h1997(alt, r) {
  const B = { x: 28, y: 98, c: 36 };
  const casillas = [];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    casillas.push(s('rect', { class: (i + j) % 2 ? 'i-casilla-oscura' : 'i-casilla-clara', x: B.x + i * B.c, y: B.y + j * B.c, width: B.c, height: B.c }));
  }
  const centro = (i, j) => `translate(${B.x + (i + 0.5) * B.c} ${B.y + (j + 0.5) * B.c})`;
  const rey = s('g', { class: 'i-pieza-blanca', transform: centro(1, 2) },
    s('path', { d: 'M-9 13 H9 L6 -1 H-6 Z' }), s('circle', { cx: 0, cy: -5, r: 5 }), s('path', { class: 'i-pieza-cruz', d: 'M0 -17 V-10 M-4 -14 H4' }));
  const peon = s('g', { class: 'i-pieza-negra', transform: centro(2, 0) },
    s('path', { d: 'M-8 13 H8 L4 1 H-4 Z' }), s('circle', { cx: 0, cy: -3, r: 6 }));
  // El árbol: la posición de ahora, tres jugadas posibles y las respuestas a cada una, con su puntaje.
  const raiz = [250, 170];
  const jugadas = [[330, 90], [330, 170], [330, 250]];
  const hojas = [[[420, 64, '+3'], [420, 116, '−1']], [[420, 144, '+5'], [420, 196, '+2']], [[420, 224, '0'], [420, 276, null]]];
  const nodo = ([x, y], clase = 'i-posicion') => s('rect', { class: clase, x: x - 8, y: y - 8, width: 16, height: 16, rx: 3 });
  const rama = (a, b, clase = 'i-rama') => s('line', { class: clase, x1: a[0] + 8, y1: a[1], x2: b[0] - 8, y2: b[1] });
  return lienzo(alt,
    s('rect', { class: 'i-plano', x: B.x - 6, y: B.y - 6, width: B.c * 4 + 12, height: B.c * 4 + 12, rx: 6 }),
    casillas, rey, peon,
    s('line', { class: 'i-cable', x1: 186, y1: 170, x2: 236, y2: 170 }),
    jugadas.map((j, k) => rama(raiz, j, k === 1 ? 'i-decide' : 'i-rama')),
    hojas.flatMap((par, k) => par.map(([x, y, puntaje]) => [
      rama(jugadas[k], [x, y], puntaje == null ? 'i-apagada' : 'i-rama'),
      nodo([x, y], puntaje == null ? 'i-posicion i-posicion-podada' : 'i-posicion'),
      puntaje == null ? null : s('text', { class: 'i-puntaje', x: x + 18, y: y + 5, text: puntaje }),
    ])),
    nodo(raiz, 'i-posicion i-posicion-elegida'),
    jugadas.map((j, k) => nodo(j, k === 1 ? 'i-posicion i-posicion-elegida' : 'i-posicion')),
    texto(350, 34, r.busca), texto(300, 330, r.formula));
}

/** 1998: LeNet. Una ventana recorre el número escrito a mano; al final se enciende una de diez salidas. */
function h1998(alt, r) {
  const numero = ['00111100', '01000010', '00000010', '00011100', '00000010', '00000010', '01000010', '00111100'];
  const celdas = numero.flatMap((fila, j) => [...fila].map((v, i) => s('rect', {
    class: v === '1' ? 'i-celda i-celda-luz' : 'i-celda', x: 24 + i * 19, y: 96 + j * 19, width: 15, height: 15, rx: 2,
  })));
  const mapas = (x, y, lado, paso) => [2, 1, 0].map((k) => s('rect', { class: 'i-mapa', x: x + k * paso, y: y - k * paso, width: lado, height: lado, rx: 4 }));
  const salidas = Array.from({ length: 10 }, (_, k) => {
    const y = 40 + k * 26;
    const esta = k === 3;
    return [
      s('rect', { class: esta ? 'i-tecla' : 'i-mapa', x: 430, y, width: 34, height: 20, rx: 4 }),
      s('text', { class: esta ? 'i-salida-texto i-salida-encendida' : 'i-salida-texto', x: 447, y: y + 15, 'text-anchor': 'middle', text: String(k) }),
    ];
  });
  return lienzo(alt, celdas,
    // la ventana que recorre la imagen, y a dónde va lo que ve
    s('rect', { class: 'i-ventana', x: 79, y: 132, width: 57, height: 57, rx: 3 }),
    s('line', { class: 'i-guia', x1: 136, y1: 132, x2: 222, y2: 148 }), s('line', { class: 'i-guia', x1: 136, y1: 189, x2: 222, y2: 160 }),
    mapas(206, 128, 64, 10), s('rect', { class: 'i-ventana', x: 216, y: 146, width: 14, height: 14, rx: 2 }),
    s('line', { class: 'i-cable', x1: 296, y1: 160, x2: 316, y2: 160 }),
    mapas(322, 140, 40, 8),
    s('line', { class: 'i-decide', x1: 384, y1: 156, x2: 416, y2: 130 }), flecha(425, 123, -38),
    salidas,
    texto(98, 274, r.partes), texto(294, 222, r.capas), texto(418, 330, r.lee));
}

/** 2012: AlexNet. Muchas fotos, muchas capas y dos placas gráficas haciendo las cuentas. */
function h2012(alt, r) {
  const fotos = [];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    fotos.push(s('rect', { class: (i * 3 + j * 5) % 4 === 0 ? 'i-foto i-foto-luz' : 'i-foto', x: 27 + i * 26, y: 95 + j * 26, width: 21, height: 21, rx: 3 }));
  }
  const capas = Array.from({ length: 8 }, (_, k) => ({ x: 178 + k * 30, alto: 200 - k * 22 }));
  const placa = (x) => [
    s('rect', { class: 'i-placa', x, y: 290, width: 124, height: 34, rx: 5 }),
    [30, 64].map((dx) => [s('circle', { class: 'i-ventilador', cx: x + dx, cy: 307, r: 11 }), s('path', { class: 'i-aspa', d: `M${x + dx - 7} 307 H${x + dx + 7} M${x + dx} 300 V314` })]),
    s('rect', { class: 'i-motor', x: x + 88, y: 301, width: 26, height: 12, rx: 2 }),
  ];
  return lienzo(alt,
    [2, 1].map((k) => s('rect', { class: 'i-mapa', x: 20 + k * 7, y: 88 - k * 7, width: 112, height: 112, rx: 5 })),
    s('rect', { class: 'i-mapa i-mapa-frente', x: 20, y: 88, width: 112, height: 112, rx: 5 }), fotos,
    s('line', { class: 'i-cable', x1: 148, y1: 170, x2: 170, y2: 170 }),
    capas.slice(0, -1).map((c, k) => {
      const d = capas[k + 1];
      return [-1, 1].map((lado) => s('line', { class: 'i-adelante', x1: c.x + 16, y1: 170 + lado * c.alto / 2, x2: d.x, y2: 170 + lado * d.alto / 2 }));
    }),
    capas.map((c) => s('rect', { class: 'i-capa', x: c.x, y: 170 - c.alto / 2, width: 16, height: c.alto, rx: 4 })),
    s('line', { class: 'i-decide', x1: 410, y1: 170, x2: 438, y2: 170 }), flecha(450, 170),
    s('rect', { class: 'i-tecla', x: 454, y: 148, width: 44, height: 44, rx: 8 }),
    placa(172), placa(312),
    texto(80, 228, r.fotos), texto(292, 46, r.capas), texto(304, 348, r.placas));
}

/** 2016: AlphaGo. Un tablero de go; una red propone dónde jugar y otra dice qué tan buena es la posición. */
function h2016(alt, r) {
  const T = { x: 36, y: 80, paso: 26, n: 7 };
  const en = (i, j) => [T.x + i * T.paso, T.y + j * T.paso];
  const reja = Array.from({ length: T.n }, (_, k) => [
    s('line', { class: 'i-reja', x1: T.x, y1: T.y + k * T.paso, x2: T.x + (T.n - 1) * T.paso, y2: T.y + k * T.paso }),
    s('line', { class: 'i-reja', x1: T.x + k * T.paso, y1: T.y, x2: T.x + k * T.paso, y2: T.y + (T.n - 1) * T.paso }),
  ]);
  const piedra = (clase) => ([i, j]) => { const [cx, cy] = en(i, j); return s('circle', { class: clase, cx, cy, r: 10 }); };
  const red = (x, y) => {
    const ent = [[x, y + 12], [x, y + 48]];
    const med = [[x + 40, y], [x + 40, y + 30], [x + 40, y + 60]];
    const sal = [x + 80, y + 30];
    return [
      ent.flatMap(([ax, ay]) => med.map(([bx, by]) => s('line', { class: 'i-adelante', x1: ax, y1: ay, x2: bx, y2: by }))),
      med.map(([ax, ay]) => s('line', { class: 'i-adelante', x1: ax, y1: ay, x2: sal[0], y2: sal[1] })),
      ent.map(([cx, cy]) => s('circle', { class: 'i-entra i-chico', cx, cy, r: 7 })),
      med.map(([cx, cy]) => s('circle', { class: 'i-nodo i-chico', cx, cy, r: 7 })),
      s('circle', { class: 'i-neurona-encendida', cx: sal[0], cy: sal[1], r: 8 }),
    ];
  };
  const [px, py] = en(4, 1);
  return lienzo(alt,
    s('rect', { class: 'i-tablero', x: T.x - 16, y: T.y - 16, width: (T.n - 1) * T.paso + 32, height: (T.n - 1) * T.paso + 32, rx: 6 }),
    reja,
    [[1, 1], [2, 3], [4, 2], [3, 5], [5, 4]].map(piedra('i-piedra-negra')),
    [[2, 2], [3, 3], [4, 4], [1, 4], [5, 2]].map(piedra('i-piedra-blanca')),
    // la jugada que propone la primera red
    s('circle', { class: 'i-candidata', cx: px, cy: py, r: 11 }),
    s('path', { class: 'i-decide i-sin-relleno', d: `M300 100 C260 100 220 ${py} ${px + 26} ${py}` }), flecha(px + 15, py, 180),
    red(306, 70),
    // lo que dice la segunda: un número para la posición entera
    red(306, 196),
    s('line', { class: 'i-decide', x1: 396, y1: 226, x2: 410, y2: 226 }),
    s('rect', { class: 'i-mapa', x: 412, y: 218, width: 84, height: 16, rx: 8 }),
    s('rect', { class: 'i-neurona-encendida', x: 412, y: 218, width: 56, height: 16, rx: 8 }),
    texto(370, 158, r.propone), texto(380, 284, r.evalua));
}

/** 2017: el Transformer. Una palabra mira a todas las demás, a unas más que a otras: la atención. */
function h2017(alt, r) {
  const xs = [60, 160, 260, 360, 460];
  const Y = 240;
  const foco = 2;
  const cuanto = [2, 7, 0, 3, 5];
  const arco = (a, b) => `M${a} ${Y - 20} Q${(a + b) / 2} ${Y - 40 - Math.abs(b - a) * 0.55} ${b} ${Y - 20}`;
  const tenues = [];
  for (let i = 0; i < xs.length; i++) for (let j = i + 1; j < xs.length; j++) {
    if (i !== foco && j !== foco) tenues.push(s('path', { class: 'i-guia i-sin-relleno', d: arco(xs[i], xs[j]) }));
  }
  return lienzo(alt,
    tenues,
    xs.map((x, i) => (i === foco ? null : s('path', { class: 'i-pos i-sin-relleno', d: arco(xs[foco], x), style: `stroke-width: ${cuanto[i]}px` }))),
    xs.map((x, i) => [
      s('rect', { class: i === foco ? 'i-ficha i-ficha-foco' : 'i-ficha', x: x - 44, y: Y - 18, width: 88, height: 36, rx: 18 }),
      s('text', { class: 'i-ficha-texto', x, y: Y + 6, 'text-anchor': 'middle', text: r.palabras[i] }),
    ]),
    texto(260, 316, r.atencion));
}

/** 2022: los modelos de lenguaje. Una conversación en la que la respuesta se escribe de a una palabra. */
function h2022(alt, r) {
  const palabra = ([x, y, ancho]) => s('rect', { class: 'i-palabra', x, y, width: ancho, height: 18, rx: 9 });
  return lienzo(alt,
    s('rect', { class: 'i-plano', x: 70, y: 22, width: 380, height: 262, rx: 12 }),
    // lo que escribe la persona
    s('rect', { class: 'i-burbuja-vos', x: 252, y: 40, width: 180, height: 46, rx: 14 }),
    s('line', { class: 'i-renglon', x1: 270, y1: 56, x2: 412, y2: 56 }), s('line', { class: 'i-renglon', x1: 270, y1: 70, x2: 372, y2: 70 }),
    // la respuesta, palabra por palabra
    s('rect', { class: 'i-burbuja', x: 88, y: 104, width: 304, height: 84, rx: 14 }),
    [[104, 120, 52], [162, 120, 70], [238, 120, 40], [284, 120, 64], [104, 150, 60], [170, 150, 44]].map(palabra),
    s('rect', { class: 'i-hueco', x: 220, y: 148, width: 66, height: 22, rx: 11 }),
    s('text', { class: 'i-ficha-texto', x: 253, y: 164, 'text-anchor': 'middle', text: '?' }),
    // las candidatas para ese hueco: una barra por palabra posible
    [[1, 'i-neurona-encendida'], [0.55, 'i-barra'], [0.3, 'i-barra']].map(([p, clase], k) => [
      s('rect', { class: 'i-palabra', x: 250, y: 208 + k * 22, width: 46, height: 14, rx: 7 }),
      s('rect', { class: clase, x: 304, y: 208 + k * 22, width: 120 * p, height: 14, rx: 7 }),
    ]),
    s('path', { class: 'i-decide i-sin-relleno', d: 'M240 215 C214 215 214 196 232 182' }), flecha(238, 177, -40),
    texto(260, 322, r.siguiente));
}

const DIBUJOS = { h1943, h1958, h1969, h1970, h1986, h1987, h1997, h1998, h2012, h2016, h2017, h2022 };

/** El SVG del hito `id`, con su texto alternativo y sus rótulos en el idioma de `c`. */
export const imagenDelHito = (id, c) => DIBUJOS[id](c.historia.imagenes[id], c.historia.rotulos);
