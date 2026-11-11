# internacionalizacion Specification

## Purpose

Permite usar toda la aplicación en español o en inglés, cambiando de idioma en
cualquier momento sin perder lo que se estaba haciendo, para enseñar en español
y mostrar el proyecto a quien lee inglés.

## Requirements

### Requirement: Dos idiomas completos
Todo texto visible de la aplicación SHALL existir en español y en inglés. No
MUST quedar ningún texto visible que no cambie con el idioma.

#### Scenario: Mismos textos en ambos idiomas
- **WHEN** se ejecuta la verificación automática de textos
- **THEN** cada texto definido en español tiene su equivalente en inglés y viceversa

#### Scenario: Aplicación en inglés
- **WHEN** la persona usa la aplicación en inglés y recorre la primera pestaña, sus tooltips y los créditos
- **THEN** no aparece ningún texto en español

### Requirement: Selector de idioma
La aplicación SHALL mostrar siempre un selector para alternar entre español e
inglés. El selector SHALL tener un tooltip que diga qué hace y por qué importa,
en ambos idiomas.

#### Scenario: Selector siempre presente
- **WHEN** la persona está en cualquier pestaña
- **THEN** el selector de idioma está visible en el mismo lugar

### Requirement: Cambio de idioma en vivo
Al cambiar de idioma, todos los textos visibles SHALL actualizarse de inmediato,
sin recargar la página ni reiniciar o pausar la simulación.

#### Scenario: Cambiar de idioma mientras se maneja
- **WHEN** la persona cambia de español a inglés con el auto en movimiento
- **THEN** todos los textos pasan a inglés y el auto sigue en la misma posición, con la misma velocidad y el mismo tráfico

#### Scenario: Volver al idioma anterior
- **WHEN** la persona vuelve a elegir español
- **THEN** todos los textos vuelven a español

### Requirement: Idioma inicial
En la primera visita, la aplicación SHALL abrir en español si el idioma
preferido del navegador es español, y en inglés en cualquier otro caso. Una
preferencia recordada MUST tener prioridad sobre el idioma del navegador.

#### Scenario: Navegador en español
- **WHEN** una persona con el navegador en español abre la aplicación por primera vez
- **THEN** la aplicación abre en español

#### Scenario: Navegador en otro idioma
- **WHEN** una persona con el navegador en francés abre la aplicación por primera vez
- **THEN** la aplicación abre en inglés

#### Scenario: Preferencia recordada
- **WHEN** una persona con el navegador en español eligió inglés en una visita anterior
- **THEN** la aplicación abre en inglés

### Requirement: Texto faltante
Si a un texto le falta la versión en el idioma activo, la aplicación SHALL
mostrar la versión en el otro idioma en lugar de un espacio vacío o un
identificador interno.

#### Scenario: Falta la versión en inglés
- **WHEN** la aplicación está en inglés y un texto solo existe en español
- **THEN** se muestra el texto en español
