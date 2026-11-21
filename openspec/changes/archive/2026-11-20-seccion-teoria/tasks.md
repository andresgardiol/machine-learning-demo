# Tasks

Cada grupo dice quién lo hace (design.md D11): **Opus** (armazón, cuentas, pruebas) o **Fable**
(figuras, dibujos, textos, disposición).

## 1. Armazón y mudanza (Opus)

- [x] 1.1 Comprobar que el trabajo de `teoria-prototipos` tenga commit antes de mudar nada; si no lo tiene, detenerse y consultar. Se verifica con `git status` sin archivos de `prototipos/` sin seguimiento
- [x] 1.2 Crear `teoria/index.html`, `styles/teoria.css` y `src/teoria/` con la estructura de D2; se verifica abriendo `/teoria/` sin errores en la consola
- [x] 1.3 Mudar de `prototipos/teoria/` las figuras, la película, la historia, el contenido y los estilos (D3), sin `libro/` ni `pasos/`; se verifica que "Una neurona" y la historia se ven igual que en el prototipo
- [x] 1.4 Escribir `rutas.js` con las direcciones de D1 (portada, historia, capítulo, tramo, desconocida) como funciones puras; se verifica con pruebas en `tests/`
- [x] 1.5 Escribir `capitulos/indice.js` con los diez capítulos, su número, si están disponibles y su pestaña; se verifica con una prueba que comprueba que cada capítulo disponible tiene guion y contenido en los dos idiomas
- [x] 1.6 Cargar el contenido de cada capítulo con `import()` en el idioma activo; se verifica en la pestaña de red que la portada no descarga los textos de los capítulos
- [x] 1.7 Reemplazar en `tests/architecture.test.js` la regla de `prototipos/` por la de `src/teoria/` (D2) y adaptar las pruebas `tests/teoria-*.test.js` a las rutas nuevas; se verifica con `npm test`

## 2. Estado de la figura e idioma (Opus)

- [x] 2.1 Implementar el estado de la figura por tramo (D4) como módulo sin DOM: entrar, cambiar, volver y restablecer; se verifica con pruebas del núcleo de esos cuatro casos
- [x] 2.2 Conectar ese estado a la película: al entrar a un tramo la figura toma su estado, y el aviso junto a "Restablecer" aparece solo si hay cambios; se verifica con los tres escenarios de "La figura sigue al tramo"
- [x] 2.3 Tomar el idioma inicial con la regla de la app y cambiarlo en vivo sin perder el tramo ni el estado de la figura (D6); se verifica cambiando de idioma en el tramo 3 con una perilla movida
- [x] 2.4 Sumar la prueba de que los dos idiomas tienen las mismas claves en todo `contenido/`; se verifica con `npm test`

## 3. Portada y disposición (Fable)

- [x] 3.1 Diseñar la portada: la historia primero, después el temario del 0 al 9 con número, título y frase, y "próximamente" en los que todavía no estén disponibles; se verifica que un capítulo sin escribir no se abre ni con el teclado
- [x] 3.2 Poner siempre a la vista volver a la portada, el selector de idioma e "Ir a la app"; se verifica en la portada, en un capítulo y en la historia
- [x] 3.3 Llevar la disposición de la película a los anchos de 360 a 600 px (D5): figura arriba con tope del 60 % del alto, índice plegado, barra reducida; se verifica a 360×640, 390×844 y 600×900 sin desplazamiento horizontal ni superposición
- [x] 3.4 Hacer que la figura deje de quedar fija cuando no entra en su tamaño mínimo (D5); se verifica a 360×560
- [x] 3.5 Comprobar el manejo con el dedo de las perillas y del punto del plano con la emulación táctil del navegador; se verifica moviendo cada control
- [x] 3.6 Escribir los textos de la portada y de la barra en español y en inglés; se verifica con la prueba de claves

## 4. Capítulo 1, "Una neurona" (Fable)

