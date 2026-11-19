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

# Parte 2. Contraste con la V1

Desde acá se abrió la V1 (commit `767f239`), sus capturas y lo aprendido antes. La Parte 1 no se tocó.

**Evidencia.** Las capturas están en `borradores/interfaz-v2/v1/` (locales, no van a git), con su índice en `v1/indice.md`. Se citan como `1a-1440` = `v1/1a-problema-inicio-1440.png`. Las medidas por vista están en `v1/medidas-<tamaño>.json`; las sacó el guion `borradores/interfaz-v2/capturar-v1.mjs` en Chrome sin ventana, con reloj virtual, perfil vacío y guía, ayudas y atajos encendidos (lo de fábrica).

Vistas: seis pestañas × dos estados × tres tamaños = 36.

| Clave | Pestaña | Estado |
|---|---|---|
| 1a / 1b | El problema | inicio / manejando (↑ 2,5 s) |
| 2a / 2b | Reglas a mano | inicio / choque (Reintentar solo apagado, programa que choca) |
| 3a / 3b | Entrenar | inicio / generación terminada ("Siguiente") |
| 4a / 4b | Competir | inicio / carrera (8 s después de "Largar") |
| 5a / 5b | Inspeccionar | inicio / neurona elegida (en pausa, tercera oculta) |
| 6a / 6b | Laboratorio | inicio / compuerta resuelta ("Ver una solución" en AND) |

## 2.1 Medidas de la V1 por vista

[Medido] por `capturar-v1.mjs`. "Controles" = controles interactivos dentro de la ventana; "escena" = el lienzo del auto (`stage-canvas`), en px y en % de la ventana; "desplaza" = zonas con contenido escondido que piden desplazar (visible/total en px); "chicos" = objetivos de menos de 24 px en un lado (sin contar deslizadores); "principal" = botones con estilo de acción principal a la vista.

| Vista | 1440×900: controles · escena · desplaza · chicos · principal | 1366×768: escena · desplaza | 800×600: escena · desplaza |
|---|---|---|---|
| 1a problema | 41 · 400×779 (24 %) · — · 4 · Pausar | 400×647 (24,7 %) · — | 434×244 (22 %) · tablero 198/700 |
| 1b manejando | 41 · igual · — · 4 · Pausar | igual · — | igual |
| 2a reglas | 71 · 300×639 (14,8 %) · tablero 779/920 · 8 · Pausar | 300×507 (14,5 %) · tablero 647/788 | **80×286 (4,8 %)** · tablero 443/781 |
| 2b choque | 63 · 300×611 (14,1 %) · tablero 779/920 · 8 · "Compará con los ejemplos" | 300×479 · tablero 647/788 | **80×187 (3,1 %)** |
| 3a entrenar | 59 · 400×590 (18,2 %) · — · 3 · Pausar; red 601×214 | 400×458 · tablero 647/655; **red 527×120** | **434×42 (3,8 %)** · tablero 188/674 |
| 3b generación | 59 · igual; red 601×193 · — · 3 · Pausar | tablero 647/692 | igual, tablero 188/765 |
| 4a competir | 51 · 400×779 (24 %) · — · 6 · Largar | 400×647 · — | 434×231 · tablero 188/493, panel 420/640 |
| 4b carrera | 53 · igual · — · 6 · Pausar | igual · — | igual |
| 5a inspeccionar | 79 · 374×616 (17,8 %); red 667×642 (33 %) · — · 6 · Pausar | 368×484; red 599×467 · — | 408×178; red 434×120 · **sin acción principal a la vista** |
| 5b neurona | 98 (91 sin desplazar) · igual · tarjeta 395/420 · 7 · Reproducir | tarjeta de la neurona **263/420** | tarjeta **59/420** |
| 6a laboratorio | 70 · plano 376×340; red 667×550 · — · 6 · ninguno (se destaca "Arrastrá un peso") | red 599×418 | red 434×120 |
| 6b compuerta | 72 · igual · — · 6 · Reproducir | red 599×383 | red 434×120 |

Medidas que valen para las 36 vistas [Medido]:

