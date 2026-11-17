# Tasks

## 1. Antes, misión en curso y textos

- [x] 1.1 Confirmar que `borradores/tarjeta-de-consigna/antes/` tiene las capturas, `indice.md` y `medidas.md`, y que `capturar.mjs` las reproduce igual dos veces seguidas. Si falta algo, sacarlo antes de tocar código. Verificación: correr el guion con una carpeta temporal y comparar contra `antes/`.
  *Hecho. Medido: `antes/` tiene las 74 capturas, `indice.md` y `medidas.md`. Una corrida nueva del guion sobre el mismo código (carpeta temporal) dio `medidas.json` idéntico y 50 de 74 PNG iguales píxel por píxel (comparado con `borradores/tarjeta-de-consigna/comparar-pixeles.mjs`, nuevo). Los otros 24 difieren en 1 a 75 píxeles de suavizado de letra, salvo los estados con animación: los puntitos de Flujo en Inspeccionar (05, 18), la escena de El problema (14) y la escena de Tu manejo (17, la posición del auto). Observado: 17 a 1366 se ve igual a ojo. No se corrió una tercera vez.*
- [x] 1.2 `src/ui/current-mission.js` con `currentMission(missions, { available })` (D2) y sus pruebas en `tests/current-mission.test.js`. Casos a probar:
  - sin cumplir, devuelve la primera;
  - con la primera cumplida, devuelve la segunda aunque la tercera también esté cumplida;
  - con todas cumplidas, devuelve `allDone`;
  - sin misiones disponibles en el modo, devuelve `null`;
  - lista vacía, devuelve `null`;
  - misma lista, mismo resultado.

  Verificación: `npm test`.
  *Hecho. `src/ui/current-mission.js` y `tests/current-mission.test.js` con los seis casos. Medido: `npm test` pasa.*
- [x] 1.3 Las claves de D3 en `src/i18n/es.js` y `src/i18n/en.js`, incluidas `consigna.drive.plain` y `consigna.drive.circuit.plain`. Topes en `tests/copy-length.test.js`: 90 caracteres para cada consigna, en los dos idiomas. Verificación: `npm test`, con `tests/i18n.test.js` sin claves de un solo idioma.
  *Hecho. 14 claves `consigna.*` en `es.js` y `en.js`, con topes de 90 caracteres en `tests/copy-length.test.js` y una prueba que exige tope a toda consigna nueva. Cambio sobre D3: `consigna.lab.gates` suma "o tocá Reproducir abajo de la red", porque la spec pide que en el Laboratorio la consigna nombre dónde está la marcha en los tres experimentos. Medido: `npm test`, 1321 pruebas sin fallas, paridad de claves incluida. El largo en renglones se mide en 4.3.*

## 2. Componente de la tarjeta

- [x] 2.1 `src/tabs/shared/consigna-card.js` (D1): región con título oculto, consigna y misión con la clase `guide`, y lugar para `run`. `setConsigna` y `setMission` escriben con `createTextSetter`. Si el armado se puede probar sin DOM, con su prueba. Verificación: `npm test`.
  *Hecho. `createConsignaCard({ i18n, run })` arma `<section class="consigna-card" aria-labelledby>` con el título oculto (`consigna.title`), la consigna y la misión con `guide`, y `run` sin `guide`. Suma `writeMissionRow`, que escribe la fila de la lista desde la misma vista que la tarjeta y le pone `data-current`, y `missionState`, sin DOM. Medido: `tests/consigna-card.test.js` (7 pruebas, con un documento mínimo como el de `library-view.test.js`) y `npm test` pasan.*
- [x] 2.2 Estilos de la tarjeta y del texto largo de la guía en `styles/app.css` (D5), y la marca de la misión en curso en la lista (`data-current`: "▸" y negrita). Verificación: el contorno de los controles sobre `--color-surface-2` sigue pasando `tests/control-contrast.test.js`, y en el navegador la marca se ve en escala de grises.
  *Hecho. Tarjeta en `--color-surface-2` con contorno `--color-border`, consigna de 15 px y 600, misión de 13 px; la pista de la barra va en `--color-bg` para que se vea sobre la tarjeta. Textos largos de las seis pestañas a 13 px en `--color-text-muted`. La fila en curso lleva "▸" y negrita. Se quitó la regla `.drive-keys`, que quedó sin uso. Medido: `tests/control-contrast.test.js` pasa (3,51:1 sobre `--color-surface-2`, sin cambios). Observado en el navegador con `filter: grayscale(1)`: la marca y la negrita se distinguen sin color.*

