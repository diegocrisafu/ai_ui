"use client";

import { motion } from "framer-motion";

interface GlassToggleProps {
  enabled: boolean;
  onToggle: () => void;
  label?: string;
}

export default function GlassToggle({ enabled, onToggle, label }: GlassToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-3 cursor-pointer"
    >
      <div
        className={`
          relative w-12 h-6 rounded-full border transition-colors duration-200
          ${enabled
            ? "bg-blue-500/40 border-blue-400/40"
            : "bg-white/10 border-white/20"
          }
        `}
      >
        <motion.div
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md"
          animate={{ left: enabled ? "24px" : "2px" }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
      {label && <span className="text-white/80 text-sm">{label}</span>}
    </button>
  );
}
