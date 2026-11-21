# Revisión de contenido: capítulo 5, "Corregir un poco cada vez"

20 de noviembre de 2026. Cotejo de `src/teoria/contenido/es/corregir.js` contra `hoja-de-hechos-capitulos.md`,
contra el código de la app y, para la fuente, contra una búsqueda del índice del libro. Leí el texto
entero y rehíce a mano las cuentas que cita la prosa. No leí el libro.

| Tramo | Afirmación | Veredicto |
|---|---|---|
| 2 | Pendiente con signo; cero en el fondo; se calcula en el punto, sin probar otros | Correcto |
| 2 | Gradiente: el conjunto de las pendientes de todos los pesos | Correcto |
| 3 | Tasa de aprendizaje; el paso es tasa por pendiente, en contra; los pasos se acortan cerca del fondo | Correcto (`weightChange`) |
| 3 | "La bolita no rueda ni toma envión" | Correcto; cumple el "no afirmar" de la hoja |
| 3 y 4 | De −2 a −0,85 con tasa 4; a 15,21 con tasa 60; 10,24 tras ocho pasos | Sale de la cuenta, con prueba. −2 − 4 × (−0,29) = −0,84: coincide con el redondeo de la pendiente |
| 4 | Muy chica, tarda; muy grande, se pasa, rebota o se aleja | Correcto |
| 5 | El gradiente apunta cuesta arriba; "descenso por gradiente" | Correcto |
| 5 | Con una neurona y esta medida hay un solo valle; en redes con capas puede frenarse | Correcto (el problema es convexo; con datos que se contradicen el fondo existe) |
| 6 | "Así aprende una red de las que tienen respuesta correcta para cada ejemplo" | Correcto, y deja lugar a la evolución del capítulo 7 |
| cierre | En Laboratorio, "Tasa de aprendizaje" y las curvas | Correcto |
| profundizar | La figura promedia los ocho ejemplos; la app corrige después de cada ejemplo | Correcto (decisión 17) |
| profundizar | Las tasas 4 y 60 no se comparan con las de otro problema | Correcto (decisión 18) |
| fuentes | Goodfellow y otros, capítulo 4 (descenso por gradiente) y capítulo 8 (optimización) | **Confirmado con búsqueda:** sección 4.3 "Gradient-Based Optimization" y capítulo 8 "Optimization for Training Deep Models" |

## Correcciones a aplicar

Ninguna de contenido. **C1 (fuentes):** precisar "sección 4.3".
