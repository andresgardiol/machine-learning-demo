# Tasks

## 1. Antes

- [ ] 1.1 Copiar `borradores/entrenar-la-generacion-ensena/capturar.mjs` a `borradores/entrenar-mutacion-a-la-vista/capturar.mjs` con las vistas de D5, y sacar el antes en `antes/` sobre el commit de partida, con su `indice.md`. Verificación: el índice lista las vistas.

## 2. Lógica sin DOM

- [ ] 2.1 `mutationPreview(network, { strength, rate })` con semilla propia (D1). Pruebas: el mismo pedido da el mismo hijo; fuerza 0 da la misma red y un diff vacío; no modifica la red del líder; una fuerza mayor da un promedio mayor (con fuerza 5 % y 80 %). Verificación: `npm test`.
- [ ] 2.2 `networkCardMode({ preview, cut })` (D3), con pruebas de la prioridad y de la vuelta. Verificación: `npm test`.
- [ ] 2.3 Determinismo: un entrenamiento con vistas previas simuladas da el mismo historial que uno sin ellas (escenario "El entrenamiento no cambia"). Verificación: `npm test`.

## 3. En la pestaña

- [ ] 3.1 Conectar el deslizador (`input` y teclado) a la vista previa, con la red del líder congelada al empezar y el temporizador de 2000 ms (D2). Sin vista previa con el enfriamiento encendido. Verificación: escenarios "Mover la fuerza", "Fuerza cero", "Volver a la red en vivo", "Con el enfriamiento", "Teclado" y "Durante el corte" en el navegador.
- [ ] 3.2 El renglón y su anuncio (D4), en `es.js` y `en.js`. Verificación: escenario "Idioma"; las pruebas de i18n y de largo de textos; `mlLab.auditTooltips()` sin problemas.

## 4. Cierre

- [ ] 4.1 Fluidez mientras se arrastra el deslizador a 1×, con el guion de fluidez del cambio anterior. Verificación: cuadros por segundo y cuadro más lento anotados.
- [ ] 4.2 `npm test` completo y las tres auditorías en las vistas del guion, en los dos idiomas. Verificación: resultados anotados.
- [ ] 4.3 El después con el mismo guion y `comparacion.md`. Verificación: la comparación muestra la vista previa con 5 %, 40 % y 80 %, con más marcas lejos de su valor cuanto mayor es la fuerza.
- [ ] 4.4 Verificación en el navegador contra el filtro de entrada: se entiende que es un ejemplo; se va sola; no cambia el entrenamiento; con el enfriamiento no aparece. Anotar lo que no se pudo probar.

## Workflow follow-up

- Archivar con `/opsx:archive` después de revisar `comparacion.md`.
