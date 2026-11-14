# Tasks

Las tareas marcadas **detenerse y consultar** no se resuelven bajando el
criterio: se informa lo medido y se espera la respuesta. Los grupos 1 y 2 son
solo núcleo y medición: ahí se sabe si las tres hipótesis de la pestaña se
cumplen, antes de construir la interfaz.

## 1. Backpropagation y datos en el núcleo

- [x] 1.1 Crear `src/core/backprop.js` (design.md D2): respuesta suave, error, culpa, corrección y aplicación. Verificar con pruebas los escenarios de "Respuesta suave", "Error de un ejemplo", "Culpa de cada neurona" y "Corrección de los pesos" de la spec `retropropagacion`.
- [x] 1.2 Comprobar la corrección contra diferencias finitas, peso por peso, en redes de cero a tres capas ocultas y con las tres activaciones. Verificar los escenarios de "La corrección achica el error". Si esta prueba no pasa, nada de lo demás se construye. *Medido: 3 activaciones × 4 formas (0 a 3 capas) × 1 y 4 salidas, más de 300 parámetros; peor diferencia relativa < 1e-3 (`tests/backprop.test.js`).*
- [x] 1.3 Época con orden mezclado con semilla, error medio y aciertos en práctica y en apartados. Verificar los escenarios de "Una época".
- [x] 1.4 Crear `src/core/learning-cursor.js` (design.md D3). Verificar los escenarios de "Recorrido paso a paso del aprendizaje", incluido que una época paso a paso deja la red idéntica a una de corrido.
- [x] 1.5 Crear `src/core/datasets.js` (design.md D4): las cuatro formas de puntos, los ejemplos de manejo de un controlador, el grabador, la separación y el resumen. Verificar los escenarios de la spec `datos-de-ejemplo`.
- [x] 1.6 Verificar que `tests/architecture.test.js` sigue pasando y que nada de la red, la evolución ni el mundo cambió.

## 2. Medir las tres hipótesis

