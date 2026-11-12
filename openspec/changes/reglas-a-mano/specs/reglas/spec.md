# Spec Delta

## Purpose

Define el lenguaje de reglas con el que una persona programa el auto a mano:
qué se puede escribir, qué significa cada línea, cómo se explica un error y
qué reglas se cumplen en cada instante. Es deliberadamente mínimo, para que se
vea hasta dónde llega un programa hecho de reglas.

## ADDED Requirements

### Requirement: Programa por líneas
Un programa SHALL ser un texto en el que cada línea es una orden, una regla,
la definición de una constante, un comentario o una línea vacía. Un comentario empieza con `#` y llega hasta
el final de la línea. Los comentarios y las líneas vacías MUST NOT cambiar lo
que hace el programa.

#### Scenario: Programa mínimo
- **WHEN** el texto es una sola línea que dice `avanzar`
- **THEN** es un programa válido de una orden y ninguna regla

#### Scenario: Comentarios y líneas vacías
- **WHEN** a un programa válido se le agregan líneas vacías y líneas que empiezan con `#`
- **THEN** el programa sigue siendo válido y acciona los mismos controles ante la misma percepción

#### Scenario: Comentario al final de una línea
- **WHEN** una línea dice `avanzar # siempre para adelante`
- **THEN** la línea vale como la orden `avanzar`

#### Scenario: Programa vacío
- **WHEN** el texto está vacío o tiene solo comentarios
- **THEN** es un programa válido que no acciona ningún control

### Requirement: Órdenes
El lenguaje SHALL tener exactamente cuatro órdenes, una por control del auto:
`avanzar`, `retroceder`, `girar izquierda` y `girar derecha`; las dos últimas
se aceptan también como `izquierda` y `derecha`. Una orden escrita fuera de
una regla SHALL aplicarse en todos los instantes.

#### Scenario: Orden suelta
- **WHEN** el programa es `avanzar` y se ejecuta con cualquier percepción
- **THEN** el control avanzar queda accionado y los otros tres no

#### Scenario: Forma corta de girar
- **WHEN** una línea dice `izquierda`
- **THEN** vale lo mismo que `girar izquierda`

### Requirement: Reglas
Una regla SHALL escribirse `si <condición> entonces <acciones>`. Las acciones
pueden ir en la misma línea, separadas por coma o por `y`, o en las líneas
siguientes, una por línea y con sangría. Una línea sin sangría SHALL terminar
la regla. Las acciones de una regla SHALL aplicarse solo en los instantes en
que su condición se cumple.

#### Scenario: Regla de una línea
- **WHEN** el programa es `si sensor3 > 0,5 entonces girar izquierda` y la lectura del sensor 3 es 0,7
- **THEN** el control izquierda queda accionado

#### Scenario: Regla que no se cumple
- **WHEN** ese mismo programa se ejecuta con una lectura de 0,2 en el sensor 3
- **THEN** ningún control queda accionado

#### Scenario: Acciones en las líneas siguientes
- **WHEN** una línea dice `si sensor3 > 0,5 entonces` y las dos siguientes, con sangría, dicen `girar izquierda` y `retroceder`
- **THEN** las dos acciones pertenecen a esa regla

#### Scenario: Fin de la regla
- **WHEN** después de las acciones con sangría de una regla viene la línea `avanzar` sin sangría
- **THEN** `avanzar` es una orden suelta que se aplica siempre, no una acción de la regla

#### Scenario: Varias acciones en una línea
- **WHEN** una línea dice `si sensor3 > 0,8 entonces retroceder, girar derecha`
- **THEN** la regla tiene dos acciones

### Requirement: Condiciones
Una condición SHALL comparar dos valores con `>`, `<`, `>=` o `<=`. Varias
comparaciones SHALL poder combinarse con `y`, `o` y `no`, y agruparse con
paréntesis; sin paréntesis, `no` se resuelve primero, después `y` y por último
`o`.

#### Scenario: Comparar con un número
- **WHEN** la condición es `sensor1 <= 0,3` y la lectura del sensor 1 es 0,3
- **THEN** la condición se cumple

