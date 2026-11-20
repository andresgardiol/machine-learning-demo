// Dónde está el auto y dónde termina cada rayo (teoria-prototipos, revisión 1), sin DOM. Función pura,
// probada en tests/: la distancia que se dibuja y el número que se lee salen de la misma cuenta.
//
// Los dos sensores son simétricos: salen del frente del auto con el mismo ángulo a cada lado y tienen
// el mismo alcance. Una lectura es cuán cerca está lo que el rayo toca:
//
//   lectura = 1 − (distancia − mínimo) / (alcance − mínimo)      1 = pegado, 0 = nada dentro del alcance
//
// Un rayo nunca termina en el vacío. El auto se pone de costado para que el rayo de la lectura más alta
// termine justo en el borde de la calle (lectura alta = borde cerca). El otro rayo termina en otro vehículo
// puesto a la distancia de su lectura o, con lectura 0, llega entero sin tocar nada. Como las dos
// lecturas son independientes, el borde solo puede explicar una; con las dos casi iguales el auto queda
// entre los dos extremos y cada rayo termina en un vehículo.

export const SENSORES = Object.freeze({
  angulo: (38 * Math.PI) / 180, // de cada rayo respecto del frente del auto
  alcance: 160, // largo de un rayo que no toca nada
  minimo: 34, // distancia a la que la lectura ya vale 1
  ancho: 210, // de borde a borde de la calle
  banda: 0.04, // diferencia de lecturas por debajo de la cual el auto no se pega a un borde
});

const TOLERANCIA = 1e-9;
const acotar = (v) => Math.max(0, Math.min(1, v));

/** Distancia a la que está lo que da esa lectura. */
export const distanciaDe = (lectura, m = SENSORES) => m.minimo + (1 - acotar(lectura)) * (m.alcance - m.minimo);

/** Lectura que da algo a esa distancia (la inversa de distanciaDe). */
export const lecturaDe = (distancia, m = SENSORES) => acotar(1 - (distancia - m.minimo) / (m.alcance - m.minimo));

/**
 * @param {[number, number]} lecturas izquierda y derecha, de 0 a 1
 * @returns {{posicion: number, rayos: Array<{lectura: number, distancia: number, alBorde: number,
 *   toca: 'borde' | 'obstaculo' | 'nada'}>}}
 *   posicion: del borde izquierdo de la calle al centro del auto. distancia: largo dibujado del rayo.
 *   alBorde: a qué distancia ese rayo encontraría el borde. toca: qué hay en la punta del rayo.
 */
export function escenaDeSensores(lecturas, m = SENSORES) {
  const seno = Math.sin(m.angulo);
  const [x1, x2] = lecturas.map(acotar);
  const d = [distanciaDe(x1, m), distanciaDe(x2, m)];
  // El auto puede estar entre `desde` (el rayo izquierdo termina justo en el borde izquierdo) y `hasta`
  // (el derecho, en el derecho). Más afuera, un borde cortaría un rayo antes de lo que dice su lectura.
  const desde = d[0] * seno;
  const hasta = m.ancho - d[1] * seno;
  const u = acotar((x2 - x1 + m.banda) / (2 * m.banda));
  const posicion = desde + (hasta - desde) * (u * u * (3 - 2 * u));
  const alBorde = [posicion / seno, (m.ancho - posicion) / seno];
  const rayos = [x1, x2].map((lectura, i) => {
    let toca = 'obstaculo';
    if (lectura <= 0) toca = 'nada';
    else if (Math.abs(alBorde[i] - d[i]) < TOLERANCIA) toca = 'borde';
    return { lectura, distancia: d[i], alBorde: alBorde[i], toca };
  });
  return { posicion, rayos };
}