- [x] 2.1 Medir, con un script aparte y cinco semillas de pesos, en cuántas épocas una red de una capa de 4 con tanh llega al 90 % de aciertos en los apartados para cada forma, con tasas 0,03, 0,1, 0,3 y 1, y con 200 puntos, ruido 10 % y 30 % apartados. Informar la tabla. Elegir la tasa por defecto con la que el círculo se aprende en menos de 300 épocas en las cinco semillas. *Medido (`node tools/measure-lab.mjs shapes`, épocas hasta 90 % en apartados, semillas 1–5): dos grupos 1 época con todas las tasas; círculo 0,03: 28–128, 0,1: 5–46, 0,3: 4–16, 1: 4–12; cruzado 0,1: 4–8; espiral: no llega en 1000 con una capa de 4. Tasa por defecto elegida: 0,1 (la de partida del diseño; cumple: círculo en ≤ 46 épocas en las cinco semillas).*
- [x] 2.2 Si ninguna tasa cumple para el círculo, o si la espiral no se aprende con ninguna red de hasta tres capas de 8, **detenerse y consultar** con la tabla. *Medido: la espiral se aprende con 8+8 a tasa 0,03 en las cinco semillas (622–1055 épocas) y con 8+8+8 a 0,03 en una de cinco (216); con tasas 0,1 o más, no en 2000 épocas. Ninguna condición de parada se cumple: no se consulta.*
- [x] 2.3 Medir el sobreajuste con la receta de design.md D9 (40 puntos, ruido 30 %, tres capas de 8) y con dos variantes, en cinco semillas: en qué época está el mínimo del error de los apartados y cuánto sube después. Si el aviso de D9 no se dispara en al menos cuatro de las cinco semillas con alguna receta, **detenerse y consultar** con las curvas. *Medido (`node tools/measure-lab.mjs overfit`): con la regla de D9 tal cual avisaba 5/5 con la receta pero también 5/5 con los valores por defecto → consulta 2.3 (`laboratorio-consulta-2.3.md`). Respuesta: margen absoluto de 0,1 y aviso no fijo. Con la regla nueva: por defecto 0/5 en 1000 épocas; receta (40 puntos, ruido 30 %, 8+8+8, 0,1) 5/5 con la primera aparición en las épocas 60–275; mínimo de los apartados (600 épocas) en 346, 129, 137, 582 y 504, y al final 222 %–752 % por encima. Apariciones del aviso no fijo en 600 épocas: semilla 1: 74, se retira 341, 367 (2); s2: 60, retira 89, 151 (2); s3: 275 (1); s4: 84, retira 304, 321, retira 582, 592 (3); s5: 73, retira 309, 350, retira 497, 598 (3). Ninguna pasa de tres.*
- [x] 2.4 Fijar con lo medido la tasa por defecto y la receta de la misión 2, y dejar una prueba de `npm test` que compruebe las dos cosas: que con los valores por defecto se aprende el círculo y que la receta dispara el aviso. *Fijados en `src/tabs/lab/defaults.js`: tasa 0,1, receta de D9; `tests/lab-defaults.test.js` comprueba que por defecto el círculo llega al 90 % en 300 épocas sin aviso y que la receta lo dispara.*
- [x] 2.5 Medir el manejo por imitación: maestro `street-new`, 60 s en la calle recta, redes de una capa de 8 y de dos capas de 8, 50, 100 y 200 épocas. Informar los aciertos en los apartados (en total y solo en los ejemplos donde se dobla) y cómo maneja la red en una carrera de `createRace` contra su maestro en cinco tráficos nuevos (llegó o no, tiempo, choques). Si la red no llega a la meta en al menos tres de cinco tráficos con ninguna configuración, **detenerse y consultar** con lo medido y las salidas de design.md. *Medido (`node tools/measure-lab.mjs imitation 0.03,0.1,0.3`): ejemplos en 26 ms; avanzar 100 %, izquierda 7,4 %, derecha 7,4 %, retroceder 0 %. Una capa de 8, tasa 0,1, 200 épocas: 98,4 % en apartados, 97,0 % de 66 ejemplos al doblar; carreras (tráficos 2001–2005): llegó 5/5, 50,4–50,5 s, 0 choques, como el maestro (0 choques). La red por defecto (una capa de 4, 0,1, 200 épocas): 98,3 % / 100 % al doblar, 5/5 sin choques. Línea de base "solo avanzar": también llega 5/5 pero con 4 a 8 choques (llegar no discrimina, porque chocar no saca de la carrera; lo que discrimina son los choques). Con 8+8 a 0,3 la red no dobla nunca (0 % al doblar) y maneja como "solo avanzar". Cumple el umbral: no se consulta.*
- [x] 2.6 Repetir 2.5 con el maestro del óvalo en el óvalo, sin umbral, e informar. *Medido (`node tools/measure-lab.mjs oval 0.1`): el maestro del óvalo dobla en casi todos los pasos (izquierda 57 %, derecha 46 %). Una capa de 8 o 8+8, 50 a 200 épocas: 76–83 % en apartados; carreras: no llega 0/5, 34–39 choques (el maestro llega en 58,6 s sin choques); la red por defecto de 4 maneja igual que "solo avanzar" (llega en 103 s con 52 choques). Sin umbral: en el óvalo la imitación no funciona con estos ajustes.* *Ampliada a pedido de la consulta 2.3 (`node tools/measure-lab.mjs oval-wide 0.03,0.1`; en el óvalo no hay tráfico, así que las cinco carreras son iguales): una capa de 8 a tasa 0,03: 500 épocas (2,0 s de núcleo) 96,3 % en apartados, llega 5/5 en 62,1 s sin choques; 1000 épocas (4,0 s) 80,5 %, llega 5/5 en 58,6 s sin choques, como el maestro. Con tasa 0,1 o con 8+8 y 8+8+8 no llega (28–39 choques), salvo 8+8 a 0,03 con 1000 épocas (llega en 70,4 s con 8 choques). Tiempos de entrenamiento en el núcleo: 8: 2 s / 500 épocas; 8+8: 3,4 s; 8+8+8: 5 s. Los aciertos en los apartados suben y bajan (96 % → 80 %) sin que eso prediga el manejo. Lectura: es un límite de los ajustes (red chica y tasa baja), no del método.*

