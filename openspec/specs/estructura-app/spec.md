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
Laboratorio. Las pestañas aún no disponibles MUST verse como no disponibles y
no poder abrirse.

#### Scenario: Recorrido visible
- **WHEN** se abre la aplicación
- **THEN** la barra muestra las seis pestañas en orden y la primera está activa

#### Scenario: Pestaña no disponible
- **WHEN** la persona intenta abrir una pestaña no disponible
- **THEN** la pestaña activa no cambia

#### Scenario: Explicación de una pestaña no disponible
- **WHEN** la persona posa el cursor sobre una pestaña no disponible
- **THEN** un tooltip indica que llegará próximamente y qué va a enseñar

### Requirement: Lista para usar al abrir
La aplicación SHALL abrir directamente en la primera pestaña, con su escenario
funcionando, sin pedir ninguna configuración, registro ni paso previo.

#### Scenario: Primera visita
- **WHEN** una persona abre la aplicación por primera vez
- **THEN** ve la primera pestaña con su escenario listo para usar

### Requirement: Disposición común
Toda pestaña con escenario SHALL mostrar el escenario a la izquierda y un panel
de información y controles a la derecha, con la barra de pestañas, el selector
de idioma y el interruptor de guía siempre en el mismo lugar.

#### Scenario: Disposición de la primera pestaña
- **WHEN** se muestra la primera pestaña
- **THEN** el escenario ocupa la zona izquierda y el panel la zona derecha

### Requirement: Panel ajustable
El borde entre el escenario y el panel SHALL poder arrastrarse con el mouse
para agrandar o achicar el panel, entre un mínimo de 300 píxeles y la mitad
del ancho de la ventana, con 360 píxeles por defecto. El borde MUST poder
moverse también con el teclado y SHALL tener un tooltip que diga qué hace y
por qué importa, en español y en inglés. El ancho elegido SHALL recordarse en
el mismo navegador entre visitas.

#### Scenario: Arrastrar el borde
- **WHEN** la persona arrastra el borde del panel hacia la izquierda
- **THEN** el panel se agranda, el escenario se achica y la simulación sigue sin cambios

#### Scenario: Límites del panel
- **WHEN** la persona arrastra el borde más allá de la mitad de la ventana o del mínimo
- **THEN** el panel queda en la mitad de la ventana o en 300 píxeles

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
