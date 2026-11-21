// English texts for "Program it or let it learn" (seccion-teoria D9, chapter 0). Same structure as
// contenido/es/programar.js.

export default {
  titulo: 'Program it or let it learn',
  bajada: 'Two ways to get a machine to decide: tell it how, or give it examples.',
  cierre: {
    texto: 'That was programming versus learning. In the app, the Hand-written rules tab lets you write rules for the car; in the Train tab, the cars learn on their own, by trial and selection.',
    enlace: 'Continue in Hand-written rules and in Train',
  },
  tramos: {
    regla: {
      corto: 'A rule',
      pregunta: 'How would you tell a car when to turn?',
      antes: [
        'Picture a car with two {entra|sensors}, one on each side. Each gives a number between 0 and 1: the closer something is, the higher the number. (The one in the hands-on part has five; two are enough here.)',
        'The most direct way to keep it from crashing is to write it a rule: "if the left one reads above 0.5, turn". Otherwise, keep going straight.',
      ],
      consigna: 'Look at the figure: there are six situations. Tap a row to see it on the car.',
      despues: [
        'In each row, the bar is what the sensor reads and the white line is the 0.5 of the rule. If the bar passes the line, the rule fires and the car turns. All six come out right.',
        'This is **programming**: a person thinks up the rule and the machine obeys it.',
      ],
    },
    umbral: {
      corto: 'The number in the rule',
      pregunta: 'What number do you give it?',
      antes: [
        'The rule has a number inside, and somebody picked it. Why 0.5 and not another one?',
        'Now it starts at 0.1. The car turns over anything and gets two of the six wrong.',
      ],
      consigna: 'Move the dial and watch how many it gets right. Find the numbers that get all six right.',
      despues: [
        'That number is called a **threshold**: the reading from which the rule fires. With a very low threshold the car turns over nothing; with a very high one it never turns.',
        'Here anything from 0.4 up to just below 0.6 works. You did not know that beforehand: you found it by trying and looking at the examples. Hold on to that idea.',
      ],
    },
    otra: {
      corto: 'One it does not cover',
      pregunta: 'What about this situation?',
      antes: [
        'The rule is back at 0.5, and two new situations appear. Look at the seventh: there is almost nothing on the left (0.2), but something very close on the right (0.7). The car should turn, and the rule does not even notice: it only looks at the left sensor.',
      ],
      consigna: 'Try to fix it with the dial. Is there any threshold that gets all eight right?',
      despues: [
        'There is none. For the rule to fire on the seventh, the threshold has to go below 0.2, and then the car turns in others where it should have kept going.',
        'One rule alone is not enough. Another one is needed, one that looks at the other sensor.',
      ],
    },
    prediccion: {
      corto: 'Bet before you look',
      pregunta: 'With two rules, how many are still wrong?',
      antes: [
        'The first rule stayed at 0.5 and gets only one wrong: the seventh. Let us add a second one: "if the right one reads above 0.3, turn". The car turns when either of the two fires.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'With both rules, how many of the eight are still wrong?',
        opciones: { ninguna: 'None: the second one fixes the missing one', una: 'One', dos: 'Two' },
        acierto: 'You got it.',
        error: 'Not this time.',
        explicacion: 'The second rule fixes the seventh: 0.7 is above 0.3. But it also fires on the eighth, where the right sensor reads 0.4 and the car should have kept going. It fixed one and broke another: one is still wrong.',
        pendiente: 'Pick an answer to see what happens.',
      },
      despues: [
        'That is what programming with rules is like: each one you add collides with the ones before. Now both dials are yours: find a pair of numbers that gets all eight right.',
        'With eight situations and two rules it can be done. Real driving has many more of both.',
      ],
    },
    buscar: {
      corto: 'Let the machine search',
      pregunta: 'What if the machine picked the numbers?',
      antes: [
        'What you just did with the dials was mechanical: try a number, count how many it gets right and keep the best. The machine can do that on its own. All it needs is the examples: the eight situations, each with what should have been done.',
        'Both numbers start out badly set on purpose.',
      ],
      consigna: 'Press "Search" and watch the lines move.',
      despues: [
        'The little bars above each dial say how many it got right with each number it tried: twenty-one per rule, in order. First it searched for the number of the first rule on its own; then, with that one fixed, for the second. It kept the best of each pass.',
        'That is a **sweep**: trying everything, end to end. The neural networks of the chapters that follow do not learn that way: they have too many numbers to try them all, and how they find them is the subject of those chapters. But the idea is already here. Nobody thought up those two numbers: they came out of the examples. That is what **learning** means.',
      ],
    },
    desafio: {
      corto: 'Challenge: all eight',
      pregunta: 'Can you get all eight right, by hand and by searching?',
      antes: [
        'Last stretch, and it is a challenge. Both rules start at 0.2: the car turns too much and gets two wrong.',
        'First do it like a programmer: move both dials until all eight are right. Then press "Reset" and let the machine search.',
      ],
      consigna: 'Move the dials until all eight rows are right.',
      desafioTexto: {
        estado: '{bien} of {total} situations right',
        pedirPista: 'Give me a hint',
        pista: 'Each line has to sit between two bars: to its right, the situations where the car must turn because of that sensor; to its left, the rest.',
        logrado: 'Eight out of eight. With those two numbers, the rules cover every example.',
      },
      despues: [
        'You reached the same place by both roads. With two numbers you can still choose. The car in the hands-on part has five sensors and four outputs: there, hand-written rules turn into a tangle, and that is why the rest of the theory is about machines that learn.',
      ],
    },
  },
  figura: {
    titulo: 'Figure: a car with two sensors, a list of situations and the rules that decide whether it turns',
    dobla: 'turns',
    sigue: 'goes straight',
    auto: 'The car in situation {n}: the left sensor reads {x1} and the right one, {x2}. With the rules, it {hace}.',
    tabla: {
      titulo: 'Situations: what each sensor reads, what should be done and what the car does with the rules',
      numero: 'Situation',
      izquierdo: 'left',
      derecho: 'right',
      deberia: 'should',
      hace: 'does',
      resultado: 'Result',
      doblar: 'turn',
      seguir: 'go straight',
      bien: 'right',
      mal: 'wrong',
      elegir: 'See situation {n} on the car',
    },
    regla: {
      si: 'If the',
      izquierdo: 'left one',
      derecho: 'right one',
      pasa: 'reads above',
      entonces: 'turn',
      pendiente: 'does not count yet',
      pausa: 'waiting its turn',
    },
    aciertos: '{bien} of {total} right',
    controles: {
      u1: {
        rotulo: 'From which left sensor reading it turns',
        ayuda: 'The number in the rule. Higher: it takes more to turn.',
      },
      u2: {
        rotulo: 'From which right sensor reading it turns',
        ayuda: 'The number in the second rule, the one for the right sensor.',
      },
      buscar: {
        rotulo: 'Search',
        buscando: 'Searching…',
        ayuda: 'Tries the numbers in order and keeps the one that gets most right.',
      },
    },
    restablecer: {
      rotulo: 'Reset',
      ayuda: 'Goes back to the values of this stretch.',
    },
    tocada: 'The figure is as you left it.',
    resumen: '{bien} of {total} right.',
    buscado: 'It searched for both numbers: {u1} for the left one and {u2} for the right one. {bien} of {total} right.',
  },
  profundizar: {
    titulo: 'Going deeper',
    intro: 'Two ways of getting a program that decides.',
    formulas: [],
    simbolos: [],
    frases: [
      'With rules, a person writes the conditions and chooses the numbers. With examples, a procedure adjusts the numbers from cases that are already solved. This second way is called **machine learning**.',
      'Hand-written rules are not worse in general: they work when the cases are few and known in advance. They fall short when there are too many situations to write a rule for each.',
      'The search in the figure, which tries every threshold in order, is the simplest way of getting a number out of the examples. The chapters that follow describe others, which work when the numbers are many.',
    ],
  },
  fuentes: {
    titulo: 'Sources',
    nota: 'This chapter tells no history: it explains an idea with a figure. The eight situations were made up for the chapter, and what the figure says (how many each rule gets right, which numbers the search tries) is computed on the spot.',
    lista: [
      { texto: 'The project code: the car in the hands-on part and its five sensors (src/core/sensors.js), and the math of this chapter, with its tests (src/teoria/capitulos/programar/cuenta.js).', url: '', nota: '' },
      { texto: 'Samuel, A. L. (1959). Some Studies in Machine Learning Using the Game of Checkers. IBM Journal of Research and Development 3(3), 210–229.', url: 'https://people.csail.mit.edu/brooks/idocs/Samuel.pdf', nota: 'An early paper on programs that improve with experience; it helped spread the name "machine learning".' },
    ],
  },
};
