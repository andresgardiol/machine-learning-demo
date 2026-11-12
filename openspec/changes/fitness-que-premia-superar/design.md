# Design

## Context

Ver proposal.md para el motivo y la tabla de mediciones. Lo que condiciona el
diseño:

- El fitness sale de `fitnessOf(kind, stats)` en `src/core/evolution.js`. Las
  estadísticas de cada auto (`{ best, steps, crashed }`) las actualiza
  `recordStep(stats, agent)`, que `src/core/training.js` llama una vez por
  auto y por paso.
- El tráfico es una función pura de (semilla, grupo, tiempo) y todos sus
  vehículos avanzan a `TRAFFIC_SPEED` (10 m/s). Cada generación crea un mundo
  nuevo, así que el tráfico no cambia dentro de una generación.
- La pestaña toma sus valores por defecto de `DEFAULT_TRAINING_CONFIG`
  (`src/tabs/train/settings.js`), y la unidad con que muestra un fitness, de
  `FITNESS_UNITS`.
- Un cerebro guarda `fitness.kind` como texto libre: agregar una función no
  invalida ninguno.

### Cómo se midió

Los experimentos corrieron sobre una copia del núcleo, fuera del repositorio.
La ventaja se calculó como en D1, los vehículos superados como en D2 y el
enfriamiento como en D9, así que la implementación debería reproducir los
mismos números (D6). Resultados por semilla de la configuración propuesta,
que sirven de referencia a D6:

| Semilla | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | Promedio |
|---|---|---|---|---|---|---|---|---|---|
| Generaciones 51 a 60 | 13,3 | 12,9 | 12,6 | 14,3 | 10,8 | 13,5 | 17,0 | 11,9 | 13,3 |
| Generaciones 91 a 100 | 16,4 | 15,5 | 16,7 | 15,7 | 16,1 | 18,9 | 15,9 | 11,2 | 15,8 |

Con la función distancia y el resto igual, el promedio de las generaciones 51
a 60 es 0,6.

Hipótesis, no medidas:

- Por qué la élite ayuda: con tráfico nuevo, un individuo de élite vuelve a
  evaluarse en otra calle, y solo se mantiene arriba el que maneja bien en
  varias.
- Por qué el enfriamiento ayuda: una fuerza alta al principio encuentra
  rápido redes que doblan, y una baja al final deja de romper lo que ya
  funciona. Con fuerza fija de 10 %, todos los hijos cambian todos sus pesos
  en cada generación, también cuando el padre ya maneja bien.
- Por qué las reglas que suben la mutación "cuando les va mal" no ayudan: con
  tráfico nuevo, a una generación le puede ir mal por la calle que le tocó, y
  la regla se dispara sin motivo.
- Por qué la irregularidad cuesta tanto: con 50 % hay filas a 31 m de la
  siguiente, contra 44 m parejos con 0 %, y queda menos lugar para cambiar de
  carril.

## Goals / Non-Goals

**Goals:**

- Que la ventaja sobre el tráfico sea una función de fitness más, calculada
  en el núcleo, sin DOM y determinista.
- Que los valores por defecto nuevos se definan en un solo lugar y la pestaña
  los tome de ahí.
- Que el costo por paso no cambie de orden: nada que recorra el tráfico por
  cada auto y cada paso.
- Dejar una comprobación repetible de que la población aprende.

**Non-Goals:**

- Cambiar la selección, el operador de mutación, el cruce, el fin de
  generación, la regla de los lentos o la selección manual.
- Cambiar el formato de los cerebros o migrar los guardados.
- Tocar las pestañas 1 y 2.

## Decisions

### D1. La ventaja se registra en las estadísticas de cada auto

`createStats()` suma `lead: 0`. `recordStep(stats, agent, trafficAdvance = 0)`
recibe cuánto avanzó el tráfico desde que empezó la generación
(`TRAFFIC_SPEED × world.time`) y guarda
`lead = max(lead, agent.progress − trafficAdvance)`. `fitnessOf('lead', stats)`
devuelve `max(0, stats.lead)`.

- Como `recordStep` no hace nada con un auto fuera de carrera, la ventaja
  queda fija al chocar o al salir por lento, igual que la distancia.
- El tercer parámetro es opcional para no romper las llamadas existentes de
  las pruebas.
- `FITNESS_KINDS` pasa a `['lead', 'distance', 'survival', 'speed']`: es el
  orden del selector. `DEFAULT_EVOLUTION.fitness` pasa a `'lead'`.

Alternativa descartada: calcular la ventaja al final de la generación a partir
de la distancia y el tiempo en carrera. No sirve: lo que cuenta es la mayor
ventaja alcanzada, y un auto que frena la pierde.

