## ADDED Requirements

### Requirement: Compuertas al abrir
Al abrirse por primera vez, el Laboratorio SHALL mostrar la compuerta AND
lista para resolver a mano: una red de dos entradas y una neurona de salida,
sin capas ocultas, con los dos pesos y el sesgo en cero, el aprendizaje en
pausa, la tabla de verdad y el plano con los cuatro casos. Dos personas MUST
ver lo mismo.

#### Scenario: Estado por defecto
- **WHEN** la persona abre Laboratorio por primera vez
- **THEN** los datos son compuertas con AND elegida, la red es 2 → 1 con pesos y sesgo en cero, la barra de reproducción está en pausa y la tabla de verdad dice 0 de 4 aciertos, porque la red no se decide en ningún caso

#### Scenario: Nada se mueve solo
- **WHEN** la persona abre la pestaña y no toca nada durante 30 segundos
- **THEN** los pesos, la tabla, el plano y la curva siguen igual

#### Scenario: Siempre igual
- **WHEN** dos personas abren la pestaña sin tocar nada
- **THEN** ven la misma red, los mismos números y la misma tabla

### Requirement: Nada aprende sin pedirlo
El aprendizaje SHALL empezar solo cuando la persona reproduce o avanza un
paso. Cambiar la clase de datos, un ajuste de los datos o la forma de la red
MUST NOT poner a aprender una red que estaba en pausa; si estaba
reproduciendo, sigue reproduciendo.

#### Scenario: Elegir puntos en pausa
- **WHEN** con el aprendizaje en pausa la persona elige puntos
- **THEN** el plano muestra los puntos en círculo y la red de siempre, en pausa, y la guía dice que reproducir pone a aprender la red

#### Scenario: Aprende al reproducir
- **WHEN** con puntos en círculo y los valores por defecto la persona reproduce y no toca nada durante 30 segundos
- **THEN** la red acierta al menos el 90 % de los puntos apartados y el plano muestra un círculo de un color rodeado del otro

#### Scenario: Cambiar algo reproduciendo
- **WHEN** la red está aprendiendo y la persona cambia la forma de los puntos
- **THEN** la red vuelve a pesos al azar y el aprendizaje sigue corriendo

### Requirement: Tabla de verdad
Con compuertas, el tablero SHALL mostrar la tabla de verdad: una fila por
caso con las dos entradas, la respuesta correcta, lo que contesta la red con
su seguridad, y una marca de acierto que no depende solo del color, más el
total de aciertos. Una respuesta de exactamente 0,5 MUST leerse "no se
decide" y no contar como acierto. La tabla MUST actualizarse mientras se
mueve una perilla o la red aprende.

#### Scenario: Mover una perilla
- **WHEN** la persona arrastra la pastilla de un peso
- **THEN** la columna de la red y las marcas de acierto cambian mientras arrastra

#### Scenario: Resuelta
- **WHEN** la red contesta bien los cuatro casos
- **THEN** la tabla dice 4 de 4 y cada fila lleva su marca de acierto

#### Scenario: Elegir una fila
- **WHEN** la persona hace clic en una fila
- **THEN** las entradas de la red toman los valores de esa fila, la red muestra su cuenta y el punto de prueba va a ese caso del plano

#### Scenario: Ejemplo en curso
- **WHEN** el aprendizaje avanza de a un ejemplo o menos
- **THEN** la fila del caso que se está corrigiendo se destaca

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega a la tabla
- **THEN** la lee como una tabla con encabezados y anuncia cuántos casos acierta la red

### Requirement: Plano de las compuertas
Con compuertas, el plano SHALL ir de −0,5 a 1,5 en los dos ejes, para que los
cuatro casos (0 y 1 en cada entrada) queden adentro y lejos del borde, con el
fondo pintado con lo que contesta la red y los casos con su color y su forma.
Sin capas ocultas, el fondo MUST quedar partido por una recta.

#### Scenario: Cuatro casos a la vista
- **WHEN** la persona mira el plano con compuertas
- **THEN** ve los cuatro casos en las esquinas de un cuadrado, cada uno con el color y la forma de su respuesta correcta, y las marcas de 0 y 1 en los ejes

#### Scenario: La recta se mueve
- **WHEN** sin capas ocultas la persona cambia el sesgo
- **THEN** la frontera entre los dos colores del fondo se corre sin girar; al cambiar un peso, gira

