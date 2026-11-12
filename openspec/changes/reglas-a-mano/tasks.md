# Tasks

Medidas de referencia para las verificaciones en el navegador: ventana de
1440×900 salvo que la tarea diga otra. Las pruebas existentes no se modifican;
si una enumera una lista completa que este cambio amplía, se le suman solo las
claves nuevas y se informa en el reporte.

## 1. El lenguaje de reglas en el núcleo

- [x] 1.1 Crear `src/core/rules.js` con el vocabulario de design.md D2 (`VOCABULARY`), el analizador léxico y `classifyLine(text)`. Verificar en `tests/rules.test.js`: cada palabra de la tabla se reconoce en español y en inglés, sin distinguir mayúsculas; `sensor3` y `sensor 3` son el mismo dato; `0,5` y `0.5` son el mismo número; y `classifyLine` devuelve los tipos correctos para `si sensor3 > cerca entonces girar izquierda # esquiva` y para `cerca = 0,5`.
- [x] 1.2 Implementar `parseProgram` para líneas, comentarios, órdenes y reglas con acciones en la misma línea o con sangría (D1 y D2). Verificar con un caso por escenario de "Programa por líneas", "Órdenes" y "Reglas" de la spec `reglas`.
- [x] 1.3 Implementar las condiciones: comparaciones entre dos valores, `y`, `o`, `no`, paréntesis y su precedencia. Verificar con un caso por escenario de "Condiciones" y "Datos disponibles".
- [x] 1.4 Implementar las constantes (D2): definición `<nombre> = <número>` sin sangría, uso en las condiciones de las líneas siguientes y resolución al analizar. Verificar con un caso por escenario de "Constantes" y con el de "Constantes contadas aparte".
- [x] 1.5 Implementar los dieciséis errores de D3, uno por línea como máximo y en orden, con la sugerencia de palabra parecida, que también busca entre las constantes definidas. Verificar con un caso por escenario de "Errores explicados" y de "Errores de constantes", más un caso por cada código de la tabla de D3 que no tenga escenario propio (`unexpectedWord`, `missingCondition`, `badNumber`).
- [x] 1.6 Implementar el tope de 200 líneas y la cuenta de reglas. Verificar con los escenarios de "Tamaño de un programa" y "Cantidad de reglas".
- [x] 1.7 Implementar `runProgram(program, perception)` con los controles y las líneas que se cumplen. Verificar con un caso por escenario de "Ejecución en cada instante", "Vocabulario en español y en inglés" y "Líneas que se cumplen", incluido que la línea de una constante nunca figura.
- [x] 1.8 Correr `npm test` y confirmar que pasa todo, incluida `tests/architecture.test.js`.

## 2. Controlador de reglas y programas de ejemplo

- [x] 2.1 Agregar `createRulesController` a `src/core/rules.js` (D1). Verificar en `tests/rules-controller.test.js` los escenarios de "Controlador de reglas" y "Programa que no corresponde al auto" de la spec `controladores`, y el de "Lenguaje sin navegador" de `reglas`: un auto manejado por `avanzar` en un mundo sin navegador avanza igual que con un controlador constante.
- [x] 2.2 Crear `src/tabs/rules/examples.js` con la tabla de D10 (programa inicial y tres ejemplos, cada uno con sus sensores) y agregar a `src/i18n/es.js` y `en.js` los cuatro textos de D10 (`rules.program.initial`, `rules.example.three`, `rules.example.seven`, `rules.example.twenty`), tal como están escritos en design.md. Verificar en `tests/rules-examples.test.js`: los ocho textos son válidos con los sensores de su ejemplo; tienen las reglas y las constantes de la tabla (1 y 1; 1 y 1; 5 y 4; 9 y 5); y la versión en inglés de cada uno acciona lo mismo que la versión en español ante mil percepciones generadas con semilla.
- [x] 2.3 En la misma prueba, correr cada programa sin navegador con sus sensores, la configuración por defecto para el resto y la semilla de tráfico 2, durante dos minutos como máximo, y comprobar los escenarios "El programa inicial hace algo y no alcanza", "Tres sensores cortos", "Siete sensores", "Veinte sensores" y "Ningún ejemplo alcanza siempre" de `pestana-reglas`. Anotar en el reporte la distancia y los vehículos superados de cada uno, junto a los de la tabla de design.md (82 m y 1; 1224 m y 0 sin chocar; 1041 m y 14; 290 m y 4). Si algún escenario no se cumple, detenerse y consultar con los números; no cambiar los programas, los sensores, la semilla ni los escenarios.

## 3. Piezas compartidas con la pestaña 1

