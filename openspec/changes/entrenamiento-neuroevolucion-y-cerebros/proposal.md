# Proposal

## Why

La pestaña 1 dejó planteado el problema: manejar es convertir unos pocos
números en acciones. Falta el corazón del laboratorio: mostrar que esa
conversión no hace falta programarla, porque una red neuronal puede
aprenderla. Este cambio entrega la pestaña 3, "Entrenar", y la biblioteca de
cerebros que usarán todas las pestañas siguientes.

Se hace antes que la pestaña 2 porque es el cambio que más exige al núcleo
(muchos autos a la vez, simulación acelerada, un segundo tipo de controlador):
si el contrato o el mundo necesitan ajustes, conviene descubrirlo ahora.

**Concepto que hace visible:** una red neuronal no se programa; se prueban
muchas variantes con números al azar, se eligen las que mejor manejan, se las
copia con pequeños cambios y se repite. Eso es aprender por evolución
(neuroevolución).

## What Changes

- **Red neuronal en el núcleo.** Red de capas totalmente conectadas, con capas
  ocultas y neuronas por capa configurables. Recibe una entrada por sensor más
  la velocidad del auto y entrega los cuatro controles sí/no. La salida usa
  activación escalón; la de las capas ocultas se elige entre escalón, sigmoide,
  tangente hiperbólica y ReLU.
- **Mundo con varios autos.** La simulación pasa a admitir muchos autos sobre
  la misma pista y el mismo tráfico, cada uno con su controlador, sin chocar
  entre sí. El mundo de un solo auto sigue funcionando exactamente igual.
- **Neuroevolución en el núcleo.** Evaluación de una población por
  generaciones, función de fitness elegible, selección de los mejores, élite,
  mutación y cruce opcional, todo reproducible con una semilla.
- **Controlador de red neuronal**, que cumple el contrato único existente.
- **Cerebros.** Un cerebro es una red junto con los sensores para los que fue
  entrenada y los datos de su entrenamiento (generaciones, escenarios que vio,
  función de fitness, configuración). Se guarda con nombre propio, se renombra,
  se elimina, se exporta a un archivo y se importa, y se puede cargar para
  seguir entrenándolo. La aplicación guarda sola el último campeón para no
  perder trabajo. No trae cerebros ya entrenados: el mentor entrena y guarda
  los suyos antes de una demostración (enmienda del artículo 8 de la
  constitución).
- **Eliminar a los lentos.** Un auto que en los últimos 5 segundos avanzó menos
  que el tráfico queda fuera de carrera. Sin esta regla, la población aprende
  que ir detrás de un vehículo nunca choca y suma distancia, y deja de
  aprender a esquivar. Es un ajuste avanzado, encendido por defecto, que se
  puede apagar para mostrar esa trampa.
- **Velocidad máxima por defecto de 20 m/s** en toda la aplicación (antes 15),
  para que pasar al tráfico (10 m/s) valga la pena.
- **Pestaña 3, "Entrenar".** Una población de autos aprende a la vista, con
  curva de fitness por generación, diagrama de la red del auto líder, control
  de velocidad con modo turbo, configuración de población, mutación, red,
  sensores y escenario, guía y misiones.
- **Vista del escenario** capaz de dibujar una población, destacar al líder y
  seguirlo con la cámara.
- **Diagrama de red** reutilizable, que muestra capas, conexiones y actividad
  en vivo. Es la base del inspector de la pestaña 5.
- **Bucle con velocidades**: la simulación puede correr a 2, 4 y 8 veces la
  velocidad real, o tan rápido como permita el equipo.
- **Números según el idioma** (coma decimal en español, punto en inglés),
  resuelto en el sistema de idiomas para toda la aplicación.
- **Guía de la pestaña 1** con la cantidad de carriles realmente elegida.
- La pestaña "Entrenar" deja de mostrarse como "próximamente".

### Filtro de entrada por feature visible

| Feature | Concepto que hace visible | Se entiende sola | El mentor puede ignorarla | Uso incorrecto y vuelta atrás |
|---|---|---|---|---|
| Población que aprende por generaciones | Aprender es probar, elegir y repetir | Corre al abrir; la guía dice qué mirar | Es el contenido base de la pestaña | Reiniciar el entrenamiento; el último campeón se guarda solo |
| Curva de fitness | El aprendizaje se mide y se ve avanzar | Leyenda, ejes y texto mientras está vacía | Sección plegable | No modifica nada |
| Velocidad y turbo | Aprender lleva muchas generaciones; se pueden acelerar | Botones con el factor visible | No hace falta tocarlos | Volver a velocidad normal con un clic |
| Población y mutación | Más variantes y cambios más grandes exploran más, pero con menos precisión | Tooltips; efecto desde la generación siguiente | Valores por defecto que ya aprenden | Restablecer la configuración |
| Élite, selección y cruce | Cómo se elige quién deja descendencia | Tooltips con el término real y su definición | Colapsado bajo "Avanzado" | Restablecer la configuración |
| Función de fitness | Se aprende lo que se premia, no lo que se quería | Cada opción avisa qué puede salir mal | Colapsado bajo "Avanzado" | Volver a "distancia"; la curva empieza de nuevo |
| Eliminar a los lentos | Se aprende lo que se premia: sin la regla, seguir al tráfico es la salida fácil | Tooltip que nombra la trampa de ir detrás de un vehículo | Colapsado bajo "Avanzado" | Se apaga y se enciende; aplica desde la generación siguiente |
| Tráfico igual o nuevo en cada generación | Practicar siempre lo mismo es memorizar | Tooltip con la palabra "memorizar" | Colapsado bajo "Avanzado" | Se cambia de vuelta cuando se quiera |
| Capas ocultas, neuronas y activación | La forma de la red limita lo que puede aprender | El diagrama cambia al instante | Colapsado bajo "Avanzado" | Pide confirmación si hay progreso; campeón autoguardado |
| Diagrama de la red | Una red es números que conectan entradas con salidas | Leyenda de colores y nodos con nombre | Sección plegable | No modifica nada |
| Guardar, cargar y renombrar cerebros | Lo aprendido es un conjunto de números que se puede guardar y reutilizar | Nombre sugerido y resumen de cada cerebro | Sección plegable | Eliminar pide confirmación; exportar hace copia |
| Exportar e importar | Un cerebro es un archivo que se puede compartir | Errores de importación en lenguaje llano | Dentro de la sección de cerebros | Importar nunca pisa un cerebro existente |
| Misiones | Objetivos que guían la exploración | Texto corto y progreso visible | Se ocultan con el interruptor de guía | No bloquean nada |

