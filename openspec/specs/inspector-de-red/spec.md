# inspector-de-red Specification

## Purpose
Muestra una red neuronal en grande y deja explorarla: verla como diagrama o
como tabla de pesos, resumir capas, elegir una neurona o una conexión,
acercarse, y distinguir de un vistazo qué se está calculando, qué está
apagado y qué se cambió.

## Requirements

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
cuenta cambia, sin demora visible. Lo todavía no calculado en un recorrido
paso a paso (una entrada sin leer, una neurona, un aporte) MUST verse distinto
de lo calculado que vale cero. Lo que se marca como en curso MUST ser del
tamaño del paso: una conexión, una neurona o una capa entera.

#### Scenario: Red manejando
- **WHEN** el auto maneja y sus sensores cambian
- **THEN** el relleno de las neuronas cambia en el mismo cuadro, en el diagrama y en la tabla

#### Scenario: A medio calcular
- **WHEN** el recorrido paso a paso va por la segunda neurona de una capa
- **THEN** la primera muestra su valor, la segunda está marcada como la que se calcula y las demás se ven sin calcular

#### Scenario: Capa en curso
- **WHEN** el recorrido avanza de a neuronas
- **THEN** las conexiones que entran a la neurona en curso se destacan y las demás se atenúan

#### Scenario: De a capas
- **WHEN** el recorrido avanza de a capas
- **THEN** la capa en curso entera lleva la marca de en curso, como un solo marco alrededor de sus neuronas o de sus cuadritos, y todas las conexiones que le entran se destacan, no solo las de su primera neurona

#### Scenario: Mientras se anima una capa
- **WHEN** se anima el paso de una capa
- **THEN** las marcas viajan por todas las conexiones que entran a esa capa, y ninguna de esas conexiones está atenuada

#### Scenario: De a cuadros
- **WHEN** el recorrido avanza de a cuadros, en pausa o reproduciendo
- **THEN** ninguna neurona ni capa lleva la marca de en curso y nada se atenúa por el recorrido

#### Scenario: Cambiar el tamaño del paso
- **WHEN** la persona pasa de neuronas a capas con una capa a medio hacer
- **THEN** la marca pasa de la neurona a su capa entera, y las neuronas ya calculadas conservan su valor

#### Scenario: De a operaciones
- **WHEN** el recorrido avanza de a operaciones y acaba de multiplicar o de sumar la tercera entrada de una neurona
- **THEN** se destaca solo esa conexión, con sus dos extremos; las ya sumadas de esa neurona muestran su aporte sin destacarse; las que faltan se ven sin calcular, y el resto de la red se atenúa

#### Scenario: Lo destacado es lo que se acaba de hacer
- **WHEN** la persona avanza una operación y mira la red, la franja y la tarjeta
- **THEN** las tres marcan la misma operación, la que se acaba de hacer: la conexión destacada, la fila en curso de la tarjeta y la marca en curso del recorrido de la neurona son de la entrada que nombra la franja, no de la siguiente

#### Scenario: Antes del primer paso de un cuadro
- **WHEN** la cuenta del cuadro todavía no empezó y el recorrido es de a operaciones
- **THEN** la marca de en curso está en la primera entrada, que es lo que hará el paso siguiente, y la franja lo dice

#### Scenario: Cuenta sobre la conexión
- **WHEN** se multiplica una entrada
- **THEN** sobre esa conexión se lee el valor por el peso y, al terminar, el aporte

#### Scenario: Suma que se va juntando
- **WHEN** se sumaron tres de seis aportes de una neurona
- **THEN** junto a la neurona se lee la suma hasta acá, y la neurona todavía no muestra salida

#### Scenario: Entradas sin leer
- **WHEN** empieza la cuenta de un cuadro paso a paso
- **THEN** las entradas se ven sin leer hasta que su paso las lee

#### Scenario: Vista de pesos
- **WHEN** el recorrido avanza de a operaciones con la vista de pesos
- **THEN** la celda de la conexión en curso lleva la marca de en curso y las que faltan se ven sin calcular

