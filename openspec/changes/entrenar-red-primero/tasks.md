# Tasks

## 1. Antes

- [x] 1.1 Copiar `borradores/sistema-de-diseno/capturar.mjs` a `borradores/entrenar-red-primero/capturar.mjs` con las vistas y medidas de D3 (desborde del panel y del tablero, posición de las dos tarjetas, alto del lienzo de la red y de la curva). Las medidas van en `medidas-<tamaño>.json`. Verificación: dos corridas seguidas sobre el mismo código dan las mismas medidas.

  *Hecho: `borradores/entrenar-red-primero/capturar.mjs`, copia del guion de `sistema-de-diseno` sin los recortes, con cada vista atada a su tamaño y una función `MEDIR` que guarda, por vista, el desborde de `.view-panes` (el panel) y de `.board` (vertical y horizontal), las dos tarjetas en orden de DOM con su y, el alto y la y del lienzo de la red (`canvas`) y de la curva (`svg`), el renglón de misiones, cuánto de lo que pide la spec queda a la vista y las tres auditorías. Salen `medidas-1440x900.json` y `medidas-1366x768.json`; `resumen.mjs` las pasa a tabla. "Tras la primera generación" se logra con Siguiente generación, que es determinista y no espera los 20 s de 1×. Además de las seis de D3 hay vistas para 2.1 (curva plegada), 3.2 (tooltip, con el mouse del protocolo), 3.3 y 3.4.*

  *Medido: dos corridas seguidas sobre el código sin tocar dieron `medidas-*.json` idénticos byte a byte. 8 de las 22 imágenes difieren en píxeles (las que hacen una generación, pliegan la red, y 01 a 1366); no lo investigué, porque la verificación pedía las medidas.*

- [x] 1.2 Sacar el antes en `borradores/entrenar-red-primero/antes/`, sobre el commit de partida, con su `indice.md` (vista, tamaño, commit y medidas). Verificación: el índice lista las seis vistas de D3, y la medida del panel a 1440×900 da un desborde de unos 126 px (865 en 739, medido en la crítica). Si da otra cosa, anotarla.

  *Hecho: `borradores/entrenar-red-primero/antes/` con `indice.md` (vista, tamaño, commit `c946255`, medidas). La primera corrida fue sobre el checkout sin tocar `src/` ni `styles/`; la final, con el guion definitivo, sobre una copia de `HEAD` hecha con `git archive` (`--raiz`), y dio las mismas medidas en las vistas comunes.*

  *Medido: a 1440×900 el panel desborda **126 px (865 en 739)** al abrir, en español y en inglés, tras una generación y después de guardar: coincide con la crítica. La curva es la primera tarjeta (y 234) y la red la segunda (y 547); los dos lienzos entran enteros (red 214 px, curva 185 px). A 1366×768 el panel desborda 258 px y el tablero 8 px al abrir (25 tras una generación); la red mide 120 px.*

  *Diferencia con la crítica: ella anotó que el tablero desborda 44 px a 1366×768 (691 en 647); acá dio 8 y 25. No sé en qué estado se midió aquel 44.*

  *Medido: `auditSistema()` da 1 problema después de guardar, en los dos idiomas: «compact Renombrar 24px» (el botón Renombrar del resultado de guardar). Ya estaba antes de este cambio.*

## 2. La red primero

- [x] 2.1 En `src/tabs/train/index.js`, armar el tablero con la red antes que la curva, sin cambiar los `--grow` (D1). Verificación: escenarios "La red primero", "Plegar el diagrama", "Plegar la curva" y "Volver a desplegar" en el navegador, a 1440×900; escenario "Red y curva a la vez" con las medidas del guion.

  *Hecho: el orden sale de `boardOrder()` en `src/tabs/train/layout.js` (indicadores, última generación, red, curva) y `index.js` hace `board.append(...boardOrder(...))`. Los `--grow` siguen en 1,3 la red y 1 la curva. No hizo falta CSS.*

  *Medido (guion, 1440×900): la red va de y 234 a 572 y la curva de 588 a 884; el lienzo de la red mide 214 px (y 271–485) y el de la curva, tras una generación, 185 px (y 625–810), ninguno cortado ("Red y curva a la vez"). Con la red plegada, la curva sube a y 284 ("Plegar el diagrama"). Con la curva plegada, la tarjeta de la red va de 234 a 834 y su lienzo pasa de 214 a 477 px ("Plegar la curva"; el antes daba también 477).*

  *Observado en el navegador de la app (1440×900, DOM): plegar y volver a desplegar la red la deja otra vez primera, de y 234 a 572 ("Volver a desplegar"). El panel del navegador estaba oculto, sin requestAnimationFrame: el alto del lienzo ahí no cambia, por eso los altos se midieron con el guion.*

