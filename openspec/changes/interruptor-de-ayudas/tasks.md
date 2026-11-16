# Tareas

## 1. Preferencia e interruptor

- [x] 1.1 `preferences.js`: `hints` (`mlLab.hints`), por defecto encendido; sin valor guardado toma el de la guía (design.md D4). Pruebas. Verificar "Ayudas apagadas en la segunda visita" y "Quien tenía la guía apagada".
  *Hecho. `hints` en `preferences.js` (`mlLab.hints`, 'on' u 'off'); sin valor guardado devuelve el de la guía. Prueba nueva: encendidas por defecto, apagadas en la segunda visita, quien tenía la guía apagada abre con ellas apagadas, y sin almacenamiento encendidas.*
- [x] 1.2 `app.js`: interruptor "Ayudas" entre "Guía" y "Atajos", con su CSS en el mismo guardado; estado en el store. Textos en `es.js` y `en.js` (D5). Verificar los escenarios de "Interruptor de ayudas".
  *Hecho. Interruptor `#hints-switch` (`role="switch"`, la misma clase `switch`, sin CSS nuevo) entre Guía y Atajos; `hints` en el store, se guarda al cambiar. Textos de D5; la ayuda de "Guía" ya no nombra los tooltips. Lo que hace apagarlo es el grupo 2.*
- [ ] 1.3 Medir la barra de arriba a 1440, 1366, 1236 y 1032 px de ancho, en español y en inglés: un renglón, nada cortado. **Si no entra, parar y consultar.**
  *En consulta (`ayudas-consulta-1.3.md`): con "Ayudas", la barra de pestañas queda cortada a 1440×900 en español (42 px) y a 1032×800 (184 px en español, 123 en inglés; antes 67 y 21). La barra no pasa a dos renglones ni corta texto dentro de los botones.*

## 2. Tooltips

- [ ] 2.1 `tooltips.js` y `main.js`: `opensTooltip` con `hints`; apagadas, nada al posar el cursor ni con Tab, salvo el interruptor de ayudas; apretar un control sin acción sigue explicando (D2); el tooltip a la vista se cierra al apagar. Actualizar las pruebas de `opensTooltip`. Verificar "Tooltips con las ayudas apagadas" y "Apretar un control sin acción lo explica" en dos pestañas, con mouse y con teclado.
- [ ] 2.2 "Guía" deja de gobernar los tooltips; su tooltip ya no los nombra (D3). Verificar "La guía apagada no calla los tooltips" y "Guía encendida y ayudas apagadas".
- [ ] 2.3 `mlLab.auditTooltips()` no informa nada con las ayudas encendidas ni apagadas.

## 3. Cierre

- [ ] 3.1 PENDIENTES.md: quitar "un interruptor propio para los tooltips" de lo que quedó afuera y anotar lo que se pierde con un lector de pantalla (D2).
- [ ] 3.2 `npm test` y `openspec validate interruptor-de-ayudas --strict`.