#### Scenario: Comparar dos sensores
- **WHEN** la condición es `sensor1 > sensor5`, con lecturas de 0,6 y 0,2
- **THEN** la condición se cumple

#### Scenario: Dos comparaciones con "y"
- **WHEN** la condición es `sensor3 > 0,5 y velocidad > 0,5`, con lectura 0,7 y velocidad 0,2
- **THEN** la condición no se cumple

#### Scenario: Orden de "y" y "o"
- **WHEN** la condición es `sensor1 > 0,5 o sensor2 > 0,5 y sensor3 > 0,5`, con lecturas 0,9, 0 y 0
- **THEN** la condición se cumple, porque `y` se resuelve antes que `o`

#### Scenario: Paréntesis
- **WHEN** la condición es `(sensor1 > 0,5 o sensor2 > 0,5) y sensor3 > 0,5`, con las mismas lecturas
- **THEN** la condición no se cumple

#### Scenario: Negación
- **WHEN** la condición es `no sensor3 > 0,5` y la lectura del sensor 3 es 0,2
- **THEN** la condición se cumple

### Requirement: Constantes
Un programa SHALL poder dar nombre a un número con una línea `<nombre> =
<número>`, sin sangría, y usar ese nombre en cualquier condición de las líneas
siguientes en lugar del número. El nombre SHALL empezar con una letra y tener
solo letras, dígitos y guiones bajos. Una constante MUST NOT cambiar de valor:
no se puede definir dos veces.

#### Scenario: Definir y usar
- **WHEN** el programa define `cerca = 0,3` y después tiene la regla `si sensor3 > cerca entonces girar izquierda`
- **THEN** la regla se cumple cuando la lectura del sensor 3 supera 0,3

#### Scenario: Una constante en varias reglas
- **WHEN** tres reglas usan `cerca` y la persona cambia su definición de 0,3 a 0,5
- **THEN** las tres reglas pasan a comparar con 0,5

#### Scenario: Comparar una constante con un dato
- **WHEN** la condición es `cerca < sensor3`
- **THEN** vale lo mismo que `sensor3 > cerca`

#### Scenario: Nombre con guion bajo y dígitos
- **WHEN** el programa define `muy_cerca2 = 0,8`
- **THEN** la definición es válida

#### Scenario: Las constantes no son reglas ni órdenes
- **WHEN** un programa tiene solo definiciones de constantes
- **THEN** es un programa válido, sin reglas, que no acciona ningún control

### Requirement: Datos disponibles
Los únicos datos de una condición SHALL ser las lecturas de los sensores, la
velocidad, números y constantes definidas en el programa. Los sensores se nombran `sensor1`, `sensor2`…, numerados
desde 1 y de izquierda a derecha, con o sin espacio antes del número; cada uno
vale entre 0 y 1. `velocidad` vale entre −1 y 1. Los números SHALL aceptarse
con coma o con punto decimal.

#### Scenario: Orden de los sensores
- **WHEN** el auto tiene 5 sensores y un vehículo queda justo delante
- **THEN** `sensor3` es el que crece, igual que la tercera barra del tablero

#### Scenario: Coma y punto
- **WHEN** una condición dice `sensor3 > 0,5` y otra `sensor3 > 0.5`
- **THEN** las dos significan lo mismo

#### Scenario: Espacio antes del número
- **WHEN** una condición dice `sensor 3 > 0,5`
- **THEN** vale lo mismo que `sensor3 > 0,5`

#### Scenario: Velocidad
- **WHEN** el auto va a la mitad de su velocidad máxima y la condición es `velocidad > 0,4`
- **THEN** la condición se cumple

### Requirement: Ejecución en cada instante
En cada instante, el programa SHALL recorrerse completo, de arriba hacia
abajo, y accionar cada control nombrado por una orden suelta o por una regla
que se cumple. El programa MUST NOT recordar nada entre instantes: la misma
percepción SHALL dar siempre los mismos controles.

#### Scenario: Dos reglas a la vez
- **WHEN** se cumplen a la vez una regla que dice `girar izquierda` y otra que dice `retroceder`
- **THEN** quedan accionados izquierda y retroceder

