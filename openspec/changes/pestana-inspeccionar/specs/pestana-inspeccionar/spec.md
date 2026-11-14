# Spec Delta

## Purpose

Es la pestaña 5, "Inspeccionar": pone una red neuronal en el centro de la
pantalla mientras maneja un auto, y deja detenerla, seguir su cuenta paso a
paso, probar qué decide con otras entradas y ver qué cambia al apagarle una
parte o al cambiarle un peso. Sirve para entender qué tiene adentro lo que
se entrenó.

## ADDED Requirements

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
- **THEN** la red se ve como diagrama, con todas las capas abiertas, corriendo en tiempo real y con una neurona de la primera capa oculta ya elegida

#### Scenario: Misma semilla, misma escena
- **WHEN** dos personas abren la pestaña con el mismo cerebro y los mismos ajustes
- **THEN** ven al auto hacer lo mismo

### Requirement: La red en el centro
La pestaña SHALL mostrar la red en la zona grande de la pantalla; la escena
del auto, chica, en el tablero, con la decisión de la red debajo; y en el
panel, lo que se sabe y se puede cambiar de la neurona elegida. Las zonas
conservan los divisores para cambiarles el ancho.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900
- **THEN** la red ocupa la zona más grande, el tablero muestra la escena y la decisión, y el panel muestra el cerebro, la neurona elegida y las misiones, sin desplazar ninguna zona

#### Scenario: Anchos por defecto
- **WHEN** se abre la pestaña por primera vez con la ventana en 1440 píxeles de ancho
- **THEN** el tablero y el panel miden 360 píxeles cada uno y la red ocupa todo lo demás

#### Scenario: Agrandar la red
- **WHEN** la persona mueve el divisor para agrandar la zona de la red
- **THEN** la red crece y la escena conserva su proporción

#### Scenario: Anchos propios
- **WHEN** la persona cambia el ancho de la red en Inspeccionar y pasa a otra pestaña
- **THEN** la otra pestaña conserva sus anchos, e Inspeccionar recuerda el suyo al volver

#### Scenario: Orden del foco
- **WHEN** la persona recorre la pestaña con Tab
- **THEN** el foco pasa por la red y sus controles, después por el tablero y al final por el panel

### Requirement: Escena del auto en segundo plano
La escena SHALL mostrar al auto con sus sensores, encuadrado de modo que se
vea lo que alcanzan a ver, sin controles de cámara. Si el auto choca, el
intento SHALL volver a empezar solo, con el mismo tráfico. La pista, el
tráfico y la velocidad se cambian en la barra de escenario, que no muestra
los sensores: los trae el cerebro.

#### Scenario: Encuadre
- **WHEN** el auto maneja
- **THEN** la escena lo sigue y se ven enteros sus rayos y lo que tocan

#### Scenario: Choque
- **WHEN** el auto choca
- **THEN** la escena muestra el choque un momento y el intento vuelve a empezar desde la salida, con el mismo tráfico

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
pausar, un paso, de a cuánto avanza cada paso (cuadro, capa, neurona u
operación), el ritmo, y el lugar por donde va la cuenta. Un cuadro es un paso
de la simulación: percibir, calcular la red y mover el auto.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la barra muestra que está reproduciendo, de a cuadros y en tiempo real

#### Scenario: Pausar
- **WHEN** la persona pausa
- **THEN** el auto y la red se detienen en el cuadro en curso, con la cuenta completa a la vista

#### Scenario: Lugar de la cuenta
- **WHEN** el paso a paso va por la suma de la tercera neurona de la primera capa oculta
- **THEN** la barra lo dice con palabras: el cuadro, la capa, la neurona y la operación

#### Scenario: Controles junto a lo que mueven
- **WHEN** la persona mira la red
- **THEN** la barra de reproducción está pegada a la red, no en el panel

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
Con la reproducción en pausa, "Paso" SHALL avanzar la cuenta una vez, del
tamaño elegido: una operación, una neurona, una capa o un cuadro, con su
animación en la red. Al
completarse la cuenta de un cuadro, el paso siguiente SHALL mover el auto con
esa decisión y empezar la cuenta del cuadro nuevo.

#### Scenario: Una operación
- **WHEN** la persona avanza de a una operación
- **THEN** se hace una sola operación de una neurona (productos, suma, sesgo o activación), y la red y la tarjeta la muestran

