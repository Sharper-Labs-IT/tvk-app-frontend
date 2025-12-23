import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Lock, Gamepad2, Star, Infinity, PlayCircle, Award, Radio, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MembershipPlan: React.FC = () => {
  const navigate = useNavigate();

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
    // UPDATED: 'pb-0' on mobile ensures the image at the bottom sits flush at the end
    <section className="relative w-full min-h-[600px] pt-10 pb-0 lg:py-20 overflow-hidden bg-brand-dark flex items-center justify-center">
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
        {/* Main Layout: Image Left | Free Center | Paid Right */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
          {/* 1. Vijay Image (Left Side - Desktop Only) */}
          <motion.div className="hidden lg:block w-1/3 max-w-[350px]" variants={itemVariants}>
            <img
              src="/images/VijayImg1.png"
              alt="Thalapathy Vijay"
              className="w-full h-auto object-contain drop-shadow-2xl"
            />
          </motion.div>

          {/* 2. Free Membership Column */}
          <motion.div
            className="w-full max-w-md lg:w-1/3 flex flex-col items-center"
            variants={itemVariants}
          >
            {/* Title Outside Card */}
            <h3 className="text-2xl font-bold text-white mb-4 lg:mb-6 text-center">
              Free Membership
            </h3>

            {/* Card - Fixed Height */}
            <div className="w-full lg:h-[380px] bg-gray-200/90 rounded-3xl p-6 lg:p-8 shadow-lg backdrop-blur-sm flex flex-col justify-center items-center text-center">
              {/* Content Container */}
              <div className="w-full">
                {/* Top Icons */}
                <div className="flex justify-center gap-6 mb-6 lg:mb-8 text-white">
                  <Lock size={90} strokeWidth={1.5} />
                  <Gamepad2 size={90} strokeWidth={1.5} />
                  <Star size={90} strokeWidth={1.5} />
                </div>

                {/* List Features */}
                <ul className="inline-block space-y-4 text-gray-800 font-medium text-sm mb-8 lg:mb-10 text-left px-4">
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                    Limited content access
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-black rounded-full"></span>3 game play per day
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-black rounded-full"></span>
                    Basic badges
                  </li>
                </ul>

                <button
                  onClick={() => handleNavigation('/signup')}
                  className="w-full py-3 px-6 bg-white text-black font-bold rounded-full shadow-md hover:bg-gray-50 transition-colors text-lg block"
                >
                  Join Free
                </button>
              </div>
            </div>
          </motion.div>

          {/* 3. Super Fan Column */}
          <motion.div
            className="w-full max-w-md lg:w-1/3 flex flex-col items-center"
            variants={itemVariants}
          >
            <h3 className="text-2xl font-bold text-center mb-4 lg:mb-6">
              <span className="text-brand-gold">Super Fan</span>
              <span className="text-brand-goldDark"> – $9.99/month</span>
            </h3>

            {/* Card */}
            <div className="w-full lg:h-[380px] bg-black border-2 border-brand-gold rounded-3xl p-1 relative shadow-[0_0_30px_rgba(182,141,64,0.3)] flex flex-col">
              <div className="bg-black rounded-[20px] p-6 lg:p-8 pt-8 lg:pt-10 w-full h-full flex flex-col justify-center">
                {/* Content */}
                <div className="w-full text-center space-y-1 mb-6 lg:mb-8">
                  <div className="flex items-center justify-center gap-3 text-white">
                    <Infinity className="text-brand-gold" size={32} />
                    <span className="text-sm font-medium">Unlimited game plays</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-white">
                    <Zap className="text-brand-gold" size={32} />
                    <span className="text-sm font-medium">Double reward points</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-white">
                    <PlayCircle className="text-brand-gold" size={32} />
                    <span className="text-sm font-medium">Exclusive content</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-white">
                    <Radio className="text-brand-gold" size={32} />
                    <span className="text-sm font-medium">Livestream access</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-white">
                    <Award className="text-brand-gold" size={32} />
                    <span className="text-sm font-medium">Premium digital badges</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 text-white">
                    <Clock className="text-brand-gold" size={32} />
                    <span className="text-sm font-medium">Early access to events</span>
                  </div>
                </div>

                <button
                  onClick={() => handleNavigation('/membership')}
                  className="w-full py-3 px-6 btn-gold-gradient text-black font-bold rounded-full shadow-[0_4px_14px_rgba(230,198,91,0.4)] hover:shadow-[0_6px_20px_rgba(230,198,91,0.6)] transform hover:-translate-y-0.5 transition-all duration-200 text-lg"
                >
                  Become a Super Fan
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mobile Only Image - Positioned at very END of component */}
        <motion.div
          className="block lg:hidden w-full max-w-[280px] mx-auto mt-10"
          variants={itemVariants}
        >
          <img src="/images/VijayImg1.png" alt="Vijay" className="w-full h-auto drop-shadow-xl" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default MembershipPlan;
