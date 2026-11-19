# Informe de análisis: interfaz-v2

Fecha: 18 de noviembre de 2026. Commit de partida: `767f239`.

Rótulos: **[Medido]** sale de un número tomado en el navegador o en el código; **[Observado]** se vio en una captura o en la V1 en vivo; **[Hipótesis]** es una conjetura sin prueba con personas; **[Propuesta]** es una decisión de diseño para la V2.

---

# Parte 1. A ciegas

> **Qué se leyó para escribir esta parte:** `CONSTITUCION.md` completa; del `README.md`, la introducción y las secciones de conceptos del núcleo (mundo con varios autos, red neuronal, neuroevolución, entrenamiento); los nombres de las 33 carpetas de `openspec/specs/`; y los artefactos de este cambio (`proposal.md`, `design.md`, `specs/`, `tasks.md`).
>
> **Qué NO se leyó:** la V1 en el navegador, sus capturas, el código de `src/` y `styles/`, `borradores/analisis-ux/`, `borradores/sistema-de-diseno/` y `PENDIENTES.md`. Esta parte se escribió y quedó fija antes de abrir cualquiera de ellos (tarea 1.1); lo que la Parte 2 contradiga se anota allá, no se corrige acá.

## 1.1 De qué parte el análisis

La promesa de la constitución es una cadena de cuatro comprensiones: por qué las reglas a mano no escalan, cómo aprende una red, por qué falla fuera de lo que vio y qué tiene adentro. El recorrido tiene cinco etapas: **problema → reglas a mano → aprender → evaluar → entender**. Cada una responde la pregunta que dejó abierta la anterior.

Lista de conceptos que la app enseña, sacada del README y de los nombres de las capacidades [Observado]:

- **El problema**: un auto en una pista con tráfico, sensores que son rayos que miden distancia (`sensores`, `pista`, `trafico`, `simulacion`), choque, progreso.
- **Reglas a mano**: un programa con comparaciones sobre los sensores (`reglas`, `controladores`).
- **Aprender, por evolución**: población, fitness (distancia, supervivencia, velocidad), selección, élite, mutación (probabilidad y fuerza), cruce, generaciones, campeón, cerebro guardado (`neuroevolucion`, `cerebros`, `cerebros-de-ejemplo`).
- **Aprender, por gradiente**: retropropagación, datos de ejemplo, época, tasa de aprendizaje, apartados (datos de validación), sobreajuste, imitar el manejo de la persona (`retropropagacion`, `datos-de-ejemplo`).
- **Evaluar**: carrera entre competidores en pistas que el cerebro vio y que no vio (`carrera`, `pestana-competir`).
- **Entender**: la red por dentro, neurona, peso, sesgo, activación, la cuenta capa por capa (`red-neuronal`, `inspector-de-red`, `cuenta-de-la-red`, `vista-red`).
- **Transversales**: `ayuda-contextual`, `consigna-de-pestana`, `jerarquia-visual`, `accesibilidad`, `internacionalizacion`, `sistema-de-diseno`, `tablero`, `barra-escenario`, `vista-escenario`, `paisaje`, `estructura-app`.

Las seis experiencias que la V2 tiene que alojar (spec *El recorrido como cadena de preguntas*): El problema, Reglas a mano, Entrenar, Competir, Inspeccionar y Laboratorio. Del Laboratorio, el cambio nombra tres experimentos: compuertas, puntos y tu manejo (tasks.md 15.1) [Observado].

## 1.2 Trabajos de los dos públicos (*jobs to be done*)

Método: `design-skills:ux-strategy`, con la estructura de trabajo principal, trabajos relacionados, emocionales y sociales. No hubo entrevistas: todo lo de esta sección es **[Hipótesis]**.

### Principiante que llega solo

