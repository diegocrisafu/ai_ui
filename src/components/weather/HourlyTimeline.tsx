"use client";

import { ForecastEntry } from "@/lib/types";
import { usePreferences } from "@/context/PreferencesContext";
import { kelvinToUnit } from "@/lib/utils";
import WeatherIcon from "./WeatherIcon";
import GlassCard from "../ui/GlassCard";
import { Droplets } from "lucide-react";

interface HourlyTimelineProps {
  entries: ForecastEntry[];
}

export default function HourlyTimeline({ entries }: HourlyTimelineProps) {
  const { preferences } = usePreferences();

  if (!entries || entries.length === 0) return null;

  return (
    <div>
      <h3 className="text-white/70 text-sm font-medium uppercase tracking-wider mb-3">
        Hourly Breakdown
      </h3>
      <GlassCard variant="subtle" className="p-4">
        <div className="flex gap-4 overflow-x-auto pb-2">
          {entries.map((entry) => {
            const time = new Date(entry.dt * 1000).toLocaleTimeString("en-US", {
              hour: "numeric",
              hour12: true,
            });
            return (
              <div
                key={entry.dt}
                className="flex flex-col items-center gap-2 min-w-[56px]"
              >
                <span className="text-white/50 text-xs">{time}</span>
                <WeatherIcon icon={entry.icon} size={24} className="!animate-none" />
                <span className="text-white font-medium text-sm">
                  {kelvinToUnit(entry.temp, preferences.temperatureUnit)}°
                </span>
                <div className="flex items-center gap-0.5 text-white/40">
                  <Droplets size={10} />
                  <span className="text-xs">{Math.round(entry.pop * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
