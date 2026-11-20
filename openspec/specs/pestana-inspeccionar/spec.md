# pestana-inspeccionar Specification

## Purpose
Es la pestaña 5, "Inspeccionar": pone una red neuronal en el centro de la
pantalla mientras maneja un auto, y deja detenerla, seguir su cuenta paso a
paso, probar qué decide con otras entradas y ver qué cambia al apagarle una
parte o al cambiarle un peso. Sirve para entender qué tiene adentro lo que
se entrenó.

## Requirements

### Requirement: Lista para mirar al abrir
Al abrirse, la pestaña SHALL mostrar, sin configurar nada, un cerebro
manejando y su red en grande, en tiempo real: el último entrenamiento de la
persona si existe, y si no, el cerebro de ejemplo de la calle con tráfico
nuevo. El auto SHALL manejar en una pista donde ese cerebro entrenó.

#### Scenario: Con un entrenamiento hecho
- **WHEN** la persona entrenó en el óvalo y abre Inspeccionar
- **THEN** ve la red de ese entrenamiento encendiéndose y el auto manejando en el óvalo

#### Scenario: Sin haber entrenado nunca
- **WHEN** la persona abre Inspeccionar sin haber entrenado ni guardado nada
- **THEN** ve la red del cerebro de ejemplo de la calle con tráfico nuevo, manejando en la calle recta

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña por primera vez
- **THEN** la red se ve como diagrama, con todas las capas abiertas, corriendo en tiempo real, sin nada elegido y con todas las conexiones a la vista

#### Scenario: Misma semilla, misma escena
- **WHEN** con el mismo cerebro y los mismos ajustes, el mundo se arma dos veces con la misma semilla de tráfico
- **THEN** el auto hace lo mismo las dos veces

#### Scenario: Cada apertura, otro tráfico
- **WHEN** la persona abre la pestaña dos veces en la calle recta con el mismo cerebro y los mismos ajustes
- **THEN** cada vez el tráfico es otro, elegido al azar

### Requirement: La red en el centro
La pestaña SHALL mostrar la escena del auto en la zona izquierda, con la decisión de la red debajo; la red en la zona central, que es la más ancha; y en el panel, lo que se sabe y se puede cambiar de la neurona elegida. Las zonas conservan los divisores para cambiarles el ancho. En una ventana angosta la zona izquierda MUST ceder ancho primero, y la red después, antes de que el panel deje de leerse.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900
- **THEN** la escena ocupa el alto de la zona izquierda con la decisión debajo, la red ocupa la zona central, y el panel muestra el cerebro, la neurona elegida y las misiones, sin desplazar ninguna zona

#### Scenario: Anchos por defecto
- **WHEN** se abre la pestaña por primera vez con la ventana en 1440 píxeles de ancho
- **THEN** la zona izquierda mide 400 píxeles, el panel 360 y la red ocupa todo lo demás

#### Scenario: Agrandar la red
- **WHEN** la persona mueve un divisor para agrandar la zona de la red
- **THEN** la red crece y la escena conserva su encuadre

#### Scenario: La red no se achica de más
- **WHEN** la persona mueve un divisor para achicar la zona de la red
- **THEN** la red no baja de 600 píxeles de ancho mientras la ventana deje 280 para la zona izquierda

#### Scenario: Anchos propios
- **WHEN** la persona cambia el ancho de la red en Inspeccionar y pasa a otra pestaña
- **THEN** la otra pestaña conserva sus anchos, e Inspeccionar recuerda el suyo al volver

#### Scenario: Orden del foco
- **WHEN** la persona recorre la pestaña con Tab
- **THEN** el foco pasa por la escena y la decisión, después por la red y sus controles y al final por el panel

#### Scenario: Ventana angosta
- **WHEN** la ventana mide entre 1032 y 1240 píxeles de ancho
- **THEN** la zona izquierda mide al menos 280 píxeles, la red cede ancho sin bajar de 440, y los nombres de las cuatro decisiones se leen enteros

#### Scenario: Ventana en su mínimo
- **WHEN** la ventana mide entre 960 y 1032 píxeles de ancho
- **THEN** la red mide 440 píxeles, la zona izquierda se queda con lo que sobra, no menos de 200, y los nombres de las cuatro decisiones se leen enteros

#### Scenario: Barra de arriba en ventana angosta
- **WHEN** la zona de la red mide entre 500 y 600 píxeles de ancho, en español o en inglés
- **THEN** sus controles de arriba ocupan dos renglones o menos; con 440 píxeles, tres o menos

### Requirement: Escena del auto en segundo plano
La escena SHALL mostrar al auto con sus sensores, siguiéndolo, con los controles de cámara de El problema: seguir al auto, acercar y alejar con botones y con la rueda. Por defecto, el encuadre deja ver enteros los rayos y lo que tocan. Si el auto choca, la pestaña SHALL mostrar el caso del choque (ver *Caso del choque en Inspeccionar*) y no volver a empezar sola. La pista, el tráfico y la velocidad se cambian en la barra de escenario, que no muestra los sensores: los trae el cerebro.

#### Scenario: Encuadre
- **WHEN** el auto maneja y la persona no tocó la cámara
- **THEN** la escena lo sigue y se ven enteros sus rayos y lo que tocan

#### Scenario: Acercar
- **WHEN** la persona usa la rueda sobre la escena o el botón de acercar
- **THEN** la escena se acerca al auto, sin mover la página ni la red

#### Scenario: Volver al encuadre
- **WHEN** la persona acercó la escena y elige seguir al auto
- **THEN** la escena vuelve al encuadre por defecto

#### Scenario: Choque
- **WHEN** el auto choca
- **THEN** la reproducción se congela en el cuadro del choque y aparece el caso; el intento no vuelve a empezar hasta que la persona reinicia o reintenta

#### Scenario: Cambiar de pista
- **WHEN** la persona elige otra pista en la barra
- **THEN** el intento vuelve a empezar en esa pista, con la misma red y los mismos cambios de prueba

#### Scenario: Restablecer el escenario
- **WHEN** la persona restablece el escenario
- **THEN** la barra vuelve a la pista y el tráfico donde entrenó el cerebro

### Requirement: Elegir el cerebro
El panel SHALL mostrar qué cerebro se inspecciona, con su nombre, dónde
entrenó y la forma de su red, y un botón que abre un selector con los
cerebros de la persona y los de ejemplo. Elegir otro SHALL mostrar su red en
el momento y pasar la barra a una pista donde entrenó. El nombre del cerebro
SHALL verse también sobre la red.

#### Scenario: Elegir otro cerebro
- **WHEN** la persona elige su cerebro guardado "Prudente", entrenado en el circuito de curvas
- **THEN** la red pasa a ser la de "Prudente", el auto maneja en el circuito de curvas y la tarjeta muestra una neurona de esa red

#### Scenario: Forma de la red a la vista
- **WHEN** se inspecciona un cerebro de 5 sensores con una capa oculta de 6
- **THEN** el panel dice que su red tiene 6 entradas, 6 neuronas ocultas y 4 salidas

#### Scenario: Cerebro del entrenamiento que siguió
- **WHEN** la persona vuelve a la pestaña después de seguir entrenando el cerebro que estaba mirando
- **THEN** ve la red del entrenamiento actual, y un aviso dice que se actualizó y que los cambios de prueba se descartaron

#### Scenario: Cerebro eliminado
- **WHEN** la persona elimina en Entrenar el cerebro que estaba mirando y vuelve
- **THEN** la pestaña muestra el cerebro que mostraría al abrirse por primera vez

#### Scenario: Selector con el teclado
- **WHEN** la persona abre el selector con Enter, elige con las flechas y Enter
- **THEN** el cerebro cambia, el selector se cierra y el foco vuelve al botón

### Requirement: Barra de reproducción junto a la red
Debajo de la red SHALL haber una barra de reproducción con: reproducir o
pausar, un paso, un paso atrás, de a cuánto avanza cada paso (cuadro, capa,
neurona u operación), el ritmo, y el lugar por donde va la cuenta. Un cuadro
es un paso de la simulación: percibir, calcular la red y mover el auto.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la barra muestra que está reproduciendo, de a cuadros y en tiempo real

#### Scenario: Pausar
- **WHEN** la persona pausa
- **THEN** el auto y la red se detienen en el cuadro en curso, con la cuenta completa a la vista

