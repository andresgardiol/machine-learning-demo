# Spec Delta

## Purpose
Fija qué significa cada estilo de control en toda la aplicación (acción principal, acción secundaria, opción elegida y estado o salida de la red) y cuál es la acción principal de cada pestaña en cada estado, para que quien llega solo sepa qué tocar sin leer.

## ADDED Requirements

### Requirement: Cuatro estilos con un significado cada uno
Todo control y toda salida de la red SHALL verse con uno de cuatro estilos (acción principal, acción secundaria, opción elegida, estado o salida de la red), y cada uno SHALL significar lo mismo en todas las pestañas. La acción principal lleva el relleno del color de acción y es más grande que las secundarias de su zona; la secundaria tiene contorno y no ese relleno. Ese relleno MUST NOT usarse en nada más. Los enlaces, como Créditos, MAY verse como texto subrayado.

#### Scenario: El azul relleno es solo de la acción principal
- **WHEN** se recorren las seis pestañas a 1440×900 y se buscan los elementos rellenos con el color de acción
- **THEN** cada uno de ellos es la acción principal de su pestaña, de su vista del panel o de un diálogo abierto

#### Scenario: Opción elegida distinta de la acción principal
- **WHEN** la persona mira en Inspeccionar el segmento "Diagrama" elegido y el botón "Reproducir" al mismo tiempo
- **THEN** "Reproducir" está relleno del color de acción y "Diagrama" no: se ve elegido por su fondo tenue, su contorno y su letra en negrita

#### Scenario: Estado sin depender del color
- **WHEN** se ve la app en escala de grises
- **THEN** la acción principal se reconoce por su tamaño y su relleno, una opción elegida por su letra en negrita y su contorno, un interruptor encendido por la posición de su perilla y una salida encendida por su relleno y su letra en negrita

#### Scenario: Contraste de los estilos nuevos
- **WHEN** se mide el texto de la acción principal contra su relleno, el texto de una opción elegida contra su fondo y el contorno de una opción elegida contra la superficie donde está
- **THEN** el texto da 4,5:1 o más y el contorno 3:1 o más

### Requirement: La salida de la red no parece botón
Lo que el auto acciona y lo que la red decide ("Lo que estás accionando", "Decisión de la red" y las teclas de salida) SHALL verse con el estilo de estado: sin el color de acción, sin contorno de control y sin cambiar al pasar el cursor. Una salida encendida SHALL distinguirse de una apagada por su relleno y por el peso de la letra.

#### Scenario: Tecla encendida
- **WHEN** en El problema la persona aprieta la flecha de avanzar y mira "Lo que estás accionando"
- **THEN** "Avanzar" se ve encendido con el estilo de estado, sin el color de acción, y al pasar el cursor por encima no cambia ni aparece el cursor de mano

#### Scenario: La red titubea
- **WHEN** en Inspeccionar una tecla de "Decisión de la red" titubea
- **THEN** se ve quieta, rayada y a medio encender, con el estilo de estado y no con el color de acción

### Requirement: Una sola acción principal a la vista
Cada pestaña SHALL mostrar a lo sumo una acción principal a la vez en cada vista de su panel, contando también la escena y el tablero. Un diálogo abierto SHALL tener su propia acción principal. La misma acción MUST NOT aparecer con el estilo principal en dos lugares a la vez.

#### Scenario: Al abrir la app
- **WHEN** la persona abre la app sin haber configurado nada y recorre las seis pestañas
- **THEN** en cada una hay exactamente un elemento con el estilo de acción principal

#### Scenario: Competir con el cartel de largada
- **WHEN** en Competir se ve el cartel de largada sobre la escena
- **THEN** el botón "Largar" del cartel es la acción principal y el botón de marcha del panel se ve como acción secundaria

#### Scenario: Diálogo de confirmación
- **WHEN** se abre un diálogo de confirmación
- **THEN** su botón de aceptar es la acción principal del diálogo y el de cancelar se ve como secundaria

### Requirement: La marcha es la acción principal
La acción principal de cada pestaña SHALL ser su control de marcha, el mismo en las seis:

| Pestaña | Control de marcha |
|---|---|
| El problema | Pausar o seguir |
| Reglas a mano | Pausar o seguir |
| Entrenar | Pausar o seguir, en la vista de entrenamiento |
| Competir | Largar, pausar o reanudar |
| Inspeccionar | Reproducir o pausar |
| Laboratorio | Reproducir o pausar |

