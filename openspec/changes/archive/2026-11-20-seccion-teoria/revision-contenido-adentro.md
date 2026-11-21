# Revisión de contenido: capítulo 9, "Qué quedó adentro"

20 de noviembre de 2026. Cotejo de `src/teoria/contenido/es/adentro.js` contra `hoja-de-hechos-capitulos.md`
y contra el código de la app. Leí el texto entero. Lo que es cuenta (cuántos acierta cada uno, errores,
qué casos fallan) tiene prueba y no lo rehíce, salvo donde se indica. No leí los libros ni los artículos.

| Tramo | Afirmación | Veredicto |
|---|---|---|
| 1 | Adentro hay seis pesos y tres sesgos; ni reglas escritas ni ejemplos guardados | Correcto. El texto aclara que la red se armó a mano ("hacé de cuenta que salió de un entrenamiento") |
| 2 | A se enciende con alguna entrada en 1; B, con las dos; la red, donde A sí y B no | Correcto |
| 2 | "en redes grandes no siempre es así" | Correcto; cumple el "no afirmar" sobre una neurona por concepto |
| 3 | Una neurona apagada vale cero; ablación; sin B falla solo el caso (1, 1) | Correcto (`forwardValues` con `off`) |
| 4 | Sin A la red contesta 0 siempre y falla los dos casos que tenían que dar 1 | Correcto |
| 5 | La red da el XOR mientras el peso de B a la salida está en −0,5 o más abajo | Correcto, rehecho a mano: con las dos encendidas, 1 + w − 0,5 pasa de cero cuando w pasa de −0,5 |
| 6 | En una red de millones la cuenta se conoce igual; lo difícil es explicar por qué; interpretabilidad, campo abierto | Correcto; cumple el "no afirmar" de la hoja |
| cierre | En Inspeccionar: apagar neuronas y conexiones, cambiar pesos | Correcto |
| fuentes | Goodfellow y otros, capítulo 6: el XOR con una capa oculta | Correcto de memoria (sección 6.1, "Example: Learning XOR"); no lo busqué |
| fuentes | El código de las partes apagadas y los mapas está en `src/core/backprop.js` | Correcto |

## Correcciones a aplicar

Ninguna.
