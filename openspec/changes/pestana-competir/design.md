# Design

## Context

Las pestañas 1 a 3 están hechas. El núcleo ya tiene lo que una carrera
necesita:

- `createWorld({ cars: [...] })` admite varios autos sobre la misma pista y el
  mismo tráfico. No se ven ni se chocan entre sí, y cada uno se comporta igual
  solo que acompañado. En un circuito no hay tráfico y cada auto lleva sus
  vueltas.
- Todo lo que maneja cumple el mismo contrato, `control(perception)`: la red de
  un cerebro (`carForBrain`), un programa (`createRulesController`) y el
  teclado (`createKeyboardController`).
- Cada cerebro guarda dónde entrenó: `training.scenarios`, con la pista o las
  pistas (`scenarioTracks`), el tráfico (`trafficMode`: `same` o `new`), los
  carriles, la densidad y la irregularidad.
- El tráfico del modo `same` es siempre el de la semilla
  `SCENARIO_TRAFFIC_SEED`, con los carriles, la densidad y la irregularidad
  del entrenamiento.
- La vista del escenario ya dibuja una población y sigue a un auto con un
  cambio de cámara suave (`render(world, { focus })`).
- La barra de escenario, el tablero (`statStrip`, `boardCard`), los
  interruptores, los tooltips y el ciclo `mount` / `unmount` con estado
  conservado en el módulo son los de las otras pestañas.

No hay todavía nada que corra a varios controladores distintos con un
resultado por cada uno, ni cerebros incluidos con la aplicación. Tampoco hay
forma de que un auto que chocó vuelva a manejar: en el mundo, un choque es
definitivo.

Largos de los circuitos, medidos con el núcleo: óvalo 614 m, óvalo con
chicana 769 m, circuito de curvas 1176 m. La velocidad máxima por defecto es
de 20 m/s, la del tráfico 10 m/s y la aceleración 40 m/s².

**Sin medir:** que los cerebros de ejemplo muestren los contrastes que pide
`cerebros-de-ejemplo`. Es la hipótesis de la que depende la pestaña. Ver D6 y
los riesgos.

## Goals / Non-Goals

**Goals**

- Que abrir la pestaña deje a la persona, con una sola tecla, corriendo
  contra un cerebro y un programa en el mismo problema.
- Que chocar no frustre: el auto vuelve a la pista y la carrera sigue.
- Que ninguna carrera se cuelgue esperando a alguien.
- Que en la pestaña no haya a la vista ningún ajuste que no sirva en ese
  momento.
- Que la tabla por pista deje leer la generalización de un vistazo: resultado
  y si practicó ahí o no.
- Que el mentor arme cualquier carrera con sus cerebros en pocos clics.
- No cambiar el comportamiento de las pestañas 1 a 3.

**Non-Goals**

- Lo listado en "Fuera de alcance" de la propuesta.
- Refactorizar el entrenamiento para compartir código con la carrera.

## Decisions

### D1. La carrera es un módulo del núcleo sobre el mundo de varios autos

`src/core/race.js`, sin DOM y determinista:

```js
createRace({
  track,            // id del catálogo
  seed,             // semilla del tráfico
  lanes, density, irregularity,
  maxSpeed,         // la misma para todos
  crashPenalty = RACE_CRASH_PENALTY,   // segundos; 0,1 por defecto
  competitors: [{ id, controller, sensors }],   // de 1 a MAX_COMPETITORS (6)
})
// → { world, step(), time, goal, finished, waitLeft, results, standings }
```

- Crea un solo mundo con un auto por competidor, en el orden recibido.
- `step()` avanza un paso del mundo y actualiza los resultados. No hace nada
  si la carrera terminó.
- `goal`: `{ kind: 'meters' | 'laps', value, meters }`, la meta de la pista.
- `results[i]`: `state` (`racing`, `arrived`, `unfinished`), `time` (el de
  llegada), `progress` (el mayor alcanzado), `share` (parte de la meta, de 0 a
  1), `crashes`, `penalized` (está cumpliendo la penalización), `laps`,
  `lapTimes`, `bestLap`.
- `standings`: primero los que llegaron, por tiempo; después los demás, por
  mayor progreso. Los empates, por orden de inscripción.
- `waitLeft`: segundos que quedan de espera desde que llegó el primero, o
  `null`.
