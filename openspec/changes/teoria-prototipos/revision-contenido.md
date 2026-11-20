# Revisión del contenido contra fuentes

20 de noviembre de 2026. Cubre los textos de `prototipos/teoria/contenido/es.js`: el capítulo "Una
neurona" (seis tramos) y la historia (cinco hitos, 1943 a 1986).

## Cómo se hizo y qué límites tiene

- Las cuentas del capítulo se rehicieron a mano y se compararon con `contenido/guion.js`.
- Lo que el texto dice de la app se comparó con el código (`src/core/sensors.js`, `src/core/network.js`).
- La historia se contrastó con búsquedas en la web. **Límite:** las búsquedas devolvieron resúmenes y
  fuentes secundarias (Wikipedia, notas de curso, un ensayo histórico). No leí los artículos originales.
  Donde una afirmación descansa solo en fuentes secundarias, lo dice.
- No es una revisión por pares: es una comprobación de hechos, fechas, nombres y simplificaciones.

Rótulos: **Correcto** (coincide con las fuentes), **Corregir** (dice algo inexacto), **Matiz**
(simplificación aceptable; conviene saberla), **Sin confirmar** (no encontré fuente suficiente).

## Resultado

Dos correcciones, una de ellas de fondo (el invierno). El resto es correcto, con matices.

## Capítulo "Una neurona"

| Afirmación | Veredicto | Detalle |
|---|---|---|
| El sensor da un número entre 0 y 1, más alto cuanto más cerca | Correcto | Igual que la app: `reading = 1 - t` en `src/core/sensors.js`. |
| "El auto tiene dos sensores" | Corregir (C2) | El auto de la app tiene cinco sensores y cuatro salidas. El de este capítulo es uno simplificado, y el texto no lo dice. |
| Multiplica cada lectura por un número, suma y, si pasa de cero, dice que sí | Correcto | Es la neurona con umbral. En la app el escalón es `x > 0`, igual que el texto. |
| "Eso es una neurona" | Matiz | Es una neurona artificial: un modelo. Conviene decirlo la primera vez, porque la historia habla de neuronas del cerebro. Va con C2. |
| Pesos positivos a favor, negativos en contra, cero no cuenta | Correcto | |
| "Cuando una red aprende, lo que cambia son números como estos" | Correcto | Pesos y sesgos. |
| Sesgo: se suma siempre; negativo pide más, positivo menos | Correcto | |
| Activación; la que salta de golpe es un escalón | Correcto | Función escalón (Heaviside). Matiz para más adelante: las redes que aprenden con backpropagation usan activaciones suaves. |
| Cuentas de la predicción: −0,25 y 0,2 | Correcto | 0,9×0,5 − 0,4 − 0,3 = −0,25; 0,9×1 − 0,4 − 0,3 = 0,2. |
| Las demás cuentas del guion (0,5; 0,05; 0,3) | Correcto | Rehechas a mano. |
| Una neurona sola parte el plano con una recta; frontera de decisión | Correcto | Con dos entradas es una recta; con más, un plano o un hiperplano. Para "Para profundizar". |
| "Los pesos giran la línea y el sesgo la corre" | Matiz | Cierto como idea. Con sesgo distinto de cero, cambiar un peso también la corre un poco. No hace falta tocarlo. |
| AND con pesos iguales y positivos y un sesgo negativo | Correcto | Por ejemplo 1, 1 y −1,5. |

## Historia

| Hito | Afirmación | Veredicto | Detalle |
|---|---|---|---|
| 1943 | McCulloch y Pitts; neurona de 0 o 1 con umbral; alcanza para "y", "o" y "no" | Correcto | Bulletin of Mathematical Biophysics 5, 115–133. |
| 1943 | "Un neurofisiólogo y un lógico joven" | Correcto | Pitts nació en 1923: tenía unos 20 años. |
| 1943 | (lo que no dice) | Matiz (M1) | Esa neurona no tenía pesos: las señales excitadoras valían lo mismo y una inhibidora bloqueaba del todo. Los pesos ajustables llegan con Rosenblatt. Decirlo en una frase une mejor 1943 con 1958. |
| 1958 | Rosenblatt propone que la máquina corrija sus pesos cuando se equivoca | Correcto | Psychological Review 65(6), 386–408. |
| 1958 | Primero simulado, después construido; 400 fotoceldas | Correcto | Simulación en una IBM 704 (1957). El Mark I se armó en 1959 y se mostró en público el 23 de junio de 1960. |
| 1958 | Cada peso en una perilla que mueve un motor | Sin confirmar en fuente primaria | Lo dicen Wikipedia y fuentes secundarias. El manual del Mark I (DTIC AD0236965, febrero de 1960) existe, pero no leí ese pasaje. |
| 1958 | Dibujo: fotoceldas que van directo a tres perillas | Matiz (M2) | El Mark I tenía tres capas: 400 fotoceldas, 512 unidades de asociación con conexiones fijas al azar y 8 de respuesta. Los pesos que aprendía estaban entre las dos últimas. El dibujo simplifica. |
| 1969 | "Perceptrons"; un perceptrón no puede con XOR | Correcto | MIT Press, 1969. |
| 1969 | (lo que no dice) | Matiz (M3) | El libro demuestra límites más generales (paridad, conectividad) para perceptrones de una capa; el XOR es el caso más chico. Ya se sabía que con más capas se podía: faltaba cómo entrenarlas. |
| años 70 | Informe Lighthill (1973) y recortes en Estados Unidos | Correcto | Recortes de DARPA en 1973 y 1974. |
| años 70 | "Entre 1974 y 1980 casi nadie quiere pagar por redes neuronales" | **Corregir (C1)** | Mezcla dos cosas. El primer invierno (1974 a 1980, aproximado) fue de la inteligencia artificial en general, sobre todo la simbólica. A las redes neuronales el frío les llegó antes, hacia 1969, y duró hasta los años 80, por el libro y porque no había cómo entrenar redes de varias capas. |
| años 70 | "El libro de 1969 ayudó a enfriar el entusiasmo" | Correcto, con matiz | Cuánto pesó se discute entre historiadores (Olazaran, 1996). "Ayudó" es la palabra justa. |
| 1986 | Rumelhart, Hinton y Williams; el error se reparte hacia atrás | Correcto | Nature 323, 533–536. |
| 1986 | "Ya se había descubierto más de una vez" | Correcto | Linnainmaa (1970) y Werbos (1974), entre otros. Fuentes secundarias; el propio Hinton lo reconoce según esas fuentes. |
| 1986 | "Muestra con experimentos que funciona" | Matiz | Más preciso: muestra que las capas ocultas aprenden representaciones útiles. La frase actual no es falsa. |

