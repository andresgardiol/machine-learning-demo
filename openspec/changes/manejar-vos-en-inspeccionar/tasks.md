# Tareas

## 1. Núcleo

- [x] 1.1 `createObservedController` en `src/core/controller.js` (D1) con pruebas en `tests/`: los cuatro escenarios de "Controlador con observador" (maneja uno y observa otro, misma percepción, mismo recorrido con la misma semilla, cambiar quién maneja sin reiniciar). `npm test` en verde.
  *Hecho. `createObservedController({ driver, observer })` en `src/core/controller.js`, sin DOM: llama primero al que observa y después al que maneja (una sola llamada si son el mismo); expone `driven` y `observed` (los controles del último cuadro de cada uno), `perception`, `driver`, `observer`, `observing` y `setDriver`. Pruebas en `tests/observed-controller.test.js` (5): maneja "solo avanzar" con una red que decide izquierda y el auto sigue recto (ángulo 0) con `observed` = izquierda; el observador recibe el mismo objeto de percepción en los 120 cuadros; 600 cuadros con tráfico (semilla 7) dan el mismo recorrido, bit a bit, solo y con la red observando; `setDriver` a mitad del intento: el cuadro siguiente sigue la cuenta de pasos y ya dobla con la red; y una sola llamada con el mismo controlador en los dos lugares. `npm test`: 1280 en verde.*

## 2. Pestaña

- [ ] 2.1 `inspect/index.js`: el mundo usa el controlador con observador; `state.driver` (D2); con la red manejando nada cambia. Verificar "Estado por defecto" (misma escena con la misma semilla, antes y después) y que el paso a paso sigue igual.
- [ ] 2.2 Botón "Manejar vos" en la escena, foco en la escena, aviso (D5), paso a tiempo real de a cuadros. Verificar "Tomar el volante con el botón".
- [ ] 2.3 Flechas que toman el volante según el foco (D3). Verificar "Tomar el volante con una flecha", "Flechas dentro de la red" (diagrama, pastilla, deslizador del ritmo) y "Atajos apagados", con teclas de verdad.
- [ ] 2.4 Pausa y N con teclas apretadas; choque. Verificar "Pausa", "Un cuadro con N" y "Choque".
- [ ] 2.5 "Devolver el volante", volver a la red al ocultar la pestaña, cambiar de cerebro. Verificar los escenarios de "Devolver el volante".

## 3. Decisión

- [ ] 3.1 `actionCompare()` en `driving-cards.js` (D4) con su prueba de la cola de coincidencia (600 cuadros, porcentaje redondeado). Verificar "Coinciden", "No coinciden", "Cuánto coinciden" y "Con la red manejando".
- [ ] 3.2 Anuncios al lector como mucho cada 2 s (D4). Verificar "Lector de pantalla" leyendo la región de anuncios.

## 4. Textos y medidas

- [ ] 4.1 Textos en `es.js` y `en.js`: botones, aviso, filas, coincidencia, tooltips, oración de la guía. `mlLab.auditTooltips()` no informa nada. Verificar "Guía" y el tooltip de "Devolver el volante".
- [ ] 4.2 Medir a 1440×900 y 1366×768, en es y en, manejando y no: el tablero y el panel entran sin desplazar. **Si algo deja de entrar, parar y consultar.**
- [ ] 4.3 Fluidez: manejar 10 s con la red más grande disponible; mediana y peor intervalo entre cuadros, comparados con la red manejando.

## 5. Cierre

- [ ] 5.1 Verificación manual en el navegador contra el filtro de entrada de la propuesta, con capturas: manejando con las filas coincidiendo, sin coincidir, y la red sacando al auto de una situación armada.
- [ ] 5.2 PENDIENTES.md: lo no probado (por ejemplo, lector de pantalla real).
- [ ] 5.3 `npm test` y `openspec validate manejar-vos-en-inspeccionar --strict`.
