// Guion de "Aprender por evolución" (seccion-teoria D12, capítulo 7): lo que NO cambia con el idioma. Seis
// tramos, cada uno con el estado de la figura al llegar. La prosa va en contenido/<idioma>/evolucion.js.
// En este capítulo la predicción va en el tramo 5 (D12).
//
// Un estado es { vista, tanda, pasan, fuerza, historia, elegidos }: `tanda` es qué doce neuronas al azar
// se sacaron; `pasan`, cuántas de las mejores dejan hijas (1 a 6); `fuerza`, la de la mutación, en %;
// `historia`, las generaciones ya dadas, cada una con los padres que tuvo ({ pasan, fuerza, elegidos });
// `elegidos`, las que la persona marcó como padres para la generación que sigue (en el desafío). La
// población de ahora se rehace siempre desde la tanda, generación por generación: mismo estado, mismas
// doce.
//
// vista: qué deja ver y tocar la figura.
//   puntaje     doce neuronas y el error de cada una, sin el relieve; nada que tocar
//   tanda       lo mismo, con "Otra tanda"
//   seleccion   aparece el relieve; se elige cuántas pasan
//   mutacion    la fuerza del cambio y "Siguiente generación"
//   prediccion  la fuerza en cero, antes de dar la generación, hasta que se elige
//   copias      la generación dada con fuerza cero (lo que queda al resolver)
//   desafio     la persona elige los padres; la figura informa el avance del desafío

import { DESAFIO, POBLACION, poblacionAlAzar, puntuar, siguienteGeneracion, pesosDe } from './cuenta.js';
import { avanceHacia } from '../error/cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

export const VISTAS = Object.freeze(['puntaje', 'tanda', 'seleccion', 'mutacion', 'prediccion', 'copias', 'desafio']);

/**
 * Qué muestra cada vista: si se ve el relieve del error, si se marcan las que pasan, qué botón y qué
 * perilla hay, si se eligen los padres a mano y hasta cuántas generaciones deja dar.
 */
export const DE_LA_VISTA = congelar({
  puntaje: { relieve: false, marcas: false, boton: null, perilla: null, elegir: false, tope: 0 },
  tanda: { relieve: false, marcas: false, boton: 'tanda', perilla: null, elegir: false, tope: 0 },
  seleccion: { relieve: true, marcas: true, boton: null, perilla: 'pasan', elegir: false, tope: 0 },
  mutacion: { relieve: true, marcas: true, boton: 'generacion', perilla: 'fuerza', elegir: false, tope: 8 },
  prediccion: { relieve: true, marcas: true, boton: null, perilla: null, elegir: false, tope: 0 },
  copias: { relieve: true, marcas: true, boton: null, perilla: null, elegir: false, tope: 1 },
  desafio: { relieve: true, marcas: true, boton: 'generacion', perilla: null, elegir: true, tope: DESAFIO.generaciones },
});

/** Entre qué valores se mueven las dos perillas. La fuerza va en %, como en la app. */
export const RANGOS = congelar({ pasan: { desde: 1, hasta: 6, paso: 1 }, fuerza: { desde: 0, hasta: 60, paso: 10 } });
/** Hasta cuántas tandas distintas deja sacar "Otra tanda". */
export const TOPE_TANDAS = 20;
/** Cuántas pasan sin cambios en todo el capítulo. */
export const ELITE = DESAFIO.solucion.elite;

/**
 * La población del estado, rehecha desde su tanda generación por generación, con lo que pasó en la última:
 * la población anterior y cuáles fueron sus padres.
 * @returns {{poblacion: object[], generacion: number, anterior: object[] | null, padres: number[]}}
 */
export function poblacionDe(estado) {
  let poblacion = poblacionAlAzar({ tanda: estado.tanda });
  let anterior = null;
  let padres = [];
  estado.historia.forEach((g, k) => {
    const r = siguienteGeneracion(poblacion, {
      ...(g.elegidos ? { elegidos: g.elegidos } : { padres: g.pasan }), fuerza: g.fuerza, elite: ELITE, generacion: k + 1,
    });
    anterior = poblacion;
    padres = r.padres;
    poblacion = r.poblacion;
  });
  return { poblacion, generacion: estado.historia.length, anterior, padres };
}

/** El error medio de la mejor neurona de una población. */
export const mejorError = (poblacion) => Math.min(...puntuar(poblacion).puntajes.map((p) => p.error));

/**
 * La respuesta de la predicción: qué pasa en la última generación del estado. 'copias': cada hija está
 * exactamente donde estaba uno de los padres; 'mejora': hay lugares nuevos y la mejor bajó su error;
 * 'azar': hay lugares nuevos y la mejor no mejoró. Sale de hacer la cuenta.
 */
export function respuestaDeLaPrediccion(estado) {
  const { poblacion, anterior, padres } = poblacionDe(estado);
  const lugar = (ind) => pesosDe(ind).join();
  const deLosPadres = new Set(padres.map((i) => lugar(anterior[i])));
  if (poblacion.every((ind) => deLosPadres.has(lugar(ind)))) return 'copias';
  return mejorError(poblacion) < mejorError(anterior) ? 'mejora' : 'azar';
}

/** El avance del desafío: cuánto del camino entre el mejor error de la primera tanda y la meta se bajó. */
export function avanceDelDesafio(estado) {
  const inicio = mejorError(poblacionAlAzar({ tanda: estado.tanda }));
  return avanceHacia(mejorError(poblacionDe(estado).poblacion), { inicio, meta: DESAFIO.meta });
}

const { padres: PASAN, fuerza: FUERZA } = DESAFIO.solucion;
const estado = (vista, mas = {}) => ({ vista, tanda: 0, pasan: PASAN, fuerza: FUERZA, historia: [], elegidos: [], ...mas });
const DESPUES = estado('copias', { fuerza: 0, historia: [{ pasan: PASAN, fuerza: 0, elegidos: null }] });

export const TRAMOS = congelar([
  { id: 'puntaje', estado: estado('puntaje') },
  { id: 'azar', estado: estado('tanda') },
  { id: 'seleccion', estado: estado('seleccion') },
  { id: 'mutacion', estado: estado('mutacion') },
  { id: 'prediccion', estado: estado('prediccion', { fuerza: 0 }), prediccion: { despues: DESPUES, correcta: respuestaDeLaPrediccion(DESPUES) } },
  { id: 'desafio', estado: estado('desafio') },
]);

export { POBLACION };
