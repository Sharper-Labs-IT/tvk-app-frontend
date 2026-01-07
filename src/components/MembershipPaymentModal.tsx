import React, { useState, useEffect } from 'react';
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

const CURRENCIES: { code: CurrencyCode; symbol: string }[] = [
  { code: 'GBP', symbol: '£' },
  { code: 'EUR', symbol: '€' },
  { code: 'USD', symbol: '$' },
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

  useEffect(() => {
    if (!isOpen) {
      setPaymentSuccess(false);
      setError(null);
    }
  }, [isOpen]);

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

  if (!isOpen || !plan) return null;

  const handleCheckout = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await axiosClient.post('/payments/create-checkout-session', {
        plan_id: plan.id,
        currency: selectedCurrency,
      });

      const { url } = res.data;
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm overflow-y-auto py-10 px-4">
      <div className="absolute inset-0" onClick={() => !loading && onClose()} />

      <div className="relative z-10 w-full max-w-lg bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="px-6 pt-6 pb-4 border-b border-slate-200 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Subscribe to {plan.name}</h2>
              <p className="text-sm text-slate-500 mt-1">Secure payment via international standards</p>
            </div>
            <button 
              onClick={onClose} 
              disabled={loading}
              className="text-slate-400 hover:text-slate-600 text-xl p-2"
            >
              ✕
            </button>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="text-xs font-semibold uppercase text-slate-400">Select Currency:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setSelectedCurrency(c.code as CurrencyCode)}
                  disabled={loading}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    selectedCurrency === c.code
                      ? 'bg-white text-[#f97316] shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {c.symbol} {c.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-8">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 mb-6">
            <h3 className="text-sm font-bold text-slate-600 mb-3">Plan Features:</h3>
            <ul className="space-y-2">
              {plan.features?.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="text-[#f97316] mt-0.5">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔒</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  Secure Payment with TVK Global Members
                </p>
                <p className="text-xs text-blue-700">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm mb-6">
              ⚠️ {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600">Monthly subscription:</span>
            <span className="text-2xl font-black text-slate-900">
              {priceLoading ? '...' : `${currentSymbol}${displayPrice ?? plan.price}`}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={loading || priceLoading}
            className="w-full bg-gradient-to-r from-[#f97316] to-[#facc15] text-white font-black py-4 rounded-2xl shadow-lg hover:brightness-105 transition-all disabled:opacity-50"
          >
            {loading ? 'Preparing your checkout..' : 'Continue to Payment'}
          </button>
          <p className="text-xs text-center text-slate-500 mt-3">
            You can cancel anytime from your account settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default MembershipPaymentModal;