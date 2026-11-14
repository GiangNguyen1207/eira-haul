import type { ReactNode } from "react";
import { SECTION } from "@/constant";
import { computeAllScenarios, type Forecast } from "@/lib/forecast";
import { formatCurrency, formatPct } from "@/lib/utils";
import HealthPill from "@/components/HealthPill";
import ScenarioCashChart from "@/components/ScenarioCashChart";

export default function ScenariosPage() {
	const [base, best, worst] = computeAllScenarios();
	const scenarios = [base, best, worst];

	const metrics: { label: string; render: (f: Forecast) => ReactNode }[] = [
		{ label: "Revenue (year)", render: (f) => formatCurrency(f.kpis.totalRevenue) },
		{ label: "Gross profit", render: (f) => formatCurrency(f.kpis.totalGrossProfit) },
		{ label: "Gross margin", render: (f) => formatPct(f.kpis.avgGrossMarginPct) },
		{ label: "Net profit / loss", render: (f) => formatCurrency(f.kpis.totalNetProfit) },
		{ label: "Closing cash (31 Dec)", render: (f) => formatCurrency(f.kpis.endingCash) },
		{ label: "Inventory value", render: (f) => formatCurrency(f.kpis.endingInventory) },
		{
			label: "Monthly burn",
			render: (f) =>
				f.kpis.cashBurnRateMonthly > 0
					? `${formatCurrency(f.kpis.cashBurnRateMonthly)}/mo`
					: "None",
		},
		{ label: "Break-even revenue", render: (f) => `${formatCurrency(f.kpis.breakEvenRevenueMonthly)}/mo` },
		{ label: "Break-even month", render: (f) => f.kpis.breakEvenMonthLabel ?? "Not in 2026" },
		{ label: "Additional capital", render: (f) => formatCurrency(f.kpis.additionalCapitalRequired) },
		{ label: "Verdict", render: (f) => <HealthPill status={f.kpis.health} /> },
	];

	const chartData = base.months.map((m, i) => ({
		label: m.label,
		base: Math.round(m.closingCash),
		best: Math.round(best.months[i].closingCash),
		worst: Math.round(worst.months[i].closingCash),
	}));

	return (
		<section className="space-y-6">
			<div>
				<h1 className="font-serif text-2xl font-semibold text-foreground">
					{SECTION.scenarios}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Three futures to 31 Dec 2026, side by side.
				</p>
			</div>

			<div className="overflow-x-auto rounded-xl border border-border bg-card">
				<table className="w-full min-w-[560px] text-sm">
					<thead>
						<tr className="border-b border-border bg-secondary/50 text-left">
							<th className="px-5 py-2 font-medium text-muted-foreground">Metric</th>
							{scenarios.map((f) => (
								<th key={f.kind} className="px-5 py-2 text-right font-semibold text-foreground">
									{f.name}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{metrics.map((metric) => (
							<tr key={metric.label} className="border-b border-border/50 last:border-0">
								<td className="px-5 py-2 text-muted-foreground whitespace-nowrap">{metric.label}</td>
								{scenarios.map((f) => (
									<td key={f.kind} className="px-5 py-2 text-right tabular-nums text-foreground">
										<span className="inline-flex justify-end">{metric.render(f)}</span>
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<div className="rounded-xl border border-border bg-card p-6">
				<h2 className="font-serif text-lg font-semibold text-foreground">
					Closing cash by scenario
				</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					If a line dips below zero, that month needs more capital.
				</p>
				<div className="mt-4">
					<ScenarioCashChart data={chartData} />
				</div>
			</div>
		</section>
	);
}
