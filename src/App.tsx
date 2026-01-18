import { useState, useRef } from 'react';
import { Maximize2, Minimize2, RefreshCcw, LayoutList } from 'lucide-react';
import { Roulette } from '@/components/Roulette';
import { ScrollWheel } from '@/components/ScrollWheel';
import { Controls } from '@/components/Controls';
import { WinnerModal } from '@/components/WinnerModal';
import { Prize } from '@/types';

const PALETTE = ["#FF0055", "#00DDFF", "#FFD700", "#9D00FF", "#FF8C00", "#00FF7F"];
const STORAGE_KEY = 'ruleta_data_v1';

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

function getInitialData(): string[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 2) {
        return parsed;
      }
    } catch (e) {
      console.error("Error loading saved data", e);
    }
  }
  return INITIAL_DATA;
}

function App() {
  // Initialize state from storage or defaults
  const [prizes, setPrizes] = useState<Prize[]>(() => generatePrizes(getInitialData()));
  const [winner, setWinner] = useState<Prize | null>(null);
  
  // Controls state
  const spinFnRef = useRef<() => void>(() => {});
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState<'wheel' | 'scroll'>('wheel');

  const handleUpdate = (names: string[]) => {
    setPrizes(generatePrizes(names));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
  };

  const handleFinish = (winner: Prize) => {
    setWinner(winner);
    setIsSpinning(false);
  };

  // Derived state for the textarea initial value
  const initialText = prizes.map(p => p.text).join('\n');

  return (
    <div className={`bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center p-4 font-sans text-white transition-all duration-500 ${isFocusMode ? 'h-screen w-screen overflow-hidden justify-between pb-8 pt-2' : 'min-h-screen justify-center overflow-hidden'}`}>
      
      <header className={`transition-all duration-500 text-center relative w-full max-w-6xl z-50 ${isFocusMode ? 'h-12 flex items-center justify-center shrink-0' : 'mb-8'}`}>
        <h1 className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00DDFF] to-[#FF0055] drop-shadow-[0_0_10px_rgba(255,0,85,0.5)] uppercase tracking-wider transition-all ${isFocusMode ? 'text-2xl' : 'text-5xl'}`}>
          Ruleta
        </h1>
        {!isFocusMode && <p className="text-white/60 text-sm mt-2">¡Prueba tu suerte!</p>}
        
        <div className={`absolute right-0 flex gap-2 ${isFocusMode ? 'top-1/2 -translate-y-1/2' : 'top-1/2 -translate-y-1/2'}`}>
          {/* View Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'wheel' ? 'scroll' : 'wheel')}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition"
            title={viewMode === 'wheel' ? "Cambiar a lista" : "Cambiar a ruleta"}
            disabled={isSpinning}
          >
            {viewMode === 'wheel' ? <LayoutList size={24} /> : <RefreshCcw size={24} />}
          </button>
          
          {/* Focus Mode Toggle */}
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition"
            title={isFocusMode ? "Salir de modo enfoque" : "Modo enfoque"}
          >
            {isFocusMode ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
        </div>
      </header>

      <div className={`flex w-full max-w-7xl justify-center transition-all duration-500 ${isFocusMode ? 'flex-col items-center flex-1 h-full overflow-hidden' : 'flex-col lg:flex-row items-center gap-8 lg:gap-12'}`}>
        
        <div className={`flex justify-center transition-all duration-500 ${isFocusMode ? 'flex-1 w-full h-full items-center justify-center overflow-hidden py-4' : 'flex-1 w-full'}`}>
          {viewMode === 'wheel' ? (
            <Roulette 
              prizes={prizes} 
              onFinish={handleFinish}
              isFocusMode={isFocusMode}
              onRef={(spin, spinning) => {
                spinFnRef.current = spin;
                if (spinning !== isSpinning) setIsSpinning(spinning);
              }}
            />
          ) : (
            <ScrollWheel 
              prizes={prizes}
              onFinish={handleFinish}
              isFocusMode={isFocusMode}
              onRef={(spin, spinning) => {
                spinFnRef.current = spin;
                if (spinning !== isSpinning) setIsSpinning(spinning);
              }}
            />
          )}
        </div>

        <div className={`transition-all duration-500 ${isFocusMode ? 'w-full flex justify-center pb-4 shrink-0' : 'flex-1 w-full max-w-md'}`}>
          <Controls 
            initialNames={initialText}
            onUpdate={handleUpdate}
            onSpin={() => spinFnRef.current()}
            isSpinning={isSpinning}
            isFocusMode={isFocusMode}
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