Alternativa descartada: contar vehículos enteros como fitness. Medido: 6,4
contra 8,8. Da muchos empates y no distingue a quien casi pasa de quien ni lo
intenta.

### D2. Vehículos superados: una lista por generación y un índice por auto

Un vehículo que empezó en la distancia `d0` está en `d0 + TRAFFIC_SPEED × t`.
Queda entero detrás del auto cuando `d0 < ventaja − CAR_LENGTH`, que es el
mismo criterio de las pestañas 1 y 2 (`relativePosition` en
`src/tabs/shared/attempt.js`). Entonces:

- Al empezar la generación, el entrenamiento pide una vez los vehículos del
  instante 0 entre 0 y el máximo de ventaja posible
  (`(maxSpeed − TRAFFIC_SPEED) × maxDuration`, más un margen de un largo de
  auto) y guarda sus distancias ordenadas.
- Cada auto lleva en sus estadísticas `passed`, que es un índice en esa lista:
  cuando su `lead` sube, avanza mientras `distancias[passed] < lead − CAR_LENGTH`.
- `training.passedOf(i = leaderIndex)` devuelve ese número.

El costo por paso y por auto es constante. La lista se arma una vez por
generación: unos 20 vehículos con los valores por defecto y del orden de mil
con velocidad, duración y densidad al máximo.

Alternativa descartada: consultar `world.vehiclesIn` para el líder en cada
cuadro. La cuenta bajaría cuando el líder choca y el tráfico lo vuelve a
pasar, y a velocidad máxima la misión podría no enterarse de un pico.

### D3. Valores por defecto y límites

- `EVOLUTION_LIMITS.elite` pasa a `{ min: 0, max: 20, default: 10 }`.
- `eliteCount(population, elite)` y `normalizeEvolution` acotan la élite a
  `Math.floor(population / 2)` en lugar de `population − 1`. Con población 2
  sigue dando 1; con 3 pasa de 2 a 1.
- `DEFAULT_TRAINING_CONFIG.irregularity` pasa a 0, con una constante propia
  (`TRAINING_IRREGULARITY`) en `training.js`. `DEFAULT_TRAFFIC` no cambia: es
  el de las pestañas 1 y 2.
- La pestaña no necesita cambios para los valores por defecto ni para el
  rango de la élite: los lee de estas constantes.

### D4. Unidad propia para la ventaja

`FITNESS_UNITS.lead = 'metersAhead'`. Los dos lugares que redondean un fitness
(`fitnessText` en `src/tabs/train/session.js` y su equivalente en
`src/ui/library-view.js`) tratan `metersAhead` como `meters`: sin decimales,
hacia abajo. Los textos por unidad se agregan con la misma forma que los
existentes (D7).

### D5. Pestaña: cuarto indicador y misión

- `statStrip` recibe un cuarto indicador, `passed`. Su valor sale de
  `training.passedOf()` en el mismo lugar donde se actualizan los otros tres.
- `indicators(training)` suma `passed`.
- En `MISSIONS`, `{ id: 'distance', goal: 300, unit: 'meters' }` se reemplaza
  por `{ id: 'passed', goal: 5, unit: 'count' }`. `observe(training)` guarda
  el máximo de `training.passedOf()` en lugar de la distancia del líder.
- La misión de "otra función de fitness" compara con
  `DEFAULT_TRAINING_CONFIG.fitness` en lugar de con `'distance'`.
- El selector de fitness ya se arma con `FITNESS_KINDS`: pasa a cuatro
  opciones sin más cambios. Si las cuatro no entran en un renglón a 360 px, se
  parte en dos renglones de dos; las etiquetas no se abrevian.

### D6. Comprobación de aprendizaje, fuera de `npm test`

`tools/measure-learning.mjs`, con `"test:learning": "node tools/measure-learning.mjs"`
en `package.json`. Usa solo el núcleo. Protocolo, igual al de la medición:

1. Para cada semilla de 1 a 8: `createTraining({ seed })` con los valores por
   defecto, y avanzar hasta completar 60 generaciones.
2. Al terminar cada generación de la 51 a la 60, tomar el cerebro del
   entrenamiento y hacerlo manejar solo, 60 s, en los tráficos de semillas
   5000 a 5009, con los carriles, la densidad y la irregularidad del
   entrenamiento y velocidad máxima 20.
3. En cada manejo, contar los vehículos con `d0 < ventaja − CAR_LENGTH`, con
   la mayor ventaja del manejo.
4. Promediar los 800 manejos. Repetir todo con `fitness: 'distance'`.

Imprime una tabla (promedio, por semilla y porcentaje de manejos que chocan) y
termina con error si el primer promedio es menor que 8, si el de alguna
semilla es menor que 5 o si el segundo promedio es mayor que 2. Tarda del
orden de cinco minutos.

