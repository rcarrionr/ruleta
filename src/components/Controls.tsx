import { useState, useEffect } from 'react';
import { 
  Trash2, 
  Plus, 
  List, 
  AlignLeft, 
  X, 
  RefreshCw 
} from 'lucide-react';

interface ControlsProps {
  initialNames: string;
  onUpdate: (names: string[]) => void;
  onSpin: () => void;
  isSpinning: boolean;
  isFocusMode: boolean;
}

type Mode = 'text' | 'list';

export function Controls({ initialNames, onUpdate, onSpin, isSpinning, isFocusMode }: ControlsProps) {
  const [mode, setMode] = useState<Mode>('text');
  
  // Data State
  const [text, setText] = useState(initialNames);
  const [listItems, setListItems] = useState<string[]>([]);
  
  // Input state for List Mode
  const [newItem, setNewItem] = useState('');

  // Sync state when initialNames changes (from localStorage load)
  useEffect(() => {
    setText(initialNames);
    setListItems(initialNames.split('\n').filter(x => x.trim()));
  }, [initialNames]);

  // SYNC LOGIC: When switching modes, sync data
  const handleModeSwitch = (newMode: Mode) => {
    if (newMode === 'list') {
      // Text -> List
      const items = text.split('\n').filter(line => line.trim() !== '');
      setListItems(items);
    } else {
      // List -> Text
      setText(listItems.join('\n'));
    }
    setMode(newMode);
  };

  // --- Actions for List Mode ---
  const addItem = () => {
    if (!newItem.trim()) return;
    setListItems([...listItems, newItem.trim()]);
    setNewItem('');
  };

  const removeItem = (index: number) => {
    setListItems(listItems.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    if (confirm('¿Estás seguro de borrar toda la lista?')) {
      setListItems([]);
      setText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addItem();
  };

  // --- Final Update Trigger ---
  const handleUpdate = () => {
    let finalNames: string[] = [];
    
    if (mode === 'text') {
      finalNames = text.split('\n').filter(n => n.trim() !== '');
      // Also sync list state just in case
      setListItems(finalNames);
    } else {
      finalNames = listItems;
      // Also sync text state just in case
      setText(finalNames.join('\n'));
    }

    if (finalNames.length < 2) {
      alert("¡Por favor ingresa al menos 2 opciones!");
      return;
    }
    onUpdate(finalNames);
  };

  return (
    <div className={`flex flex-col gap-4 w-full max-w-md transition-all duration-500 ${isFocusMode ? 'bg-transparent border-0 shadow-none p-0 items-center' : 'bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl'}`}>
      
      {/* Header & Tabs - Hidden in Focus Mode */}
      {!isFocusMode && (
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold text-white">Opciones</h2>
          <div className="flex bg-gray-900/50 rounded-lg p-1">
            <button
              onClick={() => handleModeSwitch('text')}
              className={`p-2 rounded-md transition-all ${mode === 'text' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              title="Modo Texto"
              disabled={isSpinning}
            >
              <AlignLeft size={18} />
            </button>
            <button
              onClick={() => handleModeSwitch('list')}
              className={`p-2 rounded-md transition-all ${mode === 'list' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
              title="Modo Lista"
              disabled={isSpinning}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      )}
      
      {/* --- TEXT MODE --- */}
      {!isFocusMode && mode === 'text' && (
        <textarea
          className="w-full h-60 p-4 rounded-lg bg-gray-900/80 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none font-mono text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ingresa un nombre por línea..."
          disabled={isSpinning}
        />
      )}

      {/* --- LIST MODE --- */}
      {!isFocusMode && mode === 'list' && (
        <div className="flex flex-col h-60">
          {/* Add Item Input */}
          <div className="flex gap-2 mb-3">
            <input 
              type="text" 
              className="flex-1 bg-gray-900/80 border border-gray-700 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Nuevo elemento..."
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSpinning}
            />
            <button 
              onClick={addItem}
              disabled={!newItem.trim() || isSpinning}
              className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <Plus size={20} />
            </button>
          </div>

          {/* Scrollable List */}
          <div className="flex-1 overflow-y-auto bg-gray-900/40 rounded-lg p-2 space-y-2 pr-1 custom-scrollbar border border-white/5">
            {listItems.length === 0 && (
              <p className="text-center text-gray-500 text-sm mt-10 italic">Lista vacía. ¡Agrega algo!</p>
            )}
            {listItems.map((item, idx) => (
              <div key={idx} className="group flex items-center justify-between bg-gray-800/80 p-2 rounded-md border border-gray-700 hover:border-gray-500 transition">
                <span className="truncate text-sm font-medium pl-1">{item}</span>
                <button 
                  onClick={() => removeItem(idx)}
                  className="text-gray-400 hover:text-red-400 p-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isSpinning}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          {listItems.length > 0 && (
            <div className="mt-2 flex justify-end">
              <button 
                onClick={clearAll}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 hover:underline"
                disabled={isSpinning}
              >
                <X size={12} /> Borrar todo
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Main Actions */}
      <div className={`flex gap-3 pt-2 ${!isFocusMode ? 'mt-auto border-t border-white/10' : ''}`}>
        {!isFocusMode && (
          <button
            onClick={handleUpdate}
            disabled={isSpinning}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} />
            Actualizar
          </button>
        )}
        
        <button
          onClick={onSpin}
          disabled={isSpinning}
          className={`px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-bold text-lg rounded-xl shadow-lg transition transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isFocusMode ? 'w-64 h-16 text-2xl shadow-2xl animate-pulse' : 'flex-1'}`}
        >
          {isSpinning ? '...' : '¡GIRAR!'}
        </button>
      </div>
    </div>
  );
}