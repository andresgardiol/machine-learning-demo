# pestana-entrenar Specification

## Purpose

Es la pestaña 3, "Entrenar": una población de autos manejados por redes
neuronales aprende a esquivar el tráfico generación tras generación, a la vista
de la persona. Permite ver el aprendizaje, medirlo, acelerarlo, cambiar cómo se
aprende y guardar lo aprendido.

## Requirements

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
- **THEN** la segunda empieza con los vehículos del tráfico en otras posiciones y el ajuste de tráfico de la sección avanzada muestra elegido "nuevo en cada generación"

#### Scenario: Volver al estado por defecto
- **WHEN** la persona eligió "el mismo" tráfico y presiona restablecer la configuración
- **THEN** el ajuste vuelve a "nuevo en cada generación" desde la generación siguiente, sin reiniciar el entrenamiento

### Requirement: Guía de inicio
Con la guía activa, el panel SHALL mostrar un texto de inicio, de hasta 240
caracteres en cada idioma, que diga qué se está viendo (autos manejados por
redes con números al azar) y qué significa una generación. Los atajos de
teclado MUST leerse en el control que accionan y no en el texto de inicio.

#### Scenario: Guía activa
- **WHEN** la guía está activa
- **THEN** el panel muestra el texto de inicio

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el texto de inicio, los renglones de ayuda del tablero y las misiones no se muestran y el entrenamiento sigue igual

#### Scenario: Texto breve
- **WHEN** el panel mide 360 píxeles de ancho y la aplicación está en español o en inglés
- **THEN** el texto de inicio ocupa como mucho cinco renglones

#### Scenario: Atajos en los controles
- **WHEN** la persona busca cómo pausar, pasar de generación o acelerar con el teclado
- **THEN** lee la tecla en el botón de pausa, en el de siguiente generación y en la opción de velocidad máxima

### Requirement: Indicadores del entrenamiento
El tablero SHALL mostrar, actualizados en tiempo real, tres indicadores: el
número de generación, cuántos autos siguen en carrera sobre el total y el
fitness del líder en ese momento. Debajo SHALL mostrar una línea de texto con
la última generación terminada: su número, su mejor fitness con su unidad y,
en una oración, el motivo por el que terminó. El número de generación MUST
verse también sobre el escenario.

#### Scenario: Autos que chocan
- **WHEN** chocan veinte autos de una población de 100
- **THEN** el indicador de autos en carrera muestra 80 de 100

#### Scenario: Fin de una generación
- **WHEN** termina la generación 12 porque todos los autos quedaron fuera de carrera, con un mejor fitness de 350 metros
- **THEN** el indicador de generación muestra 13 y la línea de la última generación dice que la generación 12 logró 350 m y que terminó porque todos quedaron fuera de carrera

#### Scenario: Antes de la primera generación
- **WHEN** todavía no terminó ninguna generación
- **THEN** la línea de la última generación dice que todavía no terminó ninguna, sin mostrar un cero

#### Scenario: Motivo en texto corriente
- **WHEN** el tablero mide 360 píxeles de ancho y la generación terminó porque todos quedaron fuera de carrera
- **THEN** la línea de la última generación ocupa como mucho dos renglones, con el mismo tamaño de letra que el resto del texto

### Requirement: Pausa
La pestaña SHALL permitir pausar y reanudar el entrenamiento con un botón y con
la barra espaciadora, y MUST indicar de forma visible cuando está en pausa.

#### Scenario: Pausar y reanudar
- **WHEN** la persona presiona la barra espaciadora dos veces
- **THEN** el entrenamiento se detiene con una indicación de pausa y luego continúa desde el mismo estado

### Requirement: Velocidad del entrenamiento
La pestaña SHALL ofrecer las velocidades 1, 2, 4 y 8 y una velocidad máxima,
con la velocidad normal elegida por defecto. En velocidad máxima MUST mostrar
el factor real que se está logrando. La tecla T SHALL alternar entre la
velocidad normal y la máxima.

