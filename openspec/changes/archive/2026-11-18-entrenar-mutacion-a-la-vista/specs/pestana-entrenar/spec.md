## ADDED Requirements

### Requirement: Vista previa de la mutación
Mientras la persona mueve el deslizador de la fuerza de mutación, y hasta
unos 2 segundos después de soltarlo, la tarjeta de la red del líder SHALL
mostrar un hijo de ejemplo del líder: su red mutada con la fuerza del
deslizador y la probabilidad de mutación de los ajustes, con los pesos y
sesgos que cambiaron marcados como en el corte de generación, y un renglón
que diga que es un ejemplo y cuánto cambiaron en promedio. El hijo de ejemplo
MUST NOT cambiar el entrenamiento ni consumir su azar: con la misma red, la
misma fuerza y la misma probabilidad, SHALL ser siempre el mismo. Con el
enfriamiento encendido, el deslizador no se edita y MUST NOT haber vista
previa.

#### Scenario: Mover la fuerza
- **WHEN** la persona, con el enfriamiento apagado, lleva la fuerza de 10 % a 60 %
- **THEN** la red muestra un hijo de ejemplo del líder con más pesos marcados lejos de su valor, y el renglón dice que es un ejemplo con fuerza 60 % y cuánto cambiaron en promedio

#### Scenario: Fuerza cero
- **WHEN** la persona lleva la fuerza a 0 %
- **THEN** el hijo de ejemplo es igual al líder, no hay pesos marcados y el renglón dice que no cambió nada

#### Scenario: Volver a la red en vivo
- **WHEN** la persona suelta el deslizador y pasan unos 2 segundos sin moverlo
- **THEN** la tarjeta vuelve a la red del líder en vivo

#### Scenario: El entrenamiento no cambia
- **WHEN** se repite un entrenamiento con la misma semilla, una vez moviendo el deslizador sin soltar un valor distinto y otra sin tocarlo
- **THEN** el mejor fitness de cada generación es el mismo

#### Scenario: Con el enfriamiento
- **WHEN** la persona intenta mover la fuerza con el enfriamiento encendido
- **THEN** no hay vista previa y el tooltip sigue explicando que la fuerza baja sola

#### Scenario: Teclado
- **WHEN** la persona cambia la fuerza con las flechas del teclado
- **THEN** la vista previa aparece igual que con el mouse

#### Scenario: Durante el corte
- **WHEN** la persona mueve la fuerza durante el corte de generación
- **THEN** la red muestra la vista previa del hijo de ejemplo, y al terminar la vista previa vuelve a lo que corresponde: la muestra del corte si sigue, o la red en vivo

#### Scenario: Idioma
- **WHEN** la aplicación está en inglés
- **THEN** el renglón de la vista previa se lee en inglés
