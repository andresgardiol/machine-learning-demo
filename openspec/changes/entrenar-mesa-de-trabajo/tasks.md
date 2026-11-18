# Tasks

## 1. Antes

- [ ] 1.1 Copiar `borradores/entrenar-red-primero/capturar.mjs` a `borradores/entrenar-mesa-de-trabajo/capturar.mjs` y sumarle las vistas y medidas de D6: vista de ajustes, vista de cerebros, selección manual a los dos tamaños; alto de la escena y de la barra de marcha, desplazamiento de la zona del escenario, dónde está la marcha en cada vista y cuántas acciones principales se ven. Verificación: dos corridas seguidas sobre el mismo código dan las mismas medidas.
- [ ] 1.2 Sacar el antes en `borradores/entrenar-mesa-de-trabajo/antes/` sobre el commit de partida, con su `indice.md`. Verificación: el índice lista todas las vistas, y en las vistas de ajustes y de cerebros la marcha figura como no visible.

## 2. La barra de marcha debajo de la escena

- [ ] 2.1 El escenario de Entrenar pasa a ser una columna (`.train-stage-zone`) con la escena (`flex: 1`) y la barra (`.train-runbar`), siguiendo el patrón de `.rules-stage-zone` (D2). En la barra se monta el mismo nodo `run`, sin cambiar su orden interno. Verificación: escenarios "Estado por defecto", "Marcha en otra vista" y "Con selección manual" de *Controles de marcha agrupados*, y "Primero en el panel" de *Quién elige al padre*, en el navegador.
- [ ] 2.2 `viewSwitches` (Sensores y Ver como la máquina) va al último renglón de la barra, con la altura compacta. Verificación: los dos interruptores andan con el mouse y el teclado; `mlLab.auditTooltips()` y `auditSistema()` sin problemas nuevos; escenarios de *Ver como la máquina* y *Sensores del líder*.
- [ ] 2.3 La tarjeta de consigna de Entrenar se arma sin `run` y queda con la consigna, la misión en curso y "Mostrame". Con la guía apagada se oculta entera, como en Inspeccionar. Verificación: escenarios "Entrenar" de *Acción principal en la tarjeta* y "Otras vistas de Entrenar" de *Tarjeta al principio del panel*.
- [ ] 2.4 Medir con el guion la escena y la barra a 1366×768 y a 1440×900, con la selección automática y con la manual. Si la escena queda por debajo de 360 px a 1366×768, compactar la barra como dice D2 y volver a medir. **Si aun así queda por debajo de 360 px, o la zona del escenario se desplaza, parar y consultar**, con las medidas. Verificación: escenarios "Pantalla de 1366×768" y "Selección manual a la vista" de *Panel a la vista sin desplazarse*.
- [ ] 2.5 Orden del foco: escena, barra de marcha, tablero y panel. Atajos: barra espaciadora, N, T, y E y Z con selección manual. Verificación: recorrido con Tab y los atajos con el foco en el escenario y en el panel, anotados; escenario "Mismos atajos".

## 3. "Probá esto"

- [ ] 3.1 El bloque `basic` se titula "Probá esto" y lleva primero `choices.fitness.row`, que sale del bloque de evolución de la vista de ajustes (D3). La función de fitness usa `basicPending` para su aviso, y la marca de la pestaña Ajustes deja de contarla. Verificación: escenarios "Estado por defecto" de *Configuración básica* y de *Funciones de fitness a elegir*, "Abrir un grupo" y "A un clic" de *Avanzado por grupos*, y "Cambio hecho y vista cambiada" de *Cambios pendientes a la vista*, cambiando la función de fitness y después la élite.
- [ ] 3.2 Textos: `train.basic.title` ("Probá esto" / "Try this") y la ayuda del bloque ("qué hace / por qué importa") en `es.js` y `en.js`. Las cuatro funciones siguen enteras con el panel de 360 px. Verificación: la prueba de i18n, la de largo de textos y `mlLab.auditTooltips()`; escenario "Cuatro opciones a la vista".
- [ ] 3.3 Prueba: que la función de fitness esté en la vista de entrenamiento y no en la de ajustes (en la función que arma los bloques, si se separa, o en la prueba de disposición de `tests/train-layout.test.js`). Verificación: `npm test`.

## 4. Acción principal y "Mostrame"

- [ ] 4.1 `syncMainAction`: en la vista de cerebros, "Guardar como nuevo" queda secundaria y la marcha sigue siendo la principal (D4). Prueba de la regla, si está separada del DOM. Verificación: escenarios "Vista de cerebros" de *Guardar no compite con la marcha* y "Entrenar con selección manual"; `mlLab.auditHierarchy()` con una sola acción principal en las tres vistas.
- [ ] 4.2 "Mostrame" de "Probá otra función de fitness" marca el selector en "Probá esto" sin cambiar de vista (D5). Verificación: escenarios "Fitness a la vista" y "Fitness en otra vista" de *Controles de las misiones de Entrenar*; "Guardá un cerebro" sigue marcando Guardar campeón.

## 5. Cierre

- [ ] 5.1 Medir el panel con el guion: la vista de entrenamiento a 1440×900 sin desplazarse, al abrir y después de guardar, en español y en inglés; a 1366×768, la tarjeta y "Probá esto" a la vista. Verificación: escenarios "Pantalla de 1440×900", "Después de guardar" y "Pantalla de 1366×768", con las medidas anotadas.
- [ ] 5.2 `npm test` completo, y `auditSistema()`, `auditHierarchy()` y `auditTooltips()` en las vistas del guion, en los dos idiomas. Verificación: los resultados anotados. Lo que ya fallaba antes (Renombrar de 24 px) se anota sin arreglarlo.
- [ ] 5.3 El después con el mismo guion en `borradores/entrenar-mesa-de-trabajo/despues/`, y `comparacion.md` con el antes y el después lado a lado y las medidas. Verificación: la comparación muestra la marcha debajo de la escena en las tres vistas y "Probá esto" con la función de fitness.
- [ ] 5.4 Verificación en el navegador contra el filtro de entrada: los tres ajustes de "Probá esto" se ven al abrir; la marcha se ve en las tres vistas; cambiar la función de fitness rige desde la generación siguiente y "Restablecer ajustes" la devuelve; el mentor usa los mismos atajos. Anotar lo que no se pudo probar.

## Workflow follow-up

- Archivar con `/opsx:archive` después de revisar `comparacion.md`.
- Sigue `entrenar-la-generacion-ensena`.
