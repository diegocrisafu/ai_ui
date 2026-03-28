"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { Location, LocationWeather } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";
import { fetchLocationWeather } from "@/lib/api";

interface LocationContextType {
  locations: Location[];
  weatherData: Map<string, LocationWeather>;
  loading: boolean;
  addLocation: (location: Location) => void;
  removeLocation: (id: string) => void;
  reorderLocations: (locations: Location[]) => void;
  refreshWeather: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [weatherData, setWeatherData] = useState<Map<string, LocationWeather>>(new Map());
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    if (stored) {
      try {
        setLocations(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    setLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
    }
  }, [locations, loaded]);

  const refreshWeather = useCallback(async () => {
    if (locations.length === 0) return;
    setLoading(true);
    try {
      const settled = await Promise.allSettled(
        locations.map((loc) => fetchLocationWeather(loc))
      );
      const newData = new Map<string, LocationWeather>();
      settled.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          newData.set(result.value.location.id, result.value);
          setLocations((prev) =>
            prev.map((loc) =>
              loc.id === result.value!.location.id
                ? { ...loc, timezone: result.value!.location.timezone }
                : loc
            )
          );
        }
      });
      setWeatherData(newData);
    } finally {
      setLoading(false);
    }
  }, [locations]);

  // Fetch weather when locations change
  useEffect(() => {
    if (loaded && locations.length > 0) {
      refreshWeather();
    }
  }, [loaded, locations.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const addLocation = useCallback((location: Location) => {
    setLocations((prev) => [...prev, location]);
  }, []);

  const removeLocation = useCallback((id: string) => {
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
    setWeatherData((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const reorderLocations = useCallback((newLocations: Location[]) => {
    setLocations(newLocations);
  }, []);

  return (
    <LocationContext.Provider
      value={{
        locations,
        weatherData,
        loading,
        addLocation,
        removeLocation,
        reorderLocations,
        refreshWeather,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocations() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocations must be used within LocationProvider");
  return ctx;
}