#### Scenario: Lugar de la cuenta
- **WHEN** el paso a paso acaba de multiplicar la tercera entrada de la segunda neurona de la primera capa oculta
- **THEN** la barra lo dice con palabras: el cuadro, la capa, la neurona, de qué entrada se trata y la operación

#### Scenario: Controles junto a lo que mueven
- **WHEN** la persona mira la red
- **THEN** la barra de reproducción está pegada a la red, no en el panel

#### Scenario: Paso atrás a la vista
- **WHEN** la persona mira la barra en pausa con la red de 600 píxeles de ancho o más
- **THEN** "Atrás" está al lado de "Paso", con su atajo en el nombre

#### Scenario: Barra en ventana angosta
- **WHEN** la red mide menos de 600 píxeles de ancho, en español o en inglés
- **THEN** "Reproducir", "Paso" y "Atrás" se leen sin el atajo en el nombre, que sigue en su explicación, y la barra no ocupa más renglones que antes de tener "Atrás"

### Requirement: Ritmo de la reproducción
El ritmo SHALL poder bajarse desde tiempo real hasta un paso por segundo, y
volver a tiempo real. Al reproducir de a cuadros, tiempo real son 60 cuadros
por segundo. Al reproducir de a capas, neuronas u operaciones, la cuenta
avanza sola de a un paso de ese tamaño, al ritmo elegido, y al terminar un
cuadro sigue con el siguiente.

#### Scenario: Cámara lenta
- **WHEN** la persona baja el ritmo a un cuarto reproduciendo de a cuadros
- **THEN** el auto y la red avanzan cuatro veces más lento, sin saltos

#### Scenario: Reproducir de a neuronas
- **WHEN** la persona elige avanzar de a neuronas y reproduce a 5 pasos por segundo
- **THEN** la red se va encendiendo neurona por neurona, cinco por segundo, y al terminar el cuadro el auto se mueve y la cuenta empieza de nuevo

#### Scenario: Volver a tiempo real
- **WHEN** la persona elige avanzar de a cuadros y sube el ritmo al máximo
- **THEN** la pestaña vuelve a correr en tiempo real

#### Scenario: Ritmo según el tamaño del paso
- **WHEN** la persona cambia de cuadros a operaciones
- **THEN** el control de ritmo pasa a decir pasos por segundo, con un valor que deja ver cada paso

### Requirement: Avance paso a paso
Con la reproducción en pausa, "Paso" SHALL avanzar la cuenta una vez, del tamaño elegido, con su animación en la red. Una operación es una sola cuenta: leer una entrada, multiplicar un valor por su peso, sumar un aporte, sumar el sesgo o aplicar la activación. La cuenta de un cuadro empieza por las entradas. Al completarse, el paso siguiente SHALL mover el auto con esa decisión y empezar la cuenta del cuadro nuevo. "Atrás" SHALL deshacer el último paso dentro del cuadro y, al principio de un cuadro, volver al cuadro anterior, con el auto donde estaba, hasta 3 segundos atrás.

#### Scenario: Una operación
- **WHEN** la persona avanza de a una operación
- **THEN** se hace una sola cuenta con dos números como mucho y un resultado, y la red, la franja y la tarjeta la muestran

#### Scenario: Una neurona
- **WHEN** la persona avanza de a una neurona
- **THEN** se completa la neurona en curso y la siguiente pasa a ser la que se calcula; en la capa de entradas, cada paso lee una entrada

#### Scenario: Una capa
- **WHEN** la persona avanza de a una capa
- **THEN** se completan todas las neuronas de la capa en curso; el primer paso de un cuadro lee todas las entradas

#### Scenario: Un cuadro
- **WHEN** la persona avanza de a un cuadro
- **THEN** el auto se mueve un cuadro y la red muestra la cuenta completa del cuadro nuevo

#### Scenario: Fin de la cuenta
- **WHEN** la última salida está calculada y la persona avanza otro paso
- **THEN** el auto se mueve con esa decisión y empieza la cuenta del cuadro siguiente

#### Scenario: La tarjeta sigue a la cuenta
- **WHEN** la persona avanza de a neuronas o de a operaciones
- **THEN** la tarjeta muestra la neurona que se está calculando

#### Scenario: Cambiar el tamaño a mitad de la cuenta
- **WHEN** la persona pasa de operaciones a capas con una neurona a medio hacer
- **THEN** el paso siguiente completa la capa en curso, sin perder lo ya hecho

#### Scenario: Orden dentro de una neurona
- **WHEN** la persona avanza de a una operación por una neurona con seis entradas
- **THEN** da catorce pasos en este orden: por cada entrada, multiplicar y después sumar; al final, el sesgo y la activación

#### Scenario: Leer una entrada
- **WHEN** empieza la cuenta de un cuadro y la persona avanza de a una operación
- **THEN** el primer paso lee la primera entrada, que muestra su valor; las demás entradas se ven sin leer

#### Scenario: El sesgo, una vez por neurona
- **WHEN** la persona sigue la cuenta de una neurona
- **THEN** el sesgo se suma una sola vez, después del último aporte; las entradas no tienen sesgo ni peso propio

#### Scenario: Atrás
- **WHEN** la persona dio tres pasos de a una operación y presiona "Atrás"
- **THEN** la cuenta vuelve a como estaba después del segundo paso, y la red, la franja y la tarjeta lo muestran

#### Scenario: Atrás con otro tamaño
- **WHEN** la persona va por la mitad de una neurona y presiona "Atrás" de a neuronas
- **THEN** la cuenta vuelve al principio de esa neurona

#### Scenario: Atrás al cuadro anterior
- **WHEN** la cuenta del cuadro todavía no empezó y la persona presiona "Atrás"
- **THEN** el auto vuelve a donde estaba en el cuadro anterior y la red muestra la cuenta completa de ese cuadro

#### Scenario: Atrás al principio del cuadro
- **WHEN** el intento acaba de empezar, la cuenta del primer cuadro todavía no empezó y la persona presiona "Atrás"
- **THEN** no pasa nada y la explicación de "Atrás" dice que no hay cuadros anteriores guardados

#### Scenario: Seguir desde un cuadro anterior
- **WHEN** la persona volvió 30 cuadros con "Atrás" y reproduce
- **THEN** el auto sigue desde ahí y hace lo mismo que la primera vez, con la misma red y la misma semilla

### Requirement: Operación en curso
En pausa y al reproducir de a capas, neuronas u operaciones, la pestaña SHALL
mostrar, entre la red y la barra, el paso que se acaba de hacer. De a
operaciones MUST ser una sola cuenta, con el nombre de cada número debajo (de
qué entrada es el valor, peso, aporte, suma hasta acá, sesgo, total, salida),
el resultado marcado, una frase que dice qué se hizo y por dónde va la
neurona. Al reproducir de a cuadros en tiempo real no se muestra.

#### Scenario: Productos
- **WHEN** se multiplica la tercera entrada de una neurona
- **THEN** se lee una sola cuenta: el valor, con el nombre de la entrada de la que viene, por el peso de esa conexión, igual al aporte de esa entrada

#### Scenario: Suma
- **WHEN** se suma el aporte de la tercera entrada
- **THEN** se lee la suma hasta acá más ese aporte, igual a la suma nueva; en la primera entrada la suma arranca en cero y la frase lo dice

#### Scenario: Sesgo
- **WHEN** se avanza el sesgo
- **THEN** se lee la suma de todos los aportes más el sesgo de la neurona, igual al total, y la frase dice que se suma una sola vez

#### Scenario: Activación
- **WHEN** se avanza la activación de una neurona con tanh
- **THEN** se lee la función con su nombre, el total que recibe y la salida que da, cada número con su nombre, y la frase dice qué hace esa función

#### Scenario: Salida
- **WHEN** se avanza la activación de una neurona de salida
- **THEN** se lee si el total es mayor que cero y a qué acción dice sí o no

#### Scenario: Muchas entradas
- **WHEN** la neurona tiene 21 entradas
- **THEN** cada paso sigue siendo una sola cuenta; el recorrido de la neurona se resume para entrar en un renglón: cuántas entradas van de cuántas, el sesgo y la activación

#### Scenario: De a neuronas o capas
- **WHEN** se avanza de a una neurona o de a una capa
- **THEN** se lee un resumen de lo hecho: qué neurona y su salida, o qué capa y cuántas neuronas quedaron encendidas

#### Scenario: Tiempo real
- **WHEN** se reproduce de a cuadros en tiempo real
- **THEN** la operación en curso no se muestra y la red ocupa ese lugar

