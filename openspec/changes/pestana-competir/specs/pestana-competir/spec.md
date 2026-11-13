# Spec Delta

## Purpose

Es la pestaña 4, "Competir": pone a correr a la vez, hasta una meta, cerebros,
programas escritos a mano y a la persona, en la pista que se elija, y deja
anotado cómo le fue a cada uno en cada pista. Sirve para ver si lo aprendido funciona
donde no se practicó.

## ADDED Requirements

### Requirement: Carrera lista al abrir
Al abrirse por primera vez, la pestaña SHALL mostrar una carrera armada y
esperando en la salida, sin configurar nada: vos, el programa de ejemplo de 7
sensores de Reglas a mano y el cerebro de ejemplo entrenado en la calle con
tráfico nuevo, en la calle recta, con un tráfico nuevo. Los rivales y el
tráfico de la primera carrera MUST ser los mismos para todas las personas.

#### Scenario: Estado por defecto
- **WHEN** la persona abre Competir por primera vez
- **THEN** ve tres autos numerados en la línea de salida de la calle recta, el suyo en verde, un cartel para largar, el marcador con los tres competidores y la tabla por pista todavía sin resultados

#### Scenario: Sin cerebros propios ni programa propio
- **WHEN** la persona nunca entrenó un cerebro ni escribió un programa
- **THEN** la pestaña funciona igual, con el cerebro y el programa de ejemplo

#### Scenario: Primera carrera repetible
- **WHEN** dos personas abren la pestaña sin tocar nada y largan
- **THEN** las dos corren contra los mismos dos rivales, con el mismo tráfico, y los rivales hacen lo mismo

#### Scenario: Programa propio con errores
- **WHEN** el programa de la persona en Reglas a mano tiene errores y abre Competir por primera vez
- **THEN** la carrera por defecto es la misma: usa el programa de ejemplo, no el suyo

### Requirement: Guía de inicio
Con la guía activa, el panel SHALL empezar con un texto breve que diga qué se
está viendo y qué probar: correr contra un cerebro y un programa, y cambiar de
pista para mirar en la tabla quién sigue andando donde nunca practicó.

#### Scenario: Guía visible
- **WHEN** la guía está activa
- **THEN** el texto dice que los autos son fantasmas que no se chocan entre sí, que cada uno maneja con lo que aprendió o con sus reglas, y que cambiar de pista muestra quién generaliza

#### Scenario: Guía oculta
- **WHEN** la persona apaga la guía
- **THEN** el texto y las misiones no se muestran y el panel empieza por los controles de la carrera

#### Scenario: Texto breve
- **WHEN** el panel mide 360 píxeles de ancho, en español o en inglés
- **THEN** el texto de inicio ocupa como mucho cinco renglones

### Requirement: Elegir a los competidores
El panel SHALL mostrar, siempre a la vista, la lista de los competidores de la
carrera, de uno a seis, y solo ellos. Cada fila tiene el número y el color con
que se lo ve en el escenario, su nombre, su tipo y un botón para quitarlo.
Quitar o agregar un competidor MUST empezar una carrera nueva en la misma
pista y con el mismo tráfico.

#### Scenario: Solo los que corren
- **WHEN** la persona tiene veinte cerebros guardados y abre la pestaña por primera vez
- **THEN** la lista muestra tres filas, las de los tres competidores por defecto, y dice 3 de 6

#### Scenario: Quitar a uno
- **WHEN** la persona usa el botón de quitar de un competidor
- **THEN** ese competidor sale de la lista y de la carrera, que vuelve a empezar, y los demás conservan su número y su color

#### Scenario: Al menos uno
- **WHEN** queda un solo competidor
- **THEN** su fila no ofrece quitarlo

#### Scenario: Cerebro eliminado
- **WHEN** la persona elimina en Entrenar un cerebro que estaba en la carrera y vuelve a Competir
- **THEN** ese competidor ya no está en la lista ni en la carrera, y sus resultados salen de la tabla

#### Scenario: Seis filas sin desplazarse
- **WHEN** la carrera tiene seis competidores
- **THEN** la lista muestra las seis filas enteras, sin desplazarse por dentro

### Requirement: Agregar competidores
Junto a la lista, el panel SHALL ofrecer un botón "Agregar" que abre un
selector con todos los que pueden correr y todavía no están en la carrera,
agrupados: vos, programas, tus cerebros y cerebros de ejemplo. Elegir uno lo
suma a la carrera. El selector SHALL desplazarse por dentro cuando son muchos
y MUST poder usarse entero con el teclado.

#### Scenario: Agregar un cerebro guardado
- **WHEN** la persona abre el selector y elige su cerebro guardado "Prudente"
- **THEN** "Prudente" pasa a la lista de competidores con su número y su color, y la carrera vuelve a empezar

