# Design

## Context

Medido el 17 de noviembre de 2026 en el código y en el navegador (Chrome, 1440×900, la app recién abierta con la guía encendida, contando solo lo que entra en la ventana):

| Pestaña | Controles | Alturas de control (px) | Tamaños de letra | Tamaño y peso |
|---|---|---|---|---|
| El problema | 35 | 24, 26, 32, 36, 37, 40 | 10 | 18 |
| Reglas a mano | 63 | 24, 26, 32, 36, 37, 40 (+ editor) | 10 | 19 |
| Entrenar | 53 | 24, 26, 28, 32, 36, 37, 40 | 10 | 18 |
| Competir | 46 | 24, 26, 28, 30, 32, 36, 37, 40 | 10 | 20 |
| Inspeccionar | 72 | 24, 26, 32, 36, 40, 80 | 11 | 18 |
| Laboratorio | 65 | 18, 22, 24, 26, 30, 32, 36, 40, 44, 92 | 9 | 17 |

En `styles/app.css`:
- 16 valores de `font-size`: 8, 10, 10,5, 11, 12, 13, 14, 15, 16, 17, 18 y 22 px, dos `clamp()`, `inherit` y un 96 decorativo. El más usado es 13 px (65 veces), seguido de 12 (49) y 11 (23).
- 4 pesos: 400, 600, 700 y 800.
- 117 rellenos, márgenes y separaciones en px sueltos, contra 284 usos de `--space-*`.
- 9 radios distintos.
- Ningún color en hexadecimal: todos los colores salen de `tokens.css`. Es la mejor base para este cambio.

En `styles/tokens.css`, `#4ea1ff` es el valor de `--color-accent`, `--color-action`, `--color-selected-border` y `--color-sensor`. `--color-reveal` y `--color-competitor-3` valen los dos `#f4e04d`, que también es `--color-network-current`. El dibujo en el lienzo lee los colores de estas variables.

La crítica con su evidencia está en `borradores/sistema-de-diseno/critica-reglas-a-mano.md`. El guion de capturas de `jerarquia-de-botones` (`borradores/jerarquia-de-botones/capturar.mjs`) maneja Chrome sin ventana por el protocolo DevTools, con tiempo virtual y sin dependencias, y saca las mismas imágenes en dos corridas.

## Goals / Non-Goals

**Goals:**
- Que el dueño elija entre tres sistemas **viéndolos aplicados a la app**, no descritos.
- Que la base común (las specs) valga para cualquiera de las tres, así lo que se elige son valores y énfasis, no requisitos.
- Que el cumplimiento se pueda medir: una auditoría en el navegador y pruebas que leen `tokens.css` y `app.css`.

**Non-Goals:**
- Mover controles de lugar o cambiar la disposición (eso es `reglas-mesa-de-trabajo`).
- Rediseñar íconos, el dibujo de la escena o el diagrama de la red, salvo los colores que la propuesta elegida mueva.
- Una página de muestrario dentro de la app. Las muestras viven en `borradores/`.

## Decisions

### D1. Tres propuestas de sistema de diseño

Las tres cumplen las specs. Se diferencian por la idea que ordena el color y la escala, y eso cambia mucho cómo se ve la app. Los valores son de partida y se ajustan midiendo contra las specs.

**Decisión del dueño (17 de noviembre de 2026): B, con el celeste `#a5e4ff` para "entra".** La tomó mirando `borradores/sistema-de-diseno/muestras/comparacion.md`. A y C quedan abajo como descartadas, con su motivo, para que se entienda por qué no.

#### A. Instrumento: el color es de la simulación (descartada)

**Por qué se descartó.** En las muestras fue la de jerarquía más clara: en gris, la marcha blanca es lo primero que se ve en las ocho vistas. Pero las tarjetas sin fondo dan 1,00:1 contra el panel y se separan solo por un filete de 1,66:1, así que no cumplen el requisito "Superficies con nombre". Además deja atrás el azul de acción que aprobó el dueño en `jerarquia-de-botones`. De A queda una pieza común a las tres: la barra blanca de "se cumple".

**Idea.** En un laboratorio, lo que importa es el experimento. La interfaz se vuelve casi gris, como un instrumento de medición. El color aparece solo donde dice algo de la simulación (el auto, el tráfico, los sensores y los pesos) y en un único lugar de la interfaz: la acción principal.