#### Scenario: Lector de pantalla
- **WHEN** la persona avanza un paso a mano
- **THEN** un lector de pantalla anuncia la cuenta con el nombre de cada número; al reproducir sola no anuncia cada paso

#### Scenario: Leer una entrada
- **WHEN** se lee el segundo sensor, que mide 0,04
- **THEN** se lee el valor con su nombre y una frase que dice qué significa: el rayo ve algo casi al final de su alcance, y que una entrada no calcula nada

#### Scenario: Leer la velocidad
- **WHEN** se lee la entrada de velocidad
- **THEN** la frase dice que es la velocidad del auto respecto de la máxima

#### Scenario: Por dónde va la neurona
- **WHEN** la cuenta va por la tercera de seis entradas
- **THEN** debajo de la cuenta se ven las seis entradas, el sesgo y la activación en orden: las dos primeras hechas, la tercera en curso y el resto sin hacer, y el número de paso de esa neurona

#### Scenario: Conexión apagada
- **WHEN** se multiplica una entrada cuya conexión está apagada
- **THEN** el aporte es 0 y la frase dice que la conexión está apagada

#### Scenario: Neurona apagada
- **WHEN** se avanza la activación de una neurona apagada
- **THEN** la salida es 0 y la frase dice que la neurona está apagada

#### Scenario: Alto que no salta
- **WHEN** la persona avanza veinte operaciones seguidas
- **THEN** la franja no cambia de alto y la red no se mueve

#### Scenario: Sin depender del color
- **WHEN** la persona mira la cuenta sin distinguir colores
- **THEN** el resultado y el paso en curso se reconocen por un borde y por su lugar, no solo por el color

#### Scenario: Nombres iguales en todos lados
- **WHEN** la persona compara la franja con la tarjeta
- **THEN** valor, peso, aporte, suma, sesgo, total y salida se llaman igual en las dos, con la misma explicación al posar el cursor

### Requirement: Tarjeta de la neurona
Con una neurona elegida, el panel SHALL mostrar su cuenta real, y es donde
se la cambia: una fila por entrada, con de dónde viene, su valor, su peso, su
producto y una barra con signo de lo que aporta; y al pie, siempre a la vista,
la suma, el sesgo, la activación y la salida, escritas como una cuenta. Los
valores SHALL actualizarse en el momento. La tarjeta MUST NOT desplazarse por
dentro: el único que se desplaza es el panel, y el pie queda pegado al borde
de abajo del panel mientras la tarjeta está a la vista.

#### Scenario: Neurona de una capa oculta
- **WHEN** la persona elige una neurona de la primera capa oculta de un cerebro de 5 sensores
- **THEN** la tarjeta muestra seis filas, una por sensor y una por la velocidad, y al pie la suma, el sesgo, la activación con su nombre y la salida

#### Scenario: Cuenta que se puede comprobar
- **WHEN** la persona suma a mano los productos de la tarjeta, con los dos decimales que se ven, y le agrega el sesgo
- **THEN** obtiene el total que muestra la tarjeta o un número que difiere solo por el redondeo de cada término, y la tarjeta dice a la vista que los números están redondeados a dos decimales

#### Scenario: El total es el de verdad
- **WHEN** se compara el total que muestra la tarjeta con el que usa la red para decidir
- **THEN** es el mismo número, redondeado recién al mostrarlo

#### Scenario: Neurona de salida
- **WHEN** la persona elige la salida de doblar a la izquierda
- **THEN** la tarjeta dice a qué acción corresponde y que la salida es sí cuando el total es mayor que cero

#### Scenario: Neurona de entrada
- **WHEN** la persona elige la entrada de un sensor
- **THEN** la tarjeta dice qué sensor es, qué está leyendo y de dónde sale ese número, y en la escena ese rayo se destaca

#### Scenario: En el paso a paso
- **WHEN** la cuenta va por la suma de la neurona elegida
- **THEN** la tarjeta muestra los productos ya hechos, destaca la suma y deja sin valor lo que falta

#### Scenario: Red grande
- **WHEN** la red tiene tres capas ocultas de 16 neuronas y 20 sensores
- **THEN** la tarjeta sigue mostrando una sola neurona, con 21 filas como mucho; al desplazar el panel las filas pasan y el pie, con el sesgo, queda a la vista

#### Scenario: Un solo desplazamiento
- **WHEN** la persona elige una neurona de 12 entradas con la ventana en 1440×900
- **THEN** solo el panel se desplaza, ninguna parte de la tarjeta tiene un desplazamiento propio y el deslizador del sesgo se ve sin desplazar nada

#### Scenario: Peso y sesgo a la vez
- **WHEN** la persona desplaza el panel para llegar a la última fila de una neurona de 12 entradas
- **THEN** el deslizador del peso de esa fila y el del sesgo se ven a la vez y se pueden usar

#### Scenario: Con el filtro de conexiones
- **WHEN** el filtro de conexiones está en las 3 más importantes y la neurona tiene 21 entradas
- **THEN** la tarjeta muestra las filas de esas 3 y una fila más que junta a las otras 18 con la suma de sus productos, y la cuenta total es la misma

#### Scenario: Qué mira la neurona
- **WHEN** la neurona elegida recibe directamente los sensores
- **THEN** en la escena cada rayo lleva el color y el grosor del peso con que esa neurona lo mira

#### Scenario: Barras de lo que aporta
- **WHEN** la persona mira las filas de una neurona
- **THEN** cada fila tiene una barra que sale del centro hacia la derecha si su producto suma y hacia la izquierda si resta, con un largo proporcional, y se ve de un vistazo qué entrada empuja más

#### Scenario: La cuenta escrita
- **WHEN** la persona mira el pie de la tarjeta
- **THEN** lee la suma más el sesgo, el total, el nombre de la activación y la salida, en ese orden

#### Scenario: Elegir una fila
- **WHEN** la persona hace clic en el nombre de una entrada en una fila
- **THEN** queda elegida esa conexión, en la red y en el panel

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** no hay neurona elegida y el panel muestra qué elegir, no una tarjeta vacía

#### Scenario: Filas a la vista
- **WHEN** la persona elige una neurona de 6 entradas con la ventana en 1366×768 o más grande, en español o en inglés
- **THEN** las seis filas se ven sin desplazar nada, con el pie debajo

#### Scenario: La cuenta entera
- **WHEN** la cuenta escrita no entra en un renglón del panel
- **THEN** sigue en un segundo renglón y se lee hasta la salida, sin puntos suspensivos

#### Scenario: Nada se encima
- **WHEN** el panel muestra cualquier detalle, con cualquier ancho de panel y alto de ventana que la aplicación permita
- **THEN** ninguna parte del detalle tapa a otra ni a las misiones, y nada sale del borde de la tarjeta

#### Scenario: Deslizador que se puede usar
- **WHEN** la persona hace clic en el peso de una fila o llega a él con Tab
- **THEN** esa fila muestra debajo un deslizador de al menos 120 píxeles de ancho, y las demás filas siguen en un renglón

#### Scenario: Barra y número
- **WHEN** la persona mira el producto de una fila
- **THEN** la barra de lo que aporta no pasa por encima del número

#### Scenario: Controles que se pueden apuntar
- **WHEN** la persona mira los botones del detalle de una neurona o de una conexión
- **THEN** cada uno mide al menos 24 píxeles de alto

### Requirement: Decisión de la red
El tablero SHALL mostrar, debajo de la escena, la decisión del cuadro en
curso: las cuatro acciones (avanzar, izquierda, derecha y retroceder), con
cuáles están encendidas, sin depender solo del color. Una acción que con la
red corriendo se enciende y apaga más de tres veces en un segundo SHALL verse
quieta, a medio encender y rayada, sin destellar.

#### Scenario: Decisión en vivo
- **WHEN** la red decide avanzar y doblar a la derecha
- **THEN** esas dos acciones se ven encendidas y las otras dos apagadas

#### Scenario: Cuenta a medio hacer
- **WHEN** el paso a paso todavía no llegó a las salidas
- **THEN** las cuatro acciones se ven sin decidir, distintas de un "no"

#### Scenario: Acción que titubea
- **WHEN** la red enciende y apaga "derecha" en cuadros seguidos mientras el auto maneja
- **THEN** la tecla "derecha" se ve rayada y a medio encender, sin destellar, y su nombre accesible dice que titubea

#### Scenario: En pausa
- **WHEN** la persona pausa con una acción rayada
- **THEN** la acción se ve encendida o apagada según el cuadro en pausa

