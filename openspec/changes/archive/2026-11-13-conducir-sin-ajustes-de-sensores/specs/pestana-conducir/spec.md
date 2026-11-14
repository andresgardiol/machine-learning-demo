# Spec Delta

## MODIFIED Requirements

### Requirement: Configuración avanzada
La pestaña SHALL ofrecer, en la barra de escenario y siempre a la vista, la
velocidad máxima del auto (compartida por todas las pestañas), los carriles
(2, 3 o 4), y la densidad y la irregularidad del tráfico. La pestaña MUST NOT
ofrecer ajustes de sensores: acá maneja una persona con el teclado, y el auto
lleva siempre los sensores por defecto para mostrar qué recibiría una
máquina. Todo cambio MUST aplicarse de inmediato. La velocidad, la densidad y
la irregularidad se aplican en marcha; los carriles reinician el intento.

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
- **WHEN** la persona busca en El problema cómo cambiar la cantidad, el alcance o la apertura de los sensores
- **THEN** no hay ajustes de sensores en la barra ni en el panel, y el auto tiene siempre 5 rayos de 3 largos de auto y 90 grados

#### Scenario: Sensores que siguen a la vista
- **WHEN** la persona maneja en El problema
- **THEN** los rayos, las barras de percepción, el interruptor de sensores y "ver como la máquina" siguen como antes

#### Scenario: Sensores de las otras pestañas
- **WHEN** la persona cambia los sensores en Reglas a mano o en Entrenar y vuelve a El problema
- **THEN** el auto de El problema sigue con sus 5 rayos

### Requirement: Restablecer la configuración
La barra de escenario SHALL ofrecer un botón que devuelve la pista, el
tráfico y la velocidad a sus valores por defecto.

#### Scenario: Restablecer
- **WHEN** la persona cambió velocidad, carriles y tráfico, y presiona restablecer
- **THEN** la pista vuelve a ser la calle recta, el auto vuelve a 20 m/s, la calle a tres carriles y el tráfico a densidad e irregularidad de 50 %
