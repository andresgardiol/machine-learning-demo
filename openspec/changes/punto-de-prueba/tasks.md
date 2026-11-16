# Tareas

## 1. El punto

- [x] 1.1 Estado: posición del punto de prueba en la pestaña (design.md D6), con pruebas de que se conserva al cambiar de forma, reiniciar pesos y volver a la pestaña.
  *Hecho. La posición vive en la sesión del Laboratorio (`session.probe`, `setProbe` con tope en −1 y 1), que se conserva mientras la pestaña conserva su estado; empieza en (0, 0). Prueba en `tests/probe-point.test.js`: no se mueve al cambiar la forma de los datos, reiniciar los pesos ni cambiar la red, y los datos no cambian por él. Volver a la pestaña: verificado en el navegador con el grupo 4.*
- [x] 1.2 `plane-view.js` y el tablero: marcador HTML sobre el plano (D2), con su CSS en el mismo guardado; arrastrar, clic en el plano y flechas (D3); coordenadas entre −1 y 1. Pruebas de la conversión entre píxeles y coordenadas y del tope. Verificar "Al abrir", "Arrastrar", "Clic en el plano", "Con el teclado", "Dentro del plano", "Blanco cómodo" y "Distinto de los ejemplos".
  *Hecho. `plane-view.js` suma funciones puras (`planeGeometry`, `planeToPx`, `pxToPlane` con tope y centésimos, `nudgeProbe`, `probeLabelBox`, `probeAnswer`) y `geometry`. En el tablero, un `button` `.plane-probe` (28 × 28 px de agarre, aro de 20 px con cruz, `data-focus="keep"`, tooltip `lab.probe`). El plano pasa de `role="img"` a `role="group"`, porque tiene un control adentro; conserva su descripción. Arrastrar (con captura del puntero), clic en el plano (lleva el punto ahí y sigue como arrastre) y flechas (0,05; 0,01 con Mayúsculas). 7 pruebas. Verificado sin ventana a 1440×900 y 1366×768 con mouse y teclas de verdad: al abrir está en (0, 0); arrastrado a (0,30; −0,45) la respuesta cambia a mitad del arrastre; clic en el plano a (−0,60; 0,60); flechas → (−0,55; 0,61); más allá de los cuatro bordes queda en ±1; agarre de 28 × 28; el foco queda en el marcador (no se va al escenario); ningún tooltip arrastrando. Capturas `prueba-1.2-*.png`.*
- [x] 1.3 Rótulo junto al marcador con la respuesta, o con el valor de la neurona elegida (D4); no tapa el marcador ni sale del plano, tampoco en las cuatro esquinas. Verificar "Respuesta junto al punto", "Mientras aprende" y "Con una neurona elegida".
  *Hecho. Rótulo HTML junto al marcador: "naranja (círculo) · 92 %" (la clase con su forma y la seguridad, max(y, 1 − y)); con una neurona oculta elegida, "neurona 2: 0,97". Ubicado con `probeLabelBox` (a la derecha, a la izquierda, arriba, abajo o en diagonal). Verificado: no tapa el marcador y queda dentro del plano en el centro, en otros dos lugares y en las cuatro esquinas, a los dos tamaños; quieto mientras la red aprende pasó de "azul · 52 %" a "naranja · 74 %". Capturas `prueba-1.3-*.png`.*
- [x] 1.4 Con "Tu manejo" no hay marcador ni nada suyo. Verificar "Con tu manejo".
  *Verificado: con "Tu manejo" el plano está oculto y el marcador y su rótulo no se ven (0 rectángulos en pantalla).*

## 2. La red

- [ ] 2.1 `lab/index.js`: sin ejemplo en curso a la vista, la cuenta es la del punto de prueba, no la del primer ejemplo; con cambios a mano incluidos. Verificar "Entradas del punto", "Con cambios a mano" y "Mismo punto, misma respuesta", en el diagrama y en la tabla de pesos.
- [ ] 2.2 Convivencia con el paso a paso (D5): qué muestra la red en cada caso, mover el punto con un ejemplo a medio corregir, marcador tenue. Prueba de que mover el punto no cambia pesos, época ni curvas. Verificar "Ejemplo paso a paso", "Volver al punto", "Sin efecto en el aprendizaje" y "Reproduciendo de a ejemplos".
- [ ] 2.3 Franja bajo la red: de quién es la cuenta (`describe.js`, `es.js`, `en.js`). Verificar "Sin ejemplo en curso" y "De quién es la cuenta".
- [ ] 2.4 Tarjeta de las entradas x e y con deslizador que mueve el punto. Verificar "Deslizador de una entrada" y que la tarjeta sigue entrando en el panel a 1440×900 y 1366×768.

## 3. Textos y acceso

- [ ] 3.1 Tooltip del marcador y oración de la guía (D7). `mlLab.auditTooltips()` no informa nada. Medir el panel a 1440×900 y 1366×768 antes y después: **si deja de entrar o pierde una fila, parar y consultar.**
- [ ] 3.2 Lector de pantalla y teclado: nombre del marcador, anuncio al soltar y con las flechas, no durante el arrastre; el foco no se va al escenario al hacer clic en el plano (`data-focus="keep"` si hace falta).
- [ ] 3.3 Tres marcas a la vez en el plano (punto de prueba, ejemplo en curso, punto elegido en la tabla de datos): captura y comprobación de que se distinguen.

## 4. Cierre

- [ ] 4.1 Fluidez: arrastrar el punto durante 10 s con la red 2-8-8-8-1 aprendiendo de a épocas; mediana y peor intervalo entre cuadros.
- [ ] 4.2 Capturas en la carpeta de notas a 1440×900 y 1366×768: punto en zona segura, punto en la frontera, con una neurona elegida, y con un ejemplo paso a paso.
- [ ] 4.3 PENDIENTES.md: lo que quedó afuera (design.md) y lo no probado.
- [ ] 4.4 `npm test` y `openspec validate punto-de-prueba --strict`.
