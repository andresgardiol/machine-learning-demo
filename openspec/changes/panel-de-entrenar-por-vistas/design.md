# Design

## Context

Ver proposal.md para el motivo. Lo que condiciona el diseño:

- El panel de Entrenar se arma en `src/tabs/train/index.js`, que hoy agrega en
  orden: guía, controles de marcha, interruptores de vista, configuración
  básica, guardar, misiones, biblioteca (plegable) y avanzado (plegable, con
  cuatro grupos plegables adentro).
- A 1440×900 el panel mide 851 px de alto y hoy entra justo. Después de
  guardar un cerebro pasa a 916–957 px, según idioma y ancho.
- El escenario mide 400 px de ancho con el tablero a la vista. Arriba ya
  lleva el rótulo de generación a la izquierda y, a la derecha, "Paisaje", los
  dos botones de zoom y "Seguir al auto (V)": ese renglón está completo.
- Las pestañas 1 y 2 arman el selector de pista con un módulo de
  `src/tabs/shared/`; la 3 lo arma como opciones marcables en el grupo de
  escenario.
- Tras un clic en un control, el foco vuelve al escenario para que sigan
  andando los atajos (`returnsFocusToStage` en `src/ui/shortcuts.js`).
- Las pistas tienen identificadores (`straight`, `oval`, `kidney`,
  `grandPrix`) que quedan guardados en los cerebros.

Las alternativas de organización se evaluaron con una crítica de diseño; el
dueño eligió la de vistas con pestañas frente a un cajón sobre el tablero (que
tapa la curva y la red) y a un panel de un solo nivel que se desplaza.

## Goals / Non-Goals

**Goals:**

- Ningún ajuste a más de un nivel de plegado.
- La vista de entrenamiento entra sin desplazarse a 1440×900, también después
  de guardar.
- El selector de pista es un solo componente, en un solo lugar.
- No cambia ningún comportamiento del entrenamiento ni de la biblioteca: se
  mueven controles, no reglas.

**Non-Goals:**

- Rediseñar los paneles de las pestañas 1 y 2.
- Cambiar la lista de cerebros por dentro (datos, acciones, autoguardados).

## Decisions

### D1. Pestañas de vista como componente común

Módulo nuevo en `src/ui/` (por ejemplo `panel-views.js`): recibe las vistas
(`id`, clave del nombre, clave de la ayuda y su nodo) y devuelve la barra de
pestañas y un contenedor. Sigue el patrón de pestañas accesible: `role`
`tablist`, `tab` y `tabpanel`, flechas para moverse, una sola pestaña en el
orden de Tab. Las vistas que no están a la vista quedan con `hidden`, no se
desmontan: así conservan sus valores, sus confirmaciones abiertas y los grupos
desplegados.

- Nombres: "Entrenamiento", "Ajustes" y "Cerebros (n)". En inglés, "Training",
  "Settings" y "Brains (n)".
- La vista elegida se guarda en el estado de la pestaña, como ya se hace con
  las tarjetas del tablero: se conserva al cambiar de pestaña de la app y se
  pierde al cerrarla.
- La barra queda fija arriba del panel; lo que se desplaza, si hace falta, es
  el contenido de la vista.
- Un clic en una pestaña de vista devuelve el foco al escenario, como
  cualquier botón.
- Con teclado, las flechas izquierda y derecha mueven el foco y cambian la
  vista a la vez (activación automática): son tres vistas livianas y ya
  montadas. Inicio y Fin van a la primera y a la última.
- Al dejar una vista se cancelan sus confirmaciones abiertas, como si se
  hubiera elegido cancelar: una confirmación escondida sería un modo
  invisible.
- La barra fija no puede tapar el control con foco: el contenedor de la
  vista usa `scroll-padding-top` igual al alto de la barra.
- El nombre accesible de la pestaña de cerebros incluye la cantidad
  ("Cerebros, 3").

Alternativa descartada: desmontar las vistas ocultas. Obliga a reconstruir
controles y pierde el estado de las confirmaciones.

### D2. Qué va en cada vista

- **Entrenamiento:** guía, controles de marcha (sin cambios), interruptores
  de vista, configuración básica (población, fuerza de mutación, enfriar),
  guardar (D4) y misiones.
