# Spec Delta

## ADDED Requirements

### Requirement: Dibujo de un circuito
La vista SHALL dibujar un circuito con sus dos bordes cerrados, sin líneas de
carril, y con la línea de salida marcada de borde a borde. El circuito MUST
mostrarse con una orientación fija: la recta de salida vertical y el sentido
de avance hacia arriba, como la calle recta. La cámara sigue al auto, pero la
pista no gira con él, para que el trazado se reconozca.

#### Scenario: Óvalo a la vista
- **WHEN** se muestra el óvalo con el zoom por defecto
- **THEN** se ven los dos bordes del tramo donde está el auto y la línea de salida, y no hay líneas de carril

#### Scenario: La pista no gira
- **WHEN** el auto toma una curva de un circuito
- **THEN** el auto gira en pantalla y la pista conserva su orientación

#### Scenario: Salida hacia arriba
- **WHEN** se muestra la línea de salida de cualquier circuito
- **THEN** la recta de salida se ve vertical y el auto mira hacia arriba

#### Scenario: Calle recta sin cambios
- **WHEN** se muestra la calle recta
- **THEN** se sigue viendo vertical, con el sentido de avance hacia arriba y sus líneas de carril

### Requirement: Circuito entero a la vista
El zoom SHALL permitir alejar la vista hasta ver entero cualquier circuito del
catálogo en una ventana de 1440×900, y restablecer la vista SHALL volver al
zoom por defecto siguiendo al auto.

#### Scenario: Alejar hasta ver todo
- **WHEN** la persona aleja el zoom al mínimo sobre el gran premio, con el tablero a la vista
- **THEN** todo el trazado entra en el escenario

#### Scenario: Restablecer
- **WHEN** la persona presiona restablecer la vista después de alejar el zoom
- **THEN** la vista vuelve al zoom por defecto, centrada en el auto

### Requirement: Fluidez en un circuito
La vista SHALL mantenerse fluida en un circuito, con el paisaje encendido, en
una computadora de escritorio de uso general.

#### Scenario: Un auto
- **WHEN** se mide la tasa de cuadros durante diez segundos de manejo en el gran premio con el paisaje encendido
- **THEN** el promedio es de al menos 55 cuadros por segundo

#### Scenario: Una población
- **WHEN** se mide la tasa de cuadros durante diez segundos con una población de 100 autos en el gran premio, a velocidad normal y con el paisaje encendido
- **THEN** el promedio es de al menos 50 cuadros por segundo
