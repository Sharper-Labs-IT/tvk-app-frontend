import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { X } from 'lucide-react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    essential: true, // Always true
    preference: false,
    analytics: false,
  });

  useEffect(() => {
    const consent = Cookies.get('cookieConsent');
    if (!consent) {
      // Delay slightly to show animation
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsent = { essential: true, preference: true, analytics: true };
    saveConsent(allConsent);
  };

  const handleRejectAll = () => {
    const rejectConsent = { essential: true, preference: false, analytics: false };
    saveConsent(rejectConsent);
  };

  const handleSavePreferences = () => {
    saveConsent(preferences);
  };

  const saveConsent = (consentSettings: typeof preferences) => {
    Cookies.set('cookieConsent', JSON.stringify(consentSettings), { expires: 365 });
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Main Banner */}
      <AnimatePresence>
        {!showPreferences && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-tvk-dark border-t border-gold/20 shadow-2xl"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-serif text-gold">Your privacy matters</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  We use essential cookies to ensure our website functions correctly. With your permission, we’d also like to use preference and analytics cookies to improve your experience and understand how our site is used. You can choose to accept or reject non-essential cookies now or change your settings at any time.
                </p>
                <a 
                  href="https://tvkmembers.world/cookie-policy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gold hover:text-goldDark text-sm underline underline-offset-4 transition-colors"
                >
                  Read our Cookie Policy
                </a>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 min-w-fit w-full md:w-auto">
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2.5 bg-gold text-black font-medium rounded hover:bg-goldDark transition-colors whitespace-nowrap"
                >
                  Accept all
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-6 py-2.5 bg-transparent border border-gray-600 text-gray-300 font-medium rounded hover:border-gray-400 hover:text-white transition-colors whitespace-nowrap"
                >
                  Reject all
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="px-6 py-2.5 text-gold hover:text-goldDark font-medium underline underline-offset-4 transition-colors whitespace-nowrap"
                >
                  Set preferences
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preferences Modal */}
      <AnimatePresence>
        {showPreferences && (
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-tvk-dark border border-gold/20 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-2xl font-serif text-gold">Cookie Preferences</h3>
                <button 
                  onClick={() => setShowPreferences(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <p className="text-gray-300 text-sm">
                  Manage your cookie preferences here. Essential cookies are always enabled as they are necessary for the website to function properly.
                </p>

                {/* Essential Cookies */}
                <div className="flex items-start justify-between gap-4 p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium mb-1">Essential Cookies</h4>
                    <p className="text-gray-400 text-xs">Necessary for the website to function. Cannot be disabled.</p>
                  </div>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-gold/50 cursor-not-allowed">
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </div>
                </div>

                {/* Preference Cookies */}
                <div className="flex items-start justify-between gap-4 p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium mb-1">Preference Cookies</h4>
                    <p className="text-gray-400 text-xs">Allow the website to remember choices you make.</p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, preference: !p.preference }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.preference ? 'bg-gold' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`${
                        preferences.preference ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </button>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between gap-4 p-4 bg-white/5 rounded-lg">
                  <div>
                    <h4 className="text-white font-medium mb-1">Analytics Cookies</h4>
                    <p className="text-gray-400 text-xs">Help us understand how visitors interact with the website.</p>
                  </div>
                  <button
                    onClick={() => setPreferences(p => ({ ...p, analytics: !p.analytics }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences.analytics ? 'bg-gold' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`${
                        preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </button>
                </div>
              </div>

              <div className="p-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="px-6 py-2 bg-gold text-black font-medium rounded hover:bg-goldDark transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CookieBanner;
