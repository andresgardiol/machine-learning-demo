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

- [x] 4.1 Crear el selector como parte de la vista del escenario, con sus modos simple y múltiple y las miniaturas (design.md D5). Verificar con pruebas de su lógica sin DOM los dos modos, la última pista marcada y el texto del botón cerrado.
- [x] 4.2 Ubicarlo arriba a la izquierda del escenario, en el segundo renglón. Verificar en el navegador los escenarios de "Selector de pista sobre el escenario", incluido "Escenario angosto" a 400 px en los dos idiomas; si se encima con el auto o con otro control, **detenerse y consultar** con una captura.
- [x] 4.3 Usarlo en El problema y en Reglas a mano y quitar el selector de sus paneles. Verificar en el navegador los escenarios de "Elegir la pista" de las specs `pestana-conducir` y `pestana-reglas`, y que los paneles de las dos pestañas siguen sin desplazarse a 1440×900.
- [x] 4.4 Usarlo en Entrenar en modo múltiple, quitar las pistas del grupo de escenario y sacar el nombre de la pista del rótulo de generación. Verificar en el navegador los escenarios de "Pistas del entrenamiento", incluidos "Varias pistas a la vista" y "Cambio de pistas pendiente".
- [x] 4.5 Agregar los tooltips del selector en los dos idiomas. Verificar los escenarios de "Selector de pista explicado" y que `mlLab.auditTooltips()` no informa controles sin ayuda en las tres pestañas, con el selector abierto y cerrado.
- [x] 4.6 Dar al selector los roles y estados de design.md D5 y hacer que el menú entre en el escenario. Verificar en el navegador los escenarios "Lector de pantalla" (leyendo el árbol de accesibilidad) y "Menú entero a la vista".

## 5. Nombres de las pistas

- [x] 5.1 Cambiar los nombres visibles de las dos pistas en los dos idiomas (design.md D6). Verificar con una prueba los cuatro nombres de cada idioma y, en el navegador, los escenarios de "Nombres de las pistas".
- [x] 5.2 Revisar a 360 px, en los dos idiomas, cada texto que nombra una pista dentro de una oración (datos de un cerebro, aviso al cargar un ejemplo desde un circuito, ayudas). Informar los que hubo que ajustar.

- [x] 5.3 Aplicar los cambios de texto de design.md D8 en los dos idiomas, incluido el tooltip que explica qué es una chicana. Verificar con pruebas los textos nuevos, que `tests/copy-length.test.js` pasa y, en el navegador, los escenarios de "Textos de la pestaña coherentes" y "Palabra poco conocida".

## 6. Accesibilidad de toda la aplicación

- [x] 6.1 Agregar la preferencia `shortcuts` y el interruptor "Atajos" en el encabezado, y hacer que `shortcutFrom` ignore las teclas de carácter cuando está apagada (design.md D9). Verificar con pruebas de `shortcuts` y de `preferences` los escenarios "Estado por defecto", "Atajos apagados", "Manejar con las flechas" y "Preferencia recordada" de la spec `accesibilidad`.
- [x] 6.2 Dar a cada control que muestra su tecla un texto sin ella, en los dos idiomas, y usarlo con los atajos apagados. Verificar en el navegador "Controles sin su atajo a la vista", "Volver a encenderlos", "Tooltip" y "Encabezado sin desbordes" a 1366 px; si el encabezado no entra, **detenerse y consultar**.
- [x] 6.3 Sacar capturas de las tres pestañas a 1440×900 antes de tocar los bordes. Agregar `--color-control-border` y usarlo en los límites de los controles (design.md D9). Verificar con una prueba nueva que lee `styles/tokens.css` los contrastes de "Límites de los controles con contraste", y entregar las capturas de después.
- [x] 6.4 Hacer que el tooltip se pueda alcanzar con el cursor (design.md D9). Verificar con pruebas de `tooltips` la regla de cierre y en el navegador los escenarios "Llevar el cursor al tooltip" y "Salir del tooltip" de la spec `ayuda-contextual`, y que los demás escenarios de ese requisito siguen valiendo.
- [x] 6.5 Medir en el DOM de las tres pestañas, a 1440×900, todos los controles accionables e informar los que miden menos de 24 por 24 px. Corregirlos y volver a medir. Si corregir alguno hace desplazar un panel que hoy no se desplaza, **detenerse y consultar** con las medidas.
- [x] 6.6 Agregar la descripción en texto del escenario en las tres pestañas (design.md D9). Verificar leyendo el árbol de accesibilidad del navegador los escenarios de "Escenario descrito en texto", y con una prueba que el texto se actualiza como mucho una vez por segundo.
- [x] 6.7 Verificar "Estado sin depender del color": revisar opciones elegidas, interruptores y controles deshabilitados de las tres pestañas e informar cualquiera que se distinga solo por el color.

