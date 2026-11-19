# Tasks

## 1. Volver al volante directo

- [x] 1.1 Quitar el volante suave del controlador de teclado: `src/input/keyboard.js` vuelve a devolver izquierda y derecha mientras la flecha está apretada; se borra `src/input/steering.js` y los usos en Inspeccionar, el Laboratorio y El problema. Conviene partir de `git show 2474a7f` para ver qué se agregó. Verificación: escenarios de *Controlador de teclado*, incluida "Respuesta inmediata", con una prueba en `tests/keyboard.test.js`.

  *Hecho: `src/input/keyboard.js`, `src/tabs/inspect/index.js` y `src/tabs/lab/index.js` vuelven a su versión de antes de `2474a7f` (nadie los había tocado después): el teclado devuelve lo apretado en cada cuadro, sin `held()`, `display()` ni `last`. Se borra `src/input/steering.js`. En El problema, la acción y la cinta leen `keyboard.control()`. Prueba nueva en `tests/keyboard.test.js`: "respuesta inmediata", la izquierda en los seis primeros cuadros y nada al soltar.*

  *Medido (Chrome sin ventana, `verificacion-directo`): con avanzar apretado, el primer paso después de la flecha izquierda ya gira: 0,06 rad en 2 pasos (0,03 por paso, el giro completo de `TURN_RATE`); 0,21 rad a los 7 pasos ("Respuesta inmediata", "Dos teclas a la vez"). Al soltar, deja de girar ("Soltar la tecla").*
- [x] 1.2 "Lo que estás accionando": Izquierda y Derecha vuelven a resaltarse enteras, sin relleno proporcional ni porcentaje; se quitan los textos y el tooltip del volante en `es.js` y `en.js` y los estilos que queden sin uso. La cinta del manejo y el cartel de primer manejo no cambian, salvo que la cinta toma lo que devuelve el controlador. Verificación: escenario "Presionar una tecla" de *Acción visible* en el navegador; `auditTooltips()` y `auditSistema()` sin problemas nuevos en El problema.

  *Hecho: `actionBlock` pierde la opción `steer` (el relleno, el porcentaje y el tooltip de Izquierda y Derecha); se borran `help.drive.action.steer.*` en los dos idiomas y los estilos de `--steer-level` y `.action-level`. La cinta y el cartel no cambian; la cinta guarda lo que devuelve el controlador en cada paso.*

  *Medido (Chrome sin ventana): con la flecha izquierda, la tecla se enciende entera desde el primer cuadro (`data-on="true"`, sin relleno ni porcentaje) y se apaga al soltarla ("Presionar una tecla"); el último cuadro de la cinta dice izquierda mientras está apretada y no después. `auditTooltips()`, `auditSistema()` y `auditHierarchy()` en 0 en El problema.*
- [x] 1.3 Pruebas: se borran `tests/steering.test.js` y `tests/steering-others.test.js`; `inspect-driver`, `shortcuts-toggle`, `world-circuit` y las demás que hablen del volante vuelven a esperar el comportamiento directo. Verificación: `npm test` sin fallas, y `grep -rn "STEER_RAMP\|steering" src tests` sin resultados.

  *Hecho: se borran `tests/steering.test.js` y `tests/steering-others.test.js`; `keyboard.test.js`, `inspect-driver.test.js` y `shortcuts-toggle.test.js` vuelven a su versión de antes del volante suave (más la prueba nueva de la 1.1). `world-circuit` no hablaba del volante.*

  *Medido: `npm test`, 1497 pruebas, todas pasan. `grep -rn "STEER_RAMP\|steering" src tests` no da resultados.*
- [x] 1.4 Medir en Node el giro de un toque de 6 cuadros a 20 m/s: tiene que dar lo mismo que el antes de `manejo-amable-y-competir-sin-cortes` (0,18 rad y 3,58 m de corrimiento en 1 s). Verificación: la medida anotada acá.

  *Medido (Node, `borradores/manejo-amable-y-competir-sin-cortes/medir-giro.mjs`, con el controlador de teclado real del código, 20 m/s, la flecha arriba apretada): un toque de izquierda de 6 cuadros gira en los 6, 0,18 rad (10,3°), y corre el auto 3,58 m de costado en el segundo siguiente, igual que el antes de `manejo-amable-y-competir-sin-cortes`. Mantener 60 cuadros: gira 29 cuadros y se sale de la calle, también igual.*
