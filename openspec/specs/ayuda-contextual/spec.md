# ayuda-contextual Specification

## Purpose

Hace que la aplicación se explique sola: cada control dice, en el momento en
que se lo mira, qué hace y por qué importa, para que quien la usa por primera
vez no necesite a nadie al lado.

## Requirements

### Requirement: Tooltip en todo control
Todo control con el que se puede interactuar SHALL tener un tooltip con dos
partes diferenciadas: qué hace y por qué importa.

#### Scenario: Control con tooltip
- **WHEN** la persona posa el cursor sobre cualquier botón, interruptor, deslizador o pestaña
- **THEN** aparece un tooltip con las dos partes

#### Scenario: Verificación de cobertura
- **WHEN** se ejecuta la verificación de tooltips sobre la aplicación abierta
- **THEN** no se reporta ningún control sin tooltip

### Requirement: Aparición y cierre del tooltip
El tooltip SHALL aparecer tras una breve espera al posar el cursor sobre el
control y también al enfocarlo con el teclado, y SHALL cerrarse al retirar el
cursor, al quitar el foco o al presionar Escape. Un área donde se escribe
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

### Requirement: Ubicación del tooltip
El tooltip SHALL mostrarse completo dentro de la ventana y sin tapar el control
que explica.

#### Scenario: Control junto al borde
- **WHEN** aparece el tooltip de un control ubicado junto al borde derecho de la ventana
- **THEN** el tooltip se ve completo y el control sigue visible

### Requirement: Tooltips en el idioma activo
Los tooltips SHALL mostrarse en el idioma activo y cambiar con él de inmediato.

#### Scenario: Cambio de idioma
- **WHEN** la persona cambia a inglés y posa el cursor sobre un control
- **THEN** el tooltip aparece en inglés

### Requirement: Controles no disponibles explicados
Un control deshabilitado SHALL conservar su tooltip, que MUST explicar por qué
no está disponible.

#### Scenario: Control deshabilitado
- **WHEN** la persona posa el cursor sobre un control deshabilitado
- **THEN** el tooltip explica por qué no puede usarse

### Requirement: Lenguaje llano
Los tooltips SHALL escribirse en lenguaje llano. Cuando un tooltip usa un
término técnico, MUST usar su nombre real y definirlo en el mismo tooltip.

#### Scenario: Término técnico
- **WHEN** un tooltip menciona un término técnico como "sensor" o "semilla"
- **THEN** el mismo tooltip explica en palabras simples qué significa