No va en `npm test` porque la suite tarda hoy unos 4 s. En `npm test` sí va
una versión corta y determinista: que dos corridas de la medida con una sola
semilla y 5 generaciones den exactamente lo mismo.

Valores esperados si la implementación coincide con la medición: 13,3 con los
valores por defecto (por semilla, la primera fila de la tabla de Context) y
0,6 con la función distancia. Un valor distinto que cumpla los umbrales no es
un error, pero se informa.

### D7. Textos

Claves nuevas o que cambian, en español e inglés:

| Clave | Español |
|---|---|
| `train.fitness.lead` | Ventaja |
| `help.train.fitness.lead.what` | Premia los metros que cada auto le saca al tráfico: lo que avanzó menos lo que avanzó el tráfico en ese tiempo. |
| `help.train.fitness.lead.why` | Seguir a un vehículo no suma nada; pasarlo, sí. Cuidado: premia arriesgarse, y un auto puede pasar a varios y chocar. |
| `help.train.fitness.distance.why` | Cuidado: ir detrás de un vehículo sin chocar recorre mucha distancia, y la población puede aprender a seguir al tráfico en lugar de pasarlo. |
| `help.train.setting.elite.why` | Lo mejor que se encontró no se pierde. Con tráfico nuevo, la élite vuelve a evaluarse cada generación en una calle distinta. |
| `help.train.setting.irregularity.what` | Cuánto varían las distancias y posiciones de los vehículos. En 0 % van en filas parejas. Rige desde la próxima generación. |
| `help.train.setting.irregularity.why` | Las filas parejas son el caso más fácil de aprender. Subila para plantearle a la población un problema más difícil. |
| `train.setting.mutationCooling` | Enfriar la mutación |
| `help.train.setting.mutationCooling.what` | La fuerza de mutación empieza en 30 % y baja un 5 % en cada generación, hasta 3 %. Apagado, queda fija en el valor del deslizador. |
| `help.train.setting.mutationCooling.why` | Al principio conviene probar redes muy distintas; cuando alguna ya maneja, conviene afinarla sin romperla. |
| `help.train.setting.coolingInManual.what` | Con selección manual el enfriamiento no se usa: la fuerza es la del deslizador. Conserva su valor. |
| `help.train.setting.coolingInManual.why` | Elegís vos al padre y también cuánto cambian sus hijos; el enfriamiento vuelve a regir con selección automática. |
| `help.train.setting.strengthCooling.what` | Con el enfriamiento encendido la fuerza baja sola en cada generación; este es el valor de la próxima. |
| `help.train.setting.strengthCooling.why` | Apagá «Enfriar la mutación» para fijarla a mano. |
| `train.stats.passed` | Superados por el líder |
| `train.mission.passed` | Un auto que supere {goal} vehículos |
| `train.value.metersAhead` | {value} m de ventaja |
| `train.chart.unit.metersAhead` | m de ventaja |
| `train.last.best.metersAhead` | Generación {generation}: el mejor le sacó {value} m al tráfico. |
| `train.parent.leader.metersAhead` | Padre: el líder de la generación {generation}, que llevaba {value} m de ventaja. |
| `train.parent.champion.metersAhead` | Padre: el mejor de la generación {generation}, con {value} m de ventaja. |

Se quita `train.mission.distance`. El inglés usa "Lead" para la función y
"m ahead" para la unidad.

### D8. Pruebas existentes que cambian

Regla: una prueba que dependía de un valor por defecto para probar otra cosa
pasa a pedirlo de forma explícita (`elite: 1`, `fitness: 'distance'`,
`irregularity: 50`) y sus aserciones no cambian. Solo cambian de valor
esperado las pruebas que tratan de los valores por defecto o de lo que este
cambio modifica:

- `tests/evolution.test.js`: los valores por defecto y los límites de
  `normalizeEvolution` (líneas 203 y 206), el tope de la élite (`elite: 25`
  queda en 20) y `eliteCount(3, 10)`, que pasa a 1.
- `tests/training.test.js`: la configuración por defecto (líneas 59 y 60).
- `tests/train-settings.test.js`: los valores por defecto (líneas 14 a 16).
- `tests/train-session.test.js`: la misión de distancia y la de otra función
  de fitness.

Las pruebas de `training.test.js` que usan poblaciones chicas con la
configuración por defecto y esperan `eliteCount` 1, o un cerebro con
`elite: 1`, pasan a pedir `elite: 1` explícito. Las que comprueban el efecto
de la fuerza de mutación con selección automática pasan a pedir
`mutationCooling: false`.