- [x] 2.2 Prueba del orden: una prueba que arme la pestaña (o la función que ordena el tablero, si se separa) y compruebe que la tarjeta `train-network` va antes que `train-chart`. Verificación: `npm test`.

  *Hecho: `tests/train-layout.test.js`: `boardOrder` pone `train-network` antes que `train-chart`, después de indicadores y última generación; y `index.js` arma el tablero con `boardOrder` (lectura del fuente). También que `showMissions` viene en falso y la cuenta del renglón (0 de 4, 1 de 4 tras guardar). En `tests/train-settings.test.js` se suma `showMissions` a los valores por defecto y al grupo "al instante".*

  *Medido: `npm test`, 1428 pruebas, 0 fallas.*

- [x] 2.3 Medir con el guion a 1366×768 el alto de los dos lienzos y cuál queda cortado, y anotarlo en esta tarea (sin arreglarlo: es de `entrenar-mesa-de-trabajo`). Verificación: las medidas anotadas.

  *Medido (guion, 1366×768, sin arreglar: es de `entrenar-mesa-de-trabajo`): los dos lienzos miden 120 px. Al abrir, la red va de y 287 a 407 (tarjeta 250–510) y la curva muestra su estado vacío (tarjeta 526–760). Tras una generación, el lienzo de la curva va de y 563 a 683 y su tarjeta termina en y 777: lo que queda cortado son 9 px de la curva, su nota de abajo, no el lienzo. El tablero desborda 8 px al abrir y 25 tras una generación, igual que antes. Antes, lo cortado era la nota de la red, por los mismos 9 px.*

## 3. Las misiones plegadas

- [x] 3.1 Renglón plegable "Todas las misiones · N de 4" al final de la vista de entrenamiento, con la lista adentro, plegado por defecto, con el patrón de "Más sobre esta pestaña" y el estado en `state.settings.showMissions` (D2). La cuenta se actualiza con la lista plegada. La guía lo oculta junto con las misiones. Verificación: escenarios "Estado por defecto", "Desplegar la lista", "Volver a plegar", "Lista recordada" y "Cuenta al día con la lista plegada" de *Misiones*, y "La lista plegada de Entrenar" de *Misión en curso*, en el navegador.

  *Hecho: en `index.js`, la sección de misiones pasa a ser un `details` con las clases de "Más sobre esta pestaña" (`guide guide-more`) más `train-missions`; el `summary` lleva el rótulo con la cuenta (`missionsSummary()` de `layout.js`, que se escribe en cada actualización aunque esté plegada) y `aria-expanded` al día. Al abrir o cerrar se guarda `showMissions` en los ajustes (grupo "al instante", por defecto falso, en `settings.js`), como `showChart` y `showNetwork`; no entra en `trainingConfig`. La lista adentro es la misma, con la marca de la misión en curso en negrita.*

  *Observado en el navegador de la app (DOM, 1440×900, perfil vacío): arranca plegado con «Todas las misiones · 0 de 4» ("Estado por defecto"); al tocarlo se ven las cuatro con su progreso, la primera con `data-current="true"` ("Desplegar la lista"); se repliega y sigue diciendo 0 de 4 ("Volver a plegar"); desplegada, ir a Inspeccionar y volver la deja desplegada ("Lista recordada"). Con cuatro Siguiente generación hasta la 5 con la lista plegada, la tarjeta pasa a «Un auto que supere 5 vehículos · 0 de 5» y el renglón a «1 de 4», sin desplegarse ("La lista plegada de Entrenar"). Con la guía apagada el renglón queda en `display: none`.*

  *Medido (guion): después de guardar con la lista plegada, el renglón dice «Todas las misiones · 1 de 4» y «All missions · 1 of 4», plegado ("Cuenta al día con la lista plegada").*

- [x] 3.2 Textos y tooltip del renglón en español y en inglés (`src/i18n/es.js` y `en.js`): el rótulo con la cuenta y el tooltip "qué hace / por qué importa". El anuncio de lectores de pantalla dice si está abierto (`aria-expanded`) y la cuenta. Verificación: la prueba de i18n (claves en los dos idiomas), `mlLab.auditTooltips()` sin problemas y el escenario "Tooltip del renglón".

  *Hecho: `train.missions.summary` («Todas las misiones · {done} de {total}» / «All missions · {done} of {total}») y `help.train.missions.toggle.what/why` en `es.js` y `en.js`. Saqué `train.missions.title`, que ya no se usaba. El lector de pantalla recibe el estado del `details`/`summary` nativo y el `aria-expanded` explícito, y el nombre es el rótulo con la cuenta.*

  *Medido: `npm test` (incluye la prueba de i18n) pasa; `auditTooltips()` da 0 en todas las vistas del guion, en los dos idiomas. Con el mouse del protocolo sobre el renglón aparece el tooltip con «Qué hace» y «Por qué importa» en español y en inglés (`despues/tooltips.json`, capturas 11 y 12) ("Tooltip del renglón").*

  *No probado: el anuncio real con un lector de pantalla.*

