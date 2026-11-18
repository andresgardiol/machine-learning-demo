# Tasks

## 1. Antes

- [ ] 1.1 Copiar `borradores/entrenar-mesa-de-trabajo/capturar.mjs` a `borradores/entrenar-la-generacion-ensena/capturar.mjs` con las vistas de D7, y sacar el antes en `antes/` sobre el commit de partida, con su `indice.md`. Verificación: el índice lista las vistas. Las del corte, en el antes, muestran la generación siguiente ya arrancada, sin corte.

## 2. El núcleo

- [ ] 2.1 `nextGeneration` devuelve `sample: { index, base }` del primer hijo no élite, sin consumir azar (D1). `training.mutationSample` expone la muestra de la generación en curso, también con la selección manual (índice 1, padre como base). Sin hijos mutados, `null`. Pruebas: escenarios "Muestra por defecto", "Fuerza cero", "Con selección manual" y "Sin hijos mutados" de *Muestra de la mutación*. Verificación: `npm test`.
- [ ] 2.2 `mutationDiff(base, network)`, pura, con las claves del formato de `marks` del inspector. Pruebas: fuerza 0 da vacío; fuerza 100 % y probabilidad 100 % marca todos los pesos y sesgos; probabilidad 1 % marca pocos. Verificación: `npm test`.
- [ ] 2.3 Determinismo: una prueba que corre diez generaciones con la misma semilla y compara el mejor fitness y una huella de las redes contra valores fijados con el código de antes del cambio (escenario "Mismo resultado"). Verificación: `npm test`.
- [ ] 2.4 Cambios en el historial (D2): `record.changes` con `{ key, from, to }` de lo que la persona dejó pendiente, en la generación en que empieza a regir. El enfriamiento no cuenta. Pruebas: escenarios de *Cambios que rigen en cada generación*. Verificación: `npm test`.

## 3. El corte

- [ ] 3.1 Estado del corte sin DOM (`src/tabs/train/cut.js`): entrar solo con la guía activa y 1× o 2×; terminar a los 2000 ms; la pausa congela el tiempo; Siguiente termina el corte; pasar a 4× o más lo termina. Pruebas de cada transición. Verificación: `npm test`.
- [ ] 3.2 Conectar el corte al bucle y a `onGeneration`: durante el corte no se llama a `step()`, la escena se sigue dibujando y Siguiente o N terminan el corte sin terminar la generación nueva. Prueba de que un entrenamiento con cortes simulados da el mismo historial que uno sin cortes (escenario "Mismo entrenamiento"). Verificación: `npm test`; escenarios "Estado por defecto", "Rápido sin corte", "Guía apagada", "Pausar durante el corte" y "Seguir enseguida" en el navegador.

## 4. La escena y la tarjeta

- [ ] 4.1 Tarjeta de generación en la columna de avisos de la escena, `role="status"`, con sus tres variantes y textos con parámetros en `es.js` y `en.js` (D4). Verificación: escenarios de *Tarjeta de generación*; las pruebas de i18n y de largo de textos; `mlLab.auditSistema()` y `auditHierarchy()` sin problemas nuevos.
- [ ] 4.2 Resaltar la élite en la escena durante el corte: contorno propio, dibujada arriba de los demás, y los demás atenuados (D4). Verificación: la captura del corte a 1440×900 y a 1366×768, también en escala de grises. **Si en la captura no se distinguen los individuos de la élite entre los demás, parar y consultar**, con las capturas.

## 5. La red y la curva

- [ ] 5.1 Durante el corte, la red del líder muestra `mutationSample.network` con las marcas de `mutationDiff` y el renglón "cambió N de M" (D5). Al terminar el corte vuelve la red en vivo. Verificación: escenarios de *La mutación en la red*; en la captura, las marcas se ven en escala de grises.
- [ ] 5.2 `chartModel` devuelve las marcas, y el gráfico las dibuja con forma propia. La línea de valores suma los cambios con nombres y unidades en el idioma activo (D6). Pruebas del modelo: sin cambios no hay marcas; un cambio en la generación 4 da una marca en la 4; reiniciar las borra. Verificación: `npm test`; escenarios de *Cambios marcados en la curva* en el navegador.
- [ ] 5.3 Textos y tooltips nuevos (la tarjeta, el renglón de la red y la marca de la curva) en los dos idiomas. Verificación: `mlLab.auditTooltips()` 0 y la prueba de i18n.

## 6. Cierre

- [ ] 6.1 Fluidez: medir con el guion de fluidez de Reglas a mano, o uno equivalente, a 1× durante un corte y a Máx. sin cortes. Verificación: cuadros por segundo y cuadro más lento anotados.
- [ ] 6.2 `npm test` completo y las tres auditorías en las vistas del guion, en los dos idiomas. Verificación: resultados anotados.
- [ ] 6.3 El después con el mismo guion y `comparacion.md`. Verificación: la comparación muestra el corte con la tarjeta, la élite resaltada, la red con las marcas y la curva con una marca.
- [ ] 6.4 Verificación en el navegador contra el filtro de entrada: el corte se entiende sin explicación; con la guía apagada o a 4× no hay corte; Siguiente lo saltea; reiniciar borra las marcas. Anotar lo que no se pudo probar.

## Workflow follow-up

- Archivar con `/opsx:archive` después de revisar `comparacion.md`.
- Sigue `entrenar-mutacion-a-la-vista`.
