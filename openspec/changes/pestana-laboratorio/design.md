# Design

## Context

Lo que ya existe y se reutiliza:

- La red (`src/core/network.js`): capas con `weights` y `biases`; activaciones
  de las capas ocultas escalón, sigmoide, tanh y ReLU; la salida, escalón
  sobre el total (sí cuando es mayor que cero).
- De Inspeccionar: `traceNetwork` (la cuenta desglosada), `createPassCursor`,
  la vista de la red (`src/render/network-inspector.js`: diagrama, tabla de
  pesos, capas resumidas, filtro de conexiones, acercamiento, paso animado),
  la barra de reproducción (`src/tabs/inspect/playback.js`), la operación en
  curso (`describe.js`), la escena chica y los anchos propios de la pestaña.
- El gráfico de Entrenar (`src/ui/chart.js`), la barra de escenario con
  grupos propios, la biblioteca y los cerebros de ejemplo.
- `validateBrain` no rechaza campos que no conoce.

Respuestas del dueño que fijan el alcance (14 de noviembre de 2026): la red
aprende problemas de juguete y también a imitar un manejo, en una sola spec;
backpropagation se ve paso a paso y animado; hay sobreajuste a la vista, se
graba el propio manejo, se arma la red y lo aprendido se guarda como cerebro.

El dueño señaló que la vista de la red de Inspeccionar le resulta tosca
(anotado en `PENDIENTES.md`). El Laboratorio la usa como está; mejorarla es
otro cambio y beneficia a las dos pestañas.

## Goals / Non-Goals

**Goals**

- Que se vea aprender en los primeros segundos, sin tocar nada.
- Que una corrección se pueda seguir entera, con los números reales.
- Que el sobreajuste se pueda provocar y reconocer.
- Que lo aprendido del manejo sea un cerebro como los demás.
- No cambiar las pestañas 1 a 5.

**Non-Goals**

- Lo listado en "Fuera de alcance" de la propuesta.

## Decisions

### D1. Organización de la pantalla

La misma de Inspeccionar, con los mismos anchos (la red toma lo que sobra,
con 600 px de mínimo; tablero y panel, 360 px).

```
┌ Datos: [Puntos|Tu manejo]  forma ◐◑◒◓ · ruido · cantidad · restablecer ───────┐
├────────────────────────────────────────┬────────────────┬─────────────────────┤
│ Red: 2 → 4 → 1                         │ plano de       │ Guía                │
│ [Diagrama|Tabla] Conexiones  [Resumir] │ puntos, con el │ ─────────────────── │
│                                   zoom │ fondo pintado  │ Red                 │
│ ──────────────────────────────────     │ (o la escena)  │  capas · neuronas   │
│ Entradas(2)▾  Oculta 1(4)▾  Salida(1)▾ │ ────────────── │  activación         │
│     ○             ○                    │ ejemplo en     │ Aprendizaje         │
│     ○   L A  R E D ○            ○      │ curso          │  tasa · apartados   │
│                   ○                    │ ────────────── │  [Reiniciar pesos]  │
│ ──────────────────────────────────     │ curvas de      │  [Restablecer red]  │
│ culpa: 0,82 × 0,70 × 0,36 = 0,21       │ error          │  (Guardar cerebro)  │
│ ▶/⏸ Paso  de a: Época·Ej·Fase·Capa·Neu │ época · aciertos│ ─────────────────── │
│ ritmo ──●──  Época 12 · ej. 37 · vuelta│                │ Misiones (3 líneas) │
└────────────────────────────────────────┴────────────────┴─────────────────────┘
```

Dónde va cada cosa y por qué:

| Qué | Dónde | Por qué |
|---|---|---|
| Qué datos se usan | Barra de arriba | Es el "escenario" de esta pestaña: de dónde sale lo que la red ve. En las otras pestañas la barra ya cumple ese papel |
| Reproducción y operación en curso | Pegadas a la red | Es lo que más se usa y lo que mueve a la red (proximidad; igual que en Inspeccionar) |
| Datos, ejemplo en curso y curvas | Tablero | Son el resultado: se miran, no se tocan |
| Forma de la red y del aprendizaje | Panel | Se arman de vez en cuando; son la preparación del experimento |
| Guardar como cerebro | Panel, solo con tu manejo | Lo que no sirve no se muestra |