#### Scenario: Sin detalle fino
- **WHEN** la cuenta que se le pasa al inspector no dice qué entradas van hechas, como en el Laboratorio
- **THEN** los aportes de una neurona aparecen todos juntos, como hasta ahora

### Requirement: Paso animado
Cada paso del recorrido SHALL verse como un movimiento, no como un salto:
leer una entrada, como su relleno que llega al valor; multiplicar, como una
marca que viaja por esa sola conexión; sumar, como esa marca que entra a la
neurona; el sesgo, en su contorno; y la activación, como el relleno que llega
a su valor. Un paso de una neurona, una capa o un cuadro encadena esos
movimientos. Lo animado MUST ser el valor real.

#### Scenario: Productos
- **WHEN** se multiplica una entrada de una neurona
- **THEN** por esa conexión, y solo por esa, viaja una marca desde su origen hasta la neurona, con el color del signo y el tamaño del aporte

#### Scenario: Suma, sesgo y activación
- **WHEN** se suma un aporte, y más adelante se avanzan el sesgo y la activación
- **THEN** la marca entra a la neurona y el rótulo de la suma pasa al valor nuevo; después se marca su contorno con el sesgo y se llena su relleno hasta la salida

#### Scenario: Una neurona entera
- **WHEN** se avanza de a una neurona
- **THEN** todas sus operaciones se ven en orden, más breves, en un solo movimiento

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
- **THEN** la animación se ve en las líneas que llegan a su cuadrito y en el cuadrito

#### Scenario: Menos movimiento
- **WHEN** el sistema pide menos movimiento
- **THEN** nada viaja ni crece: cada paso se marca con un cambio de estado

#### Scenario: Leer una entrada
- **WHEN** se lee una entrada
- **THEN** su neurona pasa de sin leer a mostrar su valor, con el relleno que llega a ese valor

#### Scenario: Paso atrás
- **WHEN** la persona vuelve un paso
- **THEN** la red muestra el estado anterior sin animación

### Requirement: Elegir una neurona o una conexión
El inspector SHALL permitir elegir con un clic una neurona o una conexión, en
el diagrama o en la tabla, y avisar cuál se eligió. Hay como mucho una cosa
elegida. Lo elegido SHALL poder soltarse con otro clic sobre lo mismo, con un
clic en un lugar vacío o con Escape. Al elegir, lo relacionado se destaca y
el resto se atenúa sin desaparecer.

#### Scenario: Elegir en el diagrama
- **WHEN** la persona hace clic en una neurona
- **THEN** queda marcada como elegida, se destacan las conexiones que le entran y las que salen de ella, y el inspector avisa cuál es

#### Scenario: Elegir una conexión en el diagrama
- **WHEN** la persona hace clic sobre una línea
- **THEN** esa conexión queda elegida, se destaca junto con sus dos neuronas, y el inspector avisa de dónde a dónde va

#### Scenario: Elegir en la tabla
- **WHEN** la persona hace clic en una celda de la tabla
- **THEN** queda elegida la conexión de esa celda

#### Scenario: Soltar con otro clic
- **WHEN** la persona hace clic otra vez en lo que está elegido
- **THEN** nada queda elegido y la red vuelve a verse entera

#### Scenario: Clic fuera
- **WHEN** la persona hace clic en un lugar vacío del diagrama sin arrastrar
- **THEN** nada queda elegido

#### Scenario: Soltar con Escape
- **WHEN** el foco está en la red, hay algo elegido y la persona presiona Escape
- **THEN** nada queda elegido

#### Scenario: Arrastrar no suelta
- **WHEN** la persona arrastra el diagrama para moverlo con algo elegido
- **THEN** lo elegido sigue elegido

#### Scenario: Neurona antes que línea
- **WHEN** el clic cae sobre una neurona por la que pasan líneas
- **THEN** se elige la neurona

#### Scenario: Línea más cercana
- **WHEN** el clic cae a menos de 6 píxeles de varias líneas
- **THEN** se elige la más cercana y, con una neurona elegida, primero las suyas

