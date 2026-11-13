# Spec Delta

## ADDED Requirements

### Requirement: Reiniciar la generación en curso
El entrenamiento SHALL poder volver a empezar la generación en curso con la
misma población y el mismo número de generación, aplicando en ese momento los
cambios de escenario que estuvieran esperando (pista, carriles, densidad,
irregularidad y velocidad). Los demás cambios pendientes MUST seguir esperando
a la generación siguiente. La generación que se reinicia MUST NOT quedar en el
historial, y lo logrado hasta ahí se descarta.

#### Scenario: Cambio de escenario
- **WHEN** en la generación 7 se configura otra pista y se reinicia la generación en curso
- **THEN** la generación 7 empieza de nuevo en esa pista, con las mismas redes, todos los autos en la salida y el historial con 6 registros

#### Scenario: Cambios de evolución que siguen esperando
- **WHEN** hay un cambio de población y uno de élite esperando, y se reinicia la generación en curso
- **THEN** la generación vuelve a empezar con la misma cantidad de autos, y los dos cambios rigen recién al armar la generación siguiente

#### Scenario: Sin cambios pendientes
- **WHEN** se reinicia la generación en curso sin haber cambiado nada
- **THEN** la generación vuelve a empezar igual que la primera vez, con el mismo tráfico

#### Scenario: Selección manual
- **WHEN** se reinicia la generación en curso con selección manual y un padre elegido
- **THEN** el padre elegido y sus elecciones anteriores no cambian

#### Scenario: Reinicio reproducible
- **WHEN** se repite un entrenamiento con la misma semilla, los mismos cambios y los mismos reinicios en los mismos pasos
- **THEN** resulta la misma población en cada generación
