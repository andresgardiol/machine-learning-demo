# Design

## Context

Motivación y alcance: ver proposal.md.

Estado actual del código que este cambio toca:

- `src/core/training.js`: `finishGeneration()` ordena por fitness, registra el
  campeón, aplica los cambios pendientes y llama a `nextGeneration()` de
  `src/core/evolution.js`, que arma la población con la élite y con hijos del
  10 % mejor. No existe la idea de un padre que persiste entre generaciones.
- La app ya sabe armar una población desde un solo padre: `createTraining({
  brain })` pone una copia exacta en la posición 0 y el resto como hijos
  mutados. Es lo que hace "Seguir entrenando". Falta poder hacerlo en cada
  generación, con un padre elegido sobre la marcha.
- `training.brain()` entrega siempre el cerebro del campeón; la pestaña lo
  usa para guardar y para el autoguardado.
- Panel de Entrenar, medido con la ventana en 1440×900 y la guía activa:
  800 px de contenido contra 851 visibles (guía 98, marcha 101, vista 32,
  configuración 108, guardar 57, misiones 163, biblioteca 40, avanzado 40,
  más separaciones). Quedan 51 px libres.
- Atajos de la pestaña: barra espaciadora, T y N (`src/tabs/train/shortcuts.js`).

Decisiones del dueño del proyecto que este diseño respeta: solo se puede
elegir al líder; la generación termina con las reglas de siempre; sin padre
elegido la generación siguiente es al azar y nunca se repite; si no se elige a
nadie, sigue el mismo padre.

## Goals / Non-Goals

**Goals:**

- Selección manual completa en el núcleo, sin DOM y determinista, de modo que
  repetir las mismas elecciones en los mismos pasos repita el entrenamiento.
- Que con selección automática no cambie nada: mismo azar, mismos resultados.
- Que la pestaña diga en todo momento de dónde va a salir la generación
  siguiente.

**Non-Goals:**

- Cambiar las funciones de fitness, la regla de los lentos o los motivos de
  fin de generación.
- Elegir un auto que no sea el líder, o más de un padre.
- Persistir el historial de elecciones entre recargas de la página.
- Cambiar la versión del formato de los cerebros.

## Decisions

### D1. El modo de selección es configuración del entrenamiento

`src/core/training.js`:

```js
export const SELECTION_MODES = Object.freeze(['auto', 'manual']);
DEFAULT_TRAINING_CONFIG.selectionMode = 'auto';
```

`normalizeTrainingConfig` lo valida (lo inválido vuelve a `'auto'`). No es una
de las `NEW_TRAINING_KEYS`: se cambia con `configure()` y rige desde la
generación siguiente, como la mutación.

*Alternativa descartada:* un método aparte para cambiar de modo al instante.
El modo solo importa al criar, que ocurre al terminar la generación; tratarlo
como un cambio de configuración más reutiliza el aviso de cambios esperando y
el restablecer.

### D2. Elecciones: una pila en el entrenamiento

Estado nuevo dentro de `createTraining`: `choices`, una lista de hasta 20
elecciones (`MAX_CHOICES = 20`; al pasar el tope se descarta la más vieja). El
padre elegido es la última.

```js
// una elección
{ network,            // copia de la red
  source,             // 'leader' | 'champion' | 'brain'
  generation,         // generación en que se eligió
  fitness, fitnessKind,   // lo que llevaba al elegirlo; para 'brain', el mejor fitness que el cerebro registraba
  name }              // nombre del cerebro, solo para 'brain'
```

Interfaz nueva del entrenamiento:

```js
training.chooseLeader()   // apila al líder de ahora; devuelve la elección, o null si no cambió nada
training.undoChoice()     // desapila; devuelve true si había algo que deshacer
training.parent           // resumen de la última elección (sin la red), o null
training.choiceCount      // cuántas elecciones se recuerdan
training.selection        // { applied, desired }: el modo vigente y el que regirá
```

- `chooseLeader()` copia `networks[leaderIndex]` y toma `fitnessOf(leaderIndex)`
  con la función de fitness vigente. Si esa red es idéntica a la del padre
  actual (el líder es su copia sin cambios), no apila nada y devuelve `null`.
  La comparación es estructural (mismas capas, pesos y sesgos).
