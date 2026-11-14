import { SECTION } from "@/constant";
import { compute } from "@/lib/forecast";
import { getPlan } from "@/lib/plan";
import StatementTable, { type StatementRow } from "@/components/StatementTable";

export default async function CashFlowPage() {
	const { assumptions, plan } = await getPlan();
	const f = compute(assumptions, plan);

	const rows: StatementRow[] = [
		{ label: "Net profit (from P&L)", get: (l) => l.netProfit, strong: true },
		{ label: "Less: increase in inventory", get: (l) => -l.deltaInventory, kind: "signed" },
		{ label: "Operating cash flow", get: (l) => l.operatingCash, strong: true, divider: true },
		{ label: "Capital injected", get: (l) => l.capital, kind: "signed" },
		{ label: "Net cash flow", get: (l) => l.netCashFlow, kind: "signed", strong: true, divider: true },
		{ label: "Opening cash", get: (l) => l.openingCash, total: "none", divider: true },
		{ label: "Closing cash balance", get: (l) => l.closingCash, total: "none", strong: true },
	];

	return (
		<section className="space-y-5">
			<div>
				<h1 className="font-serif text-2xl font-semibold text-foreground">
					{SECTION.cashFlow}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					How profit turns into cash. The gap between{" "}
					<em>net profit</em> and <em>operating cash flow</em> is money locked up
					in inventory.
				</p>
			</div>
			<StatementTable months={f.months} rows={rows} />
		</section>
	);
}
