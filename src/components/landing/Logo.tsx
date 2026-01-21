import { GraduationCap } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {/* Background gradient circle */}
      <div className="absolute inset-0 rounded-full gradient-hero opacity-80 blur-sm" />

      {/* Logo image with enhanced styling */}
      <div className="relative w-full h-full rounded-full gradient-hero p-1.5 shadow-glow">
        <div className="w-full h-full bg-card rounded-full flex items-center justify-center relative overflow-hidden">
          {/* Sparkle effects */}
          <div className="absolute top-1 left-1 w-1 h-1 bg-gold rounded-full opacity-80 animate-pulse" style={{ animationDelay: '0s' }} />
          <div className="absolute top-1 right-1 w-1 h-1 bg-gold rounded-full opacity-80 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1 left-1 w-1 h-1 bg-gold rounded-full opacity-80 animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1 right-1 w-1 h-1 bg-gold rounded-full opacity-80 animate-pulse" style={{ animationDelay: '1.5s' }} />

          {/* Logo image */}
          <img
            src="/logo.png"
            alt="Lumora Logo"
            className="w-3/4 h-3/4 object-contain"
          />

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 opacity-60" />
        </div>
      </div>
    </div>
  );
}