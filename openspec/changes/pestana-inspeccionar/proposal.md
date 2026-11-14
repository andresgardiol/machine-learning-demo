# Proposal

## Why

El recorrido termina preguntando "¿qué aprendió?". Hoy la red se ve chica, en
el tablero de Entrenar, y solo se puede mirar: no hay forma de detenerla, de
seguir la cuenta que hace, ni de probar qué pasa si se le cambia algo. La
promesa del proyecto dice que quien lo recorre sale entendiendo qué tiene
adentro una red; falta la pestaña que lo cumple.

La pestaña 5, "Inspeccionar", pone la red en el centro de la pantalla y deja
al auto en segundo plano.

Concepto que hace visible: **una red neuronal no guarda reglas ni recuerdos:
es una cuenta. Cada neurona multiplica lo que recibe por sus pesos, suma y
decide cuánto se enciende; lo que el auto "sabe" son esos pesos.**

## What Changes

- **Pestaña 5 disponible**, con otra disposición a propósito: la red ocupa la
  zona grande y la escena del auto va chica, en el tablero.
- **La red en vivo:** un cerebro maneja y su red se ve en grande, con cada
  neurona y cada conexión actualizándose en el momento.
- **Dos vistas de la misma red:** el diagrama por capas y una tabla de pesos
  (la matriz de cada capa), que se lee mejor cuando la red es grande.
- **Capas resumidas:** cada capa (entradas, ocultas y salidas) se puede
  resumir en un bloque de cuadritos pegados, desde un encabezado que está en
  la red misma, arriba de la capa, o todas a la vez.
- **Conexiones más importantes:** un filtro para destacar las 5, las 3 o la
  más importante de cada neurona, o verlas todas, como al abrir.
- **La cuenta de una neurona:** al elegir una neurona se ve su cuenta real:
  cada entrada por su peso, la suma, el sesgo, la activación y la salida.
- **Reproducción con ritmo:** una barra de reproducción junto a la red, como
  la de un reproductor: reproducir o pausar, un paso, de a cuánto avanza
  (cuadro, capa, neurona u operación) y a qué ritmo, de tiempo real a un paso
  por segundo.
- **Paso animado y operación en curso:** cada paso se ve como un movimiento
  en la red, con los valores reales, y debajo se lee la operación que se
  acaba de hacer, escrita con sus números.
- **Entradas a mano:** con la simulación en pausa, la persona mueve lo que ve
  cada sensor (arrastrando el rayo, o con un deslizador) y la velocidad, y ve
  qué decide la red.
- **Apagar:** una neurona, una entrada o una conexión se apagan y se ve qué
  deja de hacer el auto.
- **Cambiar pesos y sesgos a mano**, con efecto inmediato en el auto que
  maneja.
- **Deshacer y restablecer:** dos botones siempre a la vista sobre la red,
  para todo cambio que se le haga. Nunca cambian el cerebro guardado.
- **Qué cerebro se inspecciona:** por defecto, el último entrenamiento; si no
  hay ninguno, un cerebro de ejemplo. Se elige otro con un selector como el
  de Competir.

### Filtro de entrada

