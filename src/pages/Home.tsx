import React from 'react';
import Header from '../components/Header';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      {/* Import the Header here */}
      <Header />

      {/* Main Content Area */}
      <main className="flex items-center justify-center h-[calc(100vh-6rem)]">
        <h1 className="text-4xl font-bold text-brand-gold">
          Welcome to the Home Page
        </h1>
      </main>
    </div>
  );
};

export default Home;