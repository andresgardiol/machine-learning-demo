# Spec Delta

## MODIFIED Requirements

### Requirement: Tráfico por generación
El entrenamiento SHALL ofrecer dos modos de tráfico: un tráfico nuevo en cada
generación (por defecto) o el mismo tráfico en todas las generaciones. Con
tráfico nuevo, la secuencia de tráficos MUST quedar determinada por la semilla
del entrenamiento.

#### Scenario: Mismo tráfico
- **WHEN** el modo es mismo tráfico
- **THEN** los vehículos aparecen en las mismas posiciones al empezar cada generación

#### Scenario: Tráfico nuevo
- **WHEN** el modo es tráfico nuevo
- **THEN** la disposición de los vehículos cambia de una generación a la siguiente

#### Scenario: Estado por defecto
- **WHEN** se crea un entrenamiento sin indicar el modo de tráfico
- **THEN** el modo es tráfico nuevo y la segunda generación empieza con los vehículos en posiciones distintas de las de la primera

#### Scenario: Tráfico nuevo reproducible
- **WHEN** se ejecutan dos entrenamientos de diez generaciones con la misma semilla, la misma configuración y tráfico nuevo
- **THEN** la generación número n de uno enfrenta el mismo tráfico que la generación número n del otro, y el mejor fitness y el promedio de cada generación coinciden

#### Scenario: Volver al mismo tráfico
- **WHEN** se cambia el modo a mismo tráfico durante un entrenamiento con tráfico nuevo
- **THEN** desde la generación siguiente todas las generaciones enfrentan el mismo tráfico
