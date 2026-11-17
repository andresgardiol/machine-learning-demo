## MODIFIED Requirements

### Requirement: Guía de inicio
Con la guía activa, el panel SHALL ofrecer, plegado debajo de la tarjeta de consigna, un texto breve que diga qué se
está viendo y qué probar: correr contra un cerebro y un programa, y cambiar de
pista para mirar en la tabla quién sigue andando donde nunca practicó. El texto se despliega con "Más sobre esta pestaña" (requisito *Texto de guía plegado* de `consigna-de-pestana`).

#### Scenario: Texto plegado
- **WHEN** la guía está activa y la persona entra a la pestaña
- **THEN** el texto de inicio está plegado debajo de la tarjeta de consigna y aparece al tocar "Más sobre esta pestaña"

#### Scenario: Guía visible
- **WHEN** la guía está activa y la persona despliega "Más sobre esta pestaña"
- **THEN** el texto dice que los autos son fantasmas que no se chocan entre sí, que cada uno maneja con lo que aprendió o con sus reglas, y que cambiar de pista muestra quién generaliza

#### Scenario: Guía oculta
- **WHEN** la persona apaga la guía
- **THEN** el texto y las misiones no se muestran y el panel empieza por los controles de la carrera

#### Scenario: Texto breve
- **WHEN** el panel mide 360 píxeles de ancho, en español o en inglés
- **THEN** el texto de inicio ocupa como mucho cinco renglones
