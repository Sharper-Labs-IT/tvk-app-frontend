import React from 'react';
import { useNavigate } from 'react-router-dom';

const SpaceInvadersGame: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Space Invaders Game</h1>
      <p className="mb-8">Game implementation coming soon...</p>
      <button 
        onClick={() => navigate('/game/protect-area')}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
      >
        Back to Menu
      </button>
    </div>
  );
};

export default SpaceInvadersGame;