Que un control sea la acción principal MUST NOT cambiar lo que hace, su texto ni su atajo de teclado.

#### Scenario: El problema en marcha
- **WHEN** la persona entra a El problema y maneja sin chocar
- **THEN** la acción principal es el botón de pausar, y "Reiniciar" y "Tráfico nuevo" se ven como secundarias

#### Scenario: Laboratorio
- **WHEN** la persona entra al Laboratorio en Compuertas, Puntos o Tu manejo
- **THEN** la acción principal es el botón de reproducir, y "Agregar una capa oculta" y "Guardar como cerebro" se ven como secundarias

#### Scenario: Mismo comportamiento
- **WHEN** la persona usa cualquier botón que cambió de estilo, con el mouse o con su atajo
- **THEN** hace lo mismo que antes del cambio, con el mismo texto y el mismo tooltip

#### Scenario: Determinismo
- **WHEN** se repite el mismo recorrido con la misma semilla antes y después del cambio
- **THEN** la simulación, el entrenamiento y las carreras dan los mismos resultados: el cambio es solo visual

### Requirement: Estados que cambian la acción principal
Mientras dura su estado, la acción principal SHALL ser otra:

- con un choque a la vista en El problema o en Reglas a mano, Reiniciar;
- en Entrenar, con la selección manual esperando una elección, Elegir al líder;
- en Competir, con la carrera terminada, Otra carrera.

Al terminar ese estado, la marcha SHALL volver a ser la acción principal.

#### Scenario: Choque y vuelta atrás
- **WHEN** en El problema el auto choca y aparece el aviso de choque
- **THEN** "Reiniciar" del aviso es la única acción principal y el botón de pausar se ve como secundaria
- **WHEN** la persona reinicia
- **THEN** el aviso desaparece y el botón de pausar vuelve a ser la acción principal

#### Scenario: Entrenar con selección manual
- **WHEN** en Entrenar la selección es manual y la generación espera que la persona elija
- **THEN** "Elegir al líder" es la acción principal y el botón de pausar se ve como secundaria
- **WHEN** la persona elige y arranca la generación siguiente
- **THEN** el botón de pausar vuelve a ser la acción principal

#### Scenario: Carrera terminada
- **WHEN** en Competir la carrera termina
- **THEN** "Otra carrera" es la única acción principal

### Requirement: Guardar no compite con la marcha
En la vista de cerebros de Entrenar, la acción principal SHALL ser Guardar como nuevo. "Guardar campeón", en la vista de entrenamiento, y "Agregar una capa oculta" y "Guardar como cerebro", en el Laboratorio, SHALL verse como acciones secundarias.

#### Scenario: Vista de entrenamiento
- **WHEN** en Entrenar la persona mira la vista de entrenamiento con un campeón para guardar
- **THEN** "Guardar campeón" se ve como acción secundaria y la marcha sigue siendo la acción principal

#### Scenario: Vista de cerebros
- **WHEN** la persona pasa a la vista de cerebros de Entrenar
- **THEN** "Guardar como nuevo" es la acción principal de esa vista

### Requirement: Opciones elegidas con un mismo aspecto
Todo grupo de opciones (segmentos, selector de idioma, botones de cámara, fichas, interruptores y botones que quedan apretados) SHALL mostrar la opción elegida con el mismo estilo de opción elegida en toda la app. Un interruptor encendido SHALL mostrar su perilla del lado encendido y no SHALL usar el relleno pleno del color de acción.

#### Scenario: Mismo aspecto en distintas pestañas
- **WHEN** la persona compara la cantidad de carriles elegida en la barra de escenario, el idioma elegido arriba, la velocidad elegida en Entrenar y "De a: Cuadro" en Inspeccionar
- **THEN** las cuatro opciones elegidas tienen el mismo fondo, el mismo contorno y el mismo peso de letra

#### Scenario: Interruptores encendidos
- **WHEN** Guía y Ayudas están encendidos en la barra de arriba
- **THEN** se ven encendidos por la posición de la perilla y el estilo de opción elegida, sin parecer un botón de acción principal

#### Scenario: Valores por defecto
- **WHEN** la persona restablece el escenario o los ajustes de entrenamiento
- **THEN** las opciones vuelven a sus valores por defecto y las elegidas se ven con el estilo de opción elegida