#### Scenario: Agregar varios
- **WHEN** la persona elige tres cerebros sin cerrar el selector
- **THEN** los tres quedan en la carrera y el selector sigue abierto hasta que lo cierra

#### Scenario: Veinte cerebros
- **WHEN** la biblioteca tiene veinte cerebros
- **THEN** el selector los muestra todos desplazándose por dentro, sin salirse de la ventana, y el panel no cambia de alto

#### Scenario: Qué es cada uno
- **WHEN** la persona mira un cerebro en el selector
- **THEN** ve su nombre y dónde entrenó

#### Scenario: Máximo de seis
- **WHEN** la carrera ya tiene seis competidores
- **THEN** "Agregar" está deshabilitado y su tooltip explica que el máximo es seis

#### Scenario: Cerebro guardado después
- **WHEN** la persona guarda un cerebro en Entrenar y vuelve a Competir
- **THEN** el cerebro nuevo aparece en el selector, sin estar en la carrera

#### Scenario: Nada para agregar
- **WHEN** todos los que pueden correr ya están en la carrera
- **THEN** el selector lo dice y explica que los cerebros se guardan en Entrenar

#### Scenario: Teclado
- **WHEN** la persona abre el selector con Enter, elige con las flechas y Enter, y presiona Escape
- **THEN** el competidor queda agregado, el selector se cierra y el foco vuelve al botón "Agregar"

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla llega al botón y abre el selector
- **THEN** anuncia que el botón abre una lista, cada grupo con su nombre y cada opción con su nombre, su tipo y, en los cerebros, dónde entrenó

### Requirement: Sensores de cada competidor
Cada competidor que no es la persona SHALL tener en su fila un botón para
mostrar u ocultar sus sensores en el escenario, apagado por defecto, se lo
esté siguiendo o no. El auto de la persona MUST NOT mostrar sensores ni tener
ese botón. Los rayos de cada competidor SHALL verse con su color.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** ningún auto muestra sensores

#### Scenario: Mostrar los de uno
- **WHEN** la persona enciende los sensores del cerebro de ejemplo mientras maneja
- **THEN** se ven los rayos de ese cerebro, con su color, y no los de los demás ni los de su propio auto

#### Scenario: Varios a la vez
- **WHEN** la persona enciende los sensores de dos competidores
- **THEN** se ven los rayos de los dos, cada uno con el color de su competidor

#### Scenario: Vos sin sensores
- **WHEN** la persona mira la fila de "Vos"
- **THEN** no tiene botón de sensores

#### Scenario: Elección recordada
- **WHEN** la persona enciende los sensores de un competidor y empieza otra carrera
- **THEN** ese competidor sigue mostrando sus sensores

#### Scenario: Botón explicado y accesible
- **WHEN** la persona pone el foco en el botón de sensores de un competidor
- **THEN** un tooltip dice qué hace y por qué importa, y un lector de pantalla anuncia de quién son los sensores y si están a la vista

### Requirement: Tu programa como competidor
El selector SHALL ofrecer como competidor el programa actual de Reglas a mano,
con los sensores para los que está escrito; no está en la carrera por defecto. Si el
programa tiene errores, el competidor MUST verse deshabilitado y explicar por
qué.

#### Scenario: Programa válido
- **WHEN** la persona agrega "Tu programa" con un programa válido de 5 sensores
- **THEN** corre un auto de 5 sensores manejado por ese programa

#### Scenario: Programa con errores
- **WHEN** el programa de Reglas a mano tiene un error
- **THEN** en el selector, "Tu programa" está deshabilitado y su tooltip dice que hay que corregirlo en Reglas a mano

#### Scenario: Programa cambiado
- **WHEN** la persona cambia su programa en Reglas a mano y vuelve a Competir
- **THEN** la carrera siguiente usa el programa nuevo

### Requirement: Programas de ejemplo como competidores
El selector SHALL ofrecer como competidores los tres programas de ejemplo de
Reglas a mano (3 sensores cortos, 7 sensores y 20 sensores), cada uno con sus
sensores. El de 7 sensores está en la carrera por defecto. MUST ser siempre
los mismos, sin importar lo que la persona haya escrito o cargado en Reglas a
mano.

#### Scenario: En la carrera por defecto
- **WHEN** se abre la pestaña por primera vez
- **THEN** uno de los competidores es el programa de 7 sensores, con el nombre que tiene en Reglas a mano

#### Scenario: Los otros ejemplos
- **WHEN** la persona abre el selector
- **THEN** en el grupo de programas están el de 3 sensores cortos y el de 20 sensores, además de "Tu programa"

