import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  Package,
  Sparkles,
  Tag,
  CreditCard,
  Truck,
  Shield,
  ChevronRight,
  Loader
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const navigate = useNavigate();
  const { 
    items: cartItems, 
    updateQuantity, 
    removeFromCart, 
    getCartTotal, 
    isLoading 
  } = useCart();
  
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'TVK2026') {
      setAppliedPromo(promoCode);
      setPromoDiscount(10); // 10% discount
      setPromoCode('');
    }
  };

  const subtotal = getCartTotal();
  const discount = (subtotal * promoDiscount) / 100;
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = (subtotal - discount) * 0.08; // 8% tax
  const total = subtotal - discount + shipping + tax;

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
      // Prevent updates while loading to avoid race conditions
      if (isLoading) return;
      updateQuantity(id, newQuantity);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-20 sm:pt-24 pb-16 sm:pb-20 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 flex items-center gap-2 sm:gap-4">
            <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-[#FFD700] flex-shrink-0" />
            <span className="break-words">Shopping Cart</span>
          </h1>
          <p className="text-white/60 text-sm sm:text-base lg:text-lg">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </motion.div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 sm:py-16 lg:py-20 px-4"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white/5 border-2 border-white/10 mb-4 sm:mb-6">
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-white/30" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Your cart is empty</h2>
            <p className="text-white/60 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto px-4">
              Looks like you haven't added anything to your cart yet. Start shopping now!
            </p>
            <button
              onClick={() => navigate('/store')}
              className="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-sm sm:text-base font-bold rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 touch-manipulation"
            >
              Browse Store
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {isLoading && (
                 <div className="flex items-center gap-2 text-[#FFD700] mb-2 animate-pulse">
                     <Loader className="animate-spin" size={16} /> Updating cart...
                 </div>
              )}
              <AnimatePresence mode="popLayout">
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-gradient-to-br from-[#1a1a2e]/80 to-[#0f0f1a]/80 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-[#FFD700]/30 transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      {/* Item Image */}
                      <div className="relative w-full sm:w-28 md:w-32 h-28 sm:h-28 md:h-32 flex-shrink-0 rounded-xl overflow-hidden bg-black/30">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {item.type === 'coins' && (
                          <div className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/20 to-transparent" />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 break-words">{item.name}</h3>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-white/60">
                              {item.size && (
                                <span className="flex items-center gap-1">
                                  <Package className="w-4 h-4" />
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="flex items-center gap-1">
                                  <Sparkles className="w-4 h-4" />
                                  {item.color}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-2 text-white/40 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all duration-300 touch-manipulation flex-shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>

                        {/* Price and Quantity Controls */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mt-4">
                          <div className="text-xl sm:text-2xl font-bold text-[#FFD700] order-2 sm:order-1">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 sm:gap-3 order-1 sm:order-2">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || isLoading}
                              className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 active:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all duration-300 touch-manipulation"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4 text-white" />
                            </button>
                            <span className="text-white font-bold w-10 sm:w-12 text-center text-base sm:text-lg">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.stock || isLoading}
                              className="p-2 sm:p-2.5 bg-white/5 hover:bg-white/10 active:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-all duration-300 touch-manipulation"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {item.quantity >= item.stock && (
                          <p className="text-orange-400 text-sm mt-2 flex items-center gap-1">
                            <Shield className="w-4 h-4" />
                            Maximum stock reached
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="lg:sticky lg:top-24 bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10"
              >
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
                  Order Summary
                </h2>

                {/* Promo Code */}
                <div className="mb-4 sm:mb-6">
                  <label className="text-white/80 text-xs sm:text-sm font-medium mb-2 block">
                    Promo Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm sm:text-base placeholder-white/30 focus:outline-none focus:border-[#FFD700]/50 touch-manipulation"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-3 sm:px-4 py-2.5 sm:py-3 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 active:bg-[#FFD700]/30 text-[#FFD700] text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 touch-manipulation whitespace-nowrap"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedPromo && (
                    <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      {appliedPromo} applied! {promoDiscount}% off
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 py-4 border-y border-white/10">
                  <div className="flex justify-between text-white/80">
                    <span>Subtotal</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount</span>
                      <span className="font-semibold">-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white/80">
                    <span className="flex items-center gap-1">
                      <Truck className="w-4 h-4" />
                      Shipping
                    </span>
                    <span className="font-semibold">
                      {shipping === 0 ? (
                        <span className="text-green-400">FREE</span>
                      ) : (
                        `$${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-white/80">
                    <span>Tax</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center py-4">
                  <span className="text-xl font-bold text-white">Total</span>
                  <span className="text-3xl font-black text-[#FFD700]">
                    ${total.toFixed(2)}
                  </span>
                </div>

                {/* Free Shipping Notice */}
                {shipping > 0 && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-400 text-sm">
                      Add ${(50 - subtotal).toFixed(2)} more for FREE shipping!
                    </p>
                  </div>
                )}

                {/* Checkout Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="group w-full py-3 sm:py-4 px-4 sm:px-6 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-sm sm:text-base font-bold rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 mb-3 sm:mb-4 touch-manipulation"
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                  Proceed to Checkout
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Continue Shopping */}
                <button
                  onClick={() => navigate('/store')}
                  className="w-full py-2.5 sm:py-3 px-4 sm:px-6 bg-white/5 hover:bg-white/10 active:bg-white/15 text-white text-sm sm:text-base font-semibold rounded-xl transition-all duration-300 touch-manipulation"
                >
                  Continue Shopping
                </button>

                {/* Security Badge */}
                <div className="mt-6 flex items-center justify-center gap-2 text-white/40 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>Secure Checkout</span>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
