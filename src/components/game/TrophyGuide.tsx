import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Zap, TrendingUp, Info } from 'lucide-react';

const TrophyGuide: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<string>('PLATINUM');

  const scrollToFeatures = () => {
    const featuresSection = document.querySelector('#features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const trophyTiers = [
    {
      name: 'PLATINUM',
      icon: '💎',
      color: 'from-slate-300 via-slate-100 to-slate-300',
      textColor: 'text-slate-100',
      borderColor: 'border-slate-300/30',
      glowColor: 'shadow-slate-300/20',
      description: 'The ultimate achievement! Reserved for true gaming legends.',
      requirement: 'Highest scores across all games',
      examples: [
        { game: 'Space Invaders', score: '10,000+' },
        { game: 'City Defender', score: '5,000+' },
        { game: 'Whack-a-Mole', score: '3,000+' }
      ]
    },
    {
      name: 'GOLD',
      icon: '🥇',
      color: 'from-yellow-400 via-yellow-200 to-yellow-400',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-400/30',
      glowColor: 'shadow-yellow-400/20',
      description: 'Exceptional performance! You\'re among the elite players.',
      requirement: 'High scores in featured games',
      examples: [
        { game: 'Space Invaders', score: '5,000+' },
        { game: 'City Defender', score: '2,000+' },
        { game: 'Whack-a-Mole', score: '2,000+' }
      ]
    },
    {
      name: 'SILVER',
      icon: '🥈',
      color: 'from-gray-400 via-gray-200 to-gray-400',
      textColor: 'text-gray-400',
      borderColor: 'border-gray-400/30',
      glowColor: 'shadow-gray-400/20',
      description: 'Great job! You\'re developing solid gaming skills.',
      requirement: 'Good scores across multiple games',
      examples: [
        { game: 'Space Invaders', score: '2,500+' },
        { game: 'City Defender', score: '1,000+' },
        { game: 'Whack-a-Mole', score: '1,000+' }
      ]
    },
    {
      name: 'BRONZE',
      icon: '🥉',
      color: 'from-orange-600 via-orange-400 to-orange-600',
      textColor: 'text-orange-500',
      borderColor: 'border-orange-500/30',
      glowColor: 'shadow-orange-500/20',
      description: 'First steps to greatness! Keep playing to improve.',
      requirement: 'Entry-level achievement scores',
      examples: [
        { game: 'Space Invaders', score: '1,000+' },
        { game: 'City Defender', score: '500+' },
        { game: 'Whack-a-Mole', score: '500+' }
      ]
    }
  ];

  const howToEarn = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Play Games',
      description: 'Access our exclusive gaming zone and start playing',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Score High',
      description: 'Beat the threshold scores to unlock trophies',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Earn Trophies',
      description: 'Collect trophies and climb the leaderboard',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Become Legend',
      description: 'Compete with others and become a VJ gaming champion',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const selectedTierData = trophyTiers.find(tier => tier.name === selectedTier) || trophyTiers[0];

  return (
    <section className="relative min-h-screen w-screen overflow-hidden bg-gradient-to-b from-black via-[#0a0a1f] to-black py-20">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-full border border-yellow-500/30 mb-6">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">Trophy System</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
            Earn Trophies & Climb the Ranks
          </h2>
          <p className="text-gray-400 text-lg md:text-xl max-w-3xl mx-auto">
            Compete in our exclusive gaming zone, achieve high scores, and collect trophies to prove you're a true VJ fan!
          </p>
        </motion.div>

        {/* How to Earn Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {howToEarn.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                style={{ background: `linear-gradient(to bottom right, ${step.color})` }}
              />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 h-full">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 font-bold text-sm">
                  {index + 1}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trophy Tiers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
            Trophy Tiers
          </h3>
          <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
            Each game has four trophy tiers based on your score. Click on a tier to see the requirements.
          </p>

          {/* Tier Selector */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {trophyTiers.map((tier) => (
              <motion.button
                key={tier.name}
                onClick={() => setSelectedTier(tier.name)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative px-8 py-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedTier === tier.name
                    ? `${tier.borderColor} bg-gradient-to-br ${tier.color} shadow-xl ${tier.glowColor}`
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{tier.icon}</span>
                  <span className={`font-bold text-lg ${selectedTier === tier.name ? 'text-black' : 'text-white'}`}>
                    {tier.name}
                  </span>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Selected Tier Details */}
          <motion.div
            key={selectedTier}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className={`relative bg-gradient-to-br ${selectedTierData.color} rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-start gap-6 mb-8">
                <div className="text-7xl md:text-8xl">{selectedTierData.icon}</div>
                <div className="flex-1">
                  <h4 className="text-4xl md:text-5xl font-bold text-black mb-4">{selectedTierData.name}</h4>
                  <p className="text-black/80 text-lg md:text-xl mb-2">{selectedTierData.description}</p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/10 rounded-lg">
                    <Info className="w-4 h-4" />
                    <span className="text-sm font-semibold">{selectedTierData.requirement}</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/10 backdrop-blur-sm rounded-2xl p-6">
                <h5 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Score Requirements by Game
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {selectedTierData.examples.map((example, index) => (
                    <div key={index} className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-black/10">
                      <div className="text-sm text-black/70 mb-1">{example.game}</div>
                      <div className="text-2xl font-bold text-black">{example.score}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl p-12 border border-white/10"
        >
          <Trophy className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h3>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join the gaming zone now and start earning trophies. Compete with fellow VJ fans and show everyone you're the ultimate champion!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={scrollToFeatures}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Play Games Now
            </button>
            <a
              href="/leaderboard"
              className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition-all duration-300"
            >
              View Leaderboard
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default TrophyGuide;
