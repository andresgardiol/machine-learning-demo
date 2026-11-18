# Spec Delta

## ADDED Requirements

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

## MODIFIED Requirements

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
- **THEN** el auto no choca y no supera ningún vehículo: frena detrás del primero que encuentra

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
- **WHEN** un programa termina los 2 minutos sin chocar y sin superar ningún vehículo, como el ejemplo de 3 sensores cortos
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
