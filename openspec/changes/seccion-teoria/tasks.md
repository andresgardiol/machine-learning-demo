# Tasks

Cada grupo dice quién lo hace (design.md D11): **Opus** (armazón, cuentas, pruebas) o **Fable**
(figuras, dibujos, textos, disposición).

## 1. Armazón y mudanza (Opus)

- [ ] 1.1 Comprobar que el trabajo de `teoria-prototipos` tenga commit antes de mudar nada; si no lo tiene, detenerse y consultar. Se verifica con `git status` sin archivos de `prototipos/` sin seguimiento
- [ ] 1.2 Crear `teoria/index.html`, `styles/teoria.css` y `src/teoria/` con la estructura de D2; se verifica abriendo `/teoria/` sin errores en la consola
- [ ] 1.3 Mudar de `prototipos/teoria/` las figuras, la película, la historia, el contenido y los estilos (D3), sin `libro/` ni `pasos/`; se verifica que "Una neurona" y la historia se ven igual que en el prototipo
- [ ] 1.4 Escribir `rutas.js` con las direcciones de D1 (portada, historia, capítulo, tramo, desconocida) como funciones puras; se verifica con pruebas en `tests/`
- [ ] 1.5 Escribir `capitulos/indice.js` con los diez capítulos, su número, si están disponibles y su pestaña; se verifica con una prueba que comprueba que cada capítulo disponible tiene guion y contenido en los dos idiomas
- [ ] 1.6 Cargar el contenido de cada capítulo con `import()` en el idioma activo; se verifica en la pestaña de red que la portada no descarga los textos de los capítulos
- [ ] 1.7 Reemplazar en `tests/architecture.test.js` la regla de `prototipos/` por la de `src/teoria/` (D2) y adaptar las pruebas `tests/teoria-*.test.js` a las rutas nuevas; se verifica con `npm test`

## 2. Estado de la figura e idioma (Opus)

- [ ] 2.1 Implementar el estado de la figura por tramo (D4) como módulo sin DOM: entrar, cambiar, volver y restablecer; se verifica con pruebas del núcleo de esos cuatro casos
- [ ] 2.2 Conectar ese estado a la película: al entrar a un tramo la figura toma su estado, y el aviso junto a "Restablecer" aparece solo si hay cambios; se verifica con los tres escenarios de "La figura sigue al tramo"
- [ ] 2.3 Tomar el idioma inicial con la regla de la app y cambiarlo en vivo sin perder el tramo ni el estado de la figura (D6); se verifica cambiando de idioma en el tramo 3 con una perilla movida
- [ ] 2.4 Sumar la prueba de que los dos idiomas tienen las mismas claves en todo `contenido/`; se verifica con `npm test`

## 3. Portada y disposición (Fable)

- [ ] 3.1 Diseñar la portada: la historia primero, después el temario del 0 al 9 con número, título y frase, y "próximamente" en los siete que faltan; se verifica que un capítulo sin escribir no se abre ni con el teclado
- [ ] 3.2 Poner siempre a la vista volver a la portada, el selector de idioma e "Ir a la app"; se verifica en la portada, en un capítulo y en la historia
- [ ] 3.3 Llevar la disposición de la película a los anchos de 360 a 600 px (D5): figura arriba con tope del 60 % del alto, índice plegado, barra reducida; se verifica a 360×640, 390×844 y 600×900 sin desplazamiento horizontal ni superposición
- [ ] 3.4 Hacer que la figura deje de quedar fija cuando no entra en su tamaño mínimo (D5); se verifica a 360×560
- [ ] 3.5 Comprobar el manejo con el dedo de las perillas y del punto del plano con la emulación táctil del navegador; se verifica moviendo cada control
- [ ] 3.6 Escribir los textos de la portada y de la barra en español y en inglés; se verifica con la prueba de claves

## 4. Capítulo 1, "Una neurona" (Fable)

- [ ] 4.1 Revisar el guion con D4: que ningún tramo dependa de lo cambiado en otro; se verifica recorriendo los seis tramos después de mover perillas en cada uno
- [ ] 4.2 Sumar el bloque de fuentes al cierre, a partir de `teoria-prototipos/revision-contenido.md`; se verifica que estén en los dos idiomas
- [ ] 4.3 Comprobar la ayuda breve de cada control (una línea, fuera de la figura, sin ayuda en el punto del plano) en español y en inglés; se verifica con mouse y con teclado

## 5. Historia completa (Fable, con revisión de contenido)

- [ ] 5.1 Escribir en español los siete hitos nuevos de D8, cada uno con año, título, quién, texto y vínculo con capítulo y pestaña; se verifica con la prueba de campos por hito
- [ ] 5.2 Revisar los siete hitos contra fuentes (D10) y dejar `revision-contenido-historia.md` en la carpeta del cambio; se verifica que cada afirmación tenga veredicto. La hace la sesión principal: detenerse y pedirla
- [ ] 5.3 Aplicar las correcciones de 5.2, confirmar o cambiar los vínculos propuestos y escribir los hitos en inglés; se verifica contra el informe
- [ ] 5.4 Dibujar en SVG la imagen de cada hito nuevo, con su descripción en texto; se verifica a 1440×900 y a 390×844 que ninguna se corta
- [ ] 5.5 Rehacer la línea de tiempo para doce marcas, a escala por tramos con el corte marcado (D8); se verifica que ninguna marca pisa a otra de 360 a 1440 px
- [ ] 5.6 Sumar el bloque de fuentes de la historia, marcando lo que descansa en fuentes secundarias; se verifica en los dos idiomas

## 6. Capítulo 0, "Programar o aprender"

