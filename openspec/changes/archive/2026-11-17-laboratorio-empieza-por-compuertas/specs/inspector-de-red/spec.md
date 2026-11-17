## ADDED Requirements

### Requirement: Perillas de pesos y sesgos sobre la red
Cuando la pestaña lo pide, el diagrama SHALL llevar pastillas para cambiar
pesos y sesgos en el lugar. Con hasta 16 conexiones, cada conexión lleva la
pastilla de su peso y cada neurona que no es de entrada, la de su sesgo. Con
más, solo las conexiones que entran a la neurona elegida y su sesgo. Funcionan
como la pastilla de "Cambiar un peso en el lugar".

#### Scenario: Red chica
- **WHEN** la pestaña pide perillas y la red es 2 → 2 → 1
- **THEN** se ven seis pastillas de peso y tres de sesgo, sin elegir nada

#### Scenario: Red grande
- **WHEN** la pestaña pide perillas, la red es 2 → 8 → 8 → 1 y la persona elige una neurona de la segunda capa oculta
- **THEN** se ven las ocho pastillas de las conexiones que le entran y la de su sesgo, y ninguna otra

#### Scenario: Sin pedirlas
- **WHEN** la pestaña no pide perillas
- **THEN** solo la conexión elegida lleva pastilla, como hasta ahora

#### Scenario: Pastilla del sesgo
- **WHEN** la persona arrastra hacia arriba la pastilla del sesgo de una neurona
- **THEN** el sesgo sube, el contorno de la neurona lo muestra y la red recalcula mientras la mueve

#### Scenario: No se tapan
- **WHEN** la red tiene hasta 16 conexiones en cualquier forma que arme el Laboratorio, a 1440×900 y 1366×768
- **THEN** ninguna pastilla tapa a otra ni a una neurona, y cada una queda sobre su conexión o junto a su neurona

#### Scenario: Siguen al aprendizaje
- **WHEN** la red aprende con las pastillas a la vista
- **THEN** cada pastilla muestra el valor de ahora de su peso o su sesgo

#### Scenario: Con el teclado
- **WHEN** la persona recorre la red con Tab
- **THEN** pasa por cada pastilla en orden, de la primera capa a la última, y cada una cambia con las flechas de a 0,01, y de a 0,1 con Mayús

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega a la pastilla de un sesgo
- **THEN** la anuncia como un deslizador, con de qué neurona es el sesgo y su valor

### Requirement: Perillas de las entradas
Cuando la pestaña lo pide, cada neurona de entrada SHALL llevar a su lado un
control de su valor: un interruptor de dos valores o una pastilla continua,
según lo que pida la pestaña. Cambiarlo MUST recalcular la red en el momento.
El control no cambia la red ni cuenta como cambio a mano.

#### Scenario: Interruptor
- **WHEN** la pestaña pide interruptores de 0 y 1 y la persona activa el de una entrada que vale 0
- **THEN** la entrada pasa a valer 1 y la red recalcula

#### Scenario: Pastilla continua
- **WHEN** la pestaña pide pastillas de −1 a 1 y la persona arrastra la de una entrada
- **THEN** la entrada cambia mientras arrastra y la red recalcula

#### Scenario: No es un cambio a mano
- **WHEN** la persona cambia una entrada desde su control
- **THEN** el contador de cambios a mano no sube

#### Scenario: Elegir la neurona sigue igual
- **WHEN** la persona hace clic sobre la neurona de entrada, no sobre su control
- **THEN** la neurona queda elegida, como hasta ahora

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega al interruptor de una entrada
- **THEN** lo anuncia como un interruptor, con el nombre de la entrada y su valor
