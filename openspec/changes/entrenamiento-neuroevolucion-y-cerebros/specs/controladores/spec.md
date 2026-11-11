# Spec Delta

## ADDED Requirements

### Requirement: Controlador de red neuronal
El sistema SHALL ofrecer un controlador que maneja un auto con la red de un
cerebro, cumpliendo el contrato único: en cada paso entrega a la red las
lecturas de los sensores en su orden y la velocidad como última entrada, y
convierte las cuatro salidas en los controles avanzar, izquierda, derecha y
retroceder.

#### Scenario: Salidas convertidas en controles
- **WHEN** la red entrega las salidas 1, 0, 1 y 0
- **THEN** el controlador devuelve avanzar y derecha accionados, e izquierda y retroceder sin accionar

#### Scenario: Mismo trato que cualquier controlador
- **WHEN** se asigna un controlador de red neuronal a un auto
- **THEN** la simulación lo maneja igual que con el controlador de teclado, sin ningún cambio en el mundo

#### Scenario: Decisión repetible
- **WHEN** el controlador recibe dos veces la misma percepción
- **THEN** devuelve los mismos controles

### Requirement: Red que no corresponde a la percepción
Un controlador de red neuronal MUST rechazarse al crearse, explicando el
motivo, si la cantidad de entradas de la red no es la cantidad de sensores del
auto más uno. El rechazo SHALL ocurrir antes de empezar a manejar, nunca a
mitad de una simulación.

#### Scenario: Entradas de más
- **WHEN** se crea un controlador con una red de 10 entradas para un auto de 5 sensores
- **THEN** el controlador no se crea y se informa que la red espera 9 sensores y el auto tiene 5
