# Revisión de contenido: capítulo 2, "Una recta no alcanza"

20 de noviembre de 2026. Cotejo de `src/teoria/contenido/es/xor.js` contra
`hoja-de-hechos-capitulos.md` y contra el código de la app.

| Tramo | Afirmación | Veredicto |
|---|---|---|
| 1 | XOR, "o exclusivo": una o la otra, pero no las dos | Correcto |
| 1 y 2 | Una neurona llega a tres de cuatro y nunca a cuatro | Correcto; hay una prueba sobre todas las posiciones de las perillas |
| 2 | Una neurona parte el plano con una recta | Correcto (con escalón) |
| 2 | "Linealmente separables" | Correcto |
| 2 | "es el límite de cualquier neurona sola, y en 1969 un libro lo demostró" | **Corregir (X1):** el libro demuestra los límites del perceptrón de una capa, y este es el caso más chico; que el XOR no se separa con una recta se sabía antes |
| 3 | Con dos rectas, hasta cuatro zonas | Correcto |
| 4 | Con sesgo −1,5, B se enciende si las entradas suman más de 1,5 | Correcto |
| 5 | Red neuronal, capa oculta, capa de salida | Correcto |
| 6 | "Estos nueve números" | Correcto: tres neuronas, dos pesos y un sesgo cada una |
| 6 | "Una red de las que se usan tiene miles, o millones" | **Corregir (X2):** se queda corto; la historia ya habla de 60 millones en 2012 |
| 6 | "Sumando neuronas, una red dibuja zonas que una sola no puede" | Correcto, y no promete "cualquier cosa" |
| cierre | En Laboratorio, la compuerta XOR, con capa oculta, la red encuentra sola los números | Correcto (`src/core/datasets.js`: compuertas AND, OR, XOR; la guía del Laboratorio dice "Hace falta una capa oculta") |
| — | Falta el matiz de la hoja: hay muchas redes que resuelven el XOR | **Agregar (X3)** |

## Correcciones a aplicar

- **X1 (tramo 2).** "...es el límite de cualquier neurona sola. Un libro de 1969 estudió a fondo esos
  límites (está en la historia)."
- **X2 (tramo 6).** "Una red de las que se usan tiene miles, millones o muchos más."
- **X3 (tramo 6, después del desafío).** Una frase: "No es la única forma: hay muchas redes distintas que
  dan el XOR. Esta es una."
- El teorema de aproximación universal (Cybenko, 1989; Hornik y otros, 1989) va a "Para profundizar"
  (tarea 18.1), con la aclaración de que dice que existe, no cómo encontrarla.
