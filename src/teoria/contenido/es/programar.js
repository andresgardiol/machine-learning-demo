// Textos en español de «Programar o aprender» (seccion-teoria D9, capítulo 0). El orden de los tramos y
// los números de la figura vienen de capitulos/programar/guion.js: acá solo va la prosa, por id de tramo.
// Las marcas de la prosa (**término**, {entra|texto}, …) las explica contenido/es/neurona.js.
//
// Contenido revisado en openspec/changes/archive/2026-11-20-seccion-teoria/revision-contenido-programar.md. Los números que dice
// la prosa (cuántas acierta cada regla, entre qué umbrales, cuántos prueba el barrido) salen de la
// cuenta y tienen prueba en tests/teoria-capitulos.test.js.

export default {
  titulo: 'Programar o aprender',
  bajada: 'Dos formas de conseguir que una máquina decida: decirle cómo, o darle ejemplos.',
  cierre: {
    texto: 'Hasta acá, programar contra aprender. En la app, la pestaña Reglas a mano te deja escribirle reglas al auto; en la pestaña Entrenar, los autos aprenden solos, por prueba y selección.',
    enlace: 'Seguí en Reglas a mano y en Entrenar',
  },
  tramos: {
    regla: {
      corto: 'Una regla',
      pregunta: '¿Cómo le dirías a un auto cuándo doblar?',
      antes: [
        'Imaginá un auto con dos {entra|sensores}, uno a cada lado. Cada uno da un número entre 0 y 1: cuanto más cerca hay algo, más alto. (El de la práctica tiene cinco; acá alcanzan dos.)',
        'La forma más directa de que no choque es escribirle una regla: «si el izquierdo pasa de 0,5, doblar». Y si no, seguir derecho.',
      ],
      consigna: 'Mirá la figura: hay seis situaciones. Tocá una fila para verla en el auto.',
      despues: [
        'En cada fila, la barra es lo que lee el sensor y la línea blanca es el 0,5 de la regla. Si la barra pasa la línea, la regla dispara y el auto dobla. Con las seis sale bien.',
        'Esto es **programar**: una persona piensa la regla y la máquina la obedece.',
      ],
    },
    umbral: {
      corto: 'El número de la regla',
      pregunta: '¿Qué número le ponés?',
      antes: [
        'La regla tiene un número adentro, y alguien lo eligió. ¿Por qué 0,5 y no otro?',
        'Ahora arranca en 0,1. El auto dobla por cualquier cosa y falla dos de las seis.',
      ],
      consigna: 'Mové la perilla y mirá cuántas acierta. Buscá con qué números acierta las seis.',
      despues: [
        'Ese número se llama **umbral**: la lectura a partir de la cual la regla dispara. Con un umbral muy bajo el auto dobla por nada; con uno muy alto no dobla nunca.',
        'Acá sirve cualquiera desde 0,4 hasta antes de 0,6. No lo sabías de antemano: lo encontraste probando y mirando los ejemplos. Guardá esa idea.',
      ],
    },
    otra: {
      corto: 'Una que no cubre',
      pregunta: '¿Y esta situación?',
      antes: [
        'La regla vuelve a 0,5, y aparecen dos situaciones nuevas. Mirá la séptima: a la izquierda casi no hay nada (0,2), pero a la derecha hay algo muy cerca (0,7). Habría que doblar, y la regla ni se entera: solo mira el sensor izquierdo.',
      ],
      consigna: 'Probá arreglarlo con la perilla. ¿Hay algún umbral que acierte las ocho?',
      despues: [
        'No hay. Para que la regla dispare en la séptima, el umbral tiene que bajar de 0,2, y entonces el auto dobla en otras donde tenía que seguir.',
        'Con una regla sola no alcanza. Hace falta otra, que mire el otro sensor.',
      ],
    },
    prediccion: {
      corto: 'Apostá antes de mirar',
      pregunta: 'Con dos reglas, ¿cuántas quedan mal?',
      antes: [
        'La primera regla quedó en 0,5 y falla una sola: la séptima. Sumemos una segunda: «si el derecho pasa de 0,3, doblar». El auto dobla cuando dispara cualquiera de las dos.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'Con las dos reglas, ¿cuántas de las ocho quedan mal?',
        opciones: { ninguna: 'Ninguna: la segunda arregla la que faltaba', una: 'Una', dos: 'Dos' },
        acierto: 'Acertaste.',
        error: 'Esta vez no.',
        explicacion: 'La segunda regla arregla la séptima: 0,7 pasa de 0,3. Pero también dispara en la octava, donde el derecho lee 0,4 y había que seguir. Arregló una y rompió otra: sigue fallando una.',
        pendiente: 'Elegí una respuesta para ver qué pasa.',
      },
      despues: [
        'Así es programar con reglas: cada una que agregás se cruza con las anteriores. Ahora las dos perillas son tuyas: buscá un par de números que acierte las ocho.',
        'Con ocho situaciones y dos reglas se puede. Manejar de verdad tiene muchas más de las dos cosas.',
      ],
    },
    buscar: {
      corto: 'Que busque la máquina',
      pregunta: '¿Y si los números los eligiera la máquina?',
      antes: [
        'Lo que hiciste recién con las perillas fue mecánico: probar un número, contar cuántas acierta y quedarte con el mejor. Eso lo puede hacer la máquina sola. Solo necesita los ejemplos: las ocho situaciones, cada una con lo que había que hacer.',
        'Los dos números arrancan mal puestos a propósito.',
      ],
      consigna: 'Apretá «Buscar» y mirá cómo se corren las líneas.',
      despues: [
        'Las barritas de arriba de cada perilla dicen cuántas acertó con cada número que probó: veintiuno por regla, en orden. Primero buscó el de la primera regla sola; después, con ese fijo, el de la segunda. Se quedó con el mejor de cada pasada.',
        'Eso es un **barrido**: probar todo, de punta a punta. Las redes neuronales de los capítulos que siguen no aprenden así: tienen demasiados números para probarlos todos, y cómo los encuentran es tema de esos capítulos. Pero la idea ya está acá. Esos dos números no los pensó nadie: salieron de los ejemplos. A eso se le dice **aprender**.',
      ],
    },
    desafio: {
      corto: 'Desafío: las ocho',
      pregunta: '¿Podés acertar las ocho, a mano y buscando?',
      antes: [
        'Último tramo, y es un desafío. Las dos reglas arrancan en 0,2: el auto dobla de más y falla dos.',
        'Primero hacelo como quien programa: mové las dos perillas hasta acertar las ocho. Después apretá «Restablecer» y dejá que busque la máquina.',
      ],
      consigna: 'Mové las perillas hasta que las ocho filas queden bien.',
      desafioTexto: {
        estado: '{bien} de {total} situaciones bien',
        pedirPista: 'Dame una pista',
        pista: 'Cada línea tiene que quedar entre dos barras: a su derecha, las situaciones donde hay que doblar por ese sensor; a su izquierda, las demás.',
        logrado: 'Ocho de ocho. Con esos dos números, las reglas cubren todos los ejemplos.',
      },
      despues: [
        'Llegaste al mismo lugar por los dos caminos. Con dos números todavía se puede elegir. El auto de la práctica tiene cinco sensores y cuatro salidas: ahí las reglas a mano se vuelven una maraña, y por eso el resto de la teoría trata de máquinas que aprenden.',
      ],
    },
  },
  figura: {
    titulo: 'Figura: un auto con dos sensores, una lista de situaciones y las reglas que deciden si dobla',
    dobla: 'dobla',
    sigue: 'sigue derecho',
    auto: 'El auto en la situación {n}: el sensor izquierdo lee {x1} y el derecho, {x2}. Con las reglas, {hace}.',
    tabla: {
      titulo: 'Situaciones: lo que lee cada sensor, lo que habría que hacer y lo que hace el auto con las reglas',
      numero: 'Situación',
      izquierdo: 'izquierdo',
      derecho: 'derecho',
      deberia: 'debería',
      hace: 'hace',
      resultado: 'Resultado',
      doblar: 'doblar',
      seguir: 'seguir derecho',
      bien: 'acierta',
      mal: 'falla',
      elegir: 'Ver la situación {n} en el auto',
    },
    regla: {
      si: 'Si el',
      izquierdo: 'izquierdo',
      derecho: 'derecho',
      pasa: 'pasa de',
      entonces: 'doblar',
      pendiente: 'todavía no cuenta',
      pausa: 'espera su turno',
    },
    aciertos: 'Acierta {bien} de {total}',
    controles: {
      u1: {
        rotulo: 'Desde qué lectura del sensor izquierdo dobla',
        ayuda: 'El número de la regla. Más alto: le cuesta más doblar.',
      },
      u2: {
        rotulo: 'Desde qué lectura del sensor derecho dobla',
        ayuda: 'El número de la segunda regla, la del sensor derecho.',
      },
      buscar: {
        rotulo: 'Buscar',
        buscando: 'Buscando…',
        ayuda: 'Prueba los números en orden y se queda con el que más acierta.',
      },
    },
    restablecer: {
      rotulo: 'Restablecer',
      ayuda: 'Vuelve a los valores de este tramo.',
    },
    tocada: 'La figura sigue como la dejaste.',
    resumen: 'Acierta {bien} de {total}.',
    buscado: 'Buscó los dos números: {u1} para el izquierdo y {u2} para el derecho. Acierta {bien} de {total}.',
  },
  profundizar: {
    titulo: 'Para profundizar',
    intro: 'Dos formas de conseguir un programa que decide.',
    formulas: [],
    simbolos: [],
    frases: [
      'Con reglas, una persona escribe las condiciones y elige los números. Con ejemplos, los números los ajusta un procedimiento a partir de casos ya resueltos. A esta segunda forma se le dice **aprendizaje automático**; en inglés, machine learning.',
      'Las reglas a mano no son peores en general: sirven cuando los casos son pocos y se conocen de antemano. Se quedan cortas cuando hay demasiadas situaciones para escribir una regla para cada una.',
      'La búsqueda de la figura, que prueba todos los umbrales en orden, es la forma más simple de sacar un número de los ejemplos. Los capítulos que siguen cuentan otras, que sirven cuando los números son muchos.',
    ],
  },
  fuentes: {
    titulo: 'Fuentes',
    nota: 'Este capítulo no cuenta historia: explica una idea con una figura. Las ocho situaciones son inventadas para el capítulo, y lo que dice la figura (cuántas acierta cada regla, qué números prueba la búsqueda) lo calcula en el momento.',
    lista: [
      { texto: 'El código del proyecto: el auto de la práctica y sus cinco sensores (src/core/sensors.js), y la cuenta de este capítulo, con sus pruebas (src/teoria/capitulos/programar/cuenta.js).', url: '', nota: '' },
      { texto: 'Samuel, A. L. (1959). Some Studies in Machine Learning Using the Game of Checkers. IBM Journal of Research and Development 3(3), 210–229.', url: 'https://people.csail.mit.edu/brooks/idocs/Samuel.pdf', nota: 'Un trabajo temprano sobre programas que mejoran con la experiencia; ayudó a difundir el nombre «machine learning».' },
    ],
  },
};
