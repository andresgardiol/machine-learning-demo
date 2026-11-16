# Spec Delta

## ADDED Requirements

### Requirement: Cerebro que aprendió imitando
Un cerebro SHALL poder haber aprendido de ejemplos de manejo en vez de por
evolución. Sus datos MUST decirlo, con cuántos ejemplos y cuántas épocas, de
quién eran los ejemplos y en qué pista y con qué tráfico se tomaron, y MUST
tener cero generaciones. SHALL ser un cerebro como los demás: se guarda, se
exporta, se importa, maneja, compite y se inspecciona igual.

#### Scenario: Datos verdaderos
- **WHEN** se leen los datos de un cerebro guardado desde el Laboratorio
- **THEN** dicen que aprendió imitando, con cuántos ejemplos, cuántas épocas, de quién y en qué pista, y que no tiene generaciones

#### Scenario: Cerebro válido
- **WHEN** se valida un cerebro que aprendió imitando
- **THEN** es válido, igual que uno entrenado por evolución

#### Scenario: Versión anterior de la aplicación
- **WHEN** un cerebro que aprendió imitando se importa en una aplicación que no conoce esos datos
- **THEN** se importa como un cerebro válido sin generaciones

#### Scenario: En la biblioteca
- **WHEN** la persona mira un cerebro que aprendió imitando en la lista de cerebros
- **THEN** sus datos dicen "aprendió imitando" con la pista, en lugar de las generaciones

#### Scenario: Seguir entrenando
- **WHEN** la persona continúa en Entrenar un cerebro que aprendió imitando
- **THEN** el entrenamiento arranca de su red, como con cualquier otro cerebro
