# Spec Delta

## ADDED Requirements

### Requirement: Cerebros que aprendieron imitando
En la lista de competidores, en el selector y en la tabla por pista, un
cerebro que aprendió imitando SHALL decir dónde se tomaron sus ejemplos con
las mismas marcas que los demás: practicó en esa pista, y no vio las otras.

#### Scenario: Marca en la tabla
- **WHEN** corre un cerebro que aprendió imitando un manejo en la calle recta
- **THEN** su celda de la calle recta dice que practicó ahí y las de los circuitos, que no los vio

#### Scenario: En el selector
- **WHEN** la persona abre el selector para agregar competidores
- **THEN** ese cerebro está entre sus cerebros, con su nombre y la pista de sus ejemplos
