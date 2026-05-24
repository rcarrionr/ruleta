import { useState, useEffect } from 'react';
import { Peer, DataConnection } from 'peerjs';
import { Send, CheckCircle2, AlertCircle, XCircle, Maximize2, Minimize2 } from 'lucide-react';

interface RemoteControlProps {
  peerId: string;
}

export function RemoteControl({ peerId }: RemoteControlProps) {
  const [text, setText] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [conn, setConn] = useState<DataConnection | null>(null);
  const [lastSent, setLastSent] = useState(false);

  useEffect(() => {
    const peer = new Peer();
    
    peer.on('open', () => {
      const connection = peer.connect(peerId);
      
      connection.on('open', () => {
        setStatus('connected');
        setConn(connection);
      });

      connection.on('data', (data: any) => {
        if (data.type === 'SYNC_STATE') {
          setText(data.payload.text);
          setIsFocusMode(data.payload.isFocusMode);
        }
      });

      connection.on('error', () => {
        setStatus('error');
      });

      connection.on('close', () => {
        setStatus('error');
      });
    });

    return () => {
      peer.destroy();
    };
  }, [peerId]);

  const handleUpdate = () => {
    if (conn && status === 'connected') {
      conn.send({ type: 'UPDATE_TEXT', payload: text });
      setLastSent(true);
      setTimeout(() => setLastSent(false), 2000);
    }
  };

  const handleSpin = () => {
    if (conn && status === 'connected') {
      conn.send({ type: 'SPIN' });
    }
  };

  const handleCloseModal = () => {
    if (conn && status === 'connected') {
      conn.send({ type: 'CLOSE_MODAL' });
    }
  };

  const handleToggleFocus = () => {
    if (conn && status === 'connected') {
      setIsFocusMode(!isFocusMode);
      conn.send({ type: 'TOGGLE_FOCUS' });
    }
  };

  if (status === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
        <p className="text-cyan-400 font-medium">Conectando con la ruleta...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-900 text-white text-center">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error de Conexión</h2>
        <p className="text-white/60">No se pudo conectar con el PC. Asegúrate de que la ruleta siga abierta.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6 flex flex-col gap-6 text-white font-sans">
      <header className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-cyan-400">Control Remoto</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs text-white/40 uppercase tracking-widest">Conectado</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-4">
        <label className="text-sm font-medium text-white/60 uppercase tracking-wider">
          Opciones (una por línea)
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe las opciones aquí..."
          className="flex-1 w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-lg resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleUpdate}
          className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
            lastSent 
              ? 'bg-green-600 text-white scale-95' 
              : 'bg-cyan-600 hover:bg-cyan-500 text-white active:scale-95 shadow-lg shadow-cyan-900/20'
          }`}
        >
          {lastSent ? <CheckCircle2 size={24} /> : <Send size={24} />}
          {lastSent ? 'Actualizado' : 'Actualizar'}
        </button>

        <button
          onClick={handleSpin}
          className="bg-rose-600 hover:bg-rose-500 active:scale-95 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-900/20"
        >
          Girar Ruleta
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={handleCloseModal}
          className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white py-4 rounded-2xl font-bold border border-white/10"
        >
          <XCircle size={24} />
          Cerrar Ganador
        </button>

        <button
          onClick={handleToggleFocus}
          className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold border transition-all active:scale-95 ${
            isFocusMode 
              ? 'bg-amber-600 border-amber-500 text-white shadow-lg shadow-amber-900/20' 
              : 'bg-slate-800 border-white/10 text-white'
          }`}
        >
          {isFocusMode ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
          {isFocusMode ? 'Salir Full' : 'Entrar Full'}
        </button>
      </div>
    </div>
  );
}
