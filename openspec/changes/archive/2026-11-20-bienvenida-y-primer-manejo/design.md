# Design

## Context

Lo que sigue se leyó en el código el 20 de noviembre de 2026. No se midió nada.

- **Cámara** (`src/render/camera.js`). Cuando sigue al auto, lo ubica en un
  punto fijo de la pantalla, `anchor`, en fracciones del ancho y del alto.
  `pan(dx, dy)` corre el centro y pone `following = false`. `zoomAt` ya hace
  lo que se quiere para el paneo: recalcula `anchor` con la nueva posición
  del auto en la pantalla y deja de seguirlo solo si el auto queda afuera.
  `reset()` y `follow()` vuelven al `baseAnchor`. Con el zoom al mínimo en un
  circuito (`frameCenter`), `update()` centra el circuito y no al auto.
- **Quién llama a `pan`**: el arrastre de `src/render/view.js` (el
  escenario), `src/render/network-inspector.js` (el diagrama de la red) y
  el recorrido con teclado de Inspeccionar y del Laboratorio (para centrar
  una neurona). También las copias de la V2.
- **El problema** (`src/tabs/drive/index.js`). El bucle llama a
  `world.step()` en cada paso. El reloj del mundo avanza aunque el auto esté
  parado, y el tráfico es una función pura de `(semilla, configuración,
  tiempo)` (`core/traffic.js`). Por eso hoy el tráfico se va antes de la
  primera tecla. La pestaña ya detecta la primera tecla de manejo del
  intento para la cinta (`tapeStarted`) y para el cartel de primer manejo.
  `options.showSensors` arranca en `true`.
- **Diálogos** (`src/ui/app.js`). Los créditos son un `<dialog>` con
  `showModal()`. `ui/shortcuts.js` ya descarta los atajos cuando el foco
  está dentro de un `dialog`. Las preferencias (`ui/preferences.js`) leen y
  escriben `localStorage` dentro de un `try`.

## Goals / Non-Goals

**Goals:**
- Que el paneo del escenario corra el encuadre sin perder al auto.
- Que en El problema el tráfico espere a la primera tecla de manejo de cada
  intento, sin tocar el núcleo.
- Que los rayos arranquen ocultos en El problema.
- Que haya una ventana de bienvenida que salga una vez por navegador y se
  pueda reabrir.

**Non-Goals:**
- Cambiar el paneo del diagrama de la red y el centrado por teclado de
  Inspeccionar y del Laboratorio.
- Hacer esperar al tráfico en otras pestañas.
- Hacer el recorrido guiado.
- Tocar la V2.

## Decisions

### D1. El paneo con auto seguido corre `anchor`, en el escenario solamente

Se agrega a la cámara un paneo que recibe el auto seguido:
`panFollowing(dx, dy, vp, target)`, o `pan(dx, dy, vp, target)` con
argumentos opcionales. Hace lo mismo que `zoomAt`: mueve el centro y, si
sigue al auto, recalcula `anchor` con `worldToScreen(target)`. Si el auto
queda fuera de `[0, 1] × [0, 1]`, pone `following = false`. Sin `target`,
o con el circuito entero a la vista (`frameCenter` y zoom al mínimo), se
comporta como `pan` hoy y deja la cámara libre.

`pan(dx, dy)` sin el auto queda igual. Así el diagrama de la red y el
centrado por teclado no cambian. Solo `view.js` pasa el auto seguido
(`lastTarget`) al arrastrar.

- Alternativa descartada: cambiar `pan` para todos. Rompería el centrado
  por teclado de Inspeccionar, que llama a `pan` y espera la cámara libre, y
  las pruebas de `tests/camera.test.js` que lo usan para soltarla.
- Alternativa descartada: guardar un desplazamiento aparte del `anchor`. El
  `anchor` ya es "dónde está el auto en la pantalla". Usarlo deja que el
  zoom y el paneo se compongan sin estado nuevo.

Con el auto seguido en un cambio de foco (Entrenar, Competir), la
transición `retarget` sigue igual, porque corre el objetivo y no el
`anchor`.

### D2. La espera vive en la pestaña, no en el núcleo

El problema no llama a `world.step()` mientras el intento no arrancó. El
intento arranca con la primera tecla de manejo: `KEY_BINDINGS`, sin
modificadores, fuera de campos de texto y sin un diálogo abierto. Se reusa
el mismo criterio que ya apaga el cartel de primer manejo. Para que no haya
un cuadro de diferencia, la marca se pone en el `keydown`, antes del
próximo paso del bucle.

