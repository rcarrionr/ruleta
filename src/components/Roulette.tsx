import { useRoulette } from '@/hooks/useRoulette';
import { Prize } from '@/types';

interface RouletteProps {
  prizes: Prize[];
  onFinish: (winner: Prize) => void;
  onRef: (spin: () => void, isSpinning: boolean) => void;
  isFocusMode?: boolean;
}

export function Roulette({ prizes, onFinish, onRef, isFocusMode }: RouletteProps) {
  const { canvasRef, spin, isSpinning } = useRoulette({ prizes, onFinish });

  // Pass control back to parent
  if (onRef) {
    onRef(spin, isSpinning);
  }

  return (
    <div className={`relative flex justify-center items-center transition-all duration-500 ${isFocusMode ? 'w-full h-full' : 'drop-shadow-2xl'}`}>
      <canvas
        ref={canvasRef}
        width={800}
        height={800}
        className={`transition-all duration-500 rounded-full ${
          isFocusMode 
            ? 'h-[80vh] w-auto max-w-[95vw] shadow-[0_0_80px_rgba(0,0,0,0.6)]' 
            : 'max-w-full h-auto shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-gray-800'
        }`}
      />
    </div>
  );
}
