// Textos en español de «Una recta no alcanza» (seccion-teoria D9, capítulo 2). El orden de los tramos y
// los números de la figura vienen de capitulos/xor/guion.js: acá solo va la prosa, por id de tramo. Las
// marcas de la prosa (**término**, {entra|texto}, …) las explica contenido/es/neurona.js.
//
// Contenido revisado en openspec/changes/archive/2026-11-20-seccion-teoria/revision-contenido-xor.md. Los números que dice la prosa
// (cuántos puntos acierta cada estado, qué puntos quedan entre las rectas) salen de la cuenta y tienen
// prueba en tests/teoria-capitulos.test.js.

export default {
  titulo: 'Una recta no alcanza',
  bajada: 'Lo que una neurona sola no puede hacer, y cómo lo resuelven tres.',
  cierre: {
    texto: 'Hasta acá, por qué hacen falta capas. En la app, en la pestaña Laboratorio, elegí la compuerta XOR: ahí le sumás la capa oculta y ves cómo la red encuentra sola esos números.',
    enlace: 'Seguí en Laboratorio, XOR',
  },
  tramos: {
    distintas: {
      corto: 'Solo si son distintas',
      pregunta: '¿Podés encenderla solo cuando las entradas son distintas?',
      antes: [
        'En «Una neurona» lograste un AND: la neurona se enciende solo con las dos entradas en 1. Probemos con un pedido que suena igual de simple: que se encienda cuando las entradas son distintas. Una sí y la otra no.',
        'En el plano, los dos círculos tienen que dar 1 y los dos cuadrados, 0. La neurona arranca como quedó en el AND y acierta uno solo de los cuatro.',
      ],
      consigna: 'Mové los pesos y el sesgo. Tratá de dejar los cuatro puntos bien.',
      despues: [
        'A tres se llega. A cuatro no llega nadie, y no es falta de paciencia.',
        'Este pedido tiene nombre: es el **XOR**, el «o exclusivo». Una o la otra, pero no las dos.',
      ],
    },
    tope: {
      corto: 'Nunca pasa de tres',
      pregunta: '¿Por qué nunca pasa de tres?',
      antes: [
        'Una neurona parte el plano con una recta: de un lado da 1 y del otro, 0. Para acertar los cuatro haría falta una recta que deje los dos círculos de un lado y los dos cuadrados del otro.',
        'Ahora la recta deja bien tres. Falla el cuadrado de arriba a la derecha: quedó del lado de los círculos.',
      ],
      consigna: 'Girá y corré la recta para arreglar ese punto. Mirá cuál otro se rompe.',
      despues: [
        'Los círculos están en una diagonal y los cuadrados en la otra: quedan cruzados. No hay recta que deje a los círculos de un lado y a los cuadrados del otro. Siempre queda alguno del lado equivocado.',
        'A los problemas que sí se resuelven con una recta se los llama **linealmente separables**. El XOR no lo es. No es un defecto de esta figura: es el límite de cualquier neurona sola. Un libro de 1969 estudió a fondo esos límites (está en la historia).',
      ],
    },
    dos: {
      corto: 'Dos rectas',
      pregunta: '¿Y con dos rectas?',
      antes: [
        'Si una recta no alcanza, probemos con dos. A vuelve a encenderse si alguna entrada vale 1, y llega una segunda neurona, B. Recibe las mismas dos entradas, pero tiene sus propios pesos y su propio sesgo. O sea, su propia recta: la que va a rayas.',
        'Todavía no hay una respuesta final. Cada punto tiene ahora dos respuestas, la de A y la de B: son los dos cuadraditos que lleva al lado. Blanco es 1.',
      ],
      consigna: 'Elegí «Neurona B» y mové su recta. Mirá cómo cambian los cuadraditos de cada punto. La flechita de cada recta apunta al lado donde esa neurona se enciende.',
      despues: [
        'Con una recta, el plano quedaba partido en dos zonas. Con dos rectas quedan hasta cuatro, y en cada una A y B responden una combinación distinta.',
        'La pregunta ya no es de qué lado de una recta cae un punto, sino en qué zona.',
      ],
    },
    prediccion: {
      corto: 'Apostá antes de mirar',
      pregunta: '¿Qué puntos quedan entre las dos rectas?',
      antes: [
        'Antes de tocar nada, apostá. A quedó como antes: se enciende si alguna de las dos entradas vale 1. B tiene los mismos pesos, 1 y 1, pero un sesgo de −2,4: su recta quedó en la esquina de arriba, y los cuatro puntos están de su lado apagado.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'Subo el sesgo de B de −2,4 a −1,5 y su recta se corre hacia el medio. ¿Qué puntos quedan entre las dos rectas?',
        opciones: { circulos: 'Los dos círculos', tres: 'Los mismos tres que ahora', cuadrado: 'Solo el cuadrado de arriba a la derecha' },
        acierto: 'Acertaste.',
        error: 'Esta vez no.',
        explicacion: 'Con sesgo −1,5, B se enciende solo si las dos entradas suman más de 1,5. El cuadrado de arriba suma 2: pasa, y queda del otro lado de B. Los círculos suman 1: no pasan. Entre las dos rectas quedan justo los dos círculos.',
        pendiente: 'Elegí una respuesta para ver qué pasa.',
      },
      despues: [
        'La franja clara es la zona donde A dice que sí y B dice que no. Ahí quedaron los dos círculos, solos. Ninguna de las dos rectas separa el XOR, pero entre las dos lo encierran.',
        'Falta alguien que mire las dos respuestas y diga «este punto está en la franja».',
      ],
    },
    junta: {
      corto: 'La que junta las dos',
      pregunta: '¿Quién junta las dos respuestas?',
      antes: [
        'Una tercera neurona, C. No mira las entradas: recibe lo que respondieron A y B, y con eso hace lo de siempre. Multiplica, suma su sesgo y se fija si el total pasa de cero.',
        'Por ahora C tiene pesos 1 y 1 y sesgo −0,5: se enciende si A o B se encienden. Acierta tres.',
      ],
      consigna: 'Tocá cada punto y seguí la cuenta: qué responden A y B, y qué hace C con eso.',
      despues: [
        'Esto ya es una **red neuronal**: neuronas que le pasan su respuesta a otra. A y B forman una **capa oculta**: lo que responden no se ve desde afuera, solo le sirve a C. C es la **capa de salida**.',
        'El punto que falla es el cuadrado de arriba a la derecha. Ahí A y B se encienden las dos, y a C le alcanza con una.',
      ],
    },
    desafio: {
      corto: 'Desafío: el XOR',
      pregunta: '¿Podés hacer que la red dé el XOR?',
      antes: [
        'Último tramo, y es un desafío. A y B quedan fijas, con los dos círculos en la franja. Solo se mueven las tres perillas de C.',
        'C tiene que encenderse cuando A dice que sí y B dice que no. Y solo entonces.',
      ],
      consigna: 'Mové los pesos y el sesgo de C hasta que los cuatro puntos queden bien.',
      desafioTexto: {
        estado: '{bien} de {total} puntos bien',
        pedirPista: 'Dame una pista',
        pista: 'Que A empuje a favor y B en contra, con la misma fuerza. Después, un sesgo que no deje que C se encienda sola.',
        logrado: 'Cuatro de cuatro. Tres neuronas hacen lo que una sola no puede: un **XOR**.',
      },
      despues: [
        'Mirá la zona clara del plano: ya no es un lado de una recta, es una franja. Sumando neuronas, una red dibuja zonas que una sola no puede. No es la única forma: hay muchas redes distintas que dan el XOR. Esta es una.',
        'Estos nueve números los pusimos a mano. Una red de las que se usan tiene miles, millones o muchos más. Queda la pregunta que abre los capítulos que siguen: ¿quién encuentra esos números?',
      ],
    },
  },
  figura: {
    titulo: 'Figura: los cuatro puntos del XOR en el plano y una red que crece de una neurona a tres',
    entradaIzq: 'entrada izquierda',
    entradaDer: 'entrada derecha',
    izquierda: 'izquierda',
    derecha: 'derecha',
    encendida: 'encendida',
    apagada: 'apagada',
    aciertos: '{bien} de {total} puntos bien',
    fichas: 'lo que responden A y B',
    selector: { rotulo: 'Qué neurona movés', a: 'Neurona A', b: 'Neurona B' },
    controles: {
      w1: {
        nombre: 'Peso izquierdo de {quien}',
        deC: 'Peso de A',
        ayuda: 'Cuánto cuenta la entrada izquierda, a favor o en contra.',
        ayudaDeC: 'Cuánto cuenta lo que responde A, a favor o en contra.',
      },
      w2: {
        nombre: 'Peso derecho de {quien}',
        deC: 'Peso de B',
        ayuda: 'Cuánto cuenta la entrada derecha, a favor o en contra.',
        ayudaDeC: 'Cuánto cuenta lo que responde B, a favor o en contra.',
      },
      b: {
        nombre: 'Sesgo de {quien}',
        deC: 'Sesgo de C',
        ayuda: 'Se suma siempre. Más negativo: más le cuesta encenderse.',
        ayudaDeC: 'Se suma siempre. Más negativo: más le cuesta encenderse.',
      },
    },
    restablecer: {
      rotulo: 'Restablecer',
      ayuda: 'Vuelve a los valores de este tramo.',
    },
    tocada: 'La figura sigue como la dejaste.',
    punto: {
      descripcion: 'Elegilo para ver la cuenta de este caso en la red.',
      conSalida: 'Izquierda {x1}, derecha {x2}. Tiene que dar {esperada}. Da {salida}: {veredicto}.',
      conDos: 'Izquierda {x1}, derecha {x2}. A responde {a} y B responde {b}.',
      bien: 'bien',
      mal: 'mal',
    },
    resumen: 'Neuronas: {neuronas}. Puntos bien: {bien} de {total}.',
    resumenDos: 'Dos neuronas, A y B. Puntos entre las dos rectas: {n}.',
    sinRecta: 'Con los dos pesos en cero, {quien} no tiene recta.',
    rectaFuera: 'La recta de {quien} quedó fuera del dibujo.',
  },
  profundizar: {
    titulo: 'Para profundizar',
    intro: 'La red de este capítulo como fórmula, y hasta dónde llega una capa oculta.',
    formulas: [
      { nombre: 'La capa oculta', formula: 'A = f(x₁ + x₂ − 0,5)    B = f(x₁ + x₂ − 1,5)' },
      { nombre: 'La salida', formula: 'y = f(A − B − 0,5)' },
    ],
    simbolos: [
      { simbolo: 'x₁, x₂', que: 'las dos entradas' },
      { simbolo: 'f', que: 'el escalón: da 1 si lo de adentro pasa de cero y 0 si no' },
      { simbolo: 'A, B', que: 'lo que responden las dos neuronas de la capa oculta' },
      { simbolo: 'y', que: 'lo que responde la red' },
    ],
    frases: [
      'Hay un resultado general: con una sola capa oculta y neuronas suficientes, una red puede aproximar tan bien como se quiera cualquier función continua. Se lo conoce como teorema de aproximación universal (Cybenko, 1989; Hornik, Stinchcombe y White, 1989).',
      'Ese resultado dice que una red así existe. No dice cuántas neuronas hacen falta ni cómo encontrar sus pesos: de eso se ocupan los capítulos que siguen.',
    ],
  },
  fuentes: {
    titulo: 'Fuentes',
    nota: 'Las cuentas de la figura las hace el mismo código que usa la app, con activación escalón. Que una neurona sola no pasa de tres de cuatro está comprobado con una prueba sobre todas las posiciones de las perillas.',
    lista: [
      { texto: 'Minsky, M. y Papert, S. (1969). Perceptrons. MIT Press.', url: '', nota: 'El XOR es el caso más chico de los límites que el libro demuestra para un perceptrón de una capa. No se leyó el libro: el dato se comprobó con búsquedas.' },
      { texto: 'Rumelhart, D., Hinton, G. y Williams, R. (1986). Learning representations by back-propagating errors. Nature 323, 533–536.', url: '', nota: 'Sobre cómo se entrenan las capas ocultas: es tema de capítulos que siguen.' },
      { texto: 'Cybenko, G. (1989). Approximation by superpositions of a sigmoidal function. Mathematics of Control, Signals, and Systems 2, 303–314.', url: '', nota: 'Para «Para profundizar». No se leyó el artículo: los datos se comprobaron con búsquedas.' },
      { texto: 'Hornik, K., Stinchcombe, M. y White, H. (1989). Multilayer feedforward networks are universal approximators. Neural Networks 2(5), 359–366.', url: '', nota: 'Para «Para profundizar». No se leyó el artículo: los datos se comprobaron con búsquedas.' },
      { texto: 'El código del proyecto: la red y su cuenta (src/core/network.js) y la cuenta de este capítulo, con sus pruebas (src/teoria/capitulos/xor/cuenta.js).', url: '', nota: '' },
    ],
  },
};
