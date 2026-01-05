import React from 'react';
import HomeHero from '../components/HomeHero';
import Footer from '../components/Footer';
import MembershipPlan from '../components/MembershipPlan';
import Header from '../components/Header';
import WhatYouGet from '../components/WhatYouGet';
import FanOfMonth from '../components/FanOfMonth';
import MembersExclusiveBlog from '../components/MembersExclusiveBlog';
import GameSection from '../components/GameSection';
/* import CommunityHighlights from '../components/CommunityHighlights'; */
import Snowfall from '../components/Snowfall';

const Home: React.FC = () => {
  return (
    <main className="min-h-screen bg-brand-dark text-white">
      <Snowfall />
      <Header />
      <HomeHero />
      <MembershipPlan />
      <WhatYouGet />
      <FanOfMonth />
      <MembersExclusiveBlog />
      <GameSection />
      {/* <CommunityHighlights /> */}
      <Footer />
    </main>
  );
};

export default Home;
