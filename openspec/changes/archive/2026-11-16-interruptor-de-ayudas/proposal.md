# Interruptor para apagar los tooltips

## Por qué

Los tooltips "qué hace / por qué importa" aparecen en todos los controles.
Para quien ya conoce la aplicación se vuelven molestos, y hoy la única forma
de callarlos es apagar "Guía", que además saca los textos de guía y las
misiones. Y aun con la guía apagada siguen apareciendo con Tab y en los
controles sin acción. No hay un control que diga "tooltips: no".

Era la alternativa anotada en el diseño de `tooltips-con-calma` y en
PENDIENTES.md ("un interruptor propio para los tooltips separado de Guía").

## Qué cambia

- Un interruptor nuevo, "Ayudas", en la barra de arriba entre "Guía" y
  "Atajos". Apagado, ningún control muestra su tooltip, ni al posar el cursor
  ni con Tab.
- Dos excepciones: el tooltip del propio interruptor, y apretar un control
  sin acción, que sigue diciendo por qué no se puede usar.
- "Guía" deja de gobernar los tooltips: solo muestra u oculta los textos de
  guía y las misiones.
- La preferencia se recuerda. Quien tenía la guía apagada abre con las ayudas
  apagadas, para que no le vuelvan de sorpresa.

## Capacidades

### Modificadas

- `ayuda-contextual`: aparición del tooltip (con las ayudas encendidas),
  apretar un control sin acción, y "Tooltips con la guía apagada" se
  reemplaza por "Tooltips con las ayudas apagadas".
- `estructura-app`: interruptor de guía (ya no calla tooltips), preferencias
  recordadas, y el interruptor de ayudas, nuevo.

## Impacto

- Código: `src/ui/app.js`, `src/ui/preferences.js`, `src/ui/tooltips.js`,
  `src/main.js`, `styles/app.css`, `src/i18n/{es,en}.js` y pruebas.
- No depende de los otros cambios en curso.
