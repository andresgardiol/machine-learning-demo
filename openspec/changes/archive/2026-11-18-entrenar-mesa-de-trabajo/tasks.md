# Tasks

## 1. Antes

- [x] 1.1 Copiar `borradores/entrenar-red-primero/capturar.mjs` a `borradores/entrenar-mesa-de-trabajo/capturar.mjs` y sumarle las vistas y medidas de D6: vista de ajustes, vista de cerebros, selección manual a los dos tamaños; alto de la escena y de la barra de marcha, desplazamiento de la zona del escenario, dónde está la marcha en cada vista y cuántas acciones principales se ven. Verificación: dos corridas seguidas sobre el mismo código dan las mismas medidas.

  *Hecho: `borradores/entrenar-mesa-de-trabajo/capturar.mjs`, copia del guion de `entrenar-red-primero` con tres vistas más (13 ajustes y 14 cerebros a 1440×900, 09 selección manual a 1440×900) y estas medidas por vista: el alto del lienzo de la escena, el alto de `.train-runbar`, dónde está `.train-run` (escena, panel o no visible) y si Pausar queda dentro de la ventana, el desborde de la zona del escenario, las acciones principales visibles (`auditHierarchy().filled`), el bloque básico (título, si tiene la función de fitness y si está a la vista en el panel), la tarjeta de consigna a la vista y en qué vista está la función de fitness. `resumen2.mjs` las pasa a tabla.*

  *Medido: dos corridas seguidas sobre `7ba3dd5` sin tocar dieron `medidas-*.json` idénticos byte a byte.*
- [x] 1.2 Sacar el antes en `borradores/entrenar-mesa-de-trabajo/antes/` sobre el commit de partida, con su `indice.md`. Verificación: el índice lista todas las vistas, y en las vistas de ajustes y de cerebros la marcha figura como no visible.

  *Hecho: `borradores/entrenar-mesa-de-trabajo/antes/` con `indice.md`, sobre `7ba3dd5` sin tocar `src/` ni `styles/`.*

  *Medido: en las vistas de ajustes (13) y de cerebros (14) la marcha figura **no visible**; en ajustes no hay ninguna acción principal a la vista y en cerebros la única es «Guardar como nuevo». La escena mide 779 px a 1440×900 y 647 a 1366×768. La marcha está en el panel (y 241–436, 195 px; 321 px con la selección manual). La función de fitness está en la vista de ajustes.*

## 2. La barra de marcha debajo de la escena

- [x] 2.1 El escenario de Entrenar pasa a ser una columna (`.train-stage-zone`) con la escena (`flex: 1`) y la barra (`.train-runbar`), siguiendo el patrón de `.rules-stage-zone` (D2). En la barra se monta el mismo nodo `run`, sin cambiar su orden interno. Verificación: escenarios "Estado por defecto", "Marcha en otra vista" y "Con selección manual" de *Controles de marcha agrupados*, y "Primero en el panel" de *Quién elige al padre*, en el navegador.

  *Hecho: en `index.js`, el escenario se arma como `.train-stage-zone` (flex en columna) con `.train-scene` (la escena, `flex: 1`) y `.train-runbar` debajo; `createStageView` dibuja en `.train-scene`. En la barra se monta el mismo nodo `run`, sin tocar su orden. Estilos en `styles/app.css`, junto a los de la marcha de Entrenar.*

  *Observado en el navegador de la app (DOM, 1440×900): la barra empieza justo donde termina la escena; adentro, de arriba abajo, quién elige al padre (y 716), Pausar y Siguiente en el mismo renglón (752), las cinco velocidades en un renglón (800), Reiniciar y Población nueva (836) y los interruptores (872); con la selección automática no se ven Elegir, Deshacer ni el estado del padre ("Estado por defecto"). En las vistas de ajustes y de cerebros, Pausar sigue dentro de la ventana, pausa y reanuda, y Siguiente pasa de generación (1→2 y 2→3); vuelta a la de entrenamiento, 3→4 ("Marcha en otra vista"). Con "Vos": quién elige (y 601), Pausar (665), Elegir y Deshacer en un renglón (713), el estado del padre (757) y las velocidades (800) ("Con selección manual"). Con la guía apagada, el primer control de la barra es quién elige al padre y no hay ninguno en el panel ("Primero en el panel").*

