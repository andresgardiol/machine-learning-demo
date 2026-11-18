## MODIFIED Requirements

### Requirement: La marcha es la acción principal
La acción principal de cada pestaña SHALL ser su control de marcha, el mismo en las seis:

| Pestaña | Control de marcha |
|---|---|
| El problema | Pausar o seguir |
| Reglas a mano | Pausar o seguir |
| Entrenar | Pausar o seguir, en la barra de abajo de la escena |
| Competir | Largar, pausar o reanudar |
| Inspeccionar | Reproducir o pausar |
| Laboratorio | Reproducir o pausar, salvo en Compuertas mientras se resuelve a mano (ver *A mano primero en Compuertas*) |

Que un control sea la acción principal MUST NOT cambiar lo que hace, su texto ni su atajo de teclado.

#### Scenario: El problema en marcha
- **WHEN** la persona entra a El problema y maneja sin chocar
- **THEN** la acción principal es el botón de pausar, y "Reiniciar" y "Tráfico nuevo" se ven como secundarias

#### Scenario: Laboratorio
- **WHEN** la persona entra al Laboratorio en Puntos o en Tu manejo, o en Compuertas después de resolverla a mano
- **THEN** la acción principal es el botón de reproducir, y "Agregar una capa oculta" y "Guardar como cerebro" se ven como secundarias

#### Scenario: Compuertas sin resolver
- **WHEN** la persona entra al Laboratorio en Compuertas y todavía no resolvió la compuerta a mano
- **THEN** no hay ninguna acción principal a la vista y el botón de reproducir se ve como secundaria

#### Scenario: Mismo comportamiento
- **WHEN** la persona usa cualquier botón que cambió de estilo, con el mouse o con su atajo
- **THEN** hace lo mismo que antes del cambio, con el mismo texto y el mismo tooltip

#### Scenario: Determinismo
- **WHEN** se repite el mismo recorrido con la misma semilla antes y después del cambio
- **THEN** la simulación, el entrenamiento y las carreras dan los mismos resultados: el cambio es solo visual

### Requirement: Estados que cambian la acción principal
Mientras dura su estado, la acción principal SHALL ser otra:

- con un choque a la vista en El problema, Reiniciar; en Reglas a mano, "Compará con los ejemplos"; en Inspeccionar, "Reintentar desde acá";
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

#### Scenario: Choque en Inspeccionar
- **WHEN** en Inspeccionar el auto choca
- **THEN** "Reintentar desde acá" es la única acción principal, "Reiniciar", "Elegir esta neurona" y el botón de reproducir se ven como secundarias, y al reiniciar o reintentar el botón de reproducir vuelve a ser la acción principal