- **Ajustes:** aviso de cambios pendientes, los cuatro grupos y restablecer.
  El grupo de evolución arranca abierto y con la función de fitness primero;
  los otros tres, plegados. El grupo de escenario ya no lleva las pistas
  (D5): quedan carriles, densidad, irregularidad y velocidad máxima.
- **Cerebros:** guardar con nombre (D4), importar y la lista.

Los grupos siguen siendo plegables porque, abiertos los cuatro, superan el
alto del panel; lo que se elimina es el nivel de arriba.

### D3. Marca de cambios pendientes

La pestaña "Ajustes" muestra un punto junto al nombre y su nombre accesible
suma "cambios esperando a la próxima generación" mientras `training.pending`
tenga alguna clave que no sea el modo de selección (ese se cambia en la vista
de entrenamiento y ya tiene su propio aviso). La configuración básica conserva
su aviso de siempre.

### D4. Guardar

- **Vista de entrenamiento:** un renglón con un botón y, a su lado, el
  resultado. Sin cerebro asociado: "Guardar campeón" (o "Guardar padre
  elegido" con selección manual); guarda con el nombre sugerido que ya genera
  la biblioteca. Con cerebro asociado: "Actualizar «nombre»", con el nombre
  cortado con puntos suspensivos si no entra. El resultado ("Guardado como
  «Cerebro 3»") ocupa el mismo renglón o reemplaza al texto anterior, con
  `role="status"`, y lleva la acción "Renombrar" (la misma palabra que usa la
  biblioteca), que pasa a la vista de cerebros con ese cerebro en modo
  renombrar y el foco en el campo.
- **Deshacer en lugar de confirmar:** actualizar con un clic pisa el cerebro
  guardado, y con tráfico nuevo el campeón de ahora puede ser peor que el
  guardado. No se pide confirmación: el mensaje de una actualización lleva
  "Deshacer", que restaura la versión anterior. Esa versión se conserva en
  memoria hasta el próximo guardado o hasta salir de la aplicación.
- El mensaje no se va con un temporizador: queda hasta el próximo guardado o
  hasta empezar un entrenamiento nuevo.
- Si guardar falla, el mensaje dice qué pasó y el botón queda disponible.
- **Vista de cerebros:** campo de nombre y "Guardar como nuevo" siempre; con
  cerebro asociado, además, "Actualizar «nombre»". Acá sí pueden ocupar dos
  renglones: la vista tiene todo el alto.
- No cambia qué se guarda ni cuándo: campeón o padre elegido, deshabilitado
  con su explicación si no hay nada que guardar.

Alternativa descartada: dejar el campo de nombre en la vista de
entrenamiento. Es lo que hoy obliga a sumar renglones al guardar.

### D5. Selector de pista en el escenario

Un componente de la vista del escenario, que las tres pestañas configuran:

- `mode: 'single'` (pestañas 1 y 2): elegir una pista la aplica y cierra.
- `mode: 'multi'` (pestaña 3): cada pista se marca o desmarca, el menú no se
  cierra al marcar y la última marcada no se puede desmarcar.
- Cerrado, es un botón con el nombre de la pista a la vista. En modo `multi`
  con más de una marcada, suma cuántas hay: "Óvalo · se alternan 3". Si hay
  un cambio de pistas esperando a la próxima generación, lleva la misma marca
  de pendiente que la pestaña de ajustes.
- Accesibilidad: el botón lleva `aria-haspopup="menu"` y `aria-expanded`; el
  menú, `role="menu"` con opciones `menuitemradio` (simple) o
  `menuitemcheckbox` (múltiple) y `aria-checked`. Las miniaturas van con
  `aria-hidden`. Escape cierra y devuelve el foco al botón.
- El escenario recorta lo que se sale (`overflow: hidden`): el menú tiene que
  entrar dentro del escenario de 400 px o dibujarse fuera de él. Cada opción
  mide 24 px de alto o más.
- Abierto, es un menú con las cuatro pistas: miniatura del trazado y nombre.
  Las miniaturas se dibujan una vez con la línea central de cada pista de
  `src/core/circuits.js`, a 40×28 px, con la misma orientación que en el
  escenario; la de la calle recta es un segmento vertical.
- Ubicación: arriba a la izquierda del escenario, en un segundo renglón,
  debajo de los controles de cámara, porque el primer renglón está completo:
  queda solo para la cámara y el paisaje en las tres pestañas. En Entrenar, el
  rótulo de generación pasa a ese mismo segundo renglón, a la derecha del
  selector. El selector queda en el mismo lugar en las tres pestañas, y el
  rótulo no lo achica ni lo corta: si los dos no entran en el renglón, el
  rótulo baja solo a un tercer renglón, en lugar de encimarse o de cortar
  texto.
- Con el selector en el escenario, el rótulo de generación de Entrenar deja
  de nombrar la pista ("Generación 12" y no "Generación 12 · Óvalo"): el
  selector, justo al lado, ya lo dice.
- Se quitan el selector del panel de las pestañas 1 y 2 y las opciones
  marcables del grupo de escenario de Entrenar. La lógica no cambia: en 1 y 2
  cambiar la pista reinicia el intento; en 3 rige desde la generación
  siguiente y cuenta como cambio pendiente.

### D6. Nombres de las pistas

Solo cambian dos textos por idioma (`track.kidney` y `track.grandPrix`):
"Óvalo con chicana" / "Oval with chicane" y "Circuito de curvas" / "Curves
circuit". "Eses" se descartó por ser jerga de carreras; "chicana" se conserva
porque es la palabra que usa el dueño, con la miniatura y un tooltip que la
explica. Los identificadores no cambian, así que los cerebros guardados no
necesitan migración. Hay que revisar los textos que nombran una pista dentro
de una oración (datos de un cerebro, aviso al cargar un ejemplo) para que
sigan leyéndose bien con nombres de tres palabras.

### D8. Textos

Además de los nombres de las vistas y de las pistas:

| Hoy | Pasa a | Motivo |
|---|---|---|
| "Configuración" (título del bloque de población y mutación) | "Población y mutación" | "Ajustes" pasa a ser la única palabra para lo que se configura |
| "Restablecer la configuración" | "Restablecer ajustes" | Lo mismo; el inglés ya dice "Reset settings" |
| "La fitness" (quién elige al padre) y "la fitness" en dos tooltips | "El fitness" / "el fitness" | Hoy conviven tres usos en femenino y cinco en masculino |
| "Una generación con otro fitness" | "Probá otra función de fitness" | Misiones en imperativo, como "Llegá…" y "Guardá…" |
| "Passed by leader" | "Leader has passed" | Se podía leer como que al líder lo pasaron |
| "A generation with another fitness" | "Try another fitness function" | Igual que en español |

La misión "Un auto que supere 5 vehículos" no cambia: en imperativo no entra
en un renglón.

### D9. Accesibilidad de toda la aplicación

La propuesta se revisó con las skills de diseño de interacción, textos de
interfaz y accesibilidad (WCAG 2.2 AA). La de accesibilidad fue una revisión
de código y de colores, sin lector de pantalla ni herramientas automáticas.
El dueño pidió que este cambio arregle todo lo encontrado.

**Atajos desactivables (criterio 2.1.4, nivel A).**
- Preferencia `shortcuts` (`mlLab.shortcuts`, encendida por defecto) en
  `src/ui/preferences.js`, y un interruptor "Atajos" en el encabezado, junto
  al de guía.
- `shortcutFrom` en `src/ui/shortcuts.js` es el único lugar que decide si una
  tecla es un atajo: con la preferencia apagada, devuelve nada para toda
  tecla de carácter (barra espaciadora y letras). Las flechas no son teclas
  de carácter y siguen manejando el auto; W, A, S y D dejan de hacerlo.
- Los textos de los controles que muestran su tecla tienen una variante sin
  ella ("Pausar (espacio)" / "Pausar"); el control usa una u otra según la
  preferencia y cambia en el momento.
- Alternativa descartada: permitir reasignar cada atajo. Cumple el mismo
  criterio con mucho más trabajo.

**Límites de los controles (1.4.11, nivel AA).**
- Color nuevo `--color-control-border: #74808f` en `styles/tokens.css`.
  Calculado: 4,03:1 sobre el panel (#1b212a), 4,52:1 sobre el fondo (#12161c)
  y 3,51:1 sobre las tarjetas (#242c37).
- Lo usan los campos de texto, el contorno de los grupos de opciones y sus
  divisiones, el riel de los interruptores y de los deslizadores, y los
  botones con contorno. `--color-border` (1,66:1) queda para las líneas que
  solo separan zonas: divisores, bordes de tarjetas y de secciones.
- Una prueba nueva lee los colores de `styles/tokens.css` y afirma los
  contrastes, para que no se pierdan.

**Tooltip alcanzable (1.4.13, nivel AA).**
- El tooltip deja de tener `pointer-events: none`. Al salir el cursor del
  control se espera un momento corto antes de cerrar; si en ese lapso el
  cursor entra al tooltip, queda abierto hasta que sale. Escape sigue
  cerrándolo.
- La separación entre control y tooltip es chica y no hay que cruzar otros
  controles para llegar. La regla de ubicación (`placeTooltip`) no cambia.

**Tamaño mínimo (2.5.8, nivel AA).**
- Primero se mide: un recorrido del DOM de las tres pestañas lista los
  controles accionables de menos de 24 px de alto o de ancho. Después se
  corrige con `min-height` y `min-width`, o con separación, sin cambiar la
  letra. Si alguno no se puede llevar a 24 px sin hacer desplazar un panel,
  se consulta.

**Escenario descrito (1.1.1, nivel A).**
- El escenario lleva `aria-describedby` hacia un texto oculto a la vista que
  cada pestaña actualiza como mucho una vez por segundo, y solo cuando
  cambia. No es una región viva: se lee al llegar al escenario, no sola.
- Contenido: pista, estado (en marcha, en pausa, chocó o terminó) y el dato
  principal de la pestaña (metros en las pestañas 1 y 2; generación y autos
  en carrera en la 3). Con "ver como la máquina", lo dice.

**Lo que esta revisión no cubre.** No se probó con VoiceOver ni con una
herramienta automática. La implementación verifica leyendo el árbol de
accesibilidad del navegador y recorriendo todo con teclado; la prueba con
lector de pantalla queda para el dueño.

### D10. Pruebas

- Lógica sin DOM de las vistas: vista por defecto, vista recordada, nombre
  accesible con y sin cambios pendientes.
- Lógica sin DOM del selector: modo simple y múltiple, última pista marcada,
  texto del botón cerrado.
- Largos de texto: pestañas de vista, nombres de pista y botón de guardar.
- Las pruebas existentes de la pestaña que dependan de dónde está un control
  en el DOM se adaptan; las de comportamiento no cambian.

## Segunda ronda

El dueño revisó la primera ronda en el navegador. Le gustó el panel de
Entrenar en vistas y pidió repensar lo demás: los ajustes de tráfico, red y
sensores seguían escondidos (y los de evolución, que son los que menos usa,
eran los únicos abiertos), las pestañas 1 y 2 seguían con "Avanzado" plegado,
no quería marcar varias pistas ni que el cambio de pista esperara a la
generación siguiente, y quería poder eliminar cualquier cerebro. Las
decisiones D11 a D17 reemplazan lo que indican de D2, D3 y D5.

### D11. Barra de escenario

Los ajustes de la calle y del auto son los mismos en las tres pestañas. En
lugar de repetirlos en cada panel, van en una barra común.

- **Disposición:** `src/ui/app.js` y `src/ui/layout.js` suman una zona entre
  el encabezado y las tres zonas de siempre, a todo el ancho. Cada pestaña
  recibe su contenedor al montarse, igual que el escenario, el tablero y el
  panel. Una pestaña sin escenario la deja vacía y la zona no ocupa lugar.
- **Componente:** un módulo en `src/tabs/shared/` que arma la barra a partir
  de los ajustes de la pestaña y avisa cada cambio con
  `onChange(key, value, { final })`. `final` es falso mientras se arrastra un
  deslizador (solo se actualiza el valor a la vista) y verdadero al soltarlo.
  Reutiliza las definiciones de `street-settings.js` y las miniaturas de
  trazado de la primera ronda.
- **Contenido, de izquierda a derecha:** pista (cuatro opciones a la vista,
  con miniatura y nombre corto, como grupo de opciones excluyentes: una sola
  parada de Tab y flechas para cambiar); tráfico (carriles, densidad,
  irregularidad); sensores (cantidad, alcance, apertura); velocidad máxima;
  y "Restablecer". Cada grupo lleva su rótulo.
- **Control compacto:** nombre y valor en un renglón y el deslizador debajo,
  con un ancho mínimo de 120 px. Presupuesto a 1366 px: pistas 265, carriles
  110, seis deslizadores 720, restablecer 110 y separaciones; entra en un
  renglón de unos 60 px. Con menos ancho, la barra pasa a dos renglones.
- **Qué se quita:** la sección "Avanzado" y su botón de restablecer en las
  pestañas 1 y 2 (`street-advanced.js` deja de armar una sección plegable);
  el selector de pista sobre el escenario de D5 y su menú; los grupos de
  escenario y de sensores de la vista de ajustes de Entrenar. El rótulo de
  generación vuelve a la esquina superior izquierda del escenario, en el
  segundo renglón, donde no se encima con los controles de cámara.
- **Accesibilidad:** la barra es un `role="group"` con nombre "Escenario" y
  un subgrupo por rótulo; las pistas, un `radiogroup`; los nombres cortos
  llevan el nombre completo como nombre accesible y en el tooltip. Usa el
  color de límites y el tamaño mínimo de D9.

Alternativa descartada: dejar los ajustes en cada panel sin plegar. En El
problema entran justo; en Reglas a mano y en Entrenar no entran y quedarían a
un clic en una vista aparte, que es lo que el dueño objetó.

Alternativa descartada: un panel flotante sobre el escenario. Con 400 px de
ancho taparía lo que se quiere mirar al cambiar el ajuste.

### D12. En Entrenar, lo de la barra rige en el momento

- **Núcleo:** `training.restartGeneration()` aplica los cambios de escenario
  que estén pendientes (los demás siguen esperando, porque la población de la
  generación en curso no puede cambiar) y
  vuelve a armar el mundo de la generación en curso con las mismas redes y el
  mismo número de generación. No agrega nada al historial ni cambia el
  campeón, y no toca las elecciones de padre. La semilla del tráfico de esa
  generación no cambia, así que sin cambios de configuración la generación se
  repite igual.
- **Pestaña:** para las claves de la barra (pista, carriles, densidad,
  irregularidad y velocidad), con `final` verdadero se llama a
  `training.configure(...)` y enseguida a `training.restartGeneration()`. No
  quedan como cambios pendientes ni encienden la marca de D3.
- **Pista única:** la pestaña manda siempre una lista de una sola pista. El
  núcleo conserva la lista para que los cerebros ya entrenados alternando
  pistas sigan valiendo.
- **Aviso:** una línea con `role="status"` junto al rótulo de generación dice
  que la generación volvió a empezar; queda hasta que esa generación termina.
- **Sensores:** siguen la regla de entrenamiento nuevo con confirmación. La
  confirmación se muestra pegada a la barra, debajo del grupo de sensores.
- **Lo que sigue esperando** a la generación siguiente: población, mutación,
  enfriamiento y los ajustes de evolución. Reemplaza la lista de D3.

Alternativa descartada: que también los ajustes de evolución rijan en el
momento. Actúan recién al armar la generación siguiente, así que no hay nada
que mostrar antes, y cambiar eso obligaba a tocar más reglas del núcleo.

### D13. Vista de ajustes sin plegables

Dos bloques con título, a la vista: la red (nota de entrenamiento nuevo, capas
ocultas, neuronas de cada capa y activación, con su confirmación) y la
evolución (función de fitness, élite, selección, probabilidad de mutación,
cruce, duración máxima, eliminar a los lentos y modo de tráfico), y al final
"Restablecer ajustes", que restablece la red, la evolución, la población, la
mutación y el enfriamiento; lo de la barra de escenario se restablece con su
propio botón. Se quitan los grupos
plegables y su estado recordado. Con la red de tres capas la vista puede
desplazarse; el bloque de la red, que va primero, se ve entero. Reemplaza el
punto "Ajustes" de D2.

### D14. Autoguardados eliminables

La biblioteca ofrece "Eliminar" también en los dos autoguardados, con la
misma confirmación. El del entrenamiento anterior no vuelve hasta que se
abandone otro entrenamiento. El del entrenamiento en curso vuelve a crearse
al terminar la próxima generación, y su confirmación lo avisa. Renombrar un
autoguardado sigue sin ofrecerse: para conservarlo se lo guarda con nombre.

### D15. Programa recordado con sus sensores

Preferencia nueva `rulesSensors` (`mlLab.rules.sensors`): cantidad, alcance y
apertura, guardados cada vez que cambian el programa o los sensores. Al
abrir:

- Si hay sensores recordados, se usan (normalizados a sus rangos).
- Si hay programa pero no sensores (lo guardó una versión anterior), la
  cantidad es la mayor entre la de por defecto y el sensor más alto que el
  programa nombra; alcance y apertura, los de por defecto.

Así el programa recordado siempre puede manejar al abrir.

### D16. Cambiar la red o los sensores siguiendo un cerebro

La hipótesis anotada en PENDIENTES se confirma al leer el código: la pestaña
conserva el cerebro que se está continuando y lo vuelve a pasar al crear el
entrenamiento nuevo, y en el núcleo ese cerebro manda sobre la red y los
sensores elegidos. Al empezar un entrenamiento nuevo por un cambio de red o
de sensores, la pestaña deja de seguir al cerebro (y de ofrecer actualizarlo)
y arranca una población al azar con los ajustes elegidos. La confirmación lo
dice. Reiniciar y población nueva siguen como hoy.

### D17. Pruebas de la segunda ronda

- Núcleo: `restartGeneration` (misma población, historial intacto,
  reproducible).
- Lógica sin DOM de la barra: qué claves reinician el intento, la generación
  o piden entrenamiento nuevo en cada pestaña, y `final`.
- Biblioteca: eliminar cada tipo de entrada.
- Reglas a mano: sensores recordados, incluido el caso sin sensores.
- Las pruebas de la primera ronda sobre el selector múltiple, la marca de
  pista pendiente y los grupos plegables de ajustes se quitan o se reescriben;
  son de este mismo cambio.

## Risks / Trade-offs

- [La barra le saca unos 60 px de alto a las tres zonas, y la vista de
  entrenamiento de Entrenar tenía 66 px libres] → Se mide; si esa vista pasa
  a desplazarse a 1440×900, se consulta antes de mover controles.
- [La barra no entra en un renglón a 1366 px en algún idioma] → Se mide; si
  no entra, se consulta con las medidas antes de abreviar nombres.
- [Volver a empezar la generación con cada cambio de la barra corta lo que
  se estaba mirando] → Es el efecto pedido: el cambio se ve en el momento. Se
  reinicia una sola vez, al soltar el deslizador, y un aviso lo dice.
- [Se pierde entrenar alternando pistas] → Decisión del dueño. El núcleo lo
  conserva por si se retoma.

- [Los ajustes y la marcha no se ven a la vez] → El escenario y el tablero
  siguen siempre a la vista, que es donde se ve el efecto; la marca de cambios
  pendientes avisa desde cualquier vista.
- [Alguien no descubre las vistas de ajustes y de cerebros] → Las pestañas
  están siempre arriba con su nombre completo; la misión "guardá un cerebro"
  se cumple desde la vista de entrenamiento, y el mensaje de guardado enlaza a
  la de cerebros.
- [El selector tapa parte de la pista en el escenario de 400 px] → Va en la
  esquina superior izquierda, lejos del auto, que se dibuja en la mitad de
  abajo. Se verifica a 400 px; si se encima con algo, se consulta.
- [El menú abierto tapa el escenario un momento] → Es breve y se cierra al
  elegir en modo simple; en modo múltiple se cierra con Escape o un clic
  afuera.
- [El borde más claro cambia el aspecto de toda la aplicación] → Es el
  cambio más visible. La implementación entrega capturas de las tres
  pestañas antes y después para que el dueño lo vea.
- [El interruptor "Atajos" no entra en el encabezado a 1366 px] → Se
  verifica en los dos idiomas; si no entra, se consulta.
- [Llevar todos los controles a 24 px hace desplazar algún panel] → Se mide
  antes y después; si pasa, se consulta.
- [Los requisitos de lector de pantalla se verifican sin lector de pantalla]
  → Se lee el árbol de accesibilidad; la prueba real queda anotada como
  verificación del dueño.
- [Con nombres más largos, algún texto que nombra una pista deja de entrar] →
  La tarea de textos los revisa a 360 px en los dos idiomas.

## Migration Plan

No hay datos que migrar. La vista elegida y los grupos abiertos viven en el
estado de la pestaña y arrancan en sus valores por defecto.
