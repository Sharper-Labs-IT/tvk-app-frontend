import React, { useState, useEffect } from 'react';

import {useAuth} from '../context/AuthContext';
import {useNavigate} from 'react-router-dom';


import Header from '../components/Header';
import { Star, Users, Video, Bell } from "lucide-react";
import Footer from '../components/Footer';

import MembershipTireCard, {
  type BillingPeriod,
  type TierFeature,
} from '../components/MembershipTireCard';

import BenefitCard from '../components/BenefitCard';
import { motion, type Variants } from "framer-motion";
import type {Plan} from '../types/plan';
import axiosClient from "../api/axiosClient";
import MembershipPaymentModal from "../components/MembershipPaymentModal";



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
      ease: "easeOut",
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
      ease: "easeOut",
    },
  },
};

const MembershipPage: React.FC = () => {
  const [billing, setBilling] = useState<BillingPeriod>("monthly");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);




   const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  // which plan is currently being processed (for button loading state)
  const [subscribingPlanId, setSubscribingPlanId] = useState<number | null>(null);

  // which plan the user currently has (if you know it)
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null);

  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);


  // ---------- Fetch membership plans via Axios ----------
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axiosClient.get<{ plans: Plan[] }>("/membership/plans");

        const activePlans = (response.data.plans || []).filter(
          (p) => p.status === 1
        );

        setPlans(activePlans);
      } catch (err) {
        setError("Unable to load membership plans.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);


   const handleSubscribeClick = (plan: Plan) => {
  const isFree = plan.price === "0.00";

  if (isFree) {
    // FREE PLAN
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/");
    }
    return;
  }

  // SUPER FAN (PAID)
  if (!isLoggedIn) {
    navigate("/login");
    return;
  }

  // logged in + paid -> open payment modal
  setSelectedPlan(plan);
  setIsPaymentOpen(true);
};



  const handlePaymentSuccess = () => {
    // Here you can re-fetch membership status or show a toast
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050716] to-[#02030b] text-slate-100">
      <Header />

      {/* Main Section */}
      <section className='mx-auto max-w-6xl px-4 py-16'>
        {/* Heading */}
        <div className='text-center'>
          <h1 className="text-4xl font-bold md:text-5xl">
            Choose Your Membership Plan
          </h1>
          <p className='mt-4 text-base text-slate-300 md:text-lg'>
            Unlock exclusive TVK experiences, events, and Super Fan-only benefits.
          </p>
        </div>

        {/* Billing Toggle (UI-only; affects suffix for paid plans) */}
        <div className='mt-10 flex justify-center'>
          <div className='inline-flex rounded-full bg-[#07091a] p-1'>
            {([
              { id: "monthly", label: "Monthly" },
              { id: "yearly", label: "Yearly" },
            ] as { id: BillingPeriod; label: string }[]).map((opt) => {
              const active = billing === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBilling(opt.id)}
                  className={[
                    "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#f7c948] text-[#111827]"
                      : "text-slate-200 hover:bg-[#181e37]",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Membership Tier Cards (API-driven) */}
        <div className='mt-10 grid gap-6 md:grid-cols-2'>
          {loading && (
            <p className="col-span-2 text-center text-slate-300">
              Loading membership plans...
            </p>
          )}

          {error && !loading && (
            <p className="col-span-2 text-center text-red-400">
              {error}
            </p>
          )}

          {!loading && !error && plans.length === 0 && (
            <p className="col-span-2 text-center text-slate-400">
              No membership plans available.
            </p>
          )}

          {!loading && !error && plans.map((plan) => {
            const isFree = plan.price === "0.00";

            const priceLabel = isFree ? "Free" : `$${plan.price}`;

            // Price suffix logic:
            // - Free Tier: based on duration_days ("Lifetime" for 36500)
            // - Paid tiers (e.g. Super Fan): suffix changes with billing toggle
            let priceSuffix: string;
            if (isFree) {
              if (plan.duration_days >= 36500) {
                priceSuffix = "/ Lifetime";
              } else {
                priceSuffix = `/ ${plan.duration_days}-Days`;
              }
            } else {
              priceSuffix = billing === "monthly" ? "/ Monthly" : "/ Yearly";
            }

            const features: TierFeature[] = (plan.benefits || []).map((b) => ({
              label: b,
              available: true,
            }));

            const isHighlighted = !isFree; // all paid plans (Super Fan) get highlight

            return (
              <MembershipTireCard
                key={plan.id}
                name={plan.name}
                tagline={plan.description}
                priceLabel={priceLabel}
                priceSuffix={priceSuffix}
                features={features}
                highlight={isHighlighted}
                badgeLabel={isHighlighted ? "Most Popular" : undefined}
                onSubscribe={() => handleSubscribeClick(plan)}
              />
            );
          })}
        </div>
      </section>

                {/*why choose section*/}
                <section className="mx-auto max-w-6xl px-4 pb-20">
                    <div className='mt-10 text-center md:mt-16'>
                        <h2 className='text-3xl font-bold md:text-4xl'>
                            Why Choose TVK Membership?
                        </h2>
                        <p className="mt-3 text-base text-slate-300">
                            Explore the exclusive benefits that come with every membership tier.
                        </p>
                    </div>
                            {/*Benefits grid*/}
                    <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
                        <BenefitCard
                            title="Exclusive Contents"
                            description= "Join live streams and special TVK events from wherever you are"
                            tags={["Free", "Super Fan"]}
                        />
                        <BenefitCard
                            title="Priority Fan Meetups"
                            description= "Super Fans get priority entry and access to special sessions & Q&A."
                            tags={["Super Fan"]}
                        />
                        <BenefitCard
                            title="Early Announcements"
                            description= "Be the first to know about drops, events, and releases."
                            tags={["Super Fan"]}
                        />
                        <BenefitCard
                            title="Premium Video Content"
                            description= "Unlock HD/4K documentaries, behind-the-scenes content and more."
                            tags={["Super Fan"]}
                        />

                    </div>

  // ---------- Single endpoint: /payments/subscribe ----------
  const handleSubscribeClick = async (plan: Plan) => {
    
     // Check auth first (adjust "token" key if you use a different name)
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");   // redirect to login page
      return;               // stop here, don't call API
    }

   const handleSubscribeClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsPaymentOpen(true);
  };


  const handlePaymentSuccess = () => {
    // Here you can re-fetch membership status or show a toast
    console.log("Payment & subscription completed.");
  };

  const handleBillingToggle = (period: BillingPeriod) => {
    setBilling(period);
  };




  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050716] to-[#02030b] text-slate-100">
      <Header />

      {/* Main Section */}
      <section className='mx-auto max-w-6xl px-4 py-16'>
        {/* Heading */}
        <div className='text-center'>
          <h1 className="text-4xl font-bold md:text-5xl">
            Choose Your Membership Plan
          </h1>
          <p className='mt-4 text-base text-slate-300 md:text-lg'>
            Unlock exclusive TVK experiences, events, and Super Fan-only benefits.
          </p>
        </div>

        {/* Billing Toggle (UI-only; affects suffix for paid plans) */}
        <div className='mt-10 flex justify-center'>
          <div className='inline-flex rounded-full bg-[#07091a] p-1'>
            {([
              { id: "monthly", label: "Monthly" },
              { id: "yearly", label: "Yearly" },
            ] as { id: BillingPeriod; label: string }[]).map((opt) => {
              const active = billing === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setBilling(opt.id)}
                  className={[
                    "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#f7c948] text-[#111827]"
                      : "text-slate-200 hover:bg-[#181e37]",
                  ].join(" ")}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Membership Tier Cards (API-driven) */}
        <div className='mt-10 grid gap-6 md:grid-cols-2'>
          {loading && (
            <p className="col-span-2 text-center text-slate-300">
              Loading membership plans...
            </p>
          )}

          {error && !loading && (
            <p className="col-span-2 text-center text-red-400">
              {error}
            </p>
          )}

          {!loading && !error && plans.length === 0 && (
            <p className="col-span-2 text-center text-slate-400">
              No membership plans available.
            </p>
          )}

          {!loading && !error && plans.map((plan) => {
            const isFree = plan.price === "0.00";

            const priceLabel = isFree ? "Free" : `${plan.price}`;

            // Price suffix logic:
            // - Free Tier: based on duration_days ("Lifetime" for 36500)
            // - Paid tiers (e.g. Super Fan): suffix changes with billing toggle
            let priceSuffix: string;
            if (isFree) {
              if (plan.duration_days >= 36500) {
                priceSuffix = "/ Lifetime";
              } else {
                priceSuffix = `/ ${plan.duration_days}-Days`;
              }
            } else {
              priceSuffix = billing === "monthly" ? "/ Monthly" : "/ Yearly";
            }

            const features: TierFeature[] = (plan.benefits || []).map((b) => ({
              label: b,
              available: true,
            }));

            const isHighlighted = !isFree; // all paid plans (Super Fan) get highlight

            return (
              <MembershipTireCard
                key={plan.id}
                name={plan.name}
                tagline={plan.description}
                priceLabel={priceLabel}
                priceSuffix={priceSuffix}
                features={features}
                highlight={isHighlighted}
                badgeLabel={isHighlighted ? "Most Popular" : undefined}
                onSubscribe={() => handleSubscribeClick(plan)}
              />
            );
          })}
        </div>
      </section>

      {/* Why choose section */}
      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className='mt-10 text-center md:mt-16'>
          <h2 className='text-3xl font-bold md:text-4xl'>
            Why Choose TVK Membership?
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Explore the exclusive benefits that come with every membership tier.
          </p>
        </div>


        {/* Benefits grid with Framer Motion */}
        <motion.div
          className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
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
              tags={["Free", "Super Fan"]}
            />
          </motion.div>


          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Users />}
              title="Priority Fan Meetups"
              description="Super Fans get priority entry and access to special sessions"
              tags={["Super Fan"]}
            />
          </motion.div>

          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Bell />}
              title="Early Announcements"
              description="Be the first to know about drops, events, and releases."
              tags={["Super Fan"]}
            />
          </motion.div>

          <motion.div variants={benefitItemVariants}>
            <BenefitCard
              icon={<Video />}
              title="Premium Video Content"
              description="Unlock HD/4K documentaries, behind-the-scenes content."
              tags={["Super Fan"]}
            />
          </motion.div>
        </motion.div>
      </section>

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