## 3. La tarjeta en cada pestaña

- [x] 3.1 El problema:
  - la tarjeta primera, con `run` adentro;
  - `describeMission` compartida por la lista y la tarjeta;
  - consigna de la calle o del circuito, sin misión en el circuito;
  - se quita el renglón `drive.guide.keys` del `intro`.

  Verificación: escenarios "Consigna por defecto", "Circuito", "Primera misión por defecto", "Pasa a la siguiente", "Progreso al día", "Sin misiones en el modo" y "El problema". Con los atajos apagados, la consigna usa la versión `.plain`.
  *Hecho. Tarjeta primera con `run` adentro, `describeMission` compartida por la fila y la tarjeta, consigna de calle o circuito, sin misión en el circuito, y sin el renglón `drive.guide.keys` (se quitaron sus claves y su tope). Observado en el navegador: "Consigna por defecto", "Circuito" (consigna de la pista y misión oculta), "Primera misión por defecto" (0 de 5) y "El problema" (Pausar en la tarjeta junto a Reiniciar); con los atajos apagados, "Manejá con las flechas sin chocar." y la del circuito sin W A S D. Medido con el guion (escenario 14, tiempo virtual): al cumplir la primera, la tarjeta pasa a "Recorré 500 m sin chocar", 261 de 500 m. "Progreso al día": la tarjeta y la fila salen de la misma vista en el mismo `sync()`; no se fotografió el instante 3 de 5.*
- [x] 3.2 Reglas a mano y Competir: la tarjeta primera, con `run` o `runSection` adentro. Verificación:
  - en Competir, escenario "Competir con el cartel de largada", y `mlLab.auditHierarchy()` con una sola acción principal en cada estado del guion;
  - en Reglas a mano, "Misión en curso" con el progreso de la primera misión.
  *Hecho. Observado en el navegador: en Competir, con el cartel, la única principal es "Largar" del cartel y "Largar (espacio)" de la tarjeta queda secundaria; en la cuenta regresiva, corriendo, en pausa y reanudada, la única principal es la de la tarjeta, y `auditHierarchy()` da 0 problemas en los cinco estados. No se llegó al estado de carrera terminada ("Otra carrera"). Reglas a mano: la tarjeta muestra "Superá 3 vehículos sin chocar", 0 de 3.*
- [x] 3.3 Entrenar: la tarjeta primera en la vista de entrenamiento, con `run` adentro; consigna automática o manual. Verificación: escenarios "Cambia con el modo", "Otras vistas de Entrenar" y "Ventana mediana". **Si a 1366×768 la tarjeta no entra entera sin desplazar, parar y consultar** (Risks).
  *Hecho. Medido: a 1366×768 la tarjeta va de 170 a 434 px y entra entera (264 px de alto; también con la guía apagada, de 170 a 351). Observado: "Cambia con el modo" (Vos → "Elegí al líder…", con "Elegir al líder (E)" como principal; El fitness → vuelve) y "Otras vistas de Entrenar" (en Cerebros no hay tarjeta y la principal es Guardar como nuevo; al volver, la tarjeta está primera). Costo medido: la columna de la vista pasa de 757 a 860 px de contenido (se ven 614 a 1366 y 746 a 1440).*
