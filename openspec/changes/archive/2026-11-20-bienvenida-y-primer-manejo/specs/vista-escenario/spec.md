## MODIFIED Requirements

### Requirement: Paneo
La vista SHALL permitir desplazar el encuadre arrastrando con el mouse. Si la
cámara sigue a un auto, el arrastre MUST correr el lugar del auto en la
pantalla y la cámara MUST seguir siguiéndolo desde ese lugar. MUST dejar de
seguirlo solo si el arrastre sacaría al auto de la pantalla, hasta que se
restablezca la vista. Con el circuito entero a la vista, o sin auto seguido,
el arrastre MUST desplazar el encuadre y dejar la cámara libre.

#### Scenario: Arrastrar la vista
- **WHEN** la cámara sigue al auto y la persona arrastra el escenario 100 píxeles hacia la derecha
- **THEN** el encuadre se desplaza con el arrastre y el auto queda 100 píxeles más a la derecha que antes

#### Scenario: Sigue al auto después de arrastrar
- **WHEN** la persona arrastró el escenario y el auto sigue avanzando
- **THEN** el auto permanece en el lugar de la pantalla donde lo dejó el arrastre y la pista se desplaza

#### Scenario: Indicador de seguimiento
- **WHEN** la persona arrastra el escenario sin sacar al auto de la pantalla
- **THEN** el botón de seguir al auto sigue mostrando que la cámara sigue al auto

#### Scenario: Arrastre que saca al auto de la pantalla
- **WHEN** la persona arrastra el escenario hasta que el auto quedaría fuera de la pantalla
- **THEN** el encuadre se desplaza con el arrastre y la cámara deja de seguir al auto

#### Scenario: Circuito entero a la vista
- **WHEN** el zoom está al mínimo en un circuito y la persona arrastra el escenario
- **THEN** el encuadre se desplaza con el arrastre y la cámara deja de seguir al auto

#### Scenario: Clic sin arrastre
- **WHEN** la persona hace clic sobre el escenario sin arrastrar
- **THEN** la cámara sigue al auto en el mismo lugar de la pantalla

#### Scenario: Mismo resultado con el mismo arrastre
- **WHEN** se repite la misma secuencia de arrastres sobre la misma pista, la misma semilla y el mismo tamaño del escenario
- **THEN** el auto queda en el mismo lugar de la pantalla

### Requirement: Restablecer la vista
La vista SHALL ofrecer un control y un atajo de teclado que devuelven la cámara
al seguimiento del auto y al zoom por defecto, con el auto en su lugar de
siempre en la pantalla.

#### Scenario: Volver al auto
- **WHEN** la persona cambió el zoom y paneó, y luego usa restablecer la vista
- **THEN** la cámara vuelve a seguir al auto con el zoom por defecto

#### Scenario: Deshacer un arrastre
- **WHEN** la persona arrastró el escenario sin perder el seguimiento y luego usa restablecer la vista
- **THEN** el auto vuelve a su lugar de siempre en la pantalla

#### Scenario: Reinicio de la simulación
- **WHEN** se reinicia la simulación
- **THEN** la cámara vuelve a seguir al auto
