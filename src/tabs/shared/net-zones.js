// Anchos de Inspeccionar y del Laboratorio (red-al-centro D2): la zona izquierda es lo que la red mira (la
// escena del auto, o el plano y la tabla de los datos) y mide 400 px; la red va al centro con todo lo demás; el
// panel, 360. En una ventana angosta la zona izquierda cede primero hasta 280 mientras la red conserva 600;
// después la red, hasta 440; y al final la zona izquierda, hasta 200. Las dos pestañas usan la misma
// preferencia, así la red mide lo mismo en las dos. Los límites los aplica ui/layout.js (netInCenter).
export const NET_ZONES = Object.freeze({
  stageDefault: 400,
  stageKeep: 280,
  stageMin: 200,
  boardMin: 600,
  boardFloor: 440,
  preference: 'netLeftWidth',
});