### Requirement: Entradas a mano
Con la reproducción en pausa, la persona SHALL poder cambiar lo que recibe la
red: la lectura de cada sensor, arrastrando una manija sobre su rayo en la
escena o con un deslizador en la tarjeta de esa entrada, y la velocidad. La
red SHALL recalcularse en el momento. Mientras haya entradas a mano, un aviso
visible MUST decirlo.

#### Scenario: Mover un obstáculo
- **WHEN** en pausa la persona arrastra la manija del rayo del medio hacia el auto
- **THEN** la lectura de ese sensor sube, las neuronas cambian mientras arrastra y la decisión puede cambiar

#### Scenario: Sin arrastrar
- **WHEN** la persona elige la entrada de un sensor y mueve su deslizador, con el mouse o con las flechas
- **THEN** pasa lo mismo que al arrastrar la manija, y la manija se mueve en la escena

#### Scenario: Aviso de entradas a mano
- **WHEN** hay al menos una entrada cambiada a mano
- **THEN** la escena lleva un aviso que lo dice, con un botón para soltarlas, y esas entradas se ven marcadas en la red

#### Scenario: Soltar
- **WHEN** la persona suelta las entradas
- **THEN** la red vuelve a recibir lo que ve el auto en ese cuadro

#### Scenario: Reproducir las suelta
- **WHEN** la persona reproduce con entradas a mano
- **THEN** las entradas se sueltan, un aviso lo dice y el auto sigue manejando con lo que ve

#### Scenario: Sin pausa no hay manijas
- **WHEN** la reproducción está en marcha
- **THEN** las manijas y los deslizadores de entradas no se muestran

#### Scenario: Mismas entradas, misma decisión
- **WHEN** la persona pone dos veces las mismas entradas a mano
- **THEN** la red decide lo mismo las dos veces

### Requirement: Apagar una parte de la red
La tarjeta SHALL permitir apagar y volver a encender la neurona elegida, sea
de entrada, oculta o de salida, y cada una de sus conexiones de entrada. El
efecto MUST verse en el momento en la red y en el auto que maneja.

#### Scenario: Apagar una neurona oculta
- **WHEN** la persona apaga una neurona de una capa oculta con el auto manejando
- **THEN** la neurona se ve apagada, su salida vale cero y el auto sigue manejando con esa red

#### Scenario: Apagar un sensor
- **WHEN** la persona apaga la entrada del sensor del medio
- **THEN** la red deja de recibir ese sensor y en la escena su rayo se ve apagado

#### Scenario: Apagar una conexión
- **WHEN** la persona apaga una conexión desde su fila en la tarjeta
- **THEN** su producto pasa a cero y la fila y la conexión se ven apagadas

#### Scenario: Volver a encender
- **WHEN** la persona vuelve a encender lo que apagó
- **THEN** la red se comporta como antes

### Requirement: Cambiar pesos y sesgos
La tarjeta SHALL permitir cambiar el peso de cada conexión de entrada de la
neurona elegida y su sesgo, con un deslizador y con el teclado. El efecto
MUST verse en el momento, mientras se mueve el control. El valor original
SHALL quedar a la vista junto al cambiado.

#### Scenario: Cambiar un peso manejando
- **WHEN** la persona mueve el deslizador de un peso con el auto manejando
- **THEN** el producto, la suma y la salida de la tarjeta cambian mientras lo mueve, y el auto maneja con el peso nuevo

#### Scenario: Valor original a la vista
- **WHEN** un peso está cambiado
- **THEN** su fila muestra el valor nuevo y el original, y una marca de que está cambiado

#### Scenario: Rango del peso
- **WHEN** la persona lleva el deslizador a un extremo
- **THEN** el peso queda en −1 o en 1, salvo que el valor original estuviera más lejos, y en ese caso el rango llega hasta ahí

#### Scenario: Cambiar el sesgo
- **WHEN** la persona cambia el sesgo de una neurona de salida
- **THEN** el total y la decisión se recalculan en el momento

#### Scenario: Con el teclado
- **WHEN** la persona pone el foco en el deslizador de un peso y usa las flechas
- **THEN** el peso cambia de a 0,01 y el efecto se ve igual

### Requirement: Deshacer y restablecer la red
Con cambios de prueba, sobre la red SHALL aparecer una franja con cuántos cambios hay, un botón para deshacer el último y otro para restablecer la red entera, y "Ver original". Valen para todo cambio: pesos, sesgos y partes apagadas. Sin cambios, la franja MUST NOT verse. Su aparición MUST NOT correr la red de golpe mientras la persona arrastra una perilla. Los cambios MUST NOT modificar el cerebro guardado, y SHALL conservarse por cerebro hasta cerrar la aplicación.

#### Scenario: Sin cambios
- **WHEN** la red no tiene cambios
- **THEN** no se ven "Deshacer", "Restablecer la red" ni "Ver original", ni un contador de cambios

#### Scenario: Red modificada
- **WHEN** la persona apaga una neurona y cambia dos pesos
- **THEN** aparece la franja, que dice que la red tiene 3 cambios de prueba, con los botones habilitados

#### Scenario: Deshacer
- **WHEN** la persona deshace
- **THEN** el último cambio vuelve atrás, sea un peso, un sesgo o algo apagado, la red y el auto lo reflejan en el momento y el contador baja

#### Scenario: Deshacer varias veces
- **WHEN** la persona hizo cuatro cambios y deshace cuatro veces
- **THEN** la red queda igual a la del cerebro y la franja se va

#### Scenario: Restablecer
- **WHEN** la persona restablece la red
- **THEN** todos los pesos, sesgos y partes apagadas vuelven a los del cerebro, sin pedir confirmación, y la franja se va

#### Scenario: El cerebro guardado no cambia
- **WHEN** la persona cambia pesos de un cerebro guardado y lo abre en Entrenar o en Competir
- **THEN** el cerebro es el de antes

#### Scenario: Cambios por cerebro
- **WHEN** la persona cambia un peso, pasa a otro cerebro y vuelve al primero
- **THEN** el primero conserva su cambio y su franja

#### Scenario: Con el teclado
- **WHEN** la persona cambia un peso con las flechas en una pastilla
- **THEN** la franja aparece y el foco sigue en la pastilla

### Requirement: Vista de la red a la vista
Sobre la red SHALL haber, siempre a la vista, el nombre del cerebro y un renglón de controles en tres grupos rotulados: **Vista** (diagrama o tabla de pesos, y el flujo), **Conexiones** (el filtro y resumir o abrir todas las capas) y **Acercar** (alejar, acercar y ver entera). Cada capa se resume desde su encabezado, en la red misma. Los cambios de prueba van en una franja aparte (ver *Deshacer y restablecer la red*). Ninguna función de la pestaña MUST quedar en una sección plegable del panel.

#### Scenario: Cambiar de vista
- **WHEN** la persona elige la tabla de pesos
- **THEN** la zona de la red pasa a mostrar la tabla, y la reproducción, la tarjeta y la escena siguen igual

#### Scenario: Controles sobre lo que cambian
- **WHEN** la persona busca cómo resumir una capa o cambiar de vista
- **THEN** encuentra lo primero arriba de esa capa y lo segundo sobre la red, no en el panel

#### Scenario: Controles que no crecen con la red
- **WHEN** se pasa de una red sin capas ocultas a una con tres
- **THEN** los controles de arriba de la red son los mismos y ocupan lo mismo

#### Scenario: Un renglón al abrir
- **WHEN** se abre la pestaña con la ventana en 1440×900, en español o en inglés
- **THEN** los tres grupos ocupan un solo renglón, cada uno con su rótulo, y ningún control de arriba de la red está sin acción

### Requirement: Guía, leyenda y misiones
Con la guía activa, el panel SHALL ofrecer, plegado debajo de la tarjeta de consigna, un texto breve que diga qué se está viendo, y SHALL mostrar a la vista una línea de guía arriba del detalle, una leyenda de cómo se lee la red y tres misiones con su progreso, en tres renglones: seguir la cuenta de una neurona paso a paso, cambiar una decisión moviendo una entrada a mano, y apagar una neurona y ver qué cambia. La línea de guía MUST NOT desaparecer al elegir algo: cambia según lo que se mira (nada elegido, una neurona, una conexión, un choque o la persona manejando). Las misiones MUST NOT bloquear nada. Se despliega con "Más sobre esta pestaña".

