## MODIFIED Requirements

### Requirement: Disposición común
Toda pestaña con escenario, salvo Reglas a mano, SHALL mostrar el escenario a la izquierda, el
tablero al centro cuando la pestaña lo usa, y un panel de controles a la
derecha. En Inspeccionar y en Laboratorio, la zona izquierda muestra lo que la red mira (la escena del auto, o el plano y la tabla de los datos), la zona central es la red y es la más ancha, y el panel queda a la derecha. En todas, la barra de pestañas, el selector de idioma y
el interruptor de guía van siempre en el mismo lugar. El orden de lectura y
de foco con el teclado SHALL ser zona izquierda, zona central y panel.

#### Scenario: Disposición de la primera pestaña
- **WHEN** se muestra la primera pestaña en una ventana de 1440 píxeles de ancho
- **THEN** el escenario ocupa la zona izquierda, el tablero la zona central y el panel la zona derecha

#### Scenario: Misma disposición en Entrenar
- **WHEN** la persona pasa de El problema a Entrenar
- **THEN** las tres zonas conservan su lugar y su ancho

#### Scenario: Recorrido con el teclado
- **WHEN** la persona recorre la pestaña con la tecla Tab desde el escenario
- **THEN** el foco pasa primero por los controles del escenario, después por la zona central y al final por el panel

#### Scenario: Disposición de Inspeccionar
- **WHEN** la persona pasa de Competir a Inspeccionar
- **THEN** la escena del auto sigue a la izquierda, la red ocupa la zona central y es la más ancha, y el panel sigue a la derecha

#### Scenario: Volver de Inspeccionar
- **WHEN** la persona vuelve de Inspeccionar a Competir
- **THEN** el escenario y el tablero de Competir tienen los anchos que tenían antes de ir

#### Scenario: Disposición de Laboratorio
- **WHEN** la persona pasa de Inspeccionar a Laboratorio
- **THEN** las tres zonas conservan su lugar y su ancho: la izquierda muestra los datos (o la escena con Tu manejo) y las curvas, y el centro la red
