# pestana-laboratorio Specification

## Purpose
Es la pestaña 6, "Laboratorio": un espacio libre donde una red aprende de
ejemplos corrigiendo sus errores. Deja ver backpropagation paso a paso, armar
la red y los datos, provocar el sobreajuste y reconocerlo, y enseñarle a una
red a manejar imitando un manejo.

## Requirements

### Requirement: Aprendiendo al abrir
Al abrirse por primera vez, la pestaña SHALL mostrar, sin configurar nada,
una red aprendiendo: puntos de dos colores en forma de círculo, una red de
una capa oculta, el plano pintándose con lo que la red contesta y la curva de
error bajando. Con los valores por defecto la red MUST aprender la forma, y
dos personas MUST ver lo mismo.

#### Scenario: Estado por defecto
- **WHEN** la persona abre Laboratorio por primera vez
- **THEN** ve la red en grande, el plano con 200 puntos en círculo, el aprendizaje corriendo de a épocas y la curva de error bajando

#### Scenario: Aprende sola
- **WHEN** la persona no toca nada durante 30 segundos
- **THEN** la red acierta al menos el 90 % de los puntos apartados y el plano muestra un círculo de un color rodeado del otro

#### Scenario: Siempre igual
- **WHEN** dos personas abren la pestaña sin tocar nada
- **THEN** ven los mismos puntos, la misma red inicial y las mismas curvas

### Requirement: Disposición del Laboratorio
La pestaña SHALL mostrar la red en la zona grande, con la operación en curso y
la barra de reproducción debajo; en el tablero, los datos, el ejemplo en curso
y las curvas; y en el panel, los ajustes de la red y del aprendizaje. Usa los
mismos anchos que Inspeccionar.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900, en español o en inglés, con puntos o con tu manejo
- **THEN** se ven sin desplazar ninguna zona la red con sus controles, la reproducción, los datos, el ejemplo en curso, las curvas y el panel entero

#### Scenario: Mismos anchos que Inspeccionar
- **WHEN** la persona pasa de Inspeccionar a Laboratorio
- **THEN** la red, el tablero y el panel tienen el mismo ancho en las dos

#### Scenario: Nada hacia los costados
- **WHEN** el panel está en su ancho mínimo, en 360 o en 400 píxeles
- **THEN** no se desplaza hacia los costados y ningún botón queda cortado

#### Scenario: Sin secciones plegables
- **WHEN** la persona busca cualquier ajuste del Laboratorio
- **THEN** lo encuentra a la vista en la barra, sobre la red o en el panel, sin desplegar nada

#### Scenario: Con una neurona elegida
- **WHEN** la ventana está en 1440×900, los datos son puntos, la red es la por defecto y la persona elige una neurona oculta
- **THEN** la tarjeta de la neurona se ve entera en el panel, sin desplazarlo, y todos los ajustes de la red y del aprendizaje siguen a la vista

#### Scenario: Con la tabla de datos
- **WHEN** la persona pasa a la tabla de datos
- **THEN** la reproducción y la operación en curso siguen debajo, y el tablero y el panel no cambian

### Requirement: Elegir los datos
La barra de arriba SHALL empezar por la clase de datos, puntos o tu manejo,
y mostrar solo los ajustes de la clase elegida. Cambiar la clase o cualquier
ajuste de los datos MUST generar los datos de nuevo y empezar el aprendizaje
desde cero, con la misma red.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** los datos son puntos, en círculo, 200, con poco ruido

#### Scenario: Cambiar la forma
- **WHEN** la persona elige la espiral
- **THEN** el plano muestra los puntos nuevos, la red vuelve a pesos al azar, la curva se vacía y el aprendizaje sigue corriendo

#### Scenario: Formas a la vista
- **WHEN** la persona mira la barra con puntos elegidos
- **THEN** ve las cuatro formas como opciones con su miniatura y su nombre, el ruido y la cantidad

#### Scenario: Pasar a tu manejo
- **WHEN** la persona elige tu manejo
- **THEN** la barra pasa a mostrar la pista, el tráfico y la velocidad, el tablero pasa a mostrar la escena, y la red pasa a tener una entrada por sensor más la velocidad y cuatro salidas

#### Scenario: Volver a puntos
- **WHEN** la persona vuelve a puntos
- **THEN** encuentra la forma, el ruido y la cantidad que había dejado

#### Scenario: Restablecer
- **WHEN** la persona restablece desde la barra
- **THEN** los datos vuelven a los valores por defecto de la clase elegida

### Requirement: Plano de puntos
Con puntos, el tablero SHALL mostrar el plano con cada punto en su lugar y con
su color, y el fondo pintado con lo que la red contesta en cada lugar: el
color que elegiría y, con la intensidad, cuán segura está. Con una neurona
oculta elegida, el fondo muestra lo que detecta esa neurona, y un rótulo lo
dice. El fondo SHALL actualizarse mientras la red aprende. Los puntos apartados MUST distinguirse
de los de práctica sin depender solo del color.

#### Scenario: El fondo sigue a la red
- **WHEN** la red aprende
- **THEN** el fondo cambia con ella, y al final cada punto queda sobre el fondo de su color

#### Scenario: Puntos apartados
- **WHEN** la persona mira el plano
- **THEN** los puntos apartados se ven huecos y los de práctica llenos

#### Scenario: Colores que no son solo colores
- **WHEN** la persona no distingue los dos colores
- **THEN** distingue las dos clases por la forma de sus puntos

#### Scenario: Ejemplo en curso
- **WHEN** el aprendizaje avanza de a un ejemplo o menos
- **THEN** el punto de ese ejemplo se destaca en el plano

#### Scenario: Descripción en texto
- **WHEN** un lector de pantalla llega al plano
- **THEN** anuncia la forma, cuántos puntos hay y qué parte de los apartados acierta la red

#### Scenario: Neurona elegida
- **WHEN** la persona elige una neurona oculta
- **THEN** el fondo del plano pasa a mostrar dónde se enciende esa neurona, con los puntos encima, y un rótulo sobre el plano dice de qué neurona es

#### Scenario: Volver a la red
- **WHEN** la persona suelta la neurona, o elige la de salida
- **THEN** el fondo vuelve a mostrar lo que contesta la red y el rótulo lo dice

#### Scenario: Vista previa
- **WHEN** la persona posa el cursor sobre una neurona oculta sin elegirla
- **THEN** el plano muestra el mapa de esa neurona mientras el cursor está encima

### Requirement: Reproducción del aprendizaje
Debajo de la red SHALL haber una barra de reproducción con: reproducir o
pausar, un paso, de a cuánto avanza cada paso (época, ejemplo, fase, capa o
neurona), el ritmo, y por dónde va. Una época es una pasada por todos los
ejemplos de práctica. El ritmo SHALL poder bajarse hasta un paso por segundo.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la barra muestra que está reproduciendo, de a épocas

