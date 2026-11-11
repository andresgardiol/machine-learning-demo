# Tasks

Medidas de referencia para las verificaciones en el navegador: ventana de
1440×900 salvo que la tarea diga otra. "El panel entra" significa que
`document.getElementById('panel').scrollHeight <= clientHeight`.

## 1. Zonas, preferencias y números sin DOM

- [x] 1.1 En `src/ui/layout.js`, agregar `ZONES`, `layoutMode`, `fitZones`, `stageLimits` y `panelLimits` según design.md D2, sin tocar `PANEL_WIDTH`, `clampPanelWidth` ni `maxPanelWidth`. Verificar con casos nuevos en `tests/layout.test.js`: modo por ancho (959 → `stacked`, 960 → `wide`, sin tablero → `plain`), `fitZones` en 1440 (400/668/360), 1000 (268/360/360) y 960 (260/360/328), preferencias fuera de rango, y los límites de los escenarios "Límites del panel", "Límite de la mitad de la ventana" y "Límites del escenario" de la spec `estructura-app` (668, 720 y 708).
- [x] 1.2 En `src/ui/preferences.js`, agregar `stageWidth` (`mlLab.stageWidth`) con la misma validación que `panelWidth`. Verificar en `tests/preferences.test.js`: valor válido, valor inválido y almacenamiento que falla.
- [x] 1.3 En `src/ui/i18n.js`, agregar `formatFixed(value, digits, language)` según D10. Verificar en `tests/number-format.test.js`: `0.4` con dos decimales da `0,40` en español y `0.40` en inglés, y `1` da `1,00` / `1.00`.
- [x] 1.4 Correr `npm test` y confirmar que pasan todas las pruebas, las anteriores sin modificar.

## 2. Estructura común con tablero

- [x] 2.1 En `src/ui/app.js`, crear la zona `board` y el segundo borde en el orden de DOM de D1, pasar `board` en el contexto de `mount`, limpiarlo al desmontar y calcular `data-board` y `data-layout` en `.app` con `layoutMode` cada vez que cambia el tamaño o se monta una pestaña. Verificar en el navegador que, con las pestañas todavía sin usar el tablero, las dos se ven y funcionan igual que antes (`data-board="off"`).
- [x] 2.2 Extraer la lógica del borde a `makeSplitter` (D3) y usarla para los dos bordes, con `fitZones` al arrancar y al cambiar el tamaño de la ventana, y `stageLimits` / `panelLimits` al arrastrar. Guardar `stageWidth` y `panelWidth` solo al soltar o al usar el teclado. Verificar en el navegador que el borde del panel conserva su comportamiento actual: arrastre, flechas, Home, End, Enter, doble clic y ancho recordado al recargar.
- [x] 2.3 En `styles/app.css`, escribir la grilla de los tres casos de D1 (`wide`, `stacked`, tablero apagado) y ocultar el borde del escenario cuando no corresponde. Verificar forzando en la consola un nodo de prueba dentro del tablero (`mlLab.app` expone la app): en 1440 se ven tres columnas de 400 / resto / 360 y en 800 el tablero queda debajo del escenario con el 45 % del alto; quitar el nodo de prueba al terminar.
- [x] 2.4 Agregar en `src/i18n/es.js` y `en.js` los textos `app.board`, `app.stage.resize`, el tooltip `help.stage.resize` (qué hace y por qué importa) y revisar `help.panel.resize` para que mencione el tablero. Verificar con `npm test` (las claves coinciden en los dos idiomas) y posando el cursor sobre cada borde en español y en inglés.

## 3. Componentes del tablero y estilos comunes

- [ ] 3.1 Crear `src/ui/board.js` con `statStrip` y `boardCard` según D4 (título con botón, `aria-expanded`, `aria-controls`, `data-help` y renglón de ayuda con la clase `guide`). Verificar que `npm test` sigue pasando, incluida `tests/architecture.test.js`.
- [ ] 3.2 En `styles/app.css`, agregar `.board`, `.board-strip`, `.board-last`, `.card`, `.card-title`, `.card-body`, `.card-hint` y `.sr-only` con las reglas de D4, usando solo los tokens de `styles/tokens.css`.
- [ ] 3.3 Unificar `.drive-advanced` y `.train-section` en `.section` (y `.group` para los grupos internos) en el CSS y en las dos pestañas. Verificar en el navegador que las secciones plegables de El problema y de Entrenar se ven iguales entre sí y siguen abriendo y cerrando.
- [ ] 3.4 Agregar la regla de escenario angosto de D7 (`container` en `.stage`, insignias y mensaje de choque más abajo con menos de 360 px). Verificar en el navegador, con el escenario en 260 px, que la insignia de generación no se pisa con los controles de cámara.

