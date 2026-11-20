// Textos en español de los prototipos de teoría (teoria-prototipos D2, D6 y D7). Una sola vez, para las
// tres formas del capítulo y para la historia. El orden y los números de cada tramo vienen de guion.js.
//
// Marcas dentro de la prosa (las interpreta comun/dom.js):
//   **término**        un término técnico, la primera vez que se nombra
//   {entra|texto}      color de lo que entra (sensores)        {pos|texto}  peso positivo
//   {neg|texto}        peso negativo                           {decide|texto} lo que decide la neurona
//
// FUENTES de la historia. Revisión contra fuentes del 20 de noviembre de 2026 (el detalle está en
// openspec/changes/teoria-prototipos/revision-contenido.md). Publicaciones originales (no se leyeron en
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
// No se verificó: los nombres y las fechas de los descubrimientos anteriores de backpropagation (por eso
// el texto no los da), ni cuánto pesó el libro de 1969 en el invierno (el texto dice "ayudó", no
// "causó"). El detalle de las perillas con motor del Mark I descansa en fuentes secundarias: no se leyó
// ese pasaje del manual.
import { TRAMOS, HITOS, armar } from './guion.js';

const tramos = {
  sumar: {
    corto: 'Sumar para decidir',
    pregunta: '¿Cómo decide doblar algo que solo sabe sumar?',
    antes: [
      'Imaginá el auto con solo dos {entra|sensores}, uno a cada lado. (El de la práctica tiene cinco.) Cada uno le pasa un número entre 0 y 1: cuanto más cerca hay algo, más alto.',
      'Con esos dos números tiene que decidir una sola cosa: ¿doblo a la derecha o sigo derecho?',
    ],
    consigna: 'Mirá la figura. Todavía no hay nada que tocar.',
    despues: [
      'Lo que decide está en el medio. Multiplica cada lectura por un número, suma todo y, si el total pasa de cero, dice que sí. Nada más.',
      'Eso es una **neurona artificial**. Este capítulo la desarma pieza por pieza.',
    ],
  },
  pesos: {
    corto: 'Cuánto pesa cada sensor',
    pregunta: '¿Cuánto pesa cada sensor?',
    antes: [
      'Los dos sensores no opinan lo mismo. Algo cerca a la izquierda empuja a doblar a la derecha. Algo cerca a la derecha empuja a lo contrario: mejor no ir para ese lado.',
      'Cada sensor tiene una perilla que dice cuánto vale su opinión y hacia dónde empuja.',
    ],
    consigna: 'Mové las dos perillas. Mirá el grosor de cada línea, la suma y lo que hace el auto.',
    despues: [
      'Esas perillas se llaman **pesos**. Un {pos|peso positivo} (línea continua) empuja a favor de encender. Uno {neg|negativo} (línea punteada) empuja en contra. En cero, ese sensor no cuenta.',
      'Cuando se dice que una red «aprende», lo que cambia son números como estos.',
    ],
  },
  sesgo: {
    corto: 'Desde cuánto se anima',
    pregunta: '¿Desde cuánto se anima a doblar?',
    antes: [
      'Ahora los dos sensores leen casi lo mismo: 0,5 y 0,45. La diferencia es mínima y, aun así, el auto dobla. Es una neurona nerviosa: cualquier total por encima de cero la enciende.',
      'Hay una tercera perilla que no depende de ningún sensor. Se suma siempre.',
    ],
    consigna: 'Bajá la tercera perilla hasta que el auto deje de doblar por tan poco.',
    despues: [
      'Esa perilla es el **sesgo**. Con un sesgo negativo, la neurona pide más antes de encenderse. Con uno positivo, se enciende con menos, o sola.',
      'La regla del final, «si la suma pasa de cero, 1; si no, 0», también tiene nombre: es la **activación**. Esta, que salta de golpe, es un **escalón**.',
    ],
  },
  prediccion: {
    corto: 'Apostá antes de mirar',
    pregunta: 'Si subo este peso, ¿se enciende?',
    antes: [
      'Antes de tocar nada, apostá. La neurona está apagada: el sensor izquierdo lee 0,9 y pesa 0,5; el derecho lee 0,4 y pesa −1; el sesgo es −0,3.',
    ],
    consigna: '',
    prediccionTexto: {
      pregunta: 'Subo el peso izquierdo de 0,5 a 1. ¿Qué pasa?',
      opciones: { si: 'Se enciende y el auto dobla', no: 'Sigue apagada' },
      acierto: 'Acertaste.',
      error: 'Esta vez no.',
      explicacion: '0,9 × 1 da 0,9. Restale 0,4 del otro sensor y 0,3 del sesgo: queda 0,2. Pasa de cero, así que se enciende. Antes, con el peso en 0,5, la suma daba −0,25.',
      pendiente: 'Elegí una respuesta para ver qué pasa.',
    },
    despues: [
      'Hacer la cuenta en la cabeza antes de mirar es la mejor forma de saber si la entendiste. Ahora las perillas son tuyas: probá otros valores.',
    ],
  },
  plano: {
    corto: 'La cuenta dibuja una recta',
    pregunta: '¿Qué dibuja esa cuenta?',
    antes: [
      'Cambiemos de dibujo. Cada situación del auto son dos números, y dos números son un punto: la lectura izquierda dice cuánto va a la derecha; la lectura derecha, cuánto sube.',
      'La zona clara es donde la neurona se enciende. El borde entre encender y no encender es una línea derecha.',
    ],
    consigna: 'Arrastrá el punto para cambiar lo que ven los sensores. Después mové las perillas: los pesos giran la línea y el sesgo la corre.',
    despues: [
      'Eso es todo lo que una neurona sola puede hacer: partir el plano en dos con una **recta**. De un lado dice 1 y del otro, 0. A ese borde se lo llama **frontera de decisión**.',
    ],
  },
  and: {
    corto: 'Desafío: las dos a la vez',
    pregunta: '¿Podés hacer que se encienda solo con las dos a la vez?',
    antes: [
      'Último tramo, y es un desafío. Ahora cada entrada vale 0 o 1, así que hay cuatro casos posibles: los cuatro puntos del plano.',
      'La neurona tiene que dar 1 únicamente cuando las dos entradas valen 1 (el círculo) y 0 en los otros tres (los cuadrados).',
    ],
    consigna: 'Mové los pesos y el sesgo hasta que los cuatro puntos queden bien. Tocá un punto para ver su cuenta.',
    desafioTexto: {
      estado: '{bien} de 4 puntos bien',
      pedirPista: 'Dame una pista',
      pista: 'Los dos pesos pueden quedar iguales y positivos. Falta un sesgo que exija a las dos entradas juntas: una sola no tiene que alcanzar.',
      logrado: 'Cuatro de cuatro. Esa neurona calcula un **AND**: se enciende solo con las dos a la vez.',
    },
    despues: [
      'Encontraste los números a mano. En la práctica vas a hacer lo mismo sobre una red de verdad y después vas a ver cómo los encuentra sola.',
    ],
  },
};

