# accesibilidad Specification

## Purpose
Asegura que la aplicación se pueda usar con teclado, con lector de pantalla,
con dictado por voz y con baja visión, tomando como referencia el nivel AA de
WCAG 2.2. Reúne los requisitos que valen para toda la interfaz y no son de
una pestaña en particular.

## Requirements

### Requirement: Atajos de una tecla desactivables
La aplicación SHALL ofrecer, junto al interruptor de guía, un interruptor
"Atajos", encendido por defecto y recordado entre visitas. Apagado, ningún
atajo de una sola tecla de carácter (barra espaciadora, letras) MUST
dispararse en ninguna pestaña, y los controles dejan de mostrar su atajo. Las
flechas para manejar y las teclas propias de cada control (Tab, Enter,
Escape) MUST seguir funcionando. El interruptor SHALL tener un tooltip, en
español y en inglés.

#### Scenario: Estado por defecto
- **WHEN** se abre la aplicación por primera vez
- **THEN** el interruptor está encendido y los atajos funcionan como siempre

#### Scenario: Atajos apagados
- **WHEN** la persona apaga el interruptor y presiona la barra espaciadora, N, R o V con el foco en el escenario
- **THEN** no pasa nada: el entrenamiento no se pausa, no cambia de generación, no se reinicia y la cámara no se mueve

#### Scenario: Controles sin su atajo a la vista
- **WHEN** los atajos están apagados
- **THEN** el botón de pausa dice "Pausar", sin "(espacio)", y lo mismo los demás controles que mostraban una tecla

#### Scenario: Manejar con las flechas
- **WHEN** los atajos están apagados y la persona maneja en El problema con las flechas
- **THEN** el auto responde igual que antes; las teclas W, A, S y D no lo mueven

#### Scenario: Volver a encenderlos
- **WHEN** la persona vuelve a encender el interruptor
- **THEN** los atajos y sus rótulos vuelven de inmediato, sin recargar

#### Scenario: Preferencia recordada
- **WHEN** la persona apaga los atajos y recarga la página
- **THEN** siguen apagados

#### Scenario: Tooltip
- **WHEN** la persona posa el cursor sobre el interruptor
- **THEN** un tooltip en el idioma activo explica que apaga los atajos de una tecla y que sirve a quien usa dictado por voz o toca teclas sin querer

#### Scenario: Encabezado sin desbordes
- **WHEN** la ventana mide 1366 píxeles de ancho, en español o en inglés
- **THEN** el interruptor nuevo, el de guía, el selector de idioma y las pestañas del recorrido se ven enteros

### Requirement: Límites de los controles con contraste
El borde o el contorno que permite reconocer un control (campos de texto,
opciones sin elegir, interruptores, deslizadores y botones con contorno) SHALL
tener un contraste de al menos 3:1 contra la superficie donde está. Las
líneas que solo separan zonas, sin delimitar un control, MAY conservar un
contraste menor.

#### Scenario: Campo de texto
- **WHEN** se mide el borde del campo del nombre de un cerebro contra el panel
- **THEN** el contraste es de 3:1 o más

#### Scenario: Opciones sin elegir
- **WHEN** se mide el contorno de un grupo de opciones (carriles, velocidades, funciones de fitness) contra el panel
- **THEN** el contraste es de 3:1 o más

#### Scenario: Sobre el fondo y sobre las tarjetas
- **WHEN** se mide el borde de un control ubicado sobre el fondo del escenario o sobre una tarjeta del tablero
- **THEN** el contraste es de 3:1 o más en los dos casos

#### Scenario: Estado sin depender del color
- **WHEN** una opción está elegida, un interruptor encendido o un control deshabilitado
- **THEN** ese estado se distingue también por algo que no es el color: relleno, posición, peso de la letra o una marca

### Requirement: Tamaño mínimo de los controles
Todo control que se acciona con el cursor SHALL medir al menos 24 por 24
píxeles, o tener libre a su alrededor el espacio que le falta para llegar a
esa medida sin encimarse con otro control.

#### Scenario: Botones chicos
- **WHEN** se miden los botones de reiniciar y de población nueva, los de zoom y las palabras de la paleta de Reglas a mano
- **THEN** cada uno mide 24 píxeles o más de alto y de ancho, o guarda esa distancia con sus vecinos

#### Scenario: Todas las pestañas
- **WHEN** se miden todos los controles accionables de las tres pestañas con la ventana en 1440×900
- **THEN** ninguno queda por debajo de la medida

### Requirement: Escenario descrito en texto
El escenario SHALL tener una descripción en texto, disponible para lectores de
pantalla, que diga qué pista se ve y en qué estado está lo que pasa: en
marcha, en pausa o terminado, con el dato principal de la pestaña. La
descripción MUST mantenerse al día sin anunciarse sola a cada momento.

#### Scenario: El problema
- **WHEN** un lector de pantalla llega al escenario de El problema con el auto en marcha
- **THEN** lee que es la calle recta de tres carriles con tráfico, que el auto está en marcha y cuántos metros lleva

#### Scenario: Entrenar
- **WHEN** un lector de pantalla llega al escenario de Entrenar
- **THEN** lee la pista, el número de generación y cuántos autos siguen en carrera

#### Scenario: Sin interrupciones
- **WHEN** el entrenamiento corre y la persona está leyendo otra parte de la página con el lector de pantalla
- **THEN** la descripción del escenario no la interrumpe; solo se anuncian los avisos que ya se anunciaban, como el choque o el fin de una generación

#### Scenario: Ver como la máquina
- **WHEN** está activo "ver como la máquina"
- **THEN** la descripción dice que la pista no se muestra y que solo se ven el auto y sus sensores