- `desired` es `pending?.selectionMode ?? config.selectionMode`.
- Ninguna de las dos operaciones toca el mundo ni la población en curso.
- El núcleo permite elegir en cualquier modo; la pestaña solo lo ofrece
  cuando el modo deseado es manual. Así se puede elegir en la misma
  generación en que se pidió el cambio, antes de que rija.

### D3. Cría al terminar la generación

En `finishGeneration()`, después de registrar el historial y el campeón y de
aplicar los cambios pendientes:

```
wasManual = modo de la generación que termina
si el modo vigente es 'manual':
    si !wasManual y no hay elecciones: apilar al campeón (source 'champion')
    padre = última elección
    si hay padre:  networks = childrenOf(padre.network, config, random);  eliteN = 1
    si no:         networks = población al azar nueva;                    eliteN = 0
si es 'auto':
    olvidar todas las elecciones
    networks, eliteN = nextGeneration(...)        // como hoy
```

- `childrenOf(parent, { population, mutationStrength, mutationRate }, random)`
  es una función pura nueva en `src/core/evolution.js`: devuelve una copia
  exacta en la posición 0 y `population − 1` hijos de `mutate(parent, …)`,
  consumiendo el azar hijo por hijo, en orden. No usa selección, élite ni
  cruce.
- El azar de los hijos es el mismo flujo de hoy:
  `randomFor(deriveSeed(seed, STREAM_BREEDING), generation)`.
- Población al azar nueva: flujo nuevo `STREAM_FRESH = 4`. El individuo `i`
  de la generación `g` (la que empieza) usa
  `randomFor(deriveSeed(deriveSeed(seed, STREAM_FRESH), g), i)`. Es distinto
  del flujo de la población inicial (`STREAM_INITIAL`), así que ninguna
  generación al azar repite a otra ni a la primera.
- `eliteN = 1` hace que la vista marque con el color de la élite a la copia
  del padre, sin tocar `src/render`.
- Con selección automática el camino es el de hoy, con el mismo consumo de
  azar: los entrenamientos existentes dan los mismos resultados.

Al crear un entrenamiento desde un cerebro (`createTraining({ brain })`), si
el modo es manual se apila el cerebro como elección inicial (`source:
'brain'`, con su nombre). La primera población ya se arma hoy como copia más
mutaciones.

### D4. El cerebro del entrenamiento

`training.brain({ id, name, now })` pasa a depender del modo **vigente**
(`config.selectionMode`):

- `'auto'`: el campeón, como hoy.
- `'manual'`: el padre elegido, con `fitness: { kind: padre.fitnessKind, best:
  padre.fitness }`; `null` si no hay padre. Para un padre que vino de un
  cerebro, se conserva el mejor fitness que ese cerebro ya registraba.

En los dos casos, `training.evolution` suma `selectionMode`. `createBrain` y
`copyTraining` ya copian `evolution` completo y `validateBrain` no exige sus
claves, así que el formato sigue en la versión 1 y los cerebros sin ese dato
siguen valiendo; quien lo lee usa `'auto'` cuando falta.

Mientras un cambio a manual todavía no rige, el cerebro del entrenamiento
sigue siendo el campeón: guardar y autoguardar no cambian hasta que el modo
rige.

### D5. Ajustes y lógica de la pestaña sin DOM

- `src/tabs/train/settings.js`: ajuste nuevo `{ key: 'selectionMode', group:
  'nextGeneration', kind: 'choice', options: SELECTION_MODES, default: 'auto'
  }`, que `trainingConfig()` pasa al entrenamiento.
- `src/tabs/train/session.js`: función pura nueva `parentStatus(training)` →
  `{ key, params }` para la línea de estado:

| Situación | Clave |
|---|---|
| Padre elegido, `source: 'leader'` | `train.parent.leader.<unidad>` con `{ generation, value }` |
| Padre elegido, `source: 'champion'` | `train.parent.champion.<unidad>` con `{ generation, value }` |
| Padre elegido, `source: 'brain'` | `train.parent.brain` con `{ name }` |
| Sin padre y el modo vigente todavía es automático | `train.parent.pending` |
| Sin padre y el modo vigente es manual | `train.parent.none` |

  El valor se redondea con `fitnessText`, que ya existe.