| Pieza | Valor |
|---|---|
| Tipografía | 4 tamaños: 12, 14, 16 y 24 px. Pesos 400 y 700. Cifras en números tabulares |
| Alturas | grande 40, normal 32 y compacta 24 |
| Acción principal | relleno blanco (`#eef1f5`) con texto oscuro: lo más claro de la interfaz |
| Opción elegida | contorno blanco de 2 px y negrita, sin fondo de color |
| Foco | doble anillo: blanco por dentro y oscuro por fuera. "Mostrame" usa este mismo anillo, más grueso, porque igual pasa el foco al control |
| Azul | sale de la interfaz. Queda solo para los sensores, que son simulación |
| Superficies | sin fondos de tarjeta: las zonas se separan por espacio y un filete. La tarjeta de consigna conserva su barra |
| Se cumple | barra lateral blanca y fondo blanco al 8 %, como la neurona activa |
| Error | rojo, ✕ en un círculo y subrayado ondulado |
| Choque | rojo, rayado diagonal fijo e ícono de impacto |
| Barras de progreso | gris claro |

**Contra el ADN.** Cumple muy bien el Art. 2 (lo que se ve primero es el experimento), el Art. 7 (el color solo lo pone lo que calcula la simulación) y el Art. 9 (la menor cantidad de significados). **Tensiona** los artículos 4 y 5: una interfaz gris da menos pistas de qué se toca, y un botón blanco puede leerse como "elegido". También deja atrás el azul de acción que el dueño aprobó en `jerarquia-de-botones`.
**Costo**: M. Cambia el color de la acción y de la opción elegida en las seis pestañas, pero no el dibujo.
**Riesgo [Hipótesis]**: la salida encendida (gris claro con contorno blanco) y la acción principal (blanco relleno) quedan cerca en luminosidad. Se mide en escala de grises en la muestra.

#### B. Roles del contrato: vos, entra, decide, sale (elegida)

**Idea.** El contrato de controlador (lo que perciben los sensores entra y los controles salen) es la idea de ML que cruza las seis pestañas: el teclado, el programa y la red son tres controladores del mismo auto. El sistema de color se vuelve esa gramática. Cada elemento de la interfaz y del dibujo tiene uno de cuatro roles, y cada rol tiene **un color y una forma**:

| Rol | Qué es | Color de partida | Forma |
|---|---|---|---|
| **Vos** | lo que tocás: la acción principal, la opción elegida y el foco | azul `#4ea1ff` (el de hoy) | relleno o contorno de control |
| **Entra** | lo que percibe: los sensores, las barras de percepción, las entradas de la red y las palabras de sensor del editor | celeste `#a5e4ff` | barra vertical y punta de rayo |
| **Decide** | el programa o la red: las líneas que se cumplen y las neuronas activas | blanco `#f5f7fa` (el de la neurona activa) | barra lateral y relleno parcial |
| **Sale** | lo que acciona: las teclas de salida y "Lo que estás accionando" | gris con contorno blanco (el de hoy) | tecla, nunca botón |

- **El celeste de "entra", medido** en las muestras (`comparacion.md`, con la misma cuenta que `vista-de-la-red` D11):
  - contra el verde agua de los pesos, con deuteranopia, ΔE 10,0. Pasa el 8 del validador, aunque no llega al 14,3 del par de los pesos. Lo compensa la forma: los pesos son líneas y "entra" son barras y rayos;
  - contra la acción, ΔE 22,3, y en gris 1,93:1 de luminosidad (el cian daba 1,51:1);
  - sobre su riel, 10,16:1.

  *Alternativa descartada:* el cian `#2fd5f0` de la muestra, que con deuteranopia daba ΔE 6,3 contra los pesos.
- **Rótulos de rol.** Cada zona que muestra un rol lleva un rótulo chico con su marca y su nombre. Cada rótulo tiene una ayuda que define el rol en lenguaje llano (Art. 5), y todos se ocultan con la guía (Art. 6). Van en:
  - "Lo que perciben los sensores" y las barras de percepción, y las entradas del diagrama de la red: *Entra · lo que percibe*;
  - el editor del programa de Reglas a mano y el diagrama de la red de Inspeccionar y del Laboratorio: *Decide · el programa* o *Decide · la red*;
  - "Lo que estás accionando" y "Decisión de la red": *Sale · lo que acciona*.

  En inglés: *In · what it senses*, *Decides · the program* o *Decides · the network*, y *Out · what it does*. Los textos van por i18n, no por `content:` en CSS como en la muestra.

  **En Reglas a mano, los rótulos van en el título** (decisión del dueño, 18 de noviembre de 2026). A 1366×768, "Entra" y "Sale" sobre sus columnas sumaban 21 px, y el tablero pasaba de desbordar 71 px a 92 (37 en el commit de partida). Como el título de la tarjeta, "Lo que percibe y lo que acciona", dice lo mismo que los dos rótulos, con la guía encendida se reemplaza por ellos, cada uno sobre su columna y en el mismo renglón del triángulo que pliega la tarjeta. Con la guía apagada vuelve el título. La tarjeta tiene la misma altura en los dos casos. *Alternativas descartadas:* aceptar los 21 px (el cambio que sigue rearma esa zona, pero mientras tanto el desborde crecía) y sacar los rótulos de Reglas a mano (es la pestaña donde más enseñan).
