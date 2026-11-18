# Tasks

## 1. Antes

- [x] 1.1 Copiar `borradores/entrenar-mesa-de-trabajo/capturar.mjs` a `borradores/entrenar-la-generacion-ensena/capturar.mjs` con las vistas de D7, y sacar el antes en `antes/` sobre el commit de partida, con su `indice.md`. Verificación: el índice lista las vistas. Las del corte, en el antes, muestran la generación siguiente ya arrancada, sin corte.

  *Hecho: `borradores/entrenar-la-generacion-ensena/capturar.mjs`, copia del guion de `entrenar-mesa-de-trabajo` con las vistas de D7: 19 el corte a 1440×900 y a 1366×768, 20 el corte con selección manual, 22 el corte en inglés (con Siguiente a 1× y 300 ms de reloj virtual), y 21 la curva con una marca señalada, en español y en inglés: en la generación 1 se apaga el enfriamiento y la fuerza va a 40 %; se terminan tres generaciones esperando 2,6 s entre una y otra, y se posa el mouse sobre el punto de la 2. Mide la tarjeta del corte, el renglón de la red, las marcas de la curva y su lectura. Con `--solo`, las medidas se suman a las que ya había. El antes está en `antes/`, sobre `e2a2c41` sin tocar `src/` ni `styles/`.*

  *Medido (antes): en las vistas 19, 20 y 22 la generación 2 ya arrancó, sin tarjeta ni renglón de la red; en la 21, la curva no tiene marcas y la lectura dice solo el mejor y el promedio. Una vista (11, el tooltip) no respondió en 90 s en la primera corrida; repetida sola, salió.*

## 2. El núcleo

- [x] 2.1 `nextGeneration` devuelve `sample: { index, base }` del primer hijo no élite, sin consumir azar (D1). `training.mutationSample` expone la muestra de la generación en curso, también con la selección manual (índice 1, padre como base). Sin hijos mutados, `null`. Pruebas: escenarios "Muestra por defecto", "Fuerza cero", "Con selección manual" y "Sin hijos mutados" de *Muestra de la mutación*. Verificación: `npm test`.

  *Hecho: `nextGeneration` guarda `sample = { index, base }` al armar el primer hijo no élite (la `base` que ya existía en el bucle, sin consumir azar) y lo devuelve junto a lo de antes. `training` guarda la muestra al cerrar la generación: la de `nextGeneration` con la selección automática; `{ index: 1, base: padre }` con la manual y un padre; `null` sin padre o en la población inicial. `training.mutationSample` devuelve `{ index, base, network }`. También `training.breeding` (`mode`, `elite`, `rest`, `selection`, `strength`), con lo que la tarjeta escribe sus números.*

  *Medido: `tests/mutation-sample.test.js` cubre "Muestra por defecto", "Fuerza cero", "Con selección manual" y "Sin hijos mutados", más una prueba de que `nextGeneration` da las mismas redes con la misma semilla. "Población de élite sola" no se puede armar con la configuración: la élite nunca pasa de la mitad de la población, así que no tiene prueba.*

- [x] 2.2 `mutationDiff(base, network)`, pura, con las claves del formato de `marks` del inspector. Pruebas: fuerza 0 da vacío; fuerza 100 % y probabilidad 100 % marca todos los pesos y sesgos; probabilidad 1 % marca pocos. Verificación: `npm test`.

  *Hecho: `mutationDiff(base, network)` en `evolution.js`, pura. Devuelve `{ changedWeights, changedBiases, total }`, con las claves del inspector (`'l:j:i'` y `'l:j'`, la capa contada desde las entradas, así que la capa k de la red es la k + 1).*

  *Medido: pruebas de fuerza 0 (vacío), de fuerza y probabilidad 100 % (todos, con claves como `1:0:0`, `2:2:3` y `1:3`) y de probabilidad 1 % (pocos, menos del 5 %). Tras la decisión de la parada de la 4.2, devuelve también `meanChange`, el promedio de |nuevo − anterior| de lo que cambió, con su prueba (0 sin cambios, 0,3 con dos cambios de 0,5 y 0,1, y crece con la fuerza).*