#### Scenario: Elegir una velocidad
- **WHEN** la persona elige la velocidad 4
- **THEN** los autos avanzan cuatro veces más rápido y la velocidad 4 queda marcada como elegida

#### Scenario: Velocidad máxima
- **WHEN** la persona elige la velocidad máxima
- **THEN** las generaciones se suceden tan rápido como permite el equipo y se muestra cuántas veces la velocidad real se está logrando

#### Scenario: Volver a velocidad normal
- **WHEN** la persona presiona T estando en velocidad máxima
- **THEN** el entrenamiento vuelve a velocidad normal sin perder su estado

### Requirement: Pasar a la siguiente generación
La pestaña SHALL permitir terminar la generación en curso con un botón y con la
tecla N.

#### Scenario: Pasar de generación
- **WHEN** la persona presiona N con autos todavía en carrera
- **THEN** la generación termina, queda registrada con el motivo "a pedido" y empieza la siguiente

### Requirement: Reiniciar el entrenamiento
La pestaña SHALL permitir reiniciar el entrenamiento con la misma semilla, lo
que MUST repetir la misma evolución si no se cambia la configuración. Si ya
terminó al menos una generación, el reinicio MUST pedir una confirmación que
diga cuántas generaciones se dejan y que el campeón queda autoguardado.

#### Scenario: Reinicio sin progreso
- **WHEN** la persona reinicia antes de que termine la primera generación
- **THEN** el entrenamiento vuelve a la generación 1 de inmediato, sin pedir confirmación

#### Scenario: Reinicio con progreso
- **WHEN** la persona reinicia un entrenamiento de 30 generaciones y confirma
- **THEN** el entrenamiento vuelve a la generación 1, la curva se vacía y la biblioteca conserva el campeón de las 30 generaciones como entrenamiento anterior

#### Scenario: Cancelar el reinicio
- **WHEN** la persona pide reiniciar y cancela la confirmación
- **THEN** el entrenamiento continúa sin cambios

#### Scenario: Evolución repetida
- **WHEN** la persona reinicia sin cambiar la configuración y deja pasar las mismas generaciones
- **THEN** el mejor fitness de cada generación es el mismo que en la corrida anterior

### Requirement: Población nueva
La pestaña SHALL ofrecer empezar un entrenamiento con otra población inicial al
azar, distinta de la anterior, con la misma regla de confirmación que el
reinicio.

#### Scenario: Otra población
- **WHEN** la persona pide una población nueva
- **THEN** el entrenamiento vuelve a la generación 1 con redes iniciales distintas de las de la corrida anterior

### Requirement: Curva de fitness
El tablero SHALL mostrar, en una tarjeta a la vista al abrir la pestaña, un
gráfico con el mejor fitness y el promedio de cada generación terminada, con
leyenda, ejes rotulados con la generación y la unidad de la función de
fitness, y las dos series distinguibles sin depender solo del color. El
gráfico SHALL ocupar su tarjeta sin agrandar ni achicar su texto. Con la guía
activa, el renglón de ayuda SHALL decir cómo leer la curva según el modo de
tráfico de la generación en curso.

#### Scenario: Curva vacía
- **WHEN** todavía no terminó ninguna generación
- **THEN** el gráfico muestra un texto que explica que la curva aparece al terminar la primera generación

#### Scenario: Curva que crece
- **WHEN** termina la quinta generación
- **THEN** el gráfico muestra cinco puntos en cada serie y la escala se ajusta para que entren todos

#### Scenario: Valor de una generación
- **WHEN** la persona posa el cursor sobre un punto de la curva
- **THEN** se muestran el número de generación, el mejor fitness y el promedio de esa generación

#### Scenario: Cambio de función de fitness
- **WHEN** la persona cambia la función de fitness y termina la generación siguiente
- **THEN** la curva empieza de nuevo con la unidad nueva y un texto explica que los valores anteriores no eran comparables

