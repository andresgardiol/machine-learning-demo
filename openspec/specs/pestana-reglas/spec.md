# pestana-reglas Specification

## Purpose
Es la pestaña 2, "Reglas a mano": la persona programa el auto escribiendo
reglas y lo ve manejar con ellas en la misma calle con tráfico de la pestaña
1. Permite escribir, probar, corregir y comparar programas, hasta descubrir
que cada situación nueva pide una regla más.

## Requirements

### Requirement: Programa en marcha al abrir
Al abrirse por primera vez, la pestaña SHALL mostrar el auto ya manejado por
un programa inicial de una constante, una orden y una regla, sin configurar
nada: la constante `cerca` vale 0,2, el auto avanza, y gira a la izquierda
cuando el sensor del frente supera `cerca`. El escenario
SHALL ser una calle recta de tres carriles con tráfico, como la de la pestaña
1, con 5 sensores y un tráfico inicial propio de esta pestaña.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña por primera vez
- **THEN** el editor muestra el programa inicial, sin errores, el auto avanza solo y el indicador de reglas muestra 1

#### Scenario: El programa inicial hace algo y no alcanza
- **WHEN** la persona no toca nada
- **THEN** el auto esquiva hacia la izquierda al primer vehículo que tiene delante, lo supera y choca contra el borde de la calle antes de los 100 metros

#### Scenario: Programa inicial en el idioma activo
- **WHEN** la aplicación está en inglés la primera vez que se abre la pestaña
- **THEN** el programa inicial está escrito con las palabras en inglés

### Requirement: Guía de inicio
Con la guía activa, el panel SHALL ofrecer, plegado debajo de la tarjeta de consigna, un texto de inicio, de hasta 240
caracteres en cada idioma, que diga que el auto hace lo que dicen las reglas
escritas, y que invite a cambiarlas y a agregar otras. Se despliega con "Más sobre esta pestaña".

#### Scenario: Texto plegado
- **WHEN** la guía está activa y la persona entra a la pestaña
- **THEN** el texto de inicio está plegado debajo de la tarjeta de consigna y aparece al tocar "Más sobre esta pestaña"

#### Scenario: Guía activa
- **WHEN** la guía está activa y la persona despliega "Más sobre esta pestaña"
- **THEN** el panel muestra el texto de inicio

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el texto de inicio, la paleta de palabras, los renglones de ayuda del tablero y las misiones no se muestran, y el editor y el auto siguen funcionando igual

### Requirement: Editor del programa
El tablero SHALL mostrar el programa en una tarjeta con dos vistas, fichas y texto (ver "Vista de fichas"). La vista de texto SHALL ser un editor de texto con
números de línea, letra de ancho fijo y cada tipo de palabra (palabras de
regla, órdenes, datos, constantes, números y comentarios) distinguible sin
depender solo del color. La tarjeta SHALL ser la más alta del tablero y verse al abrir la
pestaña.

#### Scenario: Editor a la vista
- **WHEN** se abre la pestaña con la ventana en 1440×900 y la persona elige la vista de texto
- **THEN** la tarjeta del programa muestra al menos 12 líneas sin desplazar el tablero

#### Scenario: Reglas largas sin cortar
- **WHEN** una línea tiene 70 caracteres y la ventana mide 1440 píxeles de ancho con los anchos por defecto
- **THEN** la línea se lee completa en un renglón

#### Scenario: Programa más largo que la tarjeta
- **WHEN** el programa tiene 40 líneas
- **THEN** el editor se desplaza por dentro y los números de línea acompañan al texto

#### Scenario: Tipos de palabra
- **WHEN** el editor muestra `si sensor3 > 0,5 entonces girar izquierda # esquiva`
- **THEN** las palabras de regla, el dato, el número, la orden y el comentario se ven distintos entre sí

### Requirement: Escribir con comodidad
El editor SHALL agregar la sangría sola al pasar de renglón después de una
línea que termina en `entonces`, y conservarla en las líneas siguientes. La
tecla Tab SHALL agregar sangría y Mayús+Tab quitarla; la tecla Escape SHALL
sacar el foco del editor. Mientras se escribe, los atajos de la pestaña MUST
NOT accionarse.

#### Scenario: Sangría automática
- **WHEN** la persona escribe `si sensor3 > 0,5 entonces` y presiona Enter
- **THEN** el cursor queda en la línea siguiente, con sangría

#### Scenario: Salir del editor con el teclado
- **WHEN** el foco está en el editor y la persona presiona Escape y después Tab
- **THEN** el foco sale del editor hacia el control siguiente

#### Scenario: Escribir una letra que es un atajo
- **WHEN** la persona escribe la letra R o un espacio dentro del editor
- **THEN** el texto recibe la letra o el espacio, y el intento no se reinicia ni se pausa

#### Scenario: Deshacer
- **WHEN** la persona borra una línea y presiona el atajo de deshacer del sistema
- **THEN** la línea vuelve