## 7. Verificación integral

- [x] 7.1 Recorrer las tres pestañas de la aplicación con teclado solamente, y las tres vistas de Entrenar: llegar a cada control, abrir el selector de pista, cambiar de vista y volver, sin trampas de foco y con el foco siempre visible. Informar lo que no se pueda hacer.
- [x] 7.2 Medir en el DOM, a 1440×900 y con el panel en 360 px, el alto de cada vista en los dos idiomas e informarlo.
- [x] 7.3 Comprobar que ningún ajuste de ninguna pestaña quedó a más de un nivel de plegado, y listar dónde quedó cada ajuste que antes estaba en "Avanzado".
- [x] 7.4 Repasar el filtro de entrada de proposal.md contra lo que se ve en el navegador e informar cualquier respuesta que ya no valga.
- [x] 7.5 Actualizar `PENDIENTES.md`: quitar la nota "Los ajustes más interesantes de Entrenar están demasiado escondidos" y anotar lo que haya quedado fuera, incluida la prueba con lector de pantalla y con una herramienta automática, que este cambio no hizo.

## 8. Segunda ronda: volver a empezar la generación en curso

- [x] 8.1 Agregar `training.restartGeneration()` al núcleo (design.md D12). Verificar con pruebas los escenarios "Cambio de escenario", "Sin cambios pendientes" y "Selección manual" de la spec `neuroevolucion`.
- [x] 8.2 Verificar con una prueba el escenario "Reinicio reproducible", y que las pruebas de reproducibilidad existentes pasan sin cambios.

## 9. Segunda ronda: barra de escenario

- [x] 9.1 Agregar la zona de la barra a la disposición común y crear el componente (design.md D11), con sus textos en los dos idiomas. Verificar con pruebas de su lógica sin DOM qué avisa con `final` falso y verdadero, y en el navegador los escenarios "Estado por defecto" y "Mismo lugar en las tres pestañas" de la spec `barra-escenario`.
- [x] 9.2 Armar las pistas como cuatro opciones a la vista con miniatura y nombre corto. Verificar en el navegador los escenarios de "Pista en la barra" y, leyendo el árbol de accesibilidad, que cada opción lleva el nombre completo.
- [x] 9.3 Usar la barra en El problema y en Reglas a mano y quitar de sus paneles la sección "Avanzado" y de sus escenarios el selector de la primera ronda. Verificar en el navegador los escenarios de "Configuración avanzada", "Restablecer la configuración", "Elegir la pista" y "Pestaña en un circuito" de `pestana-conducir`, los de "Configuración avanzada" de `pestana-reglas`, y que los dos paneles no se desplazan a 1440×900.
- [x] 9.4 Usar la barra en Entrenar: una sola pista, y pista, carriles, densidad, irregularidad y velocidad vuelven a empezar la generación en curso al soltar el control (design.md D12). Quitar el selector múltiple, la marca de pista pendiente y los grupos de escenario y de sensores de la vista de ajustes. Verificar en el navegador los escenarios de "Pistas del entrenamiento", "Generación en un circuito" y "Cambios del escenario en el momento".
- [x] 9.5 Mostrar la confirmación de entrenamiento nuevo junto a la barra cuando cambian los sensores en Entrenar, y el aviso de que la generación volvió a empezar. Verificar en el navegador "Sensores en Entrenar", "Aviso de lo que pasó" y "Restablecer en Entrenar con los sensores cambiados".
- [x] 9.6 Deshabilitar el tráfico en un circuito y agregar "Restablecer". Verificar los escenarios de "Ajustes de tráfico en un circuito" y "Restablecer el escenario" en las tres pestañas.
- [x] 9.7 Tooltips en los dos idiomas, teclado, roles y tamaños (design.md D11). Verificar los escenarios de "Barra explicada y accesible", que `mlLab.auditTooltips()` no informa nada y que la prueba de contrastes sigue pasando.
- [x] 9.8 Medir la barra en el DOM a 1440 y a 1366 px, en español y en inglés: alto, y que entra en un renglón sin texto cortado. Medir a 1440×900 la vista de entrenamiento de Entrenar con la barra. Si la barra no entra en un renglón a 1366 px, o esa vista pasa a desplazarse, **detenerse y consultar** con las medidas.

