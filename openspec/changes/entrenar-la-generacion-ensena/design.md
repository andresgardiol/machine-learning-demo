# Design

## Context

- `finishGeneration` (`src/core/training.js`) registra el historial y al campeón, aplica `pending`, arma la población con `nextGeneration` o `childrenOf` (selección manual), llama a `startGeneration()` y avisa a los oyentes de `onGeneration(record)`. Cuando avisa, la generación nueva ya está armada en la largada.
- `nextGeneration` (`src/core/evolution.js`) copia la élite (`ranked[0..eliteN)`) a las posiciones `0..eliteN-1`. Cada hijo restante sale de `crossover` o de un padre, y después de `mutate(base, …, random)`. `mutate` no modifica `base`. `childrenOf` pone la copia del padre en la posición 0 y los mutados después.
- `changedKeys(before, after)` ya existe en `training.js`. El enfriamiento cambia la fuerza en `strengthFor`, no en `config`.
- El tablero de Entrenar dibuja la red del líder con `createNetworkView` (`render/network-view.js`). El inspector (`render/network-inspector.js`) ya sabe marcar pesos y sesgos cambiados (`marks.changedWeights` y `changedBiases`), con su forma propia.
- La curva (`ui/chart.js`) sale de `chartModel`, una función pura probada en Node. Los valores de la generación señalada se leen en una línea de texto debajo del gráfico.
- El bucle de la pestaña (`ui/loop.js`) llama a `step()` según la velocidad. Máx. corre muchos pasos por cuadro.

## Goals / Non-Goals

**Goals:**
- Que lo que se muestra en el corte salga del cálculo real (Art. 7) y no cambie el resultado (Art. 8).
- Que el núcleo siga sin DOM y que el corte sea solo de la interfaz.

**Non-Goals:**
- Mostrar el linaje completo (de quién es hijo cada auto).
- Animaciones de transición: el corte es un estado quieto.

## Decisions

### D1. La muestra de la mutación, en el núcleo y sin azar

- `nextGeneration` devuelve además `sample: { index, base }`, del primer hijo no élite: `index` es su posición y `base` es la red que se pasó a `mutate` (la copia del padre o el resultado del cruce). `base` ya existe en el bucle, así que guardarla no consume azar.
- `childrenOf` devuelve la población como hoy. `training` arma la muestra con el índice 1 y el padre como `base`.
- Sin hijos mutados (población de élite sola, o selección manual sin padre) no hay muestra.
- `training.mutationSample` expone `{ index, base, network }` de la generación en curso, o `null`.
- La comparación (qué pesos y sesgos difieren) es una función pura, `mutationDiff(base, network)`, que devuelve las claves en el formato de `marks` del inspector (`'l:j:i'` y `'l:j'`).

*Por qué el primer hijo no élite:* es determinista, existe siempre que haya mutación y no hay que elegir. *Alternativa descartada:* el hijo con más cambios. Muestra el caso extremo y no el típico.

Si cambiar la forma que devuelve `nextGeneration` rompe a quienes la llaman, se agrega el campo sin quitar ninguno.

### D2. Los cambios de cada generación, en el historial

- En `finishGeneration`, antes de aplicar `pending`, se guarda `before = config`. Después, `changes = changedKeys(before, config)` con `{ key, from, to }`.
- Se guardan como `startChanges` de la generación que empieza, y se copian a su registro cuando termina (`record.changes`).
- Lo que cuenta es lo que la persona dejó en `pending`. La fuerza que baja sola no está en `config`, así que no aparece.
- Los cambios de escenario rigen al instante y reinician la generación (`restartGeneration`). No pasan por `pending`, así que no cuentan.

*Alternativa descartada:* marcar en la curva la generación en que se tocó el ajuste. El efecto empieza en la siguiente, y la marca tiene que estar donde empieza el efecto.

### D3. El corte, en la interfaz

