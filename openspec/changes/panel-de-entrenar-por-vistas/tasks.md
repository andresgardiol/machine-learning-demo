# Tasks

## 1. Pestañas de vista del panel

- [x] 1.1 Crear el componente común de vistas con pestañas (design.md D1): barra con `tablist`, flechas con activación automática, Inicio y Fin, una sola pestaña en el orden de Tab y vistas ocultas con `hidden`, sin desmontar. Verificar con pruebas de su lógica sin DOM la vista por defecto, el cambio de vista y el nombre accesible, y en el navegador los escenarios "Teclado", "Pestañas anunciadas", "Foco a la vista" y "Tooltips" de la spec `pestana-entrenar`.
- [x] 1.2 Agregar los estilos de la barra, fija arriba del panel, y los textos en `src/i18n/es.js` y `en.js`. Verificar con `tests/copy-length.test.js` que los tres nombres, con un contador de dos dígitos, entran a 360 px, y medirlo en el DOM en los dos idiomas.

## 2. Panel de Entrenar en tres vistas

- [x] 2.1 Reorganizar `src/tabs/train/index.js` en las tres vistas de design.md D2, sin la sección "Avanzado": el grupo de evolución abierto al entrar y con la función de fitness primero. Verificar en el navegador los escenarios de "Vistas del panel", "Avanzado por grupos" y "Configuración avanzada", y que `npm test` pasa.
- [x] 2.2 Recordar la vista elegida en el estado de la pestaña. Verificar con una prueba y en el navegador el escenario "Vista recordada".
- [x] 2.3 Mostrar la marca de cambios pendientes en la pestaña de ajustes (design.md D3). Verificar con una prueba de la lógica sin DOM y en el navegador los tres escenarios de "Cambios pendientes a la vista".
- [x] 2.4 Verificar que cambiar de vista no altera el entrenamiento: una prueba compara el historial de dos entrenamientos iguales, uno cambiando de vista en cada generación; y en el navegador, que los atajos siguen funcionando desde las tres vistas.
- [x] 2.5 Cancelar las confirmaciones abiertas de una vista al dejarla. Verificar en el navegador el escenario "Confirmación abierta al cambiar de vista" con la confirmación de entrenamiento nuevo y con la de restablecer.

## 3. Guardar y biblioteca

- [x] 3.1 Dejar en la vista de entrenamiento un solo botón de guardar con su resultado en el mismo renglón (design.md D4). Verificar en el navegador los escenarios "Guardar con un clic", "Guardar con la biblioteca plegada", "Guardar tras continuar un cerebro", "Guardar al padre elegido", "Selección manual sin padre", "Sin campeón todavía" y "Nombre largo".
- [x] 3.2 Armar la vista de cerebros: guardar con nombre, importar y la lista con todo el alto. Verificar en el navegador los escenarios de "Biblioteca de cerebros en la pestaña", incluidos "Lista larga" y "Guardar como nuevo", y que el campo de nombre conserva el foco al hacer clic.
- [x] 3.3 Hacer que "Renombrar", en el mensaje de guardado, pase a la vista de cerebros con ese cerebro en modo renombrar y el foco en el campo. Verificar en el navegador el escenario "Ir a ponerle nombre".
- [x] 3.4 Verificar en el DOM los escenarios de "Panel a la vista sin desplazarse", incluido "Después de guardar": a 1440×900 y a 1366×768, con el panel en 360 y en 400 px, en español y en inglés. Si la vista de entrenamiento se desplaza, **detenerse y consultar** con las medidas.
- [x] 3.5 Agregar "Deshacer" al mensaje de una actualización, conservando en memoria la versión anterior del cerebro (design.md D4). Verificar con una prueba que deshacer deja el cerebro idéntico al de antes, y en el navegador los escenarios "Deshacer una actualización", "No se pudo guardar" (con un almacenamiento que falla) y "Mensaje que no se va solo".

## 4. Selector de pista en el escenario

- [ ] 4.1 Crear el selector como parte de la vista del escenario, con sus modos simple y múltiple y las miniaturas (design.md D5). Verificar con pruebas de su lógica sin DOM los dos modos, la última pista marcada y el texto del botón cerrado.
- [ ] 4.2 Ubicarlo arriba a la izquierda del escenario, en el segundo renglón. Verificar en el navegador los escenarios de "Selector de pista sobre el escenario", incluido "Escenario angosto" a 400 px en los dos idiomas; si se encima con el auto o con otro control, **detenerse y consultar** con una captura.
- [ ] 4.3 Usarlo en El problema y en Reglas a mano y quitar el selector de sus paneles. Verificar en el navegador los escenarios de "Elegir la pista" de las specs `pestana-conducir` y `pestana-reglas`, y que los paneles de las dos pestañas siguen sin desplazarse a 1440×900.
- [ ] 4.4 Usarlo en Entrenar en modo múltiple, quitar las pistas del grupo de escenario y sacar el nombre de la pista del rótulo de generación. Verificar en el navegador los escenarios de "Pistas del entrenamiento", incluidos "Varias pistas a la vista" y "Cambio de pistas pendiente".
- [ ] 4.5 Agregar los tooltips del selector en los dos idiomas. Verificar los escenarios de "Selector de pista explicado" y que `mlLab.auditTooltips()` no informa controles sin ayuda en las tres pestañas, con el selector abierto y cerrado.
- [ ] 4.6 Dar al selector los roles y estados de design.md D5 y hacer que el menú entre en el escenario. Verificar en el navegador los escenarios "Lector de pantalla" (leyendo el árbol de accesibilidad) y "Menú entero a la vista".

