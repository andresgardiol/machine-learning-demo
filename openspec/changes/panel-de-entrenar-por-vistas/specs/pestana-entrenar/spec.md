# Spec Delta

## MODIFIED Requirements

### Requirement: Entrenamiento en marcha al abrir
Al abrirse por primera vez, la pestaña SHALL mostrar un entrenamiento ya en
marcha, sin configurar nada: una población de 100 autos en una calle recta de
tres carriles con tráfico, cada uno con una red de 5 sensores más la velocidad,
una capa oculta de 6 neuronas y 4 salidas, en la generación 1 y a velocidad
normal. Cada generación SHALL enfrentar un tráfico distinto del de la
anterior.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña por primera vez
- **THEN** se ven 100 autos saliendo desde el mismo punto, la generación 1 en curso y el líder destacado con sus sensores

#### Scenario: Aprendizaje sin intervención
- **WHEN** la persona no toca nada durante varias generaciones
- **THEN** las generaciones se suceden solas y la curva de fitness se va completando

#### Scenario: Tráfico distinto en cada generación
- **WHEN** termina la primera generación sin que la persona haya tocado nada
- **THEN** la segunda empieza con los vehículos del tráfico en otras posiciones y el ajuste de tráfico de la vista de ajustes muestra elegido "nuevo en cada generación"

#### Scenario: Volver al estado por defecto
- **WHEN** la persona eligió "el mismo" tráfico y presiona restablecer la configuración
- **THEN** el ajuste vuelve a "nuevo en cada generación" desde la generación siguiente, sin reiniciar el entrenamiento

### Requirement: Configuración avanzada
La pestaña SHALL ofrecer, en la vista de ajustes del panel, los ajustes de
evolución (élite, selección, probabilidad de mutación, cruce, función de
fitness, duración máxima, eliminar a los lentos y modo de tráfico) que SHALL aplicarse desde la generación siguiente, con la misma indicación
que la configuración básica. Los de escenario (pista, carriles, densidad,
irregularidad y velocidad máxima del auto) SHALL estar en la barra de
escenario y aplicarse en el momento: la generación en curso vuelve a empezar
con la misma población.

#### Scenario: Sección colapsada
- **WHEN** se abre la pestaña
- **THEN** el panel muestra la vista de entrenamiento y los ajustes avanzados no están a la vista

#### Scenario: Cambiar la función de fitness
- **WHEN** la persona elige "tiempo sin chocar"
- **THEN** la generación siguiente se evalúa con esa función y los indicadores pasan a mostrar segundos

#### Scenario: Cambiar los carriles
- **WHEN** la persona elige cuatro carriles durante una generación
- **THEN** la generación en curso vuelve a empezar en ese momento, con los mismos autos, en una calle de cuatro carriles, sin ninguna indicación de cambio pendiente

#### Scenario: Apagar la regla de los lentos
- **WHEN** la persona apaga "eliminar a los lentos" durante una generación
- **THEN** la generación en curso sigue con la regla y en la siguiente ningún auto sale de carrera por lento

#### Scenario: Velocidad máxima compartida
- **WHEN** la persona cambia la velocidad máxima del auto en esta pestaña y luego abre El problema
- **THEN** el auto de El problema tiene esa misma velocidad máxima

### Requirement: Red y sensores
La pestaña SHALL ofrecer, en la vista de ajustes, la cantidad de capas
ocultas (0 a 3), las neuronas de cada capa (1 a 16) y la activación de las
capas ocultas, y en la barra de escenario, los sensores (cantidad, alcance y
apertura). Cambiar cualquiera de
ellos MUST empezar un entrenamiento nuevo: de inmediato si no terminó ninguna
generación, y con confirmación si ya terminó alguna.

#### Scenario: Cambio antes de la primera generación
- **WHEN** la persona agrega una capa oculta antes de que termine la primera generación
- **THEN** el entrenamiento empieza de nuevo de inmediato y el diagrama muestra la capa agregada

#### Scenario: Cambio con progreso
- **WHEN** la persona cambia la cantidad de sensores con 20 generaciones terminadas
- **THEN** una confirmación explica que el cambio empieza un entrenamiento nuevo, que se dejan 20 generaciones y que el campeón queda autoguardado

