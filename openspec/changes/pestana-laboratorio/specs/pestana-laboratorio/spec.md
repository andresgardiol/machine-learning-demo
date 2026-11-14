# Spec Delta

## Purpose

Es la pestaña 6, "Laboratorio": un espacio libre donde una red aprende de
ejemplos corrigiendo sus errores. Deja ver backpropagation paso a paso, armar
la red y los datos, provocar el sobreajuste y reconocerlo, y enseñarle a una
red a manejar imitando un manejo.

## ADDED Requirements

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
color que elegiría y, con la intensidad, cuán segura está. El fondo SHALL
actualizarse mientras la red aprende. Los puntos apartados MUST distinguirse
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
hacer, escrita con sus números. De corrido, de a épocas o ejemplos, no se
muestra.

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

#### Scenario: Restablecer la red
- **WHEN** la persona restablece la red desde el panel
- **THEN** vuelve a una capa de 4 con tanh y la tasa por defecto

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

#### Scenario: No se pudo guardar
- **WHEN** el almacenamiento del navegador falla
- **THEN** un mensaje lo explica con palabras y el aprendizaje sigue

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

#### Scenario: Términos con su nombre
- **WHEN** la persona posa el cursor sobre "época", "tasa de aprendizaje", "culpa" o "sobreajuste"
- **THEN** un tooltip dice qué es con palabras llanas y con su nombre técnico

### Requirement: Estado conservado en el Laboratorio
Al salir de la pestaña y volver, la pestaña SHALL conservar los datos, la red
con lo aprendido, las curvas, los ajustes, el ritmo y los ejemplos grabados,
hasta cerrar la aplicación. El aprendizaje MUST quedar en pausa mientras la
pestaña no está a la vista.

#### Scenario: Volver a la pestaña
- **WHEN** la persona deja una red a medio aprender, abre Competir y vuelve
- **THEN** encuentra la misma red, las mismas curvas y los mismos ajustes

#### Scenario: Pausa al salir
- **WHEN** la persona abre otra pestaña con el aprendizaje en marcha
- **THEN** el aprendizaje no avanza hasta que vuelve

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

#### Scenario: Auditoría de tooltips
- **WHEN** se corre la auditoría de tooltips con puntos y con tu manejo, en pausa, reproduciendo y grabando
- **THEN** no informa ningún control sin ayuda

#### Scenario: Objetivos
- **WHEN** se miden los botones de la pestaña
- **THEN** todos miden al menos 24 píxeles de lado