#### Scenario: Lo demás no desaparece
- **WHEN** hay algo elegido
- **THEN** las conexiones que no están relacionadas siguen viéndose, atenuadas

#### Scenario: Neurona de entrada
- **WHEN** la persona elige una neurona de entrada
- **THEN** queda elegida y se destacan las conexiones que salen de ella

### Requirement: Capas resumidas
Cada capa, sea de entradas, oculta o de salidas, SHALL poder resumirse y
volver a abrirse desde su propio encabezado, que está en la red misma, arriba
de la capa, con su nombre y cuántas neuronas tiene. Un solo control resume o
abre todas. Una capa resumida es un bloque angosto de cuadritos pegados, uno
por neurona, que conservan su actividad. Sus conexiones MUST seguir viéndose,
de cuadrito a cuadrito, con el mismo aspecto y comportamiento que entre capas
abiertas.

#### Scenario: Estado por defecto
- **WHEN** se abre el inspector
- **THEN** todas las capas están abiertas

#### Scenario: Encabezado sobre cada capa
- **WHEN** la persona mira una red con tres capas ocultas
- **THEN** cada una de las cinco capas tiene su encabezado justo arriba, y no hay una fila aparte de botones de capas

#### Scenario: Resumir una capa
- **WHEN** la persona hace clic en el encabezado de la primera capa oculta de una red de 16 neuronas por capa
- **THEN** esa capa pasa a ser un bloque de 16 cuadritos que siguen encendiéndose, sus conexiones siguen dibujadas hasta cada cuadrito y las otras capas ganan lugar

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

#### Scenario: Todas resumidas
- **WHEN** la persona resume todas las capas de una red de 21, 11, 11 y 4 neuronas
- **THEN** entre cada par de capas se ven sus conexiones como líneas de un cuadrito a otro, con el color y el trazo del signo y el grosor del peso; no hay una banda uniforme en su lugar

#### Scenario: Filtro de conexiones con capas resumidas
- **WHEN** las capas están resumidas y la persona elige ver la conexión más importante de cada neurona
- **THEN** queda destacada una línea por neurona y las demás se atenúan, igual que con las capas abiertas

#### Scenario: Grosor entre cuadritos
- **WHEN** una conexión llega a una capa resumida o sale de ella
- **THEN** su línea no es más gruesa que la mitad del lado de un cuadrito, y la más fina sigue midiendo al menos 1 píxel

#### Scenario: Elegir una conexión entre capas resumidas
- **WHEN** la persona hace clic sobre una línea entre dos capas resumidas
- **THEN** esa conexión queda elegida con su detalle, como entre capas abiertas, sin abrir ninguna capa

#### Scenario: Vista previa entre capas resumidas
- **WHEN** la persona posa el cursor sobre un cuadrito
- **THEN** se destacan las conexiones de esa neurona y las demás se atenúan

#### Scenario: Flujo entre capas resumidas
- **WHEN** el flujo de la señal está encendido y hay capas resumidas
- **THEN** el flujo corre también por las líneas que llegan a los cuadritos

#### Scenario: Una capa resumida y su vecina abierta
- **WHEN** una capa está resumida y la siguiente abierta
- **THEN** las líneas van de cada cuadrito a cada neurona abierta

#### Scenario: Red más grande, todo resumido
- **WHEN** se mide la tasa de cuadros durante diez segundos con la red más grande que permite la aplicación, todas sus capas resumidas y todas las conexiones a la vista
- **THEN** el promedio es de al menos 55 cuadros por segundo

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

### Requirement: La vuelta en la red
El inspector SHALL poder mostrar, además de la ida, la vuelta de un
aprendizaje: la culpa de cada neurona, con su signo y su tamaño, distinta a
la vista de su actividad; y qué pesos cambian y cuánto. Sin un aprendizaje
que mostrar, la vista MUST verse como en Inspeccionar.

#### Scenario: Culpa a la vista
- **WHEN** se le pasa al inspector la culpa de cada neurona de un ejemplo
- **THEN** cada neurona muestra su culpa con una marca propia, sin tapar su actividad, y sin depender solo del color