- [x] 3.3 Medir con el guion la vista de entrenamiento a 1440×900: al abrir, en español y en inglés, y después de guardar un cerebro, en español y en inglés. Verificación: los escenarios "Pantalla de 1440×900" y "Después de guardar" de *Panel a la vista sin desplazarse* (desborde 0, vertical y horizontal) y "Misiones de un renglón" con la lista desplegada. **Si en alguno de los cuatro casos el panel se sigue desplazando, parar y consultar**, con las medidas.

  *Medido (guion, 1440×900, panel de 360 px): el panel desborda **0 px vertical y 0 horizontal** (739 en 739) en los cuatro casos: al abrir en español y en inglés, y después de guardar en español y en inglés. No hubo que parar. El margen es exacto: 0 px de sobra; el renglón de misiones va de y 845 a 877. Con la lista desplegada el panel vuelve a desplazarse 131 px (870 en 739), y cada misión se lee en un solo renglón en los dos idiomas ("Misiones de un renglón").*

- [x] 3.4 Con selección manual a 1366×768, comprobar el escenario "Selección manual a la vista". Verificación: la medida anotada.

  *Medido (guion, 1366×768, selección manual, guía activa): quién elige al padre termina en y 300, pausar y siguiente en 387, elegir al líder y deshacer en 439, y la línea de estado del padre en 482; el borde de abajo del panel está en 768. Todo a la vista sin desplazar. El panel desborda 252 px (antes 384); Guardar y el renglón de misiones quedan abajo, lo que la spec permite a ese tamaño.*

## 4. Cierre

- [x] 4.1 `npm test` completo, y `mlLab.auditSistema()`, `auditHierarchy()` y `auditTooltips()` en 0 en las vistas de D3, en los dos idiomas. Verificación: los resultados anotados en esta tarea.

  *Medido: `npm test`, 1428 pruebas, 0 fallas. En las 14 vistas del guion (es y en): `auditTooltips()` 0 y `auditHierarchy()` 0 en todas; `auditSistema()` 0 en todas salvo las dos de después de guardar, con 1: «compact Renombrar 24px» / «compact Rename 24px», el botón Renombrar del resultado de guardar. Ya daba 1 en el antes y este cambio no toca ese botón; no lo arreglé para no salir del alcance. Queda para quien decida.*

- [x] 4.2 El después con el mismo guion en `borradores/entrenar-red-primero/despues/`, y `comparacion.md` con el antes y el después lado a lado y las medidas. Verificación: la comparación muestra la red arriba, el renglón de misiones y el panel sin desplazamiento.

  *Hecho: `borradores/entrenar-red-primero/despues/` con el mismo guion y `comparacion.md` con la tabla de medidas clave, todas las vistas en una línea y las capturas lado a lado. Muestra la red arriba (y 234), el renglón «Todas las misiones · 0 de 4» al final del panel y el panel en 0 px de desborde a 1440×900.*

- [x] 4.3 Verificación en el navegador contra el filtro de entrada: la red se mueve desde el primer segundo, arriba; la misión en curso sigue en la tarjeta; el mentor puede plegar las dos tarjetas y ocultar las misiones con la guía; plegar y desplegar no cambia el entrenamiento. Anotar lo que no se pudo probar (lector de pantalla, Firefox, ventana visible).

  *Medido (guion): la red es la primera tarjeta desde la primera captura (2 s de tiempo virtual), con su lienzo de 214 px a la vista; la misión en curso sigue en la tarjeta de consigna. Observado en el navegador: las dos tarjetas se pliegan y despliegan; la guía apagada oculta el renglón de misiones.*

  *Por código y prueba, no medido con el entrenamiento en marcha: plegar las tarjetas o las misiones solo cambia `showChart`, `showNetwork` o `showMissions`, que no entran en `trainingConfig` (la prueba de valores por defecto compara `trainingConfig(DEFAULT_SETTINGS)` con la configuración por defecto). En el navegador, plegar y desplegar no cambió la generación, pero el panel estaba oculto y la simulación no avanzaba, así que eso no prueba nada.*

  *No probado: lector de pantalla, Firefox, una ventana visible (todo fue Chrome sin ventana o el panel oculto del navegador de la app), y el teclado sobre el renglón (es un `summary` nativo, igual que "Más sobre esta pestaña").*

## Workflow follow-up

- Archivar con `/opsx:archive` cuando el dueño revise `comparacion.md`.
- Sigue `entrenar-mesa-de-trabajo`.
