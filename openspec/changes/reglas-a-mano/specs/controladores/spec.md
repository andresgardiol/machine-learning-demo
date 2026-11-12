# Spec Delta

## ADDED Requirements

### Requirement: Controlador de reglas
El sistema SHALL ofrecer un controlador que maneja un auto con un programa del
lenguaje de reglas, cumpliendo el contrato único: en cada paso ejecuta el
programa con la percepción recibida y devuelve los cuatro controles que el
programa acciona. El programa de un controlador SHALL poder reemplazarse en
marcha por otro programa válido.

#### Scenario: Programa convertido en controles
- **WHEN** el programa es `avanzar` más una regla que gira a la derecha y la condición de la regla se cumple
- **THEN** el controlador devuelve avanzar y derecha accionados, e izquierda y retroceder sin accionar

#### Scenario: Mismo trato que cualquier controlador
- **WHEN** se asigna un controlador de reglas a un auto
- **THEN** la simulación lo maneja igual que con el controlador de teclado o con el de red neuronal, sin ningún cambio en el mundo

#### Scenario: Decisión repetible
- **WHEN** el controlador recibe dos veces la misma percepción
- **THEN** devuelve los mismos controles

#### Scenario: Reemplazar el programa en marcha
- **WHEN** se reemplaza el programa de un controlador a mitad de una simulación
- **THEN** desde el paso siguiente el auto se maneja con el programa nuevo, sin reiniciar la simulación

#### Scenario: Sin programa válido
- **WHEN** un controlador de reglas todavía no recibió ningún programa válido
- **THEN** no acciona ningún control

### Requirement: Programa que no corresponde al auto
Un programa que nombra un sensor que el auto no tiene MUST rechazarse al
analizarse, antes de manejar, explicando cuántos sensores tiene el auto.

#### Scenario: Sensor de más
- **WHEN** se analiza para un auto de 5 sensores un programa que usa `sensor9`
- **THEN** el programa no se acepta y se informa que el auto tiene 5 sensores
