import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  textSize?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Logo({ size = "md", textSize = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("rounded-full gradient-hero flex items-center justify-center", sizeClasses[size])}>
        <svg
          className={cn("text-primary-foreground", size === "sm" ? "w-4 h-4" : size === "md" ? "w-5 h-5" : size === "lg" ? "w-6 h-6" : "w-8 h-8")}
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
        </svg>
      </div>
      <span className={cn("font-bold lumora-logo", textSizeClasses[textSize])}>
        Lumora
      </span>
    </div>
  );
}