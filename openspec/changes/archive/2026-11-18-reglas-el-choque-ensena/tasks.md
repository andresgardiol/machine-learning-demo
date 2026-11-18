# Tasks

## 1. Antes

- [x] 1.1 Copiar `borradores/reglas-mesa-de-trabajo/capturar.mjs` a `borradores/reglas-el-choque-ensena/` con estas vistas de Reglas a mano, a 1440×900 y 1366×768:
  - el choque del programa inicial, con Reintentar solo encendido (a los 0,5 s del choque) y apagado;
  - el choque con un error en el programa;
  - la comparación de ejemplos abierta (en el después);
  - la repetición a 1 s del choque (en el después);
  - el cuaderno con 3 casos (en el después).

  En cada vista, medir el alto de la escena. Sacar el antes de las vistas que ya existen hoy, en `antes/`, con su `indice.md`. Verificación: dos corridas seguidas dan las mismas imágenes.

  *Hecho: `borradores/reglas-el-choque-ensena/capturar.mjs` (copia del guion de `reglas-mesa-de-trabajo`, puerto 8771, dos tamaños) con siete vistas: 01 choque con Reintentar solo, 02 sin él, 03 con una línea con error (`volar`) al final, 04 comparación, 05 repetición a 1 s (60 flechas a la izquierda en el deslizador), 06 cuaderno con 3 casos y 07 el choque con la guía apagada (agregada para la tarea 6.3). Las 04 a 06 se saltan en `antes`. Cada vista espera el choque en pasos de 50 ms de tiempo virtual y saca la foto 0,5 s después. Se suman `indice.mjs` (copiado) y `difpng.mjs`, que cuenta los píxeles distintos entre dos PNG.*
  *Medido (guion, `antes/indice.md`, sobre `7818dd3` sin tocar `src/`): la escena mide 679 px a 1440×900 y 547 px a 1366×768 en las cuatro vistas; el editor muestra 22 y 15 líneas (14 con la línea de error y su aviso). El programa inicial choca contra el borde a los 82 m con `sensor1` 0,87, `sensor2` 0,81 y `sensor3` 0,49, que son los valores del escenario "Agregar la condición". Auditorías de sistema y de jerarquía: 0 problemas en las ocho vistas.*
  *Medido (reproducibilidad, `cmp` y `difpng.mjs`): tres corridas completas más. De 40 imágenes, la primera dio 4 distintas y las otras dos, 1 cada una, y nunca la misma. Ninguna difiere en contenido: son entre 14 y 33 píxeles de suavizado en bordes (la barra superior a y 13–14, o el borde de la escena). Una vista corrida sola tres veces dio el mismo md5 las tres. Lo tomo como "mismas imágenes" salvo el suavizado de Chrome sin ventana, que el guion no controla.*

## 2. Núcleo sin DOM

- [x] 2.1 `compareRuns` (D4), un generador por tramos, con pruebas:
  - con la semilla 2 y los valores por defecto, devuelve cuatro filas con sus cifras;
  - dos corridas dan las mismas cifras;
  - el ejemplo de 20 sensores tiene casi el doble de reglas que el de 7 y no recorre más que él (escenario "Más reglas no es mejor");
  - el tope de 2 minutos se respeta;
  - partirlo en tramos de distinto tamaño da el mismo resultado.

  No entrenar redes. Verificación: `npm test`.

  *Hecho: `src/tabs/rules/compare.js`, sin DOM. `compareRuns` es un generador que corre cada programa en un mundo nuevo (misma semilla y velocidad, calle recta por `settingsForProgram`, sus sensores) y cede cada 600 pasos; `compareNow` lo corre de una vez. Un programa con errores sale como fila sin cifras. `compareNotes` dice si hay que avisar el circuito y la velocidad (los ejemplos son para 20 m/s). Pruebas en `tests/rules-compare.test.js` (7).*
  *Medido (`node --test tests/rules-compare.test.js`, semilla 2, valores por defecto): programa inicial, 5 sensores, 1 regla, 82,1 m, 1 superado, choca contra el borde a los 4,4 s; 3 sensores, 1 regla, 1223,9 m, 0 superados, no choca en 2 min; 7 sensores, 5 reglas, 1040,8 m, 14 superados, choca contra un vehículo a los 52,5 s; 20 sensores, 9 reglas, 289,7 m, 4 superados, choca contra un vehículo a los 14,8 s. Tramos de 1, 97, 600 y 5000 pasos dan lo mismo. La comparación entera tarda unos 60 ms en Node (unos 11 000 pasos, unos 5 µs por paso; la hipótesis de D4 era 20 µs).*
