// English text of "Correcting a little at a time" (seccion-teoria D12, chapter 5). Same keys as
// contenido/es/corregir.js; the order of the sections and the figure's numbers come from
// capitulos/corregir/guion.js.

export default {
  titulo: 'Correcting a little at a time',
  bajada: 'How the error shrinks by nudging each weight a little, and how much a little is.',
  cierre: {
    texto: 'That is how a weight is corrected, and by how much. In the app, in the Lab tab, change the "Learning rate" and watch the error curves: a very small rate brings them down slowly and a very large one makes them jump.',
    enlace: 'Continue in the Lab, learning rate',
  },
  tramos: {
    lado: {
      corto: 'Which way',
      pregunta: 'Which way do I move the slider?',
      antes: [
        'In "Measuring the error" you lowered the error by looking at the whole curve. A network cannot: drawing one weight\'s curve means trying all its values, and a network has too many weights for that. All it has is the point where it stands.',
        'So now the curve is covered. You see the ball, which is the neuron as it is now, and the number of its error. Whatever you travel over stays drawn.',
      ],
      consigna: 'Move the weight to lower the error. Start on whichever side you like.',
      despues: [
        'It can be done blind: you move a little, check whether the number went down, and go back if it went up. But each try means calculating everything again, and with thousands of weights each one has to be tried separately.',
        'What is needed is something that says which way to go before moving.',
      ],
    },
    pendiente: {
      corto: 'The slope',
      pregunta: 'Is there anything that says which way?',
      antes: [
        'Yes, and it is at the very point where the ball stands. The ball is back at −2 and now the whole curve is in view, and on the ball there is an orange line touching it: it shows how steep the curve is right there.',
        'The tip of the line points towards where the error goes down.',
      ],
      consigna: 'Move the weight and watch the line: how it tilts, where it points and what happens at the bottom.',
      despues: [
        'That tilt is the **slope** of the error with respect to the weight. It is a number with a sign: negative, the error goes down if the weight goes up; positive, it goes down if the weight goes down. At −2 it is −0.29. At the bottom, near 4.3, it is zero: the line lies flat and there is nowhere lower to go.',
        'The important part: the slope comes from a calculation, at the point where you stand, without trying any other point. The set of the slopes of all the weights of a network is called the **gradient**. Here there is a single weight, so the gradient is a single number.',
      ],
    },
    cuanto: {
      corto: 'How far to move',
      pregunta: 'How far do I move?',
      antes: [
        'The slope says which way. What is left is how far. The rule is simple: move against the slope, and further the steeper the curve is. How much further is set by a number you choose.',
        'That number starts at 4, and the ball, at −2 again. The sum below shows the next step: the weight as it is now, minus 4 times the slope.',
      ],
      consigna: 'Press "One step" several times. Then reset, change the rate and try again.',
      despues: [
        'That number is the **learning rate**. The first step, with rate 4, takes the weight from −2 to −0.85. The steps shorten on their own: near the bottom the curve is almost flat, the slope is small and so is the step.',
        'The ball does not roll or pick up speed: it takes a step, works out the slope again where it landed, and takes another. With a small rate it gets there, but slowly.',
      ],
    },
    prediccion: {
      corto: 'Bet before you look',
      pregunta: 'With a very high rate, what happens?',
      antes: [
        'Before pressing anything, place your bet. If a larger rate gives longer steps, it seems best to raise it as far as possible. The ball is back at −2 and the rate is now 60, fifteen times what it was.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'With rate 60, what does the ball do in eight steps?',
        opciones: {
          llega: 'It reaches the bottom in one or two steps',
          vuelve: 'It overshoots once and then settles at the bottom',
          rebota: 'It jumps from one side of the bottom to the other, further each time',
        },
        acierto: 'You got it.',
        error: 'Not this time.',
        explicacion: 'The first step sends it to 15.21: on the other side of the bottom and off the drawing. From there it comes back near the bottom, but it does not stay: each step is so long that it crosses again, and the jumps grow. After eight steps it is at 10.24.',
        pendiente: 'Choose an answer to see the eight steps.',
      },
      despues: [
        'The slope says which way the error goes down right where you stand. It does not say how far it keeps going down. A step that is too long crosses the bottom and lands on the other side, sometimes higher than before.',
        'Hence the chapter\'s title: correcting a little at a time. The learning rate is chosen by trying. Too small, it takes long; too large, it overshoots, bounces or drifts away.',
      ],
    },
    mapa: {
      corto: 'With two weights',
      pregunta: 'And with two weights?',
      antes: [
        'So far the right weight has stayed still. If both move, the error is no longer a curve: it is a terrain. The ball starts somewhere else: left weight −2 and right weight 2. This map shows it from above, like a relief map. Each band is a step in height: the darker, the lower the error. The cross marks the bottom.',
        'The horizontal dashed line is the curve from the earlier sections: a slice of this same terrain, with the right weight fixed.',
      ],
      consigna: 'Press "One step" and follow the ball. Watch which way it goes down.',
      despues: [
        'At each step two slopes are calculated, one per weight, and each weight moves against its own. The two together are the gradient, and they point uphill; the ball goes the other way. Going down like this, step by step and against the gradient, is called **gradient descent**.',
        'With one neuron and this way of measuring the error, the terrain has a single valley: keep going down and you get there. In networks with layers the terrain is more complicated, and the descent can stall in places that are not the lowest.',
      ],
    },
    desafio: {
      corto: 'Challenge: get there in ten',
      pregunta: 'Can you reach the bottom in a few steps?',
      antes: [
        'Last section, and it is a challenge. You have ten steps and one slider: the rate. The ball starts at the same place on the map, with an error of 0.94.',
        'The rate is at 2. With that, ten steps are not enough.',
      ],
      consigna: 'Choose a rate and take the ten steps. You have to finish with an error below 0.6.',
      desafioTexto: {
        estado: '{bien} of {total} stretches of the way to the goal',
        pedirPista: 'Give me a hint',
        pista: 'With rate 2 the steps are short and even: the ball is heading the right way, but slowly. Reset and try a much larger rate.',
        logrado: 'Error below 0.6 in ten steps. You did not change any weight by hand: you chose a single number and the calculation did the rest.',
      },
      despues: [
        'On this map, a rate of 7 or more is enough. But you have seen that it cannot be raised without limit: on the curve, with 60, the ball bounced.',
        'This is how a network learns when there is a correct answer for each example: it measures the error, calculates the gradient, takes a short step against it, and repeats. One piece is missing: how to calculate the slope of a weight that sits in an earlier layer.',
      ],
    },
  },
  figura: {
    titulo: 'Figure: the error curve against one weight with a ball that takes steps, and the error map against two weights',
    ejes: { peso: 'left weight', pesoDerecho: 'right weight', error: 'mean error', pasos: 'steps' },
    fondo: 'bottom',
    meta: 'goal: {meta}',
    errorAhora: 'error {error}',
    pasosDados: 'step {n} of {total}',
    marcadorError: 'Mean error: {error}',
    marcadorPasos: 'Step {n}: error {error}',
    marcadorMapa: 'Mean error: {error}',
    sinPasos: 'No steps left',
    cuenta: {
      peso: 'weight',
      error: 'error',
      pendiente: 'slope',
      plano: 'here it goes down neither way',
      bajaDerecha: 'the error goes down to the right',
      bajaIzquierda: 'the error goes down to the left',
      formula: 'weight − rate × slope',
      pendientes: 'slopes',
      y: 'and',
      tasa: 'rate',
    },
    controles: {
      peso: { nombre: 'Left weight', ayuda: 'Moves the ball by hand, left or right.' },
      tasa: { nombre: 'Learning rate', ayuda: 'How far it moves at each step: higher, longer steps.' },
      paso: { rotulo: 'One step', ayuda: 'Moves the ball once, against the slope.' },
      otraVez: { rotulo: 'Again', ayuda: 'Shows the steps again from the start.' },
    },
    restablecer: { rotulo: 'Reset', ayuda: 'Back to this section\'s values.' },
    tocada: 'The figure is as you left it.',
    resumen: 'Left weight {w1}, right weight {w2}. Mean error {error}. Steps taken: {n}.',
  },
  profundizar: {
    titulo: 'Going deeper',
    intro: 'The gradient descent rule, for any weight.',
    formulas: [
      { nombre: 'One step of gradient descent', formula: 'w ← w − η · ∂E/∂w' },
      { nombre: 'The gradient', formula: '∇E = (∂E/∂w₁, ∂E/∂w₂, …)' },
    ],
    simbolos: [
      { simbolo: 'w', que: 'a weight (the bias is treated the same way)' },
      { simbolo: '←', que: '"becomes": the new value replaces the old one' },
      { simbolo: 'η', que: 'the learning rate (the Greek letter eta)' },
      { simbolo: 'E', que: 'the mean error' },
      { simbolo: '∂E/∂w', que: 'the slope of the error with respect to that weight: how much the error changes if the weight changes a tiny bit and the rest stay still (its partial derivative)' },
      { simbolo: '∇E', que: 'the gradient: the list of the slopes of all the weights' },
    ],
    frases: [
      'In the figure, each step uses the average of the eight examples, so that the ball follows exactly the curve that is drawn. The app corrects after each example, one by one: it is the same rule applied more often, and the path comes out more zigzagged.',
      'The figure\'s rates (4, 60) are large because this curve is very flat near the bottom. They cannot be compared with those of another problem: the rate that works depends on how steep each terrain is.',
    ],
  },
  fuentes: {
    titulo: 'Sources',
    nota: 'The figure\'s slope is calculated by the same code the app\'s Lab uses to correct weights. The examples and the map are those of the chapter "Measuring the error".',
    lista: [
      { texto: 'Goodfellow, I., Bengio, Y. and Courville, A. (2016). Deep Learning. MIT Press. Section 4.3 (gradient-based optimization) and chapter 8 (optimization).', url: 'https://www.deeplearningbook.org', nota: '' },
      { texto: 'The project\'s code: the weight corrections (src/core/backprop.js) and this chapter\'s calculation, with its tests (src/teoria/capitulos/corregir/cuenta.js).', url: '', nota: '' },
    ],
  },
};
