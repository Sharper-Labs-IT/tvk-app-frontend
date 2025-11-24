import React from 'react';
// We don't need Header import here anymore, it's inside HomeHero
import HomeHero from '../components/HomeHero';
import Footer from '../components/Footer';

const Home: React.FC = () => {
  return (
    <main>
      <HomeHero />
      <Footer/>
    </main>
  );
};

export default Home;