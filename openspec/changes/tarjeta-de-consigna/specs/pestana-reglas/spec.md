## MODIFIED Requirements

### Requirement: Guía de inicio
Con la guía activa, el panel SHALL ofrecer, plegado debajo de la tarjeta de consigna, un texto de inicio, de hasta 240
caracteres en cada idioma, que diga que el auto hace lo que dicen las reglas
escritas, y que invite a cambiarlas y a agregar otras. El texto se despliega con "Más sobre esta pestaña" (requisito *Texto de guía plegado* de `consigna-de-pestana`).

#### Scenario: Texto plegado
- **WHEN** la guía está activa y la persona entra a la pestaña
- **THEN** el texto de inicio está plegado debajo de la tarjeta de consigna y aparece al tocar "Más sobre esta pestaña"

#### Scenario: Guía activa
- **WHEN** la guía está activa y la persona despliega "Más sobre esta pestaña"
- **THEN** el panel muestra el texto de inicio

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el texto de inicio, la paleta de palabras, los renglones de ayuda del tablero y las misiones no se muestran, y el editor y el auto siguen funcionando igual