- `mlLab.auditHierarchy()`: 0 problemas en todas. `mlLab.auditTooltips()`: 0 controles sin tooltip en todas (el JSON de la corrida guarda `2`, que es el largo de la lista vacía `[]`; el guion ya se corrigió para la próxima corrida).
- `mlLab.auditSistema()`: 0, salvo 3 en la carrera de Competir (4b, los tres tamaños) y 5 en Reglas a mano a 800×600. No se miró el detalle.
- Controles sin nombre accesible: 0.
- Textos con contraste por debajo de 4,5:1 (3:1 si son grandes) contra el primer fondo opaco: 0 en las 36. No mide texto sobre lienzo ni sobre degradé.
- Tamaños de letra a la vista: 5 a 7 por vista, de 12 a 32 px.
- La medida de "textos cortados" contó textos solo para lectores de pantalla (`sr-only`) y no sirve. Los cortes se juzgan en las capturas.

## 2.2 Evaluación heurística por pestaña

Método: `design-skills:design-critique` (Nielsen H1–H10, leyes de UX, *excise* y arquitectura de información). Severidad de Nielsen: 1 cosmético, 2 menor, 3 mayor, 4 catástrofe. Cada fila lleva su captura o su medida.

### Transversales (toda la app)

| # | Hallazgo | Principio | Sev. | Evidencia | Rótulo |
|---|---|---|---|---|---|
| T1 | Lo primero que hay arriba en todas las pestañas es la barra del escenario, a todo el ancho (9 a 12 ajustes). La pregunta de la etapa no aparece en ninguna pantalla: la consigna es una instrucción ("Manejá con las flechas…"), no la pregunta del recorrido. | Jerarquía visual; IA (orientación); Art. 13 | 3 | `1a-1440`, `2a-1440`, `3a-1440` | Observado |
| T2 | La escena nunca pasa de un cuarto de la ventana: 24 % en El problema y Competir, 18 % en Entrenar y en Inspeccionar, 14,8 % en Reglas a mano. Es la misma columna de 300–400 px en todas. | Von Restorff; Art. 2 (mostrar) | 3 | tabla 2.1 | Medido |
| T3 | Disposición distinta por pestaña: escena + tablero + panel en El problema, Entrenar y Competir; escena + percepción + editor sin panel en Reglas; escena chica + red + panel en Inspeccionar; plano + red + panel en el Laboratorio. | H4 consistencia; Art. 9 | 2 | `1a`, `2a`, `5a`, `6a` a 1440 | Observado |
| T4 | Los valores del escenario no se comparten: Irregularidad 50 % en El problema y Reglas, 0 % en Entrenar, Competir e Inspeccionar. Nada lo rotula "de esta pestaña". | H4; modelo mental | 3 | `1a-1440`, `3a-1440`, `4a-1440` | Observado; la confusión es Hipótesis |
| T5 | La navegación dice dónde estoy (pestaña resaltada) pero no qué pregunta responde cada etapa ni qué sigue. No hay paso a la siguiente al cumplir. | IA (navegación); Zeigarnik; goal-gradient | 2 | barra superior en todas | Observado |
| T6 | Varios "Restablecer" y "Reiniciar" con el mismo estilo y sin alcance en la etiqueta. En Reglas a mano hay dos "Restablecer" a la vez (escenario y programa); en el Laboratorio, "Restablecer", "Reiniciar pesos", "Red de siempre" y "Restablecer la red". Lo que pierde trabajo se confirma con un diálogo, no con deshacer. | H3; H5; prevención | 3 | `2a-1440`, `6b-1440`; `rules.confirm.reset`, `train.confirm.restart` en el código | Observado |
| T7 | Nada indica que un control tiene tooltip, aunque todos lo tienen. | H10; descubrimiento | 2 | auditoría de tooltips en 0; ningún indicio en las capturas | Medido y Observado |
| T8 | A 800×600 la barra superior muestra solo las pestañas 1 a 3: las otras tres quedan fuera sin aviso. | H6; IA | 3 | `2a-800`, `3a-800` | Observado |
| T9 | Guía, Ayudas y Atajos: interruptores con nombre accesible, pero en pantalla no dicen qué ocultan. | H6; H2 | 2 | barra superior; nombres medidos en el navegador | Medido y Observado |

### El problema

