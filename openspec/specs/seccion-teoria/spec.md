# seccion-teoria Specification

## Purpose
Da a quien llega sin base, o quiere repasar, una sección de lectura aparte de la práctica: corta,
visual y en orden, que explica los conceptos que la práctica usa y apunta a la pestaña donde tocarlos.

## Requirements

### Requirement: Sección en su propia dirección
La teoría SHALL vivir en una dirección propia, separada de la práctica, y SHALL abrir lista para leer,
sin registro ni configuración. Cada capítulo y la historia SHALL tener su propia dirección, que se
puede compartir y que abre directamente ahí.

#### Scenario: Abrir la sección sin configurar nada
- **WHEN** una persona abre la dirección de la teoría por primera vez
- **THEN** ve la portada con la historia y el temario, sin ningún paso previo

#### Scenario: Abrir un capítulo por su dirección
- **WHEN** una persona abre la dirección del capítulo "Una neurona"
- **THEN** la sección abre en ese capítulo, en su primer tramo

#### Scenario: Dirección desconocida
- **WHEN** una persona abre una dirección de capítulo que no existe
- **THEN** la sección muestra la portada

### Requirement: Portada con el temario
La portada SHALL mostrar la historia y el temario en orden, cada capítulo con su número, su título y
una frase que dice qué concepto explica. Un capítulo que todavía no está escrito SHALL verse como
"próximamente" y MUST NOT poder abrirse.

#### Scenario: Temario en orden
- **WHEN** una persona mira la portada
- **THEN** ve primero la historia y después los capítulos del 0 al 9, en orden

#### Scenario: Capítulo sin escribir
- **WHEN** una persona intenta abrir un capítulo marcado "próximamente"
- **THEN** no se abre, y su tarjeta dice que todavía no está disponible

### Requirement: La teoría acompaña a la práctica
Cada capítulo SHALL nombrar la pestaña de la práctica donde se toca lo que explica, y SHALL usar los
mismos nombres, los mismos colores y los mismos significados que la práctica para las mismas cosas.

#### Scenario: Mismo color, mismo significado
- **WHEN** un capítulo muestra un peso positivo y uno negativo
- **THEN** se ven con los colores y las formas que tienen en la práctica: continuo el positivo, punteado el negativo

#### Scenario: Pestaña nombrada
- **WHEN** una persona termina el capítulo "Una neurona"
- **THEN** el cierre nombra la pestaña Laboratorio y el ejercicio Compuertas

### Requirement: Enlace de ida a la práctica
El cierre de cada capítulo SHALL ofrecer un enlace que lleva a la app. La sección SHALL tener, siempre
a la vista, un enlace para ir a la app.

#### Scenario: Ir a la app desde el cierre
- **WHEN** una persona usa el enlace del cierre de un capítulo
- **THEN** se abre la app

### Requirement: Dos idiomas completos en la teoría
Todo texto de la teoría SHALL existir en español y en inglés. La sección SHALL abrir en el idioma que la
persona eligió en la app y, si no eligió, con la misma regla de idioma inicial de la app. Un selector
SHALL cambiar el idioma en el momento, sin perder el tramo en que se está.

#### Scenario: Idioma elegido en la app
- **WHEN** una persona que eligió inglés en la app abre la teoría
- **THEN** la teoría abre en inglés

#### Scenario: Cambiar de idioma en un tramo
- **WHEN** una persona cambia de español a inglés en el tramo 3 de un capítulo
- **THEN** el texto pasa a inglés y sigue en el tramo 3, con la figura como estaba

#### Scenario: Mismos textos en ambos idiomas
- **WHEN** se ejecuta la verificación automática de textos de la teoría
- **THEN** cada texto en español tiene su equivalente en inglés y viceversa

### Requirement: Fuentes a la vista
Cada capítulo y la historia SHALL cerrar con la lista de sus fuentes. Una afirmación histórica que
descansa solo en fuentes secundarias MUST decirlo en esa lista.

#### Scenario: Fuentes de la historia
- **WHEN** una persona llega al final de la historia
- **THEN** ve las publicaciones originales de cada hito

### Requirement: Se lee en el celular
La teoría SHALL poder leerse y usarse desde 360 píxeles de ancho, sin desplazamiento horizontal y sin
que nada se superponga. Las figuras SHALL poder manejarse con el dedo.

#### Scenario: Capítulo en un celular
- **WHEN** una persona abre un capítulo en una pantalla de 360 píxeles de ancho
- **THEN** la figura queda arriba, el texto debajo, y puede mover una perilla con el dedo

#### Scenario: Sin aviso de escritorio
- **WHEN** una persona abre la teoría en un celular
- **THEN** no ve el aviso de que la app está pensada para escritorio

### Requirement: Teoría accesible
La teoría SHALL poder recorrerse entera con el teclado, con el foco siempre visible. Cada figura SHALL
tener una descripción en texto de lo que muestra. Con la preferencia de movimiento reducido, los cambios
de la figura MUST ocurrir sin transición. Ningún elemento MUST destellar más de tres veces por segundo.

#### Scenario: Recorrer un capítulo con el teclado
- **WHEN** una persona recorre un capítulo solo con el teclado
- **THEN** llega a cada perilla, a "Restablecer", a la predicción y al cierre, y ve dónde está el foco

#### Scenario: Movimiento reducido
- **WHEN** una persona con la preferencia de movimiento reducido pasa de un tramo a otro
- **THEN** la figura cambia de estado sin animación

### Requirement: Seguir leyendo al terminar
Al terminar la historia o un capítulo, la sección SHALL ofrecer, como acción principal, pasar a lo que
sigue en el temario, diciendo su número, su título y la frase de qué explica. SHALL ofrecer además, como
acción secundaria, volver al temario. El último capítulo SHALL ofrecer volver al temario y el enlace a
la práctica. Estas acciones MUST estar en el cuerpo de la página, al final de la lectura, y no solo en
la barra de arriba.

#### Scenario: Terminar la historia
- **WHEN** una persona llega al final de la historia
- **THEN** ve un botón principal que lleva al capítulo 0, con su título y su frase, y otro para volver al temario

#### Scenario: Terminar un capítulo
- **WHEN** una persona llega al final del capítulo 3
- **THEN** ve un botón principal "Siguiente: 4. Medir el error", con su frase, y otro para volver al temario

#### Scenario: Terminar el último capítulo
- **WHEN** una persona llega al final del capítulo 9
- **THEN** ve cómo volver al temario y el enlace a la práctica, y ningún "siguiente"

### Requirement: Volver al temario donde se estaba
Al volver a la portada desde la historia o desde un capítulo, la sección SHALL mostrar el temario a la
altura de lo que se acaba de leer, con esa tarjeta señalada, y MUST NOT volver al principio de la
página. Una persona que abre la portada por primera vez SHALL verla desde arriba.

#### Scenario: Volver desde un capítulo
- **WHEN** una persona vuelve a la portada desde el capítulo 5
- **THEN** ve el temario con la tarjeta del capítulo 5 a la vista y señalada, sin tener que desplazar

#### Scenario: Primera visita
- **WHEN** una persona abre la portada por primera vez
- **THEN** la ve desde el título

### Requirement: La portada dice de qué teoría se trata
El título de la portada SHALL decir que es la teoría de este proyecto, y no solo "Teoría". El enlace de
vuelta de la barra SHALL seguir siendo corto.

#### Scenario: Llegar por un enlace compartido
- **WHEN** una persona abre la portada sin conocer la aplicación
- **THEN** el título y la línea de arriba le dicen que es la teoría que acompaña al laboratorio de machine learning
