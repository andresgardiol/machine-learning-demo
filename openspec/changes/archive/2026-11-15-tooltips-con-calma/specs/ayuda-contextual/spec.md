# Spec Delta

## MODIFIED Requirements

### Requirement: Tooltip en todo control
Todo control con el que se puede interactuar SHALL tener un tooltip con dos
partes diferenciadas: qué hace y por qué importa.

#### Scenario: Control con tooltip
- **WHEN** la guía está encendida y la persona posa el cursor sobre cualquier botón, interruptor, deslizador o pestaña
- **THEN** aparece un tooltip con las dos partes

#### Scenario: Control con tooltip, con el teclado
- **WHEN** la persona llega con Tab a cualquier botón, interruptor, deslizador o pestaña, con la guía encendida o apagada
- **THEN** aparece un tooltip con las dos partes

#### Scenario: Verificación de cobertura
- **WHEN** se ejecuta la verificación de tooltips sobre la aplicación abierta
- **THEN** no se reporta ningún control sin tooltip

### Requirement: Aparición y cierre del tooltip
Con la guía encendida, el tooltip SHALL aparecer tras una espera al posar el
cursor, y siempre al enfocar el control con el teclado. SHALL cerrarse al
retirar el cursor del control y del tooltip, al quitar el foco, con Escape o
al apretar el control. Un área de escritura de varias líneas MUST mostrarlo
solo al llegar con el teclado y cerrarlo apenas se escribe o se hace clic.

#### Scenario: Cursor de paso
- **WHEN** el cursor cruza un control sin detenerse
- **THEN** no aparece ningún tooltip

#### Scenario: Espera con la guía encendida
- **WHEN** la guía está encendida y la persona deja el cursor quieto sobre un control
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
- **WHEN** la persona llega a un control con la tecla Tab
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

## ADDED Requirements

### Requirement: Tooltips con la guía apagada
Con la guía apagada, los tooltips MUST NOT aparecer al posar el cursor, salvo
el del interruptor de guía y el de un control sin acción. SHALL seguir
apareciendo al llegar a cualquier control con el teclado. Encender la guía
MUST devolver el comportamiento de siempre en el momento, sin recargar.

#### Scenario: Estado por defecto
- **WHEN** una persona abre la aplicación por primera vez y posa el cursor sobre un control
- **THEN** aparece su tooltip, porque la guía está encendida

#### Scenario: Cursor sobre un control con la guía apagada
- **WHEN** la guía está apagada y la persona deja el cursor quieto sobre un botón habilitado
- **THEN** no aparece ningún tooltip

#### Scenario: Con Tab siguen apareciendo
- **WHEN** la guía está apagada y la persona llega a un control con Tab
- **THEN** aparece su tooltip

#### Scenario: El interruptor de guía se explica siempre
- **WHEN** la guía está apagada y la persona posa el cursor sobre el interruptor de guía
- **THEN** aparece su tooltip, que dice que al encenderla vuelven las ayudas

#### Scenario: Control sin acción con la guía apagada
- **WHEN** la guía está apagada y la persona posa el cursor sobre un control sin acción
- **THEN** aparece el tooltip que explica por qué no se puede usar

#### Scenario: Volver a encender
- **WHEN** la persona enciende la guía y posa el cursor sobre un control
- **THEN** su tooltip aparece como antes de apagarla

#### Scenario: Todo control conserva su ayuda
- **WHEN** se corre la verificación de tooltips con la guía apagada
- **THEN** no informa ningún control sin ayuda

### Requirement: Apretar un control sin acción lo explica
Al apretar un control sin acción, su tooltip SHALL aparecer en el momento, sin
espera, con la guía encendida o apagada, y en español o en inglés según el
idioma activo. SHALL cerrarse como cualquier otro.

#### Scenario: Clic en un botón sin acción
- **WHEN** la persona hace clic en un botón sin acción
- **THEN** su tooltip aparece en el momento y dice por qué no se puede usar

#### Scenario: Se cierra
- **WHEN** el tooltip apareció por un clic y la persona saca el cursor o presiona Escape
- **THEN** el tooltip se cierra
