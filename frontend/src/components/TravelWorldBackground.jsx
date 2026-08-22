import React, { useEffect, useRef, useState } from 'react';

const backgroundPhotos = [
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&auto=format&fit=crop&q=75', // Paris
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1600&auto=format&fit=crop&q=75', // Tokyo
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1600&auto=format&fit=crop&q=75', // Venice
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&auto=format&fit=crop&q=75', // New York
  'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&auto=format&fit=crop&q=75', // Dubai
  'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&auto=format&fit=crop&q=75', // Sydney
  'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&auto=format&fit=crop&q=75', // London
  'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1600&auto=format&fit=crop&q=75', // Rio
];

export const TravelWorldBackground = () => {
  const canvasRef = useRef(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Smooth 8-second photo transition
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundPhotos.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Optimized Flight Route Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const cityNodes = [
      { name: 'Los Angeles', rx: 0.10, ry: 0.25, color: 'rgba(0, 242, 254, 0.9)' },
      { name: 'New York', rx: 0.28, ry: 0.20, color: 'rgba(255, 0, 128, 0.9)' },
      { name: 'London', rx: 0.48, ry: 0.18, color: 'rgba(168, 85, 247, 0.9)' },
      { name: 'Paris', rx: 0.52, ry: 0.38, color: 'rgba(0, 245, 160, 0.9)' },
      { name: 'Rome', rx: 0.56, ry: 0.52, color: 'rgba(245, 158, 11, 0.9)' },
      { name: 'Cairo', rx: 0.62, ry: 0.65, color: 'rgba(0, 242, 254, 0.9)' },
      { name: 'Dubai', rx: 0.72, ry: 0.48, color: 'rgba(255, 0, 128, 0.9)' },
      { name: 'Tokyo', rx: 0.90, ry: 0.25, color: 'rgba(0, 245, 160, 0.9)' },
      { name: 'Sydney', rx: 0.92, ry: 0.85, color: 'rgba(245, 158, 11, 0.9)' },
      { name: 'Rio', rx: 0.35, ry: 0.82, color: 'rgba(0, 242, 254, 0.9)' },
    ];

    const routes = [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 6 },
      { from: 6, to: 7 },
      { from: 7, to: 8 },
      { from: 1, to: 9 },
      { from: 3, to: 7 },
    ];

    const travelers = routes.map((route, idx) => ({
      routeIndex: idx,
      progress: Math.random(),
      speed: 0.0015 + Math.random() * 0.0015,
      color: cityNodes[route.from].color,
    }));

    let lastTime = 0;
    const fpsInterval = 1000 / 30; // Throttle to 30 FPS for silky smooth efficiency

    const render = (time) => {
      animationFrameId = requestAnimationFrame(render);

      const delta = time - lastTime;
      if (delta < fpsInterval) return;
      lastTime = time - (delta % fpsInterval);

      ctx.clearRect(0, 0, width, height);

      const nodes = cityNodes.map((n) => ({
        ...n,
        x: n.rx * width,
        y: n.ry * height,
      }));

      // 1. Draw Dashed Flight Arcs
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(0, 242, 254, 0.2)';
      ctx.setLineDash([4, 6]);
      routes.forEach((route) => {
        const start = nodes[route.from];
        const end = nodes[route.to];
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2 - Math.min(width, height) * 0.15;

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.quadraticCurveTo(midX, midY, end.x, end.y);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // 2. Animate Traveler Dots (No shadowBlur for maximum GPU speed)
      travelers.forEach((t) => {
        const route = routes[t.routeIndex];
        const start = nodes[route.from];
        const end = nodes[route.to];
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2 - Math.min(width, height) * 0.15;

        t.progress += t.speed;
        if (t.progress >= 1) t.progress = 0;

        const u = 1 - t.progress;
        const tt = t.progress * t.progress;
        const uu = u * u;

        const curX = uu * start.x + 2 * u * t.progress * midX + tt * end.x;
        const curY = uu * start.y + 2 * u * t.progress * midY + tt * end.y;

        ctx.beginPath();
        ctx.arc(curX, curY, 3, 0, Math.PI * 2);
        ctx.fillStyle = t.color;
        ctx.fill();
      });

      // 3. Render City Pin Dots & Text Labels
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      nodes.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.fillText(node.name, node.x + 7, node.y + 3);
      });
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden bg-[#050811] transform-gpu">
      {/* City Background Photos Carousel */}
      {backgroundPhotos.map((photo, idx) => (
        <div
          key={photo}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out will-change-[opacity]"
          style={{
            backgroundImage: `url(${photo})`,
            opacity: idx === currentImageIndex ? 0.75 : 0,
          }}
        />
      ))}

      {/* Dark Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050811]/60 via-[#050811]/40 to-[#050811]/75" />

      {/* Optimized Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 block z-10 opacity-80" />
    </div>
  );
};
