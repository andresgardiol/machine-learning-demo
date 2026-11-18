# sistema-de-diseno Specification

## Purpose
Fija las piezas comunes de la interfaz y lo que significa cada una (tamaños de
letra, alturas de control, espaciado, superficies, colores y los estados se
cumple, error y choque), para que las seis pestañas se lean igual y lo
aprendido en una sirva en las demás.

## Requirements

### Requirement: Escala tipográfica acotada
El texto de la interfaz, sin contar lo que se dibuja en la escena y en los diagramas, SHALL usar a lo sumo cinco tamaños de letra y dos pesos, más un tamaño de letra monoespaciada para el código. Ningún texto de la interfaz MUST medir menos de 12 px a la escala de escritorio. Cada tamaño SHALL tener un uso fijo (rótulo, cuerpo, título de sección, cifra y cifra destacada) que se repite en todas las pestañas.

#### Scenario: Estado por defecto
- **WHEN** la persona abre la app sin configurar nada y se miden los textos visibles de las seis pestañas a 1440×900, con la guía encendida
- **THEN** en total aparecen cinco tamaños de letra o menos, más el del editor, dos pesos o menos, y ningún texto mide menos de 12 px

#### Scenario: Mismo uso, mismo tamaño
- **WHEN** se comparan las cifras de arriba del tablero de Reglas a mano ("Distancia", "Vehículos superados") con las cifras de la vista de entrenamiento de Entrenar
- **THEN** los números tienen el mismo tamaño y peso, y sus rótulos también

#### Scenario: En inglés
- **WHEN** se repite la medición con la app en inglés
- **THEN** se cumplen los mismos límites, y ningún texto se corta ni se parte en un renglón más que en español por haber achicado la letra

### Requirement: Tres alturas de control
Todo control que se acciona con el cursor SHALL tener una de tres alturas: grande, para la acción principal y la acción de un estado; normal, para todo lo demás; y compacta, solo en las barras densas que enumera `jerarquia-visual`. Los controles de un mismo renglón SHALL tener la misma altura.

#### Scenario: Alturas medidas
- **WHEN** se miden los controles visibles de las seis pestañas a 1440×900 y a 1366×768
- **THEN** cada uno tiene la altura grande, la normal o la compacta, y la compacta aparece solo en las barras densas

#### Scenario: Altura mínima
- **WHEN** se mide la altura compacta
- **THEN** es de 24 px o más, como pide `accesibilidad`

### Requirement: Espaciado en pasos
Las separaciones entre controles, entre grupos y entre zonas, y los rellenos internos de botones y tarjetas, SHALL tomar sus valores de una única escala de espaciado, igual en toda la app. Las esquinas redondeadas SHALL usar a lo sumo tres radios: el de los controles, el de las tarjetas y el redondo de perillas y marcas.

#### Scenario: Mismo grupo, misma separación
- **WHEN** se miden las separaciones entre los botones de la tarjeta de consigna de Reglas a mano y de Entrenar
- **THEN** son iguales y son un valor de la escala

#### Scenario: Radios
- **WHEN** se recorren los controles y las tarjetas visibles de las seis pestañas
- **THEN** cada esquina redondeada usa uno de los tres radios

### Requirement: Superficies con nombre
La interfaz SHALL usar tres superficies (fondo, panel y tarjeta), más la escena, que es una superficie propia. Una tarjeta SHALL distinguirse del panel donde está también en escala de grises, por un contorno, una barra o una diferencia de luminosidad de al menos 1,3:1.

#### Scenario: Tarjeta en escala de grises
- **WHEN** se ve en escala de grises la tarjeta de consigna de cualquier pestaña
- **THEN** se distingue del panel sin depender del color

### Requirement: Un color, un significado
Cada color de la interfaz SHALL tener un solo significado en toda la app. El relleno de la acción principal MUST NOT repetirse en lo que dibuja la escena, en los diagramas de la red ni en las barras de datos. Las barras de los sensores SHALL distinguirse de la acción principal por el tono y en escala de grises. El anillo de "Mostrame" MUST NOT usar el color de un competidor ni de la red.

