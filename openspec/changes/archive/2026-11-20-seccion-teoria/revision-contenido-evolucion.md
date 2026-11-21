# Revisión de contenido: capítulo 7, "Aprender por evolución"

20 de noviembre de 2026. Cotejo de `src/teoria/contenido/es/evolucion.js` contra `hoja-de-hechos-capitulos.md`
y contra el código de la app. Leí el texto entero. Lo que es cuenta (cuántos acierta cada uno, errores,
qué casos fallan) tiene prueba y no lo rehíce, salvo donde se indica. No leí los libros ni los artículos.

| Tramo | Afirmación | Veredicto |
|---|---|---|
| 1 | Al manejar no hay una tecla correcta por instante; solo un puntaje al final | Correcto |
| 2 | Población; fitness: "qué tan bien le fue. Acá el fitness es tener poco error" | Correcto; "fitness" es el nombre que usa la app (`train.chart.title`) |
| 3 | Selección; la élite pasa sin ningún cambio | Correcto (`nextGeneration`) |
| 4 | Las demás son copias de alguna de las que pasaron, con cada peso corrido hacia un valor al azar; mutación, generación | Correcto (`mutate`) |
| 5 | Con fuerza 0 las hijas son copias exactas; con 100 % cada peso pasa a ser un valor al azar | Correcto por la fórmula w + (r − w)·f |
| 6 | "Así entrena la pestaña Entrenar"; neuroevolución; con respuesta correcta por ejemplo, lo habitual es el descenso por gradiente | Correcto; no dice que una sea mejor |
| cierre | En Entrenar, "Fuerza de mutación" y elegir quiénes pasan | Correcto (`train.setting.mutationStrength`, `train.selectionMode.manual`) |
| profundizar | En la app cada peso muta con cierta probabilidad; no es aprendizaje por refuerzo paso a paso; se probó con redes profundas; no describe cómo evolucionan los seres vivos | Correcto; cumple los "no afirmar" de la hoja |
| fuentes | Such y otros (2017), título completo y arXiv 1712.06567 | Confirmado con búsqueda (la del 20 de noviembre, al armar la hoja de hechos) |
| fuentes | Salimans y otros (2017) | Sin abrir; el texto lo dice |

## Correcciones a aplicar

Ninguna. Las dos observaciones del dueño (encabezados pisados y el tramo 3 que hablaba como si heredara
los puntos) ya están atendidas; ver `decisiones.md`, 45.
