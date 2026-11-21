// Textos en español de «Medir el error» (seccion-teoria D12, capítulo 4). El orden de los tramos y los
// números de la figura vienen de capitulos/error/guion.js: acá solo va la prosa, por id de tramo. Las
// marcas de la prosa (**término**, {entra|texto}, …) las explica contenido/es/neurona.js.
//
// Contenido revisado en openspec/changes/archive/2026-11-20-seccion-teoria/revision-contenido-error.md.
// Los números que dice la prosa (qué responde cada ejemplo, cuánto vale su error, cuántos acierta) salen
// de la cuenta y tienen prueba en tests/teoria-capitulos-3-a-6.test.js.

export default {
  titulo: 'Medir el error',
  bajada: 'Cómo se le pone un número a «qué tan mal estuvo».',
  cierre: {
    texto: 'Hasta acá, cómo se mide qué tan mal responde una red. En la app, en la pestaña Laboratorio, mirá «Ejemplo en curso» y «Curvas de error» mientras la red aprende: son este mismo número, ejemplo por ejemplo y de todos juntos.',
    enlace: 'Seguí en Laboratorio',
  },
  tramos: {
    saber: {
      corto: 'Saber que se equivocó',
      pregunta: '¿Cómo sabe una red que se equivocó?',
      antes: [
        'Sola, no lo sabe. Alguien tiene que decirle qué había que responder. Acá hay ocho ejemplos: lo que leyeron los dos sensores del auto y, para cada uno, la respuesta correcta. Un círculo a la derecha es un 1: había que doblar. Un cuadrado a la izquierda es un 0: había que seguir.',
        'El rombo blanco es lo que responde una neurona artificial como la del capítulo 1, con peso 2 para el sensor izquierdo y −2 para el derecho. Si el rombo cae sobre la respuesta correcta, acertó.',
      ],
      consigna: 'Recorré los ocho ejemplos. Tocá uno para leer su cuenta debajo.',
      despues: [
        'Acierta seis de ocho. Falla el 7 y el 8, y no es casualidad: el 7 se parece mucho al 2, pero su respuesta correcta es la contraria. Lo mismo el 8 con el 4. Son datos que se contradicen un poco, como pasa con los datos de verdad.',
        'Contar aciertos es una primera forma de medir. Pero es una medida gruesa: dice cuántos, no por cuánto.',
      ],
    },
    cuanto: {
      corto: 'Por mucho o por poco',
      pregunta: '¿Se equivocó por mucho o por poco?',
      antes: [
        'Mirá el ejemplo 7. La suma le dio 0,4: pasó de cero por poquito, y la neurona respondió 1. En el ejemplo 1 la suma dio 1,4, y también respondió 1. Para el escalón son lo mismo: un 1 es un 1.',
        'Con el escalón, la neurona no puede decir «creo que sí, pero no estoy segura». Y sin eso no hay forma de saber si estuvo cerca.',
      ],
      consigna: 'Pasá de «Escalón» a «Suave» y mirá a dónde va cada rombo.',
      despues: [
        'Ahora la respuesta es un número entre 0 y 1. Una suma muy positiva da casi 1; una muy negativa, casi 0; una suma de cero da justo 0,5. El ejemplo 1 responde 0,8 y el 7, 0,6: los dos dicen «doblar», pero el 7 con menos seguridad.',
        'A esto se lo llama **salida suave**, y la curva que la dibuja es la **sigmoide**. Decide igual que el escalón (pasa de 0,5 justo cuando la suma pasa de cero), pero además dice qué tan segura está.',
      ],
    },
    vale: {
      corto: 'Cuánto vale el error',
      pregunta: '¿Cuánto vale ese error?',
      antes: [
        'La neurona queda respondiendo con la salida suave. Con una respuesta entre 0 y 1 ya se puede medir la distancia a la correcta. La barra naranja de cada ejemplo va desde lo que respondió la neurona hasta lo que tenía que responder. El número de la derecha dice cuánto vale.',
        'El ejemplo 1 respondió 0,8 y tenía que dar 1: quedó cerca, y su número es chico, 0,22.',
      ],
      consigna: 'Tocá los ejemplos de a uno. Buscá el de la barra más larga y el de la más corta.',
      despues: [
        'Ese número es el **error** del ejemplo. Vale 0 cuando la respuesta es exactamente la correcta y crece cuanto más lejos queda. El 7 respondió 0,6 cuando había que dar 0: su error es 0,91, el más alto junto con el del 8.',
        'No crece parejo: cuanto más segura estaba la neurona de la respuesta equivocada, más rápido sube, y no tiene tope. Esta forma de medir se llama entropía cruzada y es la que usa la app; la fórmula está al final, en «Para profundizar».',
      ],
    },
    prediccion: {
      corto: 'Apostá antes de mirar',
      pregunta: '¿Cuál de estas dos tiene menos error?',
      antes: [
        'Antes de ver los números, apostá. Di vuelta los pesos de la neurona, y ahora responde mal casi todo. Quedaron a la vista dos ejemplos, el 1 y el 3. En los dos había que responder 1, y en los dos el rombo quedó del lado del 0.',
        'En el ejemplo 1 respondió 0,2. En el 3, 0,4.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'Las dos respuestas están mal. ¿Cuál tiene menos error?',
        opciones: { a: 'El ejemplo 1, que respondió 0,2', b: 'El ejemplo 3, que respondió 0,4', igual: 'Igual: las dos quedaron del lado equivocado' },
        acierto: 'Acertaste.',
        error: 'Esta vez no.',
        explicacion: 'El ejemplo 3 quedó más cerca del 1: su error es 0,91. El ejemplo 1 respondió 0,2, casi segura de que había que seguir: su error es 1,62. Contando aciertos las dos valen lo mismo, un fallo; midiendo el error, no.',
        pendiente: 'Elegí una respuesta para ver los dos errores.',
      },
      despues: [
        'Equivocarse dudando cuesta menos que equivocarse con seguridad. Por eso hacía falta la salida suave: con el escalón, estas dos respuestas eran el mismo 0.',
        'Y eso es justo lo que sirve para aprender: un número que cambia un poco cuando la respuesta mejora un poco, aunque todavía esté mal.',
      ],
    },
    todos: {
      corto: 'Todos juntos',
      pregunta: '¿Y el error de todos los ejemplos juntos?',
      antes: [
        'Un ejemplo solo no alcanza para juzgar a la neurona: puede acertar uno y fallar el resto. Se promedian los errores de los ocho, y queda un solo número.',
        'A la derecha cambió el dibujo. Ahora el eje de abajo es el peso izquierdo y la altura es ese promedio. Para este tramo los dos pesos arrancan en −2. La bolita está donde está el peso izquierdo: en −2, con un error de 1,15.',
      ],
      consigna: 'Mové el peso izquierdo de punta a punta y seguí la bolita.',
      despues: [
        'Ese promedio es el **error medio**. Al mover el peso, la bolita recorre una curva: alta a la izquierda, baja hasta un fondo cerca de 2,3 y vuelve a subir. Cada punto de la curva es una neurona distinta, y la altura dice qué tan mal responde.',
        'Con esto, «aprender» deja de ser una idea vaga: es encontrar los pesos donde esa curva está más baja.',
      ],
    },
    desafio: {
      corto: 'Desafío: bajarlo a mano',
      pregunta: '¿Podés bajar el error a mano?',
      antes: [
        'Último tramo, y es un desafío. Ahora se mueven los dos pesos y el sesgo. La neurona arranca con los pesos al revés: acierta dos de ocho y su error medio es 0,94.',
        'La curva de la derecha sigue mostrando el error contra el peso izquierdo, pero cambia de forma cuando movés los otros dos.',
      ],
      consigna: 'Bajá el error medio a menos de 0,6.',
      desafioTexto: {
        estado: '{bien} de {total} tramos del camino hasta la meta',
        pedirPista: 'Dame una pista',
        pista: 'Mirá los ejemplos donde hay que doblar: el sensor izquierdo lee más que el derecho. Que el izquierdo empuje a favor y el derecho en contra.',
        logrado: 'Error medio por debajo de 0,6. Lo bajaste mirando un solo número, sin mirar ejemplo por ejemplo.',
      },
      despues: [
        'A cero no vas a llegar: hay ejemplos que se contradicen, y ninguna neurona acierta los ocho. Con estos datos, por más que busques, el error medio no baja de 0,48.',
        'Lo hiciste a mano y con tres números. Una red tiene miles. Lo que sigue es cómo saber, para cada peso, hacia dónde moverlo sin probar.',
      ],
    },
  },
  figura: {
    titulo: 'Figura: ocho ejemplos con su respuesta correcta, lo que responde una neurona y el error de cada uno',
    columnas: { izquierda: 'izq.', derecha: 'der.', responde: 'responde', error: 'error' },
    ejes: { suma: 'suma', responde: 'responde', peso: 'peso izquierdo', error: 'error medio' },
    acierta: 'acierta {n} de {total}',
    errorMedio: 'error medio {error}',
    meta: 'meta: {meta}',
    cuenta: { respondio: 'respondió', debia: 'y debía', error: 'error', medio: 'promedio de los {total} errores' },
    leyenda: { uno: 'debía dar 1', cero: 'debía dar 0', responde: 'lo que responde' },
    selector: { rotulo: 'Cómo responde la neurona', escalon: 'Escalón', suave: 'Suave', ayuda: 'Escalón: responde 0 o 1. Suave: un número entre 0 y 1.' },
    controles: {
      w1: { nombre: 'Peso izquierdo', ayuda: 'Cuánto cuenta el sensor izquierdo, a favor o en contra.' },
      w2: { nombre: 'Peso derecho', ayuda: 'Cuánto cuenta el sensor derecho, a favor o en contra.' },
      b: { nombre: 'Sesgo', ayuda: 'Se suma siempre, lean lo que lean los sensores.' },
    },
    restablecer: { rotulo: 'Restablecer', ayuda: 'Vuelve a los valores de este tramo.' },
    tocada: 'La figura sigue como la dejaste.',
    fila: {
      descripcion: 'Elegilo para leer su cuenta debajo del dibujo.',
      sinError: 'Ejemplo {n}: izquierdo {x1}, derecho {x2}. Debía dar {correcta}. Responde {dice}: {veredicto}.',
      conError: 'Ejemplo {n}: izquierdo {x1}, derecho {x2}. Debía dar {correcta}. Responde {dice}: {veredicto}. Error {error}.',
      bien: 'bien',
      mal: 'mal',
    },
    resumenError: 'Error medio {error}. Acierta {n} de {total}.',
  },
  profundizar: {
    titulo: 'Para profundizar',
    intro: 'La salida suave y la medida del error que usa la app.',
    formulas: [
      { nombre: 'Sigmoide (la salida suave)', formula: 'ŷ = 1 / (1 + e⁻ᶻ)' },
      { nombre: 'Entropía cruzada (el error de un ejemplo)', formula: 'E = −[ y·ln(ŷ) + (1 − y)·ln(1 − ŷ) ]' },
      { nombre: 'Error medio', formula: 'Ē = (E₁ + E₂ + … + Eₙ) / n' },
    ],
    simbolos: [
      { simbolo: 'z', que: 'la suma de la neurona: cada entrada por su peso, más el sesgo' },
      { simbolo: 'e', que: 'un número fijo, cerca de 2,718' },
      { simbolo: 'ŷ', que: 'lo que responde la neurona, entre 0 y 1' },
      { simbolo: 'y', que: 'la respuesta correcta: 0 o 1' },
      { simbolo: 'ln', que: 'el logaritmo natural' },
      { simbolo: 'E', que: 'el error de un ejemplo' },
      { simbolo: 'n', que: 'cuántos ejemplos hay' },
    ],
    frases: [
      'Como y vale 0 o 1, de los dos términos queda uno solo: si había que dar 1, el error es −ln(ŷ); si había que dar 0, es −ln(1 − ŷ). Cuando ŷ se acerca a la respuesta contraria, el logaritmo se dispara: por eso no tiene tope.',
      'La salida suave se puede leer como una probabilidad: 0,8 es «un 80 % de que haya que doblar», según la neurona. Es su seguridad, no un hecho.',
      'No es la única medida. Otra muy usada es el error cuadrático, (ŷ − y)², más fácil de leer y con tope. En inglés, a la medida del error se le dice loss.',
    ],
  },
  fuentes: {
    titulo: 'Fuentes',
    nota: 'Las cuentas de la figura las hace el mismo código que usa el Laboratorio de la app: la sigmoide y la entropía cruzada. Los ocho ejemplos son inventados para este capítulo; dos contradicen a los demás a propósito.',
    lista: [
      { texto: 'Goodfellow, I., Bengio, Y. y Courville, A. (2016). Deep Learning. MIT Press. Capítulos 5 y 6: funciones de costo y entropía cruzada.', url: 'https://www.deeplearningbook.org', nota: '' },
      { texto: 'El código del proyecto: la salida suave y el error (src/core/backprop.js) y la cuenta de este capítulo, con sus pruebas (src/teoria/capitulos/error/cuenta.js).', url: '', nota: '' },
    ],
  },
};
