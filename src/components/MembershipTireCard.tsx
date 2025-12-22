import React from 'react';
import { Check, X } from 'lucide-react';

export type BillingPeriod = "monthly" | "yearly";

export interface TierFeature {
  label: string;
  available: boolean;
}

interface MembershipTireCardProps {
  name: string;
  tagline: string;
  priceLabel: string;
  priceSuffix: string;
  highlight?: boolean;
  badgeLabel?: string;
  features: TierFeature[];
  onSubscribe?: () => void;
  buttonText?: string;
  buttonDisabled?: boolean;
}

const MembershipTireCard: React.FC<MembershipTireCardProps> = ({
  name,
  tagline,
  priceLabel,
  priceSuffix,
  highlight = false,
  badgeLabel,
  features,
  onSubscribe,
  buttonText = "Subscribe Now",
  buttonDisabled = false,
}) => {
  return (
    <div
      className={`relative flex flex-col rounded-3xl p-[2px] transition-transform hover:-translate-y-1 hover:shadow-xl ${
        highlight ? "bg-gradient-to-r from-[#f7c948]/20 to-[#f7c948]/40" : "border border-[#1d2340]"
      }`}
    >
      {/* Optional glowing border for highlighted card */}
      {highlight && (
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-[#f7c948] to-[#e6b800] opacity-50 blur-lg -z-10" />
      )}

      <div className="rounded-3xl bg-[#07091a] p-6 md:p-8 flex flex-col h-full">
        {/* Most Popular Badge */}
        {highlight && badgeLabel && (
          <div className="absolute -top-3 right-6 rounded-full bg-[#f7c948] px-4 py-1.5 text-xs font-bold text-[#111827] shadow-lg">
            {badgeLabel}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-2xl md:text-3xl font-semibold text-white">{name}</h3>
          <p className="mt-2 text-sm md:text-base text-slate-300">{tagline}</p>
        </div>

        <div className="mb-8">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-bold text-[#f7c948]">{priceLabel}</span>
            <span className="text-sm md:text-base text-slate-300">{priceSuffix}</span>
          </div>
        </div>

        {/* Features List - Inline Check/X with Text */}
        <ul className="mb-10 flex-1 space-y-3 text-sm md:text-base">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              {feature.available ? (
                <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#f7c948]" />
              ) : (
                <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-500" />
              )}
              <span
                className={
                  feature.available
                    ? "text-slate-200"
                    : "text-slate-500 line-through"
                }
              >
                {feature.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Button */}
        <button
          type="button"
          onClick={buttonDisabled ? undefined : onSubscribe}
          disabled={buttonDisabled}
          className={`mt-auto w-full rounded-full px-6 py-3.5 text-sm md:text-base font-semibold transition-all duration-200 ${
            highlight
              ? "bg-[#f7c948] text-[#111827] hover:bg-[#f4b41a] hover:shadow-lg"
              : "bg-[#111827] text-slate-100 hover:bg-[#181e37] border border-slate-700"
          }`}
        >
          {buttonText || (highlight ? "Manage your membership" : "Subscribe Now")}
        </button>
      </div>
    </div>
  );
};

export default MembershipTireCard;