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
redes con números al azar) y de dónde sale la generación siguiente: de los que
mejor manejaron, con selección automática, o del auto que la persona elija,
con selección manual. Los atajos de teclado MUST leerse en el control que
accionan y no en el texto de inicio.

#### Scenario: Guía activa
- **WHEN** la guía está activa
- **THEN** el panel muestra el texto de inicio

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el texto de inicio, los renglones de ayuda del tablero y las misiones no se muestran y el entrenamiento sigue igual

#### Scenario: Texto breve
- **WHEN** el panel mide 360 píxeles de ancho y la aplicación está en español o en inglés
- **THEN** el texto de inicio ocupa como mucho cinco renglones, con selección automática y con selección manual

#### Scenario: Atajos en los controles
- **WHEN** la persona busca cómo pausar, pasar de generación o acelerar con el teclado
- **THEN** lee la tecla en el botón de pausa, en el de siguiente generación y en la opción de velocidad máxima

#### Scenario: Guía con selección manual
- **WHEN** la persona elige "vos" en el ajuste de quién elige al padre
- **THEN** el texto de inicio pasa a decir que, cuando el líder haga algo prometedor, lo elija, y que la generación siguiente serán copias suyas con pequeños cambios

#### Scenario: Guía al volver a selección automática
- **WHEN** la persona vuelve a elegir la función de fitness
- **THEN** el texto de inicio vuelve a decir que los que mejor manejaron se copian con pequeños cambios

### Requirement: Indicadores del entrenamiento
El tablero SHALL mostrar, actualizados en tiempo real, cuatro indicadores: el
número de generación, cuántos autos siguen en carrera sobre el total, el
fitness del líder en ese momento y cuántos vehículos lleva superados el líder.
Debajo SHALL mostrar una línea de texto con
la última generación terminada: su número, su mejor fitness con su unidad y,
en una oración, el motivo por el que terminó. El número de generación MUST
verse también sobre el escenario.

#### Scenario: Autos que chocan
- **WHEN** chocan veinte autos de una población de 100
- **THEN** el indicador de autos en carrera muestra 80/100

#### Scenario: Fin de una generación
- **WHEN** termina la generación 12 porque todos los autos quedaron fuera de carrera, con un mejor fitness de 350 metros de ventaja
- **THEN** el indicador de generación muestra 13 y la línea de la última generación dice que el mejor de la generación 12 le sacó 350 m al tráfico y que terminó porque todos quedaron fuera de carrera

#### Scenario: Antes de la primera generación
- **WHEN** todavía no terminó ninguna generación
- **THEN** la línea de la última generación dice que todavía no terminó ninguna, sin mostrar un cero

#### Scenario: Motivo en texto corriente
- **WHEN** el tablero mide 360 píxeles de ancho y la generación terminó porque todos quedaron fuera de carrera
- **THEN** la línea de la última generación ocupa como mucho dos renglones, con el mismo tamaño de letra que el resto del texto

#### Scenario: Vehículos superados del líder
- **WHEN** el líder deja atrás a su cuarto vehículo
- **THEN** el indicador de vehículos superados muestra 4

#### Scenario: Líder que cambia
- **WHEN** el líder choca con 6 vehículos superados y pasa a ser líder un auto que superó 2
- **THEN** el indicador de vehículos superados muestra 2

#### Scenario: Cuatro indicadores en un renglón
- **WHEN** el tablero mide 360 píxeles de ancho o más, en español o en inglés
- **THEN** los cuatro indicadores se ven en un solo renglón, con su nombre y su valor completos

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
La pestaña SHALL mostrar siempre a la vista tres ajustes: el tamaño de la
población, la fuerza de la mutación y un interruptor para enfriar la
mutación, encendido por defecto. Sus cambios SHALL aplicarse desde la
generación siguiente, y la pestaña MUST indicar de forma visible que hay
cambios esperando a la próxima generación. Con el enfriamiento en uso, el
ajuste de la fuerza SHALL mostrar la fuerza con que se armará la generación
siguiente y MUST NOT poder editarse.

#### Scenario: Cambiar la mutación
- **WHEN** la persona, con el enfriamiento apagado, sube la fuerza de mutación durante una generación
- **THEN** aparece una indicación de que el cambio se aplica en la próxima generación y desaparece cuando esa generación empieza

#### Scenario: Cambiar la población
- **WHEN** la persona cambia la población a 200
- **THEN** la generación en curso sigue con sus autos y la siguiente empieza con 200

