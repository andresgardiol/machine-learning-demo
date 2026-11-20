# Tasks

## 1. Base compartida

- [x] 1.1 Crear `prototipos/teoria/` con la portada y las cuatro páginas vacías (D1); se verifica abriendo `http://localhost:8000/prototipos/teoria/` y cada enlace sin errores en la consola
- [x] 1.2 Escribir `estilos/teoria.css` solo con tokens de `styles/tokens.css`; se verifica que no haya ningún color `#rrggbb` propio en el archivo
- [x] 1.3 Sumar a `tests/architecture.test.js` la regla "nada fuera de `prototipos/` importa de `prototipos/`"; se verifica con `npm test`

## 2. Guion y textos

- [x] 2.1 Escribir en `contenido/es.js` los seis tramos de "Una neurona" (D2): pregunta, texto, estado de la figura y predicción; se verifica con una prueba que comprueba que cada tramo tiene sus campos
- [x] 2.2 Verificar contra una fuente las fechas y los nombres de los cinco hitos (D6) y escribirlos en `contenido/es.js`, cada uno con su capítulo y su pestaña; se verifica que la fuente quede anotada en el archivo
- [x] 2.3 Escribir `contenido/en.js` con los mismos tramos e hitos en inglés; se verifica con una prueba que compara que los dos idiomas tienen las mismas claves
- [x] 2.4 Elegir el idioma con el valor que guarda la app, y español si no hay (D7); se verifica cambiando el idioma en la app y recargando un prototipo

## 3. Figuras vivas

- [x] 3.1 Escribir `figuras/cuenta.js` sin DOM: la neurona con `createNetwork` y `computeDetailed`, y la recta que sale de sus pesos y su sesgo (D3); se verifica con pruebas del núcleo en `tests/` (suma, escalón, recta, y el AND resuelto)
- [x] 3.2 Dibujar la neurona con perillas de peso y de sesgo, con los colores y las formas de D4; se verifica que mover una perilla cambia la suma y la salida en el momento
- [x] 3.3 Dibujar el plano con la recta y los cuatro puntos, con `plane-view.js` si sirve sin tocarlo y, si no, con un SVG propio; se verifica que la recta se mueve con las perillas y que `git diff src/` queda vacío
- [x] 3.4 Agregar "Restablecer" a cada figura; se verifica que vuelve a los valores iniciales
- [x] 3.5 Agregar a cada control su tooltip "qué hace / por qué importa" en español y en inglés, y manejo con teclado; se verifica recorriendo la figura con Tab y flechas en los dos idiomas

## 4. Historia en película

- [x] 4.1 Armar la línea de tiempo fija con los cinco hitos y el avance por tramo con `IntersectionObserver` (D5, D6); se verifica desplazando con la rueda y con el teclado
- [x] 4.2 Dibujar en SVG la imagen de cada hito; se verifica a 1440×900 que ninguna se corta
- [x] 4.3 Mostrar en cada hito su capítulo y su pestaña, con "próximamente" en los capítulos que no existen; se verifica que "Una neurona" lleva a la portada de formas
- [x] 4.4 Respetar `prefers-reduced-motion` y el límite de tres destellos por segundo; se verifica emulando movimiento reducido en el navegador

## 5. "Una neurona" como libro

- [x] 5.1 Mostrar los seis tramos de corrido, con cada figura entre sus párrafos; se verifica leyendo de principio a fin sin errores en la consola
- [x] 5.2 Agregar un índice del capítulo para saltar a un tramo; se verifica que cada entrada lleva a su tramo
- [x] 5.3 Resolver la predicción y el desafío dentro de la página (elegir, después ver); se verifica que la respuesta no se ve antes de elegir

## 6. "Una neurona" por pasos

- [x] 6.1 Mostrar un tramo por pantalla, con Siguiente, Anterior y el avance (3 de 6); se verifica con mouse y con teclado
- [x] 6.2 Hacer que la predicción pida elegir antes de seguir, con respuesta en el momento; se verifica eligiendo bien y eligiendo mal
- [x] 6.3 Conservar el estado de la figura al pasar de tramo; se verifica que las perillas no vuelven solas a cero

