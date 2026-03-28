import { TemperatureUnit, SpeedUnit, WeatherCondition } from "./types";

export function kelvinToUnit(kelvin: number, unit: TemperatureUnit): number {
  if (unit === "celsius") return Math.round(kelvin - 273.15);
  return Math.round((kelvin - 273.15) * 9 / 5 + 32);
}

export function formatTemp(kelvin: number, unit: TemperatureUnit): string {
  const temp = kelvinToUnit(kelvin, unit);
  return `${temp}°${unit === "celsius" ? "C" : "F"}`;
}

export function mpsToUnit(mps: number, unit: SpeedUnit): number {
  if (unit === "kmh") return Math.round(mps * 3.6);
  return Math.round(mps * 2.237);
}

export function formatSpeed(mps: number, unit: SpeedUnit): string {
  const speed = mpsToUnit(mps, unit);
  return `${speed} ${unit === "kmh" ? "km/h" : "mph"}`;
}

export function formatTime(timestamp: number, timezoneOffset: number): string {
  const date = new Date((timestamp + timezoneOffset) * 1000);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });
}

export function formatLocalTime(timezoneOffset: number): string {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utc + timezoneOffset * 1000);
  return local.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function getLocalHour(timezoneOffset: number): number {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = new Date(utc + timezoneOffset * 1000);
  return local.getHours();
}

export function formatDay(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function getWeatherCondition(
  main: string,
  isDay: boolean
): WeatherCondition {
  const mainLower = main.toLowerCase();
  if (mainLower === "clear") return isDay ? "clear-day" : "clear-night";
  if (mainLower === "clouds") return isDay ? "clouds-day" : "clouds-night";
  if (mainLower === "rain") return "rain";
  if (mainLower === "drizzle") return "drizzle";
  if (mainLower === "thunderstorm") return "thunderstorm";
  if (mainLower === "snow") return "snow";
  if (["mist", "fog", "haze", "smoke", "dust", "sand", "ash"].includes(mainLower))
    return "mist";
  return "default";
}

export function isDaytime(
  dt: number,
  sunrise: number,
  sunset: number
): boolean {
  return dt >= sunrise && dt <= sunset;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function getTimezoneAbbr(offsetSeconds: number): string {
  const hours = offsetSeconds / 3600;
  if (hours === 0) return "GMT";
  const sign = hours > 0 ? "+" : "";
  return `UTC${sign}${hours}`;
}
