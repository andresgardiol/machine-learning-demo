# Spec Delta

## MODIFIED Requirements

### Requirement: Guía de inicio
Con la guía activa, el panel SHALL mostrar un texto de inicio, de hasta 240
caracteres en cada idioma, que diga qué se está viendo y qué probar, y un
renglón aparte con las teclas de manejo. El texto MUST nombrar la cantidad de
carriles que la calle tiene en ese momento.

#### Scenario: Guía activa
- **WHEN** la guía está activa
- **THEN** el panel muestra el texto de inicio con las teclas de manejo

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el texto de inicio y los renglones de ayuda del tablero no se muestran y el manejo funciona igual

#### Scenario: Carriles por defecto
- **WHEN** se abre la pestaña con la configuración por defecto
- **THEN** el texto de inicio habla de una calle de 3 carriles

#### Scenario: Carriles elegidos
- **WHEN** la persona elige cuatro carriles en la configuración avanzada
- **THEN** el texto de inicio pasa a hablar de una calle de 4 carriles, en el idioma activo

#### Scenario: Texto breve
- **WHEN** el panel mide 360 píxeles de ancho y la aplicación está en español o en inglés
- **THEN** el texto de inicio ocupa como mucho cinco renglones y las teclas de manejo, como mucho dos

### Requirement: Indicadores del intento
El tablero SHALL mostrar en un renglón, actualizados en tiempo real, la
distancia recorrida en metros, la cantidad de vehículos superados, la cantidad
de intentos y la mejor distancia lograda desde que se abrió la pestaña.

#### Scenario: Avanzar
- **WHEN** el auto avanza y supera a un vehículo del tráfico
- **THEN** la distancia aumenta de forma continua y los vehículos superados aumentan en uno

#### Scenario: Vehículo que vuelve a pasar
- **WHEN** un vehículo superado vuelve a quedar delante del auto, por ejemplo porque el auto frenó
- **THEN** los vehículos superados disminuyen en uno

#### Scenario: Nueva mejor distancia
- **WHEN** un intento termina con una distancia mayor que la mejor registrada
- **THEN** la mejor distancia pasa a ser la de ese intento

#### Scenario: Indicadores junto al escenario
- **WHEN** se abre la pestaña con la ventana en 1440×900
- **THEN** los cuatro indicadores se ven en un renglón en la parte de arriba del tablero

### Requirement: Percepción visible
El tablero SHALL mostrar, en una tarjeta, una barra por cada sensor, en el
mismo orden que los rayos de izquierda a derecha, que refleja su lectura en
tiempo real, y una barra más, separada y rotulada, para la velocidad del auto,
que es la otra entrada que recibiría una máquina. Con hasta 12 sensores, cada
barra SHALL mostrar debajo su lectura como número entre 0 y 1. Un interruptor,
encendido por defecto, SHALL mostrar u ocultar los rayos sobre el escenario;
las barras MUST seguir visibles.

#### Scenario: Obstáculo que se acerca
- **WHEN** un vehículo se acerca por un rayo
- **THEN** la barra de ese rayo crece a medida que el vehículo está más cerca

#### Scenario: Ocultar la percepción
- **WHEN** la persona apaga el interruptor de sensores
- **THEN** desaparecen los rayos del escenario, las barras siguen mostrando las lecturas y el manejo no cambia

#### Scenario: Volver a mostrar los rayos
- **WHEN** la persona vuelve a encender el interruptor de sensores
- **THEN** los rayos se dibujan otra vez sobre el escenario

#### Scenario: Lecturas con número
- **WHEN** el auto tiene 5 sensores y la aplicación está en español
- **THEN** debajo de cada barra se lee su lectura con dos decimales y coma decimal, por ejemplo 0,42

#### Scenario: Muchos sensores
- **WHEN** el auto tiene 30 sensores
- **THEN** se ven 30 barras sin números debajo y la barra de la velocidad conserva el suyo

#### Scenario: Velocidad como entrada
- **WHEN** el auto acelera desde parado hasta su velocidad máxima
- **THEN** la barra de la velocidad crece hasta llenarse y su número llega a 1

### Requirement: Acción visible
El tablero SHALL mostrar, en una tarjeta, cuatro indicadores, uno por control
(avanzar, retroceder, izquierda, derecha), que se resaltan mientras ese
control está accionado.

