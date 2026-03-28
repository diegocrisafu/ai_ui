"use client";

import { CurrentWeather, Location } from "@/lib/types";
import { usePreferences } from "@/context/PreferencesContext";
import {
  formatTemp,
  formatSpeed,
  formatLocalTime,
  getTimezoneAbbr,
  kelvinToUnit,
} from "@/lib/utils";
import WeatherIcon from "./WeatherIcon";
import GlassCard from "../ui/GlassCard";
import {
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Thermometer,
  CloudRain,
} from "lucide-react";

interface CurrentConditionsProps {
  current: CurrentWeather;
  location: Location;
}

function getTempClass(kelvin: number): string {
  const celsius = kelvin - 273.15;
  if (celsius >= 35) return "temp-hot";
  if (celsius >= 20) return "temp-warm";
  if (celsius >= 5) return "temp-cool";
  return "temp-cold";
}

export default function CurrentConditions({
  current,
  location,
}: CurrentConditionsProps) {
  const { preferences } = usePreferences();

  const formatSunTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const details = [
    {
      icon: Thermometer,
      label: "Feels Like",
      value: formatTemp(current.feels_like, preferences.temperatureUnit),
      color: "text-orange-300",
    },
    {
      icon: Droplets,
      label: "Humidity",
      value: `${current.humidity}%`,
      color: "text-blue-300",
    },
    {
      icon: Wind,
      label: "Wind",
      value: formatSpeed(current.wind_speed, preferences.speedUnit),
      color: "text-cyan-300",
    },
    {
      icon: Gauge,
      label: "Pressure",
      value: `${current.pressure} hPa`,
      color: "text-purple-300",
    },
    {
      icon: Eye,
      label: "Visibility",
      value: preferences.speedUnit === "mph"
        ? `${(current.visibility / 1609).toFixed(1)} mi`
        : `${(current.visibility / 1000).toFixed(1)} km`,
      color: "text-green-300",
    },
    {
      icon: CloudRain,
      label: "Clouds",
      value: `${current.clouds}%`,
      color: "text-indigo-300",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Main temperature display */}
      <GlassCard variant="prominent" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/50 text-sm mb-1">
              {formatLocalTime(location.timezone)} {getTimezoneAbbr(location.timezone)}
            </p>
            <h2 className="text-3xl font-bold text-white mb-1">
              {location.name}, {location.country}
            </h2>
            <p className="text-white/60 capitalize">{current.description}</p>
          </div>
          <WeatherIcon icon={current.icon} size={80} />
        </div>

        <div className="flex items-baseline gap-3 mt-4">
          <span className={`text-7xl font-bold ${getTempClass(current.temp)}`}>
            {kelvinToUnit(current.temp, preferences.temperatureUnit)}°
          </span>
          <div className="text-white/50 text-sm">
            <p>H: {formatTemp(current.temp_max, preferences.temperatureUnit)}</p>
            <p>L: {formatTemp(current.temp_min, preferences.temperatureUnit)}</p>
          </div>
        </div>
      </GlassCard>

      {/* Detail grid */}
      <div className="grid grid-cols-3 gap-2">
        {details.map(({ icon: Icon, label, value, color }) => (
          <GlassCard key={label} variant="subtle" className="p-3 text-center">
            <Icon size={18} className={`${color} mx-auto mb-1`} />
            <p className="text-white/40 text-xs">{label}</p>
            <p className="text-white font-medium text-sm">{value}</p>
          </GlassCard>
        ))}
      </div>

      {/* Sunrise/Sunset */}
      <GlassCard variant="subtle" className="p-4">
        <div className="flex justify-around">
          <div className="flex items-center gap-2">
            <Sunrise size={20} className="text-yellow-300" />
            <div>
              <p className="text-white/40 text-xs">Sunrise</p>
              <p className="text-white font-medium">{formatSunTime(current.sunrise)}</p>
            </div>
          </div>
          <div className="w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <Sunset size={20} className="text-orange-400" />
            <div>
              <p className="text-white/40 text-xs">Sunset</p>
              <p className="text-white font-medium">{formatSunTime(current.sunset)}</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
