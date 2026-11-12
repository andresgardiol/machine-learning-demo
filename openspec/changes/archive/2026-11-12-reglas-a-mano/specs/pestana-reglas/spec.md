# Spec Delta

## Purpose

Es la pestaña 2, "Reglas a mano": la persona programa el auto escribiendo
reglas y lo ve manejar con ellas en la misma calle con tráfico de la pestaña
1. Permite escribir, probar, corregir y comparar programas, hasta descubrir
que cada situación nueva pide una regla más.

## ADDED Requirements

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
Con la guía activa, el panel SHALL mostrar un texto de inicio, de hasta 240
caracteres en cada idioma, que diga que el auto hace lo que dicen las reglas
escritas, y que invite a cambiarlas y a agregar otras.

#### Scenario: Guía activa
- **WHEN** la guía está activa
- **THEN** el panel muestra el texto de inicio

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el texto de inicio, la paleta de palabras, los renglones de ayuda del tablero y las misiones no se muestran, y el editor y el auto siguen funcionando igual

### Requirement: Editor del programa
El tablero SHALL mostrar el programa en una tarjeta con un editor de texto:
números de línea, letra de ancho fijo y cada tipo de palabra (palabras de
regla, órdenes, datos, constantes, números y comentarios) distinguible sin
depender solo del color. La tarjeta SHALL ser la más alta del tablero y verse al abrir la
pestaña.

#### Scenario: Editor a la vista
- **WHEN** se abre la pestaña con la ventana en 1440×900
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
Con la guía activa, la tarjeta del programa SHALL mostrar una paleta con todas
las palabras del lenguaje: las de regla, las cuatro órdenes, `velocidad`, los
sensores del auto y las constantes que define el programa. Un clic en una palabra SHALL insertarla donde está el
cursor y devolver el foco al editor. Cada palabra SHALL tener un tooltip.

#### Scenario: Insertar una palabra
- **WHEN** el cursor está al final de `si ` y la persona hace clic en `sensor3`
- **THEN** el texto pasa a ser `si sensor3` y se puede seguir escribiendo

#### Scenario: Sensores del auto
- **WHEN** el auto tiene 5 sensores
- **THEN** la paleta ofrece de `sensor1` a `sensor5`

#### Scenario: Constantes del programa
- **WHEN** el programa define `cerca` y `borde`
- **THEN** la paleta ofrece `cerca` y `borde`, y deja de ofrecer una constante cuando su definición se borra

#### Scenario: Muchos sensores
- **WHEN** el auto tiene 30 sensores
- **THEN** la paleta ofrece los primeros 12 y dice que se pueden escribir hasta `sensor30`

#### Scenario: Palabras en el idioma activo
- **WHEN** la aplicación está en inglés
- **THEN** la paleta ofrece las palabras en inglés

### Requirement: Indicadores del programa
El tablero SHALL mostrar en un renglón, actualizados en tiempo real, la
distancia recorrida, los vehículos superados, la mejor distancia lograda desde
que se abrió la pestaña y la cantidad de reglas del programa que maneja.

#### Scenario: Reglas del programa
- **WHEN** el programa que maneja tiene una orden suelta y cuatro reglas
- **THEN** el indicador de reglas muestra 4

#### Scenario: Mejor distancia
- **WHEN** un intento termina con más distancia que la mejor registrada
- **THEN** la mejor distancia pasa a ser la de ese intento

### Requirement: Percepción y acción con los nombres del lenguaje
El tablero SHALL mostrar las barras de los sensores y de la velocidad con el
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
El panel SHALL permitir pausar y reanudar, reiniciar el intento con el mismo
tráfico y empezar con un tráfico nuevo, con los mismos atajos que la pestaña 1
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

### Requirement: Reintento automático
Al chocar, la pestaña SHALL mostrar la distancia recorrida y contra qué chocó
el auto. Con el interruptor de reintento automático encendido (por defecto),
el intento SHALL reiniciarse solo después de un segundo y medio, con el mismo
tráfico. Con el interruptor apagado, SHALL esperar a que la persona reinicie.

#### Scenario: Reintento encendido
- **WHEN** el auto choca con el reintento automático encendido
- **THEN** se lee a los cuántos metros y contra qué chocó, y un segundo y medio después el auto vuelve a salir, sin tocar nada

#### Scenario: Corregir entre intentos
- **WHEN** la persona corrige una regla mientras los intentos se suceden solos
- **THEN** el intento siguiente ya usa la regla corregida

#### Scenario: Reintento apagado
- **WHEN** el auto choca con el reintento automático apagado
- **THEN** el mensaje queda a la vista con una acción para reiniciar

#### Scenario: En pausa no se reintenta
- **WHEN** la persona pausa justo después de un choque
- **THEN** el intento no se reinicia hasta que se reanuda

### Requirement: Programas de ejemplo
El panel SHALL ofrecer tres programas de ejemplo, cada uno escrito para un
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
- **THEN** el auto tiene primero 3 sensores de 2 largos de auto y 60 grados, y después 20 sensores de 3 largos de auto y 120 grados, y la sección avanzada muestra esos valores

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
El panel SHALL ofrecer volver al programa inicial y a los sensores iniciales,
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
La pestaña SHALL recordar el texto del editor al salir de la pestaña y entre
visitas en el mismo navegador. Si el navegador no permite guardar, la pestaña
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

### Requirement: Exportar e importar el programa
El panel SHALL permitir descargar el programa como un archivo de texto y
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
- **WHEN** el programa solo frena detrás del primer vehículo y recorre un kilómetro sin chocar
- **THEN** ninguna misión avanza, porque no superó a nadie

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
La pestaña SHALL ofrecer, en una sección plegada al abrir, los mismos ajustes
que la pestaña 1: velocidad máxima del auto (compartida por todas las
pestañas), carriles, densidad e irregularidad del tráfico, y cantidad, alcance
y apertura de los sensores, con un botón que los restablece. Cambiar los
sensores MUST volver a analizar el programa.

#### Scenario: Sección plegada
- **WHEN** se abre la pestaña
- **THEN** los ajustes avanzados no están a la vista

#### Scenario: Menos sensores de los que usa el programa
- **WHEN** el programa usa `sensor5` y la persona baja los sensores a 3
- **THEN** se muestra el error de que el auto tiene 3 sensores, el auto deja de accionar controles y la paleta ofrece de `sensor1` a `sensor3`

#### Scenario: Volver atrás
- **WHEN** la persona restablece la configuración
- **THEN** el auto vuelve a tener 5 sensores, el error desaparece y el programa vuelve a manejar

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
