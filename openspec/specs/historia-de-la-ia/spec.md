# historia-de-la-ia Specification

## Purpose
Cuenta en pocos minutos de dónde salen las ideas que la práctica usa, de la primera neurona artificial
a los modelos de lenguaje, y sirve de mapa: cada momento apunta al capítulo y a la pestaña que lo tocan.

## Requirements

### Requirement: Línea de tiempo en película
La historia SHALL mostrarse como una línea de tiempo que queda fija a la vista mientras pasan los hitos,
y que marca el hito que se lee. Cada marca SHALL llevar a su hito. La historia SHALL abrir en el primer
hito, sin configurar nada.

#### Scenario: Avanzar por la historia
- **WHEN** una persona desplaza la historia
- **THEN** la línea de tiempo avanza hasta el hito que está a la vista

#### Scenario: Saltar a un hito
- **WHEN** una persona elige la marca de 1986 en la línea de tiempo
- **THEN** la historia va al hito de 1986

#### Scenario: Volver al principio
- **WHEN** una persona elige la primera marca
- **THEN** la historia vuelve al hito de 1943

### Requirement: Hitos de 1943 a los modelos de lenguaje
La historia SHALL cubrir, en orden, desde la neurona de 1943 hasta los modelos de lenguaje, incluyendo
los dos inviernos de la inteligencia artificial. Cada hito SHALL tener un año, un título, quién lo hizo
cuando corresponde, un dibujo de la idea y un texto de dos párrafos como máximo.

#### Scenario: Un hito completo
- **WHEN** una persona lee el hito de 1958
- **THEN** ve el año, el título, el nombre de Rosenblatt, un dibujo del perceptrón y un texto corto

#### Scenario: Los inviernos
- **WHEN** una persona recorre la historia entera
- **THEN** encuentra los dos inviernos entre los hitos, cada uno en su época

### Requirement: Cada hito apunta a la práctica
Cada hito SHALL decir qué capítulo de teoría lo explica y en qué pestaña de la práctica se toca. Si el
capítulo no está escrito SHALL decir "próximamente". Si la práctica no tiene nada sobre ese hito, SHALL
decirlo en lugar de nombrar una pestaña.

#### Scenario: Hito con capítulo y pestaña
- **WHEN** una persona lee el hito de 1969
- **THEN** ve el capítulo "Una recta no alcanza", con su enlace, y la pestaña Laboratorio, XOR

#### Scenario: Hito sin práctica
- **WHEN** una persona lee el hito de los Transformers
- **THEN** el hito dice que la práctica todavía no tiene nada sobre eso

### Requirement: Historia honesta
Los dibujos de la historia SHALL presentarse como dibujos de la idea y no como datos. Cuando un hecho
está discutido o simplificado, el texto MUST decirlo con palabras llanas, sin afirmar más de lo que las
fuentes sostienen.

#### Scenario: Un hecho discutido
- **WHEN** una persona lee sobre el libro de 1969 y el invierno
- **THEN** el texto dice que el libro ayudó a enfriar el entusiasmo, sin decir que lo causó

#### Scenario: Un descubrimiento repetido
- **WHEN** una persona lee el hito de 1986
- **THEN** el texto dice que la técnica ya se había descubierto antes
