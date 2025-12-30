import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Star, Users, Video, Bell } from 'lucide-react';
import Footer from '../components/Footer';

import MembershipTireCard, {
  type BillingPeriod,
  type TierFeature,
} from '../components/MembershipTireCard';

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

// ---------- Framer Motion variants ----------
const benefitsContainerVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
      duration: 0.4,
      ease: 'easeOut',
    },
  },
};

const benefitItemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
};

const hardCodedPlans: Plan[] = [
  {
    id: 1,
    name: 'Free Tier',
    description: 'Basic membership with limited access',
    price: '0.00',
    duration_days: 36500, // lifetime
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
    name: 'Super Fan',
    description: 'Premium access (30-day subscription)',
    price: '9.99',
    duration_days: 30,
    status: 1,
    benefits: [
      'Access to the Gaming Zone – AI-powered celebrity-style gaming experiences',
      'Play in virtual challenges inspired by your favourite star, Our Thalapathy',
      'Watch exclusive live event streams (Full HD)',
      'Access the Premium content library',
      'Premium Gold member badge',
      '20% merchandise discount voucher',
      'Priority RSVPs for fan meetups',
      'Early access to announcements (24hrs)',
      'Future Super Fan Chapters (suspense!)',
      'Gaming experiences feature artificial-intelligence–generated visuals and simulated environments',
    ],
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  },
];

