// English texts for "One line is not enough" (seccion-teoria D9, chapter 2). Same structure as
// contenido/es/xor.js.

export default {
  titulo: 'One line is not enough',
  bajada: 'What a single neuron cannot do, and how three of them solve it.',
  cierre: {
    texto: 'That was why layers are needed. In the app, in the Lab tab, pick the XOR gate: there you add the hidden layer and watch the network find those numbers on its own.',
    enlace: 'Continue in Lab, XOR',
  },
  tramos: {
    distintas: {
      corto: 'Only if they differ',
      pregunta: 'Can you switch it on only when the inputs are different?',
      antes: [
        'In "A neuron" you got an AND: the neuron switches on only with both inputs at 1. Let us try a request that sounds just as simple: switch on when the inputs are different. One yes and the other no.',
        'On the plane, the two circles must give 1 and the two squares, 0. The neuron starts the way the AND left it and gets only one of the four right.',
      ],
      consigna: 'Move the weights and the bias. Try to get all four points right.',
      despues: [
        'You can get to three. Nobody gets to four, and it is not for lack of patience.',
        'This request has a name: it is **XOR**, the "exclusive or". One or the other, but not both.',
      ],
    },
    tope: {
      corto: 'Never more than three',
      pregunta: 'Why does it never get past three?',
      antes: [
        'A neuron splits the plane with a straight line: on one side it gives 1 and on the other, 0. To get all four right you would need a line that leaves the two circles on one side and the two squares on the other.',
        'Now the line gets three right. The top-right square is wrong: it ended up on the side of the circles.',
      ],
      consigna: 'Turn and shift the line to fix that point. Watch which other one breaks.',
      despues: [
        'The circles sit on one diagonal and the squares on the other: they are crossed. No line leaves the circles on one side and the squares on the other. There is always one on the wrong side.',
        'Problems that can be solved with one line are called **linearly separable**. XOR is not. It is not a flaw of this figure: it is the limit of any single neuron. A 1969 book studied those limits in depth (it is in the history).',
      ],
    },
    dos: {
      corto: 'Two lines',
      pregunta: 'What about two lines?',
      antes: [
        'If one line is not enough, let us try two. A is back to turning on when either input is 1, and a second neuron arrives, B. It receives the same two inputs, but it has its own weights and its own bias. In other words, its own line: the dashed one.',
        'There is no final answer yet. Each point now has two answers, A\'s and B\'s: they are the two little squares next to it. White means 1.',
      ],
      consigna: 'Pick "Neuron B" and move its line. Watch the little squares of each point change. The small arrow on each line points to the side where that neuron switches on.',
      despues: [
        'With one line, the plane was split into two zones. With two lines there are up to four, and in each one A and B give a different combination.',
        'The question is no longer which side of a line a point falls on, but which zone.',
      ],
    },
    prediccion: {
      corto: 'Bet before you look',
      pregunta: 'Which points end up between the two lines?',
      antes: [
        'Before touching anything, place a bet. A is as before: it switches on if either input is 1. B has the same weights, 1 and 1, but a bias of −2.4: its line is up in the top corner, and all four points are on its off side.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'I raise B\'s bias from −2.4 to −1.5 and its line shifts towards the middle. Which points end up between the two lines?',
        opciones: { circulos: 'The two circles', tres: 'The same three as now', cuadrado: 'Only the top-right square' },
        acierto: 'You got it.',
        error: 'Not this time.',
        explicacion: 'With a bias of −1.5, B switches on only if the two inputs add up to more than 1.5. The top square adds up to 2: it passes, and ends up on the other side of B. The circles add up to 1: they do not pass. Between the two lines are exactly the two circles.',
        pendiente: 'Pick an answer to see what happens.',
      },
      despues: [
        'The light strip is the zone where A says yes and B says no. The two circles ended up there, alone. Neither line separates XOR, but between the two they fence it in.',
        'What is missing is someone to look at both answers and say "this point is in the strip".',
      ],
    },
    junta: {
      corto: 'The one that joins them',
      pregunta: 'Who joins the two answers?',
      antes: [
        'A third neuron, C. It does not look at the inputs: it receives what A and B answered, and does the usual with that. It multiplies, adds its bias and checks whether the total is above zero.',
        'For now C has weights 1 and 1 and a bias of −0.5: it switches on if A or B switch on. It gets three right.',
      ],
      consigna: 'Tap each point and follow the sum: what A and B answer, and what C does with that.',
      despues: [
        'This is already a **neural network**: neurons that pass their answer on to another. A and B form a **hidden layer**: what they answer is not seen from outside, it only serves C. C is the **output layer**.',
        'The point that fails is the top-right square. There A and B both switch on, and one is enough for C.',
      ],
    },
    desafio: {
      corto: 'Challenge: XOR',
      pregunta: 'Can you make the network give XOR?',
      antes: [
        'Last stretch, and it is a challenge. A and B stay fixed, with the two circles in the strip. Only C\'s three dials move.',
        'C has to switch on when A says yes and B says no. And only then.',
      ],
      consigna: 'Move C\'s weights and bias until all four points are right.',
      desafioTexto: {
        estado: '{bien} of {total} points right',
        pedirPista: 'Give me a hint',
        pista: 'Let A push in favour and B against, with the same strength. Then a bias that does not let C switch on by itself.',
        logrado: 'Four out of four. Three neurons do what one alone cannot: an **XOR**.',
      },
      despues: [
        'Look at the light zone on the plane: it is no longer one side of a line, it is a strip. By adding neurons, a network draws zones that a single one cannot. It is not the only way: many different networks give XOR. This is one.',
        'We set these nine numbers by hand. A network in real use has thousands, millions or many more. That leaves the question that opens the chapters to come: who finds those numbers?',
      ],
    },
  },
  figura: {
    titulo: 'Figure: the four XOR points on the plane and a network that grows from one neuron to three',
    entradaIzq: 'left input',
    entradaDer: 'right input',
    izquierda: 'left',
    derecha: 'right',
    encendida: 'on',
    apagada: 'off',
    aciertos: '{bien} of {total} points right',
    fichas: 'what A and B answer',
    selector: { rotulo: 'Which neuron you move', a: 'Neuron A', b: 'Neuron B' },
    controles: {
      w1: {
        nombre: 'Left weight of {quien}',
        deC: 'Weight of A',
        ayuda: 'How much the left input counts, for or against.',
        ayudaDeC: 'How much A\'s answer counts, for or against.',
      },
      w2: {
        nombre: 'Right weight of {quien}',
        deC: 'Weight of B',
        ayuda: 'How much the right input counts, for or against.',
        ayudaDeC: 'How much B\'s answer counts, for or against.',
      },
      b: {
        nombre: 'Bias of {quien}',
        deC: 'Bias of C',
        ayuda: 'Always added. More negative: harder to switch on.',
        ayudaDeC: 'Always added. More negative: harder to switch on.',
      },
    },
    restablecer: {
      rotulo: 'Reset',
      ayuda: 'Goes back to the values of this stretch.',
    },
    tocada: 'The figure is as you left it.',
    punto: {
      descripcion: 'Pick it to see the sum for this case in the network.',
      conSalida: 'Left {x1}, right {x2}. It must give {esperada}. It gives {salida}: {veredicto}.',
      conDos: 'Left {x1}, right {x2}. A answers {a} and B answers {b}.',
      bien: 'right',
      mal: 'wrong',
    },
    resumen: 'Neurons: {neuronas}. Points right: {bien} of {total}.',
    resumenDos: 'Two neurons, A and B. Points between the two lines: {n}.',
    sinRecta: 'With both weights at zero, {quien} has no line.',
    rectaFuera: 'The line of {quien} is outside the drawing.',
  },
  profundizar: {
    titulo: 'Going deeper',
    intro: 'This chapter\'s network as a formula, and how far one hidden layer goes.',
    formulas: [
      { nombre: 'The hidden layer', formula: 'A = f(x₁ + x₂ − 0.5)    B = f(x₁ + x₂ − 1.5)' },
      { nombre: 'The output', formula: 'y = f(A − B − 0.5)' },
    ],
    simbolos: [
      { simbolo: 'x₁, x₂', que: 'the two inputs' },
      { simbolo: 'f', que: 'the step: it gives 1 if what is inside is above zero and 0 if not' },
      { simbolo: 'A, B', que: 'what the two neurons of the hidden layer answer' },
      { simbolo: 'y', que: 'what the network answers' },
    ],
    frases: [
      'There is a general result: with a single hidden layer and enough neurons, a network can approximate any continuous function as closely as wanted. It is known as the universal approximation theorem (Cybenko, 1989; Hornik, Stinchcombe and White, 1989).',
      'That result says such a network exists. It does not say how many neurons are needed or how to find its weights: that is what the following chapters are about.',
    ],
  },
  fuentes: {
    titulo: 'Sources',
    nota: 'The figure\'s math is done by the same code the app uses, with a step activation. That a single neuron never gets past three out of four is checked by a test over every position of the dials.',
    lista: [
      { texto: 'Minsky, M. and Papert, S. (1969). Perceptrons. MIT Press.', url: '', nota: 'XOR is the smallest case of the limits the book proves for a single-layer perceptron. The book was not read: the fact was checked with searches.' },
      { texto: 'Rumelhart, D., Hinton, G. and Williams, R. (1986). Learning representations by back-propagating errors. Nature 323, 533–536.', url: '', nota: 'On how hidden layers are trained: the subject of chapters to come.' },
      { texto: 'Cybenko, G. (1989). Approximation by superpositions of a sigmoidal function. Mathematics of Control, Signals, and Systems 2, 303–314.', url: '', nota: 'For "Going deeper". The paper was not read: the details were checked with searches.' },
      { texto: 'Hornik, K., Stinchcombe, M. and White, H. (1989). Multilayer feedforward networks are universal approximators. Neural Networks 2(5), 359–366.', url: '', nota: 'For "Going deeper". The paper was not read: the details were checked with searches.' },
      { texto: 'The project code: the network and its math (src/core/network.js) and the math of this chapter, with its tests (src/teoria/capitulos/xor/cuenta.js).', url: '', nota: '' },
    ],
  },
};
