# Spec Delta

## Purpose

Muestra una red neuronal en grande y deja explorarla: verla como diagrama o
como tabla de pesos, resumir capas, elegir una neurona o una conexión,
acercarse, y distinguir de un vistazo qué se está calculando, qué está
apagado y qué se cambió.

## ADDED Requirements

### Requirement: Dos vistas de la misma red
El inspector SHALL mostrar la red de dos maneras, a elección: como diagrama
por capas, con la misma convención de colores y trazos que el diagrama de
Entrenar, y como tabla de pesos, con una tabla por capa (una fila por neurona
y una columna por entrada, más el sesgo). Las dos MUST mostrar los mismos
valores y la misma neurona elegida.

#### Scenario: Estado por defecto
- **WHEN** se abre el inspector
- **THEN** muestra el diagrama

#### Scenario: Pasar a la tabla
- **WHEN** la persona elige la tabla de pesos con una neurona elegida
- **THEN** ve una tabla por capa, con la fila de esa neurona marcada como elegida

#### Scenario: Celda de la tabla
- **WHEN** la persona mira una celda de la tabla
- **THEN** ve el valor del peso con dos decimales y su signo y su tamaño también por el color y la intensidad, con la convención del diagrama

#### Scenario: Volver al diagrama
- **WHEN** la persona vuelve al diagrama
- **THEN** la neurona elegida, las capas resumidas y el acercamiento siguen como estaban

### Requirement: Actividad en el momento
Las dos vistas SHALL mostrar el valor de cada neurona y lo que aporta cada
conexión con la cuenta que se les pasa, y actualizarse cada vez que esa
cuenta cambia, sin demora visible. Una neurona todavía no calculada en un
recorrido paso a paso MUST verse distinta de una calculada que vale cero.

#### Scenario: Red manejando
- **WHEN** el auto maneja y sus sensores cambian
- **THEN** el relleno de las neuronas cambia en el mismo cuadro, en el diagrama y en la tabla

#### Scenario: A medio calcular
- **WHEN** el recorrido paso a paso va por la segunda neurona de una capa
- **THEN** la primera muestra su valor, la segunda está marcada como la que se calcula y las demás se ven sin calcular

#### Scenario: Capa en curso
- **WHEN** el recorrido está en una capa
- **THEN** las conexiones que entran a la neurona en curso se destacan y las demás se atenúan

### Requirement: Paso animado
Cada paso del recorrido SHALL verse como un movimiento, no como un salto: los
productos, como algo que viaja por cada conexión hasta la neurona; la suma,
como algo que se junta en ella; el sesgo, en su contorno; y la activación,
como el relleno que llega a su valor. Un paso de una neurona, una capa o un
cuadro encadena esos movimientos. Lo animado MUST ser el valor real.

#### Scenario: Productos
- **WHEN** se avanza la operación de productos de una neurona
- **THEN** por cada conexión de entrada viaja una marca desde su origen hasta la neurona, con el color del signo y el tamaño del producto

#### Scenario: Suma, sesgo y activación
- **WHEN** se avanzan las tres operaciones siguientes
- **THEN** se ve juntarse la suma en la neurona, marcarse su contorno con el sesgo y llenarse su relleno hasta la salida

#### Scenario: Una neurona entera
- **WHEN** se avanza de a una neurona
- **THEN** las cuatro operaciones se ven en orden, más breves, en un solo movimiento

#### Scenario: Una capa entera
- **WHEN** se avanza de a una capa
- **THEN** todas las neuronas de la capa reciben y se encienden a la vez, como una ola

#### Scenario: Un cuadro entero en pausa
- **WHEN** se avanza de a un cuadro con la reproducción en pausa
- **THEN** se ve una ola que cruza la red de las entradas a las salidas, y después se mueve el auto

#### Scenario: Tiempo real
- **WHEN** la red se reproduce de a cuadros en tiempo real
- **THEN** los valores se actualizan sin animaciones de paso

#### Scenario: No frena a la persona
- **WHEN** la persona pide otro paso antes de que termine la animación del anterior
- **THEN** la animación en curso se completa al instante y empieza la del paso nuevo

#### Scenario: Al ritmo elegido
- **WHEN** la reproducción avanza sola a 10 pasos por segundo
- **THEN** cada animación dura menos que el intervalo entre pasos y ninguna se encima con la siguiente

#### Scenario: Capa resumida
- **WHEN** el paso cae en una capa resumida
- **THEN** la animación se ve en la banda y en el cuadrito de la neurona

#### Scenario: Menos movimiento
- **WHEN** el sistema pide menos movimiento
- **THEN** nada viaja ni crece: cada paso se marca con un cambio de estado

