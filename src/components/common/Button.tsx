import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'gold'; // Added 'gold'
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = true,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'flex items-center justify-center py-3 px-4 rounded-lg font-bold transition-all duration-300 ease-in-out shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#121212]';

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-white focus:ring-gray-500',
    // Matches your screenshot's Gold/Orange gradient look
    gold: 'bg-tvk-accent-gold hover:bg-tvk-accent-gold-dark text-black focus:ring-tvk-accent-gold',
  };

  const widthClass = fullWidth ? 'w-full' : '';
  const disabledClasses = 'opacity-60 cursor-not-allowed transform-none';

  return (
    <button
      {...props}
      className={`${baseClasses} ${variants[variant]} ${widthClass} ${
        disabled || isLoading ? disabledClasses : 'hover:-translate-y-0.5'
      } ${className}`}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin h-5 w-5 mr-3 text-current" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
