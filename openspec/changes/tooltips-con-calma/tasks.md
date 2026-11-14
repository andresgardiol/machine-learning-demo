# Tareas: tooltips con calma

## 1. Lógica

- [ ] 1.1 Ampliar las funciones puras de `src/ui/tooltips.js` para decidir con la guía, el control sin acción, el interruptor de guía y "recién apretado". Pruebas en `tests/tooltips.test.js` de cada escenario de "Aparición y cierre del tooltip", "Tooltips con la guía apagada" y "Apretar un control sin acción lo explica". Las pruebas existentes pasan sin tocarlas, salvo la constante de la espera.
- [ ] 1.2 `pointerdown` cierra o cancela el tooltip del control y lo deja callado hasta que el cursor salga; con un botón del mouse apretado no se arma ninguno; `pointerdown` en un control sin acción lo muestra en el momento.
- [ ] 1.3 Espera de 700 ms. `installTooltips` recibe el estado de la guía desde `src/ui/app.js` y lo consulta en cada decisión, sin recargar.

## 2. Textos

- [ ] 2.1 Tooltip del interruptor "Guía" en español y en inglés, con lo que dice design.md D3. Verificar `tests/i18n.test.js` y `tests/copy-length.test.js`.

## 3. Verificación en el navegador

- [ ] 3.1 Con la guía encendida, en dos pestañas distintas: cursor quieto (aparece), apretar antes y después de que aparezca, sacar y volver, y arrastrar un deslizador dos segundos. Verificar los escenarios nuevos de "Aparición y cierre del tooltip".
- [ ] 3.2 Con la guía apagada: cursor quieto sobre un control habilitado, sobre "Guía" y sobre uno sin acción; llegar con Tab; volver a encender. Verificar los escenarios de "Tooltips con la guía apagada" y de "Interruptor de guía".
- [ ] 3.3 Clic en un control sin acción, con la guía encendida y apagada. Verificar "Apretar un control sin acción lo explica".
- [ ] 3.4 Comprobar lo que no cambia: Escape, llevar el cursor al tooltip, el editor de Reglas a mano, el cambio de idioma con un tooltip abierto, y `mlLab.auditTooltips()` sin faltantes en las seis pestañas, con la guía encendida y apagada.
- [ ] 3.5 Recorrer el filtro de entrada de la propuesta, fila por fila. Informar lo que no se cumpla.
- [ ] 3.6 Correr `openspec validate tooltips-con-calma --strict` y `npm test`. Quitar de `PENDIENTES.md` la nota de los tooltips molestos y dejar anotado lo que quedó fuera de alcance y que los 0,7 s no están medidos.
