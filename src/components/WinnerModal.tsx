import { Prize } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

interface WinnerModalProps {
  winner: Prize | null;
  onClose: () => void;
  isDarkMode?: boolean;
}

export function WinnerModal({ winner, onClose, isDarkMode = true }: WinnerModalProps) {
  return (
    <AnimatePresence>
      {winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md p-4 overflow-hidden ${
            isDarkMode ? 'bg-[#0f0c29]/95' : 'bg-white/95'
          }`}
          onClick={onClose}
        >
          {/* Animated Background Glow */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{ 
              background: `radial-gradient(circle at center, ${winner.color} 0%, transparent 70%)` 
            }}
          />

          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
            className="w-full max-w-5xl text-center relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.h2
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-2xl md:text-3xl font-bold uppercase tracking-[0.3em] mb-8 drop-shadow-lg ${
                isDarkMode ? 'text-white/60' : 'text-gray-700'
              }`}
            >
              ¡Tenemos un Ganador!
            </motion.h2>
            
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.1, 1] }}
              transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.3 }}
              className="mb-12 leading-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] px-4 break-words"
              style={{
                color: winner.color,
                textShadow: `0 0 20px ${winner.color}44, 0 10px 40px rgba(0,0,0,0.5)`,
                fontSize: `clamp(2rem, ${Math.max(3, 20 - winner.text.length * 0.15)}vw, 12rem)`,
                fontWeight: 900,
                maxWidth: '90vw',
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
              }}
            >
              {winner.text}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={onClose}
                className={`group relative px-12 py-5 font-black text-2xl rounded-full transition-all hover:scale-110 active:scale-95 overflow-hidden ${
                  isDarkMode
                    ? 'bg-white text-black shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                    : 'bg-gray-900 text-white shadow-[0_10px_30px_rgba(0,0,0,0.3)]'
                }`}
              >
                <div className={`absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-transparent via-white/40 to-transparent'
                    : 'bg-gradient-to-r from-transparent via-black/20 to-transparent'
                }`}></div>
                ¡EXCELENTE!
              </button>
            </motion.div>
          </motion.div>

          {/* Particle fragments effect (CSS only approximation or just simple motion divs) */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: "50%", 
                  y: "50%", 
                  scale: 0 
                }}
                animate={{ 
                  x: `${Math.random() * 100}%`, 
                  y: `${Math.random() * 100}%`, 
                  scale: Math.random() * 2 + 1,
                  opacity: 0
                }}
                transition={{ 
                  duration: Math.random() * 2 + 1, 
                  delay: 0.3,
                  ease: "easeOut" 
                }}
                className="absolute w-2 h-2 rounded-full"
                style={{ backgroundColor: winner.color }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
