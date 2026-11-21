// Guion de "Corregir un poco cada vez" (seccion-teoria D12, capítulo 5): lo que NO cambia con el idioma.
// Seis tramos, cada uno con el estado de la figura al llegar. La prosa va en contenido/<idioma>/corregir.js.
//
// Un estado es { vista, camino, tasa, visto }: `camino` es la lista de lugares por donde pasó la bolita,
// cada uno [w1, w2] (el último es donde está); `tasa` es la tasa de aprendizaje; `visto` es el tramo de
// la curva que la persona ya recorrió a ciegas ([desde, hasta], en el peso izquierdo).
//
// vista: qué deja ver y tocar la figura.
//   ciegas      la curva tapada: solo se ve la bolita y lo que ya se recorrió; se mueve el peso
//   pendiente   la curva entera y la recta que la toca en la bolita; se mueve el peso
//   paso        la curva; la tasa y el botón "Un paso"
//   prediccion  la curva y la bolita en la partida, con una tasa muy alta, hasta que se elige
//   rebote      los pasos con esa tasa, que se ven de a uno (lo que queda al resolver)
//   mapa        el mapa del error contra los dos pesos; "Un paso" mueve los dos
//   desafio     el mapa, la tasa y un tope de pasos; la figura informa el avance del desafío

import { ESCENAS, trayectoria } from './cuenta.js';
import { MAPA, curvaDelError, errorMedio, avanceHacia } from '../error/cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

export const VISTAS = Object.freeze(['ciegas', 'pendiente', 'paso', 'prediccion', 'rebote', 'mapa', 'desafio']);

/**
 * Qué muestra cada vista: la curva o el mapa, qué pesos mueve un paso, qué se toca y cuántos pasos deja
 * dar. `sola`: los pasos del estado se ven de a uno al llegar.
 */
export const DE_LA_VISTA = congelar({
  ciegas: { plano: 'curva', mover: [0], peso: true, tasa: false, paso: false, pendiente: false, velada: true, sola: false, tope: 0 },
  pendiente: { plano: 'curva', mover: [0], peso: true, tasa: false, paso: false, pendiente: true, velada: false, sola: false, tope: 0 },
  paso: { plano: 'curva', mover: [0], peso: false, tasa: true, paso: true, pendiente: true, velada: false, sola: false, tope: 12 },
  prediccion: { plano: 'curva', mover: [0], peso: false, tasa: false, paso: false, pendiente: true, velada: false, sola: false, tope: 0 },
  rebote: { plano: 'curva', mover: [0], peso: false, tasa: false, paso: false, pendiente: false, velada: false, sola: true, tope: 0 },
  mapa: { plano: 'mapa', mover: [0, 1], peso: false, tasa: false, paso: true, pendiente: false, velada: false, sola: false, tope: 20 },
  desafio: { plano: 'mapa', mover: [0, 1], peso: false, tasa: true, paso: true, pendiente: false, velada: false, sola: false, tope: ESCENAS.desafio.pasos },
});

/** Lo que se dibuja de la curva: el peso izquierdo de −6 a 12 (con una tasa muy alta la bolita se va lejos). */
export const RANGO_CURVA = Object.freeze({ desde: MAPA.desde, hasta: 12 });
/** Entre qué valores se mueve la tasa con su perilla. */
export const RANGO_TASA = Object.freeze({ desde: 1, hasta: 12 });

const W2 = ESCENAS.curva.inicio.pesos[1];
const SESGO = ESCENAS.curva.inicio.sesgo;

/** El fondo de la curva de un solo peso: el peso izquierdo donde el error medio es más bajo. */
export function fondoDeLaCurva() {
  return curvaDelError({ pesos: [0, W2], sesgo: SESGO }, { indice: 0, ...RANGO_CURVA }).reduce((a, b) => (b.error < a.error ? b : a)).peso;
}

/** Los lugares por donde pasa la bolita dando `pasos` pasos desde `inicio`, con esa tasa. */
export const caminoDe = (inicio, tasa, pasos, mover) => trayectoria(inicio, tasa, pasos, { mover }).map((p) => [...p.pesos]);

/** El error medio en un lugar del camino. */
export const errorEn = ([w1, w2]) => errorMedio({ pesos: [w1, w2], sesgo: SESGO }).medio;

/**
 * La respuesta de la predicción: qué hace la bolita en la curva con los pasos del estado. 'llega': se
 * acerca al fondo sin cruzarlo; 'vuelve': lo cruza y termina más cerca que después del primer cruce;
 * 'rebota': lo cruza una y otra vez y termina más lejos. Sale de hacer la cuenta.
 */
export function respuestaDeLaPrediccion(estado) {
  const fondo = fondoDeLaCurva();
  const lados = estado.camino.map(([w1]) => Math.sign(w1 - fondo));
  const lejos = estado.camino.map(([w1]) => Math.abs(w1 - fondo));
  const primerCruce = lados.findIndex((l, k) => k > 0 && l !== lados[k - 1]);
  if (primerCruce === -1) return 'llega';
  const trasElCruce = lejos[primerCruce + 1];
  return trasElCruce !== undefined && lejos.at(-1) > trasElCruce ? 'rebota' : 'vuelve';
}

/** El avance del desafío: cuánto del camino entre el error de partida y la meta bajó la bolita. */
export function avanceDelDesafio(estado) {
  const { inicio, meta } = ESCENAS.desafio;
  return avanceHacia(errorEn(estado.camino.at(-1)), { inicio: errorMedio(inicio).medio, meta });
}

const CURVA = ESCENAS.curva.inicio.pesos;
const MAPA_INICIO = ESCENAS.desafio.inicio.pesos;
const estado = (vista, camino, tasa) => ({ vista, camino, tasa, visto: [camino[0][0], camino[0][0]] });
const DESPUES = estado('rebote', caminoDe(ESCENAS.curva.inicio, ESCENAS.curva.tasas.muyAlta, 8, [0]), ESCENAS.curva.tasas.muyAlta);

export const TRAMOS = congelar([
  { id: 'lado', estado: estado('ciegas', [[...CURVA]], ESCENAS.curva.tasas.chica) },
  { id: 'pendiente', estado: estado('pendiente', [[...CURVA]], ESCENAS.curva.tasas.chica) },
  { id: 'cuanto', estado: estado('paso', [[...CURVA]], ESCENAS.curva.tasas.chica) },
  {
    id: 'prediccion',
    estado: estado('prediccion', [[...CURVA]], ESCENAS.curva.tasas.muyAlta),
    prediccion: { despues: DESPUES, correcta: respuestaDeLaPrediccion(DESPUES) },
  },
  { id: 'mapa', estado: estado('mapa', [[...MAPA_INICIO]], ESCENAS.desafio.solucion.tasa) },
  { id: 'desafio', estado: estado('desafio', [[...MAPA_INICIO]], 2) },
]);
