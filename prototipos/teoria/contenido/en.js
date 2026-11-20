// English texts for the theory prototypes (teoria-prototipos D2, D6, D7). Same structure as es.js, which
// documents the prose marks and lists the sources checked for the history milestones.
import { TRAMOS, HITOS, armar } from './guion.js';

const tramos = {
  sumar: {
    corto: 'Adding up to decide',
    pregunta: 'How can something that only adds decide to turn?',
    antes: [
      'Picture the car with just two {entra|sensors}, one on each side. (The one in the hands-on part has five.) Each hands it a number between 0 and 1: the closer something is, the higher the number.',
      'With those two numbers it has to decide one thing: do I turn right or keep going straight?',
    ],
    consigna: 'Look at the figure. There is nothing to touch yet.',
    despues: [
      'What decides sits in the middle. It multiplies each reading by a number, adds everything up and, if the total is above zero, says yes. That is all.',
      'That is an **artificial neuron**. This chapter takes it apart piece by piece.',
    ],
  },
  pesos: {
    corto: 'How much each sensor counts',
    pregunta: 'How much does each sensor count?',
    antes: [
      'The two sensors do not agree. Something close on the left pushes towards turning right. Something close on the right pushes the other way: better not go there.',
      'Each sensor has a dial that says how much its opinion is worth and which way it pushes.',
    ],
    consigna: 'Move both dials. Watch the thickness of each line, the sum and what the car does.',
    despues: [
      'Those dials are called **weights**. A {pos|positive weight} (solid line) pushes towards switching on. A {neg|negative} one (dotted line) pushes against it. At zero, that sensor does not count.',
      'When people say a network "learns", what changes are numbers like these.',
    ],
  },
  sesgo: {
    corto: 'How much it takes',
    pregunta: 'How much does it take before it turns?',
    antes: [
      'Now both sensors read almost the same: 0.5 and 0.45. The difference is tiny and the car turns anyway. This is a jumpy neuron: any total above zero switches it on.',
      'There is a third dial that does not depend on any sensor. It is always added.',
    ],
    consigna: 'Lower the third dial until the car stops turning over so little.',
    despues: [
      'That dial is the **bias**. With a negative bias the neuron asks for more before switching on. With a positive one it switches on with less, or on its own.',
      'The final rule, "if the sum is above zero, 1; otherwise, 0", has a name too: it is the **activation**. This one, which jumps all at once, is a **step**.',
    ],
  },
  prediccion: {
    corto: 'Bet before you look',
    pregunta: 'If I raise this weight, does it switch on?',
    antes: [
      'Before touching anything, place a bet. The neuron is off: the left sensor reads 0.9 and its weight is 0.5; the right one reads 0.4 and its weight is −1; the bias is −0.3.',
    ],
    consigna: '',
    prediccionTexto: {
      pregunta: 'I raise the left weight from 0.5 to 1. What happens?',
      opciones: { si: 'It switches on and the car turns', no: 'It stays off' },
      acierto: 'You got it.',
      error: 'Not this time.',
      explicacion: '0.9 × 1 is 0.9. Take away 0.4 from the other sensor and 0.3 from the bias: 0.2 is left. That is above zero, so it switches on. Before, with the weight at 0.5, the sum was −0.25.',
      pendiente: 'Pick an answer to see what happens.',
    },
    despues: [
      'Doing the sum in your head before looking is the best way to know whether you understood it. The dials are yours now: try other values.',
    ],
  },
  plano: {
    corto: 'The sum draws a line',
    pregunta: 'What does that sum draw?',
    antes: [
      'Let us change the drawing. Every situation the car is in is two numbers, and two numbers are a point: the left reading says how far right it goes; the right reading, how far up.',
      'The light area is where the neuron switches on. The edge between on and off is a straight line.',
    ],
    consigna: 'Drag the point to change what the sensors see. Then move the dials: the weights turn the line and the bias shifts it.',
    despues: [
      'That is all a single neuron can do: split the plane in two with a **straight line**. On one side it says 1 and on the other, 0. That edge is called the **decision boundary**.',
    ],
  },
  and: {
    corto: 'Challenge: both at once',
    pregunta: 'Can you make it switch on only with both at once?',
    antes: [
      'Last stretch, and it is a challenge. Each input is now 0 or 1, so there are four possible cases: the four points on the plane.',
      'The neuron must give 1 only when both inputs are 1 (the circle) and 0 for the other three (the squares).',
    ],
    consigna: 'Move the weights and the bias until all four points are right. Select a point to see its sum.',
    desafioTexto: {
      estado: '{bien} of 4 points right',
      pedirPista: 'Give me a hint',
      pista: 'Both weights can stay equal and positive. What is missing is a bias that demands both inputs together: one alone must not be enough.',
      logrado: 'Four out of four. That neuron computes an **AND**: it switches on only with both at once.',
    },
    despues: [
      'You found the numbers by hand. In the hands-on part you will do the same on a real network, and then watch it find them by itself.',
    ],
  },
};