- [x] 2.3 Determinismo: una prueba que corre diez generaciones con la misma semilla y compara el mejor fitness y una huella de las redes contra valores fijados con el código de antes del cambio (escenario "Mismo resultado"). Verificación: `npm test`.

  *Hecho: `tests/generation-determinism.test.js` corre diez generaciones (40 autos, 240 pasos cada una, cerradas a pedido) en tres casos (por defecto, con cruce, y sin enfriamiento con fuerza 40 % y probabilidad 50 %) y compara el mejor, el promedio y una huella FNV de todas las redes de cada generación.*

  *Medido: los valores se fijaron con el código de `e2a2c41`, antes de tocar `evolution.js` y `training.js`, y las tres pruebas pasaron sobre ese código. Con la muestra y `record.changes` siguen pasando: mismo mejor, mismo promedio y mismas redes en las diez generaciones de los tres casos ("Mismo resultado").*

- [x] 2.4 Cambios en el historial (D2): `record.changes` con `{ key, from, to }` de lo que la persona dejó pendiente, en la generación en que empieza a regir. El enfriamiento no cuenta. Pruebas: escenarios de *Cambios que rigen en cada generación*. Verificación: `npm test`.

  *Hecho: en `finishGeneration`, antes de aplicar `pending`, se guarda la configuración; después, los cambios `{ key, from, to }` quedan como cambios de la generación que empieza y se copian a su registro al cerrarla (`record.changes`, vacío si no hubo). Con la fuerza de mutación, `from` y `to` son la fuerza que regía: con el enfriamiento, la enfriada, que es la que muestra el ajuste. Así, apagar el enfriamiento y subir la fuerza se lee «29 % → 40 %» como pide el escenario, y no «10 % → 40 %» desde el valor guardado debajo. La fuerza solo aparece si la persona cambió esa clave; la que baja sola no cuenta.*

  *Medido: pruebas de "Cambio de la fuerza" (el registro de la 4 tiene el enfriamiento y la fuerza, desde la que se mostraba hasta 40; el de la 3, nada), "Sin cambios" (cinco generaciones con la fuerza bajando, ningún cambio) y "Varios cambios juntos" (población y élite).*

## 3. El corte

- [x] 3.1 Estado del corte sin DOM (`src/tabs/train/cut.js`): entrar solo con la guía activa y 1× o 2×; terminar a los 2000 ms; la pausa congela el tiempo; Siguiente termina el corte; pasar a 4× o más lo termina. Pruebas de cada transición. Verificación: `npm test`.

  *Hecho: `src/tabs/train/cut.js` (`createCut`, `cutApplies`, `CUT_MS` = 2000, `CUT_SPEEDS` = 1 y 2).*

  *Medido: `tests/train-cut.test.js` cubre entrar solo con la guía y a 1× o 2×, terminar a los 2000 ms, la pausa que congela el tiempo, entrar en pausa, Siguiente, pasar a 4× o Máx., y `end`.*

