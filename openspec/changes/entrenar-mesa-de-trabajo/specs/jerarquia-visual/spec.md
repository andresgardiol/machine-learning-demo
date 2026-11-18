## MODIFIED Requirements

### Requirement: La marcha es la acción principal
La acción principal de cada pestaña SHALL ser su control de marcha, el mismo en las seis:

| Pestaña | Control de marcha |
|---|---|
| El problema | Pausar o seguir |
| Reglas a mano | Pausar o seguir |
| Entrenar | Pausar o seguir, en la barra de abajo de la escena |
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

### Requirement: Guardar no compite con la marcha
En Entrenar la marcha SHALL seguir siendo la acción principal en las tres vistas del panel, porque queda siempre a la vista debajo de la escena. "Guardar como nuevo", en la vista de cerebros, "Guardar campeón", en la vista de entrenamiento, y "Agregar una capa oculta" y "Guardar como cerebro", en el Laboratorio, SHALL verse como acciones secundarias.

#### Scenario: Vista de entrenamiento
- **WHEN** en Entrenar la persona mira la vista de entrenamiento con un campeón para guardar
- **THEN** "Guardar campeón" se ve como acción secundaria y la marcha sigue siendo la acción principal

#### Scenario: Vista de cerebros
- **WHEN** la persona pasa a la vista de cerebros de Entrenar
- **THEN** "Guardar como nuevo" se ve como acción secundaria y la marcha de abajo de la escena sigue siendo la única acción principal

### Requirement: Cinco estilos con un significado cada uno
Todo control y toda salida de la red SHALL verse con uno de cinco estilos (acción principal, acción secundaria, acción terciaria, opción elegida, estado o salida de la red), con el mismo significado en todas las pestañas. La principal lleva el relleno del color de acción y negrita, con la altura grande y sin partirse; la secundaria, contorno sin ese relleno; la terciaria, solo texto, sin contorno ni relleno, y se usa para lo que no cambia la escena (Exportar, Importar, "Más sobre esta pestaña", "Mostrame"). Hay tres alturas: grande, normal y compacta (barras densas). Ese relleno MUST NOT usarse en nada más. Los enlaces, como Créditos, MAY verse subrayados.

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
- **WHEN** se miden todos los botones visibles de las seis pestañas, salvo la acción principal y los botones de su renglón
- **THEN** cada uno tiene la altura normal o la compacta, y la compacta solo aparece en barras densas: las de arriba y abajo de la red, las filas de la lista de competidores, el renglón de Cambiar y Apagar de la tarjeta de la neurona en Inspeccionar y en el Laboratorio, los avisos sobre la escena de Inspeccionar, las filas de la biblioteca de cerebros, la barra de arriba de la app, la cabecera de capas del diagrama de la red, las filas de la tarjeta de la neurona y la tabla de verdad del Laboratorio, las filas de percepción de Reglas a mano y el renglón de interruptores de su barra de marcha, el renglón de interruptores de la barra de marcha de Entrenar, y los controles de las fichas del programa de Reglas a mano

#### Scenario: Tres alturas
- **WHEN** se mide la acción principal de cada pestaña y los botones de su mismo renglón
- **THEN** tienen la altura grande, más alta que la normal

#### Scenario: Acción terciaria
- **WHEN** la persona mira en Reglas a mano "Exportar" e "Importar" junto a "Restablecer"
- **THEN** "Exportar" e "Importar" se ven como acción terciaria, solo texto, y "Restablecer", que cambia el programa, como acción secundaria

#### Scenario: "Mostrame" sin excepción de altura
- **WHEN** la tarjeta de consigna muestra "Mostrame" junto a la misión en curso
- **THEN** "Mostrame" se ve como acción terciaria y no como un botón compacto con contorno dentro de la tarjeta

#### Scenario: Estado sin depender del color
- **WHEN** se ve la app en escala de grises
- **THEN** la acción principal se reconoce por su relleno y su letra en negrita, una opción elegida por su letra en negrita y su contorno, un interruptor encendido por la posición de su perilla, una salida encendida por su relleno y su letra en negrita, y una acción terciaria por ser texto sin contorno con el cursor de mano

#### Scenario: Contraste de los estilos nuevos
- **WHEN** se mide el texto de la acción principal contra su relleno, el texto de una opción elegida contra su fondo, el contorno de una opción elegida contra la superficie donde está y el texto de una acción terciaria contra su superficie
- **THEN** el texto da 4,5:1 o más y el contorno 3:1 o más

#### Scenario: Filas que insertan
- **WHEN** la persona mira la columna de percepción de Reglas a mano con 12 sensores o menos
- **THEN** cada fila de sensor muestra, también en reposo, una marca de que se puede tocar para insertarla, y la marca no usa el relleno del color de acción