- [x] 2.2 `viewSwitches` (Sensores y Ver como la máquina) va al último renglón de la barra, con la altura compacta. Verificación: los dos interruptores andan con el mouse y el teclado; `mlLab.auditTooltips()` y `auditSistema()` sin problemas nuevos; escenarios de *Ver como la máquina* y *Sensores del líder*.

  *Hecho: `viewSwitches` va en `.train-runbar-switches`, el último renglón de la barra, con la altura compacta (24 px) y el texto de rótulo, como en Reglas a mano. `.train-runbar-switches` se suma a `DENSE_SELECTOR` en `src/ui/audit.js` (la sesión de diseño lo agregó a "Dos alturas" de `jerarquia-visual`).*

  *Observado en el navegador: con el mouse, Sensores pasa de encendido a apagado y Ver como la máquina de apagado a encendido, con su cartel sobre la escena ("Ver como la máquina", "Sensores del líder"). Con el teclado real (protocolo del navegador): Enter con el foco en Sensores lo apaga; Espacio con el foco en Ver como la máquina lo enciende y no pausa. Alto medido: 24 px.*

  *Medido (guion): `auditTooltips()` y `auditSistema()` sin problemas nuevos en las 22 vistas (el único es el «Renombrar 24px» de después de guardar, que ya estaba).*

- [x] 2.3 La tarjeta de consigna de Entrenar se arma sin `run` y queda con la consigna, la misión en curso y "Mostrame". Con la guía apagada se oculta entera, como en Inspeccionar. Verificación: escenarios "Entrenar" de *Acción principal en la tarjeta* y "Otras vistas de Entrenar" de *Tarjeta al principio del panel*.

  *Hecho: `createConsignaCard({ i18n, onReveal })`, sin `run`. Sin marcha, la tarjeta es de la guía entera (clase `guide`), como en Inspeccionar.*

  *Observado en el navegador: la tarjeta tiene la consigna y la misión en curso y no tiene marcha; "Pausar (espacio)" es la única acción principal, en la barra ("Entrenar" de Acción principal en la tarjeta). Con la guía apagada la tarjeta no se ve. En la vista de cerebros la tarjeta no se ve y la única principal es Pausar; al volver, la tarjeta está primera en el panel ("Otras vistas de Entrenar").*

