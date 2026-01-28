import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, Heart, Store as StoreIcon, XCircle, Zap } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { getFullImageUrl } from '../utils/imageUrl';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import type { WishlistItem } from '../services/wishlistService';
import type { Product } from '../types/product';

// Helper to resolve product image from various backend formats
const resolveProductImage = (product: Product | any): string | undefined => {
    // 1. Try primary_image (could be string or object)
    if (product.primary_image) {
        if (typeof product.primary_image === 'string') return getFullImageUrl(product.primary_image);
        if (typeof product.primary_image === 'object' && product.primary_image.url) {
            return getFullImageUrl(product.primary_image.url);
        }
    }
    
    // 2. Try media array
    if (product.media && product.media.length > 0) {
        return getFullImageUrl(product.media[0].url);
    }

    // 3. Check variants if any
    if (product.variants && product.variants.length > 0) {
        const variantImage = product.variants.find((v:any) => v.image_url)?.image_url;
        if (variantImage) return getFullImageUrl(variantImage);
    }

    // 4. Fallback legacy fields
    if (product.image_url) return getFullImageUrl(product.image_url);
    if (product.images && product.images.length > 0) return getFullImageUrl(product.images[0]);

    return undefined;
};

// Helper for variants check
const hasProductVariants = (product: Product | any): boolean => {
    return !!(product?.has_variants || (product?.variants && product.variants.length > 0));
};

const Wishlist: React.FC = () => {
    const { wishlist, removeFromWishlist, isLoading } = useWishlist();
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleAddToCart = (item: WishlistItem) => {
        // Robust check for variants
        const hasVariants = hasProductVariants(item.product);

        // For products with variants, it's better to go to details page.
        if (hasVariants) {
            navigate(`/store/products/${item.product.id}`);
        } else if (item.product) {
            addToCart({
                productId: item.product.id,
                name: item.product.name,
                price: item.product.discount_price || item.product.price,
                quantity: 1,
                image: resolveProductImage(item.product) || 'https://placehold.co/600x600/1a1a1a/white?text=No+Preview',
                type: 'merch', // Simplified defaults
                stock: item.product.stock_quantity
            });
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-brand-gold/30">
            <Header />
            
            <main className="container mx-auto px-4 pt-32 pb-24">
                <div className="flex items-center gap-4 mb-8">
                    <Heart size={32} className="text-brand-gold" fill="currentColor" />
                    <h1 className="text-4xl font-zentry font-black uppercase tracking-wide text-white">
                        My Wishlist
                    </h1>
                    <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-bold font-mono text-brand-gold">
                        {wishlist.length} Items
                    </span>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[4/5] bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlist.map((item) => (
                            <motion.div 
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={item.id}
                                className="group relative bg-[#0F0F0F] rounded-2xl overflow-hidden border border-white/5 hover:border-brand-gold/50 transition-all hover:-translate-y-1"
                            >
                                {/* Image */}
                                <div className="aspect-[4/5] relative bg-[#151515] p-6 cursor-pointer" onClick={() => navigate(`/store/products/${item.product.id}`)}>
                                    <img 
                                        src={resolveProductImage(item.product) || 'https://placehold.co/600x600/1a1a1a/white?text=No+Preview'} 
                                        alt={item.product.name}
                                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/1a1a1a/white?text=No+Preview';
                                        }}
                                    />
                                    
                                    {/* Remove Button */}
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromWishlist(item.product.id);
                                        }}
                                        className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-red-500 hover:text-white rounded-full text-white/50 transition-colors backdrop-blur-sm z-10"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    {/* Overlay Actions */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 bg-gradient-to-t from-black/90 to-transparent pt-12">
                                        
                                        {item.product.stock_quantity > 0 && item.product.stock_quantity <= 5 && (
                                            <div className="mb-2 text-center">
                                                <span className="inline-flex items-center gap-1 text-red-500 text-[10px] font-black uppercase tracking-wider bg-black/80 px-2 py-1 rounded">
                                                    <Zap size={10} className="fill-current" />
                                                    Only {item.product.stock_quantity} Left
                                                </span>
                                            </div>
                                        )}

                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddToCart(item);
                                            }}
                                            disabled={item.product.stock_quantity <= 0}
                                            className={`w-full font-heavy font-black py-3 rounded-lg transition-colors flex items-center justify-center gap-2 uppercase text-sm tracking-wider ${
                                                item.product.stock_quantity <= 0
                                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                                    : 'bg-white text-black hover:bg-brand-gold'
                                            }`}
                                        >
                                            {item.product.stock_quantity <= 0 ? (
                                                <>
                                                    <XCircle size={16} />
                                                    OUT OF STOCK
                                                </>
                                            ) : (
                                                <>
                                                    <ShoppingBag size={16} />
                                                    {hasProductVariants(item.product) ? 'View Options' : 'Add to Cart'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-4 bg-[#0F0F0F]">
                                    <div className="text-[10px] text-brand-gold font-bold uppercase tracking-widest opacity-80 mb-1">
                                        {item.product.category?.name || 'Artifact'}
                                    </div>
                                    <h3 
                                        onClick={() => navigate(`/store/products/${item.product.id}`)}
                                        className="font-bold text-white mb-2 line-clamp-1 hover:text-brand-gold cursor-pointer transition-colors"
                                    >
                                        {item.product.name}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono font-bold text-white">
                                            £{Number(item.product.discount_price || item.product.price).toFixed(2)}
                                        </span>
                                        {item.product.stock_quantity <= 0 ? (
                                            <span className="text-[10px] text-red-400 font-bold uppercase border border-red-500/20 bg-red-500/5 px-2 py-1 rounded">Out of Stock</span>
                                        ) : (
                                            <span className="text-[10px] text-green-400 font-bold uppercase border border-green-500/20 bg-green-500/5 px-2 py-1 rounded">In Stock</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-white/[0.02]">
                        <div className="bg-white/5 p-6 rounded-full mb-6">
                            <Heart size={40} className="text-white/20" />
                        </div>
                        <h3 className="text-2xl font-zentry font-bold text-white mb-2">WISHLIST EMPTY</h3>
                        <p className="text-neutral-500 mb-8">Save items here to track their signals.</p>
                        <button 
                            onClick={() => navigate('/store')}
                            className="px-8 py-3 bg-brand-gold text-black font-black uppercase rounded-full hover:brightness-110 transition-all flex items-center gap-2"
                        >
                            <StoreIcon size={18} />
                            Go to Store
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default Wishlist;