- Con más de seis competidores, o ninguno, lanza un error con código.

**Vueltas.** El mundo ya cuenta las vueltas de cada auto. La carrera anota una
vuelta nueva cuando ese contador supera el mayor valor que tuvo, con el tiempo
de carrera de ese paso. Cruzar la salida hacia atrás y otra vez hacia adelante
no suma, y reaparecer antes de la línea tampoco. La primera vuelta se mide
desde la largada.

### D1b. Meta de cada pista

`RACE_GOALS`, en el núcleo:

| Pista | Meta | Recorrido | El más rápido, medido |
|---|---|---|---|
| Calle recta | 1000 m | 1000 m | 50 a 52 s |
| Óvalo | 2 vueltas | 1228 m | 58,6 s |
| Óvalo con chicana | 1 vuelta | 769 m | unos 39 s (la mitad de los 78,1 s medidos a 2 vueltas) |
| Circuito de curvas | 1 vuelta | 1176 m | 59,3 s |

**Medido** en la tarea 1.7 con cerebros entrenados para la ocasión y el
programa de 7 sensores. El óvalo con chicana se diseñó a 2 vueltas y medía
unos 80 s, la carrera más larga de las cuatro; quedó en 1 vuelta, la más
corta. El dueño pidió que esa pista no se haga larga. Son cuatro constantes:
se cambian sin tocar nada más.

Quien llega deja de correr: su auto se retira del mundo pasando la meta
(`world.retire`), y su resultado no cambia más.

*Alternativa descartada:* tiempo fijo de 60 segundos y comparar cuánto avanzó
cada uno. Era el diseño anterior. Con la persona corriendo y sin eliminación
por choque, no hay final que esperar ni forma simple de decir quién ganó.

### D1c. Chocar y reaparecer

Cuando un competidor choca:

1. Se suma un choque y queda detenido donde chocó durante `crashPenalty`.
2. Reaparece `RESPAWN_BACK` (dos largos de auto, 8 m) antes del punto del
   choque, sin pasar de la salida, en el carril de salida (el centro, en un
   circuito), mirando hacia adelante y con velocidad 0. No se busca un lugar
   libre: puede reaparecer encimado con un vehículo.
3. Queda **protegido** durante `RESPAWN_GRACE` (2 s): el tráfico no lo choca
   y él pasa a través de los vehículos, también del que chocó. La protección
   no termina mientras esté encimado con uno: termina en el primer paso,
   cumplidos los 2 s, en que no toca ningún vehículo.
4. Los bordes lo chocan siempre, y sus sensores ven todo como siempre.

Es el reaparecer de un juego de carreras: un momento de fantasma para salir
del lío. En esta pestaña los competidores ya son fantasmas entre sí, y el
protegido se dibuja como tal (D11).

Para esto el mundo suma dos cosas, las dos opcionales y sin uso en las
pestañas 1 a 3:

- `world.respawn(index, { progress, protect })`: vuelve a poner el auto en
  la pista, en el carril de salida, a esa distancia, y lo protege del tráfico
  por al menos ese tiempo. Conserva las vueltas del agente.
- Un agente protegido no choca con el tráfico mientras dura la protección.

La penalización se configura en la pestaña (D10), de 0 a 3 segundos. El tope
es menor que los 5 segundos de D1d a propósito: una penalización no puede
dejar a alguien fuera por sí sola.

**Medido en la tarea 1.7** (20 carreras de calle con tráfico nuevo; llegadas,
choques y choques en cadena, que son los que pasan a menos de 1,5 s de
reaparecer):

| Regla | Cerebro tráfico nuevo | Cerebro mismo tráfico | Programa 7 sensores |
|---|---|---|---|
| Centro, protección 1 s | 20/20, 41, 0 | 11/20, 482, 447 | 4/20, 727, 699 |
| Centro, retroceder hasta 32 m libres | 20/20, 134, 0 | 16/20, 246, 0 | 10/20, 358, 0 |
| Carril libre más cercano, sin retroceder | 10/20, 542, 526 | 12/20, 441, 408 | 20/20, 118, 0 |
| Centro, protección 2 s | 20/20, 23, 0 | 20/20, 100, 0 | 20/20, 191, 0 |

- Con 1 s, el auto queda a 5 m del vehículo que chocó y lo vuelve a chocar a
  los 1,38 s, 30 a 45 veces seguidas.
