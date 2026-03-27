const WEEKDAY_OPTIONS = [
  { label: "Mon", value: "MO" }, { label: "Tue", value: "TU" },
  { label: "Wed", value: "WE" }, { label: "Thu", value: "TH" },
  { label: "Fri", value: "FR" }, { label: "Sat", value: "SA" },
  { label: "Sun", value: "SU" },
];

const MONTH_NAMES = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

const ORDINAL = (n: number) => {
  const s = ["th","st","nd","rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export function rruleToHumanReadable(rrule: string): string {
  if (!rrule) return "Every day";

  const parts = Object.fromEntries(
    rrule.split(";").map(p => p.split("=") as [string, string])
  );

  const freq     = parts["FREQ"];
  const byday    = parts["BYDAY"];
  const bymonth  = parts["BYMONTH"]    ? parseInt(parts["BYMONTH"])    : null;
  const monthday = parts["BYMONTHDAY"] ? parseInt(parts["BYMONTHDAY"]) : null;

  switch (freq) {
    case "DAILY":
      return "Every day";

    case "WEEKLY": {
      if (byday === "MO,TU,WE,TH,FR") return "Every weekday (Mon–Fri)";
      if (byday === "SA,SU")           return "Every weekend (Sat & Sun)";
      // single day
      const day = WEEKDAY_OPTIONS.find(w => w.value === byday);
      return `Every ${day?.label ?? byday}`;
    }

    case "MONTHLY":
      return monthday ? `Monthly on the ${ORDINAL(monthday)}` : "Monthly";

    case "YEARLY":
      if (bymonth && monthday) {
        return `Every ${MONTH_NAMES[bymonth - 1]} ${ORDINAL(monthday)}`;
      }
      return "Yearly";

    default:
      return rrule; // fallback: show raw string rather than silently swallowing it
  }
}