- **Las palabras del editor siguen el rol.** En el editor y en la paleta de Reglas a mano, las palabras de sensor (`sensor1`…) toman el color de "entra", y las de acción (`avanzar`, `girar izquierda`…) dejan el azul y pasan al estilo de "sale": blancas y subrayadas. Las palabras clave (`si`, `entonces`) quedan como hoy. Las constantes (`cerca`) pasan al blanco de "decide", en cursiva, porque son parte del programa. Hasta el grupo 4 seguían en el verde agua de los pesos, lo único que la auditoría marcaba con dos significados (decisión del dueño, 18 de noviembre de 2026). En la muestra las palabras de acción seguían azules, y así el azul seguía significando dos cosas.
- **El anillo de "Mostrame" es del color de "vos"** (decisión del dueño, 18 de noviembre de 2026): señala lo que hay que tocar, que es justo ese rol. Es más grueso que el contorno de foco, y "Mostrame" además le pasa el foco al control. *Alternativa descartada:* el verde lima `#a3ff12` que probó la implementación. Sumaba un quinto significado de color y, con deuteranopia, quedaba cerca del amarillo del competidor 3.
- **Barras densas.** A la lista de `jerarquia-visual` se suman la cabecera de capas del diagrama de la red, las filas de la tarjeta de la neurona y la tabla de verdad del Laboratorio, que siguen compactas (24 px) para no estirar el diagrama ni la tabla (decisión del dueño, 18 de noviembre de 2026).
- **El competidor 1** usa hoy el cian `#2fd5f0`. Cambia de color solo si queda a menos de ΔE 8 del celeste de "entra" con deuteranopia. Si cambia, el candidato es `#b5e550`, que la muestra midió a ΔE 10,3 del verde del auto. Su número es la identificación principal y el color la secundaria, según `pestana-competir` D11.
- Tipografía y alturas: las de la base (12, 14, 16, 20 y 28 px; 44, 32 y 24 px de alto).
- Error: rojo, ✕ y subrayado ondulado. Choque: rojo, rayado e ícono de impacto. El rojo significa "salió mal" y la forma dice cuál de los dos es.
- Barras de progreso: del color de "decide", porque miden lo que logró el controlador.

**Contra el ADN.** Es la única en la que **el sistema de diseño enseña**: la frase "un controlador convierte lo que percibe en lo que acciona" se ve igual en El problema (vos manejás), Reglas a mano (el programa maneja) e Inspeccionar (la red maneja). Cumple el Art. 1 (un concepto enunciable en una oración), el Art. 7 (los roles son el cálculo real del contrato) y el Art. 9. **Tensiona** el Art. 4: suma rótulos, aunque se apagan con la guía.
**Costo**: L. Mueve el color de los sensores en el dibujo de las seis pestañas y en las entradas del diagrama de la red, y suma textos en dos idiomas.
**Riesgo [Medido]**: con deuteranopia, el celeste de "entra" y el verde agua de los pesos quedan a ΔE 10,0, menos separados que los dos colores de los pesos entre sí (14,3). Se acepta por la diferencia de forma. Si en el diagrama de la red se confunden a ojo, se prueba otro celeste de la tabla de candidatos de `comparacion.md`.

#### C. Dos escalas: escritorio y proyector (descartada para este cambio)

**Por qué se descartó.** En las muestras, a 1440×900 casi no cambia nada. En modo proyector a 1280×720 la disposición se rompe en las ocho vistas: las pestañas 5 y 6 quedan fuera de la barra, el aviso de choque se sale por abajo, el marcador de Competir se pisa y la barra de marcha de Inspeccionar queda fuera de la vista. Necesita un cambio de disposición, que está fuera de este cambio. Queda anotada en `PENDIENTES.md` como un cambio propio, después de `reglas-mesa-de-trabajo`. La capa de tokens de D2 ya la deja preparada.

