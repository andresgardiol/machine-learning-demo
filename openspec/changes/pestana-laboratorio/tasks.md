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
- [ ] 2.3 Medir el sobreajuste con la receta de design.md D9 (40 puntos, ruido 30 %, tres capas de 8) y con dos variantes, en cinco semillas: en qué época está el mínimo del error de los apartados y cuánto sube después. Si el aviso de D9 no se dispara en al menos cuatro de las cinco semillas con alguna receta, **detenerse y consultar** con las curvas.
- [ ] 2.4 Fijar con lo medido la tasa por defecto y la receta de la misión 2, y dejar una prueba de `npm test` que compruebe las dos cosas: que con los valores por defecto se aprende el círculo y que la receta dispara el aviso.
- [x] 2.5 Medir el manejo por imitación: maestro `street-new`, 60 s en la calle recta, redes de una capa de 8 y de dos capas de 8, 50, 100 y 200 épocas. Informar los aciertos en los apartados (en total y solo en los ejemplos donde se dobla) y cómo maneja la red en una carrera de `createRace` contra su maestro en cinco tráficos nuevos (llegó o no, tiempo, choques). Si la red no llega a la meta en al menos tres de cinco tráficos con ninguna configuración, **detenerse y consultar** con lo medido y las salidas de design.md. *Medido (`node tools/measure-lab.mjs imitation 0.03,0.1,0.3`): ejemplos en 26 ms; avanzar 100 %, izquierda 7,4 %, derecha 7,4 %, retroceder 0 %. Una capa de 8, tasa 0,1, 200 épocas: 98,4 % en apartados, 97,0 % de 66 ejemplos al doblar; carreras (tráficos 2001–2005): llegó 5/5, 50,4–50,5 s, 0 choques, como el maestro (0 choques). La red por defecto (una capa de 4, 0,1, 200 épocas): 98,3 % / 100 % al doblar, 5/5 sin choques. Línea de base "solo avanzar": también llega 5/5 pero con 4 a 8 choques (llegar no discrimina, porque chocar no saca de la carrera; lo que discrimina son los choques). Con 8+8 a 0,3 la red no dobla nunca (0 % al doblar) y maneja como "solo avanzar". Cumple el umbral: no se consulta.*
- [x] 2.6 Repetir 2.5 con el maestro del óvalo en el óvalo, sin umbral, e informar. *Medido (`node tools/measure-lab.mjs oval 0.1`): el maestro del óvalo dobla en casi todos los pasos (izquierda 57 %, derecha 46 %). Una capa de 8 o 8+8, 50 a 200 épocas: 76–83 % en apartados; carreras: no llega 0/5, 34–39 choques (el maestro llega en 58,6 s sin choques); la red por defecto de 4 maneja igual que "solo avanzar" (llega en 103 s con 52 choques). Sin umbral: en el óvalo la imitación no funciona con estos ajustes.*

## 3. La pestaña con puntos, corriendo

- [ ] 3.1 Crear `src/tabs/lab/index.js` con `mount` / `unmount` y estado conservado, registrarlo en `src/main.js`, reemplazar los textos de "próximamente" y usar la disposición y los anchos de Inspeccionar. Verificar los escenarios "Abrir Laboratorio", "Explicación de Laboratorio" y "Disposición de Laboratorio" de `estructura-app`, y que las pestañas 1 a 5 no cambiaron.
- [ ] 3.2 Grupo "Datos" en la barra (design.md D5), con las formas en miniatura, el ruido y la cantidad. Verificar los escenarios de "Elegir los datos" con puntos y los de `barra-escenario` "Datos en Laboratorio", "Barra de puntos" y "Un renglón en Laboratorio".
- [ ] 3.3 Crear `src/render/plane-view.js` (design.md D7): fondo con la respuesta de la red y puntos por clase y por grupo. Verificar los escenarios de "Plano de puntos".
- [ ] 3.4 La red en la zona grande con sus controles de vista, y el aprendizaje corriendo de a épocas. Verificar los escenarios de "Aprendiendo al abrir".
- [ ] 3.5 Curvas de error y aciertos (design.md D7). Verificar los escenarios de "Curvas de aprendizaje".
- [ ] 3.6 Medir en el DOM el escenario "Pantalla de 1440×900" con puntos, en los dos idiomas. Si algo se desplaza, **detenerse y consultar** con las medidas de cada bloque.

## 4. Armar la red y el aprendizaje

- [ ] 4.1 Panel: capas, neuronas por capa y activación (design.md D6). Verificar los escenarios de "Armar la red".
- [ ] 4.2 Tasa de aprendizaje en marcha y parte apartada. Verificar los escenarios de "Tasa de aprendizaje" y "Cambiar la parte apartada".
- [ ] 4.3 "Reiniciar pesos" y "Restablecer la red". Verificar los escenarios de "Empezar de nuevo" y "Restablecer la red".
- [ ] 4.4 Aviso de sobreajuste (design.md D9), con su lógica probada sin DOM y la marca en el gráfico. Verificar los escenarios de "Ejemplos apartados y sobreajuste" con la receta fijada en 2.4.

## 5. Paso a paso animado

