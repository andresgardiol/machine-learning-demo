// Guion de "Una neurona" (seccion-teoria D4; viene de teoria-prototipos D2): lo que NO cambia con el
// idioma. Seis tramos, cada uno con el estado de la figura al llegar (qué muestra y con qué números). La
// prosa va en contenido/<idioma>/neurona.js, por id de tramo: así los dos idiomas no pueden contar
// cuentas distintas. Lo que la persona cambia en un tramo queda en ese tramo (estado-figura.js).
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