#### Scenario: Texto plegado
- **WHEN** la guía está activa y la persona entra a la pestaña
- **THEN** el texto de inicio está plegado debajo de la tarjeta de consigna y aparece al tocar "Más sobre esta pestaña"

#### Scenario: Guía visible
- **WHEN** la guía está activa y la persona despliega "Más sobre esta pestaña"
- **THEN** el texto dice que eso es la red del cerebro que maneja, que cada círculo es una neurona y cada línea un peso, y qué probar primero

#### Scenario: Guía oculta
- **WHEN** la persona apaga la guía
- **THEN** el texto, la línea de guía, la leyenda y las misiones no se muestran

#### Scenario: Misión de la cuenta
- **WHEN** la persona avanza paso a paso las cuatro operaciones de una misma neurona
- **THEN** la primera misión queda cumplida

#### Scenario: Misión de la entrada
- **WHEN** la persona cambia una entrada a mano y la decisión de la red cambia
- **THEN** la segunda misión queda cumplida

#### Scenario: Misión de apagar
- **WHEN** la persona apaga una neurona y reproduce al menos tres segundos
- **THEN** la tercera misión queda cumplida

#### Scenario: Misiones compactas
- **WHEN** el panel mide 360 píxeles de ancho, en español o en inglés
- **THEN** las tres misiones ocupan tres renglones, con su estado en el mismo renglón, sin un recuadro que se estire

#### Scenario: Términos con su nombre
- **WHEN** la persona posa el cursor sobre "sesgo", "activación" o "tabla de pesos"
- **THEN** un tooltip dice qué es con palabras llanas y con su nombre técnico

#### Scenario: Con algo elegido
- **WHEN** hay una neurona elegida
- **THEN** la línea de guía dice qué mirar en una neurona, el detalle se ve debajo, las misiones siguen a la vista y "Soltar" está junto al nombre de la neurona

#### Scenario: Soltar vuelve a los atajos
- **WHEN** la persona elige "Soltar"
- **THEN** no queda nada elegido, la línea de guía vuelve a la de inicio y se ven los atajos de *Panel sin nada elegido*

#### Scenario: Leyenda corta
- **WHEN** la guía está activa
- **THEN** la leyenda ocupa cinco renglones o menos: el signo, el grosor, el brillo y el relleno, el sesgo, y un renglón con las marcas de elegida, en curso, apagada y cambiada

### Requirement: Estado conservado
Al salir de la pestaña y volver, la pestaña SHALL conservar el cerebro, la
vista, las capas resumidas, el filtro de conexiones, la neurona elegida, el
ritmo y los cambios de prueba, hasta cerrar la aplicación. La reproducción MUST quedar en pausa
mientras la pestaña no está a la vista.

#### Scenario: Volver a la pestaña
- **WHEN** la persona deja la tabla de pesos con una capa resumida y dos pesos cambiados, abre Entrenar y vuelve
- **THEN** encuentra la tabla, la capa resumida y los dos cambios como los dejó

#### Scenario: Pausa al salir
- **WHEN** la persona abre otra pestaña con la reproducción en marcha
- **THEN** la simulación no avanza hasta que vuelve

### Requirement: Atajos de la pestaña
La pestaña SHALL usar los atajos de las demás con el mismo significado:
espacio para reproducir o pausar, N para un paso, R para reiniciar el intento
y V para restablecer la vista, acá la de la red; y B para un paso atrás. MUST
respetar el interruptor de atajos y no actuar mientras se escribe en un campo.

#### Scenario: Paso con N
- **WHEN** la persona presiona N en pausa
- **THEN** la cuenta avanza un paso del tamaño elegido

#### Scenario: N reproduciendo
- **WHEN** la persona presiona N con la reproducción en marcha
- **THEN** la reproducción se pausa y la cuenta avanza un paso

#### Scenario: Atajos apagados
- **WHEN** los atajos de una tecla están apagados
- **THEN** espacio, N, B, R y V no hacen nada y todo sigue pudiéndose hacer con los botones

#### Scenario: Atrás con B
- **WHEN** la persona presiona B en pausa con la cuenta empezada
- **THEN** la cuenta vuelve un paso del tamaño elegido

#### Scenario: B reproduciendo
- **WHEN** la persona presiona B con la reproducción en marcha
- **THEN** la reproducción se pausa y la cuenta vuelve un paso

### Requirement: Pestaña a la vista sin desplazarse
Con la ventana en 1440×900 y la guía activa, el panel de Inspeccionar SHALL
verse entero sin desplazarse, y la red, su barra de reproducción y el tablero
también. Nada MUST desplazarse hacia los costados con ningún ancho de panel
que la aplicación permita.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900, en español o en inglés
- **THEN** se ven sin desplazar la red con sus controles, la barra de reproducción, la escena, la decisión y el panel entero, con la tarjeta de la neurona adentro

#### Scenario: Zona de la red en su mínimo
- **WHEN** la zona de la red mide 600 píxeles de ancho, en español o en inglés
- **THEN** los controles de arriba ocupan dos renglones y la barra de reproducción otros dos, con todo entero

#### Scenario: Panel en su ancho mínimo
- **WHEN** el panel está en su ancho mínimo
- **THEN** no se desplaza hacia los costados y ningún botón queda cortado

### Requirement: Controles explicados y accesibles
Cada control de la pestaña SHALL tener un tooltip que diga qué hace y por qué
importa, y todos los textos SHALL estar en español y en inglés. Los cambios
de estado que no se ven a simple vista (entradas soltadas, red actualizada)
MUST anunciarse. Arrastrar nunca MUST ser la única forma de hacer algo.

#### Scenario: Tooltip del tamaño del paso
- **WHEN** la persona posa el cursor sobre "operación" en la barra de reproducción
- **THEN** un tooltip explica que avanza una sola operación de una neurona y que así se ve de qué está hecha la cuenta

#### Scenario: Tooltip de apagar
- **WHEN** la persona posa el cursor sobre el botón de apagar una neurona
- **THEN** un tooltip explica que su salida pasa a valer cero y que sirve para averiguar qué aporta, y que se deshace

#### Scenario: Pestaña en inglés
- **WHEN** la aplicación está en inglés
- **THEN** la guía, la leyenda, la barra de reproducción, la tarjeta, los avisos y las misiones se muestran en inglés

#### Scenario: Auditoría de tooltips
- **WHEN** se corre la auditoría de tooltips en la pestaña, en pausa y reproduciendo, con y sin cambios
- **THEN** no informa ningún control sin ayuda

#### Scenario: Objetivos
- **WHEN** se miden los botones y las manijas de la pestaña
- **THEN** todos miden al menos 24 píxeles de lado

### Requirement: Detalle de una conexión
Con una conexión elegida, el panel SHALL mostrar de dónde a dónde va, su
peso para cambiarlo con un deslizador o escribiendo, su valor original si
está cambiado, lo que pasa por ella ahora (entrada por peso igual a producto)
y qué parte es de lo que recibe su neurona. SHALL permitir apagarla y pasar a
cualquiera de sus dos neuronas.

#### Scenario: Conexión elegida
- **WHEN** la persona elige la conexión del sensor 2 a la primera neurona oculta
- **THEN** el panel muestra sus dos extremos con nombre, su peso, la entrada de ahora, el producto y qué parte del total de esa neurona representa

#### Scenario: Cambiar el peso
- **WHEN** la persona mueve el deslizador del peso
- **THEN** el producto, la línea de la red y el auto que maneja cambian mientras lo mueve

#### Scenario: Valor original
- **WHEN** el peso está cambiado
- **THEN** el panel muestra el valor nuevo y el original

#### Scenario: Apagar la conexión
- **WHEN** la persona apaga la conexión desde el panel
- **THEN** su producto pasa a cero y la línea se ve apagada

#### Scenario: Ir a una de sus neuronas
- **WHEN** la persona hace clic en el nombre de la neurona de destino
- **THEN** queda elegida esa neurona y el panel muestra su tarjeta

#### Scenario: Vuelta atrás
- **WHEN** la persona deshace después de cambiar el peso
- **THEN** el peso vuelve a su valor anterior, en la red y en el panel

#### Scenario: Tooltips y textos
- **WHEN** la persona posa el cursor o llega con Tab a un control del detalle, en español o en inglés
- **THEN** un tooltip dice qué hace y por qué importa

