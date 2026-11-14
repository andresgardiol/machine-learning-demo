# Spec Delta

## ADDED Requirements

### Requirement: Escena chica
La vista SHALL poder mostrarse en un recuadro chico, para una pestaña donde
el auto no es lo principal: sigue al auto, encuadra lo que alcanzan a ver sus
sensores y no muestra controles de cámara ni responde a sus gestos. MUST
verse igual de nítida y con los mismos colores que el escenario grande.

#### Scenario: Recuadro de 340 por 220
- **WHEN** la escena se muestra en un recuadro de 340 por 220 píxeles
- **THEN** se ven el auto, sus rayos enteros y los bordes y vehículos que tocan, sin botones de cámara

#### Scenario: Recuadro que cambia de tamaño
- **WHEN** el recuadro se agranda
- **THEN** la escena conserva el encuadre y se ve más grande, sin deformarse

#### Scenario: Sin gestos de cámara
- **WHEN** la persona usa la rueda o arrastra sobre la escena chica
- **THEN** el encuadre no cambia

### Requirement: Rayos que se mueven a mano
La vista SHALL poder mostrar, sobre cada rayo, una manija que marca dónde
detecta algo y que se puede arrastrar a lo largo del rayo, avisando la lectura
que corresponde a cada posición. SHALL poder dibujar cada rayo con un color y
un grosor indicados por la pestaña, y un rayo como apagado.

#### Scenario: Arrastrar una manija
- **WHEN** la persona arrastra la manija de un rayo hasta la mitad
- **THEN** la vista avisa una lectura de 0,5 para ese sensor mientras arrastra, y la manija no se sale del rayo

#### Scenario: Manija en la punta
- **WHEN** la manija está en la punta del rayo
- **THEN** la lectura es 0: el sensor no detecta nada

#### Scenario: Manijas agarrables
- **WHEN** el auto tiene 20 sensores en un recuadro de 340 por 220 píxeles
- **THEN** cada manija se puede agarrar sin agarrar la de al lado

#### Scenario: Rayos con el peso de una neurona
- **WHEN** la pestaña indica un color y un grosor para cada rayo
- **THEN** los rayos se dibujan así, con la convención de signo del diagrama de la red

#### Scenario: Rayo apagado
- **WHEN** la pestaña indica que un sensor está apagado
- **THEN** su rayo se ve atenuado y tachado
