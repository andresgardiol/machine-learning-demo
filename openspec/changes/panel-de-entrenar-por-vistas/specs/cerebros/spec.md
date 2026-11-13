# Spec Delta

## MODIFIED Requirements

### Requirement: Eliminar con confirmación
La biblioteca SHALL permitir eliminar cualquier cerebro, guardado o
autoguardado, solo después de una confirmación explícita que lo nombre. Nada
de la biblioteca MUST quedar sin poder eliminarse.

#### Scenario: Confirmar
- **WHEN** la persona elige eliminar "Prudente" y confirma
- **THEN** "Prudente" desaparece de la biblioteca

#### Scenario: Cancelar
- **WHEN** la persona elige eliminar "Prudente" y cancela
- **THEN** "Prudente" sigue en la biblioteca sin cambios

#### Scenario: Eliminar el entrenamiento anterior
- **WHEN** la persona elige eliminar el autoguardado "entrenamiento anterior" y confirma
- **THEN** desaparece de la biblioteca y no vuelve a aparecer hasta que se abandone otro entrenamiento

#### Scenario: Eliminar el entrenamiento en curso
- **WHEN** la persona elige eliminar el autoguardado del entrenamiento en curso
- **THEN** la confirmación avisa que volverá a guardarse solo al terminar la próxima generación; al confirmar desaparece, y reaparece cuando esa generación termina

#### Scenario: Biblioteca vacía
- **WHEN** la persona elimina todos los cerebros, guardados y autoguardados, con el entrenamiento en pausa
- **THEN** la biblioteca queda vacía, muestra el texto de biblioteca vacía y el contador de la pestaña de cerebros dice 0