- [x] 2.2 `caseCondition` (D6), con pruebas: los dos sensores más altos por encima de 0,3, el redondeo hacia abajo a la décima, el idioma (`sensor1 > 0.80` y `if` / `then` en inglés), un solo sensor y ningún sensor por encima de 0,3. Verificación: `npm test`.

  *Hecho: `caseCondition` en `src/tabs/rules/case.js`. Los sensores van en orden de número, no de lectura. "Laterales", que D6 no define, quedó como el tercio de cada costado (con 5 sensores, el 1 y el 5; con 7, el 1, 2, 6 y 7); con 1 o 2 sensores, todos. Pruebas en `tests/rules-case.test.js`, también que la condición con una acción es una regla válida y que sin acción da error.*
  *Observado: con ningún sensor por encima de 0,3 la condición puede quedar en `sensor1 > 0,00`, que es lo que pide D6 pero no dice mucho. Queda para que lo mire el dueño.*
- [x] 2.3 El búfer circular de la repetición (D3), con pruebas: guarda los últimos 180 cuadros, se vacía al reiniciar, con un intento corto devuelve menos cuadros, y el tráfico de un cuadro guardado se recalcula igual al del momento. Verificación: `npm test`.

  *Hecho: `createReplayBuffer`, `frameOf` y `raysOf` en `src/tabs/rules/case.js`. Cada cuadro guarda pasos, tiempo, progreso, la pose del auto, las lecturas (`Float32Array`), la velocidad, los controles, las líneas que se cumplían y los rayos (origen, fin y choque del rayo, 6 números por sensor, en `Float32Array`). Los rayos no estaban en la lista de D3; se guardan para dibujar el cuadro sin recalcular la percepción. Pruebas en `tests/rules-case.test.js` (6 del búfer), entre ellas que el tráfico recalculado con `traffic.vehicles(f.time, …)` es igual al del momento en los cuadros 0, −1, −60 y −179, y que repetir el intento da los mismos cuadros.*
  *Calculado, no medido en el navegador: con 5 sensores un cuadro tiene unos 60 números, unos 50 kB los 180 cuadros. Con 100 sensores (el máximo) serían unos 430 kB, más que los 100 kB de D3.*
- [x] 2.4 El reintento de 5 segundos y la retención (D2) en `src/tabs/rules/session.js`, con pruebas: reinicia a los 300 pasos; no reinicia en pausa ni retenido; reiniciar a mano o probar otro programa sale de la retención. Verificación: `npm test`.

  *Hecho: `RETRY_STEPS` = 300, `hold()`, `held` y `retryIn` (pasos que faltan, para la cuenta regresiva). `restart` sale de la retención; la pestaña reinicia por ahí al reiniciar a mano y al probar un programa. Cuatro pruebas nuevas en `tests/rules-session.test.js` y las de 90 pasos pasadas a 300.*
  *Medido: `npm test`, 1401 pruebas, 0 fallas (con las del grupo 2).*

## 3. El caso del choque