## 4. Curva y diagrama según su zona

- [ ] 4.1 En `src/ui/chart.js`, agregar `chartLayoutFor`, envolver el SVG en `.chart-plot`, observar su tamaño y dibujar con el `layout` vigente (D5); pasar el texto del gráfico a 11 px en el CSS. Verificar en `tests/chart.test.js`: `chartLayoutFor` respeta los mínimos de 240×120 y `chartModel` ubica los puntos dentro del área para un `layout` de 640×300.
- [ ] 4.2 En `src/render/network-view.js`, tomar ancho y alto del contenedor y aplicar las medidas nuevas de `LAYOUT` y la fuente de 12 px (D6). Verificar en `tests/network-view.test.js`: los casos actuales siguen pasando y se agregan una zona de 640×380 (todos los rótulos de la red 6-6-4 presentes y dentro de la zona) y una de 328×120 (todo dentro de la zona).
- [ ] 4.3 Correr `npm test` y confirmar que todo pasa.

## 5. Entrenar: tablero

- [ ] 5.1 En `src/tabs/train/session.js`, agregar `lastGeneration(training)` según D8, sin cambiar `indicators`. Verificar en `tests/train-session.test.js`: antes de la primera generación devuelve `null`; con una generación terminada devuelve el número de esa generación, el mejor con la clave de su unidad (metros, segundos y metros por segundo) y la clave de cada uno de los cuatro motivos.
- [ ] 5.2 En `src/tabs/train/index.js`, armar el tablero de D8 en `ctx.board`: `statStrip` con generación, autos en carrera y fitness del líder; la línea de la última generación con sus dos tramos; y las tarjetas de la curva y de la red (con su leyenda) usando `boardCard`, con `showChart` y `showNetwork` como estado. Quitar del panel los indicadores, la curva y la red. El diagrama no se dibuja con su tarjeta plegada.
- [ ] 5.3 Agregar en los dos diccionarios `train.last.*`, `train.chart.hint.new`, `train.chart.hint.same` y `train.network.hint` con los textos de D12, y mostrar en la tarjeta de la curva el renglón de ayuda que corresponde a `training.config.trafficMode`. Verificar con `npm test` y cambiando el idioma con una generación terminada: la línea de la última generación cambia de idioma sin recargar.
- [ ] 5.4 Verificar en el navegador los escenarios de la spec `tablero` y los de "Indicadores del entrenamiento", "Curva de fitness" y "Red del líder" de `pestana-entrenar`: en 1440×900 el tablero no tiene barra de desplazamiento y se ven completas la curva y la red; plegar una hace crecer la otra; el estado se conserva al ir a El problema y volver; con la guía apagada desaparecen los renglones de ayuda; Enter sobre un título pliega y la barra espaciadora sigue pausando; al agrandar el tablero los números de los ejes conservan su tamaño.
- [ ] 5.5 Verificar en el navegador los escenarios de `estructura-app` que necesitan el tablero: "Escenario ajustable" completo (arrastre, límites 260 y 708, flecha derecha, doble clic, ancho recordado al recargar), "Anchos que se adaptan a la ventana" (1440 → 1000 → 1440) y "Disposición en ventanas medianas" (800 y vuelta a 1200), comprobando que el entrenamiento no se reinicia en ningún cambio.

## 6. Entrenar: panel