- Retroceder corta las cadenas, pero hace volver a cruzar tráfico ya pasado.
- En el carril de al lado, el cerebro vuelve hacia el centro y le pega al
  costado del mismo vehículo.
- Con 2 s no hay cadenas y los choques ordenan a los competidores como se
  espera: el que aprendió con tráfico nuevo, uno por carrera; el que
  memorizó, cinco; el programa, diez.

La fila de 2 s se midió sin la extensión de la protección mientras hay un
vehículo encimado; **la regla completa todavía no está medida.**

*Alternativa descartada:* reaparecer a la velocidad del tráfico, sin
protección. Evita el choque desde atrás, pero en un circuito no hay tráfico y
habría dos reglas distintas.

### D1d. Quién queda fuera y cuándo termina la carrera

Un competidor queda fuera, como `unfinished` ("no terminó"), cuando pasa lo
primero de:

1. **No avanza:** lleva `RACE_STALL_SECONDS` (5) sin superar su mayor
   progreso. Vale para todos, corran o no los demás. Cubre al que nunca
   arranca, al que va para atrás y al que choca siempre en el mismo lugar.
2. **Se acabó la espera:** pasaron `RACE_WAIT_SECONDS` (20) desde que llegó
   el primero.
3. **Tiempo máximo:** la carrera llegó a `RACE_MAX_SECONDS` (180). Es el
   seguro para el que avanza muy despacio sin que nadie llegue.

La carrera termina cuando no queda nadie en estado `racing`.

El tiempo de la penalización cuenta para los 5 segundos: no hay que
descontarlo, porque el tope de la penalización es 3.

### D2. Semillas del tráfico de la carrera

- **Primera carrera:** `RACE_FIRST_SEED`, fija. Todas las personas ven la
  misma carrera al abrir.
- **Otra carrera, tráfico nuevo:** la siguiente de una serie derivada de un
  contador que vive hasta cerrar la aplicación. Nunca repite una semilla ya
  usada ni usa `SCENARIO_TRAFFIC_SEED`.
- **Tráfico de práctica:** `SCENARIO_TRAFFIC_SEED`, con los carriles, la
  densidad y la irregularidad de la barra.
- **Reiniciar:** la misma semilla.

En la calle recta el tráfico va a la mitad de la velocidad máxima por defecto,
así que en una carrera a 1000 m se pasa a los vehículos que salieron en los
primeros 500 m.

Un cerebro "practicó con este tráfico" si tiene un escenario de calle recta en
modo `same` con los mismos carriles, densidad e irregularidad que la barra. Si
ningún cerebro marcado lo cumple, el panel lo avisa en un renglón: el tráfico
de práctica sin nadie que lo haya practicado no muestra nada.

### D3. Valores por defecto de la carrera: los del entrenamiento

Calle recta, carriles y densidad por defecto, **irregularidad 0** (la de
`DEFAULT_TRAINING_CONFIG`, no el 50 % de las pestañas 1 y 2) y la velocidad
máxima compartida de la aplicación.

Los ejemplos practicaron con filas parejas. Arrancar con 50 % de
irregularidad mostraría a todos chocando, que es otra lección: subir la
irregularidad desde la barra es justamente una prueba de generalización, y
queda a un deslizador de distancia.

"Restablecer" de la barra vuelve a estos valores.

### D4. Quién puede correr

Lógica sin DOM en `src/tabs/compete/competitors.js`. Arma la lista de
candidatos, en este orden:

| Clave | Qué es | Controlador y sensores |
|---|---|---|
| `human` | Vos | `createKeyboardController()`, sensores por defecto |
| `program:seven` | Programa de ejemplo "7 sensores" de Reglas a mano | `createRulesController` con el texto del ejemplo `seven` y sus 7 sensores |
| `program` | Tu programa | `createRulesController` con el programa recordado y sus sensores (`rulesProgram`, `rulesSensors`). Sin programa recordado, el inicial de Reglas a mano |
| `brain:<id>` | Cerebros guardados y autoguardados | `carForBrain` |
| `example:<id>` | Cerebros de ejemplo | `carForBrain` |

Un candidato que no se puede construir (programa con errores, cerebro
inválido) queda deshabilitado con su motivo. Esto no es un ajuste que no
sirve: es un competidor que existe y no puede correr, y la lista explica por
qué.

