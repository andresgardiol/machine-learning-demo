# Spec Delta

## Purpose

Pone a varios competidores, cada uno con su propio controlador y sus propios
sensores, a correr a la vez en la misma pista hasta una meta, y dice cómo le
fue a cada uno. Es la base para comparar formas de manejar con la misma vara.

## ADDED Requirements

### Requirement: Carrera de varios competidores
Una carrera SHALL reunir de uno a seis competidores en una pista del
catálogo. Cada competidor tiene un controlador de cualquier tipo (red, reglas
o teclado), sus sensores y un nombre. Todos MUST salir de la línea de salida
en el mismo instante, con la misma velocidad máxima y, en la calle recta, con
el mismo tráfico. Los competidores MUST NOT percibirse ni chocarse entre sí.

#### Scenario: Salida
- **WHEN** empieza una carrera de cuatro competidores
- **THEN** los cuatro autos están detenidos en la misma posición de salida, superpuestos

#### Scenario: Fantasmas
- **WHEN** dos competidores pasan por el mismo lugar al mismo tiempo
- **THEN** ninguno choca ni cambia su manejo por el otro

#### Scenario: Controladores distintos
- **WHEN** corren a la vez un cerebro de 5 sensores, un programa de 7 sensores y un auto manejado con el teclado
- **THEN** cada uno maneja con su propio controlador y con sus propios sensores

#### Scenario: Demasiados competidores
- **WHEN** se arma una carrera con siete competidores
- **THEN** el pedido se rechaza con un error que dice que el máximo es seis

#### Scenario: Igual solo que acompañado
- **WHEN** un mismo cerebro corre solo y después acompañado de otros cinco, en la misma pista y con el mismo tráfico
- **THEN** recorre exactamente el mismo camino las dos veces

### Requirement: Meta de la carrera
Cada pista SHALL tener una meta: una distancia en la calle recta y una
cantidad de vueltas en cada circuito. Un competidor llega cuando su progreso
alcanza la meta; la carrera MUST anotar su tiempo de llegada, y ese competidor
deja de correr.

#### Scenario: Meta de la calle recta
- **WHEN** un competidor alcanza los 1000 metros en la calle recta a los 52 segundos
- **THEN** queda como que llegó, con un tiempo de 52 segundos

#### Scenario: Meta de un circuito
- **WHEN** un competidor completa las 2 vueltas del óvalo
- **THEN** queda como que llegó, con el tiempo en que cruzó la línea por segunda vez

#### Scenario: Meta de cada pista
- **WHEN** se consultan las metas
- **THEN** son 1000 metros en la calle recta, 2 vueltas en el óvalo, 1 en el óvalo con chicana y 1 en el circuito de curvas

#### Scenario: Después de llegar
- **WHEN** un competidor llegó y los demás siguen corriendo
- **THEN** su auto queda detenido pasando la meta y su resultado ya no cambia

### Requirement: Chocar no saca de la carrera
Un competidor que choca contra un borde o un vehículo SHALL seguir en carrera:
queda detenido el tiempo de la penalización y reaparece un poco más atrás, en
el centro de la pista (en la calle recta, en el carril de salida), mirando
hacia adelante y detenido. La penalización SHALL poder configurarse y es de 0,1 segundos por
defecto. La carrera MUST contar los choques de cada competidor.

#### Scenario: Reaparecer
- **WHEN** un competidor choca contra el borde a los 300 metros con la penalización por defecto
- **THEN** 0,1 segundos después está en el centro de la pista, dos largos de auto más atrás, detenido y mirando hacia adelante, y sigue corriendo

#### Scenario: Choques contados
- **WHEN** un competidor choca tres veces y llega a la meta
- **THEN** su resultado dice que llegó, con su tiempo y 3 choques

#### Scenario: Penalización más larga
- **WHEN** la penalización es de 2 segundos
- **THEN** un competidor que choca queda detenido 2 segundos antes de reaparecer

#### Scenario: Sin penalización
- **WHEN** la penalización es de 0 segundos
- **THEN** un competidor que choca reaparece en el paso siguiente

