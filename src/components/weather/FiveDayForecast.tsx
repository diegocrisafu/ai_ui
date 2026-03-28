"use client";

import { DailyForecast } from "@/lib/types";
import { usePreferences } from "@/context/PreferencesContext";
import { kelvinToUnit, formatSpeed } from "@/lib/utils";
import WeatherIcon from "./WeatherIcon";
import GlassCard from "../ui/GlassCard";
import { motion } from "framer-motion";
import { Droplets, Wind } from "lucide-react";

interface FiveDayForecastProps {
  forecast: DailyForecast[];
  selectedDay: number;
  onSelectDay: (index: number) => void;
}

export default function FiveDayForecast({
  forecast,
  selectedDay,
  onSelectDay,
}: FiveDayForecastProps) {
  const { preferences } = usePreferences();

  return (
    <div>
      <h3 className="text-white/70 text-sm font-medium uppercase tracking-wider mb-3">
        5-Day Forecast
      </h3>
      <div className="grid grid-cols-5 gap-2">
        {forecast.map((day, index) => (
          <motion.div
            key={day.date}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <GlassCard
              variant={selectedDay === index ? "prominent" : "subtle"}
              className={`p-3 text-center cursor-pointer transition-all ${
                selectedDay === index ? "ring-1 ring-white/30" : ""
              }`}
              onClick={() => onSelectDay(index)}
            >
              <p className="text-white/50 text-xs mb-2">{day.day}</p>
              <WeatherIcon icon={day.icon} size={28} className="mx-auto !animate-none" />
              <p className="text-white font-bold mt-2">
                {kelvinToUnit(day.temp_max, preferences.temperatureUnit)}°
              </p>
              <p className="text-white/40 text-xs">
                {kelvinToUnit(day.temp_min, preferences.temperatureUnit)}°
              </p>
              <div className="flex items-center justify-center gap-1 mt-2 text-white/40">
                <Droplets size={10} />
                <span className="text-xs">{Math.round(day.pop * 100)}%</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Expanded day detail */}
      {forecast[selectedDay] && (
        <motion.div
          key={selectedDay}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4"
        >
          <GlassCard variant="subtle" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-white font-semibold capitalize">
                  {forecast[selectedDay].description}
                </h4>
                <p className="text-white/50 text-sm">{forecast[selectedDay].date}</p>
              </div>
              <WeatherIcon icon={forecast[selectedDay].icon} size={40} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-white/40 text-xs mb-1">Humidity</p>
                <div className="flex items-center justify-center gap-1">
                  <Droplets size={14} className="text-blue-300" />
                  <span className="text-white font-medium">
                    {forecast[selectedDay].humidity}%
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-white/40 text-xs mb-1">Wind</p>
                <div className="flex items-center justify-center gap-1">
                  <Wind size={14} className="text-cyan-300" />
                  <span className="text-white font-medium">
                    {formatSpeed(forecast[selectedDay].wind_speed, preferences.speedUnit)}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-white/40 text-xs mb-1">Precip.</p>
                <div className="flex items-center justify-center gap-1">
                  <Droplets size={14} className="text-indigo-300" />
                  <span className="text-white font-medium">
                    {Math.round(forecast[selectedDay].pop * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