#### Scenario: No depende del programa de la persona
- **WHEN** la persona borra todo su programa en Reglas a mano y vuelve a Competir
- **THEN** los programas de ejemplo corren igual que antes

#### Scenario: Varios programas a la vez
- **WHEN** la persona agrega "Tu programa" y el de 20 sensores
- **THEN** corren los tres programas, cada uno con su número, su color y sus sensores

### Requirement: Vos como competidor
La persona SHALL poder correr como un competidor más, manejando con las
flechas un auto verde, el del conductor; está en la carrera por defecto. Con
"vos" en la carrera, la carrera MUST esperar en la salida hasta que la persona la largue,
y MUST correr a velocidad normal: las velocidades de simulación no se
muestran.

#### Scenario: Cartel para largar
- **WHEN** hay una carrera esperando en la salida con "Vos" en la carrera
- **THEN** sobre el escenario hay un cartel que dice que se maneja con las flechas y cuál es la meta, con un botón para largar y, con los atajos encendidos, la tecla espacio

#### Scenario: Largar con espacio
- **WHEN** la persona presiona espacio con los atajos encendidos
- **THEN** el cartel desaparece, empieza la cuenta regresiva y, al terminar, arrancan todos los competidores a la vez

#### Scenario: Atajos apagados
- **WHEN** los atajos de una tecla están apagados
- **THEN** el cartel no nombra la tecla espacio, la persona larga con el botón y maneja igual con las flechas

#### Scenario: Manejar contra los fantasmas
- **WHEN** la persona larga y maneja con las flechas
- **THEN** su auto responde como en El problema y los demás competidores corren a la vez

#### Scenario: Sin velocidades
- **WHEN** "Vos" está en la carrera
- **THEN** el panel no muestra las velocidades de simulación

#### Scenario: Cada carrera espera
- **WHEN** con "Vos" en la carrera la persona reinicia, larga otra carrera o cambia de pista
- **THEN** la carrera nueva vuelve a esperar en la salida con el cartel

#### Scenario: Sin vos
- **WHEN** la persona quita a "Vos" de la carrera
- **THEN** la carrera larga sola, sin cartel, y el panel muestra las velocidades de simulación

### Requirement: Cuenta regresiva al largar
Con "vos" en la carrera, largar SHALL mostrar sobre el escenario una cuenta
regresiva de 3, 2, 1, de un segundo por número, antes de que arranque la
carrera, para que la persona se prepare. Durante la cuenta los autos MUST
estar detenidos y el tiempo de la carrera en cero. Sin "vos", la carrera
arranca sin cuenta.

#### Scenario: Tres, dos, uno
- **WHEN** la persona larga con "Vos" en la carrera
- **THEN** se ven en grande, sobre el escenario, el 3, el 2 y el 1, un segundo cada uno, y después arrancan todos a la vez con el tiempo en cero

#### Scenario: Flechas durante la cuenta
- **WHEN** la persona mantiene apretada la flecha de avanzar durante la cuenta
- **THEN** su auto no se mueve hasta que termina la cuenta, y arranca en ese momento sin soltar la tecla

#### Scenario: Espacio durante la cuenta
- **WHEN** la persona vuelve a presionar espacio durante la cuenta
- **THEN** la cuenta sigue: no se pausa, no se saltea ni vuelve a empezar

#### Scenario: Arrepentirse
- **WHEN** la persona reinicia durante la cuenta
- **THEN** la cuenta se corta y la carrera vuelve a esperar en la salida con el cartel

#### Scenario: Salir de la pestaña
- **WHEN** la persona abre otra pestaña durante la cuenta y vuelve
- **THEN** la carrera está esperando en la salida con el cartel, sin haber largado

#### Scenario: Sin vos
- **WHEN** la carrera no tiene a "Vos"
- **THEN** arranca sin cuenta regresiva

#### Scenario: Lector de pantalla
- **WHEN** empieza la cuenta
- **THEN** un lector de pantalla anuncia una vez que la carrera larga en 3 segundos, y no cada número

#### Scenario: Movimiento reducido
- **WHEN** el sistema pide menos movimiento
- **THEN** los números cambian sin animación

### Requirement: Controles de la carrera
El panel SHALL ofrecer pausar y reanudar, reiniciar la misma carrera, largar
otra carrera y, sin "vos" en la carrera, las velocidades de simulación de Entrenar.
Reiniciar repite la carrera con el mismo tráfico; otra carrera usa, en la
calle recta con tráfico nuevo, un tráfico que todavía no se usó desde que se
abrió la aplicación.

#### Scenario: Pausar
- **WHEN** la persona pausa
- **THEN** los autos y el tiempo de la carrera se detienen, y reanudar los continúa

