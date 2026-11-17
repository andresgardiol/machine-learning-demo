## MODIFIED Requirements

### Requirement: Cuatro estilos con un significado cada uno
Todo control y toda salida de la red SHALL verse con uno de cuatro estilos (acción principal, acción secundaria, opción elegida, estado o salida de la red), y cada uno SHALL significar lo mismo en todas las pestañas. La acción principal lleva el relleno del color de acción y la letra en negrita, y SHALL tener la misma altura que los botones de su renglón, sin partirse en dos renglones; la secundaria tiene contorno y no ese relleno. Los botones SHALL tener dos alturas en toda la app: la normal y la compacta, solo para barras densas. Ese relleno MUST NOT usarse en nada más. Los enlaces, como Créditos, MAY verse como texto subrayado.

#### Scenario: El azul relleno es solo de la acción principal
- **WHEN** se recorren las seis pestañas a 1440×900 y se buscan los elementos rellenos con el color de acción
- **THEN** cada uno de ellos es la acción principal de su pestaña, de su vista del panel o de un diálogo abierto

#### Scenario: Opción elegida distinta de la acción principal
- **WHEN** la persona mira en Inspeccionar el segmento "Diagrama" elegido y el botón "Reproducir" al mismo tiempo
- **THEN** "Reproducir" está relleno del color de acción y "Diagrama" no: se ve elegido por su fondo tenue, su contorno y su letra en negrita

#### Scenario: Misma altura en el renglón
- **WHEN** la persona mira en El problema "Pausar (espacio)" junto a "Reiniciar (R)", en español o en inglés, a 1440×900 y a 1366×768
- **THEN** los dos botones tienen la misma altura y cada texto entra en un renglón

#### Scenario: Dos alturas
- **WHEN** se miden todos los botones visibles de las seis pestañas
- **THEN** cada uno tiene la altura normal o la compacta, y la compacta solo aparece en barras densas: las de arriba y abajo de la red, las filas de la lista de competidores, el renglón de Cambiar y Apagar de la tarjeta de la neurona en Inspeccionar y en el Laboratorio, los avisos sobre la escena de Inspeccionar, las filas de la biblioteca de cerebros y la barra de arriba de la app

#### Scenario: Estado sin depender del color
- **WHEN** se ve la app en escala de grises
- **THEN** la acción principal se reconoce por su relleno y su letra en negrita, una opción elegida por su letra en negrita y su contorno, un interruptor encendido por la posición de su perilla y una salida encendida por su relleno y su letra en negrita

#### Scenario: Contraste de los estilos nuevos
- **WHEN** se mide el texto de la acción principal contra su relleno, el texto de una opción elegida contra su fondo y el contorno de una opción elegida contra la superficie donde está
- **THEN** el texto da 4,5:1 o más y el contorno 3:1 o más