const hitos = {
  h1943: {
    anio: '1943',
    quien: 'Warren McCulloch and Walter Pitts',
    titulo: 'A neuron is a sum',
    texto: [
      'A neurophysiologist and a young logician ask what a neuron does once you strip away everything that is not essential. What is left is very simple: it receives signals worth 0 or 1 and fires only if they reach a threshold. There are no weights yet: every signal is worth the same.',
      'That is enough to build an "and", an "or" and a "not". The idea is on paper: thinking might be, deep down, doing sums.',
    ],
    pestana: 'Lab',
  },
  h1958: {
    anio: '1958',
    quien: 'Frank Rosenblatt',
    titulo: 'The perceptron finds its weights',
    texto: [
      'One question was left: who picks the numbers? Rosenblatt proposes that the machine correct them itself, a little every time it gets something wrong. He calls it the perceptron.',
      'First he simulates it on a computer. Then he builds it: the Mark I sees through 400 photocells and keeps each weight in a dial moved by an electric motor. The dials of this chapter, but made of metal.',
    ],
    pestana: 'Lab, Gates',
  },
  h1969: {
    anio: '1969',
    quien: 'Marvin Minsky and Seymour Papert',
    titulo: 'One alone cannot do XOR',
    texto: [
      'The book "Perceptrons" studies carefully what a perceptron can and cannot do. Among the things it cannot do is one that looks trivial: telling whether two inputs are different. That is XOR.',
      'A drawing shows why. A neuron separates with a straight line, and no line leaves those four points properly sorted. With more layers it could be done, and that was already known. What was missing was a way to train them.',
    ],
    pestana: 'Lab, XOR',
  },
  h1970: {
    anio: '1970s',
    quien: '',
    titulo: 'The first winter',
    texto: [
      'The promises of artificial intelligence had been huge and the results were not arriving. In 1973 a British report, the Lighthill report, is scathing, and research money is cut in the United States too. It is the first AI winter, roughly from 1974 to 1980.',
      'For neural networks the cold had come earlier. After the 1969 book, and with no way to train networks with several layers, almost everyone sets them aside. A few people keep working anyway.',
    ],
    pestana: '',
  },
  h1986: {
    anio: '1986',
    quien: 'David Rumelhart, Geoffrey Hinton and Ronald Williams',
    titulo: 'The error travels backwards',
    texto: [
      'XOR is solved with more than one neuron, in layers. But then, when the network is wrong, which of all those weights was to blame?',
      'The answer is to hand the error back from the output, layer by layer. The technique is called backpropagation. It had been discovered more than once before; this work shows with experiments that it works, and networks come back.',
    ],
    pestana: 'Lab',
  },
};

