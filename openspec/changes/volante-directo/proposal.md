# Proposal

## Why

El dueño probó a mano el volante suave de `manejo-amable-y-competir-sin-cortes` (19 de noviembre de 2026) y lo rechazó: "ahora el manejo se siente feo, tarda mucho en responder a las flechitas el auto, no me gusto, volvelo atras". Era la prueba que había quedado pendiente: que la subida de 0,3 s se sintiera bien era una hipótesis.

**Concepto que hace visible.** Ninguno nuevo. Vuelve el manejo con el teclado a como era antes: cada flecha es sí o no y responde en el mismo cuadro.

## What Changes

- **Se quita el volante suave del controlador de teclado.** Izquierda y derecha se devuelven mientras la flecha está apretada, desde el primer cuadro, como antes de `2474a7f`. Vale en El problema, Competir ("Vos"), Inspeccionar ("Manejar vos") y en la grabación del Laboratorio.
- **"Lo que estás accionando" vuelve a encender entera** la tecla de Izquierda o Derecha, sin el relleno proporcional ni el porcentaje, ni su tooltip del volante.
- **Se quedan** la cinta del manejo y el cartel de primer manejo. En la cinta, Izquierda y Derecha vuelven a verse encendidas en todos los cuadros en que la flecha estuvo apretada.
- Se borran `src/input/steering.js` y sus pruebas, y los textos del volante en los dos idiomas.

Fuera de alcance:
- otra forma de suavizar el manejo (tiempo de subida más corto, `TURN_RATE`, velocidad por defecto). Queda anotado en `PENDIENTES.md` por si el dueño la quiere más adelante;
- tocar la cinta, el cartel o Competir.

**Filtro de entrada.** No agrega una feature: vuelve a un comportamiento ya aprobado. Se vuelve atrás con un `git revert` de este cambio.

**Público.** El manejo responde al instante, como antes, para los dos públicos.

## Capabilities

### Modified Capabilities
- `controladores`: *Controlador de teclado* vuelve a su texto anterior; se quita *Volante suave*.
- `pestana-conducir`: *Acción visible* vuelve a su texto anterior.

## Impact

- `src/input/keyboard.js`, `src/input/steering.js` (se borra), `src/tabs/drive/index.js`, `src/tabs/inspect/index.js` y `driver.js`, `src/tabs/lab/index.js`, `src/tabs/shared/driving-cards.js`, `src/i18n/es.js` y `en.js`, `styles/app.css` si hay estilos del relleno.
- Pruebas: `steering*.test.js` se borran; `keyboard`, `inspect-driver`, `shortcuts-toggle` y `world-circuit` vuelven a esperar el comportamiento directo.
- No toca el núcleo. Los cerebros y los programas no cambian.
