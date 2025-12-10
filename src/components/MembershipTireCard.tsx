import React from 'react';

import { Check, X} from 'lucide-react';


export type BillingPeriod = "monthly" | "yearly";


export interface TierFeature{
    label: string;
    available: boolean;
}

interface MembershipTireCardprops{
    name: string;
    tagline: string;
    priceLabel: string;
    priceSuffix: string;
    highlight?: boolean;
    badgeLabel?: string;
    features: TierFeature[];
     onSubscribe?: () => void;

}

const MembershipTireCard: React.FC<MembershipTireCardprops> =({
    name,
    tagline,
    priceLabel,
    priceSuffix,
    highlight = false,
    badgeLabel,
    features,
    onSubscribe,

}) => {
    const buttonLabel = isCurrent
    ? "Current Plan"
    : loading
    ? "Processing..."
    : "Subscribe Now";
    return (
        <div
            className={[
                "relative flex flex-col rounded-3xl p-[2px] transition-transform hover:-translate-y-1 hover:shadow-xl",
                highlight ? "gold-border" : "border border-[#1d2340]"
            ].join(" ")}
            >
        <div className="rounded-3xl bg-[#07091a] p-6 flex flex-col h-full">

            {/*Badge*/}
            {highlight && badgeLabel && (
                <div className='absolute -top-3 right-6 rounded-full bg-[#f7c948] px-3 py-1 text-xs font-semibold text-[#111827] shadow-md'>{badgeLabel}</div>
            )}

            <div className='mb-6'>
                <h3 className="text-2xl font-semibold text-white">{name}</h3>
                <p className="mt-1 text-sm text-slate-300">{tagline}</p>
            </div>

            <div className='mb-6'>
                <div className='flex items-baseline gap-2'>
                    <span className='text-4xl font-bold text-[#f7c948]'>{priceLabel}</span>
                    <span className="text-sm text-slate-300">{priceSuffix}</span>
                </div>
            </div>

            <ul className="mb-8 flex-1 flex-y-2 text-sm">
                {features.map((feature, index)=> (
                    <li key={index} className="flex-items-start gap-2">
                        {feature.available ? (
                            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#f7c948]" />
                        ) : (
                            <X className = "mt-0.5 h-4 w-4 flex-shrink-0 text-slate-500"/>
                            )}
                            <span className={feature.available ? "text-slate-200" : "text-slate-500 line-through"}>{feature.label}</span>
                    </li>
                ))}
            </ul>

            <button type="button"  onClick={onSubscribe} className={["mt-auto w-full rounded-full px-4 py-3 text-sm font-semibold transition-colors",
                highlight
            ? "bg-[#f7c948] text-[#111827] hover:bg-[#f4b41a]"
            : "bg-[#111827] text-slate-100 hover:bg-[#181e37]"
            ].join(" ")}>
               {buttonLabel}
            </button>
        </div>
        </div>
    )
}

export default MembershipTireCard;