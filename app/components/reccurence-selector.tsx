"use client";

import { useState, useEffect } from "react";

// Types
interface Preset {
	label: string;
	description: string;
	rrule: string;
};

interface CustomConfig {
	freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
	weekdays: string[];
	monthDay: number;
	month: number;
};

// Constants 
const PRESETS: Preset[] = [
	{
		label: "Every day",
		description: "Runs daily without exception",
		rrule: "FREQ=DAILY",
	},
	{
		label: "Weekdays",
		description: "Mon - Fri only",
		rrule: "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR",
	},
	{
		label: "Weekends",
		description: "Sat & Sun only",
		rrule: "FREQ=WEEKLY;BYDAY=SA,SU",
	},
	{
		label: "Once a week",
		description: "Pick a specific day",
		rrule: "FREQ=WEEKLY;BYDAY=MO", // overridden by custom day picker
	},
	{
		label: "Once a month",
		description: "Pick a day of the month",
		rrule: "FREQ=MONTHLY;BYMONTHDAY=1",
	},
	{
		label: "Once a year",
		description: "Pick a specific date",
		rrule: "FREQ=YEARLY;BYMONTH=1;BYMONTHDAY=1",
	},
];

const WEEKDAY_OPTIONS = [
	{ label: "Mon", value: "MO" },
	{ label: "Tue", value: "TU" },
	{ label: "Wed", value: "WE" },
	{ label: "Thu", value: "TH" },
	{ label: "Fri", value: "FR" },
	{ label: "Sat", value: "SA" },
	{ label: "Sun", value: "SU" },
];

const MONTH_NAMES = [
	"Jan","Feb","Mar","Apr","May","Jun",
	"Jul","Aug","Sep","Oct","Nov","Dec",
];

