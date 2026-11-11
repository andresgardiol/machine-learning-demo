# Design

## Context

Motivación y alcance: ver proposal.md. Este documento parte del estado medido
en el navegador con la ventana en 1440×900 (zona útil de 851 px de alto).

**Pestaña Entrenar hoy** (`src/tabs/train/index.js`, todo en `panel.append`):

| Bloque | Empieza en (px) | Alto (px) |
|---|---|---|
| Título | 65 | 28 |
| Guía (3 párrafos) | 109 | 345 |
| Botones (4, en 3 renglones) | 471 | 113 |
| Velocidad | 600 | 53 |
| Indicadores (5) | 669 | 215 a 243 |
| Misiones | 900 | 203 |
| Población y mutación | 1119 | 108 |
| Sensores del líder | 1243 | 32 |
| Curva de fitness | 1292 | 246 |
| Red del líder | 1355 a 1582 | 358 |
| Biblioteca | 1728 a 1955 | 22 plegada, 303 abierta |
| Avanzado | 1767 a 2274 | 40 plegado, 1242 abierto |

Total: 1774 px al abrir, 2281 con la biblioteca abierta, 3483 con lo avanzado.
El escenario mide 1074×851 y la calle de tres carriles ocupa 120 px (4 m por
carril a 10 px por metro).

**Pestaña El problema hoy:** 1130 px (guía 212, botones 73, indicadores 130,
misiones 147, percepción y acción 372, avanzado 40).

**Crítica** (marco de la skill `design-critique`):

| Hallazgo | Gravedad | Artículo |
|---|---|---|
| Lo que la pestaña enseña (curva y red) queda fuera de la vista al abrir | Crítica | 2 |
| Al mover la mutación no se ve la curva: el control y su efecto no entran juntos | Crítica | 3 |
| Lo primero que se lee son 345 px de texto | Alta | 2, 4 |
| El 89 % del ancho del escenario está vacío mientras el panel desborda | Alta | 10 |
| "Terminó porque" muestra una oración con letra de número (20 px, negrita) y se parte en hasta 3 renglones | Media | 9 |
| Guardar el campeón está dentro de una sección plegada, y su mensaje también | Media | 8 |
| "Autoguardado" se parte en medio de la palabra y el origen la repite | Media | 9 |
| Lo avanzado abierto son 1242 px seguidos | Media | 4, 6 |
| El mentor no puede agrandar la curva ni la red para proyectarlas | Media | 6 |

Lo que funciona y se conserva: tooltips en todo, confirmaciones en línea,
colores con significado, secciones plegables, misiones con barra de progreso,
borde ajustable del panel y atajos visibles en los botones.

**Alternativas comparadas** (el dueño eligió la C):

| | A · Pestañas internas en el panel | B · Capas sobre el escenario | C · Tablero |
|---|---|---|---|
| Art. 2 | Curva y red arriba, en 360 px | Junto a los autos | Grandes y siempre a la vista |
| Art. 3 | Tocar un ajuste tapa la curva | Todo a la vez | Todo a la vez |
| Art. 6 | Poco legible proyectado | Las capas tapan la calle al hacer zoom o paneo | Legible; el panel queda para controles |
| Art. 9 | Fácil de repetir | No sirve con circuitos, que llenan el escenario | Las dos pestañas lo comparten; con circuitos el tablero puede ir abajo |
| Costo | Bajo | Medio | Medio-alto |

Restricciones: sin dependencias ni build; de `src/core` cambia solo el valor
por defecto del modo de tráfico (D15); todo texto sale de los diccionarios;
las pruebas existentes siguen pasando (las únicas que cambian están listadas
en D14).

## Goals / Non-Goals

**Goals:**

- Tres zonas (escenario, tablero, panel) definidas una sola vez en la
  estructura común y usadas por las dos pestañas.
- Tablero sin desplazamiento en 1440×900 y panel de cada pestaña completo a
  la vista en ese tamaño.
- Lógica de zonas, textos y resúmenes en funciones sin DOM, probadas en Node.
- Que el entrenamiento por defecto enseñe a manejar y no a memorizar un
  tráfico, cambiando solo un valor por defecto (D15).
- Ningún otro cambio en el comportamiento del entrenamiento ni del manejo.

**Non-Goals:**

- Plegar el panel entero, modo presentador o pantalla completa.
- Tablero con contenido arrastrable o reordenable.
- Cambiar la paleta, la tipografía base o el sistema de tooltips.
- Preparar el tablero para pestañas que todavía no existen más allá de que
  puedan no usarlo (D1).