#### Scenario: Curva a la vista al abrir
- **WHEN** se abre la pestaña con la ventana en 1440×900
- **THEN** la tarjeta de la curva se ve completa sin desplazar nada

#### Scenario: Curva que ocupa su tarjeta
- **WHEN** la persona agranda el tablero arrastrando un borde
- **THEN** el gráfico se agranda con la tarjeta y los números de los ejes conservan su tamaño de letra

#### Scenario: Curva con tráfico nuevo
- **WHEN** el entrenamiento usa tráfico nuevo en cada generación y la guía está activa
- **THEN** el mejor fitness puede bajar de una generación a la siguiente, y el renglón de ayuda dice que cada generación enfrenta un tráfico distinto y que hay que mirar hacia dónde va la línea

#### Scenario: Curva con el mismo tráfico
- **WHEN** la persona elige "el mismo" tráfico y empieza la generación siguiente
- **THEN** el renglón de ayuda pasa a decir que con el mismo tráfico la línea sube más pareja pero la población puede estar memorizándolo

### Requirement: Red del líder
El tablero SHALL mostrar, en una tarjeta plegable y visible por defecto, el
diagrama de la red del auto líder con su actividad en vivo, con su leyenda.

#### Scenario: Diagrama del líder
- **WHEN** el entrenamiento está en marcha
- **THEN** el diagrama muestra la red del auto que la cámara sigue y sus nodos cambian con lo que ese auto percibe y acciona

#### Scenario: Plegar el diagrama
- **WHEN** la persona pliega la tarjeta
- **THEN** el diagrama deja de verse, la curva ocupa su lugar y el entrenamiento sigue igual

#### Scenario: Red y curva a la vez
- **WHEN** se abre la pestaña con la ventana en 1440×900
- **THEN** la curva de fitness y la red del líder se ven completas a la vez, junto a los autos

### Requirement: Sensores del líder
La pestaña SHALL ofrecer un interruptor, encendido por defecto, que muestra u
oculta los rayos de los sensores del auto líder.

#### Scenario: Ocultar los sensores
- **WHEN** la persona apaga el interruptor
- **THEN** los rayos del líder dejan de dibujarse y el entrenamiento no cambia

### Requirement: Configuración básica
La pestaña SHALL mostrar siempre a la vista dos ajustes: el tamaño de la
población y la fuerza de la mutación. Sus cambios SHALL aplicarse desde la
generación siguiente, y la pestaña MUST indicar de forma visible que hay
cambios esperando a la próxima generación.

#### Scenario: Cambiar la mutación
- **WHEN** la persona sube la fuerza de mutación durante una generación
- **THEN** aparece una indicación de que el cambio se aplica en la próxima generación y desaparece cuando esa generación empieza

#### Scenario: Cambiar la población
- **WHEN** la persona cambia la población a 200
- **THEN** la generación en curso sigue con sus autos y la siguiente empieza con 200

### Requirement: Configuración avanzada
La pestaña SHALL ofrecer, en una sección colapsada por defecto, los ajustes de
evolución (élite, selección, probabilidad de mutación, cruce, función de
fitness, duración máxima, eliminar a los lentos y modo de tráfico) y de escenario (carriles, densidad,
irregularidad y velocidad máxima del auto). Todos SHALL aplicarse desde la
generación siguiente, con la misma indicación que la configuración básica.

#### Scenario: Sección colapsada
- **WHEN** se abre la pestaña
- **THEN** los ajustes avanzados no están a la vista

#### Scenario: Cambiar la función de fitness
- **WHEN** la persona elige "tiempo sin chocar"
- **THEN** la generación siguiente se evalúa con esa función y los indicadores pasan a mostrar segundos

#### Scenario: Cambiar los carriles
- **WHEN** la persona elige cuatro carriles durante una generación
- **THEN** la generación en curso termina en tres carriles y la siguiente corre en cuatro

