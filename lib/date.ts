export function getUTCStartOfDayPT(date: Date | undefined | string = new Date()) {
    const pt = new Date(
        date.toLocaleString("en-US", { timeZone: "America/Los_Angeles" })
    );

    pt.setHours(0, 0, 0, 0);

    return new Date(pt.toLocaleString("en-US", { timeZone: "UTC" }));
}