#### Scenario: Una neurona
- **WHEN** la persona avanza de a una neurona
- **THEN** se completa la neurona en curso y la siguiente pasa a ser la que se calcula

#### Scenario: Una capa
- **WHEN** la persona avanza de a una capa
- **THEN** se completan todas las neuronas de la capa en curso

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

### Requirement: Operación en curso
En pausa y al reproducir de a capas, neuronas u operaciones, la pestaña SHALL
mostrar, entre la red y la barra de reproducción, la operación que se acaba
de hacer, escrita con sus números: los productos, la suma, el sesgo o la
activación. Al reproducir de a cuadros en tiempo real no se muestra.

#### Scenario: Productos
- **WHEN** se avanza la operación de productos de una neurona con tres entradas
- **THEN** se leen los tres productos, cada uno como valor por peso igual a producto

#### Scenario: Suma
- **WHEN** se avanza la suma
- **THEN** se lee la suma de los productos con su resultado

#### Scenario: Sesgo
- **WHEN** se avanza el sesgo
- **THEN** se lee la suma más el sesgo y el total

#### Scenario: Activación
- **WHEN** se avanza la activación de una neurona con tanh
- **THEN** se lee la función con su nombre, el total que recibe y la salida que da

#### Scenario: Salida
- **WHEN** se avanza la activación de una neurona de salida
- **THEN** se lee si el total es mayor que cero y a qué acción dice sí o no

#### Scenario: Muchas entradas
- **WHEN** la neurona tiene 21 entradas
- **THEN** se leen los productos más grandes y cuántos más hay, sin pasar de dos renglones; la cuenta completa está en la tarjeta

#### Scenario: De a neuronas o capas
- **WHEN** se avanza de a una neurona o de a una capa
- **THEN** se lee un resumen de lo hecho: qué neurona y su salida, o qué capa y cuántas neuronas quedaron encendidas

#### Scenario: Tiempo real
- **WHEN** se reproduce de a cuadros en tiempo real
- **THEN** la operación en curso no se muestra y la red ocupa ese lugar

#### Scenario: Lector de pantalla
- **WHEN** la persona avanza un paso a mano
- **THEN** un lector de pantalla anuncia la operación escrita; al reproducir sola no anuncia cada paso

### Requirement: Tarjeta de la neurona
El panel SHALL mostrar la cuenta real de la neurona elegida, y es el lugar
donde se la cambia: una fila por entrada, con de dónde viene, su valor, su
peso y su producto; y al pie, siempre a la vista, la suma, el sesgo, la
activación y la salida. Muestra una sola neurona por vez. Los valores SHALL
actualizarse en el momento. Nunca MUST quedar vacía.

#### Scenario: Neurona de una capa oculta
- **WHEN** la persona elige una neurona de la primera capa oculta de un cerebro de 5 sensores
- **THEN** la tarjeta muestra seis filas, una por sensor y una por la velocidad, y al pie la suma, el sesgo, la activación con su nombre y la salida

#### Scenario: Cuenta que se puede comprobar
- **WHEN** la persona suma a mano los productos de la tarjeta y le agrega el sesgo
- **THEN** obtiene el total que muestra la tarjeta, con los decimales que se ven

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

### Requirement: Decisión de la red
El tablero SHALL mostrar, debajo de la escena, la decisión del cuadro en
curso: las cuatro acciones (avanzar, izquierda, derecha y retroceder), con
cuáles están encendidas, sin depender solo del color.

#### Scenario: Decisión en vivo
- **WHEN** la red decide avanzar y doblar a la derecha
- **THEN** esas dos acciones se ven encendidas y las otras dos apagadas

#### Scenario: Cuenta a medio hacer
- **WHEN** el paso a paso todavía no llegó a las salidas
- **THEN** las cuatro acciones se ven sin decidir, distintas de un "no"

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
Sobre la red SHALL haber, siempre a la vista, un botón para deshacer el
último cambio hecho a la red y otro para restablecerla entera, y cuántos
cambios tiene. Valen para todo cambio: pesos, sesgos y partes apagadas. Sin
cambios, los dos se ven sin acción y lo explican. Los cambios MUST NOT
modificar el cerebro guardado, y SHALL conservarse por cerebro hasta cerrar
la aplicación.

