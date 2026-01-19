type AppLogoProps = {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
};

export function AppLogo({ variant = "icon", size = "md" }: AppLogoProps) {
  const dimensions = {
    sm: { width: 24, height: 24 },
    md: { width: 32, height: 32 },
    lg: { width: 48, height: 48 }
  };

  const { width, height } = dimensions[size];

  if (variant === "icon") {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
        aria-label="DiveLog Studio Logo"
      >
        {/* Gradient Definitions */}
        <defs>
          <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient id="bubbleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.6" />
          </linearGradient>
        </defs>
        
        {/* Ocean Wave Background */}
        <circle cx="16" cy="16" r="16" fill="url(#oceanGradient)" />
        
        {/* Diver Silhouette */}
        <path
          d="M16 8C15.2 8 14.5 8.4 14.2 9C13.9 9.6 14 10.4 14.5 10.9C15 11.4 15.8 11.5 16.4 11.2C17 10.9 17.4 10.2 17.4 9.4C17.4 8.6 16.8 8 16 8Z"
          fill="white"
          opacity="0.95"
        />
        <path
          d="M20 14C19.8 13.8 19.5 13.7 19.2 13.7L17.5 13.9C17.4 13.6 17.2 13.4 16.9 13.3L15.2 12.7C14.8 12.6 14.4 12.7 14.1 13C13.8 13.3 13.7 13.7 13.8 14.1L14.5 17L13 19.5C12.8 19.9 12.9 20.3 13.1 20.6L15 24C15.2 24.4 15.6 24.6 16 24.6C16.1 24.6 16.3 24.6 16.4 24.5C16.9 24.3 17.2 23.8 17.1 23.3L16.5 20L17.5 18L19 19.5C19.2 19.7 19.5 19.8 19.8 19.8C20.1 19.8 20.4 19.7 20.6 19.5C21 19.1 21 18.5 20.6 18.1L19 16.5L20.2 15.3C20.6 14.9 20.6 14.3 20.2 13.9L20 14Z"
          fill="white"
          opacity="0.95"
        />
        
        {/* Air Bubbles */}
        <circle cx="10" cy="12" r="1.5" fill="url(#bubbleGradient)" />
        <circle cx="22" cy="10" r="1.2" fill="url(#bubbleGradient)" />
        <circle cx="8" cy="18" r="1" fill="url(#bubbleGradient)" />
        <circle cx="24" cy="16" r="1.3" fill="url(#bubbleGradient)" />
      </svg>
    );
  }

  // Full variant with text (for larger displays)
  return (
    <svg
      width={width * 4}
      height={height}
      viewBox="0 0 128 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
      aria-label="DiveLog Studio Full Logo"
    >
      <defs>
        <linearGradient id="oceanGradientFull" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>
      </defs>
      
      {/* Icon part */}
      <circle cx="16" cy="16" r="16" fill="url(#oceanGradientFull)" />
      <path
        d="M16 8C15.2 8 14.5 8.4 14.2 9C13.9 9.6 14 10.4 14.5 10.9C15 11.4 15.8 11.5 16.4 11.2C17 10.9 17.4 10.2 17.4 9.4C17.4 8.6 16.8 8 16 8Z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M20 14C19.8 13.8 19.5 13.7 19.2 13.7L17.5 13.9C17.4 13.6 17.2 13.4 16.9 13.3L15.2 12.7C14.8 12.6 14.4 12.7 14.1 13C13.8 13.3 13.7 13.7 13.8 14.1L14.5 17L13 19.5C12.8 19.9 12.9 20.3 13.1 20.6L15 24C15.2 24.4 15.6 24.6 16 24.6C16.1 24.6 16.3 24.6 16.4 24.5C16.9 24.3 17.2 23.8 17.1 23.3L16.5 20L17.5 18L19 19.5C19.2 19.7 19.5 19.8 19.8 19.8C20.1 19.8 20.4 19.7 20.6 19.5C21 19.1 21 18.5 20.6 18.1L19 16.5L20.2 15.3C20.6 14.9 20.6 14.3 20.2 13.9L20 14Z"
        fill="white"
        opacity="0.95"
      />
      
      {/* Text "DiveLog" */}
      <text
        x="38"
        y="20"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontSize="14"
        fontWeight="600"
        fill="#0F172A"
      >
        DiveLog
      </text>
    </svg>
  );
}
