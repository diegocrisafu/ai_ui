import { OWM_BASE_URL, OWM_API_KEY } from "./constants";
import {
  CurrentWeather,
  DailyForecast,
  ForecastEntry,
  Location,
} from "./types";
import { formatDay, generateId } from "./utils";

interface GeoResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export async function searchCities(query: string): Promise<GeoResult[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `${OWM_BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${OWM_API_KEY}`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((item: { name: string; country: string; lat: number; lon: number }) => ({
    name: item.name,
    country: item.country,
    lat: item.lat,
    lon: item.lon,
  }));
}

export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<GeoResult | null> {
  const res = await fetch(
    `${OWM_BASE_URL}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OWM_API_KEY}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length) return null;
  return {
    name: data[0].name,
    country: data[0].country,
    lat: data[0].lat,
    lon: data[0].lon,
  };
}

export async function fetchCurrentWeather(
  lat: number,
  lon: number
): Promise<{ current: CurrentWeather; timezone: number } | null> {
  const res = await fetch(
    `${OWM_BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}`
  );
  if (!res.ok) return null;
  const data = await res.json();
  return {
    current: {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      temp_min: data.main.temp_min,
      temp_max: data.main.temp_max,
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      wind_speed: data.wind.speed,
      wind_deg: data.wind.deg || 0,
      visibility: data.visibility,
      clouds: data.clouds.all,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      main: data.weather[0].main,
      dt: data.dt,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    },
    timezone: data.timezone,
  };
}

export async function fetchForecast(
  lat: number,
  lon: number
): Promise<DailyForecast[]> {
  const res = await fetch(
    `${OWM_BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}`
  );
  if (!res.ok) return [];
  const data = await res.json();

  // Group 3-hour entries by day
  const dayMap = new Map<string, ForecastEntry[]>();
  for (const item of data.list) {
    const date = new Date(item.dt * 1000).toISOString().split("T")[0];
    if (!dayMap.has(date)) dayMap.set(date, []);
    dayMap.get(date)!.push({
      dt: item.dt,
      temp: item.main.temp,
      temp_min: item.main.temp_min,
      temp_max: item.main.temp_max,
      humidity: item.main.humidity,
      wind_speed: item.wind.speed,
      description: item.weather[0].description,
      icon: item.weather[0].icon,
      main: item.weather[0].main,
      pop: item.pop || 0,
    });
  }

  const dailyForecasts: DailyForecast[] = [];
  for (const [date, entries] of dayMap) {
    // Use the mid-day entry as representative, or first if not available
    const midDay = entries.find((e) => {
      const hour = new Date(e.dt * 1000).getHours();
      return hour >= 11 && hour <= 14;
    }) || entries[0];

    dailyForecasts.push({
      date,
      day: formatDay(entries[0].dt),
      temp_min: Math.min(...entries.map((e) => e.temp_min)),
      temp_max: Math.max(...entries.map((e) => e.temp_max)),
      humidity: Math.round(entries.reduce((a, b) => a + b.humidity, 0) / entries.length),
      wind_speed: Math.max(...entries.map((e) => e.wind_speed)),
      description: midDay.description,
      icon: midDay.icon,
      main: midDay.main,
      pop: Math.max(...entries.map((e) => e.pop)),
      hourly: entries,
    });
  }

  return dailyForecasts.slice(0, 5);
}

export async function fetchLocationWeather(location: Location) {
  const [weatherData, forecast] = await Promise.all([
    fetchCurrentWeather(location.lat, location.lon),
    fetchForecast(location.lat, location.lon),
  ]);

  if (!weatherData) return null;

  return {
    location: { ...location, timezone: weatherData.timezone },
    current: weatherData.current,
    forecast,
  };
}

export function geoResultToLocation(geo: GeoResult): Location {
  return {
    id: generateId(),
    name: geo.name,
    country: geo.country,
    lat: geo.lat,
    lon: geo.lon,
    timezone: 0, // Will be populated on first weather fetch
  };
}
