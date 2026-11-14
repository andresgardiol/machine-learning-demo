# Tareas: tooltips con calma

## 1. Lógica

- [x] 1.1 Ampliar las funciones puras de `src/ui/tooltips.js` para decidir con la guía, el control sin acción, el interruptor de guía y "recién apretado". Pruebas en `tests/tooltips.test.js` de cada escenario de "Aparición y cierre del tooltip", "Tooltips con la guía apagada" y "Apretar un control sin acción lo explica". Las pruebas existentes pasan sin tocarlas, salvo la constante de la espera. *`opensTooltip` suma `guide`, `unavailable`, `guideSwitch`, `silenced` y `buttonDown` con valores por defecto que dan lo de antes; `pressAction`. Las pruebas existentes pasan sin tocarlas; 5 pruebas nuevas.*
- [x] 1.2 `pointerdown` cierra o cancela el tooltip del control y lo deja callado hasta que el cursor salga; con un botón del mouse apretado no se arma ninguno; `pointerdown` en un control sin acción lo muestra en el momento.
- [x] 1.3 Espera de 700 ms. `installTooltips` recibe el estado de la guía desde `src/ui/app.js` y lo consulta en cada decisión, sin recargar. *`installTooltips({ guideOn })`; `src/main.js` le pasa la guía del estado de la app, que se consulta en cada decisión.*

## 2. Textos

- [x] 2.1 Tooltip del interruptor "Guía" en español y en inglés, con lo que dice design.md D3. Verificar `tests/i18n.test.js` y `tests/copy-length.test.js`.

## 3. Verificación en el navegador

- [x] 3.1 Con la guía encendida, en dos pestañas distintas: cursor quieto (aparece), apretar antes y después de que aparezca, sacar y volver, y arrastrar un deslizador dos segundos. Verificar los escenarios nuevos de "Aparición y cierre del tooltip". *Con el mouse real en el Laboratorio: aparece a los 703 ms; apretar con el tooltip a la vista lo cierra y no vuelve en 1,5 s con el cursor quieto; apretar antes de que aparezca lo cancela; sacar y volver: aparece a los 703 ms. Arrastre de 2 s pasando por seis controles, con eventos de puntero simulados, en el Laboratorio y en Entrenar: no aparece ninguno; al soltar, vuelven.*
- [x] 3.2 Con la guía apagada: cursor quieto sobre un control habilitado, sobre "Guía" y sobre uno sin acción; llegar con Tab; volver a encender. Verificar los escenarios de "Tooltips con la guía apagada" y de "Interruptor de guía". *Guía apagada (eventos simulados): un botón habilitado no muestra nada; el interruptor de guía y un control sin acción ("Deshacer" sin cambios) sí; con Tab real aparece; al encenderla vuelve lo de siempre.*
- [x] 3.3 Clic en un control sin acción, con la guía encendida y apagada. Verificar "Apretar un control sin acción lo explica". *Clic en un control sin acción, con la guía encendida y apagada: el tooltip aparece en el momento; se cierra al salir el cursor y con Escape.*
- [x] 3.4 Comprobar lo que no cambia: Escape, llevar el cursor al tooltip, el editor de Reglas a mano, el cambio de idioma con un tooltip abierto, y `mlLab.auditTooltips()` sin faltantes en las seis pestañas, con la guía encendida y apagada. *Escape, llevar el cursor al tooltip (queda abierto, se cierra al salir), el editor de Reglas a mano (no aparece al posar el cursor), el cambio de idioma con un tooltip abierto (se reescribe) y `mlLab.auditTooltips()` sin faltantes en las seis pestañas con la guía encendida y apagada (se corrigió el botón de apagar de la tarjeta compacta, que no tenía ayuda hasta usarla).*
- [x] 3.5 Recorrer el filtro de entrada de la propuesta, fila por fila. Informar lo que no se cumpla. *Las tres filas se cumplen: dejan de aparecer al apretar y al arrastrar; la guía apagada los calla y su tooltip lo dice (aparece siempre); un clic en un control sin acción lo explica y se cierra al salir o con Escape.*
- [x] 3.6 Correr `openspec validate tooltips-con-calma --strict` y `npm test`. Quitar de `PENDIENTES.md` la nota de los tooltips molestos y dejar anotado lo que quedó fuera de alcance y que los 0,7 s no están medidos.
