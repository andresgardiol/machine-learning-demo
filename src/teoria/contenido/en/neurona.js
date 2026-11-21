// English texts for "A neuron" (seccion-teoria D2). Same structure as contenido/es/neurona.js, which
// documents the prose marks.

export default {
  titulo: 'A neuron',
  bajada: 'How something that only multiplies and adds can decide.',
  cierre: {
    texto: 'That was one neuron. Next comes touching it in the app: in the Lab tab, the Gates exercise starts with this very AND.',
    enlace: 'Continue in Lab, Gates',
  },
  tramos: {
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
        'The weights are back at 1 and −1. Now both sensors read almost the same: 0.5 and 0.45. The difference is tiny and the car turns anyway. This is a jumpy neuron: any total above zero switches it on.',
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
  profundizar: {
    titulo: 'Going deeper',
    intro: 'This chapter\'s neuron, written as a formula.',
    formulas: [
      { nombre: 'A neuron with a step', formula: 'y = 1 if w₁·x₁ + w₂·x₂ + b > 0;  y = 0 otherwise' },
    ],
    simbolos: [
      { simbolo: 'x₁, x₂', que: 'the inputs: what the two sensors read' },
      { simbolo: 'w₁, w₂', que: 'the weight of each input' },
      { simbolo: 'b', que: 'the bias' },
      { simbolo: 'y', que: 'what the neuron answers: 1, on, or 0, off' },
    ],
    frases: [
      'The rule of getting above zero is called the step: the answer jumps from 0 to 1 at once. There are other rules for turning the sum into an answer; all of them are called activation functions.',
      'The equality w₁·x₁ + w₂·x₂ + b = 0 is the equation of a straight line. That is why, on the plane, a neuron separates with a line: on one side the sum is positive and on the other, negative.',
      'It is an artificial neuron: a calculation inspired by biological neurons, not a description of how they work.',
    ],
  },
  fuentes: {
    titulo: 'Sources',
    nota: 'The figure\'s math is done by the same code the app uses. The content was checked with searches and against that code, not by reading each publication in full.',
    lista: [
      { texto: 'McCulloch, W. and Pitts, W. (1943). A logical calculus of the ideas immanent in nervous activity. Bulletin of Mathematical Biophysics 5, 115–133.', url: '', nota: 'The neuron as a sum with a threshold.' },
      { texto: 'Rosenblatt, F. (1958). The perceptron: a probabilistic model for information storage and organization in the brain. Psychological Review 65(6), 386–408.', url: '', nota: 'Weights that get adjusted.' },
      { texto: 'The project code: the car sensors, which give a number between 0 and 1 (src/core/sensors.js), and the math of a network with a step activation (src/core/network.js).', url: '', nota: '' },
    ],
  },
};
