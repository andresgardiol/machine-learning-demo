# Diseño

## Contexto

Lo que hay hoy, leído en el código (no medido):

- `src/tabs/lab/session.js` maneja una sola sesión con `kind` `'points'` o
  `'driving'`; cambiar de clase arma los datos de nuevo y conserva la forma de
  la red. Los valores por defecto están en `src/tabs/lab/defaults.js`
  (`NETWORK_DEFAULTS`: una capa de 4, tanh, tasa 0,1; `NEW_LAYER_NEURONS` 4).
- La pestaña arranca reproduciendo de a épocas (`DEFAULT_EPOCH_RATE`).
- `src/core/datasets.js` genera puntos en cuatro formas, con coordenadas
  entre −1 y 1. Ya existe una forma `'xor'` de puntos (los cuadrantes
  cruzados); no es la compuerta.
- `src/render/plane-view.js` fija el plano en [−1, 1] (`planeToPx`,
  `pxToPlane`, `clamp1`).
- `src/render/network-inspector.js` tiene **una** pastilla HTML (`div`
  `role="slider"` sobre el lienzo) que aparece sobre la conexión elegida
  cuando el estado trae `pill: {min, max}`. Arrastre vertical, flechas,
  `gesture` para que un arrastre sea un solo cambio a mano.
- `src/core/backprop.js` cuenta acierto con `salida > 0.5` contra
  `objetivo >= 0.5`: una salida de 0,5 exacta con objetivo 0 cuenta como
  acierto. Con pesos en cero, AND daría 3 de 4 sin haber hecho nada.
- El Laboratorio ya tiene el punto de prueba (cambio archivado
  `punto-de-prueba`), la tarjeta de neurona con deslizadores, deshacer y
  restablecer.

## Objetivos / No objetivos

**Objetivos**
- Un recorrido AND → OR → XOR → capa oculta → backpropagation que funcione con
  lo que el Laboratorio ya sabe hacer, sin otro modo de reproducción.
- Perillas sobre el diagrama que reusen la pastilla y su contrato de cambios.

**No objetivos**
- Un tutorial con pasos bloqueantes: las misiones siguen sin bloquear.
- Perillas en Inspeccionar (la vista las ofrece; Inspeccionar no las pide).

## Decisiones

### D1. Compuertas como tercera clase de datos, no como modo aparte
`kind: 'gates'` en la sesión, con `gates: { gate: 'and' | 'or' | 'xor' }`.
Reusa la red, la reproducción, el paso a paso, la curva, la tarjeta y el
punto de prueba. *Alternativa*: una pestaña o un panel "tutorial" propio;
duplicaría la reproducción y se alejaría de "consistencia".

### D2. Entradas 0 y 1, plano de −0,5 a 1,5
Las tablas de verdad se escriben con 0 y 1; poner −1 y 1 obligaría a explicar
una convención que no aporta. El plano recibe un rango
(`planeGeometry(w, h, range)`, por defecto [−1, 1]); `planeToPx`, `pxToPlane`,
la grilla del fondo (`planeGrid`) y el tope del punto de prueba lo usan. Con
compuertas el rango es [−0,5; 1,5] y los ejes llevan marcas en 0 y 1.
*Alternativa*: entradas −1/1 sin tocar el plano; descartada por claridad.

### D3. Estado por clase de datos
La sesión pasa a guardar un registro por clase: `{ data, hidden, activation,
rate, net, history, changes, cursor, probe }`. Cambiar de clase guarda el
registro vigente y trae el de la otra (o lo crea con los valores por defecto
de esa clase). Esto evita que la red 2 → 1 de las compuertas llegue a los
puntos en círculo, donde no aprende nada, y deja volver a las compuertas sin
perder lo hecho. *Alternativa*: conservar la forma de la red entre clases y
avisar; descartada: el primer contacto con los puntos sería una red que no
aprende.

Valores por defecto por clase:

| | compuertas | puntos | tu manejo |
|---|---|---|---|
| capas ocultas | ninguna | [4] | [4] |
| capa nueva | 2 neuronas | 4 | 4 |
| pesos al empezar | ceros sin capa oculta; con capa oculta, el arranque fijo de D7 ("Reiniciar pesos" sigue la serie) | al azar | al azar |
| tasa | 0,3 (D7, medida) | 0,1 | 0,1 |
| paso / ritmo | neurona, 1 por segundo | época, 10 por segundo | época |

Pesos en cero solo sin capas ocultas: con una capa oculta, pesos iguales dejan
a las neuronas ocultas idénticas y backpropagation no las separa nunca
(simetría).

### D4. Nada aprende sin pedirlo
La reproducción arranca en pausa al abrir la pestaña. Cambiar de clase, de
datos o de red conserva el estado de reproducción (reproduciendo o en pausa).
Esto toca los escenarios de las specs que decían "el aprendizaje sigue
corriendo": siguen valiendo cuando ya estaba corriendo.