- [x] 2.4 Medir con el guion la escena y la barra a 1366×768 y a 1440×900, con la selección automática y con la manual. Si la escena queda por debajo de 360 px a 1366×768, compactar la barra como dice D2 y volver a medir. **Si aun así queda por debajo de 360 px, o la zona del escenario se desplaza, parar y consultar**, con las medidas. Verificación: escenarios "Pantalla de 1366×768" y "Selección manual a la vista" de *Panel a la vista sin desplazarse*.

  *Decisión de la sesión de diseño: espacios de la barra de 4 px; la escena tiene que medir 360 px o más en todo estado estable (automática y manual sin aviso) y 340 o más mientras se ve el aviso de cambio pendiente de quién elige al padre (escenario nuevo "Aviso del cambio de selección"). Los interruptores de la barra van en "Dos alturas" de `jerarquia-visual`. Volver a medir los cuatro casos y seguir; si alguno no llega, parar otra vez.*

  *Parada (18 de noviembre de 2026), consultada a la sesión de diseño. Medido con el guion, con la barra sin compactar: a 1366×768 con la selección manual (y el aviso «Rige desde la próxima generación»), la escena mide **307 px** y la barra 340; con la selección automática, 434 y 213. A 1440×900: 566 y 213 (automática), 439 y 340 (manual). La zona del escenario no se desplaza en ningún caso. Las dos compactaciones de D2 no entran en el ancho útil de la barra (384 px): Pausar, Siguiente y las velocidades suman 142 + 119 + 215 + 16 = 492 px, y Reiniciar, Población nueva y los dos interruptores 89 + 139 + 96 + 162 + 24 = 510. Medido en el navegador con CSS de prueba, sin tocar el código: sin el aviso, la escena da 339; con los espacios de la barra a 4 px, 343; con las dos cosas, 371.*

  *Hecho tras la decisión: espacios de 4 px dentro de la barra (`gap` y relleno de arriba y abajo). El aviso queda junto a su ajuste. El guion suma la vista 15, selección manual sin el aviso (se elige "Vos" y se pasa de generación).*

  *Medido (guion), escena y barra: a **1366×768**, selección automática **458** y 189; manual sin aviso **390** y 257; manual con el aviso **343** y 304. A 1440×900, 590 y 189; 522 y 257; 475 y 304. Los tres casos llegan a su piso (360, 360 y 340). La zona del escenario no se desplaza en ninguna vista. Con la selección manual, todo lo que pide "Selección manual a la vista" está en la barra, debajo de la escena (y 464 a 768 a 1366×768).*

- [x] 2.5 Orden del foco: escena, barra de marcha, tablero y panel. Atajos: barra espaciadora, N, T, y E y Z con selección manual. Verificación: recorrido con Tab y los atajos con el foco en el escenario y en el panel, anotados; escenario "Mismos atajos".

  *Observado en el navegador: el orden de los elementos que reciben el foco con Tab, por zona, es barra de arriba, barra de escenario, escena (Paisaje, acercar, alejar, Seguir al auto), barra de marcha, divisor, tablero, divisor y panel. No es un recorrido real con Tab: es el orden del DOM de los elementos con `tabIndex ≥ 0` visibles. Atajos con eventos de teclado sobre el panel y sobre la escena: la barra espaciadora pausa y reanuda, N pasa de generación, T pasa de 1× a Máx. y vuelve; con selección manual, E elige al líder y Z deshace, en los dos lugares ("Mismos atajos"). En el primer intento desde el panel, E no hizo nada: la selección manual se había elegido en la misma generación y todavía no regía. Al repetirlo ya vigente, funcionó.*

  *No probado: un recorrido real con Tab y el foco visible; el lector de pantalla.*

## 3. "Probá esto"

- [x] 3.1 El bloque `basic` se titula "Probá esto" y lleva primero `choices.fitness.row`, que sale del bloque de evolución de la vista de ajustes (D3). La función de fitness usa `basicPending` para su aviso, y la marca de la pestaña Ajustes deja de contarla. Verificación: escenarios "Estado por defecto" de *Configuración básica* y de *Funciones de fitness a elegir*, "Abrir un grupo" y "A un clic" de *Avanzado por grupos*, y "Cambio hecho y vista cambiada" de *Cambios pendientes a la vista*, cambiando la función de fitness y después la élite.

  *Hecho: `basic` lleva el título `train.basic.title` con su ayuda (encabezado con `help` y `tabindex`, el patrón de Inspeccionar y el Laboratorio) y, en orden, `choices.fitness.row`, población, fuerza de mutación y Enfriar la mutación. La función de fitness sale del bloque de evolución. En `settings.js`, `settingsWaiting` deja de contar `fitness`; en `index.js`, el aviso de "Probá esto" se ve con cualquier cambio de la configuración o con la función de fitness.*

  *Observado en el navegador (1440×900): "Probá esto" muestra la función de fitness con Ventaja, 400 autos, la fuerza y el enfriamiento encendido ("Estado por defecto" de *Configuración básica* y de *Funciones de fitness*). El bloque de evolución tiene la élite, la selección, la probabilidad de mutación, el cruce, la duración máxima, eliminar a los lentos y el tráfico, sin la función de fitness ("Abrir un grupo"). Con Distancia aparece el aviso en "Probá esto" y la pestaña Ajustes no se marca; con la élite en 5 se marca («Ajustes, cambios esperando a la próxima generación») ("Cambio hecho y vista cambiada"). Restablecer ajustes vuelve a Ventaja. "A un clic": la pestaña Ajustes muestra la red arriba sin desplazar (captura 13).*

