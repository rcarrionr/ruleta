import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Prize } from '@/types';
import confetti from 'canvas-confetti';

interface ScrollWheelProps {
  prizes: Prize[];
  onFinish: (winner: Prize) => void;
  onRef: (spin: () => void, isSpinning: boolean) => void;
  isFocusMode?: boolean;
}

const ITEM_HEIGHT = 80; // Height of each card
const VISIBLE_ITEMS = 5; // Odd number ideally

export function ScrollWheel({ prizes, onFinish, onRef, isFocusMode }: ScrollWheelProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const controls = useAnimation();
  
  // Create a long list for infinite illusion
  // Repeat prizes enough times to scroll for a while
  // We need at least 3 sets: [Previous, Current, Next] but for spinning we need more
  const repeatCount = 20; 
  const displayList = Array(repeatCount).fill(prizes).flat();

  const spin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // 1. Calculate Winner Randomly
    const winnerIndex = Math.floor(Math.random() * prizes.length);
    const winner = prizes[winnerIndex];

    // 2. Calculate Stop Position
    // We want to stop at a specific instance of the winner deep in the list
    // Let's aim for the end of the list to allow long spin
    const targetSetIndex = repeatCount - 2; // Stop at the second to last set
    const targetIndexInSet = winnerIndex;
    const totalIndex = (targetSetIndex * prizes.length) + targetIndexInSet;
    
    // Center offset: We want the winner to be in the middle of the container
    // Container height = VISIBLE_ITEMS * ITEM_HEIGHT
    // Center of container = (VISIBLE_ITEMS * ITEM_HEIGHT) / 2
    // Item center = (totalIndex * ITEM_HEIGHT) + (ITEM_HEIGHT / 2)
    // TranslateY = Center of container - Item center
    const containerHeight = VISIBLE_ITEMS * ITEM_HEIGHT;
    const centerOffset = (containerHeight / 2) - (ITEM_HEIGHT / 2);
    const finalY = -(totalIndex * ITEM_HEIGHT) + centerOffset;

    // 3. Reset to start (optional, or just continue if we handle loop)
    // For simplicity, we snap to the first set equivalent position if we were already deep
    // But since we just mount/unmount or reset state, straightforward animation is fine.
    await controls.start({ y: 0, transition: { duration: 0 } });

    // 4. Animate
    // Ease out cubic or similar for "wheel stopping" effect
    await controls.start({ 
      y: finalY,
      transition: { 
        duration: 4, 
        ease: [0.15, 0.25, 0.25, 1], // Cubic-bezier for spin deceleration
        type: "tween"
      }
    });

    // 5. Finish
    launchConfetti();
    onFinish(winner);
    setIsSpinning(false);
  };

  // Bind spin function
  useEffect(() => {
    onRef(spin, isSpinning);
  }, [onRef, isSpinning, prizes]); // Re-bind if prizes change

  const launchConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className={`relative flex justify-center items-center transition-all duration-500 ${isFocusMode ? 'scale-110' : ''}`}>
      
      {/* Container Frame */}
      <div 
        className="relative overflow-hidden bg-gray-900 border-4 border-yellow-500 rounded-xl shadow-2xl"
        style={{ 
          height: VISIBLE_ITEMS * ITEM_HEIGHT, 
          width: 320 
        }}
      >
        {/* Selection Line/Overlay */}
        <div className="absolute top-1/2 left-0 w-full h-[80px] -translate-y-1/2 bg-white/10 border-y-2 border-yellow-400 z-10 pointer-events-none shadow-[0_0_20px_rgba(255,215,0,0.3)]"></div>
        <div className="absolute top-1/2 left-2 -translate-y-1/2 text-yellow-400 text-2xl z-20">▶</div>
        <div className="absolute top-1/2 right-2 -translate-y-1/2 text-yellow-400 text-2xl z-20">◀</div>

        {/* Gradient overlays for depth */}
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-gray-900 to-transparent z-10"></div>
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-900 to-transparent z-10"></div>

        {/* Scrolling List */}
        <motion.div
          animate={controls}
          initial={{ y: 0 }}
          className="flex flex-col w-full"
        >
          {displayList.map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className="flex items-center justify-center w-full"
              style={{ height: ITEM_HEIGHT }}
            >
              <div 
                className="w-[90%] h-[90%] flex items-center justify-center rounded-lg font-bold text-xl shadow-sm border border-white/5"
                style={{ 
                  backgroundColor: item.color,
                  color: '#fff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                }}
              >
                {item.text}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
