## ADDED Requirements

### Requirement: Muestra de la mutación
Al armar una generación nueva que tenga al menos un hijo mutado, el
entrenamiento SHALL guardar una muestra: el primer individuo de la población
nueva que no es copia de la élite y la red de la que salió antes de mutar (la
copia de su padre o, con cruce, el resultado del cruce). La muestra MUST NOT
consumir azar ni cambiar ninguna red: con la misma semilla, el entrenamiento
SHALL dar los mismos resultados con la muestra que sin ella.

#### Scenario: Muestra por defecto
- **WHEN** termina la primera generación con los valores por defecto
- **THEN** la muestra señala al primer individuo que no es de la élite, y comparar su red con la red de antes de mutar da la lista de pesos y sesgos que cambió la mutación

#### Scenario: Fuerza cero
- **WHEN** termina una generación con fuerza de mutación 0 %
- **THEN** la red de la muestra es idéntica a la red de antes de mutar

#### Scenario: Con selección manual
- **WHEN** termina una generación con la selección manual y un padre elegido
- **THEN** la red de antes de mutar de la muestra es la del padre elegido

#### Scenario: Sin hijos mutados
- **WHEN** termina una generación con la selección manual y sin padre elegido, y la población siguiente sale al azar
- **THEN** no hay muestra

#### Scenario: Mismo resultado
- **WHEN** se repite un entrenamiento de diez generaciones con la misma semilla
- **THEN** el mejor fitness de cada generación y las redes de la población son los mismos que antes de este cambio

### Requirement: Cambios que rigen en cada generación
El historial SHALL registrar, en cada generación, los ajustes que la persona
cambió y que empezaron a regir con ella: el nombre del ajuste, el valor
anterior y el nuevo. Los cambios automáticos, como la fuerza que baja sola con
el enfriamiento, MUST NOT registrarse como cambios de la persona.

#### Scenario: Cambio de la fuerza
- **WHEN** la persona apaga el enfriamiento y cambia la fuerza de 29 % a 40 % durante la generación 3
- **THEN** el registro de la generación 4 dice que cambiaron el enfriamiento y la fuerza de mutación, con sus valores anteriores y nuevos, y el de la 3 no registra cambios

#### Scenario: Sin cambios
- **WHEN** corren cinco generaciones sin que la persona toque nada
- **THEN** ningún registro tiene cambios, aunque la fuerza haya bajado sola

#### Scenario: Varios cambios juntos
- **WHEN** la persona cambia la población y la élite en la misma generación
- **THEN** el registro de la generación siguiente tiene los dos cambios