- [x] 3.2 Textos: `train.basic.title` ("Probá esto" / "Try this") y la ayuda del bloque ("qué hace / por qué importa") en `es.js` y `en.js`. Las cuatro funciones siguen enteras con el panel de 360 px. Verificación: la prueba de i18n, la de largo de textos y `mlLab.auditTooltips()`; escenario "Cuatro opciones a la vista".

  *Hecho: «Probá esto» / «Try this» y `help.train.basic.what/why` en los dos idiomas, y `train.runbar.label` para el grupo de la barra. La prueba de textos (`copy-length`) pasa al título nuevo.*

  *Medido: `npm test` (i18n y largo de textos) pasa; `auditTooltips()` da 0 en las 22 vistas del guion, en los dos idiomas. Observado: las cuatro funciones se leen enteras en el panel de 360 px, sin desborde ("Cuatro opciones a la vista"). En inglés se ve en las capturas 04, 05, 08 y 12.*

- [x] 3.3 Prueba: que la función de fitness esté en la vista de entrenamiento y no en la de ajustes (en la función que arma los bloques, si se separa, o en la prueba de disposición de `tests/train-layout.test.js`). Verificación: `npm test`.

  *Hecho: dos pruebas en `tests/train-layout.test.js`, leyendo `index.js`: "Probá esto" lleva la función de fitness antes que la población, la fuerza y el enfriamiento, y la vista de ajustes no la tiene; y la barra lleva `run` y después los interruptores, montada en la zona del escenario, no en la vista de entrenamiento ni en la tarjeta. Se ajustaron `panel-views` (la marca no cuenta la función de fitness), `mission-targets` (sin vista) y `rules-workbench` (16 barras densas).*

  *Medido: `npm test`, 1430 pruebas, 0 fallas.*

## 4. Acción principal y "Mostrame"

- [x] 4.1 `syncMainAction`: en la vista de cerebros, "Guardar como nuevo" queda secundaria y la marcha sigue siendo la principal (D4). Prueba de la regla, si está separada del DOM. Verificación: escenarios "Vista de cerebros" de *Guardar no compite con la marcha* y "Entrenar con selección manual"; `mlLab.auditHierarchy()` con una sola acción principal en las tres vistas.

  *Hecho: `mainAction('train', …)` ya no mira la vista: es la marcha, o Elegir al líder con la selección manual sin padre, en las tres vistas. La prueba de `main-action.test.js` lo comprueba en las tres vistas y que nunca sea «Guardar como nuevo».*

  *Medido (guion): una sola acción principal en todas las vistas; en ajustes y en cerebros, Pausar (antes, ninguna y «Guardar como nuevo»); con la selección manual sin padre, «Elegir al líder (E)». `auditHierarchy()` 0 problemas.*

- [x] 4.2 "Mostrame" de "Probá otra función de fitness" marca el selector en "Probá esto" sin cambiar de vista (D5). Verificación: escenarios "Fitness a la vista" y "Fitness en otra vista" de *Controles de las misiones de Entrenar*; "Guardá un cerebro" sigue marcando Guardar campeón.

  *Hecho: en `mission-targets.js`, la misión de la función de fitness ya no pide la vista de ajustes.*

  *Medido (guion, vistas 16 a 18; las misiones anteriores se adelantan con `mlLab.app.instance.missions`, que solo toca su progreso): desde la vista de entrenamiento, y también pasando antes por la de cerebros, "Mostrame" deja el foco en «Ventaja» de "Probá esto", sin cambiar de vista; en el antes el foco quedaba en la vista de ajustes. Con "Guardá un cerebro" el foco va a «Guardar campeón». En el panel oculto del navegador de la app "Mostrame" no llega a correr (espera un requestAnimationFrame), por eso se midió con el guion.*

