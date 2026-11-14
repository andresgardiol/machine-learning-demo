# Spec Delta

## MODIFIED Requirements

### Requirement: Grupo propio de una pestaña
Una pestaña SHALL poder sumar a la barra un grupo de ajustes propio de su
escenario, con el mismo aspecto, tooltips y accesibilidad que los demás. En
Competir es la meta de la carrera, en el lugar que dejan los sensores; en
Laboratorio, los datos con los que aprende la red. Las demás pestañas MUST
NOT mostrarlos.

#### Scenario: Meta en Competir
- **WHEN** la persona abre Competir
- **THEN** la barra muestra, entre el tráfico y la velocidad, el grupo de la meta de la carrera

#### Scenario: Solo en Competir
- **WHEN** la persona pasa de Competir a Entrenar
- **THEN** la barra no muestra la meta y vuelve a mostrar los sensores

#### Scenario: Un renglón con la meta
- **WHEN** la ventana mide 1366 píxeles de ancho o más y la pestaña es Competir, en español o en inglés
- **THEN** la barra ocupa un solo renglón, sin texto cortado

#### Scenario: Datos en Laboratorio
- **WHEN** la persona abre Laboratorio
- **THEN** la barra empieza por la elección de los datos, puntos o tu manejo, y sigue con los ajustes de los datos elegidos

#### Scenario: Barra de puntos
- **WHEN** en Laboratorio los datos son puntos
- **THEN** la barra muestra la forma, el ruido y la cantidad, y no muestra pista, tráfico, sensores ni velocidad

#### Scenario: Barra de manejo
- **WHEN** en Laboratorio los datos son tu manejo
- **THEN** la barra muestra la pista, el tráfico y la velocidad, y no muestra los ajustes de los puntos ni los sensores

#### Scenario: Un renglón en Laboratorio
- **WHEN** la ventana mide 1366 píxeles de ancho o más, con cualquiera de las dos clases de datos, en español o en inglés
- **THEN** la barra ocupa un solo renglón, sin texto cortado
