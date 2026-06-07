import { Prize } from '@/types';

/**
 * Calcula qué premio está apuntando el pointer basado en el ángulo actual
 * @param startAngleDeg Ángulo actual de la ruleta en grados
 * @param prizes Array de premios
 * @param pointerDeg Ángulo del pointer (270 = arriba)
 * @returns El índice del premio que apunta el pointer
 */
export function getWinnerIndexAtPointer(
  startAngleDeg: number,
  prizes: Prize[],
  pointerDeg: number = 270
): number {
  const arcDeg = 360 / prizes.length;

  // Calcular qué posición angular apunta el pointer
  const normalizedPointer = pointerDeg % 360;

  // Calcular qué posición angular tiene el inicio actual
  const normalizedStart = startAngleDeg % 360;

  // Diferencia angular desde el inicio hasta el pointer
  let delta = (normalizedPointer - normalizedStart) % 360;
  if (delta < 0) delta += 360;

  // Convertir a índice de premio
  const winnerIndex = Math.floor(delta / arcDeg) % prizes.length;

  return winnerIndex;
}

/**
 * Valida que el ganador mostrado coincida con el color del segmento
 */
export function validateWinnerColor(
  startAngleDeg: number,
  prizes: Prize[],
  expectedWinner: Prize
): boolean {
  const correctIndex = getWinnerIndexAtPointer(startAngleDeg, prizes);
  const correctWinner = prizes[correctIndex];

  return correctWinner.id === expectedWinner.id &&
         correctWinner.color === expectedWinner.color;
}

/**
 * Calcula una posición objetivo segura dentro de un segmento (entre el 20% y el 80%)
 * @param winnerIndex Índice del premio ganador
 * @param totalPrizes Cantidad total de premios
 * @returns El ángulo objetivo en grados relativo al inicio
 */
export function getSegmentTargetPosition(winnerIndex: number, totalPrizes: number): number {
  const arcDeg = 360 / totalPrizes;
  // Safe zone between 20% and 80% of the segment
  const safeZoneMin = arcDeg * 0.2;
  const safeZoneMax = arcDeg * 0.8;
  const randomOffset = safeZoneMin + Math.random() * (safeZoneMax - safeZoneMin);

  // Return the starting angle of the segment plus the random offset
  return winnerIndex * arcDeg + randomOffset;
}