- **Trabajo principal** [Hipótesis]: "Cuando escucho hablar de inteligencia artificial y no sé qué hay detrás, quiero ver una por dentro haciendo algo concreto, para dejar de sentir que es magia".
- **Relacionado** [Hipótesis]: poder contárselo a otro con sus palabras ("la red es una cuenta con perillas que se ajustan solas").
- **Emocional** [Hipótesis]: sentirse capaz, no tonto; que equivocarse sea parte del juego y no un fracaso.
- **Social** [Hipótesis]: poder mostrar "mirá lo que entrenó mi auto".
- **Fuerzas** [Hipótesis]: empuja la curiosidad y la sensación de quedar afuera; tira la promesa de jugar con un auto; frena el miedo a la matemática y a la jerga; el hábito es leer un artículo o mirar un video, que no se toca.
- **Resultados deseados** [Hipótesis], en la forma dirección + medida + objeto:
  - minimizar el tiempo hasta ver el auto moverse por primera vez;
  - minimizar los términos que aparecen sin definir;
  - minimizar las veces que no sabe qué hacer a continuación;
  - maximizar la sensación de que lo que ve es "lo de verdad".

### Mentor

- **Trabajo principal** [Hipótesis]: "Cuando tengo que explicar cómo aprende una máquina a un grupo, quiero una demostración que no falle y que pueda dirigir, para que el grupo vea el concepto en vez de escucharme".
- **Relacionados** [Hipótesis]: preparar cerebros antes de la clase; volver a un estado conocido; saltar a la parte que sirve para su tema; que un alumno explore solo después.
- **Emocional** [Hipótesis]: tranquilidad frente al grupo; no tener que pedir disculpas por la herramienta.
- **Social** [Hipótesis]: quedar como alguien que explica bien.
- **Fuerzas** [Hipótesis]: empuja que las diapositivas no muestran el aprendizaje; tira que es en el navegador, sin instalar; frena el miedo a que algo se trabe en vivo o a que la guía del principiante estorbe en la proyección; el hábito son sus propios ejemplos y cuadernos.
- **Resultados deseados** [Hipótesis]:
  - minimizar los pasos para dejar una etapa en el estado que quiere mostrar;
  - minimizar lo que hay en pantalla que no habla del concepto del momento;
  - maximizar la seguridad de que misma semilla da mismo resultado;
  - minimizar el tiempo para encontrar un ajuste avanzado.

### Lo que cada uno tiene que poder enunciar al salir de cada etapa

La oración es el resultado de la etapa (el *outcome*, no la salida). La V2 se juzga por si la deja a la mano, no por cuántos controles tiene.

| Etapa | Principiante: "al salir puedo decir…" | Mentor: "al salir el grupo puede decir…" |
|---|---|---|
| **Problema** | [Hipótesis] "Manejar es mirar lo que tengo cerca y decidir; el auto solo ve unas distancias, no la pista entera." | [Hipótesis] "La máquina recibe cinco números y tiene que devolver cuatro decisiones; ese es todo el problema." |
| **Reglas a mano** | [Hipótesis] "Pude escribir reglas que andan un rato, pero cada caso nuevo me pide otra regla, y nunca termino." | [Hipótesis] "Programar a mano cubre los casos que se nos ocurren; los que no, chocan. Por eso queremos que aprenda." |
| **Aprender** | [Hipótesis] "Nadie le dijo cómo manejar: se probaron muchos, se quedaron los mejores y se cambiaron un poco; así fue mejorando." | [Hipótesis] "Aprender es ajustar números para que una medida mejore, sea eligiendo los mejores (evolución) o corrigiendo el error (gradiente)." |
| **Evaluar** | [Hipótesis] "En la pista donde aprendió anda bien; en una que no vio, a veces choca. Aprender no es entender." | [Hipótesis] "Se evalúa en lo que no se vio; ir bien en el entrenamiento no alcanza (generalización y sobreajuste)." |
| **Entender** | [Hipótesis] "Adentro no hay reglas escritas: hay sumas con pesos, y puedo ver qué neurona se prende cuando hay un auto cerca." | [Hipótesis] "La red es una cuenta que se puede seguir paso a paso; cambiar un peso cambia la conducta, y eso lo podemos mostrar." |

