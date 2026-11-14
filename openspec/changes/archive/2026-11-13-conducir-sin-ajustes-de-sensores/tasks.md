# Tasks

## 1. El problema sin ajustes de sensores

- [x] 1.1 Armar la barra de escenario de El problema sin el grupo de sensores y quitar los sensores de los ajustes de la pestaña (design.md D1 y D2). Verificar con pruebas que el efecto de la barra en El problema ya no incluye claves de sensores y que el auto usa siempre los sensores por defecto.
- [x] 1.2 Reemplazar las pruebas de El problema y de la barra que cambiaban los sensores desde esa pestaña por las de los escenarios nuevos. Informar cuáles cambiaron y por qué.
- [x] 1.3 Revisar la guía, las ayudas y las misiones de El problema en los dos idiomas y quitar lo que nombre ajustes de sensores (design.md D3). Informar qué textos cambiaron.
- [x] 1.4 Verificar en el navegador los escenarios "Cambiar los sensores", "Sensores que siguen a la vista", "Sensores de las otras pestañas" y "Restablecer" de `pestana-conducir`, y "Estado por defecto", "Mismo lugar en las tres pestañas", "Sensores en El problema" y "Vuelve a aplicar" de `barra-escenario`. Comprobar que la barra entra en un renglón a 1366 px y que no queda un hueco.
- [x] 1.5 Comprobar que Reglas a mano, Entrenar y Competir no cambiaron, que `mlLab.auditTooltips()` no informa nada en El problema, y correr `npm test` y `openspec validate conducir-sin-ajustes-de-sensores --strict`.
