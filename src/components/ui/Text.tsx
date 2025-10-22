import { ReactNode } from 'react';

interface HeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4;
  className?: string;
}

export function Heading({ children, level = 1, className = '' }: HeadingProps) {
  const baseStyles = 'font-bold text-gray-900 dark:text-white';

  const levelStyles = {
    1: 'text-4xl md:text-5xl',
    2: 'text-3xl md:text-4xl',
    3: 'text-2xl md:text-3xl',
    4: 'text-xl md:text-2xl',
  };

  const Component = `h${level}` as keyof JSX.IntrinsicElements;

  return (
    <Component className={`${baseStyles} ${levelStyles[level]} ${className}`}>
      {children}
    </Component>
  );
}

interface TextProps {
  children: ReactNode;
  variant?: 'body' | 'muted' | 'small' | 'large';
  className?: string;
}

export function Text({ children, variant = 'body', className = '' }: TextProps) {
  const variants = {
    body: 'text-base text-gray-700 dark:text-gray-300',
    muted: 'text-sm text-gray-600 dark:text-gray-400',
    small: 'text-xs text-gray-500 dark:text-gray-400',
    large: 'text-lg text-gray-700 dark:text-gray-300',
  };

  return (
    <p className={`${variants[variant]} ${className}`}>
      {children}
    </p>
  );
}
