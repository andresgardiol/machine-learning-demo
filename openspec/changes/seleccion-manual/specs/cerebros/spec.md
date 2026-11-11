# Spec Delta

## MODIFIED Requirements

### Requirement: Datos de entrenamiento
Un cerebro SHALL registrar cuántas generaciones se entrenó en total, la función
de fitness y el mejor fitness de su última generación, la configuración de
evolución usada, incluido el modo de selección, la velocidad máxima del auto,
la semilla y la lista de escenarios que vio (carriles, densidad, irregularidad
y modo de tráfico) con las generaciones entrenadas en cada uno. Un cerebro que
no registra el modo de selección MUST considerarse de selección automática.

#### Scenario: Dos escenarios
- **WHEN** un cerebro se entrena 30 generaciones en una calle de 3 carriles y luego 20 en una de 4 carriles
- **THEN** registra 50 generaciones en total y dos escenarios, con 30 y 20 generaciones

#### Scenario: Mismo escenario seguido
- **WHEN** un cerebro se entrena 10 generaciones, se guarda, se carga y se entrena 5 más en el mismo escenario
- **THEN** registra 15 generaciones y un solo escenario con 15 generaciones

#### Scenario: Cerebro elegido a mano
- **WHEN** se guarda al padre elegido de un entrenamiento con selección manual y la persona despliega ese cerebro en la biblioteca
- **THEN** entre sus datos se lee que la selección fue manual, y su mejor fitness es el que llevaba cuando se lo eligió

#### Scenario: Cerebro guardado antes de este cambio
- **WHEN** la persona despliega o importa un cerebro que no registra el modo de selección
- **THEN** el cerebro es válido y se muestra como de selección automática

### Requirement: Autoguardado
Al terminar cada generación, la aplicación SHALL guardar sola el cerebro del
entrenamiento en curso (el campeón o, con selección manual, el padre elegido),
reemplazando el autoguardado anterior de ese mismo entrenamiento. Al empezar
un entrenamiento nuevo, el último autoguardado del entrenamiento que se
abandona MUST conservarse como "entrenamiento anterior" hasta que se empiece
otro más.

#### Scenario: Recarga de la página
- **WHEN** la persona entrena 12 generaciones y recarga la página sin guardar
- **THEN** la biblioteca muestra un cerebro autoguardado con 12 generaciones

#### Scenario: Reinicio del entrenamiento
- **WHEN** la persona reinicia un entrenamiento de 30 generaciones y el nuevo completa su primera generación
- **THEN** la biblioteca muestra el autoguardado del entrenamiento en curso, con 1 generación, y el del entrenamiento anterior, con 30

#### Scenario: Conservar un autoguardado
- **WHEN** la persona guarda con nombre un cerebro autoguardado
- **THEN** pasa a ser un cerebro guardado que los entrenamientos siguientes no reemplazan

#### Scenario: Autoguardado con selección manual
- **WHEN** termina una generación con selección manual y un padre elegido
- **THEN** el autoguardado del entrenamiento en curso tiene la red del padre elegido

#### Scenario: Selección manual sin padre
- **WHEN** termina una generación con selección manual y sin padre elegido
- **THEN** el autoguardado que hubiera de ese entrenamiento queda como estaba