#### Scenario: Cancelar el cambio
- **WHEN** la persona cancela esa confirmación
- **THEN** el ajuste vuelve a su valor anterior y el entrenamiento continúa sin cambios

#### Scenario: Arrastre de un deslizador
- **WHEN** la persona arrastra el deslizador de neuronas pasando por varios valores con progreso acumulado
- **THEN** la confirmación se pide una sola vez, al soltar el deslizador

#### Scenario: Cambio mientras se sigue entrenando un cerebro
- **WHEN** el entrenamiento sigue al cerebro guardado "Prudente", de 5 sensores, y la persona pasa a 18 sensores y confirma
- **THEN** empieza un entrenamiento nuevo con una población al azar de 18 sensores, el escenario y la red del tablero muestran 18, y la pestaña deja de decir que se sigue entrenando "Prudente"

#### Scenario: La confirmación lo avisa
- **WHEN** la persona cambia la red o los sensores mientras sigue entrenando un cerebro guardado
- **THEN** la confirmación dice que se deja de seguir a ese cerebro, que no se borra de la biblioteca, y que se empieza con una población nueva

### Requirement: Guardar el campeón
La vista de entrenamiento SHALL ofrecer un solo botón para guardar en la
biblioteca, con un nombre sugerido, al campeón de la última generación
terminada o, con selección manual, al padre elegido. Si el entrenamiento ya
tiene un cerebro guardado, ese botón lo actualiza. Guardar MUST NOT agregar
renglones a esa vista. Elegir el nombre y guardar como nuevo SHALL hacerse en
la vista de cerebros. Mientras no haya qué guardar, el control MUST estar
deshabilitado y explicar por qué.

#### Scenario: Sin campeón todavía
- **WHEN** no terminó ninguna generación y la persona posa el cursor sobre guardar
- **THEN** el control está deshabilitado y su tooltip explica que hace falta terminar una generación

#### Scenario: Guardar
- **WHEN** la persona escribe "Prudente" en la vista de cerebros y guarda tras la generación 15
- **THEN** la biblioteca muestra "Prudente" con 15 generaciones y el entrenamiento sigue sin interrumpirse

#### Scenario: Guardar con la biblioteca plegada
- **WHEN** la persona guarda al campeón desde la vista de entrenamiento, sin abrir la vista de cerebros
- **THEN** un mensaje en el mismo renglón del botón dice con qué nombre se guardó, el contador de la pestaña de cerebros aumenta en uno y el alto de la vista no cambia

#### Scenario: Guardar tras continuar un cerebro
- **WHEN** el entrenamiento continúa desde el cerebro guardado "Prudente" y la persona va a guardar
- **THEN** el botón de la vista de entrenamiento dice que actualiza "Prudente", y la vista de cerebros ofrece las dos acciones: actualizar "Prudente" o guardar como nuevo

#### Scenario: Guardar al padre elegido
- **WHEN** la selección es manual, la persona eligió un padre en la generación 5 y guarda
- **THEN** la biblioteca muestra un cerebro con la red de ese padre, y el botón dice que se guarda al padre elegido

#### Scenario: Selección manual sin padre
- **WHEN** la selección es manual, no hay padre elegido y la persona posa el cursor sobre guardar
- **THEN** el control está deshabilitado y su tooltip explica que primero hay que elegir un padre

#### Scenario: Guardar con un clic
- **WHEN** termina una generación y la persona presiona guardar en la vista de entrenamiento sin escribir nada
- **THEN** el campeón queda guardado con un nombre sugerido y el botón pasa a decir que actualiza ese cerebro

#### Scenario: Ir a ponerle nombre
- **WHEN** la persona acaba de guardar desde la vista de entrenamiento y activa "Renombrar" en el mensaje
- **THEN** el panel pasa a la vista de cerebros con el nombre de ese cerebro listo para editar y el foco en ese campo

#### Scenario: Deshacer una actualización
- **WHEN** la persona actualiza "Prudente" con un clic y enseguida activa "Deshacer" en el mensaje
- **THEN** "Prudente" vuelve a ser el cerebro que era antes de actualizarlo y el mensaje lo dice

