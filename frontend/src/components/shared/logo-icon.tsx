interface LogoIconProps {
  className?: string;
}

export const LogoIcon = ({ className }: LogoIconProps) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <defs>
      <linearGradient id="orbit-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" /> {/* Sky 500 */}
        <stop offset="100%" stopColor="#6366f1" /> {/* Indigo 500 */}
      </linearGradient>
      <linearGradient id="orbit-grad2" x1="100%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#8b5cf6" /> {/* Violet 500 */}
        <stop offset="100%" stopColor="#ec4899" /> {/* Pink 500 */}
      </linearGradient>
      <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <g filter="url(#soft-glow)">
      {/* Outer Orbit */}
      <circle cx="50" cy="50" r="38" stroke="url(#orbit-grad1)" strokeWidth="8" fill="none" opacity="0.9" strokeLinecap="round" strokeDasharray="180 60" />
      
      {/* Inner Orbit */}
      <circle cx="50" cy="50" r="22" stroke="url(#orbit-grad2)" strokeWidth="8" fill="none" opacity="0.8" strokeLinecap="round" strokeDasharray="80 30" transform="rotate(45 50 50)" />
      
      {/* Core Node */}
      <circle cx="50" cy="50" r="10" fill="url(#orbit-grad1)" />

      {/* Floating Connection Points */}
      <circle cx="85" cy="30" r="6" fill="url(#orbit-grad2)" />
      <circle cx="15" cy="70" r="6" fill="#0ea5e9" />
      <circle cx="20" cy="20" r="4" fill="#ec4899" opacity="0.8" />
      <circle cx="80" cy="80" r="4" fill="#8b5cf6" opacity="0.8" />
    </g>
  </svg>
);
