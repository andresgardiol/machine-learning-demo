# Tasks

## 1. Pistas cerradas en el núcleo

- [x] 1.1 Agregar `closed` a `createTrack` en `src/core/track.js`: tramo de cierre, bordes cerrados con unión en inglete en todos los vértices y `length` igual a una vuelta (design.md D1). Verificar con pruebas en un archivo nuevo los escenarios "Bordes sin extremos" y "Pista abierta sin cambios" de la spec `pista`.
- [x] 1.2 Hacer que `pointAt` y `laneCenter` reduzcan la distancia al largo de la vuelta en una pista cerrada. Verificar con una prueba el escenario "Posición después de una vuelta".
- [x] 1.3 Verificar que `progressOf` y `bordersNear` funcionan en el tramo de cierre: una prueba ubica puntos a ambos lados de la línea de salida y otra pide los bordes cercanos a ella. Verificar que `npm test` pasa sin tocar las pruebas existentes de la pista.

## 2. Catálogo de circuitos

- [x] 2.1 Crear `src/core/circuits.js` con `TRACK_IDS`, el armador de trazados por tramos y `createTrackById` (design.md D2), con la calle recta delegada en `createStraightStreet`. Verificar con pruebas los escenarios "Cuatro pistas", "Circuito repetible" y "Pista desconocida".
- [x] 2.2 Definir el óvalo con los números de D2 y diseñar el riñón y el gran premio. Verificar con pruebas, para los tres: que el trazado cierra, su largo dentro del rango de la spec, radio mínimo de 25 m, 30 m entre tramos no vecinos, 12 m de ancho y la salida en una recta de al menos 80 m; y para el gran premio, que es alargado (el lado largo de su recuadro mide al menos el doble que el corto), las eses (al menos seis curvas seguidas que alternan el sentido, de 45° o más y sin rectas de más de 20 m entre ellas), la horquilla, la curva larga, la recta de 150 m y la chicana final.
- [x] 2.3 Verificar con una prueba el escenario "Vuelta por el centro": un auto que sigue la línea central completa una vuelta de cada circuito a la velocidad máxima por defecto sin tocar los bordes.
- [x] 2.4 Generar una imagen con los tres trazados a la misma escala, con su largo y su línea de salida, y **detenerse a mostrarla**: el dibujo de los circuitos se aprueba antes de seguir.

## 3. Mundo sobre un circuito

- [x] 3.1 Aceptar `track` en `createWorld` y armar la pista con `createTrackById`; sobre un circuito, tráfico con densidad 0 y salida en el centro de la pista (design.md D3). Verificar con pruebas los escenarios "Estado por defecto", "Circuito sin tráfico" y "Volver a la calle" de la spec `simulacion`.
- [x] 3.2 Llevar `laps` por agente y armar el progreso acumulado. Verificar con pruebas los tres escenarios de "Progreso por vueltas", incluido que el progreso no salta al cruzar la salida en ninguno de los dos sentidos.
- [x] 3.3 Verificar con pruebas "Choque con el borde", "Varios autos en un circuito" y "Circuito reproducible", y que las pruebas de reproducibilidad existentes pasan sin cambios.

## 4. Entrenamiento en circuitos

- [x] 4.1 Sumar `tracks` a la configuración del entrenamiento y hacer que cada generación corra en la pista que le toca; exponer `training.trackId` (design.md D4). Verificar con pruebas los seis escenarios de "Pistas del entrenamiento".
- [x] 4.2 Exponer `training.lapsOf`. Verificar con pruebas los escenarios de "Ventaja en un circuito" y de "Vueltas de un individuo", y que la regla de los lentos saca de carrera a un auto que va a menos de 10 m/s en un circuito.
- [x] 4.3 Registrar las pistas en los escenarios del cerebro y aceptarlas en `assertBrain` (design.md D5). Verificar con pruebas los escenarios de "Pistas en los datos de entrenamiento", incluido que un cerebro anterior sigue siendo válido.
- [ ] 4.4 Sumar a `tools/measure-learning.mjs` el modo por pista de design.md D8 y correrlo para el óvalo. Pegar la tabla en el informe, con el dato informativo del riñón, el gran premio y la alternancia. Si menos de 5 de 8 semillas completan una vuelta al óvalo, **detenerse y consultar** sin cambiar circuitos, sensores ni valores por defecto.

## 5. Vista de un circuito

- [ ] 5.1 Dibujar las pistas cerradas en `src/render/view.js`: calzada entre los dos bordes, sin líneas de carril y con la línea de salida, solo en lo que cae en el encuadre (design.md D7). Verificar en el navegador los tres escenarios de "Dibujo de un circuito".
- [ ] 5.2 Ajustar el zoom mínimo para que el gran premio entre entero. Verificar con una prueba de `camera.js` el límite nuevo y, en el navegador a 1440×900, los escenarios de "Circuito entero a la vista".

## 6. Paisaje

