# Tasks

Las tareas marcadas **detenerse y consultar** no se resuelven bajando el
criterio: se informa lo medido y se espera la respuesta.

## 1. Carrera en el núcleo

- [x] 1.1 Sumar al mundo `respawn` y la protección frente al tráfico (design.md D1c), sin cambiar nada de lo que usan las pestañas 1 a 3. Verificar con pruebas: el auto vuelve al carril de salida a la distancia pedida, detenido y mirando hacia adelante, en la calle recta y en un circuito; conserva sus vueltas; protegido no choca con el tráfico y sí con los bordes; y `tests/reproducibility.test.js` y las pruebas de entrenamiento siguen pasando sin tocarlas.
- [x] 1.2 Crear `src/core/race.js` con `createRace` y las metas de design.md D1 y D1b: un mundo con un auto por competidor, `step()`, `time`, `goal`, `results` y `standings`. Verificar con pruebas los escenarios de "Carrera de varios competidores", "Meta de la carrera" y "Orden de la carrera" de la spec `carrera`, incluido el error con más de seis competidores o con ninguno.
- [x] 1.3 Chocar y reaparecer con penalización (design.md D1c). Verificar con pruebas los escenarios de "Chocar no saca de la carrera" y "Reaparecer en un lugar libre", con penalización 0, 0,1 y 2 segundos.
- [x] 1.4 Quién queda fuera y fin de la carrera (design.md D1d): 5 segundos sin avanzar, 20 de espera desde que llega el primero y 180 de máximo. Verificar con pruebas los escenarios de "Competidor que no avanza", "Fin de la carrera" y "Resultado de cada competidor".
- [x] 1.5 Anotar las vueltas y la mejor vuelta en los circuitos. Verificar con pruebas los tres escenarios de "Mejor vuelta" y "Vuelta que no se pierde".
- [x] 1.6 Verificar con pruebas los escenarios de "Carrera reproducible" y que `tests/architecture.test.js` sigue pasando con el módulo nuevo (núcleo sin DOM).
- [x] 1.7 Medir con cerebros entrenados (los autoguardados o uno entrenado para la ocasión) cómo se comportan al reaparecer: en la calle con densidad 50 % y 100 %, y en el óvalo. Informar choques en cadena, autos trabados y cuánto dura una carrera en cada pista con las metas de D1b. Si un cerebro queda trabado donde pasaría bien, si la protección de 2 segundos no alcanza o si una carrera típica dura mucho más de un minuto, **detenerse y consultar** con lo medido.

## 2. Cerebros de ejemplo

- [x] 2.1 Crear `tools/train-examples.mjs` y el script `npm run examples` (design.md D6): entrena los cuatro ejemplos con semillas fijas, elige el campeón, comprueba los contrastes con `createRace`, con la penalización por defecto, y escribe `src/data/example-brains.js` solo si todos se cumplen. Informar, por ejemplo: semilla, generaciones y lo medido.
- [x] 2.2 Correr la herramienta. Si algún contraste de "Lo que muestran los ejemplos" no se cumple con ninguna semilla de la lista, **detenerse y consultar** con lo medido de cada intento (choques y llegadas en los diez tráficos nuevos, resultado en el tráfico de práctica, llegada en el óvalo). No aflojar la comprobación ni cambiar cómo se entrena un ejemplo sin consultar.
- [x] 2.3 Informar, sin umbral, cómo le va a cada ejemplo en cada una de las cuatro pistas y en la calle con el tráfico de práctica (lo que después va a mostrar la tabla: llegó o no, tiempo, parte de la carrera y choques), rotulado como medido. Informar también cómo le va al programa de 7 sensores en la calle recta.
- [x] 2.4 Agregar la prueba de `npm test` que valida los cuatro cerebros y vuelve a comprobar los contrastes. Verificar los escenarios de "Cuatro cerebros incluidos" y "Ejemplos que se pueden regenerar" (dos corridas de la herramienta dan el mismo archivo).

## 3. Lógica de la pestaña sin DOM

