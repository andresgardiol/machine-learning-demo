# Revisión de contenido: capítulo 0, "Programar o aprender"

20 de noviembre de 2026. Cotejo de `src/teoria/contenido/es/programar.js` contra
`hoja-de-hechos-capitulos.md`, contra el código de la app y, para la cita, contra una búsqueda.

| Tramo | Afirmación | Veredicto |
|---|---|---|
| 1 | Cada sensor da un número entre 0 y 1; cuanto más cerca hay algo, más alto | Correcto (`src/core/sensors.js`: lectura = 1 − distancia relativa; 0 si no ve nada) |
| 1 y 6 | El auto de la práctica tiene cinco sensores y cuatro salidas | Correcto |
| 1 | "Esto es programar: una persona piensa la regla y la máquina la obedece" | Correcto |
| 2 | Umbral: la lectura a partir de la cual la regla dispara | Correcto |
| 2 a 6 | Cuántas acierta cada regla, entre qué umbrales, veintiún valores por barrido | Sale de la cuenta, con pruebas; no lo recalculé a mano |
| 5 | Barrido: probar todo, de punta a punta | Correcto |
| 5 | "Una red neuronal no aprende así: tiene demasiados números para probarlos todos" | Correcto, y cumple el "no afirmar" de la hoja |
| 5 | "Esos dos números no los pensó nadie: salieron de los ejemplos. A eso se le dice aprender" | Correcto |
| 6 | "ahí las reglas a mano se vuelven una maraña" | Aceptable: no dice que no sirven. La pestaña Reglas a mano existe y funciona |
| cierre | Reglas a mano deja escribir reglas; en Entrenar "los autos aprenden solos" | Correcto. **Matiz (P1):** decir cómo: por evolución, probando muchos autos y quedándose con los mejores |
| fuentes | Samuel (1959), IBM Journal of Research and Development 3(3), 210–229 | **Confirmado con búsqueda (P2):** quitar "citado de memoria" |

## Correcciones a aplicar

- **P1 (cierre).** "...en la pestaña Entrenar, los autos aprenden solos, por prueba y selección."
- **P2 (fuentes).** Nota de Samuel: "Un trabajo temprano sobre programas que mejoran con la experiencia;
  ayudó a difundir el nombre «machine learning»." Enlace: https://people.csail.mit.edu/brooks/idocs/Samuel.pdf

Sin verificar: no leí el artículo de Samuel, solo su resumen y sus datos.
