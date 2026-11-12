# Proposal

## Why

El recorrido del laboratorio es una cadena de preguntas: "manejalo",
"programalo", "que aprenda". La primera y la tercera ya existen; falta la del
medio. Sin ella, la pestaña Entrenar responde una pregunta que nadie planteó:
no se ve por qué hace falta que una máquina aprenda si alcanza con decirle qué
hacer. La pestaña 2, "Reglas a mano", hace que la persona programe el auto
con reglas escritas por ella y descubra, probando, que cada situación nueva
pide otra regla.

Concepto que hace visible: **programar es escribir reglas del tipo "si pasa
esto, hacé aquello"; funcionan para los casos que uno pensó, y cada caso nuevo
pide una regla más. Las reglas a mano no escalan.**

## What Changes

- **Pestaña 2 disponible**, con el mismo escenario de la pestaña 1 (calle
  recta con tráfico) y un auto manejado por el programa de la persona.
- **Un lenguaje de reglas mínimo**, en texto: órdenes sueltas (`avanzar`) y
  reglas `si <condición> entonces <acciones>`, con las lecturas de los
  sensores (`sensor1`, `sensor2`…) y la velocidad como únicos datos, y las
  cuatro acciones del auto como únicas órdenes. Sin variables, sin memoria y
  sin bucles: un programa siempre termina.
- **Constantes con nombre** (`cerca = 0,3`), para escribir un número una vez
  y usarlo en varias reglas. El programa inicial y los ejemplos las usan.
- **Bilingüe:** las palabras del lenguaje se aceptan en español y en inglés a
  la vez (`si` / `if`, `entonces` / `then`, `avanzar` / `forward`…), y los
  números con coma o con punto.
- **Editor en el tablero**, como una tarjeta más, con números de línea,
  colores por tipo de palabra, sangría automática y una paleta de palabras
  que se insertan con un clic.
- **El programa rige mientras se escribe:** cada cambio válido pasa a manejar
  el auto en el momento, sin reiniciar. Si el texto tiene un error, sigue
  manejando el último programa válido y el error se explica en lenguaje
  llano, con su línea.
- **Se ve qué regla se está cumpliendo:** las líneas activas se resaltan en
  cada instante, y el tablero muestra los sensores con el nombre que tienen
  en el lenguaje y los controles que el programa acciona.
- **Contador de reglas** entre los indicadores, junto a la distancia, los
  vehículos superados y la mejor distancia.
- **Reintento automático** al chocar (encendido por defecto), para probar y
  corregir sin soltar el teclado.
- **Tres programas de ejemplo**, cada uno para un auto distinto: tres
  sensores cortos (una regla: frena y no pasa a nadie), siete sensores (cinco
  reglas: pasa al tráfico) y veinte sensores (nueve reglas, y maneja peor que
  el de siete). Cargar uno cambia el programa y los sensores del auto.
  **Restablecer** vuelve al programa y a los sensores iniciales.
- **El programa se recuerda** entre visitas, y se puede **exportar e
  importar** como archivo de texto.
- **Tres misiones** que miden vehículos superados, la última con tráficos
  distintos.
- **Configuración avanzada** igual a la de la pestaña 1 (velocidad, carriles,
  tráfico y sensores).
- Las tarjetas de percepción y de acción de la pestaña 1 pasan a ser
  componentes compartidos por las dos pestañas, sin cambiar lo que hacen.

### Filtro de entrada

