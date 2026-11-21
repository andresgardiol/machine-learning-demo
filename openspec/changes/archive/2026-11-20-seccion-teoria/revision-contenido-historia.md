# Revisión de contenido: los siete hitos nuevos de la historia

20 de noviembre de 2026. Primera parte: **hechos comprobados antes de escribir**, para que los textos
partan de ellos (design.md D10, tarea 5.2). Segunda parte, al final: el cotejo del texto ya escrito.

## Cómo se hizo y qué límites tiene

Búsquedas en la web, una por hito. Devolvieron resúmenes; en tres casos, el artículo original o la
página de quien lo hizo (el artículo de AlexNet en las actas, la página de IBM sobre Deep Blue, el
anuncio de Google sobre AlphaGo). No leí los artículos completos. Lo que figura como **de memoria** lo
sé del entrenamiento y la búsqueda no lo confirmó: hay que comprobarlo antes de publicar.

## Hechos por hito

### Fines de los 80: segundo invierno

- **Comprobado:** se lo fecha por lo común de 1987 a 1993. Causas que repiten las fuentes: en 1987 se
  derrumba el mercado de las máquinas Lisp (las computadoras comunes las alcanzan y cuestan menos); los
  sistemas expertos resultan caros de mantener; se recorta el dinero público.
- **Discrepancia:** el recorte de la Strategic Computing Initiative de DARPA figura en 1988 en unas
  fuentes y como salida del presupuesto en 1993 en otras. **No dar un año para ese recorte.**
- **Para el texto:** este invierno es sobre todo de los sistemas expertos (reglas a mano a gran escala),
  no de las redes. Las redes, de hecho, estaban volviendo desde 1986. Decirlo evita repetir el error
  que se corrigió en el primer invierno.
- **Vínculo:** ninguno con un capítulo. Sí con una idea de la práctica: los sistemas expertos son
  "Reglas a mano" a escala. Se puede nombrar la pestaña Reglas a mano.

### 1997: Deep Blue

- **Comprobado:** Deep Blue (IBM) le gana a Garry Kasparov la revancha de seis partidas por 3½ a 2½; la
  última se juega el 11 de mayo de 1997. Buscaba jugadas con búsqueda alfa-beta sobre chips hechos a
  medida, y evaluaba posiciones con una función diseñada a mano, de unas 8000 características.
- **Matiz obligatorio:** los valores de esa función se ajustaron analizando miles de partidas de
  maestros y con ayuda de un gran maestro. No es exacto decir "nada aprendido". Lo correcto: las reglas
  y la forma de evaluar las diseñaron personas; no era una red neuronal ni aprendía jugando.
- **Vínculo propuesto, confirmado:** capítulo 0 "Programar o aprender" y pestaña Reglas a mano.

### 1998: LeNet

- **Comprobado:** LeCun, Bottou, Bengio y Haffner, "Gradient-based learning applied to document
  recognition", Proceedings of the IEEE, noviembre de 1998. Presenta LeNet-5, una red convolucional
  entrenada con backpropagation, dentro de un sistema que leía cheques y que NCR vendía a bancos.
- **Discrepancia:** las fuentes dicen "millones de cheques por mes" en un lugar y "varios millones por
  día" en otro. **No dar la cifra**; decir "millones de cheques".
- **De memoria:** volumen 86(11), páginas 2278 a 2324. La idea de "convolucional" (la red mira la imagen
  por partes chicas, con los mismos pesos en todas) no está en la práctica: nombrarla en una frase, sin
  explicarla.
- **Vínculo propuesto, confirmado:** capítulo 6 (próximamente) y Laboratorio, porque es backpropagation
  funcionando en algo real.

### 2012: AlexNet

- **Comprobado:** Krizhevsky, Sutskever y Hinton, "ImageNet classification with deep convolutional
  neural networks", NIPS 2012. Gana el concurso ILSVRC 2012 con 15,3 % de error (entre las cinco
  primeras respuestas) contra 26,2 % del segundo. Unos 60 millones de parámetros; entrenada cinco o seis
  días en dos placas gráficas GTX 580.
- **Matiz:** el 15,3 % es de una variante del modelo presentada al concurso. Alcanza con decir "un
  error de alrededor del 15 % contra 26 % del segundo".
- **Vínculo propuesto, a cambiar:** D8 lo ataba al capítulo 8 (generalizar). No corresponde: AlexNet
  trata de escala (más capas, más datos, placas gráficas). Mejor: sin capítulo; "la práctica no lo
  tiene", con una frase que una con lo conocido: la misma técnica de 1986, mucho más grande.

### 2016: AlphaGo

- **Comprobado:** Silver y otros, "Mastering the game of Go with deep neural networks and tree search",
  Nature 529, 484–489, enero de 2016. En marzo de 2016 le gana 4 a 1 a Lee Sedol. Combina dos redes
  (una propone jugadas, otra evalúa posiciones) con búsqueda en árbol de Monte Carlo. Las redes
  aprendieron primero de partidas de expertos humanos y después jugando contra sí mismas (aprendizaje
  por refuerzo).
- **Para el texto:** no decir que aprendió "solo" o "desde cero": esa fue una versión posterior
  (AlphaGo Zero, 2017; **de memoria**).
- **Vínculo:** sin capítulo; la práctica no tiene aprendizaje por refuerzo. Se puede decir que Entrenar
  usa otra forma de aprender sin respuestas correctas (evolución), que no es la misma.

### 2017: el Transformer

- **De memoria, sin confirmar en esta búsqueda:** Vaswani y otros siete autores, de Google, "Attention
  Is All You Need", NIPS 2017. Propone una red para traducir que se basa en un mecanismo llamado
  atención y deja de procesar las palabras de a una en orden.