## 1.3 Mapas del recorrido ideal

Método: `design-skills:journey-mapping`, mapa de recorrido futuro (estado ideal). La skill pide mapear primero el estado actual: acá, a propósito, va primero el ideal a ciegas (design.md D3), y el actual se contrasta en la Parte 2. Sintaxis de la skill: acciones con verbo, dudas como pregunta, emociones como adjetivo, quiebres con gerundio. Todo es **[Hipótesis]**: no hay investigación con personas.

### Mapa 1. Principiante solo, 30 a 45 minutos

| | 1. Llegar (0–2 min) | 2. Problema (2–7) | 3. Reglas a mano (7–17) | 4. Aprender (17–30) | 5. Evaluar (30–37) | 6. Entender (37–45) |
|---|---|---|---|---|---|---|
| **Meta** | Saber qué es esto | Sentir la dificultad | Intentar resolverlo pensando | Ver que se resuelve sin escribirlo | Poner a prueba lo aprendido | Ver qué aprendió |
| **Acciones** | Lee la pregunta; ve el auto | Maneja con el teclado; choca; mira los rayos | Escribe una regla; corre; choca; agrega otra | Larga una población; mira la curva; guarda el campeón | Corre una carrera en una pista nueva; compara | Elige una neurona; mueve un peso; ve el cambio |
| **Dudas** | ¿Qué tengo que hacer? ¿Esto es un juego? | ¿Qué ve el auto exactamente? | ¿Cómo se escribe? ¿Por qué falló esta vez? | ¿Qué es fitness? ¿Qué toco primero? ¿Cuánto espero? | ¿Por qué choca si ya aprendió? | ¿Qué es un peso? ¿Esto es la red de verdad? |
| **Emoción** | Curioso | Divertido → frustrado | Ingenioso → cansado | Impaciente → asombrado | Desconcertado → lúcido | Intrigado → satisfecho |
| **Quiebre** | Encontrando demasiadas cosas a la vez | Chocando sin entender por qué | Leyendo errores que no entiende; pasando a otra etapa sin ver el límite | Mirando 15 perillas sin saber cuál importa; esperando sin ver progreso | Comparando sin saber qué pista vio y cuál no | Viendo números sin relación con la conducta |
| **Oportunidad** | Mostrar una pregunta y una acción | Mostrar lo que el auto percibe junto al choque | Señalar la línea que se cumplió y el caso que faltó | Mostrar tres ajustes y la curva enseguida | Rotular "practicó" y "no la vio" | Conectar neurona y conducta en vivo |

Curva de emoción (más alto, mejor):

```
alto  |        *                  *            *
      |   *         *        *            *         *
medio | *      \      \    /   \       /     \  /
      |          *      *       *     *       *
bajo  |                  (quiebre:     (quiebre:
      |                   reglas)       choque en pista nueva)
      +--Llegar--Problema--Reglas--Aprender--Evaluar--Entender
```

**Momentos de la verdad** [Hipótesis]: el primer manejo (primera impresión), el primer choque de las reglas propias (la frustración que enseña) y el campeón que choca en una pista que no vio (el giro de la historia). Por la regla del pico y el final, el cierre en Entender tiene que dejar una sensación de "ahora lo veo".

### Mapa 2. Mentor en una clase