### Requirement: Panel sin nada elegido
Sin nada elegido, el lugar del detalle SHALL decir con una frase que se puede
elegir una neurona o una conexión, y ofrecer como atajos las tres conexiones
por las que pasa más señal ahora y la salida que la red está decidiendo. No
MUST quedar un hueco vacío.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** el panel muestra la frase y los atajos

#### Scenario: Usar un atajo
- **WHEN** la persona hace clic en uno de los atajos
- **THEN** esa conexión o esa neurona queda elegida y el panel muestra su detalle

#### Scenario: Atajos al día
- **WHEN** el auto maneja y cambia por dónde pasa más señal
- **THEN** los atajos se actualizan, como mucho dos veces por segundo, para poder hacerles clic

#### Scenario: Soltar
- **WHEN** la persona suelta lo que tenía elegido
- **THEN** el panel vuelve a mostrar la frase y los atajos

### Requirement: Comparar con el original
Con cambios a mano, la franja de cambios SHALL ofrecer un botón que, mientras se mantiene apretado, muestra la red y la decisión sin esos cambios, y al soltarlo vuelve a mostrarlos. MUST NOT deshacer nada. Sin cambios no se ve. SHALL tener tooltip y textos en español y en inglés.

#### Scenario: Mantener apretado
- **WHEN** la persona cambió dos pesos y mantiene apretado "Ver original"
- **THEN** la red, la decisión y el detalle muestran los valores del cerebro, y un rótulo dice que se está viendo el original

#### Scenario: Soltar
- **WHEN** la persona suelta el botón
- **THEN** todo vuelve a mostrar la red con sus cambios, que siguen ahí

#### Scenario: Con el teclado
- **WHEN** el botón tiene el foco y la persona mantiene apretada la barra espaciadora
- **THEN** se ve el original hasta que la suelta

#### Scenario: Sin cambios
- **WHEN** la red no tiene cambios
- **THEN** el botón no se ve

### Requirement: Flujo de la señal en Inspeccionar
Sobre la red SHALL haber un interruptor "Flujo", encendido por defecto, que
muestra u oculta las marcas que viajan por las conexiones mientras la red se
reproduce. Su estado SHALL recordarse hasta cerrar la aplicación. SHALL tener
tooltip y textos en español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña con el auto manejando
- **THEN** se ven marcas que viajan de los sensores hacia las salidas

#### Scenario: Apagar el flujo
- **WHEN** la persona apaga "Flujo"
- **THEN** las marcas dejan de verse y todo lo demás sigue igual

#### Scenario: Recordado
- **WHEN** la persona apaga el flujo, abre otra pestaña y vuelve
- **THEN** el flujo sigue apagado

### Requirement: Curva de respuesta
El detalle de una neurona oculta o de salida SHALL tener dos vistas, "Cuenta"
y "Respuesta". "Respuesta" muestra cómo cambia su suma cuando una entrada de
la red recorre su rango y las demás quedan como están. La entrada se elige; un
punto marca su valor de ahora, una línea marca dónde la neurona cambia de
salida, y una frase lo dice con palabras. SHALL tener tooltips y textos en
español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** la persona elige una neurona oculta por primera vez
- **THEN** el detalle muestra la vista "Cuenta", con "Respuesta" a un clic

#### Scenario: Abrir la respuesta
- **WHEN** la persona pasa a "Respuesta"
- **THEN** la curva ocupa el lugar de las filas y del pie, y muestra la entrada que más le aporta ahora, sin que la persona elija nada

#### Scenario: Vista recordada
- **WHEN** la persona está en "Respuesta" y elige otra neurona
- **THEN** el detalle de la otra neurona se abre en "Respuesta"

#### Scenario: Entra en el panel
- **WHEN** la vista "Respuesta" está abierta con la ventana en 1366×768 o más grande
- **THEN** los botones de entrada, el gráfico y la frase se ven enteros, sin desplazar nada

#### Scenario: Elegir la entrada
- **WHEN** la persona elige otra entrada entre los botones de la curva
- **THEN** la curva pasa a mostrar la respuesta a esa entrada

#### Scenario: Recta en la primera capa
- **WHEN** la neurona es de la primera capa oculta
- **THEN** la curva es una recta, y la frase dice que su inclinación es el peso de esa conexión, con su valor

#### Scenario: Escalones en una salida
- **WHEN** la neurona es una salida
- **THEN** la curva tiene escalones, y la frase dice que cada salto es una neurona oculta que se enciende o se apaga

#### Scenario: Dónde cambia la salida
- **WHEN** la curva cruza el cero
- **THEN** una línea y dos rótulos muestran de qué lado la neurona sale 1 y de cuál sale 0, sin depender solo del color

#### Scenario: En vivo
- **WHEN** el auto maneja y las otras entradas cambian
- **THEN** la curva se mueve con ellas y el punto sigue el valor de la entrada elegida

#### Scenario: Arrastrar el punto
- **WHEN** en pausa la persona arrastra el punto, o lo mueve con las flechas
- **THEN** esa entrada pasa a ese valor como una entrada a mano, y la red y el auto lo reflejan

#### Scenario: Vuelta atrás
- **WHEN** la persona quita las entradas a mano
- **THEN** el punto vuelve al valor que lee el auto

#### Scenario: Peso cambiado
- **WHEN** la persona cambia el peso de la conexión con la entrada elegida
- **THEN** la inclinación de la curva cambia mientras lo mueve

#### Scenario: Neurona de entrada
- **WHEN** la persona elige una neurona de entrada
- **THEN** no hay vista "Respuesta" ni botones para cambiar de vista

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega a la curva
- **THEN** lee la frase: la entrada, su valor de ahora, la suma, qué sale y en qué valor cambia la salida, si cambia

### Requirement: La tarjeta sigue la cuenta de a una operación
Al avanzar de a operaciones, la tarjeta de la neurona en curso SHALL mostrar
su cuenta fila por fila: una fila sin hacer no muestra aporte, la que se
multiplicó lo muestra, y la que ya se sumó queda marcada como sumada. La fila
en curso MUST estar marcada y a la vista, y el pie MUST mostrar la suma hasta
acá.

#### Scenario: Fila en curso
- **WHEN** la cuenta acaba de multiplicar la tercera entrada
- **THEN** en la tarjeta las dos primeras filas están sumadas, la tercera muestra su aporte y lleva la marca de en curso, y las demás no muestran aporte

#### Scenario: Suma hasta acá
- **WHEN** la cuenta sumó tres de seis aportes
- **THEN** el pie de la tarjeta muestra la suma de esos tres, y el sesgo, el total y la salida todavía sin hacer

#### Scenario: Fila fuera de las que se muestran
- **WHEN** la entrada en curso no está entre las filas que la tarjeta muestra por el filtro de conexiones
- **THEN** su fila se ve igual mientras está en curso

#### Scenario: Una entrada
- **WHEN** la cuenta lee una entrada
- **THEN** la tarjeta muestra esa entrada con su valor

### Requirement: La entrada que se lee, en la escena
Al leer una entrada de a operaciones o de a neuronas, la escena SHALL marcar
de dónde sale ese número: el rayo de ese sensor, o la velocidad del auto.

#### Scenario: Sensor
- **WHEN** la cuenta lee el segundo sensor
- **THEN** en la escena el segundo rayo se ve destacado hasta el paso siguiente

#### Scenario: Entrada puesta a mano
- **WHEN** la entrada que se lee está puesta a mano
- **THEN** la frase de la franja dice que el valor lo puso la persona y no el auto

### Requirement: Manejar vos
La escena SHALL ofrecer "Manejar vos", un botón con tooltip en español y en inglés, en el renglón de los controles de cámara, con la altura normal. Al activarlo, o al apretar una flecha con el foco en la escena o en ningún control, el auto pasa a manejarse con el teclado como en El problema, y la reproducción pasa a correr en tiempo real de a cuadros. La red sigue calculando cada cuadro y se ve igual que cuando maneja.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** maneja la red, "Manejar vos" está a la vista sin activar y el tráfico de la calle recta es uno nuevo, elegido al azar

#### Scenario: Tomar el volante con el botón
- **WHEN** la persona activa "Manejar vos"
- **THEN** el botón se ve activo, el foco queda en la escena, un aviso en la escena dice que maneja la persona y que la red solo mira, y el auto responde a las flechas

#### Scenario: Tomar el volante con una flecha
- **WHEN** la red maneja, el foco está en la escena y la persona aprieta la flecha arriba
- **THEN** el auto pasa a manejarse con el teclado desde ese cuadro, sin volver a empezar el intento

