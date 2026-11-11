# Design

## Context

El núcleo actual simula un solo auto: `createWorld` guarda en variables
internas un auto, su controlador, su progreso, sus rayos y su percepción, y
`world.step()` no hace nada si ese auto chocó. La vista (`render/view.js`)
dibuja `world.car` y la cámara lo sigue. El bucle (`ui/loop.js`) ejecuta como
máximo 5 pasos por cuadro. El contrato de controlador
(`control(perception) -> { forward, reverse, left, right }`) ya entrega la
velocidad en la percepción. El tráfico es una función pura del tiempo, así que
puede compartirse entre muchos autos sin costo de coordinación.

La pestaña 1 tiene todos sus componentes de panel (botón, interruptor,
deslizador, texto variable) definidos dentro de `tabs/drive/index.js`. La
velocidad máxima del auto vive en el almacén de la app (`store.carSpeed`).

Hay 194 pruebas que pasan. Restricciones: sin dependencias, sin build, núcleo
sin DOM ni reloj ni `Math.random`, dos idiomas, solo escritorio.

Motivación y alcance: ver `proposal.md`. Comportamiento exigido: ver `specs/`.

## Goals / Non-Goals

**Goals:**

- Que todo lo que define un entrenamiento (red, evolución, generaciones,
  cerebro) viva en el núcleo y corra en Node, para probarlo y para generar los
  cerebros incluidos con un script.
- Que el mundo de varios autos sirva también a las carreras de la pestaña 4.
- Que la pestaña 1 no cambie de comportamiento.
- Que un entrenamiento sea reproducible de punta a punta con una semilla.

**Non-Goals:**

- Entrenar en un hilo aparte (Web Worker) o con la página oculta.
- Índice espacial para sensores y choques; se mide y se deja anotado si hace
  falta.
- Controles analógicos y redes con salidas continuas.
- Interacción con el diagrama de red (editar, apagar neuronas, paso a paso).

## Decisions

### D1. El mundo se generaliza a varios autos, sin cambiar su interfaz de uno

`createWorld` pasa a manejar una lista de agentes. Un agente reúne lo que hoy
son variables sueltas: auto, controlador, tramo de pista, progreso, rayos,
percepción y causa de choque.

```
createWorld({ seed, lanes, density, irregularity,
              cars: [{ controller, sensors, maxSpeed }, ...] })

world.agents            -> [{ car, controller, progress, rays, perception,
                              crashed, crashCause }]
world.step()            -> un paso para cada agente que no chocó
```

Sin `cars`, el mundo crea un solo agente a partir de `controller`, `sensors` y
`maxSpeed`, como hoy. Todo lo que existe (`world.car`, `progress`, `rays`,
`perception`, `crashed`, `crashCause`, `vehicles`, `setController`,
`setMaxSpeed`, `configureSensors`, `resetSensors`, `snapshot`) sigue
funcionando y se refiere al primer agente. Las 194 pruebas actuales deben
pasar sin modificarse: es el criterio de que la pestaña 1 no cambió.

El tiempo es uno solo para el mundo. `step()` avanza mientras quede al menos un
agente sin chocar; con todos chocados no hace nada, igual que hoy con uno.

Todos los autos salen del mismo punto (centro del carril de salida, ángulo 0)
y pueden superponerse: no se detectan ni chocan entre sí.

*Alternativa:* un mundo aparte para poblaciones. Descartado: duplicaría la
lógica de percepción y choque, y la pestaña 4 necesitaría un tercero.

### D2. Tráfico consultado una vez por paso

En cada paso el mundo pide al tráfico los vehículos del tramo que cubre a
todos los agentes en carrera (del menor al mayor progreso, más el radio de
percepción más grande) y a cada agente le entrega los que caen en su propio
tramo, con el mismo criterio y el mismo orden que si estuviera solo. Así se
cumple "un auto se comporta igual solo o acompañado", que tiene su prueba.

*Rendimiento:* el costo por paso es proporcional a autos × rayos × obstáculos
cercanos. Con 100 autos y 5 rayos son unos pocos miles de intersecciones. Se
mide con un script (`tools/bench.mjs`): 100 autos durante 3600 pasos en Node;
el objetivo es superar 20 veces el tiempo real. No se agrega un índice
espacial; si la medición queda por debajo del objetivo, se anota y se consulta.

### D3. La red es un dato plano

```
{ sizes: [6, 6, 4],
  activation: 'step',            // capas ocultas: step | sigmoid | tanh | relu
  layers: [
    { weights: [[...6], x6], biases: [x6] },   // weights[j][i]: de la neurona i
    { weights: [[...6], x4], biases: [x4] } ] } // de la capa anterior a la j
```

