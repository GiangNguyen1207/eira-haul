export const capitalizeFirstLetter = (str: string) => {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
};

const eur0 = new Intl.NumberFormat("en-IE", {
	style: "currency",
	currency: "EUR",
	maximumFractionDigits: 0,
});

/** €1,235 — whole euros, no decimals. Handles Infinity/NaN gracefully. */
export function formatCurrency(value: number): string {
	if (!Number.isFinite(value)) return "—";
	return eur0.format(Math.round(value));
}

/** +€1,235 / −€400 — signed, for deltas and cash flows. */
export function formatSigned(value: number): string {
	if (!Number.isFinite(value)) return "—";
	let sign = "";
	if (value > 0) sign = "+";
	else if (value < 0) sign = "−";
	return `${sign}${eur0.format(Math.abs(Math.round(value)))}`;
}

/** 44.7% */
export function formatPct(value: number, digits = 1): string {
	if (!Number.isFinite(value)) return "—";
	return `${value.toFixed(digits)}%`;
}

const MONTHS = [
	"Jan", "Feb", "Mar", "Apr", "May", "Jun",
	"Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const eur3 = new Intl.NumberFormat("en-IE", {
	style: "currency",
	currency: "EUR",
	minimumFractionDigits: 3,
	maximumFractionDigits: 3,
});

/** €3.500 — 3 decimal places, for prices and line items. */
export function formatPrice(value: number): string {
	if (!Number.isFinite(value)) return "—";
	return eur3.format(value);
}

// The shop operates in Helsinki, so recorded times are anchored to this zone
// regardless of where the server runs.
const HELSINKI_TZ = "Europe/Helsinki";

/** Minutes to add to UTC to reach Helsinki wall-clock time at `instant` (DST-aware). */
function helsinkiOffsetMinutes(instant: Date): number {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone: HELSINKI_TZ,
		hourCycle: "h23",
		year: "numeric", month: "2-digit", day: "2-digit",
		hour: "2-digit", minute: "2-digit", second: "2-digit",
	}).formatToParts(instant);
	const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
	const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
	return Math.round((asUtc - instant.getTime()) / 60000);
}

/** ISO instant → "10 Nov 2026, 16:30" — rendered in Helsinki time. */
export function formatDateTime(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleString("en-IE", {
		timeZone: HELSINKI_TZ,
		day: "numeric", month: "short", year: "numeric",
		hour: "2-digit", minute: "2-digit",
	});
}

/** Instant → "YYYY-MM-DDTHH:MM" Helsinki wall clock, for datetime-local inputs. */
export function toDatetimeLocal(date: Date): string {
	const local = new Date(date.getTime() + helsinkiOffsetMinutes(date) * 60000);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`;
}

/**
 * Interpret a datetime-local wall-clock string ("YYYY-MM-DDTHH:MM") as Helsinki
 * time and return the matching UTC instant as an ISO string, so it is stored
 * correctly in a timestamptz column (DST-aware).
 */
export function datetimeLocalToISO(wallClock: string): string {
	if (!wallClock) return wallClock;
	const guess = new Date(`${wallClock}Z`); // read the wall clock as if it were UTC
	if (Number.isNaN(guess.getTime())) return wallClock;
	// One refinement pass settles the offset around DST transitions.
	let utc = new Date(guess.getTime() - helsinkiOffsetMinutes(guess) * 60000);
	utc = new Date(guess.getTime() - helsinkiOffsetMinutes(utc) * 60000);
	return utc.toISOString();
}

/** "2026-01" → "Jan 2026" */
export function formatMonth(month: string): string {
	const [y, m] = month.split("-").map(Number);
	if (!y || !m) return month;
	return `${MONTHS[m - 1]} ${y}`;
}