## 3. La pestaña con puntos, corriendo

- [x] 3.1 Crear `src/tabs/lab/index.js` con `mount` / `unmount` y estado conservado, registrarlo en `src/main.js`, reemplazar los textos de "próximamente" y usar la disposición y los anchos de Inspeccionar. Verificar los escenarios "Abrir Laboratorio", "Explicación de Laboratorio" y "Disposición de Laboratorio" de `estructura-app`, y que las pestañas 1 a 5 no cambiaron. *Verificado en el navegador: la pestaña abre, el tooltip de la pestaña ya no dice "próximamente", usa la preferencia de ancho de Inspeccionar (la red mide 708 px en las dos a 1440).*
- [x] 3.2 Grupo "Datos" en la barra (design.md D5), con las formas en miniatura, el ruido y la cantidad. Verificar los escenarios de "Elegir los datos" con puntos y los de `barra-escenario` "Datos en Laboratorio", "Barra de puntos" y "Un renglón en Laboratorio". *Verificado: barra de un renglón con puntos y con tu manejo, en es y en, a 1440 y 1366 px.*
- [x] 3.3 Crear `src/render/plane-view.js` (design.md D7): fondo con la respuesta de la red y puntos por clase y por grupo. Verificar los escenarios de "Plano de puntos".
- [x] 3.4 La red en la zona grande con sus controles de vista, y el aprendizaje corriendo de a épocas. Verificar los escenarios de "Aprendiendo al abrir". *Observado: a la época 45 el círculo está aprendido (práctica 98 %, apartados 98 %).*
- [x] 3.5 Curvas de error y aciertos (design.md D7). Verificar los escenarios de "Curvas de aprendizaje".
- [x] 3.6 Medir en el DOM el escenario "Pantalla de 1440×900" con puntos, en los dos idiomas. Si algo se desplaza, **detenerse y consultar** con las medidas de cada bloque. *Medido en el DOM a 1440×900, es y en, con puntos, reproduciendo y paso a paso: escenario 708, tablero 360, panel 360; ninguna zona con desplazamiento (scrollHeight − clientHeight = 0 en las tres y en el documento) y ningún elemento fuera de la ventana. No se consulta.*

## 4. Armar la red y el aprendizaje

- [x] 4.1 Panel: capas, neuronas por capa y activación (design.md D6). Verificar los escenarios de "Armar la red".
- [x] 4.2 Tasa de aprendizaje en marcha y parte apartada. Verificar los escenarios de "Tasa de aprendizaje" y "Cambiar la parte apartada".
- [x] 4.3 "Reiniciar pesos" y "Restablecer la red". Verificar los escenarios de "Empezar de nuevo" y "Restablecer la red".
- [x] 4.4 Aviso de sobreajuste (design.md D9), con su lógica probada sin DOM y la marca en el gráfico. Verificar los escenarios de "Ejemplos apartados y sobreajuste" con la receta fijada en 2.4. *Observado en la pestaña con la receta: el aviso aparece, el gráfico marca la mejor época (61) y la misión 2 queda cumplida. El aviso no es fijo (consulta 2.3).*

## 5. Paso a paso animado

- [x] 5.1 Barra de reproducción con los cinco tamaños y el ritmo (design.md D11), reutilizando la de Inspeccionar. Verificar los escenarios de "Reproducción del aprendizaje".
- [x] 5.2 Las cuatro fases de un ejemplo conectadas al cursor. Verificar los escenarios de "Un ejemplo, paso a paso".
- [x] 5.3 La vuelta en la vista de la red (design.md D10): culpa de cada neurona y pesos que cambian, en el diagrama y en la tabla, como capas sobre la vista de Inspeccionar. Verificar los escenarios de "La vuelta en la red" de `inspector-de-red` y que Inspeccionar se ve igual que antes. *Inspeccionar abierto después: se ve igual (sin anillos ni flechas; nombres de sensores y acciones).*
- [x] 5.4 Animación de la vuelta y de la corrección, con la línea de tiempo probada sin DOM. Verificar los escenarios de "Vuelta animada". *La línea de tiempo se prueba en Node; con menos movimiento no se crean animaciones (por código: no se probó emulando la preferencia en el navegador).*
- [x] 5.5 Operación en curso (`describeLearningStep`, con pruebas en los dos idiomas). Verificar los escenarios de "Operación en curso del aprendizaje".
- [x] 5.6 Ejemplo en curso con puntos, y el punto destacado en el plano. Verificar los escenarios "Ejemplo de puntos", "De corrido" y "Ejemplo en curso" del plano.
- [x] 5.7 Atajos (design.md D12), con su prueba. Verificar los escenarios de "Atajos del Laboratorio" que no dependen de grabar. *Verificado en el navegador: N avanza un paso en pausa y espacio alterna.*

