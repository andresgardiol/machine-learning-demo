# Design

## Context

Ver `proposal.md` para el motivo. Lo que ya está decidido y probado en `teoria-prototipos`:

- La forma: película lado a lado, con índice rotulado, predicción obligatoria y desafío (el dueño la
  eligió el 20 de noviembre de 2026 después de comparar tres formas).
- La figura de "Una neurona": hace la cuenta con `src/core/network.js`; los rayos de los sensores cortan
  en el borde o en un vehículo, y el dibujo y el número salen de la misma cuenta.
- La ayuda de los controles: una línea, fuera de la figura; el punto del plano no tiene.
- La disposición angosta, probada de 600 a 1440 px: figura arriba, texto debajo, índice plegado.
- El contenido de "Una neurona" y de los cinco primeros hitos, ya revisado contra fuentes
  (`openspec/changes/teoria-prototipos/revision-contenido.md`).

Ese código vive en `prototipos/teoria/` (unas 2900 líneas) y no tiene commit. La V1 y la V2 conviven y
no está decidido cuál queda. La V1 no abre una pestaña por dirección; la V2 sí abre una etapa (`#gradiente`).

## Goals / Non-Goals

**Goals:**

- Que sumar un capítulo sea escribir su guion, sus textos y, si hace falta, su figura, sin tocar el
  armazón.
- Que la sección se pueda publicar con tres capítulos y crecer sin rehacer nada.
- Que ningún texto hable de números que la figura no muestra.
- Que nada se publique sin revisión de contenido.

**Non-Goals:**

- Un sistema de contenidos genérico (markdown, plantillas): los capítulos son módulos de JavaScript.
- Compartir componentes de pantalla con la V1 o la V2.
- Medir si la gente aprende.

## Decisions

### D1. Una página, direcciones con `#`

`teoria/index.html` es la única página. Direcciones: `/teoria/` (portada), `/teoria/#historia`,
`/teoria/#neurona` y `/teoria/#neurona/3` (un tramo). Una dirección desconocida muestra la portada.

*Alternativa:* una carpeta por capítulo. Daría direcciones más limpias, pero son once archivos HTML
casi iguales que mantener a mano, sin build. La V2 ya usa `#` para sus etapas.

### D2. Dónde vive el código

```
teoria/index.html            la página
styles/teoria.css            estilos, solo con tokens de styles/tokens.css
src/teoria/
  main.js  rutas.js          arranque y direcciones
  portada.js  historia.js    las dos vistas que no son capítulo
  pelicula.js                el formato de capítulo (D4)
  idioma.js                  idioma inicial y cambio en vivo
  capitulos/indice.js        el temario: id, número, disponible, pestaña
  capitulos/<id>/guion.js    tramos y estado de la figura por tramo (sin idioma)
  capitulos/<id>/figura.js   la figura del capítulo
  capitulos/<id>/cuenta.js   la cuenta, sin DOM
  contenido/<idioma>/<id>.js prosa y fuentes de un capítulo o de la historia
  figuras/                   piezas compartidas: perilla, plano, calle, ayuda
```

Regla de dependencias, con prueba en `tests/architecture.test.js`: `src/teoria/` importa de `src/core`,
de `src/render` y de módulos sin DOM de `src/ui` (hoy, solo `preferences.js` para el idioma); nada
fuera de `src/teoria/` importa de ahí. Los módulos `cuenta.js` y `guion.js` no usan DOM.

El contenido de cada capítulo se carga con `import()` al abrirlo, en el idioma activo: la portada no
descarga los textos de todos los capítulos.

### D3. Lo que se muda de los prototipos

Se mudan: `figuras/` (cuenta, sensores, plano, neurona, figura), `comun/pelicula.js`, `comun/dom.js`,
`historia/`, `contenido/` y los estilos. No se mudan `libro/` ni `pasos/`. Al terminar se borra
`prototipos/teoria/` y su regla de la prueba de arquitectura; las pruebas `tests/teoria-*.test.js` se
adaptan a las rutas nuevas.

### D4. Estado de la figura por tramo

El guion de cada tramo declara el estado de la figura (vista, entradas, pesos, sesgo). El capítulo
guarda, por tramo, lo que la persona cambió:

```
 entrar a un tramo  --> hay cambios guardados de ESE tramo?
                          no --> estado del guion
                          si --> lo que la persona dejo ahi   + aviso junto a "Restablecer"
```

Así el texto de un tramo siempre coincide con la figura al llegar, y lo tocado no se pierde al volver.
Reemplaza la regla del prototipo (la figura conservaba los cambios al pasar de tramo), que dejaba al
texto hablando de otros números. No se guarda entre visitas.

*Alternativa:* textos que leen los números de la figura en vivo. Se descartó: la prosa con números
variables se vuelve rígida y la predicción necesita números fijos.

### D5. Disposición y celular

- Dos columnas (figura fija a la izquierda) cuando entran figura y texto con su ancho mínimo; si no,
  una columna con la figura fija arriba. Los cortes exactos son los medidos en la revisión 2 de los
  prototipos.
- De 360 a 600 px: lo mismo que la disposición angosta. La figura con sus perillas ocupa como máximo
  el 60 % del alto de la ventana; si en una ventana baja no entra ni en su tamaño mínimo, deja de
  quedar fija y se desplaza con el texto. La barra superior se reduce a volver, idioma e ir a la app.
- Las perillas son controles nativos de rango; el punto del plano usa eventos de puntero (mouse y dedo).
- La teoría no muestra el aviso "pensada para escritorio" de la app: es otra página.

### D6. Idioma

La misma clave que la app (`mlLab.language`) y la misma regla de idioma inicial, tomada de
`src/ui/preferences.js`. El selector cambia el idioma en el momento: vuelve a pedir el contenido del
capítulo en el otro idioma y lo pinta en el mismo tramo, sin tocar el estado de la figura.

### D7. Enlaces con la práctica

- En la V1 (`src/ui/app.js`) y en la V2 (`src/v2/shell/shell.js`): un enlace "Teoría" en la barra,
  junto a las herramientas, con `target="_blank"` y el tooltip de la app. Es todo lo que cambia en la
  práctica.
- En la teoría: un enlace "Ir a la app" siempre a la vista, y el cierre de cada capítulo, que nombra la
  pestaña. Los dos llevan a la raíz de la app (la V1). No abren una pestaña en particular: la V1 no lo
  permite hoy y sumarlo queda fuera de alcance. Cuando se decida entre V1 y V2, se cambia un solo
  destino (`capitulos/indice.js`).

### D8. La historia completa

Doce hitos. Los cinco primeros ya están escritos y revisados; los siete nuevos pasan la revisión (D10).

| Año | Hito | Capítulo | En la práctica |
|---|---|---|---|
| 1943 | McCulloch y Pitts: la neurona como cuenta | 1 | Laboratorio |
| 1958 | Rosenblatt: el perceptrón | 1 | Laboratorio, Compuertas |
| 1969 | Minsky y Papert: el XOR | 2 | Laboratorio, XOR |
| años 70 | Primer invierno | (ninguno) | (nada) |
| 1986 | Backpropagation | 6, próximamente | Laboratorio |
| fines de los 80 | Segundo invierno | (ninguno) | (nada) |
| 1997 | Deep Blue: gana programado, no aprendiendo | 0 | Reglas a mano |
| 1998 | LeNet: una red lee cheques | 6, próximamente | Laboratorio |
| 2012 | AlexNet: redes profundas, datos y placas gráficas | 8, próximamente | no la tiene |
| 2016 | AlphaGo: aprender jugando | (ninguno) | no la tiene |
| 2017 | El Transformer | (ninguno) | no la tiene |
| 2022 | Los modelos de lenguaje llegan al público | (ninguno) | no la tiene |

Los vínculos de 1997 a 2022 son propuestos: la revisión de contenido los confirma o los cambia. Con doce
marcas, la línea de tiempo no puede ir a escala lineal sin amontonar el final: se dibuja a escala por
tramos, con un corte marcado, y lo dice.

### D9. Los tres capítulos de este cambio

**0. Programar o aprender** (acompaña a El problema y Reglas a mano). Figura: el auto de dos sensores,
una lista de situaciones y una regla "si el izquierdo pasa de X, doblar".

