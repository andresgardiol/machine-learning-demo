## 1. Inspeccionar (V1)

- [x] 1.1 `traceNow()` usa siempre la red de ahora (D1).
- [x] 1.2 `drawCase` saca la decisión real y la neurona que más aportó de la cuenta de la época del cuadro, y agrega la línea "con tus cambios" según D2 y D4.
- [x] 1.3 Textos `inspect.case.now`, `inspect.case.now.same` e `inspect.case.now.none` en español e inglés; quitar `inspect.case.changed` (D3).
- [x] 1.4 La línea se anuncia al lector de pantalla con la tarjeta, sin anunciarse en cada cuadro.

## 2. Entender (V2)

- [x] 2.1 Aplicar 1.1 a 1.4 en `src/v2/stages/entender/index.js`.

## 3. Pruebas

- [x] 3.1 Con el caso abierto, cambiar un sesgo cambia la cuenta que se ve en el mismo cuadro, en la V1 y en la V2.
- [x] 3.2 La tarjeta conserva la decisión real. La línea aparece solo con cambios, dice "lo mismo" o la acción nueva según el caso, y desaparece al deshacer todo.
- [x] 3.3 Ajustar las pruebas que esperaban `inspect.case.changed` y correr `npm test` completo.

## 4. Verificación manual

- [x] 4.1 En el navegador, en la V1 y en la V2:
  - chocar con el cerebro de ejemplo;
  - elegir una neurona;
  - mover su sesgo y ver que la red cambia en el acto;
  - comprobar que la tarjeta muestra la decisión real y la línea nueva;
  - deshacer y ver que la línea desaparece;
  - tomar capturas del antes y el después.
- [x] 4.2 Revisar el cambio contra el filtro de entrada de la propuesta.

## Notas de la implementación

- **Lógica compartida en `crash-case.js`.** `sameChangeList(a, b)` (D4) y `nowLineOf(real, nowTrace)` (D2) son funciones puras en `src/tabs/inspect/crash-case.js`, que ya usan la V1 y la V2. Así se prueban con `node --test` y las dos pestañas no duplican la regla.
- **Sin cambios, una sola cuenta.** `drawCase` calcula la cuenta de entonces aparte solo si la red cambió (`caseChanged()`) o si se mantiene apretado "Ver original". En los demás casos, la cuenta que se dibuja es la misma que la de entonces.
- **"Ver original" con el caso abierto.** La decisión real sale siempre de la red de entonces. Mientras se mantiene apretado, la línea "con tus cambios" se calcula con `changes` y no con la cuenta original que se dibuja. Si no, diría lo que decide la red original y no la de ahora. No lo probé en el navegador.
- **Sin decisión real ni ahora.** Si en el cuadro la red no accionaba nada y con los cambios tampoco, la línea dice "decidiría lo mismo", no "no accionaría nada".
- **"Elegir esta neurona"** usa la cuenta de entonces (`caseTrace()`), como pide D2.
- **1.4, el lector de pantalla.** La línea es la `caseNote` de siempre: un párrafo dentro de la tarjeta, sin `aria-live`. Se lee con la tarjeta y no se anuncia en cada cuadro. No agregué anuncios.
- **3.3.** Ninguna prueba esperaba `inspect.case.changed`. Agregué tres pruebas a `tests/inspect-crash-case.test.js`. `npm test`: 1606/1606.
- **Capturas** en `capturas/`: `antes-v1.jpg`, `antes-v2.jpg` (sesgo en −0,50 y la cuenta todavía con 0,00, con el aviso viejo) y `despues-v1.jpg`, `despues-v2.jpg` (la cuenta con −0,50, la neurona apagada y la línea "decidiría: Izquierda").
- **`.claude/launch.json`.** Agregué la configuración "choque" (puerto 8793). El archivo ya venía modificado.
