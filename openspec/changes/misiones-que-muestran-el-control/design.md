# Design

## Context

- La tarjeta de consigna (`src/tabs/shared/consigna-card.js`) muestra la misión en curso con `setMission(view)`. La misión la elige `currentMission()` (`src/ui/current-mission.js`). Cada pestaña describe sus misiones con `describeMission(m)`.
- Las misiones viven en la sesión de cada pestaña, con un `id` estable: `drive` pass, distance y machine; `rules` pass, passMany y traffics; `train` generations, passed, save y fitness; `compete` tracks, unseen y beatBrain; `inspect` follow, decision y off; `lab` gateAnd, gateOr, gateXor, follow, memorize y save.
- Entrenar reparte el panel en vistas con `panelViews` (`src/ui/panel-views.js`). Las demás pestañas tienen una sola vista.
- `styles/app.css` ya tiene bloques `@media (prefers-reduced-motion)`. `sin-destellos-en-la-red` fija el tope de tres cambios grandes por segundo.
- En Inspeccionar y en el Laboratorio, elegir una neurona oculta la tarjeta (`tarjeta-de-consigna`, requisito "Tarjeta al elegir…").
- El foco visible es el contorno de 2 px de `--color-accent`. La opción elegida usa `--color-selected-border`, el mismo azul.

El estado de partida está en `borradores/misiones-que-muestran-el-control/antes/medidas.md`: dónde está hoy cada control y si se ve sin desplazar ni cambiar de vista.

## Goals / Non-Goals

**Goals:**
- Que la tabla misión → control viva en un solo lugar, probada sin DOM.
- Un único mecanismo de "mostrar un control", reutilizable después por el recorrido guiado.

**Non-Goals:**
- Que "Mostrame" haga la acción por la persona: nunca toca el control.
- Explicar con texto qué hacer con el control.

## Decisions

### D1. La tabla: `src/ui/mission-targets.js`

`missionTarget(tab, missionId, state)` devuelve `null` (sin botón) o `{ targets: [<clave>…], view?, select? }`.

- **Claves.** Cada `<clave>` es un nombre estable de control (`'machineView'`, `'fitness'`, `'track'`, `'step'`, `'firstWeight'`…), no un selector de CSS.
- **El estado.** `state` lleva lo mínimo que hace falta para decidir: en el Laboratorio, `gate` (la compuerta elegida) y `hiddenLayers`, para OR y XOR, y `addHidden`, si "Agregar una capa oculta" está a la vista.
- **XOR antes de la explicación (decisión de implementación, a confirmar con el dueño).** "Agregar una capa oculta" aparece recién cuando la guía explica que una recta no alcanza (5 cambios a mano o 50 épocas). Antes de eso, con XOR y sin capa, la tabla devuelve el primer peso, que es lo que la guía pide probar. Así el botón nunca lleva a un control que no existe.
- **El foco.** El primer control de `targets` recibe el foco: Paso va antes que «De a: Operación» y que «De a: Fase».
- **Cómo se prueba.** `tests/mission-targets.test.js` afirma tres cosas:
  - cada misión de cada pestaña tiene una entrada;
  - las que la spec marca "—" devuelven `null`;
  - mismo estado, mismo resultado.

*Por qué claves y no selectores:* la tabla se prueba en Node y sobrevive a cambios de clases. Cada pestaña traduce sus claves a nodos.

### D2. El mecanismo: `src/ui/reveal.js`

`revealControls(nodes, { i18n, label, reducedMotion })`:

1. Hace `scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' })` sobre el primero.
2. Pone `data-revealed="true"` en cada nodo.
3. Le pasa el foco al primero. Si no es enfocable, al primer control que tiene adentro.
4. Escribe en una región `aria-live="polite"`, que ya existe o se crea una vez, "Se muestra: <label>".
5. Saca la marca a los 4 s, o antes con el primer `pointerdown` o `keydown` que no venga del propio botón.

Antes de llamarlo, cada pestaña resuelve lo que la tabla pide:

- `view`: en Entrenar, `panelViews` cambia a esa vista.
- `select`: en Inspeccionar, elegir la primera entrada o la primera neurona oculta. Usa la misma función que el clic.

Después, en el cuadro siguiente, la pestaña busca los nodos (`requestAnimationFrame`), porque cambiar de vista o elegir rehace el DOM. Lo hace `src/tabs/shared/mission-reveal.js`, igual para las seis pestañas.

**Decisiones de implementación a confirmar con el dueño** (no estaban en los artefactos):
- *Inspeccionar, "Cambiá una decisión a mano":* el valor a mano solo existe en pausa. Para que haya un control que mostrar, "Mostrame" pausa antes de elegir la entrada. No cambia ningún valor ni el resultado; se vuelve con Reproducir.
- *Reglas a mano, el editor:* si la tarjeta del programa está plegada, "Mostrame" la abre para traerlo a la vista, como si la persona la abriera.
- *Laboratorio, XOR antes de la explicación:* ver D1.
- *El nombre que se anuncia* es corto: el rótulo del grupo (Pista, Función de fitness, Cantidad) o el nombre del control con el foco (el editor: "Programa del auto"). El texto visible de un grupo entero leía todas las opciones.

