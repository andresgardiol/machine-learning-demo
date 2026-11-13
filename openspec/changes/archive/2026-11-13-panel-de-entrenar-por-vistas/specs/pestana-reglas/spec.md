# Spec Delta

## MODIFIED Requirements

### Requirement: Configuración avanzada
La pestaña SHALL ofrecer, en la barra de escenario y siempre a la vista, los mismos ajustes
que la pestaña 1: velocidad máxima del auto (compartida por todas las
pestañas), carriles, densidad e irregularidad del tráfico, y cantidad, alcance
y apertura de los sensores, con un botón que los restablece. Cambiar los
sensores MUST volver a analizar el programa.

#### Scenario: Sección plegada
- **WHEN** se abre la pestaña
- **THEN** los ajustes de la calle y del auto están a la vista en la barra de escenario, sin desplegar nada, y el panel no tiene ninguna sección plegable

#### Scenario: Menos sensores de los que usa el programa
- **WHEN** el programa usa `sensor5` y la persona baja los sensores a 3
- **THEN** se muestra el error de que el auto tiene 3 sensores, el auto deja de accionar controles y la paleta ofrece de `sensor1` a `sensor3`

#### Scenario: Volver atrás
- **WHEN** la persona restablece el escenario
- **THEN** el auto vuelve a tener 5 sensores, el error desaparece y el programa vuelve a manejar

#### Scenario: Velocidad compartida
- **WHEN** la persona cambia la velocidad máxima en esta pestaña y abre El problema
- **THEN** el auto de El problema tiene esa misma velocidad máxima

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
- **THEN** el auto tiene primero 3 sensores de 2 largos de auto y 60 grados, y después 20 sensores de 3 largos de auto y 120 grados, y la barra de escenario muestra esos valores

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