#### Scenario: Flechas dentro de la red
- **WHEN** el foco está en el diagrama, en una pastilla o en un deslizador y la persona usa las flechas
- **THEN** las flechas hacen lo de siempre en ese control y no toman el volante

#### Scenario: La red se sigue viendo
- **WHEN** la persona maneja
- **THEN** el diagrama, la tabla de pesos y la tarjeta de la neurona elegida muestran la cuenta de la red con lo que ve el auto en cada cuadro

#### Scenario: Pausa
- **WHEN** la persona pausa mientras maneja
- **THEN** el auto se detiene, las flechas no lo mueven, y el paso a paso, las entradas a mano y los cambios de la red funcionan como siempre

#### Scenario: Un cuadro con N
- **WHEN** en pausa la persona mantiene la flecha izquierda y aprieta N de a cuadros
- **THEN** el auto avanza un cuadro doblando a la izquierda y la red muestra su cuenta de ese cuadro

#### Scenario: Choque
- **WHEN** la persona choca mientras maneja
- **THEN** la escena se congela con el caso del choque, como cuando maneja la red, y al reiniciar o reintentar sigue manejando la persona

#### Scenario: Atajos apagados
- **WHEN** los atajos de una tecla están apagados
- **THEN** las flechas manejan y toman el volante, y W, A, S y D no hacen nada

#### Scenario: Guía
- **WHEN** la guía está activa
- **THEN** el texto de la guía dice que se puede tomar el volante con las flechas para ver qué haría la red en cada situación

### Requirement: Tu decisión y la de la red
Mientras la persona maneja, la decisión debajo de la escena SHALL mostrar dos
filas con las cuatro acciones: "Vos", lo que aprieta la persona, y "La red",
lo que decidiría la red en ese cuadro. Cada acción en que coinciden MUST
marcarse sin depender solo del color, y una línea dice en qué parte de los
cuadros de los últimos 10 segundos coincidieron las cuatro acciones.

#### Scenario: Coinciden
- **WHEN** la persona avanza y la red también decidiría solo avanzar
- **THEN** las dos filas muestran avanzar encendido y las cuatro acciones llevan la marca de que coinciden

#### Scenario: No coinciden
- **WHEN** la persona avanza recto y la red doblaría a la derecha
- **THEN** la fila "La red" muestra derecha encendida, "Vos" no, y derecha lleva la marca de que no coinciden

#### Scenario: Cuánto coinciden
- **WHEN** la persona maneja 10 segundos y en 450 de los 600 cuadros las cuatro acciones coincidieron
- **THEN** la línea dice que coincidieron en el 75 % de los cuadros de los últimos 10 segundos

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega a la decisión mientras la persona maneja
- **THEN** anuncia qué aprieta la persona, qué haría la red y cuánto coinciden, sin anunciarlo en cada cuadro

#### Scenario: Con la red manejando
- **WHEN** maneja la red
- **THEN** la decisión se ve como siempre, una sola fila, sin la línea de coincidencia

### Requirement: Devolver el volante
Mientras la persona maneja, la escena SHALL ofrecer "Devolver el volante", que
le da el control a la red desde el cuadro siguiente, en el lugar donde está el
auto, sin volver a empezar el intento. Cambiar de pestaña MUST devolver el
volante.

#### Scenario: Devolver
- **WHEN** la persona deja el auto pegado a otro y elige "Devolver el volante"
- **THEN** la red maneja desde ahí, la decisión vuelve a una fila y el aviso de la escena desaparece

#### Scenario: Cambiar de pestaña
- **WHEN** la persona maneja, abre Competir y vuelve
- **THEN** maneja la red, y el auto sigue desde donde estaba

#### Scenario: Cambiar de cerebro
- **WHEN** la persona maneja y elige otro cerebro
- **THEN** el intento vuelve a empezar con el cerebro nuevo y sigue manejando la persona

#### Scenario: Tooltip
- **WHEN** la persona posa el cursor sobre "Devolver el volante"
- **THEN** un tooltip, en español y en inglés, dice que la red sigue manejando desde donde quedó el auto, para ver cómo sale de la situación

### Requirement: Caso del choque en Inspeccionar
Al chocar, la pestaña SHALL congelar la reproducción y mostrar, debajo de la decisión, una tarjeta del caso con: a los cuántos metros y contra qué chocó, qué decidió la red en el cuadro que se mira, y qué neurona aportó más a esa decisión, con un botón "Elegir esta neurona". La decisión es la acción encendida de mayor valor; la neurona que más aportó es la de la última capa oculta con el mayor aporte positivo (valor por peso) a esa salida, o la entrada, si la red no tiene capas ocultas. La tarjeta SHALL ofrecer "Reintentar desde acá" y "Reiniciar (R)". Reiniciar o reintentar SHALL cerrar el caso.

#### Scenario: Estado por defecto
- **WHEN** el cerebro de ejemplo choca con los valores por defecto
- **THEN** la reproducción queda en pausa, la escena muestra el auto chocado y la tarjeta dice a los cuántos metros, contra qué, qué decidió la red y qué neurona aportó más, con su aporte en números

#### Scenario: Elegir la neurona que decidió
- **WHEN** la persona elige "Elegir esta neurona"
- **THEN** esa neurona queda elegida en la red, el panel muestra su tarjeta con la cuenta de ese cuadro y la línea de guía habla del choque

#### Scenario: Sin capas ocultas
- **WHEN** choca un cerebro sin capas ocultas
- **THEN** la tarjeta nombra la entrada que más aportó a la decisión y el botón la elige

#### Scenario: Ninguna acción encendida
- **WHEN** en el cuadro que se mira la red no tenía ninguna acción encendida
- **THEN** la tarjeta dice que la red no accionaba nada y no nombra una neurona

#### Scenario: Reiniciar
- **WHEN** la persona reinicia con R o con el botón
- **THEN** la tarjeta y el deslizador desaparecen, el intento vuelve a la salida con el tráfico que indica la opción "Tráfico" (uno nuevo con "Nuevo", el mismo con "Repetir") y la reproducción sigue como estaba antes del choque

#### Scenario: Sin depender del color
- **WHEN** se ve el caso en escala de grises
- **THEN** la neurona que más aportó se distingue en la red por su marca, no solo por el color

#### Scenario: Textos y tooltips
- **WHEN** la persona posa el cursor sobre "Elegir esta neurona", "Reintentar desde acá" o "Reiniciar"
- **THEN** cada uno tiene un tooltip en español y en inglés que dice qué hace y por qué importa

### Requirement: Repetición del choque en Inspeccionar
Con un choque a la vista, un deslizador sobre la escena SHALL permitir volver a ver los últimos 3 segundos antes del choque, cuadro por cuadro. La escena, la red, la decisión, la tarjeta del caso y la tarjeta de la neurona elegida siguen al deslizador. La escena y lo que leen los sensores MUST ser los de ese cuadro. La red, la tarjeta de la neurona elegida y la decisión debajo de la escena SHALL calcular ese cuadro con la red de ahora, con los cambios de prueba aplicados. El deslizador SHALL empezar 1 segundo antes del choque, tener tooltip y manejarse con el teclado.

#### Scenario: Al chocar
- **WHEN** el auto choca después de 5 segundos de intento
- **THEN** el deslizador cubre los últimos 3 segundos y está 1 segundo antes del choque, con la escena, la red y la decisión de ese cuadro

#### Scenario: Volver atrás en el tiempo
- **WHEN** la persona lleva el deslizador a 2 segundos antes del choque
- **THEN** la escena muestra el auto donde estaba en ese instante, la red muestra la cuenta de ese cuadro y la tarjeta, la decisión y la neurona que más aportó en ese cuadro

#### Scenario: Con el teclado
- **WHEN** la persona llega al deslizador con Tab y presiona la flecha izquierda
- **THEN** la repetición retrocede un cuadro y el auto no gira

#### Scenario: Intento corto
- **WHEN** el auto choca antes de cumplir 3 segundos
- **THEN** el deslizador cubre solo el tiempo que duró el intento

#### Scenario: Red cambiada después del choque
- **WHEN** con el caso a la vista la persona apaga una neurona y mueve el deslizador
- **THEN** la red muestra esa neurona apagada y la cuenta de ese cuadro sin ella, y la tarjeta del choque sigue diciendo lo que la red decidió en realidad

