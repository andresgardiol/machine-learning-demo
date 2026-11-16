# Diseño: tooltips con calma

## Context

`src/ui/tooltips.js` instala un único tooltip flotante con escuchas
delegadas. Decide con funciones puras (`opensTooltip`, `pointerLeaveAction`)
y tiene 24 pruebas. Hoy: 400 ms de espera al posar el cursor, 300 ms para
cerrar al salir, aparece con el foco de teclado, se cierra con Escape, y un
área de escritura solo lo muestra al llegar con Tab.

El interruptor "Guía" (`src/ui/app.js`, preferencia `mlLab.guide`) muestra u
oculta los textos de guía y las misiones. Por defecto está encendido.

En `PENDIENTES.md` había cinco ideas sin decidir. Esta propuesta elige.

## Goals / Non-Goals

**Goals:** que un tooltip no aparezca cuando la persona está usando el
control; que quien ya conoce la interfaz pueda trabajar sin tooltips; que
todo control siga teniendo su explicación a mano.

**Non-Goals:** cambiar el contenido, el aspecto o la ubicación; sumar
controles al encabezado.

## Decisions

### D1. Usar un control cancela su tooltip

- `pointerdown` sobre un control con ayuda: se cierra su tooltip o se cancela
  el que estaba esperando, y ese control queda "callado" hasta que el cursor
  salga de él. Al volver a entrar, vale la espera de siempre.
- Mientras hay un botón del mouse apretado (entre `pointerdown` y
  `pointerup`, en cualquier parte), `pointerover` no arma ningún tooltip. Es
  el caso de arrastrar un deslizador o un divisor pasando sobre otros
  controles.
- Excepción: un control sin acción (`aria-disabled="true"`). Apretarlo
  muestra su tooltip en el momento, sin espera. Hoy ese clic no hace nada y
  la única explicación es el tooltip.
- El foco de teclado no cambia: un clic nunca mostró el tooltip por foco, y
  Tab lo sigue mostrando.

### D2. Más espera con la guía encendida

De 400 a 700 ms. Es un número elegido, sin medir. Se descartó el
"calentamiento" de los sistemas operativos (después de ver uno, los
siguientes aparecen enseguida): para quien los encuentra molestos, hace que
aparezcan más.

### D3. La guía apagada apaga los tooltips al posar el cursor

- El interruptor "Guía" ya separa a los dos públicos: quien necesita que le
  expliquen y quien no. Los tooltips al posar el cursor son parte de esa
  explicación. Atarlos evita un control nuevo.
- Con la guía apagada, `pointerover` no arma tooltips, salvo en:
  - el interruptor "Guía" (`#guide-switch`): el camino de vuelta tiene que
    explicarse solo;
  - un control sin acción: el "por qué no" no es una guía, es una respuesta.
- Con Tab aparecen siempre, con la guía encendida o apagada. Llegar con Tab
  es un gesto deliberado y es el camino del teclado y de los lectores de
  pantalla.
- `opensTooltip` recibe dos datos más (`guide`, `unavailable`, `guideSwitch`)
  y sigue siendo una función pura con pruebas. `installTooltips` recibe una
  función `guideOn()` que le pasa `app.js`.
- El tooltip de "Guía" cambia su texto para decir lo que gobierna:
  - Qué hace: "Muestra u oculta los textos de guía, las misiones y las ayudas
    que aparecen al posar el cursor."
  - Por qué importa: "Quien recién empieza necesita que cada cosa se
    explique; quien ya la conoce puede quitar todo eso. Con la guía apagada,
    la ayuda de un control aparece al llegar a él con Tab."

**Alternativa, si el dueño no quiere atarlos a "Guía":** un interruptor
propio, "Ayudas", junto a "Guía" y "Atajos". Cuesta un control más en el
encabezado y dos nombres que se parecen. El resto del diseño (D1, D2) no
cambia.

### D4. Lo que no cambia

La espera para cerrar, llevar el cursor al tooltip, Escape, el área de
escritura, la ubicación, el idioma en vivo y la auditoría. Las pruebas
existentes de esos casos tienen que seguir pasando sin tocarlas, salvo la
constante de la espera.

## Risks / Trade-offs

- **Quien apaga la guía pierde los tooltips con el mouse.** → Es lo que se
  busca; el tooltip de "Guía" lo dice antes de apagarla y después. Si
  resulta demasiado, la alternativa de D3 está a mano.
- **[Sin medir] 0,7 s.** → Una constante; el dueño la prueba.
- **Un clic en un control sin acción muestra el tooltip sin espera,** aun
  con la guía apagada. → Es la excepción a propósito.
- **Rendimiento:** no toca el bucle de simulación ni el de dibujo.

## Migration Plan

Sin datos que migrar. La preferencia de la guía ya existe. Vuelta atrás:
revertir el cambio en `tooltips.js`.

## Open Questions

- ¿Atados a "Guía" o con interruptor propio? La propuesta elige "Guía".
