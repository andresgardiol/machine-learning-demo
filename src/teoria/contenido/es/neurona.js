// Textos en español de «Una neurona» (seccion-teoria D2; vienen de teoria-prototipos D2 y de sus
// revisiones). El orden de los tramos y los números de la figura vienen de capitulos/neurona/guion.js:
// acá solo va la prosa, por id de tramo.
//
// Marcas dentro de la prosa (las interpreta src/teoria/dom.js):
//   **término**        un término técnico, la primera vez que se nombra
//   {entra|texto}      color de lo que entra (sensores)        {pos|texto}  peso positivo
//   {neg|texto}        peso negativo                           {decide|texto} lo que decide la neurona
//
// Contenido revisado contra fuentes en openspec/changes/archive/2026-11-20-teoria-prototipos/revision-contenido.md.

export default {
  titulo: 'Una neurona',
  bajada: 'Cómo decide algo que solo sabe multiplicar y sumar.',
  cierre: {
    texto: 'Hasta acá, una neurona. Lo que sigue es tocarla en la app: en la pestaña Laboratorio, el ejercicio Compuertas arranca justo con este AND.',
    enlace: 'Seguí en Laboratorio, Compuertas',
  },
  tramos: {
    sumar: {
      corto: 'Sumar para decidir',
      pregunta: '¿Cómo decide doblar algo que solo sabe sumar?',
      antes: [
        'Imaginá el auto con solo dos {entra|sensores}, uno a cada lado. (El de la práctica tiene cinco.) Cada uno le pasa un número entre 0 y 1: cuanto más cerca hay algo, más alto.',
        'Con esos dos números tiene que decidir una sola cosa: ¿doblo a la derecha o sigo derecho?',
      ],
      consigna: 'Mirá la figura. Todavía no hay nada que tocar.',
      despues: [
        'Lo que decide está en el medio. Multiplica cada lectura por un número, suma todo y, si el total pasa de cero, dice que sí. Nada más.',
        'Eso es una **neurona artificial**. Este capítulo la desarma pieza por pieza.',
      ],
    },
    pesos: {
      corto: 'Cuánto pesa cada sensor',
      pregunta: '¿Cuánto pesa cada sensor?',
      antes: [
        'Los dos sensores no opinan lo mismo. Algo cerca a la izquierda empuja a doblar a la derecha. Algo cerca a la derecha empuja a lo contrario: mejor no ir para ese lado.',
        'Cada sensor tiene una perilla que dice cuánto vale su opinión y hacia dónde empuja.',
      ],
      consigna: 'Mové las dos perillas. Mirá el grosor de cada línea, la suma y lo que hace el auto.',
      despues: [
        'Esas perillas se llaman **pesos**. Un {pos|peso positivo} (línea continua) empuja a favor de encender. Uno {neg|negativo} (línea punteada) empuja en contra. En cero, ese sensor no cuenta.',
        'Cuando se dice que una red «aprende», lo que cambia son números como estos.',
      ],
    },
    sesgo: {
      corto: 'Desde cuánto se anima',
      pregunta: '¿Desde cuánto se anima a doblar?',
      antes: [
        'Los pesos vuelven a 1 y −1. Ahora los dos sensores leen casi lo mismo: 0,5 y 0,45. La diferencia es mínima y, aun así, el auto dobla. Es una neurona nerviosa: cualquier total por encima de cero la enciende.',
        'Hay una tercera perilla que no depende de ningún sensor. Se suma siempre.',
      ],
      consigna: 'Bajá la tercera perilla hasta que el auto deje de doblar por tan poco.',
      despues: [
        'Esa perilla es el **sesgo**. Con un sesgo negativo, la neurona pide más antes de encenderse. Con uno positivo, se enciende con menos, o sola.',
        'La regla del final, «si la suma pasa de cero, 1; si no, 0», también tiene nombre: es la **activación**. Esta, que salta de golpe, es un **escalón**.',
      ],
    },
    prediccion: {
      corto: 'Apostá antes de mirar',
      pregunta: 'Si subo este peso, ¿se enciende?',
      antes: [
        'Antes de tocar nada, apostá. La neurona está apagada: el sensor izquierdo lee 0,9 y pesa 0,5; el derecho lee 0,4 y pesa −1; el sesgo es −0,3.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'Subo el peso izquierdo de 0,5 a 1. ¿Qué pasa?',
        opciones: { si: 'Se enciende y el auto dobla', no: 'Sigue apagada' },
        acierto: 'Acertaste.',
        error: 'Esta vez no.',
        explicacion: '0,9 × 1 da 0,9. Restale 0,4 del otro sensor y 0,3 del sesgo: queda 0,2. Pasa de cero, así que se enciende. Antes, con el peso en 0,5, la suma daba −0,25.',
        pendiente: 'Elegí una respuesta para ver qué pasa.',
      },
      despues: [
        'Hacer la cuenta en la cabeza antes de mirar es la mejor forma de saber si la entendiste. Ahora las perillas son tuyas: probá otros valores.',
      ],
    },
    plano: {
      corto: 'La cuenta dibuja una recta',
      pregunta: '¿Qué dibuja esa cuenta?',
      antes: [
        'Cambiemos de dibujo. Cada situación del auto son dos números, y dos números son un punto: la lectura izquierda dice cuánto va a la derecha; la lectura derecha, cuánto sube.',
        'La zona clara es donde la neurona se enciende. El borde entre encender y no encender es una línea derecha.',
      ],
      consigna: 'Arrastrá el punto para cambiar lo que ven los sensores. Después mové las perillas: los pesos giran la línea y el sesgo la corre.',
      despues: [
        'Eso es todo lo que una neurona sola puede hacer: partir el plano en dos con una **recta**. De un lado dice 1 y del otro, 0. A ese borde se lo llama **frontera de decisión**.',
      ],
    },
    and: {
      corto: 'Desafío: las dos a la vez',
      pregunta: '¿Podés hacer que se encienda solo con las dos a la vez?',
      antes: [
        'Último tramo, y es un desafío. Ahora cada entrada vale 0 o 1, así que hay cuatro casos posibles: los cuatro puntos del plano.',
        'La neurona tiene que dar 1 únicamente cuando las dos entradas valen 1 (el círculo) y 0 en los otros tres (los cuadrados).',
      ],
      consigna: 'Mové los pesos y el sesgo hasta que los cuatro puntos queden bien. Tocá un punto para ver su cuenta.',
      desafioTexto: {
        estado: '{bien} de 4 puntos bien',
        pedirPista: 'Dame una pista',
        pista: 'Los dos pesos pueden quedar iguales y positivos. Falta un sesgo que exija a las dos entradas juntas: una sola no tiene que alcanzar.',
        logrado: 'Cuatro de cuatro. Esa neurona calcula un **AND**: se enciende solo con las dos a la vez.',
      },
      despues: [
        'Encontraste los números a mano. En la práctica vas a hacer lo mismo sobre una red de verdad y después vas a ver cómo los encuentra sola.',
      ],
    },
  },
  figura: {
    titulo: 'Figura: una neurona con dos entradas',
    sensorIzq: 'sensor izquierdo',
    sensorDer: 'sensor derecho',
    entradaIzq: 'entrada izquierda',
    entradaDer: 'entrada derecha',
    dobla: 'dobla',
    sigue: 'sigue derecho',
    encendida: 'encendida',
    apagada: 'apagada',
    suma: 'suma',
    sesgo: 'sesgo',
    siempre: 'siempre',
    pasaDeCero: '¿pasa de 0?',
    si: 'sí',
    no: 'no',
    leyenda: { pos: 'empuja a favor', neg: 'empuja en contra', lado: 'acá se enciende' },
    controles: {
      w1: {
        antes: 'Cuánto vale el izquierdo',
        nombre: 'Peso izquierdo',
        ayuda: 'Cuánto cuenta el izquierdo, a favor o en contra.',
      },
      w2: {
        antes: 'Cuánto vale el derecho',
        nombre: 'Peso derecho',
        ayuda: 'Cuánto cuenta el derecho, a favor o en contra.',
      },
      b: {
        antes: 'Se suma siempre',
        nombre: 'Sesgo',
        ayuda: 'Se suma siempre. Más negativo: más le cuesta encenderse.',
      },
    },
    restablecer: {
      rotulo: 'Restablecer',
      ayuda: 'Vuelve a los valores de este tramo.',
    },
    tocada: 'La figura sigue como la dejaste.',
    punto: {
      rotulo: 'Lo que ven los sensores',
      descripcion: 'Arrastralo, o usá las flechas, para cambiar las dos lecturas. De qué lado de la recta cae decide la salida.',
      valor: 'izquierdo {x1}, derecho {x2}',
    },
    and: {
      punto: 'Izquierda {x1}, derecha {x2}. Tiene que dar {esperada}. Da {salida}: {veredicto}.',
      bien: 'bien',
      mal: 'mal',
      descripcion: 'Elegilo para ver la cuenta de este caso en la neurona.',
    },
    resumen: 'Suma {suma}. Salida {salida}: {palabra}.',
    sinRecta: 'Con los dos pesos en cero no hay recta: todo el plano da {salida}.',
    rectaFuera: 'La recta quedó fuera del dibujo: todo lo que se ve da {salida}.',
  },
  profundizar: {
    titulo: 'Para profundizar',
    intro: 'La neurona de este capítulo, escrita como fórmula.',
    formulas: [
      { nombre: 'Una neurona con escalón', formula: 'y = 1 si w₁·x₁ + w₂·x₂ + b > 0;  y = 0 si no' },
    ],
    simbolos: [
      { simbolo: 'x₁, x₂', que: 'las entradas: lo que leen los dos sensores' },
      { simbolo: 'w₁, w₂', que: 'el peso de cada entrada' },
      { simbolo: 'b', que: 'el sesgo' },
      { simbolo: 'y', que: 'lo que responde la neurona: 1, encendida, o 0, apagada' },
    ],
    frases: [
      'La regla de pasar de cero se llama escalón: la respuesta salta de 0 a 1 de golpe. Hay otras reglas para convertir la suma en respuesta; a todas se las llama funciones de activación.',
      'La igualdad w₁·x₁ + w₂·x₂ + b = 0 es la ecuación de una recta. Por eso, en el plano, una neurona separa con una recta: de un lado la suma es positiva y del otro, negativa.',
      'Es una neurona artificial: una cuenta inspirada en las neuronas biológicas, no una descripción de cómo funcionan.',
    ],
  },
  fuentes: {
    titulo: 'Fuentes',
    nota: 'Las cuentas de la figura las hace el mismo código que usa la app. El contenido se comprobó con búsquedas y contra ese código, sin leer cada publicación entera.',
    lista: [
      { texto: 'McCulloch, W. y Pitts, W. (1943). A logical calculus of the ideas immanent in nervous activity. Bulletin of Mathematical Biophysics 5, 115–133.', url: '', nota: 'La neurona como una cuenta con umbral.' },
      { texto: 'Rosenblatt, F. (1958). The perceptron: a probabilistic model for information storage and organization in the brain. Psychological Review 65(6), 386–408.', url: '', nota: 'Los pesos que se ajustan.' },
      { texto: 'El código del proyecto: los sensores del auto, que dan un número entre 0 y 1 (src/core/sensors.js), y la cuenta de una red con activación escalón (src/core/network.js).', url: '', nota: '' },
    ],
  },
};
