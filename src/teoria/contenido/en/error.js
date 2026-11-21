// English text of "Measuring the error" (seccion-teoria D12, chapter 4). Same keys as
// contenido/es/error.js; the order of the sections and the figure's numbers come from
// capitulos/error/guion.js.

export default {
  titulo: 'Measuring the error',
  bajada: 'How to put a number on "how wrong was that".',
  cierre: {
    texto: 'That is how you measure how badly a network answers. In the app, in the Lab tab, watch "Current example" and "Error curves" while the network learns: they are this same number, example by example and for all of them together.',
    enlace: 'Continue in the Lab',
  },
  tramos: {
    saber: {
      corto: 'Knowing it was wrong',
      pregunta: 'How does a network know it got it wrong?',
      antes: [
        'On its own, it does not. Someone has to tell it what the answer should have been. Here are eight examples: what the car\'s two sensors read and, for each one, the correct answer. A circle on the right is a 1: it should turn. A square on the left is a 0: it should keep going.',
        'The white diamond is what an artificial neuron like the one in chapter 1 answers, with weight 2 for the left sensor and −2 for the right one. If the diamond lands on the correct answer, it got it right.',
      ],
      consigna: 'Go through the eight examples. Select one to read its sum below.',
      despues: [
        'It gets six out of eight. It misses 7 and 8, and that is no accident: 7 looks a lot like 2, but its correct answer is the opposite. The same goes for 8 and 4. The data contradicts itself a little, as real data does.',
        'Counting hits is a first way of measuring. But it is a coarse one: it says how many, not by how much.',
      ],
    },
    cuanto: {
      corto: 'By a lot or a little',
      pregunta: 'Was it wrong by a lot or by a little?',
      antes: [
        'Look at example 7. Its sum came to 0.4: just barely above zero, and the neuron answered 1. In example 1 the sum came to 1.4, and it also answered 1. To the step they are the same: a 1 is a 1.',
        'With the step, the neuron cannot say "I think so, but I am not sure". And without that there is no way to tell whether it was close.',
      ],
      consigna: 'Switch from "Step" to "Smooth" and watch where each diamond goes.',
      despues: [
        'Now the answer is a number between 0 and 1. A very positive sum gives almost 1; a very negative one, almost 0; a sum of zero gives exactly 0.5. Example 1 answers 0.8 and example 7, 0.6: both say "turn", but 7 with less confidence.',
        'This is called a **smooth output**, and the curve that draws it is the **sigmoid**. It decides just as the step does (it crosses 0.5 exactly when the sum crosses zero), but it also says how sure it is.',
      ],
    },
    vale: {
      corto: 'How much the error is',
      pregunta: 'How much is that error worth?',
      antes: [
        'The neuron now answers with the smooth output. With an answer between 0 and 1, the distance to the correct one can be measured. Each example\'s orange bar runs from what the neuron answered to what it should have answered. The number on the right says how much it is worth.',
        'Example 1 answered 0.8 and should have given 1: it was close, and its number is small, 0.22.',
      ],
      consigna: 'Select the examples one by one. Find the one with the longest bar and the one with the shortest.',
      despues: [
        'That number is the example\'s **error**. It is 0 when the answer is exactly the correct one and grows the further away it lands. Example 7 answered 0.6 when it should have given 0: its error is 0.91, the highest together with example 8\'s.',
        'It does not grow evenly: the surer the neuron was of the wrong answer, the faster it climbs, and it has no ceiling. This way of measuring is called cross-entropy and it is the one the app uses; the formula is at the end, under "Going deeper".',
      ],
    },
    prediccion: {
      corto: 'Bet before you look',
      pregunta: 'Which of these two has the smaller error?',
      antes: [
        'Before seeing the numbers, place your bet. I flipped the neuron\'s weights, and now it gets almost everything wrong. Two examples are left in view, 1 and 3. In both the answer should have been 1, and in both the diamond ended up on the 0 side.',
        'In example 1 it answered 0.2. In example 3, 0.4.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'Both answers are wrong. Which one has the smaller error?',
        opciones: { a: 'Example 1, which answered 0.2', b: 'Example 3, which answered 0.4', igual: 'The same: both ended up on the wrong side' },
        acierto: 'You got it.',
        error: 'Not this time.',
        explicacion: 'Example 3 landed closer to 1: its error is 0.91. Example 1 answered 0.2, almost sure it should keep going: its error is 1.62. Counting hits they are worth the same, one miss; measuring the error, they are not.',
        pendiente: 'Choose an answer to see both errors.',
      },
      despues: [
        'Being wrong while in doubt costs less than being wrong and sure. That is why the smooth output was needed: with the step, these two answers were the same 0.',
        'And that is exactly what learning needs: a number that changes a little when the answer improves a little, even if it is still wrong.',
      ],
    },
    todos: {
      corto: 'All together',
      pregunta: 'And the error of all the examples together?',
      antes: [
        'One example is not enough to judge the neuron: it can get one right and miss the rest. The errors of all eight are averaged, leaving a single number.',
        'The drawing on the right has changed. Now the bottom axis is the left weight and the height is that average. For this section both weights start at −2. The ball sits where the left weight is: at −2, with an error of 1.15.',
      ],
      consigna: 'Move the left weight from end to end and follow the ball.',
      despues: [
        'That average is the **mean error**. As the weight moves, the ball traces a curve: high on the left, down to a bottom near 2.3, and up again. Each point on the curve is a different neuron, and the height says how badly it answers.',
        'With this, "learning" stops being a vague idea: it is finding the weights where that curve is lowest.',
      ],
    },
    desafio: {
      corto: 'Challenge: lower it by hand',
      pregunta: 'Can you bring the error down by hand?',
      antes: [
        'Last section, and it is a challenge. Now both weights and the bias move. The neuron starts with its weights the wrong way round: it gets two out of eight and its mean error is 0.94.',
        'The curve on the right still shows the error against the left weight, but it changes shape when you move the other two.',
      ],
      consigna: 'Bring the mean error below 0.6.',
      desafioTexto: {
        estado: '{bien} of {total} stretches of the way to the goal',
        pedirPista: 'Give me a hint',
        pista: 'Look at the examples where it should turn: the left sensor reads more than the right one. Let the left one push in favour and the right one against.',
        logrado: 'Mean error below 0.6. You lowered it by watching a single number, without going example by example.',
      },
      despues: [
        'You will not reach zero: some examples contradict each other, and no neuron gets all eight right. With this data, however hard you look, the mean error does not go below 0.48.',
        'You did it by hand and with three numbers. A network has thousands. What comes next is how to know, for each weight, which way to move it without trying.',
      ],
    },
  },
  figura: {
    titulo: 'Figure: eight examples with their correct answer, what a neuron answers and the error of each one',
    columnas: { izquierda: 'left', derecha: 'right', responde: 'answers', error: 'error' },
    ejes: { suma: 'sum', responde: 'answers', peso: 'left weight', error: 'mean error' },
    acierta: '{n} of {total} right',
    errorMedio: 'mean error {error}',
    meta: 'goal: {meta}',
    cuenta: { respondio: 'answered', debia: 'and should be', error: 'error', medio: 'average of the {total} errors' },
    leyenda: { uno: 'should give 1', cero: 'should give 0', responde: 'what it answers' },
    selector: { rotulo: 'How the neuron answers', escalon: 'Step', suave: 'Smooth', ayuda: 'Step: it answers 0 or 1. Smooth: a number between 0 and 1.' },
    controles: {
      w1: { nombre: 'Left weight', ayuda: 'How much the left sensor counts, for or against.' },
      w2: { nombre: 'Right weight', ayuda: 'How much the right sensor counts, for or against.' },
      b: { nombre: 'Bias', ayuda: 'Always added, whatever the sensors read.' },
    },
    restablecer: { rotulo: 'Reset', ayuda: 'Back to this section\'s values.' },
    tocada: 'The figure is as you left it.',
    fila: {
      descripcion: 'Select it to read its sum below the drawing.',
      sinError: 'Example {n}: left {x1}, right {x2}. Should give {correcta}. Answers {dice}: {veredicto}.',
      conError: 'Example {n}: left {x1}, right {x2}. Should give {correcta}. Answers {dice}: {veredicto}. Error {error}.',
      bien: 'right',
      mal: 'wrong',
    },
    resumenError: 'Mean error {error}. {n} of {total} right.',
  },
  profundizar: {
    titulo: 'Going deeper',
    intro: 'The smooth output and the error measure the app uses.',
    formulas: [
      { nombre: 'Sigmoid (the smooth output)', formula: 'ŷ = 1 / (1 + e⁻ᶻ)' },
      { nombre: 'Cross-entropy (the error of one example)', formula: 'E = −[ y·ln(ŷ) + (1 − y)·ln(1 − ŷ) ]' },
      { nombre: 'Mean error', formula: 'Ē = (E₁ + E₂ + … + Eₙ) / n' },
    ],
    simbolos: [
      { simbolo: 'z', que: 'the neuron\'s sum: each input times its weight, plus the bias' },
      { simbolo: 'e', que: 'a fixed number, close to 2.718' },
      { simbolo: 'ŷ', que: 'what the neuron answers, between 0 and 1' },
      { simbolo: 'y', que: 'the correct answer: 0 or 1' },
      { simbolo: 'ln', que: 'the natural logarithm' },
      { simbolo: 'E', que: 'the error of one example' },
      { simbolo: 'n', que: 'how many examples there are' },
    ],
    frases: [
      'Since y is 0 or 1, only one of the two terms survives: if the answer should be 1, the error is −ln(ŷ); if it should be 0, it is −ln(1 − ŷ). As ŷ approaches the opposite answer, the logarithm shoots up: that is why it has no ceiling.',
      'The smooth output can be read as a probability: 0.8 is "an 80% chance it should turn", according to the neuron. It is its confidence, not a fact.',
      'It is not the only measure. Another widely used one is the squared error, (ŷ − y)², easier to read and with a ceiling. The error measure is usually called the loss.',
    ],
  },
  fuentes: {
    titulo: 'Sources',
    nota: 'The figure\'s calculations are done by the same code the app\'s Lab uses: the sigmoid and cross-entropy. The eight examples were made up for this chapter; two of them contradict the rest on purpose.',
    lista: [
      { texto: 'Goodfellow, I., Bengio, Y. and Courville, A. (2016). Deep Learning. MIT Press. Chapters 5 and 6: cost functions and cross-entropy.', url: 'https://www.deeplearningbook.org', nota: '' },
      { texto: 'The project\'s code: the smooth output and the error (src/core/backprop.js) and this chapter\'s calculation, with its tests (src/teoria/capitulos/error/cuenta.js).', url: '', nota: '' },
    ],
  },
};
