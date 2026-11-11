# Proposal

## Why

El panel de la pestaña Entrenar tiene todo en una sola columna de 360 píxeles:
con la ventana en 1440×900 mide 1774 píxeles de contenido contra 851 visibles
(2281 con la biblioteca abierta y 3483 con lo avanzado), mientras el escenario
mide 1074 píxeles de ancho y la calle ocupa unos 120. La curva de fitness y la
red del líder, que son lo que la pestaña enseña, recién aparecen a los 1292 y
1355 píxeles, debajo de una guía de 345 píxeles. Eso contradice los artículos
2, 3, 4 y 6 de la constitución. La pestaña El problema repite el defecto en
menor medida (1130 píxeles, con la percepción y la acción cortadas al fondo).
Conviene resolverlo ahora, antes de que las pestañas que faltan copien la
disposición actual.

Hay además un defecto en lo que se aprende, que el tablero vuelve evidente:
por defecto todas las generaciones enfrentan el mismo tráfico, con los mismos
vehículos en las mismas posiciones, y la población lo memoriza. Medido con la
configuración por defecto (50 generaciones, 4 semillas, cada campeón probado
en 20 tráficos que nunca vio): los campeones entrenados con el mismo tráfico
llegan a 600 metros en el 48 % de los tráficos nuevos, y los que lograron el
máximo en su tráfico chocan a los 65 metros en otro; entrenados con tráfico
nuevo en cada generación llegan en el 91 %. El ajuste ya existe en la sección
avanzada; lo que está mal es su valor por defecto.

Concepto que hace visible: **aprender se ve en dos lugares a la vez, en cómo
manejan los autos y en cómo cambian la curva de fitness y la red; el control
que se toca y su efecto tienen que estar a la vista juntos.** Y un segundo
concepto, con el cambio del tráfico: **practicar siempre el mismo examen
enseña a memorizarlo; para aprender a manejar hay que practicar con exámenes
distintos.** El cambio es sobre todo de distribución: hace visibles conceptos
que ya están.

De las tres distribuciones comparadas (pestañas internas en el panel, capas
sobre el escenario y tablero de aprendizaje), el dueño del proyecto eligió el
tablero. La comparación está en design.md.

## What Changes

- **Tres zonas en lugar de dos.** Escenario a la izquierda, un **tablero** al
  centro y el panel a la derecha. El tablero muestra lo que se mide y lo que
  se aprende; el panel queda solo para controles.
- **Tablero de Entrenar:** tres indicadores en un renglón (generación, autos
  en carrera, fitness del líder), una línea con el resultado de la última
  generación y el motivo por el que terminó, y dos tarjetas siempre a la
  vista: la curva de fitness y la red del líder, que se reparten el alto.
- **Tablero de El problema:** los cuatro indicadores del intento en un
  renglón y dos tarjetas: lo que perciben los sensores (barras, ahora con su
  número y con la velocidad como una entrada más) y lo que se acciona.
- **Panel compacto en las dos pestañas:** guía de inicio de hasta 240
  caracteres, controles de marcha agrupados, interruptores de vista juntos,
  misiones de un renglón y secciones plegables con el mismo aspecto. Con la
  ventana en 1440×900 el panel entra completo sin desplazarse.
- **Guardar el campeón a la vista:** el nombre y el botón de guardar salen de
  la biblioteca plegada y quedan siempre visibles, con su mensaje de
  resultado al lado.
- **Avanzado de Entrenar por grupos:** evolución, escenario, red y sensores
  pasan a ser grupos plegables dentro de la sección avanzada.
- **Borde ajustable entre el escenario y el tablero**, además del que ya
  existe para el panel, con su ancho recordado.
- **Ventanas angostas (menos de 960 píxeles):** el tablero pasa debajo del
  escenario para que las tres zonas sigan entrando.
- **Biblioteca legible:** los autoguardados se llaman "Entrenamiento en
  curso" y "Entrenamiento anterior" con la etiqueta "Autoguardado", y ningún
  nombre se parte en medio de una palabra.
- **La curva y el diagrama de la red ocupan su zona**, a lo ancho y a lo
  alto, con texto de tamaño constante.
- **Tráfico nuevo en cada generación por defecto.** El modo "el mismo
  tráfico" sigue disponible en la sección avanzada, para mostrar la
  memorización. El renglón de ayuda de la curva cambia según el modo: con
  tráfico nuevo avisa que cada generación enfrenta un tráfico distinto y que
  hay que mirar la tendencia; con el mismo, que la población puede estar
  memorizándolo.

### Filtro de entrada