#### Scenario: No se pudo guardar
- **WHEN** el navegador no permite guardar
- **THEN** el mensaje, en el mismo renglón, dice que no se pudo guardar y por qué, sin tecnicismos, y el botón sigue disponible para reintentar

#### Scenario: Mensaje que no se va solo
- **WHEN** la persona guarda y no hace nada más
- **THEN** el mensaje sigue a la vista hasta que guarda otra vez o empieza un entrenamiento nuevo, y un lector de pantalla lo anuncia sin que haya que mover el foco

#### Scenario: Nombre largo
- **WHEN** el entrenamiento tiene guardado un cerebro con un nombre de 40 caracteres
- **THEN** el botón de la vista de entrenamiento corta el nombre con puntos suspensivos, ocupa un solo renglón y el panel no se desplaza en horizontal

### Requirement: Biblioteca de cerebros en la pestaña
El panel SHALL mostrar la biblioteca de cerebros en una vista propia, la de
cerebros, con todo el alto del panel: arriba, guardar el campeón con el nombre
que la persona escriba; debajo, la acción de importar y la lista con las
acciones de cada cerebro. La pestaña de esa vista SHALL mostrar cuántos
cerebros hay.

#### Scenario: Biblioteca al abrir
- **WHEN** una persona abre la pestaña por primera vez y pasa a la vista de cerebros
- **THEN** ve un texto que explica que todavía no hay cerebros guardados y cómo guardar el campeón

#### Scenario: Cerebro guardado
- **WHEN** la persona guarda un cerebro
- **THEN** aparece primero en la lista sin recargar la página

#### Scenario: Contador
- **WHEN** la biblioteca tiene dos cerebros guardados y un autoguardado
- **THEN** la pestaña de la vista de cerebros muestra 3 aunque esté a la vista otra

#### Scenario: Lista larga
- **WHEN** la biblioteca tiene quince cerebros
- **THEN** la lista se desplaza dentro de la vista y guardar e importar siguen a la vista arriba

#### Scenario: Guardar como nuevo
- **WHEN** el entrenamiento ya tiene guardado "Prudente", la persona escribe "Audaz" en la vista de cerebros y elige guardar como nuevo
- **THEN** la biblioteca tiene los dos cerebros y el entrenamiento queda asociado a "Audaz"

### Requirement: Panel a la vista sin desplazarse
Con la ventana en 1440×900 y la guía activa, la vista de entrenamiento del
panel de Entrenar SHALL verse completa sin desplazarse, también después de
guardar un cerebro.
Con la ventana en 1366×768 SHALL verse sin desplazarse, como mínimo, los
controles de marcha, el interruptor de sensores del líder y la configuración
básica. Con selección manual, los controles de marcha con sus botones de
elegir y deshacer y la línea de estado SHALL verse sin desplazarse en los dos
tamaños.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900 y la guía activa
- **THEN** el panel no tiene barra de desplazamiento y se ven la guía, los controles de marcha con el ajuste de quién elige al padre, el interruptor de sensores, la configuración básica, guardar el campeón, las misiones y las tres pestañas del panel

#### Scenario: Pantalla de 1366×768
- **WHEN** se abre la pestaña con la ventana en 1366×768 y la guía activa
- **THEN** los controles de marcha, el interruptor de sensores del líder y la configuración básica se ven sin desplazar el panel

#### Scenario: Causa y efecto a la vista
- **WHEN** la persona mueve la fuerza de mutación con la ventana en 1440×900
- **THEN** el deslizador, la curva de fitness, la red del líder y los autos están a la vista al mismo tiempo

#### Scenario: Selección manual a la vista
- **WHEN** la selección es manual, con la ventana en 1366×768 y la guía activa
- **THEN** el ajuste de quién elige al padre, pausar, siguiente generación, elegir al líder, deshacer y la línea de estado del padre se ven sin desplazar el panel

#### Scenario: Después de guardar
- **WHEN** la persona guarda un cerebro con la ventana en 1440×900, en español o en inglés, con el panel en 360 píxeles de ancho
- **THEN** la vista de entrenamiento sigue sin barra de desplazamiento, ni vertical ni horizontal

