import { GraduationCap, Star, Trophy, BookOpen } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  withText?: boolean;
}

export function Logo({ size = 'md', className = '', withText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full gradient-hero opacity-80" />

        {/* Main graduation cap */}
        <div className="absolute inset-0 flex items-center justify-center">
          <GraduationCap className={`w-2/3 h-2/3 text-primary-foreground`} />
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full flex items-center justify-center">
          <Star className="w-2 h-2 text-gold-foreground" />
        </div>

        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-accent rounded-full" />
      </div>

      {withText && (
        <span className={`font-display font-bold ${textSizeClasses[size]}`}>
          Lumora
        </span>
      )}
    </div>
  );
}