## 6. Tu manejo

- [x] 6.1 Clase de datos "Tu manejo": barra con pista, tráfico y velocidad, ejemplos del maestro por defecto, red con las entradas y salidas del auto. Verificar los escenarios "Pasar a tu manejo", "Volver a puntos" y "Barra de manejo".
- [x] 6.2 La escena chica con la red manejando con los pesos del momento (design.md D8). Verificar los escenarios de "Aprender a manejar imitando", incluido "Se la ve aprender a manejar".
- [x] 6.3 Cambiar de maestro con el selector de cerebros, y el resumen de los ejemplos. Verificar los escenarios "Cambiar de maestro", "Cambiar la pista" y "Resumen de los ejemplos".
- [x] 6.4 Ejemplo en curso de manejo: abanico de rayos y las dos filas de acciones. Verificar el escenario "Ejemplo de manejo".
- [x] 6.5 Grabar (design.md D8): aviso, contador, choque, terminar, pocos ejemplos, borrar y volver al maestro. Verificar los escenarios de "Grabar tu propio manejo" y "Grabando" de los atajos. *Verificado: 120 ejemplos en 2 s; chocando, 5 intentos en 400 pasos y 160 ejemplos, sin ejemplos del auto chocado; pocos ejemplos dan el aviso.*
- [x] 6.6 Medir en el DOM el escenario "Pantalla de 1440×900" con tu manejo, con maestro y grabando, en los dos idiomas. Si algo se desplaza, **detenerse y consultar** con las medidas. *Medido a 1440×900, es y en, con maestro (reproduciendo y paso a paso) y grabando: ninguna zona se desplaza. No se consulta.*

## 7. Guardar como cerebro

- [x] 7.1 Guardar la red como cerebro con el bloque `imitation` (design.md D8). Verificar con pruebas los escenarios de "Cerebro que aprendió imitando" de `cerebros` (válido, exporta e importa, cero generaciones) y que una aplicación sin ese bloque lo valida igual.
- [x] 7.2 Botón, mensaje y nombre propuesto. Verificar los escenarios de "Guardar lo aprendido como cerebro".
- [x] 7.3 Que la biblioteca de Entrenar y las marcas de Competir digan "aprendió imitando" y dónde. Verificar los escenarios "En la biblioteca" y los de `pestana-competir` "Cerebros que aprendieron imitando", y abrir el cerebro en Inspeccionar.
- [x] 7.4 Correr en Competir una carrera con un cerebro guardado desde el Laboratorio contra su maestro e informar el resultado, rotulado como observado. *Observado (una carrera en Competir, calle recta, semilla 1001, irregularidad 0): «Imitación 2» (una capa de 4, 200 épocas imitando a street-new) llegó en 51,2 s con 1 choque; el maestro, en 50,4 s sin choques. Las marcas dicen «practicó» en la calle y «no la vio» en los circuitos.*

## 8. Guía, misiones y textos

- [x] 8.1 Guía y misiones en tres renglones, con su lógica probada sin DOM. Verificar los escenarios de "Guía y misiones del Laboratorio" cumpliendo las tres de verdad. *Verificado: con la guía apagada no se ven el texto ni las misiones; las tres misiones se cumplieron de verdad en el navegador.*
- [x] 8.2 Textos de design.md D13 y todos los demás en los dos idiomas. Verificar `tests/copy-length.test.js`, `tests/i18n.test.js` y el escenario "Pestaña en inglés".
- [x] 8.3 Tooltips de cada control, con las definiciones de época, tasa de aprendizaje, culpa, pendiente y sobreajuste. Verificar los escenarios de tooltip y que `mlLab.auditTooltips()` no informa nada con puntos y con tu manejo, en pausa, reproduciendo y grabando. *`mlLab.auditTooltips()` sin faltantes con puntos y con tu manejo, en pausa, reproduciendo y grabando.*