### D5. Varias pastillas: un grupo de elementos reusados
El inspector pasa de una pastilla a un grupo (`pills`) de elementos HTML que
se crean a demanda y se reusan entre cuadros. El estado recibe
`knobs: { weights: {min, max}, biases: {min, max}, inputs: null | {kind:
'toggle', values: [0, 1]} | {kind: 'range', min, max} }`. Regla de cuáles se
ven: si la red tiene hasta 16 conexiones (`KNOBS_ALL_MAX = 16`), todas; si
no, las que entran a la neurona elegida y su sesgo. 16 cubre 2 → 4 → 1 (12),
2 → 2 → 2 → 1 (10) y 2 → 3 → 2 → 1 (14); no cubre 2 → 4 → 4 → 1 (28).

Ubicación: la pastilla de un peso va sobre su línea al 30 % desde la neurona
de destino (así las que llegan a una misma neurona se abren en abanico y no se
pisan); la del sesgo, debajo de su neurona; el control de una entrada, a la
izquierda de la neurona de entrada, lejos de las líneas. Si dos pastillas se
pisan, la de menor índice se corre a lo largo de su línea hasta 20 %. Las
pastillas siguen al zoom y al desplazamiento como hoy la única.

El contrato de cambios no cambia: cada pastilla llama a `onPill.change(v,
{gesture})` con su destino (`{layer, neuron, input}` o `{layer, neuron,
bias: true}`); el Laboratorio ya sabe aplicarlo como cambio a mano.

Las entradas: con compuertas, interruptor 0/1 (`role="switch"`,
`aria-checked`); con puntos, pastilla −1..1 que llama a `session.setProbe`.
No son cambios a mano (son lo que la red recibe, no la red).

*Alternativa*: un editor de pesos en un panel lateral o una tabla; ya existe
la tarjeta. Lo pedido es tocar sobre la red.

### D6. Tabla de verdad en el tablero
Componente nuevo `src/tabs/lab/truth-table.js`: una `table` con encabezados,
cuatro filas, columna de la red (`sí 97 %`, `no 88 %`, `no se decide`) y una
marca ✓/✗ con texto para lector de pantalla. Con compuertas reemplaza al
resumen de datos en el tablero. Una fila elegida mueve el punto de prueba al
caso (`setProbe`), que a su vez mueve los interruptores.

Acierto: en `backprop.js` la comparación pasa a contar 0,5 exacto como no
acierto (`out > 0.5` contra objetivo 1, `out < 0.5` contra objetivo 0). Solo
cambia algo con salidas exactamente 0,5, que en la práctica solo pasan con
pesos en cero; las curvas y la tabla dicen lo mismo.

### D7. Tasa por defecto y arranque fijo de las compuertas, elegidos midiendo
Con 4 ejemplos por época, una tasa de 0,1 hace lento XOR. El plan era elegir
la menor tasa entre {0,3; 0,5; 1} con la que XOR con 2 → 2 → 1 tanh llegara a
4 de 4 antes de un minuto (600 épocas a 10 por segundo) en las primeras 5
redes de la serie. **Medido (tarea 5.2): ninguna cumple.** Con 0,3 llegan 3 de
5 (6 de las primeras 10), con 0,5 2 de 5 y con 1 ninguna; las demás quedan
trabadas en un mínimo local con cualquier tasa: es la capa de 2, no la tasa.

Decisión del dueño (consulta 5.2): "2 neuronas, arranque que anda".

- Tasa por defecto de las compuertas: **0,3**.
- Con compuertas, una red de forma nueva con capas ocultas (pasar de cero a
  una capa, "Agregar una capa oculta de 2", cambiar neuronas o activación,
  "Red de siempre" con capas) arranca de **pesos fijos**: la semilla 1 de la
  serie (`GATES_HIDDEN_SEED`), con la que XOR 2 → 2 → 1 tanh a 0,3 llega a 4 de
  4 en 68 épocas (6,8 s).
- "Reiniciar pesos" sigue la serie desde ahí, así que puede dar una red que se
  traba. Eso se muestra (D8): es un concepto real.
- La solución preparada de XOR sigue con una capa de 2.

### D8. XOR: cuándo explicar
Contadores en la sesión de compuertas: cambios a mano y épocas desde que se
eligió XOR sin capas ocultas. Al llegar a 5 cambios o 50 épocas sin 4 de 4, la
guía cambia de "intentalo" a la explicación con el botón "Agregar una capa
oculta de 2", que equivale a elegir una capa oculta de 2 neuronas en el panel.
Mostrar antes que explicar: la persona prueba primero.

