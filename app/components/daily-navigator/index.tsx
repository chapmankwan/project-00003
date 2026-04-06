"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

import { getTodayString, buildLastXDays, addDays, formatDisplayDate, toUTCDateString } from "./utilities";

interface HeatmapEntry {
    date: string;
    completedCount: number;
    totalCount: number;
};

interface DailyNavigatorProps {
    selectedDate: string;
    onDateChange: (date: string) => void;
    heatmapData: HeatmapEntry[];
    onHeatmapLoad: (data: HeatmapEntry[]) => void;
};

const numberOfDays = 90;

// Colour mapping
const getCompletionColor = (completedCount: number, totalCount: number): string => {
    if (totalCount === 0) return "bg-mono-700/40 border-mono-700/20";
        const pct = completedCount / totalCount;
        if (pct === 0)   return "bg-mono-700/60 border-mono-600/30";
        if (pct < 0.25)  return "bg-lavender-900 border-lavender-900/60";
        if (pct < 0.5)   return "bg-lavender-800 border-lavender-800/60";
        if (pct < 0.75)  return "bg-lavender-700 border-lavender-700/60";
        if (pct < 1)     return "bg-lavender-600 border-lavender-600/60";
        return "bg-lavender-500 border-lavender-400/60"; // 100%
};

const getCompletionGlow = (completedCount: number, totalCount: number): string => {
    if (totalCount === 0 || completedCount === 0) return "";
    const pct = completedCount / totalCount;
    if (pct === 1) return "shadow-[0_0_6px_rgba(85,187,174,0.5)]";
    if (pct >= 0.75) return "shadow-[0_0_4px_rgba(85,187,174,0.25)]";
    return "";
}

export const DailyNavigator = ({ selectedDate, onDateChange, heatmapData, onHeatmapLoad }: DailyNavigatorProps) => {
    const [isOpen, setIsOpen] = useState(false);
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
            onHeatmapLoad(data);
        } catch (err) {
            console.error("Error fetching heatmap:", err);
        } finally {
            setIsLoading(false);
        }
    }, [today, onHeatmapLoad]);

    useEffect(() => {
        if (isOpen) fetchHeatmap();
    }, [isOpen, fetchHeatmap]);

    const handlePrev = () => onDateChange(addDays(selectedDate, -1));
    const handleNext = () => { if (!isToday) onDateChange(addDays(selectedDate, 1)); };

    const heatmapMap = new Map(
        heatmapData.map(entry => [
            toUTCDateString(new Date(entry.date)), // parse UTC for database api
            entry,
        ])
    );

    const lastXDays = buildLastXDays(today);

    // Tooltip content for hovered cell
    const hoveredEntry = hoveredDate ? heatmapMap.get(hoveredDate) : null;
    const tooltipText = hoveredDate
        ? hoveredEntry
            ? `${formatDisplayDate(hoveredDate)} · ${hoveredEntry.completedCount}/${hoveredEntry.totalCount} done`
            : `${formatDisplayDate(hoveredDate)} · no data`
        : null;

    return (
        <div className="w-[85%] md:w-2/3 py-3">
            <div className="flex items-center gap-2">

                <button
                    onClick={handlePrev}
                    className="p-1.5 rounded-sm cursor-pointer text-mono-400 hover:text-lavender-300 hover:bg-mono-700/60 transition-all duration-150"
                    aria-label="Previous day"
                >
                    <ChevronLeftIcon className="size-4" />
                </button>

                <button
                    onClick={() => setIsOpen(o => !o)}
                    className="flex-1 flex items-center justify-center cursor-pointer gap-2 py-1.5 border border-solid border-mono-500 rounded-lg hover:bg-mono-700/40 transition-all duration-150 group"
                >
                    <span className={`text-sm font-semibold transition-colors duration-150 ${isToday ? "text-lavender-400" : "text-mono-200"}`}>
                        {formatDisplayDate(selectedDate)}
                    </span>
                    {!isToday && (
                        <span className="text-xs text-mono-500">{selectedDate}</span>
                    )}
                    {isOpen
                        ? <ChevronUpIcon className="size-3 text-mono-500 group-hover:text-mono-300 transition-colors" />
                        : <ChevronDownIcon className="size-3 text-mono-500 group-hover:text-mono-300 transition-colors" />
                    }
                </button>

                <button
                    onClick={handleNext}
                    disabled={isToday}
                    className={`p-1.5 rounded-sm transition-all duration-150 cursor-pointer ${isToday
                        ? "text-mono-700 cursor-not-allowed"
                        : "text-mono-400 hover:text-lavender-300 hover:bg-mono-700/60"
                    }`}
                    aria-label="Next day"
                >
                    <ChevronRightIcon className="size-4" />
                </button>

                {!isToday && (
                    <button
                        onClick={() => onDateChange(today)}
                        className="px-2.5 py-1 rounded-sm text-xs font-semibold cursor-pointer text-lavender-400 border border-lavender-800/60 hover:bg-lavender-950/60 hover:border-lavender-700/60 transition-all duration-150"
                    >
                        Today
                    </button>
                )}
            </div>

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-40 opacity-100 mt-3" : "max-h-0 opacity-0"}`}>
                <div className="rounded-md border border-mono-700/40 bg-mono-900/40 p-3 space-y-2">

                    <div className="h-5 flex items-center">
                        {tooltipText
                            ? <p className="text-xs text-mono-300 font-mono">{tooltipText}</p>
                            : <p className="text-[10px] uppercase tracking-widest text-mono-600">Last {numberOfDays} days</p>
                        }
                    </div>

                    {isLoading ? (
                        <div className="flex gap-1 flex-wrap">
                            {Array.from({ length: 30 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="w-6 h-6 rounded-sm bg-mono-700/30 animate-pulse"
                                    style={{ animationDelay: `${i * 20}ms` }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex gap-1 flex-wrap">
                            {lastXDays.map(dateStr => {
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
                                            w-4 h-4 rounded-xs border transition-all duration-150
                                            ${colorClass}
                                            ${glowClass}
                                            ${isSelected ? "ring-1 ring-lavender-400 ring-offset-0.5 ring-offset-mono-900 scale-110" : ""}
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
                        {["bg-mono-700/30", "bg-lavender-950", "bg-lavender-900", "bg-lavender-800", "bg-lavender-700", "bg-lavender-500"].map(bg => (
                            <div key={bg} className={`w-3 h-3 rounded-sm ${bg}`} />
                        ))}
                        <span className="text-[10px] text-mono-600">More</span>
                    </div>
                </div>
            </div>
        </div>
    );
}