#### Scenario: Peso que cambia
- **WHEN** se le pasa la corrección de cada peso
- **THEN** cada conexión muestra si su peso sube o baja y cuánto, y después queda con su valor nuevo

#### Scenario: Sin vuelta
- **WHEN** no se le pasa ninguna culpa ni corrección
- **THEN** la red se ve igual que en Inspeccionar

#### Scenario: En la tabla de pesos
- **WHEN** la vista es la tabla de pesos durante una corrección
- **THEN** cada celda muestra su valor nuevo y una marca de cuánto cambió

### Requirement: Vuelta animada
Cada paso de la vuelta y de la corrección SHALL verse como un movimiento, con
los valores reales: la culpa viaja hacia atrás por cada conexión, de la
neurona siguiente a la anterior, y cada peso corregido cambia de grosor hasta
su valor nuevo. Valen las reglas del paso animado de la ida: no frena a la
persona, entra en el ritmo elegido y respeta la preferencia de menos
movimiento.

#### Scenario: La culpa viaja hacia atrás
- **WHEN** se avanza la culpa de una neurona oculta
- **THEN** por cada conexión que sale de ella viaja una marca desde la neurona siguiente hasta ella, en sentido contrario al de la ida

#### Scenario: Se distingue de la ida
- **WHEN** la persona mira un paso de la vuelta
- **THEN** se distingue de un paso de la ida por el sentido del movimiento y por la forma de la marca, no solo por el color

#### Scenario: Corrección de una capa
- **WHEN** se avanza la corrección de una capa
- **THEN** las conexiones que entran a esa capa cambian a la vez hasta su valor nuevo

#### Scenario: Aprendizaje de corrido
- **WHEN** el aprendizaje corre de a épocas o de a ejemplos
- **THEN** los pesos se ven cambiar sin animaciones de paso

#### Scenario: Menos movimiento
- **WHEN** el sistema pide menos movimiento
- **THEN** nada viaja: cada paso se marca con un cambio de estado

### Requirement: Estado sin nada elegido
El inspector SHALL mostrar la red sin nada elegido, y ese es su estado al
abrir en todas las pestañas que lo usan: ninguna conexión se destaca ni se
atenúa por elección, y la red se ve entera y pareja.

#### Scenario: Nada elegido
- **WHEN** no hay nada elegido
- **THEN** todas las conexiones se ven con su grosor, su trazo y su brillo, y ninguna neurona lleva la marca de elegida

#### Scenario: Estado por defecto
- **WHEN** se abre Inspeccionar o el Laboratorio
- **THEN** no hay nada elegido

### Requirement: Conexiones siempre visibles
Toda conexión con peso distinto de cero SHALL verse. El grosor es relativo al
peso más grande de la red, sin el signo, con un mínimo que se distingue; el
signo va con color y trazo; y el brillo dice cuánta señal pasa ahora, sin
bajar de un piso. El piso y el grosor máximo MUST bajar con la cantidad de
conexiones entre dos capas, para que una red densa no sea una mancha.

#### Scenario: Red de pesos chicos
- **WHEN** se muestra una red cuyos pesos no pasan de 0,25
- **THEN** la conexión de mayor peso se ve con el grosor máximo y las demás en proporción, no todas con el mínimo

#### Scenario: Cerebro de ejemplo
- **WHEN** se abre Inspeccionar con el cerebro de ejemplo de la calle y nada elegido
- **THEN** las 60 conexiones se distinguen del fondo, cada una con al menos 1,5 píxeles de grosor

#### Scenario: Sin señal
- **WHEN** por una conexión no pasa señal en este cuadro
- **THEN** se ve con el piso de brillo, no desaparece

#### Scenario: Con señal
- **WHEN** por una conexión pasa la mayor señal del cuadro
- **THEN** es la más brillante

#### Scenario: Peso cero
- **WHEN** una conexión tiene peso cero
- **THEN** se ve como una línea fina y gris, distinta de una apagada

#### Scenario: Peso cambiado a mano
- **WHEN** la persona lleva un peso a un valor mayor que todos los demás
- **THEN** esa conexión pasa a ser la más gruesa y las demás se afinan en proporción

