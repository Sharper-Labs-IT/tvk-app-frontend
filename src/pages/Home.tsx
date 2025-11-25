import React from 'react';
// We don't need Header import here anymore, it's inside HomeHero
import HomeHero from '../components/HomeHero';
import Footer from '../components/Footer';
import MembershipPlan from '../components/MembershipPlan';

const Home: React.FC = () => {
  return (
    <main>
      <HomeHero />
      <MembershipPlan/>
      <Footer/>

    </main>
  );
};

export default Home;