| # | Hallazgo | Principio | Sev. | Evidencia | Rótulo |
|---|---|---|---|---|---|
| E1 | La acción principal es "Pausar (espacio)", pero la consigna pide manejar con el teclado. El botón compite con la manipulación directa que pide la consigna. | Art. 13; Von Restorff | 2 | `1a-1440` | Observado |
| E2 | Las cuatro teclas de "Lo que estás accionando" siguen pareciendo botones (contorno, icono y texto), y no se tocan. Izquierda y Derecha además reciben foco con Tab; Avanzar y Retroceder no. | Affordance; H4 | 2 | `1a-1366`; recorrido con Tab en el navegador | Observado y Medido |
| E3 | El cartel "Manejá con las flechas" sobre la escena y la cinta del manejo dan propósito al centro, que antes estaba vacío. | — (a conservar) | 0 | `1a-1440` | Observado |
| E4 | A 800×600 la escena queda en 434×244 y el tablero esconde 502 de 700 px. | Fitts; *excise* de desplazamiento | 3 | tabla 2.1 | Medido |

### Reglas a mano

| # | Hallazgo | Principio | Sev. | Evidencia | Rótulo |
|---|---|---|---|---|---|
| R1 | 71 controles a la vista a 1440×900, la cifra más alta después de Inspeccionar. | Hick; H8 | 3 | tabla 2.1 | Medido |
| R2 | La escena es la más chica de la app (300 px de ancho, 14,8 %). A 800×600 queda en 80 px de ancho: inservible. | Art. 2; spec de 800×600 | 4 a 800, 2 a 1440 | `2a-800`, tabla 2.1 | Medido |
| R3 | La acción principal es "Pausar", y la tarea es escribir reglas. | Art. 13 | 2 | `2a-1440` | Observado (ya en la crítica de Reglas) |
| R4 | La lista de misiones no está a la vista a 1440×900: el tablero esconde 141 px. | Zeigarnik; false floor | 2 | `2a-1440`, tablero 779/920 | Medido |
| R5 | Al chocar: el aviso abajo de la escena dice qué líneas se cumplían, ofrece repetición del choque y dos caminos ("Compará con los ejemplos", "Escribir una regla para este caso"). | H9 (a conservar) | 0 | `2b-1440` | Observado |
| R6 | "Reintentar solo" viene encendido: el choque, que es el momento que enseña, se reintenta solo salvo que la persona lo apague. | Peak-end; H1 | 2 | `2a-1440` (interruptor encendido) | Observado |
| R7 | Las agarraderas "Mover regla" (16×24) y "Borrar esta ficha" (19×24) no llegan a 24 px de ancho. | Fitts; WCAG 2.5.8 | 2 | `medidas-1440x900.json` | Medido |

### Entrenar

| # | Hallazgo | Principio | Sev. | Evidencia | Rótulo |
|---|---|---|---|---|---|
| N1 | El fin de generación ahora se muestra sobre la escena ("Así nace la generación 2", élite y mutación en una frase) y la mutación se ve en la red. | Peak-end (a conservar) | 0 | `3b-1440` | Observado |
| N2 | Los ajustes del aprendizaje siguen en tres lugares: la barra (sensores, escenario y auto), "Probá esto" en el panel (fitness, población, mutación) y la subpestaña "Ajustes". Más "Cerebros" aparte. | H6; *excise* de navegación | 3 | `3a-1440`, `3b-1440` | Observado |
| N3 | "Función de fitness" aparece en "Probá esto" sin definición en pantalla; "Ventaja" no se explica. | H2; spec *Vocabulario escalonado* | 2 | `3b-1440` | Observado |
| N4 | A 1366×768 la red del líder mide 527×120 px. | Visibilidad | 2 | tabla 2.1 | Medido |
| N5 | A 800×600 la escena mide 434×42 px: no se ve la población. | spec de 800×600 | 4 | `3a-800` | Medido |
| N6 | "Cerebros (1)" sube solo al terminar la generación (autoguardado), sin aviso donde se mira. | H1 | 1 | `3b-1440` | Observado |

### Competir

