import React from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  X, 
  Crown, 
  Gamepad2, 
  Zap, 
  Star 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MembershipModal: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full h-full flex flex-col items-center justify-center bg-brand-dark overflow-hidden">
      
      <div className="absolute inset-0 z-0">
        <img 
          src="/img/hero.webp" 
          alt="Membership Background" 
          className="w-full h-full object-cover opacity-60" 
        />
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" />
      </div>

      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-500/20 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="container mx-auto px-4 relative z-10 flex flex-col justify-center h-full py-6 md:py-8">
        
        {/* Header Section */}
        <div className="text-center mb-4 md:mb-6 shrink-0">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl font-black text-white mb-1 tracking-tight uppercase drop-shadow-lg"
          >
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-600">Fan Level</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-blue-100/80 max-w-lg mx-auto text-xs font-medium"
          >
            Unlock the full potential of the TVK Universe.
          </motion.p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto w-full shrink-0 items-stretch">
          
          {/* --- FREE TIER --- */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative flex flex-col"
          >
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 flex flex-col h-full hover:bg-white/10 transition-all duration-300 shadow-2xl">
              
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                  <Gamepad2 size={16} />
                </div>
                <div>
                    <h3 className="text-base font-bold text-white leading-tight">Guest Player</h3>
                    <p className="text-gray-400 text-[10px]">Not a True Fan?</p>
                </div>
              </div>

              <div className="mb-4">
                <span className="text-2xl font-bold text-white">Free</span>
              </div>

              <ul className="space-y-2 mb-4 flex-1">
                <FeatureItem text="3 Game Plays per Day" active />
                <FeatureItem text="Basic Leaderboard Access" active />
                <FeatureItem text="Standard Badge" active />
                <FeatureItem text="Reward Multipliers" active={false} />
                <FeatureItem text="Event Access" active={false} />
              </ul>

              <button 
                onClick={() => navigate('/signup')}
                className="w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 transition-all border border-white/5"
              >
                Join Free
              </button>
            </div>
          </motion.div>

          {/* --- PRO TIER --- */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative flex flex-col"
          >
            <div className="absolute -inset-[1px] bg-gradient-to-b from-yellow-400 to-yellow-700 rounded-2xl opacity-75 blur-sm animate-pulse" />
            
            <div className="relative bg-black/80 backdrop-blur-xl border border-yellow-500/30 rounded-2xl p-5 flex flex-col h-full overflow-hidden shadow-2xl">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2" />

              <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-lg">
                Popular
              </div>

              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center text-black shadow-lg">
                  <Crown size={16} strokeWidth={2.5} />
                </div>
                <div>
                   <h3 className="text-base font-bold text-white leading-tight">Super Fan</h3>
                   <p className="text-yellow-200/60 text-[10px]">Ultimate experience</p>
                </div>
              </div>

              <div className="mb-4 relative z-10">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">€9.99</span>
                  <span className="text-gray-400 text-[10px]">/month</span>
                </div>
              </div>

              <ul className="space-y-2 mb-4 flex-1 relative z-10">
                <FeatureItem text="Unlimited Game Plays" active highlight />
                <FeatureItem text="2x Reward Points (XP)" active highlight />
                <FeatureItem text="Exclusive Badge" active highlight />
                <FeatureItem text="Priority Event Access" active highlight />
                <FeatureItem text="Monthly Prize Draws" active highlight />
              </ul>

              <button 
                 onClick={() => navigate('/signup')}
                className="relative z-10 w-full py-3 rounded-lg font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-yellow-400 to-yellow-600 text-black shadow-lg hover:scale-[1.02] transition-all transform active:scale-95"
              >
                Join the Elite
              </button>
            </div>
          </motion.div>

        </div>

        <div className="mt-4 text-center shrink-0">
          <p className="text-gray-400 text-[10px] flex items-center justify-center gap-2">
            <Zap size={10} className="text-yellow-500" />
            Cancel anytime.
          </p>
        </div>

      </div>
    </section>
  );
};

const FeatureItem = ({ text, active, highlight = false }: { text: string; active: boolean; highlight?: boolean }) => (
  <li className={`flex items-center gap-2 text-xs ${!active ? 'opacity-40' : ''}`}>
    <div className={`min-w-[14px] h-[14px] rounded-full flex items-center justify-center ${active ? (highlight ? 'bg-yellow-500 text-black' : 'bg-white/20 text-white') : 'bg-white/5 text-gray-500'}`}>
      {active ? <Check size={8} strokeWidth={4} /> : <X size={8} />}
    </div>
    <span className={`${highlight ? 'text-white font-medium' : 'text-gray-300'}`}>{text}</span>
  </li>
);

export default MembershipModal;