#### Scenario: Sensores y acción
- **WHEN** en Reglas a mano se ven a la vez "Lo que percibe y lo que acciona" y la acción principal, en color y en escala de grises
- **THEN** las barras de los sensores y la acción principal se ven distintas en los dos casos

#### Scenario: Barras de progreso
- **WHEN** se mira la barra de progreso de una misión junto a la acción principal
- **THEN** la barra no usa el relleno de la acción

#### Scenario: Anillo de "Mostrame"
- **WHEN** en Competir la persona toca "Mostrame" con el competidor 3 en la escena
- **THEN** el anillo usa el color de "vos", porque señala lo que hay que tocar; es más grueso que el contorno de foco, y el anillo y el competidor 3 tienen colores distintos

#### Scenario: Auditoría
- **WHEN** se corre la auditoría del sistema de diseño en las seis pestañas
- **THEN** no informa ningún color de la interfaz con dos significados

### Requirement: Cuatro roles con un color y una forma
Todo lo que forma parte del contrato de controlador SHALL verse con uno de cuatro roles, cada uno con un color y una forma propios, iguales en la interfaz y en el dibujo de todas las pestañas: *vos* (lo que la persona toca), *entra* (lo que percibe el controlador), *decide* (el programa o la red) y *sale* (lo que acciona). Un rol MUST NOT usar el color de otro.

#### Scenario: Entra en todas partes
- **WHEN** en Reglas a mano se ven a la vez los rayos de los sensores en la escena, las barras de "Lo que percibe" y la palabra `sensor3` en el editor y en la paleta
- **THEN** los tres usan el color de "entra"

#### Scenario: Entradas de la red
- **WHEN** en Inspeccionar se mira el diagrama de la red
- **THEN** las neuronas de entrada usan el color de "entra" en su contorno, igual que los sensores de la escena

#### Scenario: Palabras de acción
- **WHEN** en Reglas a mano se mira la palabra `avanzar` en el editor y en la paleta
- **THEN** no usa el color de "vos" ni el de "entra", y se ve con el estilo de "sale"

#### Scenario: Constantes del programa
- **WHEN** en Reglas a mano se mira la constante `cerca` en el editor y en la paleta
- **THEN** se ve en el blanco de "decide", en cursiva, y no usa el color de los pesos de la red

#### Scenario: Entra y los pesos con daltonismo
- **WHEN** se simula deuteranopia sobre el color de "entra" y el de los pesos positivos
- **THEN** quedan a una diferencia de color de 8 o más (ΔE en OKLab ×100, como en `vista-de-la-red`)

### Requirement: Rótulos de rol
Cada zona que muestra un rol (lo que perciben los sensores, el programa o la red, y lo que se acciona) SHALL llevar un rótulo chico con la marca del rol y su nombre, en español y en inglés, con una ayuda que define el rol en lenguaje llano. Los rótulos SHALL verse con la guía encendida y MUST NOT verse ni ocupar lugar con la guía apagada.

#### Scenario: Estado por defecto
- **WHEN** la persona abre Reglas a mano sin configurar nada
- **THEN** ve "Entra · lo que percibe" sobre las barras de los sensores, "Decide · el programa" junto al editor y "Sale · lo que acciona" sobre las teclas

#### Scenario: Rótulos en el título de la tarjeta
- **WHEN** se abre Reglas a mano a 1366×768 con la guía encendida
- **THEN** "Entra · lo que percibe" y "Sale · lo que acciona" ocupan el renglón del título de la tarjeta de percepción, cada uno sobre su columna, en lugar del título "Lo que percibe y lo que acciona", y la tarjeta no es más alta que con la guía apagada

#### Scenario: Ayuda del rótulo
- **WHEN** la persona pasa el cursor o llega con el teclado al rótulo "Entra"
- **THEN** una ayuda dice qué es lo que entra al controlador y por qué importa, en el idioma activo

#### Scenario: En inglés
- **WHEN** la persona cambia el idioma a inglés
- **THEN** los rótulos dicen "In · what it senses", "Decides · the program" y "Out · what it does"