### Requirement: El programa rige mientras se escribe
Cada vez que el texto del editor pasa a ser un programa válido distinto, ese
programa SHALL manejar el auto en menos de medio segundo, sin reiniciar el
intento ni perder los indicadores.

#### Scenario: Cambiar un número
- **WHEN** la persona cambia `0,5` por `0,3` en una regla mientras el auto maneja
- **THEN** el auto pasa a reaccionar con el número nuevo, y la distancia y los vehículos superados del intento siguen contando

#### Scenario: Agregar una regla
- **WHEN** la persona termina de escribir una regla nueva válida
- **THEN** el indicador de reglas aumenta en uno y la regla empieza a aplicarse

#### Scenario: Borrar todo
- **WHEN** la persona borra todo el texto
- **THEN** el programa vacío pasa a regir y el auto deja de accionar controles

### Requirement: Errores a la vista
Cuando el texto no es un programa válido, la tarjeta SHALL mostrar debajo del
editor cada error en lenguaje llano, con su número de línea, y marcar esas
líneas. El auto MUST seguir manejado por el último programa válido. Al
corregir el texto, los mensajes SHALL desaparecer.

#### Scenario: Error mientras se escribe
- **WHEN** la persona deja una línea que dice `si sensor3 > 0,5 girar izquierda`
- **THEN** debajo del editor se lee, con el número de esa línea, que falta `entonces`, la línea queda marcada y el auto sigue manejando con el programa anterior

#### Scenario: Palabra parecida
- **WHEN** la persona escribe `abanzar`
- **THEN** el mensaje dice que no entiende "abanzar" y pregunta si quiso escribir "avanzar"

#### Scenario: Corregir
- **WHEN** la persona corrige la línea con el error
- **THEN** el mensaje y la marca desaparecen y el programa nuevo pasa a regir

#### Scenario: Sin ningún programa válido anterior
- **WHEN** la pestaña se abre con un programa recordado que tiene un error
- **THEN** el error se muestra, el auto no acciona ningún control y nada falla

#### Scenario: Estado sin errores
- **WHEN** el texto es un programa válido
- **THEN** debajo del editor se lee que el programa no tiene errores

### Requirement: Líneas que se cumplen resaltadas
El editor SHALL resaltar, actualizadas en cada cuadro, las líneas que el
programa en marcha está cumpliendo, con una marca junto al número de línea
además del color. Con el intento en pausa, el resaltado SHALL quedar fijo en
el último instante.

#### Scenario: Regla que se enciende
- **WHEN** un vehículo se acerca por delante y la lectura del sensor 3 supera el número de la regla
- **THEN** la línea de la regla y la de su acción pasan a verse resaltadas, y dejan de estarlo cuando la lectura baja

#### Scenario: Orden suelta
- **WHEN** el programa tiene la orden suelta `avanzar`
- **THEN** su línea está resaltada todo el tiempo

#### Scenario: En pausa
- **WHEN** la persona pausa el intento
- **THEN** las líneas resaltadas quedan como estaban en ese instante

#### Scenario: Texto con error
- **WHEN** el texto del editor tiene un error
- **THEN** no se resalta ninguna línea como cumplida, porque el texto a la vista no es el programa que maneja

### Requirement: Paleta de palabras
Con la guía activa y la vista de texto, la tarjeta del programa SHALL mostrar una paleta con las
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

#### Scenario: Sin paleta en la vista de fichas
- **WHEN** la vista del programa es la de fichas
- **THEN** la paleta no se ve ni ocupa lugar

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

### Requirement: Reintento automático
Al chocar, la pestaña SHALL mostrar la distancia recorrida y contra qué chocó
el auto. Con el interruptor de reintento automático encendido (por defecto),
el intento SHALL reiniciarse solo después de 5 segundos, con el mismo
tráfico, mostrando el caso del choque y una cuenta regresiva. Tocar cualquier
control del caso SHALL detener la cuenta hasta que la persona reinicie. Con el interruptor apagado, SHALL esperar a que la persona reinicie.

#### Scenario: Reintento encendido
- **WHEN** el auto choca con el reintento automático encendido
- **THEN** se lee a los cuántos metros y contra qué chocó, una cuenta regresiva muestra cuánto falta, y 5 segundos después el auto vuelve a salir, sin tocar nada

#### Scenario: Corregir entre intentos
- **WHEN** la persona corrige una regla mientras los intentos se suceden solos
- **THEN** el intento siguiente ya usa la regla corregida

#### Scenario: Reintento apagado
- **WHEN** el auto choca con el reintento automático apagado
- **THEN** el mensaje queda a la vista con una acción para reiniciar

#### Scenario: En pausa no se reintenta
- **WHEN** la persona pausa justo después de un choque
- **THEN** el intento no se reinicia hasta que se reanuda

#### Scenario: Quedarse en el caso
- **WHEN** con el reintento automático encendido, la persona mueve el deslizador de la repetición o toca "Compará con los ejemplos" durante la cuenta regresiva
- **THEN** la cuenta se detiene y el caso queda a la vista hasta que la persona reinicia o prueba otro programa

