// Volante suave del teclado (manejo-amable D1), sin DOM: mientras se mantiene una flecha de costado, el nivel de giro
// de ese lado sube de 0 a 1 en STEER_RAMP_STEPS cuadros de simulación, y el lado se devuelve en una parte de los
// cuadros igual al nivel, repartida con un acumulador. Con el nivel en 1, se devuelve en todos los cuadros, como antes.
// Al soltar, el nivel y el acumulador vuelven a 0 en el mismo cuadro. Los controles siguen siendo de sí o no: el
// núcleo y el contrato de controlador no cambian. El nivel solo avanza cuando se pide un cuadro (`step`), es decir,
// cuando la simulación consulta al controlador: en pausa no sube.

/** Cuadros de simulación que tarda el nivel en llegar a 1: 0,3 s a 60 cuadros por segundo. */
export const STEER_RAMP_STEPS = 18;

const EPS = 1e-9;

export function createSteering({ rampSteps = STEER_RAMP_STEPS } = {}) {
  const sides = { left: { held: 0, acc: 0 }, right: { held: 0, acc: 0 } };
  const levelOf = (s) => Math.min(1, s.held / rampSteps);
  function stepSide(s, on) {
    if (!on) { s.held = 0; s.acc = 0; return false; }
    s.held = Math.min(rampSteps, s.held + 1);
    s.acc += levelOf(s);
    if (s.acc >= 1 - EPS) { s.acc = Math.max(0, s.acc - 1); return true; }
    return false;
  }
  return {
    /**
     * Un cuadro: con lo que está apretado de cada lado, si ese cuadro dobla.
     * @param {{left: boolean, right: boolean}} held
     * @returns {{left: boolean, right: boolean}}
     */
    step({ left, right }) { return { left: stepSide(sides.left, Boolean(left)), right: stepSide(sides.right, Boolean(right)) }; },
    /** Suelta los dos lados (al perder el foco la ventana). */
    reset() { for (const s of Object.values(sides)) { s.held = 0; s.acc = 0; } },
    /** Nivel de cada lado, de 0 a 1, después del último cuadro. */
    get levels() { return { left: levelOf(sides.left), right: levelOf(sides.right) }; },
  };
}
