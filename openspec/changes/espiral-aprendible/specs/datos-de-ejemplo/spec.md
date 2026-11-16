# Spec Delta

## MODIFIED Requirements

### Requirement: Puntos de dos colores
Los datos de puntos SHALL generarse con una forma, una cantidad, un ruido y
una semilla. Cada ejemplo es un punto del plano, con sus dos coordenadas
entre −1 y 1 como entradas, y su color como respuesta correcta. Las formas
son cuatro: dos grupos, círculo, cruzado y espiral. La misma semilla MUST dar
los mismos puntos.

#### Scenario: Dos grupos
- **WHEN** se generan 200 puntos de dos grupos sin ruido
- **THEN** los de un color quedan de un lado y los del otro del otro, y una recta los separa

#### Scenario: Círculo
- **WHEN** se generan puntos de círculo sin ruido
- **THEN** los de un color quedan en el centro y los del otro alrededor

#### Scenario: Cruzado
- **WHEN** se generan puntos cruzados sin ruido
- **THEN** cada color ocupa dos cuadrantes opuestos

#### Scenario: Espiral
- **WHEN** se generan puntos de espiral sin ruido
- **THEN** cada color forma un brazo de la espiral, de una vuelta y cuarto, con el otro brazo girado media vuelta

#### Scenario: Mitad de cada color
- **WHEN** se generan puntos de cualquier forma
- **THEN** hay la misma cantidad de cada color, con uno de diferencia como mucho

#### Scenario: Ruido
- **WHEN** se generan los mismos puntos con ruido
- **THEN** algunos puntos quedan del lado del otro color, más cuanto más ruido

#### Scenario: Misma semilla
- **WHEN** se generan dos veces con la misma forma, cantidad, ruido y semilla
- **THEN** los puntos son idénticos
