// Valores iniciales de design.md (D4). Unidades: metros y segundos.
// Las pruebas verifican relaciones entre estos valores, no los números, para poder calibrar.

export const STEP = 1 / 60; // duración de un paso de simulación (s)

export const CAR_LENGTH = 4;
export const CAR_WIDTH = 2;
export const LANE_WIDTH = 4;

export const MAX_SPEED = 20; // velocidad máxima de avance por defecto (design.md D19); se puede configurar (SPEED_LIMITS)
export const REVERSE_FRACTION = 0.5; // la marcha atrás llega a la mitad de la máxima de avance
export const MAX_REVERSE_SPEED = MAX_SPEED * REVERSE_FRACTION;
// Velocidad máxima configurable: siempre por encima de la del carril más rápido, para que se pueda superar.
export const SPEED_LIMITS = Object.freeze({ min: 12, max: 40 });
export const ACCELERATION = 40;
export const FRICTION = 14;
export const TURN_RATE = 1.8; // rad/s

export const STREET_LENGTH = 100000; // 100 km hacia adelante (y otros tantos hacia atrás)

export const DEFAULT_LANES = 3;
export const ALLOWED_LANES = [2, 3, 4];

// Tráfico (trafico-vivo, design.md D1 a D5): una corriente por carril, cada carril a su velocidad.
// Velocidades de los carriles, repartidas parejas entre estos extremos (m/s). Las dos quedan por
// debajo de SPEED_LIMITS.min, y su diferencia fija la cota de los muros (D2).
export const TRAFFIC_SPEEDS = Object.freeze({ min: 6, max: 10 });
export const MIN_LANE_GAP_CAR_LENGTHS = 4; // hueco mínimo dentro de un carril, de paragolpes a paragolpes, en largos de auto
export const TRAFFIC_FIRST_VEHICLE = 35; // distancia (m) desde la que empieza cada carril: visible al abrir con la calle vertical
export const TRAFFIC_LANE_PHASE = 60; // cada carril empieza hasta esta distancia más adelante (m), al azar: sin filas al abrir
// Separación entre grupos de hoy (centro a centro) con que se calcula la casilla media de un carril (D4).
export const TRAFFIC_MIN_SPACING = 24; // a densidad máxima (m)
export const TRAFFIC_SPACING_RANGE = 56; // se suma a la anterior cuando la densidad tiende a 0 (m)
export const TRAFFIC_BLOCK_VEHICLES = 16; // vehículos por bloque de un carril: los huecos se sortean bloque a bloque
// Zigzag dentro del carril (D5).
export const ZIGZAG_PERIOD = Object.freeze({ min: 6, max: 10 }); // período del vaivén (s), sorteado por vehículo
export const ZIGZAG_MAX_TURN = (6 * Math.PI) / 180; // giro máximo del vehículo al zigzaguear (rad)
export const ZIGZAG_MARGIN = 0.1; // distancia mínima entre el contorno girado y el borde del carril (m)
// Tipos de vehículo (D3): largo y ancho en metros y proporción en el tráfico. Ninguno más largo que
// 10 m (cota de los muros, D2) ni más ancho que un carril.
export const VEHICLE_TYPES = Object.freeze([
  Object.freeze({ type: 'motorcycle', length: 2.2, width: 0.9, share: 0.15 }),
  Object.freeze({ type: 'car', length: 4, width: 2, share: 0.5 }),
  Object.freeze({ type: 'van', length: 5.2, width: 2.2, share: 0.2 }),
  Object.freeze({ type: 'truck', length: 10, width: 2.5, share: 0.15 }),
]);
// Al cambiar el tráfico en marcha, lo que está a menos de esta distancia por delante del auto no cambia (m).
export const TRAFFIC_CHANGE_AHEAD = 20;