- [x] 3.1 Crear `src/tabs/compete/competitors.js` (design.md D4): candidatos, disponibilidad con su motivo, selección de uno a seis, selección por defecto y casillas de número y color. Verificar con pruebas la selección por defecto (igual con y sin biblioteca, y con un programa propio con errores), el máximo, el mínimo, que la casilla se conserva al desmarcar a otro, el programa de ejemplo de 7 sensores en los dos idiomas, el programa propio con errores, el programa sin recordar y un cerebro inválido.
- [x] 3.2 Crear `src/tabs/compete/marks.js` (design.md D7). Verificar con pruebas los escenarios de "Dónde entrenó cada cerebro" con cerebros de una pista, de varias, de modo `same`, de los dos modos y sin generaciones.
- [x] 3.3 Crear `src/tabs/compete/results.js` (design.md D8). Verificar con pruebas: solo anotan las carreras terminadas, los dos resultados de la calle recta, el resultado con otros ajustes (incluida otra penalización), el competidor desmarcado y vuelto a marcar, el cerebro actualizado, el cerebro eliminado, el programa cambiado y borrar resultados.
- [x] 3.4 Crear `src/tabs/compete/missions.js` (design.md D15). Verificar con pruebas los escenarios de "Misiones".
- [x] 3.5 Crear la serie de semillas de la carrera (design.md D2). Verificar con pruebas que la primera es fija, que "otra carrera" no repite ninguna ni usa la del tráfico de práctica, y cuándo un cerebro practicó con el tráfico de práctica de la barra.

## 4. Escenario y barra

- [x] 4.1 Sumar a `render` la opción `competitors` y las seis variables de color (design.md D11): color y número por auto, el seguido arriba con sus sensores, la marca de choque durante la penalización, el contorno del recién reaparecido y los que ya no corren atenuados. Verificar en el navegador los escenarios de "Competidores distinguibles", con seis autos superpuestos en la salida, y medir el contraste de cada color contra la calle (3:1).
- [x] 4.2 Dibujar la meta (design.md D11): la franja a cuadros en la calle recta y la línea de salida a cuadros en los circuitos. Verificar en el navegador los escenarios de "Meta a la vista", con 2 y con 4 carriles.
- [x] 4.3 Sumar la descripción en texto del escenario para una carrera. Verificar con una prueba su contenido en los dos idiomas.
- [x] 4.4 Sumar a `scenarioBar` los grupos que una pestaña no usa, que no se crean, y `barEffect('compete', …)` (design.md D12). Verificar con pruebas el efecto de cada clave y, en el navegador, los escenarios de "Grupo que no aplica en una pestaña" y "Mismo orden en Competir": sin hueco, sin el grupo en el orden del foco ni en el árbol de accesibilidad, y la barra en un renglón a 1366 px. Comprobar que la barra de las pestañas 1 a 3 no cambió.

## 5. Pestaña: carrera lista para largar

- [x] 5.1 Crear `src/tabs/compete/index.js` con `mount` / `unmount` y estado conservado (design.md D13), registrarlo en `src/main.js` y reemplazar los textos de "próximamente". Verificar en el navegador los escenarios "Abrir Competir" y "Explicación de Competir" de `estructura-app` y los de "Carrera lista al abrir".
- [x] 5.2 Controles de la carrera: largar, pausar y reanudar, reiniciar, otra carrera y, sin "Vos", velocidades. Verificar en el navegador los escenarios de "Controles de la carrera".
- [x] 5.3 Penalización por choque en el panel y reaparición a la vista. Verificar en el navegador los escenarios de "Chocar y seguir", chocando contra un borde y contra un vehículo, con la penalización en 0, 0,1 y 2 segundos.
- [x] 5.4 Meta y espera: la meta antes de largar y en carrera, y la cuenta de 20 segundos en el tablero y sobre el escenario. Verificar los escenarios de "Meta y espera", con una carrera donde llegan todos y otra donde se acaba la espera.
- [x] 5.5 Conectar la barra: pista, tráfico y velocidad empiezan otra carrera; "Restablecer" vuelve a los valores de design.md D3. Verificar los escenarios de "Barra de escenario en Competir".
- [x] 5.6 Tráfico de la carrera: nuevo o de práctica, solo a la vista en la calle recta, con el aviso de design.md D2. Verificar los escenarios de "Tráfico de la carrera", incluido que la elección se conserva al pasar por un circuito.
- [x] 5.7 Verificar los escenarios de "La carrera se conserva al cambiar de pestaña", con una carrera a medias y con una terminada.

## 6. Panel: competidores