#### Scenario: Pesos en cero
- **WHEN** los pesos y el sesgo están en cero
- **THEN** el fondo es parejo, sin frontera, y la tabla dice que la red no se decide en ningún caso

### Requirement: Elegir la compuerta
Con compuertas, la barra SHALL mostrar AND, OR y XOR como opciones, cada una
con su miniatura de cuatro casos y su nombre. Cambiar de compuerta MUST
cambiar los datos, la tabla y el plano, y vaciar las curvas, pero MUST
conservar la red y sus pesos, para que se vea qué hay que cambiar de una a
otra.

#### Scenario: De AND a OR
- **WHEN** la persona resolvió AND a mano y elige OR
- **THEN** la red queda con los mismos pesos y el mismo sesgo, la tabla muestra los casos de OR y dice cuántos acierta así

#### Scenario: Ajustes que no sirven
- **WHEN** los datos son compuertas
- **THEN** la barra no muestra ruido ni cantidad, el panel no muestra los apartados, y la curva muestra solo la práctica

#### Scenario: Restablecer los datos
- **WHEN** la persona restablece desde la barra con compuertas
- **THEN** la compuerta vuelve a AND y la red no cambia

### Requirement: Perillas en la red del Laboratorio
El Laboratorio SHALL pedirle a la red las perillas sobre el diagrama: pesos y
sesgos, más las entradas con puntos o compuertas. Con compuertas, cada entrada
lleva un interruptor 0/1; con puntos, una pastilla que mueve el punto de
prueba. Cada cambio de peso o sesgo cuenta como cambio a mano.

#### Scenario: Red de las compuertas
- **WHEN** se abre la pestaña
- **THEN** sobre la red se ven las pastillas de los dos pesos, la del sesgo de la salida y los interruptores de las dos entradas

#### Scenario: Interruptor de una entrada
- **WHEN** la persona cambia la entrada de abajo de 0 a 1
- **THEN** la red recalcula con ese valor, el punto de prueba se mueve a ese caso del plano y la fila de ese caso se destaca en la tabla

#### Scenario: Deshacer una perilla
- **WHEN** la persona arrastra la pastilla del sesgo y después elige "Deshacer"
- **THEN** el sesgo vuelve al valor de antes y se lee "Sin cambios"

#### Scenario: Con tu manejo
- **WHEN** los datos son tu manejo
- **THEN** las entradas no llevan perilla, y los pesos y sesgos la llevan según el tamaño de la red

### Requirement: Se ve en el momento si va mejor
Mientras la persona mueve una perilla de peso o de sesgo, en pausa o
aprendiendo, el fondo del plano, la tabla de verdad y el error de ahora SHALL
actualizarse en el mismo cuadro, sin demora visible. Junto a la curva, el
error de ahora MUST compararse con el de antes de empezar a moverla, con una
flecha y una palabra (baja, sube, igual), sin sumar puntos a la curva.

#### Scenario: Fondo en el momento
- **WHEN** la persona arrastra la pastilla del sesgo de un extremo al otro durante dos segundos con compuertas
- **THEN** la frontera del fondo se corre en cada cuadro del arrastre, sin saltos ni retraso visible respecto de la pastilla

#### Scenario: Va mejor
- **WHEN** con AND la persona sube un peso y el error de los cuatro casos baja
- **THEN** junto a la curva se lee el error de antes, el de ahora y "baja" con una flecha hacia abajo, mientras arrastra

#### Scenario: Va peor
- **WHEN** el cambio hace subir el error
- **THEN** se lee "sube" con una flecha hacia arriba, y no depende solo del color

#### Scenario: Al soltar
- **WHEN** la persona suelta la pastilla
- **THEN** la comparación queda a la vista hasta el próximo cambio o el próximo paso del aprendizaje, y la curva no sumó ningún punto

#### Scenario: Con puntos
- **WHEN** los datos son puntos y la persona mueve una perilla
- **THEN** el fondo del plano y el error de ahora se actualizan igual, en el momento

#### Scenario: Con tu manejo
- **WHEN** los datos son tu manejo y la persona mueve una perilla
- **THEN** el error de ahora y su comparación se actualizan en el momento

### Requirement: XOR no se separa con una recta
Con XOR y sin capas ocultas, la red MUST NOT poder acertar los cuatro casos,
ni a mano ni aprendiendo. Después de cinco cambios a mano o de 50 épocas sin
acertarlos, la guía SHALL explicar que una neurona sola parte el plano con
una recta y ninguna recta separa XOR, y ofrecer agregar una capa oculta de dos
neuronas.

