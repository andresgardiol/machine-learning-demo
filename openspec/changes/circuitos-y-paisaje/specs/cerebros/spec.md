# Spec Delta

## ADDED Requirements

### Requirement: Pistas en los datos de entrenamiento
Cada escenario de los datos de entrenamiento de un cerebro SHALL registrar en
qué pista o pistas corrieron sus generaciones. Un cerebro guardado antes de
existir los circuitos MUST seguir siendo válido y leerse como entrenado en la
calle recta. Los datos de un cerebro en la biblioteca SHALL nombrar esas
pistas en el idioma activo.

#### Scenario: Entrenado en un circuito
- **WHEN** se guarda el campeón de un entrenamiento de 30 generaciones en el óvalo
- **THEN** sus datos dicen que se entrenó 30 generaciones en el óvalo

#### Scenario: Entrenado en varias pistas
- **WHEN** se guarda el campeón de un entrenamiento de 40 generaciones que alternó la calle recta y el riñón
- **THEN** sus datos dicen que se entrenó 40 generaciones alternando la calle recta y el riñón

#### Scenario: Cerebro anterior
- **WHEN** se abre la biblioteca con un cerebro guardado antes de este cambio
- **THEN** el cerebro es válido y sus datos dicen que se entrenó en la calle recta

#### Scenario: Cambio de pistas a mitad de camino
- **WHEN** un entrenamiento corre 20 generaciones en la calle recta y después 10 en el óvalo
- **THEN** los datos del cerebro tienen dos escenarios, en ese orden, con 20 y 10 generaciones

#### Scenario: Exportar e importar
- **WHEN** se exporta un cerebro entrenado en el gran premio y se lo vuelve a importar
- **THEN** conserva la pista en sus datos
