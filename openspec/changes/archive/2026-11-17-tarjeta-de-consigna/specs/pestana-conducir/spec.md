## MODIFIED Requirements

### Requirement: Guía de inicio
Con la guía activa, el panel SHALL ofrecer, plegado debajo de la tarjeta de consigna, un texto de inicio, de hasta 240
caracteres en cada idioma, que diga qué se está viendo y qué probar. Las teclas de manejo SHALL leerse a la vista, en la consigna de la tarjeta. El texto MUST nombrar la cantidad de
carriles que la calle tiene en ese momento. El texto se despliega con "Más sobre esta pestaña" (requisito *Texto de guía plegado* de `consigna-de-pestana`).

#### Scenario: Texto plegado
- **WHEN** la guía está activa y la persona entra a la pestaña
- **THEN** el texto de inicio está plegado debajo de la tarjeta de consigna y aparece al tocar "Más sobre esta pestaña"

#### Scenario: Guía activa
- **WHEN** la guía está activa y la persona despliega "Más sobre esta pestaña"
- **THEN** el panel muestra el texto de inicio, y las teclas de manejo se leen en la consigna sin desplegar nada

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el texto de inicio y los renglones de ayuda del tablero no se muestran y el manejo funciona igual

#### Scenario: Carriles por defecto
- **WHEN** se abre la pestaña con la configuración por defecto
- **THEN** el texto de inicio habla de una calle de 3 carriles

#### Scenario: Carriles elegidos
- **WHEN** la persona elige cuatro carriles en la barra de escenario
- **THEN** el texto de inicio pasa a hablar de una calle de 4 carriles, en el idioma activo

#### Scenario: Texto breve
- **WHEN** el panel mide 360 píxeles de ancho y la aplicación está en español o en inglés
- **THEN** el texto de inicio ocupa como mucho cinco renglones y las teclas de manejo, como mucho dos
