# Proposal

## Why

El panel de Entrenar se quedó sin lugar. Cada cambio reciente le sumó ajustes
y hubo que apretar algo cada vez. Hoy tiene cuatro problemas, señalados por el
dueño con capturas y analizados con una crítica de diseño:

- **Los ajustes más interesantes están a dos niveles de plegado.** Para
  cambiar la función de fitness hay que abrir "Avanzado" y después
  "Evolución". Es navegación que no aporta nada y esconde lo que más conviene
  tocar al experimentar.
- **El selector de pista cambia de lugar.** En El problema y en Reglas a mano
  está a la vista en el panel; en Entrenar, dentro de Avanzado > Escenario. Y
  en los tres casos está lejos de lo que controla, que es el escenario.
- **Los cerebros compiten por lugar con el entrenamiento.** Guardar suma
  renglones y el panel pasa a desplazarse (de 851 a entre 916 y 957 px de
  contenido). La biblioteca, con sus acciones por cerebro, vive plegada al
  final del panel.
- **Dos nombres de pista no describen nada:** "Riñón" y "Gran premio".

Es infraestructura de interfaz: no hace visible un concepto nuevo de ML.
Habilita que los ajustes que sí los muestran (qué se premia, cuántos se
conservan, en qué pistas se practica) queden a un clic y a un solo nivel, y
que guardar y comparar cerebros, que es la base de la pestaña Competir, tenga
un lugar propio.

## What Changes

- **El panel de Entrenar pasa a tener tres vistas**, con tres pestañas siempre
  visibles arriba del panel:
  - **Entrenamiento:** lo de hoy menos las dos secciones plegables: guía,
    controles de marcha, interruptores de vista, población, mutación, guardar
    y misiones. Es la vista que se ve al abrir.
  - **Ajustes:** los cuatro grupos (evolución, escenario, red y sensores) a un
    solo nivel, con evolución abierto y la función de fitness primero.
  - **Cerebros:** guardar con nombre y la biblioteca, con todo el alto del
    panel.
- **Desaparece la sección "Avanzado" de Entrenar** y, con ella, el segundo
  nivel de plegado.
- **La pestaña "Ajustes" avisa cuando hay cambios esperando** a la próxima
  generación, se esté en la vista que se esté.
- **Guardar deja de sumar renglones:** en la vista de entrenamiento hay un
  solo botón, que guarda con un nombre sugerido o actualiza el cerebro que el
  entrenamiento ya tiene. Ponerle nombre y guardar como nuevo se hace en la
  vista de cerebros.
- **El selector de pista pasa al escenario**, en el mismo lugar en las tres
  pestañas, con una miniatura de cada trazado. En Entrenar permite marcar
  varias. Sale del panel de El problema y de Reglas a mano, y del grupo de
  escenario de Entrenar.
- **Nombres de pista descriptivos:** "Óvalo con chicana" en lugar de "Riñón" y
  "Circuito de curvas" en lugar de "Gran premio".
- **Actualizar un cerebro se puede deshacer:** como el botón de guardar pasa
  a pisar con un clic el cerebro ya guardado, el mensaje ofrece "Deshacer".
- **Textos coherentes en Entrenar:** una sola palabra para los ajustes, "el
  fitness" siempre en masculino y misiones en imperativo.
- **Los dos componentes nuevos se especifican para teclado y lector de
  pantalla** (pestañas de vista y menú del selector).
- **Accesibilidad de toda la aplicación**, por decisión del dueño de que este
  cambio arregle todo lo que encontró la revisión:
  - **Interruptor "Atajos"** junto al de guía, para apagar los atajos de una
    sola tecla.
  - **Bordes de los controles con contraste de 3:1** (hoy 1,66:1 sobre el
    panel). Cambia el aspecto de campos, opciones y botones en toda la app.
  - **El tooltip se puede alcanzar con el cursor** sin que desaparezca.
  - **Ningún control accionable mide menos de 24 por 24 píxeles.**
  - **El escenario tiene una descripción en texto** para lectores de
    pantalla.

### Filtro de entrada