### Requirement: Avanzado por grupos
En la vista de ajustes, los ajustes SHALL estar en dos bloques a la vista, sin
plegar y cada uno con su título: primero la red (capas ocultas, neuronas y
activación) y después la evolución, con la función de fitness primero. El
botón de restablecer y el aviso de cambios esperando SHALL verse en la vista.
Cada ajuste SHALL tener su tooltip, en español y en inglés.

#### Scenario: Abrir la sección avanzada
- **WHEN** la persona pasa a la vista de ajustes por primera vez
- **THEN** ve, sin desplegar nada, el bloque de la red arriba y el de la evolución debajo, con todos sus ajustes

#### Scenario: Abrir un grupo
- **WHEN** la persona mira el bloque de evolución
- **THEN** ve la función de fitness, la élite, la selección, la probabilidad de mutación, el cruce, la duración máxima, eliminar a los lentos y el modo de tráfico

#### Scenario: Grupo recordado
- **WHEN** la persona deja el panel en la vista de ajustes, abre otra pestaña y vuelve
- **THEN** el panel sigue en la vista de ajustes, con los dos bloques a la vista

#### Scenario: Confirmación de la red junto a su grupo
- **WHEN** la persona cambia las capas ocultas con generaciones terminadas
- **THEN** la confirmación de entrenamiento nuevo aparece dentro del bloque de red, junto al ajuste que la pidió

#### Scenario: Tooltip de un grupo
- **WHEN** la persona posa el cursor sobre la función de fitness
- **THEN** un tooltip en el idioma activo dice qué hace y por qué importa

#### Scenario: A un clic
- **WHEN** la persona quiere cambiar las capas de la red o la función de fitness desde la vista de entrenamiento
- **THEN** le alcanza con un clic, en la pestaña de ajustes, para tenerlas a la vista

#### Scenario: La red, sin desplazarse
- **WHEN** la persona pasa a la vista de ajustes con la ventana en 1440×900
- **THEN** el bloque de la red se ve entero sin desplazar el panel

### Requirement: Ajustes que no aplican con selección manual
Con selección manual, los ajustes de selección, élite y cruce de la vista de
ajustes SHALL verse deshabilitados y explicar que no se usan porque hay un
solo padre. Sus valores MUST conservarse y volver a regir con selección
automática.

#### Scenario: Ajustes deshabilitados
- **WHEN** la selección es manual y la persona mira el grupo de evolución
- **THEN** selección, élite y cruce están deshabilitados y su tooltip explica que con un solo padre no se usan

#### Scenario: Valores conservados
- **WHEN** la persona tenía la selección en 20 %, pasa a manual y vuelve a automática
- **THEN** la selección sigue en 20 % y vuelve a estar habilitada

### Requirement: Funciones de fitness a elegir
El ajuste de la función de fitness SHALL ofrecer las cuatro funciones en este
orden: ventaja, distancia, tiempo sin chocar y velocidad media, con la ventaja
elegida al abrir la pestaña. Las cuatro opciones MUST verse completas con el
panel en su ancho por defecto, en español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña y se pasa a la vista de ajustes
- **THEN** la función elegida es "ventaja", la élite es 10, la irregularidad del tráfico es 0 % y el enfriamiento de la mutación está encendido

#### Scenario: Cuatro opciones a la vista
- **WHEN** el panel mide 360 píxeles de ancho y la aplicación está en español o en inglés
- **THEN** las cuatro funciones se leen enteras, sin texto cortado ni fuera del panel

#### Scenario: Mostrar el contraste
- **WHEN** la persona elige "distancia" con la población ya pasando vehículos y deja correr unas generaciones
- **THEN** la función rige desde la generación siguiente y los indicadores y la curva pasan a mostrar metros recorridos

#### Scenario: Volver a los valores por defecto
- **WHEN** la persona cambió la función de fitness, la élite y la irregularidad, apagó el enfriamiento, y presiona restablecer
- **THEN** vuelven a ventaja, 10 y 0 %, y el enfriamiento se enciende, desde la generación siguiente y sin reiniciar el entrenamiento

