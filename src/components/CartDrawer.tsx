import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getFullImageUrl } from '../utils/imageUrl';
import { useNavigate } from 'react-router-dom';

const CartDrawer: React.FC = () => {
    const { 
        isCartOpen, 
        toggleCart, 
        items, 
        removeFromCart, 
        updateQuantity, 
        getCartTotal,
        clearCart 
    } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        toggleCart();
        navigate('/checkout');
    };

    return (
        <AnimatePresence>
            {/* Backdrop */}
            {isCartOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={toggleCart}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-hidden"
                />
            )}

            {/* Side Drawer */}
            {isCartOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-[#0F0F0F] border-l border-white/10 z-[60] shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <ShoppingBag className="text-brand-gold" size={24} />
                            <h2 className="text-2xl font-zentry font-black text-white uppercase tracking-wide">
                                Cart
                            </h2>
                            <span className="bg-white/10 px-2 py-1 rounded text-xs font-bold font-mono text-brand-gold">
                                {items.reduce((acc, i) => acc + i.quantity, 0)} items
                            </span>
                        </div>
                        <button 
                            onClick={toggleCart}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-neutral-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                                <ShoppingBag size={48} className="mb-4 text-neutral-600" />
                                <h3 className="text-lg font-bold text-white mb-2">Your cart is empty</h3>
                                <p className="text-sm text-neutral-400 max-w-[200px]">
                                    Looks like you haven't added anything to your cart yet.
                                </p>
                                <button 
                                    onClick={toggleCart}
                                    className="mt-6 px-6 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all text-sm font-bold uppercase tracking-wider"
                                >
                                    Start Browsing
                                </button>
                            </div>
                        ) : (
                            items.map((item) => (
                                <motion.div 
                                    layout
                                    key={item.id} 
                                    className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5 group hover:border-white/10 transition-colors"
                                >
                                    {/* Product Image */}
                                    <div className="w-20 h-24 bg-black rounded-lg overflow-hidden flex-shrink-0 relative">
                                        <img 
                                            src={getFullImageUrl(item.image)} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-white leading-tight line-clamp-1 pr-4">{item.name}</h4>
                                                <button 
                                                    onClick={() => removeFromCart(item.id)}
                                                    className="text-neutral-500 hover:text-red-500 transition-colors p-1 -mr-2 -mt-2"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            {item.variant && (
                                                <p className="text-xs text-brand-gold font-mono mb-2">{item.variant}</p>
                                            )}
                                            <div className="text-sm font-bold text-white">£{item.price.toFixed(2)}</div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center bg-black/50 border border-white/10 rounded-lg h-8">
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    disabled={item.quantity <= 1}
                                                    className="w-8 h-full flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                                                >
                                                    <Minus size={14} className="text-white fill-current" />
                                                </button>
                                                <span className="w-8 text-center text-sm font-bold font-mono text-white">{item.quantity}</span>
                                                <button 
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock}
                                                    className="w-8 h-full flex items-center justify-center text-white hover:bg-white/10 disabled:opacity-30 transition-colors"
                                                >
                                                    <Plus size={14} className="text-white fill-current" />
                                                </button>
                                            </div>
                                            {item.quantity >= item.stock && (
                                                <span className="text-[10px] text-red-400 font-bold uppercase">Max</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>

                    {/* Footer Actions */}
                    {items.length > 0 && (
                        <div className="p-6 bg-[#0a0a0a] border-t border-white/5 space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-neutral-400 text-sm">
                                    <span>Subtotal</span>
                                    <span className="text-white font-mono">£{getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-white text-lg font-black uppercase tracking-wide">
                                    <span>Total</span>
                                    <span className="text-brand-gold font-mono">£{getCartTotal().toFixed(2)}</span>
                                </div>
                                <p className="text-xs text-neutral-600 text-right">Shipping calculated at checkout</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={clearCart}
                                    className="px-4 py-4 rounded-lg font-bold uppercase tracking-wider text-xs border border-white/10 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all text-neutral-400"
                                >
                                    Clear Cart
                                </button>
                                <button 
                                    onClick={handleCheckout}
                                    className="px-4 py-4 bg-brand-gold rounded-lg text-black font-black uppercase tracking-wider text-sm hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_rgba(230,198,91,0.2)]"
                                >
                                    Checkout Now
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
