import React, { useMemo } from 'react';
import '../styles/layout.css';

const createParticles = (count) => {
  return Array.from({ length: count }, (_, index) => {
    const size = Math.random() * 5 + 1;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const opacity = Math.random() * 0.5 + 0.1;
    const duration = Math.random() * 30 + 10;

    return {
      id: index,
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${posX}%`,
        top: `${posY}%`,
        opacity,
        animation: `float ${duration}s infinite ease-in-out`,
      },
    };
  });
};

const Particles = ({ count = 50 }) => {
  const particles = useMemo(() => createParticles(count), [count]);
  return (
    <div className="particles" aria-hidden>
      {particles.map((particle) => (
        <div key={particle.id} className="particle" style={particle.style} />
      ))}
    </div>
  );
};

export default Particles;
