## MODIFIED Requirements

### Requirement: Misión en curso
La tarjeta SHALL mostrar la misión en curso: la primera sin cumplir, en el orden de la lista, con el mismo nombre, progreso y barra que en la lista. Con todas cumplidas, SHALL decirlo; sin misiones en ese modo, SHALL no mostrar misión. La lista completa SHALL seguir al final del panel, con la misión en curso marcada también por algo que no es el color. En Entrenar la lista SHALL ir plegada en un renglón que dice cuántas van cumplidas, como fija `pestana-entrenar`; en las demás pestañas, a la vista.

#### Scenario: Primera misión por defecto
- **WHEN** la persona entra a El problema sin haber cumplido nada
- **THEN** la tarjeta muestra "Superá 5 vehículos sin chocar" con 0 de 5

#### Scenario: Pasa a la siguiente
- **WHEN** la persona supera el quinto vehículo sin chocar
- **THEN** la lista marca la primera misión como cumplida y la tarjeta pasa a mostrar "Recorré 500 m sin chocar" con su progreso

#### Scenario: Progreso al día
- **WHEN** la persona supera tres vehículos sin chocar
- **THEN** la tarjeta y la lista muestran los dos "3 de 5" al mismo tiempo

#### Scenario: Todas cumplidas
- **WHEN** la persona cumple todas las misiones de la pestaña
- **THEN** la tarjeta dice que están todas cumplidas y la lista las muestra marcadas

#### Scenario: Sin misiones en el modo
- **WHEN** en El problema la persona elige un circuito
- **THEN** la tarjeta muestra la consigna y la marcha sin misión

#### Scenario: Misiones recordadas
- **WHEN** la persona cumple una misión, reinicia el intento y vuelve a la pestaña más tarde, sin cerrar la app
- **THEN** la tarjeta sigue mostrando como misión en curso la primera que falta

#### Scenario: La lista plegada de Entrenar
- **WHEN** la persona llega a la generación 5 en Entrenar con la lista de misiones plegada
- **THEN** la tarjeta pasa a mostrar la misión siguiente y el renglón plegado pasa a decir una misión cumplida