Un solo estado de marcha, reproduciendo o en pausa, más uno que se ve
siempre que está activo: grabando (D8). No hay modos ocultos.

### D2. Backpropagation en el núcleo

`src/core/backprop.js`, sin DOM, funciones puras sobre la red de siempre:

```js
forwardSoft(net, inputs)            → { trace, outputs }   // sigmoide en la salida
exampleError(outputs, targets)      → { errors, loss }     // errors = salida − correcta
backward(net, forward, targets)     → { deltas, terms }    // culpa de cada neurona
corrections(net, forward, deltas, rate) → { weights, biases }  // por peso: antes, cambio, después
applyCorrections(net, corrections)  → red corregida (la original no cambia)
```

- **Salida:** sigmoide sobre el mismo total que usa `computeNetwork`. Como
  la sigmoide pasa de 0,5 justo cuando el total pasa de 0, una red aprendida
  acá decide igual al manejar, sin convertir nada.
- **Medida del error:** entropía cruzada, sumada sobre las salidas. Con
  sigmoide, la culpa de una salida es exactamente la respuesta menos la
  correcta: la cuenta que se muestra es corta y es la verdadera.
- **Aprendizaje:** un ejemplo por vez (descenso por gradiente estocástico),
  en orden mezclado con semilla en cada época. Sin lotes ni momento: un
  concepto por vez.
- **Ocultas:** tanh, sigmoide o ReLU. El escalón se rechaza.
- **Pesos iniciales:** los de `createNetwork`, al azar con semilla.

Prueba clave: la corrección calculada se compara, peso por peso, con la
medida por diferencias finitas. Si esa prueba pasa, lo que se muestra es
backpropagation de verdad.

Nombres a la vista: "error" (respuesta menos correcta), "culpa" (lo que en los
libros es delta, el error que le toca a cada neurona), "pendiente" (la
derivada de la activación), "tasa de aprendizaje", "época". Los nombres
técnicos van en los tooltips.

### D3. El recorrido paso a paso

`src/core/learning-cursor.js`, sin DOM. Fases de un ejemplo: `forward`,
`error`, `backward`, `update`. La ida usa el cursor de Inspeccionar. La
vuelta y la corrección van de la última capa a la primera, neurona por
neurona.

Tamaños del paso: `epoch`, `example`, `phase`, `layer`, `neuron`.

Como en Inspeccionar, el cursor no calcula: dice hasta dónde se muestra. La
corrección se aplica a la red recién cuando el ejemplo termina; hasta
entonces lo que se ve son los valores ya calculados de ese ejemplo. Así,
hacer una época paso a paso deja la red idéntica a hacerla de corrido.

### D4. Datos

`src/core/datasets.js`, sin DOM:

- `pointsDataset({ shape, count, noise, seed })`: cuatro formas (`blobs`,
  `circle`, `xor`, `spiral`). Entradas x e y en [−1, 1]; respuesta, 0 o 1.
- `drivingExamples({ controller, sensors, track, lanes, density,
  irregularity, maxSpeed, seconds, seed })`: hace manejar al controlador y
  devuelve un ejemplo por paso. Si choca, sigue con otro tráfico.
- `recorder()`: junta ejemplos de un mundo en marcha, para grabar.
- `splitDataset(data, { holdout, seed })`: en puntos, mezcla y aparta
  cuidando los dos colores; en manejo, aparta tramos seguidos de 2 s.
- `summary(data)`.

Por defecto: puntos en círculo, 200, ruido 10 %, 30 % apartados.

Con tu manejo, la red tiene una entrada por sensor del que maneja más la
velocidad, y cuatro salidas. Un ejemplo cuenta como acierto si las cuatro
salidas quedan del lado correcto.