| # | Hallazgo | Principio | Sev. | Evidencia | Rótulo |
|---|---|---|---|---|---|
| C1 | La tabla por pista, con "practicó" y "no la vio", y la frase "Rendir donde no practicó es generalizar" son la mejor explicación de Evaluar de toda la app. | Art. 1 (a conservar) | 0 | `4b-1440` | Observado |
| C2 | El marcador ocupa 330 px de alto con tres filas; la mitad queda vacía. | H8 | 1 | `4b-1440` | Observado |
| C3 | Lo que más pesa en la tarjeta es "Pausar"; la pregunta "¿anda en lo que no vio?" no está escrita en ningún lado salvo en la frase de abajo de la tabla. | T1; Art. 13 | 2 | `4b-1440` | Observado |
| C4 | El ojo (👁) de los competidores es un botón de solo ícono; tiene nombre y tooltip, pero en la imagen no dice qué hace. | H6 | 1 | `4b-1440` | Observado |

### Inspeccionar

| # | Hallazgo | Principio | Sev. | Evidencia | Rótulo |
|---|---|---|---|---|---|
| I1 | La red está al centro y la escena a la izquierda: la disposición invertida de antes ya no está. | (a conservar) | 0 | `5a-1440` | Observado |
| I2 | 79 controles a la vista al abrir y 98 con una neurona elegida; la barra de arriba de la red tiene 13 controles de 24 px. | Hick; H8 | 3 | tabla 2.1; `5b-1440` | Medido |
| I3 | A 1366×768 la tarjeta de la neurona muestra 263 de 420 px: las filas Sensor 5 y Velocidad no se ven sin desplazar. A 800×600, 59 de 420. | spec 1366 sin cortes | 3 | `5b-1366`, `5b-800` | Medido |
| I4 | A 800×600 no hay acción principal a la vista: la barra de marcha queda abajo. | Art. 13 | 3 | `5a-800`, tabla 2.1 | Medido |
| I5 | La leyenda "Cómo se lee la red" ocupa 6 renglones en el panel, siempre a la vista. | H8 | 1 | `5a-1440` | Observado |

### Laboratorio

| # | Hallazgo | Principio | Sev. | Evidencia | Rótulo |
|---|---|---|---|---|---|
| L1 | Los tres experimentos están a la vista como tarjetas con su subtítulo ("resolvé a mano", "que aprenda sola", "que te imite"). | (a conservar) | 0 | `6a-1440` | Observado |
| L2 | En Compuertas, lo destacado es "Arrastrá un peso", y ningún botón tiene estilo principal. Cumple el Art. 13. | (a conservar) | 0 | `6a-1440`, tabla 2.1 | Observado y Medido |
| L3 | Cuatro acciones de vuelta atrás con nombres distintos: "Restablecer" (barra), "Reiniciar pesos", "Red de siempre", "Deshacer" y "Restablecer la red" (franja de cambios). | H4; T6 | 3 | `6b-1440` | Observado |
| L4 | "Tasa de aprendizaje", "tanh", "sigmoide", "ReLU" y "Capas ocultas" están a la vista al abrir, sin definición en pantalla. "Época" sí tiene su ayuda. | spec *Vocabulario escalonado*; H2 | 2 | `6a-1440` | Observado |
| L5 | "Curvas de error" ocupa la mitad baja de la columna izquierda con "todavía sin aciertos" en el estado inicial. | Blank slate | 1 | `6a-1440` | Observado |
| L6 | Los campos de entrada A y B miden 42×18 px. | WCAG 2.5.8 | 2 | `medidas-1440x900.json` | Medido |

### Arquitectura de información (resumen)

- **Organización** [Observado]: seis pestañas por experiencia, numeradas. Siguen el orden del recorrido, pero Laboratorio (6) queda después de Inspeccionar (5), así que el gradiente llega después de "entender" (ver 1.4).
- **Rótulos** [Observado]: los nombres de pestaña son sustantivos o verbos sueltos ("Entrenar", "Competir") y no la pregunta. Hay rótulos de rol en todas partes ("Entra · lo que percibe", "Sale · lo que acciona", "Decide · la red"): son consistentes y es un acierto.
- **Navegación** [Observado]: global, plana y libre. Sin "siguiente etapa" ni progreso del recorrido.
- **Búsqueda**: no hace falta.

## 2.3 Cruce con lo ya aprendido

Fuentes: P1 a P14 de `borradores/analisis-ux/informe.md` (17 de noviembre), las dos críticas de `borradores/sistema-de-diseno/` y las notas de *Prioridad 1 y 2* y de *Ayudas, guía y accesibilidad* de `PENDIENTES.md`. Cada punto se volvió a ver en las capturas de 2.1 o en el navegador.

