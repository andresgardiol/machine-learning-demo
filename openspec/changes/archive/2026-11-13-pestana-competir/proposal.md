# Proposal

## Why

El recorrido del laboratorio pregunta, después de "que aprenda", "¿generaliza?".
Hoy no hay dónde contestarla: un cerebro entrenado se ve manejar solo en la
pestaña donde se entrenó, en la pista donde practicó. No hay forma de poner
dos cerebros lado a lado, ni de probar uno en una pista que nunca vio, ni de
comparar lo aprendido con las reglas escritas a mano o con una persona.

La pestaña 4, "Competir", pone a varios competidores a la vez en la misma
pista y deja anotado cómo le fue a cada uno en cada pista.

Concepto que hace visible: **manejar bien donde se practicó no es lo mismo
que saber manejar. Un cerebro que solo rinde en la pista o en el tráfico que
vio se sobreajustó; uno que rinde también donde nunca estuvo, generalizó.**

## What Changes

- **Pestaña 4 disponible.** Usa el escenario, el tablero, el panel y la barra
  de escenario de las demás.
- **Carrera de fantasmas con meta:** hasta seis competidores salen a la vez
  de la misma línea, en la pista elegida en la barra, y no se chocan entre
  sí. Así se comparan sus líneas de manejo. Gana el que llega primero a la
  meta, que se elige en la barra: metros en la calle recta (1000 por
  defecto) y vueltas en un circuito (2 en el óvalo y 1 en los otros dos por
  defecto).
- **Chocar no saca de la carrera:** después de una penalización corta (0,1
  segundos por defecto, configurable), el auto reaparece en el centro, un
  poco más atrás, y sigue corriendo. Por 2 segundos pasa a través del tráfico
  como un fantasma, para no volver a chocar contra lo mismo. Se cuentan los
  choques.
- **Ninguna carrera se cuelga:** el que pasa 5 segundos sin avanzar queda
  fuera como "no terminó", y desde que llega el primero los demás tienen 20
  segundos para llegar.
- **Tres tipos de competidor:**
  - **Cerebros** de la biblioteca (guardados y autoguardados) y de ejemplo.
  - **Programas:** los tres de ejemplo de Reglas a mano (el de 7 sensores,
    por defecto) y **tu programa**, el actual de esa pestaña, con sus
    sensores.
  - **Vos:** un auto manejado con el teclado. Mientras manejás, la cámara te
    sigue siempre.
- **Carrera por defecto:** vos contra el programa de 7 sensores y un cerebro
  de ejemplo, esperando en la salida con un cartel para largar con un botón o
  con la tecla espacio.
- **Lista de competidores y "Agregar":** el panel muestra solo a los que
  corren, con un botón para quitarlos. "Agregar" abre un selector con tus
  cerebros guardados, los programas y los ejemplos, que sirve igual con tres
  cerebros que con veinte.
- **Sensores de cada competidor:** cada uno, menos vos, tiene un botón para
  mostrar u ocultar sus sensores en el escenario.
- **Marcador de la carrera** en el tablero: posición, nombre, cuánto lleva
  (metros en la calle, vueltas en un circuito) o su tiempo si llegó, sus
  choques, su mejor vuelta en los circuitos y si sigue en carrera, llegó o no
  terminó.
- **Tabla por pista** en el tablero: una fila por competidor y una columna
  por pista, con el último resultado de cada uno (tiempo de llegada o qué
  parte hizo, y choques). En los cerebros, cada celda
  marca si **entrenó en esa pista** o **nunca la vio**. Es donde se lee la
  generalización.
- **Tráfico de la carrera en la calle:** nuevo en cada carrera (por defecto) o
  el de práctica, que es el que ven los cerebros entrenados con "el mismo
  tráfico". Permite mostrar a un cerebro que memorizó: llega sin chocar en
  su tráfico y choca en uno nuevo.
- **Cerebros de ejemplo incluidos:** cuatro cerebros ya entrenados, para que
  la pestaña sirva sin haber entrenado nada: uno de la calle
  con tráfico nuevo, uno de la calle con el mismo tráfico, uno del óvalo y uno
  de las cuatro pistas. Se entrenan una vez con una herramienta del proyecto y
  se guardan como datos.
- **Elegir a quién seguir:** un clic en un competidor del marcador hace que la
  cámara lo siga y muestra sus sensores.
- **Tres misiones** con la guía activa.
- **La barra de escenario** rige también acá: la pista, el tráfico y la
  velocidad son los de la carrera. Los sensores no se muestran, porque cada
  competidor trae los suyos.
- **Lo que no sirve no se muestra:** un ajuste sin efecto en la pestaña o en
  la situación (los sensores de la barra, el tráfico de la carrera en un
  circuito, las velocidades de simulación cuando manejás vos) desaparece en
  lugar de quedar deshabilitado.

### Filtro de entrada