#### Scenario: Pausar
- **WHEN** la persona pausa
- **THEN** el aprendizaje se detiene al terminar el ejemplo en curso y la red queda como estaba

#### Scenario: Por dónde va
- **WHEN** el paso a paso va por la culpa de la segunda neurona de la capa oculta
- **THEN** la barra lo dice con palabras: la época, el ejemplo, la fase, la capa y la neurona

#### Scenario: Ritmo de épocas
- **WHEN** la persona baja el ritmo reproduciendo de a épocas
- **THEN** el plano y las curvas avanzan más despacio, sin saltos

#### Scenario: Ritmo según el tamaño del paso
- **WHEN** la persona cambia de épocas a neuronas
- **THEN** el control de ritmo pasa a decir pasos por segundo, con un valor que deja ver cada paso

### Requirement: Un ejemplo, paso a paso
En pausa, "Paso" SHALL avanzar el aprendizaje una vez, del tamaño elegido.
Las fases de un ejemplo son cuatro, en orden: la ida, en que la red contesta;
el error, en que se compara con la respuesta correcta; la vuelta, en que la
culpa viaja de las salidas hacia atrás; y la corrección, en que cada peso
cambia. Cada paso SHALL verse animado en la red.

#### Scenario: La ida
- **WHEN** la persona avanza una fase al empezar un ejemplo
- **THEN** la red se enciende de las entradas a las salidas con ese ejemplo y muestra su respuesta

#### Scenario: El error
- **WHEN** avanza la fase siguiente
- **THEN** se ve la respuesta correcta junto a la de la red y cuánto se equivocó cada salida

#### Scenario: La vuelta
- **WHEN** avanza la fase siguiente
- **THEN** la culpa viaja de las salidas hacia las primeras capas y cada neurona muestra la suya

#### Scenario: La corrección
- **WHEN** avanza la fase siguiente
- **THEN** las conexiones cambian hasta sus pesos nuevos, y el ejemplo queda terminado

#### Scenario: De a una neurona
- **WHEN** la persona avanza de a una neurona durante la vuelta
- **THEN** se calcula la culpa de una sola neurona, con su animación

#### Scenario: De a un ejemplo
- **WHEN** la persona avanza de a un ejemplo
- **THEN** las cuatro fases se ven encadenadas, más breves, y la red queda corregida

#### Scenario: De a una época en pausa
- **WHEN** la persona avanza de a una época
- **THEN** la red aprende de todos los ejemplos de práctica una vez y las curvas suman un punto

#### Scenario: Paso a paso no cambia el resultado
- **WHEN** la persona hace una época entera paso a paso
- **THEN** la red queda igual que si la hubiera hecho de corrido

### Requirement: Operación en curso del aprendizaje
En pausa y al reproducir de a fases, capas o neuronas, la pestaña SHALL
mostrar, entre la red y la barra de reproducción, la operación que se acaba de
hacer, escrita con sus números. De corrido, de a épocas o ejemplos, la
operación no se muestra. Con puntos, cuando la red no muestra la cuenta de un
ejemplo, ese lugar SHALL decir que muestra el punto de prueba, con sus
coordenadas y la respuesta.

#### Scenario: Error
- **WHEN** se avanza la fase del error con una salida
- **THEN** se lee la respuesta de la red, la correcta y la resta

#### Scenario: Culpa de una neurona
- **WHEN** se avanza la culpa de una neurona oculta
- **THEN** se lee la culpa que le llega por cada conexión, la suma, la pendiente de su activación y el resultado

#### Scenario: Corrección de un peso
- **WHEN** se avanza la corrección de una neurona
- **THEN** se lee, para sus pesos más corregidos, el peso anterior, la tasa por la culpa por la entrada, y el peso nuevo

#### Scenario: Muchos pesos
- **WHEN** una neurona tiene muchas conexiones
- **THEN** se leen las correcciones más grandes y cuántas más hay, sin pasar de dos renglones

#### Scenario: Números redondeados
- **WHEN** la persona mira la operación en curso
- **THEN** los números son los de verdad, redondeados recién al mostrarlos, y un renglón lo dice

#### Scenario: Sin ejemplo en curso
- **WHEN** los datos son puntos y la red no muestra la cuenta de un ejemplo, en pausa o aprendiendo de a épocas
- **THEN** se lee que la red muestra el punto de prueba, sus dos coordenadas, qué color contesta y con cuánta seguridad

#### Scenario: De quién es la cuenta
- **WHEN** la persona mira los números de las neuronas en cualquier momento
- **THEN** un texto junto a la red dice si son los del punto de prueba o los de un ejemplo, y cuál

### Requirement: Ejemplo en curso
El tablero SHALL mostrar el ejemplo con el que la red está aprendiendo cuando
el paso es de un ejemplo o menos: sus entradas, la respuesta correcta y la de
la red. Con tu manejo, las entradas se ven como el auto con sus rayos y las
respuestas como las cuatro acciones, las del ejemplo junto a las de la red.

#### Scenario: Ejemplo de puntos
- **WHEN** el paso a paso está en un ejemplo de puntos
- **THEN** se leen sus dos coordenadas, su color y qué color contesta la red y con cuánta seguridad

#### Scenario: Ejemplo de manejo
- **WHEN** el paso a paso está en un ejemplo de manejo
- **THEN** se ve qué detectaba cada rayo, qué acciones estaban accionadas y cuáles acciona la red, con las que no coinciden marcadas sin depender solo del color

#### Scenario: De corrido
- **WHEN** el aprendizaje corre de a épocas
- **THEN** el ejemplo en curso no se muestra y los datos y las curvas ocupan ese lugar

### Requirement: Curvas de aprendizaje
El tablero SHALL mostrar, en un gráfico que crece época a época, el error
medio en los ejemplos de práctica y en los apartados, como dos curvas que se
distinguen sin depender solo del color, y al lado la época y el porcentaje de
aciertos en cada grupo.

#### Scenario: Curvas que crecen
- **WHEN** pasan veinte épocas
- **THEN** cada curva tiene veinte puntos y las dos se leen con su nombre

#### Scenario: Aciertos
- **WHEN** la red acierta 136 de 140 ejemplos de práctica y 55 de 60 apartados
- **THEN** se lee 97 % en práctica y 92 % en apartados

#### Scenario: Valor de una época
- **WHEN** la persona posa el cursor o pone el foco sobre el gráfico
- **THEN** lee la época y el error de las dos curvas en ese punto

#### Scenario: Empezar de nuevo
- **WHEN** la red vuelve a pesos al azar
- **THEN** el gráfico se vacía

#### Scenario: Descripción en texto
- **WHEN** un lector de pantalla llega al gráfico
- **THEN** anuncia la época, el error de cada grupo y si el de los apartados está subiendo

