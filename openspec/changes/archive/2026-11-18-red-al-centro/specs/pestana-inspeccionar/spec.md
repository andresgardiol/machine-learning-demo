## MODIFIED Requirements

### Requirement: La red en el centro
La pestaña SHALL mostrar la escena del auto en la zona izquierda, con la decisión de la red debajo; la red en la zona central, que es la más ancha; y en el panel, lo que se sabe y se puede cambiar de la neurona elegida. Las zonas conservan los divisores para cambiarles el ancho. En una ventana angosta la zona izquierda MUST ceder ancho primero, y la red después, antes de que el panel deje de leerse.

#### Scenario: Pantalla de 1440×900
- **WHEN** se abre la pestaña con la ventana en 1440×900
- **THEN** la escena ocupa el alto de la zona izquierda con la decisión debajo, la red ocupa la zona central, y el panel muestra el cerebro, la neurona elegida y las misiones, sin desplazar ninguna zona

#### Scenario: Anchos por defecto
- **WHEN** se abre la pestaña por primera vez con la ventana en 1440 píxeles de ancho
- **THEN** la zona izquierda mide 400 píxeles, el panel 360 y la red ocupa todo lo demás

#### Scenario: Agrandar la red
- **WHEN** la persona mueve un divisor para agrandar la zona de la red
- **THEN** la red crece y la escena conserva su encuadre

#### Scenario: La red no se achica de más
- **WHEN** la persona mueve un divisor para achicar la zona de la red
- **THEN** la red no baja de 600 píxeles de ancho mientras la ventana deje 280 para la zona izquierda

#### Scenario: Anchos propios
- **WHEN** la persona cambia el ancho de la red en Inspeccionar y pasa a otra pestaña
- **THEN** la otra pestaña conserva sus anchos, e Inspeccionar recuerda el suyo al volver

#### Scenario: Orden del foco
- **WHEN** la persona recorre la pestaña con Tab
- **THEN** el foco pasa por la escena y la decisión, después por la red y sus controles y al final por el panel

#### Scenario: Ventana angosta
- **WHEN** la ventana mide entre 1032 y 1240 píxeles de ancho
- **THEN** la zona izquierda mide al menos 280 píxeles, la red cede ancho sin bajar de 440, y los nombres de las cuatro decisiones se leen enteros

#### Scenario: Ventana en su mínimo
- **WHEN** la ventana mide entre 960 y 1032 píxeles de ancho
- **THEN** la red mide 440 píxeles, la zona izquierda se queda con lo que sobra, no menos de 200, y los nombres de las cuatro decisiones se leen enteros

#### Scenario: Barra de arriba en ventana angosta
- **WHEN** la zona de la red mide entre 500 y 600 píxeles de ancho, en español o en inglés
- **THEN** sus controles de arriba ocupan dos renglones o menos; con 440 píxeles, tres o menos

### Requirement: Escena del auto en segundo plano
La escena SHALL mostrar al auto con sus sensores, siguiéndolo, con los controles de cámara de El problema: seguir al auto, acercar y alejar con botones y con la rueda. Por defecto, el encuadre deja ver enteros los rayos y lo que tocan. Si el auto choca, la pestaña SHALL mostrar el caso del choque (ver *Caso del choque en Inspeccionar*) y no volver a empezar sola. La pista, el tráfico y la velocidad se cambian en la barra de escenario, que no muestra los sensores: los trae el cerebro.

#### Scenario: Encuadre
- **WHEN** el auto maneja y la persona no tocó la cámara
- **THEN** la escena lo sigue y se ven enteros sus rayos y lo que tocan

#### Scenario: Acercar
- **WHEN** la persona usa la rueda sobre la escena o el botón de acercar
- **THEN** la escena se acerca al auto, sin mover la página ni la red

#### Scenario: Volver al encuadre
- **WHEN** la persona acercó la escena y elige seguir al auto
- **THEN** la escena vuelve al encuadre por defecto

#### Scenario: Choque
- **WHEN** el auto choca
- **THEN** la reproducción se congela en el cuadro del choque y aparece el caso; el intento no vuelve a empezar hasta que la persona reinicia o reintenta