- [x] 3.4 Inspeccionar y Laboratorio: la tarjeta primera, sin `run`, con la consigna que nombra la barra de abajo de la red; en el Laboratorio, la consigna de cada experimento. Verificación: escenarios "Inspeccionar", "Laboratorio" y "Elegir una neurona".
  *Hecho. Observado: Inspeccionar y el Laboratorio abren con la tarjeta, sin botón; la principal sigue siendo Reproducir/Pausar en la barra de abajo de la red. Las tres consignas del Laboratorio cambian con Compuertas, Puntos y Tu manejo y nombran Reproducir. Al elegir una neurona, la tarjeta sigue primera (146 px) y la cuenta aparece debajo; el texto largo cede su lugar. Decisión: en el Laboratorio la tarjeta también sigue a la vista con una neurona elegida. Costo medido: en Inspeccionar con una neurona elegida a 1366×768, la columna pasa de 654 a 755 px de contenido: la tabla de la neurona pide desplazar 51 px y sus filas 50 px (antes, nada). A 1440×900 no desplaza.*
- [x] 3.5 Comportamiento sin cambios:
  - la marcha hace lo mismo con el mouse y con su atajo, con el mismo texto y el mismo tooltip, en los dos idiomas;
  - `mlLab.auditTooltips()` y `mlLab.auditHierarchy()` sin problemas nuevos;
  - las misiones se cumplen igual. Usar las pruebas de sesión que ya existen; no entrenar redes para comprobarlo.

  Verificación: `npm test` completo y escenario "Mismo comportamiento".
  *Hecho. Medido: `npm test` completo, 1321 pruebas sin fallas (incluidas las de sesión de las misiones). Observado: en El problema, Reglas a mano y Entrenar, la marcha cambia igual con espacio y con el clic, con el mismo texto y la misma `data-help`; en inglés, mismos rótulos traducidos. `auditHierarchy()` y `auditTooltips()` sin problemas en las seis pestañas, en español y en inglés. El atajo de Competir no se probó en el navegador (su código no cambió; lo cubre `tests/compete-shortcuts.test.js`).*

## 4. Guía, accesibilidad, después y cierre

- [x] 4.1 Guía apagada y encendida en las seis pestañas: la consigna y la misión se ocultan, la marcha queda y la misión vuelve al día. Verificación: escenarios "Apagar la guía", "Volver a encender" y "Guía oculta" de *Orden común del panel*.
  *Hecho. Observado en el navegador, en las seis pestañas: con la guía apagada se ocultan la consigna y la misión, y el primer control visible del panel es la marcha de la tarjeta, en el mismo lugar (en Entrenar, "Quién elige al padre", que es parte de la marcha). En Inspeccionar y el Laboratorio la tarjeta entera se oculta, porque no tiene marcha: sin eso quedaba una caja vacía (la tarjeta lleva `guide` cuando no recibe `run`; probado en `tests/consigna-card.test.js`). Al encender, vuelven en el mismo lugar. Medido con el guion (escenario 19 nuevo): con la guía apagada se superaron dos vehículos y, al encenderla, la tarjeta muestra 2 de 5, a 1440 y a 1366.*
- [x] 4.2 Accesibilidad:
  - la región "Qué hacer ahora" con su nombre;
  - el orden de lectura: consigna, marcha y misión;
  - con Tab, el primer control del panel es la marcha en El problema;
  - la misión sin anuncios en cada paso.

  Verificación: el árbol de accesibilidad del navegador (`read_page`), escenarios "Lector de pantalla" y "Con el teclado". Sin lector de pantalla real: anotarlo.
  *Hecho. Observado con `read_page` en El problema: una región con el título "Qué hacer ahora" (el `aria-labelledby` apunta a ese título; la herramienta no muestra el nombre calculado de ninguna región), después la consigna, la marcha (Pausar, Reiniciar, Tráfico nuevo) y la misión. El primer control con foco del panel es "Pausar (espacio)", adentro de la tarjeta. La tarjeta no tiene `aria-live`, `role=status` ni `role=alert`. Sin lector de pantalla real.*
- [x] 4.3 Medir que cada consigna entra en dos renglones con el panel de 360 px, en español y en inglés (escenario "Largo"), y ajustar el texto si no entra. Verificación: tabla de medidas en la comparación.
  *Hecho. Medido en el navegador, con el panel de 360 px (302 px de texto): las 13 consignas, en español y en inglés, tienen hasta 81 caracteres y uno o dos renglones. No hubo que ajustar ninguna. La tabla está en `comparacion.md`.*
