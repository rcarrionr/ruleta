import { useState } from 'react';

interface ControlsProps {
  initialNames: string;
  onUpdate: (names: string[]) => void;
  onSpin: () => void;
  isSpinning: boolean;
}

export function Controls({ initialNames, onUpdate, onSpin, isSpinning }: ControlsProps) {
  const [text, setText] = useState(initialNames);

  const handleUpdate = () => {
    const names = text.split('\n').filter(n => n.trim() !== '');
    if (names.length < 2) {
      alert("¡Por favor ingresa al menos 2 opciones!");
      return;
    }
    onUpdate(names);
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
      <h2 className="text-xl font-bold text-center text-white mb-2">Opciones</h2>
      
      <textarea
        className="w-full h-40 p-4 rounded-lg bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono text-sm"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ingresa un nombre por línea..."
        disabled={isSpinning}
      />
      
      <div className="flex gap-3">
        <button
          onClick={handleUpdate}
          disabled={isSpinning}
          className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Actualizar
        </button>
        
        <button
          onClick={onSpin}
          disabled={isSpinning}
          className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-lg rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSpinning ? 'Girando...' : '¡GIRAR!'}
        </button>
      </div>
    </div>
  );
}
