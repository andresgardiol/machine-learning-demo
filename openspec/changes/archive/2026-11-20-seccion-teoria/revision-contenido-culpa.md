# Revisión de contenido: capítulo 6, "Repartir la culpa"

20 de noviembre de 2026. Cotejo de `src/teoria/contenido/es/culpa.js` contra
`hoja-de-hechos-capitulos.md` y contra el código de la app. Leí el texto entero, rehíce a mano las
cuentas del ejemplo y miré las capturas del tramo 4 (1440×900) y del tramo 5 (390×844). No leí el libro
ni el artículo de 1986; la sección 6.5 del libro se confirmó con una búsqueda de su índice.

| Tramo | Afirmación | Veredicto |
|---|---|---|
| 1 | Respondió 0,41, había que dar 1, error 0,9; nueve números: seis pesos y tres sesgos | Correcto: −ln(0,41) = 0,89 |
| 2 | Culpa de la salida: lo que respondió menos lo que tenía que responder, −0,59 | Correcto (`backward`); "culpa" es el nombre que usa la app (`lab.term.blame`) |
| 3 | A la oculta le llega la culpa de C por el peso que las une, por la pendiente de su curva: −0,14 y 0,15 | Correcto: −0,59 × 1 × 0,62 × 0,38 = −0,14 |
| 3 | "el escalón es plano en todas partes, no tiene pendiente" | Aceptable. **Matiz (Q1):** es plano salvo en el salto |
| 4 | A a C cambia +0,18; izquierda a A, +0,07; derecha a A, 0; sesgo de C, +0,3 | Correcto: 0,5 × 0,59 × 0,62 = 0,18 |
| 5 | Época; backpropagation "no es otra forma de aprender: es la forma de calcular el gradiente"; corrige el descenso por gradiente | Correcto; cumple el "no afirmar" de la hoja |
| 5 | "la red llegó a dar el XOR, y nadie le puso los pesos" | **Corregir (Q2):** lo afirma aunque la persona no haya apretado lo suficiente. Tiene que ser condicional o salir del estado de la figura |
| 5 | "No siempre sale así... con otros pesos de partida la red puede quedarse ahí" | Correcto |
| 6 | Manejar no tiene respuesta correcta por instante | Correcto |
| cierre | En Laboratorio, "avanzá de a un ejemplo y mirá «Ejemplo en curso»" | **Corregir (Q3):** la app dice "Pausá y avanzá de a una fase" (`lab.op.idle`) |
| profundizar | Fórmulas; f′ de la sigmoide a(1 − a); ŷ − y sale de sigmoide más entropía cruzada; la app no deja aprender con escalón en las ocultas; 1986 la hizo conocida, no fue el primero | Correcto (`assertLearnable`) |
| fuentes | Rumelhart, Hinton y Williams (1986); Goodfellow y otros, sección 6.5 | Correcto; el título completo de la sección es "Back-Propagation and Other Differentiation Algorithms" |

## Correcciones a aplicar

- **Q1 (tramo 3 y profundizar).** "el escalón es plano en todas partes salvo en el salto: no tiene una
  pendiente que sirva". En profundizar: "f′ vale cero en todas partes salvo en el salto".
- **Q2 (tramo 5).** "Seguí apretando y mirá la curva y el contador de aciertos: con estos pesos de
  partida la red llega a dar el XOR, y nadie le puso los pesos." O, mejor, que la frase aparezca cuando
  la figura llega a 4 de 4.
- **Q3 (cierre).** "...en la pestaña Laboratorio, pausá, avanzá de a una fase y mirá «Ejemplo en curso»".
- **De la figura, en celular (tramo 5):** el gráfico de épocas queda muy chico; el "0,8" del eje pisa el
  rótulo "error medio" y el renglón "acierta 1 de 4, error medio" se corta.