#### Scenario: Reiniciar
- **WHEN** la persona reinicia a mitad de una carrera
- **THEN** la misma carrera empieza de nuevo, con el mismo tráfico, y la carrera interrumpida no deja resultados en la tabla

#### Scenario: Otra carrera
- **WHEN** la persona larga otra carrera en la calle recta con tráfico nuevo
- **THEN** los mismos competidores salen frente a un tráfico distinto de todos los anteriores

#### Scenario: Velocidad máxima
- **WHEN** la persona elige la velocidad máxima sin "Vos" en la carrera
- **THEN** la carrera termina en pocos segundos y el marcador y la tabla quedan con el resultado

#### Scenario: Fin de la carrera
- **WHEN** termina una carrera
- **THEN** los autos quedan donde terminaron, el marcador muestra el resultado final y "otra carrera" queda como la acción principal

### Requirement: Chocar y seguir
En una carrera, chocar SHALL NOT dejar a nadie afuera: el auto reaparece un
poco más atrás y sigue. El panel SHALL ofrecer un ajuste, siempre a la vista,
para la penalización por choque, de 0 a 3 segundos, con 0,1 por defecto.
Cambiarla MUST empezar otra carrera.

#### Scenario: Chocar manejando
- **WHEN** la persona choca contra un vehículo manejando
- **THEN** su auto reaparece enseguida en el centro, un poco más atrás, y durante 2 segundos puede pasar a través del tráfico, sin tocar nada más que las flechas

#### Scenario: Protección a la vista
- **WHEN** un auto acaba de reaparecer y todavía está protegido
- **THEN** se lo ve como un fantasma, distinto de los demás, hasta que termina la protección

#### Scenario: Un cerebro que choca
- **WHEN** un cerebro choca contra el borde
- **THEN** reaparece y sigue corriendo, y su fila del marcador suma un choque

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la penalización es de 0,1 segundos

#### Scenario: Subir la penalización
- **WHEN** la persona pone la penalización en 2 segundos y suelta el deslizador
- **THEN** empieza otra carrera, y en ella cada choque deja al auto detenido 2 segundos

#### Scenario: Competidor que no avanza
- **WHEN** un cerebro choca una y otra vez en la misma curva sin pasar de ahí
- **THEN** a los 5 segundos queda fuera, su fila dice que no terminó y los demás siguen corriendo

### Requirement: Meta y espera
La pestaña SHALL mostrar la meta de la carrera (metros en la calle recta,
vueltas en un circuito) antes de largar y durante la carrera. Cuando llega el
primero, SHALL mostrar a la vista la cuenta de los 20 segundos que tienen los
demás para llegar.

#### Scenario: Meta antes de largar
- **WHEN** hay una carrera esperando en la salida del óvalo
- **THEN** se lee que la carrera es a 2 vueltas

#### Scenario: Llega el primero
- **WHEN** llega el primer competidor y otros siguen corriendo
- **THEN** se ve una cuenta regresiva desde 20 segundos, y un lector de pantalla anuncia una vez quién llegó y cuánto queda

#### Scenario: Se acaba la espera
- **WHEN** la cuenta llega a cero con la persona todavía manejando
- **THEN** la carrera termina, su fila dice que no terminó, con lo que llevaba, y "otra carrera" queda como la acción principal

#### Scenario: Llegan todos antes
- **WHEN** todos llegan antes de que termine la cuenta
- **THEN** la carrera termina en ese momento, sin esperar

### Requirement: Tráfico de la carrera
En la calle recta, el panel SHALL permitir elegir el tráfico de la carrera:
nuevo, por defecto, o el de práctica, que es el mismo tráfico con el que
practican los cerebros entrenados con "el mismo tráfico". Cambiarlo MUST
empezar otra carrera. El ajuste solo sirve en la calle recta: en un circuito
SHALL NOT mostrarse.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** el tráfico elegido es el nuevo

#### Scenario: Tráfico de práctica
- **WHEN** la persona elige el tráfico de práctica
- **THEN** la carrera vuelve a empezar con ese tráfico, que es siempre el mismo

#### Scenario: El que memorizó
- **WHEN** el ejemplo entrenado con el mismo tráfico corre con el tráfico de práctica y después con uno nuevo
- **THEN** la tabla muestra los dos resultados de la calle recta, cada uno con el tráfico con que se corrió

#### Scenario: Volver al tráfico nuevo
- **WHEN** la persona vuelve a elegir tráfico nuevo
- **THEN** la carrera siguiente usa un tráfico que no se usó antes

#### Scenario: En un circuito
- **WHEN** la pista elegida es un circuito
- **THEN** el panel no muestra el ajuste del tráfico de la carrera

