## ADDED Requirements

### Requirement: Compuertas lógicas
Los datos de compuertas SHALL generarse a partir de una compuerta: AND, OR o
XOR. Son cuatro ejemplos, uno por cada combinación de dos entradas que valen
0 o 1, con la respuesta de la tabla de verdad de esa compuerta. No tienen
ruido ni cantidad, y ningún ejemplo se aparta: los cuatro son de práctica.

#### Scenario: AND
- **WHEN** se generan los datos de AND
- **THEN** hay cuatro ejemplos, (0, 0), (0, 1), (1, 0) y (1, 1), y solo (1, 1) tiene respuesta sí

#### Scenario: OR
- **WHEN** se generan los datos de OR
- **THEN** solo (0, 0) tiene respuesta no

#### Scenario: XOR
- **WHEN** se generan los datos de XOR
- **THEN** (0, 1) y (1, 0) tienen respuesta sí, y (0, 0) y (1, 1) tienen respuesta no

#### Scenario: Siempre iguales
- **WHEN** se generan dos veces los datos de la misma compuerta
- **THEN** los ejemplos son idénticos y vienen en el mismo orden

#### Scenario: Sin apartados
- **WHEN** se separan los datos de compuertas con cualquier parte apartada
- **THEN** los cuatro ejemplos quedan en la práctica y no hay apartados

#### Scenario: Compuerta desconocida
- **WHEN** se piden datos de una compuerta que no es AND, OR ni XOR
- **THEN** se generan los de AND
