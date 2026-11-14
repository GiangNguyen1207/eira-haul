import { SECTION, KPI } from "@/constant";
import { getActuals } from "@/lib/actuals";
import { formatCurrency, formatPct } from "@/lib/utils";
import KpiCard from "@/components/KpiCard";
import HealthPill from "@/components/HealthPill";
import PerformanceChart from "@/components/PerformanceChart";
import BreakdownBars from "@/components/BreakdownBars";

export default async function DashboardPage() {
	const a = await getActuals();

	const chartData = a.months.map((m) => ({
		label: m.label,
		actualRevenue: m.isActual ? Math.round(m.revenue) : null,
		forecastRevenue: m.isActual ? null : Math.round(m.revenue),
		netProfit: Math.round(m.netProfit),
	}));

	const endLabel = a.months[a.months.length - 1]?.label ?? "";
	const breakEvenGap = a.breakEvenMonthlyRevenue - a.avgMonthlyRevenue;

	return (
		<section className="space-y-8">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<h1 className="font-serif text-2xl font-semibold text-foreground">
						{SECTION.dashboard}
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Actuals · {a.periodLabel} · forecast to {endLabel}
					</p>
				</div>
				<HealthPill status={a.health} />
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<KpiCard label={`${KPI.revenue} (to date)`} value={formatCurrency(a.revenue)} hint={a.periodLabel} />
				<KpiCard
					label={KPI.grossProfit}
					value={formatCurrency(a.grossProfit)}
					hint={`${formatPct(a.grossMarginPct)} margin`}
					tone="positive"
				/>
				<KpiCard
					label={KPI.netProfit}
					value={formatCurrency(a.netProfit)}
					hint={`${formatPct(a.netMarginPct)} net margin`}
					tone={a.netProfit >= 0 ? "positive" : "negative"}
				/>
				<KpiCard
					label="Est. cash"
					value={formatCurrency(a.estCashOnHand)}
					hint="Start + capital + (sales − costs); excl. restocking"
					tone={a.estCashOnHand >= 0 ? "default" : "negative"}
				/>
				<KpiCard
					label={KPI.inventoryValue}
					value={formatCurrency(a.inventoryValueCost)}
					hint={`At cost · ${formatCurrency(a.inventoryValueRetail)} retail`}
					tone="warning"
				/>
				<KpiCard
					label="Orders"
					value={String(a.orders)}
					hint={`${a.units} units · ${formatCurrency(a.avgOrderValue)} avg order`}
				/>
				<KpiCard
					label={KPI.breakEven}
					value={Number.isFinite(a.breakEvenMonthlyRevenue) ? `${formatCurrency(a.breakEvenMonthlyRevenue)}/mo` : "—"}
					hint={`Averaging ${formatCurrency(a.avgMonthlyRevenue)}/mo`}
					tone={breakEvenGap > 0 ? "warning" : "positive"}
				/>
				<KpiCard
					label="Projected revenue"
					value={formatCurrency(a.projectedWindowRevenue)}
					hint={`Full window, incl. forecast`}
				/>
			</div>

			<div className="rounded-xl border border-border bg-card p-6">
				<h2 className="font-serif text-lg font-semibold text-foreground">Revenue & profit</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Solid bars are recorded sales; muted bars are the run-rate forecast for the
					remaining month(s). The line is monthly net profit/loss after operating costs.
				</p>
				<div className="mt-4">
					<PerformanceChart data={chartData} />
				</div>
				<p className="mt-4 text-xs text-muted-foreground">
					{formatCurrency(a.currentMonthRevenue)} booked so far this month. Forecast
					projects each remaining month at the {formatCurrency(a.avgMonthlyRevenue)}/mo
					average of completed months, carrying the actual {formatPct(a.grossMarginPct)} margin.
				</p>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<div className="rounded-xl border border-border bg-card p-6">
					<h2 className="font-serif text-lg font-semibold text-foreground">Revenue by platform</h2>
					<div className="mt-4">
						<BreakdownBars items={a.byPlatform} />
					</div>
				</div>
				<div className="rounded-xl border border-border bg-card p-6">
					<h2 className="font-serif text-lg font-semibold text-foreground">Revenue by category</h2>
					<div className="mt-4">
						<BreakdownBars items={a.byCategory} />
					</div>
				</div>
			</div>

			<div className="rounded-xl border border-border bg-card p-6">
				<h2 className="font-serif text-lg font-semibold text-foreground">Top products</h2>
				<div className="mt-4 overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border text-left text-muted-foreground">
								<th className="py-2 pr-3 font-medium">Product</th>
								<th className="py-2 px-3 text-right font-medium">Units</th>
								<th className="py-2 px-3 text-right font-medium">Revenue</th>
								<th className="py-2 pl-3 text-right font-medium">Gross profit</th>
							</tr>
						</thead>
						<tbody>
							{a.topProducts.map((p) => (
								<tr key={p.name} className="border-b border-border/50 last:border-0">
									<td className="py-2 pr-3 text-foreground">{p.name}</td>
									<td className="py-2 px-3 text-right tabular-nums text-muted-foreground">{p.units}</td>
									<td className="py-2 px-3 text-right tabular-nums text-foreground">{formatCurrency(p.revenue)}</td>
									<td className="py-2 pl-3 text-right tabular-nums text-emerald-700">{formatCurrency(p.grossProfit)}</td>
								</tr>
							))}
							{!a.topProducts.length && (
								<tr>
									<td colSpan={4} className="py-6 text-center text-muted-foreground">No sales recorded yet.</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}