#### Scenario: Vuelta a la calle recta
- **WHEN** la persona tenía elegido el tráfico de práctica, corre en un circuito y vuelve a la calle recta
- **THEN** el ajuste vuelve a mostrarse, con el tráfico de práctica elegido

#### Scenario: Tráfico de práctica que nadie vio
- **WHEN** la persona elige el tráfico de práctica y ningún cerebro de la carrera practicó con los carriles, la densidad y la irregularidad de la barra
- **THEN** un renglón junto al ajuste avisa que ninguno de los competidores practicó con ese tráfico

### Requirement: Barra de escenario en Competir
La pista, el tráfico, la meta y la velocidad de la barra de escenario SHALL
ser los de la carrera, y cambiarlos MUST empezar otra carrera en el momento. El grupo de
sensores SHALL NOT mostrarse: cada competidor trae los suyos.

#### Scenario: Cambiar de pista
- **WHEN** la persona elige el óvalo durante una carrera en la calle recta
- **THEN** los mismos competidores salen en el óvalo en ese momento, y la carrera interrumpida no deja resultados

#### Scenario: Cambiar la densidad
- **WHEN** la persona sube la densidad y suelta el deslizador
- **THEN** la carrera vuelve a empezar con el tráfico más denso

#### Scenario: Misma velocidad para todos
- **WHEN** la persona pone la velocidad máxima en 25 m/s
- **THEN** todos los competidores, también los cerebros entrenados con otra velocidad, corren con máxima de 25 m/s

#### Scenario: Restablecer
- **WHEN** la persona restablece el escenario
- **THEN** la carrera vuelve a la calle recta con los valores por defecto

### Requirement: Meta configurable
La barra de escenario SHALL ofrecer en Competir la meta de la carrera: en la
calle recta, la distancia, de 500 a 3000 metros de a 100; en un circuito, las
vueltas, de 1 a 5. Cada pista SHALL recordar su meta. Cambiarla MUST empezar
otra carrera al soltar el control, y restablecer el escenario la devuelve a
su valor por defecto.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** la meta es de 1000 m en la calle recta, 2 vueltas en el óvalo y 1 en el óvalo con chicana y en el circuito de curvas

#### Scenario: Carrera más larga en la calle
- **WHEN** la persona pone la meta en 2000 m y suelta el control
- **THEN** empieza otra carrera a 2000 m, y la línea de meta, el cartel para largar y el indicador dicen 2000 m

#### Scenario: Más vueltas
- **WHEN** en el óvalo con chicana la persona elige 3 vueltas
- **THEN** empieza otra carrera a 3 vueltas

#### Scenario: Una meta por pista
- **WHEN** la persona pone 3 vueltas en el óvalo, pasa a la calle recta y vuelve al óvalo
- **THEN** el óvalo sigue en 3 vueltas y la calle recta conserva su distancia

#### Scenario: Unidad según la pista
- **WHEN** la persona pasa de la calle recta a un circuito
- **THEN** el mismo control pasa de metros a vueltas, con su nombre y su tooltip

#### Scenario: Restablecer
- **WHEN** la persona restablece el escenario
- **THEN** la meta de todas las pistas vuelve a su valor por defecto

#### Scenario: Resultados de otra meta
- **WHEN** una celda de la tabla guarda un resultado corrido con otra meta que la actual
- **THEN** se ve atenuada y dice que es de una carrera con otros ajustes

### Requirement: Panel sin desplazamiento lateral
El panel de Competir MUST NOT desplazarse hacia los costados ni mostrar texto
cortado, con cualquier ancho de panel que la aplicación permita, en español y
en inglés. Los nombres de los botones MUST leerse enteros.

#### Scenario: Panel en su ancho mínimo
- **WHEN** la persona achica el panel hasta el mínimo permitido
- **THEN** el panel no se desplaza hacia los costados y ningún contenido queda fuera de la vista a la izquierda ni a la derecha

#### Scenario: Botones de la carrera
- **WHEN** el panel mide 360 píxeles de ancho o su mínimo, en español o en inglés
- **THEN** los botones de largar, reiniciar y otra carrera se leen enteros, sin puntos suspensivos

#### Scenario: Nombre largo
- **WHEN** un competidor tiene un nombre de 40 caracteres
- **THEN** la lista lo muestra sin ensanchar el panel

### Requirement: Indicadores de la carrera
El tablero SHALL mostrar, actualizados en tiempo real, tres indicadores: el
tiempo de carrera, la meta con cuántos llegaron, y quién va primero.

#### Scenario: En carrera
- **WHEN** van 20 segundos de una carrera de tres competidores a 1000 metros y no llegó nadie
- **THEN** los indicadores muestran 20 s, la meta de 1000 m con 0 de 3, y el nombre del que va primero