- `src/tabs/train/shortcuts.js`: `KeyE: 'choose'` y `KeyZ: 'undo'`. La
  pestaña los atiende solo si el modo deseado es manual.

### D6. Panel

```
+----------------------------------------------+
| Quién elige al padre     [ La fitness | Vos ]|   encabeza la marcha
| Rige desde la próxima generación.            |   solo mientras el cambio espera
| [ Pausar (espacio) ] [ Siguiente (N)       ] |
| [ Elegir al líder (E) ]        [Deshacer (Z)]|   solo con selección manual
| Padre: el líder de la generación 4, que      |   solo con selección manual
| llevaba 310 m.                               |
| Velocidad   1×  2×  4×  8×  Máx. (T)         |
| [Reiniciar] [Población nueva]                |
+----------------------------------------------+
| Configuración                                |
| Población                          100 autos |
| Fuerza de mutación                      10 % |
+----------------------------------------------+
```

- **Dónde va el ajuste:** es el primer renglón del bloque de marcha
  (`.train-run`), no un renglón de la configuración. Población y mutación son
  parámetros; quién elige al padre es un modo: decide qué botones aparecen,
  qué guarda "Guardar" y qué ajustes avanzados valen. Arriba se lee primero y
  queda a un renglón de los botones que hace aparecer. Su rótulo lleva el
  estilo de un título del panel (`.panel-heading`) y sus dos opciones ocupan
  el ancho que queda del renglón.
- **Aviso junto al ajuste:** `<p class="train-pending" role="status">` con
  `train.mode.pending`, visible mientras `training.pending` incluye
  `selectionMode`. El aviso de la configuración básica y el de la sección
  avanzada se muestran solo cuando espera algún otro ajuste.
- **Guía según el modo:** el párrafo de inicio usa `train.guide` o
  `train.guide.manual` según el modo deseado.

*Alternativas descartadas:* dejarlo en la configuración básica (queda en el
medio, con el peso de un deslizador, lejos de los botones que hace aparecer);
un bloque propio con las opciones a todo el ancho debajo del rótulo (suma 25
px y el panel deja de entrar en 1440×900); ponerlo en el tablero (el tablero
solo muestra); y pestañas internas "automático / manual" (esconde que el
resto del panel es compartido).

- **Qué decide si se ven los botones:** el modo deseado
  (`state.settings.selectionMode`). Aparecen al elegir "Vos" y desaparecen al
  volver a "La fitness", sin esperar a la generación siguiente.
- **Elegir al líder:** botón principal. Llama a `training.chooseLeader()` y
  la línea de estado se actualiza en el mismo cuadro. Si devuelve `null`, la
  línea no cambia.
- **Deshacer:** `aria-disabled` cuando `choiceCount` es 0, con el tooltip
  `help.train.undo.disabled` (no `disabled`, para que el tooltip funcione).
- **Línea de estado:** `<p class="parent-status" role="status">`, escrita con
  `parentStatus()` en cada `sync()`.
- **Selección, élite y cruce** (grupo de evolución de la sección avanzada):
  con modo deseado manual quedan con `aria-disabled`, atenuados, y su tooltip
  pasa a `help.train.setting.notInManual`. Los deslizadores ignoran el
  arrastre mientras están así y conservan su valor.
- **Guardar:** el rótulo sobre el campo de nombre y el estado del botón
  siguen al modo **vigente** (D4): `train.save.title` o
  `train.save.title.parent`; deshabilitado sin campeón o, en manual, sin
  padre, con `help.train.save.disabled.parent`.
- **Autoguardado:** no cambia de código; ya omite la escritura cuando
  `training.brain()` devuelve `null`.
- **Espacio:** medido con la ventana en 1440×900 y la guía activa, el panel
  ocupa 830 px de 851 con selección automática. Mover el ajuste del bloque de
  configuración al de marcha no cambia ese total. Con selección manual se
  suman el renglón de botones y la línea de estado y el panel se desplaza,
  pero esos controles están arriba y quedan a la vista. Las specs piden
  exactamente eso.

### D7. Biblioteca

