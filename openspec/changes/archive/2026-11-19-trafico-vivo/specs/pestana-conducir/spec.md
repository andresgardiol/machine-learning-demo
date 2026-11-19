## MODIFIED Requirements

### Requirement: Indicadores del intento
El tablero SHALL mostrar en un renglón, actualizados en tiempo real, la
distancia recorrida en metros, la cantidad de vehículos superados, la cantidad
de intentos y la mejor distancia lograda desde que se abrió la pestaña. Un
vehículo cuenta como superado cuando queda entero detrás del auto, con su
propio largo.

#### Scenario: Avanzar
- **WHEN** el auto avanza y supera a un vehículo del tráfico
- **THEN** la distancia aumenta de forma continua y los vehículos superados aumentan en uno

#### Scenario: Superar un camión
- **WHEN** la cola del auto pasa el centro de un camión pero todavía no su frente
- **THEN** los vehículos superados no cambian hasta que la cola del auto deja atrás el frente del camión

#### Scenario: Vehículo que vuelve a pasar
- **WHEN** un vehículo superado vuelve a quedar delante del auto, por ejemplo porque el auto frenó o porque su carril va más rápido
- **THEN** los vehículos superados disminuyen en uno

#### Scenario: Nueva mejor distancia
- **WHEN** un intento termina con una distancia mayor que la mejor registrada
- **THEN** la mejor distancia pasa a ser la de ese intento

#### Scenario: Indicadores junto al escenario
- **WHEN** se abre la pestaña con la ventana en 1440×900
- **THEN** los cuatro indicadores se ven en un renglón en la parte de arriba del tablero
