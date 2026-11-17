## MODIFIED Requirements

### Requirement: Guía, leyenda y misiones
Con la guía activa, el panel SHALL ofrecer, plegado debajo de la tarjeta de consigna, un texto breve que diga qué se
está viendo, y SHALL mostrar a la vista una leyenda de cómo se lee la red (colores, trazos y relleno) y
tres misiones con su progreso: seguir la cuenta de una neurona paso a paso,
cambiar una decisión de la red moviendo una entrada a mano, y apagar una
neurona y ver qué cambia. Las misiones SHALL ocupar tres renglones, uno cada
una, y MUST NOT bloquear nada. Con algo elegido, el texto cede su lugar. El texto se despliega con "Más sobre esta pestaña" (requisito *Texto de guía plegado* de `consigna-de-pestana`).

#### Scenario: Texto plegado
- **WHEN** la guía está activa y la persona entra a la pestaña
- **THEN** el texto de inicio está plegado debajo de la tarjeta de consigna y aparece al tocar "Más sobre esta pestaña"

#### Scenario: Guía visible
- **WHEN** la guía está activa y la persona despliega "Más sobre esta pestaña"
- **THEN** el texto dice que eso es la red del cerebro que maneja, que cada círculo es una neurona y cada línea un peso, y qué probar primero

#### Scenario: Guía oculta
- **WHEN** la persona apaga la guía
- **THEN** el texto, la leyenda y las misiones no se muestran

#### Scenario: Misión de la cuenta
- **WHEN** la persona avanza paso a paso las cuatro operaciones de una misma neurona
- **THEN** la primera misión queda cumplida

#### Scenario: Misión de la entrada
- **WHEN** la persona cambia una entrada a mano y la decisión de la red cambia
- **THEN** la segunda misión queda cumplida

#### Scenario: Misión de apagar
- **WHEN** la persona apaga una neurona y reproduce al menos tres segundos
- **THEN** la tercera misión queda cumplida

#### Scenario: Misiones compactas
- **WHEN** el panel mide 360 píxeles de ancho, en español o en inglés
- **THEN** las tres misiones ocupan tres renglones, con su estado en el mismo renglón, sin un recuadro que se estire

#### Scenario: Términos con su nombre
- **WHEN** la persona posa el cursor sobre "sesgo", "activación" o "tabla de pesos"
- **THEN** un tooltip dice qué es con palabras llanas y con su nombre técnico

#### Scenario: Con algo elegido
- **WHEN** hay una neurona o una conexión elegida
- **THEN** el texto de arriba del panel no se muestra, las misiones siguen a la vista y el detalle usa ese lugar

#### Scenario: Leyenda corta
- **WHEN** la guía está activa
- **THEN** la leyenda ocupa cinco renglones o menos: el signo, el grosor, el brillo y el relleno, el sesgo, y un renglón con las marcas de elegida, en curso, apagada y cambiada