| | 1. Preparar (antes) | 2. Abrir la clase | 3. Mostrar | 4. Desviarse | 5. Dejar explorar | 6. Cerrar |
|---|---|---|---|---|---|---|
| **Meta** | Tener todo listo y probado | Plantear el problema | Hacer ver el concepto | Responder una pregunta del grupo | Que cada uno pruebe | Que el grupo enuncie lo aprendido |
| **Acciones** | Entrena y guarda cerebros; exporta; elige pistas | Oculta la guía; abre la etapa; maneja frente al grupo | Salta a Aprender con un cerebro cargado; cambia un ajuste | Abre "Avanzado"; cambia la mutación; vuelve | Vuelve a mostrar la guía; pasa el enlace | Abre Entender; muestra una neurona |
| **Dudas** | ¿Se va a ver igual en el proyector? ¿Se guarda? | ¿Dónde se apaga la guía? | ¿Dónde está el ajuste que necesito? | ¿Cómo vuelvo a como estaba? | ¿Lo entienden sin mí? | ¿Cómo muestro todo junto? |
| **Emoción** | Meticuloso | Nervioso | Concentrado | Expuesto | Aliviado | Satisfecho |
| **Quiebre** | Perdiendo un cerebro entre versiones | Buscando el control de la guía frente al grupo | Buscando un ajuste en varios lugares | Reiniciando de más y perdiendo el entrenamiento | Dejando la guía apagada por olvido | Mostrando números chicos que no se ven al fondo |
| **Oportunidad** | Guardar, exportar y nombrar sin dudas | Un solo control con nombre para la guía | Un ajuste en un solo lugar | Restablecer con alcance y Deshacer | Recordar el estado de la guía y decirlo | Escalas legibles a distancia (pendiente: modo proyector) |

**Momento de la verdad** [Hipótesis]: la columna 4. Frente al grupo, una acción que borra el trabajo o un ajuste que no aparece rompe la confianza en la herramienta.

### Puntos de quiebre que la V2 tiene que cuidar [Propuesta]

1. **Q1. Demasiadas cosas al llegar.** Cada etapa abre con una pregunta y una acción.
2. **Q2. Choque sin causa.** El choque muestra qué percibía el auto y por qué terminó así.
3. **Q3. El límite de las reglas no se ve.** El paso a Aprender se ofrece después del choque que una regla no previó, no antes.
4. **Q4. Perillas sin jerarquía.** A lo sumo tres a la vista; el resto, plegado.
5. **Q5. Espera sin progreso.** La curva y la generación se ven avanzar desde el primer segundo.
6. **Q6. "Vio" y "no vio" mezclados.** La pista nueva se nombra como nueva en todas las vistas.
7. **Q7. Números sin conducta.** En Entender, cada cambio en la red se ve en el auto al mismo tiempo.
8. **Q8. Buscar el ajuste.** Un ajuste vive en un solo lugar de la etapa.
9. **Q9. Reiniciar de más.** Reiniciar y Restablecer tienen alcance escrito y Deshacer.
10. **Q10. La guía, difícil de apagar y de volver a prender.** Un control con nombre en la barra, siempre en el mismo lugar.
11. **Q11. Cerebros que no se encuentran.** Una sola biblioteca, compartida y con nombre.
12. **Q12. Lectura a distancia.** Fuera de alcance (modo proyector), pero la V2 no tiene que hacerlo más difícil.

## 1.4 Arquitectura de información de las cinco etapas

Las seis experiencias entran en cinco etapas. La pregunta abierta de design.md era si el Laboratorio va en Aprender o en Entender.

**Decisión** [Propuesta]: el **Laboratorio va en Aprender**, como el segundo modo de aprender, al lado de Entrenar. Motivos:

- Su concepto central es el ajuste de pesos por el error (retropropagación, época, tasa de aprendizaje): es *cómo aprende*, que es la pregunta de Aprender ("que aprenda").
- Entender pregunta "¿qué aprendió?" sobre un cerebro ya hecho. El Laboratorio *produce* cerebros (imitar tu manejo y guardar como cerebro).
- Los apartados y el sobreajuste del Laboratorio anticipan Evaluar. Si el Laboratorio fuera después de Evaluar, el sobreajuste llegaría tarde. Puesto en Aprender, deja abierta la pregunta de Evaluar: "¿anda en lo que no vio?".
- Riesgo [Hipótesis]: la etapa Aprender queda como la más pesada (dos modos). Se mitiga con dos sub-pasos con nombre ("por evolución" y "por gradiente"), con la evolución primero porque usa el auto que ya se conoce.