- Sacar a la población de la meseta de unos 620 m (D15): necesita su propia
  exploración.

## Decisions

### D1. Tres zonas en la estructura común

`src/ui/app.js` crea, en este orden de DOM (que es el orden de foco):

```
<main class="workspace">
  <section class="stage">      escenario
  <div class="splitter" data-edge="stage">
  <section class="board">      tablero (nuevo)
  <div class="splitter" data-edge="panel">
  <aside class="panel">
```

El contexto de montaje pasa a `{ stage, board, panel, i18n, store, library,
reportError }`. La app limpia `board` al desmontar, igual que `stage` y
`panel`. Después de montar una pestaña, `hasBoard = board.childElementCount >
0`; una pestaña que no agrega nada conserva la disposición de dos zonas.

La disposición se expresa con dos atributos en `.app`, calculados por
`layout.js` (una sola fuente de verdad, no media queries):

- `data-board="on" | "off"`
- `data-layout="wide" | "stacked"`

```
wide + board on          stacked + board on        board off
+-------+--------+-----+  +-----------+-----+       +-------------+-----+
| stage | board  |panel|  |   stage   |     |       |    stage    |panel|
|       |        |     |  +-----------+panel|       |             |     |
|       |        |     |  |   board   |     |       |             |     |
+-------+--------+-----+  +-----------+-----+       +-------------+-----+
```

CSS (grid, sin mover nodos):

- `wide`: `grid-template-columns: var(--stage-width) auto minmax(0,1fr) auto var(--panel-width)`.
- `stacked`: columnas `minmax(0,1fr) auto var(--panel-width)`, filas
  `minmax(0,1fr) minmax(0,45%)`; escenario en (1,1), tablero en (1,2), borde
  del panel y panel ocupando las dos filas, borde del escenario oculto.
- `board off`: columnas actuales; tablero y borde del escenario ocultos.

*Alternativa descartada:* poner el tablero arriba del panel en ventanas
angostas. Obliga a envolver tablero y panel en un contenedor con un solo
desplazamiento y a cambiar qué mueve cada borde según el modo. Debajo del
escenario se resuelve solo con la grilla, y es la disposición que van a
necesitar los circuitos.

### D2. Zonas sin DOM (`src/ui/layout.js`)

Se conservan `PANEL_WIDTH`, `clampPanelWidth` y `maxPanelWidth` (se usan en
`stacked` y sin tablero; sus pruebas no cambian). Se agregan:

```js
export const ZONES = Object.freeze({
  stage: { default: 400, min: 260 },
  board: { min: 360 },
  panel: { default: 360, min: 300, maxFraction: 0.5 },
  splitter: 6,          // px de cada borde
  wideFrom: 960,        // desde este ancho de ventana, tres columnas
  stackedBoard: 0.45,   // fracción del alto para el tablero en "stacked"
  step: 16,
});

layoutMode(windowWidth, hasBoard)   // 'wide' | 'stacked' | 'plain'
fitZones({ stage, panel }, windowWidth)   // -> { stage, board, panel }
stageLimits(panel, windowWidth)     // -> { min, max } al arrastrar su borde
panelLimits(stage, windowWidth)     // -> { min, max } al arrastrar su borde
```

Con `F = windowWidth − 2 × splitter`:

- `fitZones` (al cambiar el tamaño de la ventana o al arrancar; cede primero
  el tablero, después el escenario y por último el panel):
  `panel = clamp(pref.panel, 300, min(floor(W/2), F − 360 − 260))`;
  `stage = clamp(pref.stage, 260, F − 360 − panel)`;
  `board = F − stage − panel`.
- `panelLimits`: `min 300`, `max = min(floor(W/2), F − 360 − stage)`.
- `stageLimits`: `min 260`, `max = F − 360 − panel`.

Arrastrar un borde nunca mueve el otro. Las preferencias guardan lo que la
persona eligió; `fitZones` solo decide lo que se muestra, así al agrandar la
ventana vuelven los anchos elegidos.

Valores de control: en 1440 con todo por defecto, 400 / 668 / 360. En 1000,
268 / 360 / 360. En 960, 260 / 360 / 328.

### D3. Bordes ajustables

La lógica de puntero y teclado que hoy está en `app.js` para el panel se
extrae a una función local `makeSplitter({ node, read, limits, apply, save,
defaultWidth, grows })` y se usa dos veces. `grows` indica hacia qué lado
crece la zona: en el borde del escenario la flecha derecha agranda; en el del
panel, la izquierda (como hoy). Home y End van al mínimo y al máximo, Enter y
doble clic al valor por defecto.