export default {
  idioma: 'en',
  comun: {
    volver: 'Theory prototypes',
    formas: { libro: 'Book', pasos: 'Step by step', pelicula: 'Film' },
    formasRotulo: 'Forms of the chapter',
    idiomaRotulo: 'Language',
    idiomas: { es: 'Español', en: 'English' },
    tramoDe: 'Stretch {n} of {total}',
  },
  portada: {
    titulo: 'Theory: prototypes to compare',
    bajada: 'One chapter, "A neuron", told in three forms, plus a stretch of history. Same texts and same figures: the only thing that changes is the form.',
    capitulo: 'A neuron',
    capituloBajada: 'Six stretches, from an imagined car with two sensors to a neuron that computes an AND.',
    formas: {
      libro: { nombre: 'Book', bajada: 'You read down the page, with a live figure between the paragraphs of each stretch.' },
      pasos: { nombre: 'Step by step', bajada: 'One screen per stretch. The prediction asks you to choose before moving on.' },
      pelicula: { nombre: 'Film', bajada: 'A fixed figure that transforms while the text passes beside it.' },
    },
    historia: { nombre: 'A short history, 1943 to 1986', bajada: 'Five milestones on a fixed timeline. Each one points to its chapter and its tab.' },
    nota: 'Desktop prototypes. They are not linked from the app and are deleted once a form is chosen.',
  },
  capitulo: {
    titulo: 'A neuron',
    bajada: 'How something that only multiplies and adds can decide.',
    indice: 'In this chapter',
    tramos: armar(TRAMOS, tramos),
    cierre: {
      texto: 'That was one neuron. Next comes touching it in the app: in the Lab tab, the Gates exercise starts with this very AND.',
      enlace: 'Continue in Lab, Gates',
    },
  },
  pasos: {
    anterior: 'Back',
    siguiente: 'Next',
    avance: '{n} of {total}',
    bloqueo: 'Pick an answer to continue.',
    fin: 'End of the chapter',
    irA: 'Go to stretch {n}: {titulo}',
  },
  pelicula: {
    avance: 'Stretches of the chapter',
    indice: 'Stretches',
    cuenta: '{n} of {total}',
    espera: 'The figure is still on stretch 4: it is waiting for your answer.',
    volver: 'Go back and answer',
  },
  figura: {
    titulo: 'Figure: a neuron with two inputs',
    sensorIzq: 'left sensor',
    sensorDer: 'right sensor',
    entradaIzq: 'left input',
    entradaDer: 'right input',
    dobla: 'turns',
    sigue: 'goes straight',
    encendida: 'on',
    apagada: 'off',
    suma: 'sum',
    sesgo: 'bias',
    siempre: 'always',
    pasaDeCero: 'above 0?',
    si: 'yes',
    no: 'no',
    leyenda: { pos: 'pushes towards on', neg: 'pushes against', lado: 'on over here' },
    controles: {
      w1: {
        antes: 'What the left one is worth',
        nombre: 'Left weight',
        ayuda: 'How much the left one counts, for or against.',
      },
      w2: {
        antes: 'What the right one is worth',
        nombre: 'Right weight',
        ayuda: 'How much the right one counts, for or against.',
      },
      b: {
        antes: 'Always added',
        nombre: 'Bias',
        ayuda: 'Always added. More negative: harder to switch on.',
      },
    },
    restablecer: {
      rotulo: 'Reset',
      ayuda: 'Back to the values of this stretch.',
    },
    tocada: 'The figure stays as you left it.',
    punto: {
      rotulo: 'What the sensors see',
      descripcion: 'Drag it, or use the arrow keys, to change both readings. Which side of the line it falls on decides the output.',
      valor: 'left {x1}, right {x2}',
    },
    and: {
      punto: 'Left {x1}, right {x2}. It must give {esperada}. It gives {salida}: {veredicto}.',
      bien: 'right',
      mal: 'wrong',
      descripcion: 'Select it to see the sum for this case in the neuron.',
    },
    resumen: 'Sum {suma}. Output {salida}: {palabra}.',
    sinRecta: 'With both weights at zero there is no line: the whole plane gives {salida}.',
    rectaFuera: 'The line is outside the drawing: everything in view gives {salida}.',
  },
  historia: {
    titulo: 'A short history',
    bajada: 'From a neuron drawn on paper to networks that learn: five moments, 1943 to 1986.',
    linea: 'Timeline',
    capituloRotulo: 'Chapter',
    pestanaRotulo: 'Hands-on',
    proximamente: 'coming soon',
    sinCapitulo: 'No chapter and no tab: it is a pause, not an idea.',
    capitulos: { neurona: 'A neuron', xor: 'One line is not enough', culpa: 'Sharing the blame' },
    continuara: 'The story goes on after 1986. That stretch is not written yet.',
    imagenes: {
      h1943: 'Drawing: a neuron with two inputs worth 0 or 1, with no weights, and a threshold; it fires only if the sum reaches it.',
      h1958: 'Simplified drawing: a grid of photocells seeing a letter, wires to three motor-driven dials and an output.',
      h1969: 'Drawing: the four XOR points on a plane and three lines that try to separate them and fail.',
      h1970: 'Drawing: a small network, switched off and unplugged, under snowflakes.',
      h1986: 'Drawing: a three-layer network; the sum goes forward and the error comes back.',
    },
    rotulos: {
      umbral: 'threshold 2',
      dispara: 'fires',
      fotoceldas: '400 photocells',
      perillas: 'motor-driven weights',
      ningunaRecta: 'no line is enough',
      pausa: 'unplugged',
      adelante: 'the sum goes',
      atras: 'the error returns',
    },
    hitos: armar(HITOS, hitos),
  },
};
