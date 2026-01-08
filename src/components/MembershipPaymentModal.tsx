import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import type { Plan } from '../types/plan';

type CurrencyCode = 'GBP' | 'USD' | 'EUR';

interface MembershipPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  currency: CurrencyCode;
  onSuccess?: () => void;
}

const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
];

const MembershipPaymentModal: React.FC<MembershipPaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  currency,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency || 'GBP');
  const [displayPrice, setDisplayPrice] = useState<string | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);

  useEffect(() => {
    if (currency) setSelectedCurrency(currency);
  }, [currency]);

  useEffect(() => {
    if (isOpen && plan) {
      fetchConvertedPrice();
    }
  }, [selectedCurrency, plan, isOpen]);

  const fetchConvertedPrice = async () => {
    if (!plan) return;
    setPriceLoading(true);
    try {
      const res = await axiosClient.post('/currency/calculate', {
        plan_id: plan.id,
        currency: selectedCurrency,
      });
      setDisplayPrice(res.data.converted_price);
    } catch (err) {
      console.error('Currency conversion failed', err);
      setDisplayPrice(plan.price);
    } finally {
      setPriceLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!plan) return;
    setError(null);
    setLoading(true);

    try {
      const res = await axiosClient.post('/payments/create-checkout-session', {
        plan_id: plan.id,
        currency: selectedCurrency,
      });

      const { url } = res.data;
      if (onSuccess) onSuccess();
      window.location.href = url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      const msg = err?.response?.data?.message || 'Failed to start checkout. Please try again.';
      setError(msg);
      setLoading(false);
    }
  };

  const currentSymbol = CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || '£';

  return (
    <AnimatePresence>
      {isOpen && plan && (
        <div className="fixed inset-0 z-[100] overflow-y-auto custom-scrollbar">
          {/* Backdrop */}
          <div className="fixed inset-0 flex items-center justify-center min-h-full p-4 text-center sm:p-0">
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => !loading && onClose()}
                className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
                aria-hidden="true"
              />

            {/* Modal Panel - Centered & Scrollable with page */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative transform overflow-hidden rounded-3xl bg-[#1E1E1E] text-left shadow-2xl shadow-black/50 border border-white/10 w-full max-w-md mx-auto sm:my-8 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Background Effect */}
              <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-tvk-accent-gold/10 to-transparent pointer-events-none" />

              {/* Modal Content - Auto Height */}
              <div className="relative flex flex-col w-full">
                
                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex items-start justify-between">
                  <div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 text-gold text-xs font-bold uppercase tracking-wider mb-3 border border-gold/20">
                        <Sparkles className="w-3 h-3" />
                        Premium Access
                      </span>
                      <h2 className="text-2xl font-bold text-white font-serif tracking-tight pr-8">
                        {plan.name}
                      </h2>
                      <p className="text-gray-400 mt-2 text-sm leading-relaxed">
                        Transform your experience with exclusive benefits and premium features.
                      </p>
                    </motion.div>
                  </div>
                  <button
                    onClick={onClose}
                    disabled={loading}
                    className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors absolute top-6 right-6"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Content Body */}
                <div className="px-6 space-y-4">
                  
                  {/* Currency Selector */}
                  <div className="bg-black/20 rounded-2xl p-3 border border-white/5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">
                      Choose Currency
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {CURRENCIES.map((c) => (
                        <button
                          key={c.code}
                          type="button"
                          onClick={() => setSelectedCurrency(c.code as CurrencyCode)}
                          disabled={loading}
                          className={`relative group flex flex-col items-center justify-center py-2 px-2 rounded-xl border transition-all duration-200 ${
                            selectedCurrency === c.code
                              ? 'bg-gold/10 border-gold/50 text-gold shadow-[0_0_15px_rgba(230,198,91,0.15)]'
                              : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-base font-bold mb-0.5">{c.symbol}</span>
                          <span className="text-[10px] uppercase font-medium opacity-80">{c.code}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Features List */}
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <span className="w-1 h-4 bg-gold rounded-full" />
                      Everything included:
                    </h3>
                    <div className="grid gap-2">
                      {plan.features?.map((feature: string, idx: number) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + idx * 0.05 }}
                          className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-colors group"
                        >
                          <div className="mt-0.5 p-1 rounded-full bg-green-500/20 text-green-400 group-hover:bg-green-500/30 transition-colors">
                            <Check className="w-3.5 h-3.5" strokeWidth={3} />
                          </div>
                          <span className="text-sm text-gray-300 leading-snug group-hover:text-white transition-colors">
                            {feature}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Security Note */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200">
                    <ShieldCheck className="w-5 h-5 shrink-0 text-blue-400" />
                    <div className="text-xs space-y-0.5">
                      <p className="font-medium text-blue-100">Secure AES-256 Encrypted Payment</p>
                      <p className="opacity-70">Your payment information is processed securely by Stripe.</p>
                    </div>
                  </div>

                  {/* Error Message */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm overflow-hidden"
                      >
                        <div className="flex gap-2">
                          <span className="text-red-400">⚠️</span>
                          {error}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Footer / Checkout */}
                <div className="p-6 bg-[#181818] border-t border-white/5 mt-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-400">Total Due Today</span>
                      {priceLoading ? (
                        <div className="h-8 w-24 bg-white/10 animate-pulse rounded mt-1" />
                      ) : (
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-bold text-white font-serif">
                            {currentSymbol}{displayPrice ?? plan.price}
                          </span>
                          <span className="text-sm text-gray-500 font-medium">/month</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading || priceLoading}
                    className="group relative w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-goldDark to-gold text-black font-bold text-lg shadow-lg hover:shadow-gold/20 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm Subscription <CreditCard className="w-5 h-5 opacity-80 group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </span>
                    {/* Sheen Effect */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                      <div className="absolute top-0 left-[-100%] h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:animate-[shimmer_1.5s_infinite]" />
                    </div>
                  </button>
                  
                  <p className="text-center mt-4 text-xs text-gray-500">
                    Cancel anytime. By subscribing, you agree to our Terms.
                  </p>
                </div>

              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MembershipPaymentModal;