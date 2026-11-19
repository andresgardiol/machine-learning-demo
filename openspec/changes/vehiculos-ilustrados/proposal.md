# Proposal

## Why

Hoy el auto y el tráfico se dibujan como rectángulos redondeados con un parabrisas y cuatro luces (`drawVehicle` en `src/render/view.js`). Desde `trafico-vivo` hay motos, autos, camionetas y camiones, pero con una silueta provisoria. Al dueño le gustó mucho el auto de la vista previa (`assets/og-image.png`): verde, visto desde arriba, con brillo, sombra suave y una estética mitad realista y mitad caricatura. Pidió llevarla al auto que se maneja y a todo el tráfico, y que el diseño lo haga Fable 5.2 medium.

**Qué habilita:** no hace visible un concepto nuevo. Hace que la escena, donde se ven todos los conceptos (percepción, decisión, choque, generalización), se lea mejor y den ganas de mirarla. El frente, el tamaño y el tipo de cada vehículo se reconocen de un vistazo, y eso ayuda a entender qué está viendo cada sensor.

## What Changes

- **Cinco dibujos nuevos** con la estética de la vista previa: el auto del conductor y los cuatro tipos del tráfico (moto, auto, camioneta y camión), vistos desde arriba, con volumen, vidrios, brillos y una sombra suave.
- **Dibujos en capas**:
  - una capa de carrocería de un solo color, que se pinta con el color que toque: el verde propio, el ámbar del tráfico, los seis colores de Competir o el del choque;
  - una capa de detalle común a todos los colores: sombras, vidrios, brillos y luces.

  Así el mismo dibujo sirve para todos los usos sin hacer un dibujo por color.
- **Honestidad del contorno.** La carrocería, con espejos y paragolpes, queda siempre dentro del contorno de choque. Solo la sombra puede salir apenas, y es tenue.
- **Los faros no se confunden con los sensores.** El cono de luz de la V2 se acorta y se suaviza para que no parezca un rayo.
- **Fluidez.** Cada dibujo se arma una sola vez por tipo, color y escala de zoom, y cada cuadro solo lo estampa. Así se sostiene con 500 autos en Entrenar.
- **La población de Entrenar** se dibuja con la forma del auto ilustrado, atenuada, en vez del rectángulo de hoy. El líder va con el dibujo completo.
- **Se mantienen los estados de siempre:** el choque se ve con la cruz y el contorno punteado (no solo por el color), y siguen la élite, los autos fuera de carrera y los competidores con su insignia.
- **V1 y V2 usan el mismo dibujo**, porque la V2 ya dibuja con `src/render/view.js`.

## Filtro de entrada

1. **¿Qué concepto hace visible?** Ninguno nuevo: habilita leer mejor los que ya están. Que el frente y el tamaño de cada vehículo se vean claros ayuda a relacionar lo que leen los sensores con lo que hay en la calle.
2. **¿Se entiende sin que nadie lo explique?** Sí. Son autos, motos y camiones dibujados como tales.
3. **¿El mentor puede ignorarla u ocultarla?** No hay nada que ocultar: es el aspecto de la escena. No suma controles.
4. **¿Qué pasa si se usa mal, y cómo se vuelve atrás?** No hay uso posible: no es un control. Si algún dibujo no se lee bien en una pestaña, se vuelve a la silueta provisoria revirtiendo el cambio.

**Público:** sirve a los dos. El principiante encuentra una escena más atractiva y legible. El mentor proyecta algo que se reconoce desde lejos. No suma texto ni controles, así que no entorpece a ninguno.

## Fuera de alcance

- Cambiar la pista, el paisaje, los rayos o la red. Solo cambian los vehículos y el cono de los faros.
- Colores distintos para cada vehículo del tráfico. El tráfico sigue en un solo color (*Colores con significado constante*). Si el dueño quiere variedad de colores, es otro cambio que toca esa spec.
- Animaciones de los vehículos, como ruedas que giran o luces de freno.
- 3D.
- Cambiar las medidas de los tipos. Se dibujan con las de `trafico-vivo` (D3). Si el diseño pide otras, se consulta, porque un camión de más de 10 m cambia la garantía de los muros.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `vista-escenario`: se agregan requisitos para los vehículos ilustrados (aspecto por tipo, dibujo en capas recoloreable, dibujo dentro del contorno, faros que no se confunden con sensores y la forma ilustrada en la población). Los requisitos actuales de colores, choque, población y fluidez siguen vigentes sin cambios.

## Impact

- **Código:** un módulo nuevo de dibujo de vehículos (`src/render/vehicles.js`, sin DOM fuera del canvas, con el caché de imágenes) y su uso en `src/render/view.js` (`drawVehicle`, `silhouettes`, `drawCompetitor`). El cono de faros va en `src/v2/render/glow.js`.
- **Estilos:** quizá dos o tres tokens nuevos en `styles/tokens.css` para sombras y brillos, sin cambiar el significado de los existentes.
- **Pruebas:** dibujo dentro del contorno por tipo, caché por tipo, color y escala, y fluidez (`vista-escenario`, *Fluidez con una población*).
- **Borradores:** una página de muestra con las variantes de estilo para que elija el dueño, y las capturas del antes y del después en `borradores/vehiculos-ilustrados/`.
- **Quién hace qué:** el diseño de los dibujos lo hace una sub-sesión Fable 5.2 medium. La integración, el caché, las pruebas y la medición, una sub-sesión Opus 5.5 medium.
- **Depende de `trafico-vivo`**, que trae los tipos y medidas de vehículos y está por archivarse.