#### Scenario: Órdenes opuestas
- **WHEN** el programa tiene la orden suelta `avanzar` y se cumple una regla que dice `retroceder`
- **THEN** quedan accionados avanzar y retroceder, y la simulación los trata como si ninguno lo estuviera

#### Scenario: Sin memoria
- **WHEN** el programa recibe dos veces la misma percepción, con otras distintas en el medio
- **THEN** devuelve los mismos controles las dos veces

#### Scenario: Siempre termina
- **WHEN** se ejecuta cualquier programa válido
- **THEN** la ejecución de un instante recorre cada línea una sola vez y termina

### Requirement: Vocabulario en español y en inglés
Las palabras del lenguaje SHALL aceptarse en español y en inglés a la vez, sin
depender del idioma de la aplicación: `si` o `if`, `entonces` o `then`, `y` o
`and`, `o` u `or`, `no` o `not`, `avanzar` o `forward`, `retroceder` o
`reverse`, `girar izquierda` o `turn left`, `girar derecha` o `turn right`, y
`velocidad` o `speed`. MUST NOT distinguirse mayúsculas de minúsculas.

#### Scenario: Programa en inglés
- **WHEN** el programa es `if sensor3 > 0.5 then turn left`
- **THEN** hace lo mismo que `si sensor3 > 0,5 entonces girar izquierda`

#### Scenario: Idiomas mezclados
- **WHEN** el programa es `si sensor3 > 0,5 then girar izquierda`
- **THEN** es un programa válido

#### Scenario: Mayúsculas
- **WHEN** el programa es `SI Sensor3 > 0,5 ENTONCES Girar Izquierda`
- **THEN** es un programa válido

#### Scenario: Formas cortas en inglés
- **WHEN** una línea dice `left`
- **THEN** vale lo mismo que `turn left`

### Requirement: Errores explicados
Un texto que no es un programa válido MUST NOT ejecutarse. El análisis SHALL
informar cada error con su número de línea y su causa: palabra que no es del
lenguaje, con la palabra parecida si la hay; falta `entonces`; falta la
condición; falta la acción; comparación incompleta; número mal escrito;
paréntesis sin cerrar; sangría sin regla arriba; y sensor que el auto no
tiene, con cuántos tiene.

#### Scenario: Palabra desconocida con parecida
- **WHEN** la línea 2 dice `si sensor3 > 0,5 entonses girar izquierda`
- **THEN** el análisis informa en la línea 2 que no entiende "entonses" y sugiere "entonces"

#### Scenario: Palabra desconocida sin parecida
- **WHEN** una línea dice `saltar`
- **THEN** el análisis informa que "saltar" no es una palabra del lenguaje, sin sugerir ninguna

#### Scenario: Falta "entonces"
- **WHEN** una línea dice `si sensor3 > 0,5 girar izquierda`
- **THEN** el análisis informa que falta `entonces` después de la condición

#### Scenario: Regla sin acciones
- **WHEN** una línea dice `si sensor3 > 0,5 entonces` y la siguiente no tiene sangría
- **THEN** el análisis informa que la regla no tiene ninguna acción

#### Scenario: Comparación incompleta
- **WHEN** una línea dice `si sensor3 > entonces avanzar`
- **THEN** el análisis informa que a la comparación le falta un valor

#### Scenario: Sensor que no existe
- **WHEN** el auto tiene 5 sensores y una línea usa `sensor7`
- **THEN** el análisis informa que el auto tiene 5 sensores, de `sensor1` a `sensor5`

#### Scenario: Sangría sin regla
- **WHEN** la primera línea del programa dice `avanzar` con sangría
- **THEN** el análisis informa que esa línea tiene sangría y no hay una regla arriba

#### Scenario: Paréntesis sin cerrar
- **WHEN** una línea dice `si (sensor1 > 0,5 o sensor2 > 0,5 entonces avanzar`
- **THEN** el análisis informa que falta cerrar un paréntesis

#### Scenario: Varios errores
- **WHEN** un texto tiene errores en las líneas 2 y 5
- **THEN** el análisis informa los dos, cada uno con su línea, en orden