#### Scenario: Cambiar de pista
- **WHEN** la persona elige otra pista en la barra
- **THEN** el intento vuelve a empezar en esa pista, con la misma red y los mismos cambios de prueba

#### Scenario: Restablecer el escenario
- **WHEN** la persona restablece el escenario
- **THEN** la barra vuelve a la pista y el tráfico donde entrenó el cerebro

### Requirement: Vista de la red a la vista
Sobre la red SHALL haber, siempre a la vista, el nombre del cerebro y un renglón de controles en tres grupos rotulados: **Vista** (diagrama o tabla de pesos, y el flujo), **Conexiones** (el filtro y resumir o abrir todas las capas) y **Acercar** (alejar, acercar y ver entera). Cada capa se resume desde su encabezado, en la red misma. Los cambios de prueba van en una franja aparte (ver *Deshacer y restablecer la red*). Ninguna función de la pestaña MUST quedar en una sección plegable del panel.

#### Scenario: Cambiar de vista
- **WHEN** la persona elige la tabla de pesos
- **THEN** la zona de la red pasa a mostrar la tabla, y la reproducción, la tarjeta y la escena siguen igual

#### Scenario: Controles sobre lo que cambian
- **WHEN** la persona busca cómo resumir una capa o cambiar de vista
- **THEN** encuentra lo primero arriba de esa capa y lo segundo sobre la red, no en el panel

#### Scenario: Controles que no crecen con la red
- **WHEN** se pasa de una red sin capas ocultas a una con tres
- **THEN** los controles de arriba de la red son los mismos y ocupan lo mismo

#### Scenario: Un renglón al abrir
- **WHEN** se abre la pestaña con la ventana en 1440×900, en español o en inglés
- **THEN** los tres grupos ocupan un solo renglón, cada uno con su rótulo, y ningún control de arriba de la red está sin acción

### Requirement: Deshacer y restablecer la red
Con cambios de prueba, sobre la red SHALL aparecer una franja con cuántos cambios hay, un botón para deshacer el último y otro para restablecer la red entera, y "Ver original". Valen para todo cambio: pesos, sesgos y partes apagadas. Sin cambios, la franja MUST NOT verse. Su aparición MUST NOT correr la red de golpe mientras la persona arrastra una perilla. Los cambios MUST NOT modificar el cerebro guardado, y SHALL conservarse por cerebro hasta cerrar la aplicación.

#### Scenario: Sin cambios
- **WHEN** la red no tiene cambios
- **THEN** no se ven "Deshacer", "Restablecer la red" ni "Ver original", ni un contador de cambios

#### Scenario: Red modificada
- **WHEN** la persona apaga una neurona y cambia dos pesos
- **THEN** aparece la franja, que dice que la red tiene 3 cambios de prueba, con los botones habilitados

#### Scenario: Deshacer
- **WHEN** la persona deshace
- **THEN** el último cambio vuelve atrás, sea un peso, un sesgo o algo apagado, la red y el auto lo reflejan en el momento y el contador baja

#### Scenario: Deshacer varias veces
- **WHEN** la persona hizo cuatro cambios y deshace cuatro veces
- **THEN** la red queda igual a la del cerebro y la franja se va

#### Scenario: Restablecer
- **WHEN** la persona restablece la red
- **THEN** todos los pesos, sesgos y partes apagadas vuelven a los del cerebro, sin pedir confirmación, y la franja se va

#### Scenario: El cerebro guardado no cambia
- **WHEN** la persona cambia pesos de un cerebro guardado y lo abre en Entrenar o en Competir
- **THEN** el cerebro es el de antes

#### Scenario: Cambios por cerebro
- **WHEN** la persona cambia un peso, pasa a otro cerebro y vuelve al primero
- **THEN** el primero conserva su cambio y su franja

#### Scenario: Con el teclado
- **WHEN** la persona cambia un peso con las flechas en una pastilla
- **THEN** la franja aparece y el foco sigue en la pastilla

### Requirement: Comparar con el original
Con cambios a mano, la franja de cambios SHALL ofrecer un botón que, mientras se mantiene apretado, muestra la red y la decisión sin esos cambios, y al soltarlo vuelve a mostrarlos. MUST NOT deshacer nada. Sin cambios no se ve. SHALL tener tooltip y textos en español y en inglés.

