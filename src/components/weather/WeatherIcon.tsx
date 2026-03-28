"use client";

import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  CloudSnow,
  CloudFog,
  CloudSun,
  CloudMoon,
} from "lucide-react";

interface WeatherIconProps {
  icon: string; // OWM icon code like "01d", "02n", etc.
  size?: number;
  className?: string;
}

export default function WeatherIcon({
  icon,
  size = 48,
  className = "",
}: WeatherIconProps) {
  const isDay = icon.endsWith("d");
  const code = icon.slice(0, 2);

  const iconProps = {
    size,
    className: `weather-icon-pulse ${className}`,
    strokeWidth: 1.5,
  };

  switch (code) {
    case "01":
      return isDay ? (
        <Sun {...iconProps} className={`${iconProps.className} text-yellow-300`} />
      ) : (
        <Moon {...iconProps} className={`${iconProps.className} text-blue-200`} />
      );
    case "02":
      return isDay ? (
        <CloudSun {...iconProps} className={`${iconProps.className} text-yellow-200`} />
      ) : (
        <CloudMoon {...iconProps} className={`${iconProps.className} text-blue-200`} />
      );
    case "03":
    case "04":
      return <Cloud {...iconProps} className={`${iconProps.className} text-gray-300`} />;
    case "09":
      return <CloudDrizzle {...iconProps} className={`${iconProps.className} text-blue-300`} />;
    case "10":
      return <CloudRain {...iconProps} className={`${iconProps.className} text-blue-400`} />;
    case "11":
      return <CloudLightning {...iconProps} className={`${iconProps.className} text-purple-300`} />;
    case "13":
      return <CloudSnow {...iconProps} className={`${iconProps.className} text-blue-100`} />;
    case "50":
      return <CloudFog {...iconProps} className={`${iconProps.className} text-gray-400`} />;
    default:
      return <Cloud {...iconProps} className={`${iconProps.className} text-gray-300`} />;
  }
}
