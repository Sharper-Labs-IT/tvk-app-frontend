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

  if (!isOpen || !plan) {
    return null;
  }

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
      const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (pmError || !paymentMethod) {
        setError(pmError?.message || "Unable to create payment method.");
        setLoading(false);
        return;
      }

      // 2) Call your existing backend endpoint
      const res = await axiosClient.post("/payments/subscribe", {
        plan_id: plan.id,
        payment_method_id: paymentMethod.id, // this fixes the 422
      });

      console.log("payments/subscribe response:", res.data);

      // Optional: handle success message/UI
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (err: any) {
      console.error("payments/subscribe error:", err?.response || err);
      const msg =
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(" ")
          : "Unable to start subscription. Please try again.");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-2xl bg-[#07091a] p-6 shadow-xl border border-[#1d2340]">
        <h2 className="text-xl font-semibold text-white mb-1">
          Subscribe to {plan.name}
        </h2>
        <p className="text-sm text-slate-300 mb-4">
          Enter your card details to activate the{" "}
          <span className="font-semibold text-[#f7c948]">{plan.name}</span> plan.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg bg-[#111827] px-3 py-2 border border-[#1d2340]">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#e5e7eb",
                    "::placeholder": { color: "#6b7280" },
                  },
                  invalid: { color: "#f97373" },
                },
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-900/20 border border-red-500/50 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-[#111827] transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !stripe}
              className="flex-1 rounded-full bg-[#f7c948] text-[#111827] px-4 py-2 text-sm font-semibold hover:bg-[#f4b41a] transition-colors disabled:opacity-70"
            >
              {loading ? "Processing..." : `Pay & Subscribe`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MembershipPaymentModal;