Arreglos comunes, sin clases: se serializa a JSON tal cual, se copia sin
sorpresas y el inspector de la pestaña 5 podrá leerlo y editarlo. Valor de una
neurona: `activación(suma(peso × entrada) + sesgo)`. La capa de salida usa
siempre escalón (`suma > 0`). `src/core/network.js` ofrece crear (con un
generador de azar), calcular, calcular con el detalle de todas las capas,
copiar y validar.

*Alternativa:* arreglos tipados (`Float64Array`). Descartado por ahora: no
pasan por JSON directamente y la ganancia no hace falta con redes de este
tamaño.

### D4. Operadores de evolución puros

`src/core/evolution.js` tiene funciones sin estado: fitness a partir de las
estadísticas de un agente, orden de la población, mutación, cruce y armado de
la generación siguiente.

- **Estadísticas por agente:** mayor progreso alcanzado (nunca menor que 0),
  pasos en carrera y si chocó.
- **Fitness:** `distance` (metros), `survival` (segundos en carrera) y `speed`
  (distancia sobre tiempo en carrera; 0 si el tiempo es 0).
- **Mutación:** con la probabilidad dada, `w = w + (r - w) × fuerza`, con `r`
  al azar entre -1 y 1. Con fuerza 0 la copia es exacta.
- **Cruce:** uniforme, valor por valor, entre dos padres distintos.
- **Generación siguiente:** primero la élite, sin cambios; el resto, hijos de
  padres elegidos al azar (con igual probabilidad) entre los seleccionados.

*Alternativa:* selección por ruleta proporcional al fitness. Descartado: "se
quedan los mejores X %" se explica en una oración y la ruleta no.

### D5. Todo el azar sale de la semilla del entrenamiento

| Uso | Generador |
|---|---|
| Red inicial del individuo `i` | `randomFor(deriveSeed(S, 1), i)` |
| Armado de la generación `g + 1` | `randomFor(deriveSeed(S, 2), g)`, consumido en orden fijo: hijo por hijo, primero la elección de padres, después cada valor en el orden de las capas |
| Tráfico de la generación `g`, modo "nuevo" | `deriveSeed(deriveSeed(S, 3), g)` |
| Tráfico, modo "mismo" | la semilla de tráfico del escenario |

"Reiniciar" conserva `S`; "población nueva" usa `S + 1`. Al continuar desde un
cerebro, el individuo 0 es el cerebro y los demás se mutan con el generador de
la red inicial.

Con élite de al menos 1 y mismo tráfico, el mejor fitness no puede bajar: la
simulación es determinista y el individuo de élite repite exactamente su
corrida anterior. Esa propiedad se prueba.

### D6. El entrenamiento es una máquina de estados del núcleo

`src/core/training.js` reúne mundo, población y operadores.

```
        +------------+  todos chocaron | tiempo | nadie avanza | a pedido
  ----> | EN CARRERA | -------------------------------------------+
        +------------+                                            v
              ^                                            +------------+
              |   aplica cambios pendientes, arma el       |  EVALUAR   |
              +---  mundo y la poblacion siguientes  <-----+------------+
                                                     registra historial,
                                                     campeon y escenario
```

```
createTraining({ seed, config, brain? })
training.step()              un paso; si la generación termina, la cierra y arma la siguiente
training.finishGeneration()  la cierra ahora, con el motivo "a pedido"
training.configure(partial)  queda pendiente hasta la próxima generación;
                             rechaza cambios de red o de sensores
training.generation | history | champion | leaderIndex | aliveCount
training.config | pending | world | eliteCount
training.brain({ id, name, now })   cerebro del campeón con sus datos
training.onGeneration(fn)    avisa al cerrar cada generación
```

Motivos de fin: `allCrashed`, `timeLimit`, `stalled`, `requested`. "Nadie
avanza" se detecta guardando el último paso en que algún agente en carrera
superó su mayor progreso; si pasan 5 segundos simulados sin que ocurra, la
generación termina. Es una regla de la generación, no elimina individuos: por
eso, con la función "tiempo sin chocar", los autos que aprenden a no moverse
siguen obteniendo el mejor fitness, que es justo lo que se quiere mostrar.

Cuándo se aplica cada cambio:

| Cuándo | Qué |
|---|---|
| Al instante | Pausa, velocidad, cámara, sensores visibles, secciones plegadas |
| Próxima generación | Población, élite, selección, mutación, cruce, fitness, duración, modo de tráfico, carriles, densidad, irregularidad, velocidad máxima |
| Entrenamiento nuevo | Capas ocultas, neuronas, activación, sensores, cargar un cerebro, reiniciar, población nueva |

*Alternativa:* poner la lógica de generaciones en la pestaña. Descartado: no
se podría probar sin navegador ni usar desde el script de cerebros incluidos.