## 9. Accesibilidad

- [x] 9.1 Descripción en texto del plano y del gráfico, y anuncio del aviso de sobreajuste. Verificar los escenarios "Descripción en texto" y "Aviso anunciado". *El aviso se anuncia con el anunciador una vez por aparición (se quitó el rol propio para no anunciarlo dos veces).*
- [x] 9.2 Las dos clases de puntos y los dos grupos se distinguen sin color; la vuelta se distingue de la ida sin color; menos movimiento. Verificar los escenarios correspondientes. *Clases: círculos y cuadrados; grupos: llenos y huecos; vuelta: rombos y anillos contra los círculos de la ida. Menos movimiento: por código, no emulado en el navegador.*
- [x] 9.3 Recorrer la pestaña entera con el teclado, con puntos y con tu manejo. Informar lo que no se cumpla. *Recorrido con Tab real (75 pulsaciones): barra → red → tablero → panel; las formas con foco itinerante; el gráfico recibe el foco y las flechas mueven la lectura cuando tiene puntos (con 0 épocas no hay gráfico y no se recorre). No se encontró nada inalcanzable.*

## 10. Verificación integral

- [x] 10.1 Medir en el DOM a 1440×900 y a 1366×768, con el panel en su mínimo, en 360 y en 400 px, en los dos idiomas, con puntos y con tu manejo. Si a 1440×900 algo se desplaza, **detenerse y consultar**. *Medido en el DOM a 1440×900 y 1366×768, con el panel en 300 (mínimo), 360 y 400 px (394 a 1366, por el mínimo de la red), es y en, puntos y tu manejo, paso a paso: sin desplazamiento en ninguna zona ni en el documento, nada fuera de la ventana ni recortado dentro de las zonas, botones de ≥ 24 px, barra en un renglón. No se consulta.*
- [ ] 10.2 Medir la fluidez con el aprendizaje corriendo de a épocas con 500 puntos y tres capas de 8, y con tu manejo aprendiendo mientras la red maneja. Si el navegador de la sesión está oculto, informar el tiempo por cuadro como sustituto y dejar la tarea sin marcar. *Sin marcar: el panel del navegador estuvo oculto. Sustituto medido (tick + dibujo por cuadro, 120 cuadros): 500 puntos y 8+8+8 a 10 épocas/s, mediana 0,5 ms, p95 2,5 ms, máximo 9,3 ms; a 60 épocas/s, mediana 2,3 ms, máximo 6,2 ms; tu manejo a 10 épocas/s, mediana 0,2 ms, máximo 8,3 ms.*
- [x] 10.3 Verificar "Estado conservado en el Laboratorio". *Verificado: Laboratorio → Competir → Laboratorio conserva época, ajustes, curvas y tamaño de paso; con el aprendizaje en marcha, al ir a Inspeccionar y volver la época no avanzó (11 → 11).*
- [x] 10.4 Recorrer el filtro de entrada de la propuesta, fila por fila. Informar lo que no se cumpla. *Ver el informe final.*
- [x] 10.5 Comprobar que las pestañas 1 a 5 no cambiaron: `npm test` completo y un recorrido corto de cada una. *`npm test` completo y las seis pestañas abiertas en el navegador sin errores en la consola.*
- [x] 10.6 Correr `openspec validate pestana-laboratorio --strict` y `npm test`. Actualizar `PENDIENTES.md`: las seis pestañas hechas, lo que quedó fuera de alcance y lo que quedó sin medir.
- [x] 10.7 Informe final que separe lo medido, lo observado en el navegador y lo que no se probó. *Entregado en `laboratorio-informe-final.md`, en la carpeta de notas de la sesión.*
