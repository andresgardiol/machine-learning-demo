# Spec Delta

## ADDED Requirements

### Requirement: Dibujo de una población
Cuando el mundo tiene varios autos, la vista SHALL dibujarlos a todos: el auto
líder con su aspecto completo y sus sensores, y los demás atenuados y sin
sensores, de modo que el líder se distinga a simple vista. Los autos chocados
MUST distinguirse de los que siguen en carrera, y no solo por el color.

#### Scenario: Población en carrera
- **WHEN** se muestra un mundo con cien autos
- **THEN** se ven los cien, uno de ellos destacado con sus rayos y el resto atenuado sin rayos

#### Scenario: Autos chocados
- **WHEN** parte de la población chocó
- **THEN** los autos chocados se ven con un aspecto distinto del de los autos en carrera, reconocible sin depender del color

#### Scenario: Mundo de un solo auto
- **WHEN** se muestra un mundo con un solo auto
- **THEN** el dibujo es el mismo que antes de este cambio

### Requirement: Marca de la élite
La vista SHALL poder marcar de forma reconocible a los autos que pasaron sin
cambios desde la generación anterior, para que se vea qué hace el mejor
individuo heredado.

#### Scenario: Élite marcada
- **WHEN** se muestra una generación que tiene un individuo de élite
- **THEN** ese auto lleva una marca que lo diferencia del resto de la población y del líder

### Requirement: Seguimiento del líder
La cámara SHALL poder seguir a un auto que cambia con el tiempo. Cuando el auto
seguido cambia, el encuadre MUST desplazarse de forma continua hacia el nuevo,
sin saltar de golpe, salvo al reiniciarse el mundo.

#### Scenario: Cambio de líder
- **WHEN** otro auto pasa a ser el líder a pocos metros del anterior
- **THEN** el encuadre se desliza hasta el nuevo líder en lugar de saltar

#### Scenario: Nueva generación
- **WHEN** empieza una generación nueva
- **THEN** la cámara muestra de inmediato la línea de salida

#### Scenario: Paneo durante el entrenamiento
- **WHEN** la persona panea el escenario mientras la población avanza
- **THEN** la cámara deja de seguir al líder hasta que se restablece la vista

### Requirement: Fluidez con una población
La vista SHALL mantenerse fluida al mostrar una población a velocidad normal
en una computadora de escritorio de uso general.

#### Scenario: Población por defecto
- **WHEN** se mide la tasa de cuadros durante diez segundos con una población de 100 autos a velocidad normal
- **THEN** el promedio es de al menos 50 cuadros por segundo

#### Scenario: Población máxima
- **WHEN** se mide la tasa de cuadros durante diez segundos con una población de 500 autos a velocidad normal
- **THEN** el promedio es de al menos 30 cuadros por segundo