| # | Pregunta | Se toca |
|---|---|---|
| 1 | ¿Cómo le dirías a un auto cuándo doblar? | Nada: una regla fija y seis situaciones |
| 2 | ¿Qué número le ponés? | El umbral de la regla; cuántas situaciones acierta |
| 3 | ¿Y esta situación? | Aparece una que la regla no cubre; se suma una segunda regla |
| 4 | Predicción: con dos reglas, ¿cuántas quedan mal? | Elegir y ver |
| 5 | ¿Y si los números los eligiera la máquina? | "Buscar": prueba umbrales en orden y se queda con el que más acierta |
| 6 | Desafío: acertar las ocho a mano, y después buscando | Todo |

La búsqueda del tramo 5 es un barrido determinista y el texto lo dice: no es todavía cómo aprende una
red, es la idea de pasar de ejemplos a números. La cuenta de las reglas es una función pura propia con
pruebas; se usa `src/core/rules.js` solo si sirve sin modificarlo.

**1. Una neurona** (Laboratorio, Compuertas). El guion de los prototipos, con D4 aplicado.

**2. Una recta no alcanza** (Laboratorio, XOR y armar la red). Figura: el plano con los cuatro puntos y
una red que crece de una neurona a tres, calculada con `createNetwork` (2 entradas, 2 ocultas, 1 salida,
escalón).

| # | Pregunta | Se toca |
|---|---|---|
| 1 | ¿Podés encenderla solo cuando las entradas son distintas? | Una neurona y los puntos del XOR |
| 2 | ¿Por qué nunca pasa de tres? | Girar la recta: el contador no pasa de 3 de 4 |
| 3 | ¿Y con dos rectas? | Aparece la segunda neurona, con su recta |
| 4 | Predicción: ¿qué zona queda entre las dos? | Elegir y ver |
| 5 | ¿Quién junta las dos respuestas? | La tercera neurona: recibe las otras dos. Se nombra "capa oculta" |
| 6 | Desafío: que la red dé el XOR | Los pesos de la tercera neurona |

Cierra con la pregunta que abre los capítulos siguientes: ¿quién encuentra esos números?

Los siete restantes están en D12.

### D10. Revisión de contenido

Cada capítulo nuevo y cada hito nuevo se revisa contra fuentes antes de darse por hecho. La revisión la
hace la sesión principal, con búsquedas, y deja `revision-contenido-<id>.md` en la carpeta del cambio
con el veredicto de cada afirmación y los textos de reemplazo. Quien implementa aplica las correcciones
y arma la lista de fuentes del capítulo a partir de ese informe. Las cuentas se comprueban con pruebas,
no a ojo.

### D11. Quién hace qué

Como en `teoria-prototipos`: los grupos de armazón, cuentas y pruebas van a una sub-sesión Opus 5.5
medium; los de figuras, dibujos, textos y disposición, a una sub-sesión Fable 5.2 medium. En `tasks.md`
cada grupo lo dice. Comparten el checkout, una después de la otra.

### D12. Los capítulos 3 a 9

El dueño pidió los diez capítulos en este cambio (20 de noviembre de 2026). Mismo molde que D9: seis
tramos, una figura que se transforma, una predicción y un desafío. Reglas comunes:

- La cuenta de cada figura sale del núcleo (`src/core`), sin modificarlo.
- Todo azar usa semilla (`src/core/random.js`): la misma figura muestra siempre lo mismo.
- Todo desafío tiene una solución conocida, comprobada por una prueba. Ninguna prueba mide si algo
  "aprende" ni en cuántos pasos: eso lo mira el dueño.
- Cada capítulo cierra con un bloque plegado "Para profundizar": la fórmula con su nombre y una frase.

**3. La cuenta hacia adelante** (Inspeccionar: paso a paso). Figura: la red 2-2-1 del capítulo 2, que
se recorre de a una neurona; al final, la red del auto (5 entradas, 4 salidas) solo para mirar. Cuenta:
`computeDetailed`.