### D3. El anillo

- **Estilo.** `[data-revealed="true"]` lleva `outline: 3px solid var(--color-reveal); outline-offset: 3px`, más un `box-shadow` del fondo entre medio, para que se separe del contorno de foco, que va adentro.
- **El color, `--color-reveal`.** Va en `#rrggbb`. Tiene que distinguirse de `--color-accent` (el foco y la opción elegida) y dar 3:1 o más sobre `--color-bg`, `--color-surface`, `--color-surface-2` y `--color-card-bg`. Se parte del amarillo de "en curso" de la red (`--color-network-current`, `#f4e04d`), que ya significa "esto es lo que toca ahora". Se mide en `tests/control-contrast.test.js`.
- **Movimiento.** Aparece con una transición de opacidad de 150 ms y se va con otra de 300 ms. Con menos movimiento, sin transición. No hay animación en bucle: cumple el tope de `sin-destellos-en-la-red`.

*Cambio al implementar:* el anillo es un `box-shadow` (`0 0 0 4px var(--color-bg), 0 0 0 7px var(--color-reveal)`), no un `outline`. El foco ya es un `outline`, y un elemento tiene uno solo: con dos `outline`, uno tapaba al otro. La transición es del `box-shadow`, no de la opacidad, con los mismos 150 y 300 ms. Sobre los elementos de SVG no se dibuja, pero ninguno de los controles de la tabla lo es.

*Alternativa descartada:* un latido o un parpadeo para llamar la atención. Choca con "sin destellos", y el foco ya lleva la vista ahí.

### D4. El botón en la tarjeta

- `setMission(view)` suma `view.reveal`, un booleano. Con `true`, la línea de la misión muestra `<button class="tool small">` "Mostrame", con su `data-help`.
- La línea de la misión es un renglón denso dentro de la tarjeta, así que el botón usa la altura compacta, como las filas de la lista de competidores. Es una excepción a anotar en `jerarquia-visual` si la revisión del sistema de diseño no la cambia. Es una acción secundaria: nunca la principal.
- El botón lleva la clase `guide`, como la misión, así que se oculta con la guía sin código propio.
- Al tocarlo, la pestaña llama a `missionTarget()` con la misión en curso y después a `revealControls()`.

### D5. Textos

| Clave | Español | Inglés |
|---|---|---|
| `mission.reveal` | Mostrame | Show me |
| `help.mission.reveal.what` | Lleva al control con el que se cumple esta misión y lo marca un momento. | Takes you to the control that completes this mission and marks it for a moment. |
| `help.mission.reveal.why` | Para encontrar qué tocar sin buscar por todo el panel. | So you can find what to touch without searching the whole panel. |
| `mission.revealed` | Se muestra: {control} | Showing: {control} |

El `{control}` sale del texto visible del control, o de su nombre accesible.

## Risks / Trade-offs

- **El botón suma algo a la tarjeta**, cuando el dueño pidió menos información. Es uno solo y solo aparece con las misiones que tienen control: 18 de las 22 filas de la tabla (corregido en la implementación; antes decía 11). Es compacto. Se mide en el después que la tarjeta siga entrando entera a 1366×768. Si no, parar y consultar.
- **Elegir una neurona en Inspeccionar oculta la tarjeta**, así que el botón desaparece después de tocarlo. Se acepta: el foco ya está en el control. Al soltar la elección, la tarjeta vuelve.
- **Que el control no exista en ese momento.** Por ejemplo, "Agregar una capa oculta" solo existe con XOR. La tabla depende del estado (D1). Si igual no aparece un nodo, el botón no hace nada visible: se anota en la consola de desarrollo y se cubre con una prueba de que toda clave tiene su nodo en cada pestaña, en el navegador.
- **El amarillo también es el del competidor 3** en Competir, en la escena. El anillo está en el panel o en la barra, no en la escena, así que no se cruzan. Se anota.
- **Pendiente para la revisión del sistema de diseño:** el color del anillo y el botón compacto en la tarjeta.

**Rendimiento.** No toca el bucle de simulación ni el de dibujo. `revealControls` corre solo al tocar el botón. Saber si la misión en curso tiene control es una búsqueda en una tabla chica, en el `sync()` que ya existe.

**Núcleo y dependencias.** `mission-targets.js` vive en `src/ui/` y no usa el DOM. `reveal.js`, en `src/ui/`, usa el DOM. Nada del núcleo cambia y no hay dependencias nuevas.

## Migration Plan

No hay datos que migrar. Para volver atrás se revierte el cambio.
