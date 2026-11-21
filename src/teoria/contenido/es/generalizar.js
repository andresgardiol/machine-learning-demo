// Textos en español de «Generalizar o memorizar» (seccion-teoria D12, capítulo 8). El orden de los tramos
// y los números de la figura vienen de capitulos/generalizar/guion.js: acá solo va la prosa, por id de
// tramo. Las marcas de la prosa (**término**, {entra|texto}, …) las explica contenido/es/neurona.js.
//
// Escrito sobre openspec/changes/archive/2026-11-20-seccion-teoria/hoja-de-hechos-capitulos.md; falta el cotejo (tarea 16.6).
// Los números que dice la prosa (cuántos acierta cada uno en lo visto y en lo apartado) salen de la cuenta
// y tienen prueba en tests/teoria-capitulos-7-a-9.test.js.

export default {
  titulo: 'Generalizar o memorizar',
  bajada: 'Por qué acertar todo lo que se practicó no alcanza, y cómo se mide lo que de verdad importa.',
  cierre: {
    texto: 'Hasta acá, por qué se mide con ejemplos que no se usaron para aprender. En la app, en la pestaña Competir, los cerebros corren en pistas donde no practicaron: ahí se ve cuál generaliza. Y en Laboratorio, «Apartados» separa ejemplos para medir con ellos.',
    enlace: 'Seguí en Competir',
  },
  tramos: {
    sabe: {
      corto: 'Acertar lo visto',
      pregunta: 'Si acierta todo lo que vio, ¿sabe?',
      antes: [
        'Cuarenta ejemplos. Cada punto son dos números, y su color es la respuesta correcta: naranja o azul. Los naranjas tienden a estar arriba a la izquierda y los azules abajo a la derecha, pero se mezclan en el medio. Son datos con ruido, como los de verdad.',
        'Dos formas de contestar aprendieron con estos cuarenta. Una es una recta, como la de una neurona sola. La otra es un memorizador: guarda los cuarenta puntos y, cuando le preguntan por uno, contesta el color del punto guardado más cercano.',
      ],
      consigna: 'Mirá la tabla: cuántos de los cuarenta acierta cada uno.',
      despues: [
        'El memorizador acierta 40 de 40. La recta, 35 de 40: los cinco que quedaron del lado equivocado no los puede arreglar sin romper otros.',
        'Si hubiera que elegir con este solo dato, gana el memorizador. Pero acertar lo que ya se vio es fácil para alguien que lo guardó todo.',
      ],
    },
    como: {
      corto: 'Cómo contesta cada uno',
      pregunta: '¿Cómo contesta cada uno?',
      antes: [
        'Para ver la diferencia hay que mirar qué contestaría cada uno en cualquier lugar, no solo donde hay un punto. El fondo se pinta del color de la respuesta: naranja donde contestaría naranja, azul donde contestaría azul.',
        'Las cruces rojas son los puntos que falla el que estás mirando.',
      ],
      consigna: 'Pasá de «Recta» a «Memorizador» y compará las dos zonas.',
      despues: [
        'La recta parte el plano en dos mitades limpias. No es cualquier recta: es la que más acierta entre 24 candidatas, una cada 15 grados, todas por el centro. Deja cinco puntos mal y no puede hacer nada por ellos.',
        'El memorizador dibuja un borde lleno de vueltas, con islas: alrededor de cada punto azul perdido entre naranjas hay una mancha azul. No se equivoca en ninguno porque le hizo un lugar a cada uno. No es una red neuronal: es la forma más literal de memorizar.',
      ],
    },
    nuevos: {
      corto: 'Puntos que nunca vieron',
      pregunta: '¿Y con puntos que nunca vieron?',
      antes: [
        'Había más puntos. Antes de empezar se apartaron cuarenta, sacados del mismo lugar que los otros, y ninguno de los dos los vio. Son los huecos.',
        'Los puntos de antes quedaron tenues, y la zona pintada al llegar es la del memorizador. La pregunta ahora es qué contesta cada uno donde cae un punto nuevo.',
      ],
      consigna: 'Elegí a quién mirar y pasá de «Vistos» a «Nuevos». Fijate dónde caen los huecos respecto de cada zona.',
      despues: [
        'A los ejemplos que se guardan sin usarlos para aprender se los llama **ejemplos apartados**. Sirven para una sola cosa: tomar examen con preguntas que no estaban en la práctica.',
        'Los puntos nuevos vienen de las mismas dos manchas, pero no caen en los mismos lugares. Una isla que el memorizador dibujó para un punto suelto puede atrapar a un punto nuevo del otro color.',
      ],
    },
    prediccion: {
      corto: 'Apostá antes de mirar',
      pregunta: '¿Quién acierta más en los nuevos?',
      antes: [
        'Antes de ver los números, apostá. En los cuarenta que vieron, el memorizador acertó 40 y la recta, 35. Ahora se les pregunta por los cuarenta apartados.',
      ],
      consigna: '',
      prediccionTexto: {
        pregunta: 'En los cuarenta puntos nuevos, ¿quién acierta más?',
        opciones: { memorizador: 'El memorizador, que no falló ninguno de los vistos', recta: 'La recta, que falló cinco de los vistos', igual: 'Los dos igual' },
        acierto: 'Acertaste.',
        error: 'Esta vez no.',
        explicacion: 'La recta acierta 38 de 40 en los nuevos. El memorizador, 31 de 40: nueve fallos, cada uno un punto nuevo que cayó más cerca de un punto visto del otro color.',
        pendiente: 'Elegí una respuesta para ver los aciertos en los nuevos.',
      },
      despues: [
        'El que sacó puntaje perfecto en la práctica rindió peor en el examen. La recta, que parecía peor, se quedó con la forma general de los datos y dejó pasar los cinco puntos raros.',
        'Lo que importa de un modelo es cómo responde a lo que no vio. Lo visto ya tiene su respuesta.',
      ],
    },
    nombre: {
      corto: 'Cómo se llama eso',
      pregunta: '¿Cómo se llama eso?',
      antes: [
        'Ahora podés mirar todo: a cualquiera de los dos, con los puntos vistos o con los nuevos, y con las cruces de lo que falla. La figura arranca en el memorizador, con los puntos nuevos.',
        'Buscá las islas del memorizador y fijate qué pasa con los puntos nuevos que caen cerca.',
      ],
      consigna: 'Mirá al memorizador con los puntos nuevos, y después a la recta.',
      despues: [
        'Cuando algo acierta mucho más en lo que vio que en lo que no vio, hay **sobreajuste**: se ajustó tanto a esos ejemplos que aprendió también su ruido. Lo contrario es **generalizar**: responder bien a casos nuevos.',
        'No es una regla que lo más simple gane siempre. Con otros datos, una recta puede quedarse corta y hacer falta algo con más vueltas. Lo que sí vale siempre es cómo se comprueba: con ejemplos apartados.',
      ],
    },
    desafio: {
      corto: 'Desafío: apartar y elegir',
      pregunta: '¿Con cuál te quedás?',
      antes: [
        'Último tramo, y es un desafío. Ahora decidís vos cuántos puntos apartar, y después con cuál de los dos quedarte. Arranca con el 10 % apartado: ocho puntos de ochenta.',
        'Con ocho puntos nuevos, los dos aciertan los ocho. Así no hay forma de elegir.',
      ],
      consigna: 'Mové «Apartados» hasta que se note una diferencia en los nuevos, y quedate con el que rinde mejor ahí.',
      desafioTexto: {
        estado: '{bien} de {total} pasos: apartar lo suficiente y elegir',
        pedirPista: 'Dame una pista',
        pista: 'Con pocos puntos apartados el examen es demasiado corto para distinguirlos. Apartá más y mirá la columna «nuevos», no la de «vistos».',
        logrado: 'Elegiste por lo que rinde en los puntos apartados y no por lo que acertó en la práctica.',
      },
      despues: [
        'Apartar tiene un costo: cada punto que se aparta es un punto menos para aprender. Con muy pocos apartados no se distingue nada; con demasiados, queda poco para practicar.',
        'En la app pasa lo mismo con los autos: un cerebro que aprendió en un circuito puede fallar en otro. Por eso se los prueba en pistas donde no practicaron.',
      ],
    },
  },
  figura: {
    titulo: 'Figura: puntos de dos colores, la zona donde cada forma de contestar responde cada color, y cuántos acierta cada una',
    quien: { recta: 'la recta', memorizador: 'el memorizador' },
    tabla: { vistos: 'vistos', nuevos: 'nuevos', de: '{n} de {total}' },
    apartados: 'apartados: {n} de {total}',
    practica: 'para aprender: {n}',
    cuenta: {
      vistos: '{n} puntos vistos',
      nuevos: '{n} puntos nuevos',
      deVistos: 'de {total} vistos',
      deNuevos: 'de {total} nuevos',
    },
    leyenda: { vistos: 'vistos', nuevos: 'nuevos', fallo: 'fallo' },
    controles: {
      mira: { rotulo: 'A quién mirar', recta: 'Recta', memorizador: 'Memorizador', ayuda: 'De quién se pinta la zona y se marcan los fallos.' },
      muestra: { rotulo: 'Qué puntos', vistos: 'Vistos', apartados: 'Nuevos', ayuda: 'Los puntos con que aprendieron, o los apartados.' },
      elegido: { rotulo: 'Con cuál te quedás', recta: 'Recta', memorizador: 'Memorizador', ayuda: 'Con cuál de los dos te quedás.' },
      apartar: { nombre: 'Apartados', ayuda: 'Qué parte de los puntos se guarda sin usarla para aprender.' },
    },
    restablecer: { rotulo: 'Restablecer', ayuda: 'Vuelve a los valores de este tramo.' },
    tocada: 'La figura sigue como la dejaste.',
    resumen: 'En los {v} vistos, la recta acierta {rv} y el memorizador, {mv}.',
    resumenNuevos: 'En los {v} vistos, la recta acierta {rv} y el memorizador, {mv}. En los {n} nuevos, {rn} y {mn}.',
  },
  profundizar: {
    titulo: 'Para profundizar',
    intro: 'Una forma simple de ponerle número al sobreajuste.',
    formulas: [
      { nombre: 'Brecha de generalización', formula: 'brecha = aciertos en lo visto − aciertos en lo apartado' },
    ],
    simbolos: [
      { simbolo: 'aciertos', que: 'la parte de los ejemplos que contesta bien, en porcentaje' },
      { simbolo: 'lo visto', que: 'los ejemplos que se usaron para aprender (en inglés, training set)' },
      { simbolo: 'lo apartado', que: 'los que se guardaron para medir (en inglés, held-out o test set)' },
    ],
    frases: [
      'En la figura, el memorizador tiene 100 % en lo visto y 77,5 % en lo apartado: una brecha de 22,5 puntos. La recta tiene 87,5 % y 95 %: ninguna brecha.',
      'Al memorizador de la figura se lo conoce como vecino más cercano (en inglés, nearest neighbor). Se usa de verdad, por lo general mirando varios vecinos y no uno solo, justamente para no seguir cada punto suelto.',
      'Una red neuronal con muchos pesos y pocos ejemplos puede hacer lo mismo que el memorizador: ajustarse a cada punto. El Laboratorio de la app lo avisa mirando dos curvas de error, la de la práctica y la de los apartados: cuando la primera baja y la segunda sube, hay sobreajuste.',
    ],
  },
  fuentes: {
    titulo: 'Fuentes',
    nota: 'Los puntos y su separación en vistos y apartados salen del mismo código que usa el Laboratorio de la app, con semilla: son siempre los mismos ochenta. La recta es la mejor de 24 candidatas; no se entrenó nada en esta página. El memorizador es una cuenta propia de este capítulo y no existe en la app.',
    lista: [
      { texto: 'Goodfellow, I., Bengio, Y. y Courville, A. (2016). Deep Learning. MIT Press. Capítulo 5: capacidad, sobreajuste y subajuste.', url: 'https://www.deeplearningbook.org', nota: '' },
      { texto: 'El código del proyecto: los datos y su separación (src/core/datasets.js) y la cuenta de este capítulo, con sus pruebas (src/teoria/capitulos/generalizar/cuenta.js).', url: '', nota: '' },
    ],
  },
};
