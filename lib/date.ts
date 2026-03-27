import { RRule } from "rrule";

export function getUTCStartOfDayPT(date: Date | undefined | string = new Date()) {
    const pt = new Date(
        date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );

    pt.setHours(0, 0, 0, 0);

    return new Date(pt.toLocaleString("en-US", { timeZone: "UTC" }));
}

export function shouldIncludeTemplate(recurrenceStr: string, date: Date): boolean {
    const rule = RRule.fromString(recurrenceStr);
    // Check if the rule produces an occurrence on this exact date
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setUTCHours(23, 59, 59, 999);
    
    return rule.between(dayStart, dayEnd, true).length > 0;
}