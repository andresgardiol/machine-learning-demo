# Machine learning demo

Un laboratorio interactivo para entender machine learning jugando, con un
autito como hilo conductor. Está pensado para dos públicos: el curioso sin
conocimiento previo, que lo usa solo, y el mentor, que lo usa para enseñar.
El proyecto se rige por [`CONSTITUCION.md`](CONSTITUCION.md).

JavaScript, HTML y CSS sin frameworks ni dependencias de terceros, sin paso de
build. El sitio es 100 % estático.

## Cómo ejecutar

Requiere Node 24 (la versión con la que se desarrolló y probó). Los módulos ES no
cargan al abrir `index.html` con doble clic: hace falta un servidor.

```bash
npm start
```

Después abrí <http://localhost:8000>. Otro puerto: `PORT=3000 npm start`.

## Cómo probar

```bash
npm test
```

Usa el ejecutor incluido en Node (`node --test`). No abre ningún navegador. La
interfaz se verifica a mano en el navegador.

## Cómo medir el rendimiento del núcleo

```bash
node tools/bench.mjs
```

Simula 100 autos durante 3600 pasos (60 segundos simulados) en Node y dice
cuántas veces el tiempo real se logra. El objetivo es superar 20 veces. Mide
dos casos: 100 redes al azar, como la primera generación de un entrenamiento,
y el peor caso para el costo por paso, con los 100 autos en carrera los 60
segundos y tráfico al alcance de sus sensores.

Resultado obtenido (Node 24.2, macOS en Apple Silicon, peor de 5 corridas):

| Caso | Tiempo | Factor sobre el tiempo real |
|---|---|---|
| Redes al azar | 387 a 415 ms | 144,5× |
| Todos en carrera | 502 a 520 ms | 115,5× |

No hace falta un índice espacial para sensores y choques.

Tasa de cuadros de la pestaña «Entrenar» a velocidad normal, medida en el
navegador durante 10 segundos (Apple Silicon, pantalla de 180 Hz): 180 cuadros
por segundo con 100 autos y 180 con 500, también con cambios de generación
cada 2 segundos (objetivo: 50 y 30). Un cambio de generación con 500 autos
tarda de 4 a 6 ms; un paso, 0,75 ms, y un dibujo, 0,65 ms. Con el diagrama de
la red visible y la configuración por defecto: 180 cuadros por segundo
(objetivo: 50); dibujar el diagrama tarda unos 0,04 ms. Para medir, el panel
del navegador tiene que estar a la vista: oculto, el navegador entrega un
cuadro por segundo.

## Arquitectura

Capas con dependencias que apuntan hacia el núcleo:

```
index.html
styles/          tokens.css (colores y medidas), app.css
src/
  core/          geometry, random, constants, track, car, sensors, traffic, controller, world,
                 network, evolution, brain, training
  input/         keyboard.js: controlador de teclado (adapta eventos al contrato)
  render/        camera.js y view.js: cámara y dibujo del escenario en canvas;
                 network-view.js: diagrama de una red neuronal
  ui/            app, dom, store, loop, layout, i18n, tooltips, audit, preferences, controls, library, chart
  i18n/          es.js, en.js
  tabs/drive/    pestaña 1: index (composición), session, settings, shortcuts
  tabs/train/    pestaña 3: index (composición), settings
  main.js
tests/           pruebas del núcleo, de textos y de arquitectura
tools/           serve.mjs (servidor local de desarrollo), bench.mjs (rendimiento del mundo)
```

`src/core` no importa nada fuera de `core` ni usa `document`, `window`,
`Math.random`, `Date.now` ni `performance.now`; `tests/architecture.test.js`
lo verifica. El código y sus identificadores van en inglés; todo texto visible
sale de los diccionarios `es` y `en`.

Piezas del núcleo:

