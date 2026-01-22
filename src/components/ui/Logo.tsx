import { GraduationCap, Star, Trophy, BookOpen } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withText?: boolean;
  textSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Logo({ size = 'md', className = '', withText = true, textSize }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl'
  };

  // Determine text size based on logo size if not specified
  const effectiveTextSize = textSize || size;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Background circle with enhanced gradient */}
        <div className="absolute inset-0 rounded-full gradient-hero opacity-90" />

        {/* Main graduation cap - larger and more prominent */}
        <div className="absolute inset-0 flex items-center justify-center">
          <GraduationCap className={`w-3/4 h-3/4 text-primary-foreground`} />
        </div>

        {/* Enhanced decorative elements */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center shadow-lg">
          <Star className="w-3 h-3 text-gold-foreground animate-pulse" />
        </div>

        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-accent rounded-full shadow-lg" />

        {/* Additional decorative elements for more sophistication */}
        <div className="absolute top-1/2 -right-2 w-2 h-2 bg-success rounded-full" />
        <div className="absolute top-1/3 -left-2 w-1.5 h-1.5 bg-warning rounded-full" />
      </div>

      {withText && (
        <span className={`font-display font-bold ${textSizeClasses[effectiveTextSize]} tracking-wide`}>
          Lumora
        </span>
      )}
    </div>
  );
}