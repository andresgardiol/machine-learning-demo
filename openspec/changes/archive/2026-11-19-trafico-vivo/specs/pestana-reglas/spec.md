## MODIFIED Requirements

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