#### Scenario: Apagar la regla de los lentos
- **WHEN** la persona apaga "eliminar a los lentos" durante una generación
- **THEN** la generación en curso sigue con la regla y en la siguiente ningún auto sale de carrera por lento

#### Scenario: Velocidad máxima compartida
- **WHEN** la persona cambia la velocidad máxima del auto en esta pestaña y luego abre El problema
- **THEN** el auto de El problema tiene esa misma velocidad máxima

### Requirement: Red y sensores
La pestaña SHALL ofrecer, dentro de la sección avanzada, la cantidad de capas
ocultas (0 a 3), las neuronas de cada capa (1 a 16), la activación de las capas
ocultas y los sensores (cantidad, alcance y apertura). Cambiar cualquiera de
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

### Requirement: Restablecer la configuración
La pestaña SHALL ofrecer un botón que devuelve todos los ajustes a sus valores
por defecto. Si eso cambia la red o los sensores, MUST aplicarse la misma regla
de entrenamiento nuevo y confirmación.

#### Scenario: Restablecer solo ajustes de evolución
- **WHEN** la persona cambió población, mutación y función de fitness, y presiona restablecer
- **THEN** los tres vuelven a sus valores por defecto desde la generación siguiente, sin reiniciar el entrenamiento

#### Scenario: Restablecer con la red cambiada
- **WHEN** la persona cambió las capas ocultas, tiene generaciones terminadas y presiona restablecer
- **THEN** se pide la confirmación de entrenamiento nuevo antes de aplicar nada

### Requirement: Guardar el campeón
El panel SHALL ofrecer siempre a la vista, fuera de la biblioteca plegada, un
campo de nombre y un botón para guardar en la biblioteca al campeón de la
última generación terminada, con el nombre que la persona escriba o con el
sugerido. Mientras no haya campeón, el control MUST estar deshabilitado y
explicar por qué. El resultado de guardar MUST leerse junto al botón.

#### Scenario: Sin campeón todavía
- **WHEN** no terminó ninguna generación y la persona posa el cursor sobre guardar
- **THEN** el control está deshabilitado y su tooltip explica que hace falta terminar una generación

#### Scenario: Guardar
- **WHEN** la persona escribe "Prudente" y guarda tras la generación 15
- **THEN** la biblioteca muestra "Prudente" con 15 generaciones y el entrenamiento sigue sin interrumpirse

#### Scenario: Guardar con la biblioteca plegada
- **WHEN** la persona guarda al campeón sin haber desplegado la biblioteca
- **THEN** un mensaje junto al botón dice con qué nombre se guardó y el contador de la biblioteca aumenta en uno

#### Scenario: Guardar tras continuar un cerebro
- **WHEN** el entrenamiento continúa desde el cerebro guardado "Prudente" y la persona va a guardar
- **THEN** se ofrecen dos acciones: actualizar "Prudente" o guardar como nuevo

### Requirement: Biblioteca de cerebros en la pestaña
El panel SHALL mostrar la biblioteca de cerebros en una sección plegable,
plegada al abrir, con las acciones de cada cerebro y la de importar. El título
de la sección SHALL mostrar cuántos cerebros hay.

#### Scenario: Biblioteca al abrir
- **WHEN** una persona abre la pestaña por primera vez y despliega la biblioteca
- **THEN** ve un texto que explica que todavía no hay cerebros guardados y cómo guardar el campeón

#### Scenario: Cerebro guardado
- **WHEN** la persona guarda un cerebro
- **THEN** aparece primero en la lista sin recargar la página

#### Scenario: Contador
- **WHEN** la biblioteca tiene dos cerebros guardados y un autoguardado
- **THEN** el título de la sección muestra 3 aunque la sección esté plegada

### Requirement: Seguir entrenando un cerebro
Cada cerebro de la biblioteca SHALL poder cargarse para seguir entrenándolo. Al
cargarlo, la pestaña MUST adoptar sus sensores y la forma y activación de su
red, empezar un entrenamiento desde él y aplicar la regla de confirmación si
hay generaciones terminadas.

