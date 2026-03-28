"use client";

import { useState, useMemo } from "react";
import { LongTermData } from "@/lib/types";
import { generateLongTermData, getLongTermByRange } from "@/data/mock-long-term";
import GlassCard from "../ui/GlassCard";
import GlassButton from "../ui/GlassButton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, Info } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";

interface LongTermTrendsProps {
  lat: number;
  currentTempKelvin: number;
}

type TimeRange = "1m" | "3m" | "6m";

export default function LongTermTrends({
  lat,
  currentTempKelvin,
}: LongTermTrendsProps) {
  const [range, setRange] = useState<TimeRange>("3m");
  const { preferences } = usePreferences();
  const unitLabel = preferences.temperatureUnit === "celsius" ? "°C" : "°F";

  const allData = useMemo(
    () => generateLongTermData(lat, currentTempKelvin),
    [lat, currentTempKelvin]
  );

  const displayData = useMemo(
    () => getLongTermByRange(allData, range),
    [allData, range]
  );

  const ranges: { value: TimeRange; label: string }[] = [
    { value: "1m", label: "1 Month" },
    { value: "3m", label: "3 Months" },
    { value: "6m", label: "6 Months" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-white/60" />
          <h3 className="text-white/70 text-sm font-medium uppercase tracking-wider">
            Long-Term Trends
          </h3>
        </div>
        <div className="flex gap-1">
          {ranges.map((r) => (
            <GlassButton
              key={r.value}
              size="sm"
              variant={range === r.value ? "primary" : "ghost"}
              onClick={() => setRange(r.value)}
            >
              {r.label}
            </GlassButton>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-amber-300/70 text-xs">
        <Info size={12} />
        <span>Estimated trends based on historical climate patterns</span>
      </div>

      {/* Temperature Chart */}
      <GlassCard variant="subtle" className="p-4">
        <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">
          Temperature Range ({unitLabel})
        </h4>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData}>
              <defs>
                <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="lowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(0,0,0,0.7)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  color: "white",
                }}
              />
              <Area
                type="monotone"
                dataKey="avgHigh"
                stroke="#f97316"
                fill="url(#highGrad)"
                name="Avg High"
              />
              <Area
                type="monotone"
                dataKey="avgLow"
                stroke="#60a5fa"
                fill="url(#lowGrad)"
                name="Avg Low"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Precipitation Chart */}
      <GlassCard variant="subtle" className="p-4">
        <h4 className="text-white/60 text-xs uppercase tracking-wider mb-3">
          Precipitation Probability (%)
        </h4>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={displayData}>
              <XAxis
                dataKey="month"
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.3)"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(0,0,0,0.7)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 8,
                  color: "white",
                }}
              />
              <Bar
                dataKey="precipitation"
                fill="rgba(96, 165, 250, 0.5)"
                radius={[4, 4, 0, 0]}
                name="Precip %"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Monthly summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {displayData.map((d) => (
          <GlassCard key={d.month} variant="subtle" className="p-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white font-semibold">{d.month}</p>
                <p className="text-white/40 text-xs">{d.description}</p>
              </div>
              <div className="text-right">
                <p className="text-orange-300 text-sm font-medium">{d.avgHigh}{unitLabel}</p>
                <p className="text-blue-300 text-sm">{d.avgLow}{unitLabel}</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