- [x] 6.1 Lista de competidores con casillas, número, color, tipo y dónde entrenó, que se desplaza por dentro. Verificar en el navegador los escenarios de "Elegir a los competidores", con una biblioteca de quince cerebros, y los de "Ejemplos que no cambian".
- [x] 6.2 Los dos programas. Verificar los escenarios de "Programa de ejemplo como competidor" y de "Tu programa como competidor": con el programa inicial, con uno con errores, cambiándolo en Reglas a mano y con los dos programas corriendo a la vez.
- [x] 6.3 "Vos" (design.md D5): cartel para largar con botón y tecla, carrera que espera y velocidades que no se muestran. Verificar los escenarios de "Vos como competidor", manejando una carrera entera en la calle y otra en un circuito, con los atajos encendidos y apagados. Si el cartel tapa la línea de salida o los autos en alguna pista, **detenerse y consultar** con una captura.
- [x] 6.4 Cámara con "Vos" (design.md D5). Verificar los escenarios "Vos en carrera", "Chocar y reaparecer", "Cuando ya no manejás" y "Carrera nueva con vos" de "Seguir a un competidor": yendo último, con un rival que se aleja, y chocando varias veces, la cámara no deja el auto de la persona.
- [x] 6.5 Atajos de design.md D14. Verificar con pruebas de la lógica y en el navegador que respetan el interruptor "Atajos", que no actúan al escribir en un campo y que espacio larga, pausa, reanuda y, con la carrera terminada, arma otra.

## 7. Tablero

- [x] 7.1 Indicadores y marcador de la carrera (design.md D9). Verificar en el navegador los escenarios de "Indicadores de la carrera" y "Marcador de la carrera", y que el orden cambia sin que una fila con foco lo pierda.
- [x] 7.2 Seguir a un competidor desde el marcador, sin "Vos" en carrera. Verificar los escenarios "Seguir al primero", "Elegir a uno" y "Con el teclado" de "Seguir a un competidor".
- [x] 7.3 Tabla por pista con resultados y marcas. Verificar los escenarios de "Tabla por pista", "Dónde entrenó cada cerebro" y "Resultado de la calle con su tráfico".
- [x] 7.4 Medir en el DOM el escenario "Tabla angosta" con el tablero a 360 px, seis competidores con nombres de 40 caracteres y los dos resultados en la calle, en los dos idiomas. Si alguna celda se corta o la tabla se desplaza hacia el costado, **detenerse y consultar** con una captura.

## 8. Guía, misiones y textos

- [x] 8.1 Guía de inicio y misiones con su progreso. Verificar los escenarios de "Guía de inicio" y "Misiones", cumpliendo las tres misiones de verdad.
- [x] 8.2 Textos de design.md D16 y todos los demás en `src/i18n/es.js` y `en.js`. Verificar que `tests/copy-length.test.js` y `tests/i18n.test.js` pasan con los textos nuevos y el escenario "Pestaña en inglés".
- [x] 8.3 Tooltips "qué hace / por qué importa" de cada control, estado deshabilitado y marca. Verificar los escenarios de tooltip de "Controles de la pestaña explicados" y que `mlLab.auditTooltips()` no informa nada en la pestaña.

## 9. Accesibilidad

- [x] 9.1 Marcador y tabla como tablas con encabezados; celdas con nombre completo de pista, resultado, estado y marca. Verificar leyendo el árbol de accesibilidad el escenario "Lector de pantalla".
- [x] 9.2 Anunciar la llegada del primero y el fin de la carrera, y no anunciar los cambios de orden, los choques ni cada segundo de la cuenta. Verificar los escenarios "Fin de la carrera anunciado" y "Llega el primero".
- [x] 9.3 Recorrer la pestaña entera con el teclado: orden del foco, foco siempre visible, lista de competidores, marcador, controles deshabilitados con su explicación y objetivos de al menos 24 px. Informar lo que no se cumpla.

## 10. Verificación integral