#### Scenario: Sin cambios
- **WHEN** la red no tiene cambios
- **THEN** "Deshacer" y "Restablecer la red" están a la vista, sin acción, y su tooltip dice que no hay cambios que deshacer

#### Scenario: Red modificada
- **WHEN** la persona apaga una neurona y cambia dos pesos
- **THEN** sobre la red se lee que tiene 3 cambios y los dos botones quedan habilitados

#### Scenario: Deshacer
- **WHEN** la persona deshace
- **THEN** el último cambio vuelve atrás, sea un peso, un sesgo o algo apagado, la red y el auto lo reflejan en el momento y el contador baja

#### Scenario: Deshacer varias veces
- **WHEN** la persona hizo cuatro cambios y deshace cuatro veces
- **THEN** la red queda igual a la del cerebro

#### Scenario: Restablecer
- **WHEN** la persona restablece la red
- **THEN** todos los pesos, sesgos y partes apagadas vuelven a los del cerebro, sin pedir confirmación

#### Scenario: El cerebro guardado no cambia
- **WHEN** la persona cambia pesos de un cerebro guardado y lo abre en Entrenar o en Competir
- **THEN** el cerebro es el de antes

#### Scenario: Cambios por cerebro
- **WHEN** la persona cambia un peso, pasa a otro cerebro y vuelve al primero
- **THEN** el primero conserva su cambio

### Requirement: Vista de la red a la vista
Sobre la red SHALL estar, siempre a la vista, el nombre del cerebro, la
elección entre diagrama y tabla de pesos, el filtro de conexiones, resumir o
abrir todas las capas, deshacer y restablecer, y los controles de
acercamiento. Cada capa se resume desde su encabezado, en la red misma. Ninguna función de la pestaña MUST quedar en una sección
plegable del panel.

#### Scenario: Cambiar de vista
- **WHEN** la persona elige la tabla de pesos
- **THEN** la zona de la red pasa a mostrar la tabla, y la reproducción, la tarjeta y la escena siguen igual

#### Scenario: Controles sobre lo que cambian
- **WHEN** la persona busca cómo resumir una capa o cambiar de vista
- **THEN** encuentra lo primero arriba de esa capa y lo segundo sobre la red, no en el panel

#### Scenario: Controles que no crecen con la red
- **WHEN** se pasa de una red sin capas ocultas a una con tres
- **THEN** los controles de arriba de la red son los mismos y ocupan lo mismo

### Requirement: Guía, leyenda y misiones
Con la guía activa, el panel SHALL empezar con un texto breve que diga qué se
está viendo, una leyenda de cómo se lee la red (colores, trazos y relleno) y
tres misiones con su progreso: seguir la cuenta de una neurona paso a paso,
cambiar una decisión de la red moviendo una entrada a mano, y apagar una
neurona y ver qué cambia. Las misiones SHALL ocupar tres renglones, uno cada
una, y MUST NOT bloquear nada.

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
y V para restablecer la vista, acá la de la red. MUST respetar el interruptor
de atajos y no actuar mientras se escribe en un campo.

#### Scenario: Paso con N
- **WHEN** la persona presiona N en pausa
- **THEN** la cuenta avanza un paso del tamaño elegido

#### Scenario: N reproduciendo
- **WHEN** la persona presiona N con la reproducción en marcha
- **THEN** la reproducción se pausa y la cuenta avanza un paso

#### Scenario: Atajos apagados
- **WHEN** los atajos de una tecla están apagados
- **THEN** espacio, N, R y V no hacen nada y todo sigue pudiéndose hacer con los botones

### Requirement: Pestaña a la vista sin desplazarse
Con la ventana en 1440×900 y la guía activa, el panel de Inspeccionar SHALL
verse entero sin desplazarse, y la red, su barra de reproducción y el tablero
también. Nada MUST desplazarse hacia los costados con ningún ancho de panel
que la aplicación permita.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900, en español o en inglés
- **THEN** se ven sin desplazar la red con sus controles, la barra de reproducción, la escena, la decisión y el panel entero, con la tarjeta de la neurona adentro

#### Scenario: Barra de reproducción angosta
- **WHEN** la zona de la red mide 520 píxeles de ancho
- **THEN** la barra de reproducción pasa a dos renglones, con todos sus controles enteros

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
