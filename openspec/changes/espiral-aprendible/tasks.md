# Tareas

## 1. La forma

- [x] 1.1 `cleanPoint`: la espiral con 1,25 vueltas por brazo. Actualizar las pruebas de `tests/datasets.test.js`. Verificar "Espiral" y "Misma semilla". *`SPIRAL_TURNS = 1.25` en `src/core/datasets.js`. Prueba nueva: el ángulo que recorre un brazo es 1,25 × 2π; la de los brazos enfrentados y la de "Misma semilla" siguen pasando.*
- [x] 1.2 Medir con `tools/measure-lab.mjs` (modo nuevo o `shapes` ampliado), con `pointsDataset` de verdad: épocas hasta 90 % en práctica y en apartados, cinco semillas, 200 puntos y ruido 10 %, tasa por defecto, para una capa de 4 (600 épocas), dos de 7 y dos de 8 (200 épocas). Anotar los números acá. Si dos de 7 o dos de 8 no llegan en las cinco semillas, o la capa de 4 llega en alguna, **detenerse y consultar** con la tabla. *Medido con `node tools/measure-lab.mjs spiral` (modo nuevo, `pointsDataset` de verdad, 200 puntos, ruido 10 %, semilla de puntos 1, 30 % apartados, tanh, tasa 0,1), épocas hasta 90 % en práctica y en apartados, semillas de pesos 1 a 5: una capa de 4, ninguna en 600; dos de 7, 45 / 57 / 68 / 59 / 62; dos de 8, 48 / 60 / 53 / 69 / 60. Se cumple: no hay parada. Los números del generador real son algo más rápidos que los de la copia de D1 (43 a 90 para dos de 8).*
- [x] 1.3 Prueba en `tests/lab-defaults.test.js`: con la espiral, dos capas de 8 llegan a 90 % en menos de 200 épocas con la primera semilla, y una capa de 4 no llega en 600. *Prueba en `tests/lab-defaults.test.js` con la primera semilla y la tasa por defecto: dos capas de 8 llegan en menos de 200 épocas (48) y una capa de 4 no llega en 600.*

## 2. Lo que se ve

- [x] 2.1 La miniatura de la espiral en la barra del Laboratorio muestra la forma nueva. Verificar "Miniatura" en el navegador. *La miniatura usa `SPIRAL_TURNS`, la misma constante que el generador (antes tenía su propio 1,75). Vista en el navegador: el botón de la espiral muestra los dos brazos de una vuelta y cuarto (captura `espiral-dos-capas-de-8.png`, barra de arriba).*
- [x] 2.2 Tooltip de la espiral en `es.js` y `en.js`: es la difícil y pide dos capas ocultas, sin nombrar una tasa. Verificar "Tooltip de la forma" y que `mlLab.auditTooltips()` no informa nada. *es: "Es la difícil: una sola capa oculta no alcanza; con dos capas ocultas de 7 u 8 neuronas la red la aprende."; en, lo mismo. Sin tasa. `mlLab.auditTooltips()` sin faltantes.*
- [x] 2.3 En el navegador, con la página recién cargada: elegir la espiral, armar dos capas de 8 y dejar correr. Informar en cuántas épocas llega a 90 % y tomar una captura del plano con la espiral aprendida, a 1440×900. Después, lo mismo con la red por defecto, 300 épocas, y otra captura. *Chrome sin ventana a 1440×900, página recién cargada, todo con clics y los deslizadores de la interfaz: espiral, dos capas, 8 y 8 neuronas, tanh, tasa 0,1, 200 puntos. Medido: llegó a 90 % en práctica y en apartados en la época 48, a los 5 s a 10 épocas por segundo (captura `espiral-dos-capas-de-8.png`, época 69, 90 % y 95 %). Con "Red de siempre" (2, 4, 1) y 304 épocas: 54 % en práctica y 58 % en apartados, sin llegar nunca (captura `espiral-red-por-defecto-300.png`: el plano queda partido por una línea). Consola sin errores. Observado, no medido: en la captura de las dos capas el fondo sigue a los dos brazos, con algunas zonas del borde todavía mezcladas.*

## 3. Cierre

- [ ] 3.1 PENDIENTES.md: quitar la nota de la espiral y anotar lo que sigue sin andar (design.md D2).
- [ ] 3.2 `npm test` y `openspec validate espiral-aprendible --strict`.
