import { Prize } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface WinnerModalProps {
  winner: Prize | null;
  onClose: () => void;
}

export function WinnerModal({ winner, onClose }: WinnerModalProps) {
  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-yellow-400 relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">El ganador es</h2>
            <div 
              className="text-4xl font-black mb-6 break-words"
              style={{ color: winner.color }}
            >
              {winner.text}
            </div>
            
            <button
              onClick={onClose}
              className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-gray-800 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              ¡Genial!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
