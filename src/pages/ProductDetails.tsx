import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  Heart, 
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Truck
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { storeService } from '../services/storeService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getFullImageUrl } from '../utils/imageUrl';
import type { Product, ProductVariant } from '../types/product';
import toast from 'react-hot-toast';

const ProductDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string>('');
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const data = await storeService.getProduct(id);
                setProduct(data);
                if (data.media?.length > 0) {
                    setActiveImage(getFullImageUrl(data.media.find(m => m.is_primary)?.url || data.media[0].url));
                }
                // Pre-select first variant if exists (optional logic)
                // if (data.variants && data.variants.length > 0) setSelectedVariant(data.variants[0]);
            } catch (error) {
                console.error("Failed to load product", error);
                toast.error("Product not found");
                navigate('/store');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!product) return null;

    const currentPrice = selectedVariant 
        ? (Number(product.price) + Number(selectedVariant.price_adjustment || 0)) 
        : Number(product.discount_price || product.price);
    
    const originalPrice = Number(product.price) + Number(selectedVariant?.price_adjustment || 0);
    const hasDiscount = Boolean(product.discount_price) && !selectedVariant; // Assuming variants usually don't have separate discount logic in simple model, or handle complex logic
    
    // Logic: If variant selected, use its stock. If not and no variants, use product stock.
    const currentStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
    const isOutOfStock = currentStock <= 0;

    const handleAddToCart = async () => {
        if (product.has_variants && !selectedVariant) {
            toast.error("Please select a valid option");
            return;
        }

        if (quantity > currentStock) {
            toast.error(`Only ${currentStock} items in stock`);
            return;
        }

        setAddingToCart(true);
        try {
            await addToCart({
                productId: product.id,
                name: product.name,
                price: currentPrice,
                quantity,
                image: activeImage,
                type: product.type === 'game_item' ? 'coins' : 'merch',
                stock: currentStock,
                variantId: selectedVariant?.id,
                variant: selectedVariant ? `${selectedVariant.attributes?.color || ''} ${selectedVariant.attributes?.size || ''}` : undefined
            });
            // Optional: Open cart or just toast (handled in context)
        } catch (error) {
            console.error(error);
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-brand-gold/30">
            <Header />
            
            <main className="container mx-auto px-4 pt-32 pb-24">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8 font-mono">
                    <button onClick={() => navigate('/store')} className="hover:text-brand-gold transition-colors">STORE</button>
                    <ChevronRight size={14} />
                    <span className="text-white truncate">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                    {/* Gallery Section */}
                    <div className="space-y-4">
                        <div className="aspect-[4/5] bg-[#111] rounded-2xl border border-white/5 overflow-hidden relative group">
                            <motion.img 
                                key={activeImage}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={activeImage} 
                                alt={product.name}
                                className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                            />
                            {hasDiscount && (
                                <div className="absolute top-4 left-4 bg-brand-gold text-black font-black px-3 py-1 rounded text-sm uppercase">
                                    Sale
                                </div>
                            )}
                        </div>
                        {/* Thumbnails */}
                        {product.media && product.media.length > 1 && (
                             <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                                 {product.media.map((media, index) => (
                                     <button
                                         key={media.id || media.url || index}
                                         onClick={() => setActiveImage(getFullImageUrl(media.url))}
                                         className={`w-20 h-24 rounded-lg bg-[#111] border flex-shrink-0 overflow-hidden ${
                                             activeImage === getFullImageUrl(media.url) ? 'border-brand-gold ring-1 ring-brand-gold/50' : 'border-white/5 hover:border-white/20'
                                         }`}
                                     >
                                         <img src={getFullImageUrl(media.url)} alt="" className="w-full h-full object-cover p-2" />
                                     </button>
                                 ))}
                             </div>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="flex flex-col">
                        <h1 className="text-4xl lg:text-5xl font-zentry font-black uppercase text-white mb-2 leading-none">
                            {product.name}
                        </h1>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-2xl font-mono text-brand-gold font-bold">
                                £{currentPrice.toFixed(2)}
                            </div>
                            {(hasDiscount || (originalPrice > currentPrice)) && (
                                <div className="text-lg text-neutral-500 line-through">
                                    £{originalPrice.toFixed(2)}
                                </div>
                            )}
                            {currentStock < 10 && currentStock > 0 && (
                                <span className="text-red-400 text-xs font-bold border border-red-500/30 bg-red-500/10 px-2 py-1 rounded">
                                    Low Stock: {currentStock} Left
                                </span>
                            )}
                        </div>

                        {/* Variants */}
                        {product.has_variants && product.variants && (
                            <div className="mb-8 space-y-4">
                                <label className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Select Option</label>
                                <div className="flex flex-wrap gap-3">
                                    {product.variants.map((v) => (
                                        <button
                                            key={v.id}
                                            onClick={() => {
                                                setSelectedVariant(v);
                                                setQuantity(1); // Reset quantity often helps prevent invalid state
                                            }}
                                            disabled={v.stock_quantity <= 0}
                                            className={`px-4 py-3 rounded-lg border font-mono text-sm transition-all relative overflow-hidden ${
                                                selectedVariant?.id === v.id
                                                    ? 'border-brand-gold bg-brand-gold/10 text-brand-gold'
                                                    : 'border-white/10 hover:border-white/30 text-neutral-300'
                                            } ${v.stock_quantity <= 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                        >
                                            <span className="relative z-10 flex flex-col items-start gap-1">
                                                <span>{v.attributes?.color} {v.attributes?.size && `- ${v.attributes.size}`}</span>
                                                {v.stock_quantity <= 0 && <span className="text-[10px] text-red-500 font-bold uppercase">Sold Out</span>}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4 mb-8">
                            {/* Quantity */}
                            <div className="flex items-center bg-[#111] border border-white/10 rounded-xl h-14 px-2">
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                                >
                                    -
                                </button>
                                <input 
                                    type="number" 
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.min(Number(e.target.value), currentStock))}
                                    className="w-12 bg-transparent text-center font-mono font-bold text-white outline-none appearance-none"
                                />
                                <button 
                                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                                    className="w-10 h-full flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
                                >
                                    +
                                </button>
                            </div>

                            {/* Add to Cart */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isOutOfStock || addingToCart || (product.has_variants && !selectedVariant)}
                                className="flex-1 bg-brand-gold text-black font-black text-lg rounded-xl uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(230,198,91,0.2)]"
                            >
                                {addingToCart ? (
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                ) : isOutOfStock ? (
                                    "Out of Stock"
                                ) : (
                                    <>
                                        <ShoppingBag size={20} />
                                        Add to Cart
                                    </>
                                )}
                            </button>

                            <button 
                                onClick={() => toggleWishlist(product.id)}
                                className={`w-14 h-14 flex items-center justify-center border rounded-xl transition-all ${
                                    isInWishlist(product.id)
                                        ? 'border-red-500 bg-red-500/10 text-red-500'
                                        : 'border-white/10 text-neutral-400 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10'
                                }`}
                            >
                                <Heart size={20} className={isInWishlist(product.id) ? "fill-current" : ""} />
                            </button>
                        </div>

                        {/* Metadata / Policy */}
                        <div className="grid grid-cols-2 gap-4 text-sm text-neutral-400 mb-8">
                            <div className="flex items-center gap-3">
                                <RotateCcw size={16} className="text-brand-gold" />
                                <span>30-Day Returns</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Truck size={16} className="text-brand-gold" />
                                <span>Global Shipping</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <ShieldCheck size={16} className="text-brand-gold" />
                                <span>Secure Checkout</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border-t border-white/10 pt-8">
                            <h3 className="text-lg font-bold font-zentry uppercase text-white mb-4">Product Details</h3>
                            <div className="text-neutral-400 leading-relaxed max-w-xl prose prose-inv-zinc" 
                                dangerouslySetInnerHTML={{ __html: product.description || product.short_description || '' }} 
                            />
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ProductDetails;
