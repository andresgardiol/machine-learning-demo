# Inspeccionar: manejar vos y ver qué haría la red

## Por qué

En Inspeccionar la red maneja y uno mira. Para ver cómo reacciona en una
situación concreta (pegado a un auto, abierto en una curva, frenado en el
medio) hay que esperar a que pase, o pausar y mover entradas a mano de a una.

Pedido del dueño: tomar el control del auto con las flechas y ver, en cada
momento, qué decidiría la red, aunque no sea ella la que maneja. Es un
experimento: uno arma la situación y la red dice qué haría.

**Concepto que hace visible**: la red es una función de lo que ve el auto;
dada una situación, siempre contesta lo mismo, la arme quien la arme. Y
comparar su decisión con la propia es la base de aprender imitando, lo que
hace el Laboratorio con tu manejo.

## Qué cambia

- **"Manejar vos"** en la escena: con eso, o con apretar una flecha con el
  foco en la escena, el auto pasa a moverse con las flechas (y W, A, S, D si
  los atajos están encendidos).
- **La red sigue calculando** cada cuadro con lo que ve el auto, y el
  diagrama, la tarjeta y la cuenta paso a paso la muestran como siempre; solo
  que su decisión no mueve el auto.
- **La decisión muestra dos filas**: "Vos" y "La red", con las acciones
  en que coinciden marcadas, y una línea de cuánto coincidieron en los
  últimos 10 segundos.
- **"Devolver el volante"**: la red sigue manejando desde donde quedó el auto,
  sin volver a la salida; se ve cómo sale de la situación armada.
- Al tomar el volante, la reproducción pasa a correr en tiempo real de a
  cuadros. En pausa el auto se queda quieto, y todo lo de pausa (paso a paso,
  entradas a mano, cambios) funciona igual que antes.

## Filtro de entrada

1. *Concepto*: la red decide solo con lo que ve; comparar su decisión con la
   tuya es imitar.
2. *¿Se entiende solo?* El botón dice qué hace; al apretarlo, la decisión
   pasa a "Vos" y "La red", lado a lado.
3. *¿El mentor puede ignorarlo?* Sí: si nadie lo toca, la pestaña es igual
   que hoy.
4. *¿Si se usa mal?* "Devolver el volante" (o cambiar de pestaña) le da el
   control a la red. Si choca, el intento vuelve a empezar como siempre.

**Público**: los dos. El principiante prueba situaciones; el mentor arma una
situación y le pregunta a la clase qué va a hacer la red antes de mirar.

## Fuera de alcance

- Flechas sobre el auto en la escena con la intención de la red.
- Grabar lo que se maneja acá como ejemplos para el Laboratorio (eso ya lo
  hace el Laboratorio con tu manejo).
- Una misión nueva.
- Manejar vos en otras pestañas.

## Capacidades

### Nuevas

Ninguna.

### Modificadas

- `pestana-inspeccionar`: requisitos nuevos "Manejar vos", "Tu decisión y la
  de la red" y "Devolver el volante".
- `controladores`: requisito nuevo "Controlador con observador": maneja uno y
  otro calcula su decisión con la misma percepción, sin mover el auto.

## Impacto

- Código: `src/core/controller.js` (controlador con observador, puro, con
  pruebas), `src/tabs/inspect/{index,describe,shortcuts}.js`,
  `src/tabs/shared/driving-cards.js` (decisión en dos filas),
  `src/input/keyboard.js` (solo si hace falta saber dónde está el foco),
  `src/i18n/{es,en}.js`, `styles/app.css`.
- No cambia la simulación ni la red. La escena con la red manejando sigue
  siendo determinista; con la persona manejando, no.
- Usa las teclas de la decisión; conviene implementarlo después de
  `sin-destellos-en-la-red`, que también las toca.