**Selección por defecto:** `human`, `program:seven` y `example:street-new`,
en ese orden (números 1, 2 y 3). Es la misma para todas las personas: no
depende de la biblioteca ni del programa propio.

El texto del programa de ejemplo se toma en el idioma activo al armar la
carrera; los dos textos son el mismo programa.

*Alternativa descartada:* que el rival por defecto sea "Tu programa". La
primera carrera dependería de lo que la persona dejó escrito en Reglas a
mano, y con un programa con errores no habría rival.

**Número y color.** Cada competidor marcado ocupa una casilla del 1 al 6: la
más baja libre al marcarlo. La conserva mientras siga marcado, aunque se
desmarquen otros. La casilla da el número y el color, iguales en el escenario,
el marcador, la tabla y la lista. Pueden quedar huecos (1, 2, 4): se prefiere
eso a que un auto cambie de número a mitad de una explicación.

### D5. Vos en carrera

"Vos" está marcado por defecto.

- El auto de la persona es el verde de siempre, con su número.
- **La carrera espera en la salida.** Sobre el escenario hay un cartel:
  "Manejás con las flechas", la meta ("Carrera a 1000 m"), un botón "Largar"
  y, con los atajos encendidos, "o apretá espacio". El cartel aparece en cada carrera nueva con "Vos"
  marcado (al abrir, al reiniciar, con otra carrera y al cambiar la pista, el
  tráfico o los competidores). El botón del cartel y el botón principal del
  panel hacen lo mismo.
- **La cámara sigue siempre a la persona mientras maneja**, vaya primero o
  última, y también cuando choca y reaparece: si la cámara se fuera con otro
  auto, chocaría sin verlo. En ese tiempo los nombres del marcador no son
  botones.
- Cuando la persona llega a la meta o queda fuera, ya no maneja: los nombres
  del marcador pasan a ser botones y puede seguir a otro. La cámara no se
  mueve sola. La carrera siguiente vuelve a su auto.
- Las velocidades de simulación no se muestran: se corre en tiempo real.
- Las flechas manejan como en El problema. Con los atajos apagados, las
  flechas siguen manejando: no son atajos de una tecla.

Sin "Vos", la carrera larga sola al abrir la pestaña y al cambiar cualquier
cosa, sin cartel, y el panel muestra las velocidades.

### D6. Cerebros de ejemplo: datos generados por una herramienta

`src/data/example-brains.js` exporta `EXAMPLE_BRAINS`: cuatro cerebros en el
formato del laboratorio (`validateBrain` los acepta), con identificadores
fijos. Su nombre visible sale de los textos de la aplicación, en los dos
idiomas, no del dato.

| Id | Entrenamiento | Nombre (es / en) |
|---|---|---|
| `street-new` | Calle recta, tráfico nuevo en cada generación | Calle, tráfico nuevo / Street, new traffic |
| `street-same` | Calle recta, siempre el mismo tráfico | Calle, mismo tráfico / Street, same traffic |
| `oval` | Óvalo | Solo óvalo / Oval only |
| `all-tracks` | Las cuatro pistas, alternadas | Cuatro pistas / Four tracks |

`tools/train-examples.mjs` (`npm run examples`):

1. Entrena cada uno con los valores por defecto de Entrenar y una lista fija
   de semillas, en orden.
2. De las últimas diez generaciones se queda con el campeón que mejor cumple
   la comprobación de su ejemplo.
3. Comprueba los contrastes de `cerebros-de-ejemplo` con `createRace`, con
   la penalización por defecto: choques y si llega a la meta.
4. Si todos se cumplen, escribe el archivo, con un encabezado que dice la
   semilla, las generaciones y lo medido de cada uno. Si no, termina con error
   y no escribe nada.

El archivo generado se versiona. Una prueba de `npm test` verifica que los
cuatro son válidos y que los contrastes se siguen cumpliendo (es rápida: unas
pocas carreras de alrededor de un minuto simulado).

Los ejemplos no pasan por la biblioteca: no ocupan almacenamiento, no se
exportan, no se borran y no aparecen en Entrenar.

*Alternativa descartada:* entrenarlos en el navegador la primera vez. La
pestaña tardaría minutos en mostrar algo y el resultado dependería de la
máquina.

### D7. Lo que el cerebro sabe de cada pista

