# Design

## Context

Ver proposal.md para el motivo y el alcance. Lo que condiciona el diseño:

- `src/core/track.js` ya arma pistas con curvas a partir de una línea central
  (`createTrack`), pero abiertas: tienen principio y fin, y `pointAt`,
  `laneCenter` y `progressOf` recortan la distancia a ese tramo.
- `src/core/world.js` siempre arma la calle recta (`createStraightStreet`) y
  guarda por auto su `progress` y su `segmentIndex`.
- El tráfico es una función de la distancia sobre la pista y deja de haberlo
  con densidad 0.
- La fitness "ventaja" es `progreso − TRAFFIC_SPEED × tiempo`, y la regla de
  los lentos compara el avance con esa misma velocidad. Ninguna de las dos
  necesita que haya vehículos.
- `src/render/camera.js` (`orientationFor`) ya deja sin girar a toda pista de
  más de un tramo (D7 lo cambia para los circuitos). El zoom mínimo es de 2 px
  por metro.
- Las pestañas 1 y 2 comparten ajustes en `src/tabs/shared/street-settings.js`
  y `street-advanced.js`.
- Los escenarios de un cerebro guardan `track` como texto, hoy siempre
  `'straight'`, y `sameScenario` lo compara tal cual.
- Los autos de un mismo mundo ya no se perciben ni chocan entre sí.

Nada de este cambio está medido: no se sabe si la población aprende a dar
vueltas con los valores por defecto. D8 lo comprueba temprano.

## Goals / Non-Goals

**Goals:**

- Que un circuito sea una pista más para el núcleo: mismo mundo, mismos
  sensores, misma fitness, mismas pestañas.
- Que el progreso por vueltas sea continuo, para que la ventaja, la regla de
  los lentos y el fin de generación funcionen sin casos especiales.
- Que el paisaje quede fuera del núcleo y no pueda cambiar una simulación.
- Que agregar un cuarto circuito más adelante sea agregar una entrada al
  catálogo.

**Non-Goals:**

- Tráfico en circuitos, tiempos de vuelta y comparación entre cerebros.
- Editor o generador de circuitos.
- Cambiar el formato de los cerebros.

## Decisions

### D1. Pista cerrada en `createTrack`

`createTrack({ centerline, width, lanes, closed })`. Con `closed: true`:

- El último punto se une con el primero con un tramo más, y las uniones en
  inglete de los bordes incluyen ese vértice. `leftBorder` y `rightBorder`
  son contornos cerrados y `borderSegments` incluye el tramo de cierre.
- `start` es 0 y `length` es el largo de una vuelta. `pointAt` y `laneCenter`
  aceptan cualquier distancia y la reducen al largo de la vuelta.
- `progressOf(position, hintSegment)` sigue devolviendo la distancia dentro
  de la vuelta, entre 0 y `length`. El acumulado lo lleva el mundo (D3).
- La pista expone `closed`.

Alternativa descartada: una pista abierta muy larga que repite el trazado.
Los bordes de dos vueltas quedarían encimados y `bordersNear` devolvería
tramos de más.

### D2. Catálogo en `src/core/circuits.js`

`TRACK_IDS = ['straight', 'oval', 'kidney', 'grandPrix']` y
`createTrackById(id, { lanes })`. La calle recta delega en
`createStraightStreet`; los circuitos ignoran `lanes` y usan un solo carril de
12 m de ancho, así la vista no dibuja líneas de carril.

Cada circuito se describe como una lista de tramos (rectas con su largo y
arcos con su radio y su ángulo, a izquierda o derecha) que arranca en la
línea de salida. Un armador los convierte en la línea central, muestreando
los arcos con cuerdas de 3 m como máximo. Las pruebas comprueban que cierra
(vuelve al punto y a la dirección de partida), los largos, los radios y las
separaciones que pide la spec.

- **Óvalo:** dos rectas de 150 m y dos medias vueltas de radio 50 m (614 m).
- **Riñón:** un óvalo apenas más largo, con una entrante suave en uno de los
  lados largos y una chicana bien marcada en el otro. Es el óvalo con un poco
  más de complejidad, no un circuito largo.