`src/ui/preferences.js` suma `stageWidth` (`mlLab.stageWidth`), con la misma
validación que `panelWidth`. Tooltip nuevo: `help.stage.resize.*`; rótulo
`app.stage.resize`; rótulo del tablero `app.board`.

### D4. Componentes del tablero (`src/ui/board.js`, nuevo)

```js
statStrip(items)   // items: [{ id, labelKey }] -> { node, values: { [id]: HTMLElement } }
boardCard({ id, titleKey, help, hintKey, open, grow, onToggle })
  // -> { node, body, setOpen(open), get open() }
```

- `statStrip`: `<dl class="board-strip">` con `grid-template-columns:
  repeat(n, minmax(0, 1fr))`; rótulo de 12 px, valor de 18 px en negrita con
  `white-space: nowrap` y cifras tabulares. Reemplaza a `.drive-stats` en las
  dos pestañas.
- `boardCard`: `<section class="card" data-open>` con `<h2>` que contiene un
  `<button class="card-title" aria-expanded aria-controls data-help>` y un
  `<div class="card-body">`. Si hay `hintKey`, agrega al final del cuerpo un
  `<p class="guide card-hint">` (se oculta con el interruptor de guía por la
  regla CSS que ya existe para `.guide`).
- Se usa un botón y no `<details>` porque el cuerpo tiene que estirarse con
  flex y `<details>` no reparte el alto de forma fiable entre navegadores.
- La barra espaciadora ya está tomada por el atajo de pausa en las dos
  pestañas (su `keydown` global hace `preventDefault` y devuelve el foco al
  escenario cuando el foco está en un botón); el título se acciona con Enter,
  como el resto de los botones.

CSS:

```
.board { display:flex; flex-direction:column; gap:var(--space-3);
         padding:var(--space-3); min-width:0; min-height:0; overflow-y:auto;
         background:var(--color-bg); border-left:1px solid var(--color-border); }
.card[data-open="true"]  { flex: var(--grow,1) 1 160px; min-height:160px; }
.card[data-open="false"] { flex: 0 0 auto; }
.card-body { flex:1; min-height:0; display:flex; flex-direction:column; }
```

Las clases `.drive-advanced` y `.train-section` se unifican en `.section`
(mismo borde, mismo `summary`) para todas las secciones plegables del panel, y
se agrega `.sr-only` para el título del panel.

### D5. La curva ocupa su tarjeta (`src/ui/chart.js`)

Hoy el SVG tiene un `viewBox` fijo de 320×170 y se escala, con lo que el
texto crece con el ancho. Cambios:

- `createFitnessChart` envuelve el SVG en `<div class="chart-plot">` (flex 1,
  `min-height: 0`) y lo observa con `ResizeObserver`.
- Función pura nueva `chartLayoutFor({ width, height })` → `{ width:
  max(240, width), height: max(120, height), left: 44, right: 10, top: 10,
  bottom: 30 }`. El `viewBox` usa esas medidas, así un píxel del SVG es un
  píxel de pantalla y el texto queda en 11 px (se cambia la regla CSS de 9 a
  11 px).
- `chartModel(history, layout)` ya acepta el `layout`; `draw()` y `onMove()`
  pasan a usar el vigente. `CHART_LAYOUT` se conserva como valor inicial.
- Se redibuja al cambiar el tamaño y, como hoy, al terminar una generación.

### D6. El diagrama ocupa su zona (`src/render/network-view.js`)

- El alto deja de ser el parámetro fijo de 240 px: `resize()` usa
  `container.clientWidth` y `container.clientHeight` (si el alto es 0, 240).
  El contenedor es el cuerpo de la tarjeta menos la leyenda.
- `LAYOUT`: `maxRadius` 9 → 12, `labelLeft` 70 → 76, `labelRight` 78 → 84,
  `minLabelGap` 13 → 14; fuente de los rótulos 11 → 12 px.
- `layoutNetwork` no cambia de firma; sus pruebas usan una zona de 340×240 y
  comprueban que todo entra, así que siguen valiendo.
- La pestaña sigue sin dibujar el diagrama cuando la tarjeta está plegada.

### D7. Escenario angosto (`styles/app.css`)

Con 260 px de ancho, la insignia de generación (arriba a la izquierda) y los
controles de cámara (arriba a la derecha) se pisan. `.stage` declara
`container: stage / inline-size` y, con menos de 360 px, `.stage-badges` baja
a `top: 48px` y `.crash-layer` suma ese margen. No cambia `src/render`.

### D8. Entrenar: tablero

