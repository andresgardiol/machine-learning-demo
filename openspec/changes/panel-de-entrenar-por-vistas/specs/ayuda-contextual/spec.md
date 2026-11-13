# Spec Delta

## MODIFIED Requirements

### Requirement: Aparición y cierre del tooltip
El tooltip SHALL aparecer tras una breve espera al posar el cursor sobre el
control y también al enfocarlo con el teclado, y SHALL cerrarse al retirar el
cursor del control y del propio tooltip, al quitar el foco o al presionar Escape. Un área donde se escribe
texto de varias líneas es la excepción: su tooltip SHALL aparecer solo al
llegar a ella con el teclado y SHALL cerrarse apenas la persona escribe o hace
clic en ella, para no tapar lo que la rodea mientras se trabaja.

#### Scenario: Cursor de paso
- **WHEN** el cursor cruza un control sin detenerse
- **THEN** no aparece ningún tooltip

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
