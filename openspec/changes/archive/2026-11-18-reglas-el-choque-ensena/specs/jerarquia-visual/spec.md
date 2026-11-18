# Spec Delta

## MODIFIED Requirements

### Requirement: Estados que cambian la acción principal
Mientras dura su estado, la acción principal SHALL ser otra:

- con un choque a la vista en El problema, Reiniciar; en Reglas a mano, "Compará con los ejemplos";
- en Entrenar, con la selección manual esperando una elección, Elegir al líder;
- en Competir, con la carrera terminada, Otra carrera.

Al terminar ese estado, la marcha SHALL volver a ser la acción principal.

#### Scenario: Choque y vuelta atrás
- **WHEN** en El problema el auto choca y aparece el aviso de choque
- **THEN** "Reiniciar" del aviso es la única acción principal y el botón de pausar se ve como secundaria
- **WHEN** la persona reinicia
- **THEN** el aviso desaparece y el botón de pausar vuelve a ser la acción principal

#### Scenario: Entrenar con selección manual
- **WHEN** en Entrenar la selección es manual y la generación espera que la persona elija
- **THEN** "Elegir al líder" es la acción principal y el botón de pausar se ve como secundaria
- **WHEN** la persona elige y arranca la generación siguiente
- **THEN** el botón de pausar vuelve a ser la acción principal

#### Scenario: Carrera terminada
- **WHEN** en Competir la carrera termina
- **THEN** "Otra carrera" es la única acción principal

#### Scenario: Choque en Reglas a mano
- **WHEN** en Reglas a mano el auto choca, con el reintento automático encendido o apagado
- **THEN** "Compará con los ejemplos" es la única acción principal, Reiniciar y "Escribir una regla para este caso" se ven como secundarias, y al reiniciar la marcha vuelve a ser la acción principal
