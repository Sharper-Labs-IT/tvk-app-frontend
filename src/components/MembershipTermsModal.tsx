import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, CheckSquare, Square, RefreshCw, CreditCard, Undo2, Scale, Heart } from 'lucide-react';

interface MembershipTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const MembershipTermsModal: React.FC<MembershipTermsModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [checkedItems, setCheckedItems] = useState<boolean[]>([false, false, false, false]);

  useEffect(() => {
    if (isOpen) {
      setCheckedItems([false, false, false, false]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCheck = (index: number) => {
    const newChecked = [...checkedItems];
    newChecked[index] = !newChecked[index];
    setCheckedItems(newChecked);
  };

  const allChecked = checkedItems.every((item) => item);

  const terms = [
    "I understand this is a recurring monthly subscription, and I authorise TVK MEMBERS LTD to charge the displayed monthly price in my selected currency each month until I cancel.",
    "I confirm that I have read and agree to the TVK Members Terms & Conditions and Privacy Policy.",
    "I confirm that I am 18 years of age or older and eligible to join this paid membership programme in my country of residence.",
    "I understand that payments already made are non-refundable for the current billing period and I may cancel future renewals at any time."
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-2xl rounded-3xl bg-[#07091a] p-6 md:p-8 shadow-2xl border border-[#1d2340] max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Title */}
        <h2 className="mb-2 text-center text-2xl font-bold text-white">
          Super Fan Membership – Important Terms
        </h2>
        <p className="mb-6 text-center text-slate-400">
          Please review the key terms of your Super Fan membership before subscribing:
        </p>

        <div className="mb-6 space-y-6 text-slate-300 text-sm bg-[#0f132a] p-4 rounded-xl border border-[#1d2340]">
          <section>
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-brand-gold" /> Subscription & Renewal
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>This is a recurring monthly subscription</li>
              <li>Your membership auto-renews every 30 days</li>
              <li>You can cancel at any time from your account settings</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-gold" /> Price & Payments
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>The subscription fee will be displayed in your selected currency</li>
              <li>Pricing may vary depending on country and currency</li>
              <li>Payments are processed securely via Stripe</li>
              <li>TVK MEMBERS LTD does not store your full card details</li>
              <li>Industry-standard PCI-DSS and encryption security applies</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Undo2 className="w-5 h-5 text-brand-gold" /> Refunds
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>Payments already made are non-refundable for the current billing period</li>
              <li>Cancelling stops future renewals – no hidden penalties</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Scale className="w-5 h-5 text-brand-gold" /> Eligibility & Availability
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-slate-400">
              <li>You must be 18 years or older to subscribe</li>
              <li>Membership is currently available to fans outside India only</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5 text-brand-gold" /> Platform Identity & Disclaimer
            </h3>
            <p className="text-slate-400 mb-2">
              Independent fan platform created to celebrate and honour Thalapathy Vijay following his last movie, Jana Nayagan — keeping the spirit, passion and inspiration of the actor Vijay alive in the hearts and minds of fans around the world.
            </p>
            <p className="text-slate-400">
              This platform is not officially associated with, endorsed by, or affiliated with actor Vijay, his management, production companies, or representatives.
            </p>
          </section>
        </div>

        {/* Terms List */}
        <div className="space-y-4 mb-8">
          {terms.map((term, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3 cursor-pointer group"
              onClick={() => toggleCheck(index)}
            >
              <div className="mt-1 flex-shrink-0 text-[#f7c948]">
                {checkedItems[index] ? (
                  <CheckSquare className="h-5 w-5" />
                ) : (
                  <Square className="h-5 w-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                )}
              </div>
              <p className={`text-sm leading-relaxed transition-colors ${checkedItems[index] ? 'text-slate-200' : 'text-slate-400'}`}>
                {term}
              </p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-slate-600 bg-transparent py-3 font-medium text-slate-200 transition hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (allChecked) {
                onConfirm();
              }
            }}
            disabled={!allChecked}
            className={`flex-1 rounded-full py-3 font-semibold transition ${
              allChecked 
                ? 'bg-[#f7c948] text-[#111827] hover:bg-[#e5b83f]' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            Proceed to Payment
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default MembershipTermsModal;
