# tablero Specification

## Purpose
El tablero es la zona central de una pestaña, entre el escenario y el panel:
muestra lo que se mide y lo que se aprende mientras la simulación corre, para
que quien toca un control vea su efecto sin desplazarse ni cambiar de vista.
El tablero solo muestra; los controles viven en el panel.

## Requirements

### Requirement: Zona de tablero
Una pestaña SHALL mostrar en el tablero, entre el escenario y el panel, sus
indicadores y las visualizaciones de lo que enseña. Una pestaña que no tiene
nada que mostrar en el tablero MUST NOT dejar la zona vacía: el escenario
ocupa ese lugar.

#### Scenario: Pestaña con tablero
- **WHEN** se abre la pestaña Entrenar en una ventana de 1440 píxeles de ancho
- **THEN** se ven, de izquierda a derecha, el escenario, el tablero y el panel

#### Scenario: Pestaña sin tablero
- **WHEN** se abre una pestaña que no pone contenido en el tablero
- **THEN** no se ve una zona vacía ni un borde de más, y el escenario llega hasta el borde del panel

### Requirement: Renglón de indicadores
Los indicadores de una pestaña SHALL verse en un solo renglón en la parte de
arriba del tablero, cada uno con su rótulo y su valor, actualizados en tiempo
real. Ningún valor MUST partirse en más de un renglón con el tablero en su
ancho mínimo de 360 píxeles.

#### Scenario: Indicadores en un renglón
- **WHEN** el tablero mide 360 píxeles de ancho y la pestaña tiene cuatro indicadores
- **THEN** los cuatro se ven en el mismo renglón y cada valor ocupa una sola línea

#### Scenario: Valor que cambia
- **WHEN** cambia el dato que muestra un indicador
- **THEN** el indicador muestra el valor nuevo sin que los demás cambien de lugar

### Requirement: Tarjetas del tablero
Cada visualización del tablero SHALL estar en una tarjeta con título, visible
al abrir la pestaña. Cada tarjeta SHALL poder plegarse y desplegarse desde su
título, y MUST conservar ese estado al salir de la pestaña y volver, hasta
cerrar la aplicación. Plegar una tarjeta MUST NOT cambiar la simulación.

#### Scenario: Estado por defecto
- **WHEN** se abre una pestaña por primera vez
- **THEN** todas las tarjetas de su tablero están desplegadas

#### Scenario: Plegar una tarjeta
- **WHEN** la persona pliega una tarjeta
- **THEN** queda a la vista solo su título y la simulación sigue igual

#### Scenario: Volver a desplegar
- **WHEN** la persona despliega una tarjeta plegada
- **THEN** la tarjeta vuelve a mostrar su contenido actualizado

#### Scenario: Estado conservado
- **WHEN** la persona pliega una tarjeta, abre otra pestaña y vuelve
- **THEN** la tarjeta sigue plegada

### Requirement: Las tarjetas se reparten el alto
Las tarjetas desplegadas SHALL repartirse todo el alto libre del tablero, de
modo que con la ventana en 1440×900 se vean completas sin desplazarse. Al
plegar una, las demás SHALL ocupar su lugar. Ninguna tarjeta desplegada MUST
medir menos de 160 píxeles de alto: si no entran, el tablero se desplaza.

#### Scenario: Todo a la vista
- **WHEN** la ventana mide 1440×900 y el tablero tiene dos tarjetas desplegadas
- **THEN** las dos se ven completas y el tablero no tiene barra de desplazamiento

#### Scenario: Una tarjeta plegada
- **WHEN** la persona pliega una de dos tarjetas
- **THEN** la otra crece hasta ocupar el alto que quedó libre

#### Scenario: Ventana baja
- **WHEN** la ventana es tan baja que dos tarjetas desplegadas no entran con 160 píxeles cada una
- **THEN** cada tarjeta conserva al menos 160 píxeles de alto y el tablero se puede desplazar

### Requirement: Renglones de ayuda
Con la guía activa, cada tarjeta SHALL mostrar un renglón de ayuda, de hasta
120 caracteres en cada idioma, que diga qué mirar en ella. Con la guía oculta,
los renglones de ayuda MUST NOT mostrarse.

#### Scenario: Guía activa
- **WHEN** la guía está activa
- **THEN** cada tarjeta desplegada muestra su renglón de ayuda

#### Scenario: Guía oculta
- **WHEN** la persona apaga el interruptor de guía
- **THEN** los renglones de ayuda desaparecen y las visualizaciones ocupan ese lugar

### Requirement: Tarjetas operables con el teclado
El título de cada tarjeta SHALL poder alcanzarse con la tecla Tab y accionarse
con Enter, y MUST informar a los lectores de pantalla si la tarjeta está
desplegada o plegada. Los atajos de la pestaña (como la barra espaciadora para
pausar) SHALL seguir funcionando con el foco en un título.

#### Scenario: Plegar con el teclado
- **WHEN** la persona llega con Tab al título de una tarjeta desplegada y presiona Enter
- **THEN** la tarjeta se pliega y su título queda anunciado como plegado

#### Scenario: Atajo con el foco en un título
- **WHEN** el foco está en el título de una tarjeta y la persona presiona la barra espaciadora
- **THEN** la simulación se pausa, como en el resto de la pestaña, y la tarjeta no cambia de estado

### Requirement: Tablero explicado
El título de cada tarjeta SHALL tener un tooltip que diga qué muestra y por
qué importa, y todos los textos del tablero SHALL estar en español y en
inglés.

#### Scenario: Tooltip de una tarjeta
- **WHEN** la persona posa el cursor sobre el título de una tarjeta
- **THEN** un tooltip en el idioma activo dice qué muestra la tarjeta y por qué importa

#### Scenario: Tablero en inglés
- **WHEN** la aplicación está en inglés
- **THEN** los rótulos de los indicadores, los títulos de las tarjetas y los renglones de ayuda se muestran en inglés
