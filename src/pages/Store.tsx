import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  Search, 
  Zap, 
  Lock,
  Heart,
  Eye,
  XCircle
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { storeService } from '../services/storeService';
import type { Product, ProductCategory } from '../types/product';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getFullImageUrl } from '../utils/imageUrl';

// --- Improved Components ---

import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  // Helper to get the best display image
  const getDisplayImage = () => {
    // 1. Try Media Array (Standard)
    if (product.media && product.media.length > 0) {
        const primary = product.media.find(m => m.is_primary);
        if (primary) return getFullImageUrl(primary.url);
        return getFullImageUrl(product.media[0].url);
    }
    
    // 2. Try Variant Images (Fallback if main product has no image but variants do)
    if (product.variants && product.variants.length > 0) {
        const variantWithImage = product.variants.find(v => v.image_url);
        if (variantWithImage) return getFullImageUrl(variantWithImage.image_url);
    }

    // 3. Try legacy/alternative fields (Backend consistency check)
    // Cast to any to bypass strict typing if the backend sends undocumented fields
    const p = product as any;

    // Explicitly check for 'primary_image' which was found in debug logs
    if (p.primary_image) {
        if (typeof p.primary_image === 'string') return getFullImageUrl(p.primary_image);
        if (typeof p.primary_image === 'object' && p.primary_image.url) return getFullImageUrl(p.primary_image.url);
    }

    if (p.image_url) return getFullImageUrl(p.image_url);
    if (p.image) return getFullImageUrl(p.image);
    if (p.thumbnail) return getFullImageUrl(p.thumbnail);
    if (p.cover_image) return getFullImageUrl(p.cover_image);
    if (p.media_url) return getFullImageUrl(p.media_url);

    // 4. Wildcard Image Search (Last Resort) - Look for any key containing 'image' or 'url' that is a string
    const potentialKeys = Object.keys(p).filter(k => 
        (k.includes('image') || k.includes('img') || k.includes('thumb')) && 
        typeof p[k] === 'string' && 
        p[k].length > 5
    );
    
    if (potentialKeys.length > 0) {
        return getFullImageUrl(p[potentialKeys[0]]);
    }

    return '';
  };

  const [activeImage, setActiveImage] = useState(getDisplayImage());
  
  useEffect(() => {
    // Update image when product changes to ensure initial state is correct
    setActiveImage(getDisplayImage());
  }, [product]);

  useEffect(() => {
    if (product.media && product.media.length > 1 && isHovered) {
      // On hover, try to show the second image (index 1)
      setActiveImage(getFullImageUrl(product.media[1].url));
    } else {
      // On un-hover, revert to display image
      setActiveImage(getDisplayImage());
    }
  }, [isHovered, product.media]);

  // Robust check for variants
  const hasVariants = product.has_variants || (product.variants && product.variants.length > 0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    // If product has variants, we must go to details page to select one
    if (hasVariants) {
        navigate(`/store/products/${product.id}`);
        return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      quantity: 1,
      image: activeImage, // Use the resolved active image
      type: product.type === 'game_item' ? 'coins' : 'merch',
      stock: product.stock_quantity
    });
  };

  const toDetails = () => navigate(`/store/products/${product.id}`);

  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  const isComingSoon = product.status === 'inactive';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative flex flex-col h-full perspective-1000 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={toDetails}
    >
        {/* Card Container */ }
        <div className="relative h-full bg-[#0F0F0F] rounded-2xl overflow-hidden border border-white/5 transition-all duration-500 hover:border-brand-gold/50 hover:shadow-[0_0_30px_rgba(230,198,91,0.1)] hover:-translate-y-2">
            
            {/* Image Section */}
            <div className="aspect-[4/5] relative overflow-hidden bg-[#151515]">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.03)_50%,rgba(255,255,255,0.03)_75%,transparent_75%,transparent)] bg-[length:24px_24px] opacity-20" />
                
                {activeImage ? (
                    <motion.img
                        key={activeImage}
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{ opacity: 1, scale: isHovered ? 1.05 : 1 }}
                        transition={{ duration: 0.4 }}
                        src={activeImage} 
                        referrerPolicy="no-referrer"
                        alt={product.name} 
                        className="w-full h-full object-contain p-6 relative z-10"
                        onError={(e) => {
                            console.error('Store Image Load Failed:', activeImage);
                            (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/1a1a1a/white?text=No+Preview';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                        <ShoppingBag size={48} />
                    </div>
                )}

                {/* Overlays */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
                    {product.is_featured && (
                        <div className="bg-brand-gold text-black text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                            <Zap size={10} fill="currentColor" /> Featured
                        </div>
                    )}
                    {discountPercentage > 0 && (
                        <div className="bg-white text-black text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
                            -{discountPercentage}%
                        </div>
                    )}
                </div>

                {/* Wishlist Button */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white transition-all z-20 backdrop-blur-sm group-hover:bg-black/40"
                >
                     <Heart size={18} className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-white/70"} />
                </button>

                {/* Quick Action Overlay (Desktop) */}
                {!isComingSoon && (
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 hidden md:block bg-gradient-to-t from-black/90 to-transparent pt-12">
                        
                        {product.stock_quantity > 0 && product.stock_quantity <= 5 && (
                            <div className="mb-2 text-center">
                                <span className="inline-flex items-center gap-1 text-red-500 text-[10px] font-black uppercase tracking-wider bg-black/80 px-2 py-1 rounded">
                                    <Zap size={10} className="fill-current" />
                                    Only {product.stock_quantity} Left
                                </span>
                            </div>
                        )}

                        <button 
                            onClick={handleAddToCart}
                            disabled={product.stock_quantity <= 0}
                            className={`w-full font-heavy font-black py-3 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                                product.stock_quantity <= 0
                                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                    : 'bg-white text-black hover:bg-brand-gold'
                            }`}
                        >
                            {product.stock_quantity <= 0 ? (
                                <>
                                    <XCircle size={18} />
                                    OUT OF STOCK
                                </>
                            ) : (
                                <>
                                    <ShoppingBag size={18} />
                                    {hasVariants ? 'VIEW OPTIONS' : 'ADD TO CART'}
                                </>
                            )}
                        </button>
                    </div>
                )}

                {isComingSoon && (
                     <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
                         <div className="flex items-center gap-2 text-white/50 font-bold uppercase tracking-widest border border-white/20 px-4 py-2 rounded-full">
                             <Lock size={14} /> Coming Soon
                         </div>
                     </div>
                )}
            </div>

            {/* Info Section */}
            <div className="p-5 flex flex-col flex-grow bg-[#0F0F0F] relative group-hover:bg-[#121212] transition-colors">
                <div className="flex items-start justify-between mb-2">
                    <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest opacity-80">
                        {product.category?.name || 'Artifact'}
                    </span>
                    {product.stock_quantity < 5 && product.stock_quantity > 0 && (
                        <span className="text-[10px] text-red-400 font-bold">Only {product.stock_quantity} left</span>
                    )}
                </div>
                
                <h3 className="text-white font-bold text-lg leading-tight mb-2 group-hover:text-brand-gold transition-colors line-clamp-2">
                    {product.name}
                </h3>
                
                <div className="mt-auto pt-4 border-t border-white/5 flex items-end justify-between">
                    <div>
                        {product.discount_price ? (
                            <div className="flex flex-col">
                                <span className="text-neutral-500 text-xs line-through font-medium">£{Number(product.price).toFixed(2)}</span>
                                <span className="text-xl font-black text-white">£{Number(product.discount_price).toFixed(2)}</span>
                            </div>
                        ) : (
                            <span className="text-xl font-black text-white">
                                {isComingSoon ? '--' : `£${Number(product.price).toFixed(2)}`}
                            </span>
                        )}
                    </div>
                     {/* Mobile Quick Add */}
                     <button 
                        onClick={handleAddToCart}
                        className="md:hidden w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-brand-gold hover:text-black transition-colors"
                     >
                         {hasVariants ? <Eye size={14} /> : <ShoppingBag size={14} />}
                     </button>
                </div>
            </div>
        </div>
    </motion.div>
  );
};

const CategoryFilter = ({ categories, activeCategory, onSelect }: any) => {
  return (
    <div className="flex items-center justify-center w-full py-4">
         <div className="bg-[#1a1a1a]/80 backdrop-blur-md border border-white/10 p-1.5 rounded-full flex gap-1 overflow-x-auto max-w-[95vw] md:max-w-fit no-scrollbar shadow-2xl">
            <button
                onClick={() => onSelect('all')}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap uppercase tracking-wider
                    ${activeCategory === 'all' 
                        ? 'bg-brand-gold text-black shadow-lg scale-105' 
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
            >
                All Products
            </button>
            {categories.map((cat: any) => (
                <button
                    key={cat.id}
                    onClick={() => onSelect(cat.id)}
                    className={`px-6 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap uppercase tracking-wider flex items-center gap-2
                        ${activeCategory === cat.id 
                            ? 'bg-brand-gold text-black shadow-lg scale-105' 
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'}`}
                >
                    {cat.name}
                    {cat.products_count > 0 && (
                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] ${activeCategory === cat.id ? 'bg-black text-brand-gold' : 'bg-white/10 text-white'}`}>
                            {cat.products_count}
                        </span>
                    )}
                </button>
            ))}
         </div>
    </div>
  );
};

const Store: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<number | 'all'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
  
    useEffect(() => {
        // Load Categories
        storeService.getCategories().then(data => {
            setCategories(Array.isArray(data) ? data : []);
        });
    }, []);

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true);
        setPage(1); // Reset page on filter change
        try {
          const response = await storeService.getProducts({ 
               category_id: activeCategory !== 'all' ? activeCategory : undefined,
               search: searchQuery,
               status: 'active',
               page: 1
          });
          
          const pList = (response as any).data || response || [];
          setProducts(Array.isArray(pList) ? pList : []);
          setHasMore((response as any).last_page > 1);
        } catch (error) {
          console.error("Failed to load store data", error);
        } finally {
          setLoading(false);
        }
      };
      
      const debounceTimer = setTimeout(fetchData, 500);
      return () => clearTimeout(debounceTimer);
    }, [activeCategory, searchQuery]);

    const handleLoadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        try {
            const nextPage = page + 1;
            const response = await storeService.getProducts({ 
                category_id: activeCategory !== 'all' ? activeCategory : undefined,
                search: searchQuery,
                status: 'active',
                page: nextPage
           });
           
           const newProducts = (response as any).data || [];
           setProducts(prev => [...prev, ...newProducts]);
           setPage(nextPage);
           setHasMore(nextPage < (response as any).last_page);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingMore(false);
        }
    };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-brand-gold/30 font-sans">
      <Header />
      
      {/* Immersive Hero */}
      <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 bg-[#050505]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[length:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/10 rounded-full blur-[100px] animate-pulse" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-8"
            >
                <h1 className="text-7xl md:text-9xl font-zentry font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/10 mb-2">
                    TVK STORE
                </h1>
                <p className="text-xl md:text-2xl text-brand-gold font-bold tracking-[0.5em] uppercase">
                    Official Merch
                </p>
            </motion.div>

            {/* Floating Search Bar */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-xl mx-auto"
            >
                <div className="relative group">
                    <div className="absolute inset-0 bg-brand-gold/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity rounded-full" />
                    <div className="relative bg-white/5 border border-white/10 rounded-full p-2 flex items-center backdrop-blur-md">
                        <Search className="text-neutral-500 ml-4" size={20} />
                        <input 
                            type="text"
                            placeholder="Search artifacts, gear, collectibles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none outline-none text-white placeholder-neutral-500 px-4 py-2 font-medium"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 pb-24 -mt-10 relative z-20">
        
        {/* Sticky Filters */}
        <div className="sticky top-0 z-40 mb-12 pointer-events-none">
            <div className="pointer-events-auto inline-block w-full">
               <CategoryFilter 
                   categories={categories} 
                   activeCategory={activeCategory} 
                   onSelect={setActiveCategory} 
               />
            </div>
        </div>

        {/* Results Grid */}
        <AnimatePresence mode="wait">
            {loading ? (
                 <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8"
                 >
                    {[...Array(8)].map((_, i) => (
                         <div key={i} className="aspect-[4/5] bg-white/5 rounded-2xl animate-pulse" />
                    ))}
                 </motion.div>
            ) : products.length > 0 ? (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8 mb-12"
                    >
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </motion.div>
                    
                    {hasMore && (
                        <div className="flex justify-center">
                            <button
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                            >
                                {loadingMore ? 'Loading Signals...' : 'Load More Artifacts'}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-white/[0.02]"
                >
                    <div className="bg-white/5 p-6 rounded-full mb-6">
                        <Search size={40} className="text-white/20" />
                    </div>
                    <h3 className="text-2xl font-zentry font-bold text-white mb-2">NO SIGNALS FOUND</h3>
                    <p className="text-neutral-500">Adjust your scanners and try again.</p>
                </motion.div>
            )}
        </AnimatePresence>

      </section>
      <Footer />
    </div>
  );
};

export default Store;