import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Star, Users, Video, Bell } from 'lucide-react';
import Footer from '../components/Footer';

import MembershipTireCard from '../components/MembershipTireCard';

import BenefitCard from '../components/BenefitCard';
import { motion, type Variants } from 'framer-motion';
import type { Plan } from '../types/plan';
import axiosClient from '../api/axiosClient';
import MembershipPaymentModal from '../components/MembershipPaymentModal';
import MembershipTermsModal from '../components/MembershipTermsModal';
import MembershipCancelModal from '../components/MembershipCancelModal';
import MembershipCancelledSuccessModal from '../components/MembershipCancelSuccessfulModal';
import MembershipPaymentSuccessModal from '../components/MembershipPaymentSuccessModal';
import { toast } from 'react-hot-toast';
import { getCountryFromMobile } from '../utils/countryHelper';
import { useGeoLocation } from '../hooks/useGeoLocation';

const benefitsContainerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { staggerChildren: 0.12, delayChildren: 0.1, duration: 0.4, ease: 'easeOut' },
  },
};

const benefitItemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: 'easeOut' } },
};

const hardCodedPlans: Plan[] = [
  {
    id: 1,
    name: 'Free Tier',
    description: 'Basic membership with limited access',
    price: '0.00',
    duration_days: 36500,
    status: 1,
    benefits: [
      'Limited Media Content Library',
      'Standard Member Badge',
      '10% Off Merchandise',
      'Introductory Gaming Experience',
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Super Fan Premium',
    description: 'Premium access (30-day subscription)',
    price: '9.99',
    duration_days: 30,
    status: 1,
    benefits: [
      'Access to the Gaming Zone',
      'AI-powered celebrity-style gaming',
      'Exclusive live event streams',
      'Premium content library',
      'Premium Gold member badge',
      '20% merchandise discount',
      'Priority RSVPs',
      'Early access to announcements',
      'Future Super Fan Chapters',
      'AI generated visuals',
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

const MembershipPage: React.FC = () => {
  const { isLoggedIn, user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { countryCode: detectedCountryCode } = useGeoLocation();

  const [selectedCurrency, setSelectedCurrency] = useState<'GBP' | 'USD' | 'EUR'>('GBP');
  const [planPrices, setPlanPrices] = useState<Record<number, string>>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Modals
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);
  const [isFreeMemberRequiredModalOpen, setIsFreeMemberRequiredModalOpen] = useState(false);

  // --- LOGIC: HELPER TO FORMAT DATE ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // --- LOGIC: CHECK MEMBERSHIP STATE ---
  const membershipStatus = useMemo(() => {
    if (!isLoggedIn || !user?.membership) return 'none';

    const isPaidPlan = user.membership.plan_id !== 1;
    const isActive = user.membership.status === 'active';
    const isAutoRenew = user.membership.auto_renew === true;

    if (isPaidPlan && isActive) {
      if (isAutoRenew) return 'active_auto_renew_on';
      return 'active_auto_renew_off'; // This is the "cancelled but still active" grace period
    }

    return 'free';
  }, [isLoggedIn, user]);

  useEffect(() => {
    const fetchPrices = async () => {
      setPricesLoading(true);
      const newPrices: Record<number, string> = {};
      try {
        for (const plan of hardCodedPlans) {
          if (plan.price === '0.00') {
            newPrices[plan.id] = '0.00';
            continue;
          }
          const res = await axiosClient.post('/currency/calculate', {
            plan_id: plan.id,
            currency: selectedCurrency,
          });
          newPrices[plan.id] = res.data.converted_price;
        }
        setPlanPrices(newPrices);
      } catch (err) {
        console.error('Price calculation failed', err);
      } finally {
        setPricesLoading(false);
      }
    };
    fetchPrices();
  }, [selectedCurrency]);

  const handleSubscribeClick = (plan: Plan) => {
    if (plan.id === 1) {
      isLoggedIn ? navigate('/') : navigate('/login');
      return;
    }

    // Check if user is logged in and if they are a free member
    if (!isLoggedIn) {
      setIsFreeMemberRequiredModalOpen(true);
      return;
    }

    // Check if user is a free member (plan_id = 1) before allowing Super Fan subscription
    if (user?.membership?.plan_id !== 1) {
      setIsFreeMemberRequiredModalOpen(true);
      return;
    }

    const isIndia = user?.mobile
      ? getCountryFromMobile(user.mobile) === 'India'
      : detectedCountryCode === 'IN';
    if (isIndia) {
      toast.error('Membership purchase is not available for users in India.');
      return;
    }

    // Handle clicking a paid plan card when already subscribed
    if (membershipStatus === 'active_auto_renew_on') {
      setIsCancelModalOpen(true);
      return;
    }

    // If it's active but auto-renew is off, button will be disabled, so this shouldn't even trigger.
    if (membershipStatus === 'active_auto_renew_off') return;

    setSelectedPlan(plan);
    setIsTermsModalOpen(true);
  };

  const handleCancelMembership = async () => {
    try {
      await axiosClient.post('/membership/cancel');
      await refreshUser(); // This updates user.membership in global state
      setIsCancelModalOpen(false);
      setIsSuccessModalOpen(true);
      toast.success('Auto-renewal cancelled successfully.');
    } catch (err) {
      toast.error('Failed to cancel membership.');
    }
  };

  const handlePaymentSuccess = async () => {
    await refreshUser();
    setIsPaymentOpen(false);
    setIsPaymentSuccessOpen(true);
    toast.success('Welcome to Super Fan!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050716] to-[#02030b] text-slate-100">
      <Header />

      <section className="mx-auto max-w-6xl xl:max-w-7xl 2xl:max-w-[90vw] px-4 py-16 2xl:py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold md:text-5xl 2xl:text-7xl">
            Choose Your Membership Plan
          </h1>
          <p className="mt-4 text-base text-slate-300 md:text-lg 2xl:text-2xl">
            Unlock exclusive TVK experiences and events.
          </p>
        </div>

        <div className="mt-10 2xl:mt-16 flex flex-col items-center gap-6">
          <div className="flex items-center gap-3 bg-[#07091a] p-1.5 rounded-2xl border border-slate-800">
            <span className="pl-3 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
              Currency:
            </span>
            {(['GBP', 'USD', 'EUR'] as const).map((cur) => (
              <button
                key={cur}
                onClick={() => setSelectedCurrency(cur)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  selectedCurrency === cur
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cur === 'GBP' ? '£' : cur === 'EUR' ? '€' : '$'} {cur}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:gap-10 2xl:gap-16">
          {hardCodedPlans.map((plan) => {
            const isPlanFree = plan.id === 1;
            const isPlanPaid = plan.id !== 1;
            const isIndia = detectedCountryCode === 'IN';

            // --- REFINED BUTTON LOGIC ---
            const buttonText = (() => {
              if (isIndia) return 'Not Available';

              if (isPlanPaid) {
                if (membershipStatus === 'active_auto_renew_on') return 'Cancel Auto-Renewal';
                if (membershipStatus === 'active_auto_renew_off') {
                  return `Active until ${formatDate(user?.membership?.end_date || '')}`;
                }
                return 'Become a Super Fan';
              }

              if (isPlanFree) {
                if (membershipStatus.startsWith('active')) return 'Included';
                return isLoggedIn ? 'Current Plan' : 'Join Free';
              }

              return 'Become a Super Fan';
            })();

            // Button is disabled if:
            // 1. India user
            // 2. Free card and user is already logged in (Free or Paid)
            // 3. Paid card and user already cancelled auto-renew but plan is still running (grace period)
            const buttonDisabled =
              isIndia ||
              (isPlanFree && isLoggedIn) ||
              (isPlanPaid && membershipStatus === 'active_auto_renew_off');

            const symbol =
              selectedCurrency === 'GBP' ? '£' : selectedCurrency === 'EUR' ? '€' : '$';
            const priceLabel = isPlanFree
              ? 'Free'
              : `${symbol}${planPrices[plan.id] || plan.price}`;

            return (
              <MembershipTireCard
                key={plan.id}
                name={plan.name}
                tagline={plan.description}
                priceLabel={pricesLoading && !isPlanFree ? '...' : priceLabel}
                priceSuffix={isPlanFree ? '/ Lifetime' : `/ Monthly (${selectedCurrency})`}
                features={(plan.benefits || []).map((b) => ({ label: b, available: true }))}
                highlight={isPlanPaid}
                badgeLabel={isPlanPaid ? 'Most Popular' : undefined}
                onSubscribe={() => handleSubscribeClick(plan)}
                buttonText={buttonText}
                buttonDisabled={buttonDisabled}
              />
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mx-auto max-w-6xl px-4 pb-20 2xl:pb-32">
        <div className="mt-10 text-center md:mt-16 2xl:mt-24">
          <h2 className="text-3xl font-bold md:text-4xl 2xl:text-6xl">
            Why Choose TVK Membership?
          </h2>
        </div>
        <motion.div
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={benefitsContainerVariants}
          initial="hidden"
          whileInView="show"
        >
          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Star />}
              title="Exclusive Contents"
              description="Join live streams and special TVK events"
              tags={['Free', 'Super Fan']}
            />
          </motion.div>
          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Users />}
              title="Priority Fan Meetups"
              description="Super Fans get priority entry"
              tags={['Super Fan']}
            />
          </motion.div>
          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Bell />}
              title="Early Announcements"
              description="Be the first to know about drops."
              tags={['Super Fan']}
            />
          </motion.div>
          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Video />}
              title="Premium Video Content"
              description="Unlock HD/4K documentaries."
              tags={['Super Fan']}
            />
          </motion.div>
        </motion.div>
      </section>

      <MembershipCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelMembership}
      />
      <MembershipCancelledSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />
      <MembershipPaymentSuccessModal
        isOpen={isPaymentSuccessOpen}
        onClose={() => setIsPaymentSuccessOpen(false)}
      />
      <MembershipTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onConfirm={() => {
          setIsTermsModalOpen(false);
          setIsPaymentOpen(true);
        }}
      />
      <MembershipPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        plan={selectedPlan}
        currency={selectedCurrency}
        onSuccess={handlePaymentSuccess}
      />
      
      {/* Free Member Required Modal */}
      {isFreeMemberRequiredModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-tvk-dark-card border border-tvk-accent-gold/30 rounded-2xl max-w-md w-full shadow-2xl shadow-gold/20 animate-fadeIn">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3 mb-2">
                {/* <div className="w-12 h-12 bg-tvk-accent-gold/20 rounded-xl flex items-center justify-center border border-tvk-accent-gold/30">
                  <Star className="w-6 h-6 text-tvk-accent-gold" />
                </div> */}
                <h2 className="text-xl font-bold text-white">Cool! We Know You're a True VJ Fan! 🎉</h2>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-300 leading-relaxed">
                We love your enthusiasm! But before you become a <span className="text-tvk-accent-gold font-bold">Super Fan</span>, 
                you need to join as a <span className="text-green-400 font-semibold">Free Member</span> first.
              </p>
              <p className="text-gray-400 text-sm">
                It only takes a minute! Create your free account and then you'll be able to upgrade to Super Fan Premium.
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 p-6 border-t border-white/10 bg-white/5">
              <button
                onClick={() => setIsFreeMemberRequiredModalOpen(false)}
                className="flex-1 px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsFreeMemberRequiredModalOpen(false);
                  navigate('/login');
                }}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-tvk-accent-gold-dark to-tvk-accent-gold hover:from-tvk-accent-gold hover:to-[#FFC43A] text-black rounded-lg font-bold transition-all flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4" />
                Join Free Now
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};
//
export default MembershipPage;
