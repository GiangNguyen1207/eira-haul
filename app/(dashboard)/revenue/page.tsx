import { SECTION } from "@/constant";
import { compute, type MonthLine } from "@/lib/forecast";
import { getPlan } from "@/lib/plan";
import StatementTable, { type StatementRow } from "@/components/StatementTable";

export default async function RevenuePage() {
	const { assumptions, plan } = await getPlan();
	const f = compute(assumptions, plan);

	const groupNames = f.revenueByGroup[0]?.groups.map((g) => g.name) ?? [];
	const groupMaps = groupNames.map((name) => {
		const byMonth = new Map<string, number>();
		for (const r of f.revenueByGroup) {
			byMonth.set(r.month, r.groups.find((g) => g.name === name)?.amount ?? 0);
		}
		return { name, byMonth };
	});

	const rows: StatementRow[] = [
		...groupMaps.map(({ name, byMonth }) => ({
			label: name,
			get: (l: MonthLine) => byMonth.get(l.month) ?? 0,
		})),
		{ label: "Total revenue", get: (l) => l.revenue, strong: true, divider: true },
		{ label: "Gross margin %", get: (l) => l.grossMarginPct, kind: "pct" },
	];

	return (
		<section className="space-y-5">
			<div>
				<h1 className="font-serif text-2xl font-semibold text-foreground">
					{SECTION.revenue}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Monthly revenue by product group, with the blended gross margin.
				</p>
			</div>
			<StatementTable months={f.months} rows={rows} />
		</section>
	);
}
