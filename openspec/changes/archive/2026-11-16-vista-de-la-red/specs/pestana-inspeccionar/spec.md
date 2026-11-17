# Spec Delta

## MODIFIED Requirements

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
- **WHEN** dos personas abren la pestaña con el mismo cerebro y los mismos ajustes
- **THEN** ven al auto hacer lo mismo

### Requirement: La red en el centro
La pestaña SHALL mostrar la red en la zona grande de la pantalla; la escena
del auto, chica, en el tablero, con la decisión de la red debajo; y en el
panel, lo que se sabe y se puede cambiar de la neurona elegida. Las zonas
conservan los divisores para cambiarles el ancho. En una ventana angosta la
red MUST ceder ancho antes de que el tablero deje de leerse.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900
- **THEN** la red ocupa la zona más grande, el tablero muestra la escena y la decisión, y el panel muestra el cerebro, la neurona elegida y las misiones, sin desplazar ninguna zona

#### Scenario: Anchos por defecto
- **WHEN** se abre la pestaña por primera vez con la ventana en 1440 píxeles de ancho
- **THEN** el tablero y el panel miden 360 píxeles cada uno y la red ocupa todo lo demás

#### Scenario: Agrandar la red
- **WHEN** la persona mueve el divisor para agrandar la zona de la red
- **THEN** la red crece y la escena conserva su proporción

#### Scenario: La red no se achica de más
- **WHEN** la persona mueve el divisor para achicar la zona de la red
- **THEN** la red no baja de 600 píxeles de ancho mientras la ventana deje 280 para el tablero, y sus controles de arriba siguen en dos renglones

#### Scenario: Anchos propios
- **WHEN** la persona cambia el ancho de la red en Inspeccionar y pasa a otra pestaña
- **THEN** la otra pestaña conserva sus anchos, e Inspeccionar recuerda el suyo al volver

#### Scenario: Orden del foco
- **WHEN** la persona recorre la pestaña con Tab
- **THEN** el foco pasa por la red y sus controles, después por el tablero y al final por el panel

#### Scenario: Ventana angosta
- **WHEN** la ventana mide entre 1032 y 1240 píxeles de ancho
- **THEN** el tablero mide al menos 280 píxeles, la red cede ancho sin bajar de 440, y los nombres de las cuatro decisiones se leen enteros

#### Scenario: Ventana en su mínimo
- **WHEN** la ventana mide entre 960 y 1032 píxeles de ancho
- **THEN** la red mide 440 píxeles, el tablero se queda con lo que sobra, no menos de 200, y los nombres de las cuatro decisiones se leen enteros

#### Scenario: Barra de arriba en ventana angosta
- **WHEN** la zona de la red mide entre 500 y 600 píxeles de ancho, en español o en inglés
- **THEN** sus controles de arriba ocupan tres renglones o menos, con los botones de acercar en el mismo renglón que el filtro de conexiones; con 440 píxeles, cuatro o menos

### Requirement: Tarjeta de la neurona
Con una neurona elegida, el panel SHALL mostrar su cuenta real, y es donde
se la cambia: una fila por entrada, con de dónde viene, su valor, su peso, su
producto y una barra con signo de lo que aporta; y al pie, siempre a la vista,
la suma, el sesgo, la activación y la salida, escritas como una cuenta. Los
valores SHALL actualizarse en el momento.

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
- **THEN** la tarjeta sigue mostrando una sola neurona, con 21 filas como mucho, que se desplazan por dentro mientras el pie queda a la vista

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

### Requirement: Guía, leyenda y misiones
Con la guía activa, el panel SHALL empezar con un texto breve que diga qué se
está viendo, una leyenda de cómo se lee la red (colores, trazos y relleno) y
tres misiones con su progreso: seguir la cuenta de una neurona paso a paso,
cambiar una decisión de la red moviendo una entrada a mano, y apagar una
neurona y ver qué cambia. Las misiones SHALL ocupar tres renglones, uno cada
una, y MUST NOT bloquear nada. Con algo elegido, el texto cede su lugar.

#### Scenario: Guía visible
- **WHEN** la guía está activa
- **THEN** el texto dice que eso es la red del cerebro que maneja, que cada círculo es una neurona y cada línea un peso, y qué probar primero

#### Scenario: Guía oculta
- **WHEN** la persona apaga la guía
- **THEN** el texto, la leyenda y las misiones no se muestran

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
- **WHEN** hay una neurona o una conexión elegida
- **THEN** el texto de arriba del panel no se muestra, las misiones siguen a la vista y el detalle usa ese lugar

#### Scenario: Leyenda corta
- **WHEN** la guía está activa
- **THEN** la leyenda ocupa cinco renglones o menos: el signo, el grosor, el brillo y el relleno, el sesgo, y un renglón con las marcas de elegida, en curso, apagada y cambiada

## ADDED Requirements

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
Con cambios a mano, sobre la red SHALL haber un botón que, mientras se
mantiene apretado, muestra la red y la decisión sin esos cambios, y al
soltarlo vuelve a mostrarlos. MUST NOT deshacer nada. Sin cambios, se ve sin
acción y lo explica. SHALL tener tooltip y textos en español y en inglés.

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
- **THEN** el botón está a la vista, sin acción, y su tooltip dice que no hay cambios que comparar

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

