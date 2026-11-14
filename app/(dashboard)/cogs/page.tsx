import { SECTION } from "@/constant";
import { compute } from "@/lib/forecast";
import { getPlan } from "@/lib/plan";
import { getActuals } from "@/lib/actuals";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import StatementTable, { type StatementRow } from "@/components/StatementTable";
import KpiCard from "@/components/KpiCard";
import { formatCurrency, formatPct, formatPrice } from "@/lib/utils";

export default async function CogsPage() {
	const db = createSupabaseAdmin();
	const [{ assumptions, plan }, actuals, productsRes, saleItemsRes, stockMovesRes] = await Promise.all([
		getPlan(),
		getActuals(),
		db.from("products").select("id, cost_price, current_stock, categories(name)"),
		db.from("sale_items").select("product_id, qty"),
		db.from("stock_moves").select("product_id, qty, type").in("type", ["adjustment", "wastage"]),
	]);
	const f = compute(assumptions, plan);

	type ProdRow = {
		id: string;
		cost_price: number | string;
		current_stock: number;
		categories: { name: string } | null;
	};

	// Units sold per product (from sale_items)
	const unitsSold = new Map<string, number>();
	for (const item of saleItemsRes.data ?? []) {
		const { product_id, qty } = item as { product_id: string; qty: number };
		unitsSold.set(product_id, (unitsSold.get(product_id) ?? 0) + qty);
	}

	// Units given away per product: adjustments/wastage with negative qty
	const unitsGivenAway = new Map<string, number>();
	for (const move of stockMovesRes.data ?? []) {
		const { product_id, qty } = move as { product_id: string; qty: number; type: string };
		if (qty < 0) {
			unitsGivenAway.set(product_id, (unitsGivenAway.get(product_id) ?? 0) + Math.abs(qty));
		}
	}

	// Spend per category: sold + given away + in stock
	type CategorySpend = { name: string; cogsSold: number; givenAway: number; inStock: number; total: number };
	const categoryMap = new Map<string, CategorySpend>();
	for (const p of (productsRes.data ?? []) as unknown as ProdRow[]) {
		const cost = Number(p.cost_price);
		const cogsSold = (unitsSold.get(p.id) ?? 0) * cost;
		const givenAway = (unitsGivenAway.get(p.id) ?? 0) * cost;
		const inStock = p.current_stock * cost;
		const catName = p.categories?.name ?? "Uncategorized";
		if (!categoryMap.has(catName)) {
			categoryMap.set(catName, { name: catName, cogsSold: 0, givenAway: 0, inStock: 0, total: 0 });
		}
		const cat = categoryMap.get(catName)!;
		cat.cogsSold += cogsSold;
		cat.givenAway += givenAway;
		cat.inStock += inStock;
		cat.total += cogsSold + givenAway + inStock;
	}

	const categorySpend = [...categoryMap.values()].sort((a, b) => b.total - a.total);

	const actualMonths = actuals.months.filter((m) => m.isActual);
	const totalProductSpend = actuals.cogs + actuals.inventoryValueCost;

	const planRows: StatementRow[] = [
		{ label: "COGS (cost of goods sold)", get: (l) => l.cogs },
		{ label: "Purchases (cash paid for stock)", get: (l) => l.purchases },
		{ label: "Opening inventory", get: (l) => l.openingInventory, total: "none", divider: true },
		{ label: "Ending inventory", get: (l) => l.endingInventory, total: "none", strong: true },
		{ label: "Change in inventory", get: (l) => l.deltaInventory, kind: "signed" },
	];

	return (
		<section className="space-y-8">
			<div>
				<h1 className="font-serif text-2xl font-semibold text-foreground">
					{SECTION.cogs}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Cost of goods, purchasing, and the stock you hold. Rising inventory is
					cash leaving the bank before it becomes profit.
				</p>
			</div>

			{/* ── Actuals ── */}
			<div className="space-y-5">
				<h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Product costs · actuals
				</h2>

				<div className="grid gap-4 sm:grid-cols-3">
					<KpiCard
						label="COGS to date"
						value={formatCurrency(actuals.cogs)}
						hint="Cost of products already sold"
					/>
					<KpiCard
						label="In stock (at cost)"
						value={formatCurrency(actuals.inventoryValueCost)}
						hint={`${formatCurrency(actuals.inventoryValueRetail)} at retail`}
						tone="warning"
					/>
					<KpiCard
						label="Total product investment"
						value={formatCurrency(totalProductSpend)}
						hint="COGS sold + current inventory value"
					/>
				</div>

				{actuals.orders === 0 ? (
					<div className="rounded-xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
						No sales recorded yet. Product cost data will appear here once you log your first sale.
					</div>
				) : (
					<>
						{/* Monthly breakdown */}
						<div className="overflow-x-auto rounded-xl border border-border bg-card">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-border bg-secondary/50 text-left text-muted-foreground">
										<th className="px-5 py-3 font-medium">Month</th>
										<th className="px-5 py-3 text-right font-medium">Units sold</th>
										<th className="px-5 py-3 text-right font-medium">COGS</th>
										<th className="px-5 py-3 text-right font-medium">Gross profit</th>
										<th className="px-5 py-3 text-right font-medium">Margin</th>
									</tr>
								</thead>
								<tbody>
									{actualMonths.map((m) => (
										<tr key={m.month} className="border-b border-border/50 last:border-0">
											<td className="px-5 py-3 font-medium text-foreground">
												{m.label}
												{m.isPartial && (
													<span className="ml-1.5 text-xs font-normal text-muted-foreground">in progress</span>
												)}
											</td>
											<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{m.units}</td>
											<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{formatPrice(m.cogs)}</td>
											<td className="px-5 py-3 text-right tabular-nums text-foreground">{formatPrice(m.grossProfit)}</td>
											<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{formatPct(m.grossMarginPct)}</td>
										</tr>
									))}
									<tr className="border-t-2 border-border bg-secondary/40 font-semibold">
										<td className="px-5 py-3 text-foreground">Total</td>
										<td className="px-5 py-3 text-right tabular-nums">{actuals.units}</td>
										<td className="px-5 py-3 text-right tabular-nums">{formatPrice(actuals.cogs)}</td>
										<td className="px-5 py-3 text-right tabular-nums">{formatPrice(actuals.grossProfit)}</td>
										<td className="px-5 py-3 text-right tabular-nums">{formatPct(actuals.grossMarginPct)}</td>
									</tr>
								</tbody>
							</table>
						</div>

						{/* Spend by category */}
						{categorySpend.length > 0 && (
							<div className="space-y-2">
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Spend by category
								</p>
								<div className="overflow-x-auto rounded-xl border border-border bg-card">
									<table className="w-full text-sm">
										<thead>
											<tr className="border-b border-border bg-secondary/50 text-left text-muted-foreground">
												<th className="px-5 py-3 font-medium">Category</th>
												<th className="px-5 py-3 text-right font-medium">Sold at cost</th>
												<th className="px-5 py-3 text-right font-medium">Given away</th>
												<th className="px-5 py-3 text-right font-medium">In stock (at cost)</th>
												<th className="px-5 py-3 text-right font-medium">Total invested</th>
											</tr>
										</thead>
										<tbody>
											{categorySpend.map((cat) => (
												<tr key={cat.name} className="border-b border-border/50 last:border-0">
													<td className="px-5 py-3 font-medium text-foreground">{cat.name}</td>
													<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{formatPrice(cat.cogsSold)}</td>
													<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{formatPrice(cat.givenAway)}</td>
													<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">{formatPrice(cat.inStock)}</td>
													<td className="px-5 py-3 text-right tabular-nums font-semibold text-foreground">{formatPrice(cat.total)}</td>
												</tr>
											))}
											<tr className="border-t-2 border-border bg-secondary/40 font-semibold">
												<td className="px-5 py-3 text-foreground">Total</td>
												<td className="px-5 py-3 text-right tabular-nums">{formatPrice(categorySpend.reduce((s, c) => s + c.cogsSold, 0))}</td>
												<td className="px-5 py-3 text-right tabular-nums">{formatPrice(categorySpend.reduce((s, c) => s + c.givenAway, 0))}</td>
												<td className="px-5 py-3 text-right tabular-nums">{formatPrice(categorySpend.reduce((s, c) => s + c.inStock, 0))}</td>
												<td className="px-5 py-3 text-right tabular-nums">{formatPrice(categorySpend.reduce((s, c) => s + c.total, 0))}</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						)}
					</>
				)}
			</div>

			{/* ── Plan forecast ── */}
			<div className="space-y-4">
				<h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					Plan · forecast
				</h2>
				<StatementTable months={f.months} rows={planRows} />
			</div>
		</section>
	);
}