### Requirement: Programas de ejemplo
La franja de programas de la tarjeta del programa SHALL ofrecer, en un solo lugar, tres programas de ejemplo (y "Tu programa" cuando lo hay), cada uno con su cifra de vehículos superados en el mismo tráfico y escrito para un
auto distinto: tres sensores cortos, siete sensores y veinte sensores. Cargar
un ejemplo SHALL poner su programa en el editor y cambiar los sensores del
auto a los de ese ejemplo. Las reglas de los ejemplos MUST NOT usar `o`, `no` ni paréntesis, para que entren enteras en fichas: lo que haría una regla con `o` se escribe como una regla por alternativa, con la misma acción. Si el texto del editor fue escrito o cambiado por
la persona, cargar un ejemplo MUST guardarlo como "Tu programa", con sus
sensores, sin pedir confirmación.

#### Scenario: Cargar un ejemplo
- **WHEN** la persona elige el ejemplo de siete sensores sin haber cambiado el programa inicial
- **THEN** el editor muestra ese programa, el auto pasa a tener 7 sensores de 3 largos de auto y 90 grados, el intento se reinicia y el programa maneja de inmediato

#### Scenario: Sensores de cada ejemplo
- **WHEN** la persona carga el ejemplo de tres sensores y después el de veinte
- **THEN** el auto tiene primero 3 sensores de 2 largos de auto y 60 grados, y después 20 sensores de 3 largos de auto y 120 grados, y la cabecera del programa muestra esos valores

#### Scenario: Ejemplo con cambios propios
- **WHEN** la persona escribió sus propias reglas y elige un ejemplo
- **THEN** el ejemplo se carga sin confirmación, y "Tu programa" aparece junto a los ejemplos con el texto y los sensores que tenía

#### Scenario: Un solo lugar para los ejemplos
- **WHEN** la persona mira la tarjeta del programa sin haber abierto la tabla
- **THEN** cada ejemplo aparece una sola vez, en la franja de programas, junto a los sensores, con su cifra de superados cuando ya está calculada, y el que maneja se ve como opción elegida

#### Scenario: Tres sensores cortos
- **WHEN** se corre el ejemplo de tres sensores durante dos minutos con el tráfico inicial de la pestaña
- **THEN** el auto no choca y supera menos vehículos que con el ejemplo de siete sensores: frena detrás del primero de su carril y solo deja atrás a los de los carriles más lentos

#### Scenario: Siete sensores
- **WHEN** se corre el ejemplo de siete sensores con el tráfico inicial de la pestaña
- **THEN** el auto supera al menos 10 vehículos antes de chocar

#### Scenario: Veinte sensores
- **WHEN** se corre el ejemplo de veinte sensores con el tráfico inicial de la pestaña
- **THEN** el programa tiene más del triple de reglas que el de siete sensores y el auto recorre menos distancia que con aquel

#### Scenario: Ningún ejemplo alcanza siempre
- **WHEN** se corren los ejemplos de siete y de veinte sensores durante dos minutos en cinco tráficos distintos
- **THEN** cada uno termina chocando en al menos uno de ellos

#### Scenario: Los ejemplos usan constantes
- **WHEN** la persona carga cualquiera de los tres ejemplos
- **THEN** los números del programa están definidos arriba, como constantes con nombre, y las reglas usan esos nombres

#### Scenario: Ejemplos en el idioma activo
- **WHEN** la aplicación está en inglés y la persona carga un ejemplo
- **THEN** el programa cargado usa las palabras, los nombres de las constantes y los comentarios en inglés

#### Scenario: Sin `o` en los ejemplos
- **WHEN** la persona carga el ejemplo de siete o de veinte sensores
- **THEN** ninguna regla usa `o`, `no` ni paréntesis, y el auto recorre la misma distancia que con las reglas que usaban `o`

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

### Requirement: Programa recordado
La pestaña SHALL recordar el texto del editor, junto con los sensores del auto
para el que está escrito, al salir de la pestaña y entre visitas en el mismo
navegador. Al abrir, el programa recordado MUST poder manejar: nunca se abre
con un error que la persona no escribió. Si el navegador no permite guardar, la pestaña
MUST funcionar igual, empezando con el programa inicial.

#### Scenario: Volver a la pestaña
- **WHEN** la persona escribe un programa, abre Entrenar y vuelve
- **THEN** el editor muestra su programa y el auto maneja con él

#### Scenario: Segunda visita
- **WHEN** la persona escribe un programa y vuelve a abrir la aplicación en el mismo navegador
- **THEN** la pestaña abre con ese programa

#### Scenario: Navegador sin almacenamiento
- **WHEN** el navegador impide guardar o leer
- **THEN** la pestaña abre con el programa inicial y no muestra ningún error

#### Scenario: Ejemplo de veinte sensores recordado
- **WHEN** la persona carga el ejemplo de 20 sensores y vuelve a abrir la aplicación
- **THEN** la pestaña abre con ese programa, el auto tiene 20 sensores de 3 largos de auto y 120 grados, y no hay ningún error

