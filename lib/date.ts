import { RRule } from "rrule";

// export function getUTCStartOfDayPT(date: Date | undefined | string = new Date()) {
//     const pt = new Date(
//         date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
//     );

//     pt.setHours(0, 0, 0, 0);

//     return new Date(pt.toLocaleString("en-US", { timeZone: "UTC" }));
// }

export function shouldIncludeTemplate(recurrenceStr: string, date: Date): boolean {
    const rule = RRule.fromString(recurrenceStr);

    // Anchor dtstart to the date being checked so RRule
    // generates occurrences relative to UTC midnight
    const anchored = new RRule({
        ...rule.origOptions,
        dtstart: new Date(Date.UTC(
            date.getUTCFullYear(),
            date.getUTCMonth(),
            date.getUTCDate(),
            0, 0, 0
        )),
    });

    const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0));
    const dayEnd   = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));

    return anchored.between(dayStart, dayEnd, true).length > 0;
}