**Trabada en un mínimo local** (agregado con la decisión de D7): con XOR y capas
ocultas, si pasaron 50 épocas o más, la red no acierta los cuatro casos y el
error bajó menos de 0,01 en las últimas 50, la guía lo nombra en palabras
llanas (la red quedó en un pozo del que corrigiendo de a poco no sale) y
sugiere "Reiniciar pesos". Medido en las primeras 20 redes de la serie a tasa
0,3: marca las 9 que no llegan (entre las épocas 50 y 137) y ninguna de las 11
que llegan.

### D9. Soluciones preparadas
`src/tabs/lab/gate-solutions.js`, puro:

- Sin capas ocultas: AND `w = (1, 1), b = −1,5`; OR `w = (1, 1), b = −0,5`.
- XOR con una capa de 2: oculta 1 ≈ OR `(2, 2), −1`; oculta 2 ≈ AND
  `(2, 2), −3`; salida, con tanh, `(1,5; −1,5), −1` (con pesos 3 el sesgo de
  AND tenía que ser −4,5, fuera del rango; corregido en la tarea 1.3). Con
  sigmoide y ReLU se ajusta la salida; cada solución se prueba con las tres activaciones y queda en el
  rango de las pastillas (−3 a 3).

Se aplica como un solo cambio a mano (un `gesture`), así "Deshacer" la saca
entera.

### D10. Misiones
`src/tabs/lab/missions.js` pasa a tener dos juegos y elige por clase. "A mano"
se decide con un indicador por compuerta que se apaga cuando el aprendizaje
da cualquier paso con esa compuerta elegida y se vuelve a encender al
"Reiniciar pesos" o "Red de siempre".

### D11. Respuesta en vivo al mover una perilla
Hoy el fondo del plano se recalcula como mucho a `PLANE_FPS` = 15 por segundo
(`plane-view.js` y el caché de mapas en `lab/index.js`), y la curva suma un
punto por época. Para ver si un cambio va en la dirección correcta:

- Mientras dura un gesto de perilla (de `pointerdown` a `pointerup`, o una
  tecla), el plano se recalcula en cada cuadro, sin el tope de 15. La grilla
  es de 50 × 50 = 2500 pasadas de la red: con la red de las compuertas es
  trivial; con 2 → 8 → 8 → 8 → 1 hay que medirlo (ver riesgos).
- "Error de ahora": `evaluate(net, ejemplos de práctica)` en cada cambio, con
  el valor al empezar el gesto guardado como "antes". Se muestra en la línea
  de la curva: `error 0,69 → 0,41 ↓ baja`. Con tu manejo los ejemplos son
  miles: se evalúa sobre una muestra fija de hasta 500 (la misma siempre),
  y el texto lo dice.
- La curva no se toca: solo suma puntos al terminar una época.

*Alternativa*: un gráfico aparte de "error mientras movés"; ocupa lugar que no
hay y repite la curva. La flecha y la palabra alcanzan para saber hacia dónde
va.

## Riesgos / Compromisos

- [Recalcular el plano cada cuadro con una red grande baja la fluidez] →
  medir con 2 → 8 → 8 → 8 → 1; si la mediana pasa de 16,7 ms, durante el
  gesto bajar la grilla a 25 × 25 y volver a 50 × 50 al soltar.

- [El tablero no entra a 1440×900 con plano, tabla y curva] → medir antes y
  después; si no entra, la tabla va al costado del plano o el plano se achica.
  Parar y consultar si hay que sacar algo.
- [Las pastillas tapan la red en formas de 14–16 conexiones] → escenario "No se
  tapan" medido en cada forma posible de hasta 16 conexiones; si alguna falla,
  bajar `KNOBS_ALL_MAX`.
- [Con tanh, XOR 2 → 2 → 1 se queda en un mínimo local en 4 de cada 10 redes
  de la serie (medido en 5.2)] → la red que da "Agregar una capa oculta de 2"
  arranca de pesos fijos que llegan (D7); si después "Reiniciar pesos" da una
  que se traba, la guía nombra el mínimo local y sugiere reiniciar otra vez
  (D8). Se acepta: ver una red trabada es parte de lo que enseña.
- [Cambiar el estado por defecto rompe pruebas y escenarios existentes del
  Laboratorio que asumen puntos en círculo aprendiendo] → las pruebas que lo
  asumen eligen puntos y reproducen explícitamente.
- [El cambio de la regla de acierto mueve números de pruebas viejas] → solo
  afecta salidas de 0,5 exacto; se corre la suite y se revisa cada diferencia.
- [Choque con `sin-destellos-en-la-red`, que también toca
  `network-inspector.js` y `lab/index.js`] → se implementan uno después del
  otro.

## Plan de migración

No hay datos guardados que migrar: el estado del Laboratorio vive mientras la
app está abierta. Volver atrás es revertir el cambio.