#### Scenario: Antes de intentarlo
- **WHEN** la persona elige XOR sin capas ocultas
- **THEN** la guía la invita a intentarlo y todavía no dice que no se puede

#### Scenario: A mano no llega
- **WHEN** la persona hace cinco cambios a mano con XOR sin capas ocultas
- **THEN** la tabla nunca pasó de 3 de 4 y la guía explica lo de la recta, con el botón "Agregar una capa oculta de 2"

#### Scenario: Aprendiendo tampoco
- **WHEN** con XOR sin capas ocultas la persona reproduce 50 épocas
- **THEN** la tabla no pasa de 3 de 4, la curva de error deja de bajar, y la guía explica lo de la recta

#### Scenario: Agregar la capa
- **WHEN** la persona elige "Agregar una capa oculta de 2"
- **THEN** la red pasa a 2 → 2 → 1 con los pesos fijos con que arranca la capa oculta de las compuertas (unos que aprenden XOR), en pausa, y la guía dice que ahora hay dos rectas que se combinan

#### Scenario: Con la capa oculta
- **WHEN** con XOR la persona elige "Agregar una capa oculta de 2" y reproduce con los valores por defecto
- **THEN** la red acierta los cuatro casos antes de un minuto y el fondo del plano deja de ser una sola recta

#### Scenario: Trabada en un mínimo local
- **WHEN** con XOR y una capa oculta la red lleva 50 épocas o más sin acertar los cuatro casos y el error bajó menos de 0,01 en las últimas 50
- **THEN** la guía dice con palabras llanas que la red quedó trabada en un mínimo local, un pozo del que corrigiendo de a poco no sale, y sugiere "Reiniciar pesos" para probar con otros pesos

### Requirement: De la mano a backpropagation
Con compuertas, la reproducción SHALL arrancar de a una neurona, a un paso
por segundo, para que "Paso" muestre la corrección de backpropagation desde
los pesos puestos a mano. La guía MUST decir que, si a mano no sale, "Paso"
muestra cómo la corregiría el aprendizaje.

#### Scenario: Primer paso
- **WHEN** la persona puso pesos a mano y presiona "Paso"
- **THEN** la red hace la ida del primer caso con esos pesos y la operación en curso lo muestra con sus números

#### Scenario: Neurona por neurona
- **WHEN** la persona sigue avanzando con "Paso"
- **THEN** ve la ida, el error, la culpa de cada neurona y la corrección de cada peso, de a una neurona, y las pastillas de los pesos se mueven con la corrección

#### Scenario: De corrido
- **WHEN** la persona pasa a épocas y reproduce
- **THEN** la red aprende de corrido desde donde estaba, y la tabla y el plano lo siguen

### Requirement: Ver una solución
Con compuertas, el panel SHALL ofrecer "Ver una solución", que pone pesos y
sesgos que aciertan los cuatro casos de la compuerta elegida con la red de
ahora. Cuenta como un cambio a mano. Con XOR sin capas ocultas no se ofrece,
y un texto dice por qué.

#### Scenario: Solución de AND
- **WHEN** la persona elige "Ver una solución" con AND sin capas ocultas
- **THEN** los pesos y el sesgo toman valores que aciertan los cuatro casos, la tabla dice 4 de 4 y "Deshacer" los devuelve a como estaban

#### Scenario: Solución de XOR
- **WHEN** la persona elige "Ver una solución" con XOR y una capa oculta de dos
- **THEN** una neurona oculta queda como OR, la otra como AND, la salida las combina y la tabla dice 4 de 4

#### Scenario: Red que no se presta
- **WHEN** la red tiene una forma para la que no hay una solución preparada
- **THEN** el botón se ve sin acción y su tooltip dice que la solución está preparada para cero capas ocultas o una de dos

### Requirement: Cada clase de datos con lo suyo
El Laboratorio SHALL guardar por separado, para compuertas, puntos y tu
manejo, la red, sus pesos, sus cambios a mano, las curvas, la forma de la red
y los ajustes del aprendizaje. Cambiar de clase MUST mostrar lo que esa clase
tenía y dejar el aprendizaje en pausa si lo estaba.