- **Para el texto:** la atención no está en la práctica; nombrarla sin explicarla. Comprobar autores,
  año y congreso contra el artículo antes de publicar.
- **Vínculo:** sin capítulo; la práctica no lo tiene.

### 2022: los modelos de lenguaje llegan al público

- **Comprobado:** ChatGPT sale en noviembre de 2022. Un informe de analistas de UBS, con datos de
  Similarweb, estimó que llegó a unos 100 millones de usuarios mensuales en enero de 2023, dos meses
  después. Es una estimación de analistas, no una cifra de OpenAI: **decirlo así**.
- **De memoria:** fecha exacta, 30 de noviembre de 2022; GPT-1 y BERT son de 2018 y GPT-3 de 2020.
- **Para el texto:** unir con el capítulo 1 con una frase honesta: por dentro siguen siendo pesos que
  se ajustan con ejemplos, muchísimos más. No decir cuántos parámetros tiene ningún modelo.
- **Vínculo:** sin capítulo; la práctica no lo tiene.

## Cambio a D8

El vínculo de 2012 pasa de "capítulo 8" a "sin capítulo". Los demás vínculos propuestos se confirman.

## Fuentes

- Campbell, M., Hoane, A. J. y Hsu, F. (2002). Deep Blue. Artificial Intelligence 134.
  https://www.cefns.nau.edu/~edo/Classes/CS470-570_WWW/Readings/Campbell2002.pdf
- IBM, historia de Deep Blue. https://ibm.com/history/deep-blue
- LeCun, Y., Bottou, L., Bengio, Y. y Haffner, P. (1998). Gradient-based learning applied to document
  recognition. Proceedings of the IEEE.
  https://proceedingsoftheieee.ieee.org/gradient-based-learning-applied-to-document-recognition/
- Krizhevsky, A., Sutskever, I. y Hinton, G. (2012). ImageNet classification with deep convolutional
  neural networks. NIPS 2012. https://cacm.acm.org/research/imagenet-classification-with-deep-convolutional-neural-networks
- Silver, D. y otros (2016). Mastering the game of Go with deep neural networks and tree search.
  Nature 529, 484–489. https://research.google/pubs/mastering-the-game-of-go-with-deep-neural-networks-and-tree-search/
- Vaswani, A. y otros (2017). Attention Is All You Need. (Sin confirmar en esta revisión.)
- Sobre el segundo invierno (secundarias): https://en.wikipedia.org/wiki/AI_winter
- Sobre los usuarios de ChatGPT (prensa, sobre un informe de UBS):
  https://www.theregister.com/2023/02/03/chatgpt_most_popular_apps/

## Cotejo del texto escrito

20 de noviembre de 2026. Leí `src/teoria/contenido/es/historia.js` entero contra los hechos de arriba y
busqué lo que estaba "de memoria".

**Confirmado ahora con búsqueda:** el Transformer. "Attention Is All You Need", de Vaswani, Shazeer,
Parmar, Uszkoreit, Jones, Gomez, Kaiser y Polosukhin (ocho autores), NIPS 2017 (Advances in Neural
Information Processing Systems 30); arXiv 1706.03762, junio de 2017. Deja de usar recurrencia y se basa
en atención; sus resultados son de traducción.

| Hito | Afirmación | Veredicto |
|---|---|---|
| fines de los 80 | fechas 1987–1993, máquinas especiales, sistemas expertos caros, sin año para el recorte | Correcto |
| 1997 | 3½ a 2½, mayo de 1997, seis partidas, chips a medida, fórmula hecha por personas y afinada con partidas de maestros | Correcto |
| 1997 | Kasparov "campeón mundial" | Aceptable. El título estaba partido desde 1993 (él tenía el de la PCA, Karpov el de la FIDE), pero las fuentes lo llaman campeón reinante. Se deja |
| 1998 | LeNet-5, cuatro autores, NCR, "millones de cheques", convolucional en una frase | Correcto |
| 2012 | "concurso anual", 15 % contra 26 %, 60 millones, dos placas, cinco o seis días | Correcto |
| 2012 | "A las redes de muchas capas se las llama aprendizaje profundo" | **Corregir (H1):** el aprendizaje profundo es entrenar esas redes, no las redes |
| 2016 | más posiciones que el ajedrez, 4 a 1, marzo de 2016, dos redes y búsqueda, primero de humanos y después contra sí mismas | Correcto |
| 2016 | "Aprender así ... se llama aprendizaje por refuerzo" | **Corregir (H2):** "así" abarca también aprender de partidas humanas, que no es refuerzo |
| 2017 | ocho autores, título, traducción, atención, "armados con esa pieza" | Correcto, ya confirmado. **H3:** quitar "sin confirmar" de la nota de la fuente y del comentario, y sumar el enlace |
| 2022 | noviembre de 2022, 100 millones como estimación de analistas | Correcto |
| 2022 | "Se entrenan para ... adivinar la palabra que sigue" | **Matiz (H4):** es la tarea principal, no la única; y son pedazos de palabra |

## Correcciones a aplicar

- **H1 (2012).** "Entrenar redes de muchas capas se llama aprendizaje profundo."
- **H2 (2016).** "Esa segunda parte, aprender de lo que sale bien y lo que sale mal al probar, se llama
  aprendizaje por refuerzo."
- **H3 (2017).** Nota de la fuente vacía; enlace https://arxiv.org/abs/1706.03762; "NIPS 2017". Sacar el
  "de memoria: sin confirmar" del comentario del archivo.
- **H4 (2022).** "Se entrenan, sobre todo, para una tarea que suena modesta: adivinar la palabra (o el
  pedazo de palabra) que sigue."

Sin verificar: los artículos completos; el pasaje del manual del Mark I (ya anotado).