| Feature | ¿Qué concepto hace visible? | ¿Se entiende sola? | ¿El mentor puede ignorarla u ocultarla? | ¿Mal uso y vuelta atrás? |
|---|---|---|---|---|
| Vistas del panel | Ninguno propio: deja a un clic los ajustes que muestran qué se premia y qué se conserva | Tres pestañas con nombre; al abrir se ve la de siempre | Quien no las toca ve menos cosas que hoy | Cambiar de vista no cambia nada del entrenamiento; se vuelve con un clic |
| Aviso de cambios pendientes | Un ajuste rige desde la generación siguiente, no al instante | Una marca en la pestaña, con su texto para lectores de pantalla | Solo aparece si hay cambios | Desaparece sola al empezar la generación |
| Guardar con un clic | Un cerebro es el resultado de un entrenamiento y se puede conservar | Un botón que dice lo que hace | La vista de cerebros es opcional | Un cerebro guardado se renombra o se elimina en la biblioteca |
| Selector de pista en el escenario | Cada pista plantea un problema distinto | Está junto a lo que cambia, con la silueta de cada trazado | La calle recta sigue siendo la pista por defecto | Elegir otra pista reinicia el intento o rige desde la generación siguiente; se vuelve eligiendo la calle recta |
| Interruptor "Atajos" | Ninguno de ML: evita que una tecla suelta dispare una acción | Un interruptor con nombre y tooltip, junto al de guía | Está encendido por defecto; quien no lo toca no nota nada | Se vuelve a encender con un clic |
| Bordes con contraste, tooltip alcanzable, tamaño mínimo y escenario descrito | Ninguno de ML: hacen usable la app con baja visión, teclado y lector de pantalla | No agregan nada que aprender | No aplica | No aplica |
| Nombres descriptivos | La dificultad crece de una pista a la otra | El nombre dice qué tiene el trazado | No aplica | No aplica |

### A quién sirve

- **Principiante:** abre Entrenar y ve la vista de siempre, con dos secciones
  plegables menos. No necesita las otras dos vistas para ver aprender a la
  red.
- **Mentor:** tiene todos los ajustes a un clic y a un solo nivel, puede
  dejar abierta la vista de ajustes mientras explica, y arma su biblioteca de
  cerebros en una vista con lugar para leer los datos de cada uno.

### Fuera de alcance

- Cambiar qué ajustes existen, sus rangos o sus valores por defecto.
- Cambios al panel de El problema y de Reglas a mano, salvo sacar de ahí el
  selector de pista.
- Comparar cerebros entre sí o hacerlos competir: es la pestaña Competir.
- Eliminar o renombrar los autoguardados, cerebros incluidos y otras ideas de
  la biblioteca anotadas en PENDIENTES.
- Cambiar los identificadores internos de las pistas: los cerebros guardados
  siguen valiendo.
- El tablero y el escenario, salvo el selector nuevo y la descripción en
  texto.
- Cambiar qué atajo hace cada cosa: solo se pueden apagar todos.
- Una auditoría completa de accesibilidad: la revisión fue de código y de
  contrastes. Falta probar con un lector de pantalla y con una herramienta
  automática; queda como verificación del dueño.

## Capabilities

### New Capabilities

- `accesibilidad`: requisitos de toda la interfaz para teclado, lector de
  pantalla, dictado por voz y baja visión: atajos desactivables, contraste de
  los límites de los controles, tamaño mínimo y descripción del escenario.

### Modified Capabilities

- `pestana-entrenar`: el panel se reparte en tres vistas; los ajustes quedan
  a un solo nivel; guardar pasa a un botón en la vista de entrenamiento y la
  biblioteca a una vista propia; las pistas del entrenamiento se marcan en el
  selector del escenario.
- `estructura-app`: un panel con más contenido del que entra usa vistas con
  pestañas en lugar de secciones plegables anidadas.
- `vista-escenario`: se agrega el selector de pista sobre el escenario, común
  a todas las pestañas.
- `pestana-conducir`: el selector de pista sale del panel y pasa al
  escenario.
- `pista`: nombres visibles de las pistas.
- `ayuda-contextual`: el tooltip sigue a la vista mientras el cursor está
  sobre él.

## Impact

- **Interfaz común:** módulo nuevo para las pestañas de vista del panel
  (`src/ui/`), y el selector de pista como parte de la vista del escenario
  (`src/render/view.js` o un módulo vecino), con miniaturas hechas con el
  propio catálogo de `src/core/circuits.js`.
- **Pestaña 3:** `src/tabs/train/index.js` se reorganiza en tres vistas;
  `src/ui/library-view.js` pasa a ocupar la vista de cerebros.
- **Pestañas 1 y 2:** dejan de armar el selector de pista en el panel
  (`src/tabs/shared/`).
- **Textos y estilos:** `src/i18n/es.js`, `en.js` y `styles/app.css`. Cambian
  los nombres visibles de dos pistas.
- **Toda la interfaz:** `styles/tokens.css` y `styles/app.css` (color nuevo
  para los límites de los controles y tamaños mínimos), `src/ui/tooltips.js`
  (tooltip alcanzable), `src/ui/shortcuts.js` y `src/ui/preferences.js`
  (preferencia de atajos), `src/ui/app.js` (interruptor en el encabezado) y
  `src/render/view.js` (descripción del escenario).
- **Núcleo:** sin cambios.
- **Cerebros guardados:** siguen valiendo; solo cambia el nombre con que se
  muestran dos pistas.
- **Pruebas:** nuevas para la lógica sin DOM de las vistas y del selector; las
  de largo de textos suman los nombres nuevos.
- **Rendimiento:** las vistas que no están a la vista no se actualizan en cada
  cuadro.
- **Dependencias y build:** ninguna nueva.