`src/ui/library-view.js` agrega al detalle de un cerebro la fila "Quién
eligió" (`library.detail.selectionMode`), con el texto de
`train.selectionMode.auto` o `.manual`; si el cerebro no registra el dato,
muestra el de automática. `brainDetail` ya devuelve `evolution` completo, así
que su prueba no cambia.

### D8. Textos

Textos propuestos; los tooltips llevan además "qué hace" y "por qué importa".

| Clave | Español | Inglés |
|---|---|---|
| `train.guide.manual` | Cada auto verde lo maneja una red neuronal con números al azar: nadie le enseñó a manejar. Cuando veas al líder hacer algo prometedor, elegilo: la generación siguiente serán copias suyas con pequeños cambios (mutaciones). | Each green car is driven by a neural network with random numbers: nobody taught it to drive. When you see the leader do something promising, pick it: the next generation will be copies of it with small changes (mutations). |
| `train.mode.pending` | Rige desde la próxima generación. | Takes effect from the next generation. |
| `train.setting.selectionMode` | Quién elige al padre | Who picks the parent |
| `train.selectionMode.auto` | La fitness | Fitness |
| `train.selectionMode.manual` | Vos | You |
| `train.choose` | Elegir al líder (E) | Pick the leader (E) |
| `train.undo` | Deshacer (Z) | Undo (Z) |
| `train.parent.none` | Sin padre elegido: si no elegís uno, la próxima generación empieza con redes al azar. | No parent picked: unless you pick one, the next generation starts with random networks. |
| `train.parent.pending` | Si no elegís a nadie, el padre será el mejor de esta generación. | If you don't pick anyone, the parent will be the best of this generation. |
| `train.parent.leader.meters` | Padre: el líder de la generación {generation}, que llevaba {value} m. | Parent: the leader of generation {generation}, at {value} m. |
| `train.parent.leader.seconds` | Padre: el líder de la generación {generation}, que llevaba {value} s sin chocar. | Parent: the leader of generation {generation}, {value} s without crashing. |
| `train.parent.leader.metersPerSecond` | Padre: el líder de la generación {generation}, que promediaba {value} m/s. | Parent: the leader of generation {generation}, averaging {value} m/s. |
| `train.parent.champion.meters` | Padre: el mejor de la generación {generation}, con {value} m. | Parent: the best of generation {generation}, with {value} m. |
| `train.parent.champion.seconds` | Padre: el mejor de la generación {generation}, con {value} s sin chocar. | Parent: the best of generation {generation}, {value} s without crashing. |
| `train.parent.champion.metersPerSecond` | Padre: el mejor de la generación {generation}, con {value} m/s. | Parent: the best of generation {generation}, at {value} m/s. |
| `train.parent.brain` | Padre: el cerebro «{name}». | Parent: the brain “{name}”. |
| `train.save.title.parent` | Guardar al padre elegido | Save the picked parent |
| `library.detail.selectionMode` | Quién eligió | Who picked |

Tooltips nuevos: `help.train.setting.selectionMode`,
`help.train.selectionMode.auto`, `help.train.selectionMode.manual`,
`help.train.choose`, `help.train.undo`, `help.train.undo.disabled`,
`help.train.save.disabled.parent` y `help.train.setting.notInManual`. El de
elegir al líder define "padre": el auto del que salen, con pequeñas
mutaciones, todos los de la generación siguiente.

La prueba `tests/copy-length.test.js` suma un límite de 110 caracteres para
las líneas de estado del padre, con `{generation}`, `{value}` y `{name}`
reemplazados por valores de largo realista (1000, 1194 y un nombre de 40
caracteres; la del cerebro queda fuera del límite por depender del nombre).

### D9. Pruebas

Nuevas, sin DOM:

- `tests/evolution.test.js`: `childrenOf` (copia exacta en la posición 0,
  tamaño de la población, hijos distintos del padre, todos idénticos con
  mutación 0, mismo azar da los mismos hijos).