- **Gran premio:** inspirado en un trazado de gran premio conocido, sin su
  cruce. Es alargado y angosto, no una caja: la ida y la vuelta corren casi
  paralelas. Desde la salida: recta, primera curva de casi media vuelta, una
  serie de eses cerradas y seguidas (curva y contracurva, al menos seis, de 45°
  o más cada una y casi sin rectas entre ellas, ocupando buena parte del lado
  de la ida), una curva
  larga, la horquilla en el extremo lejano, la recta de atrás de al menos 150
  m, una curva rápida y la chicana final antes de la recta de salida. Tiene
  que ser divertido de manejar: la dificultad sube respecto del riñón, pero
  sin encadenar curvas cerradas una tras otra en todo el recorrido.

El dueño vio un primer dibujo (riñón de 952 m, gran premio de 1744 m en forma
de caja) y lo rechazó por largo y por la forma; estos rangos y esta
descripción salen de esa revisión. En una segunda vuelta aprobó el riñón y la
forma del gran premio, y pidió las eses más cerradas y más seguidas.

Los números del riñón y del gran premio los define la implementación,
respetando la spec. Como el dibujo es una cuestión de gusto, la tarea 2.4 se
detiene a mostrar los tres trazados antes de seguir.

### D3. El mundo lleva las vueltas

`createWorld({ track: id, ... })`, con `'straight'` por defecto.

- Sobre un circuito el tráfico se arma con densidad 0, se ignoren o no los
  ajustes pedidos, y los autos salen de `laneCenter(0, 0)`.
- Cada agente guarda `laps` (entero) y su última distancia dentro de la
  vuelta. Al ubicarlo, si esa distancia saltó más de media vuelta hacia
  atrás, `laps` sube uno; si saltó más de media vuelta hacia adelante, baja
  uno. `agent.progress = laps × length + distancia`. En una pista abierta
  `laps` es siempre 0 y nada cambia.
- El mundo expone `trackId`.

Alternativa descartada: que `progressOf` reciba el progreso anterior y
devuelva el acumulado. Mezcla estado del auto en la pista, que hoy no lo
tiene.

### D4. Entrenamiento: lista de pistas

- La configuración suma `tracks`: una lista de ids, sin repetidos y en el
  orden del catálogo. Por defecto, `['straight']`. Lo desconocido se descarta;
  si no queda nada, vale el valor por defecto.
- La generación número `g` corre en `tracks[(g − 1) mod tracks.length]`. Se
  usa el número de generación total, el mismo que se ve en pantalla.
- `training.trackId` informa la pista de la generación en curso y
  `training.lapsOf(i = leaderIndex)` sus vueltas: mayor progreso sobre el
  largo de la vuelta; 0 en la calle recta.
- `scenarioOf(config)` guarda `track: tracks.join('+')`. Con una sola pista da
  el mismo texto de hoy, así que los cerebros guardados no cambian y
  `sameScenario` sigue sirviendo sin tocarlo.
- `tracks` puede cambiar durante un entrenamiento: no se agrega a
  `NEW_TRAINING_KEYS`.
- La ventaja, la regla de los lentos, el fin de generación y la cuenta de
  vehículos superados no cambian: en un circuito no hay vehículos, así que la
  cuenta da 0 sola.

Alternativa descartada: una función de fitness nueva, "vueltas". La ventaja
ya premia el sentido correcto, las vueltas y la velocidad, y mantener una
sola función deja una sola curva cuando se alternan pistas.

### D5. Cerebros

`assertBrain` acepta en `track` un id del catálogo o varios unidos con `+`.
La biblioteca arma el nombre a mostrar traduciendo cada id. No cambia la
versión del formato.

### D6. Pestañas 1 y 2: pista en los ajustes compartidos

- `street-settings.js` suma `track` (por defecto `'straight'`), lo pasa en
  `worldSpec` y lo agrega a `RESTART_KEYS`.
- Un selector de pista compartido (módulo nuevo en `src/tabs/shared/`), en el
  panel, debajo de los controles del intento: cuatro opciones en dos
  renglones de dos, como las funciones de fitness.
- En un circuito: el indicador `passed` cambia de nombre a "Vueltas" y
  muestra `Math.floor(vueltas × 10) / 10`; tráfico nuevo, carriles, densidad e
  irregularidad quedan con `aria-disabled` y una ayuda propia; las misiones
  se reemplazan por una línea.
