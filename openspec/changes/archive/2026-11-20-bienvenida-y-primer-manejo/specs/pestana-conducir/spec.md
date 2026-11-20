## MODIFIED Requirements

### Requirement: Manejo inmediato
Al abrirse, la pestaña SHALL mostrar el auto del conductor detenido y centrado
en un carril de una calle recta de tres carriles con tráfico, listo para
manejarse con el teclado sin configurar nada.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** se ve la calle de tres carriles, el auto detenido, el tráfico quieto por delante, los rayos de los sensores ocultos y las barras de los sensores en el tablero

#### Scenario: Primer movimiento
- **WHEN** la persona presiona la flecha arriba
- **THEN** el auto empieza a avanzar

### Requirement: Percepción visible
El tablero SHALL mostrar, en una tarjeta, una barra por cada sensor, en el
mismo orden que los rayos de izquierda a derecha, que refleja su lectura en
tiempo real, y una barra más, separada y rotulada, para la velocidad del auto,
que es la otra entrada que recibiría una máquina. Con hasta 12 sensores, cada
barra SHALL mostrar debajo su lectura como número entre 0 y 1. Un interruptor,
apagado por defecto, SHALL mostrar u ocultar los rayos sobre el escenario;
las barras MUST seguir visibles.

#### Scenario: Obstáculo que se acerca
- **WHEN** un vehículo se acerca por un rayo
- **THEN** la barra de ese rayo crece a medida que el vehículo está más cerca

#### Scenario: Rayos ocultos al entrar
- **WHEN** la persona entra a la pestaña
- **THEN** el interruptor de sensores está apagado, no se ven los rayos sobre el escenario y las barras muestran las lecturas

#### Scenario: Ocultar la percepción
- **WHEN** la persona apaga el interruptor de sensores
- **THEN** desaparecen los rayos del escenario, las barras siguen mostrando las lecturas y el manejo no cambia

#### Scenario: Volver a mostrar los rayos
- **WHEN** la persona vuelve a encender el interruptor de sensores
- **THEN** los rayos se dibujan otra vez sobre el escenario

#### Scenario: Lecturas con número
- **WHEN** el auto tiene 5 sensores y la aplicación está en español
- **THEN** debajo de cada barra se lee su lectura con dos decimales y coma decimal, por ejemplo 0,42

#### Scenario: Muchos sensores
- **WHEN** el auto tiene 30 sensores
- **THEN** se ven 30 barras sin números debajo y la barra de la velocidad conserva el suyo

#### Scenario: Velocidad como entrada
- **WHEN** el auto acelera desde parado hasta su velocidad máxima
- **THEN** la barra de la velocidad crece hasta llenarse y su número llega a 1

## ADDED Requirements

### Requirement: Tráfico que espera al conductor
En cada intento, la pestaña SHALL mantener quietos el auto, el tráfico y el
reloj del intento hasta la primera tecla de manejo (avanzar, retroceder o
doblar). Con esa tecla, todo MUST arrancar en el mismo cuadro. Un intento
empieza al abrir la pestaña, al reiniciar, al pedir tráfico nuevo y al
cambiar la pista o un ajuste que rearma el escenario.

#### Scenario: Al entrar
- **WHEN** la persona entra a la pestaña y espera diez segundos sin tocar el teclado
- **THEN** el tráfico sigue en el mismo lugar y el tiempo del intento sigue en cero

#### Scenario: Primera tecla
- **WHEN** la persona aprieta la flecha arriba
- **THEN** en el mismo cuadro el auto empieza a avanzar y el tráfico empieza a moverse

#### Scenario: Teclas que no son de manejo
- **WHEN** la persona aprieta V o hace zoom antes de manejar
- **THEN** el tráfico sigue quieto

#### Scenario: Después de reiniciar
- **WHEN** la persona choca y reinicia el intento
- **THEN** el tráfico vuelve a su lugar de partida y espera quieto hasta la próxima tecla de manejo

#### Scenario: Tráfico nuevo
- **WHEN** la persona pide tráfico nuevo
- **THEN** el tráfico nuevo aparece quieto y espera la primera tecla de manejo

#### Scenario: Mismo tráfico con la misma semilla
- **WHEN** dos personas, con la misma semilla, empiezan a manejar en momentos distintos después de abrir la pestaña y repiten las mismas teclas paso a paso desde la primera
- **THEN** el tráfico y el auto quedan en las mismas posiciones paso a paso

#### Scenario: Pausa antes de manejar
- **WHEN** la persona pausa antes de la primera tecla de manejo y aprieta la flecha arriba
- **THEN** nada se mueve hasta que reanuda