- [ ] 6.1 (Opus) Escribir `capitulos/programar/cuenta.js` sin DOM: evaluar una y dos reglas sobre una lista de situaciones y la búsqueda por barrido del umbral, determinista; se verifica con pruebas del núcleo (aciertos, empate, mismo resultado en cada corrida)
- [ ] 6.2 (Fable) Escribir el guion de seis tramos de D9 con el estado de la figura por tramo; se verifica con la prueba de campos por tramo y con una prueba de que la respuesta de la predicción sale de la cuenta
- [ ] 6.3 (Fable) Dibujar la figura: el auto, la lista de situaciones con acierto o error (con forma además de color) y la regla con su perilla; se verifica que mover el umbral cambia los aciertos en el momento
- [ ] 6.4 (Fable) Sumar la segunda regla, "Buscar" y el desafío, con "Restablecer" y la ayuda breve de cada control en español y en inglés; se verifica con mouse, teclado y dedo emulado
- [ ] 6.5 (Fable) Escribir los textos en español, con el cierre que nombra Reglas a mano y Entrenar; se verifica leyendo el capítulo entero
- [ ] 6.6 Revisar el contenido contra fuentes y contra la app (D10) y dejar `revision-contenido-programar.md`; se verifica que cada afirmación tenga veredicto. La hace la sesión principal: detenerse y pedirla
- [ ] 6.7 (Fable) Aplicar las correcciones, escribir el inglés y el bloque de fuentes; se verifica contra el informe y con la prueba de claves

## 7. Capítulo 2, "Una recta no alcanza"

- [ ] 7.1 (Opus) Escribir `capitulos/xor/cuenta.js` sin DOM: la red de una, dos y tres neuronas con `createNetwork`, las rectas de las neuronas ocultas y cuántos puntos del XOR da bien; se verifica con pruebas del núcleo (una neurona nunca pasa de 3 de 4 en una grilla de pesos; existe una red 2-2-1 que da 4 de 4)
- [ ] 7.2 (Fable) Escribir el guion de seis tramos de D9; se verifica con la prueba de campos y con la de la predicción
- [ ] 7.3 (Fable) Dibujar la figura: el plano con los cuatro puntos y la red que crece de una a tres neuronas, la misma figura transformándose; se verifica que cada recta se mueve con las perillas de su neurona
- [ ] 7.4 (Fable) Sumar la predicción, el desafío, "Restablecer" y la ayuda breve en español y en inglés; se verifica con mouse, teclado y dedo emulado
- [ ] 7.5 (Fable) Escribir los textos en español, con el cierre que nombra Laboratorio, XOR; se verifica leyendo el capítulo entero
- [ ] 7.6 Revisar el contenido contra fuentes (D10) y dejar `revision-contenido-xor.md`; se verifica que cada afirmación tenga veredicto. La hace la sesión principal: detenerse y pedirla
- [ ] 7.7 (Fable) Aplicar las correcciones, escribir el inglés y el bloque de fuentes; se verifica contra el informe y con la prueba de claves

## 8. Accesibilidad (Fable)

- [ ] 8.1 Recorrer portada, historia y los tres capítulos solo con el teclado, con el foco visible; se verifica llegando a cada control, a la predicción y al cierre
- [ ] 8.2 Dar a cada figura su descripción en texto, que cambia con el estado; se verifica leyendo el árbol de accesibilidad en tres tramos
- [ ] 8.3 Respetar `prefers-reduced-motion` y el límite de tres destellos por segundo en todo lo nuevo; se verifica emulando movimiento reducido
- [ ] 8.4 Comprobar el contraste de textos y de bordes de controles con los tokens; se verifica con `src/render/contrast.js` o midiendo, sin ningún color fuera de `styles/tokens.css`

## 9. Enlaces con la práctica (Opus)

- [ ] 9.1 Sacar capturas del antes de la barra de la V1 y de la V2 a 1440×900 y a 1032 px de ancho; se verifica que estén en `borradores/seccion-teoria/`
- [ ] 9.2 Sumar el enlace "Teoría" a la barra de la V1, en otra pestaña, con su tooltip "qué hace / por qué importa" y sus textos en español y en inglés; se verifica que un entrenamiento en marcha sigue al usarlo
- [ ] 9.3 Sumar el mismo enlace a la barra de la V2, con tooltip y textos en los dos idiomas; se verifica desde dos etapas
- [ ] 9.4 Comprobar que la barra de la V1 no desborda más que antes a 1032 px; se verifica midiendo el desborde antes y después
- [ ] 9.5 Sacar las capturas del después de las dos barras, con las mismas vistas, y ponerlas lado a lado en `borradores/seccion-teoria/comparacion.md`; se verifica que cubre las cuatro vistas

## 10. Cierre

- [ ] 10.1 Borrar `prototipos/teoria/`; se verifica con `npm test` en verde y sin referencias a `prototipos/` en el repositorio
- [ ] 10.2 Sumar al `README.md` la dirección de la teoría y cómo se agrega un capítulo; se verifica siguiendo esos pasos tal como están escritos
- [ ] 10.3 Pasar a `PENDIENTES.md` lo que quedó: los siete capítulos, lo no probado (personas, lector de pantalla, Firefox, Safari) y el destino del enlace a la app; se verifica leyendo la nota
- [ ] 10.4 Verificar en el navegador la sección entera contra el filtro de entrada (concepto, se entiende sola, se puede ignorar, vuelta atrás), en español y en inglés, a 1440×900 y a 390×844, con capturas en `borradores/seccion-teoria/`; se verifica sin errores en la consola

## Workflow follow-up

- Archivar `teoria-prototipos` antes de empezar (tiene todas sus tareas hechas).
- Archivar este cambio cuando el dueño lo revise.
- Proponer los dos cambios siguientes: capítulos 3 a 6 y capítulos 7 a 9.
