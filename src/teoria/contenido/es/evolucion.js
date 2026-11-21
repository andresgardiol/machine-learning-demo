// Textos en español de «Aprender por evolución» (seccion-teoria D12, capítulo 7). El orden de los tramos y
// los números de la figura vienen de capitulos/evolucion/guion.js: acá solo va la prosa, por id de tramo.
// Las marcas de la prosa (**término**, {entra|texto}, …) las explica contenido/es/neurona.js.
//
// Escrito sobre openspec/changes/archive/2026-11-20-seccion-teoria/hoja-de-hechos-capitulos.md; falta el cotejo (tarea 15.6).
// Los números que dice la prosa (el error de la mejor de cada tanda y de cada generación) salen de la
// cuenta, con semilla, y tienen prueba en tests/teoria-capitulos-7-a-9.test.js.

export default {
  titulo: 'Aprender por evolución',
  bajada: 'Otra forma de encontrar los pesos: probar muchos, quedarse con los mejores y variarlos.',
  cierre: {
    texto: 'Hasta acá, cómo se buscan pesos cuando solo hay un puntaje. En la app, en la pestaña Entrenar, largá una población de autos y seguila de generación en generación. Probá cambiar la «Fuerza de mutación», y elegir vos quiénes pasan.',
    enlace: 'Seguí en Entrenar',
  },
  tramos: {
    puntaje: {
      corto: 'Solo un puntaje',
      pregunta: '¿Y si nadie sabe la respuesta correcta de cada paso?',
      antes: [
        'Para repartir la culpa hace falta saber qué había que responder en cada ejemplo. Al manejar eso no existe: nadie sabe cuál era la tecla correcta en cada instante. Lo que sí se sabe, cuando el auto termina, es cómo le fue. Un solo número al final: un puntaje.',
        'Para verlo en chico, acá no hay autos: hay doce neuronas artificiales como la de «Medir el error», con los mismos ocho ejemplos. De cada una sabemos una sola cosa: su error medio. Cuanto más bajo, mejor le fue.',
      ],
      consigna: 'Mirá la lista de la derecha: las doce, de la mejor a la peor.',
      despues: [
        'Cada punto es una neurona, y su lugar son sus dos pesos. La mejor tiene un error de 0,68; la peor, 1,31. Nadie les dijo en qué se equivocaron ni para qué lado corregirse. Solo cuánto sacó cada una.',
        'Con tan poco no se puede calcular ninguna pendiente. Hay que buscar de otra manera.',
      ],
    },
    azar: {
      corto: 'Muchas al azar',
      pregunta: '¿Qué pasa si pruebo muchas al azar?',
      antes: [
        'Estas doce salieron al azar: dos pesos cualquiera para cada una. Si no se sabe nada más, lo más simple es sacar otras doce y ver si alguna sale mejor.',
      ],
      consigna: 'Apretá «Otra tanda» varias veces y fijate en el error de la mejor.',
      despues: [
        'A veces sale una buena y a veces no. En la primera tanda la mejor tenía 0,68; en la segunda, 0,53. Al grupo que se prueba junto se le dice **población**, y al puntaje de cada una, **fitness**: qué tan bien le fue. Acá el fitness es tener poco error.',
        'El problema de sacar tandas al azar es que no se acumula nada. Cada tanda empieza de cero, y la buena que había salido se pierde.',
      ],
    },
    seleccion: {
      corto: 'Con cuáles me quedo',
      pregunta: '¿Con cuáles me quedo?',
      antes: [
        'Volvemos a las doce del principio, la primera tanda. En lugar de tirarlas y sacar otras, se guardan las mejores. Debajo de los puntos ahora se ve el relieve del capítulo anterior: más oscuro, menos error. Las neuronas no lo ven; está para que vos veas dónde cayó cada una.',
        'Las que pasan llevan un anillo. La mejor de todas es la estrella.',
      ],
      consigna: 'Mové «Cuántas pasan» de 1 a 6 y mirá cuáles quedan.',
      despues: [
        'Elegir cuáles siguen es la **selección**. Las demás se descartan. La mejor de todas es la **élite**: pasa a la tanda siguiente tal cual, sin ningún cambio, para que lo mejor que se encontró no se pierda.',
        'Si pasan pocas, se apuesta todo a lo que ya salió bien. Si pasan muchas, se arrastran también las regulares.',
      ],
    },
    mutacion: {
      corto: 'Cómo salen las siguientes',
      pregunta: '¿Cómo salen las siguientes?',
      antes: [
        'Seguimos con la primera tanda, y otra vez pasan tres. Las doce de la tanda siguiente salen de esas tres. La élite pasa igual. Las otras once son copias de alguna de las tres, con un cambio al azar: cada peso se corre un poco hacia un valor cualquiera.',
        'Cuánto se corre lo dice la fuerza del cambio, que arranca en 30 %.',
      ],
      consigna: 'Apretá «Siguiente generación» varias veces. Después restablecé y probá con otra fuerza.',
      despues: [
        'Ese cambio al azar es la **mutación**, y cada tanda nueva es una **generación**. Los círculos a rayas marcan dónde estaban las que pasaron: las hijas caen alrededor, algunas mejor ubicadas y otras peor. Con fuerza 30 %, en la primera generación la mejor baja de 0,68 a 0,56.',
        'Después se repite: se puntúan las doce nuevas, pasan las mejores, y sus copias mutadas forman la generación siguiente. La población se va corriendo hacia la zona oscura sin que nadie calcule una pendiente.',
      ],
    },
    prediccion: {
      corto: 'Apostá antes de mirar',
      pregunta: 'Con la mutación en cero, ¿qué pasa?',
      antes: [
        'Antes de apretar nada, apostá. Volvimos a la primera tanda. Pasan las tres mejores, como antes, pero la fuerza de la mutación quedó en 0 %.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'Con la fuerza en 0 %, ¿cómo queda la generación siguiente?',
        opciones: {
          copias: 'Las doce quedan amontonadas sobre las tres que pasaron',
          mejora: 'Mejora igual, pero más despacio',
          azar: 'Se reparten de nuevo al azar por todo el mapa',
        },
        acierto: 'Acertaste.',
        error: 'Esta vez no.',
        explicacion: 'Sin mutación, cada hija es una copia exacta de una de las tres que pasaron. Las doce quedan en tres lugares, y la mejor sigue con 0,68: no apareció nada nuevo para probar.',
        pendiente: 'Elegí una respuesta para ver la generación.',
      },
      despues: [
        'La selección sola no inventa nada: solo elige entre lo que ya hay. Lo nuevo lo trae la mutación. Y la mutación sola es sacar tandas al azar, como en el tramo 2. Hacen falta las dos.',
        'En la otra punta, con la fuerza al 100 % cada peso pasa a ser directamente un valor al azar: las hijas no conservan nada de quienes pasaron.',
      ],
    },
    desafio: {
      corto: 'Desafío: elegir los padres',
      pregunta: '¿Podés hacer vos de selección?',
      antes: [
        'Último tramo, y es un desafío. Ahora las que pasan las elegís vos: tocalas en el mapa o en la lista, hasta seis. La primera que toques es la élite. La fuerza de la mutación queda en 30 %.',
        'Arrancás de nuevo en la primera tanda, sin ninguna generación dada: la mejor tiene un error de 0,68. Tenés tres generaciones.',
      ],
      consigna: 'Elegí cuáles pasan y apretá «Siguiente generación», hasta que la mejor tenga un error menor que 0,6.',
      desafioTexto: {
        estado: '{bien} de {total} tramos del camino hasta la meta',
        pedirPista: 'Dame una pista',
        pista: 'No hace falta adivinar: la lista está ordenada. Las hijas caen cerca de las que elijas, así que elegí las de menos error.',
        logrado: 'La mejor quedó por debajo de 0,6. Vos hiciste la selección y la mutación hizo el resto.',
      },
      despues: [
        'Así entrena la pestaña Entrenar de la app, con autos en lugar de neuronas: cada auto maneja con su red, se mide cómo le fue, pasan los mejores y sus copias mutadas forman la generación siguiente. Usar la evolución para buscar los pesos de una red se llama **neuroevolución**.',
        'Es otra herramienta, para otro caso. Sirve cuando solo hay un puntaje al final. Cuando hay una respuesta correcta para cada ejemplo, lo habitual es usar el descenso por gradiente.',
      ],
    },
  },
  figura: {
    titulo: 'Figura: doce neuronas como puntos sobre el mapa del error, y la lista de las doce de mejor a peor',
    ejes: { izquierdo: 'peso izquierdo', derecho: 'peso derecho' },
    fondo: 'fondo',
    lista: { titulo: 'puesto', error: 'error' },
    rol: { elite: 'élite', pasa: 'pasa' },
    tanda: 'Tanda {n}',
    generacion: 'Generación {n}',
    elegi: 'Elegí al menos una',
    elegidas: 'Elegidas: {n}',
    sinGeneraciones: 'No quedan generaciones',
    cuenta: {
      mejor: 'la mejor: error',
      pasan: 'pasan {n} de {total},',
      generacionDe: 'generación {n} de {total},',
    },
    controles: {
      pasan: { nombre: 'Cuántas pasan', ayuda: 'Cuántas de las mejores dejan hijas en la tanda siguiente.' },
      fuerza: { nombre: 'Fuerza de la mutación', ayuda: 'Cuánto se corre cada peso de una hija, al azar.' },
      tanda: { rotulo: 'Otra tanda', ayuda: 'Saca otras doce neuronas al azar.' },
      generacion: { rotulo: 'Siguiente generación', ayuda: 'Arma las doce siguientes con las que pasan.' },
    },
    restablecer: { rotulo: 'Restablecer', ayuda: 'Vuelve a los valores de este tramo.' },
    tocada: 'La figura sigue como la dejaste.',
    neurona: {
      descripcion: 'En el desafío, elegila para que pase a la generación siguiente.',
      rotulo: 'Puesto {puesto}: error {error}. Peso izquierdo {w1}, peso derecho {w2}.',
    },
    resumen: 'Generación {generacion}. La mejor tiene un error de {error}. Pasan {pasan}.',
  },
  profundizar: {
    titulo: 'Para profundizar',
    intro: 'La mutación, con la regla que usa la app.',
    formulas: [
      { nombre: 'Mutación de un peso', formula: 'w ← w + (r − w) · f' },
    ],
    simbolos: [
      { simbolo: 'w', que: 'un peso de la hija, copiado de quien pasó' },
      { simbolo: '←', que: '«pasa a valer»' },
      { simbolo: 'r', que: 'un valor sacado al azar, distinto para cada peso' },
      { simbolo: 'f', que: 'la fuerza de la mutación, de 0 a 1 (en la app se escribe en %, de 0 a 100)' },
    ],
    frases: [
      'Con f = 0 el peso no cambia; con f = 1 pasa a ser r. En el medio, se corre esa parte del camino hacia r. En la app, además, cada peso muta con cierta probabilidad; en la figura mutan todos.',
      'Lo que hace la app es evolución de los pesos con un puntaje por recorrido. No es aprendizaje por refuerzo paso a paso, que es otra familia de métodos para problemas donde solo hay un puntaje.',
      'En redes grandes lo habitual es el descenso por gradiente. Aun así, la evolución se probó también con redes profundas (Such y otros, 2017; Salimans y otros, 2017).',
      'El nombre viene de la biología, pero es una comparación: esto es un procedimiento de búsqueda, no una descripción de cómo evolucionan los seres vivos.',
    ],
  },
  fuentes: {
    titulo: 'Fuentes',
    nota: 'La figura usa el mismo código que la pestaña Entrenar para armar cada generación (selección, élite y mutación), con azar con semilla: muestra siempre lo mismo. Las doce neuronas, sus ejemplos y el mapa son los de los capítulos «Medir el error» y «Corregir un poco cada vez».',
    lista: [
      { texto: 'Such, F. P. y otros (2017). Deep Neuroevolution: Genetic Algorithms Are a Competitive Alternative for Training Deep Neural Networks for Reinforcement Learning.', url: 'https://arxiv.org/abs/1712.06567', nota: '' },
      { texto: 'Salimans, T. y otros (2017). Evolution Strategies as a Scalable Alternative to Reinforcement Learning.', url: '', nota: 'Citado por Such y otros; no se abrió.' },
      { texto: 'El código del proyecto: la evolución (src/core/evolution.js) y la cuenta de este capítulo, con sus pruebas (src/teoria/capitulos/evolucion/cuenta.js).', url: '', nota: '' },
    ],
  },
};