#### Scenario: Programa guardado sin sus sensores
- **WHEN** el navegador tiene un programa recordado por una versión anterior, sin sus sensores, que usa hasta `sensor20`
- **THEN** la pestaña abre con ese programa y un auto con 20 sensores, la cantidad que el programa necesita, y no hay ningún error

#### Scenario: Sensores cambiados a mano
- **WHEN** la persona cambia los sensores en la barra de escenario y vuelve a abrir la aplicación
- **THEN** la pestaña abre con los sensores que dejó

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

### Requirement: Misiones
Con la guía activa, el panel SHALL mostrar tres misiones con su progreso:
superar 3 vehículos sin chocar, superar 10 vehículos sin chocar y superar 10
vehículos en 3 tráficos distintos con el mismo programa. Las misiones MUST NOT
bloquear ninguna función y una misión cumplida SHALL seguir marcada hasta
cerrar la aplicación.

#### Scenario: Progreso
- **WHEN** el auto supera dos vehículos en un intento
- **THEN** la primera misión muestra 2 de 3 y la segunda 2 de 10

#### Scenario: Frenar no alcanza
- **WHEN** el programa solo frena detrás del primer vehículo de su carril y recorre un kilómetro sin chocar
- **THEN** la misión de superar 10 vehículos no se cumple: solo deja atrás a algunos de los carriles más lentos

#### Scenario: Tráficos distintos
- **WHEN** el programa supera 10 vehículos, la persona pide un tráfico nuevo y vuelve a superar 10
- **THEN** la tercera misión muestra 2 de 3

#### Scenario: Cambiar el programa
- **WHEN** la persona cambia el programa con la tercera misión en 2 de 3
- **THEN** la tercera misión vuelve a 0 de 3, porque los tráficos ya no se recorrieron con el mismo programa

#### Scenario: Misión cumplida
- **WHEN** la persona cumple una misión y después cambia el programa
- **THEN** la misión sigue marcada como cumplida

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

### Requirement: Fluidez con el programa en marcha
Ejecutar el programa y resaltar sus líneas MUST NOT degradar la animación.

#### Scenario: Programa largo
- **WHEN** se mide la tasa de cuadros durante diez segundos con un programa de 50 reglas en marcha y la configuración por defecto
- **THEN** el promedio es de al menos 50 cuadros por segundo

### Requirement: Controles de la pestaña explicados
Cada control de la pestaña (el editor, cada palabra de la paleta, los
controles del intento, el reintento automático, los ejemplos, restablecer,
exportar, importar y cada ajuste) SHALL tener un tooltip que diga qué hace y
por qué importa. Todos los textos, mensajes de error, ejemplos y misiones
SHALL estar en español y en inglés.

#### Scenario: Tooltip de una palabra de la paleta
- **WHEN** la persona posa el cursor sobre `entonces`
- **THEN** un tooltip en el idioma activo explica que separa la condición de lo que el auto hace cuando se cumple

#### Scenario: Tooltip de un sensor
- **WHEN** la persona posa el cursor sobre `sensor3`
- **THEN** el tooltip explica que es la lectura del tercer rayo, de 0 (nada a la vista) a 1 (tocando el obstáculo)

#### Scenario: Errores en inglés
- **WHEN** la aplicación está en inglés y el texto tiene un error
- **THEN** el mensaje de error se lee en inglés

#### Scenario: Pestaña en inglés
- **WHEN** la aplicación está en inglés
- **THEN** la guía, los indicadores, la paleta, los mensajes, los ejemplos, las misiones y los controles se muestran en inglés

### Requirement: Elegir la pista
La pestaña SHALL ofrecer el mismo selector de pista que El problema, con la
calle recta elegida por defecto. Cambiar de pista MUST reiniciar el intento
con el mismo programa. En un circuito SHALL valer lo mismo que en El
problema: indicador de vueltas, ajustes de tráfico deshabilitados con su
explicación y misiones ocultas.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la pista elegida es la calle recta y el programa inicial maneja como antes

#### Scenario: Programa en un circuito
- **WHEN** la persona elige el óvalo
- **THEN** su programa pasa a manejar el auto en el óvalo desde la línea de salida, y las líneas que se cumplen se siguen resaltando

#### Scenario: Reintento en un circuito
- **WHEN** el auto choca en un circuito con el reintento automático encendido
- **THEN** vuelve a salir de la línea de salida del mismo circuito

#### Scenario: Volver a la calle
- **WHEN** la persona vuelve a elegir la calle recta o restablece el programa
- **THEN** el intento se reinicia en la calle recta

### Requirement: Ejemplos en la calle recta
Los programas de ejemplo son para la calle recta. Cargar un ejemplo con un
circuito elegido SHALL volver a la calle recta, además de cambiar el programa
y los sensores, y la confirmación MUST avisarlo.

#### Scenario: Cargar un ejemplo desde un circuito
- **WHEN** la persona carga el ejemplo de 7 sensores con el óvalo elegido
- **THEN** la pista vuelve a ser la calle recta y el ejemplo maneja ahí

