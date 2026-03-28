"use client";

import { Plus, Settings, RefreshCw, CloudSun } from "lucide-react";
import GlassButton from "../ui/GlassButton";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onAddLocation: () => void;
  onRefresh: () => void;
  loading: boolean;
}

export default function Header({ onAddLocation, onRefresh, loading }: HeaderProps) {
  const router = useRouter();
  return (
    <motion.header
      className="glass-subtle flex items-center justify-between px-5 py-3 mx-4 mt-4 mb-2"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <CloudSun size={28} className="text-blue-300" />
        <h1 className="text-xl font-bold text-white tracking-tight">
          WeatherLens
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <GlassButton onClick={onRefresh} variant="ghost" size="sm">
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
        </GlassButton>
        <GlassButton onClick={onAddLocation} variant="primary" size="sm">
          <div className="flex items-center gap-1.5">
            <Plus size={16} />
            <span className="hidden sm:inline">Add City</span>
          </div>
        </GlassButton>
        <GlassButton
          onClick={() => router.push("/settings")}
          variant="ghost"
          size="sm"
        >
          <Settings size={16} />
        </GlassButton>
      </div>
    </motion.header>
  );
}