#### Scenario: Mantener apretado
- **WHEN** la persona cambió dos pesos y mantiene apretado "Ver original"
- **THEN** la red, la decisión y el detalle muestran los valores del cerebro, y un rótulo dice que se está viendo el original

#### Scenario: Soltar
- **WHEN** la persona suelta el botón
- **THEN** todo vuelve a mostrar la red con sus cambios, que siguen ahí

#### Scenario: Con el teclado
- **WHEN** el botón tiene el foco y la persona mantiene apretada la barra espaciadora
- **THEN** se ve el original hasta que la suelta

#### Scenario: Sin cambios
- **WHEN** la red no tiene cambios
- **THEN** el botón no se ve

### Requirement: Guía, leyenda y misiones
Con la guía activa, el panel SHALL ofrecer, plegado debajo de la tarjeta de consigna, un texto breve que diga qué se está viendo, y SHALL mostrar a la vista una línea de guía arriba del detalle, una leyenda de cómo se lee la red y tres misiones con su progreso, en tres renglones: seguir la cuenta de una neurona paso a paso, cambiar una decisión moviendo una entrada a mano, y apagar una neurona y ver qué cambia. La línea de guía MUST NOT desaparecer al elegir algo: cambia según lo que se mira (nada elegido, una neurona, una conexión, un choque o la persona manejando). Las misiones MUST NOT bloquear nada. Se despliega con "Más sobre esta pestaña".

#### Scenario: Texto plegado
- **WHEN** la guía está activa y la persona entra a la pestaña
- **THEN** el texto de inicio está plegado debajo de la tarjeta de consigna y aparece al tocar "Más sobre esta pestaña"

#### Scenario: Guía visible
- **WHEN** la guía está activa y la persona despliega "Más sobre esta pestaña"
- **THEN** el texto dice que eso es la red del cerebro que maneja, que cada círculo es una neurona y cada línea un peso, y qué probar primero

#### Scenario: Guía oculta
- **WHEN** la persona apaga la guía
- **THEN** el texto, la línea de guía, la leyenda y las misiones no se muestran

#### Scenario: Misión de la cuenta
- **WHEN** la persona avanza paso a paso las cuatro operaciones de una misma neurona
- **THEN** la primera misión queda cumplida

#### Scenario: Misión de la entrada
- **WHEN** la persona cambia una entrada a mano y la decisión de la red cambia
- **THEN** la segunda misión queda cumplida

#### Scenario: Misión de apagar
- **WHEN** la persona apaga una neurona y reproduce al menos tres segundos
- **THEN** la tercera misión queda cumplida

#### Scenario: Misiones compactas
- **WHEN** el panel mide 360 píxeles de ancho, en español o en inglés
- **THEN** las tres misiones ocupan tres renglones, con su estado en el mismo renglón, sin un recuadro que se estire

#### Scenario: Términos con su nombre
- **WHEN** la persona posa el cursor sobre "sesgo", "activación" o "tabla de pesos"
- **THEN** un tooltip dice qué es con palabras llanas y con su nombre técnico

#### Scenario: Con algo elegido
- **WHEN** hay una neurona elegida
- **THEN** la línea de guía dice qué mirar en una neurona, el detalle se ve debajo, las misiones siguen a la vista y "Soltar" está junto al nombre de la neurona

#### Scenario: Soltar vuelve a los atajos
- **WHEN** la persona elige "Soltar"
- **THEN** no queda nada elegido, la línea de guía vuelve a la de inicio y se ven los atajos de *Panel sin nada elegido*

#### Scenario: Leyenda corta
- **WHEN** la guía está activa
- **THEN** la leyenda ocupa cinco renglones o menos: el signo, el grosor, el brillo y el relleno, el sesgo, y un renglón con las marcas de elegida, en curso, apagada y cambiada