#### Scenario: Guía apagada
- **WHEN** el mentor apaga la guía
- **THEN** los rótulos desaparecen de todas las pestañas y no dejan hueco

#### Scenario: Vuelta atrás
- **WHEN** después de apagarla, la persona vuelve a encender la guía
- **THEN** los rótulos vuelven a verse en los mismos lugares

### Requirement: Estado "se cumple"
Lo que en este momento se está cumpliendo o está activo por una decisión del programa o de la red (una línea del programa que se cumple, una salida encendida) SHALL verse con un mismo estado "se cumple" en todas las pestañas: con un color y además con una marca de forma, como una barra lateral o un contorno. El estado MUST NOT parecer un botón.

#### Scenario: Línea que se cumple
- **WHEN** en Reglas a mano una regla se cumple mientras el auto anda
- **THEN** su línea se ve con el estado "se cumple", que se reconoce también en escala de grises

#### Scenario: Igual en otra pestaña
- **WHEN** se compara una línea que se cumple en Reglas a mano con una tecla encendida de "Decisión de la red" en Inspeccionar
- **THEN** las dos usan el mismo color y el mismo tipo de marca

### Requirement: Estado "error"
Un error que la persona puede corregir (una línea con error en el programa, un archivo que no sirve al importar) SHALL verse con un mismo estado "error" en todas las pestañas: con un color, un ícono y el mensaje cerca de lo que lo causó. El color del error MUST NOT ser el de la acción principal.

#### Scenario: Error en el programa
- **WHEN** en Reglas a mano la persona escribe una palabra que no existe
- **THEN** el mensaje se ve con el estado "error", con su ícono, y se reconoce también en escala de grises

#### Scenario: Error al importar
- **WHEN** la persona importa un archivo que no sirve, en Reglas a mano o en la biblioteca de cerebros
- **THEN** el aviso usa el mismo estado "error"

### Requirement: Estado "choque"
Un choque o una salida de la pista SHALL verse con un mismo estado "choque" en todas las pestañas donde se maneja: el aviso, el auto chocado y su marca en las cifras comparten el color y una forma que no depende del color. El estado "choque" SHALL distinguirse del estado "error".

#### Scenario: Choque en dos pestañas
- **WHEN** el auto choca en El problema y en Reglas a mano, con Reintentar solo apagado
- **THEN** los dos avisos de choque se ven con el mismo estado "choque"

#### Scenario: Choque y error a la vez
- **WHEN** en Reglas a mano el programa tiene un error y el auto choca
- **THEN** el aviso de choque y el mensaje de error se distinguen entre sí, también en escala de grises

#### Scenario: Vuelta atrás
- **WHEN** después de un choque la persona toca Reiniciar
- **THEN** el estado "choque" desaparece de todos los lugares donde se veía

### Requirement: Deslizadores de la app
Todo deslizador SHALL verse con el riel, la perilla, el foco y el estado deshabilitado propios de la app, iguales en todas las pestañas, y no con el aspecto nativo del navegador. El riel y la perilla SHALL dar 3:1 o más contra la superficie donde están.

#### Scenario: Barra de escenario
- **WHEN** se mira el deslizador "Densidad" de la barra de escenario
- **THEN** usa el riel y la perilla de la app, sin el fondo blanco nativo

#### Scenario: Foco con teclado
- **WHEN** la persona llega con Tab a un deslizador y lo mueve con las flechas
- **THEN** se ve el contorno de foco de la app y el valor cambia igual que antes

### Requirement: El sistema no cambia el comportamiento
Aplicar el sistema de diseño MUST NOT cambiar lo que hace ningún control, sus textos, sus tooltips ni sus atajos de teclado, ni los resultados de la simulación con la misma semilla. Las preferencias y los datos guardados antes del cambio SHALL seguir valiendo.

#### Scenario: Misma semilla
- **WHEN** se corren las pruebas de reproducibilidad del núcleo después del cambio
- **THEN** dan los mismos resultados que antes

#### Scenario: Preferencias guardadas
- **WHEN** alguien que ya usó la app vuelve después del cambio, con la guía apagada y un programa de Reglas a mano guardado
- **THEN** la guía sigue apagada y el programa sigue ahí
