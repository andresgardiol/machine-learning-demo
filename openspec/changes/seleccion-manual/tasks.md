# Tasks

Medidas de referencia para las verificaciones en el navegador: ventana de
1440×900 salvo que la tarea diga otra. "El panel entra" significa que
`document.getElementById('panel').scrollHeight <= clientHeight`.

## 1. Núcleo: hijos de un solo padre

- [x] 1.1 En `src/core/evolution.js`, agregar `childrenOf(parent, { population, mutationStrength, mutationRate }, random)` según design.md D3. Verificar en `tests/evolution.test.js`: la posición 0 es una copia idéntica e independiente del padre; el resultado tiene `population` individuos; con fuerza 10 % y probabilidad 100 % los demás difieren del padre; con fuerza 0 % todos son idénticos al padre; y dos llamadas con el mismo azar dan los mismos hijos.
- [x] 1.2 Correr `npm test` y confirmar que pasan todas las pruebas, las anteriores sin modificar.

## 2. Núcleo: selección manual en el entrenamiento

- [x] 2.1 En `src/core/training.js`, agregar `SELECTION_MODES`, `selectionMode: 'auto'` en la configuración por defecto y su validación en `normalizeTrainingConfig` (D1). Actualizar la única aserción existente de `tests/training.test.js` que enumera la configuración por defecto completa, sumándole `selectionMode: 'auto'`. Verificar con casos nuevos: sin indicar el modo es `'auto'`, un valor inválido vuelve a `'auto'`, y `configure({ selectionMode: 'manual' })` queda pendiente y rige desde la generación siguiente (escenario "Cambio de modo de selección").
- [x] 2.2 Agregar la pila de elecciones y la interfaz `chooseLeader`, `undoChoice`, `parent`, `choiceCount` y `selection` (D2). Verificar con un caso por escenario de "Elegir al líder como padre" y "Deshacer la elección" de la spec `neuroevolucion`: red, generación y fitness registrados; elegir dos veces; elegir al que ya es el padre no cambia nada; la generación en curso no cambia; deshacer con dos elecciones, con una y sin ninguna; y tope de 20.
- [x] 2.3 Cambiar la cría en `finishGeneration` según D3: desde el padre elegido con `childrenOf`, población al azar nueva con el flujo `STREAM_FRESH` cuando no hay padre, y el camino actual sin cambios con selección automática. Verificar con un caso por escenario de "Generación siguiente desde el padre elegido", "Sin padre elegido" y "Modo de selección": copia exacta y 99 mutaciones; mutación en cero; dos generaciones sin elección salen del mismo padre; `eliteCount` 1 con padre y 0 sin él; generaciones 1, 2 y 3 al azar distintas entre sí y repetibles con la misma semilla; y fin de generación por "todos quedaron fuera de carrera" sin esperar ninguna elección.
- [x] 2.4 Implementar el padre al cambiar de modo y al continuar desde un cerebro (D3). Verificar con un caso por escenario de "Padre al cambiar de modo" y "Padre al continuar desde un cerebro": de automática a manual sin elección sale del campeón; con una elección previa sale del líder elegido; de manual a automática se forma por fitness y no queda padre; volver a manual más tarde usa el campeón de ese momento; y un entrenamiento manual desde un cerebro lo tiene como padre.
- [x] 2.5 Hacer que `training.brain()` entregue el cerebro del entrenamiento según el modo vigente y registre `selectionMode` (D4). Verificar con los tres escenarios de "Cerebro del entrenamiento", y en `tests/brain.test.js` que un cerebro con `selectionMode` y uno sin él son válidos y conservan el dato al copiarse.
- [x] 2.6 Agregar las pruebas de los escenarios nuevos de los requisitos modificados: "Mismas elecciones" (dos entrenamientos manuales con la misma semilla y las mismas elecciones y deshechas en los mismos pasos tienen poblaciones idénticas en cada generación), y "Con selección manual no se usa" de selección y de élite. Comprobar además que un entrenamiento de diez generaciones con selección automática da el mismo historial que antes del cambio (comparando con valores tomados antes de empezar el grupo).
- [x] 2.7 Correr `npm test` y confirmar que pasa todo; la única prueba existente modificada hasta acá es la aserción de la configuración por defecto.

## 3. Ajustes, estado y atajos de la pestaña, sin DOM

- [x] 3.1 En `src/tabs/train/settings.js`, agregar el ajuste `selectionMode` (grupo `nextGeneration`) y pasarlo en `trainingConfig` (D5). Actualizar las dos aserciones existentes de `tests/train-settings.test.js` que enumeran los ajustes completos, sumándoles la clave nueva, y agregar un caso: un valor inválido vuelve a `'auto'` y cambiarlo se clasifica como cambio de la próxima generación.
- [x] 3.2 En `src/tabs/train/session.js`, agregar `parentStatus(training)` con las cinco situaciones de D5. Verificar en `tests/train-session.test.js` cada situación y cada unidad de fitness, con la clave y los parámetros exactos.
- [x] 3.3 En `src/tabs/train/shortcuts.js`, agregar `KeyE: 'choose'` y `KeyZ: 'undo'`. Verificar con una prueba que E y Z devuelven esas acciones y que con Ctrl o Cmd no devuelven nada, como los demás atajos.
- [x] 3.4 Correr `npm test` y confirmar que pasa todo.