### Requirement: Avance paso a paso
Con la reproducción en pausa, "Paso" SHALL avanzar la cuenta una vez, del tamaño elegido, con su animación en la red. Una operación es una sola cuenta: leer una entrada, multiplicar un valor por su peso, sumar un aporte, sumar el sesgo o aplicar la activación. La cuenta de un cuadro empieza por las entradas. Al completarse, el paso siguiente SHALL mover el auto con esa decisión y empezar la cuenta del cuadro nuevo. "Atrás" SHALL deshacer el último paso dentro del cuadro y, al principio de un cuadro, volver al cuadro anterior, con el auto donde estaba, hasta 3 segundos atrás.

#### Scenario: Una operación
- **WHEN** la persona avanza de a una operación
- **THEN** se hace una sola cuenta con dos números como mucho y un resultado, y la red, la franja y la tarjeta la muestran

#### Scenario: Una neurona
- **WHEN** la persona avanza de a una neurona
- **THEN** se completa la neurona en curso y la siguiente pasa a ser la que se calcula; en la capa de entradas, cada paso lee una entrada

#### Scenario: Una capa
- **WHEN** la persona avanza de a una capa
- **THEN** se completan todas las neuronas de la capa en curso; el primer paso de un cuadro lee todas las entradas

#### Scenario: Un cuadro
- **WHEN** la persona avanza de a un cuadro
- **THEN** el auto se mueve un cuadro y la red muestra la cuenta completa del cuadro nuevo

#### Scenario: Fin de la cuenta
- **WHEN** la última salida está calculada y la persona avanza otro paso
- **THEN** el auto se mueve con esa decisión y empieza la cuenta del cuadro siguiente

#### Scenario: La tarjeta sigue a la cuenta
- **WHEN** la persona avanza de a neuronas o de a operaciones
- **THEN** la tarjeta muestra la neurona que se está calculando

#### Scenario: Cambiar el tamaño a mitad de la cuenta
- **WHEN** la persona pasa de operaciones a capas con una neurona a medio hacer
- **THEN** el paso siguiente completa la capa en curso, sin perder lo ya hecho

#### Scenario: Orden dentro de una neurona
- **WHEN** la persona avanza de a una operación por una neurona con seis entradas
- **THEN** da catorce pasos en este orden: por cada entrada, multiplicar y después sumar; al final, el sesgo y la activación

#### Scenario: Leer una entrada
- **WHEN** empieza la cuenta de un cuadro y la persona avanza de a una operación
- **THEN** el primer paso lee la primera entrada, que muestra su valor; las demás entradas se ven sin leer

#### Scenario: El sesgo, una vez por neurona
- **WHEN** la persona sigue la cuenta de una neurona
- **THEN** el sesgo se suma una sola vez, después del último aporte; las entradas no tienen sesgo ni peso propio

#### Scenario: Atrás
- **WHEN** la persona dio tres pasos de a una operación y presiona "Atrás"
- **THEN** la cuenta vuelve a como estaba después del segundo paso, y la red, la franja y la tarjeta lo muestran

#### Scenario: Atrás con otro tamaño
- **WHEN** la persona va por la mitad de una neurona y presiona "Atrás" de a neuronas
- **THEN** la cuenta vuelve al principio de esa neurona

#### Scenario: Atrás al cuadro anterior
- **WHEN** la cuenta del cuadro todavía no empezó y la persona presiona "Atrás"
- **THEN** el auto vuelve a donde estaba en el cuadro anterior y la red muestra la cuenta completa de ese cuadro

#### Scenario: Atrás al principio del cuadro
- **WHEN** el intento acaba de empezar, la cuenta del primer cuadro todavía no empezó y la persona presiona "Atrás"
- **THEN** no pasa nada y la explicación de "Atrás" dice que no hay cuadros anteriores guardados

#### Scenario: Seguir desde un cuadro anterior
- **WHEN** la persona volvió 30 cuadros con "Atrás" y reproduce
- **THEN** el auto sigue desde ahí y hace lo mismo que la primera vez, con la misma red y la misma semilla

### Requirement: Manejar vos
La escena SHALL ofrecer "Manejar vos", un botón con tooltip en español y en inglés, en el renglón de los controles de cámara, con la altura normal. Al activarlo, o al apretar una flecha con el foco en la escena o en ningún control, el auto pasa a manejarse con el teclado como en El problema, y la reproducción pasa a correr en tiempo real de a cuadros. La red sigue calculando cada cuadro y se ve igual que cuando maneja.

