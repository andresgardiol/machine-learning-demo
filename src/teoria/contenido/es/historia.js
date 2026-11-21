// Textos en español de la historia (seccion-teoria D2 y D8; vienen de teoria-prototipos D6). Qué
// capítulo y qué pestaña corresponde a cada hito no cambia con el idioma: está en src/teoria/hitos.js.
//
// FUENTES de la historia. Revisión contra fuentes del 20 de noviembre de 2026 (el detalle está en
// openspec/changes/archive/2026-11-20-teoria-prototipos/revision-contenido.md). Publicaciones originales (no se leyeron en
// la revisión; los datos bibliográficos se confirmaron con búsquedas):
//   1943  McCulloch, W. y Pitts, W. A logical calculus of the ideas immanent in nervous activity.
//         Bulletin of Mathematical Biophysics 5, 115–133. Neurona de 0 o 1 con umbral, todavía sin pesos.
//   1958  Rosenblatt, F. The perceptron: a probabilistic model for information storage and organization
//         in the brain. Psychological Review 65(6), 386–408. Simulado en una IBM 704 en 1957.
//         Hay, J. C. y otros (1960). Mark I Perceptron Operators' Manual. Cornell Aeronautical
//         Laboratory, informe VG-1196-G-5. El Mark I se armó en 1959 y se mostró en público en 1960:
//         400 fotoceldas, 512 unidades de asociación y 8 de respuesta (el dibujo lo simplifica).
//   1969  Minsky, M. y Papert, S. Perceptrons. MIT Press. El XOR es el caso más chico de sus límites.
//   1973  Lighthill, J. Artificial Intelligence: A General Survey. Primer invierno de la IA en general:
//         aproximadamente 1974 a 1980; recortes de DARPA en 1973 y 1974.
//   1986  Rumelhart, D., Hinton, G. y Williams, R. Learning representations by back-propagating errors.
//         Nature 323, 533–536.
//   Sobre cuánto pesó el libro de 1969: Olazaran, M. (1996). A Sociological Study of the Official
//   History of the Perceptrons Controversy. Social Studies of Science 26(3), 611–659.
//   Sobre los descubrimientos anteriores de backpropagation: Schmidhuber, J. (2015). Deep Learning in
//   Neural Networks: An Overview.
// De apoyo (Wikipedia en inglés): Perceptron, Perceptrons_(book), AI_winter, Backpropagation y
// A_Logical_Calculus_of_the_Ideas_Immanent_in_Nervous_Activity.
//   Los siete hitos de 1987 a 2022 parten de openspec/changes/archive/2026-11-20-seccion-teoria/revision-contenido-historia.md
//   (hechos comprobados antes de escribir). Sus publicaciones:
//   1997  Campbell, M., Hoane, A. J. y Hsu, F. (2002). Deep Blue. Artificial Intelligence 134.
//   1998  LeCun, Y., Bottou, L., Bengio, Y. y Haffner, P. Gradient-based learning applied to document
//         recognition. Proceedings of the IEEE (noviembre de 1998).
//   2012  Krizhevsky, A., Sutskever, I. y Hinton, G. ImageNet classification with deep convolutional
//         neural networks. NIPS 2012.
//   2016  Silver, D. y otros. Mastering the game of Go with deep neural networks and tree search.
//         Nature 529, 484–489.
//   2017  Vaswani, A. y otros. Attention Is All You Need. NIPS 2017.
// Cotejado contra ese informe (correcciones H1 a H4 aplicadas). No se afirma
// lo que el informe pide no afirmar: el año del recorte de DARPA, cuántos cheques, cuántos parámetros
// tiene un modelo de lenguaje, que Deep Blue no tenía "nada aprendido", que AlphaGo aprendió "solo".
// No se verificó: los nombres y las fechas de los descubrimientos anteriores de backpropagation (por eso
// el texto no los da), ni cuánto pesó el libro de 1969 en el invierno (el texto dice "ayudó", no
// "causó"). El detalle de las perillas con motor del Mark I descansa en fuentes secundarias: no se leyó
// ese pasaje del manual.

