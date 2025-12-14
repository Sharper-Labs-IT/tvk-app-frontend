import React from 'react';
import Header from '../components/Header';

const Events: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Header />

      <main className="container mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold mb-10 text-center">
            <span className="text-gradient-gold">Upcoming Events</span>
        </h1>

        <div className="space-y-4 max-w-4xl mx-auto">
            {['Grand Inauguration', 'Fan Meet & Greet', 'Charity Drive'].map((event, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-900 p-6 rounded-lg border-l-4 border-brand-gold">
                    <div>
                        <h3 className="text-2xl font-bold">{event}</h3>
                        <p className="text-gray-400">Location: Chennai | Date: To be announced</p>
                    </div>
                    <button className="px-6 py-2 border border-brand-gold text-brand-gold rounded hover:bg-brand-gold hover:text-black transition-colors">
                        RSVP
                    </button>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
};

export default Events;