#### Scenario: Choque cerca de la salida
- **WHEN** un competidor choca a un metro de la salida
- **THEN** reaparece en la salida, no antes

#### Scenario: Vuelta que no se pierde
- **WHEN** un competidor choca apenas cruzó la línea al completar una vuelta
- **THEN** reaparece antes de la línea y la vuelta que ya completó sigue contada una sola vez

### Requirement: Protegido al reaparecer
Durante 2 segundos después de reaparecer, el tráfico MUST NOT chocar al
competidor: puede pasar a través de los vehículos, también del que chocó. La
protección MUST NOT terminar mientras esté encimado con un vehículo. En ese
tiempo sus sensores ven el tráfico como siempre y los bordes sí lo chocan. Un
competidor MUST NOT quedar chocando una y otra vez contra el mismo vehículo
por haber reaparecido pegado a él.

#### Scenario: A través del vehículo que chocó
- **WHEN** un competidor choca contra un vehículo, reaparece detrás y avanza hacia él antes de los 2 segundos
- **THEN** lo atraviesa sin chocar

#### Scenario: Vehículo que viene de atrás
- **WHEN** un vehículo alcanza a un competidor medio segundo después de que reapareció
- **THEN** el competidor no choca

#### Scenario: Protección que termina
- **WHEN** pasaron más de 2 segundos desde que reapareció, no está encimado con ningún vehículo y después toca uno
- **THEN** choca

#### Scenario: Encimado al cumplirse el tiempo
- **WHEN** se cumplen los 2 segundos con el competidor encimado con un vehículo
- **THEN** sigue protegido hasta que deja de estar encimado, y no choca por eso

#### Scenario: Los bordes no perdonan
- **WHEN** un competidor protegido toca el borde de la pista
- **THEN** choca

#### Scenario: Sin choques en cadena
- **WHEN** un cerebro que maneja bien desde la largada choca contra un vehículo y reaparece
- **THEN** no vuelve a chocar contra ese mismo vehículo en los segundos siguientes

### Requirement: Competidor que no avanza
Un competidor que pasa 5 segundos sin superar su mayor progreso SHALL quedar
fuera de la carrera, como que no terminó, con lo logrado hasta ahí, corran o
no los demás.

#### Scenario: Nunca arranca
- **WHEN** un competidor no se mueve desde la salida
- **THEN** a los 5 segundos queda fuera, como que no terminó

#### Scenario: Choca siempre en el mismo lugar
- **WHEN** un competidor choca, reaparece y vuelve a chocar en la misma curva, sin pasar de ahí
- **THEN** a los 5 segundos de su mayor progreso queda fuera, como que no terminó

#### Scenario: Avanza despacio
- **WHEN** un competidor avanza muy despacio, pero avanza
- **THEN** sigue en carrera

### Requirement: Fin de la carrera
La carrera SHALL terminar cuando no queda ningún competidor corriendo. Desde
que llega el primero, los demás tienen 20 segundos para llegar; cumplidos,
los que siguen corriendo quedan como que no terminaron. Ninguna carrera MUST
durar más de 180 segundos. Terminada la carrera, avanzar más pasos MUST NOT
cambiar nada.

#### Scenario: Llegan todos
- **WHEN** el último competidor llega a la meta
- **THEN** la carrera termina en ese momento

#### Scenario: Rezagado
- **WHEN** el primero llega a los 50 segundos y otro sigue corriendo a los 70
- **THEN** la carrera termina a los 70 segundos y el rezagado queda como que no terminó, con lo que llevaba

#### Scenario: Rezagado que llega a tiempo
- **WHEN** el primero llega a los 50 segundos y otro llega a los 65
- **THEN** los dos quedan como que llegaron

#### Scenario: No llega nadie
- **WHEN** ningún competidor llega y todos quedan fuera por no avanzar
- **THEN** la carrera termina cuando queda fuera el último

