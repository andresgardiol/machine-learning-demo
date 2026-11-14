# Design

## Context

Lo que ya existe y se reutiliza:

- `src/core/network.js`: la red (`sizes`, `activation`, `layers` con `weights`
  y `biases`), `computeNetwork` y `computeDetailed`, que da el valor y la suma
  de cada neurona. Activaciones de las capas ocultas: escalón, sigmoide, tanh
  y ReLU; la salida es siempre escalón (sí cuando la suma es mayor que cero).
  Límites: hasta 3 capas ocultas de hasta 16 neuronas; hasta 20 sensores.
- `src/render/network-view.js`: el diagrama de Entrenar, solo de lectura, con
  la convención de colores y trazos (signo, magnitud, sesgo, actividad) y una
  disposición por capas que es una función pura.
- `createWorld` con un controlador cualquiera; `carForBrain`.
- La biblioteca (`library.list()`, autoguardados `current` y `previous`) y
  `EXAMPLE_BRAINS`.
- La barra de escenario, que ya admite no mostrar un grupo y sumar uno
  propio; el selector de Competir; los bloques de percepción y acción de
  `src/tabs/shared/driving-cards.js`; el reintento automático de las
  pestañas 1 y 2.
- Las tres zonas de la aplicación (izquierda, tablero, panel) con sus
  divisores, y el contrato `mount` / `unmount` con estado en el módulo.

Los pesos nacen en [−1, 1] y la mutación los mantiene ahí; un cerebro
importado puede traer otros valores.

Respuestas del dueño que fijan el alcance (13 de noviembre de 2026): la red
en grande y la escena en segundo plano, más chica; al abrir, el último
entrenamiento; y todo lo listado en la propuesta, con cada cambio visible en
tiempo real.

## Goals / Non-Goals

**Goals**

- Que la red sea lo primero que se mira y que lo que se le hace esté al lado.
- Que lo que se muestra sea la cuenta real, operación por operación.
- Que nada de lo que se rompa quede roto: todo se deshace.
- No cambiar el comportamiento de las pestañas 1 a 4.

**Non-Goals**

- Lo listado en "Fuera de alcance" de la propuesta.
- Cambiar el diagrama de Entrenar.

## Decisions

### D1. Organización de la pantalla

Revisada con los marcos de diseño de interacción y de crítica de diseño (ver
D2). Tres zonas, las de siempre, con otro contenido:

```
┌ barra de escenario: pista · tráfico · velocidad · restablecer ─────────────────┐
├────────────────────────────────────────┬────────────────┬─────────────────────┤
│ Red de «Entrenamiento en curso»        │ escena del     │ Guía                │
│ [Diagrama|Tabla]  Conexiones: Todas·5·3·1│ auto (chica)  │ Cerebro   [Cambiar] │
│ [Resumir todas] 3 cambios [Deshacer]   │                │ ─────────────────── │
│ [Restablecer]                     zoom │                │ Neurona elegida     │
│ ──────────────────────────────────     │ ────────────── │  [Apagar]           │
│ Entradas(6)▾  Oculta 1(6)▾  Salidas(4)▾│ decisión:      │  entrada valor peso │
│     ○             ○             ○      │ ↑  ←  →  ↓     │  …        ×    =    │
│     ○   L A  R E D ○            ○      │                │  suma · sesgo       │
│     ○             ○             ○      │ (leyenda, con  │  activación · salida│
│ ──────────────────────────────────     │  la guía)      │ ─────────────────── │
│ suma: 0,39 − 0,21 + 0,59 + 0,04 = 0,81 │                │ Misiones (3 líneas) │
│ ▶/⏸ Paso  de a: Cuadro·Capa·Neu·Op     │                │                     │
│ ritmo ──●──   Cuadro 132 · O1 · n2     │                │                     │
└────────────────────────────────────────┴────────────────┴─────────────────────┘
```

**Anchos.** En las otras pestañas la zona izquierda mide 400 px por defecto
y el tablero se lleva lo que sobra (668 px a 1440). Acá es al revés: el
tablero mide 360 px, su mínimo, el panel 360, y la red toma lo que sobra
(unos 708 px a 1440). Inspeccionar recuerda su propio ancho de la zona
izquierda, aparte del de las demás pestañas, que no cambian. Los divisores
funcionan igual. (El primer borrador daba por hecho que la zona izquierda
era la más ancha; lo midió la sub-sesión.)

