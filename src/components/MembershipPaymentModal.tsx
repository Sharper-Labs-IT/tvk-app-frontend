import React, { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axiosClient from "../api/axiosClient";
import type { Plan } from "../types/plan";

interface MembershipPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: Plan | null;
  onSuccess?: () => void;
}

const MembershipPaymentModal: React.FC<MembershipPaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSuccess,
}) => {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState("");
  const [saveCard, setSaveCard] = useState(true);

  if (!isOpen || !plan) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) {
      setError("Payment system is not ready yet. Please try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Unable to find card input field.");
      return;
    }

    setLoading(true);

    try {
      // 1) Create PaymentMethod on Stripe
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod(
        {
          type: "card",
          card: cardElement,
          billing_details: {
            name: cardholderName || undefined,
          },
        }
      );

      if (pmError || !paymentMethod) {
        setError(pmError?.message || "Unable to create payment method.");
        setLoading(false);
        return;
      }

      // 2) Call backend
      const res = await axiosClient.post("/payments/subscribe", {
        plan_id: plan.id,
        payment_method_id: paymentMethod.id,
        save_card: saveCard, // backend can ignore/handle this
      });

      console.log("payments/subscribe response:", res.data);

      const data = res.data;
      if(data.requires_action && data.client_secret){
        const {error: confirmationError} = await stripe.confirmCardPayment(
          data.client_secret
        );
        if(confirmationError){
          setError(confirmationError.message || "Payment confirmation failed.");
          setLoading(false);
          return;
        }
        console.log("Stripe confirmation successful. Webhook Pending");
      }else if(data.status === "active" || data.status === "trailing"){
        console.log("Subscription activated immediately");
      }else{
        setError(`Subscription created with status: ${data.status}. No action taken.`);
        setLoading(false);
        return;
      }

      if(onSuccess){
        onSuccess();
      }

    
      onClose();
    } catch (err: any) {
      console.error("payments/subscribe error:", err?.response || err);
      const msg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? (Object.values(err.response.data.errors) as string[][])
              .flat()
              .join(" ")
          : "Unable to start subscription. Please try again.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice =
    plan.price && plan.price !== "0.00" ? `$${plan.price}` : "Free";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {/* background click close */}
      <div
        className="absolute inset-0"
        onClick={() => !loading && onClose()}
      />

      <div className="relative z-10 w-full max-w-2xl rounded-3xl bg-[#f9fafb] text-slate-900 shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors text-lg"
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-200">
          <h2 className="text-lg md:text-xl font-semibold text-slate-900">
            Provide payment details
          </h2>
          <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
            <span>✅</span>
            <span>Your payment information is safe with us</span>
          </div>

          {/* Plan summary pill */}
          <div className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-2">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                Plan
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {plan.name}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wide text-slate-400">
                Amount
              </span>
              <span className="text-sm font-semibold text-[#f97316]">
                {formattedPrice}
                {formattedPrice !== "Free" && (
                  <span className="text-[11px] text-slate-500"> / month</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-5">
          {/* "Add a new card" row */}
          <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">
                💳
              </span>
              <span>Add a new card</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <span className="px-2 py-1 rounded bg-slate-100">VISA</span>
              <span className="px-2 py-1 rounded bg-slate-100">Mastercard</span>
              <span className="px-2 py-1 rounded bg-slate-100">AMEX</span>
              <span className="underline cursor-default">Full list</span>
            </div>
          </div>

          {/* Card + name fields (2-column feel like screenshot) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* CardElement styled like "Card number" field */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Card number
              </label>
              <div className="rounded-xl bg-white border border-slate-300 px-3 py-2.5 shadow-sm focus-within:border-[#f59e0b] focus-within:ring-1 focus-within:ring-[#f59e0b] transition-all">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "14px",
                        color: "#111827",
                        "::placeholder": { color: "#9ca3af" },
                      },
                      invalid: { color: "#ef4444" },
                    },
                    hidePostalCode: false,
                  }}
                />
              </div>
            </div>

            {/* Cardholder name */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Cardholder name
              </label>
              <input
                type="text"
                className="w-full rounded-xl bg-white border border-slate-300 px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b] outline-none"
                placeholder="Name on card"
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
              />
            </div>
          </div>

          {/* Save card toggle */}
          <label className="mt-1 flex items-center gap-2 text-xs md:text-sm text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#f59e0b] focus:ring-[#f59e0b]"
            />
            <span>Save card details for faster checkout next time</span>
          </label>

          {/* Error box */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-300 px-3 py-2">
              <span className="mt-[2px] text-xs">⚠️</span>
              <p className="text-xs md:text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Security info list */}
          <div className="mt-2 rounded-2xl bg-white border border-slate-200 px-4 py-3 space-y-2 text-xs md:text-sm text-slate-700">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs">
                🔒
              </span>
              <span>TVK protects your payment information</span>
            </div>
            <ul className="space-y-1 pl-1">
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✔</span>
                <span>Industry-standard encryption for all card details.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✔</span>
                <span>Card data is processed securely via Stripe.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-500">✔</span>
                <span>We never sell or misuse your payment information.</span>
              </li>
            </ul>
          </div>
        </form>

        {/* Bottom sticky CTA like AliExpress */}
        <div className="px-6 pb-5 pt-3 border-t border-slate-200 bg-white">
          <button
            type="button"
            onClick={handleSubmit as any}
            disabled={loading || !stripe}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#f97316] via-[#f59e0b] to-[#facc15] text-white font-semibold text-sm md:text-base px-6 py-3 shadow-md hover:shadow-lg hover:brightness-105 transition-all disabled:opacity-70"
          >
            {loading ? "Processing..." : "Save & confirm subscription"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembershipPaymentModal;
