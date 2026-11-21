// Textos en español de «Corregir un poco cada vez» (seccion-teoria D12, capítulo 5). El orden de los
// tramos y los números de la figura vienen de capitulos/corregir/guion.js: acá solo va la prosa, por id de
// tramo. Las marcas de la prosa (**término**, {entra|texto}, …) las explica contenido/es/neurona.js.
//
// Contenido revisado en openspec/changes/archive/2026-11-20-seccion-teoria/revision-contenido-corregir.md.
// Los números que dice la prosa (dónde arranca la bolita, cuánto vale la pendiente, a dónde la lleva cada
// paso) salen de la cuenta y tienen prueba en tests/teoria-capitulos-3-a-6.test.js.

export default {
  titulo: 'Corregir un poco cada vez',
  bajada: 'Cómo se achica el error moviendo cada peso un poquito, y cuánto es un poquito.',
  cierre: {
    texto: 'Hasta acá, cómo se corrige un peso y cuánto. En la app, en la pestaña Laboratorio, cambiá la «Tasa de aprendizaje» y mirá las curvas de error: una tasa muy chica las baja despacio y una muy grande las hace saltar.',
    enlace: 'Seguí en Laboratorio, tasa de aprendizaje',
  },
  tramos: {
    lado: {
      corto: 'Para qué lado',
      pregunta: '¿Para qué lado muevo la perilla?',
      antes: [
        'En «Medir el error» bajaste el error mirando la curva entera. Una red no puede: dibujar la curva de un peso es probar todos sus valores, y una red tiene demasiados pesos para eso. Lo único que tiene es el punto donde está parada.',
        'Así que ahora la curva está tapada. Ves la bolita, que es la neurona de ahora, y el número de su error. Lo que vayas recorriendo queda dibujado.',
      ],
      consigna: 'Mové el peso para bajar el error. Empezá por el lado que quieras.',
      despues: [
        'A ciegas se puede: movés un poco, mirás si el número bajó, y si subió volvés. Pero cada prueba es calcular todo de nuevo, y con miles de pesos hay que probar cada uno por separado.',
        'Haría falta algo que diga para qué lado ir antes de moverse.',
      ],
    },
    pendiente: {
      corto: 'La pendiente',
      pregunta: '¿Hay algo que diga para dónde?',
      antes: [
        'Sí, y está en el mismo punto donde está parada la bolita. La bolita volvió a −2 y ahora la curva se ve entera, y sobre la bolita hay una recta naranja que la toca: marca qué tan inclinada está la curva justo ahí.',
        'La punta de la recta señala hacia donde el error baja.',
      ],
      consigna: 'Mové el peso y mirá la recta: cómo se inclina, hacia dónde apunta y qué pasa en el fondo.',
      despues: [
        'Esa inclinación es la **pendiente** del error respecto del peso. Es un número con signo: negativa, el error baja si el peso sube; positiva, baja si el peso baja. En −2 vale −0,29. En el fondo, cerca de 4,3, vale cero: la recta queda horizontal y no hay hacia dónde bajar.',
        'Lo importante: la pendiente se calcula con una cuenta, en el punto donde uno está, sin probar ningún otro. Al conjunto de las pendientes de todos los pesos de una red se le dice **gradiente**. Acá hay un solo peso, así que el gradiente es un solo número.',
      ],
    },
    cuanto: {
      corto: 'Cuánto moverse',
      pregunta: '¿Cuánto me muevo?',
      antes: [
        'La pendiente dice para qué lado. Falta decidir cuánto. La regla es simple: moverse en contra de la pendiente, y más cuanto más inclinada esté la curva. Cuánto más lo decide un número que elegís vos.',
        'Ese número arranca en 4, y la bolita, otra vez en −2. La cuenta de abajo muestra el próximo paso: el peso de ahora, menos 4 por la pendiente.',
      ],
      consigna: 'Apretá «Un paso» varias veces. Después restablecé, cambiá la tasa y probá de nuevo.',
      despues: [
        'Ese número es la **tasa de aprendizaje**. El primer paso, con tasa 4, lleva el peso de −2 a −0,85. Los pasos se van acortando solos: cerca del fondo la curva es casi plana, la pendiente es chica y el paso también.',
        'La bolita no rueda ni toma envión: da un paso, vuelve a calcular la pendiente donde quedó, y da otro. Con una tasa chica llega, pero tarda.',
      ],
    },
    prediccion: {
      corto: 'Apostá antes de mirar',
      pregunta: 'Con una tasa muy alta, ¿qué pasa?',
      antes: [
        'Antes de apretar nada, apostá. Si una tasa más grande da pasos más largos, parece que conviene subirla todo lo posible. La bolita volvió a −2 y la tasa ahora es 60, quince veces la de antes.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'Con tasa 60, ¿qué hace la bolita en ocho pasos?',
        opciones: {
          llega: 'Llega al fondo en uno o dos pasos',
          vuelve: 'Se pasa una vez y después se acomoda en el fondo',
          rebota: 'Salta de un lado al otro del fondo, cada vez más lejos',
        },
        acierto: 'Acertaste.',
        error: 'Esta vez no.',
        explicacion: 'El primer paso la manda a 15,21: del otro lado del fondo y fuera del dibujo. Desde ahí vuelve cerca del fondo, pero no se queda: cada paso es tan largo que lo cruza otra vez, y los saltos se agrandan. Después de ocho pasos está en 10,24.',
        pendiente: 'Elegí una respuesta para ver los ocho pasos.',
      },
      despues: [
        'La pendiente dice hacia dónde baja el error justo donde uno está parado. No dice hasta dónde sigue bajando. Un paso demasiado largo cruza el fondo y cae del otro lado, a veces más alto que antes.',
        'Por eso el título del capítulo: corregir un poco cada vez. La tasa de aprendizaje se elige probando. Muy chica, tarda; muy grande, se pasa de largo, rebota o se aleja.',
      ],
    },
    mapa: {
      corto: 'Con dos pesos',
      pregunta: '¿Y con dos pesos?',
      antes: [
        'Hasta acá el peso derecho estuvo quieto. Si se mueven los dos, el error ya no es una curva: es un terreno. La bolita arranca en otro lugar: peso izquierdo −2 y peso derecho 2. Este mapa lo muestra desde arriba, como un mapa de relieve. Cada franja es un escalón de altura: más oscura, más bajo el error. La cruz marca el fondo.',
        'La raya horizontal es la curva de los tramos anteriores: un corte de este mismo terreno, con el peso derecho fijo.',
      ],
      consigna: 'Apretá «Un paso» y seguí a la bolita. Mirá por dónde baja.',
      despues: [
        'En cada paso se calculan dos pendientes, una por peso, y cada peso se mueve en contra de la suya. Las dos juntas son el gradiente, y apuntan cuesta arriba; la bolita va para el otro lado. Bajar así, paso a paso y en contra del gradiente, se llama **descenso por gradiente**.',
        'Con una neurona y esta forma de medir el error, el terreno tiene un solo valle: bajando siempre, se llega. En redes con capas el terreno es más complicado, y el descenso puede frenarse en lugares que no son el más bajo.',
      ],
    },
    desafio: {
      corto: 'Desafío: llegar en diez',
      pregunta: '¿Podés llegar al fondo en pocos pasos?',
      antes: [
        'Último tramo, y es un desafío. Tenés diez pasos y una perilla: la tasa. La bolita arranca en el mismo lugar del mapa, con un error de 0,94.',
        'La tasa está en 2. Con eso, diez pasos no alcanzan.',
      ],
      consigna: 'Elegí una tasa y dá los diez pasos. Tenés que terminar con un error menor que 0,6.',
      desafioTexto: {
        estado: '{bien} de {total} tramos del camino hasta la meta',
        pedirPista: 'Dame una pista',
        pista: 'Con tasa 2 los pasos son cortos y parejos: la bolita va bien encaminada, pero lenta. Restablecé y probá con una tasa bastante más grande.',
        logrado: 'Error por debajo de 0,6 en diez pasos. No cambiaste ningún peso a mano: elegiste un solo número y la cuenta hizo el resto.',
      },
      despues: [
        'En este mapa, de 7 para arriba la tasa alcanza. Pero ya viste que no se puede subir sin límite: en la curva, con 60, la bolita rebotaba.',
        'Así aprende una red de las que tienen respuesta correcta para cada ejemplo: mide el error, calcula el gradiente, da un paso corto en contra, y repite. Falta una pieza: cómo se calcula la pendiente de un peso que está en una capa de atrás.',
      ],
    },
  },
  figura: {
    titulo: 'Figura: la curva del error contra un peso con una bolita que da pasos, y el mapa del error contra dos pesos',
    ejes: { peso: 'peso izquierdo', pesoDerecho: 'peso derecho', error: 'error medio', pasos: 'pasos' },
    fondo: 'fondo',
    meta: 'meta: {meta}',
    errorAhora: 'error {error}',
    pasosDados: 'paso {n} de {total}',
    marcadorError: 'Error medio: {error}',
    marcadorPasos: 'Paso {n}: error {error}',
    marcadorMapa: 'Error medio: {error}',
    sinPasos: 'No quedan pasos',
    cuenta: {
      peso: 'peso',
      error: 'error',
      pendiente: 'pendiente',
      plano: 'acá no baja para ningún lado',
      bajaDerecha: 'el error baja hacia la derecha',
      bajaIzquierda: 'el error baja hacia la izquierda',
      formula: 'peso − tasa × pendiente',
      pendientes: 'pendientes',
      y: 'y',
      tasa: 'tasa',
    },
    controles: {
      peso: { nombre: 'Peso izquierdo', ayuda: 'Mueve la bolita a mano, a la izquierda o a la derecha.' },
      tasa: { nombre: 'Tasa de aprendizaje', ayuda: 'Cuánto se mueve en cada paso: más alta, pasos más largos.' },
      paso: { rotulo: 'Un paso', ayuda: 'Mueve la bolita una vez, en contra de la pendiente.' },
      otraVez: { rotulo: 'Otra vez', ayuda: 'Vuelve a mostrar los pasos desde el principio.' },
    },
    restablecer: { rotulo: 'Restablecer', ayuda: 'Vuelve a los valores de este tramo.' },
    tocada: 'La figura sigue como la dejaste.',
    resumen: 'Peso izquierdo {w1}, peso derecho {w2}. Error medio {error}. Pasos dados: {n}.',
  },
  profundizar: {
    titulo: 'Para profundizar',
    intro: 'La regla del descenso por gradiente, para un peso cualquiera.',
    formulas: [
      { nombre: 'Un paso de descenso por gradiente', formula: 'w ← w − η · ∂E/∂w' },
      { nombre: 'El gradiente', formula: '∇E = (∂E/∂w₁, ∂E/∂w₂, …)' },
    ],
    simbolos: [
      { simbolo: 'w', que: 'un peso (con el sesgo se hace lo mismo)' },
      { simbolo: '←', que: '«pasa a valer»: el valor nuevo reemplaza al anterior' },
      { simbolo: 'η', que: 'la tasa de aprendizaje (la letra griega eta)' },
      { simbolo: 'E', que: 'el error medio' },
      { simbolo: '∂E/∂w', que: 'la pendiente del error respecto de ese peso: cuánto cambia el error si el peso cambia un poquito y los demás quedan quietos (su derivada parcial)' },
      { simbolo: '∇E', que: 'el gradiente: la lista de las pendientes de todos los pesos' },
    ],
    frases: [
      'En la figura, cada paso usa el promedio de los ocho ejemplos, para que la bolita siga exactamente la curva que se dibuja. La app corrige después de cada ejemplo, uno por uno: es la misma regla aplicada más seguido, y el camino sale más zigzagueante.',
      'Las tasas de la figura (4, 60) son grandes porque esta curva es muy plana cerca del fondo. No se comparan con las de otro problema: la tasa que sirve depende de qué tan empinado sea cada terreno.',
    ],
  },
  fuentes: {
    titulo: 'Fuentes',
    nota: 'La pendiente de la figura la calcula el mismo código que usa el Laboratorio de la app para corregir pesos. Los ejemplos y el mapa son los del capítulo «Medir el error».',
    lista: [
      { texto: 'Goodfellow, I., Bengio, Y. y Courville, A. (2016). Deep Learning. MIT Press. Sección 4.3 (optimización basada en el gradiente) y capítulo 8 (optimización).', url: 'https://www.deeplearningbook.org', nota: '' },
      { texto: 'El código del proyecto: las correcciones de los pesos (src/core/backprop.js) y la cuenta de este capítulo, con sus pruebas (src/teoria/capitulos/corregir/cuenta.js).', url: '', nota: '' },
    ],
  },
};
