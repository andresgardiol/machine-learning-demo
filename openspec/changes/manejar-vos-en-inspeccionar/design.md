# Diseño

## Contexto

Leído en el código (no medido):

- `src/tabs/inspect/index.js` (`buildWorld`) arma el mundo con un solo auto
  cuyo controlador es `createTraceController(net, …)`
  (`src/core/network-trace.js`): calcula la cuenta (`lastTrace`) y devuelve
  los controles. La vista lee esa cuenta para el diagrama y la decisión.
- `state.manual` en Inspeccionar ya existe y significa **entradas a mano**
  (sensores puestos a mano en pausa). Lo nuevo no puede llamarse igual.
- `src/input/keyboard.js` ya es un controlador (`control(perception)`) que
  ignora campos de texto y deslizadores, evita el desplazamiento con flechas,
  suelta todo al perder el foco, y respeta el interruptor de atajos.
- Las flechas con el foco en el diagrama recorren neuronas
  (`network-inspector.js`); sobre la pastilla cambian el peso.
- `actionBlock` (`src/tabs/shared/driving-cards.js`) es una fila de cuatro
  teclas.

## Objetivos / No objetivos

**Objetivos**
- Reusar el controlador de teclado y el de la red tal cual, combinados.
- Que el diagrama y el paso a paso no sepan quién maneja.

**No objetivos**
- Grabar ejemplos, misiones nuevas, flechas en la escena.

## Decisiones

### D1. Controlador con observador en el núcleo
`src/core/controller.js`:

```
createObservedController({ driver, observer })
  .control(perception) → driver.control(perception)   // y antes observer.control(perception)
  .setDriver(c) / .driver / .observer
```

Llama primero al observador (la red, que guarda `lastTrace`) y después al que
maneja; devuelve solo lo del que maneja. Puro, sin DOM. El mundo de
Inspeccionar usa siempre este controlador: con la red manejando, `driver` y
`observer` son la misma red (una sola llamada, para no calcular dos veces).
Cambiar quién maneja es `setDriver`, sin rearmar el mundo, así el intento no
vuelve a empezar.

*Alternativa*: rearmar el mundo con otro controlador; reiniciaría el intento.
*Alternativa*: calcular la red aparte en la pestaña, fuera del mundo; la
percepción podría ser la de otro cuadro y la cuenta diferiría de lo que vio el
auto.

### D2. Estado de la pestaña: quién maneja
`state.driver: 'network' | 'you'` (no `manual`, que ya son las entradas a
mano). No se conserva al salir de la pestaña: al ocultarse vuelve a
`'network'` (escenario "Cambiar de pestaña"). Cambiar de cerebro o de pista
rearma el mundo y respeta `state.driver`.

### D3. Cuándo las flechas toman el volante
Un `keydown` de flecha (o W/A/S/D con atajos encendidos) toma el volante solo
si `document.activeElement` es la escena, `body`, o un botón común; nunca si
es el diagrama, una pastilla, un deslizador, un grupo de opciones (que usan
las flechas) o un campo de texto. "Manejar vos" deja el foco en la escena
(`tabindex="0"` si no lo tiene) para que las flechas sigan andando.

Al tomar el volante, si la reproducción no estaba de a cuadros en tiempo real,
pasa a eso y reproduce. En pausa las flechas no mueven el auto, pero el
teclado sigue registrando qué está apretado, así N de a cuadros usa esas
teclas (escenario "Un cuadro con N").

### D4. Decisión en dos filas y coincidencia
`actionBlock` gana una variante de dos filas (`actionCompare()`), con una
marca por acción (✓ o ✗, con texto oculto para lector) según coincidan.
Coincidencia: una cola circular de los últimos 600 cuadros (10 s a 60
cuadros por segundo, el paso fijo de la simulación) con 1 si las cuatro
acciones coinciden; se muestra el porcentaje redondeado. El anuncio al lector
es por cambio de lo apretado o de lo que haría la red, como mucho cada 2 s.

Con `sin-destellos-en-la-red` implementado, la fila "La red" pasa por la
guarda de destellos igual que la decisión de una fila.

### D5. Aviso en la escena
Un rótulo fijo arriba de la escena, "Manejás vos · la red solo mira", con el
botón "Devolver el volante". Reusa el estilo del aviso de entradas a mano;
si los dos están a la vez, se apilan.

## Riesgos / Compromisos

- [Las flechas compiten con el recorrido del diagrama] → D3: solo toman el
  volante con el foco fuera de controles que las usan.
- [El tablero de Inspeccionar deja de entrar con una fila más] → medir a
  1440×900 y 1366×768; si no entra, las dos filas van más bajas (solo íconos,
  con el nombre en el tooltip). Parar y consultar si no alcanza.
- [Manejar a 60 cuadros con la red grande pierde fluidez porque la red se
  calcula igual] → no cambia el costo respecto de hoy (la red ya se calcula
  cada cuadro). Medir igual.
- [La escena deja de ser determinista] → solo mientras maneja la persona; con
  la red manejando sigue igual (escenario "Estado por defecto").