### D5. La barra elige los datos

La barra de escenario suma un grupo propio, "Datos", primero de todos:
"Puntos | Tu manejo".

- Con puntos: forma (cuatro opciones con miniatura y nombre, como las
  pistas), ruido (0 a 50 %) y cantidad (20 a 500). Sin pista, tráfico,
  sensores ni velocidad.
- Con tu manejo: pista, tráfico y velocidad, los de siempre. Sin sensores.
- "Restablecer" devuelve los datos de la clase elegida a sus valores por
  defecto.

Cambiar cualquier cosa de la barra genera los datos de nuevo y empieza el
aprendizaje desde cero, con la misma forma de red (al soltar, en los
deslizadores).

### D6. La red y el aprendizaje, en el panel

Sin vistas ni secciones plegables, en orden:

1. Guía (con la guía activa).
2. **Red:** capas ocultas (0, 1, 2 o 3, opciones a la vista), neuronas de
   cada capa (un deslizador por capa que exista, de 1 a 8) y activación
   (tanh | sigmoide | ReLU).
3. **Aprendizaje:** tasa (deslizador en escala logarítmica, de 0,001 a 3) y
   parte apartada (10 a 50 %).
4. Acciones: "Reiniciar pesos", "Restablecer la red" y, con tu manejo,
   "Guardar como cerebro".
5. Con tu manejo: de quién son los ejemplos ("Maestro: nombre [Cambiar]" o
   "Vos"), "Grabar" y "Borrar lo grabado" (D8).
6. Misiones (con la guía activa), tres renglones.

Qué empieza de nuevo: la forma de la red, la activación, los datos y la
parte apartada arman todo de cero. La tasa se aplica en marcha.

Valores por defecto: una capa de 4 con tanh y tasa 0,1 (medido en la tarea
2.1: el círculo llega al 90 % de los apartados en 5 a 46 épocas en las cinco
semillas).

### D7. Tablero

- **Datos.** Con puntos, el plano (`src/render/plane-view.js`, nuevo): el
  fondo es una grilla de 50 × 50 que se pinta con la respuesta de la red
  (color de la clase e intensidad según la seguridad), actualizada como
  mucho 15 veces por segundo; encima, los puntos, círculos y cuadrados según
  la clase, llenos los de práctica y huecos los apartados. Con tu manejo, la
  escena chica (D8) y el resumen de los ejemplos.
- **Ejemplo en curso** (solo cuando el paso es de un ejemplo o menos). Con
  puntos: coordenadas, color correcto, respuesta. Con tu manejo: el abanico
  de rayos dibujado con sus lecturas, y dos filas de acciones, "el ejemplo" y
  "la red", con las que no coinciden marcadas.
- **Curvas.** El gráfico de Entrenar con dos series (práctica en trazo
  continuo, apartados en punteado), y al lado la época y los aciertos de
  cada grupo.

### D8. Tu manejo: maestro, grabar, probar y guardar

- **Maestro por defecto:** el ejemplo `street-new`, 60 s en la pista y el
  tráfico de la barra. Se genera al vuelo, en menos de un segundo, con
  semilla. "Cambiar" abre el selector de cerebros.
- **La escena muestra siempre a la red manejando** con los pesos de ese
  momento; vuelve a empezar sola cuando choca. Es la respuesta inmediata a
  "¿aprendió?": no hay un botón de probar.
- **Grabar** es el único otro estado, y se ve: la escena pasa al auto de la
  persona, con el aviso "Grabando: manejá con las flechas" y el botón
  "Terminar". El aprendizaje queda en pausa. Al terminar, los ejemplos pasan
  a ser los grabados y el aprendizaje empieza de cero. Con menos de 10 s
  grabados, un aviso lo dice sin impedir nada.