### Requirement: Ejemplos apartados y sobreajuste
El panel SHALL permitir elegir qué parte de los datos se aparta, entre el
10 % y el 50 %, con 30 % por defecto. Cuando el error de los apartados sube
de forma sostenida mientras el de práctica sigue bajando, la pestaña SHALL
decir con palabras que la red está memorizando y marcar en el gráfico la
época en que mejor le iba con lo que nunca vio.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña y la red aprende el círculo
- **THEN** las dos curvas bajan juntas y no aparece ningún aviso

#### Scenario: Red que memoriza
- **WHEN** la persona pone pocos puntos, mucho ruido y una red grande, y deja correr
- **THEN** la curva de práctica sigue bajando, la de los apartados empieza a subir, aparece el aviso de que la red está memorizando y el gráfico marca la mejor época

#### Scenario: El aviso sigue mientras sea cierto
- **WHEN** el aviso apareció y el error de los apartados sigue por encima de su mínimo
- **THEN** el aviso sigue a la vista, aunque ese error baje un poco

#### Scenario: La red vuelve a mejorar
- **WHEN** después del aviso el error de los apartados marca un mínimo nuevo
- **THEN** el aviso desaparece y la marca de la mejor época pasa a esa época

#### Scenario: Aviso anunciado
- **WHEN** aparece el aviso
- **THEN** un lector de pantalla lo anuncia una vez por cada aparición

#### Scenario: Cambiar la parte apartada
- **WHEN** la persona cambia la parte apartada
- **THEN** los datos se separan de nuevo y el aprendizaje empieza desde cero

### Requirement: Armar la red
El panel SHALL permitir elegir la cantidad de capas ocultas (de 0 a 3), las
neuronas de cada una (de 1 a 8) y la activación (tanh, sigmoide o ReLU), todo
a la vista. Cambiar cualquiera MUST armar una red nueva con pesos al azar y
empezar el aprendizaje desde cero, en el momento, y la red nueva se ve en la
zona grande.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la red tiene una capa oculta de 4 neuronas con tanh

#### Scenario: Agregar una capa
- **WHEN** la persona pasa de una a dos capas ocultas
- **THEN** la red de la zona grande muestra la capa nueva en el momento y el aprendizaje vuelve a empezar

#### Scenario: Sin capas ocultas
- **WHEN** la persona elige cero capas ocultas con los puntos en círculo
- **THEN** la red aprende lo que puede, el fondo del plano queda partido por una recta y los aciertos no pasan de lo que una recta logra

#### Scenario: Neuronas de una capa
- **WHEN** hay dos capas ocultas
- **THEN** cada una tiene su propio ajuste de neuronas

#### Scenario: Por qué no hay escalón
- **WHEN** la persona posa el cursor sobre la activación
- **THEN** un tooltip explica qué es y que acá no está el escalón porque no tiene pendiente y el error no puede viajar hacia atrás

#### Scenario: Volver a la red de siempre
- **WHEN** la persona elige "Red de siempre" en el panel
- **THEN** vuelve a una capa de 4 con tanh y la tasa por defecto

#### Scenario: Dos botones con nombres distintos
- **WHEN** la persona lee los botones del panel y los de arriba de la red
- **THEN** "Red de siempre" vuelve a la forma por defecto y "Restablecer la red" quita los cambios a mano, y ningún otro botón lleva esos nombres

### Requirement: Tasa de aprendizaje
El panel SHALL permitir cambiar la tasa de aprendizaje, cuánto se corrige cada
peso en cada ejemplo, mientras la red aprende. El cambio MUST aplicarse desde
el ejemplo siguiente, sin empezar de nuevo.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la tasa tiene el valor con que la red aprende el círculo sin tocar nada

#### Scenario: Tasa muy chica
- **WHEN** la persona baja la tasa al mínimo
- **THEN** la curva de error baja muy despacio

#### Scenario: Tasa muy grande
- **WHEN** la persona sube la tasa al máximo
- **THEN** la curva de error salta en vez de bajar, y el fondo del plano cambia de golpe entre épocas

#### Scenario: Cambio en marcha
- **WHEN** la persona cambia la tasa mientras la red aprende
- **THEN** las curvas siguen desde donde estaban, con el ritmo nuevo de aprendizaje

### Requirement: Empezar de nuevo
El panel SHALL ofrecer "Reiniciar pesos", que vuelve la red a pesos al azar
con los mismos datos y la misma forma, y vacía las curvas. Cada reinicio usa
otros pesos, y la serie MUST ser la misma para todas las personas.

#### Scenario: Reiniciar
- **WHEN** la persona reinicia los pesos a mitad de un aprendizaje
- **THEN** la red vuelve a no saber nada, las curvas se vacían, el aviso de sobreajuste desaparece y el aprendizaje sigue corriendo

#### Scenario: Otros pesos
- **WHEN** la persona reinicia dos veces
- **THEN** cada vez la red arranca de pesos distintos

#### Scenario: Serie repetible
- **WHEN** dos personas reinician tres veces desde el estado por defecto
- **THEN** las dos ven las mismas tres redes iniciales

### Requirement: Aprender a manejar imitando
Con tu manejo, la red SHALL aprender de ejemplos de manejo, que por defecto
son los de un maestro: el cerebro de ejemplo de la calle con tráfico nuevo,
manejando un minuto en la pista y el tráfico de la barra. El maestro SHALL
poder cambiarse por otro cerebro. Mientras aprende, la escena SHALL mostrar a
la red manejando con lo que sabe en ese momento.

#### Scenario: Estado por defecto de tu manejo
- **WHEN** la persona elige tu manejo por primera vez
- **THEN** los ejemplos ya están, tomados del maestro por defecto, y la red empieza a aprender sin grabar nada

#### Scenario: Se la ve aprender a manejar
- **WHEN** la red aprende
- **THEN** en la escena el auto maneja con la red de ese momento, vuelve a empezar solo cuando choca, y maneja mejor a medida que baja el error

#### Scenario: Cambiar de maestro
- **WHEN** la persona elige otro cerebro como maestro
- **THEN** se toman los ejemplos de ese cerebro, con sus sensores, y el aprendizaje empieza desde cero

#### Scenario: Cambiar la pista
- **WHEN** la persona elige otra pista en la barra
- **THEN** se toman los ejemplos de nuevo en esa pista y la escena pasa a esa pista

#### Scenario: Resumen de los ejemplos
- **WHEN** la persona mira el tablero
- **THEN** lee cuántos ejemplos hay, de quién son y en qué parte se acciona cada control

### Requirement: Grabar tu propio manejo
Con tu manejo, la persona SHALL poder grabar ejemplos manejando ella con las
flechas, en vez de usar un maestro. Mientras graba, el aprendizaje MUST estar
en pausa y un aviso visible MUST decir que se está grabando. Los ejemplos se
acumulan entre grabaciones y se pueden borrar.

#### Scenario: Empezar a grabar
- **WHEN** la persona elige grabar
- **THEN** la escena pasa a mostrar su auto esperando, con un aviso de que se graba lo que haga y cómo terminar, y el aprendizaje queda en pausa