### Público

Sirve a ambos. El principiante abre la pestaña y ve aprender a los autos sin
tocar nada; la guía y las misiones lo llevan de "mirar" a "cambiar algo y ver
qué pasa". El mentor oculta la guía, usa cerebros que preparó y guardó antes y la semilla
reproducible para que la demostración salga igual cada vez, y despliega
"Avanzado" cuando quiere hablar de selección, fitness o memorización.

### Fuera de alcance

- Pseudocódigo (pestaña 2), circuitos cerrados y carreras (pestaña 4),
  inspector interactivo de redes (pestaña 5), laboratorio y backpropagation
  (pestaña 6).
- Probar un cerebro fuera del entrenamiento y comparar cerebros entre sí: es
  el tema de la pestaña 4.
- Editar pesos a mano, apagar neuronas y recorrer el cálculo paso a paso: es
  el tema de la pestaña 5. El diagrama de este cambio solo muestra.
- Cerebros incluidos en la aplicación (más adelante podrían sumarse dos o tres
  elegidos por el dueño), la función de fitness por vehículos superados y elegir con un clic qué auto seguir.
- Entrenar con la página oculta o en segundo plano.
- Variedad del tráfico, otros tipos de vehículos y paisaje (siguen en
  `PENDIENTES.md`).

## Capabilities

### New Capabilities

- `red-neuronal`: estructura de la red, cálculo de sus salidas, funciones de
  activación e inicialización reproducible.
- `neuroevolucion`: evaluación de una población por generaciones, funciones de
  fitness, selección, élite, mutación, cruce y reproducibilidad.
- `cerebros`: qué es un cerebro y qué datos lo acompañan, compatibilidad con
  los sensores, biblioteca (guardar, renombrar, eliminar, autoguardado),
  exportar e importar.
- `vista-red`: diagrama de una red neuronal con sus conexiones y su actividad
  en vivo.
- `pestana-entrenar`: la pestaña 3, donde una población aprende a manejar a la
  vista de la persona.

### Modified Capabilities

- `simulacion`: se agregan los mundos con varios autos que comparten pista y
  tráfico sin chocar entre sí, sacar un auto de carrera y la ejecución a
  varias velocidades; la velocidad máxima por defecto pasa a 20 m/s.
- `controladores`: se agrega el controlador de red neuronal.
- `vista-escenario`: se agregan el dibujo de una población, el destaque del
  auto líder y el seguimiento de un auto que cambia.
- `estructura-app`: la pestaña "Entrenar" pasa a estar disponible y las
  pestañas reciben la biblioteca de cerebros.
- `internacionalizacion`: se agrega el formato de números según el idioma.
- `pestana-conducir`: la guía de inicio nombra la cantidad de carriles elegida
  y restablecer devuelve el auto a 20 m/s.

## Impact

- **Núcleo:** `src/core/world.js` se generaliza a varios autos sin cambiar su
  interfaz de un solo auto (las 194 pruebas actuales deben seguir pasando sin
  modificarse). Módulos nuevos para la red, la evolución, el entrenamiento y
  los cerebros.
- **Vista e interfaz:** `src/render/view.js` y `src/ui/loop.js` ganan
  capacidades; se agregan el diagrama de red, la curva de fitness, la
  biblioteca de cerebros y la pestaña `src/tabs/train/`. `src/ui/i18n.js`
  pasa a formatear números; `src/ui/app.js` entrega la biblioteca a las
  pestañas.
- **Datos en el navegador:** los cerebros guardados y el autoguardado usan el
  almacenamiento local, con tolerancia a que no esté disponible.
- **Constitución:** el artículo 8 deja de exigir cerebros preentrenados; pide
  que lo aprendido se pueda guardar y exportar (también en
  `openspec/config.yaml`).
- **Dependencias:** ninguna nueva.
- **Documentos:** `README.md` (arquitectura) y `PENDIENTES.md` (se quitan los
  dos detalles resueltos y se anotan las ideas que quedaron fuera).
- **Cambios futuros:** las pestañas 2, 4, 5 y 6 reutilizan el mundo con varios
  autos, los cerebros, la biblioteca y el diagrama de red.
