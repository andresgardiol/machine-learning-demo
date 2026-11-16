# Spec Delta

## MODIFIED Requirements

### Requirement: Plano de puntos
Con puntos, el tablero SHALL mostrar el plano con cada punto en su lugar y con
su color, y el fondo pintado con lo que la red contesta en cada lugar: el
color que elegiría y, con la intensidad, cuán segura está. Con una neurona
oculta elegida, el fondo muestra lo que detecta esa neurona, y un rótulo lo
dice. El fondo SHALL actualizarse mientras la red aprende. Los puntos apartados MUST distinguirse
de los de práctica sin depender solo del color.

#### Scenario: El fondo sigue a la red
- **WHEN** la red aprende
- **THEN** el fondo cambia con ella, y al final cada punto queda sobre el fondo de su color

#### Scenario: Puntos apartados
- **WHEN** la persona mira el plano
- **THEN** los puntos apartados se ven huecos y los de práctica llenos

#### Scenario: Colores que no son solo colores
- **WHEN** la persona no distingue los dos colores
- **THEN** distingue las dos clases por la forma de sus puntos

#### Scenario: Ejemplo en curso
- **WHEN** el aprendizaje avanza de a un ejemplo o menos
- **THEN** el punto de ese ejemplo se destaca en el plano

#### Scenario: Descripción en texto
- **WHEN** un lector de pantalla llega al plano
- **THEN** anuncia la forma, cuántos puntos hay y qué parte de los apartados acierta la red

#### Scenario: Neurona elegida
- **WHEN** la persona elige una neurona oculta
- **THEN** el fondo del plano pasa a mostrar dónde se enciende esa neurona, con los puntos encima, y un rótulo sobre el plano dice de qué neurona es

#### Scenario: Volver a la red
- **WHEN** la persona suelta la neurona, o elige la de salida
- **THEN** el fondo vuelve a mostrar lo que contesta la red y el rótulo lo dice

#### Scenario: Vista previa
- **WHEN** la persona posa el cursor sobre una neurona oculta sin elegirla
- **THEN** el plano muestra el mapa de esa neurona mientras el cursor está encima

## ADDED Requirements

### Requirement: Qué detecta cada neurona
Con puntos, cada neurona oculta SHALL llevar adentro un mapa chico de dónde se
enciende en el plano, con los colores del plano, actualizado mientras la red
aprende. Con tu manejo no hay plano: la tarjeta de la neurona SHALL mostrar
su curva de respuesta a la entrada que se elija, con las demás como en el
ejemplo en curso.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña con puntos
- **THEN** cada una de las 4 neuronas ocultas muestra su mapa, y los mapas cambian mientras la red aprende

#### Scenario: Se ve cómo se combinan
- **WHEN** la red aprendió el círculo
- **THEN** cada neurona oculta muestra un corte recto del plano y el plano de la red, la zona cerrada que forman entre todos

#### Scenario: Dos capas ocultas
- **WHEN** la red tiene dos capas ocultas
- **THEN** los mapas de la segunda capa muestran formas armadas con los de la primera

#### Scenario: Capa resumida
- **WHEN** la persona resume una capa oculta
- **THEN** sus cuadritos no llevan mapa

#### Scenario: Con tu manejo
- **WHEN** los datos son de manejo y la persona elige una neurona oculta
- **THEN** su tarjeta muestra la curva de cómo responde a una entrada, con botones para elegir cuál, un punto en el valor del ejemplo en curso y una frase que la lee

#### Scenario: La curva cambia al aprender
- **WHEN** la red aprende con una neurona elegida
- **THEN** la curva se va moviendo con los pesos

#### Scenario: Con puntos no hay curva
- **WHEN** los datos son puntos y la persona elige una neurona
- **THEN** la tarjeta no muestra la curva: el mapa del plano ya dice qué detecta

#### Scenario: Sin depender del color
- **WHEN** un lector de pantalla llega a una neurona con mapa
- **THEN** anuncia su valor y en qué parte del plano se enciende más

#### Scenario: Vuelta atrás
- **WHEN** la persona reinicia los pesos
- **THEN** los mapas vuelven a mostrar una red que no sabe nada

### Requirement: Detalle de una conexión en el Laboratorio
Al elegir una conexión, el panel SHALL mostrar su detalle en el lugar de la
tarjeta: de dónde a dónde va, su peso para cambiarlo, apagarla o encenderla,
y la historia de su peso. El cambio va a la red que aprende, como los de la
tarjeta, y cuenta como un cambio a mano. SHALL tener tooltips y textos en
español y en inglés.

#### Scenario: Elegir una conexión
- **WHEN** la persona hace clic en una línea de la red
- **THEN** el panel muestra el detalle de esa conexión, y la guía y las misiones dejan de mostrarse como con la tarjeta

#### Scenario: Cambiar el peso en el lugar
- **WHEN** la persona arrastra la pastilla de la conexión elegida
- **THEN** el peso cambia en la red que aprende, el plano se repinta mientras la mueve y el contador de cambios a mano sube en uno al soltar

#### Scenario: Deshacer
- **WHEN** la persona deshace
- **THEN** la red vuelve a los pesos de justo antes de ese cambio

#### Scenario: Soltar
- **WHEN** la persona suelta la conexión
- **THEN** el detalle desaparece y el panel queda como al abrir

### Requirement: Historia de un peso
El detalle de una conexión SHALL mostrar una línea con el valor de su peso a
lo largo de las épocas, con el valor de ahora en números y una marca donde
hubo un cambio a mano. La línea SHALL crecer mientras la red aprende.

#### Scenario: Peso que se acomoda
- **WHEN** la red aprendió 100 épocas y la persona elige una conexión
- **THEN** ve cómo ese peso se movió desde su valor al azar hasta el de ahora

#### Scenario: Cambio a mano en la historia
- **WHEN** la persona cambió ese peso a mano en la época 60
- **THEN** la línea muestra el salto y una marca en esa época

#### Scenario: Sin épocas
- **WHEN** la red no completó ninguna época
- **THEN** en lugar de la línea, un texto dice que la historia aparece al terminar la primera época

#### Scenario: Descripción en texto
- **WHEN** un lector de pantalla llega a la historia
- **THEN** anuncia el valor inicial, el de ahora y cuántas épocas lleva

### Requirement: Lo que el Laboratorio no usa de la vista
En el Laboratorio MUST NOT mostrarse el interruptor de flujo ni el botón de
comparar con el original: el aprendizaje ya anima la red, y acá no hay un
cerebro original con el que comparar.

#### Scenario: Controles que no están
- **WHEN** la persona mira los controles de arriba de la red en el Laboratorio
- **THEN** no encuentra "Flujo" ni "Ver original"
