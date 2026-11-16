# Spec Delta

## MODIFIED Requirements

### Requirement: Pesos visibles
Cada conexión SHALL mostrar el signo de su peso y su magnitud: el signo con dos
colores acompañados de un trazo distinto, para no depender solo del color, y la
magnitud con el grosor de la línea, relativo al peso más grande de la red.
Ninguna conexión con peso distinto de cero MUST quedar por debajo de un mínimo
que se distingue del fondo. El diagrama SHALL incluir una leyenda que lo
explique.

#### Scenario: Peso positivo fuerte y negativo débil
- **WHEN** una conexión tiene peso 0,9 y otra peso -0,1
- **THEN** la primera se ve con el color y el trazo de los pesos positivos y bien marcada, y la segunda con el color y el trazo de los negativos y tenue

#### Scenario: Leyenda
- **WHEN** se muestra el diagrama
- **THEN** una leyenda indica qué aspecto tienen los pesos positivos, los negativos y una neurona activa

#### Scenario: Red de pesos chicos
- **WHEN** se muestra una red cuyos pesos no pasan de 0,25
- **THEN** la conexión de mayor peso se ve bien marcada y todas las demás se distinguen del fondo

#### Scenario: Igual que en Inspeccionar
- **WHEN** la persona mira el mismo cerebro en Entrenar y en Inspeccionar
- **THEN** las mismas conexiones son las más gruesas en las dos, con los mismos colores