## 7. "Una neurona" como película

- [x] 7.1 Fijar la figura y hacer pasar los seis tramos de texto al lado, con la figura yendo al estado de cada tramo (D5); se verifica desplazando hacia abajo y hacia arriba
- [x] 7.2 Dejar tocar la figura en los tramos que lo piden sin que el desplazamiento pise lo que la persona cambió; se verifica moviendo una perilla y desplazando un poco
- [x] 7.3 Respetar `prefers-reduced-motion`; se verifica emulándolo en el navegador

## 8. Mapa teoría y práctica

- [x] 8.1 Pasar a `PENDIENTES.md` los cinco temas de teoría sin práctica (D9), con su candidato a feature y rotulados como sin verificar en la app; se verifica que cada uno quede en "Ideas para más adelante"
- [x] 8.2 Anotar en `PENDIENTES.md` que la "Introducción guiada para quien llega sin la teoría" queda reemplazada por la sección teórica aparte; se verifica leyendo la nota

## 9. Comparación

- [x] 9.1 Verificar las cuatro páginas en el navegador contra el filtro de entrada (concepto, se entiende sola, se puede ignorar, vuelta atrás), en español y en inglés; se verifica sin errores en la consola y con `npm test` en verde
- [x] 9.2 Recorrer las tres formas con el guion de D8 a 1440×900 y sacar capturas de cada una; se verifica que estén en `borradores/teoria-prototipos/`
- [x] 9.3 Escribir `borradores/teoria-prototipos/comparacion.md` con lo observado por forma, rotulando qué es observado y qué no se probó; se verifica que cubre las tres formas y la historia
- [x] 9.4 Presentar la comparación al dueño para que elija la forma; se verifica con su decisión anotada en `PENDIENTES.md`

## 10. Revisión 1 del dueño (20 de noviembre de 2026)

- [x] 10.1 Sensores simétricos y que siempre terminan en algo: el borde de la calle, un cono o, con lectura 0, enteros; la cuenta en `figuras/sensores.js`, con prueba en `tests/teoria-sensores.test.js`
- [x] 10.2 Ayudas de una línea, chicas, con espera de 1,2 s, que se cierran al apretar o arrastrar y no tapan la figura; el punto y los casos del plano, sin ayuda a la vista y con descripción accesible
- [x] 10.3 Película: marcas del borde con el título corto de cada tramo; la predicción pide elegir (sin respuesta la figura no pasa al tramo 5 y el tramo lo dice, con enlace para volver), sin bloquear el desplazamiento
- [x] 10.4 Capturas de antes y después en `borradores/teoria-prototipos/revision-1/`, sumadas a `comparacion.md`

## 11. Revisión 2 del dueño (20 de noviembre de 2026)

El grupo 10 ya era la revisión 1; estas tareas van como grupo 11. La revisión pedía además tres variantes
de la película (A "Lado a lado", B "Escenario" y C "Pantalla completa"): el dueño eligió la A antes de
compararlas, y B y C se quitaron.

- [x] 11.1 Reproducir la superposición de `pelicula/` e `historia/` en ventanas angostas (1100, 960, 870, 720 y 600 px) y capturar el antes en `borradores/teoria-prototipos/revision-2/`
- [x] 11.2 Disposición angosta de la película: la figura nunca baja de 560 px de ancho; si no entra al costado va fija arriba y el texto pasa debajo; el índice se pliega en una tira; sin desplazamiento horizontal de 600 a 1440 px. La historia, igual (imagen de 360 px o más)
- [x] 11.3 Detalles de la figura: auto derecho con flecha y ruedas para la decisión, lectura separada del vehículo, leyenda en un renglón
- [x] 11.4 Correcciones de la revisión de contenido contra fuentes (`revision-contenido.md`: C1, C2, M1, M2, M3 y las fuentes originales en la cabecera de `es.js`), en español y en inglés
- [x] 11.5 Capturas del antes y del después en `borradores/teoria-prototipos/revision-2/` y sección nueva en `comparacion.md`

## Workflow follow-up

- Archivar el cambio cuando el dueño haya elegido.
- Abrir el cambio de la sección definitiva, que borra `prototipos/teoria/`.
