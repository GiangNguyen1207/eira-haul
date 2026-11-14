import { SECTION, KPI } from "@/constant";
import { compute } from "@/lib/forecast";
import { getPlan } from "@/lib/plan";
import { formatCurrency, formatMonth } from "@/lib/utils";
import KpiCard from "@/components/KpiCard";

export default async function CapitalPage() {
	const { assumptions, plan } = await getPlan();
	const f = compute(assumptions, plan);

	const injected = assumptions.capitalInjections.reduce((s, c) => s + c.amount, 0);
	const totalCapitalIn = assumptions.startingCash + injected;

	const peakInventory = Math.max(...f.months.map((m) => m.endingInventory));
	const lowest = [...f.months].sort((x, y) => x.closingCash - y.closingCash)[0];

	return (
		<section className="space-y-6">
			<div>
				<h1 className="font-serif text-2xl font-semibold text-foreground">
					{SECTION.capital}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Where your money comes from, and how much of it gets tied up before it
					comes back as cash.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<KpiCard label="Starting cash" value={formatCurrency(assumptions.startingCash)} />
				<KpiCard label="Capital injected" value={formatCurrency(injected)} />
				<KpiCard label="Total capital in" value={formatCurrency(totalCapitalIn)} tone="positive" />
				<KpiCard
					label={KPI.additionalCapital}
					value={formatCurrency(f.kpis.additionalCapitalRequired)}
					tone={f.kpis.additionalCapitalRequired > 0 ? "negative" : "positive"}
				/>
			</div>

			<div className="rounded-xl border border-border bg-card">
				<div className="border-b border-border px-5 py-3">
					<h2 className="font-medium text-foreground">Funding sources</h2>
				</div>
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-border/60 text-left text-muted-foreground">
							<th className="px-5 py-2 font-medium">Source</th>
							<th className="px-5 py-2 font-medium">When</th>
							<th className="px-5 py-2 text-right font-medium">Amount</th>
						</tr>
					</thead>
					<tbody>
						<tr className="border-b border-border/40">
							<td className="px-5 py-2 text-foreground">Opening cash on hand</td>
							<td className="px-5 py-2 text-muted-foreground">Start of plan</td>
							<td className="px-5 py-2 text-right tabular-nums">{formatCurrency(assumptions.startingCash)}</td>
						</tr>
						{assumptions.capitalInjections.map((c) => (
							<tr key={`${c.source}-${c.month}`} className="border-b border-border/40 last:border-0">
								<td className="px-5 py-2 text-foreground">{c.source}</td>
								<td className="px-5 py-2 text-muted-foreground">{formatMonth(c.month)}</td>
								<td className="px-5 py-2 text-right tabular-nums">{formatCurrency(c.amount)}</td>
							</tr>
						))}
						<tr className="font-semibold">
							<td className="px-5 py-2 text-foreground" colSpan={2}>Total</td>
							<td className="px-5 py-2 text-right tabular-nums text-foreground">{formatCurrency(totalCapitalIn)}</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
				<h2 className="font-medium text-foreground">How your capital is working</h2>
				<p className="mt-2">
					Peak inventory holds <strong className="text-foreground">{formatCurrency(peakInventory)}</strong> of
					your capital as stock. Your cash dips lowest in{" "}
					<strong className="text-foreground">{lowest?.label}</strong> at{" "}
					<strong className="text-foreground">{formatCurrency(lowest?.closingCash ?? 0)}</strong>
					{f.kpis.additionalCapitalRequired > 0
						? `, which is why you'd need ${formatCurrency(f.kpis.additionalCapitalRequired)} more to stay above zero.`
						: ", and stays above zero throughout — the plan is self-funding."}
				</p>
			</div>
		</section>
	);
}
