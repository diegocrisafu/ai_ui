"use client";

import { useState, useMemo } from "react";
import { useLocations } from "@/context/LocationContext";
import DynamicBackground from "@/components/layout/DynamicBackground";
import Header from "@/components/layout/Header";
import LocationList from "@/components/location/LocationList";
import AddLocationModal from "@/components/location/AddLocationModal";
import { getWeatherCondition, isDaytime } from "@/lib/utils";
import { WeatherCondition } from "@/lib/types";
import { motion } from "framer-motion";
import { CloudSun, Plus } from "lucide-react";
import GlassButton from "@/components/ui/GlassButton";
import GlassCard from "@/components/ui/GlassCard";

export default function Dashboard() {
  const {
    locations,
    weatherData,
    loading,
    addLocation,
    removeLocation,
    reorderLocations,
    refreshWeather,
  } = useLocations();
  const [showAddModal, setShowAddModal] = useState(false);

  // Determine background based on primary location weather
  const backgroundCondition: WeatherCondition = useMemo(() => {
    if (locations.length === 0) return "default";
    const primary = weatherData.get(locations[0].id);
    if (!primary) return "default";
    const isDay = isDaytime(
      primary.current.dt,
      primary.current.sunrise,
      primary.current.sunset
    );
    return getWeatherCondition(primary.current.main, isDay);
  }, [locations, weatherData]);

  return (
    <DynamicBackground condition={backgroundCondition}>
      <Header
        onAddLocation={() => setShowAddModal(true)}
        onRefresh={refreshWeather}
        loading={loading}
      />

      <main className="flex-1 px-4 pb-8">
        {locations.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center min-h-[60vh] text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard variant="prominent" className="p-10 max-w-md">
              <CloudSun size={64} className="text-blue-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome to WeatherLens
              </h2>
              <p className="text-white/60 mb-6">
                Track weather across all your locations. Add your first city to
                get started.
              </p>
              <GlassButton
                variant="primary"
                size="lg"
                onClick={() => setShowAddModal(true)}
              >
                <div className="flex items-center gap-2">
                  <Plus size={20} />
                  Add Your First City
                </div>
              </GlassButton>
            </GlassCard>
          </motion.div>
        ) : (
          <LocationList
            locations={locations}
            weatherData={weatherData}
            onReorder={reorderLocations}
            onRemove={removeLocation}
          />
        )}
      </main>

      <AddLocationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addLocation}
      />
    </DynamicBackground>
  );
}