- [x] 4.4 Correr `capturar.mjs despues`, repetir las medidas de `antes/medidas.md` y armar `borradores/tarjeta-de-consigna/comparacion.md`: el antes y el después lado a lado, la tabla de medidas de los dos y una línea de qué cambió. Anotar los estados que no salieron iguales.
  *Hecho. `capturar.mjs despues`: 78 capturas, sin avisos. Medido: la tarjeta entra entera en los 32 estados que la muestran; la misión en curso pasa de 468–757 px (cortada en Entrenar a 1366) a 144–170 px. Costos medidos: Inspeccionar con neurona a 1366 (la tabla de la neurona pide 51 px), Reglas a mano y Competir a 1366 (75 px al final) y Entrenar (757 → 860 px). Todo está en `borradores/tarjeta-de-consigna/comparacion.md`, con los estados que varían entre corridas. El guion modificado no se volvió a correr sobre `945a848`.*
- [x] 4.5 Verificación manual en el navegador contra el filtro de entrada, en las seis pestañas, a 1440×900 y 1366×768, con la guía encendida y apagada:
  - ¿se entiende qué hacer leyendo solo la tarjeta?;
  - ¿el mentor la oculta con la guía?;
  - ¿algo se rompe si se usa mal?

  Anotar lo observado separado de lo propuesto.
  *Hecho como revisión del implementador, no con personas. Observado, en las seis pestañas, a 1440×900 y 1366×768, con la guía encendida y apagada (capturas del guion y navegador): la tarjeta dice qué hacer y tiene el botón al lado, salvo en Inspeccionar y el Laboratorio, donde nombra Reproducir. La guía la oculta y la marcha queda. Usarla mal (cambiar de modo, de circuito, de idioma, atajos, guía y vistas de Entrenar varias veces) no dio errores en la consola. Propuesto, sin probar: si la tabla de la neurona en Inspeccionar a 1366 se queda corta, achicar la tarjeta al elegir. Lo decide el dueño.*
- [x] 4.6 Anotar en `PENDIENTES.md`:
  - lo que quedó: la misión leída dos veces por un lector de pantalla, la consigna que repite el texto largo y lo que no se pudo medir;
  - que `tarjeta-de-consigna` está hecho.

  Verificación: `git diff PENDIENTES.md`.
  *Hecho. En *Hecho*, la tarjeta implementada y pendiente de revisión y archivo. En *Prioridad 1*, el candidato tachado. En *Ayudas, guía y accesibilidad*, lo que quedó: la misión leída dos veces, la consigna que repite el texto largo, los costos de alto medidos y lo que no se pudo medir.*

## 5. Tarjeta compacta al elegir en Inspeccionar

Decisión del dueño (17 de noviembre de 2026), después de ver el costo medido en 3.4.

- [x] 5.1 En Inspeccionar, con una neurona o una conexión elegida, la tarjeta muestra solo la consigna, sin la misión en curso (requisito "Tarjeta al elegir en Inspeccionar"). Al soltar la elección, la misión vuelve, al día. En el Laboratorio se aplica la misma regla si comparte el armado. Verificación: escenarios "Elegir una neurona" y "Soltar la elección".
  *Hecho. Inspeccionar y el Laboratorio pasan `null` a `setMission` mientras hay algo elegido; al soltar, el `sync()` siguiente escribe la misión desde la lista al día. Medido con el guion (escenarios 18, 20 y 21): con una neurona elegida la tarjeta mide 67 px (146–213) en lugar de 93, sin misión; al soltar vuelve a 93 px con "Seguí la cuenta de una neurona · Pendiente". En el Laboratorio la lista de misiones ya se oculta al elegir, así que mientras hay algo elegido la misión no se ve en ningún lado: queda para que lo decida el dueño. No probado en el navegador ni con una conexión elegida.*
