## ADDED Requirements

### Requirement: Decisión con tus cambios en el caso
Con el caso del choque a la vista y con al menos un cambio de prueba en la red, la tarjeta del choque SHALL agregar una línea que dice qué decidiría la red de ahora en el cuadro que muestra el deslizador: la acción, o que decidiría lo mismo. La decisión real de ese cuadro y la neurona que más aportó a ella no cambian. Sin cambios de prueba, la línea MUST NOT verse. La línea está en español y en inglés y la lee el lector de pantalla junto con la tarjeta.

#### Scenario: Estado por defecto
- **WHEN** el auto choca y la persona no cambió la red
- **THEN** la tarjeta del choque se ve como siempre, sin la línea de los cambios

#### Scenario: Un cambio que cambia la decisión
- **WHEN** la red decidió avanzar en el cuadro que se mira y la persona baja el sesgo de avanzar hasta que se apaga y se enciende izquierda
- **THEN** la tarjeta sigue diciendo que la red decidió avanzar y agrega "Con tus cambios, en este cuadro decidiría: Izquierda"

#### Scenario: Un cambio que no alcanza
- **WHEN** la persona cambia un peso y la decisión de ese cuadro sigue siendo la misma
- **THEN** la línea dice que con tus cambios decidiría lo mismo

#### Scenario: Deshacer
- **WHEN** la persona deshace todos los cambios con el caso a la vista
- **THEN** la línea desaparece y la red muestra la misma cuenta que al chocar

#### Scenario: Misma cuenta, mismo resultado
- **WHEN** con los mismos cambios la persona vuelve el deslizador a un cuadro que ya vio
- **THEN** la red muestra la misma cuenta y la línea dice lo mismo que antes

## MODIFIED Requirements

### Requirement: Repetición del choque en Inspeccionar
Con un choque a la vista, un deslizador sobre la escena SHALL permitir volver a ver los últimos 3 segundos antes del choque, cuadro por cuadro. La escena, la red, la decisión, la tarjeta del caso y la tarjeta de la neurona elegida siguen al deslizador. La escena y lo que leen los sensores MUST ser los de ese cuadro. La red, la tarjeta de la neurona elegida y la decisión debajo de la escena SHALL calcular ese cuadro con la red de ahora, con los cambios de prueba aplicados. El deslizador SHALL empezar 1 segundo antes del choque, tener tooltip y manejarse con el teclado.

#### Scenario: Al chocar
- **WHEN** el auto choca después de 5 segundos de intento
- **THEN** el deslizador cubre los últimos 3 segundos y está 1 segundo antes del choque, con la escena, la red y la decisión de ese cuadro

#### Scenario: Volver atrás en el tiempo
- **WHEN** la persona lleva el deslizador a 2 segundos antes del choque
- **THEN** la escena muestra el auto donde estaba en ese instante, la red muestra la cuenta de ese cuadro y la tarjeta, la decisión y la neurona que más aportó en ese cuadro

#### Scenario: Con el teclado
- **WHEN** la persona llega al deslizador con Tab y presiona la flecha izquierda
- **THEN** la repetición retrocede un cuadro y el auto no gira

#### Scenario: Intento corto
- **WHEN** el auto choca antes de cumplir 3 segundos
- **THEN** el deslizador cubre solo el tiempo que duró el intento

#### Scenario: Red cambiada después del choque
- **WHEN** con el caso a la vista la persona apaga una neurona y mueve el deslizador
- **THEN** la red muestra esa neurona apagada y la cuenta de ese cuadro sin ella, y la tarjeta del choque sigue diciendo lo que la red decidió en realidad

#### Scenario: Mover un sesgo con el caso abierto
- **WHEN** con el caso a la vista la persona elige una neurona y mueve su sesgo
- **THEN** la suma, la salida de la neurona y las salidas de la red cambian en ese mismo cuadro mientras arrastra

#### Scenario: Determinismo
- **WHEN** la persona reinicia y el auto vuelve a chocar igual
- **THEN** la repetición muestra los mismos cuadros que la vez anterior