### D7. Formato del cerebro, versión 1

`src/core/brain.js` crea, valida y convierte cerebros, y arma el controlador.

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

El núcleo no usa reloj ni identificadores al azar: `id` y fechas llegan como
parámetros desde la interfaz. `inputs` y `outputs` se guardan para que una
versión futura pueda agregar entradas sin romper los cerebros viejos. La
validación devuelve códigos de error (`notABrain`, `unsupportedVersion`,
`shapeMismatch`, `notFinite`, `sensorMismatch`), que la interfaz traduce.

El controlador de red arma el vector de entradas con las lecturas y la
velocidad, calcula y devuelve los cuatro controles. La compatibilidad se
verifica al crearlo.

### D8. Biblioteca en la interfaz, con almacenamiento inyectado

`src/ui/library.js` no toca el DOM: recibe el almacenamiento, el reloj y el
generador de identificadores, y se prueba en Node con uno falso. Guarda los
cerebros en `mlLab.brains` y los autoguardados en `mlLab.autosave.current` y
`mlLab.autosave.previous`. Ofrece listar (incluidos, autoguardados y
guardados), guardar, actualizar, renombrar, eliminar, importar desde texto,
exportar a texto, autoguardar, rotar el autoguardado y suscribirse a cambios.
Si el almacenamiento falla, sigue en memoria y lo informa con un estado que la
vista convierte en aviso.

El autoguardado se escribe como máximo una vez por segundo, y además al
pausar, al salir de la pestaña y al ocultarse la página, para no escribir
decenas de veces por segundo en velocidad máxima. La rotación a "entrenamiento
anterior" ocurre solo si el entrenamiento que se abandona terminó al menos una
generación.

La descarga y la lectura de archivos (`src/ui/files.js`) y la lista
(`src/ui/library-view.js`) sí usan el DOM. La app crea la biblioteca al
arrancar y la entrega a cada pestaña en su contexto (`ctx.library`).

### D9. Cerebros incluidos generados por un script

`tools/train-presets.mjs` entrena en Node con semillas fijas y escribe
`src/presets/brains.js` (un módulo que exporta la lista). El archivo generado
se versiona; el script permite regenerarlo. Sus nombres salen de los
diccionarios (`preset.novice`, `preset.expert`), no del archivo.

- **Novato:** campeón de la generación 2.
- **Experto:** entrenado con mismo tráfico y duración de 120 segundos hasta
  manejar los 120 segundos sin chocar, con un tope de 300 generaciones.

Si "Experto" no se logra dentro del tope, no se baja el umbral: se detiene y se
consulta.

### D10. Bucle con velocidades

`createLoop` gana `setSpeed(valor)` con `1`, `2`, `4`, `8` o `'max'`.

- **Factor fijo:** el acumulador recibe el tiempo transcurrido multiplicado por
  el factor, y el tope de pasos por cuadro se multiplica igual.
- **Máxima:** ejecuta pasos hasta agotar un presupuesto de 12 ms por cuadro (al
  menos uno), y calcula el factor logrado como tiempo simulado sobre tiempo
  real, suavizado.

El mismo presupuesto limita los factores fijos: en un equipo lento, la
velocidad 8 se degrada en vez de trabar la página. El reloj se inyecta para
probarlo. Con 12 ms de trabajo por cuadro, la interfaz atiende el teclado en
cada cuadro, lo que cumple "pausa en menos de medio segundo".

*Alternativa:* un Web Worker. Descartado en este cambio: obliga a duplicar el
estado para dibujar y complica la reproducibilidad; queda como mejora posible.

### D11. Dibujo de la población y cámara

`view.render(world, opciones)` acepta `focus` (índice del agente a destacar y
seguir) y `elite` (índices a marcar). Orden de dibujo: chocados (muy tenues,
contorno punteado), en carrera (silueta simple, semitransparente), élite (con
un contorno propio) y por último el foco, con todos sus detalles y sus rayos.
Sin `focus`, dibuja como hoy.

Cuando el foco cambia de un agente a otro, la vista guarda la diferencia de
posición entre ambos y la reduce a cero en unos 0,3 segundos, sumándola al
objetivo de la cámara. No hay retraso en régimen normal (tampoco a velocidad
máxima) y el cambio de líder no produce un salto. Si la diferencia supera 50
metros, o al llamar a `followCar()`, el cambio es inmediato.

*Rendimiento:* 500 siluetas simples por cuadro; los detalles (vidrios, luces)
solo se dibujan en el foco.

### D12. Diagrama de red en canvas

