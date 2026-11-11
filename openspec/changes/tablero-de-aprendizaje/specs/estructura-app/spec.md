# Spec Delta

## MODIFIED Requirements

### Requirement: Disposición común
Toda pestaña con escenario SHALL mostrar el escenario a la izquierda, el
tablero al centro cuando la pestaña lo usa, y un panel de controles a la
derecha, con la barra de pestañas, el selector de idioma y el interruptor de
guía siempre en el mismo lugar. El orden de lectura y de foco con el teclado
SHALL ser escenario, tablero y panel.

#### Scenario: Disposición de la primera pestaña
- **WHEN** se muestra la primera pestaña en una ventana de 1440 píxeles de ancho
- **THEN** el escenario ocupa la zona izquierda, el tablero la zona central y el panel la zona derecha

#### Scenario: Misma disposición en Entrenar
- **WHEN** la persona pasa de El problema a Entrenar
- **THEN** las tres zonas conservan su lugar y su ancho

#### Scenario: Recorrido con el teclado
- **WHEN** la persona recorre la pestaña con la tecla Tab desde el escenario
- **THEN** el foco pasa primero por los controles del escenario, después por el tablero y al final por el panel

### Requirement: Panel ajustable
El borde izquierdo del panel SHALL poder arrastrarse con el mouse para
agrandar o achicar el panel, desde un mínimo de 300 píxeles, con 360 píxeles
por defecto. El panel MUST NOT pasar de la mitad del ancho de la ventana ni
dejar al escenario con menos de 260 píxeles o al tablero con menos de 360. El
borde MUST poder moverse también con el teclado y SHALL tener un tooltip que
diga qué hace y por qué importa, en español y en inglés. El ancho elegido
SHALL recordarse en el mismo navegador entre visitas.

#### Scenario: Arrastrar el borde
- **WHEN** la persona arrastra el borde del panel hacia la izquierda
- **THEN** el panel se agranda, el tablero se achica y la simulación sigue sin cambios

#### Scenario: Límites del panel
- **WHEN** la persona arrastra el borde del panel más allá de sus límites en una ventana de 1440 píxeles con el escenario en 400
- **THEN** el panel queda en 300 píxeles como mínimo y en 668 como máximo, con el tablero en 360

#### Scenario: Límite de la mitad de la ventana
- **WHEN** la persona agranda el panel al máximo en una ventana de 1440 píxeles con el escenario en 260
- **THEN** el panel queda en 720 píxeles, la mitad de la ventana

#### Scenario: Con el teclado
- **WHEN** la persona llega al borde con la tecla Tab y presiona la flecha izquierda
- **THEN** el panel se agranda y el auto no gira

#### Scenario: Volver al ancho inicial
- **WHEN** la persona hace doble clic en el borde
- **THEN** el panel vuelve a 360 píxeles

#### Scenario: Ancho recordado
- **WHEN** la persona agrandó el panel y vuelve a abrir la aplicación en el mismo navegador
- **THEN** el panel tiene el ancho que había elegido

## ADDED Requirements

### Requirement: Escenario ajustable
El borde entre el escenario y el tablero SHALL poder arrastrarse con el mouse
y moverse con el teclado para repartir el ancho entre los dos. El escenario
SHALL medir 400 píxeles por defecto y 260 como mínimo, y MUST NOT dejar al
tablero con menos de 360 píxeles. El borde SHALL tener un tooltip que diga qué
hace y por qué importa, en español y en inglés, y el ancho elegido SHALL
recordarse en el mismo navegador entre visitas.

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

### Requirement: Anchos que se adaptan a la ventana
Cuando la ventana se achica, los anchos elegidos SHALL ajustarse sin perderse:
primero cede el tablero hasta 360 píxeles, después el escenario hasta 260 y
por último el panel hasta 300. Al agrandar la ventana, cada zona SHALL volver
al ancho que la persona había elegido.

#### Scenario: Ventana que se achica
- **WHEN** la ventana pasa de 1440 a 1000 píxeles de ancho con el escenario en 400 y el panel en 360
- **THEN** el tablero queda en 360 píxeles, el panel en 360 y el escenario se reduce a lo que resta, sin bajar de 260

#### Scenario: Ventana que vuelve a agrandarse
- **WHEN** la ventana vuelve a 1440 píxeles de ancho
- **THEN** el escenario vuelve a 400 píxeles y el panel a 360

### Requirement: Disposición en ventanas medianas
Cuando la ventana mide entre 600 y 959 píxeles de ancho y la pestaña usa el
tablero, la aplicación SHALL mostrar el tablero debajo del escenario, en la
misma columna, y el panel a la derecha con todo el alto. En esa disposición el
borde entre escenario y tablero MUST NOT mostrarse y el borde del panel SHALL
seguir funcionando.

#### Scenario: Ventana de 800 píxeles
- **WHEN** la aplicación se abre en una ventana de 800 píxeles de ancho
- **THEN** el escenario se ve arriba a la izquierda, el tablero debajo de él y el panel a la derecha, sin el aviso de pantalla angosta

#### Scenario: Volver a tres columnas
- **WHEN** la persona agranda esa ventana a 1200 píxeles de ancho
- **THEN** el tablero vuelve a estar entre el escenario y el panel, con los anchos que estaban elegidos

#### Scenario: La simulación no se interrumpe
- **WHEN** la disposición cambia porque cambió el ancho de la ventana
- **THEN** la simulación, el entrenamiento y el contenido del tablero siguen sin reiniciarse

### Requirement: Orden común del panel
El panel de toda pestaña SHALL ordenar su contenido de arriba hacia abajo así:
guía de inicio, controles de marcha, interruptores de vista, ajustes y
acciones a la vista, misiones y, al final, las secciones plegables. Las
secciones plegables SHALL verse iguales en todas las pestañas. El nombre de la
pestaña MUST NOT repetirse como título visible del panel, y SHALL seguir
disponible para los lectores de pantalla.

#### Scenario: Mismo orden en dos pestañas
- **WHEN** la persona compara los paneles de El problema y de Entrenar
- **THEN** en los dos aparecen, en ese orden, la guía, los controles de marcha, los interruptores de vista, las misiones y las secciones plegables

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el panel empieza directamente por los controles de marcha

#### Scenario: Título para lectores de pantalla
- **WHEN** un lector de pantalla recorre el panel de Entrenar
- **THEN** anuncia un título con el nombre de la pestaña aunque no se vea