- [x] 4.1 Revisar el guion con D4: que ningún tramo dependa de lo cambiado en otro; se verifica recorriendo los seis tramos después de mover perillas en cada uno
- [x] 4.2 Sumar el bloque de fuentes al cierre, a partir de `teoria-prototipos/revision-contenido.md`; se verifica que estén en los dos idiomas
- [x] 4.3 Comprobar la ayuda breve de cada control (una línea, fuera de la figura, sin ayuda en el punto del plano) en español y en inglés; se verifica con mouse y con teclado

## 5. Historia completa (Fable, con revisión de contenido)

- [x] 5.1 Escribir en español los siete hitos nuevos de D8, cada uno con año, título, quién, texto y vínculo con capítulo y pestaña; se verifica con la prueba de campos por hito
- [x] 5.2 Revisar los siete hitos contra fuentes (D10) y dejar `revision-contenido-historia.md` en la carpeta del cambio; se verifica que cada afirmación tenga veredicto. La hace la sesión principal: detenerse y pedirla
- [x] 5.3 Aplicar las correcciones de 5.2, confirmar o cambiar los vínculos propuestos y escribir los hitos en inglés; se verifica contra el informe
- [x] 5.4 Dibujar en SVG la imagen de cada hito nuevo, con su descripción en texto; se verifica a 1440×900 y a 390×844 que ninguna se corta
- [x] 5.5 Rehacer la línea de tiempo para doce marcas, a escala por tramos con el corte marcado (D8); se verifica que ninguna marca pisa a otra de 360 a 1440 px
- [x] 5.6 Sumar el bloque de fuentes de la historia, marcando lo que descansa en fuentes secundarias; se verifica en los dos idiomas

## 6. Capítulo 0, "Programar o aprender"

- [x] 6.1 (Opus) Escribir `capitulos/programar/cuenta.js` sin DOM: evaluar una y dos reglas sobre una lista de situaciones y la búsqueda por barrido del umbral, determinista; se verifica con pruebas del núcleo (aciertos, empate, mismo resultado en cada corrida)
- [x] 6.2 (Fable) Escribir el guion de seis tramos de D9 con el estado de la figura por tramo; se verifica con la prueba de campos por tramo y con una prueba de que la respuesta de la predicción sale de la cuenta
- [x] 6.3 (Fable) Dibujar la figura: el auto, la lista de situaciones con acierto o error (con forma además de color) y la regla con su perilla; se verifica que mover el umbral cambia los aciertos en el momento
- [x] 6.4 (Fable) Sumar la segunda regla, "Buscar" y el desafío, con "Restablecer" y la ayuda breve de cada control en español y en inglés; se verifica con mouse, teclado y dedo emulado
- [x] 6.5 (Fable) Escribir los textos en español, con el cierre que nombra Reglas a mano y Entrenar; se verifica leyendo el capítulo entero
- [x] 6.6 Revisar el contenido contra fuentes y contra la app (D10) y dejar `revision-contenido-programar.md`; se verifica que cada afirmación tenga veredicto. La hace la sesión principal: detenerse y pedirla
- [x] 6.7 (Fable) Aplicar las correcciones, escribir el inglés y el bloque de fuentes; se verifica contra el informe y con la prueba de claves

## 7. Capítulo 2, "Una recta no alcanza"

- [x] 7.1 (Opus) Escribir `capitulos/xor/cuenta.js` sin DOM: la red de una, dos y tres neuronas con `createNetwork`, las rectas de las neuronas ocultas y cuántos puntos del XOR da bien; se verifica con pruebas del núcleo (una neurona nunca pasa de 3 de 4 en una grilla de pesos; existe una red 2-2-1 que da 4 de 4)
- [x] 7.2 (Fable) Escribir el guion de seis tramos de D9; se verifica con la prueba de campos y con la de la predicción
- [x] 7.3 (Fable) Dibujar la figura: el plano con los cuatro puntos y la red que crece de una a tres neuronas, la misma figura transformándose; se verifica que cada recta se mueve con las perillas de su neurona
- [x] 7.4 (Fable) Sumar la predicción, el desafío, "Restablecer" y la ayuda breve en español y en inglés; se verifica con mouse, teclado y dedo emulado
- [x] 7.5 (Fable) Escribir los textos en español, con el cierre que nombra Laboratorio, XOR; se verifica leyendo el capítulo entero
- [x] 7.6 Revisar el contenido contra fuentes (D10) y dejar `revision-contenido-xor.md`; se verifica que cada afirmación tenga veredicto. La hace la sesión principal: detenerse y pedirla
- [x] 7.7 (Fable) Aplicar las correcciones, escribir el inglés y el bloque de fuentes; se verifica contra el informe y con la prueba de claves