#### Scenario: La fuerza baja sola
- **WHEN** se abre la pestaña y corren diez generaciones sin tocar nada
- **THEN** el ajuste de la fuerza de mutación fue bajando en cada generación, de 29 % a 18 %, sin que la persona lo mueva

#### Scenario: Fuerza que no se edita
- **WHEN** la persona intenta mover la fuerza de mutación con el enfriamiento encendido
- **THEN** el valor no cambia y el tooltip explica que la fuerza baja sola y que apagando el enfriamiento se puede fijar a mano

#### Scenario: Apagar el enfriamiento
- **WHEN** la persona apaga el enfriamiento cuando la fuerza va por 18 %
- **THEN** el ajuste queda en 18 %, pasa a poder editarse y la fuerza deja de bajar

#### Scenario: Volver a encender el enfriamiento
- **WHEN** la persona vuelve a encender el enfriamiento
- **THEN** desde la generación siguiente la fuerza vuelve a ser la que le toca por el número de generación

#### Scenario: Con selección manual
- **WHEN** la persona elige "vos" en el ajuste de quién elige al padre
- **THEN** el interruptor del enfriamiento se ve deshabilitado, su tooltip explica que con un padre elegido a mano la fuerza es la del deslizador, y la fuerza de mutación se puede editar

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
campo de nombre y un botón para guardar en la biblioteca, con el nombre que la
persona escriba o con el sugerido, al campeón de la última generación
terminada o, con selección manual, al padre elegido. Mientras no haya qué
guardar, el control MUST estar deshabilitado y explicar por qué. El resultado
de guardar MUST leerse junto al botón.

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

#### Scenario: Guardar al padre elegido
- **WHEN** la selección es manual, la persona eligió un padre en la generación 5 y guarda
- **THEN** la biblioteca muestra un cerebro con la red de ese padre, y el rótulo sobre el campo de nombre dice que se guarda al padre elegido

#### Scenario: Selección manual sin padre
- **WHEN** la selección es manual, no hay padre elegido y la persona posa el cursor sobre guardar
- **THEN** el control está deshabilitado y su tooltip explica que primero hay que elegir un padre

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
llegar a la generación 5, lograr un auto que supere 5 vehículos, guardar un
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
- **WHEN** la persona elige una función de fitness distinta de la ventaja sobre el tráfico y termina una generación con ella
- **THEN** la misión queda marcada como cumplida

#### Scenario: Misiones de un renglón
- **WHEN** el panel mide 360 píxeles de ancho y la aplicación está en español o en inglés
- **THEN** el nombre de cada misión y su estado se leen en el mismo renglón

#### Scenario: Misión de superar vehículos
- **WHEN** el líder lleva superados 3 vehículos y hasta ahora ningún auto había superado más
- **THEN** la misión de superar vehículos muestra 3 de 5

#### Scenario: Seguir al tráfico no la cumple
- **WHEN** un auto recorre 600 metros detrás del primer vehículo del tráfico
- **THEN** la misión de superar vehículos sigue en 0 de 5

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

#### Scenario: Tooltip de la ventaja sobre el tráfico
- **WHEN** la persona posa el cursor sobre la función "ventaja"
- **THEN** el tooltip explica que premia los metros que el auto le saca al tráfico, que seguir a un vehículo no suma, y advierte que premia arriesgarse: un auto puede pasar a varios y chocar

#### Scenario: Tooltip de la distancia
- **WHEN** la persona posa el cursor sobre la función "distancia"
- **THEN** el tooltip advierte que un auto que va detrás de un vehículo sin chocar recorre mucha distancia, y que por eso la población puede aprender a seguir al tráfico en lugar de pasarlo

#### Scenario: Tooltip de la élite
- **WHEN** la persona posa el cursor sobre la élite
- **THEN** el tooltip explica que esos autos pasan sin cambios a la generación siguiente y que, con tráfico nuevo, vuelven a ser evaluados en una calle distinta

#### Scenario: Tooltip del enfriamiento
- **WHEN** la persona posa el cursor sobre el interruptor de enfriar la mutación
- **THEN** el tooltip explica que la fuerza de mutación empieza alta y baja en cada generación, y que así la población primero explora redes muy distintas y después afina la que ya funciona

#### Scenario: Tooltip de la irregularidad
- **WHEN** la persona posa el cursor sobre la irregularidad del tráfico
- **THEN** el tooltip explica que en 0 % los vehículos van en filas parejas, que es el caso más fácil de aprender, que subirla hace el problema más difícil y que, con tráfico nuevo, en los dos casos cambia en cada generación