- [x] 3.1 Mover a `src/tabs/shared/street-settings.js` los ajustes de calle y sensores de `src/tabs/drive/settings.js`, que pasa a reexportarlos (D5). Verificar que `tests/drive-settings.test.js` pasa sin modificarse.
- [x] 3.2 Extraer a `src/tabs/shared/attempt.js` el seguimiento de un intento (distancia, vehículos superados, intentos, mejor distancia) de `src/tabs/drive/session.js`, que pasa a usarlo. Verificar que `tests/drive-session.test.js` pasa sin modificarse.
- [x] 3.3 Extraer a `src/tabs/shared/driving-cards.js` el bloque de barras de percepción (con la opción de mostrar el nombre de cada dato) y el bloque de los cuatro controles, y a `src/tabs/shared/street-advanced.js` la sección avanzada; la pestaña 1 pasa a usarlos.
- [x] 3.4 Verificar en el navegador que la pestaña 1 se ve y se comporta igual que antes: barras con sus números, velocidad, controles que se resaltan al manejar, interruptores, misiones, sección avanzada con sus siete ajustes y restablecer, y el panel sin barra de desplazamiento en 1440×900. Correr `npm test`.

## 4. Editor de texto

- [x] 4.1 Crear `src/ui/editor-text.js` con las operaciones puras de D4 (Enter con sangría, Tab, Mayús+Tab e insertar en el cursor). Verificar en `tests/editor-text.test.js`: Enter después de una línea que termina en `entonces` o `then` agrega un nivel; Enter en una línea con sangría la conserva; Tab y Mayús+Tab sobre el cursor y sobre varias líneas seleccionadas; insertar reemplaza la selección y deja el cursor al final de lo insertado.
- [x] 4.2 Crear `src/ui/editor.js` con `createCodeEditor` (D4): `<textarea>` sobre un `<pre>` coloreado, columna de números de línea, `setMarks`, teclado y Escape. Agregar sus estilos a `styles/app.css` con una sola regla de tipografía para los dos elementos, usando los tokens existentes.

## 5. Lógica de la pestaña sin DOM

- [x] 5.1 Crear `src/tabs/rules/program.js` con `createProgramState` (D6 y D7). Verificar en `tests/rules-program.test.js`: un texto válido pasa a ser el programa válido; uno con error conserva el válido anterior y expone los errores; sin ningún válido anterior, `valid` es `null`; cambiar la cantidad de sensores vuelve a analizar y, si deja de valer, `valid` pasa a `null`; `constants` lista las del programa válido; `isOwn` es falso para el programa inicial y los ejemplos en los dos idiomas y verdadero para cualquier otro texto.
- [x] 5.2 Crear `src/tabs/rules/session.js` con los indicadores, el reintento automático a los 90 pasos y las tres misiones (D9). Verificar en `tests/rules-session.test.js` un caso por escenario de "Misiones" y de "Reintento automático" de `pestana-reglas` que no dependa del DOM, incluido que en pausa no se cuenta, que un intento largo sin vehículos superados no avanza ninguna misión y que la misión de tráficos vuelve a cero al cambiar el programa.
- [x] 5.3 Agregar `rulesProgram` a `src/ui/preferences.js` y pasar `preferences` en el contexto de `mount` desde `src/ui/app.js` (D8). Verificar en `tests/preferences.test.js`: texto recordado, texto de más de 20 000 caracteres tratado como ausente y almacenamiento que falla.
- [x] 5.4 Crear `src/tabs/rules/shortcuts.js` (espacio y R). Verificar con una prueba que devuelven sus acciones y que con Ctrl o Cmd no devuelven nada.
- [x] 5.5 Correr `npm test` y confirmar que pasa todo.

## 6. Pestaña Reglas a mano: escenario y tablero

- [ ] 6.1 Crear `src/tabs/rules/index.js` y registrarlo en `src/main.js`: mundo con la semilla 2, controlador de reglas con el programa inicial (o el recordado), vista, bucle y estado a nivel de módulo. Verificar en el navegador los escenarios "Abrir Reglas a mano" de `estructura-app` y "Estado por defecto" y "El programa inicial hace algo y no alcanza" de `pestana-reglas`.
- [ ] 6.2 Armar la tarjeta del programa con el editor, la línea de estado y los errores, y hacer que el programa rija mientras se escribe con el retardo de D7. Verificar en el navegador los escenarios de "Editor del programa", "Escribir con comodidad", "El programa rige mientras se escribe" y "Errores a la vista", incluidos el de 70 caracteres en un renglón, el desplazamiento con 40 líneas (el color y los números de línea acompañan al texto) y el atajo de deshacer.
- [ ] 6.3 Resaltar en cada cuadro las líneas que se cumplen con `setMarks`. Verificar en el navegador los cuatro escenarios de "Líneas que se cumplen resaltadas".
- [ ] 6.4 Agregar la paleta de palabras, con la clase `guide`. Verificar los escenarios de "Paleta de palabras": insertar en el cursor, sensores del auto, constantes del programa, 30 sensores y palabras en el idioma activo.
- [ ] 6.5 Agregar el renglón de indicadores y la tarjeta de percepción y acción con los nombres del lenguaje (D11). Verificar los escenarios de "Indicadores del programa" y "Percepción y acción con los nombres del lenguaje", y el de "Editor a la vista": al menos 12 líneas sin desplazar el tablero.
- [ ] 6.6 Verificar en el navegador los escenarios de "Tarjeta con editor" de la spec `tablero`: plegar la tarjeta, que las otras pestañas sigan sin controles en su tablero y que el espacio se escriba sin pausar.

