// Guion de "Generalizar o memorizar" (seccion-teoria D12, capítulo 8): lo que NO cambia con el idioma. Seis
// tramos, cada uno con el estado de la figura al llegar. La prosa va en contenido/<idioma>/generalizar.js.
// Donde D12 y los números de la cuenta no coinciden mandan los números (decisión 22): en lo visto la recta
// acierta 35 de 40 y el memorizador, 40 de 40.
//
// Un estado es { vista, mira, muestra, holdout, elegido }: `mira` es de quién se pinta la zona y se marcan
// los fallos ('recta' o 'memorizador'); `muestra`, qué puntos están en primer plano ('vistos' o
// 'apartados'); `holdout`, qué parte de los puntos se aparta, en %; `elegido`, con cuál se queda la
// persona en el desafío (null: todavía ninguno).
//
// vista: qué deja ver y tocar la figura.
//   vistos      los puntos vistos y cuántos acierta cada uno; nada que tocar
//   zonas       se elige a quién mirar: su zona y sus fallos
//   nuevos      aparecen los puntos apartados; se elige a quién mirar y qué puntos, sin los aciertos nuevos
//   prediccion  los puntos apartados, sin zona ni aciertos, hasta que se elige
//   resultado   los aciertos de los dos en los apartados (lo que queda al resolver)
//   nombre      todo a la vista: a quién mirar y qué puntos
//   desafio     cuántos apartar y con cuál quedarse; la figura informa el avance del desafío

import { DATOS, PARTES_APARTADAS, comparar } from './cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

export const VISTAS = Object.freeze(['vistos', 'zonas', 'nuevos', 'prediccion', 'resultado', 'nombre', 'desafio']);
export const QUIENES = Object.freeze(['recta', 'memorizador']);

/**
 * Qué muestra cada vista: si pinta la zona de quien se mira, si deja elegir a quién mirar y qué puntos,
 * si ya dice los aciertos en los apartados, y si deja cambiar cuántos se apartan y con cuál quedarse.
 */
export const DE_LA_VISTA = congelar({
  vistos: { zona: false, elegirMira: false, elegirMuestra: false, aciertosNuevos: false, apartar: false },
  zonas: { zona: true, elegirMira: true, elegirMuestra: false, aciertosNuevos: false, apartar: false },
  nuevos: { zona: true, elegirMira: true, elegirMuestra: true, aciertosNuevos: false, apartar: false },
  prediccion: { zona: false, elegirMira: false, elegirMuestra: false, aciertosNuevos: false, apartar: false },
  resultado: { zona: true, elegirMira: true, elegirMuestra: false, aciertosNuevos: true, apartar: false },
  nombre: { zona: true, elegirMira: true, elegirMuestra: true, aciertosNuevos: true, apartar: false },
  desafio: { zona: true, elegirMira: false, elegirMuestra: false, aciertosNuevos: true, apartar: true },
});

/**
 * La respuesta de la predicción: quién acierta más en los puntos apartados del estado ('recta',
 * 'memorizador' o 'igual'). Sale de hacer la cuenta.
 */
export function respuestaDeLaPrediccion(estado) {
  const mejor = comparar({ holdout: estado.holdout }).mejorEnApartados;
  return mejor === 'empate' ? 'igual' : mejor;
}

/**
 * El avance del desafío, en dos pasos: apartar bastantes puntos como para que se vea una diferencia entre
 * los dos, y quedarse con el que acierta más en ellos.
 * @returns {{bien: number, total: number}}
 */
export function avanceDelDesafio(estado) {
  const mejor = comparar({ holdout: estado.holdout }).mejorEnApartados;
  const seVe = mejor !== 'empate';
  return { bien: (seVe ? 1 : 0) + (seVe && estado.elegido === mejor ? 1 : 0), total: 2 };
}

const estado = (vista, mas = {}) => ({ vista, mira: 'memorizador', muestra: 'vistos', holdout: DATOS.holdout, elegido: null, ...mas });
const DESPUES = estado('resultado', { muestra: 'apartados' });

export const TRAMOS = congelar([
  { id: 'sabe', estado: estado('vistos') },
  { id: 'como', estado: estado('zonas', { mira: 'recta' }) },
  { id: 'nuevos', estado: estado('nuevos', { muestra: 'apartados' }) },
  { id: 'prediccion', estado: estado('prediccion', { muestra: 'apartados' }), prediccion: { despues: DESPUES, correcta: respuestaDeLaPrediccion(DESPUES) } },
  { id: 'nombre', estado: estado('nombre', { muestra: 'apartados' }) },
  { id: 'desafio', estado: estado('desafio', { muestra: 'apartados', holdout: PARTES_APARTADAS[0], mira: 'recta' }) },
]);
