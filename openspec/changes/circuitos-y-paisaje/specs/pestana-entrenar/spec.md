# Spec Delta

## ADDED Requirements

### Requirement: Pistas del entrenamiento
La sección avanzada SHALL ofrecer, en el grupo del escenario, las cuatro
pistas del catálogo para marcar una o varias, con la calle recta sola por
defecto. MUST quedar siempre al menos una marcada. Los cambios SHALL regir
desde la generación siguiente, con la misma indicación que los demás ajustes.
El ajuste SHALL tener un tooltip que diga qué hace y por qué importa, en
español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña y se despliega la sección avanzada
- **THEN** solo la calle recta está marcada

#### Scenario: Marcar un circuito
- **WHEN** la persona marca el óvalo además de la calle recta durante una generación
- **THEN** aparece la indicación de cambios pendientes y, desde la generación siguiente, las generaciones alternan entre la calle recta y el óvalo

#### Scenario: Última pista marcada
- **WHEN** la persona intenta desmarcar la única pista marcada
- **THEN** sigue marcada y su tooltip explica que hace falta al menos una

#### Scenario: Restablecer
- **WHEN** la persona marcó tres pistas y presiona restablecer
- **THEN** desde la generación siguiente vuelve a entrenarse solo en la calle recta, sin reiniciar el entrenamiento

#### Scenario: Tooltip
- **WHEN** la persona posa el cursor sobre las pistas del entrenamiento
- **THEN** el tooltip explica que con varias pistas cada generación corre en una distinta, y que practicar en situaciones distintas ayuda a que lo aprendido sirva en pistas nuevas

### Requirement: Generación en un circuito
Mientras una generación corre en un circuito, la pestaña SHALL mostrar el
nombre de la pista junto al número de generación sobre el escenario, y el
cuarto indicador del tablero SHALL pasar a mostrar las vueltas del líder, con
un decimal. Si ninguna pista marcada es la calle recta, los ajustes de
carriles, densidad, irregularidad y modo de tráfico SHALL verse deshabilitados
y explicar que en un circuito no hay tráfico.

#### Scenario: Pista a la vista
- **WHEN** la generación 12 corre en el óvalo
- **THEN** sobre el escenario se lee el número de generación y que la pista es el óvalo

#### Scenario: Indicador de vueltas
- **WHEN** el líder lleva una vuelta y cuarto del óvalo
- **THEN** el cuarto indicador se llama "Vueltas del líder" y muestra 1,2: un decimal, redondeado hacia abajo

#### Scenario: Vuelta a la calle
- **WHEN** la generación siguiente corre en la calle recta
- **THEN** el cuarto indicador vuelve a ser el de vehículos superados por el líder

#### Scenario: Solo circuitos
- **WHEN** las pistas marcadas son el óvalo y el riñón
- **THEN** carriles, densidad, irregularidad y modo de tráfico están deshabilitados, con su explicación, y conservan sus valores

#### Scenario: Curva con varias pistas
- **WHEN** el entrenamiento alterna la calle recta y el óvalo
- **THEN** la curva de fitness sigue siendo una sola, en metros de ventaja, y su renglón de ayuda dice que cada generación corre en una pista distinta

### Requirement: Ver como la máquina
La pestaña SHALL ofrecer, junto al interruptor de los sensores del líder, un
modo apagado por defecto que oculta la pista, el tráfico, el paisaje y los
demás autos, y deja a la vista solo al líder con sus rayos: lo único que
recibe la red que se ve en el tablero. El modo MUST NOT cambiar el
entrenamiento. El interruptor SHALL tener un tooltip que diga qué hace y por
qué importa, en español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** el modo está apagado y se ven la pista, el tráfico, el paisaje y toda la población

#### Scenario: Activar el modo
- **WHEN** la persona activa el modo ver como la máquina
- **THEN** en el escenario quedan solo el líder y sus rayos, aunque los sensores del líder estuvieran ocultos, y el tablero sigue mostrando los indicadores, la curva y la red

#### Scenario: Cambio de líder
- **WHEN** el líder choca con el modo activo y pasa a ser líder otro auto
- **THEN** el escenario pasa a mostrar a ese auto y sus rayos, sin mostrar la pista

#### Scenario: Entre generaciones
- **WHEN** termina una generación con el modo activo
- **THEN** la generación siguiente se ve del mismo modo, con el número de generación a la vista

#### Scenario: Desactivar el modo
- **WHEN** la persona desactiva el modo
- **THEN** la pista, el tráfico, el paisaje y la población vuelven a verse y el entrenamiento continúa

#### Scenario: El entrenamiento sigue igual
- **WHEN** se repite un entrenamiento con la misma semilla, una vez con el modo activo y otra con el modo apagado
- **THEN** el mejor fitness de cada generación es el mismo

#### Scenario: Tooltip
- **WHEN** la persona posa el cursor sobre el interruptor
- **THEN** un tooltip en el idioma activo explica que deja solo lo que percibe el líder, y que con esas pocas lecturas decide la red del tablero

#### Scenario: Panel sin desplazarse
- **WHEN** se abre la pestaña en 1440×900 con el interruptor nuevo
- **THEN** el panel se ve completo sin desplazarse
