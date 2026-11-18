# Spec Delta

## ADDED Requirements

### Requirement: Insertar un dato desde su barra
Con 12 sensores o menos, cada barra de sensor y la de `velocidad` SHALL ser un control: un clic o Enter inserta en el cursor del editor una comparación con el valor de ese instante (`sensor3 > 0,49`), con dos decimales y el separador del idioma activo, y devuelve el foco al editor. Cada barra SHALL tener un tooltip que diga qué hace y por qué importa, en español y en inglés. Funciona con la guía encendida o apagada.

#### Scenario: Estado por defecto
- **WHEN** con el intento en pausa, la barra de `sensor3` muestra 0,49 y el cursor está al final de `si `, y la persona hace clic en esa barra
- **THEN** el texto pasa a ser `si sensor3 > 0,49 `, el cursor queda al final y el foco vuelve al editor

#### Scenario: En inglés
- **WHEN** la aplicación está en inglés y la persona toca la barra de `sensor3` con el valor 0.49
- **THEN** se inserta `sensor3 > 0.49`

#### Scenario: Espacios
- **WHEN** el cursor está pegado a una palabra, sin espacio antes
- **THEN** la comparación se inserta con un espacio antes, y nunca con dos

#### Scenario: Con el teclado
- **WHEN** la persona llega con Tab a la barra de `velocidad` y presiona Enter
- **THEN** se inserta `velocidad > ` con su valor, igual que con el clic, y no se dispara ningún atajo de la pestaña

#### Scenario: Muchos sensores
- **WHEN** el auto tiene 20 sensores
- **THEN** las barras se muestran sin nombre ni valor y no son controles, y la paleta ofrece la palabra `sensor`

#### Scenario: Vuelta atrás
- **WHEN** la persona insertó una comparación y presiona Ctrl+Z en el editor
- **THEN** la comparación desaparece y el programa vuelve a ser el de antes

#### Scenario: Determinismo
- **WHEN** la persona inserta una comparación con el intento en pausa y lo reanuda
- **THEN** la simulación sigue igual que si la comparación se hubiera escrito a mano

### Requirement: Mesa de trabajo
La zona del escenario SHALL mostrar la escena con lo que percibe y acciona el auto en una columna al costado, y debajo la barra de marcha con las cifras del intento. El tablero SHALL mostrar, de arriba abajo, la tarjeta de consigna, el texto de guía, la tarjeta del programa (cabecera, editor y paleta) y las misiones. Mover un control MUST NOT cambiar lo que hace, su texto, su tooltip ni su atajo.

#### Scenario: El auto y lo que percibe, juntos
- **WHEN** la persona mira la escena de Reglas a mano
- **THEN** las barras de los sensores están al costado de la escena, en la misma zona, sin otra zona en el medio, y la escena mide al menos 360 píxeles de alto a 1366×768

#### Scenario: El programa y sus palabras, juntos
- **WHEN** la persona mira la tarjeta del programa
- **THEN** en su cabecera están "Reglas", los sensores, los ejemplos, Restablecer, Exportar e Importar, arriba del editor

#### Scenario: Ventana mediana
- **WHEN** la ventana mide 1366×768
- **THEN** la tarjeta de consigna, la cabecera del programa y al menos 10 líneas del editor se ven sin desplazar el tablero

#### Scenario: Mismos atajos
- **WHEN** la persona usa la barra espaciadora, R y V con el foco fuera del editor
- **THEN** pausan, reinician y siguen al auto como antes del cambio

## MODIFIED Requirements

### Requirement: Paleta de palabras
Con la guía activa, la tarjeta del programa SHALL mostrar una paleta con las
palabras de regla, las cuatro órdenes y las constantes que define el programa.
Los sensores y `velocidad` MUST NOT estar en la paleta: se insertan desde sus
barras. Con más de 12 sensores, la paleta SHALL sumar la palabra `sensor`. Un clic en una palabra SHALL insertarla donde está el
cursor y devolver el foco al editor. Cada palabra SHALL tener un tooltip.

#### Scenario: Insertar una palabra
- **WHEN** el cursor está al final de `si sensor3 > 0,5 ` y la persona hace clic en `entonces`
- **THEN** el texto pasa a ser `si sensor3 > 0,5 entonces` y se puede seguir escribiendo

#### Scenario: Sensores del auto
- **WHEN** el auto tiene 5 sensores
- **THEN** la paleta no ofrece `sensor1` a `sensor5` ni `velocidad`, y las barras de esos datos se pueden tocar para insertarlos

#### Scenario: Constantes del programa
- **WHEN** el programa define `cerca` y `borde`
- **THEN** la paleta ofrece `cerca` y `borde`, y deja de ofrecer una constante cuando su definición se borra

