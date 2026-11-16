# Spec Delta

## MODIFIED Requirements

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

### Requirement: Avance paso a paso
Con la reproducción en pausa, "Paso" SHALL avanzar la cuenta una vez, del
tamaño elegido, con su animación en la red. Una operación es una sola cuenta:
leer una entrada, multiplicar un valor por su peso, sumar un aporte, sumar el
sesgo o aplicar la activación. La cuenta de un cuadro empieza por las
entradas. Al completarse, el paso siguiente SHALL mover el auto con esa
decisión y empezar la cuenta del cuadro nuevo. "Atrás" SHALL deshacer el
último paso dentro del cuadro.

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

#### Scenario: Atrás al principio del cuadro
- **WHEN** la cuenta del cuadro todavía no empezó
- **THEN** "Atrás" no hace nada y su explicación dice que el auto ya se movió y ese cuadro no se puede deshacer

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

## ADDED Requirements

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
