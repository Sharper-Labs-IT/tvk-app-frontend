import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Zap, ArrowRight, Heart } from 'lucide-react';
import { storeService } from '../services/storeService';
import type { Product } from '../types/product';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { getFullImageUrl } from '../utils/imageUrl';

const StoreCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const getDisplayImage = () => {
    if (product.media && product.media.length > 0) {
      const primary = product.media.find(m => m.is_primary);
      if (primary) return getFullImageUrl(primary.url);
      return getFullImageUrl(product.media[0].url);
    }
    const p = product as any;
    if (p.primary_image) {
      if (typeof p.primary_image === 'string') return getFullImageUrl(p.primary_image);
      if (typeof p.primary_image === 'object' && p.primary_image.url) return getFullImageUrl(p.primary_image.url);
    }
    if (p.image_url) return getFullImageUrl(p.image_url);
    if (p.image) return getFullImageUrl(p.image);
    return '';
  };

  const image = getDisplayImage();
  const discountPercentage = product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If it has variants, go to details. Otherwise add to cart & checkout
    const hasVariants = product.has_variants || (product.variants && product.variants.length > 0);
    if (hasVariants) {
        navigate(`/store/products/${product.id}`);
        return;
    }

    addToCart({
      productId: product.id,
      name: product.name,
      price: product.discount_price || product.price,
      quantity: 1,
      image,
      type: product.type === 'game_item' ? 'coins' : 'merch',
      stock: product.stock_quantity
    });

    navigate('/checkout');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative flex flex-col perspective-1000 cursor-pointer h-full"
      onClick={() => navigate(`/store/products/${product.id}`)}
    >
      <div className="relative h-full bg-[#0F0F0F] rounded-2xl overflow-hidden border border-white/5 transition-all duration-500 hover:border-brand-gold/50 hover:-translate-y-2">
        <div className="aspect-[4/5] relative overflow-hidden bg-[#151515]">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.03)_50%,rgba(255,255,255,0.03)_75%,transparent_75%,transparent)] bg-[length:24px_24px] opacity-20" />
          
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="w-full h-full object-contain p-6 relative z-10 transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/1a1a1a/white?text=No+Preview';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/20">
              <ShoppingBag size={48} />
            </div>
          )}

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

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/50 text-white transition-all z-20 backdrop-blur-sm group-hover:bg-black/40"
          >
            <Heart size={18} className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-white/70"} />
          </button>
          
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 bg-gradient-to-t from-black/90 to-transparent pt-12">
            <button
              onClick={handleBuyNow}
              disabled={product.stock_quantity <= 0}
              className={`w-full font-black py-3 px-4 rounded-lg uppercase transition-colors flex items-center justify-center tracking-wider gap-2 ${
                product.stock_quantity <= 0
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-brand-gold text-black hover:brightness-110 active:scale-95'
              }`}
            >
              {product.stock_quantity <= 0 ? 'Out of Stock' : (
                <>
                  <ShoppingBag size={18} />
                  Buy Now
                </>
              )}
            </button>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow bg-[#0F0F0F] relative group-hover:bg-[#121212] transition-colors">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] text-brand-gold font-bold uppercase tracking-widest opacity-80">
              {product.category?.name || 'Artifact'}
            </span>
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
                <span className="text-xl font-black text-white">£{Number(product.price).toFixed(2)}</span>
              )}
            </div>
            
            <button 
              onClick={handleBuyNow}
              disabled={product.stock_quantity <= 0}
              className="md:hidden bg-brand-gold text-black p-2 rounded-lg font-black text-xs uppercase"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StoreSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await storeService.getProducts({ 
          status: 'active',
          page: 1
        });
        const pList = (response as any).data || response || [];
        setProducts(Array.isArray(pList) ? pList.slice(0, 4) : []);
      } catch (error) {
        console.error("Failed to load top store data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-[#050505] min-h-[500px] flex items-center justify-center relative overflow-hidden text-white border-y border-white/10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-gold"></div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show store section if there are no products
  }

  return (
    <section className="py-24 bg-brand-dark relative overflow-hidden border-y border-white/5">
      {/* Decorative backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#111_0%,transparent_70%)]" />
      <div className="absolute bg-brand-gold/5 w-96 h-96 blur-3xl rounded-full top-0 left-1/2 -translate-x-1/2 opacity-50" />

      <div className="container mx-auto px-4 lg:px-12 xl:px-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-zentry font-bold text-white uppercase mb-2">
              Official <span className="text-brand-gold">Merch</span>
            </h2>
            <p className="text-gray-400 font-medium tracking-wide">
              Grab the latest gear directly from the VJ FANS HUB STORE
            </p>
          </div>
          
          <button
            onClick={() => navigate('/store')}
            className="group flex items-center gap-2 text-white font-bold bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full border border-white/10 transition-all uppercase tracking-widest text-sm"
          >
            Explore Store
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <StoreCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default StoreSection;
