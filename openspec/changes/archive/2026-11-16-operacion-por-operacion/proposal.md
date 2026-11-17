# Paso de a operaciones: una sola cuenta por paso

## Por qué

En Inspeccionar, avanzar "de a Operación" hoy hace cuatro pasos por neurona:
todos los productos juntos, toda la suma junta, el sesgo y la activación. Con
seis entradas, el primer paso son seis multiplicaciones a la vez y el segundo
una suma de seis términos. La franja de abajo escribe números sin decir qué
es cada uno ("escalón(0,12) = 1,00"). La persona que quiere entender la
cuenta a bajo nivel no la puede seguir: está resumida justo donde debería
estar desarmada.

Leído en el código (no medido en el navegador):

- `src/core/pass-cursor.js`: `OPERATIONS = ['products', 'sum', 'bias', 'activation']`, cuatro por neurona, y la capa de entradas no tiene pasos.
- `src/tabs/inspect/describe.js`: la franja une todos los productos con " · " y no nombra ningún número.
- `styles/app.css`: `.inspect-op` tiene dos renglones y corta lo que no entra.

## Qué cambia

- **El paso de a operaciones pasa a ser una sola cuenta**: leer una entrada,
  multiplicar un valor por su peso, sumar ese aporte a lo que ya se juntó,
  sumar el sesgo, aplicar la activación. Una neurona con seis entradas son
  catorce pasos en vez de cuatro.
- **La cuenta de un cuadro empieza por las entradas**: cada entrada se lee en
  un paso, que dice qué mide y que una entrada no tiene peso ni sesgo.
- **La franja nombra cada número**: debajo de cada uno, qué es (valor de
  Sensor 3, peso de la conexión, aporte, suma hasta acá, sesgo, total,
  salida), con el resultado marcado, una frase que dice qué se hizo y un
  renglón con por dónde va la neurona.
- **El diagrama marca una sola conexión** de a operaciones, con la cuenta
  escrita sobre ella y la suma que se va juntando al lado de la neurona.
- **La tarjeta sigue la cuenta fila por fila.**
- **Paso atrás** (botón y tecla B) dentro del cuadro.
- **Un solo nombre para cada cosa**: lo que la tarjeta llama "Producto" pasa a
  llamarse "Aporte", como en la franja.

Lo que no cambia: los tamaños Cuadro, Capa y Neurona siguen resumiendo (con
un paso más al principio, el de las entradas), el Laboratorio, la cuenta
misma (`traceNetwork`) y lo que maneja el auto.

## Capacidades

### Modificadas

- `pestana-inspeccionar`: barra de reproducción (paso atrás), avance paso a
  paso (qué es una operación, entradas, atrás), operación en curso (franja
  con nombres), atajos (B); y dos requisitos nuevos: la tarjeta sigue la
  cuenta y la entrada que se lee se marca en la escena.
- `inspector-de-red`: paso animado (una conexión por vez, leer una entrada) y
  actividad en el momento (qué se marca de a operaciones, aportes y entradas
  sin calcular).

## Impacto

- Código: `src/core/pass-cursor.js`, `src/tabs/inspect/{describe,step-animation,index,missions,shortcuts}.js`, `src/render/{network-inspector,weight-table}.js`, `src/tabs/shared/neuron-card.js`, `styles/app.css`, `src/i18n/{es,en}.js` y sus pruebas.
- El Laboratorio usa el mismo inspector y la misma tarjeta con otro cursor:
  no debe cambiar a la vista, salvo el nombre "Aporte".
- **Orden de archivo**: este cambio modifica "Actividad en el momento" a
  partir de la versión de `vista-de-la-red`. `vista-de-la-red` se archiva
  antes que este.
