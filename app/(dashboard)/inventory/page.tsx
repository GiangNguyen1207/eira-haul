import Link from "next/link";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { formatDateTime, formatPrice } from "@/lib/utils";
import { twMerge } from "tailwind-merge";

type StockStatus = "out" | "low" | "ok";

function stockStatus(current: number, threshold: number): StockStatus {
	if (current === 0) return "out";
	if (threshold > 0 && current <= threshold) return "low";
	return "ok";
}

const STATUS_STYLES: Record<StockStatus, string> = {
	out: "bg-red-100 text-red-700",
	low: "bg-amber-100 text-amber-700",
	ok: "bg-green-100 text-green-700",
};

const STATUS_LABEL: Record<StockStatus, string> = {
	out: "Out",
	low: "Low",
	ok: "OK",
};

const MOVE_TYPE_LABEL: Record<string, string> = {
	purchase: "Purchase",
	sale: "Sale",
	adjustment: "Adjustment",
	wastage: "Wastage",
};

export default async function InventoryPage() {
	const db = createSupabaseAdmin();

	const [{ data: products }, { data: moves }] = await Promise.all([
		db
			.from("products")
			.select("id, name, current_stock, reorder_threshold, categories(name)")
			.eq("active", true)
			.order("name"),
		db
			.from("stock_moves")
			.select("*, products(name)")
			.order("occurred_at", { ascending: false })
			.limit(30),
	]);

	// Group active products by collection (category), like the Products page.
	type ProductRow = NonNullable<typeof products>[number];
	const groups = new Map<string, ProductRow[]>();
	for (const p of products ?? []) {
		const cat = (p.categories as unknown as { name: string } | null)?.name ?? "Uncategorized";
		const arr = groups.get(cat) ?? [];
		arr.push(p);
		groups.set(cat, arr);
	}
	const sortedGroups = [...groups.entries()].sort(([a], [b]) => {
		if (a === "Uncategorized") return 1;
		if (b === "Uncategorized") return -1;
		return a.localeCompare(b);
	});

	return (
		<section className="space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-serif text-2xl font-semibold text-foreground">Inventory</h1>
					<p className="mt-1 text-sm text-muted-foreground">Current stock levels and movement history.</p>
				</div>
				<div className="flex gap-2">
					<Link
						href="/inventory/adjust"
						className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary"
					>
						Adjust stock
					</Link>
					<Link
						href="/inventory/receive"
						className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90"
					>
						Receive stock
					</Link>
				</div>
			</div>

			{/* Stock levels, grouped by collection */}
			<div className="overflow-x-auto rounded-xl border border-border bg-card">
				<table className="w-full text-sm">
					<thead>
						<tr className="border-b border-border bg-secondary/50 text-left text-muted-foreground">
							<th className="px-5 py-3 font-medium">Product</th>
							<th className="px-5 py-3 text-right font-medium">In stock</th>
							<th className="px-5 py-3 text-right font-medium">Reorder at</th>
							<th className="px-5 py-3 font-medium">Status</th>
						</tr>
					</thead>
					{sortedGroups.map(([category, rows]) => {
						const totalStock = rows.reduce((sum, p) => sum + p.current_stock, 0);
						return (
							<tbody key={category}>
								<tr className="border-b border-border bg-secondary/40">
									<td colSpan={4} className="px-5 py-2.5">
										<div className="flex items-center justify-between gap-3">
											<span className="font-semibold text-foreground">{category}</span>
											<span className="text-xs tabular-nums text-muted-foreground">
												{rows.length} {rows.length === 1 ? "product" : "products"} · {totalStock} in stock
											</span>
										</div>
									</td>
								</tr>
								{rows.map((p) => {
									const status = stockStatus(p.current_stock, p.reorder_threshold);
									return (
										<tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
											<td className="px-5 py-3 font-medium text-foreground">
												<Link href={`/products/${p.id}`} className="hover:text-primary">
													{p.name}
												</Link>
											</td>
											<td className="px-5 py-3 text-right tabular-nums font-medium text-foreground">
												{p.current_stock}
											</td>
											<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
												{p.reorder_threshold || "—"}
											</td>
											<td className="px-5 py-3">
												<span className={twMerge("rounded-full px-2 py-0.5 text-xs font-medium", STATUS_STYLES[status])}>
													{STATUS_LABEL[status]}
												</span>
											</td>
										</tr>
									);
								})}
							</tbody>
						);
					})}
				</table>
			</div>

			{/* Recent stock moves */}
			<div>
				<h2 className="mb-3 font-medium text-foreground">Recent movements</h2>
				<div className="overflow-x-auto rounded-xl border border-border bg-card">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-secondary/50 text-left text-muted-foreground">
								<th className="px-5 py-3 font-medium">Date</th>
								<th className="px-5 py-3 font-medium">Product</th>
								<th className="px-5 py-3 font-medium">Type</th>
								<th className="px-5 py-3 text-right font-medium">Qty</th>
								<th className="px-5 py-3 text-right font-medium">Unit cost</th>
								<th className="px-5 py-3 font-medium">Note</th>
							</tr>
						</thead>
						<tbody>
							{!moves?.length ? (
								<tr>
									<td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
										No stock movements yet.
									</td>
								</tr>
							) : moves.map((m) => (
								<tr key={m.id} className="border-b border-border/50 last:border-0">
									<td className="px-5 py-3 text-muted-foreground whitespace-nowrap">
										{formatDateTime(m.occurred_at)}
									</td>
									<td className="px-5 py-3 text-foreground">
										{(m.products as unknown as { name: string } | null)?.name ?? "—"}
									</td>
									<td className="px-5 py-3 text-muted-foreground">
										{MOVE_TYPE_LABEL[m.type] ?? m.type}
									</td>
									<td className={twMerge(
										"px-5 py-3 text-right tabular-nums font-medium",
										m.qty > 0 ? "text-green-600" : "text-red-600",
									)}>
										{m.qty > 0 ? `+${m.qty}` : m.qty}
									</td>
									<td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
										{m.unit_cost ? formatPrice(Number(m.unit_cost)) : "—"}
									</td>
									<td className="px-5 py-3 text-muted-foreground">{m.note ?? "—"}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	);
}
