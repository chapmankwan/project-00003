// export const selectedTimeZone = "America/Los_Angeles";

// const dateOptions: Intl.DateTimeFormatOptions = {
//     weekday: "long",
//     year: "numeric",
//     month: "long",
//     day: "numeric",
//     timeZone: selectedTimeZone,
//     timeZoneName: "short",
// }

// export const todaysDate = new Date().toLocaleDateString("en-CA", { ...dateOptions });

export const todaysDate = new Date().toISOString().split("T")[0];
