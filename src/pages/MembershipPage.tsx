import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { Star, Users, Video, Bell, AlertCircle } from 'lucide-react';
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
    billingNote: "",
    benefits: [
      'Limited Media Content Library',
      'Standard Member Badge',
      '10% Off Merchandise',
      'Introductory Gaming Experience',
    ],
  created_at: "2025-01-01T00:00:00Z",  // or new Date().toISOString()
  updated_at: "2025-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: 'Super Fan',
    description: 'Premium access (30-day subscription)',
    price: '9.99',
    duration_days: 30,
    status: 1,
    billingNote:  `Renews automatically every 30 days\nCancel anytime`,
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
    created_at: "2025-01-01T00:00:00Z",  // or new Date().toISOString()
    updated_at: "2025-01-01T00:00:00Z",
  },
];


const MembershipPage: React.FC = () => {
  
  const [billing, setBilling] = useState<BillingPeriod>('monthly');


  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const [userMembershipTier, setUserMembershipTier] = useState<string | null>(null);
  const [userMembershipStatus, setUserMembershipStatus] = useState<string | null>(null);
  const [membershipLoading, setMembershipLoading] = useState(true);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [isPaymentSuccessOpen, setIsPaymentSuccessOpen] = useState(false);

  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const { countryCode: detectedCountryCode } = useGeoLocation();

  

  // Fetch current user membership status (only if logged in)
  useEffect(() => {
    if (!isLoggedIn) {
      setMembershipLoading(false);
      return;
    }

    const fetchUserMembership = async () => {
      try {
        // Assuming you have a protected endpoint that returns user profile with membership info
        // If you don't have one yet, you can reuse login response or create GET /me
        const response = await axiosClient.get('/auth/me'); // or '/user/profile'
        const { membership_tier, membership } = response.data.user || response.data;

        setUserMembershipTier(membership_tier || null);
        setUserMembershipStatus(membership?.status || null);
      } catch (err) {
        console.error('Failed to fetch user membership', err);
        // Optionally show toast
      } finally {
        setMembershipLoading(false);
      }
    };

    fetchUserMembership();
  }, [isLoggedIn]);

  const handleSubscribeClick = (plan: Plan) => {
    const isFree = plan.price === '0.00';

    if (isFree) {
      // FREE PLAN
      if (!isLoggedIn) {
        navigate('/login');
      } else {
        navigate('/');
      }
      return;
    }

    // SUPER FAN (PAID)
    if (!isLoggedIn) {
      navigate('/login', {
        state: { from: '/membership' },
      });
      return;
    }

    // Check for India users
    if (user?.mobile && getCountryFromMobile(user.mobile) === 'India') {
      toast.error('Membership purchase is not available for users in India.');
      return;
    }

    // If user already has this plan and it's active → show manage
    if (userMembershipTier === plan.name && userMembershipStatus === 'active') {
      toast('Manage your membership', { icon: <AlertCircle className="text-yellow-500" /> });

      // For now, we'll just show a simple confirm to cancel
      setIsCancelModalOpen(true);
      return;
    }

    // logged in + paid -> open terms modal first
    setSelectedPlan(plan);
    setIsTermsModalOpen(true);
  };

  const handleTermsConfirm = () => {
    setIsTermsModalOpen(false);
    setIsPaymentOpen(true);
  };

  const handleCancelMembership = async () => {
    try {
      // Replace with your actual cancel endpoint
      await axiosClient.post('/membership/cancel');

      toast.success('Membership cancelled successfully.');
      // Update state
      setUserMembershipTier(null);
      setUserMembershipStatus(null);

      //close cancel modal (if still open)
      setIsCancelModalOpen(false);

      //Show success modal
      setIsSuccessModalOpen(true);
      toast.success('Membership Cancelled Successfully');
    } catch (err) {
      toast.error('Failed to cancel membership.');
      console.log(err);
    }
  };

  const handlePaymentSuccess = () => {
    // Here you can re-fetch membership status or show a toast
    setUserMembershipTier('Super Fan');
    setUserMembershipStatus('active');

    // Close the payment modal
    setIsPaymentOpen(false);

    // Show the dedicated payment success modal
    setIsPaymentSuccessOpen(true);
    toast.success('Welcome to Super Fan!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050716] to-[#02030b] text-slate-100">
      <Header />

      {/* Main Section */}
      <section className="mx-auto max-w-6xl xl:max-w-7xl 2xl:max-w-[90vw] px-4 py-16 2xl:py-24">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-4xl font-bold md:text-5xl 2xl:text-7xl">Choose Your Membership Plan</h1>
          <p className="mt-4 text-base text-slate-300 md:text-lg 2xl:text-2xl">
            Unlock exclusive TVK experiences, events, and Super Fan-only benefits.
          </p>
        </div>

        {/* Billing Toggle (UI-only; affects suffix for paid plans) */}
        <div className="mt-10 2xl:mt-16 flex justify-center">
          <div className="inline-flex rounded-full bg-[#07091a] p-1 2xl:p-2">
            {(
              [
                { id: 'monthly', label: 'Monthly' },
                // { id: "yearly", label: "Yearly" },
              ] as { id: BillingPeriod; label: string }[]
            ).map((opt) => {
              const active = billing === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBilling(opt.id)}
                  className={[
                    'rounded-full px-5 py-2 2xl:px-8 2xl:py-4 text-sm 2xl:text-xl font-medium transition-colors',
                    active ? 'bg-[#f7c948] text-[#111827]' : 'text-slate-200 hover:bg-[#181e37]',
                  ].join(' ')}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Membership Tier Cards (API-driven) */}
        <div className="mt-10 2xl:mt-20 grid gap-6 md:grid-cols-2 xl:gap-10 2xl:gap-16">
          {isLoggedIn && membershipLoading && (
            <p className="col-span-2 text-center text-slate-400">
              Checking your membership status...
            </p>
          )}
          

          {hardCodedPlans.map((plan) => {
              const isFree = plan.price === '0.00';

              const priceLabel = isFree ? 'Free' : `£${plan.price}`;

              // Price suffix logic:
              // - Free Tier: based on duration_days ("Lifetime" for 36500)
              // - Paid tiers (e.g. Super Fan): suffix changes with billing toggle
              let priceSuffix: string;
              if (isFree) {
                if (plan.duration_days >= 36500) {
                  priceSuffix = '/ Lifetime';
                } else {
                  priceSuffix = `/ ${plan.duration_days}-Days`;
                }
              } else {
                priceSuffix = billing === 'monthly' ? '/ Monthly( you can pay in Euro or Dollars)' : '/ Yearly';
              }

              const features: TierFeature[] = (plan.benefits || []).map((b) => ({
                label: b,
                available: true,
              }));

              const isHighlighted = !isFree; // all paid plans (Super Fan) get highlight

              const isUserSuperFan =
                (userMembershipTier === 'Super Fan' || userMembershipTier === 'super_fan') && userMembershipStatus === 'active';
              
              const isUserFree = isLoggedIn && !isUserSuperFan;
              const isIndia = detectedCountryCode === 'IN';

              const buttonText = (() => {
                if (isIndia) return 'Not Available';
                if (isUserSuperFan && (plan.name === 'Super Fan' || plan.name === 'super_fan')) {
                  return 'Manage Membership';
                }
                if (isFree) {
                    if (isUserSuperFan) return 'Included';
                    if (isUserFree) return 'Current Plan';
                    return 'Join Free';
                }
                // Paid plan
                return 'Become a Super Fan';
              })();

              const buttonDisabled = (() => {
                  if (isIndia) return true;
                  if (isUserSuperFan && (plan.name === 'Super Fan' || plan.name === 'super_fan')) return false;
                  if (isFree && isLoggedIn) return true;
                  return false;
              })();

              return (
                <MembershipTireCard
                  key={plan.id}
                  name={plan.name}
                  tagline={plan.description}
                  priceLabel={priceLabel}
                  priceSuffix={priceSuffix}
                  billingNote={!isFree ? plan.billingNote : undefined}
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

      {/* Why choose section */}
      <section className="mx-auto max-w-6xl xl:max-w-7xl 2xl:max-w-[90vw] px-4 pb-20 2xl:pb-32">
        <div className="mt-10 text-center md:mt-16 2xl:mt-24">
          <h2 className="text-3xl font-bold md:text-4xl 2xl:text-6xl">Why Choose TVK Membership?</h2>
          <p className="mt-3 text-base text-slate-300 2xl:text-xl">
            Explore the exclusive benefits that come with every membership tier.
          </p>
        </div>

        {/* Benefits grid with Framer Motion */}
        <motion.div
          className="mt-8 2xl:mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 2xl:gap-10"
          variants={benefitsContainerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Star />}
              title="Exclusive Contents"
              description="Join live streams and special TVK events from wherever you are"
              tags={['Free', 'Super Fan']}
            />
          </motion.div>

          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Users />}
              title="Priority Fan Meetups"
              description="Super Fans get priority entry and access to special sessions"
              tags={['Super Fan']}
            />
          </motion.div>

          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Bell />}
              title="Early Announcements"
              description="Be the first to know about drops, events, and releases."
              tags={['Super Fan']}
            />
          </motion.div>

          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Video />}
              title="Premium Video Content"
              description="Unlock HD/4K documentaries, behind-the-scenes content."
              tags={['Super Fan']}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Cancellation Modal */}
      <MembershipCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelMembership}
      />

      {/* Success Modal - Shown after cancellation */}
      <MembershipCancelledSuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      {/* Payment Success Modal */}
      <MembershipPaymentSuccessModal
        isOpen={isPaymentSuccessOpen}
        onClose={() => setIsPaymentSuccessOpen(false)}
      />

      {/* Terms Modal */}
      <MembershipTermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
        onConfirm={handleTermsConfirm}
      />

      {/* Payment modal (Stripe Elements) */}
      <MembershipPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        plan={selectedPlan}
        onSuccess={handlePaymentSuccess}
      />

      <Footer />
    </div>
  );
};

export default MembershipPage;
