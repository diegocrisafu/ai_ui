"use client";

import { useState, useEffect, useRef } from "react";
import GlassModal from "../ui/GlassModal";
import GlassInput from "../ui/GlassInput";
import { searchCities, geoResultToLocation, reverseGeocode } from "@/lib/api";
import { Location } from "@/lib/types";
import { MapPin, Search, Navigation, Loader2 } from "lucide-react";

interface AddLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (location: Location) => void;
}

interface SearchResult {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export default function AddLocationModal({
  isOpen,
  onClose,
  onAdd,
}: AddLocationModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [geoError, setGeoError] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const cities = await searchCities(query);
      setResults(cities);
      setSearching(false);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    const location = geoResultToLocation(result);
    onAdd(location);
    setQuery("");
    setResults([]);
    onClose();
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setGeoError("");
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const geo = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (geo) {
          handleSelect(geo);
        } else {
          setGeoError("Could not determine your location. Try searching instead.");
        }
        setDetectingLocation(false);
      },
      (err) => {
        setDetectingLocation(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("Location access denied. Please enable it in your browser settings.");
        } else {
          setGeoError("Could not determine your location. Try searching instead.");
        }
      }
    );
  };

  return (
    <GlassModal isOpen={isOpen} onClose={onClose} title="Add Location">
      <div className="space-y-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <GlassInput
            placeholder="Search for a city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        <button
          onClick={handleDetectLocation}
          disabled={detectingLocation}
          className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm transition-colors w-full cursor-pointer"
        >
          {detectingLocation ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Navigation size={14} />
          )}
          Use my current location
        </button>

        {geoError && (
          <p className="text-red-400/80 text-xs">{geoError}</p>
        )}

        {searching && (
          <div className="flex items-center gap-2 text-white/50 text-sm py-2">
            <Loader2 size={14} className="animate-spin" />
            Searching...
          </div>
        )}

        <div className="max-h-60 overflow-y-auto space-y-1">
          {results.map((result, index) => (
            <button
              key={`${result.lat}-${result.lon}-${index}`}
              onClick={() => handleSelect(result)}
              className="
                flex items-center gap-3 w-full p-3 rounded-xl
                hover:bg-white/10 transition-colors text-left cursor-pointer
              "
            >
              <MapPin size={16} className="text-white/40 shrink-0" />
              <div>
                <p className="text-white font-medium">{result.name}</p>
                <p className="text-white/50 text-sm">{result.country}</p>
              </div>
            </button>
          ))}
        </div>

        {query && !searching && results.length === 0 && (
          <p className="text-white/40 text-sm text-center py-4">
            No cities found. Try a different search.
          </p>
        )}
      </div>
    </GlassModal>
  );
}