#### Scenario: Muchos sensores
- **WHEN** el auto tiene 30 sensores
- **THEN** la paleta ofrece la palabra `sensor` y dice que se pueden escribir de `sensor1` a `sensor30`

#### Scenario: Palabras en el idioma activo
- **WHEN** la aplicación está en inglés
- **THEN** la paleta ofrece las palabras en inglés

### Requirement: Indicadores del programa
La pestaña SHALL mostrar, actualizados en tiempo real, la distancia recorrida,
los vehículos superados y la mejor distancia lograda desde que se abrió la
pestaña junto a la escena, y la cantidad de reglas del programa que maneja en
la cabecera del programa, con la cifra destacada.

#### Scenario: Reglas del programa
- **WHEN** el programa que maneja tiene una orden suelta y cuatro reglas
- **THEN** el indicador de reglas muestra 4

#### Scenario: Mejor distancia
- **WHEN** un intento termina con más distancia que la mejor registrada
- **THEN** la mejor distancia pasa a ser la de ese intento

#### Scenario: Cada cifra junto a lo que mide
- **WHEN** la persona mira Reglas a mano sin configurar nada
- **THEN** la distancia, los vehículos superados y la mejor distancia están en la zona del escenario, y "Reglas" está en la cabecera del programa, más grande que las demás cifras de esa cabecera

### Requirement: Percepción y acción con los nombres del lenguaje
Al costado de la escena, en la zona del escenario, SHALL mostrarse una barra horizontal por sensor y de la velocidad con el
nombre que cada dato tiene en el lenguaje y su valor, y los cuatro controles
resaltados mientras el programa los acciona. Con más de 12 sensores, las
barras SHALL mostrarse sin nombre ni valor.

#### Scenario: Nombres bajo las barras
- **WHEN** el auto tiene 5 sensores
- **THEN** debajo de las barras se leen `sensor1` a `sensor5` y `velocidad`, cada una con su valor

#### Scenario: Elegir un número mirando las barras
- **WHEN** un vehículo está delante a media distancia del alcance
- **THEN** la barra de `sensor3` muestra un valor cercano a 0,5, el mismo que compara una regla que usa `sensor3`

#### Scenario: Controles que acciona el programa
- **WHEN** se cumple una regla que dice `girar izquierda`
- **THEN** el indicador de izquierda se resalta mientras se cumple

### Requirement: Controles del intento
Una barra de marcha debajo de la escena SHALL permitir pausar y reanudar,
reiniciar el intento con el mismo tráfico y empezar con un tráfico nuevo, junto
al interruptor Reintentar solo, con los mismos atajos que la pestaña 1
(barra espaciadora y R) cuando el foco no está en el editor. Un interruptor,
encendido por defecto, SHALL mostrar u ocultar los rayos de los sensores.

#### Scenario: Reiniciar
- **WHEN** la persona reinicia el intento
- **THEN** el auto vuelve al inicio con el mismo tráfico y el mismo programa

#### Scenario: Tráfico nuevo
- **WHEN** la persona pide un tráfico nuevo
- **THEN** el intento se reinicia con otra disposición de vehículos y el mismo programa

#### Scenario: Mismo programa, mismo tráfico
- **WHEN** la persona reinicia dos veces sin cambiar nada
- **THEN** el auto recorre la misma distancia las dos veces

#### Scenario: Pausa
- **WHEN** la persona presiona la barra espaciadora con el foco en el escenario
- **THEN** el intento se detiene con una indicación de pausa, y continúa al presionarla otra vez

#### Scenario: Barra de marcha
- **WHEN** la persona abre Reglas a mano
- **THEN** debajo de la escena ve "Pausar (espacio)" como acción principal, Reiniciar, Tráfico nuevo y Reintentar solo, y los interruptores Sensores y Ver como la máquina están en la zona del escenario

### Requirement: Configuración avanzada
La pestaña SHALL ofrecer, en la barra de escenario y siempre a la vista, los mismos ajustes
que la pestaña 1: velocidad máxima del auto (compartida por todas las
pestañas), carriles, densidad e irregularidad del tráfico, con un botón que los
restablece. La cantidad, el alcance y la apertura de los sensores SHALL estar
siempre a la vista en la cabecera del programa, con los mismos controles que en
Entrenar. Cambiar los
sensores MUST volver a analizar el programa.

#### Scenario: Sección plegada
- **WHEN** se abre la pestaña
- **THEN** los ajustes de la calle y del auto están a la vista en la barra de escenario, los de los sensores en la cabecera del programa, sin desplegar nada, y no hay ninguna sección plegable

#### Scenario: Menos sensores de los que usa el programa
- **WHEN** el programa usa `sensor5` y la persona baja los sensores a 3
- **THEN** se muestra el error de que el auto tiene 3 sensores, el auto deja de accionar controles y la paleta ofrece de `sensor1` a `sensor3`