#### Scenario: Espera abierta
- **WHEN** llegó el primero y quedan 14 segundos de espera
- **THEN** el indicador del tiempo muestra además que quedan 14 s

#### Scenario: Carrera terminada
- **WHEN** termina la carrera
- **THEN** el indicador del primero pasa a decir quién ganó, o que no llegó nadie

### Requirement: Marcador de la carrera
El tablero SHALL mostrar, en una tarjeta, el marcador de la carrera en curso:
una fila por competidor, en orden de carrera, con su número y su color, su
nombre, su tipo (cerebro, programa o persona), cuánto lleva (metros en la
calle recta, vueltas con un decimal en un circuito) o su tiempo si llegó, sus
choques, su mejor vuelta en los circuitos y su estado: en carrera, llegó o no
terminó.

#### Scenario: Orden en vivo
- **WHEN** un competidor pasa a otro
- **THEN** sus filas cambian de lugar en el marcador

#### Scenario: Competidor que choca
- **WHEN** un competidor choca por segunda vez
- **THEN** su fila dice 2 choques y sigue en carrera

#### Scenario: Competidor que llega
- **WHEN** un competidor llega a la meta a los 48,2 segundos
- **THEN** su fila pasa arriba de los que no llegaron y dice que llegó, en 48,2 s

#### Scenario: Competidor que no terminó
- **WHEN** un competidor queda fuera por no avanzar o porque se acabó la espera
- **THEN** su fila dice que no terminó, con lo que llevaba

#### Scenario: Circuito
- **WHEN** la carrera es en el óvalo y un competidor completó una vuelta en 28,4 segundos
- **THEN** su fila muestra sus vueltas y una mejor vuelta de 28,4 s

#### Scenario: Calle recta
- **WHEN** la carrera es en la calle recta
- **THEN** el marcador no muestra la columna de mejor vuelta

#### Scenario: Estado sin depender del color
- **WHEN** un competidor llegó y otro no terminó
- **THEN** sus estados se leen en texto, no solo por un color o un ícono

### Requirement: Seguir a un competidor
Con "vos" en carrera, la cámara SHALL seguir siempre al auto de la persona,
también cuando choca y reaparece, y MUST NOT poder pasarse a otro mientras
maneja. Sin "vos", la cámara SHALL seguir al que va primero, y un clic en un
competidor del marcador SHALL pasar a seguirlo a él, hasta que la persona
elija otro o empiece otra carrera.

#### Scenario: Vos en carrera
- **WHEN** la persona está manejando en una carrera
- **THEN** la cámara sigue a su auto todo el tiempo, vaya primero o último, y el marcador no ofrece seguir a otro

#### Scenario: Chocar y reaparecer
- **WHEN** la persona choca y su auto reaparece más atrás
- **THEN** la cámara sigue en su auto y la persona lo ve reaparecer

#### Scenario: Cuando ya no manejás
- **WHEN** la persona llegó a la meta o quedó fuera, y otros siguen corriendo
- **THEN** el marcador vuelve a ofrecer seguir a un competidor, y la cámara se queda en su auto hasta que elija a otro

#### Scenario: Carrera nueva con vos
- **WHEN** la persona seguía a otro competidor y empieza otra carrera
- **THEN** la cámara vuelve a su auto

#### Scenario: Seguir al primero
- **WHEN** corre una carrera sin "Vos" y sin que la persona elija a nadie
- **THEN** la cámara sigue al que va primero entre los que siguen corriendo y cambia de auto cuando cambia el primero

#### Scenario: Elegir a uno
- **WHEN** sin "Vos" en carrera la persona hace clic en el tercero del marcador
- **THEN** la cámara pasa a seguirlo y su fila queda marcada como la seguida

#### Scenario: Con el teclado
- **WHEN** la persona llega con Tab a un competidor del marcador y presiona Enter
- **THEN** la cámara pasa a seguir a ese competidor

### Requirement: Tabla por pista
El tablero SHALL mostrar, en una tarjeta, una tabla con una fila por
competidor de la carrera y una columna por cada pista del catálogo. Cada celda muestra el
último resultado de ese competidor en esa pista en una carrera terminada: su
tiempo si llegó, o qué parte de la carrera hizo si no terminó, y sus choques. La tabla SHALL conservarse al cambiar de
pestaña, hasta cerrar la aplicación.

#### Scenario: Se llena al terminar
- **WHEN** termina una carrera en el óvalo
- **THEN** la columna del óvalo muestra el resultado de cada competidor de esa carrera

#### Scenario: Llegó
- **WHEN** un competidor llegó en 48,2 segundos con 1 choque
- **THEN** su celda dice 48,2 s y 1 choque

