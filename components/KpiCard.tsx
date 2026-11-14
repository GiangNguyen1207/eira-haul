import { twMerge } from "tailwind-merge";

type Tone = "default" | "positive" | "negative" | "warning";

const VALUE_TONE: Record<Tone, string> = {
	default: "text-foreground",
	positive: "text-emerald-700",
	negative: "text-red-700",
	warning: "text-amber-700",
};

export default function KpiCard({
	label,
	value,
	hint,
	tone = "default",
}: {
	label: string;
	value: string;
	hint?: string;
	tone?: Tone;
}) {
	return (
		<div className="rounded-xl border border-border bg-card p-5">
			<p className="text-xs uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className={twMerge("mt-2 text-2xl font-semibold", VALUE_TONE[tone])}>
				{value}
			</p>
			{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
		</div>
	);
}
