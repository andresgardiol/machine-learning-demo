## MODIFIED Requirements

### Requirement: Disposición del Laboratorio
La pestaña SHALL mostrar en la zona izquierda lo que la red mira: con Compuertas, el plano, la tabla de verdad y las curvas; con Puntos, el plano y las curvas; con Tu manejo, la escena con sus controles de cámara y las curvas. El ejemplo en curso va junto a los datos. La red va en la zona central, con la operación en curso y la barra de reproducción debajo, y el panel tiene los ajustes de la red y del aprendizaje. Usa los mismos anchos que Inspeccionar.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900, en español o en inglés, con compuertas, con puntos o con tu manejo
- **THEN** se ven sin desplazar ninguna zona la red con sus controles, la reproducción, los datos, el ejemplo en curso, las curvas y el panel entero

#### Scenario: Pantalla de 1366×768
- **WHEN** se abre la pestaña con la ventana en 1366×768 con compuertas
- **THEN** el plano y la tabla de verdad se ven enteros sin desplazar la zona izquierda

#### Scenario: Mismos anchos que Inspeccionar
- **WHEN** la persona pasa de Inspeccionar a Laboratorio
- **THEN** la zona izquierda, la red y el panel tienen el mismo ancho en las dos

#### Scenario: Nada hacia los costados
- **WHEN** el panel está en su ancho mínimo, en 360 o en 400 píxeles
- **THEN** no se desplaza hacia los costados y ningún botón queda cortado

#### Scenario: Acciones enteras
- **WHEN** el panel mide 360 píxeles, en español
- **THEN** "Reiniciar pesos", "Red de siempre" y "Guardar como cerebro" se leen cada uno en un solo renglón

#### Scenario: Sin secciones plegables
- **WHEN** la persona busca cualquier ajuste del Laboratorio
- **THEN** lo encuentra a la vista en la barra, sobre la red o en el panel, sin desplegar nada

#### Scenario: Con una neurona elegida
- **WHEN** la ventana está en 1440×900, los datos son puntos, la red es la por defecto y la persona elige una neurona oculta
- **THEN** la tarjeta de la neurona se ve entera en el panel, sin desplazarlo, y todos los ajustes de la red y del aprendizaje siguen a la vista

#### Scenario: Con la tabla de datos
- **WHEN** la persona pasa a la tabla de datos
- **THEN** la reproducción y la operación en curso siguen debajo, y la zona izquierda y el panel no cambian

#### Scenario: Cámara con tu manejo
- **WHEN** los datos son tu manejo y la persona usa la rueda sobre la escena
- **THEN** la escena se acerca o se aleja como en El problema, sin mover la página ni la red

### Requirement: Elegir los datos
La barra de arriba SHALL empezar por los tres experimentos, como opciones grandes, numeradas y en este orden: 1 Compuertas ("resolvé a mano"), 2 Puntos ("que aprenda sola") y 3 Tu manejo ("que te imite"), cada uno con su nombre y su línea en español y en inglés, y un tooltip. A su derecha SHALL mostrar solo los ajustes del experimento elegido. Cambiar un ajuste de los datos de puntos o de tu manejo MUST generar los datos de nuevo y empezar el aprendizaje desde cero, con la misma red. Cambiar de compuerta conserva los pesos (ver "Elegir la compuerta").

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** el experimento elegido es Compuertas, con AND elegida, y se leen los tres experimentos con su número, su nombre y su línea

#### Scenario: Se ven como experimentos
- **WHEN** la persona mira la barra
- **THEN** los tres experimentos son las opciones más grandes de la barra, con la altura grande, y el elegido se ve con el estilo de opción elegida

#### Scenario: Cambiar la forma
- **WHEN** la persona elige la espiral
- **THEN** el plano muestra los puntos nuevos, la red vuelve a pesos al azar, la curva se vacía y el aprendizaje queda reproduciendo o en pausa, como estaba