#### Scenario: Estado por defecto
- **WHEN** se abre la pestaña
- **THEN** maneja la red, "Manejar vos" está a la vista sin activar y la escena es la de siempre, igual para dos personas con la misma semilla

#### Scenario: Tomar el volante con el botón
- **WHEN** la persona activa "Manejar vos"
- **THEN** el botón se ve activo, el foco queda en la escena, un aviso en la escena dice que maneja la persona y que la red solo mira, y el auto responde a las flechas

#### Scenario: Tomar el volante con una flecha
- **WHEN** la red maneja, el foco está en la escena y la persona aprieta la flecha arriba
- **THEN** el auto pasa a manejarse con el teclado desde ese cuadro, sin volver a empezar el intento

#### Scenario: Flechas dentro de la red
- **WHEN** el foco está en el diagrama, en una pastilla o en un deslizador y la persona usa las flechas
- **THEN** las flechas hacen lo de siempre en ese control y no toman el volante

#### Scenario: La red se sigue viendo
- **WHEN** la persona maneja
- **THEN** el diagrama, la tabla de pesos y la tarjeta de la neurona elegida muestran la cuenta de la red con lo que ve el auto en cada cuadro

#### Scenario: Pausa
- **WHEN** la persona pausa mientras maneja
- **THEN** el auto se detiene, las flechas no lo mueven, y el paso a paso, las entradas a mano y los cambios de la red funcionan como siempre

#### Scenario: Un cuadro con N
- **WHEN** en pausa la persona mantiene la flecha izquierda y aprieta N de a cuadros
- **THEN** el auto avanza un cuadro doblando a la izquierda y la red muestra su cuenta de ese cuadro

#### Scenario: Choque
- **WHEN** la persona choca mientras maneja
- **THEN** la escena se congela con el caso del choque, como cuando maneja la red, y al reiniciar o reintentar sigue manejando la persona

#### Scenario: Atajos apagados
- **WHEN** los atajos de una tecla están apagados
- **THEN** las flechas manejan y toman el volante, y W, A, S y D no hacen nada

#### Scenario: Guía
- **WHEN** la guía está activa
- **THEN** el texto de la guía dice que se puede tomar el volante con las flechas para ver qué haría la red en cada situación

## ADDED Requirements

### Requirement: Caso del choque en Inspeccionar
Al chocar, la pestaña SHALL congelar la reproducción y mostrar, debajo de la decisión, una tarjeta del caso con: a los cuántos metros y contra qué chocó, qué decidió la red en el cuadro que se mira, y qué neurona aportó más a esa decisión, con un botón "Elegir esta neurona". La decisión es la acción encendida de mayor valor; la neurona que más aportó es la de la última capa oculta con el mayor aporte positivo (valor por peso) a esa salida, o la entrada, si la red no tiene capas ocultas. La tarjeta SHALL ofrecer "Reintentar desde acá" y "Reiniciar (R)". Reiniciar o reintentar SHALL cerrar el caso.

#### Scenario: Estado por defecto
- **WHEN** el cerebro de ejemplo choca con los valores por defecto
- **THEN** la reproducción queda en pausa, la escena muestra el auto chocado y la tarjeta dice a los cuántos metros, contra qué, qué decidió la red y qué neurona aportó más, con su aporte en números

#### Scenario: Elegir la neurona que decidió
- **WHEN** la persona elige "Elegir esta neurona"
- **THEN** esa neurona queda elegida en la red, el panel muestra su tarjeta con la cuenta de ese cuadro y la línea de guía habla del choque

#### Scenario: Sin capas ocultas
- **WHEN** choca un cerebro sin capas ocultas
- **THEN** la tarjeta nombra la entrada que más aportó a la decisión y el botón la elige

#### Scenario: Ninguna acción encendida
- **WHEN** en el cuadro que se mira la red no tenía ninguna acción encendida
- **THEN** la tarjeta dice que la red no accionaba nada y no nombra una neurona

#### Scenario: Reiniciar
- **WHEN** la persona reinicia con R o con el botón
- **THEN** la tarjeta y el deslizador desaparecen, el intento vuelve a la salida con el mismo tráfico y la reproducción sigue como estaba antes del choque

