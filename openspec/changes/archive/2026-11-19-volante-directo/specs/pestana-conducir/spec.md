## MODIFIED Requirements

### Requirement: Acción visible
El tablero SHALL mostrar, en una tarjeta, cuatro indicadores, uno por control
(avanzar, retroceder, izquierda, derecha), que se resaltan mientras ese
control está accionado.

#### Scenario: Presionar una tecla
- **WHEN** la persona mantiene presionada la flecha izquierda
- **THEN** el indicador de izquierda se resalta entero desde que la aprieta y vuelve a su estado normal al soltarla

#### Scenario: Avanzar
- **WHEN** la persona mantiene presionada la flecha arriba
- **THEN** el indicador de avanzar se resalta entero mientras la mantiene

#### Scenario: Percepción y acción a la vez
- **WHEN** se abre la pestaña con la ventana en 1440×900
- **THEN** las tarjetas de percepción y de acción se ven completas a la vez, junto al escenario