## 8. Accesibilidad (Fable)

- [x] 8.1 Recorrer portada, historia y los tres capítulos solo con el teclado, con el foco visible; se verifica llegando a cada control, a la predicción y al cierre
- [x] 8.2 Dar a cada figura su descripción en texto, que cambia con el estado; se verifica leyendo el árbol de accesibilidad en tres tramos
- [x] 8.3 Respetar `prefers-reduced-motion` y el límite de tres destellos por segundo en todo lo nuevo; se verifica emulando movimiento reducido
- [x] 8.4 Comprobar el contraste de textos y de bordes de controles con los tokens; se verifica con `src/render/contrast.js` o midiendo, sin ningún color fuera de `styles/tokens.css`

## 9. Enlaces con la práctica (Opus)

- [x] 9.1 Sacar capturas del antes de la barra de la V1 y de la V2 a 1440×900 y a 1032 px de ancho; se verifica que estén en `borradores/seccion-teoria/`
- [x] 9.2 Sumar el enlace "Teoría" a la barra de la V1, en otra pestaña, con su tooltip "qué hace / por qué importa" y sus textos en español y en inglés; se verifica que un entrenamiento en marcha sigue al usarlo
- [x] 9.3 Sumar el mismo enlace a la barra de la V2, con tooltip y textos en los dos idiomas; se verifica desde dos etapas
- [x] 9.4 Comprobar que la barra de la V1 no desborda más que antes a 1032 px; se verifica midiendo el desborde antes y después
- [x] 9.5 Sacar las capturas del después de las dos barras, con las mismas vistas, y ponerlas lado a lado en `borradores/seccion-teoria/comparacion.md`; se verifica que cubre las cuatro vistas

## 10. Cierre (después de los grupos 11 a 18)

- [x] 10.1 Borrar `prototipos/teoria/`; se verifica con `npm test` en verde y sin referencias a `prototipos/` en el repositorio
- [x] 10.2 Sumar al `README.md` la dirección de la teoría y cómo se agrega un capítulo; se verifica siguiendo esos pasos tal como están escritos
- [x] 10.3 Pasar a `PENDIENTES.md` lo que quedó: lo no probado (personas, lector de pantalla, Firefox, Safari) y el destino del enlace a la app; se verifica leyendo la nota
- [x] 10.4 Verificar en el navegador la sección entera contra el filtro de entrada (concepto, se entiende sola, se puede ignorar, vuelta atrás), en español y en inglés, a 1440×900 y a 390×844, con capturas en `borradores/seccion-teoria/`; se verifica sin errores en la consola

## 11. Capítulo 3, "La cuenta hacia adelante"

- [x] 11.1 (Opus) Escribir `capitulos/adelante/cuenta.js` sin DOM según D12, sobre el núcleo y sin modificarlo, con azar con semilla donde haga falta; se verifica con pruebas del núcleo de cada número que la figura muestra y de la solución conocida del desafío
- [x] 11.2 (Fable) Escribir el guion de seis tramos de D12 con el estado de la figura por tramo; se verifica con la prueba de campos y con la de que la respuesta de la predicción sale de la cuenta
- [x] 11.3 (Fable) Dibujar la figura, la misma transformándose de tramo en tramo, con significado por color y forma; se verifica que cada control cambia en el momento todo lo que depende de él
- [x] 11.4 (Fable) Sumar la predicción, el desafío, "Restablecer" y la ayuda breve de cada control en español y en inglés; se verifica con mouse, teclado y dedo emulado
- [x] 11.5 (Fable) Escribir los textos en español y en inglés, con el cierre que nombra Inspeccionar y el bloque "Para profundizar"; se verifica leyendo el capítulo entero y con la prueba de claves
- [x] 11.6 Revisar el contenido contra fuentes y contra la app (D10) y dejar `revision-contenido-adelante.md`; se verifica que cada afirmación tenga veredicto. La hace la sesión principal
- [x] 11.7 (Fable) Aplicar las correcciones, sumar el bloque de fuentes y marcar el capítulo como disponible; se verifica contra el informe, a 1440×900 y a 390×844