#### Scenario: Aviso
- **WHEN** la persona pide cargar un ejemplo con un circuito elegido
- **THEN** el pedido de confirmación dice que el ejemplo es para la calle recta y que se va a volver a ella

### Requirement: Ver como la máquina
La pestaña SHALL ofrecer, junto al interruptor de los sensores, un modo
apagado por defecto que oculta la pista, el tráfico y el paisaje y deja a la
vista solo el auto, sus rayos y las barras del tablero: lo único que el
programa recibe. El interruptor SHALL tener un tooltip que diga qué hace y por
qué importa, en español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** el modo está apagado y se ven la pista, el tráfico y el paisaje

#### Scenario: Activar el modo
- **WHEN** la persona activa el modo ver como la máquina
- **THEN** dejan de verse la pista, el tráfico y el paisaje, y siguen visibles el auto, sus rayos y las barras, aunque los sensores estuvieran ocultos

#### Scenario: Chocar sin ver
- **WHEN** el auto choca con el modo activo
- **THEN** la pista y el tráfico vuelven a mostrarse junto con el aviso del choque, y se ocultan otra vez cuando empieza el intento siguiente

#### Scenario: Desactivar el modo
- **WHEN** la persona desactiva el modo
- **THEN** la pista, el tráfico y el paisaje vuelven a verse y el intento continúa

#### Scenario: El programa sigue igual
- **WHEN** se repite un intento con el modo activo y con el modo apagado
- **THEN** el auto hace exactamente lo mismo: el modo solo cambia lo que se dibuja

#### Scenario: Tooltip
- **WHEN** la persona posa el cursor sobre el interruptor
- **THEN** un tooltip en el idioma activo explica que oculta todo menos lo que el programa recibe, y que con esos pocos números se escriben las reglas

### Requirement: Insertar un dato desde su barra
Con 12 sensores o menos, cada barra de sensor y la de `velocidad` SHALL ser un control: un clic o Enter inserta en el cursor del editor una comparación con el valor de ese instante (`sensor3 > 0,49`), con dos decimales y el separador del idioma activo, y devuelve el foco al editor; en la vista de fichas, agrega una ficha nueva con esa comparación y la acción por elegir. Cada barra SHALL tener un tooltip que diga qué hace y por qué importa, en español y en inglés. Funciona con la guía encendida o apagada.

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

#### Scenario: En la vista de fichas
- **WHEN** la vista es la de fichas y la persona toca la fila de `sensor3`, que muestra 0,49
- **THEN** aparece al final una ficha `si sensor3 > 0,49 entonces [acción ▾]`, con el selector de la acción enfocado

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

### Requirement: Caso del choque
Al chocar, la pestaña SHALL mostrar el caso: la columna de percepción congelada en los valores del choque, las líneas que se cumplían en ese instante marcadas en el editor con el estado "choque" (o "Ninguna regla se cumplía") y una tarjeta, en el lugar de la marcha, con la distancia, contra qué chocó y qué reglas se cumplían. Reiniciar SHALL borrar el caso de todos esos lugares.

#### Scenario: Estado por defecto
- **WHEN** con los valores por defecto el programa inicial choca
- **THEN** la tarjeta dice a los cuántos metros y contra qué chocó, las barras de la columna quedan en los valores del choque y en el editor se ven marcadas las líneas que se cumplían

#### Scenario: Ninguna regla
- **WHEN** el auto choca en un instante en que no se cumplía ninguna regla ni orden
- **THEN** la tarjeta dice que ninguna regla se cumplía y el editor no marca ninguna línea

#### Scenario: Sin depender del color
- **WHEN** se ve el caso en escala de grises
- **THEN** las líneas marcadas por el choque se distinguen de las que se cumplen en marcha por su forma

#### Scenario: Vuelta atrás
- **WHEN** la persona reinicia
- **THEN** la tarjeta, las marcas del editor y la columna congelada desaparecen, y la marcha vuelve a su lugar

### Requirement: Repetición del choque
Con un choque a la vista, un deslizador sobre la escena SHALL permitir volver a ver los últimos 3 segundos antes del choque, cuadro por cuadro: la escena, la columna de percepción y las líneas que se cumplían siguen al deslizador. Lo que se muestra MUST ser lo que se calculó mientras el auto andaba, no una animación nueva. El deslizador SHALL tener tooltip y manejarse con el teclado.

#### Scenario: Volver atrás en el tiempo
- **WHEN** la persona lleva el deslizador a 1 segundo antes del choque
- **THEN** la escena muestra el auto donde estaba en ese instante, la columna muestra lo que percibía y el editor resalta las líneas que se cumplían

#### Scenario: Con el teclado
- **WHEN** la persona llega al deslizador con Tab y presiona la flecha izquierda
- **THEN** la repetición retrocede un paso y el auto no gira

#### Scenario: Intento corto
- **WHEN** el auto choca antes de cumplir 3 segundos
- **THEN** el deslizador cubre solo el tiempo que duró el intento

