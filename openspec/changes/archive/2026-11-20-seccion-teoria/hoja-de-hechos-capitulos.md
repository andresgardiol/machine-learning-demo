# Hoja de hechos para los capítulos 0 y 2 a 9

20 de noviembre de 2026. Hechos comprobados **antes de escribir** (design.md D10): qué se puede afirmar
en cada capítulo, qué no, y con qué fuente. Después de escribir, cada capítulo se coteja contra esta
hoja y el resultado va a `revision-contenido-<id>.md`.

Cómo se hizo: lo que dice de la app sale de leer el código (`src/core/backprop.js`,
`src/core/evolution.js`, `src/core/network.js`). Lo demás es conocimiento de libro de texto; con
búsquedas confirmé los datos bibliográficos de las fuentes, no leí los textos completos.

## Reglas para todos

- Decir "neurona artificial" y "red neuronal artificial" la primera vez; después, "neurona" y "red".
- No decir que una red "piensa", "entiende" o "sabe": calcula, responde, acierta.
- No decir que el cerebro funciona así. La neurona artificial es un modelo inspirado en la biológica.
- Toda fórmula va en "Para profundizar", con cada símbolo nombrado.
- Si una figura simplifica (dos sensores, doce redes, una neurona), el texto lo dice una vez.

## 0. Programar o aprender

- **Se puede afirmar:** en un programa con reglas, una persona elige las condiciones y los números; al
  aprender de ejemplos, los números los ajusta un procedimiento a partir de los ejemplos. Cada caso nuevo
  que las reglas no cubren pide otra regla.
- **No afirmar:** que las reglas a mano "no sirven". Sirven cuando los casos son pocos y se conocen
  (Deep Blue). Tampoco que el barrido del tramo 5 es como aprende una red: es buscar probando.
- **De la app:** Reglas a mano usa reglas "si pasa esto, hacé aquello"; Entrenar ajusta redes por
  evolución.

## 2. Una recta no alcanza

- **Se puede afirmar:** una neurona con escalón separa con una recta; el XOR no se puede separar con
  una sola recta (no es linealmente separable), así que una neurona acierta como mucho 3 de 4. Con dos
  neuronas en una capa intermedia y una de salida, sí. Esa capa se llama oculta.
