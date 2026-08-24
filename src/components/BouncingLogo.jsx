import React, { useEffect, useRef } from 'react';
import logoImg from '../assets/AwQat.png';

const BouncingLogo = () => {
  const logoRef = useRef(null);
  
  // Track position
  const pos = useRef({ x: 50, y: 50 });
  
  const isMobile = window.innerWidth < 768;
  const baseSpeed = isMobile ? 80 : 150;
  const speedVar = isMobile ? 40 : 80;

  const vel = useRef({ 
    dx: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * speedVar + baseSpeed), 
    dy: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * speedVar + baseSpeed) 
  }); 
  
  const hue = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationFrameId;

    const getRandomSpeed = (direction) => {
      const currentIsMobile = window.innerWidth < 768;
      const currentBase = currentIsMobile ? 80 : 150;
      const currentVar = currentIsMobile ? 40 : 80;
      
      const speed = Math.random() * currentVar + currentBase; 
      return direction * speed;
    };

    const animate = (time) => {
      if (!logoRef.current) return;
      const deltaTime = (time - lastTime.current) / 1000;
      lastTime.current = time;

      if (deltaTime > 0.1) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const logo = logoRef.current;
      const rect = logo.getBoundingClientRect();
      
      let { x, y } = pos.current;
      let { dx, dy } = vel.current;
      let bounced = false;

      x += dx * deltaTime;
      y += dy * deltaTime;

      if (x + rect.width >= window.innerWidth) {
        dx = getRandomSpeed(-1); 
        x = window.innerWidth - rect.width;
        bounced = true;
      } else if (x <= 0) {
        dx = getRandomSpeed(1); 
        x = 0;
        bounced = true;
      }

      if (y + rect.height >= window.innerHeight) {
        dy = getRandomSpeed(-1); 
        y = window.innerHeight - rect.height;
        bounced = true;
      } else if (y <= 0) {
        dy = getRandomSpeed(1); 
        y = 0;
        bounced = true;
      }

      if (bounced) {
        hue.current = (hue.current + 60) % 360;
        logo.style.filter = `hue-rotate(${hue.current}deg) drop-shadow(0 10px 8px rgba(0,0,0,0.5))`;
      }

      pos.current = { x, y };
      vel.current = { dx, dy };

      logo.style.transform = `translate3d(${x}px, ${y}px, 0)`;

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <img
        ref={logoRef}
        src={logoImg}
        alt="Bouncing Logo"
        className="absolute top-0 left-0 w-3 md:w-5 lg:w-10 opacity-80 h-auto" 
        style={{ willChange: 'transform, filter' }}
      />
    </div>
  );
};

export default BouncingLogo;