#### Scenario: Volver a compuertas
- **WHEN** la persona resuelve AND a mano, pasa a puntos, reproduce unas épocas y vuelve a compuertas
- **THEN** encuentra AND resuelta con sus pesos, sus cambios a mano y su curva

#### Scenario: Primera vez en puntos
- **WHEN** la persona elige puntos por primera vez
- **THEN** la red es la de siempre, una capa oculta de 4 con tanh, con los puntos en círculo

#### Scenario: Red de siempre en compuertas
- **WHEN** con compuertas la persona elige "Red de siempre"
- **THEN** la red vuelve a 2 → 1 con pesos y sesgo en cero y la tasa por defecto de las compuertas

#### Scenario: Reiniciar pesos en compuertas
- **WHEN** con compuertas y sin capas ocultas la persona elige "Reiniciar pesos"
- **THEN** los pesos y el sesgo vuelven a cero; con capas ocultas, vuelven a pesos al azar de la serie

### Requirement: Textos de las compuertas
Cada control nuevo (la compuerta, los interruptores de las entradas, las
pastillas, "Ver una solución", "Agregar una capa oculta de 2" y la tabla de
verdad) SHALL tener un tooltip que diga qué hace y por qué importa, y todos
los textos SHALL estar en español y en inglés.

#### Scenario: Tooltip de XOR
- **WHEN** la persona posa el cursor sobre XOR
- **THEN** un tooltip dice que contesta sí cuando las entradas son distintas, y que es el ejemplo clásico de algo que una neurona sola no resuelve

#### Scenario: En inglés
- **WHEN** la persona cambia el idioma a inglés con compuertas elegidas
- **THEN** la tabla, la guía, las misiones y los tooltips se leen en inglés, y los nombres AND, OR y XOR no cambian

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con compuertas a 1440×900, en español o en inglés
- **THEN** se ven sin desplazar ninguna zona la red con sus perillas, la reproducción, el plano, la tabla de verdad, la curva y el panel entero

## MODIFIED Requirements

### Requirement: Elegir los datos
La barra de arriba SHALL empezar por la clase de datos, compuertas, puntos o
tu manejo, y mostrar solo los ajustes de la clase elegida. Cambiar un ajuste
de los datos de puntos o de tu manejo MUST generar los datos de nuevo y
empezar el aprendizaje desde cero, con la misma red. Cambiar de compuerta
conserva los pesos (ver "Elegir la compuerta").

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** los datos son compuertas, con AND elegida

#### Scenario: Cambiar la forma
- **WHEN** la persona elige la espiral
- **THEN** el plano muestra los puntos nuevos, la red vuelve a pesos al azar, la curva se vacía y el aprendizaje queda reproduciendo o en pausa, como estaba

#### Scenario: Formas a la vista
- **WHEN** la persona mira la barra con puntos elegidos
- **THEN** ve las cuatro formas como opciones con su miniatura y su nombre, el ruido y la cantidad

#### Scenario: Pasar a tu manejo
- **WHEN** la persona elige tu manejo
- **THEN** la barra pasa a mostrar la pista, el tráfico y la velocidad, el tablero pasa a mostrar la escena, y la red pasa a tener una entrada por sensor más la velocidad y cuatro salidas

#### Scenario: Volver a puntos
- **WHEN** la persona vuelve a puntos
- **THEN** encuentra la forma, el ruido y la cantidad que había dejado

#### Scenario: Restablecer
- **WHEN** la persona restablece desde la barra
- **THEN** los datos vuelven a los valores por defecto de la clase elegida

### Requirement: Reproducción del aprendizaje
Debajo de la red SHALL haber una barra de reproducción con: reproducir o
pausar, un paso, de a cuánto avanza cada paso (época, ejemplo, fase, capa o
neurona), el ritmo, y por dónde va. Una época es una pasada por todos los
ejemplos de práctica. El ritmo SHALL poder bajarse hasta un paso por segundo.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la barra muestra que está en pausa, de a una neurona, a un paso por segundo

#### Scenario: Por defecto con puntos o tu manejo
- **WHEN** la persona elige puntos o tu manejo por primera vez
- **THEN** la barra queda de a épocas, y en pausa si estaba en pausa

#### Scenario: Pausar
- **WHEN** la persona pausa
- **THEN** el aprendizaje se detiene al terminar el ejemplo en curso y la red queda como estaba

