"use client";

import { useState } from "react";

export type DateRange = { start: string; end: string };

type Preset = { label: string; value: string };

const PRESETS: Preset[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "thisWeek" },
  { label: "Last Week", value: "lastWeek" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
  { label: "This Year", value: "thisYear" },
  { label: "Custom", value: "custom" },
];

function getPresetRange(preset: string): DateRange {
  const now = new Date();
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  switch (preset) {
    case "today":
      return { start: fmt(now), end: fmt(now) };
    case "thisWeek": {
      const day = now.getDay();
      const start = new Date(now);
      start.setDate(now.getDate() - day);
      return { start: fmt(start), end: fmt(now) };
    }
    case "lastWeek": {
      const end = new Date(now);
      end.setDate(now.getDate() - now.getDay() - 1);
      const start = new Date(end);
      start.setDate(end.getDate() - 6);
      return { start: fmt(start), end: fmt(end) };
    }
    case "thisMonth": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start: fmt(start), end: fmt(now) };
    }
    case "lastMonth": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: fmt(start), end: fmt(end) };
    }
    case "thisYear": {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start: fmt(start), end: fmt(now) };
    }
    default:
      return { start: "", end: "" };
  }
}

interface DateFilterProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  showCustom?: boolean;
  compact?: boolean;
}

export function DateFilter({ value, onChange, compact }: DateFilterProps) {
  const [activePreset, setActivePreset] = useState<string>(() => {
    if (!value.start && !value.end) return "thisMonth";
    return "custom";
  });

  const handlePreset = (presetValue: string) => {
    setActivePreset(presetValue);
    if (presetValue !== "custom") {
      onChange(getPresetRange(presetValue));
    }
  };

  const handleCustomDate = (field: "start" | "end", val: string) => {
    setActivePreset("custom");
    onChange({ ...value, [field]: val });
  };

  return (
    <div className="space-y-2">
      {/* Preset buttons */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => handlePreset(preset.value)}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
              activePreset === preset.value
                ? "bg-orange-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom date inputs */}
      {activePreset === "custom" && (
        <div className={`flex items-center gap-2 ${compact ? "" : "sm:flex-row"}`}>
          <div className="flex items-center gap-1.5">
            <label htmlFor="df-start" className="text-xs text-gray-500 whitespace-nowrap">From</label>
            <input
              id="df-start"
              type="date"
              value={value.start}
              onChange={(e) => handleCustomDate("start", e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <label htmlFor="df-end" className="text-xs text-gray-500 whitespace-nowrap">To</label>
            <input
              id="df-end"
              type="date"
              value={value.end}
              onChange={(e) => handleCustomDate("end", e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
      )}

      {/* Show date range summary when a preset is active */}
      {activePreset !== "custom" && value.start && (
        <p className="text-xs text-gray-500">
          {value.start} to {value.end}
        </p>
      )}
    </div>
  );
}
