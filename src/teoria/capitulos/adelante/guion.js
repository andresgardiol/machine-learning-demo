// Guion de "La cuenta hacia adelante" (seccion-teoria D12, capítulo 3): lo que NO cambia con el idioma.
// Seis tramos, cada uno con el estado de la figura al llegar. La prosa va en contenido/<idioma>/adelante.js.
//
// Un estado es { vista, entradas: [x1, x2], pasos }: las dos entradas de la red del XOR (de 0 a 1) y
// cuántas neuronas ya se calcularon (0 a 3), en el orden de cuenta.js. En la vista del auto, `pasos`
// cuenta las diez neuronas de la red del auto y las entradas no se usan.
//
// vista: qué deja ver y tocar la figura.
//   pasa        la red del XOR; la cuenta se hace sola, de a una neurona, al llegar. Nada que tocar
//   paso        la red sin calcular; el botón "Paso" calcula la neurona que sigue
//   entradas    la red calculada; se mueven las dos entradas y la cuenta se rehace
//   prediccion  las entradas puestas y nada calculado, hasta que se elige
//   auto        la red del auto (5 entradas, 6 ocultas, 4 salidas), calculada: solo para mirar
//   desafio     como "entradas"; la figura informa el avance del desafío

import { ESCENAS, redXor, recorrido, salidaDe } from './cuenta.js';

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

export const VISTAS = Object.freeze(['pasa', 'paso', 'entradas', 'prediccion', 'auto', 'desafio']);

/** Qué muestra cada vista: qué red, si la cuenta se hace sola, y qué se toca. */
export const DE_LA_VISTA = congelar({
  pasa: { red: 'xor', sola: true, paso: false, perillas: false, capas: false },
  paso: { red: 'xor', sola: false, paso: true, perillas: false, capas: false },
  entradas: { red: 'xor', sola: false, paso: false, perillas: true, capas: true },
  prediccion: { red: 'xor', sola: false, paso: false, perillas: false, capas: true },
  auto: { red: 'auto', sola: true, paso: false, perillas: false, capas: true },
  desafio: { red: 'xor', sola: false, paso: false, perillas: true, capas: true },
});

/** Las tres neuronas de la red del XOR, en el orden en que se calculan. */
export const NEURONAS = Object.freeze(['A', 'B', 'C']);

/** La respuesta de la predicción: qué da la red con las entradas del estado. Sale de hacer la cuenta. */
export const respuestaDeLaPrediccion = (estado) => (salidaDe(redXor(), estado.entradas) === 1 ? 'uno' : 'cero');

/**
 * El avance del desafío: cuántas de las tres neuronas están como hace falta para que la red se encienda
 * (A encendida, B apagada, C encendida). Con las tres, la red da 1.
 * @returns {{bien: number, total: number}}
 */
export function avanceDelDesafio(entradas) {
  const [a, b, c] = recorrido(redXor(), entradas).map((p) => p.salida);
  return { bien: (a === 1) + (b === 0) + (c === 1), total: 3 };
}

const DESPUES = { vista: 'pasa', entradas: [...ESCENAS.prediccion.entradas], pasos: 3 };

export const TRAMOS = congelar([
  { id: 'orden', estado: { vista: 'pasa', entradas: [1, 0], pasos: 3 } },
  { id: 'paso', estado: { vista: 'paso', entradas: [1, 0], pasos: 0 } },
  { id: 'capas', estado: { vista: 'entradas', entradas: [0, 1], pasos: 3 } },
  {
    id: 'prediccion',
    estado: { vista: 'prediccion', entradas: [...ESCENAS.prediccion.entradas], pasos: 0 },
    prediccion: { despues: DESPUES, correcta: respuestaDeLaPrediccion(DESPUES) },
  },
  { id: 'auto', estado: { vista: 'auto', entradas: [0, 0], pasos: 10 } },
  { id: 'desafio', estado: { vista: 'desafio', entradas: [...ESCENAS.desafio.inicio], pasos: 3 } },
]);
