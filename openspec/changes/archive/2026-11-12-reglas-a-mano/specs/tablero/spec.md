# Spec Delta

## ADDED Requirements

### Requirement: Tarjeta con editor
Una tarjeta del tablero SHALL poder contener un editor cuando lo que la
persona escribe es lo mismo que se ve ejecutarse en esa tarjeta. Fuera de ese
caso, el tablero MUST seguir sin controles: los controles viven en el panel.
Una tarjeta con editor SHALL cumplir lo mismo que las demás: título, tooltip,
plegado y reparto del alto.

#### Scenario: Editor del programa
- **WHEN** se abre la pestaña Reglas a mano
- **THEN** el tablero muestra el programa en una tarjeta donde se lo puede editar y donde se resaltan las líneas que se están cumpliendo

#### Scenario: Plegar la tarjeta del editor
- **WHEN** la persona pliega la tarjeta del programa
- **THEN** queda a la vista solo su título, el programa sigue manejando el auto y las demás tarjetas ocupan el alto libre

#### Scenario: El resto del tablero no cambia
- **WHEN** se abren las pestañas El problema y Entrenar
- **THEN** sus tableros siguen sin ningún control que cambie la simulación

#### Scenario: Atajos con el foco en el editor
- **WHEN** el foco está en el editor de una tarjeta y la persona presiona la barra espaciadora
- **THEN** se escribe un espacio y la simulación no se pausa
