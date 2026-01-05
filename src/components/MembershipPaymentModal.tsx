import React, { useState, useEffect } from 'react';
import {
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';
import axiosClient from '../api/axiosClient';
import type { Plan } from '../types/plan';
import { COUNTRIES, getCountryName } from '../constants/countrieslist';

// Define the specific allowed currency types
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
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency || 'GBP');
  const [displayPrice, setDisplayPrice] = useState<string | null>(null);

  const [cardholderName, setCardholderName] = useState('');
  const [address, setAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '', // This will now store the 2-letter code (e.g., 'LK')
  });

  const stripeElementOptions = {
    style: {
      base: {
        fontSize: '14px',
        color: '#000000',
        fontWeight: '500',
        fontFamily: 'Inter, sans-serif',
        '::placeholder': {
          color: '#94a3b8',
        },
      },
      invalid: {
        color: '#dc2626',
      },
    },
  };

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

  if (!isOpen || !plan) return null;

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      setError('Payment system is not ready yet.');
      return;
    }

    const cardNumberElement = elements.getElement(CardNumberElement);
    if (!cardNumberElement) return;

    setLoading(true);

    try {
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
        billing_details: {
          name: cardholderName,
          address: {
            line1: address.line1,
            line2: address.line2 || undefined,
            city: address.city,
            state: address.state || undefined,
            postal_code: address.postal_code,
            country: address.country, // Sends the 2-letter code to Stripe
          },
        },
      });

      if (pmError || !paymentMethod) {
        setError(pmError?.message || 'Unable to create payment method.');
        setLoading(false);
        return;
      }

      // We send the full country name to the database, but keep the code for Stripe logic if needed
      const res = await axiosClient.post('/payments/subscribe', {
        plan_id: plan.id,
        payment_method_id: paymentMethod.id,
        currency: selectedCurrency,
        address: {
          ...address,
          country_full: getCountryName(address.country), // Helper to send "Sri Lanka" to backend
          country_code: address.country, // Sends "LK" to backend
        },
      });

      const data = res.data;

      if (data.requires_action && data.client_secret) {
        const { error: confirmationError } = await stripe.confirmCardPayment(data.client_secret);
        if (confirmationError) {
          setError(confirmationError.message || 'Payment confirmation failed.');
          setLoading(false);
          return;
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Subscription failed. Please check your details.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const currentSymbol = CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || '£';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm overflow-y-auto py-10 px-4">
      <div className="absolute inset-0" onClick={() => !loading && onClose()} />

      <div className="relative z-10 w-full max-w-2xl bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200">
        <div className="px-6 pt-6 pb-4 border-b border-slate-200 bg-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Checkout</h2>
              <p className="text-sm text-slate-500">Complete your subscription for {plan.name}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl p-2">
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

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-h-[60vh] bg-[#fdfdfd]"
        >
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="p-1.5 bg-slate-100 rounded-lg">📍</span> Billing Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Address Line 1
                </label>
                <input
                  name="line1"
                  required
                  placeholder="Street name and house number"
                  className="w-full mt-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-black bg-white focus:border-[#f59e0b] outline-none"
                  value={address.line1}
                  onChange={handleAddressChange}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">City</label>
                <input
                  name="city"
                  required
                  className="w-full mt-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-black bg-white focus:border-[#f59e0b] outline-none"
                  value={address.city}
                  onChange={handleAddressChange}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Postal Code
                </label>
                <input
                  name="postal_code"
                  required
                  className="w-full mt-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-black bg-white focus:border-[#f59e0b] outline-none"
                  value={address.postal_code}
                  onChange={handleAddressChange}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Country</label>
                <select
                  name="country"
                  required
                  className="w-full mt-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-black bg-white focus:border-[#f59e0b] outline-none appearance-none"
                  value={address.country}
                  onChange={handleAddressChange}
                >
                  <option value="">Select Country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  State / Province
                </label>
                <input
                  name="state"
                  className="w-full mt-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-black bg-white focus:border-[#f59e0b] outline-none"
                  value={address.state}
                  onChange={handleAddressChange}
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="p-1.5 bg-slate-100 rounded-lg">💳</span> Payment Information
            </h3>
            <div className="space-y-4 rounded-2xl bg-white border border-slate-200 p-5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full mt-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-black bg-white focus:border-[#f59e0b] outline-none"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">
                  Card Number
                </label>
                <div className="rounded-xl border border-slate-300 px-4 py-3 bg-white">
                  <CardNumberElement options={stripeElementOptions} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">
                    Expiry Date
                  </label>
                  <div className="rounded-xl border border-slate-300 px-4 py-3 bg-white">
                    <CardExpiryElement options={stripeElementOptions} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase">CVC</label>
                  <div className="rounded-xl border border-slate-300 px-4 py-3 bg-white">
                    <CardCvcElement options={stripeElementOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
              ⚠️ {error}
            </div>
          )}
        </form>

        <div className="p-6 border-t border-slate-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600">Total amount to pay:</span>
            <span className="text-2xl font-black text-slate-900">
              {priceLoading ? '...' : `${currentSymbol}${displayPrice ?? plan.price}`}
            </span>
          </div>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading || priceLoading}
            className="w-full bg-gradient-to-r from-[#f97316] to-[#facc15] text-white font-black py-4 rounded-2xl shadow-lg hover:brightness-105 transition-all disabled:opacity-50"
          >
            {loading ? 'Processing Securely...' : `Pay & Subscribe Now`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipPaymentModal;
