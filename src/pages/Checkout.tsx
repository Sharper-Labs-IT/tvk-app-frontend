import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { getFullImageUrl } from '../utils/imageUrl';
import { orderService } from '../services/orderService';
import type { CreateOrderPayload } from '../services/orderService';
import toast from 'react-hot-toast';
import { Check, CreditCard, Lock, MapPin } from 'lucide-react';
import { COUNTRIES } from '../constants/countrieslist';

const Checkout: React.FC = () => {
    const { items, getCartTotal } = useCart();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    
    // Address Form State
    const [shippingAddress, setShippingAddress] = useState({
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'GB' // Default UK
    });
    
    const [referralCode, setReferralCode] = useState('');
    const [validatingReferral, setValidatingReferral] = useState(false);
    const [referralValid, setReferralValid] = useState<boolean | null>(null);
    const [discountAmount, setDiscountAmount] = useState(0);

    const subtotal = getCartTotal();
    const shippingCost = items.some(i => i.type === 'merch') ? 5.99 : 0; // Simplified logic
    const total = subtotal + shippingCost - discountAmount;

    useEffect(() => {
        if (items.length === 0) {
            navigate('/store');
        }
    }, [items, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const validateReferral = async () => {
        if (!referralCode) return;
        setValidatingReferral(true);
        try {
            const result = await orderService.validateReferral(referralCode);
            if (result.valid) {
                setReferralValid(true);
                setDiscountAmount(result.discount_amount);
                toast.success(`Code applied! £${result.discount_amount} off`);
            } else {
                setReferralValid(false);
                setDiscountAmount(0);
                toast.error(result.error || 'Invalid code');
            }
        } catch {
            setReferralValid(false);
        } finally {
            setValidatingReferral(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const payload: CreateOrderPayload = {
            shipping_address: shippingAddress,
            referral_code: referralValid ? referralCode : undefined,
            currency: 'GBP'
        };

        try {
            const response = await orderService.createOrder(payload);
            
            // Redirect to Stripe
            if (response.checkout_url) {
                window.location.href = response.checkout_url; 
            } else {
                toast.error("Checkout failed to initialize");
            }
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const error = err as any;
            console.error("Checkout Error:", error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Checkout failed';
            
            // Helpful error for empty description issue (Stripe/Backend generic 500)
            if (errorMessage.includes("passed an empty string for 'line_items") && errorMessage.includes("description")) {
                toast.error("System Error: One of the products has a missing description in the database. Please contact support.");
            } else {
                toast.error(errorMessage);
            }
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-brand-gold/30">
            <Header />
            
            <main className="container mx-auto px-4 pt-32 pb-24">
                <h1 className="text-4xl font-zentry font-black uppercase tracking-wide text-white mb-8">
                    Secure Checkout
                </h1>

                <div className="flex flex-col lg:flex-row gap-12">
                     {/* Left Column: Forms */}
                     <div className="flex-1 space-y-8">
                        
                         <section>
                             <h2 className="text-xl font-bold font-mono text-brand-gold mb-4 flex items-center gap-2">
                                 <MapPin size={20} /> Shipping Address
                             </h2>
                             <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="md:col-span-2">
                                     <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Address Line 1</label>
                                     <input required name="line1" value={shippingAddress.line1} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-gold outline-none transition-colors" />
                                 </div>
                                 <div className="md:col-span-2">
                                     <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Address Line 2</label>
                                     <input name="line2" value={shippingAddress.line2} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-gold outline-none transition-colors" />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">City</label>
                                     <input required name="city" value={shippingAddress.city} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-gold outline-none transition-colors" />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">State/Province</label>
                                     <input name="state" value={shippingAddress.state} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-gold outline-none transition-colors" />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Postal Code</label>
                                     <input required name="postal_code" value={shippingAddress.postal_code} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-brand-gold outline-none transition-colors" />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Country</label>
                                     <select 
                                         name="country" 
                                         value={shippingAddress.country} 
                                         onChange={handleInputChange} 
                                         className="w-full bg-[#1A1A1A] border border-white/20 rounded-lg p-3 text-white focus:border-brand-gold outline-none transition-colors"
                                     >
                                         <option value="" className="bg-[#1A1A1A] text-white">Select Country</option>
                                         {COUNTRIES.map((country) => (
                                             <option key={country.code} value={country.code} className="bg-[#1A1A1A] text-white">
                                                 {country.name}
                                             </option>
                                         ))}
                                     </select>
                                 </div>
                             </form>
                         </section>

                     </div>

                     {/* Right Column: Summary */}
                     <div className="w-full lg:w-96 space-y-6">
                         <div className="bg-[#0F0F0F] border border-white/5 rounded-2xl p-6 sticky top-24">
                             <h3 className="font-zentry font-bold text-lg mb-4">Order Summary</h3>
                             
                             <div className="max-h-60 overflow-y-auto mb-6 pr-2 space-y-3 custom-scrollbar">
                                 {items.map(item => (
                                     <div key={item.id} className="flex gap-3">
                                         <img src={getFullImageUrl(item.image)} className="w-12 h-12 rounded bg-white/5 object-cover" />
                                         <div className="flex-1 overflow-hidden">
                                             <div className="font-bold text-sm truncate">{item.name}</div>
                                             <div className="text-xs text-neutral-500">x{item.quantity} {item.variant}</div>
                                         </div>
                                         <div className="font-mono text-sm font-bold">£{(item.price * item.quantity).toFixed(2)}</div>
                                     </div>
                                 ))}
                             </div>

                             {/* Referral Code */}
                             <div className="mb-6">
                                 <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Promo Code</label>
                                 <div className="flex gap-2">
                                     <input 
                                        value={referralCode}
                                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-brand-gold outline-none"
                                        placeholder="CODE"
                                     />
                                     <button 
                                        type="button"
                                        onClick={validateReferral}
                                        disabled={validatingReferral || !referralCode}
                                        className="bg-white/10 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-white/20"
                                     >
                                         {validatingReferral ? '...' : 'Apply'}
                                     </button>
                                 </div>
                                 {referralValid === true && <div className="text-green-400 text-xs mt-1 flex items-center gap-1"><Check size={12}/> Code Applied</div>}
                             </div>

                             <div className="space-y-3 text-sm mb-6 pt-6 border-t border-white/10">
                                <div className="flex justify-between text-neutral-400">
                                    <span>Subtotal</span>
                                    <span className="text-white font-mono">£{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-neutral-400">
                                    <span>Shipping</span>
                                    <span className="text-white font-mono">£{shippingCost.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Discount</span>
                                        <span className="font-mono">-£{discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t border-white/10 my-2" />
                                <div className="flex justify-between text-xl font-black uppercase text-white">
                                    <span>Total</span>
                                    <span className="text-brand-gold font-mono">£{total.toFixed(2)}</span>
                                </div>
                            </div>
                            
                            <button 
                                form="checkout-form"
                                disabled={isLoading}
                                className="w-full bg-brand-gold text-black font-black text-lg py-4 rounded-xl uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(230,198,91,0.2)] flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Lock size={18} /> Pay Securely
                                    </>
                                )}
                            </button>
                            <div className="mt-4 flex justify-center text-neutral-500 gap-2 text-xs">
                                <div className="flex items-center gap-1"><CreditCard size={12}/> Encrypted Payment</div>
                            </div>
                         </div>
                     </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Checkout;
