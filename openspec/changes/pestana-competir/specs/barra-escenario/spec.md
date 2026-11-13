# Spec Delta

## MODIFIED Requirements

### Requirement: Barra de escenario
Toda pestaña con escenario SHALL mostrar, debajo del encabezado y a todo el
ancho, una barra con los ajustes de su escenario en este orden: pista; tráfico
(carriles, densidad e irregularidad); sensores (cantidad, alcance y apertura);
velocidad máxima del auto; y restablecer. Un grupo que no tiene efecto en una
pestaña no se muestra en ella. Los que se muestran MUST estar a la vista sin
desplegar nada, con su nombre y su valor. La barra muestra los valores de la
pestaña a la vista.

#### Scenario: Estado por defecto
- **WHEN** se abre la aplicación
- **THEN** la barra muestra la calle recta elegida, 3 carriles, densidad 50 %, los 5 sensores de 3 largos y 90 grados y la velocidad de 20 m/s, sin que haya que abrir nada

#### Scenario: Mismo lugar en las tres pestañas
- **WHEN** la persona pasa de El problema a Reglas a mano y a Entrenar
- **THEN** la barra está en el mismo lugar, con los mismos controles en el mismo orden

#### Scenario: Valores de cada pestaña
- **WHEN** la persona pone 4 carriles en El problema y abre Entrenar
- **THEN** la barra muestra los carriles de Entrenar, y al volver a El problema siguen siendo 4

#### Scenario: Un renglón
- **WHEN** la ventana mide 1366 píxeles de ancho o más, en español o en inglés
- **THEN** la barra ocupa un solo renglón, sin texto cortado

#### Scenario: Ventana más angosta
- **WHEN** la ventana mide menos de 1366 píxeles de ancho
- **THEN** la barra pasa a dos renglones, con todos sus controles a la vista

#### Scenario: Mismo orden en Competir
- **WHEN** la persona pasa de Entrenar a Competir
- **THEN** la barra está en el mismo lugar, con la pista, el tráfico, la velocidad y restablecer en el mismo orden, sin el grupo de sensores

## ADDED Requirements

### Requirement: Grupo que no aplica en una pestaña
Un grupo de la barra que no tiene efecto en una pestaña SHALL NOT mostrarse en
ella, para no ocupar lugar con algo que no sirve. Los demás grupos MUST
conservar su orden. En Competir no se muestra el grupo de sensores, porque
cada competidor trae los suyos.

#### Scenario: Sensores en Competir
- **WHEN** la persona abre Competir
- **THEN** la barra no muestra el grupo de sensores, ni un hueco en su lugar

#### Scenario: Vuelve a aplicar
- **WHEN** la persona pasa de Competir a El problema
- **THEN** el grupo de sensores vuelve a estar en la barra, con los valores de El problema

#### Scenario: Restablecer sin sensores
- **WHEN** la persona restablece el escenario en Competir
- **THEN** vuelven a sus valores por defecto la pista, el tráfico y la velocidad, y los sensores de las otras pestañas no cambian

### Requirement: Grupo propio de una pestaña
Una pestaña SHALL poder sumar a la barra un grupo de ajustes propio de su
escenario, con el mismo aspecto, tooltips y accesibilidad que los demás. En
Competir es la meta de la carrera, en el lugar que dejan los sensores. Las
demás pestañas MUST NOT mostrarlo.

#### Scenario: Meta en Competir
- **WHEN** la persona abre Competir
- **THEN** la barra muestra, entre el tráfico y la velocidad, el grupo de la meta de la carrera

#### Scenario: Solo en Competir
- **WHEN** la persona pasa de Competir a Entrenar
- **THEN** la barra no muestra la meta y vuelve a mostrar los sensores

#### Scenario: Un renglón con la meta
- **WHEN** la ventana mide 1366 píxeles de ancho o más y la pestaña es Competir, en español o en inglés
- **THEN** la barra ocupa un solo renglón, sin texto cortado
