"use client";

import { LocationWeather } from "@/lib/types";
import { usePreferences } from "@/context/PreferencesContext";
import { formatTemp, formatSpeed, formatLocalTime, getTimezoneAbbr, kelvinToUnit } from "@/lib/utils";
import WeatherIcon from "./WeatherIcon";
import GlassCard from "../ui/GlassCard";
import { MapPin, Droplets, Wind } from "lucide-react";
import { useRouter } from "next/navigation";

interface LocationCardProps {
  data: LocationWeather;
  isPrimary?: boolean;
}

function getTempClass(kelvin: number): string {
  const celsius = kelvin - 273.15;
  if (celsius >= 35) return "temp-hot";
  if (celsius >= 20) return "temp-warm";
  if (celsius >= 5) return "temp-cool";
  return "temp-cold";
}

export default function LocationCard({ data, isPrimary = false }: LocationCardProps) {
  const { preferences } = usePreferences();
  const router = useRouter();
  const { location, current } = data;

  return (
    <GlassCard
      variant={isPrimary ? "prominent" : "default"}
      hover
      onClick={() => router.push(`/location/${location.id}`)}
      className={`p-5 ${isPrimary ? "col-span-full" : ""}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-1.5 text-white/60 text-xs mb-1">
            <MapPin size={12} />
            {isPrimary && <span>Primary</span>}
          </div>
          <h3 className={`font-semibold text-white ${isPrimary ? "text-2xl" : "text-lg"}`}>
            {location.name}
          </h3>
          <p className="text-white/50 text-sm">
            {location.country} &middot; {formatLocalTime(location.timezone)}{" "}
            {getTimezoneAbbr(location.timezone)}
          </p>
        </div>
        <WeatherIcon icon={current.icon} size={isPrimary ? 64 : 44} />
      </div>

      {/* Temperature */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className={`${isPrimary ? "text-6xl" : "text-4xl"} font-bold ${getTempClass(current.temp)}`}>
          {kelvinToUnit(current.temp, preferences.temperatureUnit)}°
        </span>
        <span className="text-white/60 text-sm capitalize">{current.description}</span>
      </div>

      {/* Details */}
      <div className="flex gap-4 text-white/60 text-sm">
        <div className="flex items-center gap-1">
          <Droplets size={14} />
          <span>{current.humidity}%</span>
        </div>
        <div className="flex items-center gap-1">
          <Wind size={14} />
          <span>{formatSpeed(current.wind_speed, preferences.speedUnit)}</span>
        </div>
      </div>

      {/* Mini forecast for primary */}
      {isPrimary && data.forecast.length > 0 && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-white/10 overflow-x-auto">
          {data.forecast.map((day) => (
            <div
              key={day.date}
              className="flex flex-col items-center gap-1 min-w-[60px] text-center"
            >
              <span className="text-white/50 text-xs">{day.day}</span>
              <WeatherIcon icon={day.icon} size={24} className="!animate-none" />
              <span className="text-white text-sm font-medium">
                {kelvinToUnit(day.temp_max, preferences.temperatureUnit)}°
              </span>
              <span className="text-white/40 text-xs">
                {kelvinToUnit(day.temp_min, preferences.temperatureUnit)}°
              </span>
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
