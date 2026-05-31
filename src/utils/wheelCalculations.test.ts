import { describe, it, expect } from 'vitest';
import { getWinnerIndexAtPointer, validateWinnerColor } from './wheelCalculations';
import { Prize } from '@/types';

describe('wheelCalculations', () => {
  const PALETTE = ['#FF0055', '#00DDFF', '#FFD700', '#9D00FF', '#FF8C00'];

  const createTestPrizes = (names: string[]): Prize[] =>
    names.map((name, i) => ({
      id: `test-${i}`,
      text: name,
      color: PALETTE[i % PALETTE.length],
    }));

  describe('getWinnerIndexAtPointer', () => {
    it('should return prize 0 when pointer points to the first segment', () => {
      const prizes = createTestPrizes(['Gana 1000', 'Pierde todo', 'Sigue participando', 'Roba los puntos', 'Duplica']);
      const arcDeg = 360 / 5; // 72°
      // To align prize 0 center (at startAngle + 36°) with pointer at 270°:
      // startAngle + 36 = 270 → startAngle = 234
      const startAngle = 234;

      const winnerIndex = getWinnerIndexAtPointer(startAngle, prizes);
      expect(winnerIndex).toBe(0);
    });

    it('should handle 5 prizes correctly with different rotations', () => {
      const prizes = createTestPrizes(['Gana 1000', 'Pierde todo', 'Sigue participando', 'Roba los puntos', 'Duplica']);
      const arcDeg = 360 / 5; // 72°

      // Test each prize
      for (let i = 0; i < 5; i++) {
        const startAngle = (270 - (i * arcDeg + arcDeg / 2) + 360) % 360;
        const winnerIndex = getWinnerIndexAtPointer(startAngle, prizes);
        expect(winnerIndex).toBe(i);
      }
    });

    it('should wrap around when angle exceeds 360', () => {
      const prizes = createTestPrizes(['A', 'B', 'C', 'D', 'E']);
      const startAngle = 450; // 450° = 90° (wraps around)

      const winnerIndex = getWinnerIndexAtPointer(startAngle, prizes);
      expect(winnerIndex).toBeGreaterThanOrEqual(0);
      expect(winnerIndex).toBeLessThan(prizes.length);
    });
  });

  describe('validateWinnerColor', () => {
    it('should validate that winner color matches the segment color', () => {
      const prizes = createTestPrizes(['Gana 1000', 'Pierde todo', 'Sigue participando', 'Roba los puntos', 'Duplica']);
      const startAngle = 0;

      // Get the correct winner
      const correctIndex = getWinnerIndexAtPointer(startAngle, prizes);
      const correctWinner = prizes[correctIndex];

      // Validate
      const isValid = validateWinnerColor(startAngle, prizes, correctWinner);
      expect(isValid).toBe(true);
    });

    it('should fail when winner color does not match segment', () => {
      const prizes = createTestPrizes(['Gana 1000', 'Pierde todo', 'Sigue participando', 'Roba los puntos', 'Duplica']);
      const startAngle = 0;

      // Get the correct winner
      const correctIndex = getWinnerIndexAtPointer(startAngle, prizes);
      const correctWinner = prizes[correctIndex];

      // Create a wrong winner (different index)
      const wrongIndex = (correctIndex + 1) % prizes.length;
      const wrongWinner = prizes[wrongIndex];

      // Validate - should fail
      const isValid = validateWinnerColor(startAngle, prizes, wrongWinner);
      expect(isValid).toBe(false);
    });
  });

  describe('10 spin validation', () => {
    it('should maintain color accuracy across 10 consecutive spins', () => {
      const prizes = createTestPrizes(['Gana 1000', 'Pierde todo', 'Sigue participando', 'Roba los puntos', 'Duplica']);
      const arcDeg = 360 / prizes.length;

      // Simulate 10 spins with random rotations
      for (let spin = 0; spin < 10; spin++) {
        // Random final angle
        const finalAngleDeg = Math.random() * 360;

        // Get the correct winner
        const correctIndex = getWinnerIndexAtPointer(finalAngleDeg, prizes);
        const correctWinner = prizes[correctIndex];

        // Validate that the colors match
        const isValid = validateWinnerColor(finalAngleDeg, prizes, correctWinner);
        expect(isValid).toBe(true);
      }
    });

    it('should correctly identify all prizes after 10 spins to each position', () => {
      const prizes = createTestPrizes(['Gana 1000', 'Pierde todo', 'Sigue participando', 'Roba los puntos', 'Duplica']);
      const arcDeg = 360 / prizes.length;

      // Spin 2 times to each position (10 spins total)
      for (let spinCount = 0; spinCount < 2; spinCount++) {
        for (let prizeIndex = 0; prizeIndex < prizes.length; prizeIndex++) {
          // Calculate angle to position this prize at the pointer
          const targetAngle = (270 - (prizeIndex * arcDeg + arcDeg / 2) + 360) % 360;

          // Get winner
          const winnerIndex = getWinnerIndexAtPointer(targetAngle, prizes);

          // Verify it's the correct prize
          expect(winnerIndex).toBe(prizeIndex);
          expect(prizes[winnerIndex].color).toBe(prizes[prizeIndex].color);
        }
      }
    });
  });
});
