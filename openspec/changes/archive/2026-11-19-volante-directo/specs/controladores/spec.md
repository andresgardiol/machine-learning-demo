## MODIFIED Requirements

### Requirement: Controlador de teclado
El sistema SHALL ofrecer un controlador que permite a una persona manejar con
las flechas del teclado y también con las teclas W, A, S y D, admitiendo varias
teclas a la vez. Cada control se devuelve en todos los cuadros en que su tecla está apretada, desde el primero.

#### Scenario: Flecha arriba
- **WHEN** la persona mantiene presionada la flecha arriba o la tecla W
- **THEN** el controlador devuelve avanzar

#### Scenario: Dos teclas a la vez
- **WHEN** la persona mantiene presionadas la flecha arriba y la flecha izquierda
- **THEN** el controlador devuelve avanzar e izquierda

#### Scenario: Soltar la tecla
- **WHEN** la persona suelta todas las teclas
- **THEN** el controlador no devuelve ningún control accionado

#### Scenario: Respuesta inmediata
- **WHEN** la persona aprieta la flecha izquierda
- **THEN** el controlador devuelve izquierda desde ese mismo cuadro

## REMOVED Requirements

### Requirement: Volante suave
**Reason**: El dueño lo probó a mano y el auto tardaba demasiado en responder a las flechas.
**Migration**: El controlador de teclado vuelve a devolver izquierda y derecha mientras la flecha está apretada, sin subida.
