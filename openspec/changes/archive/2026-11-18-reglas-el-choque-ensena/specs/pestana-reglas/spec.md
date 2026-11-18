# Spec Delta

## ADDED Requirements

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
La tarjeta del programa SHALL ofrecer una comparación, en el mismo tráfico y con la misma velocidad, entre el programa que maneja y los tres ejemplos: por cada uno, sus sensores, sus reglas, la distancia, los vehículos superados y si chocó, con un tope de 2 minutos de simulación. Cada fila SHALL poder probarse con un toque. Con un choque a la vista, "Compará con los ejemplos" SHALL ser la acción principal y abrir la comparación.

#### Scenario: Estado por defecto
- **WHEN** el programa inicial choca y la persona toca "Compará con los ejemplos"
- **THEN** la comparación muestra el programa inicial y los tres ejemplos con sus cifras en el tráfico de ese intento, y el foco va a la comparación

#### Scenario: Más reglas no es mejor
- **WHEN** la persona mira la comparación con los valores por defecto
- **THEN** el ejemplo de 20 sensores tiene casi el doble de reglas que el de 7 y no recorre más distancia que él

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
Con un choque a la vista, la tarjeta del caso SHALL ofrecer, como acción secundaria, "Escribir una regla para este caso": agrega al final del programa una condición con los sensores que más leían al chocar y sus valores, sin acción, y deja el cursor donde va la acción. El texto agregado SHALL deshacerse con Ctrl+Z.

#### Scenario: Agregar la condición
- **WHEN** el auto chocó con `sensor1` en 0,87 y `sensor2` en 0,81, y la persona toca "Escribir una regla para este caso"
- **THEN** al final del programa aparece `si sensor1 > 0,80 y sensor2 > 0,80 entonces `, el cursor queda al final y el foco va al editor

#### Scenario: El programa con error mientras falta la acción
- **WHEN** la condición quedó sin acción
- **THEN** el editor muestra el error de regla sin acciones y el auto sigue con el último programa válido

#### Scenario: Vuelta atrás
- **WHEN** la persona presiona Ctrl+Z
- **THEN** la condición agregada desaparece

## MODIFIED Requirements

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
La cabecera del programa SHALL ofrecer tres programas de ejemplo, cada uno escrito para un
auto distinto: tres sensores cortos, siete sensores y veinte sensores. Cargar
un ejemplo SHALL poner su programa en el editor y cambiar los sensores del
auto a los de ese ejemplo. Si el texto del editor fue escrito o cambiado por
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
