import { useRef, useEffect, useState, useCallback } from 'react';
import { Prize } from '@/types';
import confetti from 'canvas-confetti';

interface UseRouletteProps {
  prizes: Prize[];
  onFinish?: (winner: Prize) => void;
  previousWinners?: string[]; // IDs of previous winners to avoid repetition
}

export function useRoulette({ prizes, onFinish, previousWinners = [] }: UseRouletteProps) {
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
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    stateRef.current.ctx = ctx;

    const { width, height } = canvas;
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) / 2 - 10;

    const arc = (2 * Math.PI) / prizes.length;
    stateRef.current.arc = arc;

    const outsideRadius = radius;
    const insideRadius = radius * 0.2;
    
    ctx.clearRect(0, 0, width, height);
    
    ctx.strokeStyle = "rgba(0,0,0,0)";
    ctx.lineWidth = 0;

    // Font size dynamic based on radius
    let fontSize = Math.max(12, radius / 10);
    if (prizes.length > 12) fontSize = radius / 14;
    if (prizes.length > 20) fontSize = radius / 18;
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
      
      ctx.fillStyle = "#FFFFFF";
      const middleAngle = angle + arc / 2;
      const textStartRadius = insideRadius + (radius * 0.05);
      
      ctx.translate(
        cx + Math.cos(middleAngle) * textStartRadius, 
        cy + Math.sin(middleAngle) * textStartRadius
      );
      
      ctx.rotate(middleAngle);
      
      const text = prizes[i].text;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      
      const maxWidth = outsideRadius - insideRadius - (radius * 0.1);
      ctx.fillText(text, 0, 0, maxWidth);
      ctx.restore();
    }

    // Center Hub
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(cx, cy, insideRadius - (radius * 0.01), 0, 2 * Math.PI);
    ctx.fill();
    
    // Center Dot
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.06, 0, 2 * Math.PI);
    ctx.fill();

    // Pointer
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(cx - (radius * 0.04), cy - (outsideRadius + 10));
    ctx.lineTo(cx + (radius * 0.04), cy - (outsideRadius + 10));
    ctx.lineTo(cx, cy - (outsideRadius - 5));
    ctx.fill();

  }, [prizes]);

  // Initial Draw
  useEffect(() => {
    drawRouletteWheel();
  }, [drawRouletteWheel]);

  // Función para seleccionar un ganador evitando repeticiones
  const selectWeightedWinner = useCallback(() => {
    // Calcular pesos basados en historial
    const weights = prizes.map((prize) => {
      let weight = 1;
      
      // Por cada aparición en los últimos giros, reducir probabilidad
      const occurrenceCount = previousWinners.filter(id => id === prize.id).length;
      
      // Fórmula: cuantas más veces ha ganado, menor probabilidad
      // Si apareció 1 vez: 0.5x
      // Si apareció 2 veces: 0.25x
      // Si apareció 3+ veces: 0.1x
      weight = Math.pow(0.5, occurrenceCount);
      
      return weight;
    });

    // Seleccionar basado en pesos
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < prizes.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return i;
      }
    }
    
    return 0;
  }, [prizes, previousWinners]);

  // Animation Logic
  const stopRotateWheel = useCallback((targetWinnerIndex: number) => {
    setIsSpinning(false);
    
    const winner = prizes[targetWinnerIndex];

    // Fire Confetti
    launchConfetti();

    if (onFinish) onFinish(winner);
  }, [prizes, onFinish]);

  const easeOut = (t: number, b: number, c: number, d: number) => {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  };

  const rotateWheel = useCallback((targetWinnerIndex: number) => {
    return () => {
      const s = stateRef.current;
      s.spinTime += 30;
      
      if (s.spinTime >= s.spinTimeTotal) {
        stopRotateWheel(targetWinnerIndex);
        return;
      }

      const spinAngle = s.spinAngleStart - easeOut(s.spinTime, 0, s.spinAngleStart, s.spinTimeTotal);
      s.startAngle += (spinAngle * Math.PI / 180);
      
      drawRouletteWheel();
      requestAnimationFrame(rotateWheel(targetWinnerIndex));
    };
  }, [drawRouletteWheel, stopRotateWheel]);

  const spin = useCallback(() => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Seleccionar ganador con pesos
    const targetWinnerIndex = selectWeightedWinner();
    
    // Calcular número de vueltas completas: 5-10
    const fullRotations = Math.floor(Math.random() * 6) + 5; // 5 a 10
    
    // Calcular velocidad y duración basada en vueltas
    const force = Math.random();
    let velocity = 0;
    let duration = 0;

    // La velocidad y duración aumentan con más vueltas
    const rotationFactor = fullRotations / 7.5; // Normalizar (5-10) a escala

    if (force < 0.15) {
      // WEAK SPIN
      velocity = (Math.random() * 15 + 10) * rotationFactor;
      duration = (Math.random() * 1500 + 2500) * rotationFactor;
    } else if (force < 0.8) {
      // NORMAL SPIN
      velocity = (Math.random() * 30 + 30) * rotationFactor;
      duration = (Math.random() * 3000 + 4000) * rotationFactor;
    } else {
      // EPIC SPIN
      velocity = (Math.random() * 60 + 60) * rotationFactor;
      duration = (Math.random() * 5000 + 8000) * rotationFactor;
    }
    
    // Ajustar la velocidad para terminar en el índice correcto
    const arc = (2 * Math.PI) / prizes.length;
    const targetAngle = (targetWinnerIndex * arc);
    const totalRotation = (fullRotations * 2 * Math.PI) + targetAngle;
    
    stateRef.current.spinAngleStart = velocity;
    stateRef.current.spinTime = 0;
    stateRef.current.spinTimeTotal = duration;
    
    requestAnimationFrame(rotateWheel(targetWinnerIndex));
  }, [isSpinning, selectWeightedWinner, rotateWheel, prizes.length]);

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
