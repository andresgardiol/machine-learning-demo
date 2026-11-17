## ADDED Requirements

### Requirement: Controlador con observador
El sistema SHALL ofrecer un controlador que combina dos: uno que maneja y otro
que observa. En cada cuadro, los dos reciben la misma percepción; el auto
recibe solo los controles del que maneja, y la decisión del que observa queda
disponible para mostrarla. El que observa MUST NOT influir en el auto.

#### Scenario: Maneja uno, observa otro
- **WHEN** maneja un controlador que siempre avanza y observa una red que, con esa percepción, decide doblar a la izquierda
- **THEN** el auto recibe solo avanzar, y la decisión disponible del observador es doblar a la izquierda

#### Scenario: Misma percepción
- **WHEN** pasa un cuadro
- **THEN** el observador recibió exactamente la percepción que recibió el que maneja

#### Scenario: Mismo recorrido
- **WHEN** se simula dos veces con la misma semilla el mismo controlador que maneja, una vez solo y otra con una red observando
- **THEN** el auto hace exactamente el mismo recorrido las dos veces

#### Scenario: Cambiar quién maneja
- **WHEN** a mitad de un intento el que observa pasa a manejar
- **THEN** desde el cuadro siguiente el auto recibe sus controles, sin volver a empezar el intento