## 5. Cierre

- [x] 5.1 Medir el panel con el guion: la vista de entrenamiento a 1440×900 sin desplazarse, al abrir y después de guardar, en español y en inglés; a 1366×768, la tarjeta y "Probá esto" a la vista. Verificación: escenarios "Pantalla de 1440×900", "Después de guardar" y "Pantalla de 1366×768", con las medidas anotadas.

  *Medido (guion): la vista de entrenamiento a 1440×900 no se desplaza (0 vertical y 0 horizontal, 739 en 739) al abrir y después de guardar, en español y en inglés; tampoco con la selección manual (antes, 120 px) ni con la lista de misiones abierta (antes, 131). A 1366×768, la tarjeta de consigna y "Probá esto" están a la vista (y 346–591) y el panel no se desplaza, ni al abrir ni con la selección manual. La barra de marcha está entera en todos los casos y la zona del escenario no se desplaza. La vista de ajustes a 1440×900 desborda 83 px (antes, 178).*

- [x] 5.2 `npm test` completo, y `auditSistema()`, `auditHierarchy()` y `auditTooltips()` en las vistas del guion, en los dos idiomas. Verificación: los resultados anotados. Lo que ya fallaba antes (Renombrar de 24 px) se anota sin arreglarlo.

  *Medido: `npm test`, 1430 pruebas, 0 fallas. En las 23 vistas del guion (español e inglés): `auditTooltips()` 0 y `auditHierarchy()` 0; `auditSistema()` 0 salvo las dos de después de guardar, con «compact Renombrar 24px» / «compact Rename 24px», que ya estaba antes y no se arregló.*

- [x] 5.3 El después con el mismo guion en `borradores/entrenar-mesa-de-trabajo/despues/`, y `comparacion.md` con el antes y el después lado a lado y las medidas. Verificación: la comparación muestra la marcha debajo de la escena en las tres vistas y "Probá esto" con la función de fitness.

  *Hecho: `borradores/entrenar-mesa-de-trabajo/despues/` y `comparacion.md`, con las medidas clave, todas las vistas antes y después y nueve vistas lado a lado. El antes final salió del mismo guion sobre una copia de `7ba3dd5`. La comparación muestra la marcha debajo de la escena en las tres vistas (13 y 14: antes "no visible") y "Probá esto" con la función de fitness.*

- [x] 5.4 Verificación en el navegador contra el filtro de entrada: los tres ajustes de "Probá esto" se ven al abrir; la marcha se ve en las tres vistas; cambiar la función de fitness rige desde la generación siguiente y "Restablecer ajustes" la devuelve; el mentor usa los mismos atajos. Anotar lo que no se pudo probar.

  *Observado: al abrir, la función de fitness, la población, la fuerza y el enfriamiento se ven en "Probá esto" sin desplazar, a los dos tamaños. La marcha se ve y funciona en las tres vistas. Elegir otra función muestra el aviso «rige desde la próxima generación», y Restablecer ajustes la devuelve a Ventaja. Los atajos son los mismos (2.5).*

  *No probado: que la función nueva rija de verdad desde la generación siguiente, porque no dejé correr una generación entera con ella (lo cubren las pruebas de `training` y de ajustes); el lector de pantalla; Firefox; una ventana visible, ya que todo fue Chrome sin ventana o el panel oculto del navegador de la app; un recorrido real con Tab.*

## Workflow follow-up

- Archivar con `/opsx:archive` después de revisar `comparacion.md`.
- Sigue `entrenar-la-generacion-ensena`.
