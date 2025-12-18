import React, { useState, useEffect } from 'react';
import Loader from '../components/Loader';
import BlurText from '../components/BlurText';
import { Instagram, Facebook, Youtube } from 'lucide-react';

const Snowfall = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden="true">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="snowflake text-white absolute top-[-10%]"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 10}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
            opacity: Math.random() * 0.6 + 0.2,
            fontSize: `${Math.random() * 10 + 10}px`,
          }}
        >
          {['❄', '❅', '❆'][Math.floor(Math.random() * 3)]}
        </div>
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg) translateX(0); }
          25% { transform: translateY(25vh) rotate(90deg) translateX(15px); }
          50% { transform: translateY(50vh) rotate(180deg) translateX(-15px); }
          75% { transform: translateY(75vh) rotate(270deg) translateX(15px); }
          100% { transform: translateY(110vh) rotate(360deg) translateX(0); }
        }
        .snowflake {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
};

const CircleProgress = ({
  value,
  maxValue,
  label,
}: {
  value: number;
  maxValue: number;
  label: string;
}) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / maxValue) * circumference;

  return (
    <div className="flex flex-col items-center mx-2 md:mx-6 mb-8 relative">
      <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#1f2937" strokeWidth="4" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#eab308"
            strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <span className="text-[10px] md:text-xs uppercase tracking-widest text-yellow-500 font-bold mb-1">
            {label}
          </span>
          <span className="text-4xl md:text-5xl font-bold">{value.toString().padStart(2, '0')}</span>
        </div>
      </div>
    </div>
  );
};

const Countdown: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  // --- FORM STATE ACTIVATED ---
/*   const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState(''); */

  const targetDate = '2025-12-24';

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- HANDLE SUBMIT ACTIVATED ---
 /*  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000)); 
      setStatus('success');
      setMessage("You're on the list! Watch your inbox.");
      setEmail('');
    } catch (error) {
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
  };
 */
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-gray-900 text-white overflow-hidden">
      {/* Background Layer */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/img/countdown.webp")' }}
      >
        <div className="absolute inset-0 bg-black/70 md:bg-black/80"></div>
      </div>

      {/* SNOW ANIMATION LAYER (Z-10) */}
      <Snowfall />

      <div className="z-20 container mx-auto px-4 text-center flex flex-col items-center">
        <div className="mb-8">
          <img
            src="/images/tvk-logo.png"
            alt="TVK Logo"
            className="h-24 md:h-32 w-auto object-contain drop-shadow-lg"
          />
        </div>

        <BlurText
          text="Something Awesome Is Coming Soon"
          delay={350}
          animateBy="words"
          direction="top"
          className="text-2xl md:text-5xl font-extrabold tracking-tight drop-shadow-2xl mb-4 justify-center items-center"
        />
        <h2 className="text-yellow-500 text-xl md:text-2xl font-semibold mb-4 tracking-widest uppercase">
          🎄 December 24, 2025
        </h2>
        <p className="text-gray-300 text-base md:text-md mb-12 font-light max-w-xl">
          Be among the first to witness the future of community, rewards, and entertainment. Stay tuned for something truly unique.
        </p>

        <div className="flex flex-wrap justify-center mb-10 w-full">
          <CircleProgress value={timeLeft.days} maxValue={365} label="DAYS" />
          <CircleProgress value={timeLeft.hours} maxValue={24} label="HOURS" />
          <CircleProgress value={timeLeft.minutes} maxValue={60} label="MINUTES" />
          <CircleProgress value={timeLeft.seconds} maxValue={60} label="SECONDS" />
        </div>

        {/* --- FORM SECTION ACTIVATED --- */}
       {/*  <div className="w-full max-w-lg relative mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row shadow-2xl bg-white/5 backdrop-blur-sm rounded-sm">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              className="flex-grow bg-transparent border-2 border-gray-600 border-r-0 md:border-r-0 border-b-0 md:border-b-2 text-white px-4 py-3 placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="bg-yellow-500 text-black font-bold uppercase tracking-wider px-8 py-3 hover:bg-yellow-400 transition-colors disabled:bg-yellow-700 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
            >
              {status === 'loading' ? (
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : status === 'success' ? (
                "Joined"
              ) : (
                "Submit"
              )}
            </button>
          </form>
          
          <div className="hidden md:block absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>

          {message && (
            <div className={`mt-4 text-sm font-medium animate-pulse ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message}
            </div>
          )}
        </div> */}

        {/* Social Icons using Lucide */}
        <div className="text-gray-500 text-sm">
          <div className="flex justify-center gap-6 mb-4">
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-yellow-500 transition-colors">
              <Instagram className="h-7 w-7" />
            </a>
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="hover:text-yellow-500 transition-colors">
              <Facebook className="h-7 w-7" />
            </a>
            <a href="https://www.youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hover:text-yellow-500 transition-colors">
              <Youtube className="h-7 w-7" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Countdown;