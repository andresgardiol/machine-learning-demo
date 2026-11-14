# Spec Delta

## MODIFIED Requirements

### Requirement: Pestañas del recorrido
La aplicación SHALL mostrar una barra con las seis pestañas del recorrido, en
este orden: El problema, Reglas a mano, Entrenar, Competir, Inspeccionar y
Laboratorio. Las pestañas El problema, Reglas a mano, Entrenar, Competir e
Inspeccionar SHALL estar disponibles. Las pestañas aún no disponibles MUST verse como no disponibles y
no poder abrirse.

#### Scenario: Recorrido visible
- **WHEN** se abre la aplicación
- **THEN** la barra muestra las seis pestañas en orden y la primera está activa

#### Scenario: Abrir Entrenar
- **WHEN** la persona elige la pestaña Entrenar
- **THEN** Entrenar pasa a ser la pestaña activa y muestra su escenario y su panel

#### Scenario: Abrir Reglas a mano
- **WHEN** la persona elige la pestaña Reglas a mano
- **THEN** Reglas a mano pasa a ser la pestaña activa y muestra su escenario, su tablero con el editor y su panel

#### Scenario: Pestaña no disponible
- **WHEN** la persona intenta abrir una pestaña no disponible
- **THEN** la pestaña activa no cambia

#### Scenario: Explicación de una pestaña no disponible
- **WHEN** la persona posa el cursor sobre una pestaña no disponible
- **THEN** un tooltip indica que llegará próximamente y qué va a enseñar

#### Scenario: Explicación de una pestaña disponible
- **WHEN** la persona posa el cursor sobre la pestaña Entrenar
- **THEN** un tooltip indica qué se hace en ella y por qué importa, sin decir que llegará próximamente

#### Scenario: Explicación de Reglas a mano
- **WHEN** la persona posa el cursor sobre la pestaña Reglas a mano
- **THEN** un tooltip indica que ahí se programa el auto con reglas escritas a mano y por qué eso deja de alcanzar, sin decir que llegará próximamente

#### Scenario: Abrir Competir
- **WHEN** la persona elige la pestaña Competir
- **THEN** Competir pasa a ser la pestaña activa y muestra su barra de escenario, su escenario, su tablero y su panel

#### Scenario: Explicación de Competir
- **WHEN** la persona posa el cursor sobre la pestaña Competir
- **THEN** un tooltip indica que ahí se comparan cerebros, reglas y personas en pistas vistas y no vistas, y por qué eso muestra si algo generaliza, sin decir que llegará próximamente

#### Scenario: Abrir Inspeccionar
- **WHEN** la persona elige la pestaña Inspeccionar
- **THEN** Inspeccionar pasa a ser la pestaña activa y muestra su barra de escenario, la red, su tablero y su panel

#### Scenario: Explicación de Inspeccionar
- **WHEN** la persona posa el cursor sobre la pestaña Inspeccionar
- **THEN** un tooltip indica que ahí se mira una red por dentro mientras maneja, y por qué eso muestra qué aprendió, sin decir que llegará próximamente

### Requirement: Disposición común
Toda pestaña con escenario SHALL mostrar el escenario a la izquierda, el
tablero al centro cuando la pestaña lo usa, y un panel de controles a la
derecha. En Inspeccionar, la zona izquierda es de la red y es la más ancha,
y el escenario va chico, en un tablero angosto. En todas, la barra de pestañas, el selector de idioma y
el interruptor de guía van siempre en el mismo lugar. El orden de lectura y
de foco con el teclado SHALL ser zona izquierda, tablero y panel.

#### Scenario: Disposición de la primera pestaña
- **WHEN** se muestra la primera pestaña en una ventana de 1440 píxeles de ancho
- **THEN** el escenario ocupa la zona izquierda, el tablero la zona central y el panel la zona derecha

#### Scenario: Misma disposición en Entrenar
- **WHEN** la persona pasa de El problema a Entrenar
- **THEN** las tres zonas conservan su lugar y su ancho

#### Scenario: Recorrido con el teclado
- **WHEN** la persona recorre la pestaña con la tecla Tab desde el escenario
- **THEN** el foco pasa primero por los controles del escenario, después por el tablero y al final por el panel

#### Scenario: Disposición de Inspeccionar
- **WHEN** la persona pasa de Competir a Inspeccionar
- **THEN** las tres zonas conservan su lugar, la izquierda muestra la red y pasa a ser la más ancha, y el tablero, angosto, muestra la escena del auto

#### Scenario: Volver de Inspeccionar
- **WHEN** la persona vuelve de Inspeccionar a Competir
- **THEN** el escenario y el tablero de Competir tienen los anchos que tenían antes de ir