| # | Pregunta | Se toca |
|---|---|---|
| 1 | ¿En qué orden hace la cuenta una red? | Nada: se ve pasar la señal |
| 2 | ¿Qué hace cada neurona cuando le toca? | "Paso": avanza de a una neurona |
| 3 | ¿De dónde saca sus entradas la última? | Las entradas; se nombran "capa" y "hacia adelante" |
| 4 | Predicción: con estas entradas, ¿qué sale? | Elegir y ver |
| 5 | ¿Y la red del auto? | Cinco sensores y cuatro teclas: la misma cuenta, más ancha |
| 6 | Desafío: elegir entradas para que la red se encienda | Las entradas |

**4. Medir el error** (Laboratorio: error de un ejemplo, curvas). Figura: una neurona con salida suave
y una lista de ejemplos con su respuesta correcta. Cuenta: `softOutput`, `outputLoss` y `exampleError`
de `src/core/backprop.js` (la medida es la entropía cruzada, la que usa la app).

| # | Pregunta | Se toca |
|---|---|---|
| 1 | ¿Cómo sabe una red que se equivocó? | Nada: ejemplos con su respuesta correcta |
| 2 | ¿Se equivocó por mucho o por poco? | El escalón no lo dice; pasa a una salida suave, entre 0 y 1 |
| 3 | ¿Cuánto vale ese error? | Un ejemplo: la respuesta y la correcta; se nombra "error" |
| 4 | Predicción: ¿cuál de estas dos tiene menos error? | Elegir y ver |
| 5 | ¿Y el error de todos los ejemplos juntos? | Un peso; el error dibuja una curva |
| 6 | Desafío: bajar el error a mano | Los pesos y el sesgo |

**5. Corregir un poco cada vez** (Laboratorio: tasa de aprendizaje). Figura: la curva del error contra
un peso, con una bolita; después, el mapa del error contra dos pesos. Cuenta: `backward` y `corrections`
de `backprop.js` sobre la neurona del capítulo 4.

| # | Pregunta | Se toca |
|---|---|---|
| 1 | ¿Para qué lado muevo la perilla? | El peso, a ciegas |
| 2 | ¿Hay algo que diga para dónde? | La pendiente de la curva; se nombra "gradiente" |
| 3 | ¿Cuánto me muevo? | La tasa de aprendizaje; "Un paso" |
| 4 | Predicción: con una tasa muy alta, ¿qué pasa? | Elegir y ver: rebota o se va |
| 5 | ¿Y con dos pesos? | El mapa del error; la bolita baja: "descenso por gradiente" |
| 6 | Desafío: llegar al fondo en pocos pasos | La tasa |

Es el capítulo que cubre el hueco 1 de `PENDIENTES.md` (el error como paisaje) del lado de la teoría.

**6. Repartir la culpa** (Laboratorio: un ejemplo, paso a paso). Figura: la red 2-2-1 con salida suave;
la cuenta va y la culpa vuelve. Cuenta: `forwardSoft`, `backward`, `corrections`, `applyCorrections`.

| # | Pregunta | Se toca |
|---|---|---|
| 1 | Con capas, ¿qué peso tuvo la culpa? | Nada: un ejemplo y su error |
| 2 | ¿Cuánta culpa tiene la salida? | "Paso": aparece la culpa de la salida |
| 3 | ¿Cómo llega la culpa a las de atrás? | "Paso": cada conexión lleva culpa según su peso |
| 4 | Predicción: ¿qué peso cambia más? | Elegir y ver |
| 5 | ¿Y si se repite con todos los ejemplos? | "Corregir": una pasada por los ejemplos; la curva del error. Se nombran "backpropagation" y "época" |
| 6 | Desafío: corregir un peso a mano, en el sentido que indica la culpa, hasta bajar el error | Un peso |

**7. Aprender por evolución** (Entrenar). Figura: una población de doce neuronas, cada una un punto
sobre el mapa del error del capítulo 5, con su puntaje. Cuenta: `mutate` de `src/core/evolution.js` si
sirve sin modificarlo, y azar con semilla.

| # | Pregunta | Se toca |
|---|---|---|
| 1 | ¿Y si nadie sabe la respuesta correcta de cada paso? | Nada: manejar solo da un puntaje al final |
| 2 | ¿Qué pasa si pruebo muchas al azar? | "Otra tanda": doce al azar; se nombran "población" y "fitness" |
| 3 | ¿Con cuáles me quedo? | Cuántas pasan; se nombran "selección" y "élite" |
| 4 | ¿Cómo salen las siguientes? | La fuerza del cambio; se nombran "mutación" y "generación" |
| 5 | Predicción: con la mutación en cero, ¿qué pasa? | Elegir y ver |
| 6 | Desafío: elegir vos los padres tres generaciones seguidas | Elegir padres |