## 12. Capítulo 4, "Medir el error"

- [x] 12.1 (Opus) Escribir `capitulos/error/cuenta.js` sin DOM según D12, sobre el núcleo y sin modificarlo, con azar con semilla donde haga falta; se verifica con pruebas del núcleo de cada número que la figura muestra y de la solución conocida del desafío
- [x] 12.2 (Fable) Escribir el guion de seis tramos de D12 con el estado de la figura por tramo; se verifica con la prueba de campos y con la de que la respuesta de la predicción sale de la cuenta
- [x] 12.3 (Fable) Dibujar la figura, la misma transformándose de tramo en tramo, con significado por color y forma; se verifica que cada control cambia en el momento todo lo que depende de él
- [x] 12.4 (Fable) Sumar la predicción, el desafío, "Restablecer" y la ayuda breve de cada control en español y en inglés; se verifica con mouse, teclado y dedo emulado
- [x] 12.5 (Fable) Escribir los textos en español y en inglés, con el cierre que nombra Laboratorio y el bloque "Para profundizar"; se verifica leyendo el capítulo entero y con la prueba de claves
- [x] 12.6 Revisar el contenido contra fuentes y contra la app (D10) y dejar `revision-contenido-error.md`; se verifica que cada afirmación tenga veredicto. La hace la sesión principal
- [x] 12.7 (Fable) Aplicar las correcciones, sumar el bloque de fuentes y marcar el capítulo como disponible; se verifica contra el informe, a 1440×900 y a 390×844

## 13. Capítulo 5, "Corregir un poco cada vez"

- [x] 13.1 (Opus) Escribir `capitulos/corregir/cuenta.js` sin DOM según D12, sobre el núcleo y sin modificarlo, con azar con semilla donde haga falta; se verifica con pruebas del núcleo de cada número que la figura muestra y de la solución conocida del desafío
- [x] 13.2 (Fable) Escribir el guion de seis tramos de D12 con el estado de la figura por tramo; se verifica con la prueba de campos y con la de que la respuesta de la predicción sale de la cuenta
- [x] 13.3 (Fable) Dibujar la figura, la misma transformándose de tramo en tramo, con significado por color y forma; se verifica que cada control cambia en el momento todo lo que depende de él
- [x] 13.4 (Fable) Sumar la predicción, el desafío, "Restablecer" y la ayuda breve de cada control en español y en inglés; se verifica con mouse, teclado y dedo emulado
- [x] 13.5 (Fable) Escribir los textos en español y en inglés, con el cierre que nombra Laboratorio, tasa de aprendizaje y el bloque "Para profundizar"; se verifica leyendo el capítulo entero y con la prueba de claves
- [x] 13.6 Revisar el contenido contra fuentes y contra la app (D10) y dejar `revision-contenido-corregir.md`; se verifica que cada afirmación tenga veredicto. La hace la sesión principal
- [x] 13.7 (Fable) Aplicar las correcciones, sumar el bloque de fuentes y marcar el capítulo como disponible; se verifica contra el informe, a 1440×900 y a 390×844

## 14. Capítulo 6, "Repartir la culpa"

