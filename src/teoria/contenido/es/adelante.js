// Textos en español de «La cuenta hacia adelante» (seccion-teoria D12, capítulo 3). El orden de los tramos
// y los números de la figura vienen de capitulos/adelante/guion.js: acá solo va la prosa, por id de tramo.
// Las marcas de la prosa (**término**, {entra|texto}, …) las explica contenido/es/neurona.js.
//
// Contenido revisado en openspec/changes/archive/2026-11-20-seccion-teoria/revision-contenido-adelante.md.
// Los números que dice la prosa (qué suma cada neurona, qué da la red) salen de la cuenta y tienen prueba
// en tests/teoria-capitulos-3-a-6.test.js.

export default {
  titulo: 'La cuenta hacia adelante',
  bajada: 'En qué orden hace sus cuentas una red, de las entradas a la respuesta.',
  cierre: {
    texto: 'Hasta acá, cómo calcula una red. En la app, en la pestaña Inspeccionar, pausá un auto y apretá «Paso»: vas a ver esta misma cuenta, neurona por neurona, en la red que lo maneja.',
    enlace: 'Seguí en Inspeccionar',
  },
  tramos: {
    orden: {
      corto: 'En qué orden',
      pregunta: '¿En qué orden hace la cuenta una red?',
      antes: [
        'Esta es la red de tres neuronas que armaste en «Una recta no alcanza», con los mismos números. A y B reciben las dos entradas; C recibe lo que responden A y B.',
        'C no puede hacer su cuenta hasta que A y B terminen la suya: le faltarían los números. Así que hay un orden. Mirá cómo se va llenando: primero A, después B y recién entonces C.',
      ],
      consigna: 'Mirá la cuenta completarse. Con «Otra vez» la ves de nuevo.',
      despues: [
        'Con la entrada izquierda en 1 y la derecha en 0, A suma 0,5 y se enciende, B suma −0,5 y queda apagada, y C, con esas dos respuestas, suma 0,5: la red da 1.',
        'Nada viaja por un cable ni tarda un tiempo. Es una cuenta que se hace en orden, como cuando resolvés primero lo que está entre paréntesis.',
      ],
    },
    paso: {
      corto: 'De a una neurona',
      pregunta: '¿Qué hace cada neurona cuando le toca?',
      antes: [
        'Ahora la red está sin calcular: las tres neuronas están vacías, con el borde a rayas. La que tiene el anillo amarillo es la que sigue.',
        'Cada vez que apretás «Paso», esa neurona hace lo único que sabe hacer: multiplica cada número que recibe por su peso, suma todo, suma su sesgo y se fija si el total pasa de cero.',
      ],
      consigna: 'Apretá «Paso» tres veces y leé la cuenta de cada neurona, debajo del dibujo.',
      despues: [
        'Las tres hacen exactamente lo mismo que la neurona sola del capítulo 1. Lo único que cambia es de dónde sale lo que reciben: A y B lo toman de las entradas; C, de A y de B.',
        'Una red no tiene ninguna operación nueva. Es la cuenta de una neurona, repetida.',
      ],
    },
    capas: {
      corto: 'Capa por capa',
      pregunta: '¿De dónde saca sus entradas la última?',
      antes: [
        'La red llega ya calculada, con la entrada izquierda en 0 y la derecha en 1. Ahora podés mover las dos entradas, y la red rehace toda la cuenta cada vez.',
        'Fijate en C. Nunca ve tus entradas: solo ve un 0 o un 1 de A y otro de B. Si A y B no cambian su respuesta, C no se entera de que moviste algo.',
      ],
      consigna: 'Mové las entradas. Tocá cada neurona para leer su cuenta y fijate qué números recibe C.',
      despues: [
        'A y B están a la misma altura de la cuenta: reciben lo mismo y ninguna necesita a la otra. Forman una **capa**. Dentro de una capa el orden no importa: da igual calcular primero A o primero B. Lo que sí importa es el orden entre capas: una capa entera, y después la siguiente.',
        'Recorrer la red así, de las entradas a la salida, capa por capa, se llama **pasada hacia adelante**. En inglés, forward pass. Cada vez que una red responde algo, hizo una.',
      ],
    },
    prediccion: {
      corto: 'Apostá antes de mirar',
      pregunta: 'Con estas entradas, ¿qué sale?',
      antes: [
        'Antes de calcular nada, apostá. Las dos entradas están en 1 y la red está sin calcular. Los pesos y los sesgos están a la vista: A tiene 1 y 1 con sesgo −0,5; B, 1 y 1 con sesgo −1,5; C, 1 y −1 con sesgo −0,5.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'Con las dos entradas en 1, ¿qué da la red al final?',
        opciones: { uno: 'Da 1: se enciende', cero: 'Da 0: queda apagada' },
        acierto: 'Acertaste.',
        error: 'Esta vez no.',
        explicacion: 'A suma 1 + 1 − 0,5 = 1,5 y se enciende. B suma 1 + 1 − 1,5 = 0,5 y también se enciende. A C le llegan un 1 y un 1: 1 − 1 − 0,5 = −0,5. No pasa de cero: la red da 0.',
        pendiente: 'Elegí una respuesta para ver la cuenta.',
      },
      despues: [
        'Para saberlo hubo que hacer la pasada entera: primero A y B, y con lo que dieron, C. No hay atajo. La respuesta de una red es el final de esa cuenta.',
        'Es el XOR del capítulo anterior: con las dos entradas en 1, tiene que dar 0.',
      ],
    },
    auto: {
      corto: 'La red del auto',
      pregunta: '¿Y la red del auto?',
      antes: [
        'El auto de la app tiene cinco sensores y cuatro teclas: adelante, izquierda, derecha y atrás. Su red recibe cinco números y da cuatro respuestas, una por tecla.',
        'Esta tiene una capa oculta de seis neuronas. Sus pesos están puestos al azar: todavía no aprendió nada, y por eso aprieta tres teclas a la vez. Lo que importa acá es la forma de la cuenta.',
      ],
      consigna: 'Mirá cómo se llena: primero las seis de la capa oculta, después las cuatro teclas.',
      despues: [
        'Es la misma pasada hacia adelante, más ancha: diez neuronas en lugar de tres y 54 pesos en lugar de seis. Cada neurona de la capa oculta recibe los cinco sensores; cada tecla recibe las seis respuestas de la capa oculta.',
        'En la app el auto hace esta cuenta entera en cada paso de la simulación, con lo que leen sus sensores en ese momento. En la última capa, cada tecla se aprieta si su suma pasa de cero.',
      ],
    },
    desafio: {
      corto: 'Desafío: encenderla',
      pregunta: '¿Podés elegir entradas que enciendan la red?',
      antes: [
        'Último tramo, y es un desafío. Volvemos a la red de tres neuronas. Los pesos no se tocan: solo las dos entradas, que ahora pueden valer también números intermedios, entre 0 y 1.',
        'Las dos arrancan en 0 y la red da 0.',
      ],
      consigna: 'Mové las entradas hasta que la red dé 1.',
      desafioTexto: {
        estado: '{bien} de {total} neuronas como hacen falta',
        pedirPista: 'Dame una pista',
        pista: 'Pensalo desde el final. C se enciende solo si A dice 1 y B dice 0. ¿Cuánto tienen que sumar las entradas para que pase A pero no pase B?',
        logrado: 'La red da 1. Para lograrlo tuviste que pensar la pasada al revés: qué necesita C, y entonces qué tienen que responder A y B.',
      },
      despues: [
        'Hay muchas respuestas: cualquier par de entradas que sume más de 0,5 y no más de 1,5. Con menos, A no se enciende; con más, se enciende B y apaga a C.',
        'Ya sabés cómo responde una red: una pasada hacia adelante. Lo que sigue es qué hacer cuando esa respuesta está mal.',
      ],
    },
  },
  figura: {
    titulo: 'Figura: una red de tres neuronas que se calcula de a una, y la red del auto',
    izquierda: 'izquierda',
    derecha: 'derecha',
    encendida: 'encendida',
    apagada: 'apagada',
    capas: { entradas: 'entradas', oculta: 'capa oculta', salida: 'capa de salida', sensores: 'sensores', teclas: 'teclas' },
    teclas: ['adelante', 'izquierda', 'derecha', 'atrás'],
    sinCuenta: 'Todavía no se calculó ninguna neurona.',
    cuentaAuto: '{hechas} de {neuronas} neuronas calculadas, con {pesos} pesos en total',
    calculadas: 'Calculadas: {n} de {total}',
    daUno: 'La red da 1',
    daCero: 'La red da 0',
    marcadorAuto: 'Teclas apretadas: {teclas}',
    controles: {
      entradas: [
        { nombre: 'Entrada izquierda', ayuda: 'El primer número que recibe la red, de 0 a 1.' },
        { nombre: 'Entrada derecha', ayuda: 'El segundo número que recibe la red, de 0 a 1.' },
      ],
      paso: { rotulo: 'Paso', ayuda: 'Calcula la neurona que sigue.' },
      otraVez: { rotulo: 'Otra vez', ayuda: 'Vuelve a mostrar la cuenta desde el principio.' },
    },
    restablecer: { rotulo: 'Restablecer', ayuda: 'Vuelve a los valores de este tramo.' },
    tocada: 'La figura sigue como la dejaste.',
    neurona: {
      descripcion: 'Elegila para leer su cuenta debajo del dibujo.',
      calculada: 'Neurona {quien}: suma {suma} y da {salida}.',
      pendiente: 'Neurona {quien}: todavía sin calcular.',
    },
    resumen: 'Entradas {x1} y {x2}. La red da {salida}.',
    resumenAuto: 'Red del auto calculada. Teclas apretadas: {teclas}.',
  },
  profundizar: {
    titulo: 'Para profundizar',
    intro: 'La pasada hacia adelante, escrita para una capa cualquiera.',
    formulas: [
      { nombre: 'Lo que da una neurona', formula: 'a = f(w₁·x₁ + w₂·x₂ + … + b)' },
      { nombre: 'Una capa entera', formula: 'a⁽ˡ⁾ = f(W⁽ˡ⁾ · a⁽ˡ⁻¹⁾ + b⁽ˡ⁾)' },
    ],
    simbolos: [
      { simbolo: 'x₁, x₂, …', que: 'los números que recibe la neurona' },
      { simbolo: 'w₁, w₂, …', que: 'el peso de cada uno' },
      { simbolo: 'b', que: 'el sesgo' },
      { simbolo: 'f', que: 'la activación: acá, el escalón, que da 1 si la suma pasa de cero y 0 si no' },
      { simbolo: 'a', que: 'lo que da la neurona (su activación)' },
      { simbolo: 'a⁽ˡ⁾', que: 'lo que dan todas las neuronas de la capa l, en una lista; a⁽⁰⁾ son las entradas' },
      { simbolo: 'W⁽ˡ⁾, b⁽ˡ⁾', que: 'todos los pesos de la capa l, ordenados en una tabla (una matriz), y todos sus sesgos' },
    ],
    frases: [
      'La segunda fórmula dice lo mismo que la primera para todas las neuronas de una capa a la vez. Por eso las redes se calculan con tablas de números: una multiplicación de matrices por capa.',
      'El escalón es la activación más simple. La app también deja usar otras en las capas ocultas (sigmoide, tanh y ReLU); la sigmoide se explica en el capítulo que sigue.',
    ],
  },
  fuentes: {
    titulo: 'Fuentes',
    nota: 'Las cuentas de la figura las hace el mismo código que usa la app para manejar el auto, con activación escalón. La red del auto de la figura tiene pesos al azar con semilla fija: muestra siempre lo mismo.',
    lista: [
      { texto: 'Goodfellow, I., Bengio, Y. y Courville, A. (2016). Deep Learning. MIT Press. Capítulo 6: redes hacia adelante.', url: 'https://www.deeplearningbook.org', nota: '' },
      { texto: 'El código del proyecto: la red y su cuenta (src/core/network.js) y la cuenta de este capítulo, con sus pruebas (src/teoria/capitulos/adelante/cuenta.js).', url: '', nota: '' },
    ],
  },
};