- Los sensores al grabar son los por defecto (5, 3 largos, 90°).
- **Guardar como cerebro:** `createBrain` con la red, los sensores de los
  ejemplos y `training` con cero generaciones y sin escenarios, más un
  bloque nuevo y opcional:

  ```js
  imitation: { examples, epochs, teacher, track, lanes, density, irregularity }
  ```

  `teacher` es el nombre del maestro o "persona". Las aplicaciones que no lo
  conocen lo ignoran. Nombre propuesto: "Imitación 1", "Imitación 2", …
- `src/tabs/compete/marks.js` y los textos de "dónde entrenó" leen también
  ese bloque: practicó en la pista de los ejemplos.

### D9. Sobreajuste

Aviso cuando, después de la época 20, el error de los apartados lleva 10
épocas seguidas más de un 10 % **y más de 0,1** por encima de su mínimo, y el
de práctica está por debajo del que tenía en ese mínimo. Lógica pura
(`overfitting(history)` y `trackWarning`, en `src/core/overfitting.js`), con
pruebas. El margen absoluto salió de la consulta 2.3: sin él, con los valores
por defecto el error de los apartados ronda 0,05 y su vaivén normal disparaba
el aviso (5 de 5 semillas, épocas 51 a 135). Medido con el margen: por defecto
0 de 5 semillas en 1000 épocas; con la receta, 5 de 5 entre las épocas 60 y 275.

El aviso no es fijo: sigue a la vista mientras el error de los apartados esté
por encima de su mínimo (aunque baje un poco); si marca un mínimo nuevo, el
aviso se retira y la marca de la mejor época pasa a esa época, y puede volver
a aparecer contra el mínimo nuevo. Con pocos apartados la curva es ruidosa y
la red puede volver a mejorar después de un aviso: decir "está memorizando"
con la red marcando mínimos nuevos sería falso. Empezar de nuevo lo quita. El
lector de pantalla lo anuncia una vez por aparición. La misión 2 se cumple la
primera vez que aparece.

El gráfico marca la época del mínimo ("mejor momento") y el aviso dice: "La
red está memorizando: mejora en lo que practica y empeora en lo que nunca
vio."

Receta que lo muestra (misión 2), medida: 40 puntos, ruido 30 %, tres capas
de 8, tasa 0,1. En 600 épocas el aviso aparece de 1 a 3 veces por semilla.

### D10. La vista de la red en el Laboratorio

La de Inspeccionar, con sus mismas opciones de vista, capas, filtro y
acercamiento, sin lo de apagar ni cambiar pesos a mano. Suma:

- **Culpa:** un anillo alrededor de cada neurona, con el grosor según el
  tamaño y el trazo (continuo o punteado) según el signo. La actividad sigue
  siendo el relleno.
- **Corrección:** cada conexión muestra una flecha chica hacia arriba o
  hacia abajo mientras cambia, y queda con su grosor nuevo.
- **Animación de la vuelta:** marcas que viajan en sentido contrario, con
  forma de rombo para no confundirse con las de la ida.

Reglas de animación: las de Inspeccionar (300 a 450 ms por paso a mano, el
80 % del intervalo al reproducir, se completa al instante si se pide otro
paso, nada viaja con menos movimiento). De corrido no hay animaciones de
paso: los pesos cambian y nada más.

### D11. Reproducción

La barra de Inspeccionar, con otros tamaños: Época | Ejemplo | Fase | Capa |
Neurona. Por defecto reproduce de a épocas, a 10 por segundo. El ritmo de
épocas va de 1 a 60 por segundo; el de ejemplos, de 1 a 200; el de fases,
capas y neuronas, de 1 a 20 pasos por segundo.

La operación en curso (`describeLearningStep`, pura, en los dos idiomas):

- Error: "0,82 − 0 = 0,82"
- Culpa: "0,82 × 0,70 = 0,57 · pendiente 0,36 · culpa 0,21"
- Corrección: "0,62 − 0,3 × 0,21 × 0,48 = 0,59"

Con el mismo renglón de "números redondeados a dos decimales".

### D12. Atajos, estado y misiones

