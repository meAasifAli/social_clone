import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

const Logo = ({ size = "md", showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: {
      container: "h-8 w-8",
      icon: "h-4 w-4",
      text: "text-sm font-bold", // Smaller text for sm
    },
    md: {
      container: "h-10 w-10",
      icon: "h-5 w-5",
      text: "text-base font-bold", // Medium text for md
    },
    lg: {
      container: "h-12 w-12",
      icon: "h-6 w-6",
      text: "text-lg font-bold", // Larger text for lg
    },
    xl: {
      container: "h-16 w-16",
      icon: "h-8 w-8",
      text: "text-xl font-bold", // Even larger for xl
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      {/* Logo Icon */}
      <div
        className={cn(
          "rounded-xl bg-linear-to-br from-blue-500 to-blue-700",
          "flex items-center justify-center text-white",
          "shadow-lg shadow-blue-500/20",
          sizes.container,
        )}
      >
        <MessageCircle className={sizes.icon} />
      </div>

      {/* Logo Text - Two lines */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={cn(
              "bg-linear-to-br from-blue-600 to-blue-800 bg-clip-text text-transparent",
              "font-bold",
              sizes.text,
            )}
          >
            Socially
          </span>
          <span
            className={cn(
              "bg-linear-to-br from-blue-500 to-blue-700 bg-clip-text text-transparent",
              "font-medium -mt-1",
              size === "sm"
                ? "text-[10px]"
                : size === "md"
                  ? "text-xs"
                  : size === "lg"
                    ? "text-sm"
                    : "text-base",
            )}
          >
            connected
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