- [ ] 5.1 Barra de reproducción con los cinco tamaños y el ritmo (design.md D11), reutilizando la de Inspeccionar. Verificar los escenarios de "Reproducción del aprendizaje".
- [ ] 5.2 Las cuatro fases de un ejemplo conectadas al cursor. Verificar los escenarios de "Un ejemplo, paso a paso".
- [ ] 5.3 La vuelta en la vista de la red (design.md D10): culpa de cada neurona y pesos que cambian, en el diagrama y en la tabla, como capas sobre la vista de Inspeccionar. Verificar los escenarios de "La vuelta en la red" de `inspector-de-red` y que Inspeccionar se ve igual que antes.
- [ ] 5.4 Animación de la vuelta y de la corrección, con la línea de tiempo probada sin DOM. Verificar los escenarios de "Vuelta animada".
- [ ] 5.5 Operación en curso (`describeLearningStep`, con pruebas en los dos idiomas). Verificar los escenarios de "Operación en curso del aprendizaje".
- [ ] 5.6 Ejemplo en curso con puntos, y el punto destacado en el plano. Verificar los escenarios "Ejemplo de puntos", "De corrido" y "Ejemplo en curso" del plano.
- [ ] 5.7 Atajos (design.md D12), con su prueba. Verificar los escenarios de "Atajos del Laboratorio" que no dependen de grabar.

## 6. Tu manejo

- [ ] 6.1 Clase de datos "Tu manejo": barra con pista, tráfico y velocidad, ejemplos del maestro por defecto, red con las entradas y salidas del auto. Verificar los escenarios "Pasar a tu manejo", "Volver a puntos" y "Barra de manejo".
- [ ] 6.2 La escena chica con la red manejando con los pesos del momento (design.md D8). Verificar los escenarios de "Aprender a manejar imitando", incluido "Se la ve aprender a manejar".
- [ ] 6.3 Cambiar de maestro con el selector de cerebros, y el resumen de los ejemplos. Verificar los escenarios "Cambiar de maestro", "Cambiar la pista" y "Resumen de los ejemplos".
- [ ] 6.4 Ejemplo en curso de manejo: abanico de rayos y las dos filas de acciones. Verificar el escenario "Ejemplo de manejo".
- [ ] 6.5 Grabar (design.md D8): aviso, contador, choque, terminar, pocos ejemplos, borrar y volver al maestro. Verificar los escenarios de "Grabar tu propio manejo" y "Grabando" de los atajos.
- [ ] 6.6 Medir en el DOM el escenario "Pantalla de 1440×900" con tu manejo, con maestro y grabando, en los dos idiomas. Si algo se desplaza, **detenerse y consultar** con las medidas.

## 7. Guardar como cerebro

- [ ] 7.1 Guardar la red como cerebro con el bloque `imitation` (design.md D8). Verificar con pruebas los escenarios de "Cerebro que aprendió imitando" de `cerebros` (válido, exporta e importa, cero generaciones) y que una aplicación sin ese bloque lo valida igual.
- [ ] 7.2 Botón, mensaje y nombre propuesto. Verificar los escenarios de "Guardar lo aprendido como cerebro".
- [ ] 7.3 Que la biblioteca de Entrenar y las marcas de Competir digan "aprendió imitando" y dónde. Verificar los escenarios "En la biblioteca" y los de `pestana-competir` "Cerebros que aprendieron imitando", y abrir el cerebro en Inspeccionar.
- [ ] 7.4 Correr en Competir una carrera con un cerebro guardado desde el Laboratorio contra su maestro e informar el resultado, rotulado como observado.

## 8. Guía, misiones y textos

- [ ] 8.1 Guía y misiones en tres renglones, con su lógica probada sin DOM. Verificar los escenarios de "Guía y misiones del Laboratorio" cumpliendo las tres de verdad.
- [ ] 8.2 Textos de design.md D13 y todos los demás en los dos idiomas. Verificar `tests/copy-length.test.js`, `tests/i18n.test.js` y el escenario "Pestaña en inglés".
- [ ] 8.3 Tooltips de cada control, con las definiciones de época, tasa de aprendizaje, culpa, pendiente y sobreajuste. Verificar los escenarios de tooltip y que `mlLab.auditTooltips()` no informa nada con puntos y con tu manejo, en pausa, reproduciendo y grabando.

## 9. Accesibilidad

- [ ] 9.1 Descripción en texto del plano y del gráfico, y anuncio del aviso de sobreajuste. Verificar los escenarios "Descripción en texto" y "Aviso anunciado".
- [ ] 9.2 Las dos clases de puntos y los dos grupos se distinguen sin color; la vuelta se distingue de la ida sin color; menos movimiento. Verificar los escenarios correspondientes.
- [ ] 9.3 Recorrer la pestaña entera con el teclado, con puntos y con tu manejo. Informar lo que no se cumpla.

## 10. Verificación integral

- [ ] 10.1 Medir en el DOM a 1440×900 y a 1366×768, con el panel en su mínimo, en 360 y en 400 px, en los dos idiomas, con puntos y con tu manejo. Si a 1440×900 algo se desplaza, **detenerse y consultar**.
- [ ] 10.2 Medir la fluidez con el aprendizaje corriendo de a épocas con 500 puntos y tres capas de 8, y con tu manejo aprendiendo mientras la red maneja. Si el navegador de la sesión está oculto, informar el tiempo por cuadro como sustituto y dejar la tarea sin marcar.
- [ ] 10.3 Verificar "Estado conservado en el Laboratorio".
- [ ] 10.4 Recorrer el filtro de entrada de la propuesta, fila por fila. Informar lo que no se cumpla.
- [ ] 10.5 Comprobar que las pestañas 1 a 5 no cambiaron: `npm test` completo y un recorrido corto de cada una.
- [ ] 10.6 Correr `openspec validate pestana-laboratorio --strict` y `npm test`. Actualizar `PENDIENTES.md`: las seis pestañas hechas, lo que quedó fuera de alcance y lo que quedó sin medir.
- [ ] 10.7 Informe final que separe lo medido, lo observado en el navegador y lo que no se probó.