| Feature | ¿Qué concepto hace visible? | ¿Se entiende sola? | ¿El mentor puede ignorarla u ocultarla? | ¿Mal uso y vuelta atrás? |
|---|---|---|---|---|
| Carrera de fantasmas con meta | Dos formas de manejar se comparan viéndolas a la vez en el mismo problema: quién llega, en cuánto y chocando cuánto | Abre con una carrera armada (vos, un programa y un cerebro) y un cartel para largar | Elige qué competidores corren | Reiniciar vuelve a la salida; cambiar la pista empieza otra carrera |
| Tabla por pista | Generalizar es rendir donde no se practicó; sobreajustar es rendir solo donde sí | Cada celda dice el resultado y si el cerebro entrenó ahí o nunca vio esa pista | La tarjeta se pliega | Borrar resultados la vacía; no cambia ningún cerebro |
| Tráfico de práctica o nuevo | Memorizar un tráfico no es aprender a manejar | Dos opciones con tooltip; por defecto, tráfico nuevo. Solo se ve en la calle recta | No hace falta tocarlo | Se vuelve con la otra opción |
| Cerebros de ejemplo | Lo que un cerebro sabe depende de dónde y cómo se entrenó | Cada uno se llama por cómo se entrenó | Se desmarcan como cualquier competidor | No se pueden cambiar ni borrar: son datos de la app |
| Programa de ejemplo | Las reglas a mano y lo aprendido se pueden medir con la misma vara | Un competidor más, con el nombre que tiene en Reglas a mano | Se desmarca | Es siempre el mismo: no depende de lo escrito en Reglas a mano |
| Tu programa | Lo que escribiste también se puede medir contra lo aprendido | Un competidor más, con nombre; desmarcado por defecto | No hace falta marcarlo | Si el programa tiene errores, se ve deshabilitado y explica por qué |
| Vos | Una persona generaliza sin esfuerzo lo que a la red le cuesta | Un cartel sobre el escenario dice cómo se maneja y cómo se larga; la cámara te sigue siempre | Se desmarca y la carrera corre sola | La carrera espera a que la largues; reiniciar vuelve a la salida |
| Chocar y seguir | Equivocarse cuesta tiempo, no la carrera; cuánto cuesta cambia qué forma de manejar conviene | El auto reaparece solo; los choques se cuentan en el marcador | No hace falta tocar la penalización | El deslizador vuelve a 0,1 s; cambiarlo empieza otra carrera |
| Espera de 20 s | Una carrera tiene un final para todos | Una cuenta regresiva a la vista cuando llega el primero | No hay nada que ajustar | Otra carrera con una tecla |
| Mejor vuelta | El mismo circuito se puede recorrer mejor o peor | Un tiempo junto a las vueltas | Es un dato del marcador | No tiene estado propio |
| Seguir a un competidor | Mirar de cerca qué hace distinto uno de otro | Un clic en su nombre, cuando no estás manejando | Sin "vos", se sigue al que va primero | Otro clic en otro nombre |

### A quién sirve

- **Principiante:** abre la pestaña, aprieta espacio y corre contra un
  cerebro y un programa en la misma calle. Cambia de pista y ve quién sigue
  andando y quién no.
- **Mentor:** desmarca "Vos", trae sus cerebros guardados, arma la carrera que
  quiere mostrar
  y usa la tabla para contar la historia: este practicó acá, este nunca vio
  esto. Con el tráfico de práctica muestra al que memorizó.

### Fuera de alcance

- Que los competidores se choquen entre sí.
- Semáforo de largada, bandera, podio y repetición de la carrera.
- Configurar los 5 segundos sin avanzar o los 20 de espera.
- Una biblioteca de programas de Reglas a mano con nombre: compite el
  programa actual.
- Guardar los resultados entre visitas: la tabla dura hasta cerrar la app.
- Evaluar en las cuatro pistas con un solo botón, sin ver las carreras.
- Editar, renombrar o borrar los cerebros de ejemplo, o usarlos para seguir
  entrenando.
- Más de seis competidores a la vez.
- Buscar por nombre en el selector de competidores.
- Quitar de la barra el tráfico cuando la pista es un circuito: hoy se ve
  deshabilitado en las cuatro pestañas y cambiarlo es de `barra-escenario`.
- Las pestañas Inspeccionar y Laboratorio.

## Capabilities

### New Capabilities

- `carrera`: varios competidores con controladores distintos corriendo a la
  vez en una pista durante un tiempo fijo, con su resultado, sus vueltas y su
  orden.
- `pestana-competir`: la pestaña 4: armar la carrera, verla, el marcador, la
  tabla por pista, el tráfico de la carrera y las misiones.
- `cerebros-de-ejemplo`: los cerebros incluidos con la aplicación, cómo se
  generan y qué tienen que mostrar.

### Modified Capabilities

- `estructura-app`: la pestaña Competir pasa a estar disponible.
- `vista-escenario`: dibujo de varios competidores distinguibles entre sí.
- `barra-escenario`: un grupo que no tiene efecto en una pestaña no se
  muestra en ella (los sensores en Competir), y una pestaña puede sumar un
  grupo propio (la meta de la carrera).

## Impact

- **Núcleo:** módulo nuevo `src/core/race.js`, sobre el mundo de varios autos
  que ya existe. El mundo suma, sin uso en las otras pestañas, volver a poner
  un auto en la pista y protegerlo del tráfico un instante.
- **Datos:** `src/data/example-brains.js`, generado por
  `tools/train-examples.mjs`.
- **Pestaña:** `src/tabs/compete/` nueva, registrada en `src/main.js`.
- **Dibujo:** `src/render/view.js` suma competidores con color y número, la
  línea de meta y el cartel para largar.
- **Interfaz común:** la barra de escenario admite que una pestaña no muestre
  un grupo y que sume uno propio (la meta); el tablero suma una tarjeta con tabla.
- **Textos y estilos:** `src/i18n/es.js`, `en.js`, `styles/tokens.css`
  (colores de los competidores) y `styles/app.css`.
- **Pruebas:** nuevas para la carrera, la lógica sin DOM de la pestaña y los
  cerebros de ejemplo.
- **Sin medir todavía:** si los cuatro cerebros de ejemplo muestran el
  contraste que se busca (el que memorizó, el que nunca vio un circuito); cómo
  maneja un cerebro al reaparecer, que en el entrenamiento nunca le pasó; y
  cuánto dura una carrera con las metas elegidas. La implementación lo mide y
  se detiene a consultar si no se cumple.
- **Rendimiento:** hasta seis autos con sensores; mucho menos que una
  población de Entrenar.
- **Dependencias y build:** ninguna nueva.
