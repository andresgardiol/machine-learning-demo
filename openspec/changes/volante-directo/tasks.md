# Tasks

## 1. Volver al volante directo

- [ ] 1.1 Quitar el volante suave del controlador de teclado: `src/input/keyboard.js` vuelve a devolver izquierda y derecha mientras la flecha está apretada; se borra `src/input/steering.js` y los usos en Inspeccionar, el Laboratorio y El problema. Conviene partir de `git show 2474a7f` para ver qué se agregó. Verificación: escenarios de *Controlador de teclado*, incluida "Respuesta inmediata", con una prueba en `tests/keyboard.test.js`.
- [ ] 1.2 "Lo que estás accionando": Izquierda y Derecha vuelven a resaltarse enteras, sin relleno proporcional ni porcentaje; se quitan los textos y el tooltip del volante en `es.js` y `en.js` y los estilos que queden sin uso. La cinta del manejo y el cartel de primer manejo no cambian, salvo que la cinta toma lo que devuelve el controlador. Verificación: escenario "Presionar una tecla" de *Acción visible* en el navegador; `auditTooltips()` y `auditSistema()` sin problemas nuevos en El problema.
- [ ] 1.3 Pruebas: se borran `tests/steering.test.js` y `tests/steering-others.test.js`; `inspect-driver`, `shortcuts-toggle`, `world-circuit` y las demás que hablen del volante vuelven a esperar el comportamiento directo. Verificación: `npm test` sin fallas, y `grep -rn "STEER_RAMP\|steering" src tests` sin resultados.
- [ ] 1.4 Medir en Node el giro de un toque de 6 cuadros a 20 m/s: tiene que dar lo mismo que el antes de `manejo-amable-y-competir-sin-cortes` (0,18 rad y 3,58 m de corrimiento en 1 s). Verificación: la medida anotada acá.