| Etapa | Experiencias de la V1 | Pregunta con que abre | Lo que deja abierto (abre la siguiente) |
|---|---|---|---|
| 1. Problema | El problema | "¿Podés manejarlo vos?" | "¿Y si en vez de manejarlo, le escribís cómo?" |
| 2. Reglas a mano | Reglas a mano | "¿Podés programarlo vos?" | "Cada caso nuevo pide otra regla. ¿Y si aprendiera solo?" |
| 3. Aprender | Entrenar (evolución) y Laboratorio (gradiente: compuertas, puntos y tu manejo) | "¿Puede aprender solo?" | "Aprendió en esta pista. ¿Anda en una que no vio?" |
| 4. Evaluar | Competir | "¿Funciona en lo que no vio?" | "A veces sí y a veces no. ¿Qué tiene adentro?" |
| 5. Entender | Inspeccionar | "¿Qué aprendió?" | Cierra el recorrido: "Ahora entrená otro y miralo por dentro" (vuelta a Aprender). |

Navegación [Propuesta]: libre entre etapas, sin bloqueos; la posición siempre visible; el paso siguiente se ofrece al cumplir la misión principal y nunca se fuerza.

## 1.5 Voz, tono y escalera de vocabulario

Método: `design-skills:ux-writing` (cuatro estándares: con propósito, conciso, conversacional y claro; frases de 8 a 14 palabras; botones de 2 a 4).

### Voz [Propuesta]

| Rasgo | Es | No es | Ejemplo sí | Ejemplo no |
|---|---|---|---|---|
| Curiosa | Pregunta y propone | Examina | "¿Podés programarlo vos?" | "Ejercicio 2: programación de reglas" |
| Llana | Palabras de todos los días, voseo rioplatense | Jerga sin definir | "El auto ve cinco distancias" | "Vector de percepción de dimensión 5" |
| Honesta | Nombra lo técnico con su nombre real | Infantiliza | "Fitness: qué tan bien le fue, en metros" | "Los autitos felices" |
| Breve | Una idea por frase | Párrafos | "Chocó. Mirá qué veía." | "Lamentablemente el vehículo ha colisionado debido a…" |
| Del lado de la persona | El error es del caso, no suyo | Culpa | "Esta regla no cubre un auto a la izquierda" | "Programa inválido" |

### Tono por situación [Propuesta]

- **Primera vez:** paciente y con una sola acción. "Manejá con las flechas. Fijate qué ve el auto."
- **Choque o error:** empático, con la causa y el paso siguiente. "Chocó con un auto a la derecha. Ningún sensor lo veía. Probá otra regla."
- **Logro:** proporcionado y que abra la pregunta siguiente. "Llegó a 300 m. ¿Anda en una pista que no vio?"
- **Acción que pierde trabajo:** serio y con salida. "Restableciste el programa. Deshacer."
- **Mentor (guía oculta):** mínimo; solo la pregunta de la etapa y los rótulos.

### Verbos de reinicio [Propuesta]

| Verbo (es / en) | Alcance | Qué no toca | Deshacer |
|---|---|---|---|
| **Reiniciar** / *Restart* | Vuelve a empezar la corrida actual: el auto a la salida, la carrera desde cero, la generación desde cero. | Los ajustes, el programa, el cerebro, la biblioteca. | Si había generaciones o trabajo: sí, 8 s o más. |
| **Restablecer** / *Reset* | Vuelve a los valores de fábrica de lo que nombra: "Restablecer ajustes", "Restablecer programa", "Restablecer red". | Lo que no nombra; la biblioteca nunca. | Siempre, 8 s o más. |

Regla [Propuesta]: Restablecer nunca va solo; siempre lleva su objeto ("Restablecer ajustes de esta etapa"). Reiniciar puede ir solo porque su objeto es la corrida en curso.

### Escalera de vocabulario [Propuesta]

