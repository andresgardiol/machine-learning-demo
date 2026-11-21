// English text of "Generalize or memorize" (seccion-teoria D12, chapter 8). Same keys as
// contenido/es/generalizar.js; the order of the sections and the figure's numbers come from
// capitulos/generalizar/guion.js.

export default {
  titulo: 'Generalize or memorize',
  bajada: 'Why getting everything you practised right is not enough, and how to measure what really matters.',
  cierre: {
    texto: 'That is why you measure with examples that were not used for learning. In the app, in the Compete tab, the brains race on tracks where they never practised: that is where you see which one generalizes. And in the Lab, "Held out" sets examples aside to measure with.',
    enlace: 'Continue in Compete',
  },
  tramos: {
    sabe: {
      corto: 'Getting the seen ones right',
      pregunta: 'If it gets everything it saw right, does it know?',
      antes: [
        'Forty examples. Each dot is two numbers, and its colour is the correct answer: orange or blue. The orange ones tend to be at the top left and the blue ones at the bottom right, but they mix in the middle. It is noisy data, like real data.',
        'Two ways of answering learned from these forty. One is a straight line, like that of a single neuron. The other is a memorizer: it stores the forty dots and, when asked about one, answers the colour of the nearest stored dot.',
      ],
      consigna: 'Look at the table: how many of the forty each one gets right.',
      despues: [
        'The memorizer gets 40 out of 40. The line, 35 out of 40: it cannot fix the five that ended up on the wrong side without breaking others.',
        'If you had to choose on this alone, the memorizer wins. But getting right what you have already seen is easy for someone who stored it all.',
      ],
    },
    como: {
      corto: 'How each one answers',
      pregunta: 'How does each one answer?',
      antes: [
        'To see the difference you have to look at what each would answer anywhere, not only where there is a dot. The background is painted in the colour of the answer: orange where it would answer orange, blue where it would answer blue.',
        'The red crosses are the dots missed by the one you are looking at.',
      ],
      consigna: 'Switch from "Line" to "Memorizer" and compare the two regions.',
      despues: [
        'The line splits the plane into two clean halves. It is not just any line: it is the one that gets the most right among 24 candidates, one every 15 degrees, all through the centre. It leaves five dots wrong and can do nothing about them.',
        'The memorizer draws a border full of twists, with islands: around each blue dot lost among orange ones there is a blue patch. It misses none because it made room for each one. It is not a neural network: it is the most literal way of memorizing.',
      ],
    },
    nuevos: {
      corto: 'Dots they never saw',
      pregunta: 'And with dots they never saw?',
      antes: [
        'There were more dots. Before starting, forty were set aside, drawn from the same place as the others, and neither of the two saw them. They are the hollow ones.',
        'The earlier dots are now faint, and the region painted on arrival is the memorizer\'s. The question is what each one answers where a new dot lands.',
      ],
      consigna: 'Choose whom to look at and switch from "Seen" to "New". See where the hollow dots land relative to each region.',
      despues: [
        'Examples that are kept without being used for learning are called **held-out examples**. They are good for one thing: setting an exam with questions that were not in the practice.',
        'The new dots come from the same two clusters, but they do not land in the same places. An island the memorizer drew for a stray dot can catch a new dot of the other colour.',
      ],
    },
    prediccion: {
      corto: 'Bet before you look',
      pregunta: 'Who gets more of the new ones right?',
      antes: [
        'Before seeing the numbers, place your bet. On the forty they saw, the memorizer got 40 and the line, 35. Now they are asked about the forty held out.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'On the forty new dots, who gets more right?',
        opciones: { memorizador: 'The memorizer, which missed none of the seen ones', recta: 'The line, which missed five of the seen ones', igual: 'Both the same' },
        acierto: 'You got it.',
        error: 'Not this time.',
        explicacion: 'The line gets 38 out of 40 on the new ones. The memorizer, 31 out of 40: nine misses, each one a new dot that landed closer to a seen dot of the other colour.',
        pendiente: 'Choose an answer to see the scores on the new dots.',
      },
      despues: [
        'The one with a perfect score in practice did worse in the exam. The line, which looked worse, kept the general shape of the data and let the five odd dots go.',
        'What matters about a model is how it answers what it has not seen. What it has seen already has its answer.',
      ],
    },
    nombre: {
      corto: 'What that is called',
      pregunta: 'What is that called?',
      antes: [
        'Now you can look at everything: either of the two, with the seen dots or the new ones, and with the crosses on what it misses. The figure starts on the memorizer, with the new dots.',
        'Find the memorizer\'s islands and see what happens to the new dots that land nearby.',
      ],
      consigna: 'Look at the memorizer with the new dots, and then at the line.',
      despues: [
        'When something gets far more right on what it saw than on what it did not, there is **overfitting**: it fitted those examples so closely that it learned their noise too. The opposite is to **generalize**: to answer new cases well.',
        'It is not a rule that the simplest always wins. With other data, a line can fall short and something with more twists may be needed. What always holds is how you check: with held-out examples.',
      ],
    },
    desafio: {
      corto: 'Challenge: hold out and choose',
      pregunta: 'Which one do you keep?',
      antes: [
        'Last section, and it is a challenge. Now you decide how many dots to hold out, and then which of the two to keep. It starts with 10% held out: eight dots out of eighty.',
        'With eight new dots, both get all eight right. There is no way to choose like that.',
      ],
      consigna: 'Move "Held out" until a difference shows on the new dots, and keep the one that does better there.',
      desafioTexto: {
        estado: '{bien} of {total} steps: hold out enough and choose',
        pedirPista: 'Give me a hint',
        pista: 'With few dots held out the exam is too short to tell them apart. Hold out more and look at the "new" column, not the "seen" one.',
        logrado: 'You chose by how it does on the held-out dots and not by what it got right in practice.',
      },
      despues: [
        'Holding out has a cost: each dot held out is one dot fewer to learn from. With very few held out nothing can be told apart; with too many, little is left to practise on.',
        'The same happens with the cars in the app: a brain that learned on one track can fail on another. That is why they are tested on tracks where they did not practise.',
      ],
    },
  },
  figura: {
    titulo: 'Figure: dots of two colours, the region where each way of answering gives each colour, and how many each one gets right',
    quien: { recta: 'the line', memorizador: 'the memorizer' },
    tabla: { vistos: 'seen', nuevos: 'new', de: '{n} of {total}' },
    apartados: 'held out: {n} of {total}',
    practica: 'to learn from: {n}',
    cuenta: {
      vistos: '{n} seen dots',
      nuevos: '{n} new dots',
      deVistos: 'of {total} seen',
      deNuevos: 'of {total} new',
    },
    leyenda: { vistos: 'seen', nuevos: 'new', fallo: 'miss' },
    controles: {
      mira: { rotulo: 'Whom to look at', recta: 'Line', memorizador: 'Memorizer', ayuda: 'Whose region is painted and whose misses are marked.' },
      muestra: { rotulo: 'Which dots', vistos: 'Seen', apartados: 'New', ayuda: 'The dots they learned from, or the held-out ones.' },
      elegido: { rotulo: 'Which one you keep', recta: 'Line', memorizador: 'Memorizer', ayuda: 'Which of the two you keep.' },
      apartar: { nombre: 'Held out', ayuda: 'What share of the dots is kept without being learned from.' },
    },
    restablecer: { rotulo: 'Reset', ayuda: 'Back to this section\'s values.' },
    tocada: 'The figure is as you left it.',
    resumen: 'On the {v} seen, the line gets {rv} and the memorizer, {mv}.',
    resumenNuevos: 'On the {v} seen, the line gets {rv} and the memorizer, {mv}. On the {n} new, {rn} and {mn}.',
  },
  profundizar: {
    titulo: 'Going deeper',
    intro: 'A simple way to put a number on overfitting.',
    formulas: [
      { nombre: 'Generalization gap', formula: 'gap = accuracy on the seen − accuracy on the held out' },
    ],
    simbolos: [
      { simbolo: 'accuracy', que: 'the share of the examples answered correctly, as a percentage' },
      { simbolo: 'the seen', que: 'the examples used for learning (the training set)' },
      { simbolo: 'the held out', que: 'the ones kept for measuring (the held-out or test set)' },
    ],
    frases: [
      'In the figure, the memorizer has 100% on the seen and 77.5% on the held out: a gap of 22.5 points. The line has 87.5% and 95%: no gap.',
      'The figure\'s memorizer is known as nearest neighbour. It is used for real, usually looking at several neighbours rather than one, precisely so as not to follow every stray dot.',
      'A neural network with many weights and few examples can do what the memorizer does: fit every dot. The app\'s Lab warns of it by watching two error curves, the practice one and the held-out one: when the first goes down and the second goes up, there is overfitting.',
    ],
  },
  fuentes: {
    titulo: 'Sources',
    nota: 'The dots and their split into seen and held out come from the same code the app\'s Lab uses, with a seed: they are always the same eighty. The line is the best of 24 candidates; nothing was trained on this page. The memorizer is a calculation of this chapter\'s own and does not exist in the app.',
    lista: [
      { texto: 'Goodfellow, I., Bengio, Y. and Courville, A. (2016). Deep Learning. MIT Press. Chapter 5: capacity, overfitting and underfitting.', url: 'https://www.deeplearningbook.org', nota: '' },
      { texto: 'The project\'s code: the data and its split (src/core/datasets.js) and this chapter\'s calculation, with its tests (src/teoria/capitulos/generalizar/cuenta.js).', url: '', nota: '' },
    ],
  },
};
