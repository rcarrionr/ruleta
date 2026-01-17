import { useState, useRef } from 'react';
import { Roulette } from '@/components/Roulette';
import { Controls } from '@/components/Controls';
import { WinnerModal } from '@/components/WinnerModal';
import { Prize } from '@/types';

const PALETTE = ["#FF0055", "#00DDFF", "#FFD700", "#9D00FF", "#FF8C00", "#00FF7F"];

const INITIAL_DATA = [
  "10% OFF", "Nada", "2x1", "Sorpresa", 
  "50% OFF", "Intenta", "Envío Gratis", "VIP"
];

function generatePrizes(names: string[]): Prize[] {
  return names.map((name, i) => ({
    id: `${i}-${Date.now()}`,
    text: name.trim(),
    color: PALETTE[i % PALETTE.length]
  }));
}

function App() {
  const [prizes, setPrizes] = useState<Prize[]>(() => generatePrizes(INITIAL_DATA));
  const [winner, setWinner] = useState<Prize | null>(null);
  
  // Controls state
  const spinFnRef = useRef<() => void>(() => {});
  const [isSpinning, setIsSpinning] = useState(false);

  const handleUpdate = (names: string[]) => {
    setPrizes(generatePrizes(names));
  };

  const handleFinish = (winner: Prize) => {
    setWinner(winner);
    setIsSpinning(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center p-4 overflow-hidden font-sans text-white">
      
      <header className="mb-8 text-center">
        <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00DDFF] to-[#FF0055] drop-shadow-[0_0_10px_rgba(255,0,85,0.5)] uppercase tracking-wider">
          Ruleta
        </h1>
        <p className="text-white/60 text-sm mt-2">¡Prueba tu suerte!</p>
      </header>

      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 w-full max-w-6xl justify-center">
        
        <div className="flex-1 flex justify-center w-full">
          <Roulette 
            prizes={prizes} 
            onFinish={handleFinish}
            onRef={(spin, spinning) => {
              spinFnRef.current = spin;
              if (spinning !== isSpinning) setIsSpinning(spinning);
            }}
          />
        </div>

        <div className="flex-1 w-full max-w-md">
          <Controls 
            initialNames={INITIAL_DATA.join('\n')}
            onUpdate={handleUpdate}
            onSpin={() => spinFnRef.current()}
            isSpinning={isSpinning}
          />
        </div>

      </div>

      <WinnerModal 
        winner={winner} 
        onClose={() => setWinner(null)} 
      />

    </div>
  );
}

export default App;