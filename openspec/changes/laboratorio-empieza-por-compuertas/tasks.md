# Tareas

## 1. Núcleo: datos y acierto

- [x] 1.1 `datasets.js`: `gatesDataset({ gate })` con AND, OR y XOR (D1), y `splitDataset` que deja los cuatro en práctica. Pruebas de los escenarios de "Compuertas lógicas" (los tres, siempre iguales, sin apartados, compuerta desconocida) en `tests/`; `npm test` en verde.
  *Hecho. `gatesDataset({ gate })` en `datasets.js`: los cuatro casos (0, 0), (0, 1), (1, 0), (1, 1), siempre en ese orden, con `kind: 'gates'`; `gateOf` lleva cualquier compuerta desconocida a AND. `splitDataset` deja los cuatro en práctica y ninguno apartado. Pruebas en `tests/gates.test.js` (AND, OR, XOR, siempre iguales, sin apartados con 10, 30 y 50 %, compuerta desconocida). `npm test`: 1231 en verde.*
- [x] 1.2 `backprop.js`: 0,5 exacto no es acierto (D6). Prueba nueva con pesos en cero y AND (0 de 4); correr la suite entera y revisar cada diferencia que aparezca.
  *Hecho. `outputCorrect(out, target)` en `backprop.js`: sí solo por encima de 0,5, no solo por debajo; 0,5 exacto no es acierto. `isCorrect` y las filas de `evaluatedRows` la usan. Prueba nueva: AND con pesos y sesgo en cero acierta 0 de 4. Suite entera corrida: ninguna prueba vieja cambió (las 1207 de antes siguen en verde), así que no hubo diferencias que revisar.*
- [x] 1.3 `gate-solutions.js` (D9): soluciones para AND y OR sin capas ocultas y XOR con una de 2, en tanh, sigmoide y ReLU. Prueba de que cada una acierta 4 de 4 y queda entre −3 y 3.
  *Hecho. `src/tabs/lab/gate-solutions.js` (`gateSolution`, `solutionShapeOk`): sin capas ocultas, AND (1, 1), −1,5 y OR (1, 1), −0,5; con una capa de 2, la oculta 1 es OR y la 2 es AND, y la salida las combina (XOR: "OR y no AND"; AND y OR: pasa la oculta que corresponde). **Diferencia con D9**: con pesos (3, 3) el sesgo de AND tenía que ser −4,5, fuera del rango de las pastillas que el mismo D9 pide; se usan pesos (2, 2) con sesgos −1 (OR) y −3 (AND), y la salida de XOR con tanh pasa a (1,5; −1,5), −1. Prueba: cada solución, con tanh, sigmoide y ReLU, acierta 4 de 4, todos sus números quedan entre −3 y 3 y ninguna respuesta queda a menos de 0,05 de 0,5 (con sigmoide en la oculta, XOR queda a 0,08: la menor). Sin solución: XOR sin capas, dos capas, o una capa que no es de 2.*

## 2. Sesión por clase de datos

- [x] 2.1 `session.js` y `defaults.js`: registro por clase con los valores por defecto de la tabla de D3; `kind: 'gates'`. Pruebas: volver a compuertas conserva pesos, cambios y curva; primera vez en puntos da la red de siempre; "Red de siempre" y "Reiniciar pesos" en compuertas (ceros sin capa oculta, serie con capa oculta); cambiar de compuerta conserva pesos y vacía la curva.
  *Hecho. `session.js` guarda un registro por clase (`gates`, `points`, `driving`): forma de la red, activación, tasa, semilla, el aprendizaje (red, curvas, ejemplo en curso), los cambios a mano (ahora viven en la sesión, `session.manual`), el punto de prueba y el paso y ritmo de la barra. Cambiar de clase guarda el vigente y trae el otro, o lo crea con `KIND_DEFAULTS` (`defaults.js`, la tabla de D3). Compuertas: sin capas ocultas, pesos y sesgo en cero; capa nueva de 2; con capa oculta, pesos al azar de la serie. `setGate` arma datos y curva nuevos con la misma red, sus pesos, lo apagado y los cambios a mano; `resetGates` vuelve a AND sin tocar la red. Pruebas en `tests/lab-gates-session.test.js` (abre con AND 2 → 1 en cero y 0 de 4; volver a compuertas conserva pesos, 3 cambios y la curva; primera vez en puntos da 2 → 4 → 1 tanh 0,1; la red de compuertas no pasa a puntos; "Red de siempre" y "Reiniciar pesos" en compuertas; cambiar de compuerta conserva pesos y cambios y vacía la curva). En el navegador (1440×900): abre en "Red: 2 → 1"; Puntos muestra 2 → 4 → 1 con el círculo; volver a Compuertas muestra otra vez 2 → 1.*