#### Scenario: Grabar manejando
- **WHEN** la persona maneja 30 segundos
- **THEN** el contador de ejemplos sube mientras maneja y llega a unos 1800

#### Scenario: Chocar grabando
- **WHEN** la persona choca mientras graba
- **THEN** el intento vuelve a empezar y la grabación sigue, sin ejemplos del auto chocado

#### Scenario: Terminar de grabar
- **WHEN** la persona termina de grabar
- **THEN** la red empieza a aprender de sus ejemplos desde cero y la escena vuelve a mostrar a la red manejando

#### Scenario: Pocos ejemplos
- **WHEN** la persona termina con menos de 10 segundos grabados
- **THEN** un aviso dice que son pocos para aprender y propone seguir grabando, sin impedir que la red aprenda

#### Scenario: Borrar lo grabado
- **WHEN** la persona borra sus ejemplos
- **THEN** los ejemplos vuelven a ser los del maestro y el aprendizaje empieza desde cero

#### Scenario: Volver al maestro
- **WHEN** la persona vuelve a elegir el maestro
- **THEN** sus ejemplos grabados se conservan para cuando vuelva a elegirlos

### Requirement: Guardar lo aprendido como cerebro
Con tu manejo, el panel SHALL ofrecer guardar la red como un cerebro en la
biblioteca, con un nombre propuesto que se puede cambiar después. El cerebro
MUST quedar disponible en Entrenar, Competir e Inspeccionar, y decir que
aprendió imitando. Guardar MUST NOT detener el aprendizaje.

#### Scenario: Guardar
- **WHEN** la persona guarda la red después de aprender
- **THEN** un mensaje dice con qué nombre quedó, y el cerebro aparece en la biblioteca

#### Scenario: Llevarlo a competir
- **WHEN** la persona abre Competir y agrega competidores
- **THEN** el cerebro guardado está entre sus cerebros

#### Scenario: Guardar dos veces
- **WHEN** la persona guarda, deja aprender más y vuelve a guardar
- **THEN** quedan dos cerebros, cada uno con lo que la red sabía en ese momento

#### Scenario: Sin aprender todavía
- **WHEN** la red no completó ninguna época
- **THEN** guardar está sin acción y explica que todavía no aprendió nada

#### Scenario: Con puntos no hay cerebro
- **WHEN** los datos son puntos
- **THEN** guardar como cerebro no se muestra

#### Scenario: Guardar con partes apagadas
- **WHEN** la persona guarda la red con una neurona o una conexión apagada
- **THEN** el cerebro guardado decide igual que la red del Laboratorio en cada ejemplo, porque lo apagado se guarda como pesos en cero

#### Scenario: No se pudo guardar
- **WHEN** el almacenamiento del navegador falla
- **THEN** un mensaje lo explica con palabras y el aprendizaje sigue

### Requirement: Tabla de datos
La zona de la red SHALL ofrecer una tercera vista, la tabla de datos, con el
rótulo "Datos", junto a "Diagrama" y "Pesos" (la tabla de pesos); sus tooltips
nombran "tabla de datos" y "tabla de pesos": una fila por ejemplo con sus entradas, la
respuesta correcta, lo que la red contesta ahora, si acierta y si es de
práctica o apartado, y arriba cuántos acierta. La tabla MUST reflejar la red
del momento. No es la vista por defecto.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la zona grande muestra el diagrama, y "Datos" está a un clic junto a "Diagrama" y "Pesos"

#### Scenario: Tabla con puntos
- **WHEN** los datos son puntos y la persona abre la tabla de datos
- **THEN** cada fila muestra el número del ejemplo, x, y, el color correcto, el color que dice la red con su número, si acierta y si es de práctica o apartado

#### Scenario: Tabla con tu manejo
- **WHEN** los datos son de manejo
- **THEN** cada fila muestra una columna por sensor y la velocidad, los controles del maestro y los de la red con flechas, y acierta solo si coinciden los cuatro

#### Scenario: Resumen
- **WHEN** la tabla está a la vista
- **THEN** arriba se lee cuántos ejemplos acierta la red del total, y cuántos de práctica y de apartados, con los mismos números que la línea de aciertos de las curvas

#### Scenario: Se actualiza mientras aprende
- **WHEN** el aprendizaje corre con la tabla a la vista
- **THEN** las filas y el resumen cambian solos, al menos dos veces por segundo

#### Scenario: En pausa
- **WHEN** en pausa la persona avanza un paso que corrige pesos, o cambia la red a mano
- **THEN** la tabla refleja la red nueva en el momento

#### Scenario: Solo los que falla
- **WHEN** la persona elige ver solo los que falla
- **THEN** quedan las filas que la red no acierta ahora, y una fila sale de la lista cuando la red aprende a acertarla

#### Scenario: Por grupo
- **WHEN** la persona elige ver solo los apartados
- **THEN** quedan las filas de los ejemplos de los que la red no aprende

#### Scenario: Nada que mostrar
- **WHEN** el filtro no deja ninguna fila
- **THEN** en lugar de filas un texto dice por qué, por ejemplo que la red acierta todos los ejemplos

#### Scenario: Ejemplo en curso
- **WHEN** el aprendizaje avanza de a un ejemplo o menos
- **THEN** la fila del ejemplo en curso está marcada, no solo con color, y la tabla la deja a la vista si el filtro la incluye

#### Scenario: Elegir una fila
- **WHEN** los datos son puntos y la persona elige una fila
- **THEN** ese punto queda marcado en el plano, y elegirla de nuevo le quita la marca

#### Scenario: Muchos ejemplos
- **WHEN** hay 3600 ejemplos de manejo
- **THEN** la tabla se desplaza por dentro con los encabezados fijos, y ninguna otra zona se desplaza

#### Scenario: Muchas entradas
- **WHEN** las columnas no entran en el ancho de la zona
- **THEN** las columnas de entradas se desplazan hacia los costados dentro de la tabla, y el número del ejemplo y el resultado quedan fijos

#### Scenario: Lo que no sirve no se muestra
- **WHEN** la vista es la tabla de datos
- **THEN** no se muestran el filtro de conexiones, los controles para acercar ni "Resumir todas", y vuelven al pasar al diagrama

#### Scenario: Sin depender del color
- **WHEN** la persona mira si una fila acierta o falla
- **THEN** lo distingue por un signo, y un lector de pantalla lo lee con palabras

#### Scenario: Con el teclado
- **WHEN** la persona llega a la tabla con Tab y usa las flechas
- **THEN** recorre las filas, puede elegir una, y un lector de pantalla lee cada valor con su encabezado

#### Scenario: Volver al diagrama
- **WHEN** la persona vuelve al diagrama
- **THEN** lo encuentra como lo dejó, con el mismo acercamiento y las mismas capas resumidas

#### Scenario: Cambiar los datos
- **WHEN** la persona cambia la forma de los puntos con la tabla a la vista
- **THEN** la tabla muestra los datos nuevos, conserva el filtro y ninguna fila queda elegida