| Problema anterior | Estado hoy | Lo que se ve ahora | Evidencia |
|---|---|---|---|
| P1 No hay acción principal | **resuelto** | Una sola acción principal en 33 de 36 vistas; las otras tres son 800×600 (fuera de la ventana) o el Laboratorio, donde se destaca el arrastre a propósito. | tabla 2.1 [Medido] |
| P2 La consigna está al final | **cambió** | La tarjeta de consigna está arriba del panel, pero la barra del escenario sigue arriba de todo (T1). | `1a-1440` |
| P3 Ajustes al mismo nivel y repartidos | **cambió** | Entrenar tiene "Probá esto", pero los ajustes siguen en tres lugares (N2). | `3b-1440` |
| P4 Misiones al final, sin llevar al control | **cambió** | La misión en curso está en la tarjeta con "Mostrame"; la lista sigue abajo y en Reglas no se ve a 1440 (R4). | `2a-1440`, `1a-1440` |
| P5 Laboratorio: tres experiencias tras un selector chico | **resuelto** | Tres tarjetas y el arrastre destacado (L1, L2). | `6a-1440` |
| P6 Barra que cambia y valores no compartidos | **sigue** | Irregularidad 50 % y 0 % según la pestaña (T4); la barra cambia de contenido (Meta en Competir, Experimento en Laboratorio). | `1a`, `3a`, `4a`, `6a` |
| P7 Muchos Restablecer y Reiniciar | **sigue** | T6, L3. | `2a-1440`, `6b-1440` |
| P8 Guía, Ayudas y Atajos sin explicación ni nombre | **cambió** | Tienen nombre accesible y tooltip; en pantalla siguen sin decir qué ocultan (T9). | navegador [Medido] |
| P9 Inspeccionar invertido, muchos controles, guía que se pierde | **cambió** | Disposición resuelta (I1); los controles subieron a 79–98 (I2). | `5a-1440`, `5b-1440` |
| P10 Cortes y desbordes | **cambió** | Los de Competir y "ChoquesEstado" ya no se ven; quedan la tarjeta de la neurona a 1366 (I3), el tablero de Reglas (R4) y todo 800×600 (E4, R2, N5, T8). | tabla 2.1 |
| P11 Tooltips que no se anuncian | **sigue** | T7. | capturas |
| P12 Vocabulario sin escalonar | **sigue** | N3, L4. | `3b-1440`, `6a-1440` |
| P13 Primer manejo frustrante | **cambió** | Cartel de primer manejo en la escena (E3). Las teclas de salida siguen pareciendo botones (E2). El volante suave no se probó acá. | `1a-1440` |
| P14 Espacio vacío | **cambió** | El centro de El problema está lleno (E3). Tu manejo no se capturó: sin verificar. | `1a-1440` |
| Reglas: el ciclo editar → mirar cruza la pantalla | **cambió** | La percepción está pegada a la escena (x 300–520) y el editor sigue a la derecha (x 545–1420). | `2a-1440` |
| Reglas: el choque dura 1,5 s y desaparece | **cambió** | Con "Reintentar solo" apagado el choque queda, con repetición; viene encendido (R6). | `2a-1440`, `2b-1440` |
| Reglas: el cartel de choque tapa la escena y no explica | **resuelto** | R5. | `2b-1440` |
| Reglas: Rayos es un deslizador más | **resuelto** | Rayos, Alcance y Apertura en la cabecera del programa. | `2a-1440` |
| Reglas: un ejemplo cambia Rayos sin avisar | **sin verificar** | No se capturó un ejemplo cargado. | — |
| Reglas: dos Restablecer y dos títulos "Programa" | **cambió** | Un solo título "Programa"; siguen los dos Restablecer. | `2a-1440` |
| Reglas: "Reglas 1" pesa como Distancia | **resuelto** | "Reglas 1" con número grande en la cabecera. | `2a-1440` |
| Reglas: 63 controles | **sigue** | 71 [Medido]. | tabla 2.1 |
| Reglas: deslizadores nativos | **resuelto** | Deslizadores con estilo propio. | `2a-1440` |
| Reglas: objetivos de 24 px | **sigue** | R7. | medidas |
| Entrenar: el fin de generación es una línea | **resuelto** | N1. | `3b-1440` |
| Entrenar: la marcha desaparece al cambiar de vista | **resuelto** | La marcha vive bajo la escena. | `3b-1440` |
| Entrenar: el panel desborda a 1440 | **resuelto** | Sin zonas con desplazamiento a 1440 [Medido]. A 1366 el tablero esconde 8 a 45 px. | tabla 2.1 |
| Entrenar: ajustes en cuatro lugares | **sigue** | N2. | `3b-1440` |
| Entrenar: la curva no marca cuándo se cambió algo | **sin verificar** | El cambio archivado dice que sí; no se cambió ningún ajuste en la captura. | — |
| Entrenar: red de 120 px a 1366 | **sigue** | N4 [Medido 527×120]. | tabla 2.1 |
| Entrenar: el contador de Cerebros sube solo | **sigue** | N6. | `3b-1440` |
| PENDIENTES: barra de pestañas que se corta a 1032 px | **sigue** | A 800 solo se ven tres pestañas (T8). No se midió a 1032. | `2a-800` |
| PENDIENTES: Inspeccionar a 1366 sin nada elegido pide 67 px | **resuelto** | Sin desplazamiento en `5a-1366` [Medido]. | tabla 2.1 |
| PENDIENTES: el editor de Reglas corta el recorrido con Tab | **cambió** | Tab queda en el editor; Esc y después Tab sale, y la pista está escrita en la tarjeta del programa [Medido en el navegador]. | navegador |
| PENDIENTES: tooltips que nombran la tecla con los atajos apagados | **sin verificar** | No se probó con los atajos apagados. | — |
| PENDIENTES: ejemplos de Reglas que solo valen a 20 m/s | **sin verificar** | No es de interfaz; no se midió. | — |

