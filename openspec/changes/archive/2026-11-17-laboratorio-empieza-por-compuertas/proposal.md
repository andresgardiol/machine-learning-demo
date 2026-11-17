# Laboratorio: empezar por las compuertas, a mano

## Por qué

Hoy el Laboratorio abre y ya está aprendiendo: puntos en círculo, una red de
4 neuronas ocultas y backpropagation corriendo, sin que nadie haya dicho qué
es un peso ni qué hace una neurona sola. Es lo más rico de la app, pero
empieza por el final.

Pedido del dueño: arrancar con un ejemplo de juguete que se resuelva a mano.
Las compuertas lógicas AND y OR con una sola neurona de dos entradas, moviendo
pesos y sesgo hasta que la red conteste bien; después XOR, para descubrir que
una neurona sola no alcanza, porque XOR no se separa con una recta, y que hace
falta una capa oculta. Y si a mano no sale, pasar sin vueltas a que
backpropagation lo resuelva, viéndolo neurona por neurona.

También pidió que los controles de pesos, sesgos y entradas estén sobre la
propia red, no solo en la tarjeta del panel.

**Concepto que hace visible**: una neurona traza una recta que parte el plano
en "sí" y "no"; los pesos la giran y el sesgo la corre. Un problema que no se
separa con una recta (XOR) necesita una capa oculta.

## Qué cambia

- **Datos nuevos: compuertas.** Una tercera clase de datos junto a "Puntos" y
  "Tu manejo", con tres opciones: AND, OR y XOR. Son los cuatro casos de la
  tabla de verdad, con entradas 0 y 1.
- **El Laboratorio abre con AND, en pausa.** Una neurona de salida, dos
  entradas, pesos y sesgo en cero. Nada aprende hasta que la persona lo pide.
  Esto vale para todas las clases de datos: elegir puntos o tu manejo ya no
  pone a aprender la red por sí solo.
- **Perillas sobre la red.** Con una red chica, cada conexión lleva su peso en
  una pastilla que se arrastra, y cada neurona su sesgo; las entradas llevan
  un interruptor 0/1 (compuertas) o una pastilla que mueve el punto de prueba
  (puntos). Con una red grande, las pastillas aparecen en las conexiones que
  entran a la neurona elegida.
- **Tabla de verdad en el tablero**: los cuatro casos, la respuesta correcta,
  la de la red y si acierta, al momento, mientras se mueve una perilla.
- **Se ve en el momento si va mejor**: mientras se arrastra una perilla, el
  fondo del plano (lo que contesta la red) se repinta en cada cuadro, y junto
  a la curva se lee el error de antes y el de ahora, con "baja" o "sube".
- **XOR enseña su límite.** Con una neurona sola no se llega a 4 de 4, ni a
  mano ni con backpropagation. Después de unos intentos, la guía explica por
  qué y ofrece agregar una capa oculta de dos neuronas.
- **De la mano a backpropagation.** La barra de reproducción ya está; con
  compuertas arranca de a neurona y lenta, así que "Paso" muestra la primera
  corrección de backpropagation sobre los pesos que puso la persona.
- **"Ver una solución"** por compuerta: pone pesos que resuelven el caso,
  como un cambio a mano que se deshace.
- **Misiones de las compuertas**: AND a mano, OR a mano y XOR con una capa
  oculta. Con puntos o tu manejo siguen las tres de siempre.
- **Cada clase de datos guarda lo suyo**: red, pesos, curvas y cambios. Volver
  a compuertas encuentra lo que se dejó.

**BREAKING (comportamiento)**: el Laboratorio ya no abre aprendiendo los
puntos en círculo; ese estado se alcanza eligiendo "Puntos" y reproduciendo.

## Filtro de entrada

**Compuertas a mano (tabla de verdad, perillas, solución)**
1. *Concepto*: una neurona es una recta que decide; los pesos la orientan y el
   sesgo la desplaza.
2. *¿Se entiende solo?* Sí: cuatro casos, una tabla con ✓ y ✗, y el plano con
   cuatro puntos y la recta que se mueve con cada perilla.
3. *¿El mentor puede ignorarlo?* Sí: elige "Puntos" o "Tu manejo" y el
   Laboratorio queda como hoy, salvo que espera a que se reproduzca.
4. *¿Si se usa mal?* Cada perilla cuenta como cambio a mano: "Deshacer",
   "Restablecer la red" y "Reiniciar pesos" vuelven atrás.

**XOR y la capa oculta**
1. *Concepto*: no todo se separa con una recta; una capa oculta combina rectas.
2. *¿Se entiende solo?* La tabla nunca llega a 4 de 4 y el plano muestra una
   sola recta; la guía lo nombra después de que la persona lo intentó.
3. *¿El mentor puede ignorarlo?* Sí: es una opción más de la barra.
4. *¿Si se usa mal?* Volver a cero capas ocultas o "Red de siempre".

**Perillas sobre la red**
1. *Concepto*: el peso de cada conexión y el sesgo son los números que deciden.
2. *¿Se entiende solo?* Se arrastran donde están las conexiones, con el número
   a la vista.
3. *¿El mentor puede ignorarlo?* Con redes grandes solo aparecen al elegir una
   neurona.
4. *¿Si se usa mal?* "Deshacer".

**Nada aprende sin pedirlo**
1. *Concepto*: el aprendizaje es algo que se le pide a la red.
2. *¿Se entiende solo?* La guía dice qué tocar primero y el botón de
   reproducir está a la vista.
3. *¿El mentor puede ignorarlo?* Un toque en reproducir (o espacio).
4. *¿Si se usa mal?* No hay nada que deshacer.

**Público**: sobre todo el principiante que llega al Laboratorio sin saber qué
es un peso. El mentor gana un guion de clase (AND → OR → XOR → capa oculta →
backpropagation) y puede saltarlo eligiendo otros datos.

## Fuera de alcance

- Más compuertas (NAND, NOR, XNOR) o tablas de más de dos entradas.
- El escalón como activación: el Laboratorio sigue usando tanh, sigmoide y
  ReLU, y la salida contesta "sí" por encima de 0,5, que es lo mismo que el
  escalón sobre el total.
- Perillas sobre la red en Inspeccionar: la vista compartida las ofrece, pero
  en este cambio solo el Laboratorio las pide.
- Cambiar cómo funciona backpropagation, las fases o el paso a paso.

## Capacidades

### Nuevas

Ninguna.

### Modificadas

- `pestana-laboratorio`: abre con compuertas en pausa (reemplaza "Aprendiendo
  al abrir"); nada aprende sin pedirlo; tabla de verdad, plano de las
  compuertas, XOR y su límite, solución, misiones por clase de datos, perillas
  y estado por clase de datos.
- `datos-de-ejemplo`: datos de compuertas (AND, OR, XOR).
- `inspector-de-red`: perillas de pesos, sesgos y entradas sobre la red cuando
  la pestaña las pide.

## Impacto

- Código: `src/core/datasets.js` (compuertas), `src/tabs/lab/{index,session,defaults,missions,describe,playback}.js`, `src/render/network-inspector.js` y `src/render/inspector-layout.js` (perillas), `src/render/plane-view.js` (rango del plano), tabla de verdad nueva en `src/tabs/lab/`, `src/i18n/{es,en}.js`, `styles/app.css` y pruebas.
- Specs existentes con escenarios que cambian: los que dicen que el
  Laboratorio arranca o sigue aprendiendo solo.
- Toca `lab/index.js` y `network-inspector.js`, igual que
  `sin-destellos-en-la-red`; se implementan uno después del otro.
