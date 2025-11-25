import React from 'react';
import HomeHero from '../components/HomeHero';
import Footer from '../components/Footer';
import MembershipPlan from '../components/MembershipPlan';
import Header from '../components/Header';

const Home: React.FC = () => {
  return (
    <main>
      <Header />
      <HomeHero />
      <MembershipPlan />
      <Footer />
    </main>
  );
};

export default Home;
