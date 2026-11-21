// Textos en español de lo que comparte toda la sección (seccion-teoria D2): la barra, la portada, el
// formato de capítulo y los nombres del temario y de las pestañas de la app. Se carga siempre; el
// contenido de cada capítulo y de la historia va aparte y se pide al abrirlo.
//
// Los títulos de los capítulos 3 a 9 son los de design.md D9; sus frases son propuestas: las confirma el
// cambio que escriba cada capítulo.

export default {
  idioma: 'es',
  comun: {
    seccion: 'Teoría',
    barra: 'Navegación de la teoría',
    volver: 'Teoría',
    volverRotulo: 'Volver a la portada de la teoría',
    irApp: 'Ir a la app',
    idiomaRotulo: 'Idioma',
    idiomas: { es: 'Español', en: 'English' },
    tramoDe: 'Tramo {n} de {total}',
    cargando: 'Cargando…',
  },
  portada: {
    titulo: 'La teoría detrás de la práctica',
    sobre: 'Laboratorio de machine learning',
    vieneDeAca: 'Venís de acá',
    bajada: 'Lo que la práctica da por sabido, contado con figuras que hacen la cuenta de verdad.',
    como: 'Cada capítulo es una pregunta, una figura que se toca y un desafío. Al final te dice en qué pestaña de la app seguir.',
    historiaRotulo: 'Para empezar',
    historia: 'Historia breve de la IA',
    historiaFrase: 'De una neurona dibujada en un papel a los modelos de lenguaje: doce momentos y dos inviernos.',
    historiaIr: 'Recorrer la historia',
    temario: 'Temario',
    estado: 'Hay {listos} capítulos listos. Los otros {faltan} están en camino.',
    estadoCompleto: 'Los {listos} capítulos están listos. Conviene leerlos en orden.',
    capitulo: 'Capítulo {n}',
    enLaPractica: 'En la app: {pestana}',
    proximamente: 'próximamente',
    pie: 'La teoría acompaña a la práctica: lo que acá se explica, allá se toca.',
  },
  capitulos: {
    programar: { titulo: 'Programar o aprender', frase: 'Por qué las reglas escritas a mano se quedan cortas, y qué cambia cuando los números salen de los ejemplos.' },
    neurona: { titulo: 'Una neurona', frase: 'Cómo decide algo que solo sabe multiplicar y sumar.' },
    xor: { titulo: 'Una recta no alcanza', frase: 'Qué no puede hacer una neurona sola, y cómo lo resuelven tres.' },
    adelante: { titulo: 'La cuenta hacia adelante', frase: 'En qué orden se hacen las cuentas, desde los sensores hasta la decisión, capa por capa.' },
    error: { titulo: 'Medir el error', frase: 'Cómo se le pone un número a «qué tan mal estuvo».' },
    corregir: { titulo: 'Corregir un poco cada vez', frase: 'Cómo se achica el error moviendo cada peso un poquito.' },
    culpa: { titulo: 'Repartir la culpa', frase: 'Cómo sabe cada peso cuánto tuvo que ver con el error.' },
    evolucion: { titulo: 'Aprender por evolución', frase: 'Otra forma de encontrar los pesos: probar muchos, quedarse con los mejores y variarlos.' },
    generalizar: { titulo: 'Generalizar o memorizar', frase: 'Por qué una red que aprendió en un circuito puede fallar en otro.' },
    adentro: { titulo: 'Qué quedó adentro', frase: 'Cómo mirar qué hace cada neurona de una red ya entrenada.' },
  },
  // Los mismos nombres que la app (src/i18n/es.js, tab.*).
  pestanas: { drive: 'El problema', rules: 'Reglas a mano', train: 'Entrenar', compete: 'Competir', inspect: 'Inspeccionar', lab: 'Laboratorio' },
  ejercicios: { gates: 'Compuertas', xor: 'XOR' },
  seguir: {
    rotulo: 'Seguir leyendo',
    siguiente: 'Siguiente',
    empezar: 'Empezar',
    capitulo: '{n}. {titulo}',
    temario: 'Volver al temario',
  },
  pelicula: {
    avance: 'Tramos del capítulo',
    indice: 'Tramos',
    cuenta: '{n} de {total}',
    espera: 'La figura sigue en el tramo {n}: espera tu respuesta.',
    volver: 'Volver a contestar',
  },
};