### Requirement: Controles de marcha agrupados
El panel SHALL agrupar los controles de marcha en este orden: arriba, el
ajuste de quién elige al padre; pausar y pasar a la siguiente generación en un
mismo renglón; con selección manual, elegir al líder y deshacer en el renglón
siguiente, con la línea de estado del padre debajo; después, las velocidades
en un solo renglón; y debajo, con menor peso visual, reiniciar y población
nueva. La confirmación de reiniciar o de población nueva SHALL aparecer junto
a esos botones.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña con el panel en 360 píxeles de ancho
- **THEN** el ajuste de quién elige al padre está arriba de todo, pausar y siguiente generación comparten renglón, las cinco velocidades entran en un renglón y reiniciar y población nueva se ven más chicos, debajo

#### Scenario: Confirmación junto al botón
- **WHEN** la persona pide reiniciar con generaciones terminadas
- **THEN** la confirmación aparece debajo de los botones de reiniciar y población nueva, sin tapar otros controles

#### Scenario: Cancelar
- **WHEN** la persona cancela esa confirmación
- **THEN** la confirmación desaparece y los controles de marcha vuelven a verse como antes

#### Scenario: Con selección manual
- **WHEN** la selección es manual y el panel mide 360 píxeles de ancho
- **THEN** elegir al líder y deshacer comparten un renglón debajo de pausar y siguiente generación, a un renglón del ajuste que los hizo aparecer, y la línea de estado del padre se lee debajo de ellos

#### Scenario: Con selección automática
- **WHEN** la selección es automática
- **THEN** no se ven los botones de elegir al líder y deshacer ni la línea de estado del padre

### Requirement: Panel a la vista sin desplazarse
Con la ventana en 1440×900, la guía activa y las secciones plegables en su
estado por defecto, el panel de Entrenar SHALL verse completo sin desplazarse.
Con la ventana en 1366×768 SHALL verse sin desplazarse, como mínimo, los
controles de marcha, el interruptor de sensores del líder y la configuración
básica. Con selección manual, los controles de marcha con sus botones de
elegir y deshacer y la línea de estado SHALL verse sin desplazarse en los dos
tamaños.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900 y la guía activa
- **THEN** el panel no tiene barra de desplazamiento y se ven la guía, los controles de marcha con el ajuste de quién elige al padre, el interruptor de sensores, la configuración básica, guardar el campeón, las misiones y los títulos de la biblioteca y de la sección avanzada

#### Scenario: Pantalla de 1366×768
- **WHEN** se abre la pestaña con la ventana en 1366×768 y la guía activa
- **THEN** los controles de marcha, el interruptor de sensores del líder y la configuración básica se ven sin desplazar el panel

#### Scenario: Causa y efecto a la vista
- **WHEN** la persona mueve la fuerza de mutación con la ventana en 1440×900
- **THEN** el deslizador, la curva de fitness, la red del líder y los autos están a la vista al mismo tiempo

#### Scenario: Selección manual a la vista
- **WHEN** la selección es manual, con la ventana en 1366×768 y la guía activa
- **THEN** el ajuste de quién elige al padre, pausar, siguiente generación, elegir al líder, deshacer y la línea de estado del padre se ven sin desplazar el panel

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

### Requirement: Quién elige al padre
La pestaña SHALL ofrecer un ajuste con dos opciones para decidir quién elige
al padre de la generación siguiente: la función de fitness (por defecto) o la
persona. El ajuste SHALL encabezar los controles de marcha, antes que
cualquier otro control del panel, con un rótulo de mayor peso que el de un
ajuste común. El cambio SHALL regir desde la generación siguiente, MUST NOT
reiniciar el entrenamiento y, mientras espera, MUST indicarse junto al ajuste.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña por primera vez
- **THEN** está elegida la opción de la función de fitness y el entrenamiento avanza solo, como siempre

#### Scenario: Primero en el panel
- **WHEN** se abre la pestaña con la guía oculta
- **THEN** el ajuste de quién elige al padre es el primer control del panel, arriba de pausar y siguiente generación, y no está entre los ajustes de configuración

#### Scenario: Cambio esperando, junto al ajuste
- **WHEN** la persona pasa de "la fitness" a "vos" durante una generación
- **THEN** un aviso junto al ajuste dice que rige desde la próxima generación, la generación en curso sigue con sus autos, y el aviso desaparece cuando esa generación empieza

