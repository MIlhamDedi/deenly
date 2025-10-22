import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-teal-700 text-white hover:bg-teal-800 active:bg-teal-900 shadow-lg shadow-teal-900/20 dark:bg-teal-600 dark:hover:bg-teal-700 focus:ring-teal-500',
    secondary: 'bg-gold-100 text-teal-900 hover:bg-gold-200 active:bg-gold-300 dark:bg-gold-200 dark:hover:bg-gold-300 focus:ring-gold-400',
    outline: 'border-2 border-teal-700 text-teal-700 hover:bg-teal-50 active:bg-teal-100 dark:border-teal-400 dark:text-teal-400 dark:hover:bg-teal-900 focus:ring-teal-500',
    ghost: 'text-teal-700 hover:bg-teal-50 active:bg-teal-100 dark:text-teal-400 dark:hover:bg-teal-900 focus:ring-teal-500',
    white: 'bg-white text-gray-900 hover:bg-gray-50 active:bg-gray-100 shadow-2xl focus:ring-white border-2 border-white',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
}
