import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Logo({ size = 'md', textSize = 'md', className }: LogoProps) {
  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  // Text size classes
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  return (
    <div className={cn("flex items-center gap-2 font-display font-bold", className)}>
      <div className={cn("flex items-center justify-center rounded-lg gradient-hero", sizeClasses[size])}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn("w-6 h-6 text-primary-foreground", {
            'w-4 h-4': size === 'sm',
            'w-5 h-5': size === 'md',
            'w-6 h-6': size === 'lg'
          })}
        >
          <path
            d="M12 2L2 7V17L12 22L22 17V7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 7L12 12L22 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 22V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className={cn("text-gradient font-display font-bold", textSizeClasses[textSize])}>
        Lumora
      </span>
    </div>
  );
}