#### Scenario: Formas a la vista
- **WHEN** la persona mira la barra con puntos elegidos
- **THEN** ve las cuatro formas como opciones con su miniatura y su nombre, el ruido y la cantidad

#### Scenario: Pasar a tu manejo
- **WHEN** la persona elige tu manejo
- **THEN** la barra pasa a mostrar la pista, el tráfico y la velocidad, la zona izquierda pasa a mostrar la escena, y la red pasa a tener una entrada por sensor más la velocidad y cuatro salidas

#### Scenario: Volver a puntos
- **WHEN** la persona vuelve a puntos
- **THEN** encuentra la forma, el ruido y la cantidad que había dejado

#### Scenario: Con el teclado
- **WHEN** la persona llega a los experimentos con Tab y usa las flechas
- **THEN** el foco pasa de un experimento a otro y Enter o espacio lo elige

#### Scenario: Restablecer
- **WHEN** la persona restablece desde la barra
- **THEN** los datos vuelven a los valores por defecto del experimento elegido, sin cambiar de experimento

### Requirement: Perillas en la red del Laboratorio
El Laboratorio SHALL pedirle a la red las perillas sobre el diagrama: pesos y sesgos, más las entradas con puntos o compuertas. Con compuertas, cada entrada lleva un interruptor 0/1; con puntos, una pastilla que mueve el punto de prueba. Cada cambio de peso o sesgo cuenta como cambio a mano. Con compuertas, las pastillas de peso y de sesgo SHALL medir al menos 24 píxeles de alto y mostrar que se arrastran hacia arriba y hacia abajo (▲▼ y el cursor de arrastre vertical), sin depender del tooltip.

#### Scenario: Red de las compuertas
- **WHEN** se abre la pestaña
- **THEN** sobre la red se ven las pastillas de los dos pesos, la del sesgo de la salida y los interruptores de las dos entradas, y cada pastilla mide al menos 24 píxeles de alto con ▲▼

#### Scenario: Interruptor de una entrada
- **WHEN** la persona cambia la entrada de abajo de 0 a 1
- **THEN** la red recalcula con ese valor, el punto de prueba se mueve a ese caso del plano y la fila de ese caso se destaca en la tabla

#### Scenario: Deshacer una perilla
- **WHEN** la persona arrastra la pastilla del sesgo y después elige "Deshacer"
- **THEN** el sesgo vuelve al valor de antes y la franja de cambios se va

#### Scenario: Con tu manejo
- **WHEN** los datos son tu manejo
- **THEN** las entradas no llevan perilla, y los pesos y sesgos la llevan según el tamaño de la red

### Requirement: Deshacer y restablecer los cambios a mano
Con cambios a mano, sobre la red SHALL aparecer, en el lugar que tiene en Inspeccionar, una franja con cuántos cambios a mano hay, "Deshacer" y "Restablecer la red". Sin cambios, la franja MUST NOT verse. Deshacer MUST devolver la red a los pesos y a lo apagado que tenía justo antes del último cambio a mano; restablecer, a los de antes del primero. La época y las curvas no vuelven atrás.

#### Scenario: Sin cambios
- **WHEN** la persona no cambió nada a mano
- **THEN** no se ven "Deshacer", "Restablecer la red" ni un contador de cambios

#### Scenario: Contar los cambios
- **WHEN** la persona apaga una neurona y cambia dos pesos
- **THEN** aparece la franja, que dice que hay 3 cambios a mano, con los dos botones habilitados

#### Scenario: Un arrastre es un cambio
- **WHEN** la persona arrastra el deslizador de un peso de una punta a la otra y lo suelta
- **THEN** cuenta como un solo cambio

#### Scenario: Deshacer en pausa
- **WHEN** en pausa la persona cambia un peso y deshace
- **THEN** el peso vuelve al valor exacto que tenía, y el plano y la tabla vuelven a verse como antes

