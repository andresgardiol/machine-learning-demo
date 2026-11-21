# Revisión de contenido: capítulo 4, "Medir el error"

20 de noviembre de 2026. Cotejo de `src/teoria/contenido/es/error.js` contra `hoja-de-hechos-capitulos.md`,
contra el código de la app y, para la fuente, contra una búsqueda del índice del libro. Leí el texto
entero y rehíce a mano las cuentas que cita la prosa. No leí el libro.

| Tramo | Afirmación | Veredicto |
|---|---|---|
| 1 | Acierta seis de ocho; el 7 y el 8 contradicen al 2 y al 4 | Sale de la cuenta, con prueba |
| 1 | "datos que se contradicen un poco, como pasa con los datos de verdad" | Correcto |
| 2 | Salida suave, sigmoide; pasa de 0,5 justo cuando la suma pasa de cero; suma 1,4 da 0,8 y 0,4 da 0,6 | Correcto, rehecho a mano |
| 3 | Error 0,22 para 0,8 con respuesta 1; 0,91 para 0,6 con respuesta 0 | Correcto: −ln(0,802) = 0,22; −ln(1 − 0,599) = 0,91 |
| 3 | Vale 0 si acierta del todo, no tiene tope; "entropía cruzada", la que usa la app | Correcto (`outputLoss`) |
| 4 | 0,2 da 1,62 y 0,4 da 0,91 | Correcto |
| 5 | Error medio: el promedio de los ocho | Correcto |
| 6 | Ninguna neurona acierta los ocho; el error medio no baja de 0,48 | Sale de la cuenta, con prueba de que ahí la pendiente es cero. No lo rehíce |
| cierre | En Laboratorio, "Ejemplo en curso" y "Curvas de error" | Correcto (`lab.example.title`, `lab.chart.title`) |
| profundizar | Fórmulas; "se puede leer como una probabilidad... Es su seguridad, no un hecho"; error cuadrático con tope; "loss" | Correcto; cumple el matiz de la hoja |
| fuentes | Goodfellow y otros, capítulos 5 y 6 | Correcto |

## Correcciones a aplicar

Ninguna.
