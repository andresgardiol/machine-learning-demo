# Spec Delta

## ADDED Requirements

### Requirement: Elegir la pista
La pestaña SHALL ofrecer el mismo selector de pista que El problema, con la
calle recta elegida por defecto. Cambiar de pista MUST reiniciar el intento
con el mismo programa. En un circuito SHALL valer lo mismo que en El
problema: indicador de vueltas, ajustes de tráfico deshabilitados con su
explicación y misiones ocultas.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la pista elegida es la calle recta y el programa inicial maneja como antes

#### Scenario: Programa en un circuito
- **WHEN** la persona elige el óvalo
- **THEN** su programa pasa a manejar el auto en el óvalo desde la línea de salida, y las líneas que se cumplen se siguen resaltando

#### Scenario: Reintento en un circuito
- **WHEN** el auto choca en un circuito con el reintento automático encendido
- **THEN** vuelve a salir de la línea de salida del mismo circuito

#### Scenario: Volver a la calle
- **WHEN** la persona vuelve a elegir la calle recta o restablece el programa
- **THEN** el intento se reinicia en la calle recta

### Requirement: Ejemplos en la calle recta
Los programas de ejemplo son para la calle recta. Cargar un ejemplo con un
circuito elegido SHALL volver a la calle recta, además de cambiar el programa
y los sensores, y la confirmación MUST avisarlo.

#### Scenario: Cargar un ejemplo desde un circuito
- **WHEN** la persona carga el ejemplo de 7 sensores con el óvalo elegido
- **THEN** la pista vuelve a ser la calle recta y el ejemplo maneja ahí

#### Scenario: Aviso
- **WHEN** la persona pide cargar un ejemplo con un circuito elegido
- **THEN** el pedido de confirmación dice que el ejemplo es para la calle recta y que se va a volver a ella

### Requirement: Ver como la máquina
La pestaña SHALL ofrecer, junto al interruptor de los sensores, un modo
apagado por defecto que oculta la pista, el tráfico y el paisaje y deja a la
vista solo el auto, sus rayos y las barras del tablero: lo único que el
programa recibe. El interruptor SHALL tener un tooltip que diga qué hace y por
qué importa, en español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** el modo está apagado y se ven la pista, el tráfico y el paisaje

#### Scenario: Activar el modo
- **WHEN** la persona activa el modo ver como la máquina
- **THEN** dejan de verse la pista, el tráfico y el paisaje, y siguen visibles el auto, sus rayos y las barras, aunque los sensores estuvieran ocultos

#### Scenario: Chocar sin ver
- **WHEN** el auto choca con el modo activo
- **THEN** la pista y el tráfico vuelven a mostrarse junto con el aviso del choque, y se ocultan otra vez cuando empieza el intento siguiente

#### Scenario: Desactivar el modo
- **WHEN** la persona desactiva el modo
- **THEN** la pista, el tráfico y el paisaje vuelven a verse y el intento continúa

#### Scenario: El programa sigue igual
- **WHEN** se repite un intento con el modo activo y con el modo apagado
- **THEN** el auto hace exactamente lo mismo: el modo solo cambia lo que se dibuja

#### Scenario: Tooltip
- **WHEN** la persona posa el cursor sobre el interruptor
- **THEN** un tooltip en el idioma activo explica que oculta todo menos lo que el programa recibe, y que con esos pocos números se escriben las reglas
