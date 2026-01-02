import React from 'react';

/**
 * @fileoverview Reusable Message Modal component for displaying success or error messages.
 * Uses the black and gold theme.
 */

interface MessageModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  // Optional: Auto close after a few seconds
  autoCloseDelay?: number | null;
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  title,
  message,
  type,
  onClose,
  autoCloseDelay = 3000,
}) => {
  const isSuccess = type === 'success';

  // Effect to handle auto-closing the modal
  React.useEffect(() => {
    if (isOpen && autoCloseDelay) {
      const timer = setTimeout(onClose, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseDelay, onClose]);

  if (!isOpen) {
    return null;
  }

  // Define colors based on type
  const headerColor = isSuccess ? 'text-brand-gold' : 'text-red-500';
  const icon = isSuccess ? (
    // Checkmark icon (Lucide equivalent inline SVG)
    <svg
      className="w-8 h-8 text-brand-gold"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ) : (
    // X icon
    <svg
      className="w-8 h-8 text-red-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 transition-opacity p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Content - Black/Dark Theme */}
      <div className="bg-gray-900 text-gray-100 rounded-xl shadow-2xl shadow-brand-gold/30 w-full max-w-sm p-8 text-center transform transition-all duration-300 scale-100 border border-brand-gold/20">
        <div className="flex flex-col items-center">
          {/* Icon */}
          <div className="mb-4 p-2 rounded-full border-2 border-brand-gold/50">{icon}</div>

          {/* Header */}
          <h3 className={`text-2xl font-extrabold tracking-wider mb-2 ${headerColor}`}>{title}</h3>

          {/* Body */}
          <div 
  className="text-gray-300 mt-4 text-left leading-relaxed"
  dangerouslySetInnerHTML={{ __html: message }}
/>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-gradient-to-r from-brand-goldDark to-brand-gold text-gray-900 font-bold rounded-lg hover:opacity-95 shadow-lg shadow-brand-gold/50 transition-transform"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default MessageModal;
