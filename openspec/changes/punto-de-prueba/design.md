# Diseño

## Contexto

`plane-view.js` dibuja el plano en un canvas sin ninguna interacción. La cuenta
que ve el inspector la arma `lab/index.js`: la del ejemplo en curso si hay uno
(`a`), y si no la de `session.data.examples[0]`. Esa cuenta se rehace en cada
dibujo: mostrar otro punto no cuesta nada más.

Nada de lo que sigue está medido: son decisiones de diseño.

## Decisiones

### D1 · Sin modo

El dueño lo pensó como "un modo luego del entrenamiento". Se hace sin modo:
el punto de prueba está siempre, también mientras la red aprende.

- Un modo hay que encontrarlo, entrar y acordarse de salir; y mientras está
  activo cambia qué hace cada control.
- Sin modo se gana algo que un modo no da: dejar el punto quieto cerca de la
  frontera y ver cómo cambia la respuesta mientras la red aprende.
- El único estado que cambia es de quién es la cuenta que muestra la red, y
  eso se dice siempre con un texto (D4).

### D2 · El marcador

- Un aro con una cruz, de 10 px de radio, en el color del texto con un borde
  del color del fondo: se ve sobre naranja, sobre azul y sobre la frontera.
  Los ejemplos son círculos y cuadrados llenos de 5 px como mucho: no se
  confunde con un dato, tampoco sin colores.
- Es un elemento HTML encima del canvas (no un dibujo): tiene foco, anillo de
  foco, tooltip y un área de agarre de 24 × 24 px o más.
- Empieza en el centro (0, 0).

### D3 · Cómo se mueve

| Con qué | Qué hace |
|---|---|
| Arrastrar el marcador | Lo sigue; la respuesta cambia mientras se arrastra |
| Clic en el plano | El punto va ahí (alternativa a arrastrar, WCAG 2.5.7) |
| Flechas, con el foco en el marcador | 0,05 por tecla; 0,01 con Mayúsculas |
| Deslizador en la tarjeta de la entrada x o y | Mueve esa coordenada |

Las coordenadas quedan entre −1 y 1. Arrastrando no aparece ningún tooltip
(ya es así en toda la app).

No hay deslizadores debajo del plano: el tablero no tiene alto de sobra a
1366×768 y el plano mismo es el control. El valor exacto se pone con las
flechas o desde la tarjeta de la entrada.

### D4 · Qué muestra y dónde se lee

- **Junto al marcador**, un rótulo corto: la forma y el color que contesta la
  red y la seguridad ("● naranja 92 %"). Con una neurona oculta elegida (el
  fondo es su mapa), lo que da esa neurona ahí. El rótulo se acomoda para no
  tapar el marcador ni salirse.
- **En la red**: las dos entradas muestran las coordenadas y todo se
  recalcula. Vale para el diagrama y la tabla de pesos.
- **En la franja bajo la red**, cuando no hay una operación que mostrar: "La
  red muestra el punto de prueba: x 0,30 · y −0,45 → contesta naranja
  (círculos), 92 % segura." Con un ejemplo en curso, la franja sigue
  mostrando su operación y dice de qué ejemplo es.
- **Para el lector de pantalla**: el marcador tiene nombre ("Punto de prueba")
  y un texto con coordenadas y respuesta, que se anuncia al soltar o al mover
  con el teclado, no en cada píxel del arrastre.

La respuesta usa la red como está a la vista: con lo aprendido hasta ese
momento y con los cambios a mano (neuronas apagadas, pesos cambiados), igual
que el fondo.

### D5 · Convivencia con el paso a paso

La red muestra una de dos cosas:

- **El punto de prueba**: de corrido de a épocas, en pausa sin ejemplo en
  curso, y cada vez que la persona mueve el punto en pausa.
- **Un ejemplo**: al avanzar de a fases, capas o neuronas, y al reproducir de
  a ejemplos o menos.

Mover el punto con un ejemplo a medio corregir es solo un cambio de vista: el
cursor del aprendizaje no se toca y ningún peso cambia. El paso siguiente
vuelve a mostrar el ejemplo y sigue su cuenta donde iba. Mientras la red
muestra un ejemplo, el marcador se ve más tenue y su rótulo sigue leyendo la
respuesta.

Reproduciendo de a ejemplos, la red sigue los ejemplos (si no, el punto y la
reproducción se pelearían por el diagrama); el rótulo junto al punto sigue
vivo.

### D6 · Estado

La posición del punto vive en el estado de la pestaña: se conserva al cambiar
de forma, reiniciar pesos, cambiar de vista y salir y volver. No se guarda
entre visitas ni dentro de un cerebro.

### D7 · Textos

- Nombre: "Punto de prueba" / "Probe point" (no "test point": en inglés
  "test" se confunde con los ejemplos apartados).
- Tooltip, qué hace: "Marca un lugar del plano para preguntarle a la red qué
  contesta ahí. Arrastralo, hacé clic en el plano o usá las flechas."
- Tooltip, por qué importa: "Es usar la red: le das dos números y te da una
  respuesta. No es un ejemplo: la red no aprende de él."
- La guía del Laboratorio con puntos suma una oración: "Mové el punto de
  prueba para ver qué contesta en un lugar."

## Mejoras que quedan afuera

- Punto de prueba con "Tu manejo" (rayos y velocidad a mano en el
  Laboratorio).
- Llevar el punto de prueba a un ejemplo elegido en la tabla de datos.
- Una misión ("Encontrá un lugar donde la red dude").
- Dejar varios puntos de prueba a la vez.

## Riesgos

- **El plano se comparte con el resaltado del ejemplo en curso y con el punto
  elegido en la tabla de datos.** Tres marcas distintas: hay que comprobar que
  se distinguen entre sí.
- **La guía suma una oración**: si con eso el panel deja de entrar sin
  desplazarse a 1440×900 o pierde una fila más a 1366×768, parar y consultar.
- **Fluidez**: arrastrar recalcula una cuenta por movimiento del cursor, lo
  mismo que ya se hace en cada cuadro. Se mide igual, arrastrando mientras la
  red aprende.
