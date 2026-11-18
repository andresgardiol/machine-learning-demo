# Spec Delta

## MODIFIED Requirements

### Requirement: Controles de las misiones de Reglas a mano
Las misiones de Reglas a mano SHALL mostrar este control.

| Misión | Control |
|---|---|
| Superá 3 vehículos sin chocar | El programa (las fichas o el editor, según la vista) |
| Superá 10 vehículos sin chocar | El programa (las fichas o el editor, según la vista) |
| Superá 10 en 3 tráficos distintos | Tráfico nuevo |

#### Scenario: El editor
- **WHEN** la persona toca "Mostrame" junto a "Superá 3 vehículos sin chocar"
- **THEN** el programa, en la vista que está a la vista, queda marcado y con el foco, sin cambiar el texto ni el cursor