#### Scenario: El aviso de configuración no se mezcla
- **WHEN** el único cambio que espera es el de quién elige al padre
- **THEN** el aviso de cambios esperando de la configuración básica no se muestra

#### Scenario: Pasar a selección manual con progreso
- **WHEN** la persona elige "vos" en la generación 12 y no elige a ningún auto antes de que termine
- **THEN** el entrenamiento sigue en la generación 13 con su curva intacta, y esa generación sale del campeón de la 12

#### Scenario: Volver a selección automática
- **WHEN** la persona vuelve a elegir la función de fitness
- **THEN** los botones de elegir y deshacer y la línea de estado desaparecen en ese momento, y desde la generación siguiente los padres vuelven a salir de la fitness

#### Scenario: Restablecer
- **WHEN** la selección es manual y la persona presiona restablecer la configuración
- **THEN** el ajuste vuelve a la función de fitness desde la generación siguiente, sin reiniciar el entrenamiento

### Requirement: Elegir al líder
Con selección manual, la pestaña SHALL ofrecer un botón, con la tecla E como
atajo, que toma al líder de ese momento como padre de la generación siguiente.
SHALL funcionar en cualquier momento de la generación, también en pausa, y
MUST poder usarse desde que la persona elige la selección manual, sin esperar
a la generación siguiente.

#### Scenario: Elegir con el botón
- **WHEN** la persona presiona elegir al líder en la generación 4, cuando el líder lleva 310 metros
- **THEN** la línea de estado pasa a decir que el padre es el líder de la generación 4, con 310 m, y el entrenamiento sigue sin interrumpirse

#### Scenario: Elegir con el teclado
- **WHEN** la persona presiona la tecla E con selección manual
- **THEN** ocurre lo mismo que al presionar el botón

#### Scenario: Elegir en pausa
- **WHEN** el entrenamiento está en pausa y la persona elige al líder
- **THEN** el padre queda elegido y el entrenamiento sigue en pausa

#### Scenario: La generación siguiente sale del padre
- **WHEN** termina la generación después de elegir al líder
- **THEN** en la generación siguiente uno de los autos lleva la marca de la élite: es la copia sin cambios del padre elegido

#### Scenario: Tecla E con selección automática
- **WHEN** la persona presiona la tecla E con selección automática
- **THEN** no pasa nada

### Requirement: Deshacer la elección
Con selección manual, la pestaña SHALL ofrecer un botón, con la tecla Z como
atajo, que deshace la última elección de padre. Cuando no hay ninguna elección
que deshacer, el botón MUST estar deshabilitado y explicar por qué.

#### Scenario: Deshacer una elección
- **WHEN** la persona eligió padres en las generaciones 3 y 5 y presiona deshacer
- **THEN** la línea de estado vuelve a decir que el padre es el líder de la generación 3

#### Scenario: Deshacer la única elección
- **WHEN** hay una sola elección y la persona presiona deshacer
- **THEN** la línea de estado dice que no hay padre elegido y que la próxima generación será al azar

#### Scenario: Nada que deshacer
- **WHEN** no hay ninguna elección y la persona posa el cursor sobre deshacer
- **THEN** el botón está deshabilitado y su tooltip explica que todavía no se eligió a nadie

### Requirement: Estado del padre elegido
Con selección manual, la pestaña SHALL mostrar junto a los botones una línea
de texto que diga, en todo momento, de dónde va a salir la generación
siguiente: del padre elegido, con la generación en que se lo eligió y el
fitness que llevaba, o de una población al azar nueva si no hay padre.

#### Scenario: Sin padre elegido
- **WHEN** la selección es manual y no hay padre elegido
- **THEN** la línea dice que no hay padre y que, si no se elige uno, la próxima generación empieza con redes al azar

#### Scenario: Con padre elegido
- **WHEN** el padre se eligió en la generación 4 con 310 metros
- **THEN** la línea dice que la próxima generación sale del líder de la generación 4, que llevaba 310 m

#### Scenario: Padre que viene del campeón
- **WHEN** la persona pasó de selección automática a manual y el padre es el campeón de la generación 12
- **THEN** la línea dice que el padre es el campeón de la generación 12, con su fitness

#### Scenario: Cambio a manual que todavía no rige
- **WHEN** la persona acaba de pasar de selección automática a manual, la generación en curso no terminó y no eligió a nadie
- **THEN** la línea dice que, si no elige a nadie, el padre será el mejor de esta generación