#### Scenario: Deshacer después de aprender
- **WHEN** la persona cambia un peso, deja aprender veinte épocas y deshace
- **THEN** la red vuelve a los pesos de justo antes del cambio, se pierde lo aprendido desde entonces, y la época y las curvas siguen desde donde estaban

#### Scenario: Deshacer lo avisa
- **WHEN** la persona posa el cursor sobre "Deshacer" con cambios hechos
- **THEN** el tooltip dice que la red vuelve a como estaba antes del último cambio a mano y que lo aprendido después se pierde

#### Scenario: Deshacer varias veces
- **WHEN** la persona hizo cuatro cambios y deshace cuatro veces
- **THEN** la red queda como estaba antes del primero y la franja se va

#### Scenario: Restablecer
- **WHEN** la persona restablece la red
- **THEN** los pesos y lo apagado vuelven a los de antes del primer cambio a mano, sin pedir confirmación, y la franja se va

#### Scenario: Empezar de nuevo vacía los cambios
- **WHEN** la persona reinicia los pesos, arma otra red o cambia los datos
- **THEN** todo vuelve a estar encendido y la franja no se ve

#### Scenario: Muchos cambios
- **WHEN** la persona hace más de 50 cambios a mano
- **THEN** se pueden deshacer los últimos 50, y restablecer sigue volviendo a antes del primero

## ADDED Requirements

### Requirement: A mano primero en Compuertas
Con compuertas, mientras la compuerta elegida no se resolvió a mano, la pantalla SHALL pedir lo mismo que la consigna: ningún botón se ve como acción principal, y con la guía activa una marca "Arrastrá un peso ↕", con su texto en español y en inglés, señala la primera pastilla de peso hasta el primer cambio a mano. "Reproducir" SHALL pasar a ser la acción principal cuando la tabla dice 4 de 4 después de un cambio a mano, cuando se usa "Ver una solución" o después de cinco cambios a mano sin resolverla. Desde ese momento, la consigna de la tarjeta invita a dejar que aprenda con "Reproducir" o "Paso".

#### Scenario: Estado por defecto
- **WHEN** se abre el Laboratorio por primera vez con la guía activa
- **THEN** la marca "Arrastrá un peso" señala la primera pastilla de peso, "Reproducir" se ve como acción secundaria y no hay ninguna acción principal a la vista

#### Scenario: Primer cambio
- **WHEN** la persona arrastra una pastilla
- **THEN** la marca desaparece y no vuelve mientras la persona siga en Compuertas

#### Scenario: Resuelta a mano
- **WHEN** la persona deja la tabla de AND en 4 de 4 moviendo pesos
- **THEN** "Reproducir" pasa a ser la acción principal y la consigna invita a ver cómo lo hace el aprendizaje

#### Scenario: Cinco cambios sin resolver
- **WHEN** la persona hizo cinco cambios a mano y la tabla no dice 4 de 4
- **THEN** "Reproducir" pasa a ser la acción principal y la consigna dice que el aprendizaje puede mostrar cómo corregir los pesos

#### Scenario: Guía oculta
- **WHEN** la guía está apagada
- **THEN** la marca no se ve, y "Reproducir" cambia de estilo igual

#### Scenario: Vuelta atrás
- **WHEN** la persona restablece los datos desde la barra
- **THEN** la compuerta vuelve a AND, "Reproducir" vuelve a ser secundaria y, con la guía activa, la marca vuelve a verse hasta el próximo cambio

#### Scenario: Otros experimentos
- **WHEN** la persona elige Puntos o Tu manejo
- **THEN** "Reproducir" es la acción principal desde el principio y no hay marca

#### Scenario: Determinismo
- **WHEN** la persona sigue el mismo recorrido de cambios dos veces
- **THEN** "Reproducir" cambia de estilo en el mismo cambio las dos veces: depende solo de los cambios y de la tabla
