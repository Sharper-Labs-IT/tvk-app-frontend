import React, {useState} from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';


import MembershipTireCard, {
    type BillingPeriod,
    type TierFeature,
} from '../components/MembershipTireCard';

import BenefitCard from '../components/BenefitCard';

const MembershipPage: React.FC = () => {
    const [billing, setBilling] = useState<BillingPeriod>("monthly");


    const baseFeatures: {[tier: string]: TierFeature[]} = {
        free: [
            { label: "Access to selected live event streams (limited view)", available: true },
            { label: "Access to a basic media content library", available: true },
            { label: "Standard member badge", available: true },
            { label: "Community updates & newsletter", available: true },
            { label: "Priority RSVPs for meetups", available: false },
            { label: "Early announcements access", available: false },
        ],
        superFan:[
            { label: "Access to all live events streams (Full HD / replay access)", available: true },
            { label: "Full access to media content library + behind-the-scenes", available: true },
            { label: "Super Fan animated badge", available: true },
            { label: "Discount voucher for merchandise (25%)", available: true },
            { label: "Priority RSVPs for special fan meetups", available: true },
            { label: "Early announcements access (24–48 hours prior)", available: true },
            { label: "Exclusive Super Fan community polls & Q&A", available: true },
            { label: "Occasional surprise drops & digital assets", available: true },
        ]  
    };

    //pricing for each billing period

    const priceByBilling: Record<
        BillingPeriod,
        { free: string; superFan: string; suffix: string}
        > = {
            monthly: {
                free: "Free",
                superFan: "$9.99",
                suffix: "/ Monthly",
            },

            yearly: {
                free: "Free",
                superFan: "$99",
                suffix: "/ Yearly",
            },
        };

        const prices = priceByBilling[billing];

        const billingOption: {id: BillingPeriod; label: string}[] = [
            {id: "monthly", label: "Monthly"},
            {id: "yearly", label: "Yearly"},
        ];

        return (
            <div className="min-h-screen bg-gradient-to-b from-[#050716] to-[#02030b] text-slate-100">
                <Header />
                {/*Main Section*/}
                <section className='mx-auto max-w-6xl px-4 py-16'>
                    {/*Heading*/}
                <div className='text-center'>
                    <h1 className="text-4xl font-bold md:text-5xl">
                        Choose Your Membership Plan
                    </h1>
                    <p className='mt-4 text-base text-slate-300 md:text-lg'>
                        Unlock exclusive TVK experiences, events, and Super Fan-only benefits.
                    </p>
                </div>

                {/*Billing Toggle*/}
                <div className='mt-10 flex justify-center'>
                    <div className='inline-flex rounded-full bg-[#07091a] p-1'>
                        {billingOption.map((opt) => {
                            const active = billing === opt.id;
                            return (
                                <button key={opt.id} type="button" onClick={()=> setBilling(opt.id)}
                                className={[
                                    "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                                    active
                                    ? "bg-[#f7c948] text-[#111827]"
                                    : "text-slate-200 hover:bg-[#181e37]",
                                ].join(" ")}>{opt.label}</button>
                            );
                        })}
                    </div>
                </div>

                {/*Membership Tier Cards*/}
                <div className='mt-10 grid gap-6 md:grid-cols-2'>
                    {/*Free Plan*/}
                    <MembershipTireCard
                        name="Free"
                        tagline='Start your journey with essential community access.'
                        priceLabel={prices.free}
                        priceSuffix={prices.suffix}
                        features={baseFeatures.free}
                    />
                    {/*Super Fan  plan*/}
                    <MembershipTireCard
                        name='Super Fan'
                        tagline='For the fans who never miss a moment. Get the full TVK experience.'
                        priceLabel= {prices.superFan}
                        priceSuffix={prices.suffix}
                        highlight
                        badgeLabel='Most Popular'
                        features={baseFeatures.superFan}
                        />

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

                </section>


            </div>
        )
}

export default MembershipPage;