#### Scenario: Red densa
- **WHEN** se muestra la red más grande que permite la aplicación, sin nada elegido
- **THEN** se distinguen las capas y las conexiones más fuertes, y el conjunto no es una mancha uniforme

#### Scenario: Grosor entre capas densas
- **WHEN** dos capas vecinas tienen 256 conexiones o más entre ellas
- **THEN** la más gruesa de esas conexiones mide 4 píxeles o menos, y la más fina sigue midiendo al menos 1,5

#### Scenario: Mismo aspecto, misma red
- **WHEN** se muestra dos veces la misma red con la misma cuenta
- **THEN** cada conexión tiene el mismo grosor y el mismo brillo

### Requirement: Neuronas que usan el espacio
El tamaño de las neuronas SHALL salir del lugar que hay: crecen hasta llenar
el alto y el ancho que les toca, con un máximo de 44 píxeles de radio. Al
resumir una capa, las neuronas de las capas abiertas MUST crecer si esa capa
era la que las limitaba.

#### Scenario: Red chica
- **WHEN** se muestra una red de 6 entradas, 6 ocultas y 4 salidas en una zona de 708×648 píxeles
- **THEN** cada neurona mide al menos 30 píxeles de radio

#### Scenario: Resumir la capa más alta
- **WHEN** la persona resume la capa de 21 entradas de una red cuyas otras capas tienen 8 neuronas o menos
- **THEN** las neuronas de las otras capas se ven más grandes que antes

#### Scenario: Sin encimarse
- **WHEN** se muestra cualquier red que la aplicación permite
- **THEN** ninguna neurona toca a su vecina ni tapa un rótulo

#### Scenario: Zona que cambia de tamaño
- **WHEN** la persona agranda la zona de la red
- **THEN** las neuronas crecen con ella, hasta el máximo

### Requirement: Neurona por dentro
Cada neurona SHALL mostrar adentro tanto detalle como le entra. Chica, solo su
relleno. Mediana, su valor en números. Grande, además dónde cae su suma en la
activación. Muy grande, además su suma y su sesgo. El detalle MUST cambiar
solo con el tamaño en pantalla, sea por el lugar, por resumir capas o por
acercar.

#### Scenario: Neurona mediana
- **WHEN** una neurona mide 12 píxeles de radio o más
- **THEN** muestra su valor con dos decimales

#### Scenario: Neurona grande
- **WHEN** una neurona oculta o de salida mide 24 píxeles de radio o más
- **THEN** muestra su valor y una marca de dónde cae su suma en la curva de su activación

#### Scenario: Neurona muy grande
- **WHEN** una neurona mide 40 píxeles de radio o más
- **THEN** muestra además su suma y su sesgo con su nombre

#### Scenario: Al acercar
- **WHEN** la persona acerca la vista sobre una red de neuronas chicas
- **THEN** las neuronas pasan a mostrar su valor y después su detalle, sin que la persona elija nada

#### Scenario: Sin calcular
- **WHEN** una neurona todavía no se calculó en un recorrido paso a paso
- **THEN** no muestra ningún número

### Requirement: Vista previa al posar el cursor
Al posar el cursor sobre una neurona o una conexión, el inspector SHALL
destacarla como si estuviera elegida, sin elegirla, y mostrar junto al cursor
una lectura breve: qué es y cuánto vale. Al sacar el cursor, la red MUST
volver a como estaba. La lectura no es una ayuda de la guía: aparece siempre.

#### Scenario: Cursor sobre una neurona
- **WHEN** la persona posa el cursor sobre una neurona oculta
- **THEN** se destacan sus conexiones y una lectura dice su nombre, su valor, su suma y su sesgo

#### Scenario: Cursor sobre una conexión
- **WHEN** la persona posa el cursor sobre una línea
- **THEN** la línea se destaca y una lectura dice de dónde a dónde va, su peso y cuánto aporta ahora

#### Scenario: Sacar el cursor
- **WHEN** la persona saca el cursor sin hacer clic
- **THEN** la red vuelve a verse como antes, con lo que estaba elegido si había algo