### Requirement: Elegir una neurona o una conexión
El inspector SHALL permitir elegir una neurona con un clic, en el diagrama o
en la tabla, y avisar cuál se eligió. Con una neurona elegida, sus conexiones
de entrada se destacan y las demás se atenúan, y cada una SHALL poder
elegirse. Siempre hay como mucho una neurona elegida.

#### Scenario: Elegir en el diagrama
- **WHEN** la persona hace clic en una neurona
- **THEN** queda marcada como elegida, sus conexiones de entrada se destacan y el inspector avisa cuál es

#### Scenario: Elegir en la tabla
- **WHEN** la persona hace clic en una celda de la tabla
- **THEN** queda elegida la neurona de esa fila y la conexión de esa celda

#### Scenario: Clic fuera
- **WHEN** la persona hace clic en un lugar vacío del diagrama
- **THEN** la neurona elegida no cambia

#### Scenario: Neurona de entrada
- **WHEN** la persona elige una neurona de entrada
- **THEN** queda elegida, aunque no tenga conexiones de entrada que destacar

### Requirement: Capas resumidas
Cada capa, sea de entradas, oculta o de salidas, SHALL poder resumirse y
volver a abrirse desde su propio encabezado, que está en la red misma, arriba
de la capa, con su nombre y cuántas neuronas tiene. Un solo control resume o
abre todas. Una capa resumida es un bloque angosto de cuadritos pegados, uno
por neurona, que conservan su actividad, y sus conexiones, una sola banda.

#### Scenario: Estado por defecto
- **WHEN** se abre el inspector
- **THEN** todas las capas están abiertas

#### Scenario: Encabezado sobre cada capa
- **WHEN** la persona mira una red con tres capas ocultas
- **THEN** cada una de las cinco capas tiene su encabezado justo arriba, y no hay una fila aparte de botones de capas

#### Scenario: Resumir una capa
- **WHEN** la persona hace clic en el encabezado de la primera capa oculta de una red de 16 neuronas por capa
- **THEN** esa capa pasa a ser un bloque de 16 cuadritos que siguen encendiéndose, sus conexiones se ven como una banda y las otras capas ganan lugar

#### Scenario: Encabezado que sigue a su capa
- **WHEN** la persona acerca o mueve la vista
- **THEN** cada encabezado sigue arriba de su capa y a la vista, aunque la capa no entre entera

#### Scenario: Resumir las entradas o las salidas
- **WHEN** la persona resume la capa de entradas o la de salidas
- **THEN** se resume igual que una capa oculta, y sus nombres se leen al posar el cursor o con el foco en cada cuadrito

#### Scenario: Resumir todas
- **WHEN** la persona usa "Resumir todas"
- **THEN** todas las capas quedan resumidas y el control pasa a ofrecer "Abrir todas"

#### Scenario: Abrir todas
- **WHEN** la persona usa "Abrir todas" con algunas capas resumidas
- **THEN** todas las capas vuelven a verse neurona por neurona

#### Scenario: Volver a abrir una
- **WHEN** la persona vuelve a hacer clic en el encabezado de una capa resumida
- **THEN** esa capa se ve otra vez neurona por neurona

#### Scenario: Elegir un cuadrito
- **WHEN** la persona hace clic en un cuadrito de una capa resumida
- **THEN** esa neurona queda elegida, sin abrir la capa

#### Scenario: Neurona elegida en una capa resumida
- **WHEN** se resume la capa de la neurona elegida
- **THEN** su cuadrito queda marcado y la elección no se pierde

#### Scenario: En la tabla
- **WHEN** la vista es la tabla de pesos y se resume una capa
- **THEN** la tabla de esa capa se reduce a su encabezado, que es el mismo control, y su tira de actividad

#### Scenario: Recorrido que entra a una capa resumida
- **WHEN** el recorrido paso a paso llega a una capa resumida
- **THEN** el cuadrito de la neurona en curso se marca, sin abrir la capa

### Requirement: Conexiones más importantes
El inspector SHALL ofrecer, sobre la red, un filtro de conexiones: todas, por
defecto, o solo las 5, las 3 o la más importante de cada neurona. La
importancia de una conexión es el tamaño de su peso, sin el signo. Las que
quedan fuera del filtro MUST verse muy atenuadas, no desaparecer, y el filtro
MUST NOT cambiar la cuenta.

#### Scenario: Estado por defecto
- **WHEN** se abre el inspector
- **THEN** se ven todas las conexiones

#### Scenario: Las tres más importantes
- **WHEN** la persona elige las 3 más importantes en una red con 6 entradas por neurona
- **THEN** cada neurona muestra destacadas sus 3 conexiones de entrada de mayor peso y las otras 3 muy atenuadas

#### Scenario: La más importante
- **WHEN** la persona elige la más importante
- **THEN** cada neurona muestra destacada una sola conexión de entrada