## 4. Pestaña Entrenar: selección manual en el panel

- [x] 4.1 Agregar a la configuración básica el ajuste "Quién elige al padre" con sus dos opciones, aplicado como cambio de la próxima generación (D6). Verificar en el navegador los escenarios de "Quién elige al padre" y "Cambiar quién elige" de la spec `pestana-entrenar`: estado por defecto, aviso de cambios esperando, y restablecer vuelve a "La fitness" sin reiniciar.
- [x] 4.2 Agregar al bloque de marcha el renglón con "Elegir al líder" y "Deshacer" y la línea de estado, visibles solo cuando el modo deseado es manual, con los atajos E y Z atendidos solo en ese caso. Verificar en el navegador los escenarios de "Elegir al líder", "Deshacer la elección", "Estado del padre elegido" y los dos escenarios nuevos de "Controles de marcha agrupados": elegir con el botón y con E, en marcha y en pausa; la línea de estado cambia en el momento; en la generación siguiente un auto lleva la marca de la élite; deshacer vuelve al padre anterior y después a ninguno; el botón deshabilitado explica por qué; y con selección automática E no hace nada y los controles no se ven.
- [x] 4.3 Deshabilitar selección, élite y cruce con el modo deseado manual, con su explicación, conservando sus valores. Verificar en el navegador los dos escenarios de "Ajustes que no aplican con selección manual".
- [x] 4.4 Hacer que el bloque de guardar siga al modo vigente: rótulo, botón deshabilitado sin padre y su tooltip (D6). Verificar en el navegador los escenarios "Guardar al padre elegido" y "Selección manual sin padre", y que con selección automática guardar funciona como antes.
- [x] 4.5 Agregar en `src/i18n/es.js` y `en.js` los textos y los ocho tooltips de D8, en lenguaje llano y con la definición de "padre" en el tooltip de elegir al líder. Extender `tests/copy-length.test.js` con el límite de 110 caracteres para las líneas de estado. Verificar con `npm test` y con `mlLab.auditTooltips()` en la consola, con selección manual y todo desplegado, en los dos idiomas.
- [x] 4.6 Verificar en el navegador "Panel a la vista sin desplazarse": con selección automática el panel entra en 1440×900 en español y en inglés; con selección manual, en 1440×900 y en 1366×768, se ven sin desplazar pausar, siguiente, elegir al líder, deshacer y la línea de estado. Si con selección automática el panel no entra, ajustar espaciados; si aun así no entra, detenerse y consultar antes de mover u ocultar nada.

## 5. Biblioteca

- [x] 5.1 En `src/ui/library-view.js`, agregar al detalle de un cerebro la fila "Quién eligió", que muestra automática cuando el cerebro no registra el dato (D7), con su texto en los dos idiomas. Verificar en el navegador los escenarios "Cerebro elegido a mano" y "Cerebro guardado antes de este cambio" de la spec `cerebros`, con un cerebro guardado antes de este cambio (o importado sin el dato) y uno guardado con selección manual.
- [x] 5.2 Verificar en el navegador los escenarios nuevos de "Autoguardado": con selección manual y un padre elegido, el autoguardado del entrenamiento en curso tiene la red del padre (comprobarlo siguiendo entrenando desde él: la línea de estado lo nombra como padre); y sin padre elegido el autoguardado queda como estaba.

## 6. Verificación integral

- [ ] 6.1 Correr `npm test` y confirmar que pasa todo; listar en el reporte las pruebas nuevas y las tres aserciones existentes modificadas, que solo pueden ser las que design.md D9 enumera.
- [ ] 6.2 Recorrer la selección manual completa en el navegador, en español y en inglés: pasar a manual con generaciones terminadas (el padre es el campeón), elegir, deshacer hasta quedar sin padre (la generación siguiente es al azar), volver a elegir, guardar al padre, seguir entrenándolo desde la biblioteca y volver a selección automática. En ningún paso se reinicia el entrenamiento ni se pierde la curva.
- [ ] 6.3 Comprobar que reiniciar el entrenamiento con selección automática sigue repitiendo los mismos valores de la curva, y que las dos pestañas no muestran ninguna clave en lugar de su texto.
- [ ] 6.4 Recorrer la pestaña solo con el teclado: el ajuste, los dos botones nuevos y los atajos E y Z funcionan con el foco en cualquier control, y la barra espaciadora, N y T siguen funcionando.
- [ ] 6.5 Repasar las cuatro preguntas del filtro de entrada sobre el resultado en pantalla, con la tabla de proposal.md, con la guía activa y apagada; anotar en el reporte cualquier respuesta que ya no se sostenga.

## Workflow follow-up

- El dueño del proyecto prueba si eligiendo a mano los autos aprenden a pasar al tráfico en pocas generaciones. El resultado orienta el cambio siguiente, sobre la fitness automática.
- Archivar el cambio cuando el dueño lo haya revisado en el navegador.