- [x] 14.1 (Opus) Escribir `capitulos/culpa/cuenta.js` sin DOM según D12, sobre el núcleo y sin modificarlo, con azar con semilla donde haga falta; se verifica con pruebas del núcleo de cada número que la figura muestra y de la solución conocida del desafío
- [x] 14.2 (Fable) Escribir el guion de seis tramos de D12 con el estado de la figura por tramo; se verifica con la prueba de campos y con la de que la respuesta de la predicción sale de la cuenta
- [x] 14.3 (Fable) Dibujar la figura, la misma transformándose de tramo en tramo, con significado por color y forma; se verifica que cada control cambia en el momento todo lo que depende de él
- [x] 14.4 (Fable) Sumar la predicción, el desafío, "Restablecer" y la ayuda breve de cada control en español y en inglés; se verifica con mouse, teclado y dedo emulado
- [x] 14.5 (Fable) Escribir los textos en español y en inglés, con el cierre que nombra Laboratorio y el bloque "Para profundizar"; se verifica leyendo el capítulo entero y con la prueba de claves
- [x] 14.6 Revisar el contenido contra fuentes y contra la app (D10) y dejar `revision-contenido-culpa.md`; se verifica que cada afirmación tenga veredicto. La hace la sesión principal
- [x] 14.7 (Fable) Aplicar las correcciones, sumar el bloque de fuentes y marcar el capítulo como disponible; se verifica contra el informe, a 1440×900 y a 390×844

## 15. Capítulo 7, "Aprender por evolución"

- [x] 15.1 (Opus) Escribir `capitulos/evolucion/cuenta.js` sin DOM según D12, sobre el núcleo y sin modificarlo, con azar con semilla donde haga falta; se verifica con pruebas del núcleo de cada número que la figura muestra y de la solución conocida del desafío
- [x] 15.2 (Fable) Escribir el guion de seis tramos de D12 con el estado de la figura por tramo; se verifica con la prueba de campos y con la de que la respuesta de la predicción sale de la cuenta
- [x] 15.3 (Fable) Dibujar la figura, la misma transformándose de tramo en tramo, con significado por color y forma; se verifica que cada control cambia en el momento todo lo que depende de él
- [x] 15.4 (Fable) Sumar la predicción, el desafío, "Restablecer" y la ayuda breve de cada control en español y en inglés; se verifica con mouse, teclado y dedo emulado
- [x] 15.5 (Fable) Escribir los textos en español y en inglés, con el cierre que nombra Entrenar y el bloque "Para profundizar"; se verifica leyendo el capítulo entero y con la prueba de claves
- [x] 15.6 Revisar el contenido contra fuentes y contra la app (D10) y dejar `revision-contenido-evolucion.md`; se verifica que cada afirmación tenga veredicto. La hace la sesión principal
- [x] 15.7 (Fable) Aplicar las correcciones, sumar el bloque de fuentes y marcar el capítulo como disponible; se verifica contra el informe, a 1440×900 y a 390×844

## 16. Capítulo 8, "Generalizar o memorizar"

- [x] 16.1 (Opus) Escribir `capitulos/generalizar/cuenta.js` sin DOM según D12, sobre el núcleo y sin modificarlo, con azar con semilla donde haga falta; se verifica con pruebas del núcleo de cada número que la figura muestra y de la solución conocida del desafío
- [x] 16.2 (Fable) Escribir el guion de seis tramos de D12 con el estado de la figura por tramo; se verifica con la prueba de campos y con la de que la respuesta de la predicción sale de la cuenta
- [x] 16.3 (Fable) Dibujar la figura, la misma transformándose de tramo en tramo, con significado por color y forma; se verifica que cada control cambia en el momento todo lo que depende de él
- [x] 16.4 (Fable) Sumar la predicción, el desafío, "Restablecer" y la ayuda breve de cada control en español y en inglés; se verifica con mouse, teclado y dedo emulado
- [x] 16.5 (Fable) Escribir los textos en español y en inglés, con el cierre que nombra Competir y el bloque "Para profundizar"; se verifica leyendo el capítulo entero y con la prueba de claves
- [x] 16.6 Revisar el contenido contra fuentes y contra la app (D10) y dejar `revision-contenido-generalizar.md`; se verifica que cada afirmación tenga veredicto. La hace la sesión principal
- [x] 16.7 (Fable) Aplicar las correcciones, sumar el bloque de fuentes y marcar el capítulo como disponible; se verifica contra el informe, a 1440×900 y a 390×844