const ORDINAL = (n: number) => {
	const s = ["th","st","nd","rd"];
	const v = n % 100;
	return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildRRule(presetIndex: number, custom: CustomConfig): string {
	switch (presetIndex) {
		case 0: return "FREQ=DAILY";
		case 1: return "FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";
		case 2: return "FREQ=WEEKLY;BYDAY=SA,SU";
		case 3: {
			const day = custom.weekdays[0] || "MO";
			return `FREQ=WEEKLY;BYDAY=${day}`;
		}
		case 4: return `FREQ=MONTHLY;BYMONTHDAY=${custom.monthDay}`;
		case 5: return `FREQ=YEARLY;BYMONTH=${custom.month};BYMONTHDAY=${custom.monthDay}`;
		default: return "FREQ=DAILY";
	}
}

function humanReadable(presetIndex: number, custom: CustomConfig): string {
	switch (presetIndex) {
		case 0: return "Every day";
		case 1: return "Every weekday (Mon–Fri)";
		case 2: return "Every weekend (Sat & Sun)";
		case 3: {
			const d = WEEKDAY_OPTIONS.find(w => w.value === (custom.weekdays[0] || "MO"));
			return `Every ${d?.label ?? "Monday"}`;
		}
		case 4: return `Monthly on the ${ORDINAL(custom.monthDay)}`;
		case 5: return `Every ${MONTH_NAMES[custom.month - 1]} ${ORDINAL(custom.monthDay)}`;
		default: return "Custom";
	}
}

// Sub components

function WeekdayPicker({
	selected,
	multi,
	onChange,
}: {
	selected: string[];
	multi: boolean;
	onChange: (days: string[]) => void;
}) {
	const toggle = (val: string) => {
		if (multi) {
			onChange(
				selected.includes(val)
					? selected.filter(d => d !== val)
					: [...selected, val]
			);
		} else {
			onChange([val]);
		}
	};

	return (
		<div className="flex gap-1.5 flex-wrap">
			{WEEKDAY_OPTIONS.map(({ label, value }) => {
				const active = selected.includes(value);
				return (
					<button
						key={value}
						type="button"
						onClick={() => toggle(value)}
						className={`
							w-10 h-10 rounded-lg text-xs font-semibold tracking-wide
							transition-all duration-150 border
							${active
								? "bg-stone-800 text-amber-300 border-stone-700 shadow-inner"
								: "bg-stone-900/50 text-stone-400 border-stone-700/50 hover:border-stone-500 hover:text-stone-200"
							}
						`}
					>
						{label}
					</button>
				);
			})}
		</div>
	);
}

function MonthDayPicker({
	value,
	onChange,
}: {
	value: number;
	onChange: (day: number) => void;
}) {
	const days = Array.from({ length: 31 }, (_, i) => i + 1);
	return (
		<div className="flex flex-wrap gap-1">
			{days.map(d => (
				<button
					key={d}
					type="button"
					onClick={() => onChange(d)}
					className={`
						w-8 h-8 rounded text-xs font-medium transition-all duration-100 border
						${value === d
							? "bg-stone-800 text-amber-300 border-stone-600"
							: "bg-stone-900/40 text-stone-500 border-stone-700/40 hover:text-stone-200 hover:border-stone-500"
						}
					`}
				>
					{d}
				</button>
			))}
		</div>
	);
}

function MonthPicker({
	value,
	onChange,
}: {
	value: number;
	onChange: (month: number) => void;
}) {
	return (
		<div className="flex flex-wrap gap-1">
			{MONTH_NAMES.map((name, i) => {
				const month = i + 1;
				return (
					<button
						key={name}
						type="button"
						onClick={() => onChange(month)}
						className={`
							px-3 py-1.5 rounded text-xs font-medium transition-all duration-100 border
							${value === month
								? "bg-stone-800 text-amber-300 border-stone-600"
								: "bg-stone-900/40 text-stone-500 border-stone-700/40 hover:text-stone-200 hover:border-stone-500"
							}
						`}
					>
						{name}
					</button>
				);
			})}
		</div>
	);
}

// Main component

interface RecurrenceSelectorProps {
	/** Current rrule string value — controlled */
	value?: string;
	/** Called whenever the rrule string changes */
	onChange: (rrule: string) => void;
}

export default function RecurrenceSelector({
	// value,
	onChange,
}: RecurrenceSelectorProps) {
	const [selectedPreset, setSelectedPreset] = useState(0);
	const [custom, setCustom] = useState<CustomConfig>({
		freq: "WEEKLY",
		weekdays: ["MO"],
		monthDay: 1,
		month: 1,
	});

	// Sync outward whenever selection or custom config changes
	useEffect(() => {
		onChange(buildRRule(selectedPreset, custom));
	}, [selectedPreset, custom]); // eslint-disable-line react-hooks/exhaustive-deps

	const updateCustom = (patch: Partial<CustomConfig>) =>
		setCustom(prev => ({ ...prev, ...patch }));

	const needsWeekdayPicker = selectedPreset === 3;
	const needsMonthDayPicker = selectedPreset === 4 || selectedPreset === 5;
	const needsMonthPicker = selectedPreset === 5;
	const showSubPicker = needsWeekdayPicker || needsMonthDayPicker;

	const currentRRule = buildRRule(selectedPreset, custom);
	const currentHuman = humanReadable(selectedPreset, custom);

	return (
		<div className="w-full space-y-3">

			{/* Label */}
			<div className="flex items-center justify-between">
				<span className="text-xs uppercase tracking-widest text-mono-100 font-semibold">
					Recurrence
				</span>
				<span className="text-xs uppercase text-blush-400 truncate max-w-[60%] text-right">
					{currentHuman}
				</span>
			</div>

			{/* Preset grid */}
			<div className="grid grid-cols-3 gap-2">
				{PRESETS.map((preset, i) => {
					const active = selectedPreset === i;
					return (
						<button
							key={preset.label}
							type="button"
							onClick={() => setSelectedPreset(i)}
							className={`
								relative px-3 py-2.5 rounded-xl text-left transition-all duration-150
								border group overflow-hidden cursor-pointer
								${active
									? "bg-mono-800 border-mono-600 shadow-md"
									: "bg-mono-900/60 border-mono-700/50 hover:border-lavender-600 hover:bg-lavender-800/60"
								}
							`}
						>
							{/* Active indicator pip */}
							{active && (
								<span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-amber-400" />
							)}
							<p className={`text-xs font-semibold leading-tight ${active ? "text-mono-100" : "text-mono-400 group-hover:text-mono-200"}`}>
								{preset.label}
							</p>
							<p className="text-[10px] text-stone-600 mt-0.5 leading-tight">
								{preset.description}
							</p>
						</button>
					);
				})}
			</div>

			{/* Sub-pickers — only shown when relevant preset is selected */}
			{showSubPicker && (
				<div className="rounded-xl border border-stone-700/60 bg-stone-900/40 p-3 space-y-3 transition-all">

					{needsWeekdayPicker && (
						<div className="space-y-1.5">
							<p className="text-[10px] uppercase tracking-widest text-stone-600">Day of week</p>
							<WeekdayPicker
								selected={custom.weekdays}
								multi={false}
								onChange={days => updateCustom({ weekdays: days })}
							/>
						</div>
					)}

					{needsMonthPicker && (
						<div className="space-y-1.5">
							<p className="text-[10px] uppercase tracking-widest text-stone-600">Month</p>
							<MonthPicker
								value={custom.month}
								onChange={month => updateCustom({ month })}
							/>
						</div>
					)}

					{needsMonthDayPicker && (
						<div className="space-y-1.5">
							<p className="text-[10px] uppercase tracking-widest text-stone-600">Day of month</p>
							<MonthDayPicker
								value={custom.monthDay}
								onChange={monthDay => updateCustom({ monthDay })}
							/>
						</div>
					)}
				</div>
			)}

			{/* RRule debug output — remove in production */}
			<div className="rounded-lg border border-stone-800 bg-stone-950/60 px-3 py-2">
				<p className="text-[10px] uppercase tracking-widest text-stone-700 mb-0.5">rrule output</p>
				<code className="text-[11px] text-stone-400 break-all">{currentRRule}</code>
			</div>

		</div>
	);
}