### Requirement: Cambiar la red a mano
Al elegir una neurona, el panel SHALL mostrar su tarjeta: el peso de cada
conexión de entrada y el sesgo, para cambiar con un deslizador o escribiendo,
y apagar o encender la neurona y cada conexión. El cambio MUST aplicarse a la
red que aprende y verse en el momento, y el aprendizaje sigue desde ahí. Sin
neurona elegida, la tarjeta no se muestra.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** no hay ninguna neurona elegida y el panel muestra solo los ajustes de siempre

#### Scenario: Elegir una neurona
- **WHEN** la persona hace clic en una neurona oculta
- **THEN** al final del panel aparece su tarjeta, con su nombre y su capa, una fila por conexión de entrada con el peso de ahora, y su sesgo, y el texto de guía y las misiones dejan de mostrarse mientras la tarjeta está abierta

#### Scenario: Cambiar un peso en pausa
- **WHEN** en pausa la persona mueve el deslizador de un peso
- **THEN** mientras lo mueve cambian el fondo del plano, los valores de la red, la tabla de datos y la línea de aciertos, y las curvas no suman ningún punto

#### Scenario: Cambiar un peso mientras aprende
- **WHEN** la persona cambia un peso con el aprendizaje corriendo
- **THEN** la red sigue aprendiendo desde ese valor, y la tarjeta muestra cómo el aprendizaje lo sigue moviendo

#### Scenario: El aprendizaje lo corrige
- **WHEN** la persona lleva un peso de una red ya aprendida a un extremo y deja correr
- **THEN** el error sube en la curva y, con las épocas, vuelve a bajar

#### Scenario: Rango de un peso
- **WHEN** la persona lleva el deslizador a un extremo
- **THEN** el peso queda en −3 o en 3, salvo que su valor estuviera más lejos, y en ese caso el rango llega hasta ahí

#### Scenario: Escribir un valor
- **WHEN** la persona escribe un número en el campo de un peso
- **THEN** el peso toma ese valor; si lo escrito no es un número, el peso queda como estaba y un texto lo dice

#### Scenario: Con el teclado
- **WHEN** la persona pone el foco en el deslizador de un peso y usa las flechas
- **THEN** el peso cambia de a 0,01 y el efecto se ve igual

#### Scenario: Apagar una neurona oculta
- **WHEN** la persona apaga una neurona oculta
- **THEN** se ve apagada como en Inspeccionar, vale cero, el plano cambia en el momento y el aprendizaje sigue sin corregirla

#### Scenario: Apagar una entrada
- **WHEN** los datos son puntos y la persona apaga la entrada x
- **THEN** el fondo del plano pasa a depender solo de y: se ve en franjas horizontales

#### Scenario: Apagar una conexión
- **WHEN** la persona apaga una conexión desde su fila de la tarjeta
- **THEN** la fila y la conexión se ven apagadas y el aprendizaje deja de corregir ese peso

#### Scenario: Volver a encender
- **WHEN** la persona vuelve a encender lo que apagó
- **THEN** vuelve con los pesos que tenía al apagarlo y el aprendizaje los corrige otra vez

#### Scenario: Neurona de salida
- **WHEN** la persona elige una neurona de salida
- **THEN** puede cambiar sus pesos y su sesgo, y apagarla no se ofrece

#### Scenario: Neurona de entrada
- **WHEN** la persona elige una neurona de entrada
- **THEN** la tarjeta ofrece apagarla o encenderla y dice que una entrada no tiene pesos propios

#### Scenario: A mitad de un ejemplo
- **WHEN** la persona cambia un peso con un ejemplo a medio recorrer paso a paso
- **THEN** ese ejemplo vuelve a empezar desde la ida y la operación en curso lo dice

#### Scenario: Muchas entradas
- **WHEN** la neurona elegida tiene más conexiones de las que entran en lo que queda del panel
- **THEN** la lista de pesos se desplaza dentro de la tarjeta y el panel no se desplaza

#### Scenario: Dejar de elegir
- **WHEN** la persona cierra la tarjeta o hace clic otra vez en la neurona elegida
- **THEN** ninguna neurona queda elegida, la tarjeta desaparece y el panel queda como al abrir, con el texto de guía y las misiones de vuelta y el progreso que tenían

#### Scenario: La neurona deja de existir
- **WHEN** la persona arma una red sin la neurona que estaba elegida
- **THEN** la tarjeta se cierra

### Requirement: Deshacer y restablecer los cambios a mano
Sobre la red SHALL haber, siempre a la vista y en el lugar que tienen en
Inspeccionar, cuántos cambios a mano hay, "Deshacer" y "Restablecer la red".
Deshacer MUST devolver la red a los pesos y a lo apagado que tenía justo antes
del último cambio a mano; restablecer, a los de antes del primero. La época y
las curvas no vuelven atrás. Sin cambios, los dos se ven sin acción y lo
explican.

#### Scenario: Sin cambios
- **WHEN** la persona no cambió nada a mano
- **THEN** se lee "Sin cambios", y "Deshacer" y "Restablecer la red" están a la vista, sin acción, con un tooltip que dice que no hay cambios a mano

#### Scenario: Contar los cambios
- **WHEN** la persona apaga una neurona y cambia dos pesos
- **THEN** sobre la red se lee que hay 3 cambios a mano y los dos botones quedan habilitados

#### Scenario: Un arrastre es un cambio
- **WHEN** la persona arrastra el deslizador de un peso de una punta a la otra y lo suelta
- **THEN** cuenta como un solo cambio

#### Scenario: Deshacer en pausa
- **WHEN** en pausa la persona cambia un peso y deshace
- **THEN** el peso vuelve al valor exacto que tenía, y el plano y la tabla vuelven a verse como antes

#### Scenario: Deshacer después de aprender
- **WHEN** la persona cambia un peso, deja aprender veinte épocas y deshace
- **THEN** la red vuelve a los pesos de justo antes del cambio, se pierde lo aprendido desde entonces, y la época y las curvas siguen desde donde estaban

#### Scenario: Deshacer lo avisa
- **WHEN** la persona posa el cursor sobre "Deshacer" con cambios hechos
- **THEN** el tooltip dice que la red vuelve a como estaba antes del último cambio a mano y que lo aprendido después se pierde

#### Scenario: Deshacer varias veces
- **WHEN** la persona hizo cuatro cambios y deshace cuatro veces
- **THEN** la red queda como estaba antes del primero y se lee "Sin cambios"

#### Scenario: Restablecer
- **WHEN** la persona restablece la red
- **THEN** los pesos y lo apagado vuelven a los de antes del primer cambio a mano, sin pedir confirmación, y se lee "Sin cambios"

#### Scenario: Empezar de nuevo vacía los cambios
- **WHEN** la persona reinicia los pesos, arma otra red o cambia los datos
- **THEN** todo vuelve a estar encendido y se lee "Sin cambios"

