"use client";

import clsx from "clsx";
import { buildLastXDays, getCompletionColor, getCompletionGlow, formatDisplayDate, toUTCDateString } from "./daily-navigator/utilities";
import { useState } from "react";

interface HeatmapEntry {
  date: string;
  completedCount: number;
  totalCount: number;
}

interface HeatmapCardProps {
  anchorDate?: string; // YYYY-MM-DD, defaults to today
  heatmapData?: HeatmapEntry[];
  onDateSelect?: (date: string) => void;
}

export const HeatmapCard = ({ anchorDate, heatmapData = [], onDateSelect }: HeatmapCardProps) => {
  const [hovered, setHovered] = useState<string | null>(null);

  const anchor = anchorDate ?? new Date().toISOString().slice(0, 10);
  const days = buildLastXDays(anchor);

  const map = new Map(heatmapData.map(e => [toUTCDateString(new Date(e.date)), e]));

  const hoveredEntry = hovered ? map.get(hovered) : null;

  return (
    <div className="rounded-xl bg-mono-700 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase text-mono-400">Heatmap</p>
        <p className="text-xs text-mono-500">Last 90 days</p>
      </div>

      <div className="mb-3 h-5">
        {hoveredEntry ? (
          <p className="text-xs text-mono-300 font-mono">{formatDisplayDate(hovered!)} · {hoveredEntry.completedCount}/{hoveredEntry.totalCount} done</p>
        ) : (
          <p className="text-xs text-mono-400">Activity</p>
        )}
      </div>

      <div className="flex gap-1 flex-wrap">
        {days.map(d => {
          const entry = map.get(d);
          return (
            <button
              key={d}
              onClick={() => onDateSelect?.(d)}
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
              className={clsx(
                "w-4 h-4 rounded-xs border transition-all duration-150",
                entry ? getCompletionColor(entry.completedCount, entry.totalCount) : "bg-mono-700/30 border-mono-700/20",
                entry ? getCompletionGlow(entry.completedCount, entry.totalCount) : "",
                "cursor-pointer hover:scale-110 hover:brightness-110"
              )}
              aria-label={d}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-1 pt-2">
        <span className="text-[10px] text-mono-600">Less</span>
        {[
          "bg-mono-700/30",
          "bg-lavender-950",
          "bg-lavender-900",
          "bg-lavender-800",
          "bg-lavender-700",
          "bg-lavender-500",
        ].map(bg => (
          <div key={bg} className={`w-3 h-3 rounded-sm ${bg}`} />
        ))}
        <span className="text-[10px] text-mono-600">More</span>
      </div>
    </div>
  );
};

export default HeatmapCard;