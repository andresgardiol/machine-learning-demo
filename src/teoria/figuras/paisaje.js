// El error como paisaje (seccion-teoria D12; lo comparten "Medir el error", "Corregir un poco cada vez" y
// "Aprender por evolución"): la curva del error contra un número y el mapa del error contra dos pesos.
// Solo dibuja: los puntos de la curva y la grilla del mapa los da la cuenta del capítulo.
//
// La curva es una línea blanca; la bolita, un círculo blanco con borde; los pasos que dio, un trazo a
// rayas con un punto hueco en cada parada; la pendiente, una recta naranja con una punta de flecha hacia
// donde el error baja. El mapa es un plano de curvas de nivel: cada franja es un escalón de error, más
// oscura cuanto más bajo, y el fondo lleva una cruz.

import { s } from '../dom.js';

const acotar = (v, a, b) => Math.max(a, Math.min(b, v));

/**
 * Una curva dentro de una caja del dibujo.
 * @param {{caja: {x: number, y: number, ancho: number, alto: number}, clase?: string}} opciones
 */
export function crearCurva({ caja, clase = '' }) {
  const { x, y, ancho, alto } = caja;
  const fondo = s('rect', { class: 'plano-fondo', x, y, width: ancho, height: alto, rx: 4 });
  const meta = s('line', { class: 'paisaje-meta', x1: x, x2: x + ancho });
  const metaTexto = s('text', { class: 'rotulo paisaje-meta-texto', x: x + ancho - 6, 'text-anchor': 'end' });
  const linea = s('path', { class: 'paisaje-curva' });
  const camino = s('path', { class: 'paisaje-camino' });
  const paradas = s('g', { class: 'paisaje-paradas' });
  const tangente = s('line', { class: 'paisaje-pendiente' });
  const punta = s('path', { class: 'paisaje-punta', d: 'M0 -6 L11 0 L0 6 Z' });
  const bolita = s('circle', { class: 'paisaje-bolita', r: 8 });
  const fuera = s('path', { class: 'paisaje-fuera', d: 'M0 -7 L10 0 L0 7 Z' });
  const ejeX = s('text', { class: 'rotulo', x: x + ancho / 2, y: y + alto + 38, 'text-anchor': 'middle' });
  const ejeY = s('text', { class: 'rotulo', transform: `translate(${x - 30} ${y + alto / 2}) rotate(-90)`, 'text-anchor': 'middle' });
  const marcasX = [0, 1, 2].map(() => s('text', { class: 'rotulo', y: y + alto + 17, 'text-anchor': 'middle' }));
  const marcasY = [0, 1].map(() => s('text', { class: 'rotulo', x: x - 7, 'text-anchor': 'end' }));
  const g = s('g', { class: `paisaje paisaje-de-curva ${clase}`.trim() },
    fondo, meta, metaTexto, linea, camino, paradas, tangente, punta, bolita, fuera, ejeX, ejeY, marcasX, marcasY);

  /**
   * @param {{puntos: Array<{x: number, y: number}>, xRango: [number, number], yRango: [number, number],
   *   visible?: [number, number] | null, marca?: {x: number, y: number} | null, pendiente?: number | null,
   *   camino?: Array<{x: number, y: number}>, meta?: {y: number, texto: string} | null,
   *   rotulos?: {x: string, y: string}, fmt?: (n: number) => string}} d
   *   visible: el tramo de la curva que se deja ver (null: toda); pendiente: la de la curva en la marca.
   */
  function dibujar({ puntos, xRango, yRango, visible = null, marca = null, pendiente = null, camino: pasos = [], meta: m = null, rotulos, fmt = String }) {
    const px = (v) => x + ((v - xRango[0]) / (xRango[1] - xRango[0])) * ancho;
    const py = (v) => y + alto - ((acotar(v, yRango[0], yRango[1]) - yRango[0]) / (yRango[1] - yRango[0])) * alto;
    const aLaVista = visible ? puntos.filter((p) => p.x >= visible[0] - 1e-9 && p.x <= visible[1] + 1e-9) : puntos;
    linea.setAttribute('d', aLaVista.map((p, i) => `${i ? 'L' : 'M'}${px(p.x).toFixed(1)} ${py(p.y).toFixed(1)}`).join(' '));
    // Los pasos: de parada en parada. Una parada fuera del dibujo queda en el borde.
    const dentro = (p) => ({ x: px(acotar(p.x, xRango[0], xRango[1])), y: py(p.y) });
    const lugares = pasos.map(dentro);
    camino.setAttribute('d', lugares.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '));
    paradas.replaceChildren(...lugares.slice(0, -1).map((p) => s('circle', { class: 'paisaje-parada', cx: p.x, cy: p.y, r: 3.5 })));
    bolita.style.display = marca ? '' : 'none';
    fuera.style.display = 'none';
    if (marca) {
      const p = dentro(marca);
      bolita.setAttribute('cx', p.x);
      bolita.setAttribute('cy', p.y);
      // Si la bolita se fue del dibujo, una punta en el borde dice para qué lado.
      const lado = marca.x > xRango[1] ? 1 : marca.x < xRango[0] ? -1 : 0;
      if (lado) {
        fuera.style.display = '';
        fuera.setAttribute('transform', `translate(${p.x + lado * 4} ${p.y}) rotate(${lado > 0 ? 0 : 180})`);
      }
    }
    const conPendiente = marca && pendiente != null && Number.isFinite(pendiente);
    tangente.style.display = punta.style.display = conPendiente ? '' : 'none';
    if (conPendiente) {
      // La recta que toca la curva en la bolita, con la inclinación que tiene en el dibujo.
      const k = -(pendiente * (xRango[1] - xRango[0]) * alto) / ((yRango[1] - yRango[0]) * ancho);
      const largo = 46 / Math.hypot(1, k);
      const p = dentro(marca);
      tangente.setAttribute('x1', p.x - largo);
      tangente.setAttribute('y1', p.y - largo * k);
      tangente.setAttribute('x2', p.x + largo);
      tangente.setAttribute('y2', p.y + largo * k);
      // La punta va del lado hacia donde el error baja; sin pendiente, no hay punta.
      const baja = pendiente < 0 ? 1 : pendiente > 0 ? -1 : 0;
      punta.style.display = baja ? '' : 'none';
      const giro = (Math.atan2(baja * k, baja) * 180) / Math.PI;
      punta.setAttribute('transform', `translate(${p.x + baja * largo} ${p.y + baja * largo * k}) rotate(${giro})`);
    }
    meta.style.display = metaTexto.style.display = m ? '' : 'none';
    if (m) {
      meta.setAttribute('y1', py(m.y));
      meta.setAttribute('y2', py(m.y));
      metaTexto.setAttribute('y', py(m.y) - 5);
      metaTexto.textContent = m.texto;
    }
    ejeX.textContent = rotulos?.x ?? '';
    ejeY.textContent = rotulos?.y ?? '';
    [xRango[0], (xRango[0] + xRango[1]) / 2, xRango[1]].forEach((v, i) => { marcasX[i].setAttribute('x', px(v)); marcasX[i].textContent = fmt(v); });
    // El número de abajo del eje vertical sube un poco: en la esquina no toca al primero del eje horizontal
    // (en celular las letras del dibujo son más grandes).
    yRango.forEach((v, i) => { marcasY[i].setAttribute('y', py(v) + (i ? 10 : -8)); marcasY[i].textContent = fmt(v); });
  }

  return { g, dibujar };
}

/**
 * El mapa del error contra dos pesos: una grilla de celdas en franjas, como curvas de nivel.
 * @param {{caja: {x: number, y: number, lado: number}, franjas?: number, clase?: string}} opciones
 */
export function crearMapa({ caja, franjas = 10, clase = '' }) {
  const { x, y, lado } = caja;
  const recorte = `mapa-recorte-${Math.random().toString(36).slice(2, 8)}`;
  const celdas = s('g', { class: 'mapa-celdas', 'clip-path': `url(#${recorte})` });
  const defs = s('defs', null, s('clipPath', { id: recorte }, s('rect', { x, y, width: lado, height: lado, rx: 4 })));
  const marco = s('rect', { class: 'mapa-marco', x, y, width: lado, height: lado, rx: 4 });
  const corte = s('line', { class: 'mapa-corte', x1: x, x2: x + lado });
  const cruz = s('path', { class: 'mapa-fondo', d: 'M-6 -6 L6 6 M-6 6 L6 -6' });
  const cruzTexto = s('text', { class: 'rotulo mapa-fondo-texto', 'text-anchor': 'middle' });
  const camino = s('path', { class: 'paisaje-camino' });
  const paradas = s('g', { class: 'paisaje-paradas' });
  const extra = s('g', { class: 'mapa-extra' });
  const bolita = s('circle', { class: 'paisaje-bolita', r: 8 });
  const ejeX = s('text', { class: 'rotulo', x: x + lado / 2, y: y + lado + 38, 'text-anchor': 'middle' });
  const ejeY = s('text', { class: 'rotulo', transform: `translate(${x - 30} ${y + lado / 2}) rotate(-90)`, 'text-anchor': 'middle' });
  const marcasX = [0, 1, 2].map(() => s('text', { class: 'rotulo', y: y + lado + 17, 'text-anchor': 'middle' }));
  const marcasY = [0, 1, 2].map(() => s('text', { class: 'rotulo', x: x - 7, 'text-anchor': 'end' }));
  const g = s('g', { class: `paisaje paisaje-de-mapa ${clase}`.trim() },
    defs, celdas, marco, corte, cruz, cruzTexto, camino, paradas, extra, bolita, ejeX, ejeY, marcasX, marcasY);
  let rango = [-1, 1];
  const px = (v) => x + ((acotar(v, rango[0], rango[1]) - rango[0]) / (rango[1] - rango[0])) * lado;
  const py = (v) => y + lado - ((acotar(v, rango[0], rango[1]) - rango[0]) / (rango[1] - rango[0])) * lado;

  /**
   * Pinta la grilla (una vez por mapa). `mapa` es lo que devuelve mapaDelError: { ejes, valores, minimo }.
   * Cada celda queda en una franja según su error: la raíz reparte mejor las franjas cerca del fondo,
   * donde el mapa es más plano.
   */
  function fijar(mapa, { rotulos, fondo, fmt = String }) {
    const n = mapa.ejes.length;
    rango = [mapa.ejes[0], mapa.ejes[n - 1]];
    // Las franjas reparten las celdas en partes iguales, de la más baja a la más alta: así cada escalón
    // ocupa un área parecida y el relieve se lee también cerca del fondo, donde el mapa es más plano.
    const orden = mapa.valores.flat().sort((a, b) => a - b);
    const cortes = Array.from({ length: franjas - 1 }, (_, k) => orden[Math.floor(((k + 1) * orden.length) / franjas)]);
    const franjaDe = (error) => { let k = 0; while (k < cortes.length && error >= cortes[k]) k++; return k; };
    // La grilla da el valor en el centro de cada celda: las celdas de los bordes miden la mitad.
    const paso = lado / (n - 1);
    const borde = (k) => acotar((k - 0.5) * paso, 0, lado);
    // Una sola forma por franja: las celdas de una misma franja se pisan apenas para no dejar rendijas, y
    // al ser una sola forma no se oscurecen entre sí.
    const trazos = Array.from({ length: franjas }, () => []);
    mapa.valores.forEach((fila, f) => fila.forEach((error, c) => {
      const [x0, y0, x1, y1] = [x + borde(c) - 0.3, y + borde(f) - 0.3, x + borde(c + 1) + 0.3, y + borde(f + 1) + 0.3];
      trazos[franjaDe(error)].push(`M${x0.toFixed(1)} ${y0.toFixed(1)}H${x1.toFixed(1)}V${y1.toFixed(1)}H${x0.toFixed(1)}Z`);
    }));
    const nuevas = trazos.map((d, k) => s('path', { class: 'mapa-celda', 'data-franja': k, d: d.join(''), 'fill-opacity': (0.02 + 0.6 * (k / (franjas - 1)) ** 1.3).toFixed(3) }));
    celdas.replaceChildren(...nuevas);
    const lugar = fondo ?? mapa.minimo.pesos;
    cruz.setAttribute('transform', `translate(${px(lugar[0])} ${py(lugar[1])})`);
    cruzTexto.setAttribute('x', px(lugar[0]));
    cruzTexto.setAttribute('y', py(lugar[1]) - 12);
    cruzTexto.textContent = rotulos.fondo;
    ejeX.textContent = rotulos.x;
    ejeY.textContent = rotulos.y;
    [rango[0], (rango[0] + rango[1]) / 2, rango[1]].forEach((v, i) => {
      marcasX[i].setAttribute('x', px(v)); marcasX[i].textContent = fmt(v);
      // El número de abajo del eje vertical sube un poco: en la esquina no pisa al del eje horizontal.
      marcasY[i].setAttribute('y', py(v) + (i === 0 ? -8 : 4)); marcasY[i].textContent = fmt(v);
    });
  }

  /**
   * @param {{marca?: number[] | null, camino?: number[][], corte?: number | null}} d
   *   marca: dónde está la bolita ([w1, w2]); camino: las paradas; corte: el peso derecho de la curva de
   *   un solo peso, como una raya que cruza el mapa.
   */
  function dibujar({ marca = null, camino: pasos = [], corte: w2 = null } = {}) {
    const lugares = pasos.map(([a, b]) => ({ x: px(a), y: py(b) }));
    camino.setAttribute('d', lugares.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '));
    paradas.replaceChildren(...lugares.slice(0, -1).map((p) => s('circle', { class: 'paisaje-parada', cx: p.x, cy: p.y, r: 3.5 })));
    bolita.style.display = marca ? '' : 'none';
    if (marca) { bolita.setAttribute('cx', px(marca[0])); bolita.setAttribute('cy', py(marca[1])); }
    corte.style.display = w2 == null ? 'none' : '';
    if (w2 != null) { corte.setAttribute('y1', py(w2)); corte.setAttribute('y2', py(w2)); }
  }

  return { g, fijar, dibujar, extra, aPantalla: (w1, w2) => ({ x: px(w1), y: py(w2) }) };
}
