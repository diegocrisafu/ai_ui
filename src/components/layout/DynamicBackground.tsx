"use client";

import { motion } from "framer-motion";
import { WeatherCondition } from "@/lib/types";
import { getBackgroundGradient } from "@/lib/weather-backgrounds";
import { ReactNode, useMemo } from "react";

interface DynamicBackgroundProps {
  condition: WeatherCondition;
  children: ReactNode;
}

export default function DynamicBackground({
  condition,
  children,
}: DynamicBackgroundProps) {
  const gradient = getBackgroundGradient(condition);

  const particles = useMemo(() => {
    if (condition === "rain" || condition === "drizzle") {
      return Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 3,
        duration: 1 + Math.random() * 1.5,
        opacity: 0.2 + Math.random() * 0.3,
      }));
    }
    if (condition === "snow") {
      return Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: 4 + Math.random() * 4,
        opacity: 0.4 + Math.random() * 0.4,
      }));
    }
    return [];
  }, [condition]);

  return (
    <div className="fixed inset-0 min-h-screen overflow-auto">
      <motion.div
        className={`fixed inset-0 bg-gradient-to-br ${gradient} animated-gradient -z-20`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        key={condition}
      />

      {/* Weather particles */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-[2px] rounded-full"
            style={{
              left: p.left,
              top: "-20px",
              height: condition === "snow" ? "6px" : "20px",
              width: condition === "snow" ? "6px" : "2px",
              borderRadius: condition === "snow" ? "50%" : "1px",
              backgroundColor:
                condition === "snow"
                  ? `rgba(255, 255, 255, ${p.opacity})`
                  : `rgba(174, 194, 224, ${p.opacity})`,
              animation: `${condition === "snow" ? "snowFall" : "rainDrop"} ${p.duration}s linear ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-0 min-h-screen">{children}</div>
    </div>
  );
}
