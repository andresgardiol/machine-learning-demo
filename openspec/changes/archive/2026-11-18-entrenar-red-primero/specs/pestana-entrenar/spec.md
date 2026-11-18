## MODIFIED Requirements

### Requirement: Red del líder
El tablero SHALL mostrar, en una tarjeta plegable y visible por defecto, el
diagrama de la red del auto líder con su actividad en vivo, con su leyenda.
La tarjeta de la red SHALL ser la primera tarjeta del tablero, debajo de los
indicadores y del renglón de la última generación, y arriba de la curva de
fitness.

#### Scenario: Diagrama del líder
- **WHEN** el entrenamiento está en marcha
- **THEN** el diagrama muestra la red del auto que la cámara sigue y sus nodos cambian con lo que ese auto percibe y acciona

#### Scenario: La red primero
- **WHEN** se abre la pestaña por primera vez, sin configurar nada
- **THEN** la primera tarjeta del tablero es la red del líder y la curva de fitness está debajo

#### Scenario: Plegar el diagrama
- **WHEN** la persona pliega la tarjeta
- **THEN** el diagrama deja de verse, la curva sube y ocupa su lugar y el entrenamiento sigue igual

#### Scenario: Plegar la curva
- **WHEN** la persona pliega la curva de fitness con la red desplegada
- **THEN** la red ocupa el alto que queda en el tablero y el entrenamiento sigue igual

#### Scenario: Volver a desplegar
- **WHEN** la persona pliega la red y la vuelve a desplegar
- **THEN** la red vuelve a ser la primera tarjeta, arriba de la curva

#### Scenario: Red y curva a la vez
- **WHEN** se abre la pestaña con la ventana en 1440×900
- **THEN** la curva de fitness y la red del líder se ven completas a la vez, junto a los autos

### Requirement: Misiones
Con la guía activa, el panel SHALL mostrar cuatro misiones con su progreso:
llegar a la generación 5, lograr un auto que supere 5 vehículos, guardar un
cerebro y terminar una generación con otra función de fitness. La lista
completa SHALL ir al final de la vista de entrenamiento, dentro de un renglón
plegable que dice cuántas misiones van cumplidas de cuántas ("Todas las
misiones · 1 de 4"), plegado por defecto. Abrirlo o cerrarlo SHALL recordarse
hasta cerrar la aplicación y MUST NOT cambiar el entrenamiento. El renglón
SHALL tener un tooltip que diga qué hace y por qué importa, en español y en
inglés. Las misiones MUST NOT bloquear ninguna función y una misión cumplida
SHALL seguir marcada hasta cerrar la aplicación. Cada misión SHALL leerse en
un solo renglón con el panel en su ancho por defecto.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña por primera vez con la guía activa
- **THEN** la tarjeta de consigna muestra la misión en curso y, al final del panel, se ve el renglón "Todas las misiones · 0 de 4" plegado

#### Scenario: Desplegar la lista
- **WHEN** la persona toca el renglón de las misiones
- **THEN** se ven las cuatro misiones con su progreso, con la misión en curso marcada también por algo que no es el color

#### Scenario: Volver a plegar
- **WHEN** la persona vuelve a tocar el renglón con la lista abierta
- **THEN** la lista se pliega, el renglón sigue diciendo cuántas van cumplidas y el entrenamiento no cambió

#### Scenario: Lista recordada
- **WHEN** la persona despliega la lista, abre otra pestaña de la aplicación y vuelve a Entrenar
- **THEN** la lista sigue desplegada

#### Scenario: Cuenta al día con la lista plegada
- **WHEN** la persona guarda su primer cerebro con la lista plegada
- **THEN** el renglón pasa a decir una misión cumplida más, sin desplegarse

#### Scenario: Tooltip del renglón
- **WHEN** la persona posa el cursor sobre el renglón de las misiones
- **THEN** un tooltip en el idioma activo dice qué hace y por qué importa

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
- **WHEN** el panel mide 360 píxeles de ancho, la lista está desplegada y la aplicación está en español o en inglés
- **THEN** el nombre de cada misión y su estado se leen en el mismo renglón

#### Scenario: Misión de superar vehículos
- **WHEN** el líder lleva superados 3 vehículos y hasta ahora ningún auto había superado más
- **THEN** la misión de superar vehículos muestra 3 de 5

#### Scenario: Seguir al tráfico no la cumple
- **WHEN** un auto recorre 600 metros detrás del primer vehículo del tráfico
- **THEN** la misión de superar vehículos sigue en 0 de 5

### Requirement: Panel a la vista sin desplazarse
Con la ventana en 1440×900 y la guía activa, la vista de entrenamiento del
panel de Entrenar SHALL verse completa sin desplazarse, con la lista de
misiones plegada, también después de guardar un cerebro.
Con la ventana en 1366×768 SHALL verse sin desplazarse, como mínimo, los
controles de marcha, el interruptor de sensores del líder y la configuración
básica. Con selección manual, los controles de marcha con sus botones de
elegir y deshacer y la línea de estado SHALL verse sin desplazarse en los dos
tamaños.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900 y la guía activa
- **THEN** el panel no tiene barra de desplazamiento y se ven la tarjeta de consigna con la misión en curso, los controles de marcha con el ajuste de quién elige al padre, el interruptor de sensores, la configuración básica, guardar el campeón, el renglón de las misiones y las tres pestañas del panel

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
