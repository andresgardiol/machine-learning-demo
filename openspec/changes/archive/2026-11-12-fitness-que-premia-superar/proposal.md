# Proposal

## Why

La pestaña Entrenar promete ver a un auto aprender a manejar entre el tráfico.
Hoy, con los valores por defecto, la población aprende otra cosa: a quedarse
detrás de un vehículo. Medido sin navegador, los campeones de las generaciones
51 a 60 superan 0,2 vehículos en promedio en tráficos que no vieron.

La causa principal está en lo que se premia. La fitness por defecto es la
distancia, y en 60 segundos un auto que sigue a un vehículo recorre unos 600 m
sin riesgo, mientras que uno que intenta pasar y choca a los 200 m queda peor
ubicado. La evolución hace bien su trabajo: optimiza lo que se le pide.

Concepto que hace visible: **se aprende lo que se premia, no lo que se
quería. Premiar la distancia enseña a seguir al tráfico; premiar la ventaja
sobre el tráfico enseña a pasarlo.**

El objetivo es que una persona que no sabe nada abra la pestaña y vea, sin
tocar ningún ajuste, autos que aprenden a esquivar el tráfico. Este cambio
reúne todo lo que se midió que ayuda a eso y deja afuera lo que no.

### Lo que se midió

Todo se midió el 12 de noviembre de 2026 con una copia del núcleo en el
scratchpad, sin navegador: población 100, 3 carriles, densidad 50 % y tráfico
nuevo en cada generación (ninguna generación repite el tráfico de otra). La
vara es siempre la misma: los campeones de diez generaciones seguidas, cada
uno manejando 60 s en 10 tráficos que no vio, y se cuenta cuántos vehículos
supera. Como referencia, los mejores campeones medidos superan 18 o 19
vehículos en esos 60 s.

"Irregularidad" es el ajuste que ya existe en la sección avanzada. No decide
si el tráfico es al azar: en todos los casos, qué carriles ocupa cada fila de
vehículos se sortea de nuevo en cada generación, y el primer grupo tapa el
carril de salida en la mitad de los tráficos (medido en 400 tráficos, con 0 %,
50 % y 100 %). Lo que cambia la irregularidad es la separación entre filas (44
m parejos con 0 %; de 31 a 120 m con 50 %) y que los vehículos de una fila
queden desalineados.

| Configuración | Generaciones 11 a 20 | Generaciones 51 a 60 | Chocan (51 a 60) |
|---|---|---|---|
| Hoy: distancia, élite 1, irregularidad 50 % | 0,3 | 0,2 | 19 % |
| Ventaja, élite 10, irregularidad 50 % | 2,7 | 5,0 | 89 % |
| Ventaja, élite 10, irregularidad 0 % | 4,5 | 8,8 | 65 % |
| Ventaja, élite 1, irregularidad 0 %, mutación que se enfría | 1,5 | 8,7 | 71 % |
| Distancia, élite 10, irregularidad 0 %, mutación que se enfría | 0,3 | 0,6 | 30 % |
| Ventaja, élite 10, irregularidad 50 %, mutación que se enfría | 2,0 | 4,6 | 92 % |
| **Propuesta: ventaja, élite 10, irregularidad 0 %, mutación que se enfría** | **5,2** | **13,3** | **44 %** |
| La propuesta, generaciones 91 a 100 | | 15,8 | 28 % |

La primera fila usa 6 semillas; las demás, 8.

- **La propuesta no depende de la semilla:** los ocho entrenamientos quedan
  entre 10,8 y 17,0 a las 60 generaciones, y entre 11,2 y 18,9 a las 100. Sin
  enfriar la mutación iban de 0,5 a 18,1.
- **Las cuatro piezas hacen falta:** sacar cualquiera de ellas (la fitness,
  la élite, el enfriamiento o las filas parejas) baja el resultado, como
  muestran las filas de la tabla.
- **Lo aprendido con filas parejas sirve en tráfico irregular:** los
  campeones de la propuesta, probados con irregularidad 50 %, superan 5,7
  vehículos; los entrenados directamente con irregularidad 50 %, entre 4,0 y
  5,6. No se midió ninguna pérdida de generalización por entrenar con filas
  parejas.
- Referencia con la misma vara: el ejemplo de 7 sensores de Reglas a mano
  supera 2,9 vehículos y choca en los 10 tráficos; el de 20 sensores, 4,7.
- El dato anotado en PENDIENTES ("supera 14 vehículos") era de una sola
  semilla y hasta dos minutos; con esta vara es más bajo.

### Robustez

La tabla de arriba usa las semillas 1 a 8, que resultaron ser todas de las que
aprenden. Con 40 semillas y 100 generaciones (una generación es "buena" si su
mejor auto le saca 500 m al tráfico, de 600 posibles):