**Idea.** La app tiene dos distancias de lectura: quien llega solo, a 50 cm, y el mentor que proyecta en un aula, a 5 m o más. Hoy el texto más usado mide 13 px y a 1366×768 hay cortes. Proyectado, eso no se lee. El sistema se arma en tres capas de tokens (primitivos, semánticos y de componente) y la escala entera cambia con un solo atributo, `data-escala`:

| Pieza | Escritorio | Proyector |
|---|---|---|
| Tipografía (razón 1,2) | 12, 14, 17, 20 y 24 px | 15, 18, 22, 26 y 32 px |
| Alturas | 40, 32 y 24 | 52, 44 y 32 |
| Espaciado | 4, 8, 12, 16, 24 y 32 | ×1,25 |
| Ancho del panel | 360 | 420 |

- Un interruptor "Proyector" en la barra de arriba, junto a Guía, Ayudas y Atajos, recordado entre visitas, con tooltip ("qué hace / por qué importa") en dos idiomas. El principiante no lo necesita y el mentor lo enciende antes de la clase.
- Color: el mínimo para cumplir las specs. Los sensores pasan a un tono propio (el cian de B u otro), la acción sigue azul y los estados son los de la base.
- Se puede sumar a A o a B más adelante, porque ordena la escala y no el color.

**Contra el ADN.** Cumple el Art. 6 (dos públicos, una app) y el Art. 8 (nunca falla en vivo: legible en el aula). Es neutral con los artículos 1 y 2. **Tensiona** el filtro de entrada: es una feature (un interruptor) dentro de un cambio de base, y su concepto ("se lee a la distancia de un aula") no es de ML.
**Costo**: L. A 1280×720, una resolución común de proyector, la escala grande no entra en la disposición actual: obliga a decidir qué se pliega en modo proyector. Eso toca la disposición, que está fuera de este cambio, y duplica la matriz de pruebas.
**Riesgo [Hipótesis]**: sin un cambio de disposición, el modo proyector desborda en Entrenar e Inspeccionar.

#### Comparación

| | A. Instrumento | B. Roles | C. Dos escalas |
|---|---|---|---|
| Lo que cambia a la vista | la interfaz se vuelve gris y la acción blanca | colores con nombre de rol, rótulos y sensores cian | todo más grande en el proyector |
| Lo que enseña | que el protagonista es la simulación | el contrato de controlador | nada nuevo de ML |
| Dibujo de la escena | igual | cambian los sensores y las entradas | igual, salvo los sensores |
| Textos nuevos | ninguno | los rótulos de rol | el interruptor |
| Tamaño | M | L | L, y pide disposición |
| Se combina con | C | C | A o B |

**Por qué B.** Es la única que hace trabajar al sistema de diseño a favor de la promesa del ADN, y les da a los tres cambios de Reglas a mano su vocabulario: en `reglas-el-choque-ensena`, la tarjeta del caso es "lo que entraba" y "lo que se decidía". Sus requisitos (los cuatro roles y los rótulos) están en la spec `sistema-de-diseno`.

### D2. La base común en tokens

- **Tres capas en `tokens.css`.** Los primitivos son la paleta y la escala. Los semánticos tienen el significado (`--color-action`, `--color-state-holds`, `--color-state-error`, `--color-state-crash`, `--color-sensor`, `--text-label`, `--text-body`, `--text-heading`, `--text-figure` y `--text-figure-lg`, `--control-h-lg`, `--control-h` y `--control-h-sm`, `--radius-control`, `--radius-card` y `--radius-round`). La capa de componente es la mínima que haga falta. `app.css` solo usa la capa semántica.
- *Por qué capas y no solo renombrar:* C las necesita para cambiar la escala con un atributo, y A y B para mover un significado sin buscar en `app.css`. *Alternativa descartada:* un preprocesador, porque la constitución (Art. 12) no permite un paso de build.
- **Los colores siguen en `#rrggbb`**, para que las pruebas los lean como hoy.
- **La escala de espaciado** suma 12 y 32 px a la actual (4, 8, 16 y 24). Los 117 valores sueltos se llevan al paso más cercano, y la auditoría marca los que cambian más de 2 px para revisarlos a ojo.

### D3. Ver antes de elegir: las muestras

- **Guion.** Se copia `capturar.mjs` de `jerarquia-de-botones` a `borradores/sistema-de-diseno/` y se le agrega `--css <archivo>`, que inyecta una hoja de estilos antes de que corra la app (`Page.addScriptToEvaluateOnNewDocument`). Así el lienzo, que lee los tokens al arrancar, también dibuja con los colores de la muestra.
- **Muestras.** `muestras/a.css`, `muestras/b.css` y `muestras/c.css` sobrescriben tokens y unas pocas reglas. Son aproximaciones: no reescriben `app.css`, así que las alturas y los tamaños que hoy están en px sueltos no van a cambiar del todo. La comparación lo aclara en cada captura.
- **Vistas**, a 1440×900, en color y en escala de grises:
  - Reglas a mano: inicio, con un error y con un choque (Reintentar solo apagado);
  - El problema: manejando;
  - Entrenar: inicio;
  - Competir: el cartel de largada;
  - Inspeccionar: con una neurona elegida;
  - Laboratorio: compuertas.

  C se fotografía además a 1280×720 en modo proyector.
- **Comparación.** `muestras/comparacion.md`: el antes, A, B y C de cada vista lado a lado, con una línea de qué se ve distinto y los contrastes medidos.

### D4. Auditoría del sistema

`auditSistema()` en `src/ui/audit.js`, expuesta como `mlLab.auditSistema()`, junto a `auditHierarchy()` y `auditTooltips()`. Recorre lo visible e informa:
- los tamaños y pesos de letra fuera de la escala;
- los controles con una altura que no es una de las tres, o compactos fuera de las barras densas;
- los rellenos con el color de acción que no son la acción principal;
- los colores de la interfaz que coinciden con un color del dibujo.

El guion de capturas la corre en cada foto y la guarda en `auditoria.json`.

### D5. La acción terciaria

Es la clase `.tool.tertiary`: texto del color del cuerpo, sin contorno ni fondo, subrayado al pasar el cursor, con el foco de la app y la altura normal (el área sensible sigue siendo de 32 px aunque se vea solo el texto). Pasan a terciaria:
- Exportar e Importar en Reglas a mano;
- Exportar e Importar en la biblioteca de cerebros;
- "Más sobre esta pestaña";
- "Mostrame". Esto cierra la excepción de 24 px de `misiones-que-muestran-el-control`.

*Alternativa descartada:* un menú "Más ▾" para Exportar e Importar. Esconde controles, y el dueño prefiere todo a la vista y sin anidar.

### D6. Estados y deslizadores

- **Los estados** son clases de estado (`data-state="holds|error|crash"`) con su color y su forma en `app.css`. Las pestañas que hoy pintan estos estados a mano pasan a usar esas clases:
  - la línea encendida y el mensaje de error del editor de Reglas a mano;
  - el aviso de choque de El problema y de Reglas a mano;
  - el error al importar.
- **En el lienzo**, el auto chocado ya usa `--color-car-crashed`. El estado "choque" lo toma como su color, sin cambiar el dibujo.
- **Los deslizadores** se estilan con `appearance: none` y los pseudoelementos de WebKit y de Firefox, con el riel de `--color-control-border`, la perilla del color de la opción elegida y el foco de la app.

## Risks / Trade-offs

- [Las muestras son aproximaciones y pueden engañar para bien o para mal] → La comparación dice qué no cubre cada muestra. Si el dueño duda entre dos, se hace una segunda pasada solo con Reglas a mano reescrita a mano con esas dos.
- [Bajar el texto de 11 y 10 px a 12 hace crecer las barras densas y puede cortar cosas a 1366×768] → Se mide en las capturas a 1366. Donde no entre, se prefiere acortar el texto antes que volver a 11 px.
- [Los 117 valores sueltos llevados a la escala mueven cosas unos píxeles en todas partes] → La auditoría marca lo que cambia más de 2 px, y la comparación del antes y el después lo muestra.
- [Los sensores cambian de azul a celeste, y el mentor ya los conoce de clases anteriores] → Lo aceptó el dueño al elegir. La forma (barra y rayo) no cambia.
- [Los rótulos suman texto en zonas que ya están justas a 1366×768] → Son de 12 px, en el renglón del título de la zona cuando entran. Se miden con el guion a 1366, y con la guía apagada no ocupan lugar.
- [Rendimiento] Los tokens que lee el lienzo se leen al arrancar, como hoy, así que no se agrega trabajo al bucle de dibujo.

## Migration Plan

1. Antes y muestras (D3), sin tocar `src/` ni `styles/`. Hecho.
2. El dueño eligió B con el celeste, y la elección quedó volcada en este documento y en las specs. Hecho.
3. Tokens en capas y auditoría, con pruebas.
4. Tipografía, alturas, espaciado y radios.
5. Color con los roles de B, estados, terciaria y deslizadores.
6. Los rótulos de rol.
7. Después, comparación e informe.

Vuelta atrás: revertir `tokens.css`, `app.css`, las clases de los botones terciarios y de los estados, y los rótulos. No hay datos ni preferencias que migrar.