En Inspeccionar la zona de la red tiene su propio mínimo, 600 px, y el
tablero cede primero. **Medido:** con 708 px los controles de arriba ocupan
dos renglones (69 px); con 520 o 400 px, cuatro; con 260 px, el mínimo de las
otras pestañas, seis o siete, y la red queda casi sin lugar.

- **Zona izquierda, la red:** arriba, dos renglones de controles que no
  dependen del tamaño de la red: el nombre del cerebro, la vista, el filtro
  de conexiones, "Resumir todas", el contador de cambios con "Deshacer" y
  "Restablecer la red", y el acercamiento. En la red misma, un encabezado
  arriba de cada capa, que la resume o la abre. Abajo, la operación en curso
  y la barra de reproducción.
- **Tablero:** la escena chica, la decisión y, con la guía activa, la leyenda
  de cómo se lee la red.
- **Panel:** guía, cerebro, la tarjeta de la neurona elegida y las misiones.
  Es el patrón de las herramientas de diseño y de depuración: se elige algo
  en el lienzo y sus propiedades están en el panel de la derecha.

### D2. Lo que cambió la revisión de UX

El primer borrador tenía la reproducción, la vista y los cambios en el panel,
y tres modos (en marcha, paso a paso, a mano). La revisión lo cambió así:

| Hallazgo | Principio | Decisión |
|---|---|---|
| La reproducción estaba en el panel, a un extremo de la pantalla, y lo que mueve está en el otro | Proximidad; ley de Fitts; herramientas a mano | Barra de reproducción pegada a la red, como en un reproductor (ley de Jakob) |
| Vista, capas y acercamiento estaban lejos de la red | Región común | Van en la tira de arriba de la red |
| "Deshacer" y "Restablecer" estaban en el panel | Proximidad; control y libertad | Van sobre la red, y solo cuando hay cambios |
| Tres modos | Minimizar modos | Un solo estado, reproduciendo o en pausa. El paso a paso y las entradas a mano son lo que se puede hacer en pausa |
| Las entradas a mano eran un modo que no se veía | Visibilidad del estado | Aviso fijo sobre la escena con "Soltar"; reproducir las suelta sola y lo avisa |
| La red modificada no se distinguía de la original | Visibilidad del estado | Contador de cambios sobre la red y marcas en cada neurona y conexión |
| En el paso a paso no se sabía por dónde iba la cuenta | Visibilidad del estado; reconocer antes que recordar | La barra lo dice con palabras, la red lo destaca y la tarjeta sigue a la neurona en curso |
| La tarjeta arrancaba vacía | Evitar la hoja en blanco | Siempre hay una neurona elegida |
| Editar un peso pedía entrar a un modo de edición | Menos trabajo que no aporta | El deslizador está en la fila, siempre |
| Restablecer la red pedía confirmación | Deshacer antes que confirmar | Sin confirmación; no cambia el cerebro guardado |
| "Matriz" y "grafo" son palabras de oficio | Lenguaje de la persona | "Tabla de pesos" y "Diagrama", con el nombre técnico en el tooltip |
| Arrastrar un rayo era la única forma de mover una entrada | Alternativa al arrastre | Deslizador en la tarjeta de la entrada |

Segunda vuelta, con los comentarios del dueño sobre el boceto:

| Comentario | Decisión |
|---|---|
| La tarjeta de la neurona, en el tablero angosto: no se entendía para qué era ni cómo crece | Pasa al panel, que tiene el alto entero. Muestra una sola neurona: a lo sumo 21 filas, que se desplazan por dentro con el pie fijo. Es donde se ve la cuenta y donde se cambian pesos y sesgos |
| Las misiones ocupaban mucho para lo que aportan | Tres renglones, uno por misión, sin recuadro que se estire |
| En la demo original había un filtro de las 1, 3 o 5 conexiones más importantes | Filtro de conexiones sobre la red (D6b) |
| En la demo original una capa se resumía en cuadritos pegados, una por una o todas | Las capas resumidas son cuadritos, valen para entradas, ocultas y salidas, y hay "Resumir todas" / "Abrir todas" (D6) |
| Deshacer y restablecer tienen que estar para todo cambio de la red | Los dos botones están siempre a la vista sobre la red, no solo cuando hay cambios |

Tercera vuelta, sobre el segundo boceto:

| Comentario | Decisión |
|---|---|
| Los botones de capas en una fila aparte crecen con la red; resumir tiene que estar en el grafo, arriba de cada capa | Cada capa lleva su encabezado en la red misma (D6). Arriba queda un solo botón para todas |
| El paso a paso tiene que animarse para que enseñe | Cada paso es un movimiento con los valores reales (D7b) |
| En la demo original una sección mostraba cada operación mientras pasaba | "Operación en curso", escrita con sus números, entre la red y la reproducción (D7c) |

Postura: la pestaña pide atención sostenida (una persona explorando o un
mentor presentando), así que admite más densidad que las otras, atajos y
manipulación directa sobre la red.

La reproducción fuera del panel rompe la costumbre de las otras pestañas,
donde "Pausar" está en el panel. Se acepta porque acá es el control más
usado y porque el atajo (espacio) es el mismo.

### D3. La cuenta, en el núcleo

`src/core/network-trace.js`, sin DOM:

```js
traceNetwork(net, inputs, changes?) →
  { layers: [ { neurons: [ { from: [...], weights: [...], products: [...],
                             sum, bias, total, activation, output, off } ] } ],
    inputs: [...], outputs: [...] }
```

- `total` y `output` se calculan en el mismo orden que `computeDetailed`
  (el sesgo primero y después cada producto), para que la salida sea idéntica
  bit a bit a la del manejo. `sum` (la suma de los productos) es para
  mostrar.
- Una prueba compara `traceNetwork` con `computeNetwork` en mil entradas con
  semilla, para las cuatro activaciones.

*Alternativa descartada:* cambiar `computeDetailed` para que devuelva los
productos. Lo usa el entrenamiento en cada paso de cada auto; no se toca.

### D4. El cursor del paso a paso

`src/core/pass-cursor.js`, sin DOM. La cuenta de un cuadro es una lista
ordenada de posiciones: capa, neurona y operación (`products`, `sum`, `bias`,
`activation`).

```js
createPassCursor(net) → { position, done, advance(size), reset() }
// size: 'operation' | 'neuron' | 'layer' | 'frame'
```

El cursor no calcula nada: dice hasta dónde se muestra. Los números salen
siempre de `traceNetwork`, completa, con las entradas del cuadro. Así lo que
se ve a medio camino es la cuenta real, no otra.

### D5. Cambios de prueba

`src/core/network-changes.js`, sin DOM:

- Un cambio es `{ kind: 'weight' | 'bias' | 'connectionOff' | 'neuronOff',
  layer, neuron, input?, value? }`. Las entradas son la capa 0.
- `createChanges()` lleva la lista en orden, con `set`, `undo`, `clear`,
  `count` y `list`. Cambiar dos veces lo mismo reemplaza; volver al valor
  original lo quita.
- `traceNetwork(net, inputs, changes)` aplica los cambios al calcular: usa el
  valor cambiado, pone en 0 el producto de una conexión apagada y en 0 la
  salida de una neurona apagada (o la entrada, si es de la capa 0).
- El controlador del auto de la pestaña usa esa misma función. Lo que se ve
  y lo que maneja no pueden diferir.

Los cambios se guardan por cerebro (su `id` y su `updatedAt`) hasta cerrar la
aplicación. Si el cerebro cambió, se descartan y se avisa.

### D6. La vista de la red

`src/render/network-inspector.js`, nuevo. Reutiliza la disposición pura y la
convención de colores de `network-view.js`, que no cambia.

- **Diagrama:** en un canvas. Acercar, alejar y mover con la cámara de
  `src/render/camera.js` y los mismos controles que el escenario. La
  detección de qué neurona o conexión está bajo el cursor es una función pura
  que se prueba en Node.
- **Tabla de pesos:** HTML de verdad (`table` con encabezados), una por capa,
  una al lado de la otra. Cada celda muestra el número y lleva de fondo el
  color del signo con la intensidad de la magnitud. Una tira arriba de cada
  tabla muestra la actividad de sus entradas y una columna al final, la de
  sus neuronas. Con 21 columnas se desplaza por dentro de su tabla.