#### Scenario: Padre que viene de un cerebro
- **WHEN** la persona sigue entrenando el cerebro guardado "Prudente" con selección manual
- **THEN** la línea dice que el padre es el cerebro "Prudente"

### Requirement: Ajustes que no aplican con selección manual
Con selección manual, los ajustes de selección, élite y cruce de la sección
avanzada SHALL verse deshabilitados y explicar que no se usan porque hay un
solo padre. Sus valores MUST conservarse y volver a regir con selección
automática.

#### Scenario: Ajustes deshabilitados
- **WHEN** la selección es manual y la persona despliega el grupo de evolución
- **THEN** selección, élite y cruce están deshabilitados y su tooltip explica que con un solo padre no se usan

#### Scenario: Valores conservados
- **WHEN** la persona tenía la selección en 20 %, pasa a manual y vuelve a automática
- **THEN** la selección sigue en 20 % y vuelve a estar habilitada

### Requirement: Selección manual explicada
El ajuste de quién elige, cada una de sus opciones, el botón de elegir al
líder y el de deshacer SHALL tener un tooltip que diga qué hace y por qué
importa, definiendo qué es un padre. Todos sus textos, la línea de estado y
los rótulos de guardar SHALL estar en español y en inglés.

#### Scenario: Tooltip de elegir al líder
- **WHEN** la persona posa el cursor sobre elegir al líder
- **THEN** un tooltip en el idioma activo explica que ese auto pasa a ser el padre, que todos los autos de la generación siguiente son copias suyas con pequeñas mutaciones, y que así es la persona, y no la fitness, quien decide qué se premia

#### Scenario: Tooltip de la opción manual
- **WHEN** la persona posa el cursor sobre la opción "vos"
- **THEN** el tooltip explica que la función de fitness es una forma de automatizar esa decisión y que elegir a mano permite compararlas

#### Scenario: Selección manual en inglés
- **WHEN** la aplicación está en inglés con selección manual
- **THEN** el ajuste, los botones, la línea de estado y el rótulo de guardar se muestran en inglés

### Requirement: Funciones de fitness a elegir
El ajuste de la función de fitness SHALL ofrecer las cuatro funciones en este
orden: ventaja, distancia, tiempo sin chocar y velocidad media, con la ventaja
elegida al abrir la pestaña. Las cuatro opciones MUST verse completas con el
panel en su ancho por defecto, en español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña y se despliega la sección avanzada
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

### Requirement: Valores de ventaja con su unidad
Todo valor de fitness medido con la ventaja sobre el tráfico SHALL leerse
como ventaja, distinto de los metros recorridos de la función distancia. En
el tablero, el indicador del líder SHALL llamarse según lo que mide la
función vigente y mostrar el valor con su unidad corta. En la curva, la línea
de la última generación, la línea del padre elegido y los datos de un cerebro
guardado, el valor SHALL leerse como metros de ventaja.

#### Scenario: Indicador del líder
- **WHEN** el líder le lleva 120 metros de ventaja al tráfico
- **THEN** el indicador se llama «Ventaja del líder» y dice 120 m

#### Scenario: Indicador con otra función
- **WHEN** rige la función distancia
- **THEN** el indicador se llama «Distancia del líder»

#### Scenario: Curva
- **WHEN** termina una generación evaluada con la ventaja sobre el tráfico
- **THEN** el eje de la curva dice que el fitness se mide en metros de ventaja

#### Scenario: Cerebro guardado
- **WHEN** la persona guarda un cerebro entrenado con la ventaja sobre el tráfico y abre la biblioteca
- **THEN** el fitness de ese cerebro se lee como metros de ventaja

#### Scenario: Cerebro anterior
- **WHEN** la biblioteca tiene un cerebro guardado antes de este cambio, entrenado con la función distancia
- **THEN** su fitness se sigue leyendo en metros, sin la palabra ventaja

### Requirement: Pistas del entrenamiento
La sección avanzada SHALL ofrecer, en el grupo del escenario, las cuatro
pistas del catálogo para marcar una o varias, con la calle recta sola por
defecto. MUST quedar siempre al menos una marcada. Los cambios SHALL regir
desde la generación siguiente, con la misma indicación que los demás ajustes.
El ajuste SHALL tener un tooltip que diga qué hace y por qué importa, en
español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña y se despliega la sección avanzada
- **THEN** solo la calle recta está marcada