- [x] 3.1 La tarjeta del caso en el lugar de la marcha (D1): título, datos, cuenta regresiva y acciones. Se quitan de Reglas a mano el cartel chico y `crashBox`. Verificación: escenarios "Estado por defecto", "Ninguna regla" y "Vuelta atrás" de "Caso del choque"; "Reintento encendido", "Quedarse en el caso", "Reintento apagado" y "En pausa no se reintenta" de "Reintento automático".

  *Hecho: en `src/tabs/rules/index.js`, la tarjeta del caso (`.rules-case`, `data-state="crash"`) reemplaza a la barra de marcha mientras hay un choque: título ("¡Choque! Se salió de la calle a los 82 m"), las líneas que se cumplían o "Ninguna regla se cumplía", la cuenta regresiva ("Vuelve a salir en 5 s", o en pausa, retenido o con el reintento apagado, su texto), "Compará con los ejemplos", "Escribir una regla para este caso" y Reiniciar (R). Los datos se guardan al chocar (`onCrash`): la distancia, la causa, las líneas que decidió el programa en el paso del choque y las lecturas. Se quitaron de Reglas a mano el cartel chico y `crashBox`, y sus textos (`rules.crash.*`). Reiniciar sube al renglón del título para que las dos acciones del caso entren en un renglón: con las tres juntas la tarjeta medía 172 px.*
  *Medido (sondas `sondas/choque.mjs`, `caso-completo.mjs`, `resto.mjs` y `pausa-y-cuaderno.mjs` sobre `capturar.mjs --sonda`, Chrome sin ventana con tiempo virtual, 1366×768): Estado por defecto: la tarjeta dice "¡Choque! Se salió de la calle a los 82 m" y "Se cumplían las líneas 3, 4 y 5", la columna queda en 0,87 / 0,81 / 0,49 / 0 / 0 y el editor marca 3, 4 y 5 como choque. Reintento encendido: 2 s después dice "Vuelve a salir en 3 s" y a los 5,2 s el auto ya volvió a salir (14 pasos). Quedarse en el caso: con la repetición movida, 6 s después el caso sigue y dice "El caso queda a la vista hasta que reinicies". Reintento apagado: 8 s después el caso sigue, con "Reintentar solo está apagado: reiniciá cuando quieras". En pausa: 8 s pausado y el caso sigue; al reanudar, se reinicia. Vuelta atrás: tras Reiniciar no hay tarjeta ni marcas de choque y vuelve la marcha.*
  *Sin probar en el navegador: el escenario "Ninguna regla" (con el programa inicial siempre se cumple `avanzar`). El texto sale del mismo código con la lista vacía.*
- [x] 3.2 Las líneas del choque marcadas en el editor con `data-state="crash"`, distintas de "se cumple". Verificación: escenario "Sin depender del color", con una captura en gris.

  *Hecho: `setMarks` del editor (`src/ui/editor.js`) acepta `crash`. Esas líneas llevan `data-mark="crash"` en el número (✸) y `data-state="crash"` en el renglón. En `styles/app.css`, `.editor-line[data-state="crash"]` anula el borde y el relleno del estado general y pone una barra lateral roja con un rayado diagonal. "Se cumple" sigue con ▸ y la barra clara.*
  *Observado (captura `despues/01-choque-reintento-1440x900-gris.png`, con acromatopsia emulada): las líneas 3 a 5 se distinguen por el rayado y el ✸ del margen. En `05-repeticion`, la línea que se cumplía 1 s antes lleva ▸ y la barra lisa, sin rayado.*
- [x] 3.3 La acción principal del choque en `mainAction`: "Compará con los ejemplos", con el reintento encendido o apagado. Prueba en `tests/main-action.test.js`. Verificación: escenario "Choque en Reglas a mano" de `jerarquia-visual`; `mlLab.auditHierarchy()` sin problemas en las vistas del choque; `npm test`.

  *Hecho: `mainAction('rules', { crashed: true })` devuelve `'compare'`; la pestaña la aplica a "Compará con los ejemplos". Prueba en `tests/main-action.test.js`, también que sin choque vuelve a `'run'`.*
  *Medido: `mlLab.auditHierarchy()` da 0 problemas en las catorce vistas del después y en las sondas, en español y en inglés. La única acción principal visible con el caso es "Compará con los ejemplos", con el reintento encendido o apagado (`sondas/pausa-y-cuaderno.mjs`); después de reiniciar vuelve a ser "Pausar (espacio)". `npm test`: 0 fallas.*
- [x] 3.4 Medir con el guion a 1366×768 el alto de la escena con la tarjeta del caso y el cuaderno. **Si queda por debajo de 450 px, parar y consultar**, con las medidas. Verificación: la medida, anotada en esta tarea.

  *Medido (guion, `despues/indice.md`): a 1366×768 la escena mide 479 px con la tarjeta del caso y el cuaderno a la vista (antes: 547), así que no hubo que parar. La tarjeta mide 128 px y el cuaderno 40. Sin choque, la escena mide 507 px (por el cuaderno). Con la guía apagada y el caso a la vista, 519. A 1440×900: 611 con el caso y el cuaderno (antes: 679).*

## 4. Repetición, comparación, "Tu programa" y regla para el caso