- [x] 3.2 Conectar el corte al bucle y a `onGeneration`: durante el corte no se llama a `step()`, la escena se sigue dibujando y Siguiente o N terminan el corte sin terminar la generación nueva. Prueba de que un entrenamiento con cortes simulados da el mismo historial que uno sin cortes (escenario "Mismo entrenamiento"). Verificación: `npm test`; escenarios "Estado por defecto", "Rápido sin corte", "Guía apagada", "Pausar durante el corte" y "Seguir enseguida" en el navegador.

  *Hecho: en `index.js`, `onGeneration` entra en el corte con la guía activa, la página a la vista y 1× o 2× (`cut.enter`); el `step` del bucle no hace nada mientras dura, y `render` lo hace avanzar con el reloj (`performance.now`) y lo termina si se apaga la guía. Siguiente y N terminan el corte sin cerrar la generación nueva; pasar a 4× o más lo termina; reiniciar o una población nueva también. La pausa lo congela y, como pide "Pausar durante el corte", al reanudar arranca la generación (en el estado de `cut.js` la pausa solo congela el tiempo; terminar al reanudar lo decide la pestaña).*

  *Medido: `tests/train-cut.test.js`, "mismo entrenamiento": un bucle con cortes simulados (cuatro cortes de unos 125 cuadros de 16 ms) da el mismo historial que uno sin cortes. En el navegador, con el guion y reloj virtual (`verificacion/verificacion.json`):*
  - *"Estado por defecto": a los 300 y a los 1300 ms el corte está a la vista, la generación es la 2 y el líder no avanzó; a los 2300 ms el corte terminó y el líder avanzó 5,8 m.*
  - *"Rápido sin corte": a 4× y a 8×, 300 ms después de Siguiente no hay corte y la generación ya avanzó.*
  - *"Guía apagada": no hay corte.*
  - *"Pausar durante el corte": en pausa, a los 5 s el corte sigue a la vista; al reanudar terminó y la generación arrancó.*
  - *"Seguir enseguida": N termina el corte y la generación sigue siendo la 2.*

  *No probado con el guion: Máx., porque con el reloj virtual el bucle no termina su cuadro. En tiempo real (`medir-fluidez.mjs`, tarea 6.1) a Máx. pasaron 4 o 5 generaciones en 2 s sin ningún corte.*

## 4. La escena y la tarjeta

- [x] 4.1 Tarjeta de generación en la columna de avisos de la escena, `role="status"`, con sus tres variantes y textos con parámetros en `es.js` y `en.js` (D4). Verificación: escenarios de *Tarjeta de generación*; las pruebas de i18n y de largo de textos; `mlLab.auditSistema()` y `auditHierarchy()` sin problemas nuevos.

  *Hecho: la tarjeta del corte (`.cut-card`, `role="status"`) va última en la columna de avisos de la escena (`view.corner`), con fondo de tarjeta y borde del color de la élite. Lleva un título («Así nace la generación {generation}»), la fila de rombos de la élite y el texto, con variantes para la selección automática (élite de muchos, de uno o de ninguno), manual con padre y manual sin padre, todos con parámetros, en `es.js` y `en.js`. Los números salen de `training.breeding`.*

  *Medido (guion): con los valores por defecto, «Los 10 mejores pasan tal cual. Los otros 390 son hijos del 10 % mejor, con mutación de fuerza 29 %.» ("Por defecto"; 29 es la fuerza enfriada con que se armó la 2); con la selección manual, «Una copia del padre que elegiste pasa tal cual. Los otros 399 son sus hijos, con mutación de fuerza 10 %.»; en inglés, «How generation 2 is born | The 10 best pass on unchanged…» ("Idioma"). La tarjeta va de y 203 a 293 a los dos tamaños, sin tapar el auto del foco. `npm test` (i18n y largo de textos) pasa, y `auditSistema()` y `auditHierarchy()` dan 0 en las vistas del corte. No hice la prueba de "Con selección manual" con un padre elegido en la generación 5: la vista 20 usa el campeón de la 1 como padre, que arma el mismo texto.*

  *No probado: el anuncio del `role="status"` con un lector de pantalla.*