| Feature | ¿Qué concepto hace visible? | ¿Se entiende sola? | ¿El mentor puede ignorarla u ocultarla? | ¿Mal uso y vuelta atrás? |
|---|---|---|---|---|
| Tablero | Lo que se mide y lo que se aprende, junto a los autos | Sí: está al lado del escenario y cada tarjeta tiene título, tooltip y, con la guía activa, un renglón de ayuda | Cada tarjeta se pliega; los renglones de ayuda se van con el interruptor de guía | Plegar todo deja el tablero con sus títulos; un clic lo despliega |
| Borde entre escenario y tablero | Ninguno nuevo: reparte la pantalla según lo que se quiera mirar | Igual que el borde del panel, con su tooltip | No hace falta tocarlo | Doble clic o Enter vuelven al ancho inicial; los anchos tienen mínimos |
| Tablero debajo del escenario en ventanas angostas | Ninguno nuevo: conserva las tres zonas | Ocurre solo | No aplica | Agrandar la ventana vuelve a las tres columnas |
| Línea de la última generación | Una generación termina por un motivo, y ese motivo importa | Una oración completa en lugar de un rótulo y un valor | No ocupa lugar extra | No tiene estado |
| Guardar el campeón a la vista | Lo aprendido se puede conservar | Campo con nombre sugerido y botón, con tooltip | Ocupa un renglón; no bloquea nada | Un cerebro guardado se elimina desde la biblioteca |
| Avanzado por grupos | Los ajustes se agrupan por lo que cambian: cómo se evoluciona, dónde, con qué red, con qué sensores | Cada grupo tiene nombre y tooltip | Los grupos recuerdan si quedaron abiertos | Restablecer sigue devolviendo todo a sus valores por defecto |
| Lecturas como números y velocidad como entrada (El problema) | La máquina solo recibe una lista corta de números | El número está debajo de su barra | Se pliega con su tarjeta | No tiene estado |
| Nombres de los autoguardados | Ninguno nuevo: legibilidad | Sí | No aplica | No aplica |
| Tráfico nuevo por defecto y ayuda de la curva según el modo | Memorizar no es aprender: generalizar exige practicar con casos distintos | El renglón de ayuda de la curva lo dice, y el tooltip del ajuste lo explica | El ajuste está en la sección avanzada; el renglón se va con la guía | Elegir "el mismo" hace que la población memorice: se vuelve atrás con el mismo ajuste o con restablecer, y rige desde la generación siguiente |

### A quién sirve

- **Principiante:** ve a la vez los autos, la curva y la red sin desplazarse,
  y lee una guía que entra en cuatro renglones.
- **Mentor:** el tablero se lee proyectado, cada tarjeta se pliega para
  concentrar la atención en la otra, los bordes reparten la pantalla y, con
  la guía apagada, el panel queda reducido a controles.
- Ninguno entorpece al otro: lo que guía se oculta con el interruptor de
  siempre y lo avanzado sigue plegado.

### Fuera de alcance

- Cambios en la simulación, los operadores de evolución, la red o el formato
  de los cerebros. Del núcleo cambia una sola cosa: el valor por defecto del
  modo de tráfico.
- La meseta de unos 620 metros: en los dos modos de tráfico la población
  aprende a seguir a un vehículo apenas más rápido que el tráfico durante los
  60 segundos, en lugar de pasarlo. El tráfico nuevo no la resuelve, y cinco
  ajustes probados tampoco (ver design.md D15). Queda anotada en
  PENDIENTES.md para un cambio propio.
- "Ver como la máquina" en Entrenar y eliminar autoguardados (ideas de
  PENDIENTES.md).
- Plegar el panel entero, modo presentador y pantalla completa.
- Las pestañas que todavía no existen: solo queda definida la disposición
  que van a heredar.
- Celulares y tabletas: la aplicación sigue siendo de escritorio.
- Rediseño de colores o tipografía: se usan los tokens actuales.

## Capabilities

### New Capabilities

- `tablero`: zona central común a las pestañas que muestra lo que se mide y
  lo que se aprende: renglón de indicadores, tarjetas plegables que se
  reparten el alto y renglones de ayuda que dependen del interruptor de guía.

### Modified Capabilities

- `estructura-app`: la disposición común pasa a tres zonas; se agrega el
  borde ajustable entre escenario y tablero, la disposición para ventanas
  angostas y el orden común del panel; cambian los límites del panel
  ajustable y las preferencias recordadas.
- `neuroevolucion`: el modo de tráfico por defecto pasa a ser un tráfico
  nuevo en cada generación.
- `pestana-entrenar`: los indicadores, la curva y la red pasan al tablero;
  cambian la guía, las misiones, el guardado del campeón, la biblioteca y la
  sección avanzada; se agrega que el panel entra sin desplazarse; el estado
  por defecto usa tráfico nuevo y la ayuda de la curva depende del modo.
- `pestana-conducir`: los indicadores, la percepción y la acción pasan al
  tablero; la percepción muestra números y la velocidad; el interruptor de
  sensores deja de ocultar las barras; cambia la guía; se agrega que el panel
  entra sin desplazarse.
- `cerebros`: cambia cómo la lista nombra a los autoguardados y cómo ajusta
  los nombres largos.
- `vista-red`: el diagrama pasa a ocupar el ancho y el alto de su zona.

## Impact

- **Código:** `src/ui/app.js` y `src/ui/layout.js` (zonas, bordes, modo de
  disposición), `src/ui/preferences.js` (ancho del escenario), módulo nuevo
  `src/ui/board.js`, `src/ui/chart.js` y `src/render/network-view.js`
  (tamaño según su zona), `src/ui/library-view.js`, `src/tabs/train/*`,
  `src/tabs/drive/*`, `src/i18n/es.js` y `en.js`, `styles/app.css`.
- **Contrato de pestaña:** `mount(ctx)` recibe además `ctx.board`. Una
  pestaña que no lo usa conserva la disposición de dos zonas.
- **Núcleo (`src/core`):** cambia el valor por defecto del modo de tráfico en
  `src/core/training.js`; nada más.
- **Entrenamientos existentes:** un entrenamiento por defecto ya no repite el
  mismo tráfico, así que su curva deja de ser monótona. Los cerebros
  guardados no cambian: cada uno registra con qué modo se entrenó.
- **Dependencias y build:** ninguna nueva; el sitio sigue siendo estático.
- **Pruebas:** se agregan pruebas de las funciones sin DOM (zonas, textos,
  resumen de la última generación, lecturas, nombres de la biblioteca,
  tráfico por defecto). Cambian solo las pruebas que fijan lo que las specs
  cambian: el origen de los autoguardados y el modo de tráfico por defecto.
- **Herramientas:** `tools/calibrate.mjs` se vuelve a correr con el valor por
  defecto nuevo.
- **Rendimiento:** el escenario se achica y los lienzos del tablero se
  agrandan; se verifica que la fluidez no baje de 50 cuadros por segundo.