### Requirement: Errores de constantes
El análisis SHALL informar, con su número de línea, los errores propios de las
constantes: nombre repetido, nombre que ya es una palabra del lenguaje, valor
que no es un número, uso antes de la definición y definición con sangría. Un
nombre desconocido parecido al de una constante definida SHALL sugerirla.

#### Scenario: Constante repetida
- **WHEN** el programa define `cerca = 0,3` en la línea 1 y `cerca = 0,5` en la línea 4
- **THEN** el análisis informa en la línea 4 que `cerca` ya está definida en la línea 1

#### Scenario: Nombre que es una palabra del lenguaje
- **WHEN** una línea dice `velocidad = 0,5` o `sensor3 = 0,5`
- **THEN** el análisis informa que ese nombre ya es una palabra del lenguaje y no se puede usar para una constante

#### Scenario: Constante sin número
- **WHEN** una línea dice `cerca = sensor3`
- **THEN** el análisis informa que una constante es el nombre de un número

#### Scenario: Constante usada antes de definirla
- **WHEN** la línea 2 usa `cerca` y la definición está en la línea 5
- **THEN** el análisis informa en la línea 2 que `cerca` se define más abajo y tiene que ir antes de usarse

#### Scenario: Constante mal escrita
- **WHEN** el programa define `cerca` y una regla usa `serca`
- **THEN** el análisis informa que no entiende "serca" y sugiere "cerca"

#### Scenario: Definición con sangría
- **WHEN** una línea con sangría dice `cerca = 0,3`
- **THEN** el análisis informa que una constante se define sin sangría, fuera de las reglas

### Requirement: Tamaño de un programa
Un programa SHALL admitir hasta 200 líneas. Un texto más largo MUST informarse
como error y no ejecutarse.

#### Scenario: Programa de 200 líneas
- **WHEN** se analiza un programa válido de 200 líneas
- **THEN** es un programa válido

#### Scenario: Programa demasiado largo
- **WHEN** se analiza un texto de 201 líneas
- **THEN** el análisis informa que un programa admite hasta 200 líneas

### Requirement: Cantidad de reglas
El análisis de un programa válido SHALL informar cuántas reglas tiene: una por
cada `si`. Las órdenes sueltas, las constantes, los comentarios y las líneas
vacías MUST NOT contarse. SHALL informar también cuántas constantes define.

#### Scenario: Órdenes y reglas
- **WHEN** el programa tiene la orden `avanzar`, un comentario y dos reglas
- **THEN** la cantidad de reglas es 2

#### Scenario: Sin reglas
- **WHEN** el programa es `avanzar`
- **THEN** la cantidad de reglas es 0

#### Scenario: Constantes contadas aparte
- **WHEN** el programa define cuatro constantes y tiene cinco reglas
- **THEN** la cantidad de reglas es 5 y la de constantes es 4

### Requirement: Líneas que se cumplen
La ejecución de un instante SHALL informar qué líneas se cumplieron: las de
las órdenes sueltas, siempre; y, por cada regla cuya condición se cumple, la
línea de la regla y las de sus acciones. Las líneas que definen constantes
MUST NOT informarse como cumplidas.

#### Scenario: Regla que se cumple
- **WHEN** el programa tiene `avanzar` en la línea 1 y una regla en las líneas 2 y 3, y la condición se cumple
- **THEN** las líneas que se cumplen son la 1, la 2 y la 3

#### Scenario: Regla que no se cumple
- **WHEN** en ese programa la condición no se cumple
- **THEN** la única línea que se cumple es la 1

#### Scenario: Línea de una constante
- **WHEN** el programa empieza con la definición de una constante
- **THEN** esa línea nunca figura entre las que se cumplen

### Requirement: Lenguaje sin navegador
El análisis y la ejecución de un programa SHALL funcionar sin navegador, para
poder probarse y usarse fuera de una pestaña.

#### Scenario: Programa que maneja en una simulación sin navegador
- **WHEN** se ejecuta una simulación sin navegador con un auto manejado por el programa `avanzar`
- **THEN** el auto avanza en línea recta, igual que con un controlador que siempre devuelve solo avanzar