```
+--------------------------------------------------------------+
| Generación      Autos en carrera      Fitness del líder      |
| 107             16 de 100             161 m                  |
| Generación 106: el mejor recorrió 989 m. Terminó porque se   |
| acabó el tiempo.                                             |
+--------------------------------------------------------------+
| v Curva de fitness                                 (grow 1)  |
|   [gráfico]  — Mejor  - - Promedio                           |
|   Generación 106: mejor 989,7 m, promedio 70 m               |
|   (guía) Si la línea sube, la población está aprendiendo...  |
+--------------------------------------------------------------+
| v Red del líder                                    (grow 1.3)|
|   [diagrama]  leyenda                                        |
|   (guía) A la izquierda, lo que percibe el líder...          |
+--------------------------------------------------------------+
```

- Indicadores: `statStrip` con `generation`, `alive` y `leader`.
- Línea de la última generación: `<p class="board-last" role="status">` con
  dos `<span>`, cada uno con su clave, para que el cambio de idioma los
  reescriba sin componer textos a mano. `session.js` suma la función pura
  `lastGeneration(training)` → `null` o `{ best: { key:
  'train.last.best.<unidad>', params: { generation, value } }, reason:
  'train.last.reason.<motivo>' }`. `indicators()` no cambia (sus pruebas
  siguen valiendo); la pestaña deja de usar sus campos `lastBest` y
  `lastReason`.
- Tarjetas: `chart` (grow 1) y `network` (grow 1.3). Su estado sigue en
  `state.settings.showChart` y `showNetwork`, que ya se conservan.
- La nota de la leyenda de la red ("más grueso y más visible…") se conserva
  como texto de la leyenda, en un renglón.

### D9. Entrenar: panel

Orden y alto estimado a 360 px de ancho (328 útiles):

| Bloque | Contenido | Alto (px) |
|---|---|---|
| Título | `<h1 class="sr-only">` | 0 |
| Guía | un párrafo, hasta 240 caracteres | 98 |
| Marcha | renglón 1: Pausar (espacio) · Siguiente (N); renglón 2: Velocidad 1× 2× 4× 8× Máx. (T); renglón 3, botones chicos: Reiniciar · Población nueva; confirmación debajo | 110 |
| Vista | interruptor Sensores del líder | 32 |
| Configuración | Población, Fuerza de mutación, aviso de cambios esperando | 108 |
| Guardar el campeón | campo de nombre y botón en un renglón; mensaje de resultado debajo (`role="status"`) | 58 |
| Misiones | 4 de un renglón | 165 |
| Biblioteca de cerebros (N) | plegada | 40 |
| Avanzado | plegado | 40 |

Suma 651 + 7 separaciones de 16 + 32 de relleno = 795 px ≤ 851.

- **Velocidad en un renglón:** el grupo deja la clase `setting-stacked`; el
  rótulo queda a la izquierda y las cinco opciones a la derecha. La línea del
  factor logrado sigue apareciendo debajo solo en velocidad máxima.
- **Guardar el campeón:** el bloque sale de la sección de la biblioteca. El
  resultado (`library.saved`, `library.updated`, avisos y errores de guardar)
  se escribe en su propia línea de estado, no en `libraryView.showMessage`,
  que queda para importar, renombrar y eliminar. Al continuar un cerebro
  guardado, los dos botones (actualizar y guardar como nuevo) van en un
  segundo renglón.
- **Contador de la biblioteca:** el `summary` usa `library.title.count` con
  `{ value: library.list().length }` y se actualiza con `library.subscribe`.
- **Avanzado por grupos:** dentro de `<details class="section">`, cuatro
  `<details class="group">` (evolución, escenario, red, sensores) con su
  `summary` con tooltip. Fuera de los grupos, arriba el aviso de cambios
  esperando y abajo restablecer con su confirmación. La confirmación de
  entrenamiento nuevo se duplica: una en el grupo de red y otra en el de
  sensores (`applySettings(next, confirm)` ya recibe cuál usar).
- **Estado de lo plegable:** variable de módulo `open = { library, advanced,
  evolution, scenario, network, sensors }`, todo `false` al arrancar; no va
  en `settings` para no mezclarlo con la configuración del entrenamiento.

### D10. El problema: tablero y panel

Tablero:

```
+--------------------------------------------------------------+
| Distancia   Vehículos superados   Intentos   Mejor distancia |
+--------------------------------------------------------------+
| v Lo que perciben los sensores                     (grow 1.4)|
|   [barras de los sensores]            | [barra de velocidad] |
|    0,00  0,12  0,42  0,00  0,00       |        0,65          |
|   (guía) Una barra por rayo, de izquierda a derecha...       |
+--------------------------------------------------------------+
| v Lo que estás accionando                          (grow 1)  |
|   [ ↑ Avanzar ] [ ↓ Retroceder ] [ ← Izquierda ] [ → Derecha]|
|   (guía) Estas cuatro acciones son la salida del problema... |
+--------------------------------------------------------------+
```

- Las barras ocupan el alto libre de la tarjeta (mínimo 64 px, máximo 240).
- La barra de la velocidad va separada a la derecha, con su rótulo
  (`network.input.speed`, el mismo que usa el diagrama de la red) y siempre
  con número. `perception.speed` va de −1 a 1: la barra muestra `max(0, v)` y
  el número, el valor real.
- Números bajo las barras solo con hasta 12 sensores. Función pura nueva en
  `src/tabs/drive/session.js`: `readings(perception, { max: 12 })` → `{
  sensors: number[] | null, speed: number }`, redondeados a dos decimales.
- Dos decimales fijos: `src/ui/i18n.js` suma `formatFixed(value, digits,
  language)` (`Intl.NumberFormat` con mínimo y máximo de decimales iguales y
  sin separador de miles). La pestaña pasa el texto ya formado y lo vuelve a
  escribir en cada cuadro, así sigue al idioma activo.
- El interruptor de sensores deja de ocultar el bloque: solo decide si se
  dibujan los rayos. Se actualiza su tooltip (`help.drive.sensors.*`).
- Estado de las tarjetas: variable de módulo `cards = { perception: true,
  action: true }` en `src/tabs/drive/index.js`.

Panel: título oculto; guía (un párrafo de hasta 240 caracteres y el renglón
de teclas); marcha (renglón 1: Pausar (espacio) · Reiniciar (R); renglón 2,
botón chico: Tráfico nuevo); vista (Sensores · Ver como la máquina); misiones
(3 de un renglón); Avanzado (plegado). Alto estimado: 500 px.

### D11. Biblioteca legible (`src/ui/library-view.js`)

- `brainSummary` agrega `nameKey` (`library.autosave.current` o
  `library.autosave.previous`) para los autoguardados y devuelve `origin:
  'autosave'` para los dos. La vista muestra `nameKey` si existe y, si no, el
  nombre guardado. El nombre que se graba en el cerebro autoguardado y el del
  archivo exportado no cambian.
- Etiquetas: `library.origin.saved` ("Guardado") y `library.origin.autosave`
  ("Autoguardado").
- CSS: `.library-head` pasa a `flex-wrap: wrap`; `.library-name` usa
  `overflow-wrap: break-word` (hoy `anywhere`, que es lo que parte
  "Autoguarda/do") y `min-width: 0`.

### D12. Textos

Textos propuestos. Los largos máximos se comprueban con una prueba sobre los
dos diccionarios (D14); si un texto se pasa, se acorta sin cambiar su sentido.