- [x] 6.1 Crear `src/render/scenery-layout.js` con la distribución de la calle recta por celdas (design.md D9). Verificar con pruebas que es reproducible, que cambia con la semilla, que ningún árbol ni vereda cae sobre la calzada y que dos celdas vecinas no repiten la misma distribución.
- [x] 6.2 Sumar la distribución de los circuitos: pianitos, tribunas, línea de largada y árboles. Verificar con pruebas que nada queda sobre la calzada, que los pianitos están solo donde el radio es menor que 80 m y que cada circuito da siempre la misma distribución.
- [ ] 6.3 Crear `src/render/scenery.js`, agregar los colores a `styles/tokens.css` y dibujar el paisaje en el orden de D9. Verificar en el navegador los escenarios de "Paisaje de la calle", "Paisaje de los circuitos" y "Colores del paisaje", con una captura de la calle y otra de un circuito.
- [ ] 6.4 Agregar la preferencia `scenery` y el interruptor junto a los controles de cámara, con su tooltip en español y en inglés, y ocultar el paisaje en "ver como la máquina". Verificar con pruebas de `preferences` el valor por defecto y que se recuerda, y en el navegador los escenarios de "Mostrar u ocultar el paisaje".
- [x] 6.5 Verificar con una prueba el escenario "Misma simulación": el estado del mundo es idéntico paso a paso con el paisaje encendido y apagado.

## 7. Pestañas El problema y Reglas a mano

- [ ] 7.1 Sumar `track` a `src/tabs/shared/street-settings.js` y crear el selector de pista compartido (design.md D6). Verificar con pruebas que cambiar la pista obliga a reiniciar el intento y que restablecer vuelve a la calle recta.
- [ ] 7.2 En El problema: selector en el panel, indicador de vueltas, controles de tráfico deshabilitados con su ayuda y línea en lugar de las misiones. Verificar en el navegador los escenarios de "Elegir la pista" y "Pestaña en un circuito", incluido que el panel no se desplaza a 1440×900; si se desplaza, **detenerse y consultar**.
- [ ] 7.3 En Reglas a mano: lo mismo, más la vuelta a la calle recta al cargar un ejemplo o restablecer, con su aviso. Verificar con pruebas de la lógica sin DOM y en el navegador los escenarios de la spec `pestana-reglas`.

- [ ] 7.4 Agregar "ver como la máquina" a Reglas a mano, junto al interruptor de los sensores, con `machineView` ocultando también el paisaje (design.md D13). Verificar en el navegador los escenarios de "Ver como la máquina" de la spec `pestana-reglas`, y con una prueba de la lógica sin DOM que el intento es el mismo con el modo activo y apagado.

## 8. Pestaña Entrenar

- [ ] 8.1 Agregar `tracks` a `src/tabs/train/settings.js` y las cuatro opciones marcables en el grupo del escenario (design.md D10). Verificar con pruebas el valor por defecto, que no se puede dejar ninguna marcada y que restablecer vuelve a la calle recta.
- [ ] 8.2 Mostrar la pista junto al número de generación, cambiar el cuarto indicador según la pista y deshabilitar los ajustes de tráfico cuando no hay calle recta marcada. Verificar con pruebas de `session.js` y en el navegador los escenarios de "Generación en un circuito".
- [ ] 8.3 Mostrar las pistas en los datos de un cerebro de la biblioteca. Verificar con una prueba de `library-view` y en el navegador, con un cerebro entrenado en dos pistas y con uno anterior.

- [ ] 8.4 Agregar "ver como la máquina" a Entrenar, en el renglón de "Sensores del líder", con `machineView` ocultando al resto de la población y sus marcas de élite (design.md D13). Verificar en el navegador los escenarios de "Ver como la máquina" de la spec `pestana-entrenar`, incluido que el panel no se desplaza a 1440×900; si se desplaza o el renglón no entra a 360 px, **detenerse y consultar**.

## 9. Textos y tooltips

- [ ] 9.1 Agregar en `src/i18n/es.js` y `en.js` las claves de design.md D11. Verificar que la prueba de paridad pasa y que `mlLab.auditTooltips()` no informa controles sin ayuda en ninguna de las tres pestañas, en la calle y en un circuito.
- [ ] 9.2 Sumar a `tests/copy-length.test.js` los largos de los nombres de pista, del indicador de vueltas y del interruptor del paisaje. Verificar que pasa.
- [ ] 9.3 Verificar en el navegador, en español y en inglés, los tooltips del selector de pista, de las pistas del entrenamiento, de los ajustes deshabilitados en un circuito, del interruptor del paisaje y de "ver como la máquina" en las pestañas 2 y 3.

## 10. Verificación integral

- [ ] 10.1 Medir la fluidez con el panel del navegador visible, diez segundos cada una: un auto en la calle recta y en el gran premio con paisaje, y una población de 100 en la calle recta y en el gran premio con paisaje. Si alguna no llega al mínimo de su spec, **detenerse y consultar**.
- [ ] 10.2 A 360 px de panel, en español y en inglés: el selector de pista, las pistas del entrenamiento y los indicadores se leen enteros. Medirlo en el DOM e informar los anchos.
- [ ] 10.3 Recorrer las tres pestañas en cada una de las cuatro pistas: se puede manejar, programar y entrenar, y al restablecer todo vuelve a la calle recta. Informar cualquier cosa que se vea rara, con captura.
- [ ] 10.4 Repasar el filtro de entrada de proposal.md contra lo que se ve en el navegador e informar cualquier respuesta que ya no valga.
- [ ] 10.5 Actualizar `PENDIENTES.md`: quitar las notas "Paisaje procedural alrededor de la calle", "Circuitos cerrados" y '"Ver como la máquina" en la pestaña Entrenar', dejar anotado lo que quedó fuera (cruces de calles y puentes, tiempos de vuelta, circuitos generados, ejemplos de Reglas a mano para circuitos) y marcar como hecho el primer punto del orden de trabajo.

## Workflow follow-up

- Archivar el cambio cuando el dueño lo haya revisado.
