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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f0c29]/95 backdrop-blur-md p-4 overflow-hidden"
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
              className="text-white/60 text-2xl md:text-3xl font-bold uppercase tracking-[0.3em] mb-8 drop-shadow-lg"
            >
              ¡Tenemos un Ganador!
            </motion.h2>
            
            <motion.div 
              initial={{ scale: 0.5 }}
              animate={{ scale: [0.5, 1.1, 1] }}
              transition={{ type: "spring", damping: 12, stiffness: 100, delay: 0.3 }}
              className="text-7xl md:text-9xl lg:text-[12rem] font-black mb-12 leading-none drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] px-4"
              style={{ 
                color: winner.color,
                textShadow: `0 0 20px ${winner.color}44, 0 10px 40px rgba(0,0,0,0.5)`
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
                className="group relative px-12 py-5 bg-white text-black font-black text-2xl rounded-full transition-all hover:scale-110 active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
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
