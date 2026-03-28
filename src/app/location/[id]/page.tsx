"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocations } from "@/context/LocationContext";
import DynamicBackground from "@/components/layout/DynamicBackground";
import CurrentConditions from "@/components/weather/CurrentConditions";
import FiveDayForecast from "@/components/weather/FiveDayForecast";
import HourlyTimeline from "@/components/weather/HourlyTimeline";
import LongTermTrends from "@/components/weather/LongTermTrends";
import GlassButton from "@/components/ui/GlassButton";
import GlassCard from "@/components/ui/GlassCard";
import { getWeatherCondition, isDaytime } from "@/lib/utils";
import { WeatherCondition } from "@/lib/types";
import { ArrowLeft, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "forecast" | "longterm";

export default function LocationDetail() {
  const params = useParams();
  const router = useRouter();
  const { weatherData, loading } = useLocations();
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeTab, setActiveTab] = useState<Tab>("forecast");

  const id = params.id as string;
  const data = weatherData.get(id);

  const backgroundCondition: WeatherCondition = useMemo(() => {
    if (!data) return "default";
    const isDay = isDaytime(
      data.current.dt,
      data.current.sunrise,
      data.current.sunset
    );
    return getWeatherCondition(data.current.main, isDay);
  }, [data]);

  if (loading && !data) {
    return (
      <DynamicBackground condition="default">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 size={48} className="text-white/50 animate-spin" />
        </div>
      </DynamicBackground>
    );
  }

  if (!data) {
    return (
      <DynamicBackground condition="default">
        <div className="flex flex-col items-center justify-center min-h-screen">
          <GlassCard variant="prominent" className="p-8 text-center">
            <p className="text-white/60 mb-4">Location not found</p>
            <GlassButton onClick={() => router.push("/")}>
              Go Back Home
            </GlassButton>
          </GlassCard>
        </div>
      </DynamicBackground>
    );
  }

  return (
    <DynamicBackground condition={backgroundCondition}>
      {/* Top bar */}
      <motion.div
        className="flex items-center gap-3 px-4 pt-4 mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <GlassButton variant="ghost" size="sm" onClick={() => router.push("/")}>
          <ArrowLeft size={18} />
        </GlassButton>
        <h1 className="text-lg font-semibold text-white">
          {data.location.name}, {data.location.country}
        </h1>
      </motion.div>

      <main className="px-4 pb-8 max-w-4xl mx-auto space-y-6">
        <CurrentConditions current={data.current} location={data.location} />

        {/* Tab navigation */}
        <div className="flex gap-2">
          <GlassButton
            variant={activeTab === "forecast" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("forecast")}
          >
            5-Day Forecast
          </GlassButton>
          <GlassButton
            variant={activeTab === "longterm" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("longterm")}
          >
            Long-Term Trends
          </GlassButton>
        </div>

        {activeTab === "forecast" ? (
          <>
            <FiveDayForecast
              forecast={data.forecast}
              selectedDay={selectedDay}
              onSelectDay={setSelectedDay}
            />
            {data.forecast[selectedDay]?.hourly && (
              <HourlyTimeline entries={data.forecast[selectedDay].hourly} />
            )}
          </>
        ) : (
          <LongTermTrends
            lat={data.location.lat}
            currentTempKelvin={data.current.temp}
          />
        )}
      </main>
    </DynamicBackground>
  );
}