## 5. Nombres de las pistas

- [ ] 5.1 Cambiar los nombres visibles de las dos pistas en los dos idiomas (design.md D6). Verificar con una prueba los cuatro nombres de cada idioma y, en el navegador, los escenarios de "Nombres de las pistas".
- [ ] 5.2 Revisar a 360 px, en los dos idiomas, cada texto que nombra una pista dentro de una oración (datos de un cerebro, aviso al cargar un ejemplo desde un circuito, ayudas). Informar los que hubo que ajustar.

- [ ] 5.3 Aplicar los cambios de texto de design.md D8 en los dos idiomas, incluido el tooltip que explica qué es una chicana. Verificar con pruebas los textos nuevos, que `tests/copy-length.test.js` pasa y, en el navegador, los escenarios de "Textos de la pestaña coherentes" y "Palabra poco conocida".

## 6. Accesibilidad de toda la aplicación

- [ ] 6.1 Agregar la preferencia `shortcuts` y el interruptor "Atajos" en el encabezado, y hacer que `shortcutFrom` ignore las teclas de carácter cuando está apagada (design.md D9). Verificar con pruebas de `shortcuts` y de `preferences` los escenarios "Estado por defecto", "Atajos apagados", "Manejar con las flechas" y "Preferencia recordada" de la spec `accesibilidad`.
- [ ] 6.2 Dar a cada control que muestra su tecla un texto sin ella, en los dos idiomas, y usarlo con los atajos apagados. Verificar en el navegador "Controles sin su atajo a la vista", "Volver a encenderlos", "Tooltip" y "Encabezado sin desbordes" a 1366 px; si el encabezado no entra, **detenerse y consultar**.
- [ ] 6.3 Sacar capturas de las tres pestañas a 1440×900 antes de tocar los bordes. Agregar `--color-control-border` y usarlo en los límites de los controles (design.md D9). Verificar con una prueba nueva que lee `styles/tokens.css` los contrastes de "Límites de los controles con contraste", y entregar las capturas de después.
- [ ] 6.4 Hacer que el tooltip se pueda alcanzar con el cursor (design.md D9). Verificar con pruebas de `tooltips` la regla de cierre y en el navegador los escenarios "Llevar el cursor al tooltip" y "Salir del tooltip" de la spec `ayuda-contextual`, y que los demás escenarios de ese requisito siguen valiendo.
- [ ] 6.5 Medir en el DOM de las tres pestañas, a 1440×900, todos los controles accionables e informar los que miden menos de 24 por 24 px. Corregirlos y volver a medir. Si corregir alguno hace desplazar un panel que hoy no se desplaza, **detenerse y consultar** con las medidas.
- [ ] 6.6 Agregar la descripción en texto del escenario en las tres pestañas (design.md D9). Verificar leyendo el árbol de accesibilidad del navegador los escenarios de "Escenario descrito en texto", y con una prueba que el texto se actualiza como mucho una vez por segundo.
- [ ] 6.7 Verificar "Estado sin depender del color": revisar opciones elegidas, interruptores y controles deshabilitados de las tres pestañas e informar cualquiera que se distinga solo por el color.

## 7. Verificación integral

- [ ] 7.1 Recorrer las tres pestañas de la aplicación con teclado solamente, y las tres vistas de Entrenar: llegar a cada control, abrir el selector de pista, cambiar de vista y volver, sin trampas de foco y con el foco siempre visible. Informar lo que no se pueda hacer.
- [ ] 7.2 Medir en el DOM, a 1440×900 y con el panel en 360 px, el alto de cada vista en los dos idiomas e informarlo.
- [ ] 7.3 Comprobar que ningún ajuste de ninguna pestaña quedó a más de un nivel de plegado, y listar dónde quedó cada ajuste que antes estaba en "Avanzado".
- [ ] 7.4 Repasar el filtro de entrada de proposal.md contra lo que se ve en el navegador e informar cualquier respuesta que ya no valga.
- [ ] 7.5 Actualizar `PENDIENTES.md`: quitar la nota "Los ajustes más interesantes de Entrenar están demasiado escondidos" y anotar lo que haya quedado fuera, incluida la prueba con lector de pantalla y con una herramienta automática, que este cambio no hizo.

## Workflow follow-up

- El dueño prueba con VoiceOver las pestañas de vista, el selector de pista y la descripción del escenario.
- Archivar el cambio cuando el dueño lo haya revisado.
