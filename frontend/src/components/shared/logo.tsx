import { MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showTagline?: boolean;
}

const LogoEnhanced = ({
  size = "md",
  showText = true,
  showTagline = false,
}: LogoProps) => {
  const sizeClasses = {
    sm: {
      container: "h-7 w-7",
      text: "text-sm font-bold",
      icon: "h-3 w-3",
      tagline: "text-[8px]",
    },
    md: {
      container: "h-9 w-9",
      text: "text-lg font-bold",
      icon: "h-3.5 w-3.5",
      tagline: "text-[9px]",
    },
    lg: {
      container: "h-12 w-12",
      text: "text-xl font-bold",
      icon: "h-4.5 w-4.5",
      tagline: "text-[10px]",
    },
    xl: {
      container: "h-16 w-16",
      text: "text-2xl font-bold",
      icon: "h-6 w-6",
      tagline: "text-xs",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className="flex items-center gap-3">
      {/* Logo Container with subtle effects */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/10 blur-md rounded-xl -z-10"></div>

        {/* Outer subtle border */}
        <div
          className={cn(
            "absolute inset-0 rounded-xl border border-blue-200/50 dark:border-blue-800/50",
            sizes.container,
          )}
        ></div>

        {/* Main logo */}
        <div
          className={cn(
            "relative flex items-center justify-center rounded-xl",
            "bg-linear-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900",
            "shadow-lg shadow-blue-500/10 dark:shadow-blue-900/20",
            "border border-blue-500/20 dark:border-blue-700/30",
            sizes.container,
          )}
        >
          <MessageCircle className={cn("text-white", sizes.icon)} />

          {/* Subtle accent in corner */}
          <div className="absolute -bottom-1 -right-1">
            <Sparkles className="h-3 w-3 text-blue-300 dark:text-blue-400" />
          </div>
        </div>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1">
            <span
              className={cn(
                "font-bold text-gray-900 dark:text-white tracking-tight",
                sizes.text,
              )}
            >
              Socially
            </span>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">
              beta
            </span>
          </div>

          {/* Animated underline */}
          <div className="relative mt-1.5">
            <div
              className={cn(
                "h-0.5 bg-linear-to-r from-blue-500 via-blue-600 to-blue-500 dark:from-blue-400 dark:via-blue-500 dark:to-blue-400",
                "rounded-full w-16",
              )}
            ></div>
            <div className="absolute top-0 left-0 h-0.5 w-3 bg-white/50 dark:bg-gray-900/50 animate-pulse"></div>
          </div>

          {showTagline && size !== "sm" && (
            <span
              className={cn(
                "text-gray-600 dark:text-gray-400 font-medium tracking-wider uppercase mt-1.5",
                sizes.tagline,
              )}
            >
              Connect • Share • Inspire
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default LogoEnhanced;
