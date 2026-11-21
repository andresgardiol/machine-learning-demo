// English text of "What ended up inside" (seccion-teoria D12, chapter 9). Same keys as
// contenido/es/adentro.js; the order of the sections and the figure's numbers come from
// capitulos/adentro/guion.js.

export default {
  titulo: 'What ended up inside',
  bajada: 'A network gets it right. How do you look at what each of its parts does?',
  cierre: {
    texto: 'That is how you look inside a network. In the app, in the Inspect tab, do the same with the network that drives a car: switch off neurons and connections, change weights and see what happens.',
    enlace: 'Continue in Inspect',
  },
  tramos: {
    aprendio: {
      corto: 'It is right, but what did it learn?',
      pregunta: 'It gets it right, but what did it learn?',
      antes: [
        'This is the three-neuron network from "One line is not enough". Pretend you did not build it: that it came out of training, like the brains in the app. It gives XOR: it gets all four cases right.',
        'On the right are the four cases, with the region where the network answers 1 shown lighter.',
      ],
      consigna: 'Look at the network\'s numbers: the weights on the lines and the bias under each neuron.',
      despues: [
        'That is all there is inside: six weights and three biases. There is no written rule saying "if the inputs differ, turn on". Nor are the four examples stored anywhere.',
        'The network gets it right, but looking at nine numbers does not explain why. It has to be asked some other way.',
      ],
    },
    mira: {
      corto: 'What each neuron looks at',
      pregunta: 'What does each neuron look at?',
      antes: [
        'One way of looking inside is to ask each neuron, separately, when it turns on. The square on the right is a map: each place is a pair of inputs, and it is lighter where the chosen neuron turns on.',
      ],
      consigna: 'Choose A, then B and then "The network".',
      despues: [
        'A turns on when either input is 1. B turns on only when both are 1. The whole network turns on in the band in the middle: where A does and B does not.',
        'Neither hidden neuron does XOR. Each one detects something simpler, and the output combines them. In a network this small each neuron has a role you can state in a sentence; in large networks that is not always so.',
      ],
    },
    apago: {
      corto: 'Switching one off',
      pregunta: 'What happens if I switch one off?',
      antes: [
        'Another way of asking: take a piece out and see what breaks. A switched-off neuron gives zero, whatever reaches it. The map is the whole network\'s again.',
      ],
      consigna: 'Switch B off and see which case fails. Then switch it back on.',
      despues: [
        'Switching off a part to see what stops working is called **ablation**. Without B, the network fails a single case: the one with both inputs at 1. It has become a plain "or", which turns on with any input at 1.',
        'So B was the one saying "but not both". That was not written anywhere: you see it by taking it out.',
      ],
    },
    prediccion: {
      corto: 'Bet before you look',
      pregunta: 'I switch this one off: which case fails?',
      antes: [
        'Before switching anything off, place your bet. The network is whole again. Now I am going to switch off A, the one that turns on when either input is 1.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'Without A, which cases does the network fail?',
        opciones: {
          distintas: 'The two with different inputs',
          iguales: 'Only the one with both inputs at 1',
          ninguno: 'None: B is enough',
        },
        acierto: 'You got it.',
        error: 'Not this time.',
        explicacion: 'Without A, the output receives only what B says, and with a weight against: it never gets above zero. The network always answers 0. It gets right the two cases that should give 0 and fails the two that should give 1.',
        pendiente: 'Choose an answer to see the network without A.',
      },
      despues: [
        'The lighter region is gone: without A, the network never turns on. A is the one pushing in favour; B only holds back.',
        'The two ablations say different things. Taking out B breaks one case; taking out A breaks two. That is how, piece by piece, the explanation of what each one does is put together.',
      ],
    },
    reglas: {
      corto: 'Where the rules are',
      pregunta: 'Where are the rules?',
      antes: [
        'If the "but not both" is anywhere, it has to be a number. It is the weight from B to the output, the one with the blue border: it is −1.',
        'The network is whole again, with A switched on. Now that weight can be moved.',
      ],
      consigna: 'Raise the weight little by little and watch the case at the top right.',
      despues: [
        'While the weight is at −0.5 or below, the network gives XOR. As soon as it goes above −0.5, the case with both inputs at 1 starts giving 1. No rule was erased: a number changed.',
        'What a network does is spread across its weights. There are no written rules or stored examples to go and read: there are numbers, and a calculation that uses them.',
      ],
    },
    desafio: {
      corto: 'Challenge: switch off the right one',
      pregunta: 'Can you break a single case?',
      antes: [
        'Last section, and it is a challenge. The network is whole, with the weight back at −1, and gives XOR. You can switch either hidden neuron off and on.',
        'The request: make the network fail the case with both inputs at 1, while still getting the other three right.',
      ],
      consigna: 'Switch off the neuron that is needed. Only that one.',
      desafioTexto: {
        estado: '{bien} of {total} cases as the challenge asks',
        pedirPista: 'Give me a hint',
        pista: 'Look at the maps from section 2: which of the two hidden neurons tells the case with both inputs at 1 apart from all the others?',
        logrado: 'Without B, the network fails only that case. To get it right you had to know what each part did.',
      },
      despues: [
        'In a three-neuron network everything can be understood this way. In one with millions of weights the calculation is known just as well, number by number; the hard part is explaining why those numbers solve the task. Studying that is called **interpretability**, and it is an open field of research.',
        'This is where the tour ends: a neuron that adds and decides, layers that pass their answers on, an error that is measured and brought down, and in the end numbers you have to learn to read.',
      ],
    },
  },
  figura: {
    titulo: 'Figure: the XOR network with its numbers and the map of where each neuron turns on',
    izquierda: 'left',
    derecha: 'right',
    mapaDe: { red: 'where the network gives 1', neurona: 'where {quien} turns on' },
    acierta: '{bien} of {total} right',
    entera: 'Whole network',
    sinUna: 'Without {quien}',
    sinDos: 'Without {quien}',
    y: ' or ',
    cuenta: { pasa: 'turns on if above zero' },
    controles: {
      mapa: { rotulo: 'Whose map', a: 'A', b: 'B', c: 'The network', ayuda: 'Which neuron\'s map is painted; "The network" is the output.' },
      apagar: { apagar: 'Switch {quien} off', prender: 'Switch {quien} on', ayuda: 'Switches {quien} off or on: off, it gives zero.' },
      peso: { nombre: 'Weight from B to the output', ayuda: 'How much what B says counts for the output.' },
    },
    restablecer: { rotulo: 'Reset', ayuda: 'Back to this section\'s values.' },
    tocada: 'The figure is as you left it.',
  },
  profundizar: {
    titulo: 'Going deeper',
    intro: 'Ablation, as a calculation.',
    formulas: [
      { nombre: 'A switched-off neuron', formula: 'aⱼ = 0' },
      { nombre: 'The effect of switching it off', formula: 'effect(j) = hits(network) − hits(network without j)' },
    ],
    simbolos: [
      { simbolo: 'aⱼ', que: 'what neuron j gives; switched off, it is zero whatever its sum' },
      { simbolo: 'hits', que: 'how many cases the network answers correctly' },
      { simbolo: 'network without j', que: 'the same network, with the same weights, and neuron j switched off' },
    ],
    frases: [
      'In the figure, the effect of switching off B is 1 (from four hits to three) and that of switching off A is 2. Besides the number, which cases break matters: that is what tells you what the piece was doing.',
      'The maps of section 2 are the other tool: try many inputs and note when a neuron turns on. In the app, Inspect shows what each neuron detects using the same idea.',
      'It is not true that "nobody knows how large networks work": the calculation is exact and in plain view. What is often missing is an explanation in words of why those weights solve the task.',
    ],
  },
  fuentes: {
    titulo: 'Sources',
    nota: 'The figure\'s calculations are done by the same code the Inspect tab uses to switch parts off and to build each neuron\'s map. The network is the one from the chapter "One line is not enough", with weights set by hand.',
    lista: [
      { texto: 'Goodfellow, I., Bengio, Y. and Courville, A. (2016). Deep Learning. MIT Press. Chapter 6: XOR with a hidden layer.', url: 'https://www.deeplearningbook.org', nota: '' },
      { texto: 'The project\'s code: switched-off parts and maps (src/core/backprop.js) and this chapter\'s calculation, with its tests (src/teoria/capitulos/adentro/cuenta.js).', url: '', nota: '' },
    ],
  },
};