- **Capas resumidas:** cada capa (entradas, cada oculta y salidas) tiene un
  encabezado arriba de su columna, en la red misma: su nombre, cuántas
  neuronas tiene y una marca de abierta o resumida. Es un botón de verdad
  (`aria-expanded`) puesto sobre el canvas, que sigue a su columna al mover o
  acercar la vista y queda pegado al borde de arriba de la zona. En la tabla
  de pesos, el mismo encabezado es el título de la tabla de esa capa. Así los
  controles no crecen con la cantidad de capas. Arriba de la red queda un
  solo botón, "Resumir todas", que pasa a "Abrir todas". Una capa resumida
  ocupa una columna angosta de cuadritos pegados, uno por neurona, con su
  actividad; sus conexiones se dibujan como una banda. Un clic en un cuadrito
  elige esa neurona sin abrir la capa.
- **Teclado y lectores de pantalla en el diagrama:** sobre el canvas va una
  capa de botones transparentes, uno por neurona visible, con foco
  itinerante: las flechas mueven el foco, Enter elige. Las conexiones se
  eligen desde las filas de la tarjeta o desde la tabla.
- **Lo que recibe:** la red, la cuenta, el cursor, los cambios, la neurona
  elegida y las entradas a mano. No guarda estado de la simulación.

### D6b. Filtro de conexiones

Sobre la red: "Conexiones: Todas | 5 | 3 | 1". Por defecto, todas.

- Con 5, 3 o 1, cada neurona destaca sus N conexiones de entrada de mayor
  peso sin el signo, y las demás quedan muy atenuadas. No desaparecen: una
  conexión que no se ve parecería que no existe.
- Es por neurona, no de toda la red: así cada neurona muestra de dónde saca
  la mayor parte de lo que recibe.
- La importancia es el tamaño del peso, que es estable. No es lo que la
  conexión aporta en ese cuadro, que cambia sesenta veces por segundo y haría
  parpadear el diagrama.
- Empates: gana la entrada de más arriba, para que sea siempre igual.
- Qué conexiones entran es una función pura del núcleo
  (`topConnections(net, changes, n)`), que usan el diagrama, la tabla y la
  tarjeta.
- No toca la cuenta: es solo qué se destaca.

*Alternativa descartada:* ordenar por lo que aporta cada conexión en el
cuadro. Queda anotada como posible segundo criterio.

*Alternativa descartada:* ampliar `network-view.js`. El de Entrenar tiene que
seguir siendo liviano y de solo lectura, y se dibuja para una población que
cambia cada generación.

*Alternativa descartada, anotada para más adelante:* una tercera vista con
los pesos dibujados sobre el abanico de sensores del auto. La idea queda
incorporada de otra forma: al elegir una neurona que recibe los sensores, los
rayos de la escena toman el color y el grosor de sus pesos (D9).

### D7. Reproducción

Un solo estado: reproduciendo o en pausa. La barra tiene, de izquierda a
derecha:

1. **Reproducir / Pausar** (espacio).
2. **Paso** (N). Reproduciendo, pausa y avanza uno.
3. **De a:** Cuadro | Capa | Neurona | Operación.
4. **Ritmo:** un deslizador. De a cuadros: tiempo real (60 por segundo), ½,
   ¼, ⅒, 2 por segundo y 1 por segundo. De a capas, neuronas u operaciones:
   20, 10, 5, 2 y 1 pasos por segundo; por defecto, 5.
5. **Dónde va:** "Cuadro 132 · Oculta 1 · neurona 3 · suma". Reproduciendo
   de a cuadros dice solo el cuadro.

Reglas:

- Reproducir de a cuadros a tiempo real es el estado por defecto y es
  idéntico a como corren las otras pestañas.
- Reproducir de a un tamaño menor avanza el cursor a ese ritmo; cuando la
  cuenta del cuadro termina, el mundo da un paso y el cursor vuelve a
  empezar.
- En pausa después de reproducir de a cuadros, la cuenta del cuadro está
  completa. El primer "Paso" de a operación, neurona o capa empieza la cuenta
  del cuadro siguiente: mueve el auto y deja el cursor al principio.
- El ritmo se recuerda por separado para "cuadro" y para los demás tamaños.
- La pestaña usa el mismo bucle de `src/ui/loop.js`; el ritmo lento se hace
  acumulando tiempo, sin cambiar el paso fijo de la simulación.

### D7b. Paso animado

Cada paso se ve como un movimiento. Lo que se anima son los valores reales
de `traceNetwork`: nada se inventa para que quede lindo.