| Población | Aprenden (8 o más buenas entre las generaciones 91 y 100) | No aprenden (2 o menos) | Primera generación buena (mediana) |
|---|---|---|---|
| 100, con el núcleo real | 29 de 40 | 8 de 40 | 16 |
| 200, con la copia del núcleo | 38 de 40 | 1 de 40 | 10 |

Con población 100, cuando la fuerza de mutación ya bajó a 3 %, una población
que quedó mal casi no cambia: en el navegador se vio un entrenamiento de 163
generaciones sin aprender. Con población 400 no hay medición de 40 semillas
al momento de decidir; el dueño entrenó una vez con 500 autos y la curva llegó
a unos 590 m desde la generación 15. Con población 400 no se midió: el dueño
decidió no medirlo.

También se midió, y **no mejora**:

- Otras reglas para ajustar la mutación sola: subirla a 30 % cuando nadie
  pasa el primer grupo, subirla tras 5 generaciones sin mejora, una regla
  tipo 1/5 y una fuerza distinta para cada hijo. Tampoco otros enfriamientos
  (de 30 % a 5 %, de 20 % a 2 % o más lento).
- Subir la dificultad sola a medida que la población aprende, de cinco
  formas: en tráfico irregular da entre 5,8 y 6,3, y pierde lo logrado con
  filas parejas (de 13,3 a entre 6 y 7,5).
- Sobre la propuesta, con las semillas 1 a 8: cruce, 7 rayos, capa oculta de
  8, selección de 20 % y élite de 20. Población 200 da 12,6 contra 13,3 en
  esas ocho semillas; su ventaja aparece con 40 (ver "Robustez").
- Antes de enfriar la mutación: evaluar a cada auto en 3 o 5 calles por
  generación, más alcance de sensores (empeora), más apertura, velocidad
  máxima 15 m/s, dos capas ocultas, mutación fija de 5 %, 15 % o 20 %,
  probabilidad de mutación 30 %, selección de 5 %, apagar la regla de los
  lentos, penalizar el choque y contar vehículos enteros en lugar de metros.

## What Changes

- **Función de fitness nueva, "ventaja sobre el tráfico", y por defecto.**
  Mide cuántos metros le sacó el auto al tráfico: lo que avanzó menos lo que
  avanzó el tráfico en el mismo tiempo. Seguir a un vehículo no suma; pasarlo,
  sí. Las tres funciones actuales siguen disponibles.
- **Élite por defecto de 10** (hoy 1). El rango pasa de 0–10 a 0–20 y la
  élite nunca supera la mitad de la población, para que con poblaciones
  chicas siga habiendo hijos nuevos.
- **Población por defecto de 400** (hoy 100). Es una decisión del dueño,
  tomada después de implementar el resto: con 100 autos el entrenamiento no
  despega en una de cada cinco semillas (ver "Robustez", abajo).
- **La mutación se enfría sola**, encendido por defecto: empieza fuerte (30
  %) para explorar y baja un 5 % en cada generación hasta 3 %, para afinar lo
  que ya funciona. Un interruptor junto a la fuerza de mutación lo apaga y
  deja la fuerza fija, como hoy. Con selección manual no se usa.
- **Filas parejas por defecto en Entrenar:** la irregularidad del
  entrenamiento arranca en 0 % (hoy 50 %). El tráfico sigue siendo al azar y
  distinto en cada generación. Las pestañas 1 y 2 no cambian. La
  irregularidad sigue siendo un ajuste: subirla es el desafío siguiente.
- **Indicador "vehículos superados" del líder** en el tablero, junto a la
  generación, los autos en carrera y el fitness del líder.
- **Misión nueva:** "un auto que supere 5 vehículos" reemplaza a "un auto que
  recorra 300 m", que hoy se cumple siguiendo al tráfico.
- **Los valores de ventaja se leen como ventaja** ("320 m de ventaja") en los
  indicadores, la curva, la última generación, el padre elegido y la
  biblioteca, para no confundirlos con distancia recorrida.
- **Comprobación de aprendizaje a pedido** (`npm run test:learning`): repite
  la medición de la tabla con el núcleo real. No forma parte de `npm test`,
  porque tarda unos minutos.

### Filtro de entrada

