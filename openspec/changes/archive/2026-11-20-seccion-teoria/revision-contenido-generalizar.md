# Revisión de contenido: capítulo 8, "Generalizar o memorizar"

20 de noviembre de 2026. Cotejo de `src/teoria/contenido/es/generalizar.js` contra `hoja-de-hechos-capitulos.md`
y contra el código de la app. Leí el texto entero. Lo que es cuenta (cuántos acierta cada uno, errores,
qué casos fallan) tiene prueba y no lo rehíce, salvo donde se indica. No leí los libros ni los artículos.

| Tramo | Afirmación | Veredicto |
|---|---|---|
| 1 | El memorizador contesta el color del punto guardado más cercano; 40 de 40 contra 35 de 40 | Correcto; los números son los de la cuenta (decisión 22) |
| 2 | La recta es la que más acierta entre 24 candidatas, una cada 15 grados; el memorizador "no es una red neuronal" | Correcto; cumple el matiz obligatorio de la hoja |
| 3 | Ejemplos apartados; los nuevos vienen de las mismas dos manchas | Correcto |
| 4 | 38 de 40 contra 31 de 40 | Sale de la cuenta, con prueba |
| 5 | Sobreajuste: "se ajustó tanto a esos ejemplos que aprendió también su ruido"; generalizar | Correcto |
| 5 | "No es una regla que lo más simple gane siempre" | Correcto; cumple el "no afirmar" de la hoja |
| 6 | Apartar tiene un costo; un cerebro que aprendió en un circuito puede fallar en otro | Correcto |
| cierre | En Competir, pistas donde no practicaron; en Laboratorio, "Apartados" | Correcto (`lab.holdout`) |
| profundizar | Brechas 22,5 y ninguna; vecino más cercano, por lo general con varios vecinos; el Laboratorio avisa del sobreajuste con dos curvas | Correcto (100 − 77,5; `help.lab.term.overfitting.what`). Lo de "varios vecinos" es conocimiento de libro de texto, sin fuente abierta |
| fuentes | Goodfellow y otros, capítulo 5: capacidad, sobreajuste y subajuste | Correcto |

## Correcciones a aplicar

Ninguna.
