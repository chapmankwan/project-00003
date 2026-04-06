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