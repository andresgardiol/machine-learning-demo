# Spec Delta

## ADDED Requirements

### Requirement: Nombres de las pistas
Las pistas SHALL mostrarse con nombres que describen su trazado: "Calle
recta", "Óvalo", "Óvalo con chicana" (el riñón de esta spec) y "Circuito de
curvas" (el gran premio de esta spec), y sus equivalentes en inglés. El nombre
MUST ser el mismo en todo lugar donde se nombra una pista: el selector, el
rótulo sobre el escenario y los datos de un cerebro. Los cerebros ya
guardados MUST seguir leyéndose bien con los nombres nuevos.

#### Scenario: Selector
- **WHEN** la persona abre el selector de pista
- **THEN** lee, en este orden, "Calle recta", "Óvalo", "Óvalo con chicana" y "Circuito de curvas"

#### Scenario: Mismo nombre en todos lados
- **WHEN** una generación corre en el circuito más largo y después se guarda su campeón
- **THEN** el rótulo sobre el escenario, el selector y los datos del cerebro dicen "Circuito de curvas"

#### Scenario: Cerebro anterior
- **WHEN** se abre la biblioteca con un cerebro guardado antes de este cambio, entrenado en el segundo circuito
- **THEN** sus datos dicen que se entrenó en "Óvalo con chicana"

#### Scenario: Palabra poco conocida
- **WHEN** la persona posa el cursor sobre "Óvalo con chicana" en el selector
- **THEN** el tooltip dice que una chicana es un zigzag corto que obliga a doblar a un lado y enseguida al otro

#### Scenario: Inglés
- **WHEN** la aplicación está en inglés
- **THEN** las pistas se llaman "Straight street", "Oval", "Oval with chicane" y "Curves circuit"