- [x] 4.1 El deslizador de la repetición sobre la escena (D3): dibuja el cuadro guardado; la columna y el editor lo siguen; flechas y Mayús + flechas; tooltip en los dos idiomas. Verificación: escenarios de "Repetición del choque".

  *Hecho: el deslizador `.rules-replay` va superpuesto abajo de la escena, con su ancho, mientras hay un caso. Va de −(cuadros − 1) a 0 y por defecto queda en 0 (el choque). Al moverlo, el bucle dibuja el cuadro guardado con `frameWorld`: la pose y los rayos guardados y el tráfico recalculado con `traffic.vehicles(frame.time, …)`. La columna y la salida muestran lo de ese cuadro, y el editor marca sus líneas como "se cumple". Las flechas no salen del deslizador (`stopPropagation`); Mayús + flecha mueve 10 cuadros. Tiene tooltip (`rules.replay`) y un valor legible ("1,0 s antes" / "el choque"). Moverlo retiene el caso.*
  *Medido (`sondas/caso-completo.mjs`): Volver atrás en el tiempo: 60 flechas a la izquierda dejan el deslizador en −60 ("1,0 s antes"), con lecturas 0,55 / 0,31 / 0 / 0,68 / 0 y la línea 3 como "se cumple". Con el teclado: los pasos y el ángulo del auto no cambian con las flechas, y Mayús + izquierda pasa de −60 a −70. Determinismo: en `tests/rules-case.test.js`, repetir el intento da los mismos cuadros. Intento corto: en la misma prueba, un intento de 1 s guarda 60 cuadros; en la pestaña, el mínimo del deslizador sale de la cantidad de cuadros.*
  *Sin probar en el navegador: un choque antes de los 3 s (el programa inicial choca a los 4,4 s).*
- [x] 4.2 La comparación en la tarjeta del programa (D4), con "Calculando…", el aviso de velocidad, el aviso de calle recta y "Comparar" en la cabecera. Cada fila prueba su programa. Verificación: escenarios de "Comparar con los ejemplos". Medir con el navegador que la escena no se traba mientras se calcula: anotar los cuadros por segundo, o decir que no se pudo con el panel oculto.

  *Hecho: la comparación (`.rules-compare`) va dentro del cuerpo de la tarjeta del programa, antes del editor, con "Ocultar". Mientras calcula dice "Calculando…". Avisa la calle recta en un circuito y la velocidad si no es 20 m/s. La tabla lleva programa, sensores, reglas, distancia, superados y resultado, y un botón "Probar" por fila. Corre por tramos de 600 pasos, uno por `requestAnimationFrame`, y se vuelve a calcular solo si cambian la semilla, los ajustes o los programas. Filas: el programa que maneja (si no es un ejemplo), los tres ejemplos y "Tu programa" si está guardado. "Comparar" quedó en el renglón de arriba de la cabecera, junto a Restablecer, Exportar e Importar, y no junto a los ejemplos como dice D4: ahí partía el renglón de sensores y ejemplos en dos y el editor perdía 2 líneas a 1366×768 (15 a 13, medido con el guion).*
  *Medido (sondas): Estado por defecto: al tocar "Compará con los ejemplos" el foco va a la comparación (`activeElement` es `.rules-compare`), aparece "Calculando…" y después cuatro filas: programa inicial, 5 sensores, 1 regla, 82 m, 1, chocó a los 82 m (maneja ahora); 3 sensores cortos, 3, 1, 1223 m, 0, no chocó en 2 min; 7 sensores, 7, 5, 1040 m, 14, chocó a los 1040 m; 20 sensores, 20, 9, 289 m, 4, chocó a los 289 m. Son las cifras de `compareRuns` en Node (redondeadas hacia abajo). Probar un ejemplo: la fila de 7 sensores deja 7 sensores, semilla 2, el intento recién empezado y el caso fuera. Sin avisos con los valores por defecto. El aviso de velocidad y el de circuito no se vieron en el navegador; están probados en `tests/rules-compare.test.js`.*
  *Medido (fluidez, `medir-fluidez.mjs`: Chrome sin ventana en tiempo real, con su `requestAnimationFrame` y sin el reloj virtual, 1366×768, tres corridas en cada caso): con el auto chocado, 60 cuadros por segundo antes y durante el cálculo, ningún cuadro de más de 16,8 ms, y la comparación tarda 350 ms (20 cuadros). Con el auto andando (abriendo "Comparar" sin chocar): lo mismo, 60 cuadros por segundo y ningún cuadro de más de 16,8 ms; el auto avanzó 21 pasos en esos 350 ms. Es Chrome sin ventana en esta máquina, no una pantalla real: el panel del navegador de la app estaba oculto y ahí no corre la animación.*