- **Matiz:** hay muchas redes distintas que resuelven el XOR; la del capítulo es una (un "o" y un "no
  las dos", juntados con un "y").
- **No afirmar:** que más capas resuelven "cualquier cosa" sin más. Lo correcto, para "Para
  profundizar": con una capa oculta y neuronas suficientes, una red puede aproximar cualquier función
  continua (Cybenko, 1989; Hornik, Stinchcombe y White, 1989). Eso dice que existe, no cómo encontrarla.

## 3. La cuenta hacia adelante

- **Se puede afirmar:** la red calcula capa por capa, de las entradas a las salidas; la salida de una
  neurona es entrada de las de la capa siguiente; dentro de una capa, el orden no importa. Se llama
  pasada hacia adelante (forward pass).
- **De la app:** el auto tiene 5 sensores y 4 salidas (adelante, izquierda, derecha, atrás); la salida
  usa siempre escalón; las capas ocultas pueden usar escalón, sigmoide, tanh o ReLU.
- **No afirmar:** que "la señal viaja" como en un cable con tiempo: es una cuenta, hecha en orden.

## 4. Medir el error

- **Se puede afirmar:** para aprender hace falta un número que diga qué tan mal estuvo la respuesta. El
  escalón solo da 0 o 1; con una salida suave (la sigmoide, entre 0 y 1) se puede medir por cuánto.
- **De la app:** la medida es la entropía cruzada: 0 si acierta del todo, y crece sin tope cuando la red
  está muy segura de algo equivocado (`outputLoss`). La sigmoide pasa de 0,5 justo cuando la suma pasa
  de 0, así que decide igual que el escalón.
- **Matiz:** hay otras medidas (el error cuadrático). Decirlo en "Para profundizar".
- **No afirmar:** que la salida suave es "la probabilidad de que sea cierto" a secas. Se puede decir
  "qué tan segura está" o "se lee como una probabilidad".

## 5. Corregir un poco cada vez

- **Se puede afirmar:** la pendiente del error respecto de un peso dice hacia dónde moverlo para que el
  error baje; el conjunto de las pendientes de todos los pesos es el gradiente; se mueve cada peso un
  poco en contra de su pendiente (descenso por gradiente). La tasa de aprendizaje dice cuánto. Muy
  chica: tarda. Muy grande: se pasa de largo, rebota o se aleja.
- **De la app:** corrección de un peso = −tasa × culpa × lo que traía la conexión (`weightChange`).
- **No afirmar:** que siempre llega al punto más bajo. Con una neurona y esta medida, el paisaje tiene
  un solo valle; en redes con capas puede frenarse en lugares que no son el mejor. Tampoco que la
  bolita "rueda" con inercia: da pasos.

## 6. Repartir la culpa

- **Se puede afirmar:** backpropagation calcula, para cada peso, cuánto contribuyó al error, yendo de
  la salida hacia atrás. Es la regla de la cadena del cálculo aplicada con orden.
- **De la app:** la culpa de una salida es su respuesta menos la correcta; la de una oculta es la suma
  de (culpa de la siguiente × peso que las une), por la pendiente de su activación (`backward`). Una
  pasada por todos los ejemplos es una época.
- **Matiz obligatorio:** el escalón no tiene pendiente, así que con escalón en las ocultas no se puede
  aprender así (la app lo impide: `assertLearnable`). Por eso este capítulo usa una activación suave.
- **No afirmar:** que backpropagation "es" el aprendizaje. Calcula las pendientes; el que corrige es
  el descenso por gradiente. Ni que lo inventaron Rumelhart, Hinton y Williams (ver la historia).

## 7. Aprender por evolución

- **Se puede afirmar:** se puede buscar buenos pesos sin calcular pendientes: se prueban muchas redes,
  se puntúa cada una, las mejores dejan copias con pequeños cambios al azar y se repite. Sirve cuando
  solo hay un puntaje al final y no una respuesta correcta por paso (manejar).
- **De la app:** Entrenar hace esto (neuroevolución). Mutar un valor es acercarlo a un valor al azar
  entre −1 y 1 en una proporción (la fuerza), con cierta probabilidad por valor (`mutate`). La élite
  pasa sin cambios. No es aprendizaje por refuerzo paso a paso.
- **Matiz:** en redes grandes, lo habitual es el descenso por gradiente; la evolución también se usó
  con redes profundas (Such y otros, 2017; Salimans y otros, 2017).
- **No afirmar:** que "así evolucionaron los seres vivos" ni que es mejor o peor en general.

## 8. Generalizar o memorizar

- **Se puede afirmar:** acertar los ejemplos vistos no prueba nada sobre los nuevos. Se apartan
  ejemplos que no se usan para aprender y se mide con ellos. Cuando acierta mucho más en lo visto que en
  lo apartado, hay sobreajuste: aprendió también el ruido de esos ejemplos.
- **De la app:** el Laboratorio aparta ejemplos y avisa del sobreajuste mirando las dos curvas; Competir
  hace correr a los cerebros en pistas que no vieron.
- **Matiz obligatorio:** el memorizador de la figura responde como el ejemplo más parecido que vio. No
  es una red; es la forma más literal de memorizar. Decirlo.
- **No afirmar:** que un modelo más simple siempre generaliza mejor. Depende de los datos.

## 9. Qué quedó adentro

- **Se puede afirmar:** dentro de una red entrenada no hay reglas escritas ni ejemplos guardados: hay
  pesos. Se puede estudiar qué enciende a cada neurona y qué deja de funcionar al apagar una parte
  (ablación). En una red de tres neuronas se entiende todo; en una de millones, no, y es un campo de
  investigación abierto (interpretabilidad).
- **De la app:** Inspeccionar deja apagar neuronas y conexiones, cambiar pesos y ver qué detecta cada
  neurona.
- **No afirmar:** que "nadie sabe cómo funcionan" (se sabe la cuenta exacta; lo difícil es explicar por
  qué esos números resuelven la tarea), ni que una neurona "representa un concepto" como regla general.

## Fuentes

- Goodfellow, I., Bengio, Y. y Courville, A. (2016). Deep Learning. MIT Press. Capítulos 5 (capacidad,
  sobreajuste), 6 (redes hacia adelante, XOR, backpropagation) y 8 (optimización).
  https://www.deeplearningbook.org
- Rumelhart, D., Hinton, G. y Williams, R. (1986). Learning representations by back-propagating errors.
  Nature 323, 533–536.
- Minsky, M. y Papert, S. (1969). Perceptrons. MIT Press.
- Cybenko, G. (1989). Approximation by superpositions of a sigmoidal function. Mathematics of Control,
  Signals, and Systems 2, 303–314.
- Hornik, K., Stinchcombe, M. y White, H. (1989). Multilayer feedforward networks are universal
  approximators. Neural Networks 2(5), 359–366.
- Such, F. P. y otros (2017). Deep Neuroevolution. https://arxiv.org/abs/1712.06567
- Salimans, T. y otros (2017). Evolution Strategies as a Scalable Alternative to Reinforcement
  Learning. (Citado por Such y otros; no lo abrí.)