- [ ] 6.1 Reemplazar la guía de tres párrafos por `train.guide` (D12), ocultar el título con `.sr-only` y ordenar el panel como en D9. Eliminar de los dos diccionarios las claves de Entrenar que D12 lista como en desuso, confirmando antes con una búsqueda que nada más las usa.
- [ ] 6.2 Agrupar los controles de marcha como en D9: pausar y siguiente en un renglón, las velocidades en un renglón (sin `setting-stacked`), y reiniciar y población nueva como botones chicos con su confirmación debajo. Verificar en el navegador el requisito "Controles de marcha agrupados" con el panel en 360 px, en español y en inglés.
- [ ] 6.3 Sacar el bloque de guardar el campeón de la sección de la biblioteca, darle su línea de estado propia y mostrar el contador en el título de la biblioteca (`library.title.count`). Verificar en el navegador los escenarios "Guardar con la biblioteca plegada", "Sin campeón todavía", "Guardar tras continuar un cerebro" y "Contador".
- [ ] 6.4 Acortar los nombres de las misiones con los textos de D12. Verificar en el navegador el escenario "Misiones de un renglón" en español y en inglés.
- [ ] 6.5 Reorganizar la sección avanzada en los cuatro grupos de D9, con el aviso de cambios esperando y restablecer fuera de los grupos, una confirmación de entrenamiento nuevo en el grupo de red y otra en el de sensores, y el estado `open` a nivel de módulo. Verificar en el navegador los cinco escenarios de "Avanzado por grupos" y que siguen cumpliéndose "Red y sensores" y "Restablecer la configuración" de la spec vigente (cambio antes de la primera generación, con progreso, cancelar, y arrastre con una sola confirmación).
- [ ] 6.6 Agregar en los dos diccionarios los tooltips de los cuatro grupos (`help.train.advanced.evolution`, `.scenario`, `.network`, `.sensors`) con qué hace y por qué importa en lenguaje llano, y los textos nuevos de D12 para Entrenar. Verificar con `mlLab.auditTooltips()` en la consola, con todo desplegado: ningún control de la pestaña sin ayuda ni texto faltante.
- [ ] 6.7 Crear `tests/copy-length.test.js` con los límites de D14 para los textos de Entrenar en los dos idiomas (guía de hasta 240, renglones de ayuda de hasta 120, misiones de hasta 34 con `{goal}` reemplazado). Verificar que pasa; si un texto se excede, acortarlo sin cambiar su sentido.
- [ ] 6.8 Verificar en el navegador "Panel a la vista sin desplazarse": en 1440×900, con la guía activa, el panel entra en español y en inglés; en 1366×768 se ven sin desplazar los controles de marcha, el interruptor de sensores y la configuración básica; y al mover la fuerza de mutación se ven a la vez el deslizador, la curva, la red y los autos. Si el panel no entra, ajustar espaciados; si aun así no entra, detenerse y consultar antes de quitar u ocultar nada.

## 7. Biblioteca legible

- [ ] 7.1 En `src/ui/library-view.js`, hacer que `brainSummary` devuelva `nameKey` para los autoguardados y `origin: 'autosave'` (D11). Actualizar `tests/library-view.test.js`, la única prueba existente que cambia, y agregar el caso del entrenamiento anterior.
- [ ] 7.2 Mostrar el nombre del autoguardado según `nameKey`, la etiqueta `library.origin.autosave`, y cambiar el CSS del encabezado para que los nombres corten entre palabras. Agregar `library.autosave.current`, `library.autosave.previous` y `library.origin.autosave` en los dos idiomas y quitar las dos claves de origen que quedan en desuso.
- [ ] 7.3 Verificar en el navegador los escenarios nuevos de "Lista de cerebros" de la spec `cerebros`: con el panel en 360 px "Entrenamiento en curso" no se parte; tras reiniciar aparece "Entrenamiento anterior"; al pasar a inglés cambian sin recargar; y con el panel en 300 px un nombre de siete palabras corta entre palabras con la etiqueta completa. Comprobar que exportar un autoguardado sigue descargando un archivo válido.

## 8. El problema: tablero y panel

- [ ] 8.1 En `src/tabs/drive/session.js`, agregar `readings(perception, { max })` según D10. Verificar en `tests/drive-session.test.js`: con 5 y con 12 sensores devuelve las lecturas redondeadas a dos decimales; con 30 devuelve `sensors: null`; la velocidad se devuelve siempre, también cuando es negativa.
- [ ] 8.2 En `src/tabs/drive/index.js`, armar el tablero de D10 en `ctx.board`: los cuatro indicadores con `statStrip`, la tarjeta de percepción (barras que ocupan el alto, números con `formatFixed` cuando `readings` los da, barra de velocidad separada y rotulada) y la tarjeta de acción, con el estado de las tarjetas a nivel de módulo. Quitar esos bloques del panel.
- [ ] 8.3 Hacer que el interruptor de sensores solo decida si se dibujan los rayos (las barras siguen), conservando el comportamiento de "Ver como la máquina". Verificar en el navegador los seis escenarios de "Percepción visible" y los tres de "Ver como la máquina" de la spec vigente.
- [ ] 8.4 Ordenar el panel como en D10: título oculto, guía corta con su renglón de teclas, pausar y reiniciar en un renglón, tráfico nuevo como botón chico, los dos interruptores de vista juntos, misiones cortas y la sección avanzada.
- [ ] 8.5 Agregar en los dos diccionarios los textos de D12 para El problema, los tooltips `help.drive.perception` y `help.drive.action`, y revisar `help.drive.sensors`; eliminar las claves en desuso tras confirmar con una búsqueda. Extender `tests/copy-length.test.js` a la guía (con `{lanes}` reemplazado por 3), el renglón de teclas, los renglones de ayuda y las misiones de El problema.
- [ ] 8.6 Verificar en el navegador: "Panel a la vista sin desplazarse" de `pestana-conducir` (1440×900 y 1366×768, en los dos idiomas); "Guía de inicio" con 3 y con 4 carriles; "Indicadores junto al escenario"; "Percepción y acción a la vez"; el cambio a nueve sensores muestra nueve barras con número; y `mlLab.auditTooltips()` sin problemas en la pestaña.

