interface LogoIconProps {
  className?: string;
}

export const LogoIcon = ({ className }: LogoIconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Gradient Definitions */}
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="50%" stopColor="#8B5CF6" />
        <stop offset="100%" stopColor="#EC4899" />
      </linearGradient>
      <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
        <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.2" />
        <stop offset="100%" stopColor="#EC4899" stopOpacity="0.2" />
      </linearGradient>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
        <feMerge>
          <feMergeNode in="coloredBlur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>

    {/* Background Glow */}
    <circle
      cx="12"
      cy="12"
      r="10"
      fill="url(#glowGradient)"
      filter="url(#glow)"
    />

    {/* Main Chat Bubble */}
    <path
      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22H17C19.76 22 22 19.76 22 17V12C22 6.48 17.52 2 12 2Z"
      fill="url(#logoGradient)"
      stroke="white"
      strokeWidth="0.5"
      strokeOpacity="0.3"
    />

    {/* Inner Chat Lines */}
    <path
      d="M8 9H16M8 13H14M8 17H12"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity="0.9"
    />

    {/* Floating Dots Animation */}
    <circle cx="18" cy="8" r="1" fill="white" fillOpacity="0.8">
      <animate
        attributeName="r"
        values="1;1.5;1"
        dur="2s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="20" cy="12" r="1" fill="white" fillOpacity="0.6">
      <animate
        attributeName="r"
        values="1;1.3;1"
        dur="2.2s"
        repeatCount="indefinite"
      />
    </circle>
    <circle cx="18" cy="16" r="1" fill="white" fillOpacity="0.4">
      <animate
        attributeName="r"
        values="1;1.1;1"
        dur="1.8s"
        repeatCount="indefinite"
      />
    </circle>
  </svg>
);
