# estructura-app Specification

## Purpose

Da a la aplicación su forma común: las pestañas que ordenan el recorrido de
aprendizaje, la disposición que se repite en todas ellas, las preferencias de
quien la usa y los créditos. Lo aprendido al usar una pestaña sirve en las
demás.

## Requirements

### Requirement: Pestañas del recorrido
La aplicación SHALL mostrar una barra con las seis pestañas del recorrido, en
este orden: El problema, Reglas a mano, Entrenar, Competir, Inspeccionar y
Laboratorio. Las pestañas El problema y Entrenar SHALL estar disponibles. Las
pestañas aún no disponibles MUST verse como no disponibles y no poder abrirse.

#### Scenario: Recorrido visible
- **WHEN** se abre la aplicación
- **THEN** la barra muestra las seis pestañas en orden y la primera está activa

#### Scenario: Abrir Entrenar
- **WHEN** la persona elige la pestaña Entrenar
- **THEN** Entrenar pasa a ser la pestaña activa y muestra su escenario y su panel

#### Scenario: Pestaña no disponible
- **WHEN** la persona intenta abrir una pestaña no disponible
- **THEN** la pestaña activa no cambia

#### Scenario: Explicación de una pestaña no disponible
- **WHEN** la persona posa el cursor sobre una pestaña no disponible
- **THEN** un tooltip indica que llegará próximamente y qué va a enseñar

#### Scenario: Explicación de una pestaña disponible
- **WHEN** la persona posa el cursor sobre la pestaña Entrenar
- **THEN** un tooltip indica qué se hace en ella y por qué importa, sin decir que llegará próximamente

### Requirement: Lista para usar al abrir
La aplicación SHALL abrir directamente en la primera pestaña, con su escenario
funcionando, sin pedir ninguna configuración, registro ni paso previo.

#### Scenario: Primera visita
- **WHEN** una persona abre la aplicación por primera vez
- **THEN** ve la primera pestaña con su escenario listo para usar

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
agrandar o achicar el panel, desde un mínimo de 300 píxeles, con 360 por
defecto. El panel MUST NOT pasar de la mitad del ancho de la ventana ni dejar
al escenario con menos de 260 píxeles o al tablero con menos de 360. El borde
MUST poder moverse también con el teclado y SHALL tener un tooltip que diga
qué hace y por qué importa, en español y en inglés. El ancho elegido SHALL
recordarse en el mismo navegador.

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

### Requirement: Interruptor de guía
La aplicación SHALL ofrecer un interruptor que muestra u oculta, en toda la
aplicación, los textos de guía y las misiones. La guía SHALL estar visible por
defecto. El interruptor SHALL tener un tooltip que diga qué hace y por qué
importa, en español y en inglés.

#### Scenario: Guía visible por defecto
- **WHEN** una persona abre la aplicación por primera vez
- **THEN** los textos de guía y las misiones están visibles

#### Scenario: Ocultar la guía
- **WHEN** la persona apaga el interruptor de guía
- **THEN** los textos de guía y las misiones desaparecen y el resto de la pestaña sigue funcionando igual

#### Scenario: Volver a mostrar la guía
- **WHEN** la persona vuelve a encender el interruptor de guía
- **THEN** los textos de guía y las misiones reaparecen con el progreso que tenían

### Requirement: Preferencias recordadas
La aplicación SHALL recordar en el mismo navegador el idioma elegido, el
estado del interruptor de guía y la velocidad máxima del auto entre visitas.
La velocidad máxima del auto SHALL ser una sola para todas las pestañas. Si el navegador no permite
guardar preferencias, la aplicación MUST funcionar igual con los valores por
defecto.

#### Scenario: Segunda visita
- **WHEN** una persona eligió inglés y apagó la guía, y vuelve a abrir la aplicación en el mismo navegador
- **THEN** la aplicación abre en inglés y con la guía apagada

#### Scenario: Navegador sin almacenamiento
- **WHEN** el navegador impide guardar o leer preferencias
- **THEN** la aplicación abre con los valores por defecto y no muestra ningún error

### Requirement: Créditos
La aplicación SHALL dar crédito visible, accesible desde cualquier pestaña, al
curso "Self-driving Car" de Radu Mariescu-Istodor como inspiración, con un
enlace al curso.

#### Scenario: Ver los créditos
- **WHEN** la persona abre los créditos desde cualquier pestaña
- **THEN** ve el nombre del curso y de su autor, en el idioma activo, con un enlace que abre el curso en otra pestaña del navegador

### Requirement: Aviso en pantallas angostas
Cuando la ventana mide menos de 600 píxeles de ancho, como en un celular, la
aplicación SHALL mostrar un aviso, en el idioma activo, de que está pensada
para computadoras de escritorio, en lugar de una disposición rota. Desde 600
píxeles de ancho la aplicación SHALL mostrarse normalmente, sin el aviso.

#### Scenario: Ventana de celular
- **WHEN** la aplicación se abre en una ventana de 400 píxeles de ancho
- **THEN** se muestra el aviso de uso en escritorio

#### Scenario: Ventana mediana
- **WHEN** la aplicación se abre en una ventana de 800 píxeles de ancho
- **THEN** no se muestra el aviso y la aplicación se usa normalmente

#### Scenario: Ventana que se agranda
- **WHEN** la persona agranda la ventana por encima de 600 píxeles de ancho
- **THEN** el aviso desaparece y la aplicación se muestra normalmente

### Requirement: Errores en lenguaje humano
Ante una falla inesperada, la aplicación SHALL mostrar un mensaje comprensible
en el idioma activo, con una acción para reiniciar, en lugar de quedar en
blanco o congelada.

#### Scenario: Falla inesperada
- **WHEN** ocurre un error inesperado mientras se usa una pestaña
- **THEN** aparece un mensaje que explica en palabras simples que algo falló y ofrece reiniciar

#### Scenario: Reiniciar tras una falla
- **WHEN** la persona elige reiniciar desde ese mensaje
- **THEN** la pestaña vuelve a su estado inicial funcionando

### Requirement: Biblioteca de cerebros compartida
La aplicación SHALL tener una única biblioteca de cerebros, común a todas las
pestañas: un cerebro guardado en una pestaña MUST estar disponible en las
demás.

#### Scenario: Cerebro disponible tras cambiar de pestaña
- **WHEN** la persona guarda un cerebro en Entrenar, abre El problema y vuelve a Entrenar
- **THEN** el cerebro sigue en la biblioteca

### Requirement: Una sola pestaña en marcha
Al cambiar de pestaña, la pestaña que se deja MUST dejar de simular y de
dibujar, de modo que solo la pestaña visible consuma recursos.

#### Scenario: Salir de una pestaña
- **WHEN** la persona pasa de Entrenar a El problema
- **THEN** el entrenamiento deja de avanzar mientras El problema está a la vista

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