#### Scenario: Muchos cambios
- **WHEN** la persona hace más de 50 cambios a mano
- **THEN** se pueden deshacer los últimos 50, y restablecer sigue volviendo a antes del primero

### Requirement: Guía y misiones del Laboratorio
Con la guía activa, el panel SHALL empezar con un texto breve que diga qué se
está viendo, y terminar con tres misiones en tres renglones: seguir una
corrección entera paso a paso, hacer que la red memorice, y guardar un cerebro
que aprendió a manejar imitando. Las misiones MUST NOT bloquear nada.

#### Scenario: Guía visible
- **WHEN** la guía está activa
- **THEN** el texto dice que la red aprende de ejemplos, que el fondo es lo que contesta y qué probar primero

#### Scenario: Guía oculta
- **WHEN** la persona apaga la guía
- **THEN** el texto y las misiones no se muestran

#### Scenario: Misión de la corrección
- **WHEN** la persona avanza paso a paso las cuatro fases de un mismo ejemplo
- **THEN** la primera misión queda cumplida

#### Scenario: Misión de memorizar
- **WHEN** aparece el aviso de que la red está memorizando
- **THEN** la segunda misión queda cumplida

#### Scenario: Misión de manejar
- **WHEN** la persona guarda un cerebro desde el Laboratorio
- **THEN** la tercera misión queda cumplida

#### Scenario: Misión cumplida con la tarjeta abierta
- **WHEN** una misión se cumple mientras la tarjeta de una neurona está abierta
- **THEN** al cerrar la tarjeta la misión se ve cumplida

#### Scenario: Términos con su nombre
- **WHEN** la persona posa el cursor sobre "época", "tasa de aprendizaje", "culpa" o "sobreajuste"
- **THEN** un tooltip dice qué es con palabras llanas y con su nombre técnico

### Requirement: Estado conservado en el Laboratorio
Al salir de la pestaña y volver, la pestaña SHALL conservar los datos, la red
con lo aprendido y sus cambios a mano, las curvas, los ajustes, el ritmo, la
vista elegida con sus filtros y los ejemplos grabados, hasta cerrar la
aplicación. El aprendizaje MUST quedar en pausa mientras la
pestaña no está a la vista.

#### Scenario: Volver a la pestaña
- **WHEN** la persona deja una red a medio aprender, abre Competir y vuelve
- **THEN** encuentra la misma red, las mismas curvas y los mismos ajustes

#### Scenario: Pausa al salir
- **WHEN** la persona abre otra pestaña con el aprendizaje en marcha
- **THEN** el aprendizaje no avanza hasta que vuelve

#### Scenario: Cambios a mano conservados
- **WHEN** la persona apaga una neurona, pasa a la tabla de datos filtrada por los que falla, abre Competir y vuelve
- **THEN** encuentra la neurona apagada, el contador de cambios, la tabla de datos y su filtro como los dejó

### Requirement: Atajos del Laboratorio
La pestaña SHALL usar los atajos de las demás con el mismo significado:
espacio para reproducir o pausar, N para un paso, R para reiniciar, acá los
pesos, y V para restablecer la vista de la red. MUST respetar el interruptor
de atajos y no actuar mientras se escribe en un campo.

#### Scenario: Paso con N
- **WHEN** la persona presiona N en pausa
- **THEN** el aprendizaje avanza un paso del tamaño elegido

#### Scenario: Grabando
- **WHEN** la persona está grabando su manejo
- **THEN** las flechas manejan el auto y espacio no reproduce el aprendizaje

#### Scenario: Atajos apagados
- **WHEN** los atajos de una tecla están apagados
- **THEN** espacio, N, R y V no hacen nada y todo sigue pudiéndose hacer con los botones

### Requirement: Controles del Laboratorio explicados y accesibles
Cada control SHALL tener un tooltip que diga qué hace y por qué importa, y
todos los textos SHALL estar en español y en inglés. Todo MUST poder hacerse
con el teclado. Los avisos que cambian solos MUST anunciarse una vez.

#### Scenario: Tooltip de la tasa
- **WHEN** la persona posa el cursor sobre la tasa de aprendizaje
- **THEN** un tooltip explica que es cuánto se corrige cada peso por ejemplo, y que muy chica aprende lento y muy grande se pasa de largo

#### Scenario: Tooltip de los apartados
- **WHEN** la persona posa el cursor sobre la parte apartada
- **THEN** un tooltip explica que la red no aprende de esos ejemplos y que sirven para saber si generaliza o memoriza

#### Scenario: Pestaña en inglés
- **WHEN** la aplicación está en inglés
- **THEN** la guía, la barra, la reproducción, la operación en curso, los avisos y las misiones se muestran en inglés

#### Scenario: Tooltips de la tabla y de la tarjeta
- **WHEN** la persona posa el cursor sobre "Datos", sobre los filtros de la tabla de datos o sobre un control de la tarjeta de la neurona
- **THEN** un tooltip dice qué hace y por qué importa, en español o en inglés

#### Scenario: Auditoría de tooltips
- **WHEN** se corre la auditoría de tooltips con puntos y con tu manejo, en pausa, reproduciendo y grabando
- **THEN** no informa ningún control sin ayuda

#### Scenario: Objetivos
- **WHEN** se miden los botones de la pestaña
- **THEN** todos miden al menos 24 píxeles de lado

### Requirement: Qué detecta cada neurona
Con puntos, cada neurona oculta SHALL llevar adentro un mapa chico de dónde se
enciende en el plano, con los colores del plano, actualizado mientras la red
aprende. Con tu manejo no hay plano: el tablero SHALL mostrar, debajo de la
escena, la curva de respuesta de la neurona elegida a la entrada que se
elija, con las demás como en el ejemplo en curso.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña con puntos
- **THEN** cada una de las 4 neuronas ocultas muestra su mapa, y los mapas cambian mientras la red aprende

#### Scenario: Se ve cómo se combinan
- **WHEN** la red aprendió el círculo
- **THEN** cada neurona oculta muestra un corte recto del plano y el plano de la red, la zona cerrada que forman entre todos

#### Scenario: Dos capas ocultas
- **WHEN** la red tiene dos capas ocultas
- **THEN** los mapas de la segunda capa muestran formas armadas con los de la primera

#### Scenario: Capa resumida
- **WHEN** la persona resume una capa oculta
- **THEN** sus cuadritos no llevan mapa

#### Scenario: Con tu manejo
- **WHEN** los datos son de manejo y la persona elige una neurona oculta
- **THEN** el tablero muestra, debajo de la escena, la curva de cómo responde a una entrada, con el nombre de la neurona, botones para elegir cuál entrada, un punto en el valor del ejemplo en curso y una frase que la lee

#### Scenario: La tarjeta solo lleva la cuenta
- **WHEN** los datos son de manejo y la persona elige una neurona
- **THEN** la tarjeta del panel muestra sus filas y su sesgo, sin botones para cambiar de vista