| Clave | Español | Inglés |
|---|---|---|
| `train.guide` | Cada auto verde lo maneja una red neuronal con números al azar: nadie le enseñó a manejar. Al terminar cada generación, los que mejor manejaron se copian con pequeños cambios (mutaciones) y forman la siguiente. | Each green car is driven by a neural network with random numbers: nobody taught it to drive. When a generation ends, the best drivers are copied with small changes (mutations) to form the next one. |
| `train.chart.hint.new` | Cada generación enfrenta un tráfico distinto: mirá hacia dónde va la línea, no cada punto. | Each generation faces different traffic: watch where the line is heading, not each point. |
| `train.chart.hint.same` | Con el mismo tráfico la línea sube más pareja, pero la población puede estar memorizándolo. | With the same traffic the line climbs more steadily, but the population may be memorizing it. |
| `train.network.hint` | A la izquierda, lo que percibe el líder; a la derecha, los controles que acciona. | On the left, what the leader perceives; on the right, the controls it triggers. |
| `train.next` | Siguiente (N) | Next (N) |
| `train.last.none` | Todavía no terminó ninguna generación. | No generation has finished yet. |
| `train.last.best.meters` | Generación {generation}: el mejor recorrió {value} m. | Generation {generation}: the best drove {value} m. |
| `train.last.best.seconds` | Generación {generation}: el mejor duró {value} s sin chocar. | Generation {generation}: the best lasted {value} s without crashing. |
| `train.last.best.metersPerSecond` | Generación {generation}: el mejor promedió {value} m/s. | Generation {generation}: the best averaged {value} m/s. |
| `train.last.reason.allCrashed` | Terminó porque todos quedaron fuera de carrera. | It ended because every car was out of the race. |
| `train.last.reason.timeLimit` | Terminó porque se acabó el tiempo. | It ended because time ran out. |
| `train.last.reason.stalled` | Terminó porque nadie avanzaba. | It ended because nobody was moving forward. |
| `train.last.reason.requested` | Terminó porque lo pediste. | It ended because you asked for it. |
| `train.mission.distance` | Un auto que recorra {goal} m | A car that drives {goal} m |
| `train.mission.fitness` | Una generación con otro fitness | A generation with another fitness |
| `train.view.title` / `drive.view.title` | Vista | View |
| `train.save` | Guardar | Save |
| `library.title.count` | Biblioteca de cerebros ({value}) | Brain library ({value}) |
| `library.autosave.current` | Entrenamiento en curso | Training in progress |
| `library.autosave.previous` | Entrenamiento anterior | Previous training |
| `library.origin.autosave` | Autoguardado | Autosaved |
| `drive.guide.what` | Este es tu auto (verde) en una calle de {lanes} carriles con tráfico (naranja). Los rayos azules son sus sensores: miden la distancia a un obstáculo. Avanzá sin chocar y mirá el tablero: esos números son todo lo que tendría una máquina. | This is your car (green) on a {lanes}-lane street with traffic (orange). The blue rays are its sensors: they measure the distance to an obstacle. Drive without crashing and watch the board: those numbers are all a machine would get. |
| `drive.guide.keys` | Flechas o W A S D para manejar. | Arrow keys or W A S D to drive. |
| `drive.perception.hint` | Una barra por rayo, de izquierda a derecha: más alta, más cerca el obstáculo. La última es la velocidad. | One bar per ray, left to right: the taller, the closer the obstacle. The last one is the speed. |
| `drive.action.hint` | Estas cuatro acciones son la salida del problema: sí o no, en cada instante. | These four actions are the output of the problem: yes or no, at every instant. |
| `drive.mission.distance` | Recorré {goal} m sin chocar | Drive {goal} m without crashing |
| `drive.mission.machine` | {goal} m viendo como la máquina | {goal} m seeing like the machine |
| `app.board` | Tablero | Board |
| `app.stage.resize` | Ancho del escenario | Stage width |

Tooltips nuevos, con "qué hace" y "por qué importa" en los dos idiomas:
`help.stage.resize`, `help.drive.perception` y `help.drive.action` (títulos
de las tarjetas de El problema), `help.train.advanced.evolution`,
`help.train.advanced.scenario`, `help.train.advanced.network` y
`help.train.advanced.sensors`. Las tarjetas de Entrenar reutilizan
`help.train.chart` y `help.train.network`. Se revisa `help.drive.sensors`
(ya no oculta las barras) y `help.panel.resize` (ahora el panel cede lugar al
tablero).

Claves que dejan de usarse y se eliminan de los dos diccionarios:
`train.guide.what`, `train.guide.generation`, `train.guide.try`,
`train.stats.lastBest`, `train.stats.reason`, `train.reason.*`,
`drive.guide.try`, `drive.perception.caption`, `drive.action.caption`,
`drive.perception.heading`, `library.origin.autosave.current` y
`library.origin.autosave.previous`. Antes de borrar cada una se confirma con
una búsqueda que nadie más la usa.

### D13. Rendimiento

- El lienzo del escenario pasa de 1074×851 a 400×851: menos píxeles por
  cuadro.
- El lienzo de la red pasa de 328×240 a unos 636×380, con las mismas
  primitivas (las líneas se dibujan agrupadas por aspecto); se redibuja una
  vez por cuadro, como hoy.
- La curva se redibuja al terminar una generación y al cambiar de tamaño,
  nunca por cuadro.
- `sync()` sigue escribiendo solo los textos que cambian (`createTextSetter`).
- Al arrastrar un borde, los `ResizeObserver` de la vista, la curva y el
  diagrama disparan por cuadro; cada uno solo cambia el tamaño de su lienzo.
- Criterio: con la configuración por defecto y el tablero completo a la
  vista, al menos 50 cuadros por segundo promediados en diez segundos (el
  mismo de las specs `vista-escenario` y `vista-red`).

### D14. Pruebas

Funciones sin DOM, con `node --test`:

- `tests/layout.test.js` (se agregan casos; los actuales no cambian):
  `layoutMode`, `fitZones` (1440, 1000, 960 y las preferencias fuera de
  rango), `stageLimits`, `panelLimits`.