| Feature | ¿Qué concepto hace visible? | ¿Se entiende sola? | ¿El mentor puede ignorarla u ocultarla? | ¿Mal uso y vuelta atrás? |
|---|---|---|---|---|
| Lenguaje de reglas | Un programa es una lista de reglas "si… entonces…" sobre lo que el auto percibe | Abre con un programa que ya funciona; cada palabra de la paleta tiene tooltip | El mentor puede escribir o pegar su programa directamente | Un error no rompe nada: sigue el último programa válido |
| Editor en el tablero | Lo que se escribe es lo que se ejecuta | Es un cuadro de texto con números de línea | La tarjeta se pliega | Deshacer del navegador; restablecer vuelve al programa inicial |
| Línea activa resaltada | En cada instante se cumplen unas reglas y otras no | Se ve al mirar: la línea se enciende cuando el auto hace eso | Se va al plegar la tarjeta | No tiene estado |
| Errores en lenguaje llano | Una máquina solo entiende lo que está escrito exactamente | El mensaje dice la línea, qué no entendió y cómo arreglarlo | Solo aparece si hay un error | Corregir la línea lo borra |
| Paleta de palabras | El vocabulario del lenguaje es corto y cerrado | Cada palabra es un botón con su explicación | Se oculta con el interruptor de guía | Lo insertado se borra como cualquier texto |
| Contador de reglas | La cantidad de reglas crece con cada caso nuevo | Un número junto a la distancia | Es un indicador más | No tiene estado |
| Reintento automático | Probar, fallar y corregir es el ciclo de programar | Un interruptor con tooltip, encendido | Se apaga | Apagado, el choque espera a que se reinicie a mano |
| Constantes | Un número con nombre se escribe una vez y se cambia en un solo lugar | El programa inicial ya trae una, definida arriba y usada en su regla | No hace falta usarlas: un número suelto sigue valiendo | Un nombre mal escrito o repetido se explica como cualquier error |
| Ejemplos por cantidad de sensores | Ver más no alcanza: cada sensor nuevo pide reglas nuevas, y más reglas no dan un programa mejor | Tres botones con la cantidad de sensores; el comentario de cada programa dice qué hace | No hace falta usarlos | Cargar uno cambia programa y sensores, con confirmación si hay cambios propios; restablecer vuelve al inicial |
| Programa recordado, exportar e importar | Un programa es un texto que se guarda y se comparte | Botones con tooltip | El mentor prepara su programa antes de la charla | Importar pide confirmación y no borra nada exportado |
| Misiones | Lo que funciona con un tráfico puede no funcionar con otro | Tres metas con progreso | Se ocultan con la guía | No bloquean nada |

### A quién sirve

- **Principiante:** abre la pestaña y el auto ya maneja con tres líneas que
  puede leer; cambia un número y ve qué pasa; agrega reglas hasta que nota que
  no alcanzan.
- **Mentor:** escribe en vivo, proyectado, con el código al centro y la línea
  activa resaltada; o importa un programa preparado. Con la guía apagada no
  hay paleta ni misiones.

### Fuera de alcance

- Variables que cambian, memoria entre instantes, cuentas, bucles, funciones
  y `sino`. Las constantes sí entran: nombran un número y no cambian.
- Dar nombre a un sensor (`frente = sensor3`): una constante nombra solo un
  número.
- Biblioteca de programas con nombre: llega con la pestaña Competir, que es
  donde se van a usar varios.
- Usar programas en otras pestañas.
- Editor con autocompletar, búsqueda o varios cursores.
- "Ver como la máquina" en esta pestaña.
- Traducir el programa al cambiar de idioma: los dos vocabularios valen
  siempre.
- Circuitos: la pestaña usa la calle recta.

## Capabilities

### New Capabilities

- `reglas`: el lenguaje de reglas y su ejecución: qué se puede escribir, qué
  significa, cómo se informa un error, cuántas reglas tiene un programa y qué
  líneas se cumplen en cada instante.
- `pestana-reglas`: la pestaña 2, "Reglas a mano": editor, programa en
  marcha, indicadores, ejemplos, programa recordado, misiones y configuración.

### Modified Capabilities

- `estructura-app`: la pestaña Reglas a mano pasa a estar disponible.
- `controladores`: se agrega el controlador de reglas, que maneja un auto con
  un programa.
- `tablero`: se agrega que una tarjeta puede contener un editor cuando lo que
  se escribe es lo que se ve ejecutarse.

## Impact

- **Núcleo:** módulo nuevo `src/core/rules.js` (análisis del texto,
  ejecución y controlador), sin DOM y determinista. No cambia nada de lo
  existente.
- **Interfaz común:** `src/ui/editor.js` (editor de texto con resaltado) y
  `src/ui/driving-cards.js` (tarjetas de percepción y de acción, extraídas de
  la pestaña 1).
- **Pestañas:** `src/tabs/rules/` nueva; `src/tabs/drive/index.js` pasa a
  usar las tarjetas compartidas; `src/main.js` registra la pestaña.
- **Preferencias:** una clave nueva para el programa recordado.
- **Textos y estilos:** `src/i18n/es.js`, `en.js` y `styles/app.css`.
- **Specs:** el propósito de la spec `tablero` dice que el tablero solo
  muestra; se actualiza a mano al archivar, porque un delta no puede cambiar
  un propósito.
- **Dependencias y build:** ninguna nueva.
- **Pruebas:** nuevas para el lenguaje, el controlador y la lógica sin DOM de
  la pestaña. Las existentes no cambian.
- **Rendimiento:** ejecutar un programa por paso cuesta mucho menos que una
  red; el resaltado se actualiza una vez por cuadro.