#### Scenario: Sin neurona elegida
- **WHEN** los datos son de manejo y no hay una neurona oculta o de salida elegida
- **THEN** el tablero no muestra la curva, y con la guía activa un renglón dice que al elegir una neurona se ve ahí su respuesta

#### Scenario: Curva en poco lugar
- **WHEN** entre la escena y las curvas de error no entra la curva completa
- **THEN** se muestra en su forma chica, con el gráfico más bajo y solo la primera frase, entera y sin tapar las curvas de error

#### Scenario: La curva cambia al aprender
- **WHEN** la red aprende con una neurona elegida
- **THEN** la curva se va moviendo con los pesos

#### Scenario: Con puntos no hay curva
- **WHEN** los datos son puntos y la persona elige una neurona
- **THEN** la tarjeta no muestra la curva: el mapa del plano ya dice qué detecta

#### Scenario: Sin depender del color
- **WHEN** un lector de pantalla llega a una neurona con mapa
- **THEN** anuncia su valor y en qué parte del plano se enciende más

#### Scenario: Vuelta atrás
- **WHEN** la persona reinicia los pesos
- **THEN** los mapas vuelven a mostrar una red que no sabe nada

### Requirement: Panel del Laboratorio con algo elegido
Con una neurona o una conexión elegida, el panel SHALL seguir mostrando todos
los ajustes de la red y del aprendizaje, sin plegar ninguno, y su detalle
debajo. Para darle lugar, cada ajuste con deslizador MUST ocupar un renglón:
nombre, deslizador y valor. Nada MUST encimarse ni salir de su caja.

#### Scenario: Ajustes en un renglón
- **WHEN** la persona mira "Neuronas de la capa", "Tasa de aprendizaje" o "Apartados", con puntos o con tu manejo
- **THEN** cada uno ocupa un renglón, con un deslizador de al menos 120 píxeles de ancho

#### Scenario: Con tu manejo a 1440×900
- **WHEN** los datos son de manejo, la ventana está en 1440×900 y la persona elige una neurona de 6 entradas, en español o en inglés
- **THEN** se ven todos los ajustes, las seis filas de la tarjeta y su sesgo sin desplazar nada, y la curva completa en el tablero

#### Scenario: Con tu manejo a 1366×768
- **WHEN** los datos son de manejo, la ventana está en 1366×768 y la persona elige una neurona de 6 entradas
- **THEN** se ven todos los ajustes y al menos cinco de las seis filas, la que falta se desplaza dentro de la tarjeta, el panel no se desplaza y la curva entra en el tablero

#### Scenario: Con una conexión elegida
- **WHEN** la persona elige una conexión, con puntos o con tu manejo
- **THEN** el detalle de la conexión se ve entero en el panel, con todos los ajustes a la vista

### Requirement: Filtro de conexiones en el Laboratorio
El filtro de conexiones del Laboratorio SHALL valer en el diagrama igual que
en la tabla de pesos: con 5, 3 o 1, cada neurona muestra con su aspecto solo
sus conexiones de entrada de mayor peso y las demás quedan atenuadas. MUST
seguir a los pesos mientras la red aprende.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** el filtro está en todas y ninguna conexión está atenuada por el filtro

#### Scenario: La más importante
- **WHEN** la red es de 2, 4 y 1 y la persona elige 1
- **THEN** en el diagrama cada neurona oculta conserva una sola conexión de entrada con su aspecto y la salida una sola, y las otras se ven atenuadas

#### Scenario: Sin efecto, se nota
- **WHEN** la persona elige 5 y ninguna neurona tiene más de 5 entradas
- **THEN** el diagrama no cambia, que es lo esperado, y el tooltip del filtro dice que deja las de mayor peso de cada neurona

#### Scenario: Sigue al aprendizaje
- **WHEN** el filtro está en 1 y la red aprende hasta que otra conexión de una neurona pasa a ser la de mayor peso
- **THEN** el diagrama pasa a mostrar esa

#### Scenario: Con algo elegido
- **WHEN** hay una neurona elegida y el filtro está en 3
- **THEN** el camino hacia atrás se limita a las 3 que más aportan, igual que en Inspeccionar

### Requirement: Detalle de una conexión en el Laboratorio
Al elegir una conexión, el panel SHALL mostrar su detalle en el lugar de la
tarjeta: de dónde a dónde va, su peso para cambiarlo, apagarla o encenderla,
y la historia de su peso. El cambio va a la red que aprende, como los de la
tarjeta, y cuenta como un cambio a mano. SHALL tener tooltips y textos en
español y en inglés.

#### Scenario: Elegir una conexión
- **WHEN** la persona hace clic en una línea de la red
- **THEN** el panel muestra el detalle de esa conexión, y la guía y las misiones dejan de mostrarse como con la tarjeta

#### Scenario: Cambiar el peso en el lugar
- **WHEN** la persona arrastra la pastilla de la conexión elegida
- **THEN** el peso cambia en la red que aprende, el plano se repinta mientras la mueve y el contador de cambios a mano sube en uno al soltar

#### Scenario: Deshacer
- **WHEN** la persona deshace
- **THEN** la red vuelve a los pesos de justo antes de ese cambio

#### Scenario: Soltar
- **WHEN** la persona suelta la conexión
- **THEN** el detalle desaparece y el panel queda como al abrir

### Requirement: Historia de un peso
El detalle de una conexión SHALL mostrar una línea con el valor de su peso a
lo largo de las épocas, con el valor de ahora en números y una marca donde
hubo un cambio a mano. La línea SHALL crecer mientras la red aprende.

#### Scenario: Peso que se acomoda
- **WHEN** la red aprendió 100 épocas y la persona elige una conexión
- **THEN** ve cómo ese peso se movió desde su valor al azar hasta el de ahora

#### Scenario: Cambio a mano en la historia
- **WHEN** la persona cambió ese peso a mano en la época 60
- **THEN** la línea muestra el salto y una marca en esa época

#### Scenario: Sin épocas
- **WHEN** la red no completó ninguna época
- **THEN** en lugar de la línea, un texto dice que la historia aparece al terminar la primera época

#### Scenario: Descripción en texto
- **WHEN** un lector de pantalla llega a la historia
- **THEN** anuncia el valor inicial, el de ahora y cuántas épocas lleva

### Requirement: Lo que el Laboratorio no usa de la vista
En el Laboratorio MUST NOT mostrarse el interruptor de flujo ni el botón de
comparar con el original: el aprendizaje ya anima la red, y acá no hay un
cerebro original con el que comparar.

#### Scenario: Controles que no están
- **WHEN** la persona mira los controles de arriba de la red en el Laboratorio
- **THEN** no encuentra "Flujo" ni "Ver original"

### Requirement: La espiral se puede aprender
La espiral SHALL ser la forma difícil del Laboratorio, pero aprendible sin
buscar una combinación exacta: con dos capas ocultas y lo demás por defecto
la red MUST aprenderla en un tiempo que se puede esperar mirando, y con la
red por defecto no. El tooltip de la forma SHALL decir qué pide.

