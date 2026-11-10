// Valores iniciales de design.md (D4). Unidades: metros y segundos.
// Las pruebas verifican relaciones entre estos valores, no los números, para poder calibrar.

export const STEP = 1 / 60; // duración de un paso de simulación (s)

export const CAR_LENGTH = 4;
export const CAR_WIDTH = 2;
export const LANE_WIDTH = 4;

export const MAX_SPEED = 15;
export const MAX_REVERSE_SPEED = 7.5;
export const ACCELERATION = 40;
export const FRICTION = 14;
export const TURN_RATE = 1.8; // rad/s

export const TRAFFIC_SPEED = 10;
export const STREET_LENGTH = 100000; // 100 km

export const DEFAULT_LANES = 3;
export const ALLOWED_LANES = [2, 3, 4];