## 2.4 Máquinas de estado de cada experiencia

Método: `design-skills:interaction-design` (estados explícitos, retroalimentación, deshacer). Se leyeron las capturas y el código de las pestañas (`src/tabs/*/index.js`) solo para los estados. **[Observado]** salvo donde se dice. Las marcas: ⚠ sin retroalimentación clara; ↶ sin deshacer (se confirma con un diálogo o no hay vuelta).

**El problema**
```
[Lista] --flecha--> [Manejando] --espacio--> [En pausa] --espacio--> [Manejando]
[Manejando] --choque--> [Choque: aviso + "Reiniciar (R)"] --R--> [Lista] (Intentos +1)
[cualquiera] --cambio de escenario--> [Lista] ⚠ el auto vuelve a la salida sin decirlo
[cualquiera] --Restablecer (barra)--> valores de fábrica ↶ sin deshacer
```

**Reglas a mano**
```
[Corriendo programa] --edición válida--> [Corriendo con el programa nuevo] (rige al instante)
[Corriendo] --edición con error--> [Corriendo con el último válido] + líneas marcadas ✕
[Corriendo] --choque--> Reintentar solo encendido: [Choque 1,5 s] --> [Corriendo] ⚠ el choque se va solo
                        Reintentar solo apagado: [Choque congelado + repetición + caso] --Reiniciar--> [Corriendo]
[cualquiera] --ejemplo--> [Corriendo el ejemplo] ⚠ sin verificar si avisa el cambio de sensores
[cualquiera] --Restablecer programa--> diálogo de confirmación --> [Programa de fábrica] ↶ sin deshacer
[cualquiera] --Importar archivo inválido--> mensaje de error en lenguaje llano (no capturado)
```

**Entrenar**
```
[Generación en curso] --espacio--> [En pausa] --espacio--> [Generación en curso]
[Generación en curso] --fin (todos fuera / tiempo / estancada / "Siguiente")--> [Corte: "Así nace la generación N"] --> [Generación N+1]
[Generación en curso] --cambio de ajuste--> [Pendiente hasta la próxima generación] (marca en la subpestaña)
[Selección: Vos] --fin de generación--> [Elegir padre] --elegir--> [Generación N+1] (con deshacer, según el cambio archivado)
[cualquiera] --Reiniciar / Población nueva--> diálogo "deja atrás N generaciones" --> [Generación 1] ↶ sin deshacer (el campeón queda autoguardado)
[cualquiera] --Guardar campeón--> [Guardado] ⚠ el contador de Cerebros también sube solo con el autoguardado
```

