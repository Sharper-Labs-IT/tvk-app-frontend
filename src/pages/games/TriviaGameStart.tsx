import React, { useState, useContext } from "react";
import {
  Gamepad2,
  Youtube,
  MessageSquare,
  Smartphone,
  Triangle,
  X,
  Trophy,
  Timer,
  Zap,
  Play,
  HelpCircle,
  Snowflake,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BlurText from "../../components/BlurText"; // Assuming this exists
import TextType from "../../components/TextType"; // Assuming this exists
import { useGameAccess } from '../../hooks/useGameAccess';
import GameAccessModal from '../../components/common/GameAccessModal';
import { AuthContext } from '../../context/AuthContext';

const TriviaGameStart: React.FC = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { checkAccess, consumePlay, remainingFreePlays, isPremium } = useGameAccess();
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [accessCost, setAccessCost] = useState(0);
  const { user } = useContext(AuthContext) || {};
  const userCoins = user?.coins || 0;

  const handlePlayClick = () => {
    const { allowed, reason, cost } = checkAccess();
    if (allowed) {
      consumePlay(false);
      navigate('/game/trivia/start');
    } else {
      if (reason === 'limit_reached' || reason === 'no_coins') {
        setAccessCost(cost);
        setShowAccessModal(true);
      } else if (reason === 'not_logged_in') {
          navigate('/login');
      }
    }
  };

  const handlePayToPlay = async () => {
      const success = await consumePlay(true);
      if (success) {
          setShowAccessModal(false);
          navigate('/game/trivia/start');
      } else {
          alert("Not enough coins!");
      }
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-900 text-white font-sans overflow-hidden selection:bg-yellow-500/30">
      <GameAccessModal 
        isOpen={showAccessModal}
        onClose={() => setShowAccessModal(false)}
        onPay={handlePayToPlay}
        cost={accessCost}
        userCoins={userCoins}
      />
      {/* --- BACKGROUND LAYERS --- */}
      
      {/* 1. Main Hero Image */}
      <div
        className="absolute inset-0 bg-cover bg-center z-0 scale-105 animate-subtle-zoom"
        style={{
          backgroundImage: "url('/img/trivia-hero.webp')",
        }}
      />

      {/* 2. Gradient Overlays for Readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-slate-900/90 z-0" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-slate-900/80 z-0" />

      {/* 3. Tech/Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10 z-0 pointer-events-none" 
        style={{ 
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }} 
      />

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* HEADER */}
        <header className="flex justify-between items-center px-6 py-6 md:px-12 backdrop-blur-sm border-b border-white/5">
          <div
            onClick={() => navigate("/game")}
            className="group flex items-center gap-3 cursor-pointer"
          >
            <div className="bg-white/10 group-hover:bg-yellow-400 text-white group-hover:text-black p-2 rounded-full transition-all duration-300 border border-white/10">
              <Triangle className="w-4 h-4 fill-current -rotate-90" />
            </div>
            <span className="text-sm md:text-lg font-bold tracking-wider uppercase opacity-80 group-hover:opacity-100 transition-opacity">
              Back to Menu
            </span>
          </div>

          {/* Desktop Nav Stats */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md border border-white/10 px-5 py-2 rounded-full shadow-lg shadow-black/20">
              <span className="text-yellow-400 drop-shadow-glow">🪙</span>
              <span className="text-white font-bold tracking-wide">{userCoins.toLocaleString()}</span>
            </div>
            
            <button className="flex items-center gap-3 hover:bg-white/5 transition-all px-4 py-2 rounded-full border border-transparent hover:border-white/10">
              <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-white/20">
                {(user?.nickname || 'usernull').charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-200">{user?.nickname || 'usernull'}</span>
            </button>
          </nav>
        </header>

        {/* MAIN HERO SECTION */}
        <main className="flex-grow flex flex-col justify-center items-center text-center px-4 relative">
          
          {/* Animated Glow behind Title */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-600/30 blur-[100px] rounded-full -z-10" />

          {/* Title */}
            <div className="mb-2">
            <BlurText
              text="TVK TRIVIA BATTLE"
              delay={100}
              animateBy="letters"
              direction="top"
              className="text-5xl md:text-6xl font-black tracking-tighter drop-shadow-2xl text-white"
            />
            </div>

          {/* Subtitle / Typing Text */}
          <div className="h-20 flex items-start justify-center"> {/* Fixed height to prevent layout shift */}
            <TextType
              text={[
                "Think you know VJ?",
                "Prove your loyalty",
                "Beat the clock",
                "Become the GOAT",
              ]}
              typingSpeed={50}
              pauseDuration={2000}
              showCursor={true}
              cursorCharacter="_"
              className="text-yellow-400/90 text-lg md:text-2xl font-mono font-bold tracking-widest uppercase shadow-black drop-shadow-md"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-6 mt-8 w-full max-w-md md:max-w-none justify-center items-center">
            {/* <TargetCursor
              spinDuration={2}
              hideDefaultCursor={true}
              parallaxOn={true}
            /> */}
            
            {/* Primary Button */}
            <button 
                onClick={handlePlayClick} 
                className="cursor-target group relative w-full md:w-auto px-10 py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-lg uppercase tracking-widest clip-path-slant transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(234,179,8,0.6)]"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%)' }}
            >
              <span className="flex items-center justify-center gap-2">
                <Play className="w-5 h-5 fill-black" /> Start Quiz
              </span>
            </button>

            {/* Secondary Button */}
            <button 
                onClick={() => setShowModal(true)} 
                className="cursor-target group w-full md:w-auto px-10 py-4 bg-transparent border border-white/30 hover:border-white hover:bg-white/10 text-white font-bold text-lg uppercase tracking-widest transition-all duration-300 backdrop-blur-sm"
                style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%)' }}
            >
              <span className="flex items-center justify-center gap-2">
                <HelpCircle className="w-5 h-5" /> How to Play
              </span>
            </button>
          </div>
          {!isPremium && (
            <p className="mt-4 text-gray-400 text-sm">
              Free Plays Remaining: <span className="text-yellow-400 font-bold">{remainingFreePlays}</span>
            </p>
          )}
          {isPremium && (
            <p className="mt-4 text-green-400 text-sm flex items-center gap-2">
              <span>⭐</span> You're a Super Fan of VJ! Enjoy unlimited access to all games.
            </p>
          )}

          {/* Daily Challenge Card - Floating Effect */}
          {/* <div className="mt-16 md:mt-24 w-full max-w-2xl animate-bounce-slow">
            <div className="relative group cursor-pointer overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-900/60 backdrop-blur-xl p-1 transition-all hover:border-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">

                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-6 py-4 rounded-xl bg-slate-900/40">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-600/20 rounded-lg text-purple-300 border border-purple-500/20">
                            <Zap className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                        <div className="text-left">
                            <div className="text-xs text-purple-300 font-bold uppercase tracking-wider mb-1">Daily Challenge</div>
                            <div className="text-lg md:text-xl font-bold text-white">The "Leo" Das Sprint</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 bg-black/20 px-3 py-1 rounded-full border border-white/5">
                        <Timer className="w-4 h-4" /> <span>Resets in 04:22:15</span>
                    </div>
                </div>
            </div>
          </div> */}
        </main>

        {/* FOOTER */}
        <footer className="px-8 py-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs md:text-sm font-medium border-t border-white/5 bg-black/20 backdrop-blur-sm">
          <div>© 2025 TVK Gaming Ecosystem. All rights reserved.</div>

          <div className="flex items-center gap-6">
            {[Smartphone, MessageSquare, Youtube, Gamepad2].map((Icon, i) => (
              <button key={i} className="hover:text-yellow-400 hover:scale-110 transition-all duration-300">
                <Icon className="w-5 h-5" />
              </button>
            ))}
          </div>
        </footer>
      </div>

      {/* --- MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setShowModal(false)}
          />
          
          <div className="relative bg-slate-900 border border-white/10 rounded-3xl shadow-2xl shadow-black/50 max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-6 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-3">
                <Gamepad2 className="text-yellow-500" /> Game Rules
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white hover:rotate-90 transition-all duration-300 p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">
              
              <div className="grid md:grid-cols-3 gap-4">
                 {[
                    { icon: Trophy, color: "text-yellow-400", title: "Win Points", desc: "+100 per correct answer" },
                    { icon: Timer, color: "text-blue-400", title: "Speed Run", desc: "15s per question" },
                    { icon: Zap, color: "text-purple-400", title: "Streak", desc: "5x Streak Multiplier" }
                 ].map((item, idx) => (
                     <div key={idx} className="bg-white/5 rounded-xl p-4 text-center border border-white/5 hover:border-white/10 transition-colors">
                        <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
                        <div className="font-bold text-white text-sm">{item.title}</div>
                        <div className="text-xs text-gray-400">{item.desc}</div>
                     </div>
                 ))}
              </div>

              {/* Lifelines Section */}
              <div className="space-y-3">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-yellow-500">►</span> Lifelines
                 </h3>
                 <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: <span className="text-xl">50:50</span>, title: "50/50", desc: "Remove 2 wrong answers" },
                        { icon: <Snowflake className="w-6 h-6" />, title: "Freeze", desc: "Stop the timer" },
                        { icon: <Users className="w-6 h-6" />, title: "Audience", desc: "Ask the crowd" }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-3 text-center border border-white/5 hover:bg-white/10 transition-colors">
                            <div className="h-8 flex items-center justify-center text-blue-400 font-bold mb-2">
                                {item.icon}
                            </div>
                            <div className="font-bold text-white text-xs mb-0.5">{item.title}</div>
                            <div className="text-[10px] text-gray-400 leading-tight">{item.desc}</div>
                        </div>
                    ))}
                 </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="text-yellow-500">►</span> Instructions
                </h3>
                <ol className="space-y-3 text-gray-300 list-decimal list-inside marker:text-yellow-500/50">
                  <li className="pl-2">Read the question carefully regarding Thalapathy Vijay's movies & life.</li>
                  <li className="pl-2">Select the correct answer from the 4 options.</li>
                  <li className="pl-2">Wrong answers reset your <span className="text-purple-400 font-bold">Streak Bonus</span>.</li>
                  <li className="pl-2">Complete the daily challenge to earn the "Verified Fan" badge.</li>
                </ol>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-black font-bold py-4 rounded-xl shadow-lg shadow-yellow-900/20 transform active:scale-95 transition-all"
              >
                I'M READY TO PLAY
              </button>
            </div>
          </div>
        </div>
      )}

        <style>{`
            @keyframes subtle-zoom {
                0% { transform: scale(1); }
                100% { transform: scale(1.05); }
            }
            .animate-subtle-zoom {
                animation: subtle-zoom 20s infinite alternate linear;
            }
            .clip-path-slant {
                clip-path: polygon(10% 0, 100% 0, 100% 80%, 90% 100%, 0 100%, 0 20%);
            }
        `}</style>
    </div>
  );
};

export default TriviaGameStart;