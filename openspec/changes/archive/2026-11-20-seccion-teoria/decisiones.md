# Decisiones para revisar

Registro de lo que decidió la sesión principal sin consultar, mientras avanza sola (pedido del dueño,
20 de noviembre de 2026: "sé proactivo a la hora de decidir, anotá tus decisiones y los tradeoff para
luego revisar"). Cada una dice qué se eligió, qué se dejó y cómo se revierte.

## De alcance y organización

| # | Decisión | Alternativa descartada | Costo de lo elegido | Cómo se revierte |
|---|---|---|---|---|
| 1 | Los capítulos 3 a 9 entran en este mismo cambio (`seccion-teoria`), no en dos cambios nuevos | Dos cambios más, uno por bloque | Un cambio muy grande: 100 tareas y un solo archivado | Se puede archivar igual; los capítulos son carpetas independientes |
| 2 | Se suma un bloque plegado "Para profundizar" por capítulo, con la fórmula | Capítulos sin fórmulas | Más texto que escribir y revisar | Se quita el bloque; el capítulo no depende de él |
| 3 | La teoría se lee en el celular desde 360 px | Solo escritorio, como la app | Unas cinco tareas más y una disposición más que cuidar | Poner el aviso de escritorio por debajo de 600 px |
| 4 | El cierre de un capítulo lleva a la app pero no abre la pestaña nombrada | Sumar a la V1 abrir una pestaña por dirección | El lector tiene que hacer un clic más | Cuando se decida entre V1 y V2, se cambia un destino |
| 5 | No se hace commit mientras se avanza; se pide al final | Un commit por capítulo | Mucho trabajo sin commit en un checkout compartido | Pedir commits intermedios |

## De contenido y didáctica

| # | Decisión | Alternativa descartada | Costo de lo elegido | Cómo se revierte |
|---|---|---|---|---|
| 6 | Capítulo 0: "aprender" se muestra como un barrido del umbral de una regla | Mostrar ya una neurona aprendiendo | No es como aprende una red; el texto lo dice | Cambiar el tramo 5 |
| 7 | Capítulo 4: el error es la entropía cruzada, la que usa la app | El error cuadrático, más fácil de explicar | La fórmula es menos intuitiva; va a "Para profundizar" y el texto habla de "qué tan segura estaba de algo equivocado" | Cambiar la medida en la figura (no en la app) |
| 8 | Capítulo 5 muestra el error como un paisaje, aunque la práctica no lo tiene | Limitarse a la tasa de aprendizaje, que sí está | La teoría va un paso más allá de la práctica en ese punto | Quitar el tramo 5 del capítulo |
| 9 | Capítulo 7: la evolución se muestra con doce neuronas sobre el mapa del error, no con autos manejando | Una mini simulación de autos | Menos parecido a la pestaña Entrenar; a cambio se ve qué hace la mutación en los pesos | Rehacer la figura con la simulación del núcleo |
| 10 | Capítulo 8: el que "memoriza" responde como el ejemplo visto más parecido; no es una red | Una red grande sobreajustada, que habría que entrenar | Introduce una forma de contestar que la práctica no tiene; el texto la presenta como lo que es | Reemplazar por una red entrenada de antemano |
| 11 | Ningún desafío depende de que algo "aprenda" en cierta cantidad de pasos; todos tienen una solución conocida y probada | Desafíos del tipo "que aprenda en menos de N" | Desafíos más manuales | Cambiar el desafío del capítulo |
| 12 | 2012 (AlexNet) queda sin capítulo en la historia | Atarlo a "Generalizar o memorizar" | Un hito más sin vínculo con la práctica | Volver a enlazarlo |

## De proceso

| # | Decisión | Alternativa descartada | Costo de lo elegido | Cómo se revierte |
|---|---|---|---|---|
| 13 | Las cuentas de los capítulos 3 a 9 las escribe Opus en paralelo con el diseño de Fable, en archivos distintos | Una sesión después de la otra | Dos sesiones escriben a la vez en el checkout; se les prohíbe tocar los archivos de la otra | Volver a trabajar en serie |
| 14 | La revisión de contenido se hace por adelantado (hechos comprobados antes de escribir) y se coteja después | Revisar solo el texto ya escrito | Dos pasadas por capítulo | Hacer una sola al final |
| 15 | No se archivó `teoria-prototipos` | Archivarlo antes de empezar | Queda un cambio terminado sin archivar | Archivarlo |

Las decisiones que tomen las sub-sesiones al implementar se suman abajo, con su número de tarea.

## Tomadas al implementar

### Cuentas de los capítulos 3 a 9 (tareas 11.1 a 17.1, sesión Opus)

| # | Decisión | Alternativa descartada | Costo de lo elegido | Cómo se revierte |
|---|---|---|---|---|
| 16 | Los capítulos 4, 5 y 7 comparten ocho ejemplos (dos sensores, doblar o no); dos contradicen a los demás para que el error tenga un fondo dentro del mapa | Ejemplos separables, sin contradicción | El error nunca llega a 0 (fondo en 0,52); el texto tiene que decir que hay ejemplos que se contradicen | Cambiar los ejemplos en `error/cuenta.js` y volver a fijar los números de las pruebas |
| 17 | Capítulo 5: la pendiente promedia todos los ejemplos; la app corrige de a un ejemplo | Corregir de a uno, como la app | La figura no hace exactamente lo que hace la app; a cambio la bolita sigue la curva que se dibuja. Va dicho en "Para profundizar" | Cambiar `unPaso` para que use un ejemplo por vez |
| 18 | Capítulo 5: las tasas de la figura son 4, 40 y 60 (baja, se pasa, rebota), mucho más grandes que las de la app | Tasas del orden de las de la app | Los números no se parecen a los del Laboratorio; el texto no debe compararlos | Reescalar el mapa |
| 19 | Capítulo 3: la red del auto es 5-6-4 con semilla fija | Otra cantidad de ocultas | Ninguno; D12 no lo fijaba | Cambiar `redDelAuto` |
| 20 | Capítulo 7: los pesos se guardan de −1 a 1 y la neurona los usa por 6, para usar `mutate` sin tocarla | Una mutación propia en el rango del mapa | Una escala escondida entre el individuo y el mapa; el texto no la nombra | Escribir una mutación propia |
| 21 | Capítulo 8: la recta sale de 24 candidatas (una cada 15°), no de una neurona entrenada | Entrenar una neurona | "La mejor recta" es la mejor de 24; no se entrena nada en la página | Entrenar de antemano y fijar los pesos |
| 22 | Capítulo 8: con los datos elegidos la recta acierta 35 de 40 en lo visto y 38 de 40 en lo apartado; el memorizador, 40 de 40 y 31 de 40. El guion (D12) decía "los dos aciertan lo visto": el texto se ajusta a los números | Buscar datos donde los dos acierten todo lo visto | El tramo 1 cuenta algo un poco distinto, y más honesto: la recta ya falla algunos vistos | Cambiar semilla y ruido |
| 23 | La regla de arquitectura ya no cuenta como "uso del DOM" una palabra dentro de una cita (el paper de LeCun dice "document") | Renombrar o partir el texto | La regla ignora el texto entre comillas | Volver a la regla estricta |

### Portada, historia y capítulos 0 y 2 (grupos 3 a 8, sesión Fable)

| # | Decisión | Alternativa descartada | Costo de lo elegido | Cómo se revierte |
|---|---|---|---|---|
| 25 | Capítulo 0: "Buscar" busca en orden (primera regla sola; después la segunda con la primera fija) | Buscar cada regla con la otra donde la dejó la persona | Desde el estado del desafío la alternativa se trababa en 6 de 8; se sumó `buscarEnOrden` a la cuenta, con prueba | Cambiar la función de búsqueda |
| 26 | Línea de tiempo en dos renglones por debajo de 1024 px, con rótulo solo en el hito que se lee | Un renglón a espaciado parejo | En celular, 1997–1998 y 2016–2017 quedan a 12 px y cuesta tocarlos por separado | Espaciado parejo, fuera de escala |
| 27 | El segundo invierno se marca en 1990 (medio de 1987–1993) | Marcarlo en 1987 | En 1987 pisaba la marca de 1986; el rótulo sigue diciendo "fines de los 80" | Mover la marca |
| 28 | Los tramos que no se leen se atenúan al 55 % | 30 %, como el prototipo | Menos efecto de foco; a cambio el texto no baja de contraste legible (30 % daba 2,5:1) | Cambiar un valor de CSS |
| 29 | En celular, "Una neurona" muestra el diagrama con el auto en chico, o el plano solo | El dibujo entero | El auto se ve muy chico; en el plano la neurona queda solo en la cuenta escrita | Rediseñar la figura para celular |
| 30 | En celular la cuenta escrita no lleva la palabra final ("dobla", "encendida") | Dejarla, en dos renglones | Se pierde una palabra; a cambio la figura no cambia de alto al mover una perilla | Volver a mostrarla |
| 31 | El desafío no cuenta lo que se ve durante la transición entre tramos | Contarlo | Ninguno conocido; evitaba que se diera por resuelto de paso | — |
| 32 | Portada sin rótulos en mayúsculas | Rótulos en mayúsculas | Estético | CSS |

Sin resolver de esa tanda, para la verificación final (10.4): Escape sobre la ayuda en el capítulo 0 y
el orden de Tab en "Una neurona" fallaron una vez y no se reprodujeron; a 360×640 la figura del capítulo
0 no queda fija; a 360×560 las etiquetas de sesgo del capítulo 2 quedan en 8 px; el contorno de una
neurona apagada da 2,78:1 (es un token de la app).

### Del cotejo de contenido (sesión principal)

| # | Decisión | Alternativa descartada | Costo de lo elegido | Cómo se revierte |
|---|---|---|---|---|
| 33 | Kasparov queda como "campeón mundial" | Explicar que el título estaba partido (PCA y FIDE) | Simplifica un hecho discutible; las fuentes lo llaman campeón reinante | Sumar la aclaración |
| 34 | Los capítulos 3 a 6 los hace una sesión Fable nueva, y los 7 a 9 otra después, en serie | Dos sesiones Fable en paralelo | Tarda más; en paralelo se pisarían `styles/teoria.css` y el registro de figuras | Lanzarlas juntas con archivos de estilo separados |

### De proceso, tras la espera de 1 h 15 min

| # | Decisión | Alternativa descartada | Costo de lo elegido | Cómo se revierte |
|---|---|---|---|---|
| 24 | Todo comando de una sub-sesión lleva tiempo máximo (2 min, 5 como mucho) y todo script con navegador un tope global; la verificación final no bloquea el informe | Dejarlo a criterio de la sub-sesión | Alguna verificación puede quedar a medias; se informa cuál | — |

### Capítulos 3 a 6 (grupos 11 a 14, sesión Fable)

| # | Decisión | Alternativa descartada | Costo de lo elegido | Cómo se revierte |
|---|---|---|---|---|
| 35 | Los capítulos 3 a 6 figuran como disponibles en la portada antes de cerrar su revisión | Dejar abrir por dirección los no disponibles (tocar `rutas.js`) | La portada los muestra apenas se escriben | `disponible: false` en `capitulos/indice.js` |
| 36 | Capítulo 3: las entradas se mueven de a 0,25 | De a 0,1 | Cinco posiciones por perilla; con 0,1 el redondeo encendía la red justo en el borde | Cambiar el paso |
| 37 | Capítulo 3, tramos 1 y 5: la cuenta se llena sola al llegar y hay un botón "Otra vez" | "Nada que tocar", como decía el guion | Un control más; con movimiento reducido no hay animación ni botón | Quitar el botón |
| 38 | Capítulo 4, tramo 5: la curva se dibuja con el peso derecho en −2 (fondo en 2,3); el capítulo 5 usa −4,65 (fondo en 4,3) | La misma curva en los dos | Dos curvas distintas entre capítulos; cada texto dice sus números | Unificar el peso fijo |
| 39 | Capítulo 4: el texto dice que el error medio "no baja de 0,48" (sesgo libre) | 0,52, el fondo con sesgo 0 | Ninguno; hay prueba de que ahí la pendiente es cero | — |
| 40 | Capítulos 4 y 5: el avance del desafío se muestra como "tramos del camino hasta la meta" (4 marcas) | Mostrar el error como avance | El avance es una aproximación del error, que igual está a la vista | Cambiar el marcador |
| 41 | Capítulo 5, tramo 1: la curva va tapada y se descubre lo que se recorre | Curva a la vista desde el principio | Un tramo más abstracto; a cambio se siente por qué hace falta la pendiente | Mostrarla |
| 42 | Capítulo 5: el mapa usa franjas por cuantiles, como curvas de nivel | Degradé continuo | Las franjas no son de igual altura | Cambiar la escala |
| 43 | Capítulo 6: se cambian los pesos de partida para que la red llegue a los cuatro casos del XOR (decisión de la sesión principal) | Dejar los que se frenan en 3 de 4 y contarlo | Los pesos se eligen buscando; ninguna prueba afirma que "aprende en N épocas": eso lo mira el dueño | Volver a `RED_INICIAL` anterior |
| 44 | Capítulo 6: tope de 1000 épocas, con botones "Una época" y "100 épocas" | Reproducción continua | Más clics | Sumar un botón de reproducir |

Sin verificar de esa tanda, para la verificación final (10.4): en los cuatro, el inglés a la vista, el
movimiento reducido, el teclado, el dedo emulado, las ayudas, los 360 px y el cambio de idioma en vivo.

### De la revisión del dueño sobre el capítulo 7

| # | Decisión | Alternativa descartada | Costo de lo elegido | Cómo se revierte |
|---|---|---|---|---|
| 45 | Cuando un tramo deja cambiar lo que se ve ("Otra tanda") y el siguiente arranca de su propio estado, se arregla el texto: el tramo dice desde dónde arranca ("Volvemos a las doce del principio") | Arrastrar al tramo siguiente lo que la persona dejó en el anterior | Los puntos cambian al pasar de tramo, aunque avisado; a cambio los números del texto siempre coinciden con la figura (D4) | Permitir que un tramo herede el estado del anterior y sacar los números fijos de su prosa |

### Capítulos 7 a 9 y cierre de textos (grupos 15 a 18, sesión Fable)

| # | Decisión | Alternativa descartada | Costo de lo elegido | Cómo se revierte |
|---|---|---|---|---|
| 46 | Capítulo 7: los tramos 1 y 2 muestran los puntos sin el relieve del error; aparece en el 3 | Mostrarlo siempre | En los dos primeros tramos el mapa es un cuadro vacío; a cambio se siente que las neuronas "no ven" el terreno | Mostrar el relieve desde el tramo 1 |
| 47 | Capítulo 7: la lista muestra el error de cada neurona, no el fitness con signo | Mostrar el puntaje negativo | El texto tiene que decir "acá el fitness es tener poco error" | Mostrar −error |
| 48 | Capítulo 7: en el desafío, el botón queda deshabilitado a la vista mientras no haya ninguna elegida | Ocultarlo (regla del dueño: lo que no sirve se oculta) | Es el único control deshabilitado de la sección; oculto no se entendía qué apretar después. **Conviene que el dueño lo mire** | Ocultarlo hasta que haya una elegida |
| 49 | Capítulo 7: el desafío se resuelve en una generación eligiendo las tres mejores | Exigir tres generaciones seguidas | Es fácil | Bajar la meta de 0,6 |
| 50 | Capítulo 7: no hay líneas de padre a hija; quedan círculos a rayas donde estaban las que pasaron | Dibujar la descendencia | La cuenta de la app no dice de quién es cada hija | Sumar ese dato a la cuenta |
| 51 | Capítulo 8, tramo 5: el ruido no se toca; el tramo deja mirar todo y nombra "sobreajuste" | Una perilla de ruido, como decía el guion | Menos interacción; con otro ruido cambiarían todos los números del capítulo y habría que cotejar qué se afirma en cada valor | Sumar el ruido a la cuenta |
| 52 | Capítulo 8: desafío en dos pasos (apartar lo suficiente y quedarse con el que rinde mejor) | Un solo paso | Ninguno conocido | — |
| 53 | Capítulo 9: en el tramo 3 solo se puede apagar B; apagar A es la predicción del tramo 4 | Dejar apagar las dos | Un control menos en ese tramo; si no, la predicción se contestaba sola | Habilitar las dos |
| 54 | Capítulo 9: las neuronas del dibujo no se tocan; todo va por los mandos de abajo | Tocar la neurona para apagarla | Menos directo; más claro en celular | Hacerlas tocables |
| 55 | Capítulo 6: la frase "llegó a dar el XOR" aparece cuando la figura llega a 4 de 4 (`logroTexto`) | Frase condicional fija | Una pieza nueva en `tramo.js` | Volver a texto fijo |
| 56 | Portada: con los diez disponibles dice "Los 10 capítulos están listos. Conviene leerlos en orden." | Dejar "Los otros 0 están en camino" | Ninguno | — |
| 57 | 17 tramos de los diez capítulos dicen ahora desde dónde arranca la figura (consecuencia de la 45) | Solo el tramo 3 del capítulo 7 | Una frase más en cada uno; toca textos de 0, 1 y 2 ya cotejados (solo la frase de arranque) | Quitar las frases |

### De la segunda revisión del dueño (navegación, título y enlace)

| # | Decisión | Alternativa descartada | Costo de lo elegido | Cómo se revierte |
|---|---|---|---|---|
| 58 | El enlace "Teoría" de la app va a la altura de las pestañas, con su nombre, separado de ellas y con una marca de que abre otra página | Una pestaña más, igual a las otras | No es una pestaña: sale de la app y no tiene simulación; igual a las otras confundiría. Ocupa lugar en la fila de pestañas | Volver al ícono entre las herramientas |
| 59 | Al terminar un capítulo, el botón principal es "Siguiente: N. Título"; el enlace a la app queda como acción al lado, no como principal | Que lo principal sea ir a la app a practicar | Empuja a seguir leyendo antes que a practicar; el cierre sigue nombrando la pestaña | Invertir la jerarquía de los dos botones |
| 60 | Al volver a la portada se muestra el temario a la altura de la tarjeta de lo que se leyó, señalada | Recordar el desplazamiento exacto en píxeles | Si se entró directo a un capítulo por enlace, igual lleva a su tarjeta, que es lo útil | Guardar y reponer el desplazamiento |
| 61 | Título de la portada: "La teoría detrás de la práctica", con "Laboratorio de machine learning" arriba; el enlace de la barra sigue diciendo "Teoría" | "Cómo aprende una red neuronal" (dice el tema, no que es de este proyecto); "Teoría del laboratorio" (corto, menos claro para quien llega por un enlace) | Más largo que "Teoría" | Cambiar un texto en `comun.js` |
| 62 | V1: por debajo de 1240 px el enlace "Teoría" se muestra como libro + ↗, sin el nombre | Mantener el nombre a cualquier ancho | A 1032 px el nombre escondía 224 px de pestañas contra 127 de antes; sin nombre, el enlace se reconoce menos en ventanas angostas | Achicar otras herramientas de la barra para hacerle lugar |
| 63 | V2: "Teoría" va al final del riel de etapas, debajo de la etapa 5, con una línea arriba (lo decidió la sesión Opus) | Dejarlo en la barra de arriba, más grande | Queda lejos de la vista al abrir; a cambio está a la altura de las etapas, como pidió el dueño para la V1 | Volverlo a la barra |
| 64 | Los rótulos de figura de menos de 9 px a 360 px de ancho no se arreglan en este cambio; quedan en `PENDIENTES.md` | Rediseñar las figuras para 360 px | A 360 px (el piso que se prometió) hay rótulos chicos en casi todos los capítulos; a 390 px no | Una pasada de diseño por figura |
| 65 | El bloque "Siguiente" va después de "Para profundizar" y antes de las fuentes (lo decidió la sesión de diseño) | Después de las fuentes | Las fuentes quedan debajo del botón; el botón se ve sin pasar por ellas | Moverlo al final |
