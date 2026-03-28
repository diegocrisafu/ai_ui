import { WeatherCondition } from "./types";

interface BackgroundConfig {
  gradient: string;
  particleColor?: string;
}

export const weatherBackgrounds: Record<WeatherCondition, BackgroundConfig> = {
  "clear-day": {
    gradient: "from-amber-400 via-orange-300 to-sky-400",
  },
  "clear-night": {
    gradient: "from-slate-900 via-indigo-950 to-purple-950",
  },
  "clouds-day": {
    gradient: "from-slate-400 via-blue-300 to-indigo-300",
  },
  "clouds-night": {
    gradient: "from-slate-800 via-gray-700 to-slate-900",
  },
  rain: {
    gradient: "from-slate-700 via-blue-800 to-teal-900",
  },
  drizzle: {
    gradient: "from-slate-500 via-blue-600 to-cyan-700",
  },
  thunderstorm: {
    gradient: "from-gray-900 via-purple-900 to-slate-800",
  },
  snow: {
    gradient: "from-blue-100 via-slate-200 to-white",
  },
  mist: {
    gradient: "from-gray-400 via-slate-300 to-gray-500",
  },
  default: {
    gradient: "from-blue-600 via-indigo-500 to-purple-600",
  },
};

export function getBackgroundGradient(condition: WeatherCondition): string {
  return weatherBackgrounds[condition].gradient;
}

// Determine if text should be light or dark based on background
export function shouldUseLightText(condition: WeatherCondition): boolean {
  return !["snow", "mist"].includes(condition);
}