- Atajos: espacio, N, R (reiniciar pesos) y V, los de siempre. Grabando, las
  flechas manejan y espacio no hace nada.
- Estado conservado en el módulo, como las otras pestañas. Salir pausa.
- Misiones (`src/tabs/lab/missions.js`, sin DOM): seguir una corrección
  entera; hacer que la red memorice; guardar un cerebro que aprendió
  imitando.

### D13. Textos

Voseo, frases cortas. Guía: "Esta red aprende de ejemplos. El fondo muestra lo
que contesta en cada lugar. Pausá y avanzá de a una fase para ver cómo se
corrige."

| Concepto | es | en |
|---|---|---|
| Datos | Puntos / Tu manejo | Points / Your driving |
| Formas | Dos grupos, Círculo, Cruzado, Espiral | Two groups, Circle, Crossed, Spiral |
| Tamaños del paso | Época, Ejemplo, Fase, Capa, Neurona | Epoch, Example, Phase, Layer, Neuron |
| Fases | Ida, Error, Vuelta, Corrección | Forward, Error, Backward, Update |
| Grupos | Práctica / Apartados | Practice / Held out |
| Acciones | Reiniciar pesos, Guardar como cerebro, Grabar, Terminar | Reset weights, Save as brain, Record, Finish |

### D14. Tabla de datos

Pedido del dueño después de probar la pestaña: en su demo original había una
tabla con los datos y, para la red del momento, qué filas se cumplían. "No
sería algo prioritario de mostrar."

- **Dónde:** tercera vista de la zona de la red, "Diagrama | Tabla de pesos |
  Tabla de datos". Razones: no ocupa lugar si no se la pide; es la zona más
  ancha (600 px o más), y con tu manejo hay una columna por sensor; y deja a
  la vista, al lado, el plano y las curvas, que son la otra mitad de la
  explicación. Descartado: el tablero (360 px no alcanzan para el manejo) y
  una sección nueva del panel (ya está lleno).
- **Lo que no sirve en esa vista se oculta:** filtro de conexiones, acercar
  y "Resumir todas". Los cambios a mano (D15) siguen a la vista: valen para
  la red en cualquier vista.
- **Columnas con puntos:** n.º, x, y, correcto (marca de la clase y nombre),
  la red dice (marca y número de 0 a 1), resultado (✓ o ✗), grupo.
- **Columnas con tu manejo:** n.º, una por entrada (dos decimales), maestro y
  red (las flechas de los controles apretados, como en "Ejemplo en curso"),
  resultado, grupo. Si no entran, las entradas se desplazan con el n.º y el
  resultado fijos.