| Feature | ¿Qué concepto hace visible? | ¿Se entiende sola? | ¿El mentor puede ignorarla u ocultarla? | ¿Mal uso y vuelta atrás? |
|---|---|---|---|---|
| La red en vivo, en grande | La decisión del auto sale de la red, cuadro a cuadro | Abre con un cerebro manejando y la red encendiéndose | Es el contenido de la pestaña | No tiene estado propio |
| Diagrama y tabla de pesos | Una red es números ordenados por capas; el dibujo y la tabla son lo mismo | Dos opciones con nombre, a la vista sobre la red | Se queda en el diagrama | Se vuelve con la otra opción |
| Capas resumidas | Una capa es un conjunto de neuronas que trabajan a la vez | Un botón por capa, con su nombre y cuántas neuronas tiene | Todas abiertas por defecto | Otro clic la vuelve a abrir |
| Conexiones más importantes | En cada neurona pesan unas pocas conexiones; el resto aporta poco | Cuatro opciones con nombre sobre la red; por defecto, todas | Se deja en "todas" | Se vuelve a "todas"; no cambia la cuenta |
| La cuenta de una neurona | Una neurona multiplica, suma y aplica una función | Un clic en una neurona; ya hay una elegida al abrir | La tarjeta acompaña sin tapar la red | Se elige otra neurona |
| Reproducción y paso a paso | La red hace la misma cuenta en cada cuadro, capa por capa | Controles de reproductor, con el lugar de la cuenta escrito | Por defecto corre en tiempo real | Reproducir vuelve a tiempo real |
| Entradas a mano | La red es una función: mismas entradas, misma decisión | Las manijas aparecen al pausar; un aviso dice que son a mano | No hace falta tocarlas | "Soltar" vuelve a lo que ve el auto; reproducir también |
| Apagar | Cada parte de la red aporta algo, y se puede averiguar qué | Un botón en la tarjeta de la neurona | No hace falta usarlo | "Deshacer" y "Restablecer la red" |
| Cambiar pesos | Lo aprendido son los pesos: cambiarlos cambia el manejo | Un deslizador en la fila de cada conexión | No hace falta usarlo | "Deshacer" y "Restablecer la red"; el cerebro guardado no cambia |
| Elegir el cerebro | Cada cerebro es otra red, con otros pesos | El nombre del cerebro está sobre la red | Abre con uno ya elegido | Se elige otro |

### A quién sirve

- **Principiante:** abre la pestaña y ve la red de su propio entrenamiento
  encendiéndose mientras el auto maneja. Pausa, avanza de a un paso y sigue la
  cuenta con los números a la vista.
- **Mentor:** elige el cerebro que quiere mostrar, baja el ritmo, apaga una
  neurona o mueve un obstáculo a mano y hace la pregunta: "¿qué va a decidir?".
  Todo lo que rompe se deshace con un clic.

### Fuera de alcance

- Guardar una red modificada como cerebro nuevo, o llevarla a Competir.
- Inspeccionar un programa de Reglas a mano o lo que hace una persona.
- Comparar dos redes lado a lado.
- Explicaciones automáticas de qué "significa" cada neurona.
- Mapas de respuesta (una salida en función de dos entradas) y otras vistas.
- Agregar o quitar neuronas, capas o conexiones.
- Seguir en vivo un entrenamiento que corre en Entrenar.
- La pestaña Laboratorio.

## Capabilities

### New Capabilities

- `cuenta-de-la-red`: la cuenta de una red desglosada por operaciones, el
  avance paso a paso por esa cuenta y los cambios que se le prueban a una red
  sin tocar la original.
- `inspector-de-red`: la vista interactiva de una red: diagrama y tabla de
  pesos, capas resumidas, elegir neuronas y conexiones, acercar y alejar, y
  las marcas de lo apagado y lo cambiado.
- `pestana-inspeccionar`: la pestaña 5: qué cerebro se mira, la reproducción,
  la tarjeta de la neurona, las entradas a mano, apagar y cambiar pesos, y las
  misiones.

### Modified Capabilities

- `estructura-app`: Inspeccionar pasa a estar disponible, y su disposición
  pone la red en la zona grande.
- `vista-escenario`: una escena chica, sin controles de cámara, y rayos que
  se pueden mover a mano.

## Impact

- **Núcleo:** módulos nuevos, sin DOM, para la cuenta desglosada, el cursor
  del paso a paso y los cambios de prueba. `computeNetwork` no cambia.
- **Dibujo:** un módulo nuevo para la vista interactiva de la red. El
  diagrama de Entrenar sigue igual, solo de lectura.
- **Pestaña:** `src/tabs/inspect/` nueva, registrada en `src/main.js`.
- **Escena:** `src/render/view.js` suma un modo chico y las manijas de los
  rayos.
- **Reutiliza:** la biblioteca, los cerebros de ejemplo, la barra de escenario
  sin sensores, el selector de Competir y los bloques de percepción y acción.
- **Textos y estilos:** `src/i18n/es.js`, `en.js` y `styles/`.
- **Sin medir todavía:** la fluidez con la red más grande que permite la
  aplicación y las dos vistas; que la tarjeta de la neurona y la escena entren
  en el tablero a 1440×900; y si el paso a paso se entiende sin explicación.
- **Dependencias y build:** ninguna nueva.