Las aserciones que enumeran todas las claves de la configuración por defecto
o de `training.evolution` de un cerebro suman la clave `mutationCooling`: es
la regla de siempre, solo pueden ganar claves.

### D9. Enfriamiento de la mutación

- En `src/core/evolution.js`: `MUTATION_COOLING = { start: 30, factor: 0.95, floor: 3 }`
  y `cooledStrength(generation) = max(floor, start × factor^generation)`,
  donde `generation` es el número de la generación que acaba de terminar.
- En `src/core/training.js`: la configuración suma `mutationCooling` (verdadero
  por defecto), que se normaliza como `slowRule`. Al armar una generación con
  selección automática y el enfriamiento encendido, se llama a
  `nextGeneration` con la fuerza `cooledStrength(generationsDone)`, calculada
  después de contar la generación que termina. Con el enfriamiento apagado o
  con selección manual se usa `config.mutationStrength`, como hoy.
- Al continuar desde un cerebro con selección automática y enfriamiento, la
  población inicial se muta con `cooledStrength(brain.training.generations)`.
- `training.nextMutationStrength` devuelve la fuerza con que se armaría la
  generación siguiente si la actual terminara ahora: es lo que muestra el
  deslizador.
- El cerebro registra `mutationCooling` en `training.evolution`. La biblioteca
  no lo muestra en este cambio.
- Pestaña: `mutationCooling` es un ajuste más de `settings.js` (grupo
  `nextGeneration`), con un interruptor en la configuración básica, debajo de
  la fuerza. Mientras el enfriamiento está en uso, el deslizador de la fuerza
  queda con `aria-disabled`, muestra `Math.round(training.nextMutationStrength)`
  y usa la ayuda `train.setting.strengthCooling`. Al apagar el interruptor,
  la pestaña fija `mutationStrength` en ese valor redondeado, para que la
  fuerza no salte. Con selección manual, el interruptor queda deshabilitado
  igual que selección, élite y cruce, pero con su propia ayuda
  (`train.setting.coolingInManual`), y el deslizador se puede editar.

Los tres números salen de la medición: de 30 % a 5 % da 10,7; de 20 % a 2 %,
8,8; con factor 0,97, 9,4; contra 13,3 de la regla elegida.

Alternativa descartada: reglas que reaccionan al resultado (subir la fuerza
cuando nadie pasa el primer grupo o tras 5 generaciones sin mejora, y una
regla tipo 1/5). Medidas: entre 5,3 y 7,7, contra 8,8 de la fuerza fija.

Alternativa descartada: que el número de generación del enfriamiento vuelva a
cero al continuar desde un cerebro. Volvería a mutar con 30 % una red que ya
maneja.

## Risks / Trade-offs

- [Los autos pasan y chocan: el 44 % de los manejos de prueba termina en
  choque a las 60 generaciones y el 28 % a las 100] → El tooltip de la ventaja
  lo advierte. Es parte de lo que se ve: se premia pasar, no llegar.
- [Con la fuerza en 3 %, una población que quedó mal ya casi no cambia] → En
  la medición no pasó en ninguna de las 8 semillas. Si pasa, apagar el
  enfriamiento y subir la fuerza, o "población nueva", lo resuelven.
- [Quien sube la irregularidad después de la generación 45 entrena con fuerza
  3 %] → Es una fuerza baja para un problema nuevo. El tooltip del
  enfriamiento dice que se puede apagar; no se agrega una regla automática
  porque las que se midieron no ayudan.
- [Un deslizador que se mueve solo y no se puede tocar puede confundir] →
  Verificar en el navegador que el tooltip y el interruptor, uno debajo del
  otro, se entienden; si no, se consulta.
- [Diez autos con la marca de élite en lugar de uno] → Verificar en el
  navegador que la marca no tapa al líder ni ensucia el escenario; si molesta,
  se consulta antes de cambiarla.
- [Quien ya usaba la pestaña encuentra el tráfico en filas parejas] → Es un
  valor por defecto, no un límite: la irregularidad sigue en la sección
  avanzada y su tooltip lo explica.
- [La implementación da números distintos a los medidos] → D6 fija umbrales
  con margen (8 contra 13,3, 5 por semilla contra un mínimo de 10,8, y 2
  contra 0,6) y manda consultar si no se cumplen.
- [Con población 3, la élite baja de 2 a 1] → Es el efecto buscado del tope a
  la mitad; ninguna configuración por defecto lo nota.

## Migration Plan

No hay datos que migrar. Los cerebros guardados conservan su función y su
unidad. Los valores por defecto nuevos rigen al empezar un entrenamiento o al
restablecer la configuración. Para volver atrás alcanza con revertir el
cambio: ningún cerebro guardado con la función nueva deja de abrirse, porque
la unidad desconocida se muestra en metros.
