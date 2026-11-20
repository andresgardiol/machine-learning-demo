## Context

En `src/tabs/inspect/index.js:295` (y en `src/v2/stages/entender/index.js:294`) la cuenta de la red es:

```js
const traceNow = () => traceNetwork(net, currentInputs(), originalHeld ? null : crash ? changesOf(caseFrame().epoch) : changes);
```

Con el caso abierto, se usa la época de los cambios de prueba guardada con el cuadro, que es la red de entonces. Fuera del caso, se usa `changes`, la red de ahora. `drawCase(trace)` calcula la decisión y la neurona que más aportó a partir de esa misma cuenta, y `caseChanged()` muestra el aviso `inspect.case.changed`.

## Goals / Non-Goals

**Goals:**
- Con el caso abierto, la red que se ve responde a los cambios en el acto.
- La tarjeta del choque conserva la verdad de lo que pasó y dice qué haría la red de ahora.

**Non-Goals:**
- Volver a simular el intento.
- Cambiar la memoria de cuadros o "Reintentar desde acá".

## Decisions

**D1. Una sola regla para la cuenta que se ve.**
- `traceNow()` usa siempre `changes` (o `null` con "Ver original"), con el caso abierto o sin él.
- La memoria de cuadros sigue guardando la época, porque hace falta para D2.

**D2. Dos cuentas para la tarjeta del choque.**
- `drawCase` recibe la cuenta de ahora, la que ya se dibuja, y calcula aparte la de entonces: `traceNetwork(net, currentInputs(), changesOf(caseFrame().epoch))`, solo cuando hay un caso abierto.
- La decisión y la neurona que más aportó salen de la de entonces.
- Si `caseChanged()` (la época del cuadro es distinta de la actual), la línea nueva usa `decisionOf` de la de ahora:
  - si da la misma acción, el texto es `inspect.case.now.same`;
  - si da otra, `inspect.case.now` con `{action}`;
  - si no da ninguna, `inspect.case.now.none`.
- "Elegir esta neurona" sigue eligiendo la neurona de la decisión real.

**D3. Textos.**
- Se agregan `inspect.case.now`, `inspect.case.now.same` e `inspect.case.now.none` en `es.js` y `en.js`.
- Se borra `inspect.case.changed` y su uso, y se ajustan las pruebas que lo esperaban.
- La línea va en el lugar de `caseNote` y reemplaza su texto, sin crear otro elemento, para no mover el diseño de la tarjeta.

**D4. "Con tus cambios" quiere decir que la época del cuadro es distinta de la de ahora.**
- Si la persona cambia algo y lo deshace del todo, la lista de la época de ahora puede ser otro objeto aunque esté vacía.
- Para decidir si la línea se ve, se comparan las listas de cambios (`epoch.list` contra la del cuadro) por contenido, no las referencias.

## Risks / Trade-offs

- **Dos cuentas por cuadro.** Calcular dos cuentas con el caso abierto duplica el costo de la cuenta de un cuadro, que es una red chica. Pasa solo en pausa, al mover el deslizador o un control, así que el impacto en el rendimiento no se nota.
- **La decisión de abajo no coincide con la real.** Con cambios, la decisión debajo de la escena (la de ahora) puede no coincidir con la de la tarjeta del choque (la real). Se mitiga con la línea, que lo explica en el momento.
