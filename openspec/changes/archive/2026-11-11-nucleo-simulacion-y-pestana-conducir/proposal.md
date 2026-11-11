# Proposal

## Why

El repositorio está vacío: no existe la base sobre la que se van a apoyar las
seis pestañas del laboratorio. Este cambio construye esa base (núcleo de
simulación, vista, estructura de la app, idiomas y ayuda contextual) y entrega
la primera pestaña, que presenta el problema que todo el resto del recorrido
intenta resolver.

**Concepto que hace visible:** conducir es transformar lo que se percibe en
acciones; una persona lo hace sin pensar, y una máquina solo dispone de unos
pocos números (sus sensores) para decidir lo mismo.

## What Changes

- Se crea la estructura del proyecto: módulos ES nativos, sin frameworks ni
  dependencias de terceros, sitio estático publicable tal cual, con pruebas
  del núcleo ejecutables sin navegador.
- Se agrega un núcleo de simulación sin DOM y determinista: paso de tiempo
  fijo, azar con semilla, física simple del auto y detección de choques.
- Se agrega una representación única de pista (línea central, ancho y
  carriles). En este cambio solo se entrega la calle recta de 2, 3 o 4
  carriles; la representación no impide los circuitos cerrados posteriores.
- Se agrega tráfico para la calle recta, generado con semilla, con densidad e
  irregularidad configurables y siempre superable.
- Se agregan sensores de rayos configurables (cantidad, largo y apertura).
- Se define el contrato único de controlador (percepción entra, controles
  salen) con su primera implementación: el teclado.
- Se agrega la vista del escenario en canvas, con cámara que sigue al auto,
  zoom y paneo, reutilizable por todas las pestañas con escenario.
- Se agrega la estructura de la app: barra con las seis pestañas del recorrido
  (solo la primera habilitada), disposición común de escenario a la izquierda y
  panel de ancho ajustable a la derecha, interruptor de guía, créditos al curso de Radu
  Mariescu-Istodor.
- Se agrega el sistema de idiomas (español e inglés, con selector) y el
  sistema único de tooltips "qué hace / por qué importa".
- Se agrega la pestaña 1, "El problema": manejar el auto con el teclado entre
  el tráfico, ver lo que perciben los sensores y lo que se está accionando,
  con guía breve, misiones e indicadores del intento. Incluye un modo "ver
  como la máquina" que oculta la calle y deja solo las lecturas de los
  sensores.

### Filtro de entrada por feature visible

| Feature | Concepto que hace visible | Se entiende sola | El mentor puede ignorarla | Uso incorrecto y vuelta atrás |
|---|---|---|---|---|
| Manejar con el teclado | El problema a resolver: esquivar tráfico sin chocar | Texto de inicio indica las teclas; funciona al abrir | Es el contenido base de la pestaña | Chocar termina el intento; reiniciar con una tecla |
| Ver sensores y sus lecturas | La máquina percibe solo unos pocos números | Rayos sobre el auto y barras que se mueven con ellos | Se apaga con un interruptor | Sin efecto sobre la simulación |
| Ver los controles accionados | La salida del problema son cuatro acciones | Las teclas se iluminan al presionarlas | Se oculta junto con los sensores | Sin efecto sobre la simulación |
| Modo "ver como la máquina" | Decidir solo con las lecturas de los sensores es difícil | Al activarlo desaparece la calle y quedan rayos y barras | Apagado por defecto | Se desactiva con el mismo interruptor; al chocar se vuelve a ver todo |
| Guía y misiones | Objetivos concretos que orientan la exploración | Texto corto y progreso visible | Se oculta con el interruptor de guía | No bloquean nada; se reinician con el intento |
| Configurar velocidad, escenario y sensores | El problema cambia de dificultad según la velocidad, el entorno y la percepción | Tooltips por control; cambio visible al instante | Va colapsado bajo "Avanzado" | Botón para restablecer valores por defecto |
| Cámara con zoom y paneo | Ninguno propio: habilita observar con comodidad | Controles en pantalla con tooltip | No interfiere si no se usa | Botón para volver a seguir al auto |

### Público

Sirve a ambos. El principiante recibe una actividad que funciona al abrirla,
con guía y misiones. El mentor apaga la guía con un interruptor y usa la
pestaña como escenario para explicar percepción y acción; las opciones
avanzadas no se muestran hasta que se las despliega.

### Fuera de alcance

- Pseudocódigo (pestaña 2), neuroevolución y biblioteca de cerebros
  (pestaña 3), circuitos cerrados y carreras (pestaña 4), inspector de redes
  (pestaña 5), laboratorio y backpropagation (pestaña 6).
- Circuitos cerrados, vueltas y puntos de control.
- Varios autos controlados a la vez y penalización por choque con
  restablecimiento.
- Modo presentador con escenas, matriz de cerebros por escenarios.
- Soporte para celulares y controles táctiles.
- Empaquetado opcional a un solo archivo y publicación efectiva del sitio.

## Capabilities

### New Capabilities

- `simulacion`: avance del mundo en pasos fijos y deterministas, física del
  auto y detección de choques, sin dependencia del navegador.
- `pista`: representación de una pista por línea central, ancho y carriles,
  con bordes y medición de progreso; incluye la calle recta.
- `trafico`: generación reproducible de tráfico en la calle recta, con
  densidad e irregularidad configurables.
- `sensores`: rayos de percepción del auto, su configuración y sus lecturas.
- `controladores`: contrato único que convierte percepción en controles, y el
  controlador de teclado.
- `vista-escenario`: dibujo del escenario y cámara con seguimiento, zoom y
  paneo.
- `estructura-app`: pestañas del recorrido, disposición común, interruptor de
  guía, preferencias y créditos.
- `internacionalizacion`: textos en español e inglés con cambio de idioma en
  vivo.
- `ayuda-contextual`: tooltips "qué hace / por qué importa" para todo control.
- `pestana-conducir`: la pestaña 1, donde la persona maneja el auto y ve
  percepción y acción.

### Modified Capabilities

Ninguna: no existen capacidades previas.

## Impact

- **Código:** todo es nuevo. Se crean `index.html`, estilos, los módulos bajo
  `src/` (núcleo, vista, interfaz, pestaña 1, textos) y las pruebas del núcleo.
- **Dependencias:** ninguna de terceros. Las pruebas usan el ejecutor
  incluido en Node; el servidor local de desarrollo es un script propio.
- **Publicación:** el sitio queda listo para servirse como archivos
  estáticos; habilitar el hosting es un paso manual documentado.
- **Cambios futuros:** las pestañas 2 a 6 se apoyan en el contrato de
  controlador, la pista, los sensores, la vista y los sistemas de idiomas y
  tooltips definidos acá.