- Reglas a mano: cargar un ejemplo y restablecer ponen `track: 'straight'`.

### D7. Vista: circuitos

- `drawTrack` dibuja una pista cerrada con el relleno entre los dos bordes y
  los bordes encima, solo en los tramos que caen en el encuadre. Sin líneas de
  carril, porque tiene un solo carril.
- El zoom mínimo baja lo necesario para que el circuito de la pista actual
  entre entero en el escenario a la vista. Se calcula con el recuadro del
  trazado ya orientado, un margen de 15 m y el tamaño real del escenario, y
  nunca supera 2 px por metro; en la calle recta sigue en 2.
- En un circuito la cámara usa un giro fijo que deja la recta de salida
  vertical y el sentido de avance hacia arriba, como en la calle recta, porque
  el escenario es más alto que ancho. La pista no gira con el auto.

### D8. Comprobación de aprendizaje en el óvalo

`tools/measure-learning.mjs` suma un modo para medir en una pista: semillas 1
a 8, 60 generaciones con los valores por defecto y `tracks: ['oval']`; el
campeón de la generación 60 maneja solo 60 s y se anota cuántas vueltas da.
Se corre apenas esté el grupo 4, antes de tocar las pestañas.

Si menos de 5 de 8 completan una vuelta, la implementación se detiene y
consulta, con la tabla. No se cambian por cuenta propia el circuito, los
sensores ni los valores por defecto. De paso, informa el mismo dato para el
riñón, el gran premio y la alternancia calle recta + óvalo; esos no tienen
umbral.

Es la única medición de este cambio que frena el trabajo.

### D9. Paisaje

Dos módulos en `src/render/`:

- `scenery-layout.js`, sin DOM y con pruebas: dada una pista y una semilla,
  devuelve qué hay y dónde.
- `scenery.js`: dibuja ese resultado en el canvas de la vista.

Qué se genera:

- **Calle recta**, por celdas de 100 m a lo largo de la calle, cada una
  función de la semilla del mundo y de su número (como los bloques del
  tráfico): una vereda de 3 m pegada a cada borde; árboles entre 6 y 40 m del
  borde, de 1,5 a 3,5 m de radio; y una senda peatonal cada 150 a 400 m, de 4
  m de largo, cruzando la calzada.
- **Circuitos**, una sola vez por circuito y con una semilla fija propia:
  pianitos en los tramos con radio menor que 80 m, en una franja de 1 m por
  fuera de cada borde y en bloques de 2 m de dos colores; una tribuna de 60 ×
  10 m a 8 m del borde exterior de la recta de salida, y hasta dos más en
  curvas; la línea de largada a cuadros en la distancia 0; y árboles que no
  quedan a menos de 5 m de ningún borde ni sobre una tribuna.

Orden de dibujo: pasto (relleno del fondo), veredas, pianitos y tribunas,
calzada, sendas y línea de largada, líneas de carril y bordes, árboles,
tráfico, autos y rayos. Los árboles van después de la calzada pero nunca
sobre ella, porque se generan fuera.

Los pianitos van por fuera del borde de choque: son dibujo, no pista. Un auto
que los toca ya chocó.

Colores nuevos en `styles/tokens.css`, apagados: pasto, vereda, dos tonos de
árbol, dos de pianito, tribuna y pintura de senda.

Interruptor: preferencia `scenery` (`mlLab.scenery`, encendida por defecto)
en `src/ui/preferences.js`; un botón con estado junto a los controles de
cámara de la vista, igual en todas las pestañas; `render(world, { scenery })`
lo recibe, y `machineView` lo anula.

Rendimiento: se dibuja solo lo que cruza el encuadre, con figuras planas (sin
sombras ni degradados), y las celdas de la calle se guardan mientras estén
cerca.

Alternativa descartada: generar el paisaje en el núcleo. No es simulación, y
dejarlo en el dibujo garantiza que no pueda cambiarla.

### D10. Pestaña 3

- `settings.js` suma `tracks` al grupo `nextGeneration`; en la sección
  avanzada, grupo del escenario, cuatro opciones que se marcan y desmarcan.
  La última marcada no se puede desmarcar.