#### Scenario: Determinismo
- **WHEN** la persona repite el choque, reinicia y el auto vuelve a chocar igual
- **THEN** la repetición muestra los mismos cuadros que la vez anterior

### Requirement: Comparar con los ejemplos
La tarjeta del programa SHALL ofrecer una comparación, en el mismo tráfico y con la misma velocidad, entre el programa que maneja y los tres ejemplos: por cada uno, sus sensores, sus reglas, la distancia, los vehículos superados y si chocó, con un tope de 2 minutos de simulación. Cada fila SHALL poder probarse con un toque. La tabla completa SHALL estar cerrada por defecto y abrirse, sobre las fichas y sin correrlas, con "Tabla" o con "Compará con los ejemplos", que con un choque a la vista SHALL ser la acción principal. SHALL cerrarse con Escape, con "Ocultar" o al probar un programa.

#### Scenario: Estado por defecto
- **WHEN** el programa inicial choca y la persona toca "Compará con los ejemplos"
- **THEN** la comparación muestra el programa inicial y los tres ejemplos con sus cifras en el tráfico de ese intento, y el foco va a la comparación

#### Scenario: La tabla no quita lugar
- **WHEN** la persona abre la tabla con el ejemplo de 7 sensores en fichas
- **THEN** la tabla se ve sobre las fichas, las fichas no se corren, y al cerrarla con Escape el foco vuelve a donde estaba

#### Scenario: Más reglas no es mejor
- **WHEN** la persona mira la comparación con los valores por defecto
- **THEN** el ejemplo de 20 sensores tiene más del triple de reglas que el de 7 y no recorre más distancia que él

#### Scenario: Superados manda
- **WHEN** la persona mira la comparación
- **THEN** la primera columna de cifras es la de vehículos superados, destacada, y la distancia va después, con menos peso

#### Scenario: Frenar no alcanza
- **WHEN** un programa termina los 2 minutos sin chocar y sin superar ningún vehículo
- **THEN** su fila dice que frena detrás del primer vehículo, en lugar de verse como el mejor resultado

#### Scenario: Probar un ejemplo
- **WHEN** la persona toca la fila del ejemplo de 7 sensores
- **THEN** el ejemplo se carga con sus sensores, el intento se reinicia en el mismo tráfico y el programa maneja de inmediato

#### Scenario: Determinismo
- **WHEN** la persona abre la comparación dos veces con el mismo tráfico y los mismos ajustes
- **THEN** las cifras son las mismas

#### Scenario: Otra velocidad
- **WHEN** la velocidad máxima no es la de 20 m/s para la que se escribieron los ejemplos
- **THEN** la comparación avisa que los ejemplos se escribieron para 20 m/s

#### Scenario: Sin trabar la animación
- **WHEN** la comparación se calcula
- **THEN** la escena sigue animándose y la comparación muestra que está calculando hasta tener las cifras

### Requirement: Tu programa
Cuando la persona carga un ejemplo con un texto propio en el editor, la pestaña SHALL guardar ese texto y sus sensores como "Tu programa" y ofrecerlo junto a los ejemplos y en la comparación. Tocarlo SHALL devolver el texto y los sensores, sin confirmación. Restablecer el programa SHALL borrar "Tu programa".

#### Scenario: Ida y vuelta
- **WHEN** la persona escribió sus reglas, prueba el ejemplo de 20 sensores y después toca "Tu programa"
- **THEN** el editor vuelve a mostrar sus reglas, el auto vuelve a sus sensores y el programa vuelve a manejar

#### Scenario: Sin texto propio
- **WHEN** la persona pasa de un ejemplo a otro sin haber escrito nada
- **THEN** "Tu programa" no aparece

#### Scenario: Vuelta atrás
- **WHEN** la persona restablece el programa y confirma
- **THEN** "Tu programa" desaparece junto con el texto propio

### Requirement: Cuaderno de casos
Con la guía activa, la zona del escenario SHALL mostrar un cuaderno de casos: cuántos choques hubo, cuántas reglas tiene el programa que maneja y la mejor distancia, con un punto por choque sobre la distancia a la que ocurrió. El cuaderno SHALL borrarse al restablecer el programa o al cambiar de pista.

#### Scenario: Estado por defecto
- **WHEN** la persona abre la pestaña por primera vez
- **THEN** el cuaderno dice que todavía no hubo casos

#### Scenario: Los casos se suman
- **WHEN** el auto choca tres veces y la persona agrega dos reglas entre medio
- **THEN** el cuaderno muestra 3 casos, las reglas que tiene ahora el programa y tres puntos a las distancias de los choques

#### Scenario: Guía apagada
- **WHEN** el mentor apaga la guía
- **THEN** el cuaderno no se ve ni ocupa lugar

#### Scenario: Vuelta atrás
- **WHEN** la persona restablece el programa
- **THEN** el cuaderno vuelve a decir que no hubo casos

### Requirement: Regla para el caso
Con un choque a la vista, la tarjeta del caso SHALL ofrecer, como acción secundaria, "Escribir una regla para este caso": agrega al final del programa una condición con los sensores que más leían al chocar y sus valores, sin acción, y deja el cursor donde va la acción; en la vista de fichas, la agrega como una ficha con el selector de la acción enfocado. El texto agregado SHALL deshacerse con Ctrl+Z.