## 9. Tráfico nuevo en cada generación por defecto

- [ ] 9.1 En `src/core/training.js`, cambiar `DEFAULT_TRAINING_CONFIG.trafficMode` a `'new'` (design.md D15) y comprobar que `src/tabs/train/settings.js` sigue tomando su valor por defecto de esa constante. Actualizar solo las pruebas existentes que D15 enumera (`tests/training.test.js` y `tests/train-settings.test.js`): las que esperan el valor por defecto pasan a `'new'` y las que necesitan el mismo tráfico lo piden de forma explícita. No tocar ninguna otra prueba.
- [ ] 9.2 Agregar en `tests/training.test.js` un caso por cada escenario del requisito "Tráfico por generación" de la spec `neuroevolucion`: sin indicar el modo, la semilla del mundo de la generación 2 es distinta de la de la generación 1; dos entrenamientos de diez generaciones con la misma semilla y tráfico nuevo tienen la misma semilla de mundo en cada generación y el mismo mejor y promedio; y tras `configure({ trafficMode: 'same' })` las generaciones siguientes usan `SCENARIO_TRAFFIC_SEED`. Verificar con `npm test`.
- [ ] 9.3 Correr `node tools/calibrate.mjs`, que ahora mide con tráfico nuevo, y anotar su salida en el reporte. Criterio sin cambios: al menos 300 m en 8 de 10 semillas a las 20 generaciones. Si no se cumple, detenerse y consultar con la salida; no cambiar ningún otro valor por defecto.
- [ ] 9.4 Revisar en los dos diccionarios los tooltips `help.train.setting.trafficMode`, `help.train.trafficMode.same` y `help.train.trafficMode.new` según D15 (cuál es el valor por defecto y para qué sirve "el mismo"), en lenguaje llano. Verificar posando el cursor sobre el ajuste y sobre cada opción, en español y en inglés.
- [ ] 9.5 Verificar en el navegador los escenarios "Tráfico distinto en cada generación" y "Volver al estado por defecto" de "Entrenamiento en marcha al abrir", y "Curva con tráfico nuevo" y "Curva con el mismo tráfico" de "Curva de fitness" (spec `pestana-entrenar`): al abrir, el ajuste muestra "nuevo en cada generación" y los vehículos cambian de posición entre la generación 1 y la 2; al elegir "el mismo" aparece el aviso de cambios esperando y el renglón de ayuda de la curva cambia cuando empieza la generación siguiente; restablecer vuelve a tráfico nuevo sin reiniciar; y reiniciar el entrenamiento repite los mismos valores de la curva.

## 10. Verificación integral

- [ ] 10.1 Correr `npm test` y confirmar que pasa todo; listar en el reporte las pruebas nuevas y las modificadas, que solo pueden ser las que design.md D14 enumera (`tests/library-view.test.js`, `tests/training.test.js` y `tests/train-settings.test.js`).
- [ ] 10.2 Recorrer las dos pestañas en español y en inglés con anchos de ventana de 590, 600, 800, 959, 960, 1000, 1366, 1440 y 1920 píxeles: aviso de pantalla angosta solo por debajo de 600, tablero debajo del escenario hasta 959, tres columnas desde 960, y ningún texto cortado, pisado o desbordado en ningún caso.
- [ ] 10.3 Recorrer cada pestaña solo con el teclado: el foco pasa por escenario, tablero y panel en ese orden, los dos bordes se mueven con las flechas sin que el auto gire, y los atajos (espacio, N, T, R) siguen funcionando con el foco en cualquier control.
- [ ] 10.4 Medir la tasa de cuadros durante diez segundos en cada pestaña con la configuración por defecto y el tablero completo a la vista, y mientras se arrastra un borde: al menos 50 cuadros por segundo de promedio. Si no se alcanza, detenerse y consultar con las medidas.
- [ ] 10.5 Correr `mlLab.auditTooltips()` en las dos pestañas con todo desplegado, en los dos idiomas, y comprobar que ningún texto visible muestra una clave en lugar de su traducción.
- [ ] 10.6 Repasar las cuatro preguntas del filtro de entrada sobre el resultado en pantalla, con la tabla de proposal.md, usando la app con la guía activa y con la guía apagada; anotar en el reporte cualquier respuesta que ya no se sostenga.
- [ ] 10.7 Actualizar `PENDIENTES.md`: quitar de "Próximo" la revisión de UX del panel y dejar anotado lo que haya quedado sin resolver.

## Workflow follow-up

- Archivar el cambio cuando el dueño del proyecto lo haya revisado en el navegador.
