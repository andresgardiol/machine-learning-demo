# Spec Delta

## Purpose

Define cómo se cuenta un capítulo de teoría: una figura viva que se queda a la vista y se transforma
mientras el texto pasa al lado, en tramos cortos, con algo para predecir y algo para resolver.

## ADDED Requirements

### Requirement: Figura fija y texto que pasa
En un capítulo, la figura SHALL quedar fija a la izquierda mientras el texto pasa a la derecha. Cuando
el ancho no alcanza para las dos columnas, la figura SHALL quedar fija arriba y el texto pasar debajo.
La figura MUST NOT achicarse por debajo del tamaño en que sus números se leen.

#### Scenario: Ventana ancha
- **WHEN** una persona lee un capítulo en una ventana de 1440 píxeles de ancho
- **THEN** la figura queda a la izquierda, a la vista, mientras desplaza el texto de la derecha

#### Scenario: Ventana angosta
- **WHEN** una persona lee un capítulo en una ventana de 870 píxeles de ancho
- **THEN** la figura queda fija arriba, el texto pasa debajo, y nada se superpone

### Requirement: Tramos que abren con una pregunta
Un capítulo SHALL dividirse en tramos. Cada tramo SHALL abrir con una pregunta y explicar un solo paso.
Un término técnico SHALL nombrarse después de que la figura lo mostró actuar, con su nombre real.

#### Scenario: El nombre llega después
- **WHEN** una persona lee el tramo del sesgo
- **THEN** primero mueve la tercera perilla y ve su efecto, y recién después el texto la llama "sesgo"

### Requirement: La figura sigue al tramo
Al entrar a un tramo, la figura SHALL mostrar el estado de ese tramo, con los números de los que habla
su texto. Lo que la persona cambió en un tramo SHALL conservarse mientras siga en ese tramo y al volver
a él, y MUST NOT pasar a otro tramo.

#### Scenario: Entrar a un tramo nuevo
- **WHEN** una persona que cambió las perillas en el tramo 2 pasa al tramo 3
- **THEN** la figura muestra los valores del tramo 3, los mismos que dice el texto

#### Scenario: Volver a un tramo tocado
- **WHEN** esa persona vuelve al tramo 2
- **THEN** la figura muestra las perillas como las había dejado en el tramo 2

#### Scenario: Desplazar un poco dentro del tramo
- **WHEN** una persona mueve una perilla y desplaza el texto sin salir del tramo
- **THEN** la figura conserva lo que cambió

### Requirement: La figura hace la cuenta real
Lo que una figura muestra SHALL salir de la misma cuenta que usa la app para ese concepto. Mover un
control SHALL cambiar en el momento todos los lugares donde ese valor aparece: el dibujo, la cuenta
escrita y el resultado. Con los mismos valores, la figura SHALL mostrar siempre lo mismo.

#### Scenario: Mover un peso
- **WHEN** una persona mueve la perilla de un peso
- **THEN** cambian en el momento la línea de ese peso, la cuenta escrita, la suma y la salida

#### Scenario: Dibujo y número coinciden
- **WHEN** la figura muestra un sensor con lectura 0,8
- **THEN** el rayo dibujado termina en algo (el borde o un vehículo) a la distancia que da esa lectura, y nunca en el vacío

### Requirement: Restablecer la figura
Cada figura que se puede tocar SHALL tener "Restablecer", que la devuelve a los valores del tramo. Cuando
la figura tiene cambios de la persona, SHALL decirlo junto a "Restablecer".

#### Scenario: Volver atrás
- **WHEN** una persona cambió las perillas y aprieta "Restablecer"
- **THEN** la figura vuelve a los valores del tramo y la cuenta coincide con el texto

### Requirement: Índice de tramos
El capítulo SHALL mostrar un índice con el título corto de cada tramo, que marca el tramo que se lee y
lleva a cualquier otro. En ventana angosta el índice SHALL plegarse en un renglón que muestra el tramo
actual y se abre al tocarlo.

#### Scenario: Volver a un tramo
- **WHEN** una persona en el tramo 6 elige "3. Desde cuánto se anima" en el índice
- **THEN** el capítulo va al tramo 3

### Requirement: Predecir antes de ver
Un tramo de predicción SHALL pedir una respuesta antes de mostrar el resultado. Sin respuesta, la figura
MUST NOT avanzar al estado del tramo siguiente, y ese tramo SHALL decirlo y ofrecer volver a contestar.
El desplazamiento MUST NOT bloquearse. Tras responder, SHALL mostrarse si se acertó y la cuenta que lo
explica.

#### Scenario: Responder
- **WHEN** una persona elige una respuesta en la predicción
- **THEN** ve si acertó, la cuenta que lo explica, y la figura muestra el resultado

#### Scenario: Pasar de largo
- **WHEN** una persona desplaza más allá de la predicción sin contestar
- **THEN** la figura se queda en el tramo de la predicción y el tramo siguiente ofrece volver a contestar

### Requirement: Desafío al cierre
Cada capítulo SHALL cerrar con un desafío mínimo que se resuelve en la figura, con el avance a la vista
y una pista a pedido. Al resolverlo, SHALL mostrarse el cierre del capítulo.

#### Scenario: Resolver el desafío
- **WHEN** una persona deja los pesos y el sesgo de modo que los cuatro casos del AND dan bien
- **THEN** el desafío marca "4 de 4" y aparece el cierre con el enlace a la app

#### Scenario: Pedir una pista
- **WHEN** una persona aprieta "Dame una pista"
- **THEN** ve una pista que orienta sin dar los números

### Requirement: Ayuda breve de los controles
Cada control de una figura SHALL tener una ayuda de una sola línea, en español y en inglés, que aparece
tras una espera al posar el cursor o al llegar con el teclado, fuera del recuadro de la figura. SHALL
cerrarse al apretar o arrastrar y MUST NOT reaparecer durante el gesto. Lo que se arrastra dentro de la
figura MUST NOT mostrar ayuda a la vista y SHALL tener su descripción para lectores de pantalla.

#### Scenario: Arrastrar el punto del plano
- **WHEN** una persona arrastra el punto del plano
- **THEN** ninguna ayuda tapa la figura

#### Scenario: Ayuda de una perilla
- **WHEN** una persona posa el cursor sobre una perilla y espera
- **THEN** aparece una línea que dice qué hace, debajo o al costado del control, sin tapar la figura

### Requirement: Para profundizar
Un capítulo SHALL poder cerrar con un bloque "Para profundizar", plegado por defecto, con la fórmula del
concepto, su nombre y una frase. El capítulo MUST entenderse entero sin abrirlo. El bloque SHALL abrirse
y cerrarse con el mouse y con el teclado, y estar en español y en inglés.

#### Scenario: Cerrado al abrir el capítulo
- **WHEN** una persona llega al final de un capítulo sin tocar nada
- **THEN** el bloque está plegado y solo se ve su título

#### Scenario: Abrir y volver a cerrar
- **WHEN** una persona abre el bloque y lo vuelve a cerrar
- **THEN** ve la fórmula con su nombre y, al cerrarlo, el capítulo queda como estaba