#### Scenario: Tiempo máximo
- **WHEN** pasan 180 segundos sin que nadie llegue, con competidores avanzando despacio
- **THEN** la carrera termina y esos competidores quedan como que no terminaron

#### Scenario: Después del final
- **WHEN** la carrera ya terminó y se pide avanzar un paso más
- **THEN** ningún resultado cambia

### Requirement: Resultado de cada competidor
La carrera SHALL informar en todo momento, para cada competidor: su estado
(en carrera, llegó o no terminó), su tiempo de llegada, su mayor progreso y
qué parte de la meta representa, sus choques y, en un circuito, sus vueltas y
su mejor vuelta. SHALL informar también cuánto falta para que se cierre la
espera, una vez que llegó el primero.

#### Scenario: Competidor que llega
- **WHEN** un competidor llega a la meta a los 48,2 segundos con un choque
- **THEN** su resultado dice que llegó, en 48,2 segundos, con 1 choque

#### Scenario: Competidor que no termina
- **WHEN** un competidor queda fuera a los 640 metros de una meta de 1000
- **THEN** su resultado dice que no terminó, con 640 metros, el 64 % de la carrera, y sus choques

#### Scenario: En un circuito
- **WHEN** un competidor recorrió una vuelta y media de una carrera de 2 vueltas
- **THEN** su resultado dice 1,5 vueltas, el 75 % de la carrera

#### Scenario: Espera abierta
- **WHEN** el primero llegó hace 6 segundos
- **THEN** la carrera informa que quedan 14 segundos para llegar

### Requirement: Mejor vuelta
En un circuito, la carrera SHALL registrar el tiempo de cada vuelta completa
de cada competidor, medido de un cruce de la línea de salida hacia adelante al
siguiente, y su mejor vuelta es la más corta. Un competidor que no completó
ninguna MUST NOT tener mejor vuelta.

#### Scenario: Dos vueltas
- **WHEN** un competidor completa su primera vuelta a los 28 segundos y la segunda a los 53
- **THEN** sus vueltas duraron 28 y 25 segundos, y su mejor vuelta es de 25 segundos

#### Scenario: Sin vuelta completa
- **WHEN** un competidor queda fuera antes de completar la primera vuelta
- **THEN** no tiene mejor vuelta

#### Scenario: Volver atrás no cuenta
- **WHEN** un competidor cruza la línea de salida hacia atrás y vuelve a cruzarla hacia adelante
- **THEN** eso no cuenta como una vuelta

### Requirement: Orden de la carrera
La carrera SHALL ordenar primero a los que llegaron, por tiempo de llegada, y
después a los demás, de mayor a menor progreso máximo. Los empates se
resuelven por el orden en que se anotaron.

#### Scenario: Llegó antes
- **WHEN** un competidor llegó a los 48 segundos y otro a los 55
- **THEN** el primero va adelante en el orden

#### Scenario: Llegó contra no llegó
- **WHEN** un competidor llegó y otro no terminó
- **THEN** el que llegó va adelante, sea cual sea el progreso del otro

#### Scenario: En carrera
- **WHEN** nadie llegó todavía, un competidor lleva 400 metros y otro 250
- **THEN** el de 400 metros va adelante

#### Scenario: Empate
- **WHEN** dos competidores tienen el mismo progreso máximo
- **THEN** va primero el que se anotó antes

### Requirement: Carrera reproducible
Con la misma pista, la misma semilla de tráfico, la misma penalización, los
mismos competidores y los mismos controles en cada paso, una carrera SHALL dar
exactamente los mismos resultados. La carrera SHALL funcionar sin navegador.

#### Scenario: Repetición
- **WHEN** se repite una carrera entre tres cerebros con la misma pista y la misma semilla
- **THEN** los resultados y el orden son idénticos paso a paso

#### Scenario: Otra semilla
- **WHEN** se repite la carrera en la calle recta con otra semilla de tráfico
- **THEN** el tráfico es distinto

#### Scenario: Sin navegador
- **WHEN** se corre una carrera entera en un entorno sin DOM
- **THEN** termina y da sus resultados
