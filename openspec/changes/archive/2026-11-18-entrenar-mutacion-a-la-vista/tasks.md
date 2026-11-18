# Tasks

## 1. Antes

- [x] 1.1 Copiar `borradores/entrenar-la-generacion-ensena/capturar.mjs` a `borradores/entrenar-mutacion-a-la-vista/capturar.mjs` con las vistas de D5, y sacar el antes en `antes/` sobre el commit de partida, con su `indice.md`. Verificación: el índice lista las vistas.

  *Hecho: `borradores/entrenar-mutacion-a-la-vista/capturar.mjs`, copia del guion de `entrenar-la-generacion-ensena` con las vistas de D5: 30, la fuerza en 5 %, 40 % y 80 % con el enfriamiento apagado (un evento `input` por paso, como al arrastrar, y la foto 300 ms después), y 31, la de 40 % en inglés. El antes está en `antes/`, sobre `5b2a909` sin tocar `src/` ni `styles/`, con su `indice.md`.*

  *Medido (antes): al mover la fuerza, la red sigue con el líder en vivo y no hay renglón. `auditSistema()` da 1 en las vistas 30 y 31: «action-fill view-tab-pending», la marca de cambios pendientes de la pestaña Ajustes con el color de acción, porque apagar el enfriamiento deja un cambio pendiente. Ya estaba antes de este cambio.*

## 2. Lógica sin DOM

- [x] 2.1 `mutationPreview(network, { strength, rate })` con semilla propia (D1). Pruebas: el mismo pedido da el mismo hijo; fuerza 0 da la misma red y un diff vacío; no modifica la red del líder; una fuerza mayor da un promedio mayor (con fuerza 5 % y 80 %). Verificación: `npm test`.

  *Hecho: `src/tabs/train/preview.js`, `mutationPreview(network, { strength, rate })`: `mutate` con `randomFor(PREVIEW_SEED, 0)`, un generador nuevo en cada pedido, y `mutationDiff` del cambio anterior.*

  *Medido: `tests/mutation-preview.test.js`: el mismo pedido da el mismo hijo; fuerza 0 da la misma red y el diff vacío; no modifica la red del líder; con 80 % el promedio es más de diez veces el de 5 %; y con probabilidad 10 % cambian menos valores que con 100 %.*

- [x] 2.2 `networkCardMode({ preview, cut })` (D3), con pruebas de la prioridad y de la vuelta. Verificación: `npm test`.

  *Hecho: `networkCardMode({ preview, cut })` en `preview.js`: `'preview'`, `'cut'` o `'live'`, en ese orden de prioridad. `drawNetwork` dibuja según ese modo.*

  *Medido: prueba de la prioridad y de la vuelta (sin vista previa, `'cut'` si el corte sigue con su muestra; si no, `'live'`).*

- [x] 2.3 Determinismo: un entrenamiento con vistas previas simuladas da el mismo historial que uno sin ellas (escenario "El entrenamiento no cambia"). Verificación: `npm test`.

  *Medido: prueba "el entrenamiento no cambia": cuatro generaciones con una vista previa del líder cada 20 pasos (fuerzas de 5 a 55 %) dan el mismo historial (mejor y promedio) que sin vistas previas. Las pruebas de determinismo del cambio anterior (`generation-determinism`, valores de `e2a2c41`) siguen pasando.*

## 3. En la pestaña

- [x] 3.1 Conectar el deslizador (`input` y teclado) a la vista previa, con la red del líder congelada al empezar y el temporizador de 2000 ms (D2). Sin vista previa con el enfriamiento encendido. Verificación: escenarios "Mover la fuerza", "Fuerza cero", "Volver a la red en vivo", "Con el enfriamiento", "Teclado" y "Durante el corte" en el navegador.

  *Hecho: el `onInput` del deslizador de la fuerza llama a `startPreview` después de aplicar el ajuste. Con el enfriamiento, el deslizador tiene `aria-disabled` y su `onInput` sale antes, así que no hay vista previa. La primera vez se congela la red del líder; cada `input` guarda la fuerza, la probabilidad de los ajustes y el vencimiento (2000 ms). `drawNetwork` calcula el hijo y lo dibuja solo cuando cambió la fuerza, como mucho una vez por cuadro. En cada cuadro, al vencer, `endPreview` vuelve a la muestra del corte (si sigue) o a la red en vivo. Reiniciar termina la vista previa.*

  *Medido con el guion, reloj virtual (`verificacion/verificacion.json`):*
  - *"Mover la fuerza": a 60 %, a los 300 y a los 1300 ms el ejemplo dice «en promedio 0,44».*
  - *"Volver a la red en vivo": a los 2300 ms el renglón ya no está.*
  - *"Fuerza cero": «Ejemplo: con fuerza 0 % el hijo es igual al líder».*
  - *"Con el enfriamiento": la fuerza queda en 29, no hay vista previa y la ayuda sigue siendo `train.setting.strengthCooling`.*
  - *"Teclado": cinco flechas llevan la fuerza de 29 a 34 y muestran el ejemplo.*
  - *"Durante el corte" (con el corte en pausa, para que dure más que la vista previa): el ejemplo, después la muestra del corte («Un hijo: la mutación cambió 70 de 70…») y, al reanudar, la red en vivo.*

  *Observado en las capturas 30: a 5 % la red de ejemplo casi no se distingue de la del líder; a 80 % los trazos cambian de grosor y de signo. Con la probabilidad por defecto (100 %), los 70 valores llevan rombo con cualquier fuerza: los rombos no dicen cuánto se alejó cada valor, eso lo dicen los trazos y el promedio. No hice la prueba exacta "de 10 % a 60 %": al apagar el enfriamiento la fuerza queda en 29, y el guion la lleva de 29 a 60.*