- `tests/preferences.test.js`: `stageWidth` válido, inválido y sin
  almacenamiento.
- `tests/chart.test.js`: `chartLayoutFor` y `chartModel` con un `layout`
  distinto del inicial.
- `tests/network-view.test.js`: los casos actuales más una zona de 640×380 y
  una de 328×120.
- `tests/train-session.test.js`: `lastGeneration` antes de la primera
  generación, por cada motivo y por cada unidad.
- `tests/drive-session.test.js`: `readings` con 5, 12 y 30 sensores y con
  velocidad negativa.
- `tests/number-format.test.js`: `formatFixed` en los dos idiomas.
- `tests/copy-length.test.js` (nuevo): en `es` y `en`, guías de inicio de
  hasta 240 caracteres (con `{lanes}` reemplazado por 3), renglón de teclas y
  renglones de ayuda de hasta 120, nombres de misiones de hasta 34 (con
  `{goal}` reemplazado por su valor real).
- `tests/training.test.js`: casos nuevos del requisito "Tráfico por
  generación" (D15).

Pruebas existentes que **cambian**, y solo porque cambió la spec que fijan:

- `tests/library-view.test.js` (spec `cerebros`): el origen de un
  autoguardado pasa de `autosave.current` / `autosave.previous` a
  `autosave`, y aparece `nameKey`.
- `tests/training.test.js` y `tests/train-settings.test.js` (spec
  `neuroevolucion`): los casos que comparan la configuración por defecto o
  esperan `trafficMode: 'same'` sin haberlo pedido pasan a esperar `'new'`;
  los que necesitan el mismo tráfico para lo que prueban lo piden de forma
  explícita (D15 los enumera).

Lo que depende del DOM (grilla, bordes, tarjetas, alto del panel) se verifica
en el navegador con las medidas de las specs.

### D15. Tráfico nuevo en cada generación por defecto

**Qué se midió.** Sin navegador, con la configuración por defecto: 50
generaciones con las semillas 1 a 4 en cada modo; después, cada campeón
manejó 60 segundos en 20 tráficos que no vio durante el entrenamiento.

| | Mismo tráfico | Tráfico nuevo |
|---|---|---|
| Mejor fitness durante el entrenamiento | Nunca baja: una semilla queda en 624 m y tres llegan a 1191–1194 m (una estuvo en 629 m hasta la generación 41) | Oscila entre 258 y 894 m |
| Campeón en tráfico nuevo, media | 564 m | 611 m |
| Campeón en tráfico nuevo, llega a 600 m | 38 de 80 (48 %) | 73 de 80 (91 %) |
| Peor caso en tráfico nuevo | 65 m | 240 m |

Con el mismo tráfico, los campeones que llegan cerca del máximo posible
(1194 m en 60 s) son los que peor generalizan: en tráfico nuevo promedian
entre 496 y 612 m, y dos de ellos chocan a los 65 m. Memorizaron un
recorrido.

**Qué cambia.**

- `src/core/training.js`: `DEFAULT_TRAINING_CONFIG.trafficMode` pasa de
  `'same'` a `'new'`. `trafficSeedFor` ya deriva la semilla del tráfico de la
  semilla del entrenamiento y del número de generación, así que la secuencia
  es reproducible sin tocar nada más.
- `src/tabs/train/settings.js` toma su valor por defecto de esa constante;
  restablecer la configuración vuelve entonces a tráfico nuevo.
- El ajuste sigue en el grupo de evolución de la sección avanzada, con sus
  dos opciones en el mismo orden.
- Renglón de ayuda de la curva: `train.chart.hint.new` o
  `train.chart.hint.same` según `training.config.trafficMode`, es decir, el
  modo de la generación en curso y no un cambio que todavía espera.
- Tooltips del ajuste (`help.train.setting.trafficMode`,
  `help.train.trafficMode.same` y `.new`): se revisan para decir cuál es el
  valor por defecto y para qué sirve "el mismo" (mostrar la memorización y
  comparar generaciones con la misma vara).

**Pruebas existentes que fijan el valor anterior** (`tests/training.test.js`):
la comparación de la configuración por defecto; el caso que espera
`world.seed === SCENARIO_TRAFFIC_SEED` sin pedir un modo, que pasa a pedir
`'same'`; y el cerebro cuyo escenario registrado dice `'same'`. En
`tests/train-settings.test.js`: los ajustes por defecto y la normalización de
un modo inválido. El caso "el mejor nunca empeora" ya pide `'same'` de forma
explícita y no cambia.

