# Spec Delta

## Purpose

Incluye con la aplicación unos pocos cerebros ya entrenados, elegidos para
mostrar qué cambia según dónde y cómo se entrena, de modo que comparar
cerebros funcione sin haber entrenado nada antes.

## ADDED Requirements

### Requirement: Cuatro cerebros incluidos
La aplicación SHALL incluir cuatro cerebros de ejemplo válidos, cada uno
llamado por cómo se entrenó, en español y en inglés: en la calle con tráfico
nuevo, en la calle con el mismo tráfico, en el óvalo, y en las cuatro pistas.
Sus datos de entrenamiento MUST decir la verdad sobre cómo se entrenaron.

#### Scenario: Disponibles sin entrenar
- **WHEN** una persona abre la aplicación por primera vez, sin cerebros guardados
- **THEN** los cuatro cerebros de ejemplo están disponibles para competir

#### Scenario: Datos verdaderos
- **WHEN** se leen los datos de entrenamiento del ejemplo del óvalo
- **THEN** dicen que se entrenó en el óvalo y cuántas generaciones

#### Scenario: Cerebros válidos
- **WHEN** se validan los cuatro cerebros de ejemplo
- **THEN** los cuatro son válidos y cada uno puede manejar un auto con sus propios sensores

### Requirement: Ejemplos que no cambian
Los cerebros de ejemplo SHALL ser datos de la aplicación, iguales para todas
las personas: MUST NOT poder editarse, renombrarse ni eliminarse, y MUST NOT
contarse entre los cerebros de la biblioteca de la persona.

#### Scenario: Biblioteca propia
- **WHEN** una persona sin cerebros guardados abre la biblioteca en Entrenar
- **THEN** la biblioteca está vacía

#### Scenario: Sin acciones de edición
- **WHEN** la persona mira un cerebro de ejemplo en la lista de competidores
- **THEN** no hay ninguna acción para renombrarlo ni para eliminarlo, y su tooltip dice que es un ejemplo incluido

### Requirement: Ejemplos que se pueden regenerar
Los cerebros de ejemplo SHALL salir de una herramienta del proyecto que los
entrena con el núcleo, con semillas fijas, y da siempre el mismo resultado. La
herramienta MUST comprobar que cada ejemplo muestra lo que tiene que mostrar
antes de guardarlo.

#### Scenario: Mismo resultado
- **WHEN** se corre la herramienta dos veces
- **THEN** genera los mismos cuatro cerebros

#### Scenario: Comprobación
- **WHEN** un ejemplo entrenado no cumple lo que tiene que mostrar
- **THEN** la herramienta lo informa y no lo guarda

### Requirement: Lo que muestran los ejemplos
Medidos en carreras con la penalización por defecto, los ejemplos SHALL
mostrar estos contrastes. En la calle con tráficos nuevos, el de tráfico nuevo
MUST chocar menos que el del mismo tráfico. En el tráfico de práctica, el del
mismo tráfico MUST llegar a la meta sin chocar. En el óvalo, el del óvalo MUST
llegar a la meta. El de las cuatro pistas MUST llegar a la meta en el óvalo y
en la calle.

#### Scenario: Generaliza frente a memoriza
- **WHEN** corren en la calle con diez tráficos nuevos el ejemplo de tráfico nuevo y el del mismo tráfico
- **THEN** el de tráfico nuevo choca, en promedio, menos veces

#### Scenario: El que memorizó, en su tráfico
- **WHEN** el ejemplo del mismo tráfico corre en el tráfico de práctica
- **THEN** llega a la meta sin chocar

#### Scenario: El del óvalo, en el óvalo
- **WHEN** el ejemplo del óvalo corre en el óvalo
- **THEN** llega a la meta

#### Scenario: El de las cuatro pistas
- **WHEN** el ejemplo de las cuatro pistas corre en el óvalo y en la calle con tráfico nuevo
- **THEN** llega a la meta en las dos