- `geometry.js`: vectores, intersección de segmentos y contornos de rectángulos.
- `random.js`: azar con semilla (mulberry32) y derivación por índice.
- `track.js`: pista por línea central, ancho y carriles; calle recta de 2, 3 o 4 carriles.
- `traffic.js`: tráfico como función pura de semilla, número de grupo y tiempo. Las separaciones entre grupos se sortean por bloques y los vehículos de un grupo van escalonados según la irregularidad; `changeTraffic` cambia la configuración en marcha a partir de un poco más adelante del auto.
- `car.js` y `sensors.js`: física del auto y rayos de percepción.
- La velocidad máxima del auto se configura (`createWorld({ maxSpeed })`, de 12 a 40 m/s, 20 por defecto; marcha atrás a la mitad) y siempre supera a la del tráfico (10 m/s).
- `world.js`: une todo y avanza en pasos fijos de 1/60 s (`step()`), con `reset()`, `pause()` y `resume()`. `setMaxSpeed(v)` y `setTraffic({ density, irregularity })` cambian la configuración en marcha, sin reiniciar. Admite varios autos (ver abajo).
- `network.js`: red neuronal de capas totalmente conectadas como dato plano.
- `evolution.js`: operadores de neuroevolución sin estado.
- `brain.js`: formato del cerebro, validación y controlador de red neuronal.
- `training.js`: el entrenamiento por generaciones como máquina de estados.

### Mundo con varios autos

`createWorld({ seed, lanes, density, irregularity, cars: [{ controller, sensors, maxSpeed }, …] })`
crea un mundo con un auto por elemento de `cars`, todos en el mismo punto de
salida, sobre la misma pista y el mismo tráfico. `world.agents` los lista, cada
uno con `car`, `controller`, `progress`, `rays`, `perception`, `crashed` y
`crashCause`; `world.aliveCount` cuenta los que siguen en carrera y
`world.agentsSnapshot()` copia el estado de todos y `world.retire(i, cause)`
saca a uno de carrera (queda detenido, como chocado, con ese motivo). Los autos
no se ven ni chocan entre sí. `step()` avanza a todos los que no chocaron y no hace nada cuando
chocaron todos. El tráfico se consulta una vez por paso para el tramo que cubre
a todos y cada auto recibe los vehículos de su propio tramo en el mismo orden
que si estuviera solo: un auto se comporta igual solo o acompañado (lo verifica
`tests/world-agents.test.js`).

Sin `cars`, el mundo tiene un solo auto armado con `controller`, `sensors` y
`maxSpeed`, y todo lo anterior (`world.car`, `progress`, `rays`, `perception`,
`crashed`, `setController`, `configureSensors`, `snapshot`, …) se refiere a él.
Con varios, se refiere al primero.

### Red neuronal (`core/network.js`)

```js
{ sizes: [6, 6, 4],                 // entradas, capas ocultas, salidas
  activation: 'step',               // capas ocultas: step | sigmoid | tanh | relu
  layers: [ { weights: [[…6] ×6], biases: [×6] },   // weights[j][i]: de la neurona i
            { weights: [[…6] ×4], biases: [×4] } ] } // de la capa anterior a la j
```

De 0 a 3 capas ocultas de 1 a 16 neuronas. Valor de una neurona:
`activación(suma(peso × entrada) + sesgo)`; la capa de salida usa siempre
escalón (1 si la suma es mayor que 0). `createNetwork({ inputs, hidden, outputs,
activation, random })` crea una red con valores al azar entre -1 y 1 a partir de
un generador con semilla; `computeNetwork` calcula las salidas,
`computeDetailed` devuelve además los valores y las sumas de todas las capas,
`copyNetwork` copia y `validateNetwork` valida una red recibida como dato.
Errores con código en `NetworkError` (`invalidShape`, `unknownActivation`,
`inputCount`).

### Neuroevolución (`core/evolution.js`)

Funciones sin estado: estadísticas por agente (`createStats`, `recordStep`:
mayor progreso, pasos en carrera y si chocó), fitness (`fitnessOf` con
`distance` en metros, `survival` en segundos en carrera y `speed`, distancia
sobre tiempo), orden con empates por posición (`rankPopulation`), padres
(`parentCount`: el porcentaje de selección, al menos uno), élite (`eliteCount`:
nunca más que la población menos uno), mutación (`mutate`: con la probabilidad
dada, `w + (r − w) × fuerza` con `r` al azar entre -1 y 1), cruce uniforme
(`crossover`) y la generación siguiente (`nextGeneration`: primero la élite sin
cambios y después hijos de padres elegidos al azar). `normalizeEvolution` ajusta
la configuración a sus rangos: población 2 a 500 (100), élite 0 a 10 (1),
selección 1 % a 50 % (10 %), fuerza de mutación 0 % a 100 % (10 %), probabilidad
1 % a 100 % (100 %), cruce apagado, fitness por distancia y duración máxima de 10
a 300 s (60).

### Entrenamiento (`core/training.js`)