- El rótulo sobre el escenario pasa a "Generación 12 · Óvalo" cuando la pista
  no es la calle recta.
- El cuarto indicador cambia de nombre y de valor según
  `training.trackId`: vehículos superados en la calle, vueltas en un circuito.
- Con varias pistas, el renglón de ayuda de la curva dice que cada generación
  corre en una pista distinta.

### D11. Textos

Nombres de pista: Calle recta, Óvalo, Riñón, Gran premio (en inglés: Straight
street, Oval, Kidney, Grand prix). El resto de las claves nuevas sigue la
forma de las existentes: nombre del ajuste, ayuda en dos partes, ayuda de
"no aplica en un circuito", nombre del indicador de vueltas, línea de las
misiones y aviso al cargar un ejemplo desde un circuito.

### D12. Pruebas

Archivos nuevos para pistas cerradas, catálogo, mundo en circuito, pistas del
entrenamiento y distribución del paisaje. Las aserciones que enumeran todas
las claves de una configuración suman `tracks` o `track`; las demás pruebas
existentes no cambian. La prueba de arquitectura sigue exigiendo que
`src/core` no dependa del DOM.

### D13. "Ver como la máquina" en las pestañas 2 y 3

La vista ya tiene la opción `machineView`, que omite la pista y el tráfico;
la usa El problema. Se extiende así:

- `machineView` omite también el paisaje (D9) y, cuando hay una población,
  a todos los autos que no son el del foco, y sus marcas de élite.
- **Reglas a mano:** un interruptor junto al de los sensores, con el mismo
  comportamiento que en El problema: fuerza los rayos a la vista y, al
  chocar, vuelve a mostrar todo hasta que empieza el intento siguiente. Usa
  el mismo cartel sobre el escenario.
- **Entrenar:** un interruptor en el mismo renglón que "Sensores del líder".
  Fuerza los rayos del líder a la vista. No hay "mostrar todo al chocar":
  el foco pasa al líder siguiente y la generación sigue. Para que los dos
  entren a 360 px, el primer interruptor del renglón se llama "Sensores",
  como en El problema y en Reglas a mano, y su tooltip aclara que son los del
  líder; el renglón usa un hueco de 6 px y un relleno horizontal de 5 px en
  sus interruptores (medido: 117 + 6 + 201 = 324 px de 328 en español).
- El nombre del interruptor reutiliza el texto de El problema; la ayuda es
  propia de cada pestaña, porque el motivo cambia (escribir reglas, ver con
  qué decide la red).
- Es solo dibujo: ninguna de las dos pestañas le pasa el modo al núcleo.

## Risks / Trade-offs

- [La población no aprende a dar vueltas con los valores por defecto] → D8 lo
  mide antes de armar las pestañas y frena si no alcanza.
- [Los trazados no gustan] → La tarea 2.4 los muestra antes de seguir.
- [El interruptor nuevo no entra en el renglón de "Sensores del líder" a 360
  px, o hace desplazar el panel de Entrenar, que hoy entra justo] → Se
  verifica a 1440×900; si no entra, se consulta antes de mover otros
  controles.
- [El selector de pista hace desplazar el panel de El problema] → Se verifica
  a 1440×900; si no entra, se consulta antes de mover otros controles.
- [El paisaje baja la fluidez] → Figuras planas y solo dentro del encuadre;
  se mide con los mínimos de la spec, y se consulta si no llega.
- [El paisaje distrae o se confunde con los autos] → Colores apagados, un
  interruptor y oculto en "ver como la máquina".
- [Con 400 autos por defecto, medir 8 semillas tarda varios minutos] → Es una
  sola medición y corre fuera de `npm test`.
- [Un programa de Reglas a mano escrito para la calle choca enseguida en un
  circuito] → Es lo esperable y es parte de la lección; los ejemplos vuelven
  a la calle recta.

## Migration Plan

No hay datos que migrar. Los cerebros guardados dicen `track: 'straight'` y
siguen leyéndose igual. La preferencia del paisaje no existe en los
navegadores de hoy y arranca encendida. Para volver atrás alcanza con revertir
el cambio; un cerebro entrenado en un circuito dejaría de ser válido, por lo
que conviene exportarlo antes.