#### Scenario: Con la guía apagada
- **WHEN** la guía está apagada y la persona posa el cursor sobre una neurona
- **THEN** la lectura aparece igual

#### Scenario: Sin demora
- **WHEN** la persona mueve el cursor de una neurona a otra
- **THEN** lo destacado y la lectura cambian en el mismo cuadro

#### Scenario: No tapa
- **WHEN** aparece la lectura
- **THEN** no tapa la neurona ni la línea que describe

### Requirement: Números sobre las conexiones
Con una neurona elegida, cada conexión que le entra SHALL mostrar su peso
sobre la línea, mientras haya lugar. Con una conexión elegida, esa conexión
muestra su peso. Los números MUST seguir legibles al acercar y no encimarse
entre sí.

#### Scenario: Neurona elegida
- **WHEN** la persona elige una neurona con 6 conexiones de entrada
- **THEN** cada una de las 6 líneas lleva su peso con dos decimales

#### Scenario: Sin lugar
- **WHEN** la neurona elegida tiene 21 entradas y los números se encimarían
- **THEN** llevan número solo las de mayor peso que entran sin encimarse, y las demás se leen al posar el cursor

#### Scenario: Nada elegido
- **WHEN** no hay nada elegido
- **THEN** ninguna línea lleva número

### Requirement: Cambiar un peso en el lugar
La conexión elegida SHALL llevar sobre la línea una pastilla con su peso, que
se puede arrastrar o mover con las flechas para cambiarlo, cuando la pestaña
permite cambios. El efecto MUST verse mientras se mueve, y el detalle del
panel MUST mostrar el mismo valor. Cuenta como un cambio que se deshace.

#### Scenario: Arrastrar la pastilla
- **WHEN** la persona arrastra la pastilla hacia arriba
- **THEN** el peso sube, la línea engrosa y la red recalcula mientras la mueve

#### Scenario: Con el teclado
- **WHEN** la pastilla tiene el foco y la persona usa las flechas
- **THEN** el peso cambia de a 0,01, y de a 0,1 con Mayús

#### Scenario: Un arrastre es un cambio
- **WHEN** la persona arrastra la pastilla y la suelta
- **THEN** cuenta como un solo cambio y "Deshacer" lo vuelve atrás

#### Scenario: Mismo valor en el panel
- **WHEN** la persona mueve la pastilla
- **THEN** el deslizador del detalle se mueve con ella

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega a la pastilla
- **THEN** la anuncia como un deslizador, con de dónde a dónde va la conexión y su valor

### Requirement: De dónde viene una neurona
Con una neurona elegida, el inspector SHALL destacar todo el camino hacia
atrás, hasta las entradas, con cada tramo según cuánto aporta a lo que esa
neurona recibe. El filtro de conexiones MUST limitar cuántos tramos se siguen
desde cada neurona del camino.

#### Scenario: Rastro de una decisión
- **WHEN** la persona elige una salida de una red con dos capas ocultas
- **THEN** se destacan las conexiones que le entran y, detrás de cada una, las que alimentan a esa neurona, hasta los sensores

#### Scenario: Lo que más aporta
- **WHEN** un sensor aporta la mayor parte de lo que recibe la salida elegida
- **THEN** el camino desde ese sensor es el más destacado

#### Scenario: Un solo camino
- **WHEN** el filtro de conexiones está en la más importante
- **THEN** desde la neurona elegida se destaca un solo camino hasta una entrada

#### Scenario: Cambia con la señal
- **WHEN** el auto maneja y los sensores cambian
- **THEN** el camino destacado cambia con ellos

### Requirement: Flujo de la señal
Cuando la pestaña lo pide, el inspector SHALL mostrar marcas que viajan por
las conexiones por las que pasa señal, de las entradas a las salidas, con el
color del signo y más marcas donde pasa más. MUST poder apagarse, MUST NOT
mostrarse durante un paso a paso, y MUST respetar la preferencia de menos
movimiento.

