# La vista de la red, legible y completa

## Why

La vista de la red es el centro de Inspeccionar y del Laboratorio, y el dueño
la encuentra "incompleta y tosca": conexiones que no se ven, neuronas chicas,
no se puede soltar la neurona elegida, resumir una capa no agranda las otras,
y los colores no lo convencen. Pidió una vista "súper completa e intuitiva".

Medido en el código y en una captura a 1440×900 (zona de la red de 708×648
px):

- **Las conexiones casi no se ven.** El grosor usa una escala fija de 0 a 1 y
  los pesos de una red entrenada son chicos: en el cerebro de ejemplo de la
  calle, 56 de 60 conexiones caen en el nivel más fino (1,1 px). La opacidad
  se atenúa tres veces (por el peso, por no ser de la neurona elegida y por
  lo que aporta en el cuadro) y queda entre 7 % y 16 %.
- **No hay estado neutro.** Siempre hay una neurona elegida, y eso atenúa a
  la mitad todas las demás conexiones, todo el tiempo.
- **Las neuronas tienen un tope de 16 px de radio.** Con 6 por capa, la zona
  da para 37.
- **Resumir una capa solo corre las columnas.** El tamaño de las neuronas
  depende de ese mismo tope, así que nada crece.
- **Siete tonos con significado y una leyenda de nueve renglones.**
- **El verde agua y el rosa casi no se distinguen con deuteranopia:** ΔE 4,6
  con el validador de la skill de visualización, por debajo del piso de 6.
  Hoy los salva solo el trazo punteado.

**Concepto que hace visible:** una red es un conjunto de números conectados.
Cada conexión tiene un peso, por cada una pasa una señal, y la decisión sale
de sumar lo que llega. Es infraestructura de las pestañas 5 y 6: lo que
enseñan depende de que esto se lea.

## What Changes

**Leer la red**

- **Todas las conexiones se ven.** El grosor es relativo al peso más grande
  de la red, con un mínimo que se ve. El brillo dice cuánta señal pasa ahora.
- **Estado neutro:** sin nada elegido, la red se ve entera y pareja.
  Inspeccionar pasa a abrir así. **BREAKING** para quien esperaba una neurona
  ya elegida.
- **Neuronas que usan el espacio,** hasta 44 px de radio. Resumir una capa
  agranda de verdad a las demás.
- **Neurona por dentro:** según su tamaño muestra su valor, dónde cae en la
  activación, y su suma y su sesgo.
- **Menos colores:** el mismo par verde agua y rosa, con el rosa más profundo
  para que se distingan con daltonismo. Lo cambiado y lo puesto a mano pasan
  a marcarse con forma. La leyenda baja a cinco renglones.

**Elegir y cambiar**

- **Vista previa al posar el cursor,** con una lectura junto al cursor: qué
  es y cuánto vale.
- **Elegir una neurona o una conexión,** y soltarla con otro clic, un clic
  afuera o Escape.
- **Detalle de lo elegido en el panel,** rediseñado: la cuenta de la neurona
  con barras de lo que aporta cada entrada, o la conexión con su peso, lo que
  pasa por ella y qué parte es de lo que recibe su neurona. Todo se cambia
  ahí. Sin nada elegido, el panel dice qué elegir y ofrece atajos.
- **Cambiar un peso en el lugar:** la conexión elegida lleva una pastilla con
  su peso, que se arrastra o se mueve con las flechas.
- **Números sobre las conexiones** de lo elegido.
- **Comparar con el original:** mientras se mantiene apretado, la red se ve
  sin los cambios a mano (Inspeccionar).

**Entender**

- **De dónde viene:** al elegir una neurona se destaca todo el camino hasta
  las entradas, según cuánto aporta cada tramo. En una salida, es el rastro
  de la decisión.
- **Curva de respuesta:** en el detalle de una neurona, un gráfico de cómo
  cambia lo que recibe cuando una sola entrada recorre su rango y las demás
  quedan como están. Se elige la entrada; el punto marca dónde está ahora y
  una línea, dónde la neurona pasa de 0 a 1. Estaba en la demo original del
  dueño.
- **Flujo de la señal:** en tiempo real, marcas que viajan por las conexiones
  por las que pasa señal (Inspeccionar, con interruptor).
- **En el Laboratorio, qué detecta cada neurona:** con puntos, cada neurona
  oculta lleva adentro un mapa chico de dónde se enciende, y al elegirla el
  plano del tablero muestra ese mapa en grande. Con tu manejo no hay plano:
  la tarjeta muestra la curva de respuesta.
- **En el Laboratorio, historia de un peso:** la conexión elegida muestra
  cómo fue cambiando su peso con las épocas.

**De paso:** el diagrama chico de Entrenar usa la misma escala relativa y el
mismo par de colores, para que un cerebro se vea igual en toda la aplicación.

### Filtro de entrada

