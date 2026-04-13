import Image from "next/image";

type AppLogoProps = {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
};

const iconDimensions = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 }
};

const fullDimensions = {
  sm: { width: 120, height: 24 },
  md: { width: 160, height: 32 },
  lg: { width: 240, height: 48 }
};

const logoAsset = "/assets/divelog-logo.png";

export function AppLogo({ variant = "icon", size = "md" }: AppLogoProps) {
  const dimensions = variant === "full" ? fullDimensions[size] : iconDimensions[size];
  const src = logoAsset;

  return (
    <Image
      src={src}
      alt="DiveLog Studio"
      width={dimensions.width}
      height={dimensions.height}
      priority
      unoptimized
      className="h-auto flex-shrink-0 rounded-full"
    />
  );
}