`src/render/network-view.js` dibuja en un canvas propio. La disposición
(columnas, posición de nodos, qué rótulos se resumen) sale de una función pura
que se prueba en Node. Con muchas conexiones las líneas se dibujan agrupadas
por aspecto para reducir cambios de estilo. Los colores salen de variables
nuevas en `tokens.css`.

*Alternativa:* SVG. Descartado: con 1600 conexiones actualizadas en cada
cuadro, el canvas es más simple y más liviano.

### D13. Curva de fitness en SVG

`src/ui/chart.js` dibuja dos series con leyenda. La escala y los puntos salen
de una función pura probada en Node. Los valores de la generación señalada se
muestran en una línea de texto bajo el gráfico, no en un globo flotante, para
no competir con los tooltips de ayuda.

### D14. La pestaña conserva su estado entre montajes

El entrenamiento, los ajustes y las misiones cumplidas viven en variables del
módulo de la pestaña, como ya hace la pestaña 1 con sus misiones. Al
desmontar se detienen el bucle y la vista; al volver a montar se retoma el
mismo entrenamiento.

```
src/tabs/train/
  index.js       composicion: mundo, vista, bucle, atajos, secciones
  settings.js    ajustes, rangos y a que grupo pertenece cada uno (sin DOM)
  session.js     indicadores y misiones (sin DOM)
  panels/        estado, curva, red, configuracion, cerebros
```

### D15. Componentes de panel compartidos

Botón, interruptor, fila con deslizador, grupo de opciones, texto variable y
confirmación en línea se extraen de `tabs/drive/index.js` a
`src/ui/controls.js`, y ambas pestañas los usan. Es un movimiento de código
sin cambio de comportamiento. Las confirmaciones se muestran dentro del panel,
junto al control que las pidió, no con el diálogo del navegador.

### D16. Números con `Intl.NumberFormat`

El sistema de idiomas formatea todo parámetro numérico con
`Intl.NumberFormat(idioma, { useGrouping: false, maximumFractionDigits: 2 })`.
Quien llama sigue decidiendo el redondeo. La regla del singular no cambia. La
guía de la pestaña 1 pasa a recibir la cantidad de carriles como parámetro.

### D17. Módulos nuevos y capas

```
src/core/      network.js  evolution.js  training.js  brain.js  (world.js cambia)
src/presets/   brains.js          (generado; solo datos)
src/render/    network-view.js    (view.js cambia)
src/ui/        library.js  library-view.js  files.js  chart.js  controls.js
               (loop.js, i18n.js y app.js cambian)
src/tabs/train/
tools/         train-presets.mjs  bench.mjs  calibrate.mjs
```

Las dependencias siguen apuntando al núcleo; `src/presets` solo contiene
datos. La prueba de arquitectura existente cubre los módulos nuevos de
`src/core` sin cambios.

## Risks / Trade-offs

- [La generalización del mundo rompe la pestaña 1] → Las 194 pruebas
  existentes pasan sin tocarse, y la prueba de equivalencia compara cada auto
  de una población con su mundo de un auto.
- [La configuración por defecto aprende poco o tarda demasiado] → Tarea de
  calibración con un script: en 20 generaciones, el mejor debe superar 300
  metros en al menos 8 de 10 semillas. Si no se logra, se ajustan los valores
  por defecto, se actualizan las specs y se informa.
- [El cerebro "Experto" no se logra entrenar] → Tope de generaciones y
  consulta; no se baja el umbral sin acuerdo.
- [Un cerebro entrenado en Node se comporta distinto en otro navegador por
  diferencias en el último decimal] → Se verifica "Experto" a mano en el
  navegador además de la prueba en Node; la limitación ya estaba aceptada.
- [La regla "nadie avanza" corta una generación en la que el líder frena y
  espera] → Aceptado: esperar detenido más de 5 segundos no es manejar bien.
- [El entrenamiento se detiene con la página oculta] → Se dice en el tooltip
  de la velocidad máxima.
- [El almacenamiento del navegador se llena] → Mensaje claro, exportación
  disponible y los cerebros existentes no se tocan.
- [La pestaña tiene muchos controles] → Solo dos ajustes a la vista; el resto,
  en secciones plegadas, y la biblioteca también plegable.

## Migration Plan

No hay datos previos que migrar. El formato de cerebro nace con número de
versión para poder migrarlo más adelante. Volver atrás es revertir los commits
del cambio; los cerebros guardados en el navegador quedarían sin usar.

## Open Questions

- Colores exactos de pesos positivos, negativos y neurona activa. Se eligen al
  implementar el diagrama, cumpliendo la spec: distintos de auto, tráfico y
  sensores, y distinguibles sin depender solo del color.
- Semillas y cantidad de generaciones de los cerebros incluidos. Las decide el
  resultado del script, dentro del tope fijado.
