import React from 'react';
import HomeHero from '../components/HomeHero';
import Footer from '../components/Footer';
import MembershipPlan from '../components/MembershipPlan';
import Header from '../components/Header';
import WhatYouGet from '../components/WhatYouGet';

const Home: React.FC = () => {
  return (
    <main>
      <Header />
      <HomeHero />
      <MembershipPlan />
      <WhatYouGet />
      <Footer />
    </main>
  );
};

export default Home;
