import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Home from '../pages/Home';
import Membership from '../pages/Membership';
import Game from '../pages/Game';
import Events from '../pages/Events';
import Loader from '../components/Loader';
import MemoryChallenge from '../pages/games/MemoryStart';
import ProtectQueenStart from '../pages/games/ProtectQueenStart';
import MemoryGame from '../pages/games/MemoryGame';

const AppRoutes: React.FC = () => {
  const location = useLocation();
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname]); 

  return (
    <>
      {isLoading && <Loader />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/game" element={<Game />} />
        <Route path="/game/memory-challenge" element={<MemoryChallenge />} />
        <Route path="/game/memory-challenge/start" element={<MemoryGame />} />
        <Route path="/game/protect-queen" element={<ProtectQueenStart />} />
        <Route path="/events" element={<Events />} />
      </Routes>
    </>
  );
};

export default AppRoutes;