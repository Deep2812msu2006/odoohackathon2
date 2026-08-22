import React, { useEffect, useRef } from 'react';

export const GridBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const gridSize = 45;
    let scanLineY = 0;
    let pulseOffset = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw glowing horizontal grid lines
      ctx.lineWidth = 0.8;
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);

        // Highlight scanning line intersection
        const distToScan = Math.abs(y - scanLineY);
        if (distToScan < 80) {
          const alpha = (1 - distToScan / 80) * 0.45;
          ctx.strokeStyle = `rgba(0, 242, 254, ${0.12 + alpha})`;
        } else {
          ctx.strokeStyle = 'rgba(0, 242, 254, 0.08)';
        }
        ctx.stroke();
      }

      // 2. Draw glowing vertical grid lines
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);

        const wave = Math.sin((x + pulseOffset) * 0.01) * 0.04 + 0.08;
        ctx.strokeStyle = `rgba(255, 0, 128, ${wave})`;
        ctx.stroke();
      }

      // 3. Draw glowing laser scan beam
      scanLineY += 1.2;
      if (scanLineY > height) scanLineY = 0;

      const scanGradient = ctx.createLinearGradient(0, scanLineY - 30, 0, scanLineY + 30);
      scanGradient.addColorStop(0, 'rgba(0, 242, 254, 0)');
      scanGradient.addColorStop(0.5, 'rgba(0, 242, 254, 0.25)');
      scanGradient.addColorStop(1, 'rgba(0, 242, 254, 0)');

      ctx.fillStyle = scanGradient;
      ctx.fillRect(0, scanLineY - 30, width, 60);

      // 4. Draw glowing intersection node highlights
      pulseOffset += 0.5;
      for (let x = gridSize; x < width; x += gridSize * 2) {
        for (let y = gridSize; y < height; y += gridSize * 2) {
          const nodePulse = (Math.sin((x + y + pulseOffset * 2) * 0.02) + 1) / 2;
          if (nodePulse > 0.6) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 245, 160, 0.6)';
            ctx.shadowColor = 'rgba(0, 245, 160, 0.8)';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1] block"
      style={{ opacity: 0.9 }}
    />
  );
};
