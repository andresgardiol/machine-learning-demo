// Guion de "Una neurona" (teoria-prototipos D2): lo que NO cambia con el idioma. Seis tramos, cada uno
// con el estado de la figura (qué muestra y con qué números). Los textos van en es.js y en.js, que
// toman de acá el orden y los estados: así los dos idiomas no pueden contar cuentas distintas.
//
// vista: qué deja ver y tocar la figura.
//   mirar       auto + neurona, sin perillas
//   pesos       + las dos perillas de peso
//   sesgo       + la perilla del sesgo y el escalón
//   prediccion  como "sesgo" pero sin perillas hasta que se elige
//   probar      las tres perillas, ya con sus nombres (lo que queda al resolver la predicción)
//   plano       el plano con la recta y el punto de lo que ven los sensores
//   and         el plano con los cuatro puntos del AND

const congelar = (o) => {
  for (const v of Object.values(o)) if (v && typeof v === 'object') congelar(v);
  return Object.freeze(o);
};

export const VISTAS = Object.freeze(['mirar', 'pesos', 'sesgo', 'prediccion', 'probar', 'plano', 'and']);

export const TRAMOS = congelar([
  { id: 'sumar', estado: { vista: 'mirar', entradas: [0.8, 0.3], pesos: [1, -1], sesgo: 0 } },
  { id: 'pesos', estado: { vista: 'pesos', entradas: [0.8, 0.3], pesos: [1, -1], sesgo: 0 } },
  { id: 'sesgo', estado: { vista: 'sesgo', entradas: [0.5, 0.45], pesos: [1, -1], sesgo: 0 } },
  {
    id: 'prediccion',
    estado: { vista: 'prediccion', entradas: [0.9, 0.4], pesos: [0.5, -1], sesgo: -0.3 },
    // Lo que cambia al resolver: el peso izquierdo sube de 0,5 a 1. La respuesta correcta sale de hacer
    // la cuenta (una prueba lo comprueba con cuenta.js), no de este campo suelto.
    prediccion: { despues: { vista: 'probar', entradas: [0.9, 0.4], pesos: [1, -1], sesgo: -0.3 }, correcta: 'si' },
  },
  { id: 'plano', estado: { vista: 'plano', entradas: [0.8, 0.3], pesos: [1, -1], sesgo: -0.2 } },
  { id: 'and', estado: { vista: 'and', entradas: [1, 1], pesos: [1, 1], sesgo: 0 } },
]);

/** Los cinco hitos de la historia (D6): lo que no cambia con el idioma. */
export const HITOS = congelar([
  { id: 'h1943', capitulo: 'neurona', disponible: true },
  { id: 'h1958', capitulo: 'neurona', disponible: true },
  { id: 'h1969', capitulo: 'xor', disponible: false },
  { id: 'h1970', capitulo: null, disponible: false },
  { id: 'h1986', capitulo: 'culpa', disponible: false },
]);

/** Une el guion con los textos de un idioma: cada tramo queda con su estado y su prosa. */
export function armar(lista, textos) {
  return lista.map((item) => {
    const texto = textos[item.id];
    if (!texto) throw new Error(`falta el texto de "${item.id}"`);
    return { ...item, ...texto };
  });
}
