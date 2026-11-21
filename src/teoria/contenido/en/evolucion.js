// English text of "Learning by evolution" (seccion-teoria D12, chapter 7). Same keys as
// contenido/es/evolucion.js; the order of the sections and the figure's numbers come from
// capitulos/evolucion/guion.js.

export default {
  titulo: 'Learning by evolution',
  bajada: 'Another way to find the weights: try many, keep the best and vary them.',
  cierre: {
    texto: 'That is how weights are searched for when all there is is a score. In the app, in the Train tab, launch a population of cars and follow it from generation to generation. Try changing the "Mutation strength", and choosing who gets through yourself.',
    enlace: 'Continue in Train',
  },
  tramos: {
    puntaje: {
      corto: 'Only a score',
      pregunta: 'What if nobody knows the correct answer at each step?',
      antes: [
        'Sharing the blame requires knowing what the answer should have been for each example. When driving, that does not exist: nobody knows which key was the right one at each instant. What is known, once the car finishes, is how it did. A single number at the end: a score.',
        'To see it in miniature, there are no cars here: there are twelve artificial neurons like the one in "Measuring the error", with the same eight examples. We know one thing about each: its mean error. The lower, the better it did.',
      ],
      consigna: 'Look at the list on the right: all twelve, from best to worst.',
      despues: [
        'Each dot is a neuron, and its place is its two weights. The best has an error of 0.68; the worst, 1.31. Nobody told them where they went wrong or which way to correct. Only what each one scored.',
        'With so little, no slope can be calculated. The search has to be done some other way.',
      ],
    },
    azar: {
      corto: 'Many at random',
      pregunta: 'What happens if I try many at random?',
      antes: [
        'These twelve came out at random: any two weights for each. If nothing else is known, the simplest thing is to draw another twelve and see whether one comes out better.',
      ],
      consigna: 'Press "Another batch" several times and watch the error of the best one.',
      despues: [
        'Sometimes a good one comes out and sometimes not. In the first batch the best had 0.68; in the second, 0.53. The group tried together is called a **population**, and each one\'s score, its **fitness**: how well it did. Here fitness means having little error.',
        'The trouble with drawing random batches is that nothing builds up. Each batch starts from scratch, and the good one that had come out is lost.',
      ],
    },
    seleccion: {
      corto: 'Which ones to keep',
      pregunta: 'Which ones do I keep?',
      antes: [
        'We are back at the twelve from the start, the first batch. Instead of throwing them away and drawing others, the best are kept. Under the dots you can now see the relief from the previous chapter: the darker, the lower the error. The neurons do not see it; it is there so that you can see where each one landed.',
        'The ones that get through have a ring. The best of all is the star.',
      ],
      consigna: 'Move "How many get through" from 1 to 6 and watch which ones stay.',
      despues: [
        'Choosing which ones go on is **selection**. The rest are discarded. The best of all is the **elite**: it goes to the next batch exactly as it is, with no change, so that the best thing found is not lost.',
        'If few get through, everything is bet on what already went well. If many do, the mediocre ones are carried along too.',
      ],
    },
    mutacion: {
      corto: 'How the next ones come out',
      pregunta: 'How do the next ones come out?',
      antes: [
        'We stay with the first batch, and again three get through. The twelve of the next batch come from those three. The elite goes through unchanged. The other eleven are copies of one of the three, with a random change: each weight shifts a little towards an arbitrary value.',
        'How far it shifts is set by the strength of the change, which starts at 30%.',
      ],
      consigna: 'Press "Next generation" several times. Then reset and try another strength.',
      despues: [
        'That random change is **mutation**, and each new batch is a **generation**. The dashed circles mark where the ones that got through were: the children land around them, some better placed and some worse. With strength 30%, in the first generation the best goes from 0.68 down to 0.56.',
        'Then it repeats: the new twelve are scored, the best get through, and their mutated copies form the next generation. The population drifts towards the dark area without anyone calculating a slope.',
      ],
    },
    prediccion: {
      corto: 'Bet before you look',
      pregunta: 'With mutation at zero, what happens?',
      antes: [
        'Before pressing anything, place your bet. We are back at the first batch. The best three get through, as before, but the mutation strength is now 0%.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'With the strength at 0%, what does the next generation look like?',
        opciones: {
          copias: 'All twelve end up piled on the three that got through',
          mejora: 'It still improves, only more slowly',
          azar: 'They scatter at random over the whole map again',
        },
        acierto: 'You got it.',
        error: 'Not this time.',
        explicacion: 'Without mutation, each child is an exact copy of one of the three that got through. The twelve end up in three places, and the best still has 0.68: nothing new appeared to try.',
        pendiente: 'Choose an answer to see the generation.',
      },
      despues: [
        'Selection alone invents nothing: it only chooses among what is already there. What is new comes from mutation. And mutation alone is drawing random batches, as in section 2. Both are needed.',
        'At the other end, with the strength at 100% each weight simply becomes a random value: the children keep nothing of the ones that got through.',
      ],
    },
    desafio: {
      corto: 'Challenge: choose the parents',
      pregunta: 'Can you do the selecting yourself?',
      antes: [
        'Last section, and it is a challenge. Now you choose which ones get through: select them on the map or in the list, up to six. The first one you select is the elite. The mutation strength stays at 30%.',
        'You start again at the first batch, with no generation taken yet: the best has an error of 0.68. You have three generations.',
      ],
      consigna: 'Choose which ones get through and press "Next generation", until the best has an error below 0.6.',
      desafioTexto: {
        estado: '{bien} of {total} stretches of the way to the goal',
        pedirPista: 'Give me a hint',
        pista: 'No need to guess: the list is sorted. The children land near the ones you choose, so choose those with the least error.',
        logrado: 'The best ended up below 0.6. You did the selecting and mutation did the rest.',
      },
      despues: [
        'This is how the app\'s Train tab trains, with cars instead of neurons: each car drives with its network, how it did is measured, the best get through and their mutated copies form the next generation. Using evolution to search for a network\'s weights is called **neuroevolution**.',
        'It is another tool, for another case. It works when there is only a score at the end. When there is a correct answer for each example, the usual choice is gradient descent.',
      ],
    },
  },
  figura: {
    titulo: 'Figure: twelve neurons as dots on the error map, and the list of the twelve from best to worst',
    ejes: { izquierdo: 'left weight', derecho: 'right weight' },
    fondo: 'bottom',
    lista: { titulo: 'place', error: 'error' },
    rol: { elite: 'elite', pasa: 'through' },
    tanda: 'Batch {n}',
    generacion: 'Generation {n}',
    elegi: 'Choose at least one',
    elegidas: 'Chosen: {n}',
    sinGeneraciones: 'No generations left',
    cuenta: {
      mejor: 'the best: error',
      pasan: '{n} of {total} get through,',
      generacionDe: 'generation {n} of {total},',
    },
    controles: {
      pasan: { nombre: 'How many get through', ayuda: 'How many of the best leave children in the next batch.' },
      fuerza: { nombre: 'Mutation strength', ayuda: 'How far each weight of a child shifts, at random.' },
      tanda: { rotulo: 'Another batch', ayuda: 'Draws another twelve neurons at random.' },
      generacion: { rotulo: 'Next generation', ayuda: 'Builds the next twelve from the ones that get through.' },
    },
    restablecer: { rotulo: 'Reset', ayuda: 'Back to this section\'s values.' },
    tocada: 'The figure is as you left it.',
    neurona: {
      descripcion: 'In the challenge, select it so that it gets through to the next generation.',
      rotulo: 'Place {puesto}: error {error}. Left weight {w1}, right weight {w2}.',
    },
    resumen: 'Generation {generacion}. The best has an error of {error}. {pasan} get through.',
  },
  profundizar: {
    titulo: 'Going deeper',
    intro: 'Mutation, with the rule the app uses.',
    formulas: [
      { nombre: 'Mutation of a weight', formula: 'w ← w + (r − w) · f' },
    ],
    simbolos: [
      { simbolo: 'w', que: 'a weight of the child, copied from the one that got through' },
      { simbolo: '←', que: '"becomes"' },
      { simbolo: 'r', que: 'a value drawn at random, different for each weight' },
      { simbolo: 'f', que: 'the mutation strength, from 0 to 1 (the app writes it in %, from 0 to 100)' },
    ],
    frases: [
      'With f = 0 the weight does not change; with f = 1 it becomes r. In between, it moves that part of the way towards r. In the app, besides, each weight mutates with a certain probability; in the figure they all mutate.',
      'What the app does is evolution of the weights with one score per run. It is not step-by-step reinforcement learning, which is another family of methods for problems where there is only a score.',
      'In large networks the usual choice is gradient descent. Even so, evolution has also been tried with deep networks (Such and others, 2017; Salimans and others, 2017).',
      'The name comes from biology, but it is a comparison: this is a search procedure, not a description of how living things evolve.',
    ],
  },
  fuentes: {
    titulo: 'Sources',
    nota: 'The figure uses the same code as the Train tab to build each generation (selection, elite and mutation), with seeded randomness: it always shows the same thing. The twelve neurons, their examples and the map are those of the chapters "Measuring the error" and "Correcting a little at a time".',
    lista: [
      { texto: 'Such, F. P. and others (2017). Deep Neuroevolution: Genetic Algorithms Are a Competitive Alternative for Training Deep Neural Networks for Reinforcement Learning.', url: 'https://arxiv.org/abs/1712.06567', nota: '' },
      { texto: 'Salimans, T. and others (2017). Evolution Strategies as a Scalable Alternative to Reinforcement Learning.', url: '', nota: 'Cited by Such and others; not opened.' },
      { texto: 'The project\'s code: evolution (src/core/evolution.js) and this chapter\'s calculation, with its tests (src/teoria/capitulos/evolucion/cuenta.js).', url: '', nota: '' },
    ],
  },
};