`src/tabs/compete/marks.js`, sin DOM:

- `trainedOn(brain, trackId)`: algún escenario con generaciones incluye esa
  pista.
- `sameTrafficOnly(brain)`: tiene escenarios de calle recta con generaciones y
  todos son del modo `same`.

Marcas visibles, cortas, con el texto completo en el tooltip y para lectores
de pantalla:

| Caso | Marca (es / en) | Texto completo |
|---|---|---|
| Entrenó en la pista | practicó / trained | Entrenó en esta pista |
| No entrenó en la pista | no la vio / unseen | Nunca vio esta pista: lo que haga acá muestra si generaliza |
| Calle, solo modo `same` | practicó, 1 tráfico / trained, 1 traffic | Entrenó acá, siempre con el mismo tráfico |

Las dos primeras se distinguen por el texto y por la forma (rellena y con
borde), no solo por el color. El programa y la persona no llevan marca.

### D8. Resultados guardados

`src/tabs/compete/results.js`, sin DOM. Por cada competidor y pista guarda el
último resultado de una carrera terminada; en la calle recta, uno por tipo de
tráfico (nuevo y de práctica). Cada resultado recuerda con qué ajustes se
corrió (carriles, densidad, irregularidad, velocidad máxima y penalización).

- Solo anotan las carreras terminadas. Reiniciar, cambiar de pista o de
  competidores a mitad de carrera no anota nada.
- La tabla muestra las filas de los competidores marcados. Los resultados de
  un competidor desmarcado se conservan y vuelven si se lo marca otra vez.
- Un resultado corrido con otros ajustes que los de la barra se ve atenuado y
  dice "con otros ajustes". No se borra: sigue siendo cierto.
- Un cerebro guardado que cambió (`updatedAt` distinto) o un programa cuyo
  texto cambió pierden sus resultados: ya no son el mismo competidor.
- Un cerebro eliminado pierde sus resultados y sale de la selección.
- Todo vive hasta cerrar la aplicación.

*Alternativa descartada:* vaciar la tabla al tocar la barra. El mentor
perdería lo corrido por mover un deslizador.

### D9. Tablero

De arriba hacia abajo:

1. **Indicadores:** tiempo ("32 s"; con la espera abierta, "32 s · quedan
   14 s"), meta ("1000 m · llegaron 1 de 3") y primero (nombre; al terminar,
   "Ganó …" o "No llegó nadie").
2. **Marcador de la carrera** (tarjeta): una tabla con encabezados. Columnas:
   posición, competidor (número con su color, nombre y tipo), lleva, choques,
   mejor vuelta (solo en circuitos) y estado.
3. **Tabla por pista** (tarjeta): una fila por competidor marcado y cuatro
   columnas con el nombre corto de la pista (el completo, para lectores de
   pantalla). Debajo, un renglón de ayuda con la guía activa.

**Columna "lleva":** en carrera, metros en la calle recta y vueltas con un
decimal en un circuito (`lapsShown`). Si llegó, su tiempo con un decimal.

**Celda de la tabla por pista:**

- Primer renglón, el resultado: "48,2 s" si llegó; "no terminó, 64 %" si no.
- Segundo renglón: los choques ("sin choques", "3 choques") y la marca de D7.
- En la calle recta, un resultado por tráfico corrido, con "nuevo" o
  "práctica" adelante.
- Sin resultado: una raya, con "todavía no corrió" como texto alternativo, y
  la marca igual.

Así la generalización se lee sin interpretar números: llegó o no llegó, en
cuánto y chocando cuánto, donde practicó y donde no.

**Filas del marcador:** el nombre es un botón que hace que la cámara siga a
ese competidor (`aria-pressed` en el seguido), salvo mientras la persona
maneja (D5): ahí es texto. El orden se actualiza como mucho dos veces por
segundo y moviendo las filas, sin recrearlas, para no perder el foco ni
marear.