export default {
  titulo: 'Historia breve',
  bajada: 'De una neurona dibujada en un papel a los modelos de lenguaje: doce momentos, de 1943 a 2022.',
  linea: 'Línea de tiempo',
  lineaNota: 'A escala por tramos. El corte salta de 1990 a 1997.',
  capituloRotulo: 'Capítulo',
  pestanaRotulo: 'En la práctica',
  proximamente: 'próximamente',
  sinCapitulo: 'Sin capítulo ni pestaña: es una pausa, no una idea.',
  ningunCapitulo: 'ninguno todavía',
  sinPractica: 'La práctica todavía no tiene nada sobre esto.',
  final: 'La historia no termina acá. Pero con esto alcanza para saber de dónde viene cada idea que vas a tocar.',
  imagenes: {
    h1943: 'Dibujo: una neurona con dos entradas que valen 0 o 1, sin pesos, y un umbral; dispara solo si la suma lo alcanza.',
    h1958: 'Dibujo simplificado: una grilla de fotoceldas que ve una letra, cables hacia tres perillas con motor y una salida.',
    h1969: 'Dibujo: los cuatro puntos del XOR en un plano y tres rectas que intentan separarlos y fallan.',
    h1970: 'Dibujo: una red pequeña, apagada y desenchufada, bajo copos de nieve.',
    h1986: 'Dibujo: una red de tres capas; la cuenta va hacia adelante y el error vuelve hacia atrás.',
    h1987: 'Dibujo: una pila alta de reglas escritas a mano, con nieve encima; dos reglas se caen.',
    h1997: 'Dibujo: un tablero de ajedrez y un árbol de jugadas posibles, cada una con un puntaje; una rama queda sin mirar y se elige la mejor jugada.',
    h1998: 'Dibujo: un número tres escrito a mano en una grilla; una ventana chica lo recorre, pasa por capas y se enciende la salida del 3 entre diez.',
    h2012: 'Dibujo: una pila de fotos entra a una red de ocho capas; debajo, dos placas gráficas.',
    h2016: 'Dibujo: un tablero de go con piedras; una red chica propone dónde jugar y otra le pone un puntaje a la posición.',
    h2017: 'Dibujo: cinco palabras en fila; de una salen arcos hacia todas las demás, más gruesos hacia las que más le importan.',
    h2022: 'Dibujo: una conversación; la respuesta se escribe palabra por palabra, y para el hueco que sigue hay tres palabras candidatas con una barra cada una.',
  },
  rotulos: {
    umbral: 'umbral 2',
    dispara: 'dispara',
    fotoceldas: '400 fotoceldas',
    perillas: 'pesos con motor',
    ningunaRecta: 'ninguna recta alcanza',
    pausa: 'desenchufada',
    adelante: 'la cuenta va',
    atras: 'el error vuelve',
    reglas: 'reglas escritas a mano',
    caro: 'caras de mantener',
    busca: 'prueba jugadas y respuestas',
    formula: 'el puntaje sale de una fórmula hecha por personas',
    partes: 'mira de a partes',
    capas: 'capas',
    lee: 'lee un 3',
    fotos: 'fotos de ejemplo',
    placas: 'dos placas gráficas',
    propone: 'una red propone jugadas',
    evalua: 'otra evalúa la posición',
    palabras: ['el', 'auto', 'dobla', 'a', 'tiempo'],
    atencion: 'cada palabra mira a todas las demás',
    siguiente: 'elige la palabra que sigue',
  },
  hitos: {
    h1943: {
      anio: '1943',
      quien: 'Warren McCulloch y Walter Pitts',
      titulo: 'Una neurona es una cuenta',
      texto: [
        'Un neurofisiólogo y un lógico joven se preguntan qué hace una neurona si se le saca todo lo que no es imprescindible. Les queda algo muy simple: recibe señales que valen 0 o 1 y dispara solo si alcanzan un umbral. Todavía no hay pesos: todas las señales valen lo mismo.',
        'Con eso alcanza para armar un «y», un «o» y un «no». La idea queda escrita: pensar podría ser, en el fondo, hacer cuentas.',
      ],
      pestana: 'Laboratorio',
    },
    h1958: {
      anio: '1958',
      quien: 'Frank Rosenblatt',
      titulo: 'El perceptrón encuentra sus pesos',
      texto: [
        'Quedaba una pregunta: ¿quién elige los números? Rosenblatt propone que la máquina los corrija sola, un poco cada vez que se equivoca. La llama perceptrón.',
        'Primero lo simula en una computadora. Después lo construye: el Mark I mira con 400 fotoceldas y guarda cada peso en una perilla que mueve un motor eléctrico. Las perillas de «Una neurona», pero de metal.',
      ],
      pestana: 'Laboratorio, Compuertas',
    },
    h1969: {
      anio: '1969',
      quien: 'Marvin Minsky y Seymour Papert',
      titulo: 'Una sola no puede con XOR',
      texto: [
        'El libro «Perceptrons» estudia con cuidado qué puede y qué no puede hacer un perceptrón. Entre lo que no puede hay algo que parece trivial: decir si dos entradas son distintas. Eso es el XOR.',
        'El motivo se ve en un dibujo. Una neurona separa con una recta, y no hay recta que deje esos cuatro puntos bien repartidos. Con más capas se podía, y ya se sabía. Faltaba cómo entrenarlas.',
      ],
      pestana: 'Laboratorio, XOR',
    },
    h1970: {
      anio: 'años 70',
      quien: '',
      titulo: 'El primer invierno',
      texto: [
        'Las promesas de la inteligencia artificial habían sido enormes y los resultados no llegaban. En 1973 un informe británico, el de Lighthill, es lapidario, y en Estados Unidos también se recorta el dinero para investigar. Es el primer invierno de la IA, más o menos de 1974 a 1980.',
        'A las redes neuronales el frío les había llegado antes. Después del libro de 1969, y sin una forma de entrenar redes de varias capas, casi todos las dejan de lado. Unos pocos siguen trabajando igual.',
      ],
      pestana: '',
    },
    h1986: {
      anio: '1986',
      quien: 'David Rumelhart, Geoffrey Hinton y Ronald Williams',
      titulo: 'El error viaja hacia atrás',
      texto: [
        'El XOR se resuelve con más de una neurona, en capas. Pero entonces, cuando la red se equivoca, ¿cuál de todos los pesos tuvo la culpa?',
        'La respuesta es repartir el error desde la salida hacia atrás, capa por capa. La técnica se llama backpropagation. Ya se había descubierto más de una vez; este trabajo muestra con experimentos que funciona, y las redes vuelven.',
      ],
      pestana: 'Laboratorio',
    },
    h1987: {
      anio: 'fines de los 80',
      quien: '',
      titulo: 'El segundo invierno',
      texto: [
        'En los 80 el negocio eran los sistemas expertos: programas que guardaban, regla por regla, lo que sabía un especialista. Reglas a mano, como las de la práctica, pero a gran escala. Resultaron caros de mantener. En 1987 se derrumba el mercado de las máquinas especiales en las que corrían, porque las computadoras comunes las alcanzan y cuestan menos, y el dinero público se recorta.',
        'A ese frío se lo suele fechar de 1987 a 1993. Esta vez no fue contra las redes neuronales, que venían volviendo desde 1986. Lo que se enfrió fue la idea de escribir a mano todo lo que una máquina tiene que saber.',
      ],
      pestana: 'Reglas a mano',
    },
    h1997: {
      anio: '1997',
      quien: 'Deep Blue, de IBM, contra Garry Kasparov',
      titulo: 'Deep Blue gana, y no es una red',
      texto: [
        'En mayo de 1997 una máquina de IBM, Deep Blue, le gana al campeón mundial de ajedrez Garry Kasparov una revancha de seis partidas, por 3½ a 2½. No era una red neuronal ni aprendía jugando. Probaba jugadas y respuestas a toda velocidad, con chips hechos a medida, y le ponía un puntaje a cada posición con una fórmula diseñada por personas.',
        'Los números de esa fórmula se afinaron estudiando miles de partidas de maestros, con la ayuda de un gran maestro. Pero qué mirar en el tablero y cómo valorarlo lo decidió gente. Es programar, llevado muy lejos.',
      ],
      pestana: 'Reglas a mano',
    },
    h1998: {
      anio: '1998',
      quien: 'Yann LeCun, Léon Bottou, Yoshua Bengio y Patrick Haffner',
      titulo: 'Una red lee cheques',
      texto: [
        'Backpropagation servía para algo más que ejemplos de pizarrón. Este trabajo presenta LeNet-5, una red entrenada con esa técnica que lee números escritos a mano. Formaba parte de un sistema que leía cheques y que la empresa NCR vendía a los bancos: millones de cheques.',
        'La red tiene un recurso propio. En vez de mirar la imagen entera de una vez, la recorre por partes chicas y usa los mismos pesos en todas. A eso se lo llama red convolucional. La práctica no lo tiene; lo que sí tiene es la técnica con la que esa red aprendió.',
      ],
      pestana: 'Laboratorio',
    },
    h2012: {
      anio: '2012',
      quien: 'Alex Krizhevsky, Ilya Sutskever y Geoffrey Hinton',
      titulo: 'Más capas, más datos, placas gráficas',
      texto: [
        'Un concurso anual pone a los programas a decir qué hay en una foto. En 2012 lo gana una red neuronal, AlexNet, y por mucho: se equivoca alrededor del 15 % de las veces, contra el 26 % del segundo.',
        'La base es la técnica de 1986, mucho más grande: más capas, unos 60 millones de números para ajustar, una enorme cantidad de fotos de ejemplo y dos placas gráficas haciendo cuentas durante cinco o seis días. Entrenar redes de muchas capas se llama aprendizaje profundo.',
      ],
      pestana: '',
    },
    h2016: {
      anio: '2016',
      quien: 'AlphaGo contra Lee Sedol',
      titulo: 'Aprender jugando',
      texto: [
        'El go es un juego de tablero con muchísimas más posiciones posibles que el ajedrez. En marzo de 2016 un programa, AlphaGo, le gana 4 a 1 a Lee Sedol, uno de los mejores jugadores del mundo.',
        'Combina dos redes con una búsqueda de jugadas: una red propone dónde jugar y la otra dice qué tan buena es una posición. Las dos aprendieron primero de partidas de expertos humanos y después jugando contra sí mismas. Esa segunda parte, aprender de lo que sale bien y lo que sale mal al probar, se llama aprendizaje por refuerzo. En Entrenar los autos tampoco reciben la respuesta correcta, pero aprenden por evolución, que es otra cosa.',
      ],
      pestana: '',
    },
    h2017: {
      anio: '2017',
      quien: 'Ashish Vaswani y otros siete autores',
      titulo: 'Atención: todas las palabras a la vez',
      texto: [
        'Un artículo con un título desafiante, «Attention Is All You Need», propone una red para traducir que deja de leer las palabras de a una, en orden. La red, el Transformer, mira todas a la vez y calcula cuánto tiene que ver cada una con las demás. A ese mecanismo lo llama atención.',
        'Acá alcanza con el nombre: ni la práctica ni estos capítulos lo explican. Importa por lo que vino después. Los modelos de lenguaje del hito siguiente están armados con esa pieza.',
      ],
      pestana: '',
    },
    h2022: {
      anio: '2022',
      quien: 'ChatGPT, de OpenAI',
      titulo: 'Los modelos de lenguaje llegan a todos',
      texto: [
        'En noviembre de 2022 sale ChatGPT, un modelo de lenguaje con el que cualquiera puede conversar. Dos meses después, según una estimación de analistas (no es una cifra de OpenAI), lo usaban unos 100 millones de personas por mes.',
        'Por dentro no hay otra clase de cosa: siguen siendo pesos, como los de «Una neurona», que se ajustan con ejemplos. Muchísimos más pesos y muchísimos más ejemplos. Se entrenan, sobre todo, para una tarea que suena modesta: adivinar la palabra (o el pedazo de palabra) que sigue.',
      ],
      pestana: '',
    },
  },
  fuentes: {
    titulo: 'Fuentes',
    nota: 'Las fechas, los nombres y las cifras se comprobaron con búsquedas, no leyendo cada publicación entera. Lo que descansa solo en fuentes secundarias lo dice. Los dibujos son dibujos de la idea, no datos.',
    lista: [
      { texto: 'McCulloch, W. y Pitts, W. (1943). A logical calculus of the ideas immanent in nervous activity. Bulletin of Mathematical Biophysics 5, 115–133.', url: '', nota: '' },
      { texto: 'Rosenblatt, F. (1958). The perceptron: a probabilistic model for information storage and organization in the brain. Psychological Review 65(6), 386–408.', url: '', nota: '' },
      { texto: 'Hay, J. C. y otros (1960). Mark I Perceptron Operators’ Manual. Cornell Aeronautical Laboratory.', url: 'https://apps.dtic.mil/sti/tr/pdf/AD0236965.pdf', nota: 'Que cada peso iba en una perilla con motor descansa en fuentes secundarias: no se leyó ese pasaje del manual.' },
      { texto: 'Minsky, M. y Papert, S. (1969). Perceptrons. MIT Press.', url: '', nota: '' },
      { texto: 'Lighthill, J. (1973). Artificial Intelligence: A General Survey.', url: '', nota: '' },
      { texto: 'Olazaran, M. (1996). A Sociological Study of the Official History of the Perceptrons Controversy. Social Studies of Science 26(3), 611–659.', url: '', nota: 'Sobre cuánto pesó el libro de 1969: es una discusión entre historiadores.' },
      { texto: 'Rumelhart, D., Hinton, G. y Williams, R. (1986). Learning representations by back-propagating errors. Nature 323, 533–536.', url: '', nota: '' },
      { texto: 'Schmidhuber, J. (2015). Deep Learning in Neural Networks: An Overview.', url: 'https://arxiv.org/pdf/1404.7828', nota: 'Fuente secundaria: sobre los descubrimientos anteriores de backpropagation.' },
      { texto: 'Wikipedia en inglés: AI winter.', url: 'https://en.wikipedia.org/wiki/AI_winter', nota: 'Fuente secundaria: los dos inviernos, sus fechas y sus causas.' },
      { texto: 'Campbell, M., Hoane, A. J. y Hsu, F. (2002). Deep Blue. Artificial Intelligence 134.', url: 'https://www.cefns.nau.edu/~edo/Classes/CS470-570_WWW/Readings/Campbell2002.pdf', nota: '' },
      { texto: 'IBM. Deep Blue.', url: 'https://ibm.com/history/deep-blue', nota: '' },
      { texto: 'LeCun, Y., Bottou, L., Bengio, Y. y Haffner, P. (1998). Gradient-based learning applied to document recognition. Proceedings of the IEEE.', url: 'https://proceedingsoftheieee.ieee.org/gradient-based-learning-applied-to-document-recognition/', nota: '' },
      { texto: 'Krizhevsky, A., Sutskever, I. y Hinton, G. (2012). ImageNet classification with deep convolutional neural networks. NIPS 2012.', url: 'https://cacm.acm.org/research/imagenet-classification-with-deep-convolutional-neural-networks', nota: '' },
      { texto: 'Silver, D. y otros (2016). Mastering the game of Go with deep neural networks and tree search. Nature 529, 484–489.', url: 'https://research.google/pubs/mastering-the-game-of-go-with-deep-neural-networks-and-tree-search/', nota: '' },
      { texto: 'Vaswani, A. y otros (2017). Attention Is All You Need. NIPS 2017.', url: 'https://arxiv.org/abs/1706.03762', nota: '' },
      { texto: 'The Register (2023), sobre un informe de analistas de UBS.', url: 'https://www.theregister.com/2023/02/03/chatgpt_most_popular_apps/', nota: 'Fuente secundaria: los 100 millones de usuarios de ChatGPT son una estimación, no una cifra de OpenAI.' },
    ],
  },
};
