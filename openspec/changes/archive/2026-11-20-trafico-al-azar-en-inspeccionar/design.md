## Context

Inspeccionar (`src/tabs/inspect/index.js`) y Entender (`src/v2/stages/entender/index.js`) arman el mundo en `buildWorld()` con `seed: SEED`, donde `SEED = 1` es una constante del módulo. `restart()` llama a `world.reset()`, que conserva la semilla del mundo. Al volver a la pestaña con el mismo cerebro y los mismos ajustes, la pestaña recupera el mundo vivo (`state.live` / `restoreLive`) y no lo arma de nuevo.

En el resto de la aplicación ya hay dos formas de cambiar el tráfico:
- Conducir suma 1 a la semilla con "Tráfico nuevo".
- Competir tiene una serie de semillas (`createSeedSeries`, en `src/tabs/compete/seeds.js`) y un grupo de opciones "Tráfico de la carrera", armado con `optionGroup`.

El núcleo (`src/core/random.js`) no usa `Math.random` y tiene que seguir así.

## Goals / Non-Goals

**Goals:**
- Un tráfico distinto por defecto en cada intento nuevo de la pestaña 5, en la V1 y en la V2.
- "Repetir" para fijar el tráfico que se está viendo.
- La misma semilla sigue dando el mismo intento, y las repeticiones (Atrás, Reintentar desde acá, deslizador) no cambian.

**Non-Goals:**
- Escribir o mostrar el número de semilla.
- Guardar la opción.
- Cambiar Laboratorio, Competir, Conducir o Reglas.

## Decisions

**D1. La semilla es estado de la pestaña, elegida fuera del núcleo.**
- Un módulo puro nuevo, `src/tabs/inspect/traffic-seed.js`, exporta `createTrafficSeed({ random = Math.random } = {})`, con:
  - `current`: la semilla en uso;
  - `fresh()`: elige una semilla nueva, distinta de la actual, y la devuelve;
  - `mode` y `setMode('new' | 'repeat')`;
  - `forRestart()`: devuelve `fresh()` con `'new'` y `current` con `'repeat'`.
- La semilla es un entero de 1 a 2³¹−1 que sale de `random()`.
- `random` se puede inyectar, así las pruebas son deterministas.
- Entender importa el mismo módulo, igual que ya reusa otras piezas de la V1.
- `Math.random` se usa solo acá, en la capa de pestaña: el núcleo sigue recibiendo una semilla y siendo determinista.
- Alternativa descartada: una serie derivada de un contador, como en Competir. Daría la misma secuencia en cada apertura, que es justo lo que se quiere evitar.

**D2. Cuándo se elige una semilla nueva.**
- `buildWorld()` llama a `fresh()` en todos sus usos: al abrir, al cambiar de cerebro, al cambiar ajustes y al cambiar la velocidad del auto.
- `restoreLive()` no elige semilla: volver a la pestaña con lo mismo conserva el intento como quedó, según la decisión D13 que ya existe.
- `restart()` pasa a pedir `forRestart()`:
  - si la semilla cambia, arma el mundo con la semilla nueva, conservando el controlador, los cambios de la red y el modo de manejo; no llama a `buildWorld()`, para no volver a armar el estado de la red;
  - si la semilla no cambia, sigue con `world.reset()`.
- Ver si el mundo admite `reset({ seed })` o si hace falta crear otro mundo con `createWorld` y reemplazarlo. Se elige lo que menos toque el núcleo; si hay que crear otro mundo, se actualizan las referencias que `keepLive()` conserva.
- "Reintentar desde acá", "Atrás" y el deslizador restauran capturas del mismo mundo, así que conservan la semilla sin cambios.

**D3. La opción "Tráfico" en el panel.**
- Usa `optionGroup` con el mismo aspecto que en Competir.
- Las claves de texto son `inspect.traffic`, `inspect.traffic.new` e `inspect.traffic.repeat`, con sus `help.*.what/why` en `es.js` y `en.js`. La V2 usa las mismas claves si comparte los diccionarios; si no, se agregan en los suyos.
- Se ubica en el panel, cerca del cerebro elegido (en la V2, el lugar equivalente).
- Se oculta (`hidden`) cuando la pista del cerebro es un circuito.
- Cambiar la opción no reinicia nada.
- El valor vive en el estado de la pestaña, se inicializa en `'new'` y no pasa por `preferences`.

**D4. Pruebas.**
- Del módulo de semillas, con `random` inyectado:
  - `fresh()` da distinta de la actual;
  - `forRestart()` respeta el modo.
- De la pestaña, en las pruebas que ya montan Inspeccionar y Entender:
  - reiniciar con "Nuevo" cambia la semilla del mundo;
  - con "Repetir" la conserva;
  - "Reintentar desde acá" la conserva;
  - la opción se oculta en el óvalo.
- Si alguna prueba existente dependía de que la escena fuera siempre la de `SEED = 1`, se le inyecta un `random` fijo, sin volver a la constante en producción.

## Risks / Trade-offs

- **Un choque que no se repite.** Con "Nuevo", un choque interesante desaparece al reiniciar. Se mitiga con "Reintentar desde acá", que conserva el tráfico, y con "Repetir", que lo fija. El tooltip de "Repetir" lo dice.
- **Pruebas frágiles.** Las que asumían el tráfico de la semilla 1 pueden fallar. Se mitiga inyectando `random`.
- **Rendimiento.** Armar otro mundo al reiniciar cuesta lo mismo que hoy al cambiar ajustes. No toca el bucle de simulación ni el de dibujo.