```
createTraining({ seed, config, brain? })
training.step()              un paso; si la generación termina, la cierra y arma la siguiente
training.finishGeneration()  la cierra ahora, con el motivo "a pedido"
training.configure(partial)  queda pendiente hasta la próxima generación;
                             rechaza cambios de red o de sensores (TrainingError)
training.generation | history | champion | leaderIndex | aliveCount
training.config | pending | world | eliteCount
training.brain({ id, name, now })   cerebro del campeón con sus datos
training.onGeneration(fn)    avisa al cerrar cada generación
```

Con la regla "eliminar a los lentos" (`slowRule`, encendida por defecto), un
auto que en los últimos 5 segundos simulados avanzó 50 metros o menos (lo que
avanza el tráfico) sale de carrera con el motivo `tooSlow`: así la población no
aprende a quedarse detrás de un vehículo. Una generación termina cuando todos
quedaron fuera de carrera (`allCrashed`), se cumplió la
duración máxima (`timeLimit`), ningún auto en carrera superó su mayor distancia
durante 5 segundos simulados (`stalled`) o a pedido (`requested`). Al cerrarla
se registra en `history` (número, mejor fitness, promedio, función y motivo), el
campeón pasa a ser el mejor de esa generación, se aplican los cambios
pendientes y se arma la población siguiente en un mundo nuevo. La configuración
(`normalizeTrainingConfig`) reúne la de evolución, el modo de tráfico (`same` o
`new`), el escenario (carriles, densidad, irregularidad y velocidad máxima) y la
red (`hidden`, `activation`) con los sensores, que solo cambian con un
entrenamiento nuevo.

Todo el azar sale de la semilla `S` del entrenamiento: la red inicial del
individuo `i` usa `randomFor(deriveSeed(S, 1), i)`; el armado de la generación
`g + 1`, `randomFor(deriveSeed(S, 2), g)`; el tráfico de la generación `g` en
modo "nuevo", `deriveSeed(deriveSeed(S, 3), g)`, y en modo "mismo", la semilla
de tráfico del escenario (`SCENARIO_TRAFFIC_SEED`). Con la misma semilla y la
misma configuración, el historial y el campeón se repiten. Al continuar desde un
cerebro, el individuo 0 es una copia exacta, los demás son hijos mutados y la
cuenta de generaciones sigue desde las del cerebro.

### Formato del cerebro (`core/brain.js`)

Un cerebro es una red con los sensores para los que fue entrenada y los datos
de su entrenamiento. Versión 1:

```json
{
  "format": "ml-lab-brain", "version": 1,
  "id": "…", "name": "Prudente",
  "createdAt": "2026-11-12T10:00:00.000Z", "updatedAt": "…",
  "network": { "sizes": [6, 6, 4], "activation": "step", "layers": [] },
  "sensors": { "count": 5, "range": 3, "spread": 90 },
  "inputs": ["sensors", "speed"],
  "outputs": ["forward", "left", "right", "reverse"],
  "training": {
    "generations": 50, "seed": 1, "maxSpeed": 15,
    "fitness": { "kind": "distance", "best": 412.5 },
    "evolution": { "population": 100, "elite": 1, "selection": 10,
                   "mutationStrength": 10, "mutationRate": 100,
                   "crossover": false, "maxDuration": 60 },
    "scenarios": [ { "track": "straight", "lanes": 3, "density": 50,
                     "irregularity": 50, "trafficMode": "same",
                     "generations": 50 } ]
  }
}
```

La red tiene una entrada por sensor, de izquierda a derecha, y la velocidad al
final; sus cuatro salidas son avanzar, izquierda, derecha y retroceder. El
núcleo no usa reloj ni identificadores al azar: `id` y fechas llegan como
parámetros. `validateBrain` devuelve `null` o un código (`notABrain`,
`unsupportedVersion`, `shapeMismatch`, `notFinite`, `sensorMismatch`) que la
interfaz traduce. `createNetworkController(network, sensorCount)` es el
controlador de red neuronal (rechaza al crearse una red que no tiene una
entrada por sensor más una), `carForBrain(brain)` arma un auto con los sensores
del cerebro y `addScenarioGenerations` acumula generaciones por escenario,
uniendo el mismo escenario consecutivo.

Unidades: metros y segundos. Ejes matemáticos (x a la derecha, y hacia arriba,
ángulo antihorario); la vista decide cómo dibujarlos.

### Contrato de controlador

Todo lo que maneja un auto (teclado, programa, red neuronal) es un objeto con
una operación, `control(perception)`:

```js
// percepción que entra
{ sensors: [0, 0.4, 0.9, 0, 0],  // lecturas de 0 a 1, de izquierda a derecha
  speed: 0.5 }                   // entre -1 y 1 respecto de la máxima de avance

// controles que salen: cuatro sí/no
{ forward: true, reverse: false, left: false, right: true }
```

El mundo lo consulta una vez por paso. Dos controles opuestos a la vez se
anulan. Se entrega con `createWorld({ controller })` o `world.setController(c)`.
Para probar sin teclado: `constantController({ forward: true })` en `core/controller.js`.

Piezas de la interfaz:

- `ui/controls.js`: componentes de panel compartidos (botón, interruptor, fila con deslizador, grupo de opciones, texto variable) y la confirmación en línea, cuya lógica (`createConfirmation`) no usa el DOM.
- `ui/loop.js`: bucle de paso fijo (acumula tiempo real, máximo 5 pasos por cuadro, se detiene con la página oculta). `setSpeed(1 | 2 | 4 | 8 | 'max')` acelera la simulación sin cambiar su resultado: con un factor fijo se multiplican el tiempo acumulado y el tope de pasos; con `'max'` se ejecutan pasos hasta agotar 12 ms por cuadro (al menos uno), y `achievedFactor` dice cuántas veces la velocidad real se logra. El mismo presupuesto limita los factores fijos en un equipo lento.
- `render/camera.js` y `render/view.js`: la calle recta se muestra vertical (se avanza hacia arriba); cámara que sigue al auto (zoom con rueda y botones, paneo arrastrando, tecla V para volver) y dibujo de pista, tráfico, auto y rayos con los colores de `styles/tokens.css`.
- `input/keyboard.js`: flechas y W A S D; ignora campos de texto y suelta todo al perder el foco.
- `tabs/drive/`: la pestaña 1, «El problema». `index.js` compone mundo, teclado, vista y panel; `session.js` (indicadores del intento y misiones), `settings.js` (configuración avanzada) y `shortcuts.js` (R reinicia, barra espaciadora pausa) no usan el DOM y se prueban con `node --test`.
- `render/network-view.js`: diagrama de una red en canvas. La disposición (`layoutNetwork`: columnas, nodos y rótulos que se resumen con muchas entradas) es una función pura; los pesos y sesgos se ven por signo (color y trazo continuo o punteado) y magnitud (grosor y opacidad), y la actividad por el relleno de cada nodo. Solo muestra: no modifica la red.
- `ui/chart.js`: curva de fitness en SVG (mejor y promedio por generación). La escala y los puntos salen de `chartModel`, una función pura; al cambiar la función de fitness, la curva empieza de nuevo.
- `ui/library.js`: biblioteca de cerebros, una sola para toda la app (`ctx.library`), sin DOM: almacenamiento, reloj e identificadores inyectados. Guarda, actualiza, renombra, elimina, importa y exporta cerebros, y autoguarda el campeón como máximo una vez por segundo; si el navegador no permite guardar, sigue en memoria y lo informa en `status`.
- `tabs/train/`: la pestaña 3, «Entrenar». `index.js` compone entrenamiento, vista y bucle, y conserva el entrenamiento entre montajes; `settings.js` define los ajustes, sus rangos y su grupo (al instante, próxima generación o entrenamiento nuevo).
- `ui/app.js` y `ui/layout.js`: el borde entre escenario y panel se arrastra (o se mueve con las flechas) para cambiar el ancho del panel, entre 300 px y la mitad de la ventana; se recuerda como preferencia.
- `ui/i18n.js` e `i18n/`: textos por clave (`data-i18n`); los parámetros numéricos se escriben según el idioma (coma decimal en español, punto en inglés, sin separador de miles); `ui/tooltips.js`: ayuda "qué hace / por qué importa" por clave (`data-help`).

Para la verificación manual, la consola del navegador expone `mlLab`: por ejemplo
`mlLab.auditTooltips()` lista los controles sin tooltip (debe devolver `[]`).

## Cómo publicar como sitio estático

No hay nada que compilar: publicá la raíz del repositorio tal cual. En GitHub
Pages: *Settings → Pages → Deploy from a branch*, elegí la rama y la carpeta
`/ (root)`. El archivo `.nojekyll` evita que Pages procese los archivos.
Habilitar el hosting es un paso manual.

## Créditos

El caso del auto que aprende a manejar está inspirado en el curso
"Self-driving Car" de Radu Mariescu-Istodor.
