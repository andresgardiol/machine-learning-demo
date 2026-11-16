# Spec Delta

## MODIFIED Requirements

### Requirement: Aparición y cierre del tooltip
Con las ayudas encendidas, el tooltip SHALL aparecer tras una espera al posar
el cursor, y siempre al enfocar el control con el teclado. SHALL cerrarse al
retirar el cursor del control y del tooltip, al quitar el foco, con Escape o
al apretar el control. Un área de escritura de varias líneas MUST mostrarlo
solo al llegar con el teclado y cerrarlo apenas se escribe o se hace clic.

#### Scenario: Cursor de paso
- **WHEN** el cursor cruza un control sin detenerse
- **THEN** no aparece ningún tooltip

#### Scenario: Espera con la guía encendida
- **WHEN** la guía y las ayudas están encendidas y la persona deja el cursor quieto sobre un control
- **THEN** su tooltip aparece a los 0,7 segundos

#### Scenario: Espera con la guía apagada
- **WHEN** la guía está apagada, las ayudas encendidas y la persona deja el cursor quieto sobre un control
- **THEN** su tooltip aparece a los 0,7 segundos

#### Scenario: Apretar antes de que aparezca
- **WHEN** la persona posa el cursor sobre un botón, lo aprieta antes de que aparezca el tooltip y deja el cursor ahí
- **THEN** el tooltip no aparece, por más que el cursor siga quieto

#### Scenario: Apretar con el tooltip a la vista
- **WHEN** hay un tooltip a la vista y la persona aprieta su control
- **THEN** el tooltip se cierra y no vuelve mientras el cursor siga sobre ese control

#### Scenario: Volver a pedirlo
- **WHEN** después de apretar un control la persona saca el cursor y lo vuelve a posar sobre él
- **THEN** el tooltip aparece con la espera de siempre

#### Scenario: Arrastrar un deslizador
- **WHEN** la persona arrastra un deslizador durante dos segundos, pasando el cursor sobre otros controles
- **THEN** no aparece ningún tooltip hasta que suelta

#### Scenario: Foco con teclado
- **WHEN** las ayudas están encendidas y la persona llega a un control con la tecla Tab
- **THEN** aparece su tooltip

#### Scenario: Cerrar con Escape
- **WHEN** hay un tooltip visible y la persona presiona Escape
- **THEN** el tooltip se cierra

#### Scenario: Cursor sobre un área de escritura
- **WHEN** la persona deja el cursor sobre el editor del programa o hace clic en él
- **THEN** no aparece ningún tooltip y lo que está debajo del editor sigue a la vista

#### Scenario: Escribir cierra el tooltip
- **WHEN** la persona llegó al editor con Tab, ve su tooltip y escribe una letra
- **THEN** el tooltip se cierra

#### Scenario: Llevar el cursor al tooltip
- **WHEN** hay un tooltip visible y la persona mueve el cursor desde el control hasta el tooltip
- **THEN** el tooltip sigue a la vista mientras el cursor está sobre él, y se puede seleccionar su texto

#### Scenario: Salir del tooltip
- **WHEN** el cursor sale del tooltip sin volver al control
- **THEN** el tooltip se cierra

### Requirement: Apretar un control sin acción lo explica
Al apretar un control sin acción, su tooltip SHALL aparecer en el momento, sin
espera, con las ayudas encendidas o apagadas, y en español o en inglés según
el idioma activo. SHALL cerrarse como cualquier otro.

#### Scenario: Clic en un botón sin acción
- **WHEN** la persona hace clic en un botón sin acción
- **THEN** su tooltip aparece en el momento y dice por qué no se puede usar

#### Scenario: Se cierra
- **WHEN** el tooltip apareció por un clic y la persona saca el cursor o presiona Escape
- **THEN** el tooltip se cierra

#### Scenario: Con las ayudas apagadas
- **WHEN** las ayudas están apagadas y la persona hace clic en un botón sin acción, o presiona Enter con el foco en él
- **THEN** su tooltip aparece en el momento y dice por qué no se puede usar

## ADDED Requirements

### Requirement: Tooltips con las ayudas apagadas
Con las ayudas apagadas, los tooltips MUST NOT aparecer al posar el cursor ni
al llegar con el teclado, en ningún control, salvo el del interruptor de
ayudas. La guía MUST NOT cambiar si aparecen o no. Encender las ayudas MUST
devolver el comportamiento de siempre en el momento, sin recargar.

#### Scenario: Estado por defecto
- **WHEN** una persona abre la aplicación por primera vez y posa el cursor sobre un control
- **THEN** aparece su tooltip, porque las ayudas están encendidas

#### Scenario: Cursor sobre un control
- **WHEN** las ayudas están apagadas y la persona deja el cursor quieto sobre un botón, un deslizador o un interruptor
- **THEN** no aparece ningún tooltip

#### Scenario: Con Tab tampoco
- **WHEN** las ayudas están apagadas y la persona llega a un control con Tab
- **THEN** no aparece ningún tooltip

#### Scenario: Control sin acción al posar el cursor
- **WHEN** las ayudas están apagadas y la persona posa el cursor sobre un control sin acción
- **THEN** no aparece ningún tooltip; aparece si lo aprieta

#### Scenario: El interruptor de ayudas se explica siempre
- **WHEN** las ayudas están apagadas y la persona posa el cursor sobre el interruptor de ayudas o llega a él con Tab
- **THEN** aparece su tooltip, que dice que al encenderlo vuelven las explicaciones

#### Scenario: Tooltip a la vista al apagar
- **WHEN** hay un tooltip a la vista y la persona apaga las ayudas
- **THEN** ese tooltip se cierra

#### Scenario: La guía no las gobierna
- **WHEN** la guía está apagada y las ayudas encendidas, y la persona posa el cursor sobre un control
- **THEN** aparece su tooltip

#### Scenario: Guía encendida y ayudas apagadas
- **WHEN** la guía está encendida y las ayudas apagadas
- **THEN** los textos de guía y las misiones siguen a la vista y ningún tooltip aparece

#### Scenario: Volver a encender
- **WHEN** la persona enciende las ayudas y posa el cursor sobre un control
- **THEN** su tooltip aparece como antes de apagarlas

#### Scenario: Todo control conserva su ayuda
- **WHEN** se corre la verificación de tooltips con las ayudas apagadas
- **THEN** no informa ningún control sin ayuda

## REMOVED Requirements

### Requirement: Tooltips con la guía apagada
**Reason**: Ataba los tooltips al interruptor de guía. Quien quería la guía sin tooltips, o al revés, no podía.
**Migration**: Lo reemplaza "Tooltips con las ayudas apagadas", con un interruptor propio. Quien tenía la guía apagada abre con las ayudas apagadas.
