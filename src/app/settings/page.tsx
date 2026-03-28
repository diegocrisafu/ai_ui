"use client";

import { useRouter } from "next/navigation";
import { usePreferences } from "@/context/PreferencesContext";
import DynamicBackground from "@/components/layout/DynamicBackground";
import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import GlassToggle from "@/components/ui/GlassToggle";
import { ArrowLeft, Thermometer, Wind, Palette, Bell } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const {
    preferences,
    setTemperatureUnit,
    setSpeedUnit,
    setTheme,
    toggleNotification,
  } = usePreferences();

  return (
    <DynamicBackground condition="default">
      {/* Top bar */}
      <motion.div
        className="flex items-center gap-3 px-4 pt-4 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassButton variant="ghost" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft size={18} />
        </GlassButton>
        <h1 className="text-lg font-semibold text-white">Settings</h1>
      </motion.div>

      <main className="px-4 pb-8 max-w-lg mx-auto space-y-4">
        {/* Temperature Unit */}
        <GlassCard variant="default" className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Thermometer size={18} className="text-orange-300" />
            <h3 className="text-white font-medium">Temperature Unit</h3>
          </div>
          <div className="flex gap-2">
            <GlassButton
              variant={preferences.temperatureUnit === "fahrenheit" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTemperatureUnit("fahrenheit")}
            >
              °F Fahrenheit
            </GlassButton>
            <GlassButton
              variant={preferences.temperatureUnit === "celsius" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setTemperatureUnit("celsius")}
            >
              °C Celsius
            </GlassButton>
          </div>
        </GlassCard>

        {/* Speed Unit */}
        <GlassCard variant="default" className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Wind size={18} className="text-cyan-300" />
            <h3 className="text-white font-medium">Wind Speed Unit</h3>
          </div>
          <div className="flex gap-2">
            <GlassButton
              variant={preferences.speedUnit === "mph" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSpeedUnit("mph")}
            >
              mph
            </GlassButton>
            <GlassButton
              variant={preferences.speedUnit === "kmh" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSpeedUnit("kmh")}
            >
              km/h
            </GlassButton>
          </div>
        </GlassCard>

        {/* Theme */}
        <GlassCard variant="default" className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Palette size={18} className="text-purple-300" />
            <h3 className="text-white font-medium">Appearance</h3>
          </div>
          <div className="flex gap-2">
            {(["dark", "light", "auto"] as const).map((t) => (
              <GlassButton
                key={t}
                variant={preferences.theme === t ? "primary" : "ghost"}
                size="sm"
                onClick={() => setTheme(t)}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </GlassButton>
            ))}
          </div>
        </GlassCard>

        {/* Notifications */}
        <GlassCard variant="default" className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={18} className="text-yellow-300" />
            <h3 className="text-white font-medium">Notifications</h3>
          </div>
          <div className="space-y-3">
            <GlassToggle
              enabled={preferences.notifications.severeWeather}
              onToggle={() => toggleNotification("severeWeather")}
              label="Severe Weather Alerts"
            />
            <GlassToggle
              enabled={preferences.notifications.dailyForecast}
              onToggle={() => toggleNotification("dailyForecast")}
              label="Daily Forecast Summary"
            />
          </div>
        </GlassCard>

        {/* About */}
        <GlassCard variant="subtle" className="p-5 text-center">
          <p className="text-white/40 text-sm">
            WeatherLens v1.0 — Powered by OpenWeatherMap
          </p>
          <p className="text-white/30 text-xs mt-1">
            Designed for frequent travelers and weather enthusiasts
          </p>
        </GlassCard>
      </main>
    </DynamicBackground>
  );
}