- [x] 4.3 "Tu programa" (D5): ejemplos sin confirmación, la opción "Tu programa" y la ida y vuelta con sus sensores. Ajustar las pruebas de los ejemplos que esperaban la confirmación. Verificación: escenarios de "Tu programa" y "Ejemplo con cambios propios"; `npm test`.

  *Hecho: los ejemplos y las filas de la comparación se cargan sin confirmación (`tryProgram`). Si el texto del editor es propio, primero queda en `state.own` con sus sensores. "Tu programa" es la primera opción de los ejemplos, a la vista si hay uno guardado, con `aria-pressed` cuando es el que está en el editor. Mientras el texto propio está en el editor, "Tu programa" lo sigue, así volver no pierde lo escrito después. Restablecer, que sigue pidiendo confirmación, lo borra. Volver desde un circuito sigue pidiendo confirmación, porque cambia la pista. No había pruebas de Node que esperaran la confirmación de los ejemplos (la confirmación vive en el DOM), así que no hubo que ajustar ninguna.*
  *Medido (`sondas/resto.mjs`): Ida y vuelta: con reglas propias en 7 sensores, el ejemplo de 20 se carga sin confirmación, "Tu programa" aparece y la comparación suma la fila "Tu programa"; al tocarlo, el editor vuelve al texto exacto, los sensores vuelven a 7, el programa maneja y el botón queda elegido. Sin texto propio: de 3 sensores a 7 sensores, "Tu programa" no aparece. Vuelta atrás: Restablecer y confirmar lo saca. `npm test`: 0 fallas.*
- [x] 4.4 "Escribir una regla para este caso" (D6), con deshacer. Verificación: escenarios de "Regla para el caso".

  *Hecho: `writeCaseRule` agrega al final, con un salto de línea, `caseCondition(lecturas del choque, idioma)` por `editor.insert` (con deshacer). Deja el cursor al final, el foco en el editor y el final del programa a la vista; abre la tarjeta del programa si estaba plegada y retiene el caso.*
  *Medido (sondas): Agregar la condición: el programa termina en `si sensor1 > 0,80 y sensor2 > 0,80 entonces `, con el cursor al final y el foco en el editor. El programa con error: el editor dice "Línea 6: la regla no tiene ninguna acción…" y el programa anterior sigue manejando. Vuelta atrás: `execCommand('undo')` deja el texto como antes.*
  *Sin probar: Ctrl+Z con el teclado real. Se probó el deshacer del navegador por `execCommand`, que es lo que usa el editor.*

## 5. Cuaderno de casos

- [x] 5.1 La franja del cuaderno (D7): la cuenta, el eje, un punto por choque con tooltip, oculta con la guía, y borrada al restablecer o al cambiar de pista. Textos en los dos idiomas. Verificación: escenarios de "Cuaderno de casos"; `mlLab.auditSistema()` y `mlLab.auditTooltips()` sin problemas.

  *Hecho: la franja `.rules-casebook` (clase `guide`) va entre la escena y la marcha o el caso, con 40 px de alto. Muestra "Todavía no hubo casos…" o "3 casos · 1 regla · mejor 82 m" y un eje de 0 a la mejor distancia, con un ✸ rojo por choque, cada uno con tooltip y `aria-label` ("Se salió a los 82 m"). La mejor distancia cuenta también los intentos que terminan sin choque. Se borra al restablecer el programa, al cambiar de pista y al volver a la calle desde un circuito con un ejemplo. Se conserva al cambiar de pestaña.*
  *Medido (sondas): Estado por defecto: "Todavía no hubo casos: cada choque se anota acá.". Los casos se suman: tres choques dan "3 casos · 1 regla · mejor 82 m" y tres puntos (los tres a 82 m, el mismo choque). Con reglas nuevas cambia la cifra: con el ejemplo de 7 sensores dice "2 cases · 5 rules · best 1040 m" en inglés. Guía apagada: la franja no se ve y mide 0 px. Vuelta atrás: Restablecer vuelve a "Todavía no hubo casos". `mlLab.auditTooltips()`, `mlLab.auditSistema()` y `mlLab.auditHierarchy()`: 0 problemas en español y en inglés, con el caso, la comparación, "Tu programa" y la repetición a la vista (`sondas/auditorias.mjs`). Antes de corregirlo, "Probar" y "Ocultar" tenían la altura compacta y `auditSistema` los marcaba; ahora tienen la normal.*
  *Sin probar: borrar el cuaderno al cambiar de pista desde la barra (el código está en `applySettings`). Tampoco el escenario literal de agregar dos reglas entre los choques; el conteo sale de `program.rules`.*

