# Spec Delta

## ADDED Requirements

### Requirement: Pistas del entrenamiento
El entrenamiento SHALL correr sobre una lista de una o más pistas del
catálogo, la calle recta sola por defecto. Con más de una, cada generación
corre entera en una sola pista y la siguiente pasa a la que sigue en la
lista, volviendo a empezar al terminar. Un cambio en la lista MUST regir
desde la generación siguiente. Una lista vacía o con pistas desconocidas MUST
ajustarse al valor por defecto.

#### Scenario: Estado por defecto
- **WHEN** empieza un entrenamiento sin configurar nada
- **THEN** todas las generaciones corren en la calle recta

#### Scenario: Dos pistas alternadas
- **WHEN** se entrena con la lista calle recta y óvalo
- **THEN** las generaciones 1, 3 y 5 corren en la calle recta y las generaciones 2, 4 y 6 en el óvalo

#### Scenario: Una generación, una pista
- **WHEN** corre una generación con varias pistas en la lista
- **THEN** todos los individuos de esa generación manejan en la misma pista

#### Scenario: Cambio durante una generación
- **WHEN** se agrega el riñón a la lista durante una generación
- **THEN** la generación en curso termina en su pista y el riñón entra en el turno desde la generación siguiente

#### Scenario: Volver a una sola pista
- **WHEN** se restablece la configuración después de entrenar en varias pistas
- **THEN** desde la generación siguiente todas corren en la calle recta

#### Scenario: Alternancia reproducible
- **WHEN** se repite un entrenamiento con la misma semilla y la misma lista de pistas
- **THEN** cada generación corre en la misma pista y resulta la misma población

### Requirement: Ventaja en un circuito
En un circuito, la función de fitness ventaja SHALL medirse igual que en la
calle, contra el ritmo de referencia de 10 m/s (el del tráfico), aunque no
haya vehículos: el progreso acumulado del auto menos lo que habría avanzado
ese ritmo en el mismo tiempo. Así premia avanzar en el sentido correcto, dar
más vueltas y darlas más rápido.

#### Scenario: Dos vueltas en un minuto
- **WHEN** un auto da dos vueltas a un circuito de 600 metros en 60 segundos
- **THEN** su fitness por ventaja es 600

#### Scenario: Sentido contrario
- **WHEN** un auto recorre el circuito en sentido contrario durante toda la generación
- **THEN** su fitness por ventaja es 0

#### Scenario: Más rápido vale más
- **WHEN** dos autos completan una vuelta al mismo circuito, uno en 40 segundos y otro en 55
- **THEN** el fitness por ventaja del primero es mayor que el del segundo

### Requirement: Vueltas de un individuo
El entrenamiento SHALL poder informar, para cada individuo de una generación
que corre en un circuito, cuántas vueltas lleva: su mayor progreso dividido
por el largo de una vuelta, nunca menos que cero. En la calle recta no hay
vueltas, y en un circuito la cuenta de vehículos superados es siempre cero.

#### Scenario: Vuelta y media
- **WHEN** el mayor progreso de un auto en un circuito de 600 metros es de 900 metros
- **THEN** lleva 1,5 vueltas

#### Scenario: Chocar no descuenta
- **WHEN** un auto choca después de completar una vuelta y cuarto
- **THEN** sigue llevando 1,25 vueltas

#### Scenario: Sin tráfico que superar
- **WHEN** una generación corre en un circuito
- **THEN** la cuenta de vehículos superados de cada individuo es 0

### Requirement: Aprendizaje en el óvalo
Con los valores por defecto y el óvalo como única pista, la población SHALL
aprender a dar la vuelta. La medida es fija: con las semillas de
entrenamiento 1 a 8, se mira si el campeón de la generación 60, manejando
solo durante 60 segundos, completa al menos una vuelta. Eso MUST cumplirse en
al menos 5 de las 8 semillas.

#### Scenario: Óvalo con los valores por defecto
- **WHEN** se hace la medida
- **THEN** el campeón completa al menos una vuelta en 5 o más de las 8 semillas

#### Scenario: Medida reproducible
- **WHEN** se repite la medida
- **THEN** da exactamente el mismo resultado