**Calibración.** `tools/calibrate.mjs` usa la configuración por defecto, así
que pasa a medir con tráfico nuevo. El criterio no cambia: al menos 300 m en
8 de 10 semillas a las 20 generaciones. En la medición de arriba, las cuatro
semillas superan 600 m en la generación 10.

**Qué no resuelve.** En los dos modos la población se estabiliza en unos
620 a 650 m: es lo que recorre en 60 s un auto que va detrás de un vehículo
apenas más rápido que el tráfico (10 m/s). Aprenden a seguir, no a pasar. Con
tráfico nuevo, 60 generaciones y las mismas cuatro semillas, se probaron
cinco ajustes y ningún campeón pasó de 900 m en tráfico nuevo, salvo 5 de 80
con velocidad media:

| Ajuste | Media en tráfico nuevo | Llega a 600 m | Menos de 300 m |
|---|---|---|---|
| Base | 594 m | 70 de 80 | 6 de 80 |
| Fuerza de mutación 25 % | 585 m | 65 de 80 | 4 de 80 |
| Selección 20 % | 611 m | 71 de 80 | 3 de 80 |
| Fitness por velocidad media | 248 m | 7 de 80 | 62 de 80 |
| Lentos: exigir 25 % más que el tráfico | 492 m | 50 de 80 | 24 de 80 |
| Lentos: exigir 50 % más que el tráfico | 264 m | 12 de 80 | 54 de 80 |

Los dos últimos se probaron sobre una copia del núcleo, porque ese umbral no
es configurable. Queda anotado en PENDIENTES.md.

*Alternativa descartada:* dejar "el mismo" por defecto y subir el ajuste a la
configuración básica. La persona que no toca nada seguiría entrenando una
población que memoriza, que es justo el caso que el artículo 4 pide cuidar.

## Risks / Trade-offs

- [El panel de Entrenar entra en 851 px con 56 de margen; un texto más largo
  en inglés lo desborda] → la prueba de largos acota los textos, y la tarea
  de verificación mide `scrollHeight` contra `clientHeight` en los dos
  idiomas. Si no entra, se ajusta el espaciado, nunca se oculta un control.
- [Un escenario de 400 px recorta los rayos largos (hasta 25 largos de auto)]
  → el borde del escenario se agranda hasta dejar al tablero en 360 px, y el
  zoom ya existe.
- [`container` queries en CSS] → las soportan todos los navegadores de
  escritorio actuales; sin soporte, la insignia y los controles de cámara se
  pisan en escenarios de menos de 360 px, sin romper nada más.
- [En 1366×768 el tablero tiene 719 px de alto: indicadores, línea y dos
  tarjetas quedan justas] → las tarjetas tienen mínimo de 160 px y el tablero
  se desplaza antes de aplastarlas.
- [El tablero de El problema tiene poco contenido para su tamaño] → las
  barras crecen hasta 240 px y se suman los números y la velocidad; el resto
  es espacio libre, preferible a un tablero de ancho distinto en cada
  pestaña (artículo 9).
- [Quien ya movió el panel conserva su ancho guardado, que con el tablero
  puede superar el máximo] → `fitZones` lo ajusta al mostrarlo sin tocar la
  preferencia.
- [Se renombran clases CSS compartidas] → se hace en una tarea propia, con
  las dos pestañas verificadas en el navegador antes de seguir.
- [Con tráfico nuevo la línea del mejor fitness sube y baja, y puede leerse
  como que la población desaprende] → el renglón de ayuda de la curva lo
  explica, y el promedio, que se mueve menos, sigue en el gráfico.
- [Con tráfico nuevo la élite ya no garantiza que el mejor no empeore] → es
  el comportamiento correcto y la spec ya lo acota al mismo tráfico; el
  tooltip del ajuste lo dice.
- [La curva sigue sin despegar de los 620 a 650 m y puede parecer que el
  cambio no sirvió] → el cambio mejora lo que el campeón hace en tráfico que
  no vio, no la altura de la curva; la meseta queda documentada en D15 y en
  PENDIENTES.md.

## Migration Plan

Sitio estático sin datos que migrar. La preferencia `mlLab.panelWidth`
existente sigue valiendo; `mlLab.stageWidth` es nueva y opcional. El formato
de los cerebros y la biblioteca guardada no cambian. Vuelta atrás: revertir
los commits del cambio.

## Open Questions

- Pesos de reparto de las tarjetas (1 y 1,3 en Entrenar; 1,4 y 1 en El
  problema): se pueden retocar al verlos en pantalla sin cambiar specs ni
  tareas.