| Feature | ¿Qué concepto hace visible? | ¿Se entiende sola? | ¿El mentor puede ignorarla u ocultarla? | ¿Mal uso y vuelta atrás? |
|---|---|---|---|---|
| Conexiones visibles y estado neutro | Una red son todas sus conexiones, no solo las de una neurona | No hay nada que aprender: se ve | Es la vista por defecto | No tiene estado |
| Neuronas grandes y por dentro | Una neurona hace una cuenta y guarda un valor | El número está adentro | Resumir una capa la achica | Abrir la capa |
| Vista previa y lectura | Cada línea y cada círculo es un número | Aparece al posar el cursor | No se pide: no aparece | Sacar el cursor |
| Elegir neurona o conexión | Se puede preguntar por cualquier parte de la red | Clic, como en todo | Sin elegir, no cambia nada | Otro clic, clic afuera o Escape |
| Detalle editable | La salida es la suma de lo que aporta cada entrada | Barras con signo y la cuenta escrita | Solo con algo elegido | Deshacer y Restablecer la red |
| Cambiar en el lugar | Mover un peso cambia lo que pasa por la conexión | La pastilla muestra el número y se mueve | El deslizador del panel hace lo mismo | Deshacer |
| De dónde viene | Una decisión depende de sensores que están varias capas atrás | Se destaca solo al elegir | El filtro de conexiones lo reduce | Soltar la neurona |
| Curva de respuesta | Un peso es cuánto mueve a la neurona una entrada; una decisión cambia en un punto preciso | La frase de abajo la lee: cuánto vale ahora, qué sale y qué significa la forma | Solo con una neurona elegida | No tiene estado; el punto arrastrado se deshace con las entradas a mano |
| Flujo de la señal | La información viaja de los sensores a los controles | Se ve moverse | Interruptor sobre la red | Apagar el interruptor |
| Qué detecta cada neurona | Cada neurona aprende un pedazo del problema y la red los combina | El mapa usa los colores del plano | Resumir la capa lo quita | Soltar la neurona vuelve el plano a la red |
| Historia de un peso | Aprender es que cada peso se mueve hasta acomodarse | Una línea con las épocas | Solo con una conexión elegida | No tiene estado |
| Comparar con el original | Un cambio chico puede cambiar la decisión | Botón que se mantiene apretado | Solo con cambios | Soltar el botón |

### A quién sirve

- **Principiante:** abre la pestaña y ve la red entera, viva, sin tocar nada.
  Posa el cursor y cada cosa le dice qué es. Nada de lo nuevo aparece sin que
  lo pida, salvo el flujo.
- **Mentor:** elige una salida y muestra de dónde viene la decisión; cambia
  un peso en el lugar y compara con el original; en el Laboratorio muestra
  cómo cada neurona aprende un pedazo del problema.

### Fuera de alcance

- Minimapa al acercar, histogramas de pesos por capa, ordenar o arrastrar
  neuronas, comparar dos neuronas lado a lado y exportar la red como imagen.
- Historia de la actividad de una neurona mientras el auto maneja.
- Cambiar el relleno de las neuronas: sigue siendo claro cuando se encienden.
- Cambiar la disposición de las pestañas, la barra de reproducción o la
  operación en curso.
- Los colores del plano de puntos y de la escena.
- Mapas de qué detecta una neurona en Inspeccionar: ahí no hay datos.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `inspector-de-red`: cómo se ven conexiones y neuronas, cómo se elige y se
  suelta, y lo nuevo que muestra (vista previa, números, de dónde viene,
  flujo, mapas).
- `pestana-inspeccionar`: abre sin nada elegido; el detalle del panel sirve
  para una neurona, una conexión o nada; leyenda corta; comparar con el
  original.
- `pestana-laboratorio`: qué detecta cada neurona, historia de un peso y
  detalle de una conexión.
- `cuenta-de-la-red`: de dónde viene lo que recibe una neurona, y cómo
  responde a una entrada.
- `retropropagacion`: valores de cada neurona sobre una grilla e historia de
  los pesos.
- `vista-red`: el diagrama de Entrenar usa la escala relativa.

## Impact

- **Dibujo:** `src/render/network-inspector.js`, `inspector-layout.js`,
  `network-view.js` y `weight-table.js`; `plane-view.js` suma el mapa de una
  neurona.
- **Núcleo:** funciones puras nuevas con pruebas (aspecto de una conexión,
  de dónde viene, curva de respuesta, valores sobre una grilla, historia de
  pesos). La cuenta de
  la red no cambia.
- **Pestañas:** `src/tabs/inspect/`, `src/tabs/lab/` y la tarjeta compartida.
- **Colores:** `styles/tokens.css` (el rosa) y dos tonos que dejan de usarse.
- **Sin medir todavía:** cómo se ve una red densa con todas las conexiones
  visibles; si se acierta a elegir una conexión entre cientos; si el detalle
  nuevo entra en el panel; la fluidez con la red más grande, el flujo y los
  mapas. La implementación lo mide y se detiene a consultar, con capturas.
- **Dependencias y build:** ninguna nueva.
