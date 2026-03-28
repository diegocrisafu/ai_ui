export const OWM_BASE_URL = "https://api.openweathermap.org";
export const OWM_API_KEY = process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY || "";

export const DEFAULT_LOCATIONS = [
  { name: "New York", country: "US", lat: 40.7128, lon: -74.006 },
  { name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
  { name: "Tokyo", country: "JP", lat: 35.6762, lon: 139.6503 },
];

export const STORAGE_KEYS = {
  LOCATIONS: "weatherlens-locations",
  PREFERENCES: "weatherlens-preferences",
} as const;

export const DEFAULT_PREFERENCES = {
  temperatureUnit: "fahrenheit" as const,
  speedUnit: "mph" as const,
  theme: "dark" as const,
  notifications: {
    severeWeather: true,
    dailyForecast: false,
  },
};
