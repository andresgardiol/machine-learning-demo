// English text of "The forward pass" (seccion-teoria D12, chapter 3). Same keys as
// contenido/es/adelante.js; the order of the sections and the figure's numbers come from
// capitulos/adelante/guion.js.

export default {
  titulo: 'The forward pass',
  bajada: 'The order in which a network does its sums, from the inputs to the answer.',
  cierre: {
    texto: 'That is how a network calculates. In the app, in the Inspect tab, pause a car and press "Step": you will see this same calculation, neuron by neuron, in the network that drives it.',
    enlace: 'Continue in Inspect',
  },
  tramos: {
    orden: {
      corto: 'In what order',
      pregunta: 'In what order does a network calculate?',
      antes: [
        'This is the three-neuron network you built in "One line is not enough", with the same numbers. A and B receive the two inputs; C receives what A and B answer.',
        'C cannot do its sum until A and B finish theirs: it would be missing its numbers. So there is an order. Watch it fill in: first A, then B, and only then C.',
      ],
      consigna: 'Watch the calculation complete. "Again" replays it.',
      despues: [
        'With the left input at 1 and the right at 0, A adds up to 0.5 and turns on, B adds up to −0.5 and stays off, and C, with those two answers, adds up to 0.5: the network gives 1.',
        'Nothing travels down a wire or takes time. It is a calculation done in order, like working out what is inside the brackets first.',
      ],
    },
    paso: {
      corto: 'One neuron at a time',
      pregunta: 'What does each neuron do when its turn comes?',
      antes: [
        'Now the network has not been calculated: the three neurons are empty, with a dashed outline. The one with the yellow ring is next.',
        'Each time you press "Step", that neuron does the only thing it knows: it multiplies each number it receives by its weight, adds everything up, adds its bias and checks whether the total is above zero.',
      ],
      consigna: 'Press "Step" three times and read each neuron\'s sum, below the drawing.',
      despues: [
        'All three do exactly what the single neuron of chapter 1 did. The only thing that changes is where their numbers come from: A and B take them from the inputs; C, from A and B.',
        'A network has no new operation. It is one neuron\'s sum, repeated.',
      ],
    },
    capas: {
      corto: 'Layer by layer',
      pregunta: 'Where does the last one get its inputs?',
      antes: [
        'The network arrives already calculated, with the left input at 0 and the right at 1. Now you can move the two inputs, and the network redoes the whole calculation each time.',
        'Look at C. It never sees your inputs: it only sees a 0 or a 1 from A and another from B. If A and B do not change their answer, C never finds out you moved anything.',
      ],
      consigna: 'Move the inputs. Select each neuron to read its sum and see which numbers C receives.',
      despues: [
        'A and B sit at the same stage of the calculation: they receive the same numbers and neither needs the other. They form a **layer**. Inside a layer the order does not matter: calculating A first or B first gives the same result. What matters is the order between layers: one whole layer, then the next.',
        'Going through the network like this, from the inputs to the output, layer by layer, is called a **forward pass**. Every time a network answers something, it has done one.',
      ],
    },
    prediccion: {
      corto: 'Bet before you look',
      pregunta: 'With these inputs, what comes out?',
      antes: [
        'Before calculating anything, place your bet. Both inputs are at 1 and the network has not been calculated. The weights and biases are in view: A has 1 and 1 with bias −0.5; B, 1 and 1 with bias −1.5; C, 1 and −1 with bias −0.5.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'With both inputs at 1, what does the network give in the end?',
        opciones: { uno: 'It gives 1: it turns on', cero: 'It gives 0: it stays off' },
        acierto: 'You got it.',
        error: 'Not this time.',
        explicacion: 'A adds up to 1 + 1 − 0.5 = 1.5 and turns on. B adds up to 1 + 1 − 1.5 = 0.5 and turns on too. C receives a 1 and a 1: 1 − 1 − 0.5 = −0.5. That is not above zero: the network gives 0.',
        pendiente: 'Choose an answer to see the calculation.',
      },
      despues: [
        'To find out, the whole pass had to be done: first A and B, and with what they gave, C. There is no shortcut. A network\'s answer is the end of that calculation.',
        'It is the XOR from the previous chapter: with both inputs at 1, it has to give 0.',
      ],
    },
    auto: {
      corto: 'The car\'s network',
      pregunta: 'And the car\'s network?',
      antes: [
        'The car in the app has five sensors and four keys: forward, left, right and back. Its network receives five numbers and gives four answers, one per key.',
        'This one has a hidden layer of six neurons. Its weights are random: it has not learned anything yet, which is why it presses three keys at once. What matters here is the shape of the calculation.',
      ],
      consigna: 'Watch it fill in: first the six in the hidden layer, then the four keys.',
      despues: [
        'It is the same forward pass, only wider: ten neurons instead of three and 54 weights instead of six. Each neuron in the hidden layer receives the five sensors; each key receives the six answers of the hidden layer.',
        'In the app the car does this whole calculation at every step of the simulation, with what its sensors read at that moment. In the last layer, each key is pressed if its sum is above zero.',
      ],
    },
    desafio: {
      corto: 'Challenge: turn it on',
      pregunta: 'Can you choose inputs that turn the network on?',
      antes: [
        'Last section, and it is a challenge. Back to the three-neuron network. The weights stay put: only the two inputs move, and now they can also take values in between, from 0 to 1.',
        'Both start at 0 and the network gives 0.',
      ],
      consigna: 'Move the inputs until the network gives 1.',
      desafioTexto: {
        estado: '{bien} of {total} neurons as needed',
        pedirPista: 'Give me a hint',
        pista: 'Think from the end. C turns on only if A says 1 and B says 0. How much do the inputs have to add up to so that A passes but B does not?',
        logrado: 'The network gives 1. To get there you had to think the pass backwards: what C needs, and so what A and B must answer.',
      },
      despues: [
        'There are many answers: any pair of inputs that adds up to more than 0.5 and no more than 1.5. With less, A does not turn on; with more, B turns on and switches C off.',
        'Now you know how a network answers: one forward pass. What comes next is what to do when that answer is wrong.',
      ],
    },
  },
  figura: {
    titulo: 'Figure: a three-neuron network calculated one neuron at a time, and the car\'s network',
    izquierda: 'left',
    derecha: 'right',
    encendida: 'on',
    apagada: 'off',
    capas: { entradas: 'inputs', oculta: 'hidden layer', salida: 'output layer', sensores: 'sensors', teclas: 'keys' },
    teclas: ['forward', 'left', 'right', 'back'],
    sinCuenta: 'No neuron has been calculated yet.',
    cuentaAuto: '{hechas} of {neuronas} neurons calculated, with {pesos} weights in total',
    calculadas: 'Calculated: {n} of {total}',
    daUno: 'The network gives 1',
    daCero: 'The network gives 0',
    marcadorAuto: 'Keys pressed: {teclas}',
    controles: {
      entradas: [
        { nombre: 'Left input', ayuda: 'The first number the network receives, from 0 to 1.' },
        { nombre: 'Right input', ayuda: 'The second number the network receives, from 0 to 1.' },
      ],
      paso: { rotulo: 'Step', ayuda: 'Calculates the next neuron.' },
      otraVez: { rotulo: 'Again', ayuda: 'Shows the calculation again from the start.' },
    },
    restablecer: { rotulo: 'Reset', ayuda: 'Back to this section\'s values.' },
    tocada: 'The figure is as you left it.',
    neurona: {
      descripcion: 'Select it to read its sum below the drawing.',
      calculada: 'Neuron {quien}: adds up to {suma} and gives {salida}.',
      pendiente: 'Neuron {quien}: not calculated yet.',
    },
    resumen: 'Inputs {x1} and {x2}. The network gives {salida}.',
    resumenAuto: 'Car network calculated. Keys pressed: {teclas}.',
  },
  profundizar: {
    titulo: 'Going deeper',
    intro: 'The forward pass, written for any layer.',
    formulas: [
      { nombre: 'What one neuron gives', formula: 'a = f(w₁·x₁ + w₂·x₂ + … + b)' },
      { nombre: 'A whole layer', formula: 'a⁽ˡ⁾ = f(W⁽ˡ⁾ · a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)' },
    ],
    simbolos: [
      { simbolo: 'x₁, x₂, …', que: 'the numbers the neuron receives' },
      { simbolo: 'w₁, w₂, …', que: 'the weight of each one' },
      { simbolo: 'b', que: 'the bias' },
      { simbolo: 'f', que: 'the activation: here, the step, which gives 1 if the sum is above zero and 0 if not' },
      { simbolo: 'a', que: 'what the neuron gives (its activation)' },
      { simbolo: 'a⁽ˡ⁾', que: 'what all the neurons of layer l give, as a list; a⁽⁰⁾ is the inputs' },
      { simbolo: 'W⁽ˡ⁾, b⁽ˡ⁾', que: 'all the weights of layer l, arranged in a table (a matrix), and all its biases' },
    ],
    frases: [
      'The second formula says the same as the first for every neuron of a layer at once. That is why networks are calculated with tables of numbers: one matrix multiplication per layer.',
      'The step is the simplest activation. The app also lets hidden layers use others (sigmoid, tanh and ReLU); the sigmoid is explained in the next chapter.',
    ],
  },
  fuentes: {
    titulo: 'Sources',
    nota: 'The figure\'s calculations are done by the same code the app uses to drive the car, with the step activation. The car network in the figure has random weights with a fixed seed: it always shows the same thing.',
    lista: [
      { texto: 'Goodfellow, I., Bengio, Y. and Courville, A. (2016). Deep Learning. MIT Press. Chapter 6: feedforward networks.', url: 'https://www.deeplearningbook.org', nota: '' },
      { texto: 'The project\'s code: the network and its calculation (src/core/network.js) and this chapter\'s calculation, with its tests (src/teoria/capitulos/adelante/cuenta.js).', url: '', nota: '' },
    ],
  },
};