#### Scenario: Marcar un circuito
- **WHEN** la persona marca el óvalo además de la calle recta durante una generación
- **THEN** aparece la indicación de cambios pendientes y, desde la generación siguiente, las generaciones alternan entre la calle recta y el óvalo

#### Scenario: Última pista marcada
- **WHEN** la persona intenta desmarcar la única pista marcada
- **THEN** sigue marcada y su tooltip explica que hace falta al menos una

#### Scenario: Restablecer
- **WHEN** la persona marcó tres pistas y presiona restablecer
- **THEN** desde la generación siguiente vuelve a entrenarse solo en la calle recta, sin reiniciar el entrenamiento

#### Scenario: Tooltip
- **WHEN** la persona posa el cursor sobre las pistas del entrenamiento
- **THEN** el tooltip explica que con varias pistas cada generación corre en una distinta, y que practicar en situaciones distintas ayuda a que lo aprendido sirva en pistas nuevas

### Requirement: Generación en un circuito
Mientras una generación corre en un circuito, la pestaña SHALL mostrar el
nombre de la pista junto al número de generación sobre el escenario, y el
cuarto indicador del tablero SHALL pasar a mostrar las vueltas del líder, con
un decimal. Si ninguna pista marcada es la calle recta, los ajustes de
carriles, densidad, irregularidad y modo de tráfico SHALL verse deshabilitados
y explicar que en un circuito no hay tráfico.

#### Scenario: Pista a la vista
- **WHEN** la generación 12 corre en el óvalo
- **THEN** sobre el escenario se lee el número de generación y que la pista es el óvalo

#### Scenario: Indicador de vueltas
- **WHEN** el líder lleva una vuelta y cuarto del óvalo
- **THEN** el cuarto indicador se llama "Vueltas del líder" y muestra 1,2: un decimal, redondeado hacia abajo

#### Scenario: Vuelta a la calle
- **WHEN** la generación siguiente corre en la calle recta
- **THEN** el cuarto indicador vuelve a ser el de vehículos superados por el líder

#### Scenario: Solo circuitos
- **WHEN** las pistas marcadas son el óvalo y el riñón
- **THEN** carriles, densidad, irregularidad y modo de tráfico están deshabilitados, con su explicación, y conservan sus valores

#### Scenario: Curva con varias pistas
- **WHEN** el entrenamiento alterna la calle recta y el óvalo
- **THEN** la curva de fitness sigue siendo una sola, en metros de ventaja, y su renglón de ayuda dice que cada generación corre en una pista distinta

### Requirement: Ver como la máquina
La pestaña SHALL ofrecer, junto al interruptor de los sensores del líder, un
modo apagado por defecto que oculta la pista, el tráfico, el paisaje y los
demás autos, y deja a la vista solo al líder con sus rayos: lo único que
recibe la red que se ve en el tablero. El modo MUST NOT cambiar el
entrenamiento. El interruptor SHALL tener un tooltip que diga qué hace y por
qué importa, en español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** el modo está apagado y se ven la pista, el tráfico, el paisaje y toda la población

#### Scenario: Activar el modo
- **WHEN** la persona activa el modo ver como la máquina
- **THEN** en el escenario quedan solo el líder y sus rayos, aunque los sensores del líder estuvieran ocultos, y el tablero sigue mostrando los indicadores, la curva y la red

#### Scenario: Cambio de líder
- **WHEN** el líder choca con el modo activo y pasa a ser líder otro auto
- **THEN** el escenario pasa a mostrar a ese auto y sus rayos, sin mostrar la pista

#### Scenario: Entre generaciones
- **WHEN** termina una generación con el modo activo
- **THEN** la generación siguiente se ve del mismo modo, con el número de generación a la vista

#### Scenario: Desactivar el modo
- **WHEN** la persona desactiva el modo
- **THEN** la pista, el tráfico, el paisaje y la población vuelven a verse y el entrenamiento continúa

#### Scenario: El entrenamiento sigue igual
- **WHEN** se repite un entrenamiento con la misma semilla, una vez con el modo activo y otra con el modo apagado
- **THEN** el mejor fitness de cada generación es el mismo

#### Scenario: Tooltip
- **WHEN** la persona posa el cursor sobre el interruptor
- **THEN** un tooltip en el idioma activo explica que deja solo lo que percibe el líder, y que con esas pocas lecturas decide la red del tablero

#### Scenario: Panel sin desplazarse
- **WHEN** se abre la pestaña en 1440×900 con el interruptor nuevo
- **THEN** el panel se ve completo sin desplazarse