#### Scenario: Por dónde va
- **WHEN** el paso a paso va por la culpa de la segunda neurona de la capa oculta
- **THEN** la barra lo dice con palabras: la época, el ejemplo, la fase, la capa y la neurona

#### Scenario: Ritmo de épocas
- **WHEN** la persona baja el ritmo reproduciendo de a épocas
- **THEN** el plano y las curvas avanzan más despacio, sin saltos

#### Scenario: Ritmo según el tamaño del paso
- **WHEN** la persona cambia de épocas a neuronas
- **THEN** el control de ritmo pasa a decir pasos por segundo, con un valor que deja ver cada paso

### Requirement: Armar la red
El panel SHALL permitir elegir la cantidad de capas ocultas (de 0 a 3), las
neuronas de cada una (de 1 a 8) y la activación (tanh, sigmoide o ReLU), todo
a la vista. Cambiar cualquiera MUST armar una red nueva con pesos al azar y
empezar el aprendizaje desde cero, en el momento, y la red nueva se ve en la
zona grande.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la red no tiene capas ocultas: dos entradas y una neurona de salida

#### Scenario: Estado por defecto con puntos o tu manejo
- **WHEN** la persona elige puntos o tu manejo por primera vez
- **THEN** la red tiene una capa oculta de 4 neuronas con tanh

#### Scenario: Agregar una capa
- **WHEN** la persona pasa de una a dos capas ocultas
- **THEN** la red de la zona grande muestra la capa nueva en el momento y el aprendizaje vuelve a empezar

#### Scenario: Capa nueva en compuertas
- **WHEN** con compuertas la persona pasa de cero a una capa oculta
- **THEN** la capa nueva tiene 2 neuronas

#### Scenario: Sin capas ocultas
- **WHEN** la persona elige cero capas ocultas con los puntos en círculo
- **THEN** la red aprende lo que puede, el fondo del plano queda partido por una recta y los aciertos no pasan de lo que una recta logra

#### Scenario: Neuronas de una capa
- **WHEN** hay dos capas ocultas
- **THEN** cada una tiene su propio ajuste de neuronas

#### Scenario: Por qué no hay escalón
- **WHEN** la persona posa el cursor sobre la activación
- **THEN** un tooltip explica qué es y que acá no está el escalón porque no tiene pendiente y el error no puede viajar hacia atrás

#### Scenario: Volver a la red de siempre
- **WHEN** la persona elige "Red de siempre" en el panel con puntos o tu manejo
- **THEN** vuelve a una capa de 4 con tanh y la tasa por defecto

#### Scenario: Dos botones con nombres distintos
- **WHEN** la persona lee los botones del panel y los de arriba de la red
- **THEN** "Red de siempre" vuelve a la forma por defecto y "Restablecer la red" quita los cambios a mano, y ningún otro botón lleva esos nombres

### Requirement: Aprender a manejar imitando
Con tu manejo, la red SHALL aprender de ejemplos de manejo, que por defecto
son los de un maestro: el cerebro de ejemplo de la calle con tráfico nuevo,
manejando un minuto en la pista y el tráfico de la barra. El maestro SHALL
poder cambiarse por otro cerebro. Mientras aprende, la escena SHALL mostrar a
la red manejando con lo que sabe en ese momento.

#### Scenario: Estado por defecto de tu manejo
- **WHEN** la persona elige tu manejo por primera vez
- **THEN** los ejemplos ya están, tomados del maestro por defecto, y la red empieza a aprender al reproducir, sin grabar nada

#### Scenario: Se la ve aprender a manejar
- **WHEN** la red aprende
- **THEN** en la escena el auto maneja con la red de ese momento, vuelve a empezar solo cuando choca, y maneja mejor a medida que baja el error

#### Scenario: Cambiar de maestro
- **WHEN** la persona elige otro cerebro como maestro
- **THEN** se toman los ejemplos de ese cerebro, con sus sensores, y el aprendizaje empieza desde cero

#### Scenario: Cambiar la pista
- **WHEN** la persona elige otra pista en la barra
- **THEN** se toman los ejemplos de nuevo en esa pista y la escena pasa a esa pista

#### Scenario: Resumen de los ejemplos
- **WHEN** la persona mira el tablero
- **THEN** lee cuántos ejemplos hay, de quién son y en qué parte se acciona cada control

