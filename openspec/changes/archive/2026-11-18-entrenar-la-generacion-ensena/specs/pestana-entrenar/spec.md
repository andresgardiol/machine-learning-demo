## ADDED Requirements

### Requirement: Corte de generación
Con la guía activa y la velocidad del entrenamiento en 1× o 2×, al terminar
cada generación la pestaña SHALL detener la simulación unos 2 segundos antes
de que arranque la siguiente: la escena muestra quieta la generación nueva en
la largada, con el auto del foco, que es la copia del mejor, marcado como
élite. Como en la largada todos los autos están en el mismo lugar, la élite
SHALL contarse en la tarjeta de generación y no distinguirse uno por uno en la
escena. A 4× o más rápido, y con la guía
apagada, MUST NOT haber corte. El corte MUST NOT cambiar el entrenamiento:
con la misma semilla, el resultado de cada generación SHALL ser el mismo con
corte que sin él. Durante el corte, pausar SHALL mantener el corte a la vista
hasta reanudar, y pasar a la siguiente generación SHALL terminar el corte y
arrancar la generación.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña sin configurar nada y termina la primera generación
- **THEN** la simulación se detiene unos 2 segundos, la escena muestra la generación 2 en la largada con el auto del foco marcado como élite, y después la generación arranca sola

#### Scenario: Rápido sin corte
- **WHEN** la velocidad está en 4×, 8× o Máx. y termina una generación
- **THEN** la siguiente arranca enseguida, como antes de este cambio

#### Scenario: Guía apagada
- **WHEN** la guía está apagada y termina una generación a 1×
- **THEN** no hay corte

#### Scenario: Pausar durante el corte
- **WHEN** la persona pausa durante el corte
- **THEN** el corte queda a la vista hasta que reanuda, y al reanudar arranca la generación

#### Scenario: Seguir enseguida
- **WHEN** la persona usa siguiente generación, o su atajo, durante el corte
- **THEN** el corte termina y la generación arranca, sin terminar la que empieza

#### Scenario: Mismo entrenamiento
- **WHEN** se repite un entrenamiento de cinco generaciones con la misma semilla, a 1× con la guía activa y a Máx.
- **THEN** el mejor fitness de cada generación es el mismo

### Requirement: Tarjeta de generación
Durante el corte, al lado de la escena y sin tapar los autos, la pestaña SHALL
mostrar una tarjeta que dice qué pasó al pasar de generación, con los números
del entrenamiento real: cuántos individuos pasan tal cual (la élite), de qué
parte de la población salieron los padres de los demás (la selección) y con
qué fuerza mutaron. La élite SHALL verse además como una fila de tantas marcas
como individuos pasan tal cual, con la forma de la marca de élite de la escena.
Con la selección manual SHALL decir que la población es
hija del padre elegido; sin padre elegido, que la población salió al azar. La
tarjeta SHALL estar en español y en inglés, anunciarse a los lectores de
pantalla sin mover el foco y desaparecer cuando arranca la generación.

#### Scenario: Por defecto
- **WHEN** termina la primera generación con los valores por defecto
- **THEN** la tarjeta dice que pasan tal cual los 10 mejores y que los otros 390 son hijos del 10 % mejor, con la fuerza de mutación con que se armó la generación 2 (la del enfriamiento)

#### Scenario: Con selección manual
- **WHEN** termina una generación con la selección manual y un padre elegido en la generación 5
- **THEN** la tarjeta dice que la población es hija del padre que eligió la persona, con la fuerza de mutación del ajuste

#### Scenario: Lector de pantalla
- **WHEN** aparece la tarjeta
- **THEN** un lector de pantalla la anuncia sin que el foco se mueva de donde estaba

#### Scenario: Idioma
- **WHEN** la aplicación está en inglés y termina una generación
- **THEN** la tarjeta se lee en inglés

### Requirement: La mutación en la red
Durante el corte, la tarjeta de la red del líder SHALL mostrar la red de la
muestra de la mutación, con los pesos y sesgos que cambió la mutación marcados
por algo que no es solo el color, y un renglón que diga cuántos cambiaron de
cuántos y cuánto cambiaron en promedio. Al arrancar la generación, la tarjeta SHALL volver a la red del líder
en vivo. Si no hay muestra, la tarjeta SHALL seguir con la red del líder.

#### Scenario: Pesos cambiados
- **WHEN** termina la primera generación con los valores por defecto
- **THEN** durante el corte la red muestra un hijo con sus pesos cambiados marcados, y el renglón dice cuántos cambiaron de cuántos (con la probabilidad por defecto, todos) y cuánto cambiaron en promedio

#### Scenario: Vuelta a la red en vivo
- **WHEN** termina el corte
- **THEN** la tarjeta vuelve a mostrar la red del líder con su actividad

#### Scenario: Red plegada
- **WHEN** la tarjeta de la red está plegada y termina una generación
- **THEN** el corte ocurre igual y la tarjeta sigue plegada

### Requirement: Cambios marcados en la curva
La curva de fitness SHALL marcar las generaciones en las que empezó a regir un
cambio de ajustes de la persona, con una marca sobre el eje que no dependa
solo del color. Señalar la generación SHALL mostrar, en la línea de valores de
abajo del gráfico, qué ajustes cambiaron, con su valor anterior y el nuevo.
Reiniciar el entrenamiento SHALL borrar las marcas junto con la curva.

#### Scenario: Marca después de un cambio
- **WHEN** la persona cambia la fuerza de mutación durante la generación 3 y termina la generación 4
- **THEN** la curva tiene una marca en la generación 4, y al señalarla la línea de abajo dice "Fuerza de mutación: 29 % → 40 %" junto al mejor y al promedio

#### Scenario: Sin cambios no hay marcas
- **WHEN** corren diez generaciones sin que la persona toque nada
- **THEN** la curva no tiene marcas

#### Scenario: Reiniciar
- **WHEN** la persona reinicia el entrenamiento con marcas en la curva
- **THEN** la curva y sus marcas desaparecen

#### Scenario: Idioma
- **WHEN** la aplicación está en inglés y la persona señala una generación marcada
- **THEN** los nombres de los ajustes y sus valores se leen en inglés