**Competir**
```
[Lista: cartel "Largar"] --Largar--> [Cuenta regresiva] --> [Carrera] --espacio--> [En pausa]
[Carrera] --todos llegan o terminan--> [Fin: marcador final + tabla por pista]
[Fin] --Reiniciar--> [Lista misma carrera]; --Otra carrera--> [Lista, tráfico nuevo]
[Lista] --agregar o quitar competidor--> [Lista] (sin deshacer; quitar es reversible agregando)
```

**Inspeccionar**
```
[Corriendo] --espacio--> [En pausa] --Paso / Atrás--> [En pausa, cuadro ±1] (de a cuadro, capa, neurona u operación)
[En pausa] --elegir neurona--> [Neurona elegida: tarjeta Cuenta/Respuesta] --Soltar--> [En pausa]
[Neurona elegida] --Apagar / cambiar peso--> [Red cambiada: franja "N cambios" + Deshacer + Restablecer la red + Ver original]
[Corriendo] --Manejar vos--> [Manejás vos, la red mira] --devolver--> [Corriendo]
[Choque] --> repetición del caso
```

**Laboratorio**
```
[Experimento: Compuertas | Puntos | Tu manejo] (tres tarjetas, cambia sin perder lo de cada una: sin verificar)
Compuertas: [Pesos a mano] --arrastrar peso--> [Tabla de verdad recalculada al instante]
            --Ver una solución--> [Resuelta 4 de 4] ⚠ cambia todos los pesos de una vez; Deshacer existe en la franja de cambios
            --Reproducir / Paso--> [Aprendiendo: época, ejemplo, fase, capa, neurona] --pausa--> [En pausa]
[cualquiera] --Reiniciar pesos / Red de siempre / Restablecer--> ↶ tres alcances distintos sin deshacer visible (L3)
```

Dónde la V1 no da retroalimentación o no deja deshacer [Observado]:

1. Restablecer el programa, reiniciar el entrenamiento y Población nueva se confirman con un diálogo; no hay "Deshacer" (spec *Reinicios con alcance explícito* pide deshacer de 8 s).
2. "Reintentar solo" encendido hace que el choque de Reglas a mano se vaya solo.
3. Cambiar el escenario reinicia la corrida sin aviso en El problema [Hipótesis: no se probó cada pestaña].
4. "Ver una solución" reemplaza los pesos del Laboratorio; hay Deshacer, pero en la franja de cambios, lejos del botón.
5. El autoguardado sube el contador de Cerebros sin aviso.

## 2.5 Auditoría de accesibilidad (WCAG 2.2 AA), línea de base

Método: `design-skills:accessibility-audit` (capas automática, teclado y visual; la de lector de pantalla no se hizo). Se probó en el navegador del panel a 1440×900 y con las medidas de 2.1.