## 7. Pestaña Reglas a mano: panel

- [ ] 7.1 Armar la guía, los controles del intento, los interruptores de sensores y de reintento automático, y los mensajes de choque (insignia con el reintento encendido, cuadro con botón con el reintento apagado). Verificar en el navegador los escenarios de "Guía de inicio", "Controles del intento" y "Reintento automático".
- [ ] 7.2 Agregar los tres ejemplos, restablecer, exportar e importar, todos por `replaceProgram` con su confirmación (D8); los ejemplos y restablecer cambian además los sensores del auto. Verificar en el navegador los escenarios de "Programas de ejemplo" (cada ejemplo deja en la sección avanzada sus sensores y sus barras con nombre en el tablero; el de tres sensores frena sin chocar; el de siete supera al menos 10 vehículos; el de veinte recorre menos que el de siete), "Restablecer el programa" y "Exportar e importar el programa", incluido un archivo de más de 200 líneas y uno que no es de texto.
- [ ] 7.3 Agregar las misiones. Verificar los cinco escenarios de "Misiones".
- [ ] 7.4 Agregar la sección avanzada compartida y volver a analizar el programa al cambiar los sensores. Verificar los cuatro escenarios de "Configuración avanzada".
- [ ] 7.5 Recordar el programa con `preferences.rulesProgram` y conservar el estado al cambiar de pestaña. Verificar los tres escenarios de "Programa recordado" (para el de navegador sin almacenamiento, alcanza con la prueba de 5.3 y con abrir la pestaña en una ventana privada).

## 8. Textos y tooltips

- [ ] 8.1 Completar en los dos diccionarios los textos de D12: pestaña, guía, indicadores, tarjetas, estado, los dieciséis errores, controles, ejemplos, confirmaciones, mensajes de importar, choque y misiones. Reemplazar `help.tab.rules.soon` por `help.tab.rules`. Verificar con `npm test` (las claves coinciden en los dos idiomas) y con el escenario "Explicación de Reglas a mano".
- [ ] 8.2 Escribir los tooltips de cada control y de cada palabra de la paleta, con qué hace y por qué importa en lenguaje llano. Verificar con los cuatro escenarios de "Controles de la pestaña explicados" y con `mlLab.auditTooltips()` en la consola, con todo desplegado, en los dos idiomas.
- [ ] 8.3 Extender `tests/copy-length.test.js` con la guía (240), los renglones de ayuda (120) y las misiones (34) de esta pestaña. Verificar que pasa.

## 9. Verificación integral

- [ ] 9.1 Correr `npm test` y confirmar que pasa todo; listar en el reporte las pruebas nuevas y cualquier aserción existente a la que se le hayan sumado claves.
- [ ] 9.2 Recorrer la pestaña en español y en inglés con anchos de ventana de 600, 800, 960, 1366, 1440 y 1920 píxeles: el editor se puede usar en todos, el color coincide con el texto, y no hay texto cortado ni pisado. Comprobar que el panel entra sin desplazarse en 1440×900 y en 1366×768.
- [ ] 9.3 Recorrer la pestaña solo con el teclado: se entra al editor con Tab, se sale con Escape, y con el foco fuera del editor funcionan la barra espaciadora y R.
- [ ] 9.4 Medir la tasa de cuadros durante diez segundos con un programa de 50 reglas en marcha: al menos 50 cuadros por segundo de promedio. Si no se alcanza, detenerse y consultar con las medidas.
- [ ] 9.5 Comprobar que las pestañas El problema y Entrenar siguen funcionando igual, y que ninguna pestaña muestra una clave en lugar de su texto.
- [ ] 9.6 Repasar las cuatro preguntas del filtro de entrada sobre el resultado en pantalla, con la tabla de proposal.md, con la guía activa y apagada; anotar en el reporte cualquier respuesta que ya no se sostenga.
- [ ] 9.7 Anotar en `PENDIENTES.md`, junto a la nota sobre la fitness, el resultado medido en 2.3: cuántos vehículos supera el ejemplo de siete sensores, como referencia de lo que el auto puede hacer, y que el de tres sensores reproduce a mano la conducta de seguir al tráfico.

## Workflow follow-up

- Al archivar, actualizar a mano el propósito de `openspec/specs/tablero/spec.md` con el texto de design.md (Migration Plan): un delta no puede cambiar un propósito.
- Archivar el cambio cuando el dueño del proyecto lo haya revisado en el navegador.
