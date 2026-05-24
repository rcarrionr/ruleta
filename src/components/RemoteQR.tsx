import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, X, Loader2, AlertTriangle } from 'lucide-react';

interface RemoteQRProps {
  peerId: string;
  onClose: () => void;
}

export function RemoteQR({ peerId, onClose }: RemoteQRProps) {
  const remoteUrl = `${window.location.origin}${window.location.pathname}?join=${peerId}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex flex-col items-center text-center gap-6">
          <div className="bg-cyan-500/20 p-4 rounded-2xl text-cyan-400">
            <Smartphone size={48} />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Control Remoto</h2>
            <p className="text-white/60 text-sm">
              Escanea este código con tu celular para modificar el texto y girar la ruleta a distancia.
            </p>
          </div>

          {!peerId ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <Loader2 className="animate-spin text-cyan-400" size={48} />
              <p className="text-white/40 text-sm">Esperando al servidor PeerJS...</p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 flex gap-2 items-start text-left">
                <AlertTriangle size={16} className="text-yellow-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-yellow-500/80 leading-tight">
                  Si tarda mucho, intenta refrescar la página. Algunos navegadores o redes bloquean WebRTC.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-white p-4 rounded-2xl shadow-inner">
                <QRCodeSVG value={remoteUrl} size={200} />
              </div>

              <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1 text-left">Peer ID</p>
                <p className="text-cyan-400 font-mono text-sm break-all font-bold tracking-wider">{peerId}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