const MembershipPage: React.FC = () => {
  const [billing, setBilling] = useState<BillingPeriod>('monthly');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Currency State
  const [selectedCurrency, setSelectedCurrency] = useState<'GBP' | 'USD' | 'EUR'>('GBP');
  const [planPrices, setPlanPrices] = useState<Record<number, string>>({});
  const [pricesLoading, setPricesLoading] = useState(false);

  const [userMembershipTier, setUserMembershipTier] = useState<string | null>(null);
  const [userMembershipStatus, setUserMembershipStatus] = useState<string | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);

  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const { countryCode: detectedCountryCode } = useGeoLocation();

  // Helper to check if a plan name matches "Super Fan" regardless of casing/underscores
  const isSuperFanName = (name: string) => {
    const n = name.toLowerCase().replace('_', ' ');
    return n === 'super fan' || n === 'super_fan';
  };

  // Sync prices when currency changes
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

  // Fetch current user membership status
  useEffect(() => {
    if (!isLoggedIn) {
      setMembershipLoading(false);
      return;
    }

    const fetchUserMembership = async () => {
      try {
        const response = await axiosClient.get('/auth/me');
        const userData = response.data.user || response.data;
        setUserMembershipTier(userData.membership_tier || null);
        setUserMembershipStatus(userData.membership?.status || null);
      } catch (err) {
        console.error('Failed to fetch user membership', err);
      } finally {
        setMembershipLoading(false);
      }
    };

    fetchUserMembership();
  }, [isLoggedIn]);

  const handleSubscribeClick = (plan: Plan) => {
    const isFree = plan.price === '0.00';
    if (isFree) {
      if (!isLoggedIn) navigate('/login');
      else navigate('/');
      return;
    }

    if (!isLoggedIn) {
      navigate('/login', { state: { from: '/membership' } });
      return;
    }

    if (user?.mobile && getCountryFromMobile(user.mobile) === 'India') {
      toast.error('Membership purchase is not available for users in India.');
      return;
    }

    // Logic for Cancellation / Manage: Check if user is already a Super Fan
    const isCurrentlySuperFan =
      userMembershipTier && isSuperFanName(userMembershipTier) && userMembershipStatus === 'active';

    if (isCurrentlySuperFan && isSuperFanName(plan.name)) {
      setIsCancelModalOpen(true);
      return;
    }

    setSelectedPlan(plan);
    setIsTermsModalOpen(true);
  };

  const handleTermsConfirm = () => {
    setIsTermsModalOpen(false);
    setIsPaymentOpen(true);
  };

  const handleCancelMembership = async () => {
    try {
      await axiosClient.post('/membership/cancel');
      setUserMembershipTier(null);
      setUserMembershipStatus(null);
      setIsCancelModalOpen(false);
      setIsSuccessModalOpen(true);
      toast.success('Membership Cancelled Successfully');
    } catch (err) {
      toast.error('Failed to cancel membership.');
    }
  };

  const handlePaymentSuccess = () => {
    setUserMembershipTier('Super Fan');
    setUserMembershipStatus('active');
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
            Unlock exclusive TVK experiences, events, and Super Fan-only benefits.
          </p>
        </div>

        {/* Toggle Row (Billing + Currency) */}
        <div className="mt-10 2xl:mt-16 flex flex-col items-center gap-6">
          <div className="inline-flex rounded-full bg-[#07091a] p-1 2xl:p-2">
            {([{ id: 'monthly', label: 'Monthly' }] as { id: BillingPeriod; label: string }[]).map(
              (opt) => {
                const active = billing === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setBilling(opt.id)}
                    className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                      active ? 'bg-[#f7c948] text-[#111827]' : 'text-slate-200 hover:bg-[#181e37]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              }
            )}
          </div>

          {/* Currency Switcher */}
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

        <div className="mt-10 2xl:mt-20 grid gap-6 md:grid-cols-2 xl:gap-10 2xl:gap-16">
          {isLoggedIn && membershipLoading && (
            <p className="col-span-2 text-center text-slate-400">
              Checking your membership status...
            </p>
          )}

          {hardCodedPlans.map((plan) => {
            const isFree = plan.price === '0.00';
            const symbol =
              selectedCurrency === 'GBP' ? '£' : selectedCurrency === 'EUR' ? '€' : '$';
            const currentPrice = planPrices[plan.id] || plan.price;
            const priceLabel = isFree ? 'Free' : `${symbol}${currentPrice}`;

            let priceSuffix: string;
            if (isFree) {
              priceSuffix =
                plan.duration_days >= 36500 ? '/ Lifetime' : `/ ${plan.duration_days}-Days`;
            } else {
              priceSuffix = `/ Monthly (${selectedCurrency})`;
            }

            const features: TierFeature[] = (plan.benefits || []).map((b) => ({
              label: b,
              available: true,
            }));

            const isHighlighted = !isFree;

            // Check if user is Super Fan to toggle button text
            const isUserSuperFan =
              userMembershipTier &&
              isSuperFanName(userMembershipTier) &&
              userMembershipStatus === 'active';
            const isIndia = detectedCountryCode === 'IN';

            const buttonText = (() => {
              if (isIndia) return 'Not Available';
              if (isUserSuperFan && isSuperFanName(plan.name)) return 'Manage Membership';
              if (isFree) {
                if (isLoggedIn) return 'Current Plan';
                return 'Join Free';
              }
              return 'Become a Super Fan';
            })();

            const buttonDisabled = isIndia || (isFree && isLoggedIn);

            return (
              <MembershipTireCard
                key={plan.id}
                name={plan.name}
                tagline={plan.description}
                priceLabel={pricesLoading && !isFree ? '...' : priceLabel}
                priceSuffix={priceSuffix}
                features={features}
                highlight={isHighlighted}
                badgeLabel={isHighlighted ? 'Most Popular' : undefined}
                onSubscribe={() => handleSubscribeClick(plan)}
                buttonText={buttonText}
                buttonDisabled={buttonDisabled}
              />
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="mx-auto max-w-6xl xl:max-w-7xl 2xl:max-w-[90vw] px-4 pb-20 2xl:pb-32">
        <div className="mt-10 text-center md:mt-16 2xl:mt-24">
          <h2 className="text-3xl font-bold md:text-4xl 2xl:text-6xl">
            Why Choose TVK Membership?
          </h2>
          <p className="mt-3 text-base text-slate-300 2xl:text-xl">
            Explore exclusive benefits that come with every membership tier.
          </p>
        </div>

        <motion.div
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={benefitsContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          {/* ... Benefits ... */}
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
              description="Super Fans get priority entry and special access"
              tags={['Super Fan']}
            />
          </motion.div>
          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Bell />}
              title="Early Announcements"
              description="Be the first to know about drops and releases."
              tags={['Super Fan']}
            />
          </motion.div>
          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Video />}
              title="Premium Video Content"
              description="Unlock HD/4K documentaries and behind-the-scenes."
              tags={['Super Fan']}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Modals */}
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
        onConfirm={handleTermsConfirm}
      />

      {/* Payment Modal - Fixed with currency prop */}
      <MembershipPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        plan={selectedPlan}
        currency={selectedCurrency}
        onSuccess={handlePaymentSuccess}
      />

      <Footer />
    </div>
  );
};

export default MembershipPage;
