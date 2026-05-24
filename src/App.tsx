import { useState, useRef, useEffect, useMemo } from 'react';
import { Maximize2, Minimize2, RefreshCcw, LayoutList, Smartphone, Loader2 } from 'lucide-react';
import { Roulette } from '@/components/Roulette';
import { ScrollWheel } from '@/components/ScrollWheel';
import { Controls } from '@/components/Controls';
import { WinnerModal } from '@/components/WinnerModal';
import { RemoteControl } from '@/components/RemoteControl';
import { RemoteQR } from '@/components/RemoteQR';
import { Prize } from '@/types';
import { Peer } from 'peerjs';
import { COMMIT_HASH, COMMIT_URL } from '@/utils/commit-info';

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
  const urlParams = new URLSearchParams(window.location.search);
  const joinParam = urlParams.get('join');
  // Strict check: only remote if join exists AND is not empty
  const isRemoteMode = joinParam !== null && joinParam.trim().length > 0;
  const remoteJoinId = isRemoteMode ? joinParam!.trim() : null;

  const [prizes, setPrizes] = useState<Prize[]>(() => generatePrizes(getInitialData()));
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [winner, setWinner] = useState<Prize | null>(null);
  const [previousWinners, setPreviousWinners] = useState<string[]>([]);
  
  const [peerId, setPeerId] = useState<string>('');
  const [showQR, setShowQR] = useState(false);
  
  const spinFnRef = useRef<() => void>(() => {});
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [viewMode, setViewMode] = useState<'wheel' | 'scroll'>('wheel');

  const executeSpin = () => {
    if (winner) setWinner(null);
    // Wait a frame to ensure modal closes before spin starts
    setTimeout(() => {
      spinFnRef.current();
    }, 50);
  };

  useEffect(() => {
    if (isRemoteMode) return;

    console.log('Iniciando PeerJS Host...');
    const peer = new Peer();
    
    peer.on('open', (id) => {
      console.log('PeerJS Abierto con ID:', id);
      setPeerId(id);
    });

    peer.on('error', (err) => {
      console.error('Error en PeerJS:', err);
    });

    peer.on('connection', (conn) => {
      console.log('Nueva conexión remota establecida');
      
      // Auto-close QR on connection
      setShowQR(false);

      // Send current state to remote immediately
      conn.on('open', () => {
        const currentText = prizes.map(p => p.text).join('\n');
        conn.send({ 
          type: 'SYNC_STATE', 
          payload: { 
            text: currentText,
            isFocusMode: isFocusMode 
          } 
        });
      });

      conn.on('data', (data: any) => {
        if (data.type === 'UPDATE_TEXT') {
          const names = data.payload.split('\n').filter((n: string) => n.trim() !== '');
          if (names.length >= 2) handleUpdate(names);
        } else if (data.type === 'SPIN') {
          executeSpin();
        } else if (data.type === 'CLOSE_MODAL') {
          setWinner(null);
        } else if (data.type === 'TOGGLE_FOCUS') {
          setIsFocusMode(prev => !prev);
        }
      });
    });

    return () => {
      peer.destroy();
    };
  }, [isRemoteMode]);

  useEffect(() => {
    setWeights(prev => {
      const next = { ...prev };
      let changed = false;
      prizes.forEach(p => {
        if (next[p.id] === undefined) {
          next[p.id] = p.weight ?? 1;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [prizes]);

  const handleUpdate = (names: string[]) => {
    const newPrizes = generatePrizes(names);
    setPrizes(newPrizes);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    const newWeights: Record<string, number> = {};
    newPrizes.forEach(p => newWeights[p.id] = 1);
    setWeights(newWeights);
  };

  const handleFinish = (winner: Prize) => {
    setWinner(winner);
    setIsSpinning(false);
    setWeights(prev => ({
      ...prev,
      [winner.id]: Math.max(0.1, (prev[winner.id] || 1) * 0.5)
    }));
    
    // Track previous winners (keep last 10)
    setPreviousWinners(prev => [winner.id, ...prev].slice(0, 10));
  };

  if (isRemoteMode && remoteJoinId) {
    return <RemoteControl peerId={remoteJoinId} />;
  }

  const prizesWithWeights = useMemo(() => prizes.map(p => ({
    ...p,
    weight: weights[p.id] || 1
  })), [prizes, weights]);

  const initialText = prizes.map(p => p.text).join('\n');

  return (
    <div className={`bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center p-4 font-sans text-white transition-all duration-500 ${isFocusMode ? 'h-screen w-screen overflow-hidden' : 'min-h-screen'}`}>
      
      <header className={`transition-all duration-500 text-center relative w-full max-w-6xl z-50 ${isFocusMode ? 'h-12 flex items-center justify-center shrink-0' : 'mb-8'}`}>
        <h1 className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00DDFF] to-[#FF0055] drop-shadow-[0_0_10px_rgba(255,0,85,0.5)] uppercase tracking-wider transition-all ${isFocusMode ? 'text-2xl' : 'text-5xl'}`}>
          Ruleta
        </h1>
        
        <div className={`absolute right-0 flex gap-2 top-1/2 -translate-y-1/2`}>
          <button
            onClick={() => setShowQR(true)}
            className="p-2 text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-full transition-all shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            title="Conectar celular"
          >
            {peerId ? <Smartphone size={24} /> : <Loader2 size={24} className="animate-spin opacity-50" />}
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'wheel' ? 'scroll' : 'wheel')}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition"
            disabled={isSpinning}
          >
            {viewMode === 'wheel' ? <LayoutList size={24} /> : <RefreshCcw size={24} />}
          </button>
          
          <button
            onClick={() => setIsFocusMode(!isFocusMode)}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            {isFocusMode ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          </button>
        </div>
      </header>

      <div className={`flex w-full max-w-7xl justify-center transition-all duration-500 ${isFocusMode ? 'flex-col items-center flex-1 h-full overflow-hidden' : 'flex-col lg:flex-row items-center gap-8 lg:gap-12'}`}>
        <div className={`flex justify-center transition-all duration-500 ${isFocusMode ? 'flex-1 w-full h-full items-center justify-center overflow-hidden py-4' : 'flex-1 w-full'}`}>
          {viewMode === 'wheel' ? (
            <Roulette 
              prizes={prizesWithWeights} 
              onFinish={handleFinish}
              isFocusMode={isFocusMode}
              onRef={(spin, spinning) => {
                spinFnRef.current = spin;
                if (spinning !== isSpinning) setIsSpinning(spinning);
              }}
              previousWinners={previousWinners}
            />
          ) : (
            <ScrollWheel 
              prizes={prizesWithWeights}
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
            onSpin={executeSpin}
            isSpinning={isSpinning}
            isFocusMode={isFocusMode}
          />
        </div>
      </div>

      <WinnerModal winner={winner} onClose={() => setWinner(null)} />

      {showQR && (
        <RemoteQR 
          peerId={peerId} 
          onClose={() => setShowQR(false)} 
        />
      )}

      {/* Footer with Commit Info */}
      {!isFocusMode && (
        <footer className="mt-auto pt-8 text-center text-white/40 text-xs border-t border-white/10 w-full">
          <a 
            href={COMMIT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60 transition underline"
            title="Ver commit en GitHub"
          >
            Versión: {COMMIT_HASH}
          </a>
        </footer>
      )}
    </div>
  );
}

export default App;