| Criterio | Resultado | Evidencia | Rótulo |
|---|---|---|---|
| 1.1.1 Contenido no textual | **Falla parcial**: el lienzo de la escena no tiene rol ni nombre; la cinta del manejo sí (`role=img` con descripción). Hay 4 regiones vivas que describen el estado en texto. | navegador | Medido |
| 1.3.1 Información y relaciones | **Falla menor**: en El problema el `h1` llega después de tres `h2` en el orden del documento. Hay `header`, `nav` (tablist con nombre), `main` y `aside`. | navegador | Medido |
| 1.4.3 Contraste (mínimo) | **Pasa** en texto sobre fondo plano: 0 de unos 3700 textos medidos por debajo del mínimo, en las 36 vistas. No se midió texto sobre el lienzo. | medidas 2.1 | Medido |
| 1.4.11 Contraste no textual | **Sin medir de nuevo.** `PENDIENTES.md` anota 1,39:1 en el fondo de la opción elegida (la marca el contorno de 2 px) y 1,31:1 en la tarjeta de consigna. | — | — |
| 1.4.10 Reflujo | **Excepción declarada**: la app es de escritorio y por debajo de 600 px muestra un aviso. | proposal (fuera de alcance) | Observado |
| 2.1.1 Teclado | **Pasa** en lo recorrido: 45 paradas con Tab en El problema, con todos los controles. | navegador | Medido |
| 2.1.2 Sin trampa de teclado | **Pasa con condición**: en el editor de texto de Reglas, Tab queda adentro; Esc y después Tab sale, y la tarjeta lo dice. | navegador | Medido |
| 2.1.4 Atajos de una tecla | **Pasa**: se apagan con "Atajos". | barra superior | Observado |
| 2.3.1 Tres destellos | **Sin medir acá**; la V1 tiene `flash-guard`. | — | — |
| 2.4.1 Evitar bloques | **Pasa** por puntos de referencia (`header`, `nav`, `main`, `aside`); no hay enlace para saltar. | navegador | Medido |
| 2.4.3 Orden del foco | **Falla**: el orden es escena → tablero → panel → pestañas → barra del escenario. La vista lee primero la barra superior y la del escenario. | recorrido con Tab | Medido |
| 2.4.7 Foco visible | **Pasa**: contorno azul de 2 px en 44 de 45 paradas; "Más sobre esta pestaña" usa el contorno del navegador (1 px). | recorrido con Tab | Medido |
| 2.4.11 Foco no tapado | **Sin medir.** | — | — |
| 2.5.7 Arrastre | **Pasa**: las perillas del Laboratorio tienen flechas (▲▼) además del arrastre. | `6a-1440` | Observado |
| 2.5.8 Tamaño del objetivo | **Falla en 4 controles**: "Mover regla" 16×24, "Borrar esta ficha" 19×24, entradas A y B del Laboratorio 42×18, y los rótulos de rol enfocables de 17 px de alto. No se verificó la excepción por espacio. | medidas 2.1 | Medido |
| 3.1.1 Idioma | **Pasa**: `lang="es"`. | navegador | Medido |
| 3.2.6 Ayuda consistente | **Pasa**: "Más sobre esta pestaña" y la tarjeta están en el mismo lugar en las pestañas con panel; Reglas no tiene panel. | capturas | Observado |
| 4.1.2 Nombre, rol y valor | **Pasa**: 0 controles sin nombre en 36 vistas; pestañas con `role=tab` y `aria-selected`; interruptores con `role=switch`. | medidas 2.1, navegador | Medido |
| Movimiento reducido | Hay 3 reglas `prefers-reduced-motion`. | navegador | Medido |

Sin probar: lector de pantalla real, zoom al 200 %, Safari y Firefox. Esta tabla es la línea de base del grupo 16.

## 2.6 Lo que la V1 hace bien (a conservar)

| Qué | Por qué conservarlo | Evidencia | Rótulo |
|---|---|---|---|
| Tooltips con "Qué hace" y "Por qué importa", en todos los controles | Art. 5 cumplido: la auditoría da 0 faltantes en 36 vistas | medidas 2.1 | Medido |
| Rótulos de rol "Entra · lo que percibe", "Decide · el programa / la red", "Sale · lo que acciona" | Hilan las seis pestañas con el mismo contrato entrada → decisión → salida; es la idea central de la promesa | `1a`, `2a`, `5a`, `6a` | Observado |
| Errores del lenguaje de Reglas en lenguaje llano, con el auto siguiendo con el último programa válido | Art. 8 | (no capturado acá; crítica de Reglas) | Observado antes, no vuelto a ver |
| El choque que enseña: aviso con las líneas que se cumplían, repetición y dos caminos | Es el pico de Reglas a mano | `2b-1440` | Observado |
| La tarjeta "Así nace la generación N" y la mutación en la red | Hace visible el fin de generación | `3b-1440` | Observado |
| La tabla por pista con "practicó" y "no la vio" | Es el concepto de Evaluar en una tabla | `4b-1440` | Observado |
| "Ver como la máquina" | Muestra lo que el auto percibe, sin la escena | interruptor en `1a`, `3a` | Observado |
| La cuenta de la neurona: "suma −0,07 + sesgo 0,05 = −0,01 → escalón" | Art. 7: es el cálculo real, legible | `5b-1366` | Observado |
| El arrastre destacado en Compuertas y la tabla de verdad que responde al instante | Art. 3 y 13 | `6a-1440`, `6b-1440` | Observado |
| La tarjeta de consigna con la misión en curso y "Mostrame" | Da propósito y lleva al control | `1a-1440` | Observado |
| Una sola acción principal por vista | Art. 13 | tabla 2.1 | Medido |
| El cartel de primer manejo sobre la escena | Primera impresión amable | `1a-1440` | Observado |