### Requirement: Pistas del entrenamiento
En esta pestaña se entrena en una sola pista a la vez: la elegida en la barra
de escenario, la calle recta por defecto. Elegir otra pista MUST aplicarse en
el momento: la generación en curso vuelve a empezar en la pista nueva, con la
misma población y el mismo número de generación. El ajuste SHALL tener un
tooltip que diga qué hace y por qué importa, en español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la pista elegida en la barra de escenario es la calle recta

#### Scenario: Marcar un circuito
- **WHEN** la persona elige el óvalo durante la generación 7
- **THEN** la generación 7 vuelve a empezar en el óvalo en ese momento, con los mismos autos, sin esperar a la siguiente y sin ninguna indicación de cambio pendiente

#### Scenario: Última pista marcada
- **WHEN** la persona elige una pista
- **THEN** la anterior deja de estar elegida: siempre hay exactamente una

#### Scenario: Restablecer
- **WHEN** la persona eligió el circuito de curvas y restablece el escenario
- **THEN** la generación en curso vuelve a empezar en la calle recta, sin reiniciar el entrenamiento

#### Scenario: Tooltip
- **WHEN** la persona posa el cursor sobre las pistas de la barra
- **THEN** el tooltip explica que cada pista plantea un problema distinto y que cambiarla vuelve a empezar la generación en curso con los mismos autos

#### Scenario: Cerebro entrenado en varias pistas
- **WHEN** la persona sigue entrenando un cerebro guardado que alternaba varias pistas
- **THEN** el entrenamiento corre solo en la pista elegida en la barra, y los datos del cerebro siguen diciendo en qué pistas se entrenó antes

### Requirement: Generación en un circuito
Mientras una generación corre en un circuito, la pestaña SHALL mostrar el
nombre de la pista junto al número de generación sobre el escenario, y el
cuarto indicador del tablero SHALL pasar a mostrar las vueltas del líder, con
un decimal. En un circuito, los ajustes de
carriles, densidad, irregularidad y modo de tráfico SHALL verse deshabilitados
y explicar que en un circuito no hay tráfico.

#### Scenario: Pista a la vista
- **WHEN** la generación 12 corre en el óvalo
- **THEN** sobre el escenario se lee el número de generación y la barra de escenario muestra elegido el óvalo

#### Scenario: Indicador de vueltas
- **WHEN** el líder lleva una vuelta y cuarto del óvalo
- **THEN** el cuarto indicador se llama "Vueltas del líder" y muestra 1,2: un decimal, redondeado hacia abajo

#### Scenario: Vuelta a la calle
- **WHEN** la persona vuelve a elegir la calle recta
- **THEN** el cuarto indicador vuelve a ser el de vehículos superados por el líder

#### Scenario: Solo circuitos
- **WHEN** la pista elegida es un circuito
- **THEN** carriles, densidad e irregularidad, en la barra, y el modo de tráfico, en los ajustes, están deshabilitados, con su explicación, y conservan sus valores

#### Scenario: Curva con varias pistas
- **WHEN** la persona cambia de pista a mitad de un entrenamiento
- **THEN** la curva de fitness sigue siendo una sola, en metros de ventaja, y sigue mostrando las generaciones anteriores

## ADDED Requirements

### Requirement: Vistas del panel
El panel de Entrenar SHALL repartir su contenido en tres vistas, elegibles con
tres pestañas siempre visibles arriba del panel: entrenamiento (guía,
controles de marcha, interruptores de vista, configuración básica, guardar y
misiones), ajustes (la red, la evolución y restablecer) y cerebros (guardar con
nombre y la biblioteca). Al abrir SHALL verse la de entrenamiento. Cambiar de
vista MUST NOT cambiar el entrenamiento ni ningún ajuste.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña por primera vez
- **THEN** el panel muestra la vista de entrenamiento, con los mismos controles de marcha y la misma configuración básica que antes, y las pestañas de ajustes y de cerebros arriba

#### Scenario: Cambiar de vista
- **WHEN** la persona pasa a la vista de ajustes con el entrenamiento en marcha
- **THEN** el entrenamiento sigue, el escenario y el tablero siguen a la vista, y los atajos de teclado siguen funcionando