| Operación | Qué se ve en la red |
|---|---|
| Productos | Por cada conexión de entrada viaja una marca desde su origen hasta la neurona, con el color del signo y el tamaño del producto |
| Suma | Las marcas se juntan en la neurona, que muestra el total que va acumulando |
| Sesgo | El contorno de la neurona, que es donde el diagrama muestra el sesgo, se marca |
| Activación | El relleno crece hasta el valor de salida; en la tarjeta, el punto recorre la curva de la función hasta su lugar |

- **Una neurona:** las cuatro, encadenadas y más breves.
- **Una capa:** todas sus neuronas a la vez, como una ola.
- **Un cuadro, en pausa:** una ola de las entradas a las salidas y después
  se mueve el auto.
- **Cuadros en tiempo real:** sin animaciones de paso; los valores cambian.

Duración: un paso a mano dura 300 ms (una neurona o una capa, 450 ms). Al
reproducir sola, cada animación dura como mucho el 80 % del intervalo entre
pasos. Pedir otro paso con una animación en curso la completa al instante:
nunca hay que esperar. Con la preferencia de menos movimiento no viaja ni
crece nada; cada paso se marca con un cambio de estado.

El estado de la animación (qué paso, cuánto avanzó) lo lleva la vista de la
red; la simulación y el cursor no saben que existe. Un paso está hecho en
cuanto se pide: la animación solo muestra cómo se llegó.

### D7c. Operación en curso

Una franja de hasta dos renglones entre la red y la barra de reproducción,
con la operación que se acaba de hacer, escrita con sus números:

- Productos: "0,48 × 0,81 = 0,39 · 0,30 × −0,70 = −0,21 · 0,95 × 0,62 = 0,59"
- Suma: "0,39 − 0,21 + 0,59 + 0,04 = 0,81"
- Sesgo: "0,81 + (−0,12) = 0,69"
- Activación: "tanh(0,69) = 0,60"; en una salida: "0,69 es mayor que 0: sí,
  doblar a la derecha"
- De a neuronas: "Oculta 1 · neurona 2 = 0,60". De a capas: "Oculta 1: 4 de
  6 neuronas encendidas".

Con muchas entradas muestra los términos más grandes y "y 17 más"; la cuenta
completa está en la tarjeta. Está junto a la red porque es ahí donde se mira
la animación; la tarjeta del panel es el detalle y el lugar para cambiar.

Solo se muestra cuando sirve: en pausa y al reproducir de a capas, neuronas
u operaciones. En tiempo real la red ocupa ese lugar.

Los textos salen de una función pura (`describeStep`), con pruebas en los
dos idiomas.

### D8. Tarjeta de la neurona y decisión

**Decisión:** en el tablero, debajo de la escena. Es el bloque de acción
compartido, con un tercer estado, "sin decidir", para el paso a paso.

**Tarjeta de la neurona:** en el panel. Para qué está:

1. Es el único lugar donde se ve la cuenta con números. El paso a paso de a
   operaciones no tiene otro lugar donde mostrar los productos, la suma, el
   sesgo y la activación.
2. Es donde se cambia la red: cada fila tiene el deslizador de su peso y su
   botón de apagar; el pie, el deslizador del sesgo; el título, el botón de
   apagar la neurona.

Cómo crece: no crece con la red. Muestra una sola neurona, y una neurona
tiene tantas filas como entradas: 21 como mucho en la primera capa (20
sensores y la velocidad) y 16 en las demás. Con más filas de las que entran,
se desplazan por dentro y el pie queda fijo.

Contenido:

- Título con la capa y el número, o el nombre de la entrada o de la acción.
- Una tabla con una fila por entrada: de dónde viene, valor, peso, producto
  (con una barra hacia la izquierda o la derecha según el signo).
- Al pie, fijos: suma, sesgo, activación (el nombre de la función y un
  gráfico chico con el punto donde cae) y salida.
- Con el filtro de conexiones en 5, 3 o 1 (D6b), la tabla muestra esas filas
  y una más, "Otras N", con la suma de sus productos. El total no cambia.
- En una neurona de entrada: qué sensor es, su lectura, y en pausa su
  deslizador (D9). Sin filas de pesos.
- Los números van con dos decimales. Los totales se calculan con los números
  enteros y se redondean recién al mostrarlos: lo que se ve es el número que
  usa la red. Al pie de la tabla, un renglón chico y siempre visible lo
  dice: "Números redondeados a dos decimales". **Medido:** sumar a mano lo
  que se ve da exactamente el total mostrado en el 42 % de los casos; en el
  resto difiere en 0,01 o 0,02.
