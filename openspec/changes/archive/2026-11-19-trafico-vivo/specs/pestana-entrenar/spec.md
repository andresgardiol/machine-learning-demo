## MODIFIED Requirements

### Requirement: Misiones
Con la guía activa, el panel SHALL mostrar cuatro misiones con su progreso:
llegar a la generación 5, lograr un auto que supere 5 vehículos, guardar un
cerebro y terminar una generación con otra función de fitness. La lista
completa SHALL ir al final de la vista de entrenamiento, dentro de un renglón
plegable que dice cuántas misiones van cumplidas de cuántas ("Todas las
misiones · 1 de 4"), plegado por defecto. Abrirlo o cerrarlo SHALL recordarse
hasta cerrar la aplicación y MUST NOT cambiar el entrenamiento. El renglón
SHALL tener un tooltip que diga qué hace y por qué importa, en español y en
inglés. Las misiones MUST NOT bloquear ninguna función y una misión cumplida
SHALL seguir marcada hasta cerrar la aplicación. Cada misión SHALL leerse en
un solo renglón con el panel en su ancho por defecto.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña por primera vez con la guía activa
- **THEN** la tarjeta de consigna muestra la misión en curso y, al final del panel, se ve el renglón "Todas las misiones · 0 de 4" plegado

#### Scenario: Desplegar la lista
- **WHEN** la persona toca el renglón de las misiones
- **THEN** se ven las cuatro misiones con su progreso, con la misión en curso marcada también por algo que no es el color

#### Scenario: Volver a plegar
- **WHEN** la persona vuelve a tocar el renglón con la lista abierta
- **THEN** la lista se pliega, el renglón sigue diciendo cuántas van cumplidas y el entrenamiento no cambió

#### Scenario: Lista recordada
- **WHEN** la persona despliega la lista, abre otra pestaña de la aplicación y vuelve a Entrenar
- **THEN** la lista sigue desplegada

#### Scenario: Cuenta al día con la lista plegada
- **WHEN** la persona guarda su primer cerebro con la lista plegada
- **THEN** el renglón pasa a decir una misión cumplida más, sin desplegarse

#### Scenario: Tooltip del renglón
- **WHEN** la persona posa el cursor sobre el renglón de las misiones
- **THEN** un tooltip en el idioma activo dice qué hace y por qué importa

#### Scenario: Progreso de una misión
- **WHEN** el entrenamiento está en la generación 3
- **THEN** la primera misión muestra 3 de 5

#### Scenario: Misión cumplida
- **WHEN** la persona guarda su primer cerebro
- **THEN** la misión de guardar un cerebro queda marcada como cumplida y sigue marcada tras reiniciar el entrenamiento

#### Scenario: Misión de la función de fitness
- **WHEN** la persona elige una función de fitness distinta de la ventaja sobre el tráfico y termina una generación con ella
- **THEN** la misión queda marcada como cumplida

#### Scenario: Misiones de un renglón
- **WHEN** el panel mide 360 píxeles de ancho, la lista está desplegada y la aplicación está en español o en inglés
- **THEN** el nombre de cada misión y su estado se leen en el mismo renglón

#### Scenario: Misión de superar vehículos
- **WHEN** el líder lleva superados 3 vehículos y hasta ahora ningún auto había superado más
- **THEN** la misión de superar vehículos muestra 3 de 5

#### Scenario: Seguir al tráfico no la cumple
- **WHEN** un auto recorre 600 metros detrás del primer vehículo del carril más lento del tráfico
- **THEN** la misión de superar vehículos sigue en 0 de 5