const hitos = {
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
      'Primero lo simula en una computadora. Después lo construye: el Mark I mira con 400 fotoceldas y guarda cada peso en una perilla que mueve un motor eléctrico. Las perillas de este capítulo, pero de metal.',
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
};

export default {
  idioma: 'es',
  comun: {
    volver: 'Prototipos de teoría',
    formas: { libro: 'Libro', pasos: 'Por pasos', pelicula: 'Película' },
    formasRotulo: 'Formas del capítulo',
    idiomaRotulo: 'Idioma',
    idiomas: { es: 'Español', en: 'English' },
    tramoDe: 'Tramo {n} de {total}',
  },
  portada: {
    titulo: 'Teoría: prototipos para comparar',
    bajada: 'Un mismo capítulo, «Una neurona», contado de tres formas, y un tramo de historia. Mismos textos y mismas figuras: lo único que cambia es la forma.',
    capitulo: 'Una neurona',
    capituloBajada: 'Seis tramos, de un auto imaginado con dos sensores a una neurona que calcula un AND.',
    formas: {
      libro: { nombre: 'Libro', bajada: 'Se lee bajando, con una figura viva entre los párrafos de cada tramo.' },
      pasos: { nombre: 'Por pasos', bajada: 'Una pantalla por tramo. La predicción pide elegir antes de seguir.' },
      pelicula: { nombre: 'Película', bajada: 'Una figura fija que se transforma mientras el texto pasa al lado.' },
    },
    historia: { nombre: 'Historia breve, de 1943 a 1986', bajada: 'Cinco hitos en una línea de tiempo fija. Cada uno apunta a su capítulo y a su pestaña.' },
    nota: 'Prototipos para escritorio. No están enlazados desde la app y se borran cuando se elija la forma.',
  },
  capitulo: {
    titulo: 'Una neurona',
    bajada: 'Cómo decide algo que solo sabe multiplicar y sumar.',
    indice: 'En este capítulo',
    tramos: armar(TRAMOS, tramos),
    cierre: {
      texto: 'Hasta acá, una neurona. Lo que sigue es tocarla en la app: en la pestaña Laboratorio, el ejercicio Compuertas arranca justo con este AND.',
      enlace: 'Seguí en Laboratorio, Compuertas',
    },
  },
  pasos: {
    anterior: 'Anterior',
    siguiente: 'Siguiente',
    avance: '{n} de {total}',
    bloqueo: 'Elegí una respuesta para seguir.',
    fin: 'Fin del capítulo',
    irA: 'Ir al tramo {n}: {titulo}',
  },
  pelicula: {
    avance: 'Tramos del capítulo',
    indice: 'Tramos',
    cuenta: '{n} de {total}',
    espera: 'La figura sigue en el tramo 4: espera tu respuesta.',
    volver: 'Volver a contestar',
  },
  figura: {
    titulo: 'Figura: una neurona con dos entradas',
    sensorIzq: 'sensor izquierdo',
    sensorDer: 'sensor derecho',
    entradaIzq: 'entrada izquierda',
    entradaDer: 'entrada derecha',
    dobla: 'dobla',
    sigue: 'sigue derecho',
    encendida: 'encendida',
    apagada: 'apagada',
    suma: 'suma',
    sesgo: 'sesgo',
    siempre: 'siempre',
    pasaDeCero: '¿pasa de 0?',
    si: 'sí',
    no: 'no',
    leyenda: { pos: 'empuja a favor', neg: 'empuja en contra', lado: 'acá se enciende' },
    controles: {
      w1: {
        antes: 'Cuánto vale el izquierdo',
        nombre: 'Peso izquierdo',
        ayuda: 'Cuánto cuenta el izquierdo, a favor o en contra.',
      },
      w2: {
        antes: 'Cuánto vale el derecho',
        nombre: 'Peso derecho',
        ayuda: 'Cuánto cuenta el derecho, a favor o en contra.',
      },
      b: {
        antes: 'Se suma siempre',
        nombre: 'Sesgo',
        ayuda: 'Se suma siempre. Más negativo: más le cuesta encenderse.',
      },
    },
    restablecer: {
      rotulo: 'Restablecer',
      ayuda: 'Vuelve a los valores de este tramo.',
    },
    tocada: 'La figura sigue como la dejaste.',
    punto: {
      rotulo: 'Lo que ven los sensores',
      descripcion: 'Arrastralo, o usá las flechas, para cambiar las dos lecturas. De qué lado de la recta cae decide la salida.',
      valor: 'izquierdo {x1}, derecho {x2}',
    },
    and: {
      punto: 'Izquierda {x1}, derecha {x2}. Tiene que dar {esperada}. Da {salida}: {veredicto}.',
      bien: 'bien',
      mal: 'mal',
      descripcion: 'Elegilo para ver la cuenta de este caso en la neurona.',
    },
    resumen: 'Suma {suma}. Salida {salida}: {palabra}.',
    sinRecta: 'Con los dos pesos en cero no hay recta: todo el plano da {salida}.',
    rectaFuera: 'La recta quedó fuera del dibujo: todo lo que se ve da {salida}.',
  },
  historia: {
    titulo: 'Historia breve',
    bajada: 'De una neurona dibujada en un papel a las redes que aprenden: cinco momentos, de 1943 a 1986.',
    linea: 'Línea de tiempo',
    capituloRotulo: 'Capítulo',
    pestanaRotulo: 'En la práctica',
    proximamente: 'próximamente',
    sinCapitulo: 'Sin capítulo ni pestaña: es una pausa, no una idea.',
    capitulos: { neurona: 'Una neurona', xor: 'Una recta no alcanza', culpa: 'Repartir la culpa' },
    continuara: 'La historia sigue después de 1986. Ese tramo todavía no está escrito.',
    imagenes: {
      h1943: 'Dibujo: una neurona con dos entradas que valen 0 o 1, sin pesos, y un umbral; dispara solo si la suma lo alcanza.',
      h1958: 'Dibujo simplificado: una grilla de fotoceldas que ve una letra, cables hacia tres perillas con motor y una salida.',
      h1969: 'Dibujo: los cuatro puntos del XOR en un plano y tres rectas que intentan separarlos y fallan.',
      h1970: 'Dibujo: una red pequeña, apagada y desenchufada, bajo copos de nieve.',
      h1986: 'Dibujo: una red de tres capas; la cuenta va hacia adelante y el error vuelve hacia atrás.',
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
    },
    hitos: armar(HITOS, hitos),
  },
};