- [x] 2.2 Arranque en pausa y "nada aprende sin pedirlo" (D4): al abrir, al cambiar de clase, datos o red. Prueba de la sesión y de la reproducción (`playback.js`): paso por defecto de neurona a 1 por segundo con compuertas, época con puntos y tu manejo.
  *Hecho. `createLabPlayback` arranca en pausa; `kindPlayback(kind)` da el paso y el ritmo de cada clase (compuertas: neurona a 1 por segundo; puntos y tu manejo: época a 10 por segundo) y `apply` los cambia sin tocar reproducir o pausar. La pestaña guarda el paso y el ritmo con la clase que se deja y trae los de la que se elige; al montar solo reproduce si estaba reproduciendo al salir. Pruebas de la reproducción y de que cambiar clase, compuerta, datos o red no avanza el aprendizaje. En el navegador: al abrir, "Reproducir" a la vista, "Neurona" elegida, "1 paso por segundo", y después de 5 s sigue "Época 0"; al elegir Puntos, "Época" y "10 épocas por segundo", en pausa. Los 30 s del escenario "Nada se mueve solo" se miden en 7.2.*
- [x] 2.3 Contadores de XOR (D8) y del indicador "a mano" (D10). Pruebas: 5 cambios o 50 épocas sin 4 de 4 activan la explicación; un paso de aprendizaje apaga "a mano".
  *Hecho. La sesión da los pasos (`session.advance`) y registra los cambios a mano (`session.recordManual`) para contar: con XOR sin capas ocultas, cambios a mano (un arrastre es uno) y épocas desde que se eligió; `session.xor.explain` se enciende con 5 cambios o 50 épocas sin 4 de 4. `session.handOnly`: la compuerta elegida sigue "a mano" hasta que el aprendizaje da cualquier paso con ella; "Reiniciar pesos" y "Red de siempre" la vuelven a encender. Pruebas: 4 cambios no explican y el 5.º sí; 49 épocas no y la 50.ª sí (siempre ≤ 3 de 4); con capa oculta no hay contador y volver a cero capas empieza de nuevo; un paso de neurona apaga "a mano" solo para AND.*
- [x] 2.4 Actualizar las pruebas existentes del Laboratorio que asumían puntos aprendiendo al abrir: que elijan puntos y reproduzcan. `npm test` en verde.
  *Hecho. `tests/lab.test.js` y `tests/probe-point.test.js` eligen Puntos al crear la sesión (`setKind('points')`), y la prueba de la reproducción espera la pausa y reproduce. `npm test`: 1243 en verde.*

## 3. Plano y tabla de verdad

- [ ] 3.1 `plane-view.js`: rango del plano (D2) en geometría, grilla, conversión y tope del punto de prueba. Pruebas de conversión con [−1, 1] (sin cambios) y [−0,5; 1,5].
- [ ] 3.2 Plano de las compuertas: cuatro casos con color y forma, marcas 0 y 1 en los ejes. Verificar en el navegador "Cuatro casos a la vista", "La recta se mueve" y "Pesos en cero".
- [ ] 3.3 `truth-table.js` (D6) en el tablero, con fila elegida → punto de prueba, fila del ejemplo en curso destacada, `table` con encabezados y anuncio de aciertos. Verificar los escenarios de "Tabla de verdad".
- [ ] 3.4 Barra con compuertas: AND, OR y XOR con miniatura; sin ruido ni cantidad; panel sin apartados; curva solo de práctica (ocultar, no deshabilitar). Verificar "Elegir la compuerta" completo.

