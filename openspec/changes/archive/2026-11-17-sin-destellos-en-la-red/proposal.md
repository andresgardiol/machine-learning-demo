# Sin destellos en la red

## Por qué

En Inspeccionar, y en el Laboratorio con tu manejo, mientras el auto maneja,
hay neuronas y acciones de la decisión que pasan de blanco a negro y vuelven
muchas veces por segundo. Molesta, distrae de lo que se quiere mostrar y
puede desencadenar crisis en personas con epilepsia fotosensible. La pauta
WCAG 2.3.1 pide no más de tres destellos por segundo.

Causa probable, leída en el código y en la captura del dueño (**no medida**):
las salidas usan el escalón (`network.js`: la salida es 1 si el total es
mayor que 0, si no 0), y los cerebros con escalón en las ocultas también
(el de la captura muestra 0,00 y 1,00). Cuando un total ronda el cero, el
valor salta entre 0 y 1 de un cuadro al siguiente, y el relleno de la neurona
salta entre apagado y blanco a 60 cuadros por segundo. Lo mismo las teclas de
"Decisión de la red". La primera tarea mide esto antes de cambiar nada.

**Concepto que hace visible**: una neurona "en el borde" es una cuyo total
anda cerca del umbral; en vez de destellar, se la muestra como tal.

## Qué cambia

- **Regla de toda la app**: ningún elemento cambia mucho de brillo más de
  tres veces en un segundo.
- **Neurona que titubea**: si una neurona, una conexión o una tecla de la
  decisión va a pasar ese límite, deja de destellar y se muestra quieta, con
  un rayado que dice "titubea" y el promedio de lo que valió en el último
  medio segundo. Vuelve a mostrarse exacta cuando se queda quieta un segundo.
- **En pausa y paso a paso, todo exacto**: ahí nada destella, y es donde se
  lee la cuenta.
- Un tooltip y la tarjeta de la neurona explican qué significa el rayado.

## Filtro de entrada

1. *Concepto*: una neurona cuyo total ronda el umbral cambia de opinión
   todo el tiempo; eso es información, no ruido visual.
2. *¿Se entiende solo?* El rayado tiene una entrada en la leyenda y un
   tooltip; la tarjeta dice "titubea entre 0 y 1".
3. *¿El mentor puede ignorarlo?* No hay nada que activar; en pausa no
   aparece.
4. *¿Si se usa mal?* No tiene controles. Pausar muestra el valor exacto.

**Público**: los dos; sobre todo quien es sensible a los destellos, que hoy
no puede mirar la pestaña. A nadie le quita información: el valor exacto
sigue en pausa y paso a paso.

## Fuera de alcance

- Cambiar la red o el escalón: la red decide igual; solo cambia cómo se
  dibuja mientras corre.
- El auto mismo, que puede sacudirse si la red cambia de idea seguido: eso es
  lo que hace la red, y su movimiento no es un destello de brillo.
- Una preferencia para volver a ver los destellos.

## Capacidades

### Nuevas

Ninguna.

### Modificadas

- `accesibilidad`: requisito nuevo "Sin destellos".
- `inspector-de-red`: requisito nuevo "Lo que titubea, quieto" para neuronas
  y conexiones del diagrama y de la tabla de pesos.
- `pestana-inspeccionar`: "Decisión de la red" suma la tecla que titubea.

## Impacto

- Código: módulo puro nuevo en `src/render/` que decide qué se muestra
  (sin DOM, con pruebas), `src/render/network-inspector.js`,
  `src/render/weight-table.js`, `src/render/network-view.js`,
  `src/tabs/shared/driving-cards.js` (`actionBlock`),
  `src/tabs/inspect/index.js`, `src/tabs/lab/index.js`, leyendas, textos en
  `src/i18n/{es,en}.js`, `styles/app.css`.
- No cambia el núcleo de simulación ni la red.
- Toca `network-inspector.js` y `lab/index.js` igual que
  `laboratorio-empieza-por-compuertas`; se implementa antes que ese, porque es
  un arreglo de salud.