#### Scenario: No terminó
- **WHEN** un competidor quedó fuera con el 64 % de la carrera y 7 choques
- **THEN** su celda dice que no terminó, 64 % y 7 choques

#### Scenario: Pista sin correr
- **WHEN** un competidor todavía no corrió en el circuito de curvas
- **THEN** su celda de esa pista dice que todavía no corrió

#### Scenario: Carrera interrumpida
- **WHEN** la persona reinicia o cambia de pista antes de que la carrera termine
- **THEN** la tabla no cambia

#### Scenario: Tabla conservada
- **WHEN** la persona corre dos carreras, abre Entrenar y vuelve
- **THEN** la tabla sigue mostrando los resultados de las dos carreras

#### Scenario: Borrar resultados
- **WHEN** la persona usa "Borrar resultados", que está en el encabezado de la tarjeta de la tabla
- **THEN** la tabla queda vacía y ningún cerebro cambia

#### Scenario: Sin resultados que borrar
- **WHEN** la tabla todavía no tiene ningún resultado
- **THEN** "Borrar resultados" no se muestra

#### Scenario: Resultado con otros ajustes
- **WHEN** una celda guarda un resultado corrido con otra velocidad máxima, otro tráfico u otra penalización que los actuales
- **THEN** la celda se ve atenuada y dice que es de una carrera con otros ajustes

#### Scenario: Competidor quitado y vuelto a agregar
- **WHEN** la persona quita a un competidor con resultados y más tarde lo vuelve a agregar
- **THEN** su fila sale de la tabla y vuelve con los resultados que tenía

#### Scenario: Cerebro actualizado
- **WHEN** la persona actualiza en Entrenar un cerebro guardado que tenía resultados y vuelve a Competir
- **THEN** la fila de ese cerebro queda sin resultados, porque ya no es el mismo

### Requirement: Dónde entrenó cada cerebro
En la tabla por pista, cada celda de un cerebro SHALL decir si ese cerebro
entrenó en esa pista o nunca la vio, según sus datos de entrenamiento. En la
calle recta SHALL decir además si entrenó siempre con el mismo tráfico. La
marca MUST verse aunque el cerebro todavía no haya corrido ahí, y MUST NOT
depender solo del color. El programa y la persona no llevan marca.

#### Scenario: Entrenó acá
- **WHEN** se mira la celda del óvalo del ejemplo entrenado en el óvalo
- **THEN** dice que entrenó en esa pista

#### Scenario: Nunca la vio
- **WHEN** se mira la celda del circuito de curvas de ese mismo ejemplo
- **THEN** dice que nunca vio esa pista

#### Scenario: Un solo tráfico
- **WHEN** se mira la celda de la calle recta del ejemplo entrenado con el mismo tráfico
- **THEN** dice que entrenó ahí, siempre con el mismo tráfico

#### Scenario: Cerebro de varias pistas
- **WHEN** se mira la fila de un cerebro entrenado alternando la calle recta y el óvalo
- **THEN** las celdas de esas dos pistas dicen que entrenó ahí y las otras dos, que nunca las vio

#### Scenario: Leer la generalización
- **WHEN** la persona corrió a un cerebro en una pista donde entrenó y en otra que nunca vio
- **THEN** en su fila se leen juntos los dos resultados con sus marcas, y un renglón de ayuda dice que rendir donde no se practicó es generalizar

### Requirement: Resultado de la calle con su tráfico
En la columna de la calle recta, cada resultado SHALL decir con qué tráfico se
corrió, nuevo o de práctica, y la celda SHALL conservar el último resultado de
cada uno de los dos.

#### Scenario: Dos tráficos
- **WHEN** un cerebro corrió en la calle recta con tráfico de práctica y después con tráfico nuevo
- **THEN** su celda muestra los dos resultados, cada uno con su tráfico

#### Scenario: Solo tráfico nuevo
- **WHEN** un cerebro solo corrió con tráfico nuevo
- **THEN** su celda muestra ese resultado y no dice nada del tráfico de práctica

### Requirement: Misiones
Con la guía activa, el panel SHALL mostrar tres misiones con su progreso:
terminar una carrera en cada una de las cuatro pistas, encontrar un cerebro
que choque en una pista que nunca vio, y llegar a la meta antes que un cerebro
manejando vos. Las misiones MUST NOT bloquear nada y una misión cumplida SHALL
seguir marcada hasta cerrar la aplicación.

#### Scenario: Progreso de las pistas
- **WHEN** la persona terminó carreras en dos pistas distintas
- **THEN** la primera misión muestra 2 de 4

