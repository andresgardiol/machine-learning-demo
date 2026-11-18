## MODIFIED Requirements

### Requirement: Escena chica
La vista SHALL poder mostrarse en un recuadro chico, para una pestaña donde
el auto no es lo principal: sigue al auto, encuadra lo que alcanzan a ver sus
sensores y no muestra controles de cámara ni responde a sus gestos. MUST
verse igual de nítida y con los mismos colores que el escenario grande. Inspeccionar y el Laboratorio no la usan: muestran la escena en la zona izquierda, con los controles de cámara del escenario grande.

#### Scenario: Recuadro de 340 por 220
- **WHEN** la escena se muestra en un recuadro de 340 por 220 píxeles
- **THEN** se ven el auto, sus rayos enteros y los bordes y vehículos que tocan, sin botones de cámara

#### Scenario: Recuadro que cambia de tamaño
- **WHEN** el recuadro se agranda
- **THEN** la escena conserva el encuadre y se ve más grande, sin deformarse

#### Scenario: Sin gestos de cámara
- **WHEN** la persona usa la rueda o arrastra sobre la escena chica
- **THEN** el encuadre no cambia

#### Scenario: Inspeccionar y Laboratorio con cámara
- **WHEN** la persona usa la rueda sobre la escena de Inspeccionar o la de Tu manejo
- **THEN** la escena se acerca o se aleja como en El problema, sin mover la página ni la red, y el botón de seguir al auto vuelve al encuadre que muestra los rayos enteros; la tecla V sigue restableciendo la vista de la red