- [x] 4.2 Resaltar la élite en la escena durante el corte: contorno propio, dibujada arriba de los demás, y los demás atenuados (D4). Verificación: la captura del corte a 1440×900 y a 1366×768, también en escala de grises. **Si en la captura no se distinguen los individuos de la élite entre los demás, parar y consultar**, con las capturas.

  *Decisión de la sesión de diseño tras la parada: opción (a), ver D4. La élite se cuenta en la tarjeta con una fila de marcas y en la escena se marca el auto del foco. Verificación nueva: la fila de marcas con la cantidad de la élite (10 por defecto, 1 con la selección manual), legible en escala de grises, y el auto del foco marcado en la captura del corte. Además (D5), el renglón de la red suma el cambio promedio y `mutationDiff` lo devuelve, con su prueba.*

  *Parada (18 de noviembre de 2026), consultada a la sesión de diseño. Medido en el núcleo: al armar la generación nueva, los 400 autos están en el mismo punto de la largada (1 posición distinta de 400; la élite son los índices 0 a 9). En la captura 19 (`despues/19-entrenar-corte-1440.png`) se ve un solo auto, el del foco, con todos los demás debajo. Los individuos de la élite no se pueden distinguir porque están encimados en el mismo lugar, no por el contraste. Ya implementado: los demás se dibujan atenuados (`dimOthers`, opacidad 0,12) y la élite arriba, con su contorno y su rombo de siempre.*

  *Hecho tras la decisión: en la escena, el auto del foco (la copia del mejor) lleva la marca de élite durante el corte (`focusElite`: el contorno y el rombo, con una función `eliteMarks` separada de `drawElite`). Quité el atenuado de los demás, que en la largada no aportaba nada porque están todos debajo del foco. La tarjeta lleva una fila de rombos (`.cut-elite`), uno por individuo de la élite. Al arrancar la generación, el contorno y el rombo de siempre siguen igual.*

  *Medido (guion): diez rombos con los valores por defecto (captura 19) y uno con la selección manual (captura 20). En escala de grises (`19-entrenar-corte-1366-gris.png`) los diez rombos se leen; el auto del foco lleva el contorno y el rombo de la élite (recorte de la captura 19 a 1440×900).*

## 5. La red y la curva

- [x] 5.1 Durante el corte, la red del líder muestra `mutationSample.network` con las marcas de `mutationDiff` y el renglón "cambió N de M" (D5). Al terminar el corte vuelve la red en vivo. Verificación: escenarios de *La mutación en la red*; en la captura, las marcas se ven en escala de grises.

  *Hecho: `network-view.render` acepta `marks` (las claves del inspector) y dibuja un rombo del color del texto en el medio de cada conexión cambiada y arriba a la derecha de cada neurona con el sesgo cambiado: la misma forma que el inspector, sin traer el inspector (D5, segundo camino). Durante el corte, la tarjeta de la red dibuja una vez el hijo de la muestra, sin actividad, con `mutationDiff`, y un renglón arriba del diagrama: «Un hijo: la mutación cambió {changed} de {total} pesos y sesgos, en promedio {mean}». Al terminar el corte vuelve la red en vivo.*

  *Medido (guion): «Un hijo: la mutación cambió 70 de 70 pesos y sesgos, en promedio 0,19» con los valores por defecto (todos cambian, porque la probabilidad es 100 %), 0,07 con la selección manual a fuerza 10 %, y en inglés «… by 0.17 on average». Los rombos se ven en escala de grises (capturas 19 gris). Escenarios en el tiempo: a los 2300 ms el renglón ya no está ("Vuelta a la red en vivo"); con la red plegada, el corte ocurre igual y la tarjeta sigue plegada ("Red plegada").*

- [x] 5.2 `chartModel` devuelve las marcas, y el gráfico las dibuja con forma propia. La línea de valores suma los cambios con nombres y unidades en el idioma activo (D6). Pruebas del modelo: sin cambios no hay marcas; un cambio en la generación 4 da una marca en la 4; reiniciar las borra. Verificación: `npm test`; escenarios de *Cambios marcados en la curva* en el navegador.

  *Hecho: `chartModel` devuelve `marks` (`generation`, `x`, `changes`). `createFitnessChart` recibe `describeChanges`: con él dibuja un triángulo parado sobre el eje x (`.chart-change`, con `data-help`) arriba de la línea de la generación señalada, y la lectura suma los cambios de esa generación. Entrenar escribe los cambios con los nombres del panel (`train.setting.*`) y sus formatos (`%`, autos, s; sí y no; las opciones con sus nombres).*

  *Medido: `tests/chart-changes.test.js` (sin cambios no hay marcas; un cambio en la 4 da una marca en la 4, en la x de su punto; con otra función de fitness la marca queda en el primer punto de la curva nueva; un entrenamiento nuevo no tiene marcas). En el guion (vista 21): una marca, y al señalar la generación 2, «Generación 2: mejor 3,5 m de ventaja, promedio 1 m de ventaja. Fuerza de mutación: 29 % → 40 %; Enfriar la mutación: sí → no»; en inglés, «… Mutation strength: 29% → 40%; Cool down mutation: on → off» ("Marca después de un cambio", "Idioma"). Reiniciar borra las marcas porque borra el historial (prueba del modelo con un entrenamiento nuevo).*

