# Punto de prueba: usar la red del Laboratorio a mano

## Por qué

El Laboratorio muestra cómo aprende la red, pero no deja usarla: no hay forma
de preguntarle "¿y acá qué contestás?". El fondo del plano da la respuesta de
todos los lugares a la vez, sin números, y no se puede seguir un lugar por
dentro de la red.

Además hay un hueco que hoy confunde. Leído en el código (no medido):
cuando no se está siguiendo un ejemplo paso a paso, el diagrama muestra la
cuenta de un "ejemplo de referencia", que es el primero de los datos
(`session.data.examples[0]` en `src/tabs/lab/index.js`). Los números de las
entradas y de cada neurona son de ese punto, que no está marcado en el plano
ni nombrado en ningún lado: no se sabe de quién son.

Pedido del dueño: poder cambiar las entradas a mano y ver en el plano un
marcador de esas entradas, para experimentar con la red ya entrenada. Lo
describió como algo que tenía su demo original; este diseño parte de esa
descripción, no de mirar aquella demo.

## Qué cambia

- **Un punto de prueba en el plano**: un marcador que se arrastra, se pone con
  un clic o se mueve con las flechas. Junto a él se lee lo que contesta la red
  ahí y cuán segura está.
- **La red muestra ese punto**: sus coordenadas son las entradas, y cada
  neurona y la salida se recalculan mientras se mueve. Reemplaza al ejemplo de
  referencia sin marcar.
- **Un texto dice siempre de quién es la cuenta** que muestra la red: el punto
  de prueba o un ejemplo.
- **No es un modo**: está siempre, aprendiendo o en pausa. La red no aprende
  de él.
- Las tarjetas de las entradas x e y tienen un deslizador que mueve el punto.

Queda afuera: lo mismo con "Tu manejo" (ahí las entradas son los rayos del
auto; Inspeccionar ya permite ponerlas a mano una vez guardado el cerebro).

## Capacidades

### Modificadas

- `pestana-laboratorio`: dos requisitos nuevos ("Punto de prueba en el plano"
  y "La red muestra el punto de prueba") y "Operación en curso del
  aprendizaje", que suma el texto de quién es la cuenta.

## Impacto

- Código: `src/render/plane-view.js`, `src/tabs/lab/{index,session,describe}.js`, `src/tabs/shared/neuron-card.js` (deslizador de una entrada en el Laboratorio), `styles/app.css`, `src/i18n/{es,en}.js` y pruebas.
- No cambia el aprendizaje ni los datos.
- No depende de los otros cambios en curso; toca `lab/index.js`, así que se
  implementa cuando nadie más lo esté editando.
