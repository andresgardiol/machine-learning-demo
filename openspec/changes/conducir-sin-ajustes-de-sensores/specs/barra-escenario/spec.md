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
- **THEN** la barra muestra la calle recta elegida, 3 carriles, densidad 50 % y la velocidad de 20 m/s, sin que haya que abrir nada y sin el grupo de sensores, porque la primera pestaña es El problema

#### Scenario: Mismo lugar en las tres pestañas
- **WHEN** la persona pasa de El problema a Reglas a mano y a Entrenar
- **THEN** la barra está en el mismo lugar, con los mismos controles en el mismo orden, y en Reglas a mano y en Entrenar suma el grupo de sensores

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

### Requirement: Grupo que no aplica en una pestaña
Un grupo de la barra que no tiene efecto en una pestaña SHALL NOT mostrarse en
ella, para no ocupar lugar con algo que no sirve. Los demás grupos MUST
conservar su orden. El grupo de sensores no se muestra en El problema, donde
maneja una persona con el teclado, ni en Competir, donde cada competidor trae
los suyos.

#### Scenario: Sensores en Competir
- **WHEN** la persona abre Competir
- **THEN** la barra no muestra el grupo de sensores, ni un hueco en su lugar

#### Scenario: Vuelve a aplicar
- **WHEN** la persona pasa de Competir a Reglas a mano
- **THEN** el grupo de sensores vuelve a estar en la barra, con los valores de Reglas a mano

#### Scenario: Sensores en El problema
- **WHEN** la persona abre El problema
- **THEN** la barra no muestra el grupo de sensores, ni un hueco en su lugar

#### Scenario: Restablecer sin sensores
- **WHEN** la persona restablece el escenario en Competir
- **THEN** vuelven a sus valores por defecto la pista, el tráfico y la velocidad, y los sensores de las otras pestañas no cambian
