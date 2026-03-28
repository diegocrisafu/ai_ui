import { LongTermData } from "@/lib/types";

// Generate simulated long-term weather data based on latitude
// Northern hemisphere: warm summer (Jun-Aug), cold winter (Dec-Feb)
// Southern hemisphere: reversed
// Tropical: relatively stable year-round

export function generateLongTermData(
  lat: number,
  currentTempKelvin: number
): LongTermData[] {
  const currentCelsius = currentTempKelvin - 273.15;
  const isNorthern = lat >= 0;
  const isTropical = Math.abs(lat) < 23.5;

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  // Temperature variation amplitude based on latitude
  const amplitude = isTropical ? 3 : Math.min(Math.abs(lat) * 0.4, 20);

  // Average annual temperature (estimate from current)
  const annualAvg = currentCelsius;

  return months.map((month, i) => {
    // Sinusoidal temperature model
    // Peak warmth in month 6 (July) for northern, month 0 (January) for southern
    const peakMonth = isNorthern ? 6 : 0;
    const phase = ((i - peakMonth) / 12) * 2 * Math.PI;
    const tempOffset = amplitude * Math.cos(phase);

    const avgHigh = Math.round(annualAvg + tempOffset + 5);
    const avgLow = Math.round(annualAvg + tempOffset - 5);

    // Precipitation model — higher in summer / monsoon months
    const precipPhase = isNorthern
      ? ((i - 6) / 12) * 2 * Math.PI
      : ((i - 0) / 12) * 2 * Math.PI;
    const basePrecip = isTropical ? 70 : 40;
    const precipitation = Math.round(
      basePrecip + 30 * Math.cos(precipPhase) + Math.random() * 10
    );

    // Description based on temperature
    const avgTemp = (avgHigh + avgLow) / 2;
    let description: string;
    if (avgTemp > 30) description = "Hot and humid";
    else if (avgTemp > 25) description = "Warm and pleasant";
    else if (avgTemp > 15) description = "Mild conditions";
    else if (avgTemp > 5) description = "Cool and crisp";
    else if (avgTemp > -5) description = "Cold with possible snow";
    else description = "Very cold, heavy snowfall likely";

    return {
      month,
      avgHigh,
      avgLow,
      precipitation: Math.max(10, Math.min(100, precipitation)),
      description,
    };
  });
}

export function getLongTermByRange(
  data: LongTermData[],
  range: "1m" | "3m" | "6m"
): LongTermData[] {
  const currentMonth = new Date().getMonth();
  const count = range === "1m" ? 1 : range === "3m" ? 3 : 6;
  const result: LongTermData[] = [];
  for (let i = 0; i < count; i++) {
    result.push(data[(currentMonth + i) % 12]);
  }
  return result;
}
