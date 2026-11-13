# Spec Delta

## ADDED Requirements

### Requirement: Mundo sobre un circuito
El mundo SHALL poder armarse sobre cualquier pista del catálogo. Sobre un
circuito no hay tráfico, sean cuales sean la densidad y la irregularidad
pedidas, y los autos salen de la línea de salida, en el centro de la pista y
mirando en el sentido de avance. Lo demás no cambia: pasos fijos, choque con
los bordes, reinicio y autos que no chocan entre sí.

#### Scenario: Estado por defecto
- **WHEN** se arma un mundo sin indicar la pista
- **THEN** es la calle recta con tráfico de siempre

#### Scenario: Circuito sin tráfico
- **WHEN** se arma un mundo sobre el óvalo con densidad 100 %
- **THEN** no hay ningún vehículo de tráfico en toda la pista

#### Scenario: Choque con el borde
- **WHEN** un auto sigue derecho al llegar a la primera curva del óvalo
- **THEN** choca contra el borde y queda fuera de carrera con el motivo "borde"

#### Scenario: Varios autos en un circuito
- **WHEN** dos autos con el mismo controlador corren en el óvalo
- **THEN** recorren exactamente el mismo camino, superpuestos, sin chocarse

#### Scenario: Circuito reproducible
- **WHEN** se repite una corrida sobre el mismo circuito con el mismo controlador
- **THEN** el estado del mundo es idéntico paso a paso

#### Scenario: Volver a la calle
- **WHEN** después de correr en un circuito se arma un mundo sobre la calle recta con la misma semilla de siempre
- **THEN** el tráfico es el mismo que antes de usar el circuito
