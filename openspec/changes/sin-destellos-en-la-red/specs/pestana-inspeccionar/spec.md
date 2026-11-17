## MODIFIED Requirements

### Requirement: Decisión de la red
El tablero SHALL mostrar, debajo de la escena, la decisión del cuadro en
curso: las cuatro acciones (avanzar, izquierda, derecha y retroceder), con
cuáles están encendidas, sin depender solo del color. Una acción que con la
red corriendo se enciende y apaga más de tres veces en un segundo SHALL verse
quieta, a medio encender y rayada, sin destellar.

#### Scenario: Decisión en vivo
- **WHEN** la red decide avanzar y doblar a la derecha
- **THEN** esas dos acciones se ven encendidas y las otras dos apagadas

#### Scenario: Cuenta a medio hacer
- **WHEN** el paso a paso todavía no llegó a las salidas
- **THEN** las cuatro acciones se ven sin decidir, distintas de un "no"

#### Scenario: Acción que titubea
- **WHEN** la red enciende y apaga "derecha" en cuadros seguidos mientras el auto maneja
- **THEN** la tecla "derecha" se ve rayada y a medio encender, sin destellar, y su nombre accesible dice que titubea

#### Scenario: En pausa
- **WHEN** la persona pausa con una acción rayada
- **THEN** la acción se ve encendida o apagada según el cuadro en pausa