#### Scenario: Sin depender del color
- **WHEN** se ve el caso en escala de grises
- **THEN** la neurona que más aportó se distingue en la red por su marca, no solo por el color

#### Scenario: Textos y tooltips
- **WHEN** la persona posa el cursor sobre "Elegir esta neurona", "Reintentar desde acá" o "Reiniciar"
- **THEN** cada uno tiene un tooltip en español y en inglés que dice qué hace y por qué importa

### Requirement: Repetición del choque en Inspeccionar
Con un choque a la vista, un deslizador sobre la escena SHALL permitir volver a ver los últimos 3 segundos antes del choque, cuadro por cuadro. La escena, la red, la decisión, la tarjeta del caso y la tarjeta de la neurona elegida siguen al deslizador. Lo que se muestra MUST ser lo que se calculó mientras el auto andaba, con la red de ese momento, aunque la persona la haya cambiado después; en ese caso la tarjeta lo dice. El deslizador SHALL empezar 1 segundo antes del choque, tener tooltip y manejarse con el teclado.

#### Scenario: Al chocar
- **WHEN** el auto choca después de 5 segundos de intento
- **THEN** el deslizador cubre los últimos 3 segundos y está 1 segundo antes del choque, con la escena, la red y la decisión de ese cuadro

#### Scenario: Volver atrás en el tiempo
- **WHEN** la persona lleva el deslizador a 2 segundos antes del choque
- **THEN** la escena muestra el auto donde estaba en ese instante, la red muestra la cuenta de ese cuadro y la tarjeta, la decisión y la neurona que más aportó en ese cuadro

#### Scenario: Con el teclado
- **WHEN** la persona llega al deslizador con Tab y presiona la flecha izquierda
- **THEN** la repetición retrocede un cuadro y el auto no gira

#### Scenario: Intento corto
- **WHEN** el auto choca antes de cumplir 3 segundos
- **THEN** el deslizador cubre solo el tiempo que duró el intento

#### Scenario: Red cambiada después del choque
- **WHEN** con el caso a la vista la persona apaga una neurona y mueve el deslizador
- **THEN** la repetición muestra la cuenta con la red de antes del cambio, y la tarjeta dice que el cambio rige al reintentar

#### Scenario: Determinismo
- **WHEN** la persona reinicia y el auto vuelve a chocar igual
- **THEN** la repetición muestra los mismos cuadros que la vez anterior

### Requirement: Reintentar desde un cuadro
Con un choque a la vista, "Reintentar desde acá" SHALL volver el mundo al cuadro que muestra el deslizador (el auto, el tiempo, el tráfico y el progreso) y seguir reproduciendo desde ahí con la red de ahora, con sus cambios de prueba. Es la acción principal mientras se ve el caso. MUST NOT cambiar el cerebro guardado. Desde un mismo cuadro, con la misma red, SHALL dar siempre el mismo resultado.

#### Scenario: Reintentar con un cambio
- **WHEN** con el caso a la vista la persona apaga la neurona que más aportó y elige "Reintentar desde acá" 1 segundo antes del choque
- **THEN** el auto sigue desde donde estaba en ese cuadro, con la red sin esa neurona, y la escena muestra si esta vez choca o no

#### Scenario: Reintentar sin cambios
- **WHEN** la persona reintenta desde un cuadro sin cambiar la red
- **THEN** el auto vuelve a chocar en el mismo lugar y en el mismo cuadro

#### Scenario: Acción principal
- **WHEN** se ve el caso del choque
- **THEN** "Reintentar desde acá" es la única acción principal, y "Reiniciar" y "Elegir esta neurona" se ven como secundarias

#### Scenario: Volver atrás
- **WHEN** el auto reintentado vuelve a chocar
- **THEN** aparece el caso nuevo, con su repetición, y "Reiniciar" sigue volviendo a la salida

#### Scenario: Con la persona manejando
- **WHEN** la persona manejaba al chocar y reintenta desde un cuadro
- **THEN** sigue manejando la persona desde ese cuadro y la coincidencia con la red vuelve a cero