**Anuncios** en una región `role="status"`: la llegada del primero ("Llegó
…. Quedan 20 segundos.") y el fin de la carrera ("Terminó la carrera. Ganó
…."). No se anuncian los cambios de orden, los choques ni cada segundo de la
cuenta.

Las dos tarjetas se pliegan como las de las otras pestañas.

### D10. Panel

Una sola vista, sin pestañas internas ni secciones plegables, en este orden:

1. Guía (con la guía activa).
2. Carrera: botón principal (Largar / Pausar / Reanudar; al terminar, "Otra
   carrera"), "Reiniciar" y "Otra carrera". Sin "Vos" marcado, también las
   velocidades de simulación.
3. Tráfico de la carrera: "Nuevo" | "De práctica" (dos opciones a la vista).
   Solo en la calle recta.
4. Penalización por choque: un deslizador de 0 a 3 s, de a 0,1 s, con 0,1 por
   defecto. Actúa al soltar y empieza otra carrera.
5. Interruptores de vista de las otras pestañas: sensores y ver como la
   máquina.
6. Competidores: lista con casillas, con el número y el color del que está
   marcado, el tipo y, en los cerebros, dónde entrenó en una palabra. La lista
   se desplaza por dentro y muestra al menos seis filas.
7. Misiones (con la guía activa).
8. "Borrar resultados".

**Lo que no sirve no se muestra** (pedido del dueño del proyecto): un ajuste
sin efecto en la situación actual desaparece y la lista de competidores ocupa
su lugar. Vale para las velocidades con "Vos" marcado, el tráfico de la
carrera en un circuito, la columna de mejor vuelta en la calle recta y el
grupo de sensores de la barra (D12). Los valores elegidos se conservan para
cuando el ajuste vuelve.

**Sin medir:** que todo entre en 746 px de alto (lo disponible a 1440×900,
medido en Entrenar). El caso más alto es la calle recta sin "Vos": la cuenta
a mano da unos 730 px con la penalización, casi sin margen. Si no entra, la implementación se detiene a consultar.

### D11. Escenario

`render(world, …)` suma una opción `competitors`: por cada auto, su color, su
número y su estado (corriendo, penalizado, protegido o ya sin correr).

- Cada competidor se dibuja con su color. El número va en una insignia de
  tamaño fijo en pantalla, junto al auto, para que se lea con cualquier zoom.
- El seguido se dibuja último, con sus sensores si están encendidos.
- Un auto que chocó muestra la marca de choque mientras dura la penalización
  y después se lo ve en su nuevo lugar. Durante la protección se dibuja como
  un fantasma: translúcido y con el contorno punteado, no solo con un
  parpadeo.
- Los que ya no corren (llegaron o no terminaron) quedan atenuados donde
  están.
- **Meta:** en la calle recta, una franja a cuadros que cruza todos los
  carriles a la distancia de la meta. En un circuito, la línea de salida se
  dibuja a cuadros: es también la de llegada.
- Colores: seis variables nuevas en `styles/tokens.css`
  (`--color-competitor-1` a `-6`). Tienen que tener contraste de 3:1 contra la
  calle, distinguirse entre sí y no confundirse con el naranja del tráfico ni
  con el rojo del choque. El verde queda para "Vos". Como seis colores no
  alcanzan a distinguirse para todas las personas, **el número es la
  identificación principal y el color, la secundaria.**
- Con "Vos" en carrera, la cámara sigue a la persona (D5). Sin "Vos", sigue
  al primero entre los que siguen en carrera; si no queda ninguno, al de mayor
  progreso. El cambio de auto usa la transición suave que ya existe.
- El cartel para largar (D5) va centrado sobre el escenario, sin tapar la
  línea de salida ni los autos.
- La cuenta de la espera se ve también sobre el escenario ("Quedan 14 s"),
  porque la persona que maneja mira ahí y no el tablero.
- La descripción en texto del escenario dice la pista, la meta, cuántos
  corren, quién va primero y a quién se sigue.

### D12. La barra en Competir

- `scenarioBar` suma una opción con los grupos que la pestaña no usa. Esos
  grupos no se crean: no quedan ocultos con un hueco ni en el orden del foco.
  Competir no usa los sensores.
- "Restablecer" en Competir no toca los sensores de ninguna pestaña.
- `barEffect('compete', clave)` devuelve `newRace` para la pista, el tráfico
  y la velocidad. Los deslizadores actúan al soltar, no mientras se arrastran.
- Una carrera nueva por un cambio de la barra usa la misma semilla que la
  carrera en curso si el tráfico es de práctica, y una nueva si no.
- En un circuito, los ajustes de tráfico de la barra siguen como en las otras
  pestañas: a la vista y deshabilitados. Quitarlos cambiaría la barra de las
  cuatro pestañas y movería los controles de lugar al cambiar de pista; queda
  fuera de este cambio y anotado como pregunta abierta.

### D13. Estado y ciclo de vida

Como en Entrenar: el estado vive en el módulo y se conserva entre montajes
(selección, ajustes, tipo de tráfico, resultados, contador de semillas,
penalización, misiones cumplidas y competidor seguido). `unmount` pausa la carrera. Al
montar, la lista de candidatos se vuelve a armar con la biblioteca y el
programa actuales, y se aplican las bajas de D8.

### D14. Atajos

Los de las otras pestañas, con el mismo interruptor "Atajos": espacio (largar,
pausar o reanudar; con la carrera terminada, otra carrera), R (reiniciar), N
(otra carrera), E (sensores), V (ver como la máquina). Con "Vos" en carrera, las flechas manejan y no cambian de control
cuando el foco está en el escenario.

### D15. Misiones

`src/tabs/compete/missions.js`, sin DOM. Se evalúan al terminar cada carrera:

1. **Las cuatro pistas:** pistas distintas con una carrera terminada, de 4.
2. **Fuera de lo que practicó:** un cerebro chocó al menos una vez en una
   pista donde no entrenó.
3. **Ganarle a un cerebro:** "Vos" llegó a la meta y quedó por delante de al
   menos un cerebro.

### D16. Textos

Voz de la aplicación: voseo, frases cortas, sin jerga. Los nuevos, en español
(el inglés, equivalente):

- Guía: "Corré contra un cerebro y un programa. Son fantasmas: no se chocan
  entre sí. Cada uno maneja con lo que aprendió o con sus reglas. Cambiá de
  pista y mirá en la tabla quién sigue andando donde nunca practicó."
- Ayuda de la tabla: "Rendir donde no practicó es generalizar. Rendir solo
  donde practicó es sobreajustar."
- Cartel para largar: "Manejás con las flechas. Carrera a 1000 m." (o "a 2
  vueltas"). Botón: "Largar". Con atajos: "o apretá espacio".
- Espera: "Quedan 14 s".
- Penalización: "Penalización por choque", valor "0,1 s".
- Aviso del tráfico de práctica sin nadie: "Ninguno de estos competidores
  practicó con este tráfico."
- Estados: "en carrera", "llegó", "no terminó".
- Choques: "sin choques", "1 choque", "3 choques".

## Risks / Trade-offs

- **[Hipótesis] El que memorizó puede no chocar más en un tráfico nuevo.**
  Con filas parejas, un cerebro entrenado con un solo tráfico puede
  generalizar igual, y el contraste con `street-new` no aparece. → La herramienta lo
  comprueba antes de guardar. Si no se cumple con ninguna semilla, la
  implementación se detiene a consultar con lo medido. Salidas posibles:
  entrenarlo con menos generaciones, con tráfico irregular o aceptar un
  contraste más chico.
- **[Hipótesis] El de las cuatro pistas puede no aprender las cuatro.** No se
  midió un entrenamiento alternando cuatro pistas. → Misma comprobación y
  misma consulta. Salida posible: alternar dos pistas (calle recta y óvalo),
  que es lo que sí se midió.
- **[Sin medir] El de solo óvalo en la calle recta.** Puede esquivar tráfico
  sin haberlo visto nunca, o chocar enseguida. Cualquiera de las dos sirve
  para la explicación; la spec no exige una.
- **[Medido] En un circuito, los cerebros de la calle no fallan.** Los dos
  cerebros de la calle y el programa de 7 sensores llegan sin chocar en los
  tres circuitos, que nunca vieron: para ellos una curva es un borde más. →
  La tabla va a mostrar "no la vio" y "llegó sin chocar": es generalización
  de verdad, y hay que contarla así. El fracaso por no haber practicado se ve
  al revés: el cerebro del óvalo en la calle recta llegó 0 de 20 veces.
- **[Sin medir] Los cerebros nunca reaparecieron.** En el entrenamiento un
  choque es el final; ninguna red vio qué pasa después. Reaparece detenida en
  el centro, que se parece a la salida, así que debería arrancar igual. → Se
  comprueba al medir los ejemplos; si un cerebro queda trabado al reaparecer
  en un lugar por el que pasaría bien, la implementación se detiene a
  consultar.
- **El protegido atraviesa vehículos a la vista.** Es el precio de que nadie
  quede trabado; las otras tres reglas medidas fallaron (D1c). → Se dibuja
  como fantasma para que se entienda, y dura 2 segundos.
- **Chocar puede convenir.** Con penalización de 0,1 s y 2 s de protección,
  embestir cuesta poco: el programa de 7 sensores llega 20 de 20 veces con 10
  choques por carrera. → El marcador y la tabla muestran los choques junto al
  tiempo, y la penalización se puede subir. La sub-sesión informa cuántas
  veces gana el que más choca.
- **[Sin medir] Las metas.** Los tiempos de D1b son cuentas. Si una carrera
  típica dura mucho más de un minuto, se consulta con lo medido.
- **La regla de los 5 segundos también vale para la persona.** Si se queda
  quieta o retrocede 5 segundos, queda fuera. → Es el mismo criterio para
  todos y basta apretar espacio para otra carrera; si molesta al probarlo, se
  consulta.
- **20 segundos pueden ser pocos para la persona.** Un cerebro bueno llega
  bastante antes que alguien que maneja por primera vez. → Lo que llevaba
  queda anotado ("no terminó, 80 %"). Es una constante.
- **Con penalización baja, chocar casi no cuesta.** Un cerebro que va a fondo
  y choca seguido puede llegar antes que uno prudente. → La tabla muestra los
  choques junto al tiempo, y subir la penalización cambia quién gana: es una
  buena demostración, no un defecto.
- **La primera impresión pide manejar.** Con "Vos" por defecto, nada se mueve
  hasta largar. → El cartel con el botón y la tecla está sobre el escenario;
  desmarcar "Vos" deja la carrera andando sola.
- **[Pendiente conocido] El programa de 7 sensores solo anda bien con la
  velocidad por defecto.** Con otra velocidad en la barra rinde peor. → No se
  arregla acá (está en `PENDIENTES.md` para el final); la celda dice "con
  otros ajustes".
- **Seis colores no alcanzan para todas las personas.** → Número siempre
  visible (D11).
- **Celdas densas en un tablero angosto.** Resultado, estado y marca, y dos
  resultados en la calle. → Marcas de una o dos palabras y nombres cortos de
  pista. Si no se lee a 360 px, la implementación se detiene a consultar.
- **Los ejemplos envejecen.** Si cambia la física o los sensores por defecto,
  dejan de manejar como al guardarlos. → La prueba de los contrastes corre en
  `npm test` y avisa; se regeneran con `npm run examples`.
- **El mundo cambia para todos.** `respawn` y la protección se suman al
  mundo que usan las pestañas 1 a 3. → Son opcionales y sin uso ahí; las
  pruebas de reproducibilidad de esas pestañas tienen que seguir pasando sin
  tocarlas.
- **Velocidad máxima distinta de la del entrenamiento.** La barra pone la
  misma para todos; un cerebro entrenado a 20 m/s corre a 30 si así está la
  barra. → Es una prueba de generalización más, y la celda dice "con otros
  ajustes" cuando cambia.

## Migration Plan

No hay datos que migrar. La pestaña pasa de "no disponible" a disponible al
registrarse en `src/main.js`. Los textos `help.tab.compete.soon.*` se
reemplazan por los de la pestaña.

Vuelta atrás: quitar el módulo de `TABS`. Nada de las otras pestañas depende
de lo nuevo, salvo la opción de la barra para no mostrar un grupo, que sin uso
no cambia nada.

## Open Questions

- ¿El tráfico de la barra también tiene que desaparecer en un circuito? Hoy
  se ve deshabilitado en las cuatro pestañas. Si se quiere, es un cambio
  aparte de `barra-escenario`.
- ¿Los contrastes de los ejemplos se cumplen con los valores por defecto? Se
  responde en el grupo 2 de las tareas, antes de construir la pestaña.
- ¿Las metas de D1b dan carreras de alrededor de un minuto? Se mide en la
  tarea 1.7.
- ¿Los cerebros manejan bien al reaparecer? Se mide en la tarea 1.7, antes de
  entrenar los ejemplos.
- ¿Cuántas generaciones necesita cada ejemplo? Lo fija la herramienta al
  medir; el diseño parte de 60, lo que se midió para la calle y el óvalo.
