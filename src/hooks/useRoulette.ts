import { useRef, useEffect, useState, useCallback } from 'react';
import { Prize } from '@/types';
import confetti from 'canvas-confetti';

interface UseRouletteProps {
  prizes: Prize[];
  onFinish?: (winner: Prize) => void;
}

export function useRoulette({ prizes, onFinish }: UseRouletteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  
  // State refs to keep track inside animation frame without re-triggering
  const stateRef = useRef({
    startAngle: 0,
    spinAngleStart: 0,
    spinTime: 0,
    spinTimeTotal: 0,
    arc: 0,
    ctx: null as CanvasRenderingContext2D | null,
  });

  const drawRouletteWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Always get fresh context
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    stateRef.current.ctx = ctx;

    const arc = (2 * Math.PI) / prizes.length;
    stateRef.current.arc = arc;

    const outsideRadius = 240;
    const insideRadius = 50;
    
    // Clear
    ctx.clearRect(0, 0, 500, 500);
    
    const cx = 250;
    const cy = 250;

    ctx.strokeStyle = "rgba(0,0,0,0)";
    ctx.lineWidth = 0;

    // Font size dynamic
    let fontSize = 24;
    if (prizes.length > 12) fontSize = 18;
    if (prizes.length > 20) fontSize = 14;
    ctx.font = `bold ${fontSize}px Inter, sans-serif`;

    for (let i = 0; i < prizes.length; i++) {
      const angle = stateRef.current.startAngle + i * arc;
      
      // Segment
      ctx.fillStyle = prizes[i].color;
      ctx.beginPath();
      ctx.arc(cx, cy, outsideRadius, angle, angle + arc, false);
      ctx.arc(cx, cy, insideRadius, angle + arc, angle, true);
      ctx.stroke();
      ctx.fill();

      // Text (Radial Orientation)
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.2)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      ctx.fillStyle = "#FFFFFF";
      
      // Calculate middle angle of the slice
      const middleAngle = angle + arc / 2;
      
      // Move to the position near the inner hub
      const textStartRadius = insideRadius + 15;
      ctx.translate(
        cx + Math.cos(middleAngle) * textStartRadius, 
        cy + Math.sin(middleAngle) * textStartRadius
      );
      
      // Rotate to match the slice direction
      ctx.rotate(middleAngle);
      
      const text = prizes[i].text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      // Calculate max width (from hub to near edge)
      const maxWidth = outsideRadius - insideRadius - 30;
      
      // Draw text
      ctx.fillText(text, 0, 0, maxWidth);
      
      ctx.restore();
    }

    // Center Hub
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, insideRadius - 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Center Dot
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(cx, cy, 15, 0, 2 * Math.PI);
    ctx.fill();

    // Pointer (Triangle at top)
    // In original code, there was no explicit pointer drawn in canvas, 
    // it was likely CSS or implied at 270deg (top).
    // Let's add a simple one to be sure.
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - (outsideRadius + 10));
    ctx.lineTo(cx + 10, cy - (outsideRadius + 10));
    ctx.lineTo(cx, cy - (outsideRadius - 5));
    ctx.fill();

  }, [prizes]);

  // Initial Draw
  useEffect(() => {
    drawRouletteWheel();
  }, [drawRouletteWheel]);

  // Animation Logic
  const stopRotateWheel = () => {
    setIsSpinning(false);
    
    const { startAngle } = stateRef.current;
    
    // Calculate winner
    // 90 degree offset because 0 is right (0 rad), but we want top pointer
    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = 360 / prizes.length;
    const index = Math.floor((360 - degrees % 360) / arcd);
    
    const winnerIndex = (index >= 0 && index < prizes.length) ? index : 0;
    const winner = prizes[winnerIndex];

    // Fire Confetti
    launchConfetti();

    if (onFinish) onFinish(winner);
  };

  const easeOut = (t: number, b: number, c: number, d: number) => {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  };

  const rotateWheel = useCallback(() => {
    const s = stateRef.current;
    s.spinTime += 30;
    
    if (s.spinTime >= s.spinTimeTotal) {
      stopRotateWheel();
      return;
    }

    const spinAngle = s.spinAngleStart - easeOut(s.spinTime, 0, s.spinAngleStart, s.spinTimeTotal);
    s.startAngle += (spinAngle * Math.PI / 180);
    
    drawRouletteWheel();
    requestAnimationFrame(rotateWheel);
  }, [drawRouletteWheel]); // Recurse via ref logic, dependency safe

  const spin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    stateRef.current.spinAngleStart = Math.random() * 10 + 10;
    stateRef.current.spinTime = 0;
    stateRef.current.spinTimeTotal = Math.random() * 3000 + 4000;
    
    rotateWheel();
  };

  const launchConfetti = () => {
    const count = 200;
    const defaults = { origin: { y: 0.7 } };
    function fire(particleRatio: number, opts: any) {
      confetti(Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio)
      }));
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  return {
    canvasRef,
    spin,
    isSpinning
  };
}