- [x] 5.3 Textos y tooltips nuevos (la tarjeta, el renglón de la red y la marca de la curva) en los dos idiomas. Verificación: `mlLab.auditTooltips()` 0 y la prueba de i18n.

  *Hecho: `help.train.chart.change.what/why` y los textos de la tarjeta, del renglón de la red y de la curva, en los dos idiomas.*

  *Medido: la prueba de i18n (paridad y parámetros) pasa; `auditTooltips()` da 0 en las 29 vistas. El tooltip de la marca aparece al posar el mouse (vista 29). Para eso, el triángulo se dibuja arriba de la línea de la generación señalada, que antes le quitaba el puntero.*

## 6. Cierre

- [x] 6.1 Fluidez: medir con el guion de fluidez de Reglas a mano, o uno equivalente, a 1× durante un corte y a Máx. sin cortes. Verificación: cuadros por segundo y cuadro más lento anotados.

  *Hecho: `borradores/entrenar-la-generacion-ensena/medir-fluidez.mjs`, equivalente al de Reglas a mano: Chrome sin ventana con requestAnimationFrame verdadero, 1440×900, tres corridas.*

  *Medido: a 1× durante el corte (1,5 s de cuadros con el corte activo de punta a punta), 60 cuadros por segundo, mediana de 16,7 ms, el más lento de 16,8 ms y ninguno de más de 20 ms, en las tres corridas. A Máx. sin cortes (2 s), lo mismo, con 4 o 5 generaciones terminadas y el corte nunca activo.*

- [x] 6.2 `npm test` completo y las tres auditorías en las vistas del guion, en los dos idiomas. Verificación: resultados anotados.

  *Medido: `npm test`, 1457 pruebas, 0 fallas. En las 29 vistas del guion (español e inglés): `auditTooltips()` 0 y `auditHierarchy()` 0; `auditSistema()` 0 salvo las dos de después de guardar («compact Renombrar 24px» / «compact Rename 24px»), que ya estaba y no se arregló.*

- [x] 6.3 El después con el mismo guion y `comparacion.md`. Verificación: la comparación muestra el corte con la tarjeta, la élite resaltada, la red con las marcas y la curva con una marca.

  *Hecho: `despues/` con el mismo guion, `verificacion/` con los escenarios en el tiempo y `comparacion.md`, con el antes y el después del corte con la tarjeta, la élite contada y el foco marcado, la red con los rombos y la curva con su marca y la lectura de los cambios.*

  *Medido: en el guion, la generación 1 da los mismos números antes y después del cambio («mejor 27 m de ventaja, promedio 1,8 m» a 1440×900). En la vista 21, el mejor de la generación 2 difiere (23,7 contra 3,5 m), pero no por determinismo: en el después, 2 de los 2,6 s entre Siguiente y Siguiente son del corte, así que la generación 2 corre menos pasos antes de cerrarse a pedido.*

- [x] 6.4 Verificación en el navegador contra el filtro de entrada: el corte se entiende sin explicación; con la guía apagada o a 4× no hay corte; Siguiente lo saltea; reiniciar borra las marcas. Anotar lo que no se pudo probar.

  *Observado: el corte se entiende con lo que muestra (título, rombos y una frase con los números reales; la red marca lo que cambió). Con la guía apagada o a 4× y 8× no hay corte, y a Máx. tampoco (medido en tiempo real). Siguiente y N lo saltean sin pasar de generación. Reiniciar borra las marcas, porque borra el historial (prueba del modelo).*

  *No probado: el anuncio de la tarjeta con un lector de pantalla; Firefox; una ventana visible (todo fue Chrome sin ventana); que la explicación se entienda sin ayuda, lo que solo se sabe con personas.*

## Workflow follow-up

- Archivar con `/opsx:archive` después de revisar `comparacion.md`.
- Sigue `entrenar-mutacion-a-la-vista`.