`restartAttempt` (reiniciar, tráfico nuevo, cambio de pista o de ajuste que
rearma el mundo) vuelve a poner la espera. La cinta usa la misma marca:
`tapeStarted` pasa a ser "el intento arrancó", y con eso se borra la
condición duplicada del bucle.

Como el reloj del mundo no avanza durante la espera, el intento empieza en
`t = 0` igual que hoy, y con la misma semilla y las mismas teclas da el
mismo resultado paso a paso. El núcleo queda igual y sin DOM.

- Alternativa descartada: un modo "tráfico quieto" en `core/world.js`.
  Funciona, pero agrega estado al núcleo para algo que solo pide una
  pestaña.
- Con la pausa: si está en pausa, la tecla marca el arranque, pero
  `world.step()` no avanza hasta reanudar (el `step` del mundo ya no hace
  nada en pausa).
- Las misiones (`session.observe`) se siguen llamando durante la espera.
  No cambia nada, porque el mundo no se mueve.

### D3. Sensores: `showSensors: false` al montar

Es el valor inicial de `options` en `drive/index.js`. No se recuerda entre
visitas, igual que hoy. "Ver como la máquina" sigue forzando los rayos
(`showSensors || machineView`).

### D4. Bienvenida: un `<dialog>` modal en `app.js`, recordado en preferencias

- Se arma en `app.js`, como los créditos: título, dos o tres párrafos
  cortos, la acción principal "Empezar a manejar" (estilo de acción
  principal de `jerarquia-de-botones`) y una cruz de cerrar con
  `aria-label`. Todo con `i18n` y `help` (tooltip), así sigue el idioma
  activo sin código nuevo.
- Se abre con `showModal()` al terminar de montar la primera pestaña, solo
  si `preferences.welcomed` es falso. La nueva clave es
  `mlLab.welcomed = 'yes'`.
- Cualquier cierre (acción principal, cruz o Escape, que dispara el evento
  `close` del `<dialog>`) escribe `preferences.welcomed = true`. Un
  `localStorage` que falla deja la escritura sin efecto y la ventana vuelve
  en la próxima visita, que es lo que pide la spec.
- "Empezar a manejar" cierra la ventana, se asegura de estar en El problema
  y enfoca el escenario (`stage.focus({ preventScroll: true })`) para que la
  flecha arriba maneje sin otro clic.
- En los créditos se agrega "Ver la bienvenida", con estilo de enlace o
  secundario. Cierra los créditos y abre la bienvenida. No toca la marca.
- `main-action.js` ya contempla `dialogOpen`. Se verifica que la
  bienvenida cuente como diálogo abierto.

### D5. Teclas de manejo con un diálogo abierto

`ui/shortcuts.js` ya ignora los atajos dentro de un `dialog`, pero el
controlador de teclado (`input/keyboard.js`) y `onDrivingKey` escuchan en
`window`. Hay que confirmar en la implementación que una flecha con la
bienvenida abierta no mueve el auto ni arranca el intento. Si no es así, se
ignoran las teclas cuyo `target` está dentro de un `dialog` abierto, con
el mismo selector de `ui/shortcuts.js`.

## Risks / Trade-offs

- **Paneo en Entrenar y Competir.** El cambio de comportamiento alcanza a
  toda escena que sigue a un auto, no solo a El problema. Es lo que pidió el
  dueño ("panear sobre el escenario"), pero cambia la escena de Competir
  mientras se sigue a un competidor. Mitigación: Restablecer la vista
  devuelve el encuadre de siempre.
- **Tráfico quieto con la guía apagada.** Sin el cartel de primer manejo, la
  escena quieta puede parecer trabada. Hipótesis, sin probar: el auto parado
  en medio de la calle y la consigna de la tarjeta alcanzan. Si el dueño ve
  que no, se puede sumar más adelante una marca chica en la escena.
- **Bienvenida tapando la escena en una clase.** El mentor la cierra una vez
  por navegador. En una computadora compartida que borra el almacenamiento,
  sale cada vez y se cierra con Escape.
- **Rendimiento.** No cambia: durante la espera se dibuja igual pero no se
  avanza el mundo (menos trabajo). El paneo agrega un `worldToScreen` por
  evento de arrastre.