#### Scenario: Cargar un cerebro guardado
- **WHEN** la persona elige seguir entrenando el cerebro guardado "Prudente"
- **THEN** el entrenamiento empieza desde ese cerebro, la generación en curso es la siguiente a las que ya tenía y los ajustes de red y sensores muestran los del cerebro

#### Scenario: Cargar con progreso sin guardar
- **WHEN** la persona elige seguir entrenando un cerebro con 25 generaciones terminadas en el entrenamiento actual
- **THEN** se pide la confirmación de entrenamiento nuevo antes de cargarlo

#### Scenario: El cerebro cargado no cambia
- **WHEN** la persona entrena varias generaciones a partir de un cerebro y no guarda
- **THEN** el cerebro de la biblioteca conserva su red y sus datos originales

### Requirement: El entrenamiento se conserva al cambiar de pestaña
Al salir de la pestaña y volver, el entrenamiento SHALL continuar donde estaba,
con su generación, su historial, su curva y su configuración.

#### Scenario: Ir y volver
- **WHEN** la persona entrena hasta la generación 8, abre El problema y vuelve a Entrenar
- **THEN** el entrenamiento sigue en la generación 8 con la misma curva y continúa avanzando

### Requirement: Misiones
Con la guía activa, el panel SHALL mostrar cuatro misiones con su progreso:
llegar a la generación 5, lograr un auto que recorra 300 metros, guardar un
cerebro y terminar una generación con otra función de fitness. Las misiones
MUST NOT bloquear ninguna función y una misión cumplida SHALL seguir marcada
hasta cerrar la aplicación. Cada misión SHALL leerse en un solo renglón con el
panel en su ancho por defecto.

#### Scenario: Progreso de una misión
- **WHEN** el entrenamiento está en la generación 3
- **THEN** la primera misión muestra 3 de 5

#### Scenario: Misión cumplida
- **WHEN** la persona guarda su primer cerebro
- **THEN** la misión de guardar un cerebro queda marcada como cumplida y sigue marcada tras reiniciar el entrenamiento

#### Scenario: Misión de la función de fitness
- **WHEN** la persona elige una función de fitness distinta de la distancia y termina una generación con ella
- **THEN** la misión queda marcada como cumplida

#### Scenario: Misiones de un renglón
- **WHEN** el panel mide 360 píxeles de ancho y la aplicación está en español o en inglés
- **THEN** el nombre de cada misión y su estado se leen en el mismo renglón

### Requirement: Controles de la pestaña explicados
Cada control de la pestaña SHALL tener un tooltip que diga qué hace y por qué
importa, usando el término técnico real y definiéndolo. Todos los textos,
indicadores, motivos de fin de generación, confirmaciones y misiones SHALL
estar en español y en inglés.

#### Scenario: Tooltip de la mutación
- **WHEN** la persona posa el cursor sobre la fuerza de mutación
- **THEN** un tooltip en el idioma activo explica que regula cuánto cambian los hijos respecto de sus padres y por qué un valor alto explora más pero conserva menos

#### Scenario: Tooltip de una función de fitness
- **WHEN** la persona posa el cursor sobre "tiempo sin chocar"
- **THEN** el tooltip explica qué premia y advierte qué comportamiento no deseado puede producir

#### Scenario: Tooltip de eliminar a los lentos
- **WHEN** la persona posa el cursor sobre "eliminar a los lentos"
- **THEN** el tooltip explica que saca de carrera a los autos que no van más rápido que el tráfico y que, sin la regla, la población aprende a quedarse detrás de un vehículo en lugar de esquivarlo

#### Scenario: Tooltip del modo de tráfico
- **WHEN** la persona posa el cursor sobre el modo de tráfico
- **THEN** el tooltip explica que practicar siempre con el mismo tráfico puede llevar a memorizarlo en lugar de aprender a manejar

