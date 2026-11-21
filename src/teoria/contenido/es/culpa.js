// Textos en español de «Repartir la culpa» (seccion-teoria D12, capítulo 6). El orden de los tramos y los
// números de la figura vienen de capitulos/culpa/guion.js: acá solo va la prosa, por id de tramo. Las
// marcas de la prosa (**término**, {entra|texto}, …) las explica contenido/es/neurona.js.
//
// Contenido revisado en openspec/changes/archive/2026-11-20-seccion-teoria/revision-contenido-culpa.md.
// Los números que dice la prosa (lo que responde la red, cada culpa, cada cambio) salen de la cuenta y
// tienen prueba en tests/teoria-capitulos-3-a-6.test.js. Lo que pasa al correr muchas épocas no tiene
// prueba (ninguna prueba mide si algo aprende): el texto del tramo 5 no dice en cuántas épocas.

export default {
  titulo: 'Repartir la culpa',
  bajada: 'Cómo sabe cada peso, también los de las capas de atrás, cuánto tuvo que ver con el error.',
  cierre: {
    texto: 'Hasta acá, cómo una red con capas corrige todos sus pesos. En la app, en la pestaña Laboratorio, pausá, avanzá de a una fase y mirá «Ejemplo en curso»: es esta misma ida y vuelta, con la culpa de cada neurona y el cambio de cada peso.',
    enlace: 'Seguí en Laboratorio',
  },
  tramos: {
    quien: {
      corto: 'Qué peso tuvo la culpa',
      pregunta: 'Con capas, ¿qué peso tuvo la culpa?',
      antes: [
        'Para corregir un peso hace falta su pendiente: cuánto cambia el error si ese peso cambia. Con una neurona sola era fácil, porque cada peso toca directo la respuesta. En una red con capas, los pesos de A y de B influyen en la respuesta solo a través de C.',
        'Esta es la red de tres neuronas, con dos cambios: ahora las tres responden con la salida suave, un número entre 0 y 1, y los pesos son otros: números redondos, puestos sin pensar en el XOR. El ejemplo: entra un 1 por la izquierda y un 0 por la derecha, y la respuesta correcta es 1.',
      ],
      consigna: 'Seguí la cuenta hacia adelante: qué responde A, qué responde B y qué responde C.',
      despues: [
        'La red respondió 0,41 y había que dar 1. El error de este ejemplo es 0,9.',
        'En esa respuesta intervinieron nueve números: seis pesos y tres sesgos. Alguno empujó para el lado correcto y otro para el equivocado. La pregunta es cuánto le toca a cada uno.',
      ],
    },
    salida: {
      corto: 'La culpa de la salida',
      pregunta: '¿Cuánta culpa tiene la salida?',
      antes: [
        'Se empieza por el final, que es lo único que se puede comparar con la respuesta correcta. C respondió 0,41 y tenía que responder 1.',
      ],
      consigna: 'Apretá «Paso».',
      despues: [
        'El rombo naranja junto a C dice −0,59: lo que respondió menos lo que tenía que responder. A ese número se le dice la **culpa** de la neurona. Negativa quiere decir que se quedó corta: tenía que dar más.',
        'No es un reproche: es una medida con signo. Dice para qué lado y cuánto tendría que cambiar la suma de C para que el error baje.',
      ],
    },
    atras: {
      corto: 'La culpa va hacia atrás',
      pregunta: '¿Cómo llega la culpa a las de atrás?',
      antes: [
        'A y B no tienen una respuesta correcta con qué compararse: nadie dijo cuánto tenían que dar. Lo único que se sabe es cuánto influyó cada una en C, y eso lo dice el peso que las une.',
        'Así que la culpa de C vuelve por las mismas conexiones por las que fue la cuenta, en sentido contrario.',
      ],
      consigna: 'Apretá «Paso» y mirá las puntas naranjas: llevan la culpa de C hacia A y hacia B.',
      despues: [
        'A cada oculta le llega la culpa de C multiplicada por el peso que las une: está en la lista de la derecha. A A, que está unida con un peso de 1, le llega −0,59. A B, unida con −1, le llega 0,59: con el signo cambiado, porque su peso es negativo.',
        'Lo que llega se multiplica por un número más: qué tan sensible estaba esa neurona, es decir, la pendiente de su curva en el punto donde quedó. La culpa de A termina en −0,14 y la de B en 0,15. Por eso este capítulo no usa el escalón: el escalón es plano en todas partes salvo en el salto: no tiene una pendiente que sirva, y la culpa no podría pasar por él.',
      ],
    },
    prediccion: {
      corto: 'Apostá antes de mirar',
      pregunta: '¿Qué peso cambia más?',
      antes: [
        'Antes de ver los cambios, apostá. Ya están las tres culpas. Con ellas se corrige cada peso con la regla del capítulo anterior: en contra de su pendiente, por la tasa. Y la pendiente de un peso es la culpa de la neurona a la que llega, multiplicada por lo que traía esa conexión.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'De estos tres pesos, ¿cuál cambia más?',
        opciones: {
          salida: 'El que va de A a C (vale 1)',
          entrada: 'El que va de la entrada izquierda a A (vale −1,5)',
          apagada: 'El que va de la entrada derecha a A (vale 0,5)',
        },
        acierto: 'Acertaste.',
        error: 'Esta vez no.',
        explicacion: 'El de A a C llega a la neurona con más culpa (−0,59) y traía 0,62: cambia +0,18. El de la entrada izquierda llega a A, que tiene menos culpa (−0,14): cambia +0,07. El de la entrada derecha traía un 0: no cambia nada, porque no tuvo nada que ver.',
        pendiente: 'Elegí una respuesta para ver cuánto cambia cada peso.',
      },
      despues: [
        'A la derecha de la red está el cambio de cada peso y de cada sesgo. En este ejemplo, los pesos que llegan a C cambian más que los de atrás: a A y a B la culpa les llegó más chica. Y los sesgos también cambian: el de C es el que más, +0,3.',
        'Nadie probó nada. Con una pasada hacia adelante y una hacia atrás, cada uno de los nueve números supo para qué lado moverse y cuánto.',
      ],
    },
    epocas: {
      corto: 'Con todos los ejemplos',
      pregunta: '¿Y si se repite con todos los ejemplos?',
      antes: [
        'Eso fue un ejemplo y una corrección. La red tiene que acertar cuatro: los cuatro casos del XOR. Se hace lo mismo con cada uno, uno detrás del otro: ida, vuelta, corrección. Y cuando se terminan los ejemplos, se empieza de nuevo.',
        'A la derecha aparece la curva del error medio de los cuatro ejemplos. Arranca en 0,72, con la red acertando uno de cuatro.',
      ],
      consigna: 'Apretá «Una época» y mirá cómo cambian los pesos. Después apretá «100 épocas» varias veces: seguí la curva y cuántos acierta.',
      despues: [
        'Una pasada completa por todos los ejemplos es una **época**. El método de calcular las pendientes de todos los pesos yendo de la salida hacia atrás se llama **backpropagation**: propagación hacia atrás. No es otra forma de aprender: es la forma de calcular el gradiente en una red con capas. El que corrige sigue siendo el descenso por gradiente.',
        'Seguí apretando y mirá la curva y el contador de aciertos. No siempre se llega a los cuatro: en una red con capas el terreno del error tiene lugares donde el descenso se frena sin ser el mejor, y con otros pesos de partida la red puede quedarse ahí.',
      ],
      logroTexto: 'Cuatro de cuatro. Con estos pesos de partida la red llegó a dar el **XOR**, y nadie le puso los pesos.',
    },
    desafio: {
      corto: 'Desafío: corregir un peso',
      pregunta: '¿Podés corregir un peso a mano?',
      antes: [
        'Último tramo, y es un desafío. Volvemos a la red de partida y al primer ejemplo. Se mueve un solo peso, el que va de A a C: el que más cambiaba. Lleva el borde azul.',
        'A la derecha está lo que dice la cuenta de ese peso: para qué lado conviene moverlo. No te dice hasta dónde.',
      ],
      consigna: 'Mové el peso en el sentido que indica su culpa, cinco pasos de 0,1, y mirá el error.',
      desafioTexto: {
        estado: '{bien} de {total} pasos en el sentido de la culpa',
        pedirPista: 'Dame una pista',
        pista: 'La culpa de C es negativa: respondió de menos. Lo que le llega de A es positivo. Para que C responda más, ese peso tiene que crecer.',
        logrado: 'Cinco pasos, y el error del ejemplo bajó. Hiciste a mano lo que backpropagation y el descenso por gradiente hacen con todos los pesos a la vez.',
      },
      despues: [
        'Si lo movés para el otro lado, el error sube: la culpa tenía razón. Eso es todo lo que hace falta saber de un peso para corregirlo.',
        'Queda dicho cómo aprende una red cuando alguien le dice la respuesta correcta de cada ejemplo. Manejar un auto no es así: nadie sabe cuál era la tecla correcta en cada instante. Para eso hay otra forma de buscar los pesos, y es el capítulo que sigue.',
      ],
    },
  },
  figura: {
    titulo: 'Figura: una red de tres neuronas; la cuenta va hacia adelante y la culpa vuelve hacia atrás',
    izquierda: 'izquierda',
    derecha: 'derecha',
    responde: 'responde {salida}, debía {correcta}',
    error: 'error {error}',
    aciertos: 'acierta {n} de {total}',
    ejes: { epocas: 'error medio por época' },
    nombres: { izquierda: 'izq.', derecha: 'der.', peso: '{de} → {a}', sesgo: 'sesgo de {a}', llega: 'a {a} le llega' },
    lista: { llega: 'la culpa de C, por cada peso', cambios: 'cuánto cambia cada uno', desafio: 'lo que dice la cuenta' },
    sube: 'conviene subirlo',
    baja: 'conviene bajarlo',
    quieto: 'no hace falta moverlo',
    sinCulpa: 'todavía sin calcular',
    cuenta: {
      respondio: 'respondió',
      debia: 'y debía',
      error: 'error',
      culpaDe: 'culpa de {quien}',
      cambio: 'cambio del peso de A a C',
      epoca: 'época {n}',
      errorMedio: 'error medio',
      peso: 'peso de A a C',
    },
    leyenda: { culpa: 'culpa', aFavor: 'peso a favor', enContra: 'peso en contra' },
    controles: {
      paso: { rotulo: 'Paso', ayuda: 'Lleva la culpa una capa más atrás.' },
      epoca: { rotulo: 'Una época', ayuda: 'Corrige la red con los cuatro ejemplos, una vez.' },
      cien: { rotulo: '100 épocas', ayuda: 'Corrige la red con los cuatro ejemplos, cien veces.' },
      peso: { nombre: 'Peso de A a C', ayuda: 'Cuánto cuenta lo que responde A para C.' },
    },
    restablecer: { rotulo: 'Restablecer', ayuda: 'Vuelve a los valores de este tramo.' },
    tocada: 'La figura sigue como la dejaste.',
    resumen: 'La red responde {salida}. Error {error}. Culpa de la salida: {culpa}.',
    resumenEpocas: 'Época {n}. Error medio {error}. Acierta {bien} de {total}.',
  },
  profundizar: {
    titulo: 'Para profundizar',
    intro: 'Backpropagation, con los nombres que usa la app.',
    formulas: [
      { nombre: 'Culpa de la salida', formula: 'δ = ŷ − y' },
      { nombre: 'Culpa de una neurona oculta', formula: 'δⱼ = ( Σₖ δₖ · wₖⱼ ) · f′(zⱼ)' },
      { nombre: 'Cambio de un peso', formula: 'Δw = −η · δ · a' },
    ],
    simbolos: [
      { simbolo: 'δ', que: 'la culpa de una neurona: la pendiente del error respecto de su suma (la letra griega delta)' },
      { simbolo: 'ŷ, y', que: 'lo que respondió la red y lo que tenía que responder' },
      { simbolo: 'Σₖ', que: 'la suma sobre las neuronas de la capa siguiente, las que reciben a esta' },
      { simbolo: 'wₖⱼ', que: 'el peso que une esta neurona (j) con cada una de las siguientes (k)' },
      { simbolo: 'f′(zⱼ)', que: 'la pendiente de la activación en la suma que le tocó; con la sigmoide vale a · (1 − a)' },
      { simbolo: 'η', que: 'la tasa de aprendizaje; en la figura, 0,5' },
      { simbolo: 'a', que: 'lo que traía la conexión: la salida de la neurona de donde sale el peso, o la entrada' },
    ],
    frases: [
      'Es la regla de la cadena del cálculo, aplicada con orden: para saber cómo influye un peso de atrás en el error, se multiplican las influencias de cada eslabón del camino. Hacerlo de la salida hacia atrás permite reusar las culpas ya calculadas, y por eso alcanza con una sola pasada.',
      'Que la culpa de la salida sea tan simple (ŷ − y) no es casualidad: sale de combinar la sigmoide con la entropía cruzada del capítulo 4.',
      'Con el escalón, f′ vale cero en todas partes salvo en el salto: ninguna culpa pasaría hacia atrás. La app no deja aprender así a una red con escalón en las capas ocultas.',
      'La idea tiene varios autores. El trabajo de Rumelhart, Hinton y Williams de 1986 fue el que la hizo conocida, no el primero en usarla: está en la historia.',
    ],
  },
  fuentes: {
    titulo: 'Fuentes',
    nota: 'Las cuentas de la figura las hace el mismo código que usa el Laboratorio de la app: la ida, las culpas, las correcciones y la pasada por los ejemplos. Los pesos de partida son fijos y se eligieron para que la red empiece equivocada y la corrección llegue a dar el XOR. Con otros pesos puede frenarse antes: lo que se ve al correr las épocas es lo que da la cuenta con estos.',
    lista: [
      { texto: 'Rumelhart, D., Hinton, G. y Williams, R. (1986). Learning representations by back-propagating errors. Nature 323, 533–536.', url: '', nota: '' },
      { texto: 'Goodfellow, I., Bengio, Y. y Courville, A. (2016). Deep Learning. MIT Press. Capítulo 6, sección 6.5: backpropagation.', url: 'https://www.deeplearningbook.org', nota: '' },
      { texto: 'El código del proyecto: backpropagation (src/core/backprop.js) y la cuenta de este capítulo, con sus pruebas (src/teoria/capitulos/culpa/cuenta.js).', url: '', nota: '' },
    ],
  },
};
