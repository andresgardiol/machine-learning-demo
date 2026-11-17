## ADDED Requirements

### Requirement: Lo que titubea, quieto
Con la red corriendo, una neurona o conexión que va a cambiar mucho de brillo
por cuarta vez en un mismo segundo SHALL mostrarse quieta: relleno o trazo con el
promedio del último medio segundo, un rayado fijo que la marca y su número
con "≈". Vuelve a lo exacto tras un segundo quieta. En pausa o paso a paso,
todo se ve exacto.

#### Scenario: Neurona en el borde
- **WHEN** el total de una neurona con escalón ronda el cero y su valor salta entre 0 y 1 en cada cuadro
- **THEN** la neurona deja de destellar, se ve rayada con un relleno intermedio y su número dice, por ejemplo, "≈ 0,40"

#### Scenario: Los primeros cambios se ven
- **WHEN** una neurona cambia de 0 a 1 y vuelve una sola vez en un segundo
- **THEN** se ven los dos cambios, exactos, sin rayado

#### Scenario: Se calma
- **WHEN** una neurona rayada se queda en el mismo valor durante un segundo
- **THEN** pierde el rayado y vuelve a mostrar su valor exacto

#### Scenario: Pausa exacta
- **WHEN** la persona pausa con una neurona rayada
- **THEN** la neurona muestra el valor exacto del cuadro en pausa, sin rayado ni "≈"

#### Scenario: Conexiones
- **WHEN** el aporte de una conexión salta entre cero y su peso en cada cuadro
- **THEN** la conexión se ve quieta, con el brillo del promedio y punteada en fino, en el diagrama y en la tabla de pesos

#### Scenario: Qué es el rayado
- **WHEN** la persona posa el cursor sobre una neurona rayada o mira la leyenda
- **THEN** un texto, en español y en inglés, dice que la neurona cambia de valor más rápido de lo que se puede mostrar sin destellar, que se ve su promedio y que en pausa se ve el valor exacto

#### Scenario: Tarjeta de la neurona
- **WHEN** la neurona elegida titubea
- **THEN** la tarjeta dice que titubea entre sus dos valores y en qué parte del último segundo valió cada uno

#### Scenario: La red decide igual
- **WHEN** una neurona se muestra rayada
- **THEN** la red sigue calculando y manejando con los valores exactos de cada cuadro
