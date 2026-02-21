import { LogoIcon } from "./logo-icon";
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
      <div className={cn("shrink-0", sizes.container)}>
        <LogoIcon className="w-full h-full drop-shadow-md" />
      </div>

      {/* Logo Text - Two lines */}
      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            className={cn(
              "bg-linear-to-br from-sky-500 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm",
              "font-extrabold tracking-tight",
              sizes.text,
            )}
          >
            Socially
          </span>
          <span
            className={cn(
              "bg-linear-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent drop-shadow-sm",
              "font-bold tracking-widest uppercase -mt-1",
              size === "sm"
                ? "text-[8px]"
                : size === "md"
                  ? "text-[9px]"
                  : size === "lg"
                    ? "text-[11px]"
                    : "text-xs",
            )}
          >
            Connected
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
