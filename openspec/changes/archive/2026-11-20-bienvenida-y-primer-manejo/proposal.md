## Why

Alguien que llega solo a la aplicación no sabe por dónde empezar. En El
problema el tráfico arranca antes de que la persona toque una tecla, se aleja
y cuesta alcanzarlo. Los rayos de los sensores se ven desde el primer cuadro,
antes de que la pestaña los haya presentado. Además, arrastrar el escenario
para mirar mejor hace que la cámara deje de seguir al auto, y el auto se va
de la pantalla. El dueño lo pidió el 20 de noviembre de 2026, a partir de una
captura del óvalo con el auto siguiéndose.

Concepto que hace visible: ninguno nuevo. El cambio habilita el primero de la
app, "un auto percibe con sensores y decide con controles": la persona llega,
sabe qué hacer y maneja con el tráfico cerca antes de mirar los sensores.

## What Changes

- **Paneo que sigue al auto.** En el escenario, arrastrar corre el lugar del
  auto en la pantalla y la cámara lo sigue desde ahí. Si el arrastre sacaría
  al auto de la pantalla, la cámara deja de seguirlo, igual que con el zoom.
  Restablecer la vista (botón o V) vuelve a poner el auto en su lugar de
  siempre. Con el circuito entero a la vista, el paneo funciona como hoy.
  Vale para toda escena con cámara que sigue a un auto. No cambia el diagrama
  de la red.
- **El tráfico espera al conductor en El problema.** Al abrir la pestaña y en
  cada intento nuevo (reiniciar, tráfico nuevo o cambiar la pista), nada se
  mueve hasta la primera tecla de manejo. Con esa tecla arrancan juntos el
  auto, el tráfico, el reloj y la cinta.
- **Sensores apagados por defecto en El problema.** El interruptor de sensores
  arranca apagado: no se ven los rayos y las barras del tablero siguen
  mostrando las lecturas. "Ver como la máquina" sigue mostrando los rayos,
  como hoy.
- **Ventana de bienvenida.** En la primera visita aparece, sobre El problema
  ya listo, una ventana que dice en pocas líneas qué es la aplicación y por
  dónde empezar. Tiene una acción principal, "Empezar a manejar", que la
  cierra y deja el foco en el escenario. Se cierra también con Escape o con la
  cruz. No vuelve a aparecer sola. Se vuelve a abrir desde la ventana de
  créditos.

### Filtro de entrada

**Paneo que sigue al auto**
1. Concepto: ninguno nuevo. Deja mirar los rayos o el tráfico de cerca sin
   perder al auto, que es lo que se está estudiando.
2. ¿Se entiende solo? Sí: el auto sigue en pantalla donde la persona lo
   dejó.
3. ¿El mentor puede ignorarlo? Sí: no agrega controles.
4. Mal uso y vuelta atrás: si se arrastra de más, la cámara deja de seguir
   (como hoy). Restablecer la vista vuelve al encuadre por defecto.

**Tráfico que espera**
1. Concepto: causa y efecto. El mundo empieza cuando el conductor decide, y
   el tráfico queda a la vista para practicar esquivar.
2. ¿Se entiende solo? El cartel de primer manejo ya dice qué tecla apretar.
   Con la guía apagada, la escena quieta con el auto parado se entiende como
   "esperando".
3. ¿El mentor puede ignorarlo? Sí: con la primera tecla todo sigue como hoy.
4. Mal uso y vuelta atrás: no hay estado nuevo que deshacer. Reiniciar vuelve
   a la espera.

**Sensores apagados por defecto**
1. Concepto: percepción. Se ve primero la calle y después, al encenderlos, lo
   que mide el auto (un concepto por vez).
2. ¿Se entiende solo? El interruptor ya existe, con su tooltip, y las barras
   siguen a la vista.
3. ¿El mentor puede ignorarlo? Sí: lo enciende con un clic.
4. Mal uso y vuelta atrás: se vuelve a encender con el mismo interruptor.

**Ventana de bienvenida**
1. Concepto: el recorrido. Primero se maneja, después se le enseña a una
   máquina a manejar.
2. ¿Se entiende solo? Es su propósito: unas pocas líneas y una sola acción.
3. ¿El mentor puede ignorarla? Sí: se cierra una vez y no vuelve. Se puede
   cerrar antes de la clase.
4. Mal uso y vuelta atrás: si se cierra sin leer, se vuelve a abrir desde
   créditos. Si el navegador no guarda preferencias, aparece en cada visita
   y se cierra igual.

### Público

Sirve sobre todo al principiante que llega solo. Al mentor no lo entorpece:
la ventana sale una vez por navegador, la espera del tráfico termina con la
primera tecla y los sensores se encienden con un clic.

### Fuera de alcance

- El recorrido guiado completo (Prioridad 1, punto 3 de PENDIENTES.md). La
  bienvenida podrá ser su puerta de entrada, pero acá solo dice por dónde
  empezar.
- La espera del tráfico en otras pestañas (Inspeccionar, Entrenar, Reglas a
  mano, Competir).
- El paneo del diagrama de la red en Inspeccionar y el Laboratorio.
- Recordar entre visitas el estado del interruptor de sensores.
- La V2 de la interfaz.

## Capabilities

### New Capabilities

Ninguna.

### Modified Capabilities

- `vista-escenario`: el paneo ya no deja de seguir al auto, sino que corre su
  lugar en la pantalla. Deja de seguirlo solo si el auto saldría de la
  pantalla.
- `pestana-conducir`: el estado por defecto tiene los sensores ocultos, el
  tráfico espera a la primera tecla de manejo en cada intento y el
  interruptor de sensores arranca apagado.
- `estructura-app`: nueva ventana de bienvenida en la primera visita, que se
  recuerda como vista y se puede volver a abrir. Se ajusta "Lista para usar
  al abrir" para admitirla sobre la pestaña ya lista.

## Impact

- `src/render/camera.js`: el paneo con auto seguido corre el punto de
  seguimiento. `src/render/view.js` se lo pide al arrastrar.
  `network-inspector.js` no cambia.
- `src/tabs/drive/index.js`: la pestaña no avanza el mundo hasta la primera
  tecla de manejo del intento, y `showSensors` arranca en `false`.
- `src/ui/app.js` y `src/ui/preferences.js`: la ventana de bienvenida, su
  marca de vista y el enlace para reabrirla desde créditos.
- `src/i18n`: textos nuevos en español e inglés.
- Pruebas: `tests/camera.test.js` y las de la pestaña y las preferencias.
- Sin dependencias nuevas ni paso de build. El núcleo (`src/core`) no cambia.