| Feature | ¿Qué concepto hace visible? | ¿Se entiende sola? | ¿El mentor puede ignorarla u ocultarla? | ¿Mal uso y vuelta atrás? |
|---|---|---|---|---|
| Fitness "ventaja sobre el tráfico" por defecto | Se aprende lo que se premia | Es una opción más del selector, con tooltip; el entrenamiento funciona sin tocarla | Está en la sección avanzada, colapsada | Elegir otra función rige desde la generación siguiente; restablecer vuelve a ventaja |
| Élite de 10 por defecto | Conservar a los mejores evita perder lo aprendido cuando el tráfico cambia | Los autos de élite ya se marcan con su contorno; el tooltip explica por qué son varios | Ajuste avanzado | Cualquier valor de 0 a 20; restablecer vuelve a 10 |
| Mutación que se enfría | Al principio conviene explorar mucho; después, afinar lo que funciona | El deslizador de la fuerza baja solo, generación a generación, a la vista | Un interruptor lo apaga y la fuerza queda fija donde estaba | Apagarlo o encenderlo rige desde la generación siguiente; restablecer lo enciende |
| Filas parejas por defecto | Primero se aprende lo fácil: la dificultad del problema decide si hay algo que aprender | Se ve: los vehículos van en filas parejas | Ajuste avanzado; el mentor sube la irregularidad cuando quiere mostrar el caso difícil | Subirla rige desde la generación siguiente; restablecer vuelve a 0 % |
| Indicador de vehículos superados | El objetivo se mide en algo concreto: a cuántos pasó | Un número junto a los otros indicadores, con un nombre que dice qué cuenta: "superados por el líder" | Es un indicador, no un control | No tiene estado propio |
| Misión "superar 5 vehículos" | Aprender a manejar es pasar al tráfico, no acompañarlo | Una meta con progreso | Se oculta con la guía | No bloquea nada |

### A quién sirve

- **Principiante:** abre la pestaña y, sin tocar nada, ve autos que pasan al
  tráfico antes de la generación 20 y un número que sube. El único control
  nuevo a la vista es el interruptor del enfriamiento, ya encendido.
- **Mentor:** tiene el experimento servido. Cambia la fitness a distancia y
  muestra que la misma población aprende a seguir al tráfico; sube la
  irregularidad y muestra un problema más difícil. Los dos ajustes ya estaban
  en la sección avanzada.

### Fuera de alcance

- Que el auto maneje sin chocar en tráfico irregular: con irregularidad 50 %
  ninguna combinación medida pasa de 6,3 vehículos ni baja del 80 % de
  choques. Queda anotado en PENDIENTES.
- Subir la dificultad sola a medida que la población aprende: medido, no
  mejora (ver arriba).
- Cambios al auto, a los sensores, a la red, a la selección y al cruce: se
  midieron y no mejoran.
- Enfriar la mutación con selección manual: no se midió. Ahí la fuerza sigue
  siendo la del deslizador.
- Recalentar la mutación cuando la población se estanca: una medición
  preliminar con 40 semillas también baja los entrenamientos que no aprenden
  (1 de 40), pero el dueño eligió subir la población. Queda anotado en
  PENDIENTES.
- Cambios a los cerebros guardados y a las pestañas 1 y 2 (incluidos los dos
  arreglos de Reglas a mano anotados en PENDIENTES).

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `neuroevolucion`: la población por defecto pasa a 400; se agrega la función
  de fitness "ventaja sobre el tráfico", que pasa a ser la función por
  defecto; la élite pasa a 10 por
  defecto con rango de 0 a 20; se agregan el enfriamiento de la mutación, la
  cuenta de vehículos superados de un auto, el escenario por defecto del
  entrenamiento y el aprendizaje que se espera con los valores por defecto.
- `pestana-entrenar`: el tablero suma el indicador de vehículos superados del
  líder; la configuración básica suma el interruptor del enfriamiento; cambia
  una misión; los valores de ventaja se muestran con su propia unidad; se
  explican la función nueva y los valores por defecto.

## Impact

- **Núcleo:** `src/core/evolution.js` (función y unidad nuevas, estadística de
  ventaja, límites de la élite y regla de enfriamiento) y
  `src/core/training.js` (valores por defecto, registro de la ventaja en cada
  paso, cuenta de vehículos superados y fuerza de mutación de cada
  generación). Sin DOM y determinista, como hoy.
- **Pestaña 3:** `src/tabs/train/session.js` (indicadores y misiones),
  `src/tabs/train/settings.js` (ajuste nuevo) y `src/tabs/train/index.js`
  (cuarto indicador e interruptor del enfriamiento). El selector de fitness
  pasa de tres opciones a cuatro.
- **Biblioteca:** `src/ui/library-view.js` muestra la unidad nueva.
- **Textos:** `src/i18n/es.js` y `en.js`.
- **Pruebas:** nuevas para la función, la cuenta de superados y los valores
  por defecto. Cambian las aserciones existentes que enumeran los valores por
  defecto (fitness, élite, irregularidad, enfriamiento) y las de la misión de
  distancia. Se
  agrega la comprobación de aprendizaje, fuera de `npm test`.
- **Cerebros guardados:** siguen valiendo. Los que se entrenaron con distancia
  conservan su fitness en metros. Los nuevos registran si se entrenaron con
  enfriamiento.
- **Entrenamientos en curso:** los valores por defecto nuevos rigen para un
  entrenamiento nuevo o al restablecer la configuración.
- **Rendimiento:** la población por defecto se cuadruplica; la fluidez con 400
  autos no se midió. Además, una resta y una comparación más por auto y por
  paso. La
  cuenta de vehículos superados se hace solo para el líder, una vez por cuadro.
- **Dependencias y build:** ninguna nueva.