#### Scenario: Mover un sesgo con el caso abierto
- **WHEN** con el caso a la vista la persona elige una neurona y mueve su sesgo
- **THEN** la suma, la salida de la neurona y las salidas de la red cambian en ese mismo cuadro mientras arrastra

#### Scenario: Determinismo
- **WHEN** la persona reinicia y el auto vuelve a chocar igual
- **THEN** la repetición muestra los mismos cuadros que la vez anterior

### Requirement: Reintentar desde un cuadro
Con un choque a la vista, "Reintentar desde acá" SHALL volver el mundo al cuadro que muestra el deslizador (el auto, el tiempo, el tráfico y el progreso) y seguir reproduciendo desde ahí con la red de ahora, con sus cambios de prueba. Es la acción principal mientras se ve el caso. MUST NOT cambiar el cerebro guardado. Desde un mismo cuadro, con la misma red, SHALL dar siempre el mismo resultado.

#### Scenario: Reintentar con un cambio
- **WHEN** con el caso a la vista la persona apaga la neurona que más aportó y elige "Reintentar desde acá" 1 segundo antes del choque
- **THEN** el auto sigue desde donde estaba en ese cuadro, con la red sin esa neurona, y la escena muestra si esta vez choca o no

#### Scenario: Reintentar sin cambios
- **WHEN** la persona reintenta desde un cuadro sin cambiar la red
- **THEN** el auto vuelve a chocar en el mismo lugar y en el mismo cuadro

#### Scenario: Acción principal
- **WHEN** se ve el caso del choque
- **THEN** "Reintentar desde acá" es la única acción principal, y "Reiniciar" y "Elegir esta neurona" se ven como secundarias

#### Scenario: Volver atrás
- **WHEN** el auto reintentado vuelve a chocar
- **THEN** aparece el caso nuevo, con su repetición, y "Reiniciar" sigue volviendo a la salida

#### Scenario: Con la persona manejando
- **WHEN** la persona manejaba al chocar y reintenta desde un cuadro
- **THEN** sigue manejando la persona desde ese cuadro y la coincidencia con la red vuelve a cero

### Requirement: Tráfico nuevo o repetido
En la calle recta, la pestaña SHALL usar una semilla de tráfico nueva, al azar, cada vez que arma el intento: al abrirla, al cambiar de cerebro y al cambiar los ajustes. Al reiniciar, la semilla SHALL ser otra con "Tráfico" en "Nuevo" y la misma en "Repetir". Las repeticiones (Atrás, Reintentar desde acá, el deslizador) MUST conservarla. Misma semilla, cerebro y ajustes SHALL dar el mismo intento.

#### Scenario: Estado por defecto
- **WHEN** la persona abre la pestaña en la calle recta sin tocar nada
- **THEN** la opción "Tráfico" muestra "Nuevo" y el tráfico es uno elegido al azar

#### Scenario: Reiniciar con Nuevo
- **WHEN** con "Nuevo", la persona reinicia el intento con R
- **THEN** el auto vuelve a la salida con otro tráfico

#### Scenario: Reiniciar con Repetir
- **WHEN** la persona elige "Repetir" y reinicia el intento dos veces sin cambiar la red
- **THEN** las dos veces el tráfico es el mismo que estaba viendo al elegir "Repetir", y el auto hace lo mismo

#### Scenario: Volver a Nuevo
- **WHEN** con "Repetir", la persona elige "Nuevo" y reinicia
- **THEN** el tráfico vuelve a ser otro en cada reinicio

#### Scenario: Elegir la opción no reinicia
- **WHEN** la persona cambia la opción "Tráfico" en medio de un intento
- **THEN** el intento sigue sin reiniciarse y la opción rige desde el próximo reinicio

#### Scenario: Las repeticiones conservan el tráfico
- **WHEN** con "Nuevo", la persona choca, mueve el deslizador y elige "Reintentar desde acá"
- **THEN** el intento sigue desde ese cuadro con el mismo tráfico

#### Scenario: Atrás conserva el tráfico
- **WHEN** con "Nuevo", la persona vuelve 30 cuadros con "Atrás" y reproduce
- **THEN** el auto hace lo mismo que la primera vez, con el mismo tráfico

### Requirement: Opción Tráfico en el panel
El panel SHALL ofrecer la opción "Tráfico", con los valores "Nuevo" (por defecto) y "Repetir". El grupo y cada valor tienen un tooltip en español y en inglés que dice qué hace y por qué importa. Cambiar la opción MUST NOT reiniciar el intento. La opción no se guarda entre sesiones, y en un circuito, que no tiene tráfico, MUST ocultarse.

#### Scenario: Circuito
- **WHEN** el cerebro elegido entrenó en el óvalo
- **THEN** la opción "Tráfico" no se ve

#### Scenario: Nueva sesión
- **WHEN** la persona eligió "Repetir", cierra la aplicación y la vuelve a abrir
- **THEN** la opción "Tráfico" muestra "Nuevo"

#### Scenario: Textos y tooltips
- **WHEN** la persona posa el cursor sobre la opción "Tráfico", "Nuevo" o "Repetir", en español o en inglés
- **THEN** cada uno tiene un tooltip que dice qué hace y por qué importa

### Requirement: Decisión con tus cambios en el caso
Con el caso del choque a la vista y con al menos un cambio de prueba en la red, la tarjeta del choque SHALL agregar una línea que dice qué decidiría la red de ahora en el cuadro que muestra el deslizador: la acción, o que decidiría lo mismo. La decisión real de ese cuadro y la neurona que más aportó a ella no cambian. Sin cambios de prueba, la línea MUST NOT verse. La línea está en español y en inglés y la lee el lector de pantalla junto con la tarjeta.

#### Scenario: Estado por defecto
- **WHEN** el auto choca y la persona no cambió la red
- **THEN** la tarjeta del choque se ve como siempre, sin la línea de los cambios

#### Scenario: Un cambio que cambia la decisión
- **WHEN** la red decidió avanzar en el cuadro que se mira y la persona baja el sesgo de avanzar hasta que se apaga y se enciende izquierda
- **THEN** la tarjeta sigue diciendo que la red decidió avanzar y agrega "Con tus cambios, en este cuadro decidiría: Izquierda"

#### Scenario: Un cambio que no alcanza
- **WHEN** la persona cambia un peso y la decisión de ese cuadro sigue siendo la misma
- **THEN** la línea dice que con tus cambios decidiría lo mismo

#### Scenario: Deshacer
- **WHEN** la persona deshace todos los cambios con el caso a la vista
- **THEN** la línea desaparece y la red muestra la misma cuenta que al chocar

#### Scenario: Misma cuenta, mismo resultado
- **WHEN** con los mismos cambios la persona vuelve el deslizador a un cuadro que ya vio
- **THEN** la red muestra la misma cuenta y la línea dice lo mismo que antes

### Requirement: Lo elegido, primero en el panel
Con una neurona o una conexión elegida, el panel SHALL mostrar su detalle primero, con sus controles (pesos, sesgo, apagar), debajo de un renglón compacto con el nombre del cerebro y "Cambiar". La opción "Tráfico", la frase de ayuda, "Cómo se lee la red" y las misiones SHALL ir después del detalle. Sin nada elegido, el panel MUST mantener su orden de siempre. En el detalle de una conexión, el peso con su deslizador SHALL ser lo primero debajo del título.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña sin nada elegido
- **THEN** el panel muestra el cerebro, la opción "Tráfico", la frase y los atajos, la leyenda y las misiones, como siempre

#### Scenario: Elegir una neurona
- **WHEN** la persona elige la neurona 5 de la capa oculta con la ventana en 1440×900
- **THEN** la tarjeta de la neurona aparece arriba del panel, debajo del renglón del cerebro, y el deslizador del sesgo se ve sin desplazar nada

#### Scenario: Elegir una conexión
- **WHEN** la persona elige una conexión
- **THEN** el detalle de la conexión aparece arriba del panel y su peso con el deslizador es lo primero debajo del título

#### Scenario: Soltar
- **WHEN** la persona suelta lo elegido
- **THEN** el panel vuelve a su orden de siempre

#### Scenario: Con el caso del choque
- **WHEN** hay un choque a la vista y la persona elige una neurona
- **THEN** la tarjeta de la neurona va primero y la frase del caso queda debajo

#### Scenario: Ventana baja
- **WHEN** la ventana mide 1366×768 y la persona elige una neurona de 12 entradas
- **THEN** el panel se desplaza como un solo bloque y el pie con el sesgo queda pegado abajo, a la vista
