# Proposal

## Why

Las cinco pestañas anteriores muestran una sola forma de aprender: probar
cambios al azar y quedarse con los que andan mejor. Falta la otra, la que usan
casi todas las redes de verdad: mirar cuánto se equivocó la red y corregir
cada peso en la dirección que achica el error. La pestaña 6, "Laboratorio",
es el espacio libre para verla funcionar y jugar con ella.

Concepto que hace visible: **una red aprende de ejemplos. Compara su
respuesta con la correcta, reparte la culpa del error hacia atrás por sus
conexiones y corrige un poquito cada peso. Eso es backpropagation.**

Segundo concepto, que Competir no pudo mostrar: **una red que solo mejora en
lo que practicó y empeora en lo que nunca vio está memorizando: eso es
sobreajuste.**

## What Changes

- **Pestaña 6 disponible**, con la red en la zona grande, como en
  Inspeccionar.
- **Dos clases de datos para aprender**, elegidas en la barra de arriba:
  - **Puntos:** puntos de dos colores en un plano, en cuatro formas (dos
    grupos, círculo, cruzado y espiral), con ruido y cantidad a elección. El
    plano se pinta con lo que la red contesta en cada lugar.
  - **Tu manejo:** ejemplos de alguien manejando (lo que veían los sensores y
    qué teclas se apretaron), tomados de un maestro o grabados por la
    persona. La red aprende a imitarlos.
- **Backpropagation paso a paso y animado:** para cada ejemplo, la ida (la
  red contesta), el error (cuánto se equivocó), la vuelta (la culpa viaja
  hacia atrás por las conexiones) y la corrección (cada peso cambia un poco),
  con los números a la vista. Se avanza de a una época, un ejemplo, una fase,
  una capa o una neurona, o se deja correr al ritmo que se quiera.
- **Curvas de error y de aciertos**, en lo que la red practica y en lo que
  nunca vio.
- **Sobreajuste a la vista:** una parte de los datos se aparta y la red no
  aprende de ella. Cuando el error ahí sube mientras el otro sigue bajando,
  la pestaña lo marca y lo dice.
- **Armar la red:** capas, neuronas por capa, activación y tasa de
  aprendizaje.
- **Tabla de datos:** una tercera vista en la zona de la red, que no es la
  de por defecto. Cada ejemplo en una fila, con sus entradas, la respuesta
  correcta, lo que la red contesta ahora y si acierta. Se actualiza sola
  mientras la red aprende, y se filtra por los que falla.
- **Cambiar la red a mano, como en Inspeccionar:** al elegir una neurona, su
  tarjeta en el panel deja cambiar pesos y sesgo y apagar neuronas y
  conexiones. El cambio va a la red que aprende; "Deshacer" y "Restablecer
  la red" están sobre la red, donde están en Inspeccionar.
- **Probar y guardar lo aprendido del manejo:** la red maneja sola en la
  escena y se guarda como cerebro en la biblioteca, para llevarla a Competir
  y abrirla en Inspeccionar.

### Filtro de entrada

| Feature | ¿Qué concepto hace visible? | ¿Se entiende sola? | ¿El mentor puede ignorarla u ocultarla? | ¿Mal uso y vuelta atrás? |
|---|---|---|---|---|
| Puntos en un plano | Aprender es encontrar la frontera que separa los ejemplos | Abre aprendiendo sola: el plano se va pintando | Es el contenido por defecto | "Reiniciar pesos" empieza de nuevo |
| Paso a paso de un ejemplo | La red corrige cada peso según cuánta culpa tuvo en el error | La barra de reproducción y la operación escrita, como en Inspeccionar | Por defecto corre sola | Reproducir vuelve a correr |
| Curvas de error y aciertos | Aprender se mide: el error baja y los aciertos suben | Dos curvas con nombre, que crecen mientras aprende | La tarjeta acompaña sin tapar | No tiene estado propio |
| Sobreajuste | Mejorar en lo practicado no es mejorar en lo nuevo | Dos curvas y un aviso con palabras cuando se separan | Con los valores por defecto no aparece | Menos red, más datos o reiniciar |
| Armar la red | El tamaño y la forma de la red cambian qué puede aprender | Cuatro ajustes con tooltip; ya hay una red armada | No hace falta tocarlos | Restablecer vuelve a la red por defecto |
| Tasa de aprendizaje | Corregir de a mucho hace que la red se pase de largo | Un deslizador; el efecto se ve en la curva | No hace falta tocarlo | Vuelve a su valor con restablecer |
| Tu manejo | Una red puede aprender a manejar mirando cómo maneja otro | Con un maestro ya elegido, aprende sin grabar nada | Se queda en "Puntos" | Se borran los ejemplos grabados |
| Tabla de datos | Aprender es acertar más filas de una tabla de ejemplos: el problema son esos datos | Encabezados con nombre, un signo por fila y un resumen arriba | No es la vista por defecto: está a un clic | Volver al diagrama, que queda como estaba |
| Cambiar la red a mano | Los pesos son números: si se rompe uno, el error sube y el aprendizaje lo vuelve a acomodar | La misma tarjeta y los mismos botones que en Inspeccionar | Sin neurona elegida no se muestra nada | "Deshacer" y "Restablecer la red", siempre a la vista; "Reiniciar pesos" |
| Probar y guardar | Lo aprendido de ejemplos es un cerebro como los otros | Dos botones con nombre junto a la escena | No hace falta usarlos | El cerebro guardado se elimina en Entrenar |