#### Scenario: Agregar la condición
- **WHEN** el auto chocó con `sensor1` en 0,87 y `sensor2` en 0,81, y la persona toca "Escribir una regla para este caso"
- **THEN** al final del programa aparece `si sensor1 > 0,80 y sensor2 > 0,80 entonces `, el cursor queda al final y el foco va al editor

#### Scenario: El programa con error mientras falta la acción
- **WHEN** la condición quedó sin acción
- **THEN** el editor muestra el error de regla sin acciones y el auto sigue con el último programa válido

#### Scenario: Vuelta atrás
- **WHEN** la persona presiona Ctrl+Z
- **THEN** la condición agregada desaparece

### Requirement: Vista de fichas
La tarjeta del programa SHALL ofrecer dos vistas del mismo texto: fichas, la que se abre por defecto, y texto. Un control SHALL cambiar de vista, y la vista elegida SHALL recordarse. El texto MUST seguir siendo la fuente de verdad: todo cambio hecho en las fichas se escribe en el texto, y cambiar de vista MUST NOT cambiar el programa.

#### Scenario: Estado por defecto
- **WHEN** la persona abre Reglas a mano por primera vez
- **THEN** el programa inicial se ve en fichas: la constante `cerca`, la orden `avanzar` y la regla `si sensor3 > cerca entonces girar izquierda`

#### Scenario: Ver como texto
- **WHEN** la persona toca "Ver como texto"
- **THEN** ve el editor con el mismo programa, y la vista de texto queda recordada para la próxima visita

#### Scenario: Ida y vuelta sin cambios
- **WHEN** la persona pasa de fichas a texto y de texto a fichas sin tocar nada
- **THEN** el texto queda igual, carácter por carácter, comentarios incluidos

#### Scenario: En inglés
- **WHEN** la aplicación está en inglés
- **THEN** las fichas muestran las palabras en inglés, y lo que se cambia en ellas se escribe en inglés

#### Scenario: Lugar para las fichas
- **WHEN** la persona carga el ejemplo de 7 sensores a 1366×768, con la guía encendida y sin la tabla abierta
- **THEN** se ven enteras al menos 4 fichas de regla sin desplazar el tablero ni la pila, y las fichas de dos comparaciones entran en un renglón

#### Scenario: Navegador sin almacenamiento
- **WHEN** el navegador no permite guardar preferencias
- **THEN** la pestaña abre en fichas y funciona igual

### Requirement: Ficha de regla
Cada orden suelta, cada constante y cada regla con una o varias comparaciones unidas por "y", y una o varias acciones, SHALL verse como una ficha que se lee como una oración. El número de cada comparación con un sensor o `velocidad` SHALL tener un riel de 0 a 1 con el umbral y, en vivo, el valor del dato. La ficha SHALL mostrar las palabras con el color y la forma de su rol.

#### Scenario: Valor en vivo
- **WHEN** un vehículo se acerca por delante y `sensor3` sube de 0,1 a 0,5
- **THEN** en la ficha `si sensor3 > 0,20` la marca del valor avanza sobre el riel, pasa el umbral y la ficha se enciende

#### Scenario: Comparar dos sensores
- **WHEN** la regla es `si sensor2 > sensor4 entonces girar derecha`
- **THEN** la ficha muestra dos selectores de sensor, sin riel

#### Scenario: Umbral con una constante
- **WHEN** la regla compara con la constante `cerca`
- **THEN** la ficha muestra el nombre `cerca` y su valor sobre el riel

#### Scenario: Muchas reglas
- **WHEN** la persona carga el ejemplo de 20 sensores
- **THEN** todas sus reglas se ven como fichas, la pila se desplaza dentro de la tarjeta y "Reglas" muestra la cantidad

### Requirement: Ficha escrita a mano
Lo que una ficha no puede mostrar (una regla con `o`, `no`, paréntesis o un comentario dentro) SHALL verse como una ficha "escrita a mano", con su texto tal cual y una acción para editarlo en la vista de texto. Los comentarios sueltos SHALL verse como notas, sin controles.

#### Scenario: Regla con "o"
- **WHEN** el programa tiene `si sensor1 > 0,5 o sensor5 > 0,5 entonces retroceder`
- **THEN** esa regla se ve como ficha escrita a mano, con su texto, y las demás siguen como fichas

#### Scenario: Editarla
- **WHEN** la persona toca "Editar como texto" en una ficha escrita a mano
- **THEN** pasa a la vista de texto con el cursor en esa línea

#### Scenario: Los ejemplos entran
- **WHEN** la persona carga cualquiera de los tres ejemplos o el programa inicial
- **THEN** ninguna regla se ve como escrita a mano