- [x] 5.2 Medir a 1366×768, con el guion, una neurona de la capa de salida y la neurona de la captura 18: la tabla de la neurona se ve entera, sin desplazar el panel ni `.inspect-rows-scroll` (escenario "La cuenta entra a 1366×768"). **Si con la tarjeta compacta todavía desplaza, parar y consultar**, con la medida de cuánto falta. Verificación: la medida, anotada en la nota de la tarea.
  *Parado: todavía desplaza. Medido con el guion a 1366×768: con la neurona de la captura 18, la columna esconde 75 px (la tarjeta de la neurona 25 px y `.inspect-rows-scroll` 50 px); con una neurona de la capa de salida, 78 px (28 y 50). La tarjeta de la neurona va de 289 a 677 px, y debajo quedan las misiones. Compactar la tarjeta de consigna ganó 26 px. A 1440×900 no desplaza. Falta decidir cómo ganar unos 78 px.* *Cerrada con la 5.4: con la tarjeta oculta al elegir, medido con el guion a 1366×768 (escenarios 18 y 20), la tabla de la neurona va de 206 a 677 px y ni el panel, ni `.inspect-card`, ni `.inspect-rows-scroll` desplazan (0 px escondidos). Igual a 1440×900. Arriba de la tabla queda el bloque del cerebro, como antes del cambio.*
- [ ] 5.4 Segunda decisión del dueño, después de 5.2: en Inspeccionar y en el Laboratorio, con algo elegido, la tarjeta entera cede su lugar y vuelve al soltar. Reemplaza la tarjeta compacta de 5.1. En el Laboratorio está bien que, mientras haya algo elegido, la misión no se vea en ningún lado. Verificación: escenarios "Elegir una neurona", "Soltar la elección" y "Laboratorio" del requisito "Tarjeta al elegir en Inspeccionar y en el Laboratorio"; y repetir la medida de 5.2. **Si todavía desplaza, parar y consultar** con cuánto falta.
  *Hecho. Inspeccionar y el Laboratorio ocultan la tarjeta (`show(consigna.node, !state.selected)` en `sync()`) y `setMission` vuelve a recibir siempre la misión en curso, así que al soltar aparece al día; se quitó la compacta de la 5.1. Se sumó `.consigna-card[hidden] { display: none; }`, porque `display: grid` le ganaba a `hidden`. Medido con el guion: escenarios 18 y 20, tarjeta oculta y sin desplazamientos; 21 (Inspeccionar), con la elegida la tarjeta no se ve y la lista sí, al soltar vuelve la tarjeta (146–239) con "Seguí la cuenta de una neurona · Pendiente"; 22 (Laboratorio), con la elegida no se ven ni la tarjeta ni la lista, al soltar vuelven las dos, con "Resolvé AND a mano · Pendiente". No probado: con una conexión elegida (el código mira `state.selected`, que también está puesto con una conexión) ni en el navegador integrado.*
- [x] 5.3 Volver a sacar las capturas del después que cambian (Inspeccionar con una neurona elegida, a los dos tamaños) y actualizar `comparacion.md` y el costo anotado en `PENDIENTES.md`. Verificación: `npm test`, `mlLab.auditHierarchy()` sin avisos, y `git diff PENDIENTES.md`.
  *Hecho. Capturas 18 vueltas a sacar y 20–22 nuevas en `despues/` (los dos tamaños); `medidas.json` y `tabla.md` al día; `comparacion.md` con las filas 18 y 20–22, el costo de Inspeccionar marcado como resuelto y los escenarios nuevos. En `PENDIENTES.md`, el costo de Inspeccionar resuelto y la decisión del dueño. `npm test`: 1321 pasan. `mlLab.auditHierarchy()` y `auditTooltips()` corridos con el guion con una neurona elegida (Inspeccionar a los dos tamaños, salida incluida, y Laboratorio): sin avisos, una acción principal. El estado al soltar es el mismo que la captura 05, auditado en el grupo 4.*

## Workflow follow-up

- Archivar con `/opsx:archive` cuando el dueño revise la comparación del antes y el después.
- El candidato que sigue es `misiones-que-muestran-el-control`, que usa la misión en curso de la tarjeta. Después vienen las tres propuestas del recorrido guiado.