- En el paso a paso, lo que todavía no se hizo muestra una raya.
- Al avanzar de a neuronas o de a operaciones, la neurona elegida pasa a ser
  la del cursor.

Neurona elegida al abrir un cerebro: la primera de la primera capa oculta; si
no hay capas ocultas, la primera salida.

### D9. Entradas a mano

Solo en pausa.

- La escena chica dibuja una manija en cada rayo, donde detecta algo (en la
  punta si no detecta nada). Arrastrarla a lo largo del rayo cambia la
  lectura de ese sensor.
- La tarjeta de una entrada tiene un deslizador equivalente (0 a 1, de a
  0,01), y la de la velocidad, el suyo.
- La red se recalcula en cada movimiento. Si el cursor estaba a medio camino,
  se conserva: los números mostrados se actualizan.
- Con alguna entrada a mano, la escena muestra el aviso "Entradas a mano" con
  el botón "Soltar", y esas entradas se marcan en la red.
- Reproducir o dar un paso que mueva el auto las suelta, con un anuncio.
- Con una neurona elegida que recibe directamente los sensores, cada rayo de
  la escena toma el color (signo) y el grosor (magnitud) del peso con que esa
  neurona lo mira. Con cualquier otra neurona, los rayos se ven como siempre.

### D10. Escena chica y barra de escenario

- `createStageView` suma un modo chico: sin controles de cámara ni gestos, con
  un encuadre que sigue al auto y muestra el alcance de sus sensores.
- Un solo auto, manejado por la red con sus cambios de prueba. Si choca, el
  intento vuelve a empezar solo después de un segundo, con el mismo tráfico
  (el comportamiento de "reintentar solo" de las pestañas 1 y 2).
- Barra de escenario: pista, tráfico y velocidad; sin sensores. Al elegir un
  cerebro, la barra pasa al escenario donde más generaciones entrenó (pista,
  carriles, densidad e irregularidad). "Restablecer" vuelve ahí.
- El paisaje sigue la preferencia de la aplicación.

### D11. Qué cerebro se mira

Orden al abrir por primera vez: el autoguardado del entrenamiento en curso;
si no hay, el del entrenamiento anterior; si no hay, el ejemplo `street-new`.

- La pestaña trabaja con una copia. No sigue en vivo a Entrenar: al volver a
  la pestaña, si ese cerebro cambió, toma la versión nueva y lo avisa.
- El selector es el de Competir, con una sola elección: Tus cerebros y
  Cerebros de ejemplo. Se saca a un módulo común si hoy está dentro de la
  pestaña Competir.
- En el panel: nombre, dónde entrenó (las mismas palabras que en Competir) y
  la forma de la red ("6 entradas · 6 ocultas · 4 salidas").

### D12. Panel

En orden, sin vistas ni secciones plegables:

1. Guía (con la guía activa): el texto de inicio.
2. Cerebro (D11), en dos renglones con su botón "Cambiar".
3. Tarjeta de la neurona (D8). Ocupa el alto que sobra.
4. Misiones (con la guía activa): tres renglones, uno por misión, con su
   estado al final del renglón. Sin recuadro propio que se estire.

La leyenda de cómo se lee la red va en el tablero, debajo de la decisión,
con la guía activa: positivo y negativo, grosor, relleno, sesgo, apagado y
cambiado.

Los controles de marcha no están acá: están junto a la red (D2).

**Deshacer y restablecer** están sobre la red, siempre a la vista. Sin
cambios se ven sin acción, con un tooltip que lo explica: son acciones en su
tope, no ajustes que sobran, y tienen que poder encontrarse antes de
necesitarlas.

### D13. Atajos

Espacio (reproducir o pausar), N (un paso), R (reiniciar el intento) y V
(restablecer la vista de la red). Las flechas mueven el foco entre neuronas
cuando el foco está en la red. Sin teclas nuevas.

### D14. Misiones

Lógica sin DOM en `src/tabs/inspect/missions.js`:

1. **Seguir una cuenta:** avanzar paso a paso las cuatro operaciones de una
   misma neurona.
2. **Cambiar una decisión:** con una entrada a mano, lograr que cambie alguna
   de las cuatro acciones.
3. **Apagar una neurona:** apagar una y reproducir al menos tres segundos.

### D15. Textos

Voseo, frases cortas. Términos, en español y en inglés:

