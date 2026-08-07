export function toDateString(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export const  getTodayString = (): string  => {
    return toDateString(new Date());
}

export function addDays(dateStr: string, days: number): string {
    const d = new Date(`${dateStr}T00:00:00`);
    d.setDate(d.getDate() + days);
    return toDateString(d);
}

export function formatDisplayDate(dateStr: string): string {
    const d = new Date(`${dateStr}T00:00:00`);
    const today = getTodayString();
    const yesterday = addDays(today, -1);

    if (dateStr === today) return "Today";
    if (dateStr === yesterday) return "Yesterday";

    return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
    });
}

// Build the last X days as an array of "YYYY-MM-DD" strings
export function buildLastXDays(anchorDateStr: string): string[] {
    const xDays = 89 // 0->89 === 90 total
    const days: string[] = [];
    for (let i = xDays; i >= 0; i--) {
        days.push(addDays(anchorDateStr, -i));
    }
    return days;
}

export function toUTCDateString(date: Date): string {
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

// Colour mapping
export const getCompletionColor = (
  completedCount: number,
  totalCount: number,
  isHoliday: boolean = false
): string => {
        if (isHoliday) return "bg-mint-400 border-mint-400";
    if (totalCount === 0) return "bg-mono-800/70 border-mono-800/70";
        const pct = completedCount / totalCount;
        if (pct === 0)   return "bg-mono-800/70 border-mono-800/70";
        if (pct < 0.25)  return "bg-lavender-900 border-lavender-900";
        if (pct < 0.5)   return "bg-lavender-800 border-lavender-800";
        if (pct < 0.75)  return "bg-lavender-700 border-lavender-700";
        if (pct < 1)     return "bg-lavender-600 border-lavender-600";
        return "bg-lavender-500 border-lavender-500"; // 100%
};