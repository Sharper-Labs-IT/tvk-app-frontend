import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Coins,
  ShoppingBag,
  Zap,
  Star,
  Shield,
  TrendingUp,
  Wallet,
  Sparkles,
  Bomb,
  Snowflake,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { storeService } from '../services/storeService';
import type { CoinPackage, MerchItem } from '../services/storeService';
import { useAuth } from '../context/AuthContext';

const MerchCard = ({ item, index }: { item: any; index: number }) => {
  // State to track which color is currently selected
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Determine current display data
  const hasVariants = item.variants && item.variants.length > 0;
  const currentVariant = hasVariants ? item.variants[activeVariantIndex] : null;

  // Get images: Use variant images if available, otherwise use single image
  const displayImages = hasVariants ? currentVariant.images : [item.image, item.image]; // Fallback: same image for front/back

  // Check if using placeholder images
  const isPlaceholder = displayImages[0]?.includes('placehold.co');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 flex flex-col"
    >
      {/* --- Image Area --- */}
      <div className="aspect-square overflow-hidden relative bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a]">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
        </div>

        {isPlaceholder || imageError ? (
          // Fallback display when no real image
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="w-20 h-20 mb-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all duration-500">
              <ShoppingBag className="w-10 h-10 text-white/40 group-hover:text-brand-gold transition-colors" />
            </div>
            <p className="text-white/30 text-sm font-medium text-center">Image Coming Soon</p>
          </div>
        ) : (
          <>
            {/* Front Image (Visible by default) */}
            <img
              src={displayImages[0]}
              alt={item.name}
              onError={() => setImageError(true)}
              className="absolute inset-0 w-full h-full object-contain p-4 transition-all duration-700 
                group-hover:scale-105 group-hover:opacity-0"
            />

            {/* Back/Second Image (Visible on Hover) */}
            <img
              src={displayImages[1] || displayImages[0]}
              alt={`${item.name} alternate view`}
              onError={() => setImageError(true)}
              className="absolute inset-0 w-full h-full object-contain p-4 transition-all duration-700 scale-105 opacity-0 
                group-hover:opacity-100 group-hover:scale-100"
            />
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-40 pointer-events-none" />

        {/* Rarity Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span
            className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md
            ${
              item.rarity === 'Legendary'
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                : item.rarity === 'Epic'
                ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                : 'bg-blue-500/20 border-blue-500/50 text-blue-400'
            }`}
          >
            {item.rarity}
          </span>
        </div>

        {/* Quick Action Button */}
        <div className="absolute bottom-4 right-4 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-brand-gold transition-colors shadow-lg">
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className="p-6 relative flex flex-col flex-grow">
        <div className="absolute -top-10 left-6">
          <div className="text-2xl font-bold text-white drop-shadow-lg">{item.price}</div>
        </div>

        <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
          {item.category}
        </p>

        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-white group-hover:text-brand-gold transition-colors">
            {item.name}
          </h3>
        </div>

        {/* Color Selector (Only if variants exist) */}
        {hasVariants && (
          <div className="mt-auto pt-2 flex items-center gap-3">
            <span className="text-[10px] uppercase text-gray-500 font-bold tracking-wider">
              Select Color:
            </span>
            <div className="flex gap-2">
              {item.variants.map((variant: any, idx: number) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault(); // Prevent triggering parent clicks
                    setActiveVariantIndex(idx);
                  }}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-300 relative
                    ${
                      activeVariantIndex === idx
                        ? 'border-brand-gold scale-110 shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                        : 'border-transparent hover:border-white/50'
                    }`}
                  style={{ backgroundColor: variant.colorHex }}
                  title={variant.colorName}
                >
                  {/* White dot for active black items to make it visible */}
                  {activeVariantIndex === idx && variant.colorHex === '#1a1a1a' && (
                    <div className="absolute inset-0 m-auto w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// --- Mock Data ---

const DEFAULT_COIN_PACKAGES = [
  {
    id: 1,
    amount: 100,
    price: '£0.99',
    bonus: null,
    popular: false,
    color: 'from-blue-500 to-cyan-400',
    image: 'https://images.unsplash.com/photo-1519681393798-3828fb4090bb?auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    amount: 550,
    price: '£4.99',
    bonus: '+50 Bonus',
    popular: true,
    color: 'from-violet-500 to-fuchsia-400',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    amount: 1200,
    price: '£9.99',
    bonus: '+200 Bonus',
    popular: false,
    color: 'from-amber-400 to-orange-500',
    image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    amount: 3000,
    price: '£24.99',
    bonus: '+500 Bonus',
    popular: false,
    color: 'from-emerald-400 to-teal-500',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80',
  },
];

const DEFAULT_MERCH_ITEMS = [
  {
    id: 1,
    name: 'TVK Signature Cap',
    price: '£49.99',
    category: 'Apparel',
    rarity: 'Legendary',
    // This item has variants
    variants: [
      {
        colorName: 'Midnight Black',
        colorHex: '#1a1a1a',
        images: [
          '/img/cap-b.png', 
          '/img/cap-b2.png', 
        ],
      },
      {
        colorName: 'Crimson Red',
        colorHex: '#dc2626',
        images: [
          '/img/cap-r.png', 
          '/img/cap-r2.png', 
        ],
      },
      {
        colorName: 'Ghost White',
        colorHex: '#f3f4f6',
        images: ['/img/cap-w.png', '/img/cap-w2.png'],
      },
    ],
    // Fallback for items without variants
    image: 'https://placehold.co/400x400/1a1a1a/white?text=Cyber+Hoodie',
  },
  {
    id: 2,
    name: 'Mug with TVL Design',
    price: '£24.99',
    image: '/img/mug.png',
    category: 'Accessories',
    rarity: 'Rare',
  },
  {
    id: 3,
    name: 'Premium Gift Card',
    price: '£29.99',
    image: '/img/gift-card.png',
    category: 'Apparel',
    rarity: 'Epic',
  },
  {
    id: 4,
    name: 'Special Edition Back Covers',
    price: '£19.99',
    image: '/img/back-cover.png',
    category: 'Gear',
    rarity: 'Common',
  },
];

// --- Components ---

const SectionTitle = ({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle: string;
  icon: any;
}) => (
  <div className="mb-10 relative">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
        <Icon className="w-6 h-6 text-brand-gold" />
      </div>
      <h2 className="text-3xl md:text-4xl font-zentry font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500">
        {title}
      </h2>
    </div>
    <p className="text-gray-400 text-lg max-w-xl ml-1 mt-2">{subtitle}</p>
  </div>
);

const Store: React.FC = () => {
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>(DEFAULT_COIN_PACKAGES);
  const [merchItems, setMerchItems] = useState<MerchItem[]>(DEFAULT_MERCH_ITEMS);
  const { user, refreshUser } = useAuth();
  const userCoins = user?.coins || 0;

  // Refresh user data when component mounts or becomes visible
  useEffect(() => {
    refreshUser();
  }, []);

  // Refresh when page becomes visible (user returns from game)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUser();
      }
    };

    const handleFocus = () => {
      refreshUser();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshUser]);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        // Attempt to fetch data from backend
        // If backend endpoints are not ready, this will fail and we keep defaults
        const [coins, merch] = await Promise.all([
          storeService.getCoinPackages(),
          storeService.getMerchItems(),
        ]);

        if (coins && coins.length > 0) setCoinPackages(coins);
        if (merch && merch.length > 0) setMerchItems(merch);
      } catch (err) {
        console.log('Using default store data (Backend might be offline or endpoints missing)');
      }
    };
    fetchStoreData();
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans selection:bg-brand-gold/30 overflow-x-hidden">
      <Header />

      {/* Ambient Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[30%] h-[30%] bg-brand-gold/5 rounded-full blur-[100px]" />
      </div>

      <main className="relative z-10 pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
        {/* Hero & Wallet Widget */}
        <section className="relative">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-brand-gold font-medium"
              >
                <Sparkles className="w-4 h-4" />
                <span>Season 1 Store Update - Coming Soon Live</span>
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-zentry font-black tracking-tighter uppercase"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                  Future
                </span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-yellow-300 to-brand-gold">
                  Marketplace
                </span>
              </motion.h1>
            </div>

            {/* Wallet Widget */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full md:w-auto"
            >
              <div className="p-1 rounded-2xl bg-gradient-to-br from-white/10 to-white/0 backdrop-blur-xl border border-white/10">
                <div className="bg-[#0a0a0a]/80 rounded-xl p-5 flex items-center gap-6 min-w-[280px]">
                  <div className="p-3 rounded-full bg-brand-gold/10">
                    <Wallet className="w-6 h-6 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider font-bold">
                      Current Balance
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-white">
                        {userCoins.toLocaleString()}
                      </span>
                      <span className="text-brand-gold font-bold text-sm">TVK</span>
                    </div>
                  </div>
                  <button className="ml-auto p-2 rounded-lg bg-brand-gold text-black hover:bg-white transition-colors">
                    <TrendingUp className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Coin Packages Section */}
        <section>
          <SectionTitle
            title="Digital Currency"
            subtitle="Purchase TVK coins to unlock premium content and power-ups."
            icon={Coins}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            {coinPackages.map((pkg, idx) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`relative group rounded-2xl p-[1px] overflow-hidden transition-all duration-300 ${
                  pkg.popular
                    ? 'transform lg:-translate-y-4 shadow-[0_0_30px_rgba(246,168,0,0.15)]'
                    : ''
                }`}
              >
                {/* Animated Border Gradient - Always visible but subtle, brighter on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${pkg.color} opacity-30 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />

                <div className="relative h-full bg-[#121212] rounded-2xl p-6 flex flex-col items-center text-center border border-white/10 group-hover:border-transparent transition-colors overflow-hidden">
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src={pkg.image}
                      alt=""
                      className="w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity duration-500 scale-110 group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/90 to-transparent" />
                  </div>

                  <div className="relative z-10 w-full flex flex-col items-center h-full">
                    {pkg.popular && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.4)] border border-yellow-300/50">
                          <Star className="w-3 h-3 fill-black" />
                          <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                            Most Popular
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="relative w-24 h-24 mb-6 mt-2">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${pkg.color} rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-opacity`}
                      />
                      <div className="relative w-full h-full bg-white/5 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <Coins
                          className={`w-10 h-10 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`}
                        />
                      </div>
                    </div>

                    <h3 className="text-4xl font-black text-white mb-1 tracking-tight">
                      {pkg.amount}
                    </h3>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-6">
                      TVK Coins
                    </p>

                    {pkg.bonus && (
                      <div className="mb-6 px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-green-400 text-xs font-bold shadow-[0_0_10px_rgba(74,222,128,0.1)]">
                        {pkg.bonus}
                      </div>
                    )}

                    <div className="mt-auto w-full">
                      <button
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 relative overflow-hidden group/btn ${
                          pkg.popular
                            ? 'bg-brand-gold text-black hover:bg-white'
                            : 'bg-white/10 text-white hover:bg-white hover:text-black border border-white/10'
                        }`}
                      >
                        <span className="relative z-10">{pkg.price}</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Premium Merch Section */}
        <section>
          <SectionTitle
            title="Premium Gear"
            subtitle="Limited edition physical and digital merchandise."
            icon={ShoppingBag}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* REPLACE THIS MAP FUNCTION */}
            {merchItems.map((item, idx) => (
              <MerchCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        </section>

        {/* Game Power-ups (Horizontal Scroll) */}
        <section className="pb-10">
          <SectionTitle
            title="Power Ups"
            subtitle="Enhance your gameplay with exclusive abilities."
            icon={Zap}
          />

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 to-blue-600/10 rounded-3xl blur-3xl -z-10" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  name: 'Quantum Shield',
                  price: '500',
                  icon: Shield,
                  color: 'text-yellow-400',
                  bg: 'bg-yellow-400/10',
                  desc: 'Invincibility for 15s',
                },
                {
                  name: 'Time Freeze',
                  price: '750',
                  icon: Snowflake,
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-400/10',
                  desc: 'Freeze enemies for 5s',
                },
                {
                  name: 'Mega Nuke',
                  price: '1200',
                  icon: Bomb,
                  color: 'text-red-500',
                  bg: 'bg-red-500/10',
                  desc: 'Clear all enemies instantly',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-6 flex items-center gap-5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div
                    className={`w-16 h-16 rounded-xl ${item.bg} flex items-center justify-center`}
                  >
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    <p className="text-gray-400 text-sm mb-2">{item.desc}</p>
                    <div className="flex items-center gap-1 text-brand-gold font-bold">
                      <Coins className="w-4 h-4" />
                      <span>{item.price}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Store;