## 6. Comportamiento, después y cierre

- [x] 6.1 Comprobar que nada más cambió de comportamiento:
  - los atajos (espacio, R y V);
  - las misiones;
  - el programa recordado;
  - El problema, con su aviso de choque de siempre;
  - con la misma semilla, el auto recorre lo mismo.

  *Medido (`npm test`: 1401 pruebas, 0 fallas, sin entrenar redes; y `sondas/comportamiento.mjs` y `sondas/problema.mjs`): R reinicia (saca el caso y el intento vuelve a 5 pasos), espacio pausa (los pasos no avanzan en 500 ms) y reanuda, y V no da error. Misiones: con el ejemplo de 7 sensores, "Superá 3 vehículos sin chocar ✓ Cumplida" y "3 de 10". Programa recordado: después de recargar la página, el texto propio y sus 7 sensores siguen. El problema: el aviso de siempre ("¡Choque! / Te saliste de la calle después de recorrer 4 m. / … / Reiniciar (R)") con Reiniciar como acción principal y sin tarjeta del caso. Misma semilla: dos choques seguidos a 82,14592785476998 m.*
  *Cambió a propósito: el reintento espera 5 s y no 1,5 (D2), y en Reglas a mano el choque no muestra el cartel chico ni `crashBox`.*

  No entrenar redes. Verificación: `npm test` completo.
- [x] 6.2 Sacar el después con el mismo guion y armar `borradores/reglas-el-choque-ensena/comparacion.md`, con las medidas y las tres auditorías. Verificación: la comparación tiene todas las vistas, y las auditorías dan 0 problemas o cada problema está explicado.

  *Hecho: `borradores/reglas-el-choque-ensena/comparacion.md`, armado por `comparar-md.mjs` a partir de `comparacion-texto.md` y de los JSON del guion. Tiene la tabla de medidas de las catorce vistas, las cifras de la comparación, la fluidez, lo observado y las imágenes antes / después con sus recortes y el gris. Las vistas 04 a 06 solo existen en el después.*
  *Medido: las catorce vistas del después dan 0 / 0 en `auditSistema()` / `auditHierarchy()` (`despues/indice.md`), y `auditTooltips()` da 0, junto con las otras dos, en la sonda `auditorias.mjs`, en los dos idiomas. Para que la vista del cuaderno (tres choques) entrara, el tope por vista del guion pasó de 90 a 180 s reales y los dos primeros choques se esperan sondeando de a 500 ms.*
  *Sin probar: la reproducibilidad del después (solo se comprobó la del antes, en la tarea 1.1).*
- [x] 6.3 Verificación manual contra el filtro de entrada, a 1440×900 y 1366×768, con la guía encendida y apagada:
  - ¿el choque se entiende sin leer?;
  - ¿la comparación muestra sola que más reglas no es mejor?;
  - ¿el mentor puede seguir mostrando intentos seguidos?;
  - ¿se vuelve a "Tu programa" sin perder nada?

  *Observado (capturas de `despues/` a 1440×900 y 1366×768, con la guía encendida y apagada, y las sondas):*
  - *¿El choque se entiende sin leer? Sí: la franja rayada roja con ✸ ocupa el lugar de la marcha, el auto chocado se ve en la escena y las líneas 3 a 5 llevan el mismo rayado y ✸ en el editor. La columna queda en 0,87 / 0,81 / 0,49 junto al auto. El título y "Se cumplían las líneas 3, 4 y 5" ponen nombre a lo que ya se ve.*
  - *¿La comparación muestra sola que más reglas no es mejor? Las columnas Reglas y Recorre, una al lado de la otra, muestran 5 reglas y 1040 m contra 9 reglas y 289 m, sin texto que lo explique. Que "3 sensores cortos" no choque con 1223 m puede leerse como "ganó"; la columna Superados (0) lo matiza, pero no lo dice.*
  - *¿El mentor puede seguir mostrando intentos seguidos? Sí: el reintento sigue solo a los 5 s sin tocar nada, R reinicia en cualquier momento y la guía apagada oculta el cuaderno (no ocupa lugar). Con el caso a la vista, la marcha no está: Reintentar solo se apaga recién con el intento siguiente.*
  - *¿Se vuelve a "Tu programa" sin perder nada? Sí (sonda `resto.mjs`): el texto vuelve igual, con sus 7 sensores, y maneja.*
  *Propuesto, sin hacer: decidir si la comparación debe decir algo del ejemplo que "no choca porque no pasa a nadie", y si el caso debería dejar a mano Reintentar solo.*
  *No se pudo probar: con el panel del navegador a la vista (estaba oculto, todo fue en Chrome sin ventana); el mouse real, los tooltips al pasar el cursor y los lectores de pantalla.*

  Anotar lo observado separado de lo propuesto, y lo que no se pudo probar.