#### Scenario: Presionar una tecla
- **WHEN** la persona mantiene presionada la flecha izquierda
- **THEN** el indicador de izquierda se resalta y vuelve a su estado normal al soltarla

#### Scenario: Percepción y acción a la vez
- **WHEN** se abre la pestaña con la ventana en 1440×900
- **THEN** las tarjetas de percepción y de acción se ven completas a la vez, junto al escenario

### Requirement: Configuración avanzada
La pestaña SHALL ofrecer, en una sección colapsada por defecto, la velocidad
máxima del auto (compartida por todas las pestañas), la cantidad de
carriles (2, 3 o 4), la densidad y la irregularidad del tráfico, y la cantidad,
el alcance y la apertura de los sensores. Todo cambio MUST aplicarse de
inmediato. La velocidad máxima, la densidad y la irregularidad MUST aplicarse
en marcha, sin reiniciar el intento. Los carriles y los sensores SHALL
reiniciar el intento con la nueva configuración.

#### Scenario: Sección colapsada
- **WHEN** se abre la pestaña
- **THEN** los controles de configuración avanzada no están a la vista

#### Scenario: Cambiar los carriles
- **WHEN** la persona elige cuatro carriles
- **THEN** el intento se reinicia de inmediato en una calle de cuatro carriles

#### Scenario: Cambiar la velocidad del auto
- **WHEN** la persona sube la velocidad máxima a 30 m/s mientras maneja
- **THEN** el intento sigue sin reiniciarse, con la misma distancia y los mismos intentos, y el auto puede llegar a 30 m/s

#### Scenario: Cambiar el tráfico en marcha
- **WHEN** la persona cambia la densidad o la irregularidad mientras maneja
- **THEN** el intento sigue sin reiniciarse, los vehículos cercanos siguen donde estaban y el tráfico con la nueva configuración aparece más adelante

#### Scenario: Cambiar los sensores
- **WHEN** la persona cambia la cantidad de sensores a nueve
- **THEN** el auto muestra nueve rayos y el tablero nueve barras con sus números

### Requirement: Misiones
Con la guía activa, el panel SHALL mostrar tres misiones con su progreso:
superar 5 vehículos sin chocar, recorrer 500 metros sin chocar y recorrer 200
metros en el modo ver como la máquina. Las misiones MUST NOT bloquear ninguna
función y una misión cumplida SHALL seguir marcada hasta cerrar la aplicación.
Cada misión SHALL leerse en un solo renglón con el panel en su ancho por
defecto.

#### Scenario: Progreso de una misión
- **WHEN** la persona supera tres vehículos sin chocar
- **THEN** la primera misión muestra tres de cinco

#### Scenario: Misión cumplida
- **WHEN** la persona supera el quinto vehículo sin chocar
- **THEN** la primera misión queda marcada como cumplida y sigue marcada tras reiniciar el intento

#### Scenario: Chocar antes de cumplir
- **WHEN** la persona choca antes de cumplir una misión
- **THEN** el progreso de esa misión vuelve a cero en el siguiente intento

#### Scenario: Misiones de un renglón
- **WHEN** el panel mide 360 píxeles de ancho y la aplicación está en español o en inglés
- **THEN** el nombre de cada misión y su estado se leen en el mismo renglón

## ADDED Requirements

### Requirement: Panel a la vista sin desplazarse
Con la ventana en 1440×900, la guía activa y la sección avanzada plegada, el
panel de El problema SHALL verse completo sin desplazarse. Con la ventana en
1366×768 SHALL verse sin desplazarse, como mínimo, los controles del intento y
los interruptores de sensores y de ver como la máquina.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900 y la guía activa
- **THEN** el panel no tiene barra de desplazamiento y se ven la guía, los controles del intento, los dos interruptores, las misiones y el título de la sección avanzada

#### Scenario: Pantalla de 1366×768
- **WHEN** se abre la pestaña con la ventana en 1366×768 y la guía activa
- **THEN** los controles del intento y los dos interruptores se ven sin desplazar el panel

#### Scenario: Manejar mirando las lecturas
- **WHEN** la persona maneja con la ventana en 1440×900
- **THEN** el auto, las barras de los sensores y los indicadores de acción están a la vista al mismo tiempo