## Correcciones propuestas

**C1. El invierno (de fondo).** Reemplazar los dos párrafos del hito por:

> Las promesas de la inteligencia artificial habían sido enormes y los resultados no llegaban. En 1973
> un informe británico, el de Lighthill, es lapidario, y en Estados Unidos también se recorta el dinero
> para investigar. Es el primer invierno de la IA, más o menos de 1974 a 1980.
>
> A las redes neuronales el frío les había llegado antes. Después del libro de 1969, y sin una forma de
> entrenar redes de varias capas, casi todos las dejan de lado. Unos pocos siguen trabajando igual.

**C2. El auto del capítulo es uno simplificado, y la neurona es artificial.** En el tramo 1:

> Imaginá el auto con solo dos sensores, uno a cada lado. (El de la práctica tiene cinco.) Cada uno le
> pasa un número entre 0 y 1: cuanto más cerca hay algo, más alto.

y más abajo: "Eso es una **neurona artificial**. Este capítulo la desarma pieza por pieza."

**M1 (recomendada).** Sumar al hito de 1943: "Todavía no hay pesos: todas las señales valen lo mismo."

**M2 y M3 (opcionales).** El texto alternativo del dibujo de 1958 puede decir "simplificado". En 1969
se puede sumar: "Con más capas se podía, y ya se sabía. Faltaba cómo entrenarlas", que prepara 1986.

**Fuentes en el archivo.** `es.js` cita Wikipedia. Conviene citar las publicaciones originales (abajo)
y dejar Wikipedia como apoyo.

## Fuentes

Originales (no leídas en esta revisión; datos bibliográficos confirmados por las búsquedas):

- McCulloch, W. y Pitts, W. (1943). A logical calculus of the ideas immanent in nervous activity.
  Bulletin of Mathematical Biophysics 5, 115–133.
- Rosenblatt, F. (1958). The perceptron: a probabilistic model for information storage and organization
  in the brain. Psychological Review 65(6), 386–408.
- Hay, J. C. y otros (1960). Mark I Perceptron Operators' Manual. Cornell Aeronautical Laboratory,
  informe VG-1196-G-5. https://apps.dtic.mil/sti/tr/pdf/AD0236965.pdf
- Minsky, M. y Papert, S. (1969). Perceptrons. MIT Press.
- Lighthill, J. (1973). Artificial Intelligence: A General Survey.
- Rumelhart, D., Hinton, G. y Williams, R. (1986). Learning representations by back-propagating errors.
  Nature 323, 533–536.
- Olazaran, M. (1996). A Sociological Study of the Official History of the Perceptrons Controversy.
  Social Studies of Science 26(3), 611–659.
- Schmidhuber, J. (2015). Deep Learning in Neural Networks: An Overview. https://arxiv.org/pdf/1404.7828

Consultadas:

- https://en.wikipedia.org/wiki/Perceptron
- https://en.wikipedia.org/wiki/Perceptrons_(book)
- https://en.wikipedia.org/wiki/AI_winter
- https://en.wikipedia.org/wiki/A_Logical_Calculus_of_the_Ideas_Immanent_in_Nervous_Activity
- https://yuxi-liu-wired.github.io/essays/posts/backstory-of-backpropagation
- https://news.cornell.edu/node/313946
- https://bnaskrecki.faculty.wmi.amu.edu.pl/nnets/_build/html/part3_limitations/ch09_minsky_papert.html

## Para la sección definitiva

- Cada capítulo y cada hito nuevo pasan por esta misma revisión antes de publicarse.
- El tramo de 1986 a los LLMs tiene más riesgo: fechas recientes y atribuciones discutidas.
- Leer los originales de las afirmaciones "Sin confirmar" antes de publicar.
