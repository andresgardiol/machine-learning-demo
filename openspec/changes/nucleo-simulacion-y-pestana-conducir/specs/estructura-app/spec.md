# Spec Delta

## Purpose

Da a la aplicación su forma común: las pestañas que ordenan el recorrido de
aprendizaje, la disposición que se repite en todas ellas, las preferencias de
quien la usa y los créditos. Lo aprendido al usar una pestaña sirve en las
demás.

## ADDED Requirements

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
La aplicación SHALL recordar en el mismo navegador el idioma elegido y el
estado del interruptor de guía entre visitas. Si el navegador no permite
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
Cuando la ventana mide menos de 1024 píxeles de ancho, la aplicación SHALL
mostrar un aviso, en el idioma activo, de que está pensada para computadoras de
escritorio, en lugar de una disposición rota.

#### Scenario: Ventana angosta
- **WHEN** la aplicación se abre en una ventana de 800 píxeles de ancho
- **THEN** se muestra el aviso de uso en escritorio

#### Scenario: Ventana que se agranda
- **WHEN** la persona agranda la ventana por encima de 1024 píxeles de ancho
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