#### Scenario: Red manejando
- **WHEN** la red se reproduce en tiempo real con el flujo encendido
- **THEN** por las conexiones con señal viajan marcas hacia la capa siguiente

#### Scenario: Sin señal
- **WHEN** por una conexión no pasa señal
- **THEN** no lleva marcas

#### Scenario: Paso a paso
- **WHEN** la persona avanza de a un paso
- **THEN** el flujo no se muestra y se ve la animación del paso

#### Scenario: En pausa
- **WHEN** la reproducción está en pausa
- **THEN** las marcas se detienen

#### Scenario: Menos movimiento
- **WHEN** el sistema pide menos movimiento
- **THEN** no hay marcas que viajen

### Requirement: Pocos colores con significado
El diagrama SHALL usar un solo par de colores para el signo, uno para lo
elegido y uno para el paso en curso; el aprendizaje suma uno para la culpa.
Lo apagado, lo cambiado y lo puesto a mano MUST marcarse con forma, sin un
color propio. Los dos colores del signo MUST distinguirse con las formas
comunes de daltonismo, además del trazo.

#### Scenario: Par del signo
- **WHEN** se validan los dos colores del signo contra el fondo de la red
- **THEN** su separación con deuteranopia, protanopia y tritanopia es de 8 o más, y su contraste con el fondo, de 3 a 1 o más

#### Scenario: Cambiado a mano
- **WHEN** un peso está cambiado a mano
- **THEN** su conexión lleva una marca con forma, del color del texto

#### Scenario: Sin color
- **WHEN** la persona no distingue los colores
- **THEN** distingue positivo de negativo por el trazo, y lo elegido, lo que se calcula, lo apagado y lo cambiado por su forma

### Requirement: Mapa dentro de la neurona
Cuando la pestaña le pasa un mapa por neurona, el inspector SHALL dibujarlo
adentro de cada neurona abierta que mida 20 píxeles de radio o más, en lugar
de su relleno, con su valor encima. Sin mapas, las neuronas se ven como
siempre.

#### Scenario: Con mapas
- **WHEN** la pestaña pasa un mapa para cada neurona oculta
- **THEN** cada una muestra su mapa adentro, recortado a su círculo

#### Scenario: Neurona chica
- **WHEN** una neurona mide menos de 20 píxeles de radio
- **THEN** muestra su relleno de siempre

#### Scenario: Sin mapas
- **WHEN** la pestaña no pasa mapas
- **THEN** el inspector se ve igual que sin esta opción

### Requirement: Perillas de pesos y sesgos sobre la red
Cuando la pestaña lo pide, el diagrama SHALL llevar pastillas para cambiar
pesos y sesgos en el lugar. Con hasta 16 conexiones, cada conexión lleva la
pastilla de su peso y cada neurona que no es de entrada, la de su sesgo. Con
más, solo las conexiones que entran a la neurona elegida y su sesgo. Funcionan
como la pastilla de "Cambiar un peso en el lugar".

#### Scenario: Red chica
- **WHEN** la pestaña pide perillas y la red es 2 → 2 → 1
- **THEN** se ven seis pastillas de peso y tres de sesgo, sin elegir nada

#### Scenario: Red grande
- **WHEN** la pestaña pide perillas, la red es 2 → 8 → 8 → 1 y la persona elige una neurona de la segunda capa oculta
- **THEN** se ven las ocho pastillas de las conexiones que le entran y la de su sesgo, y ninguna otra

#### Scenario: Sin pedirlas
- **WHEN** la pestaña no pide perillas
- **THEN** solo la conexión elegida lleva pastilla, como hasta ahora

#### Scenario: Pastilla del sesgo
- **WHEN** la persona arrastra hacia arriba la pastilla del sesgo de una neurona
- **THEN** el sesgo sube, el contorno de la neurona lo muestra y la red recalcula mientras la mueve

#### Scenario: No se tapan
- **WHEN** la red tiene hasta 16 conexiones en cualquier forma que arme el Laboratorio, a 1440×900 y 1366×768
- **THEN** ninguna pastilla tapa a otra ni a una neurona, y cada una queda sobre su conexión o junto a su neurona

