## 1. Semilla de la pestaña

- [x] 1.1 Crear `src/tabs/inspect/traffic-seed.js` (D1), un módulo puro sin DOM, con `random` inyectable.
- [x] 1.2 Agregar `tests/inspect-traffic-seed.test.js`:
  - `fresh()` da una semilla distinta de la actual y dentro del rango;
  - `forRestart()` da una nueva con `'new'` y la misma con `'repeat'`;
  - con el mismo `random` inyectado, el resultado es el mismo.

## 2. Inspeccionar (V1)

- [x] 2.1 Reemplazar `SEED` por la semilla de la pestaña: `buildWorld()` usa `fresh()` y `restoreLive()` no elige semilla (D2).
- [x] 2.2 Hacer que `restart()` siga la opción (D2):
  - con una semilla nueva, arma el mundo de nuevo y conserva el controlador, los cambios y el modo de manejo;
  - con la misma semilla, sigue con `world.reset()`.
- [x] 2.3 Comprobar que "Atrás", el deslizador y "Reintentar desde acá" conservan la semilla.
- [x] 2.4 Agregar la opción "Tráfico" (Nuevo / Repetir) al panel con `optionGroup` (D3):
  - se oculta en los circuitos;
  - cambiarla no reinicia;
  - empieza en "Nuevo" y no se guarda.
- [x] 2.5 Textos y tooltips en español y en inglés para `inspect.traffic`, `inspect.traffic.new` e `inspect.traffic.repeat` (`help.*.what/why`). El tooltip de "Repetir" dice que sirve para probar un caso en particular.

## 3. Entender (V2)

- [x] 3.1 Aplicar 2.1 a 2.3 en `src/v2/stages/entender/index.js` con el mismo módulo de semillas.
- [x] 3.2 Agregar la opción "Tráfico" en el lugar equivalente del panel de la V2, con los componentes de la V2, los mismos textos y tooltips, y oculta en los circuitos.

## 4. Pruebas de la pestaña

- [x] 4.1 En las dos versiones, con `random` inyectado:
  - reiniciar con "Nuevo" cambia la semilla del mundo;
  - con "Repetir" la conserva;
  - "Reintentar desde acá" la conserva;
  - en el óvalo la opción no se ve.
- [x] 4.2 Ajustar las pruebas que dependían de `SEED = 1`, inyectando un `random` fijo, y correr `npm test` completo.

## 5. Verificación manual

- [x] 5.1 En el navegador, en la V1 y en la V2:
  - abrir la pestaña dos veces y ver tráficos distintos;
  - reiniciar con R y ver otro tráfico;
  - elegir "Repetir", reiniciar y ver el mismo;
  - chocar, usar "Reintentar desde acá" y ver el mismo tráfico;
  - elegir un cerebro del óvalo y ver que la opción desaparece;
  - leer los tooltips en los dos idiomas.
- [x] 5.2 Revisar el cambio contra el filtro de entrada de la propuesta y dejar capturas del antes y el después del panel.

## Notas de la implementación

**Decisiones tomadas al implementar:**
- **Pruebas de la pestaña (4.1).** El repositorio no monta Inspeccionar ni Entender en las pruebas, porque no hay DOM. Las pruebas de 4.1 están en `tests/inspect-traffic-seed.test.js` y cubren tres cosas:
  - la regla de reinicio de las dos pestañas con mundos del núcleo armados igual que en `makeWorld`;
  - la restauración de un cuadro (Reintentar desde acá y Atrás);
  - una lectura del código de las dos pestañas: usan `createTrafficSeed`, `fresh()` en `buildWorld()`, `forRestart()` en `restart()` y ocultan la opción con `showsTrafficOption`.
  
  El resto se verificó en el navegador (5.1).
- **Inyectar el azar.** `resetState({ random })` en las dos pestañas fija el azar del tráfico para pruebas. `Math.random` aparece solo como valor por defecto en `traffic-seed.js`.
- **Reiniciar.** `world.reset()` no admite otra semilla, y el núcleo no se tocó. Con una semilla nueva, `restart()` arma otro mundo con `makeWorld(seed)`, que reusa el controlador (con sus cambios y quién maneja). `buildWorld()` usa la misma función. Las referencias de `keepLive()` se actualizan porque `restart()` ya llamaba a `keepLive()`.
- **Circuitos.** En un circuito, reiniciar no pide semilla (`world.reset()`). La opción se oculta según la pista vigente (`state.settings.track`). Por eso también se oculta si se elige el óvalo en la barra, y no solo con un cerebro del óvalo.
- **V2.** `segments` (`src/v2/components/controls.js`) acepta ahora un `help` por opción, para que "Nuevo" y "Repetir" tengan tooltip propio. Las opciones que no lo pasan no cambian. Los textos se agregaron también en `src/v2/i18n/`, con las mismas claves.
- **Lugar de la opción en la V2.** Va en la hoja "Etapa" del cuaderno, debajo del cerebro elegido.
