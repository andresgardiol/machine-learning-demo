# Spec Delta

## MODIFIED Requirements

### Requirement: Configuración avanzada
La pestaña SHALL ofrecer, en la barra de escenario y siempre a la vista, la velocidad
máxima del auto (compartida por todas las pestañas), la cantidad de
carriles (2, 3 o 4), la densidad y la irregularidad del tráfico, y la cantidad,
el alcance y la apertura de los sensores. Todo cambio MUST aplicarse de
inmediato. La velocidad máxima, la densidad y la irregularidad MUST aplicarse
en marcha, sin reiniciar el intento. Los carriles y los sensores SHALL
reiniciar el intento con la nueva configuración.

#### Scenario: Sección colapsada
- **WHEN** se abre la pestaña
- **THEN** los ajustes de la calle y del auto están a la vista en la barra de escenario, sin desplegar nada, y el panel no tiene ninguna sección plegable

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

### Requirement: Restablecer la configuración
La barra de escenario SHALL ofrecer un botón que devuelve la pista, el
tráfico, los sensores y la velocidad a sus valores por defecto.

#### Scenario: Restablecer
- **WHEN** la persona cambió velocidad, carriles, tráfico y sensores, y presiona restablecer
- **THEN** la pista vuelve a ser la calle recta, el auto vuelve a 20 m/s, la calle a tres carriles, el tráfico a densidad e irregularidad de 50 %, y los sensores a 5 rayos, 3 largos de auto y 90 grados

### Requirement: Panel a la vista sin desplazarse
Con la ventana en 1440×900, la guía activa y la barra de escenario a la vista,
el panel de El problema SHALL verse completo sin desplazarse. Con la ventana en
1366×768 SHALL verse sin desplazarse, como mínimo, los controles del intento y
los interruptores de sensores y de ver como la máquina.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900 y la guía activa
- **THEN** el panel no tiene barra de desplazamiento y se ven la guía, los controles del intento, los dos interruptores y las misiones

#### Scenario: Pantalla de 1366×768
- **WHEN** se abre la pestaña con la ventana en 1366×768 y la guía activa
- **THEN** los controles del intento y los dos interruptores se ven sin desplazar el panel

#### Scenario: Manejar mirando las lecturas
- **WHEN** la persona maneja con la ventana en 1440×900
- **THEN** el auto, las barras de los sensores y los indicadores de acción están a la vista al mismo tiempo

### Requirement: Pestaña en un circuito
En un circuito, el indicador de vehículos superados SHALL pasar a mostrar las
vueltas del intento, con un decimal. El botón de tráfico nuevo y los ajustes
de carriles, densidad e irregularidad SHALL verse deshabilitados y explicar
que en un circuito no hay tráfico; sus valores MUST conservarse. Las misiones,
que son de la calle recta, SHALL ocultarse y dejar una línea que lo diga.

#### Scenario: Indicador de vueltas
- **WHEN** el auto lleva recorrida una vuelta y media del óvalo
- **THEN** el indicador se llama "Vueltas" y muestra 1,5

#### Scenario: Ajustes de tráfico
- **WHEN** la persona elige un circuito
- **THEN** en la barra de escenario, carriles, densidad e irregularidad están deshabilitados y su tooltip explica que en un circuito no hay tráfico

#### Scenario: Valores conservados
- **WHEN** la persona tenía la densidad en 80 %, pasa a un circuito y vuelve a la calle recta
- **THEN** la densidad sigue en 80 %

#### Scenario: Misiones
- **WHEN** la persona elige un circuito con la guía activa
- **THEN** en lugar de las misiones se lee que las misiones son de la calle recta

#### Scenario: Choque en un circuito
- **WHEN** el auto choca contra el borde de un circuito
- **THEN** el intento termina como en la calle, con su aviso y la forma de reiniciarlo

### Requirement: Elegir la pista
La pestaña SHALL ofrecer, en la barra de escenario, las cuatro pistas del
catálogo a la vista, la calle recta elegida por defecto. Cambiar de pista MUST reiniciar
el intento en la pista nueva, con el mismo controlador y los mismos sensores.
El selector SHALL tener un tooltip que diga qué hace y por qué importa, y los
nombres de las pistas SHALL estar en español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la pista elegida es la calle recta y todo funciona como antes

#### Scenario: Pasar a un circuito
- **WHEN** la persona elige el óvalo
- **THEN** el auto aparece detenido en la línea de salida del óvalo, sin tráfico, y se maneja con las mismas teclas

#### Scenario: Volver a la calle
- **WHEN** la persona vuelve a elegir la calle recta, o restablece la configuración
- **THEN** el intento se reinicia en la calle recta con el tráfico de siempre

#### Scenario: Tooltip del selector
- **WHEN** la persona posa el cursor sobre el selector de pista
- **THEN** un tooltip en el idioma activo explica que cambia dónde se maneja y que cada pista plantea un problema distinto: tráfico en la calle, curvas en los circuitos

#### Scenario: Panel sin desplazarse
- **WHEN** se abre la pestaña en 1440×900 con la barra de escenario a la vista
- **THEN** el panel se ve completo sin desplazarse

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
- **WHEN** la persona elige cuatro carriles en la barra de escenario
- **THEN** el texto de inicio pasa a hablar de una calle de 4 carriles, en el idioma activo

#### Scenario: Texto breve
- **WHEN** el panel mide 360 píxeles de ancho y la aplicación está en español o en inglés
- **THEN** el texto de inicio ocupa como mucho cinco renglones y las teclas de manejo, como mucho dos
