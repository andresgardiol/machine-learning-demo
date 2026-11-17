## MODIFIED Requirements

### Requirement: Guía de inicio
Con la guía activa, el panel SHALL ofrecer, plegado debajo de la tarjeta de consigna, un texto de inicio, de hasta 240
caracteres en cada idioma, que diga qué se está viendo (autos manejados por
redes con números al azar) y de dónde sale la generación siguiente: de los que
mejor manejaron, con selección automática, o del auto que la persona elija,
con selección manual. Los atajos de teclado MUST leerse en el control que
accionan y no en el texto de inicio. El texto se despliega con "Más sobre esta pestaña" (requisito *Texto de guía plegado* de `consigna-de-pestana`).

#### Scenario: Texto plegado
- **WHEN** la guía está activa y la persona entra a la pestaña
- **THEN** el texto de inicio está plegado debajo de la tarjeta de consigna y aparece al tocar "Más sobre esta pestaña"

#### Scenario: Guía activa
- **WHEN** la guía está activa y la persona despliega "Más sobre esta pestaña"
- **THEN** el panel muestra el texto de inicio

#### Scenario: Guía oculta
- **WHEN** la guía está oculta
- **THEN** el texto de inicio, los renglones de ayuda del tablero y las misiones no se muestran y el entrenamiento sigue igual

#### Scenario: Texto breve
- **WHEN** el panel mide 360 píxeles de ancho y la aplicación está en español o en inglés
- **THEN** el texto de inicio ocupa como mucho cinco renglones, con selección automática y con selección manual

#### Scenario: Atajos en los controles
- **WHEN** la persona busca cómo pausar, pasar de generación o acelerar con el teclado
- **THEN** lee la tecla en el botón de pausa, en el de siguiente generación y en la opción de velocidad máxima

#### Scenario: Guía con selección manual
- **WHEN** la persona elige "vos" en el ajuste de quién elige al padre
- **THEN** el texto de inicio pasa a decir que, cuando el líder haga algo prometedor, lo elija, y que la generación siguiente serán copias suyas con pequeños cambios

#### Scenario: Guía al volver a selección automática
- **WHEN** la persona vuelve a elegir la función de fitness
- **THEN** el texto de inicio vuelve a decir que los que mejor manejaron se copian con pequeños cambios