### Requirement: Editar con fichas
En una ficha SHALL poder cambiarse el dato, el operador, el número (con su deslizador o escribiéndolo) y cada acción. Cada cambio SHALL escribirse en el texto solo en las líneas de esa regla, empezar a regir de inmediato y deshacerse con Ctrl+Z. Cada control SHALL tener tooltip, manejarse con el teclado y tener sus textos en español y en inglés.

#### Scenario: Mover el número
- **WHEN** la persona arrastra el umbral de `si sensor3 > 0,20` a 0,35
- **THEN** el texto pasa a decir `si sensor3 > 0,35`, los comentarios y las demás líneas quedan iguales, y el auto maneja con el número nuevo

#### Scenario: Cambiar el sensor y la acción
- **WHEN** la persona elige `sensor4` en el selector del dato y `girar derecha` en el de la acción
- **THEN** el texto de esa regla cambia y el programa no tiene errores

#### Scenario: Con el teclado
- **WHEN** la persona llega con Tab al deslizador del umbral y presiona la flecha derecha
- **THEN** el umbral sube 0,01 y el auto no gira

#### Scenario: Deshacer
- **WHEN** la persona cambió el número y presiona Ctrl+Z
- **THEN** el número vuelve al anterior, en las fichas y en el texto

### Requirement: Agregar y borrar fichas
La vista de fichas SHALL ofrecer "Agregar regla", que agrega al final `si sensor1 > 0,50 entonces` con el selector de la acción enfocado, y un botón para borrar cada ficha. Una regla sin acción SHALL marcarse como incompleta, y mientras tanto el auto sigue con el último programa válido. Agregar y borrar SHALL deshacerse con Ctrl+Z.

#### Scenario: Agregar
- **WHEN** la persona toca "Agregar regla" y elige `retroceder`
- **THEN** el programa suma la regla `si sensor1 > 0,50 entonces retroceder` y "Reglas" aumenta en uno

#### Scenario: Incompleta
- **WHEN** la ficha nueva todavía no tiene acción
- **THEN** se ve marcada como incompleta, con el estado "error", y el auto sigue con el programa anterior

#### Scenario: Borrar y volver atrás
- **WHEN** la persona borra una ficha y presiona Ctrl+Z
- **THEN** la regla vuelve, en el mismo lugar del texto

### Requirement: Reordenar fichas
Las fichas SHALL poder reordenarse arrastrándolas y, con el teclado, desde el asa de cada una con Alt y las flechas arriba y abajo. Reordenar SHALL mover las líneas en el texto, con deshacer. El orden MUST NOT cambiar lo que hace el auto, porque todas las reglas que se cumplen actúan a la vez.

#### Scenario: Arrastrar
- **WHEN** la persona arrastra la última ficha arriba de la primera regla
- **THEN** el texto muestra esa regla en su nuevo lugar y el programa sigue sin errores

#### Scenario: Con el teclado
- **WHEN** la persona llega al asa de una ficha y presiona Alt+flecha arriba
- **THEN** la ficha sube un lugar y el foco sigue en su asa

#### Scenario: Mismo comportamiento
- **WHEN** se reordenan las reglas y se reinicia con el mismo tráfico
- **THEN** el auto recorre la misma distancia que antes

### Requirement: Constantes como deslizadores
En la vista de fichas, cada constante con un valor entre 0 y 1 SHALL verse arriba de todo como un deslizador con su nombre y su valor. Al moverlo SHALL cambiar el texto de la definición y, con ella, todas las reglas que la usan. Una constante fuera de ese rango SHALL verse como ficha escrita a mano.

#### Scenario: Mover una constante
- **WHEN** la persona lleva `cerca` de 0,2 a 0,4
- **THEN** la definición pasa a `cerca = 0,4`, el umbral de las fichas que usan `cerca` se mueve con ella y el auto maneja con el valor nuevo

#### Scenario: Arrastrar sin romper el texto
- **WHEN** la persona arrastra el deslizador de `cerca` de un lado al otro varias veces, pasando por valores de distinto largo (0,2, 0,24, 0,3, 0,05)
- **THEN** después de cada paso el texto sigue teniendo una definición por línea, el programa no tiene errores y la pestaña sigue andando

#### Scenario: Fuera de rango
- **WHEN** el programa define `lejos = 3`
- **THEN** esa constante se ve como ficha escrita a mano

### Requirement: Fichas que se cumplen
En la vista de fichas, la ficha de cada regla u orden que el programa en marcha está cumpliendo SHALL verse con el estado "se cumple", actualizada en cada cuadro. Con un choque a la vista, las que se cumplían SHALL verse con el estado "choque". La repetición del choque SHALL marcar las fichas del cuadro elegido.

#### Scenario: Se enciende
- **WHEN** la regla de `sensor3` se cumple mientras el auto anda
- **THEN** su ficha se ve encendida, también en escala de grises

#### Scenario: Choque
- **WHEN** el auto choca
- **THEN** las fichas que se cumplían quedan con el estado "choque" hasta reiniciar

#### Scenario: Texto con error
- **WHEN** hay una ficha incompleta
- **THEN** ninguna ficha se marca como cumplida, porque el programa que maneja es el anterior
