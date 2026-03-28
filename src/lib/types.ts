export interface Location {
  id: string;
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone: number; // UTC offset in seconds
}

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  visibility: number;
  clouds: number;
  description: string;
  icon: string;
  main: string; // "Clear", "Clouds", "Rain", etc.
  dt: number;
  sunrise: number;
  sunset: number;
}

export interface ForecastEntry {
  dt: number;
  temp: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  main: string;
  pop: number; // probability of precipitation 0-1
}

export interface DailyForecast {
  date: string; // YYYY-MM-DD
  day: string; // "Mon", "Tue", etc.
  temp_min: number;
  temp_max: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  main: string;
  pop: number;
  hourly: ForecastEntry[];
}

export interface LocationWeather {
  location: Location;
  current: CurrentWeather;
  forecast: DailyForecast[];
}

export interface LongTermData {
  month: string;
  avgHigh: number;
  avgLow: number;
  precipitation: number;
  description: string;
}

export type TemperatureUnit = "celsius" | "fahrenheit";
export type SpeedUnit = "kmh" | "mph";
export type ThemeMode = "light" | "dark" | "auto";

export interface UserPreferences {
  temperatureUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
  theme: ThemeMode;
  notifications: {
    severeWeather: boolean;
    dailyForecast: boolean;
  };
}

export type WeatherCondition =
  | "clear-day"
  | "clear-night"
  | "clouds-day"
  | "clouds-night"
  | "rain"
  | "drizzle"
  | "thunderstorm"
  | "snow"
  | "mist"
  | "default";