| Concepto | es | en |
|---|---|---|
| Vistas | Diagrama / Tabla de pesos | Diagram / Weight table |
| Tamaños del paso | Cuadro, Capa, Neurona, Operación | Frame, Layer, Neuron, Operation |
| Operaciones | Productos, Suma, Sesgo, Activación | Products, Sum, Bias, Activation |
| Reproducción | Reproducir, Pausar, Paso, Ritmo | Play, Pause, Step, Pace |
| Cambios | Apagar, Encender, Deshacer, Restablecer la red | Turn off, Turn on, Undo, Reset network |
| Avisos | Entradas a mano · Soltar; Red modificada: 3 cambios | Manual inputs · Release; Network changed: 3 changes |

Guía: "Esta es la red del cerebro que maneja. Cada círculo es una neurona y
cada línea, un peso. Pausá y avanzá de a un paso para seguir la cuenta."

"Sesgo", "activación" y "matriz de pesos" se definen en su tooltip la primera
vez que aparecen, con su nombre técnico.

## Risks / Trade-offs

- **[Sin medir] Fluidez con la red más grande.** 20 sensores y tres capas de
  16 son unas 900 conexiones redibujadas en cada cuadro, y la tabla, unas 900
  celdas. → Se mide temprano (grupo 2 y grupo 3). Si no llega a 55 cuadros
  por segundo, la implementación se detiene a consultar; la salida prevista
  es actualizar en la tabla solo las tiras de actividad en cada cuadro.
- **[Sin medir] El panel a 1440×900.** Guía, cerebro, tarjeta y misiones
  tienen que entrar sin desplazarse, con la tarjeta desplazándose por dentro
  si la neurona tiene muchas entradas. → Se mide al armar la tarjeta; si no
  entra, se consulta con las medidas.
- **[Sin medir] Animaciones y fluidez.** Con la red más grande, una ola de
  una capa mueve 256 marcas a la vez. → Se mide junto con la fluidez; si baja
  de 55 cuadros por segundo, se consulta. Salida prevista: animar por capa
  una banda en vez de una marca por conexión cuando hay más de cien.
- **Encabezados que siguen a su columna.** Con la vista muy acercada, dos
  encabezados pueden quedar fuera de la zona. → Quedan pegados al borde y la
  vista entera se recupera con un clic.
- **[Sin medir] Dos renglones de controles sobre la red.** Son seis cosas:
  nombre, vista, filtro, resumir todas, cambios y acercamiento. → Se mide con la zona
  de la red en su ancho mínimo; si pasan de dos renglones, se consulta.
- **Es mucha pestaña.** Son nueve funciones. → Las tareas van en un orden en
  que cada grupo deja algo que se puede usar: primero mirar, después
  reproducir y la cuenta, después tocar. Se puede cortar al final de
  cualquier grupo.
- **La disposición distinta puede desorientar.** → La barra de pestañas, la
  barra de escenario, el panel a la derecha y los divisores no cambian. Lo
  eligió el dueño.
- **Redondeo a la vista.** Con dos decimales, la suma de los productos
  mostrados no coincide con el total mostrado en más de la mitad de los casos
  (medido), por 0,01 o 0,02. → Se muestra el total de verdad y un renglón
  visible avisa del redondeo. La alternativa, que la cuenta a la vista cierre
  siempre, mostraría un total que no es el que usa la red, y a veces una
  salida que no le corresponde.
- **Una red rota maneja mal y choca enseguida.** → El intento vuelve a
  empezar solo, y "Restablecer la red" está siempre a la vista cuando hay
  cambios.
- **El cursor a medio camino y un cambio de peso.** Cambiar un peso en pausa
  recalcula todo con el cursor donde estaba. → Es lo esperado: se ve el
  efecto en lo ya calculado.
- **Sin probar por el equipo:** lector de pantalla real, Safari y Firefox,
  como en las pestañas anteriores.

## Migration Plan

No hay datos que migrar. La pestaña pasa a estar disponible al registrarse en
`src/main.js`; los textos de "próximamente" se reemplazan. Vuelta atrás:
quitar el módulo de la lista de pestañas.

## Open Questions

- ¿La tercera vista (los pesos sobre el abanico de sensores) hace falta
  además de lo que ya muestra la escena? Se decide después de usar la
  pestaña.
- ¿Guardar una red modificada como cerebro nuevo va en Laboratorio? Queda
  fuera de este cambio.
