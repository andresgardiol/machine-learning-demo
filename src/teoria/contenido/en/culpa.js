// English text of "Sharing the blame" (seccion-teoria D12, chapter 6). Same keys as
// contenido/es/culpa.js; the order of the sections and the figure's numbers come from
// capitulos/culpa/guion.js.

export default {
  titulo: 'Sharing the blame',
  bajada: 'How each weight, including those in earlier layers, finds out how much it had to do with the error.',
  cierre: {
    texto: 'That is how a network with layers corrects all its weights. In the app, in the Lab tab, pause, step one phase at a time and watch "Current example": it is this same forward and backward pass, with each neuron\'s blame and each weight\'s change.',
    enlace: 'Continue in the Lab',
  },
  tramos: {
    quien: {
      corto: 'Which weight was to blame',
      pregunta: 'With layers, which weight was to blame?',
      antes: [
        'To correct a weight you need its slope: how much the error changes if that weight changes. With a single neuron that was easy, because each weight touches the answer directly. In a network with layers, the weights of A and B affect the answer only through C.',
        'This is the three-neuron network, with two changes: now all three answer with the smooth output, a number between 0 and 1, and the weights are different: round numbers, set without thinking about XOR. The example: a 1 comes in on the left and a 0 on the right, and the correct answer is 1.',
      ],
      consigna: 'Follow the forward calculation: what A answers, what B answers and what C answers.',
      despues: [
        'The network answered 0.41 and should have given 1. The error for this example is 0.9.',
        'Nine numbers took part in that answer: six weights and three biases. Some pushed the right way and others the wrong way. The question is how much falls to each.',
      ],
    },
    salida: {
      corto: 'The output\'s blame',
      pregunta: 'How much blame does the output carry?',
      antes: [
        'You start at the end, which is the only thing that can be compared with the correct answer. C answered 0.41 and should have answered 1.',
      ],
      consigna: 'Press "Step".',
      despues: [
        'The orange diamond next to C says −0.59: what it answered minus what it should have answered. That number is called the neuron\'s **blame**. Negative means it fell short: it should have given more.',
        'It is not a reproach: it is a signed measure. It says which way and how much C\'s sum would have to change for the error to go down.',
      ],
    },
    atras: {
      corto: 'Blame travels backwards',
      pregunta: 'How does the blame reach the ones behind?',
      antes: [
        'A and B have no correct answer to compare against: nobody said what they should give. All that is known is how much each one influenced C, and that is what the weight joining them says.',
        'So C\'s blame goes back along the same connections the calculation came through, in the opposite direction.',
      ],
      consigna: 'Press "Step" and watch the orange tips: they carry C\'s blame towards A and towards B.',
      despues: [
        'Each hidden neuron receives C\'s blame multiplied by the weight joining them: it is in the list on the right. A, joined by a weight of 1, receives −0.59. B, joined by −1, receives 0.59: with the sign flipped, because its weight is negative.',
        'What arrives is multiplied by one more number: how sensitive that neuron was, that is, the slope of its curve at the point where it landed. A\'s blame ends up at −0.14 and B\'s at 0.15. That is why this chapter does not use the step: the step is flat everywhere except at the jump: it has no usable slope, and the blame could not pass through it.',
      ],
    },
    prediccion: {
      corto: 'Bet before you look',
      pregunta: 'Which weight changes the most?',
      antes: [
        'Before seeing the changes, place your bet. All three blames are in. With them each weight is corrected using the rule from the previous chapter: against its slope, times the rate. And the slope of a weight is the blame of the neuron it leads to, multiplied by what that connection was carrying.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'Of these three weights, which changes the most?',
        opciones: {
          salida: 'The one from A to C (it is 1)',
          entrada: 'The one from the left input to A (it is −1.5)',
          apagada: 'The one from the right input to A (it is 0.5)',
        },
        acierto: 'You got it.',
        error: 'Not this time.',
        explicacion: 'The one from A to C leads to the neuron with the most blame (−0.59) and was carrying 0.62: it changes by +0.18. The one from the left input leads to A, which has less blame (−0.14): it changes by +0.07. The one from the right input was carrying a 0: it does not change at all, because it had nothing to do with it.',
        pendiente: 'Choose an answer to see how much each weight changes.',
      },
      despues: [
        'To the right of the network is the change of each weight and each bias. In this example, the weights leading to C change more than the ones behind: the blame reached A and B smaller. And the biases change too: C\'s changes the most, +0.3.',
        'Nobody tried anything out. With one forward pass and one backward pass, each of the nine numbers found out which way to move and by how much.',
      ],
    },
    epocas: {
      corto: 'With every example',
      pregunta: 'And if it is repeated with every example?',
      antes: [
        'That was one example and one correction. The network has to get four right: the four cases of XOR. The same is done with each one, one after another: forward, backward, correction. And when the examples run out, it starts again.',
        'On the right the curve of the mean error of the four examples appears. It starts at 0.72, with the network getting one out of four right.',
      ],
      consigna: 'Press "One epoch" and watch the weights change. Then press "100 epochs" several times: follow the curve and how many it gets right.',
      despues: [
        'One complete pass through all the examples is an **epoch**. The method of calculating the slopes of all the weights by going from the output backwards is called **backpropagation**. It is not another way of learning: it is the way to calculate the gradient in a network with layers. What does the correcting is still gradient descent.',
        'Keep pressing and watch the curve and the count of right answers. It does not always get to four: in a network with layers the error terrain has places where the descent stalls without being the best, and with other starting weights the network can stay there.',
      ],
      logroTexto: 'Four out of four. With these starting weights the network came to give **XOR**, and nobody set its weights.',
    },
    desafio: {
      corto: 'Challenge: correct a weight',
      pregunta: 'Can you correct a weight by hand?',
      antes: [
        'Last section, and it is a challenge. Back to the starting network and the first example. A single weight moves, the one from A to C: the one that changed the most. It has the blue border.',
        'On the right is what the calculation says about that weight: which way it should move. It does not tell you how far.',
      ],
      consigna: 'Move the weight in the direction its blame indicates, five steps of 0.1, and watch the error.',
      desafioTexto: {
        estado: '{bien} of {total} steps in the direction of the blame',
        pedirPista: 'Give me a hint',
        pista: 'C\'s blame is negative: it answered too little. What it receives from A is positive. For C to answer more, that weight has to grow.',
        logrado: 'Five steps, and the example\'s error went down. You did by hand what backpropagation and gradient descent do with all the weights at once.',
      },
      despues: [
        'If you move it the other way, the error goes up: the blame was right. That is all you need to know about a weight to correct it.',
        'That covers how a network learns when someone tells it the correct answer for each example. Driving a car is not like that: nobody knows which key was the right one at each instant. For that there is another way of searching for the weights, and it is the next chapter.',
      ],
    },
  },
  figura: {
    titulo: 'Figure: a three-neuron network; the calculation goes forwards and the blame comes back',
    izquierda: 'left',
    derecha: 'right',
    responde: 'answers {salida}, should be {correcta}',
    error: 'error {error}',
    aciertos: '{n} of {total} right',
    ejes: { epocas: 'mean error per epoch' },
    nombres: { izquierda: 'left', derecha: 'right', peso: '{de} → {a}', sesgo: 'bias of {a}', llega: '{a} receives' },
    lista: { llega: 'C\'s blame, through each weight', cambios: 'how much each one changes', desafio: 'what the calculation says' },
    sube: 'it should go up',
    baja: 'it should go down',
    quieto: 'no need to move it',
    sinCulpa: 'not calculated yet',
    cuenta: {
      respondio: 'answered',
      debia: 'and should be',
      error: 'error',
      culpaDe: 'blame of {quien}',
      cambio: 'change of the weight from A to C',
      epoca: 'epoch {n}',
      errorMedio: 'mean error',
      peso: 'weight from A to C',
    },
    leyenda: { culpa: 'blame', aFavor: 'weight in favour', enContra: 'weight against' },
    controles: {
      paso: { rotulo: 'Step', ayuda: 'Takes the blame one layer further back.' },
      epoca: { rotulo: 'One epoch', ayuda: 'Corrects the network with the four examples, once.' },
      cien: { rotulo: '100 epochs', ayuda: 'Corrects the network with the four examples, a hundred times.' },
      peso: { nombre: 'Weight from A to C', ayuda: 'How much what A answers counts for C.' },
    },
    restablecer: { rotulo: 'Reset', ayuda: 'Back to this section\'s values.' },
    tocada: 'The figure is as you left it.',
    resumen: 'The network answers {salida}. Error {error}. Blame of the output: {culpa}.',
    resumenEpocas: 'Epoch {n}. Mean error {error}. {bien} of {total} right.',
  },
  profundizar: {
    titulo: 'Going deeper',
    intro: 'Backpropagation, with the names the app uses.',
    formulas: [
      { nombre: 'Blame of the output', formula: 'δ = ŷ − y' },
      { nombre: 'Blame of a hidden neuron', formula: 'δⱼ = ( Σₖ δₖ · wₖⱼ ) · f′(zⱼ)' },
      { nombre: 'Change of a weight', formula: 'Δw = −η · δ · a' },
    ],
    simbolos: [
      { simbolo: 'δ', que: 'a neuron\'s blame: the slope of the error with respect to its sum (the Greek letter delta)' },
      { simbolo: 'ŷ, y', que: 'what the network answered and what it should have answered' },
      { simbolo: 'Σₖ', que: 'the sum over the neurons of the next layer, the ones that receive this one' },
      { simbolo: 'wₖⱼ', que: 'the weight joining this neuron (j) to each of the next ones (k)' },
      { simbolo: 'f′(zⱼ)', que: 'the slope of the activation at the sum it got; with the sigmoid it is a · (1 − a)' },
      { simbolo: 'η', que: 'the learning rate; in the figure, 0.5' },
      { simbolo: 'a', que: 'what the connection was carrying: the output of the neuron the weight comes from, or the input' },
    ],
    frases: [
      'It is the chain rule of calculus, applied in order: to know how a weight further back affects the error, you multiply the influences of each link along the way. Doing it from the output backwards lets the blames already calculated be reused, which is why a single pass is enough.',
      'It is no accident that the output\'s blame is so simple (ŷ − y): it comes from combining the sigmoid with the cross-entropy of chapter 4.',
      'With the step, f′ is zero everywhere except at the jump: no blame would pass backwards. The app does not let a network with the step in its hidden layers learn this way.',
      'The idea has several authors. The 1986 paper by Rumelhart, Hinton and Williams was the one that made it widely known, not the first to use it: it is in the history.',
    ],
  },
  fuentes: {
    titulo: 'Sources',
    nota: 'The figure\'s calculations are done by the same code the app\'s Lab uses: the forward pass, the blames, the corrections and the pass through the examples. The starting weights are fixed and were chosen so that the network starts out wrong and the correction comes to give XOR. With other weights it can stall earlier: what you see when running the epochs is what the calculation gives with these.',
    lista: [
      { texto: 'Rumelhart, D., Hinton, G. and Williams, R. (1986). Learning representations by back-propagating errors. Nature 323, 533–536.', url: '', nota: '' },
      { texto: 'Goodfellow, I., Bengio, Y. and Courville, A. (2016). Deep Learning. MIT Press. Chapter 6, section 6.5: backpropagation.', url: 'https://www.deeplearningbook.org', nota: '' },
      { texto: 'The project\'s code: backpropagation (src/core/backprop.js) and this chapter\'s calculation, with its tests (src/teoria/capitulos/culpa/cuenta.js).', url: '', nota: '' },
    ],
  },
};
