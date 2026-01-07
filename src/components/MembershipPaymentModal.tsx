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
import { COUNTRIES } from '../constants/countrieslist';

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

  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError(null);

  //   if (!stripe || !elements) {
  //     setError('Payment system is not ready yet.');
  //     return;
  //   }

  //   const cardNumberElement = elements.getElement(CardNumberElement);
  //   if (!cardNumberElement) return;

  //   setLoading(true);

  //   try {
  //     // Step 1: Create Payment Method
  //     const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
  //       type: 'card',
  //       card: cardNumberElement,
  //       billing_details: {
  //         name: cardholderName,
  //         address: {
  //           line1: address.line1,
  //           line2: address.line2 || undefined,
  //           city: address.city,
  //           state: address.state || undefined,
  //           postal_code: address.postal_code,
  //           country: address.country,
  //         },
  //       },
  //     });

  //     if (pmError || !paymentMethod) {
  //       setError(pmError?.message || 'Unable to create payment method.');
  //       setLoading(false);
  //       return;
  //     }

  //     // Step 2: Create Subscription on Backend
  //     const res = await axiosClient.post('/payments/subscribe', {
  //       plan_id: plan.id,
  //       payment_method_id: paymentMethod.id,
  //       currency: selectedCurrency,
  //       address: {
  //         line1: address.line1,
  //         line2: address.line2 || '',
  //         city: address.city,
  //         state: address.state || '',
  //         postal_code: address.postal_code,
  //         // country: getCountryName(address.country), // Send full country name
  //         country: address.country,
  //       },
  //     });

  //     const data = res.data;

  //     console.log('=== Backend Response ===');
  //     console.log('Full response:', data);
  //     console.log('requires_action:', data.requires_action);
  //     console.log('client_secret:', data.client_secret);
  //     console.log('success:', data.success);
  //     console.log('=======================');

  //     // Step 3: Handle 3DS Authentication if Required
  //     if (data.requires_action && data.client_secret) {

  //       console.log('🔐 3DS authentication required!');
  //       console.log('Client secret:', data.client_secret);

  //       const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
  //         data.client_secret
  //       );

  //       if (confirmError) {
  //         setError(confirmError.message || 'Payment authentication failed.');
  //         setLoading(false);
  //         return;
  //       }

  //       if (paymentIntent?.status === 'succeeded') {
  //         console.log('Payment succeeded after 3DS authentication');
  //         setPaymentSuccess(true);

  //         // Wait a moment to show success message
  //         setTimeout(() => {
  //           if (onSuccess) onSuccess();
  //           onClose();
  //         }, 2000);
  //       } else {
  //         setError('Payment verification incomplete. Please try again.');
  //         setLoading(false);
  //       }
  //     } else if (data.success) {
  //       // Payment succeeded without 3DS
  //       console.log('Payment succeeded without 3DS');
  //       setPaymentSuccess(true);

  //       // Wait a moment to show success message
  //       setTimeout(() => {
  //         if (onSuccess) onSuccess();
  //         onClose();
  //       }, 2000);
  //     } else {
  //       setError(data.message || 'Subscription failed. Please try again.');
  //       setLoading(false);
  //     }

  //   } catch (err: any) {
  //     console.error('Subscription error:', err);
  //     const msg = err?.response?.data?.message || err?.response?.data?.error || 'Subscription failed. Please check your details.';
  //     setError(msg);
  //     setLoading(false);
  //   }
  // };

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
      // Step 1: Create Payment Method
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
            country: address.country,
          },
        },
      });

      if (pmError || !paymentMethod) {
        setError(pmError?.message || 'Unable to create payment method.');
        setLoading(false);
        return;
      }

      // Step 2: Create Subscription on Backend
      const res = await axiosClient.post('/payments/subscribe', {
        plan_id: plan.id,
        payment_method_id: paymentMethod.id,
        currency: selectedCurrency,
        address: {
          line1: address.line1,
          line2: address.line2 || '',
          city: address.city,
          state: address.state || '',
          postal_code: address.postal_code,
          country: address.country,
        },
      });

      const data = res.data;

      console.log('=== Backend Response ===');
      console.log('Subscription created:', data.subscription_id);
      console.log('Status:', data.status);
      console.log('=======================');

      // Step 3: Check if subscription is already active (no 3DS needed)
      if (data.status === 'active') {
        console.log('✅ Payment succeeded without 3DS');
        setPaymentSuccess(true);

        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 2000);
        return;
      }

      // Step 4: Poll for payment intent (subscription is incomplete)
      console.log('⏳ Subscription incomplete, polling for payment intent...');

      const maxAttempts = 20;
      const delayMs = 1000; // 1 second between attempts

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Polling attempt ${attempt}/${maxAttempts}...`);

        await new Promise((resolve) => setTimeout(resolve, delayMs));

        try {
          const piRes = await axiosClient.post('/payments/subscription-payment-intent', {
            subscription_id: data.subscription_id,
          });

          const piData = piRes.data;

          console.log(`Attempt ${attempt} result:`, piData);

          if (piData.found && piData.requires_action && piData.client_secret) {
            console.log('🔐 3DS authentication required!');
            console.log('Client secret found:', piData.client_secret);

            // Step 5: Confirm payment with 3DS
            const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(
              piData.client_secret
            );

            if (confirmError) {
              console.error('3DS confirmation error:', confirmError);
              setError(confirmError.message || 'Payment authentication failed.');
              setLoading(false);
              return;
            }

            console.log('PaymentIntent after confirmation:', paymentIntent);

            if (paymentIntent?.status === 'succeeded') {
              console.log('✅ Payment succeeded after 3DS authentication');
              setPaymentSuccess(true);

              // Wait for webhook to process
              await new Promise((resolve) => setTimeout(resolve, 3000));

              if (onSuccess) onSuccess();
              onClose();
              return;
            }
          } else if (piData.subscription_status === 'active') {
            // Payment succeeded during polling
            console.log('✅ Payment succeeded during polling');
            setPaymentSuccess(true);

            setTimeout(() => {
              if (onSuccess) onSuccess();
              onClose();
            }, 2000);
            return;
          }
        } catch (pollError: any) {
          console.error('Polling error:', pollError);
          // Continue polling on error
        }
      }

      // If we get here, polling timed out
      setError('Payment verification timed out. Please check your account or contact support.');
      setLoading(false);
    } catch (err: any) {
      console.error('Subscription error:', err);
      console.error('Error response:', err?.response?.data);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Subscription failed. Please check your details.';
      setError(msg);
      setLoading(false);
    }
  };

  const currentSymbol = CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol || '£';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm overflow-y-auto py-10 px-4">
      <div className="absolute inset-0" onClick={() => !loading && onClose()} />

      <div className="relative z-10 w-full max-w-2xl bg-[#ffffff] rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto border border-slate-200">
        {loading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm font-bold text-slate-700">
                {paymentSuccess ? 'Activating membership...' : 'Processing payment securely...'}
              </p>
              <p className="text-xs text-slate-500 mt-2">Please do not close this window</p>
            </div>
          </div>
        )}

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

          {paymentSuccess && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-green-600 text-sm font-medium">
              ✓ Payment successful! Activating your membership...
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
            disabled={loading || priceLoading || paymentSuccess}
            className="w-full bg-gradient-to-r from-[#f97316] to-[#facc15] text-white font-black py-4 rounded-2xl shadow-lg hover:brightness-105 transition-all disabled:opacity-50"
          >
            {loading
              ? paymentSuccess
                ? 'Payment Successful! ✓'
                : 'Processing Securely...'
              : `Pay & Subscribe Now`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipPaymentModal;
