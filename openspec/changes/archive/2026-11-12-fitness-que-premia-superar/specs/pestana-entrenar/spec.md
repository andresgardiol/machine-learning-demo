# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
