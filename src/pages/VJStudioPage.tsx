import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; 
import { useAuth } from '../context/AuthContext';
import { fanSelfieService } from '../services/fanSelfieService';
import PublicFeed from '../components/fan-selfie/PublicFeed';
import GenerateSelfie from '../components/fan-selfie/GenerateSelfie';
import MySelfiesGallery from '../components/fan-selfie/MySelfiesGallery';
import Loader from '../components/Loader';
import type { UsageStatusResponse } from '../types/fanSelfie';
import { toast } from 'react-hot-toast';
import { FaUserPlus, FaImages, FaStar, FaLock } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const VJStudioPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'generate' | 'gallery'>('feed');
  const [usageStatus, setUsageStatus] = useState<UsageStatusResponse | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  
  // Check usage on mount if logged in
  useEffect(() => {
    if (isLoggedIn) {
      checkUsage();
    }
  }, [isLoggedIn]);

  const checkUsage = async () => {
    setLoadingUsage(true);
    try {
      const status = await fanSelfieService.checkUsageStatus();
      setUsageStatus(status);
    } catch (error) {
      console.error("Failed to check usage status:", error);
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleTabChange = (tab: 'feed' | 'generate' | 'gallery') => {
    if (tab === 'generate' && !isLoggedIn) {
      toast.error("Please login to generate selfies.");
      return;
    }
    
    // Allow switching to generate tab even if not super fan, to show upgrade prompt
    
    setActiveTab(tab);
  };

  const isSuperFan = usageStatus?.data?.is_super_fan;

  return (
    <div className="min-h-screen bg-brand-dark text-white flex flex-col">
      <Header />
      
      <main className="flex-grow pt-8 pb-12 relative overflow-hidden">
         {/* Background Effects */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-red-500 to-yellow-500 bg-clip-text text-transparent">
              Selfie with VJ
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Generate stunning AI selfies with Thalapathy VJ. Exclusive for Super Fans!
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center mb-8 gap-4">
            <button 
              onClick={() => handleTabChange('feed')}
              className={`px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2
                ${activeTab === 'feed' ? 'bg-white text-gray-900 shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
            >
              <FaImages /> Public Gallery
            </button>
            
            <button 
              onClick={() => handleTabChange('generate')}
              className={`px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2 relative overflow-hidden
                ${activeTab === 'generate' ? 'bg-gradient-to-r from-red-600 to-yellow-600 text-white shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
              `}
            >
              <FaStar className={activeTab === 'generate' ? 'text-yellow-300' : ''} />
              Generate Selfie
              {!isSuperFan && isLoggedIn && (
                <span className="absolute top-0 right-0 p-1">
                  <FaLock className="text-xs text-yellow-500/80" />
                </span>
              )}
            </button>

            <button 
              onClick={() => handleTabChange('gallery')}
              disabled={!isLoggedIn}
              className={`px-6 py-2 rounded-full font-semibold transition-all flex items-center gap-2
                ${activeTab === 'gallery' ? 'bg-white text-gray-900 shadow-lg scale-105' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'}
              `}
            >
              <FaUserPlus /> My Selfies
            </button>
          </div>

          {/* Content Area */}
          <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-4 sm:p-6 md:p-10 border border-gray-800 min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'feed' && (
                <motion.div 
                  key="feed"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PublicFeed />
                </motion.div>
              )}
              
              {activeTab === 'generate' && (
                <motion.div 
                  key="generate"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  {loadingUsage ? (
                    <div className="flex justify-center p-10"><Loader /></div>
                  ) : !isLoggedIn ? (
                    <div className="text-center py-10">
                      <h3 className="text-2xl font-bold mb-4">Login Required</h3>
                      <p className="text-gray-400 mb-6">You must be logged in to generate selfies.</p>
                      <Link to="/login" className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-red-700 transition">
                        Login / Signup
                      </Link>
                    </div>
                  ) : !isSuperFan ? (
                    <div className="text-center py-10 max-w-2xl mx-auto">
                      <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaLock className="text-yellow-500 text-4xl" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-4">Super Fan Exclusive Feature</h2>
                      <p className="text-gray-300 text-lg mb-8">
                        Generating AI selfies with Thalapathy Vijay is a premium feature available only to Super Fan members.
                        Upgrade your membership to unlock this and many other exclusive benefits!
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/membership" className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold rounded-full hover:from-yellow-400 hover:to-yellow-500 transition shadow-lg shadow-yellow-500/20 transform hover:-translate-y-1">
                          Become a Super Fan
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <GenerateSelfie 
                      usage={usageStatus?.data?.usage || null}
                      loadingUsage={loadingUsage}
                      onSuccess={() => {
                        checkUsage(); // Refresh usage limits
                        setActiveTab('gallery'); // Redirect to gallery
                      }}
                    />
                  )}
                </motion.div>
              )}

              {activeTab === 'gallery' && (
                <motion.div 
                  key="gallery"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-6 text-center text-primary">Your Collection</h2>
                  <MySelfiesGallery />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default VJStudioPage;