- **Arriba:** el resumen ("Acierta 187 de 200 · práctica 136 de 140 ·
  apartados 51 de 60") y dos filtros de segmentos: "Todos | Los que falla" y
  "Todos | Práctica | Apartados".
- **Núcleo:** `evaluatedRows(net, practice, heldOut, off)` y
  `filterRows(rows, { failing, group })`, sin DOM, en `src/core/datasets.js`
  o un módulo vecino. Acertar usa `isCorrect`, la misma función de las
  curvas.
- **Dibujo:** una tabla de verdad (`<table>`, encabezados con `scope`), con
  solo las filas a la vista en el DOM (filas de alto fijo y un relleno arriba
  y abajo) y `aria-rowcount` / `aria-rowindex`.
- **Cuándo se recalcula:** con la vista abierta, como mucho 5 veces por
  segundo mientras corre; en el momento en pausa, tras un paso que corrige o
  un cambio a mano. Con la vista cerrada, nunca.
- **Rendimiento:** evaluar 3600 ejemplos es una pasada de ida por ejemplo
  con una red chica; las curvas ya lo hacen una vez por época. [Sin medir]
  que entre en el cuadro junto con el aprendizaje a 60 épocas por segundo.
- **Fila elegida:** con puntos, un anillo en el plano (`plane-view` recibe
  el índice). Con tu manejo no hay dónde marcarla: elegir no hace nada más
  que marcar la fila.

### D15. Cambiar la red a mano

Pedido del dueño: "también podías modificar la red a mano, al igual que la
tab 5". Estaba fuera de alcance; entra.

- **Qué es un cambio acá.** En Inspeccionar los cambios son una capa de
  prueba sobre un cerebro que no cambia. Acá no hay cerebro debajo: el cambio
  va a la red que aprende, y el aprendizaje lo mueve desde ahí. Es el
  experimento que vale: romper un peso y ver al error subir y volver a bajar.
- **Apagar** es un estado que dura: la neurona vale cero, no recibe culpa y
  no se corrige; al encenderla vuelve con los pesos que tenía. Vale para
  entradas, ocultas y conexiones. No para salidas: con una salida apagada el
  error no está definido, y el botón no se muestra.
- **Núcleo.** Las funciones de `backprop.js` aceptan un `off` opcional con la
  forma que ya usa `applyChanges` (`offNeurons[col][j]`,
  `offConnections[l][j][i]`); sin él, el camino de antes, idéntico. El
  recorrido suma `setWeight`, `setBias`, `setOff`, `snapshot()` y
  `restore(snapshot)`. La comprobación por diferencias finitas se repite con
  partes apagadas.
- **Deshacer.** Una pila de copias (pesos y apagados) tomadas justo antes de
  cada cambio, en `src/tabs/lab/manual-changes.js`, lógica pura con pruebas.
  Un arrastre entero es una copia. Tope de 50; la copia de antes del primer
  cambio se guarda aparte para "Restablecer la red". Deshacer no devuelve la
  época ni las curvas: la curva muestra el salto, que es lo que pasó.
  Descartado: volver también la época y las curvas (hay que guardar y
  restaurar el orden de los ejemplos y el seguimiento del aviso, y la curva
  dejaría de contar lo que la persona hizo).
- **Sin marca de "cambiado a mano".** En Inspeccionar es un rombo; acá el
  rombo es la culpa que viaja, y un peso cambiado deja de ser "el que
  pusiste" en cuanto la red aprende. Lo apagado sí se marca, como en
  Inspeccionar. El contador de arriba dice que hay cambios.
- **Tarjeta.** La de Inspeccionar (`src/tabs/inspect/card.js`) pasa a
  `src/tabs/shared/` con opciones, y el Laboratorio la usa compacta: una fila
  por conexión (nombre, deslizador, campo, apagar), el sesgo y el botón de
  apagar. Sin "Entrada a mano" ni el dibujo de la activación. Inspeccionar
  tiene que verse igual que antes.
- **Dónde va.** Al final del panel, debajo de las misiones, para que elegir
  una neurona no mueva de lugar ningún ajuste. Medido en el navegador a
  1440×900 con puntos: el contenido del panel termina a los 565 px y el
  panel llega a los 884; quedan 319. A 1366×768 quedarían unos 190
  (estimado, no medido). [Sin medir] el alto de la tarjeta compacta y cuánto
  queda con tu manejo. Si no entra, la lista de pesos se desplaza dentro de la tarjeta.
- **Elegir y dejar de elegir.** Hoy el Laboratorio abre con una neurona
  elegida que no hace nada; pasa a abrir sin ninguna. Se deja de elegir con
  el botón de cerrar de la tarjeta o con un clic en la misma neurona. El
  clic en un lugar vacío sigue sin hacer nada, como dice `inspector-de-red`.
- **Rango del deslizador:** −3 a 3 (en Inspeccionar es −1 a 1, porque esos
  pesos vienen de la evolución; los de backpropagation pasan de 1 seguido).
- **Guardar como cerebro** con partes apagadas: se guardan como pesos en
  cero (los que salen de una neurona apagada, o el de la conexión apagada).

### D16. Tres botones de volver atrás, tres nombres

Con los cambios a mano, la pestaña tiene cuatro formas de volver atrás, y dos
se llamaban igual. Quedan así:

| Dónde | Botón | Qué hace |
|---|---|---|
| Barra de arriba | Restablecer | Los datos, a sus valores por defecto |
| Panel | Reiniciar pesos (R) | Pesos al azar; vacía curvas y cambios a mano |
| Panel | **Red de siempre** (antes "Restablecer la red") | Forma y tasa por defecto |
| Sobre la red | Deshacer · Restablecer la red | Los cambios a mano, igual que en Inspeccionar |

"Restablecer la red" queda con un solo significado en toda la aplicación:
quitar los cambios hechos a mano.

## Risks / Trade-offs

- **[Sin medir] Los valores por defecto.** Que una red de 4 neuronas aprenda
  el círculo en menos de 30 segundos con la tasa elegida es una hipótesis. →
  Se mide en el grupo 2, antes de la interfaz. Si no, se consulta con lo
  medido para cada forma.
- **[Sin medir] El sobreajuste.** En Competir la hipótesis de la
  memorización falló al medirla. Acá la teoría acompaña (pocos datos con
  ruido y una red grande), pero no está medido. → Se mide en el grupo 2 con
  cinco semillas; si la receta de D9 no lo muestra de forma confiable, se
  consulta antes de construir el aviso.
- **[Sin medir] Aprender a manejar imitando.** Los controles están muy
  desparejos (casi siempre se avanza, pocas veces se dobla) y un error chico
  al manejar se acumula. Una red puede acertar el 95 % de los ejemplos y
  chocar igual. → Se mide en el grupo 2: cuánto acierta y cómo maneja en
  carrera. Si no maneja razonablemente, se consulta; salidas posibles: más
  ejemplos, dar más peso a los ejemplos donde se dobla, o un maestro mejor.
- **El manejo de una persona es más difícil de imitar** que el de un
  cerebro: es menos consistente. → El maestro es el valor por defecto; lo
  grabado es para experimentar.
- **Es mucha pestaña,** como Inspeccionar. → Los grupos van en un orden en
  que cada uno deja algo usable: primero los puntos corriendo, después el
  paso a paso, después el manejo.
- **Hereda la vista de la red que el dueño encuentra tosca.** → Es un cambio
  aparte, anotado; lo que suma el Laboratorio (culpa, corrección) se hace
  como capas sobre la vista, para que la mejora no lo rompa.
- **La palabra "culpa".** No es el término de los libros. → Es llana y dice
  lo que es; el tooltip nombra el término técnico. Si no convence, es un
  texto.

- **[Sin medir] La tarjeta en el panel.** Quedan 319 px a 1440×900 con
  puntos; no se sabe cuánto mide la tarjeta compacta ni cuánto queda con tu
  manejo. → Se mide en la tarea 13.6; si con puntos y la red por defecto no
  entra entera, se consulta.
- **[Sin medir] Tres vistas en la barra de la red a 600 px.** Hoy con dos ya
  está justa. → Se mide en la 12.6; si se parte en dos renglones, se
  consulta con las medidas.
- **[Sin medir] La tabla con 3600 ejemplos mientras aprende.** → Se mide el
  tiempo por cuadro en la 12.7; el criterio está en la tarea.
- **Deshacer pierde lo aprendido después del cambio.** Es lo que significa
  volver a antes, pero puede sorprender. → El tooltip lo dice.
- **Apagar no es el "abandono de neuronas" de los libros,** que apaga al
  azar en cada ejemplo. → El tooltip no usa ese nombre.

## Migration Plan

No hay datos que migrar. Los cerebros guardados antes no cambian; los nuevos
llevan un bloque opcional que las versiones anteriores ignoran. Vuelta atrás:
quitar el módulo de la lista de pestañas.

## Open Questions

- ¿La vista de la red se mejora antes o después de construir el Laboratorio?
  El dueño pidió anotarlo y seguir con esta pestaña.
- ¿Hace falta dar más peso a los ejemplos donde se dobla para que la red
  aprenda a manejar? Se decide con lo medido.
