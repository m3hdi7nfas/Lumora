import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  logoClassName?: string;
  withText?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  textClassName?: string;
}

export function Logo({ size = 'md', className = '', logoClassName = '', withText = true, textSize, textClassName = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-40 h-16',
    xl: 'w-64 h-64',
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl'
  };

  const overlapClasses = {
    sm: 'ml-0',
    md: 'ml-4',
    lg: '-ml-10',
    xl: '-ml-16'
  };

  // Determine text size based on logo size if not specified
  const effectiveTextSize = textSize || size;

  return (
    <div className={`flex items-center ${className}`}>
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        <img
          src="/logo.png"
          alt="Lumora Logo"
          className={`absolute inset-0 w-full h-full object-contain z-0 scale-[2.5] translate-y-2 pointer-events-none transition-transform ${logoClassName}`}
        />
      </div>

      {withText && (
        <span className={`font-logo font-medium tracking-tighter text-foreground ${textSizeClasses[effectiveTextSize]} ${overlapClasses[size]} pr-10 relative z-10 ${textClassName}`}>
          Lumora
        </span>
      )}
    </div>
  );
}
