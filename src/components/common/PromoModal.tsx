import React from 'react';
import { X, Crown, Check as CheckIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
}

const benefits = [
  "Access to exclusive content",
  "Participate in premium games",
  "Win real prizes & rewards",
  "Join the VIP community"
];

const PromoModal: React.FC<PromoModalProps> = ({ isOpen, onClose, isLoggedIn = true }) => {
  const navigate = useNavigate();

  // If not open, don't render at all
  if (!isOpen) return null;

  return (
    // Simple fixed overlay with high Z-index
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1c2e] to-[#0f111a] border border-[#d4af37]/30 shadow-2xl shadow-[#d4af37]/20"
        style={{ animation: 'fadeInScale 0.3s ease-out forwards' }} // Inline style for guaranteed animation
      >
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeInScale {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}} />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

            {/* Content */}
            <div className="p-8 text-center">
              {/* Header Icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#d4af37]/20 to-transparent border border-[#d4af37]/50 shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                <Crown className="w-10 h-10 text-[#d4af37]" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-2">
                Unlock Premium
              </h2>
              <p className="text-gray-300 mb-8 max-w-[280px] mx-auto">
                Don't miss out on the full experience. Join the elite members club today!
              </p>

              {/* Benefits */}
              <div className="mb-8 space-y-3 text-left bg-black/20 p-4 rounded-xl border border-white/5">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#d4af37]/20 flex items-center justify-center">
                       <CheckIcon className="w-3 h-3 text-[#d4af37]" />
                    </div>
                    <span className="text-sm text-gray-200">{benefit}</span>
                  </div>
                ))}
              </div>

          {/* CTA Button */}
          <button
            onClick={() => {
              onClose();
              navigate(isLoggedIn ? '/membership' : '/signup');
            }}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#d4af37] to-[#f7c948] py-4 px-8 font-bold text-black shadow-lg shadow-[#d4af37]/20 transition-all hover:shadow-[#d4af37]/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoggedIn ? 'Get Membership' : 'Sign Up Now'}
            </span>
            <div className="absolute inset-0 z-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
          
          <button 
            onClick={onClose}
            className="mt-4 text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            Maybe later
          </button>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-32 h-32 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
};

export default PromoModal;