#### Scenario: Volver atrás
- **WHEN** la persona sube los sensores a 5 desde la cabecera del programa
- **THEN** el error desaparece y el programa vuelve a manejar

#### Scenario: Velocidad compartida
- **WHEN** la persona cambia la velocidad máxima en esta pestaña y abre El problema
- **THEN** el auto de El problema tiene esa misma velocidad máxima

### Requirement: Programas de ejemplo
La cabecera del programa SHALL ofrecer tres programas de ejemplo, cada uno escrito para un
auto distinto: tres sensores cortos, siete sensores y veinte sensores. Cargar
un ejemplo SHALL poner su programa en el editor y cambiar los sensores del
auto a los de ese ejemplo. Si el texto del editor fue escrito o cambiado por
la persona, cargar un ejemplo MUST pedir una confirmación que avise que se
reemplazan el programa y los sensores.

#### Scenario: Cargar un ejemplo
- **WHEN** la persona elige el ejemplo de siete sensores sin haber cambiado el programa inicial
- **THEN** el editor muestra ese programa, el auto pasa a tener 7 sensores de 3 largos de auto y 90 grados, el intento se reinicia y el programa maneja de inmediato

#### Scenario: Sensores de cada ejemplo
- **WHEN** la persona carga el ejemplo de tres sensores y después el de veinte
- **THEN** el auto tiene primero 3 sensores de 2 largos de auto y 60 grados, y después 20 sensores de 3 largos de auto y 120 grados, y la cabecera del programa muestra esos valores

#### Scenario: Ejemplo con cambios propios
- **WHEN** la persona escribió sus propias reglas y elige un ejemplo
- **THEN** una confirmación avisa que se reemplazan su programa y los sensores, y al cancelarla todo queda como estaba

#### Scenario: Tres sensores cortos
- **WHEN** se corre el ejemplo de tres sensores durante dos minutos con el tráfico inicial de la pestaña
- **THEN** el auto no choca y no supera ningún vehículo: frena detrás del primero que encuentra

#### Scenario: Siete sensores
- **WHEN** se corre el ejemplo de siete sensores con el tráfico inicial de la pestaña
- **THEN** el auto supera al menos 10 vehículos antes de chocar

#### Scenario: Veinte sensores
- **WHEN** se corre el ejemplo de veinte sensores con el tráfico inicial de la pestaña
- **THEN** el programa tiene casi el doble de reglas que el de siete sensores y el auto recorre menos distancia que con aquel

#### Scenario: Ningún ejemplo alcanza siempre
- **WHEN** se corren los ejemplos de siete y de veinte sensores durante dos minutos en cinco tráficos distintos
- **THEN** cada uno termina chocando en al menos uno de ellos

#### Scenario: Los ejemplos usan constantes
- **WHEN** la persona carga cualquiera de los tres ejemplos
- **THEN** los números del programa están definidos arriba, como constantes con nombre, y las reglas usan esos nombres

#### Scenario: Ejemplos en el idioma activo
- **WHEN** la aplicación está en inglés y la persona carga un ejemplo
- **THEN** el programa cargado usa las palabras, los nombres de las constantes y los comentarios en inglés

### Requirement: Restablecer el programa
La cabecera del programa SHALL ofrecer volver al programa inicial y a los sensores iniciales,
con una confirmación si el texto fue escrito o cambiado por la persona.

#### Scenario: Restablecer
- **WHEN** la persona restablece y confirma
- **THEN** el editor vuelve a mostrar el programa inicial, en el idioma activo, el auto vuelve a tener 5 sensores de 3 largos de auto y 90 grados, y ese programa pasa a manejar

#### Scenario: Restablecer después de un ejemplo
- **WHEN** la persona cargó el ejemplo de veinte sensores y restablece
- **THEN** el auto vuelve a tener 5 sensores y el programa inicial no muestra errores

#### Scenario: Cancelar
- **WHEN** la persona cancela la confirmación
- **THEN** su programa queda como estaba

### Requirement: Exportar e importar el programa
La cabecera del programa SHALL permitir descargar el programa como un archivo de texto y
cargar uno desde un archivo de texto. Importar SHALL reemplazar el texto del
editor, con confirmación si la persona había escrito o cambiado el suyo, y
MUST explicar en lenguaje llano por qué un archivo no se puede cargar.

#### Scenario: Ida y vuelta
- **WHEN** la persona exporta su programa, restablece y luego importa el archivo
- **THEN** el editor vuelve a mostrar exactamente su texto

#### Scenario: Programa importado con errores
- **WHEN** la persona importa un archivo de texto con una regla mal escrita
- **THEN** el texto se carga y sus errores se muestran igual que si lo hubiera escrito

#### Scenario: Archivo que no sirve
- **WHEN** la persona elige un archivo que no es de texto o tiene más de 200 líneas
- **THEN** un mensaje explica por qué no se puede cargar y el editor no cambia