### Requirement: Guía y misiones del Laboratorio
Con la guía activa, el panel SHALL empezar con un texto breve que diga qué se
está viendo y qué probar primero, y terminar con tres misiones en tres
renglones. Con compuertas: resolver AND a mano, resolver OR a mano y resolver
XOR con una capa oculta. Con puntos o tu manejo: seguir una corrección entera
paso a paso, hacer que la red memorice, y guardar un cerebro que aprendió a
manejar imitando. Las misiones MUST NOT bloquear nada.

#### Scenario: Guía visible
- **WHEN** la guía está activa con puntos o tu manejo
- **THEN** el texto dice que la red aprende de ejemplos, que el fondo es lo que contesta y qué probar primero

#### Scenario: Guía de las compuertas
- **WHEN** la guía está activa con AND elegida
- **THEN** el texto dice que la neurona tiene que contestar sí solo cuando las dos entradas valen 1, que los pesos y el sesgo se mueven sobre la red, y que "Paso" muestra cómo lo corregiría el aprendizaje

#### Scenario: Guía oculta
- **WHEN** la persona apaga la guía
- **THEN** el texto y las misiones no se muestran

#### Scenario: Misión de AND a mano
- **WHEN** la tabla llega a 4 de 4 con AND sin que el aprendizaje haya dado ningún paso desde que se eligió AND
- **THEN** la misión de AND queda cumplida

#### Scenario: Resuelta aprendiendo
- **WHEN** la tabla llega a 4 de 4 con OR después de que el aprendizaje dio pasos
- **THEN** la misión de OR no se cumple, y un texto junto a la tabla dice que esta vez la resolvió el aprendizaje

#### Scenario: Misión de XOR
- **WHEN** la tabla llega a 4 de 4 con XOR y una capa oculta, a mano o aprendiendo
- **THEN** la misión de XOR queda cumplida

#### Scenario: Misión de la corrección
- **WHEN** la persona avanza paso a paso las cuatro fases de un mismo ejemplo
- **THEN** la misión de la corrección queda cumplida, se vea o no en ese momento

#### Scenario: Misión de memorizar
- **WHEN** aparece el aviso de que la red está memorizando
- **THEN** la misión de memorizar queda cumplida

#### Scenario: Misión de manejar
- **WHEN** la persona guarda un cerebro desde el Laboratorio
- **THEN** la misión de manejar queda cumplida

#### Scenario: Misión cumplida con la tarjeta abierta
- **WHEN** una misión se cumple mientras la tarjeta de una neurona está abierta
- **THEN** al cerrar la tarjeta la misión se ve cumplida

#### Scenario: Términos con su nombre
- **WHEN** la persona posa el cursor sobre "época", "tasa de aprendizaje", "culpa", "sobreajuste" o "compuerta"
- **THEN** un tooltip dice qué es con palabras llanas y con su nombre técnico

### Requirement: Estado conservado en el Laboratorio
Al salir de la pestaña y volver, la pestaña SHALL conservar la clase de datos
elegida y, de cada clase, los datos, la red con lo aprendido y sus cambios a
mano, las curvas y los ajustes; además el ritmo, la vista elegida con sus
filtros y los ejemplos grabados, hasta cerrar la aplicación. El aprendizaje
MUST quedar en pausa mientras la pestaña no está a la vista.

#### Scenario: Volver a la pestaña
- **WHEN** la persona deja una red a medio aprender, abre Competir y vuelve
- **THEN** encuentra la misma red, las mismas curvas y los mismos ajustes

#### Scenario: Pausa al salir
- **WHEN** la persona abre otra pestaña con el aprendizaje en marcha
- **THEN** el aprendizaje no avanza hasta que vuelve

#### Scenario: Cambios a mano conservados
- **WHEN** la persona apaga una neurona, pasa a la tabla de datos filtrada por los que falla, abre Competir y vuelve
- **THEN** encuentra la neurona apagada, el contador de cambios, la tabla de datos y su filtro como los dejó

#### Scenario: Compuertas conservadas
- **WHEN** la persona deja XOR con una capa oculta a medio resolver, abre Inspeccionar y vuelve
- **THEN** encuentra XOR, la misma red con sus pesos y la tabla como la dejó

## REMOVED Requirements

### Requirement: Aprendiendo al abrir
**Reason**: El Laboratorio ya no abre aprendiendo; abre con la compuerta AND en pausa para resolver a mano.
**Migration**: Ver "Compuertas al abrir" y "Nada aprende sin pedirlo"; el escenario "Aprende sola" pasa a "Aprende al reproducir".
