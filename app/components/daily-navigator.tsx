"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

import { getTodayString, buildLast30Days, addDays, formatDisplayDate, toUTCDateString } from "./daily-navigator/utilities";

type HeatmapEntry = {
    date: string; // ISO string from API
    completedCount: number;
    totalCount: number;
};

type DailyNavigatorProps = {
    selectedDate: string;           // "YYYY-MM-DD" — controlled by parent
    onDateChange: (date: string) => void;
};

// Colour mapping
function getCompletionColor(completedCount: number, totalCount: number): string {
    if (totalCount === 0) return "bg-mono-700/40 border-mono-700/20";
    const pct = completedCount / totalCount;
    if (pct === 0)   return "bg-mono-700/60 border-mono-600/30";
    if (pct < 0.25)  return "bg-mint-950 border-mint-900/60";
    if (pct < 0.5)   return "bg-mint-900 border-mint-800/60";
    if (pct < 0.75)  return "bg-mint-800 border-mint-700/60";
    if (pct < 1)     return "bg-mint-700 border-mint-600/60";
    return "bg-mint-500 border-mint-400/60"; // 100%
}

function getCompletionGlow(completedCount: number, totalCount: number): string {
    if (totalCount === 0 || completedCount === 0) return "";
    const pct = completedCount / totalCount;
    if (pct === 1) return "shadow-[0_0_6px_rgba(85,187,174,0.5)]";
    if (pct >= 0.75) return "shadow-[0_0_4px_rgba(85,187,174,0.25)]";
    return "";
}

export const DailyNavigator = ({ selectedDate, onDateChange }: DailyNavigatorProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredDate, setHoveredDate] = useState<string | null>(null);

    const today = getTodayString();
    const isToday = selectedDate === today;

    // Fetch heatmap data anchored to today
    const fetchHeatmap = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/daily/heatmap?date=${today}`);
            const data = await res.json();
            setHeatmapData(data);
        } catch (err) {
            console.error("Error fetching heatmap:", err);
        } finally {
            setIsLoading(false);
        }
    }, [today]);

    useEffect(() => {
        if (isOpen) fetchHeatmap();
    }, [isOpen, fetchHeatmap]);

    const handlePrev = () => onDateChange(addDays(selectedDate, -1));
    const handleNext = () => {
        if (!isToday) onDateChange(addDays(selectedDate, 1));
    };

    // Build lookup map for quick access
    const heatmapMap = new Map(
        heatmapData.map(entry => [
            toUTCDateString(new Date(entry.date)), // ← UTC parse for API dates
            entry,
        ])
    );

    const last30Days = buildLast30Days(today);

    // Tooltip content for hovered cell
    const hoveredEntry = hoveredDate ? heatmapMap.get(hoveredDate) : null;
    const tooltipText = hoveredDate
        ? hoveredEntry
            ? `${formatDisplayDate(hoveredDate)} · ${hoveredEntry.completedCount}/${hoveredEntry.totalCount} done`
            : `${formatDisplayDate(hoveredDate)} · no data`
        : null;

    return (
        <div className="w-[85%] py-3">
            <div className="flex items-center gap-2">

                <button
                    onClick={handlePrev}
                    className="p-1.5 rounded-lg text-mono-400 hover:text-mint-300 hover:bg-mono-700/60 transition-all duration-150"
                    aria-label="Previous day"
                >
                    <ChevronLeftIcon className="size-4" />
                </button>

                <button
                    onClick={() => setIsOpen(o => !o)}
                    className="flex-1 flex items-center justify-center gap-2 py-1.5 rounded-lg hover:bg-mono-700/40 transition-all duration-150 group"
                >
                    <span className={`text-sm font-semibold tracking-wide transition-colors duration-150 ${isToday ? "text-mint-400" : "text-mono-200"}`}>
                        {formatDisplayDate(selectedDate)}
                    </span>
                    {!isToday && (
                        <span className="text-xs text-mono-500 font-mono">{selectedDate}</span>
                    )}
                    {isOpen
                        ? <ChevronUpIcon className="size-3 text-mono-500 group-hover:text-mono-300 transition-colors" />
                        : <ChevronDownIcon className="size-3 text-mono-500 group-hover:text-mono-300 transition-colors" />
                    }
                </button>

                <button
                    onClick={handleNext}
                    disabled={isToday}
                    className={`p-1.5 rounded-lg transition-all duration-150 ${isToday
                        ? "text-mono-700 cursor-not-allowed"
                        : "text-mono-400 hover:text-mint-300 hover:bg-mono-700/60"
                    }`}
                    aria-label="Next day"
                >
                    <ChevronRightIcon className="size-4" />
                </button>

                {!isToday && (
                    <button
                        onClick={() => onDateChange(today)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-mint-400 border border-mint-800/60 hover:bg-mint-950/60 hover:border-mint-700/60 transition-all duration-150"
                    >
                        Today
                    </button>
                )}
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
                <div className="rounded-xl border border-mono-700/40 bg-mono-900/40 p-3 space-y-2">

                    <div className="h-5 flex items-center">
                        {tooltipText
                            ? <p className="text-xs text-mono-300 font-mono">{tooltipText}</p>
                            : <p className="text-[10px] uppercase tracking-widest text-mono-600">Last 30 days</p>
                        }
                    </div>

                    {isLoading ? (
                        <div className="flex gap-1 flex-wrap">
                            {Array.from({ length: 30 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-6 h-6 rounded-md bg-mono-700/30 animate-pulse"
                                    style={{ animationDelay: `${i * 20}ms` }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-1 flex-wrap">
                            {last30Days.map(dateStr => {
                                const entry = heatmapMap.get(dateStr);
                                const isSelected = dateStr === selectedDate;
                                const isFuture = dateStr > today;
                                const colorClass = entry
                                    ? getCompletionColor(entry.completedCount, entry.totalCount)
                                    : "bg-mono-700/30 border-mono-700/20";
                                const glowClass = entry ? getCompletionGlow(entry.completedCount, entry.totalCount) : "";

                                return (
                                    <button
                                        key={dateStr}
                                        disabled={isFuture}
                                        onClick={() => { onDateChange(dateStr); }}
                                        onMouseEnter={() => setHoveredDate(dateStr)}
                                        onMouseLeave={() => setHoveredDate(null)}
                                        className={`
                                            w-6 h-6 rounded-md border transition-all duration-150
                                            ${colorClass}
                                            ${glowClass}
                                            ${isSelected ? "ring-2 ring-mint-400 ring-offset-1 ring-offset-mono-900 scale-110" : ""}
                                            ${isFuture ? "opacity-20 cursor-not-allowed" : "cursor-pointer hover:scale-110 hover:brightness-125"}
                                        `}
                                        aria-label={dateStr}
                                    />
                                );
                            })}
                        </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-mono-600">Less</span>
                        {["bg-mono-700/30", "bg-mint-950", "bg-mint-900", "bg-mint-800", "bg-mint-700", "bg-mint-500"].map(bg => (
                            <div key={bg} className={`w-3 h-3 rounded-sm ${bg}`} />
                        ))}
                        <span className="text-[10px] text-mono-600">More</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