## 4. Perillas sobre la red

- [ ] 4.1 `network-inspector.js`: grupo de pastillas (D5) para pesos y sesgos, regla de hasta 16 conexiones, ubicación y corrimiento si se pisan, zoom y desplazamiento. Prueba pura de la ubicación (ninguna se pisa) en todas las formas del Laboratorio de hasta 16 conexiones.
- [ ] 4.2 Controles de las entradas: interruptor 0/1 y pastilla continua, con `role` y nombre accesibles; clic en la neurona sigue eligiéndola. Verificar "Perillas de las entradas".
- [ ] 4.3 Laboratorio: pedir perillas (pesos, sesgos y entradas según la clase); interruptores ↔ punto de prueba ↔ fila de la tabla. Verificar "Perillas en la red del Laboratorio", incluido "Deshacer una perilla".
- [ ] 4.4 Respuesta en vivo (D11): plano sin tope de 15 por segundo durante un gesto de perilla, "error de ahora" con antes, flecha y palabra; muestra fija de hasta 500 ejemplos con tu manejo. Prueba de la comparación (baja, sube, igual) y de que la curva no suma puntos. Verificar "Se ve en el momento si va mejor" completo, y medir la fluidez arrastrando con 2 → 8 → 8 → 8 → 1 (si la mediana pasa de 16,7 ms, grilla de 25 × 25 durante el gesto).
- [ ] 4.5 Teclado y lector: orden de Tab por capa, flechas de a 0,01 y 0,1 con Mayús, anuncio de las pastillas de sesgo. Verificar con teclas de verdad.

## 5. Recorrido y guía

- [ ] 5.1 Guía por compuerta (AND, OR, XOR antes y después de la explicación), botón "Agregar una capa oculta de 2". Verificar "XOR no se separa con una recta" completo, incluido "Con la capa oculta".
- [ ] 5.2 Medir la tasa por defecto de las compuertas (D7) y fijarla en `defaults.js`; anotar la medida. **Si ninguna tasa candidata cumple, parar y consultar.**
- [ ] 5.3 "Ver una solución" con su estado sin acción y su tooltip. Verificar "Ver una solución" completo.
- [ ] 5.4 Misiones por clase (D10). Verificar los escenarios de misiones de "Guía y misiones del Laboratorio".
- [ ] 5.5 "De la mano a backpropagation": verificar los tres escenarios con pesos puestos a mano; las pastillas se mueven con la corrección.

## 6. Textos y acceso

- [ ] 6.1 Textos en `es.js` y `en.js`: compuertas, tabla, guía, misiones, botones, tooltips (incluido "compuerta" como término). `mlLab.auditTooltips()` no informa nada.
- [ ] 6.2 Medir a 1440×900 y 1366×768, en es y en, con compuertas sin capa oculta y con 2 → 2 → 1: ninguna zona se desplaza, el panel entra entero. **Si algo deja de entrar, parar y consultar.**

## 7. Cierre

- [ ] 7.1 Fluidez: arrastrar una pastilla 10 s con 2 → 4 → 1 aprendiendo de a épocas; mediana y peor intervalo entre cuadros.
- [ ] 7.2 Verificación manual en el navegador contra el filtro de entrada de la propuesta (las cuatro features), con capturas en la carpeta de notas: AND resuelta a mano, XOR sin capa con la explicación, XOR con la capa resuelta, paso a paso de a neurona desde pesos a mano.
- [ ] 7.3 PENDIENTES.md: lo que quedó afuera y lo no probado.
- [ ] 7.4 `npm test` y `openspec validate laboratorio-empieza-por-compuertas --strict`.