**8. Generalizar o memorizar** (Competir; Laboratorio: ejemplos apartados). Figura: puntos de dos
clases con ruido (`pointsDataset` y `splitDataset` de `src/core/datasets.js`) y dos formas de contestar:
una recta, y un memorizador que responde como el ejemplo visto más parecido.

| # | Pregunta | Se toca |
|---|---|---|
| 1 | Si acierta todo lo que vio, ¿sabe? | Nada: los dos aciertan lo visto |
| 2 | ¿Cómo contesta cada uno? | Elegir cuál mirar; se ve la zona de cada respuesta |
| 3 | ¿Y con puntos que nunca vieron? | "Puntos nuevos"; se nombran "ejemplos apartados" |
| 4 | Predicción: ¿quién acierta más en los nuevos? | Elegir y ver |
| 5 | ¿Cómo se llama eso? | El ruido de los datos; se nombran "sobreajuste" y "generalizar" |
| 6 | Desafío: elegir cuántos apartar y quedarse con el que rinde mejor en ellos | Los apartados |

**9. Qué quedó adentro** (Inspeccionar: apagar partes, qué detecta cada neurona). Figura: la red del
XOR, con el mapa de lo que enciende a cada neurona oculta. Cuenta: `forwardValues` con partes apagadas.

| # | Pregunta | Se toca |
|---|---|---|
| 1 | Acierta, pero ¿qué aprendió? | Nada: la red y sus números |
| 2 | ¿Qué mira cada neurona? | Elegir una neurona: su mapa |
| 3 | ¿Qué pasa si apago una? | Apagar; se ve qué deja de acertar |
| 4 | Predicción: apago esta, ¿qué caso falla? | Elegir y ver |
| 5 | ¿Dónde están las reglas? | Un peso: no hay reglas, hay números |
| 6 | Desafío: apagar la que hace fallar solo un caso dado | Apagar |

Con los diez capítulos, D8 cambia así: 1986 y 1998 apuntan al capítulo 6, ya disponible.

## Risks / Trade-offs

- [La carpeta de prototipos no tiene commit y se borra en este cambio] → La primera tarea comprueba que
  `teoria-prototipos` esté con commit antes de mudar nada.
- [Siete capítulos "próximamente" al publicar] → La portada lo dice sin disimular; la historia y los
  tres capítulos se sostienen solos. Publicar o esperar lo decide el dueño.
- [En un celular bajo, la figura fija deja poco texto a la vista] → Tope del 60 % del alto y, si no
  entra, la figura deja de quedar fija (D5). Se verifica a 360×640.
- [El capítulo 0 puede dar a entender que una red "busca" barriendo] → El texto dice qué es y remite a
  los capítulos de aprendizaje.
- [Los hitos recientes tienen atribuciones discutidas] → D10; lo discutido se dice.
- [El enlace del cierre no abre la pestaña nombrada] → El texto la nombra; abrirla directo queda para
  cuando se decida entre V1 y V2.
- [Otro cambio en curso en el mismo checkout, `bienvenida-y-primer-manejo`, toca `src/ui/app.js`] → El
  enlace "Teoría" es una línea en la barra; se hace al final y se revisa el diff antes.
- Rendimiento: las figuras calculan una red de hasta tres neuronas por movimiento de perilla. No tocan
  el bucle de simulación ni el de dibujo de la app.

## Migration Plan

1. Mudar y dejar la sección funcionando con "Una neurona" y los cinco hitos.
2. Sumar los capítulos 0 y 2 y los siete hitos, cada uno con su revisión.
3. Enlazar desde la V1 y la V2, y borrar `prototipos/teoria/`.

Vuelta atrás: quitar los dos enlaces deja la sección sin entrada desde la app; la práctica no depende
de ella.

## Open Questions

- Si se publica con tres capítulos o se espera a los diez. No cambia este cambio.
- El destino del enlace a la app cuando se decida entre V1 y V2 (D7).