## 10. Segunda ronda: vista de ajustes sin plegables

- [x] 10.1 Dejar la vista de ajustes de Entrenar con dos bloques a la vista, red y evolución, sin grupos plegables (design.md D13). Verificar en el navegador los escenarios de "Avanzado por grupos", incluido "La red, sin desplazarse", y que "Restablecer ajustes" restablece los dos bloques.
- [x] 10.2 Hacer que la marca de cambios pendientes cuente solo población, mutación, enfriamiento y evolución. Verificar con una prueba y en el navegador los escenarios de "Cambios pendientes a la vista".

## 11. Segunda ronda: eliminar cualquier cerebro

- [x] 11.1 Permitir eliminar los dos autoguardados en la biblioteca (design.md D14). Verificar con pruebas de `library` cada tipo de entrada y que el autoguardado en curso vuelve a crearse al terminar la generación siguiente.
- [x] 11.2 Ofrecer "Eliminar" en los autoguardados, con la confirmación que corresponde a cada uno. Verificar en el navegador los escenarios "Eliminar el entrenamiento anterior", "Eliminar el entrenamiento en curso" y "Biblioteca vacía" de la spec `cerebros`.

## 12. Segunda ronda: Reglas a mano abre sin errores

- [x] 12.1 Recordar los sensores junto con el programa (design.md D15). Verificar con pruebas de `preferences` y de la lógica de la pestaña los escenarios "Ejemplo de veinte sensores recordado", "Programa guardado sin sus sensores" y "Sensores cambiados a mano".
- [x] 12.2 Verificar en el navegador, partiendo de un almacenamiento que tiene solo el programa del ejemplo de 20 sensores (el caso que encontró el dueño), que la pestaña abre sin ningún error y el auto maneja.

## 13. Segunda ronda: cambiar la red o los sensores siguiendo un cerebro

- [x] 13.1 Dejar de seguir al cerebro cuando un cambio de red o de sensores empieza un entrenamiento nuevo, y decirlo en la confirmación (design.md D16). Verificar con una prueba de la lógica de la pestaña y en el navegador los escenarios "Cambio mientras se sigue entrenando un cerebro" y "La confirmación lo avisa".

## 14. Segunda ronda: verificación integral

- [x] 14.1 Recorrer las tres pestañas y comprobar que no queda ninguna sección plegable en los paneles ni ningún ajuste a más de un clic. Listar dónde quedó cada ajuste.
- [x] 14.2 Recorrer la barra y las tres pestañas con teclado solamente y leer el árbol de accesibilidad de la barra. Informar lo que no se pueda hacer.
- [x] 14.3 Medir todos los controles accionables nuevos: ninguno por debajo de 24 por 24 px.
- [x] 14.4 Entregar una captura de cada pestaña a 1440×900, y una de Entrenar con la vista de ajustes.
- [x] 14.5 Repasar el filtro de entrada de proposal.md contra lo que se ve e informar cualquier respuesta que ya no valga.
- [x] 14.6 Actualizar `PENDIENTES.md`: quitar las notas "El programa recordado no recuerda los sensores" y "Bug: cambiar la red o los sensores no tiene efecto si se sigue entrenando un cerebro", y anotar lo que haya quedado fuera (alternar pistas, editar la red sobre el diagrama, eliminar todos los cerebros de una vez).

## Workflow follow-up

- El dueño prueba con VoiceOver las pestañas de vista, el selector de pista y la descripción del escenario.
- Archivar el cambio cuando el dueño lo haya revisado.
