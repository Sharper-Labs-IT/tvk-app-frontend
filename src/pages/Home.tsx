import React from 'react';
// We don't need Header import here anymore, it's inside HomeHero
import HomeHero from '../components/HomeHero';

const Home: React.FC = () => {
  return (
    <main>
      <HomeHero />
    </main>
  );
};

export default Home;