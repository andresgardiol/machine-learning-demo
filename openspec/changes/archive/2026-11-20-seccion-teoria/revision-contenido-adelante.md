# Revisión de contenido: capítulo 3, "La cuenta hacia adelante"

20 de noviembre de 2026. Cotejo de `src/teoria/contenido/es/adelante.js` contra `hoja-de-hechos-capitulos.md`,
contra el código de la app y, para la fuente, contra una búsqueda del índice del libro. Leí el texto
entero y rehíce a mano las cuentas que cita la prosa. No leí el libro.

| Tramo | Afirmación | Veredicto |
|---|---|---|
| 1 | "Nada viaja por un cable ni tarda un tiempo. Es una cuenta que se hace en orden" | Correcto; cumple el "no afirmar" de la hoja |
| 1 y 4 | Sumas de A, B y C con (1, 0) y con (1, 1) | Correcto, rehecho a mano: 0,5, −0,5, 0,5 y 1,5, 0,5, −0,5 |
| 3 | Capa; dentro de una capa el orden no importa; "pasada hacia adelante", forward pass | Correcto |
| 5 | Cinco sensores y cuatro teclas (adelante, izquierda, derecha, atrás) | Correcto |
| 5 | Diez neuronas, 54 pesos (5×6 + 6×4); la red chica tiene seis | Correcto |
| 5 | "el auto hace esta cuenta entera en cada instante de la simulación" | Aceptable. **Matiz (A2):** "en cada paso de la simulación" es más exacto |
| 5 | En la última capa, cada tecla se aprieta si su suma pasa de cero | Correcto (la salida usa siempre escalón) |
| 6 | Sirve cualquier par que sume más de 0,5 y no más de 1,5 | Correcto con estos pesos |
| cierre | En Inspeccionar, pausar un auto y apretar "Paso" | Correcto (`inspect.step` en `src/i18n/es.js`) |
| profundizar | Una multiplicación de matrices por capa; sigmoide, tanh y ReLU en las ocultas | Correcto |
| fuentes | Goodfellow y otros, capítulo 6 | Correcto |
| portada | `comun.js`: "Cómo viajan los números desde los sensores..." | **Corregir (A1):** la hoja pide no decir que la señal viaja |

## Correcciones a aplicar

- **A1 (`contenido/es/comun.js` y `en/comun.js`, frase del capítulo en el temario).** "En qué orden se
  hacen las cuentas, desde los sensores hasta la decisión, capa por capa." / "The order of the
  calculation, from the sensors to the decision, layer by layer."
- **A2 (tramo 5).** "en cada paso de la simulación".