#### Scenario: Siguen al aprendizaje
- **WHEN** la red aprende con las pastillas a la vista
- **THEN** cada pastilla muestra el valor de ahora de su peso o su sesgo

#### Scenario: Con el teclado
- **WHEN** la persona recorre la red con Tab
- **THEN** pasa por cada pastilla en orden, de la primera capa a la última, y cada una cambia con las flechas de a 0,01, y de a 0,1 con Mayús

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega a la pastilla de un sesgo
- **THEN** la anuncia como un deslizador, con de qué neurona es el sesgo y su valor

### Requirement: Perillas de las entradas
Cuando la pestaña lo pide, cada neurona de entrada SHALL llevar a su lado un
control de su valor: un interruptor de dos valores o una pastilla continua,
según lo que pida la pestaña. Cambiarlo MUST recalcular la red en el momento.
El control no cambia la red ni cuenta como cambio a mano.

#### Scenario: Interruptor
- **WHEN** la pestaña pide interruptores de 0 y 1 y la persona activa el de una entrada que vale 0
- **THEN** la entrada pasa a valer 1 y la red recalcula

#### Scenario: Pastilla continua
- **WHEN** la pestaña pide pastillas de −1 a 1 y la persona arrastra la de una entrada
- **THEN** la entrada cambia mientras arrastra y la red recalcula

#### Scenario: No es un cambio a mano
- **WHEN** la persona cambia una entrada desde su control
- **THEN** el contador de cambios a mano no sube

#### Scenario: Elegir la neurona sigue igual
- **WHEN** la persona hace clic sobre la neurona de entrada, no sobre su control
- **THEN** la neurona queda elegida, como hasta ahora

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega al interruptor de una entrada
- **THEN** lo anuncia como un interruptor, con el nombre de la entrada y su valor

### Requirement: Lo que titubea, quieto
Con la red corriendo, una neurona o conexión que va a cambiar mucho de brillo
por cuarta vez en un mismo segundo SHALL mostrarse quieta: relleno o trazo con el
promedio del último medio segundo, un rayado fijo que la marca y su número
con "≈". Vuelve a lo exacto tras un segundo quieta. En pausa o paso a paso,
todo se ve exacto.

#### Scenario: Neurona en el borde
- **WHEN** el total de una neurona con escalón ronda el cero y su valor salta entre 0 y 1 en cada cuadro
- **THEN** la neurona deja de destellar, se ve rayada con un relleno intermedio y su número dice, por ejemplo, "≈ 0,40"

#### Scenario: Los primeros cambios se ven
- **WHEN** una neurona cambia de 0 a 1 y vuelve una sola vez en un segundo
- **THEN** se ven los dos cambios, exactos, sin rayado

#### Scenario: Se calma
- **WHEN** una neurona rayada se queda en el mismo valor durante un segundo
- **THEN** pierde el rayado y vuelve a mostrar su valor exacto

#### Scenario: Pausa exacta
- **WHEN** la persona pausa con una neurona rayada
- **THEN** la neurona muestra el valor exacto del cuadro en pausa, sin rayado ni "≈"

#### Scenario: Conexiones
- **WHEN** el aporte de una conexión salta entre cero y su peso en cada cuadro
- **THEN** la conexión se ve quieta, con el brillo del promedio y punteada en fino, en el diagrama y en la tabla de pesos

#### Scenario: Qué es el rayado
- **WHEN** la persona posa el cursor sobre una neurona rayada o mira la leyenda
- **THEN** un texto, en español y en inglés, dice que la neurona cambia de valor más rápido de lo que se puede mostrar sin destellar, que se ve su promedio y que en pausa se ve el valor exacto

#### Scenario: Tarjeta de la neurona
- **WHEN** la neurona elegida titubea
- **THEN** la tarjeta dice que titubea entre sus dos valores y en qué parte del último segundo valió cada uno

#### Scenario: La red decide igual
- **WHEN** una neurona se muestra rayada
- **THEN** la red sigue calculando y manejando con los valores exactos de cada cuadro