- [x] 3.2 El renglón y su anuncio (D4), en `es.js` y `en.js`. Verificación: escenario "Idioma"; las pruebas de i18n y de largo de textos; `mlLab.auditTooltips()` sin problemas.

  *Hecho: `train.network.preview` y `train.network.preview.zero` en `es.js` y `en.js`. El renglón es el mismo `sampleLine` (`role="status"`). Mientras se arrastra tiene `aria-live="off"`; al soltar (`change`) o a los 500 ms sin cambios pasa a `polite` y se vuelve a escribir, para que se anuncie una vez.*

  *Medido: en inglés, «Example: one child with strength 40% · 70 of 70 changed, by 0.23 on average» ("Idioma"). La prueba de i18n (paridad y parámetros) pasa; `auditTooltips()` da 0 en las 33 vistas. En el guion, a los 300 ms de arrastrar el renglón tiene `aria-live` en `off`, y a los 1300 ms en `polite`.*

  *No probado: el anuncio real con un lector de pantalla.*

## 4. Cierre

- [x] 4.1 Fluidez mientras se arrastra el deslizador a 1×, con el guion de fluidez del cambio anterior. Verificación: cuadros por segundo y cuadro más lento anotados.

  *Hecho: `medir-fluidez.mjs` (copia del del cambio anterior) suma la medida a 1× mientras se arrastra la fuerza: un evento `input` por cuadro durante 2 s, de 5 a 80 % y vuelta.*

  *Medido (tiempo real, tres corridas): arrastrando, 60 cuadros por segundo, mediana de 16,7 ms, el más lento de 16,8 ms y ninguno de más de 20 ms, con 122 eventos; el manejador de cada `input` tardó como mucho 0,4 ms. El corte a 1× y Máx. sin cortes siguen en 60 cuadros por segundo y 16,8 ms.*

- [x] 4.2 `npm test` completo y las tres auditorías en las vistas del guion, en los dos idiomas. Verificación: resultados anotados.

  *Medido: `npm test`, 1464 pruebas, 0 fallas. En las 33 vistas del guion (español e inglés): `auditTooltips()` 0 y `auditHierarchy()` 0. `auditSistema()` da 0, salvo dos problemas que ya estaban antes y no se arreglaron: después de guardar, «compact Renombrar 24px»; y en las vistas 30 y 31, «action-fill view-tab-pending», la marca de cambios pendientes de la pestaña Ajustes, que usa el color de acción.*

- [x] 4.3 El después con el mismo guion y `comparacion.md`. Verificación: la comparación muestra la vista previa con 5 %, 40 % y 80 %, con más marcas lejos de su valor cuanto mayor es la fuerza.

  *Hecho: `despues/` con el mismo guion, `verificacion/` con los escenarios en el tiempo y `comparacion.md`.*

  *Medido: con 5 %, 40 % y 80 %, el promedio del renglón es 0,04, 0,30 y 0,59. Observado en las capturas: a 5 % la red de ejemplo es casi la del líder, y a 80 % los trazos cambian de grosor y de signo. Con la probabilidad en 100 %, la cantidad de marcas es la misma (70 de 70) con las tres fuerzas: la diferencia está en cuánto se alejan, que muestran los trazos y el promedio, no los rombos.*

- [x] 4.4 Verificación en el navegador contra el filtro de entrada: se entiende que es un ejemplo; se va sola; no cambia el entrenamiento; con el enfriamiento no aparece. Anotar lo que no se pudo probar.

  *Observado: el renglón empieza con «Ejemplo: un hijo» y la red no tiene actividad en vivo mientras dura. Se va sola a los 2 s. No cambia el entrenamiento (prueba de 2.3). Con el enfriamiento no aparece.*

  *No probado: el anuncio con un lector de pantalla; Firefox; una ventana visible; un arrastre real con el mouse (el guion manda eventos `input` y teclas); que se entienda como ejemplo sin ayuda, lo que solo se sabe con personas.*

## Workflow follow-up

- Archivar con `/opsx:archive` después de revisar `comparacion.md`.
