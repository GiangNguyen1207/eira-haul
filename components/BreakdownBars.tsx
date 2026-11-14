import { formatCurrency } from "@/lib/utils";

export type BreakdownRow = {
	name: string;
	revenue: number;
	units: number;
};

// Horizontal revenue bars with share-of-total — used for platform / category splits.
export default function BreakdownBars({ items }: { items: BreakdownRow[] }) {
	if (!items.length) {
		return <p className="text-sm text-muted-foreground">No sales recorded yet.</p>;
	}
	const max = Math.max(...items.map((i) => i.revenue), 1);
	const total = items.reduce((s, i) => s + i.revenue, 0) || 1;

	return (
		<ul className="space-y-3">
			{items.map((i) => (
				<li key={i.name}>
					<div className="flex items-baseline justify-between gap-3 text-sm">
						<span className="truncate text-foreground">{i.name}</span>
						<span className="shrink-0 tabular-nums text-muted-foreground">
							{formatCurrency(i.revenue)} · {Math.round((i.revenue / total) * 100)}%
						</span>
					</div>
					<div className="mt-1 h-2 rounded-full bg-secondary">
						<div
							className="h-2 rounded-full bg-primary"
							style={{ width: `${Math.max((i.revenue / max) * 100, 2)}%` }}
						/>
					</div>
				</li>
			))}
		</ul>
	);
}