### A quién sirve

- **Principiante:** abre la pestaña y ve una red aprendiendo a separar dos
  colores. Pausa, avanza de a un paso y sigue una corrección entera.
- **Mentor:** arma la red y los datos para el punto que quiere mostrar: una
  red que no alcanza, una tasa que la hace divergir, una que memoriza. Con
  "Tu manejo" cierra el recorrido: la misma red del auto, aprendida de otra
  forma, compite contra las de evolución.

### Fuera de alcance

- Lotes, momento, otros optimizadores, regularización y abandono de neuronas.
- Dibujar puntos a mano en el plano.
- Aprender por backpropagation con recompensas en vez de ejemplos.
- La activación escalón en el Laboratorio: no tiene pendiente.
- Fijar un peso para que el aprendizaje no lo mueva, y apagar neuronas de
  salida: apagar una salida deja sin definir el error.
- En la tabla de datos: ordenar por columna, cambiar los datos desde la
  tabla, y pasar por la red el ejemplo de una fila elegida.
- Una cuarta misión: quedan las tres.
- Mejorar la vista de la red, anotado aparte en `PENDIENTES.md`: el
  Laboratorio usa la de Inspeccionar como está.
- Guardar o cargar los ejemplos grabados.

## Capabilities

### New Capabilities

- `retropropagacion`: la cuenta de aprender de un ejemplo, sin DOM: ida con
  salida suave, error, culpa de cada neurona, corrección de cada peso y el
  recorrido paso a paso por esas fases.
- `datos-de-ejemplo`: de dónde salen los ejemplos: puntos generados con
  semilla, ejemplos de manejo de un maestro o grabados, y la separación entre
  lo que se practica y lo que se aparta.
- `pestana-laboratorio`: la pestaña 6.

### Modified Capabilities

- `estructura-app`: Laboratorio pasa a estar disponible, con la disposición
  de Inspeccionar.
- `inspector-de-red`: la vista de la red muestra también la vuelta: la culpa
  de cada neurona y los pesos que cambian. Y puede mostrarse sin ninguna
  neurona elegida.
- `cerebros`: un cerebro puede haber aprendido imitando ejemplos, y sus datos
  lo dicen.
- `barra-escenario`: en Laboratorio la barra elige los datos.
- `pestana-competir`: un cerebro que aprendió imitando dice dónde.

## Impact

- **Núcleo:** módulos nuevos sin DOM para backpropagation, los datos y el
  recorrido paso a paso. La red, la evolución y el mundo no cambian.
- **Dibujo:** una vista nueva del plano de puntos; la vista de la red suma
  la vuelta.
- **Pestaña:** `src/tabs/lab/` nueva, registrada en `src/main.js`.
- **Reutiliza:** la vista de la red, la barra de reproducción, la operación
  en curso y los anchos de Inspeccionar; el gráfico de Entrenar; la escena
  chica; la biblioteca.
- **Sin medir todavía:** con qué valores por defecto la red aprende cada
  forma y en cuánto; con qué receta aparece el sobreajuste de forma
  confiable; si una red aprende a manejar imitando y cuántos ejemplos
  necesita; y la fluidez. La implementación lo mide temprano y se detiene a
  consultar si no se cumple.
- **Agregado después de probarla (grupos 11 a 14):** la tabla de datos y los
  cambios a mano. El núcleo suma aprender con partes apagadas y cambios a
  mano en el recorrido; la tarjeta de Inspeccionar pasa a ser compartida.
  Sin medir: que la tarjeta entre en el panel, que la barra de arriba de la
  red no se parta con tres vistas a 600 px, y lo que cuesta mantener al día
  la tabla con 3600 ejemplos.
- **Dependencias y build:** ninguna nueva.