- [x] 6.4 Anotar en `PENDIENTES.md` que `reglas-el-choque-ensena` está hecho, lo que quedó y lo que no se pudo medir, y que sigue `reglas-como-fichas`. Verificación: `git diff PENDIENTES.md`.

  *Hecho: en `PENDIENTES.md`, "En curso" dice que el cambio está hecho, sin commitear ni archivar, con las medidas, lo que quedó, lo que no se pudo medir y que sigue `reglas-como-fichas`. Verificado con `git diff PENDIENTES.md`.*

## 7. Ajuste de la comparación (revisión del dueño, 18 de noviembre de 2026)

- [x] 7.1 En la comparación, "Superados" pasa a ser la primera columna de cifras y se destaca; la distancia va después, con menos peso. Un programa que termina sin chocar y con 0 superados dice "frena detrás del primero" en el resultado, en los dos idiomas. Ajustar las pruebas de `compareRuns` o de la tabla. Verificación: escenarios "Superados manda" y "Frenar no alcanza"; `npm test`; `mlLab.auditSistema()` y `mlLab.auditTooltips()` sin problemas.

  *Hecho: en la tabla, las columnas quedaron así: programa, superados, sensores, reglas, distancia y resultado. La cifra de superados va en `--text-figure` y en negrita (`td.col-passed`); la distancia, con el peso del cuerpo (`td.col-distance`). La función pura `compareResult(fila)` (`src/tabs/rules/compare.js`) elige el resultado: chocó a los X m; frena detrás del primero (sin chocar y con 0 superados, en gris); no chocó en 2 min; o tiene errores. Textos `rules.compare.brakes` en los dos idiomas: "frena detrás del primero" y "brakes behind the first one". Una prueba nueva en `tests/rules-compare.test.js`; las demás no cambiaron, porque `compareRuns` devuelve las mismas cifras.*
  *Medido: `npm test`, 1402 pruebas, 0 fallas. Con `sondas/auditorias.mjs` (1366×768, el caso, la comparación, "Tu programa" y la repetición a la vista), `auditTooltips()`, `auditSistema()` y `auditHierarchy()` dan 0 problemas en español y en inglés. En inglés la fila dice "3 short sensors · 0 · 3 · 1 · 1223 m · brakes behind the first one".*

- [x] 7.2 Volver a sacar el después de la vista de la comparación y actualizar `comparacion.md`. Verificación: la captura muestra "Superados" primero y "frena detrás del primero" en la fila de 3 sensores cortos.

  *Hecho: se sacó de nuevo `04-comparacion` en los dos tamaños, en una carpeta aparte para no pisar las medidas de las otras vistas. Sus imágenes y medidas se pasaron a `despues/` y se rehicieron `despues/indice.md` y `comparacion.md` (que ahora tiene la tabla de cifras con el orden nuevo y un párrafo sobre el ajuste). Las otras vistas del después no se volvieron a sacar: el ajuste solo cambia la tabla de la comparación, que no se ve en ellas.*
  *Observado (`despues/04-comparacion-1366x768--comparacion.png`): "Superados" es la primera columna de cifras, con 1, 0, 14 y 4 grandes y en negrita; "Recorre" va después, con el peso normal; la fila de 3 sensores cortos dice "frena detrás del primero", en gris y sin ✸. Medidas de la vista: la escena mide 479 px a 1366×768 y 611 a 1440×900; las auditorías de sistema y de jerarquía dan 0 / 0.*


## Workflow follow-up

- Archivar con `/opsx:archive` cuando el dueño revise la comparación del antes y el después.
- Después sigue `reglas-como-fichas`.