#### Scenario: Pestaña en inglés
- **WHEN** la aplicación está en inglés
- **THEN** la guía, los indicadores, la curva, el diagrama, las confirmaciones, las misiones y los controles de la pestaña se muestran en inglés

### Requirement: Controles de marcha agrupados
El panel SHALL agrupar los controles de marcha en este orden: pausar y pasar a
la siguiente generación en un mismo renglón; debajo, las velocidades en un
solo renglón; y debajo, con menor peso visual, reiniciar y población nueva. La
confirmación de reiniciar o de población nueva SHALL aparecer junto a esos
botones.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña con el panel en 360 píxeles de ancho
- **THEN** pausar y siguiente generación comparten renglón, las cinco velocidades entran en un renglón y reiniciar y población nueva se ven más chicos, debajo

#### Scenario: Confirmación junto al botón
- **WHEN** la persona pide reiniciar con generaciones terminadas
- **THEN** la confirmación aparece debajo de los botones de reiniciar y población nueva, sin tapar otros controles

#### Scenario: Cancelar
- **WHEN** la persona cancela esa confirmación
- **THEN** la confirmación desaparece y los controles de marcha vuelven a verse como antes

### Requirement: Panel a la vista sin desplazarse
Con la ventana en 1440×900, la guía activa y las secciones plegables en su
estado por defecto, el panel de Entrenar SHALL verse completo sin desplazarse.
Con la ventana en 1366×768 SHALL verse sin desplazarse, como mínimo, los
controles de marcha, el interruptor de sensores del líder y la configuración
básica.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900 y la guía activa
- **THEN** el panel no tiene barra de desplazamiento y se ven la guía, los controles de marcha, el interruptor de sensores, la configuración básica, guardar el campeón, las misiones y los títulos de la biblioteca y de la sección avanzada

#### Scenario: Pantalla de 1366×768
- **WHEN** se abre la pestaña con la ventana en 1366×768 y la guía activa
- **THEN** los controles de marcha, el interruptor de sensores del líder y la configuración básica se ven sin desplazar el panel

#### Scenario: Causa y efecto a la vista
- **WHEN** la persona mueve la fuerza de mutación con la ventana en 1440×900
- **THEN** el deslizador, la curva de fitness, la red del líder y los autos están a la vista al mismo tiempo

### Requirement: Avanzado por grupos
Dentro de la sección avanzada, los ajustes SHALL estar organizados en cuatro
grupos plegables, plegados al abrir la sección: evolución, escenario, red y
sensores. Cada grupo SHALL conservar si quedó abierto al salir de la pestaña y
volver, hasta cerrar la aplicación. El botón de restablecer y el aviso de
cambios esperando SHALL verse con la sección abierta aunque todos los grupos
estén plegados. Cada grupo SHALL tener un tooltip, en español y en inglés.

#### Scenario: Abrir la sección avanzada
- **WHEN** la persona despliega la sección avanzada por primera vez
- **THEN** ve los títulos de los cuatro grupos, todos plegados, y el botón de restablecer, sin ningún deslizador a la vista

#### Scenario: Abrir un grupo
- **WHEN** la persona despliega el grupo de evolución
- **THEN** ve la élite, la selección, la probabilidad de mutación, el cruce, la función de fitness, la duración máxima, eliminar a los lentos y el modo de tráfico

#### Scenario: Grupo recordado
- **WHEN** la persona deja abierto el grupo de escenario, abre otra pestaña y vuelve
- **THEN** la sección avanzada y el grupo de escenario siguen abiertos

#### Scenario: Confirmación de la red junto a su grupo
- **WHEN** la persona cambia las capas ocultas con generaciones terminadas
- **THEN** la confirmación de entrenamiento nuevo aparece dentro del grupo de red, junto al ajuste que la pidió

#### Scenario: Tooltip de un grupo
- **WHEN** la persona posa el cursor sobre el título del grupo de evolución
- **THEN** un tooltip en el idioma activo dice qué ajustes reúne y por qué importan
