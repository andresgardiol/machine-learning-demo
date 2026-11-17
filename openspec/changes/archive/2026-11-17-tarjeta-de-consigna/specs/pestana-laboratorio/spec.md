## MODIFIED Requirements

### Requirement: Guía y misiones del Laboratorio
Con la guía activa, el panel SHALL ofrecer, plegado debajo de la tarjeta de consigna, un texto breve que diga qué se
está viendo y qué probar primero, y SHALL terminar, a la vista, con tres misiones en tres
renglones. Con compuertas: resolver AND a mano, resolver OR a mano y resolver
XOR con una capa oculta. Con puntos o tu manejo: seguir una corrección entera
paso a paso, hacer que la red memorice, y guardar un cerebro que aprendió a
manejar imitando. Las misiones MUST NOT bloquear nada. El texto se despliega con "Más sobre esta pestaña" (requisito *Texto de guía plegado* de `consigna-de-pestana`).

#### Scenario: Texto plegado
- **WHEN** la guía está activa y la persona entra a la pestaña
- **THEN** el texto de inicio está plegado debajo de la tarjeta de consigna y aparece al tocar "Más sobre esta pestaña"

#### Scenario: Guía visible
- **WHEN** la guía está activa con puntos o tu manejo y la persona despliega "Más sobre esta pestaña"
- **THEN** el texto dice que la red aprende de ejemplos, que el fondo es lo que contesta y qué probar primero

#### Scenario: Guía de las compuertas
- **WHEN** la guía está activa con AND elegida y la persona despliega "Más sobre esta pestaña"
- **THEN** el texto dice que la neurona tiene que contestar sí solo cuando las dos entradas valen 1, que los pesos y el sesgo se mueven sobre la red, y que "Paso" muestra cómo lo corregiría el aprendizaje

#### Scenario: Guía oculta
- **WHEN** la persona apaga la guía
- **THEN** el texto y las misiones no se muestran

#### Scenario: Misión de AND a mano
- **WHEN** la tabla llega a 4 de 4 con AND sin que el aprendizaje haya dado ningún paso desde que se eligió AND
- **THEN** la misión de AND queda cumplida

#### Scenario: Resuelta aprendiendo
- **WHEN** la tabla llega a 4 de 4 con OR después de que el aprendizaje dio pasos
- **THEN** la misión de OR no se cumple, y un texto junto a la tabla dice que esta vez la resolvió el aprendizaje

#### Scenario: Misión de XOR
- **WHEN** la tabla llega a 4 de 4 con XOR y una capa oculta, a mano o aprendiendo
- **THEN** la misión de XOR queda cumplida

#### Scenario: Misión de la corrección
- **WHEN** la persona avanza paso a paso las cuatro fases de un mismo ejemplo
- **THEN** la misión de la corrección queda cumplida, se vea o no en ese momento

#### Scenario: Misión de memorizar
- **WHEN** aparece el aviso de que la red está memorizando
- **THEN** la misión de memorizar queda cumplida

#### Scenario: Misión de manejar
- **WHEN** la persona guarda un cerebro desde el Laboratorio
- **THEN** la misión de manejar queda cumplida

#### Scenario: Misión cumplida con la tarjeta abierta
- **WHEN** una misión se cumple mientras la tarjeta de una neurona está abierta
- **THEN** al cerrar la tarjeta la misión se ve cumplida

#### Scenario: Términos con su nombre
- **WHEN** la persona posa el cursor sobre "época", "tasa de aprendizaje", "culpa", "sobreajuste" o "compuerta"
- **THEN** un tooltip dice qué es con palabras llanas y con su nombre técnico
