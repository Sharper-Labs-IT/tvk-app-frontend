import React from 'react';
import Button from './Button';

/**
 * @fileoverview Reusable Confirmation Modal component.
 * Updated to use the black and gold theme (bg-gray-900 and brand-gold).
 */

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isConfirming = false,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 transition-opacity p-4"
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Content - Black/Dark Theme */}
      <div className="bg-gray-900 text-gray-100 rounded-xl shadow-2xl shadow-brand-gold/30 w-full max-w-md p-8 transform transition-all duration-300 scale-100 border border-brand-gold/20">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-brand-gold/50 pb-4 mb-6">
          <h3 className="text-3xl font-extrabold text-brand-gold tracking-wider">{title}</h3>
          <button
            onClick={onCancel}
            className="text-brand-gold/70 hover:text-brand-gold transition-colors p-1"
            aria-label="Close"
            disabled={isConfirming}
          >
            {/* Close Icon (X) */}
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <p className="text-gray-300 text-lg mb-8">{message}</p>

        {/* Footer / Actions - Changed to flex-col (vertical) and items-center (full width buttons) */}
        <div className="flex flex-col space-y-4">
          {/* Confirm Button (Log Out) - Gold Gradient style. Placed first for primary action. */}
          <Button
            onClick={onConfirm}
            isLoading={isConfirming}
            // Ensuring it takes full width when stacked
            className="w-full px-6 py-3 bg-gradient-to-r from-brand-goldDark to-brand-gold text-gray-900 font-bold hover:opacity-95 shadow-lg shadow-brand-gold/50 transform hover:scale-[1.005] transition-transform"
            variant="secondary"
          >
            {confirmText}
          </Button>

          {/* Cancel Button (Stay Logged In) - Dark style. Placed second. */}
          <button
            onClick={onCancel}
            disabled={isConfirming}
            // Ensuring it takes full width when stacked
            className="w-full px-6 py-3 text-gray-300 bg-gray-800 rounded-lg font-semibold border border-gray-700 hover:bg-gray-700 duration-150 shadow-inner shadow-black/50 transform hover:scale-[1.005] transition-transform"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