#### Scenario: Con dos capas de 8
- **WHEN** la persona elige la espiral, con 200 puntos y ruido 10 %, arma dos capas de 8 con tanh y deja la tasa por defecto
- **THEN** la red llega a 90 % de aciertos en práctica y en apartados en menos de 200 épocas, con cada una de cinco semillas de pesos

#### Scenario: Con dos capas de 7
- **WHEN** hace lo mismo con dos capas de 7
- **THEN** la red llega a 90 % en menos de 200 épocas, con cada una de cinco semillas

#### Scenario: Con la red por defecto
- **WHEN** la persona elige la espiral con la red por defecto, una capa de 4
- **THEN** la red no llega a 90 % en 600 épocas con ninguna de cinco semillas, y el plano muestra que una sola capa no alcanza

#### Scenario: Tooltip de la forma
- **WHEN** la persona posa el cursor sobre la espiral, en español o en inglés
- **THEN** el tooltip dice que es la difícil y que pide dos capas ocultas, sin nombrar una tasa

#### Scenario: Miniatura
- **WHEN** la persona mira la miniatura de la espiral en la barra
- **THEN** muestra la forma que se genera

### Requirement: Punto de prueba en el plano
Con puntos, el plano SHALL tener un punto de prueba: un marcador que la
persona pone donde quiere para preguntarle a la red qué contesta ahí. SHALL
moverse arrastrándolo, con un clic en cualquier lugar del plano y con las
flechas del teclado. MUST verse distinto de los ejemplos, y la red MUST NOT
aprender de él. Está siempre disponible, aprendiendo o en pausa, sin entrar
en ningún modo.

#### Scenario: Al abrir
- **WHEN** se abre el Laboratorio con puntos
- **THEN** el punto de prueba está en el centro del plano, a la vista, y la red muestra su cuenta

#### Scenario: Arrastrar
- **WHEN** la persona arrastra el punto de prueba por el plano
- **THEN** el marcador sigue al cursor y la respuesta se actualiza mientras arrastra, sin esperar a soltar

#### Scenario: Clic en el plano
- **WHEN** la persona hace clic en un lugar del plano
- **THEN** el punto de prueba va a ese lugar, sin necesidad de arrastrar

#### Scenario: Con el teclado
- **WHEN** la persona llega al punto de prueba con Tab y presiona una flecha
- **THEN** el punto se mueve 0,05 en esa dirección, o 0,01 con Mayúsculas, y un lector de pantalla lee las coordenadas nuevas y la respuesta

#### Scenario: Dentro del plano
- **WHEN** la persona arrastra el punto más allá del borde
- **THEN** el punto queda en el borde: sus coordenadas no salen de −1 a 1

#### Scenario: No es un ejemplo
- **WHEN** la persona mueve el punto de prueba y deja aprender a la red
- **THEN** la cantidad de ejemplos, las curvas y los aciertos no cambian por el punto, y su explicación dice que la red no aprende de él

#### Scenario: Distinto de los ejemplos
- **WHEN** la persona mira el plano sin distinguir colores
- **THEN** reconoce el punto de prueba por su forma y su tamaño: un aro con una cruz, más grande que cualquier ejemplo, que se ve sobre cualquier fondo

#### Scenario: Respuesta junto al punto
- **WHEN** el punto de prueba está sobre una zona donde la red contesta naranja
- **THEN** junto al marcador se lee el color con su forma y cuán segura está, y el rótulo no tapa el marcador ni sale del plano

#### Scenario: Mientras aprende
- **WHEN** la red aprende y el punto de prueba está quieto
- **THEN** la respuesta junto al punto cambia con la red

#### Scenario: Con una neurona elegida
- **WHEN** hay una neurona oculta elegida y el fondo muestra su mapa
- **THEN** junto al punto se lee lo que da esa neurona en ese lugar

#### Scenario: Blanco cómodo
- **WHEN** la persona apunta al marcador con el mouse
- **THEN** el área que lo agarra mide al menos 24 por 24 píxeles

#### Scenario: Se conserva
- **WHEN** la persona mueve el punto, cambia la forma de los datos, reinicia los pesos o sale de la pestaña y vuelve
- **THEN** el punto de prueba sigue donde lo dejó

#### Scenario: Con tu manejo
- **WHEN** los datos son tu manejo
- **THEN** no hay punto de prueba ni ningún control suyo a la vista

### Requirement: La red muestra el punto de prueba
Con puntos, cuando la red no muestra la cuenta de un ejemplo, el diagrama y la
tabla de pesos SHALL mostrar la cuenta del punto de prueba: sus coordenadas en
las dos entradas, el valor de cada neurona y la respuesta. Las tarjetas de las
entradas x e y SHALL tener un deslizador que mueve el punto. Al avanzar paso a
paso un ejemplo, la red muestra ese ejemplo; mover el punto de prueba en pausa
MUST volver a mostrar el punto sin cambiar lo aprendido.

#### Scenario: Entradas del punto
- **WHEN** la persona lleva el punto de prueba a x 0,30 e y −0,45
- **THEN** las entradas de la red muestran 0,30 y −0,45 y todas las neuronas se recalculan en el momento

#### Scenario: Deslizador de una entrada
- **WHEN** la persona elige la entrada x y mueve su deslizador, con el mouse o con las flechas
- **THEN** el punto de prueba se mueve en horizontal en el plano y la red se recalcula

#### Scenario: Ejemplo paso a paso
- **WHEN** la persona avanza de a una fase
- **THEN** la red pasa a mostrar la cuenta de ese ejemplo, el texto junto a la red lo dice, y el punto de prueba sigue en el plano, más tenue

#### Scenario: Volver al punto
- **WHEN** hay un ejemplo a medio corregir y la persona mueve el punto de prueba
- **THEN** la red muestra el punto de prueba con los pesos de ese momento, y el ejemplo queda como estaba: el paso siguiente sigue su cuenta donde iba

#### Scenario: Sin efecto en el aprendizaje
- **WHEN** la persona mueve el punto de prueba cien veces con la red en pausa
- **THEN** ningún peso ni sesgo cambia, y la época y las curvas quedan iguales

#### Scenario: Reproduciendo de a ejemplos
- **WHEN** el aprendizaje se reproduce de a ejemplos o menos
- **THEN** la red sigue mostrando los ejemplos en curso, y la respuesta junto al punto de prueba sigue actualizándose en el plano

#### Scenario: Mismo punto, misma respuesta
- **WHEN** la persona pone dos veces el punto en el mismo lugar sin que la red aprenda entre medio
- **THEN** la red contesta lo mismo las dos veces

#### Scenario: Con cambios a mano
- **WHEN** la persona apaga una neurona o cambia un peso a mano
- **THEN** la respuesta del punto de prueba usa la red con esos cambios, igual que el fondo