#### Scenario: Volver
- **WHEN** la persona vuelve a la vista de entrenamiento
- **THEN** encuentra los controles como los dejó

#### Scenario: Vista recordada
- **WHEN** la persona deja la vista de cerebros, abre otra pestaña de la aplicación y vuelve a Entrenar
- **THEN** el panel sigue en la vista de cerebros, hasta cerrar la aplicación

#### Scenario: Teclado
- **WHEN** la persona llega con Tab a las pestañas del panel y usa las flechas izquierda y derecha
- **THEN** el foco pasa de una pestaña a otra y la vista cambia con él; Tab entra al contenido de la vista a la vista

#### Scenario: Pestañas anunciadas
- **WHEN** un lector de pantalla llega a las pestañas del panel
- **THEN** anuncia que son tres pestañas, cuál está elegida y, en la de cerebros, cuántos cerebros hay

#### Scenario: Confirmación abierta al cambiar de vista
- **WHEN** hay una confirmación abierta en la vista de ajustes (entrenamiento nuevo o restablecer) y la persona pasa a otra vista
- **THEN** la confirmación se cancela, el ajuste vuelve a su valor anterior y nada queda esperando a escondidas

#### Scenario: Foco a la vista
- **WHEN** la persona recorre con Tab una vista más alta que el panel
- **THEN** el control con foco queda siempre a la vista, nunca debajo de la barra de pestañas

#### Scenario: Ancho mínimo
- **WHEN** el panel mide 360 píxeles de ancho, en español o en inglés
- **THEN** las tres pestañas entran en un renglón con sus nombres completos y el contador de cerebros

#### Scenario: Tooltips
- **WHEN** la persona posa el cursor sobre cada pestaña del panel
- **THEN** un tooltip en el idioma activo dice qué reúne esa vista y por qué importa

### Requirement: Cambios pendientes a la vista
Mientras haya ajustes esperando a la próxima generación, la pestaña de la
vista de ajustes SHALL mostrar una marca que lo indique, se esté en la vista
que se esté, y la marca MUST desaparecer cuando esa generación empieza. Solo
esperan los ajustes de evolución, la población y la mutación: los de la barra
de escenario rigen en el momento. La marca MUST NOT depender solo del color.

#### Scenario: Cambio hecho y vista cambiada
- **WHEN** la persona cambia la élite en la vista de ajustes y vuelve a la vista de entrenamiento durante la misma generación
- **THEN** la pestaña de ajustes muestra la marca de cambios pendientes

#### Scenario: Generación siguiente
- **WHEN** empieza la generación siguiente
- **THEN** la marca desaparece

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla anuncia la pestaña de ajustes con cambios pendientes
- **THEN** dice que hay cambios esperando a la próxima generación

### Requirement: Textos de la pestaña coherentes
Los textos de Entrenar SHALL usar una sola palabra para cada cosa: "ajustes"
para todo lo que se configura (la vista, sus grupos y el botón de
restablecer), "el fitness" para la medida y "la función de fitness" para la
regla que la calcula. Las misiones SHALL empezar con un verbo en imperativo.

#### Scenario: Una palabra para los ajustes
- **WHEN** la persona lee la vista de entrenamiento y la de ajustes
- **THEN** no encuentra la palabra "configuración" como nombre de un bloque ni de un botón: el bloque de población y mutación se llama por lo que contiene y el botón dice "Restablecer ajustes"

#### Scenario: Género de fitness
- **WHEN** la persona lee el ajuste de quién elige al padre, sus tooltips y la misión de la función de fitness
- **THEN** "fitness", solo, aparece siempre en masculino ("el fitness"), y "la función de fitness" cuando se habla de la regla

#### Scenario: Misiones en imperativo
- **WHEN** la persona lee las cuatro misiones
- **THEN** la de la función de fitness dice "Probá otra función de fitness" y todas entran en un renglón a 360 píxeles

#### Scenario: Indicador en inglés
- **WHEN** la aplicación está en inglés
- **THEN** el indicador de vehículos superados dice "Leader has passed", que no se puede leer como que al líder lo pasaron