#### Scenario: Menos conexiones que el filtro
- **WHEN** el filtro es de 5 y una neurona tiene 4 entradas
- **THEN** se destacan las 4

#### Scenario: Empate
- **WHEN** dos conexiones de una neurona tienen el mismo peso sin el signo y solo entra una
- **THEN** entra la de la entrada que está más arriba, siempre la misma

#### Scenario: Peso cambiado
- **WHEN** la persona cambia un peso y deja de estar, o pasa a estar, entre los más importantes
- **THEN** lo destacado se actualiza en el momento

#### Scenario: La cuenta no cambia
- **WHEN** la persona cambia el filtro
- **THEN** el auto maneja igual y los valores de las neuronas no cambian

#### Scenario: En la tabla
- **WHEN** la vista es la tabla de pesos con el filtro en 3
- **THEN** en cada fila se destacan las 3 celdas de mayor peso y las demás se atenúan

#### Scenario: Volver a todas
- **WHEN** la persona vuelve a elegir todas
- **THEN** todas las conexiones se ven como al abrir

### Requirement: Acercar y moverse
El diagrama SHALL poder acercarse, alejarse y moverse con los mismos gestos y
controles de cámara que el escenario de las otras pestañas, y volver a verse
entero con el mismo control de restablecer la vista.

#### Scenario: Estado por defecto
- **WHEN** se abre el inspector
- **THEN** la red se ve entera, ocupando su zona

#### Scenario: Acercarse
- **WHEN** la persona acerca la vista sobre una neurona con la rueda
- **THEN** la red se agranda alrededor del cursor, y los rótulos y los valores siguen legibles

#### Scenario: Restablecer la vista
- **WHEN** la persona restablece la vista
- **THEN** la red vuelve a verse entera

#### Scenario: Zona que cambia de tamaño
- **WHEN** la persona agranda o achica la zona de la red sin haberse acercado
- **THEN** la red sigue viéndose entera

### Requirement: Marcas de lo apagado y lo cambiado
El inspector SHALL mostrar, en las dos vistas, qué neuronas y conexiones
están apagadas y qué pesos y sesgos están cambiados, sin depender solo del
color.

#### Scenario: Neurona apagada
- **WHEN** una neurona está apagada
- **THEN** se ve tachada y atenuada, y sus conexiones de salida también

#### Scenario: Peso cambiado
- **WHEN** un peso está cambiado
- **THEN** su conexión lleva una marca en el diagrama y su celda una marca en la tabla, y las dos muestran el valor nuevo

#### Scenario: Sin cambios
- **WHEN** la red no tiene cambios
- **THEN** no hay ninguna marca

### Requirement: Redes grandes en el inspector
El inspector SHALL seguir siendo legible y fluido con la red más grande que
permite la aplicación: 20 sensores, tres capas ocultas de 16 neuronas y
cuatro salidas.

#### Scenario: Red más grande, diagrama
- **WHEN** se mide la tasa de cuadros durante diez segundos con esa red manejando en tiempo real y el diagrama a la vista
- **THEN** el promedio es de al menos 55 cuadros por segundo

#### Scenario: Red más grande, tabla
- **WHEN** se mide lo mismo con la tabla de pesos a la vista
- **THEN** el promedio es de al menos 55 cuadros por segundo

#### Scenario: Rótulos
- **WHEN** la red tiene 21 entradas
- **THEN** cada entrada tiene su nombre legible o accesible al posar el cursor, sin encimarse

### Requirement: Inspector accesible
Toda neurona, conexión y capa SHALL poder alcanzarse y elegirse con el
teclado, y anunciarse a un lector de pantalla con su nombre, su valor y su
estado. El foco MUST verse siempre. Las animaciones MUST respetar la
preferencia de menos movimiento.

#### Scenario: Recorrer con el teclado
- **WHEN** la persona pone el foco en la red y usa las flechas
- **THEN** el foco pasa de neurona en neurona y de capa en capa, y Enter elige la neurona con foco

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega a una neurona
- **THEN** anuncia su capa, su número o su nombre, su valor y si está elegida, apagada o cambiada

#### Scenario: Encabezado de capa
- **WHEN** un lector de pantalla llega al encabezado de una capa
- **THEN** anuncia su nombre, cuántas neuronas tiene y si está abierta o resumida, y Enter la resume o la abre

#### Scenario: Tabla con encabezados
- **WHEN** un lector de pantalla recorre la tabla de pesos
- **THEN** anuncia cada celda con la neurona de su fila y la entrada de su columna

#### Scenario: Menos movimiento
- **WHEN** el sistema pide menos movimiento
- **THEN** los cambios de vista, de capa y de paso se muestran sin animación
