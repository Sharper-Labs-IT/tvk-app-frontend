import React, { useEffect, useState } from 'react';

const Snowflake: React.FC = () => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    const left = Math.random() * 100;
    const animationDuration = 5 + Math.random() * 10;
    const opacity = 0.3 + Math.random() * 0.7;
    const size = 2 + Math.random() * 4;
    const delay = Math.random() * 5;

    setStyle({
      left: `${left}%`,
      animationDuration: `${animationDuration}s`,
      animationDelay: `${delay}s`,
      opacity,
      width: `${size}px`,
      height: `${size}px`,
    });
  }, []);

  return (
    <div
      className="snowflake"
      style={style}
    />
  );
};

const Snowfall: React.FC = () => {
  const [showSnow, setShowSnow] = useState(false);

  useEffect(() => {
    // Check if current date is before December 28, 2025
    const endDate = new Date('2025-12-28T00:00:00');
    const currentDate = new Date();
    
    if (currentDate < endDate) {
      setShowSnow(true);
    }
  }, []);

  if (!showSnow) return null;

  // Generate 50 snowflakes
  const snowflakes = Array.from({ length: 50 }, (_, i) => (
    <Snowflake key={i} />
  ));

  return (
    <>
      <style>{`
        .snowfall-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
          overflow: hidden;
        }

        .snowflake {
          position: absolute;
          top: -10px;
          background: white;
          border-radius: 50%;
          animation: fall linear infinite;
        }

        @keyframes fall {
          0% {
            transform: translateY(-10px) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
      <div className="snowfall-container">
        {snowflakes}
      </div>
    </>
  );
};

export default Snowfall;
