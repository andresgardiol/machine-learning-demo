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

### Requirement: Escenario ajustable
El borde entre el escenario y el tablero SHALL poder arrastrarse con el mouse
y moverse con el teclado para repartir el ancho entre los dos. El escenario
SHALL medir 400 píxeles por defecto y 260 como mínimo; en Inspeccionar, donde
esa zona es de la red, lo que sobra por defecto y 600 como mínimo. MUST NOT
dejar al tablero con menos de 360 píxeles. El borde SHALL tener un tooltip, en
español y en inglés, y el ancho elegido SHALL recordarse entre visitas.

#### Scenario: Estado por defecto
- **WHEN** una persona abre la aplicación por primera vez en una ventana de 1440 píxeles de ancho
- **THEN** el escenario mide 400 píxeles, el panel 360 y el tablero ocupa el resto

#### Scenario: Agrandar el escenario
- **WHEN** la persona arrastra el borde del escenario hacia la derecha
- **THEN** el escenario se agranda, el tablero se achica, el panel no cambia y la simulación sigue sin cambios

#### Scenario: Límites del escenario
- **WHEN** la persona arrastra el borde del escenario más allá de sus límites en una ventana de 1440 píxeles con el panel en 360
- **THEN** el escenario queda en 260 píxeles como mínimo y en 708 como máximo, con el tablero en 360

#### Scenario: Con el teclado
- **WHEN** la persona llega al borde del escenario con la tecla Tab y presiona la flecha derecha
- **THEN** el escenario se agranda y el auto no gira

#### Scenario: Volver al ancho inicial
- **WHEN** la persona hace doble clic en el borde del escenario
- **THEN** el escenario vuelve a 400 píxeles

#### Scenario: Ancho recordado
- **WHEN** la persona achicó el escenario y vuelve a abrir la aplicación en el mismo navegador
- **THEN** el escenario tiene el ancho que había elegido

#### Scenario: Navegador sin almacenamiento
- **WHEN** el navegador impide guardar o leer preferencias
- **THEN** el escenario abre en 400 píxeles y el borde se puede mover igual

#### Scenario: Mínimo de la red en Inspeccionar
- **WHEN** la persona achica la zona izquierda en Inspeccionar todo lo que puede
- **THEN** queda en 600 píxeles, y en las otras pestañas el mínimo sigue siendo 260