- Cuando `onGeneration` avisa, con la guía activa y la velocidad en 1× o 2×, la pestaña entra en `cut` durante 2000 ms de reloj: el bucle no llama a `step()`, pero sigue dibujando. Al vencer el tiempo, vuelve a `running`.
- Estado chico, probado sin DOM (`cut.js`, junto a `session.js`): `running → cut → running`, con `pause` (cut + pausa: el tiempo no corre) y `next` (termina el corte sin llamar a `finishGeneration`).
- Mientras dura el corte, Siguiente y su atajo N terminan el corte y no la generación nueva.
- A 4× o más, con la guía apagada o con la pestaña oculta, no se entra en `cut`. Si la persona cambia la velocidad a 4× durante el corte, el corte termina.
- Como el corte no llama a `step()`, la simulación no cambia (Art. 8). La prueba compara un entrenamiento con cortes simulados contra uno sin cortes.

*Por qué 2 s:* alcanza para leer una frase de 15 palabras y ver la élite. *Alternativa descartada:* que el corte espere a que la persona toque algo. Frena el entrenamiento de quien solo mira.

### D4. La escena y la tarjeta durante el corte

- **La escena:** la vista ya muestra la generación nueva en la largada. Los índices `0..eliteCount-1` se dibujan con un contorno propio (resaltados) y los demás con menor opacidad.
  - Con 400 autos encimados en la largada, el contorno tiene que verse sobre el montón. Se dibuja la élite al final, arriba de los demás.
  - Con la selección manual, el resaltado es para la copia del padre (índice 0).
- **La tarjeta de generación:** va en la esquina de la escena (`view.corner`, donde están los rótulos de generación y pausa), con fondo de tarjeta, sin tapar el centro de la calle. Es `role="status"`. Los textos tienen parámetros (`elite`, `rest`, `selection`, `strength`) y tres variantes: automática, manual con padre y manual sin padre.

*Alternativa descartada:* la tarjeta en el tablero. Queda lejos de la escena, que es donde se mira en ese momento.

### D5. La red de la muestra

Durante el corte, la tarjeta de la red dibuja `mutationSample.network` sin actividad en vivo, con las marcas de `mutationDiff`. Debajo va un renglón: "Un hijo: la mutación cambió 37 de 48 pesos y sesgos".

Para las marcas hay dos caminos, en este orden:
- reusar la marca de lo cambiado del inspector, si `network-view` puede recibir `marks` sin traer el inspector entero;
- si no, una marca propia en `network-view`, con forma (por ejemplo, un punto en el medio de la conexión, como el inspector), no solo con color.

### D6. Las marcas en la curva

- `chartModel` recibe el historial con `changes` y devuelve `marks: [{ generation, x, changes }]`.
- La marca es un triángulo chico sobre el eje x (forma, no color).
- Al señalar una generación, la línea de valores suma los cambios: "Fuerza de mutación: 29 % → 40 %".
- Los nombres de los ajustes salen de las claves de i18n que ya usa el panel. Los valores se formatean como en el panel, con su unidad.
- Si la función de fitness cambió, la curva ya empieza de nuevo. La marca de ese cambio queda en el primer punto de la curva nueva.

### D7. Capturas

Se copia `borradores/entrenar-mesa-de-trabajo/capturar.mjs` a `borradores/entrenar-la-generacion-ensena/`, con estas vistas nuevas:
- el corte a 1440×900 y a 1366×768;
- el corte con la selección manual;
- la curva con una marca señalada;
- el corte en inglés.

Para sacar el corte sin esperar 2 s reales, se usa Siguiente generación con la velocidad en 1×. El reloj virtual del guion lo deja quieto.

## Risks / Trade-offs

- [El corte alarga el entrenamiento a 1×: 2 s por generación.] → Solo a 1× y 2× y con la guía activa. El mentor lo saltea con la velocidad.
- [La élite resaltada en la largada puede no distinguirse entre 400 autos encimados.] → Se dibuja arriba, con contorno. Se mide en la captura. Si no se distingue, parar y consultar (tarea 4.2).
- [Agregar `sample` puede cambiar el consumo de azar si se implementa mal.] → La prueba de determinismo de D3, más una que compara redes generación por generación contra el código de antes.
- [La tarjeta en la esquina tapa los avisos de generación y pausa.] → Va en la misma columna de avisos, debajo de ellos.
- Rendimiento: el corte deja la escena quieta. La red de la muestra se dibuja una vez por corte, no en cada cuadro.
