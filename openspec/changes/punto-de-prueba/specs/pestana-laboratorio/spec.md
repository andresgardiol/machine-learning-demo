# Spec Delta

## MODIFIED Requirements

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

## ADDED Requirements

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