Cada término se define en pantalla, en una línea, la primera vez que aparece visible en el recorrido (spec *Vocabulario escalonado*). Las definiciones en inglés no son traducción literal: dicen lo mismo con la misma brevedad.

| Término (es / en) | Etapa de primera aparición | Definición en una línea (es) | One-line definition (en) |
|---|---|---|---|
| sensor / *sensor* | Problema | Un rayo que mide a qué distancia hay algo. | A ray that measures how far away something is. |
| percepción / *perception* | Problema | Los números que el auto recibe de sus sensores. | The numbers the car gets from its sensors. |
| regla / *rule* | Reglas a mano | Un "si pasa esto, hacé aquello" que escribís vos. | An "if this, do that" you write yourself. |
| población / *population* | Aprender (evolución) | Muchos autos que prueban a la vez, cada uno con su red. | Many cars trying at once, each with its own network. |
| **fitness** / *fitness* | Aprender (evolución) | Qué tan bien le fue a un auto, medido en metros o segundos. | How well a car did, measured in meters or seconds. |
| generación / *generation* | Aprender (evolución) | Una ronda: todos manejan, se eligen los mejores, se arma la siguiente. | One round: everyone drives, the best are picked, the next is built. |
| **élite** / *elite* | Aprender (evolución) | Los mejores, que pasan sin cambios a la siguiente generación. | The best ones, copied unchanged to the next generation. |
| **mutación** / *mutation* | Aprender (evolución) | Cambios al azar en los pesos de los hijos. | Random changes to the children's weights. |
| **cruce** / *crossover* | Aprender (evolución, Avanzado) | Un hijo que toma pesos de dos padres. | A child that takes weights from two parents. |
| campeón / *champion* | Aprender (evolución) | El mejor auto de la última generación; se puede guardar. | The best car of the last generation; you can save it. |
| red neuronal / *neural network* | Aprender (evolución) | Una cuenta con pesos que convierte lo que ve en qué hacer. | A calculation with weights that turns what it sees into what to do. |
| **peso** / *weight* | Aprender (gradiente) | Cuánto cuenta una entrada para una neurona; es lo que se aprende. | How much an input counts for a neuron; it's what gets learned. |
| **sesgo** / *bias* | Aprender (gradiente) | Un número que se suma siempre, aunque las entradas den cero. | A number always added, even when the inputs are zero. |
| **activación** / *activation* | Aprender (gradiente) | La forma en que una neurona convierte su suma en su salida. | How a neuron turns its sum into its output. |
| error / *error* (*loss*) | Aprender (gradiente) | Cuánto se equivoca la red con los ejemplos. | How wrong the network is on the examples. |
| **época** / *epoch* | Aprender (gradiente) | Una pasada de la red por todos los ejemplos. | One pass of the network over all the examples. |
| **tasa de aprendizaje** / *learning rate* | Aprender (gradiente) | Cuánto se mueve cada peso en cada corrección. | How far each weight moves in each correction. |
| **apartados** / *held-out* (validation) | Aprender (gradiente) | Ejemplos que la red no usa para aprender, para ver si generaliza. | Examples the network doesn't learn from, kept to check if it generalizes. |
| sobreajuste / *overfitting* | Aprender (gradiente) | Cuando acierta en lo que vio y falla en lo que no. | When it gets the seen examples right and fails on new ones. |
| generalizar / *generalize* | Evaluar | Andar bien en casos que no vio al aprender. | Doing well on cases it didn't see while learning. |
| neurona / *neuron* | Entender | Una suma con pesos que pasa por su activación. | A weighted sum passed through its activation. |

Nota sobre el orden [Propuesta]: "peso", "sesgo" y "activación" aparecen primero en Aprender por gradiente porque ahí se tocan. Si la persona entra directo a Entender, la definición aparece ahí: "primera vez que aparece visible" se cuenta por persona, no por orden del recorrido. Los diez términos de la spec están en negrita.

---