#### Scenario: Cerebro fuera de lo que vio
- **WHEN** termina una carrera en la que un cerebro chocó al menos una vez en una pista donde no entrenó
- **THEN** la segunda misión queda cumplida

#### Scenario: Ganarle a un cerebro
- **WHEN** termina una carrera en la que "Vos" llegó a la meta y quedó por delante de al menos un cerebro
- **THEN** la tercera misión queda cumplida

#### Scenario: Misiones de un renglón
- **WHEN** el panel mide 360 píxeles de ancho, en español o en inglés
- **THEN** el nombre de cada misión y su estado se leen en el mismo renglón

### Requirement: La carrera se conserva al cambiar de pestaña
Al salir de la pestaña y volver, la pestaña SHALL conservar los competidores
marcados, la pista, el tráfico elegido y la tabla, hasta cerrar la aplicación.
La carrera en curso MUST quedar en pausa mientras la pestaña no está a la
vista.

#### Scenario: Volver a la pestaña
- **WHEN** la persona arma una carrera con cinco competidores en el óvalo, abre Reglas a mano y vuelve
- **THEN** encuentra los mismos cinco competidores, el óvalo y la tabla como los dejó

#### Scenario: Pausa al salir
- **WHEN** la persona abre otra pestaña con una carrera en marcha
- **THEN** la carrera no avanza hasta que vuelve

### Requirement: Pestaña a la vista sin desplazarse
Con la ventana en 1440×900 y la guía activa, el panel de Competir SHALL verse
sin desplazarse, salvo la lista de competidores, que se desplaza por dentro, y
el tablero SHALL mostrar a la vez los indicadores, el marcador y la tabla por
pista. Ningún ajuste MUST quedar en una sección plegable.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900 y la guía activa
- **THEN** se ven sin desplazar la guía, los controles de la carrera, el tráfico de la carrera, la penalización por choque, los seis competidores de la lista y las misiones

#### Scenario: Sin vos, con las velocidades
- **WHEN** la persona quita a "Vos" con la ventana en 1440×900 y la guía activa
- **THEN** el panel suma las velocidades de simulación y sigue sin desplazarse

#### Scenario: Nada deshabilitado por la pestaña
- **WHEN** se recorre la pestaña en la calle recta y en un circuito, con "Vos" y sin "Vos"
- **THEN** no hay ningún ajuste a la vista que no tenga efecto en esa situación, salvo el tráfico de la barra en un circuito, que se comporta como en las demás pestañas

#### Scenario: Tablero completo
- **WHEN** corre una carrera de seis competidores con la ventana en 1440×900
- **THEN** el marcador muestra las seis filas y la tabla por pista sus cuatro columnas, sin desplazar el tablero

#### Scenario: Tabla angosta
- **WHEN** el tablero mide 360 píxeles de ancho
- **THEN** la tabla por pista se sigue leyendo: los nombres de las pistas usan su forma corta y ninguna celda queda cortada

### Requirement: Controles de la pestaña explicados
Cada control de la pestaña SHALL tener un tooltip que diga qué hace y por qué
importa. Todos los textos, estados, marcas y misiones SHALL estar en español y
en inglés. El marcador y la tabla SHALL ser tablas con encabezados para
lectores de pantalla, y el fin de cada carrera MUST anunciarse.

#### Scenario: Tooltip del tráfico de práctica
- **WHEN** la persona posa el cursor sobre el tráfico de práctica
- **THEN** un tooltip en el idioma activo explica que es el tráfico que vieron los cerebros entrenados con el mismo tráfico, y que rendir solo ahí es haberlo memorizado

#### Scenario: Tooltip de la penalización
- **WHEN** la persona posa el cursor sobre la penalización por choque
- **THEN** un tooltip explica que es el tiempo que un auto queda detenido al chocar antes de reaparecer, y que con más penalización chocar cuesta más frente a manejar con cuidado

#### Scenario: Tooltip de una marca
- **WHEN** la persona posa el cursor o pone el foco sobre la marca "nunca la vio"
- **THEN** un tooltip explica que ese cerebro no entrenó en esa pista y que lo que haga ahí muestra si generaliza

#### Scenario: Lector de pantalla
- **WHEN** un lector de pantalla recorre la tabla por pista
- **THEN** anuncia cada celda con el nombre del competidor, el nombre completo de la pista, el resultado y la marca

#### Scenario: Fin de la carrera anunciado
- **WHEN** termina una carrera
- **THEN** un lector de pantalla anuncia que terminó y quién ganó, o que no llegó nadie

#### Scenario: Pestaña en inglés
- **WHEN** la aplicación está en inglés
- **THEN** la guía, los controles, el marcador, la tabla, las marcas y las misiones se muestran en inglés