## 17. Capítulo 9, "Qué quedó adentro"

- [x] 17.1 (Opus) Escribir `capitulos/adentro/cuenta.js` sin DOM según D12, sobre el núcleo y sin modificarlo, con azar con semilla donde haga falta; se verifica con pruebas del núcleo de cada número que la figura muestra y de la solución conocida del desafío
- [x] 17.2 (Fable) Escribir el guion de seis tramos de D12 con el estado de la figura por tramo; se verifica con la prueba de campos y con la de que la respuesta de la predicción sale de la cuenta
- [x] 17.3 (Fable) Dibujar la figura, la misma transformándose de tramo en tramo, con significado por color y forma; se verifica que cada control cambia en el momento todo lo que depende de él
- [x] 17.4 (Fable) Sumar la predicción, el desafío, "Restablecer" y la ayuda breve de cada control en español y en inglés; se verifica con mouse, teclado y dedo emulado
- [x] 17.5 (Fable) Escribir los textos en español y en inglés, con el cierre que nombra Inspeccionar y el bloque "Para profundizar"; se verifica leyendo el capítulo entero y con la prueba de claves
- [x] 17.6 Revisar el contenido contra fuentes y contra la app (D10) y dejar `revision-contenido-adentro.md`; se verifica que cada afirmación tenga veredicto. La hace la sesión principal
- [x] 17.7 (Fable) Aplicar las correcciones, sumar el bloque de fuentes y marcar el capítulo como disponible; se verifica contra el informe, a 1440×900 y a 390×844

## 18. "Para profundizar" y repaso del conjunto (Fable)

- [x] 18.1 Sumar el bloque plegado "Para profundizar" a los capítulos 0, 1 y 2, cerrado por defecto, manejable con el teclado; se verifica que abre y cierra y que no cambia el largo del capítulo al estar cerrado
- [x] 18.2 Leer los diez capítulos de corrido y comprobar que cada uno usa los nombres que el anterior dejó y que ninguno usa un término antes de nombrarlo; se verifica con una lista de términos y el tramo donde se nombra cada uno, en `borradores/seccion-teoria/terminos.md`
- [x] 18.3 Actualizar la historia: 1986 y 1998 enlazan al capítulo 6; se verifica desde los dos hitos

## 19. Navegación de la teoría y enlace con más jerarquía (revisión del dueño, 20 de noviembre)

- [x] 19.1 (Fable) Al final de la historia y de cada capítulo, un bloque "seguir leyendo": botón principal a lo que sigue (número, título y frase) y botón secundario al temario; el último capítulo, sin "siguiente"; en español y en inglés; se verifica desde la historia, el capítulo 3 y el 9, con mouse y con teclado
- [x] 19.2 (Fable) Al volver a la portada desde la historia o un capítulo, el temario queda a la altura de esa tarjeta, señalada; la primera visita abre desde arriba; se verifica con el enlace de la barra, con el botón del final y con "atrás" del navegador
- [x] 19.3 (Fable) Título de la portada que diga de qué teoría se trata, con el `<title>` de la página; se verifica en los dos idiomas, a 1440×900 y a 390×844, con capturas del antes y del después
- [x] 19.4 (Opus) En la V1, el enlace "Teoría" pasa de ícono entre las herramientas a un enlace con nombre a la altura de las pestañas, separado y con marca de que abre otra página; se verifica que no desborda a 1032 px y con capturas del antes y del después
- [x] 19.5 (Opus) Lo mismo en la V2, a la altura de las etapas; se verifica desde dos etapas, con capturas

## Workflow follow-up

- Archivar `teoria-prototipos` antes de empezar (tiene todas sus tareas hechas).
- Archivar este cambio cuando el dueño lo revise.
