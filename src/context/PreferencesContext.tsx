"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { UserPreferences, TemperatureUnit, SpeedUnit, ThemeMode } from "@/lib/types";
import { STORAGE_KEYS, DEFAULT_PREFERENCES } from "@/lib/constants";

interface PreferencesContextType {
  preferences: UserPreferences;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
  setSpeedUnit: (unit: SpeedUnit) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleNotification: (key: "severeWeather" | "dailyForecast") => void;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (stored) {
      try {
        setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(stored) });
      } catch {
        // ignore corrupt data
      }
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    }
  }, [preferences, loaded]);

  const setTemperatureUnit = useCallback((unit: TemperatureUnit) => {
    setPreferences((p) => ({ ...p, temperatureUnit: unit }));
  }, []);

  const setSpeedUnit = useCallback((unit: SpeedUnit) => {
    setPreferences((p) => ({ ...p, speedUnit: unit }));
  }, []);

  const setTheme = useCallback((theme: ThemeMode) => {
    setPreferences((p) => ({ ...p, theme }));
  }, []);

  const toggleNotification = useCallback((key: "severeWeather" | "dailyForecast") => {
    setPreferences((p) => ({
      ...p,
      notifications: { ...p.notifications, [key]: !p.notifications[key] },
    }));
  }, []);

  return (
    <PreferencesContext.Provider
      value={{ preferences, setTemperatureUnit, setSpeedUnit, setTheme, toggleNotification }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}
