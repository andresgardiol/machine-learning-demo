// Dibujo de una red en capas (seccion-teoria D12; la usan "La cuenta hacia adelante" y "Repartir la
// culpa"): columnas de neuronas unidas por sus pesos. Solo arma los elementos y los ubica; qué número va
// en cada lugar lo decide la figura del capítulo, con su cuenta.
//
// Forma y color como en el resto de la teoría: una entrada es un círculo de contorno celeste; un peso a
// favor, una línea continua verde agua; uno en contra, una línea punteada rosa; el grosor es el tamaño.

import { s } from '../dom.js';

const signo = (v) => (v > 0 ? 'pos' : v < 0 ? 'neg' : 'cero');

/**
 * @param {{sizes: number[], caja: {x: number, y: number, ancho: number, alto: number}, radio?: number,
 *   radioEntrada?: number, etiquetas?: boolean, sesgos?: boolean, clase?: string}} opciones
 *   sizes: neuronas por capa, entradas incluidas; etiquetas: una pastilla con el valor sobre cada peso;
 *   sesgos: una etiqueta con el sesgo debajo de cada neurona.
 */
export function crearRedEnCapas({ sizes, caja, radio = 22, radioEntrada = 17, etiquetas = false, sesgos = false, clase = '' }) {
  const columnas = sizes.length;
  const lugar = (l, j) => ({
    x: caja.x + (columnas === 1 ? caja.ancho / 2 : (caja.ancho * l) / (columnas - 1)),
    y: caja.y + (caja.alto * (j + 0.5)) / sizes[l],
  });
  const r = (l) => (l === 0 ? radioEntrada : radio);

  // Los pesos: aristas[l][j][i] une la neurona i de la capa l con la j de la capa l + 1.
  const aristas = [];
  const gAristas = s('g', { class: 'capas-pesos' });
  const gEtiquetas = s('g', { class: 'capas-etiquetas' });
  for (let l = 0; l < columnas - 1; l++) {
    aristas.push(Array.from({ length: sizes[l + 1] }, (_, j) => Array.from({ length: sizes[l] }, (_, i) => {
      const a = lugar(l, i);
      const b = lugar(l + 1, j);
      const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const [ux, uy] = [(b.x - a.x) / d, (b.y - a.y) / d];
      const p = { x1: a.x + ux * (r(l) + 2), y1: a.y + uy * (r(l) + 2), x2: b.x - ux * (r(l + 1) + 2), y2: b.y - uy * (r(l + 1) + 2) };
      const linea = s('line', { class: 'peso', ...p });
      gAristas.append(linea);
      const arista = { linea, ...p, ux, uy, caja: null, texto: null, g: null };
      if (etiquetas) {
        // La pastilla va cerca de donde sale el peso: ahí las líneas que se cruzan todavía están separadas.
        const t = 0.3;
        arista.caja = s('rect', { class: 'pastilla', x: -21, y: -11, width: 42, height: 22, rx: 11 });
        arista.texto = s('text', { class: 'pastilla-texto', y: 5, 'text-anchor': 'middle' });
        arista.g = s('g', { class: 'capas-etiqueta', transform: `translate(${p.x1 + (p.x2 - p.x1) * t} ${p.y1 + (p.y2 - p.y1) * t})` }, arista.caja, arista.texto);
        gEtiquetas.append(arista.g);
      }
      return arista;
    })));
  }

  // Las neuronas: nodos[l][j].
  const gNodos = s('g', { class: 'capas-nodos' });
  const nodos = sizes.map((n, l) => Array.from({ length: n }, (_, j) => {
    const p = lugar(l, j);
    const circulo = s('circle', { class: l === 0 ? 'entrada' : 'neurona red-neurona', r: r(l) });
    const valor = s('text', { class: l === 0 ? 'entrada-valor red-entrada' : 'red-valor', y: 5, 'text-anchor': 'middle' });
    const g = s('g', { class: 'capas-nodo', 'data-capa': l, transform: `translate(${p.x} ${p.y})` }, circulo, valor);
    const nodo = { g, circulo, valor, ...p, radio: r(l), sesgo: null, sesgoCaja: null };
    if (sesgos && l > 0) {
      nodo.sesgoCaja = s('rect', { class: 'sesgo-caja', x: -21, y: r(l) + 5, width: 42, height: 20, rx: 5 });
      nodo.sesgo = s('text', { class: 'pastilla-texto red-sesgo-texto', y: r(l) + 19, 'text-anchor': 'middle' });
      g.append(nodo.sesgoCaja, nodo.sesgo);
    }
    gNodos.append(g);
    return nodo;
  }));

  const g = s('g', { class: `capas ${clase}`.trim() }, gAristas, gEtiquetas, gNodos);

  /** Pinta un peso: signo (color y forma), grosor y, si lleva pastilla, su número ya escrito. */
  function pintarPeso(arista, w, texto) {
    const sg = signo(w);
    arista.linea.dataset.signo = sg;
    arista.linea.style.strokeWidth = w === 0 ? 1.2 : 1.2 + Math.min(2, Math.abs(w)) * 2;
    if (arista.caja) {
      arista.caja.dataset.signo = sg;
      arista.texto.textContent = texto ?? '';
    }
  }

  /** Pinta el sesgo de una neurona en su etiqueta. */
  function pintarSesgo(nodo, b, texto) {
    if (!nodo.sesgo) return;
    nodo.sesgoCaja.dataset.signo = signo(b);
    nodo.sesgo.textContent = texto;
  }

  return { g, nodos, aristas, lugar, pintarPeso, pintarSesgo };
}