- [x] 10.1 Medir en el DOM los escenarios de "Pestaña a la vista sin desplazarse" a 1440×900 y a 1366×768, con el panel en 360 y en 400 px, en los dos idiomas, con "Vos" y sin "Vos", en la calle recta y en un circuito. Recorrer esas cuatro situaciones y listar cualquier ajuste a la vista que no tenga efecto (escenario "Nada deshabilitado por la pestaña"). Si el panel o el tablero se desplazan, **detenerse y consultar** con las medidas de cada bloque.
- [x] 10.2 Correr como persona una carrera entera en cada pista, chocando a propósito. Informar cuánto duró cada una, si los 20 segundos de espera y los 5 sin avanzar se sienten justos, y cualquier reaparición rara (dentro de un vehículo, mirando mal, fuera de la pista).
- [ ] 10.3 Medir la fluidez del escenario "Carrera en el circuito más largo" de `vista-escenario`: seis competidores, sensores encendidos y paisaje. Si baja de 55 cuadros por segundo, **detenerse y consultar** con lo medido.
- [x] 10.4 Recorrer el filtro de entrada de la propuesta, fila por fila, en el navegador: qué se ve al abrir, cómo se ignora cada cosa y cómo se vuelve atrás. Informar lo que no se cumpla.
- [x] 10.5 Comprobar que las pestañas 1 a 3 no cambiaron: `npm test` completo y un recorrido corto de cada una en el navegador (barra, panel, atajos).
- [x] 10.6 Correr `openspec validate pestana-competir --strict` y `npm test`. Actualizar `PENDIENTES.md`: marcar la pestaña 4 como hecha en el orden de trabajo y anotar lo que quedó fuera de alcance y lo que quedó sin medir.
- [x] 10.7 Informe final que separe lo medido, lo observado en el navegador y lo que no se probó (lector de pantalla real, Safari y Firefox).

## 11. Después de la prueba del dueño

- [x] 11.1 Arreglar el desplazamiento lateral del panel de Competir (design.md D10). Reproducirlo primero: con el panel en su ancho mínimo y en 360 px, en español y en inglés, con y sin "Vos", y después de poner el foco en cada control (la captura del dueño muestra el contenido cortado a la izquierda). Informar qué elemento ensanchaba el panel. Verificar en el DOM los escenarios de "Panel sin desplazamiento lateral": `scrollWidth` igual a `clientWidth` y `scrollLeft` en 0 en todos esos casos.
- [x] 11.2 Hacer que los tres botones de la carrera se lean enteros (design.md D10), sin puntos suspensivos, en el ancho mínimo del panel y en los dos idiomas. Verificar con `tests/copy-length.test.js` y midiendo en el DOM.
- [x] 11.3 Revisar con la misma medición los paneles de las pestañas 1 a 3 en su ancho mínimo. Informar si alguno se desplaza hacia los costados; arreglarlo solo si es el mismo defecto.
- [x] 11.4 Meta elegible en el núcleo (design.md D1b): `createRace({ goal })`, límites y tiempo máximo según la meta. Verificar con pruebas los escenarios nuevos de "Meta de la carrera" y "Fin de la carrera", y que con las metas por defecto los resultados de las pruebas existentes no cambian.
- [x] 11.5 Grupo "Meta" en la barra de Competir (design.md D1b y D12): un deslizador en metros o en vueltas según la pista, una meta por pista, otra carrera al soltar, restablecer. Verificar en el navegador los escenarios de "Meta configurable" y de "Grupo propio de una pestaña", incluido que la barra entra en un renglón a 1366 px en los dos idiomas y que las pestañas 1 a 3 no muestran el grupo.
- [x] 11.6 Llevar la meta elegida a la línea de meta, el cartel para largar, los indicadores, la descripción en texto del escenario y los ajustes de cada resultado ("con otros ajustes"). Verificar en el navegador con 2000 m en la calle y 3 vueltas en el óvalo con chicana.
- [ ] 11.7 Tooltip de la meta, textos en los dos idiomas y `mlLab.auditTooltips()` sin problemas. Correr `npm test` y `openspec validate pestana-competir --strict`, y volver a medir el alto del panel y del tablero a 1440×900 (no tienen que cambiar).
- [ ] 11.8 Cuenta regresiva de 3, 2, 1 al largar con "Vos" (design.md D5). Verificar en el navegador los escenarios de "Cuenta regresiva al largar", con una prueba de su lógica sin DOM (estados: esperando, contando, corriendo; qué corta la cuenta) y los textos en los dos idiomas. Comprobar que los números no tapan los autos ni la línea de salida en las cuatro pistas.
