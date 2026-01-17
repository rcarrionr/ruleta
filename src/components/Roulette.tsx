import { useRoulette } from '@/hooks/useRoulette';
import { Prize } from '@/types';

interface RouletteProps {
  prizes: Prize[];
  onFinish: (winner: Prize) => void;
  onRef: (spin: () => void, isSpinning: boolean) => void;
}

export function Roulette({ prizes, onFinish, onRef }: RouletteProps) {
  const { canvasRef, spin, isSpinning } = useRoulette({ prizes, onFinish });

  // Pass control back to parent
  if (onRef) {
    onRef(spin, isSpinning);
  }

  return (
    <div className="relative flex justify-center items-center drop-shadow-2xl">
      {/* Pointer overlay (optional visual enhancement) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 
        border-l-[15px] border-l-transparent
        border-r-[15px] border-r-transparent
        border-t-[30px] border-t-white
        z-10 drop-shadow-md hidden">
      </div>
      
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="max-w-full h-auto rounded-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-gray-800"
      />
    </div>
  );
}