- `tests/training.test.js`: un caso por escenario de los requisitos nuevos y
  modificados de `neuroevolucion`: modo por defecto y modo inválido; fin de
  generación sin esperar elección; elegir (red, generación y fitness
  registrados; dos veces; al mismo padre; la generación en curso no cambia);
  cría desde el padre; generación sin elección; generaciones al azar
  distintas y reproducibles; deshacer (con dos, con una, sin ninguna, tope de
  20); cambio de automática a manual con y sin elección previa; de manual a
  automática; vuelta a manual; continuar desde un cerebro; cerebro del
  entrenamiento en cada modo; reproducibilidad con las mismas elecciones en
  los mismos pasos; y que selección y élite no se usan en manual.
- `tests/train-settings.test.js`: el ajuste nuevo, su grupo y su paso a la
  configuración del entrenamiento.
- `tests/train-session.test.js`: `parentStatus` en sus cinco situaciones y
  con cada unidad.
- `tests/board.test.js` o el archivo de atajos de la pestaña: E y Z.
- `tests/brain.test.js`: un cerebro con `selectionMode` y uno sin él son
  válidos y conservan el dato al copiarse.

Existentes que cambian, solo para sumar la clave `selectionMode: 'auto'` a
listas completas: en `tests/training.test.js`, la configuración por defecto y
los datos de evolución del cerebro del campeón (D4 registra el modo también
con selección automática); y en `tests/train-settings.test.js`, los ajustes
por defecto y la lista de ajustes por grupo. Además, la aserción de
`tests/train-session.test.js` que enumera los atajos de la pestaña suma
`KeyE` y `KeyZ` (D5). Son cinco aserciones.

Regla general: una aserción existente que enumera una lista completa de
claves que este cambio amplía se actualiza solo sumando las claves nuevas,
sin cambiar ningún valor esperado ni quitar nada, y se informa en el reporte.
Cualquier otra falla de una prueba existente es un problema del código nuevo.

Lo que depende del DOM se verifica en el navegador con los escenarios de la
spec `pestana-entrenar`.

### D10. Rendimiento

La cría manual hace una copia y `población − 1` mutaciones, menos trabajo que
la automática. `chooseLeader()` copia una red y la compara con otra: unas
decenas de números con la red por defecto, y unos miles con la más grande
admitida; ocurre al apretar un botón, no por cuadro. `parentStatus()` se
evalúa por cuadro pero solo arma una clave y dos números, y el texto se
reescribe únicamente cuando cambia (`createTextSetter`).

## Risks / Trade-offs

- [La generación puede terminar sola antes de que la persona elija, y el
  líder que quería ya no está] → es la decisión tomada: en ese caso sigue el
  mismo padre, sin pérdida. La pausa (barra espaciadora) permite elegir con
  calma, y elegir funciona en pausa.
- [Con selección manual y sin padre, una generación al azar descarta lo que
  había] → solo pasa si la persona nunca eligió o deshizo todo; la línea de
  estado lo avisa antes, y al pasar de automática a manual el campeón queda
  como padre.
- [El panel tiene 21 px de margen a 1440×900; un texto más largo en inglés
  lo desborda] → la tarea de verificación mide el panel en
  los dos idiomas. Si no entra, se ajustan espaciados; si aun así no entra,
  se consulta antes de mover u ocultar nada.
- [El cerebro del entrenamiento sigue al modo vigente y los botones al modo
  deseado: durante la generación en que se pidió el cambio conviven] → la
  línea de estado lo dice ("si no elegís a nadie, el padre será el mejor de
  esta generación") y el rótulo de guardar no cambia hasta que el modo rige.
- [El historial de elecciones se pierde al recargar la página] → el padre
  elegido queda en el autoguardado, y "Seguir entrenando" lo retoma como
  padre inicial.
- [Elegir siempre al líder premia la distancia del momento, que es parecida a
  la fitness por distancia] → la diferencia está en cuándo se elige y en que
  el padre persiste; si resulta insuficiente, elegir cualquier auto con un
  clic ya está anotado en PENDIENTES.md.

## Migration Plan

Sin datos que migrar. Los cerebros guardados no registran el modo de
selección y se leen como de selección automática. El valor por defecto es el
comportamiento actual. Vuelta atrás: revertir los commits del cambio.

## Open Questions

- Si el rótulo "Vos" / "You" se entiende mejor que "A mano" / "By hand" se
  puede decidir al verlo en pantalla; no cambia specs ni tareas.
