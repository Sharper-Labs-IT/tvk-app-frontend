import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Lock, Gamepad2, Star, Infinity, PlayCircle, Award, Radio, Clock, Zap, Calendar, Newspaper, Users, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MembershipPlan: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  const isSuperFan = (user?.membership_tier === 'super_fan' || user?.membership_tier === 'Super Fan');

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  // Helper to navigate and scroll to top
  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    // UPDATED: 'xl:pb-0' ensures the desktop image touches the very bottom edge
    <section className="relative w-full min-h-[600px] pt-10 pb-0 xl:pt-20 xl:pb-0 overflow-hidden bg-brand-dark flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/MembershipPlaneBack.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>

      {/* Content Container */}
      <motion.div
        className="relative z-10 container mx-auto px-4"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Section Header */}
        <motion.div className="text-center mb-8 xl:mb-12" variants={itemVariants}>
          <h2 className="text-3xl md:text-4xl font-bold text-brand-gold mb-3">
            Join the TVK Global Fan Community
          </h2>
          <p className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto mb-2">
            Connect with fans worldwide. Discover exclusive content, events, and experiences all in one place
          </p>
          <p className="text-brand-goldDark font-semibold text-lg">
            Free to join.... Upgrade anytime to become a Super Fan
          </p>
        </motion.div>

        {/* Main Layout: Desktop = One Line (Image | Free | Paid), Aligned to Bottom */}
        {/* 'items-end' pushes the image to the bottom line */}
        <div className="flex flex-col xl:flex-row items-center xl:items-end justify-center gap-6 xl:gap-8">
          {/* 1. Vijay Image (Left Side - Desktop Only) */}
          {/* RESTORED: Shows in the same line on desktop */}
          <motion.div className="hidden xl:block w-1/3 max-w-[350px] shrink-0" variants={itemVariants}>
            <img
              src="/images/VijayImg1.png"
              alt="Thalapathy Vijay"
              className="w-full h-auto object-contain drop-shadow-2xl block"
            />
          </motion.div>

          {/* Wrapper for Cards to ensure equal height and alignment */}
          <div className="flex flex-col xl:flex-row items-stretch gap-6 xl:gap-8 w-full max-w-5xl xl:mb-20">
            {/* 2. Free Membership Column */}
            <motion.div
              className="w-full max-w-md xl:w-1/2 flex flex-col"
              variants={itemVariants}
            >
              {/* Card - Adaptive Height */}
              <div className="w-full h-full min-h-[380px] bg-gray-200/90 rounded-3xl p-6 xl:p-8 pt-8 xl:pt-10 shadow-lg backdrop-blur-sm flex flex-col justify-between items-center text-center">
                <div className="w-full flex flex-col h-full">
                  {/* Title & Subtitle */}
                  <div className="min-h-[60px] flex flex-col justify-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      Free Membership
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Perfect for fans who want to stay connected
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="mb-6">
                    <span className="text-4xl font-black text-gray-800 tracking-tight">FREE</span>
                  </div>

                  {/* Top Icons */}
                  <div className="flex justify-center gap-4 sm:gap-6 mb-6 xl:mb-8 text-gray-400">
                    <Lock className="w-16 h-16 sm:w-20 sm:h-20 xl:w-[90px] xl:h-[90px]" strokeWidth={1.5} />
                    <Gamepad2 className="w-16 h-16 sm:w-20 sm:h-20 xl:w-[90px] xl:h-[90px]" strokeWidth={1.5} />
                    <Star className="w-16 h-16 sm:w-20 sm:h-20 xl:w-[90px] xl:h-[90px]" strokeWidth={1.5} />
                  </div>

                  {/* List Features */}
                  <ul className="inline-block space-y-4 text-gray-800 font-medium text-sm mb-8 xl:mb-10 text-left px-2 sm:px-4 flex-grow">
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 shrink-0"></span>
                      <span>Introductory Gaming Experience</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 shrink-0"></span>
                      <span>Standard Member Badge</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 shrink-0"></span>
                      <span>10% Off Merchandise</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 bg-black rounded-full mt-2 shrink-0"></span>
                      <span>Limited Media Content Library</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => !isLoggedIn && handleNavigation('/signup')}
                    disabled={isLoggedIn}
                    className={`w-full py-3 px-6 font-bold rounded-full shadow-md transition-colors text-lg block mt-auto ${
                      isLoggedIn
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-50'
                    }`}
                  >
                    {isLoggedIn ? 'Already Joined' : 'Join Free'}
                  </button>
                  {/* Spacer to align buttons with Super Fan card */}
                  <p className="text-xs text-center mt-3 invisible">
                    Cancel anytime before your next billing date.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 3. Super Fan Column */}
            <motion.div
              className="w-full max-w-md xl:w-1/2 flex flex-col"
              variants={itemVariants}
            >
              {/* Card */}
              <div className="w-full h-full min-h-[380px] bg-black border-2 border-brand-gold rounded-3xl p-1 relative shadow-[0_0_30px_rgba(182,141,64,0.3)] flex flex-col">
                <div className="bg-black rounded-[20px] p-6 xl:p-8 pt-8 xl:pt-10 w-full h-full flex flex-col justify-between">
                  {/* Title & Subtitle */}
                  <div className="text-center min-h-[60px] flex flex-col justify-start mb-4">
                    <h3 className="text-2xl font-bold text-brand-gold mb-1">
                      Super Fan Membership
                    </h3>
                    <p className="text-white/80 text-sm">
                      For fans who want the full TVK experience.
                    </p>
                  </div>

                  {/* Price Display */}
                  <div className="flex flex-col items-center mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-brand-gold to-brand-goldDark drop-shadow-sm">
                        £9.99
                      </span>
                      <span className="text-lg font-medium text-white/60">/month</span>
                    </div>
                  </div>

                  {/* UPDATED: Content is Centered in Card, but Items are Left Aligned */}
                  <div className="w-full flex justify-center mb-6 xl:mb-8">
                    <div className="flex flex-col gap-4 text-white items-start w-full">
                      <div className="flex items-center gap-3">
                        <Infinity className="text-brand-gold shrink-0 w-8 h-8" />
                        <span className="text-sm font-medium">Access to the Gaming Zone</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Zap className="text-brand-gold shrink-0 w-8 h-8" />
                        <span className="text-sm font-medium">AI-powered Celebrity Gaming</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <PlayCircle className="text-brand-gold shrink-0 w-8 h-8" />
                        <span className="text-sm font-medium">Exclusive Live Streams</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Radio className="text-brand-gold shrink-0 w-8 h-8" />
                        <span className="text-sm font-medium">Premium Content Library</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Award className="text-brand-gold shrink-0 w-8 h-8" />
                        <span className="text-sm font-medium">Premium Gold Badge</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="text-brand-gold shrink-0 w-8 h-8" />
                        <span className="text-sm font-medium">20% Merchandise Discount</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar className="text-brand-gold shrink-0 w-8 h-8" />
                        <span className="text-sm font-medium">Priority RSVPs</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Newspaper className="text-brand-gold shrink-0 w-8 h-8" />
                        <span className="text-sm font-medium">Early Access to News</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Users className="text-brand-gold shrink-0 w-8 h-8" />
                        <span className="text-sm font-medium">Future Super Fan Chapters</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Sparkles className="text-brand-gold shrink-0 w-8 h-8" />
                        <span className="text-sm font-medium">AI Generated Visuals</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNavigation('/membership')}
                    className="w-full py-3 px-6 btn-gold-gradient text-black font-bold rounded-full shadow-[0_4px_14px_rgba(230,198,91,0.4)] hover:shadow-[0_6px_20px_rgba(230,198,91,0.6)] transform hover:-translate-y-0.5 transition-all duration-200 text-lg mt-auto"
                  >
                    {isSuperFan ? 'Manage Membership' : 'Become a Super Fan'}
                  </button>
                  <p className="text-white/60 text-xs text-center mt-3">
                    Cancel <span className="underline">anytime</span> before your next billing date.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mobile Only Image - Positioned at very END of component */}
        {/* This handles the mobile view requirement separately */}
        <motion.div
          className="block xl:hidden w-full max-w-[280px] mx-auto mt-10"
          variants={itemVariants}
        >
          <img src="/images/VijayImg1.png" alt="Vijay" className="w-full h-auto drop-shadow-xl" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default MembershipPlan;
