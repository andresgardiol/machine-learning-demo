// Textos en español de «Qué quedó adentro» (seccion-teoria D12, capítulo 9). El orden de los tramos y los
// números de la figura vienen de capitulos/adentro/guion.js: acá solo va la prosa, por id de tramo. Las
// marcas de la prosa (**término**, {entra|texto}, …) las explica contenido/es/neurona.js.
//
// Escrito sobre openspec/changes/archive/2026-11-20-seccion-teoria/hoja-de-hechos-capitulos.md; falta el cotejo (tarea 17.6).
// Lo que dice la prosa de la figura (qué casos falla la red con cada parte apagada, desde qué valor del
// peso deja de dar el XOR) sale de la cuenta y tiene prueba en tests/teoria-capitulos-7-a-9.test.js.

export default {
  titulo: 'Qué quedó adentro',
  bajada: 'Una red acierta. ¿Cómo se mira qué hace cada una de sus partes?',
  cierre: {
    texto: 'Hasta acá, cómo se mira una red por dentro. En la app, en la pestaña Inspeccionar, hacé lo mismo con la red que maneja un auto: apagá neuronas y conexiones, cambiá pesos y mirá qué pasa.',
    enlace: 'Seguí en Inspeccionar',
  },
  tramos: {
    aprendio: {
      corto: 'Acierta, ¿y qué aprendió?',
      pregunta: 'Acierta, pero ¿qué aprendió?',
      antes: [
        'Esta es la red de tres neuronas de «Una recta no alcanza». Hacé de cuenta que no la armaste vos: que salió de un entrenamiento, como los cerebros de la app. Da el XOR: acierta los cuatro casos.',
        'A la derecha están los cuatro casos, y en claro la zona donde la red contesta 1.',
      ],
      consigna: 'Mirá los números de la red: los pesos sobre las líneas y el sesgo debajo de cada neurona.',
      despues: [
        'Eso es todo lo que hay adentro: seis pesos y tres sesgos. No hay una regla escrita que diga «si las entradas son distintas, encendete». Tampoco están guardados los cuatro ejemplos.',
        'La red acierta, pero mirar nueve números no explica por qué. Hay que preguntarle de otra manera.',
      ],
    },
    mira: {
      corto: 'Qué mira cada neurona',
      pregunta: '¿Qué mira cada neurona?',
      antes: [
        'Una forma de mirar adentro es preguntarle a cada neurona, por separado, cuándo se enciende. El cuadro de la derecha es un mapa: cada lugar es un par de entradas, y está claro donde la neurona elegida se enciende.',
      ],
      consigna: 'Elegí A, después B y después «La red».',
      despues: [
        'A se enciende cuando alguna de las dos entradas vale 1. B se enciende solo cuando valen 1 las dos. La red entera se enciende en la franja del medio: donde A sí y B no.',
        'Ninguna de las dos ocultas hace el XOR. Cada una detecta algo más simple, y la salida las combina. En esta red tan chica cada neurona tiene un papel que se puede decir en una frase; en redes grandes no siempre es así.',
      ],
    },
    apago: {
      corto: 'Apagar una',
      pregunta: '¿Qué pasa si apago una?',
      antes: [
        'Otra forma de preguntar: sacar una pieza y ver qué se rompe. Una neurona apagada vale cero, le llegue lo que le llegue. El mapa vuelve a ser el de la red entera.',
      ],
      consigna: 'Apagá B y mirá qué caso falla. Después volvé a prenderla.',
      despues: [
        'Apagar una parte para ver qué deja de funcionar se llama **ablación**. Sin B, la red falla un solo caso: el de las dos entradas en 1. Se volvió un «o» común, que se enciende con cualquier entrada en 1.',
        'O sea que B era la que decía «pero no las dos». Eso no estaba escrito en ningún lado: se ve al sacarla.',
      ],
    },
    prediccion: {
      corto: 'Apostá antes de mirar',
      pregunta: 'Apago esta, ¿qué caso falla?',
      antes: [
        'Antes de apagar nada, apostá. La red está entera otra vez. Ahora voy a apagar A, la que se enciende cuando alguna entrada vale 1.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'Sin A, ¿qué casos falla la red?',
        opciones: {
          distintas: 'Los dos de entradas distintas',
          iguales: 'Solo el de las dos entradas en 1',
          ninguno: 'Ninguno: con B alcanza',
        },
        acierto: 'Acertaste.',
        error: 'Esta vez no.',
        explicacion: 'Sin A, a la salida le llega solo lo que dice B, y con un peso en contra: nunca pasa de cero. La red contesta 0 siempre. Acierta los dos casos que tenían que dar 0 y falla los dos que tenían que dar 1.',
        pendiente: 'Elegí una respuesta para ver la red sin A.',
      },
      despues: [
        'La zona clara desapareció: sin A, la red no se enciende nunca. A es la que empuja a favor; B solo frena.',
        'Las dos ablaciones dicen cosas distintas. Sacar B rompe un caso; sacar A rompe dos. Así se arma, pieza por pieza, la explicación de qué hace cada una.',
      ],
    },
    reglas: {
      corto: 'Dónde están las reglas',
      pregunta: '¿Dónde están las reglas?',
      antes: [
        'Si el «pero no las dos» está en algún lado, tiene que ser un número. Es el peso que va de B a la salida, el del borde azul: vale −1.',
        'La red está entera otra vez, con A prendida. Ahora ese peso se puede mover.',
      ],
      consigna: 'Subí el peso de a poco y mirá el caso de arriba a la derecha.',
      despues: [
        'Mientras el peso está en −0,5 o más abajo, la red da el XOR. Apenas pasa de −0,5, el caso de las dos entradas en 1 empieza a dar 1. No se borró ninguna regla: cambió un número.',
        'Lo que una red hace está repartido en sus pesos. No hay reglas escritas ni ejemplos guardados para ir a leer: hay números, y una cuenta que los usa.',
      ],
    },
    desafio: {
      corto: 'Desafío: apagar la justa',
      pregunta: '¿Podés romper un solo caso?',
      antes: [
        'Último tramo, y es un desafío. La red está entera, con el peso otra vez en −1, y da el XOR. Podés apagar y prender cualquiera de las dos ocultas.',
        'El pedido: que la red falle el caso de las dos entradas en 1, y que siga acertando los otros tres.',
      ],
      consigna: 'Apagá la neurona que hace falta. Solo esa.',
      desafioTexto: {
        estado: '{bien} de {total} casos como pide el desafío',
        pedirPista: 'Dame una pista',
        pista: 'Mirá los mapas del tramo 2: ¿cuál de las dos ocultas distingue el caso de las dos entradas en 1 de todos los demás?',
        logrado: 'Sin B, la red falla solo ese caso. Para acertar hubo que saber qué hacía cada parte.',
      },
      despues: [
        'En una red de tres neuronas se puede entender todo así. En una de millones de pesos la cuenta se conoce igual de bien, número por número; lo difícil es explicar por qué esos números resuelven la tarea. Estudiar eso se llama **interpretabilidad**, y es un campo de investigación abierto.',
        'Con esto termina el recorrido: una neurona que suma y decide, capas que se pasan sus respuestas, un error que se mide y se baja, y al final números que hay que aprender a leer.',
      ],
    },
  },
  figura: {
    titulo: 'Figura: la red del XOR con sus números y el mapa de dónde se enciende cada neurona',
    izquierda: 'izquierda',
    derecha: 'derecha',
    mapaDe: { red: 'dónde la red da 1', neurona: 'dónde se enciende {quien}' },
    acierta: 'acierta {bien} de {total}',
    entera: 'Red entera',
    sinUna: 'Sin {quien}',
    sinDos: 'Sin {quien}',
    y: ' ni ',
    cuenta: { pasa: 'se enciende si pasa de cero' },
    controles: {
      mapa: { rotulo: 'De quién es el mapa', a: 'A', b: 'B', c: 'La red', ayuda: 'De qué neurona se pinta el mapa; «La red» es la salida.' },
      apagar: { apagar: 'Apagar {quien}', prender: 'Prender {quien}', ayuda: 'Apaga o prende {quien}: apagada, vale cero.' },
      peso: { nombre: 'Peso de B a la salida', ayuda: 'Cuánto cuenta lo que dice B para la salida.' },
    },
    restablecer: { rotulo: 'Restablecer', ayuda: 'Vuelve a los valores de este tramo.' },
    tocada: 'La figura sigue como la dejaste.',
  },
  profundizar: {
    titulo: 'Para profundizar',
    intro: 'La ablación, como cuenta.',
    formulas: [
      { nombre: 'Una neurona apagada', formula: 'aⱼ = 0' },
      { nombre: 'El efecto de apagarla', formula: 'efecto(j) = aciertos(red) − aciertos(red sin j)' },
    ],
    simbolos: [
      { simbolo: 'aⱼ', que: 'lo que da la neurona j; apagada, es cero sea cual sea su suma' },
      { simbolo: 'aciertos', que: 'cuántos casos contesta bien la red' },
      { simbolo: 'red sin j', que: 'la misma red, con los mismos pesos, y la neurona j apagada' },
    ],
    frases: [
      'En la figura, el efecto de apagar B es 1 (de cuatro aciertos a tres) y el de apagar A es 2. Además del número importa cuáles casos se rompen: eso es lo que dice qué hacía la pieza.',
      'Los mapas del tramo 2 son la otra herramienta: probar muchas entradas y anotar cuándo se enciende una neurona. En la app, Inspeccionar muestra qué detecta cada neurona con la misma idea.',
      'No es cierto que de las redes grandes «no se sepa cómo funcionan»: la cuenta es exacta y está a la vista. Lo que falta, muchas veces, es una explicación en palabras de por qué esos pesos resuelven la tarea.',
    ],
  },
  fuentes: {
    titulo: 'Fuentes',
    nota: 'Las cuentas de la figura las hace el mismo código que usa la pestaña Inspeccionar para apagar partes y para armar el mapa de cada neurona. La red es la del capítulo «Una recta no alcanza», con los pesos puestos a mano.',
    lista: [
      { texto: 'Goodfellow, I., Bengio, Y. y Courville, A. (2016). Deep Learning. MIT Press. Capítulo 6: el XOR con una capa oculta.', url: 'https://www.deeplearningbook.org', nota: '' },
      { texto: 'El código del proyecto: las partes apagadas y los mapas (src/core/backprop.js) y la cuenta de este capítulo, con sus pruebas (src/teoria/capitulos/adentro/cuenta.js).', url: '', nota: